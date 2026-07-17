# PLAN-018 checkpoint 2 review — Cycles 1–2

- **Date:** 2026-07-17
- **Scope:** Controlled Standard application ownership, operation decisions and
  idempotent runtime/subscription lifecycle
- **Authority:** Approved PLAN-018 revision 0 checkpoint 2 and Accepted ADR-021
  revision 0
- **Outcome:** Cycle 2 passed with zero findings

## Cycle 1 findings and corrections

The first implementation review found two lifecycle inconsistencies. Fresh
scenario replacement preserved the previous operation-decision mode instead of
restoring `confirm`, and a binding cleanup retained outside the application
could run twice after scenario replacement. Replacement now restores the
complete shell default including `confirm`, and every registered binding
cleanup is wrapped by one idempotent function shared by replacement, explicit
release and application teardown. Cycle 1 cannot support checkpoint completion.

## Cycle 2 complete review

1. **Authority and isolation:** Pass. The composition root remains private to
   `apps/reference-standard`, consumes only Public core plus the neutral
   catalog and adds no adapter, package export, persistence, submit flow or
   framework abstraction.
2. **Controlled ownership:** Pass. The application copies and deeply freezes
   complete initial `value` and `baselineValue` roots, compiles only through
   `compileFormDefinition()` and creates a controlled runtime only after
   successful compilation. Compiler and runtime failures remain observable
   without a live runtime.
3. **Operation decisions:** Pass. Exact runtime-emitted operations support
   immediate confirm, reject, pending confirm/reject and atomic stale or
   incompatible failure through `applyFormOperation()`. The shell never
   constructs an operation or an optimistic value.
4. **Application actions:** Pass. Whole-root external replacement, complete
   baseline commit, locale, validation visibility and fresh reset update the
   controlled runtime while the application remains the sole state owner.
   History entries and pending projections are immutable.
5. **Lifecycle:** Pass. Each fresh runtime receives exactly one snapshot and
   one operation subscription. Scenario replacement and teardown use the same
   order: idempotent binding cleanup, both unsubscribe closures and runtime
   disposal. Repeated replacement cannot deliver from an old runtime or create
   duplicate history.
6. **Focused evidence:** Pass. Eight Standard tests cover successful ownership,
   compile/runtime failure, all decision modes, stale/incompatible application,
   baseline/dirty, locale/visibility, reset defaults, repeated replacement and
   idempotent teardown.
7. **Regression and diff:** Pass. Formatting, lint, strict core/catalog/Angular/
   Standard types, 400 core tests, 79 Public Angular tests, 35 catalog tests, 23
   Angular-reference tests, 11 boundary-verifier tests and 383 imports pass.
   The Standard production JavaScript is 186.21 kB; the unchanged Angular build
   remains 943.08 kB plus its 143.11 kB lazy syntax chunk. Public source,
   manifests, exports and versions have no diff; the unrelated `angular.json`
   analytics value remains outside the checkpoint.

## Outcome

Checkpoint 2 is complete after a full zero-finding pass. Checkpoint 3 may build
the stable normalized DOM projection on this private controlled lifecycle. No
commit, push, publication, browser download, hosting or external setting
changed.
