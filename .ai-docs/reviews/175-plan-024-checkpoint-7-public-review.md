# PLAN-024 checkpoint 7 public verification — Cycles 1–4

- **Date:** 2026-07-22
- **Plan:** Approved
  [`PLAN-024 revision 0`](../plans/024-sanitized-public-repository.md)
- **Checkpoint:** 7 — public visibility and anonymous verification
- **Authority:** Ricard explicitly authorized the sole visibility mutation
- **Outcome:** Cycle 4 passed the complete public boundary with zero unresolved
  findings; the checkpoint closure commit/atomic fast-forward remains separately
  gated

## Exact transition

- Corrective commit `3b415350627fbac423ce806231315e475de98f72`
  passed GitHub CI on both private `main` and `develop`.
- The authenticated account was `rabassoft`; the repository was private,
  default `main`, with both exact refs at the corrective commit and zero tags.
- The authorized command changed only `rabassoft/schema-engine` visibility from
  private to public. No branch, tag, feature, merge, Actions, npm or package
  setting was mutated.
- Post-transition observation retained default `main`, both exact refs, Issues
  enabled, Discussions disabled, all three merge methods enabled, merged-branch
  deletion disabled, Actions enabled/all actions, SHA pinning not yet enforced,
  read-only default workflow permission and no Actions PR approval.

## Anonymous and sanitized-source verification

- Unauthenticated Git HTTPS exposed only `main` and `develop`, both at
  `3b415350627fbac423ce806231315e475de98f72`, plus `HEAD`; no tag exists.
- A fresh credential-free clone selected exact public `main`, tracked exact
  public `develop`, passed strict Git integrity and ended clean.
- Pinned Gitleaks v8.30.1 scanned approximately 6.30 MB across 68 commits with
  no leak.
- Public-tree policy passed 742 candidate files and reachable-history policy
  passed 68 commits/1,802 path-blob pairs with zero findings.
- Unauthenticated GitHub API/HTTP exposed public identity, default `main`,
  README, root AGPL license and security/contribution/conduct policies.
- Documentation checked 265 Markdown files and 875 local links. Public source,
  `.ai-docs`, governance and both reference applications remain present.

## Package and verification isolation

- npm still resolves core/base Angular `0.4.0` and Angular Aria `0.2.0` under
  exact, `next` and `latest` to their previously recorded integrity values.
- Registry metadata still exposes no `repository`, `homepage` or `bugs` claim;
  immutable manifests retain `provenance: false`. No npm mutation occurred.
- The live M21 helper correctly remained unavailable in the anonymous clone
  because its ignored `.release/0.4.0/candidates.json` audit baseline is not
  public content; direct registry reads supplied the required immutable-state
  observation without weakening the public-tree boundary.
- Frozen lifecycle-free install, format, docs, explicit build-before-lint,
  lint, strict types, complete tests/builds, package/source, release tooling,
  twelve public/workflow tests, eight snippets, 540 import boundaries and both
  Angular/Standard reference-unit lanes passed in one complete run.
- The restricted sandbox reproduced the documented Angular esbuild IPC abort;
  the complete matrix was repeated outside that restriction and passed. Known
  Angular bundle/Ajv and Standard chunk warnings remain non-blocking.
- The current checkout intentionally retains a non-public reversible stash from
  checkpoint 6. A local `rev-list --all` therefore includes old private objects;
  public-history evidence is bound to the exact remote refs in the fresh
  anonymous clone, where it passes with zero findings.
- A broad directory scan classified two duplicate generic-key signatures inside
  the ignored workspace-local Playwright browser cache. An exact candidate tree
  built from tracked/non-ignored paths scanned approximately 5.51 MB with
  Gitleaks and no leak; the ignored cache is neither tracked nor public.

## Cycle 1 findings and corrections

| ID       | Finding                                                                                             | Correction                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| R175-F01 | Current onboarding, indexes and accepted ADR status text still described the repository as private. | Reconciled only current state while preserving immutable release history as historical-at-publication statements.   |
| R175-F02 | Documentation guards did not reject the principal pre-checkpoint-7 private-state phrases.           | Added exact stale-current-claim regressions for onboarding, STATUS, ROADMAP, the documentation index and ADR-026.   |
| R175-F03 | The all-local-ref history check included checkpoint 6's deliberately retained private stash.        | Bound public-history evidence to exact public refs in the clean anonymous clone; retained recovery state unchanged. |
| R175-F04 | A broad directory scan included two signatures from the ignored local Playwright browser cache.     | Scanned the exact tracked/non-ignored candidate tree separately; 5.51 MB passed Gitleaks with no leak.              |

## Cycle 2 — evidence-domain correction

Cycle 2 reproduced the expected historical path only through the non-public
local recovery stash. No public ref or anonymous clone contained that object.
The review now distinguishes local recovery reachability from public remote
reachability without deleting, hiding or weakening either evidence set.

## Cycle 3 — candidate-tree scan correction

Cycle 3 classified the two cache-only signatures without allowlisting or
exposing their contents, constructed the exact tracked/non-ignored candidate
tree and passed Gitleaks with no leak.

## Cycle 4 — complete zero-unresolved-finding pass

Cycle 4 repeated authority/scope, exact remote state, anonymous access,
sanitized history/tree, governance/source/docs, npm isolation, GitHub-setting
non-drift, full clean-clone matrix and documentation/diff checks with zero
unresolved findings.

Checkpoint 7 remains active only for its separately approved closure commit and
atomic fast-forward of both still-unprotected public branches. Checkpoint 8
settings, npm metadata/trusted publisher and every release action remain gated.
