# ADR 036: Controlled discriminated nested-object alternatives

- **State:** Accepted revision 1
- **Date:** 2026-08-03
- **Acceptance date:** 2026-08-03
- **Milestone:** M33 — Controlled discriminated nested-object alternatives
- **Promotes:** only the bounded D-007 slice accepted after
  [review 314](../reviews/314-d007-m33-discriminated-object-alternatives-promotion-readiness.md)
  cycle 2
- **Requires:** Accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-004
  v0.1.1, SPEC-011 v0.1.0, SPEC-014 v0.1.0 and SPEC-015 v0.1.0; Accepted
  ADR-005 revision 8, ADR-009, ADR-010, ADR-014 revision 2, ADR-016,
  ADR-028, ADR-031, ADR-032, ADR-033 and ADR-035
- **Complete review:** [Review 315](../reviews/315-adr-036-review.md) cycle 2
  passed all fifteen areas with zero findings after two corrections
- **Revision 1 acceptance date:** 2026-08-03
- **Revision 1 complete review:**
  [Review 316](../reviews/316-adr-005-revision-9-adr-036-revision-1-review.md)
  cycle 2 passed all sixteen coordinated areas with zero findings
- **Authority:** Accepted M33 architecture only; preparation and complete
  review of ADR-005 revision 9 are authorized, but no Public contract, SPEC,
  plan, implementation, dependency, version, release, publication, commit,
  push or external mutation is authorized

## 1. Context

Schema Engine can derive one static ordinary object and one static disjoint
`allOf` object composition. It cannot represent a nested object whose active
children depend on an application-controlled discriminator. Consumers must
currently model every possible field simultaneously or move branch behavior
outside core.

Draft 2020-12 `oneOf` requires exactly one subschema to validate. That semantic
rule alone does not identify a UI branch: alternatives may overlap, validation
may depend on unrelated assertions and invalid data may match zero or multiple
branches. Core therefore must not ask the validator to choose renderable
structure or become a general JSON Schema evaluator.

Review 314 selects one statically provable subset. A required outer string-enum
field is the controlled selector, and every branch requires that same property
with one distinct matching typed string `const`. This creates a finite
one-to-one mapping without inspecting validation results.

## 2. Decision summary

M33 accepts `oneOf` only on an ordinary nested object property whose exact
outer enum and branch constants prove one discriminator and at least two
alternatives. The compiler normalizes one immutable union catalog with globally
unique managed paths. Runtime reads the current controlled discriminator and
projects only common children plus the selected alternative's children.

The application changes selection through the discriminator's existing
`set-value` intention. Core never creates, clears, migrates or defaults branch
data. The original schema and complete value remain the validator's authority.

## 3. Supported schema grammar

### 3.1 Locations and classification

An own `oneOf` descriptor classifies an ordinary object **property** as a
discriminated-object candidate before ordinary object normalization. It is
eligible only as a direct property of the document root or recursively below
an ordinary non-collection object.

The following locations remain unsupported:

- the document root;
- a collection node, `items` root, item template or any descendant of an item;
- an array or M31 atomic string-enum-array field;
- a primitive field; and
- another discriminated-object alternative subtree.

A pure supported local `$ref` at an eligible property may resolve to a
discriminated-object wrapper. The resolved target uses the managed use-site
path and retains existing reference provenance. A direct document-root `$ref`
remains invalid.

### 3.2 Outer object catalog

The wrapper must have own exact `type: "object"`, own ordinary `properties`,
own `required` and own `oneOf`. It may additionally contain `title`,
`description`, metadata-only `default`, accepted ignorable annotations and
unknown opaque annotations.

`$ref`, `allOf`, `anyOf`, another conditional/applicator, array keywords and
every other known semantic keyword outside that catalog are incompatible. The
wrapper is not an M28 composed-object wrapper and cannot combine `allOf` with
`oneOf`.

Outer `properties` contains the discriminator plus zero or more common
children. Every child must resolve to an accepted non-array primitive or
ordinary nested object. Existing local `$ref` chains are allowed only when the
effective target stays inside that non-array catalog. An effective array,
M31 field, `allOf` wrapper or `oneOf` wrapper is incompatible.

Outer `required` retains its accepted dense unique-string grammar and may name
only outer properties. It must contain the discriminator. Existing
`UNMANAGED_REQUIRED_PROPERTY` behavior remains exact for every other name not
declared in outer `properties`: it is a non-blocking warning and does not
prevent alternative normalization. Only the inferred discriminator must be an
outer managed property.

### 3.3 Discriminator inference

Core infers rather than invents a non-standard discriminator keyword. A seed
candidate outer property must be:

1. a direct own property of the wrapper;
2. required by the wrapper;
3. an accepted scalar `type: "string"` field with a valid non-null `enum` of at
   least two exact unique strings;
4. without outer `const`, nullable type, fixed presentation or array form; and
5. present in at least one safely inspectable branch as the exact required
   branch discriminator form in section 3.5.

Exactly one seed candidate must exist. Zero or multiple seeds block
compilation; property order does not choose between ambiguous candidates. Once
that unique property is selected, every branch is checked for the required
form and the complete bijection. This two-phase rule permits another ordinary
common string-enum field while making missing/malformed discriminator branches
diagnosable instead of silently collapsing them into candidate absence.

The outer discriminator is normalized once as the ordinary editable string
choice field, including existing UI `enumLabels`. Branch-local discriminator
schemas are assertions only and never create another node, fixed renderer or
text source.

### 3.4 Descriptor-safe `oneOf` exterior

`oneOf` must be an own enumerable data property whose value is an array. Its
own `length` descriptor must be a safe integer of at least two. Every index
from zero through `length - 1` must be an own enumerable data property
containing an ordinary non-array schema object. `Object.keys(oneOf)` may contain
no additional string key.

Inspection follows descriptor, length, ascending index and extra-key order. It
executes no accessor, iterator, coercion or callback. The first exterior defect
stops all dependent branches but not independent schema/UI work.

ADR-005 revision 9 and a later SPEC must close exact expectations, parameters
and paths using the existing `INVALID_SCHEMA_KEYWORD_VALUE` family where
possible. An empty or single-branch array is invalid even though a single
subschema can be valid JSON Schema; it is outside the M33 alternative
capability.

### 3.5 Branch form and bijection

Each branch in ascending `oneOf` index order is either:

1. an ordinary branch object; or
2. a pure supported local `$ref` whose finite target chain resolves to an
   ordinary branch object.

An ordinary branch object has exactly the supported semantic members `type`,
`properties` and `required`, plus accepted ignorable and unknown opaque
annotations. `type` is exact `"object"`. `properties` and `required` retain
their accepted descriptor-safe ordinary shapes. Branch `title`, `description`,
`default`, resources, applicators and conditionals are incompatible because
branches do not own presentation or initialization.

Every branch must:

- declare the inferred discriminator as an own property with exact
  `type: "string"` and one valid typed string `const`;
- contain no `enum` on that branch-local discriminator;
- include the discriminator in its own `required`;
- use a discriminator constant belonging to the outer enum;
- contribute one constant not used by another branch; and
- collectively cover every outer enum value exactly once.

The branch-local discriminator object may contain only `type`, `const`,
accepted ignorable annotations and unknown opaque annotations. Its `const`
uses M25 safe string inspection but is not copied to `fixedValue`.

### 3.6 Disjoint variant properties

Every non-discriminator branch property is alternative-specific. Its direct
name must be disjoint from:

- every outer common property;
- every non-discriminator property in another branch; and
- the discriminator name.

The effective child schema must be an accepted non-array primitive or ordinary
nested object, optionally through a finite local reference chain. Arrays,
M31 fields, `allOf`, `oneOf`, conditions/applicators and collection policies
are not traversed as M33 descendants.

Each branch `required` may name only its discriminator and properties declared
by that same branch. Requiredness never reaches across alternatives or back to
outer common properties. A variant child uses the requiredness of its own
branch; an outer child uses outer requiredness.

## 4. Ordering, UI Schema and text

### 4.1 One union catalog

The compiler builds one union catalog in this order:

1. outer common properties in `Object.keys(outer.properties)` order, including
   the discriminator; then
2. branch-specific properties in ascending branch index and each branch's
   `Object.keys(properties)` order.

Disjoint names make every managed path globally unique. Alternatives are
normalized in outer enum order; each retains only its exact discriminator
value and direct variant-child names. Source branch indices and reference
provenance remain Internal.

### 4.2 Single use-site UI Schema

One existing `ObjectUiSchema` belongs to the wrapper use site. `label`,
`description`, `hint`, `tooltip`, `order` and `fields` address the complete
union catalog. Unknown/duplicate entries retain existing warnings. `order`
first orders the union once; runtime filters that stable order to common plus
active children without reordering either group.

Each child UI node applies to its unique union path. There is no branch-local
UI Schema, alternative label, selector directive or schema provenance in UI
paths. Alternative labels are exactly the existing resolved choice labels of
the outer discriminator.

Recursive `presentation` at the discriminated-object use site is incompatible
for M33 and is ignored with the existing non-blocking UI-option policy. A valid
presentation forest may still contain the discriminated object as one child at
its ordinary parent. Common or variant children that are themselves ordinary
nested objects retain their own accepted local static presentation behavior;
only the alternative owner lacks a presentation forest.

`visibleWhen` and `enabledWhen` authored anywhere inside the wrapper union use
the existing `INVALID_UI_FIELD_CONDITION` unsupported-target behavior. M33 does
not create conditional sources/targets whose lifetime depends on selection.
Conditions authored outside the wrapper likewise cannot resolve a common or
variant union path as an ordinary source. Static layout and conditional field
state therefore remain separate capabilities.

The object itself uses the existing object text members and fallback rules. No
alternative-specific title/description or new text member is introduced.

## 5. Public normalized contracts

M33 adds these Public + Experimental + Active shapes only after a later SPEC
and approved implementation plan:

```ts
export interface DiscriminatedObjectAlternativeDefinition {
  readonly discriminatorValue: string;
  readonly children: readonly string[];
}

export interface DiscriminatedObjectFieldDefinition extends BaseNodeDefinition {
  readonly kind: 'discriminated-object';
  readonly discriminator: string;
  readonly children: readonly FormNodeDefinition[];
  readonly alternatives: readonly DiscriminatedObjectAlternativeDefinition[];
}

export type ObjectNodeDefinition =
  ObjectFieldDefinition | DiscriminatedObjectFieldDefinition;

export type FormNodeDefinition =
  ObjectNodeDefinition | ArrayNodeDefinition | FieldDefinition;
```

`children` on the owner is the complete unique union catalog in normalized UI
order. Each alternative's `children` contains only its direct variant child
names in that same relative order. A child listed by no alternative is common;
the discriminator must be common. Every alternative value is unique and maps
exactly to one discriminator choice.

`FormDefinition.nodes` owns the discriminated object as one node.
`FormDefinition.fields` remains a static depth-first projection of **all**
potential primitive leaves, with every leaf object appearing exactly once.
Existing ordinary definitions retain their exact shapes and object literals.
Exhaustive readers of `FormNodeDefinition` must handle the new kind.

`ObjectTextResolutionContext.node` widens from `ObjectFieldDefinition` to
`ObjectNodeDefinition`. Existing object contexts remain assignable, while
exhaustive readers must narrow the Experimental union.

## 6. Runtime selection and snapshots

### 6.1 Selection

Runtime selects from current `value` only when the owner has inspectable object
presence and the discriminator path contains an own data string equal to one
normalized alternative value. Otherwise selection is `none`. Missing,
wrong-kind and unknown safe business values do not infer a branch. A managed
accessor retains the existing atomic runtime-options/external-update rejection
and never becomes a no-match value.

```ts
export type ObjectAlternativeSelection =
  | { readonly kind: 'none' }
  | { readonly kind: 'active'; readonly discriminatorValue: string };

export interface DiscriminatedObjectRuntimeSnapshot {
  readonly nodeKind: 'discriminated-object';
  readonly key: string;
  readonly path: DataPath;
  readonly presence: ObjectPresence;
  readonly selection: ObjectAlternativeSelection;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
  readonly children: readonly NodeRuntimeSnapshot[];
}
```

`NodeRuntimeSnapshot` and `RuntimeTreeSnapshot` gain this variant. Snapshot
`children` contains common children plus only the active alternative's children
in filtered union order. With no selection it contains common children only.
The arrays and selection objects are immutable.

`FormRuntimeSnapshot.fields` becomes the active depth-first primitive
projection: common leaves plus current alternative leaves. Existing forms
without discriminated objects retain exact cardinality, order and identity.
`getNodeSnapshot()` and `getFieldSnapshot()` return `undefined` for an inactive
alternative path.

### 6.2 Controlled changes and dormant data

Changing the discriminator uses its ordinary existing set intention and does
not change the tree until the application supplies a new value reference.
External selection changes emit no operation. Core never removes old variant
properties, creates new ones, applies defaults or migrates data.

Dormant properties remain in the application value and baseline but are not
active snapshots. Switching back exposes their current controlled values. A
baseline-only update never changes active selection.

### 6.3 Dirty, touched and focus

Common and active child dirty state uses the existing path presence/`Object.is`
comparison against the complete baseline, even when the baseline discriminator
selects another or no alternative. Inactive children do not contribute a
snapshot or owner dirty state. A changed discriminator already contributes its
ordinary leaf dirty state.

Touched state remains keyed by every statically managed union path while the
runtime lives. It is hidden while its alternative is inactive and restored if
that alternative becomes active again. A scope reset may clear stored touched
state for an inactive but statically managed path.

When controlled selection makes the focused field inactive, runtime clears
focus atomically without marking it touched, following the existing external
incompatible-ancestor reconciliation. Common focused fields remain focused
when otherwise valid.

Selection changes publish at most one root snapshot. Unchanged common
subtrees, inactive stored interaction and definitions retain identity; active
owner/ancestor projections change only when their observable result changes.

## 7. Operations, actions and scopes

The discriminator and common descendants are always potential active targets.
A variant target is active only when current controlled selection matches its
owning alternative.

Runtime intentions against an inactive variant fail without emitting an
operation or changing a snapshot. `applyFormOperation()` also rejects a
statically managed but inactive variant before value compatibility and terminal
expectation checks. This closes the race where an operation emitted under one
selection is applied after the application has switched selection.

ADR-005 revision 9 and a later SPEC must close one runtime diagnostic family
for inactive targets, including action/operation kind, owner path,
discriminator path, required alternative and a safe active-or-none state. It
must not retain the controlled value. `applyOperation()` remains the advanced
schema-neutral structural utility and does not enforce activity.

Application-defined scopes may contain any statically managed union path.
Inactive paths are recognized rather than warned as unknown, but contribute no
node snapshot, issue visibility, touched result or validation subtree until
active. An owner scope includes the current common and active tree only.

## 8. Validation and issue assignment

`SchemaValidator` continues to receive the exact original schema object and
complete controlled value. Core does not flatten, dereference, rewrite or pass
only the selected branch. Selection never claims that the active branch is
valid; it is determined solely by the safely read discriminator.

All normalized validator issues remain authoritative and none is silently
dropped:

- paths resolved to an active node attach normally;
- a path belonging exclusively to an inactive alternative attaches to the
  discriminated owner as its deepest active managed ancestor;
- an owner/object-level `oneOf` issue attaches to the owner; and
- a common path, including the discriminator, retains normal path assignment.

The owner and root remain invalid when such issues exist. Because the neutral
issue contract carries instance paths rather than validator-specific branch
provenance, an invalid active branch may also expose discriminator/object
issues produced while the validator evaluated inactive branches. M33 keeps
that standards-validator output instead of adding Ajv-only filtering or
changing the validation port. Presentation may show one or all issues under
the existing policy.

Synchronous/asynchronous validation schedule, generations, pending state,
original-schema identity and application ownership remain unchanged.

### 8.1 Explicit default-candidate helper

`deriveSchemaDefaultCandidate()` remains exactly the M29 helper over ordinary
and M28 composed static object trees. It does not select an M33 alternative,
traverse common/variant children or derive a candidate from a schema containing
the supported `oneOf` wrapper. Such a wrapper is a blocking unsupported
semantic boundary for that helper even when `compileFormDefinition()` can
compile it.

The helper reuses `UNSUPPORTED_SCHEMA_KEYWORD` at the exact wrapper `oneOf`
`documentPath` and owner `dataPath`, with its existing `{ keyword: 'oneOf' }`
parameters and fallback. It continues independently inspectable ordinary
siblings in accepted schema order, returns the original value reference with
`success: false` and never traverses the alternatives for defaults. This
context-specific helper result does not reclassify M33 compiler support.

No current discriminator value authorizes the helper to choose a branch. A
future default-candidate extension would need its own promotion to decide
selection, missing/no-match behavior and atomic candidate semantics. Compiler
metadata-only object `default` and primitive defaults inside the union remain
inert unless such a later contract explicitly replaces this boundary.

## 9. Manual definitions, diagnostics and traversal

Manual validation must inspect the new kind descriptor-safely and prove before
validation or actions:

- a dense unique union child tree and all existing path/key/projection rules;
- one direct scalar string-choice discriminator child named by
  `discriminator`;
- at least two dense alternatives with unique values exactly covering the
  discriminator choices;
- dense unique child-name lists referring only to direct union children;
- each variant child owned by exactly one alternative and every unlisted child
  treated as common; and
- no array, item/template, nested discriminated object or condition capability
  in the union subtree.

`FormDefinition.fields` contains every potential leaf once; runtime snapshots
filter that static projection rather than accepting duplicate/reused node
objects. Existing ordinary manual definitions remain valid.

Compiler traversal remains iterative and descriptor-safe. Observable order at
one wrapper is outer shape/catalog, `oneOf` exterior, branches in index order,
discriminator inference/bijection, property conflicts, union child
normalization, semantic UI linking and then the complete UI traversal under
the accepted global gates. An exterior failure stops dependent branch work; a
branch defect stops its result while independent later branches continue. Any
error returns no partial definition.

ADR-005 revision 9 and a later SPEC must define exact compiler/manual/runtime
codes, reasons, expectations, parameters, document/data/template/reference
paths, precedence and cascade suppression. New diagnostics must not retain raw
schemas, definitions, discriminator business values, accessors, cursors or
thrown values.

## 10. References, cycles and provenance

M33 adds `oneOf` indices as supported non-root reference-object positions only
for pure branch references. Existing fragment syntax, `$defs` registry,
pointer mechanics, sibling rules and reference-chain order remain exact.

Diagnostics inside a referenced wrapper/branch/property use canonical target
`documentPath`, managed wrapper `dataPath` and immutable outermost-to-innermost
`referenceChain`. Inline diagnostics retain every `oneOf` index. UI paths never
receive schema/reference provenance.

Raw object re-entry through `properties` or `oneOf` containment retains
`CYCLIC_SCHEMA_OBJECT`; canonical target re-entry through `$ref` retains
`CYCLIC_SCHEMA_REFERENCE`. Acyclic reuse is inspected per managed use site.
Selection adds no cycle domain or Public cursor.

## 11. Framework projection

Core alone selects and publishes the active neutral tree. Angular and Standard
handle `kind`/`nodeKind: 'discriminated-object'`, render the existing object
semantics and traverse snapshot children by canonical key against the immutable
union definition. They do not read the discriminator from raw value, inspect
`oneOf`, run a validator or independently filter a branch.

The existing discriminator string field uses the native/custom enum renderer.
Selection replacement mounts/unmounts only variant descendants, preserves
unaffected common hosts where observable identity permits and follows existing
focus/accessibility/lifecycle failure isolation. Signal Forms remain private
leaf buffers.

One shared deeply frozen scenario must prove at least two alternatives, common
fields, missing/unknown/active selection, controlled selection confirmation and
rejection, dormant values, validation issues, focus/stale action defense and
equivalent independent Angular/Standard behavior.

## 12. Public/Internal migration inventory

| Classification         | Exact effect                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `DiscriminatedObjectAlternativeDefinition`, `DiscriminatedObjectFieldDefinition`, `ObjectNodeDefinition`, `ObjectAlternativeSelection` and `DiscriminatedObjectRuntimeSnapshot`.                                                                  |
| Changed Public core    | `FormNodeDefinition`, `NodeRuntimeSnapshot`, `RuntimeTreeSnapshot`, `FormDefinition.nodes/fields` semantics, active `FormRuntimeSnapshot.fields`, object text context, lookup/action/scope behavior, manual-definition and diagnostic semantics.  |
| Changed Public Angular | Existing node projection must narrow the new definition/snapshot kinds; renderer registrations and leaf contracts remain unchanged.                                                                                                               |
| Private Standard/apps  | Independent new-kind projection and one shared scenario; no exported Standard contract.                                                                                                                                                           |
| Internal core          | Wrapper/branch cursors, discriminator inference, union/ownership index, active-tree filtering and stale-target activity checks.                                                                                                                   |
| Unchanged              | Application value/baseline ownership, operation union/signatures, validator signatures, M29 default-candidate support boundary, packages, entry points, export maps, dependencies, versions, publication and Public + Experimental + Active tier. |

Existing ordinary object/field definitions and raw UI objects remain
assignable and behavior-compatible. Exhaustive readers of widened Experimental
unions must add the new branch. A future release therefore requires an
explicitly approved coordinated MINOR under ADR-009/ADR-010; this ADR selects
no version or release.

Acceptance of this ADR would authorize preparation and complete review of
ADR-005 revision 9 only. It would not authorize a SPEC, plan, implementation,
dependency, version, release, publication, Git or external action.

## 13. Consequences

### Positive

- A common dynamic-object use case becomes framework-neutral and controlled.
- String enum plus typed const gives deterministic selection without a custom
  discriminator keyword or validator-chosen UI.
- One union catalog preserves globally unique paths and stale-operation safety.
- Dormant application data is never silently destroyed.
- Root and collection complexity remain independent later increments.

### Negative

- The first slice excludes root alternatives, arrays and alternatives inside
  collection items.
- Variant property names cannot overlap even when their apparent schemas match.
- `FormRuntimeSnapshot.fields` becomes selection-dependent for M33 forms.
- Invalid `oneOf` data may expose validator issues from inactive branches
  because the neutral port has no branch provenance.
- Public Experimental unions widen and exhaustive consumers must migrate.

## 14. Alternatives rejected

- **General validation-selected `oneOf`:** rejected because invalid/overlapping
  data does not determine one renderable structure.
- **Compile every branch as conditionally visible ordinary fields:** rejected
  because inactive nodes would retain operations, interaction and issue
  semantics and raw schema behavior would depend on UI conditions.
- **Custom discriminator keyword:** rejected because the enum/const bijection
  is sufficient and keeps authored schema within Draft 2020-12 vocabulary.
- **Branch-local fixed selector only:** rejected because users could not request
  selection through an ordinary controlled field.
- **Clear old branch on selection:** rejected because it would mutate
  application-owned domain data and require transaction/migration policy.
- **Root and collection support together:** rejected because implicit-root and
  per-item identity/lifecycle require separate representations and evidence.
- **Ajv discriminator/filtering:** rejected because it is adapter-specific and
  would make replaceable validators observably inconsistent.

## 15. Explicit deferred boundaries

ADR-036 does not activate document-root, collection/item/template or array
alternatives; M31 inside the wrapper; nested/recursive `oneOf`; `anyOf`, `not`,
conditionals, dependent/unevaluated semantics; alternative-local `allOf`;
overlapping properties; non-string or inferred discriminators; dynamic
definitions; conditional fields/presentation; wizard/scopes authored in UI;
defaults/branch creation/clearing/migration; persistence, submit, batches,
transactions or undo; Public AST/resolved graph; external/dynamic resources;
React/Vue/UI kits/legacy Angular; or dependency/version/release/publication.

## 16. Required complete review

ADR-036 may be accepted only after a repeated complete review confirms:

1. exact nested-only locations and closed outer/branch catalogs;
2. unique required string-enum discriminator and typed-const bijection;
3. descriptor-safe exterior, references, provenance and both cycle domains;
4. disjoint non-array union catalog, ordering and requiredness;
5. one UI Schema, filtered order and excluded presentation/conditions;
6. exact immutable Public definition/snapshot contracts and projections;
7. current-value selection, no-match, dormant data and baseline/dirty rules;
8. touched/focus/sharing/subscription behavior across selection changes;
9. inactive action/operation/stale defense and scope behavior;
10. original-validator ownership and deterministic active/inactive issue
    assignment without adapter-specific filtering;
11. manual definitions, diagnostics, traversal/stopping and no retention;
12. Angular/Standard neutrality and shared evidence;
13. complete ADR-009/ADR-010 migration with no dependency/release change;
14. preservation of M29 defaults, M30/M32 conditions and every Deferred
    boundary; and
15. objective follow-up gates authorizing only ADR-005 revision 9 review.

Every correction requires another complete review. Only a complete pass with
zero findings and no unresolved change request may support formal acceptance.

## 17. Standards references

- [JSON Schema Core Draft 2020-12 — `oneOf`](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-00#section-10.2.1.3)
- [JSON Schema Validation Draft 2020-12 — `const`](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-00#section-6.1.3)

## 18. Revision 1 compatibility correction

Revision 1 replaces only the ambiguous outer/branch `required` interaction in
revision 0:

1. an outer required name other than the discriminator that is absent from
   outer `properties` retains the existing non-blocking
   `UNMANAGED_REQUIRED_PROPERTY`; it does not prevent M33 compilation;
2. the discriminator itself must be declared and required outer for a complete
   candidate;
3. every branch required name must be its discriminator or a property declared
   by that same branch; a cross-boundary/unmanaged name is a blocking
   alternative conflict later closed by ADR-005 revision 9; and
4. no location, schema shape, Public contract, runtime behavior or Deferred
   boundary changes.

Revision 1 is Accepted after the complete coordinated review with ADR-005
revision 9 reached zero findings. It preserves the same SPEC-only gate and
authorizes no implementation or release action.
