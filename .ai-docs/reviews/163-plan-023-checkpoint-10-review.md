# PLAN-023 checkpoint 10 core-latest transition review — Cycles 1–3

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 10 — core `latest` transition and coordinated default closure
- **Authority:** ADR-018 revision 5 and reviews 146–162
- **Outcome:** Cycle 3 passed all nine post-transition areas with zero findings

## Cycle 1 finding and recovery

| ID       | Finding                                                                                                                                                 | Recovery                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| R163-F01 | Core `latest` was already `0.4.0` at the first checkpoint-10 preflight observation, so the separately gated preflight did not complete before mutation. | Performed no rollback or further write; switched immediately to fail-closed post-transition observation and recorded the fact. |
| R163-F02 | Active project-state and onboarding documents necessarily still described the checkpoint-9 mixed window.                                                | Reconciled the observed coordinated aliases and added stale-state protections before repeating the complete review.            |

## Cycle 2 finding and correction

| ID       | Finding                                                                                              | Correction                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| R163-F03 | Core onboarding no longer named exact historical M19 `0.3.0` after removing its former default role. | Restored the pinned historical version without describing it as `latest`, then repeated the complete review. |

## Cycle 3 — complete zero-finding pass

### 1. Exact alias transition

Pass. Core now resolves both `next` and `latest` to inspected `0.4.0`.
Base Angular remains `next/latest: 0.4.0`; Angular Aria remains
`next/latest: 0.2.0`. The resulting aliases are exactly the PLAN-023 target.

### 2. Exact public bytes, integrity and signatures

Pass. Core `latest` resolves to the selected 218,187-byte artifact with exact
integrity
`sha512-t89lGk2p4mlW91/fjoPuiruoRCMgKiTLnZ/I7VDufW6x1kE2N4rcIp8kNi09Ul1DKmMDCM/1uizteyBI4rBG2g==`
and its npm registry signature. The complete live verifier confirms all three
exact/`next` artifacts remain byte-identical to selected candidates.

### 3. Core metadata and distribution boundary

Pass. Core remains public with sole expected maintainer
`ricardrabasso <ricard@rabassoft.com>`, AGPL license, no runtime dependency,
exact root export, `sideEffects: false`, Corresponding Source and
provenance-disabled manifest. Repository metadata, attestations and provenance
remain absent.

### 4. Coordinated aliases

Pass. Core/base resolve `next/latest: 0.4.0`; pilot resolves
`next/latest: 0.2.0`. No mixed default edge remains and routing does not imply
Stable API status.

### 5. Exact and `next` clean consumers

Pass. Serialized exact and `next` lower/latest-compatible native and pilot M20
consumers pass strict installation, partial compilation, types, unit behavior,
production build and Chromium at Angular `22.0.6`/`22.0.7` with Aria/CDK
`22.0.5`.

### 6. `latest` clean consumers

Pass. Both lower/latest-compatible native and pilot lanes resolve the complete
M21 line through `latest` and pass the same compilation, test, build and
Chromium sequence.

### 7. Unqualified clean consumers

Pass. Both lower/latest-compatible native and pilot lanes resolve the complete
M21 line without explicit package specifiers and pass the same sequence.

### 8. Access, aliases and unrelated drift

Pass. All packages remain public; no base/pilot alias, package byte, access,
maintainer, peer, metadata, organization, 2FA or settings value changed beyond
the observed core `latest` transition. No publication, deprecation, unpublish,
GitHub, repository, provenance or Git action occurred.

### 9. Documentation and diff

Pass. STATUS, ROADMAP, Deferred, release/onboarding, plan history, indexes and
WORKLOG report the coordinated aliases, the procedural deviation and the
remaining final-review gate. Formatting, documentation/link validation, lint,
all 23 release-tooling tests and the complete diff review pass.

## Outcome

PLAN-023 checkpoint 10 is complete after recovery and a zero-finding full
review. The exact, `next`, `latest` and unqualified M21 line is verified. Stop
with no active implementation task before checkpoint 11's separately
authorized final closure review; no further external mutation is authorized.
