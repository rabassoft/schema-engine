import { describe, expect, it, vi } from 'vitest';
import {
  applyFormOperation,
  applyOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type FormDefinition,
  type FormOperation,
  type ValidationResult,
} from '../src/index.js';
import { validateCollectionFormDefinition } from '../src/internal/nested-definition.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';
const metadata = { id: 1, formId: 'fixed' } as const;

function schema(properties: Record<string, unknown>): Record<string, unknown> {
  return { $schema: DIALECT, type: 'object', properties };
}

function manualField(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    key: '["name"]',
    name: 'name',
    path: ['name'],
    required: false,
    label: 'Name',
    kind: 'string',
    nullable: false,
    constraints: {},
    ...overrides,
  };
}

function manualDefinition(field: object): Record<string, unknown> {
  return {
    nodes: [field],
    fields: [field],
    presentation: [{ kind: 'form-node', node: field }],
  };
}

function manualCollectionDefinition(template: object): Record<string, unknown> {
  const collection = {
    key: '["rows"]',
    name: 'rows',
    path: ['rows'],
    required: false,
    label: 'Rows',
    kind: 'array',
    identity: { property: 'id' },
    item: { kind: 'item-template', children: [template], fields: [template] },
  };
  return {
    nodes: [collection],
    fields: [],
    presentation: [{ kind: 'form-node', node: collection }],
  };
}

function setValue(value: unknown): FormOperation {
  return {
    type: 'set-value',
    metadata,
    path: ['name'],
    expected: { kind: 'missing' },
    value,
    source: 'user',
  };
}

describe('M25 primitive const compiler contract', () => {
  it('copies every exact primitive value as an own frozen fixedValue', () => {
    const result = compileFormDefinition({
      schema: schema({
        empty: { type: 'string', const: '' },
        zero: { type: 'number', const: 0 },
        negativeZero: { type: 'number', const: -0 },
        integer: { type: 'integer', const: 2 },
        disabled: { type: 'boolean', const: false },
        nullable: { type: ['string', 'null'], const: null },
        choice: { type: 'string', enum: ['a', 'b'], const: 'b' },
      }),
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.diagnostics).toEqual([]);
    const fixedValues = result.definition.fields.map((field) =>
      'fixedValue' in field ? field.fixedValue : undefined,
    );
    expect(fixedValues).toEqual(['', 0, -0, 2, false, null, 'b']);
    expect(Object.is(fixedValues[2], -0)).toBe(true);
    for (const field of result.definition.fields) {
      expect(Object.hasOwn(field, 'fixedValue')).toBe(true);
      expect(
        Object.getOwnPropertyDescriptor(field, 'fixedValue'),
      ).toMatchObject({ enumerable: true });
      expect(Object.isFrozen(field)).toBe(true);
    }
  });

  it('propagates fixed values through nested, template and local-reference leaves', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        $defs: { fixedName: { type: 'string', const: 'Ada' } },
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: { name: { $ref: '#/$defs/fixedName' } },
          },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                enabled: { type: 'boolean', const: false },
              },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.fields[0]).toMatchObject({
      path: ['profile', 'name'],
      fixedValue: 'Ada',
    });
    const rows = result.definition.nodes[1];
    expect(rows?.kind).toBe('array');
    if (rows?.kind !== 'array') return;
    expect(rows.item.fields).toMatchObject([
      { relativePath: ['enabled'], fixedValue: false },
    ]);
    expect(Object.isFrozen(rows.item.fields[0])).toBe(true);
  });

  it('reports descriptor-safe, type-specific invalid values without invoking accessors', () => {
    const getter = vi.fn(() => 'hidden');
    const accessor = Object.defineProperty({ type: 'string' }, 'const', {
      enumerable: true,
      get: getter,
    });
    const result = compileFormDefinition({
      schema: schema({
        accessor,
        string: { type: 'string', const: 1 },
        number: { type: 'number', const: Number.POSITIVE_INFINITY },
        integer: { type: 'integer', const: 1.5 },
        boolean: { type: 'boolean', const: undefined },
        nullable: { type: ['number', 'null'], const: '1' },
        hostile: { type: 'string', const: { value: 'x' } },
      }),
    });

    expect(result.success).toBe(false);
    expect(getter).not.toHaveBeenCalled();
    expect(result.diagnostics).toHaveLength(7);
    expect(result.diagnostics.map((entry) => entry.parameters)).toMatchObject([
      { keyword: 'const', expected: 'string', actualType: 'accessor' },
      { keyword: 'const', expected: 'string', actualValue: 1 },
      { keyword: 'const', expected: 'finite number', actualType: 'number' },
      { keyword: 'const', expected: 'finite integer', actualValue: 1.5 },
      { keyword: 'const', expected: 'boolean', actualType: 'undefined' },
      {
        keyword: 'const',
        expected: 'compatible primitive value or null',
        actualValue: '1',
      },
      { keyword: 'const', expected: 'string', actualType: 'object' },
    ]);
    expect(
      result.diagnostics.every(
        (entry) =>
          entry.code === 'INVALID_SCHEMA_KEYWORD_VALUE' &&
          entry.fallbackMessage ===
            'Schema keyword "const" has an invalid value.',
      ),
    ).toBe(true);
  });

  it('applies closed string enum coherence only after both members are valid', () => {
    const mismatch = compileFormDefinition({
      schema: schema({ name: { type: 'string', const: 'a', enum: ['b'] } }),
    });
    expect(mismatch.diagnostics).toEqual([
      expect.objectContaining({
        code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
        dataPath: ['name'],
        documentPath: ['properties', 'name', 'const'],
        parameters: {
          keyword: 'const',
          fieldType: 'string',
          reason: 'value-not-in-enum',
        },
        fallbackMessage:
          'Schema keyword "const" is incompatible with field type "string".',
      }),
    ]);

    const invalidEnum = compileFormDefinition({
      schema: schema({ name: { type: 'string', const: 'a', enum: [1] } }),
    });
    expect(invalidEnum.diagnostics).toHaveLength(1);
    expect(invalidEnum.diagnostics[0]).toMatchObject({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      documentPath: ['properties', 'name', 'enum', 0],
    });

    const invalidConst = compileFormDefinition({
      schema: schema({ name: { type: 'string', const: 1, enum: ['a'] } }),
    });
    expect(invalidConst.diagnostics).toHaveLength(1);
    expect(invalidConst.diagnostics[0]).toMatchObject({
      code: 'INVALID_SCHEMA_KEYWORD_VALUE',
      documentPath: ['properties', 'name', 'const'],
    });
  });

  it('coexists without derived assertion checks with constraints, format, default and UI metadata', () => {
    const result = compileFormDefinition({
      schema: schema({
        contact: {
          type: 'string',
          const: 'a@example.com',
          minLength: 100,
          maxLength: 200,
          pattern: '^never$',
          format: 'email',
          default: 'different@example.com',
        },
      }),
      uiSchema: {
        fields: {
          contact: {
            label: 'Fixed contact',
            description: 'Application-owned value',
            placeholder: 'unused presentation metadata',
          },
        },
      },
    });

    expect(result).toMatchObject({
      success: true,
      diagnostics: [],
      definition: {
        fields: [
          {
            fixedValue: 'a@example.com',
            format: 'email',
            label: 'Fixed contact',
            description: 'Application-owned value',
            placeholder: 'unused presentation metadata',
            constraints: {
              minLength: 100,
              maxLength: 200,
              pattern: '^never$',
            },
          },
        ],
      },
    });
    if (result.success) {
      expect(Object.hasOwn(result.definition.fields[0] ?? {}, 'default')).toBe(
        false,
      );
    }
  });

  it('orders independent schema, derived coherence and UI diagnostics and stops after type failure', () => {
    const ordered = compileFormDefinition({
      schema: schema({
        name: {
          type: 'string',
          minLength: -1,
          const: 'a',
          enum: ['b'],
        },
      }),
      uiSchema: {
        fields: { name: { options: { decimalPlaces: 2 } } },
      },
    });
    expect(ordered.diagnostics.map((entry) => entry.code)).toEqual([
      'INVALID_SCHEMA_KEYWORD_VALUE',
      'INCOMPATIBLE_SCHEMA_KEYWORD',
      'INCOMPATIBLE_UI_OPTION',
    ]);
    expect(ordered.diagnostics.map((entry) => entry.documentPath)).toEqual([
      ['properties', 'name', 'minLength'],
      ['properties', 'name', 'const'],
      ['fields', 'name', 'options', 'decimalPlaces'],
    ]);
    for (const entry of ordered.diagnostics) {
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.parameters)).toBe(true);
    }

    const stopped = compileFormDefinition({
      schema: schema({ name: { type: 'null', const: 'a' } }),
    });
    expect(stopped.diagnostics).toHaveLength(1);
    expect(stopped.diagnostics[0]).toMatchObject({
      code: 'UNSUPPORTED_FIELD_TYPE',
      dataPath: ['name'],
      documentPath: ['properties', 'name', 'type'],
    });
  });

  it('keeps const unsupported on containers and identity and closed beside references', () => {
    const root = compileFormDefinition({
      schema: { ...schema({}), const: {} },
    });
    expect(root.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'UNSUPPORTED_SCHEMA_KEYWORD',
        documentPath: ['const'],
      }),
    );

    const containers = compileFormDefinition({
      schema: schema({
        object: { type: 'object', const: {}, properties: {} },
        array: { type: 'array', const: [], items: {} },
      }),
    });
    expect(containers.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'UNSUPPORTED_SCHEMA_KEYWORD',
          documentPath: ['properties', 'object', 'const'],
        }),
        expect.objectContaining({
          code: 'UNSUPPORTED_SCHEMA_KEYWORD',
          documentPath: ['properties', 'array', 'const'],
        }),
      ]),
    );

    const collection = compileFormDefinition({
      schema: schema({
        rows: {
          type: 'array',
          items: {
            type: 'object',
            const: {},
            properties: { id: { type: 'string', const: 'fixed-id' } },
            required: ['id'],
          },
        },
      }),
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(collection.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'UNSUPPORTED_SCHEMA_KEYWORD',
          documentPath: ['properties', 'rows', 'items', 'const'],
        }),
        expect.objectContaining({
          code: 'UNSUPPORTED_SCHEMA_KEYWORD',
          documentPath: [
            'properties',
            'rows',
            'items',
            'properties',
            'id',
            'const',
          ],
        }),
      ]),
    );

    const referenceSibling = compileFormDefinition({
      schema: {
        ...schema({ name: { $ref: '#/$defs/name', const: 'sibling' } }),
        $defs: { name: { type: 'string', const: 'target' } },
      },
    });
    expect(referenceSibling.diagnostics).toHaveLength(1);
    expect(referenceSibling.diagnostics[0]).toMatchObject({
      code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
      documentPath: ['properties', 'name', 'const'],
    });
    expect(referenceSibling.diagnostics[0]?.parameters).toMatchObject({
      fieldType: 'reference',
    });
  });

  it('retains reference and template provenance for invalid const values', () => {
    const result = compileFormDefinition({
      schema: {
        $schema: DIALECT,
        $defs: { invalid: { type: 'integer', const: 1.5 } },
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                count: { $ref: '#/$defs/invalid' },
              },
              required: ['id'],
            },
          },
        },
      },
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    });
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'INVALID_SCHEMA_KEYWORD_VALUE',
        dataPath: ['rows'],
        documentPath: ['$defs', 'invalid', 'const'],
        parameters: {
          keyword: 'const',
          expected: 'finite integer',
          actualType: 'number',
          actualValue: 1.5,
          templatePath: ['count'],
          referenceChain: [
            ['properties', 'rows', 'items', 'properties', 'count', '$ref'],
          ],
        },
      }),
    ]);
  });
});

describe('M25 manual definitions and controlled-state invariance', () => {
  it('accepts compatible own values and treats absent or inherited values as editable', () => {
    for (const field of [
      manualField(),
      manualField({ fixedValue: '' }),
      manualField({ nullable: true, fixedValue: null }),
      manualField({ choices: [{ value: 'a', label: 'A' }], fixedValue: 'a' }),
      manualField({
        kind: 'number',
        numericType: 'number',
        constraints: {},
        ui: {},
        fixedValue: -0,
      }),
      manualField({ kind: 'boolean', fixedValue: false }),
    ]) {
      expect(validateCollectionFormDefinition(manualDefinition(field))).toEqual(
        { success: true },
      );
    }

    Object.defineProperty(Object.prototype, 'fixedValue', {
      configurable: true,
      value: 'inherited',
    });
    try {
      expect(
        validateCollectionFormDefinition(manualDefinition(manualField())),
      ).toEqual({ success: true });
    } finally {
      delete (Object.prototype as { fixedValue?: unknown }).fixedValue;
    }
  });

  it('returns exact direct defects and preserves existing-before-fixed precedence', () => {
    const getter = vi.fn(() => 'hidden');
    const accessor = manualField();
    Object.defineProperty(accessor, 'fixedValue', { get: getter });
    expect(
      validateCollectionFormDefinition(manualDefinition(accessor)),
    ).toEqual({
      success: false,
      defect: {
        reason: 'invalid-field-fixed-value',
        nodeIndexPath: [0],
        path: ['name'],
        member: 'fixedValue',
        expected: 'string',
        actualType: 'accessor',
      },
    });
    expect(getter).not.toHaveBeenCalled();

    const incompatible = manualField({ fixedValue: 1 });
    expect(
      validateCollectionFormDefinition(manualDefinition(incompatible)),
    ).toEqual({
      success: false,
      defect: {
        reason: 'invalid-field-fixed-value',
        nodeIndexPath: [0],
        path: ['name'],
        member: 'fixedValue',
        expected: 'string',
        actualType: 'number',
        actualValue: 1,
      },
    });

    const mismatch = manualField({
      choices: [{ value: 'a', label: 'A' }],
      fixedValue: 'b',
    });
    expect(
      validateCollectionFormDefinition(manualDefinition(mismatch)),
    ).toEqual({
      success: false,
      defect: {
        reason: 'incompatible-field-capabilities',
        nodeIndexPath: [0],
        path: ['name'],
        members: ['fixedValue', 'choices'],
      },
    });

    const invalidExisting = manualField({ choices: [], fixedValue: 1 });
    expect(
      validateCollectionFormDefinition(manualDefinition(invalidExisting)),
    ).toMatchObject({ success: false, defect: { reason: 'invalid-node' } });
  });

  it('projects exact operation and runtime envelopes and stops before validation', () => {
    const invalid = manualField({ fixedValue: 1 });
    const definition = manualDefinition(invalid) as unknown as FormDefinition;
    const applied = applyFormOperation(definition, {}, setValue('Ada'));
    expect(applied).toMatchObject({
      success: false,
      changed: false,
      value: {},
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          dataPath: ['name'],
          parameters: {
            reason: 'invalid-field-fixed-value',
            nodeIndexPath: [0],
            path: ['name'],
            member: 'fixedValue',
            expected: 'string',
            actualType: 'number',
            actualValue: 1,
          },
          fallbackMessage: 'Form definition is invalid.',
        },
      ],
    });

    const validate = vi.fn((): ValidationResult => ({
      valid: true,
      issues: [],
    }));
    const created = createControlledFormRuntime({
      formId: 'fixed',
      definition,
      schema: {},
      value: {},
      baselineValue: {},
      locale: 'en',
      validator: { validate },
    });
    expect(created).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            definitionReason: 'invalid-field-fixed-value',
            definitionMember: 'fixedValue',
            definitionExpected: 'string',
            definitionActualType: 'number',
            definitionActualValue: 1,
            nodeIndexPath: [0],
            path: ['name'],
          },
        },
      ],
    });
    expect(validate).not.toHaveBeenCalled();

    const template = {
      key: '["template",["rows"],["name"]]',
      name: 'name',
      relativePath: ['name'],
      required: false,
      label: 'Name',
      kind: 'string',
      nullable: false,
      constraints: {},
      choices: [{ value: 'a', label: 'A' }],
      fixedValue: 'b',
    };
    expect(
      validateCollectionFormDefinition(manualCollectionDefinition(template)),
    ).toEqual({
      success: false,
      defect: {
        reason: 'incompatible-field-capabilities',
        templateIndexPath: [0],
        path: ['rows'],
        relativePath: ['name'],
        members: ['fixedValue', 'choices'],
      },
    });
  });

  it('never inserts, repairs or enforces fixedValue in operations or runtime intentions', () => {
    const compiled = compileFormDefinition({
      schema: schema({ name: { type: 'string', const: 'locked' } }),
    });
    expect(compiled.success).toBe(true);
    if (!compiled.success) return;

    const applied = applyFormOperation(
      compiled.definition,
      {},
      setValue('other'),
    );
    expect(applied).toMatchObject({
      success: true,
      changed: true,
      value: { name: 'other' },
    });
    expect(applyOperation({}, setValue('other'))).toEqual(applied);

    const operations: FormOperation[] = [];
    const created = createControlledFormRuntime({
      formId: 'fixed',
      definition: compiled.definition,
      schema: {},
      value: {},
      baselineValue: {},
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    expect(created.runtime.getSnapshot().value).toEqual({});
    expect(created.runtime.requestSetValue(['name'], 'other')).toMatchObject({
      success: true,
      effects: { operationEmitted: true, snapshotChanged: false },
    });
    expect(operations).toMatchObject([{ type: 'set-value', value: 'other' }]);
    expect(created.runtime.getSnapshot().value).toEqual({});
  });
});
