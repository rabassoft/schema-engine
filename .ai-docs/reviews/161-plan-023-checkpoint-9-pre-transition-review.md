# PLAN-023 checkpoint 9 pre-transition review — Cycles 1–5

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 9 — base Angular `latest` transition, read-only preflight
- **Authority:** ADR-018 revision 5 and reviews 146–160
- **Outcome:** Cycle 5 passed all eight pre-transition areas with zero findings

## Cycle 1 finding and correction

| ID       | Finding                                                                                                            | Correction                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| R161-F01 | The checkpoint-9 ROADMAP stale-state expression crossed into the correct mutation action and produced a false hit. | Required the obsolete separate-preflight authorization phrase, then repeated the complete review. |

## Cycle 2 finding and correction

| ID       | Finding                                                      | Correction                                                       |
| -------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| R161-F02 | The new review document did not satisfy repository Prettier. | Applied canonical formatting, then repeated the complete review. |

## Cycle 3 finding and correction

| ID       | Finding                                                                                 | Correction                                                                          |
| -------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| R161-F03 | Prettier split the release note's exact required review marker, so `docs:check` failed. | Made the canonical marker a standalone sentence, then repeated the complete review. |

## Cycle 4 finding and correction

| ID       | Finding                                                                                   | Correction                                                                       |
| -------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| R161-F04 | Prettier split the second exact release marker, so `docs:check` still could not match it. | Made that marker a short standalone sentence, then repeated the complete review. |

## Cycle 5 — complete zero-finding pass

## 1. Identity and exact transition target

Pass. npm `10.9.8` uses `https://registry.npmjs.org/` and authenticated
identity `ricardrabasso`, with verified `ricard@rabassoft.com`,
write-protected 2FA, Rabassoft owner authority and read-write access to all
three packages. The only contemplated write is the PLAN-023 command that moves
base Angular `latest` to already inspected `0.4.0`; it remains unexecuted and
requires immediate separate approval.

## 2. Exact three-package line

Pass. The complete live-byte verifier confirms public core/base `0.4.0` and
pilot `0.2.0` remain byte-identical to the selected `07755b4` candidates. Their
exact integrities and npm registry signatures remain valid.

## 3. Current aliases and transition precondition

Pass. All three `next` aliases resolve to the inspected M21 line. Pilot
`latest` resolves to inspected `0.2.0`; established core/base `latest` remain
at verified `0.3.0`. This is exactly the checkpoint-8 mixed state required
before the base transition.

## 4. Base Angular package contract

Pass. Base `0.4.0` remains public with the expected sole maintainer, core peer
`^0.4.0`, aligned Angular core/forms range `>=22.0.6 <23.0.0`, `tslib` as its
sole runtime dependency, exact root export, `sideEffects: false` and AGPL
license. Repository metadata and provenance remain absent.

## 5. Exact clean consumers

Pass. Exact public versions pass native and pilot lanes at Angular `22.0.6`
and registry-current compatible `22.0.7`, with Aria/CDK `22.0.5`, through
strict installation, partial compilation, types, unit behavior, production
build and Chromium.

## 6. `next` clean consumers

Pass. The same complete lower/latest-compatible native and pilot matrix passes
with all three packages resolved through `next`.

## 7. Planned mixed-window recovery

Pass. Moving base next will intentionally advance the dependent-first mixed
window required by PLAN-023: base/pilot will be on the M21 defaults while core
remains on M19 by default. No coordinated `latest` or unqualified consumer
evidence may be accepted until core moves. If the base mutation succeeds and
the later core mutation cannot proceed, preserve and document that mixed state
unless a separate corrective mutation is approved.

## 8. External boundary

Pass. All checkpoint 9 work so far was read-only. No dist-tag, publication,
access/provenance, GitHub, repository or Git action occurred. The exact base
alias command remains separately gated.

## Outcome

Checkpoint 9's read-only preflight is satisfied after a complete zero-finding
pass. Stop for
immediate explicit approval of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular@0.4.0 latest
```

After an authorized successful write, verify the base package and exact alias
change, confirm core remains `latest: 0.3.0`, document the intentional mixed
window and stop before checkpoint 10.
