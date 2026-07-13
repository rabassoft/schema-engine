# PLAN-003: Controlled form runtime

- **Status:** Completed
- **Date:** 2026-07-13
- **Approval date:** 2026-07-13
- **Completion date:** 2026-07-13
- **Requires:** [`SPEC-001` v0.1.6](../specs/001-controlled-form-runtime.md), [completed PLAN-001](./001-compiler-only-implementation.md), [completed PLAN-002](./002-root-immutable-operations.md)
- **Milestone:** M3 — Controlled runtime

## 1. Goal and completion boundary

Implement the framework-neutral controlled runtime that consumes a compiled
`FormDefinition`, application-owned value/baseline/locale, and a synchronous
validator, then exposes immutable snapshots, interaction actions, validation
views, and separate snapshot/operation subscriptions.

M3 does not implement Angular, renderers, parsing/formatting controls,
persistence, async validation, optimistic projection, nested objects, arrays,
dynamic definitions, plugins, or a persistent diagnostic channel.

Implementation must not begin until this plan is formally reviewed and
approved.

## 2. Decisions promoted by this plan

### 2.1 Validator access to the source schema

Keep `SchemaValidator.validate(schema, value)` as specified. Add a required
`schema: unknown` member to `ControlledFormRuntimeOptions`; the application
passes the same source schema used to compile the definition. The runtime keeps
the reference without cloning or interpreting it and passes it to the validator
on initial creation and every confirmed value-reference change.

The validator must return a `ValidationResult`; it must not throw for invalid
application data. A thrown validator exception becomes a blocking runtime
diagnostic and preserves the previous runtime state during updates.

### 2.2 Listener exception isolation

Snapshot and operation listeners run synchronously in subscription order from
a stable copy of the listener set. An exception from one listener never stops
later listeners and never rolls back an already accepted state/effect.

The triggering action returns one warning `LISTENER_EXCEPTION` per throw with
`channel` (`snapshot` or `operation`) and `listenerIndex`. The exception object
is never retained. This is ephemeral action feedback and does not create the
deferred persistent diagnostic channel D-022.

## 3. Public contracts

Export the contracts below from `@rabassoft/schema-engine`:

```ts
export interface ValidationIssue {
  readonly code: string;
  readonly path: DataPath;
  readonly keyword?: string;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly fallbackMessage?: string;
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
```

`TextResolver` remains a renderer/adaptor concern until M4 because the current
runtime snapshot contains canonical text identifiers, not resolved display
strings. Removing it from the M3 options corrects the unused member shown in
SPEC-001 section 21.1 without changing the confirmed locale behavior.

## 4. Snapshot and runtime API

Use the `FormRuntimeSnapshot` and `FieldRuntimeSnapshot` shapes from SPEC-001.
Add:

```ts
export type SnapshotListener<TData extends object> = (
  snapshot: FormRuntimeSnapshot<TData>,
) => void;
export type OperationListener = (operation: FormOperation) => void;
export type Unsubscribe = () => void;

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

export function createControlledFormRuntime<TData extends object>(
  options: ControlledFormRuntimeOptions<TData>,
): CreateControlledFormRuntimeResult<TData>;
```

Creation failures are configuration errors and return a discriminated
`CreateControlledFormRuntimeResult` rather than throwing. Its success branch
contains `runtime` and warnings; its failure branch contains only diagnostics.

```ts
export type CreateControlledFormRuntimeResult<TData extends object> =
  | {
      readonly success: true;
      readonly runtime: FormRuntime<TData>;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly Diagnostic[];
    };
```

## 5. Creation validation

Validate in this order: options object, `formId`, definition minimum shape,
`value`, `baselineValue`, locale, validator, visibility, then initial validator
result. Reuse PLAN-002 root/form rules without applying an operation.

- `formId` is a non-empty string.
- Value and baseline are ordinary root data objects.
- Locale is a non-empty string and otherwise opaque.
- Validator is an object with an own callable `validate` member.
- Visibility defaults to `touched`.
- Definition paths are unique one-string root paths with supported field types.
- Initial invalid business data creates a valid runtime with `valid: false`.
- Structurally invalid inputs or malformed validator results block creation.
- Inputs, validator results, and source schema are never mutated or deeply
  frozen.

## 6. Controlled state and snapshots

- Store only references supplied by the application for value, baseline, schema,
  definition, and validator.
- Build fields in definition order. Presence uses own data properties; inherited
  properties are missing and target accessors are structural errors.
- Field dirty compares presence and, when present on both sides, values with
  `Object.is`. Form dirty is true when any managed field is dirty.
- Unmanaged properties never create field snapshots or affect dirty.
- Field issues contain all normalized issues whose exact path matches the field.
  Issues for `[]` are global. Other unknown/deep paths remain available from the
  unscoped validation snapshot and produce `UNKNOWN_VALIDATION_ISSUE_PATH`
  warnings; they are not silently reassigned to a field or to `globalIssues`.
- Snapshots, fields, issue arrays, issues, paths, and runtime-owned metadata are
  frozen. External values, schema, validator, and issue parameter values are not
  recursively frozen.
- Rebuild only affected field snapshots. Preserve references for fields whose
  observable presence, value, baseline comparison, interaction, issues, and
  visibility did not change.

## 7. External updates and validation

`updateExternalState()` validates its input members as own data properties,
accepts any non-empty subset, and compares value/baseline/locale by reference or
primitive identity.

- No effective input change returns a successful no-op and emits nothing.
- An accepted update is atomic and emits at most one snapshot.
- A changed value reference invokes the validator exactly once; baseline-only or
  locale-only changes do not validate.
- A malformed update, root, validator result, or thrown validator leaves all
  state and references unchanged and emits no snapshot.
- External updates never emit operations or modify touched/focus/forced scopes.

## 8. Operation requests

- Requests accept only exact managed one-string root paths.
- `requestSetValue()` rejects `undefined` and basic type incompatibility using
  PLAN-002 diagnostics.
- The runtime derives expectations from its latest confirmed value using own
  data-property presence and value.
- A request that would be an `Object.is` no-op succeeds without allocating an
  ID or emitting an operation.
- Removing a missing property is also a successful no-op.
- Emitted IDs start at 1 and increment only after an operation is emitted.
- Emitted operations and their owned metadata/path/expectation containers are
  frozen; referenced expected/new structural values are not frozen.
- Requests never update the controlled value, snapshot, dirty, validation, or
  interaction state. The application must confirm through
  `updateExternalState()`.

## 9. Interaction and visibility

- Only a managed field can be focused; focusing the active field is a no-op.
- Focusing another field atomically unfocuses the previous one without touching
  it, then focuses the target.
- `blur(path)` acts only on the currently focused field and sets it touched.
- `resetTouched()` clears every field; with a scope it clears only valid scope
  paths. It never changes focus.
- Visibility `all` shows every field issue. Visibility `touched` shows issues for
  touched fields plus fields included by any currently forced scope.
- Showing a scope is idempotent by scope ID and replaces the prior scope with
  that ID atomically. Hiding an unknown ID is a no-op.
- Unknown, deep, duplicate, or numeric scope paths warn and are ignored; an
  empty scope ID is an error. Scopes may overlap.

## 10. Subscriptions and disposal

- Subscribe does not immediately invoke the listener.
- Subscription methods validate callability and return `SubscribeResult`;
  invalid listeners produce `INVALID_LISTENER` without registering anything.
- Unsubscribe is idempotent. Removing/adding listeners during emission affects
  only later emissions.
- Snapshot listeners receive the already committed immutable snapshot.
- Operation listeners receive the immutable operation before the request
  returns.
- `dispose()` is idempotent, clears listeners and forced scopes, and prevents
  later mutations/emissions. Reads return the final snapshot; later actions
  return `RUNTIME_DISPOSED` without effects.

## 11. Diagnostics

All runtime diagnostics follow existing immutability and safe-value rules.
PLAN-003 adds:

| Code                            | Severity | Required parameters                                             |
| ------------------------------- | -------- | --------------------------------------------------------------- |
| `INVALID_RUNTIME_OPTIONS`       | error    | `member`, `expected`, `reason`, optional safe actual descriptor |
| `INVALID_EXTERNAL_STATE_UPDATE` | error    | `member`, `expected`, `reason`, optional safe actual descriptor |
| `INVALID_VALIDATOR_RESULT`      | error    | `reason`, optional `issueIndex`                                 |
| `VALIDATOR_EXCEPTION`           | error    | `phase` (`creation` or `update`)                                |
| `UNKNOWN_RUNTIME_PATH`          | error    | copied `path`                                                   |
| `UNKNOWN_SCOPE_PATH`            | warning  | `scopeId`, copied `path`                                        |
| `UNKNOWN_VALIDATION_ISSUE_PATH` | warning  | `issueIndex`, copied `path`                                     |
| `INVALID_SCOPE`                 | error    | `member`, `expected`, `reason`                                  |
| `INVALID_VALIDATION_VISIBILITY` | error    | safe actual descriptor                                          |
| `INVALID_LISTENER`              | error    | `channel`, safe actual descriptor                               |
| `LISTENER_EXCEPTION`            | warning  | `channel`, `listenerIndex`                                      |
| `RUNTIME_DISPOSED`              | error    | `action`                                                        |

Member reasons are exactly `missing-member`, `accessor-member`, and
`invalid-value`. Validator-result reasons are exactly `result-not-object`,
`invalid-valid`, `issues-not-array`, `issue-not-object`, `invalid-code`,
`invalid-path`, `invalid-keyword`, `invalid-parameters`, and
`invalid-fallback-message`. Diagnostics are ordered by validation phase, field
or issue index, then listener subscription order. All include stable English
fallback messages and never retain exceptions or caller containers.

## 12. Tests and fixtures

Add runtime fixtures for creation, external updates, operation emission,
validation, dirty, interaction, scopes, structural sharing, listener isolation,
and disposal. Focused unit tests additionally cover reference identity,
`Object.is`, accessor safety, mutation during subscription, sequential IDs,
atomic validator failure, and absence of optimistic projection.

M1 and M2 fixtures and public outputs must remain unchanged. Add built-package
smoke coverage for runtime creation, subscription, operation request, external
confirmation, and disposal.

## 13. Implementation sequence and acceptance

1. Formally review and approve this plan.
2. Promote approved option/result/diagnostic changes to SPEC-001.
3. Add contracts and creation validation.
4. Implement validation normalization and snapshot construction.
5. Implement external updates and structural sharing.
6. Implement operation requests and subscriptions.
7. Implement interaction, scopes, visibility, and disposal.
8. Add fixtures, focused tests, and package smoke coverage.
9. Run the complete repository acceptance suite and update persistent state.

Acceptance commands remain:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
```

M3 is incomplete if the runtime owns application value, projects unconfirmed
operations, deep paths become supported, validator/listener failures escape,
external values are frozen, an update emits more than one snapshot, or any M1/M2
output regresses.
