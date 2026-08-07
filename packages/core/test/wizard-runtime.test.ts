import { describe, expect, it, vi } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type AsyncSchemaValidator,
  type FormRuntime,
  type ValidationResult,
  type ValidationIssue,
  type WizardIntention,
} from '../src/index.js';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    first: { type: 'string' },
    second: { type: 'string' },
    third: { type: 'string' },
  },
} as const;

const compiled = compileFormDefinition({
  schema,
  uiSchema: {
    presentation: [
      {
        kind: 'wizard',
        id: 'flow',
        label: 'Flow',
        steps: [
          { kind: 'wizard-step', id: 'one', label: 'One', children: ['first'] },
          {
            kind: 'wizard-step',
            id: 'two',
            label: 'Two',
            children: ['second'],
          },
          {
            kind: 'wizard-step',
            id: 'three',
            label: 'Three',
            children: ['third'],
          },
        ],
      },
    ],
  },
});
if (!compiled.success) throw new Error('Wizard fixture must compile.');
const definition = compiled.definition;
const ordinaryCompiled = compileFormDefinition({ schema, uiSchema: {} });
if (!ordinaryCompiled.success)
  throw new Error('Ordinary fixture must compile.');
const ordinaryDefinition = ordinaryCompiled.definition;

function runtime(value = { first: '', second: '', third: '' }) {
  const created = createControlledFormRuntime({
    formId: 'wizard',
    definition,
    schema,
    value,
    baselineValue: value,
    locale: 'en',
    wizardState: { selectedStepId: 'one' },
    validator: {
      validate: (_schema: unknown, current: unknown) => {
        const record = current as Record<string, unknown>;
        const issues: ValidationIssue[] = [];
        for (const name of ['first', 'second', 'third']) {
          if (record[name] === '')
            issues.push({ code: 'required', path: [name], parameters: {} });
        }
        return { valid: issues.length === 0, issues };
      },
    },
  });
  expect(created.success).toBe(true);
  if (!created.success) throw new Error('Wizard runtime must be created.');
  return created.runtime;
}

function wizard(runtimeValue: FormRuntime<Record<string, string>>) {
  const snapshot = runtimeValue.getSnapshot().wizard;
  if (snapshot === undefined) throw new Error('Wizard snapshot required.');
  return snapshot;
}

interface Deferred<T> {
  readonly promise: Promise<T>;
  resolve(value: T): void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function asyncRuntime(
  value: Record<string, string>,
  asyncValidator: AsyncSchemaValidator,
) {
  const created = createControlledFormRuntime({
    formId: 'wizard-async',
    definition,
    schema,
    value,
    baselineValue: value,
    locale: 'en',
    wizardState: { selectedStepId: 'one' },
    validator: {
      validate: (_schema: unknown, current: unknown) => {
        const record = current as Record<string, unknown>;
        const issues: ValidationIssue[] = [];
        for (const name of ['first', 'second', 'third']) {
          if (record[name] === '')
            issues.push({ code: 'required', path: [name], parameters: {} });
        }
        return { valid: issues.length === 0, issues };
      },
    },
    asyncValidator,
  });
  expect(created.success).toBe(true);
  if (!created.success)
    throw new Error('Async wizard runtime must be created.');
  return created.runtime;
}

describe('M34 controlled wizard runtime', () => {
  it('starts on the first visited step with positional controls only', () => {
    const value = runtime({ first: 'ok', second: '', third: '' });
    expect(wizard(value)).toMatchObject({
      selectedStepId: 'one',
      controls: { previous: false, next: true, complete: false },
      completionAttempted: false,
      showGlobalIssues: false,
      steps: [
        { current: true, visited: true, progress: 'visited' },
        { current: false, visited: false, progress: 'unvisited' },
        { current: false, visited: false, progress: 'unvisited' },
      ],
    });
    expect(Object.isFrozen(wizard(value))).toBe(true);
    expect(Object.isFrozen(wizard(value).steps)).toBe(true);
    expect(Object.isFrozen(wizard(value).steps[0]?.validation)).toBe(true);
    expect(Object.isFrozen(wizard(value).steps[0]?.validation.issues)).toBe(
      true,
    );
    expect(value.requestWizardPrevious()).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'WIZARD_ACTION_UNAVAILABLE',
          parameters: { action: 'previous', reason: 'at-first-step' },
        },
      ],
    });
    expect(value.requestWizardComplete()).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'WIZARD_ACTION_UNAVAILABLE',
          parameters: { action: 'complete', reason: 'not-last-step' },
        },
      ],
    });
  });

  it('preserves ordinary runtime creation and rejects wizard-only state as not applicable', () => {
    const options = {
      formId: 'ordinary',
      definition: ordinaryDefinition,
      schema,
      value: { first: 'ok', second: 'ok', third: 'ok' },
      baselineValue: { first: 'ok', second: 'ok', third: 'ok' },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    } as const;
    const created = createControlledFormRuntime(options);
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.runtime.getSnapshot().wizard).toBeUndefined();
    expect(created.runtime.requestWizardNext()).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'WIZARD_ACTION_UNAVAILABLE',
          parameters: { action: 'next', reason: 'not-configured' },
        },
      ],
    });
    expect(
      created.runtime.updateExternalState({
        wizardSelection: { requestId: 1, selectedStepId: 'two' },
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_WIZARD_STATE',
          parameters: { member: 'wizardSelection', reason: 'not-applicable' },
        },
      ],
    });
    expect(
      createControlledFormRuntime({
        ...options,
        wizardState: { selectedStepId: 'one' },
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_WIZARD_STATE',
          parameters: { member: 'wizardState', reason: 'not-applicable' },
        },
      ],
    });
  });

  it('blocks invalid next, records an attempt and reveals only factual error', () => {
    const value = runtime();
    const intentions: WizardIntention[] = [];
    expect(
      value.subscribeWizardIntentions((entry) => intentions.push(entry))
        .success,
    ).toBe(true);
    expect(value.requestWizardNext()).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, intentionEmitted: false },
    });
    expect(intentions).toEqual([]);
    expect(wizard(value).steps).toMatchObject([
      { attempted: true, progress: 'error', validation: { state: 'invalid' } },
      {
        attempted: false,
        progress: 'unvisited',
        validation: { state: 'invalid' },
      },
      {
        attempted: false,
        progress: 'unvisited',
        validation: { state: 'invalid' },
      },
    ]);
  });

  it('emits immutable next, confirms exact selection and records passage', () => {
    const value = runtime({ first: 'ok', second: '', third: '' });
    const intentions: WizardIntention[] = [];
    value.subscribeWizardIntentions((entry) => intentions.push(entry));
    const requested = value.requestWizardNext();
    expect(requested).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, intentionEmitted: true },
    });
    expect(intentions).toHaveLength(1);
    const intention = intentions[0];
    expect(intention).toMatchObject({
      kind: 'next',
      requestId: 1,
      fromStepId: 'one',
      toStepId: 'two',
    });
    expect(Object.isFrozen(intention)).toBe(true);
    expect(wizard(value).pendingIntention).toBe(intention);
    expect(
      value.updateExternalState({
        wizardSelection: { requestId: 1, selectedStepId: 'two' },
      }),
    ).toMatchObject({ success: true, effects: { snapshotChanged: true } });
    expect(wizard(value)).toMatchObject({
      selectedStepId: 'two',
      steps: [
        { visited: true, attempted: true, passed: true, progress: 'completed' },
        { visited: true, attempted: false, passed: false, progress: 'visited' },
        { visited: false, progress: 'unvisited' },
      ],
    });
  });

  it('rejects stale confirmation/rejection and clears only an exact rejection', () => {
    const value = runtime({ first: 'ok', second: '', third: '' });
    value.requestWizardNext();
    expect(value.rejectWizardIntention(2)).toMatchObject({ success: false });
    expect(wizard(value).pendingIntention?.requestId).toBe(1);
    expect(value.rejectWizardIntention(1)).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, intentionEmitted: false },
    });
    expect(wizard(value).pendingIntention).toBeUndefined();
    expect(
      value.updateExternalState({
        wizardSelection: { requestId: 1, selectedStepId: 'two' },
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'STALE_WIZARD_INTENTION' }],
    });
  });

  it('invalidates pending gated next on an independent value identity change', () => {
    const value = runtime({ first: 'ok', second: '', third: '' });
    value.requestWizardNext();
    expect(wizard(value).pendingIntention).toBeDefined();
    value.updateExternalState({
      value: { first: 'changed', second: '', third: '' },
    });
    expect(wizard(value).pendingIntention).toBeUndefined();
    expect(wizard(value).selectedStepId).toBe('one');
  });

  it('keeps complete stateless, exposes all invalid steps and isolates listeners', () => {
    const value = runtime({ first: 'ok', second: 'ok', third: '' });
    const seen: WizardIntention[] = [];
    value.subscribeWizardIntentions(() => {
      throw new Error('consumer failure');
    });
    value.subscribeWizardIntentions((entry) => seen.push(entry));
    value.requestWizardNext();
    value.updateExternalState({
      wizardSelection: { requestId: 1, selectedStepId: 'two' },
    });
    value.requestWizardNext();
    value.updateExternalState({
      wizardSelection: { requestId: 2, selectedStepId: 'three' },
    });
    expect(value.requestWizardComplete()).toMatchObject({
      success: true,
      effects: { intentionEmitted: false },
    });
    expect(wizard(value)).toMatchObject({
      completionAttempted: true,
      showGlobalIssues: true,
      steps: [{ attempted: true }, { attempted: true }, { progress: 'error' }],
    });
    value.updateExternalState({
      value: { first: 'ok', second: 'ok', third: 'ok' },
    });
    const complete = value.requestWizardComplete();
    expect(complete).toMatchObject({
      success: true,
      effects: { intentionEmitted: true },
      diagnostics: [{ code: 'LISTENER_EXCEPTION' }],
    });
    expect(seen.at(-1)).toMatchObject({ kind: 'complete', requestId: 3 });
    expect(wizard(value).pendingIntention).toBeUndefined();
    const snapshot = value.getSnapshot();
    expect(value.requestWizardComplete()).toMatchObject({
      success: true,
      effects: { snapshotChanged: false, intentionEmitted: true },
    });
    expect(seen.at(-1)).toMatchObject({ kind: 'complete', requestId: 4 });
    expect(value.getSnapshot()).toBe(snapshot);
  });

  it('gates completion against global issues and reveals the complete scope', () => {
    const initial = { first: 'ok', second: 'ok', third: 'ok' };
    const created = createControlledFormRuntime({
      formId: 'wizard-global',
      definition,
      schema,
      value: initial,
      baselineValue: initial,
      locale: 'en',
      wizardState: { selectedStepId: 'one' },
      validator: {
        validate: () => ({
          valid: false,
          issues: [
            { code: 'global-policy', path: [], parameters: {} },
          ] as ValidationIssue[],
        }),
      },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const value = created.runtime;
    value.requestWizardNext();
    value.updateExternalState({
      wizardSelection: { requestId: 1, selectedStepId: 'two' },
    });
    value.requestWizardNext();
    value.updateExternalState({
      wizardSelection: { requestId: 2, selectedStepId: 'three' },
    });
    expect(value.requestWizardComplete()).toMatchObject({
      success: true,
      effects: { intentionEmitted: false },
    });
    expect(wizard(value)).toMatchObject({
      completionAttempted: true,
      showGlobalIssues: true,
      steps: [{ attempted: true }, { attempted: true }, { attempted: true }],
    });
    expect(value.getSnapshot().globalIssues).toHaveLength(1);
  });

  it('confirms ungated previous navigation without changing passage', () => {
    const value = runtime({ first: 'ok', second: 'ok', third: '' });
    value.requestWizardNext();
    value.updateExternalState({
      wizardSelection: { requestId: 1, selectedStepId: 'two' },
    });
    expect(value.requestWizardPrevious()).toMatchObject({
      success: true,
      effects: { intentionEmitted: true },
    });
    expect(wizard(value).pendingIntention).toMatchObject({
      kind: 'previous',
      requestId: 2,
      fromStepId: 'two',
      toStepId: 'one',
    });
    value.updateExternalState({
      wizardSelection: { requestId: 2, selectedStepId: 'one' },
    });
    expect(wizard(value).selectedStepId).toBe('one');
    expect(wizard(value).steps[0]?.passed).toBe(true);
    expect(wizard(value).steps[1]?.passed).toBe(false);
  });

  it('allows atomic confirmation plus value and immediately reflects invalidated passage', () => {
    const value = runtime({ first: 'ok', second: '', third: '' });
    value.requestWizardNext();
    expect(
      value.updateExternalState({
        value: { first: '', second: '', third: '' },
        wizardSelection: { requestId: 1, selectedStepId: 'two' },
      }),
    ).toMatchObject({ success: true, effects: { snapshotChanged: true } });
    expect(wizard(value).selectedStepId).toBe('two');
    expect(wizard(value).steps[0]).toMatchObject({
      passed: true,
      attempted: true,
      progress: 'error',
      validation: { state: 'invalid' },
    });
  });

  it('retains a pending previous intention across independent value updates', () => {
    const value = runtime({ first: 'ok', second: 'ok', third: '' });
    value.requestWizardNext();
    value.updateExternalState({
      wizardSelection: { requestId: 1, selectedStepId: 'two' },
    });
    value.requestWizardPrevious();
    const pending = wizard(value).pendingIntention;
    value.updateExternalState({
      value: { first: 'changed', second: 'ok', third: '' },
    });
    expect(wizard(value).pendingIntention).toBe(pending);
  });

  it('retains focus on rejection and clears departing-step focus on confirmation without touching', () => {
    const value = runtime({ first: 'ok', second: '', third: '' });
    value.focus(['first']);
    value.requestWizardNext();
    value.rejectWizardIntention(1);
    expect(value.getFieldSnapshot(['first'])).toMatchObject({
      focused: true,
      touched: false,
    });
    value.requestWizardNext();
    value.updateExternalState({
      wizardSelection: { requestId: 2, selectedStepId: 'two' },
    });
    expect(value.getFieldSnapshot(['first'])).toMatchObject({
      focused: false,
      touched: false,
    });
  });

  it('validates exact creation and confirmation state without invoking accessors', () => {
    const getter = vi.fn(() => 'one');
    const accessorState = {} as { selectedStepId: string };
    Object.defineProperty(accessorState, 'selectedStepId', { get: getter });
    const baseOptions = {
      formId: 'invalid-wizard',
      definition,
      schema,
      value: { first: 'ok', second: 'ok', third: 'ok' },
      baselineValue: { first: 'ok', second: 'ok', third: 'ok' },
      locale: 'en',
      validator: { validate: vi.fn(() => ({ valid: true, issues: [] })) },
    } as const;
    expect(createControlledFormRuntime(baseOptions)).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_WIZARD_STATE',
          parameters: { member: 'wizardState', reason: 'missing-member' },
        },
      ],
    });
    expect(
      createControlledFormRuntime({
        ...baseOptions,
        wizardState: {} as never,
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_WIZARD_STATE',
          parameters: { member: 'selectedStepId', reason: 'missing-member' },
        },
      ],
    });
    const invalidCreation = createControlledFormRuntime({
      ...baseOptions,
      wizardState: accessorState,
    });
    expect(invalidCreation).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_WIZARD_STATE',
          parameters: {
            member: 'selectedStepId',
            reason: 'accessor-member',
          },
        },
      ],
    });
    expect(getter).not.toHaveBeenCalled();

    const value = runtime({ first: 'ok', second: '', third: '' });
    value.requestWizardNext();
    expect(
      value.updateExternalState({
        wizardSelection: { requestId: 1 } as never,
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_WIZARD_STATE',
          parameters: { member: 'selectedStepId', reason: 'missing-member' },
        },
      ],
    });
    expect(
      value.updateExternalState({
        wizardSelection: {
          requestId: 1,
          selectedStepId: 'two',
          extra: true,
        } as never,
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_WIZARD_STATE',
          parameters: {
            member: 'wizardSelection',
            reason: 'invalid-value',
          },
        },
      ],
    });
    expect(wizard(value).pendingIntention?.requestId).toBe(1);
  });

  it('preserves structural sharing and reports no effect for a repeated blocked next', () => {
    const value = runtime();
    const before = value.getSnapshot();
    const beforeSteps = wizard(value).steps;
    expect(value.requestWizardNext().effects.snapshotChanged).toBe(true);
    const after = value.getSnapshot();
    const afterSteps = wizard(value).steps;
    expect(after).not.toBe(before);
    expect(afterSteps[0]).not.toBe(beforeSteps[0]);
    expect(afterSteps[1]).toBe(beforeSteps[1]);
    expect(afterSteps[2]).toBe(beforeSteps[2]);
    expect(value.requestWizardNext()).toMatchObject({
      success: true,
      effects: { snapshotChanged: false, intentionEmitted: false },
    });
    expect(value.getSnapshot()).toBe(after);
  });

  it('keeps wizard-owned issue visibility outside the application scope namespace', () => {
    const value = runtime();
    const root = definition.presentation[0];
    if (root?.kind !== 'wizard') throw new Error('Wizard definition required.');
    const stepScope = root.steps[0]?.scope;
    if (stepScope === undefined) throw new Error('Step scope required.');
    value.requestWizardNext();
    expect(value.getFieldSnapshot(['first'])?.showIssues).toBe(true);

    const collidingApplicationId = `\u0000wizard:${stepScope.id}`;
    value.showValidationErrors({
      id: collidingApplicationId,
      paths: [['first']],
    });
    value.hideValidationErrors(collidingApplicationId);
    expect(value.getFieldSnapshot(['first'])?.showIssues).toBe(true);
  });

  it('keeps exhaustion atomic and complete request identities stateless', () => {
    const value = runtime({ first: 'ok', second: 'ok', third: 'ok' });
    (
      value as unknown as {
        nextWizardRequestId: number;
      }
    ).nextWizardRequestId = Number.MAX_SAFE_INTEGER + 1;
    const before = value.getSnapshot();
    expect(value.requestWizardNext()).toMatchObject({
      success: false,
      effects: { snapshotChanged: false, intentionEmitted: false },
      diagnostics: [{ code: 'WIZARD_REQUEST_EXHAUSTED' }],
    });
    expect(value.getSnapshot()).toBe(before);
    expect(wizard(value).steps[0]).toMatchObject({
      attempted: false,
      passed: false,
    });
  });

  it('notifies snapshots before intentions and preserves the original intention during re-entry', () => {
    const value = runtime({ first: 'ok', second: '', third: '' });
    const order: string[] = [];
    const received: WizardIntention[] = [];
    value.subscribe(() => order.push('snapshot'));
    value.subscribeWizardIntentions((intention) => {
      order.push('first-intention');
      value.rejectWizardIntention(intention.requestId);
    });
    value.subscribeWizardIntentions((intention) => {
      order.push('second-intention');
      received.push(intention);
    });
    const result = value.requestWizardNext();
    expect(result.effects.intentionEmitted).toBe(true);
    expect(order).toEqual([
      'snapshot',
      'first-intention',
      'snapshot',
      'second-intention',
    ]);
    expect(received).toHaveLength(1);
    expect(Object.isFrozen(received[0])).toBe(true);
    expect(wizard(value).pendingIntention).toBeUndefined();
  });

  it('permits a synchronously valid provisional step while whole-form async is blocked', () => {
    const validate = vi.fn(() => Promise.resolve({ valid: true, issues: [] }));
    const value = asyncRuntime(
      { first: 'ok', second: '', third: '' },
      { validate },
    );
    expect(validate).not.toHaveBeenCalled();
    expect(wizard(value).steps).toMatchObject([
      { validation: { state: 'provisional', synchronousValid: true } },
      { validation: { state: 'invalid', synchronousValid: false } },
      { validation: { state: 'invalid', synchronousValid: false } },
    ]);
    expect(value.requestWizardNext()).toMatchObject({
      success: true,
      effects: { intentionEmitted: true },
    });
  });

  it('blocks pending and failed async gates without claiming a data error or navigating automatically', async () => {
    const work = deferred<ValidationResult>();
    const value = asyncRuntime(
      { first: 'ok', second: 'ok', third: 'ok' },
      { validate: () => work.promise },
    );
    const intentions: WizardIntention[] = [];
    value.subscribeWizardIntentions((intention) => intentions.push(intention));
    expect(value.requestWizardNext()).toMatchObject({
      success: true,
      effects: { intentionEmitted: false },
    });
    expect(wizard(value).steps[0]).toMatchObject({
      attempted: true,
      progress: 'visited',
      validation: { state: 'pending' },
    });
    work.resolve({ valid: true, issues: [] });
    await flushAsync();
    expect(intentions).toEqual([]);
    expect(value.requestWizardNext().effects.intentionEmitted).toBe(true);

    const failed = asyncRuntime(
      { first: 'ok', second: 'ok', third: 'ok' },
      { validate: () => Promise.reject(new Error('technical')) },
    );
    await flushAsync();
    expect(value.rejectWizardIntention(1).success).toBe(true);
    expect(failed.requestWizardNext().effects.intentionEmitted).toBe(false);
    expect(wizard(failed).steps[0]).toMatchObject({
      attempted: true,
      progress: 'visited',
      validation: { state: 'failed' },
    });
  });

  it('invalidates a pending gated next before an explicit async retry', async () => {
    const work = [deferred<ValidationResult>(), deferred<ValidationResult>()];
    let generation = 0;
    const value = asyncRuntime(
      { first: 'ok', second: 'ok', third: 'ok' },
      {
        validate: () =>
          work[generation++]?.promise as Promise<ValidationResult>,
      },
    );
    work[0]?.resolve({ valid: true, issues: [] });
    await flushAsync();
    value.requestWizardNext();
    expect(wizard(value).pendingIntention).toBeDefined();
    expect(value.retryAsyncValidation()).toMatchObject({
      success: true,
      effects: { snapshotChanged: true },
    });
    expect(wizard(value).pendingIntention).toBeUndefined();
    expect(wizard(value).steps[0]?.validation.state).toBe('pending');
  });

  it('retains passage through pending, invalid settlement and restoration', async () => {
    const work = [
      deferred<ValidationResult>(),
      deferred<ValidationResult>(),
      deferred<ValidationResult>(),
    ];
    let generation = 0;
    const value = asyncRuntime(
      { first: 'ok', second: 'ok', third: 'ok' },
      {
        validate: () =>
          work[generation++]?.promise as Promise<ValidationResult>,
      },
    );
    work[0]?.resolve({ valid: true, issues: [] });
    await flushAsync();
    value.requestWizardNext();
    value.updateExternalState({
      wizardSelection: { requestId: 1, selectedStepId: 'two' },
    });
    expect(wizard(value).steps[0]?.progress).toBe('completed');

    value.updateExternalState({
      value: { first: 'changed', second: 'ok', third: 'ok' },
    });
    expect(wizard(value).steps[0]).toMatchObject({
      passed: true,
      progress: 'visited',
      validation: { state: 'pending' },
    });
    work[1]?.resolve({
      valid: false,
      issues: [{ code: 'remote', path: ['first'], parameters: {} }],
    });
    await flushAsync();
    expect(wizard(value).steps[0]).toMatchObject({
      passed: true,
      progress: 'error',
      validation: { state: 'invalid' },
    });

    value.updateExternalState({
      value: { first: 'restored', second: 'ok', third: 'ok' },
    });
    work[2]?.resolve({ valid: true, issues: [] });
    await flushAsync();
    expect(wizard(value).steps[0]).toMatchObject({
      passed: true,
      progress: 'completed',
      validation: { state: 'valid' },
    });
  });
});
