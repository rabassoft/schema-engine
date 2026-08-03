# PLAN-028 checkpoint 3 review — Cycles 1–2

- **Date:** 2026-08-02
- **Scope:** async result normalization, issue composition and assignment,
  root/node/scope projection, structural sharing, retry and disposal closure
- **Outcome:** cycle 2 passed all fifteen areas with zero findings; checkpoint
  3 is complete and checkpoint 4 is next

## Cycle 1 findings and corrections

| Finding                                                                                                                                                                                     | Correction                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Nested arrays and records in async issue `parameters` remained owned by the validator after the top-level record was copied.                                                                | Add descriptor-safe recursive async-only copying, freeze every accepted container and reject hostile/cyclic containers as `invalid-result`. |
| An unscoped configured `ValidationSnapshot` used only the explicit sync/async booleans and could report true while the root snapshot was false because a settled result contained an issue. | Mirror the current root snapshot validity for configured runtimes while preserving the exact legacy unconfigured calculation.               |
| A throwing proxy descriptor trap could escape async normalization instead of closing the current generation as `invalid-result`.                                                            | Contain the complete normalization boundary and reduce hostile descriptor exceptions to the closed failure state without diagnostics.       |
| Applying recursive copying through the shared issue normalizer would have changed synchronous normalization despite SPEC-012's compatibility boundary.                                      | Keep the existing synchronous normalizer unchanged and perform the stronger detachment only in the async-result boundary.                   |
| Active roadmap/index onboarding text still described M26 implementation as inactive after its first three checkpoints.                                                                      | Reconcile active project, package and onboarding documents to completed core checkpoint 3 and exact Angular checkpoint 4.                   |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeats and passes:

1. descriptor-safe outer-result classification and explicit boolean validity;
2. every existing malformed issue category, sparse arrays and hostile members;
3. detached/frozen results, issues, paths and recursive parameter containers;
4. global, exact, deeper-object, positional and invalid-identity assignment;
5. sync-first source order, async source order, no dedupe and replacement removal;
6. explicit false/no-issue and true/with-issue root semantics;
7. blocked, pending, settled and failed root/node projection;
8. unscoped, valid scoped and invalid scoped state/validity projection;
9. existing touched/all and forced-scope visibility behavior for async issues;
10. state-only sharing, affected ancestor rebuilding and sibling reuse;
11. retry success, unavailable reasons, issue clearing and generation behavior;
12. disposal precedence, retained final read and silent late completion;
13. declaration/root-export and package-smoke coverage;
14. exact unconfigured compatibility and framework/environment neutrality; and
15. formatting, documentation consistency and diff hygiene.

All 31 core files and 516 tests, typecheck, build, package smoke, formatting,
documentation links and diff hygiene pass. No Ajv, Angular, Standard,
dependency, version, release, commit, push or external state changed.

## Result

Zero findings and no unresolved change request. Checkpoint 3 is complete. The
exact next action is PLAN-028 checkpoint 4 Angular projection.
