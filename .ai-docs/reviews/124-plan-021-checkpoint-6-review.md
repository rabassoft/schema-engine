# PLAN-021 checkpoint 6 complete review — Cycles 1–2

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 6 — base Angular `0.3.0` publication under `next`
- **Authority:** ADR-018 revision 4 and reviews 114–123
- **Outcome:** Cycle 2 passed all nine post-publication areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                        | Correction                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| R124-F01 | STATUS, ROADMAP and the deferred register retained the base pre-publication task/gate after the verified registry publication. | Reconciled all current-state documents, added exact stale-phrase checks and repeated the complete nine-area review from the start. |

## 1. Exact public identity and bytes

Pass. Unauthenticated registry fetches return public
`@rabassoft/schema-engine-angular@0.3.0`. Its 122,465-byte tarball is
byte-identical to the selected source-commit `ce3ef3d` candidate with exact
SHA-512
`c5c5b5a5ccf69d97547099a69d8bc2aab294de50713bb4f105114bfc15cf72ba604905d10a01bf47920c5bfecd6bf0885dd6fdd32dcfb36538118837ad88904a`.

## 2. Integrity, signature and provenance

Pass. Registry integrity is exactly
`sha512-xcW1pcz2nZdUcJmmnYvCqrKU3lBxO7TxBRFL/BXPcrpgSQXRCgG/R5IMW/7Na/CIXdb90y3Ps2U4EYg3rYiQSg==`.
One npm signature is present; package attestations/provenance are absent.

## 3. Access and maintainers

Pass. npm reports the package public. The sole maintainer is
`ricardrabasso <ricard@rabassoft.com>`.

## 4. Manifest, peers and distribution boundary

Pass. Exact name/version, `tslib ^2.8.1`, core peer `^0.3.0`, aligned Angular
core/forms peers `>=22.0.6 <23.0.0`, root export, files, license/source and
absent repository/provenance match the selected artifact. No pilot/Aria/CDK
surface leaked. The public tarball URL exposes no private/local path.

## 5. Tag transition

Pass. Base Angular reports exactly `next: 0.3.0` and unchanged
`latest: 0.2.0`. Core remains `next: 0.3.0`, `latest: 0.2.0`; unqualified
installs therefore remain coordinated on the previous line.

## 6. Unrelated package drift

Pass. Core versions/tags/bytes are unchanged. Base Angular gained only the
authorized `0.3.0` version and `next` transition. The Angular Aria pilot package
remains absent.

## 7. Exact live native consumers

Pass. Clean unauthenticated consumers install exact core/base `0.3.0`, verify
registry signatures and pass core execution plus strict native Angular
compilation at lower `22.0.6` and latest-compatible `22.0.7`.

## 8. `next` live native consumers

Pass. The repeated clean lanes install core/base through `next`, prove both
resolve exactly `0.3.0`, verify signatures and pass the same lower/latest
compilation and execution evidence.

## 9. External and recovery boundary

Pass. Only the authorized base publication occurred. No pilot publication,
standalone dist-tag, access/provenance setting, Git tag, GitHub Release or
repository setting changed. The truthful partial state is a verified live
core/base `next` pair with established defaults unchanged and pilot absent.

## Outcome

Checkpoint 6 is complete. Core/base `0.3.0` are verified under `next`; both
`latest` aliases remain `0.2.0`. Checkpoint 7 requires separate authorization
for its read-only pilot preflight and must stop again before pilot publication.
