# SPEC-006 review

- **State:** Accepted; cycle 6 closed with zero findings
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Reviewed:** SPEC-006 v0.1.1 against review 031, ADR-019 revision 1,
  ADR-005 revision 4, Accepted SPEC-001 through SPEC-005 and current Public/
  Internal implementation evidence
- **Authority:** specification review only; acceptance may authorize PLAN-014
  preparation but no plan approval, code, version or publication

## 1. Cycle 1 findings

The first complete pass found seven issues:

1. **R034-F001 — formatting:** the initial SPEC did not pass Prettier.
2. **R034-F002 — diagnostic table:** union pipes split Markdown table cells and
   made the parameter contract ambiguous.
3. **R034-F003 — accessibility example:** the standalone ARIA attribute was
   reformatted into invalid HTML rather than an exact button example.
4. **R034-F004 — manual runtime definitions:** the draft assigned
   `INVALID_FORM_DEFINITION` directly to runtime creation instead of preserving
   the `INVALID_RUNTIME_OPTIONS` wrapper.
5. **R034-F005 — text fallback:** the field diagnostic fallback did not match
   the Accepted exact field-specific string.
6. **R034-F006 — resolver order:** non-nullable behavior diverged from the
   always-required text snapshot and existing clear projection without an
   architectural basis.
7. **R034-F007 — null status markup:** “neutral element” did not choose an exact
   DOM element.

All seven were corrected and the complete review restarted.

## 2. Cycle 2 findings

The repeated complete pass found three further issues:

1. **R034-F008 — contract notation:** `<safe actual type>` inside TypeScript
   examples was not a valid observable type contract.
2. **R034-F009 — migration inventory:** the diagnostic inventory named the new
   definition reasons but omitted their `INVALID_RUNTIME_OPTIONS` projection.
3. **R034-F010 — container boundary:** root/object/array/item-root type arrays
   were excluded but their unchanged diagnostic ownership was not explicit.

All three were corrected and the complete review restarted again.

## 3. Cycle 3 finding

The third complete pass found one active-state conflict:

1. **R034-F011 — accepted ADR revision:** ROADMAP and the deferred register
   still named ADR-019 revision 0 after revision 1 had resolved the preflight
   conflict and become Accepted.

Both documents were corrected and the complete review restarted.

## 4. Complete review — Cycle 4

The fourth pass covered all twelve areas from the beginning:

1. **Authority and promoted scope:** passes. Only nullable primitive leaves are
   active and acceptance can authorize PLAN-014 preparation only.
2. **Type-array grammar and hostile inspection:** passes. Length, descriptors,
   members, extra keys, combinations, Proxy boundary and no-retention rules are
   exact.
3. **Schema diagnostics and order:** passes. Existing codes, safe parameters,
   root/container ownership, leaf paths, template/reference provenance and
   branch stopping are closed.
4. **Constraints and UI compatibility:** passes. Primitive constraints/options,
   enum/enumLabels, annotations, defaults and identity policy preserve their
   Accepted classifications.
5. **Normalized and manual definitions:** passes. Required boolean, freezing,
   choices exclusion, direct/template locators and both manual-definition
   diagnostic wrappers are exact.
6. **Operations:** passes. Raw operations remain structural; direct/deep and
   item-relative null compatibility preserve distinct diagnostic families,
   expectations and no-effect/remove behavior.
7. **Runtime and validation:** passes. Missing/null/false/value, dirty,
   required, external incompatible null, validator ownership and ancestor
   materialization/blocking remain controlled.
8. **Nested, collection and reference propagation:** passes. Every existing
   editable leaf position normalizes identically while containers and identity
   remain excluded.
9. **Angular and accessibility:** passes. Exact button/span markup, focus-before-
   output, clear distinction, described-by order and incompatible-ancestor
   defense have no unresolved meaning.
10. **Signal Forms, texts and IDs:** passes. Buffers never own null; two required
    texts, resolver order/failures, projection identity and deterministic IDs
    are closed.
11. **Renderer/API/SemVer migration:** passes. Registrations remain unchanged;
    all Public/Internal changes are inventoried as Experimental and any future
    delivery is MINOR-not-PATCH without selecting a version.
12. **Conformance and gates:** passes. Twenty-three scenario groups cover the
    complete behavior and no PLAN/code/publication is prepared by acceptance.

## 5. Result

Cycle 4 has zero findings and no unresolved change request. Ricard's standing
authorization accepted SPEC-006 v0.1.1. Acceptance authorizes preparation and
review of PLAN-014 only; explicit plan approval remains required before
implementation.

## 6. Cycle 5 closing-state finding

The acceptance-state documentation pass found one current-state class of
defect:

1. **R034-F012 — onboarding state:** root `README.md` and `.ai-docs/README.md`
   did not report Accepted SPEC-006 v0.1.1. The architecture README also retained
   stale pre-completion PLAN-013/M13 wording.

Both onboarding documents were reconciled and the complete closing review was
restarted.

## 7. Complete review — Cycle 6

Cycle 6 repeated all twelve specification areas from section 4, then checked
the accepted-state projection across STATUS, ROADMAP, both documentation
indexes, both onboarding READMEs, the ADR index and the deferred register.
Every area passes with zero findings and no unresolved change request.

## 8. Final result

SPEC-006 v0.1.1 is Accepted. Review cycle 6 is the supporting zero-finding pass.
Only preparation and review of PLAN-014 are authorized; explicit plan approval
remains required before implementation.
