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

Prepare checkpoint 8's read-only capability/settings preflight without mutating
GitHub settings or entering future npm release work.

## In progress

None. PLAN-024 checkpoints 1–7 are complete; no checkpoint-8 setting or npm
mutation is active.

## Latest completed work

- Completed PLAN-024 checkpoint 7 after review 175 cycle 6: corrected closure
  commit `329d1a45c93c17b014b77a9d9a7d8ad247c2da18` passes CI on public `main`
  and `develop`; anonymous refs, Gitleaks, tree/history policies, docs and npm
  non-drift all pass with zero unresolved findings.
- Executed checkpoint 7's authorized sole visibility mutation and completed
  review 175 cycle 4: anonymous Git/API/HTTP, sanitized history/tree, public
  policy/source/docs, unchanged npm and the clean-clone matrix passed with zero
  unresolved findings before the separately authorized closure.
- Completed checkpoint-7 corrective preflight review 174 cycle 2, published
  corrective commit `3b415350627fbac423ce806231315e475de98f72` to both private
  branches and observed successful CI on both before visibility changed.
- Completed PLAN-024 checkpoint 6 after review 173 cycle 4 verified the private
  recovery bundle, atomic sanitized-lineage replacement/adoption, complete
  clean-clone matrix and authorized closure fast-forward with zero findings.
- Completed PLAN-024 checkpoint 5 after review 172 cycle 3 produced one
  deterministic self-identifying evidence commit in two mirrors, mapped all 65
  old commits and passed the complete sanitized-history/clean-clone matrix.

## Exact next action

Perform a read-only checkpoint-8 capability/settings preflight and present the
first branch-protection mutation group for explicit approval.

## Blockers and conflicts

- No authoritative documentation conflict or implementation blocker remains.
- Repository visibility is public. Checkpoint 8 branch/Actions/environment/
  security settings remain independently gated and have not changed.
- Current and remote long-lived lineage is sanitized and passes full history
  policy. The verified private old-lineage bundle and reversible pre-adoption
  stash remain retained outside public refs through M22 closure.
- GitHub ruleset/protection availability must now be reobserved before proposing
  the first checkpoint-8 mutation; no checkpoint-8 control is pre-authorized.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC aborts inside it; Node 22.23.1 is compatible and the
  official builds pass.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- Angular emits an initial-bundle warning at 989.78 kB plus Ajv's CommonJS
  warning; Standard emits Vite's 868.50 kB advisory. These are observations,
  not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035 and D-045 legacy
  Angular remain inactive. M22 checkpoints 1–7 are complete; checkpoint 8 is
  pending its read-only preflight and independently approved setting groups.

## Open questions

- None. A real scanner, rights or personal-data finding must stop PLAN-024 for
  explicit resolution.

## Latest verification

- Review 175 cycle 6 passed the corrected complete public checkpoint-7 boundary
  with zero unresolved findings. GitHub CI runs `29883272610` (`develop`) and
  `29883272641` (`main`) are successful at `329d1a4`; anonymous refs are exact,
  70-commit Gitleaks, 743-file tree policy, 1,817-path/blob history policy and
  266-document/877-link checks pass.
- Closure commit `4b729df` exposed only the same hosted 5-second stress-test
  timeout on both branches. The approved 15-second targeted timeout preserved
  depth/assertions, passed five focused repetitions and the complete local
  matrix, and was published as corrective commit `329d1a4`.
- npm preserves the recorded M21 integrity and exact/`next`/`latest` aliases,
  exposes no repository/homepage/bugs metadata and received no mutation.
- Review 175 cycle 4 passed the pre-closure public boundary; review 174 cycle 2
  passed the corrected private preflight; corrective commit
  `3b415350627fbac423ce806231315e475de98f72` then passed CI on both branches
  before the authorized visibility transition.
- Review 173 cycle 4 verified the owner-only recovery bundle, atomic exact-lease
  two-ref replacement, private/default-main state, local adoption and a fresh
  remote clone plus the authorized closure fast-forward. Gitleaks,
  66-commit/1,784-path-blob history policy and the complete clean-clone matrix
  passed with zero unresolved findings.
- Twelve policy/readiness/workflow tests, exact Action pins, workflow static
  verification, tool checksums, frozen lifecycle-free install and the complete
  workspace/package/source/reference matrix pass.
- Current/remote sanitized reachable history passes with zero findings; current
  M21 npm readiness still fails closed on absent future metadata/authorization.
- Documentation/link, formatting, lint, strict types, complete workspace tests/
  builds, package smoke, release tooling, snippets, boundaries, Angular and
  Standard reference-unit checks plus `git diff --check` pass. Angular builds
  were repeated outside the restricted sandbox.
- Exact public M21 bytes/signatures and immutable M19 package/source evidence
  remain unchanged. GitHub visibility is public; checkpoint-8 settings and npm
  were not mutated.

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
- M22 checkpoint-6 review:
  `.ai-docs/reviews/173-plan-024-checkpoint-6-review.md`
- M22 checkpoint-7 corrective preflight review:
  `.ai-docs/reviews/174-plan-024-checkpoint-7-preflight-review.md`
- M22 checkpoint-7 public review:
  `.ai-docs/reviews/175-plan-024-checkpoint-7-public-review.md`
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
