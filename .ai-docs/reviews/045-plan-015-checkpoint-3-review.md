# PLAN-015 checkpoint 3 review — Cycles 1–5

- **State:** Checkpoint 3 complete; cycle 5 passed with zero findings
- **Date:** 15 July 2026
- **Scope:** Complete local `0.2.0` release gate, candidates and neutral-path
  rehearsal
- **Authority:** Approved PLAN-015 revision 0 checkpoint 3
- **External boundary:** read-only npm metadata and `--dry-run` only; no commit,
  push, authentication mutation, publication or dist-tag write

## Cycle 1 finding and correction

1. **R045-F001 — checkpoint-document formatting:** the first matrix stopped on
   formatting of review 044. The file was formatted and the complete gate was
   restarted.

## Cycle 2 findings and corrections

1. **R045-F002 — immutable package README timing:** core and Angular tarball
   READMEs described themselves as local/not-live candidates, wording that
   would become false inside immutable published bytes. They now describe
   release content and require registry availability/tags to be verified
   independently.
2. **R045-F003 — generic registry signature evidence:** the target live verifier
   checked bytes, integrity and absent provenance but omitted the required npm
   registry signature. The assertion is now mandatory for each package.
3. **R045-F004 — current-state reconciliation:** STATUS retained checkpoint
   outcomes outside their section and pre-approval wording. It was compacted to
   the actual approved checkpoint 3 state.

The complete gate was restarted after all three corrections.

## Cycle 3 finding and correction

1. **R045-F005 — exact core target in active onboarding:** the release-neutral
   core README reported `0.2.x` but the conditional documentation gate requires
   the exact active manifest target. It now records manifest `0.2.0` without
   claiming registry availability.

The complete gate was restarted again.

## Complete repeated review — Cycle 4

### Authority, versions and migration — Pass

Only completed M14 is delivered. Both manifests are `0.2.0`; Angular packs
`^0.2.0`/`0.2.0`. Required nullable and Angular text migrations are documented,
while exports, entry points, framework peers, dependencies and Experimental
status remain exact.

### Code, declarations, packages and source — Pass

Frozen install, formatting, docs, lint, types, 400 core plus 79 Angular tests,
build, package smoke, repository consumer, artifacts, isolated Corresponding
Source and clean core/lower/upper Angular 22 consumers pass. Declaration and
tar inventories contain only accepted M14/release changes.

### Licensing and security — Pass

Exact AGPL/notices, owned-source headers, third-party inventory, tracked/packed
secret/personal/private-link scans and private-repository/no-provenance metadata
pass. D-043 remains Deferred.

### Registry preflight — Pass

Unauthenticated npm reads return exact-version `E404` for both `0.2.0`
packages. Both public `next` and `latest` tags remain the compatible `0.1.0`
pair. No ownership or reservation claim is inferred from absence.

### Candidate and neutral-path rehearsal — Pass

The ignored pre-commit candidates record Node `22.23.1`, npm `10.9.8`, pnpm
`10.28.2`, base commit `ac7841d`, null source commit, `next` and no provenance:

- core: 200245 bytes, SHA-512
  `155ae047c8ee949bddcaba412fcff90e4b65396a47f89f63e065e7b7814e8a8e0e2851d8e891465d12f69b54fa00192fe5884b163deb292aedec73f9d13e028a`;
- Angular: 93133 bytes, SHA-512
  `aa035adb83c01ae1ffccae2126c78f0095ec4f930547d923b80ba7f0419a39ead58dfe45c35818fde4b884dd31793cec17aa2b8c3963520c24f1891d165a5154`.

Copies under fresh neutral `/tmp/rabassoft-release-0.2.0.*` paths have identical
hashes and both exact basename-relative `npm publish --dry-run --access public
--tag next --provenance=false` rehearsals pass. These dirty-tree candidates are
evidence only; checkpoint 4 must rebuild and select clean-commit bytes.

### Boundary — Pass

No commit, push, login/settings operation, npm publication, dist-tag mutation,
Git tag, GitHub Release, repository visibility change or provenance occurred.

Cycle 4 produced zero technical findings and no unresolved change request.

## Closing state — Cycle 5

**R045-F006 — closing documentation count:** adding the final review link
increased the observed documentation count from
450 to 451 local links. STATUS and the current WORKLOG entry were corrected,
then formatting, all 106 Markdown files, 451 local links, state/index/plan
consistency and diff hygiene were repeated with zero findings. The full cycle 4
technical matrix remains applicable because only observed documentation counts
changed.

Local checkpoints 1–3 are complete with no documentation conflict. Work stops
for explicit checkpoint 4 commit/private-push authorization.
