# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-28 by Ricard / Codex
- **Branch:** `codex/m23-main-promotion-decision`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0 and SPEC-009 v0.1.0
- **Last implementation plan:** PLAN-025 revision 0, Approved
- **Last completed implementation plan:** PLAN-024 revision 0
- **Active implementation task:** None; review 193 state reconciliation complete
- **Last accepted ADR:** ADR-026 revision 1, coordinated with ADR-018 revision 7
- **Implemented capability:** M1–M22 and G0, plus M23 metadata/OIDC source
  preparation through selected protected-`main` candidates and three
  stage-only trust relations; three M23 stages are blocked and no M23 version
  is published
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

Promote the reviewed R189-F01 deterministic-gzip correction through protected
`main`, then reconcile and reselect exact candidates from that source.

## In progress

None. Review 193 reconciles the durable post-delivery gate. Protected `main`,
all three existing stages and npm remain unchanged.

## Latest completed work

- Accepted review 193 cycle 2 with zero findings: PR #20 delivery, exact refs,
  CI, contracts and the durable post-delivery promotion boundary are
  reconciled.
- Merged review 192 evidence through PR #20 as protected
  `develop@84d72f9`. Required run `30314144955` and post-merge run
  `30314737637` passed.
- Accepted review 192 cycle 6 with zero findings: exact protected refs, branch
  controls, promotion payload, CI, contracts and documentation are ready for a
  separately authorized `main` promotion.
- Merged review 191 evidence through PR #19 as protected
  `develop@e99193b`. Required run `30312801163` and post-merge run
  `30313179969` passed.
- Completed the R189-F01 clean protected-`develop` rebuild after review 191
  cycle 2 passed with zero findings. Two generations, exact source evidence,
  neutral dry-runs, three Corresponding Source rebuilds and security pass.

## Exact next action

After this reconciliation reaches protected `develop` and its CI passes,
reobserve the exact `develop`/`main` refs and decide whether to authorize the
protected merge-commit promotion to `main`. Do not mutate npm.

## Blockers and conflicts

- No implementation or documentation blocker remains. No runtime, package-byte
  or public-API drift has been observed.
- Review 193 reconciliation must reach protected `develop` before promotion.
  Its scoped commit, push and PR require Ricard's authorization; protected-main
  promotion remains a later separate checkpoint-5 decision.
- Review 189 still blocks reuse or approval of the three existing stages:
  their compressed bytes differ from corrected deterministic candidates.
  Extracted files and uncompressed TAR bytes are exact.
- Corrected candidates currently have only protected-`develop` comparison
  evidence. They require promotion and two exact protected-`main` generations
  before selection.
- Each package retains exactly one stage-only trusted-publisher relation. All
  three stages remain unapproved and unrejected; publication, aliases,
  provenance verification and token restrictions remain separately gated.
- Exact npm `11.18.0` is provisioned. Frozen offline install passes outside the
  restricted sandbox with the populated global pnpm store; the ignored
  workspace-local store cannot materialize content under sandbox restrictions.
- Current and remote long-lived lineage is sanitized and passes full history
  policy. The verified private old-lineage bundle and reversible pre-adoption
  stash remain retained outside public refs pending a separately authorized
  destructive housekeeping decision.
- Active ruleset `19534784` protects both long-lived branches without bypass;
  pull requests, resolved conversations and strict `verify` are required.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC aborts inside it; Node 22.23.1 is compatible and the
  official builds pass.
- Angular emits an initial-bundle warning at 989.78 kB plus Ajv's CommonJS
  warning; Standard emits Vite's 868.50 kB advisory. These are observations,
  not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035 and D-045 legacy
  Angular remain inactive. Stage rejection/approval, package publication,
  provenance verification, aliases and token restrictions remain separately
  gated.

## Open questions

- After review 193 reaches protected `develop`, authorize or defer the exact
  protected-main promotion. This does not include npm.

## Latest verification

- Review 193 cycle 1 corrected the stale evidence-delivery next action. Cycle 2
  passes exact refs, PR #20 CI, contract boundaries, current documentation and
  focused policy checks with zero findings.
- Review 192 cycle 1 corrected stale evidence-delivery state, cycle 2 corrected
  formatting, cycle 3 corrected one ambiguous phrase and cycle 4 corrected its
  table formatting. Cycle 5 corrected the evidence-delivery order. Cycle 6
  passes exact refs, seven-commit payload, no-bypass branch protection,
  contract boundaries, current documentation and focused policy checks with
  zero findings. Formatting, 285-document/930-link documentation, lint, 41
  release tests, 23 public tests, 766-file public-tree, workflow and diff
  checks pass.
- PR #19 merged exact head `80916f8` as
  `develop@e99193b2ec71788c4bbc1149a4056fbf4d74747c`. Required CI run
  `30312801163`/job `90131912990` passed in 4m52s; post-merge run
  `30313179969`/job `90133059320` passed all steps in 4m53s.
- Review 191 cycle 2 passes the exact protected-`develop` rebuild with zero
  findings. Two candidate generations match canonical bytes; evidence records
  `sourceCommit: 5e60796`, three neutral dry-runs, three Corresponding Source
  rebuilds, security/rights and focused policy checks pass.
- Review 190 cycles 1–2 corrected documentation-evidence link and public-tree
  counts. Cycle 3 passes with zero findings: frozen offline install, formatting,
  283-document/924-link documentation, lint, full build/typecheck,
  689 workspace tests, 41 release tests, 23 public tests, package/source/
  security checks, two deterministic candidate generations, protected-TAR
  preservation, 764-file public-tree, workflow and diff checks pass.

## Task document map

- Approved M23 plan:
  `.ai-docs/plans/025-stage-only-trusted-publication.md`
- Accepted R189-F01 post-delivery promotion gate:
  `.ai-docs/reviews/193-r189-f01-post-delivery-promotion-gate.md`
- Accepted R189-F01 protected-main promotion readiness:
  `.ai-docs/reviews/192-r189-f01-protected-main-promotion-readiness.md`
- Blocked M23 checkpoint-8 staged-byte review:
  `.ai-docs/reviews/189-plan-025-checkpoint-8-staged-byte-review.md`
- Accepted R189-F01 local correction review:
  `.ai-docs/reviews/190-r189-f01-deterministic-gzip-correction-review.md`
- Accepted R189-F01 protected-develop rebuild review:
  `.ai-docs/reviews/191-r189-f01-protected-develop-rebuild-review.md`
- Accepted M23 checkpoint-8 pre-dispatch review:
  `.ai-docs/reviews/188-plan-025-checkpoint-8-pre-dispatch-review.md`
- Completed M23 checkpoint-7 review:
  `.ai-docs/reviews/187-plan-025-checkpoint-7-review.md`
- Completed M23 checkpoint-6 review:
  `.ai-docs/reviews/186-plan-025-checkpoint-6-review.md`
- M23 checkpoint-5 review:
  `.ai-docs/reviews/185-plan-025-checkpoint-5-review.md`
- M23 checkpoint-4 review:
  `.ai-docs/reviews/184-plan-025-checkpoint-4-review.md`
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
