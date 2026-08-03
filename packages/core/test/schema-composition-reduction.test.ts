import { describe, expect, it } from 'vitest';
import {
  compileFormDefinition,
  type ArrayNodeDefinition,
  type ObjectFieldDefinition,
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

describe('static object allOf contribution reduction', () => {
  it('flattens root contributions depth-first and unions cross-branch requiredness', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          contribution({ first: { type: 'string' } }, ['second']),
          {
            allOf: [
              contribution({ second: { type: 'number' } }),
              contribution({ third: { type: 'boolean' } }),
            ],
          },
        ],
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields.map(({ name }) => name)).toEqual([
      'first',
      'second',
      'third',
    ]);
    expect(result.definition.fields.map(({ required }) => required)).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('reduces nested object text while UI Schema retains precedence', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          profile: {
            title: 'Schema profile',
            allOf: [
              {
                ...contribution({ name: { type: 'string' } }, ['name']),
                description: 'Schema description',
              },
            ],
          },
        },
      },
      uiSchema: {
        fields: {
          profile: { label: 'UI profile', fields: { name: {} } },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const profile = result.definition.nodes[0] as ObjectFieldDefinition;
    expect(profile).toMatchObject({
      label: 'UI profile',
      description: 'Schema description',
      children: [{ name: 'name', required: true }],
    });
  });

  it('reports later duplicate and annotation sources with first provenance', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          {
            ...contribution({ name: { type: 'string' } }),
            title: 'First',
          },
          {
            ...contribution({ name: { type: 'string' } }),
            title: 'Second',
          },
        ],
      },
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_COMPOSITION',
        documentPath: ['allOf', 1, 'title'],
        parameters: {
          reason: 'conflicting-annotation',
          keyword: 'title',
          firstDocumentPath: ['allOf', 0, 'title'],
        },
      }),
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_COMPOSITION',
        documentPath: ['allOf', 1, 'properties', 'name'],
        parameters: {
          reason: 'duplicate-property',
          property: 'name',
          firstDocumentPath: ['allOf', 0, 'properties', 'name'],
        },
      }),
    );
  });

  it('retains canonical and reference provenance for pure local-ref branches', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        $defs: {
          first: contribution({ code: { type: 'string' } }),
          second: contribution({ code: { type: 'number' } }),
        },
        allOf: [{ $ref: '#/$defs/first' }, { $ref: '#/$defs/second' }],
      },
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_COMPOSITION',
        documentPath: ['$defs', 'second', 'properties', 'code'],
        parameters: {
          reason: 'duplicate-property',
          property: 'code',
          firstDocumentPath: ['$defs', 'first', 'properties', 'code'],
          firstReferenceChain: [['allOf', 0, '$ref']],
          referenceChain: [['allOf', 1, '$ref']],
        },
      }),
    );
  });

  it('composes collection item roots and preserves item template provenance', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              allOf: [
                contribution({ id: { type: 'string' } }, ['id']),
                contribution({ name: { type: 'string' } }, ['name']),
              ],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const rows = result.definition.nodes[0] as ArrayNodeDefinition;
    expect(rows.item.children.map(({ name }) => name)).toEqual(['name']);
    expect(rows.item.children[0]).toMatchObject({ required: true });
  });

  it('delays unmanaged required warnings until all contributions are known', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          contribution({}, ['later', 'missing']),
          contribution({ later: { type: 'string' } }),
        ],
      },
    });

    expect(result.success).toBe(true);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'UNMANAGED_REQUIRED_PROPERTY',
        dataPath: ['missing'],
        documentPath: ['allOf', 0, 'required', 1],
        parameters: { field: 'missing' },
      }),
    ]);
  });

  it('anchors an unsupported referenced target at its canonical path', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        $defs: { primitive: { type: 'string' } },
        allOf: [{ $ref: '#/$defs/primitive' }],
      },
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_COMPOSITION',
        documentPath: ['$defs', 'primitive'],
        parameters: {
          reason: 'unsupported-branch-kind',
          branchIndex: 0,
          expected:
            'object contribution, local reference or nested object composition',
          referenceChain: [['allOf', 0, '$ref']],
        },
      }),
    );
  });

  it('does not traverse a later duplicate property subtree', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [
          contribution({ value: { type: 'string' } }),
          contribution({ value: { type: 'object' } }),
        ],
      },
    });

    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INCOMPATIBLE_SCHEMA_COMPOSITION',
    ]);
  });

  it('distinguishes raw composition and canonical reference cycles', () => {
    const raw: Record<string, unknown> = { allOf: [] };
    raw.allOf = [raw];
    const rawResult = compileFormDefinition({
      schema: { $schema: dialect, ...raw },
    });
    expect(rawResult.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'CYCLIC_SCHEMA_OBJECT',
        documentPath: ['allOf', 0, 'allOf', 0],
        parameters: { firstDocumentPath: ['allOf', 0] },
      }),
    );

    const referenceResult = compileFormDefinition({
      schema: {
        $schema: dialect,
        $defs: {
          recursive: { allOf: [{ $ref: '#/$defs/recursive' }] },
        },
        allOf: [{ $ref: '#/$defs/recursive' }],
      },
    });
    expect(referenceResult.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'CYCLIC_SCHEMA_REFERENCE' }),
    );
  });

  it('permits repeated acyclic composed-object sharing at sibling use sites', () => {
    const shared = {
      allOf: [contribution({ value: { type: 'string' } }, ['value'])],
    };
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { first: shared, second: shared },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.nodes).toMatchObject([
      { name: 'first', children: [{ name: 'value' }] },
      { name: 'second', children: [{ name: 'value' }] },
    ]);
  });

  it('handles deep finite nested wrappers without recursive call-stack growth', () => {
    let current: Record<string, unknown> = contribution({
      value: { type: 'string' },
    });
    for (let index = 0; index < 2_000; index += 1) {
      current = { allOf: [current] };
    }
    const result = compileFormDefinition({
      schema: { $schema: dialect, ...current },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields[0]?.name).toBe('value');
  });

  it('contains a hostile reflection failure during contribution reduction', () => {
    const properties = new Proxy(
      { value: { type: 'string' } },
      {
        ownKeys() {
          throw new Error('must not escape');
        },
      },
    );
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        allOf: [{ type: 'object', properties }],
      },
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_COMPILER_INPUT',
        parameters: { actualType: 'object' },
      }),
    );
  });

  it('freezes copied conflict provenance without retaining mutable paths', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        $defs: {
          first: contribution({ value: { type: 'string' } }),
        },
        allOf: [
          { $ref: '#/$defs/first' },
          contribution({ value: { type: 'number' } }),
        ],
      },
    });
    const conflict = result.diagnostics.find(
      ({ code }) => code === 'INCOMPATIBLE_SCHEMA_COMPOSITION',
    );

    expect(Object.isFrozen(conflict)).toBe(true);
    expect(Object.isFrozen(conflict?.parameters)).toBe(true);
    expect(Object.isFrozen(conflict?.parameters.firstDocumentPath)).toBe(true);
    expect(Object.isFrozen(conflict?.parameters.firstReferenceChain)).toBe(
      true,
    );
  });

  it('retains absolute item data and relative template paths on conflicts', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              allOf: [
                contribution(
                  { id: { type: 'string' }, name: { type: 'string' } },
                  ['id'],
                ),
                contribution({ name: { type: 'number' } }),
              ],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_COMPOSITION',
        dataPath: ['rows'],
        documentPath: [
          'properties',
          'rows',
          'items',
          'allOf',
          1,
          'properties',
          'name',
        ],
        parameters: expect.objectContaining({
          reason: 'duplicate-property',
          templatePath: [],
        }) as unknown,
      }),
    );
  });

  it('selects equal annotations once and never reads opaque defaults', () => {
    const branch = contribution({ value: { type: 'string' } });
    Object.defineProperty(branch, 'title', {
      value: 'Shared title',
      enumerable: true,
    });
    Object.defineProperty(branch, 'default', {
      enumerable: true,
      get() {
        throw new Error('opaque default must not be read');
      },
    });
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          group: { title: 'Shared title', allOf: [branch] },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.nodes[0]).toMatchObject({
      label: 'Shared title',
      children: [{ name: 'value' }],
    });
  });
});
