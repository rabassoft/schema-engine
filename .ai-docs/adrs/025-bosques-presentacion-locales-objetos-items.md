# ADR 025: Recursive local presentation forests for nested objects and collection items

- **Status:** Accepted
- **Date:** 19 July 2026
- **Acceptance date:** 19 July 2026
- **Revision:** 0
- **Milestone:** M20 — static local nested-object and collection-item layout
- **Promotes:** only the D-011 boundary accepted by
  [`review 133`](../reviews/133-d011-m20-nested-item-layout-promotion-readiness.md)
- **Requires:** accepted [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-010`](./010-versionado-semver-compatibilidad.md),
  [`ADR-014`](./014-modelo-objetos-anidados-paths-profundos.md),
  [`ADR-015`](./015-modelo-colecciones-identidad-operaciones.md),
  [`ADR-017`](./017-grupos-presentacion-estaticos.md),
  [`ADR-020`](./020-plataforma-referencia-multiframework.md),
  [`ADR-021`](./021-shell-standard-dom-core-directo.md),
  [`ADR-023`](./023-contenedores-layout-neutral-estatico.md),
  [`ADR-024`](./024-spi-contenedores-angular-y-piloto-angular-aria.md) and
  [`SPEC-008 v0.1.0`](../specs/008-static-advanced-presentation-layout.md)
- **Complete review:** [`review 134`](../reviews/134-adr-025-review.md) cycle 4
  passed all thirteen areas with zero findings
- **Acceptance effect:** authorizes only SPEC-009 preparation and complete
  review; no plan, implementation, dependency, version, release, Git or
  external action
- **Implemented by:** completed PLAN-022 revision 0 after final review 144
  cycle 3 passed all 27 SPEC-009 rows with zero findings

## 1. Context

M9 and M10 established recursive object definitions and static homogeneous
object-item templates. Their Angular and Standard projections currently render
each owner’s direct children in normalized order through fixed object/item
hosts. M18 independently established an immutable presentation forest with
sections, tabs, accordion and bounded logical grid, but deliberately admitted
that forest only at the form root.

Review 133 promotes the next narrow D-011 step: reuse the proven static layout
family inside nested objects and collection items without introducing another
container grammar, paths across structural owners, dynamic definitions,
workflow, actions, conditions or scopes.

The existing root contracts are Public + Experimental and published. The new
design must preserve their source meaning while representing both ordinary
`FormNodeDefinition` children and static `FormNodeTemplate` children safely.
The same Angular container SPI and Angular Aria pilot must remain usable; a
parallel registry or item-specific renderer family would duplicate semantics
and make future framework ports harder.

## 2. Decision summary

Every supported structural owner may have one immutable local presentation
forest over its direct editable children:

1. `FormDefinition.presentation` remains the root forest;
2. every `ObjectFieldDefinition` gains a required forest over its direct
   `children`;
3. every `ObjectItemTemplateDefinition` gains a required item-root forest over
   its direct editable `children`; and
4. every nested `ObjectNodeTemplate` gains a required forest over its own
   direct `children`.

Raw `presentation` becomes optional on `ObjectUiSchema` and `ItemUiSchema`.
The accepted entry grammar is reused unchanged. Each forest has owner-local
membership, ID uniqueness and atomic fallback. A child object or collection is
one atomic entry in its parent forest and owns its own independent child forest.

The normalized presentation family becomes generic with a source-compatible
default of `FormNodeDefinition` and one explicit template specialization.
Core keys identify the static owner; target IDs additionally identify the
concrete stable item instance where applicable. The accepted Angular SPI is
widened to both specializations, while all owner/snapshot/item addressing stays
in its Internal scoped context.

## 3. Raw UI Schema grammar

### 3.1 Public authoring contracts

Core widens only these existing Public + Experimental interfaces:

```ts
export interface ObjectUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
  readonly presentation?: readonly UiPresentationEntry[];
}

export interface ItemUiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
  readonly presentation?: readonly UiPresentationEntry[];
}
```

`UiPresentationEntry`, `UiSectionSchema`, `UiTabsSchema`,
`UiAccordionSchema`, `UiPresentationPanelSchema`, `UiGridSchema` and
`UiGridItemSchema` retain their exact SPEC-008 shapes and member meanings. No
new entry kind, layout member or path expression is added.

`presentation` remains unsupported on `ArrayUiSchema`, `FieldUiSchema` and an
identity-property UI entry. An array node is one atomic child in its containing
object forest; its `item.presentation` owns item children. A primitive leaf is
always an atomic named entry.

### 3.2 Direct-owner membership

Each forest may name only direct children of its owner:

| Forest owner              | Exact eligible names                      |
| ------------------------- | ----------------------------------------- |
| root `UiSchema`           | direct `FormDefinition.nodes` names       |
| nested `ObjectUiSchema`   | that `ObjectFieldDefinition.children` set |
| root `ItemUiSchema`       | direct editable item-template child names |
| template `ObjectUiSchema` | that `ObjectNodeTemplate.children` set    |

Every eligible child occurs exactly once after flattening sections, panels and
grid items. Names never resolve to descendants, ancestors, siblings belonging
to another owner, collection item IDs, array indexes or arbitrary data paths.
Identity properties are not editable template children and cannot be named.

One child object or array remains atomic in its parent forest. Its own label,
description, hint, tooltip and issues stay fixed content of its existing host;
only its direct descendant region uses its local forest. The item legend,
remove/move actions and item issues likewise remain fixed before the item-root
forest and cannot become entries, slots or commands.

### 3.3 Order conflict and defaults

At every owner, `order` and `presentation` are mutually exclusive ordering
authorities. If both are present, presentation is invalid and `order` still
determines the normalized child array and default fallback forest, matching the
accepted root rule.

When presentation is absent, the owner receives one frozen `form-node` wrapper
per normalized direct child in that child array's order. When presentation is
valid, it may reorder projection without mutating that array. When invalid, the
complete authored forest for only that owner is discarded and replaced by the
same local default; independent root, object and template forests remain
unchanged.

## 4. Generic normalized contracts

### 4.1 Source-compatible recursive model

The Public + Experimental presentation contracts become generic. Every type
parameter defaults to the current root-node domain, so existing unparameterized
source retains its current meaning:

```ts
export type PresentationEntryDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> =
  | PresentedFormNodeDefinition<TNode>
  | PresentationSectionDefinition<TNode>
  | PresentationTabsDefinition<TNode>
  | PresentationAccordionDefinition<TNode>
  | PresentationGridDefinition<TNode>;

export interface PresentedFormNodeDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'form-node';
  readonly node: TNode;
}

export interface PresentationSectionDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'section';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly children: readonly PresentationEntryDefinition<TNode>[];
}

export interface PresentationTabsDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'tabs';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly panels: readonly PresentationPanelDefinition<TNode>[];
}

export interface PresentationAccordionDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'accordion';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly panels: readonly PresentationPanelDefinition<TNode>[];
}

export interface PresentationPanelDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'panel';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly children: readonly PresentationEntryDefinition<TNode>[];
}

export interface PresentationGridDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'grid';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly columns: 1 | 2 | 3 | 4;
  readonly items: readonly PresentationGridItemDefinition<TNode>[];
}

export interface PresentationGridItemDefinition<
  TNode extends FormNodeDefinition | FormNodeTemplate = FormNodeDefinition,
> {
  readonly kind: 'grid-item';
  readonly key: string;
  readonly span: 1 | 2 | 3 | 4;
  readonly child: PresentationEntryDefinition<TNode>;
}

export type TemplatePresentationEntryDefinition =
  PresentationEntryDefinition<FormNodeTemplate>;
```

`TemplatePresentationEntryDefinition` is the sole new named Public core export.
Using one generic family avoids weakening every root wrapper to an unchecked
node/template union and avoids duplicating the complete container grammar.

### 4.2 Required owner forests

The normalized structural contracts widen exactly as follows:

```ts
export interface ObjectFieldDefinition extends BaseNodeDefinition {
  readonly kind: 'object';
  readonly children: readonly FormNodeDefinition[];
  readonly presentation: readonly PresentationEntryDefinition[];
}

export interface ObjectNodeTemplate extends BaseNodeTemplate {
  readonly kind: 'object';
  readonly children: readonly FormNodeTemplate[];
  readonly presentation: readonly TemplatePresentationEntryDefinition[];
}

export interface ObjectItemTemplateDefinition {
  readonly kind: 'item-template';
  readonly children: readonly FormNodeTemplate[];
  readonly fields: readonly FieldTemplate[];
  readonly presentation: readonly TemplatePresentationEntryDefinition[];
}
```

`FormDefinition.presentation` retains
`readonly PresentationEntryDefinition[]`. Primitive fields and array nodes gain
no presentation member; the array owns one item-template definition that owns
its item-root forest.

Every forest, wrapper, container, panel, grid item and array is deeply frozen.
Flattening a forest yields the exact direct child objects in its owner's
`children` array, each once. Item forests wrap the exact static
`FormNodeTemplate` objects shared by every item instance; no item ID, index,
snapshot or controlled value enters the normalized definition.

## 5. Static owner identity and normalized keys

### 5.1 Owner tuples

The compiler derives one immutable conceptual tuple for every non-root owner:

```ts
objectOwner = ['object', object.path];
itemOwner = ['item-template', collection.path];
templateObjectOwner = [
  'item-template-object',
  collection.path,
  object.relativePath,
];
```

The paths in these tuples are the exact frozen normalized paths. They are
structural static identity, not runtime addresses.

### 5.2 Key formulas

All existing root keys remain byte-for-byte unchanged. Local keys are exactly:

```ts
section.key === JSON.stringify(['presentation', owner, 'section', section.id]);

container.key ===
  JSON.stringify(['presentation', owner, container.kind, container.id]);

panel.key ===
  JSON.stringify([
    'presentation',
    owner,
    container.kind,
    container.id,
    'panel',
    panel.id,
  ]);

gridItem.key ===
  JSON.stringify(['presentation', owner, 'grid', grid.id, 'item', itemIndex]);
```

`owner` is embedded as the complete tuple, not its serialized string. IDs for
sections/tabs/accordion/grid share one namespace across a complete local forest
and may repeat in an unrelated owner forest. Panel IDs remain unique only in
their direct tabs/accordion owner. Grid-item indexes remain definition-local
and non-persistent.

Qualified keys make otherwise identical local IDs unambiguous to text
resolution, diagnostics, manual-definition validation and external container
testers. They do not create a runtime lookup or Public owner contract.

## 6. Inspection, diagnostics and local fallback

### 6.1 Descriptor-safe traversal

Inspection reuses SPEC-008's iterative, own-enumerable-data-descriptor rules,
closed entry grammar, active-ancestry cycle detection and unknown-key policy.
The compiler never executes accessors and retains no caller object.

Object UI traversal inserts local presentation inspection after that owner's
accepted `order` entries and before descendant `fields`. Item UI traversal uses
`order`, then presentation, then descendant fields. With presentation absent,
all existing diagnostic ordering is unchanged.

An object or item `presentation` uses the existing
`INVALID_UI_PRESENTATION` reason vocabulary. Root diagnostics retain their
exact current shapes. A local presentation diagnostic additionally carries:

- `dataPath`: the object path, or the owning collection path for item/template
  owners; and
- `parameters.templatePath`: absent for ordinary objects, `[]` for the
  item-root forest, or the exact relative object-template path.

The existing reason-specific parameters remain otherwise unchanged. Array
`presentation` retains `unsupported-location` with `nodeKind: 'array'`.
Primitive and identity UI entries continue through the accepted unknown or
identity-incompatible UI-member policy and never become presentation owners.

One or more presentation warnings invalidate only that owner's forest. Safe
siblings and descendant UI inspection continue. The compiler applies local
fallback when no unrelated blocking schema/UI error prevents the definition.
No defect can partially retain a container, remove a child or invalidate an
independent owner's forest.

### 6.2 Manual-definition validation

Runtime creation and `applyFormOperation()` validate every required forest
iteratively with the existing closed presentation reasons. At each owner they
require exact generic discriminants, key formulas, dense arrays, IDs, spans,
cycles and exact direct-child object identity. A root forest may wrap only
members of `FormDefinition.nodes`; an object forest only that object's direct
children; and an item/template-object forest only its exact direct templates.

The existing numeric `presentationIndexPath` remains local to the selected
forest. For a non-root defect, both existing envelopes add:

```ts
{
  presentationOwnerKind: 'object' | 'item' | 'template-object';
  presentationOwnerPath: readonly string[];
  presentationTemplatePath?: readonly string[];
}
```

`presentationOwnerPath` is the ordinary object path or owning collection path.
`presentationTemplatePath` is present only for item/template owners and is `[]`
for the item root. All arrays are frozen copies. Root failures omit these
members and preserve their exact current parameters.

The first definition defect remains deterministic and prevents validator,
operation or target invocation. No new manual-definition reason is added;
owner context plus the local index path identifies the failing forest exactly.

## 7. Text resolution

The existing text-context shapes gain no owner path, item ID, snapshot or new
member. Their normalized definition domains widen to the same generic node
union so template containers are type-safe:

```ts
export interface SectionTextResolutionContext {
  readonly formId: string;
  readonly locale: string;
  readonly section: PresentationSectionDefinition<
    FormNodeDefinition | FormNodeTemplate
  >;
  readonly member: 'label';
}

export type AdvancedPresentationLabelDefinition =
  | PresentationTabsDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationAccordionDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationPanelDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationGridDefinition<FormNodeDefinition | FormNodeTemplate>;

export interface AdvancedPresentationTextResolutionContext {
  readonly formId: string;
  readonly locale: string;
  readonly presentation: AdvancedPresentationLabelDefinition;
  readonly member: 'label';
}
```

`TextResolutionContext` and `TextResolver.resolve()` widen transitively only by
those definition domains. Qualified normalized keys identify each static local
labelled definition; item IDs and positions do not enter resolver contexts.

Within one form projection, Angular resolves a labelled presentation
definition at most once per exact normalized object, `formId` and locale. Every
item instance sharing a template reuses that resolved source/fallback result.
A failure therefore emits one accepted text diagnostic for that static
definition and locale, not one per controlled item. Locale change may resolve
once again; value, baseline, validation, item movement or insertion does not.

Advanced-container text failures already expose the qualified
`presentationKey`. A local section text failure retains the accepted
`sectionId` and additionally exposes `sectionKey: section.key`; root section
failures omit `sectionKey` and preserve their current exact parameters. This
makes owner-local section IDs diagnosable without adding runtime instance data.

Resolution order is depth-first owner projection order. A collection reaches
its item-root template forest at the first valid item; later instances reuse
the result. A collection with no valid items does not project or resolve that
forest until the first valid item appears. This changes no field, object,
collection or item-action text context.

Standard independently implements the same static-label cache and source
fallback without invoking or claiming Angular's resolver service.

## 8. Concrete instance identity, state and lifecycle

### 8.1 Owner-instance tuples

Targets derive one concrete owner tuple:

```ts
objectInstance = ['object', object.path];
itemInstance = ['item', collection.path, itemId];
templateObjectInstance = [
  'item-object',
  collection.path,
  itemId,
  object.relativePath,
];
```

`itemId` is the exact already-validated application identity. No collection
index participates.

### 8.2 Local DOM bases

All root bases and suffixes remain unchanged. Local bases are exactly:

```ts
containerBase = `se-${encodeURIComponent(
  JSON.stringify([
    formId,
    'presentation',
    ownerInstance,
    container.kind,
    container.id,
  ]),
)}`;

panelBase = `se-${encodeURIComponent(
  JSON.stringify([
    formId,
    'presentation',
    ownerInstance,
    owner.kind,
    owner.id,
    'panel',
    panel.id,
  ]),
)}`;

gridItemBase = `se-${encodeURIComponent(
  JSON.stringify([
    formId,
    'presentation',
    ownerInstance,
    'grid',
    grid.id,
    'item',
    itemIndex,
  ]),
)}`;

sectionBase = `se-${encodeURIComponent(
  JSON.stringify([
    formId,
    'presentation',
    ownerInstance,
    'section',
    section.id,
  ]),
)}`;
```

The accepted role suffixes and relationships remain exact. These tuples are
collision-free across forms, ordinary objects, collections, stable items,
template objects, container kinds, panels and grid items.

### 8.3 State retention and disposal

Every concrete tabs/accordion host owns the same initial and interaction state
accepted by SPEC-008. Nested ordinary-object state survives retained snapshot,
locale, validation and application value/baseline updates. Item-local state is
owned per stable item host:

- movement preserves the view, field buffers, focus and layout state;
- insertion creates fresh first-tab/all-collapsed state;
- removal destroys the complete subtree and its state exactly once;
- reinsertion after observed removal creates a new host even if the same opaque
  ID is later reused;
- identity-invalid collections expose no item presentation hosts; and
- complete form/owner host replacement discards state.

Inactive tab and collapsed accordion descendants remain mounted, reconcile
confirmed snapshots, remain validated and retain exact-once destruction.
Layout never changes collection operations or focus-recovery rules; the
existing item/collection host remains the nearest owner of those behaviors.

## 9. Angular container SPI migration

### 9.1 Widened node domain

The same Public + Experimental SPI accepts ordinary definitions and templates.
No new provider or registry is created. Existing Angular aliases and render
model members widen their generic arguments to
`FormNodeDefinition | FormNodeTemplate`, for example:

```ts
export type AngularPresentationContainerDefinition =
  | PresentationSectionDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationTabsDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationAccordionDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationGridDefinition<FormNodeDefinition | FormNodeTemplate>;

// SchemaPresentationEntryOutletComponent
readonly entry: InputSignal<
  PresentationEntryDefinition<FormNodeDefinition | FormNodeTemplate>
>;

// SchemaPresentationPanelOutletComponent
readonly panel: InputSignal<
  PresentationPanelDefinition<FormNodeDefinition | FormNodeTemplate>
>;
```

Every corresponding `definition`, `panels`, `items` and tester parameter in
`AngularPresentationContainerRenderModel`,
`AngularPresentationContainerTester` and
`AngularPresentationContainerRenderer` follows that same widened domain.
Names, registration shapes, rank/priority/order and provider-configuration
diagnostics remain unchanged. Selection/tester codes and their accepted base
parameters remain, with only the local owner context specified in section 9.3.

This is an incompatible Public Experimental type migration requiring at least
a future MINOR under ADR-010 and migration notes. Existing root definitions
remain valid members of the widened domain.

### 9.2 Internal scoped context

The adapter's Internal container-host context adds only what existing node
outlets need to project the exact owner instance:

- the owner kind and static normalized owner identity;
- for template forests, the current stable `CollectionNodeAddress` base;
- the exact owner definition/snapshot pair; and
- Internal ID, text-cache, claim, diagnostic and cleanup services.

None becomes Public. External renderers still receive only the frozen render
model, and testers still receive only the frozen normalized container. They do
not receive raw schema/UI Schema, runtime snapshots, current value/baseline,
item index/ID, application operations, text resolver, diagnostic channel or
host factory.

Entry/panel outlets claim exact generic definition objects and obtain the
current owner instance from that Internal context. Foreign, duplicate,
conditional and missing claims retain the accepted nearest-host failure and
cleanup behavior.

### 9.3 Native and Angular Aria behavior

Mandatory native registrations remain universal fallback. The existing Angular
Aria package registers the same four kinds and must project local forests
without a new export, peer, stylesheet or property. Its tabs use the accepted
Aria behavior; section, accordion and grid retain their accepted selective
native composition.

Host/tester diagnostics for a local concrete instance retain their accepted
codes and base parameters and additionally include the same
`presentationOwnerKind`, `presentationOwnerPath`, optional
`presentationTemplatePath` and optional exact safe `itemId` used by the
Internal context. Root diagnostics omit these additions. No thrown, snapshot,
value or definition object is retained.

## 10. Standard and reference evidence

The private Standard renderer consumes the generic normalized forests directly
from core and preserves its independent implementation boundary. It adds local
render recursion and stable item-owner reconciliation without importing
Angular, the container SPI, Angular Aria, target state, DOM helpers or CSS from
another shell.

One new neutral catalog scenario composes:

- a nested ordinary object with local section/tabs/grid;
- a homogeneous collection whose item-root forest uses tabs/accordion;
- a nested object template with its own local grid; and
- at least two stable items that move while retaining independent layout state.

Angular native, Angular Aria and Standard consume the exact same authored
scenario. Evidence is semantically equivalent, not pixel-identical. Existing
fixed labels/actions/issues remain visibly outside local forests. Reference
apps remain private and absent from artifacts.

## 11. Runtime, application and Deferred boundaries

Core runtime validates all normalized forests and otherwise ignores them.
There is no change to snapshots, runtime methods, validators, validation input,
operations, scopes, issue assignment, dirty/touched/focused state, controlled
value/baseline ownership or structural sharing.

Local presentation cannot:

- generate or constrain a `FormScope`;
- hide a node from validation or issue ownership;
- reference a path or item dynamically;
- imply a workflow, step, completion rule or action;
- persist or synchronize selected/expanded state; or
- reconcile a replacement `FormDefinition`.

D-012, D-013, D-018, broader D-025, D-026 and D-045 remain Deferred.

## 12. Public/Internal migration inventory

Under ADR-009, a later SPEC may define only this migration:

| Classification         | Exact effect                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `TemplatePresentationEntryDefinition`.                                                                                                                                                                                                                                                                                                                                                                                            |
| Changed Public core    | Optional `ObjectUiSchema.presentation` and `ItemUiSchema.presentation`; generic defaulted presentation entry/container/panel/grid-item contracts; required `ObjectFieldDefinition.presentation`, `ObjectNodeTemplate.presentation` and `ObjectItemTemplateDefinition.presentation`; widened section/advanced text-definition domains and transitive `TextResolutionContext`; compiler diagnostics/fallback and manual validation. |
| Changed Public Angular | Widened container definition/render-model/tester and entry/panel outlet generic domains; native projection of local forests.                                                                                                                                                                                                                                                                                                      |
| Internal base Angular  | Owner-instance context, stable template addressing, qualified IDs, shared static-label cache, host plumbing, local diagnostic context and cleanup.                                                                                                                                                                                                                                                                                |
| Changed pilot behavior | Existing four registrations project local forests and item instances with no new Public symbol/style.                                                                                                                                                                                                                                                                                                                             |
| Private Standard/apps  | Independent recursive local projection, static-label caching, stable item state and one shared catalog scenario/evidence.                                                                                                                                                                                                                                                                                                         |
| Unchanged              | Raw entry kinds/members, root key/ID formulas, data definitions other than the three required forest members, snapshots/methods, operations, scopes, validation, leaf registry, package entry points/dependencies, CSS properties, support ranges, versions and publication.                                                                                                                                                      |

All changes remain Public + Experimental + Active where exported. No new entry
point or package is added. The later SPEC must reproduce the exact transitive
declaration inventory and migration examples before a plan may be prepared.

## 13. Compatibility and delivery gates

The generic defaults preserve the source meaning of unparameterized root
presentation types, but required normalized owner members and widened Angular
SPI inputs are incompatible Experimental changes. ADR-010 therefore requires
at least a future MINOR for each affected published package and migration notes.
This ADR does not select `0.4.0`, a pilot version, peers, tags or a release.

SPEC-009 must be accepted after a repeated complete review before any plan is
prepared. A later approved plan must separately gate implementation,
declarations, package consumers, version selection and any release. No Git,
registry, repository or external action is authorized by this decision.

## 14. Consequences

### Positive

- One proven neutral grammar composes recursively without path references or a
  second container family.
- Generic defaults preserve current root type meaning while templates remain
  statically distinguishable.
- Owner-local namespaces make authoring practical; qualified keys and concrete
  item IDs keep runtime projection collision-free.
- Stable item movement preserves independent layout and field state without
  moving that state into core.
- Existing native, Aria and Standard seams must prove portability before later
  frameworks are introduced.

### Negative

- Core and Angular Public Experimental declarations widen again.
- Every manual object/item-template definition must add a required default
  forest.
- Generic presentation declarations are more complex for external container
  authors.
- Static template label caching and contextual host diagnostics add Internal
  adapter machinery.
- Native, Aria and Standard require repeated conformance across more owner
  contexts.

## 15. Alternatives considered

### One global forest with deep paths

Rejected because it would mix presentation with managed addressing, make item
instances ambiguous and allow one deep defect to invalidate unrelated owners.

### Widen every wrapper to an unparameterized node/template union

Rejected because root consumers would lose the guarantee that an
unparameterized `PresentationEntryDefinition` wraps only
`FormNodeDefinition`. Defaulted generics preserve that guarantee.

### Duplicate template-specific containers

Rejected because it would double section/tabs/accordion/grid, diagnostics, SPI
and renderer contracts while preserving identical behavior.

### Put layout directly on `ArrayUiSchema`

Rejected because array-host text, issues and item instances are not direct
editable children. The item template is the static owner of editable item
descendants.

### Expose item address to external container renderers

Rejected because child outlets can bind through the Internal scoped context.
Exposing addresses would permit renderer selection/behavior to depend on
controlled instances and weaken the static normalized boundary.

### Resolve presentation labels independently per item

Rejected because every call would receive the same static context, duplicate
failure diagnostics and allow incidental instance count to affect observable
resolver behavior.

### Exclude the Angular Aria pilot from M20

Rejected because it is an official Public Experimental implementation of the
same accepted SPI. Native-only success would hide a transitive compatibility
break in an already published package.

## 16. Explicit exclusions

ADR-025 does not activate:

- new presentation kinds, wizards, steps, workflow or completion rules;
- actions, commands, slots, arbitrary templates, submit or persistence;
- declarative scopes, conditional layout or visible/enabled/readonly rules;
- presentation on array hosts, primitive leaves, identity fields, item actions
  or issue regions;
- cross-owner/path references, dynamic/repeated definitions or item-specific
  authored layout;
- controlled/persisted/deep-linked layout state;
- arbitrary grid geometry, CSS/classes, breakpoints or target metadata;
- generic design tokens, shared CSS, another renderer kit or UI dependency;
- React, Vue, legacy Angular, SSR, hydration or portals;
- Stable promotion, package/version/release selection or publication; or
- SPEC-009, a plan, implementation, Git or external action before later gates.

## 17. Required review before acceptance

Review must repeat after every correction until one complete cycle has zero
findings. It must verify:

1. promotion authority and strict M20/D-011 boundary;
2. raw object/item grammar and direct-owner exact-once membership;
3. generic source-compatible contracts and required normalized forests;
4. owner namespaces, exact keys and root compatibility;
5. descriptor safety, diagnostics, manual validation and local fallback;
6. static text resolution and repeated-item behavior;
7. concrete item identity, DOM IDs, state, movement, focus and lifecycle;
8. Angular SPI minimality, claims, fallback and host diagnostics;
9. native/Aria/Standard semantic equivalence and implementation isolation;
10. unchanged data/runtime/application/scope/validation authority;
11. complete ADR-009 migration and ADR-010 compatibility treatment;
12. all Deferred exclusions and delivery gates; and
13. documentation, links, formatting and diff consistency.

Review 134 cycle 4 fulfilled this gate with zero findings. ADR-025 revision 0
is Accepted. Its later SPEC-009 and PLAN-022 gates are now completed; the ADR
itself still authorizes no dependency, version, release, Git or external action.
