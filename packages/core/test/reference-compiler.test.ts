import { describe, expect, it } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
} from '../src/index.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';

function schemaWith(
  definitions: Record<string, unknown>,
  properties: Record<string, unknown>,
): Record<string, unknown> {
  return {
    $schema: dialect,
    $defs: definitions,
    type: 'object',
    properties,
  };
}

describe('compileFormDefinition local references', () => {
  it('normalizes one target independently at distinct managed use sites', () => {
    const result = compileFormDefinition({
      schema: {
        ...schemaWith(
          { text: { type: 'string', minLength: 2 } },
          {
            first: { $ref: '#/$defs/text' },
            second: { $ref: '#/$defs/text' },
          },
        ),
        required: ['first'],
      },
      uiSchema: {
        fields: {
          first: { label: 'First label' },
          second: { label: 'Second label' },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields).toMatchObject([
      {
        key: '["first"]',
        path: ['first'],
        required: true,
        label: 'First label',
        constraints: { minLength: 2 },
      },
      {
        key: '["second"]',
        path: ['second'],
        required: false,
        label: 'Second label',
        constraints: { minLength: 2 },
      },
    ]);
  });

  it('reports registry entries before root reference and ordinary root diagnostics', () => {
    const schema: Record<string, unknown> = {
      $schema: dialect,
      $defs: { bad: 1 },
      $ref: 42,
      type: 'string',
      properties: {},
    };
    const result = compileFormDefinition({ schema });

    expect(result.success).toBe(false);
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'INVALID_SCHEMA_REFERENCE',
      'ROOT_TYPE_MUST_BE_OBJECT',
    ]);
    expect(result.diagnostics[0]).toMatchObject({
      documentPath: ['$defs', 'bad'],
      parameters: {
        keyword: '$defs',
        definition: 'bad',
        expected: 'ordinary schema object',
        actualType: 'number',
      },
    });
    expect(result.diagnostics[1]).toMatchObject({
      documentPath: ['$ref'],
      parameters: {
        reason: 'root-reference-not-supported',
        referenceChain: [['$ref']],
      },
    });
  });

  it('collects invalid reference shape and source-ordered siblings but blocks its target', () => {
    const result = compileFormDefinition({
      schema: schemaWith(
        { target: { type: 'string', minLength: -1 } },
        {
          value: {
            $ref: 1,
            title: 'incompatible',
            format: 'ignored without reading for classification',
            extension: 'opaque',
          },
        },
      ),
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_REFERENCE',
      'INCOMPATIBLE_SCHEMA_KEYWORD',
      'IGNORED_SCHEMA_KEYWORD',
      'UNKNOWN_SCHEMA_KEYWORD',
    ]);
    expect(
      result.diagnostics.every((entry) =>
        Object.hasOwn(entry.parameters, 'referenceChain'),
      ),
    ).toBe(true);
  });

  it('keeps target document paths, use-site data paths and nested provenance', () => {
    const result = compileFormDefinition({
      schema: schemaWith(
        {
          outer: { $ref: '#/$defs/inner' },
          inner: { type: 'string', minLength: -1 },
        },
        { value: { $ref: '#/$defs/outer' } },
      ),
    });

    expect(result.success).toBe(false);
    expect(result.diagnostics).toEqual([
      {
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        severity: 'error',
        source: 'schema',
        dataPath: ['value'],
        documentPath: ['$defs', 'inner', 'minLength'],
        parameters: {
          keyword: 'minLength',
          expected: 'non-negative integer',
          actualType: 'number',
          actualValue: -1,
          referenceChain: [
            ['properties', 'value', '$ref'],
            ['$defs', 'outer', '$ref'],
          ],
        },
        fallbackMessage: 'Schema keyword "minLength" has an invalid value.',
      },
    ]);
    expect(
      Object.isFrozen(result.diagnostics[0]?.parameters.referenceChain),
    ).toBe(true);
  });

  it('separates reference-path cycles from raw containment cycles', () => {
    const referenceCycle = compileFormDefinition({
      schema: schemaWith(
        {
          a: { type: 'object', properties: { next: { $ref: '#/$defs/a' } } },
        },
        { value: { $ref: '#/$defs/a' } },
      ),
    });
    expect(referenceCycle.success).toBe(false);
    expect(referenceCycle.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'CYCLIC_SCHEMA_REFERENCE',
        dataPath: ['value', 'next'],
        documentPath: ['$defs', 'a', 'properties', 'next', '$ref'],
        parameters: {
          firstDocumentPath: ['$defs', 'a'],
          referenceChain: [
            ['properties', 'value', '$ref'],
            ['$defs', 'a', 'properties', 'next', '$ref'],
          ],
        },
      }),
    );

    const cyclic: Record<string, unknown> = { type: 'object' };
    cyclic.properties = { next: cyclic };
    const rawCycle = compileFormDefinition({
      schema: schemaWith({}, { value: cyclic }),
    });
    expect(rawCycle.diagnostics.map(({ code }) => code)).toContain(
      'CYCLIC_SCHEMA_OBJECT',
    );
    expect(rawCycle.diagnostics.map(({ code }) => code)).not.toContain(
      'CYCLIC_SCHEMA_REFERENCE',
    );
  });

  it('resolves referenced arrays, item roots and item descendants at use-site policy paths', () => {
    const result = compileFormDefinition({
      schema: schemaWith(
        {
          id: { type: 'string' },
          item: {
            type: 'object',
            properties: {
              id: { $ref: '#/$defs/id' },
              label: { type: 'string' },
            },
            required: ['id'],
          },
          list: { type: 'array', items: { $ref: '#/$defs/item' } },
        },
        { rows: { $ref: '#/$defs/list' } },
      ),
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.nodes[0]).toMatchObject({
      kind: 'array',
      path: ['rows'],
      identity: { property: 'id' },
      item: {
        fields: [{ name: 'label', relativePath: ['label'], kind: 'string' }],
      },
    });
  });

  it('does not attach schema provenance to independent UI or unused-policy diagnostics', () => {
    const result = compileFormDefinition({
      schema: schemaWith(
        { text: { type: 'string' } },
        { value: { $ref: '#/$defs/text' } },
      ),
      collectionPolicies: [{ path: ['missing'], itemIdentityProperty: 'id' }],
      uiSchema: { fields: { value: { options: { decimalPlaces: 2 } } } },
    });

    expect(result.success).toBe(false);
    const independent = result.diagnostics.filter(
      ({ code }) =>
        code === 'UNUSED_COLLECTION_POLICY' ||
        code === 'INCOMPATIBLE_UI_OPTION',
    );
    expect(independent).toHaveLength(2);
    expect(
      independent.every(
        ({ parameters }) => !Object.hasOwn(parameters, 'referenceChain'),
      ),
    ).toBe(true);
  });

  it('does not attach an item reference chain to an array-level missing policy', () => {
    const result = compileFormDefinition({
      schema: schemaWith(
        {
          item: {
            type: 'object',
            properties: { id: { type: 'string' } },
            required: ['id'],
          },
        },
        {
          rows: { type: 'array', items: { $ref: '#/$defs/item' } },
        },
      ),
    });
    const missing = result.diagnostics.find(
      ({ code }) => code === 'MISSING_COLLECTION_POLICY',
    );
    expect(missing).toBeDefined();
    expect(Object.hasOwn(missing?.parameters ?? {}, 'referenceChain')).toBe(
      false,
    );
  });

  it('attaches only the applicable reference chain to semantic policy diagnostics', () => {
    const itemDependent = compileFormDefinition({
      schema: schemaWith(
        {
          item: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
        {
          rows: { type: 'array', items: { $ref: '#/$defs/item' } },
        },
      ),
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    const incompatible = itemDependent.diagnostics.find(
      ({ code }) => code === 'INVALID_COLLECTION_POLICY',
    );
    expect(incompatible?.parameters.referenceChain).toEqual([
      ['properties', 'rows', 'items', '$ref'],
    ]);

    const arrayDependent = compileFormDefinition({
      schema: schemaWith(
        {
          list: {
            type: 'array',
            items: {
              type: 'object',
              properties: { id: { type: 'string' } },
              required: ['id'],
            },
          },
        },
        { rows: { $ref: '#/$defs/list' } },
      ),
    });
    const missing = arrayDependent.diagnostics.find(
      ({ code }) => code === 'MISSING_COLLECTION_POLICY',
    );
    expect(missing?.parameters.referenceChain).toEqual([
      ['properties', 'rows', '$ref'],
    ]);
  });

  it.each([
    ['non-string-reference', 1],
    ['non-fragment-reference', 'other.json#/$defs/text'],
    ['invalid-uri-reference', '#/bad value'],
    ['plain-name-fragment-not-supported', '#text'],
    ['invalid-percent-encoding', '#/$defs/%FF'],
    ['invalid-pointer-escape', '#/$defs/~2'],
    ['outside-definitions', '#/properties/value'],
  ] as const)('emits exact invalid reason %s', (reason, reference) => {
    const result = compileFormDefinition({
      schema: schemaWith(
        { text: { type: 'string' } },
        { value: { $ref: reference } },
      ),
    });
    const value = result.diagnostics.find(
      ({ code }) => code === 'INVALID_SCHEMA_REFERENCE',
    );
    expect(value).toMatchObject({
      dataPath: ['value'],
      documentPath: ['properties', 'value', '$ref'],
    });
    expect(value?.parameters.reason).toBe(reason);
  });

  it('gives percent-triplet shape precedence and diagnoses accessor references safely', () => {
    const accessorReference: Record<string, unknown> = {};
    Object.defineProperty(accessorReference, '$ref', {
      enumerable: true,
      get: () => {
        throw new Error('must not run');
      },
    });
    const result = compileFormDefinition({
      schema: schemaWith(
        {},
        {
          lexical: { $ref: 'external%G' },
          accessor: accessorReference,
        },
      ),
    });
    expect(
      result.diagnostics
        .filter(({ code }) => code === 'INVALID_SCHEMA_REFERENCE')
        .map(({ parameters }) => parameters.reason),
    ).toEqual(['invalid-percent-encoding', 'accessor-reference']);
  });

  it('reports non-canonical array tokens during compiler traversal', () => {
    const result = compileFormDefinition({
      schema: schemaWith(
        { container: { targets: [{ type: 'string' }] } },
        { value: { $ref: '#/$defs/container/targets/01' } },
      ),
    });
    const value = result.diagnostics.find(
      ({ code }) => code === 'INVALID_SCHEMA_REFERENCE',
    );
    expect(value?.parameters.reason).toBe('non-canonical-array-index');
  });

  it.each([
    ['missing-target', 'missing'],
    ['non-enumerable-target', 'hidden'],
    ['accessor-target', 'accessor'],
    ['non-schema-target', 'scalar'],
  ] as const)('emits exact unresolved reason %s', (reason, member) => {
    const container: Record<string, unknown> = { scalar: 1 };
    Object.defineProperty(container, 'hidden', {
      enumerable: false,
      value: { type: 'string' },
    });
    Object.defineProperty(container, 'accessor', {
      enumerable: true,
      get: () => {
        throw new Error('must not run');
      },
    });
    const result = compileFormDefinition({
      schema: schemaWith(
        { container },
        { value: { $ref: `#/$defs/container/${member}` } },
      ),
    });
    const value = result.diagnostics.find(
      ({ code }) => code === 'UNRESOLVED_SCHEMA_REFERENCE',
    );
    expect(value).toMatchObject({ dataPath: ['value'] });
    expect(value?.parameters.reason).toBe(reason);
    expect(value?.parameters.targetDocumentPath).toEqual([
      '$defs',
      'container',
      member,
    ]);
  });

  it('suppresses dependent resolution for an invalid registry exterior but continues root, reference sibling and UI work', () => {
    const schema = schemaWith(
      {},
      {
        value: { $ref: '#/$defs/text', title: 'blocked sibling' },
      },
    );
    Object.defineProperty(schema, '$defs', {
      enumerable: false,
      value: { text: { type: 'string' } },
    });
    const result = compileFormDefinition({
      schema,
      uiSchema: { fields: { missing: {} } },
    });
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'INCOMPATIBLE_SCHEMA_KEYWORD',
      'UNKNOWN_UI_FIELD',
    ]);
    expect(result.diagnostics.map(({ code }) => code)).not.toContain(
      'UNRESOLVED_SCHEMA_REFERENCE',
    );
  });

  it('continues ordered registry entry checks and reports every use of an invalid entry', () => {
    const result = compileFormDefinition({
      schema: schemaWith(
        { first: 1, valid: { type: 'string' }, last: null },
        {
          one: { $ref: '#/$defs/first' },
          two: { $ref: '#/$defs/first' },
          ok: { $ref: '#/$defs/valid' },
        },
      ),
    });
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'UNRESOLVED_SCHEMA_REFERENCE',
      'UNRESOLVED_SCHEMA_REFERENCE',
    ]);
    expect(
      result.diagnostics.slice(0, 2).map(({ documentPath }) => documentPath),
    ).toEqual([
      ['$defs', 'first'],
      ['$defs', 'last'],
    ]);
  });

  it('keeps unused definition contents lazy', () => {
    const result = compileFormDefinition({
      schema: schemaWith(
        { unused: { type: 'unsupported', minLength: -1 } },
        { value: { type: 'string' } },
      ),
    });
    expect(result.success).toBe(true);
    expect(result.diagnostics).toEqual([]);
  });

  it('resolves encoded separators, Unicode and hostile own names', () => {
    const definitions = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(definitions, '__proto__', {
      enumerable: true,
      value: { type: 'string', title: 'Hostile' },
    });
    definitions['a/b~c 💡'] = { type: 'string', title: 'Encoded' };
    const result = compileFormDefinition({
      schema: schemaWith(definitions, {
        hostile: { $ref: '#/$defs/__proto__' },
        encoded: { $ref: '#/$defs/a~1b~0c%20%F0%9F%92%A1' },
      }),
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields.map(({ label }) => label)).toEqual([
      'Hostile',
      'Encoded',
    ]);
  });

  it('detects an indirect direct-chain cycle and permits repeated acyclic targets', () => {
    const cycle = compileFormDefinition({
      schema: schemaWith(
        {
          a: { $ref: '#/$defs/b' },
          b: { $ref: '#/$defs/a' },
        },
        { value: { $ref: '#/$defs/a' } },
      ),
    });
    expect(cycle.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'CYCLIC_SCHEMA_REFERENCE',
        documentPath: ['$defs', 'b', '$ref'],
        parameters: {
          firstDocumentPath: ['$defs', 'a'],
          referenceChain: [
            ['properties', 'value', '$ref'],
            ['$defs', 'a', '$ref'],
            ['$defs', 'b', '$ref'],
          ],
        },
      }),
    );

    const shared = { type: 'string' };
    const reused = compileFormDefinition({
      schema: schemaWith(
        { first: shared, second: shared },
        {
          one: { $ref: '#/$defs/first' },
          two: { $ref: '#/$defs/second' },
        },
      ),
    });
    expect(reused.success).toBe(true);
  });

  it('normalizes a deep finite reference chain iteratively', () => {
    const definitions: Record<string, unknown> = {};
    const depth = 5_000;
    for (let index = 0; index < depth; index += 1) {
      definitions[`d${index}`] =
        index === depth - 1
          ? { type: 'string' }
          : { $ref: `#/$defs/d${index + 1}` };
    }
    const result = compileFormDefinition({
      schema: schemaWith(definitions, {
        value: { $ref: '#/$defs/d0' },
      }),
    });
    expect(result.success).toBe(true);
  });

  it('passes the exact original schema to runtime validation after referenced compilation', () => {
    const schema = schemaWith(
      { text: { type: 'string' } },
      { value: { $ref: '#/$defs/text' } },
    );
    const compiled = compileFormDefinition({ schema });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    let receivedSchema: unknown;
    const runtime = createControlledFormRuntime({
      formId: 'reference-validator-identity',
      definition: compiled.definition,
      schema,
      value: { value: 'Ada' },
      baselineValue: { value: 'Ada' },
      locale: 'en',
      validator: {
        validate(candidate) {
          receivedSchema = candidate;
          return { valid: true, issues: [] };
        },
      },
    });
    expect(runtime.success).toBe(true);
    expect(receivedSchema).toBe(schema);
    if (runtime.success) runtime.runtime.dispose();
  });
});
