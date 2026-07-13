import { describe, expect, it, vi } from 'vitest';
import {
  createControlledFormRuntime,
  type ControlledFormRuntimeOptions,
  type FormDefinition,
  type FormOperation,
  type ValidationResult,
} from '../src/index.js';

const definition: FormDefinition = {
  fields: [
    {
      key: 'name',
      name: 'name',
      path: ['name'],
      required: true,
      label: 'Name',
      kind: 'string',
      constraints: {},
    },
    {
      key: 'age',
      name: 'age',
      path: ['age'],
      required: false,
      label: 'Age',
      kind: 'number',
      numericType: 'integer',
      constraints: {},
      ui: {},
    },
  ],
};

function options(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'form',
    definition,
    schema: { type: 'object' },
    value: { name: 'Ada' },
    baselineValue: { name: 'Ada' },
    locale: 'en',
    validator: { validate: () => ({ valid: true, issues: [] }) },
    ...overrides,
  };
}

function runtime(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
) {
  const result = createControlledFormRuntime(options(overrides));
  expect(result.success).toBe(true);
  if (!result.success) throw new Error('runtime creation failed');
  return result.runtime;
}

describe('controlled runtime', () => {
  it('creates an immutable initial snapshot and accepts invalid business data', () => {
    const issue = { code: 'required', path: ['name'], parameters: {} };
    const rt = runtime({
      value: {},
      validator: { validate: () => ({ valid: false, issues: [issue] }) },
    });
    const snapshot = rt.getSnapshot();
    expect(snapshot).toMatchObject({ valid: false, dirty: true, locale: 'en' });
    expect(snapshot.fields[0]).toMatchObject({
      presence: { kind: 'missing' },
      valid: false,
      showIssues: false,
    });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.fields[0])).toBe(true);
  });

  it('returns diagnostics for invalid creation and validator results', () => {
    expect(createControlledFormRuntime(null as never)).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INVALID_RUNTIME_OPTIONS' }],
    });
    expect(
      createControlledFormRuntime(
        options({ validator: { validate: () => null as never } }),
      ),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INVALID_VALIDATOR_RESULT' }],
    });
    expect(
      createControlledFormRuntime(
        options({
          validator: {
            validate() {
              throw new Error('bad');
            },
          },
        }),
      ),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'VALIDATOR_EXCEPTION' }],
    });
  });

  it('accepts valid frozen choices and out-of-enum controlled strings', () => {
    const choice = Object.freeze({ value: 'draft', label: 'Draft' });
    const choices = Object.freeze([choice]);
    const manualDefinition = {
      fields: [{ ...definition.fields[0], choices }],
    } as FormDefinition;
    const validate = vi.fn((): ValidationResult => ({
      valid: true,
      issues: [],
    }));
    const result = createControlledFormRuntime(
      options({
        definition: manualDefinition,
        value: { name: 'external' },
        baselineValue: {},
        validator: { validate },
      }),
    );

    expect(result.success).toBe(true);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(Object.isFrozen(manualDefinition)).toBe(false);
    expect(Object.isFrozen(manualDefinition.fields)).toBe(false);
    if (!result.success) return;
    expect(result.runtime.requestSetValue(['name'], 'another')).toMatchObject({
      success: true,
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(
      result.runtime.updateExternalState({ value: { name: 'confirmed' } }),
    ).toMatchObject({ success: true });
    expect(validate).toHaveBeenCalledTimes(2);
    expect(result.runtime.getSnapshot().value).toEqual({ name: 'confirmed' });
  });

  it('treats inherited choices as absent', () => {
    const field = Object.assign(Object.create({ choices: [] }) as object, {
      ...definition.fields[0],
    });
    const result = createControlledFormRuntime(
      options({ definition: { fields: [field] } as never }),
    );

    expect(result.success).toBe(true);
  });

  it('rejects malformed manual choices before invoking the validator', () => {
    let getterCalls = 0;
    const baseField = () => ({ ...definition.fields[0] });
    const choicesAccessor = Object.defineProperty(baseField(), 'choices', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return [{ value: 'draft', label: 'Draft' }];
      },
    });
    const accessorIndex: unknown[] = [];
    Object.defineProperty(accessorIndex, 0, {
      enumerable: true,
      get() {
        getterCalls += 1;
        return { value: 'draft', label: 'Draft' };
      },
    });
    const accessorValue = Object.defineProperty({ label: 'Draft' }, 'value', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'draft';
      },
    });
    const accessorLabel = Object.defineProperty({ value: 'draft' }, 'label', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'Draft';
      },
    });
    const sparse: unknown[] = [];
    sparse.length = 1;
    const inheritedMembers = Object.create({
      value: 'draft',
      label: 'Draft',
    }) as object;
    const invalidFields: readonly object[] = [
      choicesAccessor,
      { ...baseField(), choices: {} },
      { ...baseField(), choices: [] },
      { ...baseField(), choices: sparse },
      { ...baseField(), choices: accessorIndex },
      { ...baseField(), choices: [null] },
      { ...baseField(), choices: [[]] },
      { ...baseField(), choices: [{ value: 'draft' }] },
      { ...baseField(), choices: [inheritedMembers] },
      { ...baseField(), choices: [accessorValue] },
      { ...baseField(), choices: [accessorLabel] },
      { ...baseField(), choices: [{ value: 1, label: 'One' }] },
      {
        ...baseField(),
        choices: [
          { value: 'draft', label: 'Draft' },
          { value: 'draft', label: 'Duplicate' },
        ],
      },
      { ...baseField(), choices: [{ value: 'draft', label: 1 }] },
      { ...baseField(), choices: [{ value: 'draft', label: '   ' }] },
    ];

    for (const field of invalidFields) {
      const validate = vi.fn(() => ({ valid: true, issues: [] }));
      const result = createControlledFormRuntime(
        options({
          definition: { fields: [field] } as never,
          validator: { validate },
        }),
      );

      expect(result).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INVALID_RUNTIME_OPTIONS',
            severity: 'error',
            source: 'runtime',
            parameters: {
              member: 'definition',
              expected: 'valid FormDefinition with string choices',
              reason: 'invalid-value',
              actualType: 'object',
            },
          },
        ],
      });
      expect(result.diagnostics).toHaveLength(1);
      expect(Object.isFrozen(result.diagnostics)).toBe(true);
      expect(Object.isFrozen(result.diagnostics[0])).toBe(true);
      expect(Object.isFrozen(result.diagnostics[0]?.parameters)).toBe(true);
      expect(validate).not.toHaveBeenCalled();
    }
    expect(getterCalls).toBe(0);
  });

  it('preserves the base-definition diagnostic for unrelated failures', () => {
    const result = createControlledFormRuntime(
      options({ definition: { fields: null } as never }),
    );

    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            member: 'definition',
            expected: 'valid root FormDefinition',
            reason: 'invalid-value',
            actualType: 'object',
          },
        },
      ],
    });
  });

  it('prioritizes complete base-definition validation over choices', () => {
    let getterCalls = 0;
    const choicesAccessor = Object.defineProperty(
      { ...definition.fields[0] },
      'choices',
      {
        enumerable: true,
        get() {
          getterCalls += 1;
          return [];
        },
      },
    );
    const result = createControlledFormRuntime(
      options({
        definition: { fields: [choicesAccessor, null] } as never,
      }),
    );

    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          parameters: { expected: 'valid root FormDefinition' },
        },
      ],
    });
    expect(getterCalls).toBe(0);
  });

  it('rejects accessor-shaped external contracts without invoking getters', () => {
    let calls = 0;
    const validatorResult = Object.defineProperty({}, 'valid', {
      get() {
        calls += 1;
        return true;
      },
    });
    Object.defineProperty(validatorResult, 'issues', {
      value: [],
      enumerable: true,
    });
    expect(
      createControlledFormRuntime(
        options({
          validator: { validate: () => validatorResult as never },
        }),
      ),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INVALID_VALIDATOR_RESULT' }],
    });

    const badPath = [] as unknown[];
    Object.defineProperty(badPath, '0', {
      get() {
        calls += 1;
        return 'name';
      },
    });
    Object.defineProperty(badPath, 'length', { value: 1 });
    expect(runtime().focus(badPath as never)).toMatchObject({
      success: false,
      diagnostics: [{ code: 'UNKNOWN_RUNTIME_PATH' }],
    });
    expect(calls).toBe(0);
  });

  it('updates external state atomically, validates once, and never emits operations', () => {
    const validate = vi.fn((): ValidationResult => ({
      valid: true,
      issues: [],
    }));
    const rt = runtime({ validator: { validate } });
    const snapshots: unknown[] = [];
    const operations: unknown[] = [];
    rt.subscribe((snapshot) => snapshots.push(snapshot));
    rt.subscribeOperations((operation) => operations.push(operation));
    const next = { name: 'Grace' };
    expect(
      rt.updateExternalState({
        value: next,
        baselineValue: next,
        locale: 'fr',
      }),
    ).toMatchObject({
      success: true,
      effects: { snapshotChanged: true, operationEmitted: false },
    });
    expect(validate).toHaveBeenCalledTimes(2);
    expect(snapshots).toHaveLength(1);
    expect(operations).toHaveLength(0);
    expect(rt.getSnapshot()).toMatchObject({
      value: next,
      locale: 'fr',
      dirty: false,
    });
  });

  it('rolls back the full external update when validation throws', () => {
    let fail = false;
    const rt = runtime({
      validator: {
        validate() {
          if (fail) throw new Error('bad');
          return { valid: true, issues: [] };
        },
      },
    });
    const before = rt.getSnapshot();
    fail = true;
    expect(
      rt.updateExternalState({ value: { name: 'Grace' }, locale: 'fr' }),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'VALIDATOR_EXCEPTION' }],
    });
    expect(rt.getSnapshot()).toBe(before);
  });

  it('emits sequential frozen operations without optimistic projection', () => {
    const rt = runtime();
    const emitted: FormOperation[] = [];
    rt.subscribeOperations((operation) => emitted.push(operation));
    const before = rt.getSnapshot();
    expect(rt.requestSetValue(['name'], 'Grace')).toMatchObject({
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(rt.requestSetValue(['name'], 'Ada')).toMatchObject({
      effects: { operationEmitted: false },
    });
    expect(rt.requestRemoveValue(['age'])).toMatchObject({
      effects: { operationEmitted: false },
    });
    expect(rt.requestRemoveValue(['name'])).toMatchObject({
      effects: { operationEmitted: true },
    });
    expect(emitted.map((operation) => operation.metadata.id)).toEqual([1, 2]);
    expect(Object.isFrozen(emitted[0])).toBe(true);
    expect(rt.getSnapshot()).toBe(before);
  });

  it('rejects unmanaged paths and incompatible values', () => {
    const rt = runtime();
    expect(rt.requestSetValue(['missing'], 'x')).toMatchObject({
      success: false,
      diagnostics: [{ code: 'UNKNOWN_RUNTIME_PATH' }],
    });
    expect(rt.requestSetValue(['age'], 1.5)).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INCOMPATIBLE_OPERATION_VALUE' }],
    });
  });

  it('tracks dirty, touched, focus, and validation visibility', () => {
    const issue = { code: 'required', path: ['name'], parameters: {} };
    const rt = runtime({
      validator: { validate: () => ({ valid: false, issues: [issue] }) },
    });
    expect(rt.focus(['name']).effects.snapshotChanged).toBe(true);
    expect(rt.blur(['name']).effects.snapshotChanged).toBe(true);
    expect(rt.getFieldSnapshot(['name'])).toMatchObject({
      touched: true,
      focused: false,
      showIssues: true,
    });
    expect(rt.resetTouched().effects.snapshotChanged).toBe(true);
    expect(rt.getFieldSnapshot(['name'])?.showIssues).toBe(false);
    rt.setValidationVisibility('all');
    expect(rt.getFieldSnapshot(['name'])?.showIssues).toBe(true);
  });

  it('supports overlapping forced scopes and validation snapshots', () => {
    const issues = [
      { code: 'name', path: ['name'], parameters: {} },
      { code: 'global', path: [], parameters: {} },
    ];
    const rt = runtime({
      validator: { validate: () => ({ valid: false, issues }) },
    });
    const scope = {
      id: 'step',
      paths: [['name']] as const,
      includeGlobalIssues: true,
    };
    expect(rt.showValidationErrors(scope).success).toBe(true);
    expect(rt.getFieldSnapshot(['name'])?.showIssues).toBe(true);
    expect(rt.getValidationSnapshot(scope).issues).toHaveLength(2);
    rt.hideValidationErrors('step');
    expect(rt.getFieldSnapshot(['name'])?.showIssues).toBe(false);
  });

  it('preserves unaffected field snapshot references', () => {
    const rt = runtime();
    const age = rt.getFieldSnapshot(['age']);
    rt.focus(['name']);
    expect(rt.getFieldSnapshot(['age'])).toBe(age);
  });

  it('isolates listener exceptions and continues in subscription order', () => {
    const rt = runtime();
    const calls: string[] = [];
    rt.subscribe(() => {
      calls.push('first');
      throw new Error('bad');
    });
    rt.subscribe(() => calls.push('second'));
    const result = rt.focus(['name']);
    expect(calls).toEqual(['first', 'second']);
    expect(result).toMatchObject({
      success: true,
      diagnostics: [{ code: 'LISTENER_EXCEPTION' }],
    });
  });

  it('supports idempotent unsubscribe and disposal', () => {
    const rt = runtime();
    const listener = vi.fn();
    const subscription = rt.subscribe(listener);
    expect(subscription.success).toBe(true);
    if (subscription.success) {
      subscription.unsubscribe();
      subscription.unsubscribe();
    }
    rt.focus(['name']);
    expect(listener).not.toHaveBeenCalled();
    expect(rt.dispose().success).toBe(true);
    expect(rt.dispose().success).toBe(true);
    expect(rt.focus(['name'])).toMatchObject({
      success: false,
      diagnostics: [{ code: 'RUNTIME_DISPOSED' }],
    });
    expect(rt.subscribe(() => undefined)).toMatchObject({
      success: false,
      diagnostics: [{ code: 'RUNTIME_DISPOSED' }],
    });
  });
});
