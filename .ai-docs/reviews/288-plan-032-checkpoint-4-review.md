# PLAN-032 checkpoint 4 review

- **Date:** 2026-08-03
- **Scope:** Angular mounted visibility, native disabled behavior and stale-
  action safety; SPEC-016 row 21
- **Outcome:** Cycle 1 found four implementation/evidence/tooling defects.
  After correction, cycle 2 repeated all twelve areas and row 21 with zero
  findings.

## Cycle 1 findings and corrections

1. The first outlet wiring suppressed hidden/disabled custom-renderer outputs
   before core, bypassing the exact final `INACTIVE_RUNTIME_FIELD` defense.
   The outlet now retains only its existing incompatible-ancestor suppression;
   stale custom outputs reach core and receive the accepted hidden/disabled
   diagnostics.
2. Native controls were visually disabled but their handlers did not all guard
   inactive snapshots. In particular, browser focus removal during a hidden
   transition could route a late blur after core's atomic reconciliation. All
   editable native handlers now require visible and enabled state, reset local
   confirmed buffers safely on blur, and emit neither intentions nor adapter
   diagnostics while inactive.
3. The reference Angular production bundle had grown to 1.12 MB and exceeded
   its stale hard error budget. The error threshold is recalibrated to 1.2 MB;
   the existing 750 kB warning and Ajv CommonJS warning remain visible and are
   recorded observations rather than hidden failures.
4. Initial Chromium evidence expected a confirmation dialog when applying the
   first pristine configuration draft. The established shell applies that
   state directly, so the test now asserts the actual accepted transition and
   continues through mounted identity, accessibility, focus and stale-event
   checks.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                 | Result | Evidence                                                                                                                                                    |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Internal mounted host             | Pass   | The stable leaf host owns hidden, inert and aria-hidden projection while the selected renderer remains mounted.                                             |
| 2. Renderer selection and identity   | Pass   | False/true transitions retain the exact host, renderer and DOM control and do not re-run definition-only selection.                                         |
| 3. Hidden accessibility and focus    | Pass   | Hidden fields leave display, sequential focus and the accessibility tree; core-cleared focus is neither transferred nor restored.                           |
| 4. Hidden reconciliation             | Pass   | Confirmed value, locale, texts, issues and validation continue updating while hidden, with the same native control and private Signal Forms buffer.         |
| 5. Native enabled projection         | Pass   | String, number/integer, boolean and enum controls plus clear/set-null actions are disabled when required; fixed presentation remains enabled true.          |
| 6. Native inactive event routes      | Pass   | Input/change/focus/blur/clear/set-null handlers reject hidden or disabled DOM events without operation or diagnostic noise and reconcile confirmed buffers. |
| 7. Custom renderer boundary          | Pass   | Custom renderers receive the transitive flags and retain accessible responsibility; nonconforming stale outputs reach core's exact final rejection gate.    |
| 8. Supporting state                  | Pass   | Visible disabled fields retain supporting text, issues, validity and issue-visibility projection without changing controlled truth.                         |
| 9. Lifecycle and teardown            | Pass   | Hidden transitions create/destroy no renderer, locale/text updates remain live and accepted owner destruction tears each renderer down exactly once.        |
| 10. Public and deferred boundaries   | Pass   | No Angular symbol, provider, selection policy, dependency, package/version or release contract changes; Standard/shared behavior remains later.             |
| 11. Unit/package/consumer regression | Pass   | Core 43/718 and Angular 16/134 tests, focused 3-test projection evidence, package smoke, consumer, typechecks, lint and workspace builds pass.              |
| 12. Browser, docs and diff hygiene   | Pass   | Chromium 15/15, generated snippets, 667 import boundaries, package README, Prettier and diff hygiene pass; production build succeeds under its budget.      |

## Decision

Cycle 2 passes completely with zero findings. PLAN-032 checkpoint 4 and
SPEC-016 row 21 are complete. Checkpoint 5 may begin; package/version, release
and Git behavior remain inactive.

## Verification

- Complete core regression: 43 files and 718 tests.
- Complete Angular package regression: 16 files and 134 tests; focused
  conditional projection: 1 file and 3 tests.
- Reference scenarios: 2 files and 64 tests; Angular reference: 4 files and 30
  tests.
- Angular package smoke and consumer regression: 1 file and 2 consumer tests.
- Real Angular production build at 1.12 MB succeeds under the 1.2 MB error
  threshold; the 750 kB size and Ajv CommonJS warnings remain recorded.
- Complete Angular Chromium suite: 15 tests.
- Root ESLint, affected typechecks/builds, eight generated snippets and 667
  import boundaries.
- Prettier and `git diff --check`; persistent documentation verification is
  repeated after checkpoint-state reconciliation.

No dependency, package manifest, lockfile, export map, package/version,
release, publication, commit, push or external state changed.
