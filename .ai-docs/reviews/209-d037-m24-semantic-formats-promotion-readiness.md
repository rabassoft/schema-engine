# D-037/M24 semantic string formats promotion-readiness review — Cycle 1

- **Date:** 2026-07-30
- **State:** Accepted
- **Demand:** Resume product functionality with common semantic string fields
  that remain portable across core, Angular and Standard consumers
- **Authority reviewed:** SPEC-001 v0.1.15, SPEC-007 v0.1.0, ADR-005 revision
  4, ADR-007, ADR-009, ADR-022 revision 1, completed PLAN-019, D-003, D-007,
  D-013, D-018, D-036, D-037 and D-039
- **Outcome:** Cycle 1 passed with zero findings and promotes only the bounded
  D-037 slice below

## 1. Readiness conclusion

Promote D-037 as M24 for exactly three string formats: `email`, `date` and
`date-time`. The core compiler may normalize these annotations into the
framework-neutral string definition; the reusable Ajv integration may assert
them; and Angular plus Standard may project appropriate native presentation.

This is smaller and more immediately useful than composition, asynchronous
validation, dynamic definitions or an expression engine. Existing recursive
objects, collection templates, local references, renderer resolution, Ajv
normalization and both reference targets provide every prerequisite.

## 2. Promoted boundary

Normative design may define only:

- Public + Experimental `StringSemanticFormat` with the three exact literals;
- optional `format` on normalized string fields/templates, including nullable
  strings and string enums;
- descriptor-safe compilation at direct, nested, item-template and resolved
  local-reference positions;
- a non-blocking ignored-format warning for other string format names and a
  blocking malformed-value diagnostic for non-string/accessor values;
- full `email`, `date` and `date-time` assertion in the existing private Ajv
  package, conformant with exact `ajv-formats@3.0.1`;
- `type="email"` and `type="date"` where native controls preserve the canonical
  string, and text fallback for RFC 3339 `date-time`, whose timezone-bearing
  value is not represented faithfully by `datetime-local`;
- unchanged enum-select precedence, controlled-state semantics and replaceable
  validator authority; and
- conformance in core, validator, Angular, Standard and both reference shells.

No Public option selects assertion behavior. The core never validates format;
the official validator does. A consumer replacing that validator owns its own
format-assertion policy.

## 3. Required gates

1. ADR-027 must revise the narrow ADR-005/ADR-022 clauses and close
   normalization, assertion, rendering, fallback and dependency ownership.
2. SPEC-010 must define observable contracts and the complete conformance
   matrix.
3. PLAN-026 must be reviewed and approved before implementation.
4. Every correction requires a repeated complete review until a full pass has
   zero findings.

## 4. Material alternatives

- **Presentation only:** rejected because the official validator would accept
  visibly malformed email/date values and the two reference targets would
  disagree with the semantic field promise.
- **Browser validation as authority:** rejected because it differs across
  targets and would bypass normalized `ValidationIssue` contracts.
- **Configurable factory:** deferred; it widens a Public API without current
  demand. Replaceability already lets a consumer select another policy.
- **`datetime-local`:** rejected because it omits the required RFC 3339 zone
  and would transform or reject canonical `date-time` values.
- **All ajv-formats formats:** rejected because it silently promotes D-037
  beyond the three selected cases.

## 5. Complete zero-finding pass

Cycle 1 repeated demand, authority, dialect vocabulary, normalized model,
diagnostics, nullable/enum/reference propagation, Ajv assertion, renderer
fidelity, controlled-state invariants, dependency/publication boundaries and
delivery sequencing with zero findings and no unresolved change request.

The user's explicit M24 authorization accepts this bounded promotion. It does
not authorize release, publication, commit, push or another format.
