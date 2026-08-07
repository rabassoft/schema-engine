# D-026/D-044 M35 first React adapter promotion readiness — Cycles 1–2

- **Date:** 2026-08-04
- **State:** Accepted by Ricard; only the bounded M35 architecture question is
  promoted and ADR-038 is reserved
- **Candidate milestone:** M35 — First React adapter and admitted reference
  shell
- **Authority reviewed:** Accepted SPEC-001 v0.1.15 through SPEC-020 v0.1.0;
  ADR-006, ADR-007, ADR-008, ADR-009, ADR-010, ADR-020, ADR-021, ADR-023,
  ADR-024, ADR-025 and ADR-037; completed M1–M34/G0; current package and
  reference boundaries; Deferred D-025 and D-026; implemented D-044
- **Outcome:** Cycle 1 found six boundary ambiguities. After correction, cycle
  2 repeated all sixteen areas with zero findings. Ricard accepted the
  recommendation and authorized only ADR-038 design/review; it does not
  authorize SPEC, plan, dependency, package, implementation, version, release,
  publication or Git work.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R338-F01 | Replaced an adapter-seam-only option with one vertical milestone containing the Public React adapter, native HTML projection and an admitted private shell. An unused seam would not supply the second-adapter evidence that triggers D-026. |
| R338-F02 | Closed parity to all framework-neutral runtime, node, presentation and wizard behavior implemented through M34, while explicitly excluding Angular-only Signal Forms and Angular Aria behavior.                                              |
| R338-F03 | Prohibited reuse of Angular or Standard lifecycle, controllers, renderer implementations, templates and CSS. Only the existing neutral scenario catalog and Public core contracts may cross target boundaries.                               |
| R338-F04 | Required ADR-038 to select one explicit React/React DOM compatibility line and test tuples before any peer range is claimed; the promotion review does not guess a broad version range.                                                      |
| R338-F05 | Separated creating a Public Experimental package from releasing it. M35 may prepare a package candidate only after later gates; npm publication, version coordination and external actions remain separately authorized.                     |
| R338-F06 | Reduced D-026 to client rendering, external-store subscription, lifecycle and ordinary component composition. SSR, hydration, Server Components, portals, Suspense/lazy renderers and capability negotiation remain Deferred.                |

Cycle 1 cannot support selection. Cycle 2 restarts all sixteen review areas
after these corrections and records zero findings in section 11.

## 1. Readiness conclusion

The first React adapter is ready for a bounded architecture gate.

The reason to start now is not merely roadmap order. The neutral core already
owns compilation, controlled value/baseline behavior, operations, validation,
async-validation state, scopes, conditions, collections, alternatives and
wizard progress. Angular and Standard independently project the same authored
catalog through M34. A React implementation can therefore test a mature
framework boundary instead of repeatedly absorbing every intermediate core
change.

The smallest useful increment is a vertical adapter, not a framework shell that
calls core directly and not an abstract adapter protocol. M35 should deliver a
React-specific package with native HTML projection and one private reference
shell that proves it in consumer use. It must preserve independent framework
ownership and must not generalize an API from Angular names or implementation
details.

## 2. Exact recommended M35 boundary

If Ricard selects this recommendation, the next ADR may design only the
following closed boundary:

1. Add one React-specific publishable workspace package whose final name,
   entry point and Public Experimental exports are fixed by ADR-038. It imports
   the core only from `@rabassoft/schema-engine` and exposes no Angular,
   Standard/DOM, browser-global or raw-JSON-Schema dependency through core.
2. Add one private `apps/reference-react` shell only after the adapter contract
   is accepted. It imports the shared neutral scenario catalog, core, the React
   adapter and the existing replaceable validator through their admitted root
   entry points.
3. Cover every currently implemented framework-neutral form capability through
   M34: primitive fields, nested objects, stable collections, static local
   references, nullable leaves, semantic formats, fixed values, object
   composition, async-validation evidence, scope confirmation, explicit
   defaults, simple/compound conditions, atomic string-enum arrays,
   discriminated object alternatives, recursive presentation forests, static
   section/tab/accordion/grid containers and the controlled linear wizard.
4. Provide a native HTML renderer set sufficient to project those neutral
   definitions and snapshots, including string, string enum, string-enum array,
   number/integer, boolean and fixed leaves plus object, collection,
   presentation-container and wizard hosts. Angular Aria is not reproduced and
   no third-party component library is selected.
5. Preserve strict application ownership. The consuming application remains
   the only source of truth for `value`, `baselineValue`, locale, operation
   acceptance/rejection, async transport, persistence and completion. React
   state may hold application inputs and target-local view state but cannot
   become an optimistic copy of the confirmed domain model.
6. Map the synchronous neutral snapshot/subscription contract to React using a
   concurrency-safe external-store integration chosen explicitly by ADR-038.
   Runtime creation, subscription, replacement and disposal must remain free of
   render-phase side effects and duplicate operations under the selected React
   development lifecycle.
7. Keep renderer resolution adapter-owned. React registrations use the accepted
   ADR-007 rank, priority, stable-order, exception-isolation and no-match
   semantics over normalized definitions, but React component types and props
   remain React-specific. No cross-framework renderer registry package or
   universal component token is introduced.
8. Give native and custom React renderers immutable normalized definitions,
   snapshots, resolved texts and intention callbacks only. They never inspect
   raw JSON Schema, apply `FormOperation`, validate business data, advance the
   wizard or mutate application state directly.
9. Preserve target-local state where accepted: tabs and accordions remain owned
   by the React projection; controlled wizard selection and neutral wizard
   progress remain owned by the existing runtime/application protocol. Stable
   collection item IDs and normalized node keys must drive React identity, not
   array position or generated render-time IDs.
10. Treat text-input and localized-number editing as presentation buffers. A
    rejected or stale operation, external confirmation, locale change, blur,
    node replacement and unmount must reconcile without fabricating confirmed
    value, dirty, touched, issues or operations.
11. Consume the complete shared scenario catalog in the React shell and expose
    the same scenario inputs, controlled decisions, configuration editing,
    observable evidence and build-checked integration examples expected from
    the maintained reference platform. Exact component structure is idiomatic
    React and independently owned.
12. Duplicate target UI and styles deliberately where necessary to keep visual
    and textual parity. Do not import Angular/Standard components, controllers,
    templates or CSS and do not move runtime semantics into the catalog. Any
    later shared design-token or theme protocol requires a separate D-025 gate.
13. Keep the package and shell client-rendered. M35 makes no claim for SSR,
    hydration, React Server Components, portals, streaming, Suspense, lazy
    renderers, cross-browser certification or accessibility certification.
14. Preserve core behavior and exports. If React needs a missing neutral
    operation, snapshot, lifecycle rule or Public core export, implementation
    stops and the applicable architecture/SPEC gate is reopened instead of
    adding an adapter-only workaround.
15. Require independent package, declaration, clean-consumer, source-
    reconstruction, unit, production-build and Chromium evidence. Workspace
    success and the reference shell cannot replace package-install evidence.
16. Keep dependencies, peer ranges, versions, release preparation,
    publication, repository visibility, commit, push and all external actions
    separately gated.

This review uses descriptive names only. It does not select final component,
hook, context, renderer-prop, diagnostic, package or manifest names.

## 3. Why package plus shell is the smallest useful increment

An adapter seam alone could prove that a runtime subscribes, but it would not
exercise tree identity, controlled operations, local input buffers, renderer
extension, layout state, wizard lifecycle or accessibility. A direct-core React
demo would duplicate the Standard shell and would not establish a supported
framework integration.

The package and shell therefore belong to one architectural milestone, but the
later plan must stage them. Package contracts and focused consumers precede
native projection; the private shell and its browser lane come only after the
adapter behavior is independently verified. This preserves ADR-020's admission
rule while avoiding a package that exists only on paper.

## 4. Existing authority and deliberate extensions

- SPEC-001 already defines the neutral runtime subscription model and a
  framework adapter as projection rather than state authority. React consumes
  that model; it does not change it.
- ADR-007 supplies neutral renderer-selection semantics but deliberately leaves
  registrations and components adapter-owned. Its second-adapter review trigger
  is now met; ADR-038 must confirm the semantic portion and define only the
  React representation.
- ADR-008 remains Angular-specific. Its `ViewContainerRef`, creation bindings
  and Angular component lifecycle are evidence, not a portable abstraction.
- ADR-009 must be revised or coordinated because a third Public package and new
  root entry point are proposed. All React exports remain Public + Experimental
  - Active unless a later explicit promotion says otherwise.
- ADR-010 must be revised or coordinated because the new package needs its own
  SemVer, core peer range, React peer tuple and compatibility matrix. M35 does
  not require lockstep with core, Angular or React.
- ADR-020 admits the private shell only after its adapter/integration contract,
  project and verification matrix are accepted. It allows catalog reuse but
  forbids a shared framework controller or visual implementation.
- ADR-021 confirms that Standard/DOM is a direct-core example, not a reusable
  adapter implementation. React cannot import from it.
- ADR-023/ADR-025 define neutral presentation and target-owned state. React must
  project them independently.
- ADR-024 remains the narrow Angular-only container-kit decision. It neither
  requires nor authorizes a React Aria or other UI-library package.
- ADR-037 defines controlled wizard behavior and once-mounted target projection
  requirements. React must preserve the same neutral state/intention boundary
  without copying Angular's component mechanism.

No Accepted document currently defines a React package, React compatibility
matrix, React lifecycle mapping, React renderer contract or admitted React
shell. ADR-038 and a later extension SPEC are therefore required before code.

## 5. D-026 resolution proposed for M35

D-026's trigger is satisfied, but only a narrow part is ready to promote:

- subscription of a synchronous immutable external snapshot into the selected
  React client runtime;
- deterministic runtime/subscription/disposal lifecycle;
- ordinary React component composition for normalized nodes and renderers; and
- React-local renderer and presentation state.

The following remain Deferred because no requirement or evidence justifies
them: SSR, hydration, Server Components, portals, overlays, streaming,
Suspense/lazy renderers, framework-capability negotiation, framework-neutral
dynamic components and a universal adapter API.

M35 should record comparisons learned from Angular and React after
implementation. It must not invent a shared abstraction before two real
adapters expose the same stable responsibility.

## 6. Architecture questions reserved for ADR-038

ADR-038 must close at least these questions before any SPEC or implementation:

1. exact package name, root entry point, source/build format and Public
   Experimental export inventory;
2. exact supported React and React DOM line, TypeScript/build tuple, peer
   ranges, core peer range and lower/latest clean-consumer matrix;
3. root component/hook responsibilities and whether consumers receive a
   component, hooks, an imperative handle or a closed combination, without
   exposing the runtime as a second state owner;
4. external-store subscription, initial snapshot, listener failure, atomic
   replacement, render/commit ordering and development-lifecycle behavior;
5. exact runtime creation/recreation/disposal identity when `formId`,
   definition, schema, validator, value, baseline, locale or visibility
   changes;
6. operation and wizard-intention delivery ordering, stale callbacks, error
   isolation and the rule that render/effect replay cannot duplicate an
   intention;
7. React renderer registration, tester validation, rank/priority ties,
   immutable registry composition, custom renderer props and no-match/
   instantiation diagnostics coordinated with ADR-007;
8. normalized tree projection, stable React keys, nested owner/item addresses,
   mount/unmount behavior, focus cleanup and blocked/inactive action safety;
9. native field buffers, locale-aware number parsing/formatting, missing versus
   empty/null/fixed values, external reconciliation and explicit clear;
10. text resolution, issue-message projection, diagnostic batching and
    structural sharing without importing Angular internals;
11. target-local section/tab/accordion/grid state, presentation-container
    fallback and wizard once-mounted/hidden/focus/accessibility behavior;
12. private reference-shell dependency graph, scenario parity, configuration
    editing, snippet extraction, independent styling, browser lane and cleanup;
13. client-only boundary and precise non-claims for SSR, hydration, Server
    Components, portals, UI libraries, theming and browser/accessibility
    certification;
14. ADR-009/ADR-010 coordination, package candidate status, declaration/deep-
    import enforcement and separately gated future release; and
15. exact conformance ownership across package units, hostile registrations,
    built/packed/source consumers, the reference shell and final complete
    review.

ADR-038 must not infer Public names from Angular (`SchemaFormDirective`,
providers, Signals or output emitters), Standard DOM functions or the
descriptive terms used in this review.

## 7. Future observable-contract and delivery gates

If ADR-038 is later Accepted after a complete zero-finding review:

1. SPEC-021 must define the exact Public React behavior, types, lifecycle,
   renderer/native projection, accessibility, compatibility and conformance
   rows. It may extend the Accepted baseline only for this React boundary.
2. PLAN-037 may be drafted only after SPEC-021 is Accepted. It must divide the
   work into ordered checkpoints with package/core invariance, adapter
   lifecycle, registry, native fields, compound nodes/layout/wizard, shell,
   consumers and final-matrix ownership.
3. Dependency and lockfile mutation requires the separately authorized plan
   checkpoint containing the exact selected React tuple.
4. Version, release candidate, npm publication, dist-tags and Git actions
   remain outside M35 unless separately promoted after local completion.

No existing plan authorizes React implementation.

## 8. Material alternatives considered

| Alternative                                                     | Assessment                                                                                                                   | Outcome                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Keep using only Angular and Standard                            | Avoids framework cost but no longer tests whether the mature neutral surface maps cleanly to another component framework.    | Valid fallback, lower architectural learning. |
| Private direct-core React shell                                 | Faster initially, but repeats Standard/DOM and establishes no supported adapter package or renderer extension contract.      | Rejected.                                     |
| Public headless seam without native renderers or shell          | Small package surface, but cannot prove real rendering, identity, input-buffer, layout, wizard or accessibility behavior.    | Rejected.                                     |
| Public adapter plus only primitive renderers                    | Creates a misleading partial framework claim after deliberately postponing React until the neutral feature set matured.      | Rejected for M35.                             |
| Public React adapter, full neutral projection and private shell | Delivers consumer value and the evidence required to review cross-adapter assumptions while retaining staged implementation. | Recommended.                                  |
| Shared universal adapter/controller or renderer implementation  | Prematurely standardizes Angular/React/DOM lifecycle and visual concerns that are intentionally target-owned.                | Rejected.                                     |
| Add a React UI library or shared theme protocol now             | Conflates framework admission with broader D-025 and multiplies compatibility/dependency decisions.                          | Deferred.                                     |

## 9. Explicit exclusions

M35 does not activate:

- any change to JSON Schema/UI Schema grammar, compiler normalization, runtime
  operations, validation semantics, controlled ownership or core exports;
- Vue, Svelte, another framework adapter or a framework-neutral adapter
  protocol;
- Angular legacy/23 work, Angular package refactors or an Angular Aria
  equivalent;
- SSR, hydration, Server Components, portals, overlays, streaming, Suspense,
  lazy renderers or capability negotiation;
- D-013 hot definition reconciliation, remaining D-011/D-012/D-018 scope,
  broader D-025 theming, D-035 public independent specification or D-045;
- shared target controllers, renderer implementations, templates, styles or a
  Public scenario package;
- persistence, HTTP, submit/save state, authorization, workflow beyond M34 or
  hosting; or
- dependency installation, manifest/lockfile mutation, version, release,
  publication, commit, push or external action before their later gates.

## 10. Required evidence for the later architecture and plan

The accepted architecture and plan must require, proportionally:

- package source, declarations and root-only export inventory;
- React renderer-registration hostile-shape and deterministic-selection tests;
- runtime subscription/replacement/disposal and development-lifecycle tests;
- controlled operation, async validation, scope, condition, collection,
  alternative and wizard invariance tests;
- native field and complete normalized-tree projection tests;
- one independent private reference shell consuming the complete catalog;
- production build, type/lint/format, snippet freshness and Chromium smoke;
- clean lower/latest React consumers plus built, packed and isolated-source
  consumers with deep-import rejection;
- package-boundary checks proving no Angular/Standard/catalog leakage into the
  publishable package; and
- complete diff, documentation and final zero-finding review.

Cross-browser support, visual-regression coverage and accessibility
certification remain non-claims unless separately selected.

## 11. Cycle 2 complete promotion review

| Area                             | Result | Evidence                                                                                                                                |
| -------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Accepted authority            | Pass   | Extends only the framework-adapter boundary; core and all Accepted behavioral contracts remain authoritative.                           |
| 2. Product sequence              | Pass   | M32–M34 are complete and the explicitly deferred first React adapter is now the roadmap candidate.                                      |
| 3. Smallest useful delivery      | Pass   | Package, native projection and admitted shell form one staged vertical increment; seam-only and direct-core alternatives are rejected.  |
| 4. Controlled ownership          | Pass   | Application retains value, baseline, operations, async transport, persistence and completion authority.                                 |
| 5. Runtime/reactivity            | Pass   | ADR-038 must close external-store, render/commit, replacement, disposal and development-lifecycle semantics.                            |
| 6. Renderer architecture         | Pass   | ADR-007 semantics are retained while React component types/props remain adapter-owned; no universal registry is introduced.             |
| 7. Capability parity             | Pass   | Scope is the complete neutral projection through M34, excluding Angular-only implementations and unrelated deferred behavior.           |
| 8. Identity and local state      | Pass   | Stable definition/node/item identity and accepted target-local state boundaries replace positional or render-time identity.             |
| 9. Reference admission           | Pass   | ADR-020's catalog-only sharing, independent shell, root-entry consumption and verification rules are preserved.                         |
| 10. D-026 boundary               | Pass   | Only client subscription/lifecycle/component composition is proposed; all advanced capabilities remain Deferred.                        |
| 11. D-025 boundary               | Pass   | Native HTML is included without a third-party UI kit, shared CSS, design-token protocol or theming claim.                               |
| 12. Public API and package       | Pass   | ADR-009 coordination and a new Accepted SPEC are required before any Public export or implementation.                                   |
| 13. Compatibility and release    | Pass   | ADR-010 coordination must select/test one explicit tuple; versions, publication and external state remain separately gated.             |
| 14. Verification proportionality | Pass   | Package, clean/source consumers, independent shell and Chromium evidence are required without replacing release or certification gates. |
| 15. Deferred isolation           | Pass   | Vue, advanced D-026, broader D-025, D-035, D-045, hot definitions and external actions remain inactive.                                 |
| 16. Delivery sequence            | Pass   | Owner selection precedes ADR-038; Accepted ADR precedes SPEC-021; Accepted SPEC precedes PLAN-037 and implementation.                   |

Cycle 2 passes all sixteen areas with zero findings and no unresolved change
request. Ricard accepted the recommendation on 4 August 2026. Only its bounded
D-026/D-044 M35 architecture question is promoted and ADR-038 is reserved;
SPEC-021, PLAN-037, implementation, dependencies, versions, release,
publication and Git remain unauthorized.
