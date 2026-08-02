# PLAN-025 checkpoint 12 transition review

- **Date:** 2026-07-30
- **State:** Accepted after cycle 3 passed with zero findings
- **Scope:** Observed pilot `latest` transition and intentional mixed window
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 200`](./200-plan-025-checkpoint-12-pre-transition-review.md)
- **Outcome:** Checkpoint 12 is complete; pilot `latest` resolves `0.2.1`,
  while core/base `latest` remain `0.4.0`

## Transition reconciliation

Ricard authorized only:

```text
npm dist-tag add @rabassoft/schema-engine-angular-aria@0.2.1 latest
```

The fresh pre-mutation observation on 2026-07-30 already returned pilot
`latest: 0.2.1`. The command was therefore not executed again. npm's dist-tag
state does not attribute how the alias arrived, so this review records only the
observed intended state and the absence of a duplicate mutation by this task.

## Cycle 1 — findings and corrections

| ID       | Finding                                                                                                                                      | Correction                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| R201-F01 | The pilot onboarding simultaneously reported the observed `0.2.1` aliases and claimed that pilot `0.2.1` was not live.                       | State that exact, `next`, `latest` and unqualified pilot resolution are public, while preserving the intentional core/base default mismatch. |
| R201-F02 | The architecture index still described replacement stages as unapproved and publication/live provenance as unclaimed after checkpoints 9–12. | Record all three exact/`next` publications and provenance, plus the observed pilot-only `latest` transition.                                 |
| R201-F03 | Documentation policy still required the checkpoint-11 pilot alias state and did not reject the contradictory “pilot 0.2.1 is not live” text. | Require the checkpoint-12 mixed state and add an explicit stale pilot-publication guard.                                                     |

## Cycle 2 — repeated review and findings

1. Pilot `next` and `latest` both resolve `0.2.1`.
2. A fresh `@latest` download is 29281 bytes and direct-`cmp` byte-identical to
   the selected protected-main pilot candidate, with SHA-512
   `6f3607c4bae84a933763f16e8edff7c7e22347151b2fb5776d75e0bd385ad5a1f955b505ddd0a04800c82f527378277082bdabd9ff3f00d54fb26465a7288856`.
3. Core/base `next` remain `0.4.1`; both `latest` aliases remain `0.4.0`.
4. The resulting one-edge mixed window is exactly the PLAN-025 checkpoint-12
   recovery state. No coordinated `latest` or unqualified M23 consumer evidence
   is claimed.
5. No command from this task changed an alias, package, access, trust, token,
   Git tag, GitHub Release or repository state.

The automated matrix passed, but the final human current-state reconciliation
found two remaining inconsistencies:

| ID       | Finding                                                                                      | Correction                                                                 |
| -------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| R201-F04 | `STATUS.md` retained the previous checkpoint date after recording the 30 July transition.    | Advance the canonical checkpoint date to 2026-07-30.                       |
| R201-F05 | The implemented-capability summary ended at checkpoint 11 although checkpoint 12 was closed. | Include the verified pilot-only `latest` transition through checkpoint 12. |

## Cycle 3 — complete repeated review

Every transition, current-state, documentation, policy and diff area passes
with zero findings:

- pilot `next`, `latest` and fresh exact bytes;
- unchanged core/base aliases and the intentional mixed-window boundary;
- formatting;
- 294 Markdown documents and 957 local documentation links;
- lint;
- 41 release-tooling tests;
- 23 public-repository policy tests;
- 775-file public-tree policy;
- workflow policy; and
- diff checks.

Checkpoint 12 is accepted after cycle 3. Stop before the separately gated base
Angular `latest` mutation.
