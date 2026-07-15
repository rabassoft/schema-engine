import {
  DestroyRef,
  Component,
  LOCALE_ID,
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
  type CollectionItemAddress,
  type CollectionNodeAddress,
  type CollectionPlacement,
  type ControlledFormRuntimeOptions,
  type DataPath,
  type Diagnostic,
  type FormOperation,
  type FormDefinition,
  type PresentationEntryDefinition,
  type FormRuntime,
  type FormRuntimeSnapshot,
  type FormScope,
  type ItemRuntimeSnapshot,
  type RuntimeTreeSnapshot,
  type RuntimeActionResult,
  type ValidationSnapshot,
  type ValidationVisibility,
} from '@rabassoft/schema-engine';
import { SchemaPresentationOutletComponent } from './node-outlet.js';

export type AngularControlledFormConfig<TData extends object> = Omit<
  ControlledFormRuntimeOptions<TData>,
  'locale'
> & { readonly locale?: string };

type RuntimeContext = Readonly<{ formId: string }>;
interface ProjectedPresentation {
  readonly entry: PresentationEntryDefinition;
  readonly definition: FormDefinition;
  readonly snapshot: FormRuntimeSnapshot<object>;
}
const runtimeContexts = new WeakMap<
  object,
  Signal<RuntimeContext | undefined>
>();

/** @internal */
export function readRuntimeContext(form: object): RuntimeContext | undefined {
  return runtimeContexts.get(form)?.();
}

@Component({
  selector: '[schemaForm]',
  exportAs: 'schemaForm',
  standalone: true,
  imports: [SchemaPresentationOutletComponent],
  template: `
    @for (
      projected of projectedPresentation();
      track projected.entry.kind === 'section'
        ? projected.entry.key
        : projected.entry.node.key
    ) {
      <schema-presentation-outlet
        [entry]="projected.entry"
        [definition]="projected.definition"
        [snapshot]="projected.snapshot"
      />
    }
    <ng-content />
  `,
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
  private readonly acceptedDefinitionState = signal<
    AngularControlledFormConfig<TData>['definition'] | undefined
  >(undefined);
  readonly snapshot: Signal<FormRuntimeSnapshot<TData> | undefined> =
    this.snapshotState.asReadonly();
  readonly ready = computed(() => this.snapshotState() !== undefined);
  protected readonly projectedPresentation = computed<
    readonly ProjectedPresentation[]
  >(() => {
    const definition = this.acceptedDefinitionState();
    const snapshot = this.snapshotState();
    if (definition === undefined || snapshot === undefined) return [];
    return Object.freeze(
      definition.presentation.map((entry) =>
        Object.freeze({
          entry,
          definition,
          snapshot,
        }),
      ),
    );
  });

  private runtime: FormRuntime<TData> | undefined;
  private lastConfig: AngularControlledFormConfig<TData> | undefined;
  private unsubscribeSnapshot: (() => void) | undefined;
  private unsubscribeOperations: (() => void) | undefined;
  private readonly destroyRef = inject(DestroyRef);
  private readonly defaultLocale = inject(LOCALE_ID);

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

  getItemSnapshot(
    address: CollectionItemAddress,
  ): ItemRuntimeSnapshot | undefined {
    return this.runtime?.getItemSnapshot(address);
  }

  getCollectionNodeSnapshot(
    address: CollectionNodeAddress,
  ): RuntimeTreeSnapshot | undefined {
    return this.runtime?.getCollectionNodeSnapshot(address);
  }

  requestSetItemValue(
    target: CollectionNodeAddress,
    value: unknown,
  ): RuntimeActionResult {
    return this.runAction('requestSetItemValue', target, value);
  }

  requestRemoveItemValue(target: CollectionNodeAddress): RuntimeActionResult {
    return this.runAction('requestRemoveItemValue', target);
  }

  requestInsertItem(
    collectionPath: readonly string[],
    itemId: string,
    item: unknown,
    placement: CollectionPlacement,
  ): RuntimeActionResult {
    return this.runAction('requestInsertItem', {
      collectionPath,
      itemId,
      item,
      placement,
    });
  }

  requestRemoveItem(address: CollectionItemAddress): RuntimeActionResult {
    return this.runAction('requestRemoveItem', address);
  }

  requestMoveItem(
    address: CollectionItemAddress,
    placement: CollectionPlacement,
  ): RuntimeActionResult {
    return this.runAction('requestMoveItem', address, placement);
  }

  focus(target: DataPath | CollectionNodeAddress): RuntimeActionResult {
    return this.runAction('focus', target);
  }

  blur(target: DataPath | CollectionNodeAddress): RuntimeActionResult {
    return this.runAction('blur', target);
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
    const locale = config.locale ?? this.defaultLocale;
    const previous = this.lastConfig;
    if (
      this.runtime === undefined ||
      previous === undefined ||
      previous.formId !== config.formId ||
      previous.definition !== config.definition ||
      previous.schema !== config.schema ||
      previous.validator !== config.validator
    ) {
      this.replaceRuntime(config, locale);
      return;
    }

    const update = this.runtime.updateExternalState({
      value: config.value,
      baselineValue: config.baselineValue,
      locale,
    });
    this.reportDiagnostics(update.diagnostics);
    if (!update.success) return;

    const visibility = this.runtime.setValidationVisibility(
      config.validationVisibility ?? 'touched',
    );
    this.reportDiagnostics(visibility.diagnostics);
    if (visibility.success) {
      this.lastConfig = config;
    }
  }

  private replaceRuntime(
    config: AngularControlledFormConfig<TData>,
    locale: string,
  ): void {
    const creation = createControlledFormRuntime({ ...config, locale });
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
    this.acceptedDefinitionState.set(config.definition);
    this.snapshotState.set(creation.runtime.getSnapshot());
    this.runtimeContextState.set(Object.freeze({ formId: config.formId }));
  }

  private runAction(
    action:
      | 'requestSetValue'
      | 'requestRemoveValue'
      | 'requestSetItemValue'
      | 'requestRemoveItemValue'
      | 'requestInsertItem'
      | 'requestRemoveItem'
      | 'requestMoveItem'
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
      case 'requestSetItemValue':
        result = this.runtime.requestSetItemValue(
          first as CollectionNodeAddress,
          second,
        );
        break;
      case 'requestRemoveItemValue':
        result = this.runtime.requestRemoveItemValue(
          first as CollectionNodeAddress,
        );
        break;
      case 'requestInsertItem': {
        const request = first as {
          readonly collectionPath: readonly string[];
          readonly itemId: string;
          readonly item: unknown;
          readonly placement: CollectionPlacement;
        };
        result = this.runtime.requestInsertItem(
          request.collectionPath,
          request.itemId,
          request.item,
          request.placement,
        );
        break;
      }
      case 'requestRemoveItem':
        result = this.runtime.requestRemoveItem(first as CollectionItemAddress);
        break;
      case 'requestMoveItem':
        result = this.runtime.requestMoveItem(
          first as CollectionItemAddress,
          second as CollectionPlacement,
        );
        break;
      case 'focus':
        result = this.runtime.focus(first as DataPath | CollectionNodeAddress);
        break;
      case 'blur':
        result = this.runtime.blur(first as DataPath | CollectionNodeAddress);
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
    this.acceptedDefinitionState.set(undefined);
    this.snapshotState.set(undefined);
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
