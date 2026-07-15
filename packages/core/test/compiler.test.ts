import { describe, expect, it } from 'vitest';
import { compileFormDefinition } from '../src/index.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';

describe('compileFormDefinition', () => {
  it('normalizes all primitive field kinds and constraints', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          text: {
            type: 'string',
            minLength: 1,
            maxLength: 5,
            pattern: '^a',
          },
          amount: {
            type: 'number',
            minimum: 0,
            maximum: 10,
            multipleOf: 0.5,
          },
          count: { type: 'integer' },
          active: { type: 'boolean' },
        },
        required: ['text'],
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields).toEqual([
      {
        key: '["text"]',
        name: 'text',
        path: ['text'],
        required: true,
        label: 'text',
        kind: 'string',
        constraints: { minLength: 1, maxLength: 5, pattern: '^a' },
      },
      {
        key: '["amount"]',
        name: 'amount',
        path: ['amount'],
        required: false,
        label: 'amount',
        kind: 'number',
        numericType: 'number',
        constraints: { minimum: 0, maximum: 10, multipleOf: 0.5 },
        ui: {},
      },
      {
        key: '["count"]',
        name: 'count',
        path: ['count'],
        required: false,
        label: 'count',
        kind: 'number',
        numericType: 'integer',
        constraints: {},
        ui: {},
      },
      {
        key: '["active"]',
        name: 'active',
        path: ['active'],
        required: false,
        label: 'active',
        kind: 'boolean',
      },
    ]);
    expect(result.definition.nodes).toEqual(result.definition.fields);
    expect(result.definition.nodes[0]).toBe(result.definition.fields[0]);
    expect(result.definition.presentation).toHaveLength(4);
    expect(
      result.definition.presentation.map((entry) =>
        entry.kind === 'form-node' ? entry.node : undefined,
      ),
    ).toEqual(result.definition.nodes);
    expect(result.definition.presentation[0]?.kind).toBe('form-node');
    if (result.definition.presentation[0]?.kind === 'form-node') {
      expect(result.definition.presentation[0].node).toBe(
        result.definition.nodes[0],
      );
    }
  });

  it('uses explicit empty UI text values without falling back', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Schema title',
            description: 'Schema description',
          },
        },
      },
      uiSchema: {
        fields: { name: { label: '', description: '', hint: '' } },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields[0]).toMatchObject({
      label: '',
      description: '',
      hint: '',
    });
  });

  it('accepts default metadata without copying it into the definition', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { name: { type: 'string', default: 'Ada' } },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields[0]).not.toHaveProperty('default');
    expect(result.diagnostics).toEqual([]);
  });

  it('freezes the full result and does not mutate its inputs', () => {
    const input = {
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { name: { type: 'string' } },
      },
    };
    const before = structuredClone(input);
    const result = compileFormDefinition(input);

    expect(input).toEqual(before);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.diagnostics)).toBe(true);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(Object.isFrozen(result.definition)).toBe(true);
    expect(Object.isFrozen(result.definition.fields)).toBe(true);
    expect(Object.isFrozen(result.definition.presentation)).toBe(true);
    expect(result.definition.presentation.every(Object.isFrozen)).toBe(true);
    expect(Object.isFrozen(result.definition.fields[0])).toBe(true);
    expect(Object.isFrozen(result.definition.fields[0]?.path)).toBe(true);
  });

  it('normalizes an empty root to an empty required presentation forest', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {},
      },
    });

    expect(result).toMatchObject({
      success: true,
      definition: { nodes: [], fields: [], presentation: [] },
    });
    if (!result.success) return;
    expect(Object.isFrozen(result.definition.presentation)).toBe(true);
  });

  it('normalizes exact string enums into deeply frozen ordered choices', () => {
    const enumValues = ['', ' Draft ', 'draft'];
    const enumLabels = { draft: 'status.draft' };
    const input = {
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { status: { type: 'string', enum: enumValues } },
      },
      uiSchema: { fields: { status: { enumLabels } } },
    };

    const result = compileFormDefinition(input);

    expect(result).toMatchObject({
      success: true,
      definition: {
        fields: [
          {
            choices: [
              { value: '', label: '""' },
              { value: ' Draft ', label: ' Draft ' },
              { value: 'draft', label: 'status.draft' },
            ],
          },
        ],
      },
    });
    expect(enumValues).toEqual(['', ' Draft ', 'draft']);
    expect(enumLabels).toEqual({ draft: 'status.draft' });
    expect(Object.isFrozen(enumValues)).toBe(false);
    expect(Object.isFrozen(enumLabels)).toBe(false);
    if (!result.success) return;
    const field = result.definition.fields[0];
    expect(field?.kind).toBe('string');
    if (field?.kind !== 'string' || field.choices === undefined) return;
    expect(Object.isFrozen(field.choices)).toBe(true);
    expect(field.choices.every(Object.isFrozen)).toBe(true);
  });

  it('inspects enum arrays through descriptors without executing accessors', () => {
    let getterCalls = 0;
    const accessorField = Object.defineProperty({ type: 'string' }, 'enum', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return ['unsafe'];
      },
    });
    const sparseEnum: unknown[] = ['first'];
    sparseEnum[2] = 'first';
    sparseEnum[3] = 'first';
    Object.defineProperty(sparseEnum, 1, {
      enumerable: true,
      configurable: true,
      get() {
        getterCalls += 1;
        return 'unsafe';
      },
    });
    sparseEnum.length = 5;

    const accessorResult = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { status: accessorField },
      },
    });
    const entryResult = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { status: { type: 'string', enum: sparseEnum } },
      },
    });

    expect(getterCalls).toBe(0);
    expect(accessorResult.diagnostics).toMatchObject([
      {
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        documentPath: ['properties', 'status', 'enum'],
        parameters: {
          expected: 'array of unique strings',
          actualType: 'accessor',
        },
      },
    ]);
    expect(entryResult.diagnostics).toMatchObject([
      {
        documentPath: ['properties', 'status', 'enum', 1],
        parameters: { expected: 'string', actualType: 'accessor' },
      },
      {
        documentPath: ['properties', 'status', 'enum', 2],
        parameters: { expected: 'unique string', actualValue: 'first' },
      },
      {
        documentPath: ['properties', 'status', 'enum', 3],
        parameters: { expected: 'unique string', actualValue: 'first' },
      },
      {
        documentPath: ['properties', 'status', 'enum', 4],
        parameters: { expected: 'string', actualType: 'missing' },
      },
    ]);
  });

  it('suppresses derived enumLabels diagnostics below blocked schema branches', () => {
    let getterCalls = 0;
    const ignoredLabels = Object.defineProperty({}, 'unsafe', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'Unsafe';
      },
    });

    const blocked = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { status: { type: 'string', enum: [] } },
      },
      uiSchema: { fields: { status: { enumLabels: ignoredLabels } } },
    });
    const missingType = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { status: {} },
      },
      uiSchema: { fields: { status: { enumLabels: ignoredLabels } } },
    });

    expect(getterCalls).toBe(0);
    expect(blocked.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
    ]);
    expect(missingType.diagnostics.map(({ code }) => code)).toEqual([
      'MISSING_FIELD_TYPE',
    ]);
  });

  it('keeps root enum unsupported and field-type incompatibility descriptor-safe', () => {
    let getterCalls = 0;
    const numberField = Object.defineProperty({ type: 'number' }, 'enum', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return [1, 2];
      },
    });

    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        enum: ['root'],
        properties: { amount: numberField },
      },
    });

    expect(getterCalls).toBe(0);
    expect(result.diagnostics).toMatchObject([
      {
        code: 'UNSUPPORTED_SCHEMA_KEYWORD',
        documentPath: ['enum'],
      },
      {
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        documentPath: ['properties', 'amount', 'enum'],
        parameters: { keyword: 'enum', fieldType: 'number' },
      },
    ]);
  });

  it('reports enumLabels accessors without executing them', () => {
    let getterCalls = 0;
    const outerAccessor = Object.defineProperty({}, 'enumLabels', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return {};
      },
    });
    const memberAccessor = Object.defineProperty({}, 'draft', {
      enumerable: true,
      get() {
        getterCalls += 1;
        return 'Draft';
      },
    });
    const schema = {
      $schema: dialect,
      type: 'object',
      properties: { status: { type: 'string', enum: ['draft'] } },
    };

    const outerResult = compileFormDefinition({
      schema,
      uiSchema: { fields: { status: outerAccessor } },
    });
    const memberResult = compileFormDefinition({
      schema,
      uiSchema: { fields: { status: { enumLabels: memberAccessor } } },
    });

    expect(getterCalls).toBe(0);
    expect(outerResult.diagnostics).toMatchObject([
      {
        code: 'INVALID_UI_SCHEMA_VALUE',
        documentPath: ['fields', 'status', 'enumLabels'],
        parameters: { actualType: 'accessor', expected: 'object' },
      },
    ]);
    expect(memberResult.diagnostics).toMatchObject([
      {
        code: 'INVALID_UI_SCHEMA_VALUE',
        documentPath: ['fields', 'status', 'enumLabels', 'draft'],
        parameters: {
          actualType: 'accessor',
          expected: 'non-blank string',
        },
      },
    ]);
  });

  it('does not traverse values of unknown keywords', () => {
    const opaque = Object.defineProperty({}, 'hidden', {
      enumerable: true,
      get() {
        throw new Error('must not be read');
      },
    });

    expect(() =>
      compileFormDefinition({
        schema: {
          $schema: dialect,
          type: 'object',
          properties: {},
          'x-opaque': opaque,
        },
      }),
    ).not.toThrow();
  });

  it('returns a diagnostic for an invalid call object', () => {
    const result = compileFormDefinition(null as never);
    expect(result).toMatchObject({
      success: false,
      diagnostics: [{ code: 'INVALID_COMPILER_INPUT' }],
    });
  });

  it('never returns a partial definition when independent errors exist', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: {
          first: { type: 'array' },
          second: { type: 'string', minLength: -1 },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result).not.toHaveProperty('definition');
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'MISSING_COLLECTION_POLICY',
      'INVALID_SCHEMA_KEYWORD_VALUE',
    ]);
  });

  it('skips compatibility diagnostics below invalid field schemas', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { active: {} },
      },
      uiSchema: {
        fields: {
          active: {
            placeholder: 'Unknown type',
            options: { decimalPlaces: 2 },
          },
        },
      },
    });

    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'MISSING_FIELD_TYPE',
    ]);
  });

  it('reports every repeated unknown order entry only as unknown', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: dialect,
        type: 'object',
        properties: { name: { type: 'string' } },
      },
      uiSchema: { order: ['missing', 'missing'] },
    });

    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'UNKNOWN_UI_ORDER_FIELD',
      'UNKNOWN_UI_ORDER_FIELD',
    ]);
  });

  it('is deterministic for repeated compilation of the same objects', () => {
    const input = {
      schema: {
        type: 'object',
        properties: { name: { type: 'string', 'x-extra': true } },
      },
    };

    expect(compileFormDefinition(input)).toEqual(compileFormDefinition(input));
  });
});
