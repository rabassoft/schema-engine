# PLAN-033 checkpoint 1 review

- **Date:** 2026-08-03
- **Scope:** Public M31 definition, complete compiler/schema/UI contract and
  mechanical exhaustive-union adaptations; SPEC-017 rows 1–9
- **Outcome:** Cycle 1 found four implementation/evidence defects. After
  correction, cycle 2 repeated all twelve areas and rows 1–9 with zero
  findings.

## Cycle 1 findings and corrections

1. The initial union widening left existing Angular text, Standard control and
   two test consumers assuming every `FieldDefinition` exposed primitive-only
   members. The mechanical adaptations now explicitly exclude M31 from those
   behaviors; no runtime or target M31 implementation is activated early.
2. A malformed `items` exterior with the exact safe M31 marker first entered
   the M10 catalog and emitted stale `uniqueItems`/policy-family evidence. It
   now uses only the M31 `string-enum item schema` exterior envelope, preserves
   independently safe common metadata diagnostics and stops all derived
   unique/enum/label work.
3. A safely inspectable but unclassifiable direct `items.type` could still emit
   a derived `uniqueItems` diagnostic. That marker is now suppressed until the
   object-M10 or string-M31 family is safely selected, while the accepted item
   type and M10 compatibility diagnostics remain intact.
4. The first evidence pass omitted explicit item `$ref`/`const`, matched-policy
   non-consumption, accessor `items`, shared/cyclic opaque extras and M31-as-
   condition-source cases. Focused tests and two conformance fixtures now close
   those gaps without expanding behavior.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                        | Result | Evidence                                                                                                                                                                   |
| ------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Public definition and root export        | Pass   | Exact `StringEnumArrayFieldDefinition` Omit shape, `nullable: false`, choices and `FieldDefinition` branch are emitted from the existing core root.                        |
| 2. Leaf/template/collection boundary        | Pass   | The new branch is one ordinary node/field leaf; `FieldTemplate` and `ArrayNodeDefinition` remain unchanged and no M10 identity/item operation is introduced.               |
| 3. Valid locations and provenance           | Pass   | Direct, nested, local-reference and disjoint object-composition use sites preserve exact data/document paths and reference chains.                                         |
| 4. Root/template/type exclusions            | Pass   | Root arrays, arrays below item templates, nested arrays, nullable/free/non-string/item-reference forms remain blocked before unsupported traversal.                        |
| 5. Detached family classification and M10   | Pass   | Safe object/string selection is exact; malformed M10 expected/policies remain stable and M31 never consumes a collection policy.                                           |
| 6. Required `uniqueItems: true`             | Pass   | Missing/inherited-equivalent, accessor, non-enumerable, false and malformed values use the exact safe envelope; only false retains `actualValue`.                          |
| 7. Required item enum                       | Pass   | Missing/accessor/empty/sparse/non-string/duplicate/blank values follow ADR-011 paths, ascending order and accessor non-invocation.                                         |
| 8. Outer/item catalogs and branch stopping  | Pass   | Supported, incompatible, unsupported, ignored and opaque keywords retain distinct field types, ordering and no derived work below unclassified branches.                   |
| 9. UI Schema and enum labels                | Pass   | Complete/partial/unknown/malformed/blank labels retain choice order, visible blank fallback, failure isolation and no caller identity.                                     |
| 10. Conditions and incompatible UI          | Pass   | Placeholder/options/item/order/fields diagnostics are exact; both M31 target members use ADR-033 `unsupported-target-location`, and M31 sources remain arrays.             |
| 11. Immutability, cycles and atomic failure | Pass   | Paths/choices/entries are detached and deeply frozen; opaque sharing/cycles are not traversed or retained; every error returns no definition.                              |
| 12. Checkpoint and delivery boundaries      | Pass   | Runtime/manual/operations/texts/renderers/scenarios/packages remain inactive except compile-only exclusions; manifests, lockfile, versions, release and Git are unchanged. |

## Decision

Cycle 2 passes completely with zero findings. PLAN-033 checkpoint 1 is complete
for SPEC-017 rows 1–9. Checkpoint 2 may begin; this does not activate later
runtime state, target, package, dependency, version, release or Git behavior.

## Verification

- Prettier and ESLint for touched source/tests.
- Core typecheck and build.
- Focused M31/conformance/collection suites: 3 files and 82 tests.
- Complete core regression: 44 files and 731 tests.
- Workspace typechecks, including Angular, Angular Aria, validator, scenarios
  and both reference applications.
- Exact generated declaration/root-export inspection.
- `pnpm docs:check`, `pnpm format:check` and `git diff --check`.

No dependency, manifest, lockfile, package/version, release, publication,
commit, push or external action changed.
