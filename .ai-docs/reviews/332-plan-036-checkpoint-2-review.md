# PLAN-036 checkpoint 2 complete review — Cycles 1–3

- **Date:** 2026-08-04
- **State:** Complete; checkpoint 2 accepted and checkpoint 3 may start
- **Authority:** Approved PLAN-036 revision 0, Accepted SPEC-020 v0.1.0 rows
  6–16 and ADR-037 revision 0
- **Scope:** Complete controlled runtime and neutral progress protocol only;
  core invariants, targets, text and package migration remain later checkpoints

## Cycles 1–2 findings and corrections

| Finding  | Correction                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R332-F01 | Parsed required creation/confirmation members before exact wrapper closure so missing/accessor diagnostics retain their exact member and unknown extras fail on the wrapper without invoking accessors. |
| R332-F02 | Reserved request identity before valid-gate marker mutation, preserving atomic exhaustion, and made repeated blocked requests/stateless completion report their factual snapshot effects.               |
| R332-F03 | Added wizard/step/validation/control/root structural reconciliation so unchanged steps and complete snapshots retain identity while changed branches replace only their required ancestors.             |
| R332-F04 | Completed first-step, boundaries, previous/next/complete, confirmation/rejection, stale, re-entry, listener-order and ordinary-runtime evidence.                                                        |
| R332-F05 | Completed provisional/pending/failed/settled async gates, explicit-retry invalidation, global completion, passage invalidation and restoration evidence without automatic navigation.                   |
| R332-F06 | Replaced the string-prefixed wizard visibility key with an independent internal key set so no unrestricted application scope ID can reveal, overwrite or hide wizard-owned visibility.                  |
| R332-F07 | Froze each step's scoped issue array and added deep immutability plus sibling/root structural-sharing regression evidence.                                                                              |
| R332-F08 | The 1.22 MB Angular reference exceeded its stale 1.2 MB hard budget by 19.68 kB. Ricard explicitly authorized 1.3 MB warning/1.5 MB error thresholds; the size warning is gone and Ajv remains visible. |

Neither cycle may support completion. After each correction, the complete
checkpoint review and applicable verification restarted.

## Complete review matrix — Cycle 3

| Area                         | Result | Evidence                                                                                                                                                              |
| ---------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority                 | Pass   | Only rows 6–16 are implemented; row-17 invariants, focus/lifecycle, targets, text, packages and release remain later or excluded.                                     |
| 2. Initial/ordinary state    | Pass   | Wizard creation requires exact first-step state; ordinary creation remains compatible and rejects wizard-only option/update state.                                    |
| 3. Intention channel         | Pass   | Frozen intentions, snapshot-before-intention order, copied-list re-entry, listener isolation, invalid subscription and disposal semantics reuse the closed channel.   |
| 4. Navigation/boundaries     | Pass   | Previous/next/complete are positional, pending-exclusive and expose exact availability, controls and factual action effects.                                          |
| 5. Confirmation/rejection    | Pass   | Exact ID/target confirmation, exact rejection, stale/duplicate defense, previous retention and atomic confirmation plus value are covered.                            |
| 6. Request identity          | Pass   | IDs are local positive monotonic safe integers; exhaustion changes no marker, snapshot or intention state.                                                            |
| 7. Synchronous gates         | Pass   | Invalid next records an attempt and reveals only its derived step scope; valid next emits without changing controlled selection.                                      |
| 8. Asynchronous gates        | Pass   | Blocked provisional permits a valid current step; pending/failed block; settled uses composed scope; settlement never auto-navigates and retry clears gated next.     |
| 9. Completion                | Pass   | Last-step completion uses full step/global/async validity, reveals the completion scope on failure and emits repeatable stateless intentions on success.              |
| 10. Markers/progress         | Pass   | Visited/attempted/passed combinations and exact error/completed/visited/unvisited precedence remain independent from current position.                                |
| 11. Transition restoration   | Pass   | Passed progress moves completed → visited on pending/failed, → error after invalid settlement and → completed after restored validation without erasing passage.      |
| 12. Immutability/sharing     | Pass   | Wizard snapshots, controls, steps, validations, issues and intentions are frozen; unchanged siblings and roots retain identity; visibility namespaces cannot collide. |
| 13. Regression/buildability  | Pass   | Core 53/873 and complete workspace 86/1,217 pass with lint, type checks and builds; Angular is 1.22 MB under authorized 1.3/1.5 MB budgets.                           |
| 14. Boundaries/documentation | Pass   | No dependency, package manifest, lockfile, export map, version, release or external state changed; formatting, docs, links and diff hygiene pass.                     |

## Conclusion

Cycle 3 passes all fourteen areas and SPEC-020 rows 6–16 with zero findings
after eight corrections. Checkpoint 2 is complete and checkpoint 3 may begin
under the autonomous execution agreement. The Angular size warning is removed;
the known Ajv CommonJS warning and Standard chunk advisory remain observations.
No dependency, version, release, publication, commit, push or external action
is authorized.
