# PLAN-028 checkpoint 4 review — Cycles 1–2

- **Date:** 2026-08-02
- **Scope:** Angular option forwarding, snapshot Signal, retry diagnostics,
  runtime recreation/destruction, declarations, package and consumer evidence
- **Outcome:** cycle 2 passed all ten areas with zero code findings; checkpoint
  4 is complete and checkpoint 5 is next

## Cycle 1 findings and corrections

| Finding                                                                                                                                                                    | Correction                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two new assertions treated complete snapshot field arrays as one-element partial arrays and failed despite correct issue projection.                                       | Assert root state and selected field issues independently without weakening order/path checks.                                                                             |
| An abandoned concurrent frozen install had left `node_modules` incomplete, while Angular builds launched inside Codex repeatedly deadlocked in esbuild before diagnostics. | Restore the exact frozen graph, verify Angular/package/consumer components independently, and obtain a successful operator-terminal production build with the same source. |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeats and passes:

1. transitive optional `asyncValidator` typing and exact unconfigured shape;
2. async-validator identity as a successful runtime-recreation trigger;
3. pending, settled and failed root state through the existing snapshot Signal;
4. directive retry forwarding and existing diagnostics output;
5. zero renderer ownership, output or scheduling changes;
6. replacement cancellation and silent old completion;
7. destruction cancellation, cleanup and silent late completion;
8. declaration/prototype and package-smoke coverage;
9. built-package configured and unconfigured consumer behavior; and
10. peer/export/dependency invariance, docs and diff hygiene.

All 15 Angular files and 131 tests, Angular typecheck/build, package smoke and
both built-consumer tests pass. The operator-terminal reference Angular
production build also passes with only the already-recorded initial-budget and
Ajv CommonJS warnings. Codex's combined workspace command can still trigger an
esbuild process deadlock, but each command component and the exact application
source build pass independently; this is recorded as an environment
observation, not a code failure. No renderer, Ajv, dependency, version,
release, commit, push or external publication state changed.

## Result

Zero code findings and no unresolved change request. Checkpoint 4 is complete.
The exact next action is PLAN-028 checkpoint 5 shared scenario and independent
Angular/Standard target integrations.
