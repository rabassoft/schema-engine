# PLAN-033 checkpoint 3 review

- **Date:** 2026-08-03
- **Scope:** Controlled M31 empty/remove semantics, ordered dirty state,
  validator issues, interaction, scopes and condition boundary; SPEC-017 rows
  17–21
- **Outcome:** Cycle 1 found one issue-assignment defect. After correction,
  cycle 2 repeated all twelve areas and rows 17–21 with zero findings.

## Cycle 1 finding and correction

1. Synchronous issue assignment treated every first numeric segment as an M10
   collection address, so an issue at `['roles', 0]` warned as unmanaged and
   became global. Numeric and deeper paths now fall back to the exact outer M31
   field while M10 collection routing remains unchanged.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                        | Result | Evidence                                                                                                                                                           |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Missing, empty and controlled intentions | Pass   | Missing and present `[]` remain distinct; selection to none emits frozen `set-value []` and never mutates the confirmed snapshot optimistically.                   |
| 2. Explicit clear/remove                    | Pass   | Remove is no-effect only when absent/blocked and emits for every present value, including empty, required, validator-invalid and basic-incompatible values.        |
| 3. Ordered dense-string dirty               | Pass   | Presence, empty, order, equal references, equal copies and duplicate arrays follow ordered `Object.is` string equality exactly.                                    |
| 4. Incompatible dirty fallback              | Pass   | Sparse and non-string data use presence plus external-value `Object.is`; no coercion, repair, assertion or in-place detection is added.                            |
| 5. Immutable external reconciliation        | Pass   | Immutable replacements validate once, schedule accepted behavior and emit at most one snapshot; baseline-only updates skip validation and retain interaction.      |
| 6. Validator authority                      | Pass   | Sync/async validators receive the original schema/value and remain sole owners of required, type, enum, uniqueness and other assertions.                           |
| 7. Issue assignment                         | Pass   | Array, numeric, deep and out-of-range issues attach to the one field in validator order with no warning, item snapshot or synthetic issue.                         |
| 8. Async issue composition                  | Pass   | Numeric/deep asynchronous issues settle on the same field under the accepted generation, cancellation and visibility lifecycle.                                    |
| 9. Field interaction                        | Pass   | M31 uses one ordinary focus/touched target; numeric and M10 item intentions remain unknown/invalid and never create per-choice state.                              |
| 10. Runtime scopes                          | Pass   | The ordinary field scope includes every assigned issue; show/reset behavior is field-level and numeric partial scopes warn as unknown.                             |
| 11. Baseline scopes and conditions          | Pass   | Scope confirmation replaces the array atomically at the field path, rejects numeric targets, and snapshots always expose exact `visible: true`/`enabled: true`.    |
| 12. Checkpoint and regression boundary      | Pass   | Texts, renderers and scenarios remain inactive until later checkpoints; primitive/nested/collection/fixed/default/condition/async behavior and package graph pass. |

## Decision

Cycle 2 passes completely with zero findings. PLAN-033 checkpoint 3 is complete
for SPEC-017 rows 17–21. Checkpoint 4 may begin; this does not activate the
Standard scenario, packages, dependency, version, release or Git work.

## Verification

- Repository ESLint, Prettier, documentation and diff hygiene.
- Core typecheck and build.
- Focused M31/runtime/operation/async/scope/condition regressions: 10 files and
  212 tests.
- Complete core regression: 46 files and 767 tests.
- Workspace typechecks, including Angular, Angular Aria, validator, scenarios
  and both reference applications.

No dependency, manifest, lockfile, package/version, release, publication,
commit, push or external action changed.
