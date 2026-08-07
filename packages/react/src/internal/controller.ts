// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  createControlledFormRuntime,
  type CollectionItemAddress,
  type CollectionNodeAddress,
  type CollectionPlacement,
  type ControlledFormRuntimeOptions,
  type CreateControlledFormRuntimeResult,
  type DataPath,
  type Diagnostic,
  type FormRuntime,
  type FormDefinition,
  type FormScope,
  type RuntimeActionResult,
  type TextResolutionContext,
  type ValidationVisibility,
  type WizardActionResult,
  type WizardSelectionConfirmation,
} from '@rabassoft/schema-engine';
import type {
  ReactControlledFormConfig,
  ReactFormActions,
  ReactFormHandle,
  ReactFormState,
} from '../contracts.js';
import {
  actualType,
  adapterDiagnostic,
  EMPTY_DIAGNOSTICS,
  freezeDiagnostics,
} from './diagnostics.js';
import {
  internalReactDiagnosticsReceiver,
  internalReactFormHandleBrand,
} from './handle.js';
import { BridgeStore } from './store.js';

interface CommittedPorts<TData extends object> {
  readonly onOperation: ReactControlledFormConfig<TData>['onOperation'];
  readonly onWizardIntention: ReactControlledFormConfig<TData>['onWizardIntention'];
  readonly onDiagnostics?: ReactControlledFormConfig<TData>['onDiagnostics'];
  readonly resolver: (text: string, context: TextResolutionContext) => unknown;
  readonly resolverIdentity: unknown;
}

interface ConstructionIdentity {
  readonly formId: unknown;
  readonly definition: unknown;
  readonly schema: unknown;
  readonly validator: unknown;
  readonly asyncValidator: unknown;
}

interface ExternalIdentity {
  readonly value: unknown;
  readonly baselineValue: unknown;
  readonly locale: unknown;
  readonly visibility: unknown;
}

interface RuntimeEpoch<TData extends object> {
  readonly id: number;
  readonly runtime: FormRuntime<TData>;
  readonly construction: ConstructionIdentity;
  external: ExternalIdentity;
  readonly actions: ReactFormActions;
  active: boolean;
  unsubscribeSnapshot?: () => void;
  unsubscribeOperations?: () => void;
  unsubscribeWizard?: () => void;
}

interface FacadeToken<TData extends object> {
  readonly epoch?: RuntimeEpoch<TData>;
}

export interface InternalReactHandleContext {
  readonly epochId: number | undefined;
  readonly projectionGeneration: number;
  readonly formId: string | undefined;
  readonly locale: string | undefined;
  readonly definition: FormDefinition | undefined;
  readonly resolveText: (
    text: string,
    context: TextResolutionContext,
  ) => unknown;
  readonly reportDiagnostics: (diagnostics: readonly Diagnostic[]) => void;
  readonly isCurrent: () => boolean;
}

export const internalReactHandleContexts = new WeakMap<
  object,
  InternalReactHandleContext
>();

export type InternalRuntimeFactory = <TValue extends object>(
  options: ControlledFormRuntimeOptions<TValue>,
) => CreateControlledFormRuntimeResult<TValue>;

const identityResolver = Object.freeze({
  resolve: (text: string): string => text,
});

type DescriptorEntry =
  | { readonly kind: 'missing' }
  | { readonly kind: 'accessor' }
  | { readonly kind: 'value'; readonly value: unknown };

export class ReactFormController<TData extends object> {
  readonly store: BridgeStore<ReactFormHandle<TData>>;
  private active: RuntimeEpoch<TData> | undefined;
  private ports: CommittedPorts<TData> | undefined;
  private nextEpochId = 1;
  private projectionGeneration = 0;
  private unmounted = false;
  private lastFailureInputs: readonly unknown[] | undefined;
  private readonly warnedResolverIdentities: unknown[] = [];

  constructor(
    private readonly createRuntime: InternalRuntimeFactory = createControlledFormRuntime,
  ) {
    const state = initializingState<TData>();
    const actions = this.createActions({});
    this.store = new BridgeStore(this.createHandle(state, actions));
  }

  commit(config: ReactControlledFormConfig<TData>): void {
    this.unmounted = false;
    const parsedCallbacks = parseCallbacks(config);
    const parsedResolver = parseTextResolver(config);
    if (parsedCallbacks.diagnostics.length > 0) {
      this.ports = {
        onOperation: inertCallback,
        onWizardIntention: inertCallback,
        ...(parsedCallbacks.onDiagnostics === undefined
          ? {}
          : {
              onDiagnostics: parsedCallbacks.onDiagnostics,
            }),
        resolver: parsedResolver.resolve,
        resolverIdentity: parsedResolver.identity,
      };
      const failureInputs = callbackFailureInputs(config);
      if (!sameIdentityList(failureInputs, this.lastFailureInputs)) {
        this.teardownActive();
        this.lastFailureInputs = failureInputs;
        this.publishError(nonEmptyDiagnostics(parsedCallbacks.diagnostics));
        this.reportDiagnostics(parsedCallbacks.diagnostics);
      }
      return;
    }

    const previousResolver = this.ports?.resolverIdentity;
    this.ports = {
      onOperation: parsedCallbacks.onOperation,
      onWizardIntention: parsedCallbacks.onWizardIntention,
      ...(parsedCallbacks.onDiagnostics === undefined
        ? {}
        : { onDiagnostics: parsedCallbacks.onDiagnostics }),
      resolver: parsedResolver.resolve,
      resolverIdentity: parsedResolver.identity,
    };

    const construction = constructionIdentity(config);
    const attemptInputs = committedAttemptInputs(config, parsedCallbacks);
    if (
      this.active === undefined &&
      sameIdentityList(attemptInputs, this.lastFailureInputs)
    )
      return;
    if (
      this.active === undefined ||
      !sameConstruction(this.active.construction, construction)
    ) {
      this.replaceRuntime(
        config,
        construction,
        attemptInputs,
        parsedResolver.diagnostics,
      );
      return;
    }

    const resolverChanged = !Object.is(
      previousResolver,
      parsedResolver.identity,
    );
    if (resolverChanged) this.projectionGeneration += 1;
    if (!this.reconcile(config, this.active, attemptInputs)) return;
    this.lastFailureInputs = undefined;
    if (resolverChanged) this.publishReady(this.active);
    this.deliverResolverDiagnostics(
      parsedResolver.identity,
      parsedResolver.diagnostics,
    );
  }

  cleanup(): void {
    this.unmounted = true;
    this.teardownActive();
    this.lastFailureInputs = undefined;
  }

  private replaceRuntime(
    config: ReactControlledFormConfig<TData>,
    construction: ConstructionIdentity,
    attemptInputs: readonly unknown[],
    resolverDiagnostics: readonly Diagnostic[],
  ): void {
    this.teardownActive();
    const creation = this.createRuntime(config);
    if (!creation.success) {
      this.lastFailureInputs = attemptInputs;
      this.publishError(nonEmptyDiagnostics(creation.diagnostics));
      this.reportDiagnostics(creation.diagnostics);
      return;
    }

    const epoch = {} as RuntimeEpoch<TData>;
    Object.assign(epoch, {
      id: this.nextEpochId++,
      runtime: creation.runtime,
      construction,
      external: externalIdentity(config),
      active: true,
    });
    Object.defineProperty(epoch, 'actions', {
      value: this.createActions({ epoch }),
      enumerable: true,
    });

    const snapshot = creation.runtime.subscribe((next) => {
      if (this.active === epoch && epoch.active) this.publishReady(epoch, next);
    });
    const operations = creation.runtime.subscribeOperations((operation) => {
      if (this.active !== epoch || !epoch.active) return;
      this.ports?.onOperation(operation);
    });
    const wizard = creation.runtime.subscribeWizardIntentions((intention) => {
      if (this.active !== epoch || !epoch.active) return;
      this.ports?.onWizardIntention(intention);
    });
    const subscriptionDiagnostics = freezeDiagnostics([
      ...snapshot.diagnostics,
      ...operations.diagnostics,
      ...wizard.diagnostics,
    ]);
    if (!snapshot.success || !operations.success || !wizard.success) {
      if (snapshot.success) snapshot.unsubscribe();
      if (operations.success) operations.unsubscribe();
      if (wizard.success) wizard.unsubscribe();
      epoch.active = false;
      creation.runtime.dispose();
      this.lastFailureInputs = attemptInputs;
      this.publishError(nonEmptyDiagnostics(subscriptionDiagnostics));
      this.reportDiagnostics(subscriptionDiagnostics);
      return;
    }

    epoch.unsubscribeSnapshot = snapshot.unsubscribe;
    epoch.unsubscribeOperations = operations.unsubscribe;
    epoch.unsubscribeWizard = wizard.unsubscribe;
    this.active = epoch;
    this.lastFailureInputs = undefined;
    this.publishReady(epoch);
    this.reportDiagnostics(creation.diagnostics);
    this.deliverResolverDiagnostics(
      this.ports?.resolverIdentity,
      resolverDiagnostics,
    );
  }

  private reconcile(
    config: ReactControlledFormConfig<TData>,
    epoch: RuntimeEpoch<TData>,
    attemptInputs: readonly unknown[],
  ): boolean {
    const next = externalIdentity(config);
    const update: Record<string, unknown> = {};
    if (!Object.is(epoch.external.value, next.value))
      update['value'] = next.value;
    if (!Object.is(epoch.external.baselineValue, next.baselineValue))
      update['baselineValue'] = next.baselineValue;
    if (!Object.is(epoch.external.locale, next.locale))
      update['locale'] = next.locale;
    if (Object.keys(update).length > 0) {
      const result = epoch.runtime.updateExternalState(update);
      if (!result.success) {
        this.failEpoch(epoch, result.diagnostics, attemptInputs);
        this.reportDiagnostics(result.diagnostics);
        return false;
      }
      this.reportDiagnostics(result.diagnostics);
    }
    if (!Object.is(epoch.external.visibility, next.visibility)) {
      const result = epoch.runtime.setValidationVisibility(
        next.visibility as ValidationVisibility,
      );
      if (!result.success) {
        this.failEpoch(epoch, result.diagnostics, attemptInputs);
        this.reportDiagnostics(result.diagnostics);
        return false;
      }
      this.reportDiagnostics(result.diagnostics);
    }
    epoch.external = next;
    return true;
  }

  private failEpoch(
    epoch: RuntimeEpoch<TData>,
    diagnostics: readonly Diagnostic[],
    attemptInputs: readonly unknown[],
  ): void {
    if (this.active !== epoch) return;
    this.teardownActive();
    this.lastFailureInputs = attemptInputs;
    this.publishError(nonEmptyDiagnostics(diagnostics));
  }

  private teardownActive(): void {
    const epoch = this.active;
    if (epoch === undefined) return;
    this.active = undefined;
    epoch.active = false;
    epoch.unsubscribeSnapshot?.();
    epoch.unsubscribeOperations?.();
    epoch.unsubscribeWizard?.();
    epoch.runtime.dispose();
  }

  private publishReady(
    epoch: RuntimeEpoch<TData>,
    snapshot = epoch.runtime.getSnapshot(),
  ): void {
    if (this.active !== epoch || !epoch.active) return;
    const current = this.store.getSnapshot();
    const context = internalReactHandleContexts.get(current);
    if (
      current.state.status === 'ready' &&
      Object.is(current.state.snapshot, snapshot) &&
      current.actions === epoch.actions &&
      context?.projectionGeneration === this.projectionGeneration
    )
      return;
    const state = Object.freeze({
      status: 'ready',
      snapshot,
      diagnostics: EMPTY_DIAGNOSTICS,
    }) as ReactFormState<TData>;
    this.store.publish(this.createHandle(state, epoch.actions));
  }

  private publishError(
    diagnostics: readonly [Diagnostic, ...Diagnostic[]],
  ): void {
    const state = Object.freeze({
      status: 'error',
      diagnostics,
    }) as ReactFormState<TData>;
    this.store.publish(this.createHandle(state, this.createActions({})));
  }

  private createHandle(
    state: ReactFormState<TData>,
    actions: ReactFormActions,
  ): ReactFormHandle<TData> {
    const diagnosticsReceiver = Object.freeze(
      (diagnostics: readonly Diagnostic[]) =>
        this.reportDiagnostics(diagnostics),
    );
    const epoch = this.active;
    const generation = this.projectionGeneration;
    const handleCandidate = {
      state,
      actions,
    } as ReactFormHandle<TData>;
    Object.defineProperties(handleCandidate, {
      [internalReactFormHandleBrand]: {
        value: true,
        enumerable: false,
      },
      [internalReactDiagnosticsReceiver]: {
        value: diagnosticsReceiver,
        enumerable: false,
      },
    });
    const handle = Object.freeze(handleCandidate);
    internalReactHandleContexts.set(handle, {
      epochId: epoch?.id,
      projectionGeneration: generation,
      formId: epoch?.construction.formId as string | undefined,
      locale: epoch?.external.locale as string | undefined,
      definition: epoch?.construction.definition as FormDefinition | undefined,
      resolveText: (text, context) =>
        this.ports?.resolver(text, context) ?? text,
      reportDiagnostics: diagnosticsReceiver,
      isCurrent: () =>
        !this.unmounted &&
        this.active === epoch &&
        this.projectionGeneration === generation,
    });
    return handle;
  }

  private createActions(token: FacadeToken<TData>): ReactFormActions {
    const runtime = <TResult>(
      method: string,
      invoke: (runtime: FormRuntime<TData>) => TResult,
    ): TResult => this.withRuntime(token, method, 'runtime', invoke) as TResult;
    const wizard = <TResult>(
      method: string,
      invoke: (runtime: FormRuntime<TData>) => TResult,
    ): TResult => this.withRuntime(token, method, 'wizard', invoke) as TResult;
    const read = <TValue>(
      method: string,
      invoke: (runtime: FormRuntime<TData>) => TValue,
    ) => this.withRead(token, method, invoke);

    return freezeActionFacade({
      getFieldSnapshot: (path: DataPath) =>
        read('getFieldSnapshot', (value) => value.getFieldSnapshot(path)),
      getNodeSnapshot: (path: DataPath) =>
        read('getNodeSnapshot', (value) => value.getNodeSnapshot(path)),
      getItemSnapshot: (address: CollectionItemAddress) =>
        read('getItemSnapshot', (value) => value.getItemSnapshot(address)),
      getCollectionNodeSnapshot: (address: CollectionNodeAddress) =>
        read('getCollectionNodeSnapshot', (value) =>
          value.getCollectionNodeSnapshot(address),
        ),
      requestSetValue: (path: DataPath, value: unknown) =>
        runtime('requestSetValue', (target) =>
          target.requestSetValue(path, value),
        ),
      requestRemoveValue: (path: DataPath) =>
        runtime('requestRemoveValue', (target) =>
          target.requestRemoveValue(path),
        ),
      requestSetItemValue: (target: CollectionNodeAddress, value: unknown) =>
        runtime('requestSetItemValue', (runtimeTarget) =>
          runtimeTarget.requestSetItemValue(target, value),
        ),
      requestRemoveItemValue: (target: CollectionNodeAddress) =>
        runtime('requestRemoveItemValue', (runtimeTarget) =>
          runtimeTarget.requestRemoveItemValue(target),
        ),
      requestInsertItem: (
        collectionPath: readonly string[],
        itemId: string,
        item: unknown,
        placement: CollectionPlacement,
      ) =>
        runtime('requestInsertItem', (target) =>
          target.requestInsertItem(collectionPath, itemId, item, placement),
        ),
      requestRemoveItem: (address: CollectionItemAddress) =>
        runtime('requestRemoveItem', (target) =>
          target.requestRemoveItem(address),
        ),
      requestMoveItem: (
        address: CollectionItemAddress,
        placement: CollectionPlacement,
      ) =>
        runtime('requestMoveItem', (target) =>
          target.requestMoveItem(address, placement),
        ),
      focus: (target: DataPath | CollectionNodeAddress) =>
        runtime('focus', (value) => value.focus(target)),
      blur: (target: DataPath | CollectionNodeAddress) =>
        runtime('blur', (value) => value.blur(target)),
      resetTouched: (scope?: FormScope) =>
        runtime('resetTouched', (target) => target.resetTouched(scope)),
      setValidationVisibility: (visibility: ValidationVisibility) =>
        runtime('setValidationVisibility', (target) =>
          target.setValidationVisibility(visibility),
        ),
      getValidationSnapshot: (scope?: FormScope) => {
        return read('getValidationSnapshot', (target) =>
          target.getValidationSnapshot(scope),
        );
      },
      showValidationErrors: (scope: FormScope) =>
        runtime('showValidationErrors', (target) =>
          target.showValidationErrors(scope),
        ),
      hideValidationErrors: (scopeId: string) =>
        runtime('hideValidationErrors', (target) =>
          target.hideValidationErrors(scopeId),
        ),
      retryAsyncValidation: () =>
        runtime('retryAsyncValidation', (target) =>
          target.retryAsyncValidation(),
        ),
      requestWizardPrevious: () =>
        wizard('requestWizardPrevious', (target) =>
          target.requestWizardPrevious(),
        ),
      requestWizardNext: () =>
        wizard('requestWizardNext', (target) => target.requestWizardNext()),
      requestWizardComplete: () =>
        wizard('requestWizardComplete', (target) =>
          target.requestWizardComplete(),
        ),
      rejectWizardIntention: (requestId: number) =>
        wizard('rejectWizardIntention', (target) =>
          target.rejectWizardIntention(requestId),
        ),
      confirmWizardSelection: (confirmation: WizardSelectionConfirmation) =>
        runtime('confirmWizardSelection', (target) =>
          target.updateExternalState({ wizardSelection: confirmation }),
        ),
    });
  }

  private withRuntime<TResult>(
    token: FacadeToken<TData>,
    method: string,
    kind: 'runtime' | 'wizard',
    invoke: (runtime: FormRuntime<TData>) => TResult,
  ): TResult | RuntimeActionResult | WizardActionResult {
    const epoch = this.availableEpoch(token);
    if (epoch === undefined) {
      const diagnostic = this.unavailableDiagnostic(token, method);
      this.reportDiagnostics([diagnostic]);
      return kind === 'wizard'
        ? unavailableWizardResult(diagnostic)
        : unavailableRuntimeResult(diagnostic);
    }
    const result = invoke(epoch.runtime);
    if (isDiagnosticResult(result)) this.reportDiagnostics(result.diagnostics);
    return result;
  }

  private withRead<TValue>(
    token: FacadeToken<TData>,
    method: string,
    invoke: (runtime: FormRuntime<TData>) => TValue,
  ) {
    const epoch = this.availableEpoch(token);
    if (epoch === undefined) {
      const diagnostic = this.unavailableDiagnostic(token, method);
      this.reportDiagnostics([diagnostic]);
      return Object.freeze({
        success: false as const,
        diagnostics: singleDiagnostic(diagnostic),
      });
    }
    return Object.freeze({
      success: true as const,
      value: invoke(epoch.runtime),
      diagnostics: EMPTY_DIAGNOSTICS,
    });
  }

  private availableEpoch(
    token: FacadeToken<TData>,
  ): RuntimeEpoch<TData> | undefined {
    return token.epoch !== undefined &&
      token.epoch === this.active &&
      token.epoch.active &&
      !this.unmounted
      ? token.epoch
      : undefined;
  }

  private unavailableDiagnostic(
    token: FacadeToken<TData>,
    method: string,
  ): Diagnostic {
    const stale = this.unmounted || token.epoch !== undefined;
    return stale
      ? adapterDiagnostic(
          'STALE_REACT_FORM_ACTION',
          'error',
          { method, reason: this.unmounted ? 'unmounted' : 'replaced-epoch' },
          `React form action "${method}" belongs to a stale runtime epoch.`,
        )
      : adapterDiagnostic(
          'REACT_FORM_NOT_READY',
          'error',
          { method, status: this.store.getSnapshot().state.status },
          `React form action "${method}" is unavailable while the form is ${this.store.getSnapshot().state.status}.`,
        );
  }

  private reportDiagnostics(diagnostics: readonly Diagnostic[]): void {
    if (diagnostics.length === 0) return;
    try {
      this.ports?.onDiagnostics?.(freezeDiagnostics(diagnostics));
    } catch {
      // Diagnostics callbacks are an isolated application boundary.
    }
  }

  private deliverResolverDiagnostics(
    identity: unknown,
    diagnostics: readonly Diagnostic[],
  ): void {
    if (diagnostics.length === 0) return;
    if (
      this.warnedResolverIdentities.some((entry) => Object.is(entry, identity))
    )
      return;
    this.warnedResolverIdentities.push(identity);
    this.reportDiagnostics(diagnostics);
  }
}

function initializingState<TData extends object>(): ReactFormState<TData> {
  return Object.freeze({
    status: 'initializing',
    diagnostics: EMPTY_DIAGNOSTICS,
  });
}

function parseCallbacks<TData extends object>(
  config: ReactControlledFormConfig<TData>,
): {
  readonly onOperation: ReactControlledFormConfig<TData>['onOperation'];
  readonly onWizardIntention: ReactControlledFormConfig<TData>['onWizardIntention'];
  readonly onDiagnostics?: ReactControlledFormConfig<TData>['onDiagnostics'];
  readonly diagnostics: readonly Diagnostic[];
} {
  const diagnostics: Diagnostic[] = [];
  const operation = callbackMember(config, 'onOperation', true, diagnostics);
  const wizard = callbackMember(config, 'onWizardIntention', true, diagnostics);
  const report = callbackMember(config, 'onDiagnostics', false, diagnostics);
  return {
    onOperation: (operation ??
      inertCallback) as ReactControlledFormConfig<TData>['onOperation'],
    onWizardIntention: (wizard ??
      inertCallback) as ReactControlledFormConfig<TData>['onWizardIntention'],
    ...(report === undefined
      ? {}
      : {
          onDiagnostics:
            report as unknown as ReactControlledFormConfig<TData>['onDiagnostics'],
        }),
    diagnostics: freezeDiagnostics(diagnostics),
  };
}

function callbackMember(
  config: unknown,
  member: string,
  required: boolean,
  diagnostics: Diagnostic[],
): ((...arguments_: never[]) => unknown) | undefined {
  const entry = ownEntry(config, member);
  if (entry.kind === 'missing') {
    if (required)
      diagnostics.push(invalidConfig(member, 'missing-member', 'undefined'));
    return undefined;
  }
  if (entry.kind === 'accessor') {
    diagnostics.push(invalidConfig(member, 'accessor-member', 'accessor'));
    return undefined;
  }
  if (typeof entry.value !== 'function') {
    diagnostics.push(
      invalidConfig(member, 'invalid-value', actualType(entry.value)),
    );
    return undefined;
  }
  return entry.value as (...arguments_: never[]) => unknown;
}

function invalidConfig(
  member: string,
  reason: string,
  type: string,
): Diagnostic {
  return adapterDiagnostic(
    'INVALID_REACT_FORM_CONFIG',
    'error',
    {
      member,
      expected: 'callable own data property',
      reason,
      actualType: type,
    },
    `React form configuration member "${member}" is invalid.`,
  );
}

function parseTextResolver<TData extends object>(
  config: ReactControlledFormConfig<TData>,
): {
  readonly identity: unknown;
  readonly resolve: (text: string, context: TextResolutionContext) => unknown;
  readonly diagnostics: readonly Diagnostic[];
} {
  const entry = ownEntry(config, 'textResolver');
  if (entry.kind === 'missing')
    return {
      identity: identityResolver,
      resolve: identityResolver.resolve,
      diagnostics: EMPTY_DIAGNOSTICS,
    };
  if (entry.kind === 'accessor')
    return invalidResolver(config, 'accessor-resolve', 'accessor');
  const candidate = entry.value;
  const descriptor = findDescriptor(candidate, 'resolve');
  if (descriptor.kind === 'missing')
    return invalidResolver(candidate, 'missing-resolve', 'undefined');
  if (descriptor.kind === 'accessor')
    return invalidResolver(candidate, 'accessor-resolve', 'accessor');
  if (typeof descriptor.value !== 'function')
    return invalidResolver(
      candidate,
      'invalid-resolve',
      actualType(descriptor.value),
    );
  const method = descriptor.value as (
    this: unknown,
    text: string,
    context: TextResolutionContext,
  ) => unknown;
  return {
    identity: candidate,
    resolve: (text, context) => method.call(candidate, text, context),
    diagnostics: EMPTY_DIAGNOSTICS,
  };
}

function invalidResolver(identity: unknown, reason: string, type: string) {
  return {
    identity,
    resolve: (text: string) => text,
    diagnostics: Object.freeze([
      adapterDiagnostic(
        'INVALID_TEXT_RESOLVER',
        'warning',
        { expected: 'callable resolve method', reason, actualType: type },
        'Text resolver is invalid; source text is used.',
      ),
    ]),
  };
}

function ownEntry(candidate: unknown, member: string): DescriptorEntry {
  if (
    (typeof candidate !== 'object' || candidate === null) &&
    typeof candidate !== 'function'
  )
    return { kind: 'missing' };
  try {
    const descriptor = Object.getOwnPropertyDescriptor(candidate, member);
    if (descriptor === undefined) return { kind: 'missing' };
    return 'value' in descriptor
      ? { kind: 'value', value: descriptor.value }
      : { kind: 'accessor' };
  } catch {
    return { kind: 'accessor' };
  }
}

function findDescriptor(candidate: unknown, member: string): DescriptorEntry {
  if (
    (typeof candidate !== 'object' || candidate === null) &&
    typeof candidate !== 'function'
  )
    return { kind: 'missing' };
  let current: object | null = candidate;
  try {
    while (current !== null) {
      const descriptor = Object.getOwnPropertyDescriptor(current, member);
      if (descriptor !== undefined)
        return 'value' in descriptor
          ? { kind: 'value', value: descriptor.value }
          : { kind: 'accessor' };
      const prototype: unknown = Object.getPrototypeOf(current);
      current =
        prototype === null ||
        typeof prototype === 'object' ||
        typeof prototype === 'function'
          ? prototype
          : null;
    }
  } catch {
    return { kind: 'accessor' };
  }
  return { kind: 'missing' };
}

function constructionIdentity<TData extends object>(
  config: ReactControlledFormConfig<TData>,
): ConstructionIdentity {
  return Object.freeze({
    formId: ownValue(config, 'formId'),
    definition: ownValue(config, 'definition'),
    schema: ownValue(config, 'schema'),
    validator: ownValue(config, 'validator'),
    asyncValidator: ownValue(config, 'asyncValidator'),
  });
}

function externalIdentity<TData extends object>(
  config: ReactControlledFormConfig<TData>,
): ExternalIdentity {
  const visibility = ownValue(config, 'validationVisibility');
  return Object.freeze({
    value: ownValue(config, 'value'),
    baselineValue: ownValue(config, 'baselineValue'),
    locale: ownValue(config, 'locale'),
    visibility: visibility === undefined ? 'touched' : visibility,
  });
}

function ownValue(candidate: unknown, member: string): unknown {
  const entry = ownEntry(candidate, member);
  return entry.kind === 'value' ? entry.value : undefined;
}

function sameConstruction(
  left: ConstructionIdentity,
  right: ConstructionIdentity,
): boolean {
  return (
    Object.is(left.formId, right.formId) &&
    Object.is(left.definition, right.definition) &&
    Object.is(left.schema, right.schema) &&
    Object.is(left.validator, right.validator) &&
    Object.is(left.asyncValidator, right.asyncValidator)
  );
}

function callbackFailureInputs<TData extends object>(
  config: ReactControlledFormConfig<TData>,
): readonly unknown[] {
  const construction = constructionIdentity(config);
  const external = externalIdentity(config);
  return Object.freeze([
    construction.formId,
    construction.definition,
    construction.schema,
    construction.validator,
    construction.asyncValidator,
    external.value,
    external.baselineValue,
    external.locale,
    external.visibility,
    ...descriptorFingerprint(config, 'onOperation'),
    ...descriptorFingerprint(config, 'onWizardIntention'),
    ...descriptorFingerprint(config, 'onDiagnostics'),
  ]);
}

function descriptorFingerprint(
  candidate: unknown,
  member: string,
): readonly unknown[] {
  const entry = ownEntry(candidate, member);
  return entry.kind === 'value'
    ? Object.freeze([entry.kind, entry.value])
    : Object.freeze([entry.kind]);
}

function committedAttemptInputs<TData extends object>(
  config: ReactControlledFormConfig<TData>,
  callbacks: {
    readonly onOperation: unknown;
    readonly onWizardIntention: unknown;
  },
): readonly unknown[] {
  const construction = constructionIdentity(config);
  const external = externalIdentity(config);
  return Object.freeze([
    construction.formId,
    construction.definition,
    construction.schema,
    construction.validator,
    construction.asyncValidator,
    external.value,
    external.baselineValue,
    external.locale,
    external.visibility,
    ownValue(config, 'wizardState'),
    callbacks.onOperation,
    callbacks.onWizardIntention,
  ]);
}

function sameIdentityList(
  left: readonly unknown[],
  right: readonly unknown[] | undefined,
): boolean {
  return (
    right !== undefined &&
    left.length === right.length &&
    left.every((value, index) => Object.is(value, right[index]))
  );
}

function nonEmptyDiagnostics(
  diagnostics: readonly Diagnostic[],
): readonly [Diagnostic, ...Diagnostic[]] {
  if (diagnostics.length > 0)
    return freezeDiagnostics(diagnostics) as readonly [
      Diagnostic,
      ...Diagnostic[],
    ];
  return Object.freeze([
    invalidConfig('runtime', 'invalid-value', 'undefined'),
  ]);
}

function singleDiagnostic(diagnostic: Diagnostic): readonly [Diagnostic] {
  return Object.freeze([diagnostic]);
}

function freezeActionFacade(actions: ReactFormActions): ReactFormActions {
  for (const descriptor of Object.values(
    Object.getOwnPropertyDescriptors(actions),
  ))
    if ('value' in descriptor && typeof descriptor.value === 'function')
      Object.freeze(descriptor.value);
  return Object.freeze(actions);
}

function unavailableRuntimeResult(diagnostic: Diagnostic): RuntimeActionResult {
  return Object.freeze({
    success: false,
    effects: Object.freeze({
      snapshotChanged: false,
      operationEmitted: false,
    }),
    diagnostics: Object.freeze([diagnostic]),
  });
}

function unavailableWizardResult(diagnostic: Diagnostic): WizardActionResult {
  return Object.freeze({
    success: false,
    effects: Object.freeze({
      snapshotChanged: false,
      intentionEmitted: false,
    }),
    diagnostics: Object.freeze([diagnostic]),
  });
}

function isDiagnosticResult(
  value: unknown,
): value is { readonly diagnostics: readonly Diagnostic[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { diagnostics?: unknown }).diagnostics)
  );
}

function inertCallback(): void {}
