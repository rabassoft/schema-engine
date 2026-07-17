# D-046/M16 Standard/DOM promotion-readiness review — Cycle 1

- **Date:** 2026-07-17
- **State:** Accepted
- **Demand:** A maintained no-framework consumer was explicitly requested as
  the next reference target and selected after completing the Angular shell.
- **Authority reviewed:** Accepted SPEC-001 through SPEC-006, ADR-009,
  ADR-010, ADR-020, completed PLAN-016/PLAN-017, D-026, D-035, D-043, D-044
  and D-045
- **Outcome:** Cycle 1 passed with zero findings

## 1. Readiness conclusion

Promote D-046 as the M16 normative-design boundary for one private
Standard/DOM reference shell that consumes the existing Public core directly.
It is an application example, not a framework adapter, publishable package or
implementation-independent specification.

The restart conditions are satisfied:

1. D-044/M15 and PLAN-017 are complete; the neutral catalog and Angular shell
   provide a stable first platform baseline.
2. The user supplied concrete demand for reference consumers in Standard,
   Angular, React and Vue, and selected Standard/DOM as the next target.
3. The core root entry point already exposes `compileFormDefinition()`,
   `createControlledFormRuntime()`, `applyFormOperation()`, normalized
   definitions, snapshots, subscriptions and operations. No new Public export
   is required for the reviewed boundary.
4. The six catalog scenarios cover every Accepted capability and are already
   validated, deeply frozen, framework/DOM neutral and separately built.
5. ADR-020 explicitly allows a later Standard/DOM shell after choosing direct
   core consumption versus a supported integration. The selected direct-core
   example closes that admission question without activating D-026 or D-035.

## 2. Promoted boundary

ADR-021 may design only:

- one private workspace application named conceptually
  `@schema-engine-internal/reference-standard` under
  `apps/reference-standard`;
- dependencies on `@rabassoft/schema-engine` and
  `@schema-engine-internal/reference-scenarios` through their root entry points;
- an independently built browser bootstrap using standards-based DOM APIs and
  native HTML controls;
- application-owned `value`, `baselineValue`, locale, visibility, operation
  decisions, pending history and runtime lifecycle;
- projection from normalized `FormDefinition`/runtime snapshots to the DOM,
  never interpretation of raw JSON Schema by renderers;
- all six current catalog scenarios and the same accepted behavioral evidence,
  without requiring pixel-identical or component-identical Angular UI;
- build-checked copyable Standard/DOM integration source;
- private unit, build and one independent Playwright/Chromium smoke lane; and
- root orchestration and boundary checks strictly necessary for that project.

The shell may reproduce the reference platform's sober visual intent, but it
owns its HTML, CSS, DOM lifecycle and accessibility implementation. M16 shares
catalog data, not a cross-shell controller, renderer registry, component
library, stylesheet package or runtime behavior.

## 3. Direct-core application contract

The shell compiles each catalog input through the Public compiler and creates a
fresh Public controlled runtime. It subscribes independently to snapshots and
operations, maps normalized nodes to native controls, forwards focus/blur and
value/remove/collection intentions to the runtime, and disposes subscriptions
and runtime instances during scenario replacement or application teardown.

Operations remain intentions. The shell visibly confirms, rejects or leaves
them pending; confirmation uses `applyFormOperation()` and replaces the complete
application-owned value only on success before calling `updateExternalState()`.
Reset, locale, validation visibility and whole-form baseline commit remain
application actions. The shell adds no optimistic state, persistence, submit,
HTTP, authentication, business workflow or shared application controller.

Rendering all Accepted nodes is private educational integration code. It does
not become a supported DOM renderer kit, Web Component system, adapter API or
new source of compiler/runtime semantics. Discovery that the shell needs a new
Public contract stops ADR-021 and requires the applicable SPEC/API decision.

## 4. Delivery and verification boundary

ADR-021 must select an exact private build/serve stack and keep it out of Public
package manifests and artifacts. PLAN-018, if later approved, must prove:

- catalog, core and Standard/DOM dependency directions and root-only imports;
- deterministic build, strict type check, lint and focused unit tests;
- scenario navigation and compile success for all six catalog entries;
- representative primitive, nested, collection, reference, presentation and
  nullable interaction through native keyboard-accessible controls;
- confirm, reject, pending/stale, reset, baseline, locale and validation flows;
- schema/UI Schema and observable state/evidence inspection plus copyable
  build-checked integration source;
- runtime/subscription disposal and absence of duplicate listeners after
  scenario replacement;
- an independent Playwright project/port whose success does not substitute for
  Angular, package, source, artifact or clean-consumer evidence; and
- searches proving no Angular dependency, deep import, Public drift,
  publishable app, generated artifact leak or release inclusion.

Chromium smoke remains integration evidence, not cross-browser support,
accessibility certification or a hosting commitment. Workspace dependencies do
not prove tarball/npm consumption.

## 5. Material alternatives

### Public Standard/DOM adapter or renderer package

Rejected for M16. Current Public core contracts are sufficient for a direct
consumer, while an official adapter would introduce API, compatibility,
versioning and support obligations without a second real implementation need.

### Framework-like Web Components abstraction

Rejected. A generic custom-element lifecycle or renderer registry would be an
adapter/product decision in disguise. Internal rendering helpers may organize
the application but cannot be exported or treated as reusable product API.

### Shared Angular/DOM controller, components or stylesheet package

Rejected under ADR-020. Sharing application decisions would hide the ownership
the examples must teach; sharing UI implementation would couple independent
targets. Only catalog scenarios and existing repository tooling are common.

### Partial showcase with only primitive fields

Rejected. It would not validate that the neutral core composes without Angular
for nested objects, collections, references, presentation groups and nullable
leaves. M16 covers the same six catalog scenarios with target-idiomatic UI.

### One multi-target runtime application

Rejected. The Standard/DOM project has its own bootstrap, dependency graph,
build and smoke lane. A future portal may link independent builds but cannot
merge their runtime ownership.

## 6. Explicit exclusions

- `@rabassoft/schema-engine-standard`, a Public DOM adapter, Web Components or
  renderer kit.
- React, Vue, Svelte, another framework or D-026 capability negotiation.
- D-035 third-party specification/conformance publication.
- D-045 legacy Angular families or any Angular compatibility change.
- Shared cross-framework controller, state container, lifecycle, renderer
  registry, templates, CSS package or visual component abstraction.
- SSR, hydration, portals, service workers, offline behavior or multi-browser
  support claims.
- Persistence, autosave, submit, backend, authentication, authorization,
  analytics or D-033 product work.
- Hosting, deployment, public-repository work, CI/release automation,
  publication, package version or registry mutation.
- New Public exports, entry points, packages, Stable promotion, runtime
  behavior or SPEC change.

## 7. Questions ADR-021 must close

1. Exact private project manifest, browser build/serve stack, commands and
   dependency ownership.
2. DOM bootstrap, render ownership, runtime/subscription disposal and safe
   scenario replacement.
3. Exact normalized node-to-native-control strategy, collection identity,
   focus, accessible naming and temporary numeric text behavior.
4. Application state and operation-decision flow without a shared controller.
5. Scenario/evidence parity with Angular while allowing target-idiomatic UI.
6. Build-checked Standard/DOM snippet extraction and stale detection.
7. Unit/build/browser matrix, independent ports/selectors and explicit support
   non-claims.
8. Boundary enforcement preventing Angular imports, Public drift, publication
   or contamination of package/release evidence.

## 8. Complete review

Cycle 1 repeated ten areas from the beginning:

1. **Demand and restart condition:** Pass. M15 is complete and the user chose
   the no-framework target as the next maintained consumer.
2. **Accepted authority:** Pass. Direct core consumption preserves the
   application ownership, controlled operations and renderer normalization
   required by Accepted SPECs and ADR-020.
3. **Public sufficiency:** Pass. Existing root exports cover compilation,
   runtime, operations, snapshots and subscriptions; no API extension is
   assumed.
4. **Target classification:** Pass. The shell is a private application example,
   not an adapter, package, renderer kit or independent implementation.
5. **Catalog and parity:** Pass. The common catalog remains data/evidence only;
   all six scenarios are covered without sharing framework behavior.
6. **Lifecycle and ownership:** Pass. State, decisions, DOM projection,
   subscriptions and disposal remain visible shell responsibilities.
7. **Workspace/release isolation:** Pass. Root-only dependencies, private
   manifest and independent release gates prevent workspace evidence from
   becoming package evidence.
8. **Verification proportionality:** Pass. Target-focused unit/build/Chromium
   evidence is required without claiming cross-browser or accessibility
   certification.
9. **Deferred boundaries:** Pass. D-026, D-035, D-043, D-045, later frameworks,
   hosting and product work remain inactive.
10. **Delivery sequence:** Pass. ADR-021 must pass complete review before
    PLAN-018; explicit plan approval must precede implementation, and Public
    discoveries stop for separate authority.

**Result:** zero findings and no unresolved change request. The user's explicit
selection accepts this reviewed boundary, so D-046 is promoted only for
ADR-021 preparation.

## 9. Accepted effect

Acceptance:

1. registers D-046 as Promoted for the section 2 M16 design boundary;
2. authorizes drafting and completely reviewing ADR-021;
3. creates no SPEC, plan, implementation or Public contract;
4. leaves D-026, D-035, D-043, D-045, React, Vue and all later targets
   inactive; and
5. authorizes no dependency installation, commit, push, publication,
   deployment or external-system mutation.
