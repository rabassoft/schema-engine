import { describe, expect, it } from 'vitest';
import {
  compileFormDefinition,
  type ArrayNodeDefinition,
} from '../src/index.js';
import { validateCollectionFormDefinition } from '../src/internal/nested-definition.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

function collectionSchema() {
  return {
    $schema: DIALECT,
    type: 'object',
    properties: {
      rows: {
        type: 'array',
        title: 'Rows',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', minLength: 1 },
            details: {
              type: 'object',
              properties: { active: { type: 'boolean' } },
              required: ['active'],
            },
          },
          required: ['id', 'name'],
        },
      },
    },
  };
}

function policy(path: readonly string[] = ['rows']) {
  return [{ path, itemIdentityProperty: 'id' }];
}

describe('M10 collection compiler', () => {
  it('builds an immutable array definition and ordered item template without projecting identity globally', () => {
    const result = compileFormDefinition({
      schema: collectionSchema(),
      collectionPolicies: policy(),
      uiSchema: {
        fields: {
          rows: {
            label: 'People',
            item: {
              order: ['details', 'name'],
              fields: {
                name: { label: 'Full name' },
                details: {
                  label: 'Flags',
                  fields: { active: { label: 'Enabled' } },
                },
              },
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const collection = result.definition.nodes[0] as ArrayNodeDefinition;
    expect(collection).toMatchObject({
      kind: 'array',
      key: '["rows"]',
      path: ['rows'],
      label: 'People',
      identity: { property: 'id' },
      item: {
        kind: 'item-template',
        children: [
          {
            kind: 'object',
            relativePath: ['details'],
            label: 'Flags',
            children: [
              {
                kind: 'boolean',
                nullable: false,
                relativePath: ['details', 'active'],
                label: 'Enabled',
              },
            ],
          },
          {
            kind: 'string',
            nullable: false,
            relativePath: ['name'],
            label: 'Full name',
          },
        ],
        fields: [
          { relativePath: ['details', 'active'] },
          { relativePath: ['name'] },
        ],
      },
    });
    expect(collection.item.children.some(({ name }) => name === 'id')).toBe(
      false,
    );
    expect(result.definition.fields).toEqual([]);
    expect(validateCollectionFormDefinition(result.definition)).toEqual({
      success: true,
    });
    expect(Object.isFrozen(collection.item.fields)).toBe(true);
  });

  it('reports missing, unused, and incompatible policies with exact envelopes', () => {
    const missing = compileFormDefinition({ schema: collectionSchema() });
    expect(missing.success).toBe(false);
    expect(missing.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_COLLECTION_POLICY',
        dataPath: ['rows'],
        parameters: { arrayPath: ['rows'] },
      }),
    );

    const unused = compileFormDefinition({
      schema: collectionSchema(),
      collectionPolicies: policy(['other']),
    });
    expect(unused.diagnostics.map(({ code }) => code)).toEqual([
      'MISSING_COLLECTION_POLICY',
      'UNUSED_COLLECTION_POLICY',
    ]);

    const schema = collectionSchema();
    schema.properties.rows.items.required = ['name'];
    const incompatible = compileFormDefinition({
      schema,
      collectionPolicies: policy(),
    });
    expect(incompatible.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_COLLECTION_POLICY',
        dataPath: ['rows'],
        parameters: {
          reason: 'identity-property-not-required',
          policyIndex: 0,
          member: 'itemIdentityProperty',
          expected: 'required item property',
        },
      }),
    );
  });

  it('rejects hostile policy containers without invoking accessors', () => {
    let executed = false;
    const entry = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(entry, 'path', {
      enumerable: true,
      get() {
        executed = true;
        return ['rows'];
      },
    });
    Object.defineProperty(entry, 'itemIdentityProperty', {
      enumerable: true,
      value: 'id',
    });
    const result = compileFormDefinition({
      schema: collectionSchema(),
      collectionPolicies: [entry as never],
    });
    expect(executed).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'INVALID_COLLECTION_POLICY',
      parameters: {
        reason: 'member-accessor',
        policyIndex: 0,
        member: 'path',
        expected: 'non-empty string-only path',
      },
    });
  });

  it('uses array paths plus templatePath and stops nested arrays before items traversal', () => {
    const schema = collectionSchema();
    let executed = false;
    schema.properties.rows.items.properties.details = {
      type: 'array',
      get items() {
        executed = true;
        return schema.properties.rows;
      },
    } as never;
    const result = compileFormDefinition({
      schema,
      collectionPolicies: policy(),
    });
    expect(executed).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_FIELD_TYPE',
        dataPath: ['rows'],
        documentPath: [
          'properties',
          'rows',
          'items',
          'properties',
          'details',
          'type',
        ],
        parameters: {
          field: 'details',
          reason: 'nested-array-not-supported',
          templatePath: ['details'],
        },
      }),
    );
  });

  it('does not call a matched policy unused when the target array has invalid items', () => {
    const schema = collectionSchema();
    schema.properties.rows.items = null as never;
    const result = compileFormDefinition({
      schema,
      collectionPolicies: policy(),
    });
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
    ]);
  });

  it('classifies direct string items as the atomic M31 family before item members', () => {
    const schema = collectionSchema();
    schema.properties.rows.items = {
      title: 'Not allowed',
      type: 'string',
      properties: null,
    } as never;
    const result = compileFormDefinition({
      schema,
      collectionPolicies: policy(),
    });
    expect(result.diagnostics.slice(0, 3)).toMatchObject([
      {
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        documentPath: ['properties', 'rows', 'uniqueItems'],
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        documentPath: ['properties', 'rows', 'items', 'title'],
        parameters: { fieldType: 'string-enum-array-item' },
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        documentPath: ['properties', 'rows', 'items', 'properties'],
        parameters: { fieldType: 'string-enum-array-item' },
      },
    ]);
  });

  it('classifies items on non-array nodes as incompatible', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          value: { type: 'string', items: {} },
          group: { type: 'object', properties: {}, items: {} },
        },
      },
    });
    expect(
      result.diagnostics.map(({ code, parameters }) => ({ code, parameters })),
    ).toEqual([
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        parameters: { keyword: 'items', fieldType: 'string' },
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        parameters: { keyword: 'items', fieldType: 'object' },
      },
    ]);
  });

  it('compiles independent arrays at root and below an ordinary object', () => {
    const item = collectionSchema().properties.rows.items;
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          rootRows: { type: 'array', items: item },
          group: {
            type: 'object',
            properties: { nestedRows: { type: 'array', items: item } },
          },
        },
      },
      collectionPolicies: [
        { path: ['rootRows'], itemIdentityProperty: 'id' },
        { path: ['group', 'nestedRows'], itemIdentityProperty: 'id' },
      ],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.nodes).toMatchObject([
      { kind: 'array', path: ['rootRows'] },
      {
        kind: 'object',
        children: [{ kind: 'array', path: ['group', 'nestedRows'] }],
      },
    ]);
  });

  it('compiles a deep finite item template without recursive traversal', () => {
    const depth = 1_200;
    let child: Record<string, unknown> = { type: 'string' };
    for (let index = depth - 1; index >= 0; index -= 1) {
      child = {
        type: 'object',
        properties: { [`level-${index}`]: child },
      };
    }
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: { id: { type: 'string' }, root: child },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: policy(),
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const collection = result.definition.nodes[0] as ArrayNodeDefinition;
    expect(collection.item.fields[0]?.relativePath).toHaveLength(depth + 1);
  });

  it('rejects identity UI entries and preserves template diagnostic paths', () => {
    const result = compileFormDefinition({
      schema: collectionSchema(),
      collectionPolicies: policy(),
      uiSchema: {
        fields: {
          rows: {
            item: {
              fields: {
                id: { label: 'Editable ID' },
                name: { options: { decimalPlaces: 2 } },
              },
            },
          },
        },
      },
    });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_UI_OPTION',
        dataPath: ['rows'],
        documentPath: ['fields', 'rows', 'item', 'fields', 'id'],
        parameters: {
          field: 'id',
          fieldType: 'string',
          option: 'identity',
          reason: 'identity-property',
          templatePath: ['id'],
        },
      }),
    );
    const optionDiagnostic = result.diagnostics.find(
      ({ code, parameters }) =>
        code === 'INCOMPATIBLE_UI_OPTION' &&
        parameters.option === 'decimalPlaces',
    );
    expect(optionDiagnostic).toMatchObject({
      dataPath: ['rows'],
      parameters: { templatePath: ['name'] },
    });
  });

  it('detects a cycle from an array UI node into its item without recursing', () => {
    const arrayUi: Record<string, unknown> = {};
    arrayUi.item = arrayUi;
    const result = compileFormDefinition({
      schema: collectionSchema(),
      collectionPolicies: policy(),
      uiSchema: { fields: { rows: arrayUi } },
    });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'CYCLIC_UI_SCHEMA_OBJECT',
        dataPath: ['rows'],
        documentPath: ['fields', 'rows', 'item'],
        parameters: { firstDocumentPath: ['fields', 'rows'] },
      }),
    );
  });
});
