# PLAN-021 checkpoint 10 pre-transition review — Cycle 1

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 10 — core `latest` transition, read-only preflight
- **Authority:** ADR-018 revision 4 and reviews 114–129
- **Outcome:** Cycle 1 passed all seven pre-transition areas with zero findings

## 1. Identity and exact transition target

Pass. npm uses the accepted registry and authenticated identity
`ricardrabasso`. The only contemplated write is the PLAN-021 command that moves
core `latest` to already inspected `0.3.0`; it remains unexecuted and requires
immediate separate manual approval.

## 2. Exact three-package line

Pass. The complete live-byte verifier confirms public core/base `0.3.0` and
pilot `0.1.0` remain byte-identical to the selected `ce3ef3d` candidates. Exact
integrity and signatures remain valid.

## 3. Current mixed-window aliases

Pass. Core remains `next: 0.3.0`, `latest: 0.2.0`; base Angular remains
`next/latest: 0.3.0`; pilot remains `next/latest: 0.1.0`. This is exactly the
checkpoint 9 mixed window required before the core transition.

## 4. Core package contract

Pass. Core `0.3.0` remains public with expected maintainer, no runtime
dependency, exact root export and AGPL license. Repository metadata and
provenance remain absent.

## 5. Consumer evidence precondition

Pass. Review 128's exact/`next` lower and latest-compatible native/pilot matrix
remains applicable because public bytes and those aliases have not changed.
Review 129 correctly accepted no `latest` or unqualified evidence from the
mixed window.

## 6. Expected transition and recovery

Pass. Moving core `latest` to `0.3.0` will close the planned mixed window. If
the command fails, the current state must remain documented; restoring base
`latest` would be a separate corrective mutation requiring approval.

## 7. External boundary

Pass. All checkpoint 10 work so far was read-only. No dist-tag, publication,
access/provenance, GitHub, repository or Git action occurred. The exact core
alias command remains separately gated.

## Outcome

Checkpoint 10's read-only preflight is satisfied with zero findings. Ricard
must manually execute only:

```text
npm dist-tag add @rabassoft/schema-engine@0.3.0 latest
```

After success, verify all aliases and exact bytes before running the required
`latest` and unqualified consumer matrices. No further manual command is
authorized by this review.
