# ADR-005 revision 2 complete review — Cycles 1–3

- **State:** Accepted; cycle 3 passed with zero findings
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Candidate:** [`ADR-005 revision 2`](../adrs/005-politica-dialecto-json-schema.md)
- **Requires:** [`ADR-015 revision 2 Accepted`](../adrs/015-modelo-colecciones-identidad-operaciones.md)
- **Implementation or publication authorized:** No

## 1. Baseline

The review compares proposed revision 2 with accepted ADR-005 revision 1,
SPEC-001 v0.1.15, SPEC-002 v0.1.2, accepted ADR-015 revision 2, the M10
promotion boundary and the deferred-decisions register. Revision 1 remains the
implemented authority throughout the review.

## 2. Cycle 1 findings and corrections

| ID    | Finding                                                                                                            | Correction                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| R1-01 | A structurally invalid collection policy incorrectly suppressed otherwise independent `items` schema/UI traversal. | Limited policy failure to identity-dependent classification and final normalization; independent shape/cycle/keyword diagnostics continue.      |
| R1-02 | Incompatible keywords at array, item-root and identity locations lacked one closed diagnostic rule.                | Assigned exactly `INCOMPATIBLE_SCHEMA_KEYWORD`, preserved malformed-value precedence and closed location-specific `fieldType`.                  |
| R1-03 | Structural array UI lacked exact exterior shape, active-cycle handling, paths and local diagnostic order.          | Added descriptor-safe item UI shape, `CYCLIC_UI_SCHEMA_OBJECT`, exact document/data/template paths and deterministic traversal/branch stopping. |

The complete nine-area review restarted after these corrections.

## 3. Cycle 2 finding and correction

| ID    | Finding                                                                                                                                | Correction                                                                                                         |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| R2-01 | The proposed `INCOMPATIBLE_SCHEMA_KEYWORD` parameters added `field` and new composite `fieldType` values beyond the accepted envelope. | Restored exact `{ keyword, fieldType }`, using only `array`, `object` or `string`; immutable paths carry location. |

The complete review restarted again rather than checking only the corrected
diagnostic paragraph.

## 4. Cycle 3 complete matrix

| Area                    | Result | Evidence                                                                                                                         |
| ----------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Dialect/M9 preservation | Pass   | Draft 2020-12 URI, missing-dialect behavior, unknown/ignored policy and all unchanged revision 1 rules remain authoritative.     |
| Closed schema catalogs  | Pass   | Array node, inline item root, identity property and item descendants each have exact supported/incompatible sets.                |
| Narrow item form        | Pass   | One required inline object `items` is accepted; primitive/nested arrays, tuples and all other array keywords remain blocked.     |
| Collection policy       | Pass   | Policies are neutral, mandatory, descriptor-safe, path-exact and ordered without suppressing independent diagnostics.            |
| Traversal/cycles        | Pass   | Iterative active-ancestry traversal covers `items`/properties, permits sibling sharing and stops only malformed/cyclic branches. |
| Paths/order             | Pass   | Schema/UI `documentPath`, array `dataPath`, relative `templatePath` and complete diagnostic ordering are deterministic.          |
| Structural UI           | Pass   | Accepted ADR-015 revision 2 contracts expose only texts and one item-template branch; identity/actions/layout stay out.          |
| ADR-015/SPEC readiness  | Pass   | Template, identity and Public inventory semantics align; SPEC-003 retains exact observable diagnostic and declaration details.   |
| Deferred gates          | Pass   | No SPEC, plan, implementation, package, Stable or publication authority is activated.                                            |

## 5. Conflict check and result

- No conflict remains with accepted ADR-015 revision 2 or ADR-009.
- Accepted ADR-005 revision 1 remains authoritative for implemented M1–M9.
- SPEC-001/SPEC-002 continue to exclude arrays until a future accepted SPEC-003
  explicitly replaces that boundary.
- No code, package, manifest, lockfile, accepted SPEC or plan changed.

Cycle 3 passes all nine areas with zero findings. Ricard formally accepted
ADR-005 revision 2 on 14 July 2026. Acceptance authorizes preparation of
SPEC-003 as a separate task, not PLAN-010, implementation or publication.
