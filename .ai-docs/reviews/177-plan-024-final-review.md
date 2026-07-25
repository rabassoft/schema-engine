# PLAN-024 final public-repository closure review — Cycles 1–3

- **Date:** 2026-07-22
- **Plan:** Completed
  [`PLAN-024 revision 0`](../plans/024-sanitized-public-repository.md)
- **Checkpoint:** 9 — final public-repository closure
- **Authority:** Ricard explicitly authorized checkpoint 9's external read-only
  review
- **Outcome:** Cycle 3 passed the complete corrected closure boundary with zero
  unresolved findings; protected PRs #9–#11 subsequently published, promoted
  and reconciled this exact record with successful required and post-merge CI

## Public lineage, content and recovery

- A fresh credential-free HTTPS clone observed only protected public `main` at
  `9da5c8b1163c70f53db3cfef637a365ef5842d34` and `develop` at
  `46c982d2793645e58ea69a230beff9b759feff7d`, with identical tree
  `8a90fef01bd34e1d5f68b836340824298cefb617`; `main` is an ancestor of
  `develop` and no tag exists.
- Strict Git integrity passes. The exact public ref union contains 79 commits,
  1,037 trees and 1,834 blobs. Public-tree policy passes 744 candidate files;
  reachable-history policy passes 79 commits and 1,862 path/blob pairs.
- Pinned Gitleaks v8.30.1 scans approximately 6.37 MB with no leak. Independent
  path, credential, generated-file, endpoint, personal-data, binary, largest-
  blob, rights and public-boundary checks report zero unresolved findings.
- The 65-entry history map contains 65 unique accessible sanitized commits and
  five changed IDs. M19's mapped source remains unchanged; M21's public mapped
  source remains reachable.
- The retained recovery directory/bundle remain owner-only `0700`/`0600`.
  `git bundle verify` passes and SHA-256 remains
  `5815447d5f19edddaa4988ae8be1cc0c12d767bbc1e0d80f28952374ae3c1b4e`.
  The reversible local stash remains outside public refs.
- Git history contains `Rabassoft` and lowercase `rabassoft` display variants
  only; all 79 commits use the same intended `ricard@rabassoft.com` identity.

## Public access and GitHub controls

- Unauthenticated API, raw HTTP and Git expose the public repository, default
  `main`, exact protected branches, README, AGPL license, SECURITY,
  CONTRIBUTING and Code of Conduct.
- Active ruleset `19534784` covers only `main`/`develop`, has no bypass and
  enforces deletion/non-fast-forward protection, PR/conversation resolution and
  strict required `verify` from Actions integration `15368`.
- Workflow defaults are read-only and cannot approve PRs. Actions is limited to
  exact full-SHA checkout/setup-node identities and SHA pinning is required.
- Protected environment `npm-publish` remains `18549660922`, requires reviewer
  `rabassoft`, allows self-review, admits only `main` and has zero secrets and
  variables. Repository Actions also has zero secrets and variables.
- Private Vulnerability Reporting and Issues remain enabled; Discussions and
  rebase merge remain disabled. Merge/squash and automatic short-lived branch
  deletion remain enabled. No GitHub Release or Git tag exists.
- Required/post-merge runs `29944719950`, `29945120630`, `29945516913`,
  `29945887957`, `29946262537` and `29946524390` all remain successful.

## npm isolation and immutable package evidence

- M19 exact core/base `0.3.0` and pilot `0.1.0` remain byte-identical to their
  recorded candidates. M21 exact core/base `0.4.0` and pilot `0.2.0` remain
  byte-identical and all three resolve identically through `next`, `latest` and
  unqualified installation.
- Every inspected version remains public AGPL-3.0-only under maintainer
  `ricardrabasso`, with unchanged integrity and no `repository`, `homepage`,
  `bugs`, provenance or attestation claim.
- The current descriptor/manifests fail closed before publication on the exact
  fifteen expected authorization/source/repository/provenance findings. No npm
  credential is stored in the repository, GitHub repository or protected
  environment, and no package, alias, access or npm setting was mutated.
- M19's historical `next`/`latest` commands are intentionally not current-state
  evidence because those aliases now select M21. M19 is verified exactly;
  M21 owns the complete current alias matrix.

## Complete verification matrix

- A frozen lifecycle-free install from the anonymous clone uses Node 22.23.1
  and pnpm 10.28.2. Formatting, 267-document/879-link checks, workflow policy,
  Gitleaks, tree/history policy, publication fixtures, 12 repository/workflow
  tests, 24 release-tooling tests, lint, strict types, all workspace builds and
  689 workspace/unit tests pass.
- The final closure candidate, including this review, separately passes 268
  Markdown documents, 881 local links and 745 current public-tree candidates
  with zero findings.
- Package smoke, isolated source rebuilds, eight snippets and 540 import
  boundaries pass. Angular and Standard reference unit lanes pass.
- Independent Chromium lanes pass 8/8 Angular and 6/6 Standard tests. M19 exact
  lower/registry-coherent consumers and M21 exact/`next`/`latest`/unqualified
  lower/latest-compatible native/pilot consumers pass compilation, strict
  types, DOM tests, production builds and Chromium.
- The ignored Playwright cache was linked only inside the disposable clone
  after the first attempt correctly found no clone-local browser binary. No
  cache, trace, report or generated output enters the candidate tree.
- Existing Angular 989.78 kB/Ajv CommonJS and Standard 868.50 kB warnings remain
  observations, not failures.

## Cycle 1 findings and corrections

| ID       | Finding                                                                                            | Correction                                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| R177-F01 | Root onboarding combined a public-repository statement with an obsolete claim that it was private. | Reconcile current onboarding and add a documentation regression for the exact obsolete phrase.                                          |
| R177-F02 | Registry-backed Angular discovery assumed every Angular package published a patch atomically.      | Select the highest stable non-deprecated patch common to the complete Angular tuple; add a staggered `22.0.8`/`22.0.7` regression test. |
| R177-F03 | Initial E2E execution had no browser inside the disposable clone.                                  | Link only the existing ignored verified workspace cache into that clone and repeat both complete Chromium suites successfully.          |
| R177-F04 | Initial map/tool invocations omitted safe parsing or required pinned-tool environment paths.       | Repeat the 65-entry parser without shell interpolation and rerun fixtures with both exact verified binaries.                            |

## Cycle 2 findings and corrections

| ID       | Finding                                                                                                                              | Correction                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| R177-F05 | The closing matrix invoked the nonexistent `test:workflows` alias instead of the repository's real command.                          | Repeat the complete applicable pass with `verify:workflows` and the exact pinned-tool environment required by publication fixtures.        |
| R177-F06 | Angular E2E retained the second collection element position as Beta's identity, so reordering could retarget the assertion to Alpha. | Locate Beta by its exact normalized item identity; five sequential focused repetitions pass before restarting both complete browser lanes. |

The intentionally parallel focused diagnostic was discarded: concurrent local
servers are outside the serial project command and produced startup contention.
It is not completion evidence.

## Cycle 3 — complete zero-finding pass

Cycle 3 repeats authority/scope, public history/content/recovery, anonymous
access, GitHub controls/CI, npm isolation/immutability, guarded workflow,
complete workspace/package/source/reference/browser matrix, documentation,
formatting and diff review with zero unresolved findings.

No commit, branch, push, PR, merge, package, tag, release, registry setting or
GitHub setting was changed by checkpoint 9 review. PLAN-024/M22 completion
became canonical when this exact reviewed record passed protected PR #9 into
`develop@049160e8`, PR #10 into
`main@7f22dbd03680f1195c5309427b5002bf447aace4` and PR #11 back into
`develop@d4d44d43fcba4692baa0fdef6026793f4f93122f`. Required and post-merge
runs `30145579253`, `30146726717`, `30147039530`, `30147280131`,
`30147475634` and `30147686444` all passed. The final branch trees are
identical and `main` is an ancestor of `develop`. Backup deletion and future
package metadata/OIDC release work remain separately gated.
