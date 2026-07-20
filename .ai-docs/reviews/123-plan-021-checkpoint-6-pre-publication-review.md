# PLAN-021 checkpoint 6 pre-publication review — Cycles 1–3

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 6 — base Angular `0.3.0` publication under `next`,
  pre-publication gate
- **Authority:** ADR-018 revision 4 and reviews 114–122
- **Outcome:** Cycle 3 passed all eight pre-publication areas with zero findings

## Cycles 1–2 findings and corrections

The first isolated offline source rebuild selected the incomplete default pnpm
store and failed before compilation because TypeScript was not cached there.
The review repeated from the beginning with the already validated local store;
all packages were reused with zero downloads. No source or candidate correction
was required.

Cycle 2 found that the new stale checkpoint 5 phrase check also matched the
truthful checkpoint 6 publish gate. The pattern was narrowed to the complete
checkpoint 5 state before repeating the whole review.

## 1. Live dependency and registry state

Pass. Public core reports exact/`next` `0.3.0` with unchanged
`latest: 0.2.0`. Base Angular still contains only `0.1.0`/`0.2.0`, both tags
remain `0.2.0`, target `0.3.0` is absent and the pilot package remains absent.

## 2. Selected base identity and bytes

Pass. The selected tarball is exactly 122,465 bytes with SHA-512
`c5c5b5a5ccf69d97547099a69d8bc2aab294de50713bb4f105114bfc15cf72ba604905d10a01bf47920c5bfecd6bf0885dd6fdd32dcfb36538118837ad88904a`
and integrity
`sha512-xcW1pcz2nZdUcJmmnYvCqrKU3lBxO7TxBRFL/BXPcrpgSQXRCgG/R5IMW/7Na/CIXdb90y3Ps2U4EYg3rYiQSg==`.
Evidence identifies source commit
`ce3ef3dd3f9154c95896bcefa22e31b4f293eda0`.

## 3. Manifest and peer boundary

Pass. The packed manifest has exact name/version, `tslib ^2.8.1`, core peer
`^0.3.0`, aligned Angular core/forms peers `>=22.0.6 <23.0.0`, public `next`,
no provenance and no repository metadata. No pilot/Aria/CDK dependency, peer,
style or asset is present.

## 4. Licensing and Corresponding Source

Pass. LICENSE, NOTICE, README, SOURCE, preferred TypeScript, declarations and
the frozen source-build harness are present. Isolated core/base reconstruction
passed offline with zero downloads and reproduced declarations, exports and
behavior.

## 5. Lower native consumer

Pass. A clean consumer installs public core `0.3.0` plus the selected base
candidate with aligned Angular `22.0.6`, then passes strict peer installation,
partial compilation, strict types and execution.

## 6. Latest-compatible native consumer

Pass. The same clean lane resolves current stable Angular `22.0.7`, verifies
all Angular packages aligned and non-deprecated, then passes compilation and
execution against live core plus selected base.

## 7. Neutral command rehearsal

Pass. npm `10.9.8` repeated the fresh neutral basename-relative dry run with
the inspected 114-file tarball. The only separately approvable write is:

```text
npm publish ./rabassoft-schema-engine-angular-0.3.0.tgz --access public --tag next --provenance=false
```

## 8. External boundary and recovery

Pass. No registry write or tag/access/provenance mutation occurred. Core
remains the verified partial-live dependency; the selected base and pilot bytes
are unchanged. Any base publication failure must preserve core and stop.

## Outcome

The checkpoint 6 pre-publication gate is satisfied with zero findings. Stop for
immediate explicit approval of only the base Angular publish command above.
After success, verify base completely and repeat exact/`next` native consumers
before checkpoint 7 may be considered.
