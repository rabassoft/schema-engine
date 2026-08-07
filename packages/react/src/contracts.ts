// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import type {
  CollectionItemAddress,
  CollectionNodeAddress,
  CollectionPlacement,
  ControlledFormRuntimeOptions,
  DataPath,
  Diagnostic,
  FieldDefinition,
  FieldRuntimeSnapshot,
  FieldTemplate,
  FormOperation,
  FormRuntimeSnapshot,
  FormScope,
  ItemRuntimeSnapshot,
  RuntimeActionResult,
  RuntimeTreeSnapshot,
  TextResolver,
  ValidationSnapshot,
  ValidationVisibility,
  WizardActionResult,
  WizardIntention,
  WizardSelectionConfirmation,
} from '@rabassoft/schema-engine';
import type { ComponentType } from 'react';
import type { internalReactFormHandleBrand } from './internal/handle.js';
import type { internalReactRendererRegistryBrand } from './internal/registry-brand.js';

export interface ReactControlledFormConfig<
  TData extends object,
> extends ControlledFormRuntimeOptions<TData> {
  readonly onOperation: (operation: FormOperation) => void;
  readonly onWizardIntention: (intention: WizardIntention) => void;
  readonly onDiagnostics?: (diagnostics: readonly Diagnostic[]) => void;
  readonly textResolver?: TextResolver;
}

export type ReactFormState<TData extends object> =
  | {
      readonly status: 'initializing';
      readonly snapshot?: never;
      readonly diagnostics: readonly [];
    }
  | {
      readonly status: 'ready';
      readonly snapshot: FormRuntimeSnapshot<TData>;
      readonly diagnostics: readonly [];
    }
  | {
      readonly status: 'error';
      readonly snapshot?: never;
      readonly diagnostics: readonly [Diagnostic, ...Diagnostic[]];
    };

export interface ReactFormHandle<TData extends object> {
  readonly state: ReactFormState<TData>;
  readonly actions: ReactFormActions;
  readonly [internalReactFormHandleBrand]: true;
}

type ReadResult<TValue> =
  | {
      readonly success: true;
      readonly value: TValue;
      readonly diagnostics: readonly [];
    }
  | {
      readonly success: false;
      readonly value?: never;
      readonly diagnostics: readonly [Diagnostic];
    };

export interface ReactFormActions {
  getFieldSnapshot(
    path: DataPath,
  ): ReadResult<FieldRuntimeSnapshot | undefined>;
  getNodeSnapshot(path: DataPath): ReadResult<RuntimeTreeSnapshot | undefined>;
  getItemSnapshot(
    address: CollectionItemAddress,
  ): ReadResult<ItemRuntimeSnapshot | undefined>;
  getCollectionNodeSnapshot(
    address: CollectionNodeAddress,
  ): ReadResult<RuntimeTreeSnapshot | undefined>;
  requestSetValue(path: DataPath, value: unknown): RuntimeActionResult;
  requestRemoveValue(path: DataPath): RuntimeActionResult;
  requestSetItemValue(
    target: CollectionNodeAddress,
    value: unknown,
  ): RuntimeActionResult;
  requestRemoveItemValue(target: CollectionNodeAddress): RuntimeActionResult;
  requestInsertItem(
    collectionPath: readonly string[],
    itemId: string,
    item: unknown,
    placement: CollectionPlacement,
  ): RuntimeActionResult;
  requestRemoveItem(address: CollectionItemAddress): RuntimeActionResult;
  requestMoveItem(
    address: CollectionItemAddress,
    placement: CollectionPlacement,
  ): RuntimeActionResult;
  focus(target: DataPath | CollectionNodeAddress): RuntimeActionResult;
  blur(target: DataPath | CollectionNodeAddress): RuntimeActionResult;
  resetTouched(scope?: FormScope): RuntimeActionResult;
  setValidationVisibility(
    visibility: ValidationVisibility,
  ): RuntimeActionResult;
  getValidationSnapshot(scope?: FormScope): ReadResult<ValidationSnapshot>;
  showValidationErrors(scope: FormScope): RuntimeActionResult;
  hideValidationErrors(scopeId: string): RuntimeActionResult;
  retryAsyncValidation(): RuntimeActionResult;
  requestWizardPrevious(): WizardActionResult;
  requestWizardNext(): WizardActionResult;
  requestWizardComplete(): WizardActionResult;
  rejectWizardIntention(requestId: number): WizardActionResult;
  confirmWizardSelection(
    confirmation: WizardSelectionConfirmation,
  ): RuntimeActionResult;
}

export interface SchemaFormProps<TData extends object> {
  readonly form: ReactFormHandle<TData>;
  readonly rendererRegistry: ReactRendererRegistry;
}

export interface ReactFieldTextSnapshot {
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly clearLabel: string;
  readonly setNullLabel: string;
  readonly nullValueLabel: string;
  readonly fixedMissingLabel: string;
  readonly fixedUnavailableLabel: string;
  readonly fixedIncompatibleLabel: string;
  readonly choiceLabels: readonly string[];
  readonly missingSelectionLabel: string;
  readonly emptySelectionLabel: string;
  readonly issueMessages: readonly string[];
}

export interface ReactFieldRendererProps {
  readonly field: FieldDefinition | FieldTemplate;
  readonly snapshot: FieldRuntimeSnapshot;
  readonly formId: string;
  readonly locale: string;
  readonly texts: ReactFieldTextSnapshot;
  readonly setValue: (value: unknown) => RuntimeActionResult;
  readonly removeValue: () => RuntimeActionResult;
  readonly fieldFocus: () => RuntimeActionResult;
  readonly fieldBlur: () => RuntimeActionResult;
  readonly rendererDiagnostics: (diagnostics: readonly Diagnostic[]) => void;
}

export type ReactRendererComponent = ComponentType<ReactFieldRendererProps>;
export type ReactRendererTester = (
  field: FieldDefinition | FieldTemplate,
) => number | null;

export interface ReactRendererRegistration {
  readonly id: string;
  readonly component: ReactRendererComponent;
  readonly tester: ReactRendererTester;
  readonly priority?: number;
}

export interface ReactRendererRegistry {
  readonly [internalReactRendererRegistryBrand]: true;
}

export type ReactRendererRegistryResult =
  | {
      readonly success: true;
      readonly registry: ReactRendererRegistry;
      readonly diagnostics: readonly [];
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly [Diagnostic, ...Diagnostic[]];
    };
