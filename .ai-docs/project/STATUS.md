# Schema Engine — Project Status

> This document is the canonical source of truth for the current project state.

## Last updated

- Date: 2026-07-13
- Updated by: Ricard / Codex
- Repository revision: `develop` contains committed reviewed M3 and ADR-008 at `bae261f`, four commits ahead of `origin/develop`, with the completed M4 increment uncommitted; GitHub default branch is `main`

## Current phase

M1 through M4 completed; no implementation task is active.

## Current objective

Prepare the next reviewed increment for M5 native HTML renderers.

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
- Accepted ADR-008 and promoted D-027 with inline
  `ViewContainerRef.createComponent()` plus creation-time bindings.
- Committed the D-027/ADR-008 resolution on `develop` as
  `Rabassoft <ricard@rabassoft.com>`.
- Drafted, formally reviewed, and approved PLAN-004 for the Angular 22 headless
  adapter, Signals projection, renderer resolver, and ViewContainerRef outlet.
- Implemented the private `@rabassoft/schema-engine-angular` package with a
  controlled-form directive, Signals snapshot projection, immutable renderer
  resolver, and inline field outlet using creation-time input/output bindings.
- Added standard and explicit zoneless TestBed coverage for controlled intents,
  transactional runtime replacement, renderer lifecycle, diagnostics, and
  package construction; all 119 repository tests pass.
- Completed PLAN-004 and milestone M4 without adding Angular, RxJS, DOM, or
  browser dependencies to the core package and without implementing M5 controls.

## In progress

None. No active implementation task.

## Next action

Draft and formally review PLAN-005 for M5 native HTML renderers before any M5
implementation.

## Blockers

None.

## Open questions

- None. The Angular `ValidatorFn` bridge portion of D-024 remains deferred and
  outside completed M4.
- Other pre-runtime decisions remain listed in section 29 of SPEC-001.

## Verification status

- `pnpm install --frozen-lockfile` passed with Angular 22.0.6 resolved from the
  pinned lockfile.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed across both
  packages.
- `pnpm test` passed: 8 test files and 119 tests, including 15 Angular adapter
  tests and all existing M1-M3 fixtures.
- `pnpm build` passed, including Angular partial compilation with `ngc`.
- `pnpm test:package` passed for both root entry points and constructs the
  Angular resolver from an environment injector.
- `git diff --check` passed; local Markdown links were validated.
- The core package remains free of Angular and runtime dependencies; no native
  renderer or deferred capability entered M4.
- Current checkout is `develop`; the completed M4 increment is uncommitted and
  nothing was pushed in this task.

## Relevant documents

- `.ai-docs/specs/001-controlled-form-runtime.md`
- `.ai-docs/adrs/005-politica-dialecto-json-schema.md`
- `.ai-docs/adrs/006-limite-paquete-inicial.md`
- `.ai-docs/adrs/007-resolucion-renderers-testers.md`
- `.ai-docs/adrs/008-instanciacion-renderers-angular.md`
- `.ai-docs/plans/001-compiler-only-implementation.md`
- `.ai-docs/plans/002-root-immutable-operations.md`
- `.ai-docs/plans/003-controlled-runtime.md`
- `.ai-docs/plans/004-angular-adapter.md`
- `.ai-docs/roadmap/deferred-decisions.md`
- `.ai-docs/adrs/000-index.md`
- `packages/core/src/index.ts`
- `packages/core/test/conformance/fixtures/`
- `packages/core/test/operations/fixtures/`
- `packages/core/test/runtime/fixtures/`
- `packages/angular/src/index.ts`
- `packages/angular/test/`
