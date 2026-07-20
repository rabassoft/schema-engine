# PLAN-021 checkpoint 10 review — Cycle 1

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 10 — core `latest` transition
- **Authority:** ADR-018 revision 4 and reviews 114–130
- **Outcome:** Cycle 1 passed all nine post-transition areas with zero findings

## 1. Exact core alias mutation

Pass. Core now resolves both `next` and `latest` to inspected `0.3.0`. The
observed change is exactly the separately approved checkpoint 10 mutation.

## 2. Exact public line

Pass. Core/base `0.3.0` and pilot `0.1.0` remain byte-identical to the selected
`ce3ef3d` candidates with exact integrity and npm signatures.

## 3. Core package boundary

Pass. Core remains public with the expected maintainer, no runtime dependency,
exact root export, AGPL license and no repository/provenance metadata.

## 4. Coordinated aliases

Pass. Core/base resolve `next/latest: 0.3.0`; pilot resolves
`next/latest: 0.1.0`. The checkpoint 9 mixed window is closed and no unrelated
alias changed.

## 5. `latest` lower consumers

Pass. With Angular `22.0.6` and Aria/CDK `22.0.5`, native and pilot consumers
resolve the inspected default line and pass strict installation, partial
compilation, types, unit behavior, production build and Chromium.

## 6. `latest` latest-compatible consumers

Pass. Registry-current compatible Angular `22.0.7` with Aria/CDK `22.0.5`
passes the same complete native/pilot evidence through `latest`.

## 7. Unqualified consumers

Pass. Lower `22.0.6` and latest-compatible `22.0.7` native/pilot consumers
without explicit package versions resolve core/base `0.3.0` and pilot `0.1.0`
and pass the complete matrix.

## 8. Unrelated registry drift

Pass. No package bytes, access, maintainers, metadata, peers or alias outside
the approved core `latest` mutation changed.

## 9. External and closure boundary

Pass. No publication, access/provenance, GitHub, repository or Git action
occurred. Checkpoint 11 must still repeat the complete final release review;
coordinated aliases alone do not complete PLAN-021 or M19.

## Outcome

Checkpoint 10 is complete with zero findings. The planned aliases and default
consumer line are coordinated and verified. Stop with no active implementation
task before checkpoint 11's separately authorized read-only final closure.
