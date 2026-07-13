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

export interface StringFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'string';
  readonly constraints: {
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly pattern?: string;
  };
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
