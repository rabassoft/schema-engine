# PLAN-028: Controlled asynchronous validation

- **Status:** Completed revision 0
- **Date:** 2026-08-02
- **Approval date:** 2026-08-02
- **Completion date:** 2026-08-02
- **Milestone:** M26 — Controlled asynchronous validation
- **Requires:** Accepted ADR-029 revision 0 and SPEC-012 v0.1.0
- **Approval review:** [review 238](../reviews/238-plan-028-review.md) cycle 2
  passed all eighteen areas with zero findings
- **Final implementation review:** [review 244](../reviews/244-plan-028-final-implementation-review.md)
  cycle 2 repeated the complete matrix with zero findings
- **Implementation authorized:** Yes, checkpoints 1–6 in order; commit, push,
  dependency, version, release, publication and external actions remain gated
- **Progress:** checkpoints 1–6 completed; final review 244 cycle 2 passed with
  zero findings and closed PLAN-028/M26 without release or external mutation

## 1. Goal and boundary

Implement only SPEC-012's optional Public Experimental async-validation port,
core lifecycle, Angular forwarding and deterministic Angular/Standard reference
evidence. Preserve the required synchronous validator, application-owned value
and baseline, existing operations and exact snapshot shape when unconfigured.

No checkpoint changes Ajv production code, adds HTTP/timers/`AbortSignal` to
core, adds a package/dependency/entry point, implements partial validation or
D-022, changes versions, releases, publishes, commits, pushes or mutates
external state.

## 2. Delivery rules

1. Execute checkpoints in order; name the current checkpoint only in
   `STATUS.md` before work.
2. Preserve unrelated dirty changes and scope each diff to named packages/apps.
3. Add focused tests before closure; after any finding, correct and repeat the
   complete checkpoint review until one pass has zero findings.
4. At each closure, record its review, compact `STATUS.md`, prepend
   `WORKLOG.md`, run `pnpm docs:check` and keep the next exact action current.
5. Do not revise Accepted SPEC behavior from implementation. Stop for any
   contract ambiguity or materially different architectural alternative.
6. Commit, push, dependency graph, version, release, publication and external
   actions remain separately gated.

## 3. Checkpoint 1 — Public contracts and option boundary

### Deliverables

1. Add/root-export exactly `AsyncValidationCancellation`,
   `AsyncValidationContext`, `AsyncSchemaValidator` and
   `AsyncValidationState` with SPEC-012 declarations.
2. Add only the optional async validator/state members and
   `FormRuntime.retryAsyncValidation()` to their accepted core contracts.
3. Validate absent, own `undefined`, inherited, accessor, malformed and valid
   async options after visibility and before initial sync invocation, with the
   exact `INVALID_RUNTIME_OPTIONS` envelope/order.
4. Preserve exact own-property snapshot shape and behavior when unconfigured.
5. Add compile-time declarations, core root imports and package smoke; do not
   add an entry point or diagnostic beyond the SPEC inventory.

### Required evidence

```sh
pnpm exec prettier --check packages/core .ai-docs
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm --filter @rabassoft/schema-engine test:package
pnpm docs:check
git diff --check
```

### Completion gate

One complete Public-surface/options review passes declarations, ordering,
descriptor safety, package smoke and unconfigured compatibility with zero
findings. No async orchestration is considered complete here.

Completed on 2026-08-02 after review 239 cycle 2. The configured generation,
state and retry lifecycle remains deliberately assigned to checkpoints 2–3 and
is not represented as complete by this staged checkpoint.

## 4. Checkpoint 2 — Core generation and cancellation lifecycle

### Deliverables

1. Add runtime-local positive safe generations, frozen context/capability,
   ordered registration, idempotent unsubscribe and late-registration behavior.
2. Implement the exact creation/update/retry trigger matrix and sync-valid gate.
3. On replacement, cancel/deliver/release before allocating and committing the
   next pending generation; isolate callback throws without diagnostics/logging.
4. Preserve active work on rejected/no-effect updates and all non-trigger
   actions; clear old async issues on every accepted replacement/block.
5. Defensively assimilate thenables so every outcome is reduced after the
   controlling action, once only, and stale/cancelled/disposed outcomes are
   silent.
6. Release completed-generation callbacks without cancellation; implement
   maximum-safe-integer exhaustion through an injectable internal test seam,
   never a production Public hook.

### Required evidence

Focused fake validators/thenables prove SPEC-012 conformance groups 2–5, then:

```sh
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine test
pnpm docs:check
git diff --check
```

### Completion gate

One complete lifecycle review passes trigger, ordering, cancellation, hostile
thenable, stale, repeated settlement, atomic failure and overflow areas with
zero findings and no framework/environment dependency.

Completed on 2026-08-02 after review 240 cycle 2. Full issue/result
normalization, composed node/scope projection and final retry/disposal evidence
remain assigned to checkpoint 3.

## 5. Checkpoint 3 — Results, snapshots, scopes, retry and disposal

### Deliverables

1. Normalize/detach/freeze async results through the existing safe validation
   boundary while keeping explicit `valid` semantics unchanged.
2. Fail the entire current result for malformed data or a non-global path with
   no managed assignment target; emit no D-022/persistent diagnostic.
3. Compose sync issues first and async issues second with stable source order,
   no dedupe and exact global/nested/collection assignment.
4. Implement blocked/pending/settled/failed root validity, synchronous-only
   node validity while incomplete, settled node projection and scoped rules.
5. Preserve node/item identities for state-only transitions and rebuild only
   affected snapshots/ancestors after settlement.
6. Implement exact retry success/unavailable diagnostic/disposed precedence,
   disposal cancellation, retained final read and silent late results.
7. Cover explicit false/no-issue and true/with-issue results so root versus
   scope/node semantics match the Accepted contract rather than assumptions.

### Required evidence

Focused fixtures map SPEC-012 groups 6–12, including descriptor-hostile results,
positional collections, invalid identity and structural sharing, then:

```sh
pnpm exec prettier --check packages/core .ai-docs
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm --filter @rabassoft/schema-engine test:package
pnpm docs:check
git diff --check
```

### Completion gate

One complete core-observable review passes normalization, issue order/path,
four-state validity, scopes, sharing, retry, disposal, declarations and package
smoke with zero findings.

Completed on 2026-08-02 after review 241 cycle 2. Five findings were corrected:
recursive async parameter detachment, configured unscoped root-validity parity,
hostile descriptor-trap containment and isolation of the stronger copy from
unchanged synchronous normalization, plus stale active-state documentation. All
fifteen areas pass with zero findings; Angular projection remains assigned to
checkpoint 4.

## 6. Checkpoint 4 — Angular projection

### Deliverables

1. Accept `asyncValidator` through existing config/runtime recreation without
   owning generation, cancellation or scheduling.
2. Mirror `retryAsyncValidation()` and route its ephemeral diagnostics through
   the existing directive diagnostics channel.
3. Project root async state through the existing Signal and preserve all
   current renderer inputs/outputs, operation ownership and lifecycle cleanup.
4. Add consumer/package-smoke evidence for configured and unconfigured forms,
   pending-to-settled/failed updates, retry and destroy with late completion.
5. Do not change Ajv integration, Signal Forms ownership, renderer registration,
   peer dependencies, exports or entry points.

### Required evidence

```sh
pnpm --filter @rabassoft/schema-engine-angular typecheck
pnpm --filter @rabassoft/schema-engine-angular build
pnpm --filter @rabassoft/schema-engine-angular test
pnpm --filter @rabassoft/schema-engine-angular test:package
pnpm test:consumer
pnpm docs:check
git diff --check
```

### Completion gate

One complete Angular review passes Public forwarding, Signal projection,
diagnostics, recreation/destroy and zero renderer orchestration with zero
findings.

Completed on 2026-08-02 after review 242 cycle 2. Angular/package/consumer
evidence passes with zero code findings. A Codex-host esbuild deadlock was
isolated from a successful operator-terminal production build and all command
components; the existing bundle/Ajv warnings remain non-blocking observations.

## 7. Checkpoint 5 — Shared scenario and independent target integrations

### Deliverables

1. Add one authoring-safe shared service-validation scenario with common
   schema/UI Schema/value/baseline/issue codes/labels/explanation.
2. Supply independent app-level Angular and Standard async validators with
   equivalent deterministic deferred controls and no network or production
   timer policy.
3. Demonstrate initial pending/settled, managed async issue, sync-invalid
   blocked, rapid-value stale suppression, exception/rejection failure, retry
   and neutral cancellation bridging.
4. Add accessible application-level state/retry evidence without teaching a
   renderer to start/cancel/retry or exposing promises/vendor errors.
5. Preserve schema editing as fresh-runtime creation, official synchronous Ajv
   gating, catalog/source authority, snippet generation and shell isolation.
6. Add unit and Chromium parity assertions for both targets, including no
   operation emission and exact unconfigured scenarios.

### Required evidence

```sh
pnpm reference:snippets
pnpm --filter @schema-engine-internal/reference-scenarios typecheck
pnpm --filter @schema-engine-internal/reference-scenarios build
pnpm --filter @schema-engine-internal/reference-scenarios test
pnpm reference:test:unit
pnpm reference:standard:test:unit
pnpm reference:test:boundaries
pnpm reference:test:e2e
pnpm reference:standard:test:e2e
pnpm docs:check
git diff --check
```

### Completion gate

One complete cross-target review passes shared authoring, independent effects,
observable parity, stale/cancel/retry behavior, accessibility, snippets,
boundaries and Chromium evidence with zero findings.

## 8. Checkpoint 6 — Complete repeated review and closure

### Required matrix

1. Restore only the pinned graph and prove no lock/dependency drift:

   ```sh
   pnpm install --frozen-lockfile
   ```

2. Run the complete workspace matrix:

   ```sh
   pnpm format:check
   pnpm docs:check
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm test:package
   pnpm test:source
   pnpm test:release:tooling
   pnpm test:public-repository
   pnpm check:public-repository
   pnpm audit:release
   pnpm reference:snippets:check
   pnpm reference:test:boundaries
   pnpm reference:test:e2e
   pnpm reference:standard:test:e2e
   git diff --check
   ```

3. Inspect declarations/exports, package peers/maps, dependency/lock diff,
   core import graph, Ajv production-source invariance, runtime state inventory,
   both app-owned integrations and complete scoped diff.
4. Reconcile root/package onboarding, SPEC/ADR/plan indexes, ROADMAP, Deferred,
   `STATUS.md` and newest `WORKLOG.md` entry.
5. Correct every finding and repeat the complete matrix until one full pass has
   zero findings. Rerun unchanged outside the sandbox only when a documented
   restricted IPC/network condition prevents the accepted command.

### Completion gate

Only a complete zero-finding pass may mark PLAN-028/M26 Completed and record
implemented M1–M26. Package versions and published M23 artifacts remain
unchanged; release and commit/push remain separately gated.

## 9. Stop conditions

Stop for any change to SPEC-012/ADR-029; synchronous validator/Ajv production
contract; HTTP/timer/`AbortSignal`/framework dependency in core; retained stale
issues; partial/field-trigger API; persistent diagnostics; dynamic definitions;
renderer orchestration; new package/dependency/entry point; React/Vue; version,
release or publication; destructive action; commit; push; or unresolved
authoritative conflict.
