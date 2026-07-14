# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `a667bd9`, PLAN-009 checkpoints 5–6 Angular/package
  migration (`develop` is ten commits ahead of `origin/develop`; no push
  performed)
- **Accepted specifications:** SPEC-001 v0.1.15 and SPEC-002 v0.1.2
- **Last implementation plan:** PLAN-009 revision 1, Completed
- **Active implementation plan:** None
- **Last accepted ADR:** ADR-014 revision 2
- **Promoted capabilities:** D-005/M9 implemented; D-006/M10 design only
- **Phase:** M1–M9 and G0 completed
- **Package candidates:** private independent `0.1.0` artifacts; unpublished
- **Working tree:** uncommitted PLAN-009 checkpoint 7 closure plus accepted
  D-006/M10 promotion review; no active task

## Current objective

Prepare the first normative M10 decision without implementing arrays or
broadening the accepted promotion boundary.

## In progress

- None.

## Latest completed work

- Accepted the D-006/M10 promotion review and promoted arrays only for normative
  design under the homogeneous inline-object/stable application identity
  boundary.
- Completed the promotion review with no boundary findings and retained every
  implementation and publication gate.
- Defined the required ADR-015 → ADR-005 revision 2 → SPEC-003 → PLAN-010 gate
  sequence while leaving D-006 Deferred and implementation unauthorized.
- Completed PLAN-009 checkpoint 7 after repeated full reviews converged on a
  zero-finding pass and the complete verification matrix remained green.
- Corrected stale recovery, ROADMAP and ADR-index statements that still
  described nested objects as prohibited or M9 as inactive.
- Closed conformance evidence gaps for nested primitive kinds, zero-leaf object
  state, class ancestors, cross-field sharing, lookup and recursive Angular
  lifecycle.
- Preserved primitive/nested arrays, tuples, refs/composition, batches, layouts,
  publication and every other deferred boundary.

## Exact next action

Draft ADR-015 for the collection template/instance model, stable identity,
paths, structural operations, snapshots/scopes and Angular ownership; do not
draft PLAN-010 or implement arrays yet.

## Blockers and conflicts

- No review finding, implementation blocker or documentation conflict.
- SPEC-001 v0.1.15 remains the behavioral baseline and SPEC-002 v0.1.2 is
  authoritative only for the completed nested-object extension.
- D-006/M10 is Promoted for normative design only; array behavior and all other
  deferred capabilities remain inactive.
- Implementation remains blocked by the required accepted ADR-015, ADR-005
  revision 2, SPEC-003 and explicitly approved PLAN-010.
- Checkpoint 7 changes are uncommitted and unpushed; checkpoints 5–6 are
  committed in `a667bd9`.

## Open questions

- The exact application-owned stable identity declaration and failure semantics
  must be resolved by ADR-015 rather than assumed by implementation.
- Whether ADR-015 and ADR-005 revision 2 should be drafted together or in
  sequence; the accepted gate requires both before SPEC-003.

## Latest verification

- `CI=true pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`,
  `pnpm typecheck`, both builds and `git diff --check` pass.
- All 171 core and 59 Angular tests pass (230 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass.
- Clean core plus Angular 22.0.6 lower/upper consumers pass against local
  private `0.1.0` tarballs.
- All 48 Markdown files have valid local link targets.
- Root declarations match the accepted Public migration; Angular adds no root
  export and Internal object-host/text helpers remain unavailable there.
- No manifest, version, dependency, peer/export, lockfile, publication or
  Stable classification changed.

## Task document map

- Final implementation review:
  `.ai-docs/reviews/006-plan-009-implementation-review.md`
- Accepted M10 promotion review:
  `.ai-docs/reviews/007-m10-arrays-promotion.md`
- Approved and completed delivery contract:
  `.ai-docs/plans/009-nested-object-runtime.md`
- Accepted runtime/model decision:
  `.ai-docs/adrs/014-modelo-objetos-anidados-paths-profundos.md`
- Accepted dialect decision:
  `.ai-docs/adrs/005-politica-dialecto-json-schema.md`
- Accepted M9 behavior: `.ai-docs/specs/002-nested-object-runtime.md`
- Accepted baseline behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Promoted/deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
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
