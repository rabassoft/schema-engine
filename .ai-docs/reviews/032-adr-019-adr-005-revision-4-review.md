# ADR-019 and ADR-005 revision 4 joint review

- **State:** Accepted; cycle 2 complete with zero findings
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Reviewed:** ADR-019 revision 0 and ADR-005 revision 4 against review 031,
  accepted SPEC-001 through SPEC-005, ADR-007/009/010/012/014/015/016 and the
  current compiler, definitions, operations, runtime and Angular native paths
- **Authority:** review only; acceptance may authorize SPEC-006 preparation but
  no plan, implementation, version or publication

## 1. Cycle 1 findings

The first complete pass found eight issues. None changed the approved D-009
scope, but all required correction before acceptance:

1. **R032-F001 — formatting:** ADR-019 did not initially pass Prettier.
2. **R032-F002 — normalized capability combination:** manual
   `nullable: true` plus string `choices` could bypass the excluded
   `enum + null` boundary.
3. **R032-F003 — operation ownership:** the draft did not distinguish raw
   schema-agnostic `applyOperation()` from definition-aware
   `applyFormOperation()`.
4. **R032-F004 — type-array precedence:** two equal primitive members had both
   `missing-null` and `duplicate-primitive` available without a unique rule.
5. **R032-F005 — collection identity:** nullable identity rejection lacked the
   existing exact semantic policy diagnostic envelope.
6. **R032-F006 — release compatibility:** the Public + Experimental breaking
   change did not state ADR-010's MINOR-not-PATCH requirement.
7. **R032-F007 — missing ancestors:** “unblocked” would have suppressed the
   accepted editable/materializable `missing-ancestor` path.
8. **R032-F008 — descriptor/runtime claims:** array `length`, Proxy reflection
   and readonly versus frozen manual definitions were imprecise.

Corrections also made the accepted schema-blocked `enumLabels` behavior and the
two new `INVALID_FORM_DEFINITION` reasons explicit. The complete review had to
restart.

## 2. Complete review — Cycle 2

The repeated review covered all ten areas from the beginning:

1. **Authority and promoted boundary:** passes. Only one existing primitive
   plus null is active at existing leaf positions; containers, identity,
   enum-null and general unions remain outside M14.
2. **Dialect and hostile input:** passes. ADR-005 revision 4 fixes the dense
   two-member form, own data descriptors, length/member/extra-key precedence,
   safe paths and the existing Proxy boundary without accessors or coercion.
3. **Schema/UI diagnostics:** passes. Existing codes, reasons, paths, one-error
   branch stopping, primitive constraint classification and schema-blocked
   `enumLabels` behavior are deterministic.
4. **Normalized/Public contract:** passes. Required `nullable: boolean` is
   canonical on all primitive definitions/templates, false for scalar schemas,
   and manual definitions have exact descriptor-safe failure envelopes.
5. **Operations, runtime and validation:** passes. Raw operations remain
   structural; definition-aware operations/runtime accept null only for
   nullable targets. Missing/null/false/value, required and validator ownership
   remain distinct and controlled.
6. **Nested, collection and reference propagation:** passes. Direct, nested,
   item-relative and reference use sites normalize identically; identity keeps
   its exact string-only policy diagnostic and containers stay non-nullable.
7. **Angular, accessibility and Signal Forms:** passes. A common explicit
   `Set null` action, perceptible `Null value` status, existing clear/missing,
   focus order, missing-/incompatible-ancestor behavior and buffer
   reconciliation are closed without a new output or UI Schema option.
8. **Texts, IDs and renderer resolution:** passes. Two text members/fallbacks
   and two Internal deterministic IDs are exact; existing native IDs, ranks,
   priorities and testers remain stable and value-independent.
9. **Public/Internal, SemVer and migration:** passes. All signature/behavior/
   diagnostic changes are inventoried as Experimental, require coordinated
   MINOR releases with migration notes and authorize no version/publication.
10. **Gates and exclusions:** passes. ADR acceptance can authorize only a
    separately reviewed SPEC-006; PLAN-014, code, Stable promotion, publication
    and unrelated deferred capabilities remain unauthorized.

## 3. Result

Cycle 2 has zero findings and no unresolved change request. ADR-019 revision 0
and ADR-005 revision 4 were accepted coordinately under the three decisions
Ricard approved before drafting.

Acceptance will authorize only drafting and reviewing SPEC-006 as a separate
task. It will not authorize a plan, implementation, package version,
publication, repository mutation or Stable API change.
