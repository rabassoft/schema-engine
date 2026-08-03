# ADR 033: Controlled conditional primitive-field state

- **Status:** Accepted
- **Date:** 3 August 2026
- **Acceptance date:** 3 August 2026
- **Revision:** 0
- **Milestone:** M30 — Controlled conditional field state
- **Promotes:** only the D-018 boundary selected by
  [review 279](../reviews/279-d018-m30-conditional-field-state-promotion-readiness.md)
  cycle 2
- **Requires:** Accepted ADR-009, ADR-010, ADR-014, ADR-015, ADR-019,
  ADR-023 and ADR-025; Accepted SPEC-001, SPEC-002, SPEC-003, SPEC-006,
  SPEC-008 and SPEC-009
- **Complete review:** [review 280](../reviews/280-adr-033-review.md) cycle 2
  passed all twelve areas with zero findings after three corrections
- **Acceptance effect:** authorizes only SPEC-016 preparation and complete
  review; no plan, implementation, dependency, version, release, Git or
  external action

## 1. Context

Schema Engine already compiles static ordinary and collection forms, derives
neutral controlled snapshots and independently projects them in Angular and
Standard. Every field is currently visible and interactive unless structural
presence makes its branch incompatible or a fixed renderer deliberately emits
no editing intention.

Ricard selected a bounded D-018 increment after M29: one ordinary primitive
field may become visible or enabled according to the controlled value of one
other ordinary primitive field. Review 279 proves that this slice needs neither
an arbitrary expression language nor a dependency graph because predicates
read only immutable external value and cannot depend on each other or write
state.

The decision must preserve the application's ownership of `value` and
`baselineValue`, full-schema validation, static presentation containers,
collection stable identity and renderer neutrality. It must also make stale
target instances unable to bypass hidden or disabled state.

## 2. Decision summary

M30 adds two optional UI Schema members to ordinary primitive fields:
`visibleWhen` and `enabledWhen`. Each is one equality predicate containing an
absolute ordinary primitive-field path and one primitive/nullable literal.

The compiler copies valid predicates into immutable normalized field
definitions. Runtime evaluates them against the current controlled `value` on
initialization and accepted external value-reference changes. Every public
field snapshot exposes required `visible` and `enabled` booleans. Fields without
the corresponding predicate, including every collection item field, use
`true`.

Hidden and disabled state changes no domain value, baseline, dirty calculation,
validation, issue, scope or presentation-container state. Core rejects
interaction against a hidden or disabled ordinary field. Angular and Standard
keep the field host mounted, independently project hidden/disabled semantics
and reconcile confirmed state normally.

## 3. Raw UI Schema contract

### 3.1 Public authoring shape

Core adds two Public + Experimental + Active contracts:

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

`FieldUiSchema` widens exactly:

```ts
export interface FieldUiSchema {
  // Existing members remain unchanged.
  readonly visibleWhen?: UiFieldValueConditionSchema;
  readonly enabledWhen?: UiFieldValueConditionSchema;
}
```

The raw and normalized interfaces are distinct so no definition retains the
authored condition object or path array. No operator, callback, expression
string, identifier, dependency list or options bag is admitted.

### 3.2 Exact raw predicate grammar

A condition is an ordinary non-array object with own enumerable data members
`path` and `equals`:

- `path` is a dense non-empty array of own enumerable string data properties;
- string segments are retained exactly, including empty strings, punctuation,
  whitespace, Unicode and lone surrogates;
- `equals` is exactly a string, finite number, boolean or null;
- `NaN`, infinities, bigint, symbol, undefined, objects, arrays, functions and
  accessors are invalid literals;
- inherited members are absent; accessors are never executed;
- enumerable keys other than `path` and `equals` use the existing unknown UI
  member warning policy and do not change predicate meaning; and
- the source path is absolute from the controlled data root, never relative to
  the target field or a presentation owner.

The compiler inspects `visibleWhen` before `enabledWhen`. Both are optional;
absence or inheritance means no predicate and therefore the default true state.

### 3.3 Eligible target and source

The target must be an ordinary primitive `FieldDefinition`, direct or below
ordinary nested objects and optionally reached through accepted local
references/static object composition. It may be nullable, formatted, fixed or
ordinary editable. Its absolute path contains only strings.

`visibleWhen` is meaningful for either an editable or fixed primitive field.
`enabledWhen` is valid only for a field without normalized `fixedValue`; a
fixed-presentation renderer has no editing intention to enable or disable, so
accepting that member would create target-specific styling rather than neutral
interaction semantics.

The source path must resolve exactly to another or the same ordinary primitive
`FieldDefinition` in the completed normalized definition. Object paths, array
paths, collection templates, concrete item addresses, unmanaged paths and
presentation identities are invalid sources. Self references and mutual
source/target references are allowed because predicates read raw controlled
values rather than one another's derived state.

A condition authored on an object, array, item root, identity property,
collection `FieldTemplate` or presentation entry is an unsupported target
location. The compiler never copies it into those definitions.

### 3.4 Literal compatibility

The equality literal must be compatible with the source field's normalized
primitive kind:

- string accepts a string;
- number accepts any finite number;
- integer accepts a finite integer;
- boolean accepts a boolean; and
- any of those accepts null only when `source.nullable === true`.

Enum membership, fixed `const`, pattern, range and other assertions do not
participate. A type-compatible literal outside an assertion remains legal so
the condition observes invalid controlled business data truthfully while the
external validator retains assertion authority.

## 4. Normalized definition

`BaseFieldDefinition` widens with copied optional members:

```ts
export interface BaseFieldDefinition extends BaseNodeDefinition {
  // Existing members remain unchanged.
  readonly visibleWhen?: FieldValueConditionDefinition;
  readonly enabledWhen?: FieldValueConditionDefinition;
}
```

Each normalized predicate contains a new frozen `sourcePath` array and the
exact primitive literal. The compiler retains neither authored object nor path
identity. The predicate object, path and owning field remain deeply frozen.

Because `FieldTemplate` is structurally derived from primitive field
definitions today, its Public alias must explicitly omit the two ordinary-only
condition members in addition to `BaseNodeDefinition` members:

```ts
export type FieldTemplate =
  | (Omit<
      StringFieldDefinition,
      keyof BaseNodeDefinition | 'visibleWhen' | 'enabledWhen'
    > &
      BaseNodeTemplate)
  | (Omit<
      NumberFieldDefinition,
      keyof BaseNodeDefinition | 'visibleWhen' | 'enabledWhen'
    > &
      BaseNodeTemplate)
  | (Omit<
      BooleanFieldDefinition,
      keyof BaseNodeDefinition | 'visibleWhen' | 'enabledWhen'
    > &
      BaseNodeTemplate);
```

No object, array, template, item or presentation definition gains a condition
member.

## 5. Compiler pipeline and diagnostics

### 5.1 Two-phase condition handling

The compiler first completes accepted schema resolution/composition and
ordinary UI normalization without condition semantics. During descriptor-safe
UI traversal it captures detached condition candidates and structural defects.
After every existing non-condition schema/UI diagnostic, a condition phase
replays targets in normalized depth-first ordinary field order, with
`visibleWhen` before `enabledWhen` at each target.

That phase validates raw shape, target eligibility, exact source resolution and
literal compatibility. This permits forward references without a Public graph
and keeps condition ordering independent of object identity or source order.
Any condition error makes compilation fail atomically with no partial
definition. Safe independent conditions continue so all deterministic defects
are collected.

A malformed condition exterior on a schema-blocked or unsupported target is
still independently diagnosable. Semantic source/type checks occur only when
both target and detached raw predicate are structurally safe.
Source linking and literal compatibility run only after schema processing has
produced one complete valid ordinary-field index. If an unrelated blocking
schema defect prevents that index, the compiler retains independently safe raw
condition-shape diagnostics but suppresses derived source/compatibility
diagnostics that would merely cascade from the missing definition.

### 5.2 New diagnostic family

Every blocking condition defect uses:

```text
code: INVALID_UI_FIELD_CONDITION
severity: error
source: ui-schema
fallbackMessage: Field condition is invalid.
```

Its exact closed reasons are:

| Reason                        | Meaning                                                            |
| ----------------------------- | ------------------------------------------------------------------ |
| `condition-not-object`        | Condition exterior is null, array or non-object.                   |
| `condition-member-missing`    | Own `path` or `equals` data member is absent.                      |
| `condition-member-accessor`   | Condition, path or indexed member is an accessor.                  |
| `condition-member-invalid`    | Path exterior, segment or literal has an invalid safe value.       |
| `unsupported-target-location` | The condition is not authored on an ordinary primitive field.      |
| `incompatible-target`         | `enabledWhen` is authored on a fixed-presentation primitive field. |
| `source-not-ordinary-field`   | The exact path is unmanaged, object, array or collection/template. |
| `literal-incompatible`        | The literal does not match source primitive kind/nullability.      |

The diagnostic has target `dataPath` whenever one exists and the exact
condition/member/index `documentPath`. Template targets retain the accepted
collection `dataPath` plus frozen `parameters.templatePath`. Semantic source
failures copy `sourcePath`; literal failures additionally expose safe
`sourceKind`, `sourceNullable` and literal `actualType`. No diagnostic retains
a raw object, array, descriptor or controlled value.

`incompatible-target` exposes `member: 'enabledWhen'` and
`targetCapability: 'fixed-value'` without retaining the fixed value.

Exact expectations are `condition object`, `non-empty dense string path`,
`string path segment`, and `string, finite number, boolean or null`. Missing,
accessor and sparse cases omit unsafe actual values. Other values use the
accepted closed safe actual-type vocabulary.

Unknown enumerable condition-object members use existing
`UNKNOWN_UI_SCHEMA_KEY` warning semantics after `path` and `equals`; they do
not add a condition reason or invalidate an otherwise valid predicate.
SPEC-016 must close the exact parameter unions and path examples without adding
another condition diagnostic code or reason.

### 5.3 Manual definition validation

Runtime creation and `applyFormOperation()` use two deterministic phases. They
first validate the complete existing definition plus the detached shape of
optional ordinary `visibleWhen` and then `enabledWhen` members after every
existing field-shape member. Only after every ordinary field is structurally
valid do they link conditions in field order against the complete exact field
index and check target capability/source/literal compatibility. A malformed
later source therefore cannot produce an earlier cascading link diagnosis.

They require own data predicate members, exact `sourcePath`, compatible literal
and a source that is the exact ordinary field object indexed by the same
definition. Caller definitions need not be frozen; accessors are never run.

An own condition member on `FieldTemplate` is rejected rather than evaluated.
The accepted `INVALID_RUNTIME_OPTIONS` and `INVALID_FORM_DEFINITION` envelopes
gain only these detailed reasons:

- `invalid-field-condition`;
- `unsupported-field-condition-location`;
- `field-condition-target-incompatible`;
- `field-condition-source-not-managed`; and
- `field-condition-literal-incompatible`.

The later SPEC must map exact direct/template locators, members, source paths,
precedence and immutable parameters. A definition defect prevents validator,
operation or target invocation under the existing atomic boundary.

## 6. Runtime evaluation

### 6.1 Predicate semantics

For a structurally accessible source field, runtime reads its existing
`FieldPresence`:

```ts
match =
  presence.kind === 'value' && Object.is(presence.value, condition.equals);
```

`missing`, `missing-ancestor` and `incompatible-ancestor` never match. An
externally present value of an assertion-incompatible but basic-compatible type
may match; runtime does not duplicate validator assertions. A source field's
own visibility, enabled, touched, focus, issues or validity never participates.

`visible` is the visibility predicate match or `true` when absent. `enabled` is
the enabled predicate match or `true` when absent. They remain independent: a
hidden field may have `enabled === true`, but hidden action precedence still
makes it non-interactive.

### 6.2 Evaluation schedule

Runtime evaluates all ordinary field predicates in definition field order:

1. after manual definition and initial external managed-data validation;
2. on every accepted `updateExternalState()` call whose `value` reference
   changes; and
3. never for baseline-only, locale-only, validation-visibility, touched, focus,
   scope or presentation-state changes.

Evaluation is a pure linear scan over the accepted immutable external value.
It invokes no callback, emits no operation and cannot throw an expected
configuration error after runtime creation. The validator still runs exactly
once according to its accepted lifecycle; condition evaluation neither invokes
nor skips it.

Reference-identity update semantics remain exact. Mutating the same external
value object in place is unsupported and does not require condition
recomputation.

### 6.3 Snapshot contract and structural sharing

`FieldRuntimeSnapshot` adds two required Public + Experimental + Active
members:

```ts
export interface FieldRuntimeSnapshot {
  // Existing members remain unchanged.
  readonly visible: boolean;
  readonly enabled: boolean;
}
```

Every ordinary field exposes its evaluated state. Every fixed field necessarily
has `enabled === true`; it may still derive `visible`. Every field without a
predicate and every concrete collection-item field exposes exact constant
`true` values. No object, array, item or form snapshot gains another condition
member; their existing aggregate identity changes only when a changed child
snapshot already requires rebuilding that branch.

If a value-reference update changes neither a field's observable presence,
issues, interaction nor its two booleans, that field snapshot can retain
identity. A changed condition result rebuilds only its field snapshot and
necessary existing ancestor/root arrays; unrelated branches retain accepted
structural sharing. No dependency graph or cache becomes Public or Internal
contract.

### 6.4 Focus reconciliation

When an accepted value update changes the focused field from visible/enabled to
hidden or disabled, runtime clears focus atomically without setting touched.
Existing touched state is preserved. A later true transition never restores
focus automatically. Condition changes on any other field do not alter focus.

This reconciliation occurs in the same external update as the new snapshot and
emits no operation. Baseline/locale-only updates do not perform it.

## 7. Runtime action gate

After all accepted disposed, argument, path, managed-field, value-compatibility
and incompatible-ancestor checks, but before no-effect handling, interaction
mutation or operation construction, ordinary field actions inspect the current
conditional state:

1. `visible === false` rejects with reason `hidden`;
2. otherwise `enabled === false` rejects with reason `disabled`; and
3. otherwise existing behavior continues unchanged.

The gate applies to `requestSetValue`, `requestRemoveValue`, `focus` and `blur`.
Native set-null/clear/edit intentions route through those methods and gain no
separate rule. Collection item request methods are unchanged because item
fields are always visible and enabled in M30.

Rejection returns the existing failed `RuntimeActionResult`, changes no
snapshot, interaction or operation channel, and emits exactly one immutable
diagnostic:

```text
code: INACTIVE_RUNTIME_FIELD
severity: error
source: runtime
dataPath: exact target field path
parameters: { action, reason: 'hidden' | 'disabled' }
fallbackMessage: Runtime action is blocked by conditional field state.
```

`action` is exactly `requestSetValue`, `requestRemoveValue`, `focus` or `blur`.
There is no `documentPath` and no predicate/source/value is retained. Hidden
precedes disabled when both are false. Existing invalid path/value/ancestor
diagnostics retain precedence and shapes.

## 8. Validation, dirty, scopes and presentation

Conditional state does not alter:

- controlled `value` or `baselineValue`;
- property presence, required semantics or operation expectations;
- dirty calculation or baseline confirmation;
- schema passed to synchronous/asynchronous validators;
- validity, issue assignment, `showIssues` or global issues;
- scope membership, scope validity, forced visibility or touched reset;
- presentation forest membership, exact-once identity, container selection or
  tabs/accordion state; or
- defaults, fixed values, semantic formats or text resolution.

A hidden required field may therefore remain invalid and its snapshot may
retain issues/showIssues even though the target does not project it. M30 does
not filter issues, rewrite schema, change `required` or synthesize a scope.
Reference evidence must use an optional conditional target or explicitly show
this invariant rather than imply conditional validation.

Presentation containers remain mounted and static. Hiding their only field may
leave a visible empty section, panel or grid cell; M30 does not conditionally
remove, relabel or reselect the container.

## 9. Angular and Standard projection

### 9.1 Shared semantic requirements

Both maintained targets independently implement:

- mounted field hosts across false/true transitions;
- hidden fields absent from display, sequential focus and accessibility tree;
- disabled editable fields visible with target-idiomatic disabled semantics;
- no value/remove/null/focus/blur target emission while inactive;
- confirmed external snapshot and locale reconciliation while inactive;
- no automatic focus transfer or restoration; and
- exact-once normal destruction only when the owning accepted host is
  destroyed.

Hidden takes visual/interactivity precedence over disabled. Returning true
reuses the same renderer/DOM host and its private edit buffer. The target may
use DOM `hidden`, `inert`, disabled fieldset/control semantics or equivalent
Internal mechanisms; none enters core or Public API.

### 9.2 Angular boundary

`AngularFieldRenderer.snapshot` widens transitively through the two required
snapshot booleans. Native renderers must disable their control and actions when
`enabled` is false. Custom renderers are required to respect the flag for an
accessible experience; core remains the final safety gate if they do not.

The Internal node/field outlet owns mounted hidden projection so a custom
renderer cannot make a hidden field visible through ordinary component markup.
Renderer tester selection still depends only on immutable field definition,
never current predicate result, and a state transition never re-resolves or
recreates the renderer. Signal Forms remain private buffers and do not evaluate
conditions.

### 9.3 Standard boundary

The private Standard renderer consumes core definition/snapshot state directly
and implements the same lifecycle/accessibility contract without importing
Angular target helpers, components, Signals, CSS or condition evaluator code.
Parity is semantic, not pixel equality or shared target implementation.

### 9.4 Shared reference scenario

One neutral authored scenario must contain at least:

- a boolean or enum-like ordinary source;
- one field controlled by `visibleWhen`;
- one independently controlled by `enabledWhen`;
- direct and nested source/target paths, nullable strict comparison and a
  source that is itself inactive without affecting raw-value evaluation;
- false/true transitions, retained edit buffers, focus reconciliation and
  blocked stale intentions; and
- unchanged value, dirty, validation, issues, operation history and static
  presentation ownership.

Angular and Standard consume the exact same authored schema/UI/value inputs and
prove behavior independently.

## 10. Collections and later dependency semantics

`FieldTemplate` cannot author or normalize predicates. Concrete item field
snapshots carry only `visible: true` and `enabled: true`; stable movement,
addresses, item focus, operations, layout state and renderer routing remain
byte-for-byte semantic equivalents of SPEC-003/009.

A later collection-condition design must choose item-relative/root-relative
sources, stable identity, cross-item references and movement/insertion
recomputation before widening this boundary. It cannot infer those semantics
from M30's absolute ordinary paths.

Likewise, a later compound/expression design must separately choose operators,
boolean composition, coercion, language/sandbox, dependency discovery,
incremental graph updates and cycles. M30's permitted mutual references do not
constitute or constrain such a graph because they read only external values.

## 11. Public/Internal migration inventory

| Classification         | Exact effect                                                                                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `UiFieldValueConditionSchema` and `FieldValueConditionDefinition`.                                                                                                                                                                                  |
| Changed Public core    | Optional `FieldUiSchema.visibleWhen/enabledWhen`; optional `BaseFieldDefinition.visibleWhen/enabledWhen`; `FieldTemplate` explicitly omits them; required `FieldRuntimeSnapshot.visible/enabled`; compiler/manual-definition/action diagnostics.    |
| Changed Public Angular | `AngularFieldRenderer.snapshot` and every native/custom renderer transitively receive required visible/enabled flags; native/field outlet behavior changes without a new symbol.                                                                    |
| Internal core          | Detached condition candidates, field-path linking, linear evaluator, focus reconciliation and action gate.                                                                                                                                          |
| Internal Angular       | Mounted hidden wrapper/state projection and native disabled wiring.                                                                                                                                                                                 |
| Private Standard/apps  | Independent mounted hidden/disabled projection and one shared authored scenario/evidence.                                                                                                                                                           |
| Unchanged              | Operations, expectations, values, baselines, validators, scopes, presentation definitions/SPI, renderer testers/selection, collection addresses/operations, package entry points, dependencies, versions, exports, publication and stability tiers. |

Every affected export remains Public + Experimental + Active. No raw evaluator,
callback, graph, target state, DOM type or framework primitive is Public.

The feature and required snapshot shape require at least a coordinated future
MINOR under ADR-010 with declaration, migration, package, clean-consumer and
source-reconstruction evidence. This ADR selects no version and authorizes no
manifest, lockfile, peer, package, release or publication change.

## 12. Consequences

### Positive

- Forms gain useful dynamic behavior while remaining controlled and
  framework-neutral.
- One literal predicate is serializable, deterministic and descriptor-safe.
- Core and both targets share semantics without sharing renderer
  implementation.
- Mounted hosts preserve target buffers and avoid renderer selection churn.
- The narrow contract leaves a clean extension point for later evidence-driven
  compound or item-relative conditions.

### Costs and risks

- Public Experimental UI, definition and snapshot contracts widen.
- Hidden fields can remain invalid, which consumers must understand.
- Every value-reference update performs a linear condition scan.
- Custom Angular renderers must consume a new disabled-state responsibility.
- Collection snapshots carry constant members before collection predicates are
  supported.

## 13. Alternatives rejected

### Arbitrary expression strings or JavaScript callbacks

Rejected because they require language, sandbox, coercion, security,
dependency and failure contracts and would weaken deterministic metadata.

### General predicate AST with AND/OR/NOT

Rejected because a larger recursive Public grammar is unnecessary to prove the
first consumer behavior. It remains wider D-018.

### Derive conditions in Angular/Standard

Rejected because targets would duplicate domain semantics and could disagree
on missing paths, null, numbers, focus and action gating.

### Destroy and recreate hidden renderers

Rejected because it loses private buffers/lifecycle identity and conflicts with
the accepted mounted hidden-container precedent.

### Disable validation for hidden fields

Rejected because external full-schema validation is authoritative and UI
metadata cannot rewrite JSON Schema assertions silently.

### Add item-template relative paths now

Rejected because item identity, cross-item/root addressing and movement require
a separate architecture decision.

### Build an incremental dependency graph

Rejected because equality predicates read the same external value, never read
derived condition state and cannot create an evaluation cycle. A graph adds no
observable correctness to M30.

## 14. Explicit exclusions

ADR-033 does not activate:

- comparison operators beyond strict equality, boolean composition, arbitrary
  expressions, callbacks, plugins, scripts or a dependency graph;
- dynamic required/readonly, computed values, conditional defaults,
  initialization, coercion, clearing or generated operations;
- object, array, collection-template/item, presentation-container, scope,
  action or issue conditions;
- conditional validation, hidden-issue filtering, schema rewriting,
  persistence, submit, workflow, wizards or declarative scopes;
- definition replacement, React, Vue, legacy Angular, another renderer kit,
  SSR, hydration, portals or adapter capabilities;
- a new package, entry point, dependency, version, release, publication,
  Stable promotion, commit, push or external-system action; or
- SPEC-016, a plan or implementation before each later gate completes.

## 15. Required review and follow-up gate

Complete review must restart after every correction and verify at least:

1. exact M30 promotion authority and every exclusion;
2. raw grammar, descriptor safety, literal compatibility and path identity;
3. normalized copying, immutability, template omission and manual definitions;
4. compiler phases, diagnostics, precedence, paths and atomicity;
5. controlled evaluation, missing/blocked/null semantics and no graph;
6. required snapshot defaults, sharing and focus reconciliation;
7. hidden/disabled action precedence and exact failure envelope;
8. unchanged validation, issues, dirty, baseline, scopes and layout;
9. mounted/accessibility behavior and independent Angular/Standard evidence;
10. collection snapshot-only migration and unchanged item behavior;
11. complete ADR-009 inventory and ADR-010 delivery treatment; and
12. documentation, links, format, diff and delivery-gate consistency.

Only a complete zero-finding review and Ricard's accepted no-scope-expansion
rule may move revision 0 to Accepted. Acceptance would authorize only drafting
and completely reviewing SPEC-016. It would not authorize a plan,
implementation, dependency, version, release, Git or external action.
