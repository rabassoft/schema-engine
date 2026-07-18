# SPEC-008: Static Advanced Presentation Layout and Angular Container Pilot

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 18 July 2026
- **Acceptance date:** 18 July 2026
- **Milestone:** M18 — Static neutral advanced layout
- **Promoted capabilities:** narrow D-011 boundary accepted by
  [`review 098`](../reviews/098-d011-m18-advanced-layout-promotion-readiness.md)
  and narrow Angular Experimental D-025 boundary accepted by
  [`review 100`](../reviews/100-d025-angular-container-kit-promotion-readiness.md)
- **Accepted baselines:** [`SPEC-001 v0.1.15`](./001-controlled-form-runtime.md)
  through [`SPEC-007 v0.1.0`](./007-synchronous-ajv-validator.md)
- **Accepted architecture:**
  [`ADR-023 revision 1`](../adrs/023-contenedores-layout-neutral-estatico.md)
  and
  [`ADR-024 revision 1`](../adrs/024-spi-contenedores-angular-y-piloto-angular-aria.md)
- **Complete review:** [`review 102`](../reviews/102-spec-008-review.md) cycle 5
  passed all twelve areas with zero findings after twenty corrections
- **Authority:** Accepted observable M18 contract; authorizes PLAN-020
  preparation/review only, not implementation, dependency installation,
  package/version mutation, publication, commit or push

## 1. Status and authority

This Accepted specification extends accepted SPEC-005 only for static root
presentation tabs, accordions and logical grids, their independent Angular and
Standard projection, and the narrow Angular presentation-container SPI plus
sole Angular Aria 22 pilot accepted by ADR-024.

All unchanged compiler, data-node, field, runtime, operation, scope,
validation, controlled-state, object, collection, reference, nullable,
renderer, package, stability and publication rules in SPEC-001 through
SPEC-007 remain authoritative. Where this document widens a SPEC-005 union or
projection rule, it replaces only that exact rule.

Acceptance may authorize preparation and complete review of PLAN-020 only. It
does not approve that plan or authorize implementation, dependency
installation, version mutation, package creation, publication, commit or push.

## 2. Goals

M18 shall specify:

1. root-only static tabs, accordion and bounded logical-grid UI grammar;
2. immutable normalized container, panel and grid-item definitions;
3. exact-once identity with every existing root form node;
4. descriptor-safe inspection, closed diagnostics and atomic default-forest
   fallback;
5. exact manual-definition validation and unchanged runtime authority;
6. target-owned tabs/accordion state, mounted hidden descendants and logical
   grid fallback;
7. independent native Angular and private Standard projection;
8. a separate Public + Experimental Angular container registry with mandatory
   native registrations;
9. exactly one isolated Angular Aria 22 pilot package and opt-in stylesheet;
10. exact package, peer, theme, support and compatibility boundaries; and
11. conformance evidence sufficient to prepare PLAN-020 without implementing
    it.

## 3. Non-goals

M18 does not support wizards, workflow, steps, actions, commands, slots,
arbitrary templates, conditional layout, generated scopes, nested-object or
collection-item presentation, dynamic definition reconciliation, arbitrary
rows/coordinates/areas/gaps/alignment/breakpoints, controlled or persisted
layout state, URL synchronization, SSR, hydration, portals or lazy containers.

It does not add Angular Aria field renderers, a complete component suite,
generic Rabassoft design tokens, shared CSS, a Standard package, React, Vue,
legacy Angular, Angular 23, a second UI-library pilot, automatic package
detection, runtime kit switching or any Stable API. Publication and release
remain separate gates.

## 4. Public neutral contracts

### 4.1 Raw UI Schema

The root entry union becomes:

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

`UiSchema.presentation` retains the accepted optional root-only member and
continues to conflict with root `order`. The existing string and section entry
forms remain source compatible.

### 4.2 Normalized definitions

The normalized union becomes:

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

Core also adds:

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

`TextResolutionContext` adds
`AdvancedPresentationTextResolutionContext`. No runtime snapshot, runtime
method, operation, scope or validation contract changes.

Every new or widened root export is Public + Experimental + Active. No entry
point is added.

## 5. Root grammar and inspection

### 5.1 Common rules

Advanced entries are valid only in the accepted root presentation forest.
Raw `presentation` at object, collection or item UI locations remains invalid.
All containers, panels and grid items are ordinary objects inspected only
through own enumerable data descriptors. Accessors are never executed.

Container `id` is a non-empty string retained exactly. Container `label` and
panel `label` are non-blank strings retained exactly. Section, tabs, accordion
and grid IDs share one global namespace. Panel IDs are non-empty and unique
within their direct owner. No value is trimmed, coerced, Unicode-normalized or
case-folded.

Inspection is iterative and has no Public depth limit. Active ancestry detects
cycles across entries, panels, `children`, grid items and `child`. The same raw
object may be reused outside active ancestry and is inspected independently.
Every direct root form node must still occur exactly once after flattening.

Unknown own keys follow the existing unknown UI-member/opaque-extension
policy after all known members of that object. Those independent warnings do
not by themselves invalidate presentation.

### 5.2 Tabs and accordion

Known members are inspected in exact order `kind`, `id`, `label`, `panels`.
`kind` is exactly `tabs` or `accordion`. `panels` is a dense non-empty array.

Each panel is an ordinary object inspected in exact order `kind`, `id`,
`label`, `children`. `kind` is exactly `panel`; `children` is a dense non-empty
array of `UiPresentationEntry`. A panel is never a root/general entry and can
occur only as a direct member of `panels`.

### 5.3 Logical grid

Grid known members are inspected in exact order `kind`, `id`, `label`,
`columns`, `items`. `columns` is exactly an integer `1`, `2`, `3` or `4`.
`items` is a dense non-empty array.

Each item is an ordinary wrapper inspected in exact order `span`, `child`.
Absent or inherited `span` normalizes to `1`; an own accessor is invalid. An
own span is an integer from `1` through the owning `columns`. `child` is one
required `UiPresentationEntry`. Item placement is source-order automatic; no
authored coordinate or target metadata exists.

### 5.4 Existing section compatibility

Section inspection retains SPEC-005 member order, reason vocabulary and
semantics. A raw object entry with missing, accessor or non-string `kind`
continues to use the applicable `section-member-*` diagnostic with expected
`section`. A string `kind` other than the four supported container kinds uses
the new `unsupported-entry-kind` reason. This preserves existing malformed
section behavior while allowing deterministic dispatch of supported kinds.

The existing `invalid-entry` reason widens only its `expected` parameter to
`root node name or presentation container object`. Its `entryIndex`,
`actualType`, path and precedence remain unchanged.

## 6. Normalization, identity and fallback

Keys are exact:

```ts
container.key === JSON.stringify([container.kind, container.id]);
panel.key === JSON.stringify([owner.kind, owner.id, 'panel', panel.id]);
item.key === JSON.stringify(['grid', grid.id, 'item', itemIndex]);
```

Section keys remain `JSON.stringify(['section', section.id])`. The compiler
copies every accepted source member into new normalized objects. Every array,
wrapper, container, panel and grid item is deeply frozen; no normalized value
retains a raw UI container or array.

Depth-first flattening through section children, panel children and grid-item
children yields the exact objects in `FormDefinition.nodes`, each exactly
once. `nodes` and `fields` retain all data authority. Grid-item indexes are
definition-local identity only and are not persisted.

Absent root presentation retains SPEC-005's default wrapper forest. Any
invalid authored presentation emits all independently collectible safe
warnings, discards every authored container and returns that same complete
default forest when no unrelated compiler error blocks the definition. There
is no partial layout recovery.

## 7. UI diagnostics

Every advanced-presentation defect uses the accepted
`INVALID_UI_PRESENTATION` envelope: `severity: 'warning'`,
`source: 'ui-schema'`, exact immutable `documentPath`, no retained caller
value, and no `dataPath` except for an unsupported nested location. Fallback is
`UI presentation is invalid.`

SPEC-005 reasons remain closed and unchanged. M18 adds exactly:

| Reason                      | Exact additional parameters                                                       |
| --------------------------- | --------------------------------------------------------------------------------- |
| `unsupported-entry-kind`    | `{ expected: 'section, tabs, accordion or grid', actualType: 'string' }`          |
| `container-member-missing`  | `{ containerKind, member, expected }`                                             |
| `container-member-accessor` | `{ containerKind, member, expected }`                                             |
| `container-member-invalid`  | `{ containerKind, member, expected, actualType }`                                 |
| `container-member-blank`    | `{ containerKind, member: 'label', expected: 'non-blank string' }`                |
| `duplicate-container-id`    | `{ containerKind, containerId, firstDocumentPath }`                               |
| `empty-panels`              | `{ containerKind, containerId, expected: 'non-empty dense panels array' }`        |
| `sparse-panel`              | `{ containerKind, panelIndex }`                                                   |
| `panel-accessor`            | `{ containerKind, panelIndex }`                                                   |
| `panel-not-object`          | `{ containerKind, panelIndex, expected: 'panel object', actualType }`             |
| `panel-member-missing`      | `{ containerKind, panelIndex, member, expected }`                                 |
| `panel-member-accessor`     | `{ containerKind, panelIndex, member, expected }`                                 |
| `panel-member-invalid`      | `{ containerKind, panelIndex, member, expected, actualType }`                     |
| `panel-member-blank`        | `{ containerKind, panelIndex, member: 'label', expected: 'non-blank string' }`    |
| `duplicate-panel-id`        | `{ containerKind, containerId, panelId, firstDocumentPath }`                      |
| `empty-panel`               | `{ containerKind, panelId, expected: 'non-empty dense children array' }`          |
| `empty-grid`                | `{ containerId, expected: 'non-empty dense items array' }`                        |
| `sparse-grid-item`          | `{ itemIndex }`                                                                   |
| `grid-item-accessor`        | `{ itemIndex }`                                                                   |
| `grid-item-not-object`      | `{ itemIndex, expected: 'grid item object', actualType }`                         |
| `grid-item-member-missing`  | `{ itemIndex, member: 'child', expected: 'presentation entry' }`                  |
| `grid-item-member-accessor` | `{ itemIndex, member, expected }`                                                 |
| `grid-item-member-invalid`  | `{ itemIndex, member, expected, actualType }`                                     |
| `grid-span-exceeds-columns` | `{ itemIndex, span, columns, expected: 'integer not greater than grid columns' }` |

`containerKind` is `tabs`, `accordion` or `grid`. Exact expectations are:

| Structure/member        | `expected`                       |
| ----------------------- | -------------------------------- |
| container `id`          | `non-empty string`               |
| container `label`       | `non-blank string`               |
| tabs/accordion `panels` | `non-empty dense panels array`   |
| grid `columns`          | `integer from 1 through 4`       |
| grid `items`            | `non-empty dense items array`    |
| panel `kind`            | `panel`                          |
| panel `id`              | `non-empty string`               |
| panel `label`           | `non-blank string`               |
| panel `children`        | `non-empty dense children array` |
| grid-item `span`        | `integer from 1 through 4`       |
| grid-item `child`       | `presentation entry`             |

For panel rows, `containerKind` is exactly `tabs` or `accordion`. For grid-item
member rows, `member` is `span` or `child` and `expected` is the matching value
from the expectation table.

`actualType` uses the accepted safe vocabulary. No actual `kind`, member value,
provider value or thrown value is retained. `firstDocumentPath` is a frozen
copy of the earlier `id` member path. Missing/accessor/sparse cases omit
`actualType`.

An empty but otherwise valid array uses only `empty-panels`, `empty-panel` or
`empty-grid`, never the corresponding member-invalid reason. Panel/item
structural diagnostics remain collectible when their owner ID is invalid
because exact ownership is already present in `documentPath`; identity-bearing
duplicate/empty-container reasons are emitted only when the required safe ID
exists.

An item `span` outside integers `1` through `4` uses
`grid-item-member-invalid`; a valid bounded integer greater than the owning
`columns` uses `grid-span-exceeds-columns`. A present `child` that is neither a
string nor ordinary object uses `grid-item-member-invalid`. A string child or
ordinary-object child proceeds through the normal entry inspection and uses
the existing node or applicable container reason without a duplicate item
diagnostic.

Exact paths are:

- container members: the existing entry path plus the member;
- panel exterior: `...,'panels',panelIndex`;
- panel members: that path plus the member;
- grid-item exterior: `...,'items',itemIndex`;
- grid-item members: that path plus `span` or `child`; and
- an item child entry: that path plus `child` followed by its own descendants.

Diagnostic order is:

1. accepted root `order-conflict` and presentation exterior;
2. depth-first entry order;
3. each known member in sections 5.2–5.3 order;
4. duplicate ID at the later occurrence;
5. child entries in source order; and
6. missing root nodes in normalized `definition.nodes` order.

For an invalid member exterior, unsafe descendants of that member are not
inspected. Safe siblings and later entries continue. `cyclic-presentation`,
unknown-key diagnostics and existing missing/duplicate node diagnostics retain
SPEC-005 precedence and behavior.

Container IDs use one first-occurrence map. A later advanced container uses
`duplicate-container-id` even when the first occurrence is a section. A later
section uses existing `duplicate-section-id` even when the first occurrence is
advanced. Both point to the first ID member path. Panel IDs use a separate map
per direct tabs/accordion owner.

## 8. Manual FormDefinition validation

Runtime creation and `applyFormOperation()` extend the existing iterative,
descriptor-safe presentation validator. They do not require `Object.isFrozen`
and never execute accessors. Validation requires exact discriminants, own data
members, dense arrays, non-empty/blank rules, exact keys, global container-ID
and owner-local panel-ID uniqueness, valid spans, acyclicity and exact object
identity with every member of `definition.nodes`.

The accepted reasons remain, and these eight ADR-023 reasons are added without
adding any other manual-definition reason:

- `invalid-presentation-tabs`;
- `invalid-presentation-accordion`;
- `invalid-presentation-panel`;
- `invalid-presentation-grid`;
- `invalid-presentation-grid-item`;
- `invalid-presentation-entry-key`;
- `duplicate-presentation-container-id`; and
- `duplicate-presentation-panel-id`.

The first defect is reported. Shape/discriminant defects precede key defects;
key defects precede duplicate IDs; container/panel/item defects precede their
descendants; all precede missing presented-node membership.

`presentationIndexPath` is a frozen numeric path:

- root entry: `[entryIndex]`;
- section child: append `childIndex`;
- tabs/accordion panel: append `panelIndex`;
- panel child: append `panelIndex, childIndex`;
- grid item: append `itemIndex`; and
- grid-item child entry: append `itemIndex, 0`, then nested indexes.

The reason identifies whether the terminal index denotes a container, panel,
item or entry. Duplicate reasons also expose the later occurrence path only,
matching the existing manual section behavior.

Advanced container shape defects use their kind-specific reason. Panel and
grid-item shape defects use their exact respective reasons. A key mismatch on
tabs, accordion, grid, panel or grid item uses
`invalid-presentation-entry-key`; a section key mismatch retains
`invalid-presentation-section-key`. A later advanced container that duplicates
any earlier section/advanced ID uses
`duplicate-presentation-container-id`; a later section retains
`duplicate-presentation-section-id`. Panel duplicates are owner-local and use
`duplicate-presentation-panel-id`. These checks never merge the namespaces of
panels belonging to different owners.

An entry object with an unsupported or malformed normalized discriminant uses
existing `invalid-presentation-entry`. Once an exact supported discriminant is
present, a malformed tabs/accordion/grid, panel or item uses its corresponding
kind-specific reason above.

Runtime creation continues to emit `INVALID_RUNTIME_OPTIONS` with
`member: 'definition'`, `expected: 'valid collection FormDefinition'`,
`reason: 'invalid-value'`, safe actual description, exact
`definitionReason` and optional frozen `presentationIndexPath`.
`applyFormOperation()` continues to emit `INVALID_FORM_DEFINITION` with exact
`reason`, optional copied `presentationIndexPath`, fallback
`Form definition is invalid.`, and the operation target `dataPath` already
owned by that envelope. Validator and operation logic are not invoked after a
definition defect.

## 9. Text resolution

For each tabs, accordion, panel and grid label, the Angular projection calls
the accepted `TextResolver` with:

```ts
{
  formId,
  locale,
  presentation,
  member: 'label',
}
```

The exact normalized object and source label are used. An exception,
non-string result or blank result retains the exact source label and emits one
`TEXT_RESOLUTION_FAILED` warning with `source: 'runtime'`, no paths, fallback
`Advanced presentation text resolution failed.` and:

```ts
{
  presentationKind: presentation.kind,
  presentationKey: presentation.key,
  member: 'label',
  reason: 'exception' | 'non-string-result' | 'blank-string-result',
}
```

No thrown/result value is retained. Resolution follows depth-first projection
order: container label; each panel label before its children; or each grid-item
child in source order. Section and form-node local ordering is unchanged.
Projection identity is the exact object, `formId` and locale. Snapshot-only
changes neither resolve again nor redeliver the warning.

The private Standard shell resolves its own display labels under ADR-021 and
must preserve the exact source fallback and depth-first order. It does not call
or claim the Angular text-projection service, and its application-local
localization failures do not create a new Public diagnostic contract.

## 10. Target-neutral state, lifecycle and accessibility

### 10.1 Tabs

One panel is active. A fresh host starts on the first panel. Horizontal
`ArrowLeft`/`ArrowRight` move focus cyclically and activate; `Home`/`End` focus
and activate the first/last tab; pointer activation focuses and activates its
tab. Only the active tab is in the tab sequence.

Every panel subtree is instantiated exactly once at host creation and remains
mounted. Inactive content is absent from visual display, sequential focus and
the accessibility tree while continuing to reconcile confirmed snapshots.
Value, baseline, locale, validation, touched, focus, issues and application
reset that retains the same projection do not change selection. Complete host
replacement discards state and starts again at the first panel.

### 10.2 Accordion

Every panel starts collapsed. Zero, one or many panels may be expanded. A
native disclosure control toggles only its panel on pointer, `Enter` or
`Space`. Controls remain in source-order sequential navigation; M18 adds no
roving focus or Arrow/Home/End contract.

All panel subtrees are instantiated exactly once and remain mounted. Collapsed
content has the same visual, focus and accessibility hiding contract as an
inactive tab while continuing snapshot reconciliation. Retained host updates
preserve the expanded set; complete host replacement discards it.

### 10.3 Grid

Items use source-order automatic placement. An item occupies `span` cells in
the next row that can fit it. DOM, reading, keyboard and one-column fallback
order always equal source order. At constrained widths or when safe geometry is
unavailable, a target collapses to one column and ignores visual spans. The
target owns that threshold/capability decision; core exposes none.

Grid is an accessible labelled group and has no interaction state. `columns`
and `span` never become CSS strings, runtime data or target-specific metadata.

Placement uses one forward-only cursor. A row starts with `columns` remaining.
If the next span exceeds the remaining cells, the cursor starts a fresh row
before placing it; placement never backfills a prior gap. After placement the
span is subtracted, and exactly zero remaining starts a fresh row for the next
item. The one-column fallback places every item as span `1` in the same order.

### 10.4 Exact IDs and host failures

Targets derive these exact bases:

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

Container/panel/item roles apply the exact suffixes `--tablist`, `--tab`,
`--tabpanel`, `--accordion`, `--trigger`, `--region`, `--grid` and `--cell`.
Sections retain SPEC-005's fieldset/legend tuple. IDs and relationships are
collision-free across forms, kinds, containers, panels and items.

The resolved container label is the accessible name of the tablist, accordion
group or grid group. `tablistId` is on role `tablist`; each `tabId` is on its
role `tab`, exposes selected state and controls its matching `tabpanelId`; each
role `tabpanel` is labelled by that `tabId`. `accordionId` is on the owning
group; each disclosure button carries `triggerId`, expanded state and controls
`regionId`; each labelled region is labelled by its `triggerId`. `gridId` is
on the labelled group and every source-order logical item carries its
`cellId`. Extra library IDs may not replace, duplicate or break these
relationships.

A synchronous creation/binding failure destroys every partial resource owned
by that host, emits exactly one diagnostic, stops only that subtree and allows
independent siblings to continue:

| Code                                  | Parameters                                          | Fallback                                             |
| ------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `SECTION_HOST_INSTANTIATION_FAILED`   | `{ sectionId }`                                     | `Section host could not be instantiated.`            |
| `TABS_HOST_INSTANTIATION_FAILED`      | `{ presentationKind: 'tabs', presentationId }`      | `Tabs host could not be instantiated.`               |
| `ACCORDION_HOST_INSTANTIATION_FAILED` | `{ presentationKind: 'accordion', presentationId }` | `Accordion host could not be instantiated.`          |
| `GRID_HOST_INSTANTIATION_FAILED`      | `{ presentationKind: 'grid', presentationId }`      | `Grid host could not be instantiated.`               |
| `PANEL_HOST_INSTANTIATION_FAILED`     | `{ ownerKind, ownerId, panelId }`                   | `Presentation panel host could not be instantiated.` |

Every row is `severity: 'error'`, `source: 'runtime'`, has no paths, copies
safe identity only and retains no thrown value. Diagnostics follow failed host
creation order. Ordinary later browser/event failures are not silently
converted to form diagnostics.

## 11. Runtime and application ownership

Core validates the complete forest and otherwise ignores presentation.
Snapshots continue to mirror only `definition.nodes`; validator input remains
the exact schema and controlled value. Hidden/collapsed nodes remain present
and validated.

Selected tab and expanded panels are target-local ephemeral state. They are
never value, baseline, snapshot, operation, validation input, issue,
dirty/touched/focused state, `FormScope`, persistence, deep link or
application-controlled state. Layout does not generate scopes, suppress issues
or imply workflow. Reordering presentation cannot alter data or collection
identity.

## 12. Public Angular container SPI

### 12.1 Container domain and render model

The base Angular root entry point adds the nine Public + Experimental + Active
symbols fixed by ADR-024:

```ts
export type AngularPresentationContainerDefinition =
  | PresentationSectionDefinition
  | PresentationTabsDefinition
  | PresentationAccordionDefinition
  | PresentationGridDefinition;

export type AngularPresentationContainerRenderModel =
  | {
      readonly kind: 'section';
      readonly definition: PresentationSectionDefinition;
      readonly label: string;
      readonly legendId: string;
    }
  | {
      readonly kind: 'tabs';
      readonly definition: PresentationTabsDefinition;
      readonly label: string;
      readonly tablistId: string;
      readonly panels: readonly {
        readonly definition: PresentationPanelDefinition;
        readonly label: string;
        readonly tabId: string;
        readonly tabpanelId: string;
      }[];
    }
  | {
      readonly kind: 'accordion';
      readonly definition: PresentationAccordionDefinition;
      readonly label: string;
      readonly accordionId: string;
      readonly panels: readonly {
        readonly definition: PresentationPanelDefinition;
        readonly label: string;
        readonly triggerId: string;
        readonly regionId: string;
      }[];
    }
  | {
      readonly kind: 'grid';
      readonly definition: PresentationGridDefinition;
      readonly label: string;
      readonly gridId: string;
      readonly items: readonly {
        readonly definition: PresentationGridItemDefinition;
        readonly cellId: string;
      }[];
    };

export interface AngularPresentationContainerRenderer {
  readonly presentation: InputSignal<AngularPresentationContainerRenderModel>;
}

export type AngularPresentationContainerRendererType =
  Type<AngularPresentationContainerRenderer>;

export type AngularPresentationContainerTester = (
  definition: AngularPresentationContainerDefinition,
) => number | null;

export interface AngularPresentationContainerRegistration {
  readonly id: string;
  readonly renderer: AngularPresentationContainerRendererType;
  readonly tester: AngularPresentationContainerTester;
  readonly priority?: number;
}

export function provideSchemaPresentationContainer(
  registration: AngularPresentationContainerRegistration,
): Provider;
```

`SchemaPresentationEntryOutletComponent` and
`SchemaPresentationPanelOutletComponent` are the other two exports. Their only
Public inputs are respectively:

```ts
readonly entry: InputSignal<PresentationEntryDefinition>;
readonly panel: InputSignal<PresentationPanelDefinition>;
```

The complete render model is deeply frozen. Locale may replace labels/model
without recreating the selected renderer, outlets or target-local state.
Ordinary snapshots do not replace it. Testers receive only the exact immutable
normalized container and selection cannot depend on snapshots, locale, text,
layout state, viewport or CSS.

### 12.2 Child projection and claims

The two outlets are valid only below an adapter-created container host and
obtain live context from one Internal scoped injector. Direct use without that
context fails dependency injection. No Public snapshot, runtime, diagnostic
channel, resolver, raw token, context, ID helper or host factory exists.

A renderer cannot receive raw JSON/UI Schema, current value/baseline, runtime
snapshot, runtime/application mutation authority or the text resolver. It
cannot read `SchemaFormDirective`, instantiate leaf renderers directly, emit
operations, suppress issues or reinterpret presented-node identity.

Section/grid renderers place exactly one entry outlet for every direct expected
entry. Tabs/accordion renderers place exactly one panel outlet for every panel,
all from initial host creation. A panel outlet internally places every child
entry and owns `PANEL_HOST_INSTANTIATION_FAILED`.

Internal claims use exact definition object identity. Foreign, duplicate or
conditional replacement claims fail synchronously. After initial view creation
the adapter audits that the claimed set equals the complete expected set. A
missing claim destroys that host and uses its exact container/panel
instantiation-failure diagnostic. Claims remain until host destruction; every
outlet/descendant is destroyed exactly once.

A foreign or duplicate direct entry claim aborts its owning section/grid host;
a foreign or duplicate direct panel claim aborts its owning tabs/accordion
host; and a foreign or duplicate panel-child claim aborts that panel outlet.
Each destroys its partial subtree and emits only the corresponding exact host
instantiation-failure envelope. It never falls through to native selection.

### 12.3 Provider validation and selection

`provideSchemaEngineAngular()` installs the Internal resolver and the four
mandatory registrations in order: `native-section`, `native-tabs`,
`native-accordion`, `native-grid`. Each native tester returns rank `0` only for
its exact kind. Application registrations follow in Angular DI order.

Every tester runs in registration order. `null` is recoverable absence. The
highest non-negative finite integer rank wins, then highest finite integer
priority (default `0`), then earliest registration. A throwing tester or
invalid result discards only that candidate. Selection is fixed at host
creation; provider changes require a new bootstrap.

Provider inspection is descriptor-safe. Registrations are ordinary objects
with own data properties inspected in order `id`, `renderer`, `tester`, then
optional `priority`. IDs are exact non-empty unique strings. Any configuration
defect blocks the complete resolver/form projection.

At resolver construction, every valid member is copied into a new frozen
registration and the complete ordered list is frozen. Later mutation of a
caller registration object has no effect. The tester function identity is
copied but receives only a frozen normalized definition; the resolver never
re-reads the authored registration.

Validation reports the first member defect per registration in registration
order, continues across every independently inspectable registration, then
reports duplicate IDs at each later occurrence. Tester diagnostics occur only
after a valid resolver exists and follow tester evaluation order for that
container before any final no-match diagnostic.

The exact diagnostics are:

| Code                                           | Severity | Parameters                                                                  | Fallback                                                     |
| ---------------------------------------------- | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `INVALID_PRESENTATION_CONTAINER_REGISTRATION`  | error    | `{ index, member, expected, reason }`                                       | `Presentation container registration is invalid.`            |
| `DUPLICATE_PRESENTATION_CONTAINER_RENDERER_ID` | error    | `{ index, id, firstIndex }`                                                 | `Presentation container renderer id is duplicated.`          |
| `PRESENTATION_CONTAINER_TESTER_EXCEPTION`      | warning  | `{ index, id, presentationKind, presentationId }`                           | `Presentation container tester threw an exception.`          |
| `INVALID_PRESENTATION_CONTAINER_TEST_RESULT`   | warning  | `{ index, id, presentationKind, presentationId, actualType, actualValue? }` | `Presentation container tester returned an invalid rank.`    |
| `NO_PRESENTATION_CONTAINER_MATCH`              | error    | `{ presentationKind, presentationId }`                                      | `No presentation container renderer matches the definition.` |

All use `source: 'runtime'`, have no paths, are immutable and retain no provider
object, returned object/reference or thrown value. `actualValue` is a detached
copy and exists only for a safely copyable finite primitive.

Registration reasons are exactly:

| Condition                  | `reason`                  | `member`       | `expected`               |
| -------------------------- | ------------------------- | -------------- | ------------------------ |
| null/array/non-object      | `registration-not-object` | `registration` | `object`                 |
| absent required member     | `member-missing`          | exact member   | member expectation below |
| accessor required/optional | `member-accessor`         | exact member   | member expectation below |
| invalid `id`               | `invalid-id`              | `id`           | `non-empty string`       |
| invalid `renderer`         | `invalid-renderer`        | `renderer`     | `Angular component type` |
| invalid `tester`           | `invalid-tester`          | `tester`       | `callable tester`        |
| invalid `priority`         | `invalid-priority`        | `priority`     | `finite integer`         |

Missing/accessor expectations are the final four exact member expectations.
A function is not a registration object. Duplicate IDs use only the duplicate
code. Native registrations make no-match unreachable for accepted definitions,
but it remains tested.

### 12.4 Native fallback and selected-host failure

The native registrations require no optional peer, stylesheet or theme.
Absence of the pilot, no custom match, tester `null`, tester exception or
invalid test rank therefore permits native selection.

After selection, creation/binding failure emits the exact structural host
diagnostic and never retries native. Mid-host replacement could duplicate
children, discard state and hide a broken registration. Independent siblings
continue and all partial resources are destroyed.

## 13. Angular Aria pilot package

### 13.1 Package and exports

Exactly one future package is admitted:

| Item               | Normative value                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Package            | `@rabassoft/schema-engine-angular-aria`                                                            |
| Initial line       | `0.1.x`, private implementation first                                                              |
| Root export `.`    | only `provideSchemaEngineAngularAriaContainers()`                                                  |
| Style export       | `./styles.css`, explicitly imported by applications                                                |
| Base peer          | `@rabassoft/schema-engine-angular` `^0.3.0`                                                        |
| Angular peer       | `@angular/core` `>=22.0.6 <23.0.0`                                                                 |
| UI-library peer    | `@angular/aria` `>=22.0.5 <23.0.0`                                                                 |
| Required UI peer   | `@angular/cdk` `>=22.0.5 <23.0.0`; resolved patch equals the exact peer of the resolved Aria patch |
| Runtime dependency | `tslib` only                                                                                       |
| License            | Schema Engine dual AGPL/commercial; Angular Aria/CDK remain MIT peers                              |

The root function returns environment providers for exactly
`angular-aria-section`, `angular-aria-tabs`, `angular-aria-accordion` and
`angular-aria-grid`, each rank `10` for its exact kind and priority `0`. It
does not configure the base adapter, register fields, import CSS, detect
packages or select a theme.

Its Public declaration is exactly:

```ts
export declare function provideSchemaEngineAngularAriaContainers(): EnvironmentProviders;
```

Workspace Schema Engine dependencies use `workspace:` only in source;
artifacts contain ordinary SemVer. Angular, Aria and CDK are peers/dev
dependencies, never bundled or copied. Core/base Angular declarations,
manifests, tarballs and clean consumers contain no pilot import, peer, style or
asset.

### 13.2 Selective Angular Aria composition

The pilot uses Angular Aria tabs with follow-focus selection, wrapping,
preserved content and exact model IDs. One private signal starts with the first
`tabpanelId` and binds two-way to `ngTabList.selectedTab`; tab and panel values
use that `tabpanelId`, while their DOM IDs use the exact `tabId` and
`tabpanelId`. No lazy tab content is used.

Section remains native fieldset/legend. Accordion remains native
button/region with an initially empty private expanded-ID set because Angular
Aria's broader Arrow/Home/End focus behavior is not part of M18. Grid remains
source-order CSS grid with one-column fallback because a data-grid primitive
would add unsupported navigation/semantics. All four kinds are registered and
styled by the package; this is still the sole pilot rather than a second
native package.

### 13.3 Styles and theme ownership

The JS root has no style side effect. `./styles.css` is opt-in, scoped only to
pilot container hosts and contains no reset, body/html selector, font, icon,
typography system or application layout.

The only Public + Experimental style properties are:

```css
--se-aria-container-surface
--se-aria-container-text
--se-aria-container-border
--se-aria-container-accent
--se-aria-container-radius
--se-aria-container-gap
```

Defaults are exactly:

```css
--se-aria-container-surface: Canvas;
--se-aria-container-text: CanvasText;
--se-aria-container-border: currentColor;
--se-aria-container-accent: LinkText;
--se-aria-container-radius: 0.5rem;
--se-aria-container-gap: 1rem;
```

The application owns light/dark/theme selectors, values, persistence and
system preference. Internal host classes/selectors are not customization API.
The six properties never style fields, native base Angular, Standard or future
targets.

Adding or renaming a property requires at least a MINOR release while the
pilot remains `0.y`; removing one or changing its meaning follows ADR-010's
breaking-change rule. None becomes Stable through implementation or release.

### 13.4 Compatibility and support

The initial verified tuple is Angular core/forms `22.0.6`, Angular Aria
`22.0.5` and CDK `22.0.5`. The resolved CDK patch must equal the exact peer
declared by the resolved Aria patch. Lower bounds and latest compatible patches
must pass clean installation, partial compilation, strict types, unit/DOM,
Chromium and production-build evidence before any release.

Support tiers are:

1. native base Angular: Public + Experimental, maintained;
2. official Angular Aria pilot: Public + Experimental, private first;
3. custom/community providers: Public + Experimental, self-supported;
4. other libraries/Angular majors: unsupported; and
5. other targets: not implied.

No tier is Stable. Changing an Experimental SPI/property incompatibly requires
at least MINOR and migration notes. Reducing a supported range follows ADR-010.
A wider upstream peer range creates no support without evidence.

The coordinated private delivery matrix is exact:

| Package line                                  | Required peers                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `@rabassoft/schema-engine@0.3.0`              | none                                                                               |
| `@rabassoft/schema-engine-angular@0.3.0`      | core `^0.3.0`; Angular core/forms `>=22.0.6 <23.0.0`, both at the same exact patch |
| `@rabassoft/schema-engine-angular-aria@0.1.0` | base Angular `^0.3.0`; Angular core `>=22.0.6 <23.0.0`; Aria/CDK as section 13.1   |

These versions identify the later private implementation/candidate line only.
They do not require lockstep publication, change existing `0.2.0` registry
artifacts or authorize a release.

## 14. Private Standard and reference evidence

The private Standard shell independently projects the widened normalized
forest using direct core contracts and native DOM. It imports no Angular,
pilot, Aria, CDK, renderer component, controller, CSS or lifecycle helper.

Standard implements the same initial state, mounted hidden descendants,
source order, exact IDs, accessibility, snapshot reconciliation and teardown
semantics with target-owned code. Its application-local label resolution does
not claim Angular `TextResolver` behavior or create a Standard adapter API.

The neutral reference catalog adds one Internal `advanced-layout` feature and
one `advanced-presentation` scenario that composes section, nested tabs,
accordion and grid over existing root nodes without changing value or
operations. Both shells consume the same authored input and independently
demonstrate it. The Angular shell can switch explicitly between native and
Angular Aria provider compositions only by separate application bootstraps or
test harnesses; runtime kit switching is not presented.

Reference parity is semantic, not pixel equality or shared implementation.
Package/source/release checks prove that the catalog and both apps remain
private and absent from public artifacts.

## 15. Public/Internal migration inventory

| Classification          | Exact effect                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core         | `UiTabsSchema`, `UiAccordionSchema`, `UiPresentationPanelSchema`, `UiGridSchema`, `UiGridItemSchema`, `PresentationTabsDefinition`, `PresentationAccordionDefinition`, `PresentationPanelDefinition`, `PresentationGridDefinition`, `PresentationGridItemDefinition`, `AdvancedPresentationTextMember`, `AdvancedPresentationLabelDefinition`, `AdvancedPresentationTextResolutionContext`. |
| Changed Public core     | Widened `UiPresentationEntry`, `PresentationEntryDefinition`, `TextResolutionContext`; compiler diagnostics/fallback; normalized/manual-definition validation.                                                                                                                                                                                                                              |
| New Public base Angular | `AngularPresentationContainerDefinition`, `AngularPresentationContainerRenderModel`, `AngularPresentationContainerRenderer`, `AngularPresentationContainerRendererType`, `AngularPresentationContainerTester`, `AngularPresentationContainerRegistration`, `SchemaPresentationEntryOutletComponent`, `SchemaPresentationPanelOutletComponent`, `provideSchemaPresentationContainer`.        |
| Changed Public Angular  | `provideSchemaEngineAngular()` installs Internal container resolution/native registrations without signature change; `SchemaFormDirective` projects the widened forest.                                                                                                                                                                                                                     |
| Internal base Angular   | Raw token/resolver/result, model/text/ID projector, scoped host context, claim audit, native components/registrations, recursive implementation, diagnostics and cleanup.                                                                                                                                                                                                                   |
| New pilot Public        | Package root provider, `./styles.css` and six exact kit-local CSS properties.                                                                                                                                                                                                                                                                                                               |
| Pilot Internal          | Four components/registrations, selective Aria composition, target state, classes, CSS implementation and conformance helpers.                                                                                                                                                                                                                                                               |
| Private Standard/apps   | Independent DOM projection, `advanced-layout` feature/scenario and target-specific tests; no exported adapter.                                                                                                                                                                                                                                                                              |
| Unchanged               | Runtime snapshots/methods, operations, scopes, validator contracts/input, data definitions/identity, leaf registry, React/Vue, current published artifacts and repository visibility.                                                                                                                                                                                                       |

All listed APIs are Experimental. No raw provider token, resolver, pilot
component class, CSS selector, test helper or application type is Public.
There is no unlisted Public change.

Because M18 widens Public Experimental core/base Angular contracts, any later
delivery candidate uses core and base Angular `0.3.0`; the pilot begins at
private `0.1.0`. This normative compatibility line does not itself mutate
manifests, create a release candidate or authorize publication.

## 16. Required conformance

A future plan must map fixtures and tests for at least:

1. every valid raw/normalized tabs, accordion, panel, grid and item form;
2. every added UI reason, parameter, path, precedence and fallback;
3. hostile accessors, sparse arrays, cycles, reused objects, IDs including
   `__proto__`, punctuation, whitespace and lone surrogates;
4. atomic fallback retaining every root node and independent safe diagnostics;
5. every manual-definition reason/path and validator/operation non-invocation;
6. deep immutability, exact keys and exact presented-node object identity;
7. text success and all failure reasons/order across locale changes;
8. first-tab/all-collapsed state and every retained/replaced-host boundary;
9. mounted hidden descendants, reconciliation and exact-once destruction;
10. source-order grid placement and constrained/capability one-column fallback;
11. exact IDs, roles, names, keyboard behavior, inert/hidden state and host
    failures in independent Angular native and Standard lanes;
12. descriptor-safe Angular registration validation and every exact diagnostic;
13. rank/priority/order, overrides, tester failures, native fallback, immutable
    selection and no selected-host retry;
14. foreign, duplicate and missing child claims with nearest failure ownership;
15. native and Aria equivalent semantic scenarios over exact same definitions;
16. selective Aria tabs plus native section/accordion/grid composition;
17. six CSS properties, opt-in/no-side-effect style and app-owned themes;
18. exact peers, Aria/CDK patch alignment, partial compilation and lower/latest
    clean consumers;
19. package/declaration/tarball isolation for core, base Angular and pilot;
20. reference scenario, both shells, strict types, production builds and
    independent Chromium lanes;
21. unchanged ADR-007 leaves, objects, collections, nullable fields, runtime,
    operations, scopes, validation and existing conformance; and
22. no publication, registry, release, repository or external-system action.

Native and pilot assertions are semantically equivalent, not pixel-based. A
pilot failure blocks M18 completion and cannot be relabelled native-only
success. Reference apps never replace package or clean-consumer evidence.

## 17. Acceptance criteria

SPEC-008 may be accepted only when:

1. every rule is consistent with accepted SPEC-005 and ADR-023/024;
2. grammar, normalization, identity, fallback and descriptor safety are exact;
3. all new UI/manual/provider diagnostics, paths, order and fallbacks are
   closed;
4. target-owned state, mounted lifecycle, grid and accessibility are exact;
5. runtime, application, validation, operation and scope authority is
   unchanged;
6. the nine-symbol Angular SPI and child-claim boundary are minimal and exact;
7. native fallback, tester isolation and selected-host failure do not conflict;
8. exactly one Aria pilot, package/style/theme/compatibility isolation and all
   support tiers are closed;
9. Standard remains private and independently implemented;
10. the ADR-009 migration inventory contains every transitive Public change;
11. all deferred exclusions remain inactive;
12. no plan, code, dependency, version or external action precedes acceptance;
    and
13. every correction restarts the complete review until one pass has zero
    findings and no unresolved change request.

Acceptance authorizes only PLAN-020 preparation and complete review. Explicit
plan approval remains required before implementation.
