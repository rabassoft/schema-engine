export type PathSegment = string | number;
export type DataPath = readonly PathSegment[];
export type DocumentPath = readonly (string | number)[];

export interface UiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, FieldUiSchema>>;
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
  readonly fields: readonly FieldDefinition[];
}

export interface BaseFieldDefinition {
  readonly key: string;
  readonly name: string;
  readonly path: DataPath;
  readonly required: boolean;
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
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

export type FormOperation = SetValueOperation | RemoveValueOperation;

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
  'label' | 'description' | 'hint' | 'tooltip' | 'placeholder' | 'issue';
export type TextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: Exclude<FieldTextMember, 'issue'>;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: 'issue';
      readonly issue: ValidationIssue;
    };
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
export interface FieldRuntimeSnapshot {
  readonly key: string;
  readonly path: DataPath;
  readonly presence:
    | { readonly kind: 'missing' }
    | { readonly kind: 'value'; readonly value: unknown };
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
}
export interface FormRuntimeSnapshot<TData extends object> {
  readonly value: Readonly<TData>;
  readonly locale: string;
  readonly valid: boolean;
  readonly dirty: boolean;
  readonly validationVisibility: ValidationVisibility;
  readonly fields: readonly FieldRuntimeSnapshot[];
  readonly globalIssues: readonly ValidationIssue[];
}
export interface FormScope {
  readonly id: string;
  readonly paths: readonly DataPath[];
  readonly includeGlobalIssues?: boolean;
}
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
  subscribe(listener: SnapshotListener<TData>): SubscribeResult;
  subscribeOperations(listener: OperationListener): SubscribeResult;
  updateExternalState(update: ExternalStateUpdate<TData>): RuntimeActionResult;
  requestSetValue(path: DataPath, value: unknown): RuntimeActionResult;
  requestRemoveValue(path: DataPath): RuntimeActionResult;
  focus(path: DataPath): RuntimeActionResult;
  blur(path: DataPath): RuntimeActionResult;
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
