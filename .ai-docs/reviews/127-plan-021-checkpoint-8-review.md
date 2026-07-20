# PLAN-021 checkpoint 8 review — Cycles 1–2

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 8 — pilot `latest` observation and retention
- **Authority:** ADR-018 revision 4 and reviews 114–126
- **Outcome:** Cycle 2 passed all seven checkpoint areas with zero findings

## Cycle 1 finding and correction

| ID       | Finding                                                                                  | Correction                                                                                          |
| -------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| R127-F01 | The first closing pass found non-canonical formatting in the deferred-decision register. | Applied the repository formatter and repeated all seven checkpoint areas plus closing verification. |

## 1. Observed branch

Pass. Read-only npm metadata confirms that the first pilot publication
automatically established `latest: 0.1.0`. The checkpoint therefore takes
PLAN-021's retention branch; the optional `npm dist-tag add` branch is
inapplicable.

## 2. Exact bytes, integrity and signature

Pass. The public pilot tarball remains byte-identical to the selected
28,192-byte `ce3ef3d` candidate, with integrity
`sha512-ShvnGP8G4Sl9z+LwYIlMCmCd0ROLTuGnLKUnx2yqqg1zDp68DI2LwbeJTeakqUWl3SMT7ktXiw3btnpHtY1UuA==`
and the expected npm signature. The complete three-package live-byte verifier
passes.

## 3. Access and maintainership

Pass. The pilot remains public with sole expected maintainer
`ricardrabasso <ricard@rabassoft.com>`.

## 4. Manifest and distribution boundary

Pass. Base Angular peer `^0.3.0`, Angular/Aria/CDK ranges, `tslib`, root and
stylesheet exports, stylesheet side effect and AGPL license remain exact.
Repository metadata and provenance remain absent.

## 5. Pilot aliases

Pass. Both `next` and `latest` resolve to the inspected `0.1.0`. The observed
automatic default is retained without adding, removing or changing an alias.

## 6. Unrelated registry state

Pass. Core/base remain `next: 0.3.0` and `latest: 0.2.0`. No unrelated package,
access, maintainer, settings or tag drift was observed.

## 7. External and recovery boundary

Pass. Checkpoint 8 performed public reads only. No `npm dist-tag`, publication,
access/provenance, GitHub, repository or Git action occurred. Checkpoint 9's
base Angular default transition remains separately gated.

## Outcome

Checkpoint 8 is complete after cycle 2 passed with zero findings. The automatically created pilot
`latest: 0.1.0` is verified and retained without mutation. Stop with no active
implementation task before checkpoint 9's separately authorized read-only
preflight.
