# Schema Engine — Project Status

> This document is the canonical source of truth for the current project state.

## Last updated

- Date: 2026-07-13
- Updated by: Ricard / Codex
- Repository revision: current `develop` HEAD contains revised proposed ADR-009,
  its reviewed Angular public-surface correction, and the final review record;
  the accepted ADR-009/010 records and D-024 boundary review are committed in
  the current checkout, three commits ahead of `origin/develop`; GitHub default
  branch is `main`

## Current phase

M1 through M5 completed; no implementation task active.

## Current objective

Decide whether to accept or revise ADR-011 revision 1 after its repeated formal
review passed all eight acceptance areas.

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
- Confirmed that the user pushed M5 and that `develop` is synchronized with
  `origin/develop`.
- Audited both package export maps and root indexes, including consumer,
  extension, native-renderer, text, and internal-only Angular surfaces.
- Drafted proposed ADR-009 with explicit entry-point boundaries, an initial API
  inventory, Experimental/Stable/Deprecated/Internal states, change and
  deprecation rules, enforcement, exclusions, and acceptance criteria.
- Kept D-029 Candidate pending review and left D-028 responsible for SemVer,
  package coordination, Angular compatibility, and the exact deprecation
  window.
- Formally reviewed ADR-009 and identified three corrections: orthogonal
  visibility/stability/lifecycle, explicitly manual stability promotion, and an
  internal raw Angular renderer-registration token.
- Revised ADR-009 with Public/Internal visibility, Experimental/Stable
  stability, and Active/Deprecated lifecycle axes; Stable guarantees now survive
  deprecation.
- Clarified that version, `private`, and publication state never promote an API
  automatically.
- Removed `SCHEMA_RENDERER_REGISTRATIONS` from the Angular root entry point,
  retained it as an internal implementation token, and added a package smoke
  assertion that prevents accidental re-export.
- Committed ADR-009 revision 1 and its reviewed public-surface correction on
  `develop` with repository identity `Rabassoft <ricard@rabassoft.com>`.
- Completed the final formal review of ADR-009's seven acceptance areas with no
  remaining findings; kept ADR-009 Proposed and D-029 Candidate pending an
  explicit acceptance decision.
- Accepted ADR-009 after its completed formal review and promoted D-029; all
  current intended root exports remain Public + Experimental + Active, and no
  publication or additional implementation was authorized.
- Reviewed D-028 against pre-SPEC ADR-002, accepted ADR-006/009, current package
  manifests, partial Angular compilation, and current official SemVer, npm, and
  Angular guidance.
- Drafted proposed ADR-010 with independent product SemVer, explicit core and
  Angular peer ranges, a tested compatibility matrix, release coordination, and
  an exact Stable deprecation window.
- Formally reviewed ADR-010's seven acceptance areas and found three required
  corrections: honest SemVer treatment of Public + Experimental APIs after
  `1.0.0`, aligned resolved versions for Angular core/forms peers, and an
  unambiguous definition of the required subsequent MINOR release.
- Revised ADR-010 to define Stable SemVer plus an explicit Experimental
  extension, require aligned Angular core/forms versions, and define the later
  MINOR as a published release retaining the deprecated contract.
- Repeated the seven-area formal review with no remaining findings; kept
  ADR-010 Proposed, ADR-002 pending review, and D-028 Research until explicit
  acceptance.
- Accepted ADR-010 revision 1, marked the historical lockstep ADR-002
  Superseded, and promoted D-028 without changing package versions, dependency
  sections, or publication settings.
- Reviewed D-024 and recorded custom renderer registration as already resolved
  by ADR-007/009 and the implemented Angular API.
- Deferred the remaining Angular validation bridge because `ValidatorFn`, Signal
  Forms `Validator`, and neutral whole-model `SchemaValidator` have different
  control, context, error, and path semantics without a concrete consumer
  mapping requirement.
- Committed the reviewed ADR-009/010 acceptance records, ADR-002 supersession,
  D-028/D-029 promotions, and D-024 boundary review on `develop` with repository
  identity `Rabassoft <ricard@rabassoft.com>`.
- Reviewed D-008 against Draft 2020-12, SPEC-001, ADR-005/007/009, and the
  implemented compiler and renderer contracts.
- Separated `enum` and `const` data assertions from default-annotation
  `format`, and separated all three from the adapter-owned choice of visual
  renderer.
- Proposed promoting only a narrowly scoped `enum` increment; no deferred
  capability, public contract, or implementation was changed.
- Received explicit approval to separate D-008 and drafted proposed ADR-011 for
  string-only enum choices, UI Schema labels, text projection, validation
  ownership, and a higher-ranked native Angular select renderer.
- Kept `const`, `format`, non-string enums, radios, clearing to missing, SPEC-001,
  and all implementation unchanged pending formal review and acceptance.
- Formally reviewed ADR-011's eight acceptance areas and confirmed the overall
  string-enum, external-validation, controlled-state, renderer-rank, public-API,
  and exclusion direction.
- Identified three corrections required before acceptance: structurally
  exclusive choice/issue text contexts, safe ownership for malformed manual
  `choices`, and non-empty accessible labels including the empty-string value.
- Kept ADR-011 Proposed and D-008 Candidate; no SPEC, accepted ADR, package, or
  implementation contract changed.
- Applied all three ADR-011 review corrections: mutually exclusive text
  contexts, descriptor-safe compiler/runtime choice validation without changing
  PLAN-002, and non-blank accessible choice-label fallbacks.
- Repeated all eight acceptance checks with no remaining findings; retained
  ADR-011 Proposed revision 1 and D-008 Candidate pending an explicit decision.

## In progress

- None. No implementation task is active.

## Next action

Explicitly accept or revise ADR-011 revision 1. Acceptance may partially revise
ADR-005's enum classification, promote the enum portion of D-008, and authorize
a SPEC/implementation plan, but must not itself implement the increment.

## Blockers

No implementation blocker. Promoting `format` as validation or normalized
renderer metadata would conflict with accepted ADR-005, which currently treats
it as an ignored annotation with `IGNORED_SCHEMA_KEYWORD`; that policy must not
change without an explicit ADR revision. SPEC-001 also explicitly excludes all
three keywords until a promotion is approved. Proposed ADR-011 intentionally
does not override either document before acceptance. No unresolved review
finding or implementation blocker remains.

## Open questions

- None within completed PLAN-005.
- The Angular `ValidatorFn` bridge portion of D-024 remains deferred and outside
  completed M5.
- Other pre-runtime decisions remain listed in section 29 of SPEC-001.
- The D-024 Angular validation bridge remains deferred until a concrete consumer
  defines root-versus-field scope, control context, and normalization of codes,
  parameters, and paths. Custom renderer registration is no longer open.
- None within ADR-011 revision 1 after the repeated formal review.
- Whether `const` should eventually mean fixed display, readonly presentation,
  hidden data, or no renderer at all.
- Whether any supported `format` should remain presentation-only or opt into
  assertion semantics through an explicit validator policy.

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
- Current checkout is `develop`; ADR-009 revision 1 and the reviewed Angular
  public-surface correction are committed in the current HEAD, and no push was
  performed in this task.
- Completed PLAN-005 was checked against SPEC-001, ADR-007/008, completed
  PLAN-004, current M4 contracts, and D-008/D-010/D-024/D-025/D-028/D-029/D-030.
- The Signal Forms re-review used current official Angular 22 overview, custom
  controls, `form()`, `FormField`, field-state, and JSON-driven forms
  documentation.
- Native adapter imports are limited to `@angular/forms/signals`; no Reactive
  Forms, Template-driven Forms, compatibility layer, Zone.js coupling, browser
  global, component library, or deferred capability entered M5.
- `develop` was confirmed synchronized with `origin/develop` before drafting
  ADR-009.
- Proposed ADR-009 was checked against SPEC-001, ADR-002, ADR-006, both package
  export maps and indexes, and D-028/D-029.
- Review corrections passed `pnpm format`, `pnpm lint`, `pnpm typecheck`,
  `pnpm test`, and `pnpm test:package`; all 140 tests remain passing.
- Package smoke coverage confirms `SCHEMA_RENDERER_REGISTRATIONS` is absent from
  the Angular root entry point while internal resolver tests remain passing.
- The final formal review passed all seven acceptance areas: entry-point
  boundary, complete inventory, Angular extension surface, unsupported imports,
  orthogonal policy axes, D-028 separation, and acceptance scope.
- The reviewed source entry points and generated declarations agree; ADR-009,
  the ADR index, D-029, STATUS, WORKLOG, and HANDOFF consistently record the
  acceptance and promotion.
- No implementation verification was required for the acceptance-only
  documentation update; no package version, publication setting, or public API
  changed.
- Proposed ADR-010 was checked against ADR-002, ADR-006, ADR-009, D-028, both
  package manifests, Angular partial-compilation settings, and the actual
  cross-package imports.
- Current official SemVer, npm, Angular release/support, Angular compatibility,
  library peer-dependency, and partial-compilation documentation were reviewed.
- ADR-010, the ADR index, D-028, STATUS, WORKLOG, and HANDOFF consistently keep
  the decision Proposed/Research; package manifests remain unchanged.
- The formal review passed independent versioning, initial release rules, core
  peer ownership, bounded Angular support, range-change classification, and
  acceptance scope, subject to the three corrections recorded above.
- SemVer 2.0.0 rules 1, 5, and 8 were rechecked against ADR-009; Angular library
  peer and partial-compilation guidance was rechecked against the proposed
  compatibility matrix.
- Revision 1 explicitly scopes SemVer guarantees to Public + Stable, labels the
  Experimental extension, requires aligned Angular peer tuples, and defines the
  later MINOR as a published release retaining the deprecated contract.
- The repeated formal review passed all seven acceptance areas; ADR-010, the ADR
  index, D-028, STATUS, WORKLOG, and HANDOFF consistently retain
  Proposed/Research states pending acceptance.
- ADR-010, ADR-002, the ADR index, D-028, STATUS, WORKLOG, and HANDOFF now
  consistently record Accepted/Superseded/Promoted states.
- Acceptance changed documentation only; both package manifests remain at
  `0.0.0`, private, and otherwise unchanged.
- D-024 was checked against SPEC-001, ADR-007/009, the implemented Angular
  renderer surface, core `SchemaValidator` normalization, Angular 22
  `ValidatorFn`, and the stable Signal Forms `Validator` contract.
- D-024 and the next-candidate list consistently record the bridge as Deferred
  and D-008 as the next decision; no public contract or implementation changed.
- D-008 was checked against the Draft 2020-12 validation vocabularies, SPEC-001,
  ADR-005/007/009, compiler keyword classification and `FieldDefinition`, the
  unsupported-`enum` fixture, and native renderer testers.
- The review confirmed that `enum` and `const` remain blocking unsupported
  keywords, `format` remains an ignored annotation warning, and no raw schema
  reaches renderers.
- No code test was required for this documentation-only review; formatting,
  local-link validation, and diff integrity were rerun.
- Proposed ADR-011 was checked against Draft 2020-12, SPEC-001, ADR-005/007/009,
  current public contracts, compiler diagnostics, text projection, renderer
  ranks, controlled-state rules, and D-010.
- The ADR index and D-008 register consistently retain Proposed/Candidate
  states; SPEC-001, ADR-005, packages, and implementation remain unchanged.
- The formal review covered all eight ADR-011 acceptance areas and found three
  correctable contract gaps; no contradiction was found in validation
  ownership, controlled state, renderer resolution, API classification, or
  deferred exclusions.
- Official Angular 22 Signal Forms documentation confirms native select support
  while keeping the approved private leaf-buffer boundary; this does not change
  the three review findings.
- ADR-011 revision 1 preserves `choice`/`issue` exclusivity, assigns manual
  choice validation to runtime creation, leaves PLAN-002 operations unchanged,
  and guarantees non-blank source/resolved choice labels.
- The repeated review passed all eight areas: scope, normalization,
  diagnostics, external validation, controlled state, texts/accessibility,
  renderer/API boundaries, and exclusions.
- ADR-011, the ADR index, D-008, STATUS, WORKLOG, and HANDOFF consistently retain
  Proposed/Candidate states pending explicit acceptance; SPEC-001, ADR-005,
  packages, and implementation remain unchanged.

## Relevant documents

- `.ai-docs/specs/001-controlled-form-runtime.md`
- `.ai-docs/adrs/005-politica-dialecto-json-schema.md`
- `.ai-docs/adrs/006-limite-paquete-inicial.md`
- `.ai-docs/adrs/007-resolucion-renderers-testers.md`
- `.ai-docs/adrs/008-instanciacion-renderers-angular.md`
- `.ai-docs/adrs/009-politica-api-publica-estabilidad.md`
- `.ai-docs/adrs/010-versionado-semver-compatibilidad.md`
- `.ai-docs/adrs/011-enum-string-normalizado-select-nativo.md`
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
