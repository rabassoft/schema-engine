# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `c7e9fe2`, PLAN-009 checkpoints 1–4 nested core
  implementation (`develop` is nine commits ahead of `origin/develop`; no push
  performed)
- **Accepted specifications:** SPEC-001 v0.1.15 and SPEC-002 v0.1.2
- **Last implementation plan:** PLAN-008 revision 2, Completed
- **Active implementation plan:** PLAN-009 revision 1; checkpoints 1–6 of 7
  completed, checkpoint 7 pending
- **Last accepted ADR:** ADR-014 revision 2
- **Promoted capability:** D-005/M9, approved implementation scope
- **Accepted M9 decisions:** ADR-014 revision 2, ADR-005 revision 1 and SPEC-002
  v0.1.2
- **Phase:** M1–M8 and G0 completed; M9 implementation in progress between
  checkpoints 6 and 7
- **Package candidates:** private independent `0.1.0` artifacts; unpublished
- **Working tree:** uncommitted PLAN-009 checkpoints 5–6 Angular recursive
  projection plus package/declaration/documentation/artifact/consumer migration;
  no active task

## Current objective

Complete PLAN-009 checkpoint 7: run the final full matrix, inspect the complete
implementation diff and declarations, correct every finding and repeat review
and checks until zero findings.

## In progress

- None.

## Latest completed work

- Completed PLAN-009 checkpoint 6 by migrating package smoke/declarations,
  README/release boundaries, exact private artifact inventories and built/clean
  consumers to the accepted two-object-depth subset.
- Verified deep operations and both lookup methods through the core root import,
  automatic Angular projection/localized object text/canonical IDs through its
  retained root contract, and no Internal Angular root-export leakage.
- Completed checkpoint 5 recursive Angular projection with semantic object
  hosts, deterministic isolation and missing/incompatible intent behavior.
- Completed checkpoints 1–4 nested core contracts, compiler, operations and
  runtime in committed revision `c7e9fe2`.
- Preserved every deferred, publication, dependency, manifest, peer/export,
  lockfile and Stable API boundary.

## Exact next action

Start PLAN-009 checkpoint 7 by updating only `In progress`, then rerun the full
matrix, inspect the entire PLAN-009 diff and emitted declarations, apply every
correction and repeat the review/checks until zero findings.

## Blockers and conflicts

- No review finding, implementation blocker or documentation conflict.
- ADR-014 revision 2, ADR-005 revision 1 and SPEC-002 v0.1.2 are authoritative
  for M9; unchanged SPEC-001 v0.1.15 behavior remains authoritative.
- PLAN-009 checkpoints 1–6 are complete; checkpoint 7 is authorized and not
  started.
- D-014 remains Research outside the narrow model choice accepted by ADR-014.
- Arrays, refs/composition, layouts, batches, dynamic definitions, publication
  and all other deferred capabilities remain inactive.
- Checkpoint 5–6 changes are uncommitted and unpushed; checkpoints 1–4 are
  committed in `c7e9fe2`.

## Open questions

- None before checkpoint 7. Any need to change an accepted contract or scope
  must return to review.

## Latest verification

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 46 Markdown files have valid local link targets.
- All 164 core and 58 Angular tests pass (222 total), including recursive
  accessibility, controlled deep operations, blocked native/custom intentions,
  hostile IDs, object text/isolation and accepted-tree atomicity.
- `pnpm test:package`, `pnpm test:consumer` and the exact-inventory
  `pnpm test:artifacts` pass for the nested package migration.
- `pnpm test:consumer:clean` initially could not resolve npm under restricted
  network; the authorized rerun passed core plus Angular 22.0.6 lower/upper
  consumers.
- Emitted root declarations contain the accepted Public core/Angular symbols,
  retain `SchemaFormDirective` component metadata and exclude Internal object
  helpers; no manifest, dependency, peer/export, lockfile, publication or Stable
  classification changed.

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
- Checkpoint 5 Angular projection: `packages/angular/src/form.directive.ts`,
  `packages/angular/src/node-outlet.ts` and
  `packages/angular/test/nested-projection.test.ts`
- Checkpoint 6 package/consumer verification: package READMEs and smoke tests,
  `packages/angular/test/consumer.test.ts`, `scripts/verify-packed-artifacts.mjs`
  and `scripts/verify-clean-consumers.mjs`
- Milestone sequence: `.ai-docs/project/ROADMAP.md`
- ADR status index: `.ai-docs/adrs/000-index.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
