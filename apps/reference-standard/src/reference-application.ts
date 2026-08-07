// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  applyFormOperation,
  commitScopeToBaseline,
  compileFormDefinition,
  createControlledFormRuntime,
  deriveSchemaDefaultCandidate,
  type CompileFormDefinitionInput,
  type CompileFormResult,
  type Diagnostic,
  type FormDefinition,
  type FormOperation,
  type FormRuntime,
  type FormRuntimeSnapshot,
  type RuntimeActionResult,
  type SchemaValidator,
  type ValidationVisibility,
} from '@rabassoft/schema-engine';
import { createAjvSchemaValidator } from '@rabassoft/schema-engine-validator-ajv';
import {
  referenceScenarios,
  type ReferenceScenario,
  type ReferenceScopeConfirmationTarget,
} from '@schema-engine-internal/reference-scenarios';

import {
  configurationsEqual,
  emptyDraftResult,
  evaluateDraft,
  prepareConfiguration,
  type AppliedConfiguration,
  type ConfigurationDraftResult,
} from './configuration.js';
import {
  StandardReferenceAsyncValidator,
  type StandardServiceRequestEvidence,
} from './reference-async-validator.js';

export type OperationDecisionMode = 'confirm' | 'reject' | 'pending';

export type OperationHistoryDecision =
  'confirmed' | 'rejected' | 'pending' | 'stale' | 'incompatible' | 'failed';

export interface OperationHistoryEntry {
  readonly sequence: number;
  readonly operation: FormOperation;
  readonly decision: OperationHistoryDecision;
  readonly diagnostics: readonly Diagnostic[];
}

export type StandardScopeCandidateState =
  | {
      readonly status: 'available';
      readonly targetId: string;
      readonly label: string;
      readonly value: Readonly<object>;
      readonly changed: boolean;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly status: 'unconfirmable';
      readonly targetId: string;
      readonly label: string;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly status: 'accepted';
      readonly targetId: string;
      readonly label: string;
      readonly value: Readonly<object>;
      readonly changed: boolean;
      readonly diagnostics: readonly Diagnostic[];
    };

export type StandardDefaultCandidateState =
  | {
      readonly status: 'available';
      readonly value: Readonly<object>;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly status: 'accepted' | 'cancelled' | 'no-effect' | 'failed';
      readonly diagnostics: readonly Diagnostic[];
    };

export interface StandardReferenceApplicationState {
  readonly scenario: ReferenceScenario;
  readonly definition?: FormDefinition;
  readonly value: Readonly<object>;
  readonly baselineValue: Readonly<object>;
  readonly locale: string;
  readonly validationVisibility: ValidationVisibility;
  readonly decisionMode: OperationDecisionMode;
  readonly collectionDraftId: string;
  readonly collectionDraftName: string;
  readonly compilationDiagnostics: readonly Diagnostic[];
  readonly runtimeDiagnostics: readonly Diagnostic[];
  readonly actionDiagnostics: readonly Diagnostic[];
  readonly snapshot?: FormRuntimeSnapshot<object>;
  readonly pendingOperations: readonly OperationHistoryEntry[];
  readonly history: readonly OperationHistoryEntry[];
  readonly originalCompileInput: CompileFormDefinitionInput;
  readonly activeCompileInput: CompileFormDefinitionInput;
  readonly schemaDraft: string;
  readonly uiSchemaDraft: string;
  readonly draftResult: ConfigurationDraftResult;
  readonly draftModified: boolean;
  readonly activeConfigurationDiffersFromOriginal: boolean;
  readonly canRestoreOriginalConfiguration: boolean;
  readonly runtimeEpoch: number;
  readonly pendingConfigurationAction?: PendingConfigurationAction;
  readonly serviceRequestEvidence: readonly StandardServiceRequestEvidence[];
  readonly scopeCandidate?: StandardScopeCandidateState;
  readonly defaultCandidate?: StandardDefaultCandidateState;
}

export type PendingConfigurationAction = 'apply' | 'restore';

type StateListener = (state: StandardReferenceApplicationState) => void;
type Cleanup = () => void;

const EMPTY_DIAGNOSTICS: readonly Diagnostic[] = Object.freeze([]);
const EMPTY_HISTORY: readonly OperationHistoryEntry[] = Object.freeze([]);

/**
 * Private composition root for the Standard reference target.
 *
 * The application owns the complete controlled roots. The Public runtime only
 * observes those roots and emits strict operations for the application to
 * decide.
 */
export class StandardReferenceApplication {
  private readonly scenarios: readonly ReferenceScenario[];
  private scenario: ReferenceScenario;
  private originalConfiguration: AppliedConfiguration;
  private activeConfiguration: AppliedConfiguration;
  private schemaDraft: string;
  private uiSchemaDraft: string;
  private draftResult = emptyDraftResult();
  private runtimeEpoch = 0;
  private pendingConfigurationAction: PendingConfigurationAction | undefined;
  private definition: FormDefinition | undefined;
  private value: Readonly<object>;
  private baselineValue: Readonly<object>;
  private locale: string;
  private validationVisibility: ValidationVisibility;
  private decisionMode: OperationDecisionMode = 'confirm';
  private collectionDraftId = 'new-member';
  private collectionDraftName = 'New member';
  private compilationDiagnostics = EMPTY_DIAGNOSTICS;
  private runtimeDiagnostics = EMPTY_DIAGNOSTICS;
  private actionDiagnostics = EMPTY_DIAGNOSTICS;
  private snapshot: FormRuntimeSnapshot<object> | undefined;
  private history = EMPTY_HISTORY;
  private nextHistorySequence = 1;
  private runtime: FormRuntime<object> | undefined;
  private asyncValidator: StandardReferenceAsyncValidator | undefined;
  private scopeCandidate: StandardScopeCandidateState | undefined;
  private defaultCandidate: StandardDefaultCandidateState | undefined;
  private unsubscribeSnapshot: Cleanup | undefined;
  private unsubscribeOperations: Cleanup | undefined;
  private unsubscribeWizardIntentions: Cleanup | undefined;
  private readonly bindingCleanups = new Set<Cleanup>();
  private readonly stateListeners = new Set<StateListener>();
  private suppressSnapshotNotification = false;
  private disposed = false;

  constructor(
    scenarios: readonly ReferenceScenario[] = referenceScenarios,
    initialScenarioId?: string,
    private readonly validator: SchemaValidator = createAjvSchemaValidator(),
  ) {
    const initial =
      scenarios.find(({ id }) => id === initialScenarioId) ?? scenarios[0];
    if (initial === undefined) {
      throw new Error('At least one reference scenario is required.');
    }

    this.scenarios = scenarios;
    this.scenario = initial;
    this.originalConfiguration = prepareConfiguration(initial.compileInput);
    this.activeConfiguration = prepareConfiguration(
      this.originalConfiguration.input,
    );
    this.schemaDraft = this.activeConfiguration.schemaText;
    this.uiSchemaDraft = this.activeConfiguration.uiSchemaText;
    this.value = ownRoot(initial.initialState.value);
    this.baselineValue = ownRoot(initial.initialState.baselineValue);
    this.locale = initial.initialState.locale;
    this.validationVisibility = initial.initialState.validationVisibility;
    this.loadScenario(initial);
  }

  getState(): StandardReferenceApplicationState {
    const pendingOperations = Object.freeze(
      this.history.filter(({ decision }) => decision === 'pending'),
    );
    return Object.freeze({
      scenario: this.scenario,
      ...(this.definition === undefined ? {} : { definition: this.definition }),
      value: this.value,
      baselineValue: this.baselineValue,
      locale: this.locale,
      validationVisibility: this.validationVisibility,
      decisionMode: this.decisionMode,
      collectionDraftId: this.collectionDraftId,
      collectionDraftName: this.collectionDraftName,
      compilationDiagnostics: this.compilationDiagnostics,
      runtimeDiagnostics: this.runtimeDiagnostics,
      actionDiagnostics: this.actionDiagnostics,
      ...(this.snapshot === undefined ? {} : { snapshot: this.snapshot }),
      pendingOperations,
      history: this.history,
      originalCompileInput: this.originalConfiguration.input,
      activeCompileInput: this.activeConfiguration.input,
      schemaDraft: this.schemaDraft,
      uiSchemaDraft: this.uiSchemaDraft,
      draftResult: this.draftResult,
      draftModified: this.isDraftModified(),
      activeConfigurationDiffersFromOriginal: !configurationsEqual(
        this.activeConfiguration,
        this.originalConfiguration,
      ),
      canRestoreOriginalConfiguration: this.canRestoreOriginalConfiguration(),
      runtimeEpoch: this.runtimeEpoch,
      ...(this.pendingConfigurationAction === undefined
        ? {}
        : { pendingConfigurationAction: this.pendingConfigurationAction }),
      serviceRequestEvidence:
        this.asyncValidator?.getEvidence() ?? Object.freeze([]),
      ...(this.scopeCandidate === undefined
        ? {}
        : { scopeCandidate: this.scopeCandidate }),
      ...(this.defaultCandidate === undefined
        ? {}
        : { defaultCandidate: this.defaultCandidate }),
    });
  }

  getRuntime(): FormRuntime<object> | undefined {
    return this.runtime;
  }

  subscribeState(listener: StateListener): Cleanup {
    if (this.disposed) return () => undefined;
    this.stateListeners.add(listener);
    listener(this.getState());
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      this.stateListeners.delete(listener);
    };
  }

  registerBindingCleanup(cleanup: Cleanup): Cleanup {
    if (this.disposed) {
      cleanup();
      return () => undefined;
    }
    let registered = true;
    const idempotentCleanup = (): void => {
      if (!registered) return;
      registered = false;
      this.bindingCleanups.delete(idempotentCleanup);
      cleanup();
    };
    this.bindingCleanups.add(idempotentCleanup);
    return idempotentCleanup;
  }

  selectScenario(scenarioId: string): boolean {
    if (this.disposed) return false;
    const scenario = this.scenarios.find(({ id }) => id === scenarioId);
    if (scenario === undefined) return false;
    this.loadScenario(scenario);
    return true;
  }

  resetScenario(): void {
    if (this.disposed) return;
    const value = ownRoot(this.scenario.initialState.value);
    const baselineValue = ownRoot(this.scenario.initialState.baselineValue);
    const locale = this.scenario.initialState.locale;
    const visibility = this.scenario.initialState.validationVisibility;
    const runtime = this.runtime;
    this.decisionMode = 'confirm';
    this.resetCollectionDrafts();
    this.history = EMPTY_HISTORY;
    this.nextHistorySequence = 1;
    this.runtimeDiagnostics = EMPTY_DIAGNOSTICS;
    this.actionDiagnostics = EMPTY_DIAGNOSTICS;
    this.scopeCandidate = undefined;
    this.defaultCandidate = undefined;
    this.pendingConfigurationAction = undefined;
    if (runtime === undefined) {
      this.value = value;
      this.baselineValue = baselineValue;
      this.locale = locale;
      this.validationVisibility = visibility;
      this.emitState();
      return;
    }
    const update = this.withSuppressedSnapshots(() =>
      runtime.updateExternalState({ value, baselineValue, locale }),
    );
    const visibilityUpdate = this.withSuppressedSnapshots(() =>
      runtime.setValidationVisibility(visibility),
    );
    this.actionDiagnostics = freezeDiagnostics([
      ...update.diagnostics,
      ...visibilityUpdate.diagnostics,
    ]);
    if (update.success && visibilityUpdate.success) {
      this.value = value;
      this.baselineValue = baselineValue;
      this.locale = locale;
      this.validationVisibility = visibility;
    }
    this.emitState();
  }

  setDecisionMode(mode: OperationDecisionMode): void {
    if (this.disposed || this.decisionMode === mode) return;
    this.decisionMode = mode;
    this.actionDiagnostics = EMPTY_DIAGNOSTICS;
    this.emitState();
  }

  resolveServiceValidation(valid: boolean): boolean {
    if (this.disposed) return false;
    return this.asyncValidator?.resolveCurrent(valid) ?? false;
  }

  resolveServiceRequest(id: number, valid: boolean): boolean {
    if (this.disposed) return false;
    return this.asyncValidator?.resolveRequest(id, valid) ?? false;
  }

  rejectServiceValidation(): boolean {
    if (this.disposed) return false;
    return this.asyncValidator?.rejectCurrent() ?? false;
  }

  throwOnNextValidation(): boolean {
    if (this.disposed || this.asyncValidator === undefined) return false;
    this.asyncValidator.throwOnNextRequest();
    this.emitState();
    return true;
  }

  retryAsyncValidation(): RuntimeActionResult | undefined {
    const runtime = this.runtime;
    if (this.disposed || runtime === undefined) return undefined;
    const result = runtime.retryAsyncValidation();
    this.actionDiagnostics = freezeDiagnostics(result.diagnostics);
    this.emitState();
    return result;
  }

  prepareScopeCandidate(target: ReferenceScopeConfirmationTarget): boolean {
    const definition = this.definition;
    if (this.disposed || definition === undefined) return false;
    const result = commitScopeToBaseline(
      definition,
      this.baselineValue,
      this.value,
      target.scope,
    );
    this.scopeCandidate = result.success
      ? Object.freeze({
          status: 'available',
          targetId: target.id,
          label: target.label,
          value: result.value,
          changed: result.changed,
          diagnostics: result.diagnostics,
        })
      : Object.freeze({
          status: 'unconfirmable',
          targetId: target.id,
          label: target.label,
          diagnostics: freezeDiagnostics(result.diagnostics),
        });
    this.emitState();
    return result.success;
  }

  acceptScopeCandidate(): RuntimeActionResult | undefined {
    const candidate = this.scopeCandidate;
    if (candidate?.status !== 'available') return undefined;
    const result = this.updateControlledState({
      baselineValue: candidate.value,
    });
    if (result?.success) {
      this.scopeCandidate = Object.freeze({
        status: 'accepted',
        targetId: candidate.targetId,
        label: candidate.label,
        value: candidate.value,
        changed: candidate.changed,
        diagnostics: candidate.diagnostics,
      });
      this.emitState();
    }
    return result;
  }

  deriveDefaultCandidate(): boolean {
    if (this.disposed) return false;
    const result = deriveSchemaDefaultCandidate(
      this.activeConfiguration.input.schema,
      this.value,
    );
    this.defaultCandidate = result.success
      ? result.changed
        ? Object.freeze({
            status: 'available',
            value: result.value,
            diagnostics: result.diagnostics,
          })
        : Object.freeze({
            status: 'no-effect',
            diagnostics: result.diagnostics,
          })
      : Object.freeze({
          status: 'failed',
          diagnostics: freezeDiagnostics(result.diagnostics),
        });
    this.emitState();
    return result.success;
  }

  cancelDefaultCandidate(): boolean {
    const candidate = this.defaultCandidate;
    if (this.disposed || candidate?.status !== 'available') return false;
    this.defaultCandidate = Object.freeze({
      status: 'cancelled',
      diagnostics: candidate.diagnostics,
    });
    this.emitState();
    return true;
  }

  acceptDefaultCandidate(): RuntimeActionResult | undefined {
    const candidate = this.defaultCandidate;
    if (this.disposed || candidate?.status !== 'available') return undefined;
    const result = this.updateControlledState({ value: candidate.value });
    if (result?.success) {
      this.defaultCandidate = Object.freeze({
        status: 'accepted',
        diagnostics: candidate.diagnostics,
      });
      this.emitState();
    }
    return result;
  }

  updateCollectionDraftId(value: string): void {
    if (this.disposed || this.collectionDraftId === value) return;
    this.collectionDraftId = value;
    this.emitState();
  }

  updateCollectionDraftName(value: string): void {
    if (this.disposed || this.collectionDraftName === value) return;
    this.collectionDraftName = value;
    this.emitState();
  }

  insertTeamMember(): boolean {
    const runtime = this.runtime;
    const id = this.collectionDraftId.trim();
    const name = this.collectionDraftName.trim();
    if (
      this.disposed ||
      this.scenario.id !== 'stable-team' ||
      runtime === undefined ||
      id.length === 0 ||
      name.length === 0
    ) {
      return false;
    }
    return runtime.requestInsertItem(
      ['team'],
      id,
      { id, name, role: 'Member' },
      { kind: 'end' },
    ).success;
  }

  moveFirstTeamMemberLater(): boolean {
    const runtime = this.runtime;
    const [first, second] = readTeamMembers(this.value);
    if (
      this.disposed ||
      this.scenario.id !== 'stable-team' ||
      runtime === undefined ||
      first === undefined ||
      second === undefined
    ) {
      return false;
    }
    return runtime.requestMoveItem(
      { collectionPath: ['team'], itemId: first.id },
      { kind: 'after', itemId: second.id },
    ).success;
  }

  removeLastTeamMember(): boolean {
    const runtime = this.runtime;
    const last = readTeamMembers(this.value).at(-1);
    if (
      this.disposed ||
      this.scenario.id !== 'stable-team' ||
      runtime === undefined ||
      last === undefined
    ) {
      return false;
    }
    return runtime.requestRemoveItem({
      collectionPath: ['team'],
      itemId: last.id,
    }).success;
  }

  replaceValue(value: Readonly<object>): RuntimeActionResult | undefined {
    return this.updateControlledState({ value: ownRoot(value) });
  }

  commitBaseline(): RuntimeActionResult | undefined {
    return this.updateControlledState({ baselineValue: ownRoot(this.value) });
  }

  setLocale(locale: string): RuntimeActionResult | undefined {
    return this.updateControlledState({ locale });
  }

  setValidationVisibility(
    visibility: ValidationVisibility,
  ): RuntimeActionResult | undefined {
    const runtime = this.runtime;
    if (this.disposed || runtime === undefined) return undefined;
    const result = this.withSuppressedSnapshots(() =>
      runtime.setValidationVisibility(visibility),
    );
    this.actionDiagnostics = freezeDiagnostics(result.diagnostics);
    if (result.success) this.validationVisibility = visibility;
    this.emitState();
    return result;
  }

  updateSchemaDraft(value: string): void {
    if (this.disposed || value === this.schemaDraft) return;
    this.schemaDraft = value;
    this.invalidateDraftResult();
    this.emitState();
  }

  updateUiSchemaDraft(value: string): void {
    if (this.disposed || value === this.uiSchemaDraft) return;
    this.uiSchemaDraft = value;
    this.invalidateDraftResult();
    this.emitState();
  }

  validateConfiguration(): boolean {
    if (this.disposed) return false;
    const evaluation = evaluateDraft(
      this.schemaDraft,
      this.uiSchemaDraft,
      this.activeConfiguration.input,
    );
    this.draftResult = evaluation.result;
    this.emitState();
    return evaluation.success;
  }

  applyConfiguration(): boolean {
    if (this.disposed) return false;
    const evaluation = evaluateDraft(
      this.schemaDraft,
      this.uiSchemaDraft,
      this.activeConfiguration.input,
    );
    this.draftResult = evaluation.result;
    if (!evaluation.success) {
      this.pendingConfigurationAction = undefined;
      this.emitState();
      return false;
    }
    if (this.requiresApplicationResetConfirmation()) {
      this.pendingConfigurationAction = 'apply';
      this.emitState();
      return false;
    }
    this.installConfiguration(evaluation.configuration, evaluation.compilation);
    return true;
  }

  cancelConfigurationChanges(): void {
    if (this.disposed) return;
    this.schemaDraft = this.activeConfiguration.schemaText;
    this.uiSchemaDraft = this.activeConfiguration.uiSchemaText;
    this.draftResult = emptyDraftResult();
    this.pendingConfigurationAction = undefined;
    this.emitState();
  }

  restoreScenarioConfiguration(): boolean {
    if (this.disposed || !this.canRestoreOriginalConfiguration()) return false;
    this.pendingConfigurationAction = 'restore';
    this.emitState();
    return false;
  }

  confirmConfigurationAction(): boolean {
    if (this.disposed) return false;
    const action = this.pendingConfigurationAction;
    if (action === undefined) return false;
    if (action === 'apply') {
      const evaluation = evaluateDraft(
        this.schemaDraft,
        this.uiSchemaDraft,
        this.activeConfiguration.input,
      );
      this.draftResult = evaluation.result;
      if (!evaluation.success) {
        this.pendingConfigurationAction = undefined;
        this.emitState();
        return false;
      }
      this.installConfiguration(
        evaluation.configuration,
        evaluation.compilation,
      );
      return true;
    }

    const restored = prepareConfiguration(this.originalConfiguration.input);
    const compilation = compileFormDefinition(restored.input);
    if (!compilation.success) {
      this.draftResult = Object.freeze({
        status: 'compile-failed',
        syntaxIssues: Object.freeze([]),
        diagnostics: compilation.diagnostics,
      });
      this.pendingConfigurationAction = undefined;
      this.emitState();
      return false;
    }
    this.installConfiguration(restored, compilation);
    return true;
  }

  cancelConfigurationAction(): void {
    if (this.disposed || this.pendingConfigurationAction === undefined) return;
    this.pendingConfigurationAction = undefined;
    this.emitState();
  }

  confirmPending(sequence: number): boolean {
    return this.resolvePending(sequence, true);
  }

  rejectPending(sequence: number): boolean {
    return this.resolvePending(sequence, false);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.cleanupRuntimeAndBindings();
    this.stateListeners.clear();
  }

  private loadScenario(scenario: ReferenceScenario): void {
    const original = prepareConfiguration(scenario.compileInput);
    const active = prepareConfiguration(original.input);
    this.originalConfiguration = original;
    this.activeConfiguration = active;
    this.schemaDraft = active.schemaText;
    this.uiSchemaDraft = active.uiSchemaText;
    this.draftResult = emptyDraftResult();
    this.pendingConfigurationAction = undefined;
    // reference-snippet:start standard-compile-definition
    const compilation = compileFormDefinition(active.input);
    // reference-snippet:end standard-compile-definition
    this.recreateRuntime(scenario, active, compilation);
  }

  private installConfiguration(
    configuration: AppliedConfiguration,
    compilation: Extract<CompileFormResult, { success: true }>,
  ): void {
    this.activeConfiguration = configuration;
    this.schemaDraft = configuration.schemaText;
    this.uiSchemaDraft = configuration.uiSchemaText;
    this.draftResult = Object.freeze({
      status: 'valid',
      syntaxIssues: Object.freeze([]),
      diagnostics: compilation.diagnostics,
    });
    this.pendingConfigurationAction = undefined;
    this.recreateRuntime(this.scenario, configuration, compilation);
  }

  private recreateRuntime(
    scenario: ReferenceScenario,
    configuration: AppliedConfiguration,
    compilation: CompileFormResult,
  ): void {
    this.cleanupRuntimeAndBindings();
    this.scenario = scenario;
    this.definition = undefined;
    this.value = ownRoot(scenario.initialState.value);
    this.baselineValue = ownRoot(scenario.initialState.baselineValue);
    this.locale = scenario.initialState.locale;
    this.validationVisibility = scenario.initialState.validationVisibility;
    this.decisionMode = 'confirm';
    this.compilationDiagnostics = EMPTY_DIAGNOSTICS;
    this.runtimeDiagnostics = EMPTY_DIAGNOSTICS;
    this.actionDiagnostics = EMPTY_DIAGNOSTICS;
    this.snapshot = undefined;
    this.history = EMPTY_HISTORY;
    this.scopeCandidate = undefined;
    this.defaultCandidate = undefined;
    this.nextHistorySequence = 1;
    this.resetCollectionDrafts();
    this.runtimeEpoch += 1;
    this.asyncValidator =
      scenario.serviceValidation === undefined
        ? undefined
        : new StandardReferenceAsyncValidator(scenario.serviceValidation, () =>
            this.emitState(),
          );

    this.compilationDiagnostics = freezeDiagnostics(compilation.diagnostics);
    if (!compilation.success) {
      this.emitState();
      return;
    }
    this.definition = compilation.definition;
    const rootPresentation = compilation.definition.presentation[0];

    // reference-snippet:start standard-create-runtime
    const created = createControlledFormRuntime({
      formId: `reference-standard-${scenario.id}`,
      definition: compilation.definition,
      schema: configuration.input.schema,
      value: this.value,
      baselineValue: this.baselineValue,
      locale: this.locale,
      validationVisibility: this.validationVisibility,
      validator: this.validator,
      ...(this.asyncValidator === undefined
        ? {}
        : { asyncValidator: this.asyncValidator.validator }),
      ...(rootPresentation?.kind === 'wizard'
        ? {
            wizardState: {
              selectedStepId: rootPresentation.steps[0]?.id ?? '',
            },
          }
        : {}),
    });
    // reference-snippet:end standard-create-runtime
    this.runtimeDiagnostics = freezeDiagnostics(created.diagnostics);
    if (!created.success) {
      this.emitState();
      return;
    }

    const runtime = created.runtime;
    this.runtime = runtime;
    this.snapshot = runtime.getSnapshot();
    // reference-snippet:start standard-runtime-subscriptions
    const snapshotSubscription = runtime.subscribe((snapshot) => {
      this.snapshot = snapshot;
      if (!this.suppressSnapshotNotification) this.emitState();
    });
    if (!snapshotSubscription.success) {
      this.runtimeDiagnostics = freezeDiagnostics(
        snapshotSubscription.diagnostics,
      );
      this.cleanupRuntimeAndBindings();
      this.emitState();
      return;
    }
    this.unsubscribeSnapshot = snapshotSubscription.unsubscribe;

    const operationSubscription = runtime.subscribeOperations((operation) => {
      this.receiveOperation(operation);
    });
    if (!operationSubscription.success) {
      this.runtimeDiagnostics = freezeDiagnostics(
        operationSubscription.diagnostics,
      );
      this.cleanupRuntimeAndBindings();
      this.emitState();
      return;
    }
    this.unsubscribeOperations = operationSubscription.unsubscribe;
    const wizardSubscription = runtime.subscribeWizardIntentions(
      (intention) => {
        if (intention.kind === 'complete') return;
        if (this.decisionMode === 'reject') {
          const result = runtime.rejectWizardIntention(intention.requestId);
          if (!result.success)
            this.runtimeDiagnostics = freezeDiagnostics(result.diagnostics);
          return;
        }
        if (this.decisionMode === 'pending') return;
        const result = runtime.updateExternalState({
          wizardSelection: {
            requestId: intention.requestId,
            selectedStepId: intention.toStepId,
          },
        });
        if (!result.success)
          this.runtimeDiagnostics = freezeDiagnostics(result.diagnostics);
      },
    );
    if (!wizardSubscription.success) {
      this.runtimeDiagnostics = freezeDiagnostics(
        wizardSubscription.diagnostics,
      );
      this.cleanupRuntimeAndBindings();
      this.emitState();
      return;
    }
    this.unsubscribeWizardIntentions = wizardSubscription.unsubscribe;
    // reference-snippet:end standard-runtime-subscriptions
    this.emitState();
  }

  private receiveOperation(operation: FormOperation): void {
    if (this.disposed) return;
    if (this.decisionMode === 'reject') {
      this.appendHistory(operation, 'rejected', EMPTY_DIAGNOSTICS);
      return;
    }
    if (this.decisionMode === 'pending') {
      this.appendHistory(operation, 'pending', EMPTY_DIAGNOSTICS);
      return;
    }
    this.appendAppliedOperation(operation);
  }

  private appendAppliedOperation(operation: FormOperation): void {
    const result = this.applyOperation(operation);
    this.appendHistory(operation, result.decision, result.diagnostics);
  }

  private applyOperation(operation: FormOperation): {
    readonly decision: OperationHistoryDecision;
    readonly diagnostics: readonly Diagnostic[];
  } {
    const definition = this.definition;
    if (definition === undefined || this.runtime === undefined) {
      return { decision: 'failed', diagnostics: EMPTY_DIAGNOSTICS };
    }
    // reference-snippet:start standard-controlled-operation
    const applied = applyFormOperation(definition, this.value, operation);
    if (!applied.success) {
      return {
        decision: classifyApplicationFailure(applied.diagnostics),
        diagnostics: freezeDiagnostics(applied.diagnostics),
      };
    }

    const update = this.updateControlledState({
      value: ownRoot(applied.value),
    });
    // reference-snippet:end standard-controlled-operation
    if (update === undefined || !update.success) {
      return {
        decision: 'failed',
        diagnostics:
          update === undefined
            ? EMPTY_DIAGNOSTICS
            : freezeDiagnostics(update.diagnostics),
      };
    }
    return {
      decision: 'confirmed',
      diagnostics: freezeDiagnostics(update.diagnostics),
    };
  }

  private resolvePending(sequence: number, confirm: boolean): boolean {
    if (this.disposed) return false;
    const index = this.history.findIndex(
      (entry) => entry.sequence === sequence && entry.decision === 'pending',
    );
    if (index < 0) return false;
    const pending = this.history[index];
    if (pending === undefined) return false;
    const resolution = confirm
      ? this.applyOperation(pending.operation)
      : { decision: 'rejected' as const, diagnostics: EMPTY_DIAGNOSTICS };
    const replacement = freezeHistoryEntry({
      ...pending,
      decision: resolution.decision,
      diagnostics: resolution.diagnostics,
    });
    this.history = Object.freeze(
      this.history.map((entry, entryIndex) =>
        entryIndex === index ? replacement : entry,
      ),
    );
    this.emitState();
    return true;
  }

  private appendHistory(
    operation: FormOperation,
    decision: OperationHistoryDecision,
    diagnostics: readonly Diagnostic[],
  ): void {
    const entry = freezeHistoryEntry({
      sequence: this.nextHistorySequence,
      operation,
      decision,
      diagnostics,
    });
    this.nextHistorySequence += 1;
    this.history = Object.freeze([...this.history, entry]);
    this.emitState();
  }

  private updateControlledState(update: {
    readonly value?: Readonly<object>;
    readonly baselineValue?: Readonly<object>;
    readonly locale?: string;
  }): RuntimeActionResult | undefined {
    const runtime = this.runtime;
    if (this.disposed || runtime === undefined) return undefined;
    const result = this.withSuppressedSnapshots(() =>
      runtime.updateExternalState(update),
    );
    this.actionDiagnostics = freezeDiagnostics(result.diagnostics);
    if (result.success) {
      if (update.value !== undefined) this.value = update.value;
      if (update.baselineValue !== undefined) {
        this.baselineValue = update.baselineValue;
      }
      if (update.locale !== undefined) this.locale = update.locale;
    }
    this.emitState();
    return result;
  }

  private invalidateDraftResult(): void {
    this.draftResult = emptyDraftResult();
    this.pendingConfigurationAction = undefined;
  }

  private isDraftModified(): boolean {
    return (
      this.schemaDraft !== this.activeConfiguration.schemaText ||
      this.uiSchemaDraft !== this.activeConfiguration.uiSchemaText
    );
  }

  private canRestoreOriginalConfiguration(): boolean {
    return (
      !configurationsEqual(
        this.activeConfiguration,
        this.originalConfiguration,
      ) ||
      this.schemaDraft !== this.originalConfiguration.schemaText ||
      this.uiSchemaDraft !== this.originalConfiguration.uiSchemaText
    );
  }

  private requiresApplicationResetConfirmation(): boolean {
    return this.snapshot?.dirty === true || this.history.length > 0;
  }

  private resetCollectionDrafts(): void {
    this.collectionDraftId = 'new-member';
    this.collectionDraftName = 'New member';
  }

  private cleanupRuntimeAndBindings(): void {
    // reference-snippet:start standard-runtime-cleanup
    for (const cleanup of [...this.bindingCleanups]) cleanup();
    this.bindingCleanups.clear();
    this.unsubscribeSnapshot?.();
    this.unsubscribeSnapshot = undefined;
    this.unsubscribeOperations?.();
    this.unsubscribeOperations = undefined;
    this.unsubscribeWizardIntentions?.();
    this.unsubscribeWizardIntentions = undefined;
    this.runtime?.dispose();
    this.runtime = undefined;
    this.asyncValidator = undefined;
    // reference-snippet:end standard-runtime-cleanup
  }

  private withSuppressedSnapshots<T>(action: () => T): T {
    this.suppressSnapshotNotification = true;
    try {
      return action();
    } finally {
      this.suppressSnapshotNotification = false;
    }
  }

  private emitState(): void {
    if (this.disposed) return;
    const state = this.getState();
    for (const listener of [...this.stateListeners]) listener(state);
  }
}

function ownRoot(value: Readonly<object>): Readonly<object> {
  return deepFreeze(structuredClone(value));
}

function readTeamMembers(
  value: Readonly<object>,
): readonly { readonly id: string }[] {
  const team = (value as { readonly team?: unknown }).team;
  if (!Array.isArray(team)) return Object.freeze([]);
  return Object.freeze(
    team.flatMap((member) => {
      if (typeof member !== 'object' || member === null) return [];
      const id = (member as { readonly id?: unknown }).id;
      return typeof id === 'string' ? [{ id }] : [];
    }),
  );
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const member of Object.values(value)) deepFreeze(member);
  return Object.freeze(value);
}

function freezeDiagnostics(
  diagnostics: readonly Diagnostic[],
): readonly Diagnostic[] {
  return diagnostics.length === 0
    ? EMPTY_DIAGNOSTICS
    : Object.freeze([...diagnostics]);
}

function freezeHistoryEntry(
  entry: OperationHistoryEntry,
): OperationHistoryEntry {
  return Object.freeze({
    ...entry,
    diagnostics: freezeDiagnostics(entry.diagnostics),
  });
}

function classifyApplicationFailure(
  diagnostics: readonly Diagnostic[],
): OperationHistoryDecision {
  if (diagnostics.some(({ code }) => code.includes('STALE'))) return 'stale';
  if (diagnostics.some(({ code }) => code.includes('INCOMPATIBLE'))) {
    return 'incompatible';
  }
  return 'failed';
}
