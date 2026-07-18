# PLAN-020 checkpoint 1 implementation review — Cycles 1–3

- **Date:** 2026-07-18
- **Plan:**
  [`PLAN-020 revision 0`](../plans/020-static-advanced-presentation-layout.md)
- **Scope:** Core contracts, compiler and conformance fixtures only
- **Authority:** SPEC-008 sections 4–7 and PLAN-020 checkpoint 1
- **Outcome:** Cycle 3 passed all ten areas and the complete verification gate
  with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                         | Correction                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| R104-F01 | The focused suite covered every reason family but did not explicitly prove combined deterministic order and no duplicate precedence reason.     | Added exact ordered warning/error-path evidence plus empty-array and grid-child precedence assertions.                   |
| R104-F02 | Source-level tests proved the root exports, but the built-package smoke did not exercise advanced presentation through the package entry point. | Added a compile-only package smoke covering normalized tabs, exact key, presented-node identity and frozen panel arrays. |

## Cycle 2 finding and correction

| ID       | Finding                                                             | Correction                                                                                 |
| -------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| R104-F03 | Two new nested asymmetric assertions violated the strict lint gate. | Replaced them with typed diagnostic projections, then restarted the complete verification. |

## Cycle 3 complete review

Cycle 3 restarted the complete review after all corrections:

1. **Authority and scope:** Pass. The diff implements only SPEC-008 sections
   4–7 and PLAN-020 checkpoint 1; runtime/manual definitions, Angular,
   Standard, manifests, versions and dependencies remain unchanged.
2. **Public inventory:** Pass. The thirteen exact new core symbols are exported
   and only `UiPresentationEntry`, `PresentationEntryDefinition` and
   `TextResolutionContext` are widened.
3. **Descriptor safety and traversal:** Pass. Containers, panels and grid items
   use own enumerable data descriptors, do not execute accessors, traverse
   iteratively, detect active cycles and permit reuse outside active ancestry.
4. **Grammar and diagnostics:** Pass. Tabs, accordion, panel and grid member
   order, all twenty-four new closed reasons, exact expectations, parameters,
   paths, safe values and later-occurrence identity diagnostics match SPEC-008.
5. **Order and precedence:** Pass. Parent known members and unknown keys,
   descendant source order, empty-array precedence, bounded span precedence,
   ordinary child entry dispatch and missing-node order are deterministic and
   explicitly tested.
6. **Normalization and identity:** Pass. Exact container, panel and item keys,
   default span, source order, new wrapper objects/arrays and exact
   `definition.nodes` object identity are preserved.
7. **Immutability and fallback:** Pass. The complete result is deeply frozen;
   invalid authored presentation is discarded atomically for the accepted
   default forest while independent safe warnings remain.
8. **Hostile inputs:** Pass. Accessor, sparse, cycle, reuse, 1,500-level depth,
   prototype-sensitive ID, whitespace, lone-surrogate and malformed-value
   cases pass without retained caller values.
9. **Fixtures and package surface:** Pass. Serializable valid/invalid fixtures,
   root import type assertions, emitted declarations and built-package smoke
   cover the new surface without adding an entry point or package mutation.
10. **Regression and dirty-worktree safety:** Pass. All core tests pass; the
    unrelated `angular.json` analytics setting and pre-checkpoint M18
    documentation changes remain untouched. No external action, dependency,
    commit or push occurred.

## Verification

- Core build and strict typecheck pass.
- Scoped ESLint and Prettier pass.
- All 23 core test files pass: 429 tests.
- Built-package smoke passes, including advanced presentation compilation.
- Emitted declarations contain the new Public contracts.
- Scoped `git diff --check` passes.

## Result

Cycle 3 has zero findings and no unresolved change request. PLAN-020 checkpoint
1 is complete. PLAN-020 remains Approved and active; checkpoint 2, manual
definition validation and runtime invariance, is the exact next action. No
manifest, version, dependency, Angular, Standard, external, commit or push
action is part of this checkpoint.
