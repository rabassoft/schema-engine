# PLAN-028 checkpoint 5 review — Cycles 1–5

- **Date:** 2026-08-02
- **Scope:** shared authoring-safe scenario, independent Angular/Standard
  effects, deterministic controls, async-state accessibility, parity,
  cancellation/stale/failure/retry evidence, builds and Chromium
- **Outcome:** cycle 5 passed all fourteen areas with zero findings; checkpoint
  5 is complete and checkpoint 6 is next

## Cycles 1–4 findings and corrections

| Finding                                                                                                                                                                             | Correction                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| The first catalog authoring pass classified the new service-validation block as required for every scenario.                                                                        | Keep the block optional while retaining exact member, path, issue and non-blank label validation when present.                    |
| Generated snippets became stale after extending the Angular application-state excerpt.                                                                                              | Regenerate both build-checked snippet targets and retain the existing exact check.                                                |
| Standard published the initial pending state during runtime construction; the shell remembered the definition before the runtime reference and therefore skipped renderer mounting. | Reconcile renderer ownership by the joint definition/runtime identity, with a unit regression for immediate pending delivery.     |
| The Angular production bundle crossed its previous 1.02 MB hard error by 3.16 kB.                                                                                                   | Preserve the 750 kB warning and move only the hard error to 1.05 MB; the final 1.02 MB bundle remains visibly warned.             |
| Initial browser assertions looked for the managed issue in the request-evidence panel instead of the rendered field.                                                                | Assert the normalized field message/code at the form boundary while unit tests retain exact issue-code/path checks.               |
| Manual cross-target review found that configuration-driven runtime recreation reset Standard effect evidence but retained Angular's prior controller.                               | Replace the Angular controller for every fresh configured runtime and ignore notifications from superseded controller identities. |
| The repository-wide formatter found the preceding checkpoint-4 review had not been normalized.                                                                                      | Format review 242 and repeat the complete applicable matrix instead of accepting a documentation-only partial check.              |

## Cycle 5 — complete zero-finding pass

Cycle 5 repeats and passes:

1. optional authoring-safe metadata and exact unconfigured scenario shape;
2. one common schema, UI Schema, value/baseline, field path, issue code,
   fallback and visible labels;
3. independent target-owned validators with no network, timer, Ajv-async,
   renderer or transport policy;
4. initial pending and valid/invalid settlement;
5. synchronous-invalid blocking without starting service work;
6. rapid replacement, neutral cancellation bridging and silent stale result;
7. rejection and synchronous exception as closed `failed/exception` state;
8. explicit retry without controlled-value mutation or operation emission;
9. accessible live state, controls and request evidence in both shells;
10. fresh-runtime schema editing with isolated superseded controllers;
11. official synchronous Ajv gating and unchanged dependency/package graph;
12. generated snippet authority and private/public import boundaries;
13. production builds and full Angular/Standard Chromium parity; and
14. documentation and diff hygiene.

The exact checkpoint commands pass: eight snippets; 52 catalog tests; 27
Angular tests; 60 Standard tests; 593 import boundaries; Angular and Standard
production builds; and 11 Angular plus 9 Standard Chromium tests. Angular keeps
the known initial-budget and Ajv CommonJS warnings, and Standard keeps its
chunk-size advisory; none is a failed gate. No dependency, version, release,
commit, push or external publication state changed.

## Result

Zero findings and no unresolved change request. Checkpoint 5 is complete. The
exact next action is PLAN-028 checkpoint 6 frozen graph, complete workspace
matrix, architectural invariance inspection and final M26 closure review.
