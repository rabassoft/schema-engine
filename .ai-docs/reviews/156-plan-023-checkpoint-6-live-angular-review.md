# PLAN-023 checkpoint 6 live Angular review — Cycles 1–2

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 6 — base Angular `0.4.0` publication under `next`
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5 and reviews 146–155
- **Outcome:** Cycle 2 passed all ten areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                 | Correction                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| R156-F01 | Active status, release, roadmap and onboarding still described base Angular `0.4.0` as unpublished.     | Reconciled the observed core/base partial-live state while keeping pilot `0.2.0` explicitly unavailable and gated. |
| R156-F02 | `STATUS.md` ambiguously attributed the whole public line to the older M19 source commit.                | Scoped commit `ce3ef3d` explicitly to the M19 default line; the M21 source remains independently identified.       |
| R156-F03 | Angular onboarding dated the upper `22.0.7` endpoint only to M18 despite fresh public `0.4.0` evidence. | Reworded the endpoint as verified for public `0.4.0` without widening the accepted peer range.                     |

## Cycle 2 — complete zero-finding pass

### 1. Exact package observation

Pass. The public registry exposes
`@rabassoft/schema-engine-angular@0.4.0` exactly. Core remains published through
`0.4.0`; the Angular Aria pilot remains limited to `0.1.0`.

### 2. Byte identity and integrity

Pass. The unauthenticated public base tarball is byte-identical to the selected
candidate: 126,564 bytes and SHA-512
`8c63d9726f577522dbfdbf0e79218070b85a4e4024fbe5e5ea6ab84051b8f61c4308d77b59ae18a66e5f4d78e799af8fb45df25447dbb3534ab8a09c7662d6a0`.
Registry integrity is
`sha512-jGPZcm9XdSLb/b8OeSGAcLhaTkAk++Xl6mq4QFG49hxDCNd7Wa4Ypm5fTXjnma+PtF3yVEfbs1NKuKCcdmLWoA==`.

### 3. Registry signature and provenance

Pass. npm supplies a registry signature for the exact artifact. No attestation,
repository metadata or npm provenance is present.

### 4. Access, ownership and license

Pass. Base Angular remains public, maintained only by
`ricardrabasso <ricard@rabassoft.com>` and licensed `AGPL-3.0-only`. Core and
pilot access, maintainers and licenses are unchanged.

### 5. Exact manifest, peers and source boundary

Pass. The registry manifest matches the reviewed ESM, side-effect-free root
export, public `next`, provenance-disabled configuration, author and AGPL
contract. Core peer is exactly `^0.4.0`; Angular core/forms remain
`>=22.0.6 <23.0.0`; `tslib ^2.8.1` is the only runtime dependency. Preferred
TypeScript source and frozen package-local build harness are present.

### 6. Alias transition

Pass. Only base Angular `next` moved, from `0.3.0` to `0.4.0`. Core remains
`next: 0.4.0`; core/base `latest` remain `0.3.0`; pilot remains
`next`/`latest: 0.1.0`.

### 7. Exact native consumers

Pass. Clean consumers resolved exact public core/base `0.4.0`, compiled and
executed. Angular partial compilation passed at `22.0.6` and `22.0.7`.

### 8. `next` native consumers

Pass. A second clean run resolved both core and base `next` to inspected
`0.4.0`, compiled and executed at Angular `22.0.6` and `22.0.7`.

### 9. Partial-state safety

Pass. No three-package M21 claim is made. Pilot `0.2.0` remains unpublished and
its aliases remain on M19. Onboarding permits the verified core/base `@next`
pair and explicitly prevents mixing base `@next` with pilot `@next`.

### 10. External boundary and documentation

Pass. Post-publication work performed only public reads, temporary consumer
installs and current-state documentation. No pilot publication, dist-tag,
access, maintainer, 2FA, Git, GitHub, repository or provenance mutation
followed the user-run publish. Formatting, documentation, lint, release-tooling
and diff checks pass.

## Outcome

PLAN-023 checkpoint 6 is complete. Core and base Angular `0.4.0` form a
verified immutable public Experimental pair under `next`; both `latest` aliases
and the pilot line remain unchanged. Checkpoint 7 requires separate
authorization before its read-only preflight, and pilot publication retains a
later independent immediate gate.
