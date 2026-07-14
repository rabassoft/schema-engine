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
  ObjectRuntimeSnapshot,
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
  const stack: FormNodeDefinition[] = [];
  for (let index = definitions.length - 1; index >= 0; index -= 1) {
    stack.push(definitions[index] as FormNodeDefinition);
  }
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    if (node.kind === 'array') {
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
  for (const { definition, inspection } of inspectDefinedCollections(
    root,
    definitions,
  )) {
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
      for (const field of definition.item.fields) {
        const accessor = firstAccessorAtRelativePath(
          item,
          field.relativePath,
          definition.path,
          index,
        );
        if (accessor !== undefined) return accessor;
      }
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
      );
      items.push(
        prior !== undefined && sameItemSnapshot(prior, candidate)
          ? prior
          : candidate,
      );
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
    showIssues: ownIssues.length > 0 && collectionTouched,
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
      return typeof index === 'number' && (index < 0 || index >= length);
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
): readonly FieldRuntimeSnapshot[] {
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
        issues.filter((issue) => samePath(issue.path, path)),
      );
      const isTouched = touched.has(key);
      return Object.freeze({
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
        showIssues: ownIssues.length > 0 && isTouched,
      });
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
  );
  const fieldsByKey = new Map(fields.map((field) => [field.key, field]));
  const children = Object.freeze(
    collection.item.children.map((template) =>
      buildTemplateSnapshot(
        collection,
        template,
        item,
        baselineItem,
        itemId,
        index,
        issues,
        fieldsByKey,
      ),
    ),
  );
  const dataPath = Object.freeze([...collection.path, index]);
  const ownIssues = Object.freeze(
    issues.filter(
      (issue) =>
        samePath(issue.path, dataPath) ||
        samePath(issue.path, [...dataPath, collection.identity.property]),
    ),
  );
  const address = Object.freeze({
    collectionPath: Object.freeze([...(collection.path as string[])]),
    itemId,
  });
  const itemTouched = children.some((child) => child.touched);
  return Object.freeze({
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
    showIssues: ownIssues.length > 0 && itemTouched,
    children,
    fields,
  });
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

function successful(presence: ArrayPresence): CollectionValueInspection {
  return Object.freeze({
    success: true,
    presence,
    identity: VALID_IDENTITY,
  });
}

function firstAccessorAtRelativePath(
  item: object,
  relativePath: readonly string[],
  collectionPath: DataPath,
  index: number,
): DataPath | undefined {
  let current = item;
  for (let offset = 0; offset < relativePath.length; offset += 1) {
    const property = relativePath[offset] as string;
    const entry = readOwnDataMember(current, property);
    const path = Object.freeze([
      ...collectionPath,
      index,
      ...relativePath.slice(0, offset + 1),
    ]);
    if (entry.kind === 'accessor') return path;
    if (entry.kind !== 'value' || offset === relativePath.length - 1) {
      return undefined;
    }
    if (!isOrdinaryObject(entry.value)) return undefined;
    current = entry.value;
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
    left.valid === right.valid &&
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

function buildTemplateSnapshot(
  collection: ArrayNodeDefinition,
  template: FormNodeTemplate,
  item: object,
  baselineItem: object | undefined,
  itemId: string,
  index: number,
  issues: readonly ValidationIssue[],
  fieldsByKey: ReadonlyMap<string, FieldRuntimeSnapshot>,
): NodeRuntimeSnapshot {
  const key = canonicalInstanceNodeKey(
    collection.path as readonly string[],
    itemId,
    template.relativePath,
  );
  if (template.kind !== 'object') {
    return fieldsByKey.get(key) as FieldRuntimeSnapshot;
  }
  const children = Object.freeze(
    template.children.map((child) =>
      buildTemplateSnapshot(
        collection,
        child,
        item,
        baselineItem,
        itemId,
        index,
        issues,
        fieldsByKey,
      ),
    ),
  );
  const prefix = [...collection.path, index];
  const presence = resolveTemplateObjectPresence(
    item,
    template.relativePath,
    prefix,
  );
  const baselinePresence =
    baselineItem === undefined
      ? undefined
      : resolveTemplateObjectPresence(
          baselineItem,
          template.relativePath,
          prefix,
        );
  const path = Object.freeze([...prefix, ...template.relativePath]);
  const ownIssues = Object.freeze(
    issues.filter((issue) => samePath(issue.path, path)),
  );
  const touched = children.some((child) => child.touched);
  const snapshot: ObjectRuntimeSnapshot = Object.freeze({
    nodeKind: 'object',
    key,
    path,
    presence,
    dirty:
      baselinePresence === undefined
        ? false
        : templateObjectDirty(presence, baselinePresence, children),
    touched,
    focused: children.some((child) => child.focused),
    valid: ownIssues.length === 0 && children.every((child) => child.valid),
    issues: ownIssues,
    showIssues: ownIssues.length > 0 && touched,
    children,
  });
  return snapshot;
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
