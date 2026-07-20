# PLAN-023 checkpoint 5 pre-publication review — Cycles 1–3

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 5 — core `0.4.0` publication under `next`
- **Gate reviewed:** read-only pre-publication state only
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5 and reviews 146–152
- **Outcome:** Cycle 3 passed all nine areas with zero findings; publication
  remains subject to its separate immediate approval

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                              | Correction                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| R153-F01 | The first authorized attempt stopped fail-closed because identity, profile, organization and access returned `E401`. | Ricard restored the npm session interactively; the complete read-only preflight restarted from identity.                  |
| R153-F02 | The first repeated neutral dry run reached a global npm cache containing files owned by another user.                | Repeated the complete review with a fresh temporary cache, empty user configuration and no credentials or registry write. |

## Cycle 3 — complete zero-finding pass

### 1. Registry, tool and identity

Pass. npm is `10.9.8`, the configured registry is exactly
`https://registry.npmjs.org/` and `npm whoami` returns only `ricardrabasso`.
No credential was copied into a command, review or repository file.

### 2. Account, 2FA and organization authority

Pass. The verified account email is `ricard@rabassoft.com`; 2FA mode is
`auth-and-writes` with no pending transition. `ricardrabasso` is owner of the
Rabassoft organization and has `read-write` authority over all three existing
packages.

### 3. Exact M21 version absence

Pass. The registry returns `E404` for core `0.4.0`, base Angular `0.4.0` and
Angular Aria `0.2.0`. No M21 version has been published and no M21 alias exists.

### 4. Immutable M19 bytes and aliases

Pass. The live M19 verifier downloaded and compared all three exact public
artifacts byte for byte with the immutable selected baselines. Core/base remain
`next`/`latest: 0.3.0`; the pilot remains `next`/`latest: 0.1.0`.

### 5. Existing package settings and drift

Pass. All three packages remain public, licensed `AGPL-3.0-only` and maintained
only by `ricardrabasso <ricard@rabassoft.com>`. Their public artifacts retain
npm registry signatures. Repository and provenance metadata remain absent;
versions, aliases, access and ownership show no unrelated drift.

### 6. Selected core bytes and source identity

Pass. `.release/0.4.0/rabassoft-schema-engine-0.4.0.tgz` is exactly 218,187
bytes with SHA-512
`b7cf651a4da9e26956f75fdf8e83ee8abba84423202a24cb9d9fc8ed50ee7d6eb1d64136378adc229f24362d3d525d432a630308cff5ba2ced7b2048e2b046da`.
Its evidence records `baseCommit` and `sourceCommit` as
`07755b4cbe31098f86099db38c65930d52772fb5`; local HEAD and
`origin/develop` resolve to that same private source commit.

### 7. Core manifest, source and license boundary

Pass. The packed manifest is exactly `@rabassoft/schema-engine@0.4.0`, ESM,
side-effect free and public under `next` with provenance disabled. It contains
only the reviewed root export, AGPL license/notice, preferred TypeScript source
and frozen package-local build harness. It contains no repository metadata or
framework dependency.

### 8. Credential-free neutral command rehearsal

Pass. A fresh neutral directory with an empty user configuration and isolated
temporary npm cache accepted the exact basename-relative command with
`--dry-run`. npm reported the expected package name/version, 218.2 kB archive,
88 files, exact integrity and public `next` destination. No authentication or
registry mutation occurred.

### 9. External boundary and current state

Pass. The preflight performed only authorized reads and a local dry run. It did
not publish, move a dist-tag, alter access/maintainers/2FA, create a Git tag or
release, change repository visibility/settings, or enable provenance. The
working tree still contains only the intentionally uncommitted checkpoint
closure documentation/check updates; the selected candidate remains ignored
and byte-stable. Formatting, 238-document/805-link checks, lint, all 23 release-
tooling tests and complete diff checks pass.

## Outcome

The checkpoint 5 pre-publication gate is complete with zero findings. The core
publish has not occurred. The exact next action is to stop for immediate
approval of only:

```text
npm publish ./rabassoft-schema-engine-0.4.0.tgz --access public --tag next --provenance=false
```

That approval authorizes neither later package publication nor any dist-tag,
package-setting, GitHub, repository-visibility or provenance action.
