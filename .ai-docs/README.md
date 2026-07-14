# Architecture Documentation

## Project state

- [Current status](./project/STATUS.md) — canonical present-tense checkpoint.
- [Roadmap](./project/ROADMAP.md) — completed milestones and proposed future
  sequence.
- [Stable handoff](../HANDOFF.md) — context-recovery procedure, never current
  status.
- [Work log](./project/WORKLOG.md) — append-only history; read selectively.

## Specifications

- [SPEC-001: Controlled Form Runtime](./specs/001-controlled-form-runtime.md)

## Acceptance reviews

- [G0: SPEC-001 acceptance evidence](./reviews/001-spec-001-acceptance.md) —
  Passed; 22/22 criteria, consumer, complete verification, and repeated
  end-to-end review passed. SPEC-001 v0.1.14 is Accepted.

## Architecture Decision Records

- [ADR index](./adrs/000-index.md)

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

M1-M7 and G0 are completed, and SPEC-001 v0.1.15 is Accepted. ADR-012 and
PLAN-007 revision 2 govern the completed explicit native field-clearing
increment. ADR-013 and completed PLAN-008 revision 2 govern the private local
`0.1.0` candidates. M8 completed without publication; M9-M12 remain unapproved
delivery commitments.

> Existing ADRs predate SPEC-001 and remain subject to review where they conflict with the controlled runtime specification.
