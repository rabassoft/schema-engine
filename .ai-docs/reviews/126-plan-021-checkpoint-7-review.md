# PLAN-021 checkpoint 7 review — Cycles 1–4

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 7 — Angular Aria pilot `0.1.0` publication under `next`,
  post-publication verification
- **Authority:** ADR-018 revision 4 and reviews 114–125
- **Outcome:** Cycle 4 passed all nine post-publication areas with zero findings

## Cycles 1–3 findings and corrections

| ID       | Finding                                                                                                                                                 | Correction                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| R126-F01 | The live exact consumer runner coupled a frozen Angular tuple to offline package installation, so the newly published pilot had no cached npm metadata. | Limited offline installation to candidate mode; exact/`next` modes may now resolve public package metadata while frozen tuple selection stays intact. |
| R126-F02 | The first closing pass found non-canonical formatting in this review and the deferred-decision register.                                                | Applied the repository formatter to both documents and repeated the complete review and closing checks.                                               |
| R126-F03 | STATUS's release-source line called only core/base public and left the pilot described merely as selected after publication.                            | Reworded the line to identify the complete three-package public line and repeated all nine review areas.                                              |

After the correction, the complete review was repeated from public metadata and
consumer installation rather than checking only the affected command.

## 1. Exact public identity and selected bytes

Pass. The public `@rabassoft/schema-engine-angular-aria@0.1.0` tarball is
exactly 28,192 bytes with SHA-512
`4a1be718ff06e1297dcfe2f060894c0a609dd1138b4ee1a72ca527c76caaaa0d730e9ebc0c8d8bc1b7894de6a4a945a5dd2313ee4b578b0ddbb67a47b58d54b8`
and integrity
`sha512-ShvnGP8G4Sl9z+LwYIlMCmCd0ROLTuGnLKUnx2yqqg1zDp68DI2LwbeJTeakqUWl3SMT7ktXiw3btnpHtY1UuA==`.
These bytes equal the selected clean `ce3ef3d` candidate.

## 2. Integrity, signature and provenance

Pass. Unauthenticated registry metadata exposes the exact reviewed integrity
and npm signature. No attestation, trusted publisher or provenance claim is
present.

## 3. Public access and maintainership

Pass. The package is public and has the sole expected maintainer
`ricardrabasso <ricard@rabassoft.com>`. No ownership or access setting outside
the new package was changed.

## 4. Manifest, peers, exports and distribution boundary

Pass. The public manifest retains base Angular peer `^0.3.0`, Angular core
`>=22.0.6 <23.0.0`, Aria/CDK `>=22.0.5 <23.0.0`, and only `tslib ^2.8.1` as a
runtime dependency. Root and `./styles.css` exports, stylesheet side effects,
exactly six Public Experimental CSS properties, license and Corresponding
Source match the selected artifact. Repository metadata remains absent.

## 5. Observed aliases and unrelated registry drift

Pass. The first publication established both `next: 0.1.0` and an automatic
`latest: 0.1.0`; checkpoint 7 records this observation but performs no tag
mutation. Core/base remain `next: 0.3.0` and `latest: 0.2.0`. No unrelated
package, alias or setting drift was observed.

## 6. Exact lower and latest-compatible consumers

Pass after R126-F01. Exact public package versions pass native and pilot lanes
at Angular `22.0.6` and registry-current compatible `22.0.7`, both with
Aria/CDK `22.0.5`, through strict installation, partial compilation, type
checking, unit behavior, production build and Chromium.

## 7. `next` lower and latest-compatible consumers

Pass. All three public packages resolve through `next` to core/base `0.3.0`
and pilot `0.1.0`. The same native/pilot evidence passes at Angular `22.0.6`
and `22.0.7` with Aria/CDK `22.0.5`.

## 8. Tooling and recovery boundary

Pass. Candidate mode remains frozen and offline; only live exact/`next` modes
may retrieve registry metadata. A publication defect would require a new SemVer
version rather than overwrite or unpublish. No tag, access, provenance, GitHub,
repository, Git tag or Git mutation was attempted during verification.

## 9. Documentation and external gate

Pass. PLAN-021, release notes, ROADMAP, STATUS, deferred register, index and
WORKLOG record the observed three-package `next` line and automatic pilot
`latest` without claiming M19 completion. Checkpoint 8 remains a separate
read-only observation/retention gate; established base/core defaults have not
moved.

## Outcome

Checkpoint 7 is complete. Cycle 4 repeated all nine areas after the runner,
documentation, formatting and state-wording corrections and produced zero findings. Stop with no active
implementation task before checkpoint 8; no registry or Git mutation is
authorized.
