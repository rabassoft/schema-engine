import { describe, expect, it, vi } from 'vitest';

import {
  applyFormOperation,
  createControlledFormRuntime,
  type ArrayNodeDefinition,
  type FieldDefinition,
  type FormDefinition,
  type ObjectFieldDefinition,
  type ObjectNodeTemplate,
} from '../src/index.js';
import { validateCollectionFormDefinition } from '../src/internal/nested-definition.js';

const field: FieldDefinition = {
  kind: 'string',
  key: '["profile","name"]',
  name: 'name',
  path: ['profile', 'name'],
  required: false,
  label: 'Name',
  nullable: false,
  constraints: {},
};

function objectOwner(
  presentation?: ObjectFieldDefinition['presentation'],
): ObjectFieldDefinition {
  return {
    kind: 'object',
    key: '["profile"]',
    name: 'profile',
    path: ['profile'],
    required: false,
    label: 'Profile',
    children: [field],
    ...(presentation === undefined ? {} : { presentation }),
  } as ObjectFieldDefinition;
}

function definition(owner: ObjectFieldDefinition): FormDefinition {
  return {
    nodes: [owner],
    fields: [field],
    presentation: [{ kind: 'form-node', node: owner }],
  };
}

function templateField() {
  return {
    kind: 'string',
    key: '["template",["rows"],["details","name"]]',
    name: 'name',
    relativePath: ['details', 'name'],
    required: false,
    label: 'Name',
    nullable: false,
    constraints: {},
  } as const;
}

function collectionDefinition(options: {
  readonly itemPresentation?: boolean;
  readonly objectPresentation?: boolean;
}): FormDefinition {
  const leaf = templateField();
  const details = {
    kind: 'object',
    key: '["template",["rows"],["details"]]',
    name: 'details',
    relativePath: ['details'],
    required: false,
    label: 'Details',
    children: [leaf],
    ...(options.objectPresentation
      ? { presentation: [{ kind: 'form-node', node: leaf }] }
      : {}),
  } as ObjectNodeTemplate;
  const rows = {
    kind: 'array',
    key: '["rows"]',
    name: 'rows',
    path: ['rows'],
    required: false,
    label: 'Rows',
    identity: { property: 'id' },
    item: {
      kind: 'item-template',
      children: [details],
      fields: [leaf],
      ...(options.itemPresentation
        ? { presentation: [{ kind: 'form-node', node: details }] }
        : {}),
    },
  } as ArrayNodeDefinition;
  return {
    nodes: [rows],
    fields: [],
    presentation: [{ kind: 'form-node', node: rows }],
  };
}

describe('manual recursive local presentation validation', () => {
  it('reports missing ordinary, item and template-object forests with exact frozen owner context', () => {
    const ordinary = validateCollectionFormDefinition(
      definition(objectOwner()),
    );
    expect(ordinary).toMatchObject({
      success: false,
      defect: {
        reason: 'missing-presentation',
        presentationOwnerKind: 'object',
        presentationOwnerPath: ['profile'],
      },
    });

    const item = validateCollectionFormDefinition(
      collectionDefinition({ objectPresentation: true }),
    );
    expect(item).toMatchObject({
      success: false,
      defect: {
        reason: 'missing-presentation',
        presentationOwnerKind: 'item',
        presentationOwnerPath: ['rows'],
        presentationTemplatePath: [],
      },
    });

    const template = validateCollectionFormDefinition(
      collectionDefinition({ itemPresentation: true }),
    );
    expect(template).toMatchObject({
      success: false,
      defect: {
        reason: 'missing-presentation',
        presentationOwnerKind: 'template-object',
        presentationOwnerPath: ['rows'],
        presentationTemplatePath: ['details'],
      },
    });
    if (template.success) return;
    expect(Object.isFrozen(template.defect.presentationOwnerPath)).toBe(true);
    expect(Object.isFrozen(template.defect.presentationTemplatePath)).toBe(
      true,
    );
  });

  it('validates exact local keys and direct-child identity', () => {
    const owner = objectOwner([
      {
        kind: 'section',
        id: 'main',
        key: JSON.stringify([
          'presentation',
          ['object', ['profile']],
          'section',
          'main',
        ]),
        label: 'Main',
        children: [{ kind: 'form-node', node: field }],
      },
    ]);
    expect(validateCollectionFormDefinition(definition(owner))).toEqual({
      success: true,
    });

    const badKey = objectOwner([
      {
        kind: 'section',
        id: 'main',
        key: '["section","main"]',
        label: 'Main',
        children: [{ kind: 'form-node', node: field }],
      },
    ]);
    expect(validateCollectionFormDefinition(definition(badKey))).toMatchObject({
      success: false,
      defect: {
        reason: 'invalid-presentation-section-key',
        presentationIndexPath: [0],
        presentationOwnerKind: 'object',
      },
    });

    const clone = { ...field };
    const badIdentity = objectOwner([{ kind: 'form-node', node: clone }]);
    expect(
      validateCollectionFormDefinition(definition(badIdentity)),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'unknown-presented-node',
        presentationIndexPath: [0],
        presentationOwnerKind: 'object',
      },
    });
  });

  it('selects root before structural-preorder owners and blocks runtime, operation and validator invocation', () => {
    const invalidOwner = objectOwner([
      {
        kind: 'section',
        id: 'main',
        key: 'bad',
        label: 'Main',
        children: [{ kind: 'form-node', node: field }],
      },
    ]);
    const value = { ...definition(invalidOwner), presentation: [] };
    expect(validateCollectionFormDefinition(value)).toMatchObject({
      success: false,
      defect: { reason: 'missing-presented-node' },
    });

    const localOnly = definition(invalidOwner);
    const validate = vi.fn(() => ({ valid: true as const, issues: [] }));
    expect(
      createControlledFormRuntime({
        formId: 'form',
        definition: localOnly,
        schema: {},
        value: { profile: { name: 'Ada' } },
        baselineValue: { profile: { name: 'Ada' } },
        locale: 'en',
        validator: { validate },
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: {
            definitionReason: 'invalid-presentation-section-key',
            presentationOwnerKind: 'object',
            presentationOwnerPath: ['profile'],
            presentationIndexPath: [0],
          },
        },
      ],
    });
    expect(validate).not.toHaveBeenCalled();

    const getter = vi.fn();
    const current = Object.defineProperty({}, 'profile', {
      enumerable: true,
      get: getter,
    });
    expect(
      applyFormOperation(localOnly, current, {
        type: 'set-value',
        metadata: { id: 1, formId: 'form' },
        path: ['profile', 'name'],
        expected: { kind: 'missing' },
        value: 'Grace',
        source: 'user',
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          parameters: {
            reason: 'invalid-presentation-section-key',
            presentationOwnerKind: 'object',
            presentationOwnerPath: ['profile'],
            presentationIndexPath: [0],
          },
        },
      ],
    });
    expect(getter).not.toHaveBeenCalled();
  });
});
