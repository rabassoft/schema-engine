# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-18 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1 and SPEC-007
  v0.1.0
- **Last implementation plan:** PLAN-018 revision 1, Completed
- **Last completed implementation plan:** PLAN-018 revision 1
- **Active implementation task:** None
- **Last accepted ADR:** ADR-021 revision 1
- **Implemented capability:** D-046/M16 private direct-core Standard/DOM shell,
  D-047/M17 reusable synchronous Ajv validation and D-044/M15
- **Phase:** M1–M17 and G0 completed
- **Published packages:** core and Angular `0.2.0` are byte-identical and
  verified under coordinated `next` and `latest`

## Current objective

Select the next milestone explicitly from the remaining deferred capabilities;
do not start implementation before its promotion/design/plan gates.

## In progress

- None.

## Latest completed work

- Completed private integration-explanation maintenance after review 097 cycle
  2 passed all ten areas with zero findings: Angular and Standard now explain
  the controlled flow, purpose and retained application responsibility around
  every exact build-checked excerpt.

- Completed post-M16 private reference-experience maintenance after review 096
  cycle 3 passed all ten areas with zero findings: Standard independently
  matches Angular's requested labels, button hierarchy, stable-team controls,
  semantic visual tokens and header theme without shared production UI code.

- Completed PLAN-018 revision 1/D-046/M16 after final review 095 cycle 2 fixed
  full-page theme ownership and repeated all fourteen areas plus the complete
  verification matrix with zero findings.

- Completed PLAN-018 checkpoint 7 after review 094 cycle 2 corrected pending
  control DOM stability and repeated all twelve areas with zero findings:
  independent Standard/Angular Chromium, release isolation and onboarding are
  green without Public drift.

## Exact next action

Review the remaining Deferred register and ROADMAP with Ricard, choose the next
milestone explicitly, then run its required promotion/design/plan gates before
implementation.

## Blockers and conflicts

- No implementation, documentation or external-system blocker.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC deadlocks inside it. Angular CLI also rejects the bundled
  Node 24.14.0; installed Node 22.23.1 is compatible and the identical official
  build passes outside. These are environment constraints, not product blockers.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- The working tree contains an unrelated Angular CLI analytics identifier in
  `angular.json`; it remains outside PLAN-018 and will stay unstaged. No push is
  authorized.
- The private Angular application emits a 750 kB bundle warning at 945.80 kB
  but remains below its 1 MB error budget; syntax and Ajv are isolated in lazy
  143.14 kB and 129.35 kB chunks. Ajv also emits a CommonJS optimization
  warning. These are observations, not implementation blockers.
- The Standard app emits Vite's advisory above 500 kB at 842.51 kB because its
  visible CodeMirror editors are in the initial bundle. PLAN-018 defines no
  Standard bundle budget; this is an observation, not a checkpoint blocker.
- ADR-021 revision 1 remains authoritative and PLAN-018 revision 1/D-046/M16 are
  complete after final review 095 cycle 2.
- React, Vue, D-026, D-035, D-045 legacy Angular, persistence, hosting, CI,
  Public contract, release and repository-visibility work remain inactive.

## Open questions

- None.

## Latest verification

- Review 097 cycle 2 repeated scope, snippet integrity, target-specific
  explanation, architectural accuracy, independence, accessibility,
  regression, builds and delivery controls with zero findings. Eight exact
  snippets, Angular unit/DOM 24/24 plus Chromium 8/8 and Standard unit/DOM
  47/47 plus Chromium 6/6 pass with strict types and scoped lint/format.

- Review 096 cycle 3 repeated authority/scope, independent target ownership,
  visible hierarchy/text, stable-team intentions, semantic visual parity,
  accessibility/lifecycle, regression, boundaries and delivery controls with
  zero findings. Standard unit/DOM passes 47/47, Chromium 6/6, strict types,
  scoped lint/format, 12/12 boundary fixtures, 431 import boundaries and diff
  checks pass.

- Final review 095 cycle 2 repeated authority, dependencies/privacy,
  direct-core architecture, controlled lifecycle, normalized DOM,
  configuration/UX/accessibility, snippets/browsers, release isolation,
  documentation and complete diff with zero findings.

- Review 094 cycle 2 repeated authority, Chromium ownership, scenarios,
  controlled/configuration behavior, UX/accessibility, Angular independence,
  release/Public isolation, documentation and diff with zero findings.

- Review 093 cycle 1 repeated authority, simultaneous hierarchy, tabs,
  evidence, highlighting/copy/themes, snippets, responsive accessibility,
  lifecycle, regression/isolation and diff with zero findings.

- Review 092 cycle 2 repeated authority, dependency/boundary ownership,
  editors, configuration transitions, D-013/Ajv isolation, accessibility,
  regression/release isolation and diff with zero findings.
- Review 091 cycle 3 repeated authority, dependencies, private boundaries,
  configuration transitions, D-013, workspace parity, accessibility, tooling,
  regression/release isolation and delivery controls with zero findings.
- Review 090 cycle 3 repeated scope, authority, UX parity, target independence,
  editor/configuration lifecycle, D-013, Ajv ownership, accessibility,
  release/Public isolation and documentation with zero findings.
- Final review 089 cycle 2 repeated authority, package/API, Ajv behavior,
  Angular/Standard integration, catalog/release isolation, documentation and
  diff with zero findings.
- Formatting/check, lint, docs, strict types, 400 core tests, 79 Public Angular
  tests, 35 catalog tests, 7 validator tests, 24 Angular reference tests and 47
  Standard tests pass. Standard/Angular Chromium pass 6/6 and 8/8.
- Package/artifact/source/security/clean-consumer gates and 431 import
  boundaries pass. Standard builds at 842.51 kB plus 9.11 kB CSS;
  Angular builds at 945.80 kB initial plus lazy 129.35/143.14 kB chunks and
  Chromium passes 8/8. Public core/Angular files have no diff.

## Task document map

- Latest completed plan: `.ai-docs/plans/018-standard-dom-reference-shell.md`
- Latest explanation review: `.ai-docs/reviews/097-integration-explanation-maintenance-review.md`
- Latest maintenance review: `.ai-docs/reviews/096-standard-reference-parity-maintenance-review.md`
- Approved plan review: `.ai-docs/reviews/091-plan-018-revision-1-review.md`
- Revision 0 plan review: `.ai-docs/reviews/077-plan-018-review.md`
- Checkpoint 1 review: `.ai-docs/reviews/078-plan-018-checkpoint-1-review.md`
- Checkpoint 2 review: `.ai-docs/reviews/079-plan-018-checkpoint-2-review.md`
- Checkpoint 3 review: `.ai-docs/reviews/080-plan-018-checkpoint-3-review.md`
- Checkpoint 4 review: `.ai-docs/reviews/081-plan-018-checkpoint-4-review.md`
- Checkpoint 5 review: `.ai-docs/reviews/092-plan-018-checkpoint-5-review.md`
- Checkpoint 6 review: `.ai-docs/reviews/093-plan-018-checkpoint-6-review.md`
- Checkpoint 7 review: `.ai-docs/reviews/094-plan-018-checkpoint-7-review.md`
- Final implementation review: `.ai-docs/reviews/095-plan-018-final-implementation-review.md`
- Latest completed plan review: `.ai-docs/reviews/095-plan-018-final-implementation-review.md`
- Reusable validator prerequisite: `.ai-docs/plans/019-reusable-synchronous-ajv-validator.md`
- Reusable validator final review: `.ai-docs/reviews/089-plan-019-final-review.md`
- Validator architecture: `.ai-docs/adrs/022-validador-ajv-sincrono-reutilizable.md`
- Validator specification: `.ai-docs/specs/007-synchronous-ajv-validator.md`
- Validator checkpoint reviews: `.ai-docs/reviews/086-plan-019-checkpoint-1-review.md`
  through `.ai-docs/reviews/088-plan-019-checkpoint-3-review.md`
- Active Standard architecture: `.ai-docs/adrs/021-shell-standard-dom-core-directo.md`
- Accepted architecture review: `.ai-docs/reviews/090-adr-021-revision-1-review.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
