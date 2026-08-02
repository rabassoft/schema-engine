# PLAN-025 checkpoint 12 pre-transition review — Cycle 1

- **Date:** 2026-07-29
- **State:** Accepted read-only preflight after cycle 1 passed with zero
  findings
- **Scope:** Pilot `latest` transition readiness without registry mutation
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 199`](./199-plan-025-checkpoint-11-pilot-approval-review.md)
- **Outcome:** Checkpoint 12 preflight is satisfied; only the exact pilot
  `latest` mutation remains separately gated

## Cycle 1 — zero findings

### 1. Identity and exact transition target

Pass. npm uses the accepted registry and authenticated identity
`ricardrabasso`. The only contemplated write moves pilot `latest` to the
already verified `0.2.1`; it remains unexecuted and requires immediate separate
approval.

### 2. Exact three-package line

Pass. Public core/base `0.4.1` and pilot `0.2.1` retain the selected SHA-1 and
integrity values. Direct `cmp` against all three selected protected-main
candidates passes.

### 3. Signatures and provenance

Pass. Exact metadata exposes all three registry signatures and SLSA
attestations. The clean three-package installation verifies 15 registry
signatures and 6 attestations. Review 199 binds the pilot and reviews 197–198
bind core/base to repository `rabassoft/schema-engine`, workflow
`npm-publish.yml`, protected `main@028a98c` and run `30377052519`.

### 4. Current aliases and transition precondition

Pass. `next` resolves core/base `0.4.1` and pilot `0.2.1`. `latest` remains
core/base `0.4.0` and pilot `0.2.0`. This is exactly checkpoint 12's
pre-transition state.

### 5. Pilot package contract and access

Pass. Pilot `0.2.1` is public with sole expected maintainer
`ricardrabasso <ricard@rabassoft.com>`, AGPL license, base peer `^0.4.0`, exact
Angular/Aria/CDK ranges, `tslib` as its sole runtime dependency and unchanged
root/`./styles.css` exports.

### 6. Applicable consumer evidence

Pass. Review 199 cycle 2 freshly verifies all exact and `next` native/pilot
lanes at Angular 22.0.6/22.0.7 with Aria/CDK 22.0.5. No `latest` or unqualified
M23 consumer evidence is claimed before the alias chain closes.

### 7. Planned mixed-window recovery

Pass. Moving only pilot `latest` creates the required first dependent-first
mixed window: pilot `latest: 0.2.1` with core/base `latest: 0.4.0`. If later
transitions cannot proceed, preserve and document that state unless a separate
corrective mutation is approved.

### 8. External boundary

Pass. The preflight is read-only. No dist-tag, publication, access, trust,
token, Git tag, GitHub Release or repository mutation occurred.

Formatting, 293-document/954-link documentation, lint, 41 release-tooling
tests, 23 public-policy tests, 774-file public-tree policy, workflow policy and
diff checks all pass.

## Outcome

Checkpoint 12's read-only preflight is satisfied with zero findings. Stop for
immediate explicit approval of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular-aria@0.2.1 latest
```

After an authorized successful write, verify only pilot `latest` changed,
record the intentional mixed window and stop before checkpoint 13.
