# Schema Engine — Project Status

> This document is the canonical source of truth for the current project state.

## Last updated

- Date: 2026-07-13
- Updated by: Ricard / Codex
- Repository revision: `develop` contains committed reviewed M3 and ADR-007 documentation, three commits ahead of `origin/develop`; GitHub default branch is `main`

## Current phase

M1, M2, and M3 completed; architecture validation before M4.

## Current objective

Resolve Angular renderer instantiation D-027 and prepare PLAN-004 for M4.

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
- Implemented and exported the controlled runtime with synchronous validation,
  immutable snapshots, controlled updates, operation emission, interaction,
  scopes, subscriptions, listener isolation, and disposal.
- Added 10 runtime conformance fixtures and focused tests; all 103 repository
  tests pass.
- Completed PLAN-003 and milestone M3.
- Reviewed the complete M3 diff and fixed accessor execution across validator
  results, definitions, paths, scopes, and diagnostic parameter copying.
- Accepted ADR-007 and promoted D-023 with deterministic scored renderer testers
  owned by framework adapters.
- Committed reviewed M3 and the D-023/ADR-007 resolution on `develop` as
  `Rabassoft <ricard@rabassoft.com>`.

## In progress

No implementation task is active. M3 review and D-023 resolution are complete.

## Next action

Resolve D-027 for Angular dynamic instantiation, then draft and approve PLAN-004
before implementing the Angular adapter.

## Blockers

None.

## Open questions

- Angular dynamic instantiation remains open as D-027.
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
- SPEC-001 v0.1.7 includes the approved M3 option contract.
- `pnpm test` passes with 6 test files and 103 tests, including 10 runtime
  fixtures.
- M3 accessor-safety regression coverage passes; the suite now contains 104
  tests.
- ADR-007 was checked against SPEC-001, ADR-003/004, D-016, D-023, D-024,
  D-026, and D-027.
- Current checkout is `develop`; M3 and ADR-007 are committed locally and not pushed.

## Relevant documents

- `.ai-docs/specs/001-controlled-form-runtime.md`
- `.ai-docs/adrs/005-politica-dialecto-json-schema.md`
- `.ai-docs/adrs/006-limite-paquete-inicial.md`
- `.ai-docs/adrs/007-resolucion-renderers-testers.md`
- `.ai-docs/plans/001-compiler-only-implementation.md`
- `.ai-docs/plans/002-root-immutable-operations.md`
- `.ai-docs/roadmap/deferred-decisions.md`
- `.ai-docs/adrs/000-index.md`
- `packages/core/src/index.ts`
- `packages/core/test/conformance/fixtures/`
- `packages/core/test/operations/fixtures/`
