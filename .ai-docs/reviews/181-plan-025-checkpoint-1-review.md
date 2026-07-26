# PLAN-025 checkpoint 1 review — Cycles 1–2

- **Date:** 2026-07-25
- **State:** Accepted after cycle 2 under the standing zero-finding checkpoint
  rule
- **Scope:** M23 descriptor, readiness, workflow policy, deterministic
  candidate preparation and credential-free evidence helpers only
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** Cycle 2 passed all twelve areas with zero unresolved findings;
  checkpoint 1 is complete and checkpoint 2 may begin locally

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                                      | Correction                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| R181-F01 | The first direct-publish detector also matched the harmless workflow title `Npm publish`, rejecting the valid proposed stage-only fixture.                   | Restrict direct-publish detection to executable command lines and retain a positive current-workflow rejection test.              |
| R181-F02 | Stage/read-only commands existed only narratively and there was no reusable local byte/no-drift verifier for downloaded evidence.                            | Add exact list/view/download/registry/signature command construction plus local SHA-512/integrity and JSON no-drift verification. |
| R181-F03 | The first M23 descriptor froze Schema Engine peers but not runtime dependencies, framework peers, exports or side effects, leaving metadata-only drift open. | Freeze and test those exact per-package contracts, including Angular/Aria/CDK ranges, `tslib`, pilot styles and root exports.     |
| R181-F04 | Workflow-policy expected stage commands duplicated literal paths independently from the release descriptor, allowing the two sources of truth to diverge.    | Generate policy expectations from the frozen descriptor and shared exact stage-command builder.                                   |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeated:

1. checkpoint authority and no manifest/workflow/external expansion;
2. exact core/base `0.4.1` and pilot `0.2.1` identity;
3. exact stage/approval/latest order and deterministic filenames;
4. preserved packed and source `^0.4.0` peer floors;
5. unchanged dependencies, framework ranges, exports and side effects;
6. exact stage-only trusted-publisher identity with no direct action;
7. runtime protected-`main` SHA binding without self-reference;
8. absence of token fallback and explicit provenance opt-out;
9. exact npm `11.18.0` tooling and dry-run/stage command shapes;
10. credential-free stage inspection, byte comparison, signature/provenance and
    no-drift evidence helpers;
11. current manifests/workflow failing closed for M23; and
12. unchanged M19/M21 descriptors, commands and regression behavior.

Focused verification passes with 39 release-target/evidence tests and 22
readiness/public/workflow-policy tests. Workflow, formatting, documentation,
public-tree and diff checks pass. No package manifest, lockfile,
`.github/workflows/npm-publish.yml`, candidate, Git or external state changed.

## Completion boundary

Checkpoint 1 is complete. The standing bounded-checkpoint rule permits local
checkpoint 2 to begin, but does not authorize candidate generation, Git,
GitHub/npm access or any registry mutation.
