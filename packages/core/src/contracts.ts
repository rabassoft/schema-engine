// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

export type PathSegment = string | number;
export type DataPath = readonly PathSegment[];
export type DocumentPath = readonly (string | number)[];

export interface UiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
  readonly presentation?: readonly UiPresentationEntry[];
}

export type UiPresentationEntry =
  string | UiSectionSchema | UiTabsSchema | UiAccordionSchema | UiGridSchema;

export interface UiSectionSchema {
  readonly kind: 'section';
  readonly id: string;
  readonly label: string;
  readonly children: readonly UiPresentationEntry[];
}

export interface UiTabsSchema {
  readonly kind: 'tabs';
  readonly id: string;
  readonly label: string;
  readonly panels: readonly UiPresentationPanelSchema[];
}

export interface UiAccordionSchema {
  readonly kind: 'accordion';
  readonly id: string;
  readonly label: string;
  readonly panels: readonly UiPresentationPanelSchema[];
}

export interface UiPresentationPanelSchema {
  readonly kind: 'panel';
  readonly id: string;
  readonly label: string;
  readonly children: readonly UiPresentationEntry[];
}

export interface UiGridSchema {
  readonly kind: 'grid';
  readonly id: string;
  readonly label: string;
  readonly columns: 1 | 2 | 3 | 4;
  readonly items: readonly UiGridItemSchema[];
}

export interface UiGridItemSchema {
  readonly span?: 1 | 2 | 3 | 4;
  readonly child: UiPresentationEntry;
}

export type UiNodeSchema = ObjectUiSchema | ArrayUiSchema | FieldUiSchema;

export interface ObjectUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
  readonly presentation?: readonly UiPresentationEntry[];
}

export interface ArrayUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly item?: ItemUiSchema;
}

export interface ItemUiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
  readonly presentation?: readonly UiPresentationEntry[];
}

export interface FieldUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly enumLabels?: Readonly<Record<string, string>>;
  readonly options?: {
    readonly decimalPlaces?: number;
    readonly showTrailingZeros?: boolean;
  };
}

export interface FormDefinition {
  readonly nodes: readonly FormNodeDefinition[];
  readonly fields: readonly FieldDefinition[];
  readonly presentation: readonly PresentationEntryDefinition[];
}

export type PresentationEntryDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> =
  | PresentedFormNodeDefinition<TNode>
  | PresentationSectionDefinition<TNode>
  | PresentationTabsDefinition<TNode>
  | PresentationAccordionDefinition<TNode>
  | PresentationGridDefinition<TNode>;

export interface PresentedFormNodeDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'form-node';
  readonly node: TNode;
}

export interface PresentationSectionDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'section';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly children: readonly PresentationEntryDefinition<TNode>[];
}

export interface PresentationTabsDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'tabs';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly panels: readonly PresentationPanelDefinition<TNode>[];
}

export interface PresentationAccordionDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'accordion';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly panels: readonly PresentationPanelDefinition<TNode>[];
}

export interface PresentationPanelDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'panel';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly children: readonly PresentationEntryDefinition<TNode>[];
}

export interface PresentationGridDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'grid';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly columns: 1 | 2 | 3 | 4;
  readonly items: readonly PresentationGridItemDefinition<TNode>[];
}

export interface PresentationGridItemDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'grid-item';
  readonly key: string;
  readonly span: 1 | 2 | 3 | 4;
  readonly child: PresentationEntryDefinition<TNode>;
}

export type TemplatePresentationEntryDefinition =
  PresentationEntryDefinition<FormNodeTemplate>;

export interface BaseNodeDefinition {
  readonly key: string;
  readonly name: string;
  readonly path: DataPath;
  readonly required: boolean;
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
}

export interface ObjectFieldDefinition extends BaseNodeDefinition {
  readonly kind: 'object';
  readonly children: readonly FormNodeDefinition[];
  readonly presentation: readonly PresentationEntryDefinition[];
}

export type FormNodeDefinition =
  ObjectFieldDefinition | ArrayNodeDefinition | FieldDefinition;

export interface BaseFieldDefinition extends BaseNodeDefinition {
  readonly nullable: boolean;
  readonly placeholder?: string;
}

export interface StringChoiceDefinition {
  readonly value: string;
  readonly label: string;
}

export interface StringFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'string';
  readonly constraints: {
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly pattern?: string;
  };
  readonly choices?: readonly StringChoiceDefinition[];
}

export interface NumberFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'number';
  readonly numericType: 'number' | 'integer';
  readonly constraints: {
    readonly minimum?: number;
    readonly maximum?: number;
    readonly multipleOf?: number;
  };
  readonly ui: {
    readonly decimalPlaces?: number;
    readonly showTrailingZeros?: boolean;
  };
}

export interface BooleanFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'boolean';
}

export type FieldDefinition =
  StringFieldDefinition | NumberFieldDefinition | BooleanFieldDefinition;

export interface ItemIdentityDefinition {
  readonly property: string;
}

export interface BaseNodeTemplate {
  readonly key: string;
  readonly name: string;
  readonly relativePath: readonly string[];
  readonly required: boolean;
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
}

export interface ObjectNodeTemplate extends BaseNodeTemplate {
  readonly kind: 'object';
  readonly children: readonly FormNodeTemplate[];
  readonly presentation: readonly TemplatePresentationEntryDefinition[];
}

export type FieldTemplate =
  | (Omit<StringFieldDefinition, keyof BaseNodeDefinition> & BaseNodeTemplate)
  | (Omit<NumberFieldDefinition, keyof BaseNodeDefinition> & BaseNodeTemplate)
  | (Omit<BooleanFieldDefinition, keyof BaseNodeDefinition> & BaseNodeTemplate);

export type FormNodeTemplate = ObjectNodeTemplate | FieldTemplate;

export interface ObjectItemTemplateDefinition {
  readonly kind: 'item-template';
  readonly children: readonly FormNodeTemplate[];
  readonly fields: readonly FieldTemplate[];
  readonly presentation: readonly TemplatePresentationEntryDefinition[];
}

export interface ArrayNodeDefinition extends BaseNodeDefinition {
  readonly kind: 'array';
  readonly identity: ItemIdentityDefinition;
  readonly item: ObjectItemTemplateDefinition;
}

export interface Diagnostic {
  readonly code: string;
  readonly severity: 'warning' | 'error';
  readonly source: 'schema' | 'ui-schema' | 'runtime';
  readonly dataPath?: DataPath;
  readonly documentPath?: DocumentPath;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly fallbackMessage?: string;
}

export type CompileFormResult =
  | {
      readonly success: true;
      readonly definition: FormDefinition;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly Diagnostic[];
    };

export interface CompileFormDefinitionInput {
  readonly schema: unknown;
  readonly uiSchema?: unknown;
  readonly collectionPolicies?: readonly CollectionPolicy[];
}

export interface CollectionPolicy {
  readonly path: readonly string[];
  readonly itemIdentityProperty: string;
}

export type OperationExpectation =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown };

export interface FormOperationMetadata {
  readonly id: number;
  readonly formId: string;
}

export interface SetValueOperation {
  readonly type: 'set-value';
  readonly metadata: FormOperationMetadata;
  readonly path: DataPath;
  readonly expected: OperationExpectation;
  readonly value: unknown;
  readonly source: 'user';
}

export interface RemoveValueOperation {
  readonly type: 'remove-value';
  readonly metadata: FormOperationMetadata;
  readonly path: DataPath;
  readonly expected: { readonly kind: 'value'; readonly value: unknown };
  readonly source: 'user';
}

export interface CollectionItemAddress {
  readonly collectionPath: readonly string[];
  readonly itemId: string;
}

export interface CollectionNodeAddress extends CollectionItemAddress {
  readonly relativePath: readonly string[];
}

export type CollectionPlacement =
  | { readonly kind: 'start' }
  | { readonly kind: 'end' }
  | { readonly kind: 'before'; readonly itemId: string }
  | { readonly kind: 'after'; readonly itemId: string };

export interface SetItemValueOperation {
  readonly type: 'set-item-value';
  readonly metadata: FormOperationMetadata;
  readonly target: CollectionNodeAddress;
  readonly identityProperty: string;
  readonly expected: OperationExpectation;
  readonly value: unknown;
  readonly source: 'user';
}

export interface RemoveItemValueOperation {
  readonly type: 'remove-item-value';
  readonly metadata: FormOperationMetadata;
  readonly target: CollectionNodeAddress;
  readonly identityProperty: string;
  readonly expected: { readonly kind: 'value'; readonly value: unknown };
  readonly source: 'user';
}

export interface InsertItemOperation {
  readonly type: 'insert-item';
  readonly metadata: FormOperationMetadata;
  readonly collectionPath: readonly string[];
  readonly identityProperty: string;
  readonly itemId: string;
  readonly item: unknown;
  readonly placement: CollectionPlacement;
  readonly source: 'user';
}

export interface RemoveItemOperation {
  readonly type: 'remove-item';
  readonly metadata: FormOperationMetadata;
  readonly collectionPath: readonly string[];
  readonly identityProperty: string;
  readonly itemId: string;
  readonly source: 'user';
}

export interface MoveItemOperation {
  readonly type: 'move-item';
  readonly metadata: FormOperationMetadata;
  readonly collectionPath: readonly string[];
  readonly identityProperty: string;
  readonly itemId: string;
  readonly placement: CollectionPlacement;
  readonly source: 'user';
}

export type FormOperation =
  | SetValueOperation
  | RemoveValueOperation
  | SetItemValueOperation
  | RemoveItemValueOperation
  | InsertItemOperation
  | RemoveItemOperation
  | MoveItemOperation;

export type ApplyOperationResult<TData extends object> =
  | {
      readonly success: true;
      readonly value: Readonly<TData>;
      readonly changed: boolean;
      readonly diagnostics: readonly [];
    }
  | {
      readonly success: false;
      readonly value: Readonly<TData>;
      readonly changed: false;
      readonly diagnostics: readonly Diagnostic[];
    };

export interface ValidationIssue {
  readonly code: string;
  readonly path: DataPath;
  readonly keyword?: string;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly fallbackMessage?: string;
}
export type FieldTextMember =
  | 'label'
  | 'description'
  | 'hint'
  | 'tooltip'
  | 'placeholder'
  | 'clear'
  | 'set-null'
  | 'null-value'
  | 'choice'
  | 'issue';
export type ObjectTextMember =
  'label' | 'description' | 'hint' | 'tooltip' | 'issue';
export type CollectionTextMember =
  | 'identity-error'
  | 'item-label'
  | 'remove-item'
  | 'move-item-earlier'
  | 'move-item-later'
  | 'issue';
export type SectionTextMember = 'label';
export type AdvancedPresentationTextMember = 'label';
export type AdvancedPresentationLabelDefinition =
  | PresentationTabsDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationAccordionDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationPanelDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationGridDefinition<FormNodeDefinition | FormNodeTemplate>;
export type FieldTextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition | FieldTemplate;
      readonly member: Exclude<FieldTextMember, 'choice' | 'issue'>;
      readonly choice?: never;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition | FieldTemplate;
      readonly member: 'choice';
      readonly choice: StringChoiceDefinition;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition | FieldTemplate;
      readonly member: 'issue';
      readonly choice?: never;
      readonly issue: ValidationIssue;
    };
export type ObjectTextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly node: ObjectFieldDefinition | ArrayNodeDefinition;
      readonly member: Exclude<ObjectTextMember, 'issue'>;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly node: ObjectFieldDefinition | ArrayNodeDefinition;
      readonly member: 'issue';
      readonly issue: ValidationIssue;
    };
export type CollectionTextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly collection: ArrayNodeDefinition;
      readonly member: 'identity-error';
      readonly item?: never;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly collection: ArrayNodeDefinition;
      readonly item: ItemRuntimeSnapshot;
      readonly member: Exclude<
        CollectionTextMember,
        'identity-error' | 'issue'
      >;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly collection: ArrayNodeDefinition;
      readonly item: ItemRuntimeSnapshot;
      readonly member: 'issue';
      readonly issue: ValidationIssue;
    };
export interface SectionTextResolutionContext {
  readonly formId: string;
  readonly locale: string;
  readonly section: PresentationSectionDefinition<
    FormNodeDefinition | FormNodeTemplate
  >;
  readonly member: SectionTextMember;
}
export interface AdvancedPresentationTextResolutionContext {
  readonly formId: string;
  readonly locale: string;
  readonly presentation: AdvancedPresentationLabelDefinition;
  readonly member: AdvancedPresentationTextMember;
}
export type TextResolutionContext =
  | FieldTextResolutionContext
  | ObjectTextResolutionContext
  | CollectionTextResolutionContext
  | SectionTextResolutionContext
  | AdvancedPresentationTextResolutionContext;
export interface TextResolver {
  resolve(text: string, context: TextResolutionContext): string;
}
export interface ValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}
export interface SchemaValidator {
  validate(schema: unknown, value: unknown): ValidationResult;
}
export type ValidationVisibility = 'touched' | 'all';
export interface ControlledExternalState<TData extends object> {
  readonly value: Readonly<TData>;
  readonly baselineValue: Readonly<TData>;
  readonly locale: string;
}
export interface ControlledFormRuntimeOptions<
  TData extends object,
> extends ControlledExternalState<TData> {
  readonly formId: string;
  readonly definition: FormDefinition;
  readonly schema: unknown;
  readonly validator: SchemaValidator;
  readonly validationVisibility?: ValidationVisibility;
}
export interface ExternalStateUpdate<TData extends object> {
  readonly value?: Readonly<TData>;
  readonly baselineValue?: Readonly<TData>;
  readonly locale?: string;
}
export interface RuntimeActionResult {
  readonly success: boolean;
  readonly effects: {
    readonly snapshotChanged: boolean;
    readonly operationEmitted: boolean;
  };
  readonly diagnostics: readonly Diagnostic[];
}
export type ObjectPresence =
  | { readonly kind: 'missing' }
  | { readonly kind: 'object' }
  | { readonly kind: 'incompatible'; readonly value: unknown }
  | {
      readonly kind: 'blocked';
      readonly reason: 'missing-ancestor' | 'incompatible-ancestor';
      readonly at: DataPath;
    };
export type FieldPresence =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown }
  | {
      readonly kind: 'blocked';
      readonly reason: 'missing-ancestor' | 'incompatible-ancestor';
      readonly at: DataPath;
    };
export type ArrayPresence =
  | { readonly kind: 'missing' }
  | { readonly kind: 'array' }
  | { readonly kind: 'incompatible'; readonly value: unknown }
  | {
      readonly kind: 'blocked';
      readonly reason: 'missing-ancestor' | 'incompatible-ancestor';
      readonly at: DataPath;
    };
export type CollectionIdentityState =
  | { readonly kind: 'valid' }
  | {
      readonly kind: 'invalid';
      readonly reason:
        | 'sparse-item'
        | 'non-object-item'
        | 'missing-identity'
        | 'identity-accessor'
        | 'non-string-identity'
        | 'blank-identity'
        | 'duplicate-identity';
      readonly index: number;
      readonly firstIndex?: number;
    };
export interface FieldRuntimeSnapshot {
  readonly nodeKind: 'field';
  readonly key: string;
  readonly path: DataPath;
  readonly presence: FieldPresence;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
}
export interface ObjectRuntimeSnapshot {
  readonly nodeKind: 'object';
  readonly key: string;
  readonly path: DataPath;
  readonly presence: ObjectPresence;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
  readonly children: readonly NodeRuntimeSnapshot[];
}
export interface ArrayRuntimeSnapshot {
  readonly nodeKind: 'array';
  readonly key: string;
  readonly path: readonly string[];
  readonly presence: ArrayPresence;
  readonly identityState: CollectionIdentityState;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
  readonly items: readonly ItemRuntimeSnapshot[];
}
export interface ItemRuntimeSnapshot {
  readonly nodeKind: 'item';
  readonly key: string;
  readonly address: CollectionItemAddress;
  readonly index: number;
  readonly dataPath: DataPath;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
  readonly children: readonly NodeRuntimeSnapshot[];
  readonly fields: readonly FieldRuntimeSnapshot[];
}
export type RuntimeTreeSnapshot = NodeRuntimeSnapshot | ItemRuntimeSnapshot;
export type NodeRuntimeSnapshot =
  ObjectRuntimeSnapshot | ArrayRuntimeSnapshot | FieldRuntimeSnapshot;
export interface FormRuntimeSnapshot<TData extends object> {
  readonly value: Readonly<TData>;
  readonly locale: string;
  readonly valid: boolean;
  readonly dirty: boolean;
  readonly validationVisibility: ValidationVisibility;
  readonly nodes: readonly NodeRuntimeSnapshot[];
  readonly fields: readonly FieldRuntimeSnapshot[];
  readonly globalIssues: readonly ValidationIssue[];
}
export interface FormScope {
  readonly id: string;
  readonly paths: readonly FormScopeTarget[];
  readonly includeGlobalIssues?: boolean;
}
export type FormScopeTarget =
  DataPath | CollectionItemAddress | CollectionNodeAddress;
export interface ValidationSnapshot {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly diagnostics: readonly Diagnostic[];
}
export type SnapshotListener<TData extends object> = (
  snapshot: FormRuntimeSnapshot<TData>,
) => void;
export type OperationListener = (operation: FormOperation) => void;
export type Unsubscribe = () => void;
export type SubscribeResult =
  | {
      readonly success: true;
      readonly unsubscribe: Unsubscribe;
      readonly diagnostics: readonly [];
    }
  | { readonly success: false; readonly diagnostics: readonly Diagnostic[] };
export interface FormRuntime<TData extends object> {
  getSnapshot(): FormRuntimeSnapshot<TData>;
  getFieldSnapshot(path: DataPath): FieldRuntimeSnapshot | undefined;
  getNodeSnapshot(path: DataPath): RuntimeTreeSnapshot | undefined;
  getItemSnapshot(
    address: CollectionItemAddress,
  ): ItemRuntimeSnapshot | undefined;
  getCollectionNodeSnapshot(
    address: CollectionNodeAddress,
  ): RuntimeTreeSnapshot | undefined;
  subscribe(listener: SnapshotListener<TData>): SubscribeResult;
  subscribeOperations(listener: OperationListener): SubscribeResult;
  updateExternalState(update: ExternalStateUpdate<TData>): RuntimeActionResult;
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
  getValidationSnapshot(scope?: FormScope): ValidationSnapshot;
  showValidationErrors(scope: FormScope): RuntimeActionResult;
  hideValidationErrors(scopeId: string): RuntimeActionResult;
  dispose(): RuntimeActionResult;
}
export type CreateControlledFormRuntimeResult<TData extends object> =
  | {
      readonly success: true;
      readonly runtime: FormRuntime<TData>;
      readonly diagnostics: readonly Diagnostic[];
    }
  | { readonly success: false; readonly diagnostics: readonly Diagnostic[] };
