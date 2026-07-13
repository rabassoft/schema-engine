# Schema Engine — Project Status

> This document is the canonical source of truth for the current project state.

## Last updated

- Date: 2026-07-13
- Updated by: Ricard / Codex
- Repository revision: `develop` contains the committed M1 implementation and PLAN-002 documentation, two commits ahead of `origin/develop`; GitHub default branch is `main`

## Current phase

M1 completed; architecture validation before M2.

## Current objective

Review and approve PLAN-002 for the M2 root-level immutable-operations increment.

## Latest completed work

- Implemented the pnpm workspace and framework-neutral `@rabassoft/schema-engine` package with zero runtime dependencies.
- Implemented immutable compiler contracts and `compileFormDefinition()` for the approved JSON Schema and UI Schema subset.
- Added 30 conformance fixtures and 10 focused unit tests; all 40 tests pass.
- Completed PLAN-001 and marked M1 complete in the roadmap.
- Updated SPEC-001 to Draft v0.1.5 with the normative M1 diagnostic contract and
  the clarified root-only M2 operation/result boundaries.
- Drafted a decision-complete PLAN-002 for `applyOperation()` and
  `applyFormOperation()`, including contracts, diagnostics, fixtures, and
  acceptance criteria.
- Committed the completed M1 increment and proposed PLAN-002 documentation on
  `develop` as `Rabassoft <ricard@rabassoft.com>`.

## In progress

No implementation task is active. PLAN-002 is Proposed and awaiting review.

## Next action

Review PLAN-002 and explicitly approve it before implementing M2.

## Blockers

None.

## Open questions

- None within PLAN-002; its implementation and fixture boundaries are specified.
- Other pre-runtime decisions remain listed in section 29 of SPEC-001.

## Verification status

- `CI=true pnpm install --frozen-lockfile` passed with the pinned lockfile.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 2 test files and 40 tests, including all 30 conformance fixtures.
- `pnpm build` and `pnpm test:package` passed.
- Built package exports verified with zero runtime dependencies.
- `git diff --check` and local Markdown link validation passed.
- PLAN-002 was checked against SPEC-001 v0.1.5 and the deferred-decisions
  register; no M2 production code was added.
- Current checkout is `develop`; the completed changes are committed locally and not pushed.

## Relevant documents

- `.ai-docs/specs/001-controlled-form-runtime.md`
- `.ai-docs/adrs/005-politica-dialecto-json-schema.md`
- `.ai-docs/adrs/006-limite-paquete-inicial.md`
- `.ai-docs/plans/001-compiler-only-implementation.md`
- `.ai-docs/plans/002-root-immutable-operations.md`
- `.ai-docs/roadmap/deferred-decisions.md`
- `.ai-docs/adrs/000-index.md`
- `packages/core/src/index.ts`
- `packages/core/test/conformance/fixtures/`
