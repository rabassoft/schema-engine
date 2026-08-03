// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  ApplyOperationResult,
  ArrayNodeDefinition,
  Diagnostic,
  FormDefinition,
  FormNodeDefinition,
  FormNodeTemplate,
  FormScope,
} from '../contracts.js';
import { EMPTY_DIAGNOSTICS } from '../operations.js';
import { canonicalDataPathKey, isOrdinaryObject } from './path.js';
import {
  collectCollectionFormDefinitionDefects,
  type NestedDefinitionDefect,
} from './nested-definition.js';
import { describeActualValue } from './value.js';

type Side = 'baseline' | 'current';

interface NodeMeta {
  readonly node: FormNodeDefinition;
  readonly path: readonly string[];
  readonly order: number;
}

interface TemplateMeta {
  readonly node: FormNodeTemplate;
  readonly relativePath: readonly string[];
  readonly order: number;
}

interface CollectionMeta extends NodeMeta {
  readonly node: ArrayNodeDefinition;
  readonly templates: ReadonlyMap<string, TemplateMeta>;
}

interface DefinitionIndex {
  readonly nodes: ReadonlyMap<string, NodeMeta>;
  readonly collections: ReadonlyMap<string, CollectionMeta>;
}

type NodeState =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown }
  | { readonly kind: 'object'; readonly value: object }
  | { readonly kind: 'array'; readonly value: readonly unknown[] }
  | {
      readonly kind: 'incompatible';
      readonly value: unknown;
      readonly path: readonly (string | number)[];
    }
  | {
      readonly kind: 'blocked';
      readonly path: readonly (string | number)[];
    };

type IdentityReason =
  | 'sparse-item'
  | 'non-object-item'
  | 'missing-identity'
  | 'identity-accessor'
  | 'non-string-identity'
  | 'blank-identity'
  | 'duplicate-identity';

type IdentityState =
  | { readonly kind: 'valid' }
  | {
      readonly kind: 'invalid';
      readonly reason: IdentityReason;
      readonly index: number;
      readonly firstIndex?: number;
    };

interface ItemState {
  readonly id: string;
  readonly index: number;
  readonly value: object;
  readonly nodes: ReadonlyMap<string, NodeState>;
}

interface CollectionState {
  readonly presence: NodeState;
  readonly identity: IdentityState;
  readonly items: ReadonlyMap<string, ItemState>;
}

interface RootInspection {
  readonly nodes: ReadonlyMap<string, NodeState>;
  readonly collections: ReadonlyMap<string, CollectionState>;
}

export type PreparedScopeTarget =
  | {
      readonly kind: 'static';
      readonly targetIndex: number;
      readonly path: readonly string[];
      readonly node: FormNodeDefinition;
      readonly order: number;
    }
  | {
      readonly kind: 'item';
      readonly targetIndex: number;
      readonly collectionPath: readonly string[];
      readonly itemId: string;
      readonly collection: ArrayNodeDefinition;
      readonly collectionOrder: number;
      readonly baselineIndex: number;
    }
  | {
      readonly kind: 'node';
      readonly targetIndex: number;
      readonly collectionPath: readonly string[];
      readonly itemId: string;
      readonly relativePath: readonly string[];
      readonly collection: ArrayNodeDefinition;
      readonly node: FormNodeTemplate;
      readonly collectionOrder: number;
      readonly baselineIndex: number;
      readonly templateOrder: number;
    };

export type ScopeBaselinePreparation<TData extends object> =
  | {
      readonly success: true;
      readonly definition: FormDefinition;
      readonly baselineValue: Readonly<TData>;
      readonly currentValue: Readonly<TData>;
      readonly targets: readonly PreparedScopeTarget[];
    }
  | {
      readonly success: false;
      readonly result: ApplyOperationResult<TData>;
    };

interface ParsedTargetBase {
  readonly targetIndex: number;
}

type ParsedTarget =
  | (ParsedTargetBase & {
      readonly kind: 'static';
      readonly path: readonly string[];
      readonly meta: NodeMeta;
    })
  | (ParsedTargetBase & {
      readonly kind: 'item';
      readonly collectionPath: readonly string[];
      readonly itemId: string;
      readonly collection: CollectionMeta;
    })
  | (ParsedTargetBase & {
      readonly kind: 'node';
      readonly collectionPath: readonly string[];
      readonly itemId: string;
      readonly relativePath: readonly string[];
      readonly collection: CollectionMeta;
      readonly template: TemplateMeta;
    });

type ReadResult =
  | { readonly kind: 'missing' }
  | { readonly kind: 'accessor' }
  | { readonly kind: 'value'; readonly value: unknown };

type SafeReadResult =
  | { readonly success: true; readonly member: ReadResult }
  | { readonly success: false };

interface ParentState {
  readonly kind: 'object' | 'missing' | 'blocked';
  readonly value?: object;
  readonly blockedAt?: readonly (string | number)[];
  readonly positionalPath: readonly (string | number)[];
}

interface RootInspectionResult {
  readonly success: boolean;
  readonly inspection?: RootInspection;
  readonly diagnostic?: Diagnostic;
}

interface ParsedScopeResult {
  readonly success: boolean;
  readonly scopeId?: string;
  readonly targets?: readonly ParsedTarget[];
  readonly diagnostic?: Diagnostic;
}

type ManagedPresence =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown };

interface ManagedReconstruction {
  readonly presence: ManagedPresence;
  readonly changed: boolean;
}

type ConstructionFailureReason = 'inspection-failed' | 'clone-failed';

interface ConstructionFailure {
  readonly reason: ConstructionFailureReason;
  readonly path?: readonly (string | number)[];
}

type ConstructionResult<T> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly failure: ConstructionFailure };

export function commitScopeToBaseline<TData extends object>(
  definition: FormDefinition,
  baselineValue: Readonly<TData>,
  currentValue: Readonly<TData>,
  scope: FormScope,
): ApplyOperationResult<TData> {
  const preparation = prepareScopeBaselineConfirmation(
    definition,
    baselineValue,
    currentValue,
    scope,
  );
  if (!preparation.success) return preparation.result;

  let candidate: Readonly<TData> = baselineValue;
  for (const target of preparation.targets) {
    const reconstructed =
      target.kind === 'static'
        ? reconstructStaticTarget(
            candidate,
            currentValue,
            target.node,
            target.path,
          )
        : reconstructStableTarget(candidate, currentValue, target);
    if (!reconstructed.success) {
      return constructionFailureResult(baselineValue, reconstructed.failure);
    }
    candidate = reconstructed.value;
  }

  return Object.freeze({
    success: true,
    value: candidate,
    changed: candidate !== baselineValue,
    diagnostics: EMPTY_DIAGNOSTICS,
  });
}

export function prepareScopeBaselineConfirmation<TData extends object>(
  definition: FormDefinition,
  baselineValue: Readonly<TData>,
  currentValue: Readonly<TData>,
  scope: FormScope,
): ScopeBaselinePreparation<TData> {
  let defects: readonly NestedDefinitionDefect[];
  try {
    defects = collectCollectionFormDefinitionDefects(definition);
  } catch {
    return failedPreparation(
      baselineValue,
      invalidDefinitionFallback('nodes-not-array'),
    );
  }
  if (defects.length > 0) {
    return failedPreparation(
      baselineValue,
      defects.map((defect) => definitionDiagnostic(defect)),
    );
  }

  const index = buildDefinitionIndex(definition);
  const baseline = inspectRoot(baselineValue, definition, index, 'baseline');
  if (!baseline.success || baseline.inspection === undefined) {
    return failedPreparation(
      baselineValue,
      baseline.diagnostic ?? invalidRootInspection('baseline'),
    );
  }
  const current = inspectRoot(currentValue, definition, index, 'current');
  if (!current.success || current.inspection === undefined) {
    return failedPreparation(
      baselineValue,
      current.diagnostic ?? invalidRootInspection('current'),
    );
  }

  const parsed = parseScope(scope, index);
  if (
    !parsed.success ||
    parsed.scopeId === undefined ||
    parsed.targets === undefined
  ) {
    return failedPreparation(
      baselineValue,
      parsed.diagnostic ?? invalidScopeInspection(),
    );
  }

  for (const target of parsed.targets) {
    const unavailable = availabilityDiagnostic(
      parsed.scopeId,
      target,
      baseline.inspection,
      current.inspection,
    );
    if (unavailable !== undefined) {
      return failedPreparation(baselineValue, unavailable);
    }
  }

  return Object.freeze({
    success: true,
    definition,
    baselineValue,
    currentValue,
    targets: canonicalTargets(parsed.targets, baseline.inspection),
  });
}

function buildDefinitionIndex(definition: FormDefinition): DefinitionIndex {
  const nodes = new Map<string, NodeMeta>();
  const collections = new Map<string, CollectionMeta>();
  let order = 0;
  const stack = [...definition.nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    const meta: NodeMeta = {
      node,
      path: Object.freeze([...node.path] as string[]),
      order,
    };
    order += 1;
    nodes.set(canonicalDataPathKey(meta.path), meta);
    if (node.kind === 'object') {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        const child = node.children[index];
        if (child !== undefined) stack.push(child);
      }
    } else if (node.kind === 'array') {
      const templates = new Map<string, TemplateMeta>();
      let templateOrder = 0;
      const templateStack = [...node.item.children].reverse();
      while (templateStack.length > 0) {
        const template = templateStack.pop();
        if (template === undefined) break;
        const relativePath = Object.freeze([...template.relativePath]);
        templates.set(canonicalDataPathKey(relativePath), {
          node: template,
          relativePath,
          order: templateOrder,
        });
        templateOrder += 1;
        if (template.kind === 'object') {
          for (
            let index = template.children.length - 1;
            index >= 0;
            index -= 1
          ) {
            const child = template.children[index];
            if (child !== undefined) templateStack.push(child);
          }
        }
      }
      const collection: CollectionMeta = {
        ...meta,
        node,
        templates,
      };
      collections.set(canonicalDataPathKey(meta.path), collection);
    }
  }
  return { nodes, collections };
}

function inspectRoot(
  root: unknown,
  definition: FormDefinition,
  index: DefinitionIndex,
  side: Side,
): RootInspectionResult {
  let ordinary: boolean;
  try {
    ordinary = isOrdinaryObject(root);
  } catch {
    return { success: false, diagnostic: invalidRootInspection(side) };
  }
  if (!ordinary) {
    return {
      success: false,
      diagnostic: invalidInput({
        member: sideMember(side),
        expected: 'ordinary data tree at managed paths',
        reason: 'invalid-value',
        ...describeActualValue(root),
      }),
    };
  }

  try {
    const nodes = new Map<string, NodeState>();
    const collections = new Map<string, CollectionState>();
    const stack: Array<{
      readonly node: FormNodeDefinition;
      readonly parent: ParentState;
    }> = [];
    for (let item = definition.nodes.length - 1; item >= 0; item -= 1) {
      const node = definition.nodes[item];
      if (node !== undefined) {
        stack.push({
          node,
          parent: {
            kind: 'object',
            value: root as object,
            positionalPath: Object.freeze([]),
          },
        });
      }
    }

    while (stack.length > 0) {
      const frame = stack.pop();
      if (frame === undefined) break;
      const nodePath = [...frame.parent.positionalPath, frame.node.name];
      const inspected = inspectNodeMember(
        frame.parent,
        frame.node.name,
        nodePath,
      );
      if (!inspected.success) {
        return {
          success: false,
          diagnostic: rootAccessor(side, inspected.path),
        };
      }
      nodes.set(canonicalDataPathKey(frame.node.path), inspected.state);

      if (frame.node.kind === 'object') {
        const childParent = childParentState(inspected.state, nodePath);
        for (
          let childIndex = frame.node.children.length - 1;
          childIndex >= 0;
          childIndex -= 1
        ) {
          const child = frame.node.children[childIndex];
          if (child !== undefined)
            stack.push({ node: child, parent: childParent });
        }
      } else if (frame.node.kind === 'array') {
        const meta = index.collections.get(
          canonicalDataPathKey(frame.node.path),
        );
        if (meta === undefined) continue;
        const collection = inspectCollection(
          inspected.state,
          meta,
          nodePath,
          side,
        );
        if (!collection.success) {
          return { success: false, diagnostic: collection.diagnostic };
        }
        collections.set(
          canonicalDataPathKey(frame.node.path),
          collection.state,
        );
      }
    }
    return {
      success: true,
      inspection: { nodes, collections },
    };
  } catch {
    return { success: false, diagnostic: invalidRootInspection(side) };
  }
}

function inspectNodeMember(
  parent: ParentState,
  name: string,
  path: readonly (string | number)[],
):
  | { readonly success: true; readonly state: NodeState }
  | { readonly success: false; readonly path: readonly (string | number)[] } {
  if (parent.kind === 'missing') {
    return { success: true, state: { kind: 'missing' } };
  }
  if (parent.kind === 'blocked') {
    return {
      success: true,
      state: { kind: 'blocked', path: parent.blockedAt ?? path },
    };
  }
  const member = readOwn(parent.value as object, name);
  if (!member.success) return { success: false, path };
  if (member.member.kind === 'accessor') return { success: false, path };
  if (member.member.kind === 'missing') {
    return { success: true, state: { kind: 'missing' } };
  }
  return {
    success: true,
    state: { kind: 'value', value: member.member.value },
  };
}

function childParentState(
  state: NodeState,
  path: readonly (string | number)[],
): ParentState {
  if (state.kind === 'missing') {
    return { kind: 'missing', positionalPath: path };
  }
  if (state.kind === 'blocked') {
    return {
      kind: 'blocked',
      blockedAt: state.path,
      positionalPath: path,
    };
  }
  if (state.kind === 'value') {
    if (isOrdinaryObject(state.value)) {
      return {
        kind: 'object',
        value: state.value,
        positionalPath: path,
      };
    }
    return { kind: 'blocked', blockedAt: path, positionalPath: path };
  }
  return { kind: 'blocked', blockedAt: path, positionalPath: path };
}

function inspectCollection(
  rawState: NodeState,
  meta: CollectionMeta,
  path: readonly (string | number)[],
  side: Side,
):
  | { readonly success: true; readonly state: CollectionState }
  | { readonly success: false; readonly diagnostic: Diagnostic } {
  if (rawState.kind !== 'value') {
    return {
      success: true,
      state: {
        presence: rawState,
        identity: { kind: 'valid' },
        items: new Map(),
      },
    };
  }
  if (!Array.isArray(rawState.value)) {
    return {
      success: true,
      state: {
        presence: {
          kind: 'incompatible',
          value: rawState.value,
          path,
        },
        identity: { kind: 'valid' },
        items: new Map(),
      },
    };
  }

  const array = rawState.value;
  const arrayLength = readArrayLength(array);
  if (arrayLength === undefined) {
    return { success: false, diagnostic: invalidRootInspection(side) };
  }
  const items = new Map<string, ItemState>();
  let identity: IdentityState = { kind: 'valid' };
  for (let itemIndex = 0; itemIndex < arrayLength; itemIndex += 1) {
    const slot = readOwn(array, String(itemIndex));
    if (!slot.success) {
      return { success: false, diagnostic: invalidRootInspection(side) };
    }
    if (slot.member.kind === 'missing') {
      identity = { kind: 'invalid', reason: 'sparse-item', index: itemIndex };
      break;
    }
    if (slot.member.kind !== 'value') {
      identity = {
        kind: 'invalid',
        reason: 'non-object-item',
        index: itemIndex,
      };
      break;
    }
    let ordinary: boolean;
    try {
      ordinary = isOrdinaryObject(slot.member.value);
    } catch {
      return { success: false, diagnostic: invalidRootInspection(side) };
    }
    if (!ordinary) {
      identity = {
        kind: 'invalid',
        reason: 'non-object-item',
        index: itemIndex,
      };
      break;
    }
    const item = slot.member.value as object;
    const id = readOwn(item, meta.node.identity.property);
    if (!id.success) {
      return { success: false, diagnostic: invalidRootInspection(side) };
    }
    if (id.member.kind === 'missing') {
      identity = {
        kind: 'invalid',
        reason: 'missing-identity',
        index: itemIndex,
      };
      break;
    }
    if (id.member.kind === 'accessor') {
      identity = {
        kind: 'invalid',
        reason: 'identity-accessor',
        index: itemIndex,
      };
      break;
    }
    if (typeof id.member.value !== 'string') {
      identity = {
        kind: 'invalid',
        reason: 'non-string-identity',
        index: itemIndex,
      };
      break;
    }
    if (id.member.value.trim().length === 0) {
      identity = {
        kind: 'invalid',
        reason: 'blank-identity',
        index: itemIndex,
      };
      break;
    }
    const existing = items.get(id.member.value);
    if (existing !== undefined) {
      identity = {
        kind: 'invalid',
        reason: 'duplicate-identity',
        index: itemIndex,
        firstIndex: existing.index,
      };
      break;
    }
    items.set(id.member.value, {
      id: id.member.value,
      index: itemIndex,
      value: item,
      nodes: new Map(),
    });
  }

  if (identity.kind === 'valid') {
    for (const item of items.values()) {
      const inspected = inspectTemplateNodes(item, meta, path, side);
      if (!inspected.success) return inspected;
      items.set(item.id, { ...item, nodes: inspected.nodes });
    }
  }

  return {
    success: true,
    state: {
      presence: { kind: 'array', value: array },
      identity,
      items,
    },
  };
}

function inspectTemplateNodes(
  item: ItemState,
  meta: CollectionMeta,
  collectionPath: readonly (string | number)[],
  side: Side,
):
  | { readonly success: true; readonly nodes: ReadonlyMap<string, NodeState> }
  | { readonly success: false; readonly diagnostic: Diagnostic } {
  const nodes = new Map<string, NodeState>();
  const stack: Array<{
    readonly node: FormNodeTemplate;
    readonly parent: ParentState;
  }> = [];
  for (
    let templateIndex = meta.node.item.children.length - 1;
    templateIndex >= 0;
    templateIndex -= 1
  ) {
    const node = meta.node.item.children[templateIndex];
    if (node !== undefined) {
      stack.push({
        node,
        parent: {
          kind: 'object',
          value: item.value,
          positionalPath: [...collectionPath, item.index],
        },
      });
    }
  }
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    const path = [...frame.parent.positionalPath, frame.node.name];
    const inspected = inspectNodeMember(frame.parent, frame.node.name, path);
    if (!inspected.success) {
      return { success: false, diagnostic: rootAccessor(side, inspected.path) };
    }
    nodes.set(canonicalDataPathKey(frame.node.relativePath), inspected.state);
    if (frame.node.kind === 'object') {
      const childParent = childParentState(inspected.state, path);
      for (
        let childIndex = frame.node.children.length - 1;
        childIndex >= 0;
        childIndex -= 1
      ) {
        const child = frame.node.children[childIndex];
        if (child !== undefined)
          stack.push({ node: child, parent: childParent });
      }
    }
  }
  return { success: true, nodes };
}

function parseScope(scope: unknown, index: DefinitionIndex): ParsedScopeResult {
  let ordinary: boolean;
  try {
    ordinary = isOrdinaryObject(scope);
  } catch {
    return { success: false, diagnostic: invalidScopeInspection() };
  }
  if (!ordinary) {
    return {
      success: false,
      diagnostic: invalidInput({
        member: 'scope',
        expected: 'valid FormScope',
        reason: 'invalid-value',
        ...describeActualValue(scope),
      }),
    };
  }
  const id = readOwn(scope as object, 'id');
  if (!id.success)
    return { success: false, diagnostic: invalidScopeInspection() };
  if (
    id.member.kind !== 'value' ||
    typeof id.member.value !== 'string' ||
    id.member.value.length === 0
  ) {
    return {
      success: false,
      diagnostic: invalidScopeMember('id', id.member),
    };
  }
  const paths = readOwn(scope as object, 'paths');
  if (!paths.success)
    return { success: false, diagnostic: invalidScopeInspection() };
  if (paths.member.kind !== 'value' || !Array.isArray(paths.member.value)) {
    return {
      success: false,
      diagnostic: invalidScopeMember('paths', paths.member),
    };
  }
  const pathsLength = readArrayLength(paths.member.value);
  if (pathsLength === undefined) {
    return { success: false, diagnostic: invalidScopeInspection() };
  }
  const include = readOwn(scope as object, 'includeGlobalIssues');
  if (!include.success)
    return { success: false, diagnostic: invalidScopeInspection() };
  if (
    include.member.kind === 'accessor' ||
    (include.member.kind === 'value' &&
      typeof include.member.value !== 'boolean')
  ) {
    return {
      success: false,
      diagnostic: invalidScopeMember('includeGlobalIssues', include.member),
    };
  }

  const targets: ParsedTarget[] = [];
  for (let targetIndex = 0; targetIndex < pathsLength; targetIndex += 1) {
    const entry = readOwn(paths.member.value, String(targetIndex));
    if (!entry.success || entry.member.kind !== 'value') {
      return {
        success: false,
        diagnostic: targetDiagnostic(
          id.member.value,
          targetIndex,
          'invalid-target',
        ),
      };
    }
    const parsed = parseTarget(
      entry.member.value,
      targetIndex,
      id.member.value,
      index,
    );
    if (!parsed.success) return parsed;
    targets.push(parsed.target);
  }
  return {
    success: true,
    scopeId: id.member.value,
    targets: Object.freeze(targets),
  };
}

function parseTarget(
  value: unknown,
  targetIndex: number,
  scopeId: string,
  index: DefinitionIndex,
):
  | { readonly success: true; readonly target: ParsedTarget }
  | { readonly success: false; readonly diagnostic: Diagnostic } {
  if (Array.isArray(value)) {
    const segments: string[] = [];
    const pathLength = readArrayLength(value);
    if (pathLength === undefined) {
      return {
        success: false,
        diagnostic: targetDiagnostic(scopeId, targetIndex, 'invalid-target'),
      };
    }
    if (pathLength === 0) {
      return {
        success: false,
        diagnostic: targetDiagnostic(scopeId, targetIndex, 'root-path', {
          path: Object.freeze([]),
        }),
      };
    }
    for (let segmentIndex = 0; segmentIndex < pathLength; segmentIndex += 1) {
      const member = readOwn(value, String(segmentIndex));
      if (!member.success || member.member.kind !== 'value') {
        return {
          success: false,
          diagnostic: targetDiagnostic(scopeId, targetIndex, 'invalid-target', {
            segmentIndex,
          }),
        };
      }
      if (typeof member.member.value === 'number') {
        return {
          success: false,
          diagnostic: targetDiagnostic(
            scopeId,
            targetIndex,
            'numeric-path',
            {
              path: Object.freeze([...segments]),
              segmentIndex,
            },
            segments,
          ),
        };
      }
      if (typeof member.member.value !== 'string') {
        return {
          success: false,
          diagnostic: targetDiagnostic(scopeId, targetIndex, 'invalid-target', {
            segmentIndex,
          }),
        };
      }
      segments.push(member.member.value);
    }
    const path = Object.freeze(segments);
    const meta = index.nodes.get(canonicalDataPathKey(path));
    if (meta === undefined) {
      return {
        success: false,
        diagnostic: targetDiagnostic(
          scopeId,
          targetIndex,
          'path-not-managed',
          {
            path,
          },
          path,
        ),
      };
    }
    return {
      success: true,
      target: { kind: 'static', targetIndex, path, meta },
    };
  }

  let ordinary: boolean;
  try {
    ordinary = isOrdinaryObject(value);
  } catch {
    ordinary = false;
  }
  if (!ordinary) {
    return {
      success: false,
      diagnostic: targetDiagnostic(scopeId, targetIndex, 'invalid-target'),
    };
  }
  const collectionPath = copyStringArrayMember(
    value as object,
    'collectionPath',
    false,
  );
  const itemId = readOwn(value as object, 'itemId');
  const relativeMember = readOwn(value as object, 'relativePath');
  if (
    collectionPath === undefined ||
    !itemId.success ||
    itemId.member.kind !== 'value' ||
    typeof itemId.member.value !== 'string' ||
    itemId.member.value.trim().length === 0 ||
    !relativeMember.success
  ) {
    return {
      success: false,
      diagnostic: targetDiagnostic(scopeId, targetIndex, 'invalid-target'),
    };
  }
  const collection = index.collections.get(
    canonicalDataPathKey(collectionPath),
  );
  if (collection === undefined) {
    return {
      success: false,
      diagnostic: targetDiagnostic(
        scopeId,
        targetIndex,
        'path-not-managed',
        {
          path: collectionPath,
        },
        collectionPath,
      ),
    };
  }
  if (relativeMember.member.kind === 'missing') {
    return {
      success: true,
      target: {
        kind: 'item',
        targetIndex,
        collectionPath,
        itemId: itemId.member.value,
        collection,
      },
    };
  }
  if (relativeMember.member.kind !== 'value') {
    return {
      success: false,
      diagnostic: targetDiagnostic(scopeId, targetIndex, 'invalid-target'),
    };
  }
  const relativePath = copyStringArray(relativeMember.member.value, true);
  if (relativePath === undefined) {
    return {
      success: false,
      diagnostic: targetDiagnostic(scopeId, targetIndex, 'invalid-target'),
    };
  }
  if (relativePath.length === 0) {
    return {
      success: true,
      target: {
        kind: 'item',
        targetIndex,
        collectionPath,
        itemId: itemId.member.value,
        collection,
      },
    };
  }
  if (relativePath[0] === collection.node.identity.property) {
    return {
      success: false,
      diagnostic: targetDiagnostic(
        scopeId,
        targetIndex,
        'identity-target-not-editable',
        {
          collectionPath,
          itemId: itemId.member.value,
          relativePath,
        },
        collectionPath,
      ),
    };
  }
  const template = collection.templates.get(canonicalDataPathKey(relativePath));
  if (template === undefined) {
    return {
      success: false,
      diagnostic: targetDiagnostic(
        scopeId,
        targetIndex,
        'node-not-managed',
        {
          collectionPath,
          itemId: itemId.member.value,
          relativePath,
        },
        collectionPath,
      ),
    };
  }
  return {
    success: true,
    target: {
      kind: 'node',
      targetIndex,
      collectionPath,
      itemId: itemId.member.value,
      relativePath,
      collection,
      template,
    },
  };
}

function availabilityDiagnostic(
  scopeId: string,
  target: ParsedTarget,
  baseline: RootInspection,
  current: RootInspection,
): Diagnostic | undefined {
  if (target.kind === 'static') {
    for (const [side, inspection] of [
      ['baseline', baseline],
      ['current', current],
    ] as const) {
      const state = inspection.nodes.get(canonicalDataPathKey(target.path));
      if (state?.kind === 'blocked') {
        return targetDiagnostic(
          scopeId,
          target.targetIndex,
          'ancestor-incompatible',
          { side, path: state.path },
          state.path,
        );
      }
      for (const collectionPath of selectedCollectionPaths(target)) {
        const collectionState = inspection.collections.get(
          canonicalDataPathKey(collectionPath),
        );
        if (
          collectionState?.presence.kind === 'array' &&
          collectionState.identity.kind === 'invalid'
        ) {
          return invalidIdentityDiagnostic(
            scopeId,
            target.targetIndex,
            side,
            collectionPath,
            collectionState.identity,
          );
        }
      }
    }
    return undefined;
  }

  const collectionKey = canonicalDataPathKey(target.collectionPath);
  for (const [side, inspection] of [
    ['baseline', baseline],
    ['current', current],
  ] as const) {
    const collection = inspection.collections.get(collectionKey);
    if (collection === undefined) {
      return targetDiagnostic(
        scopeId,
        target.targetIndex,
        'collection-unavailable',
        {
          side,
          presence: 'missing',
          ...stableParameters(target),
        },
        target.collectionPath,
      );
    }
    if (collection.presence.kind === 'blocked') {
      return targetDiagnostic(
        scopeId,
        target.targetIndex,
        'ancestor-incompatible',
        {
          side,
          ...stableParameters(target),
          path: collection.presence.path,
        },
        collection.presence.path,
      );
    }
    if (collection.presence.kind !== 'array') {
      const presence =
        collection.presence.kind === 'incompatible' ||
        collection.presence.kind === 'value'
          ? 'incompatible'
          : 'missing';
      return targetDiagnostic(
        scopeId,
        target.targetIndex,
        'collection-unavailable',
        {
          side,
          presence,
          ...stableParameters(target),
        },
        target.collectionPath,
      );
    }
    if (collection.identity.kind === 'invalid') {
      return invalidIdentityDiagnostic(
        scopeId,
        target.targetIndex,
        side,
        target.collectionPath,
        collection.identity,
        stableParameters(target),
      );
    }
    const item = collection.items.get(target.itemId);
    if (item === undefined) {
      return targetDiagnostic(
        scopeId,
        target.targetIndex,
        'item-missing',
        {
          side,
          ...stableParameters(target),
        },
        target.collectionPath,
      );
    }
    if (target.kind === 'node') {
      const state = item.nodes.get(canonicalDataPathKey(target.relativePath));
      if (state?.kind === 'blocked') {
        return targetDiagnostic(
          scopeId,
          target.targetIndex,
          'ancestor-incompatible',
          { side, ...stableParameters(target), path: state.path },
          state.path,
        );
      }
    }
  }
  return undefined;
}

function canonicalTargets(
  targets: readonly ParsedTarget[],
  baseline: RootInspection,
): readonly PreparedScopeTarget[] {
  const retained = targets.filter(
    (candidate, candidateIndex) =>
      !targets.some(
        (other, otherIndex) =>
          (otherIndex < candidateIndex && equivalent(other, candidate)) ||
          (otherIndex !== candidateIndex &&
            strictlyDominates(other, candidate)),
      ),
  );
  const prepared = retained.map((target): PreparedScopeTarget => {
    if (target.kind === 'static') {
      return Object.freeze({
        kind: 'static',
        targetIndex: target.targetIndex,
        path: target.path,
        node: target.meta.node,
        order: target.meta.order,
      });
    }
    const baselineIndex =
      baseline.collections
        .get(canonicalDataPathKey(target.collectionPath))
        ?.items.get(target.itemId)?.index ?? Number.MAX_SAFE_INTEGER;
    if (target.kind === 'item') {
      return Object.freeze({
        kind: 'item',
        targetIndex: target.targetIndex,
        collectionPath: target.collectionPath,
        itemId: target.itemId,
        collection: target.collection.node,
        collectionOrder: target.collection.order,
        baselineIndex,
      });
    }
    return Object.freeze({
      kind: 'node',
      targetIndex: target.targetIndex,
      collectionPath: target.collectionPath,
      itemId: target.itemId,
      relativePath: target.relativePath,
      collection: target.collection.node,
      node: target.template.node,
      collectionOrder: target.collection.order,
      baselineIndex,
      templateOrder: target.template.order,
    });
  });
  prepared.sort(comparePreparedTargets);
  return Object.freeze(prepared);
}

function equivalent(left: ParsedTarget, right: ParsedTarget): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'static' && right.kind === 'static') {
    return samePath(left.path, right.path);
  }
  if (left.kind === 'item' && right.kind === 'item') {
    return (
      samePath(left.collectionPath, right.collectionPath) &&
      left.itemId === right.itemId
    );
  }
  if (left.kind === 'node' && right.kind === 'node') {
    return (
      samePath(left.collectionPath, right.collectionPath) &&
      left.itemId === right.itemId &&
      samePath(left.relativePath, right.relativePath)
    );
  }
  return false;
}

function strictlyDominates(left: ParsedTarget, right: ParsedTarget): boolean {
  if (left.kind === 'static') {
    if (right.kind === 'static') {
      return (
        (left.meta.node.kind === 'object' || left.meta.node.kind === 'array') &&
        isPrefix(left.path, right.path)
      );
    }
    return (
      (left.meta.node.kind === 'array' &&
        samePath(left.path, right.collectionPath)) ||
      (left.meta.node.kind === 'object' &&
        isPrefix(left.path, right.collectionPath))
    );
  }
  if (right.kind === 'static') return false;
  if (
    !samePath(left.collectionPath, right.collectionPath) ||
    left.itemId !== right.itemId
  ) {
    return false;
  }
  if (left.kind === 'item') return right.kind === 'node';
  if (right.kind === 'item') return false;
  return (
    left.template.node.kind === 'object' &&
    isPrefix(left.relativePath, right.relativePath)
  );
}

function selectedCollectionPaths(
  target: Extract<ParsedTarget, { kind: 'static' }>,
): readonly (readonly string[])[] {
  const paths: Array<readonly string[]> = [];
  if (target.meta.node.kind === 'array') {
    paths.push(target.path);
  } else if (target.meta.node.kind === 'object') {
    const stack = [...target.meta.node.children].reverse();
    while (stack.length > 0) {
      const node = stack.pop();
      if (node === undefined) break;
      if (node.kind === 'array') {
        paths.push(Object.freeze([...node.path] as string[]));
      } else if (node.kind === 'object') {
        for (let index = node.children.length - 1; index >= 0; index -= 1) {
          const child = node.children[index];
          if (child !== undefined) stack.push(child);
        }
      }
    }
  }
  return paths;
}

function invalidIdentityDiagnostic(
  scopeId: string,
  targetIndex: number,
  side: Side,
  collectionPath: readonly string[],
  identity: Extract<IdentityState, { kind: 'invalid' }>,
  stable: Readonly<Record<string, unknown>> = { collectionPath },
): Diagnostic {
  return targetDiagnostic(
    scopeId,
    targetIndex,
    'invalid-identity',
    {
      side,
      identityReason: identity.reason,
      identityIndex: identity.index,
      ...(identity.firstIndex === undefined
        ? {}
        : { firstIdentityIndex: identity.firstIndex }),
      ...stable,
    },
    collectionPath,
  );
}

function reconstructStaticTarget<TData extends object>(
  baselineRoot: Readonly<TData>,
  currentRoot: Readonly<TData>,
  node: FormNodeDefinition | FormNodeTemplate,
  path: readonly string[],
): ConstructionResult<Readonly<TData>> {
  const baselinePath = inspectConstructionPath(baselineRoot, path);
  if (!baselinePath.success) return baselinePath;
  const currentPath = inspectConstructionPath(currentRoot, path);
  if (!currentPath.success) return currentPath;
  const reconstructed = reconstructManagedNode(
    node,
    baselinePath.value.presence,
    currentPath.value.presence,
    path,
  );
  if (!reconstructed.success) return reconstructed;

  let outcome = reconstructed.value;
  for (let index = path.length - 1; index >= 0; index -= 1) {
    const member = path[index];
    if (member === undefined) {
      return { success: false, failure: { reason: 'inspection-failed' } };
    }
    const baselineParent = baselinePath.value.parents[index];
    if (baselineParent !== undefined) {
      if (!outcome.changed) {
        outcome = {
          presence: { kind: 'value', value: baselineParent },
          changed: false,
        };
        continue;
      }
      const cloned = cloneObjectMember(
        baselineParent,
        member,
        outcome.presence,
        path.slice(0, index + 1),
      );
      if (!cloned.success) return cloned;
      outcome = {
        presence: { kind: 'value', value: cloned.value },
        changed: true,
      };
      continue;
    }
    if (outcome.presence.kind === 'missing') {
      outcome = { presence: { kind: 'missing' }, changed: false };
      continue;
    }
    const currentParent = currentPath.value.parents[index];
    if (currentParent === undefined) {
      return {
        success: false,
        failure: {
          reason: 'inspection-failed',
          path: Object.freeze(path.slice(0, index)),
        },
      };
    }
    const projected = createProjectedObject(
      currentParent,
      [[member, outcome.presence.value]],
      path.slice(0, index),
    );
    if (!projected.success) return projected;
    outcome = {
      presence: { kind: 'value', value: projected.value },
      changed: true,
    };
  }

  let rootOrdinary: boolean;
  try {
    rootOrdinary =
      outcome.presence.kind === 'value' &&
      isOrdinaryObject(outcome.presence.value);
  } catch {
    return { success: false, failure: { reason: 'inspection-failed' } };
  }
  if (!rootOrdinary || outcome.presence.kind !== 'value') {
    return { success: false, failure: { reason: 'clone-failed' } };
  }
  return { success: true, value: outcome.presence.value as Readonly<TData> };
}

function reconstructStableTarget<TData extends object>(
  baselineRoot: Readonly<TData>,
  currentRoot: Readonly<TData>,
  target: Exclude<PreparedScopeTarget, { readonly kind: 'static' }>,
): ConstructionResult<Readonly<TData>> {
  const baselinePath = inspectConstructionPath(
    baselineRoot,
    target.collectionPath,
  );
  if (!baselinePath.success) return baselinePath;
  const currentPath = inspectConstructionPath(
    currentRoot,
    target.collectionPath,
  );
  if (!currentPath.success) return currentPath;
  if (
    baselinePath.value.presence.kind !== 'value' ||
    currentPath.value.presence.kind !== 'value' ||
    !Array.isArray(baselinePath.value.presence.value) ||
    !Array.isArray(currentPath.value.presence.value)
  ) {
    return {
      success: false,
      failure: {
        reason: 'inspection-failed',
        path: target.collectionPath,
      },
    };
  }
  const baselineArray = baselinePath.value.presence.value;
  const currentArray = currentPath.value.presence.value;
  const baselineItems = inspectConstructionCollection(
    baselineArray,
    target.collection.identity.property,
    target.collectionPath,
  );
  if (!baselineItems.success) return baselineItems;
  const currentItems = inspectConstructionCollection(
    currentArray,
    target.collection.identity.property,
    target.collectionPath,
  );
  if (!currentItems.success) return currentItems;
  const baselineItem = baselineItems.value.find(
    (item) => item.id === target.itemId,
  );
  const currentItem = currentItems.value.find(
    (item) => item.id === target.itemId,
  );
  if (baselineItem === undefined || currentItem === undefined) {
    return {
      success: false,
      failure: { reason: 'inspection-failed', path: target.collectionPath },
    };
  }

  let item: ConstructionResult<{
    readonly value: object;
    readonly changed: boolean;
  }>;
  if (target.kind === 'item') {
    item = reconstructCollectionItem(
      target.collection,
      baselineItem.value,
      currentItem.value,
      [...target.collectionPath, baselineItem.index],
    );
  } else {
    const node = reconstructStaticTarget(
      baselineItem.value,
      currentItem.value,
      target.node,
      target.relativePath,
    );
    if (!node.success) {
      return prefixConstructionFailure(node, [
        ...target.collectionPath,
        baselineItem.index,
      ]);
    }
    item = {
      success: true,
      value: {
        value: node.value,
        changed: node.value !== baselineItem.value,
      },
    };
  }
  if (!item.success) return item;
  if (!item.value.changed) return { success: true, value: baselineRoot };

  const array = cloneStableArrayItem(
    baselineArray,
    baselineItem.index,
    item.value.value,
    target.collectionPath,
  );
  if (!array.success) return array;
  return rebuildExistingPath(baselineRoot, target.collectionPath, array.value);
}

function cloneStableArrayItem(
  baseline: readonly unknown[],
  index: number,
  item: object,
  path: readonly (string | number)[],
): ConstructionResult<readonly unknown[]> {
  let keys: readonly PropertyKey[];
  try {
    keys = Reflect.ownKeys(baseline);
  } catch {
    return { success: false, failure: { reason: 'inspection-failed', path } };
  }
  const result: unknown[] = [];
  for (const key of keys) {
    const descriptor = safeOwnDescriptor(baseline, key, path);
    if (!descriptor.success) return descriptor;
    const replacement =
      key === String(index)
        ? { ...descriptor.value, value: item }
        : descriptor.value;
    try {
      Object.defineProperty(result, key, replacement);
    } catch {
      return { success: false, failure: { reason: 'clone-failed', path } };
    }
  }
  return { success: true, value: result };
}

function rebuildExistingPath<TData extends object>(
  baselineRoot: Readonly<TData>,
  path: readonly string[],
  value: unknown,
): ConstructionResult<Readonly<TData>> {
  const inspected = inspectConstructionPath(baselineRoot, path);
  if (!inspected.success) return inspected;
  let child = value;
  for (let index = path.length - 1; index >= 0; index -= 1) {
    const parent = inspected.value.parents[index];
    const name = path[index];
    if (parent === undefined || name === undefined) {
      return {
        success: false,
        failure: { reason: 'inspection-failed', path: path.slice(0, index) },
      };
    }
    const cloned = cloneObjectMember(
      parent,
      name,
      { kind: 'value', value: child },
      path.slice(0, index + 1),
    );
    if (!cloned.success) return cloned;
    child = cloned.value;
  }
  return { success: true, value: child as Readonly<TData> };
}

function prefixConstructionFailure<T>(
  result: ConstructionResult<T>,
  prefix: readonly (string | number)[],
): ConstructionResult<T> {
  if (result.success) return result;
  return {
    success: false,
    failure: {
      reason: result.failure.reason,
      path: Object.freeze([
        ...prefix,
        ...(result.failure.path === undefined ? [] : result.failure.path),
      ]),
    },
  };
}

function inspectConstructionPath(
  root: object,
  path: readonly string[],
): ConstructionResult<{
  readonly parents: readonly (object | undefined)[];
  readonly presence: ManagedPresence;
}> {
  const parents: Array<object | undefined> = [];
  let parent: object | undefined = root;
  for (let index = 0; index < path.length; index += 1) {
    parents.push(parent);
    if (parent === undefined) continue;
    const memberName = path[index];
    if (memberName === undefined) {
      return { success: false, failure: { reason: 'inspection-failed' } };
    }
    const member = readOwn(parent, memberName);
    if (!member.success || member.member.kind === 'accessor') {
      return {
        success: false,
        failure: {
          reason: 'inspection-failed',
          path: Object.freeze(path.slice(0, index + 1)),
        },
      };
    }
    if (index === path.length - 1) {
      return {
        success: true,
        value: {
          parents: Object.freeze(parents),
          presence:
            member.member.kind === 'missing'
              ? { kind: 'missing' }
              : { kind: 'value', value: member.member.value },
        },
      };
    }
    if (member.member.kind === 'missing') {
      parent = undefined;
      continue;
    }
    let ordinary: boolean;
    try {
      ordinary = isOrdinaryObject(member.member.value);
    } catch {
      return {
        success: false,
        failure: {
          reason: 'inspection-failed',
          path: Object.freeze(path.slice(0, index + 1)),
        },
      };
    }
    if (!ordinary) {
      return {
        success: false,
        failure: {
          reason: 'inspection-failed',
          path: Object.freeze(path.slice(0, index + 1)),
        },
      };
    }
    parent = member.member.value as object;
  }
  return {
    success: true,
    value: {
      parents: Object.freeze(parents),
      presence: { kind: 'missing' },
    },
  };
}

interface ReconstructionFrame {
  readonly node: FormNodeDefinition | FormNodeTemplate;
  readonly baseline: ManagedPresence;
  readonly current: ManagedPresence;
  readonly path: readonly (string | number)[];
  readonly parent?: ReconstructionFrame;
  readonly parentIndex?: number;
  entered: boolean;
  baselineObject?: object;
  currentObject?: object;
  childInputs?: readonly {
    readonly node: FormNodeDefinition | FormNodeTemplate;
    readonly baseline: ManagedPresence;
    readonly current: ManagedPresence;
    readonly path: readonly (string | number)[];
  }[];
  childResults?: Array<ManagedReconstruction | undefined>;
  result?: ManagedReconstruction;
}

function reconstructManagedNode(
  node: FormNodeDefinition | FormNodeTemplate,
  baseline: ManagedPresence,
  current: ManagedPresence,
  path: readonly (string | number)[],
): ConstructionResult<ManagedReconstruction> {
  const root: ReconstructionFrame = {
    node,
    baseline,
    current,
    path,
    entered: false,
  };
  const stack = [root];
  while (stack.length > 0) {
    const frame = stack.at(-1);
    if (frame === undefined) break;
    if (!frame.entered) {
      frame.entered = true;
      if (frame.node.kind === 'array') {
        const collection = reconstructCollectionNode(
          frame.node,
          frame.baseline,
          frame.current,
          frame.path,
        );
        if (!collection.success) return collection;
        frame.result = collection.value;
      } else if (
        frame.node.kind !== 'object' ||
        frame.current.kind === 'missing'
      ) {
        frame.result = terminalReconstruction(frame.baseline, frame.current);
      } else {
        let currentOrdinary: boolean;
        let baselineOrdinary = false;
        try {
          currentOrdinary = isOrdinaryObject(frame.current.value);
          if (frame.baseline.kind === 'value') {
            baselineOrdinary = isOrdinaryObject(frame.baseline.value);
          }
        } catch {
          return {
            success: false,
            failure: { reason: 'inspection-failed', path: frame.path },
          };
        }
        if (!currentOrdinary) {
          frame.result = terminalReconstruction(frame.baseline, frame.current);
        } else {
          frame.currentObject = frame.current.value as object;
          if (baselineOrdinary) {
            frame.baselineObject = (
              frame.baseline as {
                readonly kind: 'value';
                readonly value: object;
              }
            ).value;
          }
          const inputs: Array<{
            node: FormNodeDefinition | FormNodeTemplate;
            baseline: ManagedPresence;
            current: ManagedPresence;
            path: readonly (string | number)[];
          }> = [];
          for (const child of frame.node.children) {
            const childPath = Object.freeze([...frame.path, child.name]);
            const currentMember = readOwn(frame.currentObject, child.name);
            const baselineMember =
              frame.baselineObject === undefined
                ? ({ success: true, member: { kind: 'missing' } } as const)
                : readOwn(frame.baselineObject, child.name);
            if (
              !currentMember.success ||
              !baselineMember.success ||
              currentMember.member.kind === 'accessor' ||
              baselineMember.member.kind === 'accessor'
            ) {
              return {
                success: false,
                failure: { reason: 'inspection-failed', path: childPath },
              };
            }
            inputs.push({
              node: child,
              baseline: readResultPresence(baselineMember.member),
              current: readResultPresence(currentMember.member),
              path: childPath,
            });
          }
          frame.childInputs = inputs;
          frame.childResults = new Array<ManagedReconstruction | undefined>(
            inputs.length,
          );
          for (let index = inputs.length - 1; index >= 0; index -= 1) {
            const input = inputs[index];
            if (input === undefined) continue;
            stack.push({
              ...input,
              parent: frame,
              parentIndex: index,
              entered: false,
            });
          }
          continue;
        }
      }
    } else if (frame.result === undefined) {
      const childInputs = frame.childInputs ?? [];
      const childResults = frame.childResults ?? [];
      if (childResults.some((result) => result === undefined)) {
        return {
          success: false,
          failure: { reason: 'clone-failed', path: frame.path },
        };
      }
      if (frame.baselineObject !== undefined) {
        const changes = childInputs.flatMap((input, index) => {
          const result = childResults[index];
          return result?.changed ? [[input.node.name, result] as const] : [];
        });
        if (changes.length === 0) {
          frame.result = {
            presence: { kind: 'value', value: frame.baselineObject },
            changed: false,
          };
        } else {
          const cloned = cloneObjectMembers(
            frame.baselineObject,
            changes.map(([name, result]) => [name, result.presence] as const),
            frame.path,
          );
          if (!cloned.success) return cloned;
          frame.result = {
            presence: { kind: 'value', value: cloned.value },
            changed: true,
          };
        }
      } else {
        const entries = childInputs.flatMap((input, index) => {
          const result = childResults[index];
          return result?.presence.kind === 'value'
            ? [[input.node.name, result.presence.value] as const]
            : [];
        });
        const projected = createProjectedObject(
          frame.currentObject as object,
          entries,
          frame.path,
        );
        if (!projected.success) return projected;
        frame.result = {
          presence: { kind: 'value', value: projected.value },
          changed: true,
        };
      }
    }

    stack.pop();
    if (frame.parent !== undefined && frame.parentIndex !== undefined) {
      frame.parent.childResults![frame.parentIndex] = frame.result;
    }
  }
  return root.result === undefined
    ? { success: false, failure: { reason: 'clone-failed', path } }
    : { success: true, value: root.result };
}

interface ConstructionCollectionItem {
  readonly id: string;
  readonly index: number;
  readonly value: object;
  readonly indexDescriptor: PropertyDescriptor;
}

function reconstructCollectionNode(
  definition: ArrayNodeDefinition,
  baseline: ManagedPresence,
  current: ManagedPresence,
  path: readonly (string | number)[],
): ConstructionResult<ManagedReconstruction> {
  if (current.kind === 'missing' || !Array.isArray(current.value)) {
    return { success: true, value: terminalReconstruction(baseline, current) };
  }
  const currentItems = inspectConstructionCollection(
    current.value,
    definition.identity.property,
    path,
  );
  if (!currentItems.success) return currentItems;

  const baselineArray =
    baseline.kind === 'value' && Array.isArray(baseline.value)
      ? baseline.value
      : undefined;
  const baselineItems =
    baselineArray === undefined
      ? ({ success: true, value: [] } as const)
      : inspectConstructionCollection(
          baselineArray,
          definition.identity.property,
          path,
        );
  if (!baselineItems.success) return baselineItems;
  const baselineById = new Map(
    baselineItems.value.map((item) => [item.id, item] as const),
  );
  const candidates: Array<{
    readonly item: object;
    readonly baseline?: ConstructionCollectionItem;
    readonly current: ConstructionCollectionItem;
    readonly changed: boolean;
  }> = [];
  let itemsChanged = false;
  for (const currentItem of currentItems.value) {
    const baselineItem = baselineById.get(currentItem.id);
    const reconstructed = reconstructCollectionItem(
      definition,
      baselineItem?.value,
      currentItem.value,
      [...path, currentItem.index],
    );
    if (!reconstructed.success) return reconstructed;
    candidates.push({
      item: reconstructed.value.value,
      ...(baselineItem === undefined ? {} : { baseline: baselineItem }),
      current: currentItem,
      changed: reconstructed.value.changed,
    });
    if (reconstructed.value.changed || baselineItem === undefined) {
      itemsChanged = true;
    }
  }
  const sameOrder =
    baselineArray !== undefined &&
    baselineItems.value.length === currentItems.value.length &&
    baselineItems.value.every(
      (item, index) => item.id === currentItems.value[index]?.id,
    );
  if (sameOrder && !itemsChanged) {
    return {
      success: true,
      value: { presence: baseline, changed: false },
    };
  }
  const rebuilt = buildCollectionArray(baselineArray, candidates, path);
  if (!rebuilt.success) return rebuilt;
  return {
    success: true,
    value: {
      presence: { kind: 'value', value: rebuilt.value },
      changed: true,
    },
  };
}

function inspectConstructionCollection(
  array: readonly unknown[],
  identityProperty: string,
  path: readonly (string | number)[],
): ConstructionResult<readonly ConstructionCollectionItem[]> {
  const length = readArrayLength(array);
  if (length === undefined) {
    return { success: false, failure: { reason: 'inspection-failed', path } };
  }
  const items: ConstructionCollectionItem[] = [];
  for (let index = 0; index < length; index += 1) {
    const slot = readOwn(array, String(index));
    if (!slot.success || slot.member.kind !== 'value') {
      return {
        success: false,
        failure: { reason: 'inspection-failed', path: [...path, index] },
      };
    }
    let ordinary: boolean;
    try {
      ordinary = isOrdinaryObject(slot.member.value);
    } catch {
      return {
        success: false,
        failure: { reason: 'inspection-failed', path: [...path, index] },
      };
    }
    if (!ordinary) {
      return {
        success: false,
        failure: { reason: 'inspection-failed', path: [...path, index] },
      };
    }
    const identity = readOwn(slot.member.value as object, identityProperty);
    const indexDescriptor = safeOwnDescriptor(array, String(index), [
      ...path,
      index,
    ]);
    if (
      !identity.success ||
      identity.member.kind !== 'value' ||
      typeof identity.member.value !== 'string' ||
      !indexDescriptor.success
    ) {
      return {
        success: false,
        failure: { reason: 'inspection-failed', path: [...path, index] },
      };
    }
    items.push({
      id: identity.member.value,
      index,
      value: slot.member.value as object,
      indexDescriptor: indexDescriptor.value,
    });
  }
  return { success: true, value: items };
}

function reconstructCollectionItem(
  definition: ArrayNodeDefinition,
  baseline: object | undefined,
  current: object,
  path: readonly (string | number)[],
): ConstructionResult<{ readonly value: object; readonly changed: boolean }> {
  const changes: Array<readonly [string, ManagedPresence]> = [];
  const projected: Array<readonly [string, unknown]> = [];
  for (const child of definition.item.children) {
    const childPath = [...path, child.name];
    const currentMember = readOwn(current, child.name);
    const baselineMember =
      baseline === undefined
        ? ({ success: true, member: { kind: 'missing' } } as const)
        : readOwn(baseline, child.name);
    if (
      !currentMember.success ||
      !baselineMember.success ||
      currentMember.member.kind === 'accessor' ||
      baselineMember.member.kind === 'accessor'
    ) {
      return {
        success: false,
        failure: { reason: 'inspection-failed', path: childPath },
      };
    }
    const result = reconstructManagedNode(
      child,
      readResultPresence(baselineMember.member),
      readResultPresence(currentMember.member),
      childPath,
    );
    if (!result.success) return result;
    if (result.value.changed) {
      changes.push([child.name, result.value.presence]);
    }
    if (result.value.presence.kind === 'value') {
      projected.push([child.name, result.value.presence.value]);
    }
  }
  if (baseline !== undefined) {
    if (changes.length === 0) {
      return { success: true, value: { value: baseline, changed: false } };
    }
    const cloned = cloneObjectMembers(baseline, changes, path);
    return cloned.success
      ? { success: true, value: { value: cloned.value, changed: true } }
      : cloned;
  }
  const identity = readOwn(current, definition.identity.property);
  if (!identity.success || identity.member.kind !== 'value') {
    return { success: false, failure: { reason: 'inspection-failed', path } };
  }
  const created = createProjectedObject(
    current,
    [[definition.identity.property, identity.member.value], ...projected],
    path,
  );
  return created.success
    ? { success: true, value: { value: created.value, changed: true } }
    : created;
}

function buildCollectionArray(
  baseline: readonly unknown[] | undefined,
  candidates: readonly {
    readonly item: object;
    readonly baseline?: ConstructionCollectionItem;
  }[],
  path: readonly (string | number)[],
): ConstructionResult<readonly unknown[]> {
  const result: unknown[] = [];
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    if (candidate === undefined) continue;
    const descriptor =
      candidate.baseline === undefined
        ? ordinaryDescriptor(candidate.item)
        : { ...candidate.baseline.indexDescriptor, value: candidate.item };
    try {
      Object.defineProperty(result, String(index), descriptor);
    } catch {
      return { success: false, failure: { reason: 'clone-failed', path } };
    }
  }
  if (baseline !== undefined) {
    let keys: readonly PropertyKey[];
    try {
      keys = Reflect.ownKeys(baseline);
    } catch {
      return { success: false, failure: { reason: 'inspection-failed', path } };
    }
    for (const key of keys) {
      if (key === 'length' || isArrayIndexKey(key)) continue;
      const descriptor = safeOwnDescriptor(baseline, key, path);
      if (!descriptor.success) return descriptor;
      try {
        Object.defineProperty(result, key, descriptor.value);
      } catch {
        return { success: false, failure: { reason: 'clone-failed', path } };
      }
    }
  }
  return { success: true, value: result };
}

function safeOwnDescriptor(
  value: object,
  key: PropertyKey,
  path: readonly (string | number)[],
): ConstructionResult<PropertyDescriptor> {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor === undefined
      ? { success: false, failure: { reason: 'inspection-failed', path } }
      : { success: true, value: descriptor };
  } catch {
    return { success: false, failure: { reason: 'inspection-failed', path } };
  }
}

function isArrayIndexKey(key: PropertyKey): boolean {
  if (typeof key !== 'string' || key.length === 0) return false;
  const numeric = Number(key);
  return (
    Number.isInteger(numeric) &&
    numeric >= 0 &&
    numeric < 4_294_967_295 &&
    String(numeric) === key
  );
}

function terminalReconstruction(
  baseline: ManagedPresence,
  current: ManagedPresence,
): ManagedReconstruction {
  if (baseline.kind === 'missing' && current.kind === 'missing') {
    return { presence: { kind: 'missing' }, changed: false };
  }
  if (current.kind === 'missing') {
    return { presence: { kind: 'missing' }, changed: true };
  }
  if (baseline.kind === 'missing') {
    return { presence: current, changed: true };
  }
  return Object.is(baseline.value, current.value)
    ? { presence: baseline, changed: false }
    : { presence: current, changed: true };
}

function readResultPresence(member: ReadResult): ManagedPresence {
  return member.kind === 'missing'
    ? { kind: 'missing' }
    : member.kind === 'value'
      ? { kind: 'value', value: member.value }
      : { kind: 'missing' };
}

function cloneObjectMember(
  source: object,
  member: string,
  presence: ManagedPresence,
  path: readonly (string | number)[],
): ConstructionResult<object> {
  return cloneObjectMembers(source, [[member, presence]], path);
}

function cloneObjectMembers(
  source: object,
  changes: readonly (readonly [string, ManagedPresence])[],
  path: readonly (string | number)[],
): ConstructionResult<object> {
  const byName = new Map(changes);
  let prototype: object | null;
  let keys: readonly PropertyKey[];
  try {
    const inspectedPrototype: unknown = Object.getPrototypeOf(source);
    if (inspectedPrototype !== null && typeof inspectedPrototype !== 'object') {
      return {
        success: false,
        failure: { reason: 'inspection-failed', path },
      };
    }
    prototype = inspectedPrototype;
    keys = Reflect.ownKeys(source);
  } catch {
    return { success: false, failure: { reason: 'inspection-failed', path } };
  }
  let clone: object;
  try {
    clone = Object.create(prototype) as object;
  } catch {
    return { success: false, failure: { reason: 'clone-failed', path } };
  }
  const handled = new Set<string>();
  for (const key of keys) {
    const changed = typeof key === 'string' ? byName.get(key) : undefined;
    let descriptor: PropertyDescriptor | undefined;
    if (changed !== undefined) {
      handled.add(key as string);
      if (changed.kind === 'value')
        descriptor = ordinaryDescriptor(changed.value);
    } else {
      try {
        descriptor = Object.getOwnPropertyDescriptor(source, key);
      } catch {
        return {
          success: false,
          failure: { reason: 'inspection-failed', path },
        };
      }
      if (descriptor === undefined) {
        return {
          success: false,
          failure: { reason: 'inspection-failed', path },
        };
      }
    }
    if (descriptor !== undefined) {
      try {
        Object.defineProperty(clone, key, descriptor);
      } catch {
        return { success: false, failure: { reason: 'clone-failed', path } };
      }
    }
  }
  for (const [name, changed] of changes) {
    if (handled.has(name) || changed.kind === 'missing') continue;
    try {
      Object.defineProperty(clone, name, ordinaryDescriptor(changed.value));
    } catch {
      return { success: false, failure: { reason: 'clone-failed', path } };
    }
  }
  return { success: true, value: clone };
}

function createProjectedObject(
  current: object,
  entries: readonly (readonly [string, unknown])[],
  path: readonly (string | number)[],
): ConstructionResult<object> {
  let prototype: object | null;
  try {
    const inspectedPrototype: unknown = Object.getPrototypeOf(current);
    if (inspectedPrototype !== null && typeof inspectedPrototype !== 'object') {
      return {
        success: false,
        failure: { reason: 'inspection-failed', path },
      };
    }
    prototype = inspectedPrototype;
  } catch {
    return { success: false, failure: { reason: 'inspection-failed', path } };
  }
  let projected: object;
  try {
    projected = Object.create(prototype) as object;
    for (const [name, value] of entries) {
      Object.defineProperty(projected, name, ordinaryDescriptor(value));
    }
  } catch {
    return { success: false, failure: { reason: 'clone-failed', path } };
  }
  return { success: true, value: projected };
}

function ordinaryDescriptor(value: unknown): PropertyDescriptor {
  return {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  };
}

function constructionFailureResult<TData extends object>(
  baselineValue: Readonly<TData>,
  failure: ConstructionFailure,
): ApplyOperationResult<TData> {
  return Object.freeze({
    success: false,
    value: baselineValue,
    changed: false,
    diagnostics: Object.freeze([
      frozenDiagnostic(
        'BASELINE_CONFIRMATION_FAILED',
        {
          reason: failure.reason,
          ...(failure.path === undefined ? {} : { path: failure.path }),
        },
        'Baseline confirmation failed.',
        failure.path,
      ),
    ]),
  });
}

function comparePreparedTargets(
  left: PreparedScopeTarget,
  right: PreparedScopeTarget,
): number {
  const leftOrder = left.kind === 'static' ? left.order : left.collectionOrder;
  const rightOrder =
    right.kind === 'static' ? right.order : right.collectionOrder;
  if (leftOrder !== rightOrder) return leftOrder - rightOrder;
  if (left.kind === 'static' || right.kind === 'static') {
    return left.kind === 'static' ? -1 : 1;
  }
  if (left.baselineIndex !== right.baselineIndex) {
    return left.baselineIndex - right.baselineIndex;
  }
  if (left.kind === 'item' || right.kind === 'item') {
    return left.kind === 'item' ? -1 : 1;
  }
  return left.templateOrder - right.templateOrder;
}

function stableParameters(
  target: Exclude<ParsedTarget, { readonly kind: 'static' }>,
): Readonly<Record<string, unknown>> {
  return {
    collectionPath: target.collectionPath,
    itemId: target.itemId,
    ...(target.kind === 'node' ? { relativePath: target.relativePath } : {}),
  };
}

function copyStringArrayMember(
  value: object,
  memberName: string,
  allowEmpty: boolean,
): readonly string[] | undefined {
  const member = readOwn(value, memberName);
  return member.success && member.member.kind === 'value'
    ? copyStringArray(member.member.value, allowEmpty)
    : undefined;
}

function copyStringArray(
  value: unknown,
  allowEmpty: boolean,
): readonly string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const length = readArrayLength(value);
  if (length === undefined || (!allowEmpty && length === 0)) return undefined;
  const copied: string[] = [];
  for (let index = 0; index < length; index += 1) {
    const member = readOwn(value, String(index));
    if (
      !member.success ||
      member.member.kind !== 'value' ||
      typeof member.member.value !== 'string'
    ) {
      return undefined;
    }
    copied.push(member.member.value);
  }
  return Object.freeze(copied);
}

function readOwn(value: object, key: PropertyKey): SafeReadResult {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined) {
      return { success: true, member: { kind: 'missing' } };
    }
    return 'value' in descriptor
      ? { success: true, member: { kind: 'value', value: descriptor.value } }
      : { success: true, member: { kind: 'accessor' } };
  } catch {
    return { success: false };
  }
}

function readArrayLength(value: readonly unknown[]): number | undefined {
  const length = readOwn(value, 'length');
  return length.success &&
    length.member.kind === 'value' &&
    typeof length.member.value === 'number' &&
    Number.isSafeInteger(length.member.value) &&
    length.member.value >= 0
    ? length.member.value
    : undefined;
}

function invalidScopeMember(
  scopeMember: 'id' | 'paths' | 'includeGlobalIssues',
  member: ReadResult,
): Diagnostic {
  if (member.kind === 'missing' || member.kind === 'accessor') {
    return invalidInput({
      member: 'scope',
      scopeMember,
      expected: 'valid FormScope',
      reason: member.kind === 'missing' ? 'missing-member' : 'accessor-member',
    });
  }
  return invalidInput({
    member: 'scope',
    scopeMember,
    expected: 'valid FormScope',
    reason: 'invalid-value',
    ...describeActualValue(member.value),
  });
}

function invalidRootInspection(side: Side): Diagnostic {
  return invalidInput({
    member: sideMember(side),
    expected: 'ordinary data tree at managed paths',
    reason: 'inspection-failed',
  });
}

function invalidScopeInspection(): Diagnostic {
  return invalidInput({
    member: 'scope',
    expected: 'valid FormScope',
    reason: 'inspection-failed',
  });
}

function rootAccessor(
  side: Side,
  path: readonly (string | number)[],
): Diagnostic {
  return frozenDiagnostic(
    'INVALID_BASELINE_CONFIRMATION',
    {
      member: sideMember(side),
      expected: 'ordinary data tree at managed paths',
      reason: 'accessor-member',
      propertyReason: 'accessor',
    },
    'Baseline confirmation input is invalid.',
    path,
  );
}

function sideMember(side: Side): 'baselineValue' | 'currentValue' {
  return side === 'baseline' ? 'baselineValue' : 'currentValue';
}

function invalidInput(
  parameters: Readonly<Record<string, unknown>>,
): Diagnostic {
  return frozenDiagnostic(
    'INVALID_BASELINE_CONFIRMATION',
    parameters,
    'Baseline confirmation input is invalid.',
  );
}

function targetDiagnostic(
  scopeId: string,
  targetIndex: number,
  reason: string,
  parameters: Readonly<Record<string, unknown>> = {},
  dataPath?: readonly (string | number)[],
): Diagnostic {
  return frozenDiagnostic(
    'UNCONFIRMABLE_SCOPE_TARGET',
    { scopeId, targetIndex, reason, ...parameters },
    'Scope target cannot be confirmed in baseline.',
    dataPath,
  );
}

function definitionDiagnostic(defect: NestedDefinitionDefect): Diagnostic {
  return frozenDiagnostic(
    'INVALID_FORM_DEFINITION',
    {
      reason: defect.reason,
      ...(defect.nodeIndexPath === undefined
        ? {}
        : { nodeIndexPath: defect.nodeIndexPath }),
      ...(defect.firstNodeIndexPath === undefined
        ? {}
        : { firstNodeIndexPath: defect.firstNodeIndexPath }),
      ...(defect.templateIndexPath === undefined
        ? {}
        : { templateIndexPath: defect.templateIndexPath }),
      ...(defect.firstTemplateIndexPath === undefined
        ? {}
        : { firstTemplateIndexPath: defect.firstTemplateIndexPath }),
      ...(defect.fieldIndex === undefined
        ? {}
        : { fieldIndex: defect.fieldIndex }),
      ...(defect.path === undefined ? {} : { path: defect.path }),
      ...(defect.relativePath === undefined
        ? {}
        : { relativePath: defect.relativePath }),
      ...(defect.presentationIndexPath === undefined
        ? {}
        : { presentationIndexPath: defect.presentationIndexPath }),
      ...(defect.presentationOwnerKind === undefined
        ? {}
        : { presentationOwnerKind: defect.presentationOwnerKind }),
      ...(defect.presentationOwnerPath === undefined
        ? {}
        : { presentationOwnerPath: defect.presentationOwnerPath }),
      ...(defect.presentationTemplatePath === undefined
        ? {}
        : { presentationTemplatePath: defect.presentationTemplatePath }),
      ...(defect.member === undefined ? {} : { member: defect.member }),
      ...(defect.expected === undefined ? {} : { expected: defect.expected }),
      ...(defect.actualType === undefined
        ? {}
        : { actualType: defect.actualType }),
      ...(Object.hasOwn(defect, 'actualValue')
        ? { actualValue: defect.actualValue }
        : {}),
      ...(defect.members === undefined ? {} : { members: defect.members }),
      ...(defect.conditionMember === undefined
        ? {}
        : { conditionMember: defect.conditionMember }),
      ...(defect.conditionReason === undefined
        ? {}
        : { conditionReason: defect.conditionReason }),
      ...(defect.conditionDetailMember === undefined
        ? {}
        : { member: defect.conditionDetailMember }),
      ...(defect.conditionExpected === undefined
        ? {}
        : { expected: defect.conditionExpected }),
      ...(defect.conditionActualType === undefined
        ? {}
        : { actualType: defect.conditionActualType }),
      ...(defect.conditionActualLength === undefined
        ? {}
        : { actualLength: defect.conditionActualLength }),
      ...(defect.conditionIndex === undefined
        ? {}
        : { index: defect.conditionIndex }),
      ...(defect.conditionPathKey === undefined
        ? {}
        : { pathKey: defect.conditionPathKey }),
      ...(defect.sourcePath === undefined
        ? {}
        : { sourcePath: defect.sourcePath }),
      ...(defect.sourceReason === undefined
        ? {}
        : { sourceReason: defect.sourceReason }),
      ...(defect.sourceKind === undefined
        ? {}
        : { sourceKind: defect.sourceKind }),
      ...(defect.sourceNullable === undefined
        ? {}
        : { sourceNullable: defect.sourceNullable }),
      ...(defect.conditionTargetCapability === undefined
        ? {}
        : { targetCapability: defect.conditionTargetCapability }),
      ...(defect.conditionLocation === undefined
        ? {}
        : { location: defect.conditionLocation }),
    },
    'Form definition is invalid.',
  );
}

function invalidDefinitionFallback(
  reason: NestedDefinitionDefect['reason'],
): Diagnostic {
  return frozenDiagnostic(
    'INVALID_FORM_DEFINITION',
    { reason },
    'Form definition is invalid.',
  );
}

function frozenDiagnostic(
  code: string,
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
  dataPath?: readonly (string | number)[],
): Diagnostic {
  const copiedParameters: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parameters)) {
    copiedParameters[key] = isUnknownArray(value)
      ? Object.freeze(value.map((entry) => entry))
      : value;
  }
  const diagnostic: Diagnostic = {
    code,
    severity: 'error',
    source: 'runtime',
    ...(dataPath === undefined
      ? {}
      : { dataPath: Object.freeze([...dataPath]) }),
    parameters: Object.freeze(copiedParameters),
    fallbackMessage,
  };
  return Object.freeze(diagnostic);
}

function failedPreparation<TData extends object>(
  baselineValue: Readonly<TData>,
  diagnostics: Diagnostic | readonly Diagnostic[],
): ScopeBaselinePreparation<TData> {
  const entries: readonly Diagnostic[] = isDiagnosticArray(diagnostics)
    ? diagnostics
    : [diagnostics];
  const result: ApplyOperationResult<TData> = Object.freeze({
    success: false,
    value: baselineValue,
    changed: false,
    diagnostics: Object.freeze([...entries]),
  });
  return Object.freeze({ success: false, result });
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isDiagnosticArray(
  value: Diagnostic | readonly Diagnostic[],
): value is readonly Diagnostic[] {
  return Array.isArray(value);
}

function samePath(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((segment, index) => segment === right[index])
  );
}

function isPrefix(prefix: readonly string[], path: readonly string[]): boolean {
  return (
    prefix.length < path.length &&
    prefix.every((segment, index) => segment === path[index])
  );
}
