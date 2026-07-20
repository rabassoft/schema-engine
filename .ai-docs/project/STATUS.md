# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-20 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0 and SPEC-009 v0.1.0
- **Last implementation plan:** PLAN-023 revision 0, Approved
- **Last completed implementation plan:** PLAN-022 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-018 revision 5
- **Implemented capability:** M1–M20, including recursive static local
  presentation forests over nested-object and collection-item template owners
  in core, native Angular, independent Standard and Angular Aria
- **Phase:** M1–M20 and G0 completed; M21 checkpoints 1–3 completed, with no
  active implementation task
- **Selected next milestone:** M21 coordinated Experimental M20 delivery;
  publication architecture accepted after review 147 cycle 5
- **Published packages:** core/base Angular `0.3.0` and Angular Aria pilot
  `0.1.0` are verified under exact, `next`, `latest` and unqualified resolution
- **Release source:** the public line was rebuilt from private source commit
  `ce3ef3d` and is byte-identical to the reviewed clean candidates

## Current objective

Preserve the reviewed M21 dirty-tree candidate boundary and await separate
authorization for PLAN-023 checkpoint 4.

## In progress

PLAN-023 checkpoint 4: review and commit the complete M20/M21 scope while
excluding the unrelated `angular.json` analytics opt-out, push the exact private
`develop` commit, rebuild from a clean committed tree and require byte-identical
M21 candidates. No registry read/write or publication is in scope.

## Latest completed work

- Completed PLAN-023 checkpoint 3 after review 151 cycle 2 repeated the frozen
  complete matrix and all 27 SPEC-009 rows with zero findings. Three ignored,
  deterministic dirty-tree candidates pass source/security/package inspection
  and neutral dry runs with `sourceCommit: null`; no Git or external action
  occurred.
- Completed PLAN-023 checkpoint 2 after review 150 cycle 5 passed all twelve
  areas with zero findings. Candidate-truthful `0.4.0` notes, source/live
  onboarding, exact recovery and fail-closed docs/package checks pass without
  candidate, lockfile, Git, registry or external action.
- Completed PLAN-023 checkpoint 1 after review 149 cycle 2 passed all twelve
  areas with zero findings. Exact M21 descriptors/manifests/peers, immutable
  M19 baseline, source/security/package gates, 689 tests and lower/latest M20
  native/pilot consumers pass without candidate, lockfile, Git or npm state.
- Approved PLAN-023 revision 0 after review 148 cycle 2 passed all sixteen
  areas with zero findings. Approval authorizes local checkpoints 1–3 only;
  checkpoint 4, Git and every registry read/write remain separately gated.
- Accepted ADR-018 revision 5 after review 147 cycle 5 passed all fifteen areas
  with zero findings. It fixes core/base `0.4.0`, pilot `0.2.0`, dependency-
  first `next`, pilot/base/core `latest` and immutable recovery; its plan-only
  gate was later followed by Approved PLAN-023 local checkpoints 1–3.

## Exact next action

Stop for explicit PLAN-023 checkpoint 4 authorization to review and account for
the complete scoped diff, create one intentional commit, push private
`origin/develop`, rebuild from the clean committed tree and compare every byte
with the checkpoint-3 inputs. Do not perform Git or registry action before that
authorization.

## Blockers and conflicts

- No implementation blocker or authoritative documentation conflict remains.
- Checkpoint-3 artifacts are ignored dirty-tree comparison inputs with
  `sourceCommit: null`, not selected publishable evidence.
- The working tree contains an unrelated `angular.json` CLI analytics opt-out;
  preserve it separately from M21 release changes.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC deadlocks inside it. Node 22.23.1 is compatible and the
  official builds pass.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- Angular emits an initial-bundle warning at 989.78 kB plus Ajv's CommonJS
  warning; Standard emits Vite's 868.50 kB advisory. These are observations,
  not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035, D-043 and
  D-045 legacy Angular remain inactive until separately promoted.

## Open questions

None.

## Latest verification

- Review 151 cycle 2 passed the frozen workspace/build/test matrix, all 27
  SPEC-009 rows, deterministic candidate/source/security/package evidence,
  lower/latest consumers, neutral dry runs, documentation and complete diff
  review with zero findings.
- Review 150 cycle 5 passed candidate/live truth, identities, migration,
  compatibility, installation states, order/recovery, onboarding, package
  boundary, fail-closed checks, history/isolation and diff review with zero
  findings.
- Review 149 cycle 2 passed descriptor, orders, identities, M19 immutability,
  tooling, modes, artifacts/source/security, M20 consumers, workspace/package,
  documentation, isolation and diff review with zero findings.
- Review 148 cycle 2 passed all sixteen plan areas with zero findings after
  correcting scripts, recovery commands, command formatting and the exact M19
  registry baseline.
- Review 147 cycle 5 passed licensing, package boundary, SemVer, migration,
  publication/tag order, immutable recovery, source, security, compatibility,
  tooling, Deferred, plan and documentation review with zero findings.

## Task document map

- PLAN-023 checkpoint 3 review:
  `.ai-docs/reviews/151-plan-023-checkpoint-3-review.md`
- Ignored M21 dirty-tree evidence: `.release/0.4.0/candidates.json`
- PLAN-023 checkpoint 2 review:
  `.ai-docs/reviews/150-plan-023-checkpoint-2-review.md`
- M21 candidate-state release notes: `.ai-docs/releases/0.4.0.md`
- PLAN-023 checkpoint 1 review:
  `.ai-docs/reviews/149-plan-023-checkpoint-1-review.md`
- Approved M21 plan:
  `.ai-docs/plans/023-coordinated-experimental-0-4-release.md`
- Complete PLAN-023 review: `.ai-docs/reviews/148-plan-023-review.md`
- Accepted M21 publication architecture:
  `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- Complete ADR-018 revision 5 review:
  `.ai-docs/reviews/147-adr-018-revision-5-review.md`
- Accepted M21 promotion review:
  `.ai-docs/reviews/146-m21-coordinated-m20-release-promotion-readiness.md`
- Post-M20 selection review:
  `.ai-docs/reviews/145-post-m20-milestone-selection.md`
- Approved M20 plan: `.ai-docs/plans/022-recursive-local-presentation-layout.md`
- Core compiler review: `.ai-docs/reviews/137-plan-022-checkpoint-1-review.md`
- Core manual/runtime review:
  `.ai-docs/reviews/138-plan-022-checkpoint-2-review.md`
- Angular generic SPI review:
  `.ai-docs/reviews/139-plan-022-checkpoint-3-review.md`
- Angular native local projection review:
  `.ai-docs/reviews/140-plan-022-checkpoint-4-review.md`
- Standard/shared-scenario review:
  `.ai-docs/reviews/141-plan-022-checkpoint-5-review.md`
- Angular Aria local-owner review:
  `.ai-docs/reviews/142-plan-022-checkpoint-6-review.md`
- Complete package/consumer conformance review:
  `.ai-docs/reviews/143-plan-022-checkpoint-7-review.md`
- Final M20 implementation review:
  `.ai-docs/reviews/144-plan-022-final-implementation-review.md`
- Complete PLAN-022 review: `.ai-docs/reviews/136-plan-022-review.md`
- Accepted M20 specification:
  `.ai-docs/specs/009-recursive-local-presentation-layout.md`
- Complete SPEC-009 review: `.ai-docs/reviews/135-spec-009-review.md`
- Accepted M20 architecture:
  `.ai-docs/adrs/025-bosques-presentacion-locales-objetos-items.md`
- Complete ADR-025 review: `.ai-docs/reviews/134-adr-025-review.md`
- Accepted M20 promotion review:
  `.ai-docs/reviews/133-d011-m20-nested-item-layout-promotion-readiness.md`
- Completed M19 plan: `.ai-docs/plans/021-coordinated-experimental-0-3-release.md`
- Final M19 review: `.ai-docs/reviews/132-plan-021-final-review.md`
- M19 release notes: `.ai-docs/releases/0.3.0.md`
- Accepted M18 specification: `.ai-docs/specs/008-static-advanced-presentation-layout.md`
- Neutral layout architecture: `.ai-docs/adrs/023-contenedores-layout-neutral-estatico.md`
- Publication architecture: `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- Angular container/pilot architecture: `.ai-docs/adrs/024-spi-contenedores-angular-y-piloto-angular-aria.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
