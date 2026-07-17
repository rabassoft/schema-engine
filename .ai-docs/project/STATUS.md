# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-17 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1 and SPEC-007
  v0.1.0
- **Last implementation plan:** PLAN-019 revision 1, Completed
- **Last completed implementation plan:** PLAN-019 revision 1
- **Active implementation task:** None
- **Last accepted ADR:** ADR-022 revision 1
- **Implemented capability:** D-047/M17 reusable synchronous Ajv validation plus
  D-044/M15 and PLAN-018 checkpoints 1–4
- **Phase:** M1–M15, M17 and G0 completed; M16 delivery in progress
- **Published packages:** core and Angular `0.2.0` are byte-identical and
  verified under coordinated `next` and `latest`

## Current objective

Resume Approved PLAN-018 at checkpoint 5 using the completed reusable validator
integration.

## In progress

- None. PLAN-019/M17 is complete and PLAN-018 checkpoint 5 is the next approved
  implementation boundary.

## Latest completed work

- Completed PLAN-019 revision 1 and D-047/M17 after final review 089 cycle 2
  passed with zero findings: private reusable Ajv validation now powers Angular
  and Standard without entering core or published packages.
- Accepted ADR-022 revision 1 and SPEC-007 v0.1.0; lazy Angular bootstrap keeps
  the initial bundle below 1 MB and exact root development ownership keeps the
  Angular/Vite server resolvable.
- Completed PLAN-018 checkpoint 4 after review 081 cycle 2 passed with zero
  findings: identity-stable collections, generic normalized insertion, Public
  item intentions, conflicts, focus and all six scenarios are verified.
- Completed PLAN-018 checkpoint 3 after review 080 cycle 2 passed with zero
  findings: stable normalized primitives, nested/presentation semantics,
  localized numeric buffers, nullable distinctions and cleanup are verified.
- Completed PLAN-018 checkpoint 2 after review 079 cycle 2 passed with zero
  findings: controlled roots, all operation modes, complete application actions
  and idempotent runtime/subscription cleanup are verified.

## Exact next action

Implement PLAN-018 checkpoint 5: complete the Standard reference workspace UX,
build-checked integration snippet and active Ajv validation evidence.

## Blockers and conflicts

- No implementation, documentation or external-system blocker.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC deadlocks inside it; the identical official build passes
  outside and this is an environment constraint, not a product blocker.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- The working tree contains an unrelated Angular CLI analytics identifier in
  `angular.json`; it remains outside PLAN-018 and will stay unstaged. No push is
  authorized.
- The private Angular application emits a 750 kB bundle warning at 943.75 kB
  but remains below its 1 MB error budget; syntax and Ajv are isolated in lazy
  143.14 kB and 129.35 kB chunks. Ajv also emits a CommonJS optimization
  warning. These are observations, not implementation blockers.
- D-046 has Accepted ADR-021 and Approved PLAN-018 for checkpoints 1–7. React,
  Vue, D-026, D-035, D-045 legacy Angular, persistence, hosting, CI, Public
  contract, release and repository-visibility work remain inactive.

## Open questions

- None.

## Latest verification

- Final review 089 cycle 2 repeated authority, package/API, Ajv behavior,
  Angular/Standard integration, catalog/release isolation, documentation and
  diff with zero findings.
- Formatting/check, lint, docs, strict types, 400 core tests, 79 Public Angular
  tests, 35 catalog tests, 7 validator tests, 24 Angular reference tests, 26
  Standard tests and 11 boundary-verifier tests pass.
- Package smokes and 407 import boundaries pass. Standard builds at 323.80 kB;
  Angular builds at 943.75 kB initial plus lazy 129.35/143.14 kB chunks and
  Chromium passes 8/8. Public core/Angular files have no diff.

## Task document map

- Active plan: `.ai-docs/plans/018-standard-dom-reference-shell.md`
- Active plan review: `.ai-docs/reviews/077-plan-018-review.md`
- Checkpoint 1 review: `.ai-docs/reviews/078-plan-018-checkpoint-1-review.md`
- Checkpoint 2 review: `.ai-docs/reviews/079-plan-018-checkpoint-2-review.md`
- Checkpoint 3 review: `.ai-docs/reviews/080-plan-018-checkpoint-3-review.md`
- Checkpoint 4 review: `.ai-docs/reviews/081-plan-018-checkpoint-4-review.md`
- Latest completed plan: `.ai-docs/plans/019-reusable-synchronous-ajv-validator.md`
- Latest completed plan review: `.ai-docs/reviews/089-plan-019-final-review.md`
- Validator architecture: `.ai-docs/adrs/022-validador-ajv-sincrono-reutilizable.md`
- Validator specification: `.ai-docs/specs/007-synchronous-ajv-validator.md`
- Validator checkpoint reviews: `.ai-docs/reviews/086-plan-019-checkpoint-1-review.md`
  through `.ai-docs/reviews/088-plan-019-checkpoint-3-review.md`
- Active Standard architecture: `.ai-docs/adrs/021-shell-standard-dom-core-directo.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
