# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `3183709`, M9 completion and accepted D-006/M10
  promotion (`develop` is eleven commits ahead of `origin/develop`; no push
  performed)
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2 and SPEC-003
  v0.1.2
- **Last implementation plan:** PLAN-010 revision 0, Approved; checkpoint 1
  completed, checkpoints 2–7 pending
- **Last completed implementation plan:** PLAN-009 revision 1
- **Active implementation plan:** None; checkpoint 2 is the next authorized task
- **Last accepted ADR:** ADR-015 revision 4
- **Promoted capabilities:** D-005/M9 implemented; D-006/M10 checkpoint 1
  implemented under PLAN-010
- **Phase:** M1–M9 and G0 completed; M10 checkpoint 1 of 7 completed
- **Package candidates:** private independent `0.1.0` artifacts; unpublished
- **Working tree:** uncommitted accepted M10 normative/review documentation plus
  PLAN-010 checkpoint 1 contracts, Internal helpers, validation, tests and
  package allowlist; no active implementation task

## Current objective

Complete M10 incrementally under approved PLAN-010 without activating a later
checkpoint before its dependencies and verification are green.

## In progress

- None.

## Latest completed work

- Completed PLAN-010 checkpoint 1 with the accepted neutral Public contract
  shapes/root exports and shared descriptor-safe collection address/key helpers.
- Extended iterative manual-definition validation over array exteriors and item
  templates behind a separate Internal entry, with exact defect reasons, frozen
  locators and hostile-object tests.
- Migrated only declaration consumers and the exact artifact allowlist; compiler,
  operations, runtime and Angular collection hosts remain inactive, and M9
  consumers retain their prior validator.
- Kept 177 core and 59 Angular tests, package/consumer/artifact checks and clean
  Angular 22 consumers green without manifest, lockfile or publication drift.
- Previously approved PLAN-010 revision 0 after a zero-finding complete review.

## Exact next action

Execute PLAN-010 checkpoint 2: implement collection policies, array/item and
structural-UI compilation, immutable templates, and compiler/manual-definition
conformance fixtures; verify it before checkpoint 3.

## Blockers and conflicts

- No open review finding, implementation blocker or documentation conflict.
- SPEC-001 v0.1.15 remains the behavioral baseline and SPEC-002 v0.1.2 is
  authoritative only for the completed nested-object extension.
- D-006/M10 remains registrally Promoted; checkpoint 1 is complete and only the
  narrow PLAN-010 sequence is authorized. All other array/deferred capabilities
  remain inactive.
- ADR-005 revision 2, ADR-015 revision 4, SPEC-003 v0.1.2 and PLAN-010 revision
  0 are accepted/approved in the required order.
- M9 completion and D-006 promotion are committed in `3183709` and unpushed;
  later M10 normative/review documents and checkpoint 1 are uncommitted.

## Open questions

- None.

## Latest verification

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 177 core and 59 Angular tests pass (236 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass.
- Clean core plus Angular 22.0.6 lower/upper consumers pass against local
  private `0.1.0` tarballs.
- Root declarations contain the checkpoint 1 Public types; Angular adds no new
  root export and collection compiler/operation/runtime/host behavior remains
  inactive.
- No manifest, version, dependency, peer/export, lockfile, publication or
  Stable classification changed.

## Task document map

- Final implementation review:
  `.ai-docs/reviews/006-plan-009-implementation-review.md`
- Accepted M10 promotion review:
  `.ai-docs/reviews/007-m10-arrays-promotion.md`
- Accepted M10 architecture:
  `.ai-docs/adrs/015-modelo-colecciones-identidad-operaciones.md`
- ADR-015 complete review:
  `.ai-docs/reviews/008-adr-015-review.md`
- ADR-015 revision 2 review:
  `.ai-docs/reviews/009-adr-015-revision-2-review.md`
- ADR-005 revision 2 review:
  `.ai-docs/reviews/010-adr-005-revision-2-review.md`
- SPEC-003 complete review:
  `.ai-docs/reviews/011-spec-003-review.md`
- ADR-015 revision 3 review:
  `.ai-docs/reviews/012-adr-015-revision-3-review.md`
- ADR-015 revision 4 review:
  `.ai-docs/reviews/013-adr-015-revision-4-review.md`
- PLAN-010 complete review:
  `.ai-docs/reviews/014-plan-010-review.md`
- Approved M10 delivery contract:
  `.ai-docs/plans/010-homogeneous-object-collections.md`
- Approved and completed delivery contract:
  `.ai-docs/plans/009-nested-object-runtime.md`
- Accepted runtime/model decision:
  `.ai-docs/adrs/014-modelo-objetos-anidados-paths-profundos.md`
- Accepted dialect decision:
  `.ai-docs/adrs/005-politica-dialecto-json-schema.md`
- Accepted M9 behavior: `.ai-docs/specs/002-nested-object-runtime.md`
- Accepted M10 behavior: `.ai-docs/specs/003-collection-runtime.md`
- Accepted baseline behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Promoted/deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- M10 checkpoint 1 contract/helper evidence:
  `packages/core/test/collection-contracts.test.ts`,
  `packages/core/src/internal/collection-address.ts` and
  `packages/core/src/internal/nested-definition.ts`
- Recursive compiler evidence: `packages/core/test/nested-compiler.test.ts`
- Deep operation evidence: `packages/core/test/operations.test.ts`
- Nested runtime evidence: `packages/core/test/runtime.test.ts`
- Recursive Angular evidence:
  `packages/angular/test/nested-projection.test.ts`
- Package/consumer evidence: package smoke tests,
  `packages/angular/test/consumer.test.ts`, `scripts/verify-packed-artifacts.mjs`
  and `scripts/verify-clean-consumers.mjs`
- Milestone sequence: `.ai-docs/project/ROADMAP.md`
- ADR status index: `.ai-docs/adrs/000-index.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
