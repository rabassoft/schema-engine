// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  ArrayNodeDefinition,
  ArrayPresence,
  ArrayRuntimeSnapshot,
  CollectionIdentityState,
  DataPath,
  Diagnostic,
  FieldPresence,
  FieldRuntimeSnapshot,
  FieldTemplate,
  FormNodeDefinition,
  ItemRuntimeSnapshot,
  FormNodeTemplate,
  NodeRuntimeSnapshot,
  ObjectPresence,
  ValidationIssue,
} from '../contracts.js';
import {
  canonicalInstanceNodeKey,
  canonicalItemKey,
} from './collection-address.js';
import { diagnostic } from './diagnostics.js';
import { isOrdinaryObject, readOwnDataMember } from './path.js';

export type CollectionIdentityDefectReason = Exclude<
  Extract<CollectionIdentityState, { readonly kind: 'invalid' }>['reason'],
  never
>;

export interface CollectionIdentityDefect {
  readonly reason: CollectionIdentityDefectReason;
  readonly index: number;
  readonly firstIndex?: number;
}

export interface CollectionIdentityInspection {
  readonly state: CollectionIdentityState;
  readonly defects: readonly CollectionIdentityDefect[];
  readonly ids: readonly string[];
  readonly items: readonly object[];
}

export interface InspectedCollection {
  readonly definition: ArrayNodeDefinition;
  readonly inspection: CollectionValueInspection;
}

export type CollectionValueInspection =
  | {
      readonly success: true;
      readonly presence: ArrayPresence;
      readonly identity: CollectionIdentityInspection;
      readonly value?: readonly unknown[];
      readonly unavailableValue?: unknown;
    }
  | {
      readonly success: false;
      readonly accessorPath: DataPath;
    };

const VALID_IDENTITY: CollectionIdentityInspection = Object.freeze({
  state: Object.freeze({ kind: 'valid' }),
  defects: Object.freeze([]),
  ids: Object.freeze([]),
  items: Object.freeze([]),
});

export function inspectCollectionValue(
  root: object,
  path: readonly string[],
  identityProperty: string,
): CollectionValueInspection {
  let current = root;
  for (let index = 0; index < path.length; index += 1) {
    const property = path[index] as string;
    const prefix = Object.freeze(path.slice(0, index + 1));
    const entry = readOwnDataMember(current, property);
    if (entry.kind === 'accessor') {
      return Object.freeze({ success: false, accessorPath: prefix });
    }
    const terminal = index === path.length - 1;
    if (entry.kind === 'missing') {
      return terminal
        ? successful(Object.freeze({ kind: 'missing' }))
        : successful(
            Object.freeze({
              kind: 'blocked',
              reason: 'missing-ancestor',
              at: prefix,
            }),
          );
    }
    if (terminal) {
      if (!Array.isArray(entry.value)) {
        return successful(
          Object.freeze({ kind: 'incompatible', value: entry.value }),
        );
      }
      return Object.freeze({
        success: true,
        presence: Object.freeze({ kind: 'array' }),
        identity: inspectCollectionIdentity(entry.value, identityProperty),
        value: entry.value,
      });
    }
    if (!isOrdinaryObject(entry.value)) {
      return successful(
        Object.freeze({
          kind: 'blocked',
          reason: 'incompatible-ancestor',
          at: prefix,
        }),
        entry.value,
      );
    }
    current = entry.value;
  }
  return successful(Object.freeze({ kind: 'missing' }));
}

export function inspectDefinedCollections(
  root: object,
  definitions: readonly FormNodeDefinition[],
): readonly InspectedCollection[] {
  const result: InspectedCollection[] = [];
  for (const node of collectionDefinitions(definitions)) {
    result.push(
      Object.freeze({
        definition: node,
        inspection: inspectCollectionValue(
          root,
          node.path as readonly string[],
          node.identity.property,
        ),
      }),
    );
  }
  return Object.freeze(result);
}

function collectionDefinitions(
  definitions: readonly FormNodeDefinition[],
): readonly ArrayNodeDefinition[] {
  const result: ArrayNodeDefinition[] = [];
  const stack: FormNodeDefinition[] = [];
  for (let index = definitions.length - 1; index >= 0; index -= 1) {
    stack.push(definitions[index] as FormNodeDefinition);
  }
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    if (node.kind === 'array') {
      result.push(node);
      continue;
    }
    if (node.kind === 'object') {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        stack.push(node.children[index] as FormNodeDefinition);
      }
    }
  }
  return Object.freeze(result);
}

export function firstManagedCollectionAccessor(
  root: object,
  definitions: readonly FormNodeDefinition[],
): DataPath | undefined {
  for (const definition of collectionDefinitions(definitions)) {
    const inspection = inspectCollectionValue(
      root,
      definition.path as readonly string[],
      definition.identity.property,
    );
    if (!inspection.success) return inspection.accessorPath;
    if (
      inspection.presence.kind !== 'array' ||
      inspection.identity.state.kind !== 'valid'
    ) {
      continue;
    }
    const items: readonly object[] = inspection.identity.items;
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index] as object;
      const accessor = firstTemplateAccessor(
        item,
        definition.item.children,
        definition.path,
        index,
      );
      if (accessor !== undefined) return accessor;
    }
  }
  return undefined;
}

export function firstManagedDataAccessor(
  root: object,
  definitions: readonly FormNodeDefinition[],
): DataPath | undefined {
  const stack: Array<{
    readonly parent: object;
    readonly node: FormNodeDefinition;
  }> = [];
  for (let index = definitions.length - 1; index >= 0; index -= 1) {
    stack.push({
      parent: root,
      node: definitions[index] as FormNodeDefinition,
    });
  }
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    const entry = readOwnDataMember(frame.parent, frame.node.name);
    if (entry.kind === 'accessor') return frame.node.path;
    if (
      frame.node.kind === 'object' &&
      entry.kind === 'value' &&
      isOrdinaryObject(entry.value)
    ) {
      for (let child = frame.node.children.length - 1; child >= 0; child -= 1) {
        stack.push({
          parent: entry.value,
          node: frame.node.children[child] as FormNodeDefinition,
        });
      }
      continue;
    }
    if (
      frame.node.kind !== 'array' ||
      entry.kind !== 'value' ||
      !Array.isArray(entry.value)
    ) {
      continue;
    }
    const identity = inspectCollectionIdentity(
      entry.value,
      frame.node.identity.property,
    );
    if (identity.state.kind !== 'valid') continue;
    for (let index = 0; index < identity.items.length; index += 1) {
      const accessor = firstTemplateAccessor(
        identity.items[index] as object,
        frame.node.item.children,
        frame.node.path,
        index,
      );
      if (accessor !== undefined) return accessor;
    }
  }
  return undefined;
}

export function collectionIdentityDiagnostics(
  collection: ArrayNodeDefinition,
  inspection: CollectionIdentityInspection,
): readonly Diagnostic[] {
  return Object.freeze(
    inspection.defects.map((defect) => {
      const parameters = Object.freeze({
        reason: defect.reason,
        index: defect.index,
        identityProperty: collection.identity.property,
        ...(defect.firstIndex === undefined
          ? {}
          : { firstIndex: defect.firstIndex }),
      });
      const result = diagnostic({
        code: 'INVALID_COLLECTION_IDENTITY',
        severity: 'error',
        source: 'runtime',
        dataPath: collection.path,
        parameters,
        fallbackMessage: 'Collection item identity is invalid.',
      });
      Object.freeze(result.dataPath);
      Object.freeze(result.parameters);
      return Object.freeze(result);
    }),
  );
}

export function buildCollectionSnapshotShell(
  definition: ArrayNodeDefinition,
  current: CollectionValueInspection,
  baseline: CollectionValueInspection,
  issues: readonly ValidationIssue[] = Object.freeze([]),
  previous?: ArrayRuntimeSnapshot,
  touched: ReadonlySet<string> = new Set(),
  focused?: string,
  showAll = false,
  forced: ReadonlySet<string> = new Set(),
): ArrayRuntimeSnapshot | undefined {
  if (!current.success || !baseline.success) return undefined;
  const addressable =
    current.presence.kind === 'array' &&
    current.identity.state.kind === 'valid';
  const previousItems = new Map(
    (previous?.items ?? []).map((item) => [item.address.itemId, item]),
  );
  const items: ItemRuntimeSnapshot[] = [];
  if (addressable) {
    const baselineById = new Map<string, object>();
    if (
      baseline.presence.kind === 'array' &&
      baseline.identity.state.kind === 'valid'
    ) {
      for (let index = 0; index < baseline.identity.ids.length; index += 1) {
        baselineById.set(
          baseline.identity.ids[index] as string,
          baseline.identity.items[index] as object,
        );
      }
    }
    for (let index = 0; index < current.identity.ids.length; index += 1) {
      const itemId = current.identity.ids[index] as string;
      const prior = previousItems.get(itemId);
      const candidate = buildItemSnapshot(
        definition,
        current.identity.items[index] as object,
        baselineById.get(itemId),
        itemId,
        index,
        issues,
        touched,
        focused,
        showAll,
        forced,
        prior,
      );
      items.push(candidate);
    }
  }
  const structuralDirty = collectionShellDirty(current, baseline);
  const frozenItems = Object.freeze(items);
  const ownIssues = collectionOwnIssues(definition, current, issues);
  const collectionTouched = items.some((item) => item.touched);
  const candidate: ArrayRuntimeSnapshot = Object.freeze({
    nodeKind: 'array',
    key: definition.key,
    path: Object.freeze([...(definition.path as string[])]),
    presence: current.presence,
    identityState: current.identity.state,
    dirty: structuralDirty || items.some((item) => item.dirty),
    touched: collectionTouched,
    focused: items.some((item) => item.focused),
    valid:
      ownIssues.length === 0 &&
      current.identity.state.kind === 'valid' &&
      items.every((item) => item.valid),
    issues: ownIssues,
    showIssues:
      ownIssues.length > 0 &&
      (showAll || collectionTouched || forced.has(definition.key)),
    items: frozenItems,
  });
  return previous !== undefined && sameCollectionShell(previous, candidate)
    ? previous
    : candidate;
}

function collectionOwnIssues(
  definition: ArrayNodeDefinition,
  current: Extract<CollectionValueInspection, { readonly success: true }>,
  issues: readonly ValidationIssue[],
): readonly ValidationIssue[] {
  const path = definition.path;
  const length = current.identity.ids.length;
  return Object.freeze(
    issues.filter((issue) => {
      if (samePath(issue.path, path)) return true;
      if (!startsWithPath(issue.path, path)) return false;
      if (current.identity.state.kind === 'invalid') return true;
      const index = issue.path[path.length];
      return typeof index !== 'number' || index < 0 || index >= length;
    }),
  );
}

export function buildItemFieldSnapshots(
  collection: ArrayNodeDefinition,
  item: object,
  baselineItem: object | undefined,
  itemId: string,
  index: number,
  issues: readonly ValidationIssue[] = Object.freeze([]),
  touched: ReadonlySet<string> = new Set(),
  focused?: string,
  showAll = false,
  forced: ReadonlySet<string> = new Set(),
  previous?: ItemRuntimeSnapshot,
): readonly FieldRuntimeSnapshot[] {
  const previousByKey = new Map(
    (previous?.fields ?? []).map((field) => [field.key, field]),
  );
  return Object.freeze(
    collection.item.fields.map((field) => {
      const key = canonicalInstanceNodeKey(
        collection.path as readonly string[],
        itemId,
        field.relativePath,
      );
      const path = Object.freeze([
        ...collection.path,
        index,
        ...field.relativePath,
      ]);
      const positionalPrefix = [...collection.path, index];
      const presence = resolveTemplateFieldPresence(
        item,
        field,
        positionalPrefix,
      );
      const baselinePresence =
        baselineItem === undefined
          ? undefined
          : resolveTemplateFieldPresence(baselineItem, field, positionalPrefix);
      const ownIssues = Object.freeze(
        issues.filter(
          (issue) =>
            assignedItemTemplateKey(collection, issue.path, index, itemId) ===
            key,
        ),
      );
      const isTouched = touched.has(key);
      const candidate: FieldRuntimeSnapshot = Object.freeze({
        nodeKind: 'field',
        key,
        path,
        presence,
        dirty:
          baselinePresence === undefined
            ? false
            : fieldPresenceDirty(presence, baselinePresence),
        touched: isTouched,
        focused: focused === key,
        valid: ownIssues.length === 0,
        issues: ownIssues,
        showIssues:
          ownIssues.length > 0 && (showAll || isTouched || forced.has(key)),
      });
      const prior = previousByKey.get(key);
      return prior !== undefined && sameFieldSnapshot(prior, candidate)
        ? prior
        : candidate;
    }),
  );
}

export function buildItemSnapshot(
  collection: ArrayNodeDefinition,
  item: object,
  baselineItem: object | undefined,
  itemId: string,
  index: number,
  issues: readonly ValidationIssue[] = Object.freeze([]),
  touched: ReadonlySet<string> = new Set(),
  focused?: string,
  showAll = false,
  forced: ReadonlySet<string> = new Set(),
  previous?: ItemRuntimeSnapshot,
): ItemRuntimeSnapshot {
  const fields = buildItemFieldSnapshots(
    collection,
    item,
    baselineItem,
    itemId,
    index,
    issues,
    touched,
    focused,
    showAll,
    forced,
    previous,
  );
  const fieldsByKey = new Map(fields.map((field) => [field.key, field]));
  const children = buildTemplateSnapshots(
    collection,
    collection.item.children,
    item,
    baselineItem,
    itemId,
    index,
    issues,
    fieldsByKey,
    showAll,
    forced,
    previous,
  );
  const dataPath = Object.freeze([...collection.path, index]);
  const ownIssues = Object.freeze(
    issues.filter(
      (issue) =>
        assignedItemTemplateKey(collection, issue.path, index, itemId) ===
        undefined,
    ),
  );
  const address = Object.freeze({
    collectionPath: Object.freeze([...(collection.path as string[])]),
    itemId,
  });
  const itemTouched = children.some((child) => child.touched);
  const candidate: ItemRuntimeSnapshot = Object.freeze({
    nodeKind: 'item',
    key: canonicalItemKey(address.collectionPath, itemId),
    address,
    index,
    dataPath,
    dirty: children.some((child) => child.dirty),
    touched: itemTouched,
    focused: children.some((child) => child.focused),
    valid: ownIssues.length === 0 && children.every((child) => child.valid),
    issues: ownIssues,
    showIssues:
      ownIssues.length > 0 &&
      (showAll ||
        itemTouched ||
        forced.has(canonicalItemKey(address.collectionPath, itemId))),
    children,
    fields,
  });
  return previous !== undefined && sameItemSnapshot(previous, candidate)
    ? previous
    : candidate;
}

export function inspectCollectionIdentity(
  value: readonly unknown[],
  identityProperty: string,
): CollectionIdentityInspection {
  const defects: CollectionIdentityDefect[] = [];
  const ids: string[] = [];
  const items: object[] = [];
  const firstById = new Map<string, number>();

  for (let index = 0; index < value.length; index += 1) {
    const slot = readOwnDataMember(value, String(index));
    if (slot.kind === 'missing') {
      defects.push(freezeDefect('sparse-item', index));
      continue;
    }
    if (slot.kind !== 'value' || !isOrdinaryObject(slot.value)) {
      defects.push(freezeDefect('non-object-item', index));
      continue;
    }
    const item = slot.value;
    const identity = readOwnDataMember(item, identityProperty);
    if (identity.kind === 'missing') {
      defects.push(freezeDefect('missing-identity', index));
      continue;
    }
    if (identity.kind === 'accessor') {
      defects.push(freezeDefect('identity-accessor', index));
      continue;
    }
    if (typeof identity.value !== 'string') {
      defects.push(freezeDefect('non-string-identity', index));
      continue;
    }
    if (identity.value.trim().length === 0) {
      defects.push(freezeDefect('blank-identity', index));
      continue;
    }
    const firstIndex = firstById.get(identity.value);
    if (firstIndex !== undefined) {
      defects.push(freezeDefect('duplicate-identity', index, firstIndex));
      continue;
    }
    firstById.set(identity.value, index);
    ids.push(identity.value);
    items.push(item);
  }

  const first = defects[0];
  const state: CollectionIdentityState =
    first === undefined
      ? Object.freeze({ kind: 'valid' })
      : Object.freeze({
          kind: 'invalid',
          reason: first.reason,
          index: first.index,
          ...(first.firstIndex === undefined
            ? {}
            : { firstIndex: first.firstIndex }),
        });
  return Object.freeze({
    state,
    defects: Object.freeze(defects),
    ids: Object.freeze(ids),
    items: Object.freeze(items),
  });
}

function freezeDefect(
  reason: CollectionIdentityDefectReason,
  index: number,
  firstIndex?: number,
): CollectionIdentityDefect {
  return Object.freeze({
    reason,
    index,
    ...(firstIndex === undefined ? {} : { firstIndex }),
  });
}

function successful(
  presence: ArrayPresence,
  unavailableValue?: unknown,
): CollectionValueInspection {
  return Object.freeze({
    success: true,
    presence,
    identity: VALID_IDENTITY,
    ...(unavailableValue === undefined ? {} : { unavailableValue }),
  });
}

function firstTemplateAccessor(
  item: object,
  templates: readonly FormNodeTemplate[],
  collectionPath: DataPath,
  index: number,
): DataPath | undefined {
  const stack: Array<{
    readonly parent: object;
    readonly template: FormNodeTemplate;
  }> = [];
  for (let child = templates.length - 1; child >= 0; child -= 1) {
    stack.push({
      parent: item,
      template: templates[child] as FormNodeTemplate,
    });
  }
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    const entry = readOwnDataMember(frame.parent, frame.template.name);
    if (entry.kind === 'accessor') {
      return Object.freeze([
        ...collectionPath,
        index,
        ...frame.template.relativePath,
      ]);
    }
    if (
      frame.template.kind === 'object' &&
      entry.kind === 'value' &&
      isOrdinaryObject(entry.value)
    ) {
      for (
        let child = frame.template.children.length - 1;
        child >= 0;
        child -= 1
      ) {
        stack.push({
          parent: entry.value,
          template: frame.template.children[child] as FormNodeTemplate,
        });
      }
    }
  }
  return undefined;
}

function collectionShellDirty(
  current: Extract<CollectionValueInspection, { readonly success: true }>,
  baseline: Extract<CollectionValueInspection, { readonly success: true }>,
): boolean {
  if (
    current.presence.kind === 'array' &&
    baseline.presence.kind === 'array' &&
    current.identity.state.kind === 'valid' &&
    baseline.identity.state.kind === 'valid'
  ) {
    return (
      current.identity.ids.length !== baseline.identity.ids.length ||
      current.identity.ids.some(
        (identity, index) => identity !== baseline.identity.ids[index],
      )
    );
  }
  if (current.presence.kind !== baseline.presence.kind) return true;
  if (
    current.presence.kind === 'incompatible' &&
    baseline.presence.kind === 'incompatible'
  ) {
    return !Object.is(current.presence.value, baseline.presence.value);
  }
  if (current.presence.kind === 'array' && baseline.presence.kind === 'array') {
    return !Object.is(current.value, baseline.value);
  }
  if (
    current.presence.kind === 'blocked' &&
    baseline.presence.kind === 'blocked'
  ) {
    if (
      current.presence.reason !== baseline.presence.reason ||
      !samePath(current.presence.at, baseline.presence.at)
    )
      return true;
    return (
      current.presence.reason === 'incompatible-ancestor' &&
      !Object.is(current.unavailableValue, baseline.unavailableValue)
    );
  }
  return false;
}

function sameCollectionShell(
  left: ArrayRuntimeSnapshot,
  right: ArrayRuntimeSnapshot,
): boolean {
  return (
    left.key === right.key &&
    sameArrayPresence(left.presence, right.presence) &&
    left.identityState.kind === right.identityState.kind &&
    (left.identityState.kind === 'valid' ||
      (right.identityState.kind === 'invalid' &&
        left.identityState.reason === right.identityState.reason &&
        left.identityState.index === right.identityState.index &&
        left.identityState.firstIndex === right.identityState.firstIndex)) &&
    left.dirty === right.dirty &&
    left.touched === right.touched &&
    left.focused === right.focused &&
    left.valid === right.valid &&
    left.showIssues === right.showIssues &&
    left.issues.length === right.issues.length &&
    left.issues.every((issue, index) => issue === right.issues[index]) &&
    left.items.length === right.items.length &&
    left.items.every((item, index) => item === right.items[index])
  );
}

function sameArrayPresence(left: ArrayPresence, right: ArrayPresence): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'missing' || left.kind === 'array') return true;
  if (left.kind === 'incompatible') {
    return right.kind === 'incompatible' && Object.is(left.value, right.value);
  }
  return (
    right.kind === 'blocked' &&
    left.reason === right.reason &&
    left.at.length === right.at.length &&
    left.at.every((segment, index) => segment === right.at[index])
  );
}

function resolveTemplateFieldPresence(
  item: object,
  field: FieldTemplate,
  positionalPrefix: DataPath,
): FieldPresence {
  let current = item;
  for (let index = 0; index < field.relativePath.length; index += 1) {
    const property = field.relativePath[index] as string;
    const entry = readOwnDataMember(current, property);
    if (index === field.relativePath.length - 1) {
      return entry.kind === 'value'
        ? Object.freeze({ kind: 'value', value: entry.value })
        : Object.freeze({ kind: 'missing' });
    }
    const at = Object.freeze([
      ...positionalPrefix,
      ...field.relativePath.slice(0, index + 1),
    ]);
    if (entry.kind === 'missing') {
      return Object.freeze({
        kind: 'blocked',
        reason: 'missing-ancestor',
        at,
      });
    }
    if (entry.kind !== 'value' || !isOrdinaryObject(entry.value)) {
      return Object.freeze({
        kind: 'blocked',
        reason: 'incompatible-ancestor',
        at,
      });
    }
    current = entry.value;
  }
  return Object.freeze({ kind: 'missing' });
}

function fieldPresenceDirty(
  current: FieldPresence,
  baseline: FieldPresence,
): boolean {
  if (current.kind === 'blocked' || baseline.kind === 'blocked') return false;
  if (current.kind !== baseline.kind) return true;
  return (
    current.kind === 'value' &&
    baseline.kind === 'value' &&
    !Object.is(current.value, baseline.value)
  );
}

function samePath(left: DataPath, right: DataPath): boolean {
  return (
    left.length === right.length &&
    left.every((segment, index) => segment === right[index])
  );
}

function assignedItemTemplateKey(
  collection: ArrayNodeDefinition,
  issuePath: DataPath,
  index: number,
  itemId: string,
): string | undefined | null {
  const collectionPath = collection.path;
  if (
    !startsWithPath(issuePath, collectionPath) ||
    issuePath[collectionPath.length] !== index
  ) {
    return null;
  }
  const relativePath = issuePath.slice(collectionPath.length + 1);
  if (
    relativePath.length === 0 ||
    (relativePath.length === 1 &&
      relativePath[0] === collection.identity.property)
  ) {
    return undefined;
  }
  let best: FormNodeTemplate | undefined;
  const stack: FormNodeTemplate[] = [...collection.item.children].reverse();
  while (stack.length > 0) {
    const template = stack.pop();
    if (template === undefined) break;
    if (
      startsWithPath(relativePath, template.relativePath) &&
      (best === undefined ||
        template.relativePath.length > best.relativePath.length)
    ) {
      best = template;
    }
    if (template.kind === 'object') {
      for (let child = template.children.length - 1; child >= 0; child -= 1) {
        stack.push(template.children[child] as FormNodeTemplate);
      }
    }
  }
  return best === undefined
    ? undefined
    : canonicalInstanceNodeKey(
        collection.path as readonly string[],
        itemId,
        best.relativePath,
      );
}

function startsWithPath(path: DataPath, prefix: DataPath): boolean {
  return (
    path.length >= prefix.length &&
    prefix.every((segment, index) => segment === path[index])
  );
}

function sameItemSnapshot(
  left: ItemRuntimeSnapshot,
  right: ItemRuntimeSnapshot,
): boolean {
  return (
    left.key === right.key &&
    left.index === right.index &&
    samePath(left.dataPath, right.dataPath) &&
    left.dirty === right.dirty &&
    left.touched === right.touched &&
    left.focused === right.focused &&
    left.valid === right.valid &&
    left.showIssues === right.showIssues &&
    sameReferences(left.issues, right.issues) &&
    sameTreeLists(left.children, right.children) &&
    left.fields.length === right.fields.length &&
    left.fields.every((field, index) =>
      sameFieldSnapshot(field, right.fields[index] as FieldRuntimeSnapshot),
    )
  );
}

function sameTreeLists(
  left: readonly NodeRuntimeSnapshot[],
  right: readonly NodeRuntimeSnapshot[],
): boolean {
  return (
    left.length === right.length &&
    left.every((node, index) =>
      sameNodeSnapshot(node, right[index] as NodeRuntimeSnapshot),
    )
  );
}

function sameNodeSnapshot(
  left: NodeRuntimeSnapshot,
  right: NodeRuntimeSnapshot,
): boolean {
  if (left.nodeKind !== right.nodeKind) return false;
  if (left.nodeKind === 'field' && right.nodeKind === 'field') {
    return sameFieldSnapshot(left, right);
  }
  if (left.nodeKind !== 'object' || right.nodeKind !== 'object') return false;
  return (
    left.key === right.key &&
    samePath(left.path, right.path) &&
    sameObjectPresence(left.presence, right.presence) &&
    left.dirty === right.dirty &&
    left.touched === right.touched &&
    left.focused === right.focused &&
    left.valid === right.valid &&
    left.showIssues === right.showIssues &&
    sameReferences(left.issues, right.issues) &&
    sameTreeLists(left.children, right.children)
  );
}

function sameFieldSnapshot(
  left: FieldRuntimeSnapshot,
  right: FieldRuntimeSnapshot,
): boolean {
  return (
    left.key === right.key &&
    samePath(left.path, right.path) &&
    sameFieldPresence(left.presence, right.presence) &&
    left.dirty === right.dirty &&
    left.touched === right.touched &&
    left.focused === right.focused &&
    left.valid === right.valid &&
    left.showIssues === right.showIssues &&
    sameReferences(left.issues, right.issues)
  );
}

function sameFieldPresence(left: FieldPresence, right: FieldPresence): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'missing') return true;
  if (left.kind === 'value') {
    return right.kind === 'value' && Object.is(left.value, right.value);
  }
  return (
    right.kind === 'blocked' &&
    left.reason === right.reason &&
    samePath(left.at, right.at)
  );
}

function sameObjectPresence(
  left: ObjectPresence,
  right: ObjectPresence,
): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'missing' || left.kind === 'object') return true;
  if (left.kind === 'incompatible') {
    return right.kind === 'incompatible' && Object.is(left.value, right.value);
  }
  return (
    right.kind === 'blocked' &&
    left.reason === right.reason &&
    samePath(left.at, right.at)
  );
}

function sameReferences(
  left: readonly unknown[],
  right: readonly unknown[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function buildTemplateSnapshots(
  collection: ArrayNodeDefinition,
  templates: readonly FormNodeTemplate[],
  item: object,
  baselineItem: object | undefined,
  itemId: string,
  index: number,
  issues: readonly ValidationIssue[],
  fieldsByKey: ReadonlyMap<string, FieldRuntimeSnapshot>,
  showAll: boolean,
  forced: ReadonlySet<string>,
  previous?: ItemRuntimeSnapshot,
): readonly NodeRuntimeSnapshot[] {
  const roots = new Array<NodeRuntimeSnapshot>(templates.length);
  const previousByKey = indexTemplateSnapshots(previous?.children ?? []);
  type Frame =
    | {
        readonly phase: 'enter';
        readonly template: FormNodeTemplate;
        readonly output: NodeRuntimeSnapshot[];
        readonly index: number;
      }
    | {
        readonly phase: 'exit';
        readonly template: Extract<FormNodeTemplate, { kind: 'object' }>;
        readonly children: NodeRuntimeSnapshot[];
        readonly output: NodeRuntimeSnapshot[];
        readonly index: number;
      };
  const stack: Frame[] = [];
  for (let rootIndex = templates.length - 1; rootIndex >= 0; rootIndex -= 1) {
    stack.push({
      phase: 'enter',
      template: templates[rootIndex] as FormNodeTemplate,
      output: roots,
      index: rootIndex,
    });
  }
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    const key = canonicalInstanceNodeKey(
      collection.path as readonly string[],
      itemId,
      frame.template.relativePath,
    );
    if (frame.phase === 'enter') {
      if (frame.template.kind !== 'object') {
        frame.output[frame.index] = fieldsByKey.get(
          key,
        ) as FieldRuntimeSnapshot;
        continue;
      }
      const children = new Array<NodeRuntimeSnapshot>(
        frame.template.children.length,
      );
      stack.push({
        phase: 'exit',
        template: frame.template,
        children,
        output: frame.output,
        index: frame.index,
      });
      for (
        let childIndex = frame.template.children.length - 1;
        childIndex >= 0;
        childIndex -= 1
      ) {
        stack.push({
          phase: 'enter',
          template: frame.template.children[childIndex] as FormNodeTemplate,
          output: children,
          index: childIndex,
        });
      }
      continue;
    }
    const prefix = [...collection.path, index];
    const presence = resolveTemplateObjectPresence(
      item,
      frame.template.relativePath,
      prefix,
    );
    const baselinePresence =
      baselineItem === undefined
        ? undefined
        : resolveTemplateObjectPresence(
            baselineItem,
            frame.template.relativePath,
            prefix,
          );
    const ownIssues = Object.freeze(
      issues.filter(
        (issue) =>
          assignedItemTemplateKey(collection, issue.path, index, itemId) ===
          key,
      ),
    );
    const children = Object.freeze(frame.children);
    const touched = children.some((child) => child.touched);
    const candidate: NodeRuntimeSnapshot = Object.freeze({
      nodeKind: 'object',
      key,
      path: Object.freeze([
        ...collection.path,
        index,
        ...frame.template.relativePath,
      ]),
      presence,
      dirty:
        baselinePresence === undefined
          ? false
          : templateObjectDirty(presence, baselinePresence, children),
      touched,
      focused: children.some((child) => child.focused),
      valid: ownIssues.length === 0 && children.every((child) => child.valid),
      issues: ownIssues,
      showIssues:
        ownIssues.length > 0 && (showAll || touched || forced.has(key)),
      children,
    });
    const prior = previousByKey.get(key);
    frame.output[frame.index] =
      prior !== undefined && sameNodeSnapshot(prior, candidate)
        ? prior
        : candidate;
  }
  return Object.freeze(roots);
}

function indexTemplateSnapshots(
  roots: readonly NodeRuntimeSnapshot[],
): ReadonlyMap<string, NodeRuntimeSnapshot> {
  const result = new Map<string, NodeRuntimeSnapshot>();
  const stack = [...roots].reverse();
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    result.set(node.key, node);
    if (node.nodeKind === 'object') {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        stack.push(node.children[index] as NodeRuntimeSnapshot);
      }
    }
  }
  return result;
}

function resolveTemplateObjectPresence(
  item: object,
  relativePath: readonly string[],
  positionalPrefix: DataPath,
): ObjectPresence {
  let current = item;
  for (let index = 0; index < relativePath.length; index += 1) {
    const property = relativePath[index] as string;
    const entry = readOwnDataMember(current, property);
    const path = Object.freeze([
      ...positionalPrefix,
      ...relativePath.slice(0, index + 1),
    ]);
    if (index === relativePath.length - 1) {
      if (entry.kind === 'missing') return Object.freeze({ kind: 'missing' });
      if (entry.kind === 'value' && isOrdinaryObject(entry.value)) {
        return Object.freeze({ kind: 'object' });
      }
      return Object.freeze({
        kind: 'incompatible',
        value: entry.kind === 'value' ? entry.value : undefined,
      });
    }
    if (entry.kind === 'missing') {
      return Object.freeze({
        kind: 'blocked',
        reason: 'missing-ancestor',
        at: path,
      });
    }
    if (entry.kind !== 'value' || !isOrdinaryObject(entry.value)) {
      return Object.freeze({
        kind: 'blocked',
        reason: 'incompatible-ancestor',
        at: path,
      });
    }
    current = entry.value;
  }
  return Object.freeze({ kind: 'missing' });
}

function templateObjectDirty(
  current: ObjectPresence,
  baseline: ObjectPresence,
  children: readonly NodeRuntimeSnapshot[],
): boolean {
  if (current.kind === 'blocked' || baseline.kind === 'blocked') return false;
  if (current.kind !== baseline.kind) return true;
  if (current.kind === 'incompatible' && baseline.kind === 'incompatible') {
    return !Object.is(current.value, baseline.value);
  }
  return current.kind === 'object' && children.some((child) => child.dirty);
}
