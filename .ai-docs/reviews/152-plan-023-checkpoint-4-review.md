# PLAN-023 checkpoint 4 complete review — Cycles 1–3

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 4 — scoped commit, private push and clean rebuild
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5 and reviews 146–151
- **Outcome:** Cycle 3 passed all eight areas with zero findings

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                                 | Correction                                                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| R152-F01 | The detached clean worktree correctly lacked ignored frozen `0.2.0`/M19 baselines, so the complete preparation stopped. | Copied only those immutable reviewed historical inputs into the isolated environment and restarted the full clean preparation. |
| R152-F02 | Active onboarding, release notes and handoff still described checkpoint 3's pre-selection state.                        | Reconciled selected-clean/live truth and extended documentation checks against the stale phrases.                              |

## Cycle 3 — complete zero-finding pass

### 1. Scoped diff and unrelated state

Pass. The reviewed staged diff contained 128 M20/M21 source, reference,
package, release-tooling and documentation files. `git diff --cached --check`
passed. The unrelated `angular.json` CLI analytics opt-out was explicitly
excluded and remains unchanged outside the commit.

### 2. Commit identity and private push

Pass. Commit `07755b4cbe31098f86099db38c65930d52772fb5` was created as
`Rabassoft <ricard@rabassoft.com>` with subject
`feat: add recursive local presentation and prepare 0.4 release`. That exact
commit was pushed to private `origin/develop`; local HEAD and the remote-
tracking ref resolve to the same identity.

### 3. Clean source boundary

Pass. A detached worktree at the exact commit reported a clean tree. Its frozen
offline install reused 520 packages, downloaded zero and ran no lifecycle
scripts. Ignored historical `0.2.0` and M19 baselines were supplied only as
review inputs; no checkpoint-3 M21 artifact entered the clean build.

### 4. Complete clean candidate preparation

Pass. The clean worktree rebuilt every workspace, verified immutable `0.2.0`
and M19 baselines, exact M21 inventories and isolation, reconstructed all three
packages offline from Corresponding Source, audited security/ownership and
passed original plus fresh-neutral-directory dry runs.

### 5. Dirty-tree versus clean byte equality

Pass. Direct buffer comparison retained the exact checkpoint-3 candidates:

| Package                                       | Bytes   | SHA-512                                                                                                                            |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `@rabassoft/schema-engine@0.4.0`              | 218,187 | `b7cf651a4da9e26956f75fdf8e83ee8abba84423202a24cb9d9fc8ed50ee7d6eb1d64136378adc229f24362d3d525d432a630308cff5ba2ced7b2048e2b046da` |
| `@rabassoft/schema-engine-angular@0.4.0`      | 126,564 | `8c63d9726f577522dbfdbf0e79218070b85a4e4024fbe5e5ea6ab84051b8f61c4308d77b59ae18a66e5f4d78e799af8fb45df25447dbb3534ab8a09c7662d6a0` |
| `@rabassoft/schema-engine-angular-aria@0.2.0` | 28,618  | `7456894807d472d174a1168e749a8fc2aadaea4e0b0cbd4d9cf4b1d36a8ed9f0be38502868d8f20b2deb08d430a21fa2c51b0eab8c67b91b096212b0b932995e` |

### 6. Selected evidence and neutral copy

Pass. Ignored evidence records Node `22.23.1`, npm `10.9.8`, pnpm `10.28.2`,
`baseCommit` and `sourceCommit` equal to the exact `07755b4…` identity, exact
basenames, bytes, SHA-512/integrity, `next`, `provenance: false` and
`neutralDryRun: true`. Only these clean files replaced the checkpoint-3
comparison evidence.

### 7. External and Deferred boundaries

Pass. No npm metadata query, authentication, publication, dist-tag, package
setting, Git tag, GitHub Release, visibility or provenance action occurred.
Checkpoint 5 read-only preflight and every later registry write remain
separately gated. D-043 and all inactive targets/capabilities remain Deferred.

### 8. Documentation and repository state

Pass. PLAN-023, release notes, onboarding, STATUS, ROADMAP, Deferred, index and
WORKLOG identify the selected clean candidates and exact next gate.
Documentation, formatting, links and diff checks pass. The private branch
contains the source commit; only the preserved unrelated `angular.json` change
and this checkpoint's intentionally uncommitted closure documentation/check
updates remain dirty.

## Outcome

Checkpoint 4 is complete. The three clean committed candidates above are the
only selected inputs for later publication checks. Checkpoint 5 must stop for
separate authorization before any npm registry read; publication itself then
requires another immediate approval.
