# PLAN-032 checkpoint 3 review

- **Date:** 2026-08-03
- **Scope:** Controlled runtime flags, focus reconciliation and direct action
  safety; SPEC-016 rows 15–20
- **Outcome:** Cycle 1 found two implementation/evidence defects. After
  correction, cycle 2 repeated all twelve areas and rows 15–20 with zero
  findings.

## Cycle 1 findings and corrections

1. The runtime-conformance fixture generator's nested object definition had
   fallen behind the accepted presentation contract, so regenerating fixtures
   replaced three valid nested cases with unrelated definition failures. The
   generator now includes the same nested presentation projection as the
   executable conformance suite, and all thirteen fixtures reproduce valid
   expected snapshots with required true defaults.
2. Initial focused evidence did not independently prove mutable manual-
   definition detachment, the complete non-value evaluation schedule, unchanged
   flag sharing, all four disabled/active action paths, missing-remove ordering,
   fully frozen diagnostics or atomic focus notification. The focused suite now
   closes those gaps together with fixed/item constants and unchanged domain,
   validation, issue, scope and operation behavior.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                   | Result | Evidence                                                                                                                                                          |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Required snapshot contract          | Pass   | Every ordinary field exposes required booleans; fixed enabled and collection-item visible/enabled defaults are exact true constants.                              |
| 2. Detached runtime inputs             | Pass   | Runtime copies valid manual conditions and source paths before user validation; later caller mutation cannot change evaluation.                                   |
| 3. Exact matching semantics            | Pass   | Presence plus `Object.is` covers missing/blocked/null/false/zero/empty string and distinguishes `-0` from zero without assertion revalidation.                    |
| 4. Controlled evaluation schedule      | Pass   | Initial and accepted new value-reference scans are exact; same-reference, baseline, locale, visibility, touched, scope and async transitions reuse state.         |
| 5. Linear callback-free boundary       | Pass   | Evaluation is one synchronous field-order scan over detached predicates with no callback, operation, diagnostic, graph or cache.                                  |
| 6. Structural sharing                  | Pass   | Unchanged presence/issues/interaction/flags retain field and unrelated branch identity; flag changes rebuild only required ancestors.                             |
| 7. Atomic focus reconciliation         | Pass   | Hidden/disabled transitions clear focus in the value update, preserve touched, notify only the reconciled snapshot, emit no operation and never restore focus.    |
| 8. Direct action ordering              | Pass   | Set compatibility and incompatible ancestors precede the gate; hidden then disabled precede no-effect, mutation and operation construction.                       |
| 9. Exact inactive diagnostic           | Pass   | All four actions return the closed runtime envelope, exact path/action/reason/fallback, no document path and fully frozen result graph.                           |
| 10. Active and collection behavior     | Pass   | Active set/remove/focus/blur retain accepted success effects; item-relative actions remain unchanged with constant item flags.                                    |
| 11. Domain and validation invariants   | Pass   | Controlled values, baseline-derived dirty, scopes, schema identity, sync/async lifecycle, issues, visibility, operations and static layout remain authoritative.  |
| 12. Downstream and deferred boundaries | Pass   | Only required true-default snapshot fakes/fixtures migrate; Angular/Standard hidden/disabled projection, packages, versions, dependencies and release stay later. |

## Decision

Cycle 2 passes completely with zero findings. PLAN-032 checkpoint 3 and
SPEC-016 rows 15–20 are complete. Checkpoint 4 may begin; Standard/shared
scenario, package/version, release and Git behavior remain inactive.

## Verification

- Prettier and ESLint for touched core/runtime/fixture and downstream fake
  files.
- Core typecheck and build.
- Focused conditional-runtime suite: 1 file and 20 tests.
- Complete core regression: 43 files and 718 tests, including all async,
  scope-baseline, default-candidate, collection and presentation regressions.
- Angular package typecheck/build and complete unit regression: 15 files and
  131 tests; scenario, Standard and Angular application typechecks pass.
- Thirteen runtime-conformance fixtures reproduce with required booleans.
- `pnpm docs:check`, `pnpm format:check` and `git diff --check`.

No manifest, lockfile, dependency, package/version, release, publication,
commit, push or external action changed.
