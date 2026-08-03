# SPEC-012: Controlled Asynchronous Validation

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 2 August 2026
- **Acceptance date:** 2 August 2026
- **Milestone:** M26 — Controlled asynchronous validation
- **Promoted capability:** bounded D-003 selected by [review 235](../reviews/235-d003-m26-async-validation-promotion-readiness.md)
- **Accepted architecture:** ADR-029 revision 0, coordinated with ADR-005
  revision 6, ADR-009, ADR-010 and ADR-022 revision 3
- **Accepted baselines:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003 v0.1.2
  and SPEC-007 v0.1.0
- **Complete review:** [review 237](../reviews/237-spec-012-review.md) cycle 2
  passed all eighteen areas with zero findings
- **Authority:** Accepted observable M26 extension; authorizes PLAN-028
  preparation/review only, not plan approval, implementation, dependency,
  release, commit or push

## 1. Scope

This specification adds optional controlled asynchronous validation without
replacing the required synchronous whole-model validator. The application
remains the sole source of truth for `value` and `baselineValue`. Core owns
generation, cancellation, stale-result rejection and immutable projection; the
consumer integration owns effects and transport policy. Every unchanged
compiler, operation, renderer, package and Deferred rule remains authoritative.

M26 must make blocked, pending, settled and failed state observable, compose
accepted issues deterministically and preserve current behavior and exact
snapshot shape when the optional port is absent.

## 2. Public neutral contract

Core adds these Public + Experimental + Active symbols:

```ts
export interface AsyncValidationCancellation {
  isCancelled(): boolean;
  onCancel(listener: () => void): Unsubscribe;
}

export interface AsyncValidationContext {
  readonly generation: number;
  readonly cancellation: AsyncValidationCancellation;
}

export interface AsyncSchemaValidator {
  validate(
    schema: unknown,
    value: unknown,
    context: AsyncValidationContext,
  ): PromiseLike<ValidationResult>;
}

export type AsyncValidationState =
  | { readonly status: 'blocked'; readonly reason: 'sync-invalid' }
  | { readonly status: 'pending'; readonly generation: number }
  | {
      readonly status: 'settled';
      readonly generation: number;
      readonly valid: boolean;
    }
  | {
      readonly status: 'failed';
      readonly generation: number;
      readonly reason: 'exception' | 'invalid-result' | 'generation-exhausted';
    };
```

`schema` and `value` are the exact borrowed read-only runtime references. The
port must not mutate them. A generation is runtime-local, begins at `1`, grows
by one per start and is always a positive safe integer.

The core-owned cancellation object is stable for one generation.
`isCancelled()` changes from false to true once. `onCancel()` delivers callable
listeners once in registration order and returns an idempotent unsubscribe.
Unsubscribing first suppresses delivery. Registration after cancellation calls
the listener before returning and returns a no-op unsubscribe. The Public
contract accepts only callable listeners; a JavaScript call outside that
contract is unsupported. Listener throws are isolated, do not stop delivery
and produce no diagnostic or console output. Core freezes context/capability
objects; they expose no timer,
promise, `AbortSignal`, framework object or mutable collection.

Existing contracts gain only:

```ts
interface ControlledFormRuntimeOptions<TData extends object> {
  // existing members unchanged
  readonly asyncValidator?: AsyncSchemaValidator;
}

interface FormRuntimeSnapshot<TData extends object> {
  // existing members unchanged
  readonly asyncValidation?: AsyncValidationState;
}

interface ValidationSnapshot {
  // existing members unchanged
  readonly asyncValidation?: AsyncValidationState;
}

interface FormRuntime<TData extends object> {
  // existing members unchanged
  retryAsyncValidation(): RuntimeActionResult;
}
```

Absent or own data `undefined` means unconfigured. Both snapshot members are
then absent as own properties, no generation is created and all existing
validity, issue and reference behavior remains exact. When configured, both
form-level snapshots always expose the same current frozen state object. Node,
field, item and operation contracts gain nothing.

`AngularControlledFormConfig<TData>` receives the option transitively through
its existing `Omit` shape. `SchemaFormDirective` adds only
`retryAsyncValidation(): RuntimeActionResult`, forwards diagnostics through its
existing channel and projects the root state through its existing Signal. It
adds no output, scheduler, bridge or renderer contract.

## 3. Option validation and creation

After all existing option checks through validation visibility, and before the
initial synchronous validator invocation, core reads only the own optional
descriptor. Inherited is absent; an accessor is invalid and never invoked; any
defined value must be a non-array object with an own data `validate` member
whose value is callable. Its missing, inherited or accessor `validate` is an
invalid value and is never invoked.

Invalid input blocks before synchronous validation with exactly one existing
`INVALID_RUNTIME_OPTIONS`, `error`/`runtime`, no paths, fallback `Runtime option
"asyncValidator" is invalid.`, and:

```ts
{
  member: 'asyncValidator';
  expected: 'object with callable validate or undefined';
  reason: 'accessor-member' | 'invalid-value';
  // existing safe actual description only for invalid-value
}
```

No async call occurs when any earlier option, definition, external-data or
synchronous-validation boundary blocks creation. After synchronous success:

- unconfigured creation is observably unchanged;
- configured `sync.valid === false` creates `blocked` without invocation; and
- configured `sync.valid === true` creates generation `1` as `pending` and
  invokes the port exactly once.

Creation returns the pending runtime before observing any outcome. Port throws,
invalid returns, hostile thenables, fulfilments and rejections are all reduced
in a later ECMAScript promise job. They never amend the creation result.

## 4. Trigger and transition order

| Cause                          | Sync gate            | Configured async effect                    |
| ------------------------------ | -------------------- | ------------------------------------------ |
| creation                       | valid                | start generation 1                         |
| creation                       | invalid              | `blocked`; no call                         |
| accepted new `value` reference | valid                | cancel, clear old async issues, start next |
| accepted new `value` reference | invalid              | cancel, clear old async issues, `blocked`  |
| explicit retry                 | current sync valid   | cancel, clear and start next               |
| explicit retry                 | current sync invalid | fail action; no transition                 |
| baseline/locale only           | not run              | preserve                                   |
| visibility/touched/focus/scope | not run              | preserve                                   |
| operation intention            | not run              | preserve                                   |
| rejected or no-effect update   | not run              | preserve                                   |

Every `start` row assumes that another safe generation is allocatable. After
the maximum generation, section 7's closed exhaustion behavior replaces it.

A combined accepted update follows its single value row; baseline and locale
never add a generation. Only later confirmation by a different value reference
can trigger after an operation. Existing structural/sync checks finish before
replacement. A failed update is atomic, does not cancel and preserves all old
references, state, issues and generation.

Every start performs, in order:

1. mark the active prior capability cancelled;
2. deliver and release its callbacks in registration order;
3. allocate the next generation and fresh capability;
4. discard the prior async result/issues;
5. commit one root `pending` snapshot with synchronous issues;
6. invoke the port once with exact schema/value and frozen context; and
7. deliver the controlling action's pending snapshot under existing synchronous
   subscription rules before it returns.

No port outcome is reduced during these steps, including a synchronously
fulfilled thenable. One accepted update emits at most this pending/blocked
snapshot before return; later completion is a separate snapshot and never an
operation. Debounce and delayed transport belong only to the integration.

## 5. Assimilation, cancellation and failure

The return must be an object/function with callable `then`. Core defensively
assimilates it and accepts only its first settlement. Non-thenable is
`invalid-result`; port throw, throwing `then` access/call or rejection is
`exception`. Thrown/rejected values are discarded.

Before reducing any queued observation, core verifies the private generation
record, number, cancellation and disposal state. Cancelled, superseded,
already-completed and post-disposal outcomes are silent: no state, snapshot,
listener, operation, diagnostic or console effect.

A current fulfilment uses the existing descriptor-safe `ValidationResult` and
`ValidationIssue` normalization and closed malformation reasons. Core copies
and freezes the issue array, issues, paths and accepted parameter containers;
it retains no caller result/issue/descriptor/mutable parameter container.
`valid` remains the explicit boolean: M26 neither derives it from issue count
nor changes synchronous normalization. Port issue order is preserved.

Global `path: []` is accepted. Every non-global async path must resolve through
current accepted assignment:

- exact managed path attaches to that node;
- deeper unmanaged path attaches to its deepest managed object/item/array
  ancestor;
- positional collection paths use the current value and identity state; and
- no managed assignment target fails the whole result as `invalid-result`.

No partial result is committed. Unknown paths are not made global, reassigned
arbitrarily or emitted as `UNKNOWN_VALIDATION_ISSUE_PATH`; D-022 stays inactive.

A valid current fulfilment commits `settled` with generation and normalized
`valid`. A current exception/rejection commits failed `exception`; any malformed
thenable/result/issue/path commits failed `invalid-result`. Failure retains only
synchronous issues and exposes no vendor value, promise, issue index or
malformation subtype. Before either current settlement becomes observable, core
marks that generation completed and releases its cancellation listeners without
invoking them. Its capability is no longer active; later replacement does not
cancel an already completed generation.

## 6. Observable validity, issues and sharing

| State     | Root `valid`                | Projected issues       |
| --------- | --------------------------- | ---------------------- |
| `blocked` | false                       | synchronous only       |
| `pending` | false                       | synchronous only       |
| `failed`  | false                       | synchronous only       |
| `settled` | `sync.valid && async.valid` | sync first, then async |

Order within each source is retained and no issue is deduplicated. Assignment
to node/global arrays retains cross-source order. A replacement removes old
async issues before pending is visible. Root identity changes on every start,
block, settle, failure and exhaustion transition, including pending-to-pending
with a new generation.

In blocked/pending/failed states, node/field/item validity, issues and visibility
remain derived from synchronous issues; incompleteness adds no node issue. At
settlement they derive from composed issues under existing assignment,
aggregation, collection, touched/all and forced-scope rules. Core rebuilds only
observably affected snapshots and accepted aggregate ancestors. State-only and
failure-only transitions reuse all unchanged node/field/item snapshots.

Unscoped validation snapshots mirror root validity, issues and the same state
object. Valid scopes filter current issues normally but report false throughout
blocked/pending/failed, even with no filtered issues. Settled scope validity is
true exactly when its filtered composed issues are empty. Invalid scopes retain
their existing false/empty/diagnostic result and mirror optional async state.
Reads never trigger work. Unconfigured snapshots omit the member and remain
exactly unchanged.

## 7. Retry and overflow

After existing disposed precedence, configured + sync-valid + allocatable retry
always replaces the generation, including while pending, and returns:

```ts
{
  success: true,
  effects: { snapshotChanged: true, operationEmitted: false },
  diagnostics: [],
}
```

It changes no controlled value and does not rerun synchronous validation.
Otherwise it fails without effects or transition with exactly one
`ASYNC_VALIDATION_RETRY_UNAVAILABLE`, `error`/`runtime`, no paths, fallback
`Asynchronous validation cannot be retried.`, and:

```ts
{
  action: 'retryAsyncValidation';
  reason: 'not-configured' | 'sync-invalid' | 'generation-exhausted';
}
```

After allocating `Number.MAX_SAFE_INTEGER`, core never wraps, reuses or invokes
again. Explicit retry returns the exhaustion diagnostic and preserves state. A
later accepted new value still updates sync state, cancels an active maximum
generation and commits failed `{ generation: Number.MAX_SAFE_INTEGER, reason:
'generation-exhausted' }`. It has sync issues and false root/scope validity;
only a fresh runtime resets numbering.

## 8. Disposal and adapters

`dispose()` cancels an active capability, delivers/releases callbacks, then
performs existing idempotent cleanup. It emits no snapshot and retains the final
readable snapshot, so a disposed runtime may read a final pending state. All
late outcomes are silent; retry returns `RUNTIME_DISPOSED`.

Async commits use only the ordered snapshot channel and existing listener
isolation. Angular and Standard consume identical core state. Renderers may
display normalized state/issues but never receive the port/context, retry,
cancel, inspect promises or own generations.

One shared reference scenario uses identical schema, UI Schema, controlled
values, issue codes, labels and explanation. Each target owns an independent
deterministic app integration with no network. Evidence covers initial pending
and settlement, managed async issue, sync blocking, two rapid values with a
silent stale completion, explicit retry after exception/rejection, neutral
cancellation bridging and unchanged sync Ajv gating. App controls may resolve
deferred test work; they add no core timer or production policy.

## 9. Public API inventory

Exact Public + Experimental + Active delta:

- new core: `AsyncValidationCancellation`, `AsyncValidationContext`,
  `AsyncSchemaValidator`, `AsyncValidationState`;
- changed core: optional `asyncValidator`, optional `asyncValidation` on both
  form-level snapshots, and `FormRuntime.retryAsyncValidation()`;
- changed Angular: transitive option and directive retry method; and
- new diagnostic: `ASYNC_VALIDATION_RETRY_UNAVAILABLE`.

New types use the existing core root and existing Angular transitive re-export.
No entry point/package/export-map key is added. `SchemaValidator`,
`ValidationResult`, Ajv, operations, renderers, compiler definitions and
application ownership remain unchanged. No unlisted Public symbol or diagnostic
may be added without revising an Accepted contract.

## 10. Required conformance

A future plan must map fixtures for:

1. option absence/undefined/inheritance/accessor/malformed shapes and order;
2. initial gate and exact trigger/non-trigger matrix;
3. cancellation order, unsubscribe, late registration and throw isolation;
4. generation/retry/overflow with practical injected state;
5. throw, non-thenable, hostile thenable, sync settlement, repeats/rejection;
6. every existing malformed result/issue reason and unknown-path fail closure;
7. global/nested/deep/collection/invalid-identity issue assignment;
8. source order, no dedupe, removal and detached immutability;
9. root/node/global/scope validity for all states, including false/no-issue and
   true/with-issue results;
10. structural sharing and atomic failure preserving active work;
11. disposal, final read, silent late completion and retry precedence;
12. declarations/root exports/package smoke and exact unconfigured shape;
13. Angular Signal/retry/diagnostics and independent Standard parity;
14. deterministic shared reference evidence; and
15. full M1–M25 regression, boundaries, builds, docs and browsers without Ajv,
    dependency, version or release changes.

## 11. Non-goals and gate

Ajv `$async`, remote schemas/compilation, custom keywords, HTTP, auth, timers,
core debounce, automatic retry, submit/persistence, optimistic/partial
validation, dynamic definitions, workers, SSR policy, framework validators,
React, Vue, new packages, versioning, release/publication, Stable promotion and
D-022 remain outside M26.

Acceptance requires declaration-ready exactness, deterministic ordering, all
four state/validity/sharing rules, hostile-boundary closure, exact unconfigured
compatibility, framework-neutral core, inactive exclusions and one complete
zero-finding review after all corrections.

Acceptance may authorize only preparation/review of PLAN-028. Implementation
requires that plan's separate approval. Transport ownership, async Ajv, retained
stale issues, root mutation or persistent diagnostics require a new decision.

Ricard explicitly accepted SPEC-012 v0.1.0 on 2 August 2026 after review 237
cycle 2 passed all eighteen areas with zero findings. Acceptance authorizes only
PLAN-028 preparation and complete review.

## 12. History

| Version | Date          | Change                                          |
| ------- | ------------- | ----------------------------------------------- |
| 0.1.0   | 2 August 2026 | Initial Draft; corrected by review 237 cycle 1. |
