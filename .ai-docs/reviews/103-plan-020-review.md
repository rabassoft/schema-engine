# PLAN-020 complete review — Cycles 1–2

- **Date:** 2026-07-18
- **Document:**
  [`PLAN-020 revision 0`](../plans/020-static-advanced-presentation-layout.md)
- **Authority:** accepted SPEC-008 v0.1.0, ADR-023 revision 1 and ADR-024
  revision 1
- **Outcome:** Cycle 2 passed all fourteen areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                          | Correction                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| R103-F01 | The dependency checkpoint named an equivalent mutation but did not fix the command, importer or lock scope.      | Fixed one pilot-filtered exact Aria/CDK 22.0.5 command with scripts disabled and the expected single-importer lock graph.     |
| R103-F02 | Standard text evidence could be read as implementing Angular's Public text-failure diagnostic.                   | Limited Standard to application-local source fallback/order and made the Angular diagnostic explicitly inapplicable.          |
| R103-F03 | Existing `0.2.0` artifact scripts could be mistaken for evidence of the new private `0.3.0`/`0.1.0` lines.       | Retained them as baseline regressions and required separate parameterized local candidate checks without release retargeting. |
| R103-F04 | Only the first dependency install was marked as an external gate although latest-consumer registry work also is. | Added checkpoint 7 and frozen-install cache-miss gates and required execution approval for every registry/network action.     |

## Cycle 2 complete review

Cycle 2 restarted the complete review after all four corrections:

1. **Authority and gate:** Pass. The plan implements only accepted SPEC-008 and
   does not reopen ADR-023/024; approval is distinct from external/network and
   release actions.
2. **Scope and sequencing:** Pass. Eight bounded checkpoints order neutral core,
   runtime invariance, base Angular/native, Standard/reference, package graph,
   pilot, consumers and final review without circular prerequisites.
3. **Public migration:** Pass. Thirteen core additions, three widened unions and
   nine base Angular additions are exact, Experimental and exhaustively bounded;
   no unlisted API or entry point is admitted.
4. **Compiler and safety:** Pass. Descriptor safety, iterative traversal,
   diagnostics, precedence, identity, keys, immutability and atomic fallback
   map directly to SPEC-008 sections 5–7.
5. **Runtime ownership:** Pass. Manual-definition reasons and non-invocation are
   complete while value, baseline, snapshots, validation, operations, scopes,
   issues and collection identity stay unchanged.
6. **Angular SPI and native fallback:** Pass. Registration copying/validation,
   selection, claims, native order, text, exact IDs, state, mounted lifecycle,
   host failures, cleanup and no selected-host retry are all checkpointed.
7. **Standard independence:** Pass. Standard consumes only core, owns DOM/state/
   local text behavior and shares only scenario data/copy/evidence with Angular.
8. **Pilot behavior:** Pass. Exactly one package uses Aria tabs selectively and
   native section/accordion/grid while preserving the neutral interaction and
   accessibility contract.
9. **Package and theme isolation:** Pass. Root/style exports, six-property opt-in
   CSS, no JS side effect, app-owned themes, peer ownership and zero base/core
   leakage are explicitly verified.
10. **Compatibility and versions:** Pass. Private core/base `0.3.0`, pilot
    `0.1.0`, Angular 22.0.6, Aria/CDK 22.0.5 and lower/latest clean-consumer
    evidence are exact without mutating published `0.2.0` artifacts.
11. **Conformance:** Pass. All twenty-two SPEC-008 rows map to checkpoints and
    require named evidence; native success cannot waive a pilot failure.
12. **Verification and persistence:** Pass. Focused/full tests, packages,
    consumers, both browsers, repeated reviews and STATUS/WORKLOG updates are
    required at every applicable gate.
13. **Deferred and external boundaries:** Pass. Broader layout, UI kits,
    frameworks, Stable promotion, publication and external systems remain out;
    network actions, commit and push retain separate authorization.
14. **Dirty-worktree and documentation safety:** Pass. The expected diff is
    bounded, existing release candidates remain untouched and the unrelated
    `angular.json` analytics setting remains outside the plan.

## Result

Cycle 2 has zero findings and no unresolved change request. Under Ricard's
standing authorization for documents that complete a full zero-finding review
without broadening accepted scope, PLAN-020 revision 0 is Approved for
checkpoints 1–8. Implementation has not started. Checkpoints 5 and 7 still stop
before their separately authorized network actions; publication, external
settings, commit and push remain unauthorized.
