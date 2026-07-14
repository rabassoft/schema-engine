# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `7a6165c`, checkpoint 4 collection runtime
  (`develop` is fifteen commits ahead of
  `origin/develop`; no push performed)
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2 and SPEC-003
  v0.1.2
- **Last implementation plan:** PLAN-010 revision 0, Approved; checkpoints 1–5
  completed, checkpoints 6–7 pending
- **Last completed implementation plan:** PLAN-009 revision 1
- **Active implementation task:** None; checkpoint 6 is the next authorized task
- **Last accepted ADR:** ADR-015 revision 4
- **Promoted capabilities:** D-005/M9 implemented; D-006/M10 checkpoints 1–5
  implemented under PLAN-010
- **Phase:** M1–M9 and G0 completed; M10 checkpoint 5 of 7 completed
- **Package candidates:** private independent `0.1.0` artifacts; unpublished
- **Working tree:** uncommitted completed checkpoint 5 Angular projection,
  focused evidence and persistent-state updates

## Current objective

Complete M10 incrementally under approved PLAN-010 without activating a later
checkpoint before its dependencies and verification are green.

## In progress

- None.

## Latest completed work

- Completed PLAN-010 checkpoint 5 with fixed Internal collection/item hosts,
  stable-keyed views and stable leaf-address routing through existing renderers.
- Added semantic groups/legends, localized adjacent remove/move controls,
  collision-safe instance IDs and invalid-identity subtree suppression.
- Confirmed renderer/focus ownership across movement, next/previous/collection
  focus restoration after removal, deterministic destruction and synchronous
  collection/item host failure isolation.
- Split ordinary, identity, issue and item-action text reprojection by exact
  reactive identity so changes do not recreate views or repeat unrelated text.
- Added focused Angular evidence; all 247 core and 68 Angular tests pass.

## Exact next action

Execute PLAN-010 checkpoint 6: complete root declarations, package smoke,
documentation, artifact allowlists and built/clean consumer migration without
manifest, lockfile, publication or Public-surface drift.

## Blockers and conflicts

- No open review finding, implementation blocker or documentation conflict.
- SPEC-001 v0.1.15 remains the behavioral baseline and SPEC-002 v0.1.2 is
  authoritative only for the completed nested-object extension.
- D-006/M10 remains registrally Promoted; checkpoints 1–5 are complete and only
  the narrow PLAN-010 sequence is authorized. All other array/deferred
  capabilities remain inactive.
- ADR-005 revision 2, ADR-015 revision 4, SPEC-003 v0.1.2 and PLAN-010 revision
  0 are accepted/approved in the required order.
- M10 normative/review documents and checkpoints 1–4 are committed through
  `7a6165c`; completed checkpoint 5 is uncommitted and nothing was pushed.

## Open questions

- None.

## Latest verification

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 58 Markdown files and 262 local link targets resolve.
- All 247 core and 68 Angular tests pass (315 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass.
- Clean core plus Angular 22.0.6 lower/upper consumers pass against local
  private `0.1.0` tarballs.
- Root declarations expose only the accepted Angular contract widening; fixed
  collection/item hosts and projection helpers remain absent from root exports.
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
- M10 checkpoint 2 compiler evidence:
  `packages/core/test/collection-compiler.test.ts` and
  `packages/core/test/conformance/fixtures/valid-object-collection/`
- M10 checkpoint 3 operation evidence:
  `packages/core/test/collection-operations.test.ts`,
  `packages/core/test/operations/fixtures/success-collection-*/` and
  `packages/core/src/internal/collection-operation.ts`
- M10 checkpoint 4 runtime evidence:
  `packages/core/test/runtime-collections.test.ts` and
  `packages/core/src/internal/collection-runtime.ts`
- M10 checkpoint 5 Angular evidence:
  `packages/angular/test/collection-projection.test.ts`,
  `packages/angular/src/node-outlet.ts` and
  `packages/angular/src/field-outlet.directive.ts`
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
