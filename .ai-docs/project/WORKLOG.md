# Schema Engine — Work Log

This document is append-only. New entries must be added at the top.

Read only the newest entry by default. Search older entries by date, milestone,
plan, ADR, or deferred-decision identifier when historical evidence is needed;
the full file is not part of routine task startup.

## 2026-07-13 — M6 PLAN-006 step 5 completed

### Completed

- Added standalone Public Experimental
  `SchemaStringEnumRendererComponent` at the fixed module and selector and
  exported it through the existing Angular root entry point.
- Reused M5's native semantic structure, deterministic IDs, resolved texts,
  issue presentation, focus/blur outputs, accessibility attributes, and
  renderer interface.
- Bound the select to one private string-valued Angular 22 Signal Forms leaf;
  the empty internal token represents missing/out-of-enum and positional
  `choice:<index>` tokens represent exact domain choices, including `""`.
- Reconciled the presentation token from controlled snapshots without emitting
  and emitted only the exact domain string selected by a valid user token.
- Added the descriptor-safe `native-string-enum` registration at rank 20 and
  priority 0 while retaining the generic string rank-10 fallback and the single
  immutable ADR-007 registration sequence.
- Added focused tests for specialization, ordinary-string fallback,
  inherited/accessor safety, the disabled sentinel, token order, empty domain
  strings, and controlled reconciliation.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 13 files and 172 tests, comprising 129 core and 43
  Angular tests.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- The select receives only normalized choices and resolved texts, performs no
  business validation or optimistic mutation, and exposes no token helper from
  the Angular root entry point.
- No dependency, lockfile, package version, peer range, publication setting, or
  deferred capability changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 6 integration, accessibility, resolver,
  controlled-state, zoneless, and package-surface coverage.

## 2026-07-13 — M6 PLAN-006 step 4 completed

### Completed

- Extended `FieldTextMember` with `choice` and made regular, choice, and issue
  resolution contexts structurally exclusive; choice contexts carry the exact
  immutable source choice.
- Added always-present frozen `choiceLabels` to Angular text snapshots and
  projected own data-descriptor choices after ordinary field texts and before
  issues.
- Preserved source labels when choice resolution throws, returns a non-string,
  or returns a blank string, emitting one exact frozen runtime warning per
  failing choice in definition order.
- Preserved the outlet's field/form/locale/issues text identity: unrelated
  snapshot changes do not repeat choice work or diagnostics, while locale
  changes reproject labels without replacing the renderer.
- Added focused public-contract, direct projector, fallback, diagnostic,
  descriptor-safety, ordering, immutability, identity, and locale tests.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 12 files and 169 tests, comprising 129 core and 40
  Angular tests.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- Text projection performs no enum-membership validation, no native select or
  renderer registration entered step 4, and no dependency or package surface
  setting changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 5: add the native select component and its provider
  registration.

## 2026-07-13 — M6 PLAN-006 step 3 completed

### Completed

- Replaced the boolean runtime definition check with a two-pass result that
  first validates the complete historical base shape and only then inspects
  string choices.
- Accepted absent or inherited `choices` and valid caller-owned frozen choices
  without cloning or freezing manual definitions.
- Added descriptor-safe rejection for own choices accessors, non-array and empty
  values, sparse/accessor indices, non-object/array entries, missing/inherited/
  accessor members, non-string or duplicate values, and non-string/blank labels.
- Preserved the existing base-definition diagnostic for every unrelated shape
  failure, including when an earlier field exposes malformed choices.
- Ensured malformed choices produce exactly one frozen
  `INVALID_RUNTIME_OPTIONS` diagnostic with
  `expected: 'valid FormDefinition with string choices'` before invoking the
  external validator.
- Confirmed runtime creation and controlled updates accept missing and
  out-of-enum strings when the external validator allows them.
- Added operation tests proving `applyOperation()` and `applyFormOperation()` do
  not execute or inspect accessor-shaped `choices`; no operation production code
  changed.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 11 files and 165 tests, comprising 129 core and 36
  Angular tests.
- Focused coverage includes 15 malformed choices shapes, getter suppression,
  base-error precedence, frozen diagnostics, inherited absence, caller
  ownership, validator suppression, and out-of-enum controlled flow.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- No dependency, lockfile, package version, public contract, operation contract,
  deferred capability, or Angular behavior changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 4: extend neutral text contracts and Angular choice
  projection with focused tests.

## 2026-07-13 — M6 PLAN-006 step 2 completed

### Completed

- Added `enum` to the supported direct string-field keyword set while retaining
  root `enum`/`const` as unsupported, `format` as ignored, and non-string enums
  as incompatible.
- Added internal `absent`, `valid`, and `schema-blocked` enum states so malformed
  schema branches retain their errors without producing derived UI cascades.
- Implemented descriptor-safe enum inspection for outer values and every array
  index, collecting sparse, accessor, non-string, and repeated-value errors in
  deterministic index order without executing getters.
- Implemented descriptor-safe `enumLabels` parsing, exact compatibility and
  unknown-label diagnostics, and suppression below invalid/missing schema
  candidates.
- Constructed ordered immutable choices with opaque custom labels, exact domain
  strings, and visible JSON-literal fallbacks for blank values.
- Added all 13 PLAN-006 compiler conformance fixtures plus focused tests for
  exact comparison, multiple duplicates, sparse/accessor values, ignored
  branches, input preservation, deep immutability, and deterministic behavior.
- Replaced the historical unsupported-`enum` fixture with `const`, which remains
  unsupported after the accepted enum subset was implemented.

### Verification

- Frozen installation, workspace formatting, linting, type checking, builds,
  and package smoke passed without a dependency or lockfile change.
- The full suite passed: 11 files and 159 tests, comprising 123 core and 36
  Angular tests.
- All 43 compiler fixtures passed, including the 13 new enum fixtures.
- Core contains no Angular, RxJS, DOM, or browser import and still has zero
  runtime dependencies; Angular Forms imports remain Signal Forms-only.
- Searches confirmed that operations, runtime, and Angular do not enforce enum
  membership or inspect choices in step 2.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 3: validate manually supplied choices at runtime
  creation and prove the existing operation boundary does not inspect them.

## 2026-07-13 — Persistent context workflow compacted

### Completed

- Reduced `STATUS.md` to a compact canonical checkpoint containing only the
  current phase, objective, active task, latest outcomes, exact next action,
  blockers, open questions, verification, and task-document map.
- Replaced the historical state duplication in `HANDOFF.md` with a stable
  context-recovery procedure suitable for a fresh Codex task.
- Updated `AGENTS.md` to load the compact status completely and select only the
  task-relevant SPEC, ADR, plan, deferred-decision, and worklog sections.
- Preserved every existing append-only worklog entry and documented targeted
  latest-entry and historical-search reads.
- Kept the current M6 state, SPEC-001 Draft v0.1.13, approved PLAN-006 revision
  1, deferred boundaries, and uncommitted step-1 implementation unchanged.
- Left `ROADMAP.md`, SPECs, ADRs, plan contracts, production code, and package
  configuration unchanged by this documentation-memory repair.

### Verification

- Repository formatting passed.
- Every local link in all 31 Markdown files resolved.
- Searches confirmed that current objective, in-progress state, latest work,
  exact next action, and blockers are owned only by `STATUS.md`.
- `STATUS.md`, `HANDOFF.md`, and `AGENTS.md` now total about 1,700 words, down
  from about 5,600, while the complete append-only history remains available.
- `git diff --check` passed.

### Pending

- Implement PLAN-006 step 2 exactly as recorded in `STATUS.md`.

## 2026-07-13 — M6 PLAN-006 step 1 completed

### Completed

- Marked M6 active under approved PLAN-006 revision 1.
- Added public experimental `StringChoiceDefinition` with readonly `value` and
  `label` members.
- Extended `StringFieldDefinition` with optional readonly `choices` and
  `FieldUiSchema` with optional readonly `enumLabels`.
- Re-exported `StringChoiceDefinition` from the existing core root entry point
  without adding an entry point, export-map change, dependency, or Stable API.
- Added a focused contract test that imports all three extended contracts from
  the public core index and fixes their readonly TypeScript shapes.

### Verification

- Workspace formatting, lint, typecheck, and builds passed, including Angular
  partial compilation.
- The full suite passed: 11 files and 141 tests, comprising 105 core and 36
  Angular tests.
- Package smoke passed for both public root entry points.
- Generated declarations expose `StringChoiceDefinition`, `choices`, and
  `enumLabels` from the expected public modules.
- All 31 local Markdown files resolve their local links and `git diff --check`
  passes.
- No compiler parsing, runtime validation, Angular code, or deferred capability
  entered step 1.

### Pending

- Implement PLAN-006 step 2: enum keyword classification, descriptor-safe enum
  and `enumLabels` parsing, immutable choice construction, conformance fixtures,
  and cascade-suppression tests.

## 2026-07-13 — PLAN-006 revision 1 approved

### Completed

- Recorded the user's explicit approval of PLAN-006 revision 1 after its
  repeated eight-area review passed without a remaining finding.
- Promoted the plan's exact normative contracts for string enums,
  `enumLabels`, immutable choices, manual-definition validation, choice text
  projection, diagnostics, and the native Angular select to SPEC-001 Draft
  v0.1.13.
- Synchronized the plan, SPEC index, architecture README, ROADMAP, STATUS,
  WORKLOG, and HANDOFF while keeping M6 planned but inactive.
- Left production code, package versions, publication settings, API stability,
  and D-010/D-024/D-036/D-037 plus all other deferred decisions unchanged.

### Verification

- Confirmed PLAN-006 is Approved revision 1 and SPEC-001 plus its index and
  HANDOFF consistently report Draft v0.1.13.
- Confirmed M6 remains inactive and the next action starts with PLAN-006 step 1.
- Ran formatting, local Markdown-link validation, active-state searches, and
  `git diff --check`; no code test was required for this documentation-only
  approval task.

### Pending

- Begin M6 by marking the implementation task and milestone active, then add
  the neutral string-choice contracts, UI metadata extension, root exports, and
  focused contract tests from PLAN-006 step 1.

## 2026-07-13 — PLAN-006 revision 1 review corrections completed

### Completed

- Added `schema-blocked` enum state and exact UI cascade behavior, preserving
  independent outer `enumLabels` shape errors without derived compatibility or
  member diagnostics below blocked schema branches.
- Completed the choice `TEXT_RESOLUTION_FAILED` contract with frozen data path,
  absent document path, per-choice ordering, projection identity, and one-time
  diagnostic-batch forwarding.
- Fixed the public renderer selector as `schema-string-enum-renderer`, its exact
  native module path, package export smoke assertion, and Angular TestBed/resolver
  creation boundary.
- Added cascade-specific fixture and focused-test requirements and marked
  PLAN-006 revision 1.
- Repeated all eight formal checklist areas with no remaining finding; kept M6
  inactive and PLAN-006 Proposed pending explicit approval.

### Verification

- Rechecked the corrected plan against current compiler cascade behavior,
  ADR-005/007/008/009/011, PLAN-002/005, Angular text projection, public package
  boundaries, and current Angular 22 select/FormField documentation.
- Confirmed consistent Proposed revision 1 state across PLAN-006, README,
  ROADMAP, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, local Markdown-link validation, state searches, and
  `git diff --check`; no code test was required for documentation-only changes.

### Pending

- Explicitly approve or revise PLAN-006 revision 1. Approval may promote its
  exact contracts to SPEC-001 Draft v0.1.13 before implementation.

## 2026-07-13 — PLAN-006 second formal review completed

### Completed

- Re-reviewed proposed PLAN-006 against compiler cascade behavior, ADR-011,
  Angular public metadata, and current official Angular 22 Signal Forms docs.
- Confirmed that `[formField]` supports native selects with dynamic options and
  that the selected Signal Forms boundary remains viable.
- Found three required corrections: model schema-blocked enum states without
  derived UI cascades; complete choice text diagnostic paths/frequency; and fix
  the public component selector, module, and safe package test boundary.
- Recorded the findings in PLAN-006 without applying their substantive fixes.
- Kept PLAN-006 Proposed revision 0, SPEC-001 Draft v0.1.12, and M6 inactive.

### Verification

- Rechecked all eight plan areas and confirmed that scope, controlled state,
  validation ownership, tokens, ranks, deferred exclusions, dependencies, and
  tooling remain otherwise sound.
- Ran formatting, local Markdown-link validation, state consistency searches,
  and `git diff --check`; no code test was required for the documentation-only
  review.

### Pending

- Apply all three corrections, publish PLAN-006 revision 1, and repeat the
  eight checklist areas before considering approval.

## 2026-07-13 — PLAN-006 proposed and formally reviewed

### Completed

- Reviewed accepted ADR-011 against the implemented compiler, runtime creation,
  operations, Angular text projection, renderer resolver, native Signal Forms
  controls, package surfaces, and test infrastructure.
- Drafted proposed PLAN-006 for string enum normalization, UI labels, runtime
  choice validation, localized choice projection, and a ranked native select.
- Closed UI diagnostic cascades, base-versus-choice runtime diagnostics, safe
  descriptor reads, and the internal missing/choice DOM token protocol.
- Defined the implementation sequence, exact fixtures, public Experimental API
  changes, full verification matrix, and M6 lifecycle.
- Repeated all eight formal checklist areas with no remaining finding; kept
  PLAN-006 Proposed and M6 inactive pending explicit approval.

### Verification

- Checked PLAN-006 against SPEC-001 Draft v0.1.12, ADR-005/007/008/009/011,
  completed PLAN-002/005, current source and tests, and D-010/D-024/D-036/D-037.
- Confirmed that the plan adds no dependency, package, entry point, version,
  publication setting, deferred capability, or implementation change.
- Ran formatting, local Markdown-link validation, active-state searches, and
  `git diff --check`; no code test was required for the documentation-only plan.

### Pending

- Explicitly approve or revise PLAN-006. Only approval may promote its contracts
  to SPEC-001 Draft v0.1.13 and authorize implementation preparation.

## 2026-07-13 — ADR-011 accepted and D-008 promoted

### Completed

- Committed the ADR-011 proposal, formal review, corrections, and repeated
  review on `develop` as `c8728bb` with repository identity
  `Rabassoft <ricard@rabassoft.com>`; no push was performed.
- Accepted ADR-011 revision 1 after all eight review areas passed without
  remaining findings.
- Amended ADR-005 only for the accepted string-enum subset and promoted D-008.
- Split the unpromoted `const` and `format` concerns into deferred D-036 and
  D-037 without changing their behavior.
- Updated SPEC-001 to Draft v0.1.12 as planning state, synchronized its index,
  the ADR index, STATUS, and HANDOFF, and left all implementation unchanged.

### Verification

- Confirmed that ADR-011, ADR-005, D-008, D-036, D-037, SPEC-001, both indexes,
  STATUS, WORKLOG, and HANDOFF report one consistent accepted/planning state.
- Confirmed that SPEC-001 Draft v0.1.12 records ADR-011 as accepted but not yet
  implemented, while `const`, `format`, and other exclusions remain deferred.
- Ran formatting, local Markdown-link validation, and `git diff --check`; no
  code test was required because the acceptance changed documentation only.

### Pending

- Draft and formally review PLAN-006 for ADR-011. Do not implement it until the
  plan is explicitly approved.

## 2026-07-13 — ADR-011 review corrections completed

### Completed

- Preserved mutually exclusive `choice` and `issue` branches in the proposed
  `TextResolutionContext` contract.
- Assigned descriptor-safe validation of compiled enums and manually supplied
  choices to compiler/runtime creation while explicitly preserving PLAN-002's
  minimum `applyFormOperation()` checks.
- Required non-blank choice labels, defined a visible two-quote fallback for the
  empty-string value plus JSON-literal fallbacks for other blank values, and
  isolated blank resolver results with diagnostics and a safe source fallback.
- Repeated all eight ADR-011 acceptance checks with no remaining findings.
- Kept ADR-011 Proposed revision 1 and D-008 Candidate; SPEC-001, ADR-005,
  packages, and implementation remain unchanged.

### Verification

- Rechecked the corrected contracts against current compiler/runtime descriptor
  handling, PLAN-002/003, text diagnostics, renderer ranks, package entry
  points, Draft 2020-12, HTML select behavior, and Angular 22 Signal Forms.
- Confirmed consistent Proposed/Candidate state across ADR-011, the ADR index,
  D-008, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only correction.

### Pending

- Explicitly accept or revise ADR-011 revision 1. Acceptance may update
  ADR-005, D-008, and SPEC planning state but must not implement the increment.

## 2026-07-13 — ADR-011 formal review completed with corrections

### Completed

- Reviewed all eight ADR-011 acceptance areas against Draft 2020-12,
  SPEC-001, ADR-005/007/009, current compiler/runtime/operation contracts,
  Angular text projection, native renderer resolution, Signal Forms select
  support, and D-010.
- Confirmed string-only scope, external validation ownership, controlled-state
  behavior, deterministic renderer specialization, public API classification,
  and deferred exclusions.
- Identified three corrections required before acceptance: preserve mutually
  exclusive text-context members, validate malformed manually supplied choices
  at an explicit safe boundary, and guarantee non-empty accessible option
  labels including the empty-string domain value.
- Kept ADR-011 Proposed and D-008 Candidate; SPEC-001, ADR-005 and all code
  remain unchanged.

### Verification

- Rechecked native `<select>` support against current official Angular 22
  Signal Forms documentation and enum/format semantics against official JSON
  Schema Draft 2020-12 sources.
- Inspected current public type exports, runtime and operation definition-shape
  validation, text diagnostics, renderer ranks, and package entry points.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only review.

### Pending

- Apply the three ADR-011 corrections and repeat all eight acceptance checks
  before considering acceptance, D-008 promotion, or SPEC changes.

## 2026-07-13 — ADR-011 string-enum decision proposed

### Completed

- Recorded explicit approval to split D-008 and drafted ADR-011 as Proposed.
- Limited the proposed first increment to non-empty unique string enums with
  immutable normalized choices and optional UI Schema labels.
- Defined choice text resolution, external validation ownership, controlled
  missing and invalid-value behavior, deterministic renderer ranks, internal
  DOM tokens, and the public native select component boundary.
- Kept `const`, `format`, non-string enums, radios, clearing to missing,
  SPEC-001, ADR-005, packages, and implementation unchanged.
- Added ADR-011 to the global index and linked the active proposal from D-008
  while retaining Proposed/Candidate states.

### Verification

- Checked the proposal against Draft 2020-12, SPEC-001, ADR-005/007/009,
  compiler keyword and diagnostic behavior, public field/text contracts,
  Angular text projection and native renderer ranks, and D-010.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only proposal.

### Pending

- Formally review ADR-011's eight acceptance areas before deciding whether to
  accept it, partially revise ADR-005, promote D-008, or change SPEC-001.

## 2026-07-13 — D-008 architectural boundary reviewed

### Completed

- Reviewed `enum`, `const`, and `format` against JSON Schema Draft 2020-12,
  SPEC-001, ADR-005/007/009, and the implemented compiler-to-renderer boundary.
- Confirmed that `enum` and `const` are data assertions, `format` is an
  annotation by default, and visual renderer selection is an adapter concern
  over normalized `FieldDefinition`.
- Proposed promoting only a minimal `enum` increment while retaining `const`
  and `format` as deferred work pending separate use cases and contracts.
- Recorded the accepted ADR-005 conflict that prevents treating `format` as
  validation or normalized renderer metadata without an explicit revision.

### Verification

- Inspected compiler keyword classification, normalized field contracts, the
  unsupported-`enum` conformance fixture, and native renderer testers.
- Confirmed that the review changed documentation only and activated no
  deferred capability or public contract.
- Ran formatting, Markdown-link validation, and `git diff --check`.

### Pending

- Approve or revise the D-008 split. If approved, draft ADR-011 for the minimal
  `enum` contract before changing SPEC-001 or implementation.

## 2026-07-13 — API and versioning decisions committed

### Completed

- Committed the reviewed documentation block containing accepted ADR-009/010,
  superseded ADR-002, promoted D-028/D-029, and the D-024 boundary review on
  `develop` using `Rabassoft <ricard@rabassoft.com>`.

### Verification

- Confirmed the complete intended documentation diff, formatting, local links,
  diff integrity, branch, and repository identity before commit.
- Package manifests and implementation are unchanged; no push was performed.

### Pending

- Review D-008 as the smallest next product candidate.

## 2026-07-13 — D-024 boundary reviewed

### Completed

- Confirmed that custom renderer registration is already resolved by accepted
  ADR-007/009 and implemented through the public Angular renderer contracts and
  `provideSchemaRenderer()`.
- Compared neutral whole-model `SchemaValidator` with Angular `ValidatorFn` and
  the stable Angular 22 Signal Forms `Validator` contract.
- Deferred a generic validation bridge because the Angular contracts require
  framework control or field context and return error shapes without the core's
  canonical paths and normalized parameters.
- Reordered the nearest candidates to D-008, D-010, and D-005, with D-008 as the
  smallest recommended next decision.

### Verification

- Checked D-024 against SPEC-001, ADR-007/009, current Angular source exports,
  core validation contracts and runtime normalization, and official Angular 22
  validation APIs.
- Ran formatting, Markdown-link validation, and `git diff --check`; no public
  contract, package manifest, or implementation changed.

### Pending

- Review D-008 and separate `enum`, `const`, and `format` data semantics from
  validation ownership and renderer-selection consequences before promotion.

## 2026-07-13 — ADR-010 accepted and D-028 promoted

### Completed

- Recorded explicit acceptance of ADR-010 revision 1 after its repeated
  seven-area review passed without findings.
- Marked pre-SPEC ADR-002 Superseded while preserving its historical decision
  text, and promoted D-028 to ADR-010.
- Synchronized the ADR index, deferred-decisions register, project status, and
  handoff.
- Kept both packages private at `0.0.0`; acceptance did not change dependencies,
  compatibility metadata, publication settings, or implementation.

### Verification

- Confirmed consistent Accepted/Superseded/Promoted states across ADR-010,
  ADR-002, the ADR index, D-028, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; package
  manifests remain unchanged.

### Pending

- Review D-024 to separate the already implemented custom-renderer registration
  boundary from the still-deferred Angular `ValidatorFn` bridge.

## 2026-07-13 — ADR-010 review corrections implemented

### Completed

- Defined the version policy honestly as SemVer for the Public + Stable
  compatibility surface plus an explicit Experimental extension.
- Required `@angular/core` and `@angular/forms` to resolve to the same exact
  version and made aligned tuples part of matrix and consumer verification.
- Replaced the ambiguous complete-MINOR wording with one later published MINOR
  that retains the deprecated contract, plus the independent 180-day minimum.
- Repeated all seven acceptance checks without remaining findings.
- Kept ADR-010 Proposed, ADR-002 pending review, and D-028 Research until an
  explicit acceptance decision.

### Verification

- Rechecked the corrected wording against ADR-009, SemVer 2.0.0, official
  Angular peer and partial-compilation guidance, and current package manifests.
- Ran formatting, Markdown-link validation, and `git diff --check`; no package
  manifest or implementation changed.

### Pending

- Explicitly accept or revise ADR-010. Acceptance may supersede ADR-002 and
  promote D-028 but must not change versions or publication settings.

## 2026-07-13 — ADR-010 formal review completed with corrections

### Completed

- Reviewed all seven ADR-010 acceptance areas against ADR-009, SemVer 2.0.0,
  Angular library peers, partial compilation, and the current package shape.
- Confirmed independent package versioning, `0.1.0` initial releases, bounded
  peer ranges, release classification, and non-publication scope.
- Identified three corrections required before acceptance: explicitly describe
  the Experimental extension to SemVer after `1.0.0`, require Angular core/forms
  to resolve to the same version, and define the later MINOR requirement as one
  published release that retains the deprecated contract.
- Kept ADR-010 Proposed, ADR-002 pending review, and D-028 Research.

### Verification

- Rechecked SemVer's declared-public-API and incompatible-change requirements
  and Angular's peer-dependency and partial-compilation guidance.
- Ran formatting, Markdown-link validation, and `git diff --check`; package
  manifests and implementation remain unchanged.

### Pending

- Approve and implement the three proposed corrections, then repeat the formal
  review before accepting ADR-010.

## 2026-07-13 — ADR-010 package-versioning policy proposed

### Completed

- Reviewed D-028 and the conflicting pre-SPEC ADR-002 against accepted
  ADR-006/009, current package manifests, cross-package imports, and Angular
  partial compilation.
- Drafted proposed ADR-010 with independent product SemVer for core and adapter,
  explicit core and Angular peer ranges, a release compatibility matrix, and
  coordinated-change rules.
- Proposed initial releases at `0.1.0`, initial Angular compatibility
  `>=22.0.6 <23.0.0`, and Stable deprecation for 180 days plus one subsequent
  MINOR before removal in a MAJOR.
- Kept ADR-002 pending review and D-028 Research until explicit acceptance; no
  package manifest or implementation changed.

### Verification

- Checked the proposal against official SemVer, npm, Angular versioning/support,
  Angular compatibility, library peer-dependency, and partial-compilation
  documentation current on 13 July 2026.
- Confirmed consistent Proposed/Research states across ADR-010, the ADR index,
  D-028, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`.

### Pending

- Formally review ADR-010's seven acceptance areas before accepting it,
  superseding ADR-002, or promoting D-028.

## 2026-07-13 — ADR-009 accepted and D-029 promoted

### Completed

- Recorded the explicit acceptance of ADR-009 after its seven-area formal
  review completed without remaining findings.
- Promoted D-029 and synchronized the ADR index, project status, and handoff.
- Kept all intended root exports Public + Experimental + Active; acceptance did
  not authorize publication, version changes, stability promotion, or further
  implementation.

### Verification

- Confirmed consistent Accepted/Promoted states across ADR-009, the ADR index,
  the deferred-decisions register, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code or
  package metadata changed.

### Pending

- Review D-028 together with pre-SPEC ADR-002 before deciding package SemVer,
  Angular compatibility, coordination, or the exact deprecation window.

## 2026-07-13 — ADR-009 final formal review completed

### Completed

- Reviewed ADR-009 revision 1 against all seven acceptance areas: package
  entry-point boundary, API inventory, Angular extension surface, unsupported
  imports, orthogonal policy axes, D-028 separation, and acceptance scope.
- Found no remaining issue after the revision 1 corrections.
- Kept ADR-009 Proposed and D-029 Candidate pending the user's explicit
  acceptance decision.

### Verification

- Confirmed that the committed source entry points and built declarations agree
  and that `SCHEMA_RENDERER_REGISTRATIONS` is absent from the public Angular
  entry point.
- Confirmed that ADR-009, the ADR index, and the deferred-decisions register
  retain consistent Proposed/Candidate states.
- Relied on the immediately preceding full verification: formatting, linting,
  type checking, all 140 tests, and both package smoke tests passed.

### Pending

- Explicitly accept ADR-009 and promote D-029, or request another revision. No
  push was performed.

## 2026-07-13 — ADR-009 revision 1 committed

### Completed

- Committed revised proposed ADR-009 and the reviewed Angular public-surface correction on `develop` using `Rabassoft <ricard@rabassoft.com>`.
- Kept ADR-009 Proposed and D-029 Candidate pending the requested final formal review.

### Verification

- Confirmed the complete intended diff, repository identity, branch, formatting, linting, type checking, all 140 tests, package smoke tests, documentation links, and diff integrity before commit.
- The commit leaves `develop` one commit ahead of `origin/develop`; no push was performed.

### Pending

- Perform the final formal review of ADR-009's seven acceptance areas without accepting it automatically.

## 2026-07-13 — ADR-009 formal-review corrections implemented

### Completed

- Reviewed all seven ADR-009 acceptance areas and found three required corrections before acceptance.
- Separated Public/Internal visibility, Experimental/Stable stability, and Active/Deprecated lifecycle; a deprecated Stable API now retains Stable guarantees until removal.
- Made stability promotion explicitly manual and independent of package version, `private`, or publication state.
- Removed `SCHEMA_RENDERER_REGISTRATIONS` from the Angular root entry point while preserving the token for internal provider and resolver implementation.
- Added package smoke coverage preventing accidental public re-export of the raw token.
- Kept ADR-009 Proposed and D-029 Candidate pending one final explicit acceptance review.

### Verification

- `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm test:package` passed.
- All 140 tests pass: 104 core and 36 Angular; package smoke coverage confirms the intended root surface.

### Pending

- Perform the final review of revised ADR-009 and either accept it and promote D-029 or report a remaining concern.

## 2026-07-13 — ADR-009 public API policy proposed

### Completed

- Confirmed that the reviewed M5 commit on `develop` is synchronized with `origin/develop`.
- Audited the root export maps and indexes of `@rabassoft/schema-engine` and `@rabassoft/schema-engine-angular`.
- Drafted proposed ADR-009 to make package entry points the only supported import boundary and classify all current root exports as Experimental.
- Defined public, deprecated, and internal boundaries; change governance; deprecation ordering; consumer-facing enforcement; exclusions; and formal acceptance criteria.
- Kept D-029 Candidate until explicit acceptance and preserved D-028 as the owner of SemVer, package coordination, Angular compatibility, and the exact deprecation window.

### Verification

- Checked the proposal against SPEC-001, ADR-002, ADR-006, the current package manifests and indexes, and D-028/D-029.
- Formatting, diff validation, and local Markdown-link validation passed.

### Pending

- Formally review ADR-009's seven acceptance areas before accepting it or changing public contracts.

## 2026-07-13 — M5 diff reviewed and committed

### Completed

- Reviewed every tracked and untracked M5 change against SPEC-001 v0.1.11, PLAN-005, ADR-007, ADR-008, and the deferred-decisions register.
- Found and fixed a localized negative-number round-trip failure caused by invisible directional literals emitted by `Intl.NumberFormat` for RTL locales.
- Added coverage proving that renderer editing text produced for `ar-EG` parses back to the same confirmed negative value.
- Created the authorized M5 commit on `develop` using `Rabassoft <ricard@rabassoft.com>`.

### Verification

- Formatting, linting, type checking, all 140 tests, builds, package smoke tests, diff checks, documentation links, dependency boundaries, and repository-state checks passed after the review correction.
- The final worktree is clean and the commit contains the complete reviewed M5 increment.

### Pending

- Select and formally scope the next increment. No push was performed.

## 2026-07-13 — M5 native HTML renderers completed

### Completed

- Added Angular 22 native string, number/integer, and boolean renderers backed by private Signal Forms leaf buffers while retaining application-controlled state.
- Added deterministic native registrations with custom override composition, `LOCALE_ID` fallback, neutral replaceable text resolution, accessible semantic markup, and isolated adapter diagnostics.
- Added localized numeric parsing and formatting with incomplete edit preservation, strict integer handling, empty-value removal, locale fallback, and separate grouped display and ungrouped edit forms.
- Completed PLAN-005 and milestone M5 without promoting Signal Forms validation, persistence, advanced schema capabilities, or other deferred work.

### Verification

- Frozen installation, formatting, linting, type checking, builds, package smoke tests, diff checks, documentation-link checks, dependency-boundary checks, and forms-import checks passed.
- All 140 tests pass: 104 core tests and 36 Angular tests across 10 test files.

### Pending

- Review the completed M5 diff and commit it only when explicitly requested.

## 2026-07-13 — PLAN-005 re-reviewed for Angular 22 Signal Forms

### Completed

- Verified from current official Angular 22 documentation that Signal Forms, `form()`, `FormField`, `FieldTree`, and custom-control contracts are stable.
- Rejected using Signal Forms over the application business model because its writable model binding would bypass strict core operations and controlled confirmation.
- Revised PLAN-005 so each native renderer uses one private Signal Form leaf as an ephemeral control buffer, reconciled from confirmed runtime snapshots and reset on blur.
- Added `@angular/forms/signals` dependency boundaries, focus/reset behavior, local-state ownership, D-002/D-024 exclusions, integration tests, acceptance checks, and the single-entry-point peer-dependency trade-off.
- Completed the seven-area formal re-review and left the revised plan Proposed pending explicit approval.

### Verification

- Checked the revised design against SPEC-001, ADR-007/008, PLAN-004, current M4 contracts, and official Angular 22 Signal Forms overview, models, custom controls, `form()`, `FormField`, field state, and JSON-driven forms guidance.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Explicitly approve or revise PLAN-005. After approval, promote its contracts to SPEC-001 v0.1.11 before M5 implementation.

## 2026-07-13 — PLAN-005 proposed

### Completed

- Confirmed that M5 will close the SPEC-001 `LOCALE_ID` fallback and replaceable `TextResolver` requirements instead of deferring them.
- Drafted PLAN-005 for accessible native string, number/integer, and boolean renderers in the private Angular package.
- Defined the pre-release locale and renderer contract revisions, neutral text contracts, native provider composition, deterministic IDs, semantic markup, controlled numeric editing grammar, Intl fallbacks, diagnostics, fixtures, and acceptance boundary.
- Kept Angular Forms, browser-owned validation, clear affordances, validator bridges, theming, enum/format, advanced localization, package publication, and other deferred work outside M5.

### Verification

- Checked the proposal against SPEC-001 v0.1.10, ADR-007, ADR-008, completed PLAN-004, current M4 source contracts, and the applicable deferred entries.
- Confirmed the proposal does not authorize implementation before formal review and SPEC promotion.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Formally review PLAN-005 and approve or revise all six checklist areas before implementing M5.

## 2026-07-13 — M4 committed and M5 planning boundary reviewed

### Completed

- Committed the completed M4 Angular adapter increment on `develop` as `f7199d6` using `Rabassoft <ricard@rabassoft.com>`.
- Began PLAN-005 preparation by checking SPEC-001, ADR-006 through ADR-008, PLAN-004, the current Angular contracts, and the deferred-decisions register.
- Identified that SPEC-001 still requires Angular `LOCALE_ID` fallback and replaceable text resolution, while completed PLAN-004 requires explicit locale input and provides no `TextResolver` projection.

### Verification

- Confirmed commit author, email, subject, branch, and a clean worktree immediately after the M4 commit.
- Confirmed `develop` is five commits ahead of `origin/develop`; no push was performed.

### Pending

- Decide whether PLAN-005 absorbs `LOCALE_ID` fallback and `TextResolver` projection or SPEC-001 defers them before drafting a decision-complete M5 plan.

## 2026-07-13 — M4 Angular adapter completed

### Completed

- Added the private `@rabassoft/schema-engine-angular` package on Angular 22.0.6 with partial `ngc` compilation and no Angular dependency in core.
- Implemented the standalone controlled-form and field-outlet directives, Signals snapshot projection, controlled intent forwarding, transactional runtime replacement, and deterministic renderer resolution.
- Implemented ADR-008 renderer creation through `ViewContainerRef.createComponent()` with an explicit environment injector and creation-time signal bindings.
- Added lifecycle-safe renderer replacement, including preservation of the active renderer when a proposed parent runtime replacement is rejected.
- Completed PLAN-004 and milestone M4 without native HTML controls, Angular Forms, RxJS bridging, Zone.js coupling, persistence, or deferred capabilities.

### Verification

- `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:package` passed.
- All 119 tests pass: 104 core tests and 15 Angular resolver/directive tests, including explicit zoneless coverage.
- Angular package smoke coverage verifies root exports and resolver construction; `git diff --check` and local Markdown-link validation passed.

### Pending

- Draft and formally review PLAN-005 for M5 native HTML renderers before implementation.

## 2026-07-13 — ADR-008 committed and PLAN-004 approved

### Completed

- Committed ADR-008 and the D-027 resolution as `bae261f`.
- Drafted PLAN-004 for a private Angular 22 headless adapter package.
- Formally reviewed and approved Signals projection, transactional runtime recreation, provider-based renderer registrations, deterministic resolution, the common renderer contract, and the ViewContainerRef outlet lifecycle.
- Kept native HTML renderers in M5 and excluded RxJS, Zone.js coupling, Angular Forms, persistence, lazy rendering, and deferred capabilities.

### Verification

- Checked PLAN-004 against SPEC-001 v0.1.9, ADR-006/007/008, completed PLAN-003, D-013, D-024, D-026, D-028, and D-029.
- Verified Angular 22 is actively supported and compatible with the workspace TypeScript 6.0 baseline.
- Ran formatting, diff, and local Markdown-link validation.

### Pending

- Promote PLAN-004's approved public contracts and diagnostics to SPEC-001.
- Implement and verify M4 only after that promotion.

## 2026-07-13 — ADR-008 committed

### Completed

- Committed ADR-008, D-027 promotion, SPEC-001 v0.1.9, and persistent-state updates on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Formatting, diff, and local Markdown-link validation passed before commit.

### Pending

- Prepare and formally review PLAN-004 before implementing M4.

## 2026-07-13 — Reviewed M3 committed and D-027 resolved

### Completed

- Committed reviewed M3, its accessor-safety correction, and ADR-007 as `805308d`.
- Reviewed current official Angular APIs for dynamic inline components.
- Accepted ADR-008 selecting `ViewContainerRef.createComponent()` with creation-time input/output bindings and an explicit `EnvironmentInjector`.
- Promoted D-027 without implementing Angular or renderers.
- Updated SPEC-001 to Draft v0.1.9 and cleared the immediate architectural prerequisites for PLAN-004.

### Verification

- Confirmed the M3 commit attribution is `Rabassoft <ricard@rabassoft.com>`.
- Checked ADR-008 against ADR-007, Angular's programmatic rendering guide, and the current Angular API references.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Draft and formally approve PLAN-004 before implementing M4.

## 2026-07-13 — Reviewed M3 and ADR-007 committed

### Completed

- Committed the reviewed M3 implementation, accessor-safety correction, fixtures, tests, SPEC updates, and ADR-007 resolution on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Confirmed the complete 104-test acceptance suite passed before commit.
- Checked staged diff integrity and commit attribution.

### Pending

- Resolve D-027 through a dedicated architectural decision.
- Prepare PLAN-004 only after Angular instantiation is closed.

## 2026-07-13 — M3 reviewed and D-023 resolved

### Completed

- Reviewed the full uncommitted M3 diff against PLAN-003 and SPEC-001.
- Fixed a runtime robustness defect that could execute accessors in validator results, definitions, paths, scopes, or diagnostic parameters.
- Added regression coverage proving malformed accessor-shaped contracts return diagnostics without invoking getters.
- Accepted ADR-007 for deterministic scored renderer testers owned by framework adapters.
- Marked ADR-004 superseded and promoted D-023 without implementing renderers or Angular.
- Updated SPEC-001 to Draft v0.1.8 and reconciled its immediate-decision register.

### Verification

- Formatting, lint, type checking, tests, build, package smoke, diff, and local Markdown links passed.
- Confirmed renderer selection consumes normalized `FieldDefinition` and adds no framework dependency to the core.

### Pending

- Resolve D-027 for Angular dynamic renderer instantiation.
- Prepare and approve PLAN-004 before implementing M4.

## 2026-07-13 — M3 controlled runtime completed

### Completed

- Implemented discriminated controlled-runtime creation with source-schema validation access.
- Added immutable snapshots, dirty derivation, synchronous normalized validation, atomic external updates, and structural sharing.
- Added non-optimistic operation requests with sequential IDs and separate synchronous subscriptions.
- Added focus, blur, touched, validation visibility, scopes, listener isolation, idempotent unsubscribe, and disposal.
- Added 10 runtime conformance fixtures, focused unit tests, and package smoke coverage.
- Completed PLAN-003 and milestone M3 without adding Angular, renderers, persistence, async validation, or deferred capabilities.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed with 103 tests in 6 files.
- `pnpm build` and `pnpm test:package` passed.
- `git diff --check` and local Markdown-link validation passed.

### Pending

- Review and commit the completed M3 diff only when explicitly requested.
- Resolve D-023 and prepare the M4 Angular adapter plan before implementation.

## 2026-07-13 — PLAN-003 reviewed and approved

### Completed

- Formally reviewed PLAN-003 and closed exact diagnostic parameters, reasons, ordering, and fallback-message policy.
- Approved source-schema access, discriminated creation/subscription results, and listener-exception isolation.
- Promoted the approved runtime option contract to SPEC-001 v0.1.7.

### Verification

- Checked the plan against SPEC-001, completed M1/M2 contracts, ADR-005/006, and deferred scope.

### Pending

- Implement and verify M3 without expanding into Angular, renderers, async validation, or optimistic state.

## 2026-07-13 — Proposed PLAN-003 committed

### Completed

- Committed the proposed PLAN-003 and its persistent-state documentation on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Formatting, diff, and local Markdown-link validation passed before commit.

### Pending

- Formally review and approve PLAN-003 before production code.
- Implement M3 only after closing its public contracts and diagnostics.

## 2026-07-13 — M2 reviewed and PLAN-003 proposed

### Completed

- Reviewed committed M2 commit `3347858` across contracts, implementation, diagnostics, fixtures, tests, and documentation.
- Found no functional defect, regression, or documentation conflict in M2.
- Drafted PLAN-003 for the complete framework-neutral controlled runtime milestone.
- Proposed explicit source-schema access for synchronous validation and isolated listener-exception reporting.
- Kept Angular, renderers, persistence, async validation, optimistic projection, nested objects, arrays, and deferred infrastructure out of scope.

### Verification

- `git show --check 3347858` passed and commit attribution is `Rabassoft <ricard@rabassoft.com>`.
- Reconciled PLAN-003 with SPEC-001 v0.1.6, completed PLAN-001/002, ADR-005/006, and the deferred-decisions register.
- Ran formatting, diff, and local Markdown-link validation for the plan documentation.

### Pending

- Formally review and approve PLAN-003.
- Promote approved public-contract changes to SPEC-001 before implementing M3.

## 2026-07-13 — M2 changes committed

### Completed

- Committed the completed M2 implementation, fixtures, tests, and documentation on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Confirmed the complete M2 acceptance suite passed before committing.
- Checked the staged diff and commit attribution.

### Pending

- Review the committed M2 diff.
- Prepare PLAN-003 without implementing M3.

## 2026-07-13 — M2 root immutable operations completed

### Completed

- Promoted PLAN-002's runtime diagnostic contract to SPEC-001 v0.1.6.
- Added and exported operation, expectation, metadata, and result contracts.
- Implemented pure root-only `applyOperation()` and `applyFormOperation()` utilities.
- Added strict shape, path, form membership, type compatibility, expectation, accessor-safety, and immutable cloning behavior.
- Added 27 operation conformance fixtures, focused unit tests, and built-package smoke coverage.
- Completed PLAN-002 and milestone M2 without introducing runtime state or deferred capabilities.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed with 82 tests in 4 files.
- `pnpm build` and `pnpm test:package` passed.
- `git diff --check` and local Markdown-link validation passed.

### Pending

- Review and commit the completed M2 diff only when explicitly requested.
- Propose and approve PLAN-003 before implementing the controlled runtime.

## 2026-07-13 — PLAN-002 formally reviewed and approved

### Completed

- Reviewed PLAN-002 against SPEC-001 v0.1.5, ADR-005, ADR-006, the deferred-decisions register, and the implemented M1 contracts.
- Defined safe handling for target accessors and required-member accessors without invoking caller code.
- Closed malformed-path validation, minimum FormDefinition shape, reason values, and diagnostic cutoff/order behavior.
- Added the missing accessor diagnostic and test coverage requirement.
- Marked PLAN-002 Approved without implementing M2 production code.

### Verification

- Checked public contracts, root-only scope, structural sharing, diagnostic safety, fixture coverage, and acceptance commands.
- Confirmed nested objects, arrays, runtime state, business validation, and other deferred capabilities remain excluded.
- Ran formatting, diff, and local Markdown-link validation for the review changes.

### Pending

- Promote PLAN-002's approved diagnostic contract to SPEC-001.
- Implement and verify the approved M2 increment.

## 2026-07-13 — M1 and PLAN-002 changes committed

### Completed

- Committed the completed M1 compiler increment, architecture documentation updates, and proposed PLAN-002 on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Re-ran the frozen install, formatting, linting, type checking, tests, build, and built-package smoke test before committing.
- Checked the final diff, local Markdown links, and common credential patterns.

### Pending

- Review and explicitly approve PLAN-002 before implementing M2.
- Push the local `develop` commits only when explicitly requested.

## 2026-07-13 — PLAN-002 proposed

### Completed

- Confirmed that both M2 operation utilities are limited to one string root-property path segment.
- Defined the operation result contract, including exact input-reference preservation on failures and successful no-ops.
- Updated SPEC-001 to Draft v0.1.5 to make those M2 boundaries normative.
- Drafted decision-complete PLAN-002 with contracts, validation order, immutable behavior, diagnostics, fixtures, and acceptance criteria.
- Kept nested objects, arrays, runtime state, validation, adapters, and other deferred capabilities out of scope.

### Verification

- Checked PLAN-002 against SPEC-001 v0.1.5, completed PLAN-001, and the deferred-decisions register.
- Confirmed that no M2 production code was added.
- Ran formatting, diff, and local Markdown-link checks for the documentation changes.

### Pending

- Review and explicitly approve PLAN-002.
- Do not implement M2 before that approval.

## 2026-07-13 — M1 minimal compiler completed

### Completed

- Promoted PLAN-001's diagnostic contract to SPEC-001 v0.1.4.
- Created the native pnpm workspace and `packages/core` package named `@rabassoft/schema-engine`.
- Added TypeScript, ESLint, Prettier, Vitest, ESM build output, declarations, and package smoke testing.
- Implemented `compileFormDefinition()` with deterministic diagnostics, immutable outputs, strict root/field parsing, UI text precedence, ordering, and numeric visual options.
- Added 30 complete conformance fixtures and 10 focused unit tests.
- Completed PLAN-001 and milestone M1.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed with 40 tests in 2 files.
- `pnpm build` passed.
- `pnpm test:package` passed.
- Verified 30 expected conformance results and zero runtime dependencies.
- `git diff --check` and local Markdown link validation passed.

### Pending

- Review and commit the completed M1 diff only when explicitly requested.
- Propose and approve PLAN-002 before implementing immutable operations.

## 2026-07-13 — PLAN-001 approved

### Completed

- Approved PLAN-001 after its formal review.
- Authorized the compiler-only M1 implementation.
- Kept runtime, validators, Angular, renderers, persistence, and deferred capabilities out of scope.

### Verification

- Confirmed PLAN-001 has no remaining implementation decisions.
- Confirmed accepted ADR-005 and ADR-006 are its normative prerequisites.

### Pending

- Promote the approved diagnostic contract to SPEC-001.
- Implement and verify the compiler-only increment.

## 2026-07-13 — PLAN-001 formal review completed

### Completed

- Reviewed PLAN-001 against SPEC-001, ADR-005, ADR-006, and the first-prototype restrictions.
- Added the missing `test:package` root-script requirement.
- Made duplicate/unknown UI order behavior deterministic.
- Prevented compatibility diagnostics below invalid field-schema branches.
- Replaced unsafe diagnostic value capture with scalar-or-type descriptors.
- Expanded conformance fixtures for UI keys, required, patterns, and invalid UI values.
- Kept PLAN-001 in Proposed status pending explicit approval.

### Verification

- Checked diagnostic codes, severities, parameter shapes, and document paths.
- Checked fixture coverage against the compiler pipeline and accepted ADR policies.
- Confirmed no workspace or compiler code was created.

### Pending

- Review and explicitly approve PLAN-001.
- Commit and push the review documentation only when explicitly requested.

## 2026-07-13 — Repository setup state recorded

### Completed

- Recorded Git initialization, ignore policy, GitHub connection, commit attribution, and remote branch setup in persistent project state.
- Created a documentation-only commit on `develop`.
- Did not push the new documentation commit.

### Verification

- Confirmed only `STATUS.md` and `WORKLOG.md` changed after the initial baseline.
- Confirmed the documentation diff passes `git diff --check`.
- Confirmed `develop` is ahead of `origin/develop` after the commit.

### Pending

- Review and approve PLAN-001 before compiler implementation.
- Push the documentation commit only when explicitly requested.

## 2026-07-13 — Remote branch strategy completed

### Completed

- Pushed local `main` to `origin/main` at `a324d83`.
- Configured local `main` to track `origin/main`.
- Set `main` as the GitHub default stable/deployment branch.
- Kept `develop` as the checked-out integration branch tracking `origin/develop`.

### Verification

- Confirmed remote `main` and `develop` both point to `a324d83`.
- Confirmed both local branches track their matching upstreams.
- Confirmed GitHub reports `main` as the default branch.

### Pending

- Commit the persistent-state updates currently on `develop`.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Remote push state verified

### Completed

- Verified `origin/develop` exists at `a324d83` and local `develop` tracks it.
- Verified local `main` also points to `a324d83`.
- Identified that `origin/main` has not been pushed.
- Identified that GitHub selected `develop` as the default branch.

### Verification

- Compared local refs with `git ls-remote`.
- Queried the GitHub repository default branch.

### Pending

- Push `main` and change the GitHub default branch to `main` to match the documented workflow.
- Commit the persistent-state update after the remote branch setup is complete.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial commit attribution corrected

### Completed

- Configured the repository-local Git identity as `Rabassoft <ricard@rabassoft.com>`.
- Amended the initial commit to replace its author and committer identity.
- Realigned local `main` and `develop` to the amended commit.
- Did not push either branch.

### Verification

- Confirmed author and committer name and email on the amended commit.
- Confirmed `main` and `develop` reference the same commit.
- Confirmed the working tree is clean on `develop`.

### Pending

- Push `main` and `develop` only when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial baseline and develop branch created

### Completed

- Reviewed the initial documentation snapshot and common credential patterns.
- Created the initial commit on `main`.
- Created local branch `develop` from the initial baseline and switched to it.
- Documented `main` as stable/deployment-ready and `develop` as the development integration branch.
- Did not push either branch.

### Verification

- Confirmed ignored files were excluded from the commit.
- Confirmed `main` and `develop` reference the same initial commit.
- Confirmed the working tree is clean on `develop`.

### Pending

- Push `main` and `develop` only when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Private GitHub repository connected

### Completed

- Cancelled the authentication flow for the incorrect `Ricard-Rabasso` account.
- Authenticated GitHub CLI as `rabassoft`.
- Created the private repository `rabassoft/schema-engine`.
- Configured `https://github.com/rabassoft/schema-engine.git` as `origin` for fetch and push.
- Did not create or push a commit.

### Verification

- Confirmed GitHub reports `rabassoft/schema-engine` with `PRIVATE` visibility.
- Confirmed the local `origin` fetch and push URLs.
- Confirmed the local branch remains `main` with no commits.

### Pending

- Review the untracked files and create the initial commit when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial Git ignore policy added

### Completed

- Added `.gitignore` entries for macOS metadata, dependencies, build/test output, tool caches, local environment files, debug logs, and IDE-local metadata.
- Kept the package-manager lockfile, `.env.example`, shared configuration, and conformance fixtures trackable.
- Did not stage or commit files.

### Verification

- Verified representative ignored paths with `git check-ignore`.
- Confirmed `.DS_Store` no longer appears in `git status`.
- Confirmed representative trackable paths are not ignored.

### Pending

- Review the untracked documentation set before creating the initial commit.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Git repository initialized

### Completed

- Initialized an empty Git repository with `main` as the initial branch.
- Left all project files untracked.
- Did not create a commit or configure a remote.

### Verification

- Confirmed the directory is a Git work tree.
- Confirmed the current branch is `main`.
- Confirmed the repository has no commits.

### Pending

- Decide whether to add a `.gitignore` before the initial commit.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Compiler-only plan proposed

### Completed

- Confirmed pnpm, a native workspace, `packages/core`, Vitest, and the public package name `@rabassoft/schema-engine`.
- Confirmed the object-parameter compiler API and root required/optional members.
- Accepted ADR-006 to record the package boundary and supersede the pre-SPEC package name.
- Updated SPEC-001 to Draft v0.1.3 with the approved compiler input and root optionality.
- Drafted decision-complete PLAN-001 with behavior, diagnostics, fixtures, implementation sequence, and acceptance commands.
- Confirmed that no workspace or production code was created.

### Verification

- Checked PLAN-001 against SPEC-001, accepted ADR-005 and ADR-006, and deferred decisions.
- Checked deterministic diagnostics, no-partial-result behavior, and first-prototype scope.
- Checked local Markdown links.

### Pending

- Review and approve PLAN-001.
- Do not create the workspace or implement `compileFormDefinition()` before approval.

## 2026-07-13 — ADR-005 accepted

### Completed

- Formally reviewed ADR-005 against SPEC-001 and the deferred-decisions register.
- Replaced the ambiguous semantic-keyword test with an explicit initial keyword classification.
- Clarified that ADR-005 does not decide how the source schema reaches `SchemaValidator`.
- Accepted ADR-005.
- Updated SPEC-001 to Draft v0.1.2 and removed dialect selection from its open decisions.
- Removed dialect selection from the deferred register's next decisions.

### Verification

- Checked the accepted ADR against SPEC-001 diagnostic and compilation contracts.
- Checked consistent ADR status, SPEC version, next action, and local Markdown links.
- Confirmed that no compiler code or monorepo was created.

### Pending

- Propose and approve a compiler-only implementation plan for `compileFormDefinition()`.
- Do not begin implementation before that plan is approved.

## 2026-07-13 — ADR-005 drafted

### Completed

- Approved the working policy for unknown JSON Schema keywords and missing `$schema`.
- Drafted ADR-005 with Draft 2020-12 as the reference dialect.
- Defined deterministic diagnostic codes and severities for dialect and keyword compatibility.
- Preserved external validation and the first-prototype subset boundaries.

### Verification

- Reviewed ADR-005 against SPEC-001 and the approved policy.
- Checked the ADR index, handoff, and project status for consistent next actions.
- Checked local Markdown links.

### Pending

- Formally review and accept ADR-005.
- Do not implement `compileFormDefinition()` before ADR-005 is accepted.

## 2026-07-13 — Documentation conflicts normalized

### Completed

- Kept SPEC-001 at Draft and synchronized its index at v0.1.1.
- Reserved global ADR-005 for the JSON Schema dialect and compatibility policy.
- Corrected stale documentation paths.
- Flagged conflicting pre-SPEC ADRs for later review without changing their decisions.
- Clarified that references to the planned dialect ADR as `ADR-001` in the historical entry below now refer to `ADR-005`.

### Verification

- Checked active references to the planned dialect ADR.
- Checked the SPEC status and version across canonical project documents.
- Checked referenced documentation paths.

### Pending

- Draft and review ADR-005.
- Do not implement `compileFormDefinition()` before ADR-005 is accepted.

## 2026-07-13 — Codex handoff prepared

### Completed

- Consolidated SPEC-001 v0.1.1.
- Added the deferred-decisions register.
- Added repository instructions for Codex.
- Identified ADR-001 as the next architectural deliverable.

### Verification

- Documentation reviewed by the project owner.
- ZIP integrity verified.

### Pending

- Draft and approve ADR-001.
- Do not create the monorepo before ADR-001 is approved.
