# ADR 029: Controlled asynchronous validation lifecycle

- **State:** Accepted revision 0
- **Date:** 2026-08-02
- **Acceptance date:** 2026-08-02
- **Complete review:** [Review 236](../reviews/236-adr-029-review.md) cycle 2
  passed all fourteen areas with zero findings
- **Milestone:** M26 — Controlled asynchronous validation
- **Promotes:** only the bounded D-003 slice selected by
  [review 235](../reviews/235-d003-m26-async-validation-promotion-readiness.md)
- **Requires:** Accepted SPEC-001 v0.1.15, SPEC-007 v0.1.0, ADR-005 revision 6,
  ADR-009, ADR-010 and ADR-022 revision 3
- **Authority:** Accepted M26 architecture only; authorizes preparation and
  review of a dedicated extension SPEC, not implementation, dependency changes,
  versioning, release, publication, commit, push or external mutation

## 1. Context

The controlled runtime currently invokes one replaceable `SchemaValidator`
synchronously during creation and each identity-changing value update. This
keeps validation deterministic and lets snapshots expose complete validity and
issues immediately. The reusable Ajv integration intentionally implements only
that contract.

Consumers also need service-backed rules such as uniqueness, authorization or
policy checks. Those checks introduce pending state, cancellation, replacement,
late results and failures. Implementing them independently in Angular and
Standard would duplicate domain lifecycle and produce incompatible snapshots;
putting HTTP, timers or `AbortSignal` in core would violate the framework and
environment boundary.

## 2. Decision

### 2.1 Core owns orchestration; the consumer owns effects

Core will define an optional Public + Experimental asynchronous validation port
and own its deterministic lifecycle inside the controlled runtime. The
consumer-supplied implementation owns debounce, remote calls, authentication,
retry policy and adaptation to transport-specific cancellation such as
`AbortSignal`.

The existing `SchemaValidator`, `ValidationResult` and synchronous Ajv package
remain unchanged and required. Configuring no asynchronous validator preserves
the current runtime behavior and snapshot semantics exactly.

The asynchronous port receives the same schema/value identities plus a neutral
context containing a monotonically increasing runtime-local generation and a
neutral cancellation capability. Core will not import or construct HTTP,
timers, DOM, RxJS, Angular or browser cancellation objects. The extension SPEC
must fix the descriptor-safe shape and lifecycle of this port before it becomes
implementable.

Schema and value are borrowed read-only references. The integration must not
mutate them or retain mutable derivatives as observable results. Core validates,
detaches and freezes every accepted asynchronous result through the same safe
normalization boundary used for synchronous validation; promises, thenables,
cancellation objects and vendor errors never enter snapshots.

### 2.2 Trigger and synchronous gate

The runtime will evaluate synchronous validation first. It will start an
asynchronous generation only:

- after successful runtime creation when the synchronous result is valid;
- after an accepted `updateExternalState()` changes the `value` reference and
  the new synchronous result is valid; or
- after an explicit asynchronous retry for the current schema/value identities.

A synchronously invalid value cancels any active generation and blocks remote
validation. Baseline, locale, visibility, touched, focus and operation
intentions do not trigger it. The schema remains immutable for a runtime;
configuration editing continues to create a fresh runtime.

Core invokes the asynchronous port immediately. Any debounce happens inside
the supplied integration while its generation remains pending and cancellable.
This avoids timers and hidden scheduling policy in core.

### 2.3 Generation, cancellation and stale results

Each start allocates the next positive safe-integer generation. Before starting
a replacement, core marks the prior neutral cancellation capability cancelled
and notifies its registered callbacks once. Cancellation is advisory to the
integration but authoritative to core: a completion for a cancelled,
superseded or disposed generation is ignored without snapshot or diagnostic
emission.

Cancellation registration and delivery are runtime-local, ordered and
idempotent. A throwing cancellation callback is isolated from the remaining
callbacks, runtime state and replacement generation; core neither rethrows it
from the controlling action nor writes it to console.

Completion is always observed asynchronously after the current runtime action
has returned, including a synchronously fulfilled thenable. This preserves
atomic `updateExternalState()` and prevents reentrant snapshot delivery.
Disposal cancels the active generation, releases cancellation listeners and
silences every later completion.

Core does not expose a general user-facing cancel action in M26. Cancellation
occurs only through supersession, synchronous invalidity or disposal. An
explicit retry starts a replacement generation, emits no operation and keeps
the controlled value unchanged.

### 2.4 Snapshot state and validity

When the optional port is configured, the root snapshot exposes one immutable
asynchronous-validation state with closed states equivalent to:

- blocked by the current synchronous result;
- pending for one generation;
- settled with one accepted asynchronous result; or
- failed because the port threw, rejected or returned a malformed result.

The extension SPEC will choose exact Public names and members. It must not
expose thrown values, rejection reasons, vendor errors or mutable promises.

While blocked, pending or failed, root `valid` is `false`. While settled, root
`valid` is true only when both synchronous and asynchronous results are valid.
With no asynchronous validator, existing synchronous `valid` behavior is
unchanged.

Pending and failed states retain only synchronous issues in field/global issue
arrays. A settled generation composes issues in deterministic source order:
all synchronous issues first, then all asynchronous issues, preserving order
within each source and performing no implicit deduplication. Existing path
assignment, scopes and visibility apply to the composed immutable issues.

While pending or failed, field/node `valid` remains derived from its currently
projected synchronous issues; only root and scoped validation are
conservatively incomplete and therefore report `valid: false`. The form-level
and scoped snapshots expose the asynchronous state so consumers never infer
completion from field validity alone. After settlement, field/node, root and
scope validity are derived from the composed issues under their existing path
and global-issue rules.

Because asynchronous completion has no action result through which to deliver
the existing `UNKNOWN_VALIDATION_ISSUE_PATH` warning, every non-global async
issue path must resolve to a managed runtime node. An unknown path makes the
generation fail with the closed `invalid-result` reason; it is not silently
dropped, reassigned or persisted as a diagnostic. This narrow fail-closed rule
avoids activating D-022.

Pending-only transitions reuse unchanged field/node snapshots. Settlement
rebuilds only snapshots whose validity, issues or derived visibility changed.
The root snapshot changes for every observable asynchronous state transition.

### 2.5 Failure semantics

A throw before the asynchronous result is obtained, promise rejection or
malformed `ValidationResult` moves only the current generation to failed. It
does not throw from a later turn, emit a form operation, mutate controlled data,
convert technical failure into a data `ValidationIssue` or write to console.

The failed state exposes only a closed neutral reason sufficient to distinguish
an exception/rejection from an invalid result. Retry is explicit. A later value
identity change may start a new generation normally after synchronous success.
M26 does not add the persistent diagnostic/DevTools channel deferred by D-022.

### 2.6 Adapter and reference boundaries

Angular projects the core snapshot through its existing Signals lifecycle and
mirrors the optional configuration member without owning concurrency. Standard
subscribes to the same core state. Renderers may display already-normalized
pending/failed/issue state but never start, cancel or retry validation and never
interpret promises.

The shared reference catalog may define one deterministic service-validation
scenario. Angular and Standard must supply independent app-level integrations
with equivalent observable behavior and no real network. The Ajv package stays
synchronous and unchanged.

## 3. Consequences

- Both targets share one race-safe lifecycle and issue composition model.
- Existing consumers pay no behavioral cost when the optional port is absent.
- Core gains asynchronous orchestration and snapshot states but no transport,
  timer, framework or browser dependency.
- Consumers can adapt cancellation to their HTTP stack and choose debounce and
  retry policy explicitly.
- Conservative `valid: false` while pending/failed prevents incomplete remote
  validation from being mistaken for successful validation.
- The runtime must defend against hostile thenables, malformed results,
  cancellation callback failures, generation overflow and late completion.

## 4. Rejected alternatives

- **Keep async state entirely in each application shell:** duplicates lifecycle
  and prevents framework-neutral snapshots and conformance.
- **Make `SchemaValidator.validate()` return sync-or-promise:** breaks the
  accepted synchronous contract and complicates every existing consumer.
- **Add `$async` or remote loading to the Ajv package:** couples business/service
  validation to schema compilation and contradicts SPEC-007.
- **Use `AbortSignal` in core:** introduces a browser/platform contract; an
  integration may bridge the neutral cancellation capability instead.
- **Put debounce/timers in core:** chooses product scheduling policy and adds
  environment dependencies without one universal requirement.
- **Retain the last async issues while a new generation is pending:** displays
  issues for a stale value and obscures source validity.
- **Treat rejection as a global validation issue:** conflates technical
  availability with invalid business data.
- **Implicit retry loops:** hide network policy and can keep a runtime pending
  indefinitely.

## 5. Explicit exclusions

Ajv `$async`, remote schema loading, asynchronous schema compilation, custom
keywords, HTTP clients, authentication, timers, built-in debounce, automatic
retry, submit/persistence state, optimistic value projection, partial
validation, dynamic definitions, workers, SSR policy, framework validator
bridges, React, Vue, new packages, versioning, release and publication.

## 6. Follow-up gate

Acceptance authorizes only preparation and complete review of an extension SPEC
that fixes the exact Public contracts, action results, lifecycle ordering,
normalization, structural sharing, conformance rows and migration behavior.
Implementation requires a separately Approved plan. Any need for transport
ownership, async Ajv, retained stale issues, root mutation or a persistent
diagnostic channel stops M26 for a new decision.
