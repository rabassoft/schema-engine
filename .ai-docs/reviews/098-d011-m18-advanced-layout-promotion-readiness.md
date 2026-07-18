# D-011/M18 advanced neutral layout promotion-readiness review — Cycles 1–2

- **Date:** 2026-07-18
- **State:** Accepted after cycle 2 under the user's explicit M18 selection and
  standing zero-finding review authorization
- **Demand:** Mature neutral core behavior through Angular and Standard before
  later frameworks, while preserving a viable path to platform-specific UI
  renderer kits
- **Authority reviewed:** Accepted SPEC-001/002/003/005, ADR-007, ADR-009,
  ADR-017, ADR-020, ADR-021, implemented D-042/M12, current Public presentation
  contracts and Deferred D-011/D-012/D-013/D-018/D-025/D-026
- **Outcome:** Cycle 2 passed all twelve areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                               | Correction                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| R098-F01 | STATUS still requested milestone selection and marked promotion readiness active after M18 had been selected and reviewed.            | Closed the active review and made ADR-023 the current objective and exact next action.                                                         |
| R098-F02 | The Deferred register's current-decision summary still claimed that no next milestone had been selected.                              | Replaced the stale selection step with the accepted M18 boundary and its ADR-023/D-025/SPEC delivery gates.                                    |
| R098-F03 | The architecture index still described all of D-011 as currently Deferred after the narrow promotion.                                 | Preserved the historical M12 statement, added review 098 and updated the current summary to distinguish the promoted slice from the remainder. |
| R098-F04 | The D-025 coordination language could be read as guaranteeing promotion even if its own readiness review finds insufficient evidence. | Made the gate conditional: a not-ready or unresolved D-025 result stops M18 before SPEC-008 rather than forcing an architecture.               |

## 1. Readiness conclusion

Promote only a narrow D-011 boundary as M18 normative design:

**Static neutral advanced layout containers over the accepted presentation
forest.**

The restart condition is now satisfied:

1. D-042/M12 established a separate immutable presentation forest whose form
   nodes retain exact identity with `FormDefinition.nodes`.
2. Static sections prove exact-once membership, nesting, deterministic
   diagnostics, atomic fallback, locale-aware labels and projection-only
   behavior without runtime semantics.
3. Angular and Standard independently consume the same normalized forest,
   providing cross-target evidence without shared components or CSS.
4. The application remains the sole owner of complete value/baseline roots,
   scopes, operations, workflow, persistence and definition replacement.
5. The user supplied concrete demand for eventual platform-specific UI
   libraries and selected core/Angular/Standard maturation before React/Vue.

This evidence is enough to design a small static layout family. It is not
enough to promote D-011 wholesale, D-012 scopes, D-018 expressions or D-025
renderer-kit packages.

## 2. Promoted M18 boundary

ADR-023 may design only these presentation-only concepts:

- a static `tabs` container whose direct children are labelled presentation
  panels and whose target-owned view state exposes exactly one active panel;
- a static `accordion` container whose direct children are labelled
  presentation panels and whose target-owned expanded state has no core or
  application-data meaning;
- a static logical `grid` container with deterministic source order, a closed
  finite column/span model and safe one-column target fallback;
- composition of those containers with the accepted root presentation forest,
  static sections and exact presented form-node wrappers;
- immutable normalized definitions, deterministic IDs/keys, descriptor-safe
  input inspection, closed diagnostics and atomic fallback that never drops a
  managed form node;
- locale-aware accessible labels/instructions and deterministic native Angular
  plus private Standard/DOM projections; and
- one neutral catalog scenario and independently maintained reference evidence
  in both shells.

The first slice stays root-presentation-only. A root object or collection
remains an atomic presented form node whose existing host owns descendants.
Containers cannot target nested-object children, collection-item instances or
item templates.

No Public shape is selected by this review. ADR-023 must close the exact grammar,
normalized union, state/fallback rules, diagnostics and ADR-009 migration
inventory before any SPEC is drafted.

## 3. Ownership and state boundary

Layout never changes the managed model:

- active tab and expanded accordion panel are ephemeral target-owned view
  state, not `value`, `baselineValue`, runtime snapshot, operation, issue,
  dirty, touched, focus target or `FormScope`;
- the core compiler/runtime neither stores nor updates layout state;
- selecting or expanding a panel emits no form operation and triggers no
  validation, persistence or baseline mutation;
- the initial state and reset/replacement behavior must be deterministic and
  fixed by ADR-023, but M18 exposes no controlled layout-state API;
- hidden panels retain their managed data, validation and current component/
  binding lifecycle unless the future ADR proves a safer exact rule; and
- wizards, completion gates, next/back actions, URL/deep-link state and saved
  user preferences remain outside M18.

D-012 remains Deferred. A layout panel does not create or register a validation
scope, and UI metadata does not acquire workflow authority.

## 4. UI-library and renderer-kit seam

M18 normalized metadata must remain implementable by native HTML and future
platform UI libraries:

- no Angular/React/Vue component token, CSS class, DOM tag, Material/Prime/MUI
  name, theme token or library breakpoint may appear in core input/output;
- semantic roles, order, labels, logical placement and fallback belong to the
  neutral contract; component selection, markup, animation and concrete theme
  values belong to a target renderer kit;
- Angular and Standard retain independent native projections for M18 and may
  not share presentation components, controller state or styles;
- existing ADR-007 leaf renderer registrations remain unchanged; this review
  does not reinterpret them as container registrations; and
- ADR-023 must identify the minimum future container-renderer responsibilities
  without inventing their provider API.

After ADR-023 is accepted, D-025 receives a separate promotion-readiness review
before SPEC-008 or PLAN-020. If that review passes and is accepted, its
architecture ADR must then be accepted before SPEC-008. That coordinated gate must
decide renderer-kit packaging, theming/token ownership, native fallback,
capability failure, override precedence and support tiers using one concrete
Angular UI-library pilot. It may revise Angular container extension contracts;
it cannot move library concepts into core. If D-025 is not ready or exposes
materially unresolved alternatives, M18 stops after ADR-023 and no SPEC or
implementation plan is prepared.

This ordering prevents M18 from baking an external library into the neutral
model while also preventing implementation around permanently fixed container
hosts before the kit seam is reviewed.

## 5. Grid boundary

The first grid is logical and static:

- it may express only a bounded column count and deterministic child span/
  placement selected by ADR-023;
- source order remains reading, focus and safe fallback order;
- targets must provide a usable one-column collapse, but authored breakpoint
  names, media-query values and per-platform responsive variants are excluded;
- no arbitrary CSS value, class, style object, template area, row masonry,
  drag/drop or runtime measurement enters core; and
- unsupported placement cannot hide or duplicate a form node.

Exact column bounds, span validation, implicit placement, overflow handling and
atomic versus local fallback are material ADR-023 questions, not silently
selected here.

## 6. Tabs and accordion accessibility boundary

ADR-023 and its later SPEC must require target-idiomatic accessible behavior:

- tabs expose an associated tablist, tabs and labelled tabpanels with defined
  arrow/Home/End and activation behavior;
- accordions use labelled disclosure controls with defined expanded state and
  keyboard/focus order;
- hidden/collapsed content cannot become an unreachable source of duplicate
  labels or invalid focus ownership;
- DOM IDs derive collision-free from form and normalized layout identity; and
- target creation failures isolate the affected presentation subtree while
  preserving independent siblings and diagnostics.

This is behavioral accessibility evidence, not certification or a requirement
that every UI library produce identical DOM.

## 7. Explicit exclusions

M18 does not activate:

- wizards, steps, next/back navigation, completion rules or workflow;
- slots, arbitrary templates, actions, commands, submit or persistence;
- D-012 generated/declarative scopes or validation progression;
- D-018 visible/enabled/readonly/required expressions or conditional layout;
- nested-object, per-collection-item or item-template layout;
- runtime-controlled, externally controlled, persisted or deep-linked layout
  state;
- arbitrary responsive breakpoints, design tokens or UI-library metadata;
- D-025 package/entry-point/provider implementation or any external UI
  dependency;
- dynamic `FormDefinition` reconciliation under D-013;
- React, Vue, D-026, legacy Angular, SSR, hydration or portals;
- a new version, release, publication, Stable API or repository/CI mutation.

## 8. Material alternatives

### Promote all remaining D-011 plus D-012

Rejected. Wizards/actions/scopes introduce workflow and runtime authority that
the static presentation evidence does not justify.

### Implement only Angular UI-library components

Rejected. It would make framework/library vocabulary the source of neutral
layout semantics and provide no Standard contrast.

### Promote D-025 and D-011 as one decision

Rejected. Neutral layout grammar and renderer-kit packaging/version support
have different owners and compatibility costs. They are coordinated gates but
remain separate decisions.

### Continue with fixed native hosts and review kits later

Rejected for delivery sequencing. Native hosts remain valid evidence, but the
D-025 seam must be reviewed before SPEC/implementation so M18 does not require
an immediate Public redesign to admit the first official kit.

### Put active tab/expanded panels in the core runtime

Rejected. They are presentation view state and do not belong to controlled
business data, validation snapshots or form operations.

### Share one layout implementation between Angular and Standard

Rejected by ADR-020/021. Sharing normalized definitions and conformance
expectations is allowed; sharing target components, lifecycle or CSS would hide
framework-specific defects.

## 9. Questions ADR-023 must close

1. Exact raw grammar and normalized discriminated union for tabs, accordion,
   grid and their labelled panels/items.
2. Composition rules, global IDs/keys, exact-once node identity, cycles,
   hostile input and depth behavior over the accepted forest.
3. Deterministic initial/interaction/replacement state for tabs and accordion,
   including single versus multiple expansion and hidden-panel lifecycle.
4. Grid column/span bounds, placement, reading order, overflow and safe
   responsive fallback.
5. Closed compiler/manual-definition diagnostics, precedence, atomic/local
   fallback and preservation of every managed node.
6. Text-resolution contexts, accessible semantics, DOM identity, target
   failure isolation and lifecycle cleanup.
7. Exact ADR-009 Public/Internal migration inventory and compatibility with
   current manual definitions, packages and Experimental status.
8. The semantic responsibility surface a later D-025 renderer kit must honor,
   without selecting provider APIs or external dependencies.
9. Angular and Standard projection/conformance requirements and catalog
   evolution without shared UI implementation.

## 10. Cycle 2 complete review

Cycle 2 repeated all twelve areas after every correction:

1. **Demand and sequence:** Pass. The user explicitly selected neutral
   core/Angular/Standard maturation and UI-library portability before later
   framework adapters.
2. **Restart condition:** Pass. Implemented D-042 supplies the separate neutral
   presentation contract absent during review 022.
3. **Accepted authority:** Pass. Exact-once identity, framework neutrality,
   application-owned state and runtime/scope invariants remain authoritative.
4. **Cohesion:** Pass. Tabs, accordion and logical grid are static projection
   containers; workflow, conditions, actions and scopes remain separate.
5. **State ownership:** Pass. View state is target-local and cannot mutate or
   masquerade as controlled form state.
6. **Grid restraint:** Pass. No CSS/library/breakpoint vocabulary enters core;
   reading order and safe collapse are explicit.
7. **Accessibility:** Pass. Required roles, relationships, keyboard behavior,
   focus and failure isolation are design gates without DOM identity claims
   across libraries.
8. **Renderer ownership:** Pass. ADR-007 remains leaf-only and D-025 stays a
   separate coordinated decision before implementation.
9. **Cross-target evidence:** Pass. Angular and Standard prove neutral output
   independently under ADR-020/021.
10. **Public migration:** Pass. No symbol is selected yet; ADR-023 must close
    every Public/Internal change before SPEC preparation.
11. **Deferred boundaries:** Pass. D-012/D-013/D-018/D-025 implementation,
    D-026, later frameworks, release and external work remain inactive.
12. **Delivery gates:** Pass. Acceptance authorizes only ADR-023 drafting and
    review; D-025 review/ADR, SPEC-008 and PLAN-020 retain later gates.

**Result:** zero findings and no unresolved change request.

## 11. Accepted effect

Acceptance:

1. promotes only the section 2 D-011 boundary for M18 architecture design;
2. authorizes drafting and completely reviewing ADR-023;
3. requires a separate D-025 readiness review after ADR-023 and before
   SPEC-008/PLAN-020; a not-ready outcome stops delivery, while a ready outcome
   still requires its own accepted architecture ADR;
4. creates no Public contract, dependency, code, package, implementation,
   version or external action; and
5. leaves every excluded D-011 capability plus D-012/D-013/D-018/D-025
   implementation, React, Vue and legacy Angular Deferred.
