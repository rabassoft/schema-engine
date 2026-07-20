# PLAN-021 checkpoint 9 review — Cycle 1

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 9 — base Angular `latest` transition
- **Authority:** ADR-018 revision 4 and reviews 114–128
- **Outcome:** Cycle 1 passed all seven post-transition areas with zero findings

## 1. Exact alias mutation

Pass. Base Angular now resolves both `next` and `latest` to inspected `0.3.0`.
The observed change is exactly the separately approved checkpoint 9 mutation.

## 2. Exact public bytes and signature

Pass. Base `0.3.0` retains the selected integrity and npm signature. The
complete live-byte verifier confirms core/base `0.3.0` and pilot `0.1.0` remain
byte-identical to the selected `ce3ef3d` candidates.

## 3. Access, maintainership and metadata

Pass. Base remains public with sole expected maintainer
`ricardrabasso <ricard@rabassoft.com>`, core peer `^0.3.0`, Angular core/forms
range `>=22.0.6 <23.0.0`, `tslib` as its sole runtime dependency, exact root
export and AGPL license. Repository metadata and provenance remain absent.

## 4. Intentional mixed window

Pass. Core remains `next: 0.3.0`, `latest: 0.2.0`; pilot remains
`next/latest: 0.1.0`. This is PLAN-021's expected dependent-first mixed window,
not a coordinated default state.

## 5. Consumer evidence boundary

Pass. No `latest` or unqualified consumer result was run or accepted during the
mixed window. The exact/`next` pre-transition evidence from review 128 remains
the applicable consumer baseline until core transitions.

## 6. Unrelated registry drift

Pass. No public bytes, access, maintainer, peer, metadata, pilot alias or core
alias changed beyond the one approved base `latest` mutation.

## 7. External and recovery boundary

Pass. No core alias, publication, access/provenance, GitHub, repository or Git
action occurred. If checkpoint 10 cannot complete, the mixed state must remain
documented unless a separately approved corrective base mutation is selected.

## Outcome

Checkpoint 9 is complete with zero findings. Stop with no active implementation
task before checkpoint 10's separately authorized read-only preflight. Core
`latest` remains `0.2.0`; no coordinated default-channel claim is allowed yet.
