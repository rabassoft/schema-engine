import { describe, expect, it, vi } from 'vitest';
import {
  createControlledFormRuntime,
  type ArrayNodeDefinition,
  type FormDefinition,
  type FormNodeTemplate,
  type FormOperation,
} from '../src/index.js';
import { withDefaultPresentation } from './definition-fixtures.js';

function definition(): FormDefinition {
  const name = {
    kind: 'string',
    nullable: false,
    key: '["template",["rows"],["name"]]',
    name: 'name',
    relativePath: ['name'],
    required: false,
    label: 'Name',
    constraints: {},
  } as const;
  const rows: ArrayNodeDefinition = {
    kind: 'array',
    key: '["rows"]',
    name: 'rows',
    path: ['rows'],
    required: false,
    label: 'Rows',
    identity: { property: 'id' },
    item: {
      kind: 'item-template',
      children: [name],
      fields: [name],
      presentation: [{ kind: 'form-node', node: name }],
    },
  };
  return withDefaultPresentation({ nodes: [rows], fields: [] });
}

function create(value: object, baselineValue: object = value) {
  return createControlledFormRuntime({
    formId: 'form',
    definition: definition(),
    schema: {},
    value,
    baselineValue,
    locale: 'en',
    validator: { validate: () => ({ valid: true, issues: [] }) },
  });
}

function deepDefinition(depth: number): FormDefinition {
  const objectNames = Array.from({ length: depth }, (_, index) => `n${index}`);
  const leafPath = [...objectNames, 'value'];
  const leaf = {
    kind: 'string',
    nullable: false,
    key: JSON.stringify(['template', ['rows'], leafPath]),
    name: 'value',
    relativePath: leafPath,
    required: false,
    label: 'Value',
    constraints: {},
  } as const;
  let child: FormNodeTemplate = leaf;
  for (let index = depth - 1; index >= 0; index -= 1) {
    const relativePath = objectNames.slice(0, index + 1);
    child = {
      kind: 'object',
      key: JSON.stringify(['template', ['rows'], relativePath]),
      name: objectNames[index] as string,
      relativePath,
      required: false,
      label: objectNames[index] as string,
      children: [child],
      presentation: [{ kind: 'form-node', node: child }],
    };
  }
  return withDefaultPresentation({
    nodes: [
      {
        kind: 'array',
        key: '["rows"]',
        name: 'rows',
        path: ['rows'],
        required: false,
        label: 'Rows',
        identity: { property: 'id' },
        item: {
          kind: 'item-template',
          children: [child],
          fields: [leaf],
          presentation: [{ kind: 'form-node', node: child }],
        },
      },
    ],
    fields: [],
  });
}

function nestedCollectionDefinition(): FormDefinition {
  const name = {
    kind: 'string',
    nullable: false,
    key: '["template",["section","rows"],["name"]]',
    name: 'name',
    relativePath: ['name'],
    required: false,
    label: 'Name',
    constraints: {},
  } as const;
  const rows = {
    kind: 'array',
    key: '["section","rows"]',
    name: 'rows',
    path: ['section', 'rows'],
    required: false,
    label: 'Rows',
    identity: { property: 'id' },
    item: {
      kind: 'item-template',
      children: [name],
      fields: [name],
      presentation: [{ kind: 'form-node', node: name }],
    },
  } as const;
  return withDefaultPresentation({
    nodes: [
      {
        kind: 'object',
        key: '["section"]',
        name: 'section',
        path: ['section'],
        required: false,
        label: 'Section',
        children: [rows],
        presentation: [{ kind: 'form-node', node: rows }],
      },
    ],
    fields: [],
  });
}

function nestedItemDefinition(): FormDefinition {
  const city = {
    kind: 'string',
    nullable: false,
    key: '["template",["rows"],["address","city"]]',
    name: 'city',
    relativePath: ['address', 'city'],
    required: false,
    label: 'City',
    constraints: {},
  } as const;
  const address = {
    kind: 'object',
    key: '["template",["rows"],["address"]]',
    name: 'address',
    relativePath: ['address'],
    required: false,
    label: 'Address',
    children: [city],
    presentation: [{ kind: 'form-node', node: city }],
  } as const;
  return withDefaultPresentation({
    nodes: [
      {
        kind: 'array',
        key: '["rows"]',
        name: 'rows',
        path: ['rows'],
        required: false,
        label: 'Rows',
        identity: { property: 'id' },
        item: {
          kind: 'item-template',
          children: [address],
          fields: [city],
          presentation: [{ kind: 'form-node', node: address }],
        },
      },
    ],
    fields: [],
  });
}

function simpleCollectionNode(name: string): ArrayNodeDefinition {
  const path = [name];
  const relativePath = ['value'];
  const field = {
    kind: 'string',
    nullable: false,
    key: JSON.stringify(['template', path, relativePath]),
    name: 'value',
    relativePath,
    required: false,
    label: 'Value',
    constraints: {},
  } as const;
  return {
    kind: 'array',
    key: JSON.stringify(path),
    name,
    path,
    required: false,
    label: name,
    identity: { property: 'id' },
    item: {
      kind: 'item-template',
      children: [field],
      fields: [field],
      presentation: [{ kind: 'form-node', node: field }],
    },
  };
}

describe('M10 controlled collection runtime integration', () => {
  it('publishes dynamic snapshots and supports stable and positional reads', () => {
    const created = create({ rows: [{ id: 'a', name: 'Ada' }] });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const snapshot = created.runtime.getSnapshot();
    expect(snapshot.nodes[0]).toMatchObject({
      nodeKind: 'array',
      identityState: { kind: 'valid' },
      items: [{ address: { itemId: 'a' } }],
    });
    expect(snapshot.fields).toHaveLength(1);
    expect(created.runtime.getNodeSnapshot(['rows', 0])).toBe(
      created.runtime.getItemSnapshot({
        collectionPath: ['rows'],
        itemId: 'a',
      }),
    );
    expect(
      created.runtime.getCollectionNodeSnapshot({
        collectionPath: ['rows'],
        itemId: 'a',
        relativePath: ['name'],
      }),
    ).toBe(snapshot.fields[0]);
  });

  it('reports invalid identity without exposing addressable items', () => {
    const created = create({ rows: [{ id: 'a' }, { id: 'a' }] });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.diagnostics[0]).toMatchObject({
      code: 'INVALID_COLLECTION_IDENTITY',
      parameters: { reason: 'duplicate-identity', index: 1, firstIndex: 0 },
    });
    expect(created.runtime.getSnapshot()).toMatchObject({
      valid: false,
      nodes: [{ identityState: { kind: 'invalid' }, items: [] }],
    });
    expect(
      created.runtime.requestRemoveItem({
        collectionPath: ['rows'],
        itemId: 'a',
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'UNADDRESSABLE_COLLECTION',
          parameters: { reason: 'invalid-identity' },
        },
      ],
    });
  });

  it('reconciles movement by identity and emits controlled leaf operations', () => {
    const created = create({
      rows: [
        { id: 'a', name: 'Ada' },
        { id: 'b', name: 'Bob' },
      ],
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const operations: FormOperation[] = [];
    created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    expect(
      created.runtime.requestSetItemValue(
        { collectionPath: ['rows'], itemId: 'a', relativePath: ['name'] },
        'Grace',
      ),
    ).toMatchObject({ success: true, effects: { operationEmitted: true } });
    expect(operations[0]).toMatchObject({
      type: 'set-item-value',
      target: { itemId: 'a' },
      expected: { kind: 'value', value: 'Ada' },
      value: 'Grace',
    });
    const before = created.runtime.getItemSnapshot({
      collectionPath: ['rows'],
      itemId: 'a',
    });
    created.runtime.updateExternalState({
      value: {
        rows: [
          { id: 'b', name: 'Bob' },
          { id: 'a', name: 'Grace' },
        ],
      },
    });
    const after = created.runtime.getItemSnapshot({
      collectionPath: ['rows'],
      itemId: 'a',
    });
    expect(after?.index).toBe(1);
    expect(after).not.toBe(before);
    expect(after?.fields[0]?.key).toBe(before?.fields[0]?.key);
  });

  it('emits remove-leaf, move and remove intentions without projection', () => {
    const value = {
      rows: [
        { id: 'a', name: 'Ada' },
        { id: 'b', name: 'Bob' },
      ],
    };
    const created = create(value);
    expect(created.success).toBe(true);
    if (!created.success) return;
    const before = created.runtime.getSnapshot();
    const operations: FormOperation[] = [];
    created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    expect(
      created.runtime.requestRemoveItemValue({
        collectionPath: ['rows'],
        itemId: 'a',
        relativePath: ['name'],
      }),
    ).toMatchObject({ success: true, effects: { operationEmitted: true } });
    expect(
      created.runtime.requestMoveItem(
        { collectionPath: ['rows'], itemId: 'a' },
        { kind: 'after', itemId: 'b' },
      ),
    ).toMatchObject({ success: true, effects: { operationEmitted: true } });
    expect(
      created.runtime.requestRemoveItem({
        collectionPath: ['rows'],
        itemId: 'b',
      }),
    ).toMatchObject({ success: true, effects: { operationEmitted: true } });
    expect(operations).toMatchObject([
      {
        type: 'remove-item-value',
        metadata: { id: 1 },
        target: { itemId: 'a' },
        expected: { kind: 'value', value: 'Ada' },
      },
      {
        type: 'move-item',
        metadata: { id: 2 },
        itemId: 'a',
        placement: { kind: 'after', itemId: 'b' },
      },
      { type: 'remove-item', metadata: { id: 3 }, itemId: 'b' },
    ]);
    expect(created.runtime.getSnapshot()).toBe(before);
    expect(created.runtime.getSnapshot().value).toBe(value);
  });

  it('rejects managed item accessors atomically before validation', () => {
    const created = create({ rows: [{ id: 'a', name: 'Ada' }] });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const validator = vi.fn();
    const item = { id: 'a' } as { id: string; name?: string };
    Object.defineProperty(item, 'name', { get: validator });
    const before = created.runtime.getSnapshot();
    const result = created.runtime.updateExternalState({
      value: { rows: [item] },
    });
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_EXTERNAL_STATE_UPDATE',
          dataPath: ['rows', 0, 'name'],
        },
      ],
    });
    expect(validator).not.toHaveBeenCalled();
    expect(created.runtime.getSnapshot()).toBe(before);
  });

  it('blocks an accessor on an empty managed template object', () => {
    const emptyObject = {
      kind: 'object',
      key: '["template",["rows"],["empty"]]',
      name: 'empty',
      relativePath: ['empty'],
      required: false,
      label: 'Empty',
      children: [],
      presentation: [],
    } as const;
    const rows: ArrayNodeDefinition = {
      kind: 'array',
      key: '["rows"]',
      name: 'rows',
      path: ['rows'],
      required: false,
      label: 'Rows',
      identity: { property: 'id' },
      item: {
        kind: 'item-template',
        children: [emptyObject],
        fields: [],
        presentation: [{ kind: 'form-node', node: emptyObject }],
      },
    };
    const getter = vi.fn();
    const item = { id: 'a' } as { id: string; empty?: object };
    Object.defineProperty(item, 'empty', { get: getter });
    const validator = vi.fn(() => ({ valid: true, issues: [] }));
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: withDefaultPresentation({ nodes: [rows], fields: [] }),
      schema: {},
      value: { rows: [item] },
      baselineValue: { rows: [] },
      locale: 'en',
      validator: { validate: validator },
    });
    expect(created).toMatchObject({
      success: false,
      diagnostics: [
        { code: 'INVALID_RUNTIME_OPTIONS', dataPath: ['rows', 0, 'empty'] },
      ],
    });
    expect(getter).not.toHaveBeenCalled();
    expect(validator).not.toHaveBeenCalled();
  });

  it('inspects collection accessors in definition/item/template order', () => {
    const firstItem = { id: 'a' } as { id: string; value?: string };
    const firstGetter = vi.fn();
    const secondGetter = vi.fn();
    Object.defineProperty(firstItem, 'value', { get: firstGetter });
    const value = { first: [firstItem] } as {
      first: object[];
      second?: object[];
    };
    Object.defineProperty(value, 'second', { get: secondGetter });
    const validator = vi.fn(() => ({ valid: true, issues: [] }));
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: withDefaultPresentation({
        nodes: [simpleCollectionNode('first'), simpleCollectionNode('second')],
        fields: [],
      }),
      schema: {},
      value,
      baselineValue: { first: [], second: [] },
      locale: 'en',
      validator: { validate: validator },
    });
    expect(created).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_RUNTIME_OPTIONS',
          dataPath: ['first', 0, 'value'],
        },
      ],
    });
    expect(firstGetter).not.toHaveBeenCalled();
    expect(secondGetter).not.toHaveBeenCalled();
    expect(validator).not.toHaveBeenCalled();
  });

  it('emits structural operations and permits only start/end materialization', () => {
    const created = create({});
    expect(created.success).toBe(true);
    if (!created.success) return;
    const operations: FormOperation[] = [];
    created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    expect(
      created.runtime.requestInsertItem(
        ['rows'],
        'a',
        { id: 'a', name: 'Ada' },
        { kind: 'end' },
      ),
    ).toMatchObject({ success: true, effects: { operationEmitted: true } });
    expect(operations[0]).toMatchObject({
      type: 'insert-item',
      itemId: 'a',
      identityProperty: 'id',
      placement: { kind: 'end' },
    });
    expect(
      created.runtime.requestInsertItem(
        ['rows'],
        'b',
        { id: 'b' },
        { kind: 'before', itemId: 'a' },
      ),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'UNADDRESSABLE_COLLECTION',
          parameters: { reason: 'collection-missing' },
        },
      ],
    });
  });

  it('keeps stable focus through movement and clears it on removal', () => {
    const created = create({
      rows: [
        { id: 'a', name: 'Ada' },
        { id: 'b', name: 'Bob' },
      ],
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const target = {
      collectionPath: ['rows'],
      itemId: 'a',
      relativePath: ['name'],
    };
    expect(created.runtime.focus(target)).toMatchObject({ success: true });
    created.runtime.updateExternalState({
      value: {
        rows: [
          { id: 'b', name: 'Bob' },
          { id: 'a', name: 'Ada' },
        ],
      },
    });
    expect(created.runtime.getCollectionNodeSnapshot(target)).toMatchObject({
      focused: true,
      path: ['rows', 1, 'name'],
    });
    created.runtime.updateExternalState({
      value: { rows: [{ id: 'b', name: 'Bob' }] },
    });
    expect(created.runtime.getSnapshot().nodes[0]).toMatchObject({
      focused: false,
    });
  });

  it('does not restore released interaction after removal or invalid identity', () => {
    const created = create({ rows: [{ id: 'a', name: 'Ada' }] });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const target = {
      collectionPath: ['rows'],
      itemId: 'a',
      relativePath: ['name'],
    } as const;
    created.runtime.focus(target);
    created.runtime.blur(target);
    expect(created.runtime.getCollectionNodeSnapshot(target)).toMatchObject({
      touched: true,
    });
    created.runtime.updateExternalState({ value: { rows: [] } });
    created.runtime.updateExternalState({
      value: { rows: [{ id: 'a', name: 'Ada' }] },
    });
    expect(created.runtime.getCollectionNodeSnapshot(target)).toMatchObject({
      touched: false,
      focused: false,
    });
    created.runtime.focus(target);
    created.runtime.updateExternalState({
      value: { rows: [{ id: 'a' }, { id: 'a' }] },
    });
    created.runtime.updateExternalState({
      value: { rows: [{ id: 'a', name: 'Ada' }] },
    });
    expect(created.runtime.getCollectionNodeSnapshot(target)).toMatchObject({
      touched: false,
      focused: false,
    });
  });

  it('resolves stable item scopes after movement', () => {
    const issue = {
      code: 'name',
      path: ['rows', 0, 'name'],
      parameters: {},
    };
    const result = createControlledFormRuntime({
      formId: 'form',
      definition: definition(),
      schema: {},
      value: { rows: [{ id: 'a', name: '' }] },
      baselineValue: { rows: [{ id: 'a', name: '' }] },
      locale: 'en',
      validator: { validate: () => ({ valid: false, issues: [issue] }) },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(
      result.runtime.getValidationSnapshot({
        id: 'item',
        paths: [{ collectionPath: ['rows'], itemId: 'a' }],
      }),
    ).toMatchObject({ valid: false, issues: [{ code: 'name' }] });
  });

  it('reports hostile action members independently without invoking accessors', () => {
    const created = create({ rows: [{ id: 'a', name: 'Ada' }] });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const getter = vi.fn();
    const collectionPath = new Array<unknown>(2);
    Object.defineProperty(collectionPath, '0', { get: getter });
    const target = Object.create(null) as Record<string, unknown>;
    target.collectionPath = collectionPath;
    target.relativePath = ['name', 1];
    const result = created.runtime.requestSetItemValue(target as never, 'x');
    expect(getter).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_COLLECTION_RUNTIME_TARGET',
          parameters: {
            action: 'requestSetItemValue',
            member: 'collectionPath[0]',
            expected: 'string',
            reason: 'accessor-member',
          },
        },
        {
          parameters: {
            member: 'collectionPath[1]',
            reason: 'missing-member',
          },
        },
        {
          parameters: { member: 'itemId', reason: 'missing-member' },
        },
        {
          parameters: {
            member: 'relativePath[1]',
            reason: 'invalid-value',
            actualType: 'number',
          },
        },
      ],
    });
  });

  it('validates placement before state and rejects self anchors exactly', () => {
    const created = create({ rows: [{ id: 'a', name: 'Ada' }] });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(
      created.runtime.requestMoveItem(
        { collectionPath: ['rows'], itemId: 'a' },
        { kind: 'before', itemId: 'a' },
      ),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INVALID_COLLECTION_RUNTIME_TARGET',
          dataPath: ['rows'],
          parameters: {
            action: 'requestMoveItem',
            member: 'placement.itemId',
            expected: 'different anchor item',
            reason: 'self-anchor',
          },
        },
      ],
    });
  });

  it('assigns positional issues to fields, items and collection fallbacks', () => {
    const issues = [
      { code: 'array', path: ['rows'], parameters: {} },
      { code: 'identity', path: ['rows', 0, 'id'], parameters: {} },
      { code: 'unknown', path: ['rows', 0, 'unknown', 'leaf'], parameters: {} },
      { code: 'name', path: ['rows', 0, 'name'], parameters: {} },
      { code: 'outside', path: ['rows', 4, 'name'], parameters: {} },
      { code: 'non-positional', path: ['rows', 'name'], parameters: {} },
    ];
    const created = createControlledFormRuntime<{ rows: object[] }>({
      formId: 'form',
      definition: definition(),
      schema: {},
      value: { rows: [{ id: 'a', name: '' }] },
      baselineValue: { rows: [{ id: 'a', name: '' }] },
      locale: 'en',
      validator: { validate: () => ({ valid: false, issues }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const collection = created.runtime.getSnapshot().nodes[0];
    expect(collection).toMatchObject({
      issues: [
        { code: 'array' },
        { code: 'outside' },
        { code: 'non-positional' },
      ],
      items: [
        {
          issues: [{ code: 'identity' }, { code: 'unknown' }],
          fields: [{ issues: [{ code: 'name' }] }],
        },
      ],
    });
  });

  it('falls all descendant issues back to an identity-invalid collection', () => {
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: definition(),
      schema: {},
      value: { rows: [{ id: 'a' }, { id: 'a', name: '' }] },
      baselineValue: { rows: [] },
      locale: 'en',
      validator: {
        validate: () => ({
          valid: false,
          issues: [{ code: 'name', path: ['rows', 1, 'name'], parameters: {} }],
        }),
      },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.runtime.getSnapshot().nodes[0]).toMatchObject({
      identityState: { kind: 'invalid' },
      issues: [{ code: 'name' }],
      items: [],
    });
  });

  it('emits current identity diagnostics before baseline diagnostics', () => {
    const created = createControlledFormRuntime<{ rows: object[] }>({
      formId: 'form',
      definition: definition(),
      schema: {},
      value: { rows: [{ id: 'a' }, { id: 'a' }] },
      baselineValue: { rows: [{ name: 'missing identity' }] },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    expect(created.diagnostics).toMatchObject([
      {
        code: 'INVALID_COLLECTION_IDENTITY',
        parameters: { reason: 'duplicate-identity', index: 1, firstIndex: 0 },
      },
      {
        code: 'INVALID_COLLECTION_IDENTITY',
        parameters: { reason: 'missing-identity', index: 0 },
      },
    ]);
  });

  it('includes the blocking path for an incompatible collection ancestor', () => {
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: nestedCollectionDefinition(),
      schema: {},
      value: { section: 42 },
      baselineValue: { section: 42 },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(
      created.runtime.requestRemoveItem({
        collectionPath: ['section', 'rows'],
        itemId: 'a',
      }),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'UNADDRESSABLE_COLLECTION',
          dataPath: ['section', 'rows'],
          parameters: {
            reason: 'incompatible-ancestor',
            blockingPath: ['section'],
          },
        },
      ],
    });
  });

  it('owns dirty state for incompatible collection ancestors', () => {
    const differing = createControlledFormRuntime({
      formId: 'form',
      definition: nestedCollectionDefinition(),
      schema: {},
      value: { section: 42 },
      baselineValue: { section: 43 },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(differing.success).toBe(true);
    if (!differing.success) return;
    expect(differing.runtime.getSnapshot()).toMatchObject({
      dirty: true,
      nodes: [{ children: [{ dirty: true }] }],
    });
    const matching = createControlledFormRuntime({
      formId: 'form',
      definition: nestedCollectionDefinition(),
      schema: {},
      value: { section: 42 },
      baselineValue: { section: 42 },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(matching.success).toBe(true);
    if (!matching.success) return;
    expect(matching.runtime.getSnapshot()).toMatchObject({
      dirty: false,
      nodes: [{ children: [{ dirty: false }] }],
    });
  });

  it('permits start/end insertion through compatible missing ancestors', () => {
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: nestedCollectionDefinition(),
      schema: {},
      value: {},
      baselineValue: {},
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const operations: FormOperation[] = [];
    created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    expect(
      created.runtime.requestInsertItem(
        ['section', 'rows'],
        'a',
        { id: 'a', name: 'Ada' },
        { kind: 'start' },
      ),
    ).toMatchObject({ success: true, effects: { operationEmitted: true } });
    expect(operations).toMatchObject([
      {
        type: 'insert-item',
        collectionPath: ['section', 'rows'],
        itemId: 'a',
        placement: { kind: 'start' },
      },
    ]);
  });

  it('reports the exact positional blocker inside an addressable item', () => {
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: nestedItemDefinition(),
      schema: {},
      value: { rows: [{ id: 'a', address: 42 }] },
      baselineValue: { rows: [{ id: 'a', address: 42 }] },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(
      created.runtime.requestSetItemValue(
        {
          collectionPath: ['rows'],
          itemId: 'a',
          relativePath: ['address', 'city'],
        },
        'Barcelona',
      ),
    ).toMatchObject({
      success: false,
      diagnostics: [
        {
          code: 'INCOMPATIBLE_RUNTIME_ANCESTOR',
          dataPath: ['rows', 0, 'address', 'city'],
          parameters: {
            blockingPath: ['rows', 0, 'address'],
            actualType: 'number',
          },
        },
      ],
    });
  });

  it('applies array and stable scopes to dynamic visibility and touched state', () => {
    const created = createControlledFormRuntime({
      formId: 'form',
      definition: definition(),
      schema: {},
      value: { rows: [{ id: 'a', name: '' }] },
      baselineValue: { rows: [{ id: 'a', name: '' }] },
      locale: 'en',
      validator: {
        validate: () => ({
          valid: false,
          issues: [{ code: 'name', path: ['rows', 0, 'name'], parameters: {} }],
        }),
      },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const target = {
      collectionPath: ['rows'],
      itemId: 'a',
      relativePath: ['name'],
    } as const;
    created.runtime.focus(target);
    created.runtime.blur(target);
    expect(created.runtime.getCollectionNodeSnapshot(target)).toMatchObject({
      touched: true,
      showIssues: true,
    });
    created.runtime.resetTouched({ id: 'array', paths: [['rows']] });
    expect(created.runtime.getCollectionNodeSnapshot(target)).toMatchObject({
      touched: false,
      showIssues: false,
    });
    created.runtime.showValidationErrors({
      id: 'item',
      paths: [{ collectionPath: ['rows'], itemId: 'a' }],
    });
    expect(created.runtime.getCollectionNodeSnapshot(target)).toMatchObject({
      showIssues: true,
    });
    created.runtime.hideValidationErrors('item');
    created.runtime.focus(target);
    created.runtime.blur(target);
    created.runtime.resetTouched();
    expect(created.runtime.getCollectionNodeSnapshot(target)).toMatchObject({
      touched: false,
      showIssues: false,
    });
    expect(
      created.runtime.getValidationSnapshot({
        id: 'malformed-node',
        paths: [
          {
            collectionPath: ['rows'],
            itemId: 'a',
            relativePath: 42,
          } as never,
        ],
      }),
    ).toMatchObject({
      valid: true,
      issues: [],
      diagnostics: [{ code: 'UNKNOWN_SCOPE_PATH' }],
    });
  });

  it('reuses unchanged identity-owned wrappers after immutable replacement', () => {
    const created = create({
      rows: [
        { id: 'a', name: 'Ada', unmanaged: 1 },
        { id: 'b', name: 'Bob' },
      ],
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    const before = created.runtime.getSnapshot();
    const beforeArray = before.nodes[0];
    created.runtime.updateExternalState({
      value: {
        rows: [
          { id: 'a', name: 'Ada', unmanaged: 2 },
          { id: 'b', name: 'Bob' },
        ],
      },
    });
    const after = created.runtime.getSnapshot();
    expect(after.nodes[0]).toBe(beforeArray);
    expect(after.fields[0]).toBe(before.fields[0]);
    expect(after.fields[1]).toBe(before.fields[1]);
  });

  it('builds deeply nested item snapshots iteratively', () => {
    const depth = 1_200;
    let nested: object = { value: 'ok' };
    for (let index = depth - 1; index >= 0; index -= 1) {
      nested = { [`n${index}`]: nested };
    }
    const created = createControlledFormRuntime({
      formId: 'deep',
      definition: deepDefinition(depth),
      schema: {},
      value: { rows: [{ id: 'a', ...nested }] },
      baselineValue: { rows: [{ id: 'a', ...nested }] },
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    expect(created.success).toBe(true);
    if (!created.success) return;
    expect(created.runtime.getSnapshot().fields[0]?.path).toHaveLength(
      depth + 3,
    );
  });
});
