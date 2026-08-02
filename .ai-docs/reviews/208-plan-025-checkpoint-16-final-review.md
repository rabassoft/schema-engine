# PLAN-025 checkpoint 16 final review — Cycles 1–4

- **Date:** 2026-07-30
- **State:** Accepted after cycle 4 passed with zero findings
- **Scope:** Complete read-only M23 closure and non-regression matrix
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted checkpoint-15
  [`review 207`](./207-plan-025-checkpoint-15-pilot-token-policy-review.md)
- **Outcome:** PLAN-025 revision 0 and M23 complete

## Cycle 1 findings and corrections

### R208-F01 — Live verifier could not validate selected M23 evidence

The coordinated live verifier assumed the workspace release cache and the
pre-provenance M21 metadata shape. The ignored workspace cache was stale and
the exact protected-main evidence lives in the retained clean generation. The
verifier now accepts an explicit read-only release root and, for M23 only,
requires the exact package repository directory and SLSA provenance metadata.
M19/M21 continue to require historical absence of retroactive provenance.

### R208-F02 — Historical regression was not immutable

The M19 exact regression resolved its upper Angular tuple dynamically. Current
registry publication temporarily produced an internally inconsistent Angular
CLI peer graph. All M19 live scripts now use their frozen accepted tuples.

The checkpoint-16 text also required obsolete M21 moving aliases after the
planned M23 alias transitions. It now correctly preserves M19/M21 through
exact-version byte and consumer regressions, while the complete
exact/`next`/`latest`/unqualified alias matrix belongs to M23.

### R208-F03 — Security audit omitted its active release

`audit:release` invoked the fail-closed security verifier without the required
release descriptor. The command now selects `--release=m23` explicitly.

### R208-F04 — Reviewed benign historical local path

The new full-history policy found one old review blob containing an
owner-specific global pnpm-store path. It contains no credential, token, private
endpoint or secret. Ricard authorized preserving history and adding an
exception limited to the exact blob, document path and `macos-home-path` rule. A
regression test proves that any different object with the same path pattern
still fails.

## Cycle 2 finding and correction

### R208-F05 — Approved wording survived final completion

After persistent-state reconciliation, the complete documentation diff still
contained present-tense narrative claims that PLAN-025 “is Approved.” They
described the historical review-180 gate but conflicted with the new Completed
header. Current documents now use past tense for that gate and name review 208
as the completion evidence.

## Cycle 3 finding and correction

### R208-F06 — Review repeated the private path

The public-tree scanner correctly rejected the cycle-1 evidence because it
repeated the historical owner-specific home path literally. The review now
describes the finding without reproducing that path. The exact exception
remains executable policy and test evidence, not public prose.

## Cycle 4 — Complete zero-finding review

Every checkpoint-16 area passes:

1. All selected and live M23 tarballs are byte-identical, with exact integrity,
   registry signatures, repository directories and SLSA provenance from
   protected `main@028a98c` and run `30377052519`.
2. Exact M19 and M21 bytes retain signatures, historical metadata and absence
   of retroactive provenance. Their frozen lower/current native and pilot
   consumers pass partial compilation, types, unit behavior, production build
   and Chromium.
3. All three packages remain public, retain one exact stage-only trusted
   publisher, disallow bypass-2FA tokens and have no stored release token.
   GitHub Actions, environment and branch protections remain exact.
4. M23 exact, `next`, `latest` and unqualified routes resolve core/base `0.4.1`
   plus pilot `0.2.1`. All eight lower/current native and pilot consumer
   invocations pass.
5. Frozen offline installation, formatting, documentation, workflows, public
   tree/history, lint, types, 689 workspace tests, builds, package/source
   checks, release security, 41 release-tooling tests and 24 public-policy tests
   pass.
6. Eight snippets, 540 import boundaries, 41 shared scenario tests, 26 Angular
   shell tests, 53 Standard shell tests, eight Angular Chromium cases and six
   Standard Chromium cases pass.
7. SPEC-009/M20 behavior, M18 compatibility, declarations, exports, peers and
   package isolation retain their accepted boundaries.
8. Release notes, onboarding, STATUS, ROADMAP, Deferred, plan/review indexes and
   prepend-only WORKLOG agree. No text promotes Stable, wider frameworks,
   another package, Git tag/Release, SLA or unrelated Deferred scope.

Angular's initial-bundle and Ajv CommonJS warnings plus Standard's Vite chunk
advisory remain known non-failing observations.

## Outcome

Cycle 4 is the required complete zero-finding pass. Checkpoint 16,
PLAN-025 revision 0 and M23 are complete. No implementation task or external
action is active. Selecting the next functional capability requires a new
prioritization decision; completion grants no commit, push, Git tag, GitHub
Release, later npm release or backup-deletion authority.
