# ADR 023: Static neutral tabs, accordion and logical-grid containers

- **Status:** Accepted
- **Date:** 18 July 2026
- **Acceptance date:** 18 July 2026
- **Revision:** 1 — closes DOM identity, diagnostic envelopes and text order
- **Milestone:** M18 — narrow static neutral advanced layout
- **Promotes:** only the D-011 boundary accepted by
  [`review 098`](../reviews/098-d011-m18-advanced-layout-promotion-readiness.md)
- **Requires:** accepted [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-007`](./007-resolucion-renderers-testers.md),
  [`ADR-017`](./017-grupos-presentacion-estaticos.md),
  [`ADR-020`](./020-plataforma-referencia-multiframework.md),
  [`ADR-021`](./021-shell-standard-dom-core-directo.md) and
  [`SPEC-005 v0.1.1`](../specs/005-static-presentation-groups.md)
- **Acceptance effect:** authorizes only the separate D-025
  promotion-readiness review; no SPEC, plan or implementation
- **Complete review:** [`review 099`](../reviews/099-adr-023-review.md) cycle 3
  passed all ten areas with zero findings after five corrections

## 1. Context

M12 established one required immutable presentation forest that wraps every
root form node exactly once and may add static sections. Core owns normalized
presentation semantics while runtime state and operations continue to mirror
only managed data. Angular and the private Standard shell independently project
that same forest.

The accepted M18 promotion review supplies demand for a restrained next step:
static tabs, accordions and a logical grid. It explicitly excludes workflow,
scopes, conditional layout, nested/item layout, arbitrary responsive metadata,
controlled layout state and concrete renderer kits.

The design must be useful with native HTML today and with future Angular,
React or Vue UI libraries without encoding component names, DOM, CSS, theme
tokens or framework capabilities in core. It must also avoid making the first
fixed Angular hosts a permanent extension architecture. D-025 therefore keeps
its own conditional gate after this neutral decision and before a SPEC.

## 2. Decision

Extend the accepted root presentation forest with three static container kinds:
`tabs`, `accordion` and `grid`. Tabs and accordion contain labelled panels;
grid contains logical items that each wrap one presentation entry.

All new structures are projection-only. They have no data path, snapshot,
validity, operation, scope, persistence or workflow meaning. The compiler
normalizes them; each target owns its ephemeral interaction state and concrete
markup.

### 2.1 Raw root UI grammar

The Public + Experimental root UI contracts add:

```ts
export type UiPresentationEntry =
  string | UiSectionSchema | UiTabsSchema | UiAccordionSchema | UiGridSchema;

export interface UiTabsSchema {
  readonly kind: 'tabs';
  readonly id: string;
  readonly label: string;
  readonly panels: readonly UiPresentationPanelSchema[];
}

export interface UiAccordionSchema {
  readonly kind: 'accordion';
  readonly id: string;
  readonly label: string;
  readonly panels: readonly UiPresentationPanelSchema[];
}

export interface UiPresentationPanelSchema {
  readonly kind: 'panel';
  readonly id: string;
  readonly label: string;
  readonly children: readonly UiPresentationEntry[];
}

export interface UiGridSchema {
  readonly kind: 'grid';
  readonly id: string;
  readonly label: string;
  readonly columns: 1 | 2 | 3 | 4;
  readonly items: readonly UiGridItemSchema[];
}

export interface UiGridItemSchema {
  readonly span?: 1 | 2 | 3 | 4;
  readonly child: UiPresentationEntry;
}
```

The accepted `string | UiSectionSchema` grammar remains source compatible.
Advanced containers are valid only inside the root presentation forest; they
do not make `presentation` valid on nested object, array or item UI nodes.

Every container has a non-empty exact `id` and a non-blank source `label`.
Container IDs are globally unique across sections, tabs, accordions and grids.
Each tabs/accordion `panels` array is dense and non-empty. Panel IDs are
non-empty and unique within their direct owner, labels are non-blank, and every
panel has a dense non-empty `children` array. A panel is not a general
presentation entry and can occur only directly inside `panels`.

Each grid has a dense non-empty `items` array. An item is an ordinary wrapper,
has exactly one `child`, and defaults `span` to `1`. Its accepted span is an
integer from `1` through that grid's `columns`; a wider span invalidates the
complete root presentation. Grid placement is implicit in item source order.
There are no authored row, column, area, gap, alignment, breakpoint, class,
style or target-specific members.

Sections and all advanced container children may recursively contain any
`UiPresentationEntry`. Complete depth-first traversal still names every direct
root form node exactly once. Root objects and collections remain atomic named
entries. All existing root `order` conflict, unsupported nested location,
descriptor-safety, unknown-key and atomic-fallback rules continue to apply.

### 2.2 Normalized contracts and identity

The normalized Public union becomes:

```ts
export type PresentationEntryDefinition =
  | PresentedFormNodeDefinition
  | PresentationSectionDefinition
  | PresentationTabsDefinition
  | PresentationAccordionDefinition
  | PresentationGridDefinition;

export interface PresentationTabsDefinition {
  readonly kind: 'tabs';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly panels: readonly PresentationPanelDefinition[];
}

export interface PresentationAccordionDefinition {
  readonly kind: 'accordion';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly panels: readonly PresentationPanelDefinition[];
}

export interface PresentationPanelDefinition {
  readonly kind: 'panel';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly children: readonly PresentationEntryDefinition[];
}

export interface PresentationGridDefinition {
  readonly kind: 'grid';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly columns: 1 | 2 | 3 | 4;
  readonly items: readonly PresentationGridItemDefinition[];
}

export interface PresentationGridItemDefinition {
  readonly kind: 'grid-item';
  readonly key: string;
  readonly span: 1 | 2 | 3 | 4;
  readonly child: PresentationEntryDefinition;
}
```

Keys are exact tagged JSON tuples:

```ts
container.key === JSON.stringify([container.kind, container.id]);
panel.key === JSON.stringify([owner.kind, owner.id, 'panel', panel.id]);
item.key === JSON.stringify(['grid', grid.id, 'item', itemIndex]);
```

Existing section keys remain `JSON.stringify(['section', id])`. Global
container-ID uniqueness therefore preserves unique container keys; owner kind,
ID and local panel ID preserve unique panel keys. Grid item index is stable for
one immutable definition and carries no persisted state.

Every normalized object and array is deeply frozen and retains no raw caller
container. Flattening form-node wrappers through sections, panels and grid
items yields the exact objects in `FormDefinition.nodes`, each exactly once.
`FormDefinition.nodes` and `fields` remain the structural and leaf authorities.

Absent or invalid root presentation still produces only the accepted default
form-node wrapper forest. There is no partial advanced-layout recovery.

### 2.3 Tabs state and lifecycle

Each tabs container exposes exactly one active panel in its target projection:

1. the first panel is active on target-host creation;
2. horizontal `ArrowLeft`/`ArrowRight` move focus cyclically and activate the
   focused tab; `Home`/`End` focus and activate the first/last tab;
3. pointer activation focuses and activates that tab;
4. `Tab` enters/leaves the tablist through only the active tab;
5. changing value, baseline, locale, validation, touched, focus or issues does
   not change the active panel; and
6. destroying/replacing the complete target projection discards state; a new
   host starts again at the first panel.

Targets instantiate every panel subtree once for the life of the tabs host.
Inactive panels are hidden from visual display, sequential focus and the
accessibility tree, but their renderer/binding instances remain mounted and
continue to reconcile confirmed snapshots. Activation never emits a form
operation or changes core/runtime/application state.

Target markup must expose one labelled tablist, one tab per panel and one
labelled tabpanel per tab with collision-free relationships. Exact elements,
classes and animation are target-owned.

### 2.4 Accordion state and lifecycle

Accordion panels are independently expandable; zero, one or many may be open.
Every panel starts collapsed on target-host creation. Its disclosure control
toggles only that panel on pointer activation or `Enter`/`Space`. Controls
remain in source-order keyboard navigation; no roving focus or arrow-key
contract is introduced.

Like tabs, every panel subtree is instantiated once and remains mounted.
Collapsed content is removed from visual display, sequential focus and the
accessibility tree while still reconciling confirmed snapshots. Locale,
runtime snapshots and application resets that retain the projection do not
alter expansion. Complete projection replacement discards the ephemeral set.

Each disclosure control has collision-free ownership of its labelled region
and exposes expanded state using target-idiomatic accessible semantics.

### 2.5 Logical grid semantics

Grid uses source-order automatic placement only. Each item consumes its span in
the next available logical row; if the remaining cells cannot fit it, placement
moves to the next row. Reading order, DOM order, keyboard order and one-column
fallback order always equal `items` source order.

`columns` and `span` are semantic bounded integers, not CSS grid values.
Targets capable of the requested layout should project that logical geometry.
At constrained widths or when a target cannot represent it safely, the target
must collapse to one column in source order and ignore visual spans. The target
owns its threshold/capability decision; core exposes no breakpoint or runtime
measurement.

Grid has no interaction state. Its label supplies an accessible group name;
targets may render it visibly or as assistive text according to their native
host contract, but text resolution and group ownership remain required.

### 2.6 Text resolution

Existing section text contracts remain unchanged. Core adds:

```ts
export type AdvancedPresentationTextMember = 'label';

export type AdvancedPresentationLabelDefinition =
  | PresentationTabsDefinition
  | PresentationAccordionDefinition
  | PresentationPanelDefinition
  | PresentationGridDefinition;

export interface AdvancedPresentationTextResolutionContext {
  readonly formId: string;
  readonly locale: string;
  readonly presentation: AdvancedPresentationLabelDefinition;
  readonly member: AdvancedPresentationTextMember;
}
```

`TextResolutionContext` adds this branch. Resolution uses the exact normalized
object and source label. Exception, non-string or blank results fall back to
the exact source label and emit one `TEXT_RESOLUTION_FAILED` warning with no
paths, fallback `Advanced presentation text resolution failed.` and:

```ts
{
  presentationKind: presentation.kind,
  presentationKey: presentation.key,
  member: 'label',
  reason: 'exception' | 'non-string-result' | 'blank-string-result',
}
```

Thrown/result values are never retained. Resolution order is depth-first
projection order: tabs/accordion/grid container label, then each panel label
before its children, or each grid-item child in item order. Section and
form-node text retain their accepted local ordering. Projection identity is
the exact normalized labelled object, `formId` and locale; unrelated runtime
snapshots do not resolve or redeliver its diagnostic again.

### 2.7 Inspection, diagnostics and fallback

Inspection remains pure, iterative and descriptor-safe. It reads only own
enumerable data descriptors, never invokes accessors and tracks active ancestry
across container, panel, children, item and child objects. Reused objects are
inspected independently outside active ancestry. There is no Public arbitrary
depth limit.

The existing `INVALID_UI_PRESENTATION` warning family expands with closed
reasons for:

- unsupported or malformed container/panel/grid-item kinds and exteriors;
- missing, accessor, invalid or blank IDs/labels;
- duplicate global container IDs or owner-local panel IDs;
- missing, accessor, sparse, invalid or empty `panels`, `children` or `items`;
- missing/accessor/invalid grid `columns`, item `span` or item `child`;
- span greater than its owning column count;
- active cycles through every new wrapper; and
- all existing unknown, duplicate or missing form-node membership defects.

Diagnostics follow depth-first source order and the structural member order
shown in section 2.1. The later SPEC must close exact reason strings,
parameters, paths, precedence and fallback messages. Any defect atomically
discards the complete authored root forest and emits the existing default
wrapper forest without hiding or duplicating a managed node.

Manual `FormDefinition` validation expands its existing iterative exact-object
identity check to every new normalized kind, key, member, array, span and cycle.
It reports deterministic first defects through the existing runtime/operation
envelopes and prevents validators, operations or target code from running.
Its closed new detailed reasons are `invalid-presentation-tabs`,
`invalid-presentation-accordion`, `invalid-presentation-panel`,
`invalid-presentation-grid`, `invalid-presentation-grid-item`,
`invalid-presentation-entry-key`, `duplicate-presentation-container-id` and
`duplicate-presentation-panel-id`. Existing presentation reasons retain their
meaning. The later SPEC must map exact precedence and index paths without
adding another reason.

### 2.8 Target projection and failure isolation

Angular and Standard independently project normalized entries. Neither target
may interpret raw UI Schema or share components, DOM/controller state, styles
or lifecycle helpers. Both must prove the same source-order, state,
accessibility, snapshot reconciliation and cleanup semantics with
target-specific implementation and tests.

Both targets use these exact collision-free bases before fixed role suffixes:

```ts
containerBase = `se-${encodeURIComponent(
  JSON.stringify([formId, 'presentation', container.kind, container.id]),
)}`;

panelBase = `se-${encodeURIComponent(
  JSON.stringify([
    formId,
    'presentation',
    owner.kind,
    owner.id,
    'panel',
    panel.id,
  ]),
)}`;

gridItemBase = `se-${encodeURIComponent(
  JSON.stringify([formId, 'presentation', 'grid', grid.id, 'item', itemIndex]),
)}`;
```

The tabs container base owns `--tablist`; each tabs panel base owns `--tab` and
`--tabpanel`. The accordion container base owns `--accordion`; each accordion
panel base owns `--trigger` and `--region`. The grid container base owns
`--grid`; each grid-item base owns `--cell`. Existing section/data-node tuples
remain disjoint. A target-host creation/binding exception:

1. destroys every partial resource owned by that host;
2. emits exactly one target diagnostic for the failing tabs, accordion, grid
   or panel host without retaining the thrown value;
3. stops only that structural subtree; and
4. permits independent presentation siblings to continue.

The exact codes are `TABS_HOST_INSTANTIATION_FAILED`,
`ACCORDION_HOST_INSTANTIATION_FAILED`, `GRID_HOST_INSTANTIATION_FAILED` and
`PANEL_HOST_INSTANTIATION_FAILED`. Each is `error`/`runtime`, has no paths and
does not retain the thrown value. Container parameters are
`{ presentationKind, presentationId }`; panel parameters are
`{ ownerKind, ownerId, panelId }`. Fallbacks are respectively `Tabs host could
not be instantiated.`, `Accordion host could not be instantiated.`, `Grid
host could not be instantiated.` and `Presentation panel host could not be
instantiated.` Diagnostics follow failed host creation order. Ordinary later
event, lifecycle and framework failures remain outside this narrow creation
boundary.

### 2.9 Runtime, scopes and application ownership

Core runtime validates the complete normalized forest but otherwise ignores
layout. No runtime snapshot or method changes. Tabs/accordion state is never:

- part of `value` or `baselineValue`;
- a form operation, issue, dirty/touched/focused state or validation input;
- generated from or addressable by a `FormScope`;
- preserved by core across definition replacement; or
- persisted, deep-linked, controlled or synchronized by the application.

Hidden/collapsed fields continue to exist in the runtime and validation model.
Presentation never suppresses issues, changes scope membership or implies
validation progression. D-012 and D-018 remain Deferred.

### 2.10 Future renderer-kit responsibility surface

A future D-025 container renderer kit, if separately promoted and accepted,
must receive only normalized container definitions plus target-owned child
projection and lifecycle capabilities. Regardless of provider API, it must own:

- native component selection, markup, animation and theme values;
- the exact target-local tabs/accordion state described above;
- accessible roles/relationships, focus behavior and hidden-state projection;
- child-host creation, stable retention, reconciliation and cleanup;
- logical-grid projection and safe one-column fallback; and
- deterministic capability/creation failure reporting and native fallback.

It must not inspect raw JSON Schema/UI Schema, mutate runtime/application state,
reinterpret form-node identity or require framework/library names in core.
Package boundaries, provider/token APIs, registration/override precedence,
support tiers, theme tokens and the first concrete Angular library remain D-025
questions. ADR-007 continues to govern primitive leaf renderer selection only.

### 2.11 Public/Internal migration inventory

Under ADR-009, a future M18 SPEC may define only this inventory:

| Classification         | Exact effect                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `UiTabsSchema`, `UiAccordionSchema`, `UiPresentationPanelSchema`, `UiGridSchema`, `UiGridItemSchema`, `PresentationTabsDefinition`, `PresentationAccordionDefinition`, `PresentationPanelDefinition`, `PresentationGridDefinition`, `PresentationGridItemDefinition`, `AdvancedPresentationTextMember`, `AdvancedPresentationLabelDefinition`, `AdvancedPresentationTextResolutionContext`. |
| Changed Public core    | Widened `UiPresentationEntry`, `PresentationEntryDefinition` and `TextResolutionContext`; compiler inspection/diagnostics/fallback; required normalized-forest and manual-definition validation semantics.                                                                                                                                                                                  |
| Changed Public Angular | `SchemaFormDirective` observably projects the widened normalized forest; existing configuration, inputs, outputs and runtime delegation remain unchanged.                                                                                                                                                                                                                                   |
| New Public Angular     | None.                                                                                                                                                                                                                                                                                                                                                                                       |
| Internal Angular       | Native tabs/accordion/grid/panel hosts, target-local state, text/ID/accessibility projection, child retention, failure isolation and lifecycle cleanup.                                                                                                                                                                                                                                     |
| Private Standard       | Independent direct-core projection and conformance evidence with no reusable adapter export.                                                                                                                                                                                                                                                                                                |
| Unchanged              | Form data-node/field definitions, runtime snapshots/methods, operations, scopes, validation, leaf renderer registry, packages, entry points, dependencies, versions, publication and stability.                                                                                                                                                                                             |

Every new/changed root export remains Public + Experimental + Active. The
existing package entry point is reused and no API becomes Stable. Adding a
provider, container registry, external dependency or unlisted Public symbol
requires a separately accepted D-025 architecture decision or revision of this
inventory before SPEC preparation.

## 3. Consequences

### Positive

- One neutral forest supports substantially richer layout without changing
  managed state or runtime behavior.
- Bounded grammar and exact-once identity prevent CSS/framework metadata from
  becoming core semantics.
- Mounted hidden panels preserve renderer buffers, focus ownership and
  reconciliation without optimistic or duplicate controls.
- Angular and Standard evidence can expose target-specific defects before
  later framework adapters are designed.
- The renderer-kit responsibility surface is explicit without prematurely
  selecting a provider API or UI dependency.

### Negative

- The Public Experimental presentation and text unions widen again.
- Atomic fallback discards valid advanced siblings when one authored entry is
  invalid.
- Always-mounted panels consume target resources even while hidden.
- The 1–4-column grid is intentionally less expressive than CSS or common UI
  library grids.
- Native Angular and Standard projections duplicate implementation and tests by
  design.

## 4. Alternatives considered

### Use one generic container with arbitrary options

Rejected because an open options bag would encode target/library vocabulary,
weaken diagnostics and make compatibility untestable.

### Make panels ordinary presentation entries

Rejected because panels are valid only under tabs/accordion and require
owner-local identity. A general panel entry would permit meaningless root or
section placement.

### Persist or control selected/expanded state

Rejected because no application contract, URL/persistence policy or runtime
evidence exists. D-013 and future controlled-layout work remain Deferred.

### Destroy inactive panel subtrees

Rejected because it would lose target-local field buffers and focus/lifecycle
identity, and could cause behavior differences between native and UI-library
hosts.

### Allow arbitrary responsive columns and breakpoints

Rejected because media-query names and values are target/theme concerns. A
bounded logical grid plus mandatory safe collapse supplies portable evidence.

### Treat advanced containers as ADR-007 renderers

Rejected because ADR-007 ranks primitive leaf editors. Container kits need
child projection, state, accessibility and lifecycle responsibilities that
must be designed separately under D-025.

### Share target hosts or CSS

Rejected by ADR-020/021. Shared normalized inputs and conformance expectations
are useful; shared target implementation would hide portability failures.

## 5. Explicit exclusions

ADR-023 does not activate:

- wizards, steps, actions, commands, slots, arbitrary templates or workflow;
- D-012 declarative/generated scopes or D-018 conditional expressions;
- nested-object, collection-item or item-template presentation layout;
- controlled, persisted, deep-linked or application-synchronized layout state;
- arbitrary rows, coordinates, areas, gaps, alignment, CSS, styles, classes,
  breakpoints or target-specific metadata;
- D-025 implementation, packages, providers, tokens, theming or UI dependency;
- dynamic definition reconciliation under D-013;
- React, Vue, D-026, legacy Angular, SSR, hydration or portals;
- a new package, entry point, dependency, version, release, publication, Stable
  API, CI or repository mutation; or
- SPEC-008, PLAN-020 or implementation before all intervening gates pass.

## 6. Required review before acceptance

Review must repeat after every correction until one complete cycle has zero
findings. It must verify:

1. exact grammar, composition, identity, order and root-only membership;
2. target-owned tabs/accordion state and mounted hidden-panel lifecycle;
3. bounded grid placement, reading order and safe fallback;
4. descriptor safety, cycles, immutability, diagnostics and atomic fallback;
5. text, accessibility, target IDs, failure isolation and cleanup;
6. unchanged runtime, controlled ownership, validation, scopes and operations;
7. ADR-007 leaf ownership and a sufficient but provider-free D-025 surface;
8. independent Angular/Standard evidence and later-framework isolation;
9. exact ADR-009 Public/Internal migration and Experimental compatibility; and
10. every M18 exclusion and delivery gate.

Acceptance authorizes only a separate D-025 promotion-readiness review. If that
review is not ready or leaves material alternatives unresolved, M18 stops
before SPEC-008. If it passes, its own architecture ADR must be accepted before
SPEC preparation. No plan, code or external action is authorized here.
