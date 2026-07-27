# R189-F01 deterministic-gzip correction review — Cycles 1–3

- **Date:** 2026-07-27
- **State:** Accepted local correction after cycle 3 passed with zero findings
- **Scope:** Platform-independent gzip generation, regressions, package/source
  isolation, rights and local release boundary
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Finding source:**
  [`review 189`](./189-plan-025-checkpoint-8-staged-byte-review.md)
- **Outcome:** Local correction is ready for separately authorized protected
  delivery; all three existing stages remain unapproved and unrejected

## Correction

Candidate preparation still delegates TAR creation to `pnpm pack`, then
decompresses only the gzip wrapper and recompresses the unchanged TAR with
`fflate@0.8.3`, compression level 9 and `mtime=0`. The pure-JavaScript
implementation emits the same gzip stream independently of host zlib and fixes
the gzip OS byte to `3`.

`fflate@0.8.3` is pinned exactly as a root development dependency and is MIT
licensed. It is not a runtime dependency, is not copied into public package
source and is absent from all three package tarballs.

## Cycle 1

The implementation, package, source, rights, behavior and policy checks passed.
The documentation check found one inaccurate recorded link count: the local
review evidence said 923 links while the complete check observed 924. The
count was corrected and the entire review was restarted.

## Cycle 2

The complete matrix passed, but its public-tree check observed 764 candidate
files after adding this review while the evidence record still said 763. The
record was corrected and the entire review was restarted again.

## Cycle 3 — zero findings

1. **Regression:** simulated macOS/Linux gzip wrappers with different
   compression levels normalize to identical bytes, preserve payload, use
   zero modification time and OS byte `3`, and normalize idempotently.
2. **Real candidates:** two complete temporary M23 generations are
   byte-identical for core, base Angular and Angular Aria.
3. **Protected TAR preservation:** normalized copies of all three previously
   selected protected-main candidates equal newly generated local candidates
   byte-for-byte. No TAR member or uncompressed byte changes.
4. **Comparison evidence:** canonical local sizes/SHA-512 are core
   `217599`/`7a2f641f…fb6592`, base Angular
   `127734`/`016138d7…24f961a` and Angular Aria
   `29281`/`6f3607c4…288856`.
5. **Contracts:** no runtime, declaration, export, manifest, peer, framework,
   diagnostic, source or public API contract changes.
6. **Dependency and rights:** exact `fflate@0.8.3` resolves with MIT license;
   frozen offline installation passes, and package/source/security checks prove
   development-only isolation.
7. **Build and behavior:** complete build and typecheck pass. All 689 workspace
   tests, package smoke checks and isolated Corresponding Source rebuilds pass.
8. **Policy:** formatting, documentation, lint, 41 release-tooling tests, 23
   public/readiness/workflow tests, 764-file public-tree policy, workflow
   policy and diff checks pass.
9. **Known advisories:** Angular's 989.78 kB initial-bundle and Ajv CommonJS
   warnings plus Standard's 868.50 kB chunk advisory are unchanged and do not
   affect release tooling.
10. **Boundary:** `.release/0.4.1` selected evidence was not overwritten. No
    stage was approved or rejected; no commit, push, PR, workflow dispatch,
    publication, alias, token or settings mutation occurred.

The correction has one complete review pass with zero findings. It does not
complete checkpoint 8: protected delivery, clean rebuild/reselection, rejection
of each obsolete stage and replacement staging retain their explicit gates.
