import type {
  CompileFormDefinitionInput,
  FormOperation,
  FormScope,
  SchemaValidator,
  ValidationIssue,
  ValidationResult,
  ValidationVisibility,
} from '@rabassoft/schema-engine';

export type ReferenceFeature =
  | 'controlled-state'
  | 'primitive-fields'
  | 'string-enum'
  | 'explicit-clear'
  | 'validation'
  | 'locale'
  | 'nested-objects'
  | 'object-collections'
  | 'local-references'
  | 'presentation-groups'
  | 'advanced-layout'
  | 'recursive-local-presentation'
  | 'nullable-leaves'
  | 'semantic-formats'
  | 'fixed-values'
  | 'object-composition'
  | 'async-validation'
  | 'scope-confirmation'
  | 'schema-defaults'
  | 'conditional-field-state'
  | 'string-enum-array'
  | 'discriminated-object-alternatives'
  | 'linear-wizard';

export type ReferenceExpectedOperation<
  TOperation extends FormOperation = FormOperation,
> = TOperation extends FormOperation
  ? Omit<TOperation, 'metadata' | 'source'>
  : never;

export type ReferenceExpectedIssue = Pick<
  ValidationIssue,
  'code' | 'path' | 'keyword'
>;

export interface ReferenceInitialState<TData extends object> {
  readonly value: Readonly<TData>;
  readonly baselineValue: Readonly<TData>;
  readonly locale: string;
  readonly validationVisibility: ValidationVisibility;
}

export interface ReferenceTransitionExpectation<TData extends object> {
  readonly id: string;
  readonly action: string;
  readonly decision: 'confirm' | 'reject' | 'external-update';
  readonly operation?: ReferenceExpectedOperation;
  readonly expected: {
    readonly value?: Readonly<TData>;
    readonly baselineValue?: Readonly<TData>;
    readonly dirty?: boolean;
    readonly valid?: boolean;
    readonly issues?: readonly ReferenceExpectedIssue[];
  };
}

export interface ReferenceExplanation {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export interface ReferenceServiceValidation {
  readonly fieldPath: readonly (string | number)[];
  readonly issue: {
    readonly code: string;
    readonly keyword: string;
    readonly fallbackMessage: string;
  };
  readonly labels: {
    readonly heading: string;
    readonly settleValid: string;
    readonly settleInvalid: string;
    readonly reject: string;
    readonly throwNext: string;
    readonly retry: string;
  };
}

export type ReferenceScopeConfirmationExpectation =
  'candidate-and-acceptance-leaves-unrelated-dirty' | 'unconfirmable';

export interface ReferenceScopeConfirmationTarget {
  readonly id: string;
  readonly label: string;
  readonly scope: FormScope;
  readonly expectation: ReferenceScopeConfirmationExpectation;
}

export interface ReferenceScopeConfirmation {
  readonly labels: {
    readonly heading: string;
    readonly guidance: string;
    readonly accept: string;
  };
  readonly targets: readonly ReferenceScopeConfirmationTarget[];
}

export interface ReferenceSchemaDefaults {
  readonly labels: {
    readonly heading: string;
    readonly guidance: string;
    readonly derive: string;
    readonly cancel: string;
    readonly accept: string;
  };
}

export interface ReferenceScenario<TData extends object = object> {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly features: readonly ReferenceFeature[];
  readonly compileInput: CompileFormDefinitionInput;
  readonly initialState: ReferenceInitialState<TData>;
  readonly validator: SchemaValidator;
  readonly transitions: readonly ReferenceTransitionExpectation<TData>[];
  readonly explanation: readonly ReferenceExplanation[];
  readonly serviceValidation?: ReferenceServiceValidation;
  readonly scopeConfirmation?: ReferenceScopeConfirmation;
  readonly schemaDefaults?: ReferenceSchemaDefaults;
}

export type ReferenceScenarioAuthoring<TData extends object = object> =
  ReferenceScenario<TData>;

export type ReferenceCatalogAuthoringReason =
  | 'accessor-member'
  | 'cyclic-value'
  | 'duplicate-id'
  | 'extra-member'
  | 'inherited-member'
  | 'inspection-failed'
  | 'invalid-container'
  | 'invalid-id'
  | 'invalid-member'
  | 'missing-member'
  | 'non-json-value'
  | 'sparse-array'
  | 'symbol-member';

export type ReferenceCatalogPath = readonly (string | number)[];

export type ReferenceValidatorFunction = (
  schema: unknown,
  value: unknown,
) => ValidationResult;
