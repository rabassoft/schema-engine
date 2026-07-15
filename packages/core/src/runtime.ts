// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  CollectionItemAddress,
  CollectionNodeAddress,
  CollectionPlacement,
  ControlledFormRuntimeOptions,
  CreateControlledFormRuntimeResult,
  DataPath,
  Diagnostic,
  ExternalStateUpdate,
  FieldDefinition,
  FieldTemplate,
  FieldPresence,
  FieldRuntimeSnapshot,
  FormNodeDefinition,
  FormOperation,
  FormRuntime,
  FormRuntimeSnapshot,
  FormScope,
  ItemRuntimeSnapshot,
  OperationListener,
  NodeRuntimeSnapshot,
  ObjectFieldDefinition,
  ObjectPresence,
  ObjectRuntimeSnapshot,
  RuntimeTreeSnapshot,
  RuntimeActionResult,
  SnapshotListener,
  SubscribeResult,
  ValidationIssue,
  ValidationSnapshot,
  ValidationVisibility,
} from './contracts.js';
import { diagnostic } from './internal/diagnostics.js';
import {
  type NestedDefinitionDefect,
  validateCollectionFormDefinition,
} from './internal/nested-definition.js';
import {
  canonicalInstanceNodeKey,
  canonicalItemKey,
  copyCollectionItemAddress,
  copyCollectionNodeAddress,
} from './internal/collection-address.js';
import {
  buildCollectionSnapshotShell,
  collectionIdentityDiagnostics,
  firstManagedDataAccessor,
  inspectCollectionValue,
  inspectDefinedCollections,
} from './internal/collection-runtime.js';
import {
  canonicalDataPathKey,
  copyStringDataPath,
  isOrdinaryObject,
  readOwnDataMember,
} from './internal/path.js';
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
    checked.options.definition.nodes,
  );
  if (!validation.success) return failedCreation(validation.diagnostics);
  const runtime = new ControlledRuntime(checked.options, validation);
  return Object.freeze({
    success: true,
    runtime,
    diagnostics: freezeDiagnostics([
      ...collectionStateDiagnostics(
        checked.options.value,
        checked.options.baselineValue,
        checked.options.definition.nodes,
      ),
      ...validation.diagnostics,
    ]),
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
  private readonly nodeByKey: ReadonlyMap<string, FormNodeDefinition>;
  private readonly fieldByKey: ReadonlyMap<string, FieldDefinition>;
  private readonly descendantNodeKeys: ReadonlyMap<string, ReadonlySet<string>>;
  private readonly descendantFieldKeys: ReadonlyMap<
    string,
    ReadonlySet<string>
  >;
  private snapshotByKey = new Map<string, RuntimeTreeSnapshot>();
  private snapshotByPath = new Map<string, RuntimeTreeSnapshot>();
  private nextOperationId = 1;
  private disposed = false;

  constructor(
    private readonly options: ControlledFormRuntimeOptions<TData>,
    validation: ValidValidation,
  ) {
    const indexes = buildDefinitionIndexes(options.definition.nodes);
    this.nodeByKey = indexes.nodes;
    this.fieldByKey = indexes.fields;
    this.descendantNodeKeys = indexes.descendantNodes;
    this.descendantFieldKeys = indexes.descendantFields;
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
    const key = positionalPathKey(path);
    const snapshot =
      key === undefined ? undefined : this.snapshotByPath.get(key);
    return snapshot?.nodeKind === 'field' ? snapshot : undefined;
  }

  getNodeSnapshot(path: DataPath): RuntimeTreeSnapshot | undefined {
    const key = positionalPathKey(path);
    return key === undefined ? undefined : this.snapshotByPath.get(key);
  }

  getItemSnapshot(
    address: CollectionItemAddress,
  ): ItemRuntimeSnapshot | undefined {
    const copied = copyCollectionItemAddress(address);
    if (copied === undefined) return undefined;
    const snapshot = this.snapshotByKey.get(
      canonicalItemKey(copied.collectionPath, copied.itemId),
    );
    return snapshot?.nodeKind === 'item' ? snapshot : undefined;
  }

  getCollectionNodeSnapshot(
    address: CollectionNodeAddress,
  ): RuntimeTreeSnapshot | undefined {
    const copied = copyCollectionNodeAddress(address);
    if (copied === undefined) return undefined;
    if (copied.relativePath.length === 0) return this.getItemSnapshot(copied);
    return this.snapshotByKey.get(
      canonicalInstanceNodeKey(
        copied.collectionPath,
        copied.itemId,
        copied.relativePath,
      ),
    );
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
    const valueDiagnostic = validateManagedExternalData(
      nextValue,
      this.options.definition.nodes,
      'value',
      'update',
    );
    if (valueDiagnostic !== undefined) return actionFailure([valueDiagnostic]);
    const baselineDiagnostic = validateManagedExternalData(
      nextBaseline,
      this.options.definition.nodes,
      'baselineValue',
      'update',
    );
    if (baselineDiagnostic !== undefined)
      return actionFailure([baselineDiagnostic]);
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
        this.options.definition.nodes,
      );
      if (!result.success) return actionFailure(result.diagnostics);
      validation = result;
    }
    this.value = nextValue as Readonly<TData>;
    this.baseline = nextBaseline as Readonly<TData>;
    this.locale = nextLocale;
    this.validationValid = validation.valid;
    this.issues = validation.issues;
    if (valueChanged && this.focused !== undefined) {
      const focusedField = this.fieldByKey.get(this.focused);
      const presence =
        focusedField === undefined
          ? undefined
          : resolveFieldPresence(this.value, focusedField.path);
      if (
        presence?.kind === 'blocked' &&
        presence.reason === 'incompatible-ancestor'
      ) {
        this.focused = undefined;
      }
    }
    const previousSnapshot = this.snapshot;
    this.snapshot = this.buildSnapshot(previousSnapshot);
    let interactionChanged = false;
    if (valueChanged) {
      for (const key of [...this.touched]) {
        if (!this.snapshotByKey.has(key)) {
          this.touched.delete(key);
          interactionChanged = true;
        }
      }
      if (this.focused !== undefined && !this.snapshotByKey.has(this.focused)) {
        this.focused = undefined;
        interactionChanged = true;
      }
    }
    if (interactionChanged) {
      this.snapshot = this.buildSnapshot(previousSnapshot);
    }
    return actionSuccess(true, false, [
      ...collectionStateDiagnostics(
        nextValue as object,
        nextBaseline as object,
        this.options.definition.nodes,
      ),
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

  requestSetItemValue(
    target: CollectionNodeAddress,
    value: unknown,
  ): RuntimeActionResult {
    return this.requestCollectionLeaf('set-item-value', target, value);
  }

  requestRemoveItemValue(target: CollectionNodeAddress): RuntimeActionResult {
    return this.requestCollectionLeaf('remove-item-value', target);
  }

  requestInsertItem(
    collectionPath: readonly string[],
    itemId: string,
    item: unknown,
    placement: CollectionPlacement,
  ): RuntimeActionResult {
    return this.requestCollectionStructural(
      'insert-item',
      { collectionPath, itemId },
      placement,
      item,
    );
  }

  requestRemoveItem(address: CollectionItemAddress): RuntimeActionResult {
    return this.requestCollectionStructural('remove-item', address);
  }

  requestMoveItem(
    address: CollectionItemAddress,
    placement: CollectionPlacement,
  ): RuntimeActionResult {
    return this.requestCollectionStructural('move-item', address, placement);
  }

  focus(target: DataPath | CollectionNodeAddress): RuntimeActionResult {
    return this.interact('focus', target);
  }

  blur(target: DataPath | CollectionNodeAddress): RuntimeActionResult {
    return this.interact('blur', target);
  }

  resetTouched(scope?: FormScope): RuntimeActionResult {
    const disposed = this.disposedResult('resetTouched');
    if (disposed) return disposed;
    const parsed = scope === undefined ? undefined : this.parseScope(scope);
    if (parsed && !parsed.success) return actionFailure(parsed.diagnostics);
    const names = parsed?.fieldKeys ?? this.fieldNames();
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
    const parsed = this.parseScope(scope);
    if (!parsed.success)
      return Object.freeze({
        valid: false,
        issues: EMPTY,
        diagnostics: parsed.diagnostics,
      });
    const issues = this.issues.filter(
      (issue) =>
        (issue.path.length === 0 && parsed.includeGlobal) ||
        (() => {
          const key = assignedIssueKey(issue.path, this.nodeByKey);
          const runtimeKey = assignedRuntimeIssueKey(
            issue.path,
            this.snapshotByPath,
          );
          return (
            (runtimeKey !== undefined && parsed.nodeKeys.has(runtimeKey)) ||
            (key !== undefined && parsed.nodeKeys.has(key))
          );
        })(),
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
    const parsed = this.parseScope(scope);
    if (!parsed.success) return actionFailure(parsed.diagnostics);
    const previous = this.forcedScopes.get(parsed.id);
    const changed =
      previous === undefined || !sameSet(previous, parsed.nodeKeys);
    if (changed) this.forcedScopes.set(parsed.id, parsed.nodeKeys);
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
    const key = managedPathKey(path);
    if (key === undefined)
      return actionFailure([
        runtimeDiagnostic(
          'UNKNOWN_RUNTIME_PATH',
          { path: copyPath(path) },
          'Runtime path is not managed.',
        ),
      ]);
    const field = this.fieldByKey.get(key);
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
            field: field.name,
            fieldType: fieldType(field),
            ...describeActualValue(nextValue),
          },
          'Operation value is incompatible with the field.',
          field.path,
        ),
      ]);
    const snapshot = this.snapshotByKey.get(key) as
      FieldRuntimeSnapshot | undefined;
    if (snapshot === undefined) {
      return actionFailure([
        runtimeDiagnostic(
          'UNKNOWN_RUNTIME_PATH',
          { path: copyPath(path) },
          'Runtime path is not managed.',
        ),
      ]);
    }
    if (
      snapshot.presence.kind === 'blocked' &&
      snapshot.presence.reason === 'incompatible-ancestor'
    ) {
      return actionFailure([
        incompatibleRuntimeAncestor(
          type === 'set-value' ? 'requestSetValue' : 'requestRemoveValue',
          field.path,
          snapshot.presence.at,
          this.value,
        ),
      ]);
    }
    if (
      type === 'remove-value' &&
      (snapshot.presence.kind === 'missing' ||
        snapshot.presence.kind === 'blocked')
    ) {
      return actionSuccess(false, false);
    }
    const present = snapshot.presence.kind === 'value';
    const actual: unknown =
      snapshot.presence.kind === 'value' ? snapshot.presence.value : undefined;
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
      path: Object.freeze([...field.path]),
      expected: expectation,
      ...(type === 'set-value' ? { value: nextValue } : {}),
      source: 'user' as const,
    }) as FormOperation;
    this.nextOperationId += 1;
    return actionSuccess(false, true, this.notifyOperations(operation));
  }

  private requestCollectionLeaf(
    type: 'set-item-value' | 'remove-item-value',
    target: CollectionNodeAddress,
    nextValue?: unknown,
  ): RuntimeActionResult {
    const action =
      type === 'set-item-value'
        ? 'requestSetItemValue'
        : 'requestRemoveItemValue';
    const disposed = this.disposedResult(action);
    if (disposed) return disposed;
    const parsedTarget = parseRuntimeNodeAddress(target, action, 'target');
    if (parsedTarget.address === undefined)
      return actionFailure(parsedTarget.diagnostics);
    const copied = parsedTarget.address;
    const collection = this.collectionDefinition(copied.collectionPath);
    if (collection === undefined) {
      return actionFailure([
        invalidCollectionManaged(action, copied.collectionPath),
      ]);
    }
    const field = collection.item.fields.find(
      (candidate) =>
        canonicalDataPathKey(candidate.relativePath) ===
        canonicalDataPathKey(copied.relativePath),
    );
    if (field === undefined) {
      return actionFailure([
        invalidRuntimeTarget(
          action,
          'relativePath',
          'managed primitive leaf',
          hasTemplateObject(collection, copied.relativePath)
            ? 'non-leaf-target'
            : 'node-not-managed',
          copied.collectionPath,
        ),
      ]);
    }
    const item = this.getItemSnapshot(copied);
    if (item === undefined)
      return actionFailure([this.unaddressable(action, collection)]);
    const snapshot = this.getCollectionNodeSnapshot(copied);
    if (snapshot?.nodeKind !== 'field') {
      return actionFailure([
        invalidCollectionManaged(action, copied.collectionPath),
      ]);
    }
    if (
      snapshot.presence.kind === 'blocked' &&
      snapshot.presence.reason === 'incompatible-ancestor'
    ) {
      return actionFailure([
        incompatibleRuntimeAncestor(
          action,
          snapshot.path,
          snapshot.presence.at,
          this.value,
        ),
      ]);
    }
    if (type === 'set-item-value' && !compatible(field, nextValue)) {
      return actionFailure([
        runtimeDiagnostic(
          'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
          {
            operationType: type,
            reason: 'leaf-type',
            actualType: actualType(nextValue),
            field: field.name,
            fieldType: fieldType(field),
          },
          'Collection operation value is incompatible.',
          snapshot.path,
        ),
      ]);
    }
    if (
      type === 'remove-item-value' &&
      (snapshot.presence.kind === 'missing' ||
        snapshot.presence.kind === 'blocked')
    ) {
      return actionSuccess(false, false);
    }
    const present = snapshot.presence.kind === 'value';
    const actual = present ? snapshot.presence.value : undefined;
    if (type === 'set-item-value' && present && Object.is(actual, nextValue)) {
      return actionSuccess(false, false);
    }
    const operation = Object.freeze({
      type,
      metadata: Object.freeze({
        id: this.nextOperationId,
        formId: this.options.formId,
      }),
      target: copied,
      identityProperty: collection.identity.property,
      expected: present
        ? Object.freeze({ kind: 'value' as const, value: actual })
        : Object.freeze({ kind: 'missing' as const }),
      ...(type === 'set-item-value' ? { value: nextValue } : {}),
      source: 'user' as const,
    }) as FormOperation;
    this.nextOperationId += 1;
    return actionSuccess(false, true, this.notifyOperations(operation));
  }

  private requestCollectionStructural(
    type: 'insert-item' | 'remove-item' | 'move-item',
    address: CollectionItemAddress,
    placement?: CollectionPlacement,
    item?: unknown,
  ): RuntimeActionResult {
    const action =
      type === 'insert-item'
        ? 'requestInsertItem'
        : type === 'remove-item'
          ? 'requestRemoveItem'
          : 'requestMoveItem';
    const disposed = this.disposedResult(action);
    if (disposed) return disposed;
    const parsedAddress = parseRuntimeItemAddress(address, action, 'address');
    if (parsedAddress.address === undefined)
      return actionFailure(parsedAddress.diagnostics);
    const copied = parsedAddress.address;
    const normalizedPlacement =
      type === 'remove-item'
        ? undefined
        : parseRuntimePlacement(
            placement,
            copied.itemId,
            action,
            copied.collectionPath,
          );
    if (
      normalizedPlacement !== undefined &&
      'diagnostics' in normalizedPlacement
    )
      return actionFailure(normalizedPlacement.diagnostics);
    const copiedPlacement = normalizedPlacement;
    const collection = this.collectionDefinition(copied.collectionPath);
    if (collection === undefined) {
      return actionFailure([
        invalidCollectionManaged(action, copied.collectionPath),
      ]);
    }
    const array = this.snapshotByKey.get(collection.key);
    if (array?.nodeKind !== 'array') {
      return actionFailure([
        invalidCollectionManaged(action, copied.collectionPath),
      ]);
    }
    const missingMaterialization =
      type === 'insert-item' &&
      (copiedPlacement?.kind === 'start' || copiedPlacement?.kind === 'end');
    if (
      array.identityState.kind === 'invalid' ||
      array.presence.kind === 'incompatible' ||
      (array.presence.kind === 'blocked' &&
        (array.presence.reason === 'incompatible-ancestor' ||
          !missingMaterialization)) ||
      (array.presence.kind === 'missing' && !missingMaterialization)
    ) {
      return actionFailure([this.unaddressable(action, collection)]);
    }
    const existing = this.getItemSnapshot(copied);
    if (type !== 'insert-item' && existing === undefined) {
      return actionFailure([this.unaddressable(action, collection)]);
    }
    if (type === 'insert-item' && existing !== undefined) {
      return actionFailure([
        unaddressableDiagnostic(
          action,
          'item-id-already-exists',
          collection.path,
        ),
      ]);
    }
    if (
      copiedPlacement !== undefined &&
      (copiedPlacement.kind === 'before' || copiedPlacement.kind === 'after') &&
      this.getItemSnapshot({
        collectionPath: copied.collectionPath,
        itemId: copiedPlacement.itemId,
      }) === undefined
    ) {
      return actionFailure([
        unaddressableDiagnostic(action, 'anchor-not-found', collection.path),
      ]);
    }
    if (type === 'insert-item') {
      if (!isOrdinaryObject(item)) {
        return actionFailure([
          runtimeDiagnostic(
            'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
            {
              operationType: type,
              reason: 'item-not-object',
              actualType: actualType(item),
            },
            'Collection operation value is incompatible.',
            copied.collectionPath,
          ),
        ]);
      }
      const identity = readOwnDataMember(item, collection.identity.property);
      if (identity.kind !== 'value' || identity.value !== copied.itemId) {
        return actionFailure([
          runtimeDiagnostic(
            'INCOMPATIBLE_COLLECTION_OPERATION_VALUE',
            {
              operationType: type,
              reason: 'item-identity-mismatch',
              actualType: actualType(
                identity.kind === 'value' ? identity.value : undefined,
              ),
              identityProperty: collection.identity.property,
            },
            'Collection operation value is incompatible.',
            copied.collectionPath,
          ),
        ]);
      }
    }
    const operation = Object.freeze({
      type,
      metadata: Object.freeze({
        id: this.nextOperationId,
        formId: this.options.formId,
      }),
      collectionPath: copied.collectionPath,
      identityProperty: collection.identity.property,
      itemId: copied.itemId,
      ...(type === 'insert-item' ? { item, placement: copiedPlacement } : {}),
      ...(type === 'move-item' ? { placement: copiedPlacement } : {}),
      source: 'user' as const,
    }) as FormOperation;
    this.nextOperationId += 1;
    return actionSuccess(false, true, this.notifyOperations(operation));
  }

  private collectionDefinition(
    path: readonly string[],
  ): Extract<FormNodeDefinition, { kind: 'array' }> | undefined {
    const node = this.nodeByKey.get(canonicalDataPathKey(path));
    return node?.kind === 'array' ? node : undefined;
  }

  private unaddressable(
    action: string,
    collection: Extract<FormNodeDefinition, { kind: 'array' }>,
  ): Diagnostic {
    const snapshot = this.snapshotByKey.get(collection.key);
    const reason =
      snapshot?.nodeKind !== 'array'
        ? 'collection-not-managed'
        : snapshot.identityState.kind === 'invalid'
          ? 'invalid-identity'
          : snapshot.presence.kind === 'missing'
            ? 'collection-missing'
            : snapshot.presence.kind === 'incompatible'
              ? 'incompatible-array'
              : snapshot.presence.kind === 'blocked'
                ? snapshot.presence.reason === 'incompatible-ancestor'
                  ? 'incompatible-ancestor'
                  : 'collection-missing'
                : 'item-not-found';
    const blockingPath =
      snapshot?.nodeKind === 'array' &&
      snapshot.presence.kind === 'blocked' &&
      snapshot.presence.reason === 'incompatible-ancestor'
        ? snapshot.presence.at
        : undefined;
    return unaddressableDiagnostic(
      action,
      reason,
      collection.path,
      blockingPath,
    );
  }

  private interact(
    action: 'focus' | 'blur',
    target: DataPath | CollectionNodeAddress,
  ): RuntimeActionResult {
    const disposed = this.disposedResult(action);
    if (disposed) return disposed;
    if (!Array.isArray(target)) {
      const parsedTarget = parseRuntimeNodeAddress(target, action, 'target');
      if (parsedTarget.address === undefined)
        return actionFailure(parsedTarget.diagnostics);
      const copied = parsedTarget.address;
      const collection = this.collectionDefinition(copied.collectionPath);
      if (collection === undefined)
        return actionFailure([
          invalidCollectionManaged(action, copied.collectionPath),
        ]);
      const field = collection.item.fields.find(
        (candidate) =>
          canonicalDataPathKey(candidate.relativePath) ===
          canonicalDataPathKey(copied.relativePath),
      );
      if (field === undefined)
        return actionFailure([
          invalidRuntimeTarget(
            action,
            'relativePath',
            'managed primitive leaf',
            hasTemplateObject(collection, copied.relativePath)
              ? 'non-leaf-target'
              : 'node-not-managed',
            copied.collectionPath,
          ),
        ]);
      const snapshot = this.getCollectionNodeSnapshot(copied);
      if (snapshot?.nodeKind !== 'field') {
        return actionFailure([this.unaddressable(action, collection)]);
      }
      return this.interactWithKey(action, snapshot.key, snapshot);
    }
    const path = target;
    const key = managedPathKey(path);
    const field = key === undefined ? undefined : this.fieldByKey.get(key);
    if (key === undefined || field === undefined)
      return actionFailure([
        runtimeDiagnostic(
          'UNKNOWN_RUNTIME_PATH',
          { path: copyPath(path) },
          'Runtime path is not managed.',
        ),
      ]);
    const snapshot = this.snapshotByKey.get(key) as
      FieldRuntimeSnapshot | undefined;
    if (
      snapshot?.presence.kind === 'blocked' &&
      snapshot.presence.reason === 'incompatible-ancestor'
    ) {
      return actionFailure([
        incompatibleRuntimeAncestor(
          action,
          field.path,
          snapshot.presence.at,
          this.value,
        ),
      ]);
    }
    return this.interactWithKey(action, key, snapshot);
  }

  private interactWithKey(
    action: 'focus' | 'blur',
    key: string,
    snapshot: FieldRuntimeSnapshot | undefined,
  ): RuntimeActionResult {
    if (
      snapshot?.presence.kind === 'blocked' &&
      snapshot.presence.reason === 'incompatible-ancestor'
    ) {
      return actionFailure([
        incompatibleRuntimeAncestor(
          action,
          snapshot.path,
          snapshot.presence.at,
          this.value,
        ),
      ]);
    }
    let changed = false;
    if (action === 'focus') {
      if (this.focused !== key) {
        this.focused = key;
        changed = true;
      }
    } else if (this.focused === key) {
      this.focused = undefined;
      changed = true;
      this.touched.add(key);
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
    const built = buildNestedSnapshots({
      definitions: this.options.definition.nodes,
      value: this.value,
      baseline: this.baseline,
      issues: this.issues,
      touched: this.touched,
      focused: this.focused,
      forcedScopes: this.forcedScopes,
      visibility: this.visibility,
      ...(previous === undefined ? {} : { previous }),
      nodeByKey: this.nodeByKey,
    });
    this.snapshotByKey = built.byKey;
    this.snapshotByPath = built.byPath;
    return Object.freeze({
      value: this.value,
      locale: this.locale,
      valid:
        this.validationValid &&
        built.globalIssues.length === 0 &&
        built.nodes.every((node) => node.valid),
      dirty: built.nodes.some((node) => node.dirty),
      validationVisibility: this.visibility,
      nodes: built.nodes,
      fields: built.fields,
      globalIssues: built.globalIssues,
    });
  }

  private fieldNames(): ReadonlySet<string> {
    const result = new Set(this.fieldByKey.keys());
    for (const snapshot of this.snapshotByKey.values()) {
      if (snapshot.nodeKind === 'field') result.add(snapshot.key);
    }
    return result;
  }

  private parseScope(scope: unknown): ParsedScope {
    return parseScope(
      scope,
      this.nodeByKey,
      this.descendantNodeKeys,
      this.descendantFieldKeys,
      this.snapshotByKey,
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

function collectionStateDiagnostics(
  value: object,
  baselineValue: object,
  definitions: readonly FormNodeDefinition[],
): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const root of [value, baselineValue]) {
    for (const entry of inspectDefinedCollections(root, definitions)) {
      if (
        entry.inspection.success &&
        entry.inspection.presence.kind === 'array'
      ) {
        diagnostics.push(
          ...collectionIdentityDiagnostics(
            entry.definition,
            entry.inspection.identity,
          ),
        );
      }
    }
  }
  return freezeDiagnostics(diagnostics);
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
  const definitionValidation = validateCollectionFormDefinition(
    options.definition,
  );
  if (!definitionValidation.success)
    return {
      success: false,
      diagnostics: freezeDiagnostics([
        invalidDefinitionOption(
          options.definition,
          definitionValidation.defect,
        ),
      ]),
    };
  const valueDiagnostic = validateManagedExternalData(
    options.value,
    options.definition.nodes,
    'value',
    'creation',
  );
  if (valueDiagnostic !== undefined)
    return {
      success: false,
      diagnostics: freezeDiagnostics([valueDiagnostic]),
    };
  const baselineDiagnostic = validateManagedExternalData(
    options.baselineValue,
    options.definition.nodes,
    'baselineValue',
    'creation',
  );
  if (baselineDiagnostic !== undefined)
    return {
      success: false,
      diagnostics: freezeDiagnostics([baselineDiagnostic]),
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
  definitions: readonly FormNodeDefinition[],
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
  const nodes = buildDefinitionIndexes(definitions).nodes;
  for (let index = 0; index < rawIssues.length; index += 1) {
    const issue: unknown = rawIssues[index];
    const normalized = normalizeIssue(issue, index);
    if (!normalized.success) return normalized;
    issues.push(normalized.issue);
    const path = normalized.issue.path;
    if (path.length !== 0 && assignedIssueKey(path, nodes) === undefined)
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

interface DefinitionIndexes {
  readonly nodes: ReadonlyMap<string, FormNodeDefinition>;
  readonly fields: ReadonlyMap<string, FieldDefinition>;
  readonly descendantNodes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly descendantFields: ReadonlyMap<string, ReadonlySet<string>>;
}

function buildDefinitionIndexes(
  definitions: readonly FormNodeDefinition[],
): DefinitionIndexes {
  const nodes = new Map<string, FormNodeDefinition>();
  const fields = new Map<string, FieldDefinition>();
  const descendantNodes = new Map<string, ReadonlySet<string>>();
  const descendantFields = new Map<string, ReadonlySet<string>>();
  type Frame =
    | { readonly phase: 'enter'; readonly node: FormNodeDefinition }
    | { readonly phase: 'exit'; readonly node: ObjectFieldDefinition };
  const stack: Frame[] = [];
  for (let index = definitions.length - 1; index >= 0; index -= 1) {
    stack.push({
      phase: 'enter',
      node: definitions[index] as FormNodeDefinition,
    });
  }
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.phase === 'exit') {
      const nodeKeys = new Set<string>([frame.node.key]);
      const fieldKeys = new Set<string>();
      for (const child of frame.node.children) {
        for (const key of descendantNodes.get(child.key) ?? EMPTY) {
          nodeKeys.add(key);
        }
        for (const key of descendantFields.get(child.key) ?? EMPTY) {
          fieldKeys.add(key);
        }
      }
      descendantNodes.set(frame.node.key, nodeKeys);
      descendantFields.set(frame.node.key, fieldKeys);
      continue;
    }
    nodes.set(frame.node.key, frame.node);
    if (frame.node.kind === 'array') {
      descendantNodes.set(frame.node.key, new Set([frame.node.key]));
      descendantFields.set(frame.node.key, new Set());
      continue;
    }
    if (frame.node.kind !== 'object') {
      fields.set(frame.node.key, frame.node);
      descendantNodes.set(frame.node.key, new Set([frame.node.key]));
      descendantFields.set(frame.node.key, new Set([frame.node.key]));
      continue;
    }
    stack.push({ phase: 'exit', node: frame.node });
    for (let index = frame.node.children.length - 1; index >= 0; index -= 1) {
      stack.push({
        phase: 'enter',
        node: frame.node.children[index] as FormNodeDefinition,
      });
    }
  }
  return { nodes, fields, descendantNodes, descendantFields };
}

function managedPathKey(path: unknown): string | undefined {
  const copied = copyStringDataPath(path);
  return copied === undefined ? undefined : canonicalDataPathKey(copied);
}

function positionalPathKey(path: unknown): string | undefined {
  const copied = safePath(path);
  return copied === undefined || copied.length === 0
    ? undefined
    : canonicalDataPathKey(copied);
}

function validateManagedExternalData(
  value: unknown,
  definitions: readonly FormNodeDefinition[],
  member: 'value' | 'baselineValue',
  phase: 'creation' | 'update',
): Diagnostic | undefined {
  if (!isOrdinaryObject(value)) {
    return runtimeDiagnostic(
      phase === 'creation'
        ? 'INVALID_RUNTIME_OPTIONS'
        : 'INVALID_EXTERNAL_STATE_UPDATE',
      {
        member,
        expected: 'ordinary data tree at managed paths',
        reason: 'invalid-value',
        ...describeActualValue(value),
      },
      phase === 'creation'
        ? `Runtime option "${member}" is invalid.`
        : `External state member "${member}" is invalid.`,
    );
  }
  const accessor = firstManagedDataAccessor(value, definitions);
  if (accessor !== undefined) {
    return runtimeDiagnostic(
      phase === 'creation'
        ? 'INVALID_RUNTIME_OPTIONS'
        : 'INVALID_EXTERNAL_STATE_UPDATE',
      {
        member,
        expected: 'ordinary data tree at managed paths',
        reason: 'invalid-value',
        actualType: 'object',
        propertyReason: 'accessor',
      },
      phase === 'creation'
        ? `Runtime option "${member}" is invalid.`
        : `External state member "${member}" is invalid.`,
      accessor,
    );
  }
  return undefined;
}

function invalidDefinitionOption(
  value: unknown,
  defect: NestedDefinitionDefect,
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_RUNTIME_OPTIONS',
    {
      member: 'definition',
      expected: 'valid collection FormDefinition',
      reason: 'invalid-value',
      ...describeActualValue(value),
      definitionReason: defect.reason,
      ...(defect.member === undefined
        ? {}
        : { definitionMember: defect.member }),
      ...(defect.actualType === undefined
        ? {}
        : { definitionActualType: defect.actualType }),
      ...(defect.members === undefined
        ? {}
        : { definitionMembers: Object.freeze([...defect.members]) }),
      ...(defect.nodeIndexPath === undefined
        ? {}
        : { nodeIndexPath: Object.freeze([...defect.nodeIndexPath]) }),
      ...(defect.firstNodeIndexPath === undefined
        ? {}
        : {
            firstNodeIndexPath: Object.freeze([...defect.firstNodeIndexPath]),
          }),
      ...(defect.templateIndexPath === undefined
        ? {}
        : { templateIndexPath: Object.freeze([...defect.templateIndexPath]) }),
      ...(defect.firstTemplateIndexPath === undefined
        ? {}
        : {
            firstTemplateIndexPath: Object.freeze([
              ...defect.firstTemplateIndexPath,
            ]),
          }),
      ...(defect.fieldIndex === undefined
        ? {}
        : { fieldIndex: defect.fieldIndex }),
      ...(defect.path === undefined
        ? {}
        : { path: Object.freeze([...defect.path]) }),
      ...(defect.relativePath === undefined
        ? {}
        : { relativePath: Object.freeze([...defect.relativePath]) }),
      ...(defect.presentationIndexPath === undefined
        ? {}
        : {
            presentationIndexPath: Object.freeze([
              ...defect.presentationIndexPath,
            ]),
          }),
    },
    'Runtime option "definition" is invalid.',
  );
}

function resolveFieldPresence(root: object, path: DataPath): FieldPresence {
  let current: object = root;
  for (let index = 0; index < path.length; index += 1) {
    const name = path[index] as string;
    const entry = readOwnDataMember(current, name);
    if (index === path.length - 1) {
      return entry.kind === 'value'
        ? Object.freeze({ kind: 'value', value: entry.value })
        : Object.freeze({ kind: 'missing' });
    }
    const at = Object.freeze(path.slice(0, index + 1) as string[]);
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

function incompatibleRuntimeAncestor(
  action: string,
  path: DataPath,
  blockingPath: DataPath,
  root: object,
): Diagnostic {
  let current: unknown = root;
  for (const name of blockingPath) {
    if (
      (typeof name === 'number' && !Array.isArray(current)) ||
      (typeof name === 'string' && !isOrdinaryObject(current))
    )
      break;
    const entry = readOwnDataMember(current as object, name);
    current = entry.kind === 'value' ? entry.value : undefined;
  }
  return runtimeDiagnostic(
    'INCOMPATIBLE_RUNTIME_ANCESTOR',
    {
      action,
      reason: 'incompatible-ancestor',
      blockingPath: Object.freeze([...blockingPath]),
      actualType: actualType(current),
    },
    'Runtime action is blocked by an incompatible ancestor.',
    path,
  );
}

function invalidRuntimeTarget(
  action: string,
  member: string,
  expected: string,
  reason: string,
  path?: readonly string[],
  actual?: unknown,
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_COLLECTION_RUNTIME_TARGET',
    {
      action,
      member,
      expected,
      reason,
      ...(reason === 'invalid-value' ? { actualType: actualType(actual) } : {}),
    },
    'Collection runtime target is invalid.',
    path,
  );
}

interface RuntimeItemAddressParse {
  readonly address?: CollectionItemAddress;
  readonly diagnostics: readonly Diagnostic[];
}

interface RuntimeNodeAddressParse {
  readonly address?: CollectionNodeAddress;
  readonly diagnostics: readonly Diagnostic[];
}

function parseRuntimeItemAddress(
  value: unknown,
  action: string,
  exteriorMember: string,
): RuntimeItemAddressParse {
  if (!isOrdinaryObject(value)) {
    return {
      diagnostics: Object.freeze([
        invalidRuntimeTarget(
          action,
          exteriorMember,
          'collection item address',
          'invalid-value',
          undefined,
          value,
        ),
      ]),
    };
  }
  const diagnostics: Diagnostic[] = [];
  const collectionPath = parseRuntimeStringPath(
    value,
    'collectionPath',
    'non-empty string-only path',
    action,
    diagnostics,
  );
  const itemId = parseRuntimeItemId(value, action, diagnostics, collectionPath);
  if (collectionPath === undefined || itemId === undefined) {
    return { diagnostics: Object.freeze(diagnostics) };
  }
  return {
    address: Object.freeze({ collectionPath, itemId }),
    diagnostics: Object.freeze(diagnostics),
  };
}

function parseRuntimeNodeAddress(
  value: unknown,
  action: string,
  exteriorMember: string,
): RuntimeNodeAddressParse {
  if (!isOrdinaryObject(value)) {
    return {
      diagnostics: Object.freeze([
        invalidRuntimeTarget(
          action,
          exteriorMember,
          'collection node address',
          'invalid-value',
          undefined,
          value,
        ),
      ]),
    };
  }
  const diagnostics: Diagnostic[] = [];
  const collectionPath = parseRuntimeStringPath(
    value,
    'collectionPath',
    'non-empty string-only path',
    action,
    diagnostics,
  );
  const itemId = parseRuntimeItemId(value, action, diagnostics, collectionPath);
  const relativePath = parseRuntimeStringPath(
    value,
    'relativePath',
    'non-empty string-only relative path',
    action,
    diagnostics,
    collectionPath,
  );
  if (
    collectionPath === undefined ||
    itemId === undefined ||
    relativePath === undefined
  ) {
    return { diagnostics: Object.freeze(diagnostics) };
  }
  return {
    address: Object.freeze({ collectionPath, itemId, relativePath }),
    diagnostics: Object.freeze(diagnostics),
  };
}

function parseRuntimeStringPath(
  object: object,
  member: string,
  expected: string,
  action: string,
  diagnostics: Diagnostic[],
  dataPath?: readonly string[],
): readonly string[] | undefined {
  const entry = readOwnDataMember(object, member);
  if (entry.kind !== 'value') {
    diagnostics.push(
      invalidRuntimeTarget(
        action,
        member,
        expected,
        entry.kind === 'accessor' ? 'accessor-member' : 'missing-member',
        dataPath,
      ),
    );
    return undefined;
  }
  if (!Array.isArray(entry.value) || entry.value.length === 0) {
    diagnostics.push(
      invalidRuntimeTarget(
        action,
        member,
        expected,
        'invalid-value',
        dataPath,
        entry.value,
      ),
    );
    return undefined;
  }
  const result: string[] = [];
  let valid = true;
  for (let index = 0; index < entry.value.length; index += 1) {
    const segment = readOwnDataMember(entry.value, String(index));
    const indexedMember = `${member}[${index}]`;
    if (segment.kind !== 'value') {
      diagnostics.push(
        invalidRuntimeTarget(
          action,
          indexedMember,
          'string',
          segment.kind === 'accessor' ? 'accessor-member' : 'missing-member',
          dataPath,
        ),
      );
      valid = false;
    } else if (typeof segment.value !== 'string') {
      diagnostics.push(
        invalidRuntimeTarget(
          action,
          indexedMember,
          'string',
          'invalid-value',
          dataPath,
          segment.value,
        ),
      );
      valid = false;
    } else {
      result.push(segment.value);
    }
  }
  return valid ? Object.freeze(result) : undefined;
}

function parseRuntimeItemId(
  object: object,
  action: string,
  diagnostics: Diagnostic[],
  dataPath?: readonly string[],
): string | undefined {
  const entry = readOwnDataMember(object, 'itemId');
  if (entry.kind !== 'value') {
    diagnostics.push(
      invalidRuntimeTarget(
        action,
        'itemId',
        'non-blank string',
        entry.kind === 'accessor' ? 'accessor-member' : 'missing-member',
        dataPath,
      ),
    );
    return undefined;
  }
  if (typeof entry.value !== 'string' || entry.value.trim().length === 0) {
    diagnostics.push(
      invalidRuntimeTarget(
        action,
        'itemId',
        'non-blank string',
        'invalid-value',
        dataPath,
        entry.value,
      ),
    );
    return undefined;
  }
  return entry.value;
}

function invalidCollectionManaged(
  action: string,
  path: readonly string[],
): Diagnostic {
  return runtimeDiagnostic(
    'INVALID_COLLECTION_RUNTIME_TARGET',
    {
      action,
      member: 'collectionPath',
      expected: 'managed primitive leaf',
      reason: 'node-not-managed',
    },
    'Collection runtime target is invalid.',
    path,
  );
}

function hasTemplateObject(
  collection: Extract<FormNodeDefinition, { kind: 'array' }>,
  relativePath: readonly string[],
): boolean {
  const key = canonicalDataPathKey(relativePath);
  const stack = [...collection.item.children].reverse();
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    if (
      node.kind === 'object' &&
      canonicalDataPathKey(node.relativePath) === key
    )
      return true;
    if (node.kind === 'object') {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        stack.push(node.children[index] as (typeof node.children)[number]);
      }
    }
  }
  return false;
}

function unaddressableDiagnostic(
  action: string,
  reason: string,
  path: DataPath,
  blockingPath?: DataPath,
): Diagnostic {
  return runtimeDiagnostic(
    'UNADDRESSABLE_COLLECTION',
    {
      action,
      reason,
      ...(blockingPath === undefined
        ? {}
        : { blockingPath: Object.freeze([...blockingPath]) }),
    },
    'Collection is not addressable.',
    path,
  );
}

function parseRuntimePlacement(
  value: unknown,
  itemId: string,
  action: string,
  dataPath: readonly string[],
): CollectionPlacement | { readonly diagnostics: readonly Diagnostic[] } {
  if (!isOrdinaryObject(value)) {
    return {
      diagnostics: Object.freeze([
        invalidRuntimeTarget(
          action,
          'placement',
          'collection placement',
          'invalid-value',
          dataPath,
          value,
        ),
      ]),
    };
  }
  const kind = readOwnDataMember(value, 'kind');
  if (kind.kind !== 'value') {
    return {
      diagnostics: Object.freeze([
        invalidRuntimeTarget(
          action,
          'placement.kind',
          'collection placement',
          kind.kind === 'accessor' ? 'accessor-member' : 'missing-member',
          dataPath,
        ),
      ]),
    };
  }
  if (kind.value === 'start' || kind.value === 'end') {
    return Object.freeze({ kind: kind.value });
  }
  if (kind.value !== 'before' && kind.value !== 'after') {
    return {
      diagnostics: Object.freeze([
        invalidRuntimeTarget(
          action,
          'placement.kind',
          'collection placement',
          'invalid-value',
          dataPath,
          kind.value,
        ),
      ]),
    };
  }
  const anchor = readOwnDataMember(value, 'itemId');
  if (
    anchor.kind !== 'value' ||
    typeof anchor.value !== 'string' ||
    anchor.value.trim().length === 0
  ) {
    return {
      diagnostics: Object.freeze([
        invalidRuntimeTarget(
          action,
          'placement.itemId',
          'non-blank string',
          anchor.kind === 'accessor'
            ? 'accessor-member'
            : anchor.kind === 'missing'
              ? 'missing-member'
              : 'invalid-value',
          dataPath,
          anchor.kind === 'value' ? anchor.value : undefined,
        ),
      ]),
    };
  }
  if (anchor.value === itemId) {
    return {
      diagnostics: Object.freeze([
        invalidRuntimeTarget(
          action,
          'placement.itemId',
          'different anchor item',
          'self-anchor',
          dataPath,
        ),
      ]),
    };
  }
  return Object.freeze({ kind: kind.value, itemId: anchor.value });
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
type BranchContext =
  | { readonly kind: 'object'; readonly value: object }
  | {
      readonly kind: 'blocked';
      readonly reason: 'missing-ancestor' | 'incompatible-ancestor';
      readonly at: readonly string[];
    };

interface SnapshotBuildInput<TData extends object> {
  readonly definitions: readonly FormNodeDefinition[];
  readonly value: Readonly<TData>;
  readonly baseline: Readonly<TData>;
  readonly issues: readonly ValidationIssue[];
  readonly touched: ReadonlySet<string>;
  readonly focused: string | undefined;
  readonly forcedScopes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly visibility: ValidationVisibility;
  readonly previous?: FormRuntimeSnapshot<TData>;
  readonly nodeByKey: ReadonlyMap<string, FormNodeDefinition>;
}

interface SnapshotBuildResult {
  readonly nodes: readonly NodeRuntimeSnapshot[];
  readonly fields: readonly FieldRuntimeSnapshot[];
  readonly globalIssues: readonly ValidationIssue[];
  readonly byKey: Map<string, RuntimeTreeSnapshot>;
  readonly byPath: Map<string, RuntimeTreeSnapshot>;
}

function buildNestedSnapshots<TData extends object>(
  input: SnapshotBuildInput<TData>,
): SnapshotBuildResult {
  const assigned = assignIssues(input.issues, input.nodeByKey);
  const previousByKey = indexSnapshots(input.previous?.nodes ?? EMPTY);
  const nodes = new Array<NodeRuntimeSnapshot>(input.definitions.length);
  const fields: FieldRuntimeSnapshot[] = [];
  const byKey = new Map<string, RuntimeTreeSnapshot>();
  const byPath = new Map<string, RuntimeTreeSnapshot>();
  type Frame =
    | {
        readonly phase: 'enter';
        readonly definition: FormNodeDefinition;
        readonly current: BranchContext;
        readonly baseline: BranchContext;
        readonly output: NodeRuntimeSnapshot[];
        readonly index: number;
      }
    | {
        readonly phase: 'exit';
        readonly definition: ObjectFieldDefinition;
        readonly currentPresence: ObjectPresence;
        readonly baselinePresence: ObjectPresence;
        readonly children: NodeRuntimeSnapshot[];
        readonly output: NodeRuntimeSnapshot[];
        readonly index: number;
      };
  const stack: Frame[] = [];
  const currentRoot: BranchContext = { kind: 'object', value: input.value };
  const baselineRoot: BranchContext = {
    kind: 'object',
    value: input.baseline,
  };
  for (let index = input.definitions.length - 1; index >= 0; index -= 1) {
    stack.push({
      phase: 'enter',
      definition: input.definitions[index] as FormNodeDefinition,
      current: currentRoot,
      baseline: baselineRoot,
      output: nodes,
      index,
    });
  }

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame === undefined) break;
    if (frame.phase === 'exit') {
      const ownIssues = assigned.byKey.get(frame.definition.key) ?? EMPTY;
      const touched = frame.children.some((child) => child.touched);
      const focused = frame.children.some((child) => child.focused);
      const forced = isForced(frame.definition.key, input.forcedScopes);
      const candidate = freezeObjectSnapshot({
        nodeKind: 'object',
        key: frame.definition.key,
        path: [...frame.definition.path],
        presence: frame.currentPresence,
        dirty: objectDirty(
          frame.currentPresence,
          frame.baselinePresence,
          frame.children,
        ),
        touched,
        focused,
        valid:
          ownIssues.length === 0 &&
          frame.children.every((child) => child.valid),
        issues: ownIssues,
        showIssues:
          ownIssues.length > 0 &&
          (input.visibility === 'all' || touched || forced),
        children: frame.children,
      });
      const previous = previousByKey.get(frame.definition.key);
      const snapshot =
        previous?.nodeKind === 'object' && sameObject(previous, candidate)
          ? previous
          : candidate;
      frame.output[frame.index] = snapshot;
      byKey.set(snapshot.key, snapshot);
      byPath.set(canonicalDataPathKey(snapshot.path), snapshot);
      continue;
    }

    const current = inspectNodeState(frame.current, frame.definition);
    const baseline = inspectNodeState(frame.baseline, frame.definition);
    if (frame.definition.kind === 'array') {
      const collectionIssues =
        assigned.byKey.get(frame.definition.key) ?? EMPTY;
      const currentCollection = inspectCollectionValue(
        input.value,
        frame.definition.path as readonly string[],
        frame.definition.identity.property,
      );
      const baselineCollection = inspectCollectionValue(
        input.baseline,
        frame.definition.path as readonly string[],
        frame.definition.identity.property,
      );
      const previous = previousByKey.get(frame.definition.key);
      const snapshot = buildCollectionSnapshotShell(
        frame.definition,
        currentCollection,
        baselineCollection,
        collectionIssues,
        previous?.nodeKind === 'array' ? previous : undefined,
        input.touched,
        input.focused,
        input.visibility === 'all',
        collectForcedKeys(input.forcedScopes),
      );
      if (snapshot !== undefined) {
        frame.output[frame.index] = snapshot;
        indexRuntimeTree(snapshot, byKey, byPath);
        for (const item of snapshot.items) fields.push(...item.fields);
      }
      continue;
    }
    if (frame.definition.kind === 'object') {
      const children = new Array<NodeRuntimeSnapshot>(
        frame.definition.children.length,
      );
      stack.push({
        phase: 'exit',
        definition: frame.definition,
        currentPresence: current.presence as ObjectPresence,
        baselinePresence: baseline.presence as ObjectPresence,
        children,
        output: frame.output,
        index: frame.index,
      });
      for (
        let index = frame.definition.children.length - 1;
        index >= 0;
        index -= 1
      ) {
        stack.push({
          phase: 'enter',
          definition: frame.definition.children[index] as FormNodeDefinition,
          current: current.children,
          baseline: baseline.children,
          output: children,
          index,
        });
      }
      continue;
    }

    const ownIssues = assigned.byKey.get(frame.definition.key) ?? EMPTY;
    const touched = input.touched.has(frame.definition.key);
    const focused = input.focused === frame.definition.key;
    const forced = isForced(frame.definition.key, input.forcedScopes);
    const candidate = freezeField({
      nodeKind: 'field',
      key: frame.definition.key,
      path: [...frame.definition.path],
      presence: current.presence as FieldPresence,
      dirty: fieldDirty(
        current.presence as FieldPresence,
        baseline.presence as FieldPresence,
      ),
      touched,
      focused,
      valid: ownIssues.length === 0,
      issues: ownIssues,
      showIssues:
        ownIssues.length > 0 &&
        (input.visibility === 'all' || touched || forced),
    });
    const previous = previousByKey.get(frame.definition.key);
    const snapshot =
      previous?.nodeKind === 'field' && sameField(previous, candidate)
        ? previous
        : candidate;
    frame.output[frame.index] = snapshot;
    fields.push(snapshot);
    byKey.set(snapshot.key, snapshot);
    byPath.set(canonicalDataPathKey(snapshot.path), snapshot);
  }

  return {
    nodes: Object.freeze(nodes),
    fields: Object.freeze(fields),
    globalIssues: assigned.global,
    byKey,
    byPath,
  };
}

function inspectNodeState(
  parent: BranchContext,
  definition: FormNodeDefinition,
): {
  readonly presence: ObjectPresence | FieldPresence;
  readonly children: BranchContext;
} {
  if (parent.kind === 'blocked') {
    const presence = Object.freeze({
      kind: 'blocked' as const,
      reason: parent.reason,
      at: Object.freeze([...parent.at]),
    });
    return { presence, children: parent };
  }
  const member = readOwnDataMember(parent.value, definition.name);
  if (definition.kind !== 'object') {
    const presence: FieldPresence =
      member.kind === 'value'
        ? Object.freeze({ kind: 'value', value: member.value })
        : Object.freeze({ kind: 'missing' });
    return { presence, children: parent };
  }
  const path = definition.path as readonly string[];
  if (member.kind === 'missing') {
    return {
      presence: Object.freeze({ kind: 'missing' }),
      children: {
        kind: 'blocked',
        reason: 'missing-ancestor',
        at: path,
      },
    };
  }
  if (member.kind === 'value' && isOrdinaryObject(member.value)) {
    return {
      presence: Object.freeze({ kind: 'object' }),
      children: { kind: 'object', value: member.value },
    };
  }
  const incompatible = member.kind === 'value' ? member.value : undefined;
  return {
    presence: Object.freeze({ kind: 'incompatible', value: incompatible }),
    children: {
      kind: 'blocked',
      reason: 'incompatible-ancestor',
      at: path,
    },
  };
}

function fieldDirty(current: FieldPresence, baseline: FieldPresence): boolean {
  if (current.kind === 'blocked' || baseline.kind === 'blocked') return false;
  if (current.kind !== baseline.kind) return true;
  return (
    current.kind === 'value' &&
    baseline.kind === 'value' &&
    !Object.is(current.value, baseline.value)
  );
}

function objectDirty(
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

function isForced(
  key: string,
  scopes: ReadonlyMap<string, ReadonlySet<string>>,
): boolean {
  return [...scopes.values()].some((scope) => scope.has(key));
}

function collectForcedKeys(
  scopes: ReadonlyMap<string, ReadonlySet<string>>,
): ReadonlySet<string> {
  const result = new Set<string>();
  for (const keys of scopes.values()) {
    for (const key of keys) result.add(key);
  }
  return result;
}

function indexSnapshots(
  nodes: readonly NodeRuntimeSnapshot[],
): ReadonlyMap<string, RuntimeTreeSnapshot> {
  const result = new Map<string, RuntimeTreeSnapshot>();
  const stack: RuntimeTreeSnapshot[] = [...nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) continue;
    result.set(node.key, node);
    if (node.nodeKind === 'object' || node.nodeKind === 'item') {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        stack.push(node.children[index] as NodeRuntimeSnapshot);
      }
    } else if (node.nodeKind === 'array') {
      for (let index = node.items.length - 1; index >= 0; index -= 1) {
        stack.push(node.items[index] as ItemRuntimeSnapshot);
      }
    }
  }
  return result;
}

function indexRuntimeTree(
  root: RuntimeTreeSnapshot,
  byKey: Map<string, RuntimeTreeSnapshot>,
  byPath: Map<string, RuntimeTreeSnapshot>,
): void {
  const stack: RuntimeTreeSnapshot[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    byKey.set(node.key, node);
    const path = node.nodeKind === 'item' ? node.dataPath : node.path;
    byPath.set(canonicalDataPathKey(path), node);
    if (node.nodeKind === 'array') {
      for (let index = node.items.length - 1; index >= 0; index -= 1) {
        stack.push(node.items[index] as ItemRuntimeSnapshot);
      }
    } else if (node.nodeKind === 'object' || node.nodeKind === 'item') {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        stack.push(node.children[index] as NodeRuntimeSnapshot);
      }
    }
  }
}

function assignIssues(
  issues: readonly ValidationIssue[],
  nodes: ReadonlyMap<string, FormNodeDefinition>,
): {
  readonly byKey: ReadonlyMap<string, readonly ValidationIssue[]>;
  readonly global: readonly ValidationIssue[];
} {
  const mutable = new Map<string, ValidationIssue[]>();
  const global: ValidationIssue[] = [];
  for (const issue of issues) {
    const key = assignedIssueKey(issue.path, nodes);
    if (key === undefined) {
      global.push(issue);
    } else {
      const entries = mutable.get(key) ?? [];
      entries.push(issue);
      mutable.set(key, entries);
    }
  }
  const byKey = new Map<string, readonly ValidationIssue[]>();
  for (const [key, entries] of mutable) byKey.set(key, Object.freeze(entries));
  return { byKey, global: Object.freeze(global) };
}

function assignedIssueKey(
  path: DataPath,
  nodes: ReadonlyMap<string, FormNodeDefinition>,
): string | undefined {
  if (path.length === 0) return undefined;
  const firstNumeric = path.findIndex((segment) => typeof segment === 'number');
  if (firstNumeric >= 0) {
    const collectionPath = path.slice(0, firstNumeric);
    const key = canonicalDataPathKey(collectionPath);
    return nodes.get(key)?.kind === 'array' ? key : undefined;
  }
  const copied = copyStringDataPath(path, true);
  if (copied === undefined) return undefined;
  const exact = canonicalDataPathKey(copied);
  if (nodes.has(exact)) return exact;
  for (let length = copied.length - 1; length > 0; length -= 1) {
    const key = canonicalDataPathKey(copied.slice(0, length));
    const node = nodes.get(key);
    if (node?.kind === 'object' || node?.kind === 'array') return key;
  }
  return undefined;
}

function assignedRuntimeIssueKey(
  path: DataPath,
  snapshots: ReadonlyMap<string, RuntimeTreeSnapshot>,
): string | undefined {
  for (let length = path.length; length > 0; length -= 1) {
    const snapshot = snapshots.get(canonicalDataPathKey(path.slice(0, length)));
    if (snapshot !== undefined) return snapshot.key;
  }
  return undefined;
}

function collectScopeTree(
  root: RuntimeTreeSnapshot,
  nodeKeys: Set<string>,
  fieldKeys: Set<string>,
): void {
  const stack: RuntimeTreeSnapshot[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) break;
    nodeKeys.add(node.key);
    if (node.nodeKind === 'field') {
      fieldKeys.add(node.key);
    } else if (node.nodeKind === 'array') {
      for (let index = node.items.length - 1; index >= 0; index -= 1) {
        stack.push(node.items[index] as ItemRuntimeSnapshot);
      }
    } else {
      for (let index = node.children.length - 1; index >= 0; index -= 1) {
        stack.push(node.children[index] as NodeRuntimeSnapshot);
      }
    }
  }
}
function fieldType(
  field: FieldDefinition | FieldTemplate,
): 'string' | 'number' | 'integer' | 'boolean' {
  return field.kind === 'number' ? field.numericType : field.kind;
}
function compatible(
  field: FieldDefinition | FieldTemplate,
  value: unknown,
): boolean {
  const type = fieldType(field);
  return (
    (field.nullable && value === null) ||
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
function freezeObjectSnapshot(
  node: ObjectRuntimeSnapshot,
): ObjectRuntimeSnapshot {
  Object.freeze(node.path);
  Object.freeze(node.presence);
  Object.freeze(node.children);
  return Object.freeze(node);
}
function sameObject(
  a: ObjectRuntimeSnapshot,
  b: ObjectRuntimeSnapshot,
): boolean {
  return (
    a.key === b.key &&
    sameObjectPresence(a.presence, b.presence) &&
    a.dirty === b.dirty &&
    a.touched === b.touched &&
    a.focused === b.focused &&
    a.valid === b.valid &&
    a.showIssues === b.showIssues &&
    sameArray(a.issues, b.issues) &&
    sameArray(a.children, b.children)
  );
}
function sameObjectPresence(a: ObjectPresence, b: ObjectPresence): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'missing' || a.kind === 'object') return true;
  if (a.kind === 'incompatible') {
    return b.kind === 'incompatible' && Object.is(a.value, b.value);
  }
  return b.kind === 'blocked' && a.reason === b.reason && sameArray(a.at, b.at);
}
function sameField(a: FieldRuntimeSnapshot, b: FieldRuntimeSnapshot): boolean {
  return (
    a.key === b.key &&
    sameFieldPresence(a.presence, b.presence) &&
    a.dirty === b.dirty &&
    a.touched === b.touched &&
    a.focused === b.focused &&
    a.valid === b.valid &&
    a.showIssues === b.showIssues &&
    sameArray(a.issues, b.issues)
  );
}
function sameFieldPresence(
  a: FieldRuntimeSnapshot['presence'],
  b: FieldRuntimeSnapshot['presence'],
): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'missing') return true;
  if (a.kind === 'value')
    return b.kind === 'value' && Object.is(a.value, b.value);
  return b.kind === 'blocked' && a.reason === b.reason && sameArray(a.at, b.at);
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
      readonly nodeKeys: ReadonlySet<string>;
      readonly fieldKeys: ReadonlySet<string>;
      readonly includeGlobal: boolean;
      readonly diagnostics: readonly Diagnostic[];
    }
  | InvalidResult;
function parseScope(
  scope: unknown,
  nodes: ReadonlyMap<string, FormNodeDefinition>,
  descendantNodes: ReadonlyMap<string, ReadonlySet<string>>,
  descendantFields: ReadonlyMap<string, ReadonlySet<string>>,
  runtimeSnapshots: ReadonlyMap<string, RuntimeTreeSnapshot>,
): ParsedScope {
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
  const nodeKeys = new Set<string>();
  const fieldKeys = new Set<string>();
  const diagnostics: Diagnostic[] = [];
  const paths: readonly unknown[] = pathsEntry.value;
  for (let index = 0; index < paths.length; index += 1) {
    const pathEntry = read(paths, String(index));
    const path = pathEntry.kind === 'value' ? pathEntry.value : undefined;
    const staticKey = Array.isArray(path) ? managedPathKey(path) : undefined;
    const staticRuntime =
      staticKey === undefined ? undefined : runtimeSnapshots.get(staticKey);
    const stableNode =
      !Array.isArray(path) && isRecord(path)
        ? (() => {
            const relativePath = readOwnDataMember(path, 'relativePath');
            if (relativePath.kind !== 'missing') {
              const nodeAddress = copyCollectionNodeAddress(path);
              if (nodeAddress === undefined) return undefined;
              return nodeAddress.relativePath.length === 0
                ? runtimeSnapshots.get(
                    canonicalItemKey(
                      nodeAddress.collectionPath,
                      nodeAddress.itemId,
                    ),
                  )
                : runtimeSnapshots.get(
                    canonicalInstanceNodeKey(
                      nodeAddress.collectionPath,
                      nodeAddress.itemId,
                      nodeAddress.relativePath,
                    ),
                  );
            }
            const itemAddress = copyCollectionItemAddress(path);
            return itemAddress === undefined
              ? undefined
              : runtimeSnapshots.get(
                  canonicalItemKey(
                    itemAddress.collectionPath,
                    itemAddress.itemId,
                  ),
                );
          })()
        : undefined;
    if (
      (staticKey === undefined || !nodes.has(staticKey)) &&
      stableNode === undefined
    )
      diagnostics.push(
        runtimeDiagnostic(
          'UNKNOWN_SCOPE_PATH',
          { scopeId: id.value, path: copyPath(path) },
          'Scope path is not managed.',
          undefined,
          'warning',
        ),
      );
    else if (stableNode !== undefined) {
      collectScopeTree(stableNode, nodeKeys, fieldKeys);
    } else if (staticRuntime?.nodeKind === 'array') {
      collectScopeTree(staticRuntime, nodeKeys, fieldKeys);
    } else if (staticKey !== undefined) {
      for (const descendant of descendantNodes.get(staticKey) ?? EMPTY) {
        nodeKeys.add(descendant);
      }
      for (const descendant of descendantFields.get(staticKey) ?? EMPTY) {
        fieldKeys.add(descendant);
      }
    }
  }
  return {
    success: true,
    id: id.value,
    nodeKeys,
    fieldKeys,
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
  dataPath?: DataPath,
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
