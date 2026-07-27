# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-28 by Ricard / Codex
- **Branch:** `codex/m23-checkpoint5-closure`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0 and SPEC-009 v0.1.0
- **Last implementation plan:** PLAN-025 revision 0, Approved
- **Last completed implementation plan:** PLAN-024 revision 0
- **Active implementation task:** None
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

Deliver the reviewed R189-F01 deterministic-gzip correction through protected
branches, then rebuild and reselect exact candidates.

## In progress

None. Draft PR #18 targets protected `develop`; exact head `2765df1` is clean
against the base and required CI passed in 5m08s. All three existing stages
remain unapproved and unrejected.

## Latest completed work

- Delivered the R189-F01 correction as Rabassoft commits `efd8edf`/`2765df1`
  through draft PR #18. Exact required CI run `30310547997` passed in 5m08s;
  the PR has clean merge state against protected `develop`.
- Completed the local R189-F01 correction after review 190 cycle 3 passed with
  zero findings. Pure-JavaScript gzip normalization preserves exact TAR bytes;
  two full generations and normalized protected candidates are byte-identical.
- Completed exact workflow run `30304490264`: verify passed in 4m44s and stage
  passed in 2m4s after separate environment approval. Three unapproved stages
  with automatic provenance exist.
- Completed the checkpoint-8 read-only pre-dispatch gate after review 188 cycle
  2 passed all ten areas with zero findings. Exact protected source, workflow,
  environment, trust relations, candidate bytes and empty registry state pass.
- Completed PLAN-025 checkpoint 7 after review 187 cycle 1 passed all seven
  areas with zero findings. All three packages have exactly one stage-only
  relation; stages and M23 versions remain absent.
- Completed PLAN-025 checkpoint 6 after review 186 cycle 5 passed the complete
  read-only GitHub/npm preflight and corrected historical live matrix with zero
  findings. All three package trust lists are empty; no mutation occurred.
- Completed PLAN-025 checkpoint 5 after review 185 cycle 4 passed all fifteen
  areas with zero findings. Protected `main@4bcb6ea` and reconciled
  `develop@6d00ed0` have the same tree; selected candidates are deterministic,
  byte-identical and bound to exact protected `main`.

## Exact next action

Decide formal acceptance of draft PR #18 and whether to authorize its protected
merge. Do not merge, reject a stage or dispatch without separate authorization.

## Blockers and conflicts

- No runtime, package-byte or public-API drift has been observed.
- Review 189 R189-F01 blocks checkpoint 8: staged compressed bytes differ from
  selected candidates on all three packages. Extracted files and uncompressed
  TAR bytes are exact; macOS/Linux gzip output is not.
- Review 190 resolves R189-F01 locally with deterministic pure-JavaScript gzip
  generation, but the correction is not yet delivered or selected from
  protected source.
- Draft PR #18 is ready for a separate acceptance/merge decision after required
  CI passed. The correction is not yet present on protected `develop`.
- Review 186 cycle 3 resolves the previous execution-contract conflict without
  runtime, package, alias or API change.
- GitHub/npm identities and authenticated observations are exact. All three
  package trust lists were empty at checkpoint 6. Core now has exactly one
  stage-only relation, base Angular has exactly one stage-only relation and
  Angular Aria has exactly one stage-only relation.
- Protected M23 delivery to `develop` is complete. The current clean
  candidates are selected publishable evidence from protected `main`; the
  configured trust relations do not imply any stage or release.
- Exact npm `11.18.0` is provisioned. Frozen offline install passes outside the
  restricted sandbox with the populated global pnpm store; the ignored
  workspace-local store cannot materialize content under sandbox restrictions.
- Repository visibility is public, PLAN-024 checkpoint-8 settings are
  live/exact and its checkpoint-9 publication, promotion and reconciliation
  all passed.
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
  Angular remain inactive. Stage rejection/approval, package publication,
  provenance verification, aliases and token restrictions remain separately
  gated.

## Open questions

- Whether to accept draft PR #18 and authorize its protected merge. Each stage
  rejection remains a later separately gated action.

## Latest verification

- Draft PR #18 exact head `2765df143c7f06c1e2c0ca58c8feee34e38d684f`
  has clean merge state against `develop`; required CI run
  `30310547997`/job `90124902584` passed in 5m08s.
- Review 190 cycles 1–2 corrected documentation-evidence link and public-tree
  counts. Cycle 3 passes with zero findings: frozen offline install, formatting,
  283-document/924-link documentation, lint, full build/typecheck,
  689 workspace tests, 41 release tests, 23 public tests, package/source/
  security checks, two deterministic candidate generations, protected-TAR
  preservation, 764-file public-tree, workflow and diff checks pass.
- Review 189 cycle 1 confirms three exact unapproved stage IDs and isolates
  R189-F01 to gzip compression. Selected/staged extracted trees and
  uncompressed TAR SHA-512 values are identical, while compressed sizes,
  SHA-512 values and gzip OS bytes differ. No stage was approved or rejected;
  final formatting, 282-document/921-link documentation, 762-file public-tree
  and diff checks pass.
- Run `30304490264` passed exact `verify-release` job `90105269180` in 4m44s.
  Separately approved environment `npm-publish@18549660922` released only stage
  job `90106410134`, which passed in 2m4s and created the three unapproved
  stages.
- Review 188 cycle 2 passes all ten pre-dispatch areas with zero findings.
  Exact `main@4bcb6ea`, workflow blob `4287042`, `npm-publish` environment,
  three stage-only trust relations, selected candidate evidence, zero stages
  and absent M23 versions are reconfirmed. Formatting, 281-document/919-link
  documentation, lint, 40 release tests, 23 public tests, 761-file public-tree,
  readiness, workflow, three tarball-evidence and diff checks pass.
- Review 187 cycle 1 passes all seven checkpoint-7 areas with zero findings.
  Each package has the exact stage-only relation and no direct-publish
  permission; all stage lists remain `[]`, access remains
  `ricardrabasso: read-write` and all M23 versions return E404.
- Review 186 cycle 5 resolves R186-F01/F02/F03 and passes the complete
  checkpoint-6 review with zero findings. The corrected M19 exact and M21
  exact/`next`/`latest`/unqualified commands pass sequentially across
  bytes/signatures/metadata, lower/current native/pilot consumers and Chromium.
  Exact authenticated identities/settings, zero npm tokens/stages/trust
  relations and zero GitHub release secrets are verified; no mutation occurred.
  Final formatting, 279-document/915-link documentation, lint, 40 release
  tests, 23 public tests, 759-file public-tree, workflow and diff checks pass.
- Review 185 cycle 4 passes all fifteen checkpoint-5 areas with zero findings.
  Required/post-merge CI passes for protected promotion and reconciliation;
  `main@4bcb6ea` is an ancestor of `develop@6d00ed0`, both have tree `45da570`,
  and two selected generations plus Corresponding Source, policy, security and
  62 focused tests pass.
- Review 184 cycle 1 passes all twelve checkpoint-4 areas with zero findings.
  PR #13 required CI and post-merge CI pass; two clean generations from exact
  `develop@39a0d60` are byte-identical to checkpoint 3, carry exact source
  evidence, rebuild from Corresponding Source and pass lower/current native,
  Aria and M20/SPEC-009 consumers plus security/policy checks.

## Task document map

- Approved M23 plan:
  `.ai-docs/plans/025-stage-only-trusted-publication.md`
- Blocked M23 checkpoint-8 staged-byte review:
  `.ai-docs/reviews/189-plan-025-checkpoint-8-staged-byte-review.md`
- Accepted R189-F01 local correction review:
  `.ai-docs/reviews/190-r189-f01-deterministic-gzip-correction-review.md`
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
