# SPEC-016: Controlled Conditional Primitive-Field State

- **State:** Accepted
- **Version:** 0.1.1
- **Date:** 3 August 2026
- **Acceptance date:** 3 August 2026
- **Revision review:**
  [review 283](../reviews/283-spec-016-revision-1-review.md) cycle 1 passed all
  seventeen areas and 24 conformance rows with zero findings
- **Original complete review:**
  [review 281](../reviews/281-spec-016-review.md) cycle 3 passed all seventeen
  areas and 24 conformance rows with zero findings after seven corrections
- **Milestone:** M30 — Controlled conditional field state
- **Promoted capability:** bounded D-018 selected by
  [review 279](../reviews/279-d018-m30-conditional-field-state-promotion-readiness.md)
  cycle 2
- **Accepted architecture:**
  [ADR-033 revision 0](../adrs/033-controlled-conditional-primitive-field-state.md)
- **Accepted baselines:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0, SPEC-009 v0.1.0, SPEC-010 v0.1.0, SPEC-011
  v0.1.0, SPEC-012 v0.1.0, SPEC-013 v0.1.1, SPEC-014 v0.1.0 and SPEC-015
  v0.1.0
- **Authority:** Accepted observable M30 contract; Approved PLAN-032 revision 1
  authorizes checkpoints 1–7 in order, not dependency, version, release,
  publication, commit, push or external action

## 1. Status and scope

This specification translates Accepted ADR-033 into one observable,
declaration-ready M30 contract. An ordinary primitive field may declare one
strict equality predicate for visibility and one for enabled state, each
reading another or the same ordinary primitive field from the application-
controlled current value.

Core compiles immutable predicates, derives required neutral snapshot booleans,
reconciles focus and blocks stale interaction. Angular and Standard project the
same semantics independently while retaining field hosts. Conditions never
change data, baseline, dirty, validation, issues, scopes or presentation
containers.

All unchanged Accepted contracts remain authoritative. Collection-template
conditions, compound expressions, dependency graphs, dynamic validation and
every other D-018 capability remain Deferred.

## 2. Goals

M30 shall specify:

1. exact raw and normalized equality-predicate contracts;
2. descriptor-safe UI inspection and complete path/literal diagnostics;
3. ordinary-field linking through nested objects, references and static
   object composition;
4. manual-definition validation without collection-template activation;
5. controlled linear runtime evaluation with exact missing/blocked/null
   semantics;
6. required visible/enabled snapshot flags, structural sharing and focus
   reconciliation;
7. a core hidden/disabled action gate independent of target correctness;
8. unchanged validation, dirty, scope and static-layout authority;
9. mounted accessible Angular and Standard projection from one shared authored
   scenario;
10. exact Public/Internal/package migration and conformance evidence; and
11. no implementation or delivery mutation before later gates.

## 3. Non-goals

M30 does not support:

- operators other than strict equality, multiple predicates per effect,
  AND/OR/NOT, arbitrary expression strings, callbacks or scripts;
- a dependency graph, incremental dependency cache or Public evaluator;
- conditions on objects, arrays, collection templates/items, identity fields,
  presentation entries/containers, scopes, actions or issues;
- dynamic `required`/readonly, computed values, conditional defaults,
  coercion, clearing, initialization or generated operations;
- conditional validation, hidden-issue filtering or schema rewriting;
- workflow, wizard navigation, declarative scopes, persistence or submit;
- dynamic `FormDefinition` replacement, React, Vue, legacy Angular, another UI
  kit, SSR, hydration, portals or adapter-capability work; or
- a new package/entry point/dependency, version selection, release,
  publication, Stable promotion, Git or external mutation.

## 4. Public neutral authoring and definition contracts

### 4.1 New types

Core adds exactly two Public + Experimental + Active root exports:

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

No literal alias, operator enum, expression node, callback or options type is
added.

### 4.2 Widened UI field shape

`FieldUiSchema` adds only:

```ts
readonly visibleWhen?: UiFieldValueConditionSchema;
readonly enabledWhen?: UiFieldValueConditionSchema;
```

At every ordinary primitive UI field, inspection of these members occurs after
all Accepted text, enum-label and numeric-option members and before unknown
members. `visibleWhen` precedes `enabledWhen`.

An absent or inherited condition member means no predicate. An own member must
be enumerable; a non-enumerable member is treated as absent. An own enumerable
accessor is invalid and is never invoked.

### 4.3 Raw condition object

A valid condition is an ordinary non-array object. Only own enumerable data
members participate:

1. `path` is required and inspected first;
2. `equals` is required and inspected second; and
3. other enumerable string keys are reported afterward through the existing
   `UNKNOWN_UI_SCHEMA_KEY` warning and otherwise ignored.

`path` must be a dense non-empty array. Its own `length` must be a data value
greater than zero. Every index from `0` through `length - 1` must be an own
enumerable string data property. Extra enumerable non-index keys invalidate the
path. Segments are copied exactly; blank strings, punctuation, `__proto__`,
Unicode and lone surrogates remain valid property names.

`equals` must be an exact string, finite number, boolean or null. Empty/blank
strings, `-0`, zero and false are valid. `NaN`, infinities, undefined, bigint,
symbol, function, object and array are invalid. No coercion, trimming,
normalization or parsing occurs.

### 4.4 Eligible ordinary targets

`visibleWhen` may target any ordinary primitive `FieldDefinition`, including a
direct/nested/referenced/composed, nullable, formatted, enum or fixed field.

`enabledWhen` may target the same ordinary primitive positions except a field
with own normalized `fixedValue`. Fixed presentation has no neutral editing
intention to enable; such authoring is blocking `incompatible-target`.

The following locations reject either member as
`unsupported-target-location`: ordinary object, ordinary array, collection
item root, object/field template, collection identity and any presentation
section/container/panel/grid entry. A malformed condition exterior at those
locations remains independently diagnosable before location compatibility.

### 4.5 Eligible source and literal

The copied absolute path must resolve exactly to an ordinary primitive member
of completed `FormDefinition.fields`. The source may equal the target and may
itself have condition metadata. Objects, arrays, unmanaged paths and paths
below a collection array are invalid sources. No numeric segment, item ID,
collection index, relative template path or presentation identity is admitted.

The literal must match the normalized source's basic capability:

| Source definition | Compatible `equals` literal                |
| ----------------- | ------------------------------------------ |
| string            | exact string, or null only when nullable   |
| number            | finite number, or null only when nullable  |
| integer           | finite integer, or null only when nullable |
| boolean           | boolean, or null only when nullable        |

Enum membership, fixed value, format, pattern, length, range and other
assertions are validator-owned and do not restrict a basically compatible
literal.

### 4.6 Normalized fields and templates

`BaseFieldDefinition` adds copied optional normalized members:

```ts
readonly visibleWhen?: FieldValueConditionDefinition;
readonly enabledWhen?: FieldValueConditionDefinition;
```

Each accepted condition, `sourcePath` and containing compiler-produced field is
deeply frozen. The compiler creates new objects/arrays and retains no raw UI
condition or path.

`FieldTemplate` explicitly omits both members when deriving its three
primitive variants:

```ts
keyof BaseNodeDefinition | 'visibleWhen' | 'enabledWhen'
```

Templates expose neither member in declarations. A manual template owning one
is invalid rather than evaluated.

## 5. Compiler condition phase

### 5.1 Ordering and atomicity

Accepted schema and ordinary UI processing remains unchanged. The compiler
captures detached condition shape/provenance during UI traversal, then runs one
condition phase only after every existing non-condition schema/UI diagnostic.

Condition records replay in completed ordinary `definition.fields` order, with
`visibleWhen` before `enabledWhen` for each field. The phase performs:

1. detached exterior/member/path/literal shape validation;
2. safely known target-location and fixed-capability validation;
3. exact source-path linking against the complete ordinary field index; and
4. source literal-compatibility validation.

Steps 3–4 run only when schema processing produced one complete valid ordinary
field index. Target-location/capability validation runs only when accepted
schema processing safely established that target's kind and capabilities. A
blocking schema defect suppresses target/source/literal diagnostics derived
from the unavailable target definition, but not independently safe raw
condition-shape diagnostics. This prevents cascades while keeping hostile
authored UI observable.

All independently safe condition defects are collected in the phase order.
Any condition error makes compile `success: false` with no definition. Warnings
alone do not. No partial predicate or field definition survives failure.

### 5.2 Condition diagnostic envelope

Every blocking condition defect has:

```ts
{
  code: 'INVALID_UI_FIELD_CONDITION',
  severity: 'error',
  source: 'ui-schema',
  dataPath?: DataPath,
  documentPath: DocumentPath,
  parameters: Readonly<Record<string, unknown>>,
  fallbackMessage: 'Field condition is invalid.',
}
```

Every parameters object starts with:

```ts
{
  field: string;
  member: 'visibleWhen' | 'enabledWhen';
  reason:
    | 'condition-not-object'
    | 'condition-member-missing'
    | 'condition-member-accessor'
    | 'condition-member-invalid'
    | 'unsupported-target-location'
    | 'incompatible-target'
    | 'source-not-ordinary-field'
    | 'literal-incompatible';
}
```

`field` is the target's local authored name when safely known, otherwise its
exact document member string. Reason-specific additions are closed below.

Reason-specific additions are the following closed shapes:

```ts
type ConditionDiagnosticDetails =
  | {
      reason: 'condition-not-object';
      expected: 'condition object';
      actualType?: string;
    }
  | {
      reason: 'condition-member-missing';
      conditionMember: 'path' | 'equals';
      expected: string;
    }
  | {
      reason: 'condition-member-accessor';
      conditionMember: 'condition' | 'path' | 'equals';
      expected: string;
      pathIndex?: number;
    }
  | {
      reason: 'condition-member-invalid';
      conditionMember: 'path' | 'equals';
      expected: string;
      actualType?: string;
      actualLength?: number;
      pathIndex?: number;
      pathKey?: string;
    }
  | {
      reason: 'unsupported-target-location';
      targetKind:
        | 'object'
        | 'array'
        | 'item'
        | 'template-object'
        | 'template-field'
        | 'identity'
        | 'presentation';
    }
  | {
      reason: 'incompatible-target';
      targetCapability: 'fixed-value';
    }
  | {
      reason: 'source-not-ordinary-field';
      sourcePath: readonly string[];
      sourceReason: 'unmanaged' | 'object' | 'array' | 'below-collection';
    }
  | {
      reason: 'literal-incompatible';
      sourcePath: readonly string[];
      sourceKind: 'string' | 'number' | 'integer' | 'boolean';
      sourceNullable: boolean;
      expected:
        | 'string'
        | 'finite number'
        | 'finite integer'
        | 'boolean'
        | 'string or null'
        | 'finite number or null'
        | 'finite integer or null'
        | 'boolean or null';
      actualType: string;
    };
```

`<primitive> or null` is materialized as the exact `string or null`,
`finite number or null`, `finite integer or null` or `boolean or null` value.

`expected` is exact by location:

- condition/member exterior: `condition object`;
- path exterior/empty/extra key: `non-empty dense string path`;
- path index: `string path segment`;
- literal exterior: `string, finite number, boolean or null`; and
- linked literal: the exact source-kind value from the table above.

`actualType` uses the Accepted safe vocabulary. Missing/sparse cases omit it;
accessor uses only the accessor reason. An empty path reports
`actualType: 'array'`, `actualLength: 0`. An extra enumerable path key reports
`actualType: 'array'` and copied `pathKey`. No invalid literal/value itself is
retained.

### 5.3 Paths and provenance

For an ordinary target, `dataPath` is the exact copied target path.
`documentPath` points to:

- the target condition member for exterior/location/capability errors;
- `...,'path'` or `...,'equals'` for those members;
- `...,'path',index` for indexed path defects; or
- `...,'path',pathKey` for an extra path key.

For a target under a collection template, `dataPath` is the owning collection
path and `parameters.templatePath` is the exact frozen relative target path in
addition to the reason-specific parameters. An item-root target uses
`templatePath: []`. Identity and presentation locations use their Accepted UI
document paths and safe owning data path when one exists.

`sourcePath`, `templatePath`, document/data paths and parameter containers are
detached and frozen. No reference chain is needed for conditions because their
source path resolves the final ordinary definition; existing schema/reference
diagnostics retain their own provenance before the condition phase.

### 5.4 Unknown condition members

An unknown enumerable own key on an otherwise ordinary condition object emits
existing `UNKNOWN_UI_SCHEMA_KEY`, warning severity/source/fallback, at that key
path with parameters `{ key }`. Its position is after `path` and `equals` for
that condition. It does not invalidate the predicate or suppress later safe
condition/field diagnostics.

## 6. Manual `FormDefinition` validation

### 6.1 Two phases

Runtime creation and `applyFormOperation()` first complete every Accepted base
definition check and detach any own condition members without executing
accessors. Only if the complete ordinary field tree/projection is structurally
valid do they link conditions in `definition.fields` order and member order
`visibleWhen`, `enabledWhen`.

An optional ordinary condition must be an own data ordinary non-array object
with own data `sourcePath` and `equals`; `sourcePath` follows the raw path
density/string rules and is copied. The source must be the exact ordinary field
indexed by the same definition and the literal must be compatible.
`enabledWhen` plus valid own `fixedValue` is incompatible.

Any own `visibleWhen` or `enabledWhen` on a `FieldTemplate`, including an
accessor, is invalid. Inherited template members remain absent. Validation
never evaluates a condition or controlled value.

### 6.2 Definition defect details

`applyFormOperation()` keeps `INVALID_FORM_DEFINITION`, source `runtime`,
fallback `Form definition is invalid.` and the operation target `dataPath`.
Condition defects add one of these `reason` values:

```ts
| 'invalid-field-condition'
| 'unsupported-field-condition-location'
| 'field-condition-target-incompatible'
| 'field-condition-source-not-managed'
| 'field-condition-literal-incompatible'
```

Every ordinary-field defect includes copied `nodeIndexPath`, `path` and
`conditionMember: 'visibleWhen' | 'enabledWhen'`. Template-location defects
instead include copied `templateIndexPath`, `relativePath` and the same
condition member. The reason-specific additions are closed as follows:

```ts
type DefinitionConditionDetails =
  | {
      reason: 'invalid-field-condition';
      conditionReason:
        'not-object' | 'member-missing' | 'member-accessor' | 'member-invalid';
      member?: 'sourcePath' | 'equals';
      expected?:
        | 'condition object'
        | 'non-empty dense string path'
        | 'string path segment'
        | 'string, finite number, boolean or null';
      actualType?: string;
      actualLength?: number;
      index?: number;
      pathKey?: string;
    }
  | {
      reason: 'unsupported-field-condition-location';
      location: 'template-field';
    }
  | {
      reason: 'field-condition-target-incompatible';
      targetCapability: 'fixed-value';
    }
  | {
      reason: 'field-condition-source-not-managed';
      sourcePath: readonly string[];
      sourceReason: 'unmanaged' | 'object' | 'array' | 'below-collection';
    }
  | {
      reason: 'field-condition-literal-incompatible';
      sourcePath: readonly string[];
      sourceKind: 'string' | 'number' | 'integer' | 'boolean';
      sourceNullable: boolean;
      expected:
        | 'string'
        | 'finite number'
        | 'finite integer'
        | 'boolean'
        | 'string or null'
        | 'finite number or null'
        | 'finite integer or null'
        | 'boolean or null';
      actualType: string;
    };
```

Runtime creation wraps the same first deterministic defect in
`INVALID_RUNTIME_OPTIONS` with existing `member: 'definition'`, exact
`expected: 'valid collection FormDefinition'`, `reason: 'invalid-value'`,
`actualType: 'object'` and the exact namespaced equivalent:

```ts
{
  definitionReason: <one of the five reasons above>;
  definitionConditionMember: 'visibleWhen' | 'enabledWhen';
  definitionConditionReason?:
    | 'not-object'
    | 'member-missing'
    | 'member-accessor'
    | 'member-invalid';
  definitionConditionDetailMember?: 'sourcePath' | 'equals';
  definitionConditionExpected?:
    | 'condition object'
    | 'non-empty dense string path'
    | 'string path segment'
    | 'string, finite number, boolean or null';
  definitionConditionActualType?: string;
  definitionConditionActualLength?: number;
  definitionConditionIndex?: number;
  definitionConditionPathKey?: string;
  definitionSourcePath?: readonly string[];
  definitionSourceReason?:
    | 'unmanaged'
    | 'object'
    | 'array'
    | 'below-collection';
  definitionSourceKind?: 'string' | 'number' | 'integer' | 'boolean';
  definitionSourceNullable?: boolean;
  definitionExpected?:
    | 'string'
    | 'finite number'
    | 'finite integer'
    | 'boolean'
    | 'string or null'
    | 'finite number or null'
    | 'finite integer or null'
    | 'boolean or null';
  definitionActualType?: string;
  definitionTargetCapability?: 'fixed-value';
  definitionLocation?: 'template-field';
}
```

The wrapper also carries the same unprefixed locator family as the underlying
definition defect: `nodeIndexPath` plus `path` for an ordinary field, or
`templateIndexPath` plus `relativePath` for a template field. Only members
applicable to the selected defect are present; the five `definitionReason`
variants map one-to-one to the five direct shapes above, with `definition`
prefixes on their reason-specific members except locators. Every value/path is
safe, copied and frozen. The first base-definition defect still precedes the
condition phase; condition defects follow ordinary field projection order and
member order. No validator, operation traversal, runtime listener or target
code runs after a definition error.

## 7. Runtime predicate evaluation

### 7.1 Exact match

For each normalized condition runtime reads the source's current ordinary
`FieldPresence` and computes:

```ts
presence.kind === 'value' && Object.is(presence.value, condition.equals);
```

Missing, `missing-ancestor` and `incompatible-ancestor` are false. Present
null/false/zero/empty string/`-0` retain exact `Object.is` semantics. Present
assertion-invalid values remain controlled data; a basically compatible value
may match without runtime revalidating enum/const/format/range/pattern.

The source's visible/enabled/valid/dirty/touched/focused/issues/showIssues state
never participates. Self and mutual references therefore have no evaluation
cycle.

### 7.2 Schedule

Runtime evaluates conditions:

1. once after definition plus initial external managed-data validation and
   before publishing the initial snapshot; and
2. once per accepted `updateExternalState()` whose `value` reference changes.

It does not evaluate for the same value reference, baseline-only/locale-only
updates, validation visibility, sync/async completion, scope/touched/focus
actions or presentation state. The accepted immutable external-state
discipline remains required.

The scan follows `definition.fields` order and is synchronous, deterministic
and callback-free. It emits no operation/diagnostic and cannot fail after a
valid definition/data tree. Validator invocation count, schema identity and
sync/async lifecycle remain unchanged.

### 7.3 Required snapshot members

Every `FieldRuntimeSnapshot` adds:

```ts
readonly visible: boolean;
readonly enabled: boolean;
```

For an ordinary field:

- missing `visibleWhen` means `visible: true`;
- otherwise `visible` equals that predicate match;
- missing `enabledWhen` means `enabled: true`;
- otherwise `enabled` equals that predicate match; and
- a fixed field always has `enabled: true` because valid definitions cannot
  contain its enabled predicate.

Every concrete collection item field exposes exact constants
`visible: true, enabled: true`. No object/array/item/form snapshot gains a
condition member.

Snapshot/root arrays/diagnostics remain frozen. If value identity changes but
presence, issues, interaction and both booleans remain equal, an existing field
snapshot may retain identity. A changed flag rebuilds that field and only the
existing ancestor/root containers necessary for identity consistency.
Unrelated branches retain references.

### 7.4 Focus reconciliation

If a value update changes the currently focused ordinary field so either new
flag is false, runtime clears focus in that same atomic update, does not add
touched and preserves prior touched. The emitted snapshot already contains
`focused: false` and the new flags. No operation or separate focus action is
emitted.

A later true transition does not restore focus. A condition change on an
unfocused field changes no interaction state. Baseline/locale/validation-only
updates do not perform this reconciliation.

## 8. Runtime action boundary

The direct ordinary-field methods `requestSetValue`, `requestRemoveValue`,
`focus` and `blur` retain their Accepted validation order through:

1. disposed state;
2. target/path/managed-field validation;
3. set-value basic compatibility where applicable; and
4. incompatible-ancestor blocking.

They then apply, before remove/set no-effect, interaction mutation or operation
construction:

1. false `visible` -> `hidden` failure;
2. otherwise false `enabled` -> `disabled` failure; or
3. existing behavior.

Failure returns:

```ts
{
  success: false,
  effects: { snapshotChanged: false, operationEmitted: false },
  diagnostics: [{
    code: 'INACTIVE_RUNTIME_FIELD',
    severity: 'error',
    source: 'runtime',
    dataPath: targetField.path,
    parameters: {
      action:
        | 'requestSetValue'
        | 'requestRemoveValue'
        | 'focus'
        | 'blur',
      reason: 'hidden' | 'disabled',
    },
    fallbackMessage:
      'Runtime action is blocked by conditional field state.',
  }],
}
```

The result, array, diagnostic, path and parameters are frozen and retain no
condition, source path/value or caller target. There is no `documentPath`.
Hidden precedes disabled when both flags are false.

Set-null, clear and renderer edits already route through direct runtime
methods. They add no action or diagnostic. Item-relative value/focus methods
remain unchanged because item flags are constant true.

## 9. Unchanged domain, validation and layout behavior

Conditional state never changes:

- `value`, `baselineValue`, presence, operation expectation or controlled
  confirmation/rejection;
- dirty, scope-to-baseline candidates or schema-default candidates;
- original schema supplied to synchronous/asynchronous validation;
- valid, issues, global issues, issue assignment, showIssues or forced scopes;
- required, constraints, enum, const, format or nullable semantics;
- scope paths/validity, show/hide errors or touched reset;
- presentation forest membership/keys, exact-once claims, tabs/accordion/grid
  state, layout labels or text resolution; or
- runtime subscriptions, async generations, operation IDs or disposal.

A hidden required field may stay invalid and retain `showIssues: true` in its
snapshot. Targets hide its projection but core does not hide truth. A static
container whose children are hidden may remain visibly empty and retains its
selection/expansion state.

## 10. Angular projection contract

### 10.1 Mounted visibility

The Internal field/node outlet owns a stable host around the selected renderer.
It creates the renderer once under the existing lifecycle, keeps it mounted
while hidden, and removes the complete host from visual display, sequential
focus and accessibility tree when `snapshot.visible === false`.

A false/true transition reuses the exact renderer/component, field definition,
private Signal Forms buffer object, text projection and owning host. Existing
confirmed-value reconciliation remains authoritative while hidden and may
reset incomplete or rejected local buffer content exactly as it does while
visible; M30 preserves buffer identity, not an unconfirmed value. The
transition neither re-runs ADR-007 selection nor emits an operation. Confirmed
value, locale, texts, validation and issues continue reconciling while hidden.
Destroying the accepted owner destroys the renderer exactly once.

The target may use `hidden`, `inert` or equivalent Internal markup. No DOM
member becomes core/Public contract. A hidden focused field has already been
reconciled by runtime; target does not restore or transfer focus.

### 10.2 Enabled state

Every native editable renderer disables its bound control plus clear/set-null
and other field actions when `snapshot.enabled === false`. Pointer and keyboard
cannot emit value/remove/focus/blur. Visible supporting text/issues remain
perceivable under target-idiomatic disabled semantics.

`AngularFieldRenderer.snapshot` exposes the required flags transitively. A
custom renderer must honor enabled for accessible behavior; core's action gate
still rejects a stale/nonconforming output. Fixed presentation always receives
enabled true.

Renderer registration IDs, testers, ranks, priority/order, definition-only
selection, provider APIs and component exports remain unchanged.

## 11. Standard projection and shared evidence

The private Standard app consumes normalized definitions and snapshots directly
from core. It independently retains/hides/disables DOM hosts, buffers and event
routes without importing Angular components, Signals, target helpers, CSS or
condition evaluator implementation.

One shared authored `conditional-field-state` scenario contains:

- a direct boolean or enum-string source;
- one direct/nested editable target with `visibleWhen`;
- another target with `enabledWhen`;
- nullable-null comparison plus strict false, zero and empty-string evidence
  across type-compatible ordinary sources;
- a source that becomes hidden while its raw controlled value still drives a
  target;
- a focused target that becomes inactive and clears focus without touched;
- retained renderer/host/buffer identity across false/true projection while
  existing confirmed-value buffer reconciliation remains unchanged;
- an optional hidden target with a validator issue proving validity is
  unchanged; and
- operation history showing accepted active edits and zero inactive
  operations.

Angular and Standard consume the exact same schema, UI Schema, value and
scenario transitions. Each independently proves initial/default flags,
false/true transitions, mounted identity, focus, stale-action rejection,
accessibility, validation/dirty/scope invariance and teardown. Behavioral
parity does not require pixel equality or shared target implementation.

## 12. Public/Internal and package inventory

| Classification         | Exact effect                                                                                                                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `UiFieldValueConditionSchema`, `FieldValueConditionDefinition`.                                                                                                                                                                               |
| Changed Public core    | `FieldUiSchema`, `BaseFieldDefinition`, `FieldTemplate` omission, required `FieldRuntimeSnapshot.visible/enabled`, compiler/manual-definition contracts and two diagnostic codes/behaviors.                                                   |
| Changed Public Angular | Transitive renderer snapshot flags and required native/custom projection behavior; no new symbol.                                                                                                                                             |
| Internal core          | Detached condition phase, ordinary field linking, linear evaluation, focus reconciliation and action gate.                                                                                                                                    |
| Internal Angular       | Stable hidden host and native disabled wiring.                                                                                                                                                                                                |
| Private Standard/apps  | Independent DOM behavior and shared scenario.                                                                                                                                                                                                 |
| Unchanged              | Operation types, runtime method signatures, validators, scopes, presentation SPI, renderer selection, collection addresses/operations, package names/entry points/export maps/dependencies/versions, published artifacts and stability tiers. |

Both new types are exported only from the existing core package root. No deep
import becomes supported. All affected APIs remain Public + Experimental +
Active.

A future approved implementation plan must verify declarations and exact root
exports, package smoke, clean core/Angular consumers, isolated source
reconstruction and zero dependency/manifest/lock/export-map drift. A later
delivery uses an ADR-010-compatible coordinated MINOR and migration notes; this
SPEC does not select or authorize a version or release.

## 13. Conformance matrix

A future plan must map fixtures/tests for at least these 24 rows:

1. exact two root exports and optional raw/normalized declaration members;
2. absent/inherited/non-enumerable/data/accessor condition members;
3. condition exterior null/array/primitive/function/class/accessor forms;
4. path missing/accessor/non-array/empty/sparse/non-enumerable/accessor/
   non-string/extra-key cases and hostile exact segment names;
5. equals missing/accessor plus every compatible literal and invalid safe type;
6. target direct/nested/reference/composition paths and member ordering;
7. object/array/item/template/identity/presentation target rejection;
8. fixed target visibility success and enabled incompatibility;
9. source self/forward/back/mutual/direct/nested/ref/composed success;
10. source unmanaged/object/array/below-collection failures;
11. source kind/nullability compatibility, `-0`, enum/const/format/assertion
    non-participation;
12. schema-blocked stopping, condition phase order, unknown members and atomic
    no-definition behavior;
13. normalized copy/freeze/no-retention and exact `FieldTemplate` omission;
14. every manual definition reason, ordinary/template locator, two-phase
    precedence and validator/operation non-invocation;
15. initial and immutable external-value update evaluation with missing,
    blocked, null, false, zero and empty string;
16. same-reference/baseline/locale/visibility/touched/scope/async non-
    evaluation and absence of callbacks/graph;
17. required ordinary/fixed/item snapshot flags and structural sharing;
18. focused target false transition, touched preservation and no focus restore;
19. direct set/remove/focus/blur active success plus hidden/disabled exact
    diagnostic precedence/no-effect ordering;
20. unchanged operations, values, baseline, dirty, scopes, sync/async
    validation, issues and static presentation state;
21. Angular native/custom mounted hidden lifecycle, disabled accessibility,
    stale output defense, buffers and no renderer reselection;
22. Standard independent equivalent DOM/lifecycle/event behavior;
23. shared scenario parity, exact authored inputs, focus/validation/operation
    evidence and accessible Chromium lanes; and
24. declarations, exact exports, package/clean/source consumers, dependency
    invariance, docs and diff hygiene.

## 14. Acceptance criteria

SPEC-016 may be accepted only when:

1. every rule is consistent with ADR-033 and all Accepted baselines;
2. only review 279's ordinary primitive equality slice is active;
3. raw grammar, descriptor safety, target/source paths and literals are exact;
4. normalization, template omission, immutability and manual validation are
   declaration-ready;
5. compiler/runtime diagnostics, parameters, paths, order and stopping are
   closed and atomic;
6. controlled evaluation, missing/blocked/null semantics and no-graph boundary
   are deterministic;
7. required snapshot flags, sharing, focus and action safety are complete;
8. validation, dirty, baseline, issues, scopes and static layout remain exact;
9. Angular/Standard mounted/accessibility behavior and shared evidence are
   independently testable;
10. collection behavior is unchanged beyond constant item snapshot flags;
11. Public/Internal/package migration and ADR-010 future delivery are complete;
12. all wider D-018 and unrelated Deferred boundaries remain inactive;
13. no plan/code/delivery change precedes acceptance; and
14. every correction restarts the complete review until one pass has zero
    findings and no documentation conflict.

Acceptance authorized only PLAN-032 preparation and complete review. Approved
PLAN-032 revision 1 now authorizes its checkpoints 1–7 in order. No dependency,
version, release, publication, Git or external action is implied.

## 15. History

| Version | Date       | Change                                                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 0.1.1   | 03-08-2026 | Resolve C-002: sparse/non-enumerable path indices omit `actualType`; review 283 cycle 1 passes with zero findings. |
| 0.1.0   | 03-08-2026 | Accepted after review 281 cycle 3 passed all seventeen areas and 24 rows with zero findings.                       |
