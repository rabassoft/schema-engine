# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-20 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0 and SPEC-009 v0.1.0
- **Last implementation plan:** PLAN-023 revision 0, Completed
- **Last completed implementation plan:** PLAN-023 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-018 revision 5
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

Preserve the completed M21 baseline and choose the next milestone or Deferred
capability through a separate prioritization review.

## In progress

None.

## Latest completed work

- Completed PLAN-023 checkpoint 11, PLAN-023 revision 0 and M21 after final
  review 164 cycle 3 repeated all eighteen areas and all 27 SPEC-009 rows with
  zero findings.
- Reverified npm identity, write-protected 2FA, Rabassoft authority, exact
  selected/live bytes, integrity, signatures, public access, aliases,
  manifests, peers, exports, Corresponding Source, licensing and absence of
  repository/provenance metadata for the complete M21 line.
- Repeated the frozen workspace, 689 tests, builds, package/artifact/source/
  security checks, snippets, 540 boundaries, Angular/Standard units and 14
  browser cases; all pass outside the documented esbuild sandbox limitation.
- Repeated frozen lower/latest M18/M20 candidate regressions and all eight
  exact/`next`/`latest`/unqualified lower/latest native/pilot consumers at
  Angular `22.0.6`/`22.0.7` plus Aria/CDK `22.0.5`; all pass.
- Corrected stale active mixed-window wording in root onboarding and M21
  release notes, then reconciled PLAN, ROADMAP, Deferred, indexes and history.

## Exact next action

Prepare a read-only prioritization review of the remaining Deferred
capabilities and framework targets, then ask Ricard to select the next
milestone. Do not infer React, Vue, Angular legacy, D-043 or a new functional
contract without that decision.

## Blockers and conflicts

- No implementation blocker or authoritative documentation conflict remains.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC aborts inside it; Node 22.23.1 is compatible and the
  official builds pass.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- Angular emits an initial-bundle warning at 989.78 kB plus Ajv's CommonJS
  warning; Standard emits Vite's 868.50 kB advisory. These are observations,
  not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035, D-043 and
  D-045 legacy Angular remain inactive until separately promoted.

## Open questions

- Which milestone or Deferred capability should be evaluated next?

## Latest verification

- Review 164 cycle 1 recorded the restricted-sandbox build abort and corrected
  two stale mixed-window claims; cycle 2 corrected closing-document formatting;
  cycle 3 repeated the complete closure from
  registry identity through final documentation/diff with zero findings.
- npm 10.9.8, official registry, `ricardrabasso`, verified
  `ricard@rabassoft.com`, `auth-and-writes`, Rabassoft owner and all three
  `read-write` package permissions pass.
- Exact public M21 bytes/signatures and immutable M19 package/source evidence
  pass; core/base are `next/latest: 0.4.0`, pilot is
  `next/latest: 0.2.0`, and unqualified resolution selects the same line.
- Frozen install, format, docs, lint, types, 689 tests, builds, package,
  artifacts, source, security, snippets, boundaries, units and both browser
  lanes pass.
- All 27 SPEC-009 rows, the Public/Internal migration, frozen SPEC-008/M18
  regression, candidate lower/latest lanes and eight registry consumer
  matrices pass.
- `pnpm test:release:tooling`, `pnpm docs:check`, `pnpm format:check`,
  `pnpm lint` and `git diff --check` pass after final reconciliation.

## Task document map

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
