import { describe, expect, it } from 'vitest';

import { deriveSchemaDefaultCandidate } from '../src/index.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';

function schema(properties: Record<string, unknown>, required?: string[]) {
  return {
    $schema: dialect,
    type: 'object',
    properties,
    ...(required === undefined ? {} : { required }),
  };
}

describe('deriveSchemaDefaultCandidate direct foundation', () => {
  it('derives direct primitive and nullable defaults in schema order', () => {
    const input: Readonly<Record<string, unknown>> = Object.freeze({
      unmanaged: { stable: true },
    });
    const result = deriveSchemaDefaultCandidate(
      schema({
        name: { type: 'string', default: '' },
        age: { type: 'integer', default: -0 },
        score: { type: 'number', default: 1.5 },
        active: { type: 'boolean', default: false },
        note: { type: ['string', 'null'], default: null },
      }),
      input,
    );

    expect(result).toMatchObject({
      success: true,
      changed: true,
      diagnostics: [],
    });
    expect(result.value).toEqual({
      unmanaged: { stable: true },
      name: '',
      age: -0,
      score: 1.5,
      active: false,
      note: null,
    });
    expect(Object.keys(result.value)).toEqual([
      'unmanaged',
      'name',
      'age',
      'score',
      'active',
      'note',
    ]);
    expect(result.value['unmanaged']).toBe(input['unmanaged']);
    expect(Object.is(result.value['age'], -0)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
  });

  it('preserves every own present value and returns exact no-effect identity', () => {
    const input = {
      name: '',
      age: 0,
      active: false,
      note: null,
      other: undefined,
    };
    const result = deriveSchemaDefaultCandidate(
      schema({
        name: { type: 'string', default: 'fallback' },
        age: { type: 'integer', default: 42 },
        active: { type: 'boolean', default: true },
        note: { type: ['string', 'null'], default: 'note' },
        other: { type: 'string', default: 'other' },
      }),
      input,
    );
    expect(result).toEqual({
      success: true,
      value: input,
      changed: false,
      diagnostics: [],
    });
    expect(result.value).toBe(input);
  });

  it('treats non-enumerable defaults as absent', () => {
    const hidden = { type: 'string' } as Record<string, unknown>;
    Object.defineProperty(hidden, 'default', { value: 'hidden' });
    const input = {};
    const result = deriveSchemaDefaultCandidate(schema({ hidden }), input);
    expect(result).toEqual({
      success: true,
      value: input,
      changed: false,
      diagnostics: [],
    });
  });

  it('rejects enumerable accessors and incompatible defaults atomically', () => {
    const accessor = { type: 'string' } as Record<string, unknown>;
    Object.defineProperty(accessor, 'default', {
      enumerable: true,
      get: () => {
        throw new Error('must not run');
      },
    });
    const input = {};
    const result = deriveSchemaDefaultCandidate(
      schema({
        first: { type: 'string', default: 'valid' },
        accessor,
        integer: { type: 'integer', default: 1.5 },
        number: { type: 'number', default: Number.POSITIVE_INFINITY },
        nullable: { type: ['boolean', 'null'], default: 'no' },
      }),
      input,
    );
    expect(result.success).toBe(false);
    expect(result.value).toBe(input);
    expect(result.changed).toBe(false);
    expect(result.diagnostics).toHaveLength(4);
    expect(result.diagnostics.map((item) => item.parameters)).toEqual([
      { keyword: 'default', expected: 'string', actualType: 'accessor' },
      { keyword: 'default', expected: 'finite integer', actualType: 'number' },
      { keyword: 'default', expected: 'finite number', actualType: 'number' },
      { keyword: 'default', expected: 'boolean or null', actualType: 'string' },
    ]);
    expect(result.diagnostics.every(Object.isFrozen)).toBe(true);
  });

  it('keeps assertion evaluation outside the helper', () => {
    const result = deriveSchemaDefaultCandidate(
      schema({
        constrained: {
          type: 'string',
          minLength: 10,
          pattern: '^allowed$',
          default: 'x',
        },
      }),
      {},
    );
    expect(result).toMatchObject({ success: true, changed: true });
    expect(result.value).toEqual({ constrained: 'x' });
  });

  it('assumes a missing dialect without returning compiler warnings', () => {
    const result = deriveSchemaDefaultCandidate(
      {
        type: 'object',
        properties: { name: { type: 'string', default: 'Ada' } },
      },
      {},
    );
    expect(result).toMatchObject({
      success: true,
      value: { name: 'Ada' },
      diagnostics: [],
    });
  });

  it('reuses blocking dialect and schema diagnostics', () => {
    const result = deriveSchemaDefaultCandidate(
      {
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        type: 'object',
        properties: {},
      },
      {},
    );
    expect(result.success).toBe(false);
    expect(
      result.diagnostics.some(
        ({ code }) => code === 'UNSUPPORTED_SCHEMA_DIALECT',
      ),
    ).toBe(true);
  });

  it('collects an independent invalid default after another schema error', () => {
    const result = deriveSchemaDefaultCandidate(
      schema({
        broken: { type: 'string', minLength: -1, default: 3 },
      }),
      {},
    );
    expect(result.success).toBe(false);
    expect(result.diagnostics.map(({ code }) => code)).toContain(
      'INVALID_SCHEMA_KEYWORD_VALUE',
    );
    expect(
      result.diagnostics.some(
        ({ documentPath }) =>
          JSON.stringify(documentPath) ===
          JSON.stringify(['properties', 'broken', 'default']),
      ),
    ).toBe(true);
  });

  it('classifies hostile root inspection without leaking the trap', () => {
    const hostile = new Proxy(
      {},
      {
        getPrototypeOf: () => {
          throw new Error('hidden');
        },
      },
    );
    const schemaFailure = deriveSchemaDefaultCandidate(hostile, {});
    expect(schemaFailure.diagnostics[0]?.parameters).toMatchObject({
      member: 'schema',
      reason: 'inspection-failed',
    });
    const valueFailure = deriveSchemaDefaultCandidate(schema({}), hostile);
    expect(valueFailure.diagnostics[0]?.parameters).toMatchObject({
      member: 'value',
      reason: 'inspection-failed',
    });
  });

  it('rejects invalid schema and value roots with exact original value', () => {
    const input = {};
    const schemaFailure = deriveSchemaDefaultCandidate([], input);
    expect(schemaFailure).toMatchObject({
      success: false,
      value: input,
      changed: false,
    });
    expect(schemaFailure.diagnostics[0]).toMatchObject({
      code: 'INVALID_DEFAULT_CANDIDATE_INPUT',
      parameters: {
        member: 'schema',
        reason: 'invalid-value',
        actualType: 'array',
      },
    });

    const valueFailure = deriveSchemaDefaultCandidate(schema({}), []);
    expect(valueFailure.success).toBe(false);
    expect(valueFailure.value).toBeInstanceOf(Array);
    expect(valueFailure.diagnostics[0]).toMatchObject({
      code: 'INVALID_DEFAULT_CANDIDATE_INPUT',
      parameters: {
        member: 'value',
        reason: 'invalid-value',
        actualType: 'array',
      },
    });
  });

  it('rejects an accessor at a candidate value path without invoking it', () => {
    const input = {} as Record<string, unknown>;
    Object.defineProperty(input, 'name', {
      enumerable: true,
      get: () => {
        throw new Error('must not run');
      },
    });
    const result = deriveSchemaDefaultCandidate(
      schema({ name: { type: 'string', default: 'Ada' } }),
      input,
    );
    expect(result.success).toBe(false);
    expect(result.value).toBe(input);
    expect(result.changed).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'INVALID_DEFAULT_CANDIDATE_INPUT',
      dataPath: ['name'],
      parameters: {
        member: 'value',
        reason: 'accessor-member',
        actualType: 'accessor',
      },
    });
  });

  it('preserves prototypes and all existing descriptors when inserting', () => {
    const input = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(input, 'hidden', { value: 3, enumerable: false });
    const result = deriveSchemaDefaultCandidate(
      schema({ name: { type: 'string', default: 'Ada' } }),
      input,
    );
    expect(result.success).toBe(true);
    expect(Object.getPrototypeOf(result.value)).toBe(null);
    expect(Object.getOwnPropertyDescriptor(result.value, 'hidden')).toEqual(
      Object.getOwnPropertyDescriptor(input, 'hidden'),
    );
  });
});
