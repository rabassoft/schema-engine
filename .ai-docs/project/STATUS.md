# Schema Engine — Project Status

> This document is the canonical source of truth for the current project state.

## Last updated

- Date: 2026-07-13
- Updated by: Ricard / Codex
- Repository revision: `develop` contains committed M2 and proposed PLAN-003 documentation, two commits ahead of `origin/develop`; GitHub default branch is `main`

## Current phase

M1 and M2 completed; architecture validation before M3.

## Current objective

Review and approve PLAN-003 for the M3 controlled-runtime increment.

## Latest completed work

- Implemented the pnpm workspace and framework-neutral `@rabassoft/schema-engine` package with zero runtime dependencies.
- Implemented immutable compiler contracts and `compileFormDefinition()` for the approved JSON Schema and UI Schema subset.
- Added 30 conformance fixtures and 10 focused unit tests; all 40 tests pass.
- Completed PLAN-001 and marked M1 complete in the roadmap.
- Updated SPEC-001 through Draft v0.1.6 with the normative M1 and M2 diagnostic
  contracts and clarified root-only operation/result boundaries.
- Drafted a decision-complete PLAN-002 for `applyOperation()` and
  `applyFormOperation()`, including contracts, diagnostics, fixtures, and
  acceptance criteria.
- Committed the completed M1 increment and proposed PLAN-002 documentation on
  `develop` as `Rabassoft <ricard@rabassoft.com>`.
- Formally reviewed and approved PLAN-002 after closing accessor-property,
  malformed-path, minimum FormDefinition shape, and diagnostic-order behavior.
- Implemented and exported root-level `applyOperation()` and
  `applyFormOperation()` with immutable results and deterministic runtime
  diagnostics.
- Added 27 operation conformance fixtures and focused tests; all 82 repository
  tests pass.
- Completed PLAN-002 and milestone M2.
- Committed the completed M2 increment on `develop` as
  `Rabassoft <ricard@rabassoft.com>`.
- Reviewed commit `3347858` with no functional or documentation findings.
- Drafted PLAN-003 for controlled state, validation, immutable snapshots,
  subscriptions, interaction, scopes, and disposal.
- Committed the proposed PLAN-003 documentation on `develop` as
  `Rabassoft <ricard@rabassoft.com>`.

## In progress

No implementation task is active. PLAN-003 is Proposed and awaiting formal
review.

## Next action

Formally review PLAN-003 and resolve its public option/result/diagnostic changes
before approval. Do not implement M3 before approval.

## Blockers

None.

## Open questions

- PLAN-003 promotes source-schema ownership and listener-exception reporting;
  their exact public contracts require formal review.
- Other pre-runtime decisions remain listed in section 29 of SPEC-001.

## Verification status

- `CI=true pnpm install --frozen-lockfile` passed with the pinned lockfile.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 4 test files and 82 tests, including all compiler and
  operation conformance fixtures.
- `pnpm build` and `pnpm test:package` passed.
- Built package exports verified with zero runtime dependencies.
- `git diff --check` and local Markdown link validation passed.
- PLAN-002 was checked against SPEC-001 and the deferred-decisions register.
- The formal review checked PLAN-002 against the implemented M1 contracts and
  closed all identified decision ambiguities before approval.
- SPEC-001 v0.1.6 includes the M2 diagnostic contract.
- `pnpm test` passes with 4 test files and 82 tests, including 27 operation
  fixtures and all 30 compiler fixtures.
- Current checkout is `develop`; M2 is committed locally and not pushed.

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
- `packages/core/test/operations/fixtures/`
