import { describe, expect, it, vi } from 'vitest';

import { compileFormDefinition } from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

function compileField(
  field: Record<string, unknown>,
  uiField?: Record<string, unknown>,
) {
  return compileFormDefinition({
    schema: {
      $schema: DIALECT,
      type: 'object',
      properties: { value: field, sibling: { type: 'boolean' } },
    },
    ...(uiField === undefined
      ? {}
      : { uiSchema: { fields: { value: uiField } } }),
  });
}

describe('nullable primitive compiler', () => {
  it.each([
    [['string', 'null'], { kind: 'string', constraints: {} }],
    [['null', 'string'], { kind: 'string', constraints: {} }],
    [
      ['number', 'null'],
      { kind: 'number', numericType: 'number', constraints: {}, ui: {} },
    ],
    [
      ['null', 'number'],
      { kind: 'number', numericType: 'number', constraints: {}, ui: {} },
    ],
    [
      ['integer', 'null'],
      { kind: 'number', numericType: 'integer', constraints: {}, ui: {} },
    ],
    [
      ['null', 'integer'],
      { kind: 'number', numericType: 'integer', constraints: {}, ui: {} },
    ],
    [['boolean', 'null'], { kind: 'boolean' }],
    [['null', 'boolean'], { kind: 'boolean' }],
  ] as const)('normalizes the exact array %j', (type, expected) => {
    const result = compileField({ type });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields[0]).toMatchObject({
      name: 'value',
      nullable: true,
      ...expected,
    });
    expect(result.definition.fields[0]).not.toHaveProperty('type');
    expect(Object.isFrozen(result.definition.fields[0])).toBe(true);
  });

  it('classifies constraints, annotations and UI by the primitive member', () => {
    const stringResult = compileField(
      {
        type: ['null', 'string'],
        title: 'Value',
        description: 'Description',
        minLength: 1,
        maxLength: 4,
        pattern: '^a',
        default: null,
      },
      { placeholder: 'Optional' },
    );
    expect(stringResult.success).toBe(true);
    if (!stringResult.success) return;
    expect(stringResult.definition.fields[0]).toMatchObject({
      nullable: true,
      label: 'Value',
      description: 'Description',
      placeholder: 'Optional',
      constraints: { minLength: 1, maxLength: 4, pattern: '^a' },
    });
    expect(stringResult.diagnostics).toEqual([]);

    const numberResult = compileField(
      {
        type: ['number', 'null'],
        minimum: 0,
        maximum: 10,
        multipleOf: 0.5,
      },
      { options: { decimalPlaces: 2, showTrailingZeros: true } },
    );
    expect(numberResult.success).toBe(true);
    if (!numberResult.success) return;
    expect(numberResult.definition.fields[0]).toMatchObject({
      nullable: true,
      constraints: { minimum: 0, maximum: 10, multipleOf: 0.5 },
      ui: { decimalPlaces: 2, showTrailingZeros: true },
    });
  });

  it('rejects enum on a nullable string while keeping malformed enumLabels independent', () => {
    const result = compileField(
      { type: ['string', 'null'], enum: ['a'] },
      { enumLabels: 'invalid' },
    );

    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
          documentPath: ['properties', 'value', 'enum'],
          parameters: { keyword: 'enum', fieldType: 'string' },
        },
        {
          code: 'INVALID_UI_SCHEMA_VALUE',
          documentPath: ['fields', 'value', 'enumLabels'],
        },
      ],
    });
  });

  it.each([
    {
      label: 'empty',
      type: [],
      path: ['properties', 'value', 'type'],
      parameters: {
        field: 'value',
        expected: 'primitive type plus null',
        actualLength: 0,
      },
    },
    {
      label: 'sparse',
      type: new Array(2),
      path: ['properties', 'value', 'type', 0],
      parameters: {
        field: 'value',
        expected: 'null or primitive type',
        actualType: 'missing',
      },
    },
    {
      label: 'non-string',
      type: ['string', 1],
      path: ['properties', 'value', 'type', 1],
      parameters: {
        field: 'value',
        expected: 'null or primitive type',
        actualType: 'number',
        actualValue: 1,
      },
    },
    {
      label: 'unsupported member',
      type: ['string', 'object'],
      path: ['properties', 'value', 'type', 1],
      parameters: {
        field: 'value',
        expected: 'null or primitive type',
        reason: 'unsupported-type-member',
        actualType: 'string',
        actualValue: 'object',
      },
    },
    {
      label: 'duplicate null',
      type: ['null', 'null'],
      path: ['properties', 'value', 'type'],
      parameters: {
        field: 'value',
        expected: 'one primitive type and null',
        reason: 'duplicate-null',
      },
    },
    {
      label: 'duplicate primitive',
      type: ['string', 'string'],
      path: ['properties', 'value', 'type'],
      parameters: {
        field: 'value',
        expected: 'one primitive type and null',
        reason: 'duplicate-primitive',
      },
    },
    {
      label: 'missing null',
      type: ['string', 'number'],
      path: ['properties', 'value', 'type'],
      parameters: {
        field: 'value',
        expected: 'one primitive type and null',
        reason: 'missing-null',
      },
    },
  ])('reports the exact first $label failure', ({ type, path, parameters }) => {
    const result = compileField({ type, minLength: -1 });
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'UNSUPPORTED_FIELD_TYPE',
          dataPath: ['value'],
          documentPath: path,
          parameters,
          fallbackMessage: 'Field "value" has an unsupported type.',
        },
      ],
    });
    expect(result.diagnostics).toHaveLength(1);
  });

  it('rejects non-enumerable and accessor indices without reading them', () => {
    const nonEnumerable = ['string', 'null'];
    Object.defineProperty(nonEnumerable, 1, {
      value: 'null',
      enumerable: false,
    });
    expect(compileField({ type: nonEnumerable })).toMatchObject({
      success: false,
      diagnostics: [
        {
          documentPath: ['properties', 'value', 'type', 1],
          parameters: { actualType: 'non-enumerable' },
        },
      ],
    });

    const getter = vi.fn(() => 'null');
    const accessor = ['string', 'null'];
    Object.defineProperty(accessor, 1, { get: getter, enumerable: true });
    expect(compileField({ type: accessor })).toMatchObject({
      success: false,
      diagnostics: [
        {
          documentPath: ['properties', 'value', 'type', 1],
          parameters: { actualType: 'accessor' },
        },
      ],
    });
    expect(getter).not.toHaveBeenCalled();
  });

  it('rejects the first extra enumerable key after both indices', () => {
    const type = ['string', 'null'];
    Object.defineProperty(type, 'meta', { value: true, enumerable: true });
    const result = compileField({ type });
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          documentPath: ['properties', 'value', 'type', 'meta'],
          parameters: {
            field: 'value',
            reason: 'unexpected-type-array-member',
          },
        },
      ],
    });
  });

  it('does not execute iteration, coercion or hostile member-name hooks', () => {
    const iterator = vi.fn();
    const coercion = vi.fn();
    const type = ['string', 'null'];
    Object.defineProperties(type, {
      [Symbol.iterator]: { value: iterator },
      toString: { value: coercion },
    });
    const result = compileField({ type });

    expect(result.success).toBe(true);
    expect(iterator).not.toHaveBeenCalled();
    expect(coercion).not.toHaveBeenCalled();
  });

  it('propagates nullable through nested, template and reference paths', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        $defs: { value: { type: ['null', 'integer'] } },
        properties: {
          nested: {
            type: 'object',
            properties: { direct: { type: ['string', 'null'] } },
          },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                amount: { $ref: '#/$defs/value' },
              },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields).toMatchObject([
      { path: ['nested', 'direct'], nullable: true, kind: 'string' },
    ]);
    const rows = result.definition.nodes[1];
    expect(rows).toMatchObject({
      kind: 'array',
      item: {
        fields: [
          {
            relativePath: ['amount'],
            nullable: true,
            kind: 'number',
            numericType: 'integer',
          },
        ],
      },
    });
  });

  it('adds template and reference provenance to malformed arrays', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        $defs: { bad: { type: ['string', 'object'] } },
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                value: { $ref: '#/$defs/bad' },
              },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'UNSUPPORTED_FIELD_TYPE',
          dataPath: ['rows'],
          documentPath: ['$defs', 'bad', 'type', 1],
          parameters: {
            field: 'value',
            templatePath: ['value'],
            referenceChain: [
              ['properties', 'rows', 'items', 'properties', 'value', '$ref'],
            ],
          },
        },
      ],
    });
  });

  it('keeps nullable identity arrays owned by collection policy validation', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: { id: { type: ['string', 'null'] } },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_COLLECTION_POLICY',
    ]);
    expect(result).toMatchObject({
      success: false,
      diagnostics: [{ parameters: { reason: 'identity-schema-incompatible' } }],
    });
  });

  it('keeps nullable root, object, array and item-root attempts under their existing blockers', () => {
    const root = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: ['object', 'null'],
        properties: {},
      },
    });
    expect(root).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'ROOT_TYPE_MUST_BE_OBJECT',
          documentPath: ['type'],
          parameters: { actualType: 'array' },
        },
      ],
    });

    for (const [name, type, keyword, value] of [
      ['branch', ['object', 'null'], 'properties', {}],
      ['rows', ['null', 'array'], 'items', { type: 'object', properties: {} }],
    ] as const) {
      const result = compileFormDefinition({
        schema: {
          $schema: DIALECT,
          type: 'object',
          properties: { [name]: { type, [keyword]: value } },
        },
      });
      expect(result).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'UNSUPPORTED_FIELD_TYPE',
            dataPath: [name],
            documentPath: ['properties', name, 'type'],
            parameters: { field: name, actualType: 'array' },
          },
        ],
      });
      expect(result.diagnostics).toHaveLength(1);
    }

    const itemRoot = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: ['object', 'null'],
              properties: { id: { type: 'string' } },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(itemRoot).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'UNSUPPORTED_FIELD_TYPE',
          dataPath: ['rows'],
          documentPath: ['properties', 'rows', 'items', 'type'],
          parameters: { field: 'rows', actualType: 'array', templatePath: [] },
        },
      ],
    });
    expect(itemRoot.diagnostics).toHaveLength(1);
  });

  it('does not retain the source type array', () => {
    const type = ['string', 'null'];
    const result = compileField({ type });
    expect(result.success).toBe(true);
    if (!result.success) return;
    type[0] = 'boolean';
    expect(result.definition.fields[0]).toMatchObject({
      kind: 'string',
      nullable: true,
    });
  });
});
