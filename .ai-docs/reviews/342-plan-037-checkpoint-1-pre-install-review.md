# PLAN-037 checkpoint 1 pre-install review — Cycles 1–2

- **Date:** 2026-08-06
- **State:** Complete for the local pre-install boundary; dependency execution
  remains pending owner approval
- **Reviewed:** PLAN-037 checkpoint 1 deliverables before dependency or
  `pnpm-lock.yaml` mutation, against Accepted ADR-038 revision 0, SPEC-021
  v0.1.0, current workspace topology and the frozen dependency inventory
- **Outcome:** Cycle 1 found three local-preparation inconsistencies. After
  correction, cycle 2 repeated all ten applicable areas with zero findings.
  The reviewed graph is ready for the separately gated
  `pnpm install --ignore-scripts`; checkpoint 1 is not complete until that
  resolution and its post-install review pass.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R342-F01 | Removed the checkpoint-1 license pointer from the future packed `files` list. It remains local guidance only; checkpoint 8 must replace it with the complete license text and then admit it to the artifact. |
| R342-F02 | Reconciled the root and documentation README summaries from stale Proposed/approval-pending wording to Approved PLAN-037 with only the dependency execution gate pending.                                    |
| R342-F03 | Strengthened the unresolved-foundation assertion to reject both new lockfile importers and the unresolved root `@vitejs/plugin-react` edge; corrected its lint-invalid literal-space expression.             |

Cycle 1 cannot authorize resolution. Cycle 2 restarts the complete applicable
pre-install review after all three corrections.

## Reviewed registry and runtime evidence

Public npm metadata was read without changing the workspace on 2026-08-06.
The execution environment is Node `22.23.1` with pnpm `10.28.2`; the existing
root uses Vite `8.1.4`.

| Package                 | Exact resolution | Dependencies / peers                                                                                                          | License and engine   | Lifecycle observation                                                                                                                            |
| ----------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react`                 | `19.2.8`         | none                                                                                                                          | MIT; Node `>=0.10.0` | no scripts reported                                                                                                                              |
| `react-dom`             | `19.2.8`         | `scheduler@^0.27.0`; peer `react@^19.2.8`                                                                                     | MIT                  | only a non-install `start` script reported                                                                                                       |
| `@types/react`          | `19.2.17`        | `csstype@^3.2.2`                                                                                                              | MIT                  | empty scripts object                                                                                                                             |
| `@types/react-dom`      | `19.2.3`         | peer `@types/react@^19.2.0`                                                                                                   | MIT                  | empty scripts object                                                                                                                             |
| `@vitejs/plugin-react`  | `6.0.4`          | `@rolldown/pluginutils@^1.0.1`; peer `vite@^8.0.0`; optional peers `@rolldown/plugin-babel` and `babel-plugin-react-compiler` | MIT; Node `^20.19.0  |                                                                                                                                                  | >=22.12.0` | development/build/test and `prepublishOnly`; no install hook |
| `scheduler`             | `0.27.0`         | none                                                                                                                          | MIT                  | no scripts reported                                                                                                                              |
| `csstype`               | `3.2.3`          | none                                                                                                                          | MIT                  | development/release scripts include historical `prepublish`; no `preinstall`, `install` or `postinstall` hook, and resolution is script-disabled |
| `@rolldown/pluginutils` | `1.0.1`          | none                                                                                                                          | MIT                  | development/build/test scripts; no install hook                                                                                                  |

`@vitejs/plugin-react`'s Vite and Node constraints match the existing toolchain.
Its two optional peers are neither declared nor expected to resolve. The
existing lock already contains the exact `@rolldown/pluginutils@1.0.1` through
Rolldown, so that package record must be reused rather than duplicated.

Expected new package records are limited to React `19.2.8`, React DOM `19.2.8`,
Scheduler `0.27.0`, both exact React type packages, `csstype@3.2.3` and
`@vitejs/plugin-react@6.0.4`. Existing Vite, CodeMirror/highlight and workspace
records must be reused. No lifecycle script may run because the reviewed
command is explicitly script-disabled.

## Expected importer and peer graph

| Importer               | Permitted change                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| root                   | add only development edge `@vitejs/plugin-react@6.0.4`                                                                |
| `packages/react`       | add exact local development edges for core, React/DOM and types; preserve workspace core plus React/DOM package peers |
| `apps/reference-react` | add only the exact workspace, editor, React/DOM and type edges frozen by PLAN-037 section 3                           |

No existing app/package importer, source-package version, package-manager
version or unrelated dependency may change. React and React DOM must resolve
as one aligned `19.2.8` runtime tuple. The package peers remain core
`workspace:*` and React/DOM `>=19.2.0 <20.0.0`; their future public packed
rewrite is checkpoint-8 scope, not checkpoint 1.

## Cycle 2 complete review

| Area                                   | Result | Evidence                                                                                                                                                                       |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Authority                           | Pass   | Only PLAN-037 checkpoint 1 rows 1 and 3 are prepared; no later Public API or behavior is claimed.                                                                              |
| 2. Project inventory                   | Pass   | Exactly `packages/react` and `apps/reference-react` are added, both private `0.0.0`.                                                                                           |
| 3. Direct dependencies                 | Pass   | Root, adapter peer/dev and shell runtime/dev entries match PLAN-037 section 3 exactly.                                                                                         |
| 4. Expected closure                    | Pass   | Exact peers, transitives, licenses, engines and scripts are reviewed above; no unlisted direct dependency is admitted.                                                         |
| 5. Entry boundaries                    | Pass   | The adapter has one empty root export and the shell only an explicit placeholder; no partial sixteen-export API or maintained shell claim exists.                              |
| 6. Build/test configuration            | Pass   | TS/TSX, Vite, Vitest and Playwright foundations use existing root tooling plus the one approved plugin; adapter build keeps peer imports external by TypeScript emission.      |
| 7. Commands and ports                  | Pass   | All four exact root commands exist; development is 4213 and Playwright is 4214 without changing existing targets.                                                              |
| 8. Packaging/license boundary          | Pass   | The private package carries notice/source/local license guidance but cannot publish; the non-self-contained pointer is excluded from future packed files pending checkpoint 8. |
| 9. Existing graph/version preservation | Pass   | Core `0.4.1`, Angular `0.4.1` and Angular Aria `0.2.1` remain unchanged; the lock has neither new importer nor plugin root edge.                                               |
| 10. Gate and hygiene                   | Pass   | Foundation assertions, Node syntax, scoped ESLint, formatting, docs and diff checks pass; dependency-backed checks remain correctly pending execution approval.                |

Cycle 2 passes all ten applicable pre-install areas with zero findings and no
unresolved change request. This review supports only the exact script-disabled
resolution described above; it does not complete checkpoint 1 or authorize a
different dependency, upgrade, version, release, publication, commit, push or
other external mutation.

## Verification

- `node scripts/verify-react-foundation.mjs`
- `node --check scripts/verify-react-foundation.mjs`
- scoped ESLint for the changed JS/MJS tooling
- Prettier for all checkpoint-1 files
- `pnpm docs:check`
- `git diff --check`
- explicit zero diff and zero React importer/plugin resolution in
  `pnpm-lock.yaml`

Dependency-backed TypeScript, unit, build, package and lock-graph verification
must run only after owner approval and the reviewed
`pnpm install --ignore-scripts` execution.
