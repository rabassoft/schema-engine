# ADR-037 complete review — Cycles 1–5

- **Date:** 2026-08-04
- **State:** Complete; recommendation ready for owner acceptance
- **Document:**
  [ADR-037 proposed revision 0](../adrs/037-controlled-linear-declarative-wizard.md)
- **Authority:** Accepted M34 boundary in
  [review 327 cycle 8](./327-d011-d012-m34-declarative-wizard-promotion-readiness.md),
  Accepted SPEC-001 v0.1.15, SPEC-003 v0.1.2, SPEC-008 v0.1.0, SPEC-009
  v0.1.0, SPEC-012 v0.1.0 and SPEC-013 v0.1.1; Accepted ADR-009, ADR-010,
  ADR-023 revision 1, ADR-025 revision 0, ADR-029 revision 0 and ADR-030
  revision 0
- **Scope:** Architecture review only; no ADR acceptance, SPEC, plan,
  implementation, dependency, release or Git action

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R328-F01 | Replaced per-step reveal during final failure with exactly the one derived completion scope containing all ordered targets plus global issues.                                                                  |
| R328-F02 | Replaced the ambiguous optional wizard-text context with exact discriminated wizard-control, step-state and positioned-step branches.                                                                           |
| R328-F03 | Defined wizard control booleans as positional requestability independent from validity so an invalid forward gate remains actionable.                                                                           |
| R328-F04 | Invalidated a pending gated `next` intention before an independent value change or async retry can make its validation evidence stale, while retaining ungated previous and atomic confirmation+value behavior. |
| R328-F05 | Made target creation atomic across the shell and all once-mounted step subtrees so no navigable partial wizard can escape after host failure.                                                                   |
| R328-F06 | Reserved an intention request ID before mutating progress at a valid gate so counter exhaustion is an atomic no-effect.                                                                                         |
| R328-F07 | Defined `WizardActionResult.success`: a validation block is an accepted interaction, while unavailable/malformed/stale/exhausted/disposed calls are failures with no effects.                                   |
| R328-F08 | Added exact collision-free wizard/step relationship bases and fixed suffixes disjoint from existing presentation/data identities.                                                                               |

Cycle 1 cannot support acceptance. ADR-037 was corrected and cycle 2 restarted
all fifteen review areas.

## Cycle 2 finding and owner decision

### R328-F09 — Whole-form async blocking can deadlock ordinary wizard entry

SPEC-012 deliberately reports every `ValidationSnapshot` scope as
`valid: false` while asynchronous validation is blocked, pending or failed.
The async port starts only after the complete form is synchronously valid.
ADR-037 currently consumes that exact scoped `valid` flag for next.

Consequently, with async validation configured, an ordinary wizard whose later
unvisited step has one missing required value remains globally sync-invalid;
async stays `blocked`; and the current step's scoped snapshot remains invalid
even when the current step has no issue. The user cannot reach the future step
to correct it. This contradicts the product purpose of sequential entry and
the refined requirement that untouched future invalidity remain neutral until
attempted.

This is not a documentation-only correction because the remedies choose
different validation authority:

1. **Current-step synchronous exception — recommended.** Next uses scoped
   synchronous issues while async is `blocked: sync-invalid`: it may advance
   when the current step itself is synchronously valid. Async `pending` and
   `failed` still block, an async `settled` result participates normally, and
   complete always requires full sync+async validity. This requires ADR-037 to
   define one core-owned synchronous step projection rather than consuming the
   existing scoped `valid` boolean verbatim.
2. **Strict existing scope validity.** Preserve ADR-037 as written. It has the
   smallest contract delta but makes common partially entered async-enabled
   wizards unable to advance until future required data is already populated.
3. **Defer async wizard integration.** Next uses only synchronous step validity
   throughout M34 and complete owns async validity. This avoids deadlock but
   removes the selected pending/failed next-gate behavior and weakens the M34
   async conformance scenario.

Ricard selected option 1 on 4 August 2026. ADR-037 now exposes exact
synchronous/provisional state, permits only that blocked-async exception for
`next`, preserves pending/failed blocking and requires complete whole-form
sync+async validity.

Cycle 2 cannot support acceptance. Cycle 3 restarted all fifteen areas after
the correction.

## Cycle 3 findings and corrections

| Finding  | Correction                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R328-F10 | Stopped mapping technical async `failed` to a step data-error indicator. Failed remains an explicit factual validation state that blocks navigation, while only attempted factual invalidity derives `error`. |
| R328-F11 | Qualified `completionAttempted` so request-ID exhaustion and every otherwise failed action remain atomic no-effects rather than recording a completion attempt.                                               |

Cycle 3 cannot support acceptance. Cycle 4 restarted all fifteen areas after
the corrections.

## Cycle 4 findings and corrections

| Finding  | Correction                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R328-F12 | Added the exact minimum compiler/manual/runtime/target/package conformance ownership plus one shared three-step Angular/Standard scenario required before M34 can close.                         |
| R328-F13 | Added separate neutral accessible texts and deterministic resolution identity for provisional, pending and failed additional validation so completed progress cannot hide factual qualification. |

Cycle 4 cannot support acceptance. Cycle 5 restarted all fifteen areas after
the corrections and recorded zero findings.

## Complete review matrix — Cycle 5

| Area                         | Result | Evidence                                                                                                                                      |
| ---------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Promotion authority       | Pass   | ADR-037 stays inside the accepted one-root linear M34 boundary.                                                                               |
| 2. Raw grammar               | Pass   | Root-only wizard, at least two static non-empty steps and exact-once root ownership are closed.                                               |
| 3. Normalization/scopes      | Pass   | Keys, immutable step scopes and the one completion scope are deterministic and manual-definition checkable.                                   |
| 4. Controlled ownership      | Pass   | First-step initialization, request identity, confirmation, rejection and stale-state behavior preserve application authority.                 |
| 5. Navigation                | Pass   | Previous/next/complete positions, pending exclusivity and request effects are exact.                                                          |
| 6. Validation/async          | Pass   | The selected synchronous/provisional exception prevents future-step deadlock; pending/failed still block and complete requires full validity. |
| 7. Interaction progress      | Pass   | Visited/attempted/passed history and unvisited/visited/error/completed precedence are factual and neutral.                                    |
| 8. Scheduling/sharing        | Pass   | ID reservation, snapshot-before-intention delivery, re-entry and stale pending invalidation are deterministic.                                |
| 9. Lifecycle/focus           | Pass   | Once-mounted hidden steps, controlled focus clearing, heading focus and disposal are closed.                                                  |
| 10. Target neutrality        | Pass   | Angular and Standard consume normalized state independently; wizard is not a new renderer SPI.                                                |
| 11. Accessibility/text       | Pass   | Non-interactive indicator, relationships, focus and discriminated deterministic text contexts are closed.                                     |
| 12. Diagnostics/safety       | Pass   | Compiler/manual/runtime/listener/target families and descriptor-safe atomic failure boundaries are sufficient for SPEC closure.               |
| 13. Workflow separation      | Pass   | Completed remains valid passage only; persistence, submit, baseline and business effects remain application-owned.                            |
| 14. Public compatibility     | Pass   | Exact Public Experimental additions/widenings require a later coordinated MINOR and preserve ordinary literals.                               |
| 15. Documentation/exclusions | Pass   | Persistent state records the selected exception and all other Deferred/release/Git boundaries remain closed.                                  |

## Acceptance gate

Cycle 5 completed the repeated fifteen-area review with zero findings after
thirteen corrections. ADR-037 proposed revision 0 is ready for Ricard's formal
acceptance. Acceptance would authorize only preparation and complete review of
an extension SPEC; it would not authorize a plan, implementation, dependency,
version, release, publication, commit, push or external mutation.
