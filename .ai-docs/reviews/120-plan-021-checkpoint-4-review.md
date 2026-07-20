# PLAN-021 checkpoint 4 complete review — Cycles 1–3

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 4 — scoped commit, private push and clean rebuild
- **Authority:** SPEC-008 v0.1.0, ADR-018 revision 4 and reviews 114–119
- **Outcome:** Cycle 3 passed all eight areas with zero findings

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                          | Correction                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| R120-F01 | The closing dirty-tree description mentioned documentation but omitted its stale-state checker.                  | Identified both checkpoint 4 closure documentation and documentation validation as intentionally uncommitted. |
| R120-F02 | STATUS retained checkpoint 3's `sourceCommit: null`/no-Git statement as current verification after checkpoint 4. | Removed the superseded verification and retained the selected clean-commit evidence as current.               |

## 1. Scoped diff and unrelated state

Pass. The reviewed staged diff contained 99 M18/M19 implementation,
reference, package, release-tooling and documentation files. The unrelated
`angular.json` CLI analytics opt-out was excluded and restored unchanged after
the clean rebuild.

## 2. Commit identity and private push

Pass. Commit `ce3ef3dd3f9154c95896bcefa22e31b4f293eda0` was created as
`Rabassoft <ricard@rabassoft.com>` with subject
`feat: add advanced presentation and prepare 0.3 release`. After switching the
GitHub CLI account to `rabassoft`, that exact commit was pushed to private
`origin/develop`. No tag, release or repository setting changed.

## 3. Clean source boundary

Pass. Only `angular.json` was placed in a reversible stash. The rebuild started
from a completely clean tree whose `HEAD` and `origin/develop` both resolved to
the exact source commit. The unrelated change was restored after verification.

## 4. Complete clean candidate preparation

Pass. `pnpm prepare:release` rebuilt all workspaces, verified the frozen public
`0.2.0` baseline, exact M19 artifact inventories, package isolation, offline
Corresponding Source reconstruction and security boundary, then repeated
original and fresh-neutral-directory dry runs. All checks passed.

## 5. Pre-commit versus clean byte equality

Pass. Direct byte comparison retained the exact checkpoint 3 candidates:

| Package                                       | Bytes   | SHA-512                                                                                                                            |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `@rabassoft/schema-engine@0.3.0`              | 213,647 | `933779e7f764353d2a0d452ab3d08c8588d1c445f538b075960af4ab4116903e26d8f625e41a8ad4271e4c50f479a49b0fdd75fdf8531d90b78e26a60abf2181` |
| `@rabassoft/schema-engine-angular@0.3.0`      | 122,465 | `c5c5b5a5ccf69d97547099a69d8bc2aab294de50713bb4f105114bfc15cf72ba604905d10a01bf47920c5bfecd6bf0885dd6fdd32dcfb36538118837ad88904a` |
| `@rabassoft/schema-engine-angular-aria@0.1.0` | 28,192  | `4a1be718ff06e1297dcfe2f060894c0a609dd1138b4ee1a72ca527c76caaaa0d730e9ebc0c8d8bc1b7894de6a4a945a5dd2313ee4b578b0ddbb67a47b58d54b8` |

## 6. Selected evidence and neutral copy

Pass. Ignored evidence records Node `22.23.1`, npm `10.9.8`, pnpm `10.28.2`,
`baseCommit` and `sourceCommit` equal to `ce3ef3d…`, exact basenames, bytes,
SHA-512/integrity, `next`, no provenance and `neutralDryRun: true`. A second
fresh neutral copy was byte-compared and hash-verified independently.

## 7. External and deferred boundaries

Pass. No npm metadata query, authentication, publication, dist-tag, package
setting, Git tag, GitHub Release, visibility or provenance action occurred.
Checkpoint 5 and all later registry operations remain separately gated. D-043
and all inactive framework/capability work remain Deferred.

## 8. Documentation and repository state

Pass. PLAN-021, release notes, STATUS, ROADMAP, deferred register, index and
WORKLOG identify the selected clean candidates and exact next gate. The private
branch contains the source commit; only the preserved unrelated `angular.json`
change and this checkpoint's uncommitted closure documentation/validation
remain dirty.

## Outcome

Checkpoint 4 is complete. The three clean committed candidates above are the
only selected inputs for later publication checks. Checkpoint 5 must stop for
explicit authorization before any npm registry read; publication itself then
requires its own immediate approval.
