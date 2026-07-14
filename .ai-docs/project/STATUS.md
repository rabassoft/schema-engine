# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `14202b5`, approved M9 normative/PLAN documentation
  (`develop` is eight commits ahead of `origin/develop`; no push performed)
- **Accepted specifications:** SPEC-001 v0.1.15 and SPEC-002 v0.1.2
- **Last implementation plan:** PLAN-008 revision 2, Completed
- **Active implementation plan:** PLAN-009 revision 1; checkpoints 1–4 of 7
  completed, checkpoint 5 pending
- **Last accepted ADR:** ADR-014 revision 2
- **Promoted capability:** D-005/M9, approved implementation scope
- **Accepted M9 decisions:** ADR-014 revision 2, ADR-005 revision 1 and SPEC-002
  v0.1.2
- **Phase:** M1–M8 and G0 completed; M9 implementation in progress between
  checkpoints 4 and 5
- **Package candidates:** private independent `0.1.0` artifacts; unpublished
- **Working tree:** uncommitted PLAN-009 checkpoints 1–4 contracts, helpers,
  recursive compiler, deep operations/runtime, migrated fixtures/tests and
  state documentation; no active task

## Current objective

Implement PLAN-009 checkpoint 5: recursive Angular 22 projection and consumer
migration over the accepted nested core runtime.

## In progress

- None.

## Latest completed work

- Completed PLAN-009 checkpoint 4 with iterative nested runtime indexes,
  descriptor-safe external-state validation and recursive immutable snapshots.
- Added deep actions, missing/incompatible ancestor semantics, focus
  reconciliation, issue assignment, object scopes and node-level structural
  sharing without activating Angular projection.
- Migrated runtime conformance fixtures and added focused evidence for manual
  definitions, accessors, presence/dirty, scopes, sharing and depth 1,000.
- Completed checkpoint 3 deep operations and checkpoints 1–2 contracts,
  helpers and recursive schema/UI compiler.
- Preserved Angular projection until checkpoint 5 and every deferred,
  publication, dependency, manifest and Stable API boundary.

## Exact next action

Start PLAN-009 checkpoint 5 by updating only `In progress`, then migrate the
Angular form directive to recursively project accepted object/leaf snapshots.

## Blockers and conflicts

- No review finding, implementation blocker or documentation conflict.
- ADR-014 revision 2, ADR-005 revision 1 and SPEC-002 v0.1.2 are authoritative
  for M9; unchanged SPEC-001 v0.1.15 behavior remains authoritative.
- PLAN-009 checkpoints 1–4 are complete; checkpoint 5 is authorized and not
  started.
- D-014 remains Research outside the narrow model choice accepted by ADR-014.
- Arrays, refs/composition, layouts, batches, dynamic definitions, publication
  and all other deferred capabilities remain inactive.
- Checkpoints 1–4 changes are uncommitted and unpushed.

## Open questions

- None before checkpoint 5. Any need to change an accepted contract or scope
  must return to review.

## Latest verification

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 164 core and 50 Angular tests pass (214 total), including nested runtime
  conformance, descriptor safety, scopes, branch sharing and 1,000-level finite
  runtime depth.
- `pnpm test:package`, `pnpm test:consumer` and `pnpm test:artifacts` pass with
  exact private `0.1.0` allowlists and unchanged manifests.
- `pnpm test:consumer:clean` initially could not resolve npm under restricted
  network; the authorized rerun passed core plus Angular 22.0.6 lower/upper
  consumers.
- Emitted root declarations contain exactly the accepted new core symbols; no
  manifest, dependency, lockfile, publication or Stable classification changed.

## Task document map

- Accepted promotion review:
  `.ai-docs/reviews/002-m9-nested-object-promotion.md`
- Accepted joint ADR review: `.ai-docs/reviews/003-m9-adr-review.md`
- Complete SPEC review: `.ai-docs/reviews/004-m9-spec-002-review.md`
- Complete PLAN review: `.ai-docs/reviews/005-plan-009-review.md`
- Approved M9 delivery contract:
  `.ai-docs/plans/009-nested-object-runtime.md`
- Accepted runtime/model decision:
  `.ai-docs/adrs/014-modelo-objetos-anidados-paths-profundos.md`
- Accepted dialect decision:
  `.ai-docs/adrs/005-politica-dialecto-json-schema.md`
- Accepted M9 behavior: `.ai-docs/specs/002-nested-object-runtime.md`
- Accepted baseline behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Promoted/deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Checkpoint 1 contracts: `packages/core/src/contracts.ts`
- Checkpoint 1 helpers: `packages/core/src/internal/path.ts` and
  `packages/core/src/internal/nested-definition.ts`
- Checkpoint 2 compiler: `packages/core/src/compiler.ts` and
  `packages/core/test/nested-compiler.test.ts`
- Checkpoint 3 operations: `packages/core/src/operations.ts`,
  `packages/core/test/operations.test.ts` and operation fixtures
- Checkpoint 4 runtime: `packages/core/src/runtime.ts`,
  `packages/core/test/runtime.test.ts` and runtime fixtures
- Milestone sequence: `.ai-docs/project/ROADMAP.md`
- ADR status index: `.ai-docs/adrs/000-index.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
