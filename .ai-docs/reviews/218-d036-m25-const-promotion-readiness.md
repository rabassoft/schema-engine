# D-036/M25 primitive const promotion-readiness review — Cycle 1

- **Date:** 2026-07-31
- **Candidate:** D-036 — `const` and fixed-value presentation
- **Authority reviewed:** SPEC-001 v0.1.15, SPEC-007 v0.1.0, SPEC-010
  v0.1.0, ADR-005 revision 5, ADR-007, ADR-009, ADR-022 revision 2 and the
  Deferred register
- **Decision:** Ricard accepted both the dedicated fixed-presentation
  architecture and compile-time rejection of a known `const`/string-`enum`
  contradiction on 1 August 2026
- **Outcome:** D-036 is promoted only for the bounded primitive M25 slice and
  authorizes ADR-028 preparation/review

## 1. Consumer problem

Metadata-driven forms need to expose values that belong to the controlled
model but are not editable in a given form, such as an entity kind, immutable
identifier class or fixed discriminator. JSON Schema `const` already expresses
the assertion, but it does not by itself prescribe hidden, readonly, disabled
or static presentation.

The reference platform can demonstrate the requirement without adding
persistence, permissions, defaults, workflow or autonomous state.

## 2. Recommended bounded M25 slice

The proposed slice is limited to primitive leaves and templates already
supported by the compiler:

- string, number, integer and boolean `const` values;
- `null` only when the existing primitive nullable contract accepts it;
- direct, nested, collection-item-template and local-reference positions;
- a deeply immutable normalized fixed value on the existing Public +
  Experimental field contract;
- ordinary official Ajv `const` assertion and existing normalized issues; and
- independent Angular and Standard static fixed-value projection.

Root/object/array `const`, default insertion, coercion, permissions, hidden
fields, conditional presentation, composition and new operations remain
Deferred.

## 3. Recommended presentation decision

Select a dedicated neutral **fixed presentation** rather than an editable,
readonly or disabled native control:

1. the fixed renderer displays the actual controlled snapshot presence/value;
2. it never substitutes the schema `const` for missing or contradictory
   application data;
3. it emits no set, remove or null intentions;
4. validation remains responsible for reporting `required`, `type`, `const` or
   other schema violations;
5. mismatch issues remain visible under the existing visibility policy; and
6. fixed rendering outranks enum and ordinary primitive renderers because the
   field has no editable intention.

This preserves application ownership and avoids native inconsistencies:
`readonly` does not apply uniformly to checkbox/select, `disabled` carries
different interaction/form semantics, and `hidden` would erase observable
state and diagnostics.

## 4. Compiler and runtime boundary

The compiler must inspect `const` descriptor-safely. A primitive incompatible
with the declared type/nullability, an accessor or any non-primitive value is a
blocking schema-value diagnostic. Exact compatible values are copied without
coercion or normalization and frozen with the definition.

Core operations and runtime do not enforce or materialize the fixed value.
Programmatic/external application updates remain possible and are evaluated by
the replaceable validator. This matches the existing division between schema
assertion, controlled state and presentation.

`const` may coexist with supported string `enum` and semantic `format` only
when its primitive shape is compatible. The normative contract must decide
whether the compiler also rejects a `const` absent from `enum` as an
unsatisfiable supported combination or leaves that assertion to Ajv; the
recommendation is to reject it during compilation because both values are
already fully known and normalized.

## 5. Alternatives reviewed

- **Ordinary editable control:** rejected; it invites operations known to make
  the schema invalid.
- **Native readonly control:** rejected; it has no uniform primitive/select
  semantics.
- **Disabled control:** rejected; it conflates fixed domain presentation with
  temporary unavailability and weakens accessibility consistency.
- **Hidden by default:** rejected; visibility is UI policy, not JSON Schema
  assertion semantics.
- **Insert `const` into controlled data:** rejected; it would make core or the
  renderer a second source of truth and overlap D-039 defaults.
- **UI-Schema-selectable modes in M25:** deferred; adding fixed/readonly/hidden
  policy variants would enlarge the first slice without a demonstrated case.

## 6. Required gates and evidence

If the recommended decision is accepted:

1. ADR-028 must coordinate the neutral fixed-presentation decision with
   ADR-005, ADR-007 and ADR-022.
2. A new extension SPEC must define exact contracts, diagnostics, precedence,
   manual definitions, rendering, accessibility and conformance.
3. A reviewed plan must separate core, validator, Angular/Standard, shared
   scenario and complete repeated-review checkpoints.
4. No implementation, package version, release, publication, commit or push is
   implied by accepting this readiness review.

## 7. Complete review result

The promoted boundary, controlled-state ownership, validator replacement,
renderer resolution, nullable/enum/format interactions, recursive positions,
diagnostics, accessibility, API stability and Deferred exclusions were
reviewed together. No authoritative conflict or implementation blocker was
found.

Ricard accepted the dedicated fixed-presentation architecture in section 3 and
the recommended closed `const`/string-`enum` coherence rule. D-036 is promoted
only for the bounded M25 architecture gate; no SPEC, plan, implementation,
dependency, version, publication, commit or push is implied.
