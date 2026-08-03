# SPEC-016 v0.1.1 complete revision review — Cycle 1

- **Date:** 2026-08-03
- **Document:**
  [SPEC-016 v0.1.1](../specs/016-controlled-conditional-primitive-field-state.md)
- **Authority:** Ricard's explicit C-002 decision; Accepted ADR-033 revision 0;
  SPEC-001–SPEC-015; D-018/review 279
- **Scope:** Reconcile only the sparse/non-enumerable path-index diagnostic
  contradiction discovered during PLAN-032 checkpoint 1
- **Outcome:** Cycle 1 repeats all seventeen contract areas and 24 conformance
  rows with zero findings and no unresolved change request.

## Accepted correction

SPEC-016 v0.1.0 simultaneously required
`condition-member-invalid.actualType` in its discriminated union and required
missing/sparse cases to omit that member. Ricard accepted the recommended exact
resolution:

- sparse or non-enumerable path indices use
  `reason: 'condition-member-invalid'` without `actualType`;
- indexed accessors retain `reason: 'condition-member-accessor'` without
  `actualType`;
- present invalid index values retain their exact safe `actualType`; and
- the union makes only `condition-member-invalid.actualType` optional so no
  other diagnostic shape changes.

This is a diagnostic-shape correction, not new behavior, architecture or
scope.

## Complete review matrix

| Area                                        | Result | Evidence                                                                                                                                                           |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Promotion and scope                      | Pass   | Only the bounded ordinary primitive equality slice remains active; no expression, graph, collection-template or conditional-validation behavior changed.           |
| 2. Public authoring and definitions         | Pass   | The two types, optional authoring/definition members and template omission remain unchanged.                                                                       |
| 3. Raw descriptor grammar                   | Pass   | Missing/non-enumerable, accessor and present-invalid path indices now have mutually consistent exact shapes; all other condition/path/literal rules remain closed. |
| 4. Target/source/literal eligibility        | Pass   | Ordinary/fixed/unsupported locations, absolute sources and kind/nullability rules are unchanged.                                                                   |
| 5. Compiler phase and stopping              | Pass   | Existing diagnostics, detached shape inspection, safe target/link phases and atomic failure order remain unchanged.                                                |
| 6. Compiler diagnostics                     | Pass   | One optional safe metadata member resolves C-002 without changing code, reason, severity, paths, expectations, fallback, warning order or frozen retention.        |
| 7. Normalization/template omission          | Pass   | Copy/freeze/no-retention and collection-template exclusions are unchanged.                                                                                         |
| 8. Manual-definition diagnostics            | Pass   | Its already-optional `actualType` and hostile path metadata remain consistent; no manual reason or wrapper member changes.                                         |
| 9. Runtime predicate schedule               | Pass   | Presence, `Object.is`, immutable value-reference scheduling and no-graph semantics are unaffected.                                                                 |
| 10. Snapshots/focus/action safety           | Pass   | Required flags, sharing, focus reconciliation and hidden/disabled precedence are unaffected.                                                                       |
| 11. Validation/data/scope/layout invariants | Pass   | Value, baseline, dirty, validators, issues, scopes, defaults and static presentation remain unchanged.                                                             |
| 12. Angular target                          | Pass   | Mounted visibility, enabled accessibility, custom safety and reconciliation contracts are unaffected.                                                              |
| 13. Standard/shared evidence                | Pass   | Independent DOM behavior and the shared typed scenario remain unchanged.                                                                                           |
| 14. Collections and wider D-018             | Pass   | Item flags remain constant true and every wider conditional capability stays Deferred.                                                                             |
| 15. Public/Internal/package inventory       | Pass   | No symbol, package, export map, dependency, version or release boundary changed.                                                                                   |
| 16. Conformance ownership                   | Pass   | All 24 rows remain complete; row 4 now has one implementable exact sparse-index expectation and PLAN-032 ownership is unchanged.                                   |
| 17. Documentation and delivery gates        | Pass   | v0.1.1 history, indexes/current state, review links and no-release/Git gates are reconcilable without source-scope expansion.                                      |

## Decision

Cycle 1 is a complete zero-finding pass. SPEC-016 v0.1.1 is Accepted and
supersedes only v0.1.0's contradictory `actualType` requirement. PLAN-032 must
reference v0.1.1 before checkpoint 1 resumes.

## Verification

- Prettier, `pnpm docs:check` and `git diff --check`.
- Targeted stale-version/C-002 search.
- No source, package, dependency, manifest, lockfile, release, commit, push or
  external mutation belongs to this contract correction.
