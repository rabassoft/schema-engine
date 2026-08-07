# PLAN-036 checkpoint 5 complete review — Cycles 1–2

- **Date:** 2026-08-04
- **Plan:** PLAN-036 revision 0, checkpoint 5
- **Authority:** Accepted ADR-037 revision 0 and SPEC-020 v0.1.0
- **Owned row:** 23 only
- **Source scope:** declarations, package/built/clean/source consumers and
  current-source migration guidance
- **Outcome:** Cycle 1 found four package-evidence/documentation defects. After
  correction, cycle 2 repeated the complete checkpoint with zero findings.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R335-F01 | Added the internal Angular `wizard` source/output files to the exact package-candidate inventory while preserving their rejection from the root export map.              |
| R335-F02 | Replaced prose-only migration guidance with a concrete exhaustive root-presentation/text-context example plus typed runtime action and optional wizard-snapshot readers. |
| R335-F03 | Reconciled the ADR index, ROADMAP and Deferred register, which still reported checkpoint 2 or 4 as active.                                                               |
| R335-F04 | Reconciled root/internal onboarding and current-state wording so checkpoint 5 is complete and checkpoint 6 is the sole active task.                                      |

Cycle 1 cannot support completion. Cycle 2 restarts every checkpoint area after
the corrections.

## Cycle 2 complete review

| Area                          | Result | Evidence                                                                                                                                                                                                    |
| ----------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority/scope            | Pass   | Changes implement SPEC-020 row 23 only; no runtime behavior, target architecture, dependency, version, release or Git scope was added.                                                                      |
| 2. Exact declarations         | Pass   | All eighteen M34 Public Experimental types occur exactly once at the core root; only the Accepted root-presentation, state/update/snapshot/text/runtime surfaces are widened.                               |
| 3. Runtime/export boundary    | Pass   | Core retains its exact six runtime exports; Angular exposes only the Accepted directive actions/output and no wizard host/factory or new entry point.                                                       |
| 4. Core package smoke         | Pass   | The built package compiles a two-step wizard, subscribes to a frozen intention, confirms selection and reads the resulting snapshot through the public root.                                                |
| 5. Angular package smoke      | Pass   | The built Angular package exposes all five directive methods and rejects all four internal wizard host/factory classes from its public root.                                                                |
| 6. Built Angular consumer     | Pass   | Three built-package tests pass, including native wizard projection, typed next action, application confirmation, snapshot selection and retained step visibility.                                           |
| 7. Strict clean consumers     | Pass   | Isolated core plus Angular 22.0.6 and resolved stable 22.1.0 consumers compile authored/manual M34 declarations with strict templates, `skipLibCheck: false` and no credential inheritance.                 |
| 8. Exhaustive/manual use      | Pass   | Clean consumers exhaustively narrow all six root presentation kinds, construct normalized/manual wizard definitions and consume exact action, intention, snapshot and text-context types.                   |
| 9. Deep-import rejection      | Pass   | Isolated core and Angular consumers prove package-internal `dist`/wizard paths remain unavailable through export maps.                                                                                      |
| 10. Source reconstruction     | Pass   | Frozen isolated source rebuilds reproduce byte-equal declarations and equivalent shipped/rebuilt compiled plus manually reconstructed wizard runtime behavior.                                              |
| 11. Candidate/frozen matrix   | Pass   | M23 core/base candidates include licensed wizard Corresponding Source; frozen Angular 22.0.6 and 22.0.7 native/pilot lanes pass partial compilation, strict typecheck, unit, production build and Chromium. |
| 12. Migration guidance        | Pass   | Core, Angular and root onboarding describe exhaustive root/text readers, application-confirmed actions, optional snapshots and the separately gated future MINOR without implying release.                  |
| 13. Workspace/boundaries/docs | Pass   | All 88 workspace files and 1,233 tests, lint, type/build, 745 boundaries, formatting and documentation checks pass.                                                                                         |
| 14. Hygiene/frozen graph      | Pass   | Package manifests, dependencies, export maps, lockfile and versions have no diff; package names remain `0.4.1`, formatting and `git diff --check` pass.                                                     |

## Owned-row evidence

| Row                                                    | Result | Evidence                                                                                                                                                                                                                                           |
| ------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 23. Declarations, package/built/clean/source consumers | Pass   | Exact declarations/exports, package smoke/candidates, built Angular behavior, strict lower/latest consumers, exhaustive/manual use, deep-import rejection, isolated reconstruction and migration guidance all pass without graph or version drift. |

Rows 1–22 remain frozen by reviews 331–334. Row 24 remains uniquely owned by
checkpoint 6.

## Verification

- Workspace: 88 files and 1,233 tests passed; core 54/877, scenarios 2/78,
  validator 1/15, Angular 19/151, Angular reference 4/34, Standard 7/76 and
  Angular Aria 1/2.
- Core/Angular package smoke and built Angular consumer 3/3: pass.
- Strict isolated core/Angular consumers: Angular 22.0.6 and resolved stable
  22.1.0 pass; deep imports are rejected.
- Frozen M23 native/pilot consumers: lower 22.0.6 and latest 22.0.7 pass
  partial/typecheck/unit/build/Chromium in all four lanes.
- Isolated source reconstruction and M23 package-candidate inventory: pass.
- Complete workspace build/typecheck passes outside the known restricted
  esbuild limitation. Angular is 1.24 MB under the authorized 1.3 MB warning
  and 1.5 MB error budgets with only the known Ajv CommonJS warning; Standard
  retains its known chunk advisory.
- `pnpm lint`, 745 boundaries, `pnpm format:check`, `pnpm docs:check` and
  `git diff --check`: pass.
- No package manifest, dependency, export map, lockfile or version diff.

## Result

Cycle 2 has zero findings and no unresolved change request. PLAN-036 checkpoint
5 and SPEC-020 row 23 are complete. Checkpoint 6 may begin under the approved
autonomous sequence. No dependency, version, release, publication, commit,
push or other external mutation is authorized.
