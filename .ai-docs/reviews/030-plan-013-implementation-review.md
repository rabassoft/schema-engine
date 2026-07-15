# PLAN-013 implementation review

- **Date:** 2026-07-15
- **Plan:** [`PLAN-013 revision 1`](../plans/013-public-experimental-release.md)
- **Status:** Local preparation accepted — checkpoint 4 authorization pending
- **External actions:** None

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

Checkpoint 4 remains open only for its separately authorized push. The local
commit does not authorize npm login, settings or publication.
