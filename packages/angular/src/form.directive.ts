import {
  DestroyRef,
  Directive,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  type Signal,
} from '@angular/core';
import {
  createControlledFormRuntime,
  type ControlledFormRuntimeOptions,
  type DataPath,
  type Diagnostic,
  type FormOperation,
  type FormRuntime,
  type FormRuntimeSnapshot,
  type FormScope,
  type RuntimeActionResult,
  type ValidationSnapshot,
  type ValidationVisibility,
} from '@rabassoft/schema-engine';

export type AngularControlledFormConfig<TData extends object> =
  ControlledFormRuntimeOptions<TData>;

type RuntimeContext = Readonly<{ formId: string }>;
const runtimeContexts = new WeakMap<
  object,
  Signal<RuntimeContext | undefined>
>();

/** @internal */
export function readRuntimeContext(form: object): RuntimeContext | undefined {
  return runtimeContexts.get(form)?.();
}

@Directive({
  selector: '[schemaForm]',
  exportAs: 'schemaForm',
  standalone: true,
})
export class SchemaFormDirective<TData extends object> {
  readonly schemaForm = input.required<AngularControlledFormConfig<TData>>();
  readonly schemaOperation = output<FormOperation>();
  readonly schemaDiagnostics = output<readonly Diagnostic[]>();

  private readonly snapshotState = signal<
    FormRuntimeSnapshot<TData> | undefined
  >(undefined);
  private readonly runtimeContextState = signal<RuntimeContext | undefined>(
    undefined,
  );
  readonly snapshot: Signal<FormRuntimeSnapshot<TData> | undefined> =
    this.snapshotState.asReadonly();
  readonly ready = computed(() => this.snapshotState() !== undefined);

  private runtime: FormRuntime<TData> | undefined;
  private lastConfig: AngularControlledFormConfig<TData> | undefined;
  private unsubscribeSnapshot: (() => void) | undefined;
  private unsubscribeOperations: (() => void) | undefined;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    runtimeContexts.set(this, this.runtimeContextState.asReadonly());
    effect(() => this.synchronize(this.schemaForm()));
    this.destroyRef.onDestroy(() => {
      this.destroyRuntime();
      runtimeContexts.delete(this);
    });
  }

  requestSetValue(path: DataPath, value: unknown): RuntimeActionResult {
    return this.runAction('requestSetValue', path, value);
  }

  requestRemoveValue(path: DataPath): RuntimeActionResult {
    return this.runAction('requestRemoveValue', path);
  }

  focus(path: DataPath): RuntimeActionResult {
    return this.runAction('focus', path);
  }

  blur(path: DataPath): RuntimeActionResult {
    return this.runAction('blur', path);
  }

  resetTouched(scope?: FormScope): RuntimeActionResult {
    return this.runAction('resetTouched', scope);
  }

  setValidationVisibility(
    visibility: ValidationVisibility,
  ): RuntimeActionResult {
    return this.runAction('setValidationVisibility', visibility);
  }

  showValidationErrors(scope: FormScope): RuntimeActionResult {
    return this.runAction('showValidationErrors', scope);
  }

  hideValidationErrors(scopeId: string): RuntimeActionResult {
    return this.runAction('hideValidationErrors', scopeId);
  }

  getValidationSnapshot(scope?: FormScope): ValidationSnapshot | undefined {
    const result = this.runtime?.getValidationSnapshot(scope);
    if (result !== undefined) this.reportDiagnostics(result.diagnostics);
    return result;
  }

  reportDiagnostics(diagnostics: readonly Diagnostic[]): void {
    if (diagnostics.length > 0) this.schemaDiagnostics.emit(diagnostics);
  }

  private synchronize(config: AngularControlledFormConfig<TData>): void {
    const previous = this.lastConfig;
    if (
      this.runtime === undefined ||
      previous === undefined ||
      previous.formId !== config.formId ||
      previous.definition !== config.definition ||
      previous.schema !== config.schema ||
      previous.validator !== config.validator
    ) {
      this.replaceRuntime(config);
      return;
    }

    const update = this.runtime.updateExternalState({
      value: config.value,
      baselineValue: config.baselineValue,
      locale: config.locale,
    });
    this.reportDiagnostics(update.diagnostics);
    if (!update.success) return;

    const visibility = this.runtime.setValidationVisibility(
      config.validationVisibility ?? 'touched',
    );
    this.reportDiagnostics(visibility.diagnostics);
    if (visibility.success) this.lastConfig = config;
  }

  private replaceRuntime(config: AngularControlledFormConfig<TData>): void {
    const creation = createControlledFormRuntime(config);
    this.reportDiagnostics(creation.diagnostics);
    if (!creation.success) return;

    const snapshotSubscription = creation.runtime.subscribe((snapshot) => {
      this.snapshotState.set(snapshot);
    });
    const operationSubscription = creation.runtime.subscribeOperations(
      (operation) => this.schemaOperation.emit(operation),
    );
    if (!snapshotSubscription.success || !operationSubscription.success) {
      this.reportDiagnostics([
        ...snapshotSubscription.diagnostics,
        ...operationSubscription.diagnostics,
      ]);
      if (snapshotSubscription.success) snapshotSubscription.unsubscribe();
      if (operationSubscription.success) operationSubscription.unsubscribe();
      creation.runtime.dispose();
      return;
    }

    this.destroyRuntime();
    this.runtime = creation.runtime;
    this.unsubscribeSnapshot = snapshotSubscription.unsubscribe;
    this.unsubscribeOperations = operationSubscription.unsubscribe;
    this.lastConfig = config;
    this.snapshotState.set(creation.runtime.getSnapshot());
    this.runtimeContextState.set(Object.freeze({ formId: config.formId }));
  }

  private runAction(
    action:
      | 'requestSetValue'
      | 'requestRemoveValue'
      | 'focus'
      | 'blur'
      | 'resetTouched'
      | 'setValidationVisibility'
      | 'showValidationErrors'
      | 'hideValidationErrors',
    first?: unknown,
    second?: unknown,
  ): RuntimeActionResult {
    if (this.runtime === undefined) {
      const result = unavailableResult(action);
      this.reportDiagnostics(result.diagnostics);
      return result;
    }
    let result: RuntimeActionResult;
    switch (action) {
      case 'requestSetValue':
        result = this.runtime.requestSetValue(first as DataPath, second);
        break;
      case 'requestRemoveValue':
        result = this.runtime.requestRemoveValue(first as DataPath);
        break;
      case 'focus':
        result = this.runtime.focus(first as DataPath);
        break;
      case 'blur':
        result = this.runtime.blur(first as DataPath);
        break;
      case 'resetTouched':
        result = this.runtime.resetTouched(first as FormScope | undefined);
        break;
      case 'setValidationVisibility':
        result = this.runtime.setValidationVisibility(
          first as ValidationVisibility,
        );
        break;
      case 'showValidationErrors':
        result = this.runtime.showValidationErrors(first as FormScope);
        break;
      case 'hideValidationErrors':
        result = this.runtime.hideValidationErrors(first as string);
        break;
    }
    this.reportDiagnostics(result.diagnostics);
    return result;
  }

  private destroyRuntime(): void {
    this.unsubscribeSnapshot?.();
    this.unsubscribeOperations?.();
    this.runtime?.dispose();
    this.unsubscribeSnapshot = undefined;
    this.unsubscribeOperations = undefined;
    this.runtime = undefined;
    this.lastConfig = undefined;
    this.runtimeContextState.set(undefined);
  }
}

function unavailableResult(action: string): RuntimeActionResult {
  const diagnostic: Diagnostic = Object.freeze({
    code: 'RUNTIME_UNAVAILABLE',
    severity: 'error',
    source: 'runtime',
    parameters: Object.freeze({ action }),
    fallbackMessage: 'Angular form runtime is not available.',
  });
  return Object.freeze({
    success: false,
    effects: Object.freeze({
      snapshotChanged: false,
      operationEmitted: false,
    }),
    diagnostics: Object.freeze([diagnostic]),
  });
}
