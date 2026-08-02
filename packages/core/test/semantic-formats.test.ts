import { describe, expect, it, vi } from 'vitest';
import {
  compileFormDefinition,
  createControlledFormRuntime,
  type FormDefinition,
  type StringSemanticFormat,
  type ValidationResult,
} from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

describe('M24 semantic string formats', () => {
  it('exports and normalizes the three exact direct formats immutably', () => {
    const formats = [
      'email',
      'date',
      'date-time',
    ] as const satisfies readonly StringSemanticFormat[];
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: Object.fromEntries(
          formats.map((format) => [format, { type: 'string', format }]),
        ),
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.definition.fields.map(
        (field) => field.kind === 'string' && field.format,
      ),
    ).toEqual(formats);
    expect(result.definition.fields.every(Object.isFrozen)).toBe(true);
  });

  it('propagates formats through nested objects, item templates and local references', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        $defs: {
          email: { type: 'string', format: 'email' },
        },
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {
              birthday: { type: ['string', 'null'], format: 'date' },
              contact: { $ref: '#/$defs/email' },
            },
          },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                startsAt: { type: 'string', format: 'date-time' },
              },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['events'], itemIdentityProperty: 'id' }],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.definition.fields.map(
        (field) => field.kind === 'string' && field.format,
      ),
    ).toEqual(['date', 'email']);
    const events = result.definition.nodes[1];
    expect(events?.kind).toBe('array');
    if (events?.kind !== 'array') return;
    expect(events.item.fields).toMatchObject([
      { kind: 'string', relativePath: ['startsAt'], format: 'date-time' },
    ]);
  });

  it('keeps enum precedence data while carrying its format', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          contact: {
            type: 'string',
            format: 'email',
            enum: ['one@example.com', 'two@example.com'],
          },
        },
      },
    });

    expect(result).toMatchObject({
      success: true,
      definition: {
        fields: [
          {
            kind: 'string',
            format: 'email',
            choices: [
              { value: 'one@example.com' },
              { value: 'two@example.com' },
            ],
          },
        ],
      },
    });
  });

  it('warns for another string name and blocks malformed format values without executing accessors', () => {
    let getterCalls = 0;
    const accessor = Object.defineProperty({ type: 'string' }, 'format', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'email';
      },
    });
    const ignored = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: { slug: { type: 'string', format: 'hostname' } },
      },
    });
    const invalid = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: {
          numeric: { type: 'string', format: 1 },
          accessor,
        },
      },
    });

    expect(ignored).toMatchObject({
      success: true,
      diagnostics: [
        {
          code: 'IGNORED_SCHEMA_FORMAT',
          severity: 'warning',
          source: 'schema',
          dataPath: ['slug'],
          documentPath: ['properties', 'slug', 'format'],
          parameters: { format: 'hostname' },
        },
      ],
    });
    expect(invalid.success).toBe(false);
    expect(invalid.diagnostics).toMatchObject([
      {
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        dataPath: ['numeric'],
        parameters: { keyword: 'format', expected: 'string format name' },
      },
      {
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        dataPath: ['accessor'],
        parameters: {
          keyword: 'format',
          expected: 'string format name',
          actualType: 'accessor',
        },
      },
    ]);
    expect(getterCalls).toBe(0);
  });

  it('accepts selected manual string formats and rejects other values before validation', () => {
    const compiled = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        type: 'object',
        properties: { contact: { type: 'string', format: 'email' } },
      },
    });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;
    const validate = vi.fn((): ValidationResult => ({
      valid: true,
      issues: [],
    }));
    const accepted = createControlledFormRuntime({
      formId: 'semantic',
      definition: compiled.definition,
      schema: {},
      value: { contact: 'a@example.com' },
      baselineValue: { contact: '' },
      locale: 'en',
      validator: { validate },
    });
    expect(accepted.success).toBe(true);
    expect(validate).toHaveBeenCalledTimes(1);

    const field = { ...compiled.definition.fields[0], format: 'hostname' };
    const rejectedDefinition = {
      ...compiled.definition,
      nodes: [field],
      fields: [field],
      presentation: [{ kind: 'form-node', node: field }],
    } as unknown as FormDefinition;
    const rejected = createControlledFormRuntime({
      formId: 'semantic-invalid',
      definition: rejectedDefinition,
      schema: {},
      value: {},
      baselineValue: {},
      locale: 'en',
      validator: { validate },
    });
    expect(rejected).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INVALID_RUNTIME_OPTIONS' }],
    });
    expect(validate).toHaveBeenCalledTimes(1);
  });
});
