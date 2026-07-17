# D-044/M15 multi-framework reference platform promotion-readiness review

- **State:** Accepted; D-044 promoted for M15 normative design
- **Date:** 16 July 2026
- **Acceptance date:** 16 July 2026
- **Reviewed:** Accepted SPEC-001 through SPEC-006; ADR-001/003 context;
  Accepted ADR-006/007/008/009/010/018;
  D-024/D-026/D-030/D-032/D-033/D-035/D-043/D-044; current workspace, package
  entry points, conformance fixtures and clean consumer verification
- **Candidate milestone:** M15 — Multi-framework reference platform
- **Accepted effect:** Promote only the boundary in section 3 for ADR-020
  normative design; do not authorize a SPEC, PLAN-016 or implementation

## 1. Result

D-044 is ready for a narrow promotion to normative design as a private
reference platform, not as a public product, package, compatibility suite or
framework-neutral UI abstraction.

The first deliverable should combine one shared framework-neutral scenario
catalog with one independently built Angular 22 reference shell. The catalog
holds reusable demonstration inputs and evidence. The shell owns idiomatic
Angular integration and application state. This division reduces duplicated
scenario content without hiding the framework-specific code that consumers
need to understand and copy.

Normal workspace development and packaged-consumer verification serve different
purposes. The maintained shell should consume workspace entry points for fast
development. Existing isolated consumers must continue proving tarball and npm
contracts against every declared compatibility tuple. The reference shell is
additional evidence and never substitutes for those release gates.

Standard/DOM, React, Vue, legacy Angular and other shells are not promoted by
this review. They may reuse the catalog only after their own integration and
delivery boundaries are accepted. Acceptance registers the user's future
pre-Angular-19 intent separately as D-045, without selecting an exact version
floor or implementation family.

## 2. Readiness evidence

1. Core is framework-, DOM- and browser-neutral and exposes synchronous
   snapshots, subscriptions, strict operations and normalized definitions
   through its root Public entry point.
2. The Angular adapter projects the same contracts through Public directives,
   providers, renderer extension points and native renderers while preserving
   application ownership of `value` and `baselineValue`.
3. Accepted SPECs define executable scenarios for primitive fields, enum and
   clear, nested objects, homogeneous object collections, local references,
   static presentation groups and nullable primitive leaves.
4. Core conformance fixtures prove normative compiler output and diagnostics;
   Angular unit tests prove projection behavior. Neither gives a maintained,
   interactive, copyable application-level integration.
5. PLAN-015 verified the published core and Angular `0.2.0` packages from clean
   exact, `next`, `latest` and unqualified consumers at the lower and upper
   Angular 22 tuples. This evidence already has the isolation that a workspace
   application cannot provide.
6. ADR-009 keeps fixtures, test helpers and physical workspace paths Internal.
   A private reference catalog can reuse Public contracts without creating a
   package export or supported deep import.
7. ADR-010 separates product SemVer from framework versions and requires a
   compatibility matrix. A single maintained shell therefore need not be
   copied for every supported patch or major.

## 3. Recommended promotion boundary

### 3.1 Workspace and ownership

ADR-020 may design only these private workspace responsibilities:

- `apps/reference-scenarios`: a framework-, DOM- and browser-neutral catalog;
- `apps/reference-angular`: the first independently built reference shell; and
- root orchestration needed to format, lint, type-check, test and build them.

The workspace may add `apps/*` to `pnpm-workspace.yaml`. Both projects must use
`private: true`, must not appear in package artifacts and must not create a
Public package, entry point or export. Nx, Turborepo and a general monorepo
orchestrator remain unnecessary.

The catalog owns reusable scenario data and explanatory metadata. Each shell
owns its bootstrap, state container, framework reactivity, adapter bindings,
components, templates, styling, accessibility integration, shell tests and
framework-specific snippets.

### 3.2 Shared scenario catalog

The catalog may contain only data and pure test support required to describe
and verify a reference scenario:

- stable scenario identity, title, summary and feature tags;
- JSON Schema, UI Schema and collection policies from the Accepted subset;
- initial controlled value, baseline, locale and validation visibility;
- deterministic application-owned validation fixtures;
- expected operations, issues and important state transitions; and
- framework-neutral explanatory text.

The exact Internal TypeScript contract, immutability requirements and safe data
inspection belong in ADR-020. It must not become a second schema compiler,
runtime, renderer registry, adapter capability model or source of normative
behavior. Accepted SPECs and core conformance tests remain authoritative.

Core test directories and internal helpers are not imported by the catalog.
Some schema overlap with normative fixtures is acceptable because conformance
evidence and educational scenarios have different owners. Within the reference
platform, however, every shell consumes the same catalog rather than copying
those inputs.

Framework-specific snippets must come from build-checked shell source or from a
tested extraction step. The catalog must not carry uncompiled Angular, React,
Vue or DOM code as duplicated strings.

### 3.3 First Angular shell

The first shell is a standalone Angular 22 application built with Angular's
official application builder, aligned with the workspace's accepted Angular
tuple. It consumes only:

- `@rabassoft/schema-engine`;
- `@rabassoft/schema-engine-angular`; and
- the private reference-scenario catalog.

It must not use physical paths, `src/`, `dist/`, internal test helpers or deep
imports from either publishable package.

The shell must visibly demonstrate application ownership rather than hiding it
inside a cross-framework controller. For a selected scenario it provides:

- schema and UI Schema inspection;
- controlled `value` and `baselineValue` inspection;
- normalized definition and snapshot inspection where exposed Publicly;
- operation history with explicit confirm/reject behavior;
- validation issues, visibility, locale and relevant interaction state;
- reset to the scenario's initial application state; and
- copyable Angular integration source.

Applying, rejecting or delaying an operation is shell-owned demonstration
logic. Saving, HTTP, authentication, authorization, backend contracts and
business workflow remain absent. A deterministic application-local
`SchemaValidator` may support scenarios; it is not an Angular validator bridge
or a new official validation package.

The initial scenario set must exercise every currently Accepted capability at
least once while keeping each page understandable. It need not reproduce every
diagnostic or hostile-input conformance fixture.

### 3.4 Development, packaging and version compatibility

The maintained Angular shell uses workspace dependencies in normal development.
It validates source integration, interactive behavior and copyable usage, but
cannot prove packed or published correctness.

Release evidence remains isolated:

1. package/source tests verify artifacts and declaration boundaries;
2. temporary clean consumers install tarballs or exact npm versions with
   strict peers; and
3. lower/upper tuples cover the declared framework range under ADR-010.

PLAN-016 may reuse catalog data in temporary consumers only through an explicit
copy/build step that preserves isolation. It must not change the reference
shell manifest between workspace, tarball and npm modes or treat a successful
workspace build as release evidence.

The shell follows one canonical Angular tuple at a time. Patches and additional
supported majors belong to the clean-consumer matrix, not to cloned permanent
applications. If two supported Angular families require different source, each
gets an isolated shell or compatibility fixture only after a separate accepted
decision; the shared catalog remains common.

The current Angular package is built with Angular 22 and Signal Forms and
declares `>=22.0.6 <23.0.0`. This review makes no compatibility claim for
Angular before 19. Enterprise-oriented legacy support is recorded as D-045 and
requires a later decision on exact target majors, package/entry-point
boundaries, build provenance, framework APIs and maintenance policy.

### 3.5 Verification boundary

PLAN-016 should be eligible to require:

- catalog unit tests and immutability checks;
- Angular shell lint, type-check, unit tests and production build;
- one Chromium real-browser smoke lane for scenario navigation, controlled
  confirm/reject, operation/state inspection, locale, keyboard interaction and
  representative accessible names/descriptions;
- unchanged core/Angular package, source and clean-consumer gates; and
- searches proving no deep imports, Public export drift or accidental package
  inclusion.

Playwright is the selected class of browser runner for M15. The exact compatible
version, browser installation command and CI/cache mechanics belong in
PLAN-016. One Chromium lane is evidence for the reference interaction, not a
general browser-support promise or accessibility certification.

### 3.6 Distribution and hosting

M15 is local repository tooling. A production build may exist, but publishing
or hosting it, exposing the private repository, adding analytics or creating a
deployment workflow remains outside this promotion. Those actions require
their own review and any applicable D-043 decision.

## 4. Admission gate for later shells

A later shell may join the platform only when all of the following are true:

1. its integration boundary and any Public adapter/package contract have been
   accepted;
2. an approved plan names the exact shell and verification matrix;
3. it consumes the shared catalog without moving framework behavior into it;
4. it imports publishable libraries only through Public entry points;
5. it has an isolated build and dependency graph; and
6. its addition does not silently claim framework-version, browser, SSR,
   hydration or accessibility support.

For a second framework adapter, D-026's restart condition is met and adapter
capabilities must be reviewed from evidence rather than anticipated in M15.
D-035 remains Deferred unless the project separately chooses to publish an
implementation-independent specification.

A standard/DOM shell is not automatically an adapter. Its future review must
choose between a direct core consumer example and a supported published
integration. React and Vue require their own adapter decisions. Legacy Angular
support likewise requires the separate D-045 compatibility-family decision
rather than widening the current Angular peer range without compatible source
and build evidence.

## 5. Questions ADR-020 must close

1. Exact Internal scenario contract, validation fixture shape, immutability and
   catalog failure behavior.
2. Exact workspace names, dependency directions and enforcement that prevents
   publishing or deep imports.
3. Angular shell component/state boundaries and how confirm, reject, reset,
   locale and baseline updates remain visibly application-owned.
4. Exact initial scenario inventory mapped to Accepted SPEC capabilities.
5. How build-checked snippets are exposed without duplicating stale source.
6. Exact official Angular builder boundary and development commands.
7. Browser smoke responsibilities, deterministic selectors, accessibility
   assertions and explicit non-claims.
8. How package and clean-consumer gates remain independent from workspace demo
   evidence.
9. The admission checklist for later shells and explicit legacy-Angular
   deferral.

If resolving any question requires a new Public export, package, entry point or
observable runtime behavior, ADR-020 must stop and require the applicable SPEC
or API decision before PLAN-016.

## 6. Material alternatives resolved

### One multi-framework runtime application

Rejected. Angular, React, Vue and DOM targets have different dependency graphs,
bootstrap, reactivity, lifecycle, rendering and test environments. Combining
them in one runtime application would make upgrades and compatibility claims
coupled. Independent shells can still be collected by a future static portal.

### Duplicate one complete application per framework and version

Rejected. It duplicates schemas, values, explanatory content and expected
behavior, then makes scenario drift likely. The selected catalog shares domain
evidence while shells retain the integration code that must remain idiomatic.

### Share a framework-neutral application controller or UI abstraction

Rejected for M15. Hiding controlled ownership, operation handling or rendering
behind a demo-only abstraction would make examples less copyable and could
become an accidental unsupported product API. Sharing data and pure scenario
evidence is the narrower reusable boundary.

### Use the maintained application as tarball/npm release evidence

Rejected. Workspace resolution can mask manifest, packing and peer defects.
Temporary strict clean consumers remain authoritative for tarball/npm and
version-matrix evidence; the maintained shell serves development and
interactive experience.

### Keep a permanent shell for every supported framework version

Rejected. One canonical shell per source-compatible integration family plus
isolated lower/upper clean-consumer tuples covers ordinary version ranges. A
separate shell is justified only when accepted source differences require one,
as may occur under future D-045.

### Browserless tests only

Rejected. Vitest and DOM emulation cannot prove the built application starts or
exercise real focus, keyboard and browser integration. One Playwright/Chromium
smoke lane is proportionate; cross-browser certification is not.

### Nx, Turborepo or a generic orchestration layer

Rejected. Native pnpm recursive scripts already govern packages and can govern
private apps. M15 does not provide measured orchestration or caching pressure
that warrants another system.

## 7. Explicit exclusions

- Standard/DOM, React, Vue or another framework shell in PLAN-016.
- D-045 implementation: Angular before 19, multiple Angular-major builds or a
  legacy adapter.
- D-024 framework-validator bridges or a new validator package.
- D-026 capability negotiation, SSR, hydration, portals or generic dynamic
  component contracts.
- D-030 advanced localization; only existing locale and `TextResolver`
  behavior may be demonstrated.
- D-032 persistence/autosave, submit, HTTP, authentication or backend behavior.
- D-033 products, white-label platform, analytics or visual builder.
- D-035 public independent specification or third-party conformance program.
- Repository publication, hosting, deployment, telemetry, npm mutation or
  D-043 automation.
- New Public exports, entry points, packages, Stable promotion or runtime/SPEC
  behavior.

## 8. Required document sequence

1. Accept this review and promote only section 3 as D-044/M15 normative-design
   scope.
2. Draft and completely review ADR-020. Its acceptance may authorize preparing
   PLAN-016 only.
3. Draft and completely review PLAN-016. Explicit approval is required before
   implementation.
4. Implement only the approved checkpoints and repeat complete reviews until
   zero findings.

No step authorizes the next one by inference.

## 9. Complete reviews

### Cycle 1

The complete review found the recommendation viable and bounded, but identified
three documentation defects:

1. The reviewed-authority inventory omitted ADR-007/008, which govern the
   Angular renderer boundary, and ADR-018, which governs private/public
   distribution boundaries.
2. Future pre-Angular-19 support was deferred descriptively but had no durable
   decision identifier.
3. Workspace, shell, compatibility and browser alternatives were selected but
   not explicitly compared, leaving the rationale incomplete.

All three findings were corrected. Cycle 1 cannot support acceptance; the
complete review must repeat from the beginning.

### Cycle 2

The complete review repeated ten areas from the beginning:

1. **Authority and restart condition:** passes. PLAN-015 is complete, the
   published packages and clean consumers provide the required application
   baseline, and no Accepted SPEC or ADR assigns reference-app ownership
   elsewhere.
2. **Promotion size:** passes. Only a private catalog and first Angular shell
   advance to normative design; the platform is neither a public product nor a
   multi-framework implementation commitment.
3. **Shared boundary:** passes. Scenario data and evidence are reusable while
   runtime semantics, framework lifecycle, rendering and idiomatic integration
   stay out of the catalog.
4. **Controlled ownership and Angular projection:** passes. The shell visibly
   owns value, baseline, operation confirmation/rejection, locale and reset and
   consumes only Accepted Public package contracts.
5. **Workspace and API stability:** passes. Private `apps/*` projects do not
   add exports, entry points or publishable packages; deep imports and package
   artifact inclusion are explicitly prohibited.
6. **Version compatibility:** passes. One canonical Angular shell is separated
   from isolated lower/upper release tuples. D-045 records, but does not claim
   or design, future pre-Angular-19 support.
7. **Package and registry evidence:** passes. Workspace experience cannot
   replace tarball/npm consumers, and no version, publication or registry
   mutation is authorized.
8. **Verification proportionality:** passes. Unit/build gates plus one
   Playwright/Chromium smoke lane cover the interactive purpose without making
   cross-browser or accessibility-certification claims.
9. **Deferred and distribution boundaries:** passes. D-024/D-026/D-030/D-032,
   D-033/D-035/D-043 and later shells remain inactive; local build does not
   authorize hosting or repository publication.
10. **Delivery sequence:** passes. ADR-020 precedes PLAN-016, explicit plan
    approval precedes implementation, and any discovered Public/observable
    change stops for its own authority.

**Result:** zero findings and no unresolved change request. Ricard's standing
authorization accepts a fully reviewed document that does not widen the
approved objective, so D-044 is formally promoted only for section 3 and
ADR-020 preparation is authorized.

### Cycle 3

The accepted-state reconciliation found three documentation defects:

1. The accepted review header and two paragraphs retained proposed/future
   wording after formal acceptance.
2. ROADMAP still called the promoted section 3 boundary a candidate.
3. STATUS retained the pre-review D-044 verification summary with the old
   Markdown count beside the newer accepted review evidence.

All three were corrected. Cycle 3 cannot close the task; the complete
accepted-state review and documentation verification must repeat.

### Cycle 4

The complete review repeated all ten cycle 2 areas plus accepted-state
reconciliation from the beginning. Formatting, documentation and initial
active-state searches passed, but the final scoped inspection of D-044 found
one register defect: its state was Promoted while the body still labelled the
boundary as candidate and retained a pre-selection list of promotion decisions.

The register now labels the boundary as promoted and records review 053's exact
selection. Cycle 4 cannot close the task; the complete review must repeat.

### Cycle 5

The complete review repeated all ten promotion areas and accepted-state
reconciliation from the beginning. Review state, D-044's promoted boundary and
selected alternatives, D-045 deferral, ROADMAP, README, STATUS, WORKLOG, exact
next action and every ADR-before-plan/deferred boundary agree. Candidate wording
survives only in append-only historical entries.

Formatting, documentation across 114 Markdown files and 461 local links,
active-state searches and diff checks pass.

**Result:** zero findings and no unresolved change request. Review 053 and the
D-044/M15 promotion are completely closed.

## 10. Accepted effect

Acceptance:

1. mark D-044 Promoted only for the section 3 boundary;
2. authorize drafting and reviewing ADR-020;
3. create no SPEC or Public contract;
4. register D-045 as Deferred for future pre-Angular-19 compatibility families,
   with no exact floor, package boundary or implementation selected;
5. leave every later shell and legacy Angular capability inactive; and
6. authorize no plan, implementation, dependency installation, browser
   download, publication, deployment, commit or push.
