import { describe, expect, it } from 'vitest';
import {
  applyFormOperation,
  applyOperation,
  type FormDefinition,
  type FormOperation,
} from '../src/index.js';
import { withDefaultPresentation } from './definition-fixtures.js';

const metadata = { id: 1, formId: 'form' } as const;

function definition(): FormDefinition {
  const name = {
    key: '["template",["rows"],["name"]]',
    name: 'name',
    relativePath: ['name'],
    required: true,
    label: 'Name',
    kind: 'string',
    nullable: false,
    constraints: {},
  } as const;
  return withDefaultPresentation({
    nodes: [
      {
        key: '["rows"]',
        name: 'rows',
        path: ['rows'],
        required: false,
        label: 'Rows',
        kind: 'array',
        identity: { property: 'id' },
        item: { kind: 'item-template', children: [name], fields: [name] },
      },
    ],
    fields: [],
  });
}

function base(type: FormOperation['type']) {
  return { type, metadata, source: 'user' as const };
}

function setItem(
  itemId: string,
  expected: unknown,
  value: unknown,
): FormOperation {
  return {
    ...base('set-item-value'),
    type: 'set-item-value',
    target: { collectionPath: ['rows'], itemId, relativePath: ['name'] },
    identityProperty: 'id',
    expected: { kind: 'value', value: expected },
    value,
  };
}

function move(
  itemId: string,
  placement:
    { kind: 'start' | 'end' } | { kind: 'before' | 'after'; itemId: string },
): FormOperation {
  return {
    ...base('move-item'),
    type: 'move-item',
    collectionPath: ['rows'],
    identityProperty: 'id',
    itemId,
    placement,
  };
}

describe('M10 collection operations', () => {
  it('applies an ordinary leaf operation in a mixed collection definition', () => {
    const title = {
      key: '["title"]',
      name: 'title',
      path: ['title'],
      required: false,
      label: 'Title',
      kind: 'string',
      nullable: false,
      constraints: {},
    } as const;
    const collection = definition().nodes[0]!;
    const mixed: FormDefinition = withDefaultPresentation({
      nodes: [title, collection],
      fields: [title],
    });
    const result = applyFormOperation(
      mixed,
      { title: 'Before', rows: [] },
      {
        ...base('set-value'),
        type: 'set-value',
        path: ['title'],
        expected: { kind: 'value', value: 'Before' },
        value: 'After',
      },
    );

    expect(result).toMatchObject({
      success: true,
      changed: true,
      value: { title: 'After', rows: [] },
    });
  });

  it('applies a stable leaf set after concurrent movement and preserves references off path', () => {
    const first = { id: 'a', name: 'Ada' };
    const second = { id: 'b', name: 'Bob' };
    const current = { rows: [second, first], untouched: { exact: true } };
    const result = applyFormOperation(
      definition(),
      current,
      setItem('a', 'Ada', 'Grace'),
    );

    expect(result).toMatchObject({ success: true, changed: true });
    expect(result.value).not.toBe(current);
    expect(result.value.rows).not.toBe(current.rows);
    expect(result.value.rows[0]).toBe(second);
    expect(result.value.rows[1]).toEqual({ id: 'a', name: 'Grace' });
    expect(result.value.untouched).toBe(current.untouched);
  });

  it('inserts the exact opaque item and materializes only start/end paths', () => {
    const item = Object.create(null) as { id: string; name: string };
    Object.defineProperties(item, {
      id: { value: 'a', enumerable: true },
      name: { value: 'Ada', enumerable: true },
    });
    const operation: FormOperation = {
      ...base('insert-item'),
      type: 'insert-item',
      collectionPath: ['nested', 'rows'],
      identityProperty: 'id',
      itemId: 'a',
      item,
      placement: { kind: 'end' },
    };
    const result = applyOperation({}, operation);

    expect(result).toMatchObject({ success: true, changed: true });
    expect(
      (result.value as { nested: { rows: unknown[] } }).nested.rows[0],
    ).toBe(item);
    expect(Object.isFrozen(item)).toBe(false);
  });

  it('removes by identity and moves relative to stable anchors', () => {
    const a = { id: 'a' };
    const b = { id: 'b' };
    const c = { id: 'c' };
    const moved = applyOperation(
      { rows: [a, b, c] },
      move('a', { kind: 'after', itemId: 'c' }),
    );
    expect(moved.success && moved.value.rows).toEqual([b, c, a]);

    const removed = applyOperation(moved.value, {
      ...base('remove-item'),
      type: 'remove-item',
      collectionPath: ['rows'],
      identityProperty: 'id',
      itemId: 'c',
    });
    expect(removed.success && removed.value.rows).toEqual([b, a]);
    expect(removed.success && removed.value.rows[0]).toBe(b);
  });

  it('returns the original root for already-satisfied movement', () => {
    const current = { rows: [{ id: 'a' }, { id: 'b' }] };
    const result = applyOperation(
      current,
      move('a', { kind: 'before', itemId: 'b' }),
    );
    expect(result).toEqual({
      success: true,
      value: current,
      changed: false,
      diagnostics: [],
    });
    expect(result.value).toBe(current);
  });

  it('reports malformed collection members in fixed order without invoking accessors', () => {
    let invoked = false;
    const operation = {
      ...base('move-item'),
      type: 'move-item',
      get collectionPath() {
        invoked = true;
        return ['rows'];
      },
      identityProperty: 1,
      itemId: '',
      placement: { kind: 'around' },
    };
    const result = applyOperation({}, operation as unknown as FormOperation);

    expect(invoked).toBe(false);
    expect(result.success).toBe(false);
    expect(result.diagnostics.map((entry) => entry.parameters.member)).toEqual([
      'collectionPath',
      'identityProperty',
      'itemId',
      'placement.kind',
    ]);
  });

  it('rejects identity leaf targets and self anchors as shape failures', () => {
    const identityTarget = {
      ...setItem('a', 'a', 'b'),
      target: { collectionPath: ['rows'], itemId: 'a', relativePath: ['id'] },
    } as FormOperation;
    const identityResult = applyOperation(
      { rows: [{ id: 'a' }] },
      identityTarget,
    );
    expect(identityResult.diagnostics[0]?.parameters).toMatchObject({
      reason: 'identity-target-not-editable',
      member: 'target.relativePath',
    });

    const self = applyOperation(
      { rows: [{ id: 'a' }] },
      move('a', { kind: 'before', itemId: 'a' }),
    );
    expect(self.diagnostics[0]?.parameters).toMatchObject({
      reason: 'self-anchor',
    });
  });

  it('validates the complete identity sequence before target lookup', () => {
    const duplicate = { rows: [{ id: 'a' }, { id: 'a' }] };
    const result = applyOperation(duplicate, move('missing', { kind: 'end' }));
    expect(result.diagnostics[0]).toMatchObject({
      code: 'STALE_COLLECTION_OPERATION',
      parameters: { reason: 'duplicate-identity', itemId: 'missing' },
    });
    expect(result.value).toBe(duplicate);
  });

  it('does not execute collection, slot, identity, or leaf accessors', () => {
    let invoked = false;
    const current = {
      get rows() {
        invoked = true;
        return [];
      },
    };
    const result = applyOperation(current, move('a', { kind: 'end' }));
    expect(invoked).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      code: 'UNSUPPORTED_OPERATION_PROPERTY',
    });

    const item = Object.create(null) as object;
    Object.defineProperty(item, 'id', {
      get() {
        invoked = true;
        return 'a';
      },
    });
    const identityResult = applyOperation(
      { rows: [item] },
      move('a', { kind: 'end' }),
    );
    expect(invoked).toBe(false);
    expect(identityResult.diagnostics[0]?.parameters.reason).toBe(
      'invalid-identity',
    );
  });

  it('retains leaf STALE_OPERATION with its current positional path', () => {
    const current = {
      rows: [
        { id: 'b', name: 'Bob' },
        { id: 'a', name: 'Ada' },
      ],
    };
    const result = applyOperation(current, setItem('a', 'old', 'Grace'));
    expect(result.diagnostics[0]).toMatchObject({
      code: 'STALE_OPERATION',
      dataPath: ['rows', 1, 'name'],
      parameters: { expectedKind: 'value', actualKind: 'value' },
    });
  });

  it('applies managed membership and identity checks before data traversal', () => {
    const wrongIdentity = {
      ...move('a', { kind: 'end' }),
      identityProperty: 'key',
    } as FormOperation;
    const result = applyFormOperation(
      definition(),
      {
        get rows() {
          throw new Error('must not run');
        },
      },
      wrongIdentity,
    );
    expect(result.diagnostics[0]).toMatchObject({
      code: 'INVALID_COLLECTION_OPERATION',
      parameters: { reason: 'identity-property-mismatch' },
    });

    const unmanaged = {
      ...setItem('a', 'Ada', 'Grace'),
      target: {
        collectionPath: ['rows'],
        itemId: 'a',
        relativePath: ['unknown'],
      },
    } as FormOperation;
    expect(
      applyFormOperation(definition(), { rows: [] }, unmanaged).diagnostics[0],
    ).toMatchObject({
      code: 'COLLECTION_PATH_NOT_MANAGED',
    });
  });

  it('reports collection and inserted-item compatibility without retaining values', () => {
    const collection = applyOperation({ rows: {} }, move('a', { kind: 'end' }));
    expect(collection.diagnostics[0]).toMatchObject({
      code: 'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
      parameters: { reason: 'collection-not-array', actualType: 'object' },
    });
    const inserted = applyOperation(
      { rows: [] },
      {
        ...base('insert-item'),
        type: 'insert-item',
        collectionPath: ['rows'],
        identityProperty: 'id',
        itemId: 'a',
        item: { id: 'b' },
        placement: { kind: 'end' },
      },
    );
    expect(inserted.diagnostics[0]).toMatchObject({
      code: 'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
      parameters: {
        reason: 'item-identity-mismatch',
        identityProperty: 'id',
        actualType: 'string',
      },
    });

    const missingAnchor = applyOperation(
      { rows: [] },
      {
        ...base('insert-item'),
        type: 'insert-item',
        collectionPath: ['rows'],
        identityProperty: 'id',
        itemId: 'a',
        item: null,
        placement: { kind: 'before', itemId: 'missing' },
      },
    );
    expect(missingAnchor.diagnostics[0]).toMatchObject({
      code: 'STALE_COLLECTION_OPERATION',
      parameters: { reason: 'anchor-not-found', anchorItemId: 'missing' },
    });
  });

  it('checks leaf type only after identity and expectation validation', () => {
    const operation = setItem('a', 'wrong', 42);
    const staleResult = applyFormOperation(
      definition(),
      { rows: [{ id: 'a', name: 'Ada' }] },
      operation,
    );
    expect(staleResult.diagnostics[0]?.code).toBe('STALE_OPERATION');
    const typeResult = applyFormOperation(
      definition(),
      { rows: [{ id: 'a', name: 'wrong' }] },
      operation,
    );
    expect(typeResult.diagnostics[0]).toMatchObject({
      code: 'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
      dataPath: ['rows', 0, 'name'],
      parameters: { reason: 'leaf-type', field: 'name', fieldType: 'string' },
    });
  });

  it('preserves off-path object and array descriptors', () => {
    const item = { id: 'a' };
    const rows = [item];
    const marker = Symbol('marker');
    Object.defineProperty(rows, marker, {
      value: 'exact',
      enumerable: false,
      writable: false,
      configurable: false,
    });
    const current = { rows };
    Object.defineProperty(current, 'hidden', {
      value: 42,
      enumerable: false,
      writable: false,
      configurable: false,
    });
    const result = applyOperation(current, {
      ...base('insert-item'),
      type: 'insert-item',
      collectionPath: ['rows'],
      identityProperty: 'id',
      itemId: 'b',
      item: { id: 'b' },
      placement: { kind: 'end' },
    });

    expect(result.success).toBe(true);
    expect(Object.getOwnPropertyDescriptor(result.value, 'hidden')).toEqual(
      Object.getOwnPropertyDescriptor(current, 'hidden'),
    );
    expect(
      Object.getOwnPropertyDescriptor(
        (result.value as { rows: unknown[] }).rows,
        marker,
      ),
    ).toEqual(Object.getOwnPropertyDescriptor(rows, marker));
  });
});
