# ADR-033 revision 0 complete review — Cycles 1–2

- **Date:** 2026-08-03
- **State:** Complete; Accepted under the approved no-scope-expansion rule
- **Scope:** ADR-033 controlled conditional primitive-field state
- **Authority reviewed:** Review 279 cycle 2; Accepted SPEC-001, SPEC-002,
  SPEC-003, SPEC-006, SPEC-008 and SPEC-009; Accepted ADR-009, ADR-010,
  ADR-014, ADR-015, ADR-019, ADR-023 and ADR-025; D-018/M30 boundary
- **Outcome:** Cycle 1 found three architecture ambiguities. After correction,
  cycle 2 repeated all twelve areas with zero findings. ADR-033 revision 0 is
  Accepted and authorizes only SPEC-016 preparation/review.

## Cycle 1 — findings and corrections

| Finding                                                                                                                                                           | Correction                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semantic source linking could report a cascading `source-not-ordinary-field` when an unrelated blocking schema defect prevented construction of the field index.  | Run semantic source/literal checks only with one complete valid ordinary-field index; preserve independently safe raw condition-shape diagnostics otherwise.         |
| Manual-definition text allowed a target condition to link against a later field before the complete definition shape was known valid.                             | Split manual validation into complete shape/detachment first and ordered target/source/capability linking only after every ordinary field is structurally valid.     |
| `enabledWhen` on an ADR-028 fixed-presentation field had no neutral interaction to enable and would leave target-specific styling as its only observable meaning. | Admit `visibleWhen` for fixed fields but reject `enabledWhen` with exact compiler/manual target-incompatible reasons; fixed snapshots always expose `enabled: true`. |

After all three corrections, cycle 2 restarted scope, grammar, normalization,
compiler, runtime, snapshots, actions, validation/layout, targets,
collections, migration and delivery/documentation review in full.

## Cycle 2 — complete zero-finding review

| Area                                       | Result | Evidence                                                                                                                                                                                  |
| ------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Promotion authority and scope           | Pass   | The ADR implements only review 279's ordinary primitive equality slice and preserves every expression/graph/template/validation/workflow exclusion.                                       |
| 2. Raw grammar and descriptor safety       | Pass   | Two optional UI members use one copied ordinary-object/path/literal grammar; accessors, sparse paths, unsafe values, unknown members and exact absolute string paths are closed.          |
| 3. Target/source and literal compatibility | Pass   | Ordinary direct/nested/ref/composed primitive targets and sources are exact; fixed enabled, objects, arrays, templates/items and assertion-level literal checks are explicitly separated. |
| 4. Normalization and manual definitions    | Pass   | Raw/normalized objects are distinct/frozen, `FieldTemplate` omits conditions, and two-phase manual validation prevents accessors, forward-link cascades and template activation.          |
| 5. Compiler diagnostics and atomicity      | Pass   | One closed error family, eight reasons, fixed-member incompatibility, schema-blocked stopping, ordered link phase, immutable provenance and no partial definition are defined.            |
| 6. Controlled runtime evaluation           | Pass   | Presence plus `Object.is`, missing/blocked false, raw external value authority, linear evaluation and immutable update identity remove the need for callbacks or a graph.                 |
| 7. Snapshots, sharing and focus            | Pass   | Required booleans, fixed/item constant defaults, branch-level structural sharing and atomic focus clearing without touched/restoration are exact.                                         |
| 8. Runtime action safety                   | Pass   | Existing checks retain precedence; hidden then disabled blocks direct set/remove/focus/blur before no-effect/operation with one exact immutable diagnostic.                               |
| 9. Validation, scope and layout fidelity   | Pass   | Hidden/disabled never changes schema/value/baseline/dirty/validity/issues/scopes/required/presentation identity or target-local container state.                                          |
| 10. Angular/Standard behavior              | Pass   | Mounted hidden lifecycle, disabled accessibility, native/custom safety, no renderer reselection and one shared authored scenario are required through independent target implementations. |
| 11. Collections and wider D-018            | Pass   | Templates cannot author/evaluate conditions; item snapshots carry only true defaults and stable identity/routing remain exact; compound/item-relative semantics stay Deferred.            |
| 12. Public migration and delivery gates    | Pass   | Two new core symbols and every transitive change are inventoried as Experimental; future MINOR evidence is separated from SPEC/plan/code/dependency/version/release/Git/external actions. |

## Verification

- ADR/review links and index inclusion pass `pnpm docs:check`.
- Complete repository formatting and `git diff --check` pass.
- The scoped documentation diff contains no SPEC, plan, code, manifest,
  lockfile, dependency, version or external-state change.

## Result

Cycle 2 has zero findings and no unresolved change request. Under Ricard's
approved rule allowing acceptance after a complete zero-finding review without
scope expansion, ADR-033 revision 0 is Accepted. Its only immediate effect is
authorization to draft and completely review SPEC-016; no observable contract,
plan, implementation, package/version, release, commit, push or external action
is authorized.
