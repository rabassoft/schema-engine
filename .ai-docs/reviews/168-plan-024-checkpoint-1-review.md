# PLAN-024 checkpoint 1 review — Cycles 1–3

- **Date:** 2026-07-21
- **Plan:** Approved
  [`PLAN-024 revision 0`](../plans/024-sanitized-public-repository.md)
- **Checkpoint:** 1 — local policy and verification preparation
- **Authority:** review 167 cycle 3 and PLAN-024 section 7
- **Outcome:** Cycle 3 passed the complete checkpoint boundary with zero
  unresolved findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                              | Correction                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| R168-F01 | The current-tree scanner used only the index and therefore treated new untracked policies as absent. | Scanned the prospective candidate set: cached plus non-ignored untracked files. |
| R168-F02 | The README policy-link check accepted `FILE.md` but not the equivalent `./FILE.md` form.             | Accepted both repository-relative forms while still requiring all three links.  |
| R168-F03 | A test used `structuredClone`, which was valid in Node but outside the configured ESLint globals.    | Replaced it with a JSON-safe clone of the data-only release descriptor.         |

## Cycle 2 findings and corrections

| ID       | Finding                                                                                                             | Correction                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| R168-F04 | The first complete matrix passed after an environmental esbuild retry, but contract review found no history helper. | Added a tested reachable-blob history scanner with redacted object/path/rule output and a fail-closed current-history expectation. |

The restricted sandbox also reproduced the known Angular/esbuild IPC deadlock.
The same complete matrix was restarted outside that sandbox; this is an
environmental limitation already recorded in STATUS, not a product finding.

## Cycle 3 — complete zero-unresolved-finding pass

### 1. Public policy and onboarding

Pass. `SECURITY.md`, `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` define the
Experimental support, private security-reporting fallback, non-code feedback,
external-code-contribution and conduct boundaries. The root README links them
and reports the private-to-public transition truthfully.

### 2. Current-tree and history guards

Pass. The candidate-tree scanner covers cached and non-ignored untracked files,
requires the public policies and reports only path/rule categories. Its current
run inspected 729 files with zero findings. The independent reachable-history
scanner reports object, path and rule without matching content; it detects
exactly the already classified historical macOS path in review 132 and exits
non-zero, as required before sanitization.

### 3. Workflow readiness guard

Pass. The pure npm readiness evaluator requires an exact 40-character source
commit, trusted-publishing authorization, provenance and exact repository
metadata for every coordinated package. The current M21 descriptor/manifests
fail closed before publication. No workflow, token, package metadata or npm
setting was added.

### 4. Tests and documentation guard

Pass. Eight focused tests cover clean/hostile public content, missing policies,
redacted historical findings and accepted/rejected npm readiness. Documentation
checks require the policy files/links and reject stale private/M21 phrases.

### 5. Scope and external boundary

Pass. No runtime, public API, SPEC, dependency, package version/metadata,
workflow, external tool, history, Git ref, GitHub/npm setting or published
artifact changed. No network read, download, commit or push occurred.

### 6. Complete verification

Pass. `pnpm test:public-repository`, current-tree verification, expected
fail-closed history/readiness verification, docs, formatting, lint, types,
workspace tests/builds, package smoke tests, release tooling, snippets,
boundaries, Angular/Standard reference units and `git diff --check` all pass in
their intended success/failure mode. Angular retains its known bundle/Ajv
warnings; Standard retains its known chunk-size advisory.

## Outcome

Checkpoint 1 is complete after the required full zero-unresolved-finding pass.
PLAN-024 remains in progress overall. Checkpoint 2 is not authorized: official
Gitleaks and `git-filter-repo` acquisition, action-SHA resolution, workflow
creation and all network/tool activity require explicit approval.
