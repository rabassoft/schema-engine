# PLAN-023 checkpoint 9 base-latest transition review — Cycles 1–2

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 9 — base Angular `latest` transition
- **Authority:** ADR-018 revision 5 and reviews 146–161
- **Outcome:** Cycle 2 passed all eight post-transition areas with zero findings

## Cycle 1 finding and correction

| ID       | Finding                                                                                                                    | Correction                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| R162-F01 | Active onboarding and project-state documents still described the required pre-transition base/core `latest: 0.3.0` state. | Reconciled the observed base transition and added stale checks. |
| R162-F02 | The checkpoint-9 ROADMAP stale expression crossed into the checkpoint-10 action and produced a false hit.                  | Required the obsolete `read-only de checkpoint 9` phrase.       |
| R162-F03 | The pilot onboarding required fragment retained the former Markdown line break after its wording changed.                  | Updated the fragment to the exact current sentence.             |
| R162-F04 | Release checks still required the checkpoint-8-only exact pilot alias phrase.                                              | Replaced it with current base/pilot mixed-window markers.       |
| R162-F05 | Historical checkpoint-9 release prose matched the new active-state prohibition.                                            | Rephrased the historical gate without changing its meaning.     |
| R162-F06 | The deferred-decisions table needed canonical formatting after its new row.                                                | Applied formatting, then repeated the complete review.          |

## Cycle 2 — complete zero-finding pass

### 1. Exact alias mutation

Pass. Base Angular now resolves both `next` and `latest` to inspected `0.4.0`.
The observed change is exactly the separately approved checkpoint 9 mutation.

### 2. Exact public bytes, integrity and signature

Pass. Base `latest` resolves to the selected 126,564-byte artifact with exact
integrity
`sha512-jGPZcm9XdSLb/b8OeSGAcLhaTkAk++Xl6mq4QFG49hxDCNd7Wa4Ypm5fTXjnma+PtF3yVEfbs1NKuKCcdmLWoA==`
and its npm registry signature. The complete M21 live-byte verifier confirms
all three exact/`next` artifacts remain byte-identical to selected candidates.

### 3. Base metadata and distribution boundary

Pass. Base remains public with sole expected maintainer
`ricardrabasso <ricard@rabassoft.com>`, AGPL license, core peer `^0.4.0`, exact
Angular core/forms range, `tslib`, root export, `sideEffects: false`,
Corresponding Source and provenance-disabled manifest. Repository metadata,
attestations and provenance remain absent.

### 4. Intentional mixed window

Pass. Base/pilot are `next/latest: 0.4.0`/`0.2.0`; core remains
`next: 0.4.0`, `latest: 0.3.0`. This is PLAN-023's expected dependent-first
mixed window, not a coordinated default state.

### 5. Consumer evidence boundary

Pass. No `latest` or unqualified consumer result was run or accepted during the
mixed window. Review 161's exact/`next` lower/latest-compatible native/pilot
evidence remains the applicable consumer baseline until core transitions.

### 6. Access, aliases and unrelated drift

Pass. All packages remain public; no core/pilot alias, package byte, access,
maintainer, peer, metadata, organization, 2FA or settings value changed beyond
the one approved base `latest` transition.

### 7. Recovery and external boundary

Pass. No core alias, publication, access/provenance, GitHub, repository or Git
action followed the user-run mutation. If checkpoint 10 cannot proceed, the
mixed state remains documented unless a separately approved base/pilot
restoration is selected.

### 8. Documentation and diff

Pass. STATUS, ROADMAP, Deferred, release/onboarding, plan history, indexes and
WORKLOG report the exact mixed window and forbid coordinated `latest` or
unqualified evidence. Formatting, documentation/link validation, lint, all 23
release-tooling tests and the complete diff review pass.

## Outcome

PLAN-023 checkpoint 9 is complete. Base/pilot now resolve `next/latest` to
inspected M21 while core `latest` remains `0.3.0`. Stop with no active
implementation task before checkpoint 10's separately authorized read-only
core `latest` preflight.
