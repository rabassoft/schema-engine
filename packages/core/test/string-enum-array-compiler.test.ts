import { describe, expect, it } from 'vitest';
import {
  compileFormDefinition,
  type StringEnumArrayFieldDefinition,
} from '../src/index.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';

function field(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    type: 'array',
    items: { type: 'string', enum: ['', 'editor', 'reviewer'] },
    uniqueItems: true,
    ...overrides,
  };
}

function schema(
  properties: Record<string, unknown>,
  required?: readonly string[],
): Record<string, unknown> {
  return {
    $schema: dialect,
    type: 'object',
    properties,
    ...(required === undefined ? {} : { required }),
  };
}

describe('M31 string-enum array compiler', () => {
  it('builds one exact deeply immutable ordinary leaf with detached ordered choices', () => {
    const values = ['', 'editor', 'reviewer'];
    const labels = { '': 'No role', reviewer: 'Can review' };
    const authored = {
      type: 'array',
      title: 'Roles',
      description: 'Assigned roles',
      default: ['editor'],
      items: { type: 'string', enum: values },
      uniqueItems: true,
    };
    const result = compileFormDefinition({
      schema: schema({ roles: authored }, ['roles']),
      uiSchema: {
        fields: {
          roles: {
            label: 'Permissions',
            hint: 'Choose one or more',
            tooltip: 'Role selector',
            enumLabels: labels,
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.diagnostics).toEqual([]);
    expect(result.definition.fields).toHaveLength(1);
    expect(result.definition.nodes[0]).toBe(result.definition.fields[0]);
    const compiled = result.definition.fields[0];
    if (compiled === undefined) return;
    expect(compiled).toEqual({
      key: '["roles"]',
      name: 'roles',
      path: ['roles'],
      required: true,
      nullable: false,
      label: 'Permissions',
      description: 'Assigned roles',
      hint: 'Choose one or more',
      tooltip: 'Role selector',
      kind: 'string-enum-array',
      choices: [
        { value: '', label: 'No role' },
        { value: 'editor', label: 'editor' },
        { value: 'reviewer', label: 'Can review' },
      ],
    } satisfies StringEnumArrayFieldDefinition);
    expect(compiled).not.toHaveProperty('placeholder');
    expect(compiled).not.toHaveProperty('fixedValue');
    expect(compiled).not.toHaveProperty('visibleWhen');
    expect(compiled).not.toHaveProperty('enabledWhen');
    expect(Object.isFrozen(compiled)).toBe(true);
    expect(Object.isFrozen(compiled.path)).toBe(true);
    if (compiled.kind !== 'string-enum-array') return;
    expect(Object.isFrozen(compiled.choices)).toBe(true);
    expect(compiled.choices.every(Object.isFrozen)).toBe(true);
    expect(compiled.choices).not.toBe(values);
    expect(values).toEqual(['', 'editor', 'reviewer']);
    expect(labels).toEqual({ '': 'No role', reviewer: 'Can review' });
  });

  it('compiles nested, local-reference, and disjoint composition use sites as ordinary leaves', () => {
    const nested = compileFormDefinition({
      schema: schema({
        profile: {
          type: 'object',
          properties: { roles: field() },
          required: ['roles'],
        },
      }),
    });
    expect(nested.success).toBe(true);
    if (nested.success) {
      expect(nested.definition.fields[0]).toMatchObject({
        kind: 'string-enum-array',
        path: ['profile', 'roles'],
        required: true,
      });
    }

    const referenced = compileFormDefinition({
      schema: {
        ...schema({ roles: { $ref: '#/$defs/roles' } }),
        $defs: { roles: field() },
      },
    });
    expect(referenced.success).toBe(true);
    if (referenced.success) {
      expect(referenced.definition.fields[0]).toMatchObject({
        kind: 'string-enum-array',
        path: ['roles'],
      });
    }

    const composed = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          { type: 'object', properties: { name: { type: 'string' } } },
          { type: 'object', properties: { roles: field() } },
        ],
      },
    });
    expect(composed.success).toBe(true);
    if (composed.success) {
      expect(composed.definition.fields).toMatchObject([
        { kind: 'string', path: ['name'] },
        { kind: 'string-enum-array', path: ['roles'] },
      ]);
    }
  });

  it('preserves reference provenance on exact item-enum diagnostics', () => {
    const result = compileFormDefinition({
      schema: {
        ...schema({ roles: { $ref: '#/$defs/roles' } }),
        $defs: {
          roles: {
            type: 'array',
            items: { type: 'string', enum: [] },
            uniqueItems: true,
          },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      dataPath: ['roles'],
      documentPath: ['$defs', 'roles', 'items', 'enum'],
      parameters: {
        keyword: 'enum',
        expected: 'non-empty array of unique strings',
        actualType: 'array',
        referenceChain: [['properties', 'roles', '$ref']],
      },
    });
  });

  it('blocks root and collection-template arrays before M31 descendants', () => {
    const root = compileFormDefinition({
      schema: { $schema: dialect, ...field() },
    });
    expect(root.success).toBe(false);
    expect(root.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'ROOT_TYPE_MUST_BE_OBJECT' }),
    );

    let itemsReads = 0;
    const nestedArray = Object.defineProperty({ type: 'array' }, 'items', {
      enumerable: true,
      get() {
        itemsReads += 1;
        return { type: 'string', enum: ['x'] };
      },
    });
    const collection = compileFormDefinition({
      schema: schema({
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              tags: nestedArray,
            },
            required: ['id'],
          },
        },
      }),
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(itemsReads).toBe(0);
    expect(
      collection.diagnostics.find(
        ({ code }) => code === 'UNSUPPORTED_FIELD_TYPE',
      ),
    ).toMatchObject({
      code: 'UNSUPPORTED_FIELD_TYPE',
      dataPath: ['rows'],
      parameters: {
        field: 'tags',
        reason: 'nested-array-not-supported',
        templatePath: ['tags'],
      },
    });
  });

  it('preserves M10 malformed-items expectations and collection policy behavior', () => {
    const malformed = compileFormDefinition({
      schema: schema({ rows: { type: 'array', items: null } }),
    });
    expect(malformed.diagnostics).toMatchObject([
      {
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        parameters: { expected: 'inline object item schema' },
      },
      { code: 'MISSING_COLLECTION_POLICY' },
    ]);

    const collection = compileFormDefinition({
      schema: schema({
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' } },
            required: ['id'],
          },
        },
      }),
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(collection.success).toBe(true);
    if (collection.success) {
      expect(collection.definition.nodes[0]).toMatchObject({ kind: 'array' });
      expect(collection.definition.fields).toEqual([]);
    }

    const atomicWithPolicy = compileFormDefinition({
      schema: schema({ roles: field() }),
      collectionPolicies: [{ path: ['roles'], itemIdentityProperty: 'id' }],
    });
    expect(atomicWithPolicy.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'UNUSED_COLLECTION_POLICY',
        parameters: { policyIndex: 0, arrayPath: ['roles'] },
      }),
    );
  });

  it('does not retain or recurse through shared and cyclic opaque schema extras', () => {
    const shared = { note: 'opaque' };
    const items = {
      type: 'string',
      enum: ['a'],
      firstExtension: shared,
      secondExtension: shared,
    } as Record<string, unknown>;
    items['cyclicExtension'] = items;
    const authored = field({ items, outerExtension: shared });
    const result = compileFormDefinition({
      schema: schema({ roles: authored }),
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'UNKNOWN_SCHEMA_KEYWORD',
      'UNKNOWN_SCHEMA_KEYWORD',
      'UNKNOWN_SCHEMA_KEYWORD',
      'UNKNOWN_SCHEMA_KEYWORD',
    ]);
    const compiled = result.definition.fields[0];
    expect(compiled).not.toBe(authored);
    expect(compiled).not.toHaveProperty('outerExtension');
    expect(Object.isFrozen(shared)).toBe(false);
  });

  it('classifies malformed items without inference and validates exact uniqueItems descriptors', () => {
    const malformedM31 = compileFormDefinition({
      schema: schema({
        roles: { type: 'array', items: null, uniqueItems: true },
      }),
    });
    expect(malformedM31.diagnostics[0]).toMatchObject({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      documentPath: ['properties', 'roles', 'items'],
      parameters: { expected: 'string-enum item schema', actualType: 'null' },
    });
    expect(
      malformedM31.diagnostics.some(({ documentPath }) =>
        documentPath?.includes('uniqueItems'),
      ),
    ).toBe(false);

    let itemsGetterCalls = 0;
    const accessorItems = Object.defineProperty(
      { type: 'array', uniqueItems: true },
      'items',
      {
        enumerable: true,
        get() {
          itemsGetterCalls += 1;
          return { type: 'string', enum: ['unsafe'] };
        },
      },
    );
    const accessorItemsResult = compileFormDefinition({
      schema: schema({ roles: accessorItems }),
    });
    expect(accessorItemsResult.diagnostics[0]).toMatchObject({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      documentPath: ['properties', 'roles', 'items'],
      parameters: {
        keyword: 'items',
        expected: 'string-enum item schema',
        actualType: 'accessor',
      },
    });
    expect(itemsGetterCalls).toBe(0);

    let getterCalls = 0;
    const accessorUnique = Object.defineProperty(
      {
        type: 'array',
        items: { type: 'string', enum: ['a'] },
      },
      'uniqueItems',
      {
        enumerable: true,
        get() {
          getterCalls += 1;
          return true;
        },
      },
    );
    const nonEnumerableUnique = field();
    Object.defineProperty(nonEnumerableUnique, 'uniqueItems', {
      enumerable: false,
      value: true,
    });
    const cases = [
      [field({ uniqueItems: undefined }), 'undefined', undefined],
      [field({ uniqueItems: false }), 'boolean', false],
      [field({ uniqueItems: 1 }), 'number', undefined],
      [accessorUnique, 'accessor', undefined],
      [nonEnumerableUnique, 'non-enumerable', undefined],
      [
        { type: 'array', items: { type: 'string', enum: ['a'] } },
        'missing',
        undefined,
      ],
    ] as const;
    for (const [candidate, expectedType, expectedValue] of cases) {
      const result = compileFormDefinition({
        schema: schema({ roles: candidate }),
      });
      expect(result.success).toBe(false);
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_SCHEMA_KEYWORD_VALUE',
          dataPath: ['roles'],
          documentPath: ['properties', 'roles', 'uniqueItems'],
          parameters: {
            keyword: 'uniqueItems',
            expected: 'true',
            actualType: expectedType,
            ...(expectedValue === undefined
              ? {}
              : { actualValue: expectedValue }),
          },
        }),
      );
    }
    expect(getterCalls).toBe(0);

    const unsupportedItemType = compileFormDefinition({
      schema: schema({
        roles: {
          type: 'array',
          items: { type: 'number', enum: ['a'] },
          uniqueItems: true,
        },
      }),
    });
    expect(unsupportedItemType.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_FIELD_TYPE',
        documentPath: ['properties', 'roles', 'items', 'type'],
      }),
    );
    expect(
      unsupportedItemType.diagnostics.some(
        ({ documentPath }) => documentPath?.at(-1) === 'uniqueItems',
      ),
    ).toBe(false);
  });

  it('reports every required item enum defect in ascending descriptor-safe order', () => {
    let getterCalls = 0;
    const accessorItem = Object.defineProperty({ type: 'string' }, 'enum', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return ['unsafe'];
      },
    });
    const sparse: unknown[] = ['first'];
    sparse[2] = 1;
    sparse[3] = 'first';
    sparse.length = 5;

    const cases = [
      [{ type: 'string' }, ['non-empty array of unique strings', 'missing']],
      [accessorItem, ['array of unique strings', 'accessor']],
      [
        { type: 'string', enum: [] },
        ['non-empty array of unique strings', 'array'],
      ],
    ] as const;
    for (const [items, [expected, actualType]] of cases) {
      const result = compileFormDefinition({
        schema: schema({
          roles: { type: 'array', items, uniqueItems: true },
        }),
      });
      expect(result.diagnostics[0]).toMatchObject({
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        documentPath: ['properties', 'roles', 'items', 'enum'],
        parameters: { expected, actualType },
      });
    }

    const indexed = compileFormDefinition({
      schema: schema({
        roles: {
          type: 'array',
          items: { type: 'string', enum: sparse },
          uniqueItems: true,
        },
      }),
    });
    expect(indexed.diagnostics.map(({ documentPath }) => documentPath)).toEqual(
      [
        ['properties', 'roles', 'items', 'enum', 1],
        ['properties', 'roles', 'items', 'enum', 2],
        ['properties', 'roles', 'items', 'enum', 3],
        ['properties', 'roles', 'items', 'enum', 4],
      ],
    );
    expect(
      indexed.diagnostics.map(({ parameters }) => parameters.expected),
    ).toEqual(['string', 'string', 'unique string', 'string']);
    expect(getterCalls).toBe(0);
  });

  it('keeps outer and item keyword catalogs distinct and deterministically ordered', () => {
    const result = compileFormDefinition({
      schema: schema({
        roles: field({
          minLength: 1,
          const: ['editor'],
          format: 'custom',
          extension: 'outer',
          items: {
            type: 'string',
            enum: ['editor'],
            title: 'Wrong location',
            format: 'email',
            const: 'editor',
            $ref: '#/$defs/ignored',
            deprecated: true,
            extension: 'item',
          },
        }),
      }),
    });

    expect(
      result.diagnostics.map(({ code, documentPath, parameters }) => ({
        code,
        documentPath,
        fieldType: parameters.fieldType,
      })),
    ).toEqual([
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'minLength'],
        fieldType: 'string-enum-array',
      },
      {
        code: 'UNSUPPORTED_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'const'],
        fieldType: undefined,
      },
      {
        code: 'IGNORED_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'format'],
        fieldType: undefined,
      },
      {
        code: 'UNKNOWN_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'extension'],
        fieldType: undefined,
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'items', 'title'],
        fieldType: 'string-enum-array-item',
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'items', 'format'],
        fieldType: 'string-enum-array-item',
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'items', 'const'],
        fieldType: 'string-enum-array-item',
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'items', '$ref'],
        fieldType: 'string-enum-array-item',
      },
      {
        code: 'IGNORED_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'items', 'deprecated'],
        fieldType: undefined,
      },
      {
        code: 'UNKNOWN_SCHEMA_KEYWORD',
        documentPath: ['properties', 'roles', 'items', 'extension'],
        fieldType: undefined,
      },
    ]);
  });

  it('normalizes partial labels, reports unknown labels, and isolates blocked schema labels', () => {
    const partial = compileFormDefinition({
      schema: schema({ roles: field() }),
      uiSchema: {
        fields: {
          roles: {
            enumLabels: { editor: 'Can edit', ghost: 'Unknown' },
          },
        },
      },
    });
    expect(partial.success).toBe(true);
    if (partial.success) {
      expect(partial.definition.fields[0]).toMatchObject({
        choices: [
          { value: '', label: '""' },
          { value: 'editor', label: 'Can edit' },
          { value: 'reviewer', label: 'reviewer' },
        ],
      });
      expect(partial.diagnostics).toContainEqual(
        expect.objectContaining({
          code: 'UNKNOWN_ENUM_LABEL',
          documentPath: ['fields', 'roles', 'enumLabels', 'ghost'],
        }),
      );
    }

    const invalidLabel = compileFormDefinition({
      schema: schema({ roles: field() }),
      uiSchema: { fields: { roles: { enumLabels: { editor: '   ' } } } },
    });
    expect(invalidLabel.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_UI_SCHEMA_VALUE',
        documentPath: ['fields', 'roles', 'enumLabels', 'editor'],
      }),
    );

    let getterCalls = 0;
    const hostileLabels = Object.defineProperty({}, 'editor', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'unsafe';
      },
    });
    const blocked = compileFormDefinition({
      schema: schema({ roles: field({ items: { type: 'string', enum: [] } }) }),
      uiSchema: { fields: { roles: { enumLabels: hostileLabels } } },
    });
    expect(getterCalls).toBe(0);
    expect(blocked.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
    ]);

    const malformedExterior = compileFormDefinition({
      schema: schema({ roles: field({ items: { type: 'string', enum: [] } }) }),
      uiSchema: { fields: { roles: { enumLabels: [] } } },
    });
    expect(malformedExterior.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'INVALID_UI_SCHEMA_VALUE',
    ]);
  });

  it('rejects field-incompatible UI and both condition members with the ADR-033 reason', () => {
    const result = compileFormDefinition({
      schema: schema({ roles: field() }),
      uiSchema: {
        fields: {
          roles: {
            placeholder: 'Choose',
            options: { decimalPlaces: 2, showTrailingZeros: true },
            item: {},
            order: [],
            fields: {},
            actions: {},
            visibleWhen: { path: ['source'], equals: 'x' },
            enabledWhen: { path: ['source'], equals: 'x' },
          },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_PLACEHOLDER',
        parameters: { field: 'roles', fieldType: 'string-enum-array' },
      }),
    );
    for (const option of ['decimalPlaces', 'showTrailingZeros']) {
      expect(
        result.diagnostics.find(
          ({ parameters }) => parameters.option === option,
        ),
      ).toMatchObject({
        code: 'INCOMPATIBLE_UI_OPTION',
        parameters: {
          field: 'roles',
          fieldType: 'string-enum-array',
          option,
        },
      });
    }
    for (const option of ['item', 'order', 'fields']) {
      expect(
        result.diagnostics.find(
          ({ parameters }) => parameters.option === option,
        ),
      ).toMatchObject({
        code: 'INCOMPATIBLE_UI_OPTION',
        parameters: {
          field: 'roles',
          fieldType: 'string-enum-array',
          option,
        },
      });
    }
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'UNKNOWN_UI_SCHEMA_KEY',
        documentPath: ['fields', 'roles', 'actions'],
      }),
    );
    const conditions = result.diagnostics.filter(
      ({ code }) => code === 'INVALID_UI_FIELD_CONDITION',
    );
    expect(conditions).toHaveLength(2);
    expect(
      conditions.map(({ parameters }) => ({
        member: parameters.member,
        reason: parameters.reason,
        targetKind: parameters.targetKind,
      })),
    ).toEqual([
      {
        member: 'visibleWhen',
        reason: 'unsupported-target-location',
        targetKind: 'array',
      },
      {
        member: 'enabledWhen',
        reason: 'unsupported-target-location',
        targetKind: 'array',
      },
    ]);

    const sourceResult = compileFormDefinition({
      schema: schema({ roles: field(), target: { type: 'string' } }),
      uiSchema: {
        fields: {
          target: { visibleWhen: { path: ['roles'], equals: 'editor' } },
        },
      },
    });
    expect(
      sourceResult.diagnostics.find(
        ({ parameters }) => parameters.reason === 'source-not-ordinary-field',
      ),
    ).toMatchObject({
      code: 'INVALID_UI_FIELD_CONDITION',
      parameters: {
        reason: 'source-not-ordinary-field',
        sourcePath: ['roles'],
        sourceReason: 'array',
      },
    });
  });
});
