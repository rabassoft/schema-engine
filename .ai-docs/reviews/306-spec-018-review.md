# SPEC-018 complete review — Cycles 1–2

- **Date:** 2026-08-03
- **Scope:** SPEC-018 v0.1.0 against Accepted ADR-035 revision 0,
  SPEC-016 v0.1.1 and SPEC-017 v0.1.0
- **Outcome:** Cycle 1 found seven authority, diagnostic and migration defects.
  After correction, cycle 2 repeated all fifteen areas and all 22 conformance
  rows with zero findings and no unresolved change request.

## Cycle 1 findings and corrections

1. Zero-length `conditions` was included in the generic
   `condition-member-invalid` mapping despite its dedicated
   `condition-group-empty` reason. The mappings are now disjoint.
2. Migration wording narrowed every condition through normalized
   `sourcePath`, omitting raw readers. Raw and normalized narrowing are now
   stated independently.
3. ADR-035's existing-reason prose could classify a non-object indexed member
   under both `condition-member-invalid` and `condition-not-object`. The former
   now names only operator, conditions-array and member predicate path/equals
   values.
4. ADR-035/SPEC-018 preserve M31 explicitly but initially omitted accepted
   ADR-034/SPEC-017 from required authority. Both baselines are now explicit.
5. Manual group classification did not close unknown enumerable keys against
   M30 behavior. They now remain ignored and non-retained, while raw `path`
   still cannot satisfy normalized predicate requirements.
6. An accessor conditions index appeared in both generic invalid-index and
   accessor mappings. It now uses only `condition-member-accessor`.
7. Manual diagnostics used one ambiguous `memberIndex` for group members and
   sourcePath indices. Exact direct and runtime-wrapper group reason/index/key/
   operator names now separate `conditionGroupIndex` from existing
   `conditionIndex`.

Cycle 1 cannot support acceptance.

## Cycle 2 complete review

| Area                                | Result | Evidence                                                                                                                            |
| ----------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and replacement        | Pass   | Replaces only SPEC-016 single-condition shapes under ADR-035 and explicitly preserves SPEC-017/M31.                                 |
| 2. Public declarations              | Pass   | Four exact new root types and two widened properties preserve existing predicate interfaces and template omission.                  |
| 3. Raw family classification        | Pass   | Enumerable data/accessor selection, non-enumerable absence, mixed/default-family behavior and no fallback are exact.                |
| 4. Group grammar                    | Pass   | Operator, non-empty dense exact-index array, extra keys, member exteriors, no nesting and duplicate retention are closed.           |
| 5. Normalization                    | Pass   | Group/array/predicate/path layers are detached/frozen with exact authored order and no canonicalization.                            |
| 6. Compiler diagnostics             | Pass   | Three new reasons and all existing mappings are disjoint with exact safe parameters and no raw retention.                           |
| 7. Paths, ordering and stopping     | Pass   | Field/member/group/path order, document/data paths, unknown warnings, semantic collection and schema-blocked suppression are exact. |
| 8. Manual definitions               | Pass   | Raw/normalized separation, unknown keys, two-phase validation, exact direct/wrapper fields and non-invocation are closed.           |
| 9. Runtime truth and traversal      | Pass   | M30 presence/Object.is semantics plus complete ordered non-short-circuit all/any evaluation are deterministic.                      |
| 10. Schedule and sharing            | Pass   | Initial/current-reference triggers, all non-triggers and result-based structural sharing remain exact.                              |
| 11. Focus/actions/domain invariants | Pass   | Focus reconciliation, hidden/disabled precedence, stale defense, zero operation and validation/value invariance are unchanged.      |
| 12. Targets and shared evidence     | Pass   | Angular/Standard consume booleans only and independently prove one complete shared compound scenario.                               |
| 13. Other nodes and future scope    | Pass   | Collections, M31, presentation, M33/M34/React and every wider expression capability remain inactive.                                |
| 14. Packages and migration          | Pass   | Raw/normalized reader migration, exact consumers/source reconstruction and frozen graph/version boundary are complete.              |
| 15. Conformance and hygiene         | Pass   | Rows 1–22 are unique and sufficient; formatting, documentation links and diff hygiene pass.                                         |

## Conformance audit

Rows 1–10 cover compatibility, declarations, raw/manual descriptor safety,
normalization and diagnostics. Rows 11–17 cover all/any runtime truth,
evaluation schedule, sharing, actions/domain invariants and collection/M31
exclusions. Rows 18–22 cover independent targets, shared browser evidence,
packages/consumers and frozen closure. Every integer 1–22 appears exactly once
and no first evidence is deferred beyond its required delivery area.

## Decision

Cycle 2 passes all fifteen areas and all 22 rows with zero findings. Under
Ricard's accepted zero-finding/no-scope-expansion rule, SPEC-018 v0.1.0 may
become Accepted. Acceptance authorizes only PLAN-034 preparation and complete
review; no implementation, dependency, version, release, publication, Git or
external action is authorized.

## Verification

- Full cross-check against review 304 cycle 2, ADR-035/ADR-033/ADR-034 and
  SPEC-016/SPEC-017.
- Repository formatting, documentation links and `git diff --check` pass.
