// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type { FieldDefinition } from '../contracts.js';
import { canonicalTemplateKey } from './collection-address.js';
import {
  canonicalDataPathKey,
  copyStringDataPath,
  isOrdinaryObject,
  readOwnDataMember,
  sameDataPath,
} from './path.js';
import { actualType } from './value.js';

export type NestedDefinitionReason =
  | 'nodes-not-array'
  | 'invalid-node'
  | 'cyclic-node'
  | 'reused-node'
  | 'duplicate-node-path'
  | 'inconsistent-leaf-projection'
  | 'invalid-array-node'
  | 'invalid-item-identity'
  | 'invalid-item-template'
  | 'cyclic-template'
  | 'reused-template'
  | 'duplicate-template-path'
  | 'inconsistent-template-leaf-projection'
  | 'identity-template-overlap'
  | 'nested-array-template'
  | 'missing-presentation'
  | 'invalid-presentation-entry'
  | 'invalid-presentation-section'
  | 'invalid-presentation-section-key'
  | 'invalid-presentation-tabs'
  | 'invalid-presentation-accordion'
  | 'invalid-presentation-panel'
  | 'invalid-presentation-grid'
  | 'invalid-presentation-grid-item'
  | 'invalid-presentation-entry-key'
  | 'cyclic-presentation'
  | 'duplicate-presentation-section-id'
  | 'duplicate-presentation-container-id'
  | 'duplicate-presentation-panel-id'
  | 'unknown-presented-node'
  | 'duplicate-presented-node'
  | 'missing-presented-node'
  | 'invalid-string-enum-array-field'
  | 'invalid-field-nullable'
  | 'invalid-field-fixed-value'
  | 'incompatible-field-capabilities'
  | 'invalid-field-condition'
  | 'invalid-field-condition-group'
  | 'nested-field-condition-group'
  | 'unsupported-field-condition-location'
  | 'field-condition-target-incompatible'
  | 'field-condition-source-not-managed'
  | 'field-condition-literal-incompatible';

export interface NestedDefinitionDefect {
  readonly reason: NestedDefinitionReason;
  readonly nodeIndexPath?: readonly number[];
  readonly firstNodeIndexPath?: readonly number[];
  readonly templateIndexPath?: readonly number[];
  readonly firstTemplateIndexPath?: readonly number[];
  readonly fieldIndex?: number;
  readonly path?: readonly string[];
  readonly relativePath?: readonly string[];
  readonly presentationIndexPath?: readonly number[];
  readonly presentationOwnerKind?: 'object' | 'item' | 'template-object';
  readonly presentationOwnerPath?: readonly string[];
  readonly presentationTemplatePath?: readonly string[];
  readonly member?:
    | 'nullable'
    | 'placeholder'
    | 'fixedValue'
    | 'visibleWhen'
    | 'enabledWhen'
    | 'choices'
    | `choices.${number}`
    | `choices.${number}.value`
    | `choices.${number}.label`;
  readonly expected?: string;
  readonly actualType?: string;
  readonly actualValue?: unknown;
  readonly members?:
    readonly ['nullable', 'choices'] | readonly ['fixedValue', 'choices'];
  readonly conditionMember?: 'visibleWhen' | 'enabledWhen';
  readonly conditionReason?:
    'not-object' | 'member-missing' | 'member-accessor' | 'member-invalid';
  readonly conditionGroupReason?:
    | 'shape-mixed'
    | 'member-missing'
    | 'member-accessor'
    | 'member-invalid'
    | 'empty'
    | 'member-not-object';
  readonly conditionDetailMember?:
    'condition' | 'sourcePath' | 'equals' | 'operator' | 'conditions';
  readonly conditionExpected?: string;
  readonly conditionActualType?: string;
  readonly conditionActualLength?: number;
  readonly conditionActualOperator?: string;
  readonly conditionIndex?: number;
  readonly conditionPathKey?: string;
  readonly conditionGroupIndex?: number;
  readonly conditionGroupKey?: string;
  readonly sourcePath?: readonly string[];
  readonly sourceReason?: 'unmanaged' | 'object' | 'array' | 'below-collection';
  readonly sourceKind?: 'string' | 'number' | 'integer' | 'boolean';
  readonly sourceNullable?: boolean;
  readonly conditionTargetCapability?: 'fixed-value';
  readonly conditionLocation?: 'template-field';
}

export type NestedDefinitionValidationResult =
  | {
      readonly success: true;
    }
  | {
      readonly success: false;
      readonly defect: NestedDefinitionDefect;
    };

interface EnterFrame {
  readonly phase: 'enter';
  readonly value: unknown;
  readonly indexPath: readonly number[];
  readonly parentPath?: readonly string[];
}

interface ExitFrame {
  readonly phase: 'exit';
  readonly value: object;
}

type Frame = EnterFrame | ExitFrame;

type DefinitionConditionMember = 'visibleWhen' | 'enabledWhen';

type CapturedDefinitionCondition =
  | { readonly kind: 'accessor' }
  | { readonly kind: 'value'; readonly value: unknown };

interface DefinitionFieldConditionTarget {
  readonly field: object;
  readonly nodeIndexPath: readonly number[];
  readonly path: readonly string[];
  readonly kind: 'string' | 'number' | 'integer' | 'boolean';
  readonly nullable: boolean;
  readonly fixed: boolean;
  readonly visibleWhen: CapturedDefinitionCondition | undefined;
  readonly enabledWhen: CapturedDefinitionCondition | undefined;
}

interface DefinitionTemplateConditionTarget {
  readonly templateIndexPath: readonly number[];
  readonly relativePath: readonly string[];
  readonly visibleWhen: CapturedDefinitionCondition | undefined;
  readonly enabledWhen: CapturedDefinitionCondition | undefined;
}

interface DetachedDefinitionConditionPredicate {
  readonly kind: 'predicate';
  readonly sourcePath: readonly string[];
  readonly equals: string | number | boolean | null;
}

interface DetachedDefinitionConditionGroup {
  readonly kind: 'group';
  readonly operator: 'all' | 'any';
  readonly conditions: readonly DetachedDefinitionConditionPredicate[];
}

type DetachedDefinitionConditionValue =
  DetachedDefinitionConditionPredicate | DetachedDefinitionConditionGroup;

interface DetachedDefinitionCondition {
  readonly target: DefinitionFieldConditionTarget;
  readonly member: DefinitionConditionMember;
  readonly condition: DetachedDefinitionConditionValue;
}

export function validateNestedFormDefinition(
  value: unknown,
): NestedDefinitionValidationResult {
  const defects = collectFormDefinitionDefects(value, false);
  const first = defects[0];
  return first === undefined
    ? Object.freeze({ success: true })
    : { success: false, defect: first };
}

export function collectNestedFormDefinitionDefects(
  value: unknown,
): readonly NestedDefinitionDefect[] {
  return collectFormDefinitionDefects(value, false);
}

export function validateCollectionFormDefinition(
  value: unknown,
): NestedDefinitionValidationResult {
  const defects = collectFormDefinitionDefects(value, true);
  const first = defects[0];
  return first === undefined
    ? Object.freeze({ success: true })
    : { success: false, defect: first };
}

export function collectCollectionFormDefinitionDefects(
  value: unknown,
): readonly NestedDefinitionDefect[] {
  return collectFormDefinitionDefects(value, true);
}

function collectFormDefinitionDefects(
  value: unknown,
  allowCollections: boolean,
): readonly NestedDefinitionDefect[] {
  if (!isOrdinaryObject(value)) {
    return Object.freeze([makeDefect('nodes-not-array')]);
  }

  const nodesMember = readOwnDataMember(value, 'nodes');
  if (nodesMember.kind !== 'value' || !Array.isArray(nodesMember.value)) {
    return Object.freeze([makeDefect('nodes-not-array')]);
  }
  const fieldsMember = readOwnDataMember(value, 'fields');
  if (fieldsMember.kind !== 'value' || !Array.isArray(fieldsMember.value)) {
    return Object.freeze([
      makeDefect('inconsistent-leaf-projection', { fieldIndex: 0 }),
    ]);
  }

  const nodes = nodesMember.value;
  const fields = fieldsMember.value;
  const leaves: FieldDefinition[] = [];
  const firstIdentity = new Map<object, readonly number[]>();
  const active = new Map<object, readonly number[]>();
  const firstPath = new Map<string, readonly number[]>();
  const stack: Frame[] = [];
  const defects: NestedDefinitionDefect[] = [];
  const fieldConditionTargets: DefinitionFieldConditionTarget[] = [];
  const templateConditionTargets: DefinitionTemplateConditionTarget[] = [];
  const objectPaths = new Set<string>();
  const arrayPaths = new Set<string>();
  const collectionPaths: (readonly string[])[] = [];

  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const member = readOwnDataMember(nodes, String(index));
    stack.push({
      phase: 'enter',
      value: member.kind === 'value' ? member.value : undefined,
      indexPath: Object.freeze([index]),
    });
  }

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.phase === 'exit') {
      active.delete(frame.value);
      continue;
    }

    if (!isOrdinaryObject(frame.value)) {
      defects.push(
        makeDefect('invalid-node', { nodeIndexPath: frame.indexPath }),
      );
      continue;
    }
    const node = frame.value;
    const activeIndex = active.get(node);
    if (activeIndex !== undefined) {
      defects.push(
        makeDefect('cyclic-node', {
          nodeIndexPath: frame.indexPath,
          firstNodeIndexPath: activeIndex,
        }),
      );
      continue;
    }
    const firstIndex = firstIdentity.get(node);
    if (firstIndex !== undefined) {
      defects.push(
        makeDefect('reused-node', {
          nodeIndexPath: frame.indexPath,
          firstNodeIndexPath: firstIndex,
        }),
      );
      continue;
    }

    const inspected = inspectNode(node, frame.parentPath, allowCollections);
    if (!inspected.success) {
      defects.push(
        makeDefect(inspected.reason, {
          nodeIndexPath: frame.indexPath,
          ...(inspected.path === undefined ? {} : { path: inspected.path }),
          ...(inspected.member === undefined
            ? {}
            : { member: inspected.member }),
          ...(inspected.expected === undefined
            ? {}
            : { expected: inspected.expected }),
          ...(inspected.actualType === undefined
            ? {}
            : { actualType: inspected.actualType }),
          ...(Object.hasOwn(inspected, 'actualValue')
            ? { actualValue: inspected.actualValue }
            : {}),
          ...(inspected.members === undefined
            ? {}
            : { members: inspected.members }),
        }),
      );
      if (
        inspected.reason === 'invalid-field-nullable' ||
        inspected.reason === 'invalid-field-fixed-value' ||
        inspected.reason === 'incompatible-field-capabilities' ||
        inspected.reason === 'invalid-string-enum-array-field'
      ) {
        leaves.push(node as FieldDefinition);
      }
      continue;
    }
    const duplicateIndex = firstPath.get(inspected.key);
    if (duplicateIndex !== undefined) {
      defects.push(
        makeDefect('duplicate-node-path', {
          nodeIndexPath: frame.indexPath,
          firstNodeIndexPath: duplicateIndex,
          path: inspected.path,
        }),
      );
      continue;
    }

    firstIdentity.set(node, frame.indexPath);
    firstPath.set(inspected.key, frame.indexPath);
    active.set(node, frame.indexPath);
    stack.push({ phase: 'exit', value: node });

    if (inspected.kind === 'field') {
      leaves.push(node as FieldDefinition);
      if (readValue(node, 'kind') !== 'string-enum-array') {
        fieldConditionTargets.push(
          captureFieldConditionTarget(node, frame.indexPath, inspected.path),
        );
      }
      continue;
    }

    if (inspected.kind === 'array') {
      arrayPaths.add(canonicalDataPathKey(inspected.path));
      collectionPaths.push(inspected.path);
      defects.push(
        ...collectTemplateDefects(
          inspected.item.children,
          inspected.item.fields,
          inspected.path,
          inspected.identityProperty,
          templateConditionTargets,
        ),
      );
      continue;
    }

    objectPaths.add(canonicalDataPathKey(inspected.path));

    for (let index = inspected.children.length - 1; index >= 0; index -= 1) {
      const member = readOwnDataMember(inspected.children, String(index));
      stack.push({
        phase: 'enter',
        value: member.kind === 'value' ? member.value : undefined,
        indexPath: Object.freeze([...frame.indexPath, index]),
        parentPath: inspected.path,
      });
    }
  }

  if (fields.length !== leaves.length) {
    defects.push(
      makeDefect('inconsistent-leaf-projection', {
        fieldIndex: Math.min(fields.length, leaves.length),
      }),
    );
  }
  const comparableLength = Math.min(fields.length, leaves.length);
  for (let index = 0; index < comparableLength; index += 1) {
    const member = readOwnDataMember(fields, String(index));
    if (member.kind !== 'value' || member.value !== leaves[index]) {
      defects.push(
        makeDefect('inconsistent-leaf-projection', { fieldIndex: index }),
      );
    }
  }

  if (defects.length === 0) {
    defects.push(...collectPresentationDefects(value, nodes));
    defects.push(...collectLocalPresentationDefects(nodes));
  }

  const baseDefinitionValid = defects.length === 0;
  const detachedConditions: DetachedDefinitionCondition[] = [];
  collectDefinitionConditionShapeDefects(
    fieldConditionTargets,
    templateConditionTargets,
    detachedConditions,
    defects,
  );
  if (baseDefinitionValid && defects.length === 0) {
    collectDefinitionConditionSemanticDefects(
      detachedConditions,
      fieldConditionTargets,
      objectPaths,
      arrayPaths,
      collectionPaths,
      defects,
    );
  }

  return Object.freeze(defects);
}

type PresentationOwner =
  | {
      readonly kind: 'object';
      readonly path: readonly string[];
      readonly key: readonly ['object', readonly string[]];
    }
  | {
      readonly kind: 'item';
      readonly path: readonly string[];
      readonly templatePath: readonly [];
      readonly key: readonly ['item-template', readonly string[]];
    }
  | {
      readonly kind: 'template-object';
      readonly path: readonly string[];
      readonly templatePath: readonly string[];
      readonly key: readonly [
        'item-template-object',
        readonly string[],
        readonly string[],
      ];
    };

function collectPresentationDefects(
  definition: object,
  nodes: readonly unknown[],
  owner?: PresentationOwner,
): readonly NestedDefinitionDefect[] {
  const defects = collectUnscopedPresentationDefects(definition, nodes, owner);
  if (owner === undefined || defects.length === 0) return defects;
  return Object.freeze(
    defects.map((defect) => {
      const { reason, ...locators } = defect;
      return makeDefect(reason, {
        ...locators,
        presentationOwnerKind: owner.kind,
        presentationOwnerPath: Object.freeze([...owner.path]),
        ...(owner.kind === 'object'
          ? {}
          : {
              presentationTemplatePath: Object.freeze([...owner.templatePath]),
            }),
      });
    }),
  );
}

function collectUnscopedPresentationDefects(
  definition: object,
  nodes: readonly unknown[],
  owner: PresentationOwner | undefined,
): readonly NestedDefinitionDefect[] {
  const member = readOwnDataMember(definition, 'presentation');
  if (member.kind !== 'value' || !Array.isArray(member.value)) {
    return [makeDefect('missing-presentation')];
  }
  const expected = new Set<object>(
    nodes.filter((node): node is object => isOrdinaryObject(node)),
  );
  const seen = new Set<object>();
  const containerIds = new Set<string>();
  const active = new Set<object>();
  type PresentationFrame =
    | { phase: 'enter'; value: unknown; path: readonly number[] }
    | {
        phase: 'panel';
        value: unknown;
        path: readonly number[];
        ownerKind: 'tabs' | 'accordion';
        ownerId: string;
        panelIds: Set<string>;
      }
    | {
        phase: 'grid-item';
        value: unknown;
        path: readonly number[];
        gridId: string;
        columns: 1 | 2 | 3 | 4;
        itemIndex: number;
      }
    | { phase: 'exit'; value: object };
  const stack: PresentationFrame[] = [];
  const pushEntries = (
    entries: readonly unknown[],
    parentPath: readonly number[],
  ): void => {
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const child = readOwnDataMember(entries, String(index));
      stack.push({
        phase: 'enter',
        value: child.kind === 'value' ? child.value : undefined,
        path: Object.freeze([...parentPath, index]),
      });
    }
  };
  for (let index = member.value.length - 1; index >= 0; index -= 1) {
    const entry = readOwnDataMember(member.value, String(index));
    stack.push({
      phase: 'enter',
      value: entry.kind === 'value' ? entry.value : undefined,
      path: Object.freeze([index]),
    });
  }
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.phase === 'exit') {
      active.delete(frame.value);
      continue;
    }
    if (frame.phase === 'panel') {
      if (!isOrdinaryObject(frame.value)) {
        return [
          makeDefect('invalid-presentation-panel', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      const panel = frame.value;
      const kind = readOwnDataMember(panel, 'kind');
      const id = readOwnDataMember(panel, 'id');
      const key = readOwnDataMember(panel, 'key');
      const label = readOwnDataMember(panel, 'label');
      const children = readOwnDataMember(panel, 'children');
      if (
        kind.kind !== 'value' ||
        kind.value !== 'panel' ||
        !isNonEmptyStringMember(id) ||
        !isNonBlankStringMember(label) ||
        !isDenseNonEmptyArrayMember(children)
      ) {
        return [
          makeDefect('invalid-presentation-panel', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      if (active.has(panel)) {
        return [
          makeDefect('cyclic-presentation', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      if (
        key.kind !== 'value' ||
        key.value !==
          presentationEntryKey(owner, [
            frame.ownerKind,
            frame.ownerId,
            'panel',
            id.value,
          ])
      ) {
        return [
          makeDefect('invalid-presentation-entry-key', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      if (frame.panelIds.has(id.value)) {
        return [
          makeDefect('duplicate-presentation-panel-id', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      frame.panelIds.add(id.value);
      active.add(panel);
      stack.push({ phase: 'exit', value: panel });
      pushEntries(children.value, frame.path);
      continue;
    }
    if (frame.phase === 'grid-item') {
      if (!isOrdinaryObject(frame.value)) {
        return [
          makeDefect('invalid-presentation-grid-item', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      const item = frame.value;
      const kind = readOwnDataMember(item, 'kind');
      const key = readOwnDataMember(item, 'key');
      const span = readOwnDataMember(item, 'span');
      const child = readOwnDataMember(item, 'child');
      if (
        kind.kind !== 'value' ||
        kind.value !== 'grid-item' ||
        span.kind !== 'value' ||
        !isGridSpan(span.value, frame.columns) ||
        child.kind !== 'value' ||
        !isOrdinaryObject(child.value)
      ) {
        return [
          makeDefect('invalid-presentation-grid-item', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      if (active.has(item)) {
        return [
          makeDefect('cyclic-presentation', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      if (
        key.kind !== 'value' ||
        key.value !==
          presentationEntryKey(owner, [
            'grid',
            frame.gridId,
            'item',
            frame.itemIndex,
          ])
      ) {
        return [
          makeDefect('invalid-presentation-entry-key', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      active.add(item);
      stack.push({ phase: 'exit', value: item });
      stack.push({
        phase: 'enter',
        value: child.value,
        path: Object.freeze([...frame.path, 0]),
      });
      continue;
    }
    if (!isOrdinaryObject(frame.value)) {
      return [
        makeDefect('invalid-presentation-entry', {
          presentationIndexPath: frame.path,
        }),
      ];
    }
    const entry = frame.value;
    const kind = readOwnDataMember(entry, 'kind');
    if (kind.kind !== 'value') {
      return [
        makeDefect('invalid-presentation-entry', {
          presentationIndexPath: frame.path,
        }),
      ];
    }
    if (kind.value === 'form-node') {
      const node = readOwnDataMember(entry, 'node');
      if (
        node.kind !== 'value' ||
        !isOrdinaryObject(node.value) ||
        !expected.has(node.value)
      ) {
        return [
          makeDefect('unknown-presented-node', {
            presentationIndexPath: frame.path,
          }),
        ];
      } else if (seen.has(node.value)) {
        return [
          makeDefect('duplicate-presented-node', {
            presentationIndexPath: frame.path,
          }),
        ];
      } else seen.add(node.value);
      continue;
    }
    if (
      kind.value !== 'section' &&
      kind.value !== 'tabs' &&
      kind.value !== 'accordion' &&
      kind.value !== 'grid'
    ) {
      return [
        makeDefect('invalid-presentation-entry', {
          presentationIndexPath: frame.path,
        }),
      ];
    }
    if (active.has(entry)) {
      return [
        makeDefect('cyclic-presentation', {
          presentationIndexPath: frame.path,
        }),
      ];
    }
    const id = readOwnDataMember(entry, 'id');
    const key = readOwnDataMember(entry, 'key');
    const label = readOwnDataMember(entry, 'label');
    if (kind.value === 'tabs' || kind.value === 'accordion') {
      const panels = readOwnDataMember(entry, 'panels');
      if (
        !isNonEmptyStringMember(id) ||
        !isNonBlankStringMember(label) ||
        !isDenseNonEmptyArrayMember(panels)
      ) {
        return [
          makeDefect(
            kind.value === 'tabs'
              ? 'invalid-presentation-tabs'
              : 'invalid-presentation-accordion',
            { presentationIndexPath: frame.path },
          ),
        ];
      }
      if (
        key.kind !== 'value' ||
        key.value !== presentationEntryKey(owner, [kind.value, id.value])
      ) {
        return [
          makeDefect('invalid-presentation-entry-key', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      if (containerIds.has(id.value)) {
        return [
          makeDefect('duplicate-presentation-container-id', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      containerIds.add(id.value);
      active.add(entry);
      stack.push({ phase: 'exit', value: entry });
      const panelIds = new Set<string>();
      for (let index = panels.value.length - 1; index >= 0; index -= 1) {
        const panel = readOwnDataMember(panels.value, String(index));
        stack.push({
          phase: 'panel',
          value: panel.kind === 'value' ? panel.value : undefined,
          path: Object.freeze([...frame.path, index]),
          ownerKind: kind.value,
          ownerId: id.value,
          panelIds,
        });
      }
      continue;
    }
    if (kind.value === 'grid') {
      const columns = readOwnDataMember(entry, 'columns');
      const items = readOwnDataMember(entry, 'items');
      if (
        !isNonEmptyStringMember(id) ||
        !isNonBlankStringMember(label) ||
        columns.kind !== 'value' ||
        !isGridColumns(columns.value) ||
        !isDenseNonEmptyArrayMember(items)
      ) {
        return [
          makeDefect('invalid-presentation-grid', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      if (
        key.kind !== 'value' ||
        key.value !== presentationEntryKey(owner, ['grid', id.value])
      ) {
        return [
          makeDefect('invalid-presentation-entry-key', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      if (containerIds.has(id.value)) {
        return [
          makeDefect('duplicate-presentation-container-id', {
            presentationIndexPath: frame.path,
          }),
        ];
      }
      containerIds.add(id.value);
      active.add(entry);
      stack.push({ phase: 'exit', value: entry });
      for (let index = items.value.length - 1; index >= 0; index -= 1) {
        const item = readOwnDataMember(items.value, String(index));
        stack.push({
          phase: 'grid-item',
          value: item.kind === 'value' ? item.value : undefined,
          path: Object.freeze([...frame.path, index]),
          gridId: id.value,
          columns: columns.value,
          itemIndex: index,
        });
      }
      continue;
    }

    const children = readOwnDataMember(entry, 'children');
    if (
      !isNonEmptyStringMember(id) ||
      !isNonBlankStringMember(label) ||
      !isDenseNonEmptyArrayMember(children)
    ) {
      return [
        makeDefect('invalid-presentation-section', {
          presentationIndexPath: frame.path,
        }),
      ];
    }
    if (
      key.kind !== 'value' ||
      key.value !== presentationEntryKey(owner, ['section', id.value])
    ) {
      return [
        makeDefect('invalid-presentation-section-key', {
          presentationIndexPath: frame.path,
        }),
      ];
    }
    if (containerIds.has(id.value)) {
      return [
        makeDefect('duplicate-presentation-section-id', {
          presentationIndexPath: frame.path,
        }),
      ];
    }
    containerIds.add(id.value);
    active.add(entry);
    stack.push({ phase: 'exit', value: entry });
    pushEntries(children.value, frame.path);
  }
  if (seen.size !== expected.size)
    return [makeDefect('missing-presented-node')];
  return [];
}

function presentationEntryKey(
  owner: PresentationOwner | undefined,
  suffix: readonly (string | number)[],
): string {
  return JSON.stringify(
    owner === undefined ? suffix : ['presentation', owner.key, ...suffix],
  );
}

function collectLocalPresentationDefects(
  nodes: readonly unknown[],
): readonly NestedDefinitionDefect[] {
  type OwnerFrame =
    | { readonly kind: 'node'; readonly value: unknown }
    | {
        readonly kind: 'template';
        readonly value: unknown;
        readonly collectionPath: readonly string[];
      };
  const stack: OwnerFrame[] = [];
  const defects: NestedDefinitionDefect[] = [];
  const seen = new Set<object>();
  const pushNodes = (
    values: readonly unknown[],
    kind: OwnerFrame['kind'],
    collectionPath?: readonly string[],
  ): void => {
    for (let index = values.length - 1; index >= 0; index -= 1) {
      const member = readOwnDataMember(values, String(index));
      const value = member.kind === 'value' ? member.value : undefined;
      stack.push(
        kind === 'node'
          ? { kind, value }
          : {
              kind,
              value,
              collectionPath: collectionPath ?? Object.freeze([]),
            },
      );
    }
  };
  pushNodes(nodes, 'node');
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined || !isOrdinaryObject(frame.value)) continue;
    if (seen.has(frame.value)) continue;
    seen.add(frame.value);
    const nodeKind = readValue(frame.value, 'kind');
    const children = readValue(frame.value, 'children');
    if (frame.kind === 'node' && nodeKind === 'object') {
      const path = copyStringDataPath(readValue(frame.value, 'path'));
      if (path === undefined || !Array.isArray(children)) continue;
      defects.push(
        ...collectPresentationDefects(frame.value, children, {
          kind: 'object',
          path,
          key: ['object', path],
        }),
      );
      pushNodes(children, 'node');
      continue;
    }
    if (frame.kind === 'node' && nodeKind === 'array') {
      const path = copyStringDataPath(readValue(frame.value, 'path'));
      const item = readValue(frame.value, 'item');
      if (path === undefined || !isOrdinaryObject(item)) continue;
      const itemChildren = readValue(item, 'children');
      if (!Array.isArray(itemChildren)) continue;
      defects.push(
        ...collectPresentationDefects(item, itemChildren, {
          kind: 'item',
          path,
          templatePath: [],
          key: ['item-template', path],
        }),
      );
      pushNodes(itemChildren, 'template', path);
      continue;
    }
    if (frame.kind === 'template' && nodeKind === 'object') {
      const relativePath = copyStringDataPath(
        readValue(frame.value, 'relativePath'),
      );
      if (relativePath === undefined || !Array.isArray(children)) continue;
      defects.push(
        ...collectPresentationDefects(frame.value, children, {
          kind: 'template-object',
          path: frame.collectionPath,
          templatePath: relativePath,
          key: ['item-template-object', frame.collectionPath, relativePath],
        }),
      );
      pushNodes(children, 'template', frame.collectionPath);
    }
  }
  return Object.freeze(defects);
}

function isDenseNonEmptyArrayMember(
  member: ReturnType<typeof readOwnDataMember>,
): member is { readonly kind: 'value'; readonly value: readonly unknown[] } {
  if (
    member.kind !== 'value' ||
    !Array.isArray(member.value) ||
    member.value.length === 0
  ) {
    return false;
  }
  for (let index = 0; index < member.value.length; index += 1) {
    if (readOwnDataMember(member.value, String(index)).kind !== 'value')
      return false;
  }
  return true;
}

function isNonEmptyStringMember(
  member: ReturnType<typeof readOwnDataMember>,
): member is { readonly kind: 'value'; readonly value: string } {
  return (
    member.kind === 'value' &&
    typeof member.value === 'string' &&
    member.value.length > 0
  );
}

function isNonBlankStringMember(
  member: ReturnType<typeof readOwnDataMember>,
): member is { readonly kind: 'value'; readonly value: string } {
  return (
    member.kind === 'value' &&
    typeof member.value === 'string' &&
    member.value.trim().length > 0
  );
}

function isGridColumns(value: unknown): value is 1 | 2 | 3 | 4 {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 4
  );
}

function isGridSpan(value: unknown, columns: 1 | 2 | 3 | 4): boolean {
  return isGridColumns(value) && value <= columns;
}

type InspectedNode =
  | {
      readonly success: true;
      readonly kind: 'field';
      readonly key: string;
      readonly path: readonly string[];
    }
  | {
      readonly success: true;
      readonly kind: 'object';
      readonly key: string;
      readonly path: readonly string[];
      readonly children: readonly unknown[];
    }
  | {
      readonly success: true;
      readonly kind: 'array';
      readonly key: string;
      readonly path: readonly string[];
      readonly identityProperty: string;
      readonly item: {
        readonly children: readonly unknown[];
        readonly fields: readonly unknown[];
      };
    }
  | {
      readonly success: false;
      readonly reason: NestedDefinitionReason;
      readonly path?: readonly string[];
      readonly member?: NestedDefinitionDefect['member'];
      readonly expected?: string;
      readonly actualType?: string;
      readonly actualValue?: unknown;
      readonly members?:
        readonly ['nullable', 'choices'] | readonly ['fixedValue', 'choices'];
    };

function inspectNode(
  node: object,
  parentPath: readonly string[] | undefined,
  allowCollections: boolean,
): InspectedNode {
  const kind = readValue(node, 'kind');
  const name = readValue(node, 'name');
  const key = readValue(node, 'key');
  const rawPath = readValue(node, 'path');
  const path = copyStringDataPath(rawPath);
  const required = readValue(node, 'required');
  const label = readValue(node, 'label');

  if (kind === 'array' && !allowCollections) {
    return {
      success: false,
      reason: 'invalid-node',
      ...(path === undefined ? {} : { path }),
    };
  }

  if (
    typeof kind !== 'string' ||
    ![
      'object',
      'array',
      'string',
      'number',
      'boolean',
      'string-enum-array',
    ].includes(kind) ||
    typeof name !== 'string' ||
    typeof key !== 'string' ||
    path === undefined ||
    typeof required !== 'boolean' ||
    typeof label !== 'string' ||
    path.at(-1) !== name ||
    key !== canonicalDataPathKey(path) ||
    (parentPath !== undefined &&
      !sameDataPath(path.slice(0, -1), parentPath)) ||
    !validOptionalText(node, 'description') ||
    !validOptionalText(node, 'hint') ||
    !validOptionalText(node, 'tooltip')
  ) {
    return {
      success: false,
      reason:
        kind === 'array'
          ? 'invalid-array-node'
          : kind === 'string-enum-array'
            ? 'invalid-string-enum-array-field'
            : 'invalid-node',
      ...(path === undefined ? {} : { path }),
    };
  }

  if (kind === 'object') {
    const children = readValue(node, 'children');
    if (!Array.isArray(children)) {
      return { success: false, reason: 'invalid-node', path };
    }
    return { success: true, kind: 'object', key, path, children };
  }

  if (kind === 'array') {
    const identity = readValue(node, 'identity');
    if (!isOrdinaryObject(identity)) {
      return { success: false, reason: 'invalid-array-node', path };
    }
    const identityProperty = readValue(identity, 'property');
    if (typeof identityProperty !== 'string') {
      return { success: false, reason: 'invalid-item-identity', path };
    }
    const item = readValue(node, 'item');
    if (!isOrdinaryObject(item)) {
      return { success: false, reason: 'invalid-array-node', path };
    }
    if (readValue(item, 'kind') !== 'item-template') {
      return { success: false, reason: 'invalid-item-template', path };
    }
    const children = readValue(item, 'children');
    const fields = readValue(item, 'fields');
    if (!Array.isArray(children) || !Array.isArray(fields)) {
      return { success: false, reason: 'invalid-item-template', path };
    }
    return {
      success: true,
      kind: 'array',
      key,
      path,
      identityProperty,
      item: { children, fields },
    };
  }

  if (kind === 'string-enum-array') {
    const defect = inspectStringEnumArrayField(node);
    return defect === undefined
      ? { success: true, kind: 'field', key, path }
      : {
          success: false,
          reason: 'invalid-string-enum-array-field',
          path,
          ...defect,
        };
  }

  if (!validOptionalText(node, 'placeholder')) {
    return { success: false, reason: 'invalid-node', path };
  }
  const nullableDefect = inspectNullableCapability(node);
  if (nullableDefect !== undefined) {
    return { success: false, path, ...nullableDefect };
  }
  if (kind === 'string' && !validStringField(node)) {
    return { success: false, reason: 'invalid-node', path };
  }
  if (kind === 'number' && !validNumberField(node)) {
    return { success: false, reason: 'invalid-node', path };
  }
  const fixedValueDefect = inspectFixedValueCapability(
    node,
    kind as 'string' | 'number' | 'boolean',
  );
  if (fixedValueDefect !== undefined) {
    return { success: false, path, ...fixedValueDefect };
  }
  return { success: true, kind: 'field', key, path };
}

interface TemplateEnterFrame {
  readonly phase: 'enter';
  readonly value: unknown;
  readonly indexPath: readonly number[];
  readonly parentPath?: readonly string[];
}

interface TemplateExitFrame {
  readonly phase: 'exit';
  readonly value: object;
}

type TemplateFrame = TemplateEnterFrame | TemplateExitFrame;

function collectTemplateDefects(
  children: readonly unknown[],
  fields: readonly unknown[],
  collectionPath: readonly string[],
  identityProperty: string,
  conditionTargets: DefinitionTemplateConditionTarget[],
): readonly NestedDefinitionDefect[] {
  const leaves: object[] = [];
  const leafIndexPaths: (readonly number[])[] = [];
  const firstIdentity = new Map<object, readonly number[]>();
  const active = new Map<object, readonly number[]>();
  const firstPath = new Map<string, readonly number[]>();
  const stack: TemplateFrame[] = [];
  const defects: NestedDefinitionDefect[] = [];

  for (let index = children.length - 1; index >= 0; index -= 1) {
    const member = readOwnDataMember(children, String(index));
    stack.push({
      phase: 'enter',
      value: member.kind === 'value' ? member.value : undefined,
      indexPath: Object.freeze([index]),
    });
  }

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.phase === 'exit') {
      active.delete(frame.value);
      continue;
    }
    if (!isOrdinaryObject(frame.value)) {
      defects.push(
        makeDefect('invalid-item-template', {
          templateIndexPath: frame.indexPath,
          path: collectionPath,
        }),
      );
      continue;
    }
    const template = frame.value;
    const activeIndex = active.get(template);
    if (activeIndex !== undefined) {
      defects.push(
        makeDefect('cyclic-template', {
          templateIndexPath: frame.indexPath,
          firstTemplateIndexPath: activeIndex,
          path: collectionPath,
        }),
      );
      continue;
    }
    const firstIndex = firstIdentity.get(template);
    if (firstIndex !== undefined) {
      defects.push(
        makeDefect('reused-template', {
          templateIndexPath: frame.indexPath,
          firstTemplateIndexPath: firstIndex,
          path: collectionPath,
        }),
      );
      continue;
    }

    const inspected = inspectTemplateNode(
      template,
      collectionPath,
      frame.parentPath,
    );
    if (!inspected.success) {
      defects.push(
        makeDefect(inspected.reason, {
          templateIndexPath: frame.indexPath,
          path: collectionPath,
          ...(inspected.relativePath === undefined
            ? {}
            : { relativePath: inspected.relativePath }),
          ...(inspected.member === undefined
            ? {}
            : { member: inspected.member }),
          ...(inspected.expected === undefined
            ? {}
            : { expected: inspected.expected }),
          ...(inspected.actualType === undefined
            ? {}
            : { actualType: inspected.actualType }),
          ...(Object.hasOwn(inspected, 'actualValue')
            ? { actualValue: inspected.actualValue }
            : {}),
          ...(inspected.members === undefined
            ? {}
            : { members: inspected.members }),
        }),
      );
      if (
        inspected.reason === 'invalid-field-nullable' ||
        inspected.reason === 'invalid-field-fixed-value' ||
        inspected.reason === 'incompatible-field-capabilities'
      ) {
        leaves.push(template);
        leafIndexPaths.push(frame.indexPath);
      }
      continue;
    }

    const duplicateIndex = firstPath.get(inspected.key);
    if (duplicateIndex !== undefined) {
      defects.push(
        makeDefect('duplicate-template-path', {
          templateIndexPath: frame.indexPath,
          firstTemplateIndexPath: duplicateIndex,
          path: collectionPath,
          relativePath: inspected.relativePath,
        }),
      );
      continue;
    }

    firstIdentity.set(template, frame.indexPath);
    firstPath.set(inspected.key, frame.indexPath);
    active.set(template, frame.indexPath);
    stack.push({ phase: 'exit', value: template });

    if (
      inspected.relativePath.length === 1 &&
      inspected.relativePath[0] === identityProperty
    ) {
      defects.push(
        makeDefect('identity-template-overlap', {
          templateIndexPath: frame.indexPath,
          path: collectionPath,
          relativePath: inspected.relativePath,
        }),
      );
    }

    if (inspected.kind === 'field') {
      leaves.push(template);
      leafIndexPaths.push(frame.indexPath);
      const conditions = captureConditionMembers(template);
      if (
        conditions.visibleWhen !== undefined ||
        conditions.enabledWhen !== undefined
      ) {
        conditionTargets.push({
          templateIndexPath: frame.indexPath,
          relativePath: inspected.relativePath,
          ...conditions,
        });
      }
      continue;
    }
    for (let index = inspected.children.length - 1; index >= 0; index -= 1) {
      const member = readOwnDataMember(inspected.children, String(index));
      stack.push({
        phase: 'enter',
        value: member.kind === 'value' ? member.value : undefined,
        indexPath: Object.freeze([...frame.indexPath, index]),
        parentPath: inspected.relativePath,
      });
    }
  }

  if (fields.length !== leaves.length) {
    const fieldIndex = Math.min(fields.length, leaves.length);
    const templateIndexPath = leafIndexPaths[fieldIndex];
    defects.push(
      makeDefect('inconsistent-template-leaf-projection', {
        fieldIndex,
        path: collectionPath,
        ...(templateIndexPath === undefined ? {} : { templateIndexPath }),
      }),
    );
  }
  const comparableLength = Math.min(fields.length, leaves.length);
  for (let index = 0; index < comparableLength; index += 1) {
    const member = readOwnDataMember(fields, String(index));
    if (member.kind !== 'value' || member.value !== leaves[index]) {
      const templateIndexPath = leafIndexPaths[index];
      defects.push(
        makeDefect('inconsistent-template-leaf-projection', {
          fieldIndex: index,
          path: collectionPath,
          ...(templateIndexPath === undefined ? {} : { templateIndexPath }),
        }),
      );
    }
  }
  return defects;
}

type InspectedTemplateNode =
  | {
      readonly success: true;
      readonly kind: 'field';
      readonly key: string;
      readonly relativePath: readonly string[];
    }
  | {
      readonly success: true;
      readonly kind: 'object';
      readonly key: string;
      readonly relativePath: readonly string[];
      readonly children: readonly unknown[];
    }
  | {
      readonly success: false;
      readonly reason: NestedDefinitionReason;
      readonly relativePath?: readonly string[];
      readonly member?: 'nullable' | 'fixedValue';
      readonly expected?: string;
      readonly actualType?: string;
      readonly actualValue?: unknown;
      readonly members?:
        readonly ['nullable', 'choices'] | readonly ['fixedValue', 'choices'];
    };

function inspectTemplateNode(
  node: object,
  collectionPath: readonly string[],
  parentPath: readonly string[] | undefined,
): InspectedTemplateNode {
  const kind = readValue(node, 'kind');
  const name = readValue(node, 'name');
  const key = readValue(node, 'key');
  const relativePath = copyStringDataPath(readValue(node, 'relativePath'));
  const required = readValue(node, 'required');
  const label = readValue(node, 'label');

  if (kind === 'array') {
    return {
      success: false,
      reason: 'nested-array-template',
      ...(relativePath === undefined ? {} : { relativePath }),
    };
  }
  if (
    typeof kind !== 'string' ||
    !['object', 'string', 'number', 'boolean'].includes(kind) ||
    typeof name !== 'string' ||
    typeof key !== 'string' ||
    relativePath === undefined ||
    typeof required !== 'boolean' ||
    typeof label !== 'string' ||
    relativePath.at(-1) !== name ||
    key !== canonicalTemplateKey(collectionPath, relativePath) ||
    (parentPath !== undefined &&
      !sameDataPath(relativePath.slice(0, -1), parentPath)) ||
    !validOptionalText(node, 'description') ||
    !validOptionalText(node, 'hint') ||
    !validOptionalText(node, 'tooltip')
  ) {
    return {
      success: false,
      reason: 'invalid-item-template',
      ...(relativePath === undefined ? {} : { relativePath }),
    };
  }
  if (kind === 'object') {
    const nestedChildren = readValue(node, 'children');
    if (!Array.isArray(nestedChildren)) {
      return {
        success: false,
        reason: 'invalid-item-template',
        relativePath,
      };
    }
    return {
      success: true,
      kind: 'object',
      key,
      relativePath,
      children: nestedChildren,
    };
  }
  if (!validOptionalText(node, 'placeholder')) {
    return {
      success: false,
      reason: 'invalid-item-template',
      relativePath,
    };
  }
  const nullableDefect = inspectNullableCapability(node);
  if (nullableDefect !== undefined) {
    return { success: false, relativePath, ...nullableDefect };
  }
  if (
    (kind === 'string' && !validStringField(node)) ||
    (kind === 'number' && !validNumberField(node))
  ) {
    return {
      success: false,
      reason: 'invalid-item-template',
      relativePath,
    };
  }
  const fixedValueDefect = inspectFixedValueCapability(
    node,
    kind as 'string' | 'number' | 'boolean',
  );
  if (fixedValueDefect !== undefined) {
    return { success: false, relativePath, ...fixedValueDefect };
  }
  return { success: true, kind: 'field', key, relativePath };
}

function captureConditionMembers(node: object): {
  readonly visibleWhen: CapturedDefinitionCondition | undefined;
  readonly enabledWhen: CapturedDefinitionCondition | undefined;
} {
  const capture = (
    member: DefinitionConditionMember,
  ): CapturedDefinitionCondition | undefined => {
    const descriptor = Object.getOwnPropertyDescriptor(node, member);
    if (descriptor === undefined) return undefined;
    return 'value' in descriptor
      ? { kind: 'value', value: descriptor.value as unknown }
      : { kind: 'accessor' };
  };
  const visibleWhen = capture('visibleWhen');
  const enabledWhen = capture('enabledWhen');
  return { visibleWhen, enabledWhen };
}

function captureFieldConditionTarget(
  field: object,
  nodeIndexPath: readonly number[],
  path: readonly string[],
): DefinitionFieldConditionTarget {
  const rawKind = readValue(field, 'kind');
  const kind =
    rawKind === 'number'
      ? (readValue(field, 'numericType') as 'number' | 'integer')
      : (rawKind as 'string' | 'boolean');
  const nullable = readValue(field, 'nullable') === true;
  const fixed = readOwnDataMember(field, 'fixedValue').kind === 'value';
  return {
    field,
    nodeIndexPath,
    path,
    kind,
    nullable,
    fixed,
    ...captureConditionMembers(field),
  };
}

function collectDefinitionConditionShapeDefects(
  fields: readonly DefinitionFieldConditionTarget[],
  templates: readonly DefinitionTemplateConditionTarget[],
  detached: DetachedDefinitionCondition[],
  defects: NestedDefinitionDefect[],
): void {
  for (const target of fields) {
    for (const member of ['visibleWhen', 'enabledWhen'] as const) {
      const capture = target[member];
      if (capture === undefined) continue;
      const condition = inspectDefinitionConditionShape(
        capture,
        target,
        member,
        defects,
      );
      if (condition !== undefined) detached.push(condition);
    }
  }
  for (const target of templates) {
    for (const member of ['visibleWhen', 'enabledWhen'] as const) {
      if (target[member] === undefined) continue;
      defects.push(
        makeDefect('unsupported-field-condition-location', {
          templateIndexPath: target.templateIndexPath,
          relativePath: target.relativePath,
          conditionMember: member,
          conditionLocation: 'template-field',
        }),
      );
    }
  }
}

function inspectDefinitionConditionShape(
  capture: CapturedDefinitionCondition,
  target: DefinitionFieldConditionTarget,
  member: DefinitionConditionMember,
  defects: NestedDefinitionDefect[],
): DetachedDefinitionCondition | undefined {
  if (capture.kind === 'accessor') {
    pushDefinitionPredicateDefect(target, member, defects, 'member-accessor', {
      conditionExpected: 'condition object',
    });
    return undefined;
  }
  if (!isOrdinaryObject(capture.value)) {
    pushDefinitionPredicateDefect(target, member, defects, 'not-object', {
      conditionExpected: 'condition object',
      conditionActualType: actualType(capture.value),
    });
    return undefined;
  }

  const condition = capture.value;
  const family = classifyDefinitionCondition(condition);
  if (family === 'mixed') {
    pushDefinitionGroupDefect(target, member, defects, 'shape-mixed', {
      conditionDetailMember: 'condition',
      conditionExpected: 'predicate or flat condition group',
    });
    return undefined;
  }
  const detached =
    family === 'group'
      ? inspectDefinitionConditionGroup(condition, target, member, defects)
      : inspectDefinitionConditionPredicate(condition, target, member, defects);
  return detached === undefined
    ? undefined
    : Object.freeze({ target, member, condition: detached });
}

type DefinitionConditionFamily = 'predicate' | 'group' | 'mixed';

function readOwnEnumerableConditionMember(
  condition: object,
  member: 'sourcePath' | 'equals' | 'operator' | 'conditions',
): ReturnType<typeof readOwnDataMember> {
  const descriptor = Object.getOwnPropertyDescriptor(condition, member);
  if (descriptor === undefined || !descriptor.enumerable) {
    return { kind: 'missing' };
  }
  return 'value' in descriptor
    ? { kind: 'value', value: descriptor.value as unknown }
    : { kind: 'accessor' };
}

function classifyDefinitionCondition(
  condition: object,
): DefinitionConditionFamily {
  const predicate =
    readOwnEnumerableConditionMember(condition, 'sourcePath').kind !==
      'missing' ||
    readOwnEnumerableConditionMember(condition, 'equals').kind !== 'missing';
  const group =
    readOwnEnumerableConditionMember(condition, 'operator').kind !==
      'missing' ||
    readOwnEnumerableConditionMember(condition, 'conditions').kind !==
      'missing';
  if (predicate && group) return 'mixed';
  return group ? 'group' : 'predicate';
}

function pushDefinitionPredicateDefect(
  target: DefinitionFieldConditionTarget,
  member: DefinitionConditionMember,
  defects: NestedDefinitionDefect[],
  conditionReason: NonNullable<NestedDefinitionDefect['conditionReason']>,
  details: Omit<
    NestedDefinitionDefect,
    'reason' | 'nodeIndexPath' | 'path' | 'conditionMember' | 'conditionReason'
  > = {},
): void {
  defects.push(
    makeDefect('invalid-field-condition', {
      nodeIndexPath: target.nodeIndexPath,
      path: target.path,
      conditionMember: member,
      conditionReason,
      ...details,
    }),
  );
}

function pushDefinitionGroupDefect(
  target: DefinitionFieldConditionTarget,
  member: DefinitionConditionMember,
  defects: NestedDefinitionDefect[],
  conditionGroupReason: NonNullable<
    NestedDefinitionDefect['conditionGroupReason']
  >,
  details: Omit<
    NestedDefinitionDefect,
    | 'reason'
    | 'nodeIndexPath'
    | 'path'
    | 'conditionMember'
    | 'conditionGroupReason'
  > = {},
): void {
  defects.push(
    makeDefect('invalid-field-condition-group', {
      nodeIndexPath: target.nodeIndexPath,
      path: target.path,
      conditionMember: member,
      conditionGroupReason,
      ...details,
    }),
  );
}

function inspectDefinitionConditionPredicate(
  condition: object,
  target: DefinitionFieldConditionTarget,
  member: DefinitionConditionMember,
  defects: NestedDefinitionDefect[],
  conditionGroupIndex?: number,
): DetachedDefinitionConditionPredicate | undefined {
  const push = (
    reason: NonNullable<NestedDefinitionDefect['conditionReason']>,
    details: Omit<
      NestedDefinitionDefect,
      | 'reason'
      | 'nodeIndexPath'
      | 'path'
      | 'conditionMember'
      | 'conditionReason'
    > = {},
  ): void => {
    pushDefinitionPredicateDefect(target, member, defects, reason, {
      ...(conditionGroupIndex === undefined ? {} : { conditionGroupIndex }),
      ...details,
    });
  };
  let valid = true;
  let sourcePath: string[] | undefined;
  let equals: string | number | boolean | null | undefined;
  let equalsValid = false;
  const sourcePathMember = readOwnEnumerableConditionMember(
    condition,
    'sourcePath',
  );
  if (sourcePathMember.kind === 'missing') {
    valid = false;
    push('member-missing', {
      conditionDetailMember: 'sourcePath',
      conditionExpected: 'non-empty dense string path',
    });
  } else if (sourcePathMember.kind === 'accessor') {
    valid = false;
    push('member-accessor', {
      conditionDetailMember: 'sourcePath',
      conditionExpected: 'non-empty dense string path',
    });
  } else if (!Array.isArray(sourcePathMember.value)) {
    valid = false;
    push('member-invalid', {
      conditionDetailMember: 'sourcePath',
      conditionExpected: 'non-empty dense string path',
      conditionActualType: actualType(sourcePathMember.value),
    });
  } else {
    const path = sourcePathMember.value;
    const length = Object.getOwnPropertyDescriptor(path, 'length');
    if (
      length === undefined ||
      !('value' in length) ||
      !Number.isInteger(length.value) ||
      (length.value as number) <= 0
    ) {
      valid = false;
      push('member-invalid', {
        conditionDetailMember: 'sourcePath',
        conditionExpected: 'non-empty dense string path',
        conditionActualType: 'array',
        conditionActualLength:
          length !== undefined &&
          'value' in length &&
          typeof length.value === 'number'
            ? length.value
            : 0,
      });
    } else {
      sourcePath = [];
      for (let index = 0; index < length.value; index += 1) {
        const entry = Object.getOwnPropertyDescriptor(path, index);
        if (entry === undefined || !entry.enumerable) {
          valid = false;
          push('member-invalid', {
            conditionDetailMember: 'sourcePath',
            conditionExpected: 'string path segment',
            conditionIndex: index,
          });
        } else if (!('value' in entry)) {
          valid = false;
          push('member-accessor', {
            conditionDetailMember: 'sourcePath',
            conditionExpected: 'string path segment',
            conditionIndex: index,
          });
        } else if (typeof entry.value !== 'string') {
          valid = false;
          push('member-invalid', {
            conditionDetailMember: 'sourcePath',
            conditionExpected: 'string path segment',
            conditionActualType: actualType(entry.value),
            conditionIndex: index,
          });
        } else sourcePath.push(entry.value);
      }
      for (const key of Object.keys(path)) {
        if (/^(0|[1-9]\d*)$/.test(key) && Number(key) < length.value) continue;
        valid = false;
        push('member-invalid', {
          conditionDetailMember: 'sourcePath',
          conditionExpected: 'non-empty dense string path',
          conditionActualType: 'array',
          conditionPathKey: key,
        });
      }
    }
  }

  const equalsMember = readOwnEnumerableConditionMember(condition, 'equals');
  if (equalsMember.kind === 'missing') {
    valid = false;
    push('member-missing', {
      conditionDetailMember: 'equals',
      conditionExpected: 'string, finite number, boolean or null',
    });
  } else if (equalsMember.kind === 'accessor') {
    valid = false;
    push('member-accessor', {
      conditionDetailMember: 'equals',
      conditionExpected: 'string, finite number, boolean or null',
    });
  } else if (
    equalsMember.value === null ||
    typeof equalsMember.value === 'string' ||
    typeof equalsMember.value === 'boolean' ||
    (typeof equalsMember.value === 'number' &&
      Number.isFinite(equalsMember.value))
  ) {
    equals = equalsMember.value;
    equalsValid = true;
  } else {
    valid = false;
    push('member-invalid', {
      conditionDetailMember: 'equals',
      conditionExpected: 'string, finite number, boolean or null',
      conditionActualType: actualType(equalsMember.value),
    });
  }

  return valid && sourcePath !== undefined && equalsValid
    ? Object.freeze({
        kind: 'predicate',
        sourcePath: Object.freeze(sourcePath),
        equals: equals as string | number | boolean | null,
      })
    : undefined;
}

function inspectDefinitionConditionGroup(
  condition: object,
  target: DefinitionFieldConditionTarget,
  member: DefinitionConditionMember,
  defects: NestedDefinitionDefect[],
): DetachedDefinitionConditionGroup | undefined {
  const push = (
    reason: NonNullable<NestedDefinitionDefect['conditionGroupReason']>,
    details: Omit<
      NestedDefinitionDefect,
      | 'reason'
      | 'nodeIndexPath'
      | 'path'
      | 'conditionMember'
      | 'conditionGroupReason'
    > = {},
  ): void =>
    pushDefinitionGroupDefect(target, member, defects, reason, details);
  let valid = true;
  let operator: 'all' | 'any' | undefined;
  let conditionsValue: unknown;
  let conditionsReadable = false;

  const operatorMember = readOwnEnumerableConditionMember(
    condition,
    'operator',
  );
  if (operatorMember.kind === 'missing') {
    valid = false;
    push('member-missing', {
      conditionDetailMember: 'operator',
      conditionExpected: "'all' or 'any'",
    });
  } else if (operatorMember.kind === 'accessor') {
    valid = false;
    push('member-accessor', {
      conditionDetailMember: 'operator',
      conditionExpected: "'all' or 'any'",
    });
  } else if (operatorMember.value !== 'all' && operatorMember.value !== 'any') {
    valid = false;
    push('member-invalid', {
      conditionDetailMember: 'operator',
      conditionExpected: "'all' or 'any'",
      conditionActualType: actualType(operatorMember.value),
      ...(typeof operatorMember.value === 'string'
        ? { conditionActualOperator: operatorMember.value }
        : {}),
    });
  } else operator = operatorMember.value;

  const conditionsMember = readOwnEnumerableConditionMember(
    condition,
    'conditions',
  );
  if (conditionsMember.kind === 'missing') {
    valid = false;
    push('member-missing', {
      conditionDetailMember: 'conditions',
      conditionExpected: 'non-empty dense condition array',
    });
  } else if (conditionsMember.kind === 'accessor') {
    valid = false;
    push('member-accessor', {
      conditionDetailMember: 'conditions',
      conditionExpected: 'non-empty dense condition array',
    });
  } else {
    conditionsValue = conditionsMember.value;
    conditionsReadable = true;
  }

  const predicates: DetachedDefinitionConditionPredicate[] = [];
  if (conditionsReadable) {
    if (!Array.isArray(conditionsValue)) {
      valid = false;
      push('member-invalid', {
        conditionDetailMember: 'conditions',
        conditionExpected: 'non-empty dense condition array',
        conditionActualType: actualType(conditionsValue),
      });
    } else {
      if (conditionsValue.length === 0) {
        valid = false;
        push('empty', {
          conditionDetailMember: 'conditions',
          conditionExpected: 'non-empty dense condition array',
          conditionActualType: 'array',
          conditionActualLength: 0,
        });
      }
      const descriptors: Array<PropertyDescriptor | undefined> = [];
      for (let index = 0; index < conditionsValue.length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(
          conditionsValue,
          index,
        );
        descriptors.push(descriptor);
        if (
          descriptor === undefined ||
          !descriptor.enumerable ||
          !('value' in descriptor)
        ) {
          valid = false;
          push(
            descriptor !== undefined && !('value' in descriptor)
              ? 'member-accessor'
              : 'member-invalid',
            {
              conditionDetailMember: 'conditions',
              conditionExpected: 'non-empty dense condition array',
              conditionGroupIndex: index,
            },
          );
        }
      }
      for (const key of Object.keys(conditionsValue)) {
        if (isDefinitionConditionArrayIndex(key, conditionsValue.length)) {
          continue;
        }
        valid = false;
        push('member-invalid', {
          conditionDetailMember: 'conditions',
          conditionExpected: 'non-empty dense condition array',
          conditionGroupKey: key,
        });
      }
      for (let index = 0; index < descriptors.length; index += 1) {
        const descriptor = descriptors[index];
        if (
          descriptor === undefined ||
          !descriptor.enumerable ||
          !('value' in descriptor)
        ) {
          continue;
        }
        if (!isOrdinaryObject(descriptor.value)) {
          valid = false;
          push('member-not-object', {
            conditionDetailMember: 'condition',
            conditionExpected: 'condition object',
            conditionActualType: actualType(descriptor.value),
            conditionGroupIndex: index,
          });
          continue;
        }
        const family = classifyDefinitionCondition(descriptor.value);
        if (family === 'mixed') {
          valid = false;
          push('shape-mixed', {
            conditionDetailMember: 'condition',
            conditionExpected: 'predicate or flat condition group',
            conditionGroupIndex: index,
          });
          continue;
        }
        if (family === 'group') {
          valid = false;
          defects.push(
            makeDefect('nested-field-condition-group', {
              nodeIndexPath: target.nodeIndexPath,
              path: target.path,
              conditionMember: member,
              conditionDetailMember: 'condition',
              conditionExpected: 'non-nested condition predicate',
              conditionGroupIndex: index,
            }),
          );
          continue;
        }
        const predicate = inspectDefinitionConditionPredicate(
          descriptor.value,
          target,
          member,
          defects,
          index,
        );
        if (predicate === undefined) valid = false;
        else predicates.push(predicate);
      }
    }
  }

  return valid && operator !== undefined
    ? Object.freeze({
        kind: 'group',
        operator,
        conditions: Object.freeze(predicates),
      })
    : undefined;
}

function isDefinitionConditionArrayIndex(key: string, length: number): boolean {
  if (key.length === 0) return false;
  const index = Number(key);
  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < 4_294_967_295 &&
    index < length &&
    String(index) === key
  );
}

function collectDefinitionConditionSemanticDefects(
  conditions: readonly DetachedDefinitionCondition[],
  fields: readonly DefinitionFieldConditionTarget[],
  objectPaths: ReadonlySet<string>,
  arrayPaths: ReadonlySet<string>,
  collectionPaths: readonly (readonly string[])[],
  defects: NestedDefinitionDefect[],
): void {
  const sources = new Map(
    fields.map((field) => [canonicalDataPathKey(field.path), field] as const),
  );
  for (const condition of conditions) {
    const base = {
      nodeIndexPath: condition.target.nodeIndexPath,
      path: condition.target.path,
      conditionMember: condition.member,
    } as const;
    if (condition.member === 'enabledWhen' && condition.target.fixed) {
      defects.push(
        makeDefect('field-condition-target-incompatible', {
          ...base,
          conditionTargetCapability: 'fixed-value',
        }),
      );
      continue;
    }
    const predicates =
      condition.condition.kind === 'predicate'
        ? [condition.condition]
        : condition.condition.conditions;
    for (let index = 0; index < predicates.length; index += 1) {
      const predicate = predicates[index];
      if (predicate === undefined) continue;
      const groupLocation =
        condition.condition.kind === 'group'
          ? { conditionGroupIndex: index }
          : {};
      const sourceKey = canonicalDataPathKey(predicate.sourcePath);
      const source = sources.get(sourceKey);
      if (source === undefined) {
        const sourceReason = objectPaths.has(sourceKey)
          ? 'object'
          : arrayPaths.has(sourceKey)
            ? 'array'
            : collectionPaths.some(
                  (path) =>
                    predicate.sourcePath.length > path.length &&
                    path.every(
                      (segment, pathIndex) =>
                        predicate.sourcePath[pathIndex] === segment,
                    ),
                )
              ? 'below-collection'
              : 'unmanaged';
        defects.push(
          makeDefect('field-condition-source-not-managed', {
            ...base,
            ...groupLocation,
            sourcePath: predicate.sourcePath,
            sourceReason,
          }),
        );
        continue;
      }
      if (!definitionConditionLiteralCompatible(source, predicate.equals)) {
        defects.push(
          makeDefect('field-condition-literal-incompatible', {
            ...base,
            ...groupLocation,
            sourcePath: predicate.sourcePath,
            sourceKind: source.kind,
            sourceNullable: source.nullable,
            conditionExpected: definitionConditionExpected(source),
            conditionActualType: actualType(predicate.equals),
          }),
        );
      }
    }
  }
}

function definitionConditionLiteralCompatible(
  source: DefinitionFieldConditionTarget,
  value: string | number | boolean | null,
): boolean {
  if (value === null) return source.nullable;
  if (source.kind === 'string') return typeof value === 'string';
  if (source.kind === 'boolean') return typeof value === 'boolean';
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (source.kind === 'number' || Number.isInteger(value))
  );
}

function definitionConditionExpected(
  source: DefinitionFieldConditionTarget,
): string {
  const primitive =
    source.kind === 'string'
      ? 'string'
      : source.kind === 'boolean'
        ? 'boolean'
        : source.kind === 'integer'
          ? 'finite integer'
          : 'finite number';
  return source.nullable ? `${primitive} or null` : primitive;
}

function inspectNullableCapability(node: object):
  | {
      readonly reason: 'invalid-field-nullable';
      readonly member: 'nullable';
      readonly actualType: string;
    }
  | {
      readonly reason: 'incompatible-field-capabilities';
      readonly members: readonly ['nullable', 'choices'];
    }
  | undefined {
  const nullable = readOwnDataMember(node, 'nullable');
  if (nullable.kind !== 'value' || typeof nullable.value !== 'boolean') {
    return {
      reason: 'invalid-field-nullable',
      member: 'nullable',
      actualType:
        nullable.kind === 'missing'
          ? 'missing'
          : nullable.kind === 'accessor'
            ? 'accessor'
            : actualType(nullable.value),
    };
  }
  if (nullable.value === true) {
    const choices = readOwnDataMember(node, 'choices');
    if (
      choices.kind === 'value' &&
      Array.isArray(choices.value) &&
      choices.value.length > 0
    ) {
      return {
        reason: 'incompatible-field-capabilities',
        members: Object.freeze(['nullable', 'choices']),
      };
    }
  }
  return undefined;
}

type FixedValueDefect =
  | {
      readonly reason: 'invalid-field-fixed-value';
      readonly member: 'fixedValue';
      readonly expected: string;
      readonly actualType: string;
      readonly actualValue?: unknown;
    }
  | {
      readonly reason: 'incompatible-field-capabilities';
      readonly members: readonly ['fixedValue', 'choices'];
    };

function inspectFixedValueCapability(
  node: object,
  kind: 'string' | 'number' | 'boolean',
): FixedValueDefect | undefined {
  const fixedValue = readOwnDataMember(node, 'fixedValue');
  if (fixedValue.kind === 'missing') return undefined;

  const nullableMember = readOwnDataMember(node, 'nullable');
  const nullable =
    nullableMember.kind === 'value' && nullableMember.value === true;
  const numericType = kind === 'number' ? readValue(node, 'numericType') : kind;
  let expected: string;
  if (nullable) expected = 'compatible primitive value or null';
  else if (numericType === 'integer') expected = 'finite integer';
  else if (numericType === 'number') expected = 'finite number';
  else expected = kind;

  if (fixedValue.kind === 'accessor') {
    return {
      reason: 'invalid-field-fixed-value',
      member: 'fixedValue',
      expected,
      actualType: 'accessor',
    };
  }

  const value = fixedValue.value;
  const compatible =
    (nullable && value === null) ||
    (kind === 'string' && typeof value === 'string') ||
    (kind === 'boolean' && typeof value === 'boolean') ||
    (kind === 'number' &&
      typeof value === 'number' &&
      Number.isFinite(value) &&
      (numericType !== 'integer' || Number.isInteger(value)));
  if (!compatible) {
    const type = actualType(value);
    const safelyDescribed =
      value === null ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value));
    return {
      reason: 'invalid-field-fixed-value',
      member: 'fixedValue',
      expected,
      actualType: type,
      ...(safelyDescribed ? { actualValue: value } : {}),
    };
  }

  if (kind === 'string') {
    const choices = readOwnDataMember(node, 'choices');
    if (
      choices.kind === 'value' &&
      Array.isArray(choices.value) &&
      !stringChoicesContain(choices.value, value)
    ) {
      return {
        reason: 'incompatible-field-capabilities',
        members: Object.freeze(['fixedValue', 'choices']),
      };
    }
  }
  return undefined;
}

function stringChoicesContain(
  choices: readonly unknown[],
  expected: unknown,
): boolean {
  for (let index = 0; index < choices.length; index += 1) {
    const choice = readOwnDataMember(choices, String(index));
    if (
      choice.kind === 'value' &&
      isOrdinaryObject(choice.value) &&
      readValue(choice.value, 'value') === expected
    ) {
      return true;
    }
  }
  return false;
}

function validStringField(node: object): boolean {
  const constraints = readValue(node, 'constraints');
  if (!isOrdinaryObject(constraints)) return false;
  const format = readOwnDataMember(node, 'format');
  if (
    format.kind !== 'missing' &&
    (format.kind !== 'value' ||
      (format.value !== 'email' &&
        format.value !== 'date' &&
        format.value !== 'date-time'))
  ) {
    return false;
  }
  const choicesMember = readOwnDataMember(node, 'choices');
  if (choicesMember.kind === 'missing') return true;
  if (
    choicesMember.kind !== 'value' ||
    !Array.isArray(choicesMember.value) ||
    choicesMember.value.length === 0
  ) {
    return false;
  }
  const seen = new Set<string>();
  for (let index = 0; index < choicesMember.value.length; index += 1) {
    const choiceMember = readOwnDataMember(choicesMember.value, String(index));
    if (
      choiceMember.kind !== 'value' ||
      !isOrdinaryObject(choiceMember.value)
    ) {
      return false;
    }
    const value = readValue(choiceMember.value, 'value');
    const label = readValue(choiceMember.value, 'label');
    if (
      typeof value !== 'string' ||
      typeof label !== 'string' ||
      label.trim().length === 0 ||
      seen.has(value)
    ) {
      return false;
    }
    seen.add(value);
  }
  return true;
}

function validNumberField(node: object): boolean {
  const numericType = readValue(node, 'numericType');
  const constraints = readValue(node, 'constraints');
  const ui = readValue(node, 'ui');
  return (
    (numericType === 'number' || numericType === 'integer') &&
    isOrdinaryObject(constraints) &&
    isOrdinaryObject(ui)
  );
}

function inspectStringEnumArrayField(node: object):
  | {
      readonly member: NonNullable<NestedDefinitionDefect['member']>;
      readonly expected: string;
      readonly actualType: string;
    }
  | undefined {
  const nullable = readOwnDataMember(node, 'nullable');
  if (nullable.kind !== 'value' || nullable.value !== false) {
    return {
      member: 'nullable',
      expected: 'false',
      actualType:
        nullable.kind === 'missing'
          ? 'missing'
          : nullable.kind === 'accessor'
            ? 'accessor'
            : actualType(nullable.value),
    };
  }

  for (const memberName of [
    'placeholder',
    'fixedValue',
    'visibleWhen',
    'enabledWhen',
  ] as const) {
    const member = readOwnDataMember(node, memberName);
    if (member.kind !== 'missing') {
      return {
        member: memberName,
        expected: 'absent',
        actualType:
          member.kind === 'accessor' ? 'accessor' : actualType(member.value),
      };
    }
  }

  const choices = readOwnDataMember(node, 'choices');
  if (
    choices.kind !== 'value' ||
    !Array.isArray(choices.value) ||
    choices.value.length === 0
  ) {
    return {
      member: 'choices',
      expected: 'non-empty dense array of unique string choices',
      actualType:
        choices.kind === 'missing'
          ? 'missing'
          : choices.kind === 'accessor'
            ? 'accessor'
            : actualType(choices.value),
    };
  }

  const seen = new Set<string>();
  for (let index = 0; index < choices.value.length; index += 1) {
    const choice = readOwnDataMember(choices.value, String(index));
    if (choice.kind !== 'value' || !isOrdinaryObject(choice.value)) {
      return {
        member: `choices.${index}`,
        expected: 'ordinary choice object',
        actualType:
          choice.kind === 'missing'
            ? 'missing'
            : choice.kind === 'accessor'
              ? 'accessor'
              : actualType(choice.value),
      };
    }
    const value = readOwnDataMember(choice.value, 'value');
    if (
      value.kind !== 'value' ||
      typeof value.value !== 'string' ||
      seen.has(value.value)
    ) {
      return {
        member: `choices.${index}.value`,
        expected: 'own unique string',
        actualType:
          value.kind === 'missing'
            ? 'missing'
            : value.kind === 'accessor'
              ? 'accessor'
              : actualType(value.value),
      };
    }
    seen.add(value.value);
    const label = readOwnDataMember(choice.value, 'label');
    if (
      label.kind !== 'value' ||
      typeof label.value !== 'string' ||
      label.value.trim().length === 0
    ) {
      return {
        member: `choices.${index}.label`,
        expected: 'own non-blank string',
        actualType:
          label.kind === 'missing'
            ? 'missing'
            : label.kind === 'accessor'
              ? 'accessor'
              : actualType(label.value),
      };
    }
  }
  return undefined;
}

function validOptionalText(node: object, key: string): boolean {
  const member = readOwnDataMember(node, key);
  return (
    member.kind === 'missing' ||
    (member.kind === 'value' && typeof member.value === 'string')
  );
}

function readValue(target: object, key: string): unknown {
  const member = readOwnDataMember(target, key);
  return member.kind === 'value' ? member.value : undefined;
}

function makeDefect(
  reason: NestedDefinitionReason,
  locators: Omit<NestedDefinitionDefect, 'reason'> = {},
): NestedDefinitionDefect {
  return Object.freeze({ reason, ...locators });
}
