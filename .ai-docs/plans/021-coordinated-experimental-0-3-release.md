# PLAN-021: Coordinated Experimental 0.3 release and Angular Aria pilot

- **Status:** Approved
- **Date:** 2026-07-19
- **Approval date:** 2026-07-19
- **Revision:** 0 — initial three-package M19 release plan
- **Requires:** Accepted
  [`SPEC-008 v0.1.0`](../specs/008-static-advanced-presentation-layout.md),
  [`ADR-018 revision 4`](../adrs/018-licencia-dual-publicacion-experimental.md),
  [`ADR-024 revision 1`](../adrs/024-spi-contenedores-angular-y-piloto-angular-aria.md),
  [`ADR-010 revision 1`](../adrs/010-versionado-semver-compatibilidad.md),
  completed [`PLAN-020 revision 0`](./020-static-advanced-presentation-layout.md)
  and accepted M19 [`review 114`](../reviews/114-m19-coordinated-0-3-release-promotion-readiness.md)
- **Architecture review:** ADR-018 revision 4
  [`review 115`](../reviews/115-adr-018-revision-4-review.md) cycle 4 passed
  thirteen areas with zero findings
- **Complete review:** [`review 116`](../reviews/116-plan-021-review.md) cycle 3
  passed all fourteen areas and closing documentation with zero findings
- **Milestone:** M19 — coordinated Public Experimental `0.3.0` release
- **Capabilities:** only already completed M18 plus promoted D-034/D-040
- **Implementation:** Local checkpoints 1–3 authorized by approval; checkpoint
  4, registry reads and every npm mutation remain separately gated

## 1. Goal and hard boundary

Prepare, verify and, only through later separately authorized checkpoints,
publish the exact completed M18 source as:

| Package                                 | Version | Required Schema Engine peer |
| --------------------------------------- | ------- | --------------------------- |
| `@rabassoft/schema-engine`              | `0.3.0` | none                        |
| `@rabassoft/schema-engine-angular`      | `0.3.0` | core `^0.3.0`               |
| `@rabassoft/schema-engine-angular-aria` | `0.1.0` | base Angular `^0.3.0`       |

All three packages remain Public + Experimental + Active under the accepted
AGPL-3.0-only/commercial model. Coordinated delivery does not establish
lockstep versioning or Stable support. Published core/base `0.2.0` bytes remain
immutable and continue to provide the historical baseline.

This plan must not change runtime behavior, schemas, UI Schema, diagnostics,
operations, exports, entry points, peer ranges, styles or support tiers merely
to simplify release. SPEC-008 remains authoritative for the complete M18
observable contract.

Plan approval may authorize only local checkpoints 1–3. Checkpoint 4 requires
separate commit and private-push authorization. Every registry preflight is an
external read checkpoint, and every npm publication, dist-tag change or
corrective mutation requires its own immediate approval after exact bytes,
command and observed state are presented. No plan state itself authorizes an
external action.

## 2. Exact release contract

| Contract                       | Required state                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Core                           | `@rabassoft/schema-engine@0.3.0`; no runtime dependency                                                            |
| Base Angular                   | `@rabassoft/schema-engine-angular@0.3.0`; packed core peer `^0.3.0`; `tslib` only runtime dependency               |
| Angular Aria pilot             | `@rabassoft/schema-engine-angular-aria@0.1.0`; packed base peer `^0.3.0`; `tslib` only runtime dependency          |
| Angular peers                  | core/forms `>=22.0.6 <23.0.0`, aligned at one exact patch                                                          |
| Pilot UI peers                 | Aria/CDK `>=22.0.5 <23.0.0`; resolved CDK patch equals the exact peer required by resolved Aria                    |
| Pilot exports                  | root provider only plus opt-in `./styles.css`; exactly six Public Experimental CSS properties                      |
| License/source                 | `AGPL-3.0-only` or separate commercial agreement; complete independently rebuildable package-local source          |
| Repository/provenance          | private repository; no inaccessible repository URL, provenance, workflow or trusted publisher                      |
| Publication channel            | dependency-first under `next`: core, base Angular, then pilot                                                      |
| Established default transition | dependent-first: base Angular `latest`, then core `latest`                                                         |
| Pilot default alias            | observe after first publish; retain if created, otherwise add only through a separate later approval               |
| Registry evidence              | exact bytes/integrity/signature, aliases, public access, peers, source/license and no unrelated settings/tag drift |
| Accepted consumers             | no mixed-window evidence; final exact, `next`, `latest` and unqualified native/pilot consumers from observed bytes |
| Stability                      | Public + Experimental + Active; every alias is routing only                                                        |

The workspace root, validator package, reference scenario catalog and Angular/
Standard applications remain private and absent from all public artifacts.
Core/base artifacts contain no pilot, Aria/CDK import, peer, style or asset.
The pilot does not bundle, copy or relicense Angular Aria/CDK.

## 3. Authorization zones

1. **Plan preparation/review:** documentation only; the current authorization.
2. **Local implementation:** checkpoints 1–3 only after explicit plan approval.
3. **Private Git checkpoint:** checkpoint 4 only after explicit authorization
   for the intentionally scoped commit and private `develop` push.
4. **Registry publication:** checkpoints 5–7, with a fresh read-only preflight
   and a separate immediate approval before each package write.
5. **Default aliases:** checkpoints 8–10, with one immediate approval per
   required dist-tag mutation and no evidence accepted from mixed windows.
6. **Closure:** checkpoint 11 records only observed verified state and grants no
   later version, Git, registry/settings or D-043 authority.

An approval for one zone, checkpoint, package or command does not flow to the
next one. OTPs, tokens, recovery codes and security-key material never enter a
command committed to the repository, captured output or project documentation.

## 4. Checkpoint 1 — Three-package release tooling

Generalize the existing two-package release tooling to an explicit release
descriptor without weakening the immutable `0.2.0` regression:

1. represent the exact three package names, independent versions, dependency
   order, packed Schema Engine peers and candidate filenames in one validated
   M19 release descriptor;
2. fail closed on a missing, duplicate or unexpected package, version, peer,
   artifact or publication order;
3. make candidate preparation, metadata, live verification and consumer modes
   consume that descriptor instead of assuming two equal package versions;
4. extend artifact/source/security checks to the pilot's root/style exports,
   six CSS properties, peers, `sideEffects`, files and source harness;
5. preserve `test:artifacts` as a frozen byte-identical public `0.2.0`
   regression independent of mutable tags;
6. add focused tooling tests for independent versions, dependency order,
   invalid mixed descriptors, pilot omission and unexpected fourth packages;
7. define separate exact, `next`, `latest` and unqualified live modes, plus
   native and pilot consumers, without accepting a mixed registry window; and
8. record candidate metadata with exact package/version/file, bytes, SHA-512,
   integrity, toolchain, base/source commit, intended tag and no credential.

Gate: focused release-tool tests, historical `0.2.0` artifact regression and
the existing private M18 package/source/security checks pass. Production source
and package versions do not change; no release candidate or external action is
accepted yet.

## 5. Checkpoint 2 — M19 release documentation and candidate contract

1. Add `.ai-docs/releases/0.3.0.md` describing the candidate state, exact three-
   package matrix, all SPEC-008 Public migrations, installation modes, Angular/
   Aria/CDK compatibility, opt-in stylesheet and six properties.
2. Document root-only static layout, Angular container SPI, mandatory native
   fallback and optional Angular Aria pilot without claiming a Stable API,
   generic UI kit, Standard package, React/Vue support or runtime kit switching.
3. Retain exact `0.2.0` history and clearly distinguish candidate, partial-live
   and completed-live states. Recommend exact versions or `@next` while the
   release is staged; do not predict the pilot's first `latest` result.
4. Reconcile root/package onboarding, compatibility tables, pilot README,
   ROADMAP and documentation checks with the same state. Before live evidence,
   nothing may say that M19 is published.
5. Verify all three manifests remain at their already accepted target versions
   and preserve exact exports, dependencies, peers, access, `next`, no
   provenance, license, author/contact and absent repository URL.
6. Verify every package independently carries LICENSE, NOTICE, SOURCE, preferred
   TypeScript and a frozen source-build harness with ordinary SemVer only.
7. Add stale-active-document checks for two-package M19, unpublished claims
   after observed publication, Stable/default-channel conflation, mandatory or
   absent pilot `latest`, public repository/provenance and obsolete peers.

Gate: release notes and onboarding describe only the reviewed candidate state;
manifests/declarations contain exactly SPEC-008's accepted line, and no
candidate intended for live publication has yet been selected.

## 6. Checkpoint 3 — Complete local candidate gate

Run from the frozen workspace using the accepted Node 22/pnpm toolchain:

The two checkpoint consumer commands use the frozen accepted tuples: lower
Angular `22.0.6` and latest-compatible Angular `22.0.7`, both with Aria/CDK
`22.0.5`. They install offline and must not resolve metadata from npm. Later
live consumer commands declare registry-backed tuple resolution explicitly and
remain behind their applicable external-read gate.

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
git diff --check
```

Then:

1. map all 22 SPEC-008 conformance rows and its Public/Internal migration
   inventory to passing source, declaration, package, application and clean-
   consumer evidence;
2. pack all three artifacts deterministically under ignored `.release/0.3.0`,
   inventory every member/export/dependency/peer and rebuild each package only
   from its extracted Corresponding Source in dependency order;
3. compare rebuilt declarations, exports and executable behavior with shipped
   outputs, including pilot style bytes and the six exact properties;
4. audit third-party ownership/licensing and scan tracked/packed material for
   secrets, credentials, private links, personal address/tax data, `.ai-docs`,
   applications, tests and unexpected files;
5. run `npm publish --dry-run` only against the inspected tarballs with
   `--access public --tag next --provenance=false`;
6. copy the exact bytes to a newly created neutral temporary directory, verify
   hashes again and rehearse basename-relative dry runs there;
7. record exact Node/npm/pnpm versions, byte sizes, SHA-512/integrity, neutral
   basenames and intended source commit without recording the local username;
8. repeat the complete implementation review after every correction until one
   full pass has zero findings.

Gate: three inspected pre-commit candidates and a neutral-path procedure exist.
They are not publishable evidence while the tree is dirty and have no selected
source commit. No Git operation, registry read/write, authentication or tag
mutation has occurred.

## 7. Checkpoint 4 — Scoped commit, private push and clean rebuild stop

Stop for explicit authorization to:

1. review the complete scoped diff and account separately for the existing
   unrelated `angular.json` analytics opt-out;
2. commit the fully reviewed M18/M19 preparation intentionally, excluding any
   unrelated change unless Ricard explicitly includes it;
3. push that exact commit to private `develop`; and
4. rebuild from the clean committed tree, compare every output with pre-commit
   candidates and select only clean candidate hashes for publication.

Copy the selected bytes into a fresh neutral temporary directory and verify
their hashes again. Record the source commit, exact basenames, bytes, SHA-512
and integrity. Any unexplained byte difference restarts the complete local
review; it is never normalized away.

No Git tag, GitHub Release, repository visibility/settings change, registry
query/write, package setting or provenance action belongs to this checkpoint.

## 8. Checkpoint 5 — Core `0.3.0` publication under `next`

After separate authorization for this external read-only preflight, prove:

- registry is exactly `https://registry.npmjs.org/`, publishing identity is
  `ricardrabasso`, organization control and write-protected 2FA remain valid;
- all three exact target versions are absent and the authenticated identity can
  publish every exact package name, including first creation of the pilot;
- core/base `next` and `latest` still resolve to their verified `0.2.0` bytes,
  the pilot name is still absent and no unrelated package/tag drift exists;
- core/base `0.2.0` exact bytes remain immutable;
- selected core bytes/hash/source commit still match checkpoint 4;
- observed current core tags are recorded without assuming their values; and
- exact npm CLI version and neutral basename-relative command are recorded.

Stop for immediate approval of only:

```text
npm publish ./rabassoft-schema-engine-0.3.0.tgz --access public --tag next --provenance=false
```

After success, verify unauthenticated exact bytes/integrity/signature, public
access and maintainers, manifest, tags, dependencies/peers, license/source,
absent repository/provenance, `next: 0.3.0`, unchanged `latest: 0.2.0`, neutral
public path metadata and clean exact/next core consumers. Reobserve the other
two package names and reject any unrelated registry drift. Any unexpected
bytes, alias or settings drift stops the plan.

## 9. Checkpoint 6 — Base Angular `0.3.0` publication under `next`

After separate authorization for this external read-only preflight, verification
against live core `0.3.0` must reprove the selected base hash, packed core peer
`^0.3.0`, aligned Angular peers, source/license, unchanged base
`latest: 0.2.0` and absence of base `0.3.0`. Lower and latest-compatible clean
native consumers must pass against live core plus the selected base candidate.

Stop for separate immediate approval of only:

```text
npm publish ./rabassoft-schema-engine-angular-0.3.0.tgz --access public --tag next --provenance=false
```

After success, verify exact bytes/integrity/signature, public access and
maintainers, complete metadata, dependencies/peers, license/source, absent
repository/provenance, `next: 0.3.0`, unchanged `latest: 0.2.0`, neutral path
disclosure and no unrelated registry drift. Run exact/next core/base native
consumers at both accepted Angular tuples. If publication fails, preserve core
under observed tags, document the partial state and stop.

## 10. Checkpoint 7 — Angular Aria pilot `0.1.0` publication under `next`

After separate authorization for this external read-only preflight, prove the
exact core/base live `0.3.0` pair under `next`, passing native consumers,
selected pilot bytes/hash, base peer `^0.3.0`, exact Angular/Aria/CDK
constraints, source/license/style isolation and continued absence of pilot
`0.1.0`. Lower and latest-compatible pilot consumers must pass with live core/
base and the selected pilot candidate.

Stop for separate immediate approval of only:

```text
npm publish ./rabassoft-schema-engine-angular-aria-0.1.0.tgz --access public --tag next --provenance=false
```

After success, observe rather than predict all pilot aliases. Verify exact
bytes/integrity/signature, public access, newly established package ownership/
maintainers, complete metadata, dependencies/peers, root/style exports, six CSS
properties, license/Corresponding Source, absent repository/provenance,
`next: 0.1.0`, neutral path disclosure and no unrelated registry drift. Run
exact/next pilot and native consumers.

If publication fails, preserve the live core/base `next` pair and their old
defaults, document the partial state and stop. Do not move established
`latest` aliases before the pilot succeeds.

## 11. Checkpoint 8 — Pilot `latest` observation and optional establishment

Read-only observation after checkpoint 7 determines one of two branches:

1. if pilot `latest` already resolves to the inspected `0.1.0`, verify and
   retain it without mutation; or
2. if pilot `latest` is absent, first complete exact/next verification, then
   stop for separate immediate approval of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular-aria@0.1.0 latest
```

After an authorized write, repeat exact bytes/integrity/signature, public
access/maintainers, complete metadata, peers, exports, source/license and
absent repository/provenance checks; verify only the intended alias changed and
both pilot `next`/`latest` resolve to inspected bytes. Any third outcome,
unexpected alias or inability to establish/verify the default stops the plan.
Never assume an observed default alias can be deleted.

## 12. Checkpoint 9 — Base Angular `latest` transition

Preconditions are all three exact packages verified, all three `next` aliases
on the inspected M19 line, pilot `latest` verified, established core/base
`latest` aliases still at their observed pre-transition values, exact/next
native and pilot consumers passing and no open release finding.

Stop for immediate approval of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular@0.3.0 latest
```

Repeat the exact base bytes/integrity/signature, public access/maintainers,
metadata, peer, source/license and absent repository/provenance checks. Verify
the exact base alias mutation and no other drift. Core `latest` remains on its
prior version, so this is a planned minimal mixed window. Do not run or accept
coordinated latest/unqualified consumer evidence from it.

## 13. Checkpoint 10 — Core `latest` transition

After fresh observation of checkpoint 9, stop separately for immediate
approval of only:

```text
npm dist-tag add @rabassoft/schema-engine@0.3.0 latest
```

Verify core/base `next` and `latest` resolve to the inspected `0.3.0` pair and
pilot `next`/`latest` to inspected `0.1.0`, with no other tag/settings drift.
Then run exact, `next`, `latest` and unqualified clean native and pilot
consumers at lower and current latest-compatible Angular/Aria/CDK tuples.

If core mutation fails after base moved, stop in the documented mixed state.
Restoring base `latest` to its previous verified value is a new corrective
mutation requiring separate immediate approval and post-write verification.

## 14. Checkpoint 11 — Final verified closure

Repeat from the beginning:

1. exact selected/live byte, integrity and signature equality for all three
   versions, plus immutable exact `0.2.0` core/base regression;
2. public metadata, access, aliases, peers, exports, source/license, neutral
   path disclosure and absent repository/provenance for every package;
3. frozen workspace, format, docs, lint, types, tests, builds, packages,
   artifacts, source, security, snippets, boundaries and both browser lanes;
4. all 22 SPEC-008 conformance rows and exact Public/Internal migration map;
5. lower/latest-compatible native and pilot consumers in exact, `next`,
   `latest` and unqualified registry modes;
6. release notes, root/package onboarding, ROADMAP, STATUS, deferred register,
   indexes, WORKLOG and plan/review consistency; and
7. no Stable, public-repository, provenance, automation, contribution, support
   SLA or unimplemented-framework claim.

Correct every finding and repeat the complete applicable review until one full
pass has zero findings. Only then mark PLAN-021 and M19 complete from observed
registry state. Completion grants no later commit, push, version, publication,
tag/settings change, GitHub Release or D-043 authorization.

## 15. Partial failure and immutable recovery

| Last completed mutation        | Required truthful state and recovery boundary                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| None                           | Stop without registry change.                                                                                                 |
| Core `next` only               | Preserve core `0.3.0`; resume only after fresh exact/tag verification or publish a corrected new version if defective.        |
| Core/base `next`               | Preserve both `0.3.0` versions; keep established defaults unchanged and do not claim coordinated completion.                  |
| All three `next`               | Preserve pilot `0.1.0`; resolve/verify pilot default branch before established defaults move.                                 |
| Pilot `latest` verified        | Preserve all package bytes/aliases; proceed only after fresh three-package exact/next consumers.                              |
| Base `latest` moved            | Record the mixed window; either separately move core or separately approve a corrective base tag to its prior verified value. |
| Core/base defaults coordinated | Do not close until full exact/next/latest/unqualified native/pilot evidence and final review pass.                            |

A package defect uses deprecation and/or a new SemVer version; an alias defect
uses a separately approved corrective tag. Recovery never overwrites bytes,
reuses a version, assumes unpublish, deletes an observed default alias, hides a
partial state or advances an unverified dependent.

## 16. Expected repository diff

Allowed:

- explicit three-package release descriptor, tooling, focused tests and root
  script entries;
- candidate/live/artifact/source/security/native/pilot consumer assertions;
- `.ai-docs/releases/0.3.0.md`, root/package onboarding and current-state
  documentation;
- package-local source harness changes strictly required to rebuild the exact
  accepted candidate bytes; and
- plan/review/status/roadmap/deferred/index/worklog updates.

Forbidden:

- runtime/compiler/Angular/pilot behavior beyond completed M18;
- new or changed Public exports, entry points, CSS properties, dependencies,
  peers, versions or support ranges;
- changing/deleting immutable `0.2.0` history or its frozen verifier;
- publishing reference applications, validator, tests, `.ai-docs`, credentials,
  private repository metadata or third-party source;
- public GitHub, workflows, repository metadata, trusted/staged publishing,
  provenance, token policy, Git tag or GitHub Release; and
- any Git or external action without its exact approval.

## 17. Stop conditions

Stop on any:

- authoritative SPEC/ADR conflict or behavior/API/release widening;
- unexpected manifest, declaration, export, dependency, peer, style, package
  inventory, lockfile or generated-byte difference;
- incomplete Corresponding Source, third-party rights uncertainty, secret,
  inaccessible link or personal/private metadata finding;
- failed frozen check, package/source rebuild, consumer, browser, hash,
  integrity, signature or byte-equality check;
- identity, organization, 2FA, registry, version-presence, tag, access or
  settings mismatch;
- need to expose GitHub, add repository metadata, claim provenance, weaken 2FA
  or activate D-043;
- partial package/tag state until documented and a separately approved resume
  or correction is selected; or
- commit, push, registry read, publish, dist-tag or other external action
  without its applicable explicit gate.

## 18. Completion criteria

PLAN-021 completes only when:

1. exact core/base `0.3.0` and pilot `0.1.0` are public and byte-identical to
   their selected clean committed candidates;
2. every package's `next` and observed/established `latest` resolve to those
   inspected bytes without unrelated drift;
3. exact, `next`, `latest` and unqualified native/pilot consumers pass at lower
   and latest-compatible accepted tuples;
4. package-local Corresponding Source, licensing, migration/release notes and
   frozen `0.2.0` evidence pass; and
5. one complete final review produces zero findings and reconciles all current-
   state documents.

Any local candidate, dirty/pre-commit artifact, partial publication, absent or
incorrect pilot default, mixed established alias window, failed consumer or
unresolved finding is a truthful partial state, not completion.

## 19. Review and approval state

Revision 0 was drafted on 19 July 2026 under the preparation authority granted
by Accepted ADR-018 revision 4. Review 116 cycle 1 found and corrected six
registry-baseline, external-read, post-write, first-package-identity, mixed-
window and closing-document issues. Cycle 2 found and corrected one stale
implementation-state header. Cycle 3 repeated all fourteen areas and closing
documentation with zero findings. It was approved under the standing zero-
finding acceptance rule on 19 July 2026.

Approval authorizes local checkpoints 1–3 only. Checkpoint 4, every registry
read checkpoint and every individual publication or dist-tag mutation remain
separately gated. No Git or external action has occurred.

### 19.1 Implementation checkpoint 1

Checkpoint 1 completed on 19 July 2026. One validated deeply frozen descriptor
now owns the exact unequal-version three-package inventory, dependency order,
packed Schema Engine peers, candidate filenames, candidate evidence and five
candidate/live consumer modes. M19 packing, artifact/source/security checks,
candidate preparation and future live verification consume it.

Review 117 cycle 1 corrected six test, duplicate-path, historical-verifier,
consumer-mode and evidence-schema findings. Cycle 2 repeated all ten areas with
zero findings. The frozen byte-identical public `0.2.0` verifier remains
independent. No production behavior, package contract, candidate selection,
Git or external action occurred; checkpoint 2 is next.

### 19.2 Implementation checkpoint 2

Checkpoint 2 completed on 19 July 2026. Release note `0.3.0` now records the
exact unequal-version candidate line, complete SPEC-008 Public migration,
compatibility, installation/publication states, pilot composition/style and
distribution boundaries. Root/package onboarding and descriptor-driven
documentation checks agree with that private source state.

Review 118 cycle 1 corrected six stale onboarding, endpoint, pilot-state,
three-package validation and provider-example findings. Cycle 2 corrected one
exact-version/stale-check coverage finding; cycle 3 repeated all ten areas with
zero findings. Exact manifests, artifacts, package isolation, security and
isolated frozen source rebuilds pass. No candidate was selected and no Git or
external action occurred; checkpoint 3 is next.

### 19.3 Implementation checkpoint 3

Checkpoint 3 completed on 19 July 2026. The complete frozen workspace,
package, artifact, source, security, reference and clean-consumer matrix passes.
Local lower/latest-compatible consumers now use explicit accepted frozen tuples
offline, while later live scripts opt into registry tuple resolution. Three
deterministic ignored dirty-tree candidates were generated twice with identical
bytes and SHA-512 values; original-path and fresh neutral-directory dry runs
pass with `sourceCommit: null`.

Review 119 cycles 1–4 corrected the local/live tuple conflict, missing neutral
rehearsal automation, Playwright cache portability, stale state wording,
formatting and final future-state wording. Cycle 5 repeated all fourteen areas
and all 22 SPEC-008
conformance rows with zero findings. No Git, registry, authentication,
publication or tag action occurred. Checkpoint 4 is the next separately gated
action and requires explicit authorization.
