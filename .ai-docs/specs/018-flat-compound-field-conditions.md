# SPEC-018: Flat Compound Conditions for Controlled Primitive-Field State

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 3 August 2026
- **Acceptance date:** 3 August 2026
- **Milestone:** M32 — Declarative compound conditions
- **Promoted capability:** bounded [`D-018`](../roadmap/deferred-decisions.md)
- **Accepted baselines:**
  [`SPEC-016 v0.1.1`](./016-controlled-conditional-primitive-field-state.md)
  and [`SPEC-017 v0.1.0`](./017-controlled-string-enum-array-field.md)
- **Accepted architecture:**
  [`ADR-035 revision 0`](../adrs/035-flat-compound-field-conditions.md)
- **Promotion review:**
  [review 304](../reviews/304-d018-m32-compound-condition-promotion-readiness.md)
  cycle 2
- **Complete review:** [review 306](../reviews/306-spec-018-review.md) cycle 2
  passed all fifteen areas and 22 rows with zero findings after seven
  corrections
- **Acceptance effect:** authorizes only PLAN-034 preparation and
  complete review; no implementation, dependency, version, release, Git or
  external action

## 1. Status and authority

This extension replaces SPEC-016's single-predicate property type and related
compiler/manual/runtime evidence only where stated below. Every unchanged
SPEC-016 rule and Accepted baseline remains authoritative.

M32 adds one flat non-empty `all`/`any` group of existing M30 equality
predicates. It does not add an expression language, recursive group, dependency
graph, new snapshot member or target-owned evaluation.

## 2. Goals

M32 shall:

1. keep every valid M30 predicate object assignable and behavior-identical;
2. add exact Public raw/normalized predicate-or-group unions;
3. compile and validate flat non-empty all/any groups descriptor-safely;
4. evaluate every member deterministically from controlled current value;
5. preserve M30 snapshots, actions, focus, validation and structural sharing;
6. keep Angular/Standard projection independent and definition-neutral; and
7. provide exact declarations, consumers, migration and conformance evidence.

## 3. Non-goals

M32 does not support:

- nested/recursive groups, mixed operators, `not`, inequality, comparison,
  membership, patterns, callbacks or expression strings;
- object, collection, item/template, M31 array or presentation conditions;
- relative/item addresses or derived-state inputs;
- dynamic required/readonly/computed/default or conditional validation;
- a dependency graph, condition cache or Public expression AST;
- M33 object alternatives, M34 wizard/scopes or React/Vue; or
- dependency, manifest, package/version, release or publication changes.

## 4. Public declarations

### 4.1 Preserved predicate contracts

The existing exports remain unchanged:

```ts
export interface UiFieldValueConditionSchema {
  readonly path: readonly string[];
  readonly equals: string | number | boolean | null;
}

export interface FieldValueConditionDefinition {
  readonly sourcePath: DataPath;
  readonly equals: string | number | boolean | null;
}
```

### 4.2 New group contracts

Core adds exactly four Public + Experimental + Active root exports:

```ts
export interface UiFieldValueConditionGroupSchema {
  readonly operator: 'all' | 'any';
  readonly conditions: readonly UiFieldValueConditionSchema[];
}

export type UiFieldConditionSchema =
  UiFieldValueConditionSchema | UiFieldValueConditionGroupSchema;

export interface FieldValueConditionGroupDefinition {
  readonly operator: 'all' | 'any';
  readonly conditions: readonly FieldValueConditionDefinition[];
}

export type FieldConditionDefinition =
  FieldValueConditionDefinition | FieldValueConditionGroupDefinition;
```

`FieldUiSchema.visibleWhen`/`enabledWhen` widen to
`UiFieldConditionSchema`. `BaseFieldDefinition.visibleWhen`/`enabledWhen` widen
to `FieldConditionDefinition`. No other Public member changes.

The existing `FieldTemplate` omission of `visibleWhen` and `enabledWhen`
remains exact. Templates, objects, arrays and presentation definitions expose
neither union.

## 5. Raw UI Schema grammar

### 5.1 Predicate-or-group classification

An own enumerable `visibleWhen` or `enabledWhen` value must be an ordinary
non-array object. Descriptor-safe family selection examines own enumerable
recognized descriptors without reading accessor values:

- `path` or `equals` selects the predicate family;
- `operator` or `conditions` selects the group family;
- at least one recognized member from each family is
  `condition-shape-mixed`;
- no recognized enumerable member selects the predicate family so `{}` keeps
  SPEC-016's missing `path`, then missing `equals` behavior;
- a non-enumerable recognized member is absent and does not select a family;
  and
- an enumerable recognized accessor selects its family and is reported as an
  accessor without execution.

A malformed selected family cannot fall back to the other family.

### 5.2 Group exterior

A group requires own enumerable data members:

```json
{
  "operator": "all",
  "conditions": [
    { "path": ["country"], "equals": "ES" },
    { "path": ["customerType"], "equals": "company" }
  ]
}
```

Rules are exact:

- `operator` is the string `all` or `any`;
- `conditions` is an Array with length at least one;
- every integer key `0..length-1` is an own enumerable data property;
- no enumerable string key exists outside the canonical decimal indices;
- each indexed value is an ordinary non-array predicate object;
- a clean group-family indexed value is rejected as nested;
- a mixed-family indexed value is rejected as mixed at that member;
- each predicate follows every SPEC-016 path/literal/unknown-key rule;
- duplicate predicates are valid and retained as distinct ordered members;
- inherited indices/members are absent and accessors are never executed; and
- symbols and non-enumerable unknown keys do not participate.

The native array `length` property is not an extra enumerable key. Canonical
indices use the same array-index definition as accepted path/enum inspection.

### 5.3 Inspection order

For each target in accepted condition-phase order, inspect:

1. condition exterior and enumerable recognized descriptors;
2. mixed-family state;
3. selected-family required members;
4. for a group, `operator` value;
5. `conditions` exterior, length, exact indices and extra keys;
6. each indexed predicate exterior, mixed/nested family, `path`, then `equals`;
7. group unknown enumerable keys after `operator`, `conditions` and all member
   structural checks; and
8. each safe member's unknown keys after its `path`/`equals` checks.

Independent safe structural defects are collected. A structurally unsafe group
produces no semantic source/literal diagnostics and no partial definition.

## 6. Normalization and immutability

A valid predicate normalizes exactly as SPEC-016. A valid group normalizes to:

```ts
{
  operator: 'all' | 'any';
  conditions: readonly FieldValueConditionDefinition[];
}
```

The compiler allocates a new group, conditions array, predicate and sourcePath
array for every member. All layers and the owning definition are frozen. No raw
object, array, descriptor or path identity is retained. Duplicate members are
not collapsed and their objects remain reference-distinct.

Group member order is raw array index order and is authoritative for linking,
diagnostics, runtime traversal and evidence.

## 7. Compiler diagnostics

### 7.1 Envelope and reason union

All M32 errors retain SPEC-016's envelope:

```ts
{
  code: 'INVALID_UI_FIELD_CONDITION';
  severity: 'error';
  source: 'ui-schema';
  fallbackMessage: 'Field condition is invalid.';
}
```

The existing reason union adds exactly:

```ts
| 'condition-shape-mixed'
| 'condition-group-empty'
| 'condition-group-nested'
```

### 7.2 Extended detail members

Existing condition detail shapes widen only as follows:

```ts
type ConditionStructureMember =
  'condition' | 'path' | 'equals' | 'operator' | 'conditions';

interface CompoundConditionLocation {
  readonly conditionMember: ConditionStructureMember;
  readonly memberIndex?: number;
  readonly conditionKey?: string;
}
```

`memberIndex` is present only for a defect inside/indexing `conditions`.
`conditionKey` is present only for an extra enumerable string key on the
conditions array. Both are copied safe values.

New reasons have exact additions:

```ts
type CompoundConditionDiagnosticDetails =
  | {
      reason: 'condition-shape-mixed';
      conditionMember: 'condition';
      expected: 'predicate or flat condition group';
      memberIndex?: number;
    }
  | {
      reason: 'condition-group-empty';
      conditionMember: 'conditions';
      expected: 'non-empty dense condition array';
      actualType: 'array';
      actualLength: 0;
    }
  | {
      reason: 'condition-group-nested';
      conditionMember: 'condition';
      expected: 'non-nested condition predicate';
      memberIndex: number;
    };
```

Existing reasons map group defects exactly:

- missing `operator`/`conditions` uses `condition-member-missing` with that
  `conditionMember`;
- recognized/group/index/member accessors use `condition-member-accessor`;
- invalid operator uses `condition-member-invalid`, `conditionMember:
'operator'`, expected `'all' or 'any'` and safe `actualType`; an invalid
  string additionally copies `actualOperator`;
- a zero-length conditions array uses the specific
  `condition-group-empty` shape above;
- invalid non-array conditions exterior, sparse/non-enumerable index or extra
  key uses
  `condition-member-invalid`, `conditionMember: 'conditions'`, expected
  `non-empty dense condition array`, plus only safe applicable
  `actualType`/`actualLength`/`memberIndex`/`conditionKey`;
- non-object member uses `condition-not-object`, expected `condition object`
  and `memberIndex`;
- member predicate path/equals defects retain SPEC-016 reasons and add
  `memberIndex`; and
- semantic target/source/literal reasons retain SPEC-016 details and add
  `memberIndex` only for a group member.

Missing, sparse and accessor values never expose unsafe `actualType` or values.
`actualOperator` is present only for a safely read string and is copied exactly.

### 7.3 Document/data paths and ordering

Group document paths are exact:

- exterior/mixed: target condition member;
- operator: `...,conditionMember,'operator'`;
- conditions exterior/empty: `...,conditionMember,'conditions'`;
- sparse/accessor/non-object/nested member:
  `...,conditionMember,'conditions',memberIndex`;
- member path/equals: append `'path'`/`'equals'` and existing path index/key as
  applicable; and
- conditions extra key: `...,conditionMember,'conditions',conditionKey`.

`dataPath`, template provenance and immutable parameter containers retain
SPEC-016 rules. Semantic diagnostics replay normalized field order,
`visibleWhen` before `enabledWhen`, then group index order. Every structurally
safe group member links even after an earlier semantic failure.

Unknown UI warnings do not invalidate a group. Group unknown keys follow all
recognized group/member diagnostics; each predicate's unknown keys follow that
predicate's recognized diagnostics in member order.

## 8. Manual `FormDefinition` validation

Manual conditions classify exact own enumerable normalized descriptors:
`sourcePath`/`equals` versus `operator`/`conditions`. Non-enumerable members are
absent; accessors are never executed. Raw `path` is not accepted in a
predicate definition and normalized `sourcePath` is not accepted in UI Schema.
Other enumerable string keys do not select a family, are ignored and are not
retained, matching SPEC-016 manual-definition behavior.

The existing two-phase validation remains:

1. detach and validate the entire definition/condition shape in ordinary field,
   condition member and group index order; then
2. link every safe predicate to the exact managed ordinary source and validate
   target capability/literal compatibility.

The definition reason union adds:

```ts
| 'invalid-field-condition-group'
| 'nested-field-condition-group'
```

`invalid-field-condition-group` covers mixed families, missing/invalid
operator or conditions, empty/sparse/non-enumerable/accessor/extra-key arrays
and invalid indexed exteriors. `nested-field-condition-group` covers a clean
group-family indexed member. Predicate structural, source and literal failures
retain SPEC-016 definition reasons.

Every direct defect retains the existing copied field/template locator and
`conditionMember: 'visibleWhen' | 'enabledWhen'`. New direct details are exact:

```ts
type DefinitionConditionGroupDetails =
  | {
      reason: 'invalid-field-condition-group';
      conditionGroupReason:
        | 'shape-mixed'
        | 'member-missing'
        | 'member-accessor'
        | 'member-invalid'
        | 'empty'
        | 'member-not-object';
      conditionDetailMember?: 'condition' | 'operator' | 'conditions';
      conditionExpected?: string;
      conditionActualType?: string;
      conditionActualLength?: number;
      conditionActualOperator?: string;
      conditionGroupIndex?: number;
      conditionGroupKey?: string;
    }
  | {
      reason: 'nested-field-condition-group';
      conditionDetailMember: 'condition';
      conditionExpected: 'non-nested condition predicate';
      conditionGroupIndex: number;
    };
```

A predicate defect inside a group retains SPEC-016's
`invalid-field-condition` details and adds `conditionGroupIndex`; its existing
`conditionIndex` continues to mean an index inside `sourcePath`. Semantic
source/literal reasons likewise add only `conditionGroupIndex`.

The `INVALID_RUNTIME_OPTIONS` wrapper prefixes the new fields exactly as
`definitionConditionGroupReason`, `definitionConditionGroupIndex`,
`definitionConditionGroupKey` and `definitionConditionActualOperator`; it
retains existing prefixed members and unprefixed locators. Only applicable safe
members are present. All arrays/parameter containers are copied and frozen.

Caller objects are not mutated or retained.

Any definition defect prevents validator, controlled-value traversal, runtime
listener, operation and target invocation. Conditions on templates, objects,
collections, M31 arrays or presentation nodes retain unsupported-location
precedence before any group evaluation.

## 9. Runtime evaluation

### 9.1 Member match

Every normalized member uses SPEC-016 exactly:

```ts
match =
  presence.kind === 'value' && Object.is(presence.value, condition.equals);
```

Missing, missing-ancestor and incompatible-ancestor are false. Present
assertion-invalid but basically compatible primitive data may match. A
basically incompatible present value cannot equal an accepted primitive/null
literal and therefore does not match.

### 9.2 Complete traversal and combination

Runtime evaluates every group member in authored order and stores the local
booleans before combining them. It does not semantically short-circuit source
traversal:

```ts
result =
  group.operator === 'all'
    ? memberResults.every(Boolean)
    : memberResults.some(Boolean);
```

Groups are non-empty. Duplicates are evaluated independently. Runtime cannot
emit a condition diagnostic after successful definition/data validation.

### 9.3 Schedule, snapshots and sharing

Evaluation occurs only:

1. after initial external managed-data validation and before the first
   snapshot; and
2. once per accepted external update whose current `value` reference changes.

Same-reference, baseline-only, locale, issue, validation, async completion,
touched, focus, scope and presentation updates do not reevaluate groups.

Missing condition means `true`; predicate/group result becomes the existing
required `visible`/`enabled` boolean. No snapshot shape changes. Fixed fields
remain enabled because valid definitions cannot author `enabledWhen` there.

If a value reference changes but existing snapshot members and both flags stay
equal, the field snapshot may retain identity. A changed flag rebuilds that
field and necessary ancestors only; unrelated branches retain identity.

## 10. Focus, actions and domain invariants

SPEC-016 focus reconciliation and action order are unchanged. When a compound
result makes the focused target hidden or disabled, the same external update
clears focus without adding touched or emitting an operation. A later true
result does not restore focus.

Disposed/target/basic-compatibility/incompatible-ancestor checks still precede
hidden, then disabled, then no-effect and operation construction. Stale target
instances cannot bypass the current compound result.

Compound evaluation never mutates value/baseline, changes dirty, filters
validation/issues, creates scopes, modifies layout state or emits an operation.
Sync/async validators receive the exact original schema and full controlled
value with unchanged invocation/lifecycle semantics.

## 11. Target projection and shared evidence

Angular and Standard consume only snapshot booleans. Target source must not
import `FieldConditionDefinition` for renderer behavior, inspect UI Schema or
evaluate group members.

One deeply frozen shared scenario shall include:

- one `all` visibility group and one `any` enabled group;
- direct and nested ordinary primitive targets/sources;
- strict false, zero, empty string and nullable-null members;
- a hidden source whose controlled value still participates;
- false→true→false transitions driven only by confirmed external values;
- focused-target false transition and stale action rejection; and
- unchanged operation/value/baseline/validation/issue evidence.

Angular and Standard independently prove mounted hidden/disabled accessibility,
focus, lifecycle, locale, replacement and Chromium parity. No renderer
reselection or target-specific condition service is allowed.

## 12. Collections, M31 and presentation

Collection templates/items and M31 atomic string-enum array definitions cannot
author, source or target a group. Their snapshots remain exactly
`visible: true, enabled: true`. Numeric/item intentions and collection identity
are unaffected.

Static sections/tabs/accordions/grids remain mounted and target-owned. A group
does not condition a container, create a step/scope, alter selected tab/panel
state or define workflow.

## 13. Public migration and package evidence

Current-source consumers must account for four new root exports and the two
widened condition-property types. Existing authored predicate object literals
remain assignable and behavior-identical. Raw readers narrow
`operator`/`conditions` versus `path`/`equals`; normalized readers narrow
`operator`/`conditions` versus `sourcePath`/`equals`. No helper or callback is
added.

Required evidence includes:

- exact core root declaration/runtime export inventories;
- package smoke for single/group authoring, normalization and runtime truth;
- built Angular consumer behavior;
- strict clean core and Angular lower/latest consumers;
- isolated source reconstruction with equivalent declarations/behavior;
- migration examples for exhaustive type readers; and
- zero manifest, dependency, peer, export-map, lockfile or version drift.

Published `0.4.1` core/base and `0.2.1` pilot artifacts remain unchanged. A
future coordinated MINOR/release needs a separate gate.

## 14. Conformance matrix

| Row | Required evidence                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------- |
| 1   | Existing raw/manual single predicates remain assignable, compile/validate and behave identically.                          |
| 2   | Exact four new root declarations and two widened properties narrow exhaustively.                                           |
| 3   | Direct/nested valid all/any groups normalize with frozen retained order and detached identity.                             |
| 4   | Exterior/non-enumerable/accessor family classification and mixed-shape diagnostics are exact.                              |
| 5   | Missing/invalid operator and conditions exterior diagnostics/paths/parameters are exact.                                   |
| 6   | Empty, sparse, non-enumerable/accessor index and extra-key conditions arrays fail safely and deterministically.            |
| 7   | Non-object, mixed and nested indexed members plus predicate path/literal/unknown-key ordering are exact.                   |
| 8   | Semantic source/literal linking collects safe member failures in field/member/index order with schema-blocked suppression. |
| 9   | Normalized groups preserve legal duplicates as distinct frozen members and retain no raw identity.                         |
| 10  | Manual definitions enforce exact predicate/group shapes, two-phase precedence, locators and non-invocation.                |
| 11  | All truth matrices cover present/missing/blocked/null/false/zero/empty/assertion-invalid sources.                          |
| 12  | Any truth matrices cover the same values and retain complete ordered member traversal without semantic short-circuit.      |
| 13  | Initial/current-reference evaluation and all baseline/locale/validation/interaction/same-reference non-triggers are exact. |
| 14  | Snapshot flags, structural sharing and focused false-transition reconciliation remain M30-compatible.                      |
| 15  | Hidden/disabled stale action defense and exact diagnostic/no-effect precedence remain unchanged.                           |
| 16  | Value, baseline, dirty, operations, scopes, sync/async validation, issues and static layout remain unchanged.              |
| 17  | Collection/item/template and M31 authoring/source/target exclusions plus constant snapshot flags pass.                     |
| 18  | Angular independently proves mounted/accessibility/focus/lifecycle compound behavior without definition evaluation.        |
| 19  | Standard independently proves equivalent behavior without sharing renderer logic.                                          |
| 20  | Shared authored scenario and both Chromium suites prove all/any transitions and invariant evidence.                        |
| 21  | Exact exports/declarations, package/built/clean/source consumers and migration pass without dependency/version drift.      |
| 22  | Frozen complete workspace, policy/security/boundary/browser/docs/diff matrix passes before completion.                     |

## 15. Acceptance criteria

SPEC-018 may be accepted only when:

1. every rule is consistent with ADR-035 and unchanged SPEC-016 authority;
2. only the flat non-empty predicate-or-all/any boundary is active;
3. declarations, raw/manual grammar and normalized immutability are exact;
4. compiler/manual diagnostics, parameters, paths, ordering and stopping are
   closed and descriptor-safe;
5. runtime truth, complete traversal, triggers and sharing are deterministic;
6. focus/action/validation/domain invariants remain M30-compatible;
7. Angular/Standard/shared evidence is independent and accessible;
8. collections, M31, presentation and future milestones remain excluded;
9. package migration and future-MINOR separation are complete;
10. all 22 rows have unique future checkpoint ownership;
11. no plan/code/delivery change precedes acceptance; and
12. every correction restarts the complete review until one pass has zero
    findings and no unresolved documentation conflict.

Acceptance authorizes only PLAN-034 preparation and complete review. It does
not approve that plan or authorize implementation, dependency, version,
release, publication, Git or external action.

Review 306 cycle 2 passed all fifteen areas and all 22 rows with zero findings
after seven corrections. Under Ricard's accepted zero-finding/no-scope-
expansion rule, v0.1.0 is Accepted and authorizes only PLAN-034 preparation and
complete review.

## 16. History

| Version | Date       | Change                                                                                 |
| ------- | ---------- | -------------------------------------------------------------------------------------- |
| 0.1.0   | 2026-08-03 | Accepted after review 306 cycle 2 passed fifteen areas and 22 rows with zero findings. |
