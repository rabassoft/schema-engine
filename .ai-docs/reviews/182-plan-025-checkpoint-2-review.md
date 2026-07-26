# PLAN-025 checkpoint 2 review — Cycles 1–2

- **Date:** 2026-07-25
- **State:** Accepted after cycle 2 under the standing zero-finding checkpoint
  rule
- **Scope:** M23 manifests, source onboarding/release notes, documentation
  policy and protected stage-only workflow
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** Cycle 2 passed all fourteen areas with zero unresolved findings;
  checkpoint 2 is complete and no candidate or external state exists

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                                    | Correction                                                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| R182-F01 | Package onboarding still described the repository as private and could not distinguish proposed M23 source versions from the verified live M21 line.       | Record exact source-only M23 versions/repository metadata while keeping M21 as the only installable line and provenance unobserved.                   |
| R182-F02 | The M21 live verifier loaded current workspace manifests, so the intentional M23 version bump broke immutable historical live commands.                    | Separate frozen descriptor loading from strict current-manifest loading and use descriptor-only loading for M19/M21 registry/consumer regressions.    |
| R182-F03 | The first M23 workflow policy did not enforce the full verify matrix, hosted-runner/action counts, absence of cache or automatic provenance without flags. | Add exact fail-closed checks and fixtures for every omitted invariant.                                                                                |
| R182-F04 | The first staging-order negative fixture inserted a non-exact extra command and therefore did not prove rejection when the real core stage moved earlier.  | Move the exact core stage command in the fixture while preserving the three-command set; the readiness/order guard now fails for the intended reason. |
| R182-F05 | The new evidence test used Node's `Buffer` global without an explicit import and failed the repository lint rule.                                          | Import `Buffer` from `node:buffer` and repeat the complete applicable review.                                                                         |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeated:

1. exact three-package PATCH versions and independent SemVer;
2. exact repository URL and package-specific directories;
3. removal only of the explicit provenance opt-out;
4. public access and `next` source configuration without live claims;
5. preserved `workspace:^0.4.0` source and packed `^0.4.0` peer floors;
6. unchanged dependencies, framework ranges, exports, side effects and runtime;
7. mechanically unchanged lockfile and frozen-install consistency;
8. source-only release notes, installation guidance and immutable recovery;
9. exact npm `11.18.0`, Node/pnpm and pinned Actions workflow tooling;
10. complete verify job, no cache/stored credential and isolated
    `id-token: write`;
11. readiness before deterministic candidate generation and exact tarball-only
    dependency-first staging;
12. current M23 source acceptance and legacy direct-publication rejection;
13. immutable M19/M21 descriptor/live-command preservation; and
14. Deferred/private-package/no-candidate/no-Git/no-external boundaries.

Formatting, documentation with 275 Markdown files and 907 links, workflow
policy, 39 release-target/evidence tests, 23 public/readiness/workflow tests,
754-file public-tree policy, lint, typecheck and package tests pass. Angular
build/package/type verification passed outside the restricted sandbox. No
`.release/0.4.1` candidate, Git operation or GitHub/npm mutation occurred.

## Completion boundary

Checkpoint 2 is complete. Checkpoint 3 requires exact npm `11.18.0` locally and
a complete offline-capable pnpm store before candidate generation. The current
machine has npm `10.9.8`; its frozen install is valid online, but an offline
preflight reports missing `@angular/build@22.0.6` in the pnpm store. Provisioning
those tools/cache is an explicit external prerequisite and has not been
authorized by this review.
