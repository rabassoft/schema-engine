# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-22 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0 and SPEC-009 v0.1.0
- **Last implementation plan:** PLAN-024 revision 0, Approved
- **Last completed implementation plan:** PLAN-023 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-026 revision 0, coordinated with ADR-018 revision 6
- **Implemented capability:** M1–M21 and G0, including recursive static local
  presentation forests in core, native Angular, independent Standard and
  Angular Aria, delivered as the coordinated Experimental M21 line
- **Published packages:** core/base Angular `0.4.0` and Angular Aria pilot
  `0.2.0` are verified exact, under `next`/`latest` and through unqualified
  resolution; all remain Public + Experimental + Active
- **Selected M21 source:** private commit
  `07755b4cbe31098f86099db38c65930d52772fb5`; all three public packages are
  byte-identical to its selected clean candidates
- **Immutable M19 source:** public `0.3.0`/`0.3.0`/`0.1.0` remains
  byte-identical to the selected clean candidates from private commit
  `ce3ef3dd3f9154c95896bcefa22e31b4f293eda0`

## Current objective

Await immediate explicit authorization for PLAN-024 checkpoint 6: create the
private recovery bundle, atomically replace both remote refs with the selected
sanitized baseline and adopt the verified lineage locally.

## In progress

None. PLAN-024 checkpoint 5 is complete. Checkpoint 6's bundle, local cleanup,
atomic exact-lease ref replacement and local adoption are not authorized yet.

## Latest completed work

- Completed PLAN-024 checkpoint 5 after review 172 cycle 3 produced one
  deterministic self-identifying evidence commit in two mirrors, mapped all 65
  old commits and passed the complete sanitized-history/clean-clone matrix.
- Completed PLAN-024 checkpoint 4 after review 171 cycle 1 passed all nine
  fresh-mirror audit layers with zero unresolved findings and froze exact
  ref/object/rights/content evidence without remote mutation.
- Completed PLAN-024 checkpoint 3 after review 170 cycle 2 verified private
  `develop` at `a594f7333c99c1eb73fac8089ae68bb495d45bbb`, unchanged `main` and
  visibility, then passed the complete fresh detached matrix with zero findings.
- Completed PLAN-024 checkpoint 2 after review 169 cycle 3 passed tool trust,
  redacted/deterministic fixtures, exact Action pins, guarded workflows and the
  complete local matrix with zero unresolved findings.
- Completed PLAN-024 checkpoint 1 after review 168 cycle 3 passed the complete
  local boundary with zero unresolved findings; public policies, candidate-tree/
  history guards, documentation checks and npm readiness logic are in place.
- Approved PLAN-024 revision 0 after review 167 cycle 3 passed all sixteen areas
  with zero findings.
- Accepted ADR-026 revision 0 and coordinated ADR-018 revision 6 after review
  166 cycle 3 passed all fourteen areas with zero findings and now governs the
  ongoing PLAN-024 delivery.
- Selected preservation of sanitized reachable history with public `.ai-docs`,
  an old/new commit map, solo-maintainer controls and a later separately gated
  OIDC/provenance release transition.

## Exact next action

Present checkpoint 6's exact selected candidate hash, verified private-bundle
strategy, atomic two-ref exact-lease push and reversible local cleanup/adoption
commands; obtain immediate explicit authorization before any of them runs.

## Blockers and conflicts

- No authoritative documentation conflict or implementation blocker remains.
- The current checkout/remote lineage still contains the one classified
  historical review-132 path; the isolated checkpoint-5 candidate removes it
  and passes full history policy. Replacing the current/remote lineage remains
  the separately gated checkpoint-6 action.
- GitHub rulesets are unavailable for the current private repository/plan;
  recheck availability after the visibility or plan transition rather than
  weakening the M22 protection requirement.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC aborts inside it; Node 22.23.1 is compatible and the
  official builds pass.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- Angular emits an initial-bundle warning at 989.78 kB plus Ajv's CommonJS
  warning; Standard emits Vite's 868.50 kB advisory. These are observations,
  not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035 and D-045 legacy
  Angular remain inactive. M22 checkpoints 1–5 are complete; no external action
  is active.

## Open questions

- None. A real scanner, rights or personal-data finding must stop PLAN-024 for
  explicit resolution.

## Latest verification

- Review 172 cycle 3 verified two identical rewrites and one deterministic
  evidence commit, a complete 65-entry map, exact one-path substitution,
  preserved metadata/parents, 66-commit Gitleaks and public-history scans with
  zero findings plus the complete clean-clone matrix.
- Review 171 cycle 1 audited a fresh owner-only private mirror across all nine
  required layers. Gitleaks found no leak; only the preclassified review-132
  path requires later replacement; 65 commits, 968 trees and 1,745 blobs plus
  rights, identity, binaries, artifacts and public boundaries passed with zero
  unresolved findings.
- Review 170 cycle 2 verified exact remote `develop`
  `a594f7333c99c1eb73fac8089ae68bb495d45bbb`, unchanged `main`/private
  visibility and a clean detached lifecycle-free install. Gitleaks scanned 65
  commits/approximately 6.25 MB with no leak; tool fixtures, expected
  fail-closed lanes and the complete build-before-lint matrix passed with zero
  unresolved findings.
- Review 169 cycle 3 repeated the complete checkpoint-2 boundary with zero
  unresolved findings. Gitleaks v8.30.1 scanned 64 commits/approximately 6.24
  MB with no leak; git-filter-repo v2.47.0 produced identical two-commit
  rewrites and a complete map.
- Review 168 cycle 3 repeated the complete checkpoint-1 boundary with zero
  unresolved findings.
- Twelve policy/readiness/workflow tests, exact Action pins, workflow static
  verification, tool checksums, frozen lifecycle-free install and the complete
  workspace/package/source/reference matrix pass.
- Reachable-history verification fails closed exactly once on the classified
  historical review-132 macOS path; current M21 npm readiness also fails closed
  on absent future metadata/authorization, without exposing private content.
- Documentation/link, formatting, lint, strict types, complete workspace tests/
  builds, package smoke, release tooling, snippets, boundaries, Angular and
  Standard reference-unit checks plus `git diff --check` pass. Angular builds
  were repeated outside the restricted sandbox.
- Review 167 cycle 3 approved PLAN-024 after all sixteen plan areas passed with
  zero findings; review 166 cycle 3 accepted its architecture after fourteen
  areas passed with zero findings.
- Exact public M21 bytes/signatures and immutable M19 package/source evidence
  remain unchanged; no network, workflow, Git, GitHub or npm mutation occurred.

## Task document map

- Sanitized history map: `.ai-docs/project/HISTORY-REWRITE-MAP.md`
- Approved M22 plan: `.ai-docs/plans/024-sanitized-public-repository.md`
- M22 checkpoint-2 review:
  `.ai-docs/reviews/169-plan-024-checkpoint-2-review.md`
- M22 checkpoint-3 review:
  `.ai-docs/reviews/170-plan-024-checkpoint-3-review.md`
- M22 checkpoint-4 review:
  `.ai-docs/reviews/171-plan-024-checkpoint-4-review.md`
- M22 checkpoint-5 review:
  `.ai-docs/reviews/172-plan-024-checkpoint-5-review.md`
- M22 checkpoint-1 review:
  `.ai-docs/reviews/168-plan-024-checkpoint-1-review.md`
- M22 plan review: `.ai-docs/reviews/167-plan-024-review.md`
- Public governance: `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
- Accepted M22 architecture:
  `.ai-docs/adrs/026-public-repository-and-secure-releases.md`
- Coordinated licensing/source architecture:
  `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- M22 ADR review:
  `.ai-docs/reviews/166-adr-026-adr-018-revision-6-review.md`
- M22 promotion review:
  `.ai-docs/reviews/165-d043-m22-repository-publication-promotion-readiness.md`
- M22 Deferred source: `.ai-docs/roadmap/deferred-decisions.md#d-043`
- Final M21 review: `.ai-docs/reviews/164-plan-023-final-review.md`
- Completed M21 plan:
  `.ai-docs/plans/023-coordinated-experimental-0-4-release.md`
- M21 release notes: `.ai-docs/releases/0.4.0.md`
- Accepted M21 publication architecture:
  `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- Accepted M20 specification:
  `.ai-docs/specs/009-recursive-local-presentation-layout.md`
- Completed M20 plan: `.ai-docs/plans/022-recursive-local-presentation-layout.md`
- Final M20 review:
  `.ai-docs/reviews/144-plan-022-final-implementation-review.md`
- Final M19 review: `.ai-docs/reviews/132-plan-021-final-review.md`
- Deferred capability register: `.ai-docs/roadmap/deferred-decisions.md`
- Current roadmap: `.ai-docs/project/ROADMAP.md`
