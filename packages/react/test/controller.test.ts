// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  compileFormDefinition,
  createControlledFormRuntime,
  type Diagnostic,
  type FormRuntime,
  type RuntimeActionResult,
  type SchemaValidator,
  type SubscribeResult,
  type TextResolutionContext,
  type WizardActionResult,
} from '@rabassoft/schema-engine';
import { describe, expect, it, vi } from 'vitest';
import type {
  ReactControlledFormConfig,
  ReactFormActions,
} from '../src/contracts.js';
import {
  internalReactHandleContexts,
  ReactFormController,
  type InternalRuntimeFactory,
} from '../src/internal/controller.js';
import { internalReactDiagnosticsReceiver } from '../src/internal/handle.js';

interface Value {
  readonly name?: string;
}

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    name: Object.freeze({ type: 'string' }),
  }),
});
const compilation = compileFormDefinition({ schema });
if (!compilation.success) throw new Error('Controller fixture must compile.');
const definition = compilation.definition;

const validator: SchemaValidator = Object.freeze({
  validate: () => Object.freeze({ valid: true, issues: Object.freeze([]) }),
});

function config(
  overrides: Partial<ReactControlledFormConfig<Value>> = {},
): ReactControlledFormConfig<Value> {
  return {
    formId: 'controller',
    definition,
    schema,
    validator,
    value: Object.freeze({ name: 'Ada' }),
    baselineValue: Object.freeze({ name: 'Ada' }),
    locale: 'en',
    onOperation: vi.fn(),
    onWizardIntention: vi.fn(),
    ...overrides,
  };
}

interface Instrumentation {
  readonly create: ReturnType<typeof vi.fn>;
  readonly dispose: ReturnType<typeof vi.fn>;
  readonly unsubscribeSnapshot: ReturnType<typeof vi.fn>;
  readonly unsubscribeOperations: ReturnType<typeof vi.fn>;
  readonly unsubscribeWizard: ReturnType<typeof vi.fn>;
  emitSnapshot(): void;
}

function instrumentedFactory(
  options: {
    readonly failSubscription?: 'snapshot' | 'operation' | 'wizard';
  } = {},
): {
  readonly factory: InternalRuntimeFactory;
  readonly evidence: Instrumentation;
} {
  const create = vi.fn();
  const dispose = vi.fn();
  const unsubscribeSnapshot = vi.fn();
  const unsubscribeOperations = vi.fn();
  const unsubscribeWizard = vi.fn();
  let emitSnapshot = () => {};
  const failure = subscriptionFailure();

  const factory: InternalRuntimeFactory = <TData extends object>(
    runtimeOptions: {
      readonly formId: string;
    } & Parameters<typeof createControlledFormRuntime<TData>>[0],
  ) => {
    create(runtimeOptions.formId);
    const created = createControlledFormRuntime(runtimeOptions);
    if (!created.success) return created;
    const runtime = created.runtime;
    const originalDispose = runtime.dispose.bind(runtime);
    Object.defineProperties(runtime, {
      subscribe: {
        value: (listener: Parameters<FormRuntime<TData>['subscribe']>[0]) => {
          emitSnapshot = () => listener(runtime.getSnapshot());
          return options.failSubscription === 'snapshot'
            ? failure
            : subscriptionSuccess(unsubscribeSnapshot);
        },
      },
      subscribeOperations: {
        value: () =>
          options.failSubscription === 'operation'
            ? failure
            : subscriptionSuccess(unsubscribeOperations),
      },
      subscribeWizardIntentions: {
        value: () =>
          options.failSubscription === 'wizard'
            ? failure
            : subscriptionSuccess(unsubscribeWizard),
      },
      dispose: {
        value: () => {
          dispose();
          return originalDispose();
        },
      },
    });
    return Object.freeze({
      success: true as const,
      runtime,
      diagnostics: created.diagnostics,
    });
  };

  return {
    factory,
    evidence: {
      create,
      dispose,
      unsubscribeSnapshot,
      unsubscribeOperations,
      unsubscribeWizard,
      emitSnapshot: () => emitSnapshot(),
    },
  };
}

describe('ReactFormController hostile lifecycle', () => {
  it('unwinds every successful subscription when a later one fails', () => {
    const { factory, evidence } = instrumentedFactory({
      failSubscription: 'operation',
    });
    const controller = new ReactFormController<Value>(factory);
    controller.commit(config());

    expect(controller.store.getSnapshot().state.status).toBe('error');
    expect(evidence.unsubscribeSnapshot).toHaveBeenCalledTimes(1);
    expect(evidence.unsubscribeOperations).not.toHaveBeenCalled();
    expect(evidence.unsubscribeWizard).toHaveBeenCalledTimes(1);
    expect(evidence.dispose).toHaveBeenCalledTimes(1);
    const failedHandle = controller.store.getSnapshot();
    evidence.emitSnapshot();
    expect(controller.store.getSnapshot()).toBe(failedHandle);
  });

  it('reuses a compatible epoch and balances replacement and cleanup', () => {
    const { factory, evidence } = instrumentedFactory();
    const controller = new ReactFormController<Value>(factory);
    const first = config();
    controller.commit(first);
    controller.commit({ ...first, value: Object.freeze({ name: 'Grace' }) });
    expect(evidence.create).toHaveBeenCalledTimes(1);

    controller.commit({ ...first, formId: 'replacement' });
    expect(evidence.create).toHaveBeenCalledTimes(2);
    expect(evidence.dispose).toHaveBeenCalledTimes(1);
    expect(evidence.unsubscribeSnapshot).toHaveBeenCalledTimes(1);
    expect(evidence.unsubscribeOperations).toHaveBeenCalledTimes(1);
    expect(evidence.unsubscribeWizard).toHaveBeenCalledTimes(1);

    controller.cleanup();
    expect(evidence.dispose).toHaveBeenCalledTimes(2);
    expect(evidence.unsubscribeSnapshot).toHaveBeenCalledTimes(2);
    expect(evidence.unsubscribeOperations).toHaveBeenCalledTimes(2);
    expect(evidence.unsubscribeWizard).toHaveBeenCalledTimes(2);
  });

  it('replaces the epoch for each exact construction identity member', () => {
    const secondCompilation = compileFormDefinition({ schema });
    if (!secondCompilation.success)
      throw new Error('Replacement fixture must compile.');
    const asyncResult = Object.freeze({
      valid: true,
      issues: Object.freeze([]),
    });
    const asyncValidator = Object.freeze({
      validate: () => Promise.resolve(asyncResult),
    });
    const cases: readonly Partial<ReactControlledFormConfig<Value>>[] = [
      { formId: 'replacement' },
      { definition: secondCompilation.definition },
      { schema: Object.freeze({ ...schema }) },
      {
        validator: Object.freeze({
          validate: () => asyncResult,
        }),
      },
      { asyncValidator },
    ];

    for (const replacement of cases) {
      const { factory, evidence } = instrumentedFactory();
      const controller = new ReactFormController<Value>(factory);
      const initial = config();
      controller.commit(initial);
      controller.commit({ ...initial, ...replacement });
      expect(evidence.create).toHaveBeenCalledTimes(2);
      expect(evidence.dispose).toHaveBeenCalledOnce();
      controller.cleanup();
    }
  });

  it('retries a creation error only for relevant inputs or required callbacks', () => {
    const { factory, evidence } = instrumentedFactory();
    const first = config({
      wizardState: Object.freeze({ selectedStepId: 'not-applicable' }),
      textResolver: Object.freeze({ resolve: (text: string) => text }),
    });
    const controller = new ReactFormController<Value>(factory);
    controller.commit(first);
    expect(controller.store.getSnapshot().state.status).toBe('error');
    expect(evidence.create).toHaveBeenCalledOnce();

    controller.commit({
      ...first,
      onDiagnostics: vi.fn(),
      textResolver: Object.freeze({
        resolve: (text: string) => `next:${text}`,
      }),
    });
    expect(evidence.create).toHaveBeenCalledOnce();

    controller.commit({ ...first, onOperation: vi.fn() });
    expect(evidence.create).toHaveBeenCalledTimes(2);
  });

  it('keeps the bridge snapshot reference cached without publication', () => {
    const { factory, evidence } = instrumentedFactory();
    const controller = new ReactFormController<Value>(factory);
    const initial = controller.store.getSnapshot();
    expect(controller.store.getSnapshot()).toBe(initial);
    controller.commit(config());
    const ready = controller.store.getSnapshot();
    expect(ready).not.toBe(initial);
    expect(controller.store.getSnapshot()).toBe(ready);
    evidence.emitSnapshot();
    expect(controller.store.getSnapshot()).toBe(ready);
  });

  it('exposes a frozen descriptor-safe cross-copy diagnostics receiver', () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const controller = new ReactFormController<Value>();
    controller.commit(config({ onDiagnostics: diagnostics }));
    const handle = controller.store.getSnapshot();
    const descriptor = Object.getOwnPropertyDescriptor(
      handle,
      internalReactDiagnosticsReceiver,
    );
    expect(descriptor).toMatchObject({ enumerable: false, writable: false });
    expect(typeof descriptor?.value).toBe('function');
    expect(Object.isFrozen(descriptor?.value)).toBe(true);
    const diagnostic = subscriptionFailure().diagnostics;
    (descriptor?.value as (batch: readonly Diagnostic[]) => void)(diagnostic);
    expect(diagnostics).toHaveBeenCalledOnce();
    expect(diagnostics).toHaveBeenCalledWith(diagnostic);
  });

  it('keeps the latest resolver port and advances only its projection generation', () => {
    const field = definition.fields[0];
    if (field === undefined) throw new Error('Expected one field definition.');
    const context: TextResolutionContext = Object.freeze({
      formId: 'controller',
      locale: 'en',
      field,
      member: 'label',
    });
    const controller = new ReactFormController<Value>();
    const firstConfig = config({
      textResolver: Object.freeze({
        resolve: (text: string) => `first:${text}`,
      }),
    });
    controller.commit(firstConfig);
    const first = controller.store.getSnapshot();
    const firstContext = internalReactHandleContexts.get(first);
    expect(firstContext?.resolveText('Name', context)).toBe('first:Name');

    controller.commit({
      ...firstConfig,
      textResolver: Object.freeze({
        resolve: (text: string) => `second:${text}`,
      }),
    });
    const second = controller.store.getSnapshot();
    const secondContext = internalReactHandleContexts.get(second);
    expect(second.actions).toBe(first.actions);
    expect(second).not.toBe(first);
    expect(secondContext?.projectionGeneration).toBe(
      (firstContext?.projectionGeneration ?? -1) + 1,
    );
    expect(firstContext?.resolveText('Name', context)).toBe('second:Name');
    expect(secondContext?.resolveText('Name', context)).toBe('second:Name');
  });

  it('delegates every ready facade method exactly once without transforming core results', () => {
    const runtimeResult: RuntimeActionResult = Object.freeze({
      success: true,
      effects: Object.freeze({
        snapshotChanged: false,
        operationEmitted: false,
      }),
      diagnostics: Object.freeze([]),
    });
    const wizardResult: WizardActionResult = Object.freeze({
      success: true,
      effects: Object.freeze({
        snapshotChanged: false,
        intentionEmitted: false,
      }),
      diagnostics: Object.freeze([]),
    });
    const calls = new Map<string, ReturnType<typeof vi.fn>>();
    const factory: InternalRuntimeFactory = <TData extends object>(
      options: Parameters<typeof createControlledFormRuntime<TData>>[0],
    ) => {
      const created = createControlledFormRuntime<TData>(options);
      if (!created.success) return created;
      const runtime = created.runtime;
      const methods: Readonly<Record<string, () => unknown>> = {
        getFieldSnapshot: () => undefined,
        getNodeSnapshot: () => undefined,
        getItemSnapshot: () => undefined,
        getCollectionNodeSnapshot: () => undefined,
        requestSetValue: () => runtimeResult,
        requestRemoveValue: () => runtimeResult,
        requestSetItemValue: () => runtimeResult,
        requestRemoveItemValue: () => runtimeResult,
        requestInsertItem: () => runtimeResult,
        requestRemoveItem: () => runtimeResult,
        requestMoveItem: () => runtimeResult,
        focus: () => runtimeResult,
        blur: () => runtimeResult,
        resetTouched: () => runtimeResult,
        setValidationVisibility: () => runtimeResult,
        getValidationSnapshot: () =>
          Object.freeze({
            valid: true,
            issues: Object.freeze([]),
            diagnostics: Object.freeze([]),
          }),
        showValidationErrors: () => runtimeResult,
        hideValidationErrors: () => runtimeResult,
        retryAsyncValidation: () => runtimeResult,
        requestWizardPrevious: () => wizardResult,
        requestWizardNext: () => wizardResult,
        requestWizardComplete: () => wizardResult,
        rejectWizardIntention: () => wizardResult,
        updateExternalState: () => runtimeResult,
      };
      for (const [name, implementation] of Object.entries(methods)) {
        const method = vi.fn(implementation);
        calls.set(name, method);
        Object.defineProperty(runtime, name, { value: method });
      }
      return Object.freeze({
        success: true as const,
        runtime,
        diagnostics: created.diagnostics,
      });
    };
    const controller = new ReactFormController<Value>(factory);
    controller.commit(config());
    const actions = controller.store.getSnapshot().actions;
    const results = invokeEveryAction(actions);

    for (const method of calls.values()) expect(method).toHaveBeenCalledOnce();
    for (const result of results.slice(0, 4))
      expect(result).toMatchObject({ success: true, value: undefined });
    expect(results[4]).toMatchObject({ success: true, value: { valid: true } });
    for (const result of results.slice(5, 20))
      expect(result).toBe(runtimeResult);
    for (const result of results.slice(20, 24))
      expect(result).toBe(wizardResult);
    expect(calls.get('updateExternalState')).toHaveBeenCalledWith({
      wizardSelection: { requestId: 1, selectedStepId: 'step' },
    });
  });

  it('makes every initializing facade method inert with one frozen diagnostic', () => {
    const create = vi.fn();
    const controller = new ReactFormController<Value>((options) => {
      create(options);
      return createControlledFormRuntime(options);
    });
    const results = invokeEveryAction(controller.store.getSnapshot().actions);
    expect(create).not.toHaveBeenCalled();
    for (const result of results) {
      expect(result).toMatchObject({
        success: false,
        diagnostics: [{ code: 'REACT_FORM_NOT_READY' }],
      });
      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.diagnostics)).toBe(true);
    }
    for (const result of results.slice(5, 20))
      expect(result).toMatchObject({
        effects: { snapshotChanged: false, operationEmitted: false },
      });
    for (const result of results.slice(20, 24))
      expect(result).toMatchObject({
        effects: { snapshotChanged: false, intentionEmitted: false },
      });
  });

  it('keeps a retained initializing facade not-ready after an epoch becomes active', () => {
    const controller = new ReactFormController<Value>();
    const initializing = controller.store.getSnapshot().actions;
    controller.commit(config());
    expect(initializing.requestRemoveValue(['name'])).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'REACT_FORM_NOT_READY',
          parameters: { status: 'ready' },
        },
      ],
    });
  });

  it('makes every retained method stale after unmount and reports each batch once', () => {
    const diagnostics = vi.fn<(batch: readonly Diagnostic[]) => void>();
    const controller = new ReactFormController<Value>();
    controller.commit(config({ onDiagnostics: diagnostics }));
    const actions = controller.store.getSnapshot().actions;
    controller.cleanup();
    const results = invokeEveryAction(actions);

    expect(diagnostics).toHaveBeenCalledTimes(results.length);
    for (const result of results)
      expect(result).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'STALE_REACT_FORM_ACTION',
            parameters: { reason: 'unmounted' },
          },
        ],
      });
  });

  it('reconciles external values in one ordered update before visibility', () => {
    const order: string[] = [];
    const update = vi.fn();
    const visibility = vi.fn();
    const factory: InternalRuntimeFactory = <TData extends object>(
      options: Parameters<typeof createControlledFormRuntime<TData>>[0],
    ) => {
      const created = createControlledFormRuntime<TData>(options);
      if (!created.success) return created;
      const runtime = created.runtime;
      const originalUpdate = runtime.updateExternalState.bind(runtime);
      const originalVisibility = runtime.setValidationVisibility.bind(runtime);
      Object.defineProperties(runtime, {
        updateExternalState: {
          value: (input: Parameters<typeof originalUpdate>[0]) => {
            order.push('external');
            update(input);
            return originalUpdate(input);
          },
        },
        setValidationVisibility: {
          value: (input: Parameters<typeof originalVisibility>[0]) => {
            order.push('visibility');
            visibility(input);
            return originalVisibility(input);
          },
        },
      });
      return created;
    };
    const controller = new ReactFormController<Value>(factory);
    const first = config();
    controller.commit(first);
    const actions = controller.store.getSnapshot().actions;
    const nextValue = Object.freeze({ name: 'Grace' });
    const nextBaseline = Object.freeze({ name: 'Katherine' });
    controller.commit({
      ...first,
      value: nextValue,
      baselineValue: nextBaseline,
      locale: 'es',
      validationVisibility: 'all',
    });

    expect(order).toEqual(['external', 'visibility']);
    expect(update).toHaveBeenCalledWith({
      value: nextValue,
      baselineValue: nextBaseline,
      locale: 'es',
    });
    expect(Object.keys(update.mock.calls[0]?.[0] as object)).toEqual([
      'value',
      'baselineValue',
      'locale',
    ]);
    expect(visibility).toHaveBeenCalledWith('all');
    expect(controller.store.getSnapshot().actions).toBe(actions);
  });

  it('suppresses visibility after a failed external update and reports after error publication', () => {
    const failure = actionFailure();
    const visibility = vi.fn();
    const dispose = vi.fn();
    const factory: InternalRuntimeFactory = <TData extends object>(
      options: Parameters<typeof createControlledFormRuntime<TData>>[0],
    ) => {
      const created = createControlledFormRuntime<TData>(options);
      if (!created.success) return created;
      const runtime = created.runtime;
      const originalDispose = runtime.dispose.bind(runtime);
      Object.defineProperties(runtime, {
        updateExternalState: { value: () => failure },
        setValidationVisibility: { value: visibility },
        dispose: {
          value: () => {
            dispose();
            return originalDispose();
          },
        },
      });
      return created;
    };
    const observedStatuses: string[] = [];
    const controller = new ReactFormController<Value>(factory);
    const first = config({
      onDiagnostics: () =>
        observedStatuses.push(controller.store.getSnapshot().state.status),
    });
    controller.commit(first);
    controller.commit({
      ...first,
      value: Object.freeze({ name: 'Grace' }),
      validationVisibility: 'all',
    });

    expect(controller.store.getSnapshot().state).toMatchObject({
      status: 'error',
      diagnostics: [{ code: 'TEST_ACTION_FAILURE' }],
    });
    expect(visibility).not.toHaveBeenCalled();
    expect(dispose).toHaveBeenCalledOnce();
    expect(observedStatuses).toEqual(['error']);
  });
});

function invokeEveryAction(actions: ReactFormActions): readonly Readonly<{
  success: boolean;
  diagnostics: readonly Diagnostic[];
}>[] {
  const path = Object.freeze(['name']);
  const item = Object.freeze({ collectionPath: ['items'], itemId: 'item' });
  const node = Object.freeze({ ...item, relativePath: ['name'] });
  const placement = Object.freeze({ kind: 'end' as const });
  const scope = Object.freeze({ id: 'scope', paths: [path] });
  return [
    actions.getFieldSnapshot(path),
    actions.getNodeSnapshot(path),
    actions.getItemSnapshot(item),
    actions.getCollectionNodeSnapshot(node),
    actions.getValidationSnapshot(scope),
    actions.requestSetValue(path, 'value'),
    actions.requestRemoveValue(path),
    actions.requestSetItemValue(node, 'value'),
    actions.requestRemoveItemValue(node),
    actions.requestInsertItem(['items'], 'item', {}, placement),
    actions.requestRemoveItem(item),
    actions.requestMoveItem(item, placement),
    actions.focus(path),
    actions.blur(path),
    actions.resetTouched(scope),
    actions.setValidationVisibility('all'),
    actions.showValidationErrors(scope),
    actions.hideValidationErrors('scope'),
    actions.retryAsyncValidation(),
    actions.confirmWizardSelection({ requestId: 1, selectedStepId: 'step' }),
    actions.requestWizardPrevious(),
    actions.requestWizardNext(),
    actions.requestWizardComplete(),
    actions.rejectWizardIntention(1),
  ];
}

function subscriptionSuccess(unsubscribe: () => void): SubscribeResult {
  const diagnostics: readonly [] = Object.freeze([]);
  return Object.freeze({
    success: true,
    unsubscribe,
    diagnostics,
  });
}

function subscriptionFailure(): SubscribeResult {
  const diagnostic: Diagnostic = Object.freeze({
    code: 'TEST_SUBSCRIPTION_FAILURE',
    severity: 'error',
    source: 'runtime',
    parameters: Object.freeze({}),
  });
  return Object.freeze({
    success: false,
    diagnostics: Object.freeze([diagnostic]),
  });
}

function actionFailure(): RuntimeActionResult {
  const diagnostic: Diagnostic = Object.freeze({
    code: 'TEST_ACTION_FAILURE',
    severity: 'error',
    source: 'runtime',
    parameters: Object.freeze({}),
  });
  return Object.freeze({
    success: false,
    effects: Object.freeze({
      snapshotChanged: false,
      operationEmitted: false,
    }),
    diagnostics: Object.freeze([diagnostic]),
  });
}
