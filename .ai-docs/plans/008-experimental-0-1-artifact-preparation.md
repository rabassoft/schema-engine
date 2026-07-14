# PLAN-008: Experimental 0.1 artifact preparation

- **Status:** Completed
- **Date:** 2026-07-14
- **Approval date:** 2026-07-14
- **Completion date:** 2026-07-14
- **Review revision:** 2
- **Review state:** Formal review, implementation corrections, complete matrix,
  and final repeated zero-finding review passed
- **Requires:** [`SPEC-001` v0.1.15](../specs/001-controlled-form-runtime.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-010`](../adrs/010-versionado-semver-compatibilidad.md), and accepted
  [`ADR-013` revision 1](../adrs/013-preparacion-artefactos-experimentales-0-1.md)
- **Milestone:** M8 — Experimental 0.1 preparation

## 1. Goal and authorization boundary

Prepare locally installable `0.1.0` release-candidate tarballs for
`@rabassoft/schema-engine` and `@rabassoft/schema-engine-angular`, then verify
their manifests, contents, public declarations, and clean-consumer behavior at
both tested ends of the Angular 22 compatibility range.

ADR-013 revision 1 is Accepted and Ricard explicitly approved PLAN-008 revision
2 after its second zero-finding repeated review. M8 implementation was
authorized only within this plan and is now complete.

Even after approval, this plan does not authorize publication, removal of
`private: true`, registry writes or authenticated access, licensing, provenance,
credentials, tags, GitHub Releases, or API promotion. Unauthenticated public
metadata queries and dependency downloads are allowed only for the temporary
compatibility matrix required by ADR-013.

## 2. Reviewed current state and conflicts

The product behavior is complete through M7 and SPEC-001 v0.1.15. Existing
workspace, package, build, package-smoke, and built-consumer checks pass.

M8 must correct these release-candidate gaps:

- both publishable packages are still `0.0.0`;
- Angular declares core under `dependencies` instead of peer + dev dependency;
- Angular peers use `^22.0.0` instead of `>=22.0.6 <23.0.0`;
- current tests import built workspace output but do not install packed
  manifests in a clean project;
- package-local consumer READMEs, candidate release notes, a recorded exact
  compatibility matrix, and an artifact allowlist check do not exist;
- root README and SPEC-001 implementation-status prose said M7 was pending at
  review start and are corrected in this drafting checkpoint.

These are documentation/package-preparation conflicts with the completed state
and accepted ADR-010, not product-runtime defects. Implementation must not use
them to change public behavior or expand the prototype.

## 3. Exact candidate manifests

### 3.1 Core

Change only the candidate version and package documentation boundary:

```json
{
  "name": "@rabassoft/schema-engine",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "files": ["dist", "README.md"]
}
```

The existing explicit root export remains unchanged. Core keeps no runtime,
peer, or optional dependencies.

### 3.2 Angular

Change the candidate version and dependency placement to:

```json
{
  "name": "@rabassoft/schema-engine-angular",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "tslib": "^2.8.1"
  },
  "peerDependencies": {
    "@angular/core": ">=22.0.6 <23.0.0",
    "@angular/forms": ">=22.0.6 <23.0.0",
    "@rabassoft/schema-engine": "workspace:^"
  },
  "devDependencies": {
    "@rabassoft/schema-engine": "workspace:*"
  }
}
```

The packed peer must become `^0.1.0`; no packed dependency field may contain
`workspace:`. The existing ESM root export, `sideEffects: false`, partial
Angular compilation, and `tslib` dependency remain unchanged.

The lockfile may change only as the deterministic result of the accepted
manifest relocation. No dependency version upgrade is part of M8.

## 4. Candidate documentation

Add one README to each package. Both must state:

- version line `0.1.x` and Public + Experimental + Active status;
- supported root import and unsupported deep imports;
- current root-object/primitive-field boundary;
- no stability promotion from installation or version number;
- local unpublished-candidate status, absence of selected distribution terms,
  and prohibition on external distribution;
- a link to repository documentation.

The Angular README must additionally include:

- installation of both packages and Angular peers;
- exact peer range `>=22.0.6 <23.0.0`;
- requirement that `@angular/core` and `@angular/forms` resolve to the same
  exact version;
- the matrix row for adapter `0.1.x`, core `^0.1.0`, tested lower bound, and
  tested upper stable Angular 22 endpoint;
- that only the root entry point and native Angular 22 adapter are supported.

Add `.ai-docs/releases/0.1.0.md` as candidate release notes covering M1–M7,
known exclusions, Experimental compatibility policy, the exact versions tested,
and the fact that no publication occurred. Correct stale M7 status prose in the
root README and SPEC-001 without changing SPEC behavior or version.

Do not add license text, `publishConfig`, registry instructions, badges that
imply publication, or Stable claims.

## 5. Artifact verification tooling

Add narrowly scoped verification under `scripts/` or package tests that:

1. builds both packages;
2. creates tarballs under an ignored temporary directory;
3. lists every tarball member and rejects anything outside the exact allowlist;
4. reads the packed manifests and asserts name, version, private protection,
   exports, files, dependencies, peers, and absence of `workspace:`;
5. checks that every exported JS/type target exists and that package READMEs
   are present;
6. deletes or leaves outside the repository all generated consumers and
   tarballs.

This tooling verifies artifacts only. It must contain no publish, registry
write, authenticated access, tagging, release-creation, or secret-handling
command. The compatibility script may query public package metadata and
download dependencies without credentials.

The artifact allowlist is:

- `package/package.json`;
- `package/README.md`;
- `package/dist/**/*.js`;
- `package/dist/**/*.js.map`;
- `package/dist/**/*.d.ts`;
- `package/dist/**/*.d.ts.map`.

No `src`, `test`, fixture, config, lockfile, `.tsbuildinfo`, credential, cache,
or workspace metadata file is permitted.

## 6. Clean-consumer matrix

Create disposable consumers outside the repository for three checks:

1. **Core-only:** install the core tarball, import only from
   `@rabassoft/schema-engine`, typecheck, and execute a minimal compiler/runtime
   scenario.
2. **Angular lower bound:** install both tarballs with aligned Angular
   `22.0.6`, then typecheck/build and execute the existing controlled-form
   consumer behavior.
3. **Angular upper endpoint:** resolve the highest stable, non-deprecated
   version satisfying `>=22.0.6 <23.0.0` at execution time, record its exact
   version, resolution date and public metadata source, install every Angular
   package in the consumer at that exact version, then repeat the lower-bound
   checks.

Consumer package manifests must refer to both local tarballs explicitly so the
Angular core peer is satisfied without a registry publication. Each consumer
must be created outside the workspace with its own manifest and lockfile, use
the workspace-pinned pnpm version, disable implicit workspace resolution, and
install with strict peer-dependency enforcement. Tests must fail on a peer
warning, `workspace:` specifier, deep import, missing declaration, misaligned
Angular tuple, prerelease/deprecated upper candidate, or unavailable public
metadata/dependency download.

The upper-endpoint check does not expand support beyond `<23.0.0`. If the
highest eligible stable version fails, M8 remains incomplete and ADR-010's
compatibility claim must be reviewed rather than silently narrowing or widening
the range. No credential or remote mutation is permitted while resolving it.

## 7. Implementation sequence

1. Approve PLAN-008 after its zero-finding review; mark only this M8 task in
   progress. ADR-013 revision 1 is already Accepted.
2. Align versions, core peer/dev placement, Angular peer ranges, package files,
   and the lockfile without upgrading dependencies.
3. Add package READMEs, candidate release notes, and correct stale M7 status
   prose.
4. Add deterministic tarball manifest/content checks and root scripts.
5. Add the core-only and two Angular clean-consumer checks.
6. Run the complete local and compatibility matrix, inspect declarations and
   packed manifests, repeat the full review to zero findings, and close M8.

Each step must leave format, lint, typecheck, focused tests, and diff integrity
passing. Stop if an accepted document conflicts with the exact manifest shape
or if a required change enters the publication boundary.

## 8. Expected production diff

Expected implementation files:

- `packages/core/package.json`;
- `packages/core/README.md`;
- `packages/angular/package.json`;
- `packages/angular/README.md`;
- `pnpm-lock.yaml` only for the manifest relocation;
- narrow artifact/consumer verification scripts and root script entries;
- `.ai-docs/releases/0.1.0.md` and state/index documentation;
- root `README.md` and non-normative SPEC-001 status prose.

No file under `packages/*/src` is expected to change. No new runtime dependency,
export, entry point, product test fixture, public declaration, behavior, schema
capability, registry configuration, license, credential, or publication file is
allowed.

## 9. Verification commands

The approved implementation plan must provide root commands equivalent to:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
pnpm test:artifacts
pnpm test:consumer:clean
```

The final review also inspects:

- `pnpm pack` inventories and transformed manifests;
- public exports and emitted declarations against ADR-009;
- exact lower/upper Angular versions and aligned peers;
- upper-version eligibility, public source/date evidence and strict isolated
  peer installation;
- absence of `workspace:` and unapproved files in tarballs;
- absence of publish commands, registry settings, credentials and secrets;
- no product source or behavioral diff;
- documentation links, state consistency, lockfile scope, and
  `git diff --check`.

## 10. Completion and stop conditions

M8 completes only when:

- both `0.1.0` candidates remain private and pack successfully;
- all packed metadata and contents match ADR-013;
- core-only, Angular `22.0.6`, and upper stable Angular 22 consumers pass from
  tarballs;
- existing 179 tests and all package/build checks pass;
- release notes and matrices record exact evidence;
- the repeated complete review has zero findings or unresolved changes.

Any failed matrix endpoint, unexpected artifact, leaked workspace specifier,
public-surface change, missing documentation, remote mutation, authenticated
access, external tarball distribution, or need to choose
license/registry/provenance keeps M8 incomplete. Publication remains blocked
behind D-040 even after M8 completes.

## 11. Initial scope review

- **Date:** 2026-07-14
- **Result:** Eight scope areas pass with no unresolved drafting finding.
- **State:** Historical drafting review. At that checkpoint ADR-013 was Accepted
  and PLAN-008 remained pending formal review and explicit approval.

1. **Milestone boundary:** Passes. M8 prepares local candidates only; product
   behavior, Stable API, publication, licensing and other deferred work remain
   excluded.
2. **Accepted decisions:** Passes. Candidate versions, independent SemVer,
   core peer placement, Angular range and declaration checks implement
   ADR-009/010 without reinterpreting them.
3. **Manifest precision:** Passes. Both candidate manifests, workspace protocol
   transformation, allowed lockfile scope and unchanged entry points are exact.
4. **Artifact contents:** Passes. The allowlist, transformed-manifest checks,
   README requirement and forbidden files are deterministic.
5. **Compatibility evidence:** Passes. Core-only, Angular lower-bound and
   upper-in-range consumers distinguish promised ranges from exact tested
   versions and require aligned peers.
6. **Publication safety:** Passes. `private: true` stays active and D-040/D-034
   own every remote, licensing, provenance and credential decision.
7. **Documentation:** Passes. Package READMEs, release notes, matrix and stale
   M7 status correction are included without changing SPEC behavior.
8. **Delivery:** Passes. Six implementation steps, expected files, commands,
   completion criteria and stop conditions are sufficient for a later formal
   review.

The review identified the existing core-dependency placement, Angular lower
bound, stale M7 prose and unregistered publication boundary. The proposal now
addresses all four explicitly; only the two manifest conflicts remain as
planned M8 implementation work, not as undocumented contradictions.

## 12. Formal review revision 2

- **Date:** 2026-07-14
- **First pass:** Three delivery precisions required correction.
- **First repetition:** Four stale `latest patch` phrases required terminology
  normalization to the accepted upper-endpoint rule.
- **Second repeated result:** All eight areas pass with zero findings or
  unresolved change requests.
- **State:** Approved revision 2; M8 implementation active.

Corrections applied:

1. Aligned the network boundary with accepted ADR-013: unauthenticated public
   metadata/downloads are permitted, while writes, publication, credentials and
   remote mutations remain forbidden.
2. Defined the upper endpoint as the highest stable, non-deprecated in-range
   Angular version, with an exact aligned tuple and recorded version/date/source.
3. Required consumers outside the workspace, isolated manifests/lockfiles,
   pinned pnpm, disabled implicit workspace resolution, strict peer enforcement,
   and package README warnings against external distribution.
4. Replaced every remaining `latest patch` shorthand with the exact upper
   stable endpoint terminology so documentation, checks and completion criteria
   cannot diverge.

Repeated review outcome:

1. **Authorization:** Passes. Accepted ADR-013 is the decision boundary; the
   plan remains Proposed and neither review nor approval publishes anything.
2. **Manifests:** Passes. Versions, dependency classes, peer ranges, exports,
   files and allowed lockfile changes are exact.
3. **Artifacts:** Passes. Pack location, manifest transformation, content
   allowlist and forbidden-file checks cover the actual tarballs.
4. **Consumers:** Passes after correction. Core-only and both Angular endpoints
   use isolated tarball installs and strict peers without workspace fallback.
5. **Compatibility:** Passes after correction. Lower and highest eligible
   stable versions use exact aligned Angular tuples and recorded evidence.
6. **API/documentation:** Passes. Experimental status, root-only imports,
   release notes, no-distribution warning and declaration review match
   ADR-009/010/013.
7. **Safety/deferred scope:** Passes. `private: true`, D-034/D-040, no
   credentials, no remote mutation and no product-source changes remain hard
   boundaries.
8. **Delivery:** Passes. Six steps, exact files, commands, completion criteria,
   failure behavior and final repeated review are sufficient.

The review itself did not approve PLAN-008. Ricard's subsequent explicit
approval activates only the six M8 steps above and still authorizes no
publication or external distribution.

## 13. Implementation completion and final review

- **Date:** 2026-07-14
- **Result:** Completed; all six steps and the final repeated review passed.
- **Milestone:** M8 completed without publication.

Implemented outcomes:

1. Both packages are private `0.1.0` local candidates; their versions remain
   independent despite the shared initial number.
2. Angular declares `tslib` as its only runtime dependency, core as
   `workspace:^` peer plus `workspace:*` dev dependency, and Angular core/forms
   peers as `>=22.0.6 <23.0.0`.
3. Each tarball includes only its transformed manifest, package README and
   allowed built output; no packed field contains `workspace:`.
4. Package READMEs and candidate release notes document Experimental status,
   root-only imports, compatibility, exclusions and no external distribution.
5. Versioned scripts verify packed manifests/content, a core-only consumer and
   isolated lower/upper Angular consumers with strict peers and no credentials.
6. Public npm metadata resolved `22.0.6` as both the lower and highest eligible
   stable Angular 22 endpoint on 2026-07-14; the aligned tuple passes twice.

Implementation review corrections:

- declared the `rxjs@7.8.2` peer required by Angular in temporary consumers,
  without adding it to either Schema Engine package;
- corrected the typed parent injector in the Angular consumer;
- silenced install noise, removed npm authentication variables, asserted pnpm
  `10.28.2`, and corrected the stale root `0.0.0` statement.

Final verification passed after those corrections and a complete repetition:

- frozen installation with the updated lockfile and no dependency upgrade;
- formatting, lint, typecheck, 129 core + 50 Angular tests;
- both builds, package smoke and the existing built-package consumer;
- exact tarball allowlists, manifests, exports and declarations;
- core-only and Angular lower/upper consumers from local tarballs;
- deep-import rejection, strict peers, aligned Angular packages, no
  credentials, no remote mutation and temporary cleanup;
- documentation links, state consistency and diff integrity.

No package was published or distributed. `private: true`, D-034 and D-040
remain unchanged, and no product source, public export, entry point or API
stability classification changed.
