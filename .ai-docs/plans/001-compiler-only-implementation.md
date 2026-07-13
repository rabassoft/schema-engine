# PLAN-001: Minimal compiler-only implementation

- **Status:** Completed
- **Approval date:** 2026-07-13
- **Completion date:** 2026-07-13
- **Date:** 2026-07-13
- **Requires:** [`SPEC-001` v0.1.4](../specs/001-controlled-form-runtime.md), [accepted ADR-005](../adrs/005-politica-dialecto-json-schema.md), [accepted ADR-006](../adrs/006-limite-paquete-inicial.md)
- **Milestone:** M1 — Minimal compiler

## 1. Goal and completion boundary

Create the smallest framework-neutral package that compiles the first JSON
Schema and UI Schema subset into an immutable `FormDefinition` or blocking
diagnostics.

This increment ends when the package builds, its public API can be imported,
all unit and conformance tests pass, and the documentation records the verified
behavior. It does not include the controlled runtime, operations, validation
adapters, Angular, renderers, persistence, or deferred capabilities.

This plan was approved on 2026-07-13 and authorizes the compiler-only
implementation described here.

## 2. Workspace and package

- Create a minimal `pnpm` workspace without Nx, Turborepo, or a release tool.
- Place the framework-neutral implementation in `packages/core` and publish its
  API as `@rabassoft/schema-engine`.
- Use TypeScript with ESM output, declaration files, source maps, strict type
  checking, and no runtime dependencies.
- Build with `tsc`; use Vitest for tests, ESLint for linting, and Prettier for
  formatting. Pin all development dependencies through the lockfile.
- Mark the package as side-effect free and expose only the root entry point.
- Keep all implementation free of framework packages, RxJS, DOM types, browser
  globals, filesystem access, environment checks, and network access.
- Root scripts must provide `format:check`, `lint`, `typecheck`, `test`,
  `test:package`, and `build`. No publishing or CI workflow is part of this
  increment.

ADR-006 supersedes the old pre-SPEC package name
`@rabassoft/schema-engine-core` with `@rabassoft/schema-engine`; the
framework-independence part of global ADR-001 remains unchanged.

## 3. Public API and contracts

The only public behavior added by this increment is:

```ts
export interface CompileFormDefinitionInput {
  readonly schema: unknown;
  readonly uiSchema?: unknown;
}

export function compileFormDefinition(
  input: CompileFormDefinitionInput,
): CompileFormResult;
```

The root entry point also exports the compiler-facing contracts already defined
by `SPEC-001`: `UiSchema`, `FieldUiSchema`, `FormDefinition`, all field
definition variants, `PathSegment`, `DataPath`, `Diagnostic`, and
`CompileFormResult`.

Rules:

- `uiSchema` omitted is equivalent to an empty UI Schema.
- Expected input/configuration failures return diagnostics and never throw.
- Any blocking diagnostic returns `{ success: false, diagnostics }`; partial
  definitions are never exposed.
- A warnings-only result returns `{ success: true, definition, diagnostics }`.
- The result, definition, fields, nested constraint/UI objects, diagnostics,
  paths, and diagnostic parameters are recursively frozen. Inputs are never
  mutated or retained as mutable output objects.
- `fallbackMessage` values are English. Codes, paths, and parameters are the
  canonical machine-readable contract.
- Runtime, validator, default-application, and adapter contracts not needed by
  compilation are not exported in this increment.

## 4. Compilation behavior

### 4.1 Deterministic pipeline

Run these phases in order:

1. Validate the call object and confirm that `schema` is an inspectable object.
2. Resolve `$schema` according to ADR-005.
3. Validate the root type/properties and inspect root keywords and metadata.
4. Inspect fields in `Object.keys(properties)` order.
5. Validate `required` and its relationship to managed properties.
6. Validate and normalize UI Schema.
7. Resolve final field order and compile normalized fields.
8. Freeze and return the result.

Dialect diagnostics are emitted first. An invalid or unsupported declared
dialect stops schema interpretation because its keyword semantics are unsafe to
assume; independently detectable UI Schema diagnostics may still be collected.
An invalid root stops field analysis. An invalid field stops that field branch
but does not stop independent fields or UI Schema analysis.

Within a schema/UI object, diagnostics follow `Object.keys()` order. Field
diagnostics follow property order; order-array diagnostics follow array order;
UI field diagnostics follow the order of `uiSchema.fields`. Repeating the same
input produces structurally identical output and diagnostic order.

### 4.2 Root schema

- The root must be a non-null, non-array object.
- `type` is required and must equal the string `"object"`.
- `properties` is required and must be a non-null, non-array object. An empty
  `properties` object is valid.
- `required`, `title`, and `description` are optional.
- `required`, when present, must be an array of unique strings. Absence means no
  fields are required.
- A required name not present in `properties` produces
  `UNMANAGED_REQUIRED_PROPERTY` as a warning; it does not create a field.
- Root `title` and `description`, when present, must be strings. They are
  recognized but are not emitted because the current `FormDefinition` has no
  form-level metadata.

### 4.3 Field schemas and constraints

- Each property value must be a non-null, non-array schema object.
- Every field requires an explicit string `type` of `string`, `number`,
  `integer`, or `boolean`. Type arrays and all other types are blocking errors.
- A root property name becomes `name`, `key`, and `path: [name]`. Thus
  `key === name` for the root-only prototype; nested-path encoding remains out
  of scope.
- Preserve property insertion order until UI ordering is applied.
- `required` is derived exclusively from the root `required` array.
- `default` is recognized as supported metadata but is not copied into
  `FormDefinition` or validated as an instance value. `applySchemaDefaults()`
  remains outside this increment.
- String constraints: `minLength` and `maxLength` must be non-negative integers;
  `pattern` must be a string accepted by JavaScript `RegExp` in Unicode mode.
- Numeric constraints: `minimum` and `maximum` must be finite numbers;
  `multipleOf` must be a finite number greater than zero.
- Do not reject logically unsatisfiable but syntactically valid combinations
  such as `minimum > maximum`; instance validation belongs to the external
  validator.
- A supported constraint on an incompatible field type produces the blocking
  `INCOMPATIBLE_SCHEMA_KEYWORD` diagnostic rather than being silently ignored.

Apply ADR-005's exact keyword catalog only at the root and direct field schema
objects. Emit warnings for its known ignorable annotations, errors for its
known unsupported keywords, and warnings for unknown keywords. Treat unknown
values as opaque and never traverse them looking for schemas.

### 4.4 UI Schema

- UI Schema must be a non-null, non-array object when provided.
- Its only root keys are `order` and `fields`; unknown keys produce a warning
  and are ignored.
- `order`, when present, must be an array of strings. The first occurrence of a
  known field is retained. Later occurrences produce
  `DUPLICATE_UI_ORDER_FIELD` and are ignored. Unknown names produce
  `UNKNOWN_UI_ORDER_FIELD` and are ignored. Fields not retained from `order`
  are appended in schema property order. Duplicate detection applies only to
  known fields; every occurrence of an unknown name produces only
  `UNKNOWN_UI_ORDER_FIELD`.
- `fields`, when present, must be an object record. Entries for names absent
  from schema `properties` produce `UNKNOWN_UI_FIELD` and are ignored without
  traversing their metadata.
- A known field entry must be an object containing only `label`, `description`,
  `hint`, `tooltip`, `placeholder`, and `options`. Unknown keys warn and are
  ignored. Text values must be strings when present.
- Text precedence is UI Schema, then JSON Schema, then the property name for
  `label`; `description` has UI then JSON precedence. `hint`, `tooltip`, and
  `placeholder` come only from UI Schema. An explicitly present empty string
  wins precedence and is not treated as absent.
- `placeholder` is retained for string, number, and integer fields. On boolean
  fields it produces `INCOMPATIBLE_PLACEHOLDER` and is omitted.
- `options` must be an object containing only `decimalPlaces` and
  `showTrailingZeros`. `decimalPlaces` must be a non-negative integer and
  `showTrailingZeros` a boolean. Unknown option keys produce
  `UNKNOWN_UI_SCHEMA_KEY` and are ignored.
- Numeric options are retained only for number/integer fields. Each option on a
  non-numeric field produces `INCOMPATIBLE_UI_OPTION` and is omitted.
- If a field schema branch is invalid and therefore has no reliable field type,
  validate the shape of its UI metadata but skip placeholder/option
  compatibility diagnostics to avoid cascades.
- UI Schema never changes field type, constraints, requiredness, or data paths.

## 5. Diagnostic contract

Use `source: 'schema'` for JSON Schema diagnostics and `source: 'ui-schema'`
for UI Schema diagnostics. Root diagnostics omit `dataPath`; field-related
diagnostics use `[fieldName]`. `documentPath` always points into the source
document, including the intended `['$schema']` path when `$schema` is absent.

Document paths use these exact forms:

- Root keyword: `[keyword]`.
- Field schema or keyword: `['properties', field]` or
  `['properties', field, keyword]`.
- Required entry: `['required', index]`.
- UI root key: `[key]`.
- UI order entry: `['order', index]`.
- UI field or metadata: `['fields', field]` or
  `['fields', field, key]`.
- UI option: `['fields', field, 'options', option]`.

ADR-005 supplies these fixed codes and severities:

| Code                         | Severity |
| ---------------------------- | -------- |
| `MISSING_SCHEMA_DIALECT`     | warning  |
| `INVALID_SCHEMA_DIALECT`     | error    |
| `UNSUPPORTED_SCHEMA_DIALECT` | error    |
| `UNSUPPORTED_SCHEMA_KEYWORD` | error    |
| `IGNORED_SCHEMA_KEYWORD`     | warning  |
| `UNKNOWN_SCHEMA_KEYWORD`     | warning  |

The compiler increment adds:

| Code                           | Severity | Required parameters                     |
| ------------------------------ | -------- | --------------------------------------- |
| `INVALID_COMPILER_INPUT`       | error    | `actualType`                            |
| `ROOT_SCHEMA_MUST_BE_OBJECT`   | error    | `actualType`                            |
| `ROOT_TYPE_MUST_BE_OBJECT`     | error    | `actualType`                            |
| `MISSING_SCHEMA_PROPERTIES`    | error    | none                                    |
| `INVALID_SCHEMA_PROPERTIES`    | error    | `actualType`                            |
| `INVALID_FIELD_SCHEMA`         | error    | `field`, `actualType`                   |
| `MISSING_FIELD_TYPE`           | error    | `field`                                 |
| `UNSUPPORTED_FIELD_TYPE`       | error    | `field`, `actualType`                   |
| `INVALID_SCHEMA_KEYWORD_VALUE` | error    | `keyword`, `expected`, `actualType`     |
| `INCOMPATIBLE_SCHEMA_KEYWORD`  | error    | `keyword`, `fieldType`                  |
| `UNMANAGED_REQUIRED_PROPERTY`  | warning  | `field`                                 |
| `INVALID_UI_SCHEMA`            | error    | `actualType`                            |
| `UNKNOWN_UI_SCHEMA_KEY`        | warning  | `key`                                   |
| `INVALID_UI_SCHEMA_VALUE`      | error    | `key`, `expected`, `actualType`         |
| `DUPLICATE_UI_ORDER_FIELD`     | warning  | `field`, `firstIndex`, `duplicateIndex` |
| `UNKNOWN_UI_ORDER_FIELD`       | warning  | `field`, `index`                        |
| `UNKNOWN_UI_FIELD`             | warning  | `field`                                 |
| `INCOMPATIBLE_PLACEHOLDER`     | warning  | `field`, `fieldType`                    |
| `INCOMPATIBLE_UI_OPTION`       | warning  | `field`, `fieldType`, `option`          |

`actualType` uses the closed values `null`, `array`, `object`, `string`,
`number`, `boolean`, `undefined`, `bigint`, `symbol`, or `function`.
Diagnostics about invalid values additionally include optional `actualValue`
only for `null`, strings, finite numbers, and booleans. Arrays, objects,
non-finite numbers, `undefined`, bigint, symbols, and functions are represented
only by `actualType`, preventing input objects from leaking into diagnostics.
For `INVALID_SCHEMA_DIALECT`, `declaredDialect` is the scalar value when it is
safe under the same rule; otherwise it is a newly created frozen
`{ type: actualType }` descriptor. All diagnostics include a frozen parameters
object, even when empty.

## 6. Implementation structure

Keep modules small and dependency-directed:

- Public contracts and root exports.
- Compiler orchestration.
- Schema shape/constraint readers.
- ADR-005 dialect and keyword classification.
- UI Schema reader and ordering.
- Diagnostic builders and immutable-output helpers.

Internal readers return explicit success/failure values; they do not throw for
user input. Do not introduce a generic plugin pipeline, AST, class hierarchy,
visitor framework, validator abstraction, renderer registry, or intermediate
model beyond the data needed to build `FormDefinition`.

## 7. Tests and conformance fixtures

Store fixtures under `packages/core/test/conformance/fixtures/<fixture-name>/`
with `schema.json`, optional `ui-schema.json`, and `expected.json`. A single
parameterized conformance test loads every fixture and compares the complete
JSON-compatible result, including diagnostic order, paths, parameters, and
normalized definition.

Required fixtures:

- Valid: `valid-basic-form`, `valid-custom-order`, `valid-ui-texts`,
  `valid-numeric-options`, `valid-empty-form`.
- Warnings: `warning-missing-dialect`, `warning-unknown-schema-keyword`,
  `warning-ignored-schema-annotation`, `warning-unknown-order-field`,
  `warning-duplicate-order-field`, `warning-unknown-ui-key`,
  `warning-unknown-ui-field`,
  `warning-unmanaged-required-property`, `warning-incompatible-placeholder`,
  `warning-incompatible-ui-option`.
- Errors: `error-invalid-dialect`, `error-unsupported-dialect`,
  `error-root-not-object`, `error-root-type`, `error-missing-properties`,
  `error-field-schema`, `error-field-missing-type`, `error-unsupported-type`,
  `error-unsupported-schema-keyword`, `error-incompatible-schema-keyword`,
  `error-invalid-required`, `error-invalid-constraint`, `error-invalid-pattern`,
  `error-invalid-ui-schema`, `error-invalid-ui-value`.

Focused unit tests must additionally cover:

- Text precedence, including explicit empty strings.
- String, number, integer, and boolean normalization.
- Supported `default` metadata is accepted without entering `FormDefinition`.
- Constraint and numeric-option boundary values.
- Stable field and diagnostic ordering.
- Multiple independent errors with no partial definition.
- No cascading diagnostics below an invalid branch.
- Invalid call objects and non-object schema values return diagnostics rather
  than throwing.
- Recursive freezing and absence of input mutation.
- Unknown keyword values are not traversed.
- Repeated compilation of the same objects is deterministic.
- Package root exports work from built output and the package has zero runtime
  dependencies.

## 8. Implementation sequence and acceptance

1. After plan approval, update `SPEC-001` with the approved diagnostic contract
   and a reference to PLAN-001 before writing production code.
2. Scaffold the workspace, core package, tool configuration, and root scripts.
3. Add compiler-facing contracts and the public entry point.
4. Implement immutable diagnostics, dialect handling, and keyword catalog.
5. Implement root/field schema reading and normalized field construction.
6. Implement UI Schema reading, precedence, compatibility, and ordering.
7. Add conformance fixtures and focused unit tests.
8. Run formatting, linting, type checking, tests, build, and a built-package
   import smoke test.
9. Resolve any implementation/documentation conflict before completion; update
   SPEC/ADR only through explicit review.
10. Update `STATUS.md`, prepend `WORKLOG.md`, and mark M1 complete in
    `ROADMAP.md` only after every verification succeeds.

Acceptance commands must all succeed from a clean checkout using the pinned
toolchain:

```text
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
```

The increment is not complete if any command fails, any required fixture is
missing, an expected input throws, framework/browser dependencies enter the
core, or documentation and implementation disagree.

## 9. Approved planning assumptions

- Package manager: `pnpm`.
- Workspace orchestration: native pnpm workspace only.
- Package location: `packages/core`.
- Public package name: `@rabassoft/schema-engine`.
- Test runner: Vitest.
- Compiler API: one object parameter with `schema` and optional `uiSchema`.
- Required root members: `type: "object"` and `properties`.
- Optional root members: `required`, `title`, and `description`.
