# SPEC-011: Primitive Const and Fixed Presentation

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 1 August 2026
- **Acceptance date:** 1 August 2026
- **Milestone:** M25 — Primitive `const` and fixed presentation
- **Promoted capability:** only the bounded D-036 slice accepted by
  [`review 218`](../reviews/218-d036-m25-const-promotion-readiness.md)
- **Accepted architecture:** ADR-028 revision 0, coordinated with ADR-005
  revision 6, ADR-007, ADR-009 and ADR-022 revision 3
- **Accepted baselines:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003 v0.1.2,
  SPEC-004 v0.1.1, SPEC-006 v0.1.1, SPEC-007 v0.1.0 and SPEC-010 v0.1.0
- **Complete review:** [`review 220`](../reviews/220-spec-011-review.md) cycle 4
  passed all seventeen areas and accepted-state reconciliation with zero
  findings
- **Authority:** Accepted observable M25 extension; it authorizes PLAN-027
  preparation/review only, not plan approval, implementation, dependency,
  version, release, publication, commit or push

## 1. Scope and authority

This specification defines only the primitive `const` normalization, official
assertion and static fixed presentation accepted by ADR-028. It replaces the
older `const`-unsupported clauses only at existing primitive leaf positions.

Every unchanged compiler, controlled-state, operation, validation, renderer,
package, stability and Deferred rule remains authoritative. In particular, the
application remains the sole source of truth for `value` and `baselineValue`.

## 2. Public neutral contract

Core adds one Public + Experimental + Active type and one optional member:

```ts
export type PrimitiveFixedValue = string | number | boolean | null;

export interface BaseFieldDefinition extends BaseNodeDefinition {
  readonly nullable: boolean;
  readonly placeholder?: string;
  readonly fixedValue?: PrimitiveFixedValue;
}
```

`PrimitiveFixedValue` is exported from the existing core root entry point.
Every primitive `FieldDefinition` and `FieldTemplate` carries the optional
member transitively. Object, array, item, identity and presentation-container
definitions do not gain it. No operation, snapshot, runtime method, package or
entry point changes.

Absence means ordinary editable presentation. A compiled `const` produces one
own enumerable data member even when its value is `null`, `false`, `0`, `-0`
or `""`. The exact value is copied without coercion, trimming, Unicode
normalization or default application and is deeply frozen with the definition.

## 3. Compilation

### 3.1 Supported positions and values

An own `const` is supported at every existing primitive leaf position:

- direct root property;
- nested object property;
- editable collection-item-template descendant; and
- any such position reached through an accepted local `$ref`.

The accepted value depends on the normalized field kind:

| Field form         | Accepted own data value                 | Closed `expected` text               |
| ------------------ | --------------------------------------- | ------------------------------------ |
| scalar string      | string                                  | `string`                             |
| scalar number      | finite number                           | `finite number`                      |
| scalar integer     | finite integer                          | `finite integer`                     |
| scalar boolean     | boolean                                 | `boolean`                            |
| nullable primitive | `null` or the corresponding value above | `compatible primitive value or null` |

`const` never infers `type`. Root, object, array, item-root and collection
identity positions retain `UNSUPPORTED_SCHEMA_KEYWORD`. A reference object
retains its closed sibling policy; `const` must occur on the resolved target,
not beside `$ref`.

### 3.2 Descriptor-safe classification and diagnostics

The compiler reads only the own descriptor. An absent or inherited member is
absent. An accessor, incompatible primitive, non-finite number, non-integer for
an integer field, object, array, function, symbol, bigint or `undefined`
produces exactly one blocking diagnostic:

```ts
{
  code: 'INVALID_SCHEMA_KEYWORD_VALUE',
  severity: 'error',
  source: 'schema',
  dataPath: leafDataPath,
  documentPath: [...leafSchemaPath, 'const'],
  parameters: {
    keyword: 'const',
    expected,
    ...safeActual,
  },
  fallbackMessage: 'Schema keyword "const" has an invalid value.',
}
```

`expected` is the exact table value. `safeActual` uses the accepted closed safe
description vocabulary and never retains or coerces the caller value. The
member is copied only after successful classification. Schema objects,
descriptors and mutable containers are never retained or mutated.

Collection-template diagnostics retain the accepted collection `dataPath` and
frozen `parameters.templatePath`. Referenced-target diagnostics retain target
`documentPath`, use-site `dataPath` and outermost-to-innermost frozen
`parameters.referenceChain`.

### 3.3 Closed `const`/string-`enum` coherence

For a scalar string leaf where both keywords are individually valid, the exact
`const` must equal one normalized choice value. `Object.is` is sufficient for
strings. Otherwise compilation adds:

```ts
{
  code: 'INCOMPATIBLE_SCHEMA_KEYWORD',
  severity: 'error',
  source: 'schema',
  dataPath: leafDataPath,
  documentPath: [...leafSchemaPath, 'const'],
  parameters: {
    keyword: 'const',
    fieldType: 'string',
    reason: 'value-not-in-enum',
  },
  fallbackMessage: 'Schema keyword "const" is incompatible with field type "string".',
}
```

The coherence diagnostic is emitted only after both keywords have valid
exteriors and members. An invalid `const` or invalid `enum` keeps its own
diagnostics and suppresses this derived diagnostic. Nullable string `enum`
remains independently unsupported by SPEC-006, so this rule never enables it.

The compiler does not evaluate `const` against pattern, length, numeric,
semantic-format or other business assertions. `default` remains inert. Those
relationships belong to the replaceable validator.

### 3.4 Ordering and branch stopping

Type/shape failure retains its accepted precedence and stops type-dependent
keyword normalization. Otherwise independently malformed keyword diagnostics
follow existing schema-key traversal order. The derived coherence diagnostic
appears after all independently inspectable schema keywords for that leaf and
before UI Schema diagnostics. It does not suppress independent schema or UI
exterior-shape diagnostics. Any error prevents a partial definition.

## 4. Manual definitions and runtime boundary

Runtime creation and `applyFormOperation()` inspect an own `fixedValue` only on
primitive definitions/templates. Absence or inheritance means no fixed
capability. An accessor or data value incompatible with kind/nullability is a
definition defect. A scalar string definition with own choices additionally
requires its own fixed string to equal one choice value.

For `applyFormOperation()`, the first such defect uses existing
`INVALID_FORM_DEFINITION`, fallback `Form definition is invalid.`, the accepted
direct/template locator and either:

```ts
{
  reason: 'invalid-field-fixed-value',
  member: 'fixedValue',
  expected, // exact closed text from section 3.1
  ...safeActual,
  // accepted direct/template locator
}
```

or:

```ts
{
  reason: 'incompatible-field-capabilities',
  members: ['fixedValue', 'choices'],
  // accepted direct/template locator
}
```

For runtime creation, the same defect uses `INVALID_RUNTIME_OPTIONS`, no
diagnostic path, the accepted outer definition envelope and
`definitionReason: 'invalid-field-fixed-value' | 'incompatible-field-capabilities'`.
The first branch adds `definitionMember: 'fixedValue'` and
`definitionExpected` plus `definitionActualType`; safe primitive actual-value
metadata follows the existing detached definition-diagnostic convention. The
second adds the frozen exact
`definitionMembers: ['fixedValue', 'choices']`. Existing nullable/choices
defects retain their precedence. Within each primitive field, the existing base
shape, `nullable`, `format` and `choices` checks run before `fixedValue`; the
fixed/choices coherence check runs only after both members are individually
valid. Definition traversal and first-defect rules remain unchanged;
validation is not invoked after a definition defect.

Runtime snapshots always expose actual controlled presence/value. Runtime and
both operation helpers do not compare against, insert or enforce
`fixedValue`. Set/remove/null operations retain only existing primitive and
nullability compatibility. Programmatic intentions and external updates may
therefore contradict `const`; validation reports that state without repair.

## 5. Official validation

The existing `createAjvSchemaValidator()` export, fixed options, dependencies,
cache, lifecycle and issue mapping remain unchanged. Its Draft 2020-12 engine
already asserts compiler-accepted `const`.

For a mismatch, the ordinary immutable issue has exact `code` and `keyword`
`const`, the accepted canonical instance path, detached frozen Ajv parameters
including `allowedValue`, and Ajv's fallback message when present. The exact
schema and controlled value are not mutated. Compiler success remains required
before using the official integration; Ajv's broader vocabulary does not widen
M25.

## 6. Fixed presentation

### 6.1 Resolution and Public Angular surface

The Angular package adds Public + Experimental + Active
`SchemaFixedValueRendererComponent` from its existing root entry point. It is a
standalone `OnPush` component with selector `schema-fixed-value-renderer` and
implements the existing `AngularFieldRenderer` contract.

`provideSchemaEngineAngularNative()` prepends this immutable registration:

| ID             | Match                        | Rank | Priority |
| -------------- | ---------------------------- | ---- | -------- |
| `native-fixed` | own data `fixedValue` member | 30   | 0        |

The tester inspects only the own descriptor, returns `30` for a data member and
never reads an accessor. Runtime definition validation owns full value
compatibility. Existing enum rank 20 and primitive rank 10 registrations retain
their IDs, relative order and predicates. ADR-007 rank, priority and
registration-order rules continue to permit explicit consumer overrides.

Standard selects fixed presentation independently from the same normalized
own member and implements the same observable state/text/accessibility table;
it does not import Angular renderer code or create a shared DOM abstraction.

### 6.2 Exact displayed state

The fixed renderer never displays the schema `fixedValue` as a substitute for
controlled data. It derives visible content only from the current snapshot:

| Snapshot state                                   | Visible content                                                  |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| compatible non-empty string                      | exact string                                                     |
| compatible empty string                          | `""`                                                             |
| compatible finite number/integer                 | canonical `String(value)`, except negative zero is `-0`          |
| compatible boolean                               | exact token `true` or `false`                                    |
| compatible null                                  | resolved `Null value` text from the accepted `null-value` member |
| present value incompatible with kind/nullability | resolved `Incompatible value` text                               |
| missing                                          | resolved `Missing value` text                                    |
| blocked by either ancestor reason                | resolved `Unavailable value` text                                |

A same-kind value different from the schema `const` is still compatible for
this table and is displayed exactly; its `const` issue remains validator-owned.
The incompatible fallback never stringifies or introspects an object, array,
function, symbol, bigint, `undefined` or other hostile value.

String content is assigned through `textContent`, never parsed as HTML. The
value element preserves whitespace with `white-space: pre-wrap` and permits
safe wrapping with `overflow-wrap: anywhere`, so leading, trailing and repeated
spaces remain perceptible without widening the page.

Rendering, reconciliation, locale/text changes, issue visibility and lifecycle
emit no set, remove, null, focus or blur output and no renderer diagnostic. The
component contains no input, select, checkbox, button or tabindex and cannot
synthesize touched/focused state. It retains all required output members only
to satisfy the existing renderer interface and never emits from them.

### 6.3 Localization contract

`FieldTextMember` adds:

```ts
| 'fixed-missing'
| 'fixed-unavailable'
| 'fixed-incompatible'
```

`AngularFieldTextSnapshot` adds required non-blank strings:

```ts
readonly fixedMissingLabel: string;
readonly fixedUnavailableLabel: string;
readonly fixedIncompatibleLabel: string;
```

The neutral sources are exactly `Missing value`, `Unavailable value` and
`Incompatible value`. For a field with an own data `fixedValue`, projection
order places them after `null-value`, before choices and before issues. For a
field without that member, the snapshot carries the three neutral sources
without invoking `TextResolver`; therefore M1–M24 resolver calls and
diagnostics do not change. Existing projection identity remains field, form
ID, locale and issue-array identity.

Resolver exception, non-string or blank result falls back to the exact source
and emits one existing `TEXT_RESOLUTION_FAILED` with the accepted field path,
no `documentPath`, the corresponding member and existing reason vocabulary.
`emptyTextSnapshot()` contains all three neutral sources. The Standard
reference renderer owns a bounded private mapping for these three sources in
`en` and `es`, selects it from the runtime locale and falls back to `en` for
another locale. That private mapping is not a core/Angular `TextResolver`,
Public contract or general localization system.

### 6.4 DOM and accessibility

The Angular component and Standard binding expose one non-focusable
`role="group"` for the field. It has the deterministic existing field base ID,
`aria-labelledby` pointing to the visible field label and `aria-describedby`
ordered as description, hint and visible issues. It sets `aria-invalid="true"`
exactly when the field snapshot is invalid and omits that attribute otherwise.
It does not put `aria-required` on the non-input group or invent a required
control affordance; missing required data is communicated by the controlled
state label and, when visible under the existing policy, its validator issue.

The displayed value is a visible `span` with ID `${base}-fixed-value` and
`data-fixed-value-state` equal to `value`, `missing`, `unavailable` or
`incompatible`. Label, description, hint, accessible tooltip and visible issue
list retain existing native semantics. Issues appear only when
`snapshot.showIssues` is true; fixed presentation never changes that flag.
The value span is not an `aria-live` region. No hidden, readonly or disabled
form control is synthesized.

## 7. Shared reference evidence

One shared scenario must contain direct, nested, collection-template and local
reference fixed leaves, including string enum coexistence, nullable null and a
semantic string format. Angular and Standard use the same schema, UI Schema,
controlled values, application-control labels and explanation.

The scenario demonstrates at least:

1. matching controlled values rendered statically;
2. a same-kind mismatch displaying the actual value plus a visible Ajv
   `const` issue under application-forced visibility;
3. missing, null, empty string, false, zero and negative-zero distinctions;
4. incompatible and blocked-state fallbacks without source-value repair;
5. locale changes for the three new status labels and existing null label; and
6. edited-schema Apply/Cancel/Restore behavior in both shells.

Scenario controls may replace application-owned values to exercise states but
the fixed renderer itself exposes no mutation action. Existing catalog/source
authority and independent Angular/Standard rendering boundaries remain intact.

## 8. Required conformance

A future plan must map focused fixtures for:

1. every accepted primitive value, including `null`, `false`, `0`, `-0` and
   empty string;
2. accessor, incompatible, non-finite, non-integer and hostile `const` values;
3. root/object/array/item/identity/reference-sibling exclusions;
4. direct, nested, template and local-reference normalization/provenance;
5. valid and contradictory string `const`/`enum` combinations;
6. coexistence with nullable, constraints, formats, defaults and UI metadata;
7. exact diagnostic paths, parameters, ordering, branch stopping and
   immutability;
8. manual-definition acceptance and both exact defect envelopes;
9. unchanged runtime/operation compatibility and controlled-state ownership;
10. Ajv valid/mismatch `const` issues, cache and non-mutation;
11. root-only declarations and package-smoke imports for both new Public
    symbols;
12. Angular rank-30 selection, consumer override and unchanged lower ranks;
13. Standard independent selection and cross-target state-table parity;
14. exact value/status text, locale fallback and resolver diagnostics;
15. group naming/descriptions/issues, deterministic IDs and non-focusability;
16. zero renderer intentions across render/reconcile/locale/visibility/lifecycle;
17. shared scenario, schema editing and complete Chromium evidence; and
18. unchanged M1–M24 tests, package boundaries, builds and documentation.

## 9. Non-goals and next gate

Object/array/root `const`, value insertion/repair, defaults, readonly,
writeOnly, disabled or hidden fields, permissions, conditions, composition,
new visibility policy, localized domain-value formatting, custom fixed modes,
React/Vue adapters, release/version/publication and Stable promotion remain
outside M25.

SPEC-011 acceptance may authorize only preparation and complete review of a
PLAN-027 implementation contract. Implementation requires that plan to be
approved separately.
