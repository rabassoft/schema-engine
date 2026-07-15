# PLAN-015 checkpoint 1 review — Cycles 1–2

- **State:** Checkpoint 1 complete; cycle 2 passed with zero findings
- **Date:** 15 July 2026
- **Scope:** Version-aware release tooling with manifests retained at `0.1.0`
- **Authority:** Approved PLAN-015 revision 0 checkpoint 1

## Cycle 1 finding and correction

1. **R043-F001 — stale-documentation ownership:** the first tooling pass did
   not implement checkpoint 1's conditional stale active-release checks.
   `docs:check` now requires coordinated package versions and, once manifests
   become `0.2.0`, rejects stale no-successor, active `0.1.x`, no-`latest` and
   provenance claims while preserving immutable historical release notes.

## Complete repeated review — Cycle 2

- Explicit expected-version parsing rejects invalid or mismatched package
  versions and derives packed core peer/dev expectations.
- Candidate preparation/artifact verification are version-aware; Angular
  source reconstruction compares the exact paired package versions.
- Historical live `0.1.0` checks retain exact metadata, bytes and consumers
  without owning mutable tags. Generic candidate/tag verification and exact,
  `next`, `latest` or unqualified clean-consumer modes are available for the
  target release.
- Production behavior, manifests, lockfile, package versions and external
  state remain unchanged.

## Verification

- Formatting, documentation across 102 Markdown files and 449 local links,
  lint, focused tooling tests, build, `0.1.0` artifacts and diff checks pass.
- Historical unauthenticated exact core/Angular bytes and exact-version clean
  core/lower/upper Angular 22 consumers pass; registry tags were not asserted
  by historical mode.

Cycle 2 produced zero findings and no unresolved change request. Checkpoint 2
is next.
