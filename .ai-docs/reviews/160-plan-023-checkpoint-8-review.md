# PLAN-023 checkpoint 8 pilot-latest transition review — Cycles 1–3

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 8 — pilot `latest` transition
- **Authority:** ADR-018 revision 5 and reviews 146–159
- **Outcome:** Cycle 3 passed all eight post-transition areas with zero findings

## Cycle 1 finding and correction

| ID       | Finding                                                                                                             | Correction                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| R160-F01 | The checkpoint-8 ROADMAP stale-state expression crossed into the checkpoint-9 next action and produced a false hit. | Required checkpoint 8 to appear inside the preflight phrase itself, then repeated the full review. |

## Cycle 2 finding and correction

| ID       | Finding                                                                                      | Correction                                                                                      |
| -------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| R160-F02 | Release verification required an uppercase review marker while the narrative used lowercase. | Split the sentence so the exact `Review 160 cycle 3 verifies` marker is explicit and canonical. |

## Cycle 3 — complete zero-finding pass

### 1. Exact alias mutation

Pass. Angular Aria pilot now resolves both `next` and `latest` to inspected
`0.2.0`. The observed change is exactly the separately approved checkpoint 8
mutation.

### 2. Exact public bytes, integrity and signature

Pass. Pilot `latest` resolves to the selected 28,618-byte artifact with exact
integrity
`sha512-dFaJSAfUctF0oRaOdJqPwqra6k4LDL1NnPSx02qO2fC+OFAoaNjyCy3rCNQwoh+ixRsOq4xnuRsJYhKwuTKZXg==`
and its npm registry signature. The complete M21 live-byte verifier confirms
all three exact/`next` artifacts remain byte-identical to selected candidates.

### 3. Pilot metadata and distribution boundary

Pass. Pilot remains public with sole expected maintainer
`ricardrabasso <ricard@rabassoft.com>`, AGPL license, base peer `^0.4.0`, exact
Angular/Aria/CDK ranges, `tslib`, root/styles exports, stylesheet side effect,
Corresponding Source and provenance-disabled manifest. Repository metadata,
attestations and provenance remain absent.

### 4. Intentional mixed window

Pass. Core/base remain `next: 0.4.0`, `latest: 0.3.0`; pilot is
`next/latest: 0.2.0`. This is PLAN-023's expected dependent-first mixed window,
not a coordinated default state.

### 5. Consumer evidence boundary

Pass. No `latest` or unqualified consumer result was run or accepted during the
mixed window. Review 159's exact/`next` lower/latest-compatible native/pilot
evidence remains the applicable consumer baseline until the default chain
closes.

### 6. Access, aliases and unrelated drift

Pass. All packages remain public; no core/base alias, package byte, access,
maintainer, peer, metadata, organization, 2FA or settings value changed beyond
the one approved pilot `latest` transition.

### 7. Recovery and external boundary

Pass. No base/core alias, publication, access/provenance, GitHub, repository or
Git action followed the user-run mutation. If checkpoint 9 cannot proceed, the
mixed state remains documented unless a separately approved pilot restoration
is selected.

### 8. Documentation and diff

Pass. STATUS, ROADMAP, Deferred, release/onboarding, plan history, indexes and
WORKLOG report the exact mixed window and forbid coordinated `latest` or
unqualified evidence. Formatting, documentation/link validation, lint, all 23
release-tooling tests and the complete diff review pass.

## Outcome

PLAN-023 checkpoint 8 is complete. Pilot `latest: 0.2.0` is verified and
core/base `latest: 0.3.0` remain unchanged. Stop with no active implementation
task before checkpoint 9's separately authorized read-only base Angular
`latest` preflight.
