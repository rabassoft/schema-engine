# PLAN-020 checkpoint 2 implementation review — Cycles 1–3

- **Date:** 2026-07-18
- **Plan:**
  [`PLAN-020 revision 0`](../plans/020-static-advanced-presentation-layout.md)
- **Scope:** Manual advanced-presentation definitions and runtime invariance
- **Authority:** SPEC-008 sections 8 and 11, PLAN-020 checkpoint 2
- **Outcome:** Cycle 3 passed all ten areas and the complete verification gate
  with zero findings

## Cycle 1 finding and correction

| ID       | Finding                                                                                                                                  | Correction                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| R105-F01 | The matrix covered every new kind-specific reason but did not directly exercise unsupported discriminants or accessor-backed exact keys. | Added existing-entry-reason cases and accessor proofs without invoking the getters. |

## Cycle 2 finding and correction

| ID       | Finding                                                                                                                                              | Correction                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| R105-F02 | Validator non-invocation covered all eight new reasons, but operation-logic non-invocation was explicit only for the historical missing-node reason. | Added a hostile managed-value getter to every new-reason operation case and proved it remains unexecuted. |

## Cycle 3 complete review

Cycle 3 restarted the complete review after both corrections:

1. **Authority and scope:** Pass. Only the shared Internal manual-definition
   validator, proportional core tests and package smoke changed. Public
   contracts, compiler output, Angular, Standard, manifests, versions and
   dependencies remain unchanged.
2. **Closed reasons:** Pass. Exactly the eight SPEC-008 reasons were added;
   existing section, entry, node-membership and cycle reasons retain their
   meaning.
3. **Shape and keys:** Pass. Exact discriminants, own data members, dense
   non-empty arrays, non-empty IDs, non-blank labels, bounded columns/spans and
   exact section/container/panel/item keys are validated without requiring
   frozen caller values.
4. **Identity namespaces:** Pass. Section/tabs/accordion/grid IDs share one
   first-occurrence namespace with later-kind-specific reasons; panel IDs are
   unique only within their direct owner.
5. **Paths and precedence:** Pass. Root, child, panel and grid-item numeric paths
   follow SPEC-008 exactly. Shape precedes key, key precedes duplicate identity,
   owners precede descendants and all structural defects precede missing-node
   membership.
6. **Safety and traversal:** Pass. Inspection is iterative and descriptor-safe,
   does not execute accessors, rejects sparse members, detects active cycles
   through panels/items and accepts a valid 1,500-level mixed forest.
7. **Runtime envelope:** Pass. Every new defect produces one frozen
   `INVALID_RUNTIME_OPTIONS` definition diagnostic and prevents validator/data
   inspection.
8. **Operation envelope:** Pass. Every new defect produces the exact
   `INVALID_FORM_DEFINITION` reason/path and prevents managed-value/effect
   logic from running.
9. **Runtime invariance:** Pass. Advanced layout leaves value, baseline,
   snapshots, validation input/issues, dirty/touched/focused state, scopes and
   primitive operations identical to default presentation.
10. **Collection and package regression:** Pass. Stable item identity and move
    semantics remain identical; the built package creates and disposes a
    runtime from compiled advanced presentation. The unrelated `angular.json`
    setting remains untouched.

## Verification

- Core build and strict typecheck pass.
- Scoped ESLint and Prettier pass.
- All 24 core test files pass: 444 tests.
- Built-package smoke passes with advanced runtime creation.
- Scoped `git diff --check` passes.

## Result

Cycle 3 has zero findings and no unresolved change request. PLAN-020 checkpoint
2 is complete. PLAN-020 remains Approved and active; checkpoint 3, base Angular
SPI and native containers, is the exact next action. No Public core contract,
manifest, version, dependency, Standard, external, commit or push action is
part of this checkpoint.
