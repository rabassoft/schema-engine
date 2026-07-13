# PLAN-002: Root-level immutable operations

- **Status:** Completed
- **Date:** 2026-07-13
- **Approval date:** 2026-07-13
- **Completion date:** 2026-07-13
- **Requires:** [`SPEC-001` v0.1.5](../specs/001-controlled-form-runtime.md), [completed PLAN-001](./001-compiler-only-implementation.md)
- **Milestone:** M2 — Immutable operations

## 1. Goal and completion boundary

Add the framework-neutral operation contracts and the pure
`applyOperation()`/`applyFormOperation()` utilities required by the controlled
runtime, limited to root properties.

M2 does not create a runtime, emit operations, allocate operation IDs, manage
controlled state, validate business constraints, or add nested objects, arrays,
batches, undo/redo, optimistic state, persistence, or framework integration.

Implementation must not begin until this plan is approved.

## 2. Public contracts

Export these contracts from `@rabassoft/schema-engine`:

```ts
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
  readonly expected: {
    readonly kind: 'value';
    readonly value: unknown;
  };
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

export function applyOperation<TData extends object>(
  currentValue: Readonly<TData>,
  operation: FormOperation,
): ApplyOperationResult<TData>;

export function applyFormOperation<TData extends object>(
  definition: FormDefinition,
  currentValue: Readonly<TData>,
  operation: FormOperation,
): ApplyOperationResult<TData>;
```

Although the TypeScript API is strongly typed, both functions validate runtime
inputs and return diagnostics for expected misuse rather than throwing.

## 3. Supported operation scope

- Both functions accept exactly one path segment and that segment must be a
  string. Empty property names are valid through `['']`.
- Reject `[]`, numeric segments, and paths with more than one segment.
- `applyOperation()` may target any root property name; an inherited property is
  considered missing and a matching set may create the own property.
- `applyFormOperation()` additionally requires an exact canonical path match in
  `FormDefinition`; it never resolves a field by `key` or `name` alone.
- Inherited properties are treated as missing. Presence uses `Object.hasOwn()`.
- An existing target must be an own data property. Accessor targets are rejected
  without invoking their getter or setter; unaffected accessor descriptors are
  preserved without invocation.
- Root replacement, intermediate containers, nested paths, and array indices
  remain deferred.

`currentValue` must be an ordinary non-null, non-array object whose prototype is
`Object.prototype` or `null`. This keeps M2 aligned with JSON object data and
prevents class instances, dates, maps, and other host objects from being cloned
with misleading semantics.

## 4. Validation pipeline and behavior

Run validation in this deterministic order:

1. Validate `currentValue`.
2. Validate operation discriminant, metadata, source, path, expectation, and
   set value.
3. In `applyFormOperation()`, validate the minimum `FormDefinition` shape,
   unique managed paths, path membership, and basic field-type compatibility.
4. Read actual target presence/value and check the expectation with `Object.is`.
5. Apply the effect or return the unchanged no-op result.

Stop a dependent branch after its first structural error, but collect other
independent operation-member diagnostics in member order:
`type`, `metadata`, `source`, `path`, `expected`, `value`.

Target and operation-shape validation are independent. If either fails, return
the target diagnostic first, followed by operation diagnostics in the order
above; do not validate a form definition, expectation, or effect. A non-object
operation produces only its top-level `INVALID_OPERATION` diagnostic. An
invalid discriminant skips the type-dependent remove expectation rule and set
value validation.

### 4.1 Operation shape

- Operation must be a non-null, non-array object.
- Every required operation, metadata, and expectation member must be an own
  data property. Missing members and accessor members are malformed; validation
  never invokes caller-provided getters or setters.
- `type` must be `set-value` or `remove-value`.
- `metadata` must be an object with integer `id >= 1` and a non-empty string
  `formId`.
- `source` must equal `user`.
- Extra operation or metadata properties are ignored.
- Nested member order is `metadata.id`, `metadata.formId`, then
  `expected.kind`, `expected.value`. `INVALID_OPERATION.expected` uses these
  stable descriptions: `non-null object`, `set-value or remove-value`,
  `metadata object`, `integer >= 1`, `non-empty string`, `user`, `array`,
  `expectation object`, `missing or value`, `own data property`, and
  `defined own data property`, as applicable to the reported member.
- A non-array `path` produces `INVALID_OPERATION` for member `path`. For an
  array path, validate length before its segment: `[]` is
  `root-not-supported`, length greater than one is `deep-path-not-supported`,
  and a missing, accessor, or non-string sole segment is
  `non-string-segment`. Never invoke a path-segment accessor.
- `expected` must be an object with `kind: 'missing'` or `kind: 'value'`.
  `kind: 'value'` requires an own `value` member; its value may be any value,
  including `undefined`, because matching uses identity/value semantics.
- `remove-value` requires `expected.kind: 'value'`.
- `set-value` requires an own `value` member and rejects `undefined`. Structural
  `applyOperation()` otherwise treats the new value as opaque; arrays/objects
  can be stored as unmanaged root-property values but are never traversed.

### 4.2 Expectations and effects

- A missing target matches only `{ kind: 'missing' }`.
- A present target matches only `{ kind: 'value', value }` when
  `Object.is(actual, expected)` is true.
- Any mismatch returns `STALE_OPERATION`, the original value reference, and
  `changed: false`.
- `set-value` creates a missing root property after a matching missing
  expectation.
- `set-value` replaces a present root property after a matching value
  expectation.
- If the replacement is `Object.is()`-equal to the actual value, return a
  successful no-op with the original root reference.
- `remove-value` deletes a present root property after a matching expectation.
  Removing a missing property is stale.
- An existing accessor target produces `UNSUPPORTED_OPERATION_PROPERTY`, the
  original root reference, and `changed: false` before expectation matching.
- Removing a required form field is allowed; requiredness remains a validation
  concern.

### 4.3 Form-aware checks

- `FormDefinition.fields` must be an array of supported field definitions with
  unique one-string-segment paths. A malformed definition produces
  `INVALID_FORM_DEFINITION`; the utility does not repair it.
- The exact minimum validated shape is:
  - `definition` is a non-null, non-array object with an own data-property
    `fields` containing an array;
  - every array index is an own data property containing a non-null, non-array
    object with own data-properties `path` and `kind`;
  - `path` is exactly one string segment and is unique in the array;
  - `kind` is `string`, `number`, or `boolean`;
  - a `number` field has an own data-property `numericType` equal to `number`
    or `integer`.
- Other field members are not read or revalidated because they are not needed
  for path membership or basic type compatibility. Required members are read
  through property descriptors, so malformed definitions cannot execute
  accessors.
- Inspect fields in array order, emit at most one structural diagnostic per
  field branch, and continue with independent entries. Any form-definition
  diagnostic prevents membership, compatibility, expectation, and effect
  checks.
- `set-value` compatibility:
  - string field: JavaScript string;
  - number field with `numericType: 'number'`: finite number;
  - number field with `numericType: 'integer'`: finite integer;
  - boolean field: JavaScript boolean.
- `null`, `undefined`, `NaN`, infinities, and incompatible primitive/object
  values are rejected for managed fields.
- Do not evaluate `minimum`, `maximum`, `multipleOf`, lengths, or patterns.
- `remove-value` performs membership checks but no type or requiredness checks.

## 5. Immutability and structural sharing

- Never mutate the operation, definition, current root, or existing property
  values.
- A changed result creates exactly one new root object.
- Copy own property descriptors and preserve the root prototype; omit the
  removed descriptor or replace the target with a writable, enumerable,
  configurable data property.
- Preserve all unaffected own-property descriptors, symbols, and referenced
  values exactly.
- Treat names such as `__proto__`, `constructor`, and `prototype` as ordinary
  own keys by using descriptor APIs rather than assignment-based cloning.
- Failure and no-op results return the exact original root reference.
- Freeze the result wrapper, diagnostics array, diagnostics, paths, and
  parameters. Never freeze `result.value` or recursively freeze any external
  branch referenced by it.

## 6. Diagnostic contract

All M2 diagnostics use `severity: 'error'`, `source: 'runtime'`, no
`documentPath`, and a frozen parameters object. Include `dataPath` only after a
valid one-string-segment operation path has been established.

| Code                             | Required parameters                                                                 | Meaning                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `INVALID_OPERATION_TARGET`       | `actualType`                                                                        | Current root is not an accepted object                   |
| `INVALID_OPERATION`              | `member`, `expected`, `reason`, optional `actualType`, optional `actualValue`       | Operation member is malformed                            |
| `INVALID_OPERATION_PATH`         | `reason`, `pathLength`, optional `segmentIndex`, optional `actualType`              | Path is empty, deep, or non-string                       |
| `INVALID_FORM_DEFINITION`        | `reason`, optional `fieldIndex`, optional `path`                                    | FormDefinition cannot safely resolve managed paths/types |
| `FORM_PATH_NOT_MANAGED`          | `path`                                                                              | Valid root path is absent from FormDefinition            |
| `INCOMPATIBLE_OPERATION_VALUE`   | `field`, `fieldType`, `actualType`, optional `actualValue`                          | Set value fails basic type compatibility                 |
| `UNSUPPORTED_OPERATION_PROPERTY` | `property`, `reason`                                                                | Existing target is not a supported data property         |
| `STALE_OPERATION`                | `expectedKind`, `actualKind`, conditional expected/actual type and value parameters | Presence or `Object.is` expectation failed               |

`reason` values for `INVALID_OPERATION_PATH` are exactly `root-not-supported`,
`deep-path-not-supported`, and `non-string-segment`. Diagnostic values follow
PLAN-001's scalar-or-type-descriptor policy and never retain caller objects.

`INVALID_OPERATION.reason` is exactly `missing-member`, `accessor-member`, or
`invalid-value`. `actualType` is omitted for missing and accessor members, so
diagnostics never need to evaluate an accessor.

`reason` values for `INVALID_FORM_DEFINITION` are exactly
`definition-not-object`, `fields-not-array`, `field-not-object`,
`invalid-field-path`, `unsupported-field-kind`, `invalid-numeric-type`, and
`duplicate-field-path`. Field-related definition diagnostics additionally
include `fieldIndex`; `duplicate-field-path` also includes a copied `path`.
`UNSUPPORTED_OPERATION_PROPERTY.reason` is exactly `accessor-property`.

For `STALE_OPERATION`, `expectedKind` and `actualKind` are `missing` or `value`.
Each side whose kind is `value` includes `expectedType`/`actualType` and includes
`expectedValue`/`actualValue` only for `null`, strings, booleans, and finite
numbers. Other values are represented only by their type and are never retained.
For `INCOMPATIBLE_OPERATION_VALUE`, `fieldType` is exactly `string`, `number`,
`integer`, or `boolean`.

All M2 diagnostics include a stable English `fallbackMessage`. Diagnostic
builders copy every path or descriptor they expose and never retain caller
containers.

No warning or diagnostic is emitted for a successful no-op.

## 7. Implementation structure

- Add operation contracts to the existing public contracts module and exports.
- Add a public operations module containing the two functions.
- Reuse internal diagnostic/value helpers where their current contracts fit;
  extend them without changing M1 output.
- Keep structural cloning, operation validation, form lookup, and result
  finalization as small internal helpers.
- Do not introduce commands, batches, visitors, path engines, generic immutable
  update libraries, runtime state, or a plugin abstraction.

## 8. Tests and conformance fixtures

Store operation fixtures under
`packages/core/test/operations/fixtures/<fixture-name>/` with a single
`fixture.json` containing `mode`, `currentValue`, `operation`, and optional
`definition`, plus a complete `expected.json`.

Required structural fixtures:

- Success: set existing, set missing, remove existing, and no-op set.
- Errors: invalid target, invalid operation type, invalid metadata, invalid
  source, invalid expectation, missing set value, undefined set value (unit-only),
  empty path, deep path, numeric segment, stale missing expectation, stale value
  expectation, remove missing, and accessor target (unit-only).

Required form-aware fixtures:

- Success: set string, finite number, integer, boolean, and remove required
  field.
- Errors: malformed definition, duplicate managed path, unmanaged path,
  incompatible string, non-finite number (unit-only), non-integer, and
  incompatible boolean.

Focused unit tests additionally cover:

- `Object.is` behavior for `NaN`, `0`, and `-0`.
- Opaque object identity expectations in structural operations.
- Exact reference preservation on errors and no-ops.
- Exactly one new root and shared unaffected branch references on changes.
- Preservation of property descriptors, symbols, and null prototypes.
- Safe set/remove behavior for `__proto__`.
- Inherited properties treated as missing.
- Result/diagnostic freezing without freezing input or output values.
- Input operation/definition objects remain unmodified.
- Deterministic diagnostic order for multiple malformed members.
- Required-member accessors are rejected without getter/setter invocation.
- M1 compiler fixtures and outputs remain unchanged.

## 9. Implementation sequence and acceptance

1. After plan approval, add the M2 diagnostic codes and PLAN-002 reference to
   SPEC-001 before production code.
2. Add and export operation/result contracts.
3. Implement shared operation shape, path, expectation, cloning, and result
   helpers.
4. Implement `applyOperation()`.
5. Implement form-definition validation, membership/type checks, and
   `applyFormOperation()`.
6. Add fixtures, focused tests, and built-package smoke coverage.
7. Run the full existing M1 suite plus M2 acceptance commands.
8. Update persistent project state and mark M2 complete only after every check
   succeeds.

Acceptance commands:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
```

M2 is incomplete if any command fails, M1 output changes unexpectedly, an
operation mutates caller-owned state, an error/no-op changes the root reference,
deep paths become accepted, business constraints are evaluated, or
documentation and implementation disagree.

## 10. Confirmed planning assumptions

- Both operation utilities are root-property-only in M2.
- Empty, numeric, and deep paths are rejected.
- The result always includes `value`; failures preserve the exact input
  reference.
- Valid no-ops succeed with `changed: false` and no diagnostics.
- Nested operations and arrays remain deferred.
- Caller-provided accessors are never invoked during validation or application.
