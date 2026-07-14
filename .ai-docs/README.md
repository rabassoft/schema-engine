# Architecture Documentation

## Project state

- [Current status](./project/STATUS.md) — canonical present-tense checkpoint.
- [Roadmap](./project/ROADMAP.md) — completed milestones and proposed future
  sequence.
- [Stable handoff](../HANDOFF.md) — context-recovery procedure, never current
  status.
- [Work log](./project/WORKLOG.md) — append-only history; read selectively.

## Specifications

- [SPEC-001 v0.1.15: Controlled Form Runtime](./specs/001-controlled-form-runtime.md)
- [SPEC-002 v0.1.2: Nested Object Controlled Runtime Extension](./specs/002-nested-object-runtime.md)
  — Accepted; implemented by completed PLAN-009.
- [SPEC-003 v0.1.2: Homogeneous Object Collection Controlled Runtime Extension](./specs/003-collection-runtime.md)
  — Accepted after F-001 through F-007 were closed and complete review
  cycle 3 passed with zero findings. Completed PLAN-010 implements it after a
  final repeated review with zero findings.
- [SPEC-004 v0.1.1: Same-document Static JSON Schema Reference Resolution](./specs/004-local-reference-resolution.md)
  — Accepted after nine findings were corrected across four cycles and
  repeated complete review cycle 5 passed with zero findings.

## Acceptance reviews

- [G0: SPEC-001 acceptance evidence](./reviews/001-spec-001-acceptance.md) —
  Passed; 22/22 criteria, consumer, complete verification, and repeated
  end-to-end review passed. SPEC-001 v0.1.15 is Accepted.
- [M9: Nested-object promotion review](./reviews/002-m9-nested-object-promotion.md)
  — Accepted; D-005 is Promoted for normative design under the reviewed narrow
  boundary, with implementation still inactive.
- [M9 ADR joint review — Cycles 1–3](./reviews/003-m9-adr-review.md) — Repeated
  review 3 passed with zero findings; ADR-014 revision 1 and ADR-005 revision 1
  were accepted coordinately without authorizing implementation.
- [M9 SPEC-002 complete review — Cycles 1–2](./reviews/004-m9-spec-002-review.md)
  — Six corrections applied; repeated review 2 passed with zero findings.
  ADR-014 revision 2 and SPEC-002 v0.1.2 were accepted in order without
  authorizing implementation.
- [M9 PLAN-009 complete review — Cycles 1–2](./reviews/005-plan-009-review.md)
  — Four delivery corrections applied; repeated review 2 passed with zero
  findings. PLAN-009 revision 1 was explicitly approved.
- [M9 PLAN-009 implementation review — Cycles 1–9](./reviews/006-plan-009-implementation-review.md)
  — Documentation and evidence corrections applied; final complete review and
  verification matrix passed with zero findings.
- [M10 arrays promotion review](./reviews/007-m10-arrays-promotion.md) — Accepted;
  D-006 is Promoted for a narrow stable-identity object-list design boundary,
  without implementation authorization.
- [M10 SPEC-003 complete review — Cycles 1–3](./reviews/011-spec-003-review.md)
  — Seven findings closed; cycle 3 passed all six areas with zero findings and
  Ricard formally accepted the SPEC.
- [M10 PLAN-010 complete review](./reviews/014-plan-010-review.md) — Revision 0
  passed all nine areas with zero findings and Ricard formally approved it.
- [M10 PLAN-010 implementation review — Cycles 1–2](./reviews/015-plan-010-implementation-review.md)
  — Current-state documentation conflicts were corrected; cycle 2 repeated the
  complete review and matrix with zero findings, completing M10.
- [M11 resolved-schema promotion-readiness review](./reviews/016-m11-resolution-promotion-readiness.md)
  — Accepted; separates and promotes D-041 for same-document static
  `$defs`/`$ref` resolution while D-007 remains Deferred and no implementation
  is active.
- [M11 ADR-016 complete review — Cycles 1–2](./reviews/017-adr-016-review.md) —
  Five findings corrected; cycle 2 passed all eight areas with zero findings.
  Ricard then accepted ADR-016 formally.
- [M11 ADR-005 revision 3 complete review — Cycles 1–2](./reviews/018-adr-005-revision-3-review.md)
  — Six findings corrected; cycle 2 passed all ten areas with zero findings.
  Ricard then accepted revision 3 formally.
- [M11 SPEC-004 complete review — Cycles 1–5](./reviews/019-spec-004-review.md)
  — Nine findings corrected; cycle 5 passed all ten areas with zero findings.
  Ricard then formally accepted SPEC-004 v0.1.1.

## Architecture Decision Records

- [ADR index](./adrs/000-index.md)
- [ADR-005: JSON Schema dialect and compatibility policy](./adrs/005-politica-dialecto-json-schema.md)
  — Accepted revision 3; adds only the reviewed D-041 `$defs`/local `$ref`
  normative contract; SPEC-004 v0.1.1 is Accepted, with no implementation
  authorized before a separate plan is approved.
- [ADR-005 revision 2 complete review — Cycles 1–3](./reviews/010-adr-005-revision-2-review.md)
  — Four findings corrected; cycle 3 passed all nine areas with zero findings
  and Ricard accepted the revision.
- [ADR-005 revision 3 complete review — Cycles 1–2](./reviews/018-adr-005-revision-3-review.md)
  — Six findings corrected and repeated cycle 2 passed all ten areas with zero
  findings; Ricard then accepted revision 3 formally.
- [ADR-015: Collection templates, stable item identity and controlled structural operations](./adrs/015-modelo-colecciones-identidad-operaciones.md)
  — Accepted revision 4 after the ordinary node text context was widened to
  array definitions and passed complete review with zero findings;
  implementation is authorized only through approved PLAN-010 checkpoints.
- [ADR-015 complete review — Cycles 1–4](./reviews/008-adr-015-review.md) — Eleven
  findings corrected across three cycles; cycle 4 passed all nine areas with
  zero findings and Ricard accepted the decision.
- [ADR-015 revision 2 complete review](./reviews/009-adr-015-revision-2-review.md)
  — Narrow structural UI inventory correction passed all six areas with zero
  findings and was accepted.
- [ADR-015 revision 3 complete review](./reviews/012-adr-015-revision-3-review.md)
  — Item-root issue text-context correction passed all six areas with zero
  findings and was formally accepted.
- [ADR-015 revision 4 complete review](./reviews/013-adr-015-revision-4-review.md)
  — Collection-node ordinary text-context correction passed all six areas with
  zero findings and was formally accepted.
- [ADR-016: Same-document static JSON Schema reference resolution](./adrs/016-resolucion-referencias-locales.md)
  — Accepted after complete review cycle 2 passed all eight areas with zero
  findings; it enabled the reviewed ADR-005 revision 3 normative update.

## Roadmap and deferred decisions

- [Milestones and proposed sequence](./project/ROADMAP.md)
- [Deferred decisions](./roadmap/deferred-decisions.md)

## Implementation plans

- [PLAN-001: Minimal compiler-only implementation](./plans/001-compiler-only-implementation.md) — Completed
- [PLAN-002: Root-level immutable operations](./plans/002-root-immutable-operations.md) — Completed
- [PLAN-003: Controlled form runtime](./plans/003-controlled-runtime.md) — Completed
- [PLAN-004: Angular controlled-form adapter](./plans/004-angular-adapter.md) — Completed
- [PLAN-005: Native HTML renderers](./plans/005-native-html-renderers.md) — Completed
- [PLAN-006: String enum normalization and native select](./plans/006-string-enum-native-select.md) — Completed
- [PLAN-007: Explicit native field clearing](./plans/007-explicit-native-field-clearing.md) — Completed revision 2
- [PLAN-008: Experimental 0.1 artifact preparation](./plans/008-experimental-0-1-artifact-preparation.md) — Completed revision 2
- [PLAN-009: Nested-object controlled runtime](./plans/009-nested-object-runtime.md) — Completed revision 1
- [PLAN-010: Homogeneous object collection runtime](./plans/010-homogeneous-object-collections.md) — Completed revision 0

M1-M10 and G0 are completed, and SPEC-001 v0.1.15 is Accepted. ADR-012 and
PLAN-007 revision 2 govern the completed explicit native field-clearing
increment. ADR-013 and completed PLAN-008 revision 2 govern the private local
`0.1.0` candidates. M8 completed without publication; M9 has accepted normative
contracts. PLAN-009 revision 1 passed its repeated complete review and is
approved and completed after its final zero-finding review. M10 has accepted
normative contracts and completed PLAN-010 revision 0 after its final repeated
zero-finding review. M11 reference-resolution architecture and SPEC-004 v0.1.1
are accepted after complete review passed with zero findings; PLAN-011
preparation/review is next and no M11 implementation plan is active. M12 remains
a planning proposal only.

> Existing ADRs predate SPEC-001 and remain subject to review where they conflict with the controlled runtime specification.
