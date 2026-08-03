# SPEC-016 complete review — Cycles 1–3

- **Date:** 2026-08-03
- **Document:**
  [SPEC-016 v0.1.0](../specs/016-controlled-conditional-primitive-field-state.md)
- **Scope:** Bounded D-018/M30 controlled conditional primitive-field state
- **Authority reviewed:** Accepted ADR-033 revision 0; all Accepted SPEC-001
  through SPEC-015 baselines; applicable ADR-005, ADR-009, ADR-010, ADR-014,
  ADR-015, ADR-019, ADR-023 and ADR-025; D-018 and review 279
- **Outcome:** Cycles 1–2 found seven contract defects. After correction, cycle
  3 repeated the complete review and all 24 conformance rows with zero
  findings and no unresolved change request.

## Cycle 1 — six findings and corrections

| Finding                                                                                                                                                     | Correction                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The header omitted Accepted baselines whose async validation, scopes and default-candidate behavior the contract explicitly preserves.                      | Listed the complete current Accepted SPEC-001–SPEC-015 baseline.                                                                                       |
| Compiler and manual-definition reason tables contained unescaped union separators and did not render as closed declaration-ready shapes.                    | Replaced both tables with exact discriminated TypeScript shapes and closed literal/source/target unions.                                               |
| Schema-blocked text suppressed source diagnostics but could still derive target-kind/capability errors from a target whose normalized kind was unavailable. | Restricted target/capability diagnosis to safely established definitions; schema-blocked targets retain only independently safe raw-shape diagnostics. |
| The runtime-definition wrapper left its existing `expected` text and several namespaced detail values open.                                                 | Fixed `expected: 'valid collection FormDefinition'`, closed every namespaced value union and named the exact ordinary/template locator families.       |
| Reference evidence promised retention of an unconfirmed edit value even though Accepted controlled reconciliation may reset rejected/incomplete buffers.    | Required renderer/host/buffer object identity while preserving existing confirmed-value reconciliation; no unconfirmed value retention is promised.    |
| The shared scenario wording asked one nullable source to prove null, false, zero and empty-string equality despite their incompatible primitive kinds.      | Required nullable-null plus false/zero/empty-string evidence across separate type-compatible ordinary sources.                                         |

All corrections stayed inside ADR-033 and review 279's accepted architecture.
Cycle 2 restarted every contract area rather than reviewing only the edits.

## Cycle 2 — one finding and correction

| Finding                                                                                                                                                        | Correction                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manual `sourcePath` adopted the hostile dense-path grammar, but its diagnostic details could not distinguish empty length, indexed failure or extra path keys. | Added exact safe expected/length/index/key metadata and one-to-one namespaced runtime-wrapper equivalents; clarified the manual predicate must be an ordinary non-array object. |

Cycle 3 then restarted promotion, grammar, compiler, manual definition,
runtime, target, package and conformance review in full.

## Cycle 3 — complete zero-finding review

| Area                                         | Result | Evidence                                                                                                                                                                                         |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Promotion and Accepted authority          | Pass   | Only review 279's two ordinary primitive equality effects are active; all SPEC-001–SPEC-015 behavior and every wider D-018 boundary remain authoritative/inactive as applicable.                 |
| 2. Public authoring and normalized API       | Pass   | Exactly two root types plus two optional UI/definition members are specified; no evaluator, operator, callback, graph or package is exposed.                                                     |
| 3. Descriptor-safe raw grammar               | Pass   | Condition/member/path/literal inspection closes ownership, enumerability, accessors, density, hostile segments, finite values, unknown keys and copy/no-retention semantics.                     |
| 4. Target/source/literal eligibility         | Pass   | Ordinary direct/nested/ref/composed primitives, fixed visibility, absolute string paths, self/mutual sources and kind/nullability are exact; unsupported locations remain closed.                |
| 5. Compiler phases and atomicity             | Pass   | Existing diagnostics finish first, safe raw defects survive schema blocking, target/link checks require sufficient definitions and any error prevents partial normalization.                     |
| 6. Compiler diagnostics and provenance       | Pass   | One code, eight reasons, closed additions, exact expectations/paths/order, unknown warnings and frozen safe parameters cover every hostile and semantic failure without retaining values.        |
| 7. Normalization and template omission       | Pass   | Compiler predicates/path/fields are detached and frozen; `FieldTemplate` declarations and manual instances cannot activate ordinary conditions.                                                  |
| 8. Manual-definition boundary                | Pass   | Two-phase shape/link validation, five exact reasons, hostile path metadata, direct/template locators and the exact runtime wrapper preserve first-defect and no-callback behavior.               |
| 9. Controlled predicate schedule             | Pass   | Presence plus `Object.is` runs initially and only on accepted new value references; same-reference and non-value updates do not evaluate, and callbacks/graphs are absent.                       |
| 10. Snapshot, sharing and focus              | Pass   | Required visible/enabled flags, fixed/item constants, branch structural sharing and atomic focus clearing without touched/restoration are declaration-ready.                                     |
| 11. Runtime action safety                    | Pass   | Existing target/value/ancestor checks precede hidden then disabled; four direct actions fail before no-effect/mutation with one exact immutable diagnostic and item methods remain unchanged.    |
| 12. Validation, baseline, dirty and scopes   | Pass   | Conditions do not change controlled data, expectations, sync/async validation, issues, baseline candidates, schema-default candidates, dirty or scope semantics.                                 |
| 13. Static presentation and target lifecycle | Pass   | Containers stay static; Angular and Standard independently keep hosts mounted, hide accessibly, disable interaction and reconcile confirmed state without renderer reselection.                  |
| 14. Shared reference evidence                | Pass   | One exact authored scenario can prove typed strict literals, inactive sources, focus, stale actions, mounted identity, unchanged validation/state and zero inactive operations in both targets.  |
| 15. Collections and Deferred boundaries      | Pass   | Collection templates cannot author/evaluate conditions; item flags are constant true and collection identity/operations/layout remain unchanged; compound/item-relative semantics stay Deferred. |
| 16. Public/Internal/package migration        | Pass   | All new/transitive API is Experimental, exact exports/declarations/consumers are required, dependencies/export maps stay fixed and a later coordinated MINOR remains separately gated.           |
| 17. Conformance and delivery gates           | Pass   | All 24 rows cover contract, hostile inputs, runtime, targets, packages and independent Chromium evidence; acceptance authorizes only PLAN-032 preparation/review.                                |

## Cross-authority checks

- SPEC-001/002 keep application-owned immutable current values, presence,
  operation ordering, controlled buffers and ordinary nested traversal.
- SPEC-003/009 collection templates, item addressing, stable identity and
  recursive local presentation remain unchanged beyond required true item
  snapshot flags.
- SPEC-004/014 permit normalized ordinary source/target paths through pure
  local references and disjoint static object composition without retaining
  reference provenance in a predicate.
- SPEC-006/010/011 close null, semantic formats and fixed presentation;
  `enabledWhen` is rejected only for fixed fields while validator assertions
  remain outside literal compatibility.
- SPEC-012/013/015 retain asynchronous validation, scope confirmation and
  explicit default-candidate semantics without condition-triggered work.
- ADR-009 inventory contains two new root types, widened contracts and two
  diagnostic behaviors; ADR-010 keeps dependency/version/release decisions
  outside this gate.

## Decision

Cycle 3 is one complete zero-finding pass. Under the authorized rule for
accepting fully reviewed documents without scope expansion, SPEC-016 v0.1.0 is
Accepted. Acceptance authorizes only preparation and complete review of
PLAN-032; implementation still requires an Approved plan.

## Verification

- Prettier check for the SPEC, review, indexes and current-state documents.
- `pnpm docs:check` after all links and Accepted-version surfaces are updated.
- Targeted search for stale Draft/contract-pending M30 wording.
- `git diff --check` and scoped documentation diff inspection.

No source code, package manifest, lockfile, dependency, version, release,
publication, commit, push or external state changed during this contract gate.
