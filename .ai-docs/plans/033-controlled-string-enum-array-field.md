# PLAN-033: Controlled String-Enum Array Field

- **State:** Completed
- **Revision:** 0
- **Date:** 2026-08-03
- **Approval date:** 2026-08-03
- **Completion date:** 2026-08-03
- **Final implementation review:**
  [review 303](../reviews/303-plan-033-final-implementation-review.md) cycle 2
  repeated the frozen matrix and all 26 rows with zero findings
- **Milestone:** M31 — Atomic string-enum array field
- **Authority:** Accepted ADR-034 revision 0, ADR-005 revision 8 and SPEC-017
  v0.1.0
- **Scope:** Implement exactly the 26-row SPEC-017 contract across core,
  Angular, Standard/shared references and package/source consumers
- **Complete review:** [review 296](../reviews/296-plan-033-review.md) cycle 2
  passed all seven areas and exact 26-row ownership with zero findings after
  one correction
- **Authorized after approval:** checkpoints 1–7 in order
- **Not authorized:** dependency, manifest, lockfile, package/version, release,
  publication, commit, push or external mutation

## 1. Objective

Deliver one ordered homogeneous string-enum array as an atomic controlled
field, without adopting M10 collection identity or item operations. The result
must include descriptor-safe compilation/manual definitions, controlled
operations and dirty state, replaceable validation, localized accessible
Angular/Standard projection, declarations and clean-consumer evidence.

Preserve the entire dirty M1–M30/G0 checkout and every unrelated user change.
No checkpoint may widen arrays, condition semantics, target support or release
scope.

## 2. Delivery rules

1. Execute checkpoints 1–7 strictly in order and keep each intermediate source
   checkout buildable and unreleased.
2. Before each checkpoint update only `STATUS.md#In progress` with its exact
   boundary.
3. Implement and test every owned SPEC-017 row in its first owning checkpoint;
   final closure may repeat but not become first evidence.
4. Review the complete checkpoint after implementation. Correct every finding
   and repeat the complete review until one pass has zero findings.
5. At each completed checkpoint compact `STATUS.md` and prepend one dated
   `WORKLOG.md` entry without rewriting history.
6. Preserve package names, entry points, export maps, dependencies, manifests,
   lockfile, versions, published artifacts and current release routing.
7. Preserve independent target implementations: shared schemas/scenarios/text
   constants are allowed, shared Angular/Standard renderer logic is not.
8. Do not commit, push, release, publish or mutate external state without a
   separate explicit request from Ricard.

### 2.1 Autonomous execution agreement

After PLAN-033 is Approved, Codex executes checkpoints 1–7 consecutively
without asking for confirmation at ordinary boundaries:

1. mark the exact checkpoint active in STATUS;
2. implement only its owned rows;
3. run proportional checks and inspect the entire scoped diff;
4. create the checkpoint review, correct all findings and repeat it to zero;
5. record the checkpoint in STATUS/WORKLOG; and
6. advance immediately until final closure.

Codex stops only for an Accepted document conflict, a Public contract/scope
change, materially different architecture alternatives, dependency/manifest/
lockfile/version/release work, an external/destructive/Git action, a command
only Ricard can execute or a real blocker after safe diagnosis is exhausted.

Ordinary implementation defects, test failures and corrections already fixed
by ADR-034/ADR-005r8/SPEC-017 are handled autonomously.

## 3. Checkpoint 1 — Public definition and complete compiler contract — Completed

Review 297 cycle 2 passes all twelve areas and SPEC-017 rows 1–9 with zero
findings after correcting four implementation/evidence defects.

### Deliverables

- Add/export exact `StringEnumArrayFieldDefinition`, widen `FieldDefinition`
  and integrate it as one ordinary leaf while leaving `FieldTemplate` and
  `ArrayNodeDefinition` unchanged.
- Implement the detached object/string array-family classifier, exact direct/
  nested/local-ref/composed locations and template/root exclusions.
- Implement outer/items catalogs, M10 expected preservation, required exact
  enumerable `uniqueItems: true`, required ADR-011 enum and immutable choices.
- Implement Field UI selection, enumLabels, incompatible members, ADR-033
  condition failures, diagnostic order/provenance/branch stopping and no
  partial definition.
- Apply only the mechanical exhaustive-union adaptations required to keep core,
  Angular and Standard compiling: defaults/fixed/templates/conditions continue
  to exclude the new kind, existing testers do not match it and no target
  renderer or runtime M31 behavior is introduced before its owning checkpoint.
- Add conformance fixtures plus focused compiler tests for hostile descriptors,
  cycles/sharing/references/composition/policies and deep immutability.
- Keep runtime, operations and target behavior unchanged in this checkpoint;
  a compiled M31 definition is not yet an implemented runtime feature.

### Owned SPEC-017 rows

- 1–9 — Valid definitions/locations, exclusions, M10 compatibility,
  unique/enum/catalog diagnostics, labels and incompatible UI conditions.

### Verification

- Touched-file Prettier/ESLint and core typecheck/build.
- Focused compiler/conformance suites plus complete core tests.
- Collection, enum, nullable, const, reference, composition and conditional
  compiler regressions.
- Core root export inventory, docs and `git diff --check`.
- Complete checkpoint review to zero findings.

## 4. Checkpoint 2 — Manual definitions, external safety and atomic operations — Completed

Review 298 cycle 2 passes all twelve areas and SPEC-017 rows 10–15 with zero
findings after correcting two descriptor-safety defects.

### Deliverables

- Extend shared manual-definition validation for the exact kind,
  `nullable: false`, forbidden capabilities, dense choices and closed defect
  reason/locators in runtime and form-aware operations.
- Add current/baseline managed-index inspection so accessors fail atomically
  before validator invocation while sparse/non-string/assertion-invalid values
  remain controlled snapshots.
- Extend basic form-aware compatibility to dense string arrays without enum or
  uniqueness assertion checks.
- Make `requestSetValue()` descriptor-safe and emit one copied/frozen ordered
  array; add exact first-index diagnostics and preserve direct helper input
  ownership.
- Implement ordered array no-op only for runtime and
  `applyFormOperation()`; preserve schema-neutral `applyOperation()` behavior
  and reference-exact stale expectations.

### Owned SPEC-017 rows

- 10–15 — Manual definitions, hostile external data, presence, copied runtime
  intentions, helper ownership/basic compatibility and ordered no-op/stale.

### Verification

- Core focused definition/options/update/operation/runtime tests.
- Complete core lint/typecheck/build/tests and runtime fixture regeneration/
  equality review where observable snapshots intentionally change.
- Primitive/nested/collection/fixed/condition/default/async regressions.
- Docs/diff hygiene and complete checkpoint review to zero findings.

## 5. Checkpoint 3 — Controlled runtime, dirty, issues and scopes — Completed

Review 299 cycle 2 passes all twelve areas and SPEC-017 rows 17–21 with zero
findings after correcting one issue-assignment defect.

### Deliverables

- Implement present-empty versus remove semantics: selecting none is set `[]`;
  clear removes every present value including `[]` and required remains
  validator-owned.
- Add ordered dense-string dirty comparison with presence distinction and
  safe `Object.is` fallback for basic-incompatible values.
- Reconcile immutable value/baseline updates and structural sharing without
  in-place detection or optimistic state.
- Assign array/index/deep/out-of-range validator issues to the single field in
  order; keep sync/async validators and schema exact.
- Preserve one field-level focus/touched/scope target and reject numeric/item
  intentions; retain true condition defaults and reject manual condition
  capabilities.

### Owned SPEC-017 rows

- 17–21 — Empty/clear, dirty/baseline, validator/issues, interaction/scopes and
  unchanged conditional state.

### Verification

- Focused runtime dirty/update/validation/scope/condition tests and fixtures.
- Complete core test/lint/typecheck/build matrix.
- Async validation, scope-baseline, defaults, collection issue and conditional
  action regressions.
- Docs/diff hygiene and complete checkpoint review to zero findings.

## 6. Checkpoint 4 — Texts and Angular native projection — Completed

Review 300 cycle 2 passes all twelve areas and SPEC-017 rows 16 and 22–23 with
zero findings after correcting four implementation/evidence defects.

### Deliverables

- Add exact two `FieldTextMember` values, total Angular text snapshot members,
  every-field resolution/fallback diagnostics and locale/cache behavior.
- Add/export the standalone native M31 renderer, rank-30 registration and
  native-provider-only inclusion while preserving ADR-007 overrides.
- Implement index-token `<select multiple>`, lossless representability,
  disabled selector with focusable host/clear, accessible missing/empty/status/
  issues and private Signal Form presentation buffering.
- Implement the exact retain/drop/append candidate algorithm, immediate
  confirmed-state reconciliation and zero render/locale/lifecycle emissions.
- Prove blank/whitespace/Unicode choices, malformed tokens, clear, focus and
  renderer destruction without changing custom/headless ownership.

### Owned SPEC-017 rows

- 16 — Deterministic ordered selection algorithm.
- 22–23 — Text contracts and complete Angular provider/renderer/accessibility
  behavior.

### Verification

- Angular text/renderer/resolver/provider/outlet focused tests.
- Angular package lint/typecheck/build and complete unit suite.
- Existing native string/enum/number/boolean/fixed/nullable/conditional
  renderer regressions.
- Angular reference unit checks required by the new transitive text shape.
- Docs/diff hygiene and complete checkpoint review to zero findings.

## 7. Checkpoint 5 — Shared scenario and independent Standard projection — Completed

Review 301 cycle 4 passes all twelve areas and SPEC-017 row 24 with zero
findings after correcting four implementation/evidence/hygiene defects.

### Deliverables

- Add one deeply frozen shared M31 authored scenario covering the complete
  SPEC row-24 set without duplicating target behavior.
- Integrate it in both shells with common product wording and equivalent
  evidence while retaining target-owned markup/styles/control logic.
- Implement Standard lossless multiselection, candidate ordering, controlled
  reconciliation, status/clear, locale, invalid data and accessibility
  independently from Angular.
- Add unit plus Chromium evidence for missing/empty/order/rejection/reorder,
  invalid data/issues, dirty/baseline, focus/touched and operations in both
  applications.

### Owned SPEC-017 row

- 24 — Shared authored scenario and independent Angular/Standard semantic and
  accessibility evidence.

### Verification

- Scenario, Angular reference and Standard complete unit suites.
- Both reference lint/typecheck/build commands.
- Angular and Standard Chromium suites, including the new M31 scenario.
- Snippet/reference consistency, docs/diff hygiene and complete checkpoint
  review to zero findings.

## 8. Checkpoint 6 — Declarations, packages and clean consumers — Completed

Review 302 cycle 2 passes all ten areas and SPEC-017 row 25 with zero findings
after correcting two declaration-evidence defects.

### Deliverables

- Freeze exact core and Angular root exports/declarations and transitive
  renderer/text signatures without a new entry point.
- Extend package smoke, built candidates, clean core consumer, clean Angular
  lower/latest-compatible consumers and isolated source reconstruction for all
  M31 contracts/behavior.
- Update Public Experimental migration and current-source authoring docs,
  explicitly separating the future coordinated MINOR/release gate.
- Prove no manifest, dependency, peer, export-map, lockfile, version or
  published-artifact change.

### Owned SPEC-017 row

- 25 — Exact package/export/declaration/consumer/source/migration evidence.

### Verification

- Core/Angular package smoke and package-candidate verification.
- Built consumer, clean consumer and source reconstruction scripts.
- Workspace lint/typecheck/build/test regression needed by declarations.
- Boundary, docs, formatting and diff hygiene; complete checkpoint review to
  zero findings.

## 9. Checkpoint 7 — Frozen final matrix and closure — Completed

Review 303 cycle 2 passes all fifteen areas and SPEC-017 row 26 with zero
findings after serializing the independent browser suites. The complete
26-row audit has no gap or scope expansion.

### Deliverables

- Confirm the approved dependency/manifest/lockfile/version graph is unchanged.
- Repeat every checkpoint review claim and map all 26 SPEC rows to passing
  evidence with no gaps or scope expansion.
- Run the complete proportional workspace/package/reference/security/policy/
  boundary/browser/docs matrix from the dirty source checkout.
- Reconcile STATUS, ROADMAP, indexes, onboarding, deferred register and
  WORKLOG; complete M31 only after one complete zero-finding final review.
- Do not commit, push, version, release, publish or mutate external state.

### Owned SPEC-017 row

- 26 — Frozen complete matrix, row audit and persistent-state closure.

### Verification matrix

- `pnpm format:check`, `pnpm docs:check`, workspace lint/typecheck/build/test.
- Core, Angular, validator, Angular Aria, shared scenarios and both reference
  unit suites.
- Package smoke, package candidates, built/clean consumers and isolated source
  reconstruction.
- Release tooling/policy tests, public-tree/history/security scans and
  architecture-boundary verification.
- Angular and Standard Chromium suites.
- `git diff --check`, scoped status/diff inventory and all 26 rows.

## 10. Conformance ownership

| Checkpoint | Rows      | Exclusive responsibility                                                   |
| ---------- | --------- | -------------------------------------------------------------------------- |
| 1          | 1–9       | Public definition, compiler/schema/UI contracts and M10 non-regression.    |
| 2          | 10–15     | Manual definitions, external safety, presence and atomic operations/no-op. |
| 3          | 17–21     | Empty/clear, dirty, validation/issues, scopes/interaction and conditions.  |
| 4          | 16, 22–23 | Ordered native algorithm, texts and Angular projection.                    |
| 5          | 24        | Shared scenario and independent Standard/Angular reference evidence.       |
| 6          | 25        | Declarations, packages, clean consumers, source and migration.             |
| 7          | 26        | Frozen final matrix and documentation closure.                             |

Every integer 1–26 appears exactly once. Execution order intentionally places
row 16 with its first complete native target and rows 17–21 earlier with their
core-controlled owners; this does not authorize target work before checkpoint 4.

## 11. Stop conditions

Stop before continuing when:

- implementation would contradict ADR-034, ADR-005 revision 8 or SPEC-017;
- a Public symbol/member/diagnostic/behavior not listed by SPEC-017 is needed;
- exact row ownership would move or a checkpoint requires later unreviewed
  behavior to pass;
- a new dependency, manifest/lockfile/package/version/release change appears;
- a target needs shared renderer logic or M10 identity/item semantics;
- a destructive/external/Git action becomes necessary; or
- required verification repeatedly cannot pass after safe in-scope diagnosis.

## 12. Approval gate

PLAN-033 may become Approved only after one complete repeated review confirms:

1. exact authority and non-goals;
2. all 26 rows owned exactly once;
3. checkpoint order/buildability and proportional checks;
4. compiler/manual/runtime/target/package ownership boundaries;
5. autonomous execution and stop conditions;
6. no dependency/version/release/Git authority; and
7. documentation, links, formatting and diff hygiene.

Approval authorizes only checkpoints 1–7 in order. It does not authorize a
dependency, version, release, publication, commit, push or external action.

Review 296 cycle 2 passed all seven areas and exact row ownership with zero
findings after one correction. PLAN-033 revision 0 is Approved under Ricard's
zero-finding/no-scope-expansion rule and checkpoints 1–7 are authorized in
order under section 2.1.

## 13. History

| Revision | Date       | Change                                                           |
| -------- | ---------- | ---------------------------------------------------------------- |
| 0        | 2026-08-03 | Initial Draft mapping all 26 SPEC-017 rows to seven checkpoints. |
