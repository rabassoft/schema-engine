# Schema Engine — Work Log

This document is append-only. New entries must be added at the top.

Read only the newest entry by default. Search older entries by date, milestone,
plan, ADR, or deferred-decision identifier when historical evidence is needed;
the full file is not part of routine task startup.

## 2026-07-22 — PLAN-024 checkpoint 9 and M22 completed locally

### Completed

- Repeated the final public-repository closure from a fresh anonymous clone and
  read-only APIs: sanitized history/content, Gitleaks, mapping, public access,
  GitHub controls, npm isolation and the complete verification matrix pass.
- Corrected live Angular tuple discovery to select the highest stable patch
  published coherently across all required Angular packages; added regression
  coverage for the observed staggered `22.0.8`/`22.0.7` publication.
- Reverified immutable M19 exact packages and all M21 exact/`next`/`latest`/
  unqualified consumers without npm or GitHub mutation. Stabilized the Angular
  reorder E2E on Beta's exact normalized identity after the closing matrix
  exposed its positional selector. Review 177 cycle 3 passes the corrected
  complete boundary with zero unresolved findings.
- Marked PLAN-024/M22 Completed with no active implementation task. The private
  recovery bundle and stash remain retained outside public refs; deletion and
  future package metadata/OIDC/provenance work remain separately gated.

### Next

- Publish this exact reviewed closure through the protected branch/PR flow to
  `develop`, promote it to `main` and reconcile `main` ancestry back into
  `develop`, each under its required explicit Git authorization.
- After protected publication, select and promote the next milestone or
  Deferred decision explicitly.

## 2026-07-22 — PLAN-024 checkpoint 8 completed

### Completed

- Published the cycle-10 closure through protected PR #3 and successful required
  and post-merge CI.
- Promoted `develop` through PR #4 using merge commit `bed5dfd`; required run
  `29933833612` and main push run `29934258635` passed.
- Reconciled `main` ancestry through PR #5 into `develop@c9b60f9`; required run
  `29934607607` and final push run `29935020561` passed.
- Verified identical long-lived trees, `main` ancestry inside `develop`, deleted
  short-lived branches and zero npm/settings/package/runtime drift. Review 176
  cycle 11 passes checkpoint 8 with zero unresolved findings.

### Next

- Obtain explicit authorization before beginning PLAN-024 checkpoint 9's full
  public-repository closure review.

## 2026-07-22 — PLAN-024 checkpoint 8 develop state closed

### Completed

- Published cycle-9 state as Rabassoft commit `1b8d48e` through protected PR #2.
- Required PR run `29916192003` passed in 4m55s; GitHub squash-merged exact
  `develop@5ffee20` and deleted the remote short-lived branch.
- Post-merge push run `29916533160` passed in 3m49s. Review 176 cycle 10 reports
  zero findings and no npm, setting, package or runtime mutation.

### Next

- Publish this cycle-10 closure follow-up, then promote the resulting exact
  `develop` tip to `main` with a protected merge commit and reconcile `main`
  ancestry back into `develop`, all under explicit authorization.

## 2026-07-22 — PLAN-024 checkpoint 8 published to protected develop

### Completed

- Published reviewed checkpoint-8 evidence as Rabassoft commit `e6bb6b5` on
  short-lived branch `codex/plan-024-checkpoint-8` and opened protected PR #1.
- Required PR run `29905263489` passed; after separate authorization GitHub
  squash-merged exact `develop@59f7122` and deleted the remote source branch.
- Push run `29912959904` passed its complete `verify` job in 4m58s. Review 176
  cycle 9 reports zero unresolved findings and no npm or setting mutation.

### Next

- Publish this state-only follow-up through a new protected PR into `develop`,
  then promote the exact integration tip to `main` and reconcile its merge
  ancestry back into `develop` under separate authorization.

## 2026-07-22 — PLAN-024 checkpoint 8 local evidence verified

### Completed

- Corrected review 176's authority summary to cover the separately authorized
  settings groups without broadening any authorization.
- Repeated the complete applicable local matrix: build, lint, strict types,
  workspace/reference tests, package/source smoke tests, release/publication
  tooling, public-tree policy, snippets, boundaries, docs, formatting,
  workflows and diff checks pass.
- Review 176 cycle 8 passes the complete settings and local evidence boundary
  with zero unresolved findings; npm and external settings were not mutated.

### Next

- Obtain explicit approval for the short-lived branch, reviewed commit/push and
  protected PR into `develop`; checkpoint 8 remains active until its evidence is
  published through the accepted protected flow.

## 2026-07-22 — PLAN-024 checkpoint 8 settings verified

### Completed

- Retained merge commits and squash merge, disabled rebase merge and enabled
  automatic deletion of merged short-lived branches under explicit approval.
- Reobserved the complete checkpoint-8 target: public/default/ref state,
  effective long-lived-branch rules, Actions/workflow permissions, protected
  environment without secrets, private reporting and merge topology.
- Review 176 cycle 7 passes the complete settings boundary with zero unresolved
  findings. No npm, trusted publisher, package, credential or release changed.

### Next

- Obtain explicit approval for the short-lived branch, reviewed commit/push and
  protected PR into `develop`; checkpoint 8 remains active until its evidence is
  published through the accepted protected flow.

## 2026-07-22 — PLAN-024 checkpoint 8 private reporting enabled

### Completed

- Reobserved disabled private vulnerability reporting plus exact refs, ruleset,
  Actions and environment state before the authorized mutation.
- Enabled only Private Vulnerability Reporting and verified it read-only.
- Confirmed Issues enabled and Discussions disabled already satisfy PLAN-024
  without mutation; every previous control and npm remain unchanged.
- Review 176 cycle 6 passes with zero unresolved findings.

### Next

- Obtain explicit approval for the final merge-settings group: retain merge and
  squash, disable rebase and delete merged short-lived branches.

## 2026-07-22 — PLAN-024 checkpoint 8 environment protected

### Completed

- Reobserved exact refs/ruleset/Actions controls, zero environments and sole
  eligible administrator `rabassoft`/`304027868` before the authorized mutation.
- Created `npm-publish` environment `18549660922` with required Rabassoft review,
  self-review allowed, zero delay and custom branch restrictions.
- Added exactly one deployment branch policy `55295302` for `main`; verified no
  environment secret or variable exists.
- Recorded GitHub's standard administrator-bypass availability without claiming
  or changing it; review 176 cycle 5 verifies zero unrelated drift.

### Next

- Obtain explicit approval to enable private vulnerability reporting; Issues
  and Discussions already match the accepted target without mutation.

## 2026-07-22 — PLAN-024 checkpoint 8 Actions restricted

### Completed

- Reobserved exact refs, active ruleset, workflow permissions and all six
  workflow action uses before the authorized mutation.
- Retained Actions enabled, changed to selected-use only and required full-SHA
  pinning.
- Disabled broad GitHub-owned and verified-creator allowances; allowed only the
  reviewed exact checkout/setup-node SHA identities used by both workflows.
- Review 176 cycle 4 verified exact policy/allowlist and zero drift in refs,
  ruleset, workflow permissions, repository features, environments, security or
  npm.

### Next

- Prepare and obtain explicit approval for the protected `npm-publish`
  environment group; apply and verify no other setting.

## 2026-07-22 — Local operator-documentation boundary established

### Completed

- Kept non-secret GitHub settings, rules/check IDs, action SHAs and verification
  evidence in public project documentation for reproducibility.
- Added ignored `.local-docs/` for optional owner-specific paths, recovery
  procedures and password-manager/security-key references; prohibited real
  credentials, OTPs, private keys and recovery codes.
- Added the stable agent rule that local notes are non-canonical and require
  explicit task-scoped authorization before reading.
- Added a public-tree policy regression that rejects `.local-docs/` if tracked;
  excluded it from routine documentation traversal and verified its starter
  runbook is ignored with `0700`/`0600` permissions.

### Next

- Resume the separately gated Actions selected-use/full-SHA mutation after this
  documentation boundary passes its complete review.

## 2026-07-22 — PLAN-024 checkpoint 8 branch protection applied

### Completed

- Reobserved exact refs/check identity and zero existing rulesets immediately
  before the explicitly authorized mutation.
- Created active repository ruleset `19534784`, targeting only `main` and
  `develop` with required PR, strict GitHub Actions `verify`, resolved
  conversations, zero approvals, merge/squash only and no deletion,
  force-push or bypass.
- Verified identical effective rules on both branches, unchanged exact refs and
  no drift in repository, Actions, environment, vulnerability or npm state.
- Confirmed workflow defaults already meet PLAN-024's read-only/no-PR-approval
  target without mutation. Review 176 cycle 2 passes with zero findings.

### Next

- Obtain explicit approval to restrict Actions to selected GitHub-owned actions
  with full-SHA pinning; apply and verify only that next group.

## 2026-07-22 — PLAN-024 checkpoint 8 read-only preflight

### Completed

- Published checkpoint-7 state commit `64a1d15` atomically to public
  `main`/`develop`; both resulting GitHub CI runs passed completely.
- Observed zero repository rulesets and no classic protection on either branch.
  Confirmed exact successful check `verify` from GitHub Actions integration
  `15368` and current ruleset availability for the public organization repo.
- Observed read-only workflow defaults with PR approvals disabled, Actions still
  allowing all actions without SHA enforcement, zero environments, disabled
  private vulnerability reporting and unchanged repository/merge features.
- Review 176 cycle 1 passed the full preflight with zero findings and selected
  one ruleset for both long-lived branches as the strongest available first
  mutation. No setting or npm mutation occurred.

### Next

- Obtain explicit approval for the exact
  `long-lived-branch-protection` ruleset, apply only that mutation and verify its
  effective rules before any later checkpoint-8 group.

## 2026-07-22 — PLAN-024 checkpoint 7 corrective closure completed

### Completed

- Atomically fast-forwarded authorized closure commit `4b729df` to public
  `main`/`develop`; both hosted CI runs exposed only the same 5-second timeout
  in the iterative deep-collection stress test.
- Applied the approved targeted 15-second timeout without changing test depth
  or assertions. Five focused repetitions and the complete local matrix passed;
  corrective commit `329d1a4` was atomically published to both aligned refs.
- Corrected GitHub CI runs `29883272610` and `29883272641` passed. A fresh
  credential-free clone selected exact `329d1a4`; Gitleaks scanned 70 commits,
  public-tree/history policies passed 743 files and 1,817 path/blob pairs, and
  documentation passed 266 files/877 links with zero findings.
- Review 175 cycle 6 closes checkpoint 7. Repository settings/features and npm
  bytes, aliases and absent repository metadata did not drift.

### Next

- Perform checkpoint 8's read-only capability/settings preflight, then present
  each setting mutation group independently for explicit approval.

## 2026-07-22 — PLAN-024 checkpoint 7 public transition verified

### Completed

- Published corrective commit `3b415350` atomically to aligned private
  `main`/`develop`; both GitHub CI runs passed before exposure.
- Changed only `rabassoft/schema-engine` visibility from private to public under
  Ricard's explicit checkpoint-7 authorization. Exact refs, default branch,
  tags, repository features, merge settings and Actions settings did not drift.
- Verified anonymous API/HTTP/Git access and a fresh credential-free clone.
  Gitleaks scanned 68 commits with no leak; public tree/history policies passed
  742 files and 1,802 path/blob pairs with zero findings.
- Verified root AGPL/governance, `.ai-docs`, references, 265 documents/875 links,
  unchanged M21 npm integrity/aliases/metadata and the complete clean-clone
  workspace/package/source/reference matrix.
- Review 175 cycle 1 reconciled stale current private-state documentation and
  added regression guards; cycle 2 clarified that local recovery-stash objects
  are not public refs; cycle 3 isolated ignored browser-cache signatures; cycle
  4 repeated the complete public boundary with zero unresolved findings.

### Next

- Obtain separate approval for the checkpoint-7 closure commit and atomic
  fast-forward of both still-unprotected public branches from exact lease
  `3b415350627fbac423ce806231315e475de98f72`; then reverify anonymously and stop
  before checkpoint 8 settings.

## 2026-07-22 — PLAN-024 checkpoint 7 corrective preflight

### Completed

- Ricard authorized checkpoint 7's sole private-to-public visibility mutation.
- The private preflight stopped before mutation because accepted ADR-026 still
  carried its obsolete pre-PLAN-024 implementation-authorization header.
- Ricard authorized the corrective commit/push. Updated only the ADR status and
  added an exact stale-claim regression to `docs:check`.
- Review 174 cycle 2 repeated authority, refs/privacy, policies, package/npm
  gates, documentation, workflows, public-tree and diff checks with zero
  unresolved findings. Visibility, settings and npm remain unchanged.

### Next

- Atomically publish the corrective commit to both aligned private branches,
  reobserve it, then execute the already authorized sole visibility mutation.

## 2026-07-22 — PLAN-024 checkpoint 6 transition verified

### Completed

- Reobserved exact old remote leases, private/default-main state, authenticated
  Rabassoft authority and deterministic sanitized baseline `1431e45`.
- Created and verified an owner-only complete old-lineage bundle with SHA-256
  `5815447d5f19edddaa4988ae8be1cc0c12d767bbc1e0d80f28952374ae3c1b4e`;
  preserved the dirty checkpoint reversibly outside public refs.
- Atomically replaced only remote `main`/`develop` under their exact leases;
  both now select `1431e45`, with zero tags, private visibility and unchanged
  default `main`. Anonymous Git access remains unavailable.
- Adopted the verified remote lineage locally. Review 173 cycle 1 repeated
  Gitleaks, public tree/history, workflow/tool/readiness checks and the complete
  matrix from a fresh remote clone, then corrected one stale active plan-index
  phrase. Cycle 2 corrected two stale pre-transition STATUS claims; cycle 3
  repeated the complete applicable review with zero unresolved findings.
- No visibility, GitHub setting, npm package/alias, trusted publisher or
  provenance state changed.
- Ricard authorized the single closure commit and its atomic fast-forward;
  review 173 cycle 4 verifies both private long-lived branches and the local
  checkout at that closure, completing checkpoint 6.

### Next

- Present and explicitly authorize checkpoint 7 before changing only repository
  visibility from private to public; all settings and npm remain gated.

## 2026-07-22 — PLAN-024 checkpoint 5 completed

### Completed

- Created one owner-only replacement specification for the classified
  `macos-home-path`, recorded only its SHA-256 and replaced it with
  `<local-home>/` without printing or committing the private source.
- Pinned git-filter-repo v2.47.0 produced identical 65-entry maps in two fresh
  mirrors: 60 IDs unchanged, three exact content substitutions and two
  parent-only changes with author/date/message/topology preserved.
- Generated the complete public old/new map and one deterministic
  self-identifying evidence commit selected by both candidate long-lived refs.
- Review 172 cycles 1–2 corrected a verifier assumption about parent-only
  commit changes and the evidence commit's self-inventory. Cycle 3 repeated
  continuity, scans and the complete clean-clone matrix with zero unresolved
  findings.
- Candidate history/tree policies and Gitleaks pass with zero findings; npm
  remains intentionally fail-closed. Current/remote refs, visibility, settings,
  packages and npm remain unchanged.

### Next

- Present and immediately authorize PLAN-024 checkpoint 6 before creating its
  private recovery bundle, cleaning/adopting the current checkout or atomically
  replacing the two remote refs.

## 2026-07-22 — PLAN-024 checkpoint 4 completed

### Completed

- Cloned the exact private remote into a fresh owner-only mirror, froze
  `main`/`develop` at `a324d830`/`a594f733` and passed strict Git integrity.
- Pinned Gitleaks scanned 65 commits/approximately 6.25 MB with full redaction
  and no leak. Independent path/content checks retained exactly the
  preclassified review-132 macOS path and found no other prohibited content.
- Classified intentional loopback development endpoints, public Rabassoft
  identity, test-only addresses, generated/artifact inventory, largest blobs,
  binary state, licenses/notices, dependency rights, `.ai-docs`, reference apps
  and public package boundaries.
- Froze deterministic parent, commit/tree/author and object/path inventory
  hashes for 65 commits, 968 trees and 1,745 blobs. Review 171 cycle 1 passed all
  nine layers with zero unresolved findings.
- Verified the remote still private with unchanged refs/default branch. No
  remote write, history rewrite, setting, package or npm mutation occurred.

### Next

- Present and explicitly authorize PLAN-024 checkpoint 5 before creating its
  owner-only replacement specification or deterministic local sanitized
  candidate.

## 2026-07-22 — PLAN-024 checkpoint 3 completed

### Completed

- Created and normally pushed private baseline commit `300eb78`, preserving
  `main`, private visibility, default branch and all GitHub/npm settings.
- Review 170 cycle 1 reproduced a clean-checkout workflow defect: lint ran
  before internal declarations existed. Added build-before-lint ordering and a
  static regression guard in normal corrective commit `a594f73`, without amend
  or force.
- Verified exact remote `develop`
  `a594f7333c99c1eb73fac8089ae68bb495d45bbb` from a new detached worktree.
  Gitleaks scanned 65 commits/approximately 6.25 MB with no leak; publication
  tool fixtures, twelve policy tests, expected fail-closed lanes and the full
  docs/build/lint/types/tests/package/source/reference matrix passed.
- Review 170 cycle 2 closed with zero unresolved findings. `main` remains
  `a324d830270cea30ed62b44fdb1af333e7c85a2d`; the repository remains private
  with `main` as default.

### Next

- Present and explicitly authorize PLAN-024 checkpoint 4 before creating a
  fresh remote mirror clone or running its bounded read-only audit.

## 2026-07-22 — PLAN-024 checkpoint 2 completed

### Completed

- Acquired official Gitleaks v8.30.1 and git-filter-repo v2.47.0 outside the
  repository, verified their release/digest identities and pinned official
  checkout v7.0.1/setup-node v7.0.0 to full commits.
- Added isolated tool fixtures proving redacted positive/clean Gitleaks behavior
  and two identical two-commit rewrites with complete maps, preserved metadata/
  topology and no unrelated content drift.
- Added read-only CI and manual protected npm workflows plus twelve focused
  tests/static guards for triggers, exact pins/counts, permissions, source
  identity, OIDC isolation, lifecycle-free installs and readiness/publication
  order.
- Review 169 cycle 1 corrected four fixture/static-policy findings. Later clean
  detached verification found and corrected build-before-lint ordering; cycle 3
  repeated the complete checkpoint with zero unresolved findings. Default
  Gitleaks scanned 64 commits/approximately 6.24 MB with no leak.
- Frozen install, expected history/npm fail-closed modes, docs, format, lint,
  strict types, complete workspace tests/builds, package/source, release
  tooling, snippets, boundaries, Angular/Standard units and diff checks pass.
- No repository remote clone, Git ref/history, GitHub/npm setting, package,
  commit, push or publication mutation occurred.

### Next

- Present and explicitly authorize PLAN-024 checkpoint 3 before creating the
  reviewed Rabassoft commit or pushing `develop` to the still-private origin.

## 2026-07-21 — PLAN-024 checkpoint 1 completed

### Completed

- Added public security, contribution and conduct policies plus root onboarding
  links without opening external code contributions or claiming a support SLA.
- Added tested prospective-tree and reachable-history policy scanners with
  redacted findings, stale-documentation guards and a pure fail-closed npm
  trusted-publishing readiness evaluator.
- Confirmed the 729-file current candidate tree has zero findings, while the
  current history intentionally fails exactly once on the already classified
  historical review-132 local path and current M21 metadata remains incapable
  of trusted publication.
- Review 168 cycles 1–2 corrected four scanner/link/lint/history-coverage
  findings; cycle 3 repeated the complete checkpoint boundary with zero
  unresolved findings.
- Full formatting, docs, lint, types, tests/builds, package, release-tooling,
  snippets, boundaries, Angular/Standard unit and diff checks pass. No workflow,
  external tool, network, Git/GitHub/npm mutation, commit or push occurred.

### Next

- Obtain explicit PLAN-024 checkpoint-2 authorization before downloading and
  verifying official Gitleaks/`git-filter-repo`, resolving full action SHAs,
  adding workflows or running the isolated tool fixtures.

## 2026-07-21 — PLAN-024 approved for M22

### Completed

- Drafted PLAN-024 revision 0 to deliver the selected sanitized public-history
  architecture without combining repository work with package release work.
- Split local policies/tooling, pinned-tool acquisition, private commit/push,
  fresh-mirror audit, deterministic candidate, destructive ref replacement/
  local adoption, public visibility, GitHub settings and final closure into
  separately gated checkpoints.
- Added exact old/new mapping, immutable-package-source, solo-maintainer,
  workflow non-publish, anonymous verification and post-public incident
  boundaries.
- Review 167 cycles 1–2 closed twelve findings; cycle 3 repeated all sixteen areas
  with zero findings and approved revision 0 under the standing authorization.
- Performed no implementation, tool download, network/Git/GitHub/npm mutation,
  commit or push.

### Next

- Execute only PLAN-024 checkpoint 1 locally, complete its review, then stop for
  explicit checkpoint-2 tool/network authorization.

## 2026-07-21 — M22 repository architecture accepted

### Completed

- Recorded Ricard's selection of review-165 option A: preserve sanitized
  reachable history and publish `.ai-docs` after complete classification and
  sanitization.
- Drafted ADR-026 revision 0 and coordinated ADR-018 revision 6 without
  changing runtime, packages, versions, history or remote state.
- Fixed public-content, old/new commit mapping, branch/governance,
  solo-maintainer approval, least-privilege Actions, OIDC/provenance and
  fail-closed plan boundaries against current official npm/GitHub requirements.
- Review 166 cycles 1–2 closed nine findings; cycle 3 repeated all fourteen
  areas with zero findings and accepted both ADRs under the standing review
  authorization.
- Preserved the unrelated `angular.json` analytics opt-out and performed no
  implementation, commit, push, rewrite, workflow, visibility/settings or npm
  mutation.

### Next

- Prepare and completely review PLAN-024. Implementation and every destructive,
  Git or external action remain inactive.

## 2026-07-21 — D-043 promoted for M22 normative design

### Completed

- Accepted D-043 as the next milestone candidate and reviewed its preparation
  boundary without changing GitHub, npm, history, packages or implementation.
- Inspected all 62 reachable commits, author identity, branch/tag topology,
  sensitive filenames, largest blobs and credential patterns; the heuristic
  scan found no secret material but did identify one historical local path.
- Classified the 235 tracked `.ai-docs` files, stale default branch, absent
  public policy files, unprotected branches and permissive Actions settings as
  explicit sanitization/governance inputs rather than publication blockers to
  bypass.
- Review 165 cycle 1 recorded three documentation/readiness findings; cycle 2
  repeated the full boundary with zero findings and promoted only M22 normative
  design. Publication as-is is rejected.
- Preserved the unrelated `angular.json` analytics opt-out and performed no
  commit, push, history rewrite, workflow, visibility/settings or registry
  mutation.

### Next

- Ricard selects review-165 option A (preserve sanitized history, recommended)
  or B (clean public lineage); then draft ADR-026 with a coordinated ADR-018
  revision.

## 2026-07-20 — PLAN-023/M21 final closure completed

### Completed

- Reverified npm registry/tooling, `ricardrabasso`, verified contact,
  write-protected 2FA, Rabassoft ownership and read-write authority without
  exposing credentials or mutating external state.
- Repeated selected/live M21 byte, integrity, signature, metadata, access,
  alias, peer, export, source/license and security checks plus immutable M19
  package/source evidence.
- Repeated the frozen workspace, 689 tests, builds, packages, artifacts,
  independent source reconstruction, security, snippets, 540 boundaries,
  Angular/Standard units and 14 Chromium cases.
- Repeated lower/latest M18/M20 candidate consumers and all eight exact/
  `next`/`latest`/unqualified lower/latest native/pilot registry matrices at
  Angular `22.0.6`/`22.0.7` plus Aria/CDK `22.0.5`; all passed.
- Review 164 cycle 1 recorded the restricted-sandbox esbuild abort and
  corrected stale active mixed-window wording in root onboarding and release
  notes. Cycle 2 corrected closing-document formatting; cycle 3 restarted all
  eighteen areas, mapped all 27 SPEC-009 rows and passed with zero findings.
- Marked PLAN-023 revision 0 and M21 Completed and reconciled STATUS, ROADMAP,
  Deferred, ADR/documentation indexes and release history. No commit, push,
  registry write, GitHub/repository action, provenance or Deferred promotion
  occurred.

### Next

- Prepare a read-only prioritization review and ask Ricard to select the next
  milestone or Deferred capability.

## 2026-07-20 — PLAN-023 checkpoint 10 coordinated defaults completed

### Completed

- The first authorized checkpoint-10 read observed core already at
  `next/latest: 0.4.0`; Ricard's prior “hecho” had corresponded to running the
  exact core dist-tag command before the separately gated preflight completed.
- Performed no rollback or further registry mutation and switched immediately
  to fail-closed post-transition verification.
- Verified core/base `next/latest: 0.4.0` and pilot
  `next/latest: 0.2.0`, with exact selected bytes, integrity, registry
  signatures, public access, maintainers, manifests, peers, exports,
  source/license and provenance-disabled settings unchanged.
- Serialized all eight exact/`next`/`latest`/unqualified lower/latest native
  and pilot M20 consumer matrices; partial compile, typecheck, unit test,
  production build and Chromium smoke passed at Angular `22.0.6`/`22.0.7` plus
  Aria/CDK `22.0.5`.
- Review 163 cycle 1 records the procedural deviation and stale active state;
  cycle 2 restored explicit pinned M19 core history; cycle 3 repeated all nine
  post-transition areas with zero findings.

### Next

- Stop for separate authorization of checkpoint 11's complete final closure
  review. No registry, GitHub, repository or Git mutation is authorized.

## 2026-07-20 — PLAN-023 checkpoint 9 base-latest transition completed

### Completed

- Ricard ran the exact separately approved command moving only
  `@rabassoft/schema-engine-angular@0.4.0` to `latest`.
- Verified base `next/latest: 0.4.0` resolves to the selected 126,564-byte
  artifact with exact integrity and npm signature.
- Reverified base public access, sole expected maintainer, AGPL, core peer
  `^0.4.0`, Angular peer ranges, root export, `sideEffects: false`,
  source/license and absent repository/provenance metadata.
- Confirmed pilot remains `next/latest: 0.2.0`, core remains
  `next: 0.4.0`, `latest: 0.3.0`, and no package byte, access, maintainer,
  alias or settings value changed beyond the approved base transition.
- Preserved the planned mixed-window boundary: no `latest` or unqualified
  consumer evidence was run or accepted. Review 161 exact/`next` evidence
  remains applicable.
- Review 162 cycle 1 reconciled expected stale pre-transition documentation;
  cycle 2 repeated all eight post-transition areas with zero findings.

### Next

- Stop for separate authorization of checkpoint 10's read-only core `latest`
  preflight. The core dist-tag mutation and every other external action remain
  separately gated.

## 2026-07-20 — PLAN-023 checkpoint 9 pre-transition gate completed

### Completed

- Reproved npm `10.9.8`, the official registry, `ricardrabasso`, verified
  `ricard@rabassoft.com`, write-protected 2FA, Rabassoft owner authority and
  read-write access to all three public packages without recording credentials.
- Reverified all three exact M21 artifacts byte-for-byte with selected
  evidence, exact integrity, registry signatures, maintainers and AGPL; base
  `0.4.0` retains core `^0.4.0`, Angular `>=22.0.6 <23.0.0`, `tslib`, its exact
  root export and `sideEffects: false`.
- Confirmed the checkpoint-8 mixed state exactly: all three `next` aliases
  resolve to M21, pilot `latest: 0.2.0`, and core/base `latest: 0.3.0`.
- Serialized exact and `next` lower/latest M20 native/pilot consumers passed
  partial compile, typecheck, unit test, production build and Chromium smoke at
  Angular `22.0.6`/`22.0.7` plus Aria/CDK `22.0.5`.
- Review 161 cycle 1 corrected one overbroad ROADMAP stale-state expression;
  cycle 2 corrected review formatting; cycle 3 corrected a required release
  marker; cycle 4 stabilized the second literal marker; cycle 5 repeated all
  eight areas with zero findings. No dist-tag, package setting, GitHub,
  repository, provenance or Git mutation occurred.

### Next

- Stop for immediate approval of only
  `npm dist-tag add @rabassoft/schema-engine-angular@0.4.0 latest`. Core and
  every other external action remain separately gated.

## 2026-07-20 — PLAN-023 checkpoint 8 pilot-latest transition completed

### Completed

- Ricard ran the exact separately approved command moving only
  `@rabassoft/schema-engine-angular-aria@0.2.0` to `latest`.
- Verified pilot `next/latest: 0.2.0` resolves to the selected 28,618-byte
  artifact with exact integrity and npm signature.
- Reverified pilot public access, sole expected maintainer, AGPL, base peer
  `^0.4.0`, Angular/Aria/CDK ranges, root/styles exports, side effect,
  source/license and absent repository/provenance metadata.
- Confirmed core/base remain `next: 0.4.0`, `latest: 0.3.0` and no package byte,
  access, maintainer, alias or settings value changed beyond the approved pilot
  transition.
- Preserved the planned mixed-window boundary: no `latest` or unqualified
  consumer evidence was run or accepted. Review 159 exact/`next` evidence
  remains applicable.
- Review 160 cycle 1 corrected one overbroad ROADMAP stale-state expression;
  cycle 2 corrected the canonical release-review marker; cycle 3 repeated all
  eight post-transition areas with zero findings.

### Next

- Stop for separate authorization of checkpoint 9's read-only base Angular
  `latest` preflight. The base dist-tag mutation and every other external
  action remain separately gated.

## 2026-07-20 — PLAN-023 checkpoint 8 pre-transition gate completed

### Completed

- Reproved npm `10.9.8`, the official registry, `ricardrabasso`, verified
  `ricard@rabassoft.com`, write-protected 2FA, Rabassoft owner authority and
  read-write access to all three packages without recording credentials.
- Reverified the three exact M21 artifacts byte-for-byte with selected evidence,
  exact integrity, registry signatures, public access, maintainers, AGPL,
  manifests/peers/exports/styles/source and absent repository/provenance.
- Reverified immutable exact M19 bytes and defaults: core/base `latest: 0.3.0`
  and pilot `latest: 0.1.0`; M21 remains core/base `next: 0.4.0` and pilot
  `next: 0.2.0` with no settings drift.
- Serialized exact and `next` lower/latest M20 native/pilot consumers pass
  partial compile, typecheck, unit test, production build and Chromium smoke at
  Angular `22.0.6`/`22.0.7` plus Aria/CDK `22.0.5`. One transient registry
  `ENOTFOUND` retried successfully without affecting resolution.
- Review 159 cycle 1 passed all nine areas with zero findings. No dist-tag,
  package setting, GitHub, repository or provenance mutation occurred.

### Next

- Stop for immediate approval of only
  `npm dist-tag add @rabassoft/schema-engine-angular-aria@0.2.0 latest`. Base/
  core aliases and every other mutation remain separately gated.

## 2026-07-20 — PLAN-023 checkpoint 7 live pilot completed

### Completed

- Ricard ran the exact approved neutral publish command for
  `@rabassoft/schema-engine-angular-aria@0.2.0` under `next` without provenance.
- Verified the public artifact byte-for-byte against the selected 28,618-byte
  candidate, including exact SHA-512/integrity and npm registry signature.
- Verified public access, sole expected maintainer, AGPL license, exact base
  peer `^0.4.0`, Angular/Aria/CDK ranges, root/styles exports, styles/source
  boundary and absent repository/provenance metadata.
- Observed all three M21 packages exact and under `next`; core/base `latest`
  remain `0.3.0` and pilot `latest` remains `0.1.0`.
- Serialized exact and `next` lower/latest M20 consumers pass partial compile,
  typecheck, unit test, production build and Chromium smoke in native and pilot
  lanes at Angular `22.0.6`/`22.0.7` plus Aria/CDK `22.0.5`.
- Review 158 cycle 1 corrected three stale documentation-check/onboarding rules;
  cycle 2 repeated all ten areas with zero findings. No later registry, alias,
  setting, GitHub, repository or provenance mutation occurred.

### Next

- Stop for separate authorization of checkpoint 8's read-only pilot-`latest`
  preflight. The dist-tag mutation and every other alias/settings action remain
  separately gated.

## 2026-07-20 — PLAN-023 checkpoint 7 pre-publication gate completed

### Completed

- Reproved npm identity `ricardrabasso`, verified email, write-protected 2FA,
  Rabassoft owner authority and read-write access to all three packages without
  recording credentials.
- Downloaded live core/base `0.4.0` and confirmed byte identity, signatures,
  source/license metadata, `next: 0.4.0` and `latest: 0.3.0`.
- Verified selected pilot `0.2.0` at 28,618 bytes with exact SHA-512/integrity,
  source commit `07755b4`, base peer `^0.4.0`, frozen Angular/Aria/CDK ranges,
  root/styles exports and complete Corresponding Source.
- Confirmed pilot `0.2.0` returns `E404`; pilot remains public with
  `next`/`latest: 0.1.0` and no unrelated package setting changed.
- Lower/latest clean native and pilot consumers pass with the public core/base
  pair and selected pilot at Angular `22.0.6`/`22.0.7` plus Aria/CDK `22.0.5`.
  The isolated credential-free dry run reports 28,618 bytes, 15 files and exact
  integrity.
- Review 157 cycle 1 found a procedural fixed-port collision when lower/latest
  Chromium matrices ran concurrently. Cycle 2 serialized both complete matrices
  and passed all nine areas with zero findings. No publish, dist-tag, setting,
  GitHub, repository or provenance mutation occurred.

### Next

- Stop for immediate approval of only
  `npm publish ./rabassoft-schema-engine-angular-aria-0.2.0.tgz --access public
--tag next --provenance=false`. Every alias/settings action remains
  separately gated.

## 2026-07-20 — PLAN-023 checkpoint 6 live base Angular completed

### Completed

- Ricard ran the exact approved neutral publish command for
  `@rabassoft/schema-engine-angular@0.4.0` under `next` without provenance.
- Downloaded the public artifact unauthenticated and proved byte identity with
  the selected candidate: 126,564 bytes and exact SHA-512/integrity.
- Verified npm signature, public access, sole expected maintainer, AGPL license,
  exact ESM manifest, core peer `^0.4.0`, Angular peers, source boundary and
  absent repository/provenance metadata.
- Observed core/base `next: 0.4.0`, core/base `latest: 0.3.0` and unchanged
  pilot `next`/`latest: 0.1.0`.
- Exact and `next` clean consumers resolve the public core/base pair, compile
  and execute at Angular `22.0.6` and `22.0.7`.
- Review 156 cycle 1 corrected stale pre-publication documentation, ambiguous
  M19/M21 source attribution and an outdated Angular-endpoint description;
  cycle 2 repeated all ten areas with zero findings. No later registry, alias,
  setting, GitHub, repository or provenance mutation occurred.

### Next

- Stop for separate authorization of checkpoint 7's read-only pilot preflight.
  Pilot publication and every alias/settings action remain separately gated.

## 2026-07-20 — PLAN-023 checkpoint 6 pre-publication gate completed

### Completed

- Reproved npm identity `ricardrabasso`, verified email, write-protected 2FA
  and Rabassoft owner authority without recording credentials.
- Downloaded live core `0.4.0` again and confirmed byte identity, signature,
  source/license metadata, `next: 0.4.0` and `latest: 0.3.0`.
- Verified selected base Angular `0.4.0` at 126,564 bytes with exact SHA-512,
  source commit `07755b4`, core peer `^0.4.0`, aligned Angular peers and frozen
  Corresponding Source harness.
- Confirmed base `0.4.0` returns `E404`; base remains
  `next`/`latest: 0.3.0` and pilot remains `next`/`latest: 0.1.0`.
- Lower/latest-compatible clean native consumers pass with live core and the
  selected base tarball. Its credential-free isolated publish dry run reports
  126.6 kB, 114 files and exact integrity.
- Review 155 cycle 1 passed all nine areas with zero findings. No publish,
  dist-tag, setting, GitHub, repository or provenance mutation occurred.

### Next

- Stop for immediate approval of only
  `npm publish ./rabassoft-schema-engine-angular-0.4.0.tgz --access public --tag
next --provenance=false`. Pilot and every alias/settings action remain
  separately gated.

## 2026-07-20 — PLAN-023 checkpoint 5 live core completed

### Completed

- Ricard ran the exact approved neutral publish command for
  `@rabassoft/schema-engine@0.4.0` under `next` without provenance.
- Downloaded the public artifact unauthenticated and proved byte identity with
  the selected candidate: 218,187 bytes, exact SHA-512/integrity and 88 files.
- Verified npm signature, public access, sole expected maintainer, AGPL license,
  exact manifest/source boundary and absent repository/provenance metadata.
- Observed only core `next` move to `0.4.0`; core `latest` remains `0.3.0`, base
  remains `next`/`latest: 0.3.0` and pilot remains
  `next`/`latest: 0.1.0`.
- Exact and `next` core consumers compile and execute; both lower/latest-
  compatible Angular checks pass with the selected local base candidate.
- Review 154 cycle 1 corrected stale pre-publication docs and an unsafe mixed
  core/base `@next` onboarding example; cycle 2 corrected stale active
  documentation/link counts; cycle 3 corrected two remaining active routing/
  plan-header phrases; cycle 4 removed volatile active documentation/link
  counts. Cycle 5 passed all ten areas with zero findings. No later registry,
  GitHub, repository or provenance mutation occurred.

### Next

- Stop for separate authorization of checkpoint 6's read-only base Angular
  preflight. Base publication retains a later independent immediate gate.

## 2026-07-20 — PLAN-023 checkpoint 5 pre-publication gate completed

### Completed

- Ricard restored npm authentication; `npm whoami` now returns
  `ricardrabasso`, the verified email is `ricard@rabassoft.com`, 2FA is
  `auth-and-writes` and that account is Rabassoft owner with `read-write`
  authority over all three packages.
- Confirmed public access, the sole expected maintainer, AGPL licensing,
  signatures and absent repository/provenance metadata for the existing line.
- Confirmed exact M21 absence: core/base `0.4.0` and pilot `0.2.0` each return
  `E404`; no version or alias was created.
- Downloaded and verified immutable M19 bytes with both aliases: core/base
  remain `next`/`latest: 0.3.0`, pilot remains `next`/`latest: 0.1.0`.
- Rechecked selected core size, SHA-512, manifest, source/license boundary and
  exact source commit `07755b4cbe31098f86099db38c65930d52772fb5`.
- The first neutral rehearsal encountered only the pre-existing global-cache
  ownership problem. A fresh temporary cache plus empty user configuration
  accepted the exact command under `--dry-run` without credentials or registry
  mutation.
- Review 153 cycle 3 repeated all nine areas with zero findings. No publish,
  dist-tag, setting, GitHub, repository or provenance mutation occurred.

### Next

- Stop for immediate approval of only
  `npm publish ./rabassoft-schema-engine-0.4.0.tgz --access public --tag next
--provenance=false`. Later packages and every alias/settings action remain
  separately gated.

## 2026-07-20 — PLAN-023 checkpoint 5 preflight paused at authentication

### Observed

- Ricard authorized the external read-only core `0.4.0` publication preflight.
- npm CLI is `10.9.8` and `npm config get registry` confirmed exactly
  `https://registry.npmjs.org/`.
- `npm whoami`, profile, organization and package-access reads returned `E401`
  because the local npm session is invalid.
- The preflight stopped before package metadata, versions or tags were queried.
  No login, credential change, publication, dist-tag, setting or other registry
  mutation was attempted.

### Next

- Ricard runs `npm login --registry=https://registry.npmjs.org/` locally and
  confirms completion. Then resume the already authorized read-only preflight
  from identity; core publication remains separately gated.

## 2026-07-20 — PLAN-023 checkpoint 4 completed

### Completed

- Reviewed and committed 128 M20/M21 files as
  `07755b4cbe31098f86099db38c65930d52772fb5` with identity
  `Rabassoft <ricard@rabassoft.com>`; the independent `angular.json` analytics
  opt-out remained excluded.
- Pushed that exact commit to private `origin/develop`; local HEAD and the
  remote-tracking ref agree.
- Reinstalled a detached clean worktree from the frozen lockfile and offline
  store, then repeated artifacts, source reconstruction, security and neutral
  candidate dry runs.
- The clean core/base `0.4.0` and pilot `0.2.0` tarballs are byte-identical to
  checkpoint-3 inputs. Selected evidence records exact `baseCommit`,
  `sourceCommit`, sizes, SHA-512/integrity and `neutralDryRun: true`.
- Review 152 cycle 1 corrected missing ignored historical baselines in the
  clean environment; cycle 2 reconciled stale pre-selection documentation;
  cycle 3 passed the complete applicable review with zero findings.
- No registry read/write, authentication, publication, dist-tag, Git tag,
  GitHub Release, repository setting or provenance action occurred.

### Next

- Stop for separate checkpoint 5 authorization before the read-only npm
  preflight. Core publication retains its later independent immediate gate.

## 2026-07-20 — PLAN-023 checkpoint 3 completed

### Completed

- Repeated the frozen workspace, build, 689-test, package, artifact, source,
  security, reference and lower/latest native/pilot consumer matrix.
- Mapped all 27 SPEC-009 conformance rows plus its Public/Internal migration
  inventory without changing the completed M20 contract.
- Prepared the three ignored M21 dirty-tree candidates twice with identical
  sizes and SHA-512; evidence records Node/npm/pnpm, exact integrity,
  `sourceCommit: null` and no local username.
- Original and fresh neutral-directory basename-relative publish dry runs pass
  with `--access public --tag next --provenance=false` and no registry write.
- Review 151 cycle 1 found only stale pre-candidate active documentation; cycle
  2 repeated the complete applicable review and passed with zero findings.
- No lockfile, Git, registry, authentication, publication, tag or other external
  action occurred.

### Next

- Stop for explicit PLAN-023 checkpoint 4 authorization before scoped diff,
  commit/private push and clean committed-tree byte comparison.

## 2026-07-20 — PLAN-023 checkpoint 2 completed

### Completed

- Added candidate-truthful M21 `0.4.0` release notes with the exact core/base
  `0.4.0` plus pilot `0.2.0` line, complete SPEC-009 Public migration,
  compatibility, live-state model and immutable recovery.
- Reconciled root/package onboarding so source manifests remain distinct from
  the verified public M19 `0.3.0`/`0.3.0`/`0.1.0` line.
- Extended documentation checks to fail closed on stale source truth,
  premature publication/aliases, wrong versions/peers/orders, obsolete
  compatibility, Stable conflation and public-repository/provenance claims.
- Review 150 cycle 1 corrected ROADMAP source truth, exact recovery detail and
  semantic manifest/style verification; cycles 2–4 corrected stale selected-
  candidate wording and its exact artifact marker; cycle 5 passed all twelve
  areas with zero findings.
- Formatting/docs/lint, 23 tooling tests, three package-smoke tests, M19
  baseline and M21 packed/private-M18 checks pass. No candidate, lockfile, Git,
  registry or external action occurred.

### Next

- Execute and completely review PLAN-023 checkpoint 3 locally. Checkpoint 4,
  commit/push and every registry action remain separately gated.

## 2026-07-20 — PLAN-023 checkpoint 1 completed

### Completed

- Added the exact frozen M21 descriptor, manifest versions and packed peer
  contract for core/base `0.4.0` and pilot `0.2.0`.
- Generalized repeat-release evidence, package specifiers, source/security and
  M20 candidate/live consumer tooling while preserving M19 commands/history.
- Added a byte-identical M19 artifact/source/security baseline and exact M21
  candidate, exact, `next`, `latest` and unqualified script surfaces.
- Review 149 cycle 1 corrected a stale pilot smoke version, peer/link
  allowlisting and the offline-store execution environment; cycle 2 passed all
  twelve areas with zero findings.
- Formatting/docs/lint/typecheck/build, 689 tests, 23 tooling tests, package/
  dependency/artifact/source/security checks and lower/latest M20 native/pilot
  consumers pass. No lockfile, candidate, `.release/0.4.0`, Git or npm change
  occurred.

### Next

- Implement and completely review PLAN-023 checkpoint 2. Candidate preparation,
  checkpoint 4, Git and every registry action remain out of scope.

## 2026-07-20 — PLAN-023 revision 0 approved

### Completed

- Drafted the exact M21 delivery contract for core/base `0.4.0` and pilot
  `0.2.0`, preserving completed M20 and immutable M19 history.
- Fixed local/external authorization zones, dependency-first `next`, pilot/
  base/core `latest`, exact M19 baseline and credential-free recovery commands.
- Review 148 cycle 1 corrected four script, recovery, command-format and
  registry-baseline findings; cycle 2 repeated all sixteen areas and passed
  with zero findings.
- Approved local checkpoints 1–3 only. No implementation, manifest, lockfile,
  candidate, Git, npm or other external state changed.

### Next

- Implement and completely review PLAN-023 checkpoint 1. Checkpoint 4, Git and
  every registry action remain separately gated.

## 2026-07-20 — ADR-018 revision 5 accepted

### Completed

- Revised ADR-018 only for the exact M21 three-established-package release:
  core/base `0.4.0`, pilot `0.2.0` and Schema Engine peers `^0.4.0`.
- Fixed dependency-first `next` and pilot/base/core `latest` ordering with
  immutable partial-failure and recovery rules.
- Preserved licensing, Corresponding Source, private-repository metadata, 2FA,
  Experimental APIs, frozen compatibility ranges and external gates.
- Review 147 cycles 1–4 corrected authority metadata, credential-free recovery
  requirements, stale active state and formatting; cycle 5 repeated all
  fifteen areas and passed with zero findings.
- No manifest, lockfile, version, peer, dependency, candidate, implementation,
  Git, npm or other external state changed.

### Next

- Prepare and completely review PLAN-023. Its approval is required before local
  implementation; Git and npm actions remain separately gated.

## 2026-07-20 — M21 coordinated M20 release design promoted

### Completed

- Ricard selected review-145 option A: deliver completed M20 before another
  functional or framework milestone.
- Review 146 cycles 1–2 found six current-state/index gaps, two formatting
  defects and one stale phase statement; cycle 3 repeated fourteen areas and
  passed with zero findings.
- Promoted only ADR-018 revision 5 design for core/base Angular `0.4.0` and
  Angular Aria `0.2.0`, with Schema Engine peers `^0.4.0` and unchanged
  Angular/Aria/CDK ranges.
- Fixed ADR-018's stale M19 implementation-status metadata without changing its
  accepted revision 4 decision. Reconciled STATUS, ROADMAP, Deferred and
  indexes with the selected M21 gate.
- No manifest, lockfile, package, version, dependency, candidate,
  implementation, Git, npm or other external state changed.

### Next

- Draft and completely review ADR-018 revision 5. A release plan remains
  unauthorized until the ADR is accepted after a zero-finding pass.

## 2026-07-19 — Post-M20 milestone-selection review prepared

### Completed

- Compared the remaining demand-driven Deferred candidates against accepted
  contracts, restart conditions, product value, Public/package impact,
  maintenance cost and external gates.
- Review 145 cycle 1 found only review-record formatting; cycle 2 repeated the
  complete selection review and passed ten areas with zero findings, leaving
  every candidate unpromoted.
- Identified three coherent leading paths: coordinated Experimental delivery of
  M20, a first React adapter/reference shell, or a narrow static JSON Schema
  composition slice.
- Recommended delivering the already reviewed M20 value first because source
  Public Experimental behavior currently exceeds the published package line.
  No version, dependency, architecture, implementation, Git, registry or other
  external action was selected.

### Next

- Ricard selects path A, B, C or explicitly names another Deferred product
  priority. The selection authorizes only its promotion-readiness review.

## 2026-07-19 — PLAN-022 and M20 completed

### Completed

- Repeated the entire frozen PLAN-022 matrix under Node 22.23.1/pnpm 10.28.2,
  including workspace, package/source/artifact/security, M18/M20 lower/latest
  native/pilot and both independent reference browser lanes.
- Audited raw/normalized/manual contracts, diagnostics, stable keys/IDs,
  text/state/lifecycle, Public/Internal boundaries, package manifests, Deferred
  exclusions and the complete tracked/untracked dirty tree.
- Review 144 cycle 3 passed fourteen final areas and all 27 SPEC-009 rows with
  zero findings. Frozen install, 689 workspace tests, 562 focused core/base/
  Aria tests, 120 reference unit tests and 14 Chromium tests pass.
- Marked PLAN-022 revision 0 and M20 complete; reconciled SPEC/ADR indexes,
  ROADMAP, Deferred, onboarding and package README state. No dependency,
  version, release, Git, registry or other external mutation occurred.

### Next

- Prepare a post-M20 milestone-selection review over remaining demand-driven
  Deferred candidates; Ricard must choose the next product priority before any
  promotion, architecture or implementation begins.

## 2026-07-19 — PLAN-022 checkpoint 7 completed

### Completed

- Extended only the exact Public package/declaration allowlists and added a
  package-importing external Angular renderer consumer over the widened domain.
- Added dedicated frozen lower/latest M20 native and Angular Aria pilot clean
  consumers with partial declarations, strict types, DOM, production builds
  and Chromium from current temporary workspace tarballs.
- Preserved frozen M18/M19 regressions and added an explicit offline upper
  version to the general clean-consumer verifier; no registry/release mutation
  was used as evidence.
- Review 143 corrected narrowing, stable-identity location, format/lint,
  allowlist, offline-consumer and review-record formatting defects across four
  complete applicable restarts; cycle 5 passed all areas and all 27 SPEC-009
  rows with zero findings.
- Formatting, docs, lint, types, 689 tests, builds, package/source/artifact/
  security checks, 8 snippets, 540 boundaries, 120 reference unit tests and 14
  Chromium tests pass. Manifests, lockfile, versions and release state remain
  unchanged.

### Next

- Execute and completely review PLAN-022 checkpoint 8: repeat the entire frozen
  matrix and audit contracts, lifecycle, packages, Deferred scope, docs and the
  complete dirty-tree diff before completing M20.

## 2026-07-19 — PLAN-022 checkpoint 6 completed

### Completed

- Proved the unchanged four rank-`10` Angular Aria registrations over the exact
  shared recursive-local scenario and widened object/template domain.
- Added ordinary/item/template ID, native-equivalent semantics, locale,
  movement, removal/reinsertion and invalid-identity lifecycle evidence.
- Added a package-importing external renderer declaration consumer without
  exposing owner, item, snapshot or runtime state.
- Review 142 cycle 1 passed ten areas with zero findings. Base/pilot types and
  partial compilation, two Aria tests, dependency/package gates, snippets and
  the Angular reference production build pass; Aria production/package/style/
  lockfile diffs remain empty.

### Next

- Implement and completely review PLAN-022 checkpoint 7: exact Public/package
  allowlists, dedicated frozen offline M20 consumers and all 27 SPEC rows.

## 2026-07-19 — PLAN-022 checkpoint 5 completed

### Completed

- Added the exact private recursive-local scenario with ordinary object,
  item-root and nested object-template presentation plus two stable items.
- Implemented an independent recursive Standard projection with exact concrete
  IDs, per-item state, static label caching, reconciliation and teardown.
- Preserved focused Standard buffers across movement while restoring rejected
  intentions immediately; enabled existing embedded item actions only for the
  new scenario so browser evidence exercises movement.
- Added native Angular and Standard unit/DOM/Chromium parity evidence over the
  same authored input. Review 141 cycle 3 passed ten areas with zero findings;
  catalog, types, builds, snippets, 79 reference unit tests and 14 Chromium
  tests pass.

### Next

- Implement and completely review PLAN-022 checkpoint 6: Angular Aria local
  owner conformance, semantic equivalence and custom-renderer declarations.

## 2026-07-19 — PLAN-022 checkpoints 3–4 completed

### Completed

- Widened the existing Public Angular container definition/model/tester and
  entry/panel outlet domains to the exact generic core node/template union.
- Added only Internal static/concrete owner, definition/snapshot, stable address,
  generic claim, diagnostics and ID plumbing; no Public symbol or provider was
  introduced.
- Switched ordinary object, item-root and object-template hosts from direct
  child loops to their required local forests while preserving their fixed
  labels, support text, issues and actions.
- Added exact local IDs, static label-result reuse, local diagnostic context and
  retained move/remove/reinsert state/lifecycle coverage.
- Review 139 cycle 1 passed eight checkpoint-3 areas; review 140 cycle 2 passed
  ten checkpoint-4 areas with zero findings after correcting one semantic test
  expectation. Base Angular build/types and 106 tests pass.

### Next

- Implement and completely review checkpoint 5: the neutral recursive-local
  scenario, independent Standard projection and Angular/Standard semantic
  parity.

## 2026-07-19 — PLAN-022 checkpoints 1–2 completed

### Completed

- Implemented generic core presentation contracts and the explicit template
  alias while retaining unparameterized root compatibility.
- Compiled authored/default ordinary object, item-root and object-template
  forests with exact owner-local diagnostics, fallback, keys and deep freezing.
- Added valid/invalid serialized fixtures plus programmatic local safety,
  identity, manual-key, traversal, frozen-context and non-invocation coverage.
- Migrated repository-authored core manual definitions and generalized manual
  validation without changing runtime, operation, scope, validation, snapshot,
  value, baseline or collection-identity contracts.
- Review 137 cycle 2 passed ten checkpoint-1 areas and review 138 cycle 2 passed
  eight checkpoint-2 areas with zero findings after complete correction/review
  restarts. Core types, build, package smoke, 453 tests, conformance and diff
  checks pass.

### Next

- Implement and completely review PLAN-022 checkpoint 3: widen only the
  accepted Angular generic SPI and add Internal concrete-owner projection
  context without switching object/item host projection yet.

## 2026-07-19 — PLAN-022 revision 0 approved

### Completed

- Mapped accepted SPEC-009 to eight bounded core, Angular native, Standard,
  Angular Aria, package/consumer and final-review checkpoints.
- Review 136 replaced indirect M18/M19 consumer evidence with dedicated
  current-workspace lower/latest M20 lanes; cycle 2 passed fifteen areas with
  zero findings and approved revision 0.
- Reconciled current-state, roadmap, Deferred and documentation indexes. No
  code, dependency, version, Git or external action occurred before approval.

### Next

- Implement and completely review PLAN-022 checkpoint 1: generic core
  contracts, local compiler normalization/diagnostics and fixtures.

## 2026-07-19 — SPEC-009 v0.1.0 accepted

### Completed

- Defined optional local object/item presentation grammar with exact direct
  ownership, local order conflict, immutable defaults and atomic fallback.
- Closed the defaulted generic node/template definitions, owner-qualified
  static keys, manual-definition context and exact concrete stable-item IDs.
- Specified per-item state/lifecycle, mounted descendants, text-result reuse,
  minimal Angular SPI migration and mandatory native/Aria/Standard evidence.
- Review 135 cycle 1 corrected formatting/indexing and three wording defects;
  cycle 2 corrected accepted SPEC-008/SPEC-009 authority wording; cycle 3
  corrected stale current-gate language; cycle 4 reconciled root onboarding;
  cycle 5 corrected stale review authority/evidence wording; cycle 6 repeated
  all fourteen areas with zero findings and accepted v0.1.0.
- Reconciled STATUS, ROADMAP, Deferred/SPEC/ADR/documentation indexes and links.
  No plan, code, dependency, version, Git or external action occurred.

### Next

- Draft and completely review PLAN-022 for the accepted M20 contract before
  implementation.

## 2026-07-19 — ADR-025 revision 0 accepted

### Completed

- Designed one defaulted generic presentation family with an explicit template
  specialization and required local forests on nested object/item definitions.
- Fixed owner-local membership, qualified static keys, stable item-instance
  DOM/state identity, local fallback/manual validation and static text reuse.
- Widened only the accepted Angular SPI's generic node domain while retaining
  all item/snapshot/application authority in its Internal scoped context.
- Review 134 cycle 1 corrected the template text-definition domain and local
  section diagnostic identity; cycle 2 closed the provider/tester diagnostic
  ambiguity and malformed review row; cycle 3 corrected stale STATUS authority;
  cycle 4 repeated thirteen areas with zero findings and accepted ADR-025
  revision 0.
- Reconciled STATUS, ROADMAP, Deferred/ADR/documentation indexes and links. No
  SPEC, plan, code, dependency, version, Git or external action occurred.

### Next

- Draft and completely review SPEC-009 under accepted ADR-025 before preparing
  any implementation plan.

## 2026-07-19 — D-011/M20 local-layout promotion accepted

### Completed

- Reviewed the accepted nested-object, collection, presentation and Angular
  container contracts plus the implemented core/Angular/Standard seams.
- Accepted review 133 cycle 3 with zero findings, promoting only static local
  presentation forests over direct nested-object and item-template children.
- Kept data/runtime/scope authority unchanged and preserved workflow, actions,
  conditions, general theming, later frameworks and release work as Deferred.
- Recorded M20 as design-only in STATUS, ROADMAP, the Deferred register and the
  documentation index; no SPEC, plan, code, Git or external action occurred.

### Next

- Draft and completely review ADR-025, closing the recursive root/template type
  model, owner-qualified identity/fallback and Angular SPI migration before any
  SPEC-009 preparation.

## 2026-07-19 — PLAN-021 and M19 completed

### Completed

- Completed checkpoint 11 after review 132 cycle 4 repeated all eighteen
  final-release areas and all 22 SPEC-008 rows with zero findings.
- Recovered the exact frozen non-interactive install through the validated
  global offline pnpm store with zero downloads and no lifecycle scripts.
- Reconciled stale private/partial M19 language across active onboarding,
  release, roadmap, deferred and index documents; added fail-closed stale-state
  checks without rewriting historical WORKLOG entries.
- Reverified the byte-identical public core/base `0.3.0` and pilot `0.1.0`
  line, complete local/reference/candidate/live matrices and exact/
  `next`/`latest`/unqualified resolution without registry or Git mutation.
- Marked PLAN-021 revision 0 and M19 Completed with no active implementation
  task.

### Next

- Decide which Deferred capability or framework target, if any, to promote as
  the next milestone. No implementation, Git or external action is active.

## 2026-07-19 — PLAN-021 checkpoint 10 completed

### Completed

- Ricard moved only core `latest` to the exact inspected `0.3.0`, closing the
  planned mixed window.
- Reverified exact three-package bytes, integrity/signatures, public access,
  maintainers, metadata and coordinated aliases: core/base
  `next/latest: 0.3.0`, pilot `next/latest: 0.1.0`.
- Lower `22.0.6` and latest-compatible `22.0.7` native/pilot consumers pass
  strict installation, partial compilation, types, unit behavior, production
  build and Chromium through both `latest` and unqualified resolution.
- Review 131 cycle 1 passed all nine areas with zero findings; no unrelated
  registry or Git mutation occurred.

### Next

- Stop with no active implementation task for separate authorization of
  checkpoint 11's read-only complete final closure.

## 2026-07-19 — PLAN-021 checkpoint 10 pre-transition gate passed

### Completed

- Reverified npm identity, exact three-package bytes/integrity/signatures and
  the exact core default-transition target.
- Confirmed the checkpoint 9 mixed window remains unchanged: core
  `next: 0.3.0`, `latest: 0.2.0`; base `next/latest: 0.3.0`; pilot
  `next/latest: 0.1.0`.
- Reverified core public access, maintainer, manifest, source/license and absent
  repository/provenance. Review 130 cycle 1 passed all seven areas with zero
  findings; no registry mutation occurred.

### Next

- Ricard manually executes only
  `npm dist-tag add @rabassoft/schema-engine@0.3.0 latest`. After success,
  verify aliases/bytes before running `latest` and unqualified consumers.

## 2026-07-19 — PLAN-021 checkpoint 9 completed

### Completed

- Ricard moved only base Angular `latest` to the exact inspected `0.3.0`.
- Reverified base bytes, integrity/signature, access, maintainer, manifest,
  peers, source/license and absent repository/provenance.
- Confirmed pilot remains `next/latest: 0.1.0` and core remains
  `next: 0.3.0`, `latest: 0.2.0`; no unrelated registry drift occurred.
- Preserved the intentional dependent-first mixed window without running or
  accepting `latest`/unqualified consumer evidence. Review 129 cycle 1 passed
  all seven areas with zero findings.

### Next

- Stop with no active implementation task for separate authorization of
  checkpoint 10's read-only core default-transition preflight.

## 2026-07-19 — PLAN-021 checkpoint 9 pre-transition gate passed

### Completed

- Reverified npm identity, exact three-package bytes/integrity/signatures and
  the intended dependent-first base Angular transition target.
- Confirmed all three `next` aliases are exact, pilot `latest` is `0.1.0` and
  both established core/base `latest` aliases remain `0.2.0`.
- Reverified base public access, maintainer, manifest, peers, source/license and
  absent repository/provenance.
- Exact and `next` lower `22.0.6` and latest-compatible `22.0.7` native/pilot
  matrices pass through Chromium. Review 128 cycle 1 passed all eight areas
  with zero findings. No registry mutation occurred.

### Next

- Stop for immediate approval of only
  `npm dist-tag add @rabassoft/schema-engine-angular@0.3.0 latest`. After
  success, verify the intentional mixed window before checkpoint 10.

## 2026-07-19 — PLAN-021 checkpoint 8 completed

### Completed

- Reobserved pilot `next` and `latest` resolving to the exact inspected
  `0.1.0`; selected the no-write retention branch required by PLAN-021.
- Reverified exact public bytes, integrity, signature, access, maintainer,
  manifest, peers, root/style exports, license and absent repository/provenance.
- Confirmed core/base tags remain `next: 0.3.0` and `latest: 0.2.0` with no
  unrelated registry drift.
- Review 127 cycle 1 corrected deferred-register formatting; cycle 2 repeated
  all seven areas with zero findings. No `dist-tag`, publication, settings or
  Git mutation occurred.

### Next

- Stop with no active implementation task for separate authorization of
  checkpoint 9's read-only base Angular default-transition preflight.

## 2026-07-19 — PLAN-021 checkpoint 7 completed

### Completed

- Ricard published the exact selected Angular Aria pilot `0.1.0` under `next`.
- Unauthenticated evidence proves the public 28,192-byte tarball matches source
  commit `ce3ef3d`, SHA-512/integrity and signature; access, maintainer, peers,
  exports, six CSS properties, license/source and absent repository/provenance
  match the reviewed candidate.
- Observed `next: 0.1.0` and npm's automatically established
  `latest: 0.1.0` without tag mutation. Core/base stay `next: 0.3.0` and
  `latest: 0.2.0`.
- Corrected the live consumer runner so frozen tuple selection does not force
  offline registry installation; candidate mode remains offline.
- Exact and `next` lower `22.0.6` and latest-compatible `22.0.7` native/pilot
  lanes pass partial compilation, types, unit behavior, production build and
  Chromium. Review 126 cycles 2–3 corrected closing-document formatting and an
  ambiguous public-source line; cycle 4 repeated all nine areas with zero
  findings.

### Next

- Stop with no active implementation task for separate authorization of
  checkpoint 8's read-only pilot `latest` observation and retention branch.
  No registry or Git mutation is authorized.

## 2026-07-19 — PLAN-021 checkpoint 7 pre-publication gate passed

### Completed

- Reverified authenticated identity, organization ownership,
  `auth-and-writes` 2FA, live core/base exact bytes and coordinated `next`
  aliases; both established `latest` aliases remain `0.2.0`.
- Confirmed the pilot package remains absent and the selected 28,192-byte
  candidate is byte-reproducible with SHA-512 `4a1be718…58d54b8`, exact peers,
  root/style exports and six CSS properties.
- Repeated artifact/isolation/security checks and the offline Corresponding
  Source rebuild with zero downloads.
- Extended the consumer runner to accept a selected pilot tarball only in
  exact/`next` modes, then passed lower `22.0.6` and latest-compatible `22.0.7`
  native/pilot lanes in both modes through Chromium.
- Review 125 cycle 1 corrected the missing hybrid runner mode and recovered the
  neutral dry run from a root-owned global npm cache. Cycle 2 ran closing checks
  from the wrong directory; cycle 3 then found the stale previous documentation
  count; cycle 4 then exposed the stale review heading. Cycle 5 reconciled it,
  separated both contexts and repeated all nine areas with zero findings. No
  registry write occurred.

### Next

- Stop for immediate approval of only
  `npm publish ./rabassoft-schema-engine-angular-aria-0.1.0.tgz --access public --tag next --provenance=false`.
  After success, verify the pilot completely before checkpoint 8.

## 2026-07-19 — PLAN-021 checkpoint 6 completed

### Completed

- Ricard published the exact selected base Angular `0.3.0` candidate under
  `next`.
- Unauthenticated verification proves the public 122,465-byte tarball exactly
  matches source commit `ce3ef3d`, SHA-512/integrity and one npm signature;
  repository/provenance remain absent and access/maintainer are correct.
- Core/base both report `next: 0.3.0` and unchanged `latest: 0.2.0`; the Angular
  Aria pilot package remains absent.
- Exact and `next` live native consumers pass core execution plus strict base
  compilation at Angular `22.0.6` and `22.0.7`, including signature audits.
- Review 124 cycle 1 found and corrected stale current-state publication gates;
  cycle 2 passed all nine post-publication areas with zero findings. No
  pilot/tag/settings/GitHub/repository mutation occurred.
- Closing formatting, 204-file/698-link documentation checks, lint, all 13
  release-target tests and diff checks pass.

### Next

- Stop for explicit PLAN-021 checkpoint 7 authorization to run only the
  read-only Angular Aria pilot preflight. Pilot publication remains a later
  immediate gate.

## 2026-07-19 — PLAN-021 checkpoint 6 pre-publication gate passed

### Completed

- Reverified live core exact/`next` `0.3.0`, unchanged core `latest: 0.2.0`,
  absent base `0.3.0`, unchanged base tags and absent pilot package.
- Confirmed the selected 122,465-byte base candidate's SHA-512/integrity,
  source commit `ce3ef3d`, core peer `^0.3.0`, aligned Angular peers,
  distribution isolation and license/source contents.
- Rebuilt core/base Corresponding Source offline with the validated local pnpm
  store and zero downloads after the incomplete default store was rejected.
- Repeated clean lower Angular `22.0.6` and latest-compatible `22.0.7`
  consumers against live core plus the selected base candidate.
- Repeated the exact neutral basename-relative base dry run. Review 123 cycles
  1–2 recovered the store and narrowed one stale-state false positive; cycle 3
  passed all eight pre-publication areas with zero findings.
- No registry write or tag/access/provenance/GitHub/repository mutation
  occurred.

### Next

- Stop for immediate approval of only
  `npm publish ./rabassoft-schema-engine-angular-0.3.0.tgz --access public --tag next --provenance=false`.
  After success, verify base completely before checkpoint 7.

## 2026-07-19 — PLAN-021 checkpoint 5 completed

### Completed

- Ricard published the exact selected core `0.3.0` candidate under `next`.
- Unauthenticated verification proves the public 213,647-byte tarball exactly
  matches source commit `ce3ef3d`, SHA-512/integrity and one npm signature;
  repository/provenance remain absent and access/maintainer are correct.
- Core reports `next: 0.3.0` and unchanged `latest: 0.2.0`; base Angular stays
  wholly at `0.2.0` and the pilot name remains absent.
- Corrected the clean-consumer runner to permit live core specifiers while base
  Angular remains a selected tarball, then repeated exact and `next` lanes.
- Both lanes compile/execute core and base candidate consumers at Angular
  `22.0.6` and current latest-compatible `22.0.7`.
- Review 122 cycles 1–2 corrected the live-specifier runner and stale current
  state; cycle 3 passed all nine post-publication areas with zero findings. No
  other package, tag, access/provenance, GitHub or repository state changed.

### Next

- Stop for explicit PLAN-021 checkpoint 6 authorization to run the read-only
  base Angular preflight. Its publication remains a later immediate gate.

## 2026-07-19 — PLAN-021 checkpoint 5 pre-publication gate passed

### Completed

- Resumed after Ricard restored npm authentication; npm `10.9.8`, exact
  official registry and `ricardrabasso` identity pass.
- Verified `rabassoft` owner membership, `auth-and-writes` 2FA, read/write
  existing package authority and ability to create the absent scoped pilot.
- Confirmed all three target versions absent; core/base contain only `0.1.0`
  and `0.2.0`, with both `next`/`latest` aliases still at `0.2.0`.
- Reverified public `0.2.0` bytes against the frozen baseline and selected core
  `0.3.0` bytes/hash/integrity/source commit `ce3ef3d` locally.
- Repeated the exact basename-relative neutral core dry run. Review 121 cycle 2
  passed all nine pre-publication areas with zero findings.
- No package, tag, access, provenance, GitHub or other external state changed.

### Next

- Stop for immediate approval of only
  `npm publish ./rabassoft-schema-engine-0.3.0.tgz --access public --tag next --provenance=false`.
  After success, verify core completely before checkpoint 6.

## 2026-07-19 — PLAN-021 checkpoint 5 preflight paused at authentication

### Observed

- Ricard authorized the external read-only core publication preflight.
- `npm config get registry` confirmed exactly
  `https://registry.npmjs.org/`.
- `npm whoami` returned `E401 Unauthorized`; the preflight stopped fail-closed
  before organization, ownership, versions, tags or package metadata queries.
- No login, credential change, publication, dist-tag or other registry write
  was attempted.

### Next

- Ricard runs `npm login --registry=https://registry.npmjs.org/` locally and
  confirms completion; then resume the already authorized read-only preflight.

## 2026-07-19 — PLAN-021 checkpoint 4 completed

### Completed

- Reviewed and staged the exact 99-file M18/M19 scope while excluding the
  unrelated `angular.json` CLI analytics opt-out.
- Created private source commit `ce3ef3dd3f9154c95896bcefa22e31b4f293eda0`
  as `Rabassoft <ricard@rabassoft.com>` and pushed it to `origin/develop` after
  switching GitHub CLI to the `rabassoft` account.
- Rebuilt from the clean source commit with `pnpm prepare:release`; builds,
  frozen `0.2.0`, M19 artifacts, offline Corresponding Source, security and
  original/neutral dry runs pass.
- Proved all three clean candidates byte-identical to their checkpoint 3
  inputs and selected the same exact sizes, SHA-512/integrity and neutral
  basenames with `sourceCommit: ce3ef3d…`.
- Review 120 cycles 1–2 corrected the closing dirty-state description and one
  stale pre-commit verification; cycle 3 passed all eight areas with zero
  findings. No npm registry
  read/write, publication, tag/settings mutation, Git tag, GitHub Release or
  repository-setting action occurred.
- Restored `angular.json` unchanged. Checkpoint 4 closure documentation and its
  stale-state validation remain uncommitted because no second commit was
  authorized.

### Next

- Stop for explicit PLAN-021 checkpoint 5 authorization to run the read-only
  core registry preflight. Core publication requires a separate immediate
  approval after the preflight passes.

## 2026-07-19 — PLAN-021 checkpoint 3 completed

### Completed

- Completed the frozen local M19 matrix: offline install, formatting, docs,
  lint, types, 668 tests, builds, package/consumer/artifact/source/security,
  snippets, import boundaries and both independent Chromium lanes.
- Split frozen local consumer tuples from registry-backed live tuple resolution;
  lower Angular `22.0.6` and latest-compatible `22.0.7`, both with Aria/CDK
  `22.0.5`, pass native and pilot lanes offline.
- Generated the three dirty-tree candidates twice with identical bytes and
  SHA-512 hashes, rebuilt them from Corresponding Source and passed original
  plus fresh neutral-directory dry runs. Evidence records `sourceCommit: null`.
- Made reference E2E execution use the ignored workspace Playwright cache
  deterministically without tracking browser binaries.
- Review 119 cycles 1–4 corrected tuple-boundary, neutral-rehearsal, cache,
  stale-document, formatting and final future-state findings. Cycle 5 repeated fourteen areas and
  all 22 SPEC-008 rows with zero findings.
- No Git operation, registry access, authentication, publication or tag/settings
  mutation occurred.

### Next

- Stop for explicit PLAN-021 checkpoint 4 authorization to review the scoped
  diff, exclude unrelated changes unless selected, commit, push privately and
  rebuild/compare from the exact clean commit.

## 2026-07-19 — PLAN-021 checkpoint 2 completed

### Completed

- Added candidate-state `0.3.0` release notes with the exact three-package
  matrix, complete SPEC-008 Public migration, compatibility, installation,
  pilot composition/style, licensing/source and exclusion boundaries.
- Reconciled root, core, Angular and pilot onboarding with the private source
  candidates while preserving the truthful published `0.2.0` history.
- Made documentation validation consume the exact M19 descriptor across all
  three manifests and reject stale candidate, version, publication, provider,
  provenance and package-surface claims.
- Review 118 cycle 1 corrected six documentation/validation findings; cycle 2
  corrected one exact-version/stale-check coverage finding; cycle 3 repeated
  all ten areas with zero findings.
- Documentation, formatting, lint, release tooling, artifact, isolation,
  security, diff and offline frozen source-build checks pass. No candidate was
  selected and no Git, registry or npm action occurred.

### Next

- Execute PLAN-021 checkpoint 3: complete local gate, deterministic inspected
  artifacts, neutral-path dry runs and full implementation review. Perform no
  Git or registry action.

## 2026-07-19 — PLAN-021 checkpoint 1 completed

### Completed

- Added one validated deeply frozen M19 descriptor for exact core/base `0.3.0`
  and pilot `0.1.0` identities, dependency order, packed peers and filenames.
- Made packing, artifact/source/security checks, candidate metadata, future
  live verification and candidate/exact/next/latest/unqualified consumers
  consume the descriptor and fail on mixed or unexpected lines.
- Added twelve focused tests and closed candidate evidence to exact toolchain,
  commit, byte, SHA-512, integrity and non-credential fields.
- Preserved the historical coordinated tooling and byte-identical public
  `0.2.0` baseline independently from mutable tags and M19.
- Review 117 cycle 1 corrected six implementation findings; cycle 2 repeated
  all ten areas with zero findings. Artifact/source/security checks pass, with
  source builds using cached content and zero downloads.
- No production contract, selected candidate, commit, push, registry access or
  npm mutation occurred.

### Next

- Implement PLAN-021 checkpoint 2 candidate-state `0.3.0` release notes,
  onboarding/manifests and stale-document checks. Perform no Git or external
  action.

## 2026-07-19 — PLAN-021 revision 0 approved

### Completed

- Drafted the eleven-checkpoint M19 delivery contract for exact core/base
  `0.3.0` and pilot `0.1.0` candidates.
- Separated local preparation, clean Git evidence, dependency-first `next`
  publication, observed pilot default and dependent-first base/core `latest`.
- Added exact immutable recovery for every partial package/tag state and full
  post-write identity, byte, signature, metadata, source and drift checks.
- Review 116 cycle 1 corrected six registry-baseline, external-read, post-write,
  first-package-identity, mixed-window and closing-document findings. Cycle 2
  corrected one stale plan-state header; cycle 3 repeated fourteen areas and
  closing documentation with zero findings.
- Approved PLAN-021 revision 0 for local checkpoints 1–3 only. No
  implementation, commit, push, registry access or npm mutation occurred.

### Next

- Implement PLAN-021 checkpoint 1: validated unequal-version three-package
  release descriptor and focused tooling tests, preserving the frozen public
  `0.2.0` regression. Perform no Git or external action.

## 2026-07-19 — ADR-018 revision 4 accepted

### Completed

- Generalized publication architecture from the two original packages to the
  exact accepted M19 core/base `0.3.0` plus pilot `0.1.0` line.
- Fixed dependency-first publication under `next`, dependent-first base/core
  `latest`, first-pilot alias observation and immutable partial recovery.
- Reconciled current official npm CLI behavior with prior registry evidence:
  plans must observe rather than assume an initial `latest`.
- Preserved package-local Corresponding Source, AGPL/commercial rights,
  write-protected 2FA, private repository/no provenance and immediate approval
  before every external mutation.
- Review 115 cycles 1–2 corrected six normative findings; cycles 3–4 corrected
  closing-state documentation and repeated all thirteen areas with zero
  findings. ADR-018 revision 4 is Accepted.

### Next

- Draft and completely review PLAN-021. Do not implement, commit, push, access
  registry state or mutate npm before the plan and its later gates authorize
  each action.

## 2026-07-19 — M19 release promotion readiness accepted

### Completed

- Selected a coordinated Experimental release of core/base Angular `0.3.0`
  plus Angular Aria pilot `0.1.0` before another functional milestone.
- Review 114 cycle 1 found five stale current-state phrases; cycle 2 repeated
  twelve areas with zero findings and promoted only the exact release boundary
  for normative design.
- Confirmed SPEC-008 and ADR-010 already govern versions, peers, behavior and
  independent SemVer; no new behavioral SPEC or ADR-010 revision is needed.
- Identified ADR-018 revision 3's exact two-package limitation. Revision 4 must
  admit the pilot and close dependency order, mandatory `latest`, partial
  failure and immutable recovery before PLAN-021.
- Preserved D-043, repository visibility/OIDC/provenance, commit, push and every
  npm action as separately inactive or gated.

### Next

- Draft and completely review ADR-018 revision 4. Do not prepare PLAN-021 or
  perform any external action before that ADR is accepted.

## 2026-07-18 — PLAN-020 and M18 completed

### Completed

- Ran the frozen offline install and complete checkpoint-8 verification matrix.
- Repeated all fourteen final implementation-review areas and reconciled all 22
  SPEC-008 rows; review 113 cycle 2 closed with zero findings after correcting
  one current-state wording issue from cycle 1.
- Verified core 444, validator 7, catalog 38, base Angular 103, Angular
  reference 25, Standard 50 and pilot 1 tests, plus both reference Chromium
  lanes and native/pilot lower/latest clean consumers.
- Marked PLAN-020 revision 0 and M18 complete without publication, tag,
  repository, commit or push action. The unrelated `angular.json` analytics
  opt-out remains outside the plan.

### Next

- Select the next demand-driven milestone candidate through a separate
  prioritization and promotion-readiness decision; no implementation task is
  active.

## 2026-07-18 — PLAN-020 checkpoint 7 completed

### Completed

- Executed the separately authorized registry-backed latest-compatible gate.
- Resolved exact Angular core/forms/build/CLI/compiler `22.0.7` and Angular
  Aria/CDK `22.0.5`, including the exact Aria CDK peer patch.
- Passed strict install, partial compilation, strict types, DOM, production
  build and Chromium in independent native and pilot clean consumers.
- Review 112 cycle 1 reconciled lower/latest, artifacts, source, security,
  workspace/browser regression and all 22 rows with zero findings.

### Next

- Execute PLAN-020 checkpoint 8 final frozen install, complete repeated review
  and M18 persistent-state reconciliation; do not publish, commit or push.

## 2026-07-18 — PLAN-020 checkpoint 7 local pre-network gate ready

### Completed

- Added explicit private core/base `0.3.0` plus pilot `0.1.0` artifact,
  SemVer-rewrite, inventory, isolation, security and Corresponding Source gates.
- Added a frozen standalone source-build harness for the pilot and proved all
  three packages rebuild offline with declarations/exports/behavior equal to
  shipped output.
- Added separate clean lower-bound native and pilot projects. Both pass exact
  peer installation, partial compilation, strict types, DOM, production build
  and Chromium at Angular `22.0.6`; the pilot uses exact Aria/CDK `22.0.5`.
- Corrected the published `0.2.0` regression so it verifies the frozen
  byte-identical tarballs instead of attempting to relabel `0.3.0` sources.
- Review 111 cycles 1–2 found the stale regression and two unformatted
  persistent-state files; cycle 3 repeated all twelve local areas, the 22-row
  applicable evidence and complete verification with zero findings.

### Next

- Obtain separate network authorization and run
  `pnpm test:consumer:m18:latest`; inspect the resolved Angular/Aria/CDK tuple
  and complete checkpoint 7 only if both latest clean consumers pass.

## 2026-07-18 — PLAN-020 checkpoint 6 completed

### Completed

- Implemented exactly four rank-10/priority-0 pilot registrations behind the
  sole Public provider function; all implementation classes remain Internal.
- Composed only tabs with Angular Aria wrap/roving/follow-focus and preserved
  content. Section, accordion and grid retain native accepted semantics and
  exact Public base-outlet projection.
- Added the opt-in host-scoped stylesheet with exactly six Public properties and
  exact defaults, no reset/global/import/JS side effect and usable unstyled
  behavior.
- Review 110 cycle 1 corrected package-smoke formatting; cycle 2 repeated all
  eleven areas with zero findings. All workspace and pilot build/type/test/
  package/dependency/boundary/documentation gates pass.

### Next

- Prepare PLAN-020 checkpoint 7 local coordinated artifacts, source/package
  allowlists and lower-bound clean consumers; stop before registry-backed
  latest-compatible consumer resolution for separate authorization.

## 2026-07-18 — PLAN-020 checkpoint 5 completed

### Completed

- Resolved only Angular Aria/CDK `22.0.5` for the isolated pilot with scripts
  disabled; one new lock importer and the exact two package/snapshot entries
  were added over the existing Angular `22.0.6` toolchain.
- Verified Aria's exact CDK `22.0.5` peer, MIT licenses, absence of lifecycle
  scripts and the accepted dependency graph through a repeatable package gate.
- Review 109 cycle 1 repeated all ten checkpoint areas with zero findings.
  Formatting, lint, docs, strict types, all builds/tests/package smokes,
  dependency and boundary gates pass. Pilot behavior remains unimplemented.

### Next

- Execute PLAN-020 checkpoint 6: four rank-10 pilot registrations, selective
  Angular Aria tabs, native pilot section/accordion/grid and the exact
  six-property opt-in stylesheet; repeat its complete review to zero findings.

## 2026-07-18 — PLAN-020 checkpoint 5 pre-network gate reached

### Completed

- Moved only core/base source manifests to the coordinated private `0.3.0`
  candidate line while preserving published/release-facing `0.2.0` state.
- Added the non-private `@rabassoft/schema-engine-angular-aria@0.1.0` package
  skeleton with ESM partial compilation, exact root/style export map, peer and
  runtime metadata, legal/source documents and an intentionally empty Public
  declaration before checkpoint-6 implementation.
- Added empty-surface package smoke and extended public import/manifest boundary
  verification to the third package. Core/base contain no pilot, Aria, CDK or
  style reference and `pnpm-lock.yaml` remains unchanged.
- Review 108 cycles 1–2 corrected a trailing LICENSE byte and an explicit Node
  URL import. Cycle 3 repeated all ten local areas with zero findings.
- Formatting, lint, docs, strict types, seven-project build, all package smokes,
  all existing unit suites, 12 boundary self-tests and the live 3-public-package
  boundary audit pass. No network, dependency resolution, implementation,
  publication, commit or push occurred.

### Next

- Obtain separate authorization and run the exact PLAN-020 checkpoint 5
  `pnpm --filter @rabassoft/schema-engine-angular-aria add ...` command, then
  inspect the one-importer lock diff, exact Aria/CDK graph, peer patch, licenses
  and lifecycle metadata before completing the checkpoint.

## 2026-07-18 — PLAN-020 checkpoint 4 completed

### Completed

- Added the private `advanced-presentation` catalog scenario composing section,
  nested tabs, accordion and grid over unchanged controlled data and operations.
- Added an independent direct-core Standard DOM projection with exact IDs,
  semantics, keyboard behavior, mounted hidden descendants, target-local state,
  responsive grid fallback, local text fallback and idempotent teardown.
- Projected the same authored scenario through the native Angular reference
  without sharing target components, controllers, CSS or lifecycle behavior.
- Review 107 cycles 1–4 corrected snapshot-only text re-resolution, an undefined
  Standard CSS property, incomplete advanced Chromium reset/replacement evidence
  and one strict-test unused field. Cycle 5 repeated all twelve areas with zero
  findings.
- All workspace unit suites pass at core 444, validator 7, catalog 38, base
  Angular 103, Angular reference 25 and Standard 50 tests. Formatting, lint,
  strict types, both production builds, package/artifact checks, snippets, 490
  boundaries and Chromium Standard 6/6 plus Angular 8/8 pass. No package,
  version, dependency, external action or push entered checkpoint 4.

### Next

- Prepare PLAN-020 checkpoint 5 locally: core/base `0.3.0` manifests and the
  private-first pilot `0.1.0` package skeleton. Stop before the separately gated
  Angular Aria/CDK network dependency command.

## 2026-07-18 — PLAN-020 checkpoint 3 completed

### Completed

- Added exactly nine Public Experimental base Angular container-SPI symbols and
  kept resolver, tokens, context, IDs, host factories and native classes
  Internal.
- Added descriptor-safe copied/frozen registration validation, deterministic
  rank/priority/order selection, four mandatory native fallbacks and complete
  form-projection blocking for provider configuration defects.
- Added native section, tabs, accordion and grid hosts with exact immutable
  models, depth-first cached text resolution, IDs, roles, relationships,
  keyboard/state behavior, mounted hidden descendants and responsive grid
  semantics.
- Added exact-object child claims, completeness audits, later removal/
  replacement invalidation, nearest panel/container failure ownership,
  independent sibling continuation and exact-once cleanup.
- Review 106 cycles 1–2 corrected a runtime import cycle, stale failure tests,
  advanced text order, post-audit lifecycle enforcement, Internal declaration
  leakage and packed inventory. Cycle 3 repeated all twelve areas with zero
  findings.
- Core remains green at 24 files/444 tests. Base Angular build, strict types,
  scoped lint/format, package smoke, packed candidates and all 13 files/102
  tests pass. Full-workspace lint now stops only at the expected pending
  checkpoint 4 Standard projection branch. The unrelated `angular.json`
  setting, manifests, versions, dependencies, external actions, commit and push
  remain untouched.

### Next

- Execute PLAN-020 checkpoint 4: independent Standard projection and one shared
  Angular/Standard advanced scenario, followed by a complete repeated review to
  zero findings.

## 2026-07-18 — PLAN-020 checkpoint 2 completed

### Completed

- Extended the shared iterative manual FormDefinition validator with exactly
  the eight SPEC-008 advanced-presentation reasons and no new Public symbol.
- Enforced descriptor-safe exact shapes, keys, bounded spans, global container
  and owner-local panel namespaces, active-cycle detection, presented-node
  identity and exact numeric index paths with deterministic first-defect
  precedence.
- Proved every new reason through both runtime and operation envelopes,
  including frozen/copied locators and non-invocation of validator, managed-data
  and effect logic.
- Proved presentation independence for controlled value/baseline, snapshots,
  validation inputs/issues, dirty/touched/focused state, scopes, primitive
  operations and stable collection identity/movement.
- Review 105 cycles 1–2 found two missing hostile/non-invocation evidence cases;
  cycle 3 repeated all ten areas with zero findings. Core build, strict types,
  scoped lint/format, package smoke and diff checks pass; all 24 core files and
  444 tests pass. Public contracts, Angular, Standard, manifests, versions,
  dependencies, external actions, commit and push remain untouched.

### Next

- Execute PLAN-020 checkpoint 3: Public base Angular container SPI, provider/
  claim machinery and mandatory native projection, followed by a complete
  repeated checkpoint review to zero findings.

## 2026-07-18 — PLAN-020 checkpoint 1 completed

### Completed

- Added the thirteen exact Public Experimental core advanced-presentation
  contracts and widened only the three unions accepted by SPEC-008.
- Extended root presentation compilation with iterative, descriptor-safe tabs,
  accordion, panel, grid and grid-item inspection; exact global/owner-local
  identity; closed diagnostics; atomic default-forest fallback; and immutable
  exact-key normalization retaining presented-node identity.
- Added exhaustive programmatic coverage for diagnostic families,
  deterministic order/precedence, accessors, sparse arrays, cycles, reuse,
  1,500-level depth, prototype-sensitive/whitespace/lone-surrogate IDs and
  exact freezing, plus valid/invalid serializable conformance fixtures.
- Added root type assertions and built-package smoke evidence. Review 104
  cycles 1–2 found three evidence/lint issues; cycle 3 repeated all ten areas
  with zero findings.
- Core build, strict types, scoped lint/format, package smoke, emitted
  declarations and diff checks pass; all 23 core test files and 429 tests pass.
  Runtime/manual definitions, Angular, Standard, manifests, versions,
  dependencies, the unrelated `angular.json` change, external actions, commit
  and push remain untouched.

### Next

- Execute PLAN-020 checkpoint 2: manual FormDefinition validation and runtime
  invariance, followed by a complete repeated checkpoint review to zero
  findings.

## 2026-07-18 — PLAN-020 revision 0 approved

### Completed

- Converted accepted SPEC-008 into eight bounded M18 checkpoints covering core
  grammar/compiler, manual/runtime invariance, base Angular SPI/native hosts,
  independent Standard/reference evidence, exact version/dependency gates, the
  sole Angular Aria pilot, clean consumers and final repeated review.
- Mapped all 22 required conformance rows to checkpoint evidence and preserved
  every runtime, application, deferred-target and release boundary.
- Corrected four cycle-1 findings: fixed the exact pilot dependency command and
  lock scope, separated Standard local text failures from Angular diagnostics,
  separated private `0.3.0`/`0.1.0` evidence from published `0.2.0` scripts and
  gated every registry/network action.
- Review 103 cycle 2 repeated all fourteen areas with zero findings. PLAN-020
  revision 0 was approved under the standing authorization; no implementation,
  dependency, version, external action, commit or push was performed. The
  unrelated `angular.json` analytics setting remains untouched.

### Next

- Execute PLAN-020 checkpoint 1: core Public contracts, compiler normalization,
  diagnostics and conformance fixtures; repeat the complete checkpoint review
  until zero findings.

## 2026-07-18 — SPEC-008 v0.1.0 accepted

### Completed

- Converted accepted ADR-023/024 into the normative M18 contract for static
  root tabs, accordion and logical grid without changing runtime/application
  authority or activating any deferred layout behavior.
- Closed raw/normalized contracts, exact keys and object identity,
  descriptor-safe diagnostics/atomic fallback, manual-definition reasons and
  target-owned state, mounted lifecycle, grid, accessibility and host failures.
- Closed the nine-export Angular container SPI, immutable provider resolver,
  exact claims/diagnostics, mandatory native fallback and no selected-host
  retry.
- Fixed exactly one Angular Aria 22 pilot, selective primitive use, isolated
  `0.1.0` package, core/base Angular `0.3.0` compatibility line, six opt-in CSS
  properties/defaults and Experimental support tiers.
- Required independent private Standard and shared-scenario evidence without a
  Public Standard adapter or shared target implementation.
- Review 102 cycles 1–4 found twenty normative/documentation gaps; cycle 5
  repeated all twelve areas with zero findings. SPEC-008 v0.1.0 was accepted
  under the standing authorization. No plan, code, dependency, version,
  external action, commit or push was performed; the unrelated `angular.json`
  change remains untouched.

### Next

- Draft and completely review PLAN-020. Do not implement before explicit plan
  approval.

## 2026-07-18 — ADR-024 revision 1 accepted

### Completed

- Compared current Angular Aria, Angular Material, PrimeNG and spartan/ui
  candidates using primary documentation, package metadata and distributed
  declarations; selected exactly Angular Aria 22 as the sole pilot.
- Fixed the nine-export Public Experimental Angular container SPI, Internal
  provider/claim machinery, deterministic fallback/failure behavior and exact
  child projection/lifecycle boundary without changing core authority.
- Fixed the future isolated `@rabassoft/schema-engine-angular-aria` package,
  exact Angular/Aria/CDK compatibility, six kit-local CSS properties, opt-in
  theme ownership and Experimental support tiers.
- Kept native section/tabs/accordion/grid registrations mandatory and retained
  every broader kit, generic-token, cross-framework, legacy-major,
  implementation, dependency and publication capability as Deferred.
- Review 101 cycles 1–3 found six design/documentation gaps; cycle 4 repeated
  all eleven areas with zero findings. ADR-024 revision 1 was accepted under
  the standing authorization. No code, dependency, external action, commit or
  push was performed; the unrelated `angular.json` change remains untouched.

### Next

- Draft and completely review SPEC-008. Do not draft PLAN-020 or implement
  before the SPEC is accepted.

## 2026-07-18 — Narrow D-025 Angular container-kit slice promoted

### Completed

- Reviewed accepted ADR-023 against the current Angular leaf provider/fixed
  host architecture, independent Standard projection and private duplicated
  reference themes.
- Promoted only an Angular Public + Experimental presentation-container seam
  for `section` plus tabs/accordion/grid, dependency-free native fallback and
  one isolated optional UI-library pilot.
- Kept core, Standard, React/Vue, generic tokens/CSS, complete field kits,
  multiple pilots, Stable support, publication and implementation inactive.
- Reconciled the old “Stable kit” trigger: no kit is Stable, so review 100
  permits only architecture and a privately verifiable Experimental pilot,
  avoiding a circular prerequisite without claiming existing support.
- Review 100 cycles 1–3 found eight scope/evidence/state gaps; cycle 4 repeated
  all twelve areas with zero findings. No contract, code, dependency, external
  action, commit or push was performed; `angular.json` remains untouched.

### Next

- Draft and completely review ADR-024, comparing current Angular UI-library
  candidates through primary sources and selecting exactly one pilot. Do not
  draft SPEC-008 or change code before acceptance.

## 2026-07-18 — ADR-023 revision 1 accepted

### Completed

- Drafted the narrow M18 architecture for static root tabs, accordions and
  logical grid over the accepted immutable presentation forest.
- Fixed target-owned initial/interaction/replacement state, always-mounted
  hidden panel subtrees, bounded source-order grid placement and safe
  one-column fallback without core breakpoints or UI-library metadata.
- Closed raw/normalized Public Experimental inventory, deterministic identity,
  descriptor-safe validation, text order/fallback, exact DOM tuples,
  accessibility and target-host failure envelopes.
- Review 099 cycles 1–2 found five documentation/design gaps; revision 1 closed
  them and cycle 3 repeated all ten areas with zero findings.
- Accepted ADR-023 revision 1 under the standing authorization. No SPEC, plan,
  code, dependency, external action, commit or push was performed; the
  unrelated `angular.json` change remains untouched.

### Next

- Conduct and completely review D-025 promotion readiness. Stop M18 before
  SPEC-008 if evidence is insufficient; a ready result may authorize only a
  separate architecture ADR.

## 2026-07-18 — D-011/M18 narrow layout slice promoted for design

### Completed

- Accepted review 098 after its corrected cycle 2 repeated all twelve areas
  with zero findings.
- Promoted only static root presentation tabs, accordions and logical grid from
  D-011 for ADR-023, preserving exact-once form-node identity, application and
  runtime authority, target-owned visual state and independent Angular +
  Standard evidence.
- Kept wizards, actions, scopes, conditions, nested/item layout, arbitrary
  breakpoints, controlled or persisted layout state, React/Vue and all other
  unlisted D-011/D-012 capabilities Deferred.
- Retained D-025 as a conditional separate readiness and ADR gate after
  ADR-023: an unready result stops M18 before SPEC-008/PLAN-020.
- Reconciled STATUS, ROADMAP, the documentation index, onboarding summary and
  Deferred register. This was documentation-only promotion work; no contract,
  code, external action, commit or push was performed. The unrelated
  `angular.json` change remains untouched.

### Next

- Draft ADR-023 and repeat its complete review until a pass has zero findings;
  do not draft SPEC-008, activate D-025 or change code before acceptance.

## 2026-07-18 — Integration examples explained in both reference shells

### Completed

- Added an ordered controlled-integration reading path to the Angular and
  Standard Integration tabs without changing any extracted snippet.
- Explained what every Angular state/decision/template excerpt demonstrates
  and which state, decision, persistence and mutation responsibilities remain
  with the application.
- Explained Standard compilation, runtime creation, snapshot/operation
  subscriptions, controlled operation application and deterministic cleanup
  individually, including failure and ownership boundaries.
- Kept metadata, templates/DOM and explanatory styling independently owned by
  each target under ADR-021; extended parity evidence for the common
  explanation vocabulary.
- Review 097 cycle 2 passed all ten areas with zero findings. Eight snippets,
  Angular unit/DOM 24/24 and Chromium 8/8, Standard unit/DOM 47/47 and Chromium
  6/6, strict types, lint/format, builds and diff checks pass.
- No commit or push was performed; the unrelated `angular.json` change remains
  untouched.

### Next

- Select the next milestone explicitly from the remaining Deferred register,
  then complete its promotion/design/plan gates before implementation.

## 2026-07-18 — Standard/Angular reference experience parity maintained

### Completed

- Preserved ADR-021 target independence while duplicating Angular's requested
  visible labels, control hierarchy and semantic visual language in Standard.
- Moved Standard theme selection into the header, replaced locale/visibility/
  decision selects with accessible state buttons and added coherent app-owned
  stable-team aggregate controls backed only by Public runtime intentions.
- Retained independently tested generic renderer collection controls while the
  reference shell hides them in favor of the equivalent aggregate laboratory.
- Added a test-only cross-target parity matrix for requested texts and nineteen
  semantic token values; no shared component, template, controller or CSS was
  introduced.
- Corrected unsafe team reads and a stale 17-versus-22 boundary-fixture count;
  review 096 cycle 3 repeated ten areas with zero findings.
- Standard unit/DOM 47/47, Chromium 6/6, strict types, lint/format, 12/12
  boundary fixtures, 431 imports and diff checks pass. No commit or push was
  performed; the unrelated `angular.json` change remains untouched.

### Next

- Select the next milestone explicitly from the remaining Deferred register,
  then complete its promotion/design/plan gates before implementation.

## 2026-07-18 — PLAN-018 revision 1 / D-046 / M16 completed

### Completed

- Repeated the complete checkpoint-8 authority, architecture, controlled
  lifecycle, normalized DOM, configuration, UX, accessibility, snippet,
  browser, release-isolation, documentation and diff review.
- Corrected manual theme ownership so Light/Dark covers and cleans up the whole
  document rather than only application cards; unit and Chromium evidence
  compare page and surface colors.
- Repeated frozen install, format/docs/lint/types, 590 unit/DOM tests, 431
  boundaries, Angular Chromium 8/8 and Standard Chromium 6/6 after correction.
- Repeated package smokes, exact 0.2.0 artifacts, Corresponding Source rebuilds,
  release security and clean consumers without Public/release drift.
- Final review 095 cycle 2 passed all fourteen areas and the full matrix with
  zero findings; PLAN-018 revision 1, D-046 and M16 are complete.

### Next

- Select the next milestone explicitly from the remaining Deferred register,
  then complete its promotion/design/plan gates before implementation.

## 2026-07-18 — PLAN-018 checkpoint 7 completed

### Completed

- Added an independent loopback-only Standard Playwright/Chromium lane covering
  all six scenarios, representative interactions, controlled decisions,
  configuration lifecycle, Ajv, tabs/copy/themes and repeated replacement.
- Verified 390 px and 200% reflow, keyboard/focus/status behavior and explicit
  non-certification boundaries while reusing the ignored installed browser.
- Corrected pending-operation DOM stability after Chromium exposed a lost-click
  path on form-control blur; focused unit evidence and the repeated 6/6 browser
  lane now pass.
- Repeated unchanged Angular Chromium 8/8 plus package, artifact, Corresponding
  Source, security and clean-consumer gates without Public or release drift.
- Updated root onboarding with independent Standard build/unit/E2E/dev commands
  and ports; review 094 cycle 2 repeated twelve areas with zero findings.

### Next

- Execute PLAN-018 checkpoint 8: final repeated implementation review and full
  verification to zero findings, then complete PLAN-018/M16.

## 2026-07-18 — PLAN-018 checkpoint 6 completed

### Completed

- Reorganized the Standard reference into scenario, simultaneous preview/
  editable schemas and lower observable-evidence regions with no redundant
  headings or mutually exclusive workspace tabs.
- Added independent accessible Schema/UI Schema and five-panel evidence tabs,
  keyboard roving focus, initially open Value disclosure and deterministic
  teardown.
- Added safe JSON/TypeScript highlighting, copy feedback, exact integration
  excerpts, responsive target-owned Auto/Light/Dark styling and reduced-motion
  behavior.
- Refactored snippet extraction into a declarative two-target inventory,
  preserved Angular output byte-for-byte and build-checks five exact Standard
  markers in the committed generated module.
- Expanded Standard evidence to 44 tests, extractor evidence to five tests and
  boundaries to 429 imports; review 093 cycle 1 repeated twelve areas with zero
  findings.

### Next

- Implement PLAN-018 checkpoint 7: independent Standard Chromium, complete
  release isolation and current onboarding/documentation reconciliation.

## 2026-07-18 — PLAN-018 checkpoint 5 completed

### Completed

- Added the exact five private Standard CodeMirror/highlighting dependencies
  with zero downloads and importer-only manifest/lockfile ownership.
- Added direct labelled JSON editors with controlled synchronization, line
  numbers, focus and deterministic idempotent teardown.
- Added copied original/active configuration, exact drafts/results, Validate,
  Apply, Cancel, Restore, configuration-preserving Reset and scenario selection
  with fresh runtime epochs and active-schema Ajv.
- Added inline destructive confirmation, stale invalidation, cancellation focus
  return, success status focus and distinct syntax/compiler/runtime/validation
  provenance.
- Expanded Standard evidence to 35 tests and boundaries to 417 imports; package,
  artifact, source, security and clean-consumer gates pass without Public drift.
- Corrected boundary ordering and success-focus behavior; review 092 cycle 2
  repeated twelve areas with zero findings.

### Next

- Implement PLAN-018 checkpoint 6: simultaneous workspace/evidence parity,
  syntax/copy/themes and exact multi-target Standard snippets.

## 2026-07-18 — PLAN-018 revision 1 approved

### Completed

- Ricard formally approved PLAN-018 revision 1 after review 091 cycle 3 passed
  all fourteen areas with zero findings.
- Authorized checkpoints 5–8 for private Standard editors/configuration,
  workspace parity/snippets, Chromium/isolation and final repeated review.
- Preserved completed checkpoints 1–4 and kept Public contracts, future
  frameworks, D-013, persistence, hosting, release and publication outside M16.
- Reconciled PLAN, review, ROADMAP, D-046, README and STATUS without starting
  implementation or mutating dependencies.

### Next

- Authorize and run only PLAN-018 section 15.2's exact private Standard
  dependency command; stop if the lockfile changes beyond importer ownership.

## 2026-07-18 — PLAN-018 revision 1 proposed and reviewed

### Completed

- Drafted four remaining M16 checkpoints that preserve completed checkpoints
  1–4 and deliver Accepted ADR-021 revision 1 without reimplementation.
- Fixed the exact five private Standard CodeMirror/highlighting dependencies,
  importer-only lock expectation and separate dependency-mutation gate.
- Fixed Validate/Apply/Cancel/Restore/Reset, active-schema Ajv, complete runtime
  recreation and D-013 isolation plus simultaneous workspace/evidence parity.
- Closed exact boundary allowlists/negative fixtures and five Standard snippet
  IDs with an app-local generated target while preserving Angular output.
- Corrected both tooling omissions plus the revision-0 approval-date ambiguity
  and repeated the complete review; review 091 cycle 3 passed all fourteen
  areas with zero findings.

### Next

- Decide formal approval of PLAN-018 revision 1. If approved, obtain the
  separate checkpoint 5 dependency-mutation gate before implementation.

## 2026-07-18 — ADR-021 revision 1 accepted

### Completed

- Ricard formally accepted ADR-021 revision 1 after review 090 cycle 3 passed
  all twelve areas with zero findings.
- Made cross-target reference experience and editable-configuration parity
  authoritative for M16 while retaining independent Angular and Standard
  components, lifecycle, controller state and CSS.
- Reconciled the ADR/index, D-046, ROADMAP, STATUS, WORKLOG and documentation
  review state without changing code or Public contracts.
- Kept PLAN-018 revision 0 as the approved implementation contract and paused
  checkpoint 5 because its read-only configuration scope is stale.

### Next

- Draft and completely review PLAN-018 revision 1 before requesting approval
  to resume checkpoint 5.

## 2026-07-17 — ADR-021 revision 1 proposed and reviewed

### Completed

- Committed PLAN-018 checkpoints 1–4 and completed PLAN-019/M17 as `0eecde0`
  (`feat: add standard reference foundation and Ajv validator`), excluding the
  unrelated user-owned `angular.json` analytics change.
- Drafted ADR-021 revision 1 to require one recognizable Angular/Standard
  reference experience: simultaneous preview/configuration, all evidence tabs,
  editable Schema/UI Schema, syntax presentation, copy, themes and responsive
  accessibility.
- Preserved target independence: Standard owns direct CodeMirror/DOM/lifecycle/
  CSS implementation; no shared controller, component/style package, Public
  contract or future framework target is introduced.
- Fixed exact Validate/Apply/Cancel/Restore/Reset semantics, complete runtime
  recreation and active-schema Ajv validation while keeping D-013 Deferred.
- Corrected the initially incomplete evidence-tab list and missing
  ADR-022/SPEC-007/D-013 metadata, repeated the complete review and passed
  review 090 cycle 3 with zero findings.

### Next

- Decide formal acceptance of ADR-021 revision 1. If accepted, draft and
  completely review PLAN-018 revision 1 before implementing checkpoint 5.

## 2026-07-17 — PLAN-019/M17 reusable validator completed

### Completed

- Added private `@rabassoft/schema-engine-validator-ajv` with one Experimental
  factory, exact Ajv 8.20.0/Draft 2020-12 behavior, weak cache and immutable
  normalized issues.
- Migrated Angular and Standard runtime validation from fixed scenario logic to
  the reusable integration while retaining catalog validators as fixtures.
- Added lazy Angular pre-bootstrap loading to restore the 1 MB initial budget
  and exact root development ownership for Angular/Vite virtual-root resolution.
- Corrected stale scenario-validation assertions; edited `maxLength` evidence
  now passes unit and Chromium flows.
- Review 089 cycle 2 passed the complete matrix with zero findings; PLAN-019
  revision 1 and D-047/M17 are complete without Public package drift.

### Next

- Resume Approved PLAN-018 checkpoint 5 for the Standard reference workspace
  UX, build-checked snippet and active validation evidence.

## 2026-07-17 — D-047/M17 validator delivery authorized

### Completed

- Promoted one private reusable synchronous Draft 2020-12 Ajv integration after
  review 082 cycle 1 passed with zero findings.
- Accepted ADR-022 revision 0 and SPEC-007 v0.1.0 after reviews 083–084 passed
  completely with zero findings.
- Approved PLAN-019 revision 0 for package foundation, Angular integration,
  Standard integration and final repeated review.
- Fixed exact Ajv 8.20.0 ownership, non-mutating options, weak identity cache,
  immutable issue normalization and publication/deferred boundaries.

### Next

- Implement PLAN-019 checkpoint 1 with the exact offline dependency mutation.

## 2026-07-17 — PLAN-018 checkpoint 4 completed

### Completed

- Added identity-keyed collection/item bindings with stable DOM reconciliation
  and deterministic cleanup of removed controls.
- Added normalized generic insertion drafts, nested item materialization and
  Public item edit/insert/move/remove intentions without scenario semantics.
- Verified confirmed focus behavior plus atomic stale/incompatible pending
  collection decisions against complete application-owned roots.
- Expanded Standard evidence to 25 tests covering all six catalog scenarios;
  corrected duplicate IDs and scenario-specific insertion after cycle 1.
- Review 081 cycle 2 passed format/lint/types, core/catalog/Angular/Standard
  suites, builds, 389 boundaries and Public isolation with zero findings.
- Accepted the new product demand for reusable synchronous JSON Schema
  validation; PLAN-018 checkpoint 5 is paused until separate promotion and
  architecture/contract gates complete.

### Next

- Perform promotion-readiness review for the reusable JSON Schema validator/Ajv
  integration before resuming PLAN-018 checkpoint 5.

## 2026-07-17 — PLAN-018 checkpoint 3 completed

### Completed

- Added a private stable DOM renderer consuming only normalized Public
  definitions, snapshots and runtime intentions.
- Built semantic labelled primitives, nested fieldsets and static presentation
  sections with in-place canonical-key reconciliation and deterministic cleanup.
- Added private localized number buffers, explicit clear/null actions and
  visible distinctions for missing, null, false, empty string and zero.
- Added eight focused DOM/main tests, bringing Standard evidence to 16 tests;
  corrected selectors, native enum events and incomplete-number handling after
  the first review.
- Review 080 cycle 2 passed format/lint/types, core/catalog/Angular/Standard
  tests, builds, 388 boundaries and Public isolation with zero findings.

### Next

- Implement PLAN-018 checkpoint 4: stable identity-keyed collections and full
  interactive scenario coverage.

## 2026-07-17 — PLAN-018 checkpoint 2 completed

### Completed

- Added the private Standard composition root with copied immutable controlled
  roots, Public compilation/runtime creation and observable failure diagnostics.
- Implemented exact confirm/reject/pending decisions, later pending resolution,
  stale/incompatible history and complete-root external updates without
  constructing operations or optimistic values.
- Added reset, complete baseline commit, locale and validation-visibility
  actions plus one idempotent binding/subscription/runtime cleanup path.
- Added eight focused state/lifecycle tests; corrected reset mode and cleanup
  idempotence after the first review.
- Review 079 cycle 2 passed format/lint/types, core/catalog/Angular/Standard
  tests, builds, 383 boundaries and Public isolation with zero findings.

### Next

- Implement PLAN-018 checkpoint 3: stable normalized DOM projection for
  primitives, nested objects, presentation groups and nullable leaves.

## 2026-07-17 — PLAN-018 checkpoint 1 completed

### Completed

- Added exact root Vite 8.1.4 ownership and the private
  `@schema-engine-internal/reference-standard` buildable skeleton consuming only
  Public core and the neutral catalog.
- Added strict TypeScript/Vite/Vitest configuration, loopback dev/build scripts,
  minimal semantic bootstrap and a 92.55 kB production bundle.
- Extended boundaries to three private projects and added Standard framework/
  export rejection fixtures; 378 imports and 11 verifier tests pass.
- Proved catalog watch rebuilds trigger Vite reloads without physical source
  imports, and corrected the first review's missing `vite/client` types.
- Review 078 cycle 2 passed frozen install, format/lint/types/unit/build,
  snippets, Angular/Public regression, watch and isolation with zero findings.

### Next

- Implement PLAN-018 checkpoint 2: controlled Standard application ownership,
  operation decisions and idempotent runtime/subscription lifecycle.

## 2026-07-17 — PLAN-018 approved for Standard/DOM delivery

### Completed

- Sequenced the private Standard/DOM shell into seven checkpoints: foundation,
  controlled lifecycle, normalized DOM projection, collections, reference UX,
  Chromium/isolation and final repeated review.
- Fixed exact Vite ownership, scripts, ports, file boundaries, evidence matrix,
  verification order and stop conditions.
- Preserved existing Angular commands and package/release consumers as
  independent evidence that the Standard workspace app cannot replace.
- Review 077 cycle 1 repeated twelve plan areas with zero findings and
  PLAN-018 revision 0 is Approved for checkpoints 1–7.
- The exact Vite dependency mutation, any browser download/replacement, commit,
  push and external actions retain separate gates.

### Next

- After explicit authorization, run the exact Vite dependency command, inspect
  its manifest/lock diff and execute checkpoint 1.

## 2026-07-17 — ADR-021 Standard/DOM architecture accepted

### Completed

- Fixed `apps/reference-standard` as a private direct-core consumer with no
  Angular/framework dependency or publishable adapter boundary.
- Selected exact root Vite 8.1.4 tooling, independent build/ports and strict
  package/release isolation.
- Defined shell-owned controlled state, runtime/subscription cleanup,
  normalized incremental DOM projection, all six scenarios and build-checked
  Standard integration snippets.
- Review 076 cycle 1 repeated ten architectural areas with zero findings and
  ADR-021 revision 0 is Accepted.
- Acceptance authorizes preparing/reviewing PLAN-018 only; implementation,
  dependencies, commit, push and external actions remain unauthorized.

### Next

- Draft PLAN-018, repeat its complete review until zero findings and require a
  separate approval before implementation.

## 2026-07-17 — D-046/M16 Standard/DOM boundary promoted for design

### Completed

- Confirmed that the Public core root already exposes the compiler, controlled
  runtime, operations, snapshots and subscriptions required by a direct
  Standard/DOM consumer.
- Selected one private `apps/reference-standard` shell consuming only Public
  core and the neutral catalog, without a new adapter, package or Public API.
- Required independent DOM ownership, all six catalog scenarios,
  build-checked snippets and target-specific unit/build/Chromium evidence.
- Review 075 cycle 1 repeated ten promotion areas with zero findings and
  promotes D-046 only for ADR-021 preparation.
- React, Vue, D-026, D-035, D-043, D-045, implementation, dependencies,
  hosting, publication, commit and push remain unauthorized.

### Next

- Draft ADR-021 and repeat its complete review until one pass produces zero
  findings before considering PLAN-018.

## 2026-07-17 — Reference workspace hierarchy corrected

### Completed

- Integrated the selected scenario's summary and explanation beneath its
  selector and removed the separate explanation card.
- Retained `Reference scenario`, `Interactive consumer` and
  `Observable evidence` as the sole semantic group headings, removing their
  redundant secondary titles.
- Opened State/Value by default while leaving Baseline value and the other
  native inspector disclosures collapsed.
- Review 074 cycle 1 passed hierarchy, accessibility, visual, behavioral,
  build, Chromium 8/8, boundary and Public-isolation checks with zero findings.
- No Public contract, deferred capability, commit, push, publication or
  external setting changed.

### Next

- Choose one concrete demand-backed deferred capability and perform its
  promotion-readiness review before architecture or implementation work.

## 2026-07-17 — Sober theme system completed

### Completed

- Replaced the accent-heavy light-only shell with a custom semantic token layer
  and visible Auto/Light/Dark preference without adopting Pico, Simple.css or
  another CSS framework.
- Removed the background gradient, category stripes/markers and deep shadows;
  unified cards, forms, tabs, statuses and focus around a restrained
  slate/indigo hierarchy.
- Corrected the first dark review's low-contrast fallback CodeMirror tokens
  with one shared custom syntax theme for JSON, TypeScript and Angular template
  examples.
- Review 073 cycle 2 passed light/dark visual inspection, automatic preference,
  390 px/200% behavior, 23 Angular-reference tests, 35 catalog tests, 369
  boundaries, production build and Chromium 8/8 with zero findings.
- No Public contract, deferred capability, framework CSS dependency, commit,
  push, publication or external setting changed.

### Next

- Choose one concrete demand-backed deferred capability and perform its
  promotion-readiness review before architecture or implementation work.

## 2026-07-17 — Simultaneous preview/schema layout completed

### Completed

- Removed the mutually exclusive Form preview/Schemas outer tabs introduced by
  the preceding follow-up and deleted their redundant application state.
- Rendered application controls and Form preview continuously in the left
  column and Schema/UI Schema editing continuously in the right column, with
  Observable Evidence below the complete workspace.
- Added a responsive one-column fallback while retaining only the meaningful
  Schema document and Evidence tab sets.
- Review 072 cycle 2 passed wide visual inspection, direct edit/apply workflow,
  390 px/200% reflow, 22 Angular-reference tests, 35 neutral-catalog tests, the
  939.81 kB production build, Chromium 7/7, boundaries and Public-isolation
  checks with zero findings.
- No Public contract, deferred capability, accepted plan, commit, push,
  publication or external setting changed.

### Next

- Choose one concrete demand-backed deferred capability and perform its
  promotion-readiness review before architecture or implementation work.

## 2026-07-17 — Reference workspace follow-up completed

### Completed

- Merged the former Interactive consumer and Configuration areas into one
  full-width Consumer workspace with Form preview/Schemas views and retained
  Observable Evidence as the following independent region.
- Added language-aware read-only TypeScript/Angular-template highlighting and
  accessible exact-copy controls for Integration excerpts, editable JSON
  drafts and serialized inspector evidence.
- Kept the language tooling in a deferred 142.74 kB chunk after the first
  static attempt exceeded the initial limit; the final 940.61 kB initial bundle
  remains below its 1 MB error budget.
- Review 071 cycle 2 repeated the applicable authority, hierarchy,
  highlighting/copy, accessibility, regression, browser, visual and isolation
  areas with zero findings. Scoped tests pass 22 Angular-reference tests, 35
  catalog tests, Chromium 7/7, three snippets, 359 boundaries and nine boundary
  verifier tests.
- No Public contract, deferred capability, accepted document, commit, push,
  publication or external setting changed.

### Next

- Choose one concrete demand-backed deferred capability and perform its
  promotion-readiness review before architecture or implementation work.

## 2026-07-17 — PLAN-017 completed

### Completed

- Completed all six checkpoints of the private reference workspace UX and
  configuration laboratory: accessible tabs/cards, CodeMirror JSON editors,
  safe draft state machine, diagnostics, focus/reset behavior and full
  responsive/isolation regression.
- Final review 070 cycle 1 repeated authority, dependency, UI, state,
  diagnostics, accessibility, runtime, browser, package, consumer,
  documentation and diff areas from the beginning with zero findings.
- Final matrix passes frozen install, format/docs/lint/types, 535 unit tests, 14
  tooling tests, snippets, 348 boundaries, production build, Chromium 6/6,
  packages/artifacts/source/security and clean 22.0.6/22.0.7 consumers.
- Public source/manifests/exports/versions remain unchanged. The private build's
  915.88 kB size emits a documented warning but stays below its 1 MB limit.
- No active implementation task, blocker, commit, push, publication or external
  setting mutation remains from this plan.

### Next

- Choose one concrete demand-backed deferred capability and perform its
  promotion-readiness review before architecture or implementation work.

## 2026-07-17 — PLAN-017 checkpoint 5 completed

### Completed

- Exercised all six scenarios, two tab sets, editors, diagnostics, confirmation,
  operation modes, inspectors and snippets in Chromium 6/6.
- Proved 390 px and 200% reflow without global overflow and a visible 3 px focus
  ring; visual inspection confirmed wide-layout hierarchy.
- Review 069 found and corrected sub-3:1 control/editor borders; general
  boundaries now measure 3.16:1 and interactive/editor boundaries 4.76:1.
- Frozen install, format/docs/lint/types, 535 unit tests, 14 tooling tests,
  snippets, 348 boundaries, build, packages, exact artifacts, source rebuilds,
  security and clean consumers pass after the correction.
- Public source/manifests/exports/versions have no diff. No commit, push,
  publication or external-setting mutation occurred.

### Next

- Execute PLAN-017 checkpoint 6: repeat the complete implementation review and
  verification matrix from the beginning, then close only on zero findings.

## 2026-07-17 — PLAN-017 checkpoint 4 completed

### Completed

- Added deterministic application syntax and unchanged Public compiler
  diagnostic rows with severity, code, message, paths and safe editor focus.
- Renamed scenario validation evidence and added the edited-schema caveat
  without changing the selected scenario validator.
- Documented Reset/Cancel/Restore scopes, completed inline confirmation focus
  entry/return and retained stale-confirmation dismissal.
- Proved actual collection draft inputs reset after Reset and a real scenario
  leave/return cycle.
- Review 068 corrected focus trigger plumbing, visible reset evidence and one
  stale browser diagnostic expectation, then passed cycle 2 with zero findings.
- Lint, strict types, 21 app tests, docs/diff checks and Chromium 5/5 pass. No
  Public, Git, publication or external-setting mutation occurred.

### Next

- Execute PLAN-017 checkpoint 5: full UX, accessibility and release-isolation
  regression.

## 2026-07-17 — PLAN-017 checkpoint 3 completed

### Completed

- Added independent copied original/active configuration, exact Schema/UI
  Schema drafts, draft-result state and a runtime epoch per scenario.
- Implemented non-mutating Validate, fresh-compile Apply, stale-safe loss
  confirmation, Cancel and original Restore with complete runtime replacement.
- Preserved the complete compile input, routed form and scenario validation
  through active schema, and verified warnings as successful diagnostics.
- Review 067 corrected lost collection policy, the private dev-prebundle graph
  and repeated original serialization, then passed cycle 2 with zero findings.
- Strict types, lint, 20 app tests, snippets, production build, expanded
  boundaries and Chromium 5/5 pass. The private bundle's non-blocking 750 kB
  warning remains below its 1 MB error limit; Public packages are unchanged.
- No commit, push, publication or external setting mutation occurred.

### Next

- Execute PLAN-017 checkpoint 4: diagnostic routing, honest validation/reset
  guidance and complete visible reset/focus behavior.

## 2026-07-17 — PLAN-017 checkpoint 2 completed

### Completed

- Rebuilt the Angular reference shell as semantic scenario, explanation, form
  preview, Configuration and Evidence cards with two independent accessible tab
  sets and all ten inspectors grouped by meaning.
- Added state/configuration/runtime/diagnostic visual accents with redundant
  labels, visible focus, responsive two-to-one-column behavior and contained
  long content.
- Review 066 corrected a clipped `Integration` tab and stale linear-shell
  browser assertions, then passed cycle 2 with zero findings after real visual
  inspection and complete repetition.
- Fourteen unit tests, Chromium 4/4 including 390 px keyboard/reflow, strict
  types, lint, snippets, production build, boundaries, docs/format and diff
  checks pass. Public packages remain unchanged.
- No commit, push, publication or external setting mutation occurred.

### Next

- Execute PLAN-017 checkpoint 3: configuration draft, validation and runtime-
  replacement application state.

## 2026-07-17 — PLAN-017 checkpoint 1 completed

### Completed

- Installed exact private `codemirror@6.0.2` and
  `@codemirror/lang-json@6.0.2` with pnpm 10.28.2 after Ricard authorized the
  external gate; no Public dependency changed.
- Added Internal accessible tab and controlled JSON-editor primitives with
  deterministic relationships, full tab keyboard behavior, labelled CodeMirror
  lifecycle ownership and focused tests.
- Extended the exact private boundary verifier and added a negative test for an
  unapproved editor dependency. It verifies 20 targets and 346 imports.
- Review 065 removed deprecated `::ng-deep`, repeated the complete checkpoint
  review and passed cycle 2 with zero findings. Frozen install, format/docs/
  lint/types, 14 app tests, eight boundary tests and the official Node 22.23.1
  production build pass.
- No commit, push, publication or Public change occurred. The unrelated Angular
  analytics diff remains untouched.

### Next

- Execute PLAN-017 checkpoint 2: workspace structure and visual system.

## 2026-07-17 — PLAN-017 revision 0 approved

### Completed

- Ricard explicitly approved PLAN-017 revision 0 after review 064 cycle 3
  passed all twelve areas with zero findings.
- Authorized checkpoints 1–6 within the private Angular reference-shell
  boundary. No Public contract, deferred capability or release state changed.
- Per the approved plan, the exact CodeMirror dependency installation remains a
  separate external execution gate. No implementation, install, Git or external
  action occurred in this approval checkpoint.

### Next

- Obtain authorization for the exact PLAN-017 section 3 dependency command,
  then execute checkpoint 1.

## 2026-07-17 — PLAN-017 drafted and completely reviewed

### Completed

- Drafted PLAN-017 revision 0 for the private Angular reference workspace:
  semantic cards, two accessible tab sets, responsive layout, CodeMirror JSON
  Schema/UI Schema editing and safe validate/apply/cancel/restore behavior.
- Preserved D-011/D-012 shell-only boundaries and D-013 by requiring complete
  runtime replacement after a successful Apply; no Public contract or deferred
  capability changed.
- Review 064 corrected an edited-schema validation overclaim and required
  accessible loss confirmation for Apply/Restore, then repeated all twelve
  areas. Cycle 3 passed with zero findings.
- Recorded the known collection-draft Reset correction in the plan. No
  implementation, dependency installation, Git, publication or external action
  occurred; the unrelated Angular analytics diff remains untouched.

### Next

- Decide whether to approve PLAN-017 revision 0. After approval, checkpoint 1
  still requires separate authorization for the exact CodeMirror install.

## 2026-07-17 — PLAN-016 and M15 completed

### Completed

- Completed checkpoints 1–8: exact private workspace/toolchain, descriptor-safe
  neutral catalog, six SPEC-001–006 scenarios, application-owned Angular 22
  integration, semantic UI, build-checked snippets and one Chromium smoke lane.
- Extended isolation across private/Public manifests, export targets, imports,
  artifacts and clean consumers. Public core/Angular source, contracts,
  manifests, exports, versions and verified `0.2.0` tarballs remain unchanged.
- Review 063 corrected the stale D-044 checkpoint, ADR index authorization and
  final active-state wording, then repeated the complete review. Cycle 2 passed
  with zero findings and closed PLAN-016 revision 0 and M15/D-044.
- The final matrix passes frozen install, format/docs/lint/types, 525 unit and
  ten tooling tests, production/reference builds, Chromium, package/artifact/
  source/security checks and clean Angular `22.0.6`/`22.0.7` consumers.
- No commit, push, publication, hosting or external setting mutation occurred.

### Next

- Select a concrete demand-backed deferred capability and perform its own
  promotion-readiness review. D-045 stays Deferred until target majors or an
  enterprise consumer are concrete.

## 2026-07-17 — PLAN-016 checkpoint 7 completed

### Completed

- Extended isolation checks to two private and two Public projects, every
  package files/export target, reverse dependencies and generated/browser/app
  paths. Seven boundary tests inspect 20 manifest targets and 334 imports.
- Corrected root onboarding to record live `0.2.0`, exact reference commands,
  prerequisites, application-owned controlled state and explicit non-claims.
- Excluded the ignored local Playwright cache from lint traversal. Public core
  and Angular source/manifests/exports/versions remain unchanged.
- Review 062 cycle 2 repeated the complete matrix with zero findings: frozen
  install, docs/format/lint/types, 525 unit tests, ten script tests, Chromium,
  package/artifact/source/security checks and clean Angular `22.0.6`/`22.0.7`
  consumers all pass.

### Next

- Execute checkpoint 8: repeat the complete authority, implementation,
  isolation and persistent-state review before closing PLAN-016/M15.

## 2026-07-17 — PLAN-016 checkpoint 6 completed

### Completed

- Added one Chromium Playwright project with loopback serving, fresh CI server,
  failure-only diagnostics and no video, cross-browser or certification claim.
- Installed Playwright Chromium/Chrome for Testing `149.0.7827.55` revision
  `1228`, headless shell `1228` and FFmpeg `1011` in ignored local cache state
  after the default cache proved unwritable; no `sudo` or tracked binary was
  introduced.
- Added three smoke tests covering all six scenarios, inspectors, immediate/
  reject/pending/stale decisions, reset/baseline/dirty, locale/visibility,
  nested/collection/nullable behavior, roles, names, groups and keyboard use.
- Review 061 corrected missing visible explanations, cache ownership handling
  and three inaccurate interaction assumptions. Cycle 3 repeated the full
  review with zero findings; two consecutive fresh-server runs passed 3/3.

### Next

- Execute checkpoint 7: extend isolation verification and run the full package,
  artifact, source, security, consumer and documentation regression matrix.

## 2026-07-17 — PLAN-016 checkpoint 5 completed

### Completed

- Added semantic navigation, application/decision/collection controls, status,
  inspector disclosures, pressed state, explicit labels and readable styling
  while preserving Public native renderer accessibility.
- Added three exact marked source regions, deterministic write/check extraction
  and one imported generated excerpts module. App builds now fail if it is
  stale; final PLAN-016 root/app script literals are present.
- Seven script tests cover boundary policy plus duplicate/missing/empty/nested/
  unclosed markers, line endings, idempotence, no source rewriting and stale
  source. Eleven app tests cover all six scenarios, shell semantics, collection
  actions and excerpt provenance.
- Review 060 corrected generator formatting, JIT query metadata, stale-source
  proof, the final e2e script, same-component coverage and pending accessible
  names. Cycle 3 repeated the full review with zero findings.
- Full build/tests pass with 400 core, 79 Angular, 35 catalog and eleven app
  tests; boundary verification inspects 332 imports without Public changes.

### Next

- Execute checkpoint 6 step 1: configure the single Chromium lane, then stop at
  the explicit `pnpm exec playwright install chromium` external gate.

## 2026-07-17 — PLAN-016 checkpoint 4 completed

### Completed

- Added a focused standalone Angular reference-form component whose signals own
  complete roots, locale, visibility, selected scenario, decision mode and
  immutable operation history.
- Scenario selection compiles through the Public compiler before mounting the
  Public `schemaForm`; immediate, reject, multi-pending, stale and incompatible
  flows use only Public operations and preserve application ownership.
- Added reset, whole-baseline commit and deterministic inspector panels for all
  required schema/state/definition/snapshot/diagnostic/issue/history evidence.
- Review 059 corrected the app TestBed setup, presentation-only input metadata,
  explicit standalone declarations, reset/pending immutability and the Angular
  testing-entry boundary rule. Cycle 3 repeated the full review with zero
  findings.
- Full build/tests pass with 400 core, 79 Angular, 35 catalog and eight app
  tests; four boundary tests inspect 330 imports without Public package changes.

### Next

- Execute checkpoint 5 only: shell UI/accessibility, collection controls and
  deterministic generated snippets from marked build-checked source.

## 2026-07-17 — PLAN-016 checkpoint 3 completed

### Completed

- Added exactly six neutral scenarios for controlled primitives, nested
  objects, stable collections, local definitions, static presentation groups
  and nullable leaves.
- All eleven closed feature tags have unique named ownership. Transition
  evidence covers decisions, full controlled roots, stable operations/issues,
  missing-ancestor blocking and nullable presence distinctions.
- Every scenario compiles without diagnostics through the Public compiler,
  replays through Public operations, receives exact schema identity at its
  deterministic validator and preserves immutable reset sources.
- Review 058 corrected strict array narrowing, explicit transition inventory,
  blocked-ancestor diagnostic specificity and repeated transition validation.
  Cycle 3 repeated the full review with zero findings.
- Full build/tests pass with 400 core, 79 Angular and 35 catalog tests; four
  boundary tests inspect 312 imports without Public package changes.

### Next

- Execute checkpoint 4 only: application-owned Angular signals, compile/reset,
  explicit operation decisions and deterministic inspectors.

## 2026-07-17 — PLAN-016 checkpoint 2 completed

### Completed

- Added the private generic scenario contract, closed feature vocabulary,
  metadata/source-free expected operation type and stable issue/explanation
  evidence.
- Added iterative descriptor-safe JSON-compatible copy/freeze, a fresh frozen
  validator wrapper and deterministic `ReferenceCatalogAuthoringError`
  failures with reason, path and optional scenario identity.
- Fifteen catalog tests cover all thirteen failure reasons, hostile descriptors,
  sparse arrays, cycles, symbols, proxies, hostile names, deep immutability,
  non-retention and the no-compile/no-apply/no-validation authoring boundary.
- Review 057 corrected catalog-level proxy inspection, transition-shape
  coverage, strict typing, private relative-import analysis and lint findings.
  Cycle 3 repeated the full review with zero findings.
- Full build/tests pass with 400 core, 79 Angular and 15 catalog tests; four
  boundary tests inspect 285 imports without Public package changes.

### Next

- Execute checkpoint 3 only: author the exact six neutral scenarios and prove
  Public compilation, deterministic validation and complete capability coverage.

## 2026-07-17 — PLAN-016 checkpoint 1 completed

### Completed

- Added exact Angular CLI/build `22.0.6` and Playwright `1.61.1`, five-workspace
  frozen resolution, two exact private app manifests and browser-only official
  Angular application/dev-server targets.
- The minimal standalone shell consumes core, Angular adapter and catalog only
  through package roots. Boundary verification covers 279 imports and public
  package manifests remain unchanged.
- A real catalog edit and revert each triggered catalog incremental compilation
  plus Angular dev-server rebuild. Recursive production build, strict types,
  lint and focused boundary tests pass.
- Review 056 corrected side-effect/deep-import analysis, Angular app compilation,
  sandbox IPC diagnosis and generated-cache lint ownership. Cycle 4 repeated
  the complete gate with zero findings.

### Next

- Execute checkpoint 2 only: Internal catalog contract, descriptor-safe
  copy/freeze, validator wrapper and deterministic authoring failures.

## 2026-07-17 — PLAN-016 approved; checkpoint 1 opened

### Approved

- Ricard explicitly approved PLAN-016 revision 0 after review 055 cycle 5
  passed twelve areas with zero findings.
- Approval activates only checkpoints 1–8 for the private neutral catalog and
  first Angular 22 shell. Standard/DOM, React, Vue, legacy Angular, persistence,
  hosting, publication and Public contract changes remain outside scope.
- The exact dependency installation and Chromium download remain explicit
  execution gates. Git and every other external/settings action remain
  separately unauthorized.

### In progress

- Checkpoint 1 begins with the pinned dependency gate, manifest/lockfile
  inspection, private workspace skeletons, official Angular builder and package
  boundary verification.

## 2026-07-17 — PLAN-016 reviewed and awaiting approval

### Reviewed

- PLAN-016 revision 0 defines eight buildable checkpoints for workspace/tooling,
  safe catalog authoring, six scenarios, Angular ownership, UI/snippets,
  Chromium smoke, release isolation and final repeated review.
- Angular CLI/build are pinned to `22.0.6`; Playwright is pinned to `1.61.1`.
  Dependency installation and the Chromium binary download remain separate
  external execution gates with exact commands and no lifecycle/CI cache.
- Review 055 corrected formatting, literal scripts, linked-catalog development,
  snippet freshness, clean-checkout focused commands and ambiguous Git wording.
  Cycle 5 repeated twelve areas with zero findings.

### Decision pending

- PLAN-016 is reviewed but not approved. No implementation, dependency/browser
  install, Git, publication, hosting or external settings action is authorized.

### Next

- Ricard decides whether to approve PLAN-016 revision 0 for checkpoints 1–8;
  the two external install gates and all Git actions remain separately gated.

## 2026-07-17 — ADR-020 accepted; PLAN-016 preparation opened

### Accepted

- ADR-020 revision 0 closes all nine M15 architecture questions with a private
  buildable neutral catalog, a first standalone Angular 22 shell, explicit
  application-owned controlled state, six initial scenarios, generated
  build-checked snippets and one Playwright/Chromium smoke boundary.
- Review 054 corrected formatting plus five build, evidence, ownership,
  pending-operation and zoneless-authority ambiguities. Cycle 3 repeated ten
  areas with zero findings and found no Public contract or deferred-scope
  conflict.
- Workspace interaction remains distinct from package/tarball/npm clean
  consumers. Standard/DOM, React, Vue, hosting and Angular before 19 remain
  gated or Deferred.

### Next

- Draft and completely review PLAN-016. No implementation, dependency install,
  Git or external action is authorized by ADR acceptance.

## 2026-07-16 — D-044/M15 promotion review accepted

### Accepted

- Review 053 cycle 1 corrected three authority, durable-deferral and
  alternatives-rationale findings. Cycle 2 repeated ten areas with zero
  findings and promoted D-044 only for ADR-020 normative design.
- Accepted-state cycle 3 corrected three tense/state/count findings. Cycle 4
  then found and corrected one residual Candidate/pre-selection label inside
  the active D-044 register. Cycle 5 repeated the complete review and
  reconciliation with zero findings. Format, docs across 114 Markdown
  files/461 links, active-state and diff checks pass.
- The accepted boundary contains a private neutral scenario catalog, a first
  independently built Angular 22 shell, workspace development and separate
  clean tarball/npm compatibility evidence. Playwright/Chromium is the selected
  real-browser smoke class.
- Standard/DOM, React, Vue and later shells remain gated. D-045 records future
  enterprise-oriented Angular versions before 19 without selecting a floor,
  package family or compatibility claim.

### Next

- Draft and completely review ADR-020. PLAN-016 and implementation remain
  unauthorized until their later explicit gates.

## 2026-07-16 — D-044 reframed as a multi-framework reference platform

### Decision recorded

- Ricard directed the future demonstration work to cover every supported target:
  standard/no-framework, Angular, React, Vue and later adapters.
- D-044/M15 now proposes a private framework-neutral scenario catalog with one
  independent shell per supported target. Angular remains the only first shell
  candidate because it is the currently Accepted adapter.
- Shared scenarios may own fixtures, values, expected operations/issues and
  explanatory metadata, but not runtime semantics or a cross-framework UI
  abstraction. Standard/DOM and later framework shells remain gated by their
  own accepted integration boundaries.

### Next scope

- Complete the D-044 promotion-readiness review before drafting ADR-020 or
  PLAN-016. No adapter, application or public contract was activated.

## 2026-07-16 — PLAN-015 completed; D-044/M15 registered

### Completed

- Ricard moved core `latest` to `0.2.0`; core and Angular `next`/`latest` now
  resolve to the coordinated verified pair.
- Exact, `@next`, `@latest` and unqualified clean consumers pass at Angular
  `22.0.6` and `22.0.7`. Review 052 passed the complete final release review
  with zero findings and completed PLAN-015 revision 0.

### Next scope

- Registered D-044/M15 as Candidate for a maintained Angular reference,
  consumption and demonstration application.
- No architecture or implementation is active. The exact next action is its
  promotion-readiness review before ADR-020 or PLAN-016.

## 2026-07-16 — PLAN-015 Angular latest verified

### Verified

- Ricard moved Angular `latest` to verified `0.2.0`; Angular `next` remains
  `0.2.0`.
- Core remains `next: 0.2.0` and `latest: 0.1.0`; no other tag or settings drift
  occurred. Review 051 passed with zero findings.
- No consumer evidence was accepted from the planned mixed-tag window.

### Next

- Stop for separate immediate approval to move core `latest` to `0.2.0`.

## 2026-07-16 — PLAN-015 Angular latest paused at interactive 2FA

### Observed

- The authorized Angular `latest` command reached npm, which rejected it with
  `EOTP` before mutation.
- Immediate checks confirm both `latest` aliases remain `0.1.0` and both
  `next` aliases remain `0.2.0`.

### Next

- Ricard runs the same exact Angular tag command interactively with the
  configured Security Key; Codex then verifies it before the core gate.

## 2026-07-16 — PLAN-015 Angular latest authorized

### Authorization

- Ricard explicitly authorized moving only
  `@rabassoft/schema-engine-angular@0.2.0` to `latest`.
- Core `latest`, Git and settings mutations remain unauthorized.

### Next

- Execute and verify the exact Angular tag mutation, then stop before the
  separate core `latest` gate.

## 2026-07-16 — PLAN-015 checkpoint 6 completed

### Published and verified

- Ricard published selected Angular `0.2.0` from neutral `/private/tmp`; npm
  Angular `next` now resolves to `0.2.0` while `latest` remains `0.1.0`.
- Downloaded bytes exactly match the selected 93133-byte SHA-512. Peer,
  integrity, signature, AGPL/source, absent provenance/repository and neutral
  public path metadata pass.
- Exact and `@next` paired consumers pass at Angular `22.0.6` and `22.0.7`.
  Review 050 closed checkpoint 6 and checkpoint 7 preflight with zero findings.

### Next

- Stop for immediate approval to move Angular `latest` to `0.2.0`; core
  `latest` remains separately gated.

## 2026-07-16 — PLAN-015 checkpoint 6 paused at interactive 2FA

### Observed

- The authorized neutral-path Angular publication reverified the selected
  SHA-512 and reached npm, which rejected it with `EOTP` before publication.
- Immediate checks confirm Angular `0.2.0` remains absent and its
  `next`/`latest` tags remain at `0.1.0`; no registry mutation occurred.

### Next

- Ricard executes the same exact command from the neutral directory and
  authenticates with the configured Security Key; Codex then performs all live
  verification.

## 2026-07-16 — PLAN-015 checkpoint 6 Angular publication authorized

### Authorization

- Ricard explicitly authorized the single exact neutral-path publication of
  `@rabassoft/schema-engine-angular@0.2.0` with public access, `next` and no
  provenance.
- Every `latest`, Git and settings mutation remains outside this authorization.

### Next

- Execute the exact Angular command and immediately verify immutable public
  bytes, metadata, tags, path disclosure and clean exact/`next` consumers.

## 2026-07-16 — PLAN-015 checkpoint 6 preflight passed

### Verified

- Angular `0.2.0` remains absent; its selected 93133-byte SHA-512, packed peer,
  artifacts, AGPL/source and isolated frozen rebuilds pass.
- Exact core plus local Angular candidate consumers pass on Angular `22.0.6`
  and `22.0.7`; the neutral-path exact Angular command passes its dry-run.
- Review 049 passed the complete preflight with zero findings and no external
  mutation.

### Next

- Stop for separate immediate approval of Angular `0.2.0` under `next`.

## 2026-07-16 — PLAN-015 checkpoint 5 completed

### Published and verified

- Ricard published the selected core `0.2.0` from neutral `/private/tmp`; npm
  `next` now resolves to `0.2.0` while `latest` remains `0.1.0`.
- Downloaded bytes exactly match the selected 200245-byte SHA-512. Integrity,
  registry signature, AGPL/source, absent provenance/repository and neutral
  public path metadata pass.
- Exact core and lower/upper Angular candidate consumers pass. Review 048
  closed the complete checkpoint with zero findings.

### Next

- Execute checkpoint 6 Angular publication preflight and stop before its
  separately gated registry write.

## 2026-07-15 — PLAN-015 checkpoint 5 paused at interactive 2FA

### Observed

- The authorized neutral-path core publication reverified the selected SHA-512
  and reached npm, which rejected it with expected `EOTP` before publication.
- Immediate read-only checks confirm core `0.2.0` remains absent and its
  `next`/`latest` tags remain at `0.1.0`; no registry mutation occurred.

### Next

- Ricard executes the same exact command with a current OTP from the neutral
  directory and reports success; Codex then performs all live verification.

## 2026-07-15 — PLAN-015 checkpoint 5 core publication authorized

### Authorization

- Ricard explicitly authorized the single exact neutral-path publication of
  `@rabassoft/schema-engine@0.2.0` with public access, `next` and no provenance.
- Angular publication, all dist-tag mutations, Git actions and settings changes
  remain outside this authorization.

### Next

- Execute the exact core command and immediately verify immutable public bytes,
  metadata, tags, path disclosure and clean exact/`next` consumers.

## 2026-07-15 — PLAN-015 checkpoint 5 preflight passed

### Verified

- npm CLI `10.9.8` targets the official registry; authenticated user
  `ricardrabasso` owns organization `rabassoft`, with verified email and
  `auth-and-writes` 2FA.
- Both exact `0.2.0` versions are absent; core and Angular `next`/`latest`
  remain at `0.1.0`, whose immutable live bytes pass verification.
- The neutral-path core candidate remains 200245 bytes with SHA-512
  `155ae047…d13e028a`; the exact publication command passed its final dry-run.
- Review 047 repeated the full preflight boundary with zero findings. No token,
  OTP or registry write occurred.

### Next

- Stop for immediate explicit approval of the exact core `0.2.0` publication
  under `next` with no provenance.

## 2026-07-15 — PLAN-015 checkpoint 4 completed

### Completed

- Committed the reviewed release preparation as `ce53dc1` and pushed it to
  private `origin/develop`; local and remote-tracking commits matched.
- Rebuilt from the clean committed tree and selected candidates whose bytes and
  SHA-512 values exactly matched the pre-commit evidence.
- Reverified both hashes and successful basename-relative npm dry-runs from the
  fresh neutral path `/tmp/rabassoft-release-0.2.0.6bKsP2`.

### Review and verification

- Review 046 passed the complete authorization, commit, provenance,
  reproducibility, neutral-path, command and external-boundary review with zero
  findings.
- Core remains 200245 bytes with SHA-512 `155ae047…d13e028a`; Angular remains
  93133 bytes with SHA-512 `aa035adb…165a5154`.
- No Git tag, GitHub Release, npm publication, dist-tag or settings mutation
  occurred.
- Checkpoint closure documentation remains intentionally uncommitted because
  the authorization covered the selected source commit and its private push,
  not a second Git mutation.

### Next

- Run checkpoint 5 read-only registry/identity preflight, then stop for
  immediate approval of the exact core `0.2.0` publication command.

## 2026-07-15 — PLAN-015 checkpoint 4 authorized

### Authorization

- Ricard explicitly authorized one commit, its private `develop` push and the
  clean-commit candidate rebuild/comparison required by PLAN-015 checkpoint 4.
- Git tags, GitHub Releases and every npm authentication/settings/publication/
  dist-tag mutation remain outside this authorization.

### Next

- Commit the reviewed tree, push the exact commit privately, rebuild from clean
  and reject any unexplained candidate-byte difference.

## 2026-07-15 — PLAN-015 checkpoint 3 completed locally

### Completed

- Passed the full frozen release, package, source, consumer, licensing and
  security matrix for coordinated local `0.2.0`.
- Confirmed both exact versions absent from npm and both `next`/`latest` aliases
  still at the compatible live `0.1.0` pair.
- Generated deterministic ignored pre-commit candidates and repeated exact
  basename-relative dry-runs from a neutral `/tmp` path with identical hashes.

### Review and correction

- Review 045 cycles 1–3 corrected five findings covering checkpoint formatting,
  immutable package wording, registry-signature evidence, STATUS placement and
  exact core target documentation.
- Cycle 4 repeated the complete technical gate with zero findings; cycle 5
  corrected the closing link count and repeated documentation/state checks with
  zero findings.

### Verification

- Frozen install, formatting, 106-document/451-link checks, lint, types, 400
  core plus 79 Angular tests, build, package, consumer, artifact, isolated
  source and security checks pass.
- Core SHA-512 is `155ae047…d13e028a`; Angular SHA-512 is
  `aa035adb…165a5154`. They remain pre-commit evidence with null source commit.
- No commit, push, publication, dist-tag or other external mutation occurred.

### Next

- Decide whether to authorize checkpoint 4 commit/private push and clean-commit
  rebuild. No npm write is included.

## 2026-07-15 — PLAN-015 checkpoint 2 completed

### Implemented

- Bumped both publishable manifests to coordinated `0.2.0`; Angular retains
  source `workspace:^`/`workspace:*` and packs `^0.2.0`/`0.2.0`.
- Updated active onboarding and added candidate-state `0.2.0` release notes
  with exact nullable/text migrations, compatibility and exclusions.
- Added owned declaration evidence for core nullable/text and Angular text
  contracts without changing production behavior.

### Review and verification

- Review 044 cycle 1 corrected barrel-versus-owner declaration inspection;
  cycle 2 repeated the full checkpoint with zero findings.
- Formatting, 104-document/450-link checks, tooling tests, lint, types, builds,
  package smoke, artifacts and diff checks pass. Offline lockfile reconciliation
  caused no dependency drift.
- No accepted candidate, commit, push or registry mutation occurred.

### Next

- Execute checkpoint 3 complete local release gate and neutral-path rehearsal.

## 2026-07-15 — PLAN-015 checkpoint 1 completed

### Implemented

- Added explicit coordinated release-version parsing and focused mismatch
  tests, version-aware candidate/artifact/source tooling and target live/tag
  verification modes.
- Separated immutable exact `0.1.0` metadata/bytes/consumer verification from
  mutable `next`/`latest` assertions.
- Added conditional documentation checks for the future active `0.2.0` state.

### Review and verification

- Review 043 cycle 1 found and corrected missing stale-documentation ownership;
  cycle 2 repeated the complete checkpoint review with zero findings.
- Formatting, 102-document/449-link checks, lint, focused tests, build,
  `0.1.0` artifacts, historical exact live bytes and clean core/lower/upper
  Angular consumers pass.
- Manifests, lockfile, versions and external state remain unchanged.

### Next

- Execute PLAN-015 checkpoint 2 local `0.2.0` state and migration docs.

## 2026-07-15 — PLAN-015 revision 0 approved

### Decision

- Ricard formally approved PLAN-015 revision 0 after review 042 cycle 2 passed
  all ten areas with zero findings.
- Approval authorizes only local checkpoints 1–3, beginning with version-aware
  release tooling while package manifests remain `0.1.0`.
- Checkpoint 4 commit/push and every npm authentication, publication, dist-tag,
  settings or recovery mutation remain separately gated.

### Next

- Execute checkpoint 1 and repeat its complete review until zero findings.

## 2026-07-15 — PLAN-015 drafted and completely reviewed

### Draft

- Drafted PLAN-015 revision 0 for coordinated Public + Experimental + Active
  core and Angular `0.2.0`, the ADR-010 MINOR delivery of completed local M14.
- Defined version-aware tooling, exact migrations, deterministic licensed
  candidates, neutral publication paths, clean Git rebuild and separately
  approved core/Angular publication and `latest` transition checkpoints.
- Preserved immutable `0.1.0`, private GitHub/no provenance, D-043 and every
  post-M14 deferred boundary.

### Review and correction

- Review 042 cycle 1 corrected five issues: pre-bump target ordering, mutable
  historical tag assertions, source peer/dev workspace precision, premature
  live release-note wording and implicit `latest` commands.
- Cycle 2 repeated all ten plan areas with zero findings and no unresolved
  change request or documentation conflict.

### Verification

- Formatting, documentation across 102 Markdown files and 449 local links,
  active version/tooling searches and diff checks pass.
- Package manifests remain `0.1.0`; no candidate, commit, push, authentication,
  publication, dist-tag or external mutation occurred.

### Next

- Decide whether to formally approve PLAN-015 revision 0. Approval would cover
  only local checkpoints 1–3; every Git and registry action stays separately
  gated.

## 2026-07-15 — M14 coordinated release planning authorized

### Decision

- Authorized preparation and complete review of PLAN-015 for a coordinated
  Experimental release of the completed local M14 changes.
- Selected core and Angular `0.2.0` as the plan target: both affected packages
  are live at `0.1.0`, and ADR-010 requires an incompatible Experimental change
  to use at least MINOR, never PATCH.
- Kept plan approval, manifest/version changes, candidate preparation,
  publication and every external mutation outside this authorization.

### State

- Live core and Angular `0.1.0` remain immutable and pre-M14.
- No implementation task is active and there is no blocker or open policy
  question before drafting the plan.

### Next

- Draft PLAN-015 revision 0, then correct and repeat its complete review until
  one pass has zero findings.

## 2026-07-15 — PLAN-014 and M14 completed locally

### Completed

- Completed checkpoints 1–6 of PLAN-014 revision 0 and the promoted D-009/M14
  nullable primitive-leaf implementation.
- Delivered exact compiler normalization, required/manual contracts, strict
  definition-aware null operations/runtime and accessible Angular native
  intention/status behavior.
- Retained all exclusions, application ownership, validator authority,
  renderer selection, exports, packages and deferred boundaries.

### Final review and correction

- Review 041 cycle 1 found that exact nullable object/array attempts needed to
  preserve their existing container-position blocking diagnostics.
- Added a descriptor-safe exclusion discriminator and focused root, object,
  array, item-root and identity tests; also made non-nullable external-null and
  keyboard activation evidence explicit.
- Cycle 2 repeated the complete implementation review with zero findings.

### Verification

- Frozen install, formatting, documentation across 100 Markdown files and 441
  local links, lint, typecheck, build, 400 core tests and 79 Angular tests pass.
- Both package smoke, packed artifacts, isolated source rebuilds, repository
  consumer and clean core/lower/upper Angular 22 consumers pass.
- Manifests, dependencies, peers, lockfile, versions, exports and published
  `0.1.0` bytes remain unchanged; no external mutation occurred.

### Next

- Decide whether to authorize a separate coordinated MINOR release plan for
  the completed local M14 changes. Do not select a version or publish without
  that separate approval.

## 2026-07-15 — PLAN-014 checkpoint 5 completed

### Completed

- Mapped all 23 SPEC-006 groups to named passing compiler, operations/runtime,
  Angular, declaration, package and regression evidence.
- Added package smoke coverage for nullable compilation/application and
  verified declarations, export/allowlist stability and both package smokes.
- Documented the coordinated required manual-definition and Angular-text source
  migrations while distinguishing local M14 source from live pre-M14 `0.1.0`.
- Reconciled current onboarding, roadmap, deferred and implementation-plan
  state without selecting a version or rewriting historical release evidence.

### Review

- Review 040 cycle 1 repeated the complete evidence, package, consumer,
  migration and release-boundary review with zero findings.

### Verification

- Frozen install, formatting, documentation across 99 Markdown files and 441
  local links, lint, typecheck, build, 398 core tests and 79 Angular tests pass.
- Both package smoke, packed artifacts, isolated source rebuilds, repository
  consumer and clean core/lower/upper Angular consumers pass.
- The initial sandboxed reinstall lacked network after recreating
  `node_modules`; the exact lockfile install and isolated checks passed with
  authorized network and no lockfile change.

### Next

- Execute PLAN-014 checkpoint 6: inspect the complete authority, production/
  test diff, declarations, packages, documentation and deferred boundaries;
  correct and repeat until one full cycle has zero findings.

## 2026-07-15 — PLAN-014 checkpoint 4 completed

### Implemented

- Added required Angular set-null/null-value texts with exact resolver order,
  neutral sources, failure handling and empty snapshot values.
- Added deterministic action/status IDs and native nullable projection for
  string, number/integer and boolean without changing renderer registration.
- Implemented focus-before-null output, visible non-live confirmed-null status,
  exact described-by order, retained clear and controlled Signal Forms buffers.
- Added DOM-state, accessibility, resolver, locale, focus, no-emission,
  edit-after-null and non-nullable external-null regressions.

### Review and correction

- Review 039 cycle 1 found that confirmed-null projection initially lacked an
  explicit nullable-capability gate; it was corrected in both DOM and
  described-by paths.
- Cycle 2 repeated all six checkpoint areas with zero findings.

### Verification

- Formatting, documentation across 98 Markdown files and 441 local links,
  lint, typecheck, build, 398 core tests, 79 Angular tests, both package smoke
  suites and diff checks pass.
- Registrations, providers, exports, manifests, versions, publication and
  external actions remain unchanged.

### Next

- Begin PLAN-014 checkpoint 5 with the complete evidence map, declarations,
  packages, artifacts, source and clean-consumer verification plus migration
  documentation.

## 2026-07-15 — PLAN-014 checkpoint 3 completed

### Implemented

- Retained the validated nullable capability in managed direct and collection
  template metadata.
- Definition-aware direct/deep and item-relative sets now accept null only for
  nullable leaves while preserving the two existing diagnostic families.
- Controlled runtime requests emit the existing frozen null intentions without
  optimistic projection; raw operations remain structural and unchanged.
- Added focused missing/null/primitive, expectation, stale/no-op, removal,
  ancestor, dirty, validator-identity and controlled-emission evidence.

### Review

- Review 038 cycle 1 repeated all six checkpoint areas with zero findings and
  no unresolved change request.

### Verification

- Formatting, documentation across 97 Markdown files and 441 local links,
  lint, typecheck, build, 398 core tests, 76 Angular tests, both package smoke
  suites and diff checks pass.
- Angular production behavior, public shapes, versions, publication and
  external actions remain unchanged.

### Next

- Begin PLAN-014 checkpoint 4 with text projection, deterministic IDs,
  accessible native actions/status and controlled Signal Forms reconciliation.

## 2026-07-15 — PLAN-014 checkpoint 2 completed

### Implemented

- Added the exact descriptor-safe two-member primitive-plus-null classifier to
  the existing direct and collection-template leaf traversal.
- Valid arrays in either order now normalize to the existing primitive kind
  plus frozen `nullable: true` at direct, nested, template and referenced paths.
- Added the closed `UNSUPPORTED_FIELD_TYPE` failure catalog, provenance,
  branch stopping, identity-policy ownership and nullable-string enum exclusion.
- Added serializable conformance coverage and programmatic descriptor,
  accessor, hostile-hook, extra-key, immutability and no-retention tests.

### Review

- Review 037 cycle 1 repeated all seven checkpoint areas with zero findings.
- Broad fixture regeneration introduced only formatting churn outside the new
  fixture; it was removed before the reviewed diff.

### Verification

- Formatting, documentation across 96 Markdown files and 441 local links,
  lint, typecheck, build, 389 core tests, 76 Angular tests, both package smoke
  suites and diff checks pass.
- Operations/runtime still reject null as a primitive value; Angular null
  intention/status, versions, publication and external actions remain inactive.

### Next

- Begin PLAN-014 checkpoint 3 with definition-aware direct/deep and collection
  null operations plus controlled runtime transitions.

## 2026-07-15 — PLAN-014 checkpoint 1 completed

### Implemented

- Added required Public Experimental `BaseFieldDefinition.nullable` and the
  `set-null`/`null-value` text members without adding exports.
- Scalar direct, nested, template and referenced compiler output now owns
  frozen `nullable: false`; type arrays remain unsupported.
- Manual primitive nodes/templates now require an own boolean and reject
  `nullable: true` with non-empty choices using exact direct/template locators.
- Operations preserve `INVALID_FORM_DEFINITION`; runtime creation preserves the
  exact `INVALID_RUNTIME_OPTIONS` wrapper and stops before validation.
- Migrated all repository definitions, generators and fixtures to canonical
  false and added focused hostile/descriptor/diagnostic tests.

### Review and corrections

- Review 036 cycle 1 found and corrected a false secondary leaf-projection
  diagnostic after either new capability defect.
- The diff review restored two unrelated compact fixture parameter records
  changed by broad regeneration.
- Cycle 2 repeated all eight checkpoint areas with zero findings.

### Verification

- Formatting, documentation across 95 Markdown files and 441 local links,
  lint, typecheck, build, 364 core tests, 76 Angular tests, both package smoke
  suites, focused nullable tests, recursive JSON definition audit and diff
  checks pass.
- Type arrays, null operation compatibility, Angular null projection, versions,
  publication, external actions, commit and push remain inactive.

### Next

- Begin PLAN-014 checkpoint 2 with the exact descriptor-safe nullable type-array
  classifier, diagnostics and propagation.

## 2026-07-15 — PLAN-014 formally approved

### Decision

- Ricard formally approved PLAN-014 revision 0 after review 035 cycle 3 passed
  all ten acceptance areas with zero findings.
- Approval authorizes only checkpoints 1–6 and their stated verification and
  stop conditions.

### Boundary

- No implementation started during this approval checkpoint.
- Version selection, release preparation, publication, external mutations,
  Stable promotion, commit and push remain unauthorized.

### Verification

- Formatting, documentation across 94 Markdown files and 440 local links,
  active-state reference search and diff checks pass.

### Next

- Begin checkpoint 1 with required nullable/text contracts, canonical
  `nullable: false`, exact manual-definition validation and repository fixture
  migration. Type arrays and null operations remain inactive until their later
  checkpoints.

## 2026-07-15 — PLAN-014 drafted and completely reviewed

### Completed

- Drafted PLAN-014 revision 0 from Accepted SPEC-006 v0.1.1 and the inspected
  completed M13 core, Angular, package and consumer paths.
- Defined six dependency-gated checkpoints for contracts/manual definitions,
  compiler normalization, operations/runtime, Angular projection, package/
  consumer evidence and final repeated implementation review.
- Mapped all 23 SPEC-006 scenario groups and fixed the Public/Internal,
  Experimental migration, MINOR-not-PATCH and immutable published `0.1.0`
  boundaries.

### Review

- Review 035 cycle 1 found formatting; cycle 2 found three authority, migration
  and accessibility precision defects.
- After correction, cycle 3 repeated all ten acceptance areas with zero
  findings and no documentation conflict.

### Verification

- `pnpm format:check`, `pnpm docs:check` across 94 Markdown files and 439 local
  links, and `git diff --check` pass after final current-state reconciliation.
- No implementation, version, release preparation, external mutation, commit
  or push occurred.

### Next

- Formally approve or reject PLAN-014 revision 0. Checkpoint 1 remains
  unauthorized until that explicit decision.

## 2026-07-15 — SPEC-006 accepted after conflict resolution

### Completed

- Committed the accepted M14 promotion/architecture as `e6d801b`.
- Compared ADR-019 operation rules with Accepted SPEC-003 and the current
  collection-operation implementation before drafting SPEC-006.

### Conflict

- ADR-019 revision 0 assigns non-nullable `set-item-value null` to
  `INCOMPATIBLE_OPERATION_VALUE`; SPEC-003 requires
  `INCOMPATIBLE_COLLECTION_OPERATION_VALUE` with `reason: 'leaf-type'`.
- No SPEC or code was changed and PLAN-014 remains unauthorized.

### Resolution

- Ricard approved preserving the collection-specific diagnostic.
- ADR-019 revision 1 corrected only that sentence; review 033 cycle 1 found a
  formatting defect, cycle 2 repeated all six areas with zero findings and the
  revision was accepted.

### Specification and review

- Drafted SPEC-006 with the exact nullable-leaf schema, normalized/manual
  definitions, direct and collection operation families, controlled runtime,
  Angular Signal Forms projection, accessibility, diagnostics and conformance
  boundary.
- Review 034 found ten contract/document defects in cycles 1–2, one stale
  accepted-ADR revision reference in cycle 3 and stale onboarding state in
  cycle 5. Every correction restarted the complete applicable review.
- Cycle 6 repeated all twelve review areas and accepted-state reconciliation
  with zero findings. Ricard's standing authorization accepted SPEC-006
  v0.1.1 and authorized preparation and review of PLAN-014 only.

### Verification

- `pnpm format:check`, `pnpm docs:check` across 92 Markdown files and 419 local
  links, and `git diff --check` pass after acceptance-state reconciliation.
- No code, plan, version, publication, Stable API or implementation change was
  made.

### Next

- Draft and completely review PLAN-014 against SPEC-006 v0.1.1. Explicit plan
  approval remains required before implementation.

## 2026-07-15 — D-009/M14 promotion accepted

### Completed

- Reviewed accepted schema, definition, operation, runtime, nested/collection/
  reference and Angular contracts against the current implementation.
- Review 031 cycle 1 found two closing state-document defects and cycle 2 found
  imprecise verification chronology. After correction, cycle 3 repeats all
  eight areas and documentation checks with zero findings. It recommends a
  closed nullable primitive-leaf slice, not general unions.
- Ricard formally accepted review 031 and promoted only that slice for M14
  normative design.
- Acceptance reconciliation initially changed D-001 instead of D-009 and kept
  the pre-acceptance link count. Both defects were corrected before the full
  documentation verification was repeated with zero findings.
- Ricard approved the required normalized boolean, common Angular null action
  and unchanged renderer registrations. ADR-019 revision 0 and ADR-005 revision
  4 were drafted; review 032 cycle 1 found eight issues, all corrected, and
  cycle 2 repeated ten areas with zero findings before coordinated acceptance.
- Final acceptance reconciliation found and corrected the ADR index still
  reporting revision 3 before the complete documentation checks were repeated.

### Verification

- Review 032 cycle 2 passes all ten joint architecture areas with zero findings.
- Formatting, documentation across 89 Markdown files and 400 local links, and
  diff checks pass; code and package artifacts are unchanged.

### Boundary

- D-009 is Promoted for design but remains unimplemented.
- ADR-019 revision 0 and ADR-005 revision 4 are Accepted for design. SPEC-006
  preparation is authorized; PLAN-014 and implementation remain unauthorized.

### Next

- Draft and completely review SPEC-006; do not prepare PLAN-014 or code.

## 2026-07-15 — Post-commit ROADMAP consistency repaired

### Completed

- Created M13 closure commit `5127a7c` with Rabassoft attribution.
- During next-milestone assessment, found and corrected the post-G0 ROADMAP
  preamble that still claimed no publication was authorized or completed.

### Verification

- The correction changes no milestone, deferred state or package contract.
- Formatting, documentation links and diff checks pass.

### Next

- Select the next milestone from product demand and the deferred register; no
  capability is promoted by this assessment.

## 2026-07-15 — M13 completed; repository automation deferred as D-043

### Decision

- Ricard approved ADR-018 revision 3 and PLAN-013 revision 4: the verified
  interactive 2FA publications close M13 without a private-repository trusted
  publisher.
- D-043 now keeps repository sanitization/publication, public metadata, OIDC,
  staged approval, token restrictions and provenance as one deferred decision.

### Verification

- Review 028 cycle 8, review 029 cycle 14 and review 030 cycle 31 repeat their
  complete applicable areas with zero findings.
- Core and Angular `0.1.0` remain exact, signed, source-complete and live under
  recommended `next` plus mandatory Experimental `latest`.
- No workflow, GitHub/npm setting, repository visibility, commit or push was
  created or changed.

### Next

- Select the next milestone from demand and the deferred register; D-043 is not
  promoted by completing M13.

## 2026-07-15 — Angular published and checkpoint 7 conflict identified

### Completed

- Published `@rabassoft/schema-engine-angular@0.1.0` under recommended `next`;
  mandatory `latest` aliases the same Experimental version.
- Added repeatable live Angular metadata/hash/signature and lower/upper Angular
  consumer verification. The registry tarball is byte-identical to accepted
  SHA-512 `35f7f33a…2ebd56a` and the complete repeated checkpoint 6 review has
  zero findings.
- Repeated frozen install, format/docs/lint/types/tests/build, packages,
  artifacts, consumers, Corresponding Source, release security, live core and
  diff checks successfully.

### Findings

- npm trusted publishing requires an exact GitHub `repository.url`; the
  accepted contract forbids advertising the private repository. Checkpoint 7
  cannot complete without a normative decision.
- Public npm version metadata generated `_resolved`/`_from` from the local
  publish path. They are absent from tarballs and contain no credential or Git
  URL, but the immutable versions retain the local username/workspace path.

### Next

- Select and approve the checkpoint 7 policy: preferably defer trusted
  publishing until the repository passes sanitization and becomes public, then
  revise ADR-018/PLAN-013 before any external setting change.

## 2026-07-15 — Angular private sync and final preflight completed

### Completed

- Created state commit `6f13987` and pushed private `develop` through that
  checkpoint without changing repository visibility.
- Repacked Angular from the clean synchronized commit; SHA-512 remains
  `35f7f33a…2ebd56a` and the ignored manifest records source `6f13987`.
- Repeated exact source reconstruction, live-core lower/upper Angular consumers,
  core live verification, unauthenticated name availability, npm identity and
  exact public/`next`/no-provenance dry-run.

### Verification

- Every final prepublication check passes and Angular remains absent (`E404`).
- No npm package/settings mutation or GitHub visibility change occurred.

### Next

- Request immediate approval for the exact irreversible Angular publish
  command. Mandatory `latest` will be treated only as an Experimental alias.

## 2026-07-15 — Private Angular release path selected

### Decision

- Ricard selected the recommended path: keep GitHub private, sync the accepted
  evidence privately and publish Angular without provenance under PLAN-013.
- Public-repository sanitization/publication remains a separate future
  milestone and is not silently combined with M13.

### Next

- Commit current state, push private `develop`, rebuild/reverify the exact
  Angular candidate from the clean commit and stop for immediate approval of
  the exact npm publication command.

## 2026-07-15 — Checkpoint 6 committed; public readiness not established

### Completed

- Created local commit `f661f84` for checkpoint 6 verification tooling/state
  using `Rabassoft <ricard@rabassoft.com>`; no push occurred.
- Evaluated whether the repository satisfied ADR-018's condition for public
  visibility without changing GitHub or npm.

### Findings

- GitHub remains PRIVATE with default branch `main` at the initialization line;
  local release evidence is not yet on private origin.
- Seventy-seven `.ai-docs` files remain tracked, Issues is enabled despite the
  current no-public-issue policy, and community/security contribution boundaries
  have not been reviewed.
- The required full reachable-history sanitization review has not occurred.
  Current tracked-path/security checks do not substitute for that review.

### Next

- Ricard chooses between publishing Angular under the already accepted
  private/no-provenance path or authorizing a new public-repository sanitization
  milestone first. Do not change visibility or publish Angular by inference.

## 2026-07-15 — PLAN-013 checkpoint 6 Angular candidate accepted

### Completed

- Committed the accepted core/policy checkpoint locally as `102be1c` with
  Rabassoft attribution; no push occurred.
- Packed Angular alone twice from that clean commit with byte-identical SHA-512
  `35f7f33a…2ebd56a`.
- Extended source and clean-consumer tooling to verify an exact Angular tarball
  against canonical/live core while preserving default modes.
- Review 030 cycle 21 repeated the complete applicable matrix with zero
  findings and accepted the corrected Angular candidate.

### Verification

- Exact Angular source reconstruction, inventory/security and npm dry-run pass.
- Lower/upper Angular `22.0.6` consumers compile/execute with live core `0.1.0`.
- Full format/docs/lint/type/test/build/package/artifact/source/consumer/security
  matrix, legacy verifier modes and live core verification pass.
- No push, Angular publication or npm/GitHub settings mutation occurred.

### Next

- Obtain authorization to commit checkpoint 6 verification evidence, then
  separately push private `develop` before requesting exact Angular publication.

## 2026-07-15 — PLAN-013 checkpoint 5 accepted

### Completed

- Added unauthenticated live-core verification for metadata, mandatory tags,
  license/provenance, exact tarball bytes and clean exact/`next` consumers.
- Corrected five verifier/fixture issues and repeated the full check after each;
  review 030 cycle 15 then passed completely with zero findings.
- Accepted core `0.1.0` publication/live verification under ADR-018 revision 2
  and PLAN-013 revision 3.

### Verification

- Live core bytes equal canonical SHA-512 `dceb432e…fdb310e`; `next` and
  mandatory Experimental `latest` both resolve to `0.1.0`.
- Exact and `@next` consumers install, typecheck and execute without credentials.
- Format/docs/lint/types, 359 core plus 76 Angular tests, build, package,
  consumer, artifacts, isolated source/clean consumers, security and diff gates
  pass.

### Next

- Obtain authorization for a local commit, then rebuild/review the corrected
  Angular candidate from that clean commit. Push and Angular publication remain
  separately gated.

## 2026-07-15 — Mandatory latest policy accepted

### Completed

- Ricard accepted npm's mandatory `latest` as a registry alias to the same
  explicitly Experimental version, with `next` remaining recommended.
- Accepted ADR-018 revision 2 after review 028 cycle 6 and PLAN-013 revision 3
  after review 029 cycle 12; both complete repeated reviews have zero findings.
- Reconciled indexes, roadmap/deferred state, onboarding and release/package
  documentation without promoting any API or support policy to Stable.

### Verification

- The revised authority preserves exact package/version, licensing/source,
  private-repository/no-provenance and external-approval boundaries.
- The immutable live core tarball is not overwritten or unpublished; its stale
  no-`latest` README sentence is transparently superseded in release notes.
- Angular remains unpublished and unauthorized.

### Next

- Complete the full applicable review and unauthenticated live core
  tarball/install verification; then rebuild/review the corrected Angular
  candidate before its separate external gate.

## 2026-07-15 — Mandatory latest creates normative conflict

### Completed

- Ricard attempted the narrowly proposed removal of core's unintended `latest`
  tag; npm returned `E400` and retained both tags.
- Diagnosed the registry contract against official npm documentation: every
  package metadata document must define `latest`, even though alternate tags
  such as `next` can coexist.

### Conflict

- ADR-018 and PLAN-013 require no `latest`, which is infeasible for the live npm
  package. No document silently overrides the accepted decision.
- Core remains live and immutable at `0.1.0`; Angular remains unpublished.

### Next

- Decide whether to revise the accepted release contract so mandatory `latest`
  may alias the explicitly Experimental core release. Do not unpublish core,
  publish Angular or retry tag/settings mutations before that decision.

## 2026-07-15 — Core live; unintended latest tag blocks verification

### Completed

- Ricard supplied the private OTP locally and npm accepted the already
  authorized exact core publication.
- Unauthenticated metadata confirms `@rabassoft/schema-engine@0.1.0`,
  `AGPL-3.0-only` and the expected tarball integrity.

### Finding

- npm automatically assigned both `next: 0.1.0` and `latest: 0.1.0` on first
  publication, despite the explicit `--tag next` command.
- `latest` conflicts with ADR-018 and PLAN-013. Verification stopped before
  live consumers; Angular remains unpublished.

### Next

- Obtain immediate approval to remove only the unintended core `latest`
  dist-tag, then repeat complete unauthenticated metadata/tarball/consumer
  verification. Do not unpublish core or publish Angular.

## 2026-07-15 — Core publication stopped at OTP gate

### Completed

- Ricard explicitly authorized only the exact verified core `0.1.0` tarball
  under public `next` with provenance disabled.
- Rechecked its canonical SHA-512 and source commit, then invoked the authorized
  command against the official registry.
- npm returned `EOTP` before package creation; no OTP was requested from or
  exposed to Codex.

### Verification

- An unauthenticated exact-version lookup after the attempt still returns
  `E404`, confirming no core package was created.
- Angular, npm settings, tags, GitHub Release and visibility remain untouched.

### Next

- Ricard retries the same authorized core command locally with a private OTP.
  Verify the live package immediately after success; do not publish Angular.

## 2026-07-15 — PLAN-013 checkpoint 5 identity accepted

### Completed

- Confirmed npm CLI identity `ricardrabasso`; Ricard clarified that `rabassoft`
  is the newly created organization/scope rather than the human username.
- Verified read-only that `ricardrabasso` owns organization `rabassoft`, the
  confirmed email is verified and 2FA mode is `auth-and-writes`.
- Corrected PLAN-013 as revision 2 and repeated its full eight-area review plus
  the complete applicable implementation review with zero findings.
- Confirmed both exact `0.1.0` package names remain absent and both candidate
  hashes still match checkpoint 4.

### Verification

- `npm whoami` returns `ricardrabasso`; organization membership returns owner.
- The organization package list is empty; unauthenticated registry reads return
  `E404` for core and Angular.
- No npm package setting, publish, tag, GitHub Release or visibility mutation
  occurred.

### Next

- Request immediate approval for the exact verified core publication command.
  Angular publication and all settings remain separately gated.

## 2026-07-15 — PLAN-013 checkpoint 4 private push completed

### Completed

- Aborted the accidental merge of the obsolete pre-amend remote commit instead
  of combining incompatible checkpoint states.
- Ricard replaced remote `develop` with the final verified checkpoint commit
  `7f5fcdf` using `--force-with-lease`.
- Local `develop` and `origin/develop` now point to the same final commit.

### Verification

- Git reports a clean aligned branch, no unmerged paths and full commit
  `7f5fcdfe952cae5fd0322c5e942c2ff335465c52` on both refs.
- The commit retains `Rabassoft <ricard@rabassoft.com>` attribution.
- npm `10.9.8` targets the official registry and the two candidate hashes still
  match checkpoint 4; read-only `npm whoami` returns expected `ENEEDAUTH`.
- No tag, GitHub Release, npm login, package setting or registry write occurred.

### Next

- Ricard performs interactive npm login/2FA outside repository files. Then run
  checkpoint 5's read-only identity, security, registry, availability and core
  candidate-hash checks; stop before core publication approval.

## 2026-07-15 — PLAN-013 checkpoint 4 local commit

### Completed

- Ricard explicitly authorized a local commit, not push.
- Committed the complete verified PLAN-013 preparation on `develop` using
  `Rabassoft <ricard@rabassoft.com>`.
- Rebuilt from the clean committed tree; the ignored candidate manifest records
  the exact `sourceCommit` and preserves the deterministic core/Angular hashes.

### Verification

- The clean-tree release build repeats artifact/security checks and both npm
  dry-runs successfully.
- The Git worktree is clean apart from ignored local candidates. After the
  amend, `origin/develop` was observed at pre-amend commit `1e71ce6`; local and
  remote are one commit ahead/behind and require explicit reconciliation.
- No push, tag, credential, npm login, registry write or visibility change
  occurred.

### Next

- Choose between replacing the obsolete pre-amend remote commit with
  force-with-lease or preserving it with a follow-up history, then authorize
  that external action. npm identity/publication remain separate checkpoints.

## 2026-07-15 — PLAN-013 local preparation completed

### Completed

- Completed checkpoint 3's full local matrix, rights/security audit, isolated
  source builds and npm dry-runs without authentication or registry writes.
- Isolated npm's empty user configuration and cache after the first dry-run
  exposed a global-cache permission dependency; review 030 cycle 5 repeated the
  complete gate with zero findings.
- Produced identical hashes across two consecutive preparations:
  - core SHA-512
    `dceb432ed1ee4bed4740134e52d1dc5896bb62a5cad9f0e763692e19ef1a0f3076b7f5ee22f9046c82bc2d0cb2d8dafc2253cf5ed970caefa93930280fdb310e`;
  - Angular SHA-512
    `ef1e491da53f88596bcc4ab2e9472d1d1dd0b7dca02c383a750a74e5302779973ecd0e8c4d1a67e2ea4f0e03b9d2219a16d946bd3ffaf21f0e10a26afa4b1507`.
- Stopped at PLAN-013 checkpoint 4; commit and push remain unauthorized.

### Verification

- Frozen install, format, docs, lint, typecheck, 359 core plus 76 Angular tests,
  build, package smoke, repository/clean consumers and artifact checks pass.
- Both source harnesses rebuild warning-free from extracted tarballs and match
  shipped root declarations, exports and behavior.
- Security audit covers tracked/packed secrets, sensitive paths, personal tax
  or address patterns, distributed private links and source authorship.
- npm `10.9.8` dry-runs both public `0.1.0` candidates with `next` and no
  provenance using Node `22.23.1` and pnpm `10.28.2`.
- No credential, registry, visibility, Git tag, commit or push action occurred.

### Next

- Request explicit authorization for the checkpoint 4 private commit and push;
  then rebuild from the clean commit and make those hashes canonical.

## 2026-07-15 — PLAN-013 checkpoint 2 completed

### Completed

- Removed `private` only from the two package manifests and added the exact
  `AGPL-3.0-only`, holder/contact, public access, `next` and no-provenance
  metadata; the workspace root remains private.
- Updated root/package READMEs and release notes for the public Experimental
  channel, dual-license explanation, private-repository source policy,
  compatibility, no `latest`, no SLA and contribution/issue-tracker limits.
- Extended artifact checks to reject private candidates, workspace specifiers,
  inaccessible repository metadata, missing public fields or false provenance.
- Review 030 cycle 3 passed the complete checkpoint review with zero findings.

### Verification

- Package smoke, repository consumer, packed artifact and isolated frozen
  source-rebuild checks pass.
- Formatting, documentation across 86 Markdown files and 384 local links,
  lint and diff checks pass.
- Versions, exports, dependencies, peers, runtime behavior and API stability
  remain unchanged. No credential, registry, visibility, Git tag, commit or
  push action occurred.

### Next

- Run PLAN-013 checkpoint 3's complete local release gate and repeated review.

## 2026-07-15 — PLAN-013 checkpoint 1 completed

### Completed

- Added the unmodified official GNU AGPL v3 text at root and in both packages;
  all three copies share SHA-256
  `0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0`.
- Added exact package notices and copyright/SPDX headers to all 30 owned
  production source files.
- Included preferred source plus frozen package-local build harnesses in both
  still-private package inventories.
- Corrected four implementation-review findings covering header placement,
  TypeScript 6 configuration, core-tarball integrity cycles and Angular
  verifier isolation.
- Review 030 cycle 2 repeated all eight checkpoint areas with zero findings.

### Verification

- Isolated clean core-first source reconstruction passes without workspace
  input or warnings; shipped/rebuilt declarations, root exports and executable
  behavior match.
- Artifact inventories, frozen source locks, notices and source headers pass.
- Formatting, documentation across 85 Markdown files and 382 local links,
  lint, typecheck, 359 core plus 76 Angular tests and diff checks pass.
- Both publishable manifests remain `private: true`; no credential, registry,
  visibility, Git tag, commit or push action occurred.

### Next

- Implement PLAN-013 checkpoint 2 public candidate metadata and documentation
  locally; publication remains unauthorized.

## 2026-07-15 — PLAN-013 approved

### Completed

- Ricard explicitly confirmed `ricard@rabassoft.com` as the public commercial
  and security contact for npm metadata, README and NOTICE.
- Repeated all eight PLAN-013 review areas after cycle 1 corrections; review
  029 cycle 2 passed with zero findings and no unresolved change request.
- Accepted PLAN-013 revision 0 under the standing authorization. Only
  reversible local preparation is active; commit, push, credentials and every
  registry mutation remain separately gated.
- During the first implementation step, found and corrected an ordering
  conflict between the checkpoint 1 source-tarball gate and checkpoint 2
  `files` allowlist. Review 029 cycle 4 then repeated all eight areas with zero
  findings and accepted PLAN-013 revision 1.

### Verification

- The repeated review reconciles ADR-018, ADR-013, ADR-010, ADR-009,
  D-034/D-040, package boundaries, npm security and persistent state.
- No manifest, source, credential, registry, Git tag, visibility, commit or
  push change occurred during approval.

### Next

- Implement PLAN-013 checkpoint 1 locally, then run its gate and complete
  repeated review before advancing.

## 2026-07-15 — PLAN-013 review cycle 1

### Completed

- Confirmed npm user `rabassoft` as the intended `@rabassoft` scope owner and
  drafted PLAN-013 revision 0 without authorizing implementation or any remote
  action.
- Reviewed the complete plan across eight areas and recorded review 029 cycle
  1 with four findings.
- Corrected the source reconstruction contract to use extracted package-local
  frozen build harnesses, fixed the exact npm CLI/security evidence gate and
  reconciled the stale D-040 current-work text.
- Kept public use of `ricard@rabassoft.com` unresolved instead of inferring a
  privacy-sensitive decision.

### Verification

- `pnpm format:check`, `pnpm docs:check` and `git diff --check` pass.
- Documentation checks cover 81 Markdown files and 382 local links.
- No manifest, source, credential, registry, Git tag, visibility, commit or
  push change occurred.

### Next

- Confirm or replace the public commercial/security contact, then repeat the
  complete PLAN-013 review until one cycle has zero findings.

## 2026-07-15 — D-034/D-040 promoted for normative design

### Completed

- Selected `AGPL-3.0-only` or a separate paid commercial license for Schema
  Engine's dual-license direction.
- Identified Ricardo Rabassó Rodríguez, operating as Rabassoft, as legal rights
  holder and selected the exact public copyright notice.
- Kept the GitHub repository private pending a separate complete sanitization
  review; public packages must independently provide Corresponding Source.
- Completed review 027 cycle 2 with zero findings and promoted D-034/D-040 only
  for normative M13 design.
- Corrected six ADR-018 review/closing-state findings covering source-file
  notices, private-repository provenance and final state reconciliation; review
  028 cycle 4 closed with zero findings.
- Accepted ADR-018 revision 1 under the standing authorization without changing
  manifests, license files, credentials, tags, visibility or remote state.

### Verification

- Documentation consistency, formatting and diff checks pass after ADR-018
  acceptance across 79 Markdown files and 374 local links.

### Next

- Prepare and review PLAN-013 without executing any external mutation.

## 2026-07-15 — PLAN-012 and M12 completed

### Completed

- Completed all five PLAN-012 checkpoints and the narrow D-042 static neutral
  presentation-group slice under accepted ADR-017 and SPEC-005 v0.1.1.
- Added the exact seven Public core presentation symbols, immutable compiler
  normalization and manual-definition checks without changing runtime data,
  validation, operations, scopes or controlled ownership.
- Added fixed Internal Angular section projection with accessible markup,
  deterministic IDs, locale-aware text, failure isolation and lifecycle
  cleanup, without adding a Public Angular symbol.
- Completed review 026 after correcting four stale current-state documentation
  findings, two formatting findings and one closing evidence-count finding;
  cycle 6 closed with zero findings after the full matrix passed in cycle 3.

### Verification

- Frozen-lockfile installation, 359 core and 76 Angular tests, full build and
  type checks, package smoke, packed artifacts, repository consumer and clean
  core/lower/upper Angular 22.0.6 consumers pass.
- Documentation checks pass across 76 Markdown files and 360 local links;
  lint, formatting and `git diff --check` pass.
- Manifests, dependencies, versions, lockfile, publication state and Stable
  classification are unchanged; D-011, D-012 and D-040 remain Deferred.

### Next

- Select a deferred capability for a new promotion-readiness assessment. No
  implementation or publication task is active.

## 2026-07-15 — PLAN-012 checkpoint 4 completed

### Completed

- Mapped and exercised all 18 SPEC-005 scenario areas across focused tests,
  serializable fixtures, inherited regression suites and package consumers.
- Extended packed-artifact inventory and declaration checks for the one new
  Internal core module and exactly seven new Public core symbols.
- Extended the repository Angular consumer with a real static section and the
  clean Angular consumer source with presentation compilation.
- Added explicit runtime/operation/scope/schema-identity invariance evidence and
  package-smoke default-forest identity checks.
- Kept Angular section helpers absent from the root declaration and confirmed
  deep imports remain blocked.

### Verification

- 359 core and 76 Angular tests, full build/typecheck, package smoke, repository
  consumer, packed artifacts, docs, lint, formatting and diff checks pass.
- `CI=true pnpm install --frozen-lockfile` passes; clean core and Angular 22.0.6
  lower/upper consumers build and execute successfully.
- Manifests, dependencies, versions, publication state and lockfile are
  unchanged.

### Next

- Execute PLAN-012 checkpoint 5 and repeat the complete implementation review
  until one cycle passes with zero findings.

## 2026-07-15 — PLAN-012 checkpoint 3 completed

### Completed

- Changed `SchemaFormDirective` to project the normalized presentation forest
  while preserving the existing runtime snapshot and controlled-state model.
- Added one fixed Internal recursive section outlet/host and factory with exact
  `fieldset`/`legend` markup, collision-free IDs and no Public Angular export.
- Added immutable locale-aware section text contexts and exact exception,
  non-string and blank-result fallback diagnostics.
- Added creation/binding failure isolation, partial-host destruction, sibling
  continuation and accepted-definition replacement cleanup.
- Corrected a review finding where locale context replacement recreated legacy
  renderers; locale now reprojections text without changing renderer identity.

### Verification

- All 76 Angular tests pass (68 inherited plus 8 focused section tests); full
  workspace typecheck, lint, formatting and diff checks pass.
- Existing leaf/object/collection/item projection, focus and Signal Forms
  ownership suites remain unchanged and green; Angular root exports are
  unchanged.

### Next

- Execute PLAN-012 checkpoint 4: complete all scenario evidence and the full
  declaration/package/artifact/repository/clean-consumer matrix.

## 2026-07-15 — PLAN-012 checkpoint 2 completed

### Completed

- Added iterative descriptor-safe inspection of root UI `presentation` with
  the complete `INVALID_UI_PRESENTATION` family, deterministic paths/order and
  no accessor execution or caller-value retention.
- Added exact-node immutable normalization for flat/nested sections, canonical
  keys and order independent from `nodes`/`fields`.
- Implemented atomic default fallback and kept independent unknown UI warnings
  and nested object/array/item rejection from corrupting valid root grouping.
- Covered every accepted reason plus sparse/accessor/cyclic/reused/deep input,
  hostile names/IDs, root object/collection atomicity and nested locations.
- Added serializable valid/fallback conformance fixtures and corrected the
  normalization builder to remain iterative and linear.

### Verification

- All 358 core tests pass; full workspace build/typecheck, lint, formatting and
  diff checks pass.
- Repeated inspection of SPEC-005 scenarios 1–10 and the scoped production/test
  diff found zero remaining checkpoint-2 findings.

### Next

- Execute PLAN-012 checkpoint 3: fixed Internal Angular section projection,
  text resolution, accessibility, lifecycle and failure isolation.

## 2026-07-15 — PLAN-012 checkpoint 1 completed

### Completed

- Added the exact seven SPEC-005 Public core symbols, optional raw
  `UiSchema.presentation`, required normalized `FormDefinition.presentation`
  and the widened text-resolution union.
- Made every successful compilation emit a deeply frozen default wrapper forest
  with exact root-node identity, including the empty-root case.
- Added iterative descriptor-safe manual-definition validation for all nine
  accepted presentation reasons and propagated immutable presentation locators
  through runtime and operation diagnostics.
- Migrated repository manual definitions, compiler expectations and operation
  fixtures without changing runtime/data expectations; corrected the fixture
  generator to preserve collection-policy inputs.
- Added focused default, identity, immutability, reason, cycle and fail-fast
  evidence. Root UI presentation inspection remains intentionally inactive.

### Verification

- All 340 core tests pass; full workspace build/typecheck, lint, formatting and
  diff checks pass.
- Emitted root declarations contain exactly the seven accepted new symbols.
  Package manifests, dependencies, versions and lockfile are unchanged.

### Next

- Execute PLAN-012 checkpoint 2: root descriptor-safe presentation inspection,
  diagnostics, normalized sections and atomic fallback.

## 2026-07-15 — PLAN-012 revision 1 approved

### Completed

- Approved PLAN-012 revision 1 under Ricard's standing authorization after
  review 025 cycle 2 passed all ten areas with zero findings.
- Authorized checkpoints 1–5 in order and activated checkpoint 1 only.
- Reconciled PLAN/review status, ROADMAP, deferred register and canonical state
  without changing code or Public contracts yet.

### Verification

- Documentation checks pass for 75 Markdown files and 358 local links; full
  formatting and diff checks pass.

### Next

- Implement checkpoint 1 contracts, default compiler forest, manual validation
  and repository migration; keep UI presentation inspection inactive.

## 2026-07-15 — PLAN-012 revision 1 prepared and reviewed

### Completed

- Prepared five fail-closed delivery checkpoints covering contracts/defaults,
  compiler normalization, Angular projection, evidence/packages and final
  repeated review.
- Mapped all 18 SPEC-005 scenario groups to focused and full evidence.
- Corrected review 025 cycle 1's two findings by moving default compiler output
  into checkpoint 1 and prohibiting Angular root-export changes.
- Repeated all ten plan-review areas in cycle 2 with zero findings.

### Verification

- Plan links, authority, checkpoint dependencies, Public inventory, commands,
  diff boundaries, formatting and documentation consistency were checked.
- No code, Public contract, dependency, package or publication changed.

### Next

- Approve PLAN-012 revision 1 under the standing authorization, then execute
  checkpoints 1–5 consecutively to zero findings.

## 2026-07-15 — SPEC-005 v0.1.1 accepted

### Completed

- Corrected four cycle 1 findings covering the root accessor case, unknown-key
  fallback, item UI paths and manual frozen-input ambiguity.
- Repeated all ten SPEC review areas in review 024 cycle 2 with zero findings.
- Accepted SPEC-005 v0.1.1 under Ricard's standing authorization without
  widening ADR-017 or D-042.
- Reconciled the SPEC index, guides, deferred register, ROADMAP and canonical
  state; authorized PLAN-012 preparation/review only.

### Verification

- Documentation checks pass for 73 Markdown files and 347 local links; full
  formatting and diff checks pass.
- No plan, code, Public contract, dependency, package, publication or Stable
  classification changed.

### Next

- Prepare and repeatedly review PLAN-012 before approval or implementation.

## 2026-07-15 — SPEC-005 v0.1.0 drafted

### Completed

- Drafted the exact observable D-042 contract under accepted ADR-017.
- Closed root UI grammar, exact-once normalized identity, immutable default and
  atomic fallback forests, section keys and deterministic inspection.
- Defined `INVALID_UI_PRESENTATION`, manual-definition reasons, section text
  projection, DOM/accessibility and fixed-host failure behavior.
- Preserved runtime, scopes, operations, validation, renderer ownership and all
  D-011/D-012 exclusions.
- Added 18 mandatory conformance areas and an exact ADR-009 migration inventory.

### Verification

- SPEC links, index, Draft wording, architecture traceability, formatting and
  scoped diff were checked after drafting.
- No plan, code, Public contract, dependency, package or publication changed.

### Next

- Complete and repeat the SPEC-005 review to zero findings; accept it only if
  it remains inside ADR-017/D-042.

## 2026-07-15 — ADR-017 accepted

### Completed

- Applied Ricard's standing authorization after ADR-017 revision 0 completed a
  full zero-finding review.
- Marked ADR-017 Accepted and reconciled review 023, the ADR index, root guide,
  D-042 register, ROADMAP and canonical current state.
- Authorized drafting and reviewing the M12 SPEC only; no plan, Public contract
  change or implementation is active.
- Preserved D-011/D-012 and every nested/item grouping, advanced layout, state,
  action, generated-scope, custom-container and publication exclusion.

### Verification

- Documentation consistency, links, accepted/proposed wording, global ADR
  sequence, formatting and scoped diff were checked after acceptance.
- No SPEC, plan, code, Public contract, dependency, package, publication or
  Stable classification changed.

### Next

- Draft and repeatedly review the M12 SPEC for D-042 before accepting it or
  preparing an implementation plan.

## 2026-07-15 — ADR-017 drafted and reviewed

### Completed

- Drafted ADR-017 revision 0 for D-042's root-only static neutral presentation
  groups.
- Chose a required identity-consistent presentation forest that wraps every
  root form node exactly once and permits nested static sections without
  changing the managed data tree.
- Closed root-only membership, section identity/order, descriptor-safe atomic
  fallback, localized accessible labels, fixed Angular projection and the
  ADR-009 Public/Internal migration inventory.
- Kept nested/item grouping, layout state, advanced containers, actions,
  generated scopes and all remaining D-011/D-012 capabilities Deferred.
- Review 023 cycle 1 found stale ROADMAP/root-guide wording about ADR-017's
  existence and next gate; corrected it and repeated the complete review.
- Review 023 cycle 2 found that the active deferred-register summary omitted
  D-041/D-042; corrected the summary/history and repeated the complete review.
- Review 023 cycle 3 passed all eight required areas with zero findings;
  ADR-017 remains Proposed pending formal acceptance.

### Verification

- ADR links, global sequence, formatting, deferred boundaries, Public inventory
  and scoped diff were checked after the zero-finding review.
- No SPEC, plan, code, Public contract, dependency, package, publication or
  Stable classification changed.

### Next

- Decide formal acceptance of ADR-017 revision 0. Acceptance may authorize
  drafting the M12 SPEC only.

## 2026-07-15 — Review 022 accepted and D-042 promoted

### Completed

- Ricard formally accepted review 022's split recommendation.
- Created D-042 and promoted only static neutral presentation groups to M12
  normative design.
- Kept grids, tabs, accordions, wizards, slots, actions, responsive behavior,
  conditional visibility, custom container renderers, adapter capability
  negotiation and declarative scopes outside D-042.
- Kept D-011 and D-012 Deferred and reconciled the accepted review, deferred
  register, ROADMAP, index and canonical current state.
- Reserved ADR-017 as the next architecture document without drafting it or
  activating a SPEC, plan, Public contract change or implementation.

### Verification

- Documentation formatting, links, accepted/promotion wording, global D/ADR
  sequences and the scoped diff were checked after reconciliation.
- No SPEC, ADR, plan, code, Public contract, dependency or package changed.

### Next

- Draft ADR-017 for D-042's normalized static presentation-group model and its
  exact accepted decision questions before any SPEC or plan.

## 2026-07-15 — M12/D-011/D-012 promotion readiness evaluated

### Completed

- Evaluated D-011 and D-012 against accepted SPEC-001/002/003, applicable ADRs,
  Public contracts, compiler normalization, runtime scopes and Angular hosts.
- Confirmed that nested structure, normalized node trees, stable targets,
  application-owned scopes and fixed framework projection are available.
- Identified that these foundations are not a neutral layout contract and that
  D-012's dependency on advanced UI Schema remains unsatisfied.
- Added review 022, recommending a new narrow static-presentation-group slice
  while keeping the remainder of D-011 and all of D-012 Deferred.
- Reconciled the review index, ROADMAP, deferred register and canonical current
  state without promoting a capability or authorizing architecture,
  specification, planning or implementation.

### Verification

- The scoped repeat audit found no contract conflict and confirmed D-042 is the
  next available global identifier while D-011/D-012 remain Deferred.
- Documentation checks pass across 69 Markdown files and 321 local links; full
  repository formatting and the scoped diff check also pass.
- No accepted SPEC, ADR, Public contract, dependency, package or code changed.

### Next

- Decide whether to accept review 022's split. Only acceptance may create and
  promote D-042 and authorize drafting the M12 architecture ADR.

## 2026-07-15 — PLAN-011 and M11 completed

### Completed

- Reviewed the entire PLAN-011/M11 authority, implementation, diagnostics,
  19-scenario evidence, declarations, packages, consumers, documentation and
  deferred boundaries in review 021.
- Corrected cycle 1's policy-provenance finding: item reference chains now end
  before array-level missing-policy diagnostics and remain attached only to
  item-dependent semantic policy failures.
- Added exact regressions for an inline array with referenced `items`, a
  referenced array, and applicable item-dependent policy provenance.
- Repeated the complete review in cycle 2 with zero findings, completing all
  five PLAN-011 checkpoints and M11.
- Reconciled SPEC/ADR/plan indexes, ROADMAP, D-041, release/package/root guides
  and persistent state to the completed implementation without changing
  accepted contracts.

### Verification

- Frozen-lockfile installation passed with the unchanged dependency graph.
- All 328 core and 68 Angular tests pass.
- Formatting, documentation, lint, full typecheck/build, package smoke,
  repository consumer, exact packed artifacts and diff checks pass.
- Isolated core and lower/upper Angular 22.0.6 consumers build from private
  local `0.1.0` tarballs; deep imports remain blocked.
- Root declarations/exports, Public contracts, manifests, dependencies,
  lockfile, publication state and Stable classification remain unchanged.

### Next

- No implementation task is active. Evaluate M12 promotion readiness for
  D-011/D-012 before any architecture, SPEC, plan or implementation work.

## 2026-07-15 — PLAN-011 checkpoint 4 completed

### Completed

- Mapped every one of the 19 SPEC-004 scenarios to serializable conformance,
  focused compiler/resolver or hostile programmatic evidence.
- Covered every invalid/unresolved reason, precedence, registry ordering and
  laziness, supported position, use-site normalization, cycle domain,
  provenance exclusion, branch stopping and depth-5,000 behavior.
- Proved the runtime validator receives the exact original referenced schema
  object and existing runtime/operation/Angular paths consume only normalized
  definitions.
- Updated core package smoke and isolated core/lower/upper Angular 22 consumers
  to compile/use referenced definitions through unchanged root imports.
- Added the new Internal module to the exact tarball allowlist and explicit
  guards preventing its types from entering root declarations.
- Reconciled current implementation documentation while keeping M11 incomplete
  until the final checkpoint 5 review.

### Verification

- Core tests pass 326/326 and Angular tests pass 68/68.
- Formatting, documentation, lint, full typecheck/build/test, package smoke,
  repository consumer, packed artifact and diff checks pass.
- Isolated core and lower/upper Angular 22 clean consumers build successfully;
  deep imports remain blocked.
- The first complete matrix found three strict-lint matcher issues and the next
  artifact pass found the expected Internal module absent from its allowlist;
  both were corrected and the applicable full matrix repeated successfully.
- No Public signature/export, runtime/operation/Angular production behavior,
  manifest, dependency, lockfile, publication or Stable classification changed.

### Next

- Execute PLAN-011 checkpoint 5: complete diff/declaration review, full matrix
  and repeated implementation review until one complete cycle has zero
  findings; then close M11 with no active task.

## 2026-07-15 — PLAN-011 checkpoint 3 completed

### Completed

- Integrated `$defs` inspection and root/non-root `$ref` classification into
  the existing compiler after dialect and policy-exterior processing.
- Normalized resolved primitive, object, array, item-root and item-descendant
  targets independently at each managed use site without exposing resolver
  metadata or changing Public contracts.
- Added canonical target-path cycle tracking separately from active raw-object
  containment tracking and preserved legal acyclic target reuse.
- Added exact target document paths, use-site data/template paths and immutable
  outermost-to-innermost reference provenance while excluding independent UI,
  policy-exterior and unused-policy diagnostics.
- Corrected two inaccurate expectations from the first focused test run; no
  compiler behavior correction was required by that run.

### Verification

- Repeated focused reference tests pass 56/56 and all core tests pass 304/304.
- Core typecheck, build and package smoke pass.
- Documentation consistency, formatting, lint, local links and diff checks
  pass.
- No Public contract/export, runtime, operation, Angular production file,
  manifest, dependency, lockfile, publication or Stable classification changed.

### Next

- Complete PLAN-011 checkpoint 4 with all 19 conformance/evidence rows,
  validator identity, runtime/operation/Angular/package regressions and clean
  consumers; keep checkpoint 5 inactive until this matrix is green.

## 2026-07-15 — PLAN-011 checkpoint 2 completed

### Completed

- Extended the Internal `schema-reference` module with lazy `$defs`
  exterior/entry inspection and ordered continuation after invalid entries.
- Added exact fragment-only decoding, single UTF-8 percent-decoding, RFC 6901
  token decoding, `$defs` scope enforcement and structural external-URI
  classification without browser/Node URL APIs.
- Added iterative mechanical target traversal through own enumerable data
  descriptors, canonical textual array-index handling and exact decoded-prefix
  failures without executing accessors.
- Preserved exact schema identity, immutable target/reference provenance,
  hostile `__proto__` handling and depth-5,000 traversal.
- Corrected the first focused-run findings so failing sparse/non-enumerable/
  accessor array tokens remain strings and inherited-member evidence uses an
  ordinary object.
- Kept compiler/root keyword behavior unchanged; `$defs`/`$ref` remain
  behaviorally inactive until checkpoint 3.

### Verification

- Repeated checkpoint-focused tests pass 49/49 and all core tests pass 297/297.
- Core typecheck, build and package smoke pass.
- Documentation consistency, formatting, lint, local links and diff checks
  pass.
- No Public contract/export, compiler behavior, runtime, operation, Angular
  production file, manifest, dependency, lockfile, publication or Stable
  classification changed.

### Next

- Implement PLAN-011 checkpoint 3 compiler integration for reference
  classification, target normalization, cycles, global ordering and provenance;
  do not begin checkpoint 4 until focused integrated evidence is green.

## 2026-07-15 — PLAN-011 approved; checkpoint 1 completed

### Completed

- Ricard formally approved PLAN-011 revision 0 after review 020 cycle 1 passed
  all ten acceptance areas with zero findings.
- Added an Internal `schema-reference` module for copied/frozen document paths,
  reference chains, resolved cursors and diagnostic target/first/chain paths.
- Preserved the exact caller schema object without cloning or freezing it and
  kept the module absent from the root Public export.
- Added four focused tests for caller mutation, nested isolation, hostile/lone
  surrogate segments, exact schema identity and frozen diagnostic provenance.
- Kept compiler/keyword behavior unchanged, so `$defs`/`$ref` remain inactive;
  checkpoint 2 has not started.

### Verification

- Four focused tests and all 252 core tests pass.
- Core typecheck, build and package smoke pass.
- Documentation consistency, formatting, lint, local links and diff checks
  pass.
- No Public contract/export, runtime, operation, Angular production file,
  manifest, dependency, lockfile, publication or Stable classification changed.

### Next

- Implement PLAN-011 checkpoint 2 Internal `$defs` exterior/index,
  URI-fragment/JSON Pointer decoding and mechanical target resolution; do not
  integrate or activate compiler reference behavior before checkpoint 3.

## 2026-07-15 — PLAN-011 complete review passed

### Completed

- Reviewed PLAN-011 revision 0 completely against SPEC-004 v0.1.1, ADR-016,
  ADR-005 revision 3, ADR-009, the accepted baselines and D-007/D-014/D-041.
- Inspected the M10 compiler, diagnostic/immutable helpers, Public contracts,
  conformance harness, package scripts and clean-consumer boundary.
- Confirmed one concrete evidence row for each of the 19 SPEC scenarios, five
  ordered checkpoints and objective completion/stop conditions.
- Complete review cycle 1 passed all ten acceptance areas with zero findings,
  requested corrections or documentation conflicts.
- Kept PLAN-011 Proposed and implementation inactive pending Ricard's separate
  formal approval decision.

### Verification

- Documentation consistency, formatting, lint, all local links and diff checks
  passed.
- Review 020 records the ten-area matrix and current-implementation fit.
- No production code, Public contract, dependency, package, publication or
  Stable classification changed.

### Next

- Decide formal approval of PLAN-011 revision 0; do not start checkpoint 1
  unless Ricard approves it explicitly.

## 2026-07-15 — PLAN-011 revision 0 drafted

### Completed

- Inspected the accepted SPEC-004 v0.1.1 contract, ADR-016, ADR-005 revision 3,
  ADR-009 and the completed M10 compiler/test/package boundaries.
- Drafted PLAN-011 revision 0 with a zero-signature Public migration, Internal
  registry/decoder/cursor boundary and five gated implementation checkpoints.
- Mapped all 19 SPEC-004 conformance scenarios to exact fixture/programmatic,
  hostile/deep, validator, package and clean-consumer evidence.
- Fixed expected production diff and stop conditions so runtime, operations,
  Angular production, Public contracts, manifests, dependencies, publication
  and deferred D-007/D-014 behavior remain closed.
- Reconciled SPEC metadata, ROADMAP, D-041, onboarding and canonical status with
  the Proposed plan while keeping implementation inactive.

### Verification

- Documentation consistency, formatting, lint, local-link and diff checks
  passed.
- PLAN-011 links resolve and its 19 scenario rows, five checkpoints, complete
  matrix and repeated-review gate are explicit.
- No production code, Public contract, dependency, package, publication or
  Stable classification changed.

### Next

- Review PLAN-011 revision 0 completely against every accepted authority and
  the current implementation; repeat after corrections until a complete cycle
  passes with zero findings, then decide approval separately.

## 2026-07-15 — SPEC-004 accepted and current documentation reconciled

### Completed

- Formally accepted SPEC-004 v0.1.1 after review 019 cycle 5 passed all ten
  areas with zero findings; changed acceptance/gate metadata without altering
  its normative contract.
- Corrected the stale `0.1.0` release claim so it records completed M1–M10, G0
  and all seven PLAN-010 checkpoints while keeping unimplemented SPEC-004
  behavior outside the candidate.
- Tightened ROADMAP's M10 completion and M11 next gate, and replaced ADR-016's
  completed follow-up header with the current plan/implementation boundary.
- Reconciled current indexes, onboarding documents and D-041 with accepted
  SPEC-004 and the next PLAN-011 preparation/review gate.
- Extended `docs:check` to reject the identified stale M10 release/roadmap and
  ADR-016 authorization phrases.

### Verification

- Documentation consistency, formatting, lint, local-link and diff checks
  passed.
- SPEC metadata, indexes, onboarding summaries, release scope, roadmap and
  ADR-016 current headers agree on the accepted gate and inactive
  implementation.
- No production code, normative SPEC content, dependency, package,
  publication, Stable classification, commit or push changed.

### Next

- Draft PLAN-011 for SPEC-004 v0.1.1, review it completely and repeat review
  after corrections until a full cycle passes with zero findings; do not
  implement before explicit plan approval.

## 2026-07-14 — SPEC-004 complete review passed

### Completed

- Reviewed SPEC-004 completely against ADR-016, ADR-005 revision 3, all
  accepted SPECs, ADR-009, D-007/D-014/D-041 and the primary standards.
- Corrected six cycle-1 contract/evidence findings in Draft v0.1.1: array
  element bounds, root `$ref` order, `$defs` continuation, cycle locator,
  supported-position coverage and direct standards references.
- Cycle 2 found and corrected a stale Draft version in canonical state and
  extended `docs:check` to compare accepted/proposed SPEC metadata with source
  files and onboarding indexes.
- Cycle 3 found and corrected the omitted SPEC-004 entry in the dedicated SPEC
  index and made `docs:check` validate that index without parsing it as a SPEC.
- Cycle 4 found and corrected cross-entry state/version matching in the SPEC
  index check.
- Repeated complete cycle 5 passed all ten review areas with zero findings or
  documentation conflicts.
- Kept SPEC-004 Draft and left acceptance, planning and implementation inactive.

### Verification

- Documentation metadata, formatting, lint, all local links and diff checks
  passed.
- Review 019 records all nine corrections and the zero-finding cycle 5.
- No production code, Public signature, dependency, package, publication or
  Stable state changed.

### Next

- Decide formal acceptance of SPEC-004 v0.1.1; do not prepare an implementation
  plan unless Ricard accepts it explicitly.

## 2026-07-14 — SPEC-004 v0.1.0 drafted

### Completed

- Drafted the observable same-document static `$defs`/`$ref` extension required
  by accepted ADR-016 and ADR-005 revision 3.
- Closed registry/reference catalogs, fragment and JSON Pointer parsing,
  mechanical target traversal, normalization, provenance, cycle domains,
  ordering and branch stopping.
- Defined exact diagnostic families and nineteen conformance groups without
  adding a Public symbol or changing an existing signature.
- Corrected the ADR index's stale completed follow-up gate and reconciled the
  documentation index, onboarding README, roadmap, deferred register and live
  status.
- Kept SPEC-004 Draft and every plan, implementation, package, publication and
  Stable gate inactive.

### Verification

- Documentation consistency, formatting, lint, local-link and diff checks
  passed.
- Drafting consistency against all accepted SPECs, ADR-016, ADR-005 revision 3
  and D-041 passed; formal complete review remains pending.
- No production code, dependency, manifest, package or Public signature changed.

### Next

- Perform and record the complete SPEC-004 review; repeat it after every
  correction until a full cycle passes with zero findings before deciding
  acceptance.

## 2026-07-14 — Stable AI guidance realigned

### Completed

- Removed current milestone, version and schema-shape duplication from the
  stable `AGENTS.md` and `HANDOFF.md` operating guidance.
- Made `STATUS.md` and Accepted SPECs the explicit sources for recovering active
  scope, and clarified full-document and read-only review behavior.
- Reconciled root/documentation indexes and ROADMAP with completed M10 and the
  accepted narrow D-041 M11 architecture.
- Compacted the live task-document map and removed ephemeral ahead/push claims
  from canonical project state.
- Added `pnpm docs:check` to validate stable-guide purity, accepted SPEC versions
  and local Markdown targets.

### Verification

- Documentation consistency, formatting, lint and diff checks passed.
- A repeated complete review of the stable guides, onboarding indexes, current
  status and M11 roadmap scope passed with zero findings.
- No architecture, public contract, production code, dependency, package,
  publication or Stable state changed.

### Next

- Draft and completely review SPEC-004 before preparing any M11 implementation
  plan.

## 2026-07-14 — ADR-005 revision 3 accepted

### Decision

- Ricard formally accepted ADR-005 revision 3 after review 018 cycle 2 passed
  all ten areas with zero findings.
- Recorded section 12 as Accepted normative M11 design and kept sections 1–11
  as the implemented M1–M10 behavioral authority.
- Authorized drafting and reviewing SPEC-004 only; no plan, implementation,
  package, publication or Stable change is active.
- Prepared the complete accumulated M11 documentation checkpoint for commit
  with the configured Rabassoft author identity.

### Verification

- Documentation formatting, local links, active-state consistency and
  `git diff --check` pass.
- No code, test, manifest, dependency, peer/export, lockfile, package,
  publication or Stable state changed.

### Next

- Draft SPEC-004 with the observable D-041 behavior required by accepted
  ADR-016 and ADR-005 revision 3, then review it completely before acceptance
  or any implementation plan.

## 2026-07-14 — ADR-005 revision 3 complete review passed

### Review and corrections

- Reviewed proposed ADR-005 revision 3 completely against its ten acceptance
  areas, accepted ADR-016, SPEC-001/002/003, applicable ADRs, primary URI/JSON
  Pointer standards and deferred boundaries.
- Cycle 1 found six insufficiently closed areas covering malformed `$defs`
  stopping/provenance, URI grammar/precedence, decoded fragment form, reason
  reachability and unresolved target/public-diagnostic semantics.
- Corrected every finding without widening D-041 or changing accepted M1–M10
  behavior.
- Repeated the complete review; cycle 2 passed all ten areas with zero findings.
  Added review 018 while revision 3 remains Proposed pending Ricard's formal
  decision.

### Verification

- Documentation formatting, all 63 Markdown files/290 local links,
  active-state consistency and `git diff --check` pass.
- No code, test, manifest, dependency, peer/export, lockfile, package,
  publication or Stable state changed.

### Next

- Decide formally whether to accept, correct or reject ADR-005 revision 3.
  Acceptance would authorize drafting SPEC-004 only.

## 2026-07-14 — ADR-016 accepted and ADR-005 revision 3 proposed

### Decision and drafting

- Ricard formally accepted ADR-016 after review 017 cycle 2 passed all eight
  areas with zero findings.
- Recorded ADR-016 as Accepted; its only authorized follow-up is preparation
  and review of ADR-005 revision 3.
- Drafted ADR-005 revision 3 as Proposed with the closed D-041 `$defs`/local
  `$ref` catalog, pointer traversal, diagnostics, cycle identities, provenance,
  ordering and Public/Internal inventory.
- Preserved ADR-005 revision 2 as current behavioral authority and authorized
  no SPEC-004, plan, implementation, package, publication or Stable change.

### Verification

- Documentation formatting, all 62 Markdown files/283 local links,
  active-state consistency and `git diff --check` pass.
- No code, test, manifest, dependency, peer/export, lockfile, package,
  publication or Stable state changed.

### Next

- Review ADR-005 revision 3 completely across its ten acceptance areas, correct
  every finding and repeat until a zero-finding cycle permits a separate formal
  acceptance decision.

## 2026-07-14 — ADR-016 complete review passed

### Review and corrections

- Reviewed proposed ADR-016 completely against its eight acceptance areas,
  accepted SPEC-001/002/003, ADR-005/009/014, review 016 and the deferred
  boundaries.
- Cycle 1 found five insufficiently closed contract areas: `$defs`/`$ref`
  inspection order, safe pointer traversal, reference-versus-object cycle
  identity, provenance scope/order and the ADR-009 diagnostic inventory.
- Corrected every finding without widening D-041, changing accepted authority
  or authorizing implementation.
- Repeated the complete review; cycle 2 passed all eight areas with zero
  findings. Added review 017 as acceptance evidence while ADR-016 remains
  Proposed pending Ricard's formal decision.

### Verification

- Documentation formatting, all 62 Markdown files/281 local links,
  active-state consistency and `git diff --check` pass.
- No code, test, manifest, dependency, peer/export, lockfile, package,
  publication or Stable state changed.

### Next

- Decide formally whether to accept, correct or reject ADR-016. Acceptance
  would authorize drafting ADR-005 revision 3 only.

## 2026-07-14 — M11 promotion accepted and ADR-016 proposed

### Decision and drafting

- Ricard formally accepted review 016 and the split of same-document static
  reference resolution from D-007.
- Created D-041 as Promoted for narrow normative design; D-007 remains Deferred
  and D-014 remains Research outside the transferred Internal responsibility.
- Drafted ADR-016 Proposed for root `$defs`, fragment-only `$ref` by JSON
  Pointer, Internal resolved cursors, exact provenance and deterministic
  cycle/sharing behavior.
- Kept Public compiler signatures and `FormDefinition` unchanged by default;
  ADR-005 revision 2 remains authoritative until a later accepted revision 3.

### Verification

- Documentation formatting, local links, active-state consistency and
  `git diff --check` pass.
- No code, test, manifest, dependency, peer/export, lockfile, package,
  publication or Stable state changed.

### Next

- Review ADR-016 completely across its eight acceptance areas, correct all
  findings and repeat until a zero-finding cycle before formal acceptance.

## 2026-07-14 — M11 promotion-readiness review completed

### Review

- Evaluated D-014 and D-007 restart conditions against accepted Draft 2020-12
  policy, completed M9/M10 models and the current compiler pipeline.
- Confirmed D-014 is ready for a narrow promotion decision, but D-007 cannot be
  promoted wholesale because the required resolution layer does not exist.
- Recommended separating same-document `$defs` + static fragment `$ref`
  resolution into a new identifier, with an Internal resolver and unchanged
  Public `FormDefinition` by default.
- Kept D-014 Research and D-007 Deferred pending Ricard's explicit acceptance,
  correction or rejection; no ADR, SPEC, plan or implementation was activated.

### Verification

- Documentation formatting, 60 Markdown files/267 local links, state
  consistency and `git diff --check` pass.
- No product, manifest, dependency, peer/export, lockfile, publication or
  Stable state changed.

### Next

- Decide review 016 formally. If accepted, register/promote only the narrow
  static local-reference slice and draft ADR-016 before later normative work.

## 2026-07-14 — PLAN-010 checkpoint 7 and M10 completed

### Review and corrections

- Reviewed the complete M10 implementation diff, all 12 SPEC-003 scenario
  areas, declarations, packages, consumers and deferred boundaries against the
  accepted SPECs, ADRs and PLAN-010.
- Cycle 1 found no product or contract defect. It found stale active M10 state
  in SPEC/ADR headers, indexes, ROADMAP, PLAN-010 and delivery registers.
- Corrected only those current-state conflicts, added review 015 and repeated
  the complete review; cycle 2 passed with zero findings.

### Verification

- `CI=true pnpm install --frozen-lockfile`, formatting, lint, typecheck, builds
  and `git diff --check` pass.
- All 248 core and 68 Angular tests pass (316 total).
- Package smoke, built consumer, exact private artifacts and clean core plus
  Angular 22.0.6 lower/upper consumers pass.
- All 59 Markdown files and 263 local links resolve. No manifest, version,
  dependency, peer/export, lockfile, publication or Stable state changed.

### Next

- Review M11 promotion readiness by evaluating D-014 and D-007 together before
  drafting normative or implementation documents.

## 2026-07-14 — PLAN-010 checkpoint 6 completed

### Implementation

- Migrated repository/package README files and private `0.1.0` candidate notes
  to the accepted homogeneous object-collection boundary and exact exclusions.
- Extended core/Angular package smoke, declaration inventory, built consumer
  and clean consumers through collection compilation, stable reads/requests,
  fixed Angular projection and controlled operation application.
- Kept collection/item hosts and text/lifecycle helpers Internal while checking
  the complete accepted Public collection type and Angular method inventory.
- Corrected ordinary `set-value`/`remove-value` definition validation for mixed
  forms containing valid collection nodes; added a focused regression test.

### Review and verification

- Repeated review corrected ambiguous “nested array” documentation and the
  clean-consumer operation narrowing after the mixed-form defect was fixed.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, builds and
  `git diff --check` pass; all 248 core and 68 Angular tests pass (316 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass, including clean
  core plus Angular 22.0.6 lower/upper consumers.
- All 58 Markdown files and 262 local links resolve. No manifest, version,
  dependency, peer/export, lockfile, publication or Stable state changed.

### Next

- Execute PLAN-010 checkpoint 7: complete scenario matrix, declaration and
  full-diff review, correct every finding and repeat until zero findings.

## 2026-07-14 — PLAN-010 checkpoint 5 completed

### Implementation

- Added fixed Internal Angular collection and item hosts with stable-keyed
  views, stable leaf addresses and existing primitive renderer/Signal Form
  buffers; arrays never enter renderer selection.
- Added semantic collection/item legends, localized adjacent remove/move
  controls, exact stable instance IDs and invalid-identity subtree suppression.
- Routed item leaf value/remove/focus/blur intentions through stable addresses
  while preserving absolute routing for non-collection fields.
- Preserved renderer and DOM focus ownership across confirmed movement,
  restored removal focus to next/previous/collection legends and destroyed
  removed or partial descendants deterministically.
- Isolated ordinary collection, identity, issue, item-action and item-issue
  text identities so reprojection retains hosts, renderers and presentation
  buffers; synchronous host failures stop only their own subtree.

### Review and verification

- Focused evidence covers semantic/ID relationships, stable operations,
  controlled rejection, renderer reuse/destruction, all focus fallbacks,
  invalid identity, exact text order/fallback, locale reprojection and both
  collection/item host failure boundaries.
- Review corrected transitive template renderer types, positional number
  diagnostics, independent text-reprojection identities and an unintended new
  tarball artifact caused by a separate Internal helper module.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, builds and
  `git diff --check` pass; all 247 core and 68 Angular tests pass (315 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass, including clean
  core plus Angular 22.0.6 lower/upper consumers. The first clean-consumer run
  failed only because sandbox DNS was blocked; the authorized retry passed.
- No root export, manifest, version, dependency, peer/export, lockfile,
  publication or Stable state changed.

### Next

- Execute PLAN-010 checkpoint 6: root declarations, package smoke,
  documentation, exact artifact allowlists and built/clean consumer migration.

## 2026-07-14 — PLAN-010 checkpoint 4 completed

### Implementation

- Activated recoverable descriptor-safe current/baseline collection identity
  inspection and atomic managed-accessor rejection before validator execution.
- Added immutable array, item and template-instance snapshots, dynamic leaf
  projection, stable and positional reads, identity-based reconciliation and
  complete observable-state structural sharing.
- Activated all five controlled collection intentions, stable focus/blur,
  missing-path start/end insertion, positional validation assignment and
  collection/item/node scopes with visibility and touched reset behavior.
- Kept application state authoritative, numeric paths observation-only, core
  framework-neutral and Angular collection/item hosts inactive until checkpoint 5.

### Review and verification

- Repeated review corrected fixed-order hostile action diagnostics, deep
  recursive snapshot construction, missing-ancestor materialization, vanished
  interaction cleanup, dynamic array scopes, fine-grained sharing, exact
  incompatible blocking paths, dirty ownership and definition/item/template
  accessor order.
- Added focused evidence for all request variants, invalid/recovering identity,
  current-before-baseline diagnostics, positional issue fallbacks, hostile
  descriptors, depth-1,200 item trees, controlled confirmation and immutable
  replacement sharing.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds,
  `git diff --check` and all 58 Markdown files/262 local links pass; all 247
  core and 59 Angular tests pass (306 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass, including clean
  core plus Angular 22.0.6 lower/upper consumers. No manifest, version,
  dependency, peer/export, lockfile, publication or Stable state changed.

### Next

- Execute PLAN-010 checkpoint 5: Internal Angular collection/item/text
  projection, stable views, actions, accessibility, focus/lifecycle/failure
  behavior and focused tests.

## 2026-07-14 — PLAN-010 checkpoint 3 completed

### Implementation

- Widened `FormOperation` to the five accepted stable collection variants and
  added descriptor-safe fixed-order parsing with the exact collection shape,
  managed-path, compatibility and stale diagnostic families.
- Implemented schema-neutral and definition-aware stable-identity application
  for item leaf set/remove plus item insert/remove/move, including complete
  identity scans, stable anchors, expectation semantics and successful
  already-satisfied move no-effects.
- Preserved atomicity, opaque inserted item references, unaffected item/object
  references and off-path descriptors while cloning only the ancestor chain
  and affected array. Start/end insertion alone can materialize a missing
  compatible collection path.
- Kept collection runtime snapshots, requests, validation/interaction and
  Angular collection hosts inactive for their later checkpoints.

### Review and verification

- Added focused hostile-object and immutable-effect tests plus JSON fixtures
  for all five variants; review corrected leaf-value and anchor precedence,
  positional leaf diagnostics, iterator safety and the Angular test narrowing
  required by the now-complete Public operation union.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 207 core and 59 Angular tests pass (266 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass with clean core and
  Angular 22.0.6 consumers.
- No manifest, version, dependency, peer/export, lockfile, publication or
  Stable state changed.

### Next

- Execute PLAN-010 checkpoint 4: collection external-state identity
  inspection, runtime snapshots/sharing/reads, requests,
  validation/scopes/interaction and runtime fixtures.

## 2026-07-14 — PLAN-010 checkpoint 2 completed

### Implementation

- Added descriptor-safe exterior collection-policy parsing, canonical path
  indexing and exact missing/unused/semantic identity diagnostics without
  retaining or invoking caller objects.
- Extended iterative schema traversal with supported arrays, inline object
  items, identity exclusion, nested object/primitive descendants, cycle safety
  and explicit nested-array stopping.
- Added structural array/item UI traversal, identity-entry rejection, exact
  array/template paths and immutable `ArrayNodeDefinition` plus static item
  template construction; global fields remain non-collection leaves only.
- Activated `ArrayNodeDefinition` only in `FormNodeDefinition`. Existing M9
  operations/runtime still reject collection definitions until their approved
  checkpoints and no Angular collection host was added.

### Review and verification

- Repeated review corrected M9 array fixture migration, matched-policy handling
  for invalid `items`, non-array `items` classification, array/item UI cycles,
  item-root diagnostic ordering and deep/independent array coverage.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 189 core and 59 Angular tests pass (248 total), including the new compiler
  conformance fixture and depth-1,200 item template.
- `pnpm test:package`, `pnpm test:consumer`, `pnpm test:artifacts` and
  `pnpm test:consumer:clean` pass with clean core and Angular 22.0.6 consumers.
- No manifest, version, dependency, peer/export, lockfile, publication or
  Stable state changed.

### Next

- Execute PLAN-010 checkpoint 3: implement the five collection operations and
  pure/form helper diagnostics, descriptor behavior and fixtures.

## 2026-07-14 — PLAN-010 checkpoint 1 completed

### Implementation

- Added the accepted framework-neutral collection policy, structural UI,
  template, definition, address, snapshot, operation, scope and text contract
  shapes and their root type exports.
- Added descriptor-safe address copying and tagged canonical collection keys,
  plus iterative manual collection-definition/template validation with exact
  reasons and frozen locators behind a separate Internal entry.
- Migrated the declaration-only Angular object/array text diagnostic branch and
  the exact private tarball allowlist without activating compiler, operation,
  runtime or Angular collection-host behavior.
- Added focused contract, hostile-address and manual-definition tests. Review
  corrected projection-locator coverage, exact item-member defect
  classification, the sparse-array fixture and premature acceptance of
  collection definitions by existing M9 runtime/operation consumers.

### Verification

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, builds and
  `git diff --check` pass.
- All 177 core and 59 Angular tests pass (236 total).
- `pnpm test:package`, `pnpm test:consumer`, `pnpm test:artifacts` and
  `pnpm test:consumer:clean` pass; clean core and Angular 22.0.6 lower/upper
  consumers build from the private local `0.1.0` tarballs.
- The initial clean-consumer attempt failed only because sandbox DNS could not
  reach npm; the authorized network retry passed. No manifest, version,
  dependency, peer/export, lockfile, publication or Stable state changed.

### Next

- Execute PLAN-010 checkpoint 2: collection policies, array/item/structural-UI
  compilation, immutable templates and compiler/manual-definition conformance
  fixtures.

## 2026-07-14 — PLAN-010 revision 0 approved

### Approval

- Ricard formally approved PLAN-010 revision 0 after complete review cycle 1
  passed all nine areas with zero findings and no documentation conflict.
- Approval authorizes exactly checkpoints 1–7 and their verification/stop
  conditions. Checkpoint 1 has not started.
- Primitive/nested arrays, tuples, refs/composition, generated/editable
  identity, factories/defaults, batches/optimism, layout, custom collection
  renderers, persistence, Stable promotion and publication remain unauthorized.

### State synchronization and verification

- Updated SPEC-003, PLAN/review metadata, README, ROADMAP, D-006 and STATUS to
  distinguish approved-but-not-started implementation from completed work.
- `pnpm format:check`, `git diff --check` and documentation links pass; no code,
  package, manifest, dependency, peer, lockfile or publication state changed.

### Next

- Start PLAN-010 checkpoint 1 with Public neutral contracts/exports and shared
  Internal collection address/definition-validation helpers, then verify it
  before checkpoint 2.

## 2026-07-14 — SPEC-003 accepted; PLAN-010 proposed and reviewed

### Acceptance

- Ricard formally accepted SPEC-003 v0.1.2 after complete review cycle 3 passed
  all six areas with zero findings and no documentation conflict.
- Acceptance authorizes preparation/review of PLAN-010 only; implementation,
  Stable promotion and publication remain separate gates.

### PLAN-010

- Drafted PLAN-010 revision 0 with seven ordered checkpoints covering Public
  contracts, compiler, operations, runtime, Angular, packages and final closure.
- Mapped all 12 SPEC-003 conformance scenarios to concrete fixture,
  programmatic, declaration, package and clean-consumer evidence.
- Complete review cycle 1 passed all nine areas with zero findings; the plan
  remains Proposed and implementation is not authorized.
- Corrected one stale ROADMAP sentence that still called completed PLAN-009
  checkpoint 7 pending.

### Verification and next

- `pnpm format:check`, `git diff --check` and documentation links pass; all 58
  Markdown files have 262 valid local link targets.
- Decide formal approval or rejection of PLAN-010 revision 0. Do not start
  checkpoint 1 before explicit approval.

## 2026-07-14 — ADR-015 revision 4 accepted; SPEC-003 cycle 3 passed

### Acceptance and correction

- Ricard formally accepted ADR-015 revision 4 after its complete review passed
  all six areas with zero findings.
- Corrected F-007 in SPEC-003 Draft v0.1.2 by widening only
  `ObjectTextResolutionContext.node` to
  `ObjectFieldDefinition | ArrayNodeDefinition` and closing the exact ordinary
  array-node text/issue behavior.
- Preserved all collection-specific contexts, existing text semantics,
  framework ownership and deferred boundaries.

### Repeated review

- Repeated the complete SPEC-003 review against SPEC-001/SPEC-002, ADR-005
  revision 2, ADR-015 revision 4 and D-006/M10.
- Cycle 3 passed all six areas with zero findings and no documentation
  conflict; F-001 through F-007 are closed.
- `pnpm format:check` and `git diff --check` pass. SPEC-003 remains Draft;
  PLAN-010 and implementation remain unauthorized.

### Next

- Decide formal acceptance or rejection of SPEC-003 Draft v0.1.2. Review
  completion does not accept the SPEC.

## 2026-07-14 — ADR-015 revision 4 proposed and review passed

### Proposal

- Widened only `ObjectTextResolutionContext.node` from
  `ObjectFieldDefinition` to
  `ObjectFieldDefinition | ArrayNodeDefinition` so collection ordinary texts
  and own issues can use the Public `TextResolver` truthfully.
- Named the transitive `TextResolutionContext`/`TextResolver.resolve()` Public
  delta without adding a symbol or changing any text member, source, fallback,
  diagnostic or projection order.
- Kept fixed collection-node projection Internal and preserved revisions 1–3,
  all deferred boundaries and every later authorization gate.

### Review and verification

- Completed all six revision 4 review areas in cycle 1 with zero findings and
  no documentation conflict.
- `pnpm format:check`, `git diff --check` and the documentation link check pass;
  all 56 Markdown files have 249 valid local link targets.
- SPEC-003 remains unchanged at Draft v0.1.1; PLAN-010 and implementation
  remain unauthorized.

### Next

- Decide formal acceptance or rejection of ADR-015 revision 4. A passing review
  does not accept the proposal.

## 2026-07-14 — ADR-015 revision 3 accepted; SPEC-003 cycle 2 found F-007

### Acceptance and corrections

- Ricard formally accepted ADR-015 revision 3 after its zero-finding complete
  review.
- Corrected all six SPEC-003 cycle-1 findings in Draft v0.1.1: exact policy
  identity names, item issue resolution, item leaf/text declarations, stable
  focus/blur, closed collection diagnostics and manual/external runtime safety.
- Preserved every operation discriminant, controlled-state rule, Angular
  ownership boundary and deferred exclusion.

### Repeated review

- Cycle 2 confirmed all six corrections across the complete review matrix.
- Found F-007: collection-node label/description/hint/tooltip and own issues
  cannot be represented by accepted object or collection text contexts.
- Recommended narrow ADR-015 revision 4 widening only
  `ObjectTextResolutionContext.node` to object or array definitions and naming
  the exact transitive Public delta.

### Next

- Decide whether to prepare ADR-015 revision 4. SPEC-003 remains Draft;
  PLAN-010 and implementation remain unauthorized.

## 2026-07-14 — ADR-015 revision 3 proposed and review passed

### Proposal

- Added only the missing item-root `issue` branch to
  `CollectionTextMember`/`CollectionTextResolutionContext`.
- Reused the accepted `issue.fallbackMessage ?? issue.code` source, blank issue
  result semantics and resolver isolation from field/object issue projection.
- Named every transitive Public Experimental change and kept the fixed Angular
  item text projector Internal.

### Review

- Completed all six revision 3 review areas in cycle 1 with zero findings and
  no documentation conflict.
- Confirmed no identity, operation, snapshot, validation assignment, scope,
  Angular ownership, package, stability or deferred boundary changed.
- Revision 3 remains Proposed; review does not constitute formal acceptance.

### Next

- Decide formal acceptance or rejection of ADR-015 revision 3. SPEC-003
  corrections and repeated review remain paused until that decision.

## 2026-07-14 — SPEC-003 complete review cycle 1 found six issues

### Review

- Reviewed the complete Draft against SPEC-001/SPEC-002, ADR-015 revision 2,
  ADR-005 revision 2, the D-006/M10 boundary, declaration-ready contracts and
  authorization gates.
- Recorded six findings: policy identity names were narrowed beyond the ADRs;
  item-root issues lack a legal text context; item leaf/text signatures are not
  declaration-ready; focus/blur lack stable item addressing; collection
  operation diagnostics remain open; and manual-definition/external-tree
  safety is underspecified.
- Confirmed the remaining template/instance, identity, traversal, operation,
  controlled-state, Angular ownership and deferred-boundary areas are aligned.

### Conflict

- ADR-015 revision 2 exposes item-root validator issues but its closed Public
  `CollectionTextResolutionContext` has no `issue` branch. SPEC-003 cannot fix
  this without silently changing an Accepted Public contract.
- Recommended a narrow ADR-015 revision 3 adding only item-root issue text
  resolution and its exact Public inventory delta.

### Next

- Decide whether to prepare ADR-015 revision 3. SPEC-003 corrections and the
  repeated complete review remain paused; PLAN-010 and implementation are
  unauthorized.

## 2026-07-14 — SPEC-003 Draft v0.1.0 prepared

### Result

- Drafted the complete observable M10 contract for homogeneous inline-object
  collections with application-owned stable string identity.
- Consolidated accepted schema/UI/policy, template/instance, path/address,
  snapshot, dirty/interaction, five-operation, validation/scope, text, Angular
  and exact Public Experimental migration decisions.
- Closed proposed policy, invalid-identity, unaddressable-action, operation,
  text and fixed-host diagnostics for subsequent complete review.
- Preserved primitive/nested arrays, tuples, refs/composition,
  defaults/factories, optimistic/batch behavior, layout, publication and Stable
  promotion as inactive.
- Corrected the deferred register's stale next-work pointer from preparing
  already accepted ADR-015 to reviewing SPEC-003.

### Verification

- Documentation formatting, local links and diff checks are recorded in the
  current `STATUS.md` checkpoint.
- No implementation, package, manifest, lockfile or accepted contract changed.

### Next

- Perform a complete SPEC-003 review, apply corrections and repeat the full
  review until one cycle passes with zero findings. Acceptance, PLAN-010 and
  implementation remain separate later gates.

## 2026-07-14 — ADR-005 revision 2 accepted

### Decision

- Ricard accepted ADR-005 revision 2 after cycle 3 passed all nine review areas
  with zero findings.
- Revision 1 remains the implemented M1–M9 authority; accepted revision 2 adds
  only the narrow M10 array/item/identity schema and structural UI design.
- Acceptance authorizes preparing SPEC-003 as a separate task. It does not
  authorize PLAN-010, implementation, packages, Stable promotion or
  publication.

### Next

- Draft SPEC-003 for the complete observable M10 behavior and its exact
  relationship to SPEC-001/SPEC-002, ADR-015 revision 2 and ADR-005 revision 2.

## 2026-07-14 — ADR-005 revision 2 complete review passed

### Review and corrections

- Completed three full review cycles across all nine revision 2 acceptance
  areas.
- Cycle 1 corrected policy branch stopping, incompatible keyword diagnostics
  and exact structural UI shape/cycles/paths/order.
- Cycle 2 restored the accepted `INCOMPATIBLE_SCHEMA_KEYWORD` parameter
  envelope without composite aliases.
- Cycle 3 passed all nine areas with zero findings and no documentation
  conflict.

### State

- ADR-005 revision 1 remains Accepted and authoritative for implemented M1–M9.
- Revision 2 remains Proposed and is ready for formal acceptance or rejection.
- No SPEC, plan, implementation, package, Stable or publication gate changed.

### Next

- Decide formal acceptance of ADR-005 revision 2. Acceptance would authorize
  preparing SPEC-003 as the next separate task only.

## 2026-07-14 — ADR-015 revision 2 accepted

### Resolution

- Added only `ArrayUiSchema`, `ItemUiSchema` and the transitive
  `UiNodeSchema`/UI input migration omitted by revision 1's exact Public
  inventory.
- Confirmed schema-kind-directed interpretation, framework-neutral ownership
  and exclusion of identity, actions, layout, renderer authority and every
  other deferred capability from UI Schema.
- The complete six-area review passed with zero findings and Ricard authorized
  and accepted the narrow revision 2 correction.
- The conflict blocking ADR-005 revision 2 review is resolved; no SPEC, plan,
  implementation or publication is authorized.

### Next

- Resume the complete ADR-005 revision 2 review and repeat it after any
  correction until zero findings.

## 2026-07-14 — ADR-005 revision 2 drafted; UI inventory conflict found

### Result

- Preserved ADR-005 revision 1 as the Accepted authority for implemented
  M1–M9 behavior and added revision 2 only as a Proposed M10 section.
- Defined the narrow supported `type: "array"`/single inline object `items`
  catalog, mandatory direct identity schema, descriptor-safe traversal,
  active-ancestry cycles, template-relative diagnostic paths and deterministic
  order.
- Added minimal structural `ArrayUiSchema`/`ItemUiSchema` metadata without item
  action text, identity editing, cardinality or layout semantics.
- Kept primitive/nested arrays, tuples, all other array keywords, refs,
  composition, defaults/factories, implementation and publication inactive.

### Conflict

- The cross-document check found that accepted ADR-015 revision 1 declares an
  exact Public migration inventory but omits `ArrayUiSchema`, `ItemUiSchema` and
  the `UiNodeSchema` change required by this draft.
- Reviewing or accepting ADR-005 revision 2 as written would therefore create a
  silent Public-contract change contrary to ADR-009 and ADR-015.
- Recommended resolution: prepare a narrowly scoped ADR-015 revision 2 adding
  only the missing UI migration inventory, repeat its complete review and seek
  explicit acceptance before resuming ADR-005 revision 2 review.

### Verification

- Documentation formatting, all 50 Markdown files, 231 local links and diff
  verification pass.
- No SPEC, plan, package, manifest, lockfile or implementation changed.

### Next

- Decide whether to prepare the recommended narrow ADR-015 revision 2. ADR-005
  revision 2 review remains paused until the Public UI inventory conflict is
  resolved.

## 2026-07-14 — ADR-015 revision 1 accepted

### Decision

- Ricard accepted ADR-015 revision 1 after cycle 4 passed all nine review areas
  with zero findings.
- The accepted decision fixes application-owned stable string identity,
  template/instance separation, stable addresses, five item intentions,
  snapshots/scopes and fixed Angular ownership for M10 normative design.
- Acceptance authorizes preparation and review of ADR-005 revision 2 only; it
  does not authorize SPEC-003, PLAN-010, implementation or publication.

### Next

- Prepare ADR-005 revision 2 for the narrow M10 array-schema traversal and
  compatibility policy while preserving accepted revision 1 for implemented
  M9 behavior.

## 2026-07-14 — ADR-015 complete review passed

### Review and corrections

- Completed four full ADR-015 review cycles across all nine acceptance areas.
- Cycle 1 corrected seven findings covering ADR-014 key/DOM compatibility,
  self-contained operations, exact item-leaf variants, missing-array insertion,
  dirty aggregation, Angular accessibility/focus/failure behavior and the
  Public migration inventory.
- Cycle 2 corrected three transitive findings covering static versus dynamic
  leaf projections, item-root lookup typing, opaque inserted-item ownership and
  runtime materialization below missing ancestors.
- Cycle 3 corrected one sequence conflict that prematurely authorized SPEC-003
  before acceptance of ADR-005 revision 2.
- Repeated the complete review after each correction set; cycle 3 exposed the
  final sequence conflict and cycle 4 then passed all nine areas with zero
  findings and no documentation conflict.

### State

- ADR-015 is Proposed revision 1 and ready for formal acceptance or rejection.
- No SPEC, accepted ADR, plan, implementation, package or publication state
  changed.
- Implementation remains blocked by accepted ADR-015, ADR-005 revision 2,
  SPEC-003 and an explicitly approved PLAN-010.

### Verification

- Documentation formatting, all 50 Markdown files and 228 local links, and diff
  checks pass.
- The scoped working tree contains only ADR-015/review/current-state
  documentation.

### Next

- Decide formal acceptance of ADR-015 revision 1. If accepted, prepare ADR-005
  revision 2 next without drafting SPEC-003 or implementing arrays.

## 2026-07-14 — ADR-015 revision 0 proposed

### Result

- Drafted ADR-015 as the first normative M10 decision under the accepted D-006
  boundary, without changing a SPEC, plan, package or implementation.
- Selected a direct required application-owned string property declared by a
  neutral collection policy; identity is non-editable instance metadata rather
  than an index, callback, UI option or runtime-generated value.
- Separated immutable item templates, positional data paths and stable item
  addresses; proposed identity/anchor-based leaf, insert, remove and move
  operations with controlled confirmation and no batches or optimism.
- Defined array/item snapshots, dirty and interaction reconciliation,
  validation/scopes, fixed accessible Angular ownership and the required
  Experimental API migration families.
- Preserved primitive/nested arrays, tuples, refs/composition, defaults,
  advanced layouts, publication and every other deferred boundary.

### Verification

- Documentation formatting, all 49 Markdown files and 226 local links, and diff
  checks pass.
- No code, manifest, lockfile, package, SPEC, accepted ADR or plan changed.

### Next

- Perform a complete ADR-015 review across all nine acceptance areas; apply
  corrections and repeat the full review until it has zero findings before
  deciding acceptance.

## 2026-07-14 — D-006/M10 promotion accepted

### Decision

- Ricard explicitly accepted the zero-finding M10 promotion review.
- D-006 moves from Deferred to Promoted for normative design work under the
  narrow homogeneous inline-object list and application-owned stable string
  identity boundary.
- Acceptance authorizes drafting ADR-015, ADR-005 revision 2 and SPEC-003 in
  order; it does not approve PLAN-010, implementation or publication.

### Next

- Draft ADR-015 for collection templates/instances, identity, paths,
  operations, snapshots/scopes and Angular ownership without changing code.

## 2026-07-14 — D-006/M10 promotion boundary reviewed

### Result

- Confirmed that M9 completion satisfies D-006's resumption condition.
- Passed the promotion review with a narrow recommendation: homogeneous arrays
  of inline object items with mandatory stable string identity owned by the
  application.
- Kept primitive/nested arrays, tuples, positional/runtime-generated identity,
  schema-default insertion, batches, advanced layouts and publication outside
  the proposed M10 boundary.
- Defined the mandatory sequence ADR-015, ADR-005 revision 2, SPEC-003 and
  reviewed/approved PLAN-010 before any implementation.

### State

- D-006 remains Deferred pending Ricard's explicit acceptance of the promotion
  review. No architecture, Public contract, code or package behavior changed.

### Next

- Accept or reject the M10 promotion review. Acceptance authorizes normative
  drafting only, never implementation.

## 2026-07-14 — PLAN-009 checkpoint 7 and M9 completed

### Review and corrections

- Reviewed the complete PLAN-009 implementation against SPEC-001/SPEC-002,
  ADR-005/ADR-014, all 15 conformance scenarios, declarations, packages and
  deferred boundaries through repeated full-review cycles.
- Corrected stale nested-object prohibitions and inactive-M9 statements in
  recovery guidance, ROADMAP and ADR indexes/state summaries.
- Closed evidence gaps for every nested primitive kind, zero-leaf object
  presence/dirty, class-instance ancestors, validation-driven sibling sharing,
  complete lookup behavior and recursive Angular locale/replacement lifecycle.
- The final complete review passed with zero findings; PLAN-009 and M9 are
  completed without activating M10 or publication.

### Verification

- Frozen-lockfile installation, format, lint, typecheck, both builds and
  `git diff --check` pass.
- All 171 core and 59 Angular tests pass (230 total).
- Package smoke, built consumer and exact private artifact inventory pass.
- Clean core plus Angular 22.0.6 lower/upper consumers pass against local
  tarballs.
- Root declarations match the accepted migration; manifests, versions,
  dependencies, peers/exports, lockfile, publication state and Stable
  classification are unchanged.

### Next

- Decide whether to promote D-006/M10 through a separate review. Arrays remain
  Deferred and no implementation task is active.

## 2026-07-14 — PLAN-009 checkpoint 6 completed

### Delivery

- Migrated core package smoke to nested declarations, both node/field lookup
  methods and controlled deep set/remove operations through the package root.
- Migrated the built Angular consumer and clean core/Angular consumers to a
  two-object-depth form, automatic `SchemaFormDirective` projection, localized
  object text, canonical accessible IDs and deep controlled operations.
- Updated root/package READMEs and private `0.1.0` candidate notes to describe
  the accepted SPEC-002 boundary and its Experimental source migration.
- Replaced permissive artifact matching with exact per-package file inventories
  and declaration checks for accepted Public exports, retained Angular
  component metadata and absence of Internal root exports.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 46 Markdown files have valid local link targets.
- All 164 core and 58 Angular tests pass (222 total).
- Package smoke, built consumer and exact private artifact checks pass.
- Clean core plus Angular 22.0.6 lower/upper consumers pass after the expected
  restricted-network failure and authorized npm-connected rerun.
- Manifests, dependency/peer/export policy, versions, lockfile, publication
  state and Stable classification remain unchanged.

### Pending

- Start only PLAN-009 checkpoint 7: rerun the complete matrix, inspect the
  whole implementation diff and declarations, correct every finding and repeat
  review/checks until zero findings.

## 2026-07-14 — PLAN-009 checkpoint 5 completed

### Delivery

- Converted `SchemaFormDirective` from a standalone directive to the accepted
  standalone attribute component while retaining its selector, class, inputs,
  outputs, injection role and root export.
- Added Internal node outlets and fixed semantic object hosts that project the
  last accepted definition/snapshot tree atomically, recurse in normalized
  order and isolate synchronous object-host creation/binding failures.
- Added immutable object text projection, full canonical node IDs and
  accessible fieldset/legend/description/hint/tooltip/issues structure.
- Delegated leaves to the existing renderer lifecycle; incompatible ancestors
  now disable native Signal Forms controls and suppress every native/custom
  intention while missing ancestors remain interactive.

### Tests and consumer migration

- Removed manual leaf loops from repository consumers and migrated existing
  directive/native expectations to automatic projection and canonical IDs.
- Added nested Angular coverage for semantic order, deep controlled operations,
  missing/incompatible branches, custom-output suppression, object text
  diagnostics, hostile/lone-surrogate IDs, simultaneous forms, lifecycle
  isolation and rejected replacement atomicity.
- Locked component metadata and absence of Internal object/node symbols from
  the package root.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 164 core and 58 Angular tests pass (222 total).
- Package smoke and built-consumer checks pass; root exports, manifests,
  dependencies, peer ranges and lockfile are unchanged.

### Pending

- Start only PLAN-009 checkpoint 6 with the complete package declaration/docs,
  release-note, artifact and clean-consumer migration.

## 2026-07-14 — PLAN-009 checkpoint 4 completed

### Delivery

- Replaced flat runtime lookup and snapshot construction with iterative nested
  definition indexes, full canonical paths and one immutable node tree whose
  primitive projection preserves exact leaf identity.
- Added shared manual-definition validation and descriptor-safe managed data
  inspection; accessors fail creation/update before validation while missing
  and incompatible business data retain their accepted presence semantics.
- Implemented deep operations and interaction under missing/incompatible
  ancestors, external focus reconciliation, recursive dirty/valid/touched/
  focused state, nearest-object issue assignment and expanding object scopes.
- Preserved controlled-state behavior, listener isolation, unrelated subtree
  sharing and the inactive Angular projection boundary.

### Tests and fixtures

- Migrated the runtime tests to the recursive definition contract and added
  nested tree/projection, presence, action, accessor, issue, scope, focus and
  structural-sharing coverage.
- Added nested missing-operation, incompatible-action and object-scope JSON
  conformance fixtures plus a 1,000-level finite runtime construction/query.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 164 core and 50 Angular tests pass (214 total).
- Package smoke, built-consumer and exact private artifact allowlist checks
  pass.
- No dependency, manifest, lockfile, publication, deferred boundary or Angular
  projection behavior changed.

### Pending

- Start only PLAN-009 checkpoint 5 with recursive Angular 22 projection and
  consumer migration over the accepted nested runtime.

## 2026-07-14 — PLAN-009 checkpoint 3 completed

### Delivery

- Generalized operation paths to non-empty immutable string-only deep paths and
  retained exact validation ordering for malformed envelopes and expectations.
- Added iterative descriptor-safe ancestor/terminal traversal, missing-branch
  materialization for set, incompatible-ancestor diagnostics and accessor
  rejection without getter execution.
- Added bottom-up root-to-leaf cloning that preserves source prototypes,
  off-path descriptors/references and concurrent compatible branch state;
  removal does not create or prune ancestors.
- Integrated the shared nested-definition validator with first-defect runtime
  behavior plus ordered independent-defect collection for form operations,
  exact leaf membership, object-target rejection and primitive compatibility.

### Tests and fixtures

- Migrated all form-operation fixtures to the recursive definition contract and
  made the JSON harness restore only the tree/projection identity that JSON
  cannot encode.
- Replaced the former deep-path rejection fixture with deep set/remove success
  cases and added nested form, object-target and incompatible-ancestor fixtures.
- Added programmatic coverage for materialization, no pruning, accessors,
  arrays/null/primitives, descriptor/prototype preservation, sharing, invalid
  definitions, safe diagnostics and a 1,500-segment path.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 154 core and 50 Angular tests pass (204 total).
- Package smoke, built consumer and exact private artifact allowlist checks
  pass; manifests, dependencies and lockfile are unchanged.

### Pending

- Start only PLAN-009 checkpoint 4 with nested runtime validation, snapshots,
  actions, scopes and structural sharing. Do not start Angular projection.

## 2026-07-14 — PLAN-009 checkpoint 2 completed

### Delivery

- Replaced the flat-only schema pass with an explicit work-stack traversal for
  recursive inline object schemas, complete deep paths and sibling-local
  required sets.
- Added descriptor-safe structural inspection, ordinary-object enforcement,
  active-ancestry schema/UI cycle diagnostics and sibling identity reuse.
- Added iterative structural UI traversal with recursive text precedence,
  incompatibility diagnostics, local order and normalized object nodes.
- Built the recursive immutable definition and its depth-first primitive leaf
  projection with exact shared leaf references; made deep freezing iterative
  and descriptor-safe.

### Tests and fixtures

- Added valid two-depth and malformed nested compiler conformance fixtures and
  migrated the former object-as-unsupported fixture to the still-deferred array
  type.
- Added focused tests for every current leaf family, nested UI order/text/enum,
  schema and UI cycles, sibling reuse, accessor non-execution, frozen identity
  and a 1,500-level finite schema.
- Preserved the complete flat compiler suite and delayed deep operations,
  nested runtime and Angular recursive projection to checkpoints 3–5.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 141 core and 50 Angular tests pass (191 total).
- Package smoke, built consumer and exact private artifact allowlist checks
  pass; manifests, dependencies and lockfile are unchanged.

### Pending

- Start only PLAN-009 checkpoint 3 with descriptor-safe iterative deep
  structural operations and focused operation fixtures. Do not start nested
  runtime or Angular recursive projection.

## 2026-07-14 — PLAN-009 checkpoint 1 completed

### Delivery

- Added and root-exported the accepted Public core recursive definition/UI,
  object/blocked presence, node snapshot, object text and node lookup contracts.
- Added Internal descriptor-safe path helpers and an iterative nested-definition
  validator for cycles, reused identity, duplicate paths, node invariants and
  exact leaf projection identity without retaining caller containers.
- Added the minimal flat compiler/runtime bridge required by the new surface:
  canonical JSON path keys, identity-linked `nodes`/`fields`, leaf `nodeKind`
  and `getNodeSnapshot()` behavior. Recursive compilation remains checkpoint 2.
- Kept the current flat Angular DOM ID behavior through local names; the
  accepted collision-safe nested ID migration remains checkpoint 5.

### Tests and fixture review

- Added five focused contract/helper tests, including accessor non-execution,
  cycles, reuse, projection mismatch and a 1,500-level iterative tree.
- Migrated only serializable flat compiler/runtime expected fixtures to the new
  contract after focused assertions passed, formatted them and reviewed that no
  input fixture changed.
- Updated core and Angular typed test snapshots plus package smoke coverage for
  identity-linked nodes and `getNodeSnapshot()`.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 134 core and 50 Angular tests pass (184 total).
- Package smoke, built consumer and private artifact allowlist checks pass.
- The first clean-consumer attempt lacked npm DNS in the restricted sandbox;
  the authorized rerun passed core plus Angular 22.0.6 lower/upper consumers.
- No manifest, dependency, lockfile, publication or Stable API classification
  changed.

### Pending

- Start only PLAN-009 checkpoint 2 with iterative recursive schema compilation
  and focused schema fixtures before structural UI traversal. Do not start deep
  operations, nested runtime or Angular recursive projection.

## 2026-07-14 — PLAN-009 revision 1 approved

### Approval

- Ricard explicitly approved PLAN-009 revision 1 after repeated complete review
  2 passed all 12 delivery areas and nine acceptance criteria with zero
  findings.
- The approval satisfies the final M9 implementation gate and authorizes only
  the seven ordered checkpoints and boundaries recorded by the plan.

### State and boundaries

- No checkpoint started during this approval task; the active implementation
  plan remains None until checkpoint 1 begins.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- Arrays, refs/composition, advanced layout, batches, dynamic definitions,
  custom object containers, publication and Stable promotion remain inactive.

### Pending

- Start only PLAN-009 checkpoint 1 in a separate task: activate M9, add the
  Public core contracts and shared nested-definition/path helpers, and keep the
  focused build/typecheck baseline green.

## 2026-07-14 — PLAN-009 revision 1 passed repeated complete review

### Plan and first review

- Drafted PLAN-009 as the implementation, migration and verification contract
  for the accepted M9 nested-object boundary.
- Complete review 1 found four delivery gaps: rejected Angular input could split
  definition/snapshot projection, not every neutral tree walk prohibited
  unbounded recursion, the directive-to-component metadata migration lacked
  exact declaration evidence, and ID/object-host assertions were incomplete.
- Advanced the proposal to revision 1 with all four corrections; no accepted
  behavior or public symbol changed.

### Repeated review and boundary

- Restarted the complete review against accepted SPEC-001 v0.1.15, SPEC-002
  v0.1.2, ADR-005 revision 1, ADR-014 revision 2, renderer/API ADRs and deferred
  decisions.
- All 12 delivery areas and nine plan acceptance criteria passed with zero
  findings, requested corrections or documentation conflicts.
- PLAN-009 remains Proposed pending Ricard's explicit approval. M9
  implementation, publication, Stable promotion and every external deferred
  capability remain inactive.

### Verification and pending

- Documentation was formatted and checked for links, authority/state
  consistency and whitespace; no product source, declaration, manifest,
  dependency or lockfile changed.
- Explicitly approve PLAN-009 revision 1 or return it for correction. If
  approved, start only checkpoint 1 in a separate task.

## 2026-07-14 — ADR-014 revision 2 and SPEC-002 v0.1.2 accepted

### Acceptance

- Ricard explicitly accepted ADR-014 revision 2 after its complete ten-area
  review passed with zero findings.
- Ricard then explicitly accepted SPEC-002 v0.1.2 after its repeated 16-area
  review passed with zero findings.
- The ordered acceptance makes the clarified nested-object architecture and
  observable M9 extension authoritative.

### Authorization and boundaries

- The M9 normative gate is complete and PLAN-009 may now be prepared.
- No implementation plan is approved and M9 implementation remains inactive.
- Public changes remain Experimental + Active; no package publication, Stable
  promotion, array/ref/composition/layout/batch/dynamic-definition capability
  or other deferred work was activated.
- Unchanged SPEC-001 v0.1.15 behavior and ADR-005 revision 1 remain
  authoritative alongside the accepted M9 extension.

### Verification

- Formatting, all 44 Markdown files and 196 local links, acceptance/state
  consistency and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed; PLAN-009 remains absent and implementation inactive.

### Pending

- Draft PLAN-009 as the exact implementation and verification contract.
- Repeat its complete review after every correction and do not implement M9
  before explicit plan approval.

## 2026-07-14 — SPEC-002 corrections applied; repeated review 2 passed

### Corrections

- Ricard approved all six findings from complete SPEC review 1.
- Proposed ADR-014 revision 2 as a narrow clarification: missing-ancestor
  branches allow set/focus/blur and no-effect remove, while incompatible-ancestor
  branches suppress every mutation and interaction intention.
- Advanced SPEC-002 to Draft v0.1.2 with closed runtime-action diagnostics,
  recursive UI incompatibility diagnostics, object text failure diagnostics,
  the exact `getNodeSnapshot()` signature, cross-field structural sharing and
  native/custom renderer behavior.
- Expanded required conformance coverage from 12 to 15 scenarios.

### Repeated review

- Reviewed all ten ADR-014 areas for proposed revision 2 and all 16 SPEC-002
  areas after correction.
- Both complete reviews passed with zero findings, requested corrections or
  documentation conflicts.
- ADR-014 revision 2 remains Proposed and SPEC-002 remains Draft; neither was
  silently accepted.

### Verification

- Formatting, all 44 Markdown files and 196 local links, authority/state
  consistency and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.

### Boundaries and pending

- SPEC-001 v0.1.15 remains authoritative behavior. PLAN-009 is not drafted and
  M9 implementation remains inactive.
- Arrays, refs/composition, layout, batches, dynamic definitions, custom object
  containers, Stable promotion and publication remain inactive.
- The exact next action is explicit acceptance or rejection of ADR-014 revision
  2, followed—if accepted—by explicit acceptance or rejection of SPEC-002 Draft
  v0.1.2.

## 2026-07-14 — SPEC-002 complete review 1 found six issues

### Review result

- Completed the separate full review of SPEC-002 Draft v0.1.1 against accepted
  SPEC-001 v0.1.15, ADR-014 revision 1, ADR-005 revision 1, applicable renderer,
  Angular/API decisions and deferred boundaries.
- Review 1 does not pass. SPEC-002 remains Draft and cannot be accepted until a
  repeated complete review reaches zero findings.
- Recorded six findings covering blocked runtime-action diagnostics, recursive
  UI incompatibility diagnostics, object text failure diagnostics, the exact
  `getNodeSnapshot()` signature, cross-field validation structural sharing and
  blocked-presence custom-renderer behavior.

### Conflict and boundaries

- Missing-ancestor leaves are explicitly allowed to emit set/focus/blur, while
  the ADR-014/SPEC-002 migration wording can suppress intentions for all blocked
  presence. Because ADR-014 is Accepted, the clarification requires explicit
  approval and a reviewed ADR revision rather than a silent SPEC edit.
- The promoted nested-object boundary otherwise remains coherent. Arrays,
  refs/composition, layout, batches, dynamic definitions, custom object
  containers, Stable promotion and publication remain inactive.
- No product source, public declaration, package manifest, dependency, lockfile
  or accepted behavior changed during the review.

### Verification

- Formatting, all 44 Markdown files and 195 local links, authority/state
  consistency and `git diff --check` pass.
- SPEC-002 remains Draft v0.1.1, PLAN-009 is not drafted and no M9
  implementation task is active.

### Pending

- Ricard must approve, revise or reject the six recommended corrections.
- If approved, clarify ADR-014, advance SPEC-002 to Draft v0.1.2 and repeat the
  full review after correction. Do not draft PLAN-009 or implement M9 yet.

## 2026-07-14 — ADR-014 revision 1 and ADR-005 revision 1 accepted

### Decision

- Ricard followed the zero-finding joint review 3 recommendation and explicitly
  accepted ADR-014 revision 1 and ADR-005 revision 1 coordinately.
- The normalized nested-object/deep-path architecture and recursive inline
  Draft 2020-12 policy are now authoritative M9 design decisions.
- Acceptance provides normative alignment only: it does not accept SPEC-002,
  approve PLAN-009, authorize code changes or activate publication.

### Authority and boundaries

- SPEC-001 v0.1.15 remains the behavioral source of truth and nested objects
  remain unsupported until SPEC-002 passes its separate review and acceptance.
- D-014 now records the accepted narrow tree/projection choice while retaining
  all broader intermediate-model questions as Research.
- Arrays, refs/composition, layout, batches, dynamic definitions and all other
  deferred capabilities remain inactive.

### Verification

- Formatting, all 43 Markdown files and 190 local links, accepted-state and
  authority consistency, and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- SPEC-002 remains Draft; PLAN-009 and M9 implementation remain inactive.

### Pending

- Perform the separate complete review of SPEC-002 Draft v0.1.1 and repeat
  after every correction until zero findings.
- Do not draft PLAN-009 or implement M9 before SPEC-002 is explicitly accepted.

## 2026-07-14 — M9 acceptance sequence corrected; joint review 3 passed

### Correction

- The formal acceptance audit found a circular process sentence: proposed
  ADR-005 tied its authority to SPEC-002, while SPEC-002 requires both ADRs to
  be accepted before its separate review.
- Ricard approved the minimal correction. ADR-005 now coordinates its explicit
  acceptance with ADR-014 and places SPEC-002 review/acceptance afterward.
- No architectural decision, observable behavior, API, deferred boundary or
  implementation authorization changed.

### Repeated review

- Repeated the complete joint review across all ten ADR-014 and eight ADR-005
  acceptance areas after the process correction.
- Review 3 passed with zero findings, requested corrections or documentation
  conflicts.
- ADR-014 revision 1 and ADR-005 revision 1 remain Proposed and are technically
  ready for coordinated explicit acceptance.

### Verification

- Formatting, all 43 Markdown files and 190 local links, active-state and
  acceptance-sequence consistency, and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- Neither ADR, SPEC-002, PLAN-009 nor M9 implementation was activated.

### Boundaries and pending

- SPEC-002 remains Draft v0.1.1; PLAN-009 and M9 implementation remain
  inactive.
- The exact next action is explicit acceptance or rejection of both ADRs,
  followed—if accepted—by the separate complete SPEC-002 review.

## 2026-07-14 — M9 ADR corrections applied; repeated review 2 passed

### Decision and corrections

- Ricard approved all ten corrections from joint review 1, including blocked
  presence for descendant objects and bounded Angular creation/binding failure
  isolation.
- Advanced ADR-014 to revision 1 and SPEC-002 to Draft v0.1.1; corrected only
  the Proposed revision 1 section of ADR-005 and preserved accepted sections
  1–9.
- Closed total DOM identity, on-path descriptors, dirty/focus behavior, the
  Internal Angular host mechanism, exact API migration, nested keyword
  classification, diagnostic contracts, D-014 traceability and terminal-only
  concurrency consequences.

### Repeated review

- The first correction check repaired root-enum classification, directive
  creation wording, transitive API inventory and the reused-node diagnostic
  reason without changing scope.
- Repeated the complete joint review after those repairs.
- Review 2 passed all ten ADR-014 and eight ADR-005 acceptance areas with zero
  findings or requested corrections.

### Boundaries

- ADR-014 revision 1 and ADR-005 revision 1 remain Proposed pending explicit
  acceptance; SPEC-002 remains Draft and M9 implementation remains inactive.
- Arrays, refs/composition, layout, batches, dynamic definitions, publication
  and all unrelated deferred capabilities remain inactive.

### Verification

- Formatting, all 43 Markdown files and 190 local links, active-state
  consistency and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- The final repeated joint review has zero findings; neither ADR was silently
  accepted.

### Pending

- Explicitly accept or reject both ADR proposals.
- If accepted, review SPEC-002 Draft v0.1.1 separately and completely before
  preparing PLAN-009.

## 2026-07-14 — M9 joint ADR formal review 1 completed

### Review result

- Formally reviewed ADR-014 revision 0 and proposed ADR-005 revision 1 against
  their acceptance matrices, SPEC-001/SPEC-002, ADR-007/008/009 and deferred
  boundaries.
- Review 1 does not pass and neither proposal is accepted.
- Recorded ten findings covering DOM identity totality, descriptors, blocked
  dirty, focus reconciliation, Angular isolation, public API inventory, nested
  keyword classification, diagnostics, D-014 traceability and concurrency
  trade-offs.

### Passed boundaries

- The promoted inline-object/current-leaf boundary remains coherent.
- Framework neutrality, controlled state, structural UI grouping and
  terminal-only operation direction remain viable.
- Arrays, refs/composition, layouts, scopes metadata, batches, dynamic
  definitions, custom object renderers, publication and licensing remain
  inactive.

### Verification

- Formatting, all 43 Markdown files and 190 local links, active-state
  consistency and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- No proposed decision text was changed; all ten review findings remain open.

### Pending

- Ricard must approve or revise the ten recommended corrections.
- After correction, increment ADR-014 to revision 1 and SPEC-002 to Draft
  v0.1.1, then repeat the complete joint review until zero findings.

## 2026-07-14 — D-005 promoted and M9 normative drafts prepared

### Decision

- Ricard explicitly accepted the M9 promotion review.
- D-005 is Promoted for design under the reviewed inline-object/current-leaf
  boundary; M9 implementation remains inactive.
- The acceptance authorizes normative drafting only, not PLAN-009, code changes
  or publication.

### Drafted

- Proposed ADR-014 revision 0 for the normalized node tree, identity-linked
  leaf projection, canonical keys, deep operations, branch state, scopes and
  fixed Angular object hosts.
- Proposed ADR-005 revision 1 while preserving sections 1–9 as the Accepted
  baseline; the proposal adds recursive inline traversal, cycle handling and
  deterministic deep diagnostics.
- Drafted SPEC-002 v0.1.0 as the non-authoritative observable M9 extension to
  SPEC-001.

### Drafting corrections

- Distinguished focus/touched behavior below missing versus incompatible
  ancestors and disabled incompatible Angular branches.
- Required deterministic non-blank object labels, including blank property-name
  fallback.
- Added active-ancestry cycle handling for recursive UI Schema.
- Reused existing definition and accessor diagnostic envelopes instead of
  introducing overlapping codes.
- Rejected managed accessors in external value/baseline trees before validation
  while retaining incompatible data properties as business state.

### Verification

- Formatting, all 42 Markdown files and 187 local links, state consistency and
  `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- The cross-document drafting review was repeated after corrections without a
  remaining drafting inconsistency; formal ADR review 1 is still pending.

### Pending

- Formally review ADR-014 revision 0 and ADR-005 revision 1 together, repeat
  after every correction until zero findings, then review SPEC-002.
- Do not draft PLAN-009 or implement M9 before all three normative documents are
  accepted.

## 2026-07-14 — D-005/M9 promotion boundary reviewed

### Completed

- Reviewed full SPEC-001 v0.1.15, ADR-005 and applicable accepted ADRs against
  the root-only compiler, operations, runtime and Angular adapter.
- Confirmed that D-005's resumption condition is satisfied and that nested
  objects are eligible for explicit promotion, but did not promote or activate
  M9.
- Defined the smallest coherent boundary as recursive inline objects with the
  current primitive leaves and string-only deep paths.
- Kept arrays, references/composition, advanced layouts, declarative scopes,
  batches, dynamic definitions, plugins and publication outside M9.
- Identified nine required decision areas and the document sequence ADR-014,
  ADR-005 revision 1, SPEC-002 and PLAN-009.

### Findings

- Implementation is normatively blocked until SPEC-002 is accepted because
  SPEC-001 explicitly excludes nested objects and deep operations.
- ADR-005 requires review when objects are promoted; its recursive inspection
  and diagnostic policy must be resolved before implementation.
- No documentation conflict exists while D-005 remains Candidate and M9 stays
  inactive.

### Verification

- Repeated the complete promotion review after corrections; the final pass has
  zero findings or requested changes.
- Formatting, all 40 Markdown files and 172 local links, state consistency and
  `git diff --check` pass.
- No product source, public API, manifest, dependency, lockfile or accepted
  decision changed.

### Pending

- Ricard must accept or reject the reviewed promotion boundary. Acceptance may
  promote D-005 for design work but will not authorize implementation.

## 2026-07-14 — PLAN-008 and M8 completed

### Completed

- Prepared both packages as private independent `0.1.0` local candidates.
- Moved core from Angular runtime dependencies to peer + dev dependency and
  aligned Angular peers to `>=22.0.6 <23.0.0` without upgrading dependencies.
- Added package-local Experimental/no-distribution READMEs and candidate release
  notes with the exact compatibility matrix.
- Added deterministic tarball allowlist/manifest checks and isolated core,
  Angular lower and Angular upper consumers using strict peers and pnpm 10.28.2.
- Resolved the upper stable Angular endpoint as `22.0.6`, equal to the lower
  endpoint, and verified the aligned tuple in both consumers.
- Completed PLAN-008 revision 2 and M8 without publishing, distributing,
  licensing, changing product source or promoting API stability.

### Corrections and final review

- Added `rxjs@7.8.2` only to the temporary Angular consumers to satisfy
  Angular's own strict peer contract.
- Corrected the consumer's typed parent injector, credential sanitization, pnpm
  assertion and stale root version text.
- Repeated the complete matrix after corrections; the final review has zero
  findings or requested changes.

### Verification

- Frozen install, format, lint, typecheck, 179 tests, builds, package smoke,
  existing consumer, artifact checks and all three clean consumers pass.
- Tarballs contain only package manifest, README and allowed `dist` output;
  transformed manifests contain no `workspace:` specifier.
- Lower/upper evidence is Angular `22.0.6`, resolved 2026-07-14 from public npm
  metadata with aligned Angular packages and no credentials.
- No remote mutation, external tarball distribution, registry configuration,
  license, provenance, tag or GitHub Release occurred.

### Pending

- Review the D-005/M9 nested-object promotion boundary. D-040 remains Deferred
  until publication is explicitly requested.

## 2026-07-14 — PLAN-008 revision 2 approved and M8 started

### Decision

- Ricard explicitly approved PLAN-008 revision 2 after its second repeated
  review passed with zero findings.
- M8 implementation is active only for private local `0.1.0` candidates,
  artifact verification and the clean-consumer matrix.
- Publication, external distribution, license, registry writes, credentials,
  provenance, tags and Stable API promotion remain unauthorized.

### Pending

- Implement PLAN-008 steps 2–6 and close M8 only after the complete matrix and
  final repeated review pass.

## 2026-07-14 — ADR-013 accepted and PLAN-008 revision 2 reviewed

### Completed

- Recorded Ricard's explicit acceptance of ADR-013 revision 1 without changing
  manifests or activating M8.
- Formally reviewed PLAN-008 against accepted ADR-009/010/013, the manifests,
  artifact boundary, clean-consumer matrix, D-034/D-040 and publication safety.
- Corrected public read-only registry access, the exact stable upper Angular
  endpoint, strict isolated peer installation and local no-distribution
  documentation.
- The first repetition found four stale `latest patch` phrases; revision 2
  normalizes them and the second complete repetition passes all eight areas.
- PLAN-008 remains Proposed revision 2; review completion does not approve it or
  activate M8.

### Verification

- Documentation formatting, all 36 Markdown documents and 168 local links,
  state/revision consistency and `git diff --check` pass.
- No manifest, dependency, lockfile, product source, export, version,
  publication setting or API stability state changed.

### Pending

- Ricard must explicitly approve PLAN-008 revision 2 before M8 implementation
  can begin.

## 2026-07-14 — ADR-013 revision 1 passed formal review

### Completed

- Reviewed ADR-013 against SPEC-001, ADR-006/009/010, current manifests,
  D-034/D-040, M8 scope and publication safety.
- Corrected three findings: read-only registry access versus remote mutation,
  the exact stable upper Angular version rule, and the no-license/no-external-
  distribution boundary for local tarballs.
- Repeated all eight areas successfully. ADR-013 remains Proposed revision 1;
  the review does not accept it, approve PLAN-008 or activate M8.

### Verification

- Documentation formatting, all 36 Markdown documents and 168 local links,
  review/state consistency and `git diff --check` pass.
- No manifest, dependency, lockfile, product source, export, version,
  publication setting or API stability state changed.

### Pending

- Ricard must explicitly accept ADR-013 revision 1 before PLAN-008 receives its
  formal review.

## 2026-07-14 — M8 scope reviewed and ADR-013/PLAN-008 drafted

### Completed

- Committed completed PLAN-007/M7 as `d90a834` with Rabassoft authorship.
- Reviewed M8 against SPEC-001, ADR-006/009/010, D-028/D-029 and the real
  package manifests and build outputs.
- Drafted ADR-013 and PLAN-008 revision 0 for private `0.1.0` candidate
  tarballs, exact peer metadata, artifact inspection and clean consumers at the
  Angular 22 lower and latest-in-range endpoints.
- Identified the current core dependency placement and Angular lower peer bound
  as the two manifest conflicts M8 must correct; no manifest was changed.
- Registered actual publication as D-040 so license, registry, access,
  provenance, credentials, tags and automation remain explicitly deferred.
- Corrected stale root README and non-normative SPEC prose that still described
  M7 as pending.

### Review and verification

- The initial eight-area M8 scope review passes without an unresolved drafting
  finding; it does not accept ADR-013, approve PLAN-008 or activate M8.
- Documentation formatting and `git diff --check` pass.
- All 36 Markdown documents and 168 local links resolve.
- Package manifests, dependencies, lockfile, runtime source, exports, versions,
  publication settings and API stability remain unchanged in this planning
  checkpoint.

### Pending

- Formally review ADR-013 revision 0 and repeat after any correction until a
  complete pass has zero findings. PLAN-008 review and approval follow only
  after the ADR is accepted.

## 2026-07-14 — PLAN-007 and M7 completed

### Completed

- Added the Public + Experimental `clear` text member and required Angular
  `clearLabel` with exact non-blank fallback diagnostics.
- Added presence-driven localized clear buttons, deterministic label/action IDs,
  accessible names, and focus-before-remove behavior to all four native
  renderers.
- Pinned outlet outputs to captured field/runtime identities, reconciled
  same-runtime focused detach, and deactivated bindings before destruction so
  stale callbacks cannot target a replacement field or runtime.
- Covered missing, falsy, required, incompatible, enum, numeric-empty,
  controlled confirmation/rejection, pointer/keyboard, focus/touched, locale,
  lifecycle, custom renderer, package, and built-consumer behavior.
- Completed PLAN-007 revision 2 and M7 without promoting APIs to Stable or
  activating another deferred capability.

### Verification

- Frozen installation passed with the lockfile unchanged after network access
  restored the local dependency tree.
- Formatting, lint, typecheck, 129 core tests, 50 Angular tests, both builds,
  package smoke, and the built-package consumer pass.
- Declaration inspection shows only `FieldTextMember: 'clear'` and required
  `AngularFieldTextSnapshot.clearLabel`; entry points and export maps are
  unchanged.
- Core isolation, Angular Signal Forms imports, dependency/package boundaries,
  all 34 Markdown files and 156 local links, and `git diff --check` pass.
- The final full review was repeated after correcting its only lint finding and
  completed with zero findings or requested changes.

### Pending

- Select and review the next post-M7 milestone. M8 remains a proposal and does
  not authorize publication.

## 2026-07-14 — PLAN-007 revision 2 approved and M7 started

### Decision

- Ricard explicitly approved PLAN-007 revision 2 after its corrected second
  review completed with zero findings.
- M7 implementation begins with the neutral and Angular clear-text contracts;
  every other deferred capability remains inactive.
- The persistent delivery workflow now requires complete review repetition
  after every correction until a full pass produces no findings or requested
  changes; only then may work be approved or completed.

### Boundary

- Approval authorizes only PLAN-007's six steps and exact production boundary.
- It does not authorize publication, new dependencies, new entry points, or API
  promotion to Stable.

### Pending

- Implement, test, and verify M7 before marking PLAN-007 or the milestone
  complete.

## 2026-07-14 — PLAN-007 revision 2 passed second review

### Completed

- Repeated the full PLAN-007 review independently, emphasizing outlet lifecycle,
  focus/blur ordering, public declarations, and transition races.
- Found that existing output callbacks resolve the current reactive field path,
  so an old renderer event could target an incoming field during replacement.
- Corrected the plan to capture field path and runtime identity per
  `ComponentRef` and use that identity for all four outputs and focus cleanup.
- Repeated all eight formal areas successfully. PLAN-007 remains Proposed
  revision 2 and M7 implementation remains inactive.

### Verification

- Documentation formatting, local links, revision/approval state,
  contract-consistency and stale-path searches, product-diff scope, and
  `git diff --check` pass.
- No product code, accepted SPEC/ADR, public declaration, package, dependency,
  lockfile, or publication setting changed.

### Pending

- Explicitly approve PLAN-007 revision 2 or return it for correction. Do not
  implement M7 before approval.

## 2026-07-14 — PLAN-007 revision 1 passed formal review

### Completed

- Reviewed PLAN-007 against all eight areas, SPEC-001 v0.1.15, ADR-009/012,
  completed PLAN-004/005/006, current declarations, text projection, outlet,
  native renderers, and controlled runtime boundaries.
- Corrected the complete clear-text diagnostic shape, including its existing
  fallback message.
- Closed the focus-destruction gap with a private same-runtime outlet rule that
  blurs the previously bound focused path before detach while preventing stale
  paths from reaching a replacement runtime.
- Repeated all eight areas successfully. PLAN-007 remains Proposed revision 1;
  review completion does not approve or activate M7 implementation.

### Verification

- Documentation formatting, local links, proposal/review/approval state,
  contract-consistency searches, product-diff scope, and `git diff --check`
  pass.
- No product code, accepted SPEC/ADR, public declaration, package, dependency,
  lockfile, or publication setting changed.

### Pending

- Explicitly approve PLAN-007 revision 1 or return it for correction. Do not
  implement M7 before approval.

## 2026-07-14 — PLAN-007 drafted for M7 review

### Completed

- Drafted PLAN-007 as Proposed against SPEC-001 v0.1.15, ADR-009, ADR-012
  revision 1, and the existing core/Angular contracts.
- Fixed the exact public Experimental text extensions, clear-text diagnostic,
  focus-before-output ordering, deterministic accessible IDs, per-renderer
  behavior, controlled confirmation/rejection, implementation boundary, tests,
  and package/declaration checks.
- Confirmed that M7 reuses the existing `remove-value`, runtime request, Angular
  output, and outlet flow without authorizing a new core or public action
  contract.

### Verification

- Documentation formatting, local links, plan/state consistency, product-diff
  scope, and `git diff --check` pass.
- No product code, accepted SPEC/ADR, package, dependency, lockfile, or
  publication setting changed.

### Pending

- Review PLAN-007's eight formal areas, apply any corrections, repeat the
  checklist, and explicitly approve it before implementation.

## 2026-07-14 — ADR-012 accepted and D-010 promoted to M7

### Decision

- Ricard accepted ADR-012 revision 1 after its three review corrections and
  successful repetition of all eight acceptance criteria.
- D-010 is Promoted and M7 has an accepted architectural boundary for explicit
  native field clearing.
- SPEC-001 advances to Accepted v0.1.15 with normative clear text, controlled
  removal, native renderer, focus, accessibility, diagnostic, API, and M7
  acceptance contracts.
- Acceptance authorizes preparation of PLAN-007, not implementation,
  publication, new core operations, or API promotion to Stable.

### Verification

- Formatting, all Markdown links, accepted/proposed state consistency, version
  consistency, and `git diff --check` pass.
- No product code, executable public contract, package, dependency, or lockfile
  changed.

### Pending

- Draft, review, and approve PLAN-007 before implementing M7.

## 2026-07-14 — ADR-012 revision 1 passed formal review

### Completed

- Reviewed ADR-012 against its eight acceptance criteria and the current
  operation, runtime, renderer, text, focus, declaration, ADR, and SPEC
  boundaries.
- Required and incorporated three precisions: focus is requested before the
  synchronous remove output; deterministic label/action IDs define the
  accessible name; and clear-text diagnostics plus the required snapshot-member
  migration are exact.
- Repeated all eight areas successfully: core reuse, required/validation,
  presence, controlled flow, focus/accessibility, localization, public API, and
  exclusions.
- Kept ADR-012 Proposed revision 1, D-010 Candidate, and M7 inactive pending an
  explicit acceptance decision.

### Verification

- Formatting, all 33 Markdown documents and their 149 local links,
  state-consistency searches, and `git diff --check` pass.
- No code, accepted SPEC/ADR, public contract, package, dependency, or lockfile
  changed.

### Pending

- Explicitly accept or reject ADR-012 revision 1. Acceptance would promote
  D-010/M7 and authorize SPEC synchronization, not implementation.

## 2026-07-14 — ADR-012 proposed for explicit native field clearing

### Completed

- Reviewed D-010 against accepted SPEC-001, ADR-009/011, PLAN-004/005/006, the
  existing `remove-value` operation, runtime action, Angular renderer contract,
  text projection, and all four native renderers.
- Drafted ADR-012 as Proposed with a narrow M7 boundary: reuse `removeValue`,
  preserve controlled confirmation/rejection, distinguish falsy values from
  missing, permit required-field removal, and add an accessible localizable
  native action.
- Kept the core operation/runtime unchanged and limited the proposed public
  contract change to `FieldTextMember: 'clear'` and
  `AngularFieldTextSnapshot.clearLabel`, both Experimental under ADR-009.
- Recorded focus integrity, TextResolver fallback, package/declaration checks,
  and type-specific behavior as mandatory PLAN-007 evidence.

### Verification

- Documentation formatting, local links, status consistency, and
  `git diff --check` pass.
- No code, SPEC, accepted ADR, package, public API, dependency, or lockfile was
  changed.

### Pending

- Review ADR-012's eight acceptance criteria. D-010 remains Candidate and M7
  remains inactive until explicit acceptance.

## 2026-07-14 — G0 passed and SPEC-001 v0.1.14 accepted

### Completed

- Repeated the complete end-to-end review of corrected SPEC-001 v0.1.14 against
  accepted plans, applicable ADRs, public contracts, implementation,
  declarations, deferred boundaries, and executable evidence.
- Confirmed that D-038/D-039 resolve the two unimplemented helper promises
  without promoting them and that `SubscribeResult` matches PLAN-003 and every
  executable public surface.
- Found no new or remaining normative, evidence, implementation, declaration,
  ADR, plan, or deferred-boundary issue.
- Completed G0 and marked SPEC-001 v0.1.14 Accepted without promoting any API to
  Stable or activating a post-G0 milestone.

### Verification

- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 14 files and 176 tests (129 core, 47 Angular).
- Both builds, `pnpm test:package`, and `pnpm test:consumer` passed.
- Declaration, package-boundary, framework-boundary, local-link, and diff checks
  passed; no product, package, dependency, or lockfile change was introduced.

### Pending

- Decide whether to promote D-010 as M7 or explicitly select another proposed
  post-G0 milestone before preparing any ADR or implementation plan.

## 2026-07-14 — G0 normative findings resolved in documentation

### Completed

- Applied Ricard's approved disposition of G0-F001 and removed the unimplemented
  `commitScopeToBaseline()` promise from the prototype contract while keeping
  baseline ownership in the application; recorded the future helper as D-038.
- Applied the approved disposition of G0-F002 and documented the implemented
  metadata-only treatment of `default`; recorded explicit default application
  as D-039 without introducing `applySchemaDefaults()`.
- Applied the approved disposition of G0-F003 by aligning SPEC-001 subscriptions
  with PLAN-003 and the executable `SubscribeResult` public contract.
- Advanced SPEC-001 and its index to Draft v0.1.14. No product code, public API,
  dependency, package, lockfile, or deferred implementation changed.

### Verification

- Formatting and `git diff --check` pass.
- All 32 Markdown documents and 143 local links resolve.
- Targeted searches confirm the prototype no longer promises either deferred
  helper and the runtime subscription signature matches `SubscribeResult`.

### Pending

- Repeat the G0 end-to-end acceptance review against corrected SPEC-001 Draft
  v0.1.14 and mark it Accepted only if no finding remains.

## 2026-07-14 — G0 verification passed; acceptance blocked

### Completed

- Repeated the full G0 verification successfully: frozen install, format, lint,
  typecheck, 176 tests, package builds and smoke tests, consumer test,
  declarations, public surfaces, architectural boundaries, links, and diff
  integrity.
- Reviewed SPEC-001 Draft v0.1.13 end to end against accepted plans, public
  contracts, implementation, declarations, and evidence.
- Recorded three blocking normative findings in the G0 evidence document:
  G0-F001 for missing `commitScopeToBaseline()`, G0-F002 for missing
  `applySchemaDefaults()`, and G0-F003 for the `Unsubscribe`/`SubscribeResult`
  conflict.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed with the lockfile unchanged;
  198 packages were reused and none downloaded.
- Formatting, linting, typecheck, 14 test files and 176 tests passed (129 core,
  47 Angular).
- Both package builds, package smoke tests, and the built-package consumer
  passed; declarations and package boundaries remained intact.
- All 32 Markdown documents and 141 local links passed; `git diff --check`
  passed before recording this documentation checkpoint.

### Pending

- Decide and approve the separate disposition of G0-F001, G0-F002, and G0-F003
  before changing SPEC-001 or implementation behavior.
- Repeat G0 after those conflicts are resolved; SPEC-001 remains Draft v0.1.13.

## 2026-07-14 — G0 minimal Angular consumer passed

### Completed

- Added a reproducible `pnpm test:consumer` command that builds both public
  packages before running the consumer integration.
- Added a consumer host that imports only the core and Angular package roots,
  compiles a root schema with all four primitive kinds, renders native controls,
  applies an emitted `set-value`, and confirms the external value.
- Kept the test under the existing Angular package so package self-resolution
  loads `dist` without adding a workspace package, dependency, or lockfile entry.

### Verification

- `pnpm test:consumer` passed: both package builds plus 1 test file and 1 test.
- `pnpm lint` and `pnpm typecheck` passed for the workspace.
- The consumer contains no workspace `src` import and no product source, public
  contract, dependency, lockfile, version, or publication setting changed.

### Pending

- Run the complete frozen-install, format, test, package, declaration, boundary,
  link, and diff verification required by G0.
- Review SPEC-001 end to end before acceptance.

## 2026-07-14 — G0 acceptance evidence matrix completed

### Completed

- Mapped all 22 SPEC-001 walking-skeleton acceptance criteria to direct tests,
  conformance fixtures, implementation boundaries, or package evidence.
- Found no acceptance-criterion evidence gap during the inventory; kept the
  distinction between mapped evidence and a passing G0 execution.
- Added a persistent G0 review document with fail-closed assessments and the
  remaining gate requirements.

### Verification

- Formatting, all 32 Markdown files and their local links, state consistency,
  and `git diff --check` pass for the documentation-only matrix checkpoint.
- No code, public contract, package, dependency, lockfile, publication setting,
  or deferred capability changed.

### Pending

- Implement and run the minimal Angular consumer against built package entry
  points, without workspace `src` imports.
- Repeat full verification and review SPEC-001 end to end before acceptance.

## 2026-07-14 — G0 formal prototype closure approved

### Decision

- Ricard explicitly approved G0 as the active post-M6 review gate.
- G0 is limited to acceptance evidence for the already implemented SPEC-001
  boundary: the 22-criterion matrix, a minimal Angular consumer, full
  verification, and an end-to-end specification review.
- Acceptance is fail-closed: any finding keeps SPEC-001 Draft and becomes
  separate work before the review can be repeated.
- The approval does not change behavior, promote public APIs to Stable, prepare
  publication, activate M7-M12, or promote a deferred decision.

### Verification

- Formatting, all local Markdown links, state consistency, and
  `git diff --check` pass for the approval checkpoint.

### Pending

- Prepare the G0 evidence matrix mapping all 22 SPEC-001 acceptance criteria to
  existing evidence or an explicit gap.

## 2026-07-14 — Post-M6 state and proposed roadmap clarified

### Completed

- Synchronized STATUS with pushed revision `180fe87`, where `develop` and
  `origin/develop` now coincide, without changing executable code.
- Replaced the obsolete M1-only root README description with the implemented
  M1-M6 core, Angular 22, native renderer, package, and deferred boundaries.
- Corrected the present-tense SPEC-001 lifecycle narrative to record M6 as
  completed while preserving Draft v0.1.13 and its historical version entry.
- Added a proposed G0/M7-M12 dependency order to ROADMAP and cross-referenced it
  from the deferred register without approving, activating, or promoting any
  future item.

### Verification

- Formatting, local Markdown links, stale M6/M1/checkpoint references, and
  `git diff --check` pass for the documentation-only checkpoint.
- The prior M6 code verification remains unchanged: 175 tests, builds, package
  smoke, declaration inspection, and architectural boundary checks passed.

### Pending

- Review and explicitly approve whether G0 formal prototype closure becomes the
  next active effort; the roadmap proposal alone authorizes no implementation.

## 2026-07-14 — M6 closure committed

### Completed

- Committed the reviewed PLAN-006 step-6 implementation, zoneless post-render
  correction, full integration/package coverage, and M6 lifecycle closure as
  `feat(angular): complete string enum support`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>` and performed no
  push.
- Synchronized the compact project checkpoint within the same final commit so
  the repository closes M6 with a clean working tree and no active task.

### Verification

- The committed scope is the previously accepted 10-file diff and retains the
  completed frozen-install, formatting, linting, type-checking, 175-test,
  build, package-smoke, declaration, boundary, link, and diff verification.

### Pending

- Select and approve the next milestone separately; no deferred capability is
  active.

## 2026-07-14 — Final M6 diff review passed

### Completed

- Re-reviewed the complete uncommitted PLAN-006 step-6 implementation,
  post-render correction, integration coverage, package smoke changes, and M6
  lifecycle documentation.
- Confirmed that the Angular change affects only controlled presentation-token
  reconciliation after dynamic options render and does not alter core state,
  validation, operations, or deferred scope.
- Found no correctness, accessibility, lifecycle, public-surface, test,
  documentation, or diff-integrity issue requiring correction.

### Verification

- The preceding final acceptance remains current: frozen installation,
  formatting, linting, type checking, 175 tests, builds, package smoke,
  declaration and boundary inspection, 31 Markdown links, and diff checks all
  passed.
- `git diff --check` passes after the review checkpoint update.

### Pending

- Commit the reviewed step-6 and M6 closure diff only when explicitly
  requested; select the next milestone separately.

## 2026-07-14 — PLAN-006 and M6 completed

### Completed

- Executed PLAN-006 step 7 final acceptance after reading the complete approved
  plan and reviewing the uncommitted step-6 correction and coverage diff.
- Confirmed the complete M6 pipeline from direct string `enum` and optional
  `enumLabels` through immutable choices, runtime structural validation,
  resolved choice texts, ranked renderer selection, and the controlled native
  select.
- Inspected generated core and Angular declarations: the expected neutral
  contracts and `SchemaStringEnumRendererComponent` are exported from existing
  roots, while registration and token helpers remain internal.
- Repeated all eight acceptance areas and found no remaining scope, contract,
  diagnostic, structural-safety, control, accessibility, Angular, package, or
  delivery finding.
- Marked PLAN-006 and ROADMAP milestone M6 completed and synchronized the
  promoted D-008 entry without changing SPEC-001 Draft v0.1.13 or ADR-011.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed with all 198 packages reused
  and no lockfile change.
- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 13 files and 175 tests, comprising 129 core and 46
  Angular tests.
- Core declarations expose `StringChoiceDefinition`, `choices`, `enumLabels`,
  and exclusive choice text contexts; Angular declarations expose frozen choice
  labels and the fixed `schema-string-enum-renderer` component metadata.
- Core retains zero runtime dependencies and no framework, RxJS, DOM, or browser
  import; Angular Forms imports remain limited to `@angular/forms/signals`.
- No raw schema reaches a renderer or tester, no enum-membership business
  validation entered operations/runtime actions/Signal Forms/select, and all
  deferred exclusions remain inactive.
- No dependency, lockfile, version, peer range, entry point, export map,
  publication setting, or generated-output tracking changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Review and commit the verified step-6 and M6 closure diff when explicitly
  requested; select the next milestone separately.

## 2026-07-13 — M6 PLAN-006 step 6 completed

### Completed

- Added resolver coverage for ordinary and enum strings plus consumer
  overrides at rank 10, equal rank 20 with registration order, rank 20 with
  positive priority, and rank 21.
- Exercised the select through `SchemaFormDirective`, the field outlet,
  `AngularRendererResolver`, and Angular component creation rather than direct
  construction.
- Covered missing, external out-of-enum, empty, whitespace, first/later choice,
  rejection, external confirmation, locale, focus, blur, issues, and controlled
  no-optimistic-mutation behavior.
- Verified the disabled placeholder sentinel, labels, description, hint,
  tooltip, deterministic IDs, `aria-describedby`, `aria-invalid`,
  `aria-required`, issue live region, and `focusBoundControl()` delegation.
- Verified standard and explicit zoneless TestBed configurations, malformed and
  out-of-range token isolation, component/view destruction, and listener
  cleanup.
- Extended package smoke to require the Public Experimental component export
  while keeping registration and token helpers absent from the package root.
- Corrected initial zoneless selection by moving controlled token reset to an
  Angular post-render write phase, after the dynamic options are present.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 13 files and 175 tests, comprising 129 core and 46
  Angular tests.
- Generated declarations expose the component with selector
  `schema-string-enum-renderer` and do not expose registration or token helpers
  from the Angular root.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- Initial render, reconciliation, rejection, locale, blur, out-of-enum data,
  malformed tokens, and destruction emit no unintended operation.
- No dependency, lockfile, version, peer range, publication setting, raw schema
  renderer input, business validation, or deferred capability changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Execute PLAN-006 step 7 final acceptance, declaration review, and M6
  lifecycle closure.

## 2026-07-13 — M6 PLAN-006 step 5 completed

### Completed

- Added standalone Public Experimental
  `SchemaStringEnumRendererComponent` at the fixed module and selector and
  exported it through the existing Angular root entry point.
- Reused M5's native semantic structure, deterministic IDs, resolved texts,
  issue presentation, focus/blur outputs, accessibility attributes, and
  renderer interface.
- Bound the select to one private string-valued Angular 22 Signal Forms leaf;
  the empty internal token represents missing/out-of-enum and positional
  `choice:<index>` tokens represent exact domain choices, including `""`.
- Reconciled the presentation token from controlled snapshots without emitting
  and emitted only the exact domain string selected by a valid user token.
- Added the descriptor-safe `native-string-enum` registration at rank 20 and
  priority 0 while retaining the generic string rank-10 fallback and the single
  immutable ADR-007 registration sequence.
- Added focused tests for specialization, ordinary-string fallback,
  inherited/accessor safety, the disabled sentinel, token order, empty domain
  strings, and controlled reconciliation.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 13 files and 172 tests, comprising 129 core and 43
  Angular tests.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- The select receives only normalized choices and resolved texts, performs no
  business validation or optimistic mutation, and exposes no token helper from
  the Angular root entry point.
- No dependency, lockfile, package version, peer range, publication setting, or
  deferred capability changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 6 integration, accessibility, resolver,
  controlled-state, zoneless, and package-surface coverage.

## 2026-07-13 — M6 PLAN-006 step 4 completed

### Completed

- Extended `FieldTextMember` with `choice` and made regular, choice, and issue
  resolution contexts structurally exclusive; choice contexts carry the exact
  immutable source choice.
- Added always-present frozen `choiceLabels` to Angular text snapshots and
  projected own data-descriptor choices after ordinary field texts and before
  issues.
- Preserved source labels when choice resolution throws, returns a non-string,
  or returns a blank string, emitting one exact frozen runtime warning per
  failing choice in definition order.
- Preserved the outlet's field/form/locale/issues text identity: unrelated
  snapshot changes do not repeat choice work or diagnostics, while locale
  changes reproject labels without replacing the renderer.
- Added focused public-contract, direct projector, fallback, diagnostic,
  descriptor-safety, ordering, immutability, identity, and locale tests.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 12 files and 169 tests, comprising 129 core and 40
  Angular tests.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- Text projection performs no enum-membership validation, no native select or
  renderer registration entered step 4, and no dependency or package surface
  setting changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 5: add the native select component and its provider
  registration.

## 2026-07-13 — M6 PLAN-006 step 3 completed

### Completed

- Replaced the boolean runtime definition check with a two-pass result that
  first validates the complete historical base shape and only then inspects
  string choices.
- Accepted absent or inherited `choices` and valid caller-owned frozen choices
  without cloning or freezing manual definitions.
- Added descriptor-safe rejection for own choices accessors, non-array and empty
  values, sparse/accessor indices, non-object/array entries, missing/inherited/
  accessor members, non-string or duplicate values, and non-string/blank labels.
- Preserved the existing base-definition diagnostic for every unrelated shape
  failure, including when an earlier field exposes malformed choices.
- Ensured malformed choices produce exactly one frozen
  `INVALID_RUNTIME_OPTIONS` diagnostic with
  `expected: 'valid FormDefinition with string choices'` before invoking the
  external validator.
- Confirmed runtime creation and controlled updates accept missing and
  out-of-enum strings when the external validator allows them.
- Added operation tests proving `applyOperation()` and `applyFormOperation()` do
  not execute or inspect accessor-shaped `choices`; no operation production code
  changed.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 11 files and 165 tests, comprising 129 core and 36
  Angular tests.
- Focused coverage includes 15 malformed choices shapes, getter suppression,
  base-error precedence, frozen diagnostics, inherited absence, caller
  ownership, validator suppression, and out-of-enum controlled flow.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- No dependency, lockfile, package version, public contract, operation contract,
  deferred capability, or Angular behavior changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 4: extend neutral text contracts and Angular choice
  projection with focused tests.

## 2026-07-13 — M6 PLAN-006 step 2 completed

### Completed

- Added `enum` to the supported direct string-field keyword set while retaining
  root `enum`/`const` as unsupported, `format` as ignored, and non-string enums
  as incompatible.
- Added internal `absent`, `valid`, and `schema-blocked` enum states so malformed
  schema branches retain their errors without producing derived UI cascades.
- Implemented descriptor-safe enum inspection for outer values and every array
  index, collecting sparse, accessor, non-string, and repeated-value errors in
  deterministic index order without executing getters.
- Implemented descriptor-safe `enumLabels` parsing, exact compatibility and
  unknown-label diagnostics, and suppression below invalid/missing schema
  candidates.
- Constructed ordered immutable choices with opaque custom labels, exact domain
  strings, and visible JSON-literal fallbacks for blank values.
- Added all 13 PLAN-006 compiler conformance fixtures plus focused tests for
  exact comparison, multiple duplicates, sparse/accessor values, ignored
  branches, input preservation, deep immutability, and deterministic behavior.
- Replaced the historical unsupported-`enum` fixture with `const`, which remains
  unsupported after the accepted enum subset was implemented.

### Verification

- Frozen installation, workspace formatting, linting, type checking, builds,
  and package smoke passed without a dependency or lockfile change.
- The full suite passed: 11 files and 159 tests, comprising 123 core and 36
  Angular tests.
- All 43 compiler fixtures passed, including the 13 new enum fixtures.
- Core contains no Angular, RxJS, DOM, or browser import and still has zero
  runtime dependencies; Angular Forms imports remain Signal Forms-only.
- Searches confirmed that operations, runtime, and Angular do not enforce enum
  membership or inspect choices in step 2.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 3: validate manually supplied choices at runtime
  creation and prove the existing operation boundary does not inspect them.

## 2026-07-13 — Persistent context workflow compacted

### Completed

- Reduced `STATUS.md` to a compact canonical checkpoint containing only the
  current phase, objective, active task, latest outcomes, exact next action,
  blockers, open questions, verification, and task-document map.
- Replaced the historical state duplication in `HANDOFF.md` with a stable
  context-recovery procedure suitable for a fresh Codex task.
- Updated `AGENTS.md` to load the compact status completely and select only the
  task-relevant SPEC, ADR, plan, deferred-decision, and worklog sections.
- Preserved every existing append-only worklog entry and documented targeted
  latest-entry and historical-search reads.
- Kept the current M6 state, SPEC-001 Draft v0.1.13, approved PLAN-006 revision
  1, deferred boundaries, and uncommitted step-1 implementation unchanged.
- Left `ROADMAP.md`, SPECs, ADRs, plan contracts, production code, and package
  configuration unchanged by this documentation-memory repair.

### Verification

- Repository formatting passed.
- Every local link in all 31 Markdown files resolved.
- Searches confirmed that current objective, in-progress state, latest work,
  exact next action, and blockers are owned only by `STATUS.md`.
- `STATUS.md`, `HANDOFF.md`, and `AGENTS.md` now total about 1,700 words, down
  from about 5,600, while the complete append-only history remains available.
- `git diff --check` passed.

### Pending

- Implement PLAN-006 step 2 exactly as recorded in `STATUS.md`.

## 2026-07-13 — M6 PLAN-006 step 1 completed

### Completed

- Marked M6 active under approved PLAN-006 revision 1.
- Added public experimental `StringChoiceDefinition` with readonly `value` and
  `label` members.
- Extended `StringFieldDefinition` with optional readonly `choices` and
  `FieldUiSchema` with optional readonly `enumLabels`.
- Re-exported `StringChoiceDefinition` from the existing core root entry point
  without adding an entry point, export-map change, dependency, or Stable API.
- Added a focused contract test that imports all three extended contracts from
  the public core index and fixes their readonly TypeScript shapes.

### Verification

- Workspace formatting, lint, typecheck, and builds passed, including Angular
  partial compilation.
- The full suite passed: 11 files and 141 tests, comprising 105 core and 36
  Angular tests.
- Package smoke passed for both public root entry points.
- Generated declarations expose `StringChoiceDefinition`, `choices`, and
  `enumLabels` from the expected public modules.
- All 31 local Markdown files resolve their local links and `git diff --check`
  passes.
- No compiler parsing, runtime validation, Angular code, or deferred capability
  entered step 1.

### Pending

- Implement PLAN-006 step 2: enum keyword classification, descriptor-safe enum
  and `enumLabels` parsing, immutable choice construction, conformance fixtures,
  and cascade-suppression tests.

## 2026-07-13 — PLAN-006 revision 1 approved

### Completed

- Recorded the user's explicit approval of PLAN-006 revision 1 after its
  repeated eight-area review passed without a remaining finding.
- Promoted the plan's exact normative contracts for string enums,
  `enumLabels`, immutable choices, manual-definition validation, choice text
  projection, diagnostics, and the native Angular select to SPEC-001 Draft
  v0.1.13.
- Synchronized the plan, SPEC index, architecture README, ROADMAP, STATUS,
  WORKLOG, and HANDOFF while keeping M6 planned but inactive.
- Left production code, package versions, publication settings, API stability,
  and D-010/D-024/D-036/D-037 plus all other deferred decisions unchanged.

### Verification

- Confirmed PLAN-006 is Approved revision 1 and SPEC-001 plus its index and
  HANDOFF consistently report Draft v0.1.13.
- Confirmed M6 remains inactive and the next action starts with PLAN-006 step 1.
- Ran formatting, local Markdown-link validation, active-state searches, and
  `git diff --check`; no code test was required for this documentation-only
  approval task.

### Pending

- Begin M6 by marking the implementation task and milestone active, then add
  the neutral string-choice contracts, UI metadata extension, root exports, and
  focused contract tests from PLAN-006 step 1.

## 2026-07-13 — PLAN-006 revision 1 review corrections completed

### Completed

- Added `schema-blocked` enum state and exact UI cascade behavior, preserving
  independent outer `enumLabels` shape errors without derived compatibility or
  member diagnostics below blocked schema branches.
- Completed the choice `TEXT_RESOLUTION_FAILED` contract with frozen data path,
  absent document path, per-choice ordering, projection identity, and one-time
  diagnostic-batch forwarding.
- Fixed the public renderer selector as `schema-string-enum-renderer`, its exact
  native module path, package export smoke assertion, and Angular TestBed/resolver
  creation boundary.
- Added cascade-specific fixture and focused-test requirements and marked
  PLAN-006 revision 1.
- Repeated all eight formal checklist areas with no remaining finding; kept M6
  inactive and PLAN-006 Proposed pending explicit approval.

### Verification

- Rechecked the corrected plan against current compiler cascade behavior,
  ADR-005/007/008/009/011, PLAN-002/005, Angular text projection, public package
  boundaries, and current Angular 22 select/FormField documentation.
- Confirmed consistent Proposed revision 1 state across PLAN-006, README,
  ROADMAP, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, local Markdown-link validation, state searches, and
  `git diff --check`; no code test was required for documentation-only changes.

### Pending

- Explicitly approve or revise PLAN-006 revision 1. Approval may promote its
  exact contracts to SPEC-001 Draft v0.1.13 before implementation.

## 2026-07-13 — PLAN-006 second formal review completed

### Completed

- Re-reviewed proposed PLAN-006 against compiler cascade behavior, ADR-011,
  Angular public metadata, and current official Angular 22 Signal Forms docs.
- Confirmed that `[formField]` supports native selects with dynamic options and
  that the selected Signal Forms boundary remains viable.
- Found three required corrections: model schema-blocked enum states without
  derived UI cascades; complete choice text diagnostic paths/frequency; and fix
  the public component selector, module, and safe package test boundary.
- Recorded the findings in PLAN-006 without applying their substantive fixes.
- Kept PLAN-006 Proposed revision 0, SPEC-001 Draft v0.1.12, and M6 inactive.

### Verification

- Rechecked all eight plan areas and confirmed that scope, controlled state,
  validation ownership, tokens, ranks, deferred exclusions, dependencies, and
  tooling remain otherwise sound.
- Ran formatting, local Markdown-link validation, state consistency searches,
  and `git diff --check`; no code test was required for the documentation-only
  review.

### Pending

- Apply all three corrections, publish PLAN-006 revision 1, and repeat the
  eight checklist areas before considering approval.

## 2026-07-13 — PLAN-006 proposed and formally reviewed

### Completed

- Reviewed accepted ADR-011 against the implemented compiler, runtime creation,
  operations, Angular text projection, renderer resolver, native Signal Forms
  controls, package surfaces, and test infrastructure.
- Drafted proposed PLAN-006 for string enum normalization, UI labels, runtime
  choice validation, localized choice projection, and a ranked native select.
- Closed UI diagnostic cascades, base-versus-choice runtime diagnostics, safe
  descriptor reads, and the internal missing/choice DOM token protocol.
- Defined the implementation sequence, exact fixtures, public Experimental API
  changes, full verification matrix, and M6 lifecycle.
- Repeated all eight formal checklist areas with no remaining finding; kept
  PLAN-006 Proposed and M6 inactive pending explicit approval.

### Verification

- Checked PLAN-006 against SPEC-001 Draft v0.1.12, ADR-005/007/008/009/011,
  completed PLAN-002/005, current source and tests, and D-010/D-024/D-036/D-037.
- Confirmed that the plan adds no dependency, package, entry point, version,
  publication setting, deferred capability, or implementation change.
- Ran formatting, local Markdown-link validation, active-state searches, and
  `git diff --check`; no code test was required for the documentation-only plan.

### Pending

- Explicitly approve or revise PLAN-006. Only approval may promote its contracts
  to SPEC-001 Draft v0.1.13 and authorize implementation preparation.

## 2026-07-13 — ADR-011 accepted and D-008 promoted

### Completed

- Committed the ADR-011 proposal, formal review, corrections, and repeated
  review on `develop` as `c8728bb` with repository identity
  `Rabassoft <ricard@rabassoft.com>`; no push was performed.
- Accepted ADR-011 revision 1 after all eight review areas passed without
  remaining findings.
- Amended ADR-005 only for the accepted string-enum subset and promoted D-008.
- Split the unpromoted `const` and `format` concerns into deferred D-036 and
  D-037 without changing their behavior.
- Updated SPEC-001 to Draft v0.1.12 as planning state, synchronized its index,
  the ADR index, STATUS, and HANDOFF, and left all implementation unchanged.

### Verification

- Confirmed that ADR-011, ADR-005, D-008, D-036, D-037, SPEC-001, both indexes,
  STATUS, WORKLOG, and HANDOFF report one consistent accepted/planning state.
- Confirmed that SPEC-001 Draft v0.1.12 records ADR-011 as accepted but not yet
  implemented, while `const`, `format`, and other exclusions remain deferred.
- Ran formatting, local Markdown-link validation, and `git diff --check`; no
  code test was required because the acceptance changed documentation only.

### Pending

- Draft and formally review PLAN-006 for ADR-011. Do not implement it until the
  plan is explicitly approved.

## 2026-07-13 — ADR-011 review corrections completed

### Completed

- Preserved mutually exclusive `choice` and `issue` branches in the proposed
  `TextResolutionContext` contract.
- Assigned descriptor-safe validation of compiled enums and manually supplied
  choices to compiler/runtime creation while explicitly preserving PLAN-002's
  minimum `applyFormOperation()` checks.
- Required non-blank choice labels, defined a visible two-quote fallback for the
  empty-string value plus JSON-literal fallbacks for other blank values, and
  isolated blank resolver results with diagnostics and a safe source fallback.
- Repeated all eight ADR-011 acceptance checks with no remaining findings.
- Kept ADR-011 Proposed revision 1 and D-008 Candidate; SPEC-001, ADR-005,
  packages, and implementation remain unchanged.

### Verification

- Rechecked the corrected contracts against current compiler/runtime descriptor
  handling, PLAN-002/003, text diagnostics, renderer ranks, package entry
  points, Draft 2020-12, HTML select behavior, and Angular 22 Signal Forms.
- Confirmed consistent Proposed/Candidate state across ADR-011, the ADR index,
  D-008, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only correction.

### Pending

- Explicitly accept or revise ADR-011 revision 1. Acceptance may update
  ADR-005, D-008, and SPEC planning state but must not implement the increment.

## 2026-07-13 — ADR-011 formal review completed with corrections

### Completed

- Reviewed all eight ADR-011 acceptance areas against Draft 2020-12,
  SPEC-001, ADR-005/007/009, current compiler/runtime/operation contracts,
  Angular text projection, native renderer resolution, Signal Forms select
  support, and D-010.
- Confirmed string-only scope, external validation ownership, controlled-state
  behavior, deterministic renderer specialization, public API classification,
  and deferred exclusions.
- Identified three corrections required before acceptance: preserve mutually
  exclusive text-context members, validate malformed manually supplied choices
  at an explicit safe boundary, and guarantee non-empty accessible option
  labels including the empty-string domain value.
- Kept ADR-011 Proposed and D-008 Candidate; SPEC-001, ADR-005 and all code
  remain unchanged.

### Verification

- Rechecked native `<select>` support against current official Angular 22
  Signal Forms documentation and enum/format semantics against official JSON
  Schema Draft 2020-12 sources.
- Inspected current public type exports, runtime and operation definition-shape
  validation, text diagnostics, renderer ranks, and package entry points.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only review.

### Pending

- Apply the three ADR-011 corrections and repeat all eight acceptance checks
  before considering acceptance, D-008 promotion, or SPEC changes.

## 2026-07-13 — ADR-011 string-enum decision proposed

### Completed

- Recorded explicit approval to split D-008 and drafted ADR-011 as Proposed.
- Limited the proposed first increment to non-empty unique string enums with
  immutable normalized choices and optional UI Schema labels.
- Defined choice text resolution, external validation ownership, controlled
  missing and invalid-value behavior, deterministic renderer ranks, internal
  DOM tokens, and the public native select component boundary.
- Kept `const`, `format`, non-string enums, radios, clearing to missing,
  SPEC-001, ADR-005, packages, and implementation unchanged.
- Added ADR-011 to the global index and linked the active proposal from D-008
  while retaining Proposed/Candidate states.

### Verification

- Checked the proposal against Draft 2020-12, SPEC-001, ADR-005/007/009,
  compiler keyword and diagnostic behavior, public field/text contracts,
  Angular text projection and native renderer ranks, and D-010.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only proposal.

### Pending

- Formally review ADR-011's eight acceptance areas before deciding whether to
  accept it, partially revise ADR-005, promote D-008, or change SPEC-001.

## 2026-07-13 — D-008 architectural boundary reviewed

### Completed

- Reviewed `enum`, `const`, and `format` against JSON Schema Draft 2020-12,
  SPEC-001, ADR-005/007/009, and the implemented compiler-to-renderer boundary.
- Confirmed that `enum` and `const` are data assertions, `format` is an
  annotation by default, and visual renderer selection is an adapter concern
  over normalized `FieldDefinition`.
- Proposed promoting only a minimal `enum` increment while retaining `const`
  and `format` as deferred work pending separate use cases and contracts.
- Recorded the accepted ADR-005 conflict that prevents treating `format` as
  validation or normalized renderer metadata without an explicit revision.

### Verification

- Inspected compiler keyword classification, normalized field contracts, the
  unsupported-`enum` conformance fixture, and native renderer testers.
- Confirmed that the review changed documentation only and activated no
  deferred capability or public contract.
- Ran formatting, Markdown-link validation, and `git diff --check`.

### Pending

- Approve or revise the D-008 split. If approved, draft ADR-011 for the minimal
  `enum` contract before changing SPEC-001 or implementation.

## 2026-07-13 — API and versioning decisions committed

### Completed

- Committed the reviewed documentation block containing accepted ADR-009/010,
  superseded ADR-002, promoted D-028/D-029, and the D-024 boundary review on
  `develop` using `Rabassoft <ricard@rabassoft.com>`.

### Verification

- Confirmed the complete intended documentation diff, formatting, local links,
  diff integrity, branch, and repository identity before commit.
- Package manifests and implementation are unchanged; no push was performed.

### Pending

- Review D-008 as the smallest next product candidate.

## 2026-07-13 — D-024 boundary reviewed

### Completed

- Confirmed that custom renderer registration is already resolved by accepted
  ADR-007/009 and implemented through the public Angular renderer contracts and
  `provideSchemaRenderer()`.
- Compared neutral whole-model `SchemaValidator` with Angular `ValidatorFn` and
  the stable Angular 22 Signal Forms `Validator` contract.
- Deferred a generic validation bridge because the Angular contracts require
  framework control or field context and return error shapes without the core's
  canonical paths and normalized parameters.
- Reordered the nearest candidates to D-008, D-010, and D-005, with D-008 as the
  smallest recommended next decision.

### Verification

- Checked D-024 against SPEC-001, ADR-007/009, current Angular source exports,
  core validation contracts and runtime normalization, and official Angular 22
  validation APIs.
- Ran formatting, Markdown-link validation, and `git diff --check`; no public
  contract, package manifest, or implementation changed.

### Pending

- Review D-008 and separate `enum`, `const`, and `format` data semantics from
  validation ownership and renderer-selection consequences before promotion.

## 2026-07-13 — ADR-010 accepted and D-028 promoted

### Completed

- Recorded explicit acceptance of ADR-010 revision 1 after its repeated
  seven-area review passed without findings.
- Marked pre-SPEC ADR-002 Superseded while preserving its historical decision
  text, and promoted D-028 to ADR-010.
- Synchronized the ADR index, deferred-decisions register, project status, and
  handoff.
- Kept both packages private at `0.0.0`; acceptance did not change dependencies,
  compatibility metadata, publication settings, or implementation.

### Verification

- Confirmed consistent Accepted/Superseded/Promoted states across ADR-010,
  ADR-002, the ADR index, D-028, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; package
  manifests remain unchanged.

### Pending

- Review D-024 to separate the already implemented custom-renderer registration
  boundary from the still-deferred Angular `ValidatorFn` bridge.

## 2026-07-13 — ADR-010 review corrections implemented

### Completed

- Defined the version policy honestly as SemVer for the Public + Stable
  compatibility surface plus an explicit Experimental extension.
- Required `@angular/core` and `@angular/forms` to resolve to the same exact
  version and made aligned tuples part of matrix and consumer verification.
- Replaced the ambiguous complete-MINOR wording with one later published MINOR
  that retains the deprecated contract, plus the independent 180-day minimum.
- Repeated all seven acceptance checks without remaining findings.
- Kept ADR-010 Proposed, ADR-002 pending review, and D-028 Research until an
  explicit acceptance decision.

### Verification

- Rechecked the corrected wording against ADR-009, SemVer 2.0.0, official
  Angular peer and partial-compilation guidance, and current package manifests.
- Ran formatting, Markdown-link validation, and `git diff --check`; no package
  manifest or implementation changed.

### Pending

- Explicitly accept or revise ADR-010. Acceptance may supersede ADR-002 and
  promote D-028 but must not change versions or publication settings.

## 2026-07-13 — ADR-010 formal review completed with corrections

### Completed

- Reviewed all seven ADR-010 acceptance areas against ADR-009, SemVer 2.0.0,
  Angular library peers, partial compilation, and the current package shape.
- Confirmed independent package versioning, `0.1.0` initial releases, bounded
  peer ranges, release classification, and non-publication scope.
- Identified three corrections required before acceptance: explicitly describe
  the Experimental extension to SemVer after `1.0.0`, require Angular core/forms
  to resolve to the same version, and define the later MINOR requirement as one
  published release that retains the deprecated contract.
- Kept ADR-010 Proposed, ADR-002 pending review, and D-028 Research.

### Verification

- Rechecked SemVer's declared-public-API and incompatible-change requirements
  and Angular's peer-dependency and partial-compilation guidance.
- Ran formatting, Markdown-link validation, and `git diff --check`; package
  manifests and implementation remain unchanged.

### Pending

- Approve and implement the three proposed corrections, then repeat the formal
  review before accepting ADR-010.

## 2026-07-13 — ADR-010 package-versioning policy proposed

### Completed

- Reviewed D-028 and the conflicting pre-SPEC ADR-002 against accepted
  ADR-006/009, current package manifests, cross-package imports, and Angular
  partial compilation.
- Drafted proposed ADR-010 with independent product SemVer for core and adapter,
  explicit core and Angular peer ranges, a release compatibility matrix, and
  coordinated-change rules.
- Proposed initial releases at `0.1.0`, initial Angular compatibility
  `>=22.0.6 <23.0.0`, and Stable deprecation for 180 days plus one subsequent
  MINOR before removal in a MAJOR.
- Kept ADR-002 pending review and D-028 Research until explicit acceptance; no
  package manifest or implementation changed.

### Verification

- Checked the proposal against official SemVer, npm, Angular versioning/support,
  Angular compatibility, library peer-dependency, and partial-compilation
  documentation current on 13 July 2026.
- Confirmed consistent Proposed/Research states across ADR-010, the ADR index,
  D-028, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`.

### Pending

- Formally review ADR-010's seven acceptance areas before accepting it,
  superseding ADR-002, or promoting D-028.

## 2026-07-13 — ADR-009 accepted and D-029 promoted

### Completed

- Recorded the explicit acceptance of ADR-009 after its seven-area formal
  review completed without remaining findings.
- Promoted D-029 and synchronized the ADR index, project status, and handoff.
- Kept all intended root exports Public + Experimental + Active; acceptance did
  not authorize publication, version changes, stability promotion, or further
  implementation.

### Verification

- Confirmed consistent Accepted/Promoted states across ADR-009, the ADR index,
  the deferred-decisions register, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code or
  package metadata changed.

### Pending

- Review D-028 together with pre-SPEC ADR-002 before deciding package SemVer,
  Angular compatibility, coordination, or the exact deprecation window.

## 2026-07-13 — ADR-009 final formal review completed

### Completed

- Reviewed ADR-009 revision 1 against all seven acceptance areas: package
  entry-point boundary, API inventory, Angular extension surface, unsupported
  imports, orthogonal policy axes, D-028 separation, and acceptance scope.
- Found no remaining issue after the revision 1 corrections.
- Kept ADR-009 Proposed and D-029 Candidate pending the user's explicit
  acceptance decision.

### Verification

- Confirmed that the committed source entry points and built declarations agree
  and that `SCHEMA_RENDERER_REGISTRATIONS` is absent from the public Angular
  entry point.
- Confirmed that ADR-009, the ADR index, and the deferred-decisions register
  retain consistent Proposed/Candidate states.
- Relied on the immediately preceding full verification: formatting, linting,
  type checking, all 140 tests, and both package smoke tests passed.

### Pending

- Explicitly accept ADR-009 and promote D-029, or request another revision. No
  push was performed.

## 2026-07-13 — ADR-009 revision 1 committed

### Completed

- Committed revised proposed ADR-009 and the reviewed Angular public-surface correction on `develop` using `Rabassoft <ricard@rabassoft.com>`.
- Kept ADR-009 Proposed and D-029 Candidate pending the requested final formal review.

### Verification

- Confirmed the complete intended diff, repository identity, branch, formatting, linting, type checking, all 140 tests, package smoke tests, documentation links, and diff integrity before commit.
- The commit leaves `develop` one commit ahead of `origin/develop`; no push was performed.

### Pending

- Perform the final formal review of ADR-009's seven acceptance areas without accepting it automatically.

## 2026-07-13 — ADR-009 formal-review corrections implemented

### Completed

- Reviewed all seven ADR-009 acceptance areas and found three required corrections before acceptance.
- Separated Public/Internal visibility, Experimental/Stable stability, and Active/Deprecated lifecycle; a deprecated Stable API now retains Stable guarantees until removal.
- Made stability promotion explicitly manual and independent of package version, `private`, or publication state.
- Removed `SCHEMA_RENDERER_REGISTRATIONS` from the Angular root entry point while preserving the token for internal provider and resolver implementation.
- Added package smoke coverage preventing accidental public re-export of the raw token.
- Kept ADR-009 Proposed and D-029 Candidate pending one final explicit acceptance review.

### Verification

- `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm test:package` passed.
- All 140 tests pass: 104 core and 36 Angular; package smoke coverage confirms the intended root surface.

### Pending

- Perform the final review of revised ADR-009 and either accept it and promote D-029 or report a remaining concern.

## 2026-07-13 — ADR-009 public API policy proposed

### Completed

- Confirmed that the reviewed M5 commit on `develop` is synchronized with `origin/develop`.
- Audited the root export maps and indexes of `@rabassoft/schema-engine` and `@rabassoft/schema-engine-angular`.
- Drafted proposed ADR-009 to make package entry points the only supported import boundary and classify all current root exports as Experimental.
- Defined public, deprecated, and internal boundaries; change governance; deprecation ordering; consumer-facing enforcement; exclusions; and formal acceptance criteria.
- Kept D-029 Candidate until explicit acceptance and preserved D-028 as the owner of SemVer, package coordination, Angular compatibility, and the exact deprecation window.

### Verification

- Checked the proposal against SPEC-001, ADR-002, ADR-006, the current package manifests and indexes, and D-028/D-029.
- Formatting, diff validation, and local Markdown-link validation passed.

### Pending

- Formally review ADR-009's seven acceptance areas before accepting it or changing public contracts.

## 2026-07-13 — M5 diff reviewed and committed

### Completed

- Reviewed every tracked and untracked M5 change against SPEC-001 v0.1.11, PLAN-005, ADR-007, ADR-008, and the deferred-decisions register.
- Found and fixed a localized negative-number round-trip failure caused by invisible directional literals emitted by `Intl.NumberFormat` for RTL locales.
- Added coverage proving that renderer editing text produced for `ar-EG` parses back to the same confirmed negative value.
- Created the authorized M5 commit on `develop` using `Rabassoft <ricard@rabassoft.com>`.

### Verification

- Formatting, linting, type checking, all 140 tests, builds, package smoke tests, diff checks, documentation links, dependency boundaries, and repository-state checks passed after the review correction.
- The final worktree is clean and the commit contains the complete reviewed M5 increment.

### Pending

- Select and formally scope the next increment. No push was performed.

## 2026-07-13 — M5 native HTML renderers completed

### Completed

- Added Angular 22 native string, number/integer, and boolean renderers backed by private Signal Forms leaf buffers while retaining application-controlled state.
- Added deterministic native registrations with custom override composition, `LOCALE_ID` fallback, neutral replaceable text resolution, accessible semantic markup, and isolated adapter diagnostics.
- Added localized numeric parsing and formatting with incomplete edit preservation, strict integer handling, empty-value removal, locale fallback, and separate grouped display and ungrouped edit forms.
- Completed PLAN-005 and milestone M5 without promoting Signal Forms validation, persistence, advanced schema capabilities, or other deferred work.

### Verification

- Frozen installation, formatting, linting, type checking, builds, package smoke tests, diff checks, documentation-link checks, dependency-boundary checks, and forms-import checks passed.
- All 140 tests pass: 104 core tests and 36 Angular tests across 10 test files.

### Pending

- Review the completed M5 diff and commit it only when explicitly requested.

## 2026-07-13 — PLAN-005 re-reviewed for Angular 22 Signal Forms

### Completed

- Verified from current official Angular 22 documentation that Signal Forms, `form()`, `FormField`, `FieldTree`, and custom-control contracts are stable.
- Rejected using Signal Forms over the application business model because its writable model binding would bypass strict core operations and controlled confirmation.
- Revised PLAN-005 so each native renderer uses one private Signal Form leaf as an ephemeral control buffer, reconciled from confirmed runtime snapshots and reset on blur.
- Added `@angular/forms/signals` dependency boundaries, focus/reset behavior, local-state ownership, D-002/D-024 exclusions, integration tests, acceptance checks, and the single-entry-point peer-dependency trade-off.
- Completed the seven-area formal re-review and left the revised plan Proposed pending explicit approval.

### Verification

- Checked the revised design against SPEC-001, ADR-007/008, PLAN-004, current M4 contracts, and official Angular 22 Signal Forms overview, models, custom controls, `form()`, `FormField`, field state, and JSON-driven forms guidance.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Explicitly approve or revise PLAN-005. After approval, promote its contracts to SPEC-001 v0.1.11 before M5 implementation.

## 2026-07-13 — PLAN-005 proposed

### Completed

- Confirmed that M5 will close the SPEC-001 `LOCALE_ID` fallback and replaceable `TextResolver` requirements instead of deferring them.
- Drafted PLAN-005 for accessible native string, number/integer, and boolean renderers in the private Angular package.
- Defined the pre-release locale and renderer contract revisions, neutral text contracts, native provider composition, deterministic IDs, semantic markup, controlled numeric editing grammar, Intl fallbacks, diagnostics, fixtures, and acceptance boundary.
- Kept Angular Forms, browser-owned validation, clear affordances, validator bridges, theming, enum/format, advanced localization, package publication, and other deferred work outside M5.

### Verification

- Checked the proposal against SPEC-001 v0.1.10, ADR-007, ADR-008, completed PLAN-004, current M4 source contracts, and the applicable deferred entries.
- Confirmed the proposal does not authorize implementation before formal review and SPEC promotion.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Formally review PLAN-005 and approve or revise all six checklist areas before implementing M5.

## 2026-07-13 — M4 committed and M5 planning boundary reviewed

### Completed

- Committed the completed M4 Angular adapter increment on `develop` as `f7199d6` using `Rabassoft <ricard@rabassoft.com>`.
- Began PLAN-005 preparation by checking SPEC-001, ADR-006 through ADR-008, PLAN-004, the current Angular contracts, and the deferred-decisions register.
- Identified that SPEC-001 still requires Angular `LOCALE_ID` fallback and replaceable text resolution, while completed PLAN-004 requires explicit locale input and provides no `TextResolver` projection.

### Verification

- Confirmed commit author, email, subject, branch, and a clean worktree immediately after the M4 commit.
- Confirmed `develop` is five commits ahead of `origin/develop`; no push was performed.

### Pending

- Decide whether PLAN-005 absorbs `LOCALE_ID` fallback and `TextResolver` projection or SPEC-001 defers them before drafting a decision-complete M5 plan.

## 2026-07-13 — M4 Angular adapter completed

### Completed

- Added the private `@rabassoft/schema-engine-angular` package on Angular 22.0.6 with partial `ngc` compilation and no Angular dependency in core.
- Implemented the standalone controlled-form and field-outlet directives, Signals snapshot projection, controlled intent forwarding, transactional runtime replacement, and deterministic renderer resolution.
- Implemented ADR-008 renderer creation through `ViewContainerRef.createComponent()` with an explicit environment injector and creation-time signal bindings.
- Added lifecycle-safe renderer replacement, including preservation of the active renderer when a proposed parent runtime replacement is rejected.
- Completed PLAN-004 and milestone M4 without native HTML controls, Angular Forms, RxJS bridging, Zone.js coupling, persistence, or deferred capabilities.

### Verification

- `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:package` passed.
- All 119 tests pass: 104 core tests and 15 Angular resolver/directive tests, including explicit zoneless coverage.
- Angular package smoke coverage verifies root exports and resolver construction; `git diff --check` and local Markdown-link validation passed.

### Pending

- Draft and formally review PLAN-005 for M5 native HTML renderers before implementation.

## 2026-07-13 — ADR-008 committed and PLAN-004 approved

### Completed

- Committed ADR-008 and the D-027 resolution as `bae261f`.
- Drafted PLAN-004 for a private Angular 22 headless adapter package.
- Formally reviewed and approved Signals projection, transactional runtime recreation, provider-based renderer registrations, deterministic resolution, the common renderer contract, and the ViewContainerRef outlet lifecycle.
- Kept native HTML renderers in M5 and excluded RxJS, Zone.js coupling, Angular Forms, persistence, lazy rendering, and deferred capabilities.

### Verification

- Checked PLAN-004 against SPEC-001 v0.1.9, ADR-006/007/008, completed PLAN-003, D-013, D-024, D-026, D-028, and D-029.
- Verified Angular 22 is actively supported and compatible with the workspace TypeScript 6.0 baseline.
- Ran formatting, diff, and local Markdown-link validation.

### Pending

- Promote PLAN-004's approved public contracts and diagnostics to SPEC-001.
- Implement and verify M4 only after that promotion.

## 2026-07-13 — ADR-008 committed

### Completed

- Committed ADR-008, D-027 promotion, SPEC-001 v0.1.9, and persistent-state updates on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Formatting, diff, and local Markdown-link validation passed before commit.

### Pending

- Prepare and formally review PLAN-004 before implementing M4.

## 2026-07-13 — Reviewed M3 committed and D-027 resolved

### Completed

- Committed reviewed M3, its accessor-safety correction, and ADR-007 as `805308d`.
- Reviewed current official Angular APIs for dynamic inline components.
- Accepted ADR-008 selecting `ViewContainerRef.createComponent()` with creation-time input/output bindings and an explicit `EnvironmentInjector`.
- Promoted D-027 without implementing Angular or renderers.
- Updated SPEC-001 to Draft v0.1.9 and cleared the immediate architectural prerequisites for PLAN-004.

### Verification

- Confirmed the M3 commit attribution is `Rabassoft <ricard@rabassoft.com>`.
- Checked ADR-008 against ADR-007, Angular's programmatic rendering guide, and the current Angular API references.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Draft and formally approve PLAN-004 before implementing M4.

## 2026-07-13 — Reviewed M3 and ADR-007 committed

### Completed

- Committed the reviewed M3 implementation, accessor-safety correction, fixtures, tests, SPEC updates, and ADR-007 resolution on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Confirmed the complete 104-test acceptance suite passed before commit.
- Checked staged diff integrity and commit attribution.

### Pending

- Resolve D-027 through a dedicated architectural decision.
- Prepare PLAN-004 only after Angular instantiation is closed.

## 2026-07-13 — M3 reviewed and D-023 resolved

### Completed

- Reviewed the full uncommitted M3 diff against PLAN-003 and SPEC-001.
- Fixed a runtime robustness defect that could execute accessors in validator results, definitions, paths, scopes, or diagnostic parameters.
- Added regression coverage proving malformed accessor-shaped contracts return diagnostics without invoking getters.
- Accepted ADR-007 for deterministic scored renderer testers owned by framework adapters.
- Marked ADR-004 superseded and promoted D-023 without implementing renderers or Angular.
- Updated SPEC-001 to Draft v0.1.8 and reconciled its immediate-decision register.

### Verification

- Formatting, lint, type checking, tests, build, package smoke, diff, and local Markdown links passed.
- Confirmed renderer selection consumes normalized `FieldDefinition` and adds no framework dependency to the core.

### Pending

- Resolve D-027 for Angular dynamic renderer instantiation.
- Prepare and approve PLAN-004 before implementing M4.

## 2026-07-13 — M3 controlled runtime completed

### Completed

- Implemented discriminated controlled-runtime creation with source-schema validation access.
- Added immutable snapshots, dirty derivation, synchronous normalized validation, atomic external updates, and structural sharing.
- Added non-optimistic operation requests with sequential IDs and separate synchronous subscriptions.
- Added focus, blur, touched, validation visibility, scopes, listener isolation, idempotent unsubscribe, and disposal.
- Added 10 runtime conformance fixtures, focused unit tests, and package smoke coverage.
- Completed PLAN-003 and milestone M3 without adding Angular, renderers, persistence, async validation, or deferred capabilities.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed with 103 tests in 6 files.
- `pnpm build` and `pnpm test:package` passed.
- `git diff --check` and local Markdown-link validation passed.

### Pending

- Review and commit the completed M3 diff only when explicitly requested.
- Resolve D-023 and prepare the M4 Angular adapter plan before implementation.

## 2026-07-13 — PLAN-003 reviewed and approved

### Completed

- Formally reviewed PLAN-003 and closed exact diagnostic parameters, reasons, ordering, and fallback-message policy.
- Approved source-schema access, discriminated creation/subscription results, and listener-exception isolation.
- Promoted the approved runtime option contract to SPEC-001 v0.1.7.

### Verification

- Checked the plan against SPEC-001, completed M1/M2 contracts, ADR-005/006, and deferred scope.

### Pending

- Implement and verify M3 without expanding into Angular, renderers, async validation, or optimistic state.

## 2026-07-13 — Proposed PLAN-003 committed

### Completed

- Committed the proposed PLAN-003 and its persistent-state documentation on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Formatting, diff, and local Markdown-link validation passed before commit.

### Pending

- Formally review and approve PLAN-003 before production code.
- Implement M3 only after closing its public contracts and diagnostics.

## 2026-07-13 — M2 reviewed and PLAN-003 proposed

### Completed

- Reviewed committed M2 commit `3347858` across contracts, implementation, diagnostics, fixtures, tests, and documentation.
- Found no functional defect, regression, or documentation conflict in M2.
- Drafted PLAN-003 for the complete framework-neutral controlled runtime milestone.
- Proposed explicit source-schema access for synchronous validation and isolated listener-exception reporting.
- Kept Angular, renderers, persistence, async validation, optimistic projection, nested objects, arrays, and deferred infrastructure out of scope.

### Verification

- `git show --check 3347858` passed and commit attribution is `Rabassoft <ricard@rabassoft.com>`.
- Reconciled PLAN-003 with SPEC-001 v0.1.6, completed PLAN-001/002, ADR-005/006, and the deferred-decisions register.
- Ran formatting, diff, and local Markdown-link validation for the plan documentation.

### Pending

- Formally review and approve PLAN-003.
- Promote approved public-contract changes to SPEC-001 before implementing M3.

## 2026-07-13 — M2 changes committed

### Completed

- Committed the completed M2 implementation, fixtures, tests, and documentation on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Confirmed the complete M2 acceptance suite passed before committing.
- Checked the staged diff and commit attribution.

### Pending

- Review the committed M2 diff.
- Prepare PLAN-003 without implementing M3.

## 2026-07-13 — M2 root immutable operations completed

### Completed

- Promoted PLAN-002's runtime diagnostic contract to SPEC-001 v0.1.6.
- Added and exported operation, expectation, metadata, and result contracts.
- Implemented pure root-only `applyOperation()` and `applyFormOperation()` utilities.
- Added strict shape, path, form membership, type compatibility, expectation, accessor-safety, and immutable cloning behavior.
- Added 27 operation conformance fixtures, focused unit tests, and built-package smoke coverage.
- Completed PLAN-002 and milestone M2 without introducing runtime state or deferred capabilities.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed with 82 tests in 4 files.
- `pnpm build` and `pnpm test:package` passed.
- `git diff --check` and local Markdown-link validation passed.

### Pending

- Review and commit the completed M2 diff only when explicitly requested.
- Propose and approve PLAN-003 before implementing the controlled runtime.

## 2026-07-13 — PLAN-002 formally reviewed and approved

### Completed

- Reviewed PLAN-002 against SPEC-001 v0.1.5, ADR-005, ADR-006, the deferred-decisions register, and the implemented M1 contracts.
- Defined safe handling for target accessors and required-member accessors without invoking caller code.
- Closed malformed-path validation, minimum FormDefinition shape, reason values, and diagnostic cutoff/order behavior.
- Added the missing accessor diagnostic and test coverage requirement.
- Marked PLAN-002 Approved without implementing M2 production code.

### Verification

- Checked public contracts, root-only scope, structural sharing, diagnostic safety, fixture coverage, and acceptance commands.
- Confirmed nested objects, arrays, runtime state, business validation, and other deferred capabilities remain excluded.
- Ran formatting, diff, and local Markdown-link validation for the review changes.

### Pending

- Promote PLAN-002's approved diagnostic contract to SPEC-001.
- Implement and verify the approved M2 increment.

## 2026-07-13 — M1 and PLAN-002 changes committed

### Completed

- Committed the completed M1 compiler increment, architecture documentation updates, and proposed PLAN-002 on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Re-ran the frozen install, formatting, linting, type checking, tests, build, and built-package smoke test before committing.
- Checked the final diff, local Markdown links, and common credential patterns.

### Pending

- Review and explicitly approve PLAN-002 before implementing M2.
- Push the local `develop` commits only when explicitly requested.

## 2026-07-13 — PLAN-002 proposed

### Completed

- Confirmed that both M2 operation utilities are limited to one string root-property path segment.
- Defined the operation result contract, including exact input-reference preservation on failures and successful no-ops.
- Updated SPEC-001 to Draft v0.1.5 to make those M2 boundaries normative.
- Drafted decision-complete PLAN-002 with contracts, validation order, immutable behavior, diagnostics, fixtures, and acceptance criteria.
- Kept nested objects, arrays, runtime state, validation, adapters, and other deferred capabilities out of scope.

### Verification

- Checked PLAN-002 against SPEC-001 v0.1.5, completed PLAN-001, and the deferred-decisions register.
- Confirmed that no M2 production code was added.
- Ran formatting, diff, and local Markdown-link checks for the documentation changes.

### Pending

- Review and explicitly approve PLAN-002.
- Do not implement M2 before that approval.

## 2026-07-13 — M1 minimal compiler completed

### Completed

- Promoted PLAN-001's diagnostic contract to SPEC-001 v0.1.4.
- Created the native pnpm workspace and `packages/core` package named `@rabassoft/schema-engine`.
- Added TypeScript, ESLint, Prettier, Vitest, ESM build output, declarations, and package smoke testing.
- Implemented `compileFormDefinition()` with deterministic diagnostics, immutable outputs, strict root/field parsing, UI text precedence, ordering, and numeric visual options.
- Added 30 complete conformance fixtures and 10 focused unit tests.
- Completed PLAN-001 and milestone M1.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed with 40 tests in 2 files.
- `pnpm build` passed.
- `pnpm test:package` passed.
- Verified 30 expected conformance results and zero runtime dependencies.
- `git diff --check` and local Markdown link validation passed.

### Pending

- Review and commit the completed M1 diff only when explicitly requested.
- Propose and approve PLAN-002 before implementing immutable operations.

## 2026-07-13 — PLAN-001 approved

### Completed

- Approved PLAN-001 after its formal review.
- Authorized the compiler-only M1 implementation.
- Kept runtime, validators, Angular, renderers, persistence, and deferred capabilities out of scope.

### Verification

- Confirmed PLAN-001 has no remaining implementation decisions.
- Confirmed accepted ADR-005 and ADR-006 are its normative prerequisites.

### Pending

- Promote the approved diagnostic contract to SPEC-001.
- Implement and verify the compiler-only increment.

## 2026-07-13 — PLAN-001 formal review completed

### Completed

- Reviewed PLAN-001 against SPEC-001, ADR-005, ADR-006, and the first-prototype restrictions.
- Added the missing `test:package` root-script requirement.
- Made duplicate/unknown UI order behavior deterministic.
- Prevented compatibility diagnostics below invalid field-schema branches.
- Replaced unsafe diagnostic value capture with scalar-or-type descriptors.
- Expanded conformance fixtures for UI keys, required, patterns, and invalid UI values.
- Kept PLAN-001 in Proposed status pending explicit approval.

### Verification

- Checked diagnostic codes, severities, parameter shapes, and document paths.
- Checked fixture coverage against the compiler pipeline and accepted ADR policies.
- Confirmed no workspace or compiler code was created.

### Pending

- Review and explicitly approve PLAN-001.
- Commit and push the review documentation only when explicitly requested.

## 2026-07-13 — Repository setup state recorded

### Completed

- Recorded Git initialization, ignore policy, GitHub connection, commit attribution, and remote branch setup in persistent project state.
- Created a documentation-only commit on `develop`.
- Did not push the new documentation commit.

### Verification

- Confirmed only `STATUS.md` and `WORKLOG.md` changed after the initial baseline.
- Confirmed the documentation diff passes `git diff --check`.
- Confirmed `develop` is ahead of `origin/develop` after the commit.

### Pending

- Review and approve PLAN-001 before compiler implementation.
- Push the documentation commit only when explicitly requested.

## 2026-07-13 — Remote branch strategy completed

### Completed

- Pushed local `main` to `origin/main` at `a324d83`.
- Configured local `main` to track `origin/main`.
- Set `main` as the GitHub default stable/deployment branch.
- Kept `develop` as the checked-out integration branch tracking `origin/develop`.

### Verification

- Confirmed remote `main` and `develop` both point to `a324d83`.
- Confirmed both local branches track their matching upstreams.
- Confirmed GitHub reports `main` as the default branch.

### Pending

- Commit the persistent-state updates currently on `develop`.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Remote push state verified

### Completed

- Verified `origin/develop` exists at `a324d83` and local `develop` tracks it.
- Verified local `main` also points to `a324d83`.
- Identified that `origin/main` has not been pushed.
- Identified that GitHub selected `develop` as the default branch.

### Verification

- Compared local refs with `git ls-remote`.
- Queried the GitHub repository default branch.

### Pending

- Push `main` and change the GitHub default branch to `main` to match the documented workflow.
- Commit the persistent-state update after the remote branch setup is complete.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial commit attribution corrected

### Completed

- Configured the repository-local Git identity as `Rabassoft <ricard@rabassoft.com>`.
- Amended the initial commit to replace its author and committer identity.
- Realigned local `main` and `develop` to the amended commit.
- Did not push either branch.

### Verification

- Confirmed author and committer name and email on the amended commit.
- Confirmed `main` and `develop` reference the same commit.
- Confirmed the working tree is clean on `develop`.

### Pending

- Push `main` and `develop` only when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial baseline and develop branch created

### Completed

- Reviewed the initial documentation snapshot and common credential patterns.
- Created the initial commit on `main`.
- Created local branch `develop` from the initial baseline and switched to it.
- Documented `main` as stable/deployment-ready and `develop` as the development integration branch.
- Did not push either branch.

### Verification

- Confirmed ignored files were excluded from the commit.
- Confirmed `main` and `develop` reference the same initial commit.
- Confirmed the working tree is clean on `develop`.

### Pending

- Push `main` and `develop` only when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Private GitHub repository connected

### Completed

- Cancelled the authentication flow for the incorrect `Ricard-Rabasso` account.
- Authenticated GitHub CLI as `rabassoft`.
- Created the private repository `rabassoft/schema-engine`.
- Configured `https://github.com/rabassoft/schema-engine.git` as `origin` for fetch and push.
- Did not create or push a commit.

### Verification

- Confirmed GitHub reports `rabassoft/schema-engine` with `PRIVATE` visibility.
- Confirmed the local `origin` fetch and push URLs.
- Confirmed the local branch remains `main` with no commits.

### Pending

- Review the untracked files and create the initial commit when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial Git ignore policy added

### Completed

- Added `.gitignore` entries for macOS metadata, dependencies, build/test output, tool caches, local environment files, debug logs, and IDE-local metadata.
- Kept the package-manager lockfile, `.env.example`, shared configuration, and conformance fixtures trackable.
- Did not stage or commit files.

### Verification

- Verified representative ignored paths with `git check-ignore`.
- Confirmed `.DS_Store` no longer appears in `git status`.
- Confirmed representative trackable paths are not ignored.

### Pending

- Review the untracked documentation set before creating the initial commit.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Git repository initialized

### Completed

- Initialized an empty Git repository with `main` as the initial branch.
- Left all project files untracked.
- Did not create a commit or configure a remote.

### Verification

- Confirmed the directory is a Git work tree.
- Confirmed the current branch is `main`.
- Confirmed the repository has no commits.

### Pending

- Decide whether to add a `.gitignore` before the initial commit.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Compiler-only plan proposed

### Completed

- Confirmed pnpm, a native workspace, `packages/core`, Vitest, and the public package name `@rabassoft/schema-engine`.
- Confirmed the object-parameter compiler API and root required/optional members.
- Accepted ADR-006 to record the package boundary and supersede the pre-SPEC package name.
- Updated SPEC-001 to Draft v0.1.3 with the approved compiler input and root optionality.
- Drafted decision-complete PLAN-001 with behavior, diagnostics, fixtures, implementation sequence, and acceptance commands.
- Confirmed that no workspace or production code was created.

### Verification

- Checked PLAN-001 against SPEC-001, accepted ADR-005 and ADR-006, and deferred decisions.
- Checked deterministic diagnostics, no-partial-result behavior, and first-prototype scope.
- Checked local Markdown links.

### Pending

- Review and approve PLAN-001.
- Do not create the workspace or implement `compileFormDefinition()` before approval.

## 2026-07-13 — ADR-005 accepted

### Completed

- Formally reviewed ADR-005 against SPEC-001 and the deferred-decisions register.
- Replaced the ambiguous semantic-keyword test with an explicit initial keyword classification.
- Clarified that ADR-005 does not decide how the source schema reaches `SchemaValidator`.
- Accepted ADR-005.
- Updated SPEC-001 to Draft v0.1.2 and removed dialect selection from its open decisions.
- Removed dialect selection from the deferred register's next decisions.

### Verification

- Checked the accepted ADR against SPEC-001 diagnostic and compilation contracts.
- Checked consistent ADR status, SPEC version, next action, and local Markdown links.
- Confirmed that no compiler code or monorepo was created.

### Pending

- Propose and approve a compiler-only implementation plan for `compileFormDefinition()`.
- Do not begin implementation before that plan is approved.

## 2026-07-13 — ADR-005 drafted

### Completed

- Approved the working policy for unknown JSON Schema keywords and missing `$schema`.
- Drafted ADR-005 with Draft 2020-12 as the reference dialect.
- Defined deterministic diagnostic codes and severities for dialect and keyword compatibility.
- Preserved external validation and the first-prototype subset boundaries.

### Verification

- Reviewed ADR-005 against SPEC-001 and the approved policy.
- Checked the ADR index, handoff, and project status for consistent next actions.
- Checked local Markdown links.

### Pending

- Formally review and accept ADR-005.
- Do not implement `compileFormDefinition()` before ADR-005 is accepted.

## 2026-07-13 — Documentation conflicts normalized

### Completed

- Kept SPEC-001 at Draft and synchronized its index at v0.1.1.
- Reserved global ADR-005 for the JSON Schema dialect and compatibility policy.
- Corrected stale documentation paths.
- Flagged conflicting pre-SPEC ADRs for later review without changing their decisions.
- Clarified that references to the planned dialect ADR as `ADR-001` in the historical entry below now refer to `ADR-005`.

### Verification

- Checked active references to the planned dialect ADR.
- Checked the SPEC status and version across canonical project documents.
- Checked referenced documentation paths.

### Pending

- Draft and review ADR-005.
- Do not implement `compileFormDefinition()` before ADR-005 is accepted.

## 2026-07-13 — Codex handoff prepared

### Completed

- Consolidated SPEC-001 v0.1.1.
- Added the deferred-decisions register.
- Added repository instructions for Codex.
- Identified ADR-001 as the next architectural deliverable.

### Verification

- Documentation reviewed by the project owner.
- ZIP integrity verified.

### Pending

- Draft and approve ADR-001.
- Do not create the monorepo before ADR-001 is approved.
