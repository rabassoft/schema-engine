import { describe, expect, it, vi } from 'vitest';
import {
  createControlledFormRuntime,
  type ControlledFormRuntimeOptions,
  type FieldDefinition,
  type FormDefinition,
  type FormOperation,
  type ObjectFieldDefinition,
  type ValidationResult,
} from '../src/index.js';

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
    key: '["age"]',
    name: 'age',
    path: ['age'],
    required: false,
    label: 'Age',
    kind: 'number',
    numericType: 'integer',
    constraints: {},
    ui: {},
  },
];
const definition: FormDefinition = {
  nodes: definitionFields,
  fields: definitionFields,
};

const streetField: FieldDefinition = {
  key: '["profile","address","street"]',
  name: 'street',
  path: ['profile', 'address', 'street'],
  required: true,
  label: 'Street',
  kind: 'string',
  constraints: {},
};
const cityField: FieldDefinition = {
  key: '["profile","address","city"]',
  name: 'city',
  path: ['profile', 'address', 'city'],
  required: false,
  label: 'City',
  kind: 'string',
  constraints: {},
};
const addressNode: ObjectFieldDefinition = {
  key: '["profile","address"]',
  name: 'address',
  path: ['profile', 'address'],
  required: true,
  label: 'Address',
  kind: 'object',
  children: [streetField, cityField],
};
const profileNode: ObjectFieldDefinition = {
  key: '["profile"]',
  name: 'profile',
  path: ['profile'],
  required: true,
  label: 'Profile',
  kind: 'object',
  children: [addressNode],
};
const nestedDefinition: FormDefinition = {
  nodes: [profileNode, definitionFields[0] as FieldDefinition],
  fields: [streetField, cityField, definitionFields[0] as FieldDefinition],
};

function nestedRuntime(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
) {
  return runtime({
    definition: nestedDefinition,
    value: { profile: { address: { street: 'Main' } }, name: 'Ada' },
    baselineValue: {
      profile: { address: { street: 'Main' } },
      name: 'Ada',
    },
    ...overrides,
  });
}

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
    expect(snapshot.nodes[0]).toBe(snapshot.fields[0]);
    expect(rt.getNodeSnapshot(['name'])).toBe(rt.getFieldSnapshot(['name']));
    expect(rt.getNodeSnapshot([])).toBeUndefined();
    expect(rt.getNodeSnapshot([0])).toBeUndefined();
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
    const fields = [{ ...definition.fields[0], choices }];
    const manualDefinition = { nodes: fields, fields } as FormDefinition;
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

  it('rejects a non-ordinary manual field without reading inherited choices', () => {
    const field = Object.assign(Object.create({ choices: [] }) as object, {
      ...definition.fields[0],
    });
    const result = createControlledFormRuntime(
      options({ definition: { nodes: [field], fields: [field] } as never }),
    );

    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: { definitionReason: 'invalid-node' },
        },
      ],
    });
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
          definition: { nodes: [field], fields: [field] } as never,
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
              expected: 'valid collection FormDefinition',
              reason: 'invalid-value',
              actualType: 'object',
              definitionReason: 'invalid-node',
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
            expected: 'valid collection FormDefinition',
            reason: 'invalid-value',
            actualType: 'object',
            definitionReason: 'nodes-not-array',
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
        definition: {
          nodes: [choicesAccessor, null],
          fields: [choicesAccessor, null],
        } as never,
      }),
    );

    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          parameters: { expected: 'valid collection FormDefinition' },
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

  it('builds one immutable nested tree with an identity-preserving leaf projection', () => {
    const rt = nestedRuntime();
    const snapshot = rt.getSnapshot();
    const profile = snapshot.nodes[0];
    expect(profile).toMatchObject({
      nodeKind: 'object',
      presence: { kind: 'object' },
      dirty: false,
    });
    if (profile?.nodeKind !== 'object') throw new Error('expected profile');
    const address = profile.children[0];
    if (address?.nodeKind !== 'object') throw new Error('expected address');
    expect(address.children[0]).toBe(snapshot.fields[0]);
    expect(rt.getNodeSnapshot(['profile'])).toBe(profile);
    expect(rt.getNodeSnapshot(['profile', 'address'])).toBe(address);
    expect(rt.getNodeSnapshot(['profile', 'address', 'street'])).toBe(
      snapshot.fields[0],
    );
    expect(rt.getFieldSnapshot(['profile', 'address', 'street'])).toBe(
      snapshot.fields[0],
    );
    expect(rt.getFieldSnapshot(['profile'])).toBeUndefined();
    expect(rt.getNodeSnapshot(['unmanaged'])).toBeUndefined();
    expect(rt.getNodeSnapshot(null as never)).toBeUndefined();
    expect(rt.getNodeSnapshot([0])).toBeUndefined();
    expect(rt.getNodeSnapshot([])).toBeUndefined();
    expect(Object.isFrozen(profile.children)).toBe(true);
    expect(Object.isFrozen(address.presence)).toBe(true);
  });

  it.each([
    [{}, {}, 'missing', false],
    [{ empty: {} }, {}, 'object', true],
    [{}, { empty: {} }, 'missing', true],
    [{ empty: {} }, { empty: {} }, 'object', false],
  ] as const)(
    'models zero-leaf object value %j against baseline %j',
    (value, baselineValue, presence, dirty) => {
      const empty: ObjectFieldDefinition = {
        key: '["empty"]',
        name: 'empty',
        path: ['empty'],
        required: false,
        label: 'Empty',
        kind: 'object',
        children: [],
      };
      const rt = runtime({
        definition: { nodes: [empty], fields: [] },
        value,
        baselineValue,
      });

      expect(rt.getNodeSnapshot(['empty'])).toMatchObject({
        nodeKind: 'object',
        presence: { kind: presence },
        dirty,
        children: [],
      });
      expect(rt.getSnapshot()).toMatchObject({ dirty, fields: [] });
    },
  );

  it('models missing ancestors while allowing deep set and interaction', () => {
    const rt = nestedRuntime({ value: { name: 'Ada' } });
    const emitted: FormOperation[] = [];
    rt.subscribeOperations((operation) => emitted.push(operation));
    expect(rt.getNodeSnapshot(['profile'])).toMatchObject({
      presence: { kind: 'missing' },
      dirty: true,
    });
    expect(rt.getFieldSnapshot(['profile', 'address', 'street'])).toMatchObject(
      {
        presence: {
          kind: 'blocked',
          reason: 'missing-ancestor',
          at: ['profile'],
        },
        dirty: false,
      },
    );
    expect(
      rt.requestSetValue(['profile', 'address', 'street'], 'New'),
    ).toMatchObject({ success: true, effects: { operationEmitted: true } });
    expect(emitted[0]).toMatchObject({
      path: ['profile', 'address', 'street'],
      expected: { kind: 'missing' },
    });
    expect(
      rt.requestRemoveValue(['profile', 'address', 'street']),
    ).toMatchObject({ success: true, effects: { operationEmitted: false } });
    expect(rt.focus(['profile', 'address', 'street']).success).toBe(true);
    expect(rt.blur(['profile', 'address', 'street']).success).toBe(true);
    expect(rt.getFieldSnapshot(['profile', 'address', 'street'])?.touched).toBe(
      true,
    );
  });

  it('rejects every leaf action below an incompatible ancestor', () => {
    const rt = nestedRuntime({ value: { profile: 42, name: 'Ada' } });
    const actions = [
      rt.requestSetValue(['profile', 'address', 'street'], 'New'),
      rt.requestRemoveValue(['profile', 'address', 'street']),
      rt.focus(['profile', 'address', 'street']),
      rt.blur(['profile', 'address', 'street']),
    ];
    expect(rt.getNodeSnapshot(['profile'])).toMatchObject({
      presence: { kind: 'incompatible', value: 42 },
    });
    for (const result of actions) {
      expect(result).toMatchObject({
        success: false,
        effects: { snapshotChanged: false, operationEmitted: false },
        diagnostics: [
          {
            code: 'INCOMPATIBLE_RUNTIME_ANCESTOR',
            dataPath: ['profile', 'address', 'street'],
            parameters: {
              reason: 'incompatible-ancestor',
              blockingPath: ['profile'],
              actualType: 'number',
            },
          },
        ],
      });
      expect(Object.isFrozen(result.diagnostics[0]?.dataPath)).toBe(true);
      expect(
        Object.isFrozen(result.diagnostics[0]?.parameters.blockingPath),
      ).toBe(true);
    }
  });

  it('rejects actions below a class-instance ancestor without retaining it', () => {
    class ProfileModel {}
    const profile = new ProfileModel();
    const rt = nestedRuntime({ value: { profile, name: 'Ada' } });
    const result = rt.requestSetValue(['profile', 'address', 'street'], 'New');

    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_RUNTIME_ANCESTOR',
          parameters: {
            blockingPath: ['profile'],
            actualType: 'object',
          },
        },
      ],
    });
    expect(
      result.diagnostics.some(
        ({ parameters }) =>
          parameters === profile || Object.values(parameters).includes(profile),
      ),
    ).toBe(false);
  });

  it('rejects managed accessors before validation and rolls updates back atomically', () => {
    let getterCalls = 0;
    const validate = vi.fn(() => ({ valid: true, issues: [] }));
    const initial = Object.defineProperty({ name: 'Ada' }, 'profile', {
      get() {
        getterCalls += 1;
        return {};
      },
    });
    const failed = createControlledFormRuntime(
      options({
        definition: nestedDefinition,
        value: initial,
        baselineValue: {},
        validator: { validate },
      }),
    );
    expect(failed).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          dataPath: ['profile'],
          parameters: {
            member: 'value',
            expected: 'ordinary data tree at managed paths',
            propertyReason: 'accessor',
          },
        },
      ],
    });
    expect(validate).not.toHaveBeenCalled();
    expect(getterCalls).toBe(0);

    const rt = nestedRuntime({ validator: { validate } });
    const before = rt.getSnapshot();
    const address = Object.defineProperty({}, 'street', {
      get() {
        getterCalls += 1;
        return 'Hidden';
      },
    });
    expect(
      rt.updateExternalState({ value: { profile: { address }, name: 'Ada' } }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_EXTERNAL_STATE_UPDATE',
          dataPath: ['profile', 'address', 'street'],
        },
      ],
    });
    expect(rt.getSnapshot()).toBe(before);
    expect(validate).toHaveBeenCalledTimes(1);
    expect(getterCalls).toBe(0);
  });

  it('assigns nested issues and expands object scopes', () => {
    const issues = [
      { code: 'profile', path: ['profile'], parameters: {} },
      {
        code: 'address-child',
        path: ['profile', 'address', 'postalCode'],
        parameters: {},
      },
      {
        code: 'street',
        path: ['profile', 'address', 'street'],
        parameters: {},
      },
      { code: 'unmanaged', path: ['other'], parameters: {} },
    ];
    const rt = nestedRuntime({
      validator: { validate: () => ({ valid: false, issues }) },
    });
    expect(
      rt.getNodeSnapshot(['profile'])?.issues.map((issue) => issue.code),
    ).toEqual(['profile']);
    expect(
      rt
        .getNodeSnapshot(['profile', 'address'])
        ?.issues.map((issue) => issue.code),
    ).toEqual(['address-child']);
    expect(rt.getSnapshot().globalIssues.map((issue) => issue.code)).toEqual([
      'unmanaged',
    ]);
    const scope = { id: 'profile', paths: [['profile']] as const };
    expect(
      rt.getValidationSnapshot(scope).issues.map((issue) => issue.code),
    ).toEqual(['profile', 'address-child', 'street']);
    expect(rt.showValidationErrors(scope).success).toBe(true);
    expect(rt.getNodeSnapshot(['profile'])?.showIssues).toBe(true);
    expect(
      rt.getFieldSnapshot(['profile', 'address', 'street'])?.showIssues,
    ).toBe(true);
    rt.focus(['profile', 'address', 'street']);
    rt.blur(['profile', 'address', 'street']);
    expect(rt.resetTouched(scope).success).toBe(true);
    expect(rt.getFieldSnapshot(['profile', 'address', 'street'])?.touched).toBe(
      false,
    );
  });

  it('reuses unaffected nested snapshots and clears incompatible focus without touching', () => {
    const rt = nestedRuntime();
    const profile = rt.getNodeSnapshot(['profile']);
    const street = rt.getFieldSnapshot(['profile', 'address', 'street']);
    rt.updateExternalState({
      value: { profile: { address: { street: 'Main' } }, name: 'Grace' },
    });
    expect(rt.getNodeSnapshot(['profile'])).toBe(profile);
    expect(rt.getFieldSnapshot(['profile', 'address', 'street'])).toBe(street);

    rt.focus(['profile', 'address', 'street']);
    rt.updateExternalState({ baselineValue: { profile: null, name: 'Ada' } });
    expect(rt.getFieldSnapshot(['profile', 'address', 'street'])?.focused).toBe(
      true,
    );
    expect(
      rt.updateExternalState({ value: { profile: null, name: 'Grace' } }),
    ).toMatchObject({ success: true });
    expect(rt.getFieldSnapshot(['profile', 'address', 'street'])).toMatchObject(
      {
        focused: false,
        touched: false,
        presence: { reason: 'incompatible-ancestor' },
      },
    );
  });

  it('rebuilds a validated sibling while retaining an unchanged third subtree', () => {
    const validator = {
      validate: (_schema: unknown, value: unknown): ValidationResult => {
        const street = (
          value as { profile?: { address?: { street?: unknown } } }
        ).profile?.address?.street;
        return street === 'Side'
          ? {
              valid: false,
              issues: [
                {
                  code: 'city-for-street',
                  path: ['profile', 'address', 'city'],
                  parameters: {},
                },
              ],
            }
          : { valid: true, issues: [] };
      },
    };
    const rt = nestedRuntime({ validator });
    const street = rt.getFieldSnapshot(['profile', 'address', 'street']);
    const city = rt.getFieldSnapshot(['profile', 'address', 'city']);
    const name = rt.getFieldSnapshot(['name']);

    expect(
      rt.updateExternalState({
        value: { profile: { address: { street: 'Side' } }, name: 'Ada' },
      }),
    ).toMatchObject({ success: true });
    expect(rt.getFieldSnapshot(['profile', 'address', 'street'])).not.toBe(
      street,
    );
    expect(rt.getFieldSnapshot(['profile', 'address', 'city'])).not.toBe(city);
    expect(
      rt
        .getFieldSnapshot(['profile', 'address', 'city'])
        ?.issues.map(({ code }) => code),
    ).toEqual(['city-for-street']);
    expect(rt.getFieldSnapshot(['name'])).toBe(name);
  });

  it('constructs and queries a finite deeply nested runtime iteratively', () => {
    const depth = 1_000;
    const path = Array.from({ length: depth }, (_, index) => `n${index}`);
    const leaf: FieldDefinition = {
      key: JSON.stringify([...path, 'value']),
      name: 'value',
      path: [...path, 'value'],
      required: false,
      label: 'Value',
      kind: 'string',
      constraints: {},
    };
    let node: ObjectFieldDefinition | FieldDefinition = leaf;
    for (let index = depth - 1; index >= 0; index -= 1) {
      const nodePath = path.slice(0, index + 1);
      node = {
        key: JSON.stringify(nodePath),
        name: nodePath[index] as string,
        path: nodePath,
        required: false,
        label: `Node ${index}`,
        kind: 'object',
        children: [node],
      };
    }
    const result = createControlledFormRuntime(
      options({
        definition: { nodes: [node], fields: [leaf] },
        value: {},
        baselineValue: {},
      }),
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.runtime.getFieldSnapshot([...path, 'value'])).toMatchObject({
      presence: {
        kind: 'blocked',
        reason: 'missing-ancestor',
        at: ['n0'],
      },
    });
  });
});
