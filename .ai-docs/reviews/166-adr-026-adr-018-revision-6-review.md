# ADR-026 and ADR-018 revision 6 complete review — Cycles 1–3

- **Date:** 2026-07-21
- **State:** Accepted after cycle 3 under Ricard's option-A selection and
  standing zero-finding review authorization
- **Documents:**
  [`ADR-026 revision 0`](../adrs/026-public-repository-and-secure-releases.md)
  and
  [`ADR-018 revision 6`](../adrs/018-licencia-dual-publicacion-experimental.md)
- **Authority reviewed:** review 165, D-043, ADR-009, ADR-010, ADR-018 revision
  5, completed PLAN-023/M21, current reachable history/tree, observed GitHub
  settings and current official npm/GitHub trusted-publishing documentation
- **Outcome:** Cycle 3 passed all fourteen areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                       | Correction                                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R166-F01 | Review 165 and current-state documents still awaited A/B after Ricard selected option A.                      | Recorded preservation of sanitized reachable history and public `.ai-docs` as the selected M22 architecture.                                                |
| R166-F02 | ADR-018 revision 5 required a private repository and still described D-043/OIDC/provenance as deferred.       | Added revision 6, retaining current privacy until implementation while delegating the selected future transition to ADR-026.                                |
| R166-F03 | A history rewrite could invalidate the public resolution of source commit IDs embedded in immutable packages. | Required an old-to-new commit map, tree-equivalence proof and continued package-local Corresponding Source authority without retroactive provenance claims. |
| R166-F04 | Independent-review and environment self-review restrictions could deadlock the current sole maintainer.       | Required enforceable solo-maintainer PR/check/environment controls now and stronger independent review only when another authorized maintainer exists.      |
| R166-F05 | Trusted-publishing assumptions did not reflect current npm prerequisites or automatic provenance behavior.    | Checked official npm/GitHub documentation and recorded matching metadata, hosted runner, OIDC permission and observed Node/npm minimums as rechecked gates. |
| R166-F06 | Repository preparation and the first provenance-bearing package release were not cleanly separated.           | Limited PLAN-024 to repository/governance/workflow preparation; future metadata, npm configuration and publication require a later release promotion/plan.  |

## Cycle 2 findings and corrections

| ID       | Finding                                                                                                     | Correction                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| R166-F07 | ADR-018 retained its revision-5 date and two criteria still described D-043/trusted publishing as deferred. | Updated revision metadata and made M22 active only for preparation while future package/OIDC publication remains separately gated. |
| R166-F08 | The indexes and persistent state did not expose the accepted ADR pair or exact PLAN-024 next action.        | Reconciled ADR/documentation indexes, ROADMAP, Deferred, STATUS and prepend-only WORKLOG before restarting the complete review.    |
| R166-F09 | Review 165 did not preserve its original outcome while also recording the later option-A choice.            | Added a dated selection follow-up without rewriting the completed promotion review's findings or cycle-2 conclusion.               |

## Cycle 3 — complete zero-finding pass

### 1. Authority and scope

Pass. ADR-026 implements only review-165 option A and D-043's promoted M22
design. ADR-018 revision 6 changes only repository/source/release-security
architecture. No runtime, API, SPEC, framework, package or version is selected.

### 2. Current versus future state

Pass. The repository remains private now. Public visibility is an independently
approved PLAN-024 gate after sanitization, remote-branch reconciliation and
fresh-clone verification; document acceptance performs no mutation.

### 3. Reachable-history model

Pass. A fresh remote mirror, not the local object database, defines publication
input. The selected lineage is retained with deterministic minimal
substitutions, explicit ref mapping and complete before/after evidence.

### 4. Public-content and privacy policy

Pass. `.ai-docs`, source, reference applications, tests and scripts are
intended public only after every reachable blob passes secret, personal-data,
rights, filename and generated-file classification. Allowed public identity and
release evidence are explicit.

### 5. Historical source continuity

Pass. Rewritten source hashes receive a public mapping and tree-equivalence
proof. Immutable npm bytes are untouched; embedded package-local Corresponding
Source remains authoritative and no historical release gains retroactive
provenance.

### 6. Licensing and contributions

Pass. AGPL/commercial dual licensing, rights holder and third-party boundaries
remain unchanged. Issues/non-code feedback may be public, but external code is
not merged before a separate rights-assignment/CLA decision.

### 7. Branches and governance

Pass. `main` remains default/release, `develop` integration, and both receive
the strongest available PR/check/no-force controls. Requirements are ordered so
checks exist before enforcement and do not claim unavailable plan features.

### 8. Solo-maintainer safety

Pass. The architecture preserves authenticated human approval without requiring
an impossible independent reviewer. Self-review prevention and higher review
counts become mandatory only when another authorized maintainer exists.

### 9. Workflow isolation and least privilege

Pass. Pull-request code has no publish authority. Only the protected manual
publish job receives `contents: read` and `id-token: write`; actions are
allowlisted/SHA-pinned and long-lived npm credentials are absent.

### 10. Trusted publishing and provenance

Pass. Official current requirements are treated as reobserved minimums, not
permanent pins. Repository metadata must exactly match public source; trusted
publishers are package-specific; provenance is accepted only after registry
verification of a future public OIDC release.

### 11. Transition and recovery

Pass. Manual write-protected 2FA remains the proven recovery path until a
successful OIDC publication. Traditional automation-token restrictions follow,
not precede, that proof. Every destructive/external mutation has an immediate
approval and read-only post-check.

### 12. Plan boundary

Pass. PLAN-024 may sanitize/publish/configure the repository and prepare the
reviewed workflow, then stops. Package version/metadata, npm trusted-publisher
settings and first provenance release require a later promotion and plan.

### 13. Conflicts and deferred boundaries

Pass. ADR-026 and ADR-018 revision 6 are coordinated; the latter retains current
private-source duties until the former is implemented. React, Vue, legacy
Angular and all unrelated Deferred capabilities remain inactive.

### 14. Documentation and verification

Pass. ADR/README indexes, review 165 follow-up, D-043, ROADMAP, compact STATUS
and prepend-only WORKLOG agree on accepted design and inactive implementation.
Formatting, documentation/link validation and diff checks pass with the
unrelated `angular.json` change preserved outside this scope.

## Outcome

Cycle 3 is the required complete zero-finding pass. ADR-026 revision 0 and
ADR-018 revision 6 are Accepted. The exact next action is to prepare and
completely review PLAN-024; no implementation, Git, GitHub, npm, history,
visibility, commit or push action is authorized.
