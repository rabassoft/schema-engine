# Review 351 — PLAN-037 checkpoint 9

- **Date:** 2026-08-07
- **Scope:** PLAN-037 checkpoint 9; SPEC-021 rows 32–35
- **Outcome:** Accepted after cycle 2 completed with zero findings

## Cycle 1

The complete repository-integration review found one documentation/tooling
consistency defect.

### R351-F01 — Local candidate aliases still selected M21

`audit:m18`, `prepare:release`, the M18 artifact/source aliases and the M18/M20
clean-consumer aliases passed the current `0.4.1` source to historical
`--release=m21` descriptors, which require `0.4.0`. These aliases exercise the
current local candidate and therefore must select M23. Explicit live M21
observation aliases remain historical and unchanged.

Correction: select `--release=m23` in every local candidate alias and add a
release-target regression proving that distinction.

## Cycle 2 — complete repeated review

The complete review was repeated after the correction across all sixteen
applicable areas:

1. accepted SPEC/ADR/plan authority and exact rows 32–35;
2. core, Angular, Angular Aria, validator and scenario regressions;
3. Angular, Standard and React reference unit/type/build suites;
4. every package smoke and root-export boundary;
5. frozen published `0.2.0`, M19 and current M23 artifacts;
6. source reconstruction and declaration parity;
7. general, M18, M20 and React clean consumers;
8. online/offline repeatability from the explicit local pnpm store;
9. sequential Angular, Standard and React Chromium lanes;
10. exact three-target/twelve-snippet extraction;
11. reference and package isolation boundaries;
12. release-target and candidate-tooling fixtures;
13. public repository/workflow policy;
14. public-tree and complete public-history secret/path scanning;
15. formatting, lint, documentation links and diff hygiene; and
16. frozen dependency graph and absence of release/publication/Git drift.

No finding or unresolved change request remains.

## Verification ledger

- Root lockfile SHA-256 remains
  `70684a65a296e50f9ac08496a379ec5457361bc427178b6e15b9e81e235bde88`.
- Recursive unit matrix: 100 files, 1,323 tests.
- Angular/Standard/React Chromium: 20/20, 17/17 and 4/4.
- Reference snippets: exactly 12 snippets across exactly 3 targets.
- Reference boundaries: 907 assertions.
- Release tooling: 42/42 tests.
- Public repository/workflow policy: 24/24 tests.
- Public history: 126 commits and 2,384 path/blob pairs, zero findings.
- Public tree: 1,093 candidate files, zero findings.
- Angular production build: 1.24 MB initial bundle, below the accepted 1.3 MB
  warning and 1.5 MB error budgets; only the known Ajv CommonJS warning.
- Standard production build: 1.101 MB with the known non-blocking Vite chunk
  advisory.
- React production build: 1.303 MB, below the 1.5 MB ceiling.
- `pnpm docs:check`: 483 Markdown files and 1,320 local links.
- Formatting, lint, type checks, package smoke, artifact/source reconstruction,
  consumers, workflow verification, publication fixtures and diff checks pass.

Checkpoint 9 is accepted. No public version, privacy, release, publication,
registry, repository, commit or push action was performed. Checkpoint 10 is the
only active PLAN-037 work.
