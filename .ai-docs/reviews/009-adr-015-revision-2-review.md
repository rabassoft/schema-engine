# ADR-015 revision 2 complete review

- **State:** Accepted; complete review passed with zero findings
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Candidate:** [`ADR-015 revision 2`](../adrs/015-modelo-colecciones-identidad-operaciones.md)
- **Scope:** structural array UI Public-inventory correction only
- **Implementation or publication authorized:** No

## 1. Baseline and boundary

The review compares the revision 2 amendment with accepted ADR-009, ADR-015
revision 1, the accepted M10 promotion boundary and proposed ADR-005 revision 2
section 11.7. Identity, operations, runtime, validation, Angular behavior and
all prior ADR-015 review results remain closed and are not reopened.

## 2. Complete review matrix

| Area                   | Result | Evidence                                                                                                                                        |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Required structural UI | Pass   | `ArrayUiSchema` and `ItemUiSchema` exactly express collection texts plus one homogeneous item-template branch required by ADR-005 revision 2.   |
| ADR-009 inventory      | Pass   | Both new Public symbols and every transitive `UiNodeSchema`/`UiSchema.fields`/compiler-input semantic change are named and remain Experimental. |
| Branch selection       | Pass   | The normalized schema kind, not overlapping TypeScript object shape, selects array/object/leaf UI interpretation in framework-neutral core.     |
| Ownership boundary     | Pass   | Identity, item/action texts, operations, cardinality, layout and renderer selection remain outside UI Schema.                                   |
| Angular boundary       | Pass   | No Public Angular contract changes; fixed collection/item projection remains Internal and consumes normalized definitions only.                 |
| Gate preservation      | Pass   | No SPEC, plan, implementation, package, Stable or publication gate is bypassed.                                                                 |

## 3. Conflict check

- The exact Public inventory now contains every contract required by ADR-005
  revision 2 section 11.7.
- No conflict remains with ADR-009's rule against silent Public semantic/type
  changes.
- The amendment does not change accepted revision 1 behavior outside this
  inventory correction.
- Primitive/nested arrays, tuples and advanced collection UI remain deferred.

## 4. Result

The complete review passes with zero findings. Ricard authorized the narrow
correction, and ADR-015 revision 2 is Accepted. This acceptance only unblocks
complete review of ADR-005 revision 2; it does not accept that proposal or
authorize SPEC-003, PLAN-010, implementation or publication.
