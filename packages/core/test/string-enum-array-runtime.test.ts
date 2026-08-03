import { describe, expect, it, vi } from 'vitest';
import {
  applyFormOperation,
  applyOperation,
  createControlledFormRuntime,
  type ControlledFormRuntimeOptions,
  type FormDefinition,
  type FormOperation,
  type OperationExpectation,
  type StringEnumArrayFieldDefinition,
} from '../src/index.js';
import { withDefaultPresentation } from './definition-fixtures.js';

const field: StringEnumArrayFieldDefinition = {
  key: '["roles"]',
  name: 'roles',
  path: ['roles'],
  required: false,
  label: 'Roles',
  kind: 'string-enum-array',
  nullable: false,
  choices: [
    { value: 'reader', label: 'Reader' },
    { value: 'editor', label: 'Editor' },
  ],
};

function definition(target: object = field): FormDefinition {
  return withDefaultPresentation({
    nodes: [target],
    fields: [target],
  }) as unknown as FormDefinition;
}

function options(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'form',
    definition: definition(),
    schema: { type: 'object' },
    value: {},
    baselineValue: {},
    locale: 'en',
    validator: { validate: () => ({ valid: true, issues: [] }) },
    ...overrides,
  };
}

function create(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
) {
  const created = createControlledFormRuntime(options(overrides));
  expect(created.success).toBe(true);
  if (!created.success) throw new Error('runtime creation failed');
  return created.runtime;
}

function set(expected: OperationExpectation, value: unknown): FormOperation {
  return {
    type: 'set-value',
    metadata: { id: 1, formId: 'form' },
    path: ['roles'],
    expected,
    value,
    source: 'user',
  };
}

describe('M31 manual definition contract', () => {
  it('accepts exact choices without traversing ignored extras', () => {
    const choice: Record<string, unknown> = {
      value: 'reader',
      label: 'Reader',
    };
    choice.extra = choice;
    const manual = {
      ...field,
      choices: [choice, { value: 'editor', label: 'Editor', extra: choice }],
    };
    const validate = vi.fn(() => ({ valid: true, issues: [] }));

    const created = createControlledFormRuntime(
      options({ definition: definition(manual), validator: { validate } }),
    );

    expect(created.success).toBe(true);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(Object.isFrozen(manual)).toBe(false);
  });

  it.each([
    [{ ...field, nullable: true }, 'nullable', 'false', 'boolean'],
    [{ ...field, placeholder: 'Pick' }, 'placeholder', 'absent', 'string'],
    [{ ...field, fixedValue: [] }, 'fixedValue', 'absent', 'array'],
    [
      { ...field, visibleWhen: { sourcePath: ['x'], equals: 'x' } },
      'visibleWhen',
      'absent',
      'object',
    ],
    [
      { ...field, enabledWhen: { sourcePath: ['x'], equals: 'x' } },
      'enabledWhen',
      'absent',
      'object',
    ],
    [
      { ...field, choices: [] },
      'choices',
      'non-empty dense array of unique string choices',
      'array',
    ],
    [
      {
        ...field,
        choices: [
          { value: 'reader', label: 'Reader' },
          { value: 'reader', label: 'Again' },
        ],
      },
      'choices.1.value',
      'own unique string',
      'string',
    ],
    [
      { ...field, choices: [{ value: 'reader', label: '   ' }] },
      'choices.0.label',
      'own non-blank string',
      'string',
    ],
  ] as const)(
    'rejects an invalid M31 member with the closed defect reason',
    (manual, member, expected, actualType) => {
      const validate = vi.fn(() => ({ valid: true, issues: [] }));
      const malformed = definition(manual);
      const runtime = createControlledFormRuntime(
        options({ definition: malformed, validator: { validate } }),
      );
      expect(runtime).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INVALID_RUNTIME_OPTIONS',
            parameters: {
              member: 'definition',
              expected: 'valid FormDefinition with string-enum-array fields',
              definitionReason: 'invalid-string-enum-array-field',
              definitionMember: member,
              definitionExpected: expected,
              definitionActualType: actualType,
              nodeIndexPath: [0],
              path: ['roles'],
            },
          },
        ],
      });
      expect(validate).not.toHaveBeenCalled();

      expect(
        applyFormOperation(malformed, {}, set({ kind: 'missing' }, ['reader'])),
      ).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INVALID_FORM_DEFINITION',
            parameters: {
              reason: 'invalid-string-enum-array-field',
              member,
              expected,
              actualType,
              nodeIndexPath: [0],
              path: ['roles'],
            },
          },
        ],
      });
    },
  );

  it('rejects sparse and accessor choices without invoking accessors', () => {
    let getterCalls = 0;
    const sparse: unknown[] = Array(1);
    const accessor: unknown[] = [];
    Object.defineProperty(accessor, 0, {
      get() {
        getterCalls += 1;
        return { value: 'reader', label: 'Reader' };
      },
    });
    accessor.length = 1;

    for (const [choices, member, actualType] of [
      [sparse, 'choices.0', 'missing'],
      [accessor, 'choices.0', 'accessor'],
    ] as const) {
      expect(
        createControlledFormRuntime(
          options({ definition: definition({ ...field, choices }) }),
        ),
      ).toMatchObject({
        success: false,
        diagnostics: [
          {
            parameters: {
              definitionReason: 'invalid-string-enum-array-field',
              definitionMember: member,
              definitionActualType: actualType,
            },
          },
        ],
      });
    }
    expect(getterCalls).toBe(0);
  });

  it('rejects missing and accessor members in manual validation order', () => {
    let getterCalls = 0;
    const nullableAccessor = Object.defineProperty({ ...field }, 'nullable', {
      get() {
        getterCalls += 1;
        return false;
      },
    });
    const choicesAccessor = Object.defineProperty({ ...field }, 'choices', {
      get() {
        getterCalls += 1;
        return field.choices;
      },
    });
    const valueAccessor = Object.defineProperty({ label: 'Reader' }, 'value', {
      get() {
        getterCalls += 1;
        return 'reader';
      },
    });
    const labelAccessor = Object.defineProperty({ value: 'reader' }, 'label', {
      get() {
        getterCalls += 1;
        return 'Reader';
      },
    });
    for (const [manual, member, actualType] of [
      [nullableAccessor, 'nullable', 'accessor'],
      [choicesAccessor, 'choices', 'accessor'],
      [{ ...field, choices: [valueAccessor] }, 'choices.0.value', 'accessor'],
      [{ ...field, choices: [labelAccessor] }, 'choices.0.label', 'accessor'],
    ] as const) {
      expect(
        createControlledFormRuntime(
          options({ definition: definition(manual) }),
        ),
      ).toMatchObject({
        success: false,
        diagnostics: [
          {
            parameters: {
              definitionReason: 'invalid-string-enum-array-field',
              definitionMember: member,
              definitionActualType: actualType,
            },
          },
        ],
      });
    }
    expect(getterCalls).toBe(0);
  });
});

describe('M31 managed external data safety', () => {
  it('rejects managed array-index accessors atomically before validation', () => {
    let getterCalls = 0;
    const hostile: unknown[] = [];
    Object.defineProperty(hostile, 0, {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'reader';
      },
    });
    hostile.length = 1;
    const validate = vi.fn(() => ({ valid: true, issues: [] }));

    for (const member of ['value', 'baselineValue'] as const) {
      const result = createControlledFormRuntime(
        options({
          value: member === 'value' ? { roles: hostile } : {},
          baselineValue: member === 'baselineValue' ? { roles: hostile } : {},
          validator: { validate },
        }),
      );
      expect(result).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INVALID_RUNTIME_OPTIONS',
            dataPath: ['roles', 0],
            parameters: { member, propertyReason: 'accessor' },
          },
        ],
      });
    }
    expect(validate).not.toHaveBeenCalled();
    expect(getterCalls).toBe(0);

    const runtimeValidate = vi.fn(() => ({ valid: true, issues: [] }));
    const runtime = create({ validator: { validate: runtimeValidate } });
    const before = runtime.getSnapshot();
    expect(
      runtime.updateExternalState({ value: { roles: hostile } }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_EXTERNAL_STATE_UPDATE',
          dataPath: ['roles', 0],
        },
      ],
    });
    expect(runtime.getSnapshot()).toBe(before);
    expect(runtimeValidate).toHaveBeenCalledTimes(1);
    expect(getterCalls).toBe(0);

    expect(
      runtime.updateExternalState({ baselineValue: { roles: hostile } }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_EXTERNAL_STATE_UPDATE',
          dataPath: ['roles', 0],
          parameters: { member: 'baselineValue' },
        },
      ],
    });
    expect(runtime.getSnapshot()).toBe(before);
    expect(runtimeValidate).toHaveBeenCalledTimes(1);
    expect(getterCalls).toBe(0);
  });

  it('keeps missing, empty and safely inspectable invalid values distinct', () => {
    const sparse: unknown[] = Array(2);
    sparse[1] = 'reader';
    for (const value of [
      {},
      { roles: [] },
      { roles: ['reader', 'reader'] },
      { roles: ['unknown'] },
      { roles: ['reader', 1] },
      { roles: sparse },
    ]) {
      const runtime = create({ value, baselineValue: value });
      const presence = runtime.getFieldSnapshot(['roles'])?.presence;
      expect(presence?.kind).toBe(
        Object.hasOwn(value, 'roles') ? 'value' : 'missing',
      );
      if (presence?.kind === 'value') {
        expect(presence.value).toBe(Reflect.get(value, 'roles'));
      }
    }
  });
});

describe('M31 atomic operations', () => {
  it('copies and freezes runtime intentions and accepts assertion-invalid arrays', () => {
    const runtime = create({ value: { roles: ['reader'] } });
    const emitted: FormOperation[] = [];
    runtime.subscribeOperations((operation) => emitted.push(operation));
    const candidate = ['editor', 'editor', 'unknown'];

    expect(runtime.requestSetValue(['roles'], candidate)).toMatchObject({
      success: true,
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(emitted).toHaveLength(1);
    const operation = emitted[0];
    expect(operation?.type).toBe('set-value');
    if (operation?.type !== 'set-value') return;
    expect(operation.value).toEqual(candidate);
    expect(operation.value).not.toBe(candidate);
    expect(Object.isFrozen(operation.value)).toBe(true);
    candidate[0] = 'mutated';
    expect(operation.value).toEqual(['editor', 'editor', 'unknown']);
  });

  it('reports the first incompatible runtime array index without invoking it', () => {
    let getterCalls = 0;
    const sparse: unknown[] = Array(2);
    sparse[1] = 'reader';
    const accessor: unknown[] = ['reader'];
    Object.defineProperty(accessor, 0, {
      get() {
        getterCalls += 1;
        return 'reader';
      },
    });
    for (const [value, detail] of [
      [sparse, { reason: 'sparse-array', index: 0, actualType: 'missing' }],
      [
        accessor,
        { reason: 'array-index-accessor', index: 0, actualType: 'accessor' },
      ],
      [
        ['reader', 1],
        { reason: 'array-item-type', index: 1, actualType: 'number' },
      ],
    ] as const) {
      expect(create().requestSetValue(['roles'], value)).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INCOMPATIBLE_OPERATION_VALUE',
            dataPath: ['roles'],
            parameters: {
              field: 'roles',
              fieldType: 'string-enum-array',
              ...detail,
            },
          },
        ],
      });
    }
    expect(create().requestSetValue(['roles'], 'reader')).toMatchObject({
      success: false,
      diagnostics: [
        {
          parameters: {
            field: 'roles',
            fieldType: 'string-enum-array',
            actualType: 'string',
          },
        },
      ],
    });
    expect(getterCalls).toBe(0);
  });

  it('reports the same first-index details for form-aware helper values', () => {
    const sparse: unknown[] = Array(2);
    sparse[1] = 'reader';
    for (const [value, detail] of [
      [sparse, { reason: 'sparse-array', index: 0, actualType: 'missing' }],
      [
        ['reader', false],
        { reason: 'array-item-type', index: 1, actualType: 'boolean' },
      ],
    ] as const) {
      expect(
        applyFormOperation(definition(), {}, set({ kind: 'missing' }, value)),
      ).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INCOMPATIBLE_OPERATION_VALUE',
            dataPath: ['roles'],
            parameters: {
              field: 'roles',
              fieldType: 'string-enum-array',
              ...detail,
            },
          },
        ],
      });
    }

    const schemaNeutral = applyOperation({}, set({ kind: 'missing' }, sparse));
    expect(schemaNeutral).toMatchObject({ success: true, changed: true });
    expect(Reflect.get(schemaNeutral.value, 'roles')).toBe(sparse);
  });

  it('keeps helper ownership and limits ordered no-op to form-aware application', () => {
    const currentArray = ['reader', 'editor'];
    const candidate = ['reader', 'editor'];
    const current = { roles: currentArray };
    const operation = set({ kind: 'value', value: currentArray }, candidate);

    const aware = applyFormOperation(definition(), current, operation);
    expect(aware).toMatchObject({ success: true, changed: false });
    expect(aware.value).toBe(current);

    const neutral = applyOperation(current, operation);
    expect(neutral).toMatchObject({ success: true, changed: true });
    expect(Reflect.get(neutral.value, 'roles')).toBe(candidate);

    const changed = applyFormOperation(
      definition(),
      { roles: ['reader'] },
      set({ kind: 'value', value: ['reader'] }, candidate),
    );
    expect(changed).toMatchObject({
      success: false,
      diagnostics: [{ code: 'STALE_OPERATION' }],
    });

    const runtime = create({ value: current });
    const emitted: FormOperation[] = [];
    runtime.subscribeOperations((next) => emitted.push(next));
    expect(runtime.requestSetValue(['roles'], [...candidate])).toMatchObject({
      success: true,
      effects: { operationEmitted: false, snapshotChanged: false },
    });
    expect(emitted).toEqual([]);
  });

  it('checks expectation before M31 compatibility and preserves direct values', () => {
    const currentArray = ['reader'];
    const invalid = ['reader', 1];
    const stale = applyFormOperation(
      definition(),
      { roles: currentArray },
      set({ kind: 'missing' }, invalid),
    );
    expect(stale).toMatchObject({
      success: false,
      diagnostics: [{ code: 'STALE_OPERATION' }],
    });

    const replacedButEqual = ['reader'];
    const oldReference = ['reader'];
    expect(
      applyFormOperation(
        definition(),
        { roles: replacedButEqual },
        set({ kind: 'value', value: oldReference }, ['editor']),
      ),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'STALE_OPERATION' }],
    });

    const accepted = applyFormOperation(
      definition(),
      {},
      set({ kind: 'missing' }, ['unknown', 'unknown']),
    );
    expect(accepted).toMatchObject({ success: true, changed: true });
    expect(Reflect.get(accepted.value, 'roles')).toEqual([
      'unknown',
      'unknown',
    ]);

    const candidate = ['editor'];
    const applied = applyFormOperation(
      definition(),
      {},
      set({ kind: 'missing' }, candidate),
    );
    expect(applied.success).toBe(true);
    expect(Reflect.get(applied.value, 'roles')).toBe(candidate);
  });
});
