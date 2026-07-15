# ADR 019: Nullable primitive leaves and explicit null intention

- **State:** Accepted revision 0
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Milestone:** M14
- **Promotes:** the exact D-009 slice accepted in
  [`review 031`](../reviews/031-m14-nullable-leaves-promotion-readiness.md)
- **Coordinated with:**
  [`ADR-005 revision 4`](./005-politica-dialecto-json-schema.md)
- **Related:** [`ADR-007`](./007-resolucion-renderers-testers.md),
  [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-010`](./010-versionado-semver-compatibilidad.md),
  [`ADR-012`](./012-limpieza-explicita-campos.md),
  [`SPEC-001`](../specs/001-controlled-form-runtime.md)
- **Joint review:**
  [`review 032`](../reviews/032-adr-019-adr-005-revision-4-review.md) cycle 2
  closed with zero findings
- **Authority:** Accepted for M14 normative design; it authorizes only separate
  SPEC-006 preparation, not a plan, implementation, package version,
  publication or Stable API change

## 1. Context

The accepted runtime distinguishes a missing property from every present value,
uses strict operations and retains application ownership of `value` and
`baselineValue`. Its Public operation and presence shapes can already carry
`null`, but primitive definitions and compatibility checks do not declare null
as managed. Native Angular controls consequently project null as an empty or
unchecked incompatible value and provide no explicit null intention.

Review 031 promotes only JSON Schema primitive leaves whose type set contains
one currently supported primitive plus `null`. General unions, nullable
containers and automatic null/default behavior remain deferred.

## 2. Decision

### 2.1 Exact schema boundary

A nullable managed leaf declares a `type` array containing exactly two members:

1. exactly one of `string`, `number`, `integer` or `boolean`; and
2. exactly one `null`;

in either order. This form is supported in every existing primitive-leaf
position: direct or nested object properties, collection item-template
descendants and leaves reached through accepted local `$ref` resolution.

The following remain unsupported:

- standalone `type: "null"`;
- more than one non-null type or any other general union;
- nullable root, object, array, collection item root or identity property;
- `enum` combined with a nullable type array, including string enums;
- `const`, applicators, conditionals and discriminator behavior; and
- coercion, empty-to-null conversion, initialization or applied defaults.

The accepted `default` keyword remains inert metadata. This ADR neither checks
its value against the type array nor applies or copies it.

### 2.2 Normalized Public contract

`BaseFieldDefinition` gains one required Public + Experimental + Active member:

```ts
export interface BaseFieldDefinition extends BaseNodeDefinition {
  readonly nullable: boolean;
  readonly placeholder?: string;
}
```

Every `StringFieldDefinition`, `NumberFieldDefinition`,
`BooleanFieldDefinition` and corresponding `FieldTemplate` therefore contains
an own readonly-contract `nullable` boolean:

- `true` only for the exact type-array form in section 2.1;
- `false` for every existing scalar primitive declaration.

The property is required rather than optional so a normalized definition has
one canonical shape and every renderer/tester must make a conscious decision.
Object, array, item and presentation definitions do not gain this member.

Compiler-produced definitions copy no caller array and expose only the
primitive kind plus `nullable`, then freeze it under the accepted definition
rules. Manual Public definitions must provide an own data property whose value
is boolean; they are not required to arrive frozen. A missing, inherited,
accessor or
non-boolean member makes the definition structurally invalid under the existing
`INVALID_FORM_DEFINITION` code. Its parameters use
`reason: 'invalid-field-nullable'`, `member: 'nullable'`, the existing
`nodeIndexPath` + `path` or `templateIndexPath` + `relativePath` locator, and
the safe `actualType`. Missing, inherited and accessor members use respectively
`actualType: 'missing'`, `'missing'` and `'accessor'` without reading consumer
code.

A manual string field/template cannot combine `nullable: true` with a non-empty
`choices` array because `enum + null` is outside M14. It fails with
`INVALID_FORM_DEFINITION`, `reason: 'incompatible-field-capabilities'`,
`members: ['nullable', 'choices']` and the same exact field/template locator.
Both new reasons join the closed Public definition-diagnostic vocabulary; the
Internal validator gains only the locator/member metadata needed for them.

This is an intentional source-incompatible change to Public + Experimental
definitions and templates. Repository consumers migrate by adding
`nullable: false` to existing manual primitives and `true` only to the promoted
form. Under ADR-010 it requires at least an independent MINOR release of each
affected package, never a PATCH, with a coordinated compatible core range and
migration notes. This ADR does not select or authorize those versions. No
export, entry point or stability classification changes.

### 2.3 Presence, operations and runtime

Null is a present controlled domain value:

```text
missing              -> FieldPresence { kind: 'missing' }
present null         -> FieldPresence { kind: 'value', value: null }
present primitive    -> FieldPresence { kind: 'value', value: primitive }
```

No operation or snapshot union changes. The schema-agnostic
`applyOperation()` remains purely structural and continues accepting any
`unknown`, including null, because it receives no definition. Definition-aware
behavior is exact:

- `applyFormOperation()` validates `set-value`/`set-item-value` with
  `value: null` as compatible only when the targeted normalized primitive has
  `nullable: true`;
- the same operation against `nullable: false` fails with the existing
  `INCOMPATIBLE_OPERATION_VALUE` and does not change data;
- `remove-value`/`remove-item-value` remains the only transition to missing;
- expectations continue matching present null through `Object.is`;
- runtime request methods may emit null only for a nullable target and keep the
  current strict/stale/no-op behavior; and
- confirmation, rejection, snapshots, subscriptions, scopes, structural
  sharing, touched and focus retain their accepted controlled semantics.

An externally supplied null remains present even on a non-nullable field. Core
does not repair, remove or coerce it. The distinction is that it is structurally
compatible for a nullable field and incompatible for a non-nullable field.
Dirty comparison remains `Object.is` over managed leaves, so missing, null,
false, zero and empty string stay distinct.

`required` remains an assertion delegated to the external `SchemaValidator`.
A required nullable property can validly be present as null; removing it may
produce a validator issue but is not blocked by core. The validator continues
receiving the exact original schema and authoritative full value.

### 2.4 Angular null intention

Every existing native primitive renderer consumes `field.nullable` directly.
It adds one common explicit user action with neutral source text `Set null`:

- it is rendered for a nullable field whose confirmed presence is not already
  `{ kind: 'value', value: null }`, except when presence is blocked by an
  `incompatible-ancestor`;
- it is a native `button` with `type="button"` and an accessible name composed
  from its resolved action text and the field label;
- activation synchronously calls `focusBoundControl()` and then emits exactly
  one existing `setValue` output with `null`;
- inability to move focus does not suppress the intention; and
- render, reconciliation, locale/text changes, reset, blur and destruction
  never emit the intention.

The accepted nested behavior remains exact: `missing-ancestor` is an editable,
materializable empty projection, so its null action may emit and materialize the
ancestor chain; `incompatible-ancestor` suppresses the action and every other
mutation/interaction intention.

When confirmed presence is null, the action is replaced by non-live perceptible
status text with neutral source `Null value`. Its deterministic ID participates
in the control's `aria-describedby`; it is not a disabled fake action and does
not announce during ordinary reconciliation. The normal clear action remains
visible because null is present, and still emits `removeValue` to request
missing. Thus null, missing and false remain both behaviorally and accessibly
distinct for the checkbox renderer.

String and number Signal Forms buffers continue using `''` and boolean uses
`false` as local projections when confirmed null; those buffers are not domain
state and never emit during reconciliation. The explicit status and available
clear action communicate the confirmed null state.

The common Public text contracts expand to:

```ts
export type FieldTextMember =
  | /* existing members */
  | 'set-null'
  | 'null-value';

export interface AngularFieldTextSnapshot {
  // existing members
  readonly setNullLabel: string;
  readonly nullValueLabel: string;
}
```

`AngularTextProjector` resolves `Set null` and `Null value` with their exact
members. Exception, non-string or blank results fall back to the neutral source
and emit one existing `TEXT_RESOLUTION_FAILED` diagnostic with the exact member
and existing reason vocabulary. `emptyTextSnapshot()` supplies both fallbacks.

The Internal `FieldIds` shape adds deterministic `setNull` and `nullValue`
members using suffixes `-set-null` and `-null-value`. Root, nested, referenced
and collection-item instances retain their accepted collision-free base ID
rules.

No UI Schema option, Angular output, component, provider, dependency or export
is added. Custom renderers are not required to expose the native affordance,
but their Public tester/input definition always exposes `nullable` so a
consumer can implement an equivalent experience.

### 2.5 Renderer resolution

ADR-007 remains unchanged. Nullable is orthogonal to primitive kind, so native
registration IDs, order, ranks, priorities and tester predicates remain exact:

- `native-string` rank 10;
- `native-number` rank 10; and
- `native-boolean` rank 10.

The string-enum registration remains rank 20 but cannot receive a compiler
produced nullable field because `enum + null` is outside the promoted slice.
Existing and custom testers may inspect `field.nullable`; selection never
depends on current null/missing/value state. No nullable-specific registration
or dynamic re-resolution is introduced.

### 2.6 Propagation and immutability

The compiler sets the same required boolean for direct, nested, referenced and
template primitive leaves. Local reference normalization derives the value at
each use site without exposing a resolved graph. Collection runtime field
indexes retain `nullable` for item-relative operation compatibility.

Definitions, templates, snapshots, operations, text snapshots, diagnostics and
their arrays/paths remain copied and frozen under existing rules. The source
type array, schema objects and consumer text results are never retained.

## 3. Diagnostics and deterministic inspection

ADR-005 revision 4 owns schema inspection order. ADR-019 fixes the observable
effects:

- malformed or unsupported `type` arrays use `UNSUPPORTED_FIELD_TYPE` at the
  exact `type` or member path and block only that branch;
- `enum` on an otherwise valid nullable string leaf uses
  `INCOMPATIBLE_SCHEMA_KEYWORD` at `enum`;
- incompatible null operations reuse `INCOMPATIBLE_OPERATION_VALUE` with the
  existing field/path envelope and `actualType: 'null'`;
- invalid manual `nullable` members reuse `INVALID_FORM_DEFINITION`; and
- text resolution reuses `TEXT_RESOLUTION_FAILED`.

No new diagnostic code is introduced. SPEC-006 must reproduce exact envelopes,
ordering, branch stopping and conformance examples before implementation.

## 4. Public/Internal inventory

| Classification               | Effect                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public signatures    | Required `BaseFieldDefinition.nullable`; transitively all primitive definitions/templates; two `FieldTextMember` values; two required `AngularFieldTextSnapshot` strings. |
| Changed Public behavior      | Compiler accepts the exact nullable type array; operations/runtime accept null only for nullable managed leaves; native renderers expose explicit null intention/status.  |
| Changed diagnostic semantics | `INVALID_FORM_DEFINITION` adds two reasons; existing schema, operation and text codes gain only the exact cases defined here and in ADR-005 revision 4.                   |
| Unchanged Public shapes      | Operations, expectations, presence/snapshots, renderer registrations, outputs, providers, packages and entry points.                                                      |
| Internal                     | Type-array inspector, managed-field nullable metadata, two IDs and native projection helpers.                                                                             |
| Stability                    | All affected APIs remain Public + Experimental + Active; none becomes Stable or Deprecated.                                                                               |

## 5. Consequences

Positive consequences:

- null becomes a first-class controlled value without a second ownership mode
  or optimistic state;
- all normalized primitives have one explicit capability shape;
- Angular exposes distinct accessible intentions for null and missing; and
- renderer specialization remains stable and value-independent.

Costs and risks:

- every manual primitive definition and text snapshot consumer must migrate;
- native renderers add another visible action/status surface;
- the limited type-array parser needs hostile-object conformance coverage; and
- published Experimental packages will require a later versioned release to
  deliver the source-incompatible declaration change.

## 6. Alternatives rejected

### Optional `nullable?: true`

Rejected because omission would create two normalized shapes, allow manual
definitions to bypass an explicit capability decision and complicate
descriptor-safe validation.

### A new null operation or presence variant

Rejected because existing `set-value`, expectations and present-value presence
already carry null without ambiguity.

### Tri-state native checkbox or per-kind null controls

Rejected because a common explicit action preserves the familiar primitive
control, applies uniformly to all native kinds and keeps clear/missing separate.

### Nullable-specific renderer registrations

Rejected because nullable does not change primitive kind and renderer selection
must not depend on current value state. Existing scored testers remain capable
of consumer specialization.

### Empty input means null

Rejected because it conflates user editing buffers with domain state and would
conflict with existing string-empty and number-clear semantics.

## 7. Required normative follow-up

This ADR was accepted coordinately with ADR-005 revision 4 after joint review
032 cycle 2 closed with zero findings. That acceptance authorizes drafting
SPEC-006 only. SPEC-006 must close compiler fixtures, manual-definition
validation, operations/runtime cases, Angular behavior/accessibility/text/IDs,
declaration migration and conformance evidence.

PLAN-014 and implementation remain unauthorized until SPEC-006 is separately
accepted and a plan is approved. Publication, Stable promotion and every other
deferred capability remain outside M14.
