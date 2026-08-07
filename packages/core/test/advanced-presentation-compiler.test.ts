import { describe, expect, it, vi } from 'vitest';
import { compileFormDefinition, type Diagnostic } from '../src/index.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';
const schema = {
  $schema: dialect,
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'boolean' },
    c: { type: 'number' },
    d: { type: 'integer' },
  },
} as const;

function compile(uiSchema: unknown) {
  return compileFormDefinition({ schema, uiSchema });
}

function diagnostics(result: { readonly diagnostics: readonly Diagnostic[] }) {
  return result.diagnostics.filter(
    ({ code }) => code === 'INVALID_UI_PRESENTATION',
  );
}

function panel(children: readonly unknown[] = ['a', 'b', 'c', 'd']) {
  return { kind: 'panel', id: 'panel', label: 'Panel', children };
}

function withRemaining(entry: unknown) {
  return { presentation: [entry, 'a', 'b', 'c', 'd'] };
}

describe('advanced presentation normalization', () => {
  it('normalizes every accepted kind recursively with exact keys, identity and freezing', () => {
    const raw = {
      kind: 'tabs',
      id: 'root-tabs',
      label: 'Root tabs',
      panels: [
        {
          kind: 'panel',
          id: 'details',
          label: 'Details',
          children: [
            'a',
            {
              kind: 'grid',
              id: 'details-grid',
              label: 'Details grid',
              columns: 2,
              items: [
                { span: 2, child: 'b' },
                {
                  child: {
                    kind: 'section',
                    id: 'nested-section',
                    label: 'Nested section',
                    children: ['c'],
                  },
                },
              ],
            },
          ],
        },
        {
          kind: 'panel',
          id: 'more',
          label: 'More',
          children: [
            {
              kind: 'accordion',
              id: 'nested-accordion',
              label: 'Nested accordion',
              panels: [
                {
                  kind: 'panel',
                  id: 'only',
                  label: 'Only',
                  children: ['d'],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = compile({ presentation: [raw] });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(diagnostics(result)).toEqual([]);
    const tabs = result.definition.presentation[0];
    expect(tabs).toMatchObject({
      kind: 'tabs',
      id: 'root-tabs',
      key: '["tabs","root-tabs"]',
    });
    if (tabs?.kind !== 'tabs') return;
    expect(tabs).not.toBe(raw);
    expect(tabs.panels[0]?.key).toBe('["tabs","root-tabs","panel","details"]');
    const grid = tabs.panels[0]?.children[1];
    expect(grid).toMatchObject({
      kind: 'grid',
      key: '["grid","details-grid"]',
      columns: 2,
    });
    if (grid?.kind !== 'grid') return;
    expect(grid.items.map(({ key, span }) => ({ key, span }))).toEqual([
      { key: '["grid","details-grid","item",0]', span: 2 },
      { key: '["grid","details-grid","item",1]', span: 1 },
    ]);
    expect(grid.items[0]?.child.kind).toBe('form-node');
    if (grid.items[0]?.child.kind === 'form-node') {
      expect(grid.items[0].child.node).toBe(result.definition.nodes[1]);
    }
    const accordion = tabs.panels[1]?.children[0];
    expect(accordion?.kind).toBe('accordion');
    if (accordion?.kind === 'accordion') {
      expect(accordion.panels[0]?.key).toBe(
        '["accordion","nested-accordion","panel","only"]',
      );
    }
    expect(Object.isFrozen(tabs.panels)).toBe(true);
    expect(Object.isFrozen(grid.items)).toBe(true);
    expect(
      Object.getOwnPropertyDescriptor(grid.items[0]!, 'child'),
    ).toMatchObject({ enumerable: true, writable: false });
  });

  it('preserves hostile exact IDs without coercion or prototype collisions', () => {
    const id = '__proto__. ' + String.fromCharCode(0xd800);
    const result = compile({
      presentation: [
        {
          kind: 'grid',
          id,
          label: 'Hostile',
          columns: 4,
          items: [
            {
              span: 4,
              child: {
                kind: 'tabs',
                id: ' tabs ',
                label: 'Tabs',
                panels: [
                  {
                    kind: 'panel',
                    id: 'p.' + String.fromCharCode(0xd800),
                    label: 'Panel',
                    children: ['a', 'b', 'c', 'd'],
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(diagnostics(result)).toEqual([]);
    expect(result.definition.presentation[0]).toMatchObject({
      id,
      key: JSON.stringify(['grid', id]),
    });
  });
});

type DiagnosticCase = {
  readonly reason: string;
  readonly ui: unknown;
  readonly path: readonly (string | number)[];
  readonly parameters: Readonly<Record<string, unknown>>;
};

const diagnosticCases: readonly DiagnosticCase[] = [
  {
    reason: 'wizard-not-sole-root',
    ui: withRemaining({ kind: 'wizard' }),
    path: ['presentation'],
    parameters: {
      ownerKind: 'wizard',
      index: 0,
    },
  },
  {
    reason: 'container-member-missing',
    ui: { presentation: [{ kind: 'tabs', label: 'Tabs', panels: [panel()] }] },
    path: ['presentation', 0, 'id'],
    parameters: {
      containerKind: 'tabs',
      member: 'id',
      expected: 'non-empty string',
    },
  },
  {
    reason: 'container-member-invalid',
    ui: withRemaining({
      kind: 'grid',
      id: 'grid',
      label: 'Grid',
      columns: 5,
      items: [],
    }),
    path: ['presentation', 0, 'columns'],
    parameters: {
      containerKind: 'grid',
      member: 'columns',
      expected: 'integer from 1 through 4',
      actualType: 'number',
    },
  },
  {
    reason: 'container-member-blank',
    ui: {
      presentation: [
        { kind: 'tabs', id: 'tabs', label: ' ', panels: [panel()] },
      ],
    },
    path: ['presentation', 0, 'label'],
    parameters: {
      containerKind: 'tabs',
      member: 'label',
      expected: 'non-blank string',
    },
  },
  {
    reason: 'duplicate-container-id',
    ui: {
      presentation: [
        { kind: 'section', id: 'same', label: 'Section', children: ['a'] },
        {
          kind: 'tabs',
          id: 'same',
          label: 'Tabs',
          panels: [panel(['b', 'c', 'd'])],
        },
      ],
    },
    path: ['presentation', 1, 'id'],
    parameters: {
      containerKind: 'tabs',
      containerId: 'same',
      firstDocumentPath: ['presentation', 0, 'id'],
    },
  },
  {
    reason: 'empty-panels',
    ui: withRemaining({ kind: 'tabs', id: 'tabs', label: 'Tabs', panels: [] }),
    path: ['presentation', 0, 'panels'],
    parameters: {
      containerKind: 'tabs',
      containerId: 'tabs',
      expected: 'non-empty dense panels array',
    },
  },
  {
    reason: 'panel-not-object',
    ui: withRemaining({ kind: 'tabs', id: 'tabs', label: 'Tabs', panels: [1] }),
    path: ['presentation', 0, 'panels', 0],
    parameters: {
      containerKind: 'tabs',
      panelIndex: 0,
      expected: 'panel object',
      actualType: 'number',
    },
  },
  {
    reason: 'panel-member-missing',
    ui: {
      presentation: [
        {
          kind: 'tabs',
          id: 'tabs',
          label: 'Tabs',
          panels: [{ id: 'p', label: 'Panel', children: ['a', 'b', 'c', 'd'] }],
        },
      ],
    },
    path: ['presentation', 0, 'panels', 0, 'kind'],
    parameters: {
      containerKind: 'tabs',
      panelIndex: 0,
      member: 'kind',
      expected: 'panel',
    },
  },
  {
    reason: 'panel-member-invalid',
    ui: {
      presentation: [
        {
          kind: 'accordion',
          id: 'accordion',
          label: 'Accordion',
          panels: [
            {
              kind: 'panel',
              id: 1,
              label: 'Panel',
              children: ['a', 'b', 'c', 'd'],
            },
          ],
        },
      ],
    },
    path: ['presentation', 0, 'panels', 0, 'id'],
    parameters: {
      containerKind: 'accordion',
      panelIndex: 0,
      member: 'id',
      expected: 'non-empty string',
      actualType: 'number',
    },
  },
  {
    reason: 'panel-member-blank',
    ui: {
      presentation: [
        {
          kind: 'tabs',
          id: 'tabs',
          label: 'Tabs',
          panels: [
            {
              kind: 'panel',
              id: 'p',
              label: ' ',
              children: ['a', 'b', 'c', 'd'],
            },
          ],
        },
      ],
    },
    path: ['presentation', 0, 'panels', 0, 'label'],
    parameters: {
      containerKind: 'tabs',
      panelIndex: 0,
      member: 'label',
      expected: 'non-blank string',
    },
  },
  {
    reason: 'duplicate-panel-id',
    ui: {
      presentation: [
        {
          kind: 'tabs',
          id: 'tabs',
          label: 'Tabs',
          panels: [panel(['a']), { ...panel(['b', 'c', 'd']), label: 'Again' }],
        },
      ],
    },
    path: ['presentation', 0, 'panels', 1, 'id'],
    parameters: {
      containerKind: 'tabs',
      containerId: 'tabs',
      panelId: 'panel',
      firstDocumentPath: ['presentation', 0, 'panels', 0, 'id'],
    },
  },
  {
    reason: 'empty-panel',
    ui: withRemaining({
      kind: 'accordion',
      id: 'accordion',
      label: 'Accordion',
      panels: [panel([])],
    }),
    path: ['presentation', 0, 'panels', 0, 'children'],
    parameters: {
      containerKind: 'accordion',
      panelId: 'panel',
      expected: 'non-empty dense children array',
    },
  },
  {
    reason: 'empty-grid',
    ui: withRemaining({
      kind: 'grid',
      id: 'grid',
      label: 'Grid',
      columns: 2,
      items: [],
    }),
    path: ['presentation', 0, 'items'],
    parameters: {
      containerId: 'grid',
      expected: 'non-empty dense items array',
    },
  },
  {
    reason: 'grid-item-not-object',
    ui: withRemaining({
      kind: 'grid',
      id: 'grid',
      label: 'Grid',
      columns: 2,
      items: [1],
    }),
    path: ['presentation', 0, 'items', 0],
    parameters: {
      itemIndex: 0,
      expected: 'grid item object',
      actualType: 'number',
    },
  },
  {
    reason: 'grid-item-member-missing',
    ui: withRemaining({
      kind: 'grid',
      id: 'grid',
      label: 'Grid',
      columns: 2,
      items: [{}],
    }),
    path: ['presentation', 0, 'items', 0, 'child'],
    parameters: {
      itemIndex: 0,
      member: 'child',
      expected: 'presentation entry',
    },
  },
  {
    reason: 'grid-item-member-invalid',
    ui: withRemaining({
      kind: 'grid',
      id: 'grid',
      label: 'Grid',
      columns: 2,
      items: [{ child: 1 }],
    }),
    path: ['presentation', 0, 'items', 0, 'child'],
    parameters: {
      itemIndex: 0,
      member: 'child',
      expected: 'presentation entry',
      actualType: 'number',
    },
  },
  {
    reason: 'grid-item-member-invalid',
    ui: {
      presentation: [
        {
          kind: 'grid',
          id: 'grid',
          label: 'Grid',
          columns: 2,
          items: [
            { span: 0, child: 'a' },
            { child: 'b' },
            { child: 'c' },
            { child: 'd' },
          ],
        },
      ],
    },
    path: ['presentation', 0, 'items', 0, 'span'],
    parameters: {
      itemIndex: 0,
      member: 'span',
      expected: 'integer from 1 through 4',
      actualType: 'number',
    },
  },
  {
    reason: 'grid-span-exceeds-columns',
    ui: {
      presentation: [
        {
          kind: 'grid',
          id: 'grid',
          label: 'Grid',
          columns: 2,
          items: [
            { span: 3, child: 'a' },
            { child: 'b' },
            { child: 'c' },
            { child: 'd' },
          ],
        },
      ],
    },
    path: ['presentation', 0, 'items', 0, 'span'],
    parameters: {
      itemIndex: 0,
      span: 3,
      columns: 2,
      expected: 'integer not greater than grid columns',
    },
  },
];

describe('advanced presentation diagnostics and fallback', () => {
  it.each(diagnosticCases)(
    'emits $reason with exact path and parameters',
    ({ reason, ui, path, parameters }) => {
      const result = compile(ui);

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(diagnostics(result)).toContainEqual(
        expect.objectContaining({
          severity: 'warning',
          source: 'ui-schema',
          documentPath: path,
          parameters: { reason, ...parameters },
          fallbackMessage: 'UI presentation is invalid.',
        }),
      );
      expect(
        result.definition.presentation.map((entry) =>
          entry.kind === 'form-node' ? entry.node.name : undefined,
        ),
      ).toEqual(['a', 'b', 'c', 'd']);
    },
  );

  it('uses the later section reason in the global container namespace', () => {
    const result = compile({
      presentation: [
        {
          kind: 'grid',
          id: 'same',
          label: 'Grid',
          columns: 1,
          items: [{ child: 'a' }],
        },
        {
          kind: 'section',
          id: 'same',
          label: 'Section',
          children: ['b', 'c', 'd'],
        },
      ],
    });
    expect(diagnostics(result)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 1, 'id'],
        parameters: {
          reason: 'duplicate-section-id',
          sectionId: 'same',
          firstDocumentPath: ['presentation', 0, 'id'],
        },
      }),
    );
  });

  it('keeps safe unknown-key warnings while atomically discarding the authored forest', () => {
    const result = compile({
      presentation: [
        {
          kind: 'grid',
          id: 'grid',
          label: 'Grid',
          columns: 1,
          items: [{ span: 2, child: 7, extension: true }],
          extension: true,
        },
        'a',
        'b',
        'c',
        'd',
      ],
    });
    expect(
      result.diagnostics.map(({ code, documentPath, parameters }) => ({
        code,
        documentPath,
        reason: parameters.reason,
      })),
    ).toEqual([
      {
        code: 'UNKNOWN_UI_SCHEMA_KEY',
        documentPath: ['presentation', 0, 'extension'],
        reason: undefined,
      },
      {
        code: 'INVALID_UI_PRESENTATION',
        documentPath: ['presentation', 0, 'items', 0, 'span'],
        reason: 'grid-span-exceeds-columns',
      },
      {
        code: 'INVALID_UI_PRESENTATION',
        documentPath: ['presentation', 0, 'items', 0, 'child'],
        reason: 'grid-item-member-invalid',
      },
      {
        code: 'UNKNOWN_UI_SCHEMA_KEY',
        documentPath: ['presentation', 0, 'items', 0, 'extension'],
        reason: undefined,
      },
    ]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.presentation).toHaveLength(4);
  });

  it('applies empty-array and grid-child precedence without duplicate reasons', () => {
    const empty = compile(
      withRemaining({ kind: 'tabs', id: 'tabs', label: 'Tabs', panels: [] }),
    );
    expect(
      diagnostics(empty)
        .filter(({ documentPath }) => documentPath?.includes('panels'))
        .map(({ documentPath, parameters }) => ({
          documentPath,
          reason: parameters.reason,
        })),
    ).toEqual([
      {
        documentPath: ['presentation', 0, 'panels'],
        reason: 'empty-panels',
      },
    ]);

    const child = compile(
      withRemaining({
        kind: 'grid',
        id: 'grid',
        label: 'Grid',
        columns: 2,
        items: [{ child: 'missing' }],
      }),
    );
    expect(
      diagnostics(child)
        .filter(({ documentPath }) => documentPath?.includes('child'))
        .map(({ documentPath, parameters }) => ({
          documentPath,
          reason: parameters.reason,
        })),
    ).toEqual([
      {
        documentPath: ['presentation', 0, 'items', 0, 'child'],
        reason: 'unknown-node',
      },
    ]);
  });
});

describe('advanced presentation hostile structures', () => {
  it('does not invoke container, panel or item accessors', () => {
    const getter = vi.fn();
    const tabs = Object.defineProperty(
      { kind: 'tabs', id: 'tabs', panels: [panel()] },
      'label',
      { enumerable: true, get: getter },
    );
    const panels: unknown[] = [panel()];
    Object.defineProperty(panels, 0, { enumerable: true, get: getter });
    const panelMember = Object.defineProperty(
      { kind: 'panel', id: 'panel', label: 'Panel' },
      'children',
      { enumerable: true, get: getter },
    );
    const items: unknown[] = [{ child: 'a' }];
    Object.defineProperty(items, 0, { enumerable: true, get: getter });
    const item = Object.defineProperty({}, 'child', {
      enumerable: true,
      get: getter,
    });
    const spanItem = Object.defineProperty({ child: 'a' }, 'span', {
      enumerable: true,
      get: getter,
    });

    const results = [
      compile({ presentation: [tabs] }),
      compile(
        withRemaining({ kind: 'tabs', id: 'tabs', label: 'Tabs', panels }),
      ),
      compile(
        withRemaining({
          kind: 'tabs',
          id: 'tabs',
          label: 'Tabs',
          panels: [panelMember],
        }),
      ),
      compile(
        withRemaining({
          kind: 'grid',
          id: 'grid',
          label: 'Grid',
          columns: 1,
          items,
        }),
      ),
      compile(
        withRemaining({
          kind: 'grid',
          id: 'grid',
          label: 'Grid',
          columns: 1,
          items: [item],
        }),
      ),
      compile(
        withRemaining({
          kind: 'grid',
          id: 'grid',
          label: 'Grid',
          columns: 1,
          items: [spanItem],
        }),
      ),
    ];
    expect(
      results.flatMap(diagnostics).map(({ parameters }) => parameters.reason),
    ).toEqual(
      expect.arrayContaining([
        'container-member-accessor',
        'panel-accessor',
        'panel-member-accessor',
        'grid-item-accessor',
        'grid-item-member-accessor',
      ]),
    );
    expect(diagnostics(results[0]!)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'label'],
        parameters: {
          reason: 'container-member-accessor',
          containerKind: 'tabs',
          member: 'label',
          expected: 'non-blank string',
        },
      }),
    );
    expect(diagnostics(results[1]!)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'panels', 0],
        parameters: {
          reason: 'panel-accessor',
          containerKind: 'tabs',
          panelIndex: 0,
        },
      }),
    );
    expect(diagnostics(results[2]!)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'panels', 0, 'children'],
        parameters: {
          reason: 'panel-member-accessor',
          containerKind: 'tabs',
          panelIndex: 0,
          member: 'children',
          expected: 'non-empty dense children array',
        },
      }),
    );
    expect(diagnostics(results[3]!)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'items', 0],
        parameters: { reason: 'grid-item-accessor', itemIndex: 0 },
      }),
    );
    expect(diagnostics(results[4]!)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'items', 0, 'child'],
        parameters: {
          reason: 'grid-item-member-accessor',
          itemIndex: 0,
          member: 'child',
          expected: 'presentation entry',
        },
      }),
    );
    expect(diagnostics(results[5]!)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'items', 0, 'span'],
        parameters: {
          reason: 'grid-item-member-accessor',
          itemIndex: 0,
          member: 'span',
          expected: 'integer from 1 through 4',
        },
      }),
    );
    expect(getter).not.toHaveBeenCalled();
  });

  it('reports sparse panels/items and active cycles through every wrapper', () => {
    const panels: unknown[] = [];
    panels.length = 2;
    panels[1] = panel();
    const items: unknown[] = [];
    items.length = 2;
    items[1] = { child: 'a' };
    const cyclicPanel = {
      kind: 'panel',
      id: 'cycle',
      label: 'Cycle',
      children: [] as unknown[],
    };
    cyclicPanel.children.push(cyclicPanel);
    const cyclicItem = { child: undefined as unknown };
    cyclicItem.child = cyclicItem;

    const sparsePanel = compile(
      withRemaining({ kind: 'tabs', id: 'tabs', label: 'Tabs', panels }),
    );
    const sparseItem = compile(
      withRemaining({
        kind: 'grid',
        id: 'grid',
        label: 'Grid',
        columns: 1,
        items,
      }),
    );
    const panelCycle = compile({
      presentation: [
        { kind: 'tabs', id: 'tabs', label: 'Tabs', panels: [cyclicPanel] },
      ],
    });
    const itemCycle = compile({
      presentation: [
        {
          kind: 'grid',
          id: 'grid',
          label: 'Grid',
          columns: 1,
          items: [cyclicItem],
        },
      ],
    });

    expect(
      diagnostics(sparsePanel).map(({ parameters }) => parameters.reason),
    ).toContain('sparse-panel');
    expect(
      diagnostics(sparseItem).map(({ parameters }) => parameters.reason),
    ).toContain('sparse-grid-item');
    expect(diagnostics(sparsePanel)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'panels', 0],
        parameters: {
          reason: 'sparse-panel',
          containerKind: 'tabs',
          panelIndex: 0,
        },
      }),
    );
    expect(diagnostics(sparseItem)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'items', 0],
        parameters: { reason: 'sparse-grid-item', itemIndex: 0 },
      }),
    );
    expect(diagnostics(panelCycle)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'panels', 0, 'children', 0],
        parameters: {
          reason: 'cyclic-presentation',
          firstDocumentPath: ['presentation', 0, 'panels', 0],
        },
      }),
    );
    expect(diagnostics(itemCycle)).toContainEqual(
      expect.objectContaining({
        documentPath: ['presentation', 0, 'items', 0, 'child'],
        parameters: {
          reason: 'cyclic-presentation',
          firstDocumentPath: ['presentation', 0, 'items', 0],
        },
      }),
    );
  });

  it('distinguishes reuse from cycles and handles deeply mixed forests iteratively', () => {
    const reused = {
      kind: 'grid',
      id: 'reused',
      label: 'Reused',
      columns: 1,
      items: [{ child: 'a' }],
    };
    const reusedResult = compile({
      presentation: [reused, reused, 'b', 'c', 'd'],
    });
    expect(
      diagnostics(reusedResult).map(({ parameters }) => parameters.reason),
    ).not.toContain('cyclic-presentation');
    expect(
      diagnostics(reusedResult).map(({ parameters }) => parameters.reason),
    ).toContain('duplicate-container-id');

    let entry: unknown = 'a';
    for (let depth = 0; depth < 1_500; depth += 1) {
      entry =
        depth % 2 === 0
          ? {
              kind: 'grid',
              id: 'grid-' + depth,
              label: 'Grid ' + depth,
              columns: 1,
              items: [{ child: entry }],
            }
          : {
              kind: 'tabs',
              id: 'tabs-' + depth,
              label: 'Tabs ' + depth,
              panels: [
                { kind: 'panel', id: 'only', label: 'Only', children: [entry] },
              ],
            };
    }
    const deep = compile({ presentation: [entry, 'b', 'c', 'd'] });
    expect(deep.success).toBe(true);
    expect(diagnostics(deep)).toEqual([]);
  });
});
