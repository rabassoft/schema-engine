# Schema Engine — Project Status

> This document is the canonical source of truth for the current project state.

## Last updated

- Date: 2026-07-13
- Updated by: Ricard / Codex
- Repository revision: current `develop` HEAD contains the completed and reviewed M5 increment, six commits ahead of `origin/develop`; GitHub default branch is `main`

## Current phase

M1 through M5 completed; no implementation task active.

## Current objective

No active implementation objective. M5 is reviewed, committed, and complete.

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
- Committed the completed M4 increment on `develop` as `f7199d6` with repository
  identity `Rabassoft <ricard@rabassoft.com>`.
- Confirmed that M5 will absorb Angular `LOCALE_ID` fallback and neutral
  `TextResolver` projection instead of deferring those SPEC-001 requirements.
- Drafted proposed PLAN-005 with exact pre-release contract changes, native
  registrations, accessible controls, localized controlled numeric editing,
  diagnostics, fixtures, exclusions, and acceptance criteria.
- Verified against current official Angular 22 documentation that Signal Forms,
  `form()`, `FormField`, and custom-control contracts are stable.
- Re-reviewed PLAN-005 to use one private Signal Form leaf per native renderer
  while rejecting a business-model `FieldTree` that would bypass strict core
  operations and controlled confirmation.
- Added explicit reconciliation, focus/reset, dependency, validation-ownership,
  D-002/D-024, tests, exclusions, and package trade-offs; the revised plan is
  ready for approval.
- Formally approved revised PLAN-005 and promoted its contracts to SPEC-001
  Draft v0.1.11.
- Implemented native Angular 22 string, number/integer, and boolean renderers
  backed by private Signal Forms leaf buffers without changing controlled state
  ownership.
- Added deterministic native providers and overrides, `LOCALE_ID` fallback,
  replaceable text projection, accessible issue markup, and isolated adapter
  diagnostics.
- Added localized numeric parsing and formatting with strict integer behavior,
  incomplete edit preservation, separate display/edit forms, and confirmed-value
  reconciliation.
- Added native renderer, resolver, accessibility, controlled interaction,
  zoneless, and numeric conformance coverage; all 140 repository tests pass.
- Completed PLAN-005 and milestone M5 without promoting deferred capabilities.
- Reviewed the complete tracked and untracked M5 diff against SPEC-001,
  PLAN-005, ADR-007, ADR-008, and the deferred register.
- Fixed localized negative-number round-tripping for RTL locales whose
  `Intl.NumberFormat` output contains directional literal marks, and covered the
  correction without increasing the public scope.
- Committed the reviewed M5 increment on `develop` with repository identity
  `Rabassoft <ricard@rabassoft.com>`.

## In progress

None.

## Next action

Select and formally scope the next increment. Push `develop` only when
explicitly requested.

## Blockers

None. There is no implementation blocker or documentation conflict.

## Open questions

- None within completed PLAN-005.
- The Angular `ValidatorFn` bridge portion of D-024 remains deferred and outside
  completed M5.
- Other pre-runtime decisions remain listed in section 29 of SPEC-001.

## Verification status

- `pnpm install --frozen-lockfile` passed with Angular 22.0.6 resolved from the
  pinned lockfile.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed across both
  packages.
- `pnpm test` passed: 10 test files and 140 tests, including 36 Angular adapter
  and native-renderer tests plus all 104 core tests.
- `pnpm build` passed, including Angular partial compilation with `ngc`.
- `pnpm test:package` passed for both root entry points and constructs the
  Angular resolver from an environment injector.
- `git diff --check` passed; local Markdown links were validated.
- The core package remains free of Angular and runtime dependencies; only
  framework-neutral text contracts entered core for M5.
- Current checkout is `develop`; the reviewed M5 increment is committed in the
  current HEAD, and no push was performed in this task.
- Completed PLAN-005 was checked against SPEC-001, ADR-007/008, completed
  PLAN-004, current M4 contracts, and D-008/D-010/D-024/D-025/D-028/D-029/D-030.
- The Signal Forms re-review used current official Angular 22 overview, custom
  controls, `form()`, `FormField`, field-state, and JSON-driven forms
  documentation.
- Native adapter imports are limited to `@angular/forms/signals`; no Reactive
  Forms, Template-driven Forms, compatibility layer, Zone.js coupling, browser
  global, component library, or deferred capability entered M5.

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
- `.ai-docs/plans/005-native-html-renderers.md`
- `.ai-docs/roadmap/deferred-decisions.md`
- `.ai-docs/adrs/000-index.md`
- `packages/core/src/index.ts`
- `packages/core/test/conformance/fixtures/`
- `packages/core/test/operations/fixtures/`
- `packages/core/test/runtime/fixtures/`
- `packages/angular/src/index.ts`
- `packages/angular/test/`
