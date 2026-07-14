# ADR-015 complete review — Cycles 1–4

- **State:** Accepted; cycle 4 passed with zero findings
- **Acceptance date:** 14 July 2026
- **Date:** 14 July 2026
- **Candidate:** [`ADR-015 revision 1`](../adrs/015-modelo-colecciones-identidad-operaciones.md)
- **Scope:** all nine ADR acceptance areas
- **Behavior, implementation or publication authorized:** No

## 1. Review baseline

The review compares ADR-015 with accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2,
ADR-005 revision 1, ADR-009, ADR-014 revision 2, the accepted D-006/M10
promotion boundary and the deferred-decisions register.

The review does not amend a SPEC, revise ADR-005, prepare PLAN-010, implement
arrays or authorize publication.

## 2. Cycle 1 findings and corrections

| ID    | Finding                                                                                                                        | Correction in ADR-015 revision 1                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1-01 | Tagged collection keys and DOM bases conflicted with ADR-014's accepted `key === JSON.stringify(path)` and existing DOM tuple. | Preserved the accepted array-node path key/base and limited tagged tuples to templates and item instances.                                                          |
| R1-02 | Collection operations lacked the identity property required by schema-neutral `applyOperation()`.                              | Added immutable `identityProperty` to all five item/structural variants and required `applyFormOperation()` to verify it against the normalized definition.         |
| R1-03 | Collection leaf operation discriminants and shapes were deferred instead of architecturally closed.                            | Defined exact `set-item-value` and `remove-item-value` variants, stable targets, expectations and union membership.                                                 |
| R1-04 | Insert behavior for a missing collection or missing compatible ancestors was undefined.                                        | Allowed only `start`/`end` insertion to materialize the missing chain/array; closed anchor, incompatible, remove and move behavior.                                 |
| R1-05 | Array dirty did not explicitly aggregate matched descendant dirty.                                                             | Defined item descendant aggregation and array sequence-or-item aggregation without duplicating inserted/removed dirty.                                              |
| R1-06 | Angular action text, post-operation focus and host failure isolation were incomplete.                                          | Added exact collection text contexts/sources, adjacent controls, deterministic DOM focus recovery, invalid-identity fallback and two isolated creation diagnostics. |
| R1-07 | ADR-009 migration inventory named families rather than every affected Public contract.                                         | Replaced it with an exact named Public core/runtime/Angular inventory and explicit unchanged/Internal boundaries.                                                   |

After these corrections the complete review restarted rather than checking only
the edited paragraphs.

## 3. Cycle 2 findings and corrections

| ID    | Finding                                                                                                            | Correction in ADR-015 revision 1                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R2-01 | The relationship between static definition fields and dynamically expanded runtime fields was not closed.          | Kept definition fields static outside templates and defined runtime fields as a same-reference depth-first expansion of current valid items.                   |
| R2-02 | Exact item-root lookup could not satisfy the existing `NodeRuntimeSnapshot` return type.                           | Added `RuntimeTreeSnapshot`, closed both stable and positional item-root lookups and added it to the Public inventory.                                         |
| R2-03 | The inserted opaque item reference and runtime insertion below missing ancestors lacked exact ownership semantics. | Preserved the exact application item reference without cloning/freezing it, and closed validation/emission/materialization behavior for `requestInsertItem()`. |

After these corrections the complete review restarted again across all nine
areas.

## 4. Cycle 3 finding and correction

| ID    | Finding                                                                                                                       | Correction in ADR-015 revision 1                                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| R3-01 | The closing authorization allowed SPEC-003 drafting immediately after ADR-015, conflicting with the accepted sequential gate. | Limited ADR-015 acceptance to preparing/reviewing ADR-005 revision 2; SPEC-003 remains blocked until that revision is accepted. |

The complete review restarted once more after the sequence correction.

## 5. Cycle 4 complete matrix

| Area                            | Result | Evidence                                                                                                                                                             |
| ------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Template/instance invariants    | Pass   | Static array and relative item-template views are immutable, projection-consistent and separated from runtime cardinality.                                           |
| Stable identity                 | Pass   | One direct required application-owned string property is declared neutrally, descriptor-safe, non-editable and unique per collection.                                |
| Paths, keys and DOM IDs         | Pass   | Positional `DataPath`, stable addresses and template paths are distinct; ADR-014 keys remain intact and tagged instance tuples are collision-safe.                   |
| Operations and concurrency      | Pass   | Two stable leaf plus three structural variants are exact, self-contained for both helpers, atomic and cannot retarget after movement.                                |
| Presence, dirty and interaction | Pass   | Invalid identity is atomic, aggregate dirty ownership is single, focus/touched reconcile by stable address and sharing promises allow positional wrappers to change. |
| Validation and scopes           | Pass   | Validator paths remain positional, mapping/fallback is deterministic and scope targets remain stable across moves.                                                   |
| Angular/accessibility           | Pass   | Fixed Internal hosts track by identity, localize actions/errors, recover DOM focus, isolate synchronous creation failures and keep Signal Forms leaf-only.           |
| Public API migration            | Pass   | Every new/changed Public symbol and method family is named, remains Experimental and uses only existing root entry points.                                           |
| Deferred boundaries             | Pass   | Primitive/nested arrays, tuples, refs/composition, defaults/factories, batches, advanced layouts, dynamic definitions and publication remain inactive.               |

## 6. Conflict check

- No conflict remains with ADR-014 key/path/DOM rules.
- No conflict remains with application ownership of controlled values or
  baseline.
- ADR-007 still receives primitive leaves only; collection and item hosts are
  Internal.
- ADR-005 revision 1 remains authoritative for implemented M9 behavior and is
  not silently amended by this proposed M10 decision.
- SPEC-001 and SPEC-002 still exclude arrays until a future accepted SPEC-003
  explicitly replaces that boundary.
- No code, package, manifest, lockfile, accepted ADR, SPEC or plan changed.

## 7. Result

Cycle 4 passes all nine areas with zero findings. Ricard formally accepted
ADR-015 revision 1 on 14 July 2026. Acceptance authorizes preparation and
review of ADR-005 revision 2, not SPEC-003, PLAN-010, implementation or
publication by itself.
