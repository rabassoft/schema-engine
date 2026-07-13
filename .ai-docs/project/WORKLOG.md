# Schema Engine — Work Log

This document is append-only. New entries must be added at the top.

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
