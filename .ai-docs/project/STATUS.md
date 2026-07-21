# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-21 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0 and SPEC-009 v0.1.0
- **Last implementation plan:** PLAN-023 revision 0, Completed
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

Prepare and completely review PLAN-024 for the accepted M22 sanitized-public-
history delivery without starting implementation or changing external state.

## In progress

None.

## Latest completed work

- Accepted ADR-026 revision 0 and coordinated ADR-018 revision 6 after review
  166 cycle 3 passed all fourteen areas with zero findings; PLAN-024 preparation
  is authorized but implementation and external actions remain inactive.
- Selected preservation of sanitized reachable history with public `.ai-docs`,
  an old/new commit map, solo-maintainer controls and a later separately gated
  OIDC/provenance release transition.
- Promoted D-043 for M22 normative design after review 165 cycle 2 passed with
  zero findings; the read-only audit found no heuristic secret, one historical
  local path, 235 `.ai-docs` files and incomplete public repository governance.
  Publication as-is is rejected and no implementation is active.
- Completed PLAN-023 checkpoint 11, PLAN-023 revision 0 and M21 after final
  review 164 cycle 3 repeated all eighteen areas and all 27 SPEC-009 rows with
  zero findings.
- Reverified npm identity, write-protected 2FA, Rabassoft authority, exact
  selected/live bytes, integrity, signatures, public access, aliases,
  manifests, peers, exports, Corresponding Source, licensing and absence of
  repository/provenance metadata for the complete M21 line.

## Exact next action

Prepare and completely review PLAN-024 for the bounded M22 repository
sanitization/publication delivery. Do not implement it before approval.

## Blockers and conflicts

- No implementation blocker or authoritative documentation conflict remains.
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
  Angular remain inactive. D-043 is design-only M22; no implementation or
  external action is active.

## Open questions

- None for M22 planning. A real scanner, rights or personal-data finding must
  stop PLAN-024 for explicit resolution.

## Latest verification

- Review 166 cycle 3 repeated all fourteen architecture, security, licensing,
  history, governance, transition, scope and documentation areas with zero
  findings. Official npm/GitHub requirements were rechecked; no mutation
  occurred.
- Review 165 cycle 2 repeated authority, scope, reachable-history/content,
  identity, GitHub settings, publication metadata, alternatives and gates with
  zero findings; no mutation occurred.
- The reachable-history heuristic scan found no credential/private-key/token
  pattern or sensitive filename. One local absolute path remains in historical
  review 132; dedicated scanner evidence is still required before publication.
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
