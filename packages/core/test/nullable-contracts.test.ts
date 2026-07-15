import { describe, expect, it, vi } from 'vitest';
import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type FormDefinition,
  type FormOperation,
} from '../src/index.js';
import { validateCollectionFormDefinition } from '../src/internal/nested-definition.js';

const metadata = { id: 1, formId: 'form' } as const;

function field(nullable: unknown = false): Record<string, unknown> {
  return {
    key: '["name"]',
    name: 'name',
    path: ['name'],
    required: false,
    label: 'Name',
    kind: 'string',
    nullable,
    constraints: {},
  };
}

function definition(node: object): Record<string, unknown> {
  return {
    nodes: [node],
    fields: [node],
    presentation: [{ kind: 'form-node', node }],
  };
}

function collectionDefinition(template: object): Record<string, unknown> {
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

function setItemValue(value: unknown): FormOperation {
  return {
    type: 'set-item-value',
    metadata,
    target: {
      collectionPath: ['rows'],
      itemId: 'a',
      relativePath: ['name'],
    },
    identityProperty: 'id',
    expected: { kind: 'missing' },
    value,
    source: 'user',
  };
}

describe('PLAN-014 checkpoint 1 nullable contracts', () => {
  it('requires an own boolean on direct fields without invoking accessors', () => {
    const missing = field();
    delete missing.nullable;
    expect(validateCollectionFormDefinition(definition(missing))).toEqual({
      success: false,
      defect: {
        reason: 'invalid-field-nullable',
        nodeIndexPath: [0],
        path: ['name'],
        member: 'nullable',
        actualType: 'missing',
      },
    });

    const getter = vi.fn(() => true);
    const accessor = field();
    Object.defineProperty(accessor, 'nullable', { get: getter });
    expect(validateCollectionFormDefinition(definition(accessor))).toEqual({
      success: false,
      defect: {
        reason: 'invalid-field-nullable',
        nodeIndexPath: [0],
        path: ['name'],
        member: 'nullable',
        actualType: 'accessor',
      },
    });
    expect(getter).not.toHaveBeenCalled();

    for (const [nullable, actualType] of [
      [null, 'null'],
      [[], 'array'],
      [{}, 'object'],
      ['true', 'string'],
      [1, 'number'],
      [undefined, 'undefined'],
    ] as const) {
      const invalid = field(false);
      invalid.nullable = nullable;
      expect(
        validateCollectionFormDefinition(definition(invalid)),
      ).toMatchObject({
        success: false,
        defect: {
          reason: 'invalid-field-nullable',
          member: 'nullable',
          actualType,
        },
      });
    }
  });

  it('treats an inherited member as missing and rejects nullable choices', () => {
    Object.defineProperty(Object.prototype, 'nullable', {
      configurable: true,
      value: true,
    });
    try {
      const inherited = field();
      delete inherited.nullable;
      expect(validateCollectionFormDefinition(definition(inherited))).toEqual({
        success: false,
        defect: {
          reason: 'invalid-field-nullable',
          nodeIndexPath: [0],
          path: ['name'],
          member: 'nullable',
          actualType: 'missing',
        },
      });
    } finally {
      delete (Object.prototype as { nullable?: unknown }).nullable;
    }

    const direct = field(true);
    direct.choices = [{ value: 'a', label: 'A' }];
    expect(validateCollectionFormDefinition(definition(direct))).toEqual({
      success: false,
      defect: {
        reason: 'incompatible-field-capabilities',
        nodeIndexPath: [0],
        path: ['name'],
        members: ['nullable', 'choices'],
      },
    });

    const template = {
      key: '["template",["rows"],["name"]]',
      name: 'name',
      relativePath: ['name'],
      required: false,
      label: 'Name',
      kind: 'string',
      nullable: true,
      constraints: {},
      choices: [{ value: 'a', label: 'A' }],
    };
    expect(
      validateCollectionFormDefinition(collectionDefinition(template)),
    ).toEqual({
      success: false,
      defect: {
        reason: 'incompatible-field-capabilities',
        templateIndexPath: [0],
        path: ['rows'],
        relativePath: ['name'],
        members: ['nullable', 'choices'],
      },
    });
  });

  it('projects exact direct and template definition diagnostics', () => {
    const direct = field();
    delete direct.nullable;
    const directResult = applyFormOperation(
      definition(direct) as never,
      {},
      setValue('Ada'),
    );
    expect(directResult).toMatchObject({
      success: false,
      changed: false,
      value: {},
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          dataPath: ['name'],
          parameters: {
            reason: 'invalid-field-nullable',
            nodeIndexPath: [0],
            path: ['name'],
            member: 'nullable',
            actualType: 'missing',
          },
          fallbackMessage: 'Form definition is invalid.',
        },
      ],
    });
    const directParameters = directResult.diagnostics[0]?.parameters;
    expect(Object.isFrozen(directParameters)).toBe(true);
    expect(Object.isFrozen(directParameters?.nodeIndexPath)).toBe(true);
    expect(Object.isFrozen(directParameters?.path)).toBe(true);

    const template = {
      key: '["template",["rows"],["name"]]',
      name: 'name',
      relativePath: ['name'],
      required: false,
      label: 'Name',
      kind: 'string',
      nullable: true,
      constraints: {},
      choices: [{ value: 'a', label: 'A' }],
    };
    const templateResult = applyFormOperation(
      collectionDefinition(template) as never,
      { rows: [{ id: 'a' }] },
      setItemValue('Ada'),
    );
    expect(templateResult).toMatchObject({
      success: false,
      changed: false,
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          dataPath: ['rows'],
          parameters: {
            reason: 'incompatible-field-capabilities',
            templateIndexPath: [0],
            path: ['rows'],
            relativePath: ['name'],
            members: ['nullable', 'choices'],
          },
          fallbackMessage: 'Form definition is invalid.',
        },
      ],
    });
    const templateParameters = templateResult.diagnostics[0]?.parameters;
    expect(Object.isFrozen(templateParameters?.members)).toBe(true);
    expect(Object.isFrozen(templateParameters?.templateIndexPath)).toBe(true);
    expect(Object.isFrozen(templateParameters?.relativePath)).toBe(true);
  });

  it('wraps runtime definition defects and stops before validation', () => {
    const validator = { validate: vi.fn(() => ({ valid: true, issues: [] })) };
    const invalid = field();
    delete invalid.nullable;
    const result = createControlledFormRuntime({
      formId: 'form',
      definition: definition(invalid) as never,
      schema: { type: 'object' },
      value: {},
      baselineValue: {},
      locale: 'en',
      validator,
    });
    expect(result).toEqual({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          severity: 'error',
          source: 'runtime',
          parameters: {
            member: 'definition',
            expected: 'valid collection FormDefinition',
            reason: 'invalid-value',
            actualType: 'object',
            definitionReason: 'invalid-field-nullable',
            definitionMember: 'nullable',
            definitionActualType: 'missing',
            nodeIndexPath: [0],
            path: ['name'],
          },
          fallbackMessage: 'Runtime option "definition" is invalid.',
        },
      ],
    });
    expect(validator.validate).not.toHaveBeenCalled();

    const template = {
      key: '["template",["rows"],["name"]]',
      name: 'name',
      relativePath: ['name'],
      required: false,
      label: 'Name',
      kind: 'string',
      nullable: true,
      constraints: {},
      choices: [{ value: 'a', label: 'A' }],
    };
    const templateResult = createControlledFormRuntime({
      formId: 'form',
      definition: collectionDefinition(template) as never,
      schema: { type: 'object' },
      value: { rows: [] },
      baselineValue: { rows: [] },
      locale: 'en',
      validator,
    });
    expect(templateResult).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            member: 'definition',
            reason: 'invalid-value',
            actualType: 'object',
            definitionReason: 'incompatible-field-capabilities',
            definitionMembers: ['nullable', 'choices'],
            templateIndexPath: [0],
            path: ['rows'],
            relativePath: ['name'],
          },
        },
      ],
    });
    const wrappedParameters = templateResult.diagnostics[0]?.parameters;
    expect(Object.isFrozen(wrappedParameters?.definitionMembers)).toBe(true);
    expect(Object.isFrozen(wrappedParameters?.templateIndexPath)).toBe(true);
    expect(Object.isFrozen(wrappedParameters?.relativePath)).toBe(true);
    expect(validator.validate).not.toHaveBeenCalled();
  });

  it('keeps type arrays and null compatibility inactive during checkpoint 1', () => {
    expect(
      compileFormDefinition({
        schema: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: { name: { type: ['string', 'null'] } },
        },
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [{ code: 'UNSUPPORTED_FIELD_TYPE' }],
    });

    const nullable = field(true);
    const manual = definition(nullable) as unknown as FormDefinition;
    expect(validateCollectionFormDefinition(manual)).toEqual({ success: true });

    expect(applyFormOperation(manual, {}, setValue(null))).toMatchObject({
      success: false,
      changed: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_OPERATION_VALUE',
          parameters: { actualType: 'null' },
        },
      ],
    });
  });
});
