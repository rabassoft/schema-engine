# D-043/M23 trusted publication promotion-readiness review — Cycles 1–2

- **Date:** 2026-07-25
- **State:** Accepted after cycle 2 and Ricard's option A selection
- **Demand:** Complete the secure-publication path prepared by M22 before adding
  another framework or functional contract
- **Authority reviewed:** ADR-009, ADR-010, ADR-018 revision 6, ADR-026 revision
  0, D-040/D-043, completed PLAN-023/024, reviews 164/165/166/177, the three
  public package manifests, the current fail-closed npm workflow and release
  tooling, and current official npm/GitHub/pnpm documentation
- **Outcome:** The repository is ready for one bounded M23 selection; Ricard
  selected option A, promoting only coordinated normative design

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                                 | Correction                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R178-F01 | ADR-026 predates npm's required trusted-publisher allowed-action selection and does not decide direct versus stage-only publication.                    | Make the allowed action and current tool floor an explicit M23 normative gate rather than silently reusing the older workflow.                             |
| R178-F02 | The prepared workflow invokes `npm publish` with npm 11.5.1; npm staged publishing now requires npm 11.15.0 or later and a separate stage-only grant.   | Require an exact reobserved npm CLI version, stage-only trust and `npm stage publish` only under option A.                                                 |
| R178-F03 | Current manifests intentionally omit `repository` and set `publishConfig.provenance: false`, so readiness correctly fails closed.                       | Confine repository metadata and removal of the provenance opt-out to new immutable versions after normative review and an approved plan.                   |
| R178-F04 | A metadata-only patch could accidentally narrow Angular's accepted Schema Engine peer floors when pnpm expands bare `workspace:^` from bumped packages. | Preserve the existing packed floors explicitly with `workspace:^0.4.0`; verify that no peer, API, behavior or compatibility contract narrows.              |
| R178-F05 | The current state names no next milestone and leaves React/Vue, legacy Angular and functional Deferred work adjacent to the release residual.           | Isolate M23 to trusted publication of the existing three-package M21 behavior; keep every framework, validator package and functional capability inactive. |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeated the authority, versioning, package graph, source/licensing,
workflow/OIDC, npm stage/approval, provenance, tag/recovery, compatibility,
external-gate and Deferred-boundary review with zero unresolved findings.

## 1. Readiness conclusion

M22 has completed every prerequisite that previously blocked truthful package
metadata and provenance:

1. the sanitized source repository is public and its protected
   `main`/`develop` topology is verified;
2. the three existing package names and current `next`/`latest` lines are exact;
3. GitHub Actions is least-privilege and the protected `npm-publish`
   environment requires authenticated human approval;
4. the workflow already rebuilds and verifies an exact protected-main source
   but fails closed because no later release descriptor/manifests authorize
   trusted publication; and
5. no npm or GitHub credential is stored in the repository or environment.

This supports a narrow release-security milestone before React, Vue, Angular
legacy or new runtime behavior. It does not itself authorize an ADR revision,
manifest/workflow change, version, candidate, Git mutation, npm setting or
publication.

## 2. Recommended selection — Option A

Promote only:

**M23 — a coordinated metadata-only PATCH of the three existing Public +
Experimental packages, staged through a stage-only npm trusted publisher,
approved package-by-package with human 2FA and verified with automatic
provenance.**

The proposed immutable versions are:

| Package                                 | Current | Proposed | Preserved Schema Engine peer floor |
| --------------------------------------- | ------- | -------- | ---------------------------------- |
| `@rabassoft/schema-engine`              | `0.4.0` | `0.4.1`  | none                               |
| `@rabassoft/schema-engine-angular`      | `0.4.0` | `0.4.1`  | core `^0.4.0`                      |
| `@rabassoft/schema-engine-angular-aria` | `0.2.0` | `0.2.1`  | base Angular `^0.4.0`              |

PATCH is valid under ADR-010 because M23 changes only distribution metadata and
release security. It introduces no intentional incompatibility, API,
behavioral feature or framework-range change. Explicit `workspace:^0.4.0`
source peers preserve the already published packed floors while still forcing
local workspace resolution; bare `workspace:^` must not narrow them to
`^0.4.1`.

## 3. Required normative sequence

Option A requires this order before PLAN-025:

1. revise ADR-026 to revision 1 for current npm stage-only trusted-publisher
   permissions, tool floors, staging/approval/recovery and token restriction;
2. coordinate ADR-018 revision 7 with the exact three PATCH versions, preserved
   peer floors, `next` staging, later `latest` transition and immutable partial
   failure;
3. completely review both revisions together and repeat until one pass has zero
   findings;
4. accept both revisions only after that pass;
5. prepare and completely review PLAN-025; and
6. approve only its bounded local checkpoint first.

No SPEC revision is required because M23 must not change observable runtime,
schema, UI Schema, exports, diagnostics, rendering or compatibility behavior.
ADR-010 needs no revision because it already permits independent compatible
PATCH releases and forbids intentional Experimental incompatibilities in PATCH.

## 4. Exact trusted-publisher boundary

Each existing public package must receive its own exact npm trust relation:

- provider: GitHub Actions;
- organization: `rabassoft`;
- repository: `schema-engine`;
- workflow filename: `npm-publish.yml`;
- environment: `npm-publish`; and
- allowed action: `npm stage publish` only.

`npm publish` permission and a dual publish/stage grant remain disabled.
Configuration is an external npm mutation for each package, separately
authorized and immediately reobserved. npm does not validate the saved
configuration until use, so spelling and case alone are not accepted evidence.

The protected publish job retains `contents: read`, `id-token: write`,
GitHub-hosted execution and no cache or repository credential. It must use an
exact reviewed npm version meeting the observed staged-publishing minimum,
currently 11.15.0 or later on Node 22.14.0 or later. The plan pins an exact
version and rechecks the official minimum rather than treating this review's
observation as permanent.

## 5. Manifest and provenance boundary

Only the three new immutable package versions may add:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rabassoft/schema-engine.git",
    "directory": "packages/<exact-package-directory>"
  }
}
```

Their current explicit `publishConfig.provenance: false` must be removed.
Option A does not replace it with a fabricated attestation or require a
`--provenance` flag: npm trusted publication from the public GitHub repository
generates provenance automatically. Completion evidence must observe the
registry attestation and verify its exact repository, workflow and protected
source commit.

Existing `0.4.0`/`0.2.0` and older versions remain immutable and truthfully
without repository/provenance claims. Package-local Corresponding Source,
AGPL-3.0-only/commercial notices, public author/contact, exports and source
inventories remain unchanged.

The private `@rabassoft/schema-engine-validator-ajv@0.0.0` is not admitted to
the release and receives no repository metadata or trusted publisher.

## 6. Stage, approval and live-verification sequence

One reviewed workflow run may stage all three exact candidates under `next` in
dependency order:

1. core `0.4.1`;
2. base Angular `0.4.1`; and
3. Angular Aria pilot `0.2.1`.

Staging reserves immutable versions but does not make them public. The plan
must record each stage identifier without exposing authentication material,
download the staged tarballs, compare them byte-for-byte with the selected
candidates and repeat package/source/license/consumer checks before approval.

Each stage approval is a distinct irreversible registry checkpoint requiring
Ricard's immediate authorization and npm 2FA:

1. approve core, then verify exact bytes, metadata, provenance and live core;
2. approve base only after core passes, then verify the exact pair and native
   consumers; and
3. approve the pilot only after the pair passes, then verify all three exact and
   `next` native/pilot consumers.

OIDC cannot approve, reject, list, view or download stages. Those operations
remain interactive/read-only as applicable. A failed or suspicious staged
candidate is rejected only after explicit authorization; the rejected/reserved
version is never silently reused.

## 7. Dist-tags and token transition

The staged packages select `next`. After all three exact/`next` lines pass,
`latest` may move deepest-dependent first:

1. pilot `latest` to `0.2.1`;
2. base Angular `latest` to `0.4.1`; and
3. core `latest` to `0.4.1`.

Each dist-tag write remains an immediate, interactive, separately authorized
mutation because npm OIDC trust does not authorize `npm dist-tag`. No
coordinated evidence is accepted from the two transient mixed windows.
Completion requires exact/`next`/`latest`/unqualified consumers for the complete
chain.

Only after all three trusted publications, attestations and aliases pass may a
later explicit settings checkpoint select “require 2FA and disallow tokens” and
remove obsolete automation tokens. Human session/2FA remains necessary for
stage approval, dist-tags and recovery. No recovery route is removed before the
complete first trusted cycle succeeds.

## 8. Local, Git and external gates

An accepted promotion would authorize only preparation/review of the coordinated
ADR revisions. A later accepted PLAN-025 must still separate:

1. local descriptor/tooling/tests and current official-requirement fixtures;
2. release notes, manifests, preserved peer floors and deterministic candidates;
3. complete local/package/source/reference/browser/security verification;
4. reviewed commit and protected PR flow into `develop`;
5. protected promotion to exact `main` and ancestry reconciliation;
6. read-only npm/GitHub preflight;
7. three separately authorized trusted-publisher settings;
8. one separately authorized stage workflow dispatch;
9. three separately authorized 2FA stage approvals with verification;
10. three separately authorized `latest` transitions with verification;
11. optional token restriction only after the complete OIDC/provenance proof;
    and
12. final registry/source/provenance/consumer review.

Commit, push, PR, merge, workflow dispatch, npm settings, stage approval,
dist-tag, token restriction, tag and GitHub Release remain external gates. No
document approval implicitly authorizes them.

## 9. Recovery requirements

- Before staging, stop without registry mutation.
- After partial staging, leave valid stages pending or reject only with explicit
  approval; never assume the version can be reused.
- After a partial approval, preserve the immutable published version and resume
  only after fresh exact/provenance verification.
- A bad published version requires deprecation and/or a new PATCH, never
  overwrite or assumed unpublish.
- During `latest` transition, preserve the last verified aliases or use a
  separately authorized corrective tag; do not claim coordinated completion
  from a mixed window.
- OIDC authentication failure never falls back to a stored automation token.
- Provenance absence or mismatch stops before any dependent approval or alias
  move.

## 10. Explicit exclusions

M23 option A does not activate:

- runtime, compiler, validator, operations, schema, UI Schema or renderer work;
- any API/export/diagnostic change or Stable promotion;
- React, Vue, Angular legacy/23, remaining D-011/D-025, D-012, D-026, D-033,
  D-035 or another functional capability;
- a fourth public package, validator/reference publication or hosted demo;
- peer-range widening/narrowing, new dependency or new UI kit;
- Git tags, GitHub Releases, changelog automation, npm stage automation beyond
  the exact publish workflow or commercial-contract terms;
- private recovery-bundle deletion; or
- any local, Git, GitHub or npm mutation merely because this review passes.

## 11. Material alternatives

### Option B — direct OIDC PATCH publication

Use the same three PATCH versions and provenance boundary but permit
`npm publish` directly after GitHub environment approval. This is simpler and
works with the existing workflow shape, but it removes npm's package-by-package
2FA proof-of-presence and grants the workflow a stronger action than necessary.
It is not recommended now that all three package names already exist and npm
supports stage-only trust.

### Option C — defer until the next functional release

Keep the current versions and fail-closed workflow until new behavior naturally
requires a release. This avoids metadata-only PATCH versions, but leaves all
default installations without repository metadata/provenance and leaves the
prepared secure path unproven while future scope accumulates. It is safe but
not recommended.

### Publish only core or core/base

Rejected. It would leave admitted public packages with inconsistent source and
provenance posture and would not prove the complete dependency chain.

### Narrow peers automatically to the PATCH versions

Rejected. The implementation is unchanged and current `^0.4.0` peers already
admit the PATCH line. Narrowing to `^0.4.1` would be an unnecessary public
compatibility contraction and would violate the metadata-only boundary.

### Stage under `latest`

Rejected. It would bypass the accepted Experimental `next` verification channel
and make every approval immediately affect unqualified consumers. Separate
dependent-first `latest` transitions preserve the proven recovery model.

## 12. Selection required

Ricard must select:

- **Option A (recommended):** stage-only coordinated PATCH now;
- **Option B:** direct OIDC coordinated PATCH now; or
- **Option C:** defer trusted publication until a future functional release.

Selection promotes only normative design. The exact next document would be the
coordinated ADR-026 revision 1 and ADR-018 revision 7; implementation and every
external action remain inactive.

## Selection follow-up — 25 July 2026

Ricard selected option A. D-043 is promoted only for M23's coordinated
stage-only metadata/security PATCH design. ADR-026 revision 1 and ADR-018
revision 7 may be drafted and completely reviewed; implementation, PLAN-025,
versions in manifests, workflow changes, Git and every GitHub/npm action remain
inactive until their own gates.

## 13. References

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm staged publishing](https://docs.npmjs.com/staged-publishing/)
- [npm stage CLI](https://docs.npmjs.com/cli/v11/commands/npm-stage/)
- [npm trust CLI](https://docs.npmjs.com/cli/v11/commands/npm-trust/)
- [npm provenance statements](https://docs.npmjs.com/generating-provenance-statements/)
- [GitHub OIDC reference](https://docs.github.com/en/actions/reference/security/oidc)
- [pnpm workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
