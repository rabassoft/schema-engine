import type {
  ApplyOperationResult,
  Diagnostic,
  FormDefinition,
  FormOperation,
} from './contracts.js';
import { diagnostic } from './internal/diagnostics.js';
import { actualType, describeActualValue } from './internal/value.js';

type ParsedExpectation =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown };

interface ParsedOperation {
  readonly type: 'set-value' | 'remove-value';
  readonly path: readonly [string];
  readonly expected: ParsedExpectation;
  readonly value?: unknown;
}

interface ManagedField {
  readonly name: string;
  readonly type: 'string' | 'number' | 'integer' | 'boolean';
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
    const fields = validateDefinition(definition, parsedOperation.path);
    if (fields.diagnostics.length > 0 || fields.fields === undefined) {
      return failure(currentValue, fields.diagnostics);
    }
    const managed = fields.fields.get(parsedOperation.path[0]);
    if (managed === undefined) {
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

  const property = parsedOperation.path[0];
  const descriptor = Object.getOwnPropertyDescriptor(currentValue, property);
  if (descriptor !== undefined && !('value' in descriptor)) {
    return failure(currentValue, [
      runtimeDiagnostic(
        'UNSUPPORTED_OPERATION_PROPERTY',
        { property, reason: 'accessor-property' },
        'Accessor properties cannot be operation targets.',
        parsedOperation.path,
      ),
    ]);
  }

  const present = descriptor !== undefined;
  const actual: unknown =
    descriptor !== undefined && 'value' in descriptor
      ? descriptor.value
      : undefined;
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
      cloneWithSet(
        currentValue,
        property,
        parsedOperation.value,
      ) as Readonly<TData>,
      true,
    );
  }

  return success(
    cloneWithRemove(currentValue, property) as Readonly<TData>,
    true,
  );
}

function validateTarget(value: unknown): Diagnostic | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return runtimeDiagnostic(
      'INVALID_OPERATION_TARGET',
      { actualType: actualType(value) },
      'Operation target must be an ordinary object.',
    );
  }
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return runtimeDiagnostic(
      'INVALID_OPERATION_TARGET',
      { actualType: 'object' },
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
): readonly [string] | undefined {
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
  if (entry.value.length > 1) {
    diagnostics.push(
      pathDiagnostic('deep-path-not-supported', entry.value.length),
    );
    return undefined;
  }
  const segment = member(entry.value, '0');
  if (segment.kind !== 'value' || typeof segment.value !== 'string') {
    diagnostics.push(
      pathDiagnostic(
        'non-string-segment',
        1,
        segment.kind === 'value' ? segment.value : undefined,
      ),
    );
    return undefined;
  }
  return [segment.value];
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
  dataPath: readonly [string],
): {
  readonly fields?: ReadonlyMap<string, ManagedField>;
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
    if (
      pathMember.kind !== 'value' ||
      !Array.isArray(pathMember.value) ||
      pathMember.value.length !== 1
    ) {
      diagnostics.push(formDiagnostic('invalid-field-path', dataPath, index));
      continue;
    }
    const segment = member(pathMember.value, '0');
    if (segment.kind !== 'value' || typeof segment.value !== 'string') {
      diagnostics.push(formDiagnostic('invalid-field-path', dataPath, index));
      continue;
    }
    if (fields.has(segment.value)) {
      diagnostics.push(
        formDiagnostic('duplicate-field-path', dataPath, index, [
          segment.value,
        ]),
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
    fields.set(segment.value, { name: segment.value, type: fieldType });
  }
  return diagnostics.length > 0 ? { diagnostics } : { fields, diagnostics };
}

function validateCompatibleValue(
  field: ManagedField,
  value: unknown,
  dataPath: readonly [string],
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
  dataPath: readonly [string],
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

function cloneWithSet<TData extends object>(
  value: Readonly<TData>,
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

function cloneWithRemove<TData extends object>(
  value: Readonly<TData>,
  property: string,
): object {
  return cloneWithout(value, property);
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
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_OPERATION_PATH',
    {
      reason,
      pathLength,
      ...(reason === 'non-string-segment' ? { segmentIndex: 0 } : {}),
      ...(value === undefined ? {} : describeActualValue(value)),
    },
    'Operation path is outside the supported root-property scope.',
  );
}

function formDiagnostic(
  reason: string,
  dataPath: readonly [string],
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
    'Form definition is invalid for operation application.',
    dataPath,
  );
}

function runtimeDiagnostic(
  code: string,
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
  dataPath?: readonly [string],
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
