import { describe, expect, it, vi } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type ArrayNodeDefinition,
} from '../src/index.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';

const contribution = (
  properties: Record<string, unknown>,
  required?: readonly string[],
) => ({
  type: 'object',
  properties,
  ...(required === undefined ? {} : { required }),
});

describe('static object allOf core conformance', () => {
  it('applies one use-site UI node to the combined effective catalog', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          contribution({ first: { type: 'string' } }),
          contribution({ second: { type: 'number' } }),
        ],
      },
      uiSchema: {
        order: ['second', 'first'],
        fields: {
          first: { label: 'First label' },
          second: { label: 'Second label' },
          ghost: { label: 'Ghost' },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields).toMatchObject([
      { name: 'second', label: 'Second label' },
      { name: 'first', label: 'First label' },
    ]);
    const unknown = result.diagnostics.find(
      ({ code }) => code === 'UNKNOWN_UI_FIELD',
    );
    expect(unknown).toMatchObject({
      source: 'ui-schema',
      dataPath: ['ghost'],
      documentPath: ['fields', 'ghost'],
    });
    expect(unknown?.documentPath).not.toContain('allOf');
    expect(unknown?.parameters).not.toHaveProperty('referenceChain');
  });

  it('applies one nested UI node across properties from distinct branches', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          profile: {
            allOf: [
              contribution({ first: { type: 'string' } }),
              contribution({ second: { type: 'boolean' } }),
            ],
          },
        },
      },
      uiSchema: {
        fields: {
          profile: {
            label: 'Combined profile',
            order: ['second', 'first'],
            fields: {
              first: { label: 'First nested' },
              second: { label: 'Second nested' },
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.nodes[0]).toMatchObject({
      name: 'profile',
      label: 'Combined profile',
      children: [
        { name: 'second', label: 'Second nested' },
        { name: 'first', label: 'First nested' },
      ],
    });
  });

  it('applies absolute collection policies to arrays contributed by a branch', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          contribution({
            rows: {
              type: 'array',
              items: contribution(
                { id: { type: 'string' }, name: { type: 'string' } },
                ['id', 'name'],
              ),
            },
          }),
        ],
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const rows = result.definition.nodes[0] as ArrayNodeDefinition;
    expect(rows).toMatchObject({
      path: ['rows'],
      identity: { property: 'id' },
      item: { children: [{ name: 'name', required: true }] },
    });
  });

  it('suppresses dependent identity diagnostics when item composition has no catalog', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          rows: { type: 'array', items: { allOf: [] } },
        },
      },
      collectionPolicies: [
        { path: ['rows'], itemIdentityProperty: 'id' },
        { path: ['independent'], itemIdentityProperty: 'id' },
      ],
    });

    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'UNUSED_COLLECTION_POLICY',
    ]);
    expect(result.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: 'INVALID_COLLECTION_POLICY' }),
    );
  });

  it('suppresses dependent identity diagnostics below a conflicting parent catalog', () => {
    const rows = {
      type: 'array',
      items: contribution({ name: { type: 'string' } }, ['name']),
    };
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          contribution({ rows }),
          contribution({ rows: { type: 'string' } }),
        ],
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INCOMPATIBLE_SCHEMA_COMPOSITION',
    ]);
  });

  it('retains identity diagnostics for an array unaffected by another duplicate', () => {
    const rows = {
      type: 'array',
      items: contribution({ name: { type: 'string' } }, ['name']),
    };
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          contribution({ rows, repeated: { type: 'string' } }),
          contribution({ repeated: { type: 'number' } }),
        ],
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INCOMPATIBLE_SCHEMA_COMPOSITION',
      'INVALID_COLLECTION_POLICY',
    ]);
  });

  it('delivers the exact original composed schema and complete value to validation', () => {
    const schema = {
      $schema: dialect,
      allOf: [
        contribution({ first: { type: 'string' } }, ['first']),
        contribution({ second: { type: 'number' } }),
      ],
    };
    const compiled = compileFormDefinition({ schema });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    const value = { first: 'Ada', second: 42, unmanaged: true };
    const validate = vi.fn(
      (receivedSchema: unknown, receivedValue: unknown) => {
        expect(receivedSchema).toBe(schema);
        expect(receivedValue).toBe(value);
        expect(receivedSchema).toHaveProperty('allOf');
        expect(receivedValue).toHaveProperty('unmanaged', true);
        return { valid: true, issues: [] };
      },
    );

    const created = createControlledFormRuntime({
      formId: 'composition',
      definition: compiled.definition,
      schema,
      value,
      baselineValue: value,
      locale: 'en',
      validator: { validate },
    });

    expect(created.success).toBe(true);
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('rejects allOf at an identity location without inspecting its branches', () => {
    let inspected = false;
    const identity: Record<string, unknown> = { type: 'object' };
    Object.defineProperty(identity, 'allOf', {
      enumerable: true,
      get() {
        inspected = true;
        return [contribution({ nested: { type: 'string' } })];
      },
    });
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: contribution({ id: identity }, ['id']),
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(inspected).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        dataPath: ['rows'],
        parameters: expect.objectContaining({
          keyword: 'allOf',
          fieldType: 'string',
          templatePath: ['id'],
        }) as unknown,
      }),
    );
    expect(result.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: 'INCOMPATIBLE_SCHEMA_COMPOSITION' }),
    );
  });
});
