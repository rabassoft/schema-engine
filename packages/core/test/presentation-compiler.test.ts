import { describe, expect, it, vi } from 'vitest';
import { compileFormDefinition, type Diagnostic } from '../src/index.js';

const dialect = 'https://json-schema.org/draft/2020-12/schema';
const schema = {
  $schema: dialect,
  type: 'object',
  properties: { a: { type: 'string' }, b: { type: 'boolean' } },
} as const;

function compile(uiSchema: unknown, inputSchema: unknown = schema) {
  return compileFormDefinition({ schema: inputSchema, uiSchema });
}

function presentationDiagnostics(result: {
  readonly diagnostics: readonly Diagnostic[];
}) {
  return result.diagnostics.filter(
    ({ code }) => code === 'INVALID_UI_PRESENTATION',
  );
}

describe('root UI presentation compilation', () => {
  it('normalizes nested sections with exact node identity and no raw retention', () => {
    const rawChildren = ['b'] as unknown[];
    const rawSection = {
      kind: 'section',
      id: 'main',
      label: 'Main',
      children: rawChildren,
      extension: { opaque: true },
    };
    const result = compile({ presentation: [rawSection, 'a'] });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.diagnostics).toMatchObject([
      {
        code: 'UNKNOWN_UI_SCHEMA_KEY',
        documentPath: ['presentation', 0, 'extension'],
      },
    ]);
    const [section, presentedA] = result.definition.presentation;
    expect(section).toMatchObject({
      kind: 'section',
      id: 'main',
      key: '["section","main"]',
      label: 'Main',
    });
    if (section?.kind !== 'section' || presentedA?.kind !== 'form-node') return;
    expect(section).not.toBe(rawSection);
    expect(section.children).not.toBe(rawChildren);
    expect(section.children[0]?.kind).toBe('form-node');
    if (section.children[0]?.kind === 'form-node') {
      expect(section.children[0].node).toBe(result.definition.nodes[1]);
    }
    expect(presentedA.node).toBe(result.definition.nodes[0]);
    expect(Object.isFrozen(section)).toBe(true);
    expect(Object.isFrozen(section.children)).toBe(true);
  });

  it.each([
    {
      reason: 'presentation-not-array',
      ui: { presentation: null },
      path: ['presentation'],
      parameters: { expected: 'dense array', actualType: 'null' },
    },
    {
      reason: 'order-conflict',
      ui: { order: ['b', 'a'], presentation: ['a', 'b'] },
      path: ['presentation'],
      parameters: { member: 'order', expected: 'one root ordering authority' },
    },
    {
      reason: 'invalid-entry',
      ui: { presentation: [1, 'a', 'b'] },
      path: ['presentation', 0],
      parameters: {
        entryIndex: 0,
        expected: 'root node name or presentation container object',
        actualType: 'number',
      },
    },
    {
      reason: 'unknown-node',
      ui: { presentation: ['unknown', 'a', 'b'] },
      path: ['presentation', 0],
      parameters: { entryIndex: 0, node: 'unknown' },
    },
    {
      reason: 'duplicate-node',
      ui: { presentation: ['a', 'a', 'b'] },
      path: ['presentation', 1],
      parameters: {
        entryIndex: 1,
        node: 'a',
        firstDocumentPath: ['presentation', 0],
      },
    },
    {
      reason: 'missing-node',
      ui: { presentation: ['a'] },
      path: ['presentation'],
      parameters: { node: 'b' },
    },
    {
      reason: 'section-member-missing',
      ui: { presentation: [{ id: 'x', label: 'X', children: ['a', 'b'] }] },
      path: ['presentation', 0, 'kind'],
      parameters: { member: 'kind', expected: 'section' },
    },
    {
      reason: 'section-member-invalid',
      ui: {
        presentation: [
          { kind: 'section', id: 1, label: 'X', children: ['a', 'b'] },
        ],
      },
      path: ['presentation', 0, 'id'],
      parameters: {
        member: 'id',
        expected: 'non-empty string',
        actualType: 'number',
      },
    },
    {
      reason: 'section-member-blank',
      ui: {
        presentation: [
          { kind: 'section', id: 'x', label: '  ', children: ['a', 'b'] },
        ],
      },
      path: ['presentation', 0, 'label'],
      parameters: { member: 'label', expected: 'non-blank string' },
    },
    {
      reason: 'duplicate-section-id',
      ui: {
        presentation: [
          { kind: 'section', id: 'x', label: 'X', children: ['a'] },
          { kind: 'section', id: 'x', label: 'Again', children: ['b'] },
        ],
      },
      path: ['presentation', 1, 'id'],
      parameters: {
        sectionId: 'x',
        firstDocumentPath: ['presentation', 0, 'id'],
      },
    },
    {
      reason: 'empty-section',
      ui: {
        presentation: [
          { kind: 'section', id: 'x', label: 'X', children: [] },
          'a',
          'b',
        ],
      },
      path: ['presentation', 0, 'children'],
      parameters: {
        sectionId: 'x',
        expected: 'non-empty dense children array',
      },
    },
  ] as const)(
    'emits $reason with exact parameters and atomically falls back',
    ({ ui, reason, path, parameters }) => {
      const result = compile(ui);

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(presentationDiagnostics(result)).toContainEqual(
        expect.objectContaining({
          code: 'INVALID_UI_PRESENTATION',
          severity: 'warning',
          source: 'ui-schema',
          documentPath: path,
          parameters: { reason, ...parameters },
          fallbackMessage: 'UI presentation is invalid.',
        }),
      );
      expect(
        result.definition.presentation.map((entry) =>
          entry.kind === 'form-node' ? entry.node : undefined,
        ),
      ).toEqual(result.definition.nodes);
      const diagnostic = presentationDiagnostics(result)[0];
      if (diagnostic !== undefined) {
        expect(Object.isFrozen(diagnostic)).toBe(true);
        expect(Object.isFrozen(diagnostic.documentPath)).toBe(true);
        expect(Object.isFrozen(diagnostic.parameters)).toBe(true);
      }
    },
  );

  it('keeps order effective when presentation conflicts', () => {
    const result = compile({ order: ['b', 'a'], presentation: ['a', 'b'] });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.definition.nodes.map(({ name }) => name)).toEqual(['b', 'a']);
    expect(
      result.definition.presentation.map((entry) =>
        entry.kind === 'form-node' ? entry.node.name : undefined,
      ),
    ).toEqual(['b', 'a']);
  });

  it('inspects accessors, sparse arrays, cycles and reuse without executing code', () => {
    const getter = vi.fn();
    const rootAccessor = Object.defineProperty({}, 'presentation', {
      enumerable: true,
      get: getter,
    });
    const accessorEntries = ['a', 'b'];
    Object.defineProperty(accessorEntries, 0, {
      enumerable: true,
      get: getter,
    });
    const sparseEntries: unknown[] = ['a'];
    sparseEntries.length = 3;
    sparseEntries[2] = 'b';
    const memberAccessor = Object.defineProperty(
      { kind: 'section', id: 'x', label: 'X' },
      'children',
      { enumerable: true, get: getter },
    );
    const cyclic = {
      kind: 'section',
      id: 'cycle',
      label: 'Cycle',
      children: [] as unknown[],
    };
    cyclic.children.push(cyclic, 'a', 'b');
    const reused = {
      kind: 'section',
      id: 'same',
      label: 'Same',
      children: ['a'],
    };

    expect(presentationDiagnostics(compile(rootAccessor))).toMatchObject([
      {
        parameters: {
          reason: 'presentation-accessor',
          expected: 'dense array',
        },
      },
    ]);
    expect(
      presentationDiagnostics(compile({ presentation: accessorEntries })),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parameters: { reason: 'entry-accessor', entryIndex: 0 },
        }),
      ]),
    );
    expect(
      presentationDiagnostics(compile({ presentation: sparseEntries })),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parameters: { reason: 'sparse-entry', entryIndex: 1 },
        }),
      ]),
    );
    expect(
      presentationDiagnostics(
        compile({ presentation: [memberAccessor, 'a', 'b'] }),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parameters: {
            reason: 'section-member-accessor',
            member: 'children',
            expected: 'non-empty dense array',
          },
        }),
      ]),
    );
    expect(
      presentationDiagnostics(compile({ presentation: [cyclic] })),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          documentPath: ['presentation', 0, 'children', 0],
          parameters: {
            reason: 'cyclic-presentation',
            firstDocumentPath: ['presentation', 0],
          },
        }),
      ]),
    );
    expect(
      presentationDiagnostics(
        compile({ presentation: [reused, reused, 'b'] }),
      ).some(({ parameters }) => parameters.reason === 'duplicate-section-id'),
    ).toBe(true);
    expect(getter).not.toHaveBeenCalled();
  });

  it('handles deeply finite forests iteratively and preserves hostile names and IDs', () => {
    let entry: unknown = 'a';
    for (let depth = 0; depth < 1_500; depth += 1) {
      entry = {
        kind: 'section',
        id: `s${depth}`,
        label: `Section ${depth}`,
        children: [entry],
      };
    }
    const deep = compile({ presentation: [entry, 'b'] });
    expect(deep.success).toBe(true);
    expect(presentationDiagnostics(deep)).toEqual([]);

    const hostileSchema = JSON.parse(
      `{"$schema":"${dialect}","type":"object","properties":{"__proto__":{"type":"string"},"a.b":{"type":"string"}," ":{"type":"string"},"\\ud800":{"type":"string"}}}`,
    ) as unknown;
    const hostile = compile(
      {
        presentation: [
          {
            kind: 'section',
            id: '__proto__. \ud800',
            label: 'Hostile',
            children: ['__proto__', 'a.b', ' ', '\ud800'],
          },
        ],
      },
      hostileSchema,
    );
    expect(hostile.success).toBe(true);
    expect(presentationDiagnostics(hostile)).toEqual([]);
  });

  it('rejects presentation at object, array and item UI locations with exact paths', () => {
    const nestedSchema = {
      $schema: dialect,
      type: 'object',
      properties: {
        group: {
          type: 'object',
          properties: { value: { type: 'string' } },
        },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              value: { type: 'string' },
            },
            required: ['id'],
          },
        },
      },
    };
    const result = compileFormDefinition({
      schema: nestedSchema,
      collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
      uiSchema: {
        presentation: ['rows', 'group'],
        fields: {
          group: { presentation: [] },
          rows: { presentation: [], item: { presentation: [] } },
        },
      },
    });

    expect(presentationDiagnostics(result)).toMatchObject([
      {
        dataPath: ['group'],
        documentPath: ['fields', 'group', 'presentation'],
        parameters: {
          reason: 'unsupported-location',
          member: 'presentation',
          nodeKind: 'object',
        },
      },
      {
        dataPath: ['rows'],
        documentPath: ['fields', 'rows', 'presentation'],
        parameters: {
          reason: 'unsupported-location',
          member: 'presentation',
          nodeKind: 'array',
        },
      },
      {
        dataPath: ['rows'],
        documentPath: ['fields', 'rows', 'item', 'presentation'],
        parameters: {
          reason: 'unsupported-location',
          member: 'presentation',
          nodeKind: 'item',
        },
      },
    ]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.definition.presentation.map((entry) =>
        entry.kind === 'form-node' ? entry.node.name : undefined,
      ),
    ).toEqual(['rows', 'group']);
    expect(result.definition.presentation[0]?.kind).toBe('form-node');
    if (result.definition.presentation[0]?.kind === 'form-node') {
      expect(result.definition.presentation[0].node).toBe(
        result.definition.nodes[1],
      );
      expect(result.definition.presentation[0].node.kind).toBe('array');
    }
  });
});
