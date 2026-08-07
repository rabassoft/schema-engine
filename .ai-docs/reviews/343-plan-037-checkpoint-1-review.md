# PLAN-037 checkpoint 1 implementation review — Cycles 1–4

- **Date:** 2026-08-06
- **State:** Complete; checkpoint 1 accepted
- **Reviewed:** PLAN-037 checkpoint 1 and SPEC-021 rows 1 and 3 against
  Accepted ADR-038 revision 0, SPEC-021 v0.1.0, the reviewed dependency graph,
  current workspace boundaries and unchanged M1–M34 behavior
- **Outcome:** Cycles 1–3 found and corrected seven foundation/regression
  defects. Cycle 4 repeated all fourteen areas with zero findings. Checkpoint 1
  is complete; checkpoint 2 may implement rows 5–13 without another dependency
  resolution or Public contract change.

## Review cycles and corrections

| Finding  | Correction                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R343-F01 | Replaced the pre-install-only lock assertions with permanent exact resolved-graph assertions after the separately authorized script-disabled resolution.      |
| R343-F02 | Corrected two lint-invalid literal-space expressions in the resolved optional-peer assertions.                                                                |
| R343-F03 | Corrected an optional-chain narrowing defect in the prior Standard E2E boolean-alignment evidence.                                                            |
| R343-F04 | Corrected the same optional-chain narrowing defect in the prior Angular E2E evidence.                                                                         |
| R343-F05 | Added the React package and shell to the generic private/public-product boundary verifier rather than relying only on the checkpoint-specific manifest audit. |
| R343-F06 | Extended generic source discovery to TSX/JSX and added negative Angular-to-React, React-to-Angular and private-app-to-adapter isolation coverage.             |
| R343-F07 | Repaired the generic boundary fixture's pre-existing missing exact `ajv-formats` declaration and reconciled project/target/import counts.                     |

Each correction triggered a repeat of the complete applicable review. Cycle 4
contains no finding or unresolved change request.

## Frozen dependency result

The owner authorized exactly `pnpm install --ignore-scripts`. It added seven
package records and changed only these importer areas:

| Importer               | Exact result                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| root                   | `@vitejs/plugin-react@6.0.4`, paired with existing Vite `8.1.4`    |
| `packages/react`       | core workspace link; React/DOM `19.2.8`; types `19.2.17`/`19.2.3`  |
| `apps/reference-react` | exact workspace/editor tuple; React/DOM `19.2.8`; exact type tuple |

New records are exactly React, React DOM, Scheduler `0.27.0`, both React type
packages, `csstype@3.2.3` and the Vite React plugin. Existing
`@rolldown/pluginutils@1.0.1`, Vite and editor records are reused. Optional
`@rolldown/plugin-babel` and `babel-plugin-react-compiler` package records are
absent. The lockfile SHA-256 after resolution and the successful frozen restore
is `70684a65a296e50f9ac08496a379ec5457361bc427178b6e15b9e81e235bde88`.

The first frozen restore attempt inside the restricted network could not
recreate `node_modules`; it did not change the lockfile. Repeating the same
`CI=true pnpm install --frozen-lockfile --ignore-scripts` with registry access
restored all 529 frozen packages, skipped resolution and preserved the hash.

## Cycle 4 complete review

| Area                         | Result | Evidence                                                                                                                                        |
| ---------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and rows        | Pass   | Only SPEC-021 rows 1 and 3 are implemented; the root remains deliberately empty and later behavior is not claimed.                              |
| 2. Project identity          | Pass   | Exactly one private `0.0.0` adapter and one private `0.0.0` React shell exist.                                                                  |
| 3. Direct inventory          | Pass   | Every root, package peer/dev and shell runtime/dev entry matches PLAN-037 section 3 exactly.                                                    |
| 4. Resolved graph            | Pass   | Seven expected package records, three importer areas, aligned React/DOM and no optional peer package resolve exactly.                           |
| 5. Lifecycle/license audit   | Pass   | Resolution ran with scripts disabled; reviewed licenses are MIT and package license/notice/source material remains private and non-publishable. |
| 6. Build and externalization | Pass   | The empty adapter emits only its root module/declaration and imports no React/core implementation; package smoke exposes zero partial exports.  |
| 7. Shell foundation          | Pass   | Vite builds the independent placeholder on the reserved project boundary without presenting it as consumer guidance.                            |
| 8. Commands and ports        | Pass   | Four exact root commands, development 4213 and Playwright 4214 are frozen; existing ports are unchanged.                                        |
| 9. Target independence       | Pass   | Generic boundaries now cover four private references, two private product packages, 38 manifest targets and 759 imports, including TSX.         |
| 10. Existing versions        | Pass   | Core `0.4.1`, Angular `0.4.1`, Angular Aria `0.2.1`, package manager and every existing direct source version remain unchanged.                 |
| 11. Type/build regression    | Pass   | Full workspace build and typecheck pass outside the known Angular sandbox restriction; React and Standard builds pass in both contexts.         |
| 12. Unit/package regression  | Pass   | Full workspace unit pass is 90 files/1,235 tests; adapter package smoke and 14 generic boundary tests pass.                                     |
| 13. Documentation/hygiene    | Pass   | Prettier, ESLint, documentation links and diff hygiene pass; persistent state identifies the exact next checkpoint.                             |
| 14. Exclusions               | Pass   | No later React API, renderer, shell experience, public version, release, publication, commit, push or external state is introduced.             |

## Verification

- `pnpm install --ignore-scripts`
- `CI=true pnpm install --frozen-lockfile --ignore-scripts`
- `node scripts/verify-react-foundation.mjs`
- `node --test scripts/reference-boundaries.test.mjs` — 14/14
- `pnpm reference:test:boundaries` — 4 private references, 2 private product
  packages, 3 public packages, 38 manifest targets and 759 imports
- `pnpm lint`
- `pnpm typecheck` outside the known Angular sandbox restriction
- `pnpm test` outside that restriction — 90 files/1,235 tests
- `pnpm --filter @rabassoft/schema-engine-react test:package`
- complete workspace build; Angular 1.24 MB with only the accepted Ajv CommonJS
  warning and Standard with only its accepted chunk advisory
- `pnpm docs:check`, Prettier and `git diff --check`

Checkpoint 1 is accepted with zero findings in cycle 4. Its frozen dependency
authorization covers later unchanged frozen restores only; any dependency,
version, release, publication or Git action remains separately gated.
