# PLAN-037 checkpoint 5 implementation review — Cycles 1–3

- **Date:** 2026-08-07
- **State:** Complete; checkpoint 5 accepted
- **Reviewed:** PLAN-037 checkpoint 5 and SPEC-021 rows 21–25 against Accepted
  ADR-038 revision 0, SPEC-002/SPEC-003/SPEC-005/SPEC-008/SPEC-009/SPEC-016/
  SPEC-019 behavior, completed checkpoints 1–4 and unchanged M1–M34 behavior
- **Outcome:** Cycles 1–2 found and corrected seven lifecycle, stable-buffer,
  text, focus, gate, metadata and accessibility defects. Cycle 3 repeated all
  sixteen areas with zero findings. Checkpoint 5 is complete; checkpoint 6 may
  add only validation, scopes/baseline and controlled-wizard projection in rows
  26–28.

## Review cycles and corrections

| Finding  | Correction                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R347-F01 | Preserved the committed tree during a same-epoch snapshot handoff so layout reconciliation no longer creates an empty commit or destroys owner-local React state.   |
| R347-F02 | Bound item leaves to stable item/template ownership and stable item actions; proved component and native-buffer identity across reorder and stale removal closure.  |
| R347-F03 | Added independent cached object/collection/item/presentation text projection in the exact collection/item invocation and fallback order.                            |
| R347-F04 | Made hidden/disabled owner gates inert without interpreting authored conditions and kept failed renderer gates closed for unchanged boundary identity.              |
| R347-F05 | Reconciled focus before conditional/alternative/removed-owner deactivation and restored removed collection focus to the next, previous or collection legend target. |
| R347-F06 | Removed target metadata from the logical one-column grid fallback and retained only normalized keys plus semantic source order.                                     |
| R347-F07 | Associated invalid collection identity with its semantic group while rendering no ambiguous item subtree.                                                           |

Each correction triggered another complete applicable review. Cycle 3 contains
no finding or unresolved change request.

## Cycle 3 complete review

| Area                           | Result | Evidence                                                                                                                                               |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Authority and rows          | Pass   | Only SPEC-021 rows 21–25 complete; validation/wizard/reference/release/Git scope remains inactive.                                                     |
| 2. Normalized-only boundary    | Pass   | Production consumes definitions/snapshots only and contains no raw schema, condition authoring or dependency-graph interpretation.                     |
| 3. Ordinary objects            | Pass   | Root/nested object trees use normalized path identity, local presentation forests, semantic groups and assigned issues.                                |
| 4. Recursive item objects      | Pass   | Template objects/fields resolve only from current immutable item snapshots and stable item/template owner keys.                                        |
| 5. Collection identity         | Pass   | Stable item keys survive moves; invalid identity exposes no item subtree; positional index is used only for localized action text.                     |
| 6. Collection actions          | Pass   | Item field set/remove and fixed remove/move actions route through stable addresses/anchors; no Add item is synthesized.                                |
| 7. Buffer/state retention      | Pass   | Native drafts, custom component state, tabs and accordions survive same-owner snapshots and stable item reorder.                                       |
| 8. Removal and stale ownership | Pass   | Removed owners deactivate callbacks and release local state; collection focus restores by stable identity and controlled order.                        |
| 9. Discriminated alternatives  | Pass   | Only snapshot-active children mount; inactive branches release target state/focus and reactivation creates a fresh target instance over retained data. |
| 10. Sections and logical grids | Pass   | Fixed Internal semantic hosts preserve source order; the grid uses the safe one-column fallback and exposes no Public CSS/metadata contract.           |
| 11. Tabs                       | Pass   | Tablist/tab/tabpanel semantics, wrap/Home/End follow-focus, hidden/inert panels, one-time mounts and retained selection pass.                          |
| 12. Accordions                 | Pass   | Native disclosure buttons, expanded state, hidden/inert retained panels and focus-before-collapse pass.                                                |
| 13. Conditions                 | Pass   | React consumes only `visible`/`enabled`; hidden/disabled controls are inert, focused state reconciles and local state remains mounted.                 |
| 14. Text and accessibility     | Pass   | Cached object/collection/item/presentation order, fallback, labels, descriptions, issues, identity alert and deterministic IDs pass.                   |
| 15. Package and boundaries     | Pass   | Compound hosts/text remain Internal; root/package inventory and frozen graph are unchanged with no Angular/Standard/CSS import.                        |
| 16. Regression and exclusions  | Pass   | Workspace types/tests, package/build/boundary checks, docs/format/diff and no-D-025 audit pass without version, release or Git drift.                  |

## Verification

- React typecheck, ESLint, build and package smoke
- React controller/hook/registry/projection/native/compound/text suite — 7
  files/79 tests
- recursive typechecks across all nine applicable workspace projects
- recursive unit matrix — 96 files/1,313 tests
- every package smoke suite
- React dependency build across core, validator, scenarios, adapter and shell
- `node --test scripts/reference-boundaries.test.mjs` — 14/14
- `pnpm reference:test:boundaries` — 4 private references, 2 private product
  packages, 3 public packages, 38 manifest targets and 855 imports
- `node scripts/verify-react-foundation.mjs`
- `pnpm lint`, `pnpm format:check`, `pnpm docs:check` and `git diff --check`
- unchanged lockfile SHA-256
  `70684a65a296e50f9ac08496a379ec5457361bc427178b6e15b9e81e235bde88`

No checkpoint-5 file changes core, Angular or Standard production behavior.
Their complete unit/type regressions pass. No D-025 presentation-container SPI,
Public CSS/theme contract, dependency, version, release, publication, commit,
push or external action enters the checkpoint.

Checkpoint 5 is accepted with zero findings in cycle 3. Checkpoint 6 is active
only for SPEC-021 rows 26–28; the independent React reference shell, another
dependency, public version, release, publication and Git actions remain gated.
