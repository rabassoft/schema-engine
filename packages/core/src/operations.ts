import type {
  ApplyOperationResult,
  Diagnostic,
  FormDefinition,
  FormOperation,
} from './contracts.js';
import { diagnostic } from './internal/diagnostics.js';
import {
  collectNestedFormDefinitionDefects,
  type NestedDefinitionDefect,
} from './internal/nested-definition.js';
import {
  canonicalDataPathKey,
  copyStringDataPath,
  isOrdinaryObject,
  readOwnDataMember,
} from './internal/path.js';
import { actualType, describeActualValue } from './internal/value.js';
import {
  applyCollectionOperation,
  isCollectionOperation,
} from './internal/collection-operation.js';

type ParsedExpectation =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown };

interface ParsedOperation {
  readonly type: 'set-value' | 'remove-value';
  readonly path: readonly string[];
  readonly expected: ParsedExpectation;
  readonly value?: unknown;
}

interface ManagedField {
  readonly name: string;
  readonly type: 'string' | 'number' | 'integer' | 'boolean';
}

interface ValidatedDefinition {
  readonly fields: ReadonlyMap<string, ManagedField>;
  readonly objectKeys: ReadonlySet<string>;
}

const EMPTY_DIAGNOSTICS: readonly [] = Object.freeze([]);

export function applyOperation<TData extends object>(
  currentValue: Readonly<TData>,
  operation: FormOperation,
): ApplyOperationResult<TData> {
  return apply(undefined, currentValue, operation);
}

export function applyFormOperation<TData extends object>(
  definition: FormDefinition,
  currentValue: Readonly<TData>,
  operation: FormOperation,
): ApplyOperationResult<TData> {
  return apply(definition, currentValue, operation);
}

function apply<TData extends object>(
  definition: FormDefinition | undefined,
  currentValue: Readonly<TData>,
  operation: FormOperation,
): ApplyOperationResult<TData> {
  if (isCollectionOperation(operation)) {
    return applyCollectionOperation(definition, currentValue, operation);
  }
  const targetDiagnostic = validateTarget(currentValue);
  const parsed = validateOperation(operation);
  const shapeDiagnostics = [
    ...(targetDiagnostic === undefined ? [] : [targetDiagnostic]),
    ...parsed.diagnostics,
  ];
  if (shapeDiagnostics.length > 0 || parsed.operation === undefined) {
    return failure(currentValue, shapeDiagnostics);
  }

  const parsedOperation = parsed.operation;
  if (definition !== undefined) {
    const validated = validateDefinition(definition, parsedOperation.path);
    if (
      validated.diagnostics.length > 0 ||
      validated.definition === undefined
    ) {
      return failure(currentValue, validated.diagnostics);
    }
    const pathKey = canonicalDataPathKey(parsedOperation.path);
    const managed = validated.definition.fields.get(pathKey);
    if (managed === undefined) {
      if (validated.definition.objectKeys.has(pathKey)) {
        return failure(currentValue, [
          pathDiagnostic(
            'object-target-not-supported',
            parsedOperation.path.length,
            undefined,
            parsedOperation.path,
          ),
        ]);
      }
      return failure(currentValue, [
        runtimeDiagnostic(
          'FORM_PATH_NOT_MANAGED',
          { path: [...parsedOperation.path] },
          'Operation path is not managed by the form.',
          parsedOperation.path,
        ),
      ]);
    }
    if (parsedOperation.type === 'set-value') {
      const compatibility = validateCompatibleValue(
        managed,
        parsedOperation.value,
        parsedOperation.path,
      );
      if (compatibility !== undefined) {
        return failure(currentValue, [compatibility]);
      }
    }
  }

  const traversal = traverseOperationPath(currentValue, parsedOperation);
  if (!traversal.success) {
    return failure(currentValue, [traversal.diagnostic]);
  }
  const { present, actual } = traversal;
  if (!expectationMatches(parsedOperation.expected, present, actual)) {
    return failure(currentValue, [
      staleDiagnostic(
        parsedOperation.expected,
        present,
        actual,
        parsedOperation.path,
      ),
    ]);
  }

  if (parsedOperation.type === 'set-value') {
    if (present && Object.is(actual, parsedOperation.value)) {
      return success(currentValue, false);
    }
    return success(
      rebuildOperationPath(
        traversal.parents,
        parsedOperation.path,
        parsedOperation.value,
        false,
      ) as Readonly<TData>,
      true,
    );
  }

  return success(
    rebuildOperationPath(
      traversal.parents,
      parsedOperation.path,
      undefined,
      true,
    ) as Readonly<TData>,
    true,
  );
}

type PathTraversal =
  | {
      readonly success: true;
      readonly parents: readonly object[];
      readonly present: boolean;
      readonly actual: unknown;
    }
  | { readonly success: false; readonly diagnostic: Diagnostic };

function traverseOperationPath(
  root: object,
  operation: ParsedOperation,
): PathTraversal {
  const parents: object[] = [root];
  let parent = root;
  for (let index = 0; index < operation.path.length - 1; index += 1) {
    const property = operation.path[index] as string;
    const prefix = operation.path.slice(0, index + 1);
    const member = readOwnDataMember(parent, property);
    if (member.kind === 'accessor') {
      return {
        success: false,
        diagnostic: unsupportedProperty(property, prefix),
      };
    }
    if (member.kind === 'missing') {
      if (operation.type === 'remove-value') {
        return {
          success: true,
          parents,
          present: false,
          actual: undefined,
        };
      }
      const created: object = {};
      parents.push(created);
      parent = created;
      continue;
    }
    if (!isOrdinaryObject(member.value)) {
      return {
        success: false,
        diagnostic: runtimeDiagnostic(
          'INCOMPATIBLE_OPERATION_ANCESTOR',
          {
            reason: 'non-object-ancestor',
            actualType: actualType(member.value),
          },
          'Operation ancestor is not an ordinary object.',
          prefix,
        ),
      };
    }
    parent = member.value;
    parents.push(parent);
  }

  const terminal = operation.path.at(-1) as string;
  const member = readOwnDataMember(parent, terminal);
  if (member.kind === 'accessor') {
    return {
      success: false,
      diagnostic: unsupportedProperty(terminal, operation.path),
    };
  }
  return {
    success: true,
    parents,
    present: member.kind === 'value',
    actual: member.kind === 'value' ? member.value : undefined,
  };
}

function unsupportedProperty(
  property: string,
  dataPath: readonly string[],
): Diagnostic {
  return runtimeDiagnostic(
    'UNSUPPORTED_OPERATION_PROPERTY',
    { property, reason: 'accessor-property' },
    'Accessor properties cannot be operation targets.',
    dataPath,
  );
}

function rebuildOperationPath(
  parents: readonly object[],
  path: readonly string[],
  value: unknown,
  remove: boolean,
): object {
  const terminalIndex = path.length - 1;
  let next = remove
    ? cloneWithout(
        parents[terminalIndex] as object,
        path[terminalIndex] as string,
      )
    : cloneWithSet(
        parents[terminalIndex] as object,
        path[terminalIndex] as string,
        value,
      );

  for (let index = terminalIndex - 1; index >= 0; index -= 1) {
    next = cloneWithSet(parents[index] as object, path[index] as string, next);
  }
  return next;
}

function validateTarget(value: unknown): Diagnostic | undefined {
  if (!isOrdinaryObject(value)) {
    return runtimeDiagnostic(
      'INVALID_OPERATION_TARGET',
      { actualType: actualType(value) },
      'Operation target must be an ordinary object.',
    );
  }
  return undefined;
}

function validateOperation(value: unknown): {
  readonly operation?: ParsedOperation;
  readonly diagnostics: readonly Diagnostic[];
} {
  if (!isObject(value)) {
    return {
      diagnostics: [invalidMember('operation', 'non-null object', value)],
    };
  }

  const diagnostics: Diagnostic[] = [];
  const typeMember = member(value, 'type');
  let type: ParsedOperation['type'] | undefined;
  if (typeMember.kind !== 'value') {
    diagnostics.push(
      invalidDescriptorMember(
        'type',
        'set-value or remove-value',
        typeMember.kind,
      ),
    );
  } else if (
    typeMember.value === 'set-value' ||
    typeMember.value === 'remove-value'
  ) {
    type = typeMember.value;
  } else {
    diagnostics.push(
      invalidMember('type', 'set-value or remove-value', typeMember.value),
    );
  }

  validateMetadata(member(value, 'metadata'), diagnostics);
  validateLiteralMember(value, 'source', 'user', diagnostics);
  const path = validatePath(member(value, 'path'), diagnostics);
  const expected = validateExpectation(
    member(value, 'expected'),
    type,
    diagnostics,
  );

  let setValue: unknown;
  if (type === 'set-value') {
    const valueMember = member(value, 'value');
    if (valueMember.kind !== 'value') {
      diagnostics.push(
        invalidDescriptorMember(
          'value',
          'defined own data property',
          valueMember.kind,
        ),
      );
    } else if (valueMember.value === undefined) {
      diagnostics.push(
        invalidMember('value', 'defined own data property', undefined),
      );
    } else {
      setValue = valueMember.value;
    }
  }

  if (
    diagnostics.length > 0 ||
    type === undefined ||
    path === undefined ||
    expected === undefined
  ) {
    return { diagnostics };
  }
  return {
    operation: {
      type,
      path,
      expected,
      ...(type === 'set-value' ? { value: setValue } : {}),
    },
    diagnostics,
  };
}

function validateMetadata(entry: Member, diagnostics: Diagnostic[]): void {
  if (entry.kind !== 'value') {
    diagnostics.push(
      invalidDescriptorMember('metadata', 'metadata object', entry.kind),
    );
    return;
  }
  if (!isObject(entry.value)) {
    diagnostics.push(invalidMember('metadata', 'metadata object', entry.value));
    return;
  }
  const id = member(entry.value, 'id');
  if (id.kind !== 'value') {
    diagnostics.push(
      invalidDescriptorMember('metadata.id', 'integer >= 1', id.kind),
    );
  } else if (
    !Number.isInteger(id.value) ||
    typeof id.value !== 'number' ||
    id.value < 1
  ) {
    diagnostics.push(invalidMember('metadata.id', 'integer >= 1', id.value));
  }
  const formId = member(entry.value, 'formId');
  if (formId.kind !== 'value') {
    diagnostics.push(
      invalidDescriptorMember(
        'metadata.formId',
        'non-empty string',
        formId.kind,
      ),
    );
  } else if (typeof formId.value !== 'string' || formId.value.length === 0) {
    diagnostics.push(
      invalidMember('metadata.formId', 'non-empty string', formId.value),
    );
  }
}

function validateLiteralMember(
  object: object,
  key: string,
  expected: string,
  diagnostics: Diagnostic[],
): void {
  const entry = member(object, key);
  if (entry.kind !== 'value') {
    diagnostics.push(invalidDescriptorMember(key, expected, entry.kind));
  } else if (entry.value !== expected) {
    diagnostics.push(invalidMember(key, expected, entry.value));
  }
}

function validatePath(
  entry: Member,
  diagnostics: Diagnostic[],
): readonly string[] | undefined {
  if (entry.kind !== 'value') {
    diagnostics.push(invalidDescriptorMember('path', 'array', entry.kind));
    return undefined;
  }
  if (!Array.isArray(entry.value)) {
    diagnostics.push(invalidMember('path', 'array', entry.value));
    return undefined;
  }
  if (entry.value.length === 0) {
    diagnostics.push(pathDiagnostic('root-not-supported', 0));
    return undefined;
  }
  const path: string[] = [];
  for (let index = 0; index < entry.value.length; index += 1) {
    const segment = member(entry.value, String(index));
    if (segment.kind !== 'value' || typeof segment.value !== 'string') {
      diagnostics.push(
        pathDiagnostic(
          'non-string-segment',
          entry.value.length,
          segment.kind === 'value' ? segment.value : undefined,
          undefined,
          index,
        ),
      );
      return undefined;
    }
    path.push(segment.value);
  }
  return Object.freeze(path);
}

function validateExpectation(
  entry: Member,
  type: ParsedOperation['type'] | undefined,
  diagnostics: Diagnostic[],
): ParsedExpectation | undefined {
  if (entry.kind !== 'value') {
    diagnostics.push(
      invalidDescriptorMember('expected', 'expectation object', entry.kind),
    );
    return undefined;
  }
  if (!isObject(entry.value)) {
    diagnostics.push(
      invalidMember('expected', 'expectation object', entry.value),
    );
    return undefined;
  }
  const kind = member(entry.value, 'kind');
  if (kind.kind !== 'value') {
    diagnostics.push(
      invalidDescriptorMember('expected.kind', 'missing or value', kind.kind),
    );
    return undefined;
  }
  if (kind.value !== 'missing' && kind.value !== 'value') {
    diagnostics.push(
      invalidMember('expected.kind', 'missing or value', kind.value),
    );
    return undefined;
  }
  if (type === 'remove-value' && kind.value !== 'value') {
    diagnostics.push(invalidMember('expected.kind', 'value', kind.value));
    return undefined;
  }
  if (kind.value === 'missing') return { kind: 'missing' };
  const expectedValue = member(entry.value, 'value');
  if (expectedValue.kind !== 'value') {
    diagnostics.push(
      invalidDescriptorMember(
        'expected.value',
        'own data property',
        expectedValue.kind,
      ),
    );
    return undefined;
  }
  return { kind: 'value', value: expectedValue.value };
}

function validateDefinition(
  definition: unknown,
  dataPath: readonly string[],
): {
  readonly definition?: ValidatedDefinition;
  readonly diagnostics: readonly Diagnostic[];
} {
  if (!isObject(definition)) {
    return { diagnostics: [formDiagnostic('definition-not-object', dataPath)] };
  }
  const fieldsMember = member(definition, 'fields');
  if (fieldsMember.kind !== 'value' || !Array.isArray(fieldsMember.value)) {
    return { diagnostics: [formDiagnostic('fields-not-array', dataPath)] };
  }
  const diagnostics: Diagnostic[] = [];
  const fields = new Map<string, ManagedField>();
  for (let index = 0; index < fieldsMember.value.length; index += 1) {
    const fieldMember = member(fieldsMember.value, String(index));
    if (fieldMember.kind !== 'value' || !isObject(fieldMember.value)) {
      diagnostics.push(formDiagnostic('field-not-object', dataPath, index));
      continue;
    }
    const pathMember = member(fieldMember.value, 'path');
    const path =
      pathMember.kind === 'value'
        ? copyStringDataPath(pathMember.value)
        : undefined;
    if (path === undefined) {
      diagnostics.push(formDiagnostic('invalid-field-path', dataPath, index));
      continue;
    }
    const key = canonicalDataPathKey(path);
    if (fields.has(key)) {
      diagnostics.push(
        formDiagnostic('duplicate-field-path', dataPath, index, path),
      );
      continue;
    }
    const kind = member(fieldMember.value, 'kind');
    if (
      kind.kind !== 'value' ||
      (kind.value !== 'string' &&
        kind.value !== 'number' &&
        kind.value !== 'boolean')
    ) {
      diagnostics.push(
        formDiagnostic('unsupported-field-kind', dataPath, index),
      );
      continue;
    }
    let fieldType: ManagedField['type'] = kind.value;
    if (kind.value === 'number') {
      const numericType = member(fieldMember.value, 'numericType');
      if (
        numericType.kind !== 'value' ||
        (numericType.value !== 'number' && numericType.value !== 'integer')
      ) {
        diagnostics.push(
          formDiagnostic('invalid-numeric-type', dataPath, index),
        );
        continue;
      }
      fieldType = numericType.value;
    }
    fields.set(key, { name: path.at(-1) as string, type: fieldType });
  }
  if (diagnostics.length > 0) return { diagnostics };

  const nestedDefects = collectNestedFormDefinitionDefects(definition);
  if (nestedDefects.length > 0) {
    return {
      diagnostics: nestedDefects.map((defect) =>
        nestedFormDiagnostic(defect, dataPath),
      ),
    };
  }

  const objectKeys = collectObjectKeys(definition);
  return {
    definition: { fields, objectKeys },
    diagnostics,
  };
}

function collectObjectKeys(definition: object): ReadonlySet<string> {
  const result = new Set<string>();
  const nodes = readOwnDataMember(definition, 'nodes');
  if (nodes.kind !== 'value' || !Array.isArray(nodes.value)) return result;
  const stack: unknown[] = [];
  for (let index = nodes.value.length - 1; index >= 0; index -= 1) {
    const item = readOwnDataMember(nodes.value, String(index));
    if (item.kind === 'value') stack.push(item.value);
  }
  while (stack.length > 0) {
    const node = stack.pop();
    if (!isOrdinaryObject(node)) continue;
    const kind = readOwnDataMember(node, 'kind');
    const path = readOwnDataMember(node, 'path');
    if (kind.kind !== 'value' || kind.value !== 'object') continue;
    const copiedPath =
      path.kind === 'value' ? copyStringDataPath(path.value) : undefined;
    if (copiedPath !== undefined) {
      result.add(canonicalDataPathKey(copiedPath));
    }
    const children = readOwnDataMember(node, 'children');
    if (children.kind !== 'value' || !Array.isArray(children.value)) continue;
    for (let index = children.value.length - 1; index >= 0; index -= 1) {
      const child = readOwnDataMember(children.value, String(index));
      if (child.kind === 'value') stack.push(child.value);
    }
  }
  return result;
}

function nestedFormDiagnostic(
  defect: NestedDefinitionDefect,
  dataPath: readonly string[],
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
      ...(defect.fieldIndex === undefined
        ? {}
        : { fieldIndex: defect.fieldIndex }),
      ...(defect.path === undefined ? {} : { path: [...defect.path] }),
    },
    'Form definition is invalid.',
    dataPath,
  );
}

function validateCompatibleValue(
  field: ManagedField,
  value: unknown,
  dataPath: readonly string[],
): Diagnostic | undefined {
  const compatible =
    (field.type === 'string' && typeof value === 'string') ||
    (field.type === 'boolean' && typeof value === 'boolean') ||
    (field.type === 'number' &&
      typeof value === 'number' &&
      Number.isFinite(value)) ||
    (field.type === 'integer' &&
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Number.isInteger(value));
  if (compatible) return undefined;
  return runtimeDiagnostic(
    'INCOMPATIBLE_OPERATION_VALUE',
    { field: field.name, fieldType: field.type, ...describeActualValue(value) },
    `Operation value is incompatible with field "${field.name}".`,
    dataPath,
  );
}

function expectationMatches(
  expectation: ParsedExpectation,
  present: boolean,
  actual: unknown,
): boolean {
  return expectation.kind === 'missing'
    ? !present
    : present && Object.is(expectation.value, actual);
}

function staleDiagnostic(
  expectation: ParsedExpectation,
  present: boolean,
  actual: unknown,
  dataPath: readonly string[],
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
    dataPath,
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
  const created: unknown = Object.create(Reflect.getPrototypeOf(value));
  if (typeof created !== 'object' || created === null) {
    throw new Error('Failed to create operation result object.');
  }
  const next = created;
  for (const key of Reflect.ownKeys(value)) {
    if (key === omitted) continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor !== undefined) Object.defineProperty(next, key, descriptor);
  }
  return next;
}

type Member =
  | { readonly kind: 'missing' }
  | { readonly kind: 'accessor' }
  | { readonly kind: 'value'; readonly value: unknown };

function member(object: object, key: PropertyKey): Member {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  if (descriptor === undefined) return { kind: 'missing' };
  return 'value' in descriptor
    ? { kind: 'value', value: descriptor.value }
    : { kind: 'accessor' };
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function invalidDescriptorMember(
  memberName: string,
  expected: string,
  kind: 'missing' | 'accessor',
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_OPERATION',
    {
      member: memberName,
      expected,
      reason: kind === 'missing' ? 'missing-member' : 'accessor-member',
    },
    `Operation member "${memberName}" is invalid.`,
  );
}

function invalidMember(
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

function pathDiagnostic(
  reason: string,
  pathLength: number,
  value?: unknown,
  dataPath?: readonly string[],
  segmentIndex = 0,
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_OPERATION_PATH',
    {
      reason,
      pathLength,
      ...(reason === 'non-string-segment' ? { segmentIndex } : {}),
      ...(value === undefined ? {} : describeActualValue(value)),
    },
    'Operation path is outside the supported root-property scope.',
    dataPath,
  );
}

function formDiagnostic(
  reason: string,
  dataPath: readonly string[],
  fieldIndex?: number,
  path?: readonly string[],
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_FORM_DEFINITION',
    {
      reason,
      ...(fieldIndex === undefined ? {} : { fieldIndex }),
      ...(path === undefined ? {} : { path: [...path] }),
    },
    'Form definition is invalid.',
    dataPath,
  );
}

function runtimeDiagnostic(
  code: string,
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
  dataPath?: readonly string[],
): Diagnostic {
  const copiedParameters = { ...parameters };
  for (const value of Object.values(copiedParameters)) {
    if (Array.isArray(value)) Object.freeze(value);
    else if (typeof value === 'object' && value !== null) Object.freeze(value);
  }
  Object.freeze(copiedParameters);
  const result = diagnostic({
    code,
    severity: 'error',
    source: 'runtime',
    ...(dataPath === undefined ? {} : { dataPath }),
    parameters: copiedParameters,
    fallbackMessage,
  });
  if (result.dataPath !== undefined) Object.freeze(result.dataPath);
  Object.freeze(result.parameters);
  return Object.freeze(result);
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
