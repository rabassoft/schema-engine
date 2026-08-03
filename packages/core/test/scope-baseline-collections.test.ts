import { describe, expect, it } from 'vitest';
import type {
  ArrayNodeDefinition,
  FieldTemplate,
  FormDefinition,
  FormNodeTemplate,
  ObjectFieldDefinition,
  ObjectNodeTemplate,
} from '../src/index.js';
import { commitScopeToBaseline } from '../src/index.js';
import { canonicalDataPathKey } from '../src/internal/path.js';
import {
  withDefaultNodePresentation,
  withDefaultPresentation,
} from './definition-fixtures.js';

function leaf(
  collectionPath: readonly string[],
  relativePath: readonly string[],
): FieldTemplate {
  return {
    kind: 'string',
    nullable: false,
    key: JSON.stringify(['template', collectionPath, relativePath]),
    name: relativePath.at(-1) ?? '',
    relativePath,
    required: false,
    label: relativePath.at(-1) ?? '',
    constraints: {},
  };
}

function objectTemplate(
  collectionPath: readonly string[],
  relativePath: readonly string[],
  children: readonly FormNodeTemplate[],
): ObjectNodeTemplate {
  return withDefaultNodePresentation({
    kind: 'object',
    key: JSON.stringify(['template', collectionPath, relativePath]),
    name: relativePath.at(-1) ?? '',
    relativePath,
    required: false,
    label: relativePath.at(-1) ?? '',
    children,
  });
}

function rows(path: readonly string[] = ['rows']): ArrayNodeDefinition {
  const name = leaf(path, ['name']);
  const city = leaf(path, ['details', 'city']);
  const details = objectTemplate(path, ['details'], [city]);
  return {
    kind: 'array',
    key: canonicalDataPathKey(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    identity: { property: 'id' },
    item: {
      kind: 'item-template',
      children: [name, details],
      fields: [name, city],
      presentation: [name, details].map((node) => ({
        kind: 'form-node' as const,
        node,
      })),
    },
  };
}

function definition(): FormDefinition {
  const collection = rows();
  return withDefaultPresentation({ nodes: [collection], fields: [] });
}

function commit(
  baselineValue: Record<string, unknown>,
  currentValue: Record<string, unknown>,
  paths: readonly unknown[] = [['rows']],
  candidateDefinition = definition(),
) {
  return commitScopeToBaseline(
    candidateDefinition,
    baselineValue,
    currentValue,
    { id: 'scope', paths } as never,
  );
}

describe('scope-to-baseline whole collection reconstruction', () => {
  it('matches by identity, applies exact current order and projects new items', () => {
    const removed = { id: 'removed', name: 'Old', details: { city: 'Rome' } };
    const a = {
      id: 'a',
      name: 'Ada',
      details: { city: 'London', unmanaged: 'baseline-detail' },
      unmanaged: 'baseline-item',
    };
    const b = { id: 'b', name: 'Bob', details: { city: 'Paris' } };
    const baseline = { rows: [a, b, removed], off: { exact: true } };
    const currentOnly = {
      id: 'new',
      name: 'New',
      details: { city: 'Berlin', unmanaged: 'omit' },
      unmanaged: 'omit',
    };
    const result = commit(baseline, {
      rows: [
        { id: 'b', name: 'Bobby', details: { city: 'Paris' } },
        { id: 'a', name: 'Ada', details: { city: 'Madrid' } },
        currentOnly,
      ],
    });

    expect(result.success && result.changed).toBe(true);
    const candidate = result.value.rows as Array<Record<string, unknown>>;
    expect(candidate.map((item) => item.id)).toEqual(['b', 'a', 'new']);
    expect(candidate[0]).toMatchObject({ id: 'b', name: 'Bobby' });
    expect(candidate[1]).toMatchObject({
      id: 'a',
      name: 'Ada',
      unmanaged: 'baseline-item',
      details: { city: 'Madrid', unmanaged: 'baseline-detail' },
    });
    expect(candidate[2]).toEqual({
      id: 'new',
      name: 'New',
      details: { city: 'Berlin' },
    });
    expect(Object.hasOwn(candidate[2] as object, 'unmanaged')).toBe(false);
    expect(result.value.off).toBe(baseline.off);
  });

  it('preserves matched index descriptors while moving identities and array metadata', () => {
    const symbol = Symbol('metadata');
    const a = { id: 'a', name: 'A' };
    const b = { id: 'b', name: 'B' };
    const baselineRows = [a, b];
    Object.defineProperty(baselineRows, '0', {
      value: a,
      writable: false,
      enumerable: true,
      configurable: false,
    });
    Object.defineProperty(baselineRows, 'hidden', {
      value: { exact: true },
      enumerable: false,
      writable: false,
      configurable: false,
    });
    Object.defineProperty(baselineRows, symbol, {
      value: 'symbol',
      enumerable: false,
    });
    const result = commit(
      { rows: baselineRows },
      {
        rows: [
          { id: 'b', name: 'B' },
          { id: 'a', name: 'A' },
        ],
      },
    );
    const candidate = result.value.rows as unknown[];
    expect(candidate[0]).toBe(b);
    expect(candidate[1]).toBe(a);
    expect(Object.getOwnPropertyDescriptor(candidate, '1')).toMatchObject({
      writable: false,
      enumerable: true,
      configurable: false,
    });
    expect(Object.getOwnPropertyDescriptor(candidate, 'hidden')).toEqual(
      Object.getOwnPropertyDescriptor(baselineRows, 'hidden'),
    );
    expect(Object.getOwnPropertyDescriptor(candidate, symbol)).toEqual(
      Object.getOwnPropertyDescriptor(baselineRows, symbol),
    );
  });

  it('returns the exact baseline for equal managed identity/order/content', () => {
    const first = {
      id: 'a',
      name: 'A',
      details: { city: 'Paris' },
      private: 1,
    };
    const second = { id: 'b', name: 'B' };
    const baseline = { rows: [first, second] };
    const result = commit(baseline, {
      rows: [
        { id: 'a', name: 'A', details: { city: 'Paris' }, private: 2 },
        { id: 'b', name: 'B', currentOnly: true },
      ],
    });
    expect(result.success && result.changed).toBe(false);
    expect(result.value).toBe(baseline);
    expect(result.value.rows).toBe(baseline.rows);
  });

  it('handles missing, incompatible and empty collection targets', () => {
    const currentArray = [{ id: 'a', name: 'A', unmanaged: 'omit' }];
    const fromMissing = commit({}, { rows: currentArray });
    expect(fromMissing.value).toEqual({ rows: [{ id: 'a', name: 'A' }] });

    const fromIncompatible = commit({ rows: 1 }, { rows: currentArray });
    expect(fromIncompatible.value).toEqual({ rows: [{ id: 'a', name: 'A' }] });

    const borrowed: unknown[] = [];
    const toIncompatible = commit({ rows: currentArray }, { rows: 7 });
    expect(toIncompatible.value.rows).toBe(7);
    const removed = commit({ rows: currentArray }, {});
    expect(Object.hasOwn(removed.value, 'rows')).toBe(false);
    const empty = commit({ rows: currentArray }, { rows: borrowed });
    expect(empty.value.rows).toEqual([]);
  });

  it('reuses collection logic under a selected object target', () => {
    const collection = rows(['group', 'rows']);
    const group: ObjectFieldDefinition = {
      kind: 'object',
      key: '["group"]',
      name: 'group',
      path: ['group'],
      required: false,
      label: 'Group',
      children: [collection],
      presentation: [{ kind: 'form-node', node: collection }],
    };
    const nested = withDefaultPresentation({
      nodes: [group],
      fields: [],
    }) satisfies FormDefinition;
    const result = commit(
      { group: { rows: [{ id: 'a', name: 'A' }], unmanaged: 'keep' } },
      { group: { rows: [{ id: 'b', name: 'B' }], unmanaged: 'omit' } },
      [['group']],
      nested,
    );
    expect(result.value).toEqual({
      group: { rows: [{ id: 'b', name: 'B' }], unmanaged: 'keep' },
    });
  });
});

describe('scope-to-baseline stable partial reconstruction', () => {
  it('confirms one item by identity without adopting current order', () => {
    const a = { id: 'a', name: 'A', details: { city: 'London' } };
    const b = { id: 'b', name: 'B', details: { city: 'Paris' } };
    const baselineRows = [a, b];
    Object.defineProperty(baselineRows, 'metadata', { value: 'keep' });
    const result = commit(
      { rows: baselineRows, off: { exact: true } },
      {
        rows: [
          { id: 'b', name: 'Bee', details: { city: 'Berlin' } },
          { id: 'a', name: 'Current A', details: { city: 'Madrid' } },
        ],
      },
      [{ collectionPath: ['rows'], itemId: 'b' }],
    );
    expect(result.success && result.changed).toBe(true);
    const candidate = result.value.rows as Array<Record<string, unknown>>;
    expect(candidate.map((item) => item.id)).toEqual(['a', 'b']);
    expect(candidate[0]).toBe(a);
    expect(candidate[1]).toMatchObject({
      id: 'b',
      name: 'Bee',
      details: { city: 'Berlin' },
    });
    expect((candidate as unknown as { metadata: string }).metadata).toBe(
      'keep',
    );
    expect(result.value.off).toEqual({ exact: true });
  });

  it('confirms only one nested node and preserves the identity descriptor', () => {
    const identityGetter = () => 'a';
    const item = { name: 'Baseline', details: { city: 'London', keep: true } };
    Object.defineProperty(item, 'id', {
      get: identityGetter,
      enumerable: true,
      configurable: false,
    });
    const baseline = { rows: [item] };
    const result = commit(
      baseline,
      {
        rows: [
          {
            id: 'a',
            name: 'Current',
            details: { city: 'Madrid', keep: false },
          },
        ],
      },
      [
        {
          collectionPath: ['rows'],
          itemId: 'a',
          relativePath: ['details', 'city'],
        },
      ],
    );
    // Identity accessors are deliberately invalid during preflight.
    expect(result.success).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      parameters: {
        reason: 'invalid-identity',
        identityReason: 'identity-accessor',
      },
    });

    const ordinary = {
      id: 'a',
      name: 'Baseline',
      details: { city: 'London', keep: true },
    };
    Object.defineProperty(ordinary, 'id', {
      value: 'a',
      writable: false,
      enumerable: true,
      configurable: false,
    });
    const confirmed = commit(
      { rows: [ordinary] },
      {
        rows: [
          {
            id: 'a',
            name: 'Current',
            details: { city: 'Madrid', keep: false },
          },
        ],
      },
      [
        {
          collectionPath: ['rows'],
          itemId: 'a',
          relativePath: ['details', 'city'],
        },
      ],
    );
    const candidate = (
      confirmed.value.rows as Array<Record<string, unknown>>
    )[0]!;
    expect(candidate).toMatchObject({
      id: 'a',
      name: 'Baseline',
      details: { city: 'Madrid', keep: true },
    });
    expect(Object.getOwnPropertyDescriptor(candidate, 'id')).toEqual(
      Object.getOwnPropertyDescriptor(ordinary, 'id'),
    );
  });

  it('treats stable managed equality as no-effect despite movement and unmanaged data', () => {
    const a = { id: 'a', name: 'A', private: 'baseline' };
    const b = { id: 'b', name: 'B' };
    const baseline = { rows: [a, b] };
    const result = commit(
      baseline,
      {
        rows: [
          { id: 'b', name: 'B' },
          { id: 'a', name: 'A', private: 'current' },
        ],
      },
      [{ collectionPath: ['rows'], itemId: 'a', relativePath: [] }],
    );
    expect(result.success && result.changed).toBe(false);
    expect(result.value).toBe(baseline);
    expect(result.value.rows).toBe(baseline.rows);
  });

  it('merges independent stable node targets while retaining untouched items', () => {
    const a = { id: 'a', name: 'A', details: { city: 'London' } };
    const b = { id: 'b', name: 'B', details: { city: 'Paris' } };
    const result = commit(
      { rows: [a, b] },
      {
        rows: [
          { id: 'a', name: 'AA', details: { city: 'Madrid' } },
          { id: 'b', name: 'BB', details: { city: 'Berlin' } },
        ],
      },
      [
        { collectionPath: ['rows'], itemId: 'a', relativePath: ['name'] },
        {
          collectionPath: ['rows'],
          itemId: 'b',
          relativePath: ['details', 'city'],
        },
      ],
    );
    expect(result.value).toEqual({
      rows: [
        { id: 'a', name: 'AA', details: { city: 'London' } },
        { id: 'b', name: 'B', details: { city: 'Berlin' } },
      ],
    });
  });
});
