import { describe, expect, it } from 'vitest';

import { deriveSchemaDefaultCandidate } from '../src/index.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';

describe('deriveSchemaDefaultCandidate accepted schema graph', () => {
  it('derives local references, chains and repeated target uses per data path', () => {
    const result = deriveSchemaDefaultCandidate(
      {
        $schema: dialect,
        type: 'object',
        $defs: {
          Text: { type: 'string', default: 'Ada' },
          Alias: { $ref: '#/$defs/Text' },
          Profile: {
            type: 'object',
            properties: {
              locale: { type: 'string', default: 'en' },
            },
          },
        },
        properties: {
          first: { $ref: '#/$defs/Alias' },
          second: { $ref: '#/$defs/Text' },
          profile: { $ref: '#/$defs/Profile' },
        },
      },
      {},
    );

    expect(result).toMatchObject({ success: true, changed: true });
    expect(result.value).toEqual({
      first: 'Ada',
      second: 'Ada',
      profile: { locale: 'en' },
    });
  });

  it('derives root and nested disjoint object composition in contribution order', () => {
    const result = deriveSchemaDefaultCandidate(
      {
        $schema: dialect,
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: { first: { type: 'string', default: 'one' } },
          },
          {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                allOf: [
                  {
                    type: 'object',
                    properties: {
                      name: { type: 'string', default: 'Ada' },
                    },
                  },
                  {
                    type: 'object',
                    properties: {
                      active: { type: 'boolean', default: false },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      {},
    );

    expect(result).toMatchObject({ success: true, changed: true });
    expect(result.value).toEqual({
      first: 'one',
      profile: { name: 'Ada', active: false },
    });
    expect(Object.keys(result.value)).toEqual(['first', 'profile']);
  });

  it('keeps array, item and below-array defaults opaque without a collection policy', () => {
    const item = { type: 'object' } as Record<string, unknown>;
    Object.defineProperty(item, 'properties', {
      enumerable: true,
      get: () => {
        throw new Error('must remain opaque');
      },
    });
    const input = { rows: [{ id: 'existing' }] };
    const result = deriveSchemaDefaultCandidate(
      {
        $schema: dialect,
        type: 'object',
        default: { ignored: true },
        properties: {
          rows: {
            type: 'array',
            default: [{ id: 'default' }],
            items: item,
          },
          profile: {
            type: 'object',
            default: { ignored: true },
            properties: { name: { type: 'string', default: 'Ada' } },
          },
        },
      },
      input,
    );

    expect(result.success).toBe(true);
    expect(result.value).toEqual({
      rows: input.rows,
      profile: { name: 'Ada' },
    });
    expect(result.value.rows).toBe(input.rows);
  });

  it('retains exact source and use-site provenance for a referenced invalid default', () => {
    const input = {};
    const result = deriveSchemaDefaultCandidate(
      {
        $schema: dialect,
        type: 'object',
        $defs: {
          Count: { type: 'integer', default: 1.5 },
        },
        properties: { count: { $ref: '#/$defs/Count' } },
      },
      input,
    );

    expect(result.value).toBe(input);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      dataPath: ['count'],
      documentPath: ['$defs', 'Count', 'default'],
      parameters: {
        keyword: 'default',
        expected: 'finite integer',
        actualType: 'number',
        referenceChain: [['properties', 'count', '$ref']],
      },
    });
    const chain = result.diagnostics[0]?.parameters['referenceChain'];
    expect(Object.isFrozen(chain)).toBe(true);
    expect(Object.isFrozen((chain as readonly unknown[])[0])).toBe(true);
  });

  it('completes blocking schema errors before inspecting hostile data', () => {
    const input = new Proxy(
      {},
      {
        getPrototypeOf: () => {
          throw new Error('data must not be inspected');
        },
      },
    );
    const result = deriveSchemaDefaultCandidate(
      {
        $schema: dialect,
        type: 'object',
        properties: {
          missing: { $ref: '#/$defs/Absent' },
          valid: { type: 'string', default: 'not observable' },
        },
      },
      input,
    );

    expect(result.value).toBe(input);
    expect(
      result.diagnostics.some(
        ({ code }) => code === 'UNRESOLVED_SCHEMA_REFERENCE',
      ),
    ).toBe(true);
    expect(
      result.diagnostics.some(
        ({ code }) => code === 'INVALID_DEFAULT_CANDIDATE_INPUT',
      ),
    ).toBe(false);
  });

  it('places default diagnostics at their ordinary keyword position', () => {
    const result = deriveSchemaDefaultCandidate(
      {
        $schema: dialect,
        type: 'object',
        properties: {
          count: {
            type: 'integer',
            default: 1.5,
            minimum: 'invalid',
          },
        },
      },
      {},
    );

    expect(result.diagnostics.map(({ documentPath }) => documentPath)).toEqual([
      ['properties', 'count', 'default'],
      ['properties', 'count', 'minimum'],
    ]);
  });

  it('rejects reference cycles and composition conflicts atomically', () => {
    const referenceCycle = deriveSchemaDefaultCandidate(
      {
        $schema: dialect,
        type: 'object',
        $defs: {
          A: { $ref: '#/$defs/B' },
          B: { $ref: '#/$defs/A' },
        },
        properties: { value: { $ref: '#/$defs/A' } },
      },
      {},
    );
    expect(
      referenceCycle.diagnostics.some(
        ({ code }) => code === 'CYCLIC_SCHEMA_REFERENCE',
      ),
    ).toBe(true);

    const input = {};
    const conflict = deriveSchemaDefaultCandidate(
      {
        $schema: dialect,
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: { value: { type: 'string', default: 'first' } },
          },
          {
            type: 'object',
            properties: { value: { type: 'string', default: 'second' } },
          },
        ],
      },
      input,
    );
    expect(conflict.value).toBe(input);
    expect(conflict.changed).toBe(false);
    expect(
      conflict.diagnostics.some(
        ({ code }) => code === 'INCOMPATIBLE_SCHEMA_COMPOSITION',
      ),
    ).toBe(true);
  });
});
