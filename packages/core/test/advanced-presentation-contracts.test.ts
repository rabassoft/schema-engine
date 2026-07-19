import { describe, expect, it, vi } from 'vitest';
import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type FormDefinition,
} from '../src/index.js';
import { validateCollectionFormDefinition } from '../src/internal/nested-definition.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';
const singleSchema = {
  $schema: dialect,
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;
const singleCompilation = compileFormDefinition({ schema: singleSchema });
if (!singleCompilation.success)
  throw new Error('advanced manual-definition fixture compilation failed');
const node = singleCompilation.definition.nodes[0]!;
const field = singleCompilation.definition.fields[0]!;
const wrapper = () => ({ kind: 'form-node', node }) as const;

function definition(presentation: readonly unknown[]): FormDefinition {
  return {
    nodes: [node],
    fields: [field],
    presentation: presentation as FormDefinition['presentation'],
  };
}

function panel(
  ownerKind: 'tabs' | 'accordion',
  ownerId: string,
  id: string,
  children: readonly unknown[],
) {
  return {
    kind: 'panel',
    id,
    key: JSON.stringify([ownerKind, ownerId, 'panel', id]),
    label: id,
    children,
  };
}

function tabs(id: string, children: readonly unknown[]) {
  return {
    kind: 'tabs',
    id,
    key: JSON.stringify(['tabs', id]),
    label: id,
    panels: [panel('tabs', id, 'main', children)],
  };
}

function accordion(id: string, children: readonly unknown[]) {
  return {
    kind: 'accordion',
    id,
    key: JSON.stringify(['accordion', id]),
    label: id,
    panels: [panel('accordion', id, 'main', children)],
  };
}

function grid(id: string, children: readonly unknown[], columns = 2) {
  return {
    kind: 'grid',
    id,
    key: JSON.stringify(['grid', id]),
    label: id,
    columns,
    items: children.map((child, index) => ({
      kind: 'grid-item',
      key: JSON.stringify(['grid', id, 'item', index]),
      span: 1,
      child,
    })),
  };
}

const manualCases = [
  {
    reason: 'invalid-presentation-tabs',
    path: [0],
    value: definition([{ ...tabs('tabs', [wrapper()]), label: ' ' }]),
  },
  {
    reason: 'invalid-presentation-accordion',
    path: [0],
    value: definition([{ ...accordion('accordion', [wrapper()]), panels: [] }]),
  },
  {
    reason: 'invalid-presentation-panel',
    path: [0, 0],
    value: definition([
      {
        ...tabs('tabs', [wrapper()]),
        panels: [panel('tabs', 'tabs', 'main', [])],
      },
    ]),
  },
  {
    reason: 'invalid-presentation-grid',
    path: [0],
    value: definition([{ ...grid('grid', [wrapper()]), columns: 5 }]),
  },
  {
    reason: 'invalid-presentation-grid-item',
    path: [0, 0],
    value: definition([
      {
        ...grid('grid', [wrapper()]),
        items: [
          {
            kind: 'grid-item',
            key: JSON.stringify(['grid', 'grid', 'item', 0]),
            span: 3,
            child: wrapper(),
          },
        ],
      },
    ]),
  },
  {
    reason: 'invalid-presentation-entry-key',
    path: [0, 0],
    value: definition([
      {
        ...tabs('tabs', [wrapper()]),
        panels: [{ ...panel('tabs', 'tabs', 'main', [wrapper()]), key: 'bad' }],
      },
    ]),
  },
  {
    reason: 'duplicate-presentation-container-id',
    path: [1],
    value: definition([
      {
        kind: 'section',
        id: 'same',
        key: JSON.stringify(['section', 'same']),
        label: 'Same',
        children: [wrapper()],
      },
      tabs('same', [wrapper()]),
    ]),
  },
  {
    reason: 'duplicate-presentation-panel-id',
    path: [0, 1],
    value: definition([
      {
        ...tabs('tabs', [wrapper()]),
        panels: [
          panel('tabs', 'tabs', 'same', [wrapper()]),
          panel('tabs', 'tabs', 'same', [wrapper()]),
        ],
      },
    ]),
  },
] as const;

describe('advanced manual presentation definition validation', () => {
  it.each(manualCases)(
    'reports $reason at its exact numeric path and blocks runtime/operations',
    ({ reason, path, value }) => {
      const validated = validateCollectionFormDefinition(value);
      expect(validated).toMatchObject({
        success: false,
        defect: { reason, presentationIndexPath: path },
      });
      if (!validated.success) {
        expect(Object.isFrozen(validated.defect.presentationIndexPath)).toBe(
          true,
        );
      }

      const validate = vi.fn(() => ({ valid: true as const, issues: [] }));
      expect(
        createControlledFormRuntime({
          formId: 'form',
          definition: value,
          schema: singleSchema,
          value: { name: 'Ada' },
          baselineValue: { name: 'Ada' },
          locale: 'en',
          validator: { validate },
        }),
      ).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INVALID_RUNTIME_OPTIONS',
            parameters: {
              definitionReason: reason,
              presentationIndexPath: path,
            },
          },
        ],
      });
      expect(validate).not.toHaveBeenCalled();

      const operationLogic = vi.fn();
      const current = Object.defineProperty({}, 'name', {
        enumerable: true,
        get: operationLogic,
      });
      expect(
        applyFormOperation(value, current, {
          type: 'set-value',
          metadata: { id: 1, formId: 'form' },
          path: ['name'],
          expected: { kind: 'value', value: 'Ada' },
          value: 'Grace',
          source: 'user',
        }),
      ).toMatchObject({
        success: false,
        diagnostics: [
          {
            code: 'INVALID_FORM_DEFINITION',
            parameters: { reason, presentationIndexPath: path },
          },
        ],
      });
      expect(operationLogic).not.toHaveBeenCalled();
    },
  );

  it('uses the later section reason in the shared container namespace', () => {
    const value = definition([
      grid('same', [wrapper()]),
      {
        kind: 'section',
        id: 'same',
        key: JSON.stringify(['section', 'same']),
        label: 'Same',
        children: [wrapper()],
      },
    ]);

    expect(validateCollectionFormDefinition(value)).toMatchObject({
      success: false,
      defect: {
        reason: 'duplicate-presentation-section-id',
        presentationIndexPath: [1],
      },
    });
  });

  it('keeps malformed or unsupported normalized discriminants on the existing entry reason', () => {
    for (const entry of [{ kind: 'panel' }, { kind: 1 }, {}]) {
      expect(
        validateCollectionFormDefinition(definition([entry])),
      ).toMatchObject({
        success: false,
        defect: {
          reason: 'invalid-presentation-entry',
          presentationIndexPath: [0],
        },
      });
    }
  });

  it('uses shape before key, key before duplicates and descendants before missing membership', () => {
    const malformed = tabs('tabs', [wrapper()]);
    const malformedPanel = panel('tabs', 'tabs', 'same', [wrapper()]);
    const value = definition([
      {
        ...malformed,
        key: 'bad',
        panels: [
          { ...malformedPanel, label: ' ', key: 'also-bad' },
          malformedPanel,
        ],
      },
    ]);
    expect(validateCollectionFormDefinition(value)).toMatchObject({
      success: false,
      defect: {
        reason: 'invalid-presentation-entry-key',
        presentationIndexPath: [0],
      },
    });

    expect(
      validateCollectionFormDefinition(
        definition([
          {
            ...malformed,
            panels: [
              { ...malformedPanel, label: ' ', key: 'also-bad' },
              malformedPanel,
            ],
          },
        ]),
      ),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'invalid-presentation-panel',
        presentationIndexPath: [0, 0],
      },
    });
  });

  it('does not invoke accessors and rejects sparse container members at their owner', () => {
    const getter = vi.fn();
    const panels: unknown[] = [panel('tabs', 'tabs', 'main', [wrapper()])];
    Object.defineProperty(panels, 0, { get: getter });
    const items: unknown[] = [
      {
        kind: 'grid-item',
        key: JSON.stringify(['grid', 'grid', 'item', 0]),
        span: 1,
        child: wrapper(),
      },
    ];
    Object.defineProperty(items, 0, { get: getter });
    const item = Object.defineProperty(
      {
        kind: 'grid-item',
        key: JSON.stringify(['grid', 'grid', 'item', 0]),
        span: 1,
      },
      'child',
      { enumerable: true, get: getter },
    );
    const keyedTabs = Object.defineProperty(
      {
        kind: 'tabs',
        id: 'tabs',
        label: 'Tabs',
        panels: [panel('tabs', 'tabs', 'main', [wrapper()])],
      },
      'key',
      { enumerable: true, get: getter },
    );
    const discriminant = Object.defineProperty({}, 'kind', {
      enumerable: true,
      get: getter,
    });

    const values = [
      definition([{ ...tabs('tabs', [wrapper()]), panels }]),
      definition([{ ...grid('grid', [wrapper()]), items }]),
      definition([{ ...grid('grid', [wrapper()]), items: [item] }]),
      definition([keyedTabs]),
      definition([discriminant]),
    ];
    expect(
      values.map((value) => {
        const result = validateCollectionFormDefinition(value);
        return result.success ? undefined : result.defect.reason;
      }),
    ).toEqual([
      'invalid-presentation-tabs',
      'invalid-presentation-grid',
      'invalid-presentation-grid-item',
      'invalid-presentation-entry-key',
      'invalid-presentation-entry',
    ]);
    expect(getter).not.toHaveBeenCalled();

    const sparsePanels: unknown[] = [];
    sparsePanels.length = 1;
    expect(
      validateCollectionFormDefinition(
        definition([{ ...tabs('tabs', [wrapper()]), panels: sparsePanels }]),
      ),
    ).toMatchObject({
      success: false,
      defect: { reason: 'invalid-presentation-tabs' },
    });
  });

  it('tracks cycles across panels/items and handles deep valid forests iteratively', () => {
    const cyclicTabs = tabs('tabs', []) as ReturnType<typeof tabs> & {
      panels: Array<ReturnType<typeof panel>>;
    };
    cyclicTabs.panels = [panel('tabs', 'tabs', 'main', [cyclicTabs])];
    expect(
      validateCollectionFormDefinition(definition([cyclicTabs])),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'cyclic-presentation',
        presentationIndexPath: [0, 0, 0],
      },
    });

    const cyclicGrid = grid('grid', []) as ReturnType<typeof grid> & {
      items: Array<{
        kind: 'grid-item';
        key: string;
        span: number;
        child: unknown;
      }>;
    };
    cyclicGrid.items = [
      {
        kind: 'grid-item',
        key: JSON.stringify(['grid', 'grid', 'item', 0]),
        span: 1,
        child: cyclicGrid,
      },
    ];
    expect(
      validateCollectionFormDefinition(definition([cyclicGrid])),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'cyclic-presentation',
        presentationIndexPath: [0, 0, 0],
      },
    });

    let entry: unknown = wrapper();
    for (let depth = 0; depth < 1_500; depth += 1) {
      entry =
        depth % 2 === 0
          ? grid(`grid-${depth}`, [entry], 1)
          : tabs(`tabs-${depth}`, [entry]);
    }
    expect(validateCollectionFormDefinition(definition([entry]))).toEqual({
      success: true,
    });
  });
});

describe('advanced presentation runtime invariance', () => {
  it('keeps controlled state, validation, issues, scopes and operations independent from layout', () => {
    const schema = {
      $schema: dialect,
      type: 'object',
      properties: { a: { type: 'string' }, b: { type: 'boolean' } },
    } as const;
    const ordinary = compileFormDefinition({ schema });
    const advanced = compileFormDefinition({
      schema,
      uiSchema: {
        presentation: [
          {
            kind: 'tabs',
            id: 'tabs',
            label: 'Tabs',
            panels: [
              {
                kind: 'panel',
                id: 'main',
                label: 'Main',
                children: [
                  {
                    kind: 'grid',
                    id: 'grid',
                    label: 'Grid',
                    columns: 2,
                    items: [{ child: 'b' }, { child: 'a' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    if (!ordinary.success || !advanced.success)
      throw new Error('advanced runtime invariance compilation failed');
    const value = { a: 'Ada', b: false };
    const calls: Array<readonly [unknown, unknown]> = [];
    const create = (manual: FormDefinition) =>
      createControlledFormRuntime({
        formId: 'form',
        definition: manual,
        schema,
        value,
        baselineValue: value,
        locale: 'en',
        validator: {
          validate(receivedSchema, receivedValue) {
            calls.push([receivedSchema, receivedValue]);
            return {
              valid: false,
              issues: [{ code: 'b-hidden', path: ['b'], parameters: {} }],
            };
          },
        },
      });
    const first = create(ordinary.definition);
    const second = create(advanced.definition);
    expect(first.success && second.success).toBe(true);
    if (!first.success || !second.success) return;

    expect(second.runtime.getSnapshot()).toEqual(first.runtime.getSnapshot());
    expect(second.runtime.getValidationSnapshot()).toEqual(
      first.runtime.getValidationSnapshot(),
    );
    expect(
      second.runtime.getValidationSnapshot().issues.map(({ code }) => code),
    ).toEqual(['b-hidden']);
    expect(
      calls.every(
        ([receivedSchema, receivedValue]) =>
          receivedSchema === schema && receivedValue === value,
      ),
    ).toBe(true);

    const scope = { id: 'a-only', paths: [['a']] } as const;
    expect(second.runtime.showValidationErrors(scope)).toEqual(
      first.runtime.showValidationErrors(scope),
    );
    expect(second.runtime.getValidationSnapshot(scope)).toEqual(
      first.runtime.getValidationSnapshot(scope),
    );
    expect(second.runtime.focus(['a'])).toEqual(first.runtime.focus(['a']));
    expect(second.runtime.blur(['a'])).toEqual(first.runtime.blur(['a']));
    expect(second.runtime.resetTouched(scope)).toEqual(
      first.runtime.resetTouched(scope),
    );

    const operation = {
      type: 'set-value',
      metadata: { id: 1, formId: 'form' },
      path: ['a'],
      expected: { kind: 'value', value: 'Ada' },
      value: 'Grace',
      source: 'user',
    } as const;
    expect(applyFormOperation(advanced.definition, value, operation)).toEqual(
      applyFormOperation(ordinary.definition, value, operation),
    );
  });

  it('preserves stable collection identity and movement semantics', () => {
    const schema = {
      $schema: dialect,
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
            required: ['id'],
          },
        },
      },
    } as const;
    const input = {
      schema,
      collectionPolicies: [
        { path: ['rows'], itemIdentityProperty: 'id' },
      ] as const,
    };
    const ordinary = compileFormDefinition(input);
    const advanced = compileFormDefinition({
      ...input,
      uiSchema: {
        presentation: [
          {
            kind: 'accordion',
            id: 'rows',
            label: 'Rows',
            panels: [
              {
                kind: 'panel',
                id: 'main',
                label: 'Main',
                children: ['rows'],
              },
            ],
          },
        ],
      },
    });
    if (!ordinary.success || !advanced.success)
      throw new Error('collection invariance compilation failed');
    const value = {
      rows: [
        { id: 'a', name: 'Ada' },
        { id: 'b', name: 'Bob' },
      ],
    };
    const create = (manual: FormDefinition) =>
      createControlledFormRuntime({
        formId: 'form',
        definition: manual,
        schema,
        value,
        baselineValue: value,
        locale: 'en',
        validator: { validate: () => ({ valid: true, issues: [] }) },
      });
    const first = create(ordinary.definition);
    const second = create(advanced.definition);
    expect(first.success && second.success).toBe(true);
    if (!first.success || !second.success) return;
    const address = { collectionPath: ['rows'], itemId: 'a' } as const;
    expect(second.runtime.getItemSnapshot(address)).toEqual(
      first.runtime.getItemSnapshot(address),
    );

    const operation = {
      type: 'move-item',
      metadata: { id: 1, formId: 'form' },
      collectionPath: ['rows'],
      identityProperty: 'id',
      itemId: 'a',
      placement: { kind: 'after', itemId: 'b' },
      source: 'user',
    } as const;
    expect(applyFormOperation(advanced.definition, value, operation)).toEqual(
      applyFormOperation(ordinary.definition, value, operation),
    );
  });
});
