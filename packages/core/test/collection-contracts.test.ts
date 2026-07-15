import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
  ArrayNodeDefinition,
  ArrayRuntimeSnapshot,
  ArrayUiSchema,
  CollectionNodeAddress,
  CollectionPolicy,
  CollectionTextResolutionContext,
  CompileFormDefinitionInput,
  FieldTemplate,
  FormNodeTemplate,
  InsertItemOperation,
  ItemRuntimeSnapshot,
  ObjectItemTemplateDefinition,
  RuntimeTreeSnapshot,
} from '../src/index.js';
import {
  canonicalInstanceNodeKey,
  canonicalItemKey,
  canonicalTemplateKey,
  copyCollectionItemAddress,
  copyCollectionNodeAddress,
} from '../src/internal/collection-address.js';
import {
  validateCollectionFormDefinition,
  validateNestedFormDefinition,
} from '../src/internal/nested-definition.js';
import { canonicalDataPathKey } from '../src/internal/path.js';
import { withDefaultPresentation } from './definition-fixtures.js';

function templateLeaf(
  collectionPath: readonly string[],
  relativePath: readonly string[],
): FieldTemplate {
  return {
    kind: 'string',
    nullable: false,
    key: canonicalTemplateKey(collectionPath, relativePath),
    name: relativePath.at(-1) ?? '',
    relativePath,
    required: false,
    label: relativePath.at(-1) ?? '',
    constraints: {},
  };
}

function collectionNode(
  path: readonly string[],
  identityProperty: string,
  item: ObjectItemTemplateDefinition,
): ArrayNodeDefinition {
  return {
    kind: 'array',
    key: canonicalDataPathKey(path),
    name: path.at(-1) ?? '',
    path,
    required: false,
    label: path.at(-1) ?? '',
    identity: { property: identityProperty },
    item,
  };
}

describe('M10 public contract foundations', () => {
  it('exposes policy, UI, template, address, operation, snapshot, and text shapes', () => {
    const policy = {
      path: ['rows'],
      itemIdentityProperty: 'id',
    } satisfies CollectionPolicy;
    const ui = {
      label: 'Rows',
      item: { order: ['name'], fields: { name: { label: 'Name' } } },
    } satisfies ArrayUiSchema;
    const input = {
      schema: {},
      uiSchema: { fields: { rows: ui } },
      collectionPolicies: [policy],
    } satisfies CompileFormDefinitionInput;
    const leaf = templateLeaf(['rows'], ['name']);
    const template: ObjectItemTemplateDefinition = {
      kind: 'item-template',
      children: [leaf],
      fields: [leaf],
    };
    const collection = collectionNode(['rows'], 'id', template);
    const collectionPath = collection.path as readonly string[];
    const address = {
      collectionPath,
      itemId: 'row-1',
      relativePath: leaf.relativePath,
    } satisfies CollectionNodeAddress;
    const operation = {
      type: 'insert-item',
      metadata: { id: 1, formId: 'form' },
      collectionPath,
      identityProperty: 'id',
      itemId: 'row-1',
      item: { id: 'row-1', name: 'Ada' },
      placement: { kind: 'end' },
      source: 'user',
    } satisfies InsertItemOperation;
    const itemSnapshot: ItemRuntimeSnapshot = {
      nodeKind: 'item',
      key: canonicalItemKey(collectionPath, 'row-1'),
      address: { collectionPath, itemId: 'row-1' },
      index: 0,
      dataPath: ['rows', 0],
      dirty: false,
      touched: false,
      focused: false,
      valid: true,
      issues: [],
      showIssues: false,
      children: [],
      fields: [],
    };
    const snapshot: ArrayRuntimeSnapshot = {
      nodeKind: 'array',
      key: collection.key,
      path: collectionPath,
      presence: { kind: 'array' },
      identityState: { kind: 'valid' },
      dirty: false,
      touched: false,
      focused: false,
      valid: true,
      issues: [],
      showIssues: false,
      items: [itemSnapshot],
    };
    const context: CollectionTextResolutionContext = {
      formId: 'form',
      locale: 'en',
      collection,
      item: itemSnapshot,
      member: 'item-label',
    };
    const tree: RuntimeTreeSnapshot = itemSnapshot;

    expect(input.collectionPolicies?.[0]).toBe(policy);
    expect(address.itemId).toBe('row-1');
    expect(operation.item).toEqual({ id: 'row-1', name: 'Ada' });
    expect(snapshot.items[0]).toBe(tree);
    expect(context.collection).toBe(collection);
    expectTypeOf<FormNodeTemplate>().toMatchTypeOf<
      FieldTemplate | { readonly kind: 'object' }
    >();
  });
});

describe('collection address and key helpers', () => {
  it('copies exact stable addresses and derives collision-safe tagged keys', () => {
    const address = {
      collectionPath: ['a.b', '__proto__'],
      itemId: 'id/%',
      relativePath: ['name'],
    };
    const copiedItem = copyCollectionItemAddress(address);
    const copiedNode = copyCollectionNodeAddress(address);

    expect(copiedItem).toEqual({
      collectionPath: ['a.b', '__proto__'],
      itemId: 'id/%',
    });
    expect(copiedNode).toEqual(address);
    expect(Object.isFrozen(copiedNode)).toBe(true);
    expect(Object.isFrozen(copiedNode?.collectionPath)).toBe(true);
    expect(Object.isFrozen(copiedNode?.relativePath)).toBe(true);
    expect(canonicalTemplateKey(['rows'], ['name'])).toBe(
      '["template",["rows"],["name"]]',
    );
    expect(canonicalItemKey(['rows'], 'row-1')).toBe(
      '["item",["rows"],"row-1"]',
    );
    expect(canonicalInstanceNodeKey(['rows'], 'row-1', ['name'])).toBe(
      '["item-node",["rows"],"row-1",["name"]]',
    );
  });

  it('rejects malformed, blank, sparse, numeric, and accessor members safely', () => {
    let executed = false;
    const sparseRelativePath = Array<string>(2);
    sparseRelativePath[1] = 'name';
    const accessor = Object.create(null) as Record<string, unknown>;
    Object.defineProperty(accessor, 'collectionPath', {
      get() {
        executed = true;
        return ['rows'];
      },
    });
    Object.defineProperty(accessor, 'itemId', { value: 'row-1' });

    expect(copyCollectionItemAddress(accessor)).toBeUndefined();
    expect(executed).toBe(false);
    expect(
      copyCollectionItemAddress({ collectionPath: ['rows', 0], itemId: 'x' }),
    ).toBeUndefined();
    expect(
      copyCollectionItemAddress({ collectionPath: ['rows'], itemId: '   ' }),
    ).toBeUndefined();
    expect(
      copyCollectionNodeAddress({
        collectionPath: ['rows'],
        itemId: 'x',
        relativePath: sparseRelativePath,
      }),
    ).toBeUndefined();
  });
});

describe('collection definition validation foundations', () => {
  it('validates an identity-linked item template without adding its leaves to the global projection', () => {
    const leaf = templateLeaf(['rows'], ['name']);
    const collection = collectionNode(['rows'], 'id', {
      kind: 'item-template',
      children: [leaf],
      fields: [leaf],
    });

    expect(
      validateCollectionFormDefinition(
        withDefaultPresentation({ nodes: [collection], fields: [] }),
      ),
    ).toEqual({ success: true });
    expect(
      validateNestedFormDefinition({ nodes: [collection], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: { reason: 'invalid-node', nodeIndexPath: [0] },
    });
  });

  it('reports identity overlap, nested arrays, cycles, and projection mismatches with safe locators', () => {
    const identityLeaf = templateLeaf(['rows'], ['id']);
    const overlap = collectionNode(['rows'], 'id', {
      kind: 'item-template',
      children: [identityLeaf],
      fields: [identityLeaf],
    });
    expect(
      validateCollectionFormDefinition({ nodes: [overlap], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'identity-template-overlap',
        templateIndexPath: [0],
        path: ['rows'],
        relativePath: ['id'],
      },
    });

    const nestedArray = {
      kind: 'array',
      key: canonicalTemplateKey(['rows'], ['nested']),
      name: 'nested',
      relativePath: ['nested'],
      required: false,
      label: 'Nested',
    };
    const nested = collectionNode(['rows'], 'id', {
      kind: 'item-template',
      children: [nestedArray as unknown as FormNodeTemplate],
      fields: [],
    });
    expect(
      validateCollectionFormDefinition({ nodes: [nested], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: { reason: 'nested-array-template', templateIndexPath: [0] },
    });

    const cyclic = {
      kind: 'object',
      key: canonicalTemplateKey(['rows'], ['group']),
      name: 'group',
      relativePath: ['group'],
      required: false,
      label: 'Group',
      children: [] as unknown[],
    };
    cyclic.children.push(cyclic);
    const cycle = collectionNode(['rows'], 'id', {
      kind: 'item-template',
      children: [cyclic as unknown as FormNodeTemplate],
      fields: [],
    });
    expect(
      validateCollectionFormDefinition({ nodes: [cycle], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'cyclic-template',
        templateIndexPath: [0, 0],
        firstTemplateIndexPath: [0],
      },
    });

    const leaf = templateLeaf(['rows'], ['name']);
    const mismatch = collectionNode(['rows'], 'id', {
      kind: 'item-template',
      children: [leaf],
      fields: [],
    });
    expect(
      validateCollectionFormDefinition({ nodes: [mismatch], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'inconsistent-template-leaf-projection',
        fieldIndex: 0,
        templateIndexPath: [0],
      },
    });
  });

  it('closes array exterior, identity, item, reuse, and duplicate template reasons', () => {
    const validLeaf = templateLeaf(['rows'], ['name']);
    const validItem: ObjectItemTemplateDefinition = {
      kind: 'item-template',
      children: [validLeaf],
      fields: [validLeaf],
    };
    const invalidArray = {
      ...collectionNode(['rows'], 'id', validItem),
      identity: null,
    };
    expect(
      validateCollectionFormDefinition({ nodes: [invalidArray], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: { reason: 'invalid-array-node', nodeIndexPath: [0] },
    });
    const missingItem = { ...collectionNode(['rows'], 'id', validItem) } as {
      item?: ObjectItemTemplateDefinition;
    };
    delete missingItem.item;
    expect(
      validateCollectionFormDefinition({ nodes: [missingItem], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: { reason: 'invalid-array-node', nodeIndexPath: [0] },
    });

    const invalidIdentity = {
      ...collectionNode(['rows'], 'id', validItem),
      identity: { property: 1 },
    };
    expect(
      validateCollectionFormDefinition({
        nodes: [invalidIdentity],
        fields: [],
      }),
    ).toMatchObject({
      success: false,
      defect: { reason: 'invalid-item-identity', nodeIndexPath: [0] },
    });

    const invalidItem = {
      ...collectionNode(['rows'], 'id', validItem),
      item: { kind: 'item-template', children: null, fields: [] },
    };
    expect(
      validateCollectionFormDefinition({ nodes: [invalidItem], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: { reason: 'invalid-item-template', nodeIndexPath: [0] },
    });

    const reused = collectionNode(['rows'], 'id', {
      kind: 'item-template',
      children: [validLeaf, validLeaf],
      fields: [validLeaf, validLeaf],
    });
    expect(
      validateCollectionFormDefinition({ nodes: [reused], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'reused-template',
        templateIndexPath: [1],
        firstTemplateIndexPath: [0],
      },
    });

    const duplicateLeaf = templateLeaf(['rows'], ['name']);
    const duplicate = collectionNode(['rows'], 'id', {
      kind: 'item-template',
      children: [validLeaf, duplicateLeaf],
      fields: [validLeaf, duplicateLeaf],
    });
    expect(
      validateCollectionFormDefinition({ nodes: [duplicate], fields: [] }),
    ).toMatchObject({
      success: false,
      defect: {
        reason: 'duplicate-template-path',
        templateIndexPath: [1],
        firstTemplateIndexPath: [0],
        relativePath: ['name'],
      },
    });
  });
});
