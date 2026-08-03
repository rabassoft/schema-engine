# ADR 034: Controlled homogeneous string-enum array field

- **Status:** Accepted
- **Date:** 3 August 2026
- **Acceptance date:** 3 August 2026
- **Revision:** 0
- **Milestone:** M31 — Atomic string-enum array field
- **Promotes:** only the D-006 boundary selected by
  [review 292](../reviews/292-d006-m31-string-enum-array-promotion-readiness.md)
  cycle 3
- **Requires:** Accepted ADR-005, ADR-009, ADR-010, ADR-011, ADR-012,
  ADR-014, ADR-015 and ADR-033; Accepted SPEC-001, SPEC-002, SPEC-003 and
  SPEC-016
- **Complete review:** [review 293](../reviews/293-adr-034-review.md) cycle 3
  passed all twelve areas with zero findings after five corrections
- **Acceptance effect:** authorizes only ADR-005 revision 8 preparation and
  complete review; no SPEC, plan, implementation, dependency, version,
  release, Git or external action
- **Follow-up if accepted:** ADR-005 revision 8, then SPEC-017; no plan or
  implementation before those independent gates

## 1. Context

The completed runtime supports primitive leaves and homogeneous arrays of
objects with application-owned stable item identity. Those collection arrays
need item templates, addresses and five incremental operations because each
item is independently editable and movable.

A closed multiple-choice value has a different consumer meaning. The
application owns one ordered JSON array such as `['editor', 'reviewer']`, while
the user toggles members of one finite string vocabulary. Treating that value
as an M10 collection would invent identity, item hosts and operations that the
domain does not need. Treating it as an unordered set would silently change
JSON Schema array semantics and could reorder application data.

M31 therefore needs one atomic field kind, deterministic lossless native
projection and strict separation between structural renderability and external
business validation.

## 2. Decision summary

M31 introduces one ordinary field whose schema is an array with required
`uniqueItems: true` and homogeneous string items from one non-empty closed
`enum`. The compiler normalizes the enum to the existing ordered string-choice
concept, but the controlled field value remains an ordered array.

The field uses existing `set-value` and `remove-value` operations. A selection
change replaces the complete array atomically; it never emits an item
operation. Retained values preserve their order and newly selected values are
appended in schema-choice order. Empty `[]` remains distinct from missing and
only the explicit clear action requests removal.

Core continues to accept assertion-invalid string arrays as controlled data and
passes the original schema/value to the replaceable validator. Native editing
is disabled when the current array cannot be represented losslessly by the
closed choices; it never drops, deduplicates, sorts or repairs data.

## 3. Schema and UI Schema boundary

### 3.1 Exact schema shape

The field may occur only as an ordinary property at a location already
supported for ordinary primitive fields, outside every collection item
template. Its outer schema declares own data properties:

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

The supported semantic members are exactly:

- outer `type: "array"`;
- required own `items` containing one ordinary non-array schema object;
- required own `uniqueItems` with the exact boolean value `true`;
- outer `title`, `description` and metadata-only `default` under existing
  annotation/default rules; and
- item `type: "string"` plus required own non-empty, dense, exact-string,
  duplicate-free `enum`.

The item schema is not a separate data node and has no title, description,
default, format, const, nullable form, nested schema or UI branch. No other
array assertion becomes supported. `uniqueItems: false`, absence or malformed
shape is not silently upgraded.

Descriptor-safe traversal, exact catalog, diagnostics, ordering, cycles,
sharing and branch stopping belong to required ADR-005 revision 8. ADR-034 does
not amend the accepted dialect policy by itself.

### 3.2 UI Schema

The field reuses the ordinary field members `label`, `description`, `hint`,
`tooltip` and `enumLabels`. Each `enumLabels` key addresses one exact item enum
string; labels, fallback for blank domain strings, descriptor safety and
choice order retain ADR-011 semantics.

`placeholder`, numeric options, item UI, collection actions, `visibleWhen` and
`enabledWhen` are incompatible at this location. The absence of a placeholder
does not remove accessible missing/empty state; section 10 defines dedicated
localized text members.

## 4. Normalized model

Core adds one Public + Experimental + Active definition:

```ts
export type StringEnumArrayFieldDefinition = Omit<
  BaseFieldDefinition,
  'nullable' | 'placeholder' | 'fixedValue' | 'visibleWhen' | 'enabledWhen'
> & {
  readonly kind: 'string-enum-array';
  readonly nullable: false;
  readonly choices: readonly StringChoiceDefinition[];
};
```

`FieldDefinition` adds this branch. `choices` is required, non-empty, ordered,
dense, deeply immutable and uses the exact copied value/label rules of
ADR-011. The definition contains no item template, identity, policy,
collection address or condition.

This type is not `ArrayNodeDefinition`, does not join `FormNodeDefinition` as a
structural collection node and does not contribute a dynamic item/field
projection. It is one ordinary static leaf in `FormDefinition.fields` and the
existing node forest.

Manual-definition validation inspects the complete base, exact kind,
`nullable: false` and own choices through descriptors before validator
invocation. It rejects accessors, sparse choice arrays, malformed choice
entries, missing members, non-string/duplicate values, blank labels and own
placeholder, fixed-value or condition members. Extra choice-object properties
retain ADR-011's ignored behavior; object reuse or cycles through such extras
are not a new semantic error. The later SPEC closes exact existing diagnostic
envelopes, locators, reasons and precedence.

## 5. Controlled value and representability

### 5.1 Basic-compatible value

A present basic-compatible value is an Array whose indices from `0` through
`length - 1` are own data properties containing strings. The core does not
coerce, trim, case-fold, normalize Unicode, sort, deduplicate or check enum
membership as part of basic type compatibility.

Consequently, duplicates and out-of-enum strings may remain controlled values
and validator errors. Sparse arrays and non-string elements are not
basic-compatible values for a set intention but remain observable controlled
data. An own accessor index at a managed M31 array path is instead an unsafe
managed-data defect: initial creation or an external update fails atomically
before validator invocation, the accessor is never executed and the accepted
runtime option/update diagnostic family identifies the exact numeric path.

The existing `FieldRuntimeSnapshot.presence` remains authoritative:

- missing property is `{ kind: 'missing' }`;
- present `[]` is `{ kind: 'value', value: [] }`;
- every other safely inspectable present value remains a value snapshot,
  including assertion-invalid or basic-incompatible data; and
- missing/incompatible ancestors retain accepted nested-field semantics.

No new collection presence or item snapshot is introduced.

### 5.2 Lossless native representability

A value is losslessly representable by the native multiselection only when it
is a dense array of unique strings and every element equals one normalized
choice value. Choice/value equality is exact string equality.

Missing and `[]` are representable as no selected choices, but they remain
observably distinct through presence, the explicit clear affordance and
localized status text. A present array with a duplicate, unknown string,
non-string, sparse index or accessor is unrepresentable.

Unrepresentability is not a synthetic validation issue and does not change the
controlled value. Native selection editing is disabled until an external
update supplies a representable value or the user invokes explicit clear.
This prevents a visual subset from silently discarding data. Custom renderers
remain subject to core basic type checks and external validation.

## 6. Atomic operations and intentions

### 6.1 Existing operation family

M31 adds no `FormOperation` discriminant and no item operation. It widens the
managed basic type accepted by existing APIs:

```ts
runtime.requestSetValue(path, readonlyStringArray);
runtime.requestRemoveValue(path);
```

`requestSetValue()` descriptor-safely validates a dense string array, copies
its values in order into a new frozen array and places that detached array in
one ordinary `set-value` operation. The expectation retains the latest exact
confirmed property value under existing concurrency semantics.

`applyFormOperation()` accepts a dense string array for this definition kind
but does not enforce `uniqueItems` or enum membership. `applyOperation()`
remains schema-neutral. Both helpers retain the operation's value reference
under their existing pure semantics; the array is guaranteed detached and
frozen when the operation came from `requestSetValue()`. A consumer that
constructs an operation directly remains responsible for immutable input.
Unrelated branches retain existing structural sharing.

Two dense string arrays are an effective no-op only when they have equal
length and `Object.is`-equal strings at every ordered index. The runtime emits
no operation for such a candidate even when the caller supplied a different
array reference.

`requestRemoveValue()` remains the only missing intention. Clearing a present
empty array therefore emits removal; changing a selection to none emits
`set-value` with `[]`. Required status never hides clear, and the external
validator retains required authority.

### 6.2 Deterministic native selection algorithm

For a representable confirmed array and the selected choice set reported by a
native control, the candidate is built exactly as follows:

1. retain currently selected values in their existing controlled order;
2. remove every value the user deselected; and
3. append newly selected values in normalized schema-choice order.

This algorithm preserves retained application order without pretending the
array is a set. It does not expose item move controls. A custom renderer may
request another complete order through `requestSetValue()`.

From missing, the first selection creates an array. From present `[]`, it
replaces that array. Deselecting the final value creates present `[]`; it does
not remove the property. Malformed DOM tokens and values outside the normalized
choice list are ignored without emitting.

The control immediately reconciles to the last confirmed snapshot after an
intention. Confirmation or rejection arrives only through immutable external
state; no optimistic domain projection is retained.

## 7. Dirty, updates and interaction

Dirty distinguishes missing from every present array, including `[]`. When
both current and baseline are dense string arrays, equality is ordered,
length-sensitive and element-wise through `Object.is`. A new immutable array
with identical ordered strings is clean. If either side is not a dense string
array, dirty falls back to presence plus `Object.is` on the present values.

Unmanaged properties never contribute. Baseline-only updates do not change
touched or focus. Value-reference updates recompute presence, representability,
dirty, validation and target projection under existing atomic/single-snapshot
rules; mutating an array in place remains unsupported.

Touched and focused remain field-level. Pointer or keyboard interaction uses
the same focus/blur actions as other ordinary fields. A confirmed update does
not restore focus automatically. Unrepresentable state disables the selection
control; the labelled field host and explicit clear action remain focusable,
and focus/blur targets the single field rather than an option or array index.

## 8. Validation and issues

The replaceable validator receives the unchanged original complete schema and
controlled value. It exclusively owns `type`, item `type`, `enum`,
`uniqueItems`, `required` and every other data assertion. Core's structural
checks only establish safe normalized metadata and basic operation
compatibility.

An issue at the array path, any numeric item index or a descendant below such
an index attaches to this single field snapshot in validator order. There are
no item snapshots to receive it. Out-of-range numeric paths also fall back to
the field. Core does not rewrite issue paths, deduplicate issues or synthesize
representability errors.

Scopes target the field's ordinary absolute string-only path. Numeric item
paths, item addresses and partial selection scopes are unsupported. Showing,
hiding or resetting that field scope never changes its value or selection.

## 9. Conditional-state compatibility

The M31 field is neither a source nor a target for M30 `visibleWhen` or
`enabledWhen`:

- the accepted condition literal grammar contains no array value;
- ADR-033 sources and targets remain ordinary primitive fields; and
- array equality, membership and item-relative semantics remain outside M30.

The field snapshot still exposes required `visible: true` and `enabled: true`
defaults so the existing Angular/custom-renderer snapshot shape stays total.
Authoring or manually attaching either condition member is rejected. M31 does
not widen the condition grammar, evaluator, source index or action gate.

## 10. Texts, localization and accessibility

Choice resolution reuses `StringChoiceDefinition`, exact ordered
`choiceLabels` and ADR-011 failure isolation. M31 adds two Public +
Experimental + Active `FieldTextMember` values:

- `missing-selection`, source `No value provided.`; and
- `empty-selection`, source `No values selected.`.

`TextResolutionContext` uses the ordinary field branch with the exact M31
definition. `AngularFieldTextSnapshot` adds required non-blank
`missingSelectionLabel` and `emptySelectionLabel`. They are resolved for every
field to keep the transitive Public shape total, but only the M31 renderer
projects them. Resolver exception, non-string or blank result falls back to the
fixed source and emits one existing `TEXT_RESOLUTION_FAILED` warning with the
exact member.

Angular and Standard independently project:

- a persistently labelled native `<select multiple>` or semantic equivalent;
- option text exclusively from resolved choice labels;
- description, hint, tooltip, issues, required and invalid relationships under
  existing field accessibility rules;
- a non-live accessible status that distinguishes missing, present empty and
  present non-empty selection;
- a localized explicit clear action only while the property is present; and
- disabled selection semantics for unrepresentable data without disabling
  clear or hiding retained issues.

The field label never relies on placeholder text. Selection, clear and focus
remain keyboard operable. Reconciliation, locale changes, text projection and
render do not emit domain operations.

## 11. Angular and Standard projection

### 11.1 Angular

The Angular package adds `SchemaStringEnumArrayRendererComponent` as Public +
Experimental + Active from the existing entry point. Its registration
`native-string-enum-array` uses rank `30`, priority `0`, and matches only the
exact normalized kind with own valid choices. Consumer registrations retain
ADR-007 override rules. The headless provider does not include it;
`provideSchemaEngineAngularNative()` does.

The renderer uses one private Angular Signal Form buffer only for selected
presentation tokens. It does not own value, baseline, validation, dirty,
touched or operation application. It maps options by index tokens so blank,
whitespace, punctuation, Unicode and lone-surrogate domain strings never act
as a DOM protocol.

### 11.2 Standard

The private Standard reference renderer implements the same controlled,
ordered, accessible and lossless behavior directly against core contracts. It
does not import Angular components, Signals, token helpers or styles. Semantic
parity is proven with one shared authored scenario and independent target tests.

### 11.3 Shared evidence

The scenario must cover missing, `[]`, ordered selections, append/remove,
clear, confirmation/rejection, equal-array no-op, external reorder, duplicates,
unknown strings, invalid values, issues, dirty/baseline, focus/touched, locale,
blank domain strings and both target accessibility trees.

## 12. Public/Internal migration inventory

| Classification         | Exact effect                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New Public core        | `StringEnumArrayFieldDefinition`.                                                                                                                                              |
| Changed Public core    | `FieldDefinition`; M31 compatibility in runtime/operations/manual definitions; ordered dirty; `FieldTextMember`; `TextResolutionContext`; diagnostics fixed later by SPEC-017. |
| New Public Angular     | `SchemaStringEnumArrayRendererComponent`.                                                                                                                                      |
| Changed Public Angular | Required `missingSelectionLabel` and `emptySelectionLabel` in `AngularFieldTextSnapshot`; native provider registration; transitive field union.                                |
| Internal core          | Descriptor-safe array copying, basic compatibility, no-op/dirty comparison and field issue fallback.                                                                           |
| Internal Angular       | Token buffer, representability and deterministic candidate projection.                                                                                                         |
| Private Standard/apps  | Independent renderer plus one shared authored scenario/evidence.                                                                                                               |
| Unchanged              | Application ownership, operation discriminants, validator port, collection policies/templates/addresses/item operations, package entry points and dependencies.                |

All additions and changes remain Public + Experimental + Active. The
coordinated declaration change requires a later independently approved MINOR
under ADR-010, with package smoke, clean consumer, source reconstruction and
migration evidence. ADR-034 selects no version and authorizes no manifest,
lockfile, dependency, package, release or publication action.

## 13. Consequences

### Positive

- Consumers gain a common multi-selection field without adopting collection
  identity or operation complexity.
- Ordered JSON data is preserved instead of being silently treated as a set.
- Existing choices, labels, validation, controlled-state and renderer override
  architecture remain reusable.
- Lossless projection protects assertion-invalid controlled data from
  accidental repair.

### Costs and risks

- The Public Experimental field/text/Angular declarations widen.
- Native editing of unrepresentable data is intentionally conservative until
  the application clears or replaces it.
- Native multiselection does not offer item reordering; a custom renderer must
  replace the complete ordered array when that product behavior is needed.
- Element-wise dirty/no-op comparison adds bounded work proportional to the
  selected string count.

## 14. Alternatives rejected

### Reuse M10 collection definitions and operations

Rejected because closed strings have no stable item object, editable
descendant or application-owned identity. The extra item runtime would distort
the domain and public API.

### Canonicalize every value in schema-choice order

Rejected because JSON arrays are ordered. Sorting a controlled external value
would change meaning and dirty without an explicit application intention.

### Let the native control drop unknown or duplicate entries

Rejected because visually unrepresentable invalid data must not be repaired as
a side effect of editing another choice.

### Enforce enum membership and uniqueness in core operations

Rejected because the replaceable JSON Schema validator owns assertions and the
runtime must represent temporarily invalid controlled data.

### Add per-choice operations or a set abstraction

Rejected because existing atomic `set-value` already carries a complete value,
and a set would erase ordering semantics.

### Promote free string arrays at the same time

Rejected because free item creation, editing, identity, duplicates and native
interaction require a different consumer contract.

## 15. Explicit exclusions

ADR-034 does not activate:

- arrays of free strings, numbers, integers, booleans, nulls, objects, mixed
  values or arrays;
- tuples, prefix items, nested arrays or arrays inside collection templates;
- `minItems`, `maxItems`, `contains`, `minContains`, `maxContains`,
  `unevaluatedItems` or any unlisted array keyword;
- stable identity, item templates, add/remove/move/replace-item operations,
  selection scopes or partial item validation;
- automatic sorting, deduplication, coercion, repair, initialization, defaults
  or persistence;
- array condition sources/targets, equality predicates, computed values or
  dynamic schemas;
- callbacks, HTTP, submit, saving, workflow, undo/redo or optimistic state;
- React, Vue, Svelte, legacy Angular, UI-library variants, SSR or hydration;
- a new package, entry point, dependency, version, release, publication,
  Stable promotion, commit, push or external action; or
- ADR-005 revision 8, SPEC-017, a plan or implementation before each later
  gate is completely reviewed and accepted.

## 16. Required review and follow-up gates

Complete review must restart after every correction and verify at least:

1. exact D-006/M31 promotion authority and M10 separation;
2. schema/UI grammar and the mandatory ADR-005 revision 8 gate;
3. normalized kind, choices, immutability and manual definitions;
4. basic compatibility versus validator-owned assertions;
5. presence, representability and lossless invalid-data handling;
6. atomic operations, copying, no-op and deterministic ordered toggles;
7. dirty, updates, interaction, scopes and issue routing;
8. unchanged M30 sources/targets and true snapshot defaults;
9. localization, clear semantics and accessibility;
10. independent Angular/Standard projection and evidence;
11. complete ADR-009/010 migration inventory; and
12. exclusions, documentation, links, format and delivery-gate consistency.

Only a complete zero-finding review and Ricard's accepted no-scope-expansion
rule may move revision 0 to Accepted. Acceptance would authorize only drafting
and completely reviewing ADR-005 revision 8. It would not authorize SPEC-017,
a plan, implementation, dependency, version, release, Git or external action.

## 17. Acceptance result

ADR-034 revision 0 is Accepted on 3 August 2026 under Ricard's approved
zero-finding/no-scope-expansion rule. Review 293 cycle 3 repeated all twelve
areas after five corrections and found no unresolved change request.

Acceptance authorizes only drafting and completely reviewing ADR-005 revision 8. SPEC-017, a plan, implementation, dependency, version, release, publication,
commit, push and every external action remain inactive.
