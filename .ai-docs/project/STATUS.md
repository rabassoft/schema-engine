# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-19 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0 and SPEC-008 v0.1.0
- **Last implementation plan:** PLAN-021 revision 0, Approved
- **Last completed implementation plan:** PLAN-020 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-018 revision 4
- **Implemented capability:** M1–M18, including root-only static advanced
  layout, neutral runtime contracts, independent Standard projection, base
  Angular presentation-container SPI, native hosts and isolated Angular Aria 22
  pilot
- **Phase:** M1–M18 and G0 completed; M19 local checkpoints 1–3 complete
- **Published packages:** core and Angular `0.2.0` are byte-identical and
  verified under coordinated `next` and `latest`
- **Reviewed local candidates:** dirty-tree core/base Angular `0.3.0` and
  Angular Aria pilot `0.1.0`; no clean source commit or selected publishable
  hashes yet

## Current objective

Preserve the completed PLAN-021 checkpoint 3 evidence and wait for explicit
checkpoint 4 authorization before any Git action or clean candidate selection.

## In progress

- PLAN-021 checkpoint 4 authorized: reviewing the complete scoped M18/M19 diff,
  excluding the unrelated `angular.json` analytics opt-out, then committing and
  pushing the exact private `develop` commit before a clean rebuild and
  byte-for-byte candidate comparison. No registry action is authorized.

## Latest completed work

- Completed PLAN-021 checkpoint 3 after review 119 cycle 5 passed all fourteen
  areas and all 22 SPEC-008 rows with zero findings. Frozen lower/latest tuples,
  deterministic dirty-tree candidates and neutral-path dry runs pass without
  Git or registry action.
- Completed PLAN-021 checkpoint 2 after review 118 cycle 3 passed all ten areas
  with zero findings. Candidate release notes, onboarding/manifests and
  descriptor-driven stale-document checks agree.
- Completed PLAN-021 checkpoint 1 after review 117 cycle 2 passed all ten areas
  with zero findings. One validated descriptor owns the exact M19 package,
  evidence and consumer-mode contract.
- Approved PLAN-021 revision 0 after review 116 cycle 3 passed all fourteen
  areas and closing documentation with zero findings. Only local checkpoints
  1–3 were authorized automatically.
- Accepted ADR-018 revision 4 after review 115 cycle 4 passed all thirteen
  areas and closing documentation with zero findings, fixing the exact M19
  package/tag/recovery architecture.

## Exact next action

Stop for explicit PLAN-021 checkpoint 4 authorization. If granted, review the
complete scoped diff, account for and normally exclude the unrelated
`angular.json` analytics opt-out, commit, push that exact commit privately to
`develop`, rebuild from the clean committed tree and compare/select candidates.

## Blockers and conflicts

- No implementation blocker or authoritative documentation conflict remains.
- Checkpoint 4 commit/private push and clean committed-tree rebuild require
  explicit authorization. Every registry read, authentication, publication and
  tag/settings mutation remains behind its later separate gate.
- The working tree contains an unrelated `angular.json` CLI analytics opt-out;
  it must stay outside the M18/M19 scoped commit unless Ricard explicitly
  includes it.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC deadlocks inside it. Node 22.23.1 is compatible; official
  builds pass.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- Angular emits an initial-bundle warning at 980.47 kB plus Ajv's CommonJS
  warning; Standard emits Vite's 860.39 kB advisory. All remain below failure
  thresholds and are observations, not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035, D-043 and
  D-045 legacy Angular remain inactive until separately promoted.

## Open questions

None.

## Latest verification

- Review 119 cycle 5 repeated authority/scope, frozen toolchain, deterministic
  candidates, artifacts, source, security, neutral dry runs, frozen consumers,
  workspace/reference evidence, Public/Internal migration, all 22 SPEC-008
  rows, documentation/deferred boundaries and diff with zero findings.
- Frozen offline install passed with zero downloads. Formatting, docs, lint,
  typecheck, builds, package/consumer/artifact/source/security, snippets,
  517/35 import boundaries and diff checks pass.
- All 668 workspace tests pass: core 444, Angular 103, Standard 50, scenarios
  38, Angular reference 25, validator 7 and pilot 1. Angular Chromium passes
  8/8 and Standard Chromium 6/6.
- Lower Angular `22.0.6` and latest-compatible `22.0.7`, both with Aria/CDK
  `22.0.5`, pass frozen offline native/pilot clean consumers through strict
  install, partial compilation, types, DOM, production build and Chromium.
- Two candidate preparations retained exact byte sizes and SHA-512 hashes for
  all three artifacts; evidence records `sourceCommit: null` and
  `neutralDryRun: true`. No registry access or Git action occurred.

## Task document map

- Approved M19 plan: `.ai-docs/plans/021-coordinated-experimental-0-3-release.md`
- Checkpoint 3 review: `.ai-docs/reviews/119-plan-021-checkpoint-3-review.md`
- Checkpoint 2 review: `.ai-docs/reviews/118-plan-021-checkpoint-2-review.md`
- Checkpoint 1 review: `.ai-docs/reviews/117-plan-021-checkpoint-1-review.md`
- Complete plan review: `.ai-docs/reviews/116-plan-021-review.md`
- Accepted publication architecture: `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- Accepted M19 promotion review: `.ai-docs/reviews/114-m19-coordinated-0-3-release-promotion-readiness.md`
- Candidate release notes: `.ai-docs/releases/0.3.0.md`
- Accepted M18 specification: `.ai-docs/specs/008-static-advanced-presentation-layout.md`
- Completed M18 plan: `.ai-docs/plans/020-static-advanced-presentation-layout.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
