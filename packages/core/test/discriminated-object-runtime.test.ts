import { describe, expect, it, vi } from 'vitest';
import {
  applyFormOperation,
  applyOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  deriveSchemaDefaultCandidate,
  type ControlledFormRuntimeOptions,
  type FormDefinition,
  type FormOperation,
  type OperationExpectation,
} from '../src/index.js';

const metadata = { id: 1, formId: 'm33' } as const;

function schema(): Record<string, unknown> {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      pet: {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['cat', 'dog'] },
          name: { type: 'string' },
        },
        required: ['kind'],
        oneOf: [
          {
            type: 'object',
            properties: {
              kind: { type: 'string', const: 'cat' },
              lives: { type: 'integer' },
              catInfo: {
                type: 'object',
                properties: { indoor: { type: 'boolean' } },
              },
            },
            required: ['kind', 'lives'],
          },
          {
            type: 'object',
            properties: {
              kind: { type: 'string', const: 'dog' },
              barkVolume: { type: 'number' },
            },
            required: ['kind'],
          },
        ],
      },
    },
  };
}

function definition(): FormDefinition {
  const result = compileFormDefinition({ schema: schema() });
  expect(result.success).toBe(true);
  if (!result.success) throw new Error('M33 fixture did not compile');
  return result.definition;
}

function options(
  overrides: Partial<
    ControlledFormRuntimeOptions<Record<string, unknown>>
  > = {},
): ControlledFormRuntimeOptions<Record<string, unknown>> {
  return {
    formId: 'm33',
    definition: definition(),
    schema: schema(),
    value: {
      pet: {
        kind: 'cat',
        name: 'Milo',
        lives: 9,
        catInfo: { indoor: true },
        barkVolume: 4,
      },
    },
    baselineValue: {
      pet: {
        kind: 'cat',
        name: 'Milo',
        lives: 9,
        catInfo: { indoor: true },
        barkVolume: 2,
      },
    },
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
  if (!result.success) throw new Error('M33 runtime creation failed');
  return result.runtime;
}

function setValue(
  path: readonly string[],
  expected: OperationExpectation,
  value: unknown,
): FormOperation {
  return {
    type: 'set-value',
    metadata,
    path,
    expected,
    value,
    source: 'user',
  };
}

describe('controlled discriminated object runtime', () => {
  it('projects common plus active children and reuses exact leaf snapshots', () => {
    const rt = runtime();
    const snapshot = rt.getSnapshot();
    const pet = snapshot.nodes[0];
    expect(pet).toMatchObject({
      nodeKind: 'discriminated-object',
      selection: { kind: 'active', discriminatorValue: 'cat' },
    });
    if (pet?.nodeKind !== 'discriminated-object') return;
    expect(pet.children.map(({ path }) => path.at(-1))).toEqual([
      'kind',
      'name',
      'lives',
      'catInfo',
    ]);
    expect(snapshot.fields.map(({ path }) => path.join('.'))).toEqual([
      'pet.kind',
      'pet.name',
      'pet.lives',
      'pet.catInfo.indoor',
    ]);
    expect(rt.getFieldSnapshot(['pet', 'barkVolume'])).toBeUndefined();
    expect(rt.getNodeSnapshot(['pet', 'catInfo'])).toBe(pet.children[3]);
    expect(rt.getFieldSnapshot(['pet', 'lives'])).toBe(snapshot.fields[2]);
    expect(pet.dirty).toBe(false);
    expect(Object.isFrozen(pet.selection)).toBe(true);
  });

  it.each([
    ['missing', { pet: { name: 'Milo', lives: 9 } }],
    ['wrong kind', { pet: { kind: 1, name: 'Milo', lives: 9 } }],
    ['unknown', { pet: { kind: 'bird', name: 'Milo', lives: 9 } }],
  ])('uses none selection for %s discriminator data', (_label, value) => {
    const rt = runtime({ value });
    const pet = rt.getSnapshot().nodes[0];
    expect(pet).toMatchObject({
      nodeKind: 'discriminated-object',
      selection: { kind: 'none' },
    });
    if (pet?.nodeKind !== 'discriminated-object') return;
    expect(pet.children.map(({ path }) => path.at(-1))).toEqual([
      'kind',
      'name',
    ]);
    expect(rt.getFieldSnapshot(['pet', 'lives'])).toBeUndefined();
  });

  it('waits for discriminator confirmation and restores dormant value and baseline data', () => {
    const rt = runtime();
    const operations: FormOperation[] = [];
    rt.subscribeOperations((operation) => operations.push(operation));
    const before = rt.getSnapshot();
    const commonName = rt.getFieldSnapshot(['pet', 'name']);

    expect(rt.requestSetValue(['pet', 'kind'], 'dog')).toMatchObject({
      success: true,
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(rt.getSnapshot()).toBe(before);
    expect(operations).toHaveLength(1);
    expect(operations[0]).toMatchObject({
      type: 'set-value',
      path: ['pet', 'kind'],
      expected: { kind: 'value', value: 'cat' },
      value: 'dog',
    });

    const dogValue = applyFormOperation(
      definition(),
      options().value,
      operations[0] as FormOperation,
    );
    expect(dogValue.success).toBe(true);
    if (!dogValue.success) return;
    rt.updateExternalState({ value: dogValue.value });
    expect(operations).toHaveLength(1);
    expect(rt.getSnapshot().fields.map(({ path }) => path.at(-1))).toEqual([
      'kind',
      'name',
      'barkVolume',
    ]);
    expect(rt.getFieldSnapshot(['pet', 'barkVolume'])).toMatchObject({
      dirty: true,
      presence: { kind: 'value', value: 4 },
    });
    expect(rt.getFieldSnapshot(['pet', 'name'])).toBe(commonName);

    const catValue = {
      pet: { ...(dogValue.value.pet as object), kind: 'cat' },
    };
    rt.updateExternalState({ value: catValue });
    expect(rt.getFieldSnapshot(['pet', 'lives'])).toMatchObject({
      presence: { kind: 'value', value: 9 },
      dirty: false,
    });
  });

  it('preserves inactive touched state, clears deactivated focus, and emits one update snapshot', () => {
    const rt = runtime();
    expect(rt.focus(['pet', 'lives']).success).toBe(true);
    expect(rt.blur(['pet', 'lives']).success).toBe(true);
    expect(rt.getFieldSnapshot(['pet', 'lives'])?.touched).toBe(true);
    expect(rt.focus(['pet', 'lives']).success).toBe(true);
    const listener = vi.fn();
    rt.subscribe(listener);

    rt.updateExternalState({
      value: { ...(options().value as object), pet: { kind: 'dog' } },
    });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(rt.getFieldSnapshot(['pet', 'lives'])).toBeUndefined();
    expect(rt.getSnapshot().nodes[0]).toMatchObject({ focused: false });

    rt.updateExternalState({
      value: { ...(options().value as object), pet: { kind: 'cat', lives: 9 } },
    });
    expect(rt.getFieldSnapshot(['pet', 'lives'])).toMatchObject({
      touched: true,
      focused: false,
    });
  });

  it('clears deactivated focus without touching the dormant field and ignores baseline for selection', () => {
    const rt = runtime();
    expect(rt.focus(['pet', 'lives']).success).toBe(true);
    rt.updateExternalState({
      value: { pet: { kind: 'dog', barkVolume: 4 } },
    });
    expect(rt.getFieldSnapshot(['pet', 'lives'])).toBeUndefined();

    rt.updateExternalState({
      baselineValue: { pet: { kind: 'cat', lives: 1 } },
    });
    expect(rt.getSnapshot().nodes[0]).toMatchObject({
      selection: { kind: 'active', discriminatorValue: 'dog' },
    });

    rt.updateExternalState({ value: { pet: { kind: 'cat', lives: 9 } } });
    expect(rt.getFieldSnapshot(['pet', 'lives'])).toMatchObject({
      focused: false,
      touched: false,
      dirty: true,
    });
  });

  it.each([
    [
      'requestSetValue',
      (rt: ReturnType<typeof runtime>) =>
        rt.requestSetValue(['pet', 'barkVolume'], 'bad'),
    ],
    [
      'requestRemoveValue',
      (rt: ReturnType<typeof runtime>) =>
        rt.requestRemoveValue(['pet', 'barkVolume']),
    ],
    [
      'focus',
      (rt: ReturnType<typeof runtime>) => rt.focus(['pet', 'barkVolume']),
    ],
    [
      'blur',
      (rt: ReturnType<typeof runtime>) => rt.blur(['pet', 'barkVolume']),
    ],
  ] as const)(
    'rejects inactive %s before other field behavior',
    (action, invoke) => {
      const rt = runtime();
      const operations = vi.fn();
      const snapshots = vi.fn();
      rt.subscribeOperations(operations);
      rt.subscribe(snapshots);
      const result = invoke(rt);
      expect(result).toMatchObject({
        success: false,
        effects: { operationEmitted: false, snapshotChanged: false },
        diagnostics: [
          {
            code: 'INACTIVE_OBJECT_ALTERNATIVE_TARGET',
            severity: 'error',
            source: 'runtime',
            dataPath: ['pet', 'barkVolume'],
            parameters: {
              action,
              ownerPath: ['pet'],
              discriminatorPath: ['pet', 'kind'],
              requiredAlternativeIndex: 1,
              selection: 'different',
              activeAlternativeIndex: 0,
            },
            fallbackMessage:
              'Runtime target belongs to an inactive object alternative.',
          },
        ],
      });
      expect(operations).not.toHaveBeenCalled();
      expect(snapshots).not.toHaveBeenCalled();
      const diagnostic = result.diagnostics[0];
      expect(Object.isFrozen(diagnostic?.dataPath)).toBe(true);
      expect(Object.isFrozen(diagnostic?.parameters.ownerPath)).toBe(true);
      expect(Object.isFrozen(diagnostic?.parameters.discriminatorPath)).toBe(
        true,
      );
    },
  );

  it('distinguishes none and different selection when applying form operations', () => {
    const operation = setValue(
      ['pet', 'barkVolume'],
      { kind: 'value', value: 4 },
      5,
    );
    const current = options().value;
    const different = applyFormOperation(definition(), current, operation);
    expect(different).toMatchObject({
      success: false,
      value: current,
      changed: false,
      diagnostics: [
        {
          code: 'INACTIVE_OBJECT_ALTERNATIVE_TARGET',
          parameters: {
            action: 'applyFormOperation',
            ownerPath: ['pet'],
            discriminatorPath: ['pet', 'kind'],
            requiredAlternativeIndex: 1,
            selection: 'different',
            activeAlternativeIndex: 0,
          },
        },
      ],
    });

    const noneValue = { pet: { barkVolume: 4 } };
    const none = applyFormOperation(definition(), noneValue, operation);
    expect(none).toMatchObject({
      success: false,
      value: noneValue,
      diagnostics: [
        {
          parameters: {
            action: 'applyFormOperation',
            requiredAlternativeIndex: 1,
            selection: 'none',
          },
        },
      ],
    });
    expect(
      none.success ? [] : Object.keys(none.diagnostics[0]?.parameters ?? {}),
    ).not.toContain('activeAlternativeIndex');

    const unchanged = applyOperation(current, operation);
    expect(unchanged.success).toBe(true);
  });

  it('reports the first manual M33 definition defect without invoking validation or effects', () => {
    const cases = [
      {
        mutate: (manual: FormDefinition) => {
          const owner = manual.nodes[0] as unknown as Record<string, unknown>;
          delete owner.discriminator;
        },
        expected: {
          definitionReason: 'invalid-discriminated-object',
          nodeIndexPath: [0],
          definitionMember: 'discriminator',
        },
      },
      {
        mutate: (manual: FormDefinition) => {
          const owner = manual.nodes[0] as unknown as {
            alternatives: Array<Record<string, unknown>>;
          };
          delete owner.alternatives[0]?.discriminatorValue;
        },
        expected: {
          definitionReason: 'invalid-object-alternative',
          nodeIndexPath: [0],
          alternativeIndex: 0,
          definitionMember: 'discriminatorValue',
        },
      },
      {
        mutate: (manual: FormDefinition) => {
          const owner = manual.nodes[0] as unknown as {
            alternatives: Array<{ children: string[] }>;
          };
          (owner.alternatives[0] as { children: string[] }).children = [
            'catInfo',
            'lives',
          ];
        },
        expected: {
          definitionReason: 'invalid-object-alternative',
          nodeIndexPath: [0],
          alternativeIndex: 0,
          childIndex: 1,
          definitionMember: 'children',
        },
      },
      {
        mutate: (manual: FormDefinition) => {
          (manual as unknown as { fields: unknown[] }).fields.pop();
        },
        expected: {
          definitionReason: 'inconsistent-alternative-projection',
          definitionMember: 'fields',
        },
      },
    ];

    for (const { mutate, expected } of cases) {
      const manual = structuredClone(definition());
      mutate(manual);
      const validate = vi.fn(() => ({ valid: true, issues: [] }));
      const created = createControlledFormRuntime({
        ...options(),
        definition: manual,
        validator: { validate },
      });
      expect(created).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INVALID_RUNTIME_OPTIONS',
            parameters: expected,
          },
        ],
      });
      expect(validate).not.toHaveBeenCalled();

      const applied = applyFormOperation(
        manual,
        options().value,
        setValue(['pet', 'kind'], { kind: 'value', value: 'cat' }, 'dog'),
      );
      expect(applied).toMatchObject({
        success: false,
        changed: false,
        diagnostics: [
          {
            code: 'INVALID_FORM_DEFINITION',
            parameters: {
              reason: expected.definitionReason,
              ...(expected.nodeIndexPath === undefined
                ? {}
                : { nodeIndexPath: expected.nodeIndexPath }),
              ...(expected.alternativeIndex === undefined
                ? {}
                : { alternativeIndex: expected.alternativeIndex }),
              ...(expected.childIndex === undefined
                ? {}
                : { childIndex: expected.childIndex }),
            },
          },
        ],
      });
    }
  });

  it('uses the accepted manual inspection order before dependent child-list checks', () => {
    const manual = structuredClone(definition());
    const owner = manual.nodes[0] as unknown as {
      alternatives: Array<{
        discriminatorValue: string;
        children: string[];
      }>;
    };
    (
      owner.alternatives[0] as { discriminatorValue: string }
    ).discriminatorValue = 'dog';
    (owner.alternatives[0] as { children: string[] }).children = ['missing'];
    const result = createControlledFormRuntime({
      ...options(),
      definition: manual,
    });
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            definitionReason: 'inconsistent-alternative-projection',
            nodeIndexPath: [0],
            alternativeIndex: 0,
            definitionMember: 'discriminatorValue',
          },
        },
      ],
    });
  });

  it('rejects accessors in active or dormant managed paths atomically', () => {
    const getter = vi.fn(() => 4);
    const pet = Object.defineProperty({ kind: 'cat' }, 'barkVolume', {
      enumerable: true,
      get: getter,
    });
    const validate = vi.fn(() => ({ valid: true, issues: [] }));
    const result = createControlledFormRuntime({
      ...options(),
      value: { pet },
      validator: { validate },
    });
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          dataPath: ['pet', 'barkVolume'],
        },
      ],
    });
    expect(getter).not.toHaveBeenCalled();
    expect(validate).not.toHaveBeenCalled();
  });

  it('keeps accessor rejection ahead of alternative activity in form application', () => {
    const getter = vi.fn(() => 'cat');
    const pet = Object.defineProperty({ barkVolume: 4 }, 'kind', {
      enumerable: true,
      get: getter,
    });
    const current = { pet };
    const result = applyFormOperation(
      definition(),
      current,
      setValue(['pet', 'barkVolume'], { kind: 'value', value: 4 }, 5),
    );
    expect(getter).not.toHaveBeenCalled();
    expect(result.value).toBe(current);
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'UNSUPPORTED_OPERATION_PROPERTY',
          dataPath: ['pet', 'kind'],
          parameters: { property: 'kind', reason: 'accessor-property' },
        },
      ],
    });
  });

  it('keeps original validator inputs and assigns inactive and oneOf issues to the owner', () => {
    const originalSchema = schema();
    const originalValue = options().value;
    const issues = [
      { code: 'active', path: ['pet', 'lives'], parameters: {} },
      { code: 'inactive', path: ['pet', 'barkVolume'], parameters: {} },
      { code: 'discriminator', path: ['pet', 'kind'], parameters: {} },
      { code: 'owner', path: ['pet'], parameters: {} },
      { code: 'oneof', path: ['pet', 'oneOf'], parameters: {} },
    ];
    const validate = vi.fn(() => ({ valid: false, issues }));
    const created = createControlledFormRuntime({
      ...options(),
      schema: originalSchema,
      value: originalValue,
      validator: { validate },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(validate).toHaveBeenCalledWith(originalSchema, originalValue);

    const full = created.runtime.getValidationSnapshot();
    const pet = created.runtime.getNodeSnapshot(['pet']);
    const lives = created.runtime.getFieldSnapshot(['pet', 'lives']);
    const kind = created.runtime.getFieldSnapshot(['pet', 'kind']);
    expect(pet).toMatchObject({
      nodeKind: 'discriminated-object',
      valid: false,
    });
    expect(pet?.issues.map(({ code }) => code)).toEqual([
      'inactive',
      'owner',
      'oneof',
    ]);
    expect(pet?.issues[0]).toBe(full.issues[1]);
    expect(pet?.issues[0]?.path).toEqual(['pet', 'barkVolume']);
    expect(Object.isFrozen(pet?.issues[0]?.path)).toBe(true);
    expect(lives?.issues.map(({ code }) => code)).toEqual(['active']);
    expect(kind?.issues.map(({ code }) => code)).toEqual(['discriminator']);
    expect(created.runtime.getSnapshot().valid).toBe(false);
  });

  it('keeps static inactive paths scope-known while owner scopes use the active tree', () => {
    const issues = [
      { code: 'active', path: ['pet', 'lives'], parameters: {} },
      { code: 'inactive', path: ['pet', 'barkVolume'], parameters: {} },
      { code: 'common', path: ['pet', 'name'], parameters: {} },
    ];
    const rt = runtime({
      validator: { validate: () => ({ valid: false, issues }) },
    });
    const inactive = rt.getValidationSnapshot({
      id: 'inactive',
      paths: [['pet', 'barkVolume']],
    });
    expect(inactive).toMatchObject({
      valid: true,
      issues: [],
      diagnostics: [],
    });
    const owner = rt.getValidationSnapshot({ id: 'owner', paths: [['pet']] });
    expect(owner.issues.map(({ code }) => code)).toEqual([
      'active',
      'inactive',
      'common',
    ]);
    const active = rt.getValidationSnapshot({
      id: 'active',
      paths: [['pet', 'lives']],
    });
    expect(active.issues.map(({ code }) => code)).toEqual(['active']);
  });

  it('resets dormant touched state through its static scope without broadening owner scopes', () => {
    const rt = runtime({
      value: { pet: { kind: 'dog', barkVolume: 4 } },
      baselineValue: { pet: { kind: 'dog', barkVolume: 4 } },
    });
    rt.focus(['pet', 'barkVolume']);
    rt.blur(['pet', 'barkVolume']);
    rt.updateExternalState({ value: { pet: { kind: 'cat', lives: 9 } } });
    expect(
      rt.resetTouched({ id: 'dormant', paths: [['pet', 'barkVolume']] }),
    ).toMatchObject({ success: true, diagnostics: [] });
    rt.updateExternalState({ value: { pet: { kind: 'dog', barkVolume: 4 } } });
    expect(rt.getFieldSnapshot(['pet', 'barkVolume'])?.touched).toBe(false);
  });

  it('passes exact original inputs to async validation and owns inactive async issues at the union', async () => {
    const originalSchema = schema();
    const originalValue = options().value;
    const validate = vi.fn(
      (receivedSchema: unknown, receivedValue: unknown) => {
        void receivedSchema;
        void receivedValue;
        return Promise.resolve({
          valid: false,
          issues: [
            {
              code: 'async-inactive',
              path: ['pet', 'barkVolume'],
              parameters: {},
            },
          ],
        });
      },
    );
    const created = createControlledFormRuntime({
      ...options(),
      schema: originalSchema,
      value: originalValue,
      asyncValidator: { validate },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    await Promise.resolve();
    await Promise.resolve();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.calls[0]?.[0]).toBe(originalSchema);
    expect(validate.mock.calls[0]?.[1]).toBe(originalValue);
    expect(created.runtime.getNodeSnapshot(['pet'])).toMatchObject({
      valid: false,
      issues: [{ code: 'async-inactive', path: ['pet', 'barkVolume'] }],
    });
  });

  it('stops the M29 default helper at the owner oneOf without traversing branches', () => {
    const branchDefault = vi.fn(() => 7);
    const original = schema();
    const pet = (original.properties as Record<string, unknown>).pet as Record<
      string,
      unknown
    >;
    const alternatives = pet.oneOf as Array<Record<string, unknown>>;
    Object.defineProperty(
      (
        (alternatives[0] as Record<string, unknown>).properties as Record<
          string,
          unknown
        >
      ).lives as object,
      'default',
      { enumerable: true, get: branchDefault },
    );
    const value = options().value;
    const result = deriveSchemaDefaultCandidate(original, value);
    expect(result).toMatchObject({
      success: false,
      value,
      changed: false,
      diagnostics: [
        {
          code: 'UNSUPPORTED_SCHEMA_KEYWORD',
          severity: 'error',
          source: 'schema',
          dataPath: ['pet'],
          documentPath: ['properties', 'pet', 'oneOf'],
          parameters: { keyword: 'oneOf' },
        },
      ],
    });
    expect(branchDefault).not.toHaveBeenCalled();
  });
});
