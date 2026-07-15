# ADR 017: Static neutral presentation groups

- **Status:** Accepted
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Accepted revision:** 0
- **Promotes:** [`D-042`](../roadmap/deferred-decisions.md), narrow M12
  normative design only
- **Requires:** accepted
  [`M12 promotion-readiness review`](../reviews/022-m12-advanced-ui-promotion-readiness.md),
  [`ADR-007`](./007-resolucion-renderers-testers.md),
  [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-014 revision 2`](./014-modelo-objetos-anidados-paths-profundos.md) and
  [`ADR-015 revision 4`](./015-modelo-colecciones-identidad-operaciones.md)
- **Complete review:**
  [`review 023`](../reviews/023-adr-017-review.md) corrected two current-state
  documentation findings; cycle 3 passed all eight areas with zero findings;
  Ricard's standing authorization then accepted the ADR
- **SPEC preparation authorized:** Yes; no plan or implementation is authorized

## 1. Context

M9 and M10 established an immutable normalized data-node tree, a stable leaf
projection, collection item templates and fixed Angular object, collection and
item hosts. Those structures intentionally mirror managed data. They do not
provide presentation-only grouping and must not be reinterpreted as a layout
language.

The accepted M12 readiness review rejects wholesale promotion of D-011 and
D-012. Tabs, accordions, wizards, grids, slots, actions, responsive behavior,
layout state and declarative validation scopes have different owners and
lifecycles. Introducing them together would mix presentation, workflow,
runtime state and adapter capability negotiation.

D-042 therefore supplies one concrete piece of evidence: a static `section`
group that changes projection only. The design must keep normalized schema
semantics, controlled state, runtime scopes and leaf renderer selection
unchanged while proving that presentation-only nodes can remain neutral and
accessible.

## 2. Decision

ADR-017 proposes a required immutable presentation forest on
`FormDefinition`. The forest wraps every existing root form node exactly once
and may introduce nested static sections. It is a projection of the normalized
root node forest, never another source of managed data semantics.

The first slice is root-only. A root object or collection remains one presented
form node whose existing fixed host owns its complete subtree. Sections cannot
address nested object children, collection items or item-template descendants.
This restriction provides a useful grouping primitive without inventing
instance layout or changing M9/M10 container ownership.

Acceptance of this ADR would authorize preparation and review of the M12 SPEC
only. It would not authorize a plan, code, Public API change, dependency,
package, publication or Stable promotion.

### 2.1 UI Schema input

The root `UiSchema` may add one optional `presentation` member:

```ts
export interface UiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
  readonly presentation?: readonly UiPresentationEntry[];
}

export type UiPresentationEntry = string | UiSectionSchema;

export interface UiSectionSchema {
  readonly kind: 'section';
  readonly id: string;
  readonly label: string;
  readonly children: readonly UiPresentationEntry[];
}
```

A string entry references one direct root form node by its exact schema
property name. A section contains form-node references or nested sections.
Sections do not contain arbitrary metadata, actions, conditions, breakpoints,
renderer IDs or scope declarations.

When `presentation` is present and valid:

1. every direct root form node occurs exactly once in its complete flattened
   entry tree;
2. every reference names a known direct root form node;
3. every section ID is a non-empty string unique across the complete
   presentation tree;
4. every label is a non-blank string and is preserved exactly as source text;
5. every section has a non-empty `children` array; and
6. section nesting is finite, descriptor-safe and has no public arbitrary
   depth limit.

Root `order` and root `presentation` are two ordering authorities and cannot be
active together. If both are present, `presentation` is invalid and the
compiler uses the ordinary `order` result as its fallback. Root `fields`
remains valid alongside either member because it owns node presentation
metadata, not grouping or order.

`presentation` is not valid on `ObjectUiSchema`, `ArrayUiSchema` or
`ItemUiSchema` in this slice. Raw nested occurrences are incompatible UI
members and never expand the root-only boundary.

### 2.2 Normalized presentation forest

The Public normalized contracts add:

```ts
export interface FormDefinition {
  readonly nodes: readonly FormNodeDefinition[];
  readonly fields: readonly FieldDefinition[];
  readonly presentation: readonly PresentationEntryDefinition[];
}

export type PresentationEntryDefinition =
  PresentedFormNodeDefinition | PresentationSectionDefinition;

export interface PresentedFormNodeDefinition {
  readonly kind: 'form-node';
  readonly node: FormNodeDefinition;
}

export interface PresentationSectionDefinition {
  readonly kind: 'section';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly children: readonly PresentationEntryDefinition[];
}
```

`FormDefinition.nodes` remains the sole structural authority for runtime
semantics. `fields` remains its identity-consistent leaf projection.
`presentation` is a third identity-consistent view used only for projection:

- flattening `kind: 'form-node'` entries depth first yields every object in
  `FormDefinition.nodes` exactly once and no other form-node object;
- a presented node retains the exact `FormNodeDefinition` object reference;
- section children and the complete forest are deeply immutable and acyclic;
- sections have no data path, required flag, presence, dirty, touched, focus,
  validity, issues or runtime snapshot; and
- no operation, validator assignment or scope target can address a section.

When raw UI `presentation` is absent or invalid, the compiler still emits the
required normalized property: one `form-node` wrapper for each normalized root
node in its existing `nodes` order, with no section. This keeps adapters on one
closed normalized contract and preserves all fields.

Manually supplied `FormDefinition` values must provide the same required,
identity-consistent presentation forest. Existing manual consumers must add
the default wrapper forest when they do not need sections. Runtime creation and
`applyFormOperation()` validate this view together with `nodes` and `fields`;
an invalid manual presentation uses their existing malformed-definition error
envelopes and prevents consumer code or validation from running.

### 2.3 Identity and deterministic order

Section `id` is application metadata and is compared as an exact string. Core
does not trim, normalize, case-fold or localize it. Blankness validation may
inspect whitespace, but the accepted source string is retained unchanged.

The normalized section key is exactly:

```ts
JSON.stringify(['section', id]);
```

It is globally unique within one presentation forest because section IDs are
globally unique. The tagged tuple keeps section identity in a separate domain
from data-node path keys.

Array order is presentation order at every level. Depth-first traversal is
used only to validate exact node membership and section-ID uniqueness; it does
not flatten the forest for rendering. Reordering sections changes
presentation, never managed data order, `FormDefinition.nodes`, leaf order,
runtime snapshots or operations.

### 2.4 Inspection, diagnostics and fallback

UI presentation inspection is pure, descriptor-safe and iterative. It reads
only own enumerable data descriptors, never invokes accessors, never retains
caller containers in diagnostics and tracks active object ancestry so a cycle
stops deterministically. Reuse of one section object in independent sibling
branches is inspected independently and then rejected by duplicate section ID
or duplicate form-node membership where applicable.

The M12 SPEC must close `INVALID_UI_PRESENTATION` as one UI-warning family and
its exact reasons, parameters, document paths, precedence and fallback
messages. It must cover at least:

- invalid exterior or entry shape, sparse entries and accessors;
- unknown, missing or duplicate form-node references;
- missing, accessor, invalid, blank or duplicate section IDs;
- missing, accessor, invalid or blank labels;
- missing, accessor, invalid or empty children;
- active presentation cycles;
- incomplete root membership; and
- root `order` plus `presentation`, or presentation on an unsupported nested UI
  node.

Any defect makes the complete root `presentation` atomically invalid. The
compiler collects all independent safe diagnostics in deterministic source
order, discards every section from that member and emits the default wrapper
forest over the already normalized `nodes` order. A presentation defect is not
a schema error, never removes a field and does not block a definition that is
otherwise valid.

### 2.5 Text resolution and accessibility

A section label is required source text and participates in the existing
locale-aware text port. Public core adds:

```ts
export type SectionTextMember = 'label';

export interface SectionTextResolutionContext {
  readonly formId: string;
  readonly locale: string;
  readonly section: PresentationSectionDefinition;
  readonly member: SectionTextMember;
}
```

`TextResolutionContext` adds this branch and `TextResolver.resolve()` remains
the same method signature over the widened union. Resolver exceptions,
non-string results and blank results fall back to the exact source label and
use the existing `TEXT_RESOLUTION_FAILED` diagnostic family. The SPEC must
close exact section parameters, absence of `dataPath`/`documentPath`, ordering
and projection identity.

Angular uses one fixed Internal section host with semantic
`fieldset`/`legend` markup. Its DOM base is:

```ts
se-${encodeURIComponent(JSON.stringify([formId, 'section', sectionId]))}
```

and its legend uses the fixed `--legend` suffix. The tuple shape cannot collide
with the existing `[formId, path]` data-node base. Nested sections render nested
semantic groups. A section has no aggregate issue list or disabled state;
existing child hosts retain all runtime accessibility and state projection.

An exception during section-host creation destroys any partial component,
emits exactly one `SECTION_HOST_INSTANTIATION_FAILED` adapter diagnostic and
stops only that section subtree while independent root siblings continue. The
SPEC must close its safe parameters, path absence, ordering and fallback. As
with existing fixed hosts, this is not a general boundary for later template
or lifecycle failures.

### 2.6 Angular projection and renderer ownership

`SchemaFormDirective` projects `FormDefinition.presentation` rather than
iterating `FormDefinition.nodes` directly. A `form-node` entry delegates the
exact normalized node and its corresponding root snapshot to the existing
Internal node outlet. A section entry creates the fixed section host, resolves
its label and recursively projects its children.

ADR-007 remains unchanged: only primitive leaf definitions participate in
scored renderer selection. Sections, objects, collections and items are not
renderer registrations. D-042 introduces no container registry, custom
container renderer, portal, lazy renderer, adapter capability negotiation or
raw UI Schema interpretation in Angular.

Section projection is static for the life of one accepted definition. There is
no active/collapsed state, navigation, selection, conditional visibility or
runtime replacement. Angular Signal Forms remain private leaf edit buffers and
do not own section state or grouping.

### 2.7 Runtime, scopes and controlled ownership

Core runtime behavior is unchanged. Runtime snapshots continue to mirror only
managed data nodes. Sections do not affect:

- `value`, `baselineValue`, dirty or controlled update ownership;
- validation input, issue assignment, validity or visibility;
- focus, touched or reset behavior;
- `FormScope`, `FormScopeTarget` or scope registration semantics;
- form and collection operations or application helpers; or
- persistence, submit, workflow or baseline confirmation.

The application may independently construct a `FormScope` whose paths happen
to correspond to fields shown in a section, but the compiler does not generate,
register or attach that scope. D-012 remains Deferred.

### 2.8 Public/Internal inventory

Under ADR-009, the proposed migration is:

| Classification         | Exact effect                                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New Public core        | `UiPresentationEntry`, `UiSectionSchema`, `PresentationEntryDefinition`, `PresentedFormNodeDefinition`, `PresentationSectionDefinition`, `SectionTextMember` and `SectionTextResolutionContext`.                                     |
| Changed Public core    | Required `FormDefinition.presentation`; optional root `UiSchema.presentation`; widened `TextResolutionContext`; manual-definition validation; compiler UI diagnostics and fallback behavior.                                         |
| Changed Public Angular | `SchemaFormDirective` observably projects the normalized presentation forest; its signature and inputs/outputs are unchanged.                                                                                                        |
| New Public Angular     | None.                                                                                                                                                                                                                                |
| Internal Angular       | Section outlet/host, recursive presentation projection, section text snapshot/projector, DOM identity, creation-failure diagnostic and lifecycle ownership.                                                                          |
| Unchanged              | `FormDefinition.nodes/fields`, runtime/snapshot/operation/scope signatures and semantics, validator input, renderer registration/resolution, packages, entry points, export maps, dependencies, versions, publication and stability. |
| Consumer migration     | Repository and external manual definitions add the exact default wrapper forest or a valid section forest; compiler consumers receive the new required property automatically.                                                       |

All new and changed root exports remain Public + Experimental + Active. No API
becomes Stable. A later SPEC may close shapes and diagnostics named here but
cannot add another Public symbol, widen the root/collection boundary or change
section ownership without revising this ADR inventory.

## 3. Consequences

### Positive

- Presentation-only structure becomes explicit without changing the managed
  data tree or exposing raw UI Schema to adapters.
- Exact-once membership prevents accidental hiding or duplicate editing of one
  controlled field.
- One required normalized view gives compiler, manual-definition and adapter
  consumers the same invariant.
- Root-only grouping supplies evidence before nested/instance layout is
  designed.
- Fixed accessible projection avoids prematurely generalizing container
  renderers or adapter capabilities.

### Negative

- `FormDefinition` and text-context unions make an intentional breaking change
  to Public + Experimental contracts.
- A complete explicit presentation member is verbose because it must name every
  root node exactly once.
- Root-only sections cannot regroup children inside nested objects or
  collection items.
- Atomic fallback can discard valid sections because another entry is invalid,
  although every form node remains available in deterministic order.
- The first Angular adapter gains another fixed Internal host and lifecycle
  path.

## 4. Alternatives considered

### Reuse structural object nodes as sections

Rejected because object nodes own data paths, presence, validation and runtime
aggregation. A presentation-only section must have none of those semantics.

### Attach optional section IDs directly to form nodes

Rejected because flat tags cannot express deterministic nesting and order, and
would make group identity implicit across unrelated nodes.

### Store a separate layout tree of keys without object references

Rejected for the first slice because adapters would need a second lookup and
could observe stale or unknown keys. Exact object references make the
projection identity-consistent with `FormDefinition.nodes`.

### Allow omitted or repeated root nodes

Rejected because omission would become undeclared conditional visibility and
duplication would create two editors for one controlled state location.

### Allow partial recovery inside an invalid presentation

Rejected because surviving sections would depend on diagnostic traversal and
could silently regroup fields. Atomic fallback preserves one obvious form.

### Make sections renderer registrations

Rejected because ADR-007 selects primitive leaf editors. Container selection,
capability negotiation and custom layout renderers remain deferred.

### Generate a validation scope per section

Rejected because it would silently promote D-012 and move workflow authority
from the application into presentation metadata.

## 5. Explicit exclusions

ADR-017 does not activate:

- nested-object, collection-item or item-template presentation groups;
- tabs, accordions, wizards, grids, columns, slots or responsive rules;
- active, collapsed, selected, navigation or other layout state;
- conditional visibility, expressions or dependency graphs;
- actions, commands, submit, persistence or baseline changes;
- declarative or generated scopes;
- custom/container renderer registries, portals, lazy components or adapter
  capabilities;
- dynamic `FormDefinition` replacement;
- new packages/entry points, dependencies, publication or Stable APIs.

## 6. Required review before acceptance

Review must repeat after every correction until one complete cycle has zero
findings. It must verify:

1. separation between the data tree and presentation-only wrappers;
2. exact root-only membership, identity, order, nesting and fallback;
3. descriptor safety, hostile input, cycles, immutability and diagnostics;
4. text resolution, DOM identity, accessibility and Angular isolation;
5. unchanged runtime, scopes, operations, validation and controlled ownership;
6. unchanged ADR-007 renderer and M9/M10 fixed-container boundaries;
7. exact ADR-009 Public/Internal migration inventory; and
8. preservation of every D-011/D-012/D-042 exclusion and publication gate.

Acceptance may authorize drafting the M12 SPEC. It does not approve a plan or
implementation.
