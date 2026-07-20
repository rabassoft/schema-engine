# PLAN-021 checkpoint 9 pre-transition review — Cycle 1

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 9 — base Angular `latest` transition, read-only preflight
- **Authority:** ADR-018 revision 4 and reviews 114–127
- **Outcome:** Cycle 1 passed all eight pre-transition areas with zero findings

## 1. Identity and exact transition target

Pass. npm uses the accepted registry and authenticated identity
`ricardrabasso`. The only contemplated write is the PLAN-021 command that moves
base Angular `latest` to the already inspected `0.3.0`; it remains unexecuted
and requires immediate separate approval.

## 2. Exact three-package line

Pass. The complete live-byte verifier confirms public core/base `0.3.0` and
pilot `0.1.0` remain byte-identical to the selected `ce3ef3d` candidates. Exact
integrity and signatures remain valid.

## 3. Current aliases and transition precondition

Pass. All three `next` aliases resolve to the inspected line. Pilot `latest`
resolves to inspected `0.1.0`; established core/base `latest` remain at their
verified `0.2.0` values. This is exactly the pre-transition state required by
PLAN-021.

## 4. Base Angular package contract

Pass. Base `0.3.0` remains public with expected maintainer, core peer `^0.3.0`,
aligned Angular core/forms range `>=22.0.6 <23.0.0`, `tslib` as its sole runtime
dependency, exact root export and AGPL license. Repository metadata and
provenance remain absent.

## 5. Exact clean consumers

Pass. Exact public versions pass native and pilot lanes at Angular `22.0.6`
and registry-current compatible `22.0.7`, with Aria/CDK `22.0.5`, through
strict installation, partial compilation, types, unit behavior, production
build and Chromium.

## 6. `next` clean consumers

Pass. The same complete lower/latest-compatible native and pilot matrix passes
with all three packages resolved through `next`.

## 7. Planned mixed-window recovery

Pass. Moving base first will intentionally create the minimal dependent-first
mixed window required by PLAN-021. No coordinated `latest` or unqualified
consumer evidence may be accepted until core moves. If the base mutation
succeeds and the later core mutation fails, the repository must record and
preserve the mixed state unless a separate corrective mutation is approved.

## 8. External boundary

Pass. All checkpoint 9 work so far was read-only. No dist-tag, publication,
access/provenance, GitHub, repository or Git action occurred. The exact base
alias command remains separately gated.

## Outcome

Checkpoint 9's read-only preflight is satisfied with zero findings. Stop for
immediate explicit approval of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular@0.3.0 latest
```

After an authorized successful write, verify the base package and exact alias
change, confirm core remains `latest: 0.2.0`, document the intentional mixed
window and stop before checkpoint 10.
