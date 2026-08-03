# ADR 035: Flat compound conditions for controlled primitive-field state

- **Status:** Accepted
- **Date:** 3 August 2026
- **Acceptance date:** 3 August 2026
- **Revision:** 0
- **Milestone:** M32 — Declarative compound conditions
- **Promotes:** only the D-018 boundary selected by
  [review 304](../reviews/304-d018-m32-compound-condition-promotion-readiness.md)
  cycle 2
- **Requires:** Accepted ADR-009, ADR-010, ADR-014, ADR-015, ADR-019,
  ADR-023, ADR-025, ADR-033 and ADR-034; Accepted SPEC-001, SPEC-002,
  SPEC-003, SPEC-006, SPEC-008, SPEC-009, SPEC-016 and SPEC-017
- **Complete review:** [review 305](../reviews/305-adr-035-review.md) cycle 2
  passed all twelve areas with zero findings after six corrections
- **Acceptance effect:** authorizes only SPEC-018 preparation and
  complete review; no plan, implementation, dependency, version, release, Git
  or external action

## 1. Context

M30 lets an ordinary primitive field derive `visible` and `enabled` from one
equality predicate over one other ordinary primitive value. The application
retains all value/baseline authority, core emits the two neutral booleans and
Angular/Standard project them without evaluating raw UI metadata.

Many useful rules require only a finite conjunction or disjunction of that
already accepted primitive: show a tax identifier when the country is Spain
and the customer is a company, or enable an approval field when the actor is an
owner or administrator. Introducing an expression language, recursive AST or
dependency graph for those cases would enlarge the contract without changing
their controlled semantics.

Review 304 therefore promotes one M32 design question: retain the existing M30
predicate and add exactly one flat non-empty `all`/`any` group. M33 object
alternatives, M34 wizard behavior and React remain later independent gates.

## 2. Decision summary

`visibleWhen` and `enabledWhen` accept either:

1. the existing M30 `{ path, equals }` predicate; or
2. `{ operator: 'all' | 'any', conditions: [...] }`, where `conditions` is one
   non-empty dense array containing only existing M30 predicates.

Groups cannot contain groups. Both operator members cannot coexist because the
operator is one scalar discriminant. Every member retains M30's exact
descriptor, path, source, literal and presence semantics.

The compiler detaches and freezes a normalized predicate or group. Runtime
evaluates every group member in authored order from the current controlled
value and combines the booleans. Snapshots remain exactly `visible` and
`enabled`; renderers never receive or evaluate the condition definition.

## 3. Public raw authoring contract

### 3.1 Preserved M30 predicate

The existing Public + Experimental + Active interface remains unchanged:

```ts
export interface UiFieldValueConditionSchema {
  readonly path: readonly string[];
  readonly equals: string | number | boolean | null;
}
```

Every valid M30 predicate object remains assignable and has identical meaning.

### 3.2 Flat group and union

Core adds:

```ts
export interface UiFieldValueConditionGroupSchema {
  readonly operator: 'all' | 'any';
  readonly conditions: readonly UiFieldValueConditionSchema[];
}

export type UiFieldConditionSchema =
  UiFieldValueConditionSchema | UiFieldValueConditionGroupSchema;
```

`FieldUiSchema` widens only the property types:

```ts
export interface FieldUiSchema {
  // Existing members remain unchanged.
  readonly visibleWhen?: UiFieldConditionSchema;
  readonly enabledWhen?: UiFieldConditionSchema;
}
```

The group uses an explicit scalar `operator` rather than operator-named members
so the descriptor family and future exhaustive narrowing are unambiguous. Only
`all` and `any` are accepted; this choice does not reserve other operators.

### 3.3 Exact group grammar

A group is an ordinary non-array object with own enumerable data members
`operator` and `conditions`:

- `operator` is exactly the string `all` or `any`;
- `conditions` is a non-empty dense array of own enumerable indexed data
  properties with no extra enumerable string keys outside its exact indices;
- every indexed value is an ordinary non-array M30 predicate with own
  enumerable data `path` and `equals` members;
- no indexed value may be a group, including a structurally valid nested group;
- duplicate predicates are legal, retained and evaluated independently in
  authored order;
- inherited members are absent and no accessor is executed;
- enumerable keys outside the selected shape use the existing unknown UI key
  warning policy; and
- symbols and non-enumerable unknown members do not participate.

Empty groups are invalid rather than adopting vacuous truth. Sparse,
non-enumerable or accessor indices are structural defects. Array prototype
members and inherited indices never fill a gap.

### 3.4 Shape classification

Descriptor-safe classification inspects the four recognized names without
reading values:

- any own enumerable `path` or `equals` data/accessor descriptor selects the
  predicate family;
- any own enumerable `operator` or `conditions` data/accessor descriptor
  selects the group family;
- members from both families make the exterior mixed and invalid;
- no recognized own member selects an incomplete predicate exterior so the
  existing missing-member ordering remains the default; and
- an enumerable accessor at any recognized own member is reported before its
  data value can influence classification. A non-enumerable recognized member
  remains absent under the M30 rule and does not select a family.

Within the selected family, required members, values and unknown enumerable
keys are checked in the exact order defined below. An object cannot fall back
from a malformed group to a predicate or vice versa.

## 4. Normalized definition contract

### 4.1 Preserved normalized predicate

The existing interface remains unchanged:

```ts
export interface FieldValueConditionDefinition {
  readonly sourcePath: DataPath;
  readonly equals: string | number | boolean | null;
}
```

### 4.2 Normalized group and union

Core adds:

```ts
export interface FieldValueConditionGroupDefinition {
  readonly operator: 'all' | 'any';
  readonly conditions: readonly FieldValueConditionDefinition[];
}

export type FieldConditionDefinition =
  FieldValueConditionDefinition | FieldValueConditionGroupDefinition;
```

`BaseFieldDefinition.visibleWhen` and `.enabledWhen` widen to
`FieldConditionDefinition`. `FieldTemplate` continues to omit both members and
gains no group type.

The compiler creates a new group object, conditions array, predicate object and
`sourcePath` array for every normalized member. Every layer is frozen. No raw
object, array, descriptor or path identity is retained. Duplicate normalized
members remain distinct frozen objects in their authored order.

## 5. Compiler pipeline and diagnostics

### 5.1 Structural capture

The existing descriptor-safe UI traversal captures each condition candidate.
For a group it validates, in order:

1. exterior and recognized member descriptors;
2. shape-family exclusivity;
3. own enumerable `operator`, then `conditions` presence;
4. operator value;
5. conditions array exterior, non-empty length and absence of extra enumerable
   string keys;
6. every index descriptor and predicate exterior in ascending index order;
7. every member predicate's `path`, then `equals`, using M30 rules; and
8. unknown enumerable keys on the group and each predicate in their existing
   warning order.

All recognized descriptors are inspected without executing getters. A
structurally unsafe group produces no normalized partial member and does not
advance to source/literal linking.

### 5.2 Semantic linking

After the complete ordinary-field index exists, semantic linking retains M30
target order: normalized depth-first ordinary field order, `visibleWhen`
before `enabledWhen`, and group members by ascending authored index.

Every structurally valid member is linked even when an earlier member has a
semantic failure. This produces deterministic complete diagnostics without
runtime short-circuiting or a dependency graph. Schema-blocked index absence
retains M30 cascade suppression.

Target eligibility, exact source resolution, primitive/nullability literal
compatibility, fixed-target `enabledWhen` exclusion and condition atomicity are
unchanged. A group is valid only when every member is valid; compilation never
emits a partial group or partial definition.

### 5.3 Diagnostic extensions

M32 retains `INVALID_UI_FIELD_CONDITION`, its severity/source/fallback and all
M30 reasons. The closed reason union adds exactly:

| Reason                   | Meaning                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `condition-shape-mixed`  | Predicate-family and group-family own members coexist.             |
| `condition-group-empty`  | `conditions` is a structurally valid array with length zero.       |
| `condition-group-nested` | An indexed member selects the group family instead of a predicate. |

Existing reasons remain authoritative:

- invalid operator, conditions-array exterior/index/key or member-predicate
  `path`/`equals` value uses `condition-member-invalid`;
- recognized-member or indexed accessors use `condition-member-accessor`;
- absent `operator`/`conditions` or member `path`/`equals` uses
  `condition-member-missing`;
- a non-object indexed member uses `condition-not-object`; and
- source/target/literal failures retain their M30 reasons.

Exact document paths append `operator`, `conditions`, the decimal member index
and then `path`/`equals` as applicable. Target `dataPath`, source parameters and
safe actual-type rules remain M30-compatible. Group structural diagnostics add
only safe `operator`, `memberIndex` or expected strings when applicable; they
never retain a raw group/member/value.

The exact new expectations are `'all' or 'any'`, `non-empty dense condition
array` and `non-nested condition predicate`. SPEC-018 must close the exact
parameter unions, path examples, ordering against unknown keys and sparse/
accessor cases.

## 6. Manual definition validation

Runtime creation and `applyFormOperation()` classify own condition objects by
the normalized names `sourcePath`/`equals` versus `operator`/`conditions`.
They use the same predicate-or-flat-group exclusivity and never execute an
accessor. Other enumerable string keys retain M30 manual-definition behavior:
they do not select a family, are ignored and are not retained.

The existing two phases remain:

1. validate and detach every definition and condition shape in field/member/
   group-index order; then
2. link every safe predicate against the complete exact ordinary-field index
   and check target/source/literal compatibility.

The accepted definition envelopes retain all M30 reasons and add:

- `invalid-field-condition-group` for mixed, malformed, empty, sparse or
  accessor group structure; and
- `nested-field-condition-group` for a group member selecting group shape.

Member-level M30 source and literal reasons are retained with an immutable
`memberIndex`. A group defect prevents validator, controlled-value traversal,
operation or target invocation under the existing atomic boundary. Own
conditions on templates, M31 arrays and other unsupported nodes are rejected
before group evaluation.

Caller definitions need not be frozen. Accepted definitions are not mutated,
and runtime retains only its normal immutable definition ownership.

## 7. Runtime evaluation

### 7.1 Predicate and group semantics

Every member uses the M30 predicate result:

```ts
match =
  presence.kind === 'value' && Object.is(presence.value, condition.equals);
```

Runtime evaluates every group member in authored order without semantic
short-circuiting. It then computes:

```ts
allResult = memberResults.every((result) => result);
anyResult = memberResults.some((result) => result);
```

Because groups are non-empty, no vacuous result exists. Duplicate members are
not deduplicated. Missing, missing-ancestor and incompatible-ancestor presence
remain non-matches. A present assertion-invalid but basically compatible value
may still match; a basically incompatible present value cannot be `Object.is`
equal to the accepted primitive/null literal and therefore does not match.

### 7.2 Evaluation triggers and structural sharing

Groups use M30's evaluation boundary:

- initial runtime creation;
- accepted external current-value reference changes; and
- no reevaluation for baseline-only, locale, touched, focus, issue,
  validation-only or same-reference mutation.

Runtime creates no dependency index/cache. It linearly evaluates normalized
ordinary fields and their finite member arrays. Existing snapshot structural
sharing remains result-based: unchanged value/presence/visible/enabled and
other accepted members retain the existing identities; a changed derived flag
replaces only the required affected snapshot path.

### 7.3 Actions, focus and validation

Hidden/disabled precedence, stale renderer defense, focused-field
reconciliation, touched preservation and no automatic focus restoration remain
exactly M30. Group truth changes no value, baseline, dirty, validation, issue,
scope or static presentation state and emits no operation.

The full original JSON Schema/value continues to reach sync and async
validators. A validator never receives the condition definition and condition
truth never filters validation or issues.

## 8. Target projection and reference evidence

Angular and Standard continue consuming only `snapshot.visible` and
`snapshot.enabled`. They must not import or narrow `FieldConditionDefinition`
for rendering and must not inspect UI Schema condition objects.

The shared scenario catalog may add authored compound cases and expected
neutral transitions. Each target independently proves:

- all/any false/true transitions from confirmed external values;
- mounted hidden and disabled accessibility;
- focus reconciliation and stale-event rejection;
- operation history/value/baseline/validation invariance;
- nested ordinary owner compatibility; and
- replacement, locale and lifecycle non-regression.

No target-specific condition service, Signal/RxJS expression engine, DOM
selector dependency or shared renderer implementation is admitted.

## 9. Collections, M31 and presentation compatibility

M32 does not change collection templates/items or the atomic M31 string-enum
array field. They cannot author, source or target a group and retain constant
`visible: true`/`enabled: true`. A surrounding ordinary field group may coexist
with them but cannot address into their data.

Static sections/tabs/accordions/grids remain mounted and target-owned. Group
truth neither changes layout state nor creates presentation conditions,
declarative scopes, steps or workflow.

## 10. Public migration and packages

M32 is a Public + Experimental type widening:

- existing predicate object literals remain assignable and behavior-identical;
- consumers that read `visibleWhen`/`enabledWhen` must narrow
  `FieldConditionDefinition` before accessing `sourcePath`/`equals`;
- exhaustive declarations and package/clean/source consumers must demonstrate
  both branches; and
- migration documentation must state that published `0.4.1` packages do not
  contain M32.

The source change requires a separately selected coordinated future MINOR
under ADR-010. This ADR selects no version or release. No dependency, manifest,
peer range, entry point, export map, lockfile or current package artifact
changes.

## 11. Consequences

### Positive

- Common conjunction/disjunction becomes framework-neutral and deterministic.
- Existing M30 authoring and snapshots remain usable.
- Future targets, including React, inherit booleans instead of expression
  semantics.
- Flat groups avoid a parser, recursive AST and dependency graph.

### Trade-offs

- Readers of the Experimental normalized property must add union narrowing.
- Linear evaluation repeats shared source reads across members/fields.
- Duplicate predicates are retained rather than diagnosed or canonicalized.
- More expressive rules still require a later independent architecture.

## 12. Rejected alternatives

### Recursive boolean expression tree

Rejected for M32. Recursion, arbitrary nesting, mixed operators, depth limits
and recursive diagnostics would establish the expression-engine surface D-018
still defers.

### Separate `visibleWhenAll` / `visibleWhenAny` members

Rejected. Multiple parallel members create precedence and coexistence rules,
duplicate the visible/enabled surface and complicate future exhaustive
narrowing. One condition union preserves the existing property.

### Operator-named `{ all: [...] }` / `{ any: [...] }` groups

Rejected. Recognized-key classification and mixed-family diagnostics become
less explicit, while an `operator` discriminant maps directly to a stable
TypeScript union.

### Compile groups into callbacks

Rejected. Functions are not serializable, inspectable or safely portable and
would hide evaluation semantics from declarations/conformance evidence.

### Dependency graph and incremental cache

Rejected until measured scale justifies observable complexity. Finite linear
evaluation is correct and consistent with M30.

### Delay conditions until React

Rejected by the accepted product order. Stabilizing neutral behavior first
lets future targets consume the final snapshot contract once.

## 13. Explicit non-goals

ADR-035 does not activate:

- nested/recursive groups, `not`, comparisons, membership, ranges, patterns,
  callbacks, expression strings or arbitrary operators;
- object/collection/item/template/M31/presentation conditions or relative
  addresses;
- derived-state inputs, dynamic required/readonly/computed/default,
  conditional validation or value mutation;
- dependency graphs, caches, plugins, hooks, commands or transactions;
- M33 `oneOf`, M34 wizard/scopes, React/Vue, UI kits or legacy Angular;
- a SPEC, plan, code, dependency, package/version, release, publication, Git or
  external action.

## 14. Required SPEC-018 conformance boundary

A later SPEC must assign exact evidence for at least:

1. unchanged single-predicate declarations and behavior;
2. exact raw/normalized union exports and exhaustive narrowing;
3. valid direct/nested all/any compilation and immutable ordering;
4. exterior, family, member, operator and conditions descriptor safety;
5. empty/sparse/non-enumerable/accessor/mixed/nested group diagnostics;
6. member predicate path/literal diagnostics and unknown-key ordering;
7. semantic link order, multiple failures and schema-blocked suppression;
8. manual definition two-phase validation and exact locators;
9. duplicate preservation and no input identity retention;
10. all/any truth matrices across present/missing/blocked primitive values;
11. no semantic short-circuit and deterministic member traversal;
12. initial/current update triggers and non-triggers;
13. structural sharing and focused false-transition reconciliation;
14. hidden/disabled action precedence and stale target defense;
15. unchanged value/baseline/dirty/scopes/sync+async validation/issues;
16. collection/M31 unconditional-state non-regression;
17. Angular mounted/accessibility/lifecycle behavior;
18. independent Standard equivalent behavior;
19. shared authored scenario and Chromium parity;
20. exact declarations/exports and migration documentation;
21. package, built/clean/source consumer evidence without graph/version drift;
    and
22. frozen complete workspace/policy/security/boundary/browser/docs matrix.

## 15. Acceptance gate

ADR-035 may become Accepted only after one complete repeated review confirms:

1. exact review-304 authority and exclusions;
2. backward-compatible authoring plus explicit reader migration;
3. closed raw/normalized grammar and hostile-descriptor behavior;
4. deterministic diagnostics, ordering, parameters and atomic stopping;
5. M30-compatible evaluation, sharing, actions, focus and validation;
6. target neutrality plus independent Angular/Standard evidence;
7. collection/M31/presentation non-regression;
8. package/dependency/version/release separation;
9. sufficient SPEC conformance ownership; and
10. documentation, links, formatting and diff hygiene.

Acceptance authorizes only preparing and completely reviewing SPEC-018. It
does not authorize a plan, implementation, dependency, version, release,
publication, commit, push or external action.

Review 305 cycle 2 passed all twelve areas with zero findings after six
corrections. Under Ricard's accepted zero-finding/no-scope-expansion rule,
revision 0 is Accepted and authorizes only SPEC-018 preparation and complete
review.

## 16. History

| Revision | Date       | Change                                                                        |
| -------- | ---------- | ----------------------------------------------------------------------------- |
| 0        | 2026-08-03 | Accepted after review 305 cycle 2 passed all twelve areas with zero findings. |
