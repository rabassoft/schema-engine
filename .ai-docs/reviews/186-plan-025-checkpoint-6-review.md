# PLAN-025 checkpoint 6 review — Cycles 1–5

- **Date:** 2026-07-27
- **State:** Accepted after cycle 5 completed the repeated review with zero
  findings
- **Scope:** Read-only npm/GitHub preflight and frozen M19/M21 live regressions
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** R186-F01/F02/F03 are resolved; checkpoint 6 is complete and no
  mutation occurred

## Cycle 1 observations

1. Current official npm documentation still requires Node `22.14.0` or later
   and npm `11.5.1` or later for trusted publishing, and npm `11.15.0` or later
   for staged publishing. The exact selected toolchain remains Node `22.23.1`
   and npm `11.18.0`.
2. The connected GitHub repository is public, its default branch is `main`, and
   the only long-lived branches are `main` and `develop`.
3. Remote refs remain exact:
   `main@4bcb6eabed76d8bc2fa877236d10b7831cbb6f00` and
   `develop@6d00ed02d3a641eb9153e14cd2ac0f094a15be8d`.
4. The exact protected-main `npm-publish.yml` remains manually dispatched,
   SHA-pinned, GitHub-hosted, environment-gated and stage-only; only its stage
   job receives `id-token: write`.
5. Anonymous npm reads return E404 for core/base `0.4.1` and pilot `0.2.1`, so
   no M23 live version is observable.
6. The M19 exact command passes immutable bytes, signatures, metadata and
   lower/current exact consumers.
7. Every M21 live artifact verifier reaches its success message: exact bytes,
   signatures, metadata and the current `next`/`latest` aliases remain
   consistent with M21 before the consumer harness reaches its local-manifest
   assertion.
8. No trust, stage, approval, publication, alias, token, GitHub setting or
   repository mutation occurred.

## Findings

| ID       | Finding                                                                                                                                                                                                                          | Required resolution                                                                                                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R186-F01 | Both local `gh` sessions are invalid and `npm whoami` returns `ENEEDAUTH`. GitHub settings/secrets and npm identity, 2FA, authority, access, trust, stages and token restrictions therefore cannot be observed completely.       | Ricard must reauthenticate `gh` as `rabassoft` and npm as `ricardrabasso` outside captured evidence, then the complete authenticated read-only preflight must restart.                                                     |
| R186-F02 | The frozen M19 `next`, `latest` and unqualified commands require those aliases to resolve to `0.3.0`, but accepted/completed M21 intentionally moved them to `0.4.0`. They now fail before testing historical consumers.         | Revise the checkpoint contract so M19 proves immutable exact bytes/metadata and exact historical consumers without asserting aliases that later accepted releases intentionally moved.                                     |
| R186-F03 | Every M21 command verifies live bytes/tags, then `verify-m20-clean-consumers.mjs` rejects the current M23-prepared workspace versions (`0.4.1`/`0.2.1`) because it requires the historical M21 manifest tuple (`0.4.0`/`0.2.0`). | Make registry-backed historical consumer modes independent from current workspace manifest versions while retaining the exact source-manifest assertion for candidate mode; review the resulting contract before resuming. |

## Recommended correction boundary

1. Preserve the existing M19/M21 candidate evidence and live registry bytes.
2. Keep M19 exact immutable verification, but stop treating moved
   `next`/`latest` aliases as M19 invariants.
3. Retain all four M21 exact/`next`/`latest`/unqualified registry and consumer
   lanes.
4. Restrict current-workspace manifest equality to candidate-backed consumer
   modes so historical registry-backed lanes remain runnable after a later
   release is prepared.
5. Add focused regression tests for both accumulated-release cases, update the
   PLAN-025 checkpoint-6 command contract, and repeat the complete review.

This correction changes verification semantics, not runtime, package bytes,
aliases or public API. It nevertheless requires explicit approval because the
approved plan currently names the impossible command matrix exactly.

## Approved correction and repeated review

Ricard approved the recommended correction after cycle 1.

Cycle 2:

1. changed PLAN-025 to retain M19 exact immutable verification without treating
   aliases moved by M21 as M19 invariants;
2. made current-workspace manifest equality apply only to candidate-backed
   consumers;
3. retained M21 exact/`next`/`latest`/unqualified registry-backed consumers;
4. added a focused regression covering candidate versus registry-backed modes;
   and
5. passed 40 release-tooling tests, documentation, lint and diff checks.

The first live retry incorrectly ran five browser-bearing commands in parallel.
Their shared port 4173 produced execution collisions. This did not expose a
product or contract defect; the commands are independent sequential checkpoints
and were restarted from zero in the required order.

Cycle 3 passed the corrected matrix sequentially with zero findings:

```text
pnpm test:live:m19:exact
pnpm test:live:m21:exact
pnpm test:live:m21:next
pnpm test:live:m21:latest
pnpm test:live:m21:unqualified
```

All immutable bytes, signatures, metadata, current M21 aliases, lower/current
native and pilot installations, partial compilation, type checks, unit tests,
production builds and Chromium E2E lanes pass. Current M23-prepared workspace
manifests remain unchanged and all three M23 live versions remain absent.

R186-F02 and R186-F03 are resolved. R186-F01 remains open, so checkpoint 6 is
not accepted and no npm trust/settings/stage action may follow.

## Cycle 4 — authenticated preflight

Ricard reauthenticated both services. Read-only observation confirms:

1. active GitHub identity `rabassoft` and npm identity `ricardrabasso`;
2. verified public contact, account 2FA `auth-and-writes`, Rabassoft owner
   authority and read-write access to all three packages;
3. all packages public with only `ricardrabasso` as owner/collaborator;
4. zero npm tokens and zero staged packages;
5. exact M19/M21 version inventories and `next`/`latest` aliases;
6. public GitHub repository, default `main`, exact long-lived refs, active
   SHA-pinned release workflow and accepted repository settings;
7. active no-bypass ruleset `19534784`, read-only default workflow permissions,
   selected full-SHA Actions policy and the accepted protected
   `npm-publish` environment; and
8. zero repository/environment Actions secrets or variables.

The npm CLI requires a fresh interactive browser/2FA confirmation for each
`npm trust list` read. One agent-started core query waited without browser
approval and was cancelled; it caused no mutation. R186-F01 is narrowed to
three manual read-only trust observations.

## Cycle 5 — completed trust observations and full review

Ricard ran the three package-specific commands sequentially and completed each
browser/security-key confirmation:

```text
npm trust list @rabassoft/schema-engine --json
npm trust list @rabassoft/schema-engine-angular --json
npm trust list @rabassoft/schema-engine-angular-aria --json
```

Each command returned the exact empty JSON array `[]`. No package therefore has
an existing trusted-publisher relation, including no broader direct-publish
permission. A subsequent read-only agent retry required a new 2FA challenge,
as expected, and made no mutation.

The complete checkpoint review was then repeated against the accumulated
evidence:

1. exact tool floors and selected toolchain pass;
2. GitHub identity, public repository, protected refs, workflow, environment,
   ruleset and Actions settings pass;
3. npm identity, owner authority, verified email, 2FA, package access and
   ownership pass;
4. npm tokens, stages, trust relations and M23 versions are all absent;
5. M19 exact immutable bytes and consumers pass;
6. M21 exact/`next`/`latest`/unqualified bytes, signatures, metadata, aliases
   and lower/current native/pilot consumers pass sequentially;
7. selected protected-`main` candidate hashes, source commit and repository
   metadata remain exact; and
8. no trust, stage, approval, publication, alias, token, GitHub setting or
   repository mutation occurred.

Cycle 5 has zero findings. R186-F01 is resolved, review 186 is Accepted and
PLAN-025 checkpoint 6 is complete. Checkpoint 7 remains a separately gated
external mutation, beginning with only the core package after immediate
authorization.

Final local closure passes formatting, 279-document/915-link documentation,
lint, 40 release-tooling tests, 23 public/readiness/workflow tests, the
759-file public-tree policy, workflow policy and diff checks.
