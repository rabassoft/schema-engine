# PLAN-024: Sanitized public repository and secure-release preparation

- **Status:** Completed
- **Date:** 2026-07-21
- **Approval date:** 2026-07-21
- **Revision:** 0 — initial M22 delivery plan
- **Requires:** Accepted
  [`ADR-026 revision 0`](../adrs/026-public-repository-and-secure-releases.md),
  [`ADR-018 revision 6`](../adrs/018-licencia-dual-publicacion-experimental.md),
  accepted
  [`review 165`](../reviews/165-d043-m22-repository-publication-promotion-readiness.md)
  option A and completed [`PLAN-023 revision 0`](./023-coordinated-experimental-0-4-release.md)
- **Architecture review:**
  [`review 166`](../reviews/166-adr-026-adr-018-revision-6-review.md) cycle 3
  passed all fourteen areas with zero findings
- **Complete review:** [`review 167`](../reviews/167-plan-024-review.md) cycle 3
  passed all sixteen areas with zero findings
- **Milestone:** M22 — sanitized public repository and secure-release
  preparation
- **Capability:** promoted D-043 repository slice only
- **Implementation:** Checkpoints 1–7 completed after reviews 168–175; review
  175 cycle 6 verified the corrective public closure with zero findings.
  Checkpoint 8 settings passed review 176 cycle 7 and protected publication into
  `develop`, promotion to `main` and reconciliation passed review 176 cycle 11.
  Checkpoint 9's corrected complete closure passed review 177 cycle 3 with zero
  unresolved findings

## 1. Goal and hard boundary

Preserve the existing reachable Git lineage, remove material forbidden by
ADR-026, publish the reviewed repository with `.ai-docs`, establish truthful
public governance and configure the strongest available solo-maintainer GitHub
controls. Prepare—but do not activate—one least-privilege npm OIDC release
workflow for a later separately promoted package release.

This plan ends with repository preparation. It does not add package
`repository` metadata, configure npm trusted publishers, select or publish a
version, create/move a dist-tag, add a Git tag/GitHub Release, claim provenance
or change runtime/API/SPEC behavior.

Plan approval authorizes only local checkpoint 1. Every network read/download,
tool acquisition, commit, push, history rewrite, force update, local branch
adoption, visibility change and GitHub setting mutation retains the explicit
gate stated below. No completed checkpoint implicitly authorizes the next one.

## 2. Frozen starting baseline

Implementation begins by reobserving and recording, without mutation:

- clean `develop`, its exact local HEAD and its exact two-commit-ahead relation
  to `origin/develop` at plan approval;
- `origin/main` and GitHub default `main` at the initial repository commit;
- no tags, 62 currently reachable commits before later plan/implementation
  commits, one intended author identity and no current branch protection;
- private visibility, Issues enabled, Discussions disabled and Actions enabled
  for all actions without SHA pinning;
- the known historical local path in review 132 and no credential-like result
  from the prior heuristic scan;
- current root AGPL license and absence of public governance/community files;
  and
- exact public M21 package/alias state, observed read-only only if a later
  checkpoint genuinely needs it.

The implementation review records actual hashes and counts at each checkpoint.
Any drift is classified before work continues. The plan never treats the
numbers above as permanent assertions after new commits are added.

## 3. Planned repository deliverables

The implementation may add only:

- `SECURITY.md`, `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` under ADR-026;
- `.github/workflows/ci.yml` and `.github/workflows/npm-publish.yml` with every
  external action pinned to a full commit SHA;
- focused repository-history/public-content verification scripts and tests;
- documentation checks for stale private/public, contribution, provenance,
  workflow and package-metadata claims;
- a post-rewrite `.ai-docs/project/HISTORY-REWRITE-MAP.md` generated from the
  selected `git-filter-repo` commit map; and
- checkpoint reviews plus compact persistent-state updates.

The public README must explain source, license, Experimental status, support
boundary, security route, non-code contribution policy and both reference
applications without presenting private/non-published workspace packages as
secret or supported public APIs.

No package manifest receives `repository`, `homepage`, `bugs` or new release
metadata in this plan. Existing immutable npm versions and package-local source
are unchanged.

## 4. Public-content and history verification contract

The audit operates on every object reachable from the exact remote refs selected
for publication, not only the current worktree. Evidence contains paths,
categories, counts, hashes and redacted findings, never a credential value.

Required layers are:

1. default-rule Gitleaks history scan over all selected refs;
2. independent repository scripts for credential/key/auth filename patterns;
3. local absolute path and machine/cache/private-network marker scan;
4. personal-data and public-identity classification;
5. generated artifact, archive, log, coverage, cache and binary inventory;
6. largest-blob and MIME/extension review;
7. third-party notice/license and publication-rights review;
8. `.ai-docs`, reference-app and package/public-boundary classification; and
9. exact reachable commit, tree, blob, parent and author inventories.

No Gitleaks allowlist suppresses a finding before manual classification. A later
minimal allowlist requires its own reviewed justification and a regression
fixture proving it cannot hide a real secret. Dedicated scanner success is
necessary but never substitutes for the independent checks.

The known private replacement specification is created outside the repository
with owner-only permissions, never printed or committed, and identified in
evidence only by checksum and replacement category. The intended public
replacement is a neutral marker. A real credential triggers revocation/rotation
before any rewrite; a rights or personal-data uncertainty stops for Ricard.

## 5. Tool acquisition and reproducibility

Gitleaks and `git-filter-repo` are external tools and are not silently installed
by plan approval. Checkpoint 2 must obtain explicit network/tooling permission,
select official immutable releases, verify publisher source and published
checksums where available, and record exact versions plus binary/script
SHA-256. Tools live outside the repository and are invoked by exact path.

Before accepting their output, focused harmless fixtures prove:

- Gitleaks finds a synthetic secret in reachable history, reports it redacted
  and exits non-zero;
- a clean fixture exits zero;
- `git-filter-repo` replaces only the selected text across multiple commits,
  preserves author/timestamps/tree content outside the substitution and emits a
  complete commit map; and
- rerunning the same pinned tool/specification from the same fixture input
  produces the same sanitized commit IDs.

Tool downloads, temp paths and reports remain outside tracked/public content.
No tool receives GitHub/npm credentials.

## 6. GitHub workflow contract

### 6.1 Continuous integration

`ci.yml` runs for pull requests to `main`/`develop` and pushes to those branches
with read-only permissions. It uses the workspace's declared pnpm version and a
reviewed Node version, frozen lockfile and disabled lifecycle scripts during
installation. Required CI evidence includes:

- formatting, documentation/link checks, lint and strict types;
- complete workspace tests and production builds;
- self-contained package/security, reference snippet/boundary/unit/build and
  release-tooling checks that need neither ignored release baselines nor
  registry access; and
- explicit recording of any browser lane that cannot run on the hosted runner
  rather than silently weakening the local release matrix.

The exact required-check names are taken from successful observed GitHub runs
before branch protection references them.

### 6.2 Prepared npm workflow

`npm-publish.yml` is manual `workflow_dispatch` only, binds the protected
`npm-publish` environment and has no trigger on pull request, push or tag. Build
and verification jobs remain read-only. Only the final publish job receives:

```yaml
permissions:
  contents: read
  id-token: write
```

It uses a GitHub-hosted runner, a toolchain satisfying the current official npm
trusted-publishing minimums, no dependency cache and no npm token/OTP secret.
It accepts only a reviewed release-descriptor identifier and exact protected
`main` commit, rebuilds from frozen source and fails before `npm publish` while
package repository metadata or an accepted future release descriptor is
absent.

PLAN-024 must prove that the workflow cannot publish the current manifests.
It does not configure any npm trusted publisher. A later release plan must
review and activate the exact filename/job/environment/package combination.

## 7. Checkpoint sequence and authority

Every checkpoint updates STATUS/WORKLOG and its checkpoint review immediately.
Before the history replacement, those edits are included in the next already
gated private baseline/candidate commit. After checkpoint 6 changes remote
history, no checkpoint may close with state only in the local worktree:

- checkpoints 6 and 7 each require a separately presented closure commit and
  exact atomic fast-forward of both still-aligned branches after their primary
  mutation passes;
- after checkpoint 8 enables protections, state changes use a short-lived
  branch, successful CI and protected pull requests into `develop` and then
  `main`; and
- checkpoint 9 uses the same protected flow and reconciles `main` back into
  `develop` so future development contains the public closure ancestry.

Every closure commit/push/PR/merge is itself an external action requiring
explicit approval. A checkpoint remains in progress until its truthful state is
reachable from the applicable remote branch.

### Checkpoint 1 — local policy and verification preparation

Authorized by plan approval after this plan is accepted. Locally:

1. add the three public policy documents;
2. add tested public-tree/history verification helpers without embedding the
   forbidden local path or any secret;
3. extend documentation checks and onboarding;
4. prepare locally testable workflow guard logic without adding workflow files
   or unresolved action references;
5. run formatting, docs, lint, types, tests, builds and applicable package/
   source/reference/security checks; and
6. complete a full checkpoint review with zero findings.

No download, external read, Git mutation or history rewrite occurs. Stop for
explicit checkpoint-2 network/tool-acquisition authorization.

### Checkpoint 2 — pinned tools and isolated fixture proof

After explicit authorization:

1. download only official Gitleaks and `git-filter-repo` artifacts outside the
   repository;
2. resolve `actions/checkout`/`actions/setup-node` only from their official
   repositories to exact full commit SHAs and record the source refs;
3. verify and record exact provenance/version/checksum for tools and action
   pins;
4. add both workflow files, prove the guarded npm workflow stops before publish
   on current manifests and statically verify exact permissions/triggers/pins;
5. run the synthetic positive/negative and deterministic rewrite fixtures;
6. repeat the complete local matrix from checkpoint 1; and
7. review all evidence with zero unresolved findings.

No repository remote is cloned yet and no Git/GitHub state changes. Stop for
explicit authorization of checkpoint 3's scoped commit and private push.

### Checkpoint 3 — clean private baseline commit and push

Present the exact scoped diff, verification, author, commit subject and push
command. After explicit authorization:

1. commit only reviewed checkpoint-1/2 repository changes as
   `Rabassoft <ricard@rabassoft.com>`;
2. push `develop` normally to the still-private origin;
3. verify remote `develop` equals the selected local commit while `main`,
   visibility, settings and npm remain unchanged; and
4. rebuild/review from a clean detached worktree at the exact remote commit.

Any non-fast-forward, wrong-account/repository or remote drift stops. Stop for
explicit authorization of checkpoint 4's remote clone and read-only audit.

### Checkpoint 4 — fresh remote mirror audit

From an owner-only temporary directory, clone a fresh mirror of the exact
private remote and freeze the old `main`/`develop` object IDs. Run every layer
in section 4 with pinned tools and redacted reports.

The known historical local path is the only preclassified prohibited content.
Every other scanner result must be classified without a broad allowlist; a real
credential, new prohibited path, private endpoint, rights ambiguity, generated
artifact or unresolved personal data stops before sanitization. Truthful
historical statements may remain after classification. No remote write occurs.

After a complete zero-unresolved-finding review, stop for explicit authorization
to create the local sanitized candidate in checkpoint 5.

### Checkpoint 5 — deterministic sanitized candidate

In a disposable fresh mirror only:

1. create the owner-only replacement specification and record its checksum;
2. run pinned `git-filter-repo` against exactly `main` and `develop`;
3. normalize its commit map into
   `.ai-docs/project/HISTORY-REWRITE-MAP.md` without the private source text;
4. add one new reviewed mapping/evidence commit atop sanitized `develop` and
   select that same commit as the intended `main`/`develop` public baseline;
5. rerun all history/content scans across candidate refs;
6. prove commit-parent/author continuity and exact tree/blob differences:
   reviewed replacement plus mapping/evidence commit only;
7. run the complete workspace/CI/package/source/reference verification from a
   clean ordinary clone of the candidate; and
8. repeat the checkpoint review until zero findings.

No current checkout or remote ref changes. Stop with exact old/new hashes,
bundle/checksum strategy, atomic push command and local-adoption commands for
Ricard's destructive checkpoint-6 approval.

### Checkpoint 6 — atomic remote ref replacement and local adoption

This checkpoint is destructive and must receive immediate explicit approval.
Before mutation, reobserve exact leases, private visibility, clean local tree,
selected candidate and remote account/repository. Create an owner-only private
Git bundle outside the repository and verify it before proceeding.

Push candidate `main` and `develop` atomically with an exact lease for each old
remote ref. Never use an unqualified `--force`; never push mirrors, backup refs,
notes, tags or local unreachable objects. If atomic/lease support or either old
hash differs, stop without changing either ref.

After the atomic push:

1. verify both remote branches equal the one selected sanitized baseline;
2. clone anonymously is still expected to fail because visibility remains
   private;
3. fetch the new refs into the current clean checkout, detach to the exact new
   commit, move local `main`/`develop` only to their verified remote equivalents
   and switch back to `develop`;
4. retain the verified private bundle until M22 final closure; and
5. repeat all scans and the clean matrix from the adopted lineage.

Then update checkpoint evidence/state, review it completely, and stop for
separate approval of one closure commit plus exact atomic fast-forward of both
private branches. Verify both refs and readopt the closure commit locally before
checkpoint 6 is complete.

No visibility or setting changes occur. Stop for separate authorization of
checkpoint 7's visibility transition.

### Checkpoint 7 — public visibility and anonymous verification

Reobserve private visibility, exact sanitized refs, public-policy files, root
license, no tags, workflow guards and no npm trusted publisher/metadata claim.
Present the exact GitHub visibility mutation. After explicit authorization,
change only `rabassoft/schema-engine` from private to public.

Immediately verify through unauthenticated HTTP/Git access:

- public repository identity, default `main` and exact branch hashes;
- fresh anonymous clone with only sanitized reachable history;
- absence of the private replacement text and every prohibited content class;
- README, AGPL, security/contribution/conduct policies, `.ai-docs` links and
  reference sources;
- existing npm packages remain unchanged and do not yet claim repository or
  provenance metadata; and
- no unrelated GitHub feature/setting changed.

Unexpected exposure, ref drift, missing anonymous access or policy mismatch
stops before settings work. Public visibility is not rolled back silently; a
visibility reversal would be a separately approved recovery mutation. Stop for
separate approval of the reviewed checkpoint-7 closure commit and atomic
fast-forward of both still-unprotected branches. Verify anonymous state at that
commit, then stop for checkpoint 8 setting approvals.

### Checkpoint 8 — protected branches, Actions, environment and security

Perform each group as an independently presented and approved mutation followed
by read-only verification:

1. observe available rulesets/classic protections on the now-public plan;
2. protect `main` and `develop` with PR, strict observed required checks,
   conversation resolution, linear history where compatible, no deletion and
   no force push; use zero mandatory independent approvals while Ricard is sole
   maintainer;
3. set default `GITHUB_TOKEN` workflow permission to read-only and disallow
   Actions from approving pull requests;
4. set Actions to selected use with full-SHA pinning, allowing only the exact
   reviewed GitHub-owned actions/workflows required by both files;
5. create/update protected `npm-publish` environment with Ricard as required
   reviewer, `prevent_self_review: false` and deployment restricted to `main`;
6. enable private vulnerability reporting;
7. preserve Issues enabled and Discussions disabled; and
8. allow squash and merge commits, disable rebase merge, delete merged
   short-lived branches and document merge-commit promotion from `develop` to
   `main`; linear-history enforcement remains off because it conflicts with
   preserving that long-lived promotion ancestry.

No branch rule may name a check before a successful run exposes its exact
context. If a desired feature is unavailable, record the strongest available
control and stop if ADR-026's minimum cannot be met; do not silently weaken or
misreport it.

No npm setting, repository secret, package metadata or publish occurs. Record
and publish the checkpoint through the protected short-lived-branch/PR flow,
then stop for explicit authorization of checkpoint 9 final closure review.

### Checkpoint 9 — final public-repository closure

Repeat from fresh unauthenticated clones and read-only APIs:

- every history/content/secret/rights scan and old/new mapping check;
- branch/default/ref/visibility and public policy/link checks;
- CI runs, required contexts, workflow permissions, allowed actions, SHA
  pinning, environment protection and private vulnerability reporting;
- guarded npm workflow non-publish proof and absence of stored npm credentials;
- complete local/hosted workspace, package, source, reference and security
  matrix;
- immutable M19/M21 npm bytes/aliases/metadata and absent repository/
  provenance claims; and
- final documentation, diff and private-backup retention state.

One complete review must pass with zero findings. Then mark PLAN-024/M22
Completed with no active task, publish that closure through protected PRs to
`develop` and `main`, and reconcile `main` back into `develop`. Retained private
backup deletion is a later explicit destructive housekeeping action; future
package metadata/OIDC release work remains separately promoted.

## 8. Git and rewrite invariants

- Only remote `refs/heads/main` and `refs/heads/develop` are rewritten in the
  checkpoint-6 replacement. Both move atomically from exact leased old IDs to
  one selected sanitized baseline.
- Later ordinary closure/history advances follow section 7's separately gated
  fast-forward or protected-PR protocol; no later rewrite is allowed.
- No tag, note, pull-request ref, backup ref or full `--mirror` push is allowed.
- Commit authorship and timestamps remain; committer/hash changes caused by the
  deterministic rewrite are mapped.
- Current-tree changes before rewrite are ordinary reviewed commits; the
  generated map/evidence is one post-rewrite commit.
- The private bundle never enters the repository, logs or public artifacts.
- No GitHub cache purge or support request is assumed necessary before public
  visibility because the repository has never been public; if GitHub retains an
  unexpected public reachable ref, stop and escalate.

## 9. GitHub settings target

| Surface               | Required completed state                                                           |
| --------------------- | ---------------------------------------------------------------------------------- |
| Visibility/default    | Public; default `main`; exact selected sanitized baseline                          |
| Long-lived branches   | `main` release/default; `develop` integration; PR/check protected; no force/delete |
| Review count          | No impossible independent approval while one maintainer; conversations resolved    |
| Actions default token | Read-only; cannot approve pull requests                                            |
| Allowed actions       | Exact reviewed set only; every reference full-SHA pinned                           |
| CI                    | Successful observed required contexts before enforcement                           |
| Publish workflow      | Manual, protected environment, guarded, no current publishable descriptor/metadata |
| Environment           | `npm-publish`; Ricard reviewer; self-review allowed; only protected `main`         |
| Security              | Private vulnerability reporting enabled; public `SECURITY.md` fallback             |
| Community             | Issues on; Discussions off; external code contributions not accepted               |
| Merge policy          | Squash/merge enabled; rebase disabled; merged short-lived branches deleted         |
| npm                   | Unchanged packages/settings/tags; no trusted publisher or provenance activation    |

## 10. Verification matrix

| Area                   | Required evidence                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| Docs/state             | `pnpm docs:check`, formatting, links, indexes, STATUS/ROADMAP/Deferred/WORKLOG                       |
| Source                 | lint, strict types, all workspace tests/builds and clean frozen install                              |
| Packages               | package/artifact/source/security checks; immutable M19/M21 registry observation only when authorized |
| References             | snippet/boundary/unit/build and applicable hosted/browser evidence                                   |
| History before/after   | refs, counts, parents, authors, trees, blobs, largest files and deterministic commit map             |
| Secrets/privacy/rights | Gitleaks plus independent scans; redacted reports; zero unresolved findings                          |
| Rewrite                | fixture determinism, exact substitution, old/new mapping and candidate rerun                         |
| Public access          | unauthenticated clone/API/links/license/policies and prohibited-content absence                      |
| GitHub controls        | branch/ruleset, Actions, token, pins, environment, security, Issues/Discussions                      |
| Release isolation      | guarded workflow cannot publish current tree; npm metadata/settings remain unchanged                 |

Angular builds that reproduce the documented esbuild sandbox IPC limitation
run outside the restricted sandbox. Browser caches remain ignored and no global
cache ownership change enters the plan.

## 11. Recovery model

- Before checkpoint 6, discard and recreate only the isolated candidate; remote
  and current checkout remain untouched.
- Atomic push lease failure changes nothing and requires a fresh audit.
- After atomic push, the private verified bundle and old/new map support an
  explicitly approved atomic rollback while the repository is still private.
- After public visibility, old content may have been cloned. Reprivatizing or
  restoring old refs cannot revoke disclosure and is never an automatic
  recovery; stop, assess, rotate any credential and choose an explicit action.
- A GitHub-setting failure leaves successfully applied settings truthful and
  documented; continue or revert only through a separately approved mutation.
- Workflow failure cannot fall back silently to a token or manual publish.
- Existing npm versions, aliases and package settings are never mutated by
  recovery under this plan.

## 12. Expected repository diff

Allowed:

- the files listed in section 3;
- removal/replacement of only classified prohibited content from the current
  tree and selected history;
- full-SHA lock/pin updates required by the two new workflows;
- deterministic verification fixtures that contain synthetic, unmistakably
  fake secrets only outside distributable/public output;
- generated public commit map/evidence after rewrite; and
- plan/checkpoint/review/current-state documentation.

Forbidden:

- runtime, API, SPEC, schema/UI Schema, renderer, validator or compatibility
  behavior changes;
- package version, dependency, peer, export, `repository`, publication or
  provenance metadata changes;
- accepting external code contributions or adding CLA/commercial terms;
- tracked secrets, private replacement text, private bundle/reports, downloaded
  tools, caches, tarballs or credentials;
- unrelated cleanup or formatting across product source; and
- npm publication/settings, tag, GitHub Release, hosting or another Deferred
  capability.

## 13. Stop conditions

Stop on any:

- authoritative ADR/SPEC conflict or scope expansion;
- real secret, unrevoked credential, uncertain personal data/publication right,
  inaccessible required source or unexpected reachable ref;
- unclassified scanner finding or allowlist request;
- non-deterministic rewrite, incomplete map, author/parent/tree drift outside
  the allowlist or mismatch with an immutable package source claim;
- dirty tree, wrong author/account/repository, failed lease/atomic support,
  unexpected remote branch/tag/protection or local-adoption mismatch;
- failed anonymous clone, prohibited public blob/link or missing policy;
- unavailable control that prevents meeting ADR-026, failed required CI,
  overbroad workflow permission/action allowance or environment bypass;
- package/npm metadata, alias, maintainer, access or provenance drift; or
- any download, commit, push, rewrite, visibility/settings mutation or other
  external/destructive action without its immediate gate.

## 14. Completion criteria

PLAN-024 completes only when:

1. selected reachable history and `.ai-docs` are public with zero unresolved
   secret/privacy/rights/content findings;
2. remote/local branches descend from the mapped sanitized baseline, `main`
   contains final public closure, `develop` contains its reconciled ancestry,
   and the old/new map plus private recovery bundle are verified;
3. anonymous source/license/docs/policy access and full local/hosted verification
   pass;
4. branch, Actions, environment and security controls match section 9;
5. the npm workflow remains guarded and incapable of publishing current
   manifests, while registry/package state is unchanged; and
6. one complete final review passes every area with zero findings and reconciles
   persistent state.

Completion does not authorize package metadata, trusted-publisher npm settings,
release publication, provenance, tag, GitHub Release or backup deletion.

## 15. Review and approval state

Revision 0 was drafted on 21 July 2026 under ADR-026 and ADR-018 revision 6.
Review 167 cycle 1 found and corrected seven authority, history-map, tool,
workflow, branch-protection and recovery issues. Cycle 2 corrected five active-
state, index, network-boundary, checkpoint-state publication and formatting
issues. Cycle 3 repeated all sixteen areas with zero findings.

Revision 0 is Approved under the standing zero-finding authorization. Approval
authorizes checkpoint 1 only. Checkpoint 2's downloads/network, checkpoint 3's
commit/private push, checkpoint 4's remote clone/read-only audit, checkpoint
5's local rewrite candidate, checkpoint 6's destructive ref replacement/local
adoption, checkpoint 7's visibility mutation, each checkpoint-8 setting change
and checkpoint 9's external final review remain separately gated.

### 15.1 Implementation checkpoint 1

Checkpoint 1 completed on 21 July 2026 after review 168 cycle 3 passed the full
local boundary with zero unresolved findings. It added public governance files,
tested current-tree/reachable-history policy checks, documentation guards and a
fail-closed npm trusted-publishing readiness evaluator. The current candidate
tree passes; the current reachable history intentionally remains non-publishable
because the scanner detects the one already classified historical local path.
Current package metadata also remains intentionally incapable of trusted
publication.

No workflow, external tool, network read, download, Git mutation, history
rewrite, GitHub/npm setting, commit or push occurred. Checkpoint 2 remains
unauthorized pending explicit permission for official tool acquisition and
action-SHA resolution.

### 15.2 Implementation checkpoint 2

Checkpoint 2 completed on 22 July 2026 after review 169 cycle 3 passed the full
boundary with zero unresolved findings. Official pinned Gitleaks and
git-filter-repo tools passed redacted positive/negative and deterministic
rewrite fixtures outside the repository. CI and guarded npm workflows use full
official Action commit pins; static tests enforce triggers, least privilege,
source identity, OIDC isolation and fail-closed publication ordering.

The current reachable history retains only the already classified historical
local path, while default Gitleaks reports no leak. Current manifests and
descriptor cannot reach `npm publish`. No repository remote was cloned, no Git
history/ref, GitHub/npm setting or package was mutated, and no commit or push
occurred. Checkpoint 3 remains unauthorized pending presentation and explicit
approval of its scoped private commit/push.

### 15.3 Implementation checkpoint 3

The authorized baseline commit `300eb78b2bdd3033757b234f2937d66f77ed6f22`
was pushed normally to private `develop`. Exact refs, private visibility and
unchanged `main` were verified. Review 170 cycle 1 then found that the committed
workflows linted before a clean checkout built internal declarations.

The corrected candidate adds build-before-lint ordering and a static regression
guard. Ricard separately authorized normal corrective commit
`a594f7333c99c1eb73fac8089ae68bb495d45bbb`, which was pushed to private
`develop` without amend or force. Review 170 cycle 2 recreated a clean detached
worktree at that exact remote hash and passed the complete matrix with zero
unresolved findings. Checkpoint 3 is complete; checkpoint 4's remote mirror
clone/read-only audit remains separately gated.

### 15.4 Implementation checkpoint 4

Checkpoint 4 completed on 22 July 2026 after review 171 cycle 1 passed every
nine-layer audit area with zero unresolved findings. A fresh owner-only mirror
froze exact private `main`/`develop` refs, passed strict integrity and contained
65 commits, 968 trees and 1,745 blobs under one intentional Rabassoft identity.
Pinned Gitleaks found no leak; independent scans found only the already
classified review-132 macOS path selected for later replacement. Local
endpoints, fixture identities, rights/licenses, generated/binary inventory,
largest blobs, `.ai-docs`, reference applications and public boundaries were
classified without a broad allowlist.

No remote ref, history, visibility, setting, package or npm state changed.
Checkpoint 5's owner-only replacement specification and deterministic local
sanitized candidate remain separately gated.

### 15.5 Implementation checkpoint 5

Checkpoint 5 completed on 22 July 2026 after review 172 cycle 3 passed the
complete boundary with zero unresolved findings. Two owner-only mirrors used
one private specification checksum and pinned git-filter-repo v2.47.0 to
produce identical 65-entry maps: 60 IDs remain unchanged, three change through
the exact one-path content substitution and two change only through mapped
parents. Authors, dates, messages, parents and all other tree content remain
equivalent.

One deterministic evidence commit contains the normalized public map and
checkpoint state; both candidate long-lived refs select that self-identifying
object. Gitleaks and independent tree/history policy pass with zero findings,
npm remains fail-closed and a fresh ordinary clone passes the complete matrix.
At checkpoint 5 closure, the remote/current refs remained unchanged and
checkpoint 6's recovery bundle, atomic exact-lease replacement and local
adoption remained separately gated.

### 15.6 Implementation checkpoint 6

Ricard explicitly authorized the destructive transition on 22 July 2026. An
owner-only verified bundle preserves the complete old `main`/`develop` history
under recorded SHA-256. One atomic exact-lease push moved both private remote
branches to sanitized baseline `1431e45baecd6ca8e8ef10f75d299e29a8b737a9`;
GitHub then reported both exact refs, zero tags, private visibility and
unchanged default `main`. Credential-free Git access remained unavailable.

The local branches adopted only their verified remote equivalents and returned
to tracking `develop`. Review 173 cycle 4 repeated Gitleaks, public tree/history
policies, fail-closed npm readiness and the complete clean-clone matrix from a
fresh remote clone with zero unresolved findings. No visibility, setting or npm
state changed. Ricard authorized the single closure commit; it was atomically
fast-forwarded to both private branches from exact baseline `1431e45` and
readopted locally. Checkpoint 6 is complete; checkpoint 7 remains separately
gated.

### 15.7 Implementation checkpoint 7 corrective preflight

Ricard explicitly authorized the visibility mutation on 22 July 2026. Before
mutation, review 174 cycle 1 found that ADR-026's implementation-status header
still described the pre-PLAN-024 authorization gate. Visibility remained
private. The header now reports the approved/completed state and `docs:check`
rejects the exact obsolete wording.

Review 174 cycle 2 repeated the complete corrected preflight with zero
unresolved findings. The correction was committed and atomically fast-forwarded
to both still-private aligned branches before executing the already authorized
sole visibility mutation. Settings, npm and the later checkpoint-7 closure
commit remain separately gated.

### 15.8 Implementation checkpoint 7 public transition

Corrective commit `3b415350627fbac423ce806231315e475de98f72` passed CI on
both aligned private branches. The authorized mutation then changed only
`rabassoft/schema-engine` visibility from private to public. Default `main`,
exact `main`/`develop` refs, zero tags and all observed repository/Actions
settings remained unchanged.

Review 175 cycle 4 verifies unauthenticated API, HTTP and Git access; a fresh
anonymous clone; Gitleaks and independent public-tree/history policies; root
license, governance, docs/links and reference sources; unchanged immutable M21
npm integrity, aliases and absent repository/provenance claims; and the complete
clean-clone matrix with zero unresolved findings. Checkpoint 7 is not complete
until its separately approved closure commit is atomically fast-forwarded to
both still-unprotected public branches and reverified anonymously.

Ricard authorized that closure. Commit `4b729dff555d506b594d5d35bbbdefaaf47bfc13`
was atomically fast-forwarded to both public branches, but both hosted CI runs
exposed the same non-product finding: the iterative deep-collection stress test
exceeded Vitest's default 5-second limit. The approved correction changed only
that test's timeout to 15 seconds, retained its depth and assertions, passed
five focused repetitions plus the complete local matrix, and was published as
`329d1a45c93c17b014b77a9d9a7d8ad247c2da18` to both aligned refs.

Review 175 cycle 6 observes successful corrected CI on `main` and `develop`,
exact anonymous refs, 70-commit Gitleaks, 743-file tree policy,
70-commit/1,817-path-blob history policy, 266 documents/877 links and unchanged
GitHub/npm state with zero unresolved findings. Checkpoint 7 is complete;
checkpoint 8 setting groups remain independently gated.

### 15.9 Implementation checkpoint 8 settings

Ricard independently authorized each mutation group on 22 July 2026. Review
176 cycles 1–7 record the read-only preflight, active no-bypass branch ruleset,
already-satisfied workflow defaults, owner-only local documentation boundary,
exact selected-actions/full-SHA policy, protected `npm-publish` environment,
Private Vulnerability Reporting and final merge settings.

The complete read-only pass finds all accepted checkpoint-8 targets exact with
zero unresolved findings and no npm/release mutation. Review 176 cycle 9 records
successful PR and push CI around protected squash `develop@59f7122`; its remote
short-lived branch was deleted. Cycles 10–11 then verify the protected state
closure, merge-commit promotion to `main@bed5dfd`, ancestry reconciliation into
`develop@c9b60f9` and every required/post-merge CI with zero findings. Both refs
have identical trees and `main` is an ancestor of `develop`. Checkpoint 8 is
complete; checkpoint 9 remains unstarted and separately gated.

### 15.10 Implementation checkpoint 9 final closure

Ricard authorized the external read-only final review on 22 July 2026. A fresh
anonymous clone and unauthenticated APIs repeated the full public history,
content, secret, rights, mapping, branch, policy and link audit. Authenticated
read-only APIs verified CI, ruleset, Actions, environment, stored-credential
absence, security/community and merge controls without mutation.

Review 177 cycle 1 corrected stale root onboarding, made registry-backed Angular
resolution robust to staggered patch publication and fixed two audit invocation
preconditions. Cycle 2 corrected the final command alias and the positional
Angular reorder E2E selector. Cycle 3 repeated the complete workspace, package,
source, reference, Chromium, npm immutability/isolation, documentation and diff
matrix with zero unresolved findings. PLAN-024/M22 are complete when this exact
record is published through the required protected flow; package metadata,
trusted publishing, provenance, release work and private-backup deletion remain
gated.
