# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-08-07 by Ricard / Codex
- **Branch:** `codex/m23-main-reselection-evidence`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0, SPEC-009 v0.1.0, SPEC-010 v0.1.0, SPEC-011
  v0.1.0, SPEC-012 v0.1.0, SPEC-013 v0.1.1, SPEC-014 v0.1.0, SPEC-015
  v0.1.0, SPEC-016 v0.1.1, SPEC-017 v0.1.0, SPEC-018 v0.1.0,
  SPEC-019 v0.1.2, SPEC-020 v0.1.0 and SPEC-021 v0.1.0
- **Last implementation plan:** PLAN-037 revision 0, Completed
- **Last completed implementation plan:** PLAN-037 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-038 revision 0
- **Implemented capability:** M1–M35 and G0
- **Published packages:** core/base `0.4.1` and pilot `0.2.1` resolve exactly,
  through `next`, `latest` and unqualified installation; all remain Public +
  Experimental + Active
- **Selected M23 source:** protected
  `main@028a98cfb1c96c821b6233c82f688a416e987656`; all live packages are
  byte-identical to its selected clean candidates

## Current objective

Evaluate and select the next functional capability from the deferred-decisions
register without reactivating repository/release preparation work.

## In progress

- None.

## Latest completed work

- Angular Integration now matches React and Standard: three build-checked
  examples share one accessible tabset and expose exactly one deferred
  purpose/responsibility/copy/code panel at a time while retaining the general
  Angular integration flow above it.
- Standard Integration now matches React's ordered tab structure: five
  build-checked examples share one accessible tabset and expose exactly one
  purpose/responsibility/copy/code panel at a time while retaining the general
  integration flow above it.
- Standard field-action alignment is complete: every non-boolean editable
  field places `Clear`/nullable actions to the right of its control while
  labels, supporting text, presence and issues retain full-width rows; boolean
  alignment remains unchanged.
- Schemas action copy is aligned across Angular, Standard and React: every
  shell now uses React's concise action and confirmation labels, protected by
  equivalent DOM and browser regressions.
- Cross-reference presentation alignment is complete: the three shells keep
  labels/descriptions close to their controls while separating complete field
  groups; React aligns checkbox, label and Clear on one compact row; Angular
  and Standard place schema actions below their editors and expose Integration
  as an independent first-level collapsible group outside Observable evidence.

## Exact next action

Evaluate and select the next functional capability from the deferred-decisions
register; do not activate implementation until its required promotion and
documentation gates are complete.

## Blockers and conflicts

- No implementation-contract, documentation, runtime or package-byte blocker
  is known; C-001, C-002 and both M33 checkpoint-1 documentation conflicts are
  resolved.
- Git tag, GitHub Release, another npm release and deletion of private recovery
  material remain separately gated external actions.
- Angular emits only the known Ajv CommonJS warning; its 1.25 MB initial bundle
  remains below the authorized 1.3 MB warning and 1.5 MB error budgets.
  Standard emits its known Vite chunk advisory. These are not blockers.
- Angular application builds inside the restricted sandbox may abort in esbuild
  0.28.1; the exact command outside that restriction passes.
- An optional offline restore lacks one cached Angular build tarball; the exact
  frozen-lockfile online restore passes without repository drift.
- React behavior, independent reference, private artifacts, isolated
  lower/current consumers, repository integration and final closure are
  complete. Vue, remaining D-011/D-012/D-025 scope, broader D-026, D-035 and
  D-045 legacy Angular remain inactive.
- The generic conditional dependency-guidance mode proposed during reference
  review requires a separate D-018 promotion because accepted SPEC-018 excludes
  a dependency graph. This is an inactive follow-up, not a blocker.

## Open questions

- Root and collection-item alternatives remain separately deferred; completed
  M33 adds no entry point, runtime export or release/version change.
- Completed PLAN-037 revision 0 assigns every SPEC-021 row exactly once across
  ten checkpoints; reviews 343–352 accept all checkpoints and final closure.
- Whether to promote a future D-018 slice for reverse dependency guidance,
  source/target icons and author-selected hide/disable explanation remains open;
  current scenarios use only accepted descriptions and hints.
- Dependency, version, release, commit, push and external actions remain
  separately gated.

## Latest verification

- Angular Integration tabs pass 4 files/34 unit tests, typecheck, scoped ESLint,
  production build, 12 exact snippets and 20/20 Chromium. Direct browser
  inspection confirms three named tabs, one visible panel, initial Application
  signals selection, accessible `Integration examples` labelling and no nested
  disclosures.
- Standard Integration tabs pass 7 files/76 unit tests, typecheck, scoped
  ESLint, production build, 12 exact snippets and 17/17 Chromium. Direct browser
  inspection confirms five named tabs, one visible panel, initial Compile
  selection, accessible `Integration examples` labelling and no nested
  disclosures.
- Standard field-action alignment passes 7 files/76 unit tests, typecheck,
  scoped ESLint, production build, 12 exact snippets and 17/17 Chromium. Direct
  browser inspection measures `Clear` 8.8 px to the right of the first input
  with a 0.8 px vertical-center difference and no behavior change.
- Schemas-copy alignment passes Angular 4 files/34 tests and 20/20 Chromium,
  Standard 7 files/76 tests and 17/17 Chromium, and React 4 files/8 tests; all
  three typechecks and scoped ESLint pass. Angular/Standard production builds
  and the exact 12-snippet check pass with only the known non-blocking build
  advisories.
- Cross-reference presentation review converges after one stale Standard E2E
  expectation correction: Angular 4 files/34 tests and 20/20 Chromium,
  Standard 7 files/76 tests and 17/17 Chromium, and React 4 files/8 tests and
  5/5 Chromium pass with all three production builds, typechecks, scoped
  ESLint, 12 exact snippets, documentation, formatting and diff hygiene;
  browser inspection confirms 4 px supporting-text/control spacing, 19–20 px
  field-group spacing, React's 4.8 px checkbox/label spacing,
  editor-before-actions order and
  independent collapsible Integration groups in Angular and Standard.

## Task document map

- Current React adapter promotion recommendation:
  `.ai-docs/reviews/338-d026-d044-m35-react-adapter-promotion-readiness.md`
- Accepted M35 architecture:
  `.ai-docs/adrs/038-first-react-adapter-and-reference-shell.md`
- M35 architecture review: `.ai-docs/reviews/339-adr-038-review.md`
- Accepted M35 observable contract: `.ai-docs/specs/021-first-react-adapter.md`
- M35 contract review: `.ai-docs/reviews/340-spec-021-review.md`
- Completed M35 implementation plan: `.ai-docs/plans/037-first-react-adapter.md`
- M35 plan review: `.ai-docs/reviews/341-plan-037-review.md`
- M35 checkpoint-1 pre-install review:
  `.ai-docs/reviews/342-plan-037-checkpoint-1-pre-install-review.md`
- M35 checkpoint-1 implementation review:
  `.ai-docs/reviews/343-plan-037-checkpoint-1-review.md`
- M35 checkpoint-2 implementation review:
  `.ai-docs/reviews/344-plan-037-checkpoint-2-review.md`
- M35 checkpoint-3 implementation review:
  `.ai-docs/reviews/345-plan-037-checkpoint-3-review.md`
- M35 checkpoint-4 implementation review:
  `.ai-docs/reviews/346-plan-037-checkpoint-4-review.md`
- M35 checkpoint-5 implementation review:
  `.ai-docs/reviews/347-plan-037-checkpoint-5-review.md`
- M35 checkpoint-6 implementation review:
  `.ai-docs/reviews/348-plan-037-checkpoint-6-review.md`
- M35 checkpoint-7 implementation review:
  `.ai-docs/reviews/349-plan-037-checkpoint-7-review.md`
- M35 checkpoint-8 implementation review:
  `.ai-docs/reviews/350-plan-037-checkpoint-8-review.md`
- M35 checkpoint-9 implementation review:
  `.ai-docs/reviews/351-plan-037-checkpoint-9-review.md`
- M35 final implementation review:
  `.ai-docs/reviews/352-plan-037-final-implementation-review.md`
- Completed reference usability review:
  `.ai-docs/reviews/337-reference-application-usability-review.md`
- Completed M34 implementation plan:
  `.ai-docs/plans/036-controlled-linear-declarative-wizard.md`
- M34 final implementation review:
  `.ai-docs/reviews/336-plan-036-final-implementation-review.md`
- Accepted M34 contract:
  `.ai-docs/specs/020-controlled-linear-declarative-wizard.md`
- Accepted M34 architecture:
  `.ai-docs/adrs/037-controlled-linear-declarative-wizard.md`
- Current roadmap: `.ai-docs/project/ROADMAP.md`
- Deferred register: `.ai-docs/roadmap/deferred-decisions.md`
