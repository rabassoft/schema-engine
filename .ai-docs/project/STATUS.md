# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-18 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0 and SPEC-008 v0.1.0
- **Last implementation plan:** PLAN-020 revision 0, Approved
- **Last completed implementation plan:** PLAN-018 revision 1
- **Active implementation task:** None
- **Last accepted ADR:** ADR-024 revision 1
- **Implemented capability:** PLAN-020 checkpoint 1 Public core advanced
  presentation compiler, D-046/M16 private direct-core Standard/DOM shell,
  D-047/M17 reusable synchronous Ajv validation and D-044/M15
- **Phase:** M1–M17 and G0 completed; M18 implementation in progress
- **Published packages:** core and Angular `0.2.0` are byte-identical and
  verified under coordinated `next` and `latest`

## Current objective

Execute approved PLAN-020 for the accepted M18 neutral layout, Angular
presentation-container SPI and sole Angular Aria 22 pilot.

## In progress

None.

## Latest completed work

- Completed PLAN-020 checkpoint 1 after review 104 cycle 3 repeated all ten
  areas and the complete verification gate with zero findings. Core now exports
  the thirteen exact advanced-presentation contracts, normalizes tabs,
  accordion and grid iteratively with the closed diagnostics/fallback contract,
  and carries programmatic plus serializable conformance evidence. Runtime,
  Angular, Standard, manifests, versions and dependencies remain unchanged.

- Approved PLAN-020 revision 0 after review 103 cycle 2 repeated all fourteen
  areas with zero findings. Eight bounded checkpoints map every SPEC-008
  conformance row; checkpoint 5/7 network actions, publication, external
  settings, commit and push retain separate gates.

- Accepted SPEC-008 v0.1.0 after review 102 cycle 5 repeated all twelve areas
  with zero findings. It closes neutral grammar/diagnostics/runtime boundaries,
  independent target projection, the Angular container SPI/native fallback,
  sole Aria pilot, package/theme matrix and conformance contract.

- Accepted ADR-024 revision 1 after review 101 cycle 4 repeated all eleven
  areas with zero findings. It fixes a separate Angular Experimental container
  SPI, exact provider/child-projection behavior, mandatory native fallback, an
  isolated future package/theme boundary and Angular Aria 22 as the sole pilot.

- Accepted D-025 promotion-readiness review 100 after cycle 4 repeated all
  twelve areas with zero findings. It promotes only an Angular Experimental
  presentation-container seam with mandatory native fallback and one isolated
  optional pilot; broader kits remain Deferred.

## Exact next action

Execute PLAN-020 checkpoint 2: extend iterative manual FormDefinition
validation with the eight exact reasons and prove runtime, operation, snapshot,
validation, scope and collection-identity invariance; repeat the complete
checkpoint review until one pass has zero findings.

## Blockers and conflicts

- No implementation or documentation blocker. PLAN-020 revision 0 authorizes
  checkpoints 1–8; checkpoint 5 dependency resolution and checkpoint 7
  registry-backed consumers retain separate network execution gates.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC deadlocks inside it. Angular CLI also rejects the bundled
  Node 24.14.0; installed Node 22.23.1 is compatible and the identical official
  build passes outside. These are environment constraints, not product blockers.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- The working tree contains an unrelated Angular CLI analytics identifier in
  `angular.json`; it remains outside PLAN-020 and will stay unstaged. No push is
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

None.

## Latest verification

- PLAN-020 checkpoint 1 review 104 cycle 3 repeated authority/scope, Public
  inventory, descriptor safety, grammar/diagnostics, order/precedence,
  normalization/identity, immutability/fallback, hostile inputs,
  fixtures/package surface and regression/dirty-worktree safety with zero
  findings. Core build, strict types, scoped ESLint/Prettier, built-package
  smoke, declaration inspection and diff checks pass; 23 files and 429 core
  tests pass.

- PLAN-020 review 103 cycle 2 repeated authority/scope, sequencing, Public
  migration, compiler safety, runtime ownership, Angular SPI/native fallback,
  Standard independence, pilot behavior, package/theme isolation,
  compatibility, all 22 conformance rows, verification/persistence, deferred
  boundaries and dirty-worktree safety with zero findings. Scoped formatting
  and diff checks pass; documentation checks pass for 178 Markdown files and
  628 local links.

- SPEC-008 review 102 cycle 5 repeated authority/scope, neutral Public surface,
  grammar/normalization, compiler diagnostics, manual/runtime behavior,
  state/grid/accessibility, application ownership, Angular SPI/providers,
  Aria pilot, compatibility/support, cross-target/deferred boundaries and
  documentation with zero findings. Documentation checks pass for 176 Markdown
  files and 615 local links; scoped format and diff checks pass.

- ADR-024 review 101 cycle 4 repeated authority/scope, Public/Internal
  minimality, provider behavior, fallback/failure, projection/lifecycle,
  interaction, primary-source pilot evidence, package/theme isolation,
  compatibility, deferred boundaries and documentation with zero findings.
  Documentation checks pass for 174 Markdown files and 605 local links; scoped
  format and diff checks pass.

- D-025 review 100 cycle 4 repeated restart evidence, cohesion, core/Angular
  ownership, native continuity, pilot/package/theme isolation, cross-target
  boundaries, Public migration, exclusions and delivery sequence with zero
  findings.

- ADR-023 review 099 cycle 3 repeated grammar/composition, identity, state,
  grid, safety/fallback, text/accessibility/failure, runtime authority,
  renderer-kit seam, cross-target/Public migration and exclusions/gates with
  zero findings.

- Promotion-readiness review 098 cycle 2 repeated demand, restart condition,
  authority, cohesion, state, grid, accessibility, renderer ownership,
  cross-target evidence, compatibility, exclusions and delivery sequencing
  with zero findings. Documentation-only diff checks pass; no contract, code,
  external action, commit or push is part of the promotion.

- Formatting/check, lint, docs, strict types, 400 core tests, 79 Public Angular
  tests, 35 catalog tests, 7 validator tests, 24 Angular reference tests and 47
  Standard tests pass. Standard/Angular Chromium pass 6/6 and 8/8.
- Package/artifact/source/security/clean-consumer gates and 431 import
  boundaries pass. Standard builds at 842.51 kB plus 9.11 kB CSS;
  Angular builds at 945.80 kB initial plus lazy 129.35/143.14 kB chunks and
  Chromium passes 8/8. Public core/Angular files have no diff.

## Task document map

- Approved M18 plan: `.ai-docs/plans/020-static-advanced-presentation-layout.md`
- M18 plan review: `.ai-docs/reviews/103-plan-020-review.md`
- PLAN-020 checkpoint 1 review: `.ai-docs/reviews/104-plan-020-checkpoint-1-review.md`

- Accepted M18 specification: `.ai-docs/specs/008-static-advanced-presentation-layout.md`
- M18 specification review: `.ai-docs/reviews/102-spec-008-review.md`
- Accepted Angular container architecture: `.ai-docs/adrs/024-spi-contenedores-angular-y-piloto-angular-aria.md`
- Angular container architecture review: `.ai-docs/reviews/101-adr-024-review.md`
- D-025 promotion decision: `.ai-docs/reviews/100-d025-angular-container-kit-promotion-readiness.md`
- Accepted M18 architecture: `.ai-docs/adrs/023-contenedores-layout-neutral-estatico.md`
- M18 architecture review: `.ai-docs/reviews/099-adr-023-review.md`
- M18 promotion decision: `.ai-docs/reviews/098-d011-m18-advanced-layout-promotion-readiness.md`
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
- Standard architecture review: `.ai-docs/reviews/090-adr-021-revision-1-review.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
