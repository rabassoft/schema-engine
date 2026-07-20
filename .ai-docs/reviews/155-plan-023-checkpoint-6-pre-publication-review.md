# PLAN-023 checkpoint 6 pre-publication review — Cycle 1

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 6 — base Angular `0.4.0` publication under `next`
- **Gate reviewed:** read-only pre-publication state only
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5 and reviews 146–154
- **Outcome:** Cycle 1 passed all nine areas with zero findings; publication
  remains subject to its separate immediate approval

## Complete zero-finding pass

### 1. Registry, identity and authority

Pass. npm uses `https://registry.npmjs.org/`; `npm whoami` returns
`ricardrabasso`, verified email is `ricard@rabassoft.com`, 2FA remains
`auth-and-writes` and that account remains owner of Rabassoft. No credential was
recorded in commands or project files.

### 2. Live core prerequisite

Pass. Public core `0.4.0` retains exact integrity, npm registry signature,
AGPL license and no repository/provenance metadata. A fresh unauthenticated
download is byte-identical to the selected 218,187-byte candidate. Core remains
`next: 0.4.0` and `latest: 0.3.0`.

### 3. Selected base bytes and source identity

Pass. Selected `@rabassoft/schema-engine-angular@0.4.0` is exactly 126,564
bytes with SHA-512
`8c63d9726f577522dbfdbf0e79218070b85a4e4024fbe5e5ea6ab84051b8f61c4308d77b59ae18a66e5f4d78e799af8fb45df25447dbb3534ab8a09c7662d6a0`.
Evidence ties it to clean private source commit
`07755b4cbe31098f86099db38c65930d52772fb5`; local HEAD and
`origin/develop` resolve to that identity.

### 4. Manifest, peers and package boundary

Pass. The packed manifest exposes only the reviewed root export, public `next`
configuration and provenance disabled. Its core peer is exactly `^0.4.0`;
Angular core/forms peers remain `>=22.0.6 <23.0.0`; the only runtime dependency
is `tslib ^2.8.1`. AGPL license/notices, preferred TypeScript source, frozen
partial-Ivy build harness and author/contact are present without repository
metadata.

### 5. Exact base version absence

Pass. The registry returns `E404` for
`@rabassoft/schema-engine-angular@0.4.0`. Existing base versions remain
`0.1.0`–`0.3.0` only.

### 6. Aliases, access and unrelated drift

Pass. Base remains public and maintained only by
`ricardrabasso <ricard@rabassoft.com>` with
`next`/`latest: 0.3.0`. Pilot remains `next`/`latest: 0.1.0`; core remains in
the verified checkpoint-5 state. No alias, access, owner or setting drift is
observed.

### 7. Lower/latest native consumers

Pass. Clean native consumers using live exact core `0.4.0` and the selected
base tarball compile and execute at Angular `22.0.6` and `22.0.7`. Deep-import
blocking and the framework-neutral core consumer checks also pass.

### 8. Credential-free neutral command rehearsal

Pass. A neutral directory with empty user configuration and isolated cache
accepts the selected basename with the exact public `next`, provenance-disabled
command under `--dry-run`. npm reports 126.6 kB, 702.5 kB unpacked, 114 files
and the selected integrity. No registry mutation occurred.

### 9. External boundary and documentation

Pass. The preflight performed only authorized reads, temporary installs and a
local dry run. It did not publish, move an alias, alter settings/2FA, create a
Git tag or release, change repository visibility or enable provenance.
Formatting, documentation/link, lint, release-tooling and diff checks pass.

## Outcome

The checkpoint 6 pre-publication gate is complete. Base Angular `0.4.0` remains
unpublished. Stop for immediate approval of only:

```text
npm publish ./rabassoft-schema-engine-angular-0.4.0.tgz --access public --tag next --provenance=false
```

That approval authorizes neither pilot publication nor any `latest`, settings,
GitHub, repository-visibility or provenance action.
