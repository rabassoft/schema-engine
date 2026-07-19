# PLAN-021 checkpoint 1 complete review — Cycles 1–2

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 1 — Three-package release tooling
- **Authority:** SPEC-008 v0.1.0, ADR-018 revision 4, reviews 114–116 and
  completed PLAN-020/M18
- **Outcome:** Cycle 2 passed all ten areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                | Correction                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| R117-F01 | The first positive descriptor test compared two equal clones by reference and failed despite valid structure.                          | Asserted that validation returns the exact supplied descriptor object and retained a separate deep structural expectation.                  |
| R117-F02 | Tests used the Node global `structuredClone`, which violated the repository ESLint environment.                                        | Replaced it with a deterministic JSON copy helper suitable for this data-only contract.                                                     |
| R117-F03 | A legacy `packPrivateM18Candidates()` helper duplicated the three-package order outside the new descriptor.                            | Removed the duplicate helper; every M19 pack path now consumes `M19_RELEASE_DESCRIPTOR`.                                                    |
| R117-F04 | The initial change repurposed the historical two-package live verifier, which would have broken frozen `0.2.0` commands.               | Restored the historical verifier unchanged and added a separate unequal-version M19 live verifier.                                          |
| R117-F05 | Consumer modes were wired inside the clean-consumer script but lacked an independently tested exact mapping and fail-closed boundary.  | Added `m19PackageSpecifier()` and tests for candidate, exact, `next`, `latest`, unqualified, missing artifact, unknown role and mixed mode. |
| R117-F06 | Candidate evidence validated package identity/order but allowed unvalidated hashes, toolchain values and additional credential fields. | Closed top-level/candidate keys and validated toolchain, commit, byte, SHA-512 and integrity forms, rejecting extra fields.                 |

## 1. Authority and production boundary

Pass. Only release tooling, tests and root commands changed. Runtime,
compiler, Angular/pilot behavior, Public exports, package versions, peers and
styles remain exactly the completed M18 state.

## 2. Exact descriptor and publication order

Pass. One deeply frozen descriptor owns release ID/directory, `next`, absent
provenance, all five consumer modes and the exact dependency-first
core `0.3.0` → base `0.3.0` → pilot `0.1.0` order.

## 3. Names, versions, peers and artifacts

Pass. Exact package names, workspace paths, independent versions, candidate
filenames, packed Schema Engine peers and packed development versions are
closed. Missing/duplicate/unexpected packages, altered order, peer, version or
filename fail focused tests.

## 4. Manifest and packing validation

Pass. Loading M19 requires explicit `--release=m19`, reads all manifests in
descriptor order and verifies identity, version, public access, `next` and no
provenance. Generic packing consumes only descriptor paths and rejects a
generated filename mismatch.

## 5. Candidate metadata safety

Pass. Preparation records exact role/name/version/file, bytes, SHA-512,
integrity, Node/npm/pnpm, base/source commit, tag and provenance. Closed key
sets reject credential or unreviewed metadata, and dirty candidates record no
source commit.

## 6. Artifact, source and security coverage

Pass. Core/base artifact verification and pilot isolation consume the same
descriptor. All three exact inventories, exports, peers, source harnesses,
styles, licenses and package boundaries pass. Frozen isolated source rebuilds
pass with zero downloads from already cached content; tracked/packed secret,
personal data, private link and ownership scans pass.

## 7. Candidate and live modes

Pass. Candidate preparation supports unequal versions and three hashes. The
M19 live verifier checks each candidate's own version and integrity. Candidate,
exact, `next`, `latest` and unqualified native/pilot consumer modes are distinct
and each still requires all installed package versions to equal the descriptor,
so mixed lines fail.

## 8. Immutable `0.2.0` regression

Pass. The original coordinated target function and two-package live verifier
remain available for historical commands. `test:artifacts` still verifies the
frozen source commit, files, SHA-512/integrity and exact manifests of both
published `0.2.0` tarballs without mutable-tag assertions.

## 9. Tooling and diff quality

Pass. Twelve focused tests, formatting, lint, documentation checks and diff
checks pass. Package/source/security scripts execute successfully. No ignored
candidate was selected and no registry, authentication, Git or remote action
occurred.

## 10. Deferred and next-checkpoint boundary

Pass. Checkpoint 1 does not create release notes, claim publication, prepare
selected candidates or enter checkpoint 4. D-043, public repository,
provenance, automation and all functional deferred work remain inactive.
Checkpoint 2 is the only next action.

## Cycle 2 result

Cycle 2 repeated all ten areas after every correction and produced zero
findings with no unresolved change request. PLAN-021 checkpoint 1 is complete.
Local checkpoint 2 may proceed; commit, push, registry access and every npm
mutation remain unauthorized.
