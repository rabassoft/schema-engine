# PLAN-032 checkpoint 2 review

- **Date:** 2026-08-03
- **Scope:** Two-phase manual `FormDefinition` condition validation;
  SPEC-016 row 14
- **Outcome:** Cycle 1 found three implementation/evidence defects. After
  correction, cycle 2 repeated all twelve areas and row 14 with zero findings.

## Cycle 1 findings and corrections

1. Captured target records used ordinary optional properties, so an inherited
   `Object.prototype.visibleWhen` could be mistaken for an own template
   condition during the later phase. Capture records now own both optional
   slots explicitly, and inherited field/template members remain absent.
2. The first runtime-wrapper mapping exposed linked literal metadata through
   both the shape namespace and the required linked-literal namespace. Mapping
   now emits only `definitionExpected`/`definitionActualType` for literal
   incompatibility and only `definitionConditionExpected`/
   `definitionConditionActualType` for shape defects.
3. Initial tests did not close all hostile shape metadata, template direct/
   runtime locators, field/member semantic order or non-invocation boundaries.
   The focused suite now covers all five reasons, exact paths/metadata, base
   precedence, inherited/non-enumerable/accessor behavior and atomic stopping.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                   | Result | Evidence                                                                                                                                        |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Shared validation boundary          | Pass   | Runtime creation, direct/collection operations and existing definition consumers use the same collection-definition validator.                  |
| 2. Existing base precedence            | Pass   | All accepted node/template/projection/presentation checks complete first; their first defect precedes every condition defect.                   |
| 3. Descriptor-safe capture             | Pass   | Own data/accessor conditions are captured without invocation; inherited members are absent and non-enumerable own ordinary members participate. |
| 4. Complete hostile shape              | Pass   | Exterior, sourcePath, equals, dense/index/extra-key and safe actual metadata are detached exactly; no hostile value is retained.                |
| 5. Two-phase linking                   | Pass   | Semantic target/source/literal checks run only after complete base and condition-shape validity against the exact ordinary-field projection.    |
| 6. Five exact reasons                  | Pass   | Invalid shape, unsupported template field, fixed target, unmanaged source and incompatible literal each use the closed reason family.           |
| 7. Source and literal semantics        | Pass   | Ordinary/object/array/below-collection/unmanaged classification plus kind/nullability, integer and strict primitive semantics are exact.        |
| 8. Deterministic ordering              | Pass   | Definition field order and `visibleWhen` before `enabledWhen` are proven; template traversal remains deterministic.                             |
| 9. Direct diagnostic mapping           | Pass   | `INVALID_FORM_DEFINITION` uses exact ordinary/template locators, member/detail keys, copied paths and frozen parameters.                        |
| 10. Runtime wrapper mapping            | Pass   | `INVALID_RUNTIME_OPTIONS` uses exact namespaced one-to-one details plus unprefixed locators and no inapplicable members.                        |
| 11. Atomic non-invocation              | Pass   | Invalid definitions prevent controlled-value traversal and validator invocation; no runtime/listener/target mutation or operation occurs.       |
| 12. Regression and deferred boundaries | Pass   | Nullable/fixed/collection/presentation/scope regressions pass; snapshot/action/adapter/package/release behavior remains later.                  |

## Decision

Cycle 2 passes completely with zero findings. PLAN-032 checkpoint 2 and
SPEC-016 row 14 are complete. Checkpoint 3 may begin; Angular, Standard,
package/version, release and Git behavior remain inactive.

## Verification

- Prettier and ESLint for touched validation/runtime/operation source and tests.
- Core typecheck and build.
- Focused manual-definition suite: 1 file and 17 tests.
- Nullable/fixed/collection/presentation/scope regression: 8 files and 104
  tests.
- Complete core regression: 42 files and 698 tests.
- `pnpm docs:check`, `pnpm format:check` and `git diff --check`.

No manifest, lockfile, dependency, package/version, release, publication,
commit, push or external action changed.
