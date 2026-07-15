# SPEC-005 complete review — Cycles 1–2

- **State:** Accepted after cycle 2 passed with zero findings
- **Date:** 15 July 2026
- **Document reviewed:**
  [`SPEC-005 v0.1.1`](../specs/005-static-presentation-groups.md)
- **Authority:** accepted ADR-017 revision 0 and D-042
- **Cycle 1:** four findings
- **Cycle 2:** all ten areas pass with zero findings

## Cycle 1 findings and corrections

1. The root `presentation` accessor case had no closed diagnostic reason.
   Added `presentation-accessor`, its exact path and non-evaluation rule.
2. Section keys were described as both exact and extensible, and atomic fallback
   could be read as reacting to unrelated unknown-key warnings. Clarified that
   known members are closed, additional keys follow existing behavior, and only
   `INVALID_UI_PRESENTATION` invalidates the forest.
3. Unsupported item UI presentation had no exact `dataPath`. It now uses the
   owning collection path; object and array locations use their own node path.
4. Manual-definition wording could be read as requiring `Object.isFrozen()`.
   It now requires readonly-contract shapes without runtime frozen-object
   identity.

SPEC-005 advanced from Draft v0.1.0 to v0.1.1. The complete review was repeated.

## 1. Authority and scope — Pass

The SPEC implements only D-042/ADR-017: root-only static sections and a
normalized presentation projection. All D-011/D-012 capabilities outside that
slice remain explicit non-goals.

## 2. Public contracts — Pass

All seven new Public core symbols and every changed contract match the exact
ADR-009 inventory. No Public Angular symbol, package, entry point, dependency
or Stable classification is added.

## 3. Grammar and identity — Pass

Root grammar, exact-once node membership, section ID/key rules, nesting, order
conflict and root-only boundary are closed. Object/collection nodes remain
atomic and presentation never becomes a data authority.

## 4. Diagnostics and fallback — Pass

`INVALID_UI_PRESENTATION` has a closed reason/parameter/path vocabulary and
deterministic traversal order. Descriptor safety, accessors, sparse entries,
cycles, reuse and independent unknown keys are explicit. Only that family
causes atomic default-forest fallback.

## 5. Normalization and hostile input — Pass

Default and valid forests are deeply immutable, do not retain raw UI values and
preserve exact root node object identity. Iterative inspection and manual
validation have no Public depth limit.

## 6. Manual definitions — Pass

All malformed-forest families are named under existing runtime/operation
envelopes, exact object identity is required, and validator/operation execution
is blocked after the first deterministic defect without requiring frozen input.

## 7. Text and accessibility — Pass

Section text context, failure parameters, fallback and projection identity are
closed. DOM identity is collision-safe and the fixed fieldset/legend host has
no invented aggregate runtime state.

## 8. Angular ownership and isolation — Pass

Projection maps exact root nodes to existing snapshots and outlets. Section
creation failure is closed and isolated. Leaf renderer selection, fixed
object/collection/item hosts and Signal Forms ownership are unchanged.

## 9. Runtime and deferred boundaries — Pass

Runtime, validation, operations, scopes, controlled state, persistence and
collection identity are unchanged. No generated scope, layout state, action,
custom container or dynamic definition is introduced.

## 10. Evidence and authorization — Pass

All 18 conformance areas map to observable contracts, hostile fixtures,
package/declaration checks and unchanged M1–M11 evidence. Acceptance authorizes
PLAN-012 preparation/review only; implementation still requires explicit plan
approval.

## Acceptance result

Cycle 2 has zero findings. Under Ricard's standing authorization, SPEC-005
v0.1.1 was accepted because the corrections close ambiguity without widening
ADR-017 or D-042. PLAN-012 preparation/review is authorized; implementation is
not.
