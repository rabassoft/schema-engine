# SPEC-017: Controlled String-Enum Array Field

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 3 August 2026
- **Acceptance date:** 3 August 2026
- **Milestone:** M31 — Atomic string-enum array field
- **Promoted capability:** bounded [`D-006`](../roadmap/deferred-decisions.md)
- **Accepted baselines:** [`SPEC-001 v0.1.15`](./001-controlled-form-runtime.md),
  [`SPEC-002 v0.1.2`](./002-nested-object-runtime.md),
  [`SPEC-003 v0.1.2`](./003-collection-runtime.md) and
  [`SPEC-016 v0.1.1`](./016-controlled-conditional-primitive-field-state.md)
- **Accepted architecture:**
  [`ADR-034 revision 0`](../adrs/034-controlled-homogeneous-string-enum-array-field.md)
- **Accepted policy:**
  [`ADR-005 revision 8`](../adrs/005-politica-dialecto-json-schema.md)
- **Complete review:** [review 295](../reviews/295-spec-017-review.md) cycle 2
  passed all nine areas and 26 conformance rows with zero findings after six
  corrections
- **Acceptance effect:** authorizes only PLAN-033 preparation and complete
  review; no implementation, dependency, version, release, Git or external
  action

## 1. Status and authority

This extension defines only the observable M31 contract selected by review
292 and fixed by ADR-034 plus ADR-005 revision 8. It replaces SPEC-003's
primitive-array exclusion only for the exact atomic field below. Every
unchanged Accepted baseline remains authoritative.

Drafting, review or acceptance does not activate implementation, a package
version, release, publication, dependency, commit, push or external action.

## 2. Goals

M31 shall:

1. compile one homogeneous closed string-enum array as an ordinary atomic
   field;
2. preserve ordered controlled values, missing and present empty state;
3. reuse immutable choices, existing set/remove operations and replaceable
   validation;
4. prevent native projection from silently losing invalid controlled data;
5. define deterministic dirty, no-op, issue and interaction behavior;
6. project accessible replaceable Angular and independent Standard consumers;
   and
7. deliver exact Public Experimental declarations and conformance evidence.

## 3. Non-goals

M31 does not support:

- any free, numeric, boolean, nullable, mixed, object, tuple or nested array;
- arrays inside collection item templates;
- identity, item templates, stable addresses or structural item operations;
- any array keyword other than required exact `uniqueItems: true`;
- item `$ref`, array composition or dynamic schemas;
- automatic sorting, deduplication, repair, initialization or defaults;
- array conditions, partial item scopes or validation owned by core;
- persistence, submit, workflow, HTTP, optimistic state or undo/redo;
- React, Vue, Svelte, legacy Angular or UI-library variants; or
- dependency, manifest, lockfile, version, release, publication, Stable, Git
  or external-system work.

## 4. Authoring contract

### 4.1 JSON Schema

A supported field is an ordinary property outside every item template with:

```json
{
  "type": "array",
  "items": {
    "type": "string",
    "enum": ["reader", "editor", "reviewer"]
  },
  "uniqueItems": true
}
```

It may occur direct, below accepted ordinary objects, at a local-reference use
site or as one disjoint property contributed by accepted static object
composition. It may carry outer `title`, `description` and metadata-only
`default`. The parent object controls `required` exactly as for another field.

`items` is required and is not a data node. It contains only exact
`type: "string"`, required own `enum`, accepted ignored annotations and
unknown opaque annotations. The enum is own, non-empty, dense, string-only and
duplicate-free in schema order. Outer `uniqueItems` is an own enumerable data
property whose value is exactly true.

Every classification, diagnostic, path, reference/composition provenance,
ordering and branch-stopping rule is ADR-005 revision 8 section 17. Root arrays,
template arrays and every unlisted keyword remain blocked.

### 4.2 UI Schema

The field uses the existing ordinary field entry:

```ts
export interface FieldUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly enumLabels?: Readonly<Record<string, string>>;
}
```

This excerpt lists only the members compatible with M31. `enumLabels` keys map
the exact `items.enum` strings. Source labels are non-blank, preserve enum
order and use ADR-011's visible JSON fallback for a blank domain string.

`placeholder`, numeric options, `item`, `order`, `fields`, actions,
`visibleWhen` and `enabledWhen` remain incompatible. Conditions use
`INVALID_UI_FIELD_CONDITION` with `unsupported-target-location`; they never
enter the M30 evaluator. There is no item UI Schema.

## 5. Public normalized contracts

Core adds:

```ts
export type StringEnumArrayFieldDefinition = Omit<
  BaseFieldDefinition,
  'nullable' | 'placeholder' | 'fixedValue' | 'visibleWhen' | 'enabledWhen'
> & {
  readonly kind: 'string-enum-array';
  readonly nullable: false;
  readonly choices: readonly StringChoiceDefinition[];
};

export type FieldDefinition =
  | StringFieldDefinition
  | NumberFieldDefinition
  | BooleanFieldDefinition
  | StringEnumArrayFieldDefinition;
```

The new branch is one `FormNodeDefinition` leaf through `FieldDefinition` and
one member of the static `FormDefinition.fields` projection. It is never an
`ArrayNodeDefinition`, `FieldTemplate`, collection node or dynamic item leaf.

`choices` is required, non-empty, deeply frozen and copied in enum order.
Every choice reuses exact ADR-011 value/label semantics. The definition/path,
choices array and entries retain no caller schema/UI identity.

All additions remain Public + Experimental + Active. No new core entry point or
package is added.

## 6. Compiler diagnostics and ordering

### 6.1 Items family

An invalid `items` exterior uses `INVALID_SCHEMA_KEYWORD_VALUE`. It preserves
`expected: 'inline object item schema'` for the M10/default family and uses
`expected: 'string-enum item schema'` only when an exact safe outer
`uniqueItems: true` marker exists. `items.type` then selects object M10 or
string M31 without inference.

### 6.2 Required `uniqueItems`

After safe string classification, missing/inherited, accessor, non-enumerable
or non-true `uniqueItems` emits one error:

```ts
{
  code: 'INVALID_SCHEMA_KEYWORD_VALUE';
  severity: 'error';
  source: 'schema';
  dataPath: readonly string[];
  documentPath: readonly (string | number)[]; // exact uniqueItems path
  parameters: {
    keyword: 'uniqueItems';
    expected: 'true';
    actualType: string;
    actualValue?: false;
  };
  fallbackMessage: 'Schema keyword "uniqueItems" has an invalid value.';
}
```

`actualValue` exists only for exact false. No hostile value is retained.

### 6.3 Required enum

Missing/inherited item enum uses `INVALID_SCHEMA_KEYWORD_VALUE`, expected
`non-empty array of unique strings` and `actualType: 'missing'`. An accessor
uses expected `array of unique strings` and `actualType: 'accessor'`. Present
values reuse ADR-011's array/element/duplicate envelopes and index order.

Paths are exact below `items.enum`; `dataPath` remains the outer field path.
Template paths never appear. Accepted `referenceChain` appears only when the
outer use site was reached through a local reference.

### 6.4 Catalog and UI ordering

Wrong-location outer members use `fieldType: 'string-enum-array'`; wrong item
members use `fieldType: 'string-enum-array-item'`. `const` and unlisted array
keywords retain `UNSUPPORTED_SCHEMA_KEYWORD`; outer `format` retains its
ignored warning. Conditions retain their dedicated ADR-033 code/reason.

Schema order is outer common shape, `items`/type, family-dependent outer
members, item enum, policy tail and then UI. An unclassified items branch
suppresses derived unique/enum/label diagnostics; a malformed enumLabels
exterior remains independently diagnosable. Any error returns no partial
definition.

## 7. Manual definitions

Runtime creation and `applyFormOperation()` extend their complete definition
validation with one reason:

```ts
definitionReason: 'invalid-string-enum-array-field';
```

The defect envelope may add immutable `path`, `nodeIndexPath`, `fieldIndex`,
`definitionMember`, `definitionExpected` and `definitionActualType` under the
existing `INVALID_RUNTIME_OPTIONS`/`INVALID_FORM_DEFINITION` ownership.

Validation order is base node members, exact kind, own `nullable: false`,
absence of placeholder/fixed/conditions, choices exterior, then choice indices
with own value/label. Choices must be dense/non-empty, values exact unique
strings and labels non-blank strings. Accessors are never invoked. Extra choice
properties, reuse and cycles only through ignored extras are not errors.

Runtime options use expected `valid FormDefinition with string-enum-array
fields`; form-operation validation keeps its accepted fallback and adds only
the reason/locators. Any definition defect precedes external managed data,
validator invocation, membership and operation effect.

## 8. Controlled value and external safety

The existing `FieldPresence` remains unchanged. Missing property, present
`[]`, present ordered array and every safely inspectable invalid value remain
distinct. A dense string array is basic-compatible even when it contains
duplicates or out-of-enum strings; those are validator-owned assertions.

A managed own accessor at an array index is unsafe. Initial runtime creation
uses `INVALID_RUNTIME_OPTIONS`; an update uses
`INVALID_EXTERNAL_STATE_UPDATE`. Both retain the accepted managed-data
envelope, set `dataPath` to the exact outer path plus numeric index, fail
atomically before validator invocation and never execute the accessor.

Sparse arrays, non-string members, duplicates and unknown strings are safe
controlled data and do not block creation/update. They may be invalid and/or
native-unrepresentable but remain in snapshots unchanged.

Reference-identity update detection remains exact: in-place array mutation is
unsupported. Accepted immutable updates validate once, invoke synchronous and
configured asynchronous validation under their existing schedules and emit at
most one snapshot.

## 9. Native representability

Missing and present empty are representable as no selected choices. A present
non-empty value is losslessly representable only when it is a dense array of
unique strings and every string equals one normalized choice.

Sparse/non-string/duplicate/out-of-enum data makes the native selection control
disabled. Core adds no representability issue or public snapshot member; each
target derives the same state from immutable definition plus field presence.
The labelled host and explicit clear action remain focusable. The controlled
value, issues, validity and clear visibility remain unchanged.

Custom renderers may request any dense string array, including
assertion-invalid values. Core basic compatibility and the external validator
remain the safety authorities.

## 10. Operations and runtime intentions

No operation type or runtime method is added. Existing `set-value` and
`remove-value` apply to the new field.

`requestSetValue()` accepts only a dense string array for M31. It inspects own
indices without invoking accessors, copies strings in order to a new deeply
frozen array and emits that exact detached array. Incompatible input returns
existing `INCOMPATIBLE_OPERATION_VALUE` with field name,
`fieldType: 'string-enum-array'` and safe actual type, without an operation.
For an Array exterior, its additional exact parameters are:

```ts
{
  field: string;
  fieldType: 'string-enum-array';
  reason: 'sparse-array' | 'array-index-accessor' | 'array-item-type';
  index: number;
  actualType: string;
}
```

The first failing ascending index is reported. Sparse/accessor use
`actualType: 'missing' | 'accessor'`; item type uses the safe vocabulary. A
non-Array retains the existing `{ field, fieldType, actualType }` envelope.

`applyFormOperation()` accepts a dense string array for the new field and
rejects other values through the same existing operation-value diagnostic. It
uses the same first-index M31 detail after definition/membership and expectation
checks, and does not enforce enum membership or uniqueness.
`applyOperation()` remains schema-neutral. Both helpers retain the operation
value reference; direct operation authors own immutability.

For runtime requests and `applyFormOperation()`, two dense string arrays are an
effective no-op when length and ordered `Object.is` string values are equal.
Schema-neutral `applyOperation()` retains its existing reference-based effect
semantics because it cannot prove the target is M31. The existing confirmed
value expectation remains reference-exact; a concurrent immutable replacement
can therefore still make an emitted operation stale.

`requestRemoveValue()` is no-effect only for missing/blocked presence. A
present `[]` emits removal. Selection to none emits set with `[]`, never remove.
Required does not hide or block the explicit clear action.

## 11. Ordered selection algorithm

Given a representable confirmed array and a selected choice set:

1. keep still-selected confirmed values in confirmed order;
2. drop deselected values; and
3. append newly selected values in definition-choice order.

The resulting array is passed once to `requestSetValue()`. Missing behaves as
an empty confirmed selection for candidate construction; present/missing
semantics remain distinct. Malformed/out-of-range DOM tokens are ignored.

After an intention, Angular and Standard immediately reconcile their visual
selection to the last confirmed snapshot. Only an immutable external update
confirms it. Rejection, locale, render, text changes and lifecycle emit no
operation. No built-in reordering UI is added.

## 12. Dirty, interaction and scopes

Dirty is true when missing/present state differs. When both values are dense
string arrays, it compares length and ordered strings through `Object.is`;
identical contents are clean across different immutable references. If either
side is not dense string array, dirty uses presence plus `Object.is` on the
present external values.

Touched/focused remain one field-level state. Options and numeric indices are
never interaction targets. Focus/blur use the field's ordinary absolute path;
the host/clear affordance carries field focus when selection itself is disabled.
Baseline-only updates do not alter interaction.

Scopes use only the ordinary field path. A scope includes all issues assigned
to that field. Numeric index paths, collection addresses and partial choice
scopes are unknown/invalid under existing diagnostics.

## 13. Validation and issue assignment

The validator receives the exact original complete schema and controlled value.
It owns array/item type, enum, uniqueness, required and all data assertions.
Core never rewrites the schema, deduplicates values or converts native
representability into a validation issue.

An issue at the array path, any numeric item index or any descendant below that
index attaches to the one field snapshot in validator order. Out-of-range
indices also fall back to this field. No item snapshot, synthetic issue or
stable ID is created. Synchronous/asynchronous composition, visibility and
retry semantics remain unchanged.

## 14. Conditional state

M31 is neither source nor target of `visibleWhen`/`enabledWhen`. Manual
definitions containing either member fail before runtime creation/operation.
Every M31 field snapshot exposes exact required constants:

```ts
visible: true;
enabled: true;
```

The M30 field index, evaluator, focus reconciliation and inactive action gate
do not change.

## 15. Text contracts

`FieldTextMember` adds:

```ts
export type FieldTextMember =
  | 'label'
  | 'description'
  | 'hint'
  | 'tooltip'
  | 'placeholder'
  | 'clear'
  | 'set-null'
  | 'null-value'
  | 'fixed-missing'
  | 'fixed-unavailable'
  | 'fixed-incompatible'
  | 'choice'
  | 'issue'
  | 'missing-selection'
  | 'empty-selection';
```

The fixed source texts are `No value provided.` and `No values selected.`.
They use the ordinary field context only when the field kind is
`string-enum-array`. Exception, non-string or blank resolver results retain the
source and emit one existing `TEXT_RESOLUTION_FAILED` with exact member,
field path and reason.

Angular adds required members to its existing Public snapshot:

```ts
export interface AngularFieldTextSnapshot {
  // Existing members remain unchanged.
  readonly missingSelectionLabel: string;
  readonly emptySelectionLabel: string;
}
```

The Angular projector resolves both members for every field to preserve the
total transitive snapshot required by ADR-034. Only M31 projects them. Failure
uses the same fixed-source fallback/diagnostic contract in every field context;
choice labels continue to align exactly with definition choices.

## 16. Angular projection

The Angular package adds the Public + Experimental + Active class symbol
`SchemaStringEnumArrayRendererComponent` from the existing root entry point;
its constructor and Internal bindings are not Public API.

The standalone component selector is
`schema-string-enum-array-renderer`. Registration
`native-string-enum-array` has rank 30 and priority 0, matches only exact kind
plus own valid choices, and joins `provideSchemaEngineAngularNative()` but not
the headless provider. ADR-007 consumer overrides remain exact.

It projects a persistently labelled native `<select multiple>` using private
index tokens and an Angular 22 Signal Form presentation buffer. It consumes
resolved choice/status/clear text, existing IDs/descriptions/hints/tooltips/
issues, required/invalid semantics and field-level focus/blur.

Unrepresentable data disables only the select and exposes the localized status;
clear remains available for every present value. Missing, empty and non-empty
states are distinguishable to assistive technology. The renderer never owns
domain value, validation, dirty, touched, operation application or persistence.

## 17. Standard and shared reference evidence

Standard implements the same semantic behavior independently from definition
and snapshot contracts, without importing Angular, Signals, component/token
helpers or Angular styles.

One deeply frozen shared scenario must include direct and nested M31 fields,
blank/whitespace choices and labels, missing, `[]`, ordered selection,
confirmation/rejection, external reorder, equal-array no-op, clear, required,
duplicates, unknown strings, non-string/sparse data, validator issues, dirty,
baseline, focus/touched, locale and unchanged condition state.

Angular and Standard independently prove their accessibility trees and
controlled operation histories. Visual pixel parity is not required.

## 18. Public migration and packaging

The exact migration is:

| Classification         | Effect                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `StringEnumArrayFieldDefinition`.                                                                                                       |
| Changed Public core    | `FieldDefinition`, definition validation, M31 runtime/operation compatibility, ordered no-op/dirty, `FieldTextMember` and text context. |
| New Public Angular     | `SchemaStringEnumArrayRendererComponent`.                                                                                               |
| Changed Public Angular | `AngularFieldTextSnapshot`, native provider registration and transitive definition union.                                               |
| Internal core          | Compiler family/cursors, detached array copying, comparison and issue fallback.                                                         |
| Internal Angular       | Native representability, tokens, candidate/reconciliation and status projection.                                                        |
| Private apps           | Standard renderer and shared scenario/evidence.                                                                                         |
| Unchanged              | Operation discriminants, validator ports, collection APIs, entry points, dependencies and current published packages.                   |

The later plan must update exact declarations, package smoke, built consumers,
clean Angular lower/latest-compatible consumers, isolated source reconstruction
and migration notes. This coordinated Experimental change requires a separately
selected later MINOR under ADR-010. SPEC-017 selects no version and authorizes
no manifest, lockfile, release or publication.

## 19. Conformance matrix

| Row | Required evidence                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Direct valid M31 schema compiles to exact immutable definition/choices.                                                                            |
| 2   | Nested, local-reference and disjoint object-composition use sites preserve paths/provenance.                                                       |
| 3   | Root, collection-template, nested-array and unsupported item types remain blocked.                                                                 |
| 4   | M10 malformed-items expected and policy behavior remain exact.                                                                                     |
| 5   | M31 items exterior/type and required unique diagnostics cover missing/accessor/non-enumerable/false/malformed.                                     |
| 6   | Required enum covers missing/accessor/empty/sparse/non-string/duplicate and ordered blank strings.                                                 |
| 7   | Outer/item supported/incompatible/unsupported/ignored/unknown catalogs and ordering are exact.                                                     |
| 8   | enumLabels complete/partial/unknown/malformed/blank and schema-blocked behavior is exact.                                                          |
| 9   | Incompatible UI members and ADR-033 condition reasons remain exact.                                                                                |
| 10  | Compiled/manual definitions are deeply immutable and hostile manual shapes fail before data/validator.                                             |
| 11  | Initial/update accessor indices fail atomically without execution; other invalid controlled data remains observable.                               |
| 12  | Presence distinguishes missing, empty, representable, assertion-invalid and basic-incompatible values.                                             |
| 13  | requestSetValue copies/freezes dense strings and rejects unsafe/incompatible input with exact diagnostics.                                         |
| 14  | Apply helpers preserve direct operation value ownership; form-aware compatibility remains basic while the schema-neutral helper remains unchanged. |
| 15  | Ordered equal arrays are no-effect for runtime/form-aware application while reference-exact expectations still detect concurrent replacement.      |
| 16  | Retain/remove/append algorithm preserves confirmed order and appends new choices in definition order.                                              |
| 17  | Empty selection sets `[]`; clear removes present values including `[]`; confirmation/rejection stay controlled.                                    |
| 18  | Dirty matrices cover missing/empty/order/equal references/duplicates/incompatible values and baseline-only updates.                                |
| 19  | Validator authority and issue fallback from array/numeric/deep/out-of-range paths target the single field.                                         |
| 20  | Field focus/touched/scopes, unrepresentable host/clear and no numeric/item intentions are exact.                                                   |
| 21  | M31 rejects condition authoring/manual members and snapshots always expose visible/enabled true.                                                   |
| 22  | Choice plus missing/empty text resolution, fallback, diagnostics, locale and total Angular snapshot are exact.                                     |
| 23  | Angular rank 30, override, provider boundary, native tokens, accessibility and lifecycle pass.                                                     |
| 24  | Shared scenario plus independent Standard and Angular behavior/operation/accessibility evidence pass.                                              |
| 25  | Exact exports/declarations, package smoke, built/clean/source consumers and migration evidence pass without dependency/version drift.              |
| 26  | Frozen complete workspace, security/policy/boundary/browser/docs/diff matrix passes before completion.                                             |

## 20. Acceptance criteria

SPEC-017 may be accepted only when a complete repeated review confirms:

1. exact ADR-034 and ADR-005 revision 8 authority without scope expansion;
2. declaration-ready Public contracts and manual-definition envelopes;
3. compiler diagnostics/order/stopping and M10 non-regression;
4. controlled presence, safety, operations, order, no-op and dirty;
5. validator authority, issues, scopes, conditions and interaction;
6. text, accessibility and independent target behavior;
7. complete Public/Internal/package migration and all 26 matrix rows;
8. every non-goal and external gate remains inactive; and
9. docs, links, formatting and diff hygiene pass.

After every correction the complete review must restart. Only a zero-finding
pass and Ricard's accepted no-scope-expansion rule may mark v0.1.0 Accepted.
Review 295 cycle 2 passed all nine areas and 26 rows with zero findings, so
v0.1.0 is Accepted. Acceptance authorizes only preparation and complete review
of PLAN-033; it does not approve that plan or authorize implementation,
dependency, version, release, Git or external action.

## 21. History

| Version | Date       | Change                                                        |
| ------- | ---------- | ------------------------------------------------------------- |
| 0.1.0   | 03-08-2026 | Initial Draft for the bounded ADR-034/ADR-005r8 M31 contract. |
