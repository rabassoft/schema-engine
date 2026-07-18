# D-025 Angular presentation-container kit promotion-readiness review — Cycles 1–4

- **Date:** 2026-07-18
- **State:** Accepted after cycle 4 under the standing zero-finding review
  authorization
- **Demand:** Allow platform-specific UI libraries without coupling core or
  forcing every consumer to use one visual system
- **Authority reviewed:** ADR-007, ADR-009, ADR-017, ADR-020 revision 0,
  ADR-021 revision 1, ADR-023 revision 1, current Angular provider/leaf
  renderer/fixed-host boundaries, independent Standard projection and private
  reference theme evidence
- **Outcome:** Cycle 4 passed all twelve areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                          | Correction                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R100-F01 | D-025's original restart condition expected an already stable renderer kit, but none exists and the review did not reconcile that unmet trigger. | Recorded why ADR-023 plus explicit demand supersede it only for architecture/pilot design while all Stable, publication and broad-token claims remain Deferred.         |
| R100-F02 | The proposed registration covered only new advanced kinds, leaving the accepted static `section` on a permanently separate fixed-host path.      | Included `section` in the presentation-container domain, requiring exact SPEC-005 semantics and avoiding two incompatible Angular container extension architectures.    |
| R100-F03 | Verification named native and pilot lanes but did not require equivalent scenario coverage or forbid runtime kit switching.                      | Required the same neutral scenario/conformance matrix in both lanes, bootstrap/provider-time selection only, immutable resolution per definition and release isolation. |

## 1. Readiness conclusion

Promote only this narrow D-025 boundary for a separate architecture decision:

**An Angular-only Public + Experimental presentation-container renderer seam,
with dependency-free native fallback and one optional concrete Angular UI
library pilot.**

The restart evidence is sufficient because:

1. ADR-023 now fixes normalized tabs, accordion and grid semantics, state,
   lifecycle, accessibility, IDs, diagnostics and target responsibilities.
2. Angular already proves immutable multi-provider composition, validation,
   deterministic selection and custom override behavior for primitive leaves.
3. Fixed Internal section/object/collection hosts expose the child projection,
   text, snapshot, lifecycle and failure responsibilities a container seam must
   not lose.
4. Standard independently projects the same normalized forest without Angular,
   proving that no provider or component vocabulary belongs in core.
5. The two private shells intentionally duplicate semantic visual roles and
   light/dark behavior, proving useful theme vocabulary while also proving that
   application CSS is not yet a reusable Public contract.
6. The user supplied concrete demand for multiple UI libraries and selected
   core/Angular maturation before React/Vue.

D-025 originally said to resume when at least one renderer kit was Stable. That
condition is not met: the native Angular renderers are Public Experimental and
no external kit exists. Applying it literally would be circular because the
first official pilot cannot be built safely until its extension boundary is
designed. Review 100 supersedes that trigger only for an Experimental
architecture and privately verifiable pilot. It does not authorize Stable
status, publication, broad tokens or a claim that a renderer kit already
exists.

This evidence supports architecture design and one Angular pilot. It does not
support a generic cross-framework kit protocol, shared design system, Stable
support promise or promotion of all D-025.

## 2. Promoted architecture boundary

ADR-024 may design only:

- a Public + Experimental Angular registration/provider boundary for the
  accepted `section` plus ADR-023 tabs, accordion and grid container hosts;
- normalized-definition-only matching, immutable configuration, deterministic
  precedence and safe diagnostics;
- a dependency-free native Angular implementation that remains the default and
  fallback;
- one optional Angular UI-library pilot covering `section` and all three
  advanced container kinds while reusing existing child/leaf projection;
- child-host creation, mounted hidden-panel retention, target-local state,
  text/ID/accessibility projection, snapshot reconciliation, cleanup and
  failure isolation required by ADR-023;
- theme ownership and installation rules for the optional kit without adding
  visual metadata to core; and
- Experimental support tiers and compatibility evidence limited to the active
  Angular 22 family.

The pilot may compose existing ADR-007 leaf registrations but does not require
new UI-library leaf renderers. It proves the new container seam, not a complete
component suite. Existing native fields must remain a supported composition.

The `section` registration must preserve SPEC-005's exact fieldset/legend,
text, DOM identity and failure semantics. Promotion changes how Angular selects
the host, not the existing neutral or observable section contract. Object,
collection and item data hosts remain fixed and outside this presentation-only
seam.

No exact Public symbol, provider shape, package name, dependency or UI library
is selected by this readiness review. ADR-024 must close that inventory before
SPEC-008.

## 3. Package and dependency boundary

The base `@rabassoft/schema-engine-angular` package must remain installable and
usable without an external UI library. A pilot library dependency cannot become
a required dependency or peer of that base package.

ADR-024 must choose between an optional package/entry point or another isolated
delivery boundary that:

- declares its own exact UI-library and Angular peer compatibility;
- cannot leak into core, Standard, native clean consumers or base tarballs;
- keeps native providers tree-shakable and independently testable;
- permits an application to install the UI library's theme according to that
  library's documented mechanism; and
- has explicit missing/incompatible dependency behavior rather than silent
  fallback through deep imports.

Publication, package version and release authorization remain separate. The
pilot may be implemented and tested privately before any package is published.

## 4. Container selection and native fallback

ADR-007 remains authoritative only for primitive leaf renderers. ADR-024 may
reuse its proven composition principles, but must not silently widen
`AngularRendererRegistration` or pass container definitions to leaf testers.

The new container mechanism must define:

1. one immutable registration domain separate from leaf registrations;
2. the supported normalized container kind(s) each registration implements;
3. deterministic override/precedence independent of current value, locale,
   issues or layout state;
4. validation before form projection, with malformed configuration preventing
   ambiguous selection;
5. native registration availability for `section` and every ADR-023 kind;
6. fallback to the native registration when an optional kit has no compatible
   candidate or reports an explicitly recoverable capability absence; and
7. blocking, isolated diagnostics when selected host creation fails after
   resolution, preserving ADR-023 subtree semantics rather than silently
   changing renderer mid-lifecycle.

Whether selection uses kind mapping, scored testers or another closed
container-specific model is an ADR-024 decision. It must justify why container
state/child capabilities do or do not need tester inputs beyond the exact
normalized definition.

## 5. Child projection and lifecycle boundary

A container renderer is not given raw schema, runtime mutation methods or
application state. The Angular adapter owns a capability object or equivalent
internal bridge sufficient to:

- project the exact normalized child entry with its current definition and
  snapshot;
- create stable child hosts exactly once per accepted definition;
- retain every panel subtree while visually/accessibly hidden;
- reconcile snapshots without recreating layout state;
- resolve/report text and diagnostics through accepted adapter channels; and
- destroy all owned views/listeners/state exactly once.

The concrete bridge may be Public only if an external package cannot implement
the renderer without it. ADR-024 must inventory the smallest necessary Public
surface and keep direct `SchemaFormDirective`, runtime internals and private
factory access unavailable.

Container renderers may choose markup and animation but cannot alter ADR-023
keyboard behavior, initial/reset state, DOM identity inputs, source order,
one-column fallback, exact-once child identity or failure isolation.
The section renderer additionally cannot alter SPEC-005's fixed semantic
contract.

## 6. Theming ownership

Current Angular and Standard CSS variables are private application evidence,
not Public tokens. Their similar semantic roles do not authorize a shared CSS
package or core theme contract.

For the first pilot:

- the UI library owns its component tokens, CSS/assets and light/dark mechanism;
- the consuming application owns global theme selection and installation;
- the optional kit may expose documented kit-local customization hooks only
  when they map to that library's supported surface;
- native fallback must remain usable without kit styles;
- core and normalized UI metadata expose no color, spacing, typography,
  breakpoint, class, style or theme name; and
- no claim of pixel parity is made across native, pilot or Standard targets.

Generic Rabassoft design tokens, a shared cross-target stylesheet and theme
translation between UI libraries remain Deferred. ADR-024 must decide whether
the pilot exposes no new token API or a minimal kit-local one and inventory any
Public symbol exactly.

## 7. Pilot selection gate

ADR-024 must select exactly one Angular UI library using current primary-source
evidence and record:

- Angular 22 compatibility and release cadence;
- maintained tabs, accordion/disclosure and grid/layout primitives;
- accessibility and keyboard contracts compatible with ADR-023;
- theming/installation model and whether global assets are required;
- tree-shaking, package/dependency and license implications;
- ability to keep all panel child views mounted;
- native fallback and partial-capability behavior; and
- realistic clean-consumer/build/browser verification.

Candidate popularity alone is insufficient. A library that cannot preserve
ADR-023 lifecycle or keyboard semantics must be rejected even if its visuals
are preferable. Selecting a pilot establishes only Experimental evidence for
that exact Angular/library range, not a permanent preferred UI system.

## 8. Support and compatibility tiers

The first design must distinguish:

1. **Native Angular:** dependency-free built-in behavior, maintained with the
   base Angular adapter.
2. **Official Experimental pilot:** one exact UI-library integration and
   compatibility matrix, initially eligible for private implementation only.
3. **Custom/community containers:** possible through the documented Public
   seam but not tested or supported as official kits.
4. **Other Angular majors/libraries:** unsupported until separately evidenced;
   D-045 legacy Angular remains Deferred.
5. **React/Vue/Standard kits:** not implied; Standard remains a private direct
   consumer and D-026/later framework adapters retain their own gates.

ADR-024 must close failure behavior and SemVer impact for changing these tiers,
but cannot publish or promise Stable support.

## 9. Explicit exclusions

This promotion does not activate:

- any core renderer, provider, token, theme or framework capability contract;
- a generic cross-framework container SPI or shared target implementation;
- a complete UI-library field-renderer suite;
- Public generic design tokens, shared CSS or theme translation;
- more than one official pilot, automatic library detection or runtime kit
  switching;
- nested/item layout, wizards, actions, scopes, conditions or controlled layout
  state excluded by ADR-023;
- React, Vue, Standard adapter publication, legacy Angular, SSR/hydration or
  portals;
- package publication, versioning, release, repository/CI or external action;
- SPEC-008, PLAN-020 or code before ADR-024 is accepted.

## 10. Material alternatives

### Keep all container hosts fixed forever

Rejected. It would make a later official UI-library integration require
replacing Internal projection architecture after the M18 Public contract and
native implementation were already fixed.

### Promote a generic multi-framework renderer-kit protocol

Rejected. Only Angular has a real adapter/provider/lifecycle boundary; Standard
is intentionally not an adapter and React/Vue have no evidence.

### Add the pilot library to the base Angular package

Rejected. It would impose dependency, peer, styling and upgrade costs on every
native consumer and couple base compatibility to one visual system.

### Share the reference-app CSS variables as Public tokens

Rejected. They were independently duplicated to prove product-level parity and
have no component-kit compatibility or SemVer evidence.

### Require a complete pilot field suite now

Rejected. ADR-007 already permits leaf specialization. M18's new architectural
risk is container child/state/lifecycle projection; expanding to all controls
would obscure that proof and enlarge support obligations.

### Select the pilot in this readiness review

Rejected. Current library compatibility, accessibility, theming and license
evidence must be compared explicitly in ADR-024; readiness establishes the
decision boundary rather than silently choosing a dependency.

## 11. Questions ADR-024 must close

1. Exact registration, renderer and child-projection contracts and their
   Public/Internal classification.
2. Provider composition, validation, selection, override and native fallback.
3. Host creation/capability diagnostics, lifecycle cleanup and no mid-lifecycle
   renderer switching.
4. Exact package/entry-point boundary and dependency/peer/export isolation.
5. One concrete Angular UI-library pilot based on current primary evidence.
6. Theme installation/ownership and whether any kit-local token API is needed.
7. Native/pilot/custom support tiers, Angular/library compatibility and SemVer.
8. Exact migration from fixed section hosts and compatibility with leaf
   ADR-007 registrations.
9. Clean consumer, package, build, unit/DOM/browser and release-isolation
   evidence required before implementation.
10. Exact ADR-009 Public/Internal inventory and all ADR-023 invariants.

ADR-024 must also require one shared neutral scenario/conformance matrix to run
through both native and pilot provider configurations. Kit choice occurs only
through immutable application/provider configuration before projection; there
is no runtime kit switch or host replacement for an accepted definition.
Native-only clean consumers and Public artifact/release-isolation checks remain
mandatory.

## Cycle 2 findings and corrections

| ID       | Finding                                                                                                                        | Correction                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| R100-F04 | The architecture summary still called completed D-025 readiness the next gate.                                                 | Replaced it with review 100's accepted narrow promotion and ADR-024 as the current gate.                        |
| R100-F05 | The Deferred register retained current wording that D-025 was wholly Deferred and its readiness review had not occurred.       | Marked those clauses as historical, reconciled the old trigger and made only the unpromoted remainder Deferred. |
| R100-F06 | The complete-review cohesion result described only the advanced-container seam after `section` had joined the promoted domain. | Changed the result to the exact section-plus-advanced presentation-container boundary.                          |

## Cycle 3 findings and corrections

| ID       | Finding                                                                                                                          | Correction                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| R100-F07 | STATUS retained the previous 171-document/591-link count after review 100 added another document and link.                       | Moved the latest 172-document/592-link evidence to review 100's verification and kept ADR-023's entry focused on its own review. |
| R100-F08 | Present-state summaries of reviews 098/099 still described D-025 readiness as an outstanding gate after review 100 completed it. | Reworded them as historical authorization/gate outcomes and left ADR-024 as the sole current next action.                        |

## 12. Cycle 4 complete review

Cycle 4 repeated all twelve areas after every correction:

1. **Demand/restart condition:** Pass. ADR-023 and explicit user demand provide
   the missing neutral contract and product reason.
2. **Evidence sufficiency:** Pass. Angular leaf providers/fixed hosts, Standard
   contrast and private theme roles expose real boundaries; the unmet old
   Stable trigger is narrowed without pretending a kit already exists.
3. **Cohesion:** Pass. Only the Angular section/advanced
   presentation-container seam, native fallback and one pilot are promoted;
   broad theming remains separate.
4. **Core neutrality:** Pass. No framework/library/theme vocabulary enters core
   or normalized definitions.
5. **Angular ownership:** Pass. Section plus advanced provider, child view,
   state, lifecycle and diagnostics remain adapter/kit responsibilities while
   object/collection/item hosts stay fixed.
6. **Native continuity:** Pass. Base Angular stays dependency-free and native
   behavior remains default/fallback.
7. **Pilot isolation:** Pass. One optional delivery boundary owns its peers,
   theme and compatibility; native/pilot use the same matrix with immutable
   provider-time selection and no publication authorization.
8. **Theming restraint:** Pass. Current app tokens remain private; only
   library-owned or minimal kit-local customization may be designed.
9. **Cross-target isolation:** Pass. Standard, React, Vue and legacy Angular do
   not inherit the Angular provider contract.
10. **Public migration:** Pass. ADR-024 must select the exact minimal SPI before
    SPEC; no symbol is silently authorized here.
11. **Deferred boundaries:** Pass. Full kits, shared tokens, multiple pilots,
    Stable support, release and every ADR-023 exclusion remain inactive.
12. **Delivery sequence:** Pass. Acceptance authorizes only ADR-024 drafting and
    complete review; SPEC-008, plan and code remain blocked.

**Result:** zero findings and no unresolved change request.

## 13. Accepted effect

Acceptance promotes only section 2 for ADR-024 architecture design. It does not
select a UI library, dependency, package or Public symbol and authorizes no
SPEC, plan, code, publication, external action, commit or push. ADR-024 must
pass a complete zero-finding review before SPEC-008 may be prepared.
