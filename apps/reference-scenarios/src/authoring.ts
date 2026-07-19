import type {
  ReferenceCatalogAuthoringReason,
  ReferenceCatalogPath,
  ReferenceExplanation,
  ReferenceFeature,
  ReferenceInitialState,
  ReferenceScenario,
  ReferenceScenarioAuthoring,
  ReferenceTransitionExpectation,
  ReferenceValidatorFunction,
} from './contracts.js';

const FEATURES: ReadonlySet<ReferenceFeature> = new Set([
  'controlled-state',
  'primitive-fields',
  'string-enum',
  'explicit-clear',
  'validation',
  'locale',
  'nested-objects',
  'object-collections',
  'local-references',
  'presentation-groups',
  'advanced-layout',
  'nullable-leaves',
]);

const SCENARIO_MEMBERS = Object.freeze([
  'id',
  'title',
  'summary',
  'features',
  'compileInput',
  'initialState',
  'validator',
  'transitions',
  'explanation',
]);

const IDENTIFIER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export class ReferenceCatalogAuthoringError extends Error {
  readonly reason: ReferenceCatalogAuthoringReason;
  readonly scenarioId: string | undefined;
  readonly path: ReferenceCatalogPath;

  constructor(
    reason: ReferenceCatalogAuthoringReason,
    path: ReferenceCatalogPath,
    scenarioId?: string,
  ) {
    super(
      `Reference catalog authoring failed at ${formatPath(path)}: ${reason}`,
    );
    this.name = 'ReferenceCatalogAuthoringError';
    this.reason = reason;
    this.scenarioId = scenarioId;
    this.path = Object.freeze([...path]);
    Object.freeze(this);
  }
}

interface CopyTask {
  readonly kind: 'copy';
  readonly value: unknown;
  readonly path: ReferenceCatalogPath;
  readonly assign: (value: unknown) => void;
  readonly scenarioId: string | undefined;
}

interface FinalizeTask {
  readonly kind: 'finalize';
  readonly source: object;
  readonly target: object;
}

type Task = CopyTask | FinalizeTask;

interface InspectedContainer {
  readonly entries: readonly (readonly [string, unknown])[];
  readonly target: unknown[] | Record<string, unknown>;
}

export function defineReferenceCatalog(
  authoring: readonly ReferenceScenarioAuthoring[],
): readonly ReferenceScenario[] {
  const inspected = inspectCatalog(authoring);
  const scenarios: ReferenceScenario[] = [];
  const scenarioIds = new Set<string>();

  for (let index = 0; index < inspected.length; index += 1) {
    const entry = inspected[index];
    if (entry === undefined) fail('inspection-failed', [index]);
    const raw = entry[1];
    const scenario = defineScenario(raw, index);
    if (scenarioIds.has(scenario.id)) {
      fail('duplicate-id', [index, 'id'], scenario.id);
    }
    scenarioIds.add(scenario.id);
    scenarios.push(scenario);
  }

  return Object.freeze(scenarios);
}

function defineScenario(value: unknown, index: number): ReferenceScenario {
  const basePath: ReferenceCatalogPath = [index];
  assertPlainRecord(value, basePath);
  assertExactMembers(value, SCENARIO_MEMBERS, basePath);

  const rawId = readRequired(value, 'id', basePath);
  const id = requireIdentifier(rawId, [...basePath, 'id']);
  const title = requireNonBlank(
    readRequired(value, 'title', basePath, id),
    [...basePath, 'title'],
    id,
  );
  const summary = requireNonBlank(
    readRequired(value, 'summary', basePath, id),
    [...basePath, 'summary'],
    id,
  );
  const features = defineFeatures(
    readRequired(value, 'features', basePath, id),
    [...basePath, 'features'],
    id,
  );
  const compileInput = copyCompileInput(
    readRequired(value, 'compileInput', basePath, id),
    [...basePath, 'compileInput'],
    id,
  );
  const initialState = defineInitialState(
    readRequired(value, 'initialState', basePath, id),
    [...basePath, 'initialState'],
    id,
  );
  const validator = defineValidator(
    readRequired(value, 'validator', basePath, id),
    [...basePath, 'validator'],
    id,
  );
  const transitions = defineTransitions(
    readRequired(value, 'transitions', basePath, id),
    [...basePath, 'transitions'],
    id,
  );
  const explanation = defineExplanation(
    readRequired(value, 'explanation', basePath, id),
    [...basePath, 'explanation'],
    id,
  );

  return Object.freeze({
    id,
    title,
    summary,
    features,
    compileInput,
    initialState,
    validator,
    transitions,
    explanation,
  });
}

function defineFeatures(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): readonly ReferenceFeature[] {
  const copy = copyJsonCompatible(value, path, scenarioId);
  if (!isUnknownArray(copy) || copy.length === 0) {
    fail('invalid-member', path, scenarioId);
  }
  const seen = new Set<string>();
  for (let index = 0; index < copy.length; index += 1) {
    const feature = copy[index];
    if (
      typeof feature !== 'string' ||
      !FEATURES.has(feature as ReferenceFeature)
    ) {
      fail('invalid-member', [...path, index], scenarioId);
    }
    if (seen.has(feature)) fail('duplicate-id', [...path, index], scenarioId);
    seen.add(feature);
  }
  return copy as readonly ReferenceFeature[];
}

function copyCompileInput(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): ReferenceScenario['compileInput'] {
  const copy = copyJsonCompatible(value, path, scenarioId);
  assertPlainRecord(copy, path, scenarioId);
  assertAllowedMembers(
    copy,
    ['schema', 'uiSchema', 'collectionPolicies'],
    path,
    scenarioId,
  );
  readRequired(copy, 'schema', path, scenarioId);
  return copy as unknown as ReferenceScenario['compileInput'];
}

function defineInitialState(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): ReferenceInitialState<object> {
  assertPlainRecord(value, path, scenarioId);
  assertExactMembers(
    value,
    ['value', 'baselineValue', 'locale', 'validationVisibility'],
    path,
    scenarioId,
  );
  const controlledValue = copyJsonCompatible(
    readRequired(value, 'value', path, scenarioId),
    [...path, 'value'],
    scenarioId,
  );
  const baselineValue = copyJsonCompatible(
    readRequired(value, 'baselineValue', path, scenarioId),
    [...path, 'baselineValue'],
    scenarioId,
  );
  assertPlainRecord(controlledValue, [...path, 'value'], scenarioId);
  assertPlainRecord(baselineValue, [...path, 'baselineValue'], scenarioId);
  const locale = requireNonBlank(
    readRequired(value, 'locale', path, scenarioId),
    [...path, 'locale'],
    scenarioId,
  );
  const visibility = readRequired(
    value,
    'validationVisibility',
    path,
    scenarioId,
  );
  if (visibility !== 'touched' && visibility !== 'all') {
    fail('invalid-member', [...path, 'validationVisibility'], scenarioId);
  }
  return Object.freeze({
    value: controlledValue,
    baselineValue,
    locale,
    validationVisibility: visibility,
  });
}

function defineValidator(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): ReferenceScenario['validator'] {
  assertPlainRecord(value, path, scenarioId);
  assertExactMembers(value, ['validate'], path, scenarioId);
  const validate = readRequired(value, 'validate', path, scenarioId);
  if (typeof validate !== 'function') {
    fail('invalid-member', [...path, 'validate'], scenarioId);
  }
  const validateFunction = validate as ReferenceValidatorFunction;
  return Object.freeze({
    validate(schema: unknown, controlledValue: unknown) {
      return Reflect.apply(validateFunction, undefined, [
        schema,
        controlledValue,
      ]);
    },
  });
}

function defineTransitions(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): readonly ReferenceTransitionExpectation<object>[] {
  const copy = copyJsonCompatible(value, path, scenarioId);
  if (!isUnknownArray(copy)) fail('invalid-container', path, scenarioId);
  if (copy.length === 0) fail('invalid-member', path, scenarioId);
  const ids = new Set<string>();
  for (let index = 0; index < copy.length; index += 1) {
    const entryPath = [...path, index];
    const entry = copy[index];
    assertPlainRecord(entry, entryPath, scenarioId);
    assertAllowedMembers(
      entry,
      ['id', 'action', 'decision', 'operation', 'expected'],
      entryPath,
      scenarioId,
    );
    const id = requireIdentifier(
      readRequired(entry, 'id', entryPath, scenarioId),
      [...entryPath, 'id'],
      scenarioId,
    );
    if (ids.has(id)) fail('duplicate-id', [...entryPath, 'id'], scenarioId);
    ids.add(id);
    requireNonBlank(
      readRequired(entry, 'action', entryPath, scenarioId),
      [...entryPath, 'action'],
      scenarioId,
    );
    const decision = readRequired(entry, 'decision', entryPath, scenarioId);
    if (
      decision !== 'confirm' &&
      decision !== 'reject' &&
      decision !== 'external-update'
    ) {
      fail('invalid-member', [...entryPath, 'decision'], scenarioId);
    }
    const expected = readRequired(entry, 'expected', entryPath, scenarioId);
    assertPlainRecord(expected, [...entryPath, 'expected'], scenarioId);
    assertAllowedMembers(
      expected,
      ['value', 'baselineValue', 'dirty', 'valid', 'issues'],
      [...entryPath, 'expected'],
      scenarioId,
    );
    validateTransitionExpected(
      expected,
      [...entryPath, 'expected'],
      scenarioId,
    );
    const operation = readOptional(entry, 'operation', entryPath, scenarioId);
    if (operation.present) {
      validateExpectedOperation(
        operation.value,
        [...entryPath, 'operation'],
        scenarioId,
      );
    }
  }
  return copy as unknown as readonly ReferenceTransitionExpectation<object>[];
}

function defineExplanation(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): readonly ReferenceExplanation[] {
  const copy = copyJsonCompatible(value, path, scenarioId);
  if (!isUnknownArray(copy)) fail('invalid-container', path, scenarioId);
  if (copy.length === 0) fail('invalid-member', path, scenarioId);
  const ids = new Set<string>();
  for (let index = 0; index < copy.length; index += 1) {
    const entryPath = [...path, index];
    const entry = copy[index];
    assertPlainRecord(entry, entryPath, scenarioId);
    assertExactMembers(entry, ['id', 'title', 'body'], entryPath, scenarioId);
    const id = requireIdentifier(
      readRequired(entry, 'id', entryPath, scenarioId),
      [...entryPath, 'id'],
      scenarioId,
    );
    if (ids.has(id)) fail('duplicate-id', [...entryPath, 'id'], scenarioId);
    ids.add(id);
    requireNonBlank(
      readRequired(entry, 'title', entryPath, scenarioId),
      [...entryPath, 'title'],
      scenarioId,
    );
    requireNonBlank(
      readRequired(entry, 'body', entryPath, scenarioId),
      [...entryPath, 'body'],
      scenarioId,
    );
  }
  return copy as unknown as readonly ReferenceExplanation[];
}

function validateTransitionExpected(
  expected: Record<string, unknown>,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  for (const member of ['value', 'baselineValue'] as const) {
    const result = readOptional(expected, member, path, scenarioId);
    if (result.present) {
      assertPlainRecord(result.value, [...path, member], scenarioId);
    }
  }
  for (const member of ['dirty', 'valid'] as const) {
    const result = readOptional(expected, member, path, scenarioId);
    if (result.present && typeof result.value !== 'boolean') {
      fail('invalid-member', [...path, member], scenarioId);
    }
  }
  const issues = readOptional(expected, 'issues', path, scenarioId);
  if (!issues.present) return;
  assertArrayContainer(issues.value, [...path, 'issues'], scenarioId);
  for (let index = 0; index < issues.value.length; index += 1) {
    const issuePath = [...path, 'issues', index];
    const issue = readArrayIndex(
      issues.value,
      index,
      [...path, 'issues'],
      scenarioId,
    );
    assertPlainRecord(issue, issuePath, scenarioId);
    assertAllowedMembers(
      issue,
      ['code', 'path', 'keyword'],
      issuePath,
      scenarioId,
    );
    requireNonBlank(
      readRequired(issue, 'code', issuePath, scenarioId),
      [...issuePath, 'code'],
      scenarioId,
    );
    validatePath(
      readRequired(issue, 'path', issuePath, scenarioId),
      [...issuePath, 'path'],
      scenarioId,
    );
    const keyword = readOptional(issue, 'keyword', issuePath, scenarioId);
    if (keyword.present && typeof keyword.value !== 'string') {
      fail('invalid-member', [...issuePath, 'keyword'], scenarioId);
    }
  }
}

function validateExpectedOperation(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  assertPlainRecord(value, path, scenarioId);
  const type = readRequired(value, 'type', path, scenarioId);
  if (typeof type !== 'string')
    fail('invalid-member', [...path, 'type'], scenarioId);
  if (Reflect.has(value, 'metadata') || Reflect.has(value, 'source')) {
    fail('extra-member', path, scenarioId);
  }
  switch (type) {
    case 'set-value':
      assertExactMembers(
        value,
        ['type', 'path', 'expected', 'value'],
        path,
        scenarioId,
      );
      validatePath(
        readRequired(value, 'path', path, scenarioId),
        [...path, 'path'],
        scenarioId,
      );
      validateOperationExpectation(
        readRequired(value, 'expected', path, scenarioId),
        [...path, 'expected'],
        scenarioId,
      );
      return;
    case 'remove-value':
      assertExactMembers(value, ['type', 'path', 'expected'], path, scenarioId);
      validatePath(
        readRequired(value, 'path', path, scenarioId),
        [...path, 'path'],
        scenarioId,
      );
      validateValueExpectation(
        readRequired(value, 'expected', path, scenarioId),
        [...path, 'expected'],
        scenarioId,
      );
      return;
    case 'set-item-value':
    case 'remove-item-value':
      assertExactMembers(
        value,
        type === 'set-item-value'
          ? ['type', 'target', 'identityProperty', 'expected', 'value']
          : ['type', 'target', 'identityProperty', 'expected'],
        path,
        scenarioId,
      );
      validateTarget(
        readRequired(value, 'target', path, scenarioId),
        [...path, 'target'],
        scenarioId,
      );
      requireNonBlank(
        readRequired(value, 'identityProperty', path, scenarioId),
        [...path, 'identityProperty'],
        scenarioId,
      );
      if (type === 'remove-item-value') {
        validateValueExpectation(
          readRequired(value, 'expected', path, scenarioId),
          [...path, 'expected'],
          scenarioId,
        );
      } else {
        validateOperationExpectation(
          readRequired(value, 'expected', path, scenarioId),
          [...path, 'expected'],
          scenarioId,
        );
      }
      return;
    case 'insert-item':
      assertExactMembers(
        value,
        [
          'type',
          'collectionPath',
          'identityProperty',
          'itemId',
          'item',
          'placement',
        ],
        path,
        scenarioId,
      );
      validateCollectionMembers(value, path, scenarioId);
      validatePlacement(
        readRequired(value, 'placement', path, scenarioId),
        [...path, 'placement'],
        scenarioId,
      );
      return;
    case 'remove-item':
      assertExactMembers(
        value,
        ['type', 'collectionPath', 'identityProperty', 'itemId'],
        path,
        scenarioId,
      );
      validateCollectionMembers(value, path, scenarioId);
      return;
    case 'move-item':
      assertExactMembers(
        value,
        ['type', 'collectionPath', 'identityProperty', 'itemId', 'placement'],
        path,
        scenarioId,
      );
      validateCollectionMembers(value, path, scenarioId);
      validatePlacement(
        readRequired(value, 'placement', path, scenarioId),
        [...path, 'placement'],
        scenarioId,
      );
      return;
    default:
      fail('invalid-member', [...path, 'type'], scenarioId);
  }
}

function validateCollectionMembers(
  value: Record<string, unknown>,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  validateStringPath(
    readRequired(value, 'collectionPath', path, scenarioId),
    [...path, 'collectionPath'],
    scenarioId,
  );
  for (const member of ['identityProperty', 'itemId'] as const) {
    requireNonBlank(
      readRequired(value, member, path, scenarioId),
      [...path, member],
      scenarioId,
    );
  }
}

function validateTarget(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  assertPlainRecord(value, path, scenarioId);
  assertExactMembers(
    value,
    ['collectionPath', 'itemId', 'relativePath'],
    path,
    scenarioId,
  );
  validateStringPath(
    readRequired(value, 'collectionPath', path, scenarioId),
    [...path, 'collectionPath'],
    scenarioId,
  );
  requireNonBlank(
    readRequired(value, 'itemId', path, scenarioId),
    [...path, 'itemId'],
    scenarioId,
  );
  validateStringPath(
    readRequired(value, 'relativePath', path, scenarioId),
    [...path, 'relativePath'],
    scenarioId,
  );
}

function validateOperationExpectation(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  assertPlainRecord(value, path, scenarioId);
  const kind = readRequired(value, 'kind', path, scenarioId);
  if (kind === 'missing') {
    assertExactMembers(value, ['kind'], path, scenarioId);
    return;
  }
  validateValueExpectation(value, path, scenarioId);
}

function validateValueExpectation(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  assertPlainRecord(value, path, scenarioId);
  assertExactMembers(value, ['kind', 'value'], path, scenarioId);
  if (readRequired(value, 'kind', path, scenarioId) !== 'value') {
    fail('invalid-member', [...path, 'kind'], scenarioId);
  }
}

function validatePlacement(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  assertPlainRecord(value, path, scenarioId);
  const kind = readRequired(value, 'kind', path, scenarioId);
  if (kind === 'start' || kind === 'end') {
    assertExactMembers(value, ['kind'], path, scenarioId);
    return;
  }
  if (kind === 'before' || kind === 'after') {
    assertExactMembers(value, ['kind', 'itemId'], path, scenarioId);
    requireNonBlank(
      readRequired(value, 'itemId', path, scenarioId),
      [...path, 'itemId'],
      scenarioId,
    );
    return;
  }
  fail('invalid-member', [...path, 'kind'], scenarioId);
}

function validatePath(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  assertArrayContainer(value, path, scenarioId);
  for (let index = 0; index < value.length; index += 1) {
    const segment = readArrayIndex(value, index, path, scenarioId);
    if (typeof segment !== 'string' && typeof segment !== 'number') {
      fail('invalid-member', [...path, index], scenarioId);
    }
  }
}

function validateStringPath(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId: string,
): void {
  assertArrayContainer(value, path, scenarioId);
  for (let index = 0; index < value.length; index += 1) {
    if (typeof readArrayIndex(value, index, path, scenarioId) !== 'string') {
      fail('invalid-member', [...path, index], scenarioId);
    }
  }
}

function copyJsonCompatible(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): unknown {
  let result: unknown;
  const active = new WeakSet<object>();
  const tasks: Task[] = [
    {
      kind: 'copy',
      value,
      path,
      scenarioId,
      assign: (copy) => {
        result = copy;
      },
    },
  ];

  while (tasks.length > 0) {
    const task = tasks.pop();
    if (task === undefined) break;
    if (task.kind === 'finalize') {
      active.delete(task.source);
      Object.freeze(task.target);
      continue;
    }

    const primitive = copyPrimitive(task.value, task.path, task.scenarioId);
    if (primitive.matched) {
      task.assign(primitive.value);
      continue;
    }

    const source = task.value as object;
    if (active.has(source)) fail('cyclic-value', task.path, task.scenarioId);
    const inspected = inspectContainer(source, task.path, task.scenarioId);
    active.add(source);
    task.assign(inspected.target);
    tasks.push({ kind: 'finalize', source, target: inspected.target });

    for (let index = inspected.entries.length - 1; index >= 0; index -= 1) {
      const entry = inspected.entries[index];
      if (entry === undefined) continue;
      const [key, child] = entry;
      const childPath = [
        ...task.path,
        Array.isArray(inspected.target) ? Number(key) : key,
      ];
      tasks.push({
        kind: 'copy',
        value: child,
        path: childPath,
        scenarioId: task.scenarioId,
        assign: (copy) => {
          Object.defineProperty(inspected.target, key, {
            configurable: true,
            enumerable: true,
            value: copy,
            writable: true,
          });
        },
      });
    }
  }

  return result;
}

function copyPrimitive(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): { readonly matched: boolean; readonly value?: unknown } {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return { matched: true, value };
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('non-json-value', path, scenarioId);
    return { matched: true, value };
  }
  if (typeof value !== 'object') fail('non-json-value', path, scenarioId);
  return { matched: false };
}

function inspectContainer(
  value: object,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): InspectedContainer {
  try {
    const prototype = Reflect.getPrototypeOf(value);
    if (Array.isArray(value)) {
      if (prototype !== Array.prototype)
        fail('invalid-container', path, scenarioId);
      return inspectArray(value, path, scenarioId);
    }
    if (prototype !== Object.prototype && prototype !== null) {
      fail('invalid-container', path, scenarioId);
    }
    const entries: [string, unknown][] = [];
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key === 'symbol') fail('symbol-member', path, scenarioId);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor === undefined)
        fail('inspection-failed', [...path, key], scenarioId);
      if (!('value' in descriptor))
        fail('accessor-member', [...path, key], scenarioId);
      if (!descriptor.enumerable)
        fail('invalid-member', [...path, key], scenarioId);
      entries.push([key, descriptor.value]);
    }
    return { entries, target: {} };
  } catch (error) {
    if (error instanceof ReferenceCatalogAuthoringError) throw error;
    fail('inspection-failed', path, scenarioId);
  }
}

function inspectArray(
  value: readonly unknown[],
  path: ReferenceCatalogPath,
  scenarioId?: string,
): InspectedContainer {
  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, 'length');
  if (
    lengthDescriptor === undefined ||
    !('value' in lengthDescriptor) ||
    !Number.isSafeInteger(lengthDescriptor.value) ||
    lengthDescriptor.value < 0
  ) {
    fail('invalid-member', [...path, 'length'], scenarioId);
  }
  const length = lengthDescriptor.value as number;
  const entries: [string, unknown][] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor === undefined)
      fail('sparse-array', [...path, index], scenarioId);
    if (!('value' in descriptor))
      fail('accessor-member', [...path, index], scenarioId);
    if (!descriptor.enumerable)
      fail('invalid-member', [...path, index], scenarioId);
    entries.push([String(index), descriptor.value]);
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key === 'symbol') fail('symbol-member', path, scenarioId);
    if (key === 'length') continue;
    const index = Number(key);
    if (
      !Number.isSafeInteger(index) ||
      index < 0 ||
      index >= length ||
      String(index) !== key
    ) {
      fail('extra-member', [...path, key], scenarioId);
    }
  }
  return { entries, target: [] };
}

function assertArrayContainer(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): asserts value is readonly unknown[] {
  try {
    if (
      !Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Array.prototype
    ) {
      fail('invalid-container', path, scenarioId);
    }
  } catch (error) {
    if (error instanceof ReferenceCatalogAuthoringError) throw error;
    fail('inspection-failed', path, scenarioId);
  }
}

function inspectCatalog(
  value: unknown,
): readonly (readonly [string, unknown])[] {
  if (typeof value !== 'object' || value === null) {
    fail('invalid-container', []);
  }
  const inspected = inspectContainer(value, []);
  if (!Array.isArray(inspected.target)) fail('invalid-container', []);
  return inspected.entries;
}

function readArrayIndex(
  value: readonly unknown[],
  index: number,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): unknown {
  const descriptor = safeDescriptor(
    value,
    String(index),
    [...path, index],
    scenarioId,
  );
  if (descriptor === undefined)
    fail('sparse-array', [...path, index], scenarioId);
  if (!('value' in descriptor)) {
    fail('accessor-member', [...path, index], scenarioId);
  }
  return descriptor.value;
}

function assertPlainRecord(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail('invalid-container', path, scenarioId);
  }
  try {
    const prototype = Reflect.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      fail('inherited-member', path, scenarioId);
    }
  } catch (error) {
    if (error instanceof ReferenceCatalogAuthoringError) throw error;
    fail('inspection-failed', path, scenarioId);
  }
}

function assertExactMembers(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: ReferenceCatalogPath,
  scenarioId?: string,
): void {
  assertAllowedMembers(value, allowed, path, scenarioId);
  for (const member of allowed) readRequired(value, member, path, scenarioId);
}

function assertAllowedMembers(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: ReferenceCatalogPath,
  scenarioId?: string,
): void {
  let keys: readonly PropertyKey[];
  try {
    keys = Reflect.ownKeys(value);
  } catch {
    fail('inspection-failed', path, scenarioId);
  }
  const allowedSet = new Set(allowed);
  for (const key of keys) {
    if (typeof key !== 'string') fail('symbol-member', path, scenarioId);
    if (!allowedSet.has(key)) fail('extra-member', [...path, key], scenarioId);
  }
}

function readRequired(
  value: Record<string, unknown>,
  member: string,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): unknown {
  const descriptor = safeDescriptor(
    value,
    member,
    [...path, member],
    scenarioId,
  );
  if (descriptor === undefined)
    fail('missing-member', [...path, member], scenarioId);
  if (!('value' in descriptor))
    fail('accessor-member', [...path, member], scenarioId);
  if (!descriptor.enumerable)
    fail('invalid-member', [...path, member], scenarioId);
  return descriptor.value;
}

function readOptional(
  value: Record<string, unknown>,
  member: string,
  path: ReferenceCatalogPath,
  scenarioId?: string,
):
  | { readonly present: false }
  | { readonly present: true; readonly value: unknown } {
  const descriptor = safeDescriptor(
    value,
    member,
    [...path, member],
    scenarioId,
  );
  if (descriptor === undefined) return { present: false };
  if (!('value' in descriptor))
    fail('accessor-member', [...path, member], scenarioId);
  if (!descriptor.enumerable)
    fail('invalid-member', [...path, member], scenarioId);
  return { present: true, value: descriptor.value };
}

function safeDescriptor(
  value: object,
  member: string,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): PropertyDescriptor | undefined {
  try {
    return Object.getOwnPropertyDescriptor(value, member);
  } catch {
    fail('inspection-failed', path, scenarioId);
  }
}

function requireIdentifier(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): string {
  if (typeof value !== 'string' || !IDENTIFIER.test(value)) {
    fail('invalid-id', path, scenarioId);
  }
  return value;
}

function requireNonBlank(
  value: unknown,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail('invalid-member', path, scenarioId);
  }
  return value;
}

function fail(
  reason: ReferenceCatalogAuthoringReason,
  path: ReferenceCatalogPath,
  scenarioId?: string,
): never {
  throw new ReferenceCatalogAuthoringError(reason, path, scenarioId);
}

function formatPath(path: ReferenceCatalogPath): string {
  return path.length === 0 ? '<catalog>' : path.join('.');
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}
