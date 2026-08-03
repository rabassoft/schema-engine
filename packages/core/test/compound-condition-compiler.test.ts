import { describe, expect, it } from 'vitest';
import {
  compileFormDefinition,
  type FieldConditionDefinition,
  type FieldTemplate,
  type FieldValueConditionDefinition,
  type FieldValueConditionGroupDefinition,
  type UiFieldConditionSchema,
  type UiFieldValueConditionGroupSchema,
  type UiFieldValueConditionSchema,
} from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

const schema = (properties: Record<string, unknown>) => ({
  $schema: DIALECT,
  type: 'object',
  properties,
});

const ordinarySchema = schema({
  first: { type: 'string' },
  second: { type: 'string' },
  flag: { type: 'boolean' },
  count: { type: 'integer' },
  target: { type: 'string' },
});

describe('M32 flat compound condition compiler contract', () => {
  it('exports exact predicate/group unions while preserving predicate assignability and template omission', () => {
    const predicate: UiFieldValueConditionSchema = {
      path: ['flag'],
      equals: false,
    };
    const group: UiFieldValueConditionGroupSchema = {
      operator: 'all',
      conditions: [predicate],
    };
    const rawBranches: readonly UiFieldConditionSchema[] = [predicate, group];
    const normalizedPredicate: FieldValueConditionDefinition = {
      sourcePath: ['flag'],
      equals: false,
    };
    const normalizedGroup: FieldValueConditionGroupDefinition = {
      operator: 'any',
      conditions: [normalizedPredicate],
    };
    const normalizedBranches: readonly FieldConditionDefinition[] = [
      normalizedPredicate,
      normalizedGroup,
    ];
    type TemplateHasVisible = 'visibleWhen' extends keyof FieldTemplate
      ? true
      : false;
    const templateHasVisible: TemplateHasVisible = false;

    expect(
      rawBranches.map((branch) =>
        'operator' in branch ? 'group' : 'predicate',
      ),
    ).toEqual(['predicate', 'group']);
    expect(
      normalizedBranches.map((branch) =>
        'operator' in branch ? 'group' : 'predicate',
      ),
    ).toEqual(['predicate', 'group']);
    expect(templateHasVisible).toBe(false);
  });

  it('normalizes direct and nested all/any groups with detached frozen ordered duplicates', () => {
    const duplicate = { path: ['flag'], equals: false } as const;
    const authoredConditions = [duplicate, duplicate];
    const authoredGroup = {
      operator: 'all',
      conditions: authoredConditions,
    } as const;
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        $defs: {
          profile: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              target: { type: 'string' },
            },
          },
        },
        type: 'object',
        properties: {
          flag: { type: 'boolean' },
          target: { type: 'string' },
          profile: { allOf: [{ $ref: '#/$defs/profile' }] },
        },
      },
      uiSchema: {
        fields: {
          target: { visibleWhen: authoredGroup },
          profile: {
            fields: {
              target: {
                enabledWhen: {
                  operator: 'any',
                  conditions: [
                    { path: ['profile', 'source'], equals: '' },
                    { path: ['flag'], equals: true },
                  ],
                },
              },
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const directField = result.definition.fields.find(
      ({ path }) => path.length === 1 && path[0] === 'target',
    );
    const direct =
      directField !== undefined && 'visibleWhen' in directField
        ? directField.visibleWhen
        : undefined;
    expect(direct).toMatchObject({
      operator: 'all',
      conditions: [
        { sourcePath: ['flag'], equals: false },
        { sourcePath: ['flag'], equals: false },
      ],
    });
    expect(direct).not.toBe(authoredGroup);
    if (direct === undefined || !('operator' in direct)) return;
    expect(direct.conditions).not.toBe(authoredConditions);
    expect(direct.conditions[0]).not.toBe(duplicate);
    expect(direct.conditions[0]).not.toBe(direct.conditions[1]);
    expect(Object.isFrozen(direct)).toBe(true);
    expect(Object.isFrozen(direct.conditions)).toBe(true);
    expect(Object.isFrozen(direct.conditions[0])).toBe(true);
    expect(Object.isFrozen(direct.conditions[0]?.sourcePath)).toBe(true);
    expect(result.definition.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['profile', 'target'],
          enabledWhen: {
            operator: 'any',
            conditions: [
              { sourcePath: ['profile', 'source'], equals: '' },
              { sourcePath: ['flag'], equals: true },
            ],
          },
        }),
      ]),
    );
  });

  it('classifies only own enumerable recognized descriptors and rejects mixed shapes without executing accessors', () => {
    const accessor = { conditions: [{ path: ['flag'], equals: true }] };
    Object.defineProperty(accessor, 'operator', {
      enumerable: true,
      get: () => {
        throw new Error('must not execute');
      },
    });
    const nonEnumerableGroup = {};
    Object.defineProperties(nonEnumerableGroup, {
      operator: { enumerable: false, value: 'all' },
      conditions: { enumerable: false, value: [] },
    });
    const result = compileFormDefinition({
      schema: ordinarySchema,
      uiSchema: {
        fields: {
          first: {
            visibleWhen: {
              path: ['flag'],
              equals: true,
              operator: 'all',
              conditions: [],
            } as never,
          },
          second: { visibleWhen: accessor as never },
          target: { visibleWhen: nonEnumerableGroup as never },
        },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics
        .filter(({ code }) => code === 'INVALID_UI_FIELD_CONDITION')
        .map(({ parameters }) => [
          parameters.field,
          parameters.reason,
          parameters.conditionMember,
        ]),
    ).toEqual([
      ['first', 'condition-shape-mixed', 'condition'],
      ['second', 'condition-member-accessor', 'operator'],
      ['target', 'condition-member-missing', 'path'],
      ['target', 'condition-member-missing', 'equals'],
    ]);
  });

  it.each([
    [
      'missing operator',
      { conditions: [{ path: ['flag'], equals: true }] },
      'condition-member-missing',
      ['fields', 'target', 'visibleWhen', 'operator'],
    ],
    [
      'invalid operator',
      { operator: 'none', conditions: [{ path: ['flag'], equals: true }] },
      'condition-member-invalid',
      ['fields', 'target', 'visibleWhen', 'operator'],
    ],
    [
      'missing conditions',
      { operator: 'all' },
      'condition-member-missing',
      ['fields', 'target', 'visibleWhen', 'conditions'],
    ],
    [
      'non-array conditions',
      { operator: 'all', conditions: {} },
      'condition-member-invalid',
      ['fields', 'target', 'visibleWhen', 'conditions'],
    ],
    [
      'empty conditions',
      { operator: 'all', conditions: [] },
      'condition-group-empty',
      ['fields', 'target', 'visibleWhen', 'conditions'],
    ],
  ] as const)(
    'reports exact %s group diagnostics',
    (_name, condition, reason, documentPath) => {
      const result = compileFormDefinition({
        schema: ordinarySchema,
        uiSchema: { fields: { target: { visibleWhen: condition as never } } },
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.diagnostics.at(-1)).toMatchObject({
        code: 'INVALID_UI_FIELD_CONDITION',
        documentPath,
        parameters: { reason },
      });
      if (_name === 'invalid operator') {
        expect(result.diagnostics.at(-1)?.parameters).toMatchObject({
          actualType: 'string',
          actualOperator: 'none',
        });
      }
    },
  );

  it('collects an empty-array defect before its independent extra-key defect', () => {
    const conditions = Object.assign([], { extra: true });
    const result = compileFormDefinition({
      schema: ordinarySchema,
      uiSchema: {
        fields: {
          target: {
            visibleWhen: { operator: 'all', conditions } as never,
          },
        },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics
        .filter(({ code }) => code === 'INVALID_UI_FIELD_CONDITION')
        .map(({ parameters }) => [parameters.reason, parameters.conditionKey]),
    ).toEqual([
      ['condition-group-empty', undefined],
      ['condition-member-invalid', 'extra'],
    ]);
  });

  it.each([
    [
      'sparse',
      () => new Array<unknown>(1),
      'condition-member-invalid',
      0,
      undefined,
    ],
    [
      'non-enumerable index',
      () => {
        const conditions: unknown[] = [];
        Object.defineProperty(conditions, 0, {
          enumerable: false,
          value: { path: ['flag'], equals: true },
        });
        return conditions;
      },
      'condition-member-invalid',
      0,
      undefined,
    ],
    [
      'accessor index',
      () => {
        const conditions: unknown[] = [];
        Object.defineProperty(conditions, 0, {
          enumerable: true,
          get: () => {
            throw new Error('must not execute');
          },
        });
        return conditions;
      },
      'condition-member-accessor',
      0,
      undefined,
    ],
    [
      'extra key',
      () => Object.assign([{ path: ['flag'], equals: true }], { extra: true }),
      'condition-member-invalid',
      undefined,
      'extra',
    ],
  ] as const)(
    'rejects a %s conditions array without unsafe value inspection',
    (_name, createConditions, reason, memberIndex, conditionKey) => {
      const result = compileFormDefinition({
        schema: ordinarySchema,
        uiSchema: {
          fields: {
            target: {
              visibleWhen: {
                operator: 'all',
                conditions: createConditions(),
              } as never,
            },
          },
        },
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      const diagnostic = result.diagnostics.find(
        ({ parameters }) =>
          parameters.reason === reason &&
          parameters.conditionMember === 'conditions',
      );
      expect(diagnostic).toMatchObject({
        code: 'INVALID_UI_FIELD_CONDITION',
        parameters: {
          reason,
          ...(memberIndex === undefined ? {} : { memberIndex }),
          ...(conditionKey === undefined ? {} : { conditionKey }),
        },
      });
      expect(diagnostic?.parameters).not.toHaveProperty('value');
    },
  );

  it('rejects non-object, mixed and nested members and retains member diagnostics and warning order', () => {
    const result = compileFormDefinition({
      schema: ordinarySchema,
      uiSchema: {
        fields: {
          target: {
            visibleWhen: {
              operator: 'all',
              ignoredGroup: true,
              conditions: [
                null,
                {
                  path: ['flag'],
                  equals: true,
                  operator: 'all',
                  conditions: [],
                },
                {
                  operator: 'any',
                  conditions: [{ path: ['flag'], equals: true }],
                },
                { path: [], equals: true, ignoredMember: true },
              ],
            } as never,
          },
        },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics
        .slice(-6)
        .map(({ code, parameters }) => [
          code,
          parameters.reason ?? parameters.key,
          parameters.memberIndex,
        ]),
    ).toEqual([
      ['INVALID_UI_FIELD_CONDITION', 'condition-not-object', 0],
      ['INVALID_UI_FIELD_CONDITION', 'condition-shape-mixed', 1],
      ['INVALID_UI_FIELD_CONDITION', 'condition-group-nested', 2],
      ['INVALID_UI_FIELD_CONDITION', 'condition-member-invalid', 3],
      ['UNKNOWN_UI_SCHEMA_KEY', 'ignoredMember', undefined],
      ['UNKNOWN_UI_SCHEMA_KEY', 'ignoredGroup', undefined],
    ]);
    expect(result.diagnostics.at(-1)?.documentPath).toEqual([
      'fields',
      'target',
      'visibleWhen',
      'ignoredGroup',
    ]);
  });

  it('collects every safe semantic member failure in authored order and suppresses linking when the schema index is blocked', () => {
    const condition = {
      operator: 'any',
      conditions: [
        { path: ['missing'], equals: '' },
        { path: ['flag'], equals: '' },
        { path: ['other-missing'], equals: '' },
      ],
    } as const;
    const result = compileFormDefinition({
      schema: ordinarySchema,
      uiSchema: { fields: { target: { visibleWhen: condition } } },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics
        .filter(({ parameters }) =>
          ['source-not-ordinary-field', 'literal-incompatible'].includes(
            parameters.reason as string,
          ),
        )
        .map(({ parameters }) => [parameters.reason, parameters.memberIndex]),
    ).toEqual([
      ['source-not-ordinary-field', 0],
      ['literal-incompatible', 1],
      ['source-not-ordinary-field', 2],
    ]);

    const blocked = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          target: { type: 'string' },
          broken: { type: 'unsupported' },
        },
      },
      uiSchema: { fields: { target: { visibleWhen: condition } } },
    });
    expect(blocked.success).toBe(false);
    if (blocked.success) return;
    expect(
      blocked.diagnostics.some(({ parameters }) =>
        ['source-not-ordinary-field', 'literal-incompatible'].includes(
          parameters.reason as string,
        ),
      ),
    ).toBe(false);
  });

  it('keeps collection templates and M31 arrays outside group authoring, source and target roles', () => {
    const group = {
      operator: 'all',
      conditions: [{ path: ['flag'], equals: true }],
    } as const;
    const result = compileFormDefinition({
      schema: schema({
        flag: { type: 'boolean' },
        target: { type: 'string' },
        roles: {
          type: 'array',
          uniqueItems: true,
          items: { type: 'string', enum: ['owner', 'editor'] },
        },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              value: { type: 'string' },
            },
            required: ['id'],
          },
        },
      }),
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
      uiSchema: {
        fields: {
          target: {
            visibleWhen: {
              operator: 'any',
              conditions: [{ path: ['roles'], equals: 'owner' }],
            },
          },
          roles: { visibleWhen: group },
          rows: {
            item: { fields: { value: { enabledWhen: group } } },
          },
        },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics
        .filter(({ code }) => code === 'INVALID_UI_FIELD_CONDITION')
        .map(({ parameters }) => [
          parameters.field,
          parameters.reason,
          parameters.targetKind ?? parameters.sourceReason,
          parameters.memberIndex,
        ]),
    ).toEqual([
      ['target', 'source-not-ordinary-field', 'array', 0],
      ['roles', 'unsupported-target-location', 'array', undefined],
      ['value', 'unsupported-target-location', 'template-field', undefined],
    ]);
  });
});
