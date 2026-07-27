# PLAN-025 checkpoint 3 review — Cycles 1–2

- **Date:** 2026-07-25
- **State:** Accepted after cycle 2 under the standing zero-finding checkpoint
  rule
- **Scope:** Complete local M23 candidate matrix, deterministic packaging,
  metadata-only comparison, source rebuilds, consumers and security
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** Cycle 2 passed all sixteen areas with zero unresolved findings;
  checkpoint 3 is complete and the candidates remain local, dirty-tree
  comparison evidence with `sourceCommit: null`

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                    | Correction                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| R183-F01 | The public artifact verifier still required M21's explicit `provenance:false` and absent repository metadata.                              | Branch exact manifest/README assertions by release descriptor and require M23's public repository plus absence of the provenance opt-out.         |
| R183-F02 | The release-security verifier still classified the now-public sanitized GitHub repository URL as a private-link leak.                      | Preserve the historical restriction for pre-M23 descriptors and permit the reviewed public repository only for M23.                               |
| R183-F03 | The first metadata-only comparator used `structuredClone`, which violated the repository ESLint environment despite passing at runtime.    | Use a JSON-safe manifest clone and repeat lint plus the complete checkpoint review.                                                               |
| R183-F04 | The restricted environment's implicit local pnpm store remained empty even after `fetch`, obscuring the otherwise valid offline preflight. | Run the exact frozen offline preflight against the populated global store explicitly; npm `11.18.0` and all 521 packages resolve without network. |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeated:

1. Node `22.23.1`, npm `11.18.0`, pnpm `10.28.2` and frozen offline install;
2. formatting, documentation, workflow and public-tree policy;
3. lint, strict types, complete unit suites and all builds;
4. package smoke tests and isolated Corresponding Source rebuilds;
5. snippets, reference boundaries and Angular/Standard unit/E2E lanes;
6. exact core/base `0.4.1` and pilot `0.2.1` manifests and filenames;
7. exact repository directories, public access, `next` and preserved peer floors;
8. exact inventories, exports, dependencies, source/license and no workspace protocols;
9. two complete candidate generations with identical SHA-512 values;
10. byte-identical non-metadata content and inventories against selected M21 candidates;
11. lower/current native and Angular Aria candidate consumers;
12. accepted SPEC-009 scenarios and M18 regression behavior;
13. tracked/packed secrets, credentials, personal data, paths, rights and unexpected files;
14. credential-free exact-tarball `npm stage publish --dry-run` from workspace and neutral paths;
15. exact sizes, hashes, integrities, dirty base commit and `sourceCommit: null`; and
16. no stage, registry write, Git operation, GitHub action or publishable source claim.

The final tree passes 276 Markdown files, 909 local links, 756 public-tree
candidates, 39 release-target/evidence tests, 23 readiness/public/workflow
tests, 689 workspace tests and 14 Chromium E2E tests. Formatting, workflows,
lint, strict types, builds, package/source checks, snippets and boundaries also
pass.

The three deterministic local candidate hashes are:

- core:
  `182aeb23087bb9b6d02c097aecda7acb239ed4d86b8b3c7854eb58f3232d510a0113b01f0790fc03ed4b8042d95ba59feb0d0b160702e088cf23d243f15e59bb`;
- base Angular:
  `51d95d98075b7ff63be1cafa5b39a42f9a93ce9a41a5147cd086330ceada6bf851b8d23725e87ec8077e4647b0c8874b70966dc3974d73ef9c7909aecc0b8bea`; and
- Angular Aria pilot:
  `dae08ca2d1c2716ed397ceabb8ba9c8af637e54710a4a47cf3f74d2461f69d3fb928aa6aa3c29effd2846f0832b6a1e34cd77dfe0783996d3177a1f80f82d937`.

## Completion boundary

Checkpoint 3 is complete. Local `develop` already contains the pre-existing M22
canonical-closure commit `acc0d6c`, one commit ahead of `origin/develop`.
Keeping checkpoint 4 scoped therefore requires delivering that commit through
a separate protected PR first. Both that prerequisite and checkpoint 4 require
separate authorization; no Git or external action is authorized by this
review.
