# PLAN-023 checkpoint 7 pre-publication review — Cycles 1–2

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 7 — Angular Aria pilot `0.2.0` publication under `next`
- **Gate reviewed:** read-only pre-publication state only
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5 and reviews 146–156
- **Outcome:** Cycle 2 passed all nine areas with zero findings; publication
  remains subject to its separate immediate approval

## Cycle 1 finding and correction

| ID       | Finding                                                                                                 | Correction                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| R157-F01 | Lower/latest Chromium matrices were launched concurrently and competed for their fixed local port 4173. | Serialized both complete matrices; this changes only review orchestration, not product or contract. |

## Cycle 2 — complete zero-finding pass

### 1. Registry, identity and authority

Pass. npm uses `https://registry.npmjs.org/`; `npm whoami` returns
`ricardrabasso`, verified email is `ricard@rabassoft.com`, 2FA remains
`auth-and-writes` and that account remains owner of Rabassoft with `read-write`
authority over all three packages. No credential was recorded.

### 2. Live core/base prerequisites

Pass. Fresh unauthenticated downloads of public core/base `0.4.0` are
byte-identical to the selected 218,187-byte and 126,564-byte candidates. Both
retain exact integrity, registry signatures, AGPL/source metadata,
`next: 0.4.0`, `latest: 0.3.0` and no repository/provenance metadata.

### 3. Selected pilot bytes and source identity

Pass. Selected `@rabassoft/schema-engine-angular-aria@0.2.0` is exactly 28,618
bytes with SHA-512
`7456894807d472d174a1168e749a8fc2aadaea4e0b0cbd4d9cf4b1d36a8ed9f0be38502868d8f20b2deb08d430a21fa2c51b0eab8c67b91b096212b0b932995e`
and integrity
`sha512-dFaJSAfUctF0oRaOdJqPwqra6k4LDL1NnPSx02qO2fC+OFAoaNjyCy3rCNQwoh+ixRsOq4xnuRsJYhKwuTKZXg==`.
Evidence ties it to clean private source commit
`07755b4cbe31098f86099db38c65930d52772fb5`; local HEAD and
`origin/develop` resolve to that identity.

### 4. Manifest, peers, exports and package boundary

Pass. The packed manifest exposes only the reviewed root and `./styles.css`
exports, keeps `styles.css` side effects, public `next` and provenance disabled.
Its base peer is exactly `^0.4.0`; Angular core remains
`>=22.0.6 <23.0.0`; Angular Aria/CDK remain `>=22.0.5 <23.0.0`; `tslib ^2.8.1`
is the only runtime dependency. AGPL license/notices, preferred TypeScript
source, frozen build harness, author/contact and styles are present without
repository metadata.

### 5. Exact pilot version absence

Pass. The registry returns `E404` for
`@rabassoft/schema-engine-angular-aria@0.2.0`. Existing pilot versions remain
limited to `0.1.0`.

### 6. Aliases, access and unrelated drift

Pass. All three packages remain public and maintained only by
`ricardrabasso <ricard@rabassoft.com>`. Core/base remain
`next: 0.4.0`, `latest: 0.3.0`; pilot remains
`next`/`latest: 0.1.0`. No alias, access, owner or setting drift is observed.

### 7. Lower/latest native and pilot consumers

Pass. Clean native and pilot consumers using live exact core/base `0.4.0` plus
the selected pilot tarball pass partial compilation, strict typecheck, unit
test, production build and Chromium smoke at Angular `22.0.6` and `22.0.7`,
with Angular Aria/CDK `22.0.5` exactly aligned.

### 8. Credential-free neutral command rehearsal

Pass. A neutral directory with empty user configuration and isolated cache
accepts the selected basename with the exact public `next`, provenance-disabled
command under `--dry-run`. npm reports 28,618 bytes, 98,571 bytes unpacked, 15
files and the selected integrity. No registry mutation occurred.

### 9. External boundary and documentation

Pass. The preflight performed only authorized reads, temporary installs and a
local dry run. It did not publish, move an alias, alter settings/2FA, create a
Git tag or release, change repository visibility or enable provenance.
Formatting, documentation/link, lint, release-tooling and diff checks pass.

## Outcome

The checkpoint 7 pre-publication gate is complete. Pilot `0.2.0` remains
unpublished. Stop for immediate approval of only:

```text
npm publish ./rabassoft-schema-engine-angular-aria-0.2.0.tgz --access public --tag next --provenance=false
```

That approval authorizes neither any `latest` transition nor settings, GitHub,
repository-visibility or provenance action.
