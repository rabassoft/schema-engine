# ADR-018 revision 4 complete review — Cycles 1–4

- **Date:** 2026-07-19
- **Decision:**
  [`ADR-018 revision 4`](../adrs/018-licencia-dual-publicacion-experimental.md)
- **Requires:** accepted M19
  [`review 114`](./114-m19-coordinated-0-3-release-promotion-readiness.md)
- **Primary external evidence:** current official npm publish/dist-tag, trusted
  publishing and provenance documentation, reconciled with observed PLAN-013/
  PLAN-015 registry behavior
- **Outcome:** Cycle 4 passed all thirteen areas and closing documentation with
  zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                                                 | Correction                                                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R115-F01 | Revision 3 admitted only the two original packages and could not authorize the SPEC-008 pilot.                                                                          | Added an accepted-contract package admission rule, exact three-package M19 inventory and explicit fourth-package exclusion.                                            |
| R115-F02 | The historical policy treated first-package `latest` as universally mandatory, while current npm docs say explicit `--tag` normally selects that tag.                   | Reconciled official CLI behavior with the previously observed undeletable initial alias; plans must observe presence/absence/deletability and never assume one result. |
| R115-F03 | Dependency publication order and default-channel transition order were not distinguished.                                                                               | Fixed dependency-first `next` publication and dependent-first base/core `latest`, preserving the proven PLAN-015 minimal mixed window.                                 |
| R115-F04 | Revision 3 did not define the pilot's first-publication tag gate or three-package live evidence.                                                                        | Added observed pilot `latest`, separate mutation if absent, exact/next verification and final exact/next/latest/unqualified three-package consumers.                   |
| R115-F05 | Partial failure rules did not enumerate stops after each of the three package writes and two established tag moves.                                                     | Added immutable stop/resume, deprecation/new-version, corrective-tag approval and no-overwrite/unpublish/default-tag-deletion rules.                                   |
| R115-F06 | First-release-only identity, 2FA, third-party and source wording did not govern repeat releases.                                                                        | Generalized every-release identity, write-protected 2FA, source/license and Angular Aria/CDK peer isolation without activating automation.                             |
| R115-F07 | After acceptance, STATUS and current indexes/registers still described revision 3 or revision 4 as pending; two summaries overstated `latest` as universally mandatory. | Reconciled the Accepted revision 4/PLAN-021 gate, retained historical observed aliases and replaced universal claims with registry-observed wording.                   |
| R115-F08 | The Accepted ADR header still said M19 was unauthorized "before this revision is accepted," leaving a false pending condition after acceptance.                         | Replaced it with the current gate: implementation remains unauthorized until PLAN-021 is separately drafted, reviewed and approved.                                    |

## 1. Authority and revision boundary

Pass. Review 114 promotes only release architecture for core/base `0.3.0` and
pilot `0.1.0`. Revision 4 changes publication/package-onboarding policy only.
It does not alter SPEC-008 behavior, versions, exports, peers, Angular support
or stability classification and does not authorize PLAN-021 implementation or
external action.

## 2. Licensing and rights

Pass. AGPL-3.0-only and the separate commercial option remain legally distinct.
Ricardo Rabassó Rodríguez remains the rights holder, Rabassoft the operating
name and `ricard@rabassoft.com` the public contact. No runtime license check,
final commercial terms, SLA or contribution-right expansion is introduced.

## 3. Private repository and Corresponding Source

Pass. Every public artifact independently supplies preferred TypeScript source,
frozen build material, license, notice and instructions. `.ai-docs`, repository
history and unrelated workspace material stay private. Repository sanitation,
public metadata, OIDC and provenance remain D-043.

## 4. Package admission and exact M19 inventory

Pass. Only accepted-contract packages may become publishable. Current admission
is closed to core, base Angular and the Angular Aria pilot; Standard/reference
and any fourth package remain excluded. The M19 versions and peer direction are
exactly SPEC-008's `0.3.0`/`0.3.0`/`0.1.0` matrix.

## 5. Independent SemVer and Experimental state

Pass. Coordinated core/base version equality follows actual Public changes, not
lockstep policy. The pilot begins independently at `0.1.0`. Every package/API
remains Public + Experimental + Active and `latest` never implies Stable.

## 6. npm tag evidence

Pass. Current official npm documentation states that unqualified install uses
`latest` and an explicit publish tag normally selects that tag. Prior Schema
Engine first-publication evidence exposed an initial `latest` that could not be
removed. Revision 4 correctly requires observed registry state and supports
both presence and absence without claiming either as universal.

## 7. Dependency-first publication

Pass. Core exact/`next` precedes base; the verified live pair precedes pilot.
Each publication uses separately inspected immutable bytes and a separate
immediate approval. No evidence is accepted from transient mixed `next` state.

## 8. Dependent-first default transition

Pass. Base Angular `latest` moves before core `latest`, repeating PLAN-015. This
avoids making core `0.3.0` default while base `0.2.0` still requires `^0.2.0`.
The mixed window is explicit, minimal and never accepted as coordinated
consumer evidence.

## 9. Pilot initial default tag

Pass. The pilot publish observes actual aliases. An automatically exposed
`latest` is verified and retained; an absent alias may be established only
through a later separately approved mutation after exact/`next` verification.
Neither outcome changes Experimental status.

## 10. Partial failure and recovery

Pass. Every partial package/tag state remains truthful and immutable. Resume
requires fresh observation; defects use deprecation/new versions; corrective
tags require separate approval. No overwrite, version reuse, assumed unpublish
or deletion of an observed default alias is allowed.

## 11. Security, provenance and external gates

Pass. Every write retains interactive write-protected 2FA while D-043 remains
inactive, immediate approval and post-write observation. No token/OTP enters
project state. Private repository metadata, trusted publishing, workflow,
staging and provenance remain excluded.

## 12. Verification and consumer contract

Pass. PLAN-021 must retain exact artifact/source/legal/security checks, frozen
historical `0.2.0` regression, lower/latest Angular/Aria/CDK tuples and native/
pilot exact/next/latest/unqualified consumers. Registry evidence must match the
selected clean committed bytes and no mixed window can close the release.

## 13. Deferred and document sequence

Pass. D-043, Stable, repository publication, automation, other packages/kits/
targets and every functional capability remain inactive. Acceptance authorizes
only PLAN-021 preparation and complete review; that plan still requires formal
approval and separate local/Git/npm gates.

## Cycle 4 result

Cycle 4 repeated all thirteen areas and closing-document reconciliation after
every correction and produced zero findings with no unresolved change request.
ADR-018 revision 4 is Accepted without authorizing implementation, commit,
push, registry access, publication or tag mutation.
