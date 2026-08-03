import { describe, expect, it, vi } from 'vitest';
import * as publicCore from '../src/index.js';
import type {
  ArrayNodeDefinition,
  FieldDefinition,
  FieldTemplate,
  FormDefinition,
  FormNodeDefinition,
  FormNodeTemplate,
  ObjectFieldDefinition,
  ObjectNodeTemplate,
} from '../src/index.js';
import {
  prepareScopeBaselineConfirmation,
  type ScopeBaselinePreparation,
} from '../src/internal/scope-baseline.js';
import { canonicalDataPathKey } from '../src/internal/path.js';
import {
  withDefaultNodePresentation,
  withDefaultPresentation,
} from './definition-fixtures.js';

function leaf(path: readonly string[]): FieldDefinition {
  return {
    kind: 'string',
    nullable: false,
    key: canonicalDataPathKey(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    constraints: {},
  };
}

function objectNode(
  path: readonly string[],
  children: readonly FormNodeDefinition[],
): ObjectFieldDefinition {
  return withDefaultNodePresentation({
    kind: 'object',
    key: canonicalDataPathKey(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    children,
  });
}

function templateLeaf(
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

function templateObject(
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

function collection(path: readonly string[]): ArrayNodeDefinition {
  const title = templateLeaf(path, ['title']);
  const code = templateLeaf(path, ['details', 'code']);
  const details = templateObject(path, ['details'], [code]);
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
      children: [title, details],
      fields: [title, code],
      presentation: [title, details].map((node) => ({
        kind: 'form-node' as const,
        node,
      })),
    },
  };
}

function definition(): FormDefinition {
  const name = leaf(['profile', 'name']);
  const rows = collection(['profile', 'rows']);
  const profile = objectNode(['profile'], [name, rows]);
  const note = leaf(['note']);
  return withDefaultPresentation({
    nodes: [profile, note],
    fields: [name, note],
  });
}

function validRoots() {
  return {
    baseline: {
      profile: {
        name: 'Ada',
        rows: [
          { id: 'a', title: 'A', details: { code: 'one' } },
          { id: 'b', title: 'B', details: { code: 'two' } },
        ],
      },
      note: 'baseline',
    },
    current: {
      profile: {
        name: 'Grace',
        rows: [
          { id: 'b', title: 'Bee', details: { code: 'two' } },
          { id: 'a', title: 'A', details: { code: 'changed' } },
        ],
      },
      note: 'current',
    },
  };
}

function prepare(
  paths: readonly unknown[],
  roots: {
    baseline: Record<string, unknown>;
    current: Record<string, unknown>;
  } = validRoots(),
  candidateDefinition = definition(),
) {
  return prepareScopeBaselineConfirmation(
    candidateDefinition,
    roots.baseline,
    roots.current,
    { id: 'scope', paths } as never,
  );
}

function failure<TData extends object>(
  result: ScopeBaselinePreparation<TData>,
) {
  expect(result.success).toBe(false);
  if (result.success) throw new Error('expected failure');
  return result.result;
}

describe('scope-to-baseline Internal foundation', () => {
  it('returns a frozen empty preparation without retaining scope state', () => {
    expect(typeof publicCore.commitScopeToBaseline).toBe('function');
    const roots = validRoots();
    const result = prepareScopeBaselineConfirmation(
      definition(),
      roots.baseline,
      roots.current,
      { id: 'empty', paths: [], includeGlobalIssues: true },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.baselineValue).toBe(roots.baseline);
    expect(result.currentValue).toBe(roots.current);
    expect(result.targets).toEqual([]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.targets)).toBe(true);
  });

  it('returns exact frozen definition defects before inspecting either root', () => {
    const getter = vi.fn();
    const root = {};
    Object.defineProperty(root, 'profile', { get: getter });
    const invalid = withDefaultPresentation({
      nodes: [leaf(['orphan'])],
      fields: [],
    }) as FormDefinition;
    const result = prepareScopeBaselineConfirmation(invalid, root, root, {
      id: 'scope',
      paths: [],
    });
    const failed = failure(result);

    expect(failed.diagnostics[0]).toMatchObject({
      code: 'INVALID_FORM_DEFINITION',
      severity: 'error',
      source: 'runtime',
      fallbackMessage: 'Form definition is invalid.',
    });
    expect(getter).not.toHaveBeenCalled();
    expect(failed.value).toBe(root);
    expect(failed.changed).toBe(false);
    expect(Object.isFrozen(failed)).toBe(true);
    expect(Object.isFrozen(failed.diagnostics)).toBe(true);
    expect(Object.isFrozen(failed.diagnostics[0])).toBe(true);
    expect(Object.isFrozen(failed.diagnostics[0]?.parameters)).toBe(true);
  });

  it('inspects baseline before current and never invokes managed accessors', () => {
    const baselineGetter = vi.fn();
    const currentDescriptor = vi.fn();
    const baseline = {};
    Object.defineProperty(baseline, 'profile', { get: baselineGetter });
    const current = new Proxy(
      {},
      {
        getOwnPropertyDescriptor(target, property) {
          currentDescriptor(property);
          return Reflect.getOwnPropertyDescriptor(target, property);
        },
      },
    );
    const result = prepareScopeBaselineConfirmation(
      definition(),
      baseline,
      current,
      { id: 'scope', paths: [] },
    );
    const failed = failure(result);

    expect(failed.diagnostics).toEqual([
      {
        code: 'INVALID_BASELINE_CONFIRMATION',
        severity: 'error',
        source: 'runtime',
        dataPath: ['profile'],
        parameters: {
          member: 'baselineValue',
          expected: 'ordinary data tree at managed paths',
          reason: 'accessor-member',
          propertyReason: 'accessor',
        },
        fallbackMessage: 'Baseline confirmation input is invalid.',
      },
    ]);
    expect(baselineGetter).not.toHaveBeenCalled();
    expect(currentDescriptor).not.toHaveBeenCalled();
    expect(Object.isFrozen(failed.diagnostics[0]?.dataPath)).toBe(true);
  });

  it('normalizes invalid roots and hostile nested reflection without leaking values', () => {
    const invalid = prepareScopeBaselineConfirmation(
      definition(),
      null as never,
      {},
      { id: 'scope', paths: [] },
    );
    expect(failure(invalid).diagnostics[0]).toMatchObject({
      code: 'INVALID_BASELINE_CONFIRMATION',
      parameters: {
        member: 'baselineValue',
        reason: 'invalid-value',
        actualType: 'null',
        actualValue: null,
      },
    });

    const hostile = new Proxy(
      {},
      {
        getPrototypeOf() {
          throw new Error('secret');
        },
      },
    );
    const reflected = prepareScopeBaselineConfirmation<Record<string, unknown>>(
      definition(),
      { profile: hostile },
      {},
      { id: 'scope', paths: [] },
    );
    const diagnostic = failure(reflected).diagnostics[0];
    expect(diagnostic).toMatchObject({
      code: 'INVALID_BASELINE_CONFIRMATION',
      parameters: {
        member: 'baselineValue',
        reason: 'inspection-failed',
      },
    });
    expect(JSON.stringify(diagnostic)).not.toContain('secret');
  });

  it('accepts null-prototype roots and follows aliased paths independently', () => {
    const shared = Object.assign(Object.create(null) as object, {
      name: 'Ada',
      rows: [],
    });
    const baseline = Object.assign(Object.create(null) as object, {
      profile: shared,
      note: 'same',
    });
    const current = Object.assign(Object.create(null) as object, {
      profile: shared,
      note: 'same',
    });
    const result = prepareScopeBaselineConfirmation(
      definition(),
      baseline,
      current,
      { id: 'scope', paths: [] },
    );
    expect(result.success).toBe(true);
  });

  it('reads caller array lengths and members only through descriptors', () => {
    const getTrap = vi.fn(() => {
      throw new Error('array get trap must not run');
    });
    const proxiedRows = new Proxy([{ id: 'a' }, { id: 'b' }], {
      get: getTrap,
    });
    const proxiedPath = new Proxy(['profile', 'rows'], { get: getTrap });
    const proxiedPaths = new Proxy([proxiedPath], { get: getTrap });
    const roots = validRoots();
    const result = prepareScopeBaselineConfirmation(
      definition(),
      {
        ...roots.baseline,
        profile: { ...roots.baseline.profile, rows: proxiedRows },
      },
      roots.current,
      { id: 'scope', paths: proxiedPaths },
    );

    expect(result.success).toBe(true);
    expect(getTrap).not.toHaveBeenCalled();
  });

  it('normalizes throwing array descriptor traps at their owning stage', () => {
    const hostileRows = new Proxy([], {
      getOwnPropertyDescriptor() {
        throw new Error('hidden root trap');
      },
    });
    const roots = validRoots();
    const rootFailure = prepareScopeBaselineConfirmation(
      definition(),
      {
        ...roots.baseline,
        profile: { ...roots.baseline.profile, rows: hostileRows },
      },
      roots.current,
      { id: 'scope', paths: [] },
    );
    expect(failure(rootFailure).diagnostics[0]).toMatchObject({
      code: 'INVALID_BASELINE_CONFIRMATION',
      parameters: { member: 'baselineValue', reason: 'inspection-failed' },
    });

    const hostilePaths = new Proxy([], {
      getOwnPropertyDescriptor() {
        throw new Error('hidden scope trap');
      },
    });
    const scopeFailure = prepareScopeBaselineConfirmation(
      definition(),
      roots.baseline,
      roots.current,
      { id: 'scope', paths: hostilePaths },
    );
    expect(failure(scopeFailure).diagnostics[0]).toMatchObject({
      code: 'INVALID_BASELINE_CONFIRMATION',
      parameters: { member: 'scope', reason: 'inspection-failed' },
    });
  });

  it.each([
    [null, undefined, 'invalid-value'],
    [{}, 'id', 'missing-member'],
    [{ id: 'scope' }, 'paths', 'missing-member'],
    [{ id: 'scope', paths: 'no' }, 'paths', 'invalid-value'],
    [
      { id: 'scope', paths: [], includeGlobalIssues: 'no' },
      'includeGlobalIssues',
      'invalid-value',
    ],
  ] as const)(
    'rejects malformed scope exterior %#',
    (scope, scopeMember, reason) => {
      const roots = validRoots();
      const result = prepareScopeBaselineConfirmation(
        definition(),
        roots.baseline,
        roots.current,
        scope as never,
      );
      expect(failure(result).diagnostics[0]).toMatchObject({
        code: 'INVALID_BASELINE_CONFIRMATION',
        parameters: {
          member: 'scope',
          ...(scopeMember === undefined ? {} : { scopeMember }),
          reason,
        },
      });
    },
  );

  it('rejects scope accessors without invoking them', () => {
    const getter = vi.fn();
    const scope = { paths: [] };
    Object.defineProperty(scope, 'id', { get: getter });
    const roots = validRoots();
    const result = prepareScopeBaselineConfirmation(
      definition(),
      roots.baseline,
      roots.current,
      scope as never,
    );
    expect(failure(result).diagnostics[0]).toMatchObject({
      parameters: { scopeMember: 'id', reason: 'accessor-member' },
    });
    expect(getter).not.toHaveBeenCalled();
  });

  it.each([
    [Array(1), 'invalid-target', undefined],
    [[[]], 'root-path', undefined],
    [[['profile', 0]], 'numeric-path', ['profile']],
    [[['unknown']], 'path-not-managed', ['unknown']],
    [
      [{ collectionPath: ['profile', 'rows'], itemId: '' }],
      'invalid-target',
      undefined,
    ],
    [
      [
        {
          collectionPath: ['profile', 'rows'],
          itemId: 'a',
          relativePath: ['id'],
        },
      ],
      'identity-target-not-editable',
      ['profile', 'rows'],
    ],
    [
      [
        {
          collectionPath: ['profile', 'rows'],
          itemId: 'a',
          relativePath: ['unknown'],
        },
      ],
      'node-not-managed',
      ['profile', 'rows'],
    ],
  ] as const)('normalizes malformed target %#', (paths, reason, dataPath) => {
    const failed = failure(prepare(paths));
    expect(failed.diagnostics[0]).toMatchObject({
      code: 'UNCONFIRMABLE_SCOPE_TARGET',
      parameters: { scopeId: 'scope', targetIndex: 0, reason },
      ...(dataPath === undefined ? {} : { dataPath }),
    });
  });

  it('completes target parsing before reporting earlier availability', () => {
    const result = prepare([
      { collectionPath: ['profile', 'rows'], itemId: 'missing' },
      7,
    ]);
    expect(failure(result).diagnostics[0]).toMatchObject({
      parameters: { targetIndex: 1, reason: 'invalid-target' },
    });
  });

  it('reports stable availability in caller order and distinguishes ancestors', () => {
    const missingItem = prepare([
      { collectionPath: ['profile', 'rows'], itemId: 'missing' },
      { collectionPath: ['profile', 'rows'], itemId: 'other' },
    ]);
    expect(failure(missingItem).diagnostics[0]).toMatchObject({
      parameters: {
        targetIndex: 0,
        reason: 'item-missing',
        side: 'baseline',
        itemId: 'missing',
      },
    });

    const blocked = prepare(
      [{ collectionPath: ['profile', 'rows'], itemId: 'a' }],
      { baseline: { profile: 1 }, current: validRoots().current },
    );
    expect(failure(blocked).diagnostics[0]).toMatchObject({
      dataPath: ['profile'],
      parameters: {
        reason: 'ancestor-incompatible',
        side: 'baseline',
        path: ['profile'],
      },
    });

    const unavailable = prepare(
      [{ collectionPath: ['profile', 'rows'], itemId: 'a' }],
      { baseline: { profile: {} }, current: validRoots().current },
    );
    expect(failure(unavailable).diagnostics[0]).toMatchObject({
      dataPath: ['profile', 'rows'],
      parameters: {
        reason: 'collection-unavailable',
        side: 'baseline',
        presence: 'missing',
      },
    });

    const incompatible = prepare(
      [{ collectionPath: ['profile', 'rows'], itemId: 'a' }],
      {
        baseline: { profile: { rows: 1 } },
        current: validRoots().current,
      },
    );
    expect(failure(incompatible).diagnostics[0]).toMatchObject({
      dataPath: ['profile', 'rows'],
      parameters: {
        reason: 'collection-unavailable',
        side: 'baseline',
        presence: 'incompatible',
      },
    });

    const staticBlocked = prepare([['profile', 'name']], {
      baseline: { profile: 1 },
      current: validRoots().current,
    });
    expect(failure(staticBlocked).diagnostics[0]).toMatchObject({
      dataPath: ['profile'],
      parameters: {
        reason: 'ancestor-incompatible',
        side: 'baseline',
        path: ['profile'],
      },
    });
  });

  it.each([
    [Array(1), 'sparse-item', 0],
    [[null], 'non-object-item', 0],
    [[{}], 'missing-identity', 0],
    [[{ id: 1 }], 'non-string-identity', 0],
    [[{ id: ' ' }], 'blank-identity', 0],
    [[{ id: 'a' }, { id: 'a' }], 'duplicate-identity', 1],
  ] as const)(
    'reports static invalid identity without invented stable fields %#',
    (rows, identityReason, identityIndex) => {
      const roots = validRoots();
      const result = prepare([['profile']], {
        baseline: {
          ...roots.baseline,
          profile: { ...roots.baseline.profile, rows },
        },
        current: roots.current,
      });
      const diagnostic = failure(result).diagnostics[0];
      expect(diagnostic).toMatchObject({
        dataPath: ['profile', 'rows'],
        parameters: {
          reason: 'invalid-identity',
          side: 'baseline',
          identityReason,
          identityIndex,
          collectionPath: ['profile', 'rows'],
        },
      });
      expect(Object.hasOwn(diagnostic?.parameters ?? {}, 'itemId')).toBe(false);
      expect(Object.hasOwn(diagnostic?.parameters ?? {}, 'relativePath')).toBe(
        false,
      );
      if (identityReason === 'duplicate-identity') {
        expect(diagnostic?.parameters.firstIdentityIndex).toBe(0);
      }
    },
  );

  it('reports identity accessors without invoking them and retains stable fields', () => {
    const getter = vi.fn();
    const item = {};
    Object.defineProperty(item, 'id', { get: getter });
    const roots = validRoots();
    const result = prepare(
      [
        {
          collectionPath: ['profile', 'rows'],
          itemId: 'a',
          relativePath: ['title'],
        },
      ],
      {
        baseline: {
          ...roots.baseline,
          profile: { ...roots.baseline.profile, rows: [item] },
        },
        current: roots.current,
      },
    );
    expect(failure(result).diagnostics[0]).toMatchObject({
      parameters: {
        reason: 'invalid-identity',
        identityReason: 'identity-accessor',
        collectionPath: ['profile', 'rows'],
        itemId: 'a',
        relativePath: ['title'],
      },
    });
    expect(getter).not.toHaveBeenCalled();
  });

  it('rejects a narrower target below an incompatible item ancestor', () => {
    const roots = validRoots();
    const baseline = {
      ...roots.baseline,
      profile: {
        ...roots.baseline.profile,
        rows: [{ id: 'a', details: 1 }, roots.baseline.profile.rows[1]],
      },
    };
    const result = prepare(
      [
        {
          collectionPath: ['profile', 'rows'],
          itemId: 'a',
          relativePath: ['details', 'code'],
        },
      ],
      { baseline, current: roots.current },
    );
    expect(failure(result).diagnostics[0]).toMatchObject({
      dataPath: ['profile', 'rows', 0, 'details'],
      parameters: {
        reason: 'ancestor-incompatible',
        side: 'baseline',
        path: ['profile', 'rows', 0, 'details'],
      },
    });
  });

  it('copies inputs and canonicalizes duplicates and broad overlaps', () => {
    const duplicate = ['profile', 'name'];
    const paths: unknown[] = [
      duplicate,
      ['note'],
      ['profile', 'name'],
      {
        collectionPath: ['profile', 'rows'],
        itemId: 'a',
        relativePath: ['details', 'code'],
      },
      {
        collectionPath: ['profile', 'rows'],
        itemId: 'a',
        relativePath: ['details'],
      },
      { collectionPath: ['profile', 'rows'], itemId: 'a' },
      ['profile'],
    ];
    const result = prepare(paths);
    expect(result.success).toBe(true);
    if (!result.success) return;
    duplicate[0] = 'mutated';
    paths.length = 0;
    expect(result.targets).toHaveLength(2);
    expect(result.targets[0]).toMatchObject({
      kind: 'static',
      targetIndex: 6,
      path: ['profile'],
    });
    expect(result.targets[1]).toMatchObject({
      kind: 'static',
      targetIndex: 1,
      path: ['note'],
    });
    expect(Object.isFrozen(result.targets[0])).toBe(true);
    expect(
      Object.isFrozen(
        result.targets[0]?.kind === 'static' ? result.targets[0].path : [],
      ),
    ).toBe(true);
  });

  it('retains the first exact duplicate and sorts independent stable targets by baseline order', () => {
    const result = prepare([
      { collectionPath: ['profile', 'rows'], itemId: 'a' },
      { collectionPath: ['profile', 'rows'], itemId: 'a' },
      { collectionPath: ['profile', 'rows'], itemId: 'b' },
    ]);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.targets.map((target) => target.targetIndex)).toEqual([0, 2]);
  });

  it('treats empty relative paths as item aliases and object nodes as broad targets', () => {
    const itemAliases = prepare([
      {
        collectionPath: ['profile', 'rows'],
        itemId: 'a',
        relativePath: [],
      },
      { collectionPath: ['profile', 'rows'], itemId: 'a' },
    ]);
    expect(itemAliases.success).toBe(true);
    if (!itemAliases.success) return;
    expect(itemAliases.targets).toHaveLength(1);
    expect(itemAliases.targets[0]).toMatchObject({
      kind: 'item',
      targetIndex: 0,
    });

    const objectOverlap = prepare([
      {
        collectionPath: ['profile', 'rows'],
        itemId: 'a',
        relativePath: ['details', 'code'],
      },
      {
        collectionPath: ['profile', 'rows'],
        itemId: 'a',
        relativePath: ['details'],
      },
    ]);
    expect(objectOverlap.success).toBe(true);
    if (!objectOverlap.success) return;
    expect(objectOverlap.targets).toHaveLength(1);
    expect(objectOverlap.targets[0]).toMatchObject({
      kind: 'node',
      targetIndex: 1,
      relativePath: ['details'],
    });
  });

  it('handles deep definitions and cyclic managed data without recursion', () => {
    const depth = 1_200;
    const terminal = leaf([
      ...Array.from({ length: depth }, (_, index) => `n${index}`),
      'value',
    ]);
    let node: FormNodeDefinition = terminal;
    for (let index = depth - 1; index >= 0; index -= 1) {
      node = objectNode(
        Array.from({ length: index + 1 }, (_, part) => `n${part}`),
        [node],
      );
    }
    const deepDefinition = withDefaultPresentation({
      nodes: [node],
      fields: [terminal],
    });
    const root: Record<string, unknown> = {};
    let cursor = root;
    for (let index = 0; index < depth; index += 1) {
      const child: Record<string, unknown> = {};
      cursor[`n${index}`] = child;
      cursor = child;
    }
    cursor.value = 'same';
    cursor.cycle = root;

    const result = prepareScopeBaselineConfirmation(
      deepDefinition,
      root,
      root,
      { id: 'deep', paths: [] },
    );
    expect(result.success).toBe(true);
  });
});
