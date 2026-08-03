# PLAN-031: Explicit Schema-Default Candidate

- **State:** Completed
- **Revision:** 0
- **Date:** 2026-08-03
- **Approval date:** 2026-08-03
- **Completion date:** 2026-08-03
- **Final implementation review:** [review 278](../reviews/278-plan-031-final-implementation-review.md)
  cycle 2 repeated the frozen matrix and all 21 rows with zero findings
- **Complete review:** [review 272](../reviews/272-plan-031-review.md) cycle 2
  passed all ten areas and exact 21-row coverage with zero findings
- **Milestone:** M29 — Explicit schema-default candidate
- **Authority:** Accepted ADR-032 revision 0 and SPEC-015 v0.1.0
- **Scope:** Implement only the Public core helper, diagnostics, package
  evidence and independent Angular/Standard reference behavior defined by
  SPEC-015
- **Not authorized:** implementation until this plan is Approved; dependency,
  package/version, release, publication, commit, push or external mutation

## 1. Objective

Deliver `deriveSchemaDefaultCandidate()` as one pure Public + Experimental +
Active core helper. It will derive explicit primitive-leaf defaults through the
Accepted object/reference/composition tree, preserve application-owned
presence, materialize only needed object ancestors and return one atomic
candidate without invoking runtime or validation.

The implementation will preserve the large existing dirty working tree and
will not mix M29 with container/array defaults, automatic initialization or
deployment work.

## 2. Delivery rules

1. Execute checkpoints in order and keep types/build/tests valid after each.
2. Before each checkpoint, update only `STATUS.md#In progress` with that
   checkpoint and its exact boundary.
3. Add focused tests before or with observable behavior; do not defer a row's
   only evidence to final review.
4. Review the complete checkpoint after implementation. Any finding requires
   correction and another complete pass until zero findings.
5. Update `WORKLOG.md` at each completed checkpoint and keep `STATUS.md`
   present-tense/compact.
6. Do not change manifests, lockfile, dependencies, versions, package names,
   export maps, releases or external state.
7. Do not commit or push unless Ricard separately requests it.

## 3. Checkpoint 1 — Public contract and direct primitive defaults — Completed

Review 273 cycle 2 passes all eleven areas and SPEC-015 rows 1–7 with zero
findings after correcting two implementation defects.

### Deliverables

- Add the exact function implementation and existing core-root export, reusing
  `ApplyOperationResult<TData>` without adding an options/result type. The
  checkout may expose only the checkpoint-complete direct slice until later
  checkpoints finish; no package is released from an intermediate checkpoint.
- Implement guarded schema/data root inspection, canonical/missing dialect
  behavior and ordinary root-object property traversal for direct primitive
  leaves.
- Implement descriptor classification and exact primitive/nullable default
  compatibility, including helper-specific
  `INVALID_SCHEMA_KEYWORD_VALUE` envelopes.
- Implement direct-root no-effect/insertion candidates, frozen result/
  diagnostic envelopes and exact original-root failure identity.
- Add focused direct-default tests without exposing an incomplete adapter API.

### Owned conformance rows

- 1 — Public signature/result/retention.
- 2 — dialect and schema exterior.
- 3 — ordinary direct primitive defaults/order.
- 4 — nullable defaults.
- 5 — validator-owned assertions.
- 6 — default descriptors.
- 7 — compatible/incompatible default values.

### Verification

- Prettier and ESLint for touched core files.
- Core typecheck/build.
- Focused new tests plus all core tests.
- Documentation and diff hygiene.
- Complete checkpoint review to zero findings.

## 4. Checkpoint 2 — Nested presence and immutable reconstruction — Completed

Review 274 cycle 2 passes all eleven areas and SPEC-015 rows 12–16/18 with zero
findings after correcting one test-lint defect.

### Deliverables

- Traverse inline nested object candidate paths iteratively.
- Preflight the ordinary value root, own accessors, compatible/incompatible
  ancestors and hostile reflection with exact data diagnostics.
- Materialize only missing ancestors that receive an actual descendant
  insertion.
- Clone changed ancestor chains once while preserving prototypes, descriptors,
  symbols, unmanaged members and off-path references.
- Add atomic reconstruction-failure containment, multiple/shared paths,
  exact no-effect identity and required/optional parity tests.

### Owned conformance rows

- 12 — missing/present/incompatible ancestors.
- 13 — terminal presence variants.
- 14 — required/optional equivalence.
- 15 — shared materialization and independent paths.
- 16 — root/accessor/reflection/clone failures.
- 18 — identity, sharing, descriptors and prototypes.

### Verification

- Checkpoint-1 regression plus focused nested/reconstruction tests.
- Full core lint/typecheck/build/test matrix.
- Documentation and diff hygiene.
- Complete checkpoint review to zero findings.

## 5. Checkpoint 3 — References, composition and array barriers — Completed

Review 275 cycle 2 passes all twelve areas and SPEC-015 rows 8–11/17/19 with
zero findings after correcting root-container-default classification and
default-diagnostic ordering.

### Deliverables

- Reuse/refactor the Internal accepted resolver/composition traversal without
  exposing a Public cursor or changing compiler diagnostics.
- Derive candidates per managed use site through pure local references,
  chains, sharing and disjoint object compositions in deterministic order.
- Preserve exact reference/composition source provenance and both cycle
  domains for blocking schema diagnostics.
- Treat root/object/array/item and below-array defaults as opaque; classify
  arrays as terminal barriers without collection policies or item traversal.
- Prove schema errors complete before data inspection and no partial candidate
  survives an invalid reference/composition branch.

### Owned conformance rows

- 8 — container/array/item barriers.
- 9 — local references/chains/sharing/failures/cycles.
- 10 — object composition locations/order.
- 11 — composition failures and atomicity.
- 17 — schema-before-data ordering and deterministic collection.
- 19 — absence of implicit compiler/runtime/validator/operation/baseline work.

### Verification

- All prior tests plus focused reference/composition/barrier fixtures.
- Full core lint/typecheck/build/test matrix.
- Existing M11/M28 conformance regressions.
- Documentation, import-boundary and diff hygiene.
- Complete checkpoint review to zero findings.

## 6. Checkpoint 4 — Public package and consumer conformance — Completed

Review 276 cycle 1 passes all ten areas and SPEC-015 row 20 with zero findings.

### Deliverables

- Freeze the existing core-root export and document explicit application
  acceptance and exclusions after all behavior is complete.
- Prove built declarations and runtime imports for success, no-effect and
  failure.
- Extend package smoke, clean-consumer and isolated-source reconstruction
  checks without changing package/export maps or dependencies.
- Verify exact root export inventory and no accidental Internal deep import.

### Owned conformance row

- 20 — declarations, exports, package/clean/source consumers and dependency
  invariance.

### Verification

- Core typecheck/build/package smoke.
- Package, clean-consumer and source-reconstruction checks.
- Import boundaries, documentation and diff hygiene.
- Complete checkpoint review to zero findings.

## 7. Checkpoint 5 — Shared scenario and independent references — Completed

Review 277 cycle 2 passes all twelve areas and SPEC-015 row 21 with zero
findings after correcting the closed scenario inventory/authoring evidence.

### Deliverables

- Add the one SPEC-015 shared authored scenario without embedding target logic.
- Add application-owned candidate state and explicit derive/cancel/accept
  controls independently in Angular and Standard.
- Demonstrate preserved presence, nested materialization, reference/composition
  defaults, array barriers, validation only after acceptance, repeated
  no-effect and zero runtime operation emission.
- Update generated snippets and accessible observable evidence while
  preserving each reference shell's established layout/theme conventions.
- Add independent unit and Chromium coverage in both targets.

### Owned conformance row

- 21 — shared scenario with independent Angular/Standard evidence.

### Verification

- Shared-scenario typecheck/build/tests.
- Angular lint/typecheck/build/unit/Chromium.
- Standard lint/typecheck/build/unit/Chromium.
- Snippet and import-boundary verification.
- Documentation and diff hygiene.
- Complete checkpoint review to zero findings.

## 8. Checkpoint 6 — Frozen final matrix and closure — Completed

Review 278 cycle 2 repeats the complete frozen matrix, all 21 SPEC-015 rows and
current-state reconciliation with zero findings. PLAN-031 revision 0 and M29
are complete without dependency, version, release, publication or Git action.

### Deliverables

- Freeze the exact final verification matrix from current scripts and rerun it
  without changing the contract.
- Review all 21 SPEC-015 rows against implementation and evidence.
- Reconcile `STATUS.md`, `ROADMAP.md`, indexes, root/package READMEs,
  deferred register and append-only `WORKLOG.md`.
- Mark PLAN-031/M29 complete only after a repeated full zero-finding pass.

### Verification matrix

- frozen install and zero manifest/lockfile drift;
- Prettier, docs check, lint, types, all unit tests and builds;
- core/package/clean/source consumer checks;
- release/repository-policy/security checks applicable to unchanged packages;
- snippets and import boundaries;
- full Angular and Standard Chromium suites;
- public-artifact scan and `git diff --check`;
- scoped final diff plus all 21 conformance rows.

## 9. Conformance ownership

| SPEC-015 rows | Owner checkpoint | Evidence class                                   |
| ------------- | ---------------- | ------------------------------------------------ |
| 1–7           | 1                | core Public/direct/default contract              |
| 12–16, 18     | 2                | nested data/reconstruction                       |
| 8–11, 17, 19  | 3                | schema resolution/composition/barriers/ownership |
| 20            | 4                | declarations/package/consumers                   |
| 21            | 5                | shared catalog + independent references          |
| 1–21          | 6                | frozen final audit only; no row first lands here |

Every row has one implementation owner. Checkpoint 6 repeats but does not
replace earlier evidence.

## 10. Stop conditions

Stop and request direction if implementation requires:

- a Public symbol/type/signature beyond SPEC-015;
- root/object/array/item or below-array default application;
- a validator callback or whole-candidate validation inside the helper;
- automatic compiler/runtime/renderer/baseline acceptance;
- an adapter wrapper or framework-owned default semantics;
- a package, entry point, dependency, manifest, lockfile or version change;
- an unresolved conflict with an Accepted SPEC/ADR; or
- a destructive/external/Git action not separately authorized.

Ordinary implementation/test corrections within the Accepted contract do not
require another decision.

## 11. Approval gate

PLAN-031 may be Approved only after a complete repeated review confirms:

1. exact ADR-032/SPEC-015 scope and exclusions;
2. ordered checkpoints with valid intermediate states;
3. unique ownership of all 21 conformance rows;
4. core-first schema/data/reconstruction dependencies;
5. reference/composition reuse without compiler regression/Public cursor;
6. package/export/dependency invariance;
7. shared authoring plus independent Angular/Standard evidence;
8. verification proportional to each checkpoint and frozen final matrix;
9. checkpoint persistent-state/review discipline; and
10. all stop conditions and external/Git gates.

Every correction required another complete review. Review 272 cycle 2 passed
all ten areas and exact 21-row coverage with zero findings and no unresolved
change request. PLAN-031 revision 0 is Approved and authorizes checkpoints 1–6
in order, not a release, commit, push or external action.
