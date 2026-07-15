# SPEC-005: Static Neutral Presentation Groups

- **State:** Accepted
- **Version:** 0.1.1
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Milestone:** M12 — Static neutral presentation groups
- **Promoted capability:** [`D-042`](../roadmap/deferred-decisions.md)
- **Accepted baselines:**
  [`SPEC-001 v0.1.15`](./001-controlled-form-runtime.md),
  [`SPEC-002 v0.1.2`](./002-nested-object-runtime.md),
  [`SPEC-003 v0.1.2`](./003-collection-runtime.md) and
  [`SPEC-004 v0.1.1`](./004-local-reference-resolution.md)
- **Accepted architecture:**
  [`ADR-017 revision 0`](../adrs/017-grupos-presentacion-estaticos.md)
- **Complete review:**
  [`review 024`](../reviews/024-spec-005-review.md) cycle 2 passed all ten areas
  with zero findings after four corrections
- **Implementation plan:** Completed PLAN-012 revision 1

## 1. Status and authority

This Accepted specification defines the observable D-042 extension required by
accepted ADR-017. It replaces accepted rules only for one root UI
`presentation` member, the normalized presentation forest and its first fixed
Angular projection. All unchanged compiler, data-node, runtime, operation,
scope, validation, renderer, package, stability and publication rules remain
authoritative.

Acceptance authorizes preparation and review of PLAN-012 only. It does not
approve that plan, change Public contracts or authorize implementation.

## 2. Goals

M12 shall specify:

1. one root-only static `section` primitive in UI Schema;
2. one required immutable normalized presentation forest;
3. exact-once identity with the existing root `FormDefinition.nodes` objects;
4. deterministic section identity, nesting, order, diagnostics and atomic
   fallback;
5. locale-aware accessible section labels;
6. one fixed Internal Angular section host; and
7. no change to managed data or runtime semantics.

## 3. Non-goals

M12 does not support nested-object or collection-item presentation groups;
tabs, accordions, wizards, grids, columns, slots, responsive behavior, layout
state, conditions, actions, generated scopes, custom container renderers,
adapter capabilities or dynamic definitions. It adds no package, entry point,
dependency, publication or Stable API.

D-011 and D-012 remain Deferred outside D-042.

## 4. Public contracts

Core adds these Public + Experimental + Active contracts:

```ts
export type UiPresentationEntry = string | UiSectionSchema;

export interface UiSectionSchema {
  readonly kind: 'section';
  readonly id: string;
  readonly label: string;
  readonly children: readonly UiPresentationEntry[];
}

export interface UiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
  readonly presentation?: readonly UiPresentationEntry[];
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

export interface FormDefinition {
  readonly nodes: readonly FormNodeDefinition[];
  readonly fields: readonly FieldDefinition[];
  readonly presentation: readonly PresentationEntryDefinition[];
}

export type SectionTextMember = 'label';

export interface SectionTextResolutionContext {
  readonly formId: string;
  readonly locale: string;
  readonly section: PresentationSectionDefinition;
  readonly member: SectionTextMember;
}
```

`TextResolutionContext` adds `SectionTextResolutionContext`. `TextResolver` has
no signature change beyond that widened Public union.

No Public Angular symbol or method signature is added. The observable behavior
of `SchemaFormDirective` changes to project `definition.presentation`.

## 5. Root UI presentation grammar

`presentation` is optional only on the root `UiSchema`. It must be an ordinary
dense array inspected through own descriptors. Each entry is either:

- a string equal to one direct root schema property name; or
- an ordinary section object with the supported `kind`, `id`, `label` and
  `children` members; additional own keys follow the accepted unknown UI-member
  and opaque-extension behavior.

Section members are own enumerable data properties. `kind` is exactly
`'section'`. `id` is a non-empty string, globally unique in the presentation
tree and retained without trimming or normalization. `label` is a non-blank
string retained exactly. `children` is a non-empty dense array of entries.

Every direct root node name must occur exactly once in the flattened entry
tree. Nested object children, collection items and item-template descendants
cannot be named. A root object or array is one atomic named entry.

An empty presentation is valid only when `FormDefinition.nodes` is empty. A
finite presentation has no Public depth limit and inspection must be iterative.

Root `order` and root `presentation` cannot both be active. Their coexistence
is an invalid presentation, but `order` remains effective for the fallback.
Root `fields` remains compatible. A raw `presentation` member at any nested UI
node is invalid at that location and does not affect independent root UI.

## 6. Normalized forest invariants

Compilation always returns a required `presentation` on success.

For a valid UI presentation, depth-first traversal of every
`kind: 'form-node'` entry shall yield the exact objects in `definition.nodes`,
each exactly once, in presentation order. The traversal may reorder the view
but does not mutate `definition.nodes` or `definition.fields`.

For absent or invalid UI presentation, the normalized default is:

```ts
definition.nodes.map((node) => Object.freeze({ kind: 'form-node', node }));
```

The array, every wrapper, every section and every `children` array are frozen.
No normalized structure retains raw UI arrays or section objects.

Each normalized section has the exact accepted source `id` and `label`, and:

```ts
section.key === JSON.stringify(['section', section.id]);
```

Section IDs and keys are unique across the complete forest. Sections have no
path, required state, snapshot, presence, validity, issue, dirty, touched,
focus, operation or scope identity.

## 7. UI diagnostics and atomic fallback

Every presentation-input defect emits `INVALID_UI_PRESENTATION` with
`severity: 'warning'`, `source: 'ui-schema'`, no retained caller value and the
exact immutable UI `documentPath`. `dataPath` appears only for an unsupported
nested UI location and equals that normalized data-node path.

The closed `reason` vocabulary and additional parameters are:

| Reason                    | Additional parameters                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| `presentation-accessor`   | `{ expected: 'dense array' }`                                              |
| `presentation-not-array`  | `{ expected: 'dense array', actualType }`                                  |
| `order-conflict`          | `{ member: 'order', expected: 'one root ordering authority' }`             |
| `sparse-entry`            | `{ entryIndex }`                                                           |
| `entry-accessor`          | `{ entryIndex }`                                                           |
| `invalid-entry`           | `{ entryIndex, expected: 'root node name or section object', actualType }` |
| `unknown-node`            | `{ entryIndex, node }`                                                     |
| `duplicate-node`          | `{ entryIndex, node, firstDocumentPath }`                                  |
| `missing-node`            | `{ node }`                                                                 |
| `section-member-missing`  | `{ member, expected }`                                                     |
| `section-member-accessor` | `{ member, expected }`                                                     |
| `section-member-invalid`  | `{ member, expected, actualType }`                                         |
| `section-member-blank`    | `{ member: 'label', expected: 'non-blank string' }`                        |
| `duplicate-section-id`    | `{ sectionId, firstDocumentPath }`                                         |
| `empty-section`           | `{ sectionId, expected: 'non-empty dense children array' }`                |
| `cyclic-presentation`     | `{ firstDocumentPath }`                                                    |
| `unsupported-location`    | `{ member: 'presentation', nodeKind: 'object' \| 'array' \| 'item' }`      |

A missing or invalid `kind` uses the applicable `section-member-*` reason with
`expected: 'section'`. `id` expects `non-empty string`, `label` expects
`non-blank string`, and `children` expects `non-empty dense array`.

`actualType` uses the accepted safe vocabulary and is absent for missing,
accessor and sparse cases. A root presentation accessor uses
`documentPath: ['presentation']` and prevents reading its value.
`firstDocumentPath` is a frozen copied path. A `missing-node` diagnostic uses
`documentPath: ['presentation']`; every other root defect points to the exact
member or entry. Unsupported nested locations point to that nested
`presentation` member. Their `dataPath` is the object or array node path; an
item UI location uses its owning collection path.

Diagnostic order is:

1. root `order-conflict`;
2. presentation exterior;
3. depth-first entry order, inspecting section `kind`, `id`, `label`, then
   `children` exterior and child entries;
4. duplicate checks at the later occurrence; and
5. missing root nodes in normalized `definition.nodes` order.

Active ancestry detects cycles; safe sibling work continues. Reused section
objects outside active ancestry are inspected independently. Unknown own
section keys follow the accepted unknown UI-member behavior after the four
known members at that section. Those independent unknown/opaque-key diagnostics
do not make an otherwise valid presentation invalid.

One or more `INVALID_UI_PRESENTATION` warnings invalidate the entire root
presentation.
The compiler emits every independently collectible safe warning, discards all
sections and returns the default forest if no unrelated error blocks the
definition. Presentation warnings never remove a node or cause
`success: false` by themselves.

## 8. Manual definition validation

Runtime creation and `applyFormOperation()` validate `presentation` together
with `nodes` and `fields`, iteratively and without executing accessors.

The existing `INVALID_RUNTIME_OPTIONS` and `INVALID_FORM_DEFINITION` envelopes
add these detailed reasons:

- `missing-presentation`;
- `invalid-presentation-entry`;
- `invalid-presentation-section`;
- `invalid-presentation-section-key`;
- `cyclic-presentation`;
- `duplicate-presentation-section-id`;
- `unknown-presented-node`;
- `duplicate-presented-node`; and
- `missing-presented-node`.

Validation requires dense arrays and readonly-contract shapes; it does not
require caller values to satisfy `Object.isFrozen()`. It also requires exact
discriminants, non-empty/blank rules, exact section keys, global section-ID
uniqueness, acyclicity and exact object identity with every root `nodes` member.
It does not accept merely equal cloned nodes. The first defect in deterministic
depth-first order is reported using the existing envelope shape. Validator and
operation logic are not invoked after failure.

## 9. Text resolution

The fixed Angular section projection resolves the normalized source label with:

```ts
{
  formId,
  locale,
  section,
  member: 'label'
}
```

An exception, non-string result or blank result retains the exact source label
and emits one `TEXT_RESOLUTION_FAILED` warning with parameters:

```ts
{
  sectionId: section.id,
  member: 'label',
  reason: 'exception' | 'non-string-result' | 'blank-string-result'
}
```

It has `source: 'runtime'`, no `dataPath`, no `documentPath`, and fallback
`Section text resolution failed.` The context, parameters and diagnostics are
immutable and do not retain thrown values.

Projection identity is the exact section object, `formId` and locale. A change
to any of them may resolve again; unrelated snapshots do not.

## 10. Angular projection and accessibility

`SchemaFormDirective` traverses the normalized presentation forest. A
`form-node` entry obtains the corresponding root snapshot by the exact node's
index in `definition.nodes` and delegates to the existing node outlet. A
section delegates its children recursively through one fixed Internal host.

The section host renders:

```html
<fieldset>
  <legend id="...--legend">resolved label</legend>
  <!-- presentation children -->
</fieldset>
```

Its DOM base is exactly:

```ts
`se-${encodeURIComponent(JSON.stringify([formId, 'section', section.id]))}`;
```

Sections have no aggregate issue list, invalid/dirty/touched class, disabled
state, focus target, collapse state or action. Child hosts retain all accepted
behavior. Nested fieldsets preserve forest order.

A synchronous exception during fixed section host creation/bindings destroys
the partial component, emits exactly one
`SECTION_HOST_INSTANTIATION_FAILED` diagnostic and stops only that section
subtree. It has `severity: 'error'`, `source: 'runtime'`, no paths, parameters
`{ sectionId }`, and fallback `Section host could not be instantiated.` Safe
section identity is copied; thrown values are not retained. Independent root
siblings continue.

ADR-007 leaf renderer resolution and existing object/collection/item hosts are
unchanged. Angular never receives raw UI Schema.

## 11. Runtime and ownership invariants

The runtime ignores `presentation` after validating its manual-definition
invariants. Snapshot arrays continue to mirror `definition.nodes`; the validator
receives the exact original schema and complete controlled value.

Sections do not change operations, scopes, issue assignment, validity,
visibility, dirty, interaction, structural sharing, persistence or baseline.
No `FormScope` is generated or registered. Reordering presentation cannot alter
data order or collection identity.

## 12. Public/Internal migration inventory

| Classification         | Exact effect                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | The seven symbols listed in section 4.                                                                                                                                      |
| Changed Public core    | `UiSchema.presentation`, required `FormDefinition.presentation`, widened `TextResolutionContext`, manual-definition validation and compiler diagnostics/fallback.           |
| Changed Public Angular | `SchemaFormDirective` projects the normalized presentation forest with unchanged signatures.                                                                                |
| New Public Angular     | None.                                                                                                                                                                       |
| Internal Angular       | Section host/outlet, recursive projection, text snapshot/projector, DOM identity, failure isolation and lifecycle helpers.                                                  |
| Unchanged              | Data-node/field contracts, runtime snapshots/actions/scopes, validator input, renderer registry, packages, entry points, dependencies, versions, publication and stability. |

Repository manual definitions, declarations, package smoke and isolated
consumers must migrate to the required default forest. No unlisted Public
change is permitted.

## 13. Conformance scenarios

A future plan must map fixtures and tests for:

1. absent presentation and empty/non-empty root defaults;
2. valid flat, nested and deeply finite sections;
3. presentation order independent from schema/node/leaf/runtime order;
4. root objects and collections as atomic entries;
5. every `INVALID_UI_PRESENTATION` reason, parameter and exact path;
6. conflicts with root `order` and presentation at each unsupported nested UI
   location;
7. missing, unknown, duplicate and hostile names/IDs including `__proto__`,
   punctuation, whitespace and lone surrogates;
8. sparse/accessor/cyclic/reused UI structures without code execution or
   retained values;
9. atomic fallback with all root nodes preserved and independent diagnostics;
10. deep immutability and exact presented-node object identity;
11. every manual-definition failure and validator/operation non-invocation;
12. label resolution success and every failure reason under locale changes;
13. collision-free DOM IDs and nested accessible fieldset/legend markup;
14. section-host failure isolation and lifecycle destruction;
15. unchanged leaf renderer, object/collection/item host and Signal Forms
    ownership;
16. unchanged runtime, scopes, operations, validator-schema identity and
    controlled-state behavior;
17. root declarations/exports, package smoke, packed artifacts and repository,
    lower/upper Angular 22 clean consumers; and
18. unchanged M1–M11 conformance when presentation is absent.

## 14. Acceptance criteria

SPEC-005 may be accepted only when:

1. every contract is consistent with accepted ADR-017 and D-042;
2. root grammar, normalized identity and fallback have no unresolved meaning;
3. all diagnostics, reasons, parameters, paths, ordering and fallbacks are
   closed;
4. manual definitions, text projection, accessibility and Angular failure
   behavior are exact;
5. runtime, scope, operation, validation and renderer ownership are unchanged;
6. the ADR-009 inventory is exact and contains every Public migration;
7. all D-011/D-012 exclusions remain inactive;
8. no plan or code is prepared before acceptance; and
9. complete review repeats after every correction until one cycle has zero
   findings and no documentation conflict.

Ricard's standing authorization accepted SPEC-005 v0.1.1 after review 024 cycle
2 passed all ten areas with zero findings. Acceptance authorizes preparation
and review of PLAN-012 only. Explicit plan approval remains required before
implementation.
