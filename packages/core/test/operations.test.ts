import { describe, expect, it } from 'vitest';
import {
  applyFormOperation,
  applyOperation,
  type FormDefinition,
  type FormOperation,
} from '../src/index.js';
import { withDefaultPresentation } from './definition-fixtures.js';

const metadata = { id: 1, formId: 'form' } as const;
const definitionFields: FormDefinition['fields'] = [
  {
    key: '["name"]',
    name: 'name',
    path: ['name'],
    required: true,
    label: 'Name',
    kind: 'string',
    constraints: {},
  },
  {
    key: '["amount"]',
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
    key: '["count"]',
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
    key: '["active"]',
    name: 'active',
    path: ['active'],
    required: false,
    label: 'Active',
    kind: 'boolean',
  },
];
const definition: FormDefinition = withDefaultPresentation({
  nodes: definitionFields,
  fields: definitionFields,
});

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
      applyFormOperation(
        { nodes: [field], fields: [field] } as never,
        current,
        operation,
      ).success,
    ).toBe(false);
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
    const duplicateFields = [definition.fields[0], definition.fields[0]];
    const duplicate = withDefaultPresentation({
      nodes: duplicateFields,
      fields: duplicateFields,
    }) as unknown as FormDefinition;
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

describe('deep immutable operations', () => {
  const street = {
    key: '["profile","address","street"]',
    name: 'street',
    path: ['profile', 'address', 'street'],
    required: true,
    label: 'Street',
    kind: 'string',
    constraints: {},
  } as const;
  const address = {
    key: '["profile","address"]',
    name: 'address',
    path: ['profile', 'address'],
    required: false,
    label: 'Address',
    kind: 'object',
    children: [street],
  } as const;
  const profile = {
    key: '["profile"]',
    name: 'profile',
    path: ['profile'],
    required: false,
    label: 'Profile',
    kind: 'object',
    children: [address],
  } as const;
  const nestedDefinition: FormDefinition = withDefaultPresentation({
    nodes: [profile],
    fields: [street],
  });

  it('materializes missing ancestors and resolves exact managed leaves', () => {
    const result = applyFormOperation(
      nestedDefinition,
      {},
      set(['profile', 'address', 'street'], { kind: 'missing' }, 'Main'),
    );
    expect(result).toMatchObject({
      success: true,
      changed: true,
      value: { profile: { address: { street: 'Main' } } },
    });
    expect(
      Object.getOwnPropertyDescriptor(
        (result.value as { profile: { address: object } }).profile,
        'address',
      ),
    ).toMatchObject({ writable: true, enumerable: true, configurable: true });

    expect(
      applyFormOperation(
        nestedDefinition,
        {},
        set(['profile', 'address'], { kind: 'missing' }, {}),
      ),
    ).toMatchObject({
      diagnostics: [
        {
          code: 'INVALID_OPERATION_PATH',
          parameters: { reason: 'object-target-not-supported', pathLength: 2 },
        },
      ],
    });
  });

  it('reports nested-definition defects before membership or data inspection', () => {
    const cyclic = { ...profile, children: [] as unknown[] };
    cyclic.children.push(cyclic);
    const result = applyFormOperation(
      {
        nodes: [cyclic],
        fields: [],
        presentation: [{ kind: 'form-node', node: cyclic }],
      } as never,
      Object.defineProperty({}, 'profile', {
        get() {
          throw new Error('must not inspect data after definition failure');
        },
      }),
      set(['profile', 'address', 'street'], { kind: 'missing' }, 'Main'),
    );
    expect(result).toMatchObject({
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          dataPath: ['profile', 'address', 'street'],
          parameters: {
            reason: 'cyclic-node',
            nodeIndexPath: [0, 0],
            firstNodeIndexPath: [0],
          },
          fallbackMessage: 'Form definition is invalid.',
        },
      ],
    });

    const independent = applyFormOperation(
      { nodes: [null, 1], fields: [], presentation: [] } as never,
      {},
      set(['profile', 'address', 'street'], { kind: 'missing' }, 'Main'),
    );
    expect(
      independent.diagnostics.map(({ parameters }) => parameters),
    ).toMatchObject([
      { reason: 'invalid-node', nodeIndexPath: [0] },
      { reason: 'invalid-node', nodeIndexPath: [1] },
    ]);
  });

  it('reports the exact invalid deep segment without retaining its value', () => {
    const opaque = {};
    const result = applyOperation(
      {},
      set(['profile', opaque as never], { kind: 'missing' }, 'Main'),
    );
    expect(result).toMatchObject({
      diagnostics: [
        {
          code: 'INVALID_OPERATION_PATH',
          parameters: {
            reason: 'non-string-segment',
            pathLength: 2,
            segmentIndex: 1,
            actualType: 'object',
          },
        },
      ],
    });
    expect(
      result.diagnostics[0]?.parameters === opaque ||
        Object.values(result.diagnostics[0]?.parameters ?? {}).includes(opaque),
    ).toBe(false);
  });

  it('clones only the changed chain and preserves compatible concurrent branches', () => {
    const untouched = { identity: true };
    const addressValue = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(addressValue, 'street', {
      value: 'Main',
      enumerable: false,
      configurable: false,
      writable: false,
    });
    addressValue.concurrent = untouched;
    const profileValue = { address: addressValue, sibling: untouched };
    const original = { profile: profileValue, rootSibling: untouched };
    const result = applyOperation(
      original,
      set(
        ['profile', 'address', 'street'],
        { kind: 'value', value: 'Main' },
        'Side',
      ),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    const nextProfile = result.value.profile;
    const nextAddress = nextProfile.address;
    expect(result.value).not.toBe(original);
    expect(nextProfile).not.toBe(profileValue);
    expect(nextAddress).not.toBe(addressValue);
    expect(Object.getPrototypeOf(nextAddress)).toBe(null);
    expect(nextAddress.concurrent).toBe(untouched);
    expect(nextProfile.sibling).toBe(untouched);
    expect(result.value.rootSibling).toBe(untouched);
    expect(Object.getOwnPropertyDescriptor(nextAddress, 'street')).toEqual({
      value: 'Side',
      enumerable: true,
      configurable: true,
      writable: true,
    });
  });

  it('removes a terminal without pruning ancestors', () => {
    const original = {
      profile: { address: { street: 'Main' }, sibling: { retained: true } },
    };
    const result = applyOperation(
      original,
      remove(['profile', 'address', 'street'], 'Main'),
    );
    expect(result).toMatchObject({
      success: true,
      changed: true,
      value: { profile: { address: {}, sibling: { retained: true } } },
    });
    expect(result.value.profile.sibling).toBe(original.profile.sibling);
  });

  it.each([
    [null, 'null'],
    [[], 'array'],
    [1, 'number'],
    [new (class Model {})(), 'object'],
  ])(
    'rejects incompatible ancestor %j atomically',
    (ancestor, expectedType) => {
      const original = { profile: ancestor };
      const result = applyOperation(
        original,
        set(['profile', 'street'], { kind: 'missing' }, 'Main'),
      );
      expect(result).toMatchObject({
        success: false,
        value: original,
        diagnostics: [
          {
            code: 'INCOMPATIBLE_OPERATION_ANCESTOR',
            dataPath: ['profile'],
            parameters: {
              reason: 'non-object-ancestor',
              actualType: expectedType,
            },
          },
        ],
      });
      expect(result.value).toBe(original);
    },
  );

  it('rejects ancestor and terminal accessors without invoking them', () => {
    let calls = 0;
    const ancestor = Object.defineProperty({}, 'profile', {
      enumerable: true,
      get() {
        calls += 1;
        return {};
      },
    });
    const terminal = {
      profile: Object.defineProperty({}, 'street', {
        enumerable: true,
        get() {
          calls += 1;
          return 'Main';
        },
      }),
    };
    expect(
      applyOperation(
        ancestor,
        set(['profile', 'street'], { kind: 'missing' }, 'Main'),
      ),
    ).toMatchObject({
      diagnostics: [
        { code: 'UNSUPPORTED_OPERATION_PROPERTY', dataPath: ['profile'] },
      ],
    });
    expect(
      applyOperation(
        terminal,
        set(['profile', 'street'], { kind: 'value', value: 'Main' }, 'Side'),
      ),
    ).toMatchObject({
      diagnostics: [
        {
          code: 'UNSUPPORTED_OPERATION_PROPERTY',
          dataPath: ['profile', 'street'],
        },
      ],
    });
    expect(calls).toBe(0);
  });

  it('supports finite deep paths without recursion', () => {
    const path = Array.from({ length: 1_500 }, (_, index) => `p${index}`);
    const result = applyOperation(
      {},
      set(path, { kind: 'missing' }, 'terminal'),
    );
    expect(result.success).toBe(true);
    let current: unknown = result.value;
    for (const segment of path) {
      expect(typeof current).toBe('object');
      current = (current as Record<string, unknown>)[segment];
    }
    expect(current).toBe('terminal');
  });
});
