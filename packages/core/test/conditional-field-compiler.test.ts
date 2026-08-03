import { describe, expect, it } from 'vitest';
import {
  compileFormDefinition,
  type FieldTemplate,
  type FieldValueConditionDefinition,
  type UiFieldValueConditionSchema,
} from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

const schema = (properties: Record<string, unknown>) => ({
  $schema: DIALECT,
  type: 'object',
  properties,
});

describe('M30 conditional field compiler contract', () => {
  it('exports, copies, links and freezes ordinary conditions in definition order', () => {
    type TemplateExposesVisible = 'visibleWhen' extends keyof FieldTemplate
      ? true
      : false;
    type TemplateExposesEnabled = 'enabledWhen' extends keyof FieldTemplate
      ? true
      : false;
    const templateExposesVisible: TemplateExposesVisible = false;
    const templateExposesEnabled: TemplateExposesEnabled = false;
    expect([templateExposesVisible, templateExposesEnabled]).toEqual([
      false,
      false,
    ]);

    const authored: UiFieldValueConditionSchema = {
      path: ['enabled'],
      equals: false,
    };
    const normalizedTypeCheck: FieldValueConditionDefinition = {
      sourcePath: ['enabled'],
      equals: false,
    };
    expect(normalizedTypeCheck).toEqual({
      sourcePath: ['enabled'],
      equals: false,
    });

    const result = compileFormDefinition({
      schema: schema({
        enabled: { type: 'boolean' },
        name: { type: 'string' },
        count: { type: 'integer' },
      }),
      uiSchema: {
        order: ['name', 'count', 'enabled'],
        fields: {
          name: {
            visibleWhen: authored,
            enabledWhen: { path: ['count'], equals: 0 },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const name = result.definition.fields[0];
    expect(name?.kind).toBe('string');
    if (name?.kind !== 'string') return;
    expect(name).toMatchObject({
      name: 'name',
      visibleWhen: { sourcePath: ['enabled'], equals: false },
      enabledWhen: { sourcePath: ['count'], equals: 0 },
    });
    expect(name.visibleWhen).not.toBe(authored);
    expect(name.visibleWhen).toHaveProperty('sourcePath');
    if (name.visibleWhen === undefined || !('sourcePath' in name.visibleWhen))
      return;
    expect(name.visibleWhen.sourcePath).not.toBe(authored.path);
    expect(Object.isFrozen(name.visibleWhen)).toBe(true);
    expect(Object.isFrozen(name.visibleWhen.sourcePath)).toBe(true);
  });

  it('collects descriptor-safe path/literal diagnostics before unknown keys', () => {
    const condition: Record<string, unknown> = { extra: true };
    Object.defineProperty(condition, 'path', {
      enumerable: true,
      get: () => {
        throw new Error('must not execute');
      },
    });
    const result = compileFormDefinition({
      schema: schema({
        source: { type: 'string' },
        target: { type: 'string' },
      }),
      uiSchema: {
        fields: {
          target: { visibleWhen: condition as never },
        },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.diagnostics.slice(-3).map(({ code }) => code)).toEqual([
      'INVALID_UI_FIELD_CONDITION',
      'INVALID_UI_FIELD_CONDITION',
      'UNKNOWN_UI_SCHEMA_KEY',
    ]);
    expect(result.diagnostics.at(-3)).toMatchObject({
      documentPath: ['fields', 'target', 'visibleWhen', 'path'],
      parameters: {
        member: 'visibleWhen',
        reason: 'condition-member-accessor',
        conditionMember: 'path',
      },
    });
    expect(result.diagnostics.at(-2)).toMatchObject({
      documentPath: ['fields', 'target', 'visibleWhen', 'equals'],
      parameters: {
        reason: 'condition-member-missing',
        conditionMember: 'equals',
      },
    });
  });

  it('rejects unmanaged sources, incompatible literals and fixed enabled targets', () => {
    const result = compileFormDefinition({
      schema: schema({
        enabled: { type: 'boolean' },
        fixed: { type: 'string', const: 'fixed' },
        first: { type: 'string' },
        second: { type: 'number' },
      }),
      uiSchema: {
        fields: {
          fixed: { enabledWhen: { path: ['enabled'], equals: true } },
          first: { visibleWhen: { path: ['missing'], equals: '' } },
          second: { visibleWhen: { path: ['enabled'], equals: 1 } },
        },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    const conditions = result.diagnostics.filter(
      ({ code }) => code === 'INVALID_UI_FIELD_CONDITION',
    );
    expect(conditions.map(({ parameters }) => parameters.reason)).toEqual([
      'incompatible-target',
      'source-not-ordinary-field',
      'literal-incompatible',
    ]);
  });

  it('links nested and composed/reference ordinary paths but rejects template targets', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        $defs: { flag: { type: 'boolean' } },
        type: 'object',
        properties: {
          profile: {
            allOf: [
              {
                type: 'object',
                properties: {
                  flag: { $ref: '#/$defs/flag' },
                  name: { type: 'string' },
                },
              },
            ],
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
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
      uiSchema: {
        fields: {
          profile: {
            fields: {
              name: {
                visibleWhen: { path: ['profile', 'flag'], equals: true },
              },
            },
          },
          rows: {
            item: {
              fields: {
                value: {
                  visibleWhen: {
                    path: ['profile', 'flag'],
                    equals: true,
                    ignored: 'warning',
                  } as never,
                },
              },
            },
          },
        },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics.find(
        ({ parameters }) => parameters.targetKind === 'template-field',
      ),
    ).toMatchObject({
      code: 'INVALID_UI_FIELD_CONDITION',
      dataPath: ['rows'],
      parameters: { templatePath: ['value'] },
    });
    expect(
      result.diagnostics.some(
        ({ parameters }) => parameters.reason === 'source-not-ordinary-field',
      ),
    ).toBe(false);
    expect(
      result.diagnostics.find(
        ({ code, documentPath }) =>
          code === 'UNKNOWN_UI_SCHEMA_KEY' &&
          documentPath?.at(-1) === 'ignored',
      ),
    ).toMatchObject({
      dataPath: ['rows'],
      parameters: { key: 'ignored', templatePath: ['value'] },
    });
  });

  it('normalizes nested referenced/composed targets and sources successfully', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        $defs: {
          profile: {
            type: 'object',
            properties: {
              flag: { type: 'boolean' },
              name: { type: 'string' },
            },
          },
        },
        type: 'object',
        properties: {
          profile: { allOf: [{ $ref: '#/$defs/profile' }] },
        },
      },
      uiSchema: {
        fields: {
          profile: {
            fields: {
              name: {
                visibleWhen: { path: ['profile', 'flag'], equals: true },
              },
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields).toMatchObject([
      { path: ['profile', 'flag'] },
      {
        path: ['profile', 'name'],
        visibleWhen: { sourcePath: ['profile', 'flag'], equals: true },
      },
    ]);
  });

  it('rejects object, array, item-root, identity and presentation targets', () => {
    const condition = { path: ['flag'], equals: true } as const;
    const result = compileFormDefinition({
      schema: schema({
        flag: { type: 'boolean' },
        profile: {
          type: 'object',
          properties: { name: { type: 'string' } },
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
        presentation: [
          {
            kind: 'section',
            id: 'main',
            label: 'Main',
            visibleWhen: condition,
            children: ['flag', 'profile', 'rows'],
          } as never,
        ],
        fields: {
          profile: { visibleWhen: condition },
          rows: {
            enabledWhen: condition,
            item: {
              visibleWhen: condition,
              fields: {
                id: { enabledWhen: condition },
              },
            } as never,
          },
        },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    const targetKinds = result.diagnostics
      .filter(({ code }) => code === 'INVALID_UI_FIELD_CONDITION')
      .map(({ parameters }) => parameters.targetKind);
    expect(targetKinds).toEqual([
      'object',
      'array',
      'presentation',
      'item',
      'identity',
    ]);
  });

  it('distinguishes a nested collection template object target', () => {
    const result = compileFormDefinition({
      schema: schema({
        flag: { type: 'boolean' },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              group: {
                type: 'object',
                properties: { value: { type: 'string' } },
              },
            },
            required: ['id'],
          },
        },
      }),
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
      uiSchema: {
        fields: {
          rows: {
            item: {
              fields: {
                group: {
                  visibleWhen: { path: ['flag'], equals: true },
                },
              },
            },
          },
        },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics.find(
        ({ parameters }) => parameters.targetKind === 'template-object',
      ),
    ).toMatchObject({
      dataPath: ['rows'],
      parameters: { templatePath: ['group'] },
    });
  });

  it('replays condition diagnostics in field and member order', () => {
    const result = compileFormDefinition({
      schema: schema({
        source: { type: 'string' },
        first: { type: 'string' },
        second: { type: 'string' },
      }),
      uiSchema: {
        order: ['second', 'first', 'source'],
        fields: {
          first: {
            visibleWhen: { path: ['missing-first'], equals: '' },
            enabledWhen: { path: ['missing-first-enabled'], equals: '' },
          },
          second: {
            visibleWhen: { path: ['missing-second'], equals: '' },
            enabledWhen: { path: ['missing-second-enabled'], equals: '' },
          },
        },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics
        .filter(
          ({ parameters }) => parameters.reason === 'source-not-ordinary-field',
        )
        .map(({ parameters }) => [parameters.field, parameters.member]),
    ).toEqual([
      ['second', 'visibleWhen'],
      ['second', 'enabledWhen'],
      ['first', 'visibleWhen'],
      ['first', 'enabledWhen'],
    ]);
  });

  it('treats inherited and non-enumerable condition members as absent', () => {
    const inherited = Object.create({
      visibleWhen: { path: ['flag'], equals: true },
    }) as Record<string, unknown>;
    Object.defineProperty(inherited, 'enabledWhen', {
      enumerable: false,
      value: { path: ['flag'], equals: true },
    });
    const result = compileFormDefinition({
      schema: schema({ flag: { type: 'boolean' }, target: { type: 'string' } }),
      uiSchema: { fields: { target: inherited } },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields[1]).not.toHaveProperty('visibleWhen');
    expect(result.definition.fields[1]).not.toHaveProperty('enabledWhen');
  });

  it('never invokes an authored condition accessor', () => {
    const fieldUi: Record<string, unknown> = {};
    Object.defineProperty(fieldUi, 'visibleWhen', {
      enumerable: true,
      get: () => {
        throw new Error('must not execute');
      },
    });
    const result = compileFormDefinition({
      schema: schema({ target: { type: 'string' } }),
      uiSchema: { fields: { target: fieldUi } },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.diagnostics.at(-1)).toMatchObject({
      code: 'INVALID_UI_FIELD_CONDITION',
      parameters: {
        reason: 'condition-member-accessor',
        conditionMember: 'condition',
      },
    });
  });

  it.each([null, [], 1, () => undefined, new (class AuthoredCondition {})()])(
    'rejects a non-ordinary condition exterior safely',
    (visibleWhen) => {
      const result = compileFormDefinition({
        schema: schema({ target: { type: 'string' } }),
        uiSchema: { fields: { target: { visibleWhen } as never } },
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.diagnostics.at(-1)).toMatchObject({
        code: 'INVALID_UI_FIELD_CONDITION',
        documentPath: ['fields', 'target', 'visibleWhen'],
        parameters: {
          reason: 'condition-not-object',
          expected: 'condition object',
        },
      });
    },
  );

  it('reports missing and accessor path/equals members without invoking accessors', () => {
    const pathAccessor: Record<string, unknown> = { equals: '' };
    Object.defineProperty(pathAccessor, 'path', {
      enumerable: true,
      get: () => {
        throw new Error('must not execute');
      },
    });
    const equalsAccessor: Record<string, unknown> = { path: ['source'] };
    Object.defineProperty(equalsAccessor, 'equals', {
      enumerable: true,
      get: () => {
        throw new Error('must not execute');
      },
    });
    const result = compileFormDefinition({
      schema: schema({
        source: { type: 'string' },
        first: { type: 'string' },
        second: { type: 'string' },
        third: { type: 'string' },
      }),
      uiSchema: {
        fields: {
          first: { visibleWhen: { equals: '' } as never },
          second: { visibleWhen: pathAccessor as never },
          third: { visibleWhen: equalsAccessor as never },
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
      ['first', 'condition-member-missing', 'path'],
      ['second', 'condition-member-accessor', 'path'],
      ['third', 'condition-member-accessor', 'equals'],
    ]);
  });

  it.each([
    ['empty', [], ['fields', 'target', 'visibleWhen', 'path']],
    ['non-array', 'source', ['fields', 'target', 'visibleWhen', 'path']],
    ['non-string', [1], ['fields', 'target', 'visibleWhen', 'path', 0]],
    [
      'extra-key',
      Object.assign(['source'], { extra: true }),
      ['fields', 'target', 'visibleWhen', 'path', 'extra'],
    ],
  ])('rejects a %s path safely', (_name, path, documentPath) => {
    const result = compileFormDefinition({
      schema: schema({
        source: { type: 'string' },
        target: { type: 'string' },
      }),
      uiSchema: {
        fields: { target: { visibleWhen: { path, equals: '' } as never } },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.diagnostics.at(-1)).toMatchObject({
      code: 'INVALID_UI_FIELD_CONDITION',
      documentPath,
      parameters: { reason: 'condition-member-invalid' },
    });
  });

  it.each([
    [
      'sparse',
      () => {
        const path = new Array<string>(1);
        return path;
      },
      'condition-member-invalid',
    ],
    [
      'non-enumerable',
      () => {
        const path: string[] = [];
        Object.defineProperty(path, 0, {
          enumerable: false,
          configurable: true,
          value: 'source',
        });
        return path;
      },
      'condition-member-invalid',
    ],
    [
      'accessor',
      () => {
        const path: string[] = [];
        Object.defineProperty(path, 0, {
          enumerable: true,
          configurable: true,
          get: () => {
            throw new Error('must not execute');
          },
        });
        return path;
      },
      'condition-member-accessor',
    ],
  ] as const)(
    'omits actualType for a %s path index without invoking accessors',
    (_name, createPath, reason) => {
      const result = compileFormDefinition({
        schema: schema({
          source: { type: 'string' },
          target: { type: 'string' },
        }),
        uiSchema: {
          fields: {
            target: {
              visibleWhen: { path: createPath(), equals: '' },
            },
          },
        },
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      const diagnostic = result.diagnostics.at(-1);
      expect(diagnostic).toMatchObject({
        code: 'INVALID_UI_FIELD_CONDITION',
        documentPath: ['fields', 'target', 'visibleWhen', 'path', 0],
        parameters: {
          reason,
          conditionMember: 'path',
          pathIndex: 0,
        },
      });
      expect(diagnostic?.parameters).not.toHaveProperty('actualType');
    },
  );

  it('copies exact hostile path segments without normalization', () => {
    const properties = Object.create(null) as Record<string, unknown>;
    properties[''] = { type: 'string' };
    properties['a.b'] = { type: 'string' };
    properties.__proto__ = { type: 'string' };
    properties['\ud800'] = { type: 'string' };
    properties.target = { type: 'string' };
    const result = compileFormDefinition({
      schema: schema(properties),
      uiSchema: {
        fields: {
          target: {
            visibleWhen: { path: ['__proto__'], equals: '' },
            enabledWhen: { path: ['\ud800'], equals: '' },
          },
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields.at(-1)).toMatchObject({
      visibleWhen: { sourcePath: ['__proto__'], equals: '' },
      enabledWhen: { sourcePath: ['\ud800'], equals: '' },
    });
  });

  it('distinguishes object, array and below-collection source failures', () => {
    const result = compileFormDefinition({
      schema: schema({
        profile: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' } },
            required: ['id'],
          },
        },
        first: { type: 'string' },
        second: { type: 'string' },
        third: { type: 'string' },
      }),
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
      uiSchema: {
        fields: {
          first: { visibleWhen: { path: ['profile'], equals: '' } },
          second: { visibleWhen: { path: ['rows'], equals: '' } },
          third: { visibleWhen: { path: ['rows', 'id'], equals: '' } },
        },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics
        .filter(
          ({ parameters }) => parameters.reason === 'source-not-ordinary-field',
        )
        .map(({ parameters }) => parameters.sourceReason),
    ).toEqual(['object', 'array', 'below-collection']);
  });

  it('allows self/mutual sources and assertion-incompatible literals', () => {
    const result = compileFormDefinition({
      schema: schema({
        first: { type: 'string', enum: ['a'] },
        second: { type: ['number', 'null'], minimum: 10 },
      }),
      uiSchema: {
        fields: {
          first: { visibleWhen: { path: ['second'], equals: null } },
          second: {
            visibleWhen: { path: ['first'], equals: 'outside-enum' },
            enabledWhen: { path: ['second'], equals: 0 },
          },
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields).toMatchObject([
      { visibleWhen: { sourcePath: ['second'], equals: null } },
      {
        visibleWhen: { sourcePath: ['first'], equals: 'outside-enum' },
        enabledWhen: { sourcePath: ['second'], equals: 0 },
      },
    ]);
  });

  it('keeps fixed visibility, strict literal variants and unknown-key warnings', () => {
    const result = compileFormDefinition({
      schema: schema({
        text: { type: 'string' },
        count: { type: 'number' },
        integer: { type: 'integer' },
        flag: { type: 'boolean' },
        nullable: { type: ['string', 'null'] },
        fixed: { type: 'string', const: 'fixed' },
        target: { type: 'string' },
      }),
      uiSchema: {
        fields: {
          fixed: {
            visibleWhen: {
              path: ['text'],
              equals: '',
              ignored: true,
            } as never,
          },
          target: {
            visibleWhen: { path: ['nullable'], equals: null },
            enabledWhen: { path: ['count'], equals: -0 },
          },
          text: { visibleWhen: { path: ['integer'], equals: 0 } },
          count: { visibleWhen: { path: ['flag'], equals: false } },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields).toMatchObject([
      { visibleWhen: { sourcePath: ['integer'], equals: 0 } },
      { visibleWhen: { sourcePath: ['flag'], equals: false } },
      {},
      {},
      {},
      { visibleWhen: { sourcePath: ['text'], equals: '' } },
      {
        visibleWhen: { sourcePath: ['nullable'], equals: null },
        enabledWhen: { sourcePath: ['count'], equals: -0 },
      },
    ]);
    expect(result.diagnostics).toMatchObject([
      {
        code: 'UNKNOWN_UI_SCHEMA_KEY',
        parameters: { key: 'ignored' },
      },
    ]);
  });

  it('reports source kind and nullability incompatibilities in field order', () => {
    const result = compileFormDefinition({
      schema: schema({
        text: { type: 'string' },
        integer: { type: 'integer' },
        flag: { type: 'boolean' },
        first: { type: 'string' },
        second: { type: 'string' },
        third: { type: 'string' },
      }),
      uiSchema: {
        fields: {
          first: { visibleWhen: { path: ['text'], equals: null } },
          second: { visibleWhen: { path: ['integer'], equals: 0.5 } },
          third: { visibleWhen: { path: ['flag'], equals: '' } },
        },
      },
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics
        .filter(
          ({ parameters }) => parameters.reason === 'literal-incompatible',
        )
        .map(({ parameters }) => ({
          sourceKind: parameters.sourceKind,
          sourceNullable: parameters.sourceNullable,
          expected: parameters.expected,
          actualType: parameters.actualType,
        })),
    ).toEqual([
      {
        sourceKind: 'string',
        sourceNullable: false,
        expected: 'string',
        actualType: 'null',
      },
      {
        sourceKind: 'integer',
        sourceNullable: false,
        expected: 'finite integer',
        actualType: 'number',
      },
      {
        sourceKind: 'boolean',
        sourceNullable: false,
        expected: 'boolean',
        actualType: 'string',
      },
    ]);
  });

  it.each([
    undefined,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1n,
    Symbol('invalid'),
    () => undefined,
    {},
    [],
  ])('rejects an invalid equals literal without retaining it', (equals) => {
    const result = compileFormDefinition({
      schema: schema({
        source: { type: 'string' },
        target: { type: 'string' },
      }),
      uiSchema: {
        fields: {
          target: { visibleWhen: { path: ['source'], equals } as never },
        },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const diagnostic = result.diagnostics.at(-1);
    expect(diagnostic).toMatchObject({
      code: 'INVALID_UI_FIELD_CONDITION',
      parameters: {
        reason: 'condition-member-invalid',
        conditionMember: 'equals',
      },
    });
    expect(diagnostic?.parameters).not.toHaveProperty('value');
  });

  it('suppresses source linking when the ordinary field index is schema-blocked', () => {
    const result = compileFormDefinition({
      schema: schema({
        broken: { type: 'unsupported' },
        target: { type: 'string' },
      }),
      uiSchema: {
        fields: {
          target: { visibleWhen: { path: ['missing'], equals: '' } },
        },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics.some(
        ({ parameters }) => parameters.reason === 'source-not-ordinary-field',
      ),
    ).toBe(false);
  });

  it('still reports safe raw shape defects on a schema-blocked target', () => {
    const result = compileFormDefinition({
      schema: schema({
        profile: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
        target: { type: 'unsupported' },
      }),
      uiSchema: {
        fields: { target: { visibleWhen: { equals: '' } as never } },
      },
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.diagnostics.find(
        ({ parameters }) =>
          parameters.reason === 'condition-member-missing' &&
          parameters.conditionMember === 'path',
      ),
    ).toMatchObject({
      dataPath: ['target'],
      documentPath: ['fields', 'target', 'visibleWhen', 'path'],
    });
    expect(
      result.diagnostics.some(({ parameters }) =>
        [
          'unsupported-target-location',
          'source-not-ordinary-field',
          'literal-incompatible',
        ].includes(parameters.reason as string),
      ),
    ).toBe(false);
  });
});
