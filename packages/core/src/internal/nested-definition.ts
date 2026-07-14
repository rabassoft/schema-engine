import type { FieldDefinition } from '../contracts.js';
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
  | 'inconsistent-leaf-projection';

export interface NestedDefinitionDefect {
  readonly reason: NestedDefinitionReason;
  readonly nodeIndexPath?: readonly number[];
  readonly firstNodeIndexPath?: readonly number[];
  readonly fieldIndex?: number;
  readonly path?: readonly string[];
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
  const defects = collectNestedFormDefinitionDefects(value);
  const first = defects[0];
  return first === undefined
    ? Object.freeze({ success: true })
    : { success: false, defect: first };
}

export function collectNestedFormDefinitionDefects(
  value: unknown,
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

    const inspected = inspectNode(node, frame.parentPath);
    if (!inspected.success) {
      defects.push(
        makeDefect('invalid-node', {
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

  return Object.freeze(defects);
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
      readonly success: false;
      readonly path?: readonly string[];
    };

function inspectNode(
  node: object,
  parentPath: readonly string[] | undefined,
): InspectedNode {
  const kind = readValue(node, 'kind');
  const name = readValue(node, 'name');
  const key = readValue(node, 'key');
  const rawPath = readValue(node, 'path');
  const path = copyStringDataPath(rawPath);
  const required = readValue(node, 'required');
  const label = readValue(node, 'label');

  if (
    typeof kind !== 'string' ||
    !['object', 'string', 'number', 'boolean'].includes(kind) ||
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
    return { success: false, ...(path === undefined ? {} : { path }) };
  }

  if (kind === 'object') {
    const children = readValue(node, 'children');
    if (!Array.isArray(children)) return { success: false, path };
    return { success: true, kind: 'object', key, path, children };
  }

  if (!validOptionalText(node, 'placeholder')) {
    return { success: false, path };
  }
  if (kind === 'string' && !validStringField(node)) {
    return { success: false, path };
  }
  if (kind === 'number' && !validNumberField(node)) {
    return { success: false, path };
  }
  return { success: true, kind: 'field', key, path };
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
