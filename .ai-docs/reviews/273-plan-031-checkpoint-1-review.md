# PLAN-031 checkpoint 1 review

- **Date:** 2026-08-03
- **Scope:** Public helper foundation and direct primitive defaults; SPEC-015
  conformance rows 1–7
- **Outcome:** Cycle 1 found two implementation defects. After correction,
  cycle 2 repeated all eleven areas and rows 1–7 with zero findings.

## Cycle 1 findings and corrections

1. Hostile root prototype reflection was reported as `invalid-value` rather
   than `inspection-failed`. Root classification now distinguishes a safe
   incompatible value from a thrown inspection trap for schema and data.
2. A blocking compiler error returned before an independently inspectable
   malformed direct default was collected. Failure now performs a guarded raw
   direct-default preflight and appends its immutable diagnostic. The final
   cross-family ordering remains checkpoint-3 row 17 ownership.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                             | Result | Evidence                                                                                                                              |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Public signature              | Pass   | Exact root export reuses `ApplyOperationResult<TData>` and introduces no type/options/package change.                                 |
| 2. Root/dialect gates            | Pass   | Ordinary/hostile schema and data roots plus canonical/missing/unsupported dialect behavior are covered.                               |
| 3. Direct traversal              | Pass   | Root primitive properties derive in schema order; nested/reference/composition behavior is not claimed.                               |
| 4. Default descriptors           | Pass   | Own enumerable data applies, non-enumerable is absent and enumerable accessors are never invoked.                                     |
| 5. Primitive/null matrix         | Pass   | String, finite number/integer, boolean, nullable null, empty/false/zero/-0 and all incompatible families are exact.                   |
| 6. Validator ownership           | Pass   | Pattern/minLength conflicts do not block a basic-kind-compatible default; no validator is invoked.                                    |
| 7. Presence/no-effect            | Pass   | Every own data value wins, accessors fail, missing inserts and no-effect returns exact identity.                                      |
| 8. Atomic diagnostics            | Pass   | Invalid defaults collect atomically with frozen result/paths/parameters and exact original root on failure.                           |
| 9. Reconstruction                | Pass   | Direct insertion clones once, preserves null prototype/descriptors/unmanaged references and uses ordinary target descriptors.         |
| 10. Regression matrix            | Pass   | Core typecheck/build, 38 files and 624 tests, focused 12 tests, lint, docs and diff hygiene pass.                                     |
| 11. Deferred checkpoint boundary | Pass   | Nested materialization is checkpoint 2; arrays/references/composition/final ordering are checkpoint 3; package/adapters remain later. |

## Decision

Cycle 2 passes completely with zero findings. PLAN-031 checkpoint 1 is complete
for rows 1–7. This does not claim rows 8–21 or authorize release/Git actions.

## Verification

- Prettier and ESLint for touched core files.
- Core typecheck and build.
- Focused 12 tests and complete 38-file/624-test core suite.
- `pnpm docs:check` and `git diff --check`.

No manifest, lockfile, dependency, version, release, publication, commit, push
or external action changed.
