# PLAN-013 implementation review

- **Date:** 2026-07-15
- **Plan:** [`PLAN-013 revision 3`](../plans/013-public-experimental-release.md)
- **Status:** Checkpoint 5 core accepted; Angular candidate reconciliation pending
- **External actions:** Private push, npm login, core publication and rejected
  `latest` removal completed; no Angular/settings mutation

## Checkpoint 1 review areas

1. official AGPL text and identical license hashes;
2. exact holder/contact notices and source SPDX coverage;
3. private tarball inventories and absence of unrelated/private material;
4. frozen package-local source toolchains without workspace input;
5. core-first Angular reconstruction and dependency handoff;
6. shipped/rebuilt declarations, root exports and executable behavior;
7. unchanged runtime/API/version/dependency/publication boundaries; and
8. format, documentation, lint, types, unit tests and diff hygiene.

## Cycle 1 — Findings and corrections

The first implementation pass found four issues:

1. The bulk header patch placed SPDX notices at file ends. All 30 owned source
   notices were moved to the first two lines and the packed inventory now
   enforces their exact position.
2. The Angular source config retained deprecated `baseUrl`, which TypeScript 6
   rejected. It was removed without weakening module resolution.
3. Pinning a freshly generated core tarball inside Angular's frozen lockfile
   created an integrity cycle. Angular now freezes only its toolchain and an
   included cross-platform script copies the already source-rebuilt sibling
   core package into its isolated build environment.
4. Importing shipped and rebuilt Angular outputs in one verifier process
   produced component-ID collision warnings. The verifier now executes each
   output in a separate clean process and compares the resulting exports and
   provider behavior.

## Cycle 2 — Complete repeated review

All eight areas were reviewed again from the beginning after the corrections.

- Root and both package `LICENSE` files have SHA-256
  `0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0`.
- Both notices carry the accepted holder, AGPL-only permission, truthful
  commercial alternative and confirmed `ricard@rabassoft.com` contact.
- All 30 owned production source files begin with the exact copyright/SPDX
  header; repository history attributes those paths only to Rabassoft.
- Both still-private tarballs contain only built output, preferred source,
  frozen source-build harness, README, SOURCE, LICENSE, NOTICE and manifest.
- Clean temporary installs rebuild core and Angular only from the extracted
  tarballs; root declarations and exports match and behavior passes without
  warnings.
- Manifests remain `private: true`; versions, dependencies, peers, entry points,
  Public Experimental APIs and runtime behavior remain unchanged.
- `pnpm format:check`, `pnpm docs:check`, `pnpm lint`, `pnpm typecheck`, all 359
  core plus 76 Angular tests, `pnpm test:artifacts`, `pnpm test:source` and
  `git diff --check` pass.

**Result:** zero findings and no unresolved change request. PLAN-013 checkpoint
1 is accepted; checkpoint 2 may begin locally.

## Checkpoint 2 — Complete review cycle 3

The review covered public-candidate metadata, documentation, package boundaries
and every checkpoint 2 gate from the beginning.

- Only the two package manifests remove `private`; the workspace root remains
  private and no inaccessible repository URL is present.
- Both manifests use `AGPL-3.0-only`, the confirmed holder/contact, public
  access, `next` and explicit `provenance: false` while preserving independent
  `0.1.0` versions, exports, dependencies and peers.
- Packed inventories contain the exact allowed files, no `workspace:`
  specifier, and truthful AGPL/commercial, private-repository and no-provenance
  documentation.
- Root and package READMEs plus release notes describe the prepared-but-not-live
  state, exact versions/`next`, Experimental MINOR policy, compatibility,
  root-only imports, no `latest`, no support SLA/public issue tracker/external
  code contributions and the pending release commit.
- Package smoke, repository consumer, packed artifact and isolated source
  rebuild checks pass without runtime, API, version or compatibility changes.
- Formatting, documentation, lint and diff checks pass.

**Result:** zero findings and no unresolved change request. PLAN-013 checkpoint
2 is accepted; checkpoint 3's complete local release gate may begin.

## Checkpoint 3 — Cycle 4 finding

The first complete-gate pass found one environment-isolation issue: npm's
dry-run attempted to use the user-global cache and failed before evaluating the
tarball because that path was outside the controlled workspace. The candidate
preparation script now uses an empty user config and an ignored release-local
npm cache, without reading credentials or changing global configuration.

## Checkpoint 3 — Complete repeated review cycle 5

The complete release gate and all eight implementation-review areas were
repeated after the cache correction.

- Frozen workspace installation, formatting, documentation, lint, typecheck,
  359 core tests, 76 Angular tests, explicit build, package smoke, repository
  consumer, packed artifacts and clean core/lower/upper Angular consumers pass.
- Source-only frozen reconstruction, declarations, exports and behavior pass
  for both exact package layouts without warnings or private-workspace input.
- The rights/security audit finds only the expected Rabassoft history for owned
  source and no tracked/packed secret, credential file, tax/address identifier
  or distributed private-repository link.
- npm `10.9.8` dry-runs both inspected tarballs with public access, `next` and
  provenance disabled using an empty user config and isolated cache; no registry
  write or login occurs.
- Two consecutive complete candidate preparations produce identical SHA-512
  hashes:
  - core:
    `dceb432ed1ee4bed4740134e52d1dc5896bb62a5cad9f0e763692e19ef1a0f3076b7f5ee22f9046c82bc2d0cb2d8dafc2253cf5ed970caefa93930280fdb310e`;
  - Angular:
    `3148832db6b6ba82a9e44ab234443f8e09ba4a02c648755bc71c5b7250f0f630ea631a305449f63c4e4c08f1038c890e5d2a8944b79aa34148f09661bff80730`.
- The ignored candidate manifest records Node `22.23.1`, npm `10.9.8`, pnpm
  `10.28.2`, base commit `9d0dbac`, `sourceCommit: null`, `next` and no
  provenance. The clean committed source hash remains a checkpoint 4 gate.
- No runtime/API/version/dependency/peer/compatibility change, credential use,
  registry write, tag, commit or push occurred.

**Result:** zero findings and no unresolved change request. PLAN-013 local
preparation through checkpoint 3 is accepted. Work stops at checkpoint 4 until
commit and push receive explicit authorization.

## Cycle 6 — Final diff-review finding

The final diff review found that Angular's core-preparation helper merged into
an existing generated package directory. A repeated build in the same extracted
tree could therefore retain an obsolete core output file. The helper now
removes only that generated target before copying the exact rebuilt core.

## Cycle 7 — Complete repeated review

The complete applicable review was repeated after the cleanup correction.
Frozen source reconstruction, declarations, exports and behavior, artifact
inventory, release security audit, formatting, documentation, lint and diff
checks pass. Repeated candidate preparation and npm dry-runs pass with new
deterministic hashes: core
`dceb432ed1ee4bed4740134e52d1dc5896bb62a5cad9f0e763692e19ef1a0f3076b7f5ee22f9046c82bc2d0cb2d8dafc2253cf5ed970caefa93930280fdb310e`
and Angular
`ef1e491da53f88596bcc4ab2e9472d1d1dd0b7dca02c383a750a74e5302779973ecd0e8c4d1a67e2ea4f0e03b9d2219a16d946bd3ffaf21f0e10a26afa4b1507`.
No contract, credential, registry or Git mutation occurred.

**Result:** zero findings and no unresolved change request. Checkpoints 1–3
remain accepted and checkpoint 4 authorization remains the exact stop.

## Checkpoint 4 — Authorized local commit

Ricard explicitly authorized the commit but not push. The complete preparation
was committed on private `develop`, then rebuilt from its clean tree. The
ignored candidate manifest records the exact clean `sourceCommit`; core and
Angular hashes remain the deterministic cycle 7 values. No tag, push,
credential or registry action occurred.

Ricard separately authorized and performed the private push. After aborting an
accidental merge with the obsolete pre-amend commit, local `develop` and
`origin/develop` both resolve to final commit
`7f5fcdfe952cae5fd0322c5e942c2ff335465c52`. The worktree has no unmerged paths.

**Result:** checkpoint 4 is accepted. Checkpoint 5 remains gated by Ricard's
interactive npm login/2FA and read-only identity/security verification; this
does not authorize npm settings or package publication.

## Checkpoint 5 — Cycle 8 identity finding and correction

The first live identity pass authenticated successfully as `ricardrabasso`, not
the plan's former expected `rabassoft`. Ricard clarified that npm required the
human account rename when organization `rabassoft` was created. Work stopped
without a registry write. PLAN-013 revision 2 now models the human publisher
and organization scope separately, and review 029 cycle 6 repeated the full
plan review with zero findings.

## Checkpoint 5 — Cycle 9 complete repeated review

The complete applicable release review was repeated from the beginning:

- npm `10.9.8` targets `https://registry.npmjs.org/` and authenticates as human
  user `ricardrabasso`;
- read-only organization access reports `ricardrabasso` as owner of
  `rabassoft`;
- the verified profile uses `ricard@rabassoft.com` and `auth-and-writes` 2FA;
- the organization package list is empty and unauthenticated exact-version
  reads return `E404` for both intended `0.1.0` names;
- the core and Angular tarballs still match checkpoint 4 SHA-512 values
  `dceb432e…fdb310e` and `ef1e491d…fa4b1507` respectively;
- scope, versions, manifests, exports, dependencies, peers, license/source,
  `next`, no-provenance and private-repository boundaries remain unchanged; and
- no package setting, publish, tag, GitHub Release or visibility mutation
  occurred.

**Result:** zero findings and no unresolved change request. Checkpoint 5's
identity/security gate is accepted. Work stops for immediate approval of the
exact core publication command; Angular remains separately gated.

## Checkpoint 5 — Cycle 10 persistent-state finding

The closing consistency pass found ROADMAP still identified revision 1 and the
local-preparation-only phase. ROADMAP was corrected to revision 2 and the exact
checkpoint 5 core-publication stop. No runtime, package or registry state
changed.

## Checkpoint 5 — Cycle 11 complete repeated review

The complete applicable review was repeated after the correction. Identity,
organization ownership, 2FA, package-name absence, registry/CLI, exact candidate
hashes, licensing/source, package/API/version boundaries, private-repository
policy, external stop gates and persistent state all agree.

**Result:** zero findings and no unresolved change request. Checkpoint 5's
read-only identity/security gate is accepted; core publication still requires
immediate explicit approval.

## Checkpoint 5 — Cycle 12 current-state compaction finding

The next closing pass found STATUS exceeded its five-outcome compact-state
limit and retained an obsolete revision 1 outcome. It was compacted while the
append-only WORKLOG preserved the historical evidence.

## Checkpoint 5 — Cycle 13 complete repeated review

The complete applicable review was repeated from the beginning. npm
identity/organization/2FA and availability evidence, exact candidate hashes,
package/license/source/API boundaries, authorization stops and all current-state
documents are consistent. STATUS is compact and historical records remain
append-only.

**Result:** zero findings and no unresolved change request. Checkpoint 5's
read-only gate remains accepted; the exact core publish command remains
unauthorized pending Ricard's immediate approval.

## Checkpoint 5 — Authorized core attempt stopped by OTP

Ricard immediately authorized the exact core `0.1.0` tarball under public
`next`, with provenance disabled. Its SHA-512 and source commit matched the
accepted candidate immediately before the command. npm rejected the operation
with `EOTP` before creating the package; Codex did not request or receive the
one-time password.

An unauthenticated exact-version lookup repeated after the attempt returns
`E404`. No registry mutation, Angular action or package/settings change
occurred. The existing authorization covers retrying that identical core
command only; Ricard must supply the OTP privately in his local terminal.

## Checkpoint 5 — Live core verification finding

Ricard retried the identical authorized command locally with his private OTP;
npm created `@rabassoft/schema-engine@0.1.0`. Unauthenticated metadata matches
the expected `AGPL-3.0-only` license and SHA-512 integrity.

npm also assigned `latest: 0.1.0` alongside the requested `next: 0.1.0`. This
violates ADR-018 and PLAN-013's explicit no-`latest` gate. The review stopped
before tarball download and clean live consumers. Core must not be unpublished;
removing only the unintended tag requires a separate immediate registry-setting
approval. Angular remains unauthorized and unpublished.

## Checkpoint 5 — Registry-invariant conflict

Ricard attempted the narrowly proposed removal; npm returned `E400` and kept
both tags. Official npm registry metadata documentation states that every
package has a `latest` tag, while alternate tags coexist with it. The accepted
no-`latest` requirement is therefore infeasible for this registry, not merely a
failed authentication or CLI invocation.

This is an unresolved normative conflict with ADR-018 and PLAN-013. Core remains
live at immutable `0.1.0`; Angular remains unpublished. The review stops before
consumer completion or any further registry action. Resolving it requires an
explicit accepted-contract revision, not another tag-removal retry.

## Checkpoint 5 — Contract correction accepted

Ricard accepted ADR-018 revision 2 and PLAN-013 revision 3. Review 028 cycle 6
and review 029 cycle 12 repeated their complete areas with zero findings.
`next` remains recommended; mandatory `latest` may alias only the same inspected
Experimental version and cannot imply Stable API or support.

The live core `0.1.0` README is immutable and retains the superseded no-`latest`
sentence. Release notes disclose the discrepancy; published bytes are not
overwritten or unpublished, and repository/future package wording is corrected.
This documentation-only defect does not alter license, source, integrity,
runtime or API behavior. Live tarball and consumer verification must now repeat
before checkpoint 5 can close.

## Checkpoint 5 — Cycle 14 findings and corrections

The first post-decision implementation pass found six issues:

1. Active ADR/plan/index/roadmap/deferred/onboarding/release/package prose still
   encoded the infeasible no-`latest` rule. All active text now distinguishes
   recommended `next` from mandatory Experimental `latest`.
2. The immutable live core README retains the old claim. Release notes now
   disclose and supersede it without overwriting/unpublishing `0.1.0`; future
   package wording is corrected.
3. The new live verifier needed Prettier formatting and an explicit ESM
   `Buffer` import.
4. npm's abbreviated install metadata omits `license`; the verifier now checks
   license/provenance through the full exact-version endpoint while retaining
   abbreviated metadata for install routing.
5. Consumer fixture dependency values incorrectly used CLI package specs; they
   now use manifest values `0.1.0` and `next`.
6. The fixture read a nonexistent Public snapshot `value`; it now checks the
   accepted Public `nodeKind` contract.

Every correction triggered a full live-verification restart. The initial
isolated source gate also encountered sandbox DNS denial; the unchanged command
passed with registry access and is not a product finding.

## Checkpoint 5 — Cycle 15 complete repeated review

The complete applicable review passed from the beginning with zero findings:

- ADR-018 revision 2, PLAN-013 revision 3, indexes, ROADMAP, deferred state,
  onboarding, release notes and package documentation are consistent;
- unauthenticated metadata reports core `0.1.0`, `AGPL-3.0-only`, no
  attestation/provenance and `next`/mandatory `latest` both at `0.1.0`;
- the downloaded live tarball is byte-identical to canonical SHA-512
  `dceb432e…fdb310e`;
- clean external TypeScript consumers install, compile and execute through both
  exact `0.1.0` and `@next`;
- formatting, documentation, lint, typecheck, 359 core plus 76 Angular tests,
  builds, package/consumer/artifact/source/clean-consumer and release-security
  gates pass; and
- runtime/API/version/dependency/peer/license/source/private-repository
  boundaries remain unchanged, with no Angular or settings mutation.

**Result:** zero findings and no unresolved change request. Checkpoint 5 core
publication and live verification are accepted. Angular remains unpublished;
its corrected candidate requires a clean committed rebuild and checkpoint 6.
