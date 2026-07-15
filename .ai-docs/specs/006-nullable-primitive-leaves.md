# SPEC-006: Nullable Primitive Leaves

- **State:** Accepted
- **Version:** 0.1.1
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Milestone:** M14 — Nullable primitive leaves
- **Promoted capability:** [`D-009`](../roadmap/deferred-decisions.md), only the
  slice accepted by
  [`review 031`](../reviews/031-m14-nullable-leaves-promotion-readiness.md)
- **Accepted baselines:**
  [`SPEC-001 v0.1.15`](./001-controlled-form-runtime.md),
  [`SPEC-002 v0.1.2`](./002-nested-object-runtime.md),
  [`SPEC-003 v0.1.2`](./003-collection-runtime.md),
  [`SPEC-004 v0.1.1`](./004-local-reference-resolution.md) and
  [`SPEC-005 v0.1.1`](./005-static-presentation-groups.md)
- **Accepted architecture:**
  [`ADR-019 revision 1`](../adrs/019-hojas-primitivas-nullable.md) coordinated
  with
  [`ADR-005 revision 4`](../adrs/005-politica-dialecto-json-schema.md)
- **Complete review:**
  [`review 034`](../reviews/034-spec-006-review.md) cycle 6 passed all twelve
  areas and accepted-state reconciliation with zero findings after twelve
  corrections
- **Authority:** Accepted observable contract; it authorizes preparation and
  review of PLAN-014 only, not plan approval, implementation, version,
  publication or Stable API change

## 1. Status and authority

This Accepted specification defines only the observable D-009/M14 extension
required by Accepted ADR-019 revision 1 and ADR-005 revision 4. It replaces
Accepted behavior only where it explicitly admits null for an existing
primitive leaf and projects the corresponding native Angular intention.

All unchanged compiler, UI Schema, definition, operation, runtime, validation,
renderer, package, stability and publication rules remain authoritative.
Acceptance authorizes preparation and review of PLAN-014 only. It does not
approve that plan or authorize implementation.

## 2. Goals

M14 shall specify:

1. one closed Draft 2020-12 type-array form containing a primitive plus null;
2. one required normalized `nullable: boolean` on every primitive definition;
3. strict direct and item-relative null operations without new operation shapes;
4. controlled missing/null/false/primitive presence and dirty semantics;
5. identical direct, nested, collection-template and local-reference behavior;
6. one common accessible Angular null intention and perceptible null status;
7. exact text, ID, diagnostics, migration and conformance contracts; and
8. unchanged application ownership and external validation authority.

## 3. Non-goals

M14 does not support standalone null fields, multiple non-null types, general
unions, nullable root/object/array/item/identity nodes, `enum + null`, `const`,
applicators, conditionals, discriminator logic, coercion, empty-to-null
conversion, initialization or applied defaults.

It adds no operation, presence/snapshot variant, UI Schema option, renderer
registration, Angular output, component, provider, package, entry point,
dependency, persistence, submit flow, async validation, optimistic projection,
publication or Stable API.

## 4. Supported JSON Schema form

### 4.1 Exact type array

A nullable leaf has an own `type` data property whose value is an array of
length 2 containing exactly:

- one of `string`, `number`, `integer` or `boolean`; and
- `null`;

in either order. A scalar primitive type remains supported and normalizes as
non-nullable.

The array form is allowed at every already supported editable primitive-leaf
position:

- a direct root property;
- a nested object property;
- an editable descendant of a collection item template; and
- any of those positions reached through an Accepted local `$ref`.

Root `type` remains the scalar string `object`. Object, array and item-root
types remain their accepted scalar strings. A collection identity remains an
exact direct required scalar `type: "string"` property.

A root type array continues producing the Accepted
`ROOT_TYPE_MUST_BE_OBJECT`. A type array at an object, array or item-root
position follows that location's existing blocking type/shape diagnostic and
never opens `properties`/`items` as a nullable container. Section 4.3 adds
envelopes only where the Accepted traversal is classifying a primitive leaf.

### 4.2 Descriptor-safe inspection

After reading the own `type` descriptor without executing accessors, an array
is inspected without iteration or coercion:

1. `Array.isArray()` must be true;
2. the own `length` descriptor must be a data property with value exactly 2;
3. index `0` and then `1` must be own enumerable data properties;
4. each member must be a safe string from the five-member catalog;
5. the first extra key in `Object.keys(array)` order, other than `0` or `1`,
   invalidates the form; and
6. the two safe members must contain one null and one primitive.

No source array or descriptor is retained. Accessors, `Symbol.iterator` and
coercion are never invoked. Proxy reflection retains the Accepted input
boundary: Proxy traps are not promised to be side-effect-free or isolated.

### 4.3 Type-array diagnostics

Every failure reuses `UNSUPPORTED_FIELD_TYPE`, with `severity: 'error'`,
`source: 'schema'`, fallback `Field "<name>" has an unsupported type.`, exact
leaf `dataPath`, exact schema `documentPath` and immutable safe parameters.
`field` is always the local field name.

The closed precedence and additions to the existing envelope are:

| Failure                                               | `documentPath` suffix | Additional parameters                                                                                   |
| ----------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| `type` accessor, unsupported scalar or exterior value | `['type']`            | Existing safe `actualType`/value description                                                            |
| invalid `length` descriptor                           | `['type']`            | `{ expected: 'primitive type plus null', actualType }`                                                  |
| numeric length other than 2                           | `['type']`            | `{ expected: 'primitive type plus null', actualLength }`                                                |
| missing/non-enumerable/accessor index                 | `['type', index]`     | `{ expected: 'null or primitive type', actualType }`                                                    |
| safely read non-string member                         | `['type', index]`     | `{ expected: 'null or primitive type', ...safe actual description }`                                    |
| string outside the five-member catalog                | `['type', index]`     | `{ expected: 'null or primitive type', reason: 'unsupported-type-member', ...safe actual description }` |
| extra enumerable key                                  | `['type', key]`       | `{ reason: 'unexpected-type-array-member' }`                                                            |
| `[null, null]`                                        | `['type']`            | `{ expected: 'one primitive type and null', reason: 'duplicate-null' }`                                 |
| equal primitive members                               | `['type']`            | `{ expected: 'one primitive type and null', reason: 'duplicate-primitive' }`                            |
| two distinct primitive members                        | `['type']`            | `{ expected: 'one primitive type and null', reason: 'missing-null' }`                                   |

For invalid `length`, `actualType` is exactly `missing`, `accessor` or the safe
type of a non-numeric value. For an invalid index descriptor it is exactly
`missing`, `non-enumerable` or `accessor`.

Only the first applicable type-array failure is emitted for one leaf. That
branch stops before constraint and type-dependent UI diagnostics. Independent
schema siblings and UI exterior-shape diagnostics retain their Accepted order.

For collection-template descendants, the envelope adds the Accepted frozen
`parameters.templatePath`; its `dataPath` is the collection path. For a target
reached through `$ref`, `documentPath` identifies the target keyword and
`parameters.referenceChain` preserves Accepted provenance.

### 4.4 Keyword and UI compatibility

A valid type array classifies all existing constraints by its non-null member:

- string constraints remain compatible with nullable string;
- numeric constraints remain compatible with nullable number/integer; and
- boolean gains no constraints.

`enum` on a nullable string is blocking
`INCOMPATIBLE_SCHEMA_KEYWORD` at the enum path with the Accepted parameters
`{ keyword: 'enum', fieldType: 'string' }`. An exterior-invalid `enumLabels`
still produces its independent `INVALID_UI_SCHEMA_VALUE`; an exterior-valid
`enumLabels` on that schema-blocked enum is ignored without member or
compatibility diagnostics. Other UI shape/text diagnostics remain independently
collectible.

`placeholder` and numeric UI options use the normalized primitive type exactly
as for a scalar declaration. Nullable string/number/integer therefore preserve
their Accepted compatibility and nullable boolean preserves the existing
incompatible-option warnings.

`default` retains its Accepted inert metadata behavior: it is not type-checked,
applied or copied. Known annotations and unknown keywords preserve their
existing warning behavior.

A valid nullable type array on the collection identity does not become a field
and does not emit `UNSUPPORTED_FIELD_TYPE`. The collection policy emits the
Accepted semantic `INVALID_COLLECTION_POLICY` with collection `dataPath`, no
`documentPath`, and parameters:

```ts
{
  reason: 'identity-schema-incompatible',
  policyIndex,
  member: 'itemIdentityProperty',
  expected: 'required direct string identity property'
}
```

## 5. Normalized Public definitions

`BaseFieldDefinition` changes to:

```ts
export interface BaseFieldDefinition extends BaseNodeDefinition {
  readonly nullable: boolean;
  readonly placeholder?: string;
}
```

Consequently every Public `StringFieldDefinition`, `NumberFieldDefinition`,
`BooleanFieldDefinition` and `FieldTemplate` has an own required boolean:

- `true` for the exact type array in section 4;
- `false` for a scalar primitive type.

Objects, arrays, items and presentation sections do not gain this member. The
compiler copies only the normalized boolean, freezes every produced definition
and template under the Accepted rules and never retains the schema array.

For local references, the boolean is derived independently at each use site.
For collection templates, it is part of the frozen template field and the
Internal managed-field index used by operations/runtime.

## 6. Manual definition validation

Runtime creation and `applyFormOperation()` require every manual primitive
node/template to have an own data `nullable` boolean. Caller objects need not be
frozen.

For `applyFormOperation()`, missing, inherited, accessor or non-boolean members
use existing `INVALID_FORM_DEFINITION`, fallback
`Form definition is invalid.`, and:

```ts
{
  reason: 'invalid-field-nullable',
  member: 'nullable',
  actualType: string,
  // direct field:
  nodeIndexPath?,
  path?,
  // template field:
  templateIndexPath?,
  relativePath?
}
```

`actualType` is exactly `missing`, `accessor` or the existing safe vocabulary
for the inspected non-boolean data value.

An inherited member is `missing`. A non-empty own `choices` array together with
`nullable: true` uses:

```ts
{
  reason: 'incompatible-field-capabilities',
  members: ['nullable', 'choices'],
  // same exact direct or template locator
}
```

For runtime creation, the same defect uses existing `INVALID_RUNTIME_OPTIONS`,
fallback `Runtime option "definition" is invalid.`, no diagnostic path, and the
Accepted outer parameters for the whole definition. It adds:

```ts
{
  member: 'definition',
  reason: 'invalid-value',
  actualType: 'object',
  definitionReason:
    | 'invalid-field-nullable'
    | 'incompatible-field-capabilities',
  definitionMember?: 'nullable',
  definitionActualType?: string,
  definitionMembers?: readonly ['nullable', 'choices'],
  // exact applicable direct/template locator
}
```

`definitionMember` and `definitionActualType` appear only for
`invalid-field-nullable`; `definitionMembers` appears only for
`incompatible-field-capabilities`. The existing `expected` string for the
current FormDefinition boundary is unchanged. `definitionActualType` uses the
same exact vocabulary as the direct `actualType` above.

Members arrays and locators are copied and frozen. Direct defects require
`nodeIndexPath` plus the safely known absolute `path`; template defects require
`templateIndexPath` plus `relativePath`; the other locator family is absent.
Validation follows the existing iterative node/template order and reports its
first deterministic definition defect. No validator, operation traversal,
listener or mutation is invoked after the definition failure.

Repository fixtures, fakes, package smoke and clean consumers that manually
construct primitives must add `nullable: false`, or `true` only for the M14
form. Manual `nullable: true` plus choices is never accepted.

## 7. Operations and compatibility

### 7.1 Unchanged operation shapes

`FormOperation`, `OperationExpectation`, metadata, source and immutable path
contracts do not change. `null` travels through the existing `unknown` value.

The schema-agnostic `applyOperation()` remains structural and accepts null
without a definition-level compatibility decision.

### 7.2 Definition-aware direct/deep leaves

`applyFormOperation()` and `requestSetValue()` treat null as compatible only for
`nullable: true`. A direct/nested non-collection target with `nullable: false`
uses existing `INCOMPATIBLE_OPERATION_VALUE`, fallback
`Operation value is incompatible with field "<name>".` for application or
`Operation value is incompatible with the field.` for runtime request, exact
field `dataPath`, no `documentPath`, and parameters:

```ts
{
  field: field.name,
  fieldType: 'string' | 'number' | 'integer' | 'boolean',
  actualType: 'null'
}
```

All existing input/definition/managed-path/compatibility/traversal/expectation
precedence and immutable result behavior remain unchanged.

### 7.3 Collection item-relative leaves

`applyFormOperation()` and `requestSetItemValue()` treat null as compatible only
for a template field with `nullable: true`. A non-nullable item-relative target
uses `INCOMPATIBLE_COLLECTION_OPERATION_VALUE`, fallback
`Collection operation value is incompatible.`, its current positional leaf
`dataPath`, no `documentPath`, and exact parameters:

```ts
{
  operationType: 'set-item-value',
  reason: 'leaf-type',
  actualType: 'null',
  field: field.name,
  fieldType: 'string' | 'number' | 'integer' | 'boolean'
}
```

Collection address, identity, managed target, incompatible ancestor,
compatibility, stale and rebuild ordering remain exactly as SPEC-003.

### 7.4 Strict transitions

For every nullable leaf:

- `set-value null`/`set-item-value null` is the only explicit transition to
  present null;
- `remove-value`/`remove-item-value` is the only transition to missing;
- an expectation `{ kind: 'value', value: null }` matches through `Object.is`;
- setting confirmed null to null is a successful no-effect result and emits no
  runtime operation;
- clearing confirmed null carries expected present null;
- stale, accessor, missing ancestor materialization and structural-sharing
  rules remain unchanged; and
- no compilation, rendering, reconciliation or validation step generates null.

A non-nullable field containing external null may still be removed because
remove compatibility depends on presence/expectation, not the primitive value.

## 8. Runtime, presence, dirty and validation

Null is a present controlled value:

```ts
{ kind: 'value', value: null }
```

No `FieldPresence`, snapshot, action-result, subscription, scope or listener
shape changes. Missing, null, false, zero, empty string and other primitive
values remain distinct. Dirty continues using `Object.is` at each managed leaf,
so equal null/null is clean and missing/null is dirty when the other Accepted
conditions allow comparison.

An external null on `nullable: true` is compatible. An external null on
`nullable: false` remains present incompatible controlled data; core never
repairs, removes or coerces it.

`required` remains external validation. A required nullable property may be
present as null; clearing it to missing is allowed and the external validator
may report the issue. `SchemaValidator` always receives the exact original
schema, including its type array, and the authoritative complete value. Core
does not dereference, rewrite or validate the business assertion.

Nested `missing-ancestor` remains editable/materializable. A null intention can
create the accepted ancestor chain and leaf with null. An
`incompatible-ancestor` continues blocking every mutation/interaction
intention.

## 9. Angular native projection and accessibility

### 9.1 Common null action

The existing native string, number/integer and boolean renderers consume
`field.nullable`. After the control/descriptive content and before the existing
clear action they render:

- a `Set null` action when nullable and confirmed presence is not present null;
  or
- a `Null value` status when confirmed presence is present null.

Neither is rendered for a non-nullable field. The action is also suppressed for
`incompatible-ancestor`, but remains available for `missing-ancestor`.

The action is exactly a native `button` with `type="button"`, visible resolved
text, deterministic ID and:

```html
<button
  type="button"
  id="<set-null-id>"
  aria-labelledby="<set-null-id> <field-label-id>"
>
  &lt;resolved Set null text&gt;
</button>
```

Activation by pointer or keyboard synchronously calls
`focusBoundControl()` before emitting exactly one existing `setValue` output
with null. Failure to focus does not suppress emission. Render,
reconciliation, text/locale changes, focus, blur, reset and destruction emit
nothing.

The outlet/runtime retains all Accepted incompatible-ancestor defenses, so a
stale component cannot bypass them.

### 9.2 Confirmed null status and clear

Confirmed null renders visible text in a `span` with its deterministic ID, no
`role` and no `aria-live`. Its ID is appended to the control's
`aria-describedby` after description/hint and before issue messages. It is not
a disabled action.

```html
<span id="<null-value-id>">&lt;resolved Null value text&gt;</span>
```

The existing clear button remains visible for confirmed null because null is
present. It keeps its existing ID, accessible naming, focus-before-output and
`removeValue` semantics. Therefore:

- missing has neither null status nor clear action, but has the set-null action
  when nullable;
- null has the null status and clear action, but no set-null action; and
- false/primitive has set-null and clear actions when nullable.

### 9.3 Signal Forms reconciliation

String and number controls project confirmed null to local `''`; boolean
projects it to local `false`. These are display buffers only. Effects reset the
buffer without emitting a domain intention. Editing after null emits the normal
primitive value and remains controlled until external confirmation.

The string-enum renderer never receives a compiler-produced nullable field.
Manual definitions combining choices and nullable fail before projection.

## 10. Text resolution and deterministic IDs

`FieldTextMember` adds:

```ts
| 'set-null'
| 'null-value'
```

`AngularFieldTextSnapshot` adds required:

```ts
readonly setNullLabel: string;
readonly nullValueLabel: string;
```

`AngularTextProjector` resolves neutral sources `Set null` and `Null value` for
every field with their exact members. The complete order is label, description,
hint, tooltip, placeholder, clear, set-null, null-value, choices in definition
order and issues in snapshot order. This keeps the required snapshot and
resolver call order independent of current nullable/presence state, matching
existing `clear` projection.

Exception, non-string or blank results use the exact source fallback and one
existing `TEXT_RESOLUTION_FAILED` per failed member, with field `dataPath`, no
`documentPath`, fallback `Text resolution failed for field "<name>".`, and:

```ts
{
  field: field.name,
  member: 'set-null' | 'null-value',
  reason: 'exception' | 'non-string-result' | 'blank-string-result'
}
```

Thrown/result values are not retained. Contexts, snapshots, diagnostics and
arrays remain immutable. Both new snapshot strings are always non-blank.
`emptyTextSnapshot()` returns both neutral strings. The existing projection
identity remains the exact field, `formId`, locale and issue-array identity;
presence changes do not by themselves call the resolver again.

Internal `FieldIds` adds:

```ts
readonly setNull: string;   // `${base}-set-null`
readonly nullValue: string; // `${base}-null-value`
```

The base remains the exact Accepted root/nested or collection-item encoding, so
IDs are deterministic and collision-free across form, item and relative path.
`describedBy()` orders IDs as description, hint, confirmed-null status and
visible issues.

## 11. Renderer resolution

Native registration IDs, order, ranks, priorities and predicates remain:

| Registration         | Match                 | Rank |
| -------------------- | --------------------- | ---- |
| `native-string-enum` | own non-empty choices | 20   |
| `native-string`      | `kind === 'string'`   | 10   |
| `native-number`      | `kind === 'number'`   | 10   |
| `native-boolean`     | `kind === 'boolean'`  | 10   |

No nullable-specific registration exists. Resolution depends only on the
normalized definition, never current presence/value. Custom testers may inspect
the required boolean and specialize through existing rank/priority rules.
Custom renderers are not required to implement the native affordance.

## 12. Public/Internal migration inventory

| Classification                    | Exact effect                                                                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public core signatures    | Required `BaseFieldDefinition.nullable`, transitively all primitive definitions/templates; two `FieldTextMember` values.                                    |
| Changed Public Angular signatures | Two required `AngularFieldTextSnapshot` strings.                                                                                                            |
| Changed Public behavior           | Compiler type array; manual definition validation; definition-aware null compatibility; native null action/status and text projection.                      |
| Changed diagnostics               | Type-array cases; two definition reasons in `INVALID_FORM_DEFINITION`/`INVALID_RUNTIME_OPTIONS`; direct/collection null incompatibility; two text failures. |
| Unchanged Public                  | Operations, expectations, presence/snapshots, runtime methods, renderer registrations, outputs, providers, exports, packages and entry points.              |
| Internal                          | Descriptor-safe type-array inspection, managed nullable metadata, two IDs and native projection helpers.                                                    |
| Stability                         | Every affected API remains Public + Experimental + Active.                                                                                                  |

This is source-incompatible for manual definitions and Angular text snapshots.
Under ADR-010 any future delivery requires independent coordinated MINOR
releases of both affected packages, never PATCH, plus declaration diffs,
migration notes, packed artifacts and clean consumers. SPEC acceptance neither
selects nor authorizes a version or publication.

## 13. Conformance scenarios

A future approved plan must map fixtures/tests for at least:

1. both valid type-array orders for all four primitive types;
2. direct, deep, collection-template and local-reference nullable leaves;
3. scalar primitives normalizing `nullable: false` everywhere;
4. root/object/array/item/identity nullable exclusions;
5. length, sparse, non-enumerable, accessor, non-string, unsupported, extra-key,
   duplicate-null, duplicate-primitive and missing-null diagnostics;
6. exact direct/template/reference paths, provenance, ordering, branch stopping
   and no retained source arrays;
7. constraints, annotations, defaults, `enum`, `enumLabels` and UI option
   compatibility;
8. compiler-produced deep immutability, direct/manual required boolean
   validation and exact runtime-option wrappers;
9. manual `nullable + choices` rejection for nodes and templates;
10. raw `applyOperation()` unchanged with null;
11. direct/deep and item-relative compatible/incompatible null operations with
    their distinct diagnostic families;
12. strict null expectations, stale results, no-effect and remove-to-missing;
13. missing-ancestor materialization and incompatible-ancestor suppression;
14. external nullable/non-nullable null, dirty matrix and validator-schema
    identity;
15. set-null action pointer/keyboard focus order and exactly-one output;
16. missing/null/false/primitive DOM and accessible distinctions;
17. non-live status, described-by order, clear behavior and deterministic IDs;
18. Signal Forms null reconciliation/editing without emissions;
19. both new text members, every failure reason, locale changes and identical
    resolver order for nullable/non-nullable fields;
20. unchanged native/custom tester IDs, order, ranks, priorities and selection;
21. declarations, exports, package smoke, repository and packed clean consumers;
22. coordinated MINOR migration classification without publication; and
23. unchanged M1–M13 conformance when every primitive is scalar/non-nullable.

## 14. Acceptance criteria

SPEC-006 may be accepted only when:

1. every behavior is consistent with ADR-019 revision 1 and ADR-005 revision 4;
2. the nullable schema grammar and every diagnostic envelope/order are closed;
3. normalized/manual definitions and Experimental migration are exact;
4. direct and collection operation families remain distinct and conflict-free;
5. controlled runtime, dirty, validator and ancestor behavior are unchanged
   except for compatible null;
6. Angular intention, status, focus, texts, IDs, accessibility and Signal Forms
   reconciliation have no unresolved meaning;
7. renderer resolution, packages, exports, versions and stability do not widen;
8. all explicit exclusions and other deferred decisions remain inactive;
9. no plan or code is prepared before acceptance; and
10. after every correction the complete review repeats until one cycle has zero
    findings and no documentation conflict.

Ricard accepted SPEC-006 v0.1.1 after review 034 cycle 6 passed all twelve areas
with zero findings. Acceptance authorizes preparation and review of PLAN-014
only. Explicit plan approval remains required before implementation.
