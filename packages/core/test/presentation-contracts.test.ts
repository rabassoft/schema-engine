import { describe, expect, it, vi } from 'vitest';
import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type FormDefinition,
  type PresentationEntryDefinition,
  type PresentationSectionDefinition,
} from '../src/index.js';
import { validateCollectionFormDefinition } from '../src/internal/nested-definition.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';
const compiled = compileFormDefinition({
  schema: {
    $schema: dialect,
    type: 'object',
    properties: { name: { type: 'string' } },
  },
});
if (!compiled.success)
  throw new Error('presentation fixture compilation failed');
const node = compiled.definition.nodes[0]!;
const field = compiled.definition.fields[0]!;

function definition(
  presentation: readonly PresentationEntryDefinition[],
): FormDefinition {
  return { nodes: [node], fields: [field], presentation };
}

function wrapper(target = node): PresentationEntryDefinition {
  return { kind: 'form-node', node: target };
}

function section(
  id: string,
  children: readonly PresentationEntryDefinition[],
): PresentationSectionDefinition {
  return {
    kind: 'section',
    id,
    key: JSON.stringify(['section', id]),
    label: id,
    children,
  };
}

describe('manual presentation definition validation', () => {
  it.each([
    {
      reason: 'missing-presentation',
      value: { nodes: [node], fields: [field] },
    },
    {
      reason: 'invalid-presentation-entry',
      value: definition([null as never]),
      path: [0],
    },
    {
      reason: 'invalid-presentation-section',
      value: definition([
        {
          kind: 'section',
          id: '',
          key: JSON.stringify(['section', '']),
          label: 'Invalid',
          children: [wrapper()],
        },
      ]),
      path: [0],
    },
    {
      reason: 'invalid-presentation-section-key',
      value: definition([
        {
          kind: 'section',
          id: 'main',
          key: 'wrong',
          label: 'Main',
          children: [wrapper()],
        },
      ]),
      path: [0],
    },
    {
      reason: 'duplicate-presentation-section-id',
      value: definition([
        section('same', [wrapper()]),
        section('same', [wrapper()]),
      ]),
      path: [1],
    },
    {
      reason: 'unknown-presented-node',
      value: definition([wrapper({ ...node })]),
      path: [0],
    },
    {
      reason: 'duplicate-presented-node',
      value: definition([wrapper(), wrapper()]),
      path: [1],
    },
    {
      reason: 'missing-presented-node',
      value: definition([]),
    },
  ] as const)(
    'reports $reason deterministically',
    ({ reason, value, path }) => {
      const result = validateCollectionFormDefinition(value);

      expect(result).toMatchObject({ success: false, defect: { reason } });
      if (result.success || path === undefined) return;
      expect(result.defect.presentationIndexPath).toEqual(path);
      expect(Object.isFrozen(result.defect.presentationIndexPath)).toBe(true);
    },
  );

  it('detects active-ancestry cycles iteratively', () => {
    const cyclic = section('cycle', [
      wrapper(),
    ]) as PresentationSectionDefinition & {
      children: PresentationEntryDefinition[];
    };
    cyclic.children = [cyclic];

    expect(
      validateCollectionFormDefinition(definition([cyclic])),
    ).toMatchObject({
      success: false,
      defect: { reason: 'cyclic-presentation', presentationIndexPath: [0, 0] },
    });
  });

  it('accepts unfrozen caller containers while preserving exact root-node identity', () => {
    const manual = definition([section('main', [wrapper()])]);

    expect(Object.isFrozen(manual)).toBe(false);
    expect(validateCollectionFormDefinition(manual)).toEqual({ success: true });
  });

  it('rejects invalid presentation before validator or managed-data inspection', () => {
    const validate = vi.fn(() => ({ valid: true as const, issues: [] }));
    const invalid = definition([]);
    const current = Object.defineProperty({}, 'name', {
      get() {
        throw new Error('managed data must not be inspected');
      },
    });

    const runtime = createControlledFormRuntime({
      formId: 'form',
      definition: invalid,
      schema: {},
      value: {},
      baselineValue: {},
      locale: 'en',
      validator: { validate },
    });
    expect(runtime).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          parameters: { definitionReason: 'missing-presented-node' },
        },
      ],
    });
    expect(validate).not.toHaveBeenCalled();

    expect(
      applyFormOperation(invalid, current, {
        type: 'set-value',
        metadata: { id: 1, formId: 'form' },
        path: ['name'],
        expected: { kind: 'missing' },
        value: 'Ada',
        source: 'user',
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_FORM_DEFINITION',
          parameters: { reason: 'missing-presented-node' },
        },
      ],
    });
  });
});

describe('presentation-independent runtime behavior', () => {
  it('keeps snapshots, validation input, scopes and operations independent from presentation order', () => {
    const runtimeSchema = {
      $schema: dialect,
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'boolean' } },
    } as const;
    const ordinary = compileFormDefinition({ schema: runtimeSchema });
    const grouped = compileFormDefinition({
      schema: runtimeSchema,
      uiSchema: {
        presentation: [
          {
            kind: 'section',
            id: 'main',
            label: 'Main',
            children: ['b', 'a'],
          },
        ],
      },
    });
    if (!ordinary.success || !grouped.success)
      throw new Error('runtime invariance fixture failed');
    const value = { a: 'Ada', b: true };
    const schemas: unknown[] = [];
    const create = (manual: FormDefinition) =>
      createControlledFormRuntime({
        formId: 'form',
        definition: manual,
        schema: runtimeSchema,
        value,
        baselineValue: value,
        locale: 'en',
        validator: {
          validate(received) {
            schemas.push(received);
            return { valid: true, issues: [] };
          },
        },
      });
    const first = create(ordinary.definition);
    const second = create(grouped.definition);
    expect(first.success && second.success).toBe(true);
    if (!first.success || !second.success) return;
    expect(second.runtime.getSnapshot()).toEqual(first.runtime.getSnapshot());
    expect(second.runtime.getValidationSnapshot()).toEqual(
      first.runtime.getValidationSnapshot(),
    );
    expect(schemas.every((received) => received === runtimeSchema)).toBe(true);
    const operation = {
      type: 'set-value',
      metadata: { id: 1, formId: 'form' },
      path: ['a'],
      expected: { kind: 'value', value: 'Ada' },
      value: 'Grace',
      source: 'user',
    } as const;
    expect(applyFormOperation(grouped.definition, value, operation)).toEqual(
      applyFormOperation(ordinary.definition, value, operation),
    );
  });
});
