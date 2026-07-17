// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
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
} from '@schema-engine-internal/reference-scenarios';

export type OperationDecisionMode = 'confirm' | 'reject' | 'pending';

export type OperationHistoryDecision =
  'confirmed' | 'rejected' | 'pending' | 'stale' | 'incompatible' | 'failed';

export interface OperationHistoryEntry {
  readonly sequence: number;
  readonly operation: FormOperation;
  readonly decision: OperationHistoryDecision;
  readonly diagnostics: readonly Diagnostic[];
}

export interface StandardReferenceApplicationState {
  readonly scenario: ReferenceScenario;
  readonly definition?: FormDefinition;
  readonly value: Readonly<object>;
  readonly baselineValue: Readonly<object>;
  readonly locale: string;
  readonly validationVisibility: ValidationVisibility;
  readonly decisionMode: OperationDecisionMode;
  readonly compilationDiagnostics: readonly Diagnostic[];
  readonly runtimeDiagnostics: readonly Diagnostic[];
  readonly actionDiagnostics: readonly Diagnostic[];
  readonly snapshot?: FormRuntimeSnapshot<object>;
  readonly pendingOperations: readonly OperationHistoryEntry[];
  readonly history: readonly OperationHistoryEntry[];
}

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
  private definition: FormDefinition | undefined;
  private value: Readonly<object>;
  private baselineValue: Readonly<object>;
  private locale: string;
  private validationVisibility: ValidationVisibility;
  private decisionMode: OperationDecisionMode = 'confirm';
  private compilationDiagnostics = EMPTY_DIAGNOSTICS;
  private runtimeDiagnostics = EMPTY_DIAGNOSTICS;
  private actionDiagnostics = EMPTY_DIAGNOSTICS;
  private snapshot: FormRuntimeSnapshot<object> | undefined;
  private history = EMPTY_HISTORY;
  private nextHistorySequence = 1;
  private runtime: FormRuntime<object> | undefined;
  private unsubscribeSnapshot: Cleanup | undefined;
  private unsubscribeOperations: Cleanup | undefined;
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
    this.value = ownRoot(initial.initialState.value);
    this.baselineValue = ownRoot(initial.initialState.baselineValue);
    this.locale = initial.initialState.locale;
    this.validationVisibility = initial.initialState.validationVisibility;
    this.replaceScenario(initial);
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
      compilationDiagnostics: this.compilationDiagnostics,
      runtimeDiagnostics: this.runtimeDiagnostics,
      actionDiagnostics: this.actionDiagnostics,
      ...(this.snapshot === undefined ? {} : { snapshot: this.snapshot }),
      pendingOperations,
      history: this.history,
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
    this.replaceScenario(scenario);
    return true;
  }

  resetScenario(): void {
    if (this.disposed) return;
    this.replaceScenario(this.scenario);
  }

  setDecisionMode(mode: OperationDecisionMode): void {
    if (this.disposed || this.decisionMode === mode) return;
    this.decisionMode = mode;
    this.actionDiagnostics = EMPTY_DIAGNOSTICS;
    this.emitState();
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

  private replaceScenario(scenario: ReferenceScenario): void {
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
    this.nextHistorySequence = 1;

    const compilation = compileFormDefinition(scenario.compileInput);
    this.compilationDiagnostics = freezeDiagnostics(compilation.diagnostics);
    if (!compilation.success) {
      this.emitState();
      return;
    }
    this.definition = compilation.definition;

    const created = createControlledFormRuntime({
      formId: `reference-standard-${scenario.id}`,
      definition: compilation.definition,
      schema: scenario.compileInput.schema,
      value: this.value,
      baselineValue: this.baselineValue,
      locale: this.locale,
      validationVisibility: this.validationVisibility,
      validator: this.validator,
    });
    this.runtimeDiagnostics = freezeDiagnostics(created.diagnostics);
    if (!created.success) {
      this.emitState();
      return;
    }

    const runtime = created.runtime;
    this.runtime = runtime;
    this.snapshot = runtime.getSnapshot();
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

  private cleanupRuntimeAndBindings(): void {
    for (const cleanup of [...this.bindingCleanups]) cleanup();
    this.bindingCleanups.clear();
    this.unsubscribeSnapshot?.();
    this.unsubscribeSnapshot = undefined;
    this.unsubscribeOperations?.();
    this.unsubscribeOperations = undefined;
    this.runtime?.dispose();
    this.runtime = undefined;
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
