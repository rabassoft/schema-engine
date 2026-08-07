# PLAN-035: Controlled Discriminated Nested-Object Alternatives

- **State:** Completed
- **Revision:** 2
- **Date:** 2026-08-04
- **Approval date:** 2026-08-04
- **Milestone:** M33 — Controlled discriminated nested-object alternatives
- **Authority:** Accepted ADR-036 revision 1, ADR-005 revision 11 and SPEC-019
  v0.1.2
- **Scope:** Implement exactly the 17-row SPEC-019 contract across core,
  Angular, Standard/shared references and package/source consumers
- **Complete reviews:**
  [review 318](../reviews/318-plan-035-review.md) cycle 2 passed all twelve
  areas and exact 17-row ownership with zero findings after one documentation
  correction; coordinated [review 319](../reviews/319-m33-owner-relative-descendant-diagnostic-review.md)
  cycle 1 passed revision 1's owner-relative diagnostic correction and the
  unchanged complete plan with zero findings; coordinated
  [review 320](../reviews/320-m33-presentation-diagnostic-compatibility-review.md)
  cycle 2 passed revision 2's presentation-family correction and the unchanged
  complete plan with zero findings
- **Authorized after approval:** checkpoints 1–6 in order
- **Not authorized:** implementation, dependency, manifest, lockfile,
  package/version, release, publication, commit, push or external mutation

## 1. Objective

Deliver the bounded M33 subset: one nested ordinary-object property whose
required application-controlled string-enum discriminator selects common plus
one statically normalized `oneOf` branch. Preserve application ownership of
value and baseline, retain dormant branch data, keep validation replaceable
and project only framework-neutral definitions and snapshots.

Preserve completed M1–M32/G0 behavior and every unrelated checkout change. Do
not activate root, collection/item/array, recursive/general alternatives,
overlapping branch names, non-string or inferred runtime discriminators,
alternative composition, dynamic definitions, React/Vue or release work.

## 2. Delivery rules

1. Execute checkpoints 1–6 strictly in order and keep each intermediate source
   checkout buildable and unreleased.
2. Before each checkpoint update only `STATUS.md#In progress` with its exact
   boundary.
3. Implement and test each owned SPEC-019 row in its first owning checkpoint;
   final closure repeats evidence but does not become first ownership.
4. Review the complete checkpoint, correct every finding and repeat the full
   review until one pass has zero findings.
5. At each completed checkpoint compact `STATUS.md` and prepend one dated
   `WORKLOG.md` entry without rewriting history.
6. Preserve package names, entry points, export maps, dependencies, manifests,
   lockfile, versions, published artifacts and current release routing.
7. Preserve independent target implementations; share only authored scenarios,
   neutral contracts and evidence fixtures.
8. Do not commit, push, release, publish or mutate external state without a
   separate explicit request from Ricard.

### 2.1 Autonomous execution agreement

After PLAN-035 is Approved, Codex executes checkpoints 1–6 consecutively
without asking for confirmation at ordinary boundaries:

1. mark the exact checkpoint active in STATUS;
2. implement only its owned rows;
3. run proportional checks and inspect the entire scoped diff;
4. create the checkpoint review, correct all findings and repeat it to zero;
5. record the checkpoint in STATUS/WORKLOG; and
6. advance immediately until final closure.

Codex stops only for an Accepted-document conflict, a Public contract or scope
change, materially different architecture alternatives, dependency/manifest/
lockfile/version/release work, an external/destructive/Git action, a command
only Ricard can execute or a real blocker after safe diagnosis is exhausted.

## 3. Checkpoint 1 — Public definitions and complete compiler contract — Completed

Review 321 cycle 2 passes all fourteen checkpoint areas and SPEC-019 rows 1–7
with zero findings after five implementation/evidence corrections and the
coordinated presentation correction in review 320.

### Deliverables

- Add/export the five exact Public + Experimental + Active SPEC-019 types and
  widen only the named definition/text unions while preserving ordinary object
  literal assignability and existing runtime export inventory.
- Classify eligible nested object-property `oneOf` candidates before ordinary
  object normalization; reject every excluded root, collection, item, array,
  primitive, composed or nested-alternative location.
- Implement descriptor-safe wrapper/branch/reference inspection, the exact
  catalogs, seed inference, enum/typed-const bijection, required/property
  compatibility, disjoint ownership, provenance/cycle handling and deterministic
  stopping/ordering from ADR-005 revision 11.
- Normalize one detached/frozen static union catalog, enum-ordered alternatives,
  complete static `FormDefinition.fields` and the exact single-owner UI order.
- Preserve the exact `INVALID_UI_PRESENTATION` warning/fallback for malformed
  owner presentation without adding M33 incompatibility; emit the
  dynamic-children warning only for a structurally valid owner presentation
  and reject all union condition source/target forms.
- Emit every exact M33 compiler code, reason, path and safe parameter without
  retaining schema/domain discriminator values or returning partial definitions.
- Apply only mechanical exhaustive narrowing needed to keep the source checkout
  buildable. Until checkpoint 2, runtime creation/application must reject the
  new definition through a deliberate internal unsupported path and must never
  expose partial M33 behavior.

### Owned SPEC-019 rows

- 1–7 — Locations/catalogs; exterior defects; seed/bijection conflicts;
  required/property compatibility; references/provenance/order; presentation/
  condition exclusions; and five exports/ordinary-source compatibility.

### Verification

- Focused compiler/conformance fixtures for every accepted and excluded schema,
  hostile descriptor, reference, order, UI and diagnostic family.
- Exact normalized-definition immutability/identity and no-partial-result tests.
- Core formatting, lint, typecheck, build and complete tests.
- Existing M28–M32 compiler/manual/runtime regressions, declaration inventory,
  docs and diff hygiene.
- Complete checkpoint review to zero findings.

## 4. Checkpoint 2 — Manual definitions and complete controlled runtime — Completed

Review 322 cycle 2 passes all fourteen checkpoint areas and SPEC-019 rows 8–12
with zero findings after five implementation/evidence corrections.

### Deliverables

- Validate normalized manual definitions in SPEC-019 order and emit the exact
  three reasons and applicable node/alternative/child/path/member locators;
  suppress validator/effects on the first defect and preserve unsupported later
  mutation behavior.
- Build the immutable runtime activity index and none/active selection from
  current owner presence plus own safe discriminator data, without general
  schema evaluation or validator-driven branch selection.
- Project common plus active children and an active depth-first fields list with
  the exact shared leaf snapshot references; keep inactive paths known but
  absent from snapshots/lookups.
- Implement confirmation/rejection, dormant value/baseline restoration,
  dirty/touched/focus behavior and one structurally shared snapshot per update
  without creating, clearing, migrating or defaulting data.
- Reject every inactive field intention, stale handle and
  `applyFormOperation()` target with the exact diagnostic members, index
  presence, frozen copied paths, action ordering and zero effects required by
  SPEC-019; leave `applyOperation()` unchanged.
- Preserve exact non-M33 snapshots, operation/diagnostic behavior, callback
  schedule and application ownership.

### Owned SPEC-019 rows

- 8–12 — Manual reasons/locators; none/active selection and static/active
  projections; controlled confirmation/dormant data; baseline/interaction/
  sharing; and all inactive/stale action/application diagnostics.

### Verification

- Focused hostile manual-definition suites for every first-defect and locator.
- Runtime selection, identity, lookup, confirmation/rejection, dormant data,
  dirty/touched/focus/sharing and stale-action suites.
- `requestSetValue`, `requestRemoveValue`, focus, blur and form-operation tests
  for none/different selection and exact immutable diagnostics.
- Complete core lint/typecheck/build/tests plus M1–M32 runtime regressions.
- Docs/diff hygiene and complete checkpoint review to zero findings.

## 5. Checkpoint 3 — Scopes, validation and helper integration — Completed

Review 323 cycle 2 passes all fourteen checkpoint areas and SPEC-019 rows 13–14
with zero findings after two integration corrections and one evidence
expansion.

### Deliverables

- Make every static union path scope-known while contributing only active
  runtime nodes; make owner scopes include common plus active descendants.
- Feed the original schema and complete value unchanged to synchronous and
  asynchronous validators; attach active/common/discriminator issues normally
  and assign inactive/owner/`oneOf` issues to the owner without dropping or
  rewriting the issue's original frozen path/content.
- Preserve owner/root invalidity and adapter visibility for reassigned issues.
- Stop `deriveSchemaDefaultCandidate()` at the union with ADR-005 revision 11's
  contextual unsupported-`oneOf` failure and no branch traversal.
- Prove M30/M32 cannot source or target union descendants and that all other
  accepted validation, baseline and scope behavior remains exact.

### Owned SPEC-019 rows

- 13–14 — Active/inactive scopes and validator issue ownership; original
  sync/async validator and M29 default-helper behavior.

### Verification

- Focused scope membership/reset, issue assignment/path/validity and
  sync/async validator call tests.
- Default-candidate stopping/path/cause tests and M30/M32 exclusion regressions.
- Complete core lint/typecheck/build/tests, validation/scope/M29 regressions,
  docs and diff hygiene.
- Complete checkpoint review to zero findings.

## 6. Checkpoint 4 — Shared scenario and independent Angular/Standard parity — Completed

Review 324 cycle 2 passes all fourteen checkpoint areas and SPEC-019 row 15
with zero findings after two target-integration corrections and one scenario
evidence expansion.

### Deliverables

- Add one deeply frozen shared scenario covering at least two alternatives,
  common/nested/required/optional children, none/active selection,
  confirmation/rejection, dormant data, validation, dirty/touched/focus and
  inactive/stale actions.
- Keep Angular and Standard definition-neutral: both consume only normalized
  nodes/snapshots, resolve children by canonical key and never inspect raw
  `oneOf`, select from raw values or filter validator output.
- Render the discriminator through each target's existing enum control and
  prove active replacement, common-host retention where identity permits,
  accessibility, deactivated focus, stale-event defense and lifecycle cleanup.
- Prove independent mounted equivalence in unit and sequential Chromium lanes
  without sharing renderer/state logic.

### Owned SPEC-019 row

- 15 — Angular accessibility/lifecycle plus the shared scenario and independent
  Angular/Standard Chromium parity.

### Verification

- Shared scenario and complete Angular/Standard reference unit suites.
- Both reference formatting/lint/typecheck/build commands.
- Sequential Standard and Angular Chromium suites, including selection,
  keyboard/accessibility, stale action, replacement and teardown evidence.
- Existing M1–M32 reference scenarios, snippets, docs and diff hygiene.
- Complete checkpoint review to zero findings.

## 7. Checkpoint 5 — Declarations, packages and clean consumers — Completed

Review 325 cycle 2 passes all fourteen checkpoint areas and SPEC-019 row 16
with zero findings after correcting five evidence, consumer, tooling and
onboarding defects.

### Deliverables

- Freeze the exact five core root types and widened declarations with no new
  entry point or runtime export.
- Extend package smoke, built Angular consumer, strict clean core/Angular
  lower/latest consumers and isolated source reconstruction for authored and
  manual M33 definitions, narrowing, compilation, selection and inactive
  diagnostics.
- Update current-source migration guidance for exhaustive definition/snapshot
  readers while separating the future coordinated MINOR release decision.
- Prove no dependency, peer, manifest, export-map, lockfile, package version or
  published-artifact change.

### Owned SPEC-019 row

- 16 — Declarations, package/built/clean/source consumers and migration without
  graph/version drift.

### Verification

- Core/Angular package smoke and package-candidate verification.
- Built/clean consumers and isolated source reconstruction.
- Workspace lint/typecheck/build/tests required by declaration changes.
- Exact export/declaration/manifest/lockfile/version inventories, architecture
  boundaries, docs/format/diff hygiene and complete checkpoint review to zero.

## 8. Checkpoint 6 — Frozen final matrix and closure — Completed

Review 326 cycle 3 passes all fifteen final-matrix areas and all 17 SPEC-019
rows with zero findings after correcting the numeric-control browser locator.
PLAN-035 revision 2 and M33 are complete without graph, version, release or Git
mutation.

### Deliverables

- Freeze and confirm the approved dependency/manifest/lockfile/version graph.
- Repeat every checkpoint claim and map all 17 rows to passing evidence with no
  gap, duplicate first ownership or scope expansion.
- Run the complete proportional workspace/package/reference/security/policy/
  boundary/browser/docs matrix from the dirty source checkout.
- Reconcile STATUS, ROADMAP, indexes, onboarding, deferred register and
  WORKLOG; complete M33 only after one complete zero-finding final review.
- Do not commit, push, version, release, publish or mutate external state.

### Owned SPEC-019 row

- 17 — Complete M1–M32 regressions, boundaries, documentation, exact row audit
  and no dependency/manifest/lockfile/version graph drift.

### Verification matrix

- `pnpm format:check`, `pnpm docs:check`, workspace lint/typecheck/build/test.
- All package, scenario and reference unit suites.
- Package smoke/candidates, built/clean consumers and source reconstruction.
- Release tooling/policy, public-tree/history/security and architecture
  boundaries.
- Sequential Angular and Standard Chromium suites.
- `git diff --check`, scoped status/diff inventory and all 17 rows.

## 9. Conformance ownership

| Checkpoint | Rows  | Exclusive responsibility                                                          |
| ---------- | ----- | --------------------------------------------------------------------------------- |
| 1          | 1–7   | Public types plus complete compiler, diagnostic, ordering and UI contract.        |
| 2          | 8–12  | Manual definitions, selection, snapshots, controlled state and inactive defenses. |
| 3          | 13–14 | Scopes, issue ownership, original validators and M29 helper integration.          |
| 4          | 15    | Shared scenario and independent Angular/Standard mounted/browser parity.          |
| 5          | 16    | Declarations, packages, built/clean/source consumers and migration.               |
| 6          | 17    | Frozen complete matrix, M1–M32 regression audit and documentation closure.        |

Every integer 1–17 appears exactly once. No target, package or closure
checkpoint owns core semantics first introduced by an earlier checkpoint.

## 10. Stop conditions

Stop before continuing when:

- implementation would contradict ADR-036 revision 1, ADR-005 revision 11 or
  SPEC-019;
- a Public symbol/member/reason/behavior outside SPEC-019 is needed;
- an alternative needs root/collection/item/array/recursive/general support,
  overlapping names, non-string selection, composition, conditions or dynamic
  definitions;
- exact row ownership moves or an earlier checkpoint needs later unreviewed
  behavior to pass;
- a dependency, manifest/lockfile/package/version/release change appears;
- Angular/Standard needs shared renderer logic or raw-schema/value evaluation;
- a destructive/external/Git action becomes necessary; or
- required verification repeatedly cannot pass after safe diagnosis.

## 11. Approval gate

PLAN-035 may become Approved only after one complete repeated review confirms:

1. exact ADR-036 revision 1/ADR-005 revision 11/SPEC-019 authority and exclusions;
2. all 17 rows owned exactly once;
3. checkpoint order, buildability and proportional checks;
4. compiler/manual/runtime/integration/target/package ownership boundaries;
5. autonomous execution and stop conditions;
6. no dependency/version/release/Git authority; and
7. documentation, links, formatting and diff hygiene.

Approval authorizes only checkpoints 1–6 in order. It does not authorize a
dependency, version, release, publication, commit, push or external action.

## 12. History

| Revision | Date       | Change                                                                                               |
| -------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 2        | 2026-08-04 | Approved presentation-family compatibility correction after review 320 cycle 2 passed.               |
| 1        | 2026-08-03 | Approved owner-relative descendant diagnostic correction after review 319 cycle 1 passed.            |
| 0        | 2026-08-03 | Approved after review 318 cycle 2 passed twelve areas and exact 17-row ownership with zero findings. |
