# PLAN-032: Controlled Conditional Primitive-Field State

- **State:** Completed
- **Revision:** 1
- **Date:** 2026-08-03
- **Approval date:** 2026-08-03
- **Completion date:** 2026-08-03
- **Final implementation review:**
  [review 291](../reviews/291-plan-032-final-implementation-review.md) cycle 1
  repeated the frozen matrix and all 24 rows with zero findings
- **Revision review:** [review 284](../reviews/284-plan-032-revision-1-review.md)
  cycle 1 passed all twelve areas and exact 24-row ownership with zero findings
- **Original complete review:** [review 282](../reviews/282-plan-032-review.md)
  cycle 1 passed all eleven areas and exact 24-row ownership with zero findings
- **Milestone:** M30 — Controlled conditional field state
- **Authority:** Accepted ADR-033 revision 0 and SPEC-016 v0.1.1
- **Scope:** Implement only ordinary primitive `visibleWhen`/`enabledWhen`
  equality predicates, exact core contracts and independent Angular/Standard
  projection defined by SPEC-016
- **Authorized:** checkpoints 1–7 in order
- **Not authorized:** dependency, package/version, release, publication,
  commit, push or external mutation

## 1. Objective

Deliver the bounded D-018/M30 contract end to end: descriptor-safe condition
compilation, immutable normalized predicates, exact manual-definition
validation, controlled linear runtime flags, focus/action safety and mounted
accessible Angular/Standard behavior from one shared authored scenario.

The implementation must preserve the existing dirty working tree and all
M1–M29 behavior. It must not activate collection-template conditions,
compound expressions, a dependency graph, conditional validation or any
deployment work.

## 2. Delivery rules

1. Execute checkpoints 1–7 in order and keep each intermediate checkout
   buildable and unreleased.
2. Before each checkpoint, update only `STATUS.md#In progress` with that
   checkpoint and exact boundary.
3. Add focused unit/conformance evidence with the behavior it owns; do not
   defer a row's first proof to final closure.
4. Review the complete checkpoint after implementation. Any finding requires
   correction and another complete pass until zero findings.
5. Update `WORKLOG.md` at each completed checkpoint and keep `STATUS.md`
   compact and present-tense.
6. Preserve package names, entry points, export maps, dependencies, manifests,
   lockfile, versions and published artifacts.
7. Do not commit, push, release, publish or perform another external action
   unless Ricard separately requests it.

### 2.1 Autonomous execution agreement

After revision 1 is Approved, Codex executes checkpoints 1–7 consecutively
without asking for confirmation at ordinary checkpoint boundaries:

1. set the exact checkpoint in `STATUS.md#In progress`;
2. implement only that checkpoint's owned rows;
3. run its proportional verification and inspect the complete scoped diff;
4. create the checkpoint review, correct every finding and repeat the complete
   review until one pass has zero findings;
5. record completion in compact `STATUS.md` and prepend one `WORKLOG.md` entry;
6. advance immediately to the next checkpoint; and
7. after checkpoint 7, report the complete M30 result without committing or
   pushing.

Codex stops and requests Ricard's action or decision only for:

- an Accepted SPEC/ADR/plan conflict or a Public contract/scope change;
- an architectural choice with materially different alternatives;
- a dependency, manifest, lockfile, package/version or release change;
- an external, destructive, commit or push action;
- a required command that only Ricard can authorize or execute; or
- a real blocker after safe in-scope diagnosis and alternatives are exhausted.

Ordinary defects, failing tests, formatting, regressions and implementation
choices already determined by ADR-033/SPEC-016 are corrected autonomously and
do not trigger a checkpoint confirmation.

## 3. Checkpoint 1 — Public authoring and complete compiler contract — Completed

Review 285 cycle 2 passes all thirteen areas and SPEC-016 rows 1–13 with zero
findings after correcting four implementation/evidence defects.

### Deliverables

- Add the exact two Public + Experimental + Active core types, optional
  `FieldUiSchema`/`BaseFieldDefinition` members, explicit `FieldTemplate`
  omission and core-root exports in one unreleased source checkpoint.
- Implement descriptor-safe capture and the complete post-schema condition
  phase: exterior/member/path/literal inspection, safe target classification,
  fixed capability, ordinary source linking and kind/nullability compatibility.
- Preserve existing schema/UI diagnostics before the condition phase,
  schema-blocked cascade suppression, field/member order, unknown-key warnings
  and atomic no-definition behavior.
- Produce detached/frozen normalized predicates and paths without retaining
  raw UI values; add exact conformance fixtures and focused compiler tests for
  direct/nested/reference/composition and unsupported targets.
- Keep runtime snapshots/actions and both targets behaviorally unchanged in
  this checkpoint; no intermediate checkout is packaged or released.

### Owned SPEC-016 rows

- 1–13 — Public declarations; raw grammar; target/source/literal semantics;
  compiler ordering/diagnostics/atomicity; normalization and template omission.

### Verification

- Prettier/ESLint for touched core and fixture files.
- Core typecheck/build, all core tests and focused compiler/conformance tests.
- Existing reference/composition/presentation/collection compiler regressions.
- Root export inventory, docs and `git diff --check` without package evidence
  ownership moving from checkpoint 6.
- Complete checkpoint review to zero findings.

## 4. Checkpoint 2 — Manual definition validation — Completed

Review 286 cycle 2 passes all twelve areas and SPEC-016 row 14 with zero
findings after correcting three implementation/evidence defects.

### Deliverables

- Extend the shared definition-validation path used by runtime creation and
  `applyFormOperation()` with complete shape detachment before semantic linking.
- Implement the five exact definition reasons, hostile `sourcePath` metadata,
  fixed-target/source/literal checks and deterministic field/member order.
- Reject own template condition members without evaluating accessors; retain
  inherited absence and every existing base-definition precedence.
- Map the exact direct/template locator families into
  `INVALID_FORM_DEFINITION` and the namespaced
  `INVALID_RUNTIME_OPTIONS` wrapper.
- Prove that validator, operation traversal, listener, controlled-value read
  and target code are not invoked after a definition defect.

### Owned SPEC-016 row

- 14 — Complete manual-definition reasons, locators, two-phase precedence and
  non-invocation behavior.

### Verification

- All checkpoint-1 regression plus focused runtime-creation/operation helper
  definition tests.
- Core lint/typecheck/build/test matrix.
- Nullable/format/fixed/collection/presentation manual-definition regressions.
- Documentation and diff hygiene; complete checkpoint review to zero findings.

## 5. Checkpoint 3 — Controlled runtime flags and action safety — Completed

Review 287 cycle 2 passes all twelve areas and SPEC-016 rows 15–20 with zero
findings after correcting two fixture/evidence defects.

### Deliverables

- Add required `visible`/`enabled` snapshot members and linear condition
  evaluation after initial data validation and accepted new value references.
- Implement exact presence plus `Object.is` matching, true defaults, fixed/item
  constants and no evaluation for same-reference or non-value updates.
- Preserve structural sharing and atomically clear focus without touched when
  a focused ordinary field becomes hidden or disabled.
- Add the hidden-then-disabled gate to the four direct ordinary-field actions
  after existing target/value/ancestor checks and before no-effect/mutation/
  operation construction, with the exact frozen diagnostic.
- Mechanically migrate existing downstream snapshot fixtures/fakes to true
  defaults only where required to keep the workspace buildable; target
  hidden/disabled behavior remains owned by checkpoints 4–5.
- Prove unchanged values, baseline, dirty, scopes, schema-default candidates,
  sync/async validation, issues, operations and static presentation state.

### Owned SPEC-016 rows

- 15–20 — Evaluation schedule, snapshot/sharing/focus semantics, direct action
  safety and unchanged controlled/validation/layout behavior.

### Verification

- All prior regression plus focused runtime evaluation/action tests.
- Core and mechanically affected downstream lint/typecheck/build/unit suites.
- Async validation, scope, default-candidate, collection and presentation
  regressions.
- Documentation and diff hygiene; complete checkpoint review to zero findings.

## 6. Checkpoint 4 — Angular mounted and accessible projection — Completed

Review 288 cycle 2 passes all twelve areas and SPEC-016 row 21 with zero
findings after correcting four implementation/evidence/tooling defects.

### Deliverables

- Add the Internal stable field-host visibility boundary so hidden fields stay
  mounted but leave display, sequential focus and the accessibility tree.
- Reconcile confirmed snapshot/text/locale state while hidden, preserve
  renderer/component/buffer object identity and avoid renderer reselection or
  lifecycle duplication.
- Disable every native editable control and its clear/set-null actions when
  `enabled` is false; preserve fixed enabled true and supporting text/issues.
- Keep core as stale/custom-renderer safety gate and document custom renderer
  responsibility without adding a Public Angular symbol.
- Add focused Angular unit and Chromium evidence for lifecycle, focus,
  accessibility, stale output, confirmed-buffer reconciliation and teardown.

### Owned SPEC-016 row

- 21 — Angular native/custom mounted hidden lifecycle, disabled accessibility,
  stale-output defense, buffers and no renderer reselection.

### Verification

- Core/scenario/Angular lint, typecheck, build and unit suites.
- Angular package consumer regression and focused accessible Chromium lane.
- Snippet/import-boundary, docs and diff hygiene.
- Complete checkpoint review to zero findings.

## 7. Checkpoint 5 — Shared scenario and independent Standard projection — Completed

Review 289 cycle 2 passes all fourteen areas and SPEC-016 rows 22–23 with zero
findings after correcting three scenario/evidence defects.

### Deliverables

- Add one exact frozen `conditional-field-state` authored scenario containing
  typed strict literals, inactive source, focus transition, optional invalid
  target and accepted/blocked operation evidence without embedding target logic.
- Implement Standard mounted hidden hosts, target-idiomatic disabling,
  confirmed buffer reconciliation and event-route blocking independently from
  Angular helpers, components, CSS and evaluator code.
- Integrate the same scenario inputs/transitions in Angular and Standard,
  update generated snippets and expose accessible observable evidence in both
  established reference shells.
- Prove semantic parity for default/false/true flags, mounted identity, focus,
  stale actions, validation/dirty/scope invariance, operation history and
  teardown; pixel equality remains unnecessary.

### Owned SPEC-016 rows

- 22 — Independent Standard DOM/lifecycle/event behavior.
- 23 — Exact shared authoring plus independent Angular/Standard scenario and
  accessible Chromium evidence.

### Verification

- Shared scenarios lint/typecheck/build/tests.
- Complete Angular and Standard lint/typecheck/build/unit/Chromium suites.
- Generated snippet check and import-boundary verification.
- Documentation and diff hygiene; complete checkpoint review to zero findings.

## 8. Checkpoint 6 — Declarations, package and consumer conformance — Completed

Review 290 cycle 2 passes all ten areas and SPEC-016 row 24 with zero findings
after correcting four evidence/documentation/hygiene defects.

### Deliverables

- Freeze built core declarations and exact root inventory for the two types,
  widened authoring/definition/snapshot contracts and diagnostic behavior.
- Extend core/Angular package smoke with valid conditions, exact runtime flags,
  inactive action failure and transitive renderer snapshot declarations.
- Extend clean core/Angular consumers and isolated source reconstruction without
  deep imports or package/export-map/dependency/version changes.
- Reconcile core/Angular/reference documentation and migration notes while
  keeping a coordinated future MINOR/release separately gated.

### Owned SPEC-016 row

- 24 — Declarations, exact exports, package/clean/source consumers, dependency
  invariance, documentation and diff hygiene.

### Verification

- Core/Angular typecheck/build/package smoke.
- `pnpm test:package`, `pnpm test:consumer:clean`, `pnpm test:source` and
  reference import boundaries.
- Exact manifest/lock/export/dependency diff, docs and diff hygiene.
- Complete checkpoint review to zero findings.

## 9. Checkpoint 7 — Frozen final matrix and closure — Completed

Review 291 cycle 1 passes the complete frozen matrix, all checkpoints and all
24 SPEC-016 rows with zero findings. PLAN-032 revision 1 and M30 are complete.

### Deliverables

- Freeze the exact final verification matrix from current scripts and rerun it
  without changing the contract.
- Review all 24 SPEC-016 rows against implementation and checkpoint evidence.
- Reconcile `STATUS.md`, `ROADMAP.md`, ADR/SPEC documentation indexes, root and
  package READMEs, D-018 and append-only `WORKLOG.md`.
- Mark PLAN-032/M30 complete only after one repeated full zero-finding pass.

### Verification matrix

- frozen install and zero manifest/lock/dependency drift;
- Prettier, docs check, lint, types, all unit tests and builds;
- core/Angular package, clean-consumer and isolated-source checks;
- unchanged release/repository-policy/security checks;
- generated snippets and all import boundaries;
- complete Angular and Standard Chromium suites;
- public-artifact scan and `git diff --check`;
- scoped final diff plus all 24 conformance rows.

## 10. Conformance ownership

| SPEC-016 rows | Owner checkpoint | Evidence class                                            |
| ------------- | ---------------- | --------------------------------------------------------- |
| 1–13          | 1                | Public authoring, compiler and normalization              |
| 14            | 2                | manual definitions and atomic boundaries                  |
| 15–20         | 3                | controlled runtime, snapshots, focus, actions, invariants |
| 21            | 4                | Angular mounted/disabled/accessibility behavior           |
| 22–23         | 5                | Standard plus shared independent reference evidence       |
| 24            | 6                | declarations/package/clean/source consumers               |
| 1–24          | 7                | frozen final audit only; no row first lands here          |

Every row has one implementation owner before checkpoint 7. The final audit
repeats but does not replace earlier evidence.

## 11. Stop conditions

Stop and request direction if implementation requires:

- a Public symbol/type/signature or diagnostic reason beyond SPEC-016;
- another operator, predicate composition, callback, expression evaluator,
  graph/cache or same-reference mutation support;
- object/array/template/item/presentation conditions or non-string source
  addressing;
- dynamic required/readonly/default/computed behavior or conditional
  validation/issue filtering;
- data mutation, generated operations, hidden-value clearing or target-owned
  truth;
- renderer destruction/reselection on hidden transitions or framework logic in
  core;
- a package, entry point, dependency, manifest, lockfile or version change;
- an unresolved conflict with an Accepted SPEC/ADR; or
- a destructive/external/Git action not separately authorized.

Ordinary implementation/test corrections inside the Accepted contract do not
require another decision.

## 12. Approval gate

PLAN-032 may be Approved only after a complete repeated review confirms:

1. exact ADR-033/SPEC-016 scope and exclusions;
2. ordered buildable checkpoints with no incomplete Public behavior release;
3. unique ownership of all 24 conformance rows;
4. compiler-before-manual/runtime dependency order;
5. controlled evaluation, focus and action precedence;
6. Angular/Standard independent mounted/accessibility behavior;
7. package/export/dependency invariance and future-release separation;
8. proportional checkpoint checks plus a frozen final matrix;
9. persistent-state/review discipline; and
10. complete stop conditions and external/Git gates.

Every correction requires another complete review. Review 284 cycle 1 passed
all twelve areas, the autonomous execution agreement and exact 24-row ownership
with zero findings and no unresolved change request. PLAN-032 revision 1 is
Approved and authorizes autonomous checkpoints 1–7 in order, not a
dependency/version/release, commit, push or external action.

## 13. History

| Revision | Date       | Change                                                                                                                                        |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | 2026-08-03 | Reference Accepted SPEC-016 v0.1.1 and add the explicit autonomous checkpoint/review agreement; review 284 cycle 1 passes with zero findings. |
| 0        | 2026-08-03 | Initial Approved plan after review 282 cycle 1 passed eleven areas and exact 24-row ownership with zero findings.                             |
