import { describe, expect, it } from 'vitest';
import { compileFormDefinition } from '../src/index.js';
import { inspectCompositionFoundation } from '../src/internal/schema-composition.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';

function contribution(name = 'value') {
  return {
    type: 'object',
    properties: { [name]: { type: 'string' } },
  };
}

describe('static object allOf composition foundation', () => {
  it('recognizes a valid wrapper without completing contribution reduction', () => {
    const result = inspectCompositionFoundation(
      { type: 'object', allOf: [contribution()] },
      { useSite: 'root', documentPath: [] },
    );

    expect(result).toEqual({
      kind: 'wrapper',
      blocked: false,
      exteriorValid: true,
      diagnostics: [],
      branches: [
        {
          type: 'object',
          properties: { value: { type: 'string' } },
        },
      ],
    });
  });

  it('inspects deeply nested wrapper exteriors iteratively', () => {
    let branch: Record<string, unknown> = contribution();
    for (let index = 0; index < 2_000; index += 1) {
      branch = { allOf: [branch] };
    }

    const result = inspectCompositionFoundation(branch, {
      useSite: 'root',
      documentPath: [],
    });

    expect(result.kind).toBe('wrapper');
    if (result.kind !== 'wrapper') return;
    expect(result.blocked).toBe(false);
    expect(result.exteriorValid).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('reports each allOf exterior failure at its exact precedence point', () => {
    let getterCalls = 0;
    const accessorSchema = Object.defineProperty({}, 'allOf', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return [contribution()];
      },
    });
    const hiddenSchema = Object.defineProperty({}, 'allOf', {
      enumerable: false,
      value: [contribution()],
    });
    const sparse: unknown[] = [];
    sparse.length = 1;
    const accessorEntry: unknown[] = [];
    Object.defineProperty(accessorEntry, '0', {
      enumerable: true,
      configurable: true,
      get() {
        getterCalls += 1;
        return contribution();
      },
    });
    accessorEntry.length = 1;
    const hiddenEntry = [contribution()];
    Object.defineProperty(hiddenEntry, '0', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: contribution(),
    });
    const extra = [contribution()] as Array<unknown> & { extra?: boolean };
    extra.extra = true;

    const cases: Array<{
      readonly schema: Record<string, unknown>;
      readonly documentPath: readonly (string | number)[];
      readonly parameters: Readonly<Record<string, unknown>>;
    }> = [
      {
        schema: accessorSchema,
        documentPath: ['allOf'],
        parameters: {
          expected: 'non-empty dense array of object schemas',
          actualType: 'accessor',
        },
      },
      {
        schema: hiddenSchema,
        documentPath: ['allOf'],
        parameters: {
          expected: 'non-empty dense array of object schemas',
          actualType: 'non-enumerable',
        },
      },
      {
        schema: { allOf: null },
        documentPath: ['allOf'],
        parameters: {
          expected: 'non-empty dense array of object schemas',
          actualType: 'null',
        },
      },
      {
        schema: { allOf: [] },
        documentPath: ['allOf'],
        parameters: {
          expected: 'positive safe integer length',
          reason: 'invalid-allof-length',
          actualType: 'number',
          actualLength: 0,
        },
      },
      {
        schema: { allOf: sparse },
        documentPath: ['allOf', 0],
        parameters: {
          expected: 'ordinary schema object',
          actualType: 'missing',
        },
      },
      {
        schema: { allOf: accessorEntry },
        documentPath: ['allOf', 0],
        parameters: {
          expected: 'ordinary schema object',
          actualType: 'accessor',
        },
      },
      {
        schema: { allOf: hiddenEntry },
        documentPath: ['allOf', 0],
        parameters: {
          expected: 'ordinary schema object',
          actualType: 'non-enumerable',
        },
      },
      {
        schema: { allOf: [42] },
        documentPath: ['allOf', 0],
        parameters: {
          expected: 'ordinary schema object',
          actualType: 'number',
        },
      },
      {
        schema: { allOf: extra },
        documentPath: ['allOf', 'extra'],
        parameters: {
          expected: 'dense array indices only',
          reason: 'unexpected-allof-member',
        },
      },
    ];

    for (const value of cases) {
      const result = inspectCompositionFoundation(value.schema, {
        useSite: 'root',
        documentPath: [],
      });
      expect(result.kind).toBe('wrapper');
      if (result.kind !== 'wrapper') continue;
      expect(result).toMatchObject({ blocked: true, exteriorValid: false });
      expect(result.diagnostics).toMatchObject([
        {
          code: 'INVALID_SCHEMA_KEYWORD_VALUE',
          severity: 'error',
          source: 'schema',
          documentPath: value.documentPath,
          parameters: { keyword: 'allOf', ...value.parameters },
          fallbackMessage: 'Schema keyword "allOf" has an invalid value.',
        },
      ]);
    }
    expect(getterCalls).toBe(0);
  });

  it('orders wrapper type, siblings, exterior and branches without reading sibling values', () => {
    let getterCalls = 0;
    const schema = Object.defineProperties(
      {
        required: ['ignored'],
        'x-note': { opaque: true },
        allOf: [{ type: 'string' }, { type: 'number' }],
      },
      {
        type: {
          enumerable: true,
          get() {
            getterCalls += 1;
            return 'object';
          },
        },
        properties: {
          enumerable: true,
          get() {
            getterCalls += 1;
            return {};
          },
        },
      },
    );

    const result = inspectCompositionFoundation(schema, {
      useSite: 'root',
      documentPath: [],
    });

    expect(getterCalls).toBe(0);
    expect(result.kind).toBe('wrapper');
    if (result.kind !== 'wrapper') return;
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'INCOMPATIBLE_SCHEMA_KEYWORD',
      'UNKNOWN_SCHEMA_KEYWORD',
      'INCOMPATIBLE_SCHEMA_KEYWORD',
      'INCOMPATIBLE_SCHEMA_COMPOSITION',
      'INCOMPATIBLE_SCHEMA_COMPOSITION',
    ]);
    expect(result.diagnostics.at(-2)).toMatchObject({
      documentPath: ['allOf', 0],
      parameters: { reason: 'unsupported-branch-kind', branchIndex: 0 },
    });
    expect(result.diagnostics.at(-1)).toMatchObject({
      documentPath: ['allOf', 1],
      parameters: { reason: 'unsupported-branch-kind', branchIndex: 1 },
    });
  });

  it('integrates root and managed-property failures without ordinary shape cascades', () => {
    const root = compileFormDefinition({
      schema: { $schema: dialect, allOf: [] },
    });
    const property = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { profile: { allOf: [] } },
      },
    });
    const malformedType = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          profile: { type: 42, allOf: [contribution('name')] },
        },
      },
    });

    expect(root.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
    ]);
    expect(root.diagnostics[0]).not.toHaveProperty('dataPath');
    expect(property.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
    ]);
    expect(property.diagnostics[0]).toMatchObject({
      dataPath: ['profile'],
      documentPath: ['properties', 'profile', 'allOf'],
    });
    expect(malformedType.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
    ]);
    expect(malformedType.diagnostics[0]).toMatchObject({
      dataPath: ['profile'],
      documentPath: ['properties', 'profile', 'type'],
      parameters: {
        keyword: 'type',
        expected: '"object"',
        actualType: 'number',
      },
    });
    expect(root).not.toHaveProperty('definition');
    expect(property).not.toHaveProperty('definition');
    expect(malformedType).not.toHaveProperty('definition');
  });

  it('classifies allOf wrappers before competing direct references', () => {
    const property = compileFormDefinition({
      schema: {
        $schema: dialect,
        $defs: { target: contribution() },
        type: 'object',
        properties: {
          profile: {
            $ref: '#/$defs/target',
            allOf: [contribution('alias')],
          },
        },
      },
    });
    const item = compileFormDefinition({
      schema: {
        $schema: dialect,
        $defs: { row: contribution('id') },
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              $ref: '#/$defs/row',
              allOf: [contribution('name')],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(property.diagnostics[0]).toMatchObject({
      code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
      dataPath: ['profile'],
      documentPath: ['properties', 'profile', '$ref'],
      parameters: { keyword: '$ref', fieldType: 'composition' },
    });
    expect(property.diagnostics.map(({ code }) => code)).not.toContain(
      'INVALID_SCHEMA_REFERENCE',
    );
    expect(
      item.diagnostics.find(
        ({ documentPath }) => documentPath?.at(-1) === '$ref',
      ),
    ).toMatchObject({
      code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
      dataPath: ['rows'],
      parameters: {
        keyword: '$ref',
        fieldType: 'composition',
        templatePath: [],
      },
    });

    const target = compileFormDefinition({
      schema: {
        $schema: dialect,
        $defs: {
          ordinary: contribution('name'),
          wrapper: {
            $ref: '#/$defs/ordinary',
            allOf: [contribution('alias')],
          },
        },
        type: 'object',
        properties: { profile: { $ref: '#/$defs/wrapper' } },
      },
    });
    expect(target.diagnostics[0]).toMatchObject({
      code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
      dataPath: ['profile'],
      documentPath: ['$defs', 'wrapper', '$ref'],
      parameters: {
        keyword: '$ref',
        fieldType: 'composition',
        referenceChain: [['properties', 'profile', '$ref']],
      },
    });
  });

  it('diagnoses allOf on primitive, nullable and array locations without reading it', () => {
    let getterCalls = 0;
    const withAllOfAccessor = <T extends object>(value: T): T =>
      Object.defineProperty(value, 'allOf', {
        enumerable: true,
        get() {
          getterCalls += 1;
          return [contribution()];
        },
      });
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          primitive: withAllOfAccessor({ type: 'string' }),
          nullable: withAllOfAccessor({ type: ['null', 'number'] }),
          rows: withAllOfAccessor({
            type: 'array',
            items: {
              type: 'object',
              properties: { id: { type: 'string' } },
              required: ['id'],
            },
          }),
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(getterCalls).toBe(0);
    expect(
      result.diagnostics
        .filter(({ documentPath }) => documentPath?.at(-1) === 'allOf')
        .map(({ code, parameters }) => ({ code, parameters })),
    ).toEqual([
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        parameters: { keyword: 'allOf', fieldType: 'string' },
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        parameters: { keyword: 'allOf', fieldType: 'number' },
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        parameters: { keyword: 'allOf', fieldType: 'array' },
      },
    ]);
  });

  it('retains referenced-source and item-template envelopes', () => {
    const referenced = compileFormDefinition({
      schema: {
        $schema: dialect,
        $defs: { profile: { allOf: [] } },
        type: 'object',
        properties: { profile: { $ref: '#/$defs/profile' } },
      },
    });
    const item = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          rows: { type: 'array', items: { allOf: [] } },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    const nestedItem = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                profile: { allOf: [] },
              },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(referenced.diagnostics[0]).toMatchObject({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      dataPath: ['profile'],
      documentPath: ['$defs', 'profile', 'allOf'],
      parameters: {
        reason: 'invalid-allof-length',
        referenceChain: [['properties', 'profile', '$ref']],
      },
    });
    expect(
      item.diagnostics.find(
        ({ code, documentPath }) =>
          code === 'INVALID_SCHEMA_KEYWORD_VALUE' &&
          documentPath?.at(-1) === 'allOf',
      ),
    ).toMatchObject({
      dataPath: ['rows'],
      documentPath: ['properties', 'rows', 'items', 'allOf'],
      parameters: { templatePath: [], reason: 'invalid-allof-length' },
    });
    expect(
      nestedItem.diagnostics.find(
        ({ code, documentPath }) =>
          code === 'INVALID_SCHEMA_KEYWORD_VALUE' &&
          documentPath?.at(-2) === 'profile',
      ),
    ).toMatchObject({
      dataPath: ['rows'],
      documentPath: [
        'properties',
        'rows',
        'items',
        'properties',
        'profile',
        'allOf',
      ],
      parameters: {
        templatePath: ['profile'],
        reason: 'invalid-allof-length',
      },
    });
  });

  it('contains composition reflection traps as compiler input failures', () => {
    let trapCalls = 0;
    const hostileAllOf = new Proxy([contribution()], {
      getOwnPropertyDescriptor() {
        trapCalls += 1;
        throw new Error('hostile composition reflection');
      },
    });

    const compile = () =>
      compileFormDefinition({
        schema: {
          $schema: dialect,
          type: 'object',
          properties: {
            profile: { type: 'object', allOf: hostileAllOf },
          },
        },
      });

    expect(compile).not.toThrow();
    const result = compile();
    expect(trapCalls).toBeGreaterThan(0);
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_COMPILER_INPUT',
          severity: 'error',
          source: 'schema',
          dataPath: ['profile'],
          documentPath: ['properties', 'profile'],
          parameters: { actualType: 'object' },
        },
      ],
    });
  });

  it('continues independent UI inspection and never returns a partial definition', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { profile: { allOf: [{ type: 'string' }] } },
      },
      uiSchema: 42,
    });

    expect(result.success).toBe(false);
    expect(result).not.toHaveProperty('definition');
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INCOMPATIBLE_SCHEMA_COMPOSITION',
      'INVALID_UI_SCHEMA',
    ]);
  });
});
