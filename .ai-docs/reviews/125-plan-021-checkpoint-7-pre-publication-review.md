# PLAN-021 checkpoint 7 pre-publication review — Cycles 1–5

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 7 — Angular Aria pilot `0.1.0` publication under `next`,
  pre-publication gate
- **Authority:** ADR-018 revision 4 and reviews 114–124
- **Outcome:** Cycle 5 passed all nine pre-publication areas with zero findings

## Cycles 1–4 findings and corrections

| ID       | Finding                                                                                                                           | Correction                                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| R125-F01 | The M19 consumer runner could not express live core/base plus the selected unpublished pilot without treating all packages alike. | Added a fail-closed `--pilot-tarball` override limited to exact/`next` modes, then repeated every native/pilot consumer lane.               |
| R125-F02 | The first neutral npm dry run selected a global cache containing files owned by another user and stopped with `EPERM`.            | Selected a temporary isolated npm cache, repeated the neutral command successfully and retained the global-cache condition as non-blocking. |
| R125-F03 | Cycle 2 ran repository checks from the neutral tarball directory, so they failed and its negative runner test was invalid.        | Separated neutral rehearsal from repository-root checks, exercised the fail-closed assertion correctly and repeated all nine areas.         |
| R125-F04 | STATUS retained the previous checkpoint's `204`-file/`698`-link count after review 125 added one document and two links.          | Updated current verification to `205` files/`700` links and repeated all nine areas without further documentation edits.                    |
| R125-F05 | The review table remained titled as cycle 1 after it gained findings from later correction cycles.                                | Renamed the section to cover cycles 1–4, reconciled every cycle reference and repeated the complete review without documentation changes.   |

## 1. Identity, 2FA and creation authority

Pass. npm `10.9.8` uses exactly `https://registry.npmjs.org/`.
`ricardrabasso` is authenticated, owns the `rabassoft` organization and has
verified email plus `auth-and-writes` 2FA. Existing scoped packages are
read-write; organization ownership supplies authority to create the absent
scoped pilot.

## 2. Live core/base pair

Pass. Unauthenticated exact tarballs for core/base `0.3.0` remain byte-identical
to the selected `ce3ef3d` candidates. Both resolve `next: 0.3.0`; both
established `latest` aliases remain `0.2.0`. Exact integrity, signatures,
metadata and peers remain unchanged.

## 3. Pilot absence

Pass. Public registry metadata returns `E404` for
`@rabassoft/schema-engine-angular-aria`; no version or alias exists before the
write gate.

## 4. Selected pilot identity

Pass. The selected pilot is exactly 28,192 bytes with SHA-512
`4a1be718ff06e1297dcfe2f060894c0a609dd1138b4ee1a72ca527c76caaaa0d730e9ebc0c8d8bc1b7894de6a4a945a5dd2313ee4b578b0ddbb67a47b58d54b8`
and integrity
`sha512-ShvnGP8G4Sl9z+LwYIlMCmCd0ROLTuGnLKUnx2yqqg1zDp68DI2LwbeJTeakqUWl3SMT7ktXiw3btnpHtY1UuA==`.
A fresh workspace pack is byte-identical.

## 5. Manifest, styles, source and security

Pass. The pilot has base peer `^0.3.0`, Angular core `>=22.0.6 <23.0.0`,
Aria/CDK `>=22.0.5 <23.0.0`, `tslib ^2.8.1`, root and opt-in stylesheet
exports, exactly six Public Experimental CSS properties and no repository or
provenance. Exact inventory, isolation, license, offline zero-download source
rebuild, declarations, exports, behavior, secrets and ownership checks pass.

## 6. Lower exact and `next` consumers

Pass. With Angular `22.0.6` and Aria/CDK `22.0.5`, both exact and `next`
resolution install live core/base plus the selected pilot and pass strict
installation, partial compilation, types, unit behavior, production builds and
Chromium for native and pilot lanes.

## 7. Latest-compatible exact and `next` consumers

Pass. The repeated registry-resolved tuple selects Angular `22.0.7` and
Aria/CDK `22.0.5`. Exact and `next` modes pass the same complete native/pilot
evidence and resolve core/base exactly to `0.3.0`.

## 8. Neutral command rehearsal

Pass after R125-F02. From a neutral directory and isolated npm cache, npm
inspected the exact 15-file tarball and accepted only this dry-run command:

```text
npm publish ./rabassoft-schema-engine-angular-aria-0.1.0.tgz --access public --tag next --provenance=false
```

## 9. External and recovery boundary

Pass. All operations were reads or local dry runs. No pilot publication,
dist-tag, access/provenance setting, Git tag, GitHub Release or repository
setting changed. If the separately authorized publish fails, core/base remain
the truthful partial-live `next` pair and the plan stops.

## Outcome

The checkpoint 7 pre-publication gate is satisfied with zero findings. Stop for
immediate explicit approval of only the pilot publish command above. After
success, verify the new package completely before checkpoint 8 observation.
