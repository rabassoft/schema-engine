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

function objectField(properties: Record<string, unknown>, required?: string[]) {
  return {
    type: 'object',
    properties,
    ...(required === undefined ? {} : { required }),
  };
}

describe('deriveSchemaDefaultCandidate nested reconstruction', () => {
  it('materializes only branches with applicable required or optional leaves', () => {
    const input = {};
    const result = deriveSchemaDefaultCandidate(
      schema({
        profile: objectField(
          {
            name: { type: 'string', default: 'Ada' },
            locale: { type: 'string', default: 'en' },
          },
          ['name'],
        ),
        untouched: objectField({ note: { type: 'string' } }),
        settings: objectField({ active: { type: 'boolean', default: false } }),
      }),
      input,
    );

    expect(result).toMatchObject({ success: true, changed: true });
    expect(result.value).toEqual({
      profile: { name: 'Ada', locale: 'en' },
      settings: { active: false },
    });
    expect(Object.keys(result.value)).toEqual(['profile', 'settings']);
    expect(Object.keys((result.value as { profile: object }).profile)).toEqual([
      'name',
      'locale',
    ]);
    expect(input).toEqual({});
  });

  it('clones shared changed ancestors once and preserves off-path identity and descriptors', () => {
    const marker = Symbol('marker');
    const stable = { exact: true };
    const profile = Object.create(null) as Record<PropertyKey, unknown>;
    Object.defineProperties(profile, {
      existing: {
        value: 'kept',
        enumerable: true,
        writable: false,
        configurable: true,
      },
      hidden: { value: 7, enumerable: false },
    });
    profile[marker] = stable;
    const input = { profile, stable };

    const result = deriveSchemaDefaultCandidate(
      schema({
        profile: objectField({
          first: { type: 'string', default: 'Ada' },
          second: { type: 'integer', default: 2 },
        }),
      }),
      input,
    );

    expect(result.success).toBe(true);
    expect(result.value).not.toBe(input);
    expect(result.value.profile).not.toBe(profile);
    expect(Object.getPrototypeOf(result.value.profile)).toBe(null);
    expect(result.value.stable).toBe(stable);
    expect(result.value.profile[marker]).toBe(stable);
    expect(
      Object.getOwnPropertyDescriptor(result.value, 'profile'),
    ).toMatchObject({
      writable: true,
      enumerable: true,
      configurable: true,
    });
    expect(
      Object.getOwnPropertyDescriptor(result.value.profile, 'hidden'),
    ).toEqual(Object.getOwnPropertyDescriptor(profile, 'hidden'));
    expect(
      Object.getOwnPropertyDescriptor(result.value.profile, 'existing'),
    ).toEqual(Object.getOwnPropertyDescriptor(profile, 'existing'));
    expect(Object.keys(result.value.profile)).toEqual([
      'existing',
      'first',
      'second',
    ]);
  });

  it('treats every own terminal value as present and inherited terminals as missing', () => {
    const profile: Record<string, unknown> = {
      undefinedValue: undefined,
      nullValue: null,
      falseValue: false,
      zeroValue: 0,
      emptyValue: '',
      incompatible: [],
    };
    const input = { profile };
    const result = deriveSchemaDefaultCandidate(
      schema({
        profile: objectField({
          undefinedValue: { type: 'string', default: 'fallback' },
          nullValue: { type: 'string', default: 'fallback' },
          falseValue: { type: 'boolean', default: true },
          zeroValue: { type: 'integer', default: 1 },
          emptyValue: { type: 'string', default: 'fallback' },
          incompatible: { type: 'string', default: 'fallback' },
          toString: { type: 'string', default: 'own value' },
        }),
      }),
      input,
    );

    expect(result.success).toBe(true);
    expect(result.value.profile).toMatchObject(profile);
    expect(Object.hasOwn(result.value.profile, 'toString')).toBe(true);
    expect(
      Object.getOwnPropertyDescriptor(result.value.profile, 'toString'),
    ).toMatchObject({ value: 'own value' });
  });

  it('preserves incompatible present object ancestors without inspecting descendants', () => {
    class Entity {}
    const input = {
      nil: null,
      list: [],
      entity: new Entity(),
      primitive: 3,
    };
    const nested = objectField({ leaf: { type: 'string', default: 'value' } });
    const result = deriveSchemaDefaultCandidate(
      schema({ nil: nested, list: nested, entity: nested, primitive: nested }),
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

  it('reports the first nested accessor without invoking it', () => {
    let invoked = false;
    const profile = {} as Record<string, unknown>;
    Object.defineProperty(profile, 'name', {
      enumerable: true,
      get: () => {
        invoked = true;
        return 'hidden';
      },
    });
    const input = { profile };
    const result = deriveSchemaDefaultCandidate(
      schema({
        profile: objectField({ name: { type: 'string', default: 'Ada' } }),
      }),
      input,
    );

    expect(invoked).toBe(false);
    expect(result.value).toBe(input);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'INVALID_DEFAULT_CANDIDATE_INPUT',
      dataPath: ['profile', 'name'],
      parameters: {
        member: 'value',
        reason: 'accessor-member',
        actualType: 'accessor',
      },
    });
  });

  it('reports malformed nested defaults at exact schema and data paths', () => {
    const input = {};
    const result = deriveSchemaDefaultCandidate(
      schema({
        profile: objectField({
          age: { type: 'integer', default: 1.5 },
        }),
      }),
      input,
    );

    expect(result.value).toBe(input);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      source: 'schema',
      dataPath: ['profile', 'age'],
      documentPath: ['properties', 'profile', 'properties', 'age', 'default'],
      parameters: {
        keyword: 'default',
        expected: 'finite integer',
        actualType: 'number',
      },
    });
  });

  it('normalizes hostile nested reflection at the known managed path', () => {
    const hostile = new Proxy(
      {},
      {
        getPrototypeOf: () => {
          throw new Error('hidden');
        },
      },
    );
    const input = { profile: hostile };
    const result = deriveSchemaDefaultCandidate(
      schema({
        profile: objectField({ name: { type: 'string', default: 'Ada' } }),
      }),
      input,
    );

    expect(result.value).toBe(input);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'INVALID_DEFAULT_CANDIDATE_INPUT',
      dataPath: ['profile'],
      parameters: { member: 'value', reason: 'inspection-failed' },
    });
  });

  it('contains root clone failure atomically after successful preflight', () => {
    const input = new Proxy(
      {},
      {
        ownKeys: () => {
          throw new Error('hidden');
        },
      },
    );
    const result = deriveSchemaDefaultCandidate(
      schema({ name: { type: 'string', default: 'Ada' } }),
      input,
    );

    expect(result.value).toBe(input);
    expect(result.changed).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'DEFAULT_CANDIDATE_FAILED',
      dataPath: [],
      parameters: { reason: 'clone-failed', path: [] },
    });
  });

  it('reports an exact clone failure for a non-configurable changed ancestor link', () => {
    const input = {} as { profile: Record<string, unknown> };
    Object.defineProperty(input, 'profile', {
      value: {},
      enumerable: true,
      configurable: false,
      writable: false,
    });
    const result = deriveSchemaDefaultCandidate(
      schema({
        profile: objectField({ name: { type: 'string', default: 'Ada' } }),
      }),
      input,
    );

    expect(result.value).toBe(input);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'DEFAULT_CANDIDATE_FAILED',
      dataPath: ['profile'],
      parameters: { reason: 'clone-failed', path: ['profile'] },
    });
    expect(input.profile).toEqual({});
  });

  it('handles a deeply nested path without recursive traversal or reconstruction', () => {
    const depth = 750;
    let leaf: Record<string, unknown> = {
      value: { type: 'string', default: 'deep' },
    };
    for (let index = depth - 1; index >= 0; index -= 1) {
      leaf = { [`level${index}`]: objectField(leaf) };
    }

    const result = deriveSchemaDefaultCandidate(schema(leaf), {});
    expect(result.success).toBe(true);
    let current: unknown = result.value;
    for (let index = 0; index < depth; index += 1) {
      current = (current as Record<string, unknown>)[`level${index}`];
    }
    expect(current).toEqual({ value: 'deep' });
  });
});
