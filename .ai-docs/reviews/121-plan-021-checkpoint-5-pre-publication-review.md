# PLAN-021 checkpoint 5 pre-publication review — Cycles 1–2

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 5 — core `0.3.0` publication under `next`, pre-publication gate
- **Authority:** ADR-018 revision 4 and reviews 114–120
- **Outcome:** Cycle 2 passed all nine pre-publication areas with zero findings

## Cycle 1 observation and recovery

The first authorized attempt confirmed the exact official registry but
`npm whoami` returned `E401`. The preflight stopped before further metadata
queries. Ricard restored the npm session interactively; no credential was
requested or exposed. Cycle 2 restarted from identity and completed all areas.

## 1. Registry, CLI and identity

Pass. npm CLI is `10.9.8`, registry is exactly
`https://registry.npmjs.org/` and the authenticated identity is
`ricardrabasso`.

## 2. Organization and write-protected 2FA

Pass. `ricardrabasso` is owner of organization `rabassoft`. The profile reports
verified `ricard@rabassoft.com` and 2FA mode `auth-and-writes` with no pending
change.

## 3. Package authority

Pass. The identity has `read-write` access to existing core and Angular
packages, both remain public, and organization ownership permits first creation
of the still-absent scoped Angular Aria pilot package.

## 4. Target-version absence

Pass. Registry queries returned the expected `E404` for core `0.3.0`, base
Angular `0.3.0` and the complete pilot name/version `0.1.0`. The existing core
and Angular version inventories contain exactly `0.1.0` and `0.2.0`.

## 5. Current tags and maintainers

Pass. Core and Angular both report `next: 0.2.0` and `latest: 0.2.0`; the pilot
package is absent. Both existing packages list only
`ricardrabasso <ricard@rabassoft.com>` as maintainer. No unrelated tag or
package drift was observed.

## 6. Immutable public baseline

Pass. Both public `0.2.0` packages remain `AGPL-3.0-only`, signed, without
repository/provenance metadata. `pnpm test:artifacts` downloaded and proved
their bytes identical to the frozen accepted baseline.

## 7. Selected core candidate

Pass. Local core `0.3.0` remains 213,647 bytes with SHA-512
`933779e7f764353d2a0d452ab3d08c8588d1c445f538b075960af4ab4116903e26d8f625e41a8ad4271e4c50f479a49b0fdd75fdf8531d90b78e26a60abf2181`
and integrity
`sha512-kzd55/dkNT0qDUUqs9CMhYjRxEX1OLB1lgr0q0EWkD4m2PYl5BqK1CceTFD0eaSbD911/fhTHZC3jiamCr8hgQ==`.
Evidence and private `origin/develop` identify source commit
`ce3ef3dd3f9154c95896bcefa22e31b4f293eda0`.

## 8. Neutral command rehearsal

Pass. From a fresh neutral directory, npm `10.9.8` repeated the basename-
relative dry run with public access, `next` and no provenance. The exact command
selected for a separately authorized write is:

```text
npm publish ./rabassoft-schema-engine-0.3.0.tgz --access public --tag next --provenance=false
```

## 9. External boundary and drift

Pass. All completed calls were reads or explicit dry runs. No package,
dist-tag, access setting, provenance, Git tag, GitHub Release or repository
setting changed. Base Angular and pilot selected bytes remain untouched and
their later checkpoints are still gated.

## Outcome

The checkpoint 5 pre-publication gate is satisfied with zero findings. Stop for
immediate explicit approval of only the core publish command above. After any
success, perform the complete unauthenticated core verification and clean
exact/next consumers before checkpoint 6 may be considered.
