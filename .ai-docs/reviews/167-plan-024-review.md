# PLAN-024 complete review — Cycles 1–3

- **Date:** 2026-07-21
- **Plan:** Approved
  [`PLAN-024 revision 0`](../plans/024-sanitized-public-repository.md)
- **Authority:** ADR-026 revision 0, ADR-018 revision 6, review 165 option A,
  review 166 and completed PLAN-023/M21
- **External references checked:** current official npm trusted-publishing/
  provenance requirements; GitHub visibility, branch protection, Actions
  permission/SHA-pinning, deployment-environment and security APIs; official
  Gitleaks history-scan guidance
- **Outcome:** Cycle 3 passed all sixteen areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                        | Correction                                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| R167-F01 | Plan approval could be read as authorizing downloads, Git or external work.                                    | Limited approval to local checkpoint 1 and added an explicit gate before every later external/destructive class.                                 |
| R167-F02 | A rewrite map committed before filtering would be cyclic or contain incomplete new IDs.                        | Generate the tool map after filtering, then add one post-rewrite public mapping/evidence commit selected for both branches.                      |
| R167-F03 | Sanitization from the current object database could include dangling/private local objects.                    | Required a fresh exact remote mirror and prohibited mirror/backup/unreachable-ref pushes.                                                        |
| R167-F04 | Tool names alone did not provide reproducible or trustworthy scan/rewrite evidence.                            | Added official-source acquisition, version/SHA-256 recording and positive/negative/deterministic fixture proof.                                  |
| R167-F05 | A prepared npm workflow could become accidentally publish-capable before the future release decision.          | Required current-manifest metadata/descriptor guards, no npm publisher configuration and an explicit non-publish proof.                          |
| R167-F06 | Required checks or independent review could be configured before they existed or deadlock the sole maintainer. | Ordered successful context observation before enforcement and fixed zero impossible independent approvals with protected human environment gate. |
| R167-F07 | Post-publication rollback language could imply that public disclosure can be undone.                           | Distinguished private pre-visibility atomic rollback from post-public incident response, where reprivatizing cannot revoke prior cloning.        |

## Cycle 2 findings and corrections

| ID       | Finding                                                                                                 | Correction                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| R167-F08 | STATUS/ROADMAP/Deferred still stopped at ADR acceptance instead of the reviewed PLAN-024 gate.          | Reconciled current state to Approved PLAN-024 with checkpoint 1 as the exact next action and no active implementation. |
| R167-F09 | Plan/review indexes did not expose PLAN-024 and review 167.                                             | Added both links and kept older historical plan/review states unchanged.                                               |
| R167-F10 | New plan/review and current-state edits initially required repository formatting.                       | Formatted them mechanically and restarted the complete review.                                                         |
| R167-F11 | Checkpoint 1 required full-SHA action pins despite forbidding the network reads needed to resolve them. | Moved action resolution/workflow creation to gated checkpoint 2; checkpoint 1 now prepares only local guard logic.     |
| R167-F12 | Post-rewrite checkpoints could close with truthful STATUS/WORKLOG only in the local worktree.           | Added gated closure commits before protection and protected feature/develop/main PR reconciliation after it.           |

## Cycle 3 — complete zero-finding pass

### 1. Authority and promoted scope

Pass. The plan implements only ADR-026/review-165 option A and coordinated
ADR-018 repository duties. It selects no runtime, framework, package or release
change.

### 2. Current/future truth

Pass. The repository remains private, branches unprotected and npm metadata/
settings unchanged now. Every future state is tied to an observed checkpoint.

### 3. Public content

Pass. Source, `.ai-docs`, references and policies become public only after
complete classification. Forbidden data classes and allowed public identity/
release evidence are explicit.

### 4. Tool trust and scanner coverage

Pass. External tools require separate authorization, official immutable source,
checksums, pinned invocation and adversarial fixtures. Gitleaks is supplemented
by independent history/content/rights checks without premature allowlists.

### 5. Rewrite determinism and mapping

Pass. A fresh remote mirror, private replacement spec, exact two-ref rewrite,
tool commit map, tree-diff allowlist and post-rewrite evidence commit preserve
auditable continuity without cyclic identifiers.

### 6. Git safety

Pass. A verified private bundle, exact dual leases, atomic two-ref push and no
mirror/tag/backup-ref push bound the destructive operation. Local adoption is
separate and requires a clean tree plus exact remote hashes.

### 7. Immutable package source

Pass. Historical package bytes/source stay authoritative; the public map
explains rewritten IDs without modifying releases or claiming provenance.

### 8. Public governance

Pass. Security, contribution, conduct, support and Issues/Discussions boundaries
match ADR-018/026 and do not accept external code by implication.

### 9. CI workflow

Pass. PR/push CI is read-only, frozen and complete; action pins and required
contexts are observed before protections depend on them.

### 10. Publish-workflow isolation

Pass. Only a manual protected job can request OIDC, current manifests fail
before publish and no token/trusted-publisher/npm setting enters PLAN-024.

### 11. Visibility transition

Pass. Exact sanitized refs and policies precede the separately approved public
toggle; unauthenticated clone/content verification immediately follows it.

### 12. GitHub controls

Pass. Branch/ruleset, Actions, token, environment and security mutations are
independent, reobserved and compatible with one maintainer without silently
claiming unavailable plan features.

### 13. Recovery

Pass. Disposable candidate recovery, pre-public private atomic rollback,
post-public incident semantics, setting drift and workflow failure all stop
fail-closed without npm fallback.

### 14. Verification and completion

Pass. Local, clean, hosted, historical, anonymous, package and setting matrices
cover every completion criterion and require a final zero-finding pass.

### 15. Deferred and external boundaries

Pass. Package metadata, npm trusted publishers, provenance release, tags,
hosting, frameworks and functional work remain outside PLAN-024.

### 16. Documentation and diff

Pass. Plan, review, ADR/README indexes, ROADMAP, Deferred, compact STATUS and
prepend-only WORKLOG agree. Formatting, documentation/link and diff checks pass;
the tree contains only plan-state documentation changes in this task.

## Outcome

Cycle 3 is the required complete zero-finding pass. PLAN-024 revision 0 is
Approved. Only local checkpoint 1 is authorized; no implementation has started.
Every later network, Git, destructive or external action retains its stated
gate.
