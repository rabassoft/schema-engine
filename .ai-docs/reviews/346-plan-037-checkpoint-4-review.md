# PLAN-037 checkpoint 4 implementation review — Cycles 1–2

- **Date:** 2026-08-07
- **State:** Complete; checkpoint 4 accepted
- **Reviewed:** PLAN-037 checkpoint 4 and SPEC-021 rows 19–20 against Accepted
  ADR-038 revision 0, SPEC-001/SPEC-006/SPEC-011/SPEC-017 native behavior,
  SPEC-021 v0.1.0, completed checkpoints 1–3 and unchanged M1–M34 behavior
- **Outcome:** Cycle 1 found and corrected seven text-cache, controlled-buffer,
  focus, selection, ancestor-state and fixed-semantics defects. Cycle 2
  repeated all sixteen areas with zero findings. Checkpoint 4 is complete;
  checkpoint 5 may add only compound nodes, presentation and conditions in
  rows 21–25.

## Review cycles and corrections

| Finding  | Correction                                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R346-F01 | Restored exact field-text member/choice/issue invocation order and hostile fallback ordering independently from Angular.                                   |
| R346-F02 | Reconciled primitive buffers when distinct external states share the same displayed token, including empty/null/false/sentinel transitions.                |
| R346-F03 | Added focus-before-intention with failure-independent emission for every native clear/set-null action.                                                     |
| R346-F04 | Restored the confirmed atomic selection immediately after an M31 intention instead of retaining optimistic target state.                                   |
| R346-F05 | Refined committed owner memoization so value-only snapshots rerender props without rerunning unchanged testers/text resolvers or redelivering diagnostics. |
| R346-F06 | Preserved materializable missing-ancestor interaction while disabling incompatible ancestors and suppressing their null intention.                         |
| R346-F07 | Aligned fixed projection with its non-focusable group, snapshot-independent invalid state, safe span content and whitespace-preserving presentation.       |

Each correction triggered another complete applicable review. Cycle 2 contains
no finding or unresolved change request.

## Cycle 2 complete review

| Area                          | Result | Evidence                                                                                                                                  |
| ----------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and rows         | Pass   | Only SPEC-021 rows 19–20 are completed; compound hosts, reference behavior, releases and Git remain inactive.                             |
| 2. Closed native inventory    | Pass   | Exact fixed, enum-array, enum, string, number and boolean IDs/ranks/priorities are Internal and ordered 0–5.                              |
| 3. Resolution and overrides   | Pass   | Own normalized predicates, consumer offset/duplicates and rank/priority/earliest override rules pass atomically.                          |
| 4. String projection          | Pass   | Exact empty/null/external confirmation, format input types, untransformed edits, blur and clear/null actions pass.                        |
| 5. String-enum projection     | Pass   | Named sentinel, empty-string choice, malformed/out-of-range isolation and confirmed blur restoration pass.                                |
| 6. Atomic enum-array          | Pass   | Missing/empty/unrepresentable states, ordered retain/remove/append, immediate confirmed reset and host focus pass.                        |
| 7. Number/integer             | Pass   | Locale display/edit buffers, intermediate rejection, integer filtering, clearing, blur and negative zero pass.                            |
| 8. Boolean projection         | Pass   | Missing/false/null remain distinct and checkbox/set-null/clear intentions preserve controlled ownership.                                  |
| 9. Fixed projection           | Pass   | Missing, unavailable, empty, zero, negative zero, false, null and incompatible states use snapshot data only.                             |
| 10. Controlled interaction    | Pass   | No renderer mutates value; external confirmation resets buffers and hidden/disabled/incompatible owners remain inert.                     |
| 11. Text contract             | Pass   | Exact total frozen snapshot, resolver contexts/order, choice/issue order, non-fixed defaults and safe fallback diagnostics pass.          |
| 12. Cache and delivery        | Pass   | Post-commit owner memos reuse unchanged resolution/text identity; changed resolver/locale/issues reproject and stale work cannot publish. |
| 13. Deterministic identity    | Pass   | Form and owner strings encode every UTF-16 code unit to fixed lowercase hex and use only the closed member suffixes.                      |
| 14. Primitive semantics       | Pass   | Visible labels, descriptions/hints/tooltips/issues/actions plus required/invalid/disabled/hidden associations pass DOM checks.            |
| 15. Package and boundaries    | Pass   | All native components/codecs/IDs remain Internal; root/package inventory is unchanged and no Angular/Standard source or CSS is imported.  |
| 16. Regression and exclusions | Pass   | Workspace tests/types/builds, package smoke, boundaries, docs/format/diff and frozen graph pass with only known advisories/restriction.   |

## Verification

- React typecheck, ESLint, build and package smoke
- React controller/hook/registry/projection/native/text suite — 6 files/74 tests
- recursive typechecks across all nine applicable workspace projects
- recursive unit matrix — 95 files/1,308 tests
- every package smoke suite
- React dependency build across core, validator, scenarios, adapter and shell
- `node --test scripts/reference-boundaries.test.mjs` — 14/14
- `pnpm reference:test:boundaries` — 4 private references, 2 private product
  packages, 3 public packages, 38 manifest targets and 840 imports
- `node scripts/verify-react-foundation.mjs`
- `pnpm lint`, `pnpm format:check`, `pnpm docs:check` and `git diff --check`
- unchanged lockfile SHA-256
  `70684a65a296e50f9ac08496a379ec5457361bc427178b6e15b9e81e235bde88`

The recursive build passed every project except the known restricted-sandbox
Angular CLI abort. Angular's unchanged compiler/type/test paths pass, and the
same exact application build is already documented as passing outside that
restriction. No checkpoint-4 file touches Angular production or application
source; this is not an implementation blocker.

Checkpoint 4 is accepted with zero findings in cycle 2. Checkpoint 5 is active
only for SPEC-021 rows 21–25; reference-shell experience, another dependency,
public version, release, publication and Git actions remain gated.
