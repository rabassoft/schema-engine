# PLAN-023: Coordinated Experimental M20 delivery

- **Status:** Completed
- **Date:** 2026-07-20
- **Approval date:** 2026-07-20
- **Revision:** 0 — initial M21 three-established-package release plan
- **Requires:** Accepted
  [`SPEC-009 v0.1.0`](../specs/009-recursive-local-presentation-layout.md),
  [`ADR-018 revision 5`](../adrs/018-licencia-dual-publicacion-experimental.md),
  [`ADR-025 revision 0`](../adrs/025-bosques-presentacion-locales-objetos-items.md),
  [`ADR-010 revision 1`](../adrs/010-versionado-semver-compatibilidad.md),
  completed [`PLAN-022 revision 0`](./022-recursive-local-presentation-layout.md),
  completed [`PLAN-021 revision 0`](./021-coordinated-experimental-0-3-release.md)
  and accepted M21
  [`review 146`](../reviews/146-m21-coordinated-m20-release-promotion-readiness.md)
- **Architecture review:** ADR-018 revision 5
  [`review 147`](../reviews/147-adr-018-revision-5-review.md) cycle 5 passed
  fifteen areas with zero findings
- **Complete review:** [`review 148`](../reviews/148-plan-023-review.md) cycle 2
  passed all sixteen areas with zero findings
- **Milestone:** M21 — coordinated Public Experimental M20 delivery
- **Capabilities:** only completed M20 plus promoted D-034/D-040
- **Implementation:** Checkpoints 1–11 completed after final
  [`review 164`](../reviews/164-plan-023-final-review.md) cycle 3 passed the
  complete release closure with zero findings

## 1. Goal and hard boundary

Prepare, verify and, only through later separately authorized checkpoints,
publish the exact completed M20 source as:

| Package                                 | Version | Required packed Schema Engine peer |
| --------------------------------------- | ------- | ---------------------------------- |
| `@rabassoft/schema-engine`              | `0.4.0` | none                               |
| `@rabassoft/schema-engine-angular`      | `0.4.0` | core `^0.4.0`                      |
| `@rabassoft/schema-engine-angular-aria` | `0.2.0` | base Angular `^0.4.0`              |

All three packages remain Public + Experimental + Active under the accepted
AGPL-3.0-only/commercial model. Equal core/base versions remain independently
justified and do not establish lockstep. Published core/base `0.3.0` and pilot
`0.1.0` bytes remain immutable historical baselines.

The plan delivers only the already completed SPEC-009 behavior and migration.
It must not change runtime behavior, schemas, UI Schema, diagnostics,
operations, exports, entry points, Angular/Aria/CDK ranges, CSS properties,
support tiers or accepted M20 conformance merely to simplify release.

Plan approval may authorize only local checkpoints 1–3. Checkpoint 4 requires
separate authorization for one scoped commit and private `develop` push. Every
registry preflight is a separately authorized external read. Every npm publish,
dist-tag or corrective write requires its own immediate approval after exact
bytes, command and observed state are presented. No plan state authorizes an
external action.

## 2. Exact release contract

| Contract              | Required state                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Core                  | `@rabassoft/schema-engine@0.4.0`; no runtime dependency                                                            |
| Base Angular          | `@rabassoft/schema-engine-angular@0.4.0`; packed core peer `^0.4.0`; `tslib` only runtime dependency               |
| Angular Aria pilot    | `@rabassoft/schema-engine-angular-aria@0.2.0`; packed base peer `^0.4.0`; `tslib` only runtime dependency          |
| Angular peers         | core/forms `>=22.0.6 <23.0.0`, aligned at one exact patch                                                          |
| Pilot UI peers        | Aria/CDK `>=22.0.5 <23.0.0`; resolved CDK patch equals the exact peer required by resolved Aria                    |
| Exports/styles        | unchanged roots; pilot root provider plus opt-in `./styles.css` and exactly six Public Experimental CSS properties |
| License/source        | `AGPL-3.0-only` or separate commercial agreement; independently rebuildable package-local Corresponding Source     |
| Repository/provenance | private repository; no inaccessible repository URL, provenance, workflow or trusted publisher                      |
| `next` publication    | dependency-first: core, base Angular, pilot                                                                        |
| `latest` transition   | deepest-dependent-first: pilot, base Angular, core                                                                 |
| Registry evidence     | exact bytes/integrity/signature, aliases, access, peers, source/license and no unrelated settings/tag drift        |
| Accepted consumers    | no mixed-window completion evidence; final exact/`next`/`latest`/unqualified native and pilot evidence             |
| Stability             | Public + Experimental + Active; aliases are routing only                                                           |

The workspace root, validator, reference scenario catalog and Angular/Standard
applications remain private and absent from public artifacts. Core/base remain
free of pilot/Aria/CDK code and styles. The pilot neither bundles nor relicenses
Angular Aria/CDK.

Workspace manifests may retain `workspace:^` for local package linkage only if
packing deterministically produces the exact public peers above. The M21
descriptor and packed manifests, not coincident workspace syntax, are the
release contract.

## 3. Authorization zones

1. **Plan preparation/review:** documentation only; the current authorization.
2. **Local implementation:** checkpoints 1–3 only after plan approval.
3. **Private Git checkpoint:** checkpoint 4 only after separate authorization
   for the exact scoped commit and private `develop` push.
4. **Registry publication:** checkpoints 5–7; each read-only preflight and each
   package write has its own immediate gate.
5. **Default aliases:** checkpoints 8–10; each read-only preflight and each
   dist-tag write has its own immediate gate.
6. **Closure:** checkpoint 11 records observed verified state and grants no
   later version, Git, registry/settings or D-043 authority.

Authorization never flows to a later zone, checkpoint, package or command.
Tokens, OTPs, recovery codes and security-key material never enter repository
commands, captured output or project documentation.

## 4. Checkpoint 1 — M21 descriptor, manifests and repeat-release tooling

1. Add a new deeply frozen M21 descriptor for the exact package names,
   independent versions, dependency order, packed Schema Engine peers,
   candidate filenames, consumer modes and frozen compatibility tuples.
2. Preserve the M19 descriptor and every `0.3.0`/`0.1.0` evidence record as
   immutable history. Shared tooling may be generalized, but historical M19
   commands must continue to validate the exact old descriptor.
3. Change only the three workspace package versions to `0.4.0`, `0.4.0` and
   `0.2.0`. Preserve workspace links while proving their packed peers become
   core/base `^0.4.0`; update the lockfile only where mechanically required.
4. Fail closed on missing, duplicate or unexpected roles, names, versions,
   peers, files, package count, publication order, alias order or compatibility
   tuple.
5. Make candidate preparation, artifact/source/security verification and live
   verification select the M19 or M21 descriptor explicitly rather than
   silently changing the meaning of `--release=m19`.
6. Add explicit `test:consumer:m20:lower` and
   `test:consumer:m20:latest` candidate scripts plus exact/`next`/`latest`/
   unqualified M21 live scripts for the completed recursive-local scenario,
   while preserving frozen M18 native/pilot regressions.
7. Record exact package/version/file, bytes, SHA-512, integrity, toolchain,
   base/source commit, intended tag and no credential in candidate evidence.
8. Add focused tests for M19 immutability, exact M21 identities and peers,
   unequal pilot version, both orderings, malformed descriptors and an
   unexpected fourth package.

Gate: focused release-tool tests, exact historical M19 artifact/source/security
regressions, package/dependency checks and the private M20 source/package matrix
pass. No candidate is selected and no Git or external action occurs.

## 5. Checkpoint 2 — M21 release notes and package onboarding

1. Add `.ai-docs/releases/0.4.0.md` with candidate, partial-live and completed-
   live states; the exact three-package line; all SPEC-009 Public migrations;
   compatibility; installation modes and immutable recovery.
2. Explain recursive local presentation forests for nested-object and
   collection-item owners, generic family extension and Angular external-
   renderer narrowing without changing SPEC-009 or claiming Stable APIs.
3. Reconcile root and package READMEs, compatibility tables, ROADMAP and
   documentation checks with candidate truth. Before live evidence, nothing
   may say M21 is published or available under a moved alias.
4. Preserve `0.3.0` release notes and observed M19 tags as immutable history.
   Recommend exact versions or `@next` while M21 is staged.
5. Verify the three workspace/packed manifests retain exact exports,
   dependencies, peers, access, `next`, no provenance, license, author/contact
   and absent inaccessible repository metadata.
6. Verify each package independently carries LICENSE, NOTICE, SOURCE, preferred
   TypeScript and its frozen build harness with ordinary SemVer only.
7. Add stale-active checks for M19-as-current-source claims, M21 published
   before observation, wrong versions/peers/order, Stable/default conflation,
   public repository/provenance and obsolete compatibility claims.

Gate: release notes/onboarding describe only reviewed candidate state; package
and documentation checks pass; no candidate has been selected or external state
read.

## 6. Checkpoint 3 — Complete local M21 candidate gate

Run from the frozen workspace with the accepted Node 22/pnpm toolchain:

```text
CI=true pnpm install --frozen-lockfile --offline --ignore-scripts
pnpm format:check
pnpm docs:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
pnpm test:artifacts
pnpm test:artifacts:m18
pnpm test:source:m18
pnpm audit:m18
pnpm reference:snippets:check
pnpm reference:test:boundaries
pnpm reference:test:unit
pnpm reference:standard:test:unit
pnpm reference:test:e2e
pnpm reference:standard:test:e2e
pnpm test:consumer:m18:lower
pnpm test:consumer:m18:latest
pnpm test:consumer:m20:lower
pnpm test:consumer:m20:latest
git diff --check
```

The lower tuple remains Angular `22.0.6` plus Aria/CDK `22.0.5`; the frozen
latest-compatible tuple remains Angular `22.0.7` plus Aria/CDK `22.0.5`.
Candidate tuple installation is offline. Later live modes may resolve registry
metadata only behind their applicable read gate.

Then:

1. map all 27 SPEC-009 rows and its Public/Internal migration inventory to
   source, declaration, package, reference and clean-consumer evidence;
2. retain the 22-row SPEC-008/M18 regression and M19 exact artifact/source
   regression without interpreting old tags as M21 evidence;
3. pack all three artifacts deterministically under ignored `.release/0.4.0`,
   inventory every member/export/dependency/peer and rebuild each only from its
   extracted Corresponding Source in dependency order;
4. compare rebuilt declarations, exports and behavior with shipped outputs,
   including pilot styles, six CSS properties and recursive-local native/pilot
   behavior;
5. audit ownership/licensing and scan tracked/packed material for secrets,
   credentials, private links, personal data, `.ai-docs`, applications, tests
   and unexpected files;
6. dry-run each inspected tarball with `--access public`, `--tag next` and
   `--provenance=false`; copy exact bytes to a fresh neutral temporary
   directory, verify hashes again and repeat basename-relative dry runs there;
7. record Node/npm/pnpm versions, sizes, SHA-512/integrity, neutral basenames and
   `sourceCommit: null` without local username disclosure; and
8. correct findings and repeat the complete checkpoint review until one pass
   has zero findings.

Gate: three inspected dirty-tree candidates and a neutral procedure exist.
They are not selected publishable evidence and have no source commit. No Git,
registry, authentication, publication or tag action occurred.

## 7. Checkpoint 4 — Scoped commit, private push and clean rebuild

Stop for explicit authorization to:

1. review and account for the complete scoped M20/M21 diff, preserving any
   unrelated dirty change separately;
2. create one intentional commit and push that exact commit to private
   `origin/develop`;
3. rebuild from the clean committed tree and compare every candidate byte with
   the checkpoint-3 inputs; and
4. select only byte-identical clean candidates, then copy them to a fresh
   neutral directory and verify basenames, sizes, SHA-512 and integrity again.

Any unexplained difference restarts the complete local review. No Git tag,
GitHub Release, repository setting/visibility, registry read/write, package
setting or provenance action belongs here.

## 8. Checkpoint 5 — Core `0.4.0` publication under `next`

After separate authorization for the read-only preflight, prove the exact npm
registry, `ricardrabasso` identity, Rabassoft organization authority, write-
protected 2FA, absence of all M21 versions, immutable M19 exact bytes, selected
core bytes/source commit, core/base `next`/`latest: 0.3.0`, pilot
`next`/`latest: 0.1.0` and no unrelated settings drift. Any other baseline
stops the checkpoint.

Stop for immediate approval of only this credential-free neutral command:

```text
npm publish ./rabassoft-schema-engine-0.4.0.tgz --access public --tag next --provenance=false
```

After success, verify unauthenticated exact bytes, integrity/signature, access,
maintainers, manifest, source/license, absent repository/provenance,
core `next: 0.4.0`, unchanged core `latest: 0.3.0`, unchanged base
`next`/`latest: 0.3.0`, unchanged pilot `next`/`latest: 0.1.0` and no unrelated
drift. Run exact/`next` core consumers. If anything differs, document the
partial state and stop.

## 9. Checkpoint 6 — Base Angular `0.4.0` publication under `next`

After a separately authorized read-only preflight, reprove live core `0.4.0`,
selected base bytes, packed core peer `^0.4.0`, aligned Angular peers, source/
license, absence of base `0.4.0`, base `next`/`latest: 0.3.0` and unchanged
pilot `next`/`latest: 0.1.0`. Lower and latest-compatible native consumers must
pass using live core and selected base.

Stop for separate immediate approval of only:

```text
npm publish ./rabassoft-schema-engine-angular-0.4.0.tgz --access public --tag next --provenance=false
```

After success, repeat exact metadata/byte/source/security checks and exact/
`next` lower/latest native consumers. Verify base `next: 0.4.0`, base
`latest: 0.3.0`, pilot `next`/`latest: 0.1.0` and core's checkpoint-5 state. If
publication fails, preserve live core under its observed tags, document the
partial state and stop.

## 10. Checkpoint 7 — Angular Aria pilot `0.2.0` publication under `next`

After a separately authorized read-only preflight, reprove the live core/base
`0.4.0` pair, selected pilot bytes, packed base peer `^0.4.0`, unchanged
Angular/Aria/CDK ranges, exports/styles/source/license, absence of pilot `0.2.0`
and pilot `latest: 0.1.0`. Lower/latest native and pilot consumers
must pass against live core/base plus the selected pilot.

Stop for separate immediate approval of only:

```text
npm publish ./rabassoft-schema-engine-angular-aria-0.2.0.tgz --access public --tag next --provenance=false
```

After success, verify exact bytes/metadata/source/security, `next: 0.2.0`, the
unchanged `latest: 0.1.0`, no other alias/settings drift and exact/`next`
native/pilot consumers. No default alias moves before this checkpoint closes.

## 11. Checkpoint 8 — Pilot `latest` transition

After a separately authorized read-only preflight proves all three exact M21
packages and `next` aliases, exact M19 defaults (core/base `0.3.0`, pilot
`0.1.0`) and passing exact/`next` consumers, stop for immediate approval of
only:

```text
npm dist-tag add @rabassoft/schema-engine-angular-aria@0.2.0 latest
```

Verify only pilot `latest` changed and now resolves to inspected `0.2.0`; repeat
pilot exact bytes, metadata, peers, exports, source/license and no-drift checks.
Base/core defaults remain unchanged. This is a planned mixed window, so no
coordinated `latest` or unqualified evidence is accepted.

## 12. Checkpoint 9 — Base Angular `latest` transition

After a new separately authorized preflight verifies checkpoint 8 exactly,
stop for immediate approval of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular@0.4.0 latest
```

Verify only base `latest` changed and now resolves to inspected `0.4.0`; repeat
base bytes/metadata/peer/source checks. Core remains on its prior default. The
mixed window continues and still supplies no coordinated default evidence.

## 13. Checkpoint 10 — Core `latest` transition

After a new separately authorized preflight verifies checkpoint 9 exactly,
stop for immediate approval of only:

```text
npm dist-tag add @rabassoft/schema-engine@0.4.0 latest
```

Verify core/base `next`/`latest` resolve to inspected `0.4.0`, pilot
`next`/`latest` to inspected `0.2.0`, and no other alias/settings changed. Only
after the chain closes, run exact, `next`, `latest` and unqualified lower/latest
native and pilot consumers, including the recursive-local M20 scenario.

## 14. Checkpoint 11 — Final verified closure

Repeat from the beginning:

1. selected/live byte, integrity and signature equality for all M21 packages,
   plus immutable exact M19 package/source evidence;
2. public metadata, access, aliases, peers, exports, source/license, neutral
   path disclosure and absent repository/provenance for every package;
3. frozen workspace, format, docs, lint, types, tests, builds, packages,
   artifacts, source, security, snippets, boundaries and both browser lanes;
4. all 27 SPEC-009 rows, its exact migration map and the frozen SPEC-008/M18
   compatibility regression;
5. lower/latest native and pilot consumers in exact, `next`, `latest` and
   unqualified registry modes;
6. release notes, onboarding, ROADMAP, STATUS, Deferred, indexes, WORKLOG and
   plan/review consistency; and
7. absence of Stable, public-repository, provenance, automation, SLA or
   unsupported-framework claims.

Correct every finding and repeat the complete applicable review until one full
pass has zero findings. Only then mark PLAN-023 and M21 complete from observed
registry state. Completion grants no later commit, push, version, publication,
tag/settings, GitHub Release or D-043 authority.

## 15. Partial failure and exact recovery commands

| Last completed mutation | Truthful state and recovery boundary                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| None                    | Stop without registry change.                                                                                               |
| Core `next`             | Preserve core `0.4.0`; resume only after fresh verification or use a new approved SemVer if defective.                      |
| Core/base `next`        | Preserve both `0.4.0`; keep defaults unchanged and do not claim coordinated completion.                                     |
| All three `next`        | Preserve pilot `0.2.0`; reverify exact/next before any default moves.                                                       |
| Pilot `latest`          | Record the one-edge mixed window; separately advance base or separately restore pilot to its previously observed version.   |
| Base `latest`           | Record the one-edge mixed window; separately advance core or separately restore base, then pilot, to prior observed values. |
| All defaults moved      | Do not close before complete exact/next/latest/unqualified evidence and final zero-finding review.                          |

Before each write, its checkpoint record must provide exact credential-free
stop/resume commands using the selected neutral basename or fully qualified
package/version. A publication resume repeats the exact command in checkpoint
5, 6 or 7 only when the immutable target version remains absent. An alias
resume repeats only the applicable exact forward command:

```text
npm dist-tag add @rabassoft/schema-engine-angular-aria@0.2.0 latest
npm dist-tag add @rabassoft/schema-engine-angular@0.4.0 latest
npm dist-tag add @rabassoft/schema-engine@0.4.0 latest
```

Only the command for the currently authorized checkpoint may execute. If
Ricard instead selects restoration to the fully observed M19 default line, its
exact deepest-required correction sequence is:

```text
npm dist-tag add @rabassoft/schema-engine@0.3.0 latest
npm dist-tag add @rabassoft/schema-engine-angular@0.3.0 latest
npm dist-tag add @rabassoft/schema-engine-angular-aria@0.1.0 latest
```

Restoration starts at the first package whose alias actually moved and follows
only the commands required by observed state: core first if it moved, then base
if it moved, then pilot. Each command needs a fresh separate approval and
complete post-write observation; unused commands do not execute. Recovery
never overwrites/unpublishes bytes, reuses a defective version, deletes
`latest`, hides partial state or advances an unverified dependent. Package
defects require deprecation and/or a new reviewed SemVer.

## 16. Expected repository diff

Allowed after plan approval in checkpoints 1–3:

- new M21 descriptor/selection tooling, focused tests and root scripts;
- exact three manifest versions, packed peer expectations and only mechanically
  necessary lockfile state;
- M20 candidate/live/artifact/source/security/native/pilot verification;
- `.ai-docs/releases/0.4.0.md`, root/package onboarding and current-state docs;
- package-local build-harness changes strictly required to reproduce the exact
  already accepted M20 source; and
- plan/review/status/roadmap/deferred/index/worklog updates.

Forbidden:

- runtime/compiler/adapter/pilot behavior beyond completed M20;
- new/changed exports, entry points, CSS properties, runtime dependencies,
  Angular/Aria/CDK ranges, support tiers or schema behavior;
- changing/deleting M19 history, its descriptor or frozen verifier;
- publishing reference applications, validator, tests, `.ai-docs`, credentials,
  private repository metadata or third-party source;
- public GitHub, workflows, repository metadata, trusted/staged publishing,
  provenance, token policy, Git tag or GitHub Release; and
- Git or external action without its exact later gate.

## 17. Stop conditions

Stop on any:

- authoritative SPEC/ADR conflict or behavior/API/release widening;
- unexpected declaration, export, dependency, peer, style, package inventory,
  lockfile or generated-byte difference;
- incomplete Corresponding Source, rights uncertainty, secret, inaccessible
  link or personal/private metadata finding;
- failed frozen check, rebuild, consumer, browser, hash, integrity, signature or
  byte-equality check;
- identity, organization, 2FA, registry, version, tag, access or settings
  mismatch;
- need to expose GitHub, add repository metadata, claim provenance, weaken 2FA
  or activate D-043;
- partial package/tag state until documented and a separately approved resume
  or correction is selected; or
- commit, push, registry read, publish, dist-tag or external action without its
  applicable explicit gate.

## 18. Completion criteria

PLAN-023 completes only when:

1. exact core/base `0.4.0` and pilot `0.2.0` are public and byte-identical to
   selected clean committed candidates;
2. every `next` and `latest` resolves to those inspected bytes without drift;
3. exact, `next`, `latest` and unqualified native/pilot consumers pass at lower
   and latest-compatible accepted tuples with M20 recursive-local evidence;
4. package-local Corresponding Source, licensing, migration/release notes and
   immutable M19 evidence pass; and
5. one complete final review produces zero findings and reconciles all active
   state documents.

A dirty/pre-commit candidate, partial publication, mixed default window, failed
consumer or unresolved finding is a truthful partial state, not completion.

## 19. Review and approval state

Revision 0 was drafted on 20 July 2026 under the preparation authority granted
by Accepted ADR-018 revision 5. Review 148 cycle 1 found and corrected four
consumer-script, recovery-command, command-format and registry-baseline issues.
Cycle 2 repeated all sixteen areas with zero findings. Revision 0 was approved
under the standing zero-finding authorization on 20 July 2026.

Approval authorizes local checkpoints 1–3 only. Checkpoint 4, every registry
read and every publish, dist-tag or corrective mutation remain separately
gated. At approval time no implementation, manifest, candidate, Git, registry
or external action had occurred.

### 19.1 Implementation checkpoint 1

Checkpoint 1 completed on 20 July 2026. A new deeply frozen M21 descriptor owns
the exact `0.4.0`/`0.4.0`/`0.2.0` line, dependency publication order,
pilot/base/core default order, packed peers, filenames, tuples and candidate/
live modes. Current manifests carry only the approved versions and retain
workspace links that pack to the exact `^0.4.0` peers.

Review 149 cycle 1 corrected one stale pilot package-smoke version, exact
Schema Engine peer/link allowlisting and the offline-store execution
environment. Cycle 2 repeated all twelve areas with zero findings. The M19
descriptor and exact published artifacts remain immutable; M21 artifacts,
source rebuilds, security, 689 tests and lower/latest native/pilot M20 consumers
pass. No lockfile change, candidate, `.release/0.4.0`, Git, registry or external
action occurred. At that checkpoint boundary, checkpoint 2 was next.

### 19.2 Implementation checkpoint 2

Checkpoint 2 completed on 20 July 2026. Candidate-truthful `0.4.0` release
notes distinguish the reviewed M21 source line from live M19, document the
complete SPEC-009 Public migration, frozen compatibility, candidate/partial/
completed-live states and exact immutable recovery. Root/package onboarding
reports both source manifests and observed public versions without predicting
M21 availability.

Documentation verification now fails closed on stale source state, premature
publication/aliases, wrong versions/peers/orders, obsolete compatibility,
Stable/default conflation and public-repository/provenance claims. Review 150
cycle 1 corrected ROADMAP source truth, exact recovery detail and semantic
manifest/style verification; cycles 2–4 corrected stale selected-candidate
wording and its exact artifact marker, and cycle 5 repeated all twelve areas with zero
findings. No candidate, `.release/0.4.0`, lockfile, Git, registry or external
action occurred. At that checkpoint boundary, checkpoint 3 followed.

### 19.3 Implementation checkpoint 3

Checkpoint 3 completed on 20 July 2026. The frozen workspace, complete build,
689-test, package, artifact, source, security, reference and lower/latest native
and pilot consumer matrix passes. Review 151 maps all 27 SPEC-009 rows and the
Public/Internal migration inventory with zero unresolved findings.

Two consecutive preparations produced the same three ignored dirty-tree
candidates. Their evidence records exact sizes, SHA-512/integrity, Node/npm/pnpm,
neutral basenames, `sourceCommit: null` and successful original plus fresh
neutral-directory dry runs. Review cycle 1 found only the necessarily stale
pre-candidate active documentation; cycle 2 repeated the complete applicable
review after reconciliation and passed with zero findings. These artifacts are
comparison inputs, not selected publishable evidence. No lockfile, Git,
registry, authentication, publication, tag or external action occurred.

There is no active implementation task. Checkpoint 4 must stop for explicit
authorization before scoped diff review, commit/private push and clean
committed-tree byte comparison.

### 19.4 Implementation checkpoint 4

Checkpoint 4 completed on 20 July 2026. The reviewed scope contained 128
M20/M21 source, reference, package, release-tooling and documentation files.
The unrelated `angular.json` CLI analytics opt-out was excluded unchanged.

Commit `07755b4cbe31098f86099db38c65930d52772fb5` was created as
`Rabassoft <ricard@rabassoft.com>` with subject
`feat: add recursive local presentation and prepare 0.4 release` and pushed to
private `origin/develop`. A detached clean worktree at that exact commit passed
the frozen install and complete candidate preparation. Its three artifacts are
byte-identical to checkpoint-3 inputs and evidence records both `baseCommit`
and `sourceCommit` as the exact commit plus `neutralDryRun: true`.

Review 152 cycle 1 corrected the clean environment's missing ignored historical
baselines; cycle 2 completed the clean reconstruction and identified only stale
pre-selection active documentation; cycle 3 repeated the complete applicable
evidence, documentation and diff review with zero findings. The clean bytes are
the only selected M21 candidates. Checkpoint 5 must stop for separate
authorization before any registry read, and its publish command retains a later
independent immediate gate.

### 19.5 Checkpoint 5 pre-publication gate

Ricard authorized the read-only preflight on 20 July 2026. The first attempt
confirmed npm `10.9.8` and exact registry `https://registry.npmjs.org/`, but
`npm whoami`, profile, organization and access reads returned `E401`. The gate
stopped before any package metadata, version or tag query. No authentication
change, publication, dist-tag, package setting or other mutation occurred.

Ricard restored the npm session interactively. Review 153 cycle 2 restarted the
complete preflight and found only an unusable global npm cache during the
credential-free neutral dry run. Cycle 3 repeated all nine areas with a fresh
temporary cache and passed with zero findings: exact registry/npm,
`ricardrabasso`, verified email, write-protected 2FA, Rabassoft owner/read-write
authority, public access, M21 version absence, immutable M19 bytes and aliases,
selected core bytes/source/manifest/license and no unrelated drift all match
the approved baseline.

No publication, dist-tag, package setting, GitHub, repository or provenance
mutation occurred. The pre-publication gate is complete; stop for independent
immediate approval of only the exact core command in section 8.

Ricard ran that exact command on 20 July 2026. Review 154 cycle 1 corrected the
necessarily stale pre-publication documentation and an unsafe mixed-generation
root onboarding example. Cycle 2 corrected stale active documentation/link
counts; cycle 3 corrected two remaining active routing/plan-header phrases;
cycle 4 removed volatile active document/link counts; cycle 5 repeated all ten
areas with zero findings.
The public artifact is byte-identical to the selected 218,187-byte candidate,
retains exact integrity and an npm registry signature, public access, sole
expected maintainer, manifest/source/license and no repository/provenance.

Core exact/`next` consumers pass and `next` alone resolves to `0.4.0`; core
`latest` remains `0.3.0`, base remains `next`/`latest: 0.3.0` and pilot remains
`next`/`latest: 0.1.0`. Checkpoint 5 is complete. Checkpoint 6 must stop for
separate authorization before its read-only preflight, and base publication
retains a later independent immediate gate.

### 19.6 Checkpoint 6 pre-publication gate

Ricard authorized the read-only base Angular preflight on 20 July 2026. Review
155 cycle 1 passed all nine areas with zero findings: authenticated authority,
live byte-identical core `0.4.0`, selected base bytes/source, packed core peer
`^0.4.0`, aligned Angular peers, package source/license, absent base `0.4.0`,
unchanged aliases/settings, lower/latest native consumers and a credential-free
neutral dry run all match the approved baseline.

No publication or registry mutation occurred. The pre-publication gate is
complete; stop for independent immediate approval of only the exact base
Angular command in section 9.

Ricard ran that exact command on 20 July 2026. Review 156 cycle 1 corrected the
necessarily stale pre-publication documentation, ambiguous M19/M21 source
attribution and an outdated Angular-endpoint description. Cycle 2 repeated all
ten areas with zero findings. The public 126,564-byte artifact is
byte-identical to the selected candidate, retains exact SHA-512/integrity and
an npm registry signature, public access, sole expected maintainer, manifest/
peers/source/license and no repository/provenance metadata.

Exact and `next` clean consumers resolve the public core/base `0.4.0` pair and
pass at Angular `22.0.6` and `22.0.7`. Core/base `latest` remain `0.3.0`; the
pilot remains `next`/`latest: 0.1.0`. Checkpoint 6 is complete. Checkpoint 7
must stop for separate authorization before its read-only pilot preflight, and
pilot publication retains a later independent immediate gate.

### 19.7 Checkpoint 7 pre-publication gate

Ricard authorized the read-only Angular Aria pilot preflight on 20 July 2026.
Review 157 cycle 1 found only that the review procedure ran both fixed-port
Chromium matrices concurrently, causing a port collision. Cycle 2 repeated all
nine areas with the lower/latest matrices serialized and zero findings:
authenticated identity/2FA/authority, live byte-identical core/base `0.4.0`,
selected pilot bytes/source, packed base peer `^0.4.0`, unchanged Angular/Aria/
CDK ranges, exports/styles/source/license, absent pilot `0.2.0`, unchanged
aliases/settings, lower/latest native and pilot consumers and a credential-free
neutral dry run all match the approved baseline.

No publication or registry mutation occurred. The pre-publication gate is
complete; stop for independent immediate approval of only the exact pilot
command in section 10.

Ricard ran that exact command on 20 July 2026. Review 158 cycle 1 corrected three
stale documentation-check/onboarding rules. Cycle 2 repeated all ten areas with
zero findings. Public pilot `0.2.0` is byte-identical to the selected 28,618-byte
candidate and retains exact integrity, an npm registry signature, public access,
sole expected maintainer, manifest/peers/exports/styles/source/license and no
repository/provenance metadata.

All three exact and `next` packages resolve to inspected M21 bytes. Serialized
lower/latest native and pilot M20 consumers pass partial compilation, strict
typecheck, unit tests, production builds and Chromium smoke. Core/base `latest`
remain `0.3.0` and pilot `latest` remains `0.1.0`. Checkpoint 7 is complete.
Checkpoint 8 must stop for separate authorization before its read-only pilot
`latest` preflight, and the dist-tag mutation retains a later independent gate.

### 19.8 Checkpoint 8 pre-transition gate

Ricard authorized the read-only pilot-`latest` preflight on 20 July 2026.
Review 159 cycle 1 passed all nine areas with zero findings: registry/tool,
identity/2FA/authority, byte-identical signed M21 exact/`next`, immutable M19
defaults, manifests/peers/exports/source/license, aliases/settings and
serialized exact/`next` lower/latest native/pilot consumers all match the
approved baseline. One transient registry `ENOTFOUND` retried successfully and
did not change package resolution or evidence.

No dist-tag, package setting, GitHub, repository or provenance mutation
occurred. The read-only gate is complete; stop for independent immediate
approval of only the exact pilot `latest` command in section 11. Base/core
aliases and every other mutation remain separately gated.

Ricard ran that exact command on 20 July 2026. Review 160 cycle 1 corrected one
overbroad checkpoint-8 ROADMAP stale-state expression. Cycle 2 corrected the
canonical release-review marker. Cycle 3 repeated all eight post-transition
areas with zero findings. Pilot resolves
`next`/`latest: 0.2.0` to its selected signed bytes; core/base remain
`next: 0.4.0`, `latest: 0.3.0`. Pilot metadata, peers, exports, styles,
source/license, public access and provenance-disabled boundary remain exact,
with no unrelated alias/settings drift.

No `latest` or unqualified consumer evidence is accepted in this planned mixed
window; review 159's exact/`next` evidence remains applicable. Checkpoint 8 is
complete. At that boundary checkpoint 9 still required separate authorization
for its read-only base Angular `latest` preflight, while the base dist-tag
mutation retained a later independent immediate gate.

### 19.9 Checkpoint 9 pre-transition gate

Ricard authorized the read-only base-`latest` preflight on 20 July 2026.
Review 161 cycle 1 corrected one overbroad ROADMAP stale-state expression.
Cycle 2 corrected formatting in the new review document. Cycle 3 corrected a
required-marker line break in the release note. Cycle 4 corrected the second
literal release marker. Cycle 5 repeated all eight areas with zero findings:
npm tool,
registry, identity/2FA/authority, byte-identical signed M21 exact/`next`, exact
base manifest/peers/exports/source/license, checkpoint-8 aliases and serialized
exact/`next` lower/latest native/pilot consumers all match the approved
baseline.

No dist-tag, package setting, GitHub, repository or provenance mutation
occurred. The read-only gate is complete; stop for independent immediate
approval of only the exact base Angular `latest` command in section 12. Core
and every other mutation remain separately gated.

Ricard ran that exact command on 20 July 2026. Review 162 cycle 1 reconciled the
expected stale pre-transition active documentation. Cycle 2 repeated all eight
post-transition areas with zero findings. Base resolves
`next`/`latest: 0.4.0` to its selected signed bytes; pilot remains
`next`/`latest: 0.2.0`; core remains `next: 0.4.0`, `latest: 0.3.0`. Base
metadata, peers, exports, source/license, public access and
provenance-disabled boundary remain exact, with no unrelated alias/settings
drift.

No `latest` or unqualified consumer evidence is accepted in this planned mixed
window; review 161's exact/`next` evidence remains applicable. Checkpoint 9 is
complete. Checkpoint 10 must stop for separate authorization before its
read-only core `latest` preflight, and the core dist-tag mutation retains a
later independent immediate gate.

Before that preflight completed, Ricard's subsequent “hecho” corresponded to
the exact core command in section 13 already having run. The first registry
observation therefore found core `next/latest: 0.4.0`. No rollback or other
mutation was attempted; verification switched immediately to the documented
fail-closed post-transition path.

Review 163 cycle 1 records that procedural deviation and reconciles the
necessarily stale checkpoint-9 active documentation. Cycle 2 restored the
explicit pinned M19 core version in onboarding. Cycle 3 repeated all nine
post-transition areas with zero findings. Core/base resolve
`next/latest: 0.4.0`; pilot resolves `next/latest: 0.2.0`; all selected bytes,
signatures, metadata, peers, exports, source/license, public access and settings
remain exact.

Serialized lower/latest native and pilot consumers pass in exact, `next`,
`latest` and unqualified modes. The planned mixed window is closed. Checkpoint
10 is complete; checkpoint 11's complete final closure review remains
separately gated and no further registry mutation is authorized.

### 19.11 Final verified closure

Checkpoint 11 completed on 20 July 2026. Review 164 cycle 1 recorded the
restricted-sandbox esbuild abort and corrected two stale active mixed-window
claims in root onboarding and the release notes. Cycle 2 found and corrected
closing-document formatting. Cycle 3 restarted the complete review and passed
all eighteen areas with zero findings.

The final pass reverified npm identity, 2FA and Rabassoft authority; exact
selected/live M21 bytes, integrity, signatures, access, aliases, manifests,
peers, exports, Corresponding Source, licensing and no provenance/repository
metadata; immutable M19 evidence; the frozen workspace and complete package,
source, security and reference matrix; all 27 SPEC-009 rows and the frozen
SPEC-008/M18 regression; and all eight exact/`next`/`latest`/unqualified
lower/latest native/pilot consumers. PLAN-023 revision 0 and M21 are complete.
No later commit, push, version, registry/settings, GitHub Release, repository
visibility, provenance, automation or Deferred capability is authorized.
