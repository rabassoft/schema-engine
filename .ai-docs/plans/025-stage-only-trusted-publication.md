# PLAN-025: Stage-only trusted publication with provenance

- **Status:** Approved
- **Date:** 2026-07-25
- **Revision:** 0 — initial M23 delivery plan
- **Approval date:** 2026-07-25
- **Requires:** Accepted
  [`ADR-026 revision 1`](../adrs/026-public-repository-and-secure-releases.md),
  accepted
  [`ADR-018 revision 7`](../adrs/018-licencia-dual-publicacion-experimental.md),
  accepted [`ADR-010 revision 1`](../adrs/010-versionado-semver-compatibilidad.md),
  completed [`PLAN-024 revision 0`](./024-sanitized-public-repository.md) and
  accepted
  [`review 178`](../reviews/178-d043-m23-trusted-publication-promotion-readiness.md)
  option A
- **Architecture review:**
  [`review 179`](../reviews/179-adr-026-revision-1-adr-018-revision-7-review.md)
  cycle 2 passed all sixteen areas with zero unresolved findings
- **Complete review:**
  [`review 180`](../reviews/180-plan-025-review.md) cycle 2 passed all eighteen
  areas with zero unresolved findings
- **Milestone:** M23 — first stage-only trusted publication with provenance
- **Capability:** promoted D-043 metadata/OIDC/provenance slice only
- **Implementation:** Checkpoints 1–6 completed after reviews 181–186;
  checkpoint 6 corrected the accumulated-release verification semantics and
  passed its complete review in cycle 5 with zero findings; checkpoint 7
  completed after review 187 cycle 1 passed all trust areas with zero findings;
  checkpoint 8 pre-dispatch review 188 cycle 2 passed with zero findings and
  exact run `30304490264` passed verify/stage; review 189 cycle 1 blocks on
  cross-platform gzip byte mismatch, with all three stages unapproved; review
  190 cycle 3 passes the local deterministic-gzip correction with zero findings
  and leaves protected delivery plus stage rejection separately gated; PR #18
  merges the correction into protected `develop@5e60796`, post-merge CI passes
  and review 191 cycle 2 accepts the clean deterministic rebuild with zero
  findings; PR #19 delivers that evidence to protected `develop@e99193b`, its
  required/post-merge CI passes and review 192 cycle 6 accepts protected-main
  promotion readiness subject to delivering its documentation-only evidence
  and reobserving exact `develop`; PR #20 delivers that evidence as protected
  `develop@84d72f9`, both CI gates pass and review 193 cycle 2 reconciles the
  durable promotion decision without authorizing promotion or npm

## 1. Goal and hard boundary

Prepare, stage, approve and verify only these new immutable metadata/security
PATCH versions:

| Package                                 | Version | Preserved packed Schema Engine peer floor |
| --------------------------------------- | ------- | ----------------------------------------- |
| `@rabassoft/schema-engine`              | `0.4.1` | none                                      |
| `@rabassoft/schema-engine-angular`      | `0.4.1` | core `^0.4.0`                             |
| `@rabassoft/schema-engine-angular-aria` | `0.2.1` | base Angular `^0.4.0`                     |

The plan adds truthful package-specific public repository metadata, removes the
explicit provenance opt-out, stages through a package-specific trusted
publisher that permits only `npm stage publish`, requires Ricard's 2FA approval
for every package and verifies automatic provenance from exact protected
`main`.

It must not change runtime behavior, declarations, exports, diagnostics,
dependencies, Angular/Aria/CDK ranges, support tiers or Experimental status.
Core/base equal PATCH versions remain independently justified and do not create
lockstep policy.

Plan approval authorizes only checkpoint 1 local implementation. Every later
checkpoint requires its explicit gate below. Commit, push, PR, merge, workflow
dispatch, npm trust, stage approval/rejection, dist-tag, token restriction, Git
tag and GitHub Release are never authorized by plan state.

## 2. Exact release contract

| Contract            | Required state                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Core                | `@rabassoft/schema-engine@0.4.1`; no runtime dependency                                                                              |
| Base Angular        | `@rabassoft/schema-engine-angular@0.4.1`; packed core peer `^0.4.0`; `tslib` only runtime dependency                                 |
| Angular Aria pilot  | `@rabassoft/schema-engine-angular-aria@0.2.1`; packed base peer `^0.4.0`; `tslib` only runtime dependency                            |
| Framework peers     | unchanged Angular core/forms `>=22.0.6 <23.0.0`; Aria/CDK `>=22.0.5 <23.0.0`; exact alignment rules preserved                        |
| Repository metadata | `git+https://github.com/rabassoft/schema-engine.git`; exact directory `packages/core`, `packages/angular` or `packages/angular-aria` |
| Provenance source   | automatic npm attestation from exact protected `main`, repository and `.github/workflows/npm-publish.yml`                            |
| Trusted publisher   | GitHub Actions; `rabassoft/schema-engine`; workflow `npm-publish.yml`; environment `npm-publish`; allow stage only                   |
| Staging order       | dependency-first core, base Angular, pilot under `next`                                                                              |
| Approval order      | dependency-first core, base Angular, pilot; separate Ricard 2FA approval and verification                                            |
| `latest` transition | deepest-dependent-first pilot, base Angular, core                                                                                    |
| Source/license      | unchanged package-local Corresponding Source, AGPL-3.0-only/commercial notices and public holder/contact                             |
| Stability           | Public + Experimental + Active; aliases and provenance do not imply Stable                                                           |
| Excluded package    | private validator Ajv, workspace root and reference applications remain unpublished                                                  |

Source manifests use `workspace:^0.4.0` for the two Schema Engine peer edges.
Packing must contain ordinary `^0.4.0`, never a workspace specifier or narrowed
`^0.4.1`.

## 3. Authorization zones

1. **Plan preparation/review:** documentation only.
2. **Checkpoint 1 local tooling:** authorized only after plan approval.
3. **Checkpoints 2–3 local release state/candidates:** each begins only after
   the preceding checkpoint review passes with zero findings and Ricard or the
   standing bounded-checkpoint rule authorizes continuation.
4. **Protected Git delivery:** checkpoint 4 requires explicit branch/commit/
   push/PR authorization; checkpoint 5 requires separate promotion/
   reconciliation authorization.
5. **External read-only preflight:** checkpoint 6 requires explicit network/
   npm/GitHub read authorization if no existing permission covers it.
6. **npm trust settings:** checkpoint 7 has one immediate approval and
   post-observation per package.
7. **Workflow staging:** checkpoint 8 has one immediate workflow-dispatch
   approval after exact source/input review.
8. **Stage approvals:** checkpoints 9–11 each require immediate Ricard approval
   and npm 2FA.
9. **Aliases:** checkpoints 12–14 each require immediate approval.
10. **Token restriction:** checkpoint 15 changes each package only through its
    own immediate approval after complete trusted-publication proof.
11. **Closure:** checkpoint 16 is read-only and grants no later release.

Authorization never flows to a later package, checkpoint, command or recovery
mutation. OTPs, session tokens, recovery codes, security keys and OIDC tokens
never enter repository commands, captured evidence or documentation.

## 4. Checkpoint 1 — M23 descriptor and fail-closed tooling

1. Add a frozen M23 descriptor with exact package identities/versions,
   repository directories, preserved peers, stage/approval/tag orders,
   candidate filenames, compatibility tuples, provenance requirement and the
   stage-only trusted-publishing policy. Do not embed a future Git commit in
   the descriptor: a commit cannot truthfully contain its own SHA.
2. Preserve M19/M21 descriptors, artifacts, commands and live verifiers as
   immutable historical regressions.
3. Extend readiness to require trusted publishing enabled, stage-only allowed
   action, provenance expected, repository metadata, absence of
   `publishConfig.provenance: false` and no token fallback. Validate the exact
   source at execution time by requiring the requested 40-character commit to
   equal `GITHUB_SHA` on protected `main`; selected candidate evidence must
   independently record that same commit.
4. Update workflow-policy tests to require `npm stage publish`, prohibit direct
   `npm publish`, require the protected environment and isolate
   `id-token: write` to the staging job.
5. Pin exact npm `11.18.0` for the proposed workflow and fixtures. Before any
   external use, reobserve official requirements; a newer required minimum
   stops for reviewed correction rather than floating silently.
6. Add fixtures for missing/dual allowed actions, wrong owner/repository/
   workflow/environment, wrong directories, narrowed peers, unexpected package,
   provenance opt-out, token environment variables and non-main source.
7. Define credential-free commands for stage metadata parsing, staged-tarball
   comparison, registry provenance verification and no-drift checks without
   invoking a registry mutation.
8. Make M23 candidate preparation generate the three exact descriptor-named
   tarballs deterministically so the workflow stages those bytes rather than
   repacking package directories.

Gate: focused release-target/readiness/workflow/publication tests pass; current
manifests/workflow continue to fail closed for M23. No version, manifest,
lockfile, candidate, Git or external state changes.

## 5. Checkpoint 2 — Manifests, release notes and workflow

1. Change only public package versions to `0.4.1`, `0.4.1`, `0.2.1`.
2. Add exact repository objects/directories to the three public manifests.
3. Remove `publishConfig.provenance: false`; retain public access and `next`.
4. Set both source peer edges to `workspace:^0.4.0`; preserve dependencies,
   exports, framework peers, styles, source/license and author/contact.
5. Update the lockfile only for deterministic version/specifier consequences.
6. Add `.ai-docs/releases/0.4.1.md` with candidate/staged/partial/live states,
   exact source/provenance truth, installation, compatibility and recovery.
7. Reconcile root/package onboarding and compatibility tables without claiming
   staged or public state before observation.
8. Change the protected workflow to build the three deterministic M23 tarballs
   and invoke `npm stage publish` on those exact descriptor paths under `next`;
   retain exact source input, complete verify job, GitHub-hosted runner, no
   cache, pinned actions and least privilege.
9. Make documentation/workflow/public-tree checks fail on direct publish,
   wrong tool floor, premature provenance, wrong peers/versions/directories or
   current versions presented as already live.

Gate: manifests, workflow and documentation describe only proposed candidate
state; focused and documentation checks pass. No candidate, Git or external
action occurs.

## 6. Checkpoint 3 — Complete local candidate gate

Run the frozen complete matrix, including:

```text
CI=true pnpm install --frozen-lockfile --offline --ignore-scripts
pnpm format:check
pnpm docs:check
pnpm verify:workflows
pnpm check:public-repository
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:source
pnpm test:release:tooling
pnpm test:public-repository
pnpm reference:snippets:check
pnpm reference:test:boundaries
pnpm reference:test:unit
pnpm reference:standard:test:unit
pnpm reference:test:e2e
pnpm reference:standard:test:e2e
git diff --check
```

Then:

1. pack all three artifacts deterministically under ignored `.release/0.4.1`;
2. verify manifests, repository directories, exact peers, exports,
   dependencies, source/license, absence of workspace specifiers and absence of
   provenance opt-out;
3. rebuild each package only from extracted Corresponding Source;
4. compare declarations, exports, runtime/reference behavior and package
   inventories with M21, allowing only reviewed metadata/version differences;
5. run lower/current native and pilot consumers from candidate tarballs,
   including all accepted SPEC-009 scenarios and M18 regressions;
6. audit tracked/packed material for secrets, credentials, local paths,
   generated output, inaccessible links, rights and unexpected files;
7. execute credential-free `npm stage publish --dry-run` for each exact
   neutral-path tarball with exact `--access public --tag next`;
8. record toolchain, sizes, SHA-512/integrity and `sourceCommit: null`; and
9. correct findings and repeat the complete checkpoint review until one full
   pass has zero findings.

Gate: deterministic dirty-tree comparison candidates exist but are not
publishable evidence because they have no protected source commit. No Git,
authentication, registry or external action occurs.

## 7. Checkpoint 4 — Protected develop delivery and clean rebuild

Stop for explicit authorization to create a short-lived branch, scoped commit,
push and PR into protected `develop`. The reviewed scope must exclude unrelated
changes and include all M23 documents/tooling/manifests/workflow evidence.

After required CI passes and merge is separately authorized, rebuild from the
exact clean `develop` merge result. These remain comparison candidates only:
they must be byte-identical to checkpoint-3 inputs except for recorded
source-commit evidence. Any unexplained difference restarts checkpoint 3.

No `main` promotion, npm read/write, trust, stage, tag or token action belongs
here.

## 8. Checkpoint 5 — Protected main promotion and reconciliation

Stop for separate authorization to open/promote `develop` into protected
`main` using the accepted merge-commit topology. Required and post-merge CI must
pass. Then reconcile `main` ancestry back into `develop` through a separate
protected PR/merge authorization.

Verify exact refs, `main` ancestor of `develop`, intended tree equality and a
clean rebuild. Only byte-identical candidates produced at the exact protected
`main` source commit become selected publishable evidence. No npm action occurs.

## 9. Checkpoint 6 — Read-only npm/GitHub preflight

After explicit external-read authorization, reobserve:

- official Node/npm trusted and staged-publishing minimums;
- exact public repository/default/protected branches/workflow/environment;
- zero stored release credentials and exact Actions permissions;
- npm identity `ricardrabasso`, Rabassoft authority, 2FA and package access;
- absence or exact current trust relations and token restrictions;
- immutable M19/M21 bytes, signatures, metadata and aliases;
- absence of all M23 versions/stages;
- selected candidate hashes/source commit/repository metadata; and
- exact lower/current candidate consumers and neutral dry runs.

Also run all frozen live M19/M21 regressions:

```text
pnpm test:live:m19:exact
pnpm test:live:m21:exact
pnpm test:live:m21:next
pnpm test:live:m21:latest
pnpm test:live:m21:unqualified
```

M19 is an immutable historical exact-byte/source/consumer regression. Its
former `next`/`latest` aliases are not M19 invariants after accepted M21 moved
them to `0.4.0`. Registry-backed historical consumers must also remain
independent from later prepared workspace manifest versions; only candidate
mode asserts equality with current workspace manifests.

Unexpected trust, stage, version, alias, access, credential, source or tool
state stops before settings mutation.

## 10. Checkpoint 7 — Three stage-only trusted-publisher relations

For each package in dependency order, present the exact current state and one
configuration mutation equivalent to:

```text
npm trust github <package> \
  --file npm-publish.yml \
  --repo rabassoft/schema-engine \
  --env npm-publish \
  --allow-stage-publish
```

Each package requires separate immediate authorization. Do not pass
`--allow-publish`. After each mutation, reobserve owner/repository/workflow/
environment/allowed action and confirm the other packages/settings did not
drift. npm's saved configuration is not functional proof; a mismatch stops.

## 11. Checkpoint 8 — Protected workflow staging

Reverify exact protected `main`, descriptor, workflow/tool versions,
environment, three trust relations, candidate bytes and absence of M23
versions/stages. Present the exact `workflow_dispatch` inputs:

- `release=m23`;
- `source_commit=<exact protected main SHA>`.

Stop for immediate authorization to dispatch that single workflow. The
environment approval is a separate external action: after dispatch reaches that
gate, stop again for Ricard's immediate authenticated approval. The workflow
may stage only the three exact generated tarballs under `next`.

After success, record the three stage IDs, download each staged tarball through
authenticated read-only npm access, compare it byte-for-byte with the selected
candidate and repeat manifest/source/license/security checks. No stage is
approved or rejected here.

## 12. Checkpoint 9 — Core `0.4.1` 2FA approval

After reobserving all staged bytes and no live M23 version, present only the
exact core stage ID. Stop for Ricard's immediate npm 2FA approval through CLI or
npmjs.com.

Verify live core `0.4.1` exact bytes/integrity/signature, public access,
repository metadata, source/license, automatic provenance bound to exact
repository/workflow/source, `next: 0.4.1`, unchanged `latest: 0.4.0`, unchanged
base/pilot aliases/settings and exact/`next` core consumers.

## 13. Checkpoint 10 — Base Angular `0.4.1` 2FA approval

After fresh proof of checkpoint 9 and staged base bytes, stop for separate
immediate approval of only the base stage ID.

Verify exact bytes/integrity/signature, packed core peer `^0.4.0`, repository,
source/license, provenance, `next: 0.4.1`, unchanged `latest: 0.4.0`, unchanged
pilot/settings and lower/current exact/`next` native consumers.

## 14. Checkpoint 11 — Pilot `0.2.1` 2FA approval

After fresh proof of the live core/base pair and staged pilot bytes, stop for
separate immediate approval of only the pilot stage ID.

Verify exact bytes/integrity/signature, packed base peer `^0.4.0`, unchanged
framework peers/exports/styles, repository/source/license, provenance,
`next: 0.2.1`, unchanged `latest: 0.2.0`, no drift and all exact/`next` native/
pilot consumers.

## 15. Checkpoint 12 — Pilot `latest` transition

After a separately authorized read-only preflight, stop for immediate approval
of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular-aria@0.2.1 latest
```

Verify only pilot `latest` changed. Core/base remain on `latest: 0.4.0`. This is
a planned mixed window; no coordinated `latest`/unqualified evidence is valid.

## 16. Checkpoint 13 — Base Angular `latest` transition

After fresh proof of checkpoint 12, stop for immediate approval of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular@0.4.1 latest
```

Verify only base `latest` changed. Core remains on `latest: 0.4.0`; the mixed
window remains invalid for coordinated default evidence.

## 17. Checkpoint 14 — Core `latest` transition

After fresh proof of checkpoint 13, stop for immediate approval of only:

```text
npm dist-tag add @rabassoft/schema-engine@0.4.1 latest
```

Verify all exact/`next`/`latest`/unqualified versions, bytes, peers,
provenance and lower/current native/pilot consumers. Only this closes the mixed
window.

## 18. Checkpoint 15 — Token restriction

After the complete trusted/public/default matrix passes, reobserve each
package's publish-access policy and all account/organization tokens. For each
package not already exact, stop for its own immediate authorization to select
“Require two-factor authentication and disallow tokens.”

Remove an obsolete automation token only after separate exact identification
and authorization. Preserve interactive session/2FA for stage approvals,
dist-tags and recovery. Verify trusted staging remains configured and no
package/access/alias changed.

## 19. Checkpoint 16 — Final verified closure

Repeat:

1. exact selected/live bytes, integrity, signatures, repository metadata and
   provenance for all M23 packages;
2. immutable M19/M21 bytes, metadata and historical absence of retroactive
   provenance, rerunning every `test:live:m19:*` and `test:live:m21:*`
   exact/`next`/`latest`/unqualified command named by checkpoint 6;
3. exact trust relations, token policies, Actions/environment and no stored
   release credential;
4. exact/`next`/`latest`/unqualified lower/current native and pilot consumers;
5. frozen install, formatting, docs, workflow/public-tree/history policy, lint,
   types, tests, builds, package/source/security, snippets, boundaries and both
   browser lanes;
6. SPEC-009/M20 behavior and M18 compatibility with no API/declaration drift;
7. release notes, onboarding, STATUS, ROADMAP, Deferred, ADR/plan/review indexes
   and WORKLOG consistency; and
8. no Stable, wider-framework, extra-package, Git tag/Release, SLA or unrelated
   Deferred claim.

Correct every finding and repeat the complete review until one full pass has
zero findings. Only then mark PLAN-025/M23 complete from observed state.

## 20. Partial failure and recovery

| Last completed mutation | Truthful state and recovery boundary                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| None                    | Stop without npm mutation.                                                                                           |
| Partial trust           | Preserve exact observed relations; resume only after fresh package-by-package verification or separately remove one. |
| Partial staging         | Preserve valid stages; reject only with explicit approval; never silently reuse a reserved/rejected version.         |
| Core approved           | Preserve immutable core `0.4.1`; verify provenance before resuming or publish a later approved PATCH if defective.   |
| Core/base approved      | Preserve both `0.4.1`; keep defaults unchanged and do not claim coordinated completion.                              |
| All three approved      | Preserve pilot `0.2.1`; reverify exact/`next` and provenance before aliases.                                         |
| Pilot `latest`          | Preserve the one-edge pilot/base mixed window or separately restore pilot `latest` to `0.2.0`.                       |
| Base `latest`           | Preserve the base/core mixed window or separately restore base `latest` to `0.4.0`.                                  |
| Core `latest`           | Do not close until the complete default consumer/provenance matrix passes.                                           |
| Partial token policy    | Preserve stronger verified settings; do not weaken silently or claim complete transition.                            |

Every stage rejection, corrective tag, trust removal/change, deprecation or
token action is a separately presented mutation. Never overwrite/unpublish
published bytes, fabricate provenance or fall back to a stored publish token.

## 21. Expected repository diff

- release descriptor/tooling/tests and workflow-policy fixtures;
- three public manifests plus mechanically required lockfile/source-harness
  updates;
- `.github/workflows/npm-publish.yml`;
- `.ai-docs/releases/0.4.1.md`;
- root/package onboarding and compatibility documentation;
- PLAN/checkpoint reviews, indexes, STATUS/ROADMAP/Deferred/WORKLOG; and
- no runtime/source/declaration behavior change outside release tooling.

Generated candidates, downloaded stages, caches, auth files, logs, reports,
OTP/security material and local operator notes remain ignored/untracked.

## 22. Stop conditions

Stop on any contract/API/framework change; unexpected package/version/stage/
trust/alias/access/token state; source or candidate mismatch; missing/mismatched
provenance; unsupported official tool requirement; failed required check;
credential/personal-data/rights finding; mixed-window evidence presented as
complete; inability to preserve peer floors; or any external action lacking its
immediate authorization.

## 23. Completion criteria

PLAN-025/M23 completes only when all sixteen checkpoints pass, the three exact
versions and aliases resolve to selected bytes with exact provenance, trust and
token policies are observed, every consumer/matrix passes and one final complete
review has zero findings.

Completion does not authorize another release, framework, package, capability,
Git tag/GitHub Release, backup deletion or external action.

## 24. Review and approval state

PLAN-025 revision 0 is Approved after review 180 cycle 2 passed all eighteen
areas with zero unresolved findings. Approval authorizes checkpoint 1 only;
every later checkpoint retains the gates above.
