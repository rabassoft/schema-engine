# PLAN-023 checkpoint 5 live core review — Cycles 1–5

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 5 — core `0.4.0` publication under `next`
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5 and reviews 146–153
- **Outcome:** Cycle 5 passed all ten areas with zero findings

## Cycles 1–4 findings and corrections

| ID       | Finding                                                                                                           | Correction                                                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| R154-F01 | Active status, release and onboarding documentation still described core `0.4.0` as unpublished.                  | Reconciled the observed partial-live core state while keeping base `0.4.0` and pilot `0.2.0` explicitly unavailable.           |
| R154-F02 | Root onboarding's adjacent core/Angular `@next` commands would now select incompatible mixed M21/M19 generations. | Replaced them with a standalone core-M21 command and an explicit coordinated M19 Angular pair; added fail-closed stale checks. |
| R154-F03 | Cycle 2's final diff found pre-review documentation/link counts still recorded in active `STATUS.md`.             | Reconciled the observed 239-document/807-link result and restarted the complete review.                                        |
| R154-F04 | Cycle 3 found the root channel summary and PLAN-023 header still described the pre-publication routing/gate.      | Reconciled the exact mixed aliases and checkpoint 5 completion, then strengthened stale-state checks.                          |
| R154-F05 | Cycle 4 observed that replacing the plan-header link changed the active documentation link count again.           | Removed volatile numeric document/link counts from `STATUS.md`; verification remains semantic and fail-closed.                 |

## Cycle 5 — complete zero-finding pass

### 1. Exact package observation

Pass. The public registry exposes `@rabassoft/schema-engine@0.4.0` exactly once.
Base Angular remains limited to `0.1.0`–`0.3.0` and Angular Aria remains limited
to `0.1.0`.

### 2. Byte identity and integrity

Pass. The unauthenticated public core tarball is byte-identical to the selected
candidate: 218,187 bytes and SHA-512
`b7cf651a4da9e26956f75fdf8e83ee8abba84423202a24cb9d9fc8ed50ee7d6eb1d64136378adc229f24362d3d525d432a630308cff5ba2ced7b2048e2b046da`.
Registry integrity is
`sha512-t89lGk2p4mlW91/fjoPuiruoRCMgKiTLnZ/I7VDufW6x1kE2N4rcIp8kNi09Ul1DKmMDCM/1uizteyBI4rBG2g==`.

### 3. Registry signature and provenance

Pass. npm supplies a registry signature for the exact artifact. No attestation,
repository metadata or npm provenance is present.

### 4. Access, ownership and license

Pass. Core remains public, maintained only by
`ricardrabasso <ricard@rabassoft.com>` and licensed `AGPL-3.0-only`. Base and
pilot access, maintainers and licenses are unchanged.

### 5. Exact manifest and source boundary

Pass. The registry manifest matches the reviewed ESM, side-effect-free root
export, public `next`, provenance-disabled publish configuration, author and
AGPL contract. The public bytes include the exact preferred TypeScript source,
license/notices and frozen package-local build harness.

### 6. Alias transition

Pass. Only core `next` moved, from `0.3.0` to `0.4.0`. Core `latest` remains
`0.3.0`; base remains `next`/`latest: 0.3.0`; pilot remains
`next`/`latest: 0.1.0`.

### 7. Exact core consumer

Pass. A clean consumer resolved exact core `0.4.0`, compiled and executed. The
same public core combined with the selected local base candidate passed Angular
partial compilation and execution at `22.0.6` and `22.0.7`.

### 8. `next` core consumer

Pass. A second clean consumer resolved core `next` to inspected `0.4.0`,
compiled and executed. Lower/latest-compatible Angular checks with the selected
local base candidate also passed.

### 9. Partial-state safety

Pass. No coordinated M21 consumer claim is made. Base `0.4.0` and pilot `0.2.0`
remain unpublished, their aliases remain on M19, and onboarding does not suggest
combining core `@next` with base `@next` during this mixed window.

### 10. External boundary and documentation

Pass. Post-publication work performed only public reads, temporary consumer
installs and current-state documentation. No dist-tag, access, maintainer, 2FA,
Git, GitHub, repository or provenance mutation followed the user-run publish.
Formatting, documentation, lint, release-tooling and diff checks pass.

## Outcome

PLAN-023 checkpoint 5 is complete. Core `0.4.0` is a verified immutable public
Experimental artifact under `next`; core `latest` and both dependent package
lines remain unchanged. Checkpoint 6 requires separate authorization before its
read-only preflight, and base publication retains another later immediate gate.
