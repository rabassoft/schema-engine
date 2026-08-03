import { describe, expect, it, vi } from 'vitest';
import {
  applyFormOperation,
  createControlledFormRuntime,
  type FormOperation,
} from '../src/index.js';
import {
  collectCollectionFormDefinitionDefects,
  validateCollectionFormDefinition,
} from '../src/internal/nested-definition.js';

function field(
  name: string,
  kind: 'string' | 'integer' | 'boolean' = 'string',
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    key: JSON.stringify([name]),
    name,
    path: [name],
    required: false,
    label: name,
    kind: kind === 'integer' ? 'number' : kind,
    nullable: false,
    ...(kind === 'string' ? { constraints: {} } : {}),
    ...(kind === 'integer'
      ? { numericType: 'integer', constraints: {}, ui: {} }
      : {}),
    ...overrides,
  };
}

function definition(nodes: object[]): Record<string, unknown> {
  return {
    nodes,
    fields: nodes,
    presentation: nodes.map((node) => ({ kind: 'form-node', node })),
  };
}

function group(
  operator: string,
  conditions: unknown[],
): Record<string, unknown> {
  return { operator, conditions };
}

const operation: FormOperation = {
  type: 'set-value',
  metadata: { id: 1, formId: 'compound-definition' },
  path: ['target'],
  expected: { kind: 'missing' },
  value: 'next',
  source: 'user',
};

describe('M32 manual compound-condition definition contract', () => {
  it('accepts all/any groups and detaches every caller-owned layer', () => {
    const firstPath = ['mode'];
    const first = { sourcePath: firstPath, equals: 'show' };
    const conditions = [first, { sourcePath: ['flag'], equals: false }];
    const visibleWhen = group('all', conditions);
    const manual = definition([
      field('mode'),
      field('flag', 'boolean'),
      field('target', 'string', { visibleWhen }),
    ]);

    expect(validateCollectionFormDefinition(manual)).toEqual({ success: true });
    const created = createControlledFormRuntime({
      formId: 'compound-definition',
      definition: manual,
      schema: {},
      value: { mode: 'show', flag: false, target: 'value' },
      baselineValue: { mode: 'show', flag: false, target: 'value' },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    } as never);
    expect(created.success).toBe(true);
    if (!created.success) return;

    firstPath[0] = 'target';
    first.equals = 'changed';
    conditions.reverse();
    visibleWhen.operator = 'any';
    created.runtime.updateExternalState({
      value: { mode: 'show', flag: false, target: 'value' },
    });

    expect(created.runtime.getFieldSnapshot(['target'])?.visible).toBe(true);
    expect(Object.isFrozen(visibleWhen)).toBe(false);
    expect(Object.isFrozen(conditions)).toBe(false);
    expect(Object.isFrozen(first)).toBe(false);
    expect(Object.isFrozen(firstPath)).toBe(false);
  });

  it('classifies only enumerable normalized descriptors and never invokes accessors', () => {
    const sourceGetter = vi.fn(() => ['mode']);
    const accessorPredicate = { equals: 'show' };
    Object.defineProperty(accessorPredicate, 'sourcePath', {
      enumerable: true,
      get: sourceGetter,
    });
    const nonEnumerablePredicate = { equals: 'show' };
    Object.defineProperty(nonEnumerablePredicate, 'sourcePath', {
      enumerable: false,
      value: ['mode'],
    });
    const rawPredicate = { path: ['mode'], equals: 'show', ignored: true };

    const defects = [
      accessorPredicate,
      nonEnumerablePredicate,
      rawPredicate,
    ].map((visibleWhen) =>
      validateCollectionFormDefinition(
        definition([field('mode'), field('target', 'string', { visibleWhen })]),
      ),
    );

    expect(defects[0]).toMatchObject({
      success: false,
      defect: {
        reason: 'invalid-field-condition',
        conditionReason: 'member-accessor',
        conditionDetailMember: 'sourcePath',
      },
    });
    expect(defects[1]).toMatchObject({
      success: false,
      defect: {
        reason: 'invalid-field-condition',
        conditionReason: 'member-missing',
        conditionDetailMember: 'sourcePath',
      },
    });
    expect(defects[2]).toMatchObject({
      success: false,
      defect: {
        reason: 'invalid-field-condition',
        conditionReason: 'member-missing',
        conditionDetailMember: 'sourcePath',
      },
    });
    expect(sourceGetter).not.toHaveBeenCalled();
  });

  it('does not retain non-enumerable descriptors while detaching runtime state', () => {
    const visibleWhen = { sourcePath: ['mode'], equals: 'show' };
    Object.defineProperties(visibleWhen, {
      operator: { enumerable: false, value: 'any' },
      conditions: {
        enumerable: false,
        value: [{ sourcePath: ['mode'], equals: 'other' }],
      },
    });
    const manual = definition([
      field('mode'),
      field('target', 'string', { visibleWhen }),
    ]);
    expect(validateCollectionFormDefinition(manual)).toEqual({ success: true });

    const created = createControlledFormRuntime({
      formId: 'non-enumerable-detachment',
      definition: manual,
      schema: {},
      value: { mode: 'show', target: 'value' },
      baselineValue: { mode: 'show', target: 'value' },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    } as never);

    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.runtime.getFieldSnapshot(['target'])?.visible).toBe(true);
  });

  it('reports mixed, invalid operator, empty, sparse, extra and nested groups exactly', () => {
    const sparse = new Array<unknown>(1);
    const extra = [{ sourcePath: ['source'], equals: 'ok' }];
    Object.assign(extra, { extra: true });
    const cases = [
      {
        condition: {
          sourcePath: ['source'],
          equals: 'ok',
          operator: 'all',
          conditions: [],
        },
        expected: {
          reason: 'invalid-field-condition-group',
          conditionGroupReason: 'shape-mixed',
          conditionDetailMember: 'condition',
        },
      },
      {
        condition: group('xor', [{ sourcePath: ['source'], equals: 'ok' }]),
        expected: {
          reason: 'invalid-field-condition-group',
          conditionGroupReason: 'member-invalid',
          conditionDetailMember: 'operator',
          conditionActualType: 'string',
          conditionActualOperator: 'xor',
        },
      },
      {
        condition: group('all', []),
        expected: {
          reason: 'invalid-field-condition-group',
          conditionGroupReason: 'empty',
          conditionActualLength: 0,
        },
      },
      {
        condition: group('all', sparse),
        expected: {
          reason: 'invalid-field-condition-group',
          conditionGroupReason: 'member-invalid',
          conditionGroupIndex: 0,
        },
      },
      {
        condition: group('all', extra),
        expected: {
          reason: 'invalid-field-condition-group',
          conditionGroupReason: 'member-invalid',
          conditionGroupKey: 'extra',
        },
      },
      {
        condition: group('all', [
          group('any', [{ sourcePath: ['source'], equals: 'ok' }]),
        ]),
        expected: {
          reason: 'nested-field-condition-group',
          conditionDetailMember: 'condition',
          conditionGroupIndex: 0,
        },
      },
    ];

    for (const { condition, expected } of cases) {
      const result = validateCollectionFormDefinition(
        definition([
          field('source'),
          field('target', 'string', { visibleWhen: condition }),
        ]),
      );
      expect(result).toMatchObject({ success: false, defect: expected });
    }
  });

  it('keeps group and source-path indices distinct and links every safe member', () => {
    const structural = validateCollectionFormDefinition(
      definition([
        field('source'),
        field('target', 'string', {
          visibleWhen: group('all', [
            { sourcePath: ['source'], equals: 'ok' },
            { sourcePath: ['source', 1], equals: 'ok' },
          ]),
        }),
      ]),
    );
    expect(structural).toMatchObject({
      success: false,
      defect: {
        reason: 'invalid-field-condition',
        conditionGroupIndex: 1,
        conditionIndex: 1,
      },
    });

    const semanticDefects = collectCollectionFormDefinitionDefects(
      definition([
        field('integer', 'integer'),
        field('target', 'string', {
          visibleWhen: group('any', [
            { sourcePath: ['missing'], equals: '' },
            { sourcePath: ['integer'], equals: 0.5 },
            { sourcePath: ['alsoMissing'], equals: '' },
          ]),
        }),
      ]),
    );
    expect(
      semanticDefects.map(({ reason, conditionGroupIndex }) => [
        reason,
        conditionGroupIndex,
      ]),
    ).toEqual([
      ['field-condition-source-not-managed', 0],
      ['field-condition-literal-incompatible', 1],
      ['field-condition-source-not-managed', 2],
    ]);
  });

  it('maps exact direct/wrapper group details and blocks all downstream work', () => {
    const manual = definition([
      field('target', 'string', {
        visibleWhen: group('xor', [
          { sourcePath: ['target'], equals: 'value' },
        ]),
      }),
    ]);
    const controlledGetter = vi.fn(() => 'value');
    const value: Record<string, unknown> = {};
    Object.defineProperty(value, 'target', {
      enumerable: true,
      get: controlledGetter,
    });

    expect(applyFormOperation(manual as never, value, operation)).toMatchObject(
      {
        success: false,
        diagnostics: [
          {
            code: 'INVALID_FORM_DEFINITION',
            parameters: {
              reason: 'invalid-field-condition-group',
              conditionGroupReason: 'member-invalid',
              member: 'operator',
              conditionActualOperator: 'xor',
            },
          },
        ],
      },
    );
    const validate = vi.fn(() => ({ valid: true, issues: [] }));
    const created = createControlledFormRuntime({
      formId: 'compound-definition',
      definition: manual,
      schema: {},
      value,
      baselineValue: {},
      locale: 'en',
      validator: { validate },
    } as never);
    expect(created).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            definitionReason: 'invalid-field-condition-group',
            definitionConditionGroupReason: 'member-invalid',
            definitionConditionDetailMember: 'operator',
            definitionConditionActualOperator: 'xor',
          },
        },
      ],
    });
    expect(controlledGetter).not.toHaveBeenCalled();
    expect(validate).not.toHaveBeenCalled();
  });

  it('maps copied group array indices and extra keys on both diagnostic surfaces', () => {
    const sparse = new Array<unknown>(1);
    const sparseManual = definition([
      field('target', 'string', { visibleWhen: group('all', sparse) }),
    ]);
    const created = createControlledFormRuntime({
      formId: 'compound-definition',
      definition: sparseManual,
      schema: {},
      value: {},
      baselineValue: {},
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    } as never);
    expect(created).toMatchObject({
      success: false,
      diagnostics: [
        {
          parameters: {
            definitionConditionGroupReason: 'member-invalid',
            definitionConditionGroupIndex: 0,
          },
        },
      ],
    });

    const conditions = [{ sourcePath: ['target'], equals: 'value' }];
    Object.assign(conditions, { extra: true });
    const applied = applyFormOperation(
      definition([
        field('target', 'string', {
          visibleWhen: group('all', conditions),
        }),
      ]) as never,
      {},
      operation,
    );
    expect(applied).toMatchObject({
      success: false,
      diagnostics: [
        {
          parameters: {
            conditionGroupReason: 'member-invalid',
            conditionGroupKey: 'extra',
          },
        },
      ],
    });
    expect(Object.isFrozen(applied.diagnostics[0]?.parameters)).toBe(true);
  });
});
