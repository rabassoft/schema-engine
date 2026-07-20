# D-011/M20 nested-object and collection-item static layout promotion-readiness review — Cycles 1–3

- **Date:** 2026-07-19
- **State:** Accepted after cycle 3 under Ricard's explicit selection of the
  recommended next capability and standing zero-finding review authorization
- **Demand:** Continue maturing neutral core behavior through Angular and
  Standard before React/Vue by applying the proven M18 layout model inside
  nested objects and homogeneous object collection items
- **Authority reviewed:** Accepted SPEC-001 through SPEC-008; ADR-009,
  ADR-010, ADR-014, ADR-015, ADR-017, ADR-020, ADR-021, ADR-023 and ADR-024;
  implemented M18/M19; current core/Angular/Standard projection; and Deferred
  D-011/D-012/D-013/D-018/D-025/D-026/D-045
- **Outcome:** Cycle 3 passed all twelve areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                   | Correction                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| R133-F01 | STATUS still requested selection of an unspecified Deferred target after Ricard selected the narrow nested/item D-011 slice.              | Closed selection, recorded M20 as design-only and made ADR-025 the exact next action.                                 |
| R133-F02 | ROADMAP ended at completed M19 and still said that no next capability was active.                                                         | Added the accepted M20 promotion boundary and replaced the stale longer-term next action.                             |
| R133-F03 | D-011 recorded only the completed root-only M18 promotion and still classified all nested/item layout as undifferentiated Deferred work.  | Recorded the accepted M20 design slice while preserving every broader D-011 capability as Deferred.                   |
| R133-F04 | D-012 had no M20 reconciliation and could therefore be read as implicitly activated when layout entered nested/item structural locations. | Stated explicitly that local presentation forests create no scopes and that application-owned scopes remain Deferred. |
| R133-F05 | The architecture-document index had no discoverable record of the new promotion gate.                                                     | Added this review to the acceptance-review index without reserving a link to an ADR that has not yet been drafted.    |

## Cycle 2 finding and correction

| ID       | Finding                                                                                                                          | Correction                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| R133-F06 | The Deferred register's “Próximo trabajo de decisión” still led with completed M19 and omitted the newly selected M20 next gate. | Made M20/ADR-025 the first current decision item, compacted M19/M18 as completed baselines and added the M20 promotion to the register history. |

## 1. Readiness conclusion

Promote only the following remaining D-011 boundary as M20 normative design:

**Static local presentation forests for direct children of nested objects and
homogeneous object collection items.**

The restart condition is satisfied:

1. M9 exposes immutable nested-object definitions, deep controlled paths and
   fixed recursive hosts without giving presentation authority to Angular.
2. M10 separates static item templates from stable application-owned item
   instances and preserves view ownership across item movement by identity.
3. M18 proves the neutral section/tabs/accordion/logical-grid grammar, exact
   presented-node membership, target-owned state, mounted hidden descendants,
   deterministic fallback and independent Angular/Standard projection.
4. M19 published the proven root-only contracts as Experimental; ADR-010
   permits a later reviewed MINOR migration without implying a release here.
5. Current implementation contains explicit unsupported-location gates for
   object and item `presentation`, so promotion extends a deliberate boundary
   instead of relying on accidental behavior.

This evidence supports recursive local composition. It does not support
workflow, actions, conditions, declarative scopes, responsive authoring,
general theming or another framework target.

## 2. Promoted M20 boundary

ADR-025 may design only:

- an optional local presentation forest on a nested `ObjectUiSchema` and on an
  `ItemUiSchema`, recursively including object templates inside an item;
- the already accepted section, tabs, accordion and bounded logical-grid entry
  kinds, with no new presentation kind or member;
- exact-once membership of only the direct data children owned by that local
  object or item template;
- immutable normalized local forests on nested object definitions, nested
  object templates and item-template definitions;
- owner-qualified static keys and target IDs that preserve every existing root
  key/ID while preventing collisions across object paths, collection paths,
  stable item IDs and template-relative paths;
- target-owned tab/accordion state per concrete host instance, including
  deterministic preservation across stable item movement and disposal on item
  removal or complete host replacement;
- scope-local descriptor-safe inspection, diagnostics and atomic fallback that
  cannot remove, duplicate or reorder the underlying normalized child arrays;
- projection through native Angular, the accepted Angular container SPI and
  its Angular Aria pilot, plus an independent Standard implementation; and
- one neutral reference scenario proving nested objects, repeated collection
  items and movement without sharing target implementation.

An object or item forest may name only its direct editable children. A named
object or collection remains atomic in its parent's forest and owns its own
optional child forest. Item identity, collection label/actions/issues, item
label/actions/issues and object label/supporting text/issues remain fixed host
content outside the forest; M20 does not turn them into slots or actions.

No Public shape is selected by this review. ADR-025 must close the exact raw,
normalized and Angular migration before any SPEC is drafted.

## 3. Data, runtime and scope ownership

M20 layout remains projection-only:

- `value` and `baselineValue` stay wholly application-owned;
- normalized node/template child arrays remain the data-structure authority;
- runtime snapshots continue to mirror data nodes/items, never containers;
- validation input, issue ownership, dirty/touched/focused state and every
  operation remain unchanged;
- a local forest cannot reference an ancestor, sibling owner, collection item
  ID or arbitrary data path;
- hidden/collapsed descendants remain mounted, reconciled and validated; and
- no forest, container or panel creates a `FormScope` or workflow step.

D-012 and D-018 remain Deferred. Application-owned scopes may continue to
select data paths independently of layout, but layout cannot generate, narrow,
persist or sequence them.

## 4. Local grammar, exact-once membership and fallback

The design shall retain the accepted M18 entry grammar and add only structural
locations. Each local forest has one direct owner and one local node namespace:

- nested object forest: that object's direct `children`;
- item-root forest: the item template's direct editable `children`; and
- object-template forest: that nested template object's direct `children`.

Names never cross one of these ownership boundaries. A local `order` and local
`presentation` cannot both be active. Absent layout retains current ordered
children. Invalid authored layout must emit every safely collectible warning
and fall back atomically only for that owner, using its accepted local order;
independent root, object and template forests remain intact.

Container IDs need be unique within one local forest, including nested
containers in that forest, not across unrelated object/item owners. ADR-025
must define owner-qualified normalized keys and diagnostic identity so this
local namespace cannot collide in text resolution, manual definitions or DOM.
The existing root forest's exact key and ID formulas remain unchanged.

## 5. Collection-instance state and lifecycle

One item-template forest is static and is reused by every valid controlled item
instance. Projection state is nevertheless instance-local:

- each item starts with the accepted first-tab/all-accordion-collapsed state;
- moving an item preserves its host, container state, field buffers and focus
  ownership because the view tracks stable application item identity;
- value, baseline, validation, locale and retained-snapshot updates do not
  reset layout state;
- removing an item destroys its complete local presentation subtree exactly
  once; a later insertion is a new host even if the same opaque ID is reused;
- identity-invalid collections expose no item descendants and therefore no
  item presentation hosts; and
- the static normalized definition never contains a runtime item ID or index.

Target IDs must combine the static owner/container identity with the concrete
stable item ID. Positional collection indexes cannot identify containers,
panels or state.

## 6. Angular SPI, pilot and Standard boundary

M20 shall reuse, not duplicate, the accepted presentation-container domain:

- sections/tabs/accordion/grid remain the only resolvable kinds;
- testers still receive only exact immutable normalized container definitions;
- external renderers still receive no raw schema, snapshot, runtime,
  application mutation or item-address authority;
- Public entry/panel outlets remain the sole child-projection mechanism, but
  ADR-025 must decide the minimum type migration needed for template entries;
- the Internal scoped projection context may carry object/item ownership and
  stable addressing needed to bind existing node outlets and generate IDs;
- mandatory native registrations and selected-host failure behavior remain;
- the Angular Aria pilot must prove the same nested/item semantics if M20 later
  reaches implementation; it cannot be silently excluded or replaced; and
- Standard must implement the same behavior directly from core contracts,
  without importing Angular, the SPI, pilot components, controller state or
  CSS.

No renderer-kit registration, token, dependency, style property or support
tier is added. D-025's broader theming work and D-026 remain Deferred.

## 7. Diagnostics, identity and manual definitions

ADR-025 and the later SPEC must close:

1. exact UI paths and owner data/template paths for every local defect;
2. whether current `unsupported-location` becomes valid only at object/item
   structural locations and remains closed for arrays and leaves;
3. owner-local duplicate IDs, cycles, sparse/accessor input and complete
   scope-local fallback ordering;
4. required normalized local forests and exact identity with direct
   child/template objects;
5. iterative manual-definition validation with deterministic owner paths and
   no validator/operation invocation after a defect;
6. qualified normalized keys, text-resolution identity and exact DOM bases;
7. nearest host-failure ownership and exact-once cleanup for nested and item
   projections; and
8. compatibility fixtures for hostile names, paths, item IDs, repeated
   templates and multiple forms.

No diagnostic reason or Public type is chosen here. Reusing a reason with a
changed parameter/path contract versus adding a closed local-owner reason is an
ADR/SPEC decision, not an implementation shortcut.

## 8. Public migration and compatibility gate

M20 necessarily changes Public Experimental core definitions because local
forests must be authored and normalized. It may also widen Public Experimental
Angular container/outlet types so the same SPI can project template children.
ADR-025 must provide a complete ADR-009 inventory covering at least:

- optional raw object/item UI members;
- required normalized object/item-template presentation members;
- recursive presentation types or parallel template-entry contracts;
- compiler diagnostics/fallback and manual-definition validation;
- text/identity changes, if any; and
- Angular SPI/outlet declaration changes plus Internal host-context changes.

The preferred design is one generic recursive presentation model with a
source-compatible root default and an explicit template specialization, rather
than weakening every root `form-node` wrapper to an unqualified node/template
union or duplicating the complete container family. ADR-025 must prove that
choice against generated declarations and external renderer ergonomics.

Because the affected APIs are Public + Experimental, any incompatible shipped
change requires at least a future MINOR under ADR-010 with migration notes.
This review selects no version, candidate, release or publication.

## 9. Explicit exclusions

M20 does not activate:

- wizards, steps, workflow, next/back progression or completion rules;
- actions, commands, slots, arbitrary templates, submit or persistence;
- D-012 scopes or D-018 conditions/visibility/readonly expressions;
- presentation on an array host itself, primitive leaves, identity fields or
  collection/item action and issue regions;
- cross-owner path references, conditional/repeated layout definitions or
  runtime-generated forests;
- controlled, persisted, deep-linked or application-synchronized layout state;
- arbitrary rows, coordinates, areas, gaps, alignment, CSS, class names,
  breakpoints or target-specific metadata;
- broader D-025 tokens/themes, another renderer kit or another UI dependency;
- dynamic definition reconciliation under D-013;
- React, Vue, D-026, legacy Angular, SSR, hydration or portals;
- a new package/entry point, Stable promotion, version, release, publication,
  repository visibility, Git action or registry action; or
- SPEC-009, an implementation plan or code before all later gates pass.

## 10. Material alternatives for ADR-025

### One local forest per structural owner — recommended

The object/item UI node owns a forest over direct children. This preserves
exact-once local membership, hierarchical host ownership and deterministic
fallback while allowing recursive composition.

### One global root forest with deep path references

Rejected for M20. It would mix layout with managed addressing, collection
instance identity and cross-owner validation, and would make one malformed
deep reference capable of invalidating unrelated root layout.

### Duplicate the complete presentation model for item templates

Not preferred. It avoids a generic migration but doubles every container,
diagnostic, SPI and renderer contract. ADR-025 may select it only if declaration
evidence shows a generic specialization cannot preserve type safety.

### Treat each item instance as a dynamic core presentation definition

Rejected. Item IDs and positions belong to controlled runtime instances, while
the authored layout is one immutable static template. Per-instance core
definitions would activate dynamic definitions and layout state.

### Arrange item action/issue regions as presentation entries

Rejected. It would introduce slots/actions and give UI Schema control over
fixed collection behavior outside the promoted slice.

## 11. Questions ADR-025 must close

1. Exact optional authoring members on object and item UI schemas and their
   local `order` conflict/precedence.
2. Generic specialization versus another minimal type model for root nodes and
   item templates, including required normalized members.
3. Owner identity, namespace, key and DOM-ID formulas for root, nested object,
   template object and concrete stable item instances.
4. Scope-local exact-once validation, diagnostic paths/order and atomic
   fallback without altering underlying child arrays.
5. Text-resolution identity and whether any context must widen beyond a
   qualified immutable presentation definition.
6. Angular entry/panel outlet and Internal host-context migration while
   preserving external renderer isolation and native fallback.
7. Item movement/removal/reinsertion, identity-invalid state, focus, mounted
   descendants and exact-once destruction.
8. Standard/native/Aria conformance and the complete ADR-009/ADR-010 migration
   evidence without selecting a release.

## 12. Cycle 3 complete review

Cycle 3 repeated all twelve areas after every correction:

1. **Demand and sequence:** Pass. Ricard explicitly selected the recommended
   nested/item slice before React/Vue.
2. **Restart condition:** Pass. M9/M10 provide recursive/static ownership and
   M18 supplies an implemented neutral layout contract.
3. **Accepted authority:** Pass. SPEC-002/003 structural and stable-identity
   rules remain authoritative; SPEC-008 stays root-only until a later SPEC.
4. **Cohesion:** Pass. One local-forest concept covers objects and item
   templates without importing workflow, actions or conditions.
5. **Data/runtime ownership:** Pass. Nodes/templates remain authoritative and
   layout adds no value, snapshot, operation, validation or scope semantics.
6. **Collection lifecycle:** Pass. Static templates and stable instance-owned
   state are separated; movement, removal and invalid identity are gated.
7. **Identity/fallback:** Pass. Owner-local exact-once membership and fallback
   are required while exact formulas remain ADR questions.
8. **Renderer boundary:** Pass. The existing Angular SPI is reused with
   Internal addressing; native, Aria and Standard evidence remain mandatory.
9. **Accessibility/lifecycle:** Pass. M18 mounted-state, keyboard, focus,
   failure and cleanup behavior remains the baseline in every local host.
10. **Public compatibility:** Pass. Every raw/normalized/Angular migration is
    deferred to ADR-025 and at least a future MINOR; no contract is silently
    selected here.
11. **Deferred boundaries:** Pass. D-012/D-013/D-018/broader D-025/D-026,
    later frameworks, legacy Angular and release work remain inactive.
12. **Delivery gates:** Pass. Acceptance authorizes only ADR-025 drafting and
    complete review, with no SPEC, plan, code, Git or external action.

**Result:** zero findings and no unresolved change request.

## 13. Accepted effect

Acceptance:

1. promotes only the section 2 D-011 boundary for M20 architecture design;
2. assigns the next global decision identifier, ADR-025, to the recursive
   local presentation-forest architecture when that document is drafted;
3. authorizes drafting and completely reviewing ADR-025 only;
4. preserves SPEC-008 as the current implemented root-only contract until a
   later accepted extension SPEC explicitly replaces the relevant exclusions;
5. creates no Public contract, implementation, dependency, package, version,
   release, Git or external action; and
6. leaves every excluded capability and framework target Deferred.
