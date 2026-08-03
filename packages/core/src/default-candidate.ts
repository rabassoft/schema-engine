// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import {
  inspectDefaultCandidateSchema,
  type DefaultCandidateSchemaNode,
} from './compiler.js';
import type { ApplyOperationResult, Diagnostic } from './contracts.js';
import { diagnostic } from './internal/diagnostics.js';
import { isOrdinaryObject, readOwnDataMember } from './internal/path.js';
import { actualType } from './internal/value.js';
import { EMPTY_DIAGNOSTICS } from './operations.js';

interface DirectDefault {
  readonly path: readonly string[];
  readonly value: string | number | boolean | null;
}

export function deriveSchemaDefaultCandidate<TData extends object>(
  schema: unknown,
  value: Readonly<TData>,
): ApplyOperationResult<TData> {
  const schemaShape = ordinaryObjectState(schema);
  if (schemaShape === 'inspection-failed') {
    return failure(value, [inspectionFailure('schema')]);
  }
  if (schemaShape === 'invalid') {
    return failure(value, [invalidInput('schema', schema)]);
  }
  const schemaObject = schema as object;

  let inspected: ReturnType<typeof inspectDefaultCandidateSchema>;
  try {
    inspected = inspectDefaultCandidateSchema(schema);
  } catch {
    return failure(value, [inspectionFailure('schema')]);
  }
  const collected = collectDefaults(inspected.nodes);
  if (!collected.success) {
    return failure(
      value,
      inspected.success
        ? collected.diagnostics
        : mergeDiagnostics(
            inspected.nodes,
            inspected.diagnostics,
            collected.diagnostics,
            collectRawDefaultDiagnostics(schemaObject),
          ),
    );
  }
  if (!inspected.success) {
    const rawDiagnostics = collectRawDefaultDiagnostics(schemaObject);
    return failure(
      value,
      mergeDiagnostics(inspected.nodes, inspected.diagnostics, rawDiagnostics),
    );
  }

  const valueShape = ordinaryObjectState(value);
  if (valueShape === 'inspection-failed') {
    return failure(value, [inspectionFailure('value')]);
  }
  if (valueShape === 'invalid') {
    return failure(value, [invalidInput('value', value)]);
  }

  const applicable: DirectDefault[] = [];
  for (const candidate of collected.defaults) {
    const inspected = inspectCandidatePath(value, candidate.path);
    if (!inspected.success) return failure(value, inspected.diagnostics);
    if (inspected.applicable) applicable.push(candidate);
  }

  if (applicable.length === 0) return success(value, false);

  const reconstructed = reconstructCandidate(value, applicable);
  return reconstructed.success
    ? success(reconstructed.value, true)
    : failure(value, reconstructed.diagnostics);
}

type CollectedDefaults =
  | { readonly success: true; readonly defaults: readonly DirectDefault[] }
  | { readonly success: false; readonly diagnostics: readonly Diagnostic[] };

interface CollectWork {
  readonly node: DefaultCandidateSchemaNode;
}

function collectDefaults(
  nodes: readonly DefaultCandidateSchemaNode[],
): CollectedDefaults {
  const defaults: DirectDefault[] = [];
  const diagnostics: Diagnostic[] = [];
  try {
    const stack: CollectWork[] = [];
    pushCollectWork(nodes, stack);
    while (stack.length > 0) {
      const work = stack.pop();
      if (work === undefined) break;

      if (work.node.kind === 'array') continue;
      if (work.node.kind === 'object') {
        pushCollectWork(work.node.children, stack);
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        work.node.schema,
        'default',
      );
      if (descriptor === undefined || descriptor.enumerable !== true) continue;
      const expected = expectedDefault(work.node);
      const dataPath = work.node.path;
      const documentPath = [...work.node.documentPath, 'default'];
      if (!('value' in descriptor)) {
        diagnostics.push(
          defaultDiagnostic(
            dataPath,
            documentPath,
            expected,
            'accessor',
            work.node.referenceChain,
          ),
        );
        continue;
      }
      if (!isCompatibleDefault(work.node, descriptor.value)) {
        diagnostics.push(
          defaultDiagnostic(
            dataPath,
            documentPath,
            expected,
            actualType(descriptor.value),
            work.node.referenceChain,
          ),
        );
        continue;
      }
      defaults.push({
        path: Object.freeze([...dataPath]),
        value: descriptor.value as string | number | boolean | null,
      });
    }
  } catch {
    return {
      success: false,
      diagnostics: Object.freeze([inspectionFailure('schema')]),
    };
  }
  if (diagnostics.length > 0) {
    return { success: false, diagnostics: freezeDiagnostics(diagnostics) };
  }
  return { success: true, defaults: Object.freeze(defaults) };
}

function pushCollectWork(
  nodes: readonly DefaultCandidateSchemaNode[],
  stack: CollectWork[],
): void {
  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];
    if (node !== undefined) stack.push({ node });
  }
}

type InspectedCandidate =
  | { readonly success: true; readonly applicable: boolean }
  | { readonly success: false; readonly diagnostics: readonly Diagnostic[] };

function inspectCandidatePath(
  root: object,
  path: readonly string[],
): InspectedCandidate {
  let current = root;
  const currentPath: string[] = [];
  for (let index = 0; index < path.length; index += 1) {
    const name = path[index];
    if (name === undefined) continue;
    currentPath.push(name);
    let member: ReturnType<typeof readOwnDataMember>;
    try {
      member = readOwnDataMember(current, name);
    } catch {
      return {
        success: false,
        diagnostics: Object.freeze([inspectionFailure('value', currentPath)]),
      };
    }
    if (member.kind === 'accessor') {
      return {
        success: false,
        diagnostics: Object.freeze([accessorInput(currentPath)]),
      };
    }
    if (member.kind === 'missing') {
      return { success: true, applicable: true };
    }
    if (index === path.length - 1) {
      return { success: true, applicable: false };
    }
    const shape = ordinaryObjectState(member.value);
    if (shape === 'inspection-failed') {
      return {
        success: false,
        diagnostics: Object.freeze([inspectionFailure('value', currentPath)]),
      };
    }
    if (shape === 'invalid') {
      return { success: true, applicable: false };
    }
    current = member.value as object;
  }
  return { success: true, applicable: false };
}

interface InsertionNode {
  value?: string | number | boolean | null;
  readonly children: Map<string, InsertionNode>;
}

type ReconstructedCandidate<TData extends object> =
  | { readonly success: true; readonly value: TData }
  | { readonly success: false; readonly diagnostics: readonly Diagnostic[] };

interface ReconstructionFrame {
  readonly source: object | undefined;
  readonly target: object;
  readonly insertion: InsertionNode;
  readonly path: readonly string[];
}

function reconstructCandidate<TData extends object>(
  value: Readonly<TData>,
  applicable: readonly DirectDefault[],
): ReconstructedCandidate<TData> {
  const insertion: InsertionNode = { children: new Map() };
  for (const entry of applicable) {
    let current = insertion;
    for (const name of entry.path) {
      let child = current.children.get(name);
      if (child === undefined) {
        child = { children: new Map() };
        current.children.set(name, child);
      }
      current = child;
    }
    current.value = entry.value;
  }

  const root = cloneObject(value, []);
  if (!root.success) return root;
  const stack: ReconstructionFrame[] = [
    { source: value, target: root.value, insertion, path: [] },
  ];
  try {
    while (stack.length > 0) {
      const frame = stack.pop();
      if (frame === undefined) break;
      const childFrames: ReconstructionFrame[] = [];
      for (const [name, child] of frame.insertion.children) {
        const path = [...frame.path, name];
        let member:
          ReturnType<typeof readOwnDataMember> | { readonly kind: 'missing' } =
          { kind: 'missing' };
        if (frame.source !== undefined) {
          try {
            member = readOwnDataMember(frame.source, name);
          } catch {
            return reconstructionFailure('inspection-failed', path);
          }
        }

        if (child.children.size === 0) {
          if (member.kind !== 'missing') {
            return reconstructionFailure('inspection-failed', path);
          }
          defineManaged(frame.target, name, child.value);
          continue;
        }

        let source: object | undefined;
        let target: object;
        if (member.kind === 'missing') {
          target = {};
        } else if (member.kind === 'value') {
          const shape = ordinaryObjectState(member.value);
          if (shape !== 'ordinary') {
            return reconstructionFailure('inspection-failed', path);
          }
          source = member.value as object;
          const cloned = cloneObject(source, path);
          if (!cloned.success) return cloned;
          target = cloned.value;
        } else {
          return reconstructionFailure('inspection-failed', path);
        }
        try {
          defineManaged(frame.target, name, target);
        } catch {
          return reconstructionFailure('clone-failed', path);
        }
        childFrames.push({ source, target, insertion: child, path });
      }
      for (let index = childFrames.length - 1; index >= 0; index -= 1) {
        const childFrame = childFrames[index];
        if (childFrame !== undefined) stack.push(childFrame);
      }
    }
  } catch {
    return reconstructionFailure('clone-failed');
  }
  return { success: true, value: root.value as TData };
}

function cloneObject(
  source: object,
  path: readonly string[],
): ReconstructedCandidate<object> {
  try {
    return {
      success: true,
      value: Object.create(
        Reflect.getPrototypeOf(source),
        Object.getOwnPropertyDescriptors(source),
      ) as object,
    };
  } catch {
    return reconstructionFailure('clone-failed', path);
  }
}

function defineManaged(target: object, name: string, value: unknown): void {
  Object.defineProperty(target, name, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
}

function reconstructionFailure<TData extends object>(
  reason: 'inspection-failed' | 'clone-failed',
  path?: readonly string[],
): ReconstructedCandidate<TData> {
  return {
    success: false,
    diagnostics: Object.freeze([constructionFailure(reason, path)]),
  };
}

function expectedDefault(field: DefaultCandidateSchemaNode): string {
  const base =
    field.kind === 'string'
      ? 'string'
      : field.kind === 'boolean'
        ? 'boolean'
        : field.kind === 'integer'
          ? 'finite integer'
          : 'finite number';
  return field.nullable ? `${base} or null` : base;
}

function isCompatibleDefault(
  field: DefaultCandidateSchemaNode,
  value: unknown,
): boolean {
  if (value === null) return field.nullable;
  if (field.kind === 'string') return typeof value === 'string';
  if (field.kind === 'boolean') return typeof value === 'boolean';
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (field.kind !== 'integer' || Number.isInteger(value))
  );
}

function ordinaryObjectState(
  value: unknown,
): 'ordinary' | 'invalid' | 'inspection-failed' {
  try {
    return isOrdinaryObject(value) ? 'ordinary' : 'invalid';
  } catch {
    return 'inspection-failed';
  }
}

function collectRawDefaultDiagnostics(schema: object): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  try {
    const properties = readOwnDataMember(schema, 'properties');
    if (properties.kind !== 'value' || !isOrdinaryObject(properties.value)) {
      return EMPTY_DIAGNOSTICS;
    }
    for (const name of Object.keys(properties.value)) {
      const fieldMember = readOwnDataMember(properties.value, name);
      if (
        fieldMember.kind !== 'value' ||
        !isOrdinaryObject(fieldMember.value)
      ) {
        continue;
      }
      const shape = rawPrimitiveShape(fieldMember.value);
      if (shape === undefined) continue;
      const descriptor = Object.getOwnPropertyDescriptor(
        fieldMember.value,
        'default',
      );
      if (descriptor === undefined || descriptor.enumerable !== true) continue;
      const expected = shape.nullable
        ? `${shape.expected} or null`
        : shape.expected;
      if (!('value' in descriptor)) {
        diagnostics.push(
          defaultDiagnostic(
            [name],
            ['properties', name, 'default'],
            expected,
            'accessor',
          ),
        );
      } else if (!shape.compatible(descriptor.value)) {
        diagnostics.push(
          defaultDiagnostic(
            [name],
            ['properties', name, 'default'],
            expected,
            actualType(descriptor.value),
          ),
        );
      }
    }
  } catch {
    return Object.freeze([inspectionFailure('schema')]);
  }
  return freezeDiagnostics(diagnostics);
}

interface RawPrimitiveShape {
  readonly nullable: boolean;
  readonly expected: string;
  readonly compatible: (value: unknown) => boolean;
}

function rawPrimitiveShape(field: object): RawPrimitiveShape | undefined {
  const member = readOwnDataMember(field, 'type');
  if (member.kind !== 'value') return undefined;
  let nullable = false;
  let type: unknown = member.value;
  if (Array.isArray(type) && type.length === 2) {
    const first = readOwnDataMember(type, '0');
    const second = readOwnDataMember(type, '1');
    if (first.kind !== 'value' || second.kind !== 'value') return undefined;
    if (first.value === 'null') type = second.value;
    else if (second.value === 'null') type = first.value;
    else return undefined;
    nullable = true;
  }
  if (type === 'string') {
    return {
      nullable,
      expected: 'string',
      compatible: (value) =>
        (nullable && value === null) || typeof value === 'string',
    };
  }
  if (type === 'boolean') {
    return {
      nullable,
      expected: 'boolean',
      compatible: (value) =>
        (nullable && value === null) || typeof value === 'boolean',
    };
  }
  if (type === 'number' || type === 'integer') {
    return {
      nullable,
      expected: type === 'integer' ? 'finite integer' : 'finite number',
      compatible: (value) =>
        (nullable && value === null) ||
        (typeof value === 'number' &&
          Number.isFinite(value) &&
          (type !== 'integer' || Number.isInteger(value))),
    };
  }
  return undefined;
}

function defaultDiagnostic(
  dataPath: readonly string[],
  documentPath: readonly (string | number)[],
  expected: string,
  type: string,
  referenceChain: readonly (readonly (string | number)[])[] = [],
): Diagnostic {
  return frozenDiagnostic({
    code: 'INVALID_SCHEMA_KEYWORD_VALUE',
    severity: 'error',
    source: 'schema',
    dataPath: [...dataPath],
    documentPath: [...documentPath],
    parameters: {
      keyword: 'default',
      expected,
      actualType: type,
      ...(referenceChain.length === 0
        ? {}
        : {
            referenceChain: Object.freeze(
              referenceChain.map((path) => Object.freeze([...path])),
            ),
          }),
    },
    fallbackMessage: 'Schema keyword "default" has an invalid value.',
  });
}

function mergeDiagnostics(
  nodes: readonly DefaultCandidateSchemaNode[],
  base: readonly Diagnostic[],
  ...groups: readonly (readonly Diagnostic[])[]
): readonly Diagnostic[] {
  const result: Diagnostic[] = [...base];
  const seen = new Set<string>();
  for (const item of base) seen.add(diagnosticKey(item));
  const orderedNodes = flattenDefaultNodes(nodes);
  for (const group of groups) {
    for (const item of group) {
      const key = diagnosticKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      const position = diagnosticPosition(item, orderedNodes);
      if (position === undefined) {
        result.push(item);
        continue;
      }
      const insertion = result.findIndex((current) => {
        const currentPosition = diagnosticPosition(current, orderedNodes);
        return (
          currentPosition !== undefined &&
          (currentPosition.node > position.node ||
            (currentPosition.node === position.node &&
              currentPosition.keyword > position.keyword))
        );
      });
      if (insertion < 0) result.push(item);
      else result.splice(insertion, 0, item);
    }
  }
  return Object.freeze(result);
}

function diagnosticKey(item: Diagnostic): string {
  return JSON.stringify([
    item.code,
    item.dataPath,
    item.documentPath,
    item.parameters,
  ]);
}

function flattenDefaultNodes(
  nodes: readonly DefaultCandidateSchemaNode[],
): readonly DefaultCandidateSchemaNode[] {
  const result: DefaultCandidateSchemaNode[] = [];
  const stack = [...nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    result.push(node);
    for (let index = node.children.length - 1; index >= 0; index -= 1) {
      const child = node.children[index];
      if (child !== undefined) stack.push(child);
    }
  }
  return result;
}

function diagnosticPosition(
  item: Diagnostic,
  nodes: readonly DefaultCandidateSchemaNode[],
): { readonly node: number; readonly keyword: number } | undefined {
  if (item.dataPath === undefined || item.documentPath === undefined) {
    return undefined;
  }
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (
      node === undefined ||
      !samePath(item.dataPath, node.path) ||
      item.documentPath.length <= node.documentPath.length ||
      !startsWithPath(item.documentPath, node.documentPath)
    ) {
      continue;
    }
    const keyword = item.documentPath[node.documentPath.length];
    if (typeof keyword !== 'string') return { node: index, keyword: -1 };
    try {
      return {
        node: index,
        keyword: Object.keys(node.schema).indexOf(keyword),
      };
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function samePath(
  left: readonly (string | number)[],
  right: readonly (string | number)[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function startsWithPath(
  path: readonly (string | number)[],
  prefix: readonly (string | number)[],
): boolean {
  return prefix.every((value, index) => value === path[index]);
}

function invalidInput(member: 'schema' | 'value', value: unknown): Diagnostic {
  return frozenDiagnostic({
    code: 'INVALID_DEFAULT_CANDIDATE_INPUT',
    severity: 'error',
    source: 'runtime',
    parameters: {
      member,
      expected:
        member === 'schema'
          ? 'ordinary schema object'
          : 'ordinary data tree at default-candidate paths',
      reason: 'invalid-value',
      actualType: actualType(value),
    },
    fallbackMessage: 'Schema-default candidate input is invalid.',
  });
}

function accessorInput(path: readonly string[]): Diagnostic {
  return frozenDiagnostic({
    code: 'INVALID_DEFAULT_CANDIDATE_INPUT',
    severity: 'error',
    source: 'runtime',
    dataPath: [...path],
    parameters: {
      member: 'value',
      expected: 'ordinary data tree at default-candidate paths',
      reason: 'accessor-member',
      actualType: 'accessor',
    },
    fallbackMessage: 'Schema-default candidate input is invalid.',
  });
}

function inspectionFailure(
  member: 'schema' | 'value',
  path?: readonly string[],
): Diagnostic {
  return frozenDiagnostic({
    code: 'INVALID_DEFAULT_CANDIDATE_INPUT',
    severity: 'error',
    source: 'runtime',
    ...(path === undefined ? {} : { dataPath: [...path] }),
    parameters: {
      member,
      expected:
        member === 'schema'
          ? 'ordinary schema object'
          : 'ordinary data tree at default-candidate paths',
      reason: 'inspection-failed',
    },
    fallbackMessage: 'Schema-default candidate input is invalid.',
  });
}

function constructionFailure(
  reason: 'inspection-failed' | 'clone-failed',
  path?: readonly string[],
): Diagnostic {
  return frozenDiagnostic({
    code: 'DEFAULT_CANDIDATE_FAILED',
    severity: 'error',
    source: 'runtime',
    ...(path === undefined ? {} : { dataPath: [...path] }),
    parameters: {
      reason,
      ...(path === undefined ? {} : { path: Object.freeze([...path]) }),
    },
    fallbackMessage: 'Schema-default candidate construction failed.',
  });
}

function frozenDiagnostic(input: Parameters<typeof diagnostic>[0]): Diagnostic {
  const result = diagnostic(input);
  if (result.dataPath !== undefined) Object.freeze(result.dataPath);
  if (result.documentPath !== undefined) Object.freeze(result.documentPath);
  Object.freeze(result.parameters);
  return Object.freeze(result);
}

function freezeDiagnostics(
  diagnostics: readonly Diagnostic[],
): readonly Diagnostic[] {
  return Object.freeze([...diagnostics]);
}

function failure<TData extends object>(
  value: Readonly<TData>,
  diagnostics: readonly Diagnostic[],
): ApplyOperationResult<TData> {
  return Object.freeze({
    success: false,
    value,
    changed: false,
    diagnostics: freezeDiagnostics(diagnostics),
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
