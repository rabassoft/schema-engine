# PLAN-037 checkpoint 8 implementation review — Cycles 1–3

- **Date:** 2026-08-07
- **State:** Complete; checkpoint 8 accepted
- **Reviewed:** PLAN-037 checkpoint 8 and SPEC-021 rows 4 and 31, repeating row
  2, against Accepted ADR-038 revision 0, the frozen checkpoint-1 dependency
  graph, completed checkpoints 2–7 and unchanged Public package/release state
- **Outcome:** Cycles 1–2 found and corrected ten reconstruction, fixture,
  exact-inventory and isolation defects. Cycle 3 repeated all sixteen areas
  with zero findings. Checkpoint 8 is complete; checkpoint 9 may perform only
  the complete regression and repository integration in rows 32–35.

## Review cycles and corrections

| Finding  | Correction                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R350-F01 | Added an exact frozen source-build lock and explicit project-local pnpm store so packed core/React source reconstruction repeats offline after one controlled cache fill. |
| R350-F02 | Corrected clean-consumer result narrowing and projected custom values only through the normalized `presence` contract.                                                    |
| R350-F03 | Installed the Happy DOM globals descriptor-safely under Node 22 instead of assigning over its read-only `navigator`.                                                      |
| R350-F04 | Stabilized validator construction identity so a consumer rerender cannot replace its epoch before the first controlled action.                                            |
| R350-F05 | Asserted the exact twelve-type declaration inventory, rejecting additional as well as missing root type exports.                                                          |
| R350-F06 | Asserted deterministic packed `devDependencies` rewriting as well as peer rewriting and absence of every `workspace:` protocol.                                           |
| R350-F07 | Proved both packed adapter and packed core resolve outside the workspace and their clean lock contains no Angular/Standard dependency.                                    |
| R350-F08 | Asserted exact current `@types/react` and `@types/react-dom` versions in both lower/current consumers.                                                                    |
| R350-F09 | Collected every `export type` block so a later extra declaration block cannot evade the frozen root inventory.                                                            |
| R350-F10 | Limited source preparation cleanup to the five controlled dependency targets instead of deleting an extracted package's complete `node_modules`.                          |

Each correction triggered another complete applicable review. Cycle 3 contains
no finding or unresolved change request.

## Cycle 3 complete review

| Area                              | Result | Evidence                                                                                                                                                        |
| --------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and rows             | Pass   | Only rows 4/31 complete and row 2 repeats; no public version, core range, release, publication or Git action enters the checkpoint.                             |
| 2. Source root inventory          | Pass   | The declaration root contains exactly twelve named type exports and the runtime root exactly four named values.                                                 |
| 3. Internal boundary              | Pass   | Native/bridge/cache/brand/host modules remain non-root Internal files and the one-root export map rejects every package deep path.                              |
| 4. Private package identity       | Pass   | Source and tarball remain private `0.0.0`, ESM, side-effect-free, one-root-only and without `publishConfig`.                                                    |
| 5. Packed inventory               | Pass   | Exact source, dist, license/onboarding and frozen source-build members are asserted; unlisted or missing members fail.                                          |
| 6. Workspace rewriting            | Pass   | Packed peer/development `workspace:*` relationships rewrite deterministically to the local `0.4.1` manifest and contain no workspace protocol.                  |
| 7. No public core claim           | Pass   | README/SOURCE mark that rewrite as private test evidence only; no compatible public core range or React package version is selected.                            |
| 8. Peer and bundle boundary       | Pass   | React/DOM/core remain peers; one emitted module per source module retains external imports and contains no bundled/source Angular/Standard/core implementation. |
| 9. Source reconstruction          | Pass   | Extracted core rebuilds first; React rebuilds only against its reconstructed Public root and exact frozen current React toolchain.                              |
| 10. Rebuilt parity                | Pass   | Complete shipped/rebuilt React declarations and exact four-value runtime inventories are byte/effect equivalent.                                                |
| 11. Lower compatibility           | Pass   | An isolated tarball consumer compiles and runs with aligned React/DOM `19.2.0` and current exact types.                                                         |
| 12. Current compatibility         | Pass   | An isolated tarball consumer compiles and runs with aligned React/DOM `19.2.8` and current exact types.                                                         |
| 13. Public consumer behavior      | Pass   | Both consumers exercise the hook, native form, custom registry, controlled action, declarations and root-only deep-import rejection.                            |
| 14. Isolation and reproducibility | Pass   | Both clean locks have no workspace/Angular/Standard edge, resolve packed core/adapter outside the checkout and repeat fully offline.                            |
| 15. Onboarding and license        | Pass   | README/SOURCE/NOTICE describe Experimental + client-only status, controlled ownership, source rebuild, AGPL/commercial notice and unreleased constraints.       |
| 16. Regression and frozen graph   | Pass   | Workspace types/tests/package smoke, boundaries, lint/format/docs/diff and the root lock hash pass without dependency or package-version drift.                 |

## Verification

- exact React package build, declarations, runtime inventory, deep-import and
  package smoke
- private React tarball inventory, deterministic peer/dev rewriting, emitted
  externalization and extracted core + React source reconstruction, online and
  then offline
- isolated lower React/DOM `19.2.0` clean consumer with exact current types
- isolated current React/DOM `19.2.8` clean consumer with exact current types
- both clean consumers compile and execute hook/native/custom/action/root-only
  behavior entirely from packed artifacts, then repeat offline
- recursive typechecks across all nine applicable workspace projects
- recursive unit matrix — 100 files/1,323 tests
- every package smoke suite
- `node --test scripts/reference-boundaries.test.mjs` — 14/14
- `pnpm reference:test:boundaries` — 4 private references, 2 private product
  packages, 3 public packages, 38 manifest targets and 907 imports
- `node scripts/verify-react-foundation.mjs`
- `pnpm lint`, `pnpm format:check`, `pnpm docs:check` and `git diff --check`
- unchanged root lockfile SHA-256
  `70684a65a296e50f9ac08496a379ec5457361bc427178b6e15b9e81e235bde88`

No package privacy, source/root version, peer declaration, release/publication
tool, registry/repository setting, commit, push or external state changed. The
controlled downloads only populated the ignored project-local pnpm store with
the already frozen verification tuples; the final matrix passes offline.

Checkpoint 8 is accepted with zero findings in cycle 3. Checkpoint 9 is active
only for SPEC-021 rows 32–35 and complete repository regression/integration;
public version selection, release, publication and Git actions remain gated.
