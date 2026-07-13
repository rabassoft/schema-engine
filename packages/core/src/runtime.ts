import type {
  ControlledFormRuntimeOptions,
  CreateControlledFormRuntimeResult,
  DataPath,
  Diagnostic,
  ExternalStateUpdate,
  FieldDefinition,
  FieldRuntimeSnapshot,
  FormOperation,
  FormRuntime,
  FormRuntimeSnapshot,
  FormScope,
  OperationListener,
  RuntimeActionResult,
  SnapshotListener,
  SubscribeResult,
  ValidationIssue,
  ValidationSnapshot,
  ValidationVisibility,
} from './contracts.js';
import { diagnostic } from './internal/diagnostics.js';
import { actualType, describeActualValue } from './internal/value.js';

const EMPTY: readonly [] = Object.freeze([]);

export function createControlledFormRuntime<TData extends object>(
  options: ControlledFormRuntimeOptions<TData>,
): CreateControlledFormRuntimeResult<TData> {
  const checked = validateOptions<TData>(options);
  if (!checked.success) return checked;
  const validation = runValidator(
    checked.options.validator,
    checked.options.schema,
    checked.options.value,
    'creation',
    checked.options.definition.fields,
  );
  if (!validation.success) return failedCreation(validation.diagnostics);
  const runtime = new ControlledRuntime(checked.options, validation);
  return Object.freeze({
    success: true,
    runtime,
    diagnostics: validation.diagnostics,
  });
}

class ControlledRuntime<TData extends object> implements FormRuntime<TData> {
  private value: Readonly<TData>;
  private baseline: Readonly<TData>;
  private locale: string;
  private visibility: ValidationVisibility;
  private validationValid: boolean;
  private issues: readonly ValidationIssue[];
  private snapshot: FormRuntimeSnapshot<TData>;
  private readonly touched = new Set<string>();
  private focused: string | undefined;
  private readonly forcedScopes = new Map<string, ReadonlySet<string>>();
  private readonly snapshotListeners = new Set<SnapshotListener<TData>>();
  private readonly operationListeners = new Set<OperationListener>();
  private nextOperationId = 1;
  private disposed = false;

  constructor(
    private readonly options: ControlledFormRuntimeOptions<TData>,
    validation: ValidValidation,
  ) {
    this.value = options.value;
    this.baseline = options.baselineValue;
    this.locale = options.locale;
    this.visibility = options.validationVisibility ?? 'touched';
    this.validationValid = validation.valid;
    this.issues = validation.issues;
    this.snapshot = this.buildSnapshot();
  }

  getSnapshot(): FormRuntimeSnapshot<TData> {
    return this.snapshot;
  }

  getFieldSnapshot(path: DataPath): FieldRuntimeSnapshot | undefined {
    const name = canonicalPath(path);
    return name === undefined
      ? undefined
      : this.snapshot.fields.find((field) => field.path[0] === name);
  }

  subscribe(listener: SnapshotListener<TData>): SubscribeResult {
    return this.addListener(listener, 'snapshot');
  }

  subscribeOperations(listener: OperationListener): SubscribeResult {
    return this.addListener(listener, 'operation');
  }

  updateExternalState(update: ExternalStateUpdate<TData>): RuntimeActionResult {
    const disposed = this.disposedResult('updateExternalState');
    if (disposed) return disposed;
    if (!isRecord(update))
      return actionFailure([
        invalidExternal('update', 'non-null object', update),
      ]);
    const keys = ['value', 'baselineValue', 'locale'].filter((key) =>
      Object.hasOwn(update, key),
    );
    if (keys.length === 0)
      return actionFailure([
        invalidExternal('update', 'non-empty update', update),
      ]);
    const valueEntry = read(update, 'value');
    const baselineEntry = read(update, 'baselineValue');
    const localeEntry = read(update, 'locale');
    if (valueEntry.kind === 'accessor')
      return actionFailure([
        invalidExternal(
          'value',
          'own data property',
          undefined,
          'accessor-member',
        ),
      ]);
    if (baselineEntry.kind === 'accessor')
      return actionFailure([
        invalidExternal(
          'baselineValue',
          'own data property',
          undefined,
          'accessor-member',
        ),
      ]);
    if (localeEntry.kind === 'accessor')
      return actionFailure([
        invalidExternal(
          'locale',
          'own data property',
          undefined,
          'accessor-member',
        ),
      ]);
    const nextValue =
      valueEntry.kind === 'value' ? valueEntry.value : this.value;
    const nextBaseline =
      baselineEntry.kind === 'value' ? baselineEntry.value : this.baseline;
    const nextLocale =
      localeEntry.kind === 'value' ? localeEntry.value : this.locale;
    if (!validRoot(nextValue, this.options.definition.fields))
      return actionFailure([
        invalidExternal('value', 'ordinary root object', nextValue),
      ]);
    if (!validRoot(nextBaseline, this.options.definition.fields))
      return actionFailure([
        invalidExternal('baselineValue', 'ordinary root object', nextBaseline),
      ]);
    if (typeof nextLocale !== 'string' || nextLocale.length === 0)
      return actionFailure([
        invalidExternal('locale', 'non-empty string', nextLocale),
      ]);
    const valueChanged = nextValue !== this.value;
    const changed =
      valueChanged ||
      nextBaseline !== this.baseline ||
      nextLocale !== this.locale;
    if (!changed) return actionSuccess(false, false);
    let validation: ValidValidation = {
      success: true,
      valid: this.validationValid,
      issues: this.issues,
      diagnostics: EMPTY,
    };
    if (valueChanged) {
      const result = runValidator(
        this.options.validator,
        this.options.schema,
        nextValue,
        'update',
        this.options.definition.fields,
      );
      if (!result.success) return actionFailure(result.diagnostics);
      validation = result;
    }
    this.value = nextValue as Readonly<TData>;
    this.baseline = nextBaseline as Readonly<TData>;
    this.locale = nextLocale;
    this.validationValid = validation.valid;
    this.issues = validation.issues;
    this.snapshot = this.buildSnapshot(this.snapshot);
    return actionSuccess(true, false, [
      ...validation.diagnostics,
      ...this.notifySnapshots(),
    ]);
  }

  requestSetValue(path: DataPath, value: unknown): RuntimeActionResult {
    return this.request(path, 'set-value', value);
  }

  requestRemoveValue(path: DataPath): RuntimeActionResult {
    return this.request(path, 'remove-value');
  }

  focus(path: DataPath): RuntimeActionResult {
    return this.interact('focus', path);
  }

  blur(path: DataPath): RuntimeActionResult {
    return this.interact('blur', path);
  }

  resetTouched(scope?: FormScope): RuntimeActionResult {
    const disposed = this.disposedResult('resetTouched');
    if (disposed) return disposed;
    const parsed =
      scope === undefined ? undefined : parseScope(scope, this.fieldNames());
    if (parsed && !parsed.success) return actionFailure(parsed.diagnostics);
    const names = parsed?.names ?? this.fieldNames();
    let changed = false;
    for (const name of names) changed = this.touched.delete(name) || changed;
    return this.commitInteraction(changed, parsed?.diagnostics ?? EMPTY);
  }

  setValidationVisibility(
    visibility: ValidationVisibility,
  ): RuntimeActionResult {
    const disposed = this.disposedResult('setValidationVisibility');
    if (disposed) return disposed;
    if (visibility !== 'touched' && visibility !== 'all') {
      return actionFailure([
        runtimeDiagnostic(
          'INVALID_VALIDATION_VISIBILITY',
          describeActualValue(visibility),
          'Validation visibility must be touched or all.',
        ),
      ]);
    }
    if (visibility === this.visibility) return actionSuccess(false, false);
    this.visibility = visibility;
    return this.commitInteraction(true);
  }

  getValidationSnapshot(scope?: FormScope): ValidationSnapshot {
    if (scope === undefined) {
      return Object.freeze({
        valid: this.validationValid,
        issues: this.issues,
        diagnostics: EMPTY,
      });
    }
    const parsed = parseScope(scope, this.fieldNames());
    if (!parsed.success)
      return Object.freeze({
        valid: false,
        issues: EMPTY,
        diagnostics: parsed.diagnostics,
      });
    const issues = this.issues.filter(
      (issue) =>
        (issue.path.length === 0 && parsed.includeGlobal) ||
        (issue.path.length === 1 &&
          typeof issue.path[0] === 'string' &&
          parsed.names.has(issue.path[0])),
    );
    return Object.freeze({
      valid: issues.length === 0,
      issues: Object.freeze(issues),
      diagnostics: parsed.diagnostics,
    });
  }

  showValidationErrors(scope: FormScope): RuntimeActionResult {
    const disposed = this.disposedResult('showValidationErrors');
    if (disposed) return disposed;
    const parsed = parseScope(scope, this.fieldNames());
    if (!parsed.success) return actionFailure(parsed.diagnostics);
    const previous = this.forcedScopes.get(parsed.id);
    const changed = previous === undefined || !sameSet(previous, parsed.names);
    if (changed) this.forcedScopes.set(parsed.id, parsed.names);
    return this.commitInteraction(changed, parsed.diagnostics);
  }

  hideValidationErrors(scopeId: string): RuntimeActionResult {
    const disposed = this.disposedResult('hideValidationErrors');
    if (disposed) return disposed;
    if (typeof scopeId !== 'string' || scopeId.length === 0)
      return actionFailure([
        runtimeDiagnostic(
          'INVALID_SCOPE',
          {
            member: 'id',
            expected: 'non-empty string',
            reason: 'invalid-value',
          },
          'Scope id is invalid.',
        ),
      ]);
    return this.commitInteraction(this.forcedScopes.delete(scopeId));
  }

  dispose(): RuntimeActionResult {
    if (this.disposed) return actionSuccess(false, false);
    this.disposed = true;
    this.snapshotListeners.clear();
    this.operationListeners.clear();
    this.forcedScopes.clear();
    return actionSuccess(false, false);
  }

  private addListener(
    listener: unknown,
    channel: 'snapshot' | 'operation',
  ): SubscribeResult {
    if (this.disposed)
      return Object.freeze({
        success: false,
        diagnostics: freezeDiagnostics([
          runtimeDiagnostic(
            'RUNTIME_DISPOSED',
            {
              action:
                channel === 'snapshot' ? 'subscribe' : 'subscribeOperations',
            },
            'Runtime is disposed.',
          ),
        ]),
      });
    if (typeof listener !== 'function')
      return Object.freeze({
        success: false,
        diagnostics: freezeDiagnostics([
          runtimeDiagnostic(
            'INVALID_LISTENER',
            { channel, ...describeActualValue(listener) },
            'Listener must be callable.',
          ),
        ]),
      });
    const listeners =
      channel === 'snapshot'
        ? (this.snapshotListeners as Set<unknown>)
        : (this.operationListeners as Set<unknown>);
    listeners.add(listener);
    let active = true;
    const unsubscribe = Object.freeze(() => {
      if (active) {
        active = false;
        listeners.delete(listener);
      }
    });
    return Object.freeze({ success: true, unsubscribe, diagnostics: EMPTY });
  }

  private request(
    path: DataPath,
    type: 'set-value' | 'remove-value',
    nextValue?: unknown,
  ): RuntimeActionResult {
    const disposed = this.disposedResult(
      type === 'set-value' ? 'requestSetValue' : 'requestRemoveValue',
    );
    if (disposed) return disposed;
    const name = canonicalPath(path);
    if (name === undefined)
      return actionFailure([
        runtimeDiagnostic(
          'UNKNOWN_RUNTIME_PATH',
          { path: copyPath(path) },
          'Runtime path is not managed.',
        ),
      ]);
    const field = this.options.definition.fields.find(
      (candidate) => candidate.path[0] === name,
    );
    if (field === undefined)
      return actionFailure([
        runtimeDiagnostic(
          'UNKNOWN_RUNTIME_PATH',
          { path: copyPath(path) },
          'Runtime path is not managed.',
        ),
      ]);
    if (type === 'set-value' && !compatible(field, nextValue))
      return actionFailure([
        runtimeDiagnostic(
          'INCOMPATIBLE_OPERATION_VALUE',
          {
            field: name,
            fieldType: fieldType(field),
            ...describeActualValue(nextValue),
          },
          'Operation value is incompatible with the field.',
          [name],
        ),
      ]);
    const descriptor = Object.getOwnPropertyDescriptor(this.value, name);
    if (descriptor !== undefined && !('value' in descriptor))
      return actionFailure([
        runtimeDiagnostic(
          'UNSUPPORTED_OPERATION_PROPERTY',
          { property: name, reason: 'accessor-property' },
          'Accessor properties cannot be operation targets.',
          [name],
        ),
      ]);
    const present = descriptor !== undefined;
    const actual: unknown =
      descriptor && 'value' in descriptor ? descriptor.value : undefined;
    if (
      (type === 'set-value' && present && Object.is(actual, nextValue)) ||
      (type === 'remove-value' && !present)
    )
      return actionSuccess(false, false);
    const expectation = present
      ? Object.freeze({ kind: 'value' as const, value: actual })
      : Object.freeze({ kind: 'missing' as const });
    const operation = Object.freeze({
      type,
      metadata: Object.freeze({
        id: this.nextOperationId,
        formId: this.options.formId,
      }),
      path: Object.freeze([name]),
      expected: expectation,
      ...(type === 'set-value' ? { value: nextValue } : {}),
      source: 'user' as const,
    }) as FormOperation;
    this.nextOperationId += 1;
    return actionSuccess(false, true, this.notifyOperations(operation));
  }

  private interact(
    action: 'focus' | 'blur',
    path: DataPath,
  ): RuntimeActionResult {
    const disposed = this.disposedResult(action);
    if (disposed) return disposed;
    const name = canonicalPath(path);
    if (name === undefined || !this.fieldNames().has(name))
      return actionFailure([
        runtimeDiagnostic(
          'UNKNOWN_RUNTIME_PATH',
          { path: copyPath(path) },
          'Runtime path is not managed.',
        ),
      ]);
    let changed = false;
    if (action === 'focus') {
      if (this.focused !== name) {
        this.focused = name;
        changed = true;
      }
    } else if (this.focused === name) {
      this.focused = undefined;
      changed = !this.touched.has(name) || true;
      this.touched.add(name);
    }
    return this.commitInteraction(changed);
  }

  private commitInteraction(
    changed: boolean,
    diagnostics: readonly Diagnostic[] = EMPTY,
  ): RuntimeActionResult {
    if (!changed) return actionSuccess(false, false, diagnostics);
    this.snapshot = this.buildSnapshot(this.snapshot);
    return actionSuccess(true, false, [
      ...diagnostics,
      ...this.notifySnapshots(),
    ]);
  }

  private buildSnapshot(
    previous?: FormRuntimeSnapshot<TData>,
  ): FormRuntimeSnapshot<TData> {
    const fields = this.options.definition.fields.map((definition, index) => {
      const name = definition.path[0] as string;
      const valuePresence = presence(this.value, name);
      const baselinePresence = presence(this.baseline, name);
      const issues = Object.freeze(
        this.issues.filter(
          (issue) => issue.path.length === 1 && issue.path[0] === name,
        ),
      );
      const touched = this.touched.has(name);
      const focused = this.focused === name;
      const forced = [...this.forcedScopes.values()].some((scope) =>
        scope.has(name),
      );
      const showIssues =
        issues.length > 0 && (this.visibility === 'all' || touched || forced);
      const dirty =
        valuePresence.kind !== baselinePresence.kind ||
        (valuePresence.kind === 'value' &&
          baselinePresence.kind === 'value' &&
          !Object.is(valuePresence.value, baselinePresence.value));
      const candidate = freezeField({
        key: definition.key,
        path: [name],
        presence: valuePresence,
        dirty,
        touched,
        focused,
        valid: issues.length === 0,
        issues,
        showIssues,
      });
      const old = previous?.fields[index];
      return old !== undefined && sameField(old, candidate) ? old : candidate;
    });
    const globalIssues = Object.freeze(
      this.issues.filter((issue) => issue.path.length === 0),
    );
    return Object.freeze({
      value: this.value,
      locale: this.locale,
      valid: this.validationValid,
      dirty: fields.some((field) => field.dirty),
      validationVisibility: this.visibility,
      fields: Object.freeze(fields),
      globalIssues,
    });
  }

  private fieldNames(): ReadonlySet<string> {
    return new Set(
      this.options.definition.fields.map((field) => field.path[0] as string),
    );
  }

  private notifySnapshots(): readonly Diagnostic[] {
    return notify([...this.snapshotListeners], this.snapshot, 'snapshot');
  }
  private notifyOperations(operation: FormOperation): readonly Diagnostic[] {
    return notify([...this.operationListeners], operation, 'operation');
  }
  private disposedResult(action: string): RuntimeActionResult | undefined {
    return this.disposed
      ? actionFailure([
          runtimeDiagnostic(
            'RUNTIME_DISPOSED',
            { action },
            'Runtime is disposed.',
          ),
        ])
      : undefined;
  }
}

interface ValidOptions<TData extends object> {
  readonly success: true;
  readonly options: ControlledFormRuntimeOptions<TData>;
}
interface InvalidResult {
  readonly success: false;
  readonly diagnostics: readonly Diagnostic[];
}
interface ValidValidation {
  readonly success: true;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly diagnostics: readonly Diagnostic[];
}

function validateOptions<TData extends object>(
  value: unknown,
): ValidOptions<TData> | InvalidResult {
  if (!isRecord(value))
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption('options', 'non-null object', value),
      ]),
    };
  const required = [
    'formId',
    'definition',
    'schema',
    'value',
    'baselineValue',
    'locale',
    'validator',
  ];
  for (const key of required) {
    const entry = read(value, key);
    if (entry.kind !== 'value')
      return {
        success: false,
        diagnostics: freezeDiagnostics([
          invalidOption(
            key,
            'own data property',
            undefined,
            entry.kind === 'accessor' ? 'accessor-member' : 'missing-member',
          ),
        ]),
      };
  }
  const options = value as unknown as ControlledFormRuntimeOptions<TData>;
  if (typeof options.formId !== 'string' || options.formId.length === 0)
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption('formId', 'non-empty string', options.formId),
      ]),
    };
  if (!validDefinition(options.definition))
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption(
          'definition',
          'valid root FormDefinition',
          options.definition,
        ),
      ]),
    };
  if (!validRoot(options.value, options.definition.fields))
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption('value', 'ordinary root object', options.value),
      ]),
    };
  if (!validRoot(options.baselineValue, options.definition.fields))
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption(
          'baselineValue',
          'ordinary root object',
          options.baselineValue,
        ),
      ]),
    };
  if (typeof options.locale !== 'string' || options.locale.length === 0)
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption('locale', 'non-empty string', options.locale),
      ]),
    };
  if (
    !isRecord(options.validator) ||
    typeof read(options.validator, 'validate').value !== 'function'
  )
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption(
          'validator',
          'object with callable validate',
          options.validator,
        ),
      ]),
    };
  const visibility = read(value, 'validationVisibility');
  if (visibility.kind === 'accessor')
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption(
          'validationVisibility',
          'touched or all',
          undefined,
          'accessor-member',
        ),
      ]),
    };
  if (
    visibility.kind === 'value' &&
    visibility.value !== 'touched' &&
    visibility.value !== 'all'
  )
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidOption(
          'validationVisibility',
          'touched or all',
          visibility.value,
        ),
      ]),
    };
  return { success: true, options };
}

function runValidator(
  validator: ControlledFormRuntimeOptions<object>['validator'],
  schema: unknown,
  value: unknown,
  phase: 'creation' | 'update',
  fields: readonly FieldDefinition[],
): ValidValidation | InvalidResult {
  let raw: unknown;
  try {
    raw = validator.validate(schema, value);
  } catch {
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        runtimeDiagnostic(
          'VALIDATOR_EXCEPTION',
          { phase },
          'Validator threw an exception.',
        ),
      ]),
    };
  }
  if (!isRecord(raw)) return invalidValidation('result-not-object');
  const validEntry = read(raw, 'valid');
  if (validEntry.kind !== 'value' || typeof validEntry.value !== 'boolean')
    return invalidValidation('invalid-valid');
  const issuesEntry = read(raw, 'issues');
  if (issuesEntry.kind !== 'value' || !Array.isArray(issuesEntry.value))
    return invalidValidation('issues-not-array');
  const rawIssues: readonly unknown[] = issuesEntry.value;
  const issues: ValidationIssue[] = [];
  const diagnostics: Diagnostic[] = [];
  const names = new Set(fields.map((field) => field.path[0] as string));
  for (let index = 0; index < rawIssues.length; index += 1) {
    const issue: unknown = rawIssues[index];
    const normalized = normalizeIssue(issue, index);
    if (!normalized.success) return normalized;
    issues.push(normalized.issue);
    const path = normalized.issue.path;
    if (
      path.length !== 0 &&
      !(path.length === 1 && typeof path[0] === 'string' && names.has(path[0]))
    )
      diagnostics.push(
        runtimeDiagnostic(
          'UNKNOWN_VALIDATION_ISSUE_PATH',
          { issueIndex: index, path: copyPath(path) },
          'Validation issue path is not managed.',
          undefined,
          'warning',
        ),
      );
  }
  return {
    success: true,
    valid: validEntry.value,
    issues: Object.freeze(issues),
    diagnostics: freezeDiagnostics(diagnostics),
  };
}

function normalizeIssue(
  value: unknown,
  issueIndex: number,
): { readonly success: true; readonly issue: ValidationIssue } | InvalidResult {
  if (!isRecord(value))
    return invalidValidation('issue-not-object', issueIndex);
  const code = read(value, 'code');
  const pathEntry = read(value, 'path');
  const keyword = read(value, 'keyword');
  const parametersEntry = read(value, 'parameters');
  const fallback = read(value, 'fallbackMessage');
  if (
    code.kind !== 'value' ||
    typeof code.value !== 'string' ||
    code.value.length === 0
  )
    return invalidValidation('invalid-code', issueIndex);
  const path =
    pathEntry.kind === 'value' ? safePath(pathEntry.value) : undefined;
  if (path === undefined) return invalidValidation('invalid-path', issueIndex);
  if (
    keyword.kind === 'accessor' ||
    (keyword.kind === 'value' && typeof keyword.value !== 'string')
  )
    return invalidValidation('invalid-keyword', issueIndex);
  if (parametersEntry.kind !== 'value' || !isRecord(parametersEntry.value))
    return invalidValidation('invalid-parameters', issueIndex);
  if (
    fallback.kind === 'accessor' ||
    (fallback.kind === 'value' && typeof fallback.value !== 'string')
  )
    return invalidValidation('invalid-fallback-message', issueIndex);
  const parameters = copyParameters(parametersEntry.value);
  if (parameters === undefined)
    return invalidValidation('invalid-parameters', issueIndex);
  const issue: ValidationIssue = Object.freeze({
    code: code.value,
    path,
    parameters,
    ...(keyword.kind === 'value' ? { keyword: keyword.value as string } : {}),
    ...(fallback.kind === 'value'
      ? { fallbackMessage: fallback.value as string }
      : {}),
  });
  return { success: true, issue };
}

function validDefinition(
  value: unknown,
): value is ControlledFormRuntimeOptions<object>['definition'] {
  if (!isRecord(value)) return false;
  const fieldsEntry = read(value, 'fields');
  if (fieldsEntry.kind !== 'value' || !Array.isArray(fieldsEntry.value))
    return false;
  const fields: readonly unknown[] = fieldsEntry.value;
  const paths = new Set<string>();
  for (const field of fields) {
    if (!isRecord(field)) return false;
    const pathEntry = read(field, 'path');
    const path =
      pathEntry.kind === 'value' ? safePath(pathEntry.value) : undefined;
    const key = read(field, 'key');
    const kind = read(field, 'kind');
    if (path === undefined || path.length !== 1 || typeof path[0] !== 'string')
      return false;
    if (
      key.kind !== 'value' ||
      typeof key.value !== 'string' ||
      paths.has(path[0])
    )
      return false;
    let supported =
      kind.kind === 'value' &&
      (kind.value === 'string' || kind.value === 'boolean');
    if (kind.kind === 'value' && kind.value === 'number') {
      const numeric = read(field, 'numericType');
      supported =
        numeric.kind === 'value' &&
        (numeric.value === 'number' || numeric.value === 'integer');
    }
    if (!supported) return false;
    paths.add(path[0]);
  }
  return true;
}

function validRoot(
  value: unknown,
  fields: readonly FieldDefinition[],
): value is object {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false;
  const prototype = Reflect.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return fields.every((field) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      value,
      field.path[0] as string,
    );
    return descriptor === undefined || 'value' in descriptor;
  });
}

type Entry =
  | { readonly kind: 'missing' | 'accessor'; readonly value?: undefined }
  | { readonly kind: 'value'; readonly value: unknown };
function read(object: object, key: PropertyKey): Entry {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  return descriptor === undefined
    ? { kind: 'missing' }
    : 'value' in descriptor
      ? { kind: 'value', value: descriptor.value }
      : { kind: 'accessor' };
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function canonicalPath(path: unknown): string | undefined {
  if (!Array.isArray(path) || path.length !== 1) return undefined;
  const entry = read(path, '0');
  return entry.kind === 'value' && typeof entry.value === 'string'
    ? entry.value
    : undefined;
}
function copyPath(path: unknown): readonly unknown[] {
  if (!Array.isArray(path)) return EMPTY;
  const values: unknown[] = [];
  for (let index = 0; index < path.length; index += 1) {
    const entry = read(path, String(index));
    values.push(
      entry.kind === 'value' ? scalar(entry.value) : { type: entry.kind },
    );
  }
  return Object.freeze(values);
}
function safePath(value: unknown): readonly (string | number)[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const path: (string | number)[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const entry = read(value, String(index));
    if (
      entry.kind !== 'value' ||
      (typeof entry.value !== 'string' && typeof entry.value !== 'number')
    )
      return undefined;
    path.push(entry.value);
  }
  return Object.freeze(path);
}
function copyParameters(
  value: Record<string, unknown>,
): Readonly<Record<string, unknown>> | undefined {
  const result: Record<string, unknown> = {};
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !descriptor.enumerable) continue;
    if (!('value' in descriptor)) return undefined;
    Object.defineProperty(result, key, {
      value: descriptor.value as unknown,
      enumerable: true,
      writable: false,
      configurable: false,
    });
  }
  return Object.freeze(result);
}
function scalar(value: unknown): unknown {
  return value === null ||
    ['string', 'number', 'boolean'].includes(typeof value)
    ? value
    : { type: actualType(value) };
}
function presence(
  value: object,
  name: string,
): FieldRuntimeSnapshot['presence'] {
  const descriptor = Object.getOwnPropertyDescriptor(value, name);
  const descriptorValue: unknown =
    descriptor !== undefined && 'value' in descriptor
      ? descriptor.value
      : undefined;
  return descriptor === undefined || !('value' in descriptor)
    ? Object.freeze({ kind: 'missing' })
    : Object.freeze({ kind: 'value', value: descriptorValue });
}
function fieldType(
  field: FieldDefinition,
): 'string' | 'number' | 'integer' | 'boolean' {
  return field.kind === 'number' ? field.numericType : field.kind;
}
function compatible(field: FieldDefinition, value: unknown): boolean {
  const type = fieldType(field);
  return (
    (type === 'string' && typeof value === 'string') ||
    (type === 'boolean' && typeof value === 'boolean') ||
    (type === 'number' &&
      typeof value === 'number' &&
      Number.isFinite(value)) ||
    (type === 'integer' &&
      typeof value === 'number' &&
      Number.isFinite(value) &&
      Number.isInteger(value))
  );
}

function freezeField(field: FieldRuntimeSnapshot): FieldRuntimeSnapshot {
  Object.freeze(field.path);
  Object.freeze(field.presence);
  return Object.freeze(field);
}
function sameField(a: FieldRuntimeSnapshot, b: FieldRuntimeSnapshot): boolean {
  return (
    a.key === b.key &&
    a.presence.kind === b.presence.kind &&
    (a.presence.kind === 'missing' ||
      (b.presence.kind === 'value' &&
        Object.is(a.presence.value, b.presence.value))) &&
    a.dirty === b.dirty &&
    a.touched === b.touched &&
    a.focused === b.focused &&
    a.valid === b.valid &&
    a.showIssues === b.showIssues &&
    sameArray(a.issues, b.issues)
  );
}
function sameArray(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}
function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((value) => b.has(value));
}

type ParsedScope =
  | {
      readonly success: true;
      readonly id: string;
      readonly names: ReadonlySet<string>;
      readonly includeGlobal: boolean;
      readonly diagnostics: readonly Diagnostic[];
    }
  | InvalidResult;
function parseScope(scope: unknown, managed: ReadonlySet<string>): ParsedScope {
  if (!isRecord(scope))
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        runtimeDiagnostic(
          'INVALID_SCOPE',
          {
            member: 'scope',
            expected: 'valid FormScope',
            reason: 'invalid-value',
          },
          'Scope is invalid.',
        ),
      ]),
    };
  const id = read(scope, 'id');
  const pathsEntry = read(scope, 'paths');
  const includeGlobal = read(scope, 'includeGlobalIssues');
  if (
    id.kind !== 'value' ||
    typeof id.value !== 'string' ||
    id.value.length === 0 ||
    pathsEntry.kind !== 'value' ||
    !Array.isArray(pathsEntry.value) ||
    includeGlobal.kind === 'accessor' ||
    (includeGlobal.kind === 'value' && typeof includeGlobal.value !== 'boolean')
  )
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        runtimeDiagnostic(
          'INVALID_SCOPE',
          {
            member: 'scope',
            expected: 'valid FormScope',
            reason: 'invalid-value',
          },
          'Scope is invalid.',
        ),
      ]),
    };
  const names = new Set<string>();
  const diagnostics: Diagnostic[] = [];
  const paths: readonly unknown[] = pathsEntry.value;
  for (let index = 0; index < paths.length; index += 1) {
    const pathEntry = read(paths, String(index));
    const path = pathEntry.kind === 'value' ? pathEntry.value : undefined;
    const name = canonicalPath(path);
    if (name === undefined || !managed.has(name))
      diagnostics.push(
        runtimeDiagnostic(
          'UNKNOWN_SCOPE_PATH',
          { scopeId: id.value, path: copyPath(path) },
          'Scope path is not managed.',
          undefined,
          'warning',
        ),
      );
    else names.add(name);
  }
  return {
    success: true,
    id: id.value,
    names,
    includeGlobal:
      includeGlobal.kind === 'value' && includeGlobal.value === true,
    diagnostics: freezeDiagnostics(diagnostics),
  };
}

function notify(
  listeners: readonly ((value: never) => void)[],
  value: unknown,
  channel: 'snapshot' | 'operation',
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  listeners.forEach((listener, index) => {
    try {
      listener(value as never);
    } catch {
      diagnostics.push(
        runtimeDiagnostic(
          'LISTENER_EXCEPTION',
          { channel, listenerIndex: index },
          'Listener threw an exception.',
          undefined,
          'warning',
        ),
      );
    }
  });
  return freezeDiagnostics(diagnostics);
}
function actionSuccess(
  snapshotChanged: boolean,
  operationEmitted: boolean,
  diagnostics: readonly Diagnostic[] = EMPTY,
): RuntimeActionResult {
  return Object.freeze({
    success: true,
    effects: Object.freeze({ snapshotChanged, operationEmitted }),
    diagnostics: freezeDiagnostics(diagnostics),
  });
}
function actionFailure(
  diagnostics: readonly Diagnostic[],
): RuntimeActionResult {
  return Object.freeze({
    success: false,
    effects: Object.freeze({ snapshotChanged: false, operationEmitted: false }),
    diagnostics: freezeDiagnostics(diagnostics),
  });
}
function failedCreation(diagnostics: readonly Diagnostic[]): InvalidResult {
  return Object.freeze({
    success: false,
    diagnostics: freezeDiagnostics(diagnostics),
  });
}
function invalidOption(
  member: string,
  expected: string,
  value: unknown,
  reason = 'invalid-value',
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_RUNTIME_OPTIONS',
    {
      member,
      expected,
      reason,
      ...(reason === 'invalid-value' ? describeActualValue(value) : {}),
    },
    `Runtime option "${member}" is invalid.`,
  );
}
function invalidExternal(
  member: string,
  expected: string,
  value: unknown,
  reason = 'invalid-value',
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_EXTERNAL_STATE_UPDATE',
    {
      member,
      expected,
      reason,
      ...(reason === 'invalid-value' ? describeActualValue(value) : {}),
    },
    `External state member "${member}" is invalid.`,
  );
}
function invalidValidation(reason: string, issueIndex?: number): InvalidResult {
  return {
    success: false,
    diagnostics: freezeDiagnostics([
      runtimeDiagnostic(
        'INVALID_VALIDATOR_RESULT',
        { reason, ...(issueIndex === undefined ? {} : { issueIndex }) },
        'Validator returned an invalid result.',
      ),
    ]),
  };
}
function runtimeDiagnostic(
  code: string,
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: string,
  dataPath?: readonly string[],
  severity: 'warning' | 'error' = 'error',
): Diagnostic {
  const safe = Object.freeze({ ...parameters });
  const result = diagnostic({
    code,
    severity,
    source: 'runtime',
    ...(dataPath === undefined ? {} : { dataPath }),
    parameters: safe,
    fallbackMessage,
  });
  if (result.dataPath) Object.freeze(result.dataPath);
  Object.freeze(result.parameters);
  return Object.freeze(result);
}
function freezeDiagnostics(
  value: readonly Diagnostic[],
): readonly Diagnostic[] {
  return value.length === 0 ? EMPTY : Object.freeze([...value]);
}
