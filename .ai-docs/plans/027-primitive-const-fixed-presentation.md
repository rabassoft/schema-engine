# PLAN-027: Primitive const and fixed presentation

- **Status:** Completed revision 1
- **Date:** 2026-08-01
- **Approval date:** 2026-08-01
- **Milestone:** M25 — Primitive `const` and fixed presentation
- **Requires:** Accepted ADR-028 revision 0 and SPEC-011 v0.1.0
- **Complete review:** [`review 221`](../reviews/221-plan-027-review.md) cycle 6
  passed revision 0's sixteen areas with zero findings
- **Revision 1 decision:** On 2026-08-02 Ricard accepted a narrow operational
  correction to checkpoint 6 after the configured pnpm store proved unable to
  recreate `node_modules` offline despite a frozen fetch. The gate now requires
  a successful network-backed frozen restore, zero lockfile/dependency drift
  and the complete subsequent local matrix; it does not weaken any behavioral,
  package, security or release requirement.
- **Implementation review:** [Review 234](../reviews/234-plan-027-final-implementation-review.md)
  cycle 3 repeated the complete revision-1 closure matrix with zero findings.
- **Implementation authorized:** Yes, checkpoints 1–6 only; release, version,
  publication, commit, push and external mutations remain separate gates

## 1. Goal and boundary

Implement only the accepted SPEC-011 primitive `const` slice across core, the
existing private Ajv validator, Angular, Standard and the shared reference
platform. Preserve application-owned controlled state, existing operations,
package versions, publication state and every broader Deferred capability.

No checkpoint adds a dependency, entry point, Public validator option,
framework-shared DOM abstraction, package version, release artifact or external
mutation.

## 2. Delivery rules

1. Execute checkpoints in order. Before each checkpoint, update only the
   `In progress` section of `STATUS.md`.
2. Preserve the existing dirty worktree and keep each checkpoint scoped to its
   named packages/apps plus persistent-state documents.
3. Add the unit, declaration, package, boundary and browser evidence required
   by that checkpoint before marking it complete.
4. Record one review document per checkpoint. After any finding, correct it and
   repeat the complete checkpoint review until a full pass has zero findings.
5. At each checkpoint closure, compact `STATUS.md`, prepend `WORKLOG.md` and run
   `pnpm docs:check`; do not modify historical worklog entries.
6. Do not begin the next checkpoint while the current review has an unresolved
   finding. Do not change the SPEC contract from an implementation checkpoint.
7. Commit, push, release, publication, tag and external settings changes remain
   separately gated even after PLAN completion.

## 3. Checkpoint 1 — Core contract, compiler and manual definitions

### Deliverables

1. Add and root-export `PrimitiveFixedValue`; add optional `fixedValue` only to
   primitive definitions/templates through `BaseFieldDefinition`.
2. Add the three accepted fixed-status members to the existing Public
   `FieldTextMember` union without adding another type or entry point.
3. Classify `const` descriptor-safely at every accepted direct, nested,
   collection-template and local-reference leaf without adding it to shared
   container/identity keyword sets.
4. Copy/freeze exact compatible values, including null/false/zero/negative-zero
   and empty string; reject accessors, incompatible/hostile values, non-finite
   numbers and non-integers with the exact SPEC diagnostic.
5. Implement the closed scalar-string `const`/choices coherence rule after
   both members are independently valid, with exact ordering, branch stopping
   and reference/template provenance.
6. Extend iterative manual-definition validation with the two accepted defect
   envelopes and exact existing-before-fixed precedence.
7. Prove runtime creation, snapshots, `applyOperation()`,
   `applyFormOperation()` and runtime intentions never insert, repair or enforce
   the fixed value.
8. Update core Public documentation, declarations and package smoke for only
   the accepted symbols.

### Required evidence

- Dedicated fixtures map SPEC-011 conformance rows 1–9, including every direct,
  nested, template/reference and malformed/coherence case.
- Existing M1–M24 core suites remain unchanged in behavior.
- Run:

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

One complete core review must pass contract, diagnostics, immutability,
declarations, package smoke, operation invariance and scoped diff with zero
findings.

## 4. Checkpoint 2 — Existing Ajv const assertion evidence

### Deliverables

1. Add focused conformance for matching/mismatching string, number, integer,
   boolean and nullable primitive `const` schemas after compiler success.
2. Assert exact `code`/`keyword`, canonical paths, detached frozen
   `allowedValue`, Ajv order, cache reuse and schema/value non-mutation.
3. Prove formats, local references and `const` coexist under the already fixed
   factory configuration.
4. Confirm that no production validator source, dependency, option, export,
   cache rule or issue mapper changes are required. Any required production
   change stops the checkpoint for contract review.

### Required evidence

```sh
pnpm --filter @rabassoft/schema-engine-validator-ajv typecheck
pnpm --filter @rabassoft/schema-engine-validator-ajv build
pnpm --filter @rabassoft/schema-engine-validator-ajv test
pnpm --filter @rabassoft/schema-engine-validator-ajv test:package
pnpm docs:check
git diff --check
```

### Completion gate

One complete validator review must show ordinary Ajv assertion through the
existing API and zero runtime/dependency drift.

## 5. Checkpoint 3 — Angular fixed renderer and localization

### Deliverables

1. Add/root-export the standalone `OnPush`
   `SchemaFixedValueRendererComponent` with every existing renderer input/output
   and no emitted intention.
2. Prepend `native-fixed` rank 30/priority 0 using an own-descriptor-safe tester;
   preserve enum rank 20, primitive rank 10 and consumer override rules.
3. Consume the accepted core text members and add the three required
   `AngularFieldTextSnapshot` labels. Resolve them only for own fixed fields;
   preserve calls/diagnostics for every other field and update neutral empty
   snapshots.
4. Implement the exact compatible/mismatch/missing/null/incompatible/blocked
   table, negative-zero and whitespace behavior from controlled snapshots only.
5. Implement the non-focusable accessible group, deterministic fixed-value ID,
   state attribute, descriptions, tooltip and visible issues without hidden,
   disabled or readonly controls.
6. Verify render, reconcile, locale, visibility and destroy paths emit no value,
   remove, null, focus, blur or renderer-diagnostic output.
7. Update Angular Public documentation, declarations, root import and package
   smoke without changing entry points or peers.

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

One complete Angular review must pass Public surface, selection, text
projection, all state rows, accessibility, zero intentions, package smoke and
consumer override evidence with zero findings.

## 6. Checkpoint 4 — Independent Standard projection

### Deliverables

1. Select fixed presentation before enum/generic controls from the normalized
   own member without importing Angular target code.
2. Render the exact SPEC state/text/whitespace/accessibility table with no form
   control, action listener, focus or mutation intention.
3. Add the bounded private English/Spanish fixed-status map for the four exact
   sources `Missing value`, `Unavailable value`, `Incompatible value` and
   existing `Null value`; use exact-English fallback for every other runtime
   locale and do not introduce a general Public localization contract.
4. Preserve existing editable-field controls, formatting, nullable actions,
   issue visibility and configuration workspace behavior when `fixedValue` is
   absent.

### Required evidence

```sh
pnpm --filter @schema-engine-internal/reference-standard typecheck
pnpm reference:standard:build
pnpm --filter @schema-engine-internal/reference-standard test
pnpm reference:test:boundaries
pnpm docs:check
git diff --check
```

### Completion gate

One complete Standard review must pass all fixed states, locale fallback,
accessibility, zero-intention and M1–M24 editable-field regression areas with
zero findings.

## 7. Checkpoint 5 — Shared scenario and cross-target evidence

### Deliverables

1. Add one authoring-safe shared scenario and `fixed-values` feature covering
   direct, nested, collection-template and local-reference fixed leaves,
   scalar string enum, nullable null and semantic format coexistence.
2. Keep one schema/UI Schema/value/baseline/explanation and shared application
   control vocabulary for both shells. Scenario validators remain catalog
   fixtures; interactive validation continues through the official Ajv
   integration.
3. Demonstrate matching, same-kind `const` mismatch with forced-visible issue,
   missing, null, empty string, false, zero, negative-zero, incompatible and
   blocked states. State changes originate only in scenario/application
   controls or edited-schema Apply/Cancel/Restore, never the fixed renderer.
4. Add focused Angular and Standard Chromium evidence for rank/static DOM,
   actual-value mismatch, issue visibility, locale labels, editing lifecycle
   and zero operation emission.
5. Update generated integration snippets only through the existing extraction
   workflow and retain scenario/catalog/source authority plus shell isolation.

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

One complete cross-target review must pass catalog authoring, shared source,
independent shell projections, exact E2E behavior, snippets and boundaries with
zero findings.

## 8. Checkpoint 6 — Complete repeated review and closure

### Required matrix

1. Reinstall from the frozen graph without changing it. Network access may be
   used only to retrieve artifacts already pinned by `pnpm-lock.yaml`; no graph
   update or fallback resolution is allowed:

   ```sh
   pnpm install --frozen-lockfile
   ```

2. Run complete local quality and workspace evidence:

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

3. Inspect root declarations/exports, dependency and lockfile diff, package
   peers/export maps, built source inventories, fixed renderer selection,
   validator production-source invariance and the complete scoped diff.
4. Reconcile root/package onboarding, SPEC/ADR/plan indexes, ROADMAP, Deferred
   register, `STATUS.md` and the newest `WORKLOG.md` entry.
5. Correct every finding and repeat the complete matrix until one full pass has
   zero findings. Confirm the frozen restore leaves `pnpm-lock.yaml` and package
   dependency declarations unchanged. Known restricted-sandbox Angular/esbuild
   IPC aborts must be rerun unchanged outside the sandbox before being
   classified environmental.

### Completion gate

Only a complete zero-finding pass may mark PLAN-027 revision 1 and M25
Completed. Record implemented capability M1–M25, no active task and the next
functional-selection action. Package versions and published M23 artifacts stay
unchanged.

## 9. Stop conditions

Stop for any change to the accepted SPEC-011 contract; object/array/root
`const`; value insertion/repair; defaults; readonly/disabled/hidden policy; new
operation/snapshot/visibility behavior; Angular/Standard shared target code;
validator production/API/dependency changes; new package/entry point; React or
Vue; release/version/publication; resolution outside the frozen lockfile;
destructive action; commit; push; or unresolved authoritative conflict.
