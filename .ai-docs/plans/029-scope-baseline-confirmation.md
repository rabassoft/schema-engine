# PLAN-029: Scope-to-baseline confirmation

- **Status:** Completed revision 1
- **Date:** 2026-08-02
- **Approval date:** 2026-08-02
- **Completion date:** 2026-08-03
- **Milestone:** M27 — Scope-to-baseline confirmation
- **Requires:** Accepted ADR-030 revision 0 and SPEC-013 v0.1.1
- **Approval reviews:** [review 248](../reviews/248-plan-029-review.md) cycle 3
  passed revision 0 with zero findings; [review 251](../reviews/251-plan-029-revision-1-review.md)
  cycle 1 passed the complete reconciled revision 1 with zero findings
- **Implementation authorized:** Yes, checkpoints 1–6 in order; commit, push,
  dependency, version, release, publication and external actions remain gated
- **Progress:** checkpoints 1–6 completed after reviews 252–257 passed with zero
  findings; final review 257 cycle 2 completed PLAN-029/M27

## 1. Goal and boundary

Implement only SPEC-013's pure Public Experimental
`commitScopeToBaseline()` helper, exact diagnostics, managed static/collection
reconstruction, package evidence and independent Angular/Standard reference
consumption. Preserve application ownership of value, baseline and persistence;
the runtime gains no action or method.

No checkpoint adds a package, entry point or dependency; changes a validator,
renderer or adapter contract; implements persistence, submit, autosave,
defaults, transactions or scoped validation; changes a version; releases,
publishes, commits, pushes or mutates external state.

## 2. Delivery rules

1. Execute checkpoints in order and name only the current checkpoint in
   `STATUS.md` before implementation work.
2. Preserve all unrelated dirty changes and scope each checkpoint diff to its
   named packages, apps, tests and documentation.
3. Keep the helper Internal until static and collection behavior is complete;
   add the sole root export only in checkpoint 3.
4. Reuse or minimally extract existing descriptor-safe definition/path/
   collection rules when their semantics are exact. Any extraction must keep
   existing runtime and operation behavior byte-for-byte observable through
   their full focused suites.
5. Add focused tests with each deliverable. After any review finding, correct
   it and repeat the complete checkpoint review until one pass has zero
   findings.
6. At each closure, record its review, compact `STATUS.md`, prepend
   `WORKLOG.md`, run `pnpm docs:check` and keep the next action exact.
7. Do not reinterpret Accepted ADR/SPEC behavior. Stop for any contract
   ambiguity, new Public symbol, materially different collection semantics or
   deferred capability.
8. Commit, push, dependency graph, version, release, publication and external
   actions remain separately gated.

## 3. Checkpoint 1 — Internal input, target and diagnostic foundation

### Deliverables

1. Add one Internal core module for scope-to-baseline confirmation without
   exporting it from the package root.
2. Reuse the complete collection-capable manual-definition defect catalog and
   emit exact existing `INVALID_FORM_DEFINITION` envelopes/order.
3. Implement baseline-before-current descriptor-safe managed-tree inspection,
   identity-state capture, scope exterior parsing and copied static/stable
   targets in SPEC-013 order.
4. Implement exact frozen `INVALID_BASELINE_CONFIRMATION` and
   `UNCONFIRMABLE_SCOPE_TARGET` envelopes, safe parameters, shape-first then
   availability-first ordering and mixed-target atomic failure.
5. Canonicalize empty, duplicate and overlapping valid targets without caller
   order effects; retain the broadest target and canonical definition/identity
   order.
6. Add iterative hostile-input tests for ordinary/null roots, inherited and
   accessor members, reflection traps, sparse/numeric/root/unknown paths,
   malformed addresses, invalid identities and aliased/cyclic data.
7. Do not add successful non-empty reconstruction or a Public root export in
   this checkpoint; a valid empty scope is the only complete success path.

### Required evidence

```sh
pnpm exec prettier --check packages/core .ai-docs
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm docs:check
git diff --check
```

### Completion gate

One complete foundation review passes definition/root/scope ordering, every
input/target diagnostic row, copying, overlap, deep iteration, trap isolation
and zero Public export with no finding. Reconstruction remains assigned to
checkpoints 2–3.

## 4. Checkpoint 2 — Primitive and nested-object reconstruction

### Deliverables

1. Implement primitive presence/value confirmation without schema validation,
   including missing versus own `undefined`, `null`, empty string, false and
   zero.
2. Implement object-wide managed projection for missing, compatible and
   incompatible current/baseline nodes whose selected subtree contains no
   collection. Object targets that transitively select an array remain assigned
   to checkpoint 3.
3. Materialize only required compatible missing baseline ancestors; preserve
   unselected terminals and reject narrower targets below either incompatible
   ancestor.
4. Clone changed baseline objects with exact ordinary/null prototypes and
   off-target keys/descriptors; replace managed members with accepted ordinary
   data descriptors and preserve baseline unmanaged members.
5. Detect semantic no-effect through accepted managed dirty equality rather
   than container identity; merge multiple target changes into one ancestor
   clone.
6. Contain changing reflection/clone failures as exact
   `BASELINE_CONFIRMATION_FAILED`, discard partial candidates and keep the
   original baseline.
7. Add deep iterative, cyclic/shared-value, descriptor, structural-sharing and
   order-independent fixtures. Keep the helper Internal and collection
   reconstruction incomplete.

### Required evidence

```sh
pnpm exec prettier --check packages/core .ai-docs
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm docs:check
git diff --check
```

### Completion gate

One complete static-reconstruction review passes every applicable
non-collection SPEC-013 primitive, object, ancestor, unmanaged, descriptor,
no-effect and sharing row with zero findings. Object subtrees containing
collections, every collection target and Public exposure remain incomplete.

## 5. Checkpoint 3 — Collections, stable targets and Public exposure

### Deliverables

1. Implement whole-array missing/incompatible/valid reconstruction with current
   exact stable identity order, matched/new/removed item semantics and complete
   managed item projection.
2. Preserve matched baseline item prototypes, identity/index descriptors,
   unmanaged members and unchanged managed references; create new items/indices
   with the exact accepted descriptors and omit current-only unmanaged data.
3. Preserve baseline non-index array descriptors, move matched index
   descriptors with identity and detect collection semantic no-effect without
   using array/item reference equality.
4. Implement stable item and node confirmation only when both arrays/identities
   are addressable; preserve collection structure and clone only the matched
   baseline path.
5. Cover missing/incompatible collections, all identity failures, inserted/
   removed IDs, moves, empty relative item alias, nested object nodes, overlap
   and atomic mixed-target failure.
6. Complete object-wide targets whose managed projection transitively contains
   one or more arrays, reusing the same collection reconstruction and overlap
   rules without a second algorithm.
7. After all static and collection cases pass, export exactly
   `commitScopeToBaseline()` from the core root with the SPEC-013 signature and
   existing `ApplyOperationResult` only.
8. Add declaration/root-import and package-smoke evidence; add no other symbol,
   export path, package, dependency or runtime/adapter member.

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

One complete core/Public review passes every collection/stable-address row,
semantic no-effect, descriptors, sharing, exact declaration and package smoke
with zero findings. No reference application behavior is complete here.

## 6. Checkpoint 4 — Complete core conformance and package documentation

### Deliverables

1. Map every core/package SPEC-013 conformance row to named focused tests and
   close any cross-target combination not already covered, including very deep
   paths, cyclic values and changing traps. Reference-consumer row 19 remains
   assigned to checkpoint 5.
2. Prove the helper invokes no validator/async port/text resolver/listener,
   emits no operation, logs nothing and cannot mutate runtime state.
3. Prove applying a successful candidate through baseline-only
   `updateExternalState()` preserves interaction and the current async
   generation while updating only derived dirty state.
4. Add concise core README usage showing candidate calculation, application
   persistence ownership, success/failure handling and later baseline update.
5. Verify built declarations, exact root export, package map, packed/source
   package, built and clean consumers, and deep-import rejection.
6. Inspect dependency/lock and production import graphs; no graph or package
   metadata change is permitted.

### Required evidence

```sh
pnpm exec prettier --check packages/core .ai-docs README.md
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm --filter @rabassoft/schema-engine test:package
pnpm test:consumer:clean
pnpm test:source
pnpm docs:check
git diff --check
```

### Completion gate

One complete core/package review passes every applicable SPEC row except the
explicit checkpoint-5 reference-consumer row, plus side-effect invariance,
README contract, declarations, package/source and clean-consumer evidence with
zero findings and no dependency drift.

## 7. Checkpoint 5 — Shared scenario and independent reference consumers

### Deliverables

1. Add one authoring-safe shared scoped-confirmation scenario containing a
   non-collection partial scope, a homogeneous object collection scope and an
   unrelated editable managed node. Its current collection also contains one
   valid item absent from baseline plus a stable item scope for that identity,
   providing a deterministic unconfirmable partial target before the whole
   array is accepted.
2. Share only schema/UI Schema, initial controlled roots, copied `FormScope`
   values, labels, explanation and expected evidence; keep candidate state and
   effects independently owned by Angular and Standard.
3. In each application provide equivalent accessible controls to prepare a
   baseline candidate and separately accept the simulated persistence result.
   Candidate preparation must visibly leave runtime baseline/dirty unchanged.
4. Demonstrate accepted partial confirmation cleans only its scope, unrelated
   edits remain dirty, whole collection confirmation accepts structural order,
   the current-only stable item fails without producing an acceptable
   candidate, and scenario/schema recreation clears any prepared candidate.
5. Call the core root helper directly from both apps. Add no Angular directive,
   provider, renderer, Standard renderer or shared-effect wrapper.
6. Keep labels/text and visual structure aligned through duplicated target
   presentation following the existing reference policy; add light/dark,
   keyboard and screen-reader-visible state without changing library styling.
7. Regenerate snippets only if the new scenario exposes a maintained consumer
   example; add unit and Chromium parity evidence for both targets.

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

One complete cross-target review passes shared authoring, independent candidate/
acceptance effects, dirty isolation, collection structure, accessibility,
snippets, boundaries and complete Chromium parity with zero findings.

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
   pnpm test:consumer:clean
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

3. Inspect declarations/exports, package maps/peers, dependency/lock diff, core
   import graph, validator/Ajv production-source invariance, runtime/adapter API
   inventories, both app-owned integrations and the complete scoped diff.
4. Reconcile root/package onboarding, SPEC/ADR/plan indexes, ROADMAP, Deferred,
   `STATUS.md` and newest `WORKLOG.md` entry.
5. Correct every finding and repeat the complete matrix until one full pass has
   zero findings. Rerun unchanged outside the sandbox only when a documented
   restricted IPC/network condition prevents the accepted command.

### Completion gate

Only a complete zero-finding pass may mark PLAN-029/M27 Completed and record
implemented M1–M27. Package versions and published M23 artifacts remain
unchanged; release and commit/push remain separately gated.

## 9. Stop conditions

Stop for any change to SPEC-013/ADR-030; automatic runtime baseline mutation;
persistence/storage/HTTP/submit ownership; validation execution by scope;
structural collection changes through stable partial targets; current-only
unmanaged-data copying; new Public type, adapter method, renderer behavior,
package, dependency or entry point; defaults, batches, undo/redo or dynamic
definitions; React/Vue/legacy Angular; version, release or publication;
destructive action; commit; push; or unresolved authoritative conflict.

## 10. Revision 1 reconciliation

Revision 1 changes only the prerequisite from SPEC-013 v0.1.0 to v0.1.1 and
therefore adopts its closed `invalid-identity` parameter matrix: every such
diagnostic includes collection fields, while stable item/node fields exist only
for an original stable address target. Checkpoint order, deliverables,
evidence, completion gates, exclusions and Public boundary are unchanged.

Review 251 cycle 1 repeated all fourteen plan areas against Accepted SPEC-013
v0.1.1 with zero findings. Under Ricard's standing zero-finding/no-scope-
expansion authorization, PLAN-029 revision 1 is Approved and checkpoint 1 may
resume.
