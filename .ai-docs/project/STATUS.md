# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-27 by Ricard / Codex
- **Branch:** `codex/m23-stage-only-publication`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0 and SPEC-009 v0.1.0
- **Last implementation plan:** PLAN-025 revision 0, Approved
- **Last completed implementation plan:** PLAN-024 revision 0
- **Active implementation task:** PLAN-025 checkpoint 4 protected `develop`
  delivery
- **Last accepted ADR:** ADR-026 revision 1, coordinated with ADR-018 revision 7
- **Implemented capability:** M1–M22 and G0, including the coordinated
  Experimental M21 line plus sanitized public history, governance, protected
  GitHub controls and fail-closed secure-release preparation
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

Deliver the reviewed M23 scope through a protected PR into `develop`, then stop
for separate merge authorization before the clean post-merge rebuild.

## In progress

PLAN-025 checkpoint 4 protected delivery is open as draft PR #13 from
`codex/m23-stage-only-publication` into `develop`. Required CI is pending;
merge and the clean post-merge rebuild remain separately gated.

## Latest completed work

- Published the isolated M22 closure commit `acc0d6c` on
  `codex/m22-canonical-closure`, passed required CI `30168309902`, merged PR #12
  as `develop@490c67a` and passed post-merge CI `30168530231`. The local and
  remote M22 trees are identical.
- Completed PLAN-025 checkpoint 3 after review 183 cycle 2 passed all sixteen
  local candidate areas with zero findings. The three deterministic
  metadata-only candidates pass source rebuilds, lower/current consumers,
  security and neutral dry runs; all retain `sourceCommit: null`.
- Completed PLAN-025 checkpoint 2 after review 182 cycle 2 passed all fourteen
  manifest/onboarding/workflow/historical-regression areas with zero findings.
  M23 source is prepared without candidate, stage or live provenance claims.
- Completed PLAN-025 checkpoint 1 after review 181 cycle 2 passed all twelve
  descriptor/readiness/workflow/evidence areas with zero unresolved findings.
  Current manifests and workflow still fail closed for M23.
- Approved PLAN-025 revision 0 after review 180 cycle 2 passed all eighteen
  areas with zero unresolved findings. The review corrected exact-tarball
  staging, protected-main evidence selection, separate environment approval,
  impossible source-SHA self-reference and explicit M19/M21 live regressions.

## Exact next action

Wait for required PR #13 CI to pass, then request separate authorization to
mark the PR ready and merge it before the exact clean `develop` rebuild.

## Blockers and conflicts

- No authoritative documentation conflict or implementation blocker remains.
- The M22 delivery-order precondition is closed. Local `acc0d6c` and remote
  squash `490c67a` have identical trees; checkpoint 4 must branch from the
  remote squash so the M23 PR does not duplicate the M22 commit.
- Exact npm `11.18.0` is provisioned. Frozen offline install passes outside the
  restricted sandbox with the populated global pnpm store; the ignored
  workspace-local store cannot materialize content under sandbox restrictions.
- Repository visibility is public, checkpoint-8 settings are live/exact and
  checkpoint-9 publication, promotion and reconciliation all passed.
- Current and remote long-lived lineage is sanitized and passes full history
  policy. The verified private old-lineage bundle and reversible pre-adoption
  stash remain retained outside public refs pending a separately authorized
  destructive housekeeping decision.
- Active ruleset `19534784` protects both long-lived branches without bypass;
  no further checkpoint-8 settings group remains pending.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC aborts inside it; Node 22.23.1 is compatible and the
  official builds pass.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- Angular emits an initial-bundle warning at 989.78 kB plus Ajv's CommonJS
  warning; Standard emits Vite's 868.50 kB advisory. These are observations,
  not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035 and D-045 legacy
  Angular remain inactive. Package metadata, npm trusted publishing,
  provenance and another release remain separately gated.

## Open questions

- Authorize ready transition and merge only after required PR #13 CI passes?

## Latest verification

- Checkpoint-4 pre-commit scope has 42 M23-only files and passes diff/format,
  276-document/909-link documentation, workflow/public-tree policy, lint, 39
  release tests, 23 public/readiness/workflow tests, M23 metadata-only package
  comparison, packed-source verification and release security. No unrelated
  path is present.
- Review 183 cycle 2 passes all sixteen checkpoint-3 areas with zero unresolved
  findings. Frozen offline install, complete workspace/reference matrix,
  deterministic packaging, metadata-only comparison, source rebuilds,
  lower/current consumers, security and neutral dry runs pass. The final tree
  passes 276 documents, 909 links, 756 public files, 62 focused tests, 689
  workspace tests and 14 Chromium E2E tests.
- Review 182 cycle 2 passes all fourteen checkpoint-2 areas with zero unresolved
  findings. Formatting, 275-document/907-link documentation, workflow policy,
  39 release-target/evidence tests, 23 public/readiness/workflow tests,
  754-file public-tree policy, lint, package tests and typecheck pass.
- Review 181 cycle 2 passes all twelve checkpoint-1 areas with zero unresolved
  findings. All 39 release-target/evidence tests and 22 readiness/public/
  workflow-policy tests pass; current M23 manifests/workflow fail closed.
- Review 180 cycle 2 passes all eighteen PLAN-025 areas with zero unresolved
  findings and approves only local checkpoint 1. Formatting, documentation
  links, public-tree policy and diff checks pass with 271 Markdown files, 898
  links and 748 public-tree candidates before checkpoint-1 implementation.
- Review 179 cycle 2 passes all sixteen coordinated ADR areas with zero
  unresolved findings; ADR-026 revision 1 and ADR-018 revision 7 are Accepted.

## Task document map

- Approved M23 plan:
  `.ai-docs/plans/025-stage-only-trusted-publication.md`
- M23 checkpoint-3 review:
  `.ai-docs/reviews/183-plan-025-checkpoint-3-review.md`
- M23 checkpoint-1 review:
  `.ai-docs/reviews/181-plan-025-checkpoint-1-review.md`
- M23 checkpoint-2 review:
  `.ai-docs/reviews/182-plan-025-checkpoint-2-review.md`
- M23 plan review: `.ai-docs/reviews/180-plan-025-review.md`
- M23 candidate release notes: `.ai-docs/releases/0.4.1.md`
- Completed M22 plan: `.ai-docs/plans/024-sanitized-public-repository.md`
- M22 final review: `.ai-docs/reviews/177-plan-024-final-review.md`
- Public governance: `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
- Accepted M22/M23 architecture:
  `.ai-docs/adrs/026-public-repository-and-secure-releases.md`
- Coordinated licensing/source architecture:
  `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- Proposed M23 promotion review:
  `.ai-docs/reviews/178-d043-m23-trusted-publication-promotion-readiness.md`
- Accepted M23 ADR review:
  `.ai-docs/reviews/179-adr-026-revision-1-adr-018-revision-7-review.md`
- M22/M23 Deferred source:
  `.ai-docs/roadmap/deferred-decisions.md#d-043`
- M21 release notes: `.ai-docs/releases/0.4.0.md`
- Deferred capability register: `.ai-docs/roadmap/deferred-decisions.md`
- Current roadmap: `.ai-docs/project/ROADMAP.md`
