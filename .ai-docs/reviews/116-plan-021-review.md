# PLAN-021 complete review — Cycles 1–3

- **Date:** 2026-07-19
- **Plan:**
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Authority:** Accepted SPEC-008 v0.1.0, ADR-010 revision 1, ADR-018
  revision 4, ADR-024 revision 1, accepted reviews 114/115 and completed
  PLAN-020 revision 0
- **Outcome:** Cycle 3 passed all fourteen areas and closing documentation with
  zero findings

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                                                                        | Correction                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R116-F01 | The initial registry preflight proved only the core target and did not close all three target names, publisher authority or the verified `0.2.0` tag baseline. | Required absence/control for every target, exact core/base `next`/`latest: 0.2.0`, immutable baseline bytes, absent pilot and no unrelated drift before any write.  |
| R116-F02 | Checkpoints 6 and 7 inherited the registry-read gate only indirectly, making their fresh live preflights less explicit than checkpoint 5.                      | Added a separate external read-only authorization requirement to every package preflight.                                                                           |
| R116-F03 | Base, pilot and dist-tag post-write sections did not repeat every ADR-018 byte/signature/metadata/peer/source/provenance observation.                          | Expanded every write's immediate verification to the complete applicable package boundary and unrelated-drift check.                                                |
| R116-F04 | The pilot's first creation verified public access but did not explicitly reobserve the new package ownership/maintainer identity.                              | Added the required post-creation ownership/maintainer identity check without exposing credentials.                                                                  |
| R116-F05 | Established `latest` values were described only as observed, so an unexplained pre-existing mixed/drifted baseline could have advanced.                        | Fixed the accepted precondition to verified core/base `0.2.0`; any mismatch now stops before M19 publication or default transition.                                 |
| R116-F06 | Current-state/index documentation still described PLAN-021 as not drafted after its complete review and approval.                                              | Reconciled STATUS, ROADMAP, deferred register, documentation indexes, onboarding and WORKLOG with Approved PLAN-021 and local checkpoint 1 as the sole next action. |
| R116-F07 | Cycle 2 found the Approved plan header still saying implementation was unauthorized until review/approval, contradicting the completed gate.                   | Recorded local checkpoints 1–3 as authorized and retained separate checkpoint 4, registry-read and per-write gates.                                                 |

## 1. Authority and scope

Pass. The plan delivers only completed M18 under the exact accepted release
architecture. It does not alter any SPEC-008 behavior, export, peer, style,
support tier or version and activates no functional deferred capability.

## 2. Exact package inventory

Pass. Core/base Angular are exactly `0.3.0`; the independent pilot is exactly
`0.1.0`. Peer direction is core → base → pilot, and a fourth package,
Standard/reference or the private validator cannot enter the release.

## 3. SemVer, stability and channels

Pass. Coordinated equal core/base versions do not create lockstep policy. All
three packages and APIs remain Public + Experimental + Active. `next` is the
recommended staged channel and every observed `latest` is routing only.

## 4. Licensing, rights and Corresponding Source

Pass. Every artifact independently carries AGPL-3.0-only/commercial notices,
preferred TypeScript and a frozen build harness. Ricardo Rabassó Rodríguez
retains rights; Angular Aria/CDK remain unbundled MIT peers. Private repository
history and `.ai-docs` remain excluded.

## 5. Release tooling and historical evidence

Pass. One validated descriptor owns the unequal three-package matrix and
dependency order. Focused failure tests are required, while the byte-identical
published `0.2.0` verifier remains independent of mutable tags and cannot be
rewritten as M19 evidence.

## 6. Local candidates and complete verification

Pass. Checkpoints 1–3 are reversible and local. The frozen workspace, all M18
checks, both reference browser lanes, lower/latest consumers, source rebuilds,
security audit, dry runs, neutral copying and complete repeated review precede
candidate selection.

## 7. Dirty tree and Git boundary

Pass. Dirty candidates cannot be selected for publication. Commit and private
push require their own authorization, the unrelated analytics opt-out is
accounted for explicitly, and clean rebuilt bytes must match or restart the
review. No Git tag or GitHub Release is admitted.

## 8. Registry identity and security

Pass. Every fresh registry preflight is separately gated. Exact identity,
organization control, all package names, write-protected 2FA, registry,
versions, aliases and candidate hashes are observed without persisting tokens,
OTPs or recovery material. Pilot ownership is rechecked immediately after its
first creation.

## 9. Dependency-first publication

Pass. Core exact/`next` is completely verified before base; the live pair and
native consumers pass before pilot. Each package write has a unique immediate
approval and complete post-write observation. No dependent advances after a
failed or unexpected predecessor.

## 10. Pilot initial `latest`

Pass. The first publication does not assume presence, absence or deletability.
An observed correct alias is retained; an absent alias requires a later
separate mutation after exact/next verification, followed by complete package
and tag observation.

## 11. Dependent-first established defaults

Pass. Verified base/core `latest: 0.2.0` is the required starting state. Base
moves first and creates a documented minimal mixed window from which no
consumer evidence is accepted; core moves only through its own approval and
immediate verification.

## 12. Partial failure and immutable recovery

Pass. The matrix covers every package/tag stop. Bytes are never overwritten,
versions reused or assumed unpublishable. Defects use deprecation/new SemVer;
tag corrections need separate approval, and observed defaults are never
assumed deletable.

## 13. Consumer and closure evidence

Pass. Final evidence requires exact/`next`/`latest`/unqualified native and
pilot lanes at lower and latest-compatible tuples, all 22 SPEC rows, complete
package/source/security/browser gates and a final full zero-finding review.
Partial or mixed states cannot close M19.

## 14. Exclusions, documents and authorization

Pass. D-043, public repository, OIDC/provenance, Stable, other frameworks/UI
kits, Standard publication, support SLA and functional work remain inactive.
Approval authorizes local checkpoints 1–3 only; Git, registry reads, every
publish and every tag write retain separate gates. Current-state documents
identify checkpoint 1 as the exact next action.

## Cycle 3 result

Cycle 3 repeated all fourteen areas and closing-document reconciliation after
every correction. It produced zero findings and no unresolved change request.
PLAN-021 revision 0 is Approved under the standing zero-finding acceptance
rule. No implementation, commit, push, registry access, publication or
dist-tag mutation occurred.
