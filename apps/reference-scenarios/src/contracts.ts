import type {
  CompileFormDefinitionInput,
  FormOperation,
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
  | 'nullable-leaves';

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
