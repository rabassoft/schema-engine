# PLAN-015: Coordinated Experimental 0.2 release

- **Status:** Completed
- **Date:** 2026-07-15
- **Approval date:** 2026-07-15
- **Revision:** 0 — initial coordinated MINOR release draft
- **Requires:** Accepted
  [`SPEC-006 v0.1.1`](../specs/006-nullable-primitive-leaves.md),
  [`ADR-019 revision 1`](../adrs/019-hojas-primitivas-nullable.md),
  [`ADR-005 revision 4`](../adrs/005-politica-dialecto-json-schema.md),
  [`ADR-010 revision 1`](../adrs/010-versionado-semver-compatibilidad.md),
  [`ADR-018 revision 3`](../adrs/018-licencia-dual-publicacion-experimental.md)
  and completed [`PLAN-014 revision 0`](./014-nullable-primitive-leaves.md)
- **Release target:** `@rabassoft/schema-engine@0.2.0` and
  `@rabassoft/schema-engine-angular@0.2.0`
- **Milestone:** coordinated public delivery of completed local M14
- **Capability:** only the already implemented D-009/M14 slice
- **Implementation:** Completed; both `0.2.0` packages and all coordinated
  `next`/`latest` consumer modes are verified

## 1. Goal and hard boundary

Prepare, verify and, only through later immediate approvals, publish the exact
completed M14 source as coordinated Public + Experimental + Active core and
Angular `0.2.0` releases. Both live `0.1.0` versions remain immutable and
pre-M14.

ADR-010 requires MINOR rather than PATCH because M14 makes source-incompatible
changes to Public Experimental core and Angular contracts. The release stays
within the existing `0.y` Experimental policy and does not promote any API to
Stable.

PLAN-015 preparation/review does not authorize its implementation. Later plan
approval may authorize only the local checkpoints. Commit, push, npm identity
or settings operations, each publication and each dist-tag mutation retain
their own immediate approval stops.

This plan does not change M14 behavior, add another capability, make GitHub
public, create a Git tag or GitHub Release, advertise the private repository,
claim provenance, configure trusted/staged publishing, accept contributions or
activate D-043.

## 2. Exact release contract

| Contract                          | Required `0.2.0` state                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Core version                      | `@rabassoft/schema-engine@0.2.0`                                                                                           |
| Angular version                   | `@rabassoft/schema-engine-angular@0.2.0`                                                                                   |
| Angular core peer                 | packed `^0.2.0`; source workspace keeps `workspace:^`                                                                      |
| Angular framework peers           | unchanged aligned `@angular/core` and `@angular/forms` `>=22.0.6 <23.0.0`                                                  |
| Dependencies/exports/entry points | unchanged except the coordinated packed core version/range produced by the version bump                                    |
| License/source                    | unchanged `AGPL-3.0-only` or separate commercial agreement; complete package-local Corresponding Source                    |
| Stability                         | Public + Experimental + Active; no Stable claim                                                                            |
| Recommended channel               | `next`, advancing to the inspected `0.2.0` after each package publication                                                  |
| Mandatory npm alias               | `latest`, retained at compatible `0.1.0` until both `0.2.0` packages pass `next`; then moved to the inspected `0.2.0` pair |
| Repository/provenance             | private, absent package repository URL, no provenance, workflow or npm trusted publisher                                   |

The release migration notes must identify both coordinated source migrations:

1. manually authored core field definitions and templates add the required
   `nullable: boolean`, normally `false`, and may use `true` only for the exact
   accepted nullable primitive-leaf capability; and
2. manually authored `AngularFieldTextSnapshot` values add required
   `setNullLabel` and `nullValueLabel`; exhaustive handling of
   `FieldTextMember` also adds `set-null` and `null-value`.

The notes must distinguish schema-compiled consumers that require no manual
definition migration, preserve all SPEC-006 exclusions and state that no
operation shape, renderer registration, output, provider, export or entry
point changed.

## 3. Authorization zones

1. **Plan preparation/review:** this current authorization; documentation only.
2. **Local implementation:** checkpoints 1–3 only after explicit plan approval.
3. **Private Git checkpoint:** checkpoint 4 only after explicit commit and push
   approval.
4. **Registry checkpoints:** checkpoints 5–7; every write requires immediate
   approval after its exact bytes, command and current registry state are shown.
5. **Closure:** checkpoint 8 records only observed verified state and grants no
   later release or external authorization.

## 4. Checkpoint 1 — Version-aware release tooling

Generalize release tooling before changing package versions:

1. add a single explicit expected-version input, derive both actual versions
   from the package manifests and fail on disagreement or expected-version
   mismatch; exercise this logic with focused tests before invoking it for the
   target in checkpoint 2;
2. replace active `0.1.0` candidate-directory, filename, manifest, core-peer and
   consumer assumptions with explicit candidate-version inputs or derived
   values;
3. preserve immutable exact `0.1.0` metadata, bytes and exact-version consumer
   verification as historical regression evidence, but remove mutable
   `next`/`latest` assertions from that historical mode; review 030 remains the
   evidence of their M13 tag state;
4. add separate target-version modes for candidate, exact live, `next`,
   `latest` and unqualified consumers, with tag assertions only in the modes
   whose checkpoint owns those tags;
5. make clean consumers accept an explicit coordinated live version and reject
   mixed core/Angular release lines unless the selected recovery check
   intentionally tests a partial state;
6. keep the existing Angular lower/upper aligned `22.x` resolution and reject
   prerelease, deprecated or misaligned framework tuples;
7. extend documentation checks for stale active pre-M14, `0.1.x`, `^0.1.0`,
   no-`latest`, Stable, provenance and public-repository claims without
   rewriting immutable historical release notes; and
8. make candidate metadata record version, exact files, byte sizes, SHA-512,
   integrity, toolchain, base/source commit, tag and provenance state without
   credentials.

Gate: focused version-input/tooling tests and immutable exact `0.1.0`
metadata/bytes/consumer verifiers pass against the still-`0.1.0` manifests;
production/runtime behavior is untouched and no `0.2.0` candidate or external
action occurs.

## 5. Checkpoint 2 — Local `0.2.0` candidate state and migration docs

Change only the accepted release surface:

1. bump both publishable manifests from `0.1.0` to `0.2.0` and update only the
   lockfile records caused by those bumps;
2. retain Angular source peer `workspace:^` and development dependency
   `workspace:*`, and prove their packed peer/dev metadata is
   `^0.2.0`/`0.2.0`; keep framework peers, `tslib`, exports, entry points,
   package files, license, author and `publishConfig` otherwise exact;
3. update root/package onboarding installation and compatibility tables for the
   `0.2.x` pair while retaining truthful immutable `0.1.0` history;
4. add `.ai-docs/releases/0.2.0.md` with the exact M14 capability, migration
   inventory, compatibility matrix, exclusions, Experimental status,
   AGPL/commercial and private-repository/no-provenance boundaries; it must
   report only candidate/prepared state until each live checkpoint is observed;
5. update package Corresponding Source only as needed to rebuild the exact new
   bytes, with frozen harnesses and no workspace-relative dependency; and
6. add artifact/declaration/consumer assertions for required `nullable`,
   `setNullLabel` and `nullValueLabel` without treating Internal helpers as
   public exports.

Gate: the repository builds and packs the coordinated local `0.2.0` pair;
declaration and manifest diffs contain only the accepted M14/release changes;
no npm candidate directory intended for publication has been accepted yet.

## 6. Checkpoint 3 — Complete local release gate

Run and record from a frozen workspace:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm docs:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
pnpm test:artifacts
pnpm test:source
pnpm test:consumer:clean
pnpm audit:release
git diff --check
```

Additionally:

1. map every SPEC-006 group and migration to passing source, declaration,
   package and consumer evidence;
2. inventory every tar member, dependency, peer, export and license/source
   file and compare both rebuilt outputs with shipped outputs;
3. audit distributed third-party rights and scan tracked/packed files for
   credentials, private links, personal address/tax data and unexpected files;
4. run unauthenticated read-only checks proving `0.2.0` is not already present
   and record the current `next`/`latest` values without assuming ownership from
   package absence;
5. prepare deterministic candidate tarballs under ignored `.release/0.2.0`, run
   `npm publish --dry-run` only on those inspected bytes and record hashes;
6. copy the exact candidate bytes to a newly created neutral temporary
   publication directory outside the user/workspace path, verify hashes again
   and rehearse the exact basename-relative dry-run commands there; and
7. repeat the complete implementation review after every correction until one
   full cycle has zero findings.

Gate: two inspected local candidates and a neutral-path publication procedure
exist. No commit, push, authentication, dist-tag mutation or publication has
occurred.

## 7. Checkpoint 4 — Private commit, push and clean rebuild stop

Stop for explicit authorization to:

1. commit the fully reviewed local release preparation;
2. push that exact commit to private `develop` only; and
3. rebuild from the clean commit, compare with the pre-commit candidates, and
   select only the clean candidate hashes for publication.

Re-copy the selected bytes to a fresh neutral temporary directory and verify
that its path contains neither the local username nor workspace path. Record
the exact source commit and candidate hashes. Any byte difference must be
explained and the complete local review repeated; it must not be normalized
away.

No Git tag, GitHub Release, repository visibility/settings change or npm write
is part of this checkpoint.

## 8. Checkpoint 5 — Core `0.2.0` publication under `next`

Ricard performs any interactive npm authentication/2FA outside repository
files. Read-only preflight must prove:

- registry `https://registry.npmjs.org/`, publishing identity
  `ricardrabasso`, organization control and write-protected 2FA;
- core `0.2.0` is absent, selected bytes/hash still match and no token or OTP is
  printed or persisted;
- both `latest` aliases still resolve to `0.1.0`, and existing `0.1.0` exact
  bytes remain unchanged; and
- the exact neutral-directory basename-relative command and npm CLI version are
  recorded.

Stop for immediate approval of the core command equivalent to:

```text
npm publish ./rabassoft-schema-engine-0.2.0.tgz --access public --tag next --provenance=false
```

After success, verify unauthenticated exact metadata/bytes, registry signature,
license/source, absent provenance/repository URL, `next: 0.2.0`, unchanged
`latest: 0.1.0`, neutral `_resolved`/`_from` disclosure and clean exact/`next`
core consumers. Unexpected path disclosure, bytes or tags stop the plan; the
published version is never overwritten or unpublished.

## 9. Checkpoint 6 — Angular `0.2.0` publication under `next`

Before any write, install the selected Angular candidate against live core
`0.2.0` in clean lower/upper aligned Angular 22 consumers. Reverify the exact
Angular hash, packed core peer `^0.2.0`, dependencies, source, license and
absence of Angular `0.2.0`.

Stop for separate immediate approval of the Angular command equivalent to:

```text
npm publish ./rabassoft-schema-engine-angular-0.2.0.tgz --access public --tag next --provenance=false
```

After success, verify exact metadata/bytes/signature, `next: 0.2.0`, unchanged
`latest: 0.1.0`, neutral public path metadata and clean exact/`next` consumers
using both live `0.2.0` packages.

If Angular cannot be published, retain core `0.2.0` under `next`, keep both
`latest` aliases at the compatible `0.1.0` pair, document the partial release
and stop. Never overwrite/unpublish core or move either `latest` early.

## 10. Checkpoint 7 — Coordinated `latest` transition

Preconditions are both exact `0.2.0` versions verified live under `next`, both
`latest` aliases still at `0.1.0`, clean paired exact/`next` consumers passing
and no open release finding.

npm has no atomic cross-package dist-tag transaction. Keep the transition
window minimal and do not accept consumer evidence from its mixed state:

1. stop for immediate approval to move Angular `latest` to its inspected
   `0.2.0` with the exact equivalent of
   `npm dist-tag add @rabassoft/schema-engine-angular@0.2.0 latest`;
2. verify that exact mutation and no other tag/settings drift;
3. stop separately for immediate approval to move core `latest` to its
   `0.2.0` with the exact equivalent of
   `npm dist-tag add @rabassoft/schema-engine@0.2.0 latest`; and
4. verify both `next` and `latest` resolve to the coordinated `0.2.0` pair and
   run clean unqualified, exact and `@next` consumers.

If the core tag mutation fails after Angular moved, stop and request immediate
approval to restore Angular `latest` to `0.1.0`; do not perform an unapproved
rollback. Record and verify any partial state. Published `0.2.0` bytes and
`next` remain immutable regardless of tag recovery.

Neither dist-tag implies Stable. No deprecation, unpublish, repository setting
or provenance mutation is allowed.

## 11. Checkpoint 8 — Final verified closure

Repeat from the beginning:

1. exact candidate/live byte and integrity equality for both versions;
2. registry metadata, signatures, `next`/`latest`, neutral path disclosure,
   absent provenance/repository URL and immutable `0.1.0` evidence;
3. frozen workspace, formatting, documentation, lint, types, tests, build,
   package, artifact, source, security and repository/clean consumer matrix;
4. lower/upper aligned Angular 22 exact, `next`, `latest` and unqualified
   consumer combinations;
5. declarations, exports, manifests, peers, lockfile, migration notes,
   Experimental status and every deferred boundary; and
6. ROADMAP, STATUS, WORKLOG, release notes, onboarding and plan/review
   consistency.

Correct every finding and repeat the complete applicable review until one full
cycle has zero findings. Then mark PLAN-015 complete and record the observed
release. Completion grants no later commit, push, version, registry/settings,
tag, GitHub Release or D-043 authorization.

## 12. Expected repository diff

Allowed:

- both package versions and the mechanically resulting lockfile records;
- release-tool parameterization, assertions and root script entries;
- candidate/live/package/source/security/clean-consumer tests and fixtures;
- root/package README and new `0.2.0` release notes;
- plan/review/status/roadmap/deferred/index/worklog documentation; and
- package-local source harness changes strictly required for exact `0.2.0`
  Corresponding Source.

Forbidden:

- runtime/compiler/Angular production behavior beyond already completed M14;
- new Public exports, entry points, renderer registrations, dependencies,
  Angular peer range or Stable claims;
- changing or deleting immutable `0.1.0` history/evidence;
- publishing tests, `.ai-docs`, credentials or private repository metadata;
- GitHub visibility/settings, workflow, trusted/staged publishing, provenance,
  token policy, Git tag or GitHub Release; and
- any external action without its immediate approval.

## 13. Stop conditions

Stop on any:

- SPEC/ADR conflict, behavior/API widening or release contract outside M14;
- unexpected manifest, declaration, export, dependency, peer or lockfile diff;
- incomplete Corresponding Source, third-party rights uncertainty, secret or
  private/personal metadata finding;
- failed frozen check, package/source rebuild, consumer, hash or byte equality;
- registry identity, 2FA, ownership, version-presence, tag, signature,
  `_resolved`/`_from` or metadata mismatch;
- need to expose GitHub, add repository metadata, claim provenance or activate
  D-043;
- a partial publication/tag state until it is documented and a separately
  approved recovery is selected; or
- commit, push, publish, dist-tag or other external mutation without immediate
  explicit approval.

## 14. Completion criteria

PLAN-015 completes only when both exact `0.2.0` packages are public and
byte-identical to clean committed candidates, `next` and mandatory `latest`
both resolve to the coordinated inspected pair, exact/next/latest/unqualified
consumers pass, Corresponding Source and migration notes are complete, and the
final repeated review has zero findings.

Core-only, both packages under `next` with `latest` still at `0.1.0`, any mixed
tag state, a local candidate or failed verification is a truthful partial state,
not completion.

## 15. Review and approval state

Revision 0 was drafted on 15 July 2026 under the authorization recorded in
STATUS. Review 042 cycle 1 found and corrected five ordering, historical-tag,
workspace-range, release-state and exact-command issues. Cycle 2 repeated all
ten areas with zero findings. Ricard formally approved revision 0 on 15 July 2026. Approval authorized local checkpoints 1–3; checkpoint 4 was authorized
and completed separately. Every remaining registry or other external action
remains separately gated.

### 15.1 Implementation checkpoint 1

Checkpoint 1 completed on 15 July 2026. Version-aware target parsing,
candidate/artifact paths, packed peer/dev expectations, source reconstruction,
live candidate/tag modes, exact live-version consumers and conditional stale
documentation checks are implemented. Historical `0.1.0` verification retains
exact bytes/consumers without mutable-tag assertions.

Review 043 cycle 1 corrected missing stale-documentation ownership. Cycle 2
repeated the complete checkpoint review with zero findings. Package versions
remain `0.1.0`; checkpoint 2 is next.

### 15.2 Implementation checkpoint 2

Checkpoint 2 completed on 15 July 2026. Both publishable manifests are
`0.2.0`; Angular packs the accepted `^0.2.0` core peer and exact `0.2.0`
development metadata. Onboarding and candidate-state release notes carry the
exact migrations, compatibility and private-repository/no-provenance boundary.

Review 044 cycle 1 corrected declaration-file ownership in artifact evidence.
Cycle 2 repeated the complete checkpoint review with zero findings. No accepted
candidate or external action occurred; checkpoint 3 is next.

### 15.3 Implementation checkpoint 3

Checkpoint 3 completed on 15 July 2026. Review 045 corrected one formatting,
three package/evidence/state and one exact-onboarding finding across cycles
1–3. Cycle 4 repeated the complete frozen release, package, source, consumer,
security, registry-absence, candidate and neutral-path review with zero
technical findings. Cycle 5 corrected the closing link count and repeated the
complete documentation/state review with zero findings.

Both pre-commit candidate hashes and exact dry-run commands are recorded in
review 045. They remain evidence only because the tree is dirty and their
candidate metadata has no source commit. Local checkpoints 1–3 are complete;
work stops for separate checkpoint 4 commit/private-push authorization.

### 15.4 Checkpoint 4 authorization

Ricard explicitly authorized checkpoint 4 on 15 July 2026: commit the reviewed
release preparation, push that exact commit to private `develop`, rebuild from
the clean commit and select only matching clean candidate hashes. No Git tag,
GitHub Release or npm write is authorized.

### 15.5 Implementation checkpoint 4

Checkpoint 4 completed on 15 July 2026. Commit
`ce53dc1f5b3147ddd24e14912c0ff9dc1b32e412` was pushed to private
`origin/develop`, and local `HEAD` and the remote-tracking branch matched. A
clean-tree `pnpm prepare:release` rebuild selected candidates whose byte counts
and SHA-512 values exactly matched the pre-commit evidence:

- core: 200245 bytes,
  `155ae047c8ee949bddcaba412fcff90e4b65396a47f89f63e065e7b7814e8a8e0e2851d8e891465d12f69b54fa00192fe5884b163deb292aedec73f9d13e028a`;
- Angular: 93133 bytes,
  `aa035adb83c01ae1ffccae2126c78f0095ec4f930547d923b80ba7f0419a39ead58dfe45c35818fde4b884dd31793cec17aa2b8c3963520c24f1891d165a5154`.

Candidate metadata records that commit as both base and source commit. The
exact bytes were copied to fresh neutral path
`/tmp/rabassoft-release-0.2.0.6bKsP2`; hashes matched again and both
basename-relative `npm publish --dry-run --tag next --access public` rehearsals
passed. Review 046 recorded zero findings. No Git tag, GitHub Release or npm
write occurred; checkpoint 5 remains separately gated.

### 15.6 Checkpoint 5 preflight

The read-only checkpoint 5 preflight passed on 15 July 2026 with npm CLI
`10.9.8` against `https://registry.npmjs.org/`. Authenticated identity is
`ricardrabasso`, which is owner of organization `rabassoft`; the verified
account uses `auth-and-writes` 2FA. Both exact `0.2.0` versions returned E404,
both `next` and `latest` tags remained at `0.1.0`, and historical core/Angular
`0.1.0` bytes passed their immutable live verification.

At neutral path `/tmp/rabassoft-release-0.2.0.6bKsP2`, the selected core remains
200245 bytes with the checkpoint 4 SHA-512. The exact command with
`--provenance=false` passed one final dry-run. Review 047 recorded zero
findings. No registry write occurred; execution now stops for immediate
approval of the exact core publication command.

Ricard granted that immediate approval on 15 July 2026 for the single exact
core command only. Angular publication, dist-tag, Git and settings mutations
remain unauthorized.

The authorized attempt reverified the selected hash and reached npm, then
stopped with mandatory `EOTP` before any write. Immediate read-only checks
confirmed core `0.2.0` remained absent and `next`/`latest` remained at `0.1.0`.
Checkpoint 5 pauses for Ricard to repeat the exact neutral-path command with a
current OTP; no code is shared or persisted in project state.

### 15.7 Implementation checkpoint 5

Ricard completed the authorized neutral-path publication on 16 July 2026.
Review 048 verified public `@rabassoft/schema-engine@0.2.0` byte-identical to
the selected 200245-byte candidate with the accepted SHA-512 and integrity.
The registry carries one signature, `AGPL-3.0-only`, package-local source, no
repository URL, no attestation/provenance and only neutral
`/private/tmp/rabassoft-release-0.2.0-manual` path metadata. Core `next` is
`0.2.0`, `latest` remains `0.1.0`, and exact core plus lower/upper Angular 22
candidate consumers pass. Checkpoint 5 is complete; no Angular or dist-tag
mutation occurred.

### 15.8 Checkpoint 6 preflight

The checkpoint 6 read-only preflight passed on 16 July 2026. Angular `0.2.0`
remains absent; its selected 93133-byte tarball retains SHA-512
`aa035adb83c01ae1ffccae2126c78f0095ec4f930547d923b80ba7f0419a39ead58dfe45c35818fde4b884dd31793cec17aa2b8c3963520c24f1891d165a5154`.
Packed artifact/license/source boundaries, frozen isolated source rebuilds,
`^0.2.0` core peer and clean lower/upper Angular 22 consumers against live core
pass. The exact neutral-path Angular command with no provenance passes its
dry-run. Review 049 recorded zero findings; execution stops for separate
immediate approval of the real Angular publication.

Ricard granted that immediate approval on 16 July 2026 for the single exact
Angular command only. Every `latest`, Git and settings mutation remains
unauthorized.

The authorized automated attempt reverified the selected hash and reached npm,
then stopped with mandatory `EOTP` before any write. Immediate read-only checks
confirmed Angular `0.2.0` remained absent and its `next`/`latest` remained at
`0.1.0`. Checkpoint 6 pauses for Ricard to run the same command interactively
with the configured Security Key.

### 15.9 Implementation checkpoint 6 and checkpoint 7 preflight

Ricard completed the authorized Angular publication on 16 July 2026. Review
050 verified public `@rabassoft/schema-engine-angular@0.2.0` byte-identical to
the selected 93133-byte candidate with the accepted SHA-512 and integrity.
Its `^0.2.0` core peer, Angular 22 peers, registry signature, AGPL/source,
absent repository/provenance and neutral path metadata pass.

Both exact `0.2.0` candidates and both `next` aliases are verified live.
Exact and `@next` core/Angular consumers pass at Angular `22.0.6` and `22.0.7`,
including registry signature audit. Both `latest` aliases remain `0.1.0` and no
open release finding exists. Checkpoint 6 is complete and checkpoint 7
preconditions pass. Execution stops for immediate approval of the Angular
`latest` mutation only; core `latest` retains its later separate gate.

Ricard granted that immediate approval on 16 July 2026 for the Angular
`latest` mutation only. Core `latest`, Git and settings mutations remain
unauthorized.

The authorized automated attempt stopped with mandatory `EOTP` before any
mutation. Immediate checks confirmed both `latest` aliases remained `0.1.0`
and both `next` aliases remained `0.2.0`. Checkpoint 7 pauses for Ricard to run
the same Angular tag command interactively with the configured Security Key.

### 15.10 Checkpoint 7 Angular latest

Ricard completed the authorized Angular tag mutation on 16 July 2026. Review
051 confirmed Angular `latest` and `next` both resolve to verified `0.2.0`,
while core `next` remains `0.2.0` and core `latest` remains `0.1.0`. No other
tag or setting drift occurred. This is the planned minimal mixed window;
consumer evidence is intentionally not accepted from it. Execution stops for
separate immediate approval of the core `latest` mutation.

### 15.11 Checkpoint 7 completion and final review

Ricard completed the separately authorized core `latest` mutation on 16 July 2026. Core and Angular `next` and `latest` all resolve to verified `0.2.0`.
The complete final matrix repeated exact, `@next`, `@latest` and unqualified
clean core/Angular consumers at Angular `22.0.6` and `22.0.7`; selected bytes,
registry signatures and package metadata remained exact.

Review 052 repeated the complete PLAN-015 release boundary with zero findings.
PLAN-015 revision 0 and the coordinated Experimental `0.2.0` release are
complete. No API was promoted to Stable, and no Git tag, GitHub Release,
repository visibility/settings, trusted publisher, provenance or D-043 action
occurred.
