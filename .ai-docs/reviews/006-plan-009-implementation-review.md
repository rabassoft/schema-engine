# M9 PLAN-009 implementation review — Cycles 1–9

- **State:** Final repeated review passed with zero findings; PLAN-009 and M9
  completed
- **Date:** 14 July 2026
- **Reviewed:** complete implementation diff from `14202b5` through `a667bd9`
  plus checkpoint 7 corrections
- **Compared with:** accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2, ADR-005
  revision 1, ADR-007/008/009, ADR-014 revision 2, approved PLAN-009 revision 1
  and the deferred-decision register

## 1. Result

The implementation review converged after eight correction areas. Each
correction was followed by a fresh complete review rather than a fragment-only
check. Cycle 9 reviewed the full authority, scope, production diff, declarations,
tests, packages and persistent state with zero findings or unresolved change
requests.

PLAN-009 satisfies all completion conditions. M9 is complete without activating
arrays, references/composition, advanced layout, custom object-container
renderers, batches, dynamic definitions, async/framework validation,
persistence, submission, publication or Stable API promotion.

## 2. Corrected findings

1. Recovery guidance in `AGENTS.md` and `HANDOFF.md` still prohibited nested
   objects after SPEC-002 acceptance.
2. ROADMAP, the ADR index and ADR-005 still described M9 as inactive or pending
   checkpoint 4.
3. Scenario 1 lacked explicit nested plain-string and number leaves alongside
   enum, integer and boolean evidence.
4. Scenario 2 lacked the zero-leaf object presence/dirty matrix for missing and
   explicitly present empty objects.
5. Scenario 5 lacked class-instance ancestor rejection evidence in operations
   and runtime.
6. Scenario 11 lacked a full-model validation case where a sibling's issues
   change while a third subtree retains snapshot identity.
7. Scenario 12 lacked the complete object/leaf/root/malformed/numeric/unmanaged
   lookup matrix.
8. Recursive Angular projection lacked direct lifecycle evidence for locale
   reprojection without recreation and deterministic descendant destruction on
   runtime replacement and teardown.

All corrections add documentation alignment or missing conformance evidence;
none changes an accepted observable contract or expands scope.

## 3. SPEC-002 scenario evidence

| Scenario                                         | Final evidence                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 1. Multiple depths/current leaves                | Nested compiler definition/order/identity test covers string, enum, number, integer and boolean. |
| 2. Empty/missing/present-empty objects           | Compiler empty-object cases and runtime zero-leaf presence/dirty matrix.                         |
| 3. Materialization/no pruning                    | Deep operation fixtures and programmatic chain materialization/removal tests.                    |
| 4. Terminal stale/concurrent ancestor            | Strict expectation tests plus descriptor/reference-preserving concurrent-branch coverage.        |
| 5. Accessor/array/class/null/primitive ancestors | Programmatic operation/runtime atomic-failure tests with safe diagnostics.                       |
| 6. Descriptors/hostile names/Unicode/IDs         | Descriptor/prototype tests and collision-free simultaneous Angular form IDs.                     |
| 7. Recursive UI precedence/diagnostics           | Structural ordering, incompatibility, accessor and UI-cycle tests.                               |
| 8. Schema cycles/shared/malformed/order          | Active-ancestry cycle, shared schema and deterministic definition-defect tests.                  |
| 9. Issues/scopes/visibility                      | Nested issue assignment, object scope, overlap, forced visibility and reset tests.               |
| 10. Dirty/actions/focus/touched                  | Missing/incompatible actions, structural dirty ownership and focus reconciliation tests.         |
| 11. Cross-field sharing                          | Edited leaf, validation-changed sibling and identity-retained third subtree test.                |
| 12. Node lookup                                  | Unit, package and clean-consumer object/leaf lookup plus invalid-path matrix.                    |
| 13. Angular accessibility/text/blocked renderers | Semantic groups, text failures, locale, native/custom blocking and controlled-operation tests.   |
| 14. Object-host failure isolation                | Creation and required-binding failure tests with sibling continuation and exact diagnostics.     |
| 15. Packages/clean consumers                     | Root declarations/imports, exact tarballs, built consumer and clean core/Angular consumers.      |

## 4. Final verification

- `CI=true pnpm install --frozen-lockfile` passed with the locked dependency
  graph.
- Formatting, lint, typecheck, both builds and `git diff --check` passed.
- All 171 core and 59 Angular tests passed (230 total).
- Package smoke, built consumer and exact private artifact verification passed.
- Clean core and Angular 22.0.6 lower/upper consumers passed against local
  tarballs.
- Root declarations match the accepted Public migration; Angular adds no root
  export and Internal object-host/text symbols remain inaccessible there.
- Manifests, versions, dependencies, peer/export policy, lockfile, publication
  state and Stable classification are unchanged.

## 5. Final decision

The final complete review has zero findings. PLAN-009 revision 1 and M9 are
complete. D-006/M10 remains Deferred pending a separate promotion decision;
D-040 publication remains Deferred.
