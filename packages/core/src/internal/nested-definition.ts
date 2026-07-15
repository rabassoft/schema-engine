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
  | 'cyclic-presentation'
  | 'duplicate-presentation-section-id'
  | 'unknown-presented-node'
  | 'duplicate-presented-node'
  | 'missing-presented-node';

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
        }),
      );
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
      continue;
    }

    if (inspected.kind === 'array') {
      defects.push(
        ...collectTemplateDefects(
          inspected.item.children,
          inspected.item.fields,
          inspected.path,
          inspected.identityProperty,
        ),
      );
      continue;
    }

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

  defects.push(...collectPresentationDefects(value, nodes));

  return Object.freeze(defects);
}

function collectPresentationDefects(
  definition: object,
  nodes: readonly unknown[],
): readonly NestedDefinitionDefect[] {
  const member = readOwnDataMember(definition, 'presentation');
  if (member.kind !== 'value' || !Array.isArray(member.value)) {
    return [makeDefect('missing-presentation')];
  }
  const expected = new Set<object>(
    nodes.filter((node): node is object => isOrdinaryObject(node)),
  );
  const seen = new Set<object>();
  const ids = new Set<string>();
  const active = new Set<object>();
  const defects: NestedDefinitionDefect[] = [];
  type PresentationFrame =
    | { phase: 'enter'; value: unknown; path: readonly number[] }
    | { phase: 'exit'; value: object };
  const stack: PresentationFrame[] = [];
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
    if (!isOrdinaryObject(frame.value)) {
      defects.push(
        makeDefect('invalid-presentation-entry', {
          presentationIndexPath: frame.path,
        }),
      );
      continue;
    }
    const entry = frame.value;
    const kind = readOwnDataMember(entry, 'kind');
    if (kind.kind !== 'value') {
      defects.push(
        makeDefect('invalid-presentation-entry', {
          presentationIndexPath: frame.path,
        }),
      );
      continue;
    }
    if (kind.value === 'form-node') {
      const node = readOwnDataMember(entry, 'node');
      if (
        node.kind !== 'value' ||
        !isOrdinaryObject(node.value) ||
        !expected.has(node.value)
      ) {
        defects.push(
          makeDefect('unknown-presented-node', {
            presentationIndexPath: frame.path,
          }),
        );
      } else if (seen.has(node.value)) {
        defects.push(
          makeDefect('duplicate-presented-node', {
            presentationIndexPath: frame.path,
          }),
        );
      } else seen.add(node.value);
      continue;
    }
    if (kind.value !== 'section') {
      defects.push(
        makeDefect('invalid-presentation-entry', {
          presentationIndexPath: frame.path,
        }),
      );
      continue;
    }
    if (active.has(entry)) {
      defects.push(
        makeDefect('cyclic-presentation', {
          presentationIndexPath: frame.path,
        }),
      );
      continue;
    }
    const id = readOwnDataMember(entry, 'id');
    const key = readOwnDataMember(entry, 'key');
    const label = readOwnDataMember(entry, 'label');
    const children = readOwnDataMember(entry, 'children');
    if (
      id.kind !== 'value' ||
      typeof id.value !== 'string' ||
      id.value.length === 0 ||
      label.kind !== 'value' ||
      typeof label.value !== 'string' ||
      label.value.trim().length === 0 ||
      children.kind !== 'value' ||
      !Array.isArray(children.value) ||
      children.value.length === 0
    ) {
      defects.push(
        makeDefect('invalid-presentation-section', {
          presentationIndexPath: frame.path,
        }),
      );
      continue;
    }
    if (
      key.kind !== 'value' ||
      key.value !== JSON.stringify(['section', id.value])
    ) {
      defects.push(
        makeDefect('invalid-presentation-section-key', {
          presentationIndexPath: frame.path,
        }),
      );
      continue;
    }
    if (ids.has(id.value)) {
      defects.push(
        makeDefect('duplicate-presentation-section-id', {
          presentationIndexPath: frame.path,
        }),
      );
      continue;
    }
    ids.add(id.value);
    active.add(entry);
    stack.push({ phase: 'exit', value: entry });
    for (let index = children.value.length - 1; index >= 0; index -= 1) {
      const child = readOwnDataMember(children.value, String(index));
      stack.push({
        phase: 'enter',
        value: child.kind === 'value' ? child.value : undefined,
        path: Object.freeze([...frame.path, index]),
      });
    }
  }
  if (seen.size !== expected.size)
    defects.push(makeDefect('missing-presented-node'));
  return defects;
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
    !['object', 'array', 'string', 'number', 'boolean'].includes(kind) ||
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
      reason: kind === 'array' ? 'invalid-array-node' : 'invalid-node',
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

  if (!validOptionalText(node, 'placeholder')) {
    return { success: false, reason: 'invalid-node', path };
  }
  if (kind === 'string' && !validStringField(node)) {
    return { success: false, reason: 'invalid-node', path };
  }
  if (kind === 'number' && !validNumberField(node)) {
    return { success: false, reason: 'invalid-node', path };
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
        }),
      );
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
      readonly reason: 'invalid-item-template' | 'nested-array-template';
      readonly relativePath?: readonly string[];
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
  if (
    !validOptionalText(node, 'placeholder') ||
    (kind === 'string' && !validStringField(node)) ||
    (kind === 'number' && !validNumberField(node))
  ) {
    return {
      success: false,
      reason: 'invalid-item-template',
      relativePath,
    };
  }
  return { success: true, kind: 'field', key, relativePath };
}

function validStringField(node: object): boolean {
  const constraints = readValue(node, 'constraints');
  if (!isOrdinaryObject(constraints)) return false;
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
