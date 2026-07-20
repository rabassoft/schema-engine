import { describe, expect, it } from 'vitest';

import {
  compileFormDefinition,
  type ArrayNodeDefinition,
} from '../src/index.js';

const DIALECT = 'https://json-schema.org/draft/2020-12/schema';

function compile(uiSchema?: unknown) {
  return compileFormDefinition({
    schema: {
      $schema: DIALECT,
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            active: { type: 'boolean' },
          },
        },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              details: {
                type: 'object',
                properties: { active: { type: 'boolean' } },
              },
            },
            required: ['id'],
          },
        },
      },
    },
    collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
    uiSchema,
  });
}

describe('recursive local presentation compilation', () => {
  it('normalizes ordinary, item-root and object-template forests with exact owner keys', () => {
    const result = compile({
      fields: {
        profile: {
          presentation: [
            {
              kind: 'section',
              id: 'profile-main',
              label: 'Profile main',
              children: ['name', 'active'],
            },
          ],
        },
        rows: {
          item: {
            presentation: [
              {
                kind: 'tabs',
                id: 'item-tabs',
                label: 'Item tabs',
                panels: [
                  {
                    kind: 'panel',
                    id: 'summary',
                    label: 'Summary',
                    children: ['name', 'details'],
                  },
                ],
              },
            ],
            fields: {
              details: {
                presentation: [
                  {
                    kind: 'grid',
                    id: 'details-grid',
                    label: 'Details grid',
                    columns: 2,
                    items: [{ span: 2, child: 'active' }],
                  },
                ],
              },
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.diagnostics).toEqual([]);
    const profile = result.definition.nodes[0];
    const rows = result.definition.nodes[1] as ArrayNodeDefinition;
    expect(profile?.kind).toBe('object');
    if (profile?.kind !== 'object') return;
    expect(profile.presentation[0]).toMatchObject({
      kind: 'section',
      key: JSON.stringify([
        'presentation',
        ['object', ['profile']],
        'section',
        'profile-main',
      ]),
    });
    expect(profile.presentation[0]?.kind).toBe('section');
    if (profile.presentation[0]?.kind === 'section') {
      expect(profile.presentation[0].children[0]).toEqual({
        kind: 'form-node',
        node: profile.children[0],
      });
    }

    const tabs = rows.item.presentation[0];
    expect(tabs).toMatchObject({
      kind: 'tabs',
      key: JSON.stringify([
        'presentation',
        ['item-template', ['rows']],
        'tabs',
        'item-tabs',
      ]),
    });
    const details = rows.item.children.find(({ name }) => name === 'details');
    expect(details?.kind).toBe('object');
    if (details?.kind !== 'object') return;
    expect(details.presentation[0]).toMatchObject({
      kind: 'grid',
      key: JSON.stringify([
        'presentation',
        ['item-template-object', ['rows'], ['details']],
        'grid',
        'details-grid',
      ]),
      items: [
        {
          key: JSON.stringify([
            'presentation',
            ['item-template-object', ['rows'], ['details']],
            'grid',
            'details-grid',
            'item',
            0,
          ]),
        },
      ],
    });
    expect(Object.isFrozen(profile.presentation)).toBe(true);
    expect(Object.isFrozen(rows.item.presentation)).toBe(true);
    expect(Object.isFrozen(details.presentation)).toBe(true);
  });

  it('defaults every absent local forest without changing the root projection', () => {
    const result = compile();

    expect(result.success).toBe(true);
    if (!result.success) return;
    const profile = result.definition.nodes[0];
    const rows = result.definition.nodes[1] as ArrayNodeDefinition;
    expect(result.definition.presentation).toEqual([
      { kind: 'form-node', node: profile },
      { kind: 'form-node', node: rows },
    ]);
    expect(profile?.kind).toBe('object');
    if (profile?.kind !== 'object') return;
    expect(profile.presentation).toEqual(
      profile.children.map((node) => ({ kind: 'form-node', node })),
    );
    expect(rows.item.presentation).toEqual(
      rows.item.children.map((node) => ({ kind: 'form-node', node })),
    );
    const details = rows.item.children.find(({ name }) => name === 'details');
    expect(details?.kind).toBe('object');
    if (details?.kind === 'object') {
      expect(details.presentation).toEqual(
        details.children.map((node) => ({ kind: 'form-node', node })),
      );
    }
  });

  it('falls back only the invalid local owner and preserves exact local diagnostic context', () => {
    const result = compile({
      fields: {
        profile: { presentation: ['missing'] },
        rows: {
          item: {
            fields: {
              details: { presentation: ['missing'] },
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.diagnostics
        .filter(({ code }) => code === 'INVALID_UI_PRESENTATION')
        .map(({ dataPath, documentPath, parameters }) => ({
          dataPath,
          documentPath,
          parameters,
        })),
    ).toEqual([
      {
        dataPath: ['profile'],
        documentPath: ['fields', 'profile', 'presentation', 0],
        parameters: {
          reason: 'unknown-node',
          node: 'missing',
          entryIndex: 0,
        },
      },
      {
        dataPath: ['profile'],
        documentPath: ['fields', 'profile', 'presentation'],
        parameters: { reason: 'missing-node', node: 'name' },
      },
      {
        dataPath: ['profile'],
        documentPath: ['fields', 'profile', 'presentation'],
        parameters: { reason: 'missing-node', node: 'active' },
      },
      {
        dataPath: ['rows'],
        documentPath: [
          'fields',
          'rows',
          'item',
          'fields',
          'details',
          'presentation',
          0,
        ],
        parameters: {
          reason: 'unknown-node',
          node: 'missing',
          entryIndex: 0,
          templatePath: ['details'],
        },
      },
      {
        dataPath: ['rows'],
        documentPath: [
          'fields',
          'rows',
          'item',
          'fields',
          'details',
          'presentation',
        ],
        parameters: {
          reason: 'missing-node',
          node: 'active',
          templatePath: ['details'],
        },
      },
    ]);
    const profile = result.definition.nodes[0];
    const rows = result.definition.nodes[1] as ArrayNodeDefinition;
    expect(profile?.kind).toBe('object');
    if (profile?.kind === 'object') {
      expect(profile.presentation).toHaveLength(profile.children.length);
    }
    const details = rows.item.children.find(({ name }) => name === 'details');
    expect(details?.kind).toBe('object');
    if (details?.kind === 'object') {
      expect(details.presentation).toHaveLength(details.children.length);
    }
  });

  it('keeps presentation unsupported on an array host', () => {
    const result = compile({
      fields: { rows: { presentation: ['name'] } },
    });

    expect(result.success).toBe(true);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_UI_PRESENTATION',
        dataPath: ['rows'],
        documentPath: ['fields', 'rows', 'presentation'],
        parameters: {
          reason: 'unsupported-location',
          member: 'presentation',
          nodeKind: 'array',
        },
      }),
    );
  });

  it('does not execute a local presentation accessor and still inspects sibling owners', () => {
    const profile = Object.create(null) as Record<string, unknown>;
    let calls = 0;
    Object.defineProperty(profile, 'presentation', {
      enumerable: true,
      get() {
        calls += 1;
        return ['name', 'active'];
      },
    });
    const result = compile({
      fields: {
        profile,
        rows: { item: { presentation: ['name', 'details'] } },
      },
    });

    expect(calls).toBe(0);
    expect(result.success).toBe(true);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_UI_PRESENTATION',
        dataPath: ['profile'],
        documentPath: ['fields', 'profile', 'presentation'],
        parameters: {
          reason: 'presentation-accessor',
          expected: 'dense array',
        },
      }),
    );
    if (!result.success) return;
    const rows = result.definition.nodes[1];
    expect(rows?.kind).toBe('array');
    if (rows?.kind === 'array') {
      expect(rows.item.presentation).toHaveLength(2);
    }
  });
});
