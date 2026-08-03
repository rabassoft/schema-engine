# PLAN-028 checkpoint 2 review — Cycles 1–2

- **Date:** 2026-08-02
- **Scope:** synchronous gate, generation allocation, neutral cancellation,
  trigger/retry ordering, thenable assimilation and stale/disposed silence
- **Outcome:** cycle 2 passed all twelve areas with zero findings; checkpoint 2
  is complete and checkpoint 3 remains inactive

## Cycle 1 findings and corrections

| Finding                                                                                                                                              | Correction                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Delegating assimilation to `Promise.resolve(raw)` could read a hostile `then` getter a second time after core had already classified it.             | Capture `then` once and invoke that exact callable through a core-owned Promise, preserving asynchronous first-settlement reduction. |
| Releasing a completed generation cleared current listeners but still allowed later listeners to be retained forever on its non-cancelled capability. | Mark the controller released; later valid registrations return a no-op unsubscribe without retention or delivery.                    |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeats and passes:

1. synchronous-invalid initial block and zero async invocation;
2. initial generation 1 pending state and exact schema/value identities;
3. frozen runtime-local context and cancellation capability;
4. ordered cancellation, idempotent unsubscribe and callback throw isolation;
5. late cancelled registration and completed-generation release;
6. creation/update/retry trigger and non-trigger matrix;
7. atomic synchronous failure preserving active work;
8. replacement numbering, pending publication and old-result silence;
9. one-read hostile thenable assimilation and first-settlement ownership;
10. deferred throw/rejection/non-thenable/malformed outer failure states;
11. sync-invalid/disposal cancellation and post-disposal silence; and
12. maximum-safe-integer counter closure without a Public test hook.

The two async suites contribute seventeen tests; all 30 core files and 490
tests, typecheck, build, package smoke, formatting, 342-document/1,041-link
documentation and diff hygiene pass. Full issue/result normalization and
composed scope/node semantics remain checkpoint 3. No framework/environment/
core timer dependency, Ajv, Angular, Standard, dependency, version, release,
commit, push or external state changed.

## Result

Zero findings and no unresolved change request. Checkpoint 2 is complete. The
exact next action is PLAN-028 checkpoint 3 result normalization, issue
composition, snapshots, scopes, retry and disposal closure.
