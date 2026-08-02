import { describe, expect, it, vi } from 'vitest';
import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { createAjvSchemaValidator } from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

describe('createAjvSchemaValidator', () => {
  it('collects all Draft 2020-12 issues with specific immutable paths', () => {
    const validator = createAjvSchemaValidator();
    const schema = {
      $schema: DIALECT,
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: { name: { type: 'string', minLength: 3 } },
          required: ['name'],
        },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: { score: { type: 'number', minimum: 0 } },
          },
        },
      },
      required: ['profile'],
    };
    const result = validator.validate(schema, {
      profile: {},
      rows: [{ score: -1 }],
    });

    expect(result.valid).toBe(false);
    expect(result.issues.map(({ code, path }) => ({ code, path }))).toEqual([
      { code: 'required', path: ['profile', 'name'] },
      { code: 'minimum', path: ['rows', 0, 'score'] },
    ]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.issues)).toBe(true);
    expect(Object.isFrozen(result.issues[0]?.path)).toBe(true);
    expect(Object.isFrozen(result.issues[0]?.parameters)).toBe(true);
  });

  it('keeps numeric object keys as strings and decodes pointer escapes', () => {
    const validator = createAjvSchemaValidator();
    const result = validator.validate(
      {
        $schema: DIALECT,
        type: 'object',
        properties: {
          '0': { type: 'object', properties: { 'a/b~c': { type: 'string' } } },
        },
      },
      { '0': { 'a/b~c': 1 } },
    );

    expect(result.issues[0]?.path).toEqual(['0', 'a/b~c']);
  });

  it('does not mutate data, asserts selected formats and tolerates opaque extensions', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const validator = createAjvSchemaValidator();
    const schema = {
      $schema: DIALECT,
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', 'x-editor': 'mail' },
        count: { type: 'number', default: 3 },
      },
    };
    const value = { email: 'not-an-email', count: '2' };
    const before = structuredClone(value);

    const result = validator.validate(schema, value);

    expect(result.issues.map((issue) => issue.code)).toEqual([
      'format',
      'type',
    ]);
    expect(result.issues[0]).toMatchObject({
      code: 'format',
      keyword: 'format',
      path: ['email'],
      parameters: { format: 'email' },
    });
    expect(value).toEqual(before);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it.each([
    ['email', 'person@example.com', 'not-an-email'],
    ['date', '2024-02-29', '2023-02-29'],
    ['date-time', '2026-07-30T12:34:56Z', '2026-07-30T12:34:56'],
  ] as const)('asserts %s in full mode', (format, validValue, invalidValue) => {
    const validator = createAjvSchemaValidator();
    const schema = { type: 'string', format };

    expect(validator.validate(schema, validValue)).toEqual({
      valid: true,
      issues: [],
    });
    const invalid = validator.validate(schema, invalidValue);
    expect(invalid).toMatchObject({
      valid: false,
      issues: [
        {
          code: 'format',
          keyword: 'format',
          path: [],
          parameters: { format },
        },
      ],
    });
    expect(Object.isFrozen(invalid.issues[0]?.parameters)).toBe(true);
  });

  it('continues to tolerate unregistered format names under strict false', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = createAjvSchemaValidator().validate(
      { type: 'string', format: 'hostname' },
      'not a hostname',
    );

    expect(result).toEqual({ valid: true, issues: [] });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('keeps the browser-safe ESM subset in parity with pinned ajv-formats full mode', () => {
    const oracle = new Ajv2020({ strict: false, validateFormats: true });
    for (const format of ['email', 'date', 'date-time'] as const) {
      oracle.addFormat(format, addFormats.default.get(format, 'full'));
    }
    const validator = createAjvSchemaValidator();
    const cases = [
      ['email', 'person@example.com'],
      ['email', 'person@localhost'],
      ['date', '2000-02-29'],
      ['date', '1900-02-29'],
      ['date-time', '2026-07-30T12:34:56Z'],
      ['date-time', '2026-07-30 12:34:56+02:00'],
      ['date-time', '2026-07-30T12:34:56'],
      ['date-time', '2026-02-30T12:34:56Z'],
    ] as const;

    for (const [format, value] of cases) {
      const schema = { type: 'string', format };
      expect(validator.validate(schema, value).valid).toBe(
        oracle.validate(schema, value),
      );
    }
  });

  it('resolves same-document references', () => {
    const result = createAjvSchemaValidator().validate(
      {
        $schema: DIALECT,
        $defs: { label: { type: 'string', maxLength: 3 } },
        type: 'object',
        properties: { label: { $ref: '#/$defs/label' } },
      },
      { label: 'long' },
    );
    expect(result.issues.map((issue) => issue.code)).toEqual(['maxLength']);
  });

  it('caches by identity but recompiles distinct schema objects', () => {
    const validator = createAjvSchemaValidator();
    const schema = { type: 'string', minLength: 2 };
    expect(validator.validate(schema, 'abc').valid).toBe(true);
    schema.minLength = 5;
    expect(validator.validate(schema, 'abc').valid).toBe(true);
    expect(validator.validate({ ...schema }, 'abc').valid).toBe(false);
  });

  it('throws for asynchronous schemas and invalid schema values', () => {
    const validator = createAjvSchemaValidator();
    expect(() =>
      validator.validate({ $async: true, type: 'string' }, 'value'),
    ).toThrow('Asynchronous JSON Schema validation is not supported.');
    expect(() => validator.validate('invalid', 'value')).toThrow();
  });

  it('returns a frozen valid result for boolean and absent-dialect schemas', () => {
    const validator = createAjvSchemaValidator();
    const result = validator.validate({ type: 'string' }, 'value');
    expect(result).toEqual({ valid: true, issues: [] });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.issues)).toBe(true);
    expect(validator.validate(true, Symbol('value')).valid).toBe(true);
  });
});
