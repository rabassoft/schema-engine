import { describe, expect, it } from 'vitest';
import {
  collectionIdentityDiagnostics,
  buildCollectionSnapshotShell,
  buildItemFieldSnapshots,
  buildItemSnapshot,
  firstManagedCollectionAccessor,
  inspectCollectionIdentity,
  inspectDefinedCollections,
  inspectCollectionValue,
} from '../src/internal/collection-runtime.js';
import type { ArrayNodeDefinition, FormDefinition } from '../src/index.js';
import { withDefaultPresentation } from './definition-fixtures.js';

function collection(
  path: readonly string[],
  identityProperty = 'id',
): ArrayNodeDefinition {
  return {
    kind: 'array',
    key: JSON.stringify(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    identity: { property: identityProperty },
    item: { kind: 'item-template', children: [], fields: [] },
  };
}

describe('M10 collection runtime identity inspection', () => {
  it('returns exact ordered identities and original item references', () => {
    const first = { id: 'a' };
    const second = Object.assign(Object.create(null) as object, { id: 'b' });
    const result = inspectCollectionIdentity([first, second], 'id');

    expect(result.state).toEqual({ kind: 'valid' });
    expect(result.ids).toEqual(['a', 'b']);
    expect(result.items[0]).toBe(first);
    expect(result.items[1]).toBe(second);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.ids)).toBe(true);
  });

  it('reports every independently inspectable defect in ascending order', () => {
    const values = Array<unknown>(8);
    values[1] = null;
    values[2] = {};
    values[3] = { id: 1 };
    values[4] = { id: ' ' };
    values[5] = { id: 'same' };
    values[6] = { id: 'same' };
    Object.defineProperty(values, '7', { get: () => ({ id: 'hidden' }) });

    const result = inspectCollectionIdentity(values, 'id');
    expect(result.state).toEqual({
      kind: 'invalid',
      reason: 'sparse-item',
      index: 0,
    });
    expect(result.defects).toEqual([
      { reason: 'sparse-item', index: 0 },
      { reason: 'non-object-item', index: 1 },
      { reason: 'missing-identity', index: 2 },
      { reason: 'non-string-identity', index: 3 },
      { reason: 'blank-identity', index: 4 },
      { reason: 'duplicate-identity', index: 6, firstIndex: 5 },
      { reason: 'non-object-item', index: 7 },
    ]);
  });

  it('never invokes slot or identity accessors and does not retain values', () => {
    let invoked = false;
    const item = Object.create(null) as object;
    Object.defineProperty(item, 'id', {
      get() {
        invoked = true;
        return 'a';
      },
    });
    const values = [item];
    Object.defineProperty(values, 'opaque', { value: { secret: true } });

    const result = inspectCollectionIdentity(values, 'id');
    expect(invoked).toBe(false);
    expect(result.defects).toEqual([{ reason: 'identity-accessor', index: 0 }]);
    expect(JSON.stringify(result)).not.toContain('secret');
  });

  it('preserves exact punctuation, Unicode and hostile property names', () => {
    const ids = [' a ', '__proto__', 'a/b', '\ud800'];
    const result = inspectCollectionIdentity(
      ids.map((identity) => ({ ['']: identity })),
      '',
    );
    expect(result.state).toEqual({ kind: 'valid' });
    expect(result.ids).toEqual(ids);
  });
});

describe('M10 collection value inspection', () => {
  it('distinguishes missing, blocked, incompatible and accessible arrays', () => {
    expect(inspectCollectionValue({}, ['nested', 'rows'], 'id')).toMatchObject({
      success: true,
      presence: {
        kind: 'blocked',
        reason: 'missing-ancestor',
        at: ['nested'],
      },
    });
    expect(
      inspectCollectionValue({ nested: {} }, ['nested', 'rows'], 'id'),
    ).toMatchObject({ success: true, presence: { kind: 'missing' } });
    expect(
      inspectCollectionValue({ nested: 1 }, ['nested', 'rows'], 'id'),
    ).toMatchObject({
      success: true,
      presence: {
        kind: 'blocked',
        reason: 'incompatible-ancestor',
        at: ['nested'],
      },
    });
    expect(inspectCollectionValue({ rows: 1 }, ['rows'], 'id')).toMatchObject({
      success: true,
      presence: { kind: 'incompatible', value: 1 },
    });
    expect(
      inspectCollectionValue({ rows: [{ id: 'a' }] }, ['rows'], 'id'),
    ).toMatchObject({
      success: true,
      presence: { kind: 'array' },
      identity: { state: { kind: 'valid' }, ids: ['a'] },
    });
  });

  it('returns the first accessor path without invoking it', () => {
    let invoked = false;
    const nested = Object.create(null) as object;
    Object.defineProperty(nested, 'rows', {
      get() {
        invoked = true;
        return [];
      },
    });
    const result = inspectCollectionValue({ nested }, ['nested', 'rows'], 'id');
    expect(invoked).toBe(false);
    expect(result).toEqual({
      success: false,
      accessorPath: ['nested', 'rows'],
    });
    expect(Object.isFrozen(result)).toBe(true);
  });
});

describe('M10 defined collection inspection and diagnostics', () => {
  it('walks nested definitions in depth-first definition order', () => {
    const first = collection(['group', 'first']);
    const second = collection(['second']);
    const definition: FormDefinition = withDefaultPresentation({
      nodes: [
        {
          kind: 'object',
          key: '["group"]',
          name: 'group',
          path: ['group'],
          required: false,
          label: 'group',
          children: [first],
        },
        second,
      ],
      fields: [],
    });
    const inspected = inspectDefinedCollections(
      { group: { first: [] }, second: [] },
      definition.nodes,
    );
    expect(inspected.map(({ definition: node }) => node)).toEqual([
      first,
      second,
    ]);
    expect(Object.isFrozen(inspected)).toBe(true);
  });

  it('finds editable accessors only after valid identity in positional order', () => {
    const leaf = {
      kind: 'string',
      nullable: false,
      key: '["template",["rows"],["nested","name"]]',
      name: 'name',
      relativePath: ['nested', 'name'],
      required: false,
      label: 'name',
      constraints: {},
    } as const;
    const node: ArrayNodeDefinition = {
      ...collection(['rows']),
      item: {
        kind: 'item-template',
        children: [
          {
            kind: 'object',
            key: '["template",["rows"],["nested"]]',
            name: 'nested',
            relativePath: ['nested'],
            required: false,
            label: 'nested',
            children: [leaf],
          },
        ],
        fields: [leaf],
      },
    };
    let invoked = false;
    const nested = Object.create(null) as object;
    Object.defineProperty(nested, 'name', {
      get() {
        invoked = true;
        return 'Ada';
      },
    });
    const definitions = [node];
    expect(
      firstManagedCollectionAccessor(
        { rows: [{ id: 'a', nested }] },
        definitions,
      ),
    ).toEqual(['rows', 0, 'nested', 'name']);
    expect(invoked).toBe(false);

    expect(
      firstManagedCollectionAccessor(
        { rows: [{ id: '', nested }] },
        definitions,
      ),
    ).toBeUndefined();
    expect(invoked).toBe(false);
  });

  it('emits one safe frozen diagnostic per defect in ascending order', () => {
    const node = collection(['rows'], '__proto__');
    const values = Array<unknown>(3);
    values[1] = { ['__proto__']: 1 };
    values[2] = { ['__proto__']: ' ' };
    const inspection = inspectCollectionIdentity(values, '__proto__');
    const diagnostics = collectionIdentityDiagnostics(node, inspection);

    expect(diagnostics).toEqual([
      {
        code: 'INVALID_COLLECTION_IDENTITY',
        severity: 'error',
        source: 'runtime',
        dataPath: ['rows'],
        parameters: {
          reason: 'sparse-item',
          index: 0,
          identityProperty: '__proto__',
        },
        fallbackMessage: 'Collection item identity is invalid.',
      },
      {
        code: 'INVALID_COLLECTION_IDENTITY',
        severity: 'error',
        source: 'runtime',
        dataPath: ['rows'],
        parameters: {
          reason: 'non-string-identity',
          index: 1,
          identityProperty: '__proto__',
        },
        fallbackMessage: 'Collection item identity is invalid.',
      },
      {
        code: 'INVALID_COLLECTION_IDENTITY',
        severity: 'error',
        source: 'runtime',
        dataPath: ['rows'],
        parameters: {
          reason: 'blank-identity',
          index: 2,
          identityProperty: '__proto__',
        },
        fallbackMessage: 'Collection item identity is invalid.',
      },
    ]);
    expect(Object.isFrozen(diagnostics)).toBe(true);
    expect(Object.isFrozen(diagnostics[0]?.parameters)).toBe(true);
    expect(Object.isFrozen(diagnostics[0]?.dataPath)).toBe(true);
  });
});

describe('M10 collection snapshot shell', () => {
  it('builds stable item addresses and structural dirty by identity order', () => {
    const node = collection(['rows']);
    const current = inspectCollectionValue(
      { rows: [{ id: 'b' }, { id: 'a' }] },
      ['rows'],
      'id',
    );
    const baseline = inspectCollectionValue(
      { rows: [{ id: 'a' }, { id: 'b' }] },
      ['rows'],
      'id',
    );
    const snapshot = buildCollectionSnapshotShell(node, current, baseline);
    expect(snapshot).toMatchObject({
      nodeKind: 'array',
      key: '["rows"]',
      presence: { kind: 'array' },
      identityState: { kind: 'valid' },
      dirty: true,
      valid: true,
    });
    expect(snapshot?.items.map((item) => item.address.itemId)).toEqual([
      'b',
      'a',
    ]);
    expect(snapshot?.items[1]?.dataPath).toEqual(['rows', 1]);
    expect(Object.isFrozen(snapshot?.items)).toBe(true);
  });

  it('exposes no items for invalid identity and owns reference dirty', () => {
    const node = collection(['rows']);
    const currentValue = [{ id: 'a' }, { id: 'a' }];
    const baselineValue = [{ id: 'a' }, { id: 'a' }];
    const current = inspectCollectionValue(
      { rows: currentValue },
      ['rows'],
      'id',
    );
    const baseline = inspectCollectionValue(
      { rows: baselineValue },
      ['rows'],
      'id',
    );
    const snapshot = buildCollectionSnapshotShell(node, current, baseline);
    expect(snapshot).toMatchObject({
      identityState: {
        kind: 'invalid',
        reason: 'duplicate-identity',
        index: 1,
        firstIndex: 0,
      },
      dirty: true,
      valid: false,
      items: [],
    });
  });

  it('reuses unchanged item and collection wrappers', () => {
    const node = collection(['rows']);
    const value = { rows: [{ id: 'a' }] };
    const inspected = inspectCollectionValue(value, ['rows'], 'id');
    const first = buildCollectionSnapshotShell(node, inspected, inspected);
    const second = buildCollectionSnapshotShell(
      node,
      inspected,
      inspected,
      Object.freeze([]),
      first,
    );
    expect(second).toBe(first);
    expect(second?.items[0]).toBe(first?.items[0]);
  });

  it('matches item baselines by identity and rebuilds moved positional wrappers', () => {
    const leaf = {
      kind: 'string',
      nullable: false,
      key: '["template",["rows"],["name"]]',
      name: 'name',
      relativePath: ['name'],
      required: false,
      label: 'name',
      constraints: {},
    } as const;
    const node: ArrayNodeDefinition = {
      ...collection(['rows']),
      item: { kind: 'item-template', children: [leaf], fields: [leaf] },
    };
    const baseline = inspectCollectionValue(
      {
        rows: [
          { id: 'a', name: 'Ada' },
          { id: 'b', name: 'Bob' },
        ],
      },
      ['rows'],
      'id',
    );
    const firstCurrent = inspectCollectionValue(
      {
        rows: [
          { id: 'a', name: 'Grace' },
          { id: 'b', name: 'Bob' },
        ],
      },
      ['rows'],
      'id',
    );
    const first = buildCollectionSnapshotShell(node, firstCurrent, baseline);
    expect(first).toMatchObject({
      dirty: true,
      items: [{ dirty: true }, { dirty: false }],
    });
    const moved = inspectCollectionValue(
      {
        rows: [
          { id: 'b', name: 'Bob' },
          { id: 'a', name: 'Grace' },
        ],
      },
      ['rows'],
      'id',
    );
    const second = buildCollectionSnapshotShell(
      node,
      moved,
      baseline,
      Object.freeze([]),
      first,
    );
    expect(second?.items[0]?.address.itemId).toBe('b');
    expect(second?.items[0]).not.toBe(first?.items[1]);
    expect(second?.items[1]?.fields[0]?.key).toBe(
      first?.items[0]?.fields[0]?.key,
    );
    expect(second?.items[1]?.fields[0]?.path).toEqual(['rows', 1, 'name']);
  });
});

describe('M10 item field snapshots', () => {
  it('combines stable keys with current positional paths and matched dirty', () => {
    const field = {
      kind: 'string',
      nullable: false,
      key: '["template",["rows"],["profile","name"]]',
      name: 'name',
      relativePath: ['profile', 'name'],
      required: false,
      label: 'name',
      constraints: {},
    } as const;
    const node: ArrayNodeDefinition = {
      ...collection(['rows']),
      item: { kind: 'item-template', children: [field], fields: [field] },
    };
    const key = '["item-node",["rows"],"a",["profile","name"]]';
    const snapshots = buildItemFieldSnapshots(
      node,
      { profile: { name: 'Grace' } },
      { profile: { name: 'Ada' } },
      'a',
      2,
      [
        {
          code: 'name',
          path: ['rows', 2, 'profile', 'name'],
          parameters: {},
        },
      ],
      new Set([key]),
      key,
    );
    expect(snapshots[0]).toMatchObject({
      key,
      path: ['rows', 2, 'profile', 'name'],
      presence: { kind: 'value', value: 'Grace' },
      dirty: true,
      touched: true,
      focused: true,
      valid: false,
      showIssues: true,
    });
  });

  it('does not duplicate inserted-item dirty and reports blocked descendants', () => {
    const field = {
      kind: 'string',
      nullable: false,
      key: '["template",["rows"],["profile","name"]]',
      name: 'name',
      relativePath: ['profile', 'name'],
      required: false,
      label: 'name',
      constraints: {},
    } as const;
    const node: ArrayNodeDefinition = {
      ...collection(['rows']),
      item: { kind: 'item-template', children: [field], fields: [field] },
    };
    expect(
      buildItemFieldSnapshots(node, {}, undefined, 'new', 0)[0],
    ).toMatchObject({
      presence: {
        kind: 'blocked',
        reason: 'missing-ancestor',
        at: ['rows', 0, 'profile'],
      },
      dirty: false,
    });
  });
});

describe('M10 item snapshot trees', () => {
  it('assembles object descendants and item-root/identity issues', () => {
    const leaf = {
      kind: 'string',
      nullable: false,
      key: '["template",["rows"],["profile","name"]]',
      name: 'name',
      relativePath: ['profile', 'name'],
      required: false,
      label: 'name',
      constraints: {},
    } as const;
    const object = {
      kind: 'object',
      key: '["template",["rows"],["profile"]]',
      name: 'profile',
      relativePath: ['profile'],
      required: false,
      label: 'profile',
      children: [leaf],
    } as const;
    const node: ArrayNodeDefinition = {
      ...collection(['rows']),
      item: { kind: 'item-template', children: [object], fields: [leaf] },
    };
    const issues = [
      { code: 'item', path: ['rows', 0], parameters: {} },
      { code: 'identity', path: ['rows', 0, 'id'], parameters: {} },
      {
        code: 'leaf',
        path: ['rows', 0, 'profile', 'name'],
        parameters: {},
      },
    ];
    const snapshot = buildItemSnapshot(
      node,
      { id: 'a', profile: { name: 'Grace' } },
      { id: 'a', profile: { name: 'Ada' } },
      'a',
      0,
      issues,
    );
    expect(snapshot).toMatchObject({
      dirty: true,
      valid: false,
      issues: [{ code: 'item' }, { code: 'identity' }],
      children: [
        {
          nodeKind: 'object',
          dirty: true,
          valid: false,
          children: [{ nodeKind: 'field', dirty: true, valid: false }],
        },
      ],
    });
    expect(snapshot.fields[0]).toBe(
      (snapshot.children[0] as { children: readonly unknown[] }).children[0],
    );
  });

  it('keeps inserted item descendants clean while collection owns insertion', () => {
    const leaf = {
      kind: 'string',
      nullable: false,
      key: '["template",["rows"],["name"]]',
      name: 'name',
      relativePath: ['name'],
      required: false,
      label: 'name',
      constraints: {},
    } as const;
    const node: ArrayNodeDefinition = {
      ...collection(['rows']),
      item: { kind: 'item-template', children: [leaf], fields: [leaf] },
    };
    expect(
      buildItemSnapshot(node, { id: 'new', name: 'Ada' }, undefined, 'new', 0),
    ).toMatchObject({ dirty: false, children: [{ dirty: false }] });
  });
});
