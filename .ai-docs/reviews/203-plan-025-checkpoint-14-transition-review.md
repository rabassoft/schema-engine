# PLAN-025 checkpoint 14 transition review

- **Date:** 2026-07-30
- **State:** Accepted after cycle 3 passed with zero findings
- **Scope:** Core `latest` transition and coordinated M23 default closure
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 202`](./202-plan-025-checkpoint-13-transition-review.md)
- **Outcome:** Checkpoint 14 complete; exact, `next`, `latest` and unqualified
  resolution select the coordinated M23 line

## Transition evidence

Ricard reports executing only:

```text
npm dist-tag add @rabassoft/schema-engine@0.4.1 latest
```

Fresh authenticated observation as `ricardrabasso` returns:

- core `next/latest: 0.4.1`;
- base Angular `next/latest: 0.4.1`; and
- Angular Aria pilot `next/latest: 0.2.1`.

A fresh core `@latest` download is 217599 bytes and direct-`cmp` byte-identical
to the selected protected-main candidate. Its SHA-512 is
`7a2f641fbf6bea6f217987bd67883fa5e7654fd60f32db51b1d73998cb8e09f7885cf9bb5a02e046138d9d83558038b173490229a51da89bb6ea11bddffb6592`,
SHA-1 is `4a7c4af6dac6da7af5397034bd20a7c438e29d74`, integrity is
`sha512-ei9kH79r6m8heYe9Z4g/pedlT9YPMttRsdc5mMuOCfeIXPm7WgLgRhONnYNVgDixc0kCKaUdqJu26hG93/tlkg==`,
and repository metadata points to `packages/core` in
`rabassoft/schema-engine`.

All eight exact/`next`/`latest`/unqualified lower/current consumer invocations
pass. Each invocation exercises native and pilot lanes with partial compilation,
typecheck, unit test, production build and Chromium E2E at Angular 22.0.6 or
22.0.7 with Aria/CDK 22.0.5. A fresh audit verifies 15 registry signatures and
6 attestations.

## Cycle 1 — finding and correction

| ID       | Finding                                                                                                               | Correction                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| R203-F01 | Accepted review 202 retained `Outcome: Pending complete review` after checkpoint 13 was completed.                    | Record its accepted checkpoint-13 outcome.                                                          |
| R203-F02 | Root onboarding still presented M21 as the current `next`/`latest`/unqualified Experimental line after M23 completed. | Make M23 the current routed line and preserve M21 only as an immutable exact-version line.          |
| R203-F03 | `STATUS.md` conditioned token-policy preflight on checkpoint 14 passing after its transition evidence already passed. | State the read-only preflight as the direct next action, still separate from every settings change. |

Repeat the complete checkpoint-14 transition, artifact, provenance, consumer,
documentation, policy and diff review after reconciling the coordinated
default state.

## Cycle 2 — repeated review and finding

The technical matrix passed, but final current-state inspection found:

| ID       | Finding                                                                                   | Correction                                                                  |
| -------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| R203-F04 | `STATUS.md` kept alias transition as the current objective after all aliases were closed. | Advance the current objective to checkpoint 15's separately gated policies. |

## Cycle 3 — complete repeated review

Every applicable area passes with zero findings:

- authenticated core/base `next/latest: 0.4.1` and pilot
  `next/latest: 0.2.1`;
- fresh core `@latest` bytes match the selected protected-main candidate;
- 15 verified registry signatures and 6 verified attestations;
- all eight exact/`next`/`latest`/unqualified lower/current consumer
  invocations, each across native and pilot lanes;
- formatting;
- 296 Markdown documents and 963 local documentation links;
- lint;
- 41 release-tooling tests;
- 23 public-repository policy tests;
- 777-file public-tree policy;
- workflow policy; and
- diff checks.

Checkpoint 14 is accepted. Stop before checkpoint 15's token/package-access
preflight and every settings mutation.
