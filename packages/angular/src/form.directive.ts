// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

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
  type WizardActionResult,
  type WizardIntention,
  type WizardSelectionConfirmation,
} from '@rabassoft/schema-engine';
import { SchemaPresentationOutletComponent } from './node-outlet.js';
import { SchemaWizardOutletComponent } from './wizard.js';
import { AngularPresentationContainerResolver } from './presentation-container.js';
import type { PresentationProjectionOwner } from './presentation-context.js';

export type AngularControlledFormConfig<TData extends object> = Omit<
  ControlledFormRuntimeOptions<TData>,
  'locale'
> & { readonly locale?: string };

type RuntimeContext = Readonly<{ formId: string }>;
interface ProjectedPresentation {
  readonly entry: PresentationEntryDefinition;
  readonly definition: FormDefinition;
  readonly snapshot: FormRuntimeSnapshot<object>;
  readonly owner: PresentationProjectionOwner;
  readonly locale: string;
}
const ROOT_PRESENTATION_OWNER: PresentationProjectionOwner = Object.freeze({
  kind: 'root',
});
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
  imports: [SchemaPresentationOutletComponent, SchemaWizardOutletComponent],
  template: `
    @if (wizardProjection(); as projected) {
      <schema-wizard-outlet
        [wizard]="projected.wizard"
        [definition]="projected.definition"
        [snapshot]="projected.snapshot"
      />
    } @else {
      @for (
        projected of projectedPresentation();
        track projected.entry.kind === 'form-node'
          ? projected.entry.node.key
          : projected.entry.key
      ) {
        <schema-presentation-outlet
          [entry]="projected.entry"
          [owner]="projected.owner"
          [definition]="projected.definition"
          [snapshot]="projected.snapshot"
          [locale]="projected.locale"
        />
      }
    }
    <ng-content />
  `,
})
export class SchemaFormDirective<TData extends object> {
  readonly schemaForm = input.required<AngularControlledFormConfig<TData>>();
  readonly schemaOperation = output<FormOperation>();
  readonly schemaWizardIntention = output<WizardIntention>();
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
  protected readonly wizardProjection = computed(() => {
    const definition = this.acceptedDefinitionState();
    const snapshot = this.snapshotState();
    const root = definition?.presentation[0];
    return definition !== undefined &&
      snapshot?.wizard !== undefined &&
      definition.presentation.length === 1 &&
      root?.kind === 'wizard'
      ? Object.freeze({ wizard: root, definition, snapshot })
      : undefined;
  });
  protected readonly projectedPresentation = computed<
    readonly ProjectedPresentation[]
  >(() => {
    const definition = this.acceptedDefinitionState();
    const snapshot = this.snapshotState();
    if (
      definition === undefined ||
      snapshot === undefined ||
      this.presentationContainerResolver?.ready === false
    )
      return [];
    return Object.freeze(
      definition.presentation.flatMap((entry) =>
        entry.kind === 'wizard'
          ? []
          : [
              Object.freeze({
                entry,
                definition,
                snapshot,
                owner: ROOT_PRESENTATION_OWNER,
                locale: snapshot.locale,
              }),
            ],
      ),
    );
  });

  private runtime: FormRuntime<TData> | undefined;
  private lastConfig: AngularControlledFormConfig<TData> | undefined;
  private unsubscribeSnapshot: (() => void) | undefined;
  private unsubscribeOperations: (() => void) | undefined;
  private unsubscribeWizardIntentions: (() => void) | undefined;
  private readonly destroyRef = inject(DestroyRef);
  private readonly defaultLocale = inject(LOCALE_ID);
  private readonly presentationContainerResolver = inject(
    AngularPresentationContainerResolver,
    { optional: true },
  );

  constructor() {
    runtimeContexts.set(this, this.runtimeContextState.asReadonly());
    if (this.presentationContainerResolver?.ready === false)
      queueMicrotask(() =>
        this.reportDiagnostics(
          this.presentationContainerResolver?.configurationDiagnostics ?? [],
        ),
      );
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

  retryAsyncValidation(): RuntimeActionResult {
    return this.runAction('retryAsyncValidation');
  }

  requestWizardPrevious(): WizardActionResult {
    return this.runWizardAction('previous');
  }

  requestWizardNext(): WizardActionResult {
    return this.runWizardAction('next');
  }

  requestWizardComplete(): WizardActionResult {
    return this.runWizardAction('complete');
  }

  rejectWizardIntention(requestId: number): WizardActionResult {
    if (this.runtime === undefined)
      return unavailableWizardResult('rejectWizardIntention');
    const result = this.runtime.rejectWizardIntention(requestId);
    this.reportDiagnostics(result.diagnostics);
    return result;
  }

  confirmWizardSelection(
    confirmation: WizardSelectionConfirmation,
  ): RuntimeActionResult {
    if (this.runtime === undefined) {
      const result = unavailableResult('confirmWizardSelection');
      this.reportDiagnostics(result.diagnostics);
      return result;
    }
    const result = this.runtime.updateExternalState({
      wizardSelection: confirmation,
    });
    this.reportDiagnostics(result.diagnostics);
    return result;
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
      previous.validator !== config.validator ||
      previous.asyncValidator !== config.asyncValidator
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
    const wizardSubscription = creation.runtime.subscribeWizardIntentions(
      (intention) => this.schemaWizardIntention.emit(intention),
    );
    if (
      !snapshotSubscription.success ||
      !operationSubscription.success ||
      !wizardSubscription.success
    ) {
      this.reportDiagnostics([
        ...snapshotSubscription.diagnostics,
        ...operationSubscription.diagnostics,
        ...wizardSubscription.diagnostics,
      ]);
      if (snapshotSubscription.success) snapshotSubscription.unsubscribe();
      if (operationSubscription.success) operationSubscription.unsubscribe();
      if (wizardSubscription.success) wizardSubscription.unsubscribe();
      creation.runtime.dispose();
      return;
    }

    this.destroyRuntime();
    this.runtime = creation.runtime;
    this.unsubscribeSnapshot = snapshotSubscription.unsubscribe;
    this.unsubscribeOperations = operationSubscription.unsubscribe;
    this.unsubscribeWizardIntentions = wizardSubscription.unsubscribe;
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
      | 'hideValidationErrors'
      | 'retryAsyncValidation',
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
      case 'retryAsyncValidation':
        result = this.runtime.retryAsyncValidation();
        break;
    }
    this.reportDiagnostics(result.diagnostics);
    return result;
  }

  private destroyRuntime(): void {
    this.unsubscribeSnapshot?.();
    this.unsubscribeOperations?.();
    this.unsubscribeWizardIntentions?.();
    this.runtime?.dispose();
    this.unsubscribeSnapshot = undefined;
    this.unsubscribeOperations = undefined;
    this.unsubscribeWizardIntentions = undefined;
    this.runtime = undefined;
    this.lastConfig = undefined;
    this.acceptedDefinitionState.set(undefined);
    this.snapshotState.set(undefined);
    this.runtimeContextState.set(undefined);
  }

  private runWizardAction(
    action: 'previous' | 'next' | 'complete',
  ): WizardActionResult {
    if (this.runtime === undefined)
      return unavailableWizardResult(`requestWizard${action}`);
    const result =
      action === 'previous'
        ? this.runtime.requestWizardPrevious()
        : action === 'next'
          ? this.runtime.requestWizardNext()
          : this.runtime.requestWizardComplete();
    this.reportDiagnostics(result.diagnostics);
    return result;
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

function unavailableWizardResult(action: string): WizardActionResult {
  const base = unavailableResult(action);
  return Object.freeze({
    success: false,
    effects: Object.freeze({
      snapshotChanged: false,
      intentionEmitted: false,
    }),
    diagnostics: base.diagnostics,
  });
}
