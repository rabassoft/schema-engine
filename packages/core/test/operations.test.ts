import { describe, expect, it } from 'vitest';
import {
  applyFormOperation,
  applyOperation,
  type FormDefinition,
  type FormOperation,
} from '../src/index.js';

const metadata = { id: 1, formId: 'form' } as const;
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
      key: 'amount',
      name: 'amount',
      path: ['amount'],
      required: false,
      label: 'Amount',
      kind: 'number',
      numericType: 'number',
      constraints: {},
      ui: {},
    },
    {
      key: 'count',
      name: 'count',
      path: ['count'],
      required: false,
      label: 'Count',
      kind: 'number',
      numericType: 'integer',
      constraints: {},
      ui: {},
    },
    {
      key: 'active',
      name: 'active',
      path: ['active'],
      required: false,
      label: 'Active',
      kind: 'boolean',
    },
  ],
};

function set(
  path: readonly (string | number)[],
  expected: unknown,
  value: unknown,
): FormOperation {
  return {
    type: 'set-value',
    metadata,
    path,
    expected: expected as never,
    value,
    source: 'user',
  };
}

function remove(
  path: readonly (string | number)[],
  value: unknown,
): FormOperation {
  return {
    type: 'remove-value',
    metadata,
    path,
    expected: { kind: 'value', value },
    source: 'user',
  };
}

describe('root immutable operations', () => {
  it('sets existing and missing properties and removes existing properties', () => {
    const original = { name: 'Ada', untouched: { shared: true } };
    const replaced = applyOperation(
      original,
      set(['name'], { kind: 'value', value: 'Ada' }, 'Grace'),
    );
    expect(replaced).toMatchObject({
      success: true,
      changed: true,
      value: { name: 'Grace' },
    });
    expect(replaced.value).not.toBe(original);
    expect(replaced.value.untouched).toBe(original.untouched);

    const added = applyOperation(
      original,
      set(['age'], { kind: 'missing' }, 37),
    );
    expect(added).toMatchObject({
      success: true,
      changed: true,
      value: { age: 37 },
    });

    const removed = applyOperation(original, remove(['name'], 'Ada'));
    expect(removed.success && Object.hasOwn(removed.value, 'name')).toBe(false);
  });

  it('returns the exact input for no-ops, stale operations, and errors', () => {
    const original = { name: 'Ada' };
    const noOp = applyOperation(
      original,
      set(['name'], { kind: 'value', value: 'Ada' }, 'Ada'),
    );
    expect(noOp).toMatchObject({
      success: true,
      changed: false,
      diagnostics: [],
    });
    expect(noOp.value).toBe(original);

    for (const operation of [
      set(['name'], { kind: 'missing' }, 'Grace'),
      set(['missing'], { kind: 'value', value: 'Ada' }, 'Grace'),
      remove(['missing'], 'Ada'),
    ]) {
      const result = applyOperation(original, operation);
      expect(result).toMatchObject({
        success: false,
        changed: false,
        diagnostics: [{ code: 'STALE_OPERATION' }],
      });
      expect(result.value).toBe(original);
    }
  });

  it.each([
    [[], 'root-not-supported'],
    [['a', 'b'], 'deep-path-not-supported'],
    [[0], 'non-string-segment'],
  ])('rejects path %j', (path, reason) => {
    const original = {};
    const result = applyOperation(
      original,
      set(path, { kind: 'missing' }, 'x'),
    );
    expect(result).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INVALID_OPERATION_PATH', parameters: { reason } }],
    });
    expect(result.value).toBe(original);
  });

  it('collects malformed members deterministically', () => {
    const result = applyOperation({}, {
      type: 'bad',
      metadata: { id: 0, formId: '' },
      source: 'bad',
      path: 'bad',
      expected: null,
    } as never);
    expect(result.diagnostics.map((item) => item.parameters.member)).toEqual([
      'type',
      'metadata.id',
      'metadata.formId',
      'source',
      'path',
      'expected',
    ]);
  });

  it('validates form membership and primitive compatibility', () => {
    expect(
      applyFormOperation(
        definition,
        {},
        set(['name'], { kind: 'missing' }, 'Ada'),
      ).success,
    ).toBe(true);
    expect(
      applyFormOperation(
        definition,
        {},
        set(['amount'], { kind: 'missing' }, 1.5),
      ).success,
    ).toBe(true);
    expect(
      applyFormOperation(definition, {}, set(['count'], { kind: 'missing' }, 2))
        .success,
    ).toBe(true);
    expect(
      applyFormOperation(
        definition,
        {},
        set(['active'], { kind: 'missing' }, true),
      ).success,
    ).toBe(true);
    expect(
      applyFormOperation(
        definition,
        {},
        set(['missing'], { kind: 'missing' }, 'x'),
      ),
    ).toMatchObject({ diagnostics: [{ code: 'FORM_PATH_NOT_MANAGED' }] });
    expect(
      applyFormOperation(
        definition,
        {},
        set(['count'], { kind: 'missing' }, 1.5),
      ),
    ).toMatchObject({
      diagnostics: [{ code: 'INCOMPATIBLE_OPERATION_VALUE' }],
    });
    expect(
      applyFormOperation(
        definition,
        {},
        set(['amount'], { kind: 'missing' }, Number.POSITIVE_INFINITY),
      ),
    ).toMatchObject({
      diagnostics: [{ code: 'INCOMPATIBLE_OPERATION_VALUE' }],
    });
  });

  it('never inspects choices while applying structural operations', () => {
    let getterCalls = 0;
    const field = Object.defineProperty(
      { ...definition.fields[0] },
      'choices',
      {
        enumerable: true,
        get() {
          getterCalls += 1;
          return [{ value: 'Ada', label: 'Ada' }];
        },
      },
    );
    const current = Object.defineProperty({ name: 'Ada' }, 'choices', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'opaque application data';
      },
    });
    const operation = set(['name'], { kind: 'value', value: 'Ada' }, 'Grace');

    expect(applyOperation(current, operation).success).toBe(true);
    expect(
      applyFormOperation({ fields: [field] } as never, current, operation)
        .success,
    ).toBe(true);
    expect(getterCalls).toBe(0);
  });

  it('rejects undefined set values', () => {
    expect(
      applyOperation({}, set(['name'], { kind: 'missing' }, undefined)),
    ).toMatchObject({
      diagnostics: [{ code: 'INVALID_OPERATION' }],
    });
  });

  it('allows removing a required managed field', () => {
    expect(
      applyFormOperation(definition, { name: 'Ada' }, remove(['name'], 'Ada')),
    ).toMatchObject({ success: true, changed: true, value: {} });
  });

  it('rejects malformed and duplicate definitions', () => {
    expect(
      applyFormOperation(
        { fields: null } as never,
        {},
        set(['name'], { kind: 'missing' }, 'Ada'),
      ),
    ).toMatchObject({
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          parameters: { reason: 'fields-not-array' },
        },
      ],
    });
    const duplicate = {
      fields: [definition.fields[0], definition.fields[0]],
    } as FormDefinition;
    expect(
      applyFormOperation(
        duplicate,
        {},
        set(['name'], { kind: 'missing' }, 'Ada'),
      ),
    ).toMatchObject({
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          parameters: { reason: 'duplicate-field-path' },
        },
      ],
    });
  });

  it('uses Object.is for NaN, zero signs, and opaque identity', () => {
    const object = {};
    expect(
      applyOperation(
        { value: Number.NaN },
        set(['value'], { kind: 'value', value: Number.NaN }, 1),
      ).success,
    ).toBe(true);
    expect(
      applyOperation(
        { value: 0 },
        set(['value'], { kind: 'value', value: -0 }, 1),
      ).success,
    ).toBe(false);
    expect(
      applyOperation(
        { value: object },
        set(['value'], { kind: 'value', value: object }, 1),
      ).success,
    ).toBe(true);
  });

  it('preserves descriptors, symbols, null prototypes, and __proto__ safety', () => {
    const symbol = Symbol('kept');
    const original = Object.create(null) as Record<PropertyKey, unknown>;
    Object.defineProperty(original, 'fixed', {
      value: 1,
      enumerable: false,
      writable: false,
    });
    original[symbol] = { shared: true };
    const result = applyOperation(
      original,
      set(['__proto__'], { kind: 'missing' }, 'safe'),
    );
    expect(result.success).toBe(true);
    expect(Object.getPrototypeOf(result.value)).toBe(null);
    expect(Object.getOwnPropertyDescriptor(result.value, 'fixed')).toEqual(
      Object.getOwnPropertyDescriptor(original, 'fixed'),
    );
    expect(Reflect.get(result.value, symbol)).toBe(
      Reflect.get(original, symbol),
    );
    expect(
      Object.getOwnPropertyDescriptor(result.value, '__proto__')?.value,
    ).toBe('safe');
  });

  it('treats inherited properties as missing', () => {
    const result = applyOperation(
      {},
      set(['toString'], { kind: 'missing' }, 'own'),
    );
    expect(result).toMatchObject({ success: true, value: { toString: 'own' } });
  });

  it('rejects accessors without invoking them', () => {
    let calls = 0;
    const original = Object.defineProperty({}, 'name', {
      get() {
        calls += 1;
        return 'Ada';
      },
      enumerable: true,
    });
    const result = applyOperation(
      original,
      set(['name'], { kind: 'value', value: 'Ada' }, 'Grace'),
    );
    expect(result).toMatchObject({
      diagnostics: [{ code: 'UNSUPPORTED_OPERATION_PROPERTY' }],
    });
    expect(calls).toBe(0);

    const operation = {
      type: 'set-value',
      metadata,
      path: ['name'],
      expected: { kind: 'missing' },
      source: 'user',
    };
    Object.defineProperty(operation, 'value', {
      get() {
        calls += 1;
        return 'Grace';
      },
    });
    expect(applyOperation({}, operation as never)).toMatchObject({
      diagnostics: [
        {
          code: 'INVALID_OPERATION',
          parameters: { reason: 'accessor-member' },
        },
      ],
    });
    expect(calls).toBe(0);
  });

  it('freezes result metadata but never caller values', () => {
    const branch = { mutable: true };
    const original = { branch };
    const result = applyOperation(
      original,
      set(['name'], { kind: 'missing' }, 'Ada'),
    );
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
    expect(Object.isFrozen(result.value)).toBe(false);
    expect(Object.isFrozen(branch)).toBe(false);
  });
});
