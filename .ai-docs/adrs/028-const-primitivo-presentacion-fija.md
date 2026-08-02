# ADR 028: Primitive const normalization and fixed presentation

- **State:** Accepted revision 0
- **Date:** 1 August 2026
- **Acceptance date:** 1 August 2026
- **Milestone:** M25 — Primitive `const` and fixed presentation
- **Promotes:** only the bounded D-036 slice accepted by
  [`review 218`](../reviews/218-d036-m25-const-promotion-readiness.md)
- **Coordinates:** ADR-005 revision 6, ADR-007, ADR-009 and ADR-022 revision 3
- **Complete review:** [`review 219`](../reviews/219-adr-028-review.md) cycle 2
  passed all fourteen areas with zero findings
- **Authority:** Accepted M25 architecture; authorizes SPEC-011 preparation and
  review, not implementation, release, publication, commit or push

## 1. Context

Schema Engine currently rejects JSON Schema `const`, even though the official
replaceable Ajv validator already understands it. Consumers need to show fixed
discriminators and other primitive values that remain part of application-
owned controlled data but offer no editing intention in a given form.

JSON Schema assertion does not itself define hidden, readonly, disabled or
static UI. The architecture must select one narrow portable presentation while
preserving the existing separation between schema, controlled state,
validation and target renderers.

## 2. Decision

### 2.1 Neutral fixed-value contract

Every existing primitive field definition and field template may carry one
optional Public + Experimental + Active member:

```ts
export type PrimitiveFixedValue = string | number | boolean | null;

export interface BaseFieldDefinition extends BaseNodeDefinition {
  readonly nullable: boolean;
  readonly fixedValue?: PrimitiveFixedValue;
}
```

The final placement/name and declaration details are normative only after
SPEC-011 acceptance. Absence means ordinary editable presentation. An own data
member represents the exact compiled `const`, including `null`, `false`, `0`
and the empty string. It is copied without coercion, trimming, Unicode
normalization or default insertion and is deeply immutable with its owner.

`fixedValue` propagates through direct leaves, nested leaves, collection item
templates and supported local-reference targets. It introduces no entry point,
package, operation, state mode or Stable API.

### 2.2 Compiler classification

`const` is supported only on existing primitive leaf schemas:

- strings require an exact string;
- numbers require a finite number;
- integers require a finite integer;
- booleans require an exact boolean; and
- `null` is accepted only by the existing nullable primitive type array.

An accessor, incompatible primitive, non-finite number, object, array or other
value is a blocking schema-keyword-value error. Root, object, array and
identity positions retain the existing unsupported-keyword behavior. `const`
never infers a type.

Inspection is descriptor-safe and does not mutate or retain mutable schema
containers. Reference provenance and diagnostic paths follow the existing
recursive/local-reference contracts.

When a supported string `enum` coexists, the exact string `const` must occur in
that enum. Otherwise compilation fails as an incompatible supported-keyword
combination. This is a deliberately bounded structural coherence rule because
both closed value sets are already normalized by the compiler. M25 does not
generalize into static evaluation of `pattern`, lengths, numeric constraints or
semantic formats; those assertions remain the validator's responsibility.

### 2.3 Controlled runtime and operations

The application remains the only source of truth for `value` and
`baselineValue`. Compiler/runtime/renderers never insert `fixedValue`, repair a
missing value or replace a contradictory external value.

Runtime snapshots continue to expose actual controlled presence/value.
Operations retain only primitive/null compatibility and do not enforce
`fixedValue`. Programmatic calls and later external updates may therefore
contradict the schema; the replaceable validator reports the ordinary `const`
issue and the form remains controlled.

Manual definitions validate an own `fixedValue` only on primitive definitions
and templates, using the same kind/nullability compatibility. The exact runtime
diagnostic boundary belongs to SPEC-011. Existing tolerance for unrelated
extra members on untyped non-field objects is not silently tightened.

### 2.4 Fixed renderer semantics

Angular adds a dedicated native fixed renderer selected from normalized
definition metadata. Standard implements the same observable semantics
independently. The built-in fixed registration has a higher rank than the
existing string-enum and generic primitive registrations; ADR-007 priority and
registration-order rules continue to permit explicit consumer overrides.

The fixed renderer:

1. displays the actual controlled snapshot presence/value;
2. never substitutes `fixedValue` for missing or contradictory data;
3. exposes label, description, hint, tooltip and visible issues accessibly;
4. emits no set, remove, null, focus or blur intention;
5. does not synthesize touched state; and
6. follows the existing issue-visibility policy, including application-forced
   `all` or scope visibility.

It is static presentation, not a disabled or readonly native input. SPEC-011
will fix exact value text, localization context, DOM semantics and missing/null/
incompatible fallbacks before implementation.

### 2.5 Official validation

The existing Ajv factory already asserts Draft 2020-12 `const`; M25 adds no
dependency, plugin, keyword, factory option, cache rule or Public validator
surface. Existing immutable issue normalization produces `code`/`keyword`
`const`, the canonical instance path and detached parameters.

The supported flow still requires compiler success before runtime creation.
Ajv does not widen the compiler subset and core does not become a validator.

## 3. Consequences

Consumers gain a portable fixed-value form concept without losing controlled
state or coupling core to DOM/framework behavior. Contradictory external data
remains observable rather than being hidden or silently corrected. One
specialized renderer/export and one optional neutral member enlarge the
Experimental surface and therefore require declarations, package smoke and
consumer-facing conformance.

Fixed fields do not become touched through user interaction because they have
no interaction. Applications that need to expose their invalid state use the
existing `all`/scope visibility mechanisms; M25 adds no submit-attempted policy.

## 4. Rejected alternatives

- **Editable control:** invites operations known to violate the assertion.
- **Readonly input:** is not uniform across text, select and checkbox controls.
- **Disabled input:** conflates domain-fixed presentation with temporary
  unavailability and carries target-specific form semantics.
- **Hidden field:** visibility is presentation policy and would hide actual
  state/issues.
- **Insert the schema value:** violates application ownership and overlaps
  deferred D-039 defaults.
- **UI Schema mode matrix:** fixed/readonly/hidden variants lack a demonstrated
  first-increment case.
- **Runtime/operation enforcement:** duplicates replaceable validation and
  would turn a schema assertion into mutation rejection.
- **Static evaluation of every coexisting constraint:** expands core toward a
  validator; only the explicitly accepted closed `const`/string-`enum`
  contradiction is rejected.

## 5. Deferred boundary

Object/array/root `const`, default application, readonly/writeOnly policy,
hidden fields, permissions, conditional presentation, composition, dynamic
definitions, localized domain formatting, new error-visibility policies,
framework validation bridges, release/version/publication and Stable promotion
remain Deferred.

## 6. Follow-up gate

SPEC-011 must define the exact Public contract, compiler diagnostics/order,
manual-definition validation, fixed-value text and accessibility, renderer
rank/export, Ajv issue evidence and cross-target scenarios. A completely
reviewed plan is required before implementation.
