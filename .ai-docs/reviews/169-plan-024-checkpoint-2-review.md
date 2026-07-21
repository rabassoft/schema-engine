# PLAN-024 checkpoint 2 review — Cycles 1–2

- **Date:** 2026-07-22
- **Plan:** Approved
  [`PLAN-024 revision 0`](../plans/024-sanitized-public-repository.md)
- **Checkpoint:** 2 — pinned tools and isolated fixture proof
- **Authority:** Explicit Ricard authorization after completed checkpoint 1
- **Outcome:** Cycle 2 passed the complete checkpoint boundary with zero
  unresolved findings

## Verified acquisition record

| Component          | Official source/ref                                                     | Verified identity                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gitleaks           | `gitleaks/gitleaks` release `v8.30.1`, Darwin arm64 archive             | Published archive SHA-256 `b40ab0ae55c505963e365f271a8d3846efbc170aa17f2607f13df610a9aeb6a5`; extracted binary SHA-256 `ba52fb1bfabbcde42f032afad3d6e0b19dff8ed105229a16e7caa338bbc0e84f`; reports `8.30.1`                             |
| git-filter-repo    | `newren/git-filter-repo` release/tag `v2.47.0`, official GitHub tarball | Downloaded archive SHA-256 `3f231ff12ebef4b7f19c8d8339f9f151b76b861ed97073c2852d9ecae65c4c9d`; extracted script SHA-256 `67447413e273fc76809289111748870b6f6072f08b17efe94863a92d810b7d94f`; embedded version identifier `a40bce548d2c` |
| actions/checkout   | Official release/ref `v7.0.1`                                           | Full commit `3d3c42e5aac5ba805825da76410c181273ba90b1`                                                                                                                                                                                  |
| actions/setup-node | Official release/ref `v7.0.0`                                           | Full commit `820762786026740c76f36085b0efc47a31fe5020`                                                                                                                                                                                  |

Tools and fixture output remained under owner-controlled temporary directories
outside the repository. No downloaded binary, archive, report or replacement
specification is tracked.

## Cycle 1 findings and corrections

| ID       | Finding                                                                                             | Correction                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| R169-F01 | The first synthetic PAT had insufficient entropy for the actual Gitleaks rule and was not found.    | Replaced it with a deterministic high-entropy fake shape that the official default rule detects.                            |
| R169-F02 | The rewrite fixture compared parent object IDs, which must change during rewriting.                 | Compared preserved author/email/date and parent counts, proving topology rather than impossible hash identity.              |
| R169-F03 | The fake PAT initially existed as a contiguous token shape in public fixture source.                | Constructed it only at runtime in the isolated temporary repository; the public candidate tree contains no token shape.     |
| R169-F04 | Initial workflow checks rejected bad pins but did not fail when required actions/commands vanished. | Added exact action counts, complete command presence, one OIDC grant, two frozen installs and exact source-identity guards. |

## Cycle 2 — complete zero-unresolved-finding pass

### 1. Authority and scope

Pass. Only checkpoint-2 tools, fixtures, workflows, tests and persistent state
changed. No runtime/API/SPEC/package metadata/version/dependency or publication
contract changed.

### 2. Tool trust and isolation

Pass. Both tools came from confirmed official immutable release refs. The
published Gitleaks checksum matches; all archives/executables have recorded
SHA-256 identities and remain outside the repository. No credential was passed
to either tool.

### 3. Adversarial fixtures

Pass. Official Gitleaks detects a synthetic secret in reachable history, exits
non-zero and produces a fully redacted report; a clean history exits zero.
git-filter-repo replaces only the selected marker across two commits, preserves
author/email/dates/topology and unrelated content, emits a complete two-commit
map and produces identical rewritten HEADs on two independent runs.

### 4. CI workflow

Pass. CI covers pull requests and pushes to `main`/`develop`, has only
`contents: read`, disables checkout credential persistence, uses exact official
Action commits, performs a frozen lifecycle-free install and runs the complete
self-contained format/docs/lint/types/test/build/package/source/security/
release-tooling/reference matrix. Browser E2E remains an explicit separately
observed lane rather than an unverified hosted claim.

### 5. Prepared npm workflow

Pass. The workflow is manual only, checks exact protected `main` source, binds
`npm-publish`, grants OIDC only to the final job and contains no npm token,
cache or disabled-provenance flag. Readiness executes before build/publication;
the dependency-first `core`/Angular/Angular Aria sequence is unreachable with
current descriptors/manifests.

### 6. Static fail-closed policy

Pass. Twelve focused tests and the standalone verifier enforce triggers,
branches, permissions, exact pins/counts, credential persistence, install mode,
matrix commands, source identity, OIDC count and readiness/publication order.
Hostile mutations for an unpinned Action, CI write authority and publication
before readiness fail.

### 7. Current repository evidence

Pass. Gitleaks default history scan covers 63 commits and approximately 6.13 MB
with no leak. The independent history policy still fails exactly once on the
already classified review-132 local path; the candidate tree has zero findings.
Current npm readiness fails closed on every absent future authorization/
metadata requirement. No secret value is printed.

### 8. Complete local matrix

Pass. Frozen lifecycle-free install, tool fixtures, focused tests, workflow and
candidate-tree guards, expected history/npm fail-closed modes, docs/links,
format, lint, strict types, complete workspace tests/builds, package smoke,
source rebuilds, release tooling, snippets, boundaries, Angular and Standard
reference units and `git diff --check` all pass. Existing Angular bundle/Ajv
and Standard chunk-size warnings remain non-blocking observations.

### 9. External and destructive boundaries

Pass. Network use was limited to the authorized official reads/downloads. No
repository remote was cloned, no Git ref/history was changed, no workflow ran
on GitHub, and no commit, push, visibility/settings/npm/package mutation or
publication occurred.

### 10. Documentation and diff

Pass. PLAN-024, STATUS, ROADMAP, Deferred, indexes and prepend-only WORKLOG
identify checkpoint 2 as complete and retain every later gate. Formatting,
documentation links, stale-state checks, candidate-tree scan and diff checks
pass on the final state.

## Outcome

Checkpoint 2 is complete after the required zero-unresolved-finding pass.
Checkpoint 3 is not authorized: committing these reviewed checkpoint-1/2
changes and pushing `develop` to the still-private origin require explicit
approval after presentation of the final scoped diff, author, subject and
commands.
