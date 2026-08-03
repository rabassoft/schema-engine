# PLAN-030 checkpoint 3 complete review — Cycles 1–3

- **Date:** 2026-08-03
- **Scope:** PLAN-030 checkpoint 3 collection-policy, UI, validator-ownership
  and complete core conformance
- **State:** Complete
- **Outcome:** Cycle 3 passes all fifteen areas and SPEC-014 core rows 1–19
  with zero findings; checkpoint 3 is complete and checkpoint 4 is next

## Cycle 1 finding and correction

| Finding                                                                                                                      | Correction                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A collection identity property classified as an object composition could enter reduction and become a rendered object child. | Give the identity use site precedence: emit only its incompatible-string `allOf` diagnostic, retain reference/template provenance and never inspect branches. |

The finding invalidated cycle 1. After correction, cycle 2 restarted the
complete review.

## Cycle 2 findings and corrections

| Finding                                                                                                                                         | Correction                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependent identity diagnostics were suppressed for an invalid composed item root but not for an array property whose own source was duplicated. | Carry per-property conflict provenance into node traversal and suppress only policy diagnostics that depend on that ambiguous array/item catalog.               |
| A whole-wrapper error flag would also have suppressed identity diagnostics for arrays unaffected by an unrelated duplicate or annotation error. | Separate globally incomplete catalogs from per-property conflicts; retain identity errors for uniquely sourced arrays and all independent unused-policy errors. |

Both findings invalidated cycle 2. After correction, cycle 3 restarted the
complete review.

## Cycle 3 — complete review

Cycle 3 restarted and passed the complete checkpoint review:

1. **Scope and graph — Pass.** Only core compiler/composition implementation,
   focused tests/fixtures and persistent checkpoint documents change; no
   Public symbol/signature, package, dependency, validator port or lock graph
   changes.
2. **One use-site UI — Pass.** Root and nested UI order/metadata address the
   combined catalog once; UI diagnostic paths contain no `allOf` or reference
   provenance.
3. **Contributed arrays — Pass.** Arrays supplied by a branch use their
   existing absolute collection policy and unchanged node/template shape.
4. **Composed item identity — Pass.** Identity presence, requiredness and
   compatible string schema resolve from the effective item catalog before
   existing collection semantics.
5. **Dependent suppression — Pass.** Invalid/ambiguous array or item catalogs
   suppress only their dependent identity diagnostics; unaffected arrays,
   missing policies, policy exterior and unused policies remain observable.
6. **Identity exclusion — Pass.** `allOf` at an identity property emits the
   accepted string incompatibility without inspecting a getter-backed branch.
7. **Original validator input — Pass.** Runtime creation passes the exact
   original composed schema identity and complete value, including unmanaged
   data, to the replaceable validator.
8. **JSON conformance — Pass.** Named valid local-reference/inline composition
   and duplicate-conflict JSON fixtures are exercised by the existing
   conformance runner.
9. **Locations/catalogs — Pass.** Root, nested property, item root, identity,
   reference target and every wrapper/contribution catalog retain their exact
   admitted or rejected behavior.
10. **Ordering/stopping — Pass.** Wrapper/exterior, depth-first branches,
    conflicts, delayed required warnings and UI traversal preserve accepted
    order; no error yields a partial definition.
11. **Paths/provenance — Pass.** Inline, canonical target, data, reference and
    item-template paths remain exact and immutable through collection/UI work.
12. **Depth/hostility — Pass.** Iterative 2,000-level composition, reflection
    containment, accessor avoidance and opaque defaults remain proven.
13. **M1–M27 regression — Pass.** All existing compiler, references,
    collections, presentation, nullable/fixed/format, runtime, operations and
    asynchronous-validation tests pass unchanged when composition is absent.
14. **Atomicity/ownership — Pass.** Definitions remain neutral, application
    value/baseline ownership is unchanged and the schema is never flattened,
    cloned, bundled or dereferenced for validation.
15. **Required evidence — Pass.** Prettier, strict core types/build, all 37
    files and 612 tests, documentation links and diff hygiene pass.

## SPEC-014 core row map

| Row | Named evidence                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | `schema-composition-foundation` locations plus `schema-composition-reduction` root/nested/item/reference success |
| 2   | Foundation primitive/nullable/array checks and conformance identity no-traversal test                            |
| 3   | Foundation hostile exterior and precedence fixtures                                                              |
| 4   | Reduction ordered/deep contribution tests and valid JSON fixture                                                 |
| 5   | Reduction pure-reference, canonical-target, chain and cycle tests                                                |
| 6   | Foundation wrapper siblings plus reduction contribution-catalog diagnostics                                      |
| 7   | Foundation suppression and reduction unsupported contribution/target tests                                       |
| 8   | Reduction property order, duplicate provenance and non-traversed subtree tests                                   |
| 9   | Reduction cross-branch required union and delayed-warning tests                                                  |
| 10  | Reduction UI-first/equal/conflicting text and opaque-default tests                                               |
| 11  | Foundation and reduction exact conflict envelopes plus duplicate JSON fixture                                    |
| 12  | Reduction inline/reference first/current provenance and immutability tests                                       |
| 13  | Reduction raw/reference cycle and acyclic-sharing tests                                                          |
| 14  | Conformance contributed-array, composed-item and selective-policy-suppression tests                              |
| 15  | Conformance root/nested one-use-site UI tests                                                                    |
| 16  | Conformance exact original-schema/complete-value validator test                                                  |
| 17  | Reduction 2,000-level finite iterative test                                                                      |
| 18  | Foundation/reduction hostile input plus frozen copied provenance tests                                           |
| 19  | Foundation independent UI, reduction branch stopping and all failed-result atomicity assertions                  |

Package/declaration consumers remain assigned to checkpoint 4 and shared
reference applications to checkpoint 5. No unresolved finding, contract drift
or authoritative-document conflict remains.

## Result

PLAN-030 checkpoint 3 is complete. Checkpoint 4 — Public package and consumer
invariance — is the exact next action. No dependency, version, release,
publication, commit, push or external action is authorized by this closure.
