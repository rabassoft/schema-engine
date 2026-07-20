# PLAN-021 checkpoint 5 complete review — Cycles 1–3

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 5 — core `0.3.0` publication under `next`
- **Authority:** ADR-018 revision 4 and reviews 114–121
- **Outcome:** Cycle 3 passed all nine post-publication areas with zero findings

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                                                | Correction                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| R122-F01 | The clean-consumer runner rejected a live core `next` specifier unless base Angular was also live, blocking the planned partial state. | Required `--live-core` rather than `--live-angular` for any live specifier, then repeated both exact and `next` lanes completely. |
| R122-F02 | STATUS/ROADMAP retained pre-publication absence/tag/gate statements after the verified core write.                                     | Removed superseded current verification and reconciled the milestone/gates with the truthful partial-live state.                  |

## 1. Exact public identity and bytes

Pass. Unauthenticated registry fetches return public
`@rabassoft/schema-engine@0.3.0`. Its 213,647-byte tarball is byte-identical to
the selected candidate from source commit
`ce3ef3dd3f9154c95896bcefa22e31b4f293eda0`, with exact SHA-512
`933779e7f764353d2a0d452ab3d08c8588d1c445f538b075960af4ab4116903e26d8f625e41a8ad4271e4c50f479a49b0fdd75fdf8531d90b78e26a60abf2181`.

## 2. Integrity, signature and provenance

Pass. Registry integrity is exactly
`sha512-kzd55/dkNT0qDUUqs9CMhYjRxEX1OLB1lgr0q0EWkD4m2PYl5BqK1CceTFD0eaSbD911/fhTHZC3jiamCr8hgQ==`.
One npm signature is present; attestations/provenance are absent.

## 3. Access and maintainers

Pass. npm reports the package public. The sole maintainer is
`ricardrabasso <ricard@rabassoft.com>`.

## 4. Manifest and distribution boundary

Pass. Exact name/version, `AGPL-3.0-only`, author/contact, root export, files,
no runtime dependencies, no repository URL and package-local
LICENSE/NOTICE/README/SOURCE/source-build contents match the inspected
candidate. The public tarball URL contains no local username or private path.

## 5. Tag transition

Pass. Core reports exactly `next: 0.3.0` and unchanged `latest: 0.2.0`.
Unqualified/default installation therefore remains on the previous line and no
Stable implication is introduced.

## 6. Unrelated package drift

Pass. Base Angular still contains only `0.1.0`/`0.2.0` with both `next` and
`latest` at `0.2.0`. The Angular Aria pilot package remains absent. No unrelated
package, version or tag changed.

## 7. Exact clean consumers

Pass. Clean unauthenticated core exact `0.3.0` consumers compile and execute.
The selected unpublished base Angular candidate compiles against that live core
at lower Angular `22.0.6` and current latest-compatible `22.0.7`.

## 8. `next` clean consumers

Pass after R122-F01. The same complete lower/latest-compatible lanes install
core through `next`, prove the installed version is exactly `0.3.0`, compile
and execute against the selected base candidate.

## 9. External and recovery boundary

Pass. Only the authorized core publish occurred. No base/pilot publication,
standalone dist-tag, access/provenance setting, Git tag, GitHub Release or
repository setting changed. The truthful partial state is live core `next`
with established defaults and dependents unchanged.

## Outcome

Checkpoint 5 is complete. Core `0.3.0` is verified under `next`; `latest`
remains `0.2.0`. Checkpoint 6 requires separate authorization for its read-only
base Angular preflight and must stop again before base publication.
