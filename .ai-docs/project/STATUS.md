# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** current `HEAD`, accepted M11 reference architecture
  and dialect contract (`develop` is twenty commits ahead of
  `origin/develop`; no push performed)
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2 and SPEC-003
  v0.1.2
- **Last implementation plan:** PLAN-010 revision 0, Completed after final
  repeated review with zero findings
- **Last completed implementation plan:** PLAN-010 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-005 revision 3
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9 and D-006/M10 implemented; D-041 promoted
  for normative M11 design only
- **Phase:** M1–M10 and G0 completed
- **Package candidates:** private independent `0.1.0` artifacts; unpublished
- **Working tree:** clean after the accepted M11 reference-architecture
  documentation checkpoint

## Current objective

Draft SPEC-004 without activating an implementation plan or code before its
separate review and acceptance gates.

## In progress

- None.

## Latest completed work

- Formally accepted ADR-005 revision 3 after review 018 cycle 2 passed all ten
  areas with zero findings.
- Made section 12 the Accepted normative D-041 dialect/reference contract while
  retaining sections 1–11 as M1–M10 authority.
- Authorized only drafting and review of SPEC-004; no plan or implementation is
  active.
- Committed the accumulated review 016/D-041, ADR-016/review 017 and ADR-005
  revision 3/review 018 documentation checkpoint.
- Preserved D-007/D-014 and every package, publication and Stable boundary.

## Exact next action

Draft SPEC-004 with the exact observable `$defs`/local `$ref` compiler behavior,
diagnostics and conformance scenarios required by accepted ADR-016 and ADR-005
revision 3; do not prepare a plan or implementation before SPEC acceptance.

## Blockers and conflicts

- No open review finding, implementation blocker or documentation conflict.
- SPEC-001 v0.1.15 remains the behavioral baseline and SPEC-002 v0.1.2 is
  authoritative only for the completed nested-object extension.
- D-006 remains registrally Promoted and its narrow M10 delivery is complete.
  All other array/deferred capabilities remain inactive.
- D-014 remains Research outside its narrow D-041 responsibility and D-007
  remains Deferred outside D-041.
- Review 016 is accepted, D-041 is Promoted for normative design only and
  ADR-016 is Accepted after a zero-finding repeated review.
- ADR-005 revision 3 is Accepted for normative M11 design, but `$defs`/`$ref`
  remain behaviorally inactive until SPEC-004 is accepted and an implementation
  plan is approved.
- ADR-016, ADR-005 revision 3, ADR-015 revision 4, SPEC-003 v0.1.2 and PLAN-010
  revision 0 are accepted/approved in the required order.
- The accepted M11 documentation checkpoint is committed locally; nothing was
  pushed.

## Open questions

- None outside the required SPEC-004 drafting and review work.

## Latest verification

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 63 Markdown files and 290 local link targets resolve.
- All 248 core and 68 Angular tests pass (316 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass.
- Clean core plus Angular 22.0.6 lower/upper consumers pass against local
  private `0.1.0` tarballs.
- Root declarations and tarballs expose the exact accepted M10 Public inventory;
  fixed collection/item hosts and projection helpers remain Internal.
- No manifest, version, dependency, peer/export, lockfile, publication or
  Stable classification changed.

## Task document map

- ADR-005 revision 3 complete review:
  `.ai-docs/reviews/018-adr-005-revision-3-review.md`
- Accepted M11 dialect/reference contract:
  `.ai-docs/adrs/005-politica-dialecto-json-schema.md`, section 12
- ADR-016 complete review:
  `.ai-docs/reviews/017-adr-016-review.md`
- Accepted M11 architecture:
  `.ai-docs/adrs/016-resolucion-referencias-locales.md`
- M11 promotion-readiness recommendation:
  `.ai-docs/reviews/016-m11-resolution-promotion-readiness.md`
- Final M10 implementation review:
  `.ai-docs/reviews/015-plan-010-implementation-review.md`
- Final M9 implementation review:
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
- Completed M10 delivery contract:
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
- M10 checkpoint 6 package/consumer evidence:
  `packages/core/test/package-smoke.mjs`,
  `packages/angular/test/package-smoke.mjs`,
  `packages/angular/test/consumer.test.ts`,
  `scripts/verify-packed-artifacts.mjs` and
  `scripts/verify-clean-consumers.mjs`
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
