// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  ApplyOperationResult,
  Diagnostic,
  FormDefinition,
  FormOperation,
} from '../contracts.js';
import { diagnostic } from './diagnostics.js';
import {
  collectCollectionFormDefinitionDefects,
  type NestedDefinitionDefect,
} from './nested-definition.js';
import {
  canonicalDataPathKey,
  copyStringDataPath,
  isOrdinaryObject,
  readOwnDataMember,
} from './path.js';
import { actualType, describeActualValue } from './value.js';

type CollectionOperationType =
  | 'set-item-value'
  | 'remove-item-value'
  | 'insert-item'
  | 'remove-item'
  | 'move-item';

type Expectation =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown };

type Placement =
  | { readonly kind: 'start' }
  | { readonly kind: 'end' }
  | { readonly kind: 'before'; readonly itemId: string }
  | { readonly kind: 'after'; readonly itemId: string };

type LeafOperation =
  | {
      readonly type: 'set-item-value';
      readonly collectionPath: readonly string[];
      readonly itemId: string;
      readonly relativePath: readonly string[];
      readonly identityProperty: string;
      readonly expected: Expectation;
      readonly value: unknown;
    }
  | {
      readonly type: 'remove-item-value';
      readonly collectionPath: readonly string[];
      readonly itemId: string;
      readonly relativePath: readonly string[];
      readonly identityProperty: string;
      readonly expected: Expectation;
    };

type ParsedCollectionOperation =
  | LeafOperation
  | {
      readonly type: 'insert-item';
      readonly collectionPath: readonly string[];
      readonly identityProperty: string;
      readonly itemId: string;
      readonly item: unknown;
      readonly placement: Placement;
    }
  | {
      readonly type: 'remove-item';
      readonly collectionPath: readonly string[];
      readonly identityProperty: string;
      readonly itemId: string;
    }
  | {
      readonly type: 'move-item';
      readonly collectionPath: readonly string[];
      readonly identityProperty: string;
      readonly itemId: string;
      readonly placement: Placement;
    };

interface ManagedCollection {
  readonly identityProperty: string;
  readonly fields: ReadonlyMap<string, ManagedTemplateField>;
}

interface ManagedTemplateField {
  readonly name: string;
  readonly type: 'string' | 'number' | 'integer' | 'boolean';
  readonly nullable: boolean;
}

type Member =
  | { readonly kind: 'missing' }
  | { readonly kind: 'accessor' }
  | { readonly kind: 'value'; readonly value: unknown };

const TYPES = new Set<unknown>([
  'set-item-value',
  'remove-item-value',
  'insert-item',
  'remove-item',
  'move-item',
]);
const EMPTY_DIAGNOSTICS: readonly [] = Object.freeze([]);

export function isCollectionOperation(value: unknown): boolean {
  if (!isObject(value)) return false;
  const type = ownMember(value, 'type');
  return type.kind === 'value' && TYPES.has(type.value);
}

export function applyCollectionOperation<TData extends object>(
  definition: FormDefinition | undefined,
  currentValue: Readonly<TData>,
  value: FormOperation,
): ApplyOperationResult<TData> {
  const rootError = !isOrdinaryObject(currentValue)
    ? runtimeDiagnostic(
        'INVALID_OPERATION_TARGET',
        { actualType: actualType(currentValue) },
        'Operation target must be an ordinary object.',
      )
    : undefined;
  const parsed = parseOperation(value);
  const shapeDiagnostics = [
    ...(rootError === undefined ? [] : [rootError]),
    ...parsed.diagnostics,
  ];
  if (shapeDiagnostics.length > 0 || parsed.operation === undefined) {
    return failure(currentValue, shapeDiagnostics);
  }
  const operation = parsed.operation;

  let managed: ManagedCollection | undefined;
  let managedField: ManagedTemplateField | undefined;
  if (definition !== undefined) {
    const defects = collectCollectionFormDefinitionDefects(definition);
    if (defects.length > 0) {
      return failure(
        currentValue,
        defects.map((defect) =>
          definitionDiagnostic(defect, operation.collectionPath),
        ),
      );
    }
    managed = findManagedCollection(definition, operation.collectionPath);
    if (managed === undefined) {
      return failure(currentValue, [notManaged(operation)]);
    }
    if (operation.identityProperty !== managed.identityProperty) {
      return failure(currentValue, [
        invalidCollection(
          operation.type,
          'identityProperty',
          'definition identity property',
          'identity-property-mismatch',
          operation.collectionPath,
        ),
      ]);
    }
    if (isLeafOperation(operation)) {
      managedField = managed.fields.get(
        canonicalDataPathKey(operation.relativePath),
      );
      if (managedField === undefined) {
        return failure(currentValue, [notManaged(operation)]);
      }
    }
  }

  const allowMaterialize =
    operation.type === 'insert-item' &&
    (operation.placement.kind === 'start' ||
      operation.placement.kind === 'end');
  const traversal = traverseCollection(
    currentValue,
    operation.collectionPath,
    allowMaterialize,
  );
  if (!traversal.success) return failure(currentValue, [traversal.diagnostic]);
  if (!traversal.present) {
    if (!allowMaterialize) {
      return failure(currentValue, [stale(operation, 'collection-missing')]);
    }
  } else if (!Array.isArray(traversal.collection)) {
    return failure(currentValue, [
      incompatible(operation, 'collection-not-array', traversal.collection),
    ]);
  }

  const collection = traversal.present
    ? (traversal.collection as readonly unknown[])
    : [];
  const scan = scanIdentities(collection, operation);
  if (!scan.success) return failure(currentValue, [scan.diagnostic]);

  if (isLeafOperation(operation)) {
    const index = scan.indices.get(operation.itemId);
    if (index === undefined) {
      return failure(currentValue, [stale(operation, 'item-not-found')]);
    }
    const item = collection[index] as object;
    const leaf = traverseLeaf(
      item,
      operation.relativePath,
      index,
      operation.collectionPath,
    );
    if (!leaf.success) return failure(currentValue, [leaf.diagnostic]);
    if (!expectationMatches(operation.expected, leaf.present, leaf.actual)) {
      return failure(currentValue, [
        staleLeaf(operation.expected, leaf.present, leaf.actual, [
          ...operation.collectionPath,
          index,
          ...operation.relativePath,
        ]),
      ]);
    }
    if (operation.type === 'set-item-value' && managedField !== undefined) {
      const incompatible = incompatibleLeaf(operation, managedField, [
        ...operation.collectionPath,
        index,
        ...operation.relativePath,
      ]);
      if (incompatible !== undefined)
        return failure(currentValue, [incompatible]);
    }
    if (
      operation.type === 'set-item-value' &&
      leaf.present &&
      Object.is(leaf.actual, operation.value)
    ) {
      return success(currentValue, false);
    }
    const nextItem = rebuildLeaf(
      leaf.parents,
      operation.relativePath,
      operation.type === 'set-item-value' ? operation.value : undefined,
      operation.type === 'remove-item-value',
    );
    const nextCollection = replaceArrayItem(collection, index, nextItem);
    return success(
      rebuildCollection(
        traversal,
        operation.collectionPath,
        nextCollection,
      ) as Readonly<TData>,
      true,
    );
  }

  if (operation.type === 'insert-item') {
    if (scan.indices.has(operation.itemId)) {
      return failure(currentValue, [
        stale(operation, 'item-id-already-exists'),
      ]);
    }
    const insertionIndex = resolvePlacement(
      operation,
      scan.indices,
      collection.length,
    );
    if (typeof insertionIndex !== 'number')
      return failure(currentValue, [insertionIndex]);
    const itemError = validateInsertedItem(operation);
    if (itemError !== undefined) return failure(currentValue, [itemError]);
    const nextCollection = spliceArray(
      collection,
      insertionIndex,
      0,
      operation.item,
    );
    return success(
      rebuildCollection(
        traversal,
        operation.collectionPath,
        nextCollection,
      ) as Readonly<TData>,
      true,
    );
  }

  const index = scan.indices.get(operation.itemId);
  if (index === undefined)
    return failure(currentValue, [stale(operation, 'item-not-found')]);
  if (operation.type === 'remove-item') {
    const nextCollection = spliceArray(collection, index, 1);
    return success(
      rebuildCollection(
        traversal,
        operation.collectionPath,
        nextCollection,
      ) as Readonly<TData>,
      true,
    );
  }

  const placementIndex = resolvePlacement(
    operation,
    scan.indices,
    collection.length,
  );
  if (typeof placementIndex !== 'number')
    return failure(currentValue, [placementIndex]);
  const adjusted = placementIndex > index ? placementIndex - 1 : placementIndex;
  if (adjusted === index) return success(currentValue, false);
  const item = collection[index];
  const removed = spliceArray(collection, index, 1);
  const nextCollection = spliceArray(removed, adjusted, 0, item);
  return success(
    rebuildCollection(
      traversal,
      operation.collectionPath,
      nextCollection,
    ) as Readonly<TData>,
    true,
  );
}

function parseOperation(value: unknown): {
  readonly operation?: ParsedCollectionOperation;
  readonly diagnostics: readonly Diagnostic[];
} {
  if (!isObject(value)) return { diagnostics: [] };
  const typeMember = ownMember(value, 'type');
  const type =
    typeMember.kind === 'value' && TYPES.has(typeMember.value)
      ? (typeMember.value as CollectionOperationType)
      : undefined;
  if (type === undefined) return { diagnostics: [] };
  const diagnostics: Diagnostic[] = [];
  validateMetadata(ownMember(value, 'metadata'), diagnostics);
  validateLiteral(value, 'source', 'user', diagnostics);

  if (type === 'set-item-value' || type === 'remove-item-value') {
    const target = ownMember(value, 'target');
    let collectionPath: readonly string[] | undefined;
    let itemId: string | undefined;
    let relativePath: readonly string[] | undefined;
    if (target.kind !== 'value') {
      diagnostics.push(
        invalidCollection(
          type,
          'target',
          'collection node address',
          descriptorReason(target.kind),
        ),
      );
    } else if (!isOrdinaryObject(target.value)) {
      diagnostics.push(
        invalidCollection(
          type,
          'target',
          'collection node address',
          'invalid-value',
          undefined,
          target.value,
        ),
      );
    } else {
      collectionPath = validateCollectionPath(
        type,
        target.value,
        'target.collectionPath',
        diagnostics,
      );
      itemId = validateString(
        type,
        target.value,
        'itemId',
        'target.itemId',
        'non-blank string',
        true,
        diagnostics,
        collectionPath,
      );
      relativePath = validateStringPath(
        type,
        ownMember(target.value, 'relativePath'),
        'target.relativePath',
        'non-empty string-only relative path',
        true,
        diagnostics,
        collectionPath,
      );
    }
    const identityProperty = validateString(
      type,
      value,
      'identityProperty',
      'identityProperty',
      'string',
      false,
      diagnostics,
      collectionPath,
    );
    const expected = validateExpectation(
      ownMember(value, 'expected'),
      type === 'remove-item-value',
      diagnostics,
    );
    let setValue: unknown;
    if (type === 'set-item-value') {
      const entry = ownMember(value, 'value');
      if (entry.kind !== 'value')
        diagnostics.push(
          invalidCollection(
            type,
            'value',
            'own data property',
            descriptorReason(entry.kind),
            collectionPath,
          ),
        );
      else setValue = entry.value;
    }
    if (
      collectionPath !== undefined &&
      relativePath !== undefined &&
      identityProperty !== undefined &&
      relativePath.length === 1 &&
      relativePath[0] === identityProperty
    ) {
      diagnostics.push(
        invalidCollection(
          type,
          'target.relativePath',
          'editable template leaf',
          'identity-target-not-editable',
          collectionPath,
        ),
      );
    }
    if (
      diagnostics.length > 0 ||
      collectionPath === undefined ||
      itemId === undefined ||
      relativePath === undefined ||
      identityProperty === undefined ||
      expected === undefined
    )
      return { diagnostics };
    return type === 'set-item-value'
      ? {
          operation: {
            type,
            collectionPath,
            itemId,
            relativePath,
            identityProperty,
            expected,
            value: setValue,
          },
          diagnostics,
        }
      : {
          operation: {
            type,
            collectionPath,
            itemId,
            relativePath,
            identityProperty,
            expected,
          },
          diagnostics,
        };
  }

  const collectionPath = validateCollectionPath(
    type,
    value,
    'collectionPath',
    diagnostics,
  );
  const identityProperty = validateString(
    type,
    value,
    'identityProperty',
    'identityProperty',
    'string',
    false,
    diagnostics,
    collectionPath,
  );
  const itemId = validateString(
    type,
    value,
    'itemId',
    'itemId',
    'non-blank string',
    true,
    diagnostics,
    collectionPath,
  );
  if (type === 'remove-item') {
    if (
      diagnostics.length > 0 ||
      collectionPath === undefined ||
      identityProperty === undefined ||
      itemId === undefined
    )
      return { diagnostics };
    return {
      operation: { type, collectionPath, identityProperty, itemId },
      diagnostics,
    };
  }
  if (type === 'insert-item') {
    const itemMember = ownMember(value, 'item');
    let item: unknown;
    if (itemMember.kind !== 'value')
      diagnostics.push(
        invalidCollection(
          type,
          'item',
          'own data property',
          descriptorReason(itemMember.kind),
          collectionPath,
        ),
      );
    else {
      item = itemMember.value;
    }
    const placement = validatePlacement(
      type,
      ownMember(value, 'placement'),
      itemId,
      collectionPath,
      diagnostics,
    );
    if (
      diagnostics.length > 0 ||
      collectionPath === undefined ||
      identityProperty === undefined ||
      itemId === undefined ||
      placement === undefined
    )
      return { diagnostics };
    return {
      operation: {
        type,
        collectionPath,
        identityProperty,
        itemId,
        item,
        placement,
      },
      diagnostics,
    };
  }
  const placement = validatePlacement(
    type,
    ownMember(value, 'placement'),
    itemId,
    collectionPath,
    diagnostics,
  );
  if (
    diagnostics.length > 0 ||
    collectionPath === undefined ||
    identityProperty === undefined ||
    itemId === undefined ||
    placement === undefined
  )
    return { diagnostics };
  return {
    operation: { type, collectionPath, identityProperty, itemId, placement },
    diagnostics,
  };
}

function validateCollectionPath(
  type: CollectionOperationType,
  object: object,
  memberName: string,
  diagnostics: Diagnostic[],
): readonly string[] | undefined {
  return validateStringPath(
    type,
    ownMember(
      object,
      memberName.includes('.')
        ? (memberName.split('.').at(-1) as string)
        : memberName,
    ),
    memberName,
    'non-empty string-only path',
    true,
    diagnostics,
  );
}

function validateStringPath(
  type: CollectionOperationType,
  entry: Member,
  name: string,
  expected: string,
  nonEmpty: boolean,
  diagnostics: Diagnostic[],
  path?: readonly string[],
): readonly string[] | undefined {
  if (entry.kind !== 'value') {
    diagnostics.push(
      invalidCollection(
        type,
        name,
        expected,
        descriptorReason(entry.kind),
        path,
      ),
    );
    return undefined;
  }
  if (!Array.isArray(entry.value)) {
    diagnostics.push(
      invalidCollection(
        type,
        name,
        expected,
        'invalid-value',
        path,
        entry.value,
      ),
    );
    return undefined;
  }
  if (nonEmpty && entry.value.length === 0) {
    diagnostics.push(
      invalidCollection(
        type,
        name,
        expected,
        'invalid-value',
        path,
        entry.value,
      ),
    );
    return undefined;
  }
  const result: string[] = [];
  for (let index = 0; index < entry.value.length; index += 1) {
    const part = ownMember(entry.value, String(index));
    if (part.kind !== 'value') {
      diagnostics.push(
        invalidCollection(
          type,
          `${name}.${index}`,
          'string',
          descriptorReason(part.kind),
          path,
        ),
      );
      return undefined;
    }
    if (typeof part.value !== 'string') {
      diagnostics.push(
        invalidCollection(
          type,
          `${name}.${index}`,
          'string',
          'invalid-value',
          path,
          part.value,
        ),
      );
      return undefined;
    }
    result.push(part.value);
  }
  return Object.freeze(result);
}

function validateString(
  type: CollectionOperationType,
  object: object,
  key: string,
  name: string,
  expected: 'string' | 'non-blank string',
  nonBlank: boolean,
  diagnostics: Diagnostic[],
  path?: readonly string[],
): string | undefined {
  const entry = ownMember(object, key);
  if (entry.kind !== 'value') {
    diagnostics.push(
      invalidCollection(
        type,
        name,
        expected,
        descriptorReason(entry.kind),
        path,
      ),
    );
    return undefined;
  }
  if (
    typeof entry.value !== 'string' ||
    (nonBlank && entry.value.trim().length === 0)
  ) {
    diagnostics.push(
      invalidCollection(
        type,
        name,
        expected,
        'invalid-value',
        path,
        entry.value,
      ),
    );
    return undefined;
  }
  return entry.value;
}

function validatePlacement(
  type: CollectionOperationType,
  entry: Member,
  targetId: string | undefined,
  path: readonly string[] | undefined,
  diagnostics: Diagnostic[],
): Placement | undefined {
  if (entry.kind !== 'value') {
    diagnostics.push(
      invalidCollection(
        type,
        'placement',
        'collection placement',
        descriptorReason(entry.kind),
      ),
    );
    return undefined;
  }
  if (!isOrdinaryObject(entry.value)) {
    diagnostics.push(
      invalidCollection(
        type,
        'placement',
        'collection placement',
        'invalid-value',
        path,
        entry.value,
      ),
    );
    return undefined;
  }
  const kind = ownMember(entry.value, 'kind');
  if (kind.kind !== 'value') {
    diagnostics.push(
      invalidCollection(
        type,
        'placement.kind',
        'collection placement',
        descriptorReason(kind.kind),
        path,
      ),
    );
    return undefined;
  }
  if (kind.value === 'start' || kind.value === 'end')
    return Object.freeze({ kind: kind.value });
  if (kind.value !== 'before' && kind.value !== 'after') {
    diagnostics.push(
      invalidCollection(
        type,
        'placement.kind',
        'collection placement',
        'invalid-value',
        path,
        kind.value,
      ),
    );
    return undefined;
  }
  const anchor = validateString(
    type,
    entry.value,
    'itemId',
    'placement.itemId',
    'non-blank string',
    true,
    diagnostics,
    path,
  );
  if (anchor === undefined) return undefined;
  if (targetId !== undefined && anchor === targetId) {
    diagnostics.push(
      invalidCollection(
        type,
        'placement.itemId',
        'different anchor item',
        'self-anchor',
        path,
      ),
    );
    return undefined;
  }
  return Object.freeze({ kind: kind.value, itemId: anchor });
}

function validateExpectation(
  entry: Member,
  requireValue: boolean,
  diagnostics: Diagnostic[],
): Expectation | undefined {
  if (entry.kind !== 'value') {
    diagnostics.push(
      baseInvalidDescriptor('expected', 'expectation object', entry.kind),
    );
    return undefined;
  }
  if (!isObject(entry.value)) {
    diagnostics.push(
      baseInvalid('expected', 'expectation object', entry.value),
    );
    return undefined;
  }
  const kind = ownMember(entry.value, 'kind');
  if (kind.kind !== 'value') {
    diagnostics.push(
      baseInvalidDescriptor('expected.kind', 'missing or value', kind.kind),
    );
    return undefined;
  }
  if (kind.value !== 'missing' && kind.value !== 'value') {
    diagnostics.push(
      baseInvalid('expected.kind', 'missing or value', kind.value),
    );
    return undefined;
  }
  if (requireValue && kind.value !== 'value') {
    diagnostics.push(baseInvalid('expected.kind', 'value', kind.value));
    return undefined;
  }
  if (kind.value === 'missing') return Object.freeze({ kind: 'missing' });
  const expectedValue = ownMember(entry.value, 'value');
  if (expectedValue.kind !== 'value') {
    diagnostics.push(
      baseInvalidDescriptor(
        'expected.value',
        'own data property',
        expectedValue.kind,
      ),
    );
    return undefined;
  }
  return Object.freeze({ kind: 'value', value: expectedValue.value });
}

function validateMetadata(entry: Member, diagnostics: Diagnostic[]): void {
  if (entry.kind !== 'value') {
    diagnostics.push(
      baseInvalidDescriptor('metadata', 'metadata object', entry.kind),
    );
    return;
  }
  if (!isObject(entry.value)) {
    diagnostics.push(baseInvalid('metadata', 'metadata object', entry.value));
    return;
  }
  const id = ownMember(entry.value, 'id');
  if (id.kind !== 'value')
    diagnostics.push(
      baseInvalidDescriptor('metadata.id', 'integer >= 1', id.kind),
    );
  else if (
    typeof id.value !== 'number' ||
    !Number.isInteger(id.value) ||
    id.value < 1
  )
    diagnostics.push(baseInvalid('metadata.id', 'integer >= 1', id.value));
  const formId = ownMember(entry.value, 'formId');
  if (formId.kind !== 'value')
    diagnostics.push(
      baseInvalidDescriptor('metadata.formId', 'non-empty string', formId.kind),
    );
  else if (typeof formId.value !== 'string' || formId.value.length === 0)
    diagnostics.push(
      baseInvalid('metadata.formId', 'non-empty string', formId.value),
    );
}

function validateLiteral(
  object: object,
  key: string,
  expected: string,
  diagnostics: Diagnostic[],
): void {
  const entry = ownMember(object, key);
  if (entry.kind !== 'value')
    diagnostics.push(baseInvalidDescriptor(key, expected, entry.kind));
  else if (entry.value !== expected)
    diagnostics.push(baseInvalid(key, expected, entry.value));
}

function findManagedCollection(
  definition: object,
  path: readonly string[],
): ManagedCollection | undefined {
  const nodes = readOwnDataMember(definition, 'nodes');
  if (nodes.kind !== 'value' || !Array.isArray(nodes.value)) return undefined;
  const stack: unknown[] = [];
  for (let index = nodes.value.length - 1; index >= 0; index -= 1) {
    const entry = readOwnDataMember(nodes.value, String(index));
    if (entry.kind === 'value') stack.push(entry.value);
  }
  while (stack.length > 0) {
    const node = stack.pop();
    if (!isOrdinaryObject(node)) continue;
    const kind = readOwnDataMember(node, 'kind');
    const nodePath = readOwnDataMember(node, 'path');
    const copied =
      nodePath.kind === 'value'
        ? copyStringDataPath(nodePath.value)
        : undefined;
    if (
      kind.kind === 'value' &&
      kind.value === 'array' &&
      copied !== undefined &&
      canonicalDataPathKey(copied) === canonicalDataPathKey(path)
    ) {
      const identity = readOwnDataMember(node, 'identity');
      const property =
        identity.kind === 'value' && isOrdinaryObject(identity.value)
          ? readOwnDataMember(identity.value, 'property')
          : { kind: 'missing' as const };
      const item = readOwnDataMember(node, 'item');
      const fields = new Map<string, ManagedTemplateField>();
      if (item.kind === 'value' && isOrdinaryObject(item.value)) {
        const projected = readOwnDataMember(item.value, 'fields');
        if (projected.kind === 'value' && Array.isArray(projected.value)) {
          for (let index = 0; index < projected.value.length; index += 1) {
            const entry = readOwnDataMember(projected.value, String(index));
            if (entry.kind !== 'value') continue;
            const field = entry.value;
            if (!isOrdinaryObject(field)) continue;
            const relative = readOwnDataMember(field, 'relativePath');
            const fieldPath =
              relative.kind === 'value'
                ? copyStringDataPath(relative.value, true)
                : undefined;
            const fieldKind = readOwnDataMember(field, 'kind');
            if (fieldPath === undefined || fieldKind.kind !== 'value') continue;
            let fieldType: ManagedTemplateField['type'] | undefined;
            if (fieldKind.value === 'string' || fieldKind.value === 'boolean')
              fieldType = fieldKind.value;
            else if (fieldKind.value === 'number') {
              const numeric = readOwnDataMember(field, 'numericType');
              if (
                numeric.kind === 'value' &&
                (numeric.value === 'number' || numeric.value === 'integer')
              )
                fieldType = numeric.value;
            }
            if (fieldType !== undefined) {
              const nullable = readOwnDataMember(field, 'nullable');
              fields.set(canonicalDataPathKey(fieldPath), {
                name: fieldPath.at(-1) as string,
                type: fieldType,
                nullable: nullable.kind === 'value' && nullable.value === true,
              });
            }
          }
        }
      }
      return property.kind === 'value' && typeof property.value === 'string'
        ? { identityProperty: property.value, fields }
        : undefined;
    }
    if (kind.kind === 'value' && kind.value === 'object') {
      const children = readOwnDataMember(node, 'children');
      if (children.kind === 'value' && Array.isArray(children.value)) {
        for (let index = children.value.length - 1; index >= 0; index -= 1) {
          const entry = readOwnDataMember(children.value, String(index));
          if (entry.kind === 'value') stack.push(entry.value);
        }
      }
    }
  }
  return undefined;
}

type CollectionTraversal =
  | {
      readonly success: true;
      readonly parents: readonly object[];
      readonly present: boolean;
      readonly collection?: unknown;
    }
  | { readonly success: false; readonly diagnostic: Diagnostic };

function traverseCollection(
  root: object,
  path: readonly string[],
  materialize: boolean,
): CollectionTraversal {
  const parents: object[] = [root];
  let parent = root;
  for (let index = 0; index < path.length - 1; index += 1) {
    const property = path[index] as string;
    const prefix = path.slice(0, index + 1);
    const entry = readOwnDataMember(parent, property);
    if (entry.kind === 'accessor')
      return {
        success: false,
        diagnostic: unsupportedProperty(property, prefix),
      };
    if (entry.kind === 'missing') {
      if (!materialize) return { success: true, parents, present: false };
      const created = {};
      parents.push(created);
      parent = created;
      continue;
    }
    if (!isOrdinaryObject(entry.value))
      return {
        success: false,
        diagnostic: runtimeDiagnostic(
          'INCOMPATIBLE_OPERATION_ANCESTOR',
          {
            reason: 'non-object-ancestor',
            actualType: actualType(entry.value),
          },
          'Operation ancestor is not an ordinary object.',
          prefix,
        ),
      };
    parents.push(entry.value);
    parent = entry.value;
  }
  const terminal = path.at(-1) as string;
  const entry = readOwnDataMember(parent, terminal);
  if (entry.kind === 'accessor')
    return { success: false, diagnostic: unsupportedProperty(terminal, path) };
  return {
    success: true,
    parents,
    present: entry.kind === 'value',
    ...(entry.kind === 'value' ? { collection: entry.value } : {}),
  };
}

function scanIdentities(
  collection: readonly unknown[],
  operation: ParsedCollectionOperation,
):
  | { readonly success: true; readonly indices: ReadonlyMap<string, number> }
  | { readonly success: false; readonly diagnostic: Diagnostic } {
  const indices = new Map<string, number>();
  for (let index = 0; index < collection.length; index += 1) {
    const slot = readOwnDataMember(collection, String(index));
    if (slot.kind !== 'value' || !isOrdinaryObject(slot.value))
      return {
        success: false,
        diagnostic: stale(operation, 'invalid-identity'),
      };
    const identity = readOwnDataMember(slot.value, operation.identityProperty);
    if (
      identity.kind !== 'value' ||
      typeof identity.value !== 'string' ||
      identity.value.trim().length === 0
    )
      return {
        success: false,
        diagnostic: stale(operation, 'invalid-identity'),
      };
    if (indices.has(identity.value))
      return {
        success: false,
        diagnostic: stale(operation, 'duplicate-identity'),
      };
    indices.set(identity.value, index);
  }
  return { success: true, indices };
}

function validateInsertedItem(
  operation: Extract<ParsedCollectionOperation, { type: 'insert-item' }>,
): Diagnostic | undefined {
  if (!isOrdinaryObject(operation.item))
    return incompatible(operation, 'item-not-object', operation.item);
  const identity = readOwnDataMember(
    operation.item,
    operation.identityProperty,
  );
  if (identity.kind !== 'value' || identity.value !== operation.itemId)
    return incompatible(
      operation,
      'item-identity-mismatch',
      identity.kind === 'value' ? identity.value : undefined,
      operation.identityProperty,
    );
  return undefined;
}

function resolvePlacement(
  operation: Extract<
    ParsedCollectionOperation,
    { type: 'insert-item' | 'move-item' }
  >,
  indices: ReadonlyMap<string, number>,
  length: number,
): number | Diagnostic {
  const placement = operation.placement;
  if (placement.kind === 'start') return 0;
  if (placement.kind === 'end') return length;
  const anchor = indices.get(placement.itemId);
  if (anchor === undefined)
    return stale(operation, 'anchor-not-found', placement.itemId);
  return placement.kind === 'before' ? anchor : anchor + 1;
}

type LeafTraversal =
  | {
      readonly success: true;
      readonly parents: readonly object[];
      readonly present: boolean;
      readonly actual: unknown;
    }
  | { readonly success: false; readonly diagnostic: Diagnostic };

function traverseLeaf(
  item: object,
  relativePath: readonly string[],
  index: number,
  collectionPath: readonly string[],
): LeafTraversal {
  const parents: object[] = [item];
  let parent = item;
  for (let offset = 0; offset < relativePath.length - 1; offset += 1) {
    const property = relativePath[offset] as string;
    const prefix = [
      ...collectionPath,
      index,
      ...relativePath.slice(0, offset + 1),
    ];
    const entry = readOwnDataMember(parent, property);
    if (entry.kind === 'accessor')
      return {
        success: false,
        diagnostic: unsupportedProperty(property, prefix),
      };
    if (entry.kind === 'missing') {
      const created = {};
      parents.push(created);
      parent = created;
      continue;
    }
    if (!isOrdinaryObject(entry.value))
      return {
        success: false,
        diagnostic: runtimeDiagnostic(
          'INCOMPATIBLE_OPERATION_ANCESTOR',
          {
            reason: 'non-object-ancestor',
            actualType: actualType(entry.value),
          },
          'Operation ancestor is not an ordinary object.',
          prefix,
        ),
      };
    parents.push(entry.value);
    parent = entry.value;
  }
  const terminal = relativePath.at(-1) as string;
  const entry = readOwnDataMember(parent, terminal);
  if (entry.kind === 'accessor')
    return {
      success: false,
      diagnostic: unsupportedProperty(terminal, [
        ...collectionPath,
        index,
        ...relativePath,
      ]),
    };
  return {
    success: true,
    parents,
    present: entry.kind === 'value',
    actual: entry.kind === 'value' ? entry.value : undefined,
  };
}

function rebuildLeaf(
  parents: readonly object[],
  path: readonly string[],
  value: unknown,
  remove: boolean,
): object {
  const terminal = path.length - 1;
  let next = remove
    ? cloneWithout(parents[terminal] as object, path[terminal] as string)
    : cloneWithSet(
        parents[terminal] as object,
        path[terminal] as string,
        value,
      );
  for (let index = terminal - 1; index >= 0; index -= 1)
    next = cloneWithSet(parents[index] as object, path[index] as string, next);
  return next;
}

function rebuildCollection(
  traversal: Extract<CollectionTraversal, { success: true }>,
  path: readonly string[],
  collection: readonly unknown[],
): object {
  const terminal = path.length - 1;
  let next = cloneWithSet(
    traversal.parents[terminal] as object,
    path[terminal] as string,
    collection,
  );
  for (let index = terminal - 1; index >= 0; index -= 1)
    next = cloneWithSet(
      traversal.parents[index] as object,
      path[index] as string,
      next,
    );
  return next;
}

function replaceArrayItem(
  value: readonly unknown[],
  index: number,
  item: unknown,
): unknown[] {
  const result = spliceArray(value, index, 1, item);
  return result;
}

function spliceArray(
  value: readonly unknown[],
  start: number,
  deleteCount: number,
  item?: unknown,
): unknown[] {
  const inserting = arguments.length === 4;
  const nextLength = value.length - deleteCount + (inserting ? 1 : 0);
  const result = new Array<unknown>(nextLength);
  for (let targetIndex = 0; targetIndex < nextLength; targetIndex += 1) {
    if (inserting && targetIndex === start) {
      Object.defineProperty(result, String(targetIndex), {
        value: item,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      continue;
    }
    const sourceIndex =
      targetIndex < start
        ? targetIndex
        : targetIndex - (inserting ? 1 : 0) + deleteCount;
    const descriptor = Object.getOwnPropertyDescriptor(
      value,
      String(sourceIndex),
    );
    if (descriptor !== undefined) {
      Object.defineProperty(result, String(targetIndex), descriptor);
    }
  }
  copyArrayProperties(value, result);
  return result;
}

function copyArrayProperties(
  source: readonly unknown[],
  target: unknown[],
): void {
  for (const key of Reflect.ownKeys(source)) {
    if (key === 'length' || (typeof key === 'string' && isArrayIndex(key)))
      continue;
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor !== undefined)
      Object.defineProperty(target, key, descriptor);
  }
}

function isArrayIndex(key: string): boolean {
  if (!/^(0|[1-9]\d*)$/.test(key)) return false;
  const index = Number(key);
  return index >= 0 && index < 4_294_967_295 && String(index) === key;
}

function cloneWithSet(
  value: object,
  property: string,
  nextValue: unknown,
): object {
  const next = cloneWithout(value, property);
  Object.defineProperty(next, property, {
    value: nextValue,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  return next;
}

function cloneWithout(value: object, omitted: string): object {
  const next = Object.create(Reflect.getPrototypeOf(value)) as object;
  for (const key of Reflect.ownKeys(value)) {
    if (key === omitted) continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor !== undefined) Object.defineProperty(next, key, descriptor);
  }
  return next;
}

function incompatibleLeaf(
  operation: Extract<LeafOperation, { type: 'set-item-value' }>,
  field: ManagedTemplateField,
  dataPath: readonly (string | number)[],
): Diagnostic | undefined {
  const value = operation.value;
  const compatible =
    (field.nullable && value === null) ||
    (field.type === 'string' && typeof value === 'string') ||
    (field.type === 'boolean' && typeof value === 'boolean') ||
    (field.type === 'number' &&
      typeof value === 'number' &&
      Number.isFinite(value)) ||
    (field.type === 'integer' &&
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Number.isInteger(value));
  return compatible
    ? undefined
    : runtimeDiagnostic(
        'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
        {
          operationType: operation.type,
          reason: 'leaf-type',
          actualType: actualType(value),
          field: field.name,
          fieldType: field.type,
        },
        'Collection operation value is incompatible.',
        dataPath,
      );
}

function incompatible(
  operation: ParsedCollectionOperation,
  reason: 'collection-not-array' | 'item-not-object' | 'item-identity-mismatch',
  value: unknown,
  identityProperty?: string,
): Diagnostic {
  return runtimeDiagnostic(
    'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
    {
      operationType: operation.type,
      reason,
      actualType: actualType(value),
      ...(identityProperty === undefined ? {} : { identityProperty }),
    },
    'Collection operation value is incompatible.',
    operation.collectionPath,
  );
}

function notManaged(operation: ParsedCollectionOperation): Diagnostic {
  return runtimeDiagnostic(
    'COLLECTION_PATH_NOT_MANAGED',
    {
      operationType: operation.type,
      collectionPath: [...operation.collectionPath],
      ...(isLeafOperation(operation)
        ? { relativePath: [...operation.relativePath] }
        : {}),
    },
    'Collection operation path is not managed.',
    operation.collectionPath,
  );
}

function stale(
  operation: ParsedCollectionOperation,
  reason:
    | 'collection-missing'
    | 'item-not-found'
    | 'anchor-not-found'
    | 'item-id-already-exists'
    | 'duplicate-identity'
    | 'invalid-identity',
  anchorItemId?: string,
): Diagnostic {
  return runtimeDiagnostic(
    'STALE_COLLECTION_OPERATION',
    {
      operationType: operation.type,
      reason,
      itemId: operation.itemId,
      ...(anchorItemId === undefined ? {} : { anchorItemId }),
    },
    'Collection operation target is stale.',
    operation.collectionPath,
  );
}

function expectationMatches(
  expectation: Expectation,
  present: boolean,
  actual: unknown,
): boolean {
  return expectation.kind === 'missing'
    ? !present
    : present && Object.is(expectation.value, actual);
}

function staleLeaf(
  expectation: Expectation,
  present: boolean,
  actual: unknown,
  path: readonly (string | number)[],
): Diagnostic {
  const parameters: Record<string, unknown> = {
    expectedKind: expectation.kind,
    actualKind: present ? 'value' : 'missing',
  };
  if (expectation.kind === 'value')
    Object.assign(parameters, describeSide('expected', expectation.value));
  if (present) Object.assign(parameters, describeSide('actual', actual));
  return runtimeDiagnostic(
    'STALE_OPERATION',
    parameters,
    'Operation expectation does not match current data.',
    path,
  );
}

function describeSide(
  prefix: 'expected' | 'actual',
  value: unknown,
): Record<string, unknown> {
  const description = describeActualValue(value);
  return {
    [`${prefix}Type`]: description.actualType,
    ...(Object.hasOwn(description, 'actualValue')
      ? { [`${prefix}Value`]: description.actualValue }
      : {}),
  };
}

function invalidCollection(
  type: CollectionOperationType,
  memberName: string,
  expected: string,
  reason:
    | 'missing-member'
    | 'accessor-member'
    | 'invalid-value'
    | 'identity-property-mismatch'
    | 'identity-target-not-editable'
    | 'self-anchor',
  path?: readonly string[],
  value?: unknown,
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_COLLECTION_OPERATION',
    {
      operationType: type,
      member: memberName,
      expected,
      reason,
      ...(reason === 'invalid-value' ? { actualType: actualType(value) } : {}),
    },
    'Collection operation is invalid.',
    path,
  );
}

function baseInvalidDescriptor(
  memberName: string,
  expected: string,
  kind: 'missing' | 'accessor',
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_OPERATION',
    { member: memberName, expected, reason: descriptorReason(kind) },
    `Operation member "${memberName}" is invalid.`,
  );
}
function baseInvalid(
  memberName: string,
  expected: string,
  value: unknown,
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_OPERATION',
    {
      member: memberName,
      expected,
      reason: 'invalid-value',
      ...describeActualValue(value),
    },
    `Operation member "${memberName}" is invalid.`,
  );
}
function descriptorReason(
  kind: 'missing' | 'accessor',
): 'missing-member' | 'accessor-member' {
  return kind === 'missing' ? 'missing-member' : 'accessor-member';
}

function definitionDiagnostic(
  defect: NestedDefinitionDefect,
  path: readonly string[],
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_FORM_DEFINITION',
    {
      reason: defect.reason,
      ...(defect.nodeIndexPath === undefined
        ? {}
        : { nodeIndexPath: [...defect.nodeIndexPath] }),
      ...(defect.firstNodeIndexPath === undefined
        ? {}
        : { firstNodeIndexPath: [...defect.firstNodeIndexPath] }),
      ...(defect.templateIndexPath === undefined
        ? {}
        : { templateIndexPath: [...defect.templateIndexPath] }),
      ...(defect.firstTemplateIndexPath === undefined
        ? {}
        : { firstTemplateIndexPath: [...defect.firstTemplateIndexPath] }),
      ...(defect.fieldIndex === undefined
        ? {}
        : { fieldIndex: defect.fieldIndex }),
      ...(defect.path === undefined ? {} : { path: [...defect.path] }),
      ...(defect.relativePath === undefined
        ? {}
        : { relativePath: [...defect.relativePath] }),
      ...(defect.presentationIndexPath === undefined
        ? {}
        : { presentationIndexPath: [...defect.presentationIndexPath] }),
      ...(defect.presentationOwnerKind === undefined
        ? {}
        : { presentationOwnerKind: defect.presentationOwnerKind }),
      ...(defect.presentationOwnerPath === undefined
        ? {}
        : { presentationOwnerPath: [...defect.presentationOwnerPath] }),
      ...(defect.presentationTemplatePath === undefined
        ? {}
        : {
            presentationTemplatePath: [...defect.presentationTemplatePath],
          }),
      ...(defect.member === undefined ? {} : { member: defect.member }),
      ...(defect.expected === undefined ? {} : { expected: defect.expected }),
      ...(defect.actualType === undefined
        ? {}
        : { actualType: defect.actualType }),
      ...(Object.hasOwn(defect, 'actualValue')
        ? { actualValue: defect.actualValue }
        : {}),
      ...(defect.members === undefined ? {} : { members: [...defect.members] }),
    },
    'Form definition is invalid.',
    path,
  );
}

function unsupportedProperty(
  property: string,
  path: readonly (string | number)[],
): Diagnostic {
  return runtimeDiagnostic(
    'UNSUPPORTED_OPERATION_PROPERTY',
    { property, reason: 'accessor-property' },
    'Accessor properties cannot be operation targets.',
    path,
  );
}

function runtimeDiagnostic(
  code: string,
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
  dataPath?: readonly (string | number)[],
): Diagnostic {
  const copied = { ...parameters };
  for (const value of Object.values(copied))
    if (Array.isArray(value)) Object.freeze(value);
  Object.freeze(copied);
  const result = diagnostic({
    code,
    severity: 'error',
    source: 'runtime',
    ...(dataPath === undefined ? {} : { dataPath }),
    parameters: copied,
    fallbackMessage,
  });
  if (result.dataPath !== undefined) Object.freeze(result.dataPath);
  return Object.freeze(result);
}

function ownMember(object: object, key: PropertyKey): Member {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (descriptor === undefined) return { kind: 'missing' };
  return 'value' in descriptor
    ? { kind: 'value', value: descriptor.value }
    : { kind: 'accessor' };
}
function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isLeafOperation(
  operation: ParsedCollectionOperation,
): operation is LeafOperation {
  return (
    operation.type === 'set-item-value' ||
    operation.type === 'remove-item-value'
  );
}
function failure<TData extends object>(
  value: Readonly<TData>,
  diagnostics: readonly Diagnostic[],
): ApplyOperationResult<TData> {
  return Object.freeze({
    success: false,
    value,
    changed: false,
    diagnostics: Object.freeze([...diagnostics]),
  });
}
function success<TData extends object>(
  value: Readonly<TData>,
  changed: boolean,
): ApplyOperationResult<TData> {
  return Object.freeze({
    success: true,
    value,
    changed,
    diagnostics: EMPTY_DIAGNOSTICS,
  });
}
