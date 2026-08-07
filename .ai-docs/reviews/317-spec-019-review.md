# SPEC-019 complete review — Cycles 1–2

- **Date:** 2026-08-03
- **Document:** SPEC-019 v0.1.0 Draft
- **Authority reviewed:** Accepted ADR-036 revision 1, ADR-005 revision 9 and
  every baseline named by SPEC-019
- **Outcome:** Cycle 1 found three observable projection ambiguities. After
  correction, cycle 2 repeats all fifteen contract areas and all 17
  conformance rows with zero findings. SPEC-019 v0.1.0 may be accepted under
  the authorized zero-finding rule.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| R317-F01 | Require active `FormRuntimeSnapshot.fields` to contain the same leaf references as the active node tree and exclude every inactive leaf.  |
| R317-F02 | Make inactive-target alternative-index presence exact and freeze every parameter path without exposing discriminator domain values.       |
| R317-F03 | Preserve each normalized issue's original instance path when assigning inactive issues to the discriminated owner's issue array/validity. |

Cycle 1 cannot support acceptance. Cycle 2 restarts the complete grammar,
types, compiler, manual, runtime, state, operation, validation, scope, target,
migration, exclusion and conformance review.

## Cycle 2 complete review

| Area                           | Result | Evidence                                                                                                          |
| ------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------- |
| 1. Authority/scope             | Pass   | Only Accepted nested-property M33 is observable; all broader alternatives remain excluded.                        |
| 2. Authored/compiler contract  | Pass   | ADR-005 grammar, safety, diagnostics, paths, ordering and no-partial behavior are adopted exactly.                |
| 3. Public definitions          | Pass   | Five exports, unique union ownership, static complete fields and ordinary source compatibility are exact.         |
| 4. UI/text                     | Pass   | One union UI, filtered order, presentation precedence, condition exclusion and unchanged text members are closed. |
| 5. Manual definitions          | Pass   | Ordered checks, three reasons, locators, first failure and validator/effect suppression are deterministic.        |
| 6. Selection/snapshots         | Pass   | Current value selects active/none; common+active tree and active leaf projection share exact identities.          |
| 7. Controlled state            | Pass   | Confirmation, dormant data, baseline/dirty, touched/focus and structural sharing preserve application ownership.  |
| 8. Inactive operations         | Pass   | Exact code/parameters/index presence, action order, zero effects and stale selection defense are closed.          |
| 9. Validation/issues           | Pass   | Original schema/issues remain; assignment changes owner membership, never issue path/content or adapter behavior. |
| 10. Scopes/defaults/conditions | Pass   | Inactive paths are known, M29 stops at oneOf and M30/M32 union links remain unsupported.                          |
| 11. Angular/Standard           | Pass   | Both targets consume only neutral kinds/snapshots and prove one shared scenario independently.                    |
| 12. Migration                  | Pass   | Experimental unions widen under a later MINOR with no package/dependency/version/release authorization.           |
| 13. Conformance                | Pass   | All 17 rows cover compiler through final regressions exactly once at future-plan level.                           |
| 14. Exclusions/gates           | Pass   | Every Deferred boundary remains and acceptance authorizes only PLAN-035 preparation/review.                       |
| 15. Documentation/hygiene      | Pass   | Indexes, STATUS, ROADMAP, deferred state, formatting, links and diff hygiene reconcile the Draft.                 |

## Result

Cycle 2 passes the complete contract and all 17 rows with zero findings and no
unresolved change request. SPEC-019 v0.1.0 may be Accepted. Acceptance would
authorize only PLAN-035 preparation/review, not plan approval, implementation,
dependency, version, release, publication or Git action.

## Acceptance follow-up

SPEC-019 v0.1.0 is Accepted on 3 August 2026 under the authorized zero-finding
rule. Acceptance changes no cycle-2 result and authorizes only preparation and
complete review of PLAN-035.
