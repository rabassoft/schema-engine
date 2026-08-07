# PLAN-037 checkpoint 7 implementation review — Cycles 1–3

- **Date:** 2026-08-07
- **State:** Complete; checkpoint 7 accepted
- **Reviewed:** PLAN-037 checkpoint 7 and SPEC-021 rows 29–30 against Accepted
  ADR-038 revision 0, the complete neutral M1–M34 scenario surface, completed
  checkpoints 1–6 and the independent Angular/Standard reference boundaries
- **Outcome:** Cycles 1–2 found and corrected nine ownership, editor, tabs,
  stale-evidence, collection, styling, build and browser-evidence defects.
  Cycle 3 repeated all sixteen areas with zero findings. Checkpoint 7 is
  complete; checkpoint 8 may add only the root/package/artifact and isolated
  consumer evidence in rows 4 and 31 while repeating row 2.

## Review cycles and corrections

| Finding  | Correction                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R349-F01 | Prevented confirmed pending operations from being appended twice to application-owned history.                                                                                                          |
| R349-F02 | Suppressed CodeMirror change delivery while synchronizing an externally accepted or restored schema draft.                                                                                              |
| R349-F03 | Completed independent tabs with deterministic IDs, `aria-controls`/`aria-labelledby` pairs and Left/Right/Home/End keyboard behavior.                                                                   |
| R349-F04 | Added an application epoch gate so cancelled asynchronous work from an old scenario cannot publish evidence into the replacement scenario.                                                              |
| R349-F05 | Added explicit copy actions for JSON evidence as well as generated integration examples.                                                                                                                |
| R349-F06 | Completed stable collection insert, move and remove controls in the React shell.                                                                                                                        |
| R349-F07 | Corrected checkbox/action layout and the independent light/dark presentation without importing Angular/Standard CSS.                                                                                    |
| R349-F08 | Raised only the private React reference chunk advisory to the already selected 1.5 MB ceiling; the 1.303 MB production bundle now builds without an advisory.                                           |
| R349-F09 | Corrected exact accessible selectors and coverage so the independent Chromium lane exercises primitive, nested, collection, condition, alternative, async, scope, wizard, editor, theme and copy paths. |

Each correction triggered another complete applicable review. Cycle 3 contains
no finding or unresolved change request.

## Cycle 3 complete review

| Area                                  | Result | Evidence                                                                                                                                                    |
| ------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and rows                 | Pass   | Only SPEC-021 rows 29–30 complete; package consumers, release, publication and Git scope remain inactive.                                                   |
| 2. Bootstrap and ownership            | Pass   | `createRoot` under `StrictMode` renders an application-owned controlled session with value, baseline, locale, visibility, operations and wizard decisions.  |
| 3. Public-root boundary               | Pass   | The shell uses Public core/React/validator roots plus the Internal neutral scenario catalog; Angular/Standard implementation and CSS imports are forbidden. |
| 4. Complete catalog                   | Pass   | All eighteen maintained scenarios are selectable and render a ready native React form through the same independent shell.                                   |
| 5. Controlled operations              | Pass   | Immediate and confirmable operations, rejection, reset and baseline confirmation remain application-owned and publish no duplicate history.                 |
| 6. Validation and async service       | Pass   | The fake service is deterministic, explicit and cancellable; epoch gating prevents stale evidence after scenario replacement.                               |
| 7. Wizard and scopes                  | Pass   | Pending/confirm/reject navigation and scoped baseline candidates remain controlled by the shell through facade-only actions.                                |
| 8. Schema editing                     | Pass   | Schema/UI Schema drafts validate, request confirmation, cancel, restore and apply without CodeMirror synchronization feedback.                              |
| 9. Collections and alternatives       | Pass   | Stable insert/move/remove controls and discriminated branch changes exercise the accepted neutral operations.                                               |
| 10. Experience and layout             | Pass   | Independent duplicated CSS provides responsive paired consumer/schema panels, collapsible groups, consistent tabs and light/dark theme.                     |
| 11. Accessibility and keyboard        | Pass   | Collapsibles and tabs expose exact relationships, tab order and arrow/Home/End navigation; controls retain visible labels and semantic roles.               |
| 12. Evidence and copy                 | Pass   | State, operation, wizard, async, schema and integration evidence is deterministic, highlighted and copyable.                                                |
| 13. Real-source snippets              | Pass   | Four marked React regions are generated from real source; the exact three-target inventory contains twelve deterministic snippets.                          |
| 14. Browser and all-scenario evidence | Pass   | Application tests cover all catalog entries and four sequential Chromium journeys cover every representative PLAN-037 path.                                 |
| 15. Build, package and boundaries     | Pass   | React production build, package smoke, exact foundation and 902 import boundaries pass without sharing target source or changing the frozen graph.          |
| 16. Regression and exclusions         | Pass   | Workspace types/tests, lint/format/diff and no-transport/no-submit audits pass without dependency, version, release, publication or Git drift.              |

## Verification

- React reference typecheck, unit suite — 4 files/7 tests — and production
  build — 1,303.48 kB JavaScript, 371.79 kB gzip, below its 1.5 MB ceiling
- independent React Playwright/Chromium lane — 4/4 journeys
- recursive typechecks across all nine applicable workspace projects
- recursive unit matrix — 100 files/1,323 tests
- every package smoke suite
- React dependency build across core, validator, scenarios, adapter and shell
- snippet extractor units — 6/6 — and exact generated inventory — 12 snippets
  across 3 targets
- `node --test scripts/reference-boundaries.test.mjs` — 14/14
- `pnpm reference:test:boundaries` — 4 private references, 2 private product
  packages, 3 public packages, 38 manifest targets and 902 imports
- `node scripts/verify-react-foundation.mjs`
- `pnpm lint`, `pnpm format:check` and `git diff --check`
- unchanged lockfile SHA-256
  `70684a65a296e50f9ac08496a379ec5457361bc427178b6e15b9e81e235bde88`

No checkpoint-7 file imports an Angular/Standard implementation or introduces
shared target CSS, persistence, transport, submit state, dependency, public
version, release, publication, commit, push or external mutation. The runner's
`NO_COLOR`/`FORCE_COLOR` notice is environmental and does not affect the
production build or browser result.

Checkpoint 7 is accepted with zero findings in cycle 3. Checkpoint 8 is active
only for SPEC-021 rows 4 and 31 plus the repeated exact row-2 inventory;
publishability, public version selection, release, publication and Git actions
remain gated.
