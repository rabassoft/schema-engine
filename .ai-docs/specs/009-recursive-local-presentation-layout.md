# SPEC-009: Recursive Local Presentation Layout

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 19 July 2026
- **Acceptance date:** 19 July 2026
- **Milestone:** M20 — Static local nested-object and collection-item layout
- **Promoted capability:** only the D-011 boundary accepted by
  [`review 133`](../reviews/133-d011-m20-nested-item-layout-promotion-readiness.md)
- **Accepted baselines:** [`SPEC-001 v0.1.15`](./001-controlled-form-runtime.md)
  through
  [`SPEC-008 v0.1.0`](./008-static-advanced-presentation-layout.md)
- **Accepted architecture:**
  [`ADR-025 revision 0`](../adrs/025-bosques-presentacion-locales-objetos-items.md)
- **Complete review:** [`review 135`](../reviews/135-spec-009-review.md) cycle 6
  passed all fourteen areas with zero findings after nine corrections
- **Authority:** Accepted observable M20 contract, implemented by completed
  PLAN-022 revision 0 after final review 144 cycle 3; dependency, version,
  release, Git and external actions remain separately gated

## 1. Status and authority

This Accepted specification defines the observable M20 extension for recursive
static local presentation forests. It extends SPEC-008 only by admitting the
already accepted presentation grammar inside ordinary nested objects,
collection item templates and nested object templates, and by defining the
minimum corresponding core, Angular and Standard behavior.

Completed PLAN-022 implements this specification's promoted local-forest scope;
this Accepted specification is its normative baseline. All unchanged compiler,
schema, data-node,
field, runtime, operation, scope, validation, controlled-state, object,
collection, reference, nullable, renderer, package, stability and publication
rules in SPEC-001 through SPEC-008 remain authoritative. This document
replaces only each exact SPEC-008 root-only rule or Public Experimental
declaration that it explicitly widens.

Acceptance originally authorized preparation and complete review of one
implementation plan only. That later plan is now completed; neither document
authorizes a dependency, manifest, version, release, commit, push, registry or
repository action.

## 2. Goals

M20 shall specify:

1. optional local `presentation` authoring on object and item UI schemas;
2. exact-once forests over only the direct editable children of each owner;
3. one defaulted generic normalized presentation family for node definitions
   and static templates;
4. required immutable forests on every normalized object and item-template
   owner;
5. owner-local ID namespaces, qualified static keys and owner-local atomic
   fallback;
6. descriptor-safe inspection, exact diagnostics and deterministic manual
   definition validation;
7. static template-label resolution reused across concrete item instances;
8. collision-free concrete IDs and target-owned state tied to stable item
   identity rather than collection position;
9. the minimal Public Experimental Angular SPI type migration while keeping
   item, snapshot and application authority Internal;
10. equivalent native Angular, Angular Aria and independent Standard behavior;
11. one shared neutral reference scenario that proves nested owners and stable
    item movement; and
12. conformance evidence sufficient to prepare an implementation plan without
    implementing it.

## 3. Non-goals

M20 does not support new presentation kinds, wizards, steps, workflow,
completion rules, next/back navigation, actions, commands, slots, arbitrary
templates, submit, persistence, conditions, declarative visibility/enabled/
readonly rules or generated scopes.

It does not admit presentation on array hosts, primitive leaves, identity
properties, item actions or issue regions. It adds no cross-owner path
reference, item-specific authored forest, dynamic/repeated definition,
controlled/persisted/deep-linked layout state, arbitrary row/coordinate/area/
gap/alignment authoring, CSS class, breakpoint or target metadata.

It does not add general design tokens, shared CSS, another renderer kit, UI
dependency, React, Vue, legacy Angular, Angular 23, SSR, hydration, portals,
new package, new entry point or Stable API. It selects no package version,
candidate, release or publication.

## 4. Public neutral contracts

### 4.1 Raw UI Schema

Only these existing Public + Experimental interfaces widen:

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
`UiGridItemSchema` retain their exact SPEC-008 members and meanings. No new
raw symbol or entry kind is added.

`UiSchema.presentation` remains the root forest. An `ObjectUiSchema`
`presentation` owns that object's direct normalized children. An
`ItemUiSchema.presentation` owns the direct editable children of its static
item template. An `ObjectUiSchema` nested below an item owns the direct
children of that object template.

`ArrayUiSchema`, `FieldUiSchema` and an identity-property UI entry gain no
`presentation` member. The array node is atomic in its parent's forest; its
`item.presentation` owns item descendants. A primitive leaf is always an
atomic string entry.

### 4.2 Generic normalized definitions

The complete normalized presentation family becomes generic. Every parameter
defaults to the current root-node domain, preserving the meaning of existing
unparameterized source:

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

`TemplatePresentationEntryDefinition` is the only new named Public core
export. The defaults ensure that an unparameterized
`PresentationEntryDefinition` still wraps only `FormNodeDefinition`; it does
not silently widen to templates.

### 4.3 Required owner forests

The normalized owner contracts widen exactly:

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

`FormDefinition.presentation` remains
`readonly PresentationEntryDefinition[]`. Primitive definitions, field
templates and array nodes gain no normalized presentation member.

Every forest, wrapper, container, panel, grid item and nested array is deeply
frozen. A template forest wraps the exact static `FormNodeTemplate` objects
shared by every controlled item instance. It contains no item ID, index,
snapshot, value or baseline.

## 5. Forest owners and authoring grammar

### 5.1 Eligible direct children

Each forest has exactly one owner and one eligible-name set:

| Owner                     | Eligible names                            |
| ------------------------- | ----------------------------------------- |
| root `UiSchema`           | direct `FormDefinition.nodes` names       |
| ordinary `ObjectUiSchema` | that `ObjectFieldDefinition.children` set |
| root `ItemUiSchema`       | direct editable item-template child names |
| template `ObjectUiSchema` | that `ObjectNodeTemplate.children` set    |

Depth-first flattening through sections, panels and grid items must yield
every eligible child exactly once. A name never resolves to a descendant,
ancestor, sibling owned by another forest, collection item ID, collection
index or arbitrary data path. The direct identity property is excluded from
the item template's editable child set and cannot appear in its forest.

An object or collection child is one atomic named entry in its parent forest.
That child may own a separate local forest, but its descendants cannot be
inlined into the parent's forest.

Object label, description, hint, tooltip and issues remain fixed in the
existing object host before its local descendant region. Collection label,
supporting text, identity failure and collection issues remain fixed in the
collection host. Item label, issues, remove and movement actions remain fixed
in the item host before the item-root forest. None becomes a presentation
entry or slot.

### 5.2 Existing entry rules

Every local forest reuses SPEC-008 sections, tabs, accordion and logical grid
without changing:

- member inspection order and exact expectation strings;
- non-empty and dense-array requirements;
- non-empty exact IDs and non-blank exact labels;
- active-ancestry cycle detection and object-reuse behavior;
- container-ID and direct panel-ID namespaces;
- logical columns, spans and source-order placement; or
- closed unknown-member and opaque-extension behavior.

Section, tabs, accordion and grid IDs share one namespace across one complete
owner forest. A panel ID is unique only within its direct tabs/accordion
owner. An unrelated forest may reuse any ID.

### 5.3 `order`, absence and precedence

At every owner, `order` and `presentation` are mutually exclusive ordering
authorities. If both own data members are present, the presentation forest is
invalid. The accepted `order` still determines the owner's normalized child
array and therefore its default forest.

When `presentation` is absent, the compiler creates one frozen `form-node`
wrapper per exact normalized direct child in that child array's order. A valid
forest may reorder only projection; it never mutates `children`, `fields`,
`nodes` or template identity.

When presentation is invalid, the compiler discards the complete authored
forest for only that owner and installs the same local default if no unrelated
blocking error prevents a definition. Root, ancestor, descendant and sibling
owner forests are independently valid or invalid; no partial container is
retained.

## 6. Descriptor-safe inspection and UI diagnostics

### 6.1 Traversal and location order

Inspection remains iterative, executes no accessor and retains no caller
object. All presentation objects and arrays use own enumerable data
descriptors. Active ancestry is local to the traversed presentation graph;
safe reuse outside active ancestry is inspected independently.

The root presentation retains its current inspection position. At an ordinary
object owner, presentation-specific inspection occurs after that object's
accepted `order` inspection and before descendant `fields`. At an item owner,
it occurs after item `order` and before item `fields`. With presentation absent,
all existing diagnostic ordering is unchanged.

Within any selected forest, diagnostic order remains SPEC-008 exactly:

1. `order-conflict` and presentation exterior;
2. depth-first entry order and known members in their accepted order;
3. duplicate IDs at the later occurrence;
4. safe descendants and siblings in source order; and
5. missing eligible children in the owner's normalized child-array order.

Unknown-key diagnostics follow the known members of their exact object. They
do not by themselves invalidate an otherwise valid forest.

### 6.2 Exact paths and owner parameters

Every defect continues to use `INVALID_UI_PRESENTATION`, warning severity,
`source: 'ui-schema'`, the SPEC-008 fallback and closed reason vocabulary.
Existing reason-specific parameters, safe `actualType` rules, expectation
strings and `firstDocumentPath` behavior remain exact.

The exact presentation member roots are:

```ts
// ordinary object
['fields', objectName, /* nested fields as applicable */, 'presentation']

// collection item root
['fields', collectionName, 'item', 'presentation']

// object template
[
  'fields',
  collectionName,
  'item',
  'fields',
  objectName,
  /* nested template fields as applicable */
  'presentation',
]
```

Entry, member, panel, grid-item and descendant paths append their exact
SPEC-008 segments to that root. The ordinary-object spelling recursively
inserts `'fields', childName` for every enclosing object. These are examples
of the formula, not a depth restriction.

Every local presentation diagnostic additionally has:

- `dataPath`: the exact ordinary object path, or the owning collection path
  for item/template owners; and
- `parameters.templatePath`: absent for an ordinary object, `[]` for the item
  root, or the exact relative object-template path for a template object.

`templatePath` is a frozen detached copy. Root diagnostics omit both additions
and retain their exact SPEC-008 shape.

An array-host `presentation` remains `unsupported-location` with
`nodeKind: 'array'`, the array `dataPath` and no `templatePath`. A primitive or
identity UI entry continues through its existing unknown/incompatible-member
policy and never becomes a presentation owner.

### 6.3 Reasons, collection and fallback

Local forests add no UI reason. `invalid-entry`, `unknown-node`,
`duplicate-node`, `missing-node`, section/container/panel/grid reasons,
`cyclic-presentation` and `order-conflict` retain the exact SPEC-008
parameter contracts. In particular, their existing `expected` strings are not
rewritten for a local owner.

One or more presentation warnings invalidate only that owner forest. The
compiler still collects every independently safe warning, continues safe
descendant UI inspection and applies owner-local fallback. A local warning
alone cannot remove a child, change child order, invalidate another forest or
make compilation fail.

## 7. Normalization, static identity and keys

### 7.1 Owner tuples

The root forest has no added owner tuple and every existing root key remains
byte-for-byte unchanged. A non-root forest derives one conceptual frozen
static tuple:

```ts
objectOwner = ['object', object.path];
itemOwner = ['item-template', collection.path];
templateObjectOwner = [
  'item-template-object',
  collection.path,
  object.relativePath,
];
```

The embedded paths are exact frozen normalized paths. They identify a static
structural owner, not a controlled item instance or runtime address.

### 7.2 Exact local keys

Local normalized keys are exactly:

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

`owner` is embedded as the tuple itself. It is not pre-serialized. Root
section, container, panel and grid-item keys retain the exact SPEC-005/008
formulas without a `'presentation'` prefix or owner tuple.

Every accepted source member is copied into a new normalized object. Qualified
keys disambiguate text resolution, manual validation and external container
testers; they do not create a Public owner lookup or runtime item identity.

## 8. Manual `FormDefinition` validation

Runtime creation and `applyFormOperation()` validate every required forest
iteratively and without requiring `Object.isFrozen()`. They execute no
accessor and require:

- exact generic discriminants and owner-appropriate wrapper domains;
- own data members, dense arrays and the accepted non-empty/blank rules;
- exact root or owner-qualified key formulas;
- owner-local container IDs and direct-owner panel IDs;
- valid grid columns/spans, acyclicity and deterministic index paths; and
- exact direct-child object identity, not structurally equal clones.

The existing manual-definition reason vocabulary remains closed. Missing
required owner forests use `missing-presentation`; malformed local entries use
the same exact presentation reasons selected by SPEC-005/008.

`presentationIndexPath` retains the exact SPEC-008 numeric grammar and is
local to the forest being validated. Every non-root defect additionally
exposes exact parameters:

```ts
{
  presentationOwnerKind: 'object' | 'item' | 'template-object';
  presentationOwnerPath: readonly string[];
  presentationTemplatePath?: readonly string[];
}
```

For `object`, `presentationOwnerPath` is the absolute object path and
`presentationTemplatePath` is absent. For `item`, the owner path is the
collection path and the template path is `[]`. For `template-object`, the
owner path is the collection path and the template path is the exact relative
object path. Every array is a frozen detached copy. Root defects omit all
three members.

Within the existing presentation-validation phase, forests are selected in
this deterministic order:

1. the root forest;
2. root nodes in `definition.nodes` order;
3. for an ordinary object, its local forest before recursively visiting its
   children in `children` order;
4. for a collection, its item-root forest before recursively visiting template
   children in `children` order; and
5. for an object template, its local forest before recursively visiting its
   children.

All earlier accepted non-presentation definition-shape precedence remains
unchanged. The first presentation defect prevents validator, operation or
target invocation. `INVALID_RUNTIME_OPTIONS` and `INVALID_FORM_DEFINITION`
retain their exact envelopes and existing operation `dataPath`; they only add
the local owner parameters when the selected defect is non-root.

## 9. Text resolution

### 9.1 Public context migration

No text context gains owner path, collection index, item ID, snapshot, value
or baseline. Only normalized definition domains widen:

```ts
export interface SectionTextResolutionContext {
  readonly formId: string;
  readonly locale: string;
  readonly section: PresentationSectionDefinition<
    FormNodeDefinition | FormNodeTemplate
  >;
  readonly member: SectionTextMember;
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
  readonly member: AdvancedPresentationTextMember;
}
```

`SectionTextMember` and `AdvancedPresentationTextMember` remain exactly
`'label'`. `TextResolutionContext` and `TextResolver.resolve()` widen only
transitively through these definition domains. All other text contexts remain
exact.

### 9.2 Resolution identity, order and failures

Within one retained form projection, Angular resolves each labelled
presentation definition at most once per exact normalized object, `formId` and
locale. Every concrete item instance sharing a template reuses that resolved
source/fallback result. Item insertion, movement, removal, value, baseline,
validation and retained snapshot updates do not resolve it again. Locale
change may produce one new result per static definition; complete form
projection replacement discards the cache.

Resolution order is depth-first owner projection order. A collection reaches
an item-root forest when its first identity-valid item is projected. Later
items reuse the result. A collection with no identity-valid item does not
resolve its template presentation; after its first valid item appears, the
static result remains form-projection scoped even if all items are later
removed.

Advanced containers and panels retain SPEC-008's exact resolver input,
fallback, diagnostic code and parameters. Their already qualified
`presentationKey` identifies a local static definition. Section failures
retain the exact accepted root parameters; a local section failure additionally
adds:

```ts
{
  sectionKey: section.key;
}
```

Root section failures omit `sectionKey`. One static-definition failure emits
once per form projection and locale, not once per item instance. No diagnostic
retains a thrown/result value or controlled item identity.

Standard independently applies the same static source-label reuse and fallback
order. It does not call or claim Angular's `TextResolver`, and its local
application localization failure is not a new Public diagnostic.

## 10. Concrete owner identity, DOM and lifecycle

### 10.1 Concrete owner tuples

Targets derive one concrete tuple for every non-root owner instance:

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

`itemId` is the exact already validated application-owned string identity.
No collection position participates.

### 10.2 Exact local bases

Every root base and suffix remains byte-for-byte unchanged. Local bases are:

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
    container.kind,
    container.id,
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

The accepted `--legend`, `--tablist`, `--tab`, `--tabpanel`, `--accordion`,
`--trigger`, `--region`, `--grid` and `--cell` suffixes and all exact
relationships remain unchanged. IDs are collision-free across forms, owner
kinds, object/collection paths, stable item IDs, template-relative paths,
container kinds, panels and grid items.

### 10.3 State and retained-host behavior

Every concrete tabs/accordion host independently implements SPEC-008's
first-tab and all-collapsed initial state, keyboard behavior and pointer
behavior. Grid remains state-free and source ordered. Sections remain
state-free fieldsets.

An ordinary nested-object host preserves local layout state across retained
snapshot, locale, validation, controlled value and baseline updates. A
template forest is static, but each stable item host owns independent concrete
layout state:

- moving a stable item preserves its view, field edit buffers, focus ownership
  and every nested tabs/accordion state;
- inserting an item creates fresh first-tab/all-collapsed state;
- removing an item destroys its complete presentation subtree and state exactly
  once;
- reinserting the same opaque ID after observed removal creates a new host and
  fresh state;
- an identity-invalid collection projects no item descendants or item layout
  hosts; and
- complete form/structural owner host replacement discards its descendant
  layout state.

Inactive tab and collapsed accordion descendants are instantiated exactly once,
remain mounted, reconcile confirmed snapshots, remain validated and are hidden
from display, sequential focus and the accessibility tree exactly as in
SPEC-008. Retained movement cannot duplicate or destroy them. Layout does not
change collection operation or focus-recovery ownership.

### 10.4 Accessibility and host failure

Every local section, tabs, accordion and grid uses the exact SPEC-005/008
roles, accessible names, selected/expanded state, controls/labelled-by
relationships, keyboard contract, source order and one-column fallback.

A synchronous local host creation, binding or claim failure retains its exact
SPEC-008 code, severity, source, safe base parameters, fallback and nearest
subtree ownership. It additionally carries:

```ts
{
  presentationOwnerKind: 'object' | 'item' | 'template-object';
  presentationOwnerPath: readonly string[];
  presentationTemplatePath?: readonly string[];
  itemId?: string;
}
```

The ordinary object context omits template path and item ID. Item context uses
template path `[]` and the exact safe stable `itemId`. Template-object context
uses the exact relative template path and stable `itemId`. Root failures omit
all additions and remain exact.

The failed host destroys every partial resource once, stops only its nearest
owned subtree and allows independent siblings to continue. No diagnostic
retains a snapshot, definition, controlled value or thrown value.

## 11. Runtime and application ownership

Core validates every normalized forest and otherwise ignores presentation.
There is no change to `FormRuntimeSnapshot`, item snapshots, runtime methods,
subscriptions, validators, validation input, issue ownership, operations,
structural sharing, scopes, dirty/touched/focused state, controlled value or
baseline ownership.

Hidden/collapsed descendants remain in snapshots and validation. A forest
cannot generate, constrain, persist or sequence a `FormScope`; hide a node from
validation; suppress issues; reference a concrete item; imply workflow or
completion; persist layout state; or reconcile a replacement
`FormDefinition`.

D-012, D-013, D-018, broader D-025, D-026 and D-045 remain Deferred.

## 12. Public Angular container SPI migration

### 12.1 Widened definitions and models

The existing SPI uses one widened node domain. No symbol, provider or registry
is added:

```ts
export type AngularPresentationContainerDefinition =
  | PresentationSectionDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationTabsDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationAccordionDefinition<FormNodeDefinition | FormNodeTemplate>
  | PresentationGridDefinition<FormNodeDefinition | FormNodeTemplate>;

export type AngularPresentationContainerRenderModel =
  | {
      readonly kind: 'section';
      readonly definition: PresentationSectionDefinition<
        FormNodeDefinition | FormNodeTemplate
      >;
      readonly label: string;
      readonly legendId: string;
    }
  | {
      readonly kind: 'tabs';
      readonly definition: PresentationTabsDefinition<
        FormNodeDefinition | FormNodeTemplate
      >;
      readonly label: string;
      readonly tablistId: string;
      readonly panels: readonly {
        readonly definition: PresentationPanelDefinition<
          FormNodeDefinition | FormNodeTemplate
        >;
        readonly label: string;
        readonly tabId: string;
        readonly tabpanelId: string;
      }[];
    }
  | {
      readonly kind: 'accordion';
      readonly definition: PresentationAccordionDefinition<
        FormNodeDefinition | FormNodeTemplate
      >;
      readonly label: string;
      readonly accordionId: string;
      readonly panels: readonly {
        readonly definition: PresentationPanelDefinition<
          FormNodeDefinition | FormNodeTemplate
        >;
        readonly label: string;
        readonly triggerId: string;
        readonly regionId: string;
      }[];
    }
  | {
      readonly kind: 'grid';
      readonly definition: PresentationGridDefinition<
        FormNodeDefinition | FormNodeTemplate
      >;
      readonly label: string;
      readonly gridId: string;
      readonly items: readonly {
        readonly definition: PresentationGridItemDefinition<
          FormNodeDefinition | FormNodeTemplate
        >;
        readonly cellId: string;
      }[];
    };

export type AngularPresentationContainerTester = (
  definition: AngularPresentationContainerDefinition,
) => number | null;

// SchemaPresentationEntryOutletComponent
readonly entry: InputSignal<
  PresentationEntryDefinition<FormNodeDefinition | FormNodeTemplate>
>;

// SchemaPresentationPanelOutletComponent
readonly panel: InputSignal<
  PresentationPanelDefinition<FormNodeDefinition | FormNodeTemplate>
>;
```

`AngularPresentationContainerRenderer.presentation` retains the same member
and receives the widened render model. Renderer type, registration and
provider signatures remain exact. Every render model remains deeply frozen.
External testers still receive only one exact frozen normalized container;
renderers receive only the frozen render model.

### 12.2 Internal context and claims

The Internal scoped container-host context may carry only the static owner
identity, current owner definition/snapshot pair, stable collection address
for template projection, and exact ID/text-cache/claim/diagnostic/cleanup
services needed by existing outlets.

None becomes Public. A tester or external renderer receives no raw schema/UI
Schema, snapshot, current value/baseline, item index/ID, operation authority,
application state, resolver, diagnostic channel, host factory or scoped
context.

Entry and panel outlets continue to claim exact generic definition objects and
obtain their concrete owner from Internal context. Foreign, duplicate,
conditional or missing claims retain nearest-host failure, complete claim
audit and exact-once cleanup. Selection remains fixed at concrete host creation
and a selected-host failure never retries native.

### 12.3 Registry diagnostics

Registration parsing, IDs, ranks, priorities, evaluation order, mandatory
native registrations and provider-configuration diagnostics remain exact.
Provider-configuration diagnostics are global and never gain owner context.

For a local concrete host only,
`PRESENTATION_CONTAINER_TESTER_EXCEPTION`,
`INVALID_PRESENTATION_CONTAINER_TEST_RESULT` and
`NO_PRESENTATION_CONTAINER_MATCH` retain their exact base parameters and add
the section 10.4 owner context. Root tester/selection diagnostics remain exact.
Diagnostics follow tester evaluation and host creation order.

## 13. Native Angular and Angular Aria behavior

Mandatory native registrations remain the universal fallback and project all
four kinds for both ordinary definitions and templates. No new native export,
provider, style or configuration is added.

The existing `@rabassoft/schema-engine-angular-aria` provider registers the
same four kinds and must project local forests without a new Public symbol,
peer, stylesheet, CSS property or dependency. Its tabs retain the accepted
Angular Aria follow-focus/wrapping/preserved-content behavior. Section,
accordion and grid retain their accepted selective native composition.

Native and Aria hosts use the exact local bases, static label cache, item-local
state, movement, mounted descendants, claims, diagnostics and destruction
rules in this specification. The application's explicit stylesheet import and
six existing pilot CSS properties remain unchanged. No package range or
support tier changes through this document.

## 14. Standard and reference evidence

The private Standard renderer consumes the same generic normalized forests
directly from core. It independently implements local recursion, concrete IDs,
static label reuse, item-owner reconciliation, state, accessibility and
teardown without importing Angular, the container SPI, Angular Aria, target
state, DOM helpers or CSS from another shell.

The neutral catalog adds one private `recursive-local-presentation` scenario
containing:

- an ordinary nested object with local section, tabs and grid;
- a homogeneous object collection whose item-root forest uses tabs and
  accordion;
- an object template inside each item with its own local grid;
- an authored direct string identity property that is omitted from the
  editable template children and every presentation forest;
- fixed object/collection/item labels, issues and actions outside the forests;
  and
- at least two stable items moved in both directions while their independent
  layout state, field buffers and focus ownership are retained.

Angular native, Angular Aria and Standard consume the exact same authored
schema, UI Schema and controlled scenario state. Their semantic behavior,
roles, IDs, ordering and lifecycle must agree; visual pixel equality and
shared target implementation are not required. Reference apps remain private
and absent from package artifacts.

## 15. Public/Internal migration and compatibility

### 15.1 Complete inventory

| Classification         | Exact effect                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `TemplatePresentationEntryDefinition` only.                                                                                                                                                                                                                                                                                                                                                                                                                |
| Changed Public core    | Optional `ObjectUiSchema.presentation` and `ItemUiSchema.presentation`; defaulted generic presentation entry, wrapper, section, tabs, accordion, panel, grid and grid-item contracts; required `ObjectFieldDefinition.presentation`, `ObjectNodeTemplate.presentation` and `ObjectItemTemplateDefinition.presentation`; widened section/advanced text domains and transitive `TextResolutionContext`; compiler diagnostics/fallback and manual validation. |
| Changed Public Angular | Widened container definition/render-model/tester and entry/panel outlet generic domains; native projection of local forests.                                                                                                                                                                                                                                                                                                                               |
| Internal base Angular  | Static/concrete owner context, stable template addressing, qualified IDs, shared static-label cache, host plumbing, local tester/host diagnostics, claims and cleanup.                                                                                                                                                                                                                                                                                     |
| Changed pilot behavior | Existing four Angular Aria registrations project local ordinary/template forests and concrete item instances; no new Public contract/style.                                                                                                                                                                                                                                                                                                                |
| Private Standard/apps  | Independent recursive local projection, static-label cache, stable item state and one shared catalog scenario/evidence.                                                                                                                                                                                                                                                                                                                                    |
| Unchanged              | Raw entry kinds/members, root key/ID formulas, data definitions other than the three required forest members, snapshots/methods, operations, scopes, validation, leaf registry, package entry points/dependencies, CSS properties, support ranges, current versions and publication state.                                                                                                                                                                 |

Every exported change remains Public + Experimental + Active. No unlisted
Public API changes.

### 15.2 Source migration examples

Existing root-only source retains its meaning:

```ts
const rootEntry: PresentationEntryDefinition = definition.presentation[0]!;
// Every form-node wrapper reachable from rootEntry still contains
// FormNodeDefinition only.
```

Manual object and template definitions must add the required default forest:

```ts
const object: ObjectFieldDefinition = {
  // existing object members
  presentation: children.map((node) => ({ kind: 'form-node', node })),
};

const item: ObjectItemTemplateDefinition = {
  // existing item-template members
  presentation: children.map((node) => ({ kind: 'form-node', node })),
};
```

An external Angular container implementation must accept the widened immutable
domain and narrow a wrapper's `node` by `node.kind` rather than assuming an
absolute `path` is always available. It receives no item address:

```ts
const tester: AngularPresentationContainerTester = (definition) =>
  definition.kind === 'tabs' ? 20 : null;
```

The generic defaults are source-compatible for root declarations, but required
normalized members and widened Angular SPI input types are incompatible Public
Experimental changes. ADR-010 requires at least one future MINOR increment for
each affected published package and migration notes. This specification does
not select the versions, peers, tags or release.

## 16. Required conformance

A future plan must map fixtures and tests for at least:

1. optional object/item authoring at every admitted ordinary/template depth;
2. default, ordered and authored forests for every owner kind;
3. exact direct-child membership and rejection of ancestor, descendant,
   sibling-owner, identity and arbitrary-path names;
4. atomic object/array membership and independently recursive owned forests;
5. every SPEC-008 entry kind and hostile accessor/sparse/cycle/reuse case in
   every owner kind;
6. all local UI reason parameters, document/data/template paths, order and
   owner-local fallback;
7. array-host unsupported location and unchanged leaf/identity policy;
8. independent root, ancestor, sibling and descendant valid/invalid forests;
9. deep immutability, exact direct-child object identity and exact root/local
   keys including hostile names and lone surrogates;
10. every manual-definition reason, local index path, owner context, traversal
    precedence and validator/operation/target non-invocation;
11. static label success and every failure reason/order across zero, one and
    repeated items, locale changes and host replacement;
12. exact concrete IDs for ordinary objects, item roots and nested template
    objects across multiple forms and hostile stable IDs;
13. first-tab/all-collapsed state independently per concrete owner;
14. stable movement preserving view, buffers, focus and nested layout state;
15. insertion, removal, same-ID reinsertion, invalid identity and exact-once
    descendant destruction;
16. mounted hidden descendants, reconciliation, validation, focus exclusion
    and retained-host updates;
17. roles, names, keyboard, relationships, source order and grid fallback in
    independent Angular native and Standard lanes;
18. widened Angular declarations, renderer/tester ergonomics and absence of
    Public owner/item context;
19. provider validation, ranks, native fallback, local tester diagnostics,
    selected-host no-retry and nearest claim-failure cleanup;
20. native and Angular Aria semantic equivalence for ordinary/template owners
    at lower and latest-compatible Angular/Aria/CDK tuples;
21. unchanged six opt-in pilot properties and package/style/dependency
    isolation;
22. Standard direct-core implementation isolation and identical neutral
    scenario inputs;
23. unchanged object/collection fixed labels, issues, actions and focus
    recovery outside layout;
24. unchanged runtime, controlled state, scopes, operations, validation,
    snapshots and M1–M19 conformance;
25. generated declarations, package consumers, artifacts and migration notes;
26. reference unit/Chromium lanes and production builds for native, Aria and
    Standard; and
27. no version selection, release, registry, GitHub or other external action.

Native, Aria and Standard assertions are semantically equivalent, not
pixel-based. An Aria or Standard failure blocks M20 completion and cannot be
relabelled native-only success. Reference apps never replace package or clean
consumer evidence.

## 17. Acceptance criteria

SPEC-009 may be accepted only when:

1. every rule is consistent with accepted SPEC-001 through SPEC-008 and
   ADR-025;
2. only the promoted D-011/M20 local static boundary is activated;
3. raw locations, direct-owner membership, `order` conflict and fallback are
   exact;
4. generic definitions, required owner forests, identity and immutability are
   closed;
5. diagnostics, paths, parameters, order and manual-definition envelopes are
   deterministic and closed;
6. root keys, IDs, diagnostics and unparameterized type meaning remain
   compatible;
7. static text reuse cannot depend on item count, index, value or snapshot;
8. stable item identity governs concrete IDs, state movement and disposal;
9. mounted lifecycle, accessibility, keyboard and focus behavior remain exact;
10. the Angular SPI migration is minimal and exposes no owner/application
    authority;
11. native, Angular Aria and Standard behavior and isolation are mandatory;
12. runtime, application, scope, validation and operation ownership remains
    unchanged;
13. the ADR-009 inventory and ADR-010 MINOR/migration treatment are complete;
14. every Deferred exclusion and later delivery gate remains inactive; and
15. every correction restarts the complete review until one pass has zero
    findings and no unresolved change request.

Acceptance authorizes only preparation and complete review of an implementation
plan. Explicit plan approval remains required before implementation.

Review 135 cycle 6 fulfilled all acceptance criteria with zero findings.
SPEC-009 v0.1.0 is Accepted and authorizes only PLAN-022 preparation and
complete review.
