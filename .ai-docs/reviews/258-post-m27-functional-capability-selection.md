# Post-M27 functional-capability selection review — Cycles 1–2

- **Date:** 2026-08-03
- **State:** Recommendation complete; Ricard selected it on 2026-08-03
- **Scope:** Remaining Deferred functional candidates after completed M27
- **Authority reviewed:** Accepted SPEC-001 v0.1.15 and SPEC-004 v0.1.1;
  Accepted ADR-005 revision 6 and ADR-016; completed PLAN-029; D-007, D-011,
  D-012, D-013, D-018, D-021, D-024, D-030, D-031, D-039 and D-045
- **Outcome:** Cycle 1 found four stale completed-M27 summaries; after their
  correction, cycle 2 passes with zero findings and recommends only a bounded
  static `allOf` object-composition design question. The later selection
  follow-up promotes only M28 architecture design; no Public contract or
  implementation is active

## Correction and complete-review restart

| Finding  | Correction                                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| R258-F01 | Replace the ADR index's pre-SPEC/pre-implementation ADR-030 summary with accepted SPEC-013 and completed PLAN-029 state.                             |
| R258-F02 | Replace the onboarding and SPEC index's stale PLAN-029 authorization wording with completed revision 1/final-review state.                           |
| R258-F03 | Replace ADR-030's onboarding description, which incorrectly repeated ADR-029 async lifecycle ownership, with pure baseline-candidate semantics.      |
| R258-F04 | Rewrite ROADMAP M27's historical “Immediate gate” labels as completed architecture and contract/implementation gates without changing the milestone. |

After all four corrections, cycle 2 restarted the complete candidate,
authority, documentation, link, format and diff review rather than checking
only the edited summaries.

## 1. Candidate comparison

| Candidate                                  | Readiness                                                                                                                                                           | Consumer value                                                                                      | Boundary risk                                                                                                             | Outcome                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| D-007 static object `allOf`                | Its explicit Draft 2020-12 and Internal resolved-cursor prerequisites are implemented; inline objects, nested objects, collections and local references are stable. | High: reusable object fragments can contribute one effective form shape without schema duplication. | High, but bounded design can close conjunction, provenance and normalization before any observable contract is drafted.   | Recommended for bounded M28 design. |
| D-039 explicit defaults                    | Presence is stable, but no concrete entity-creation consumer or accepted raw/resolved/normalized initialization input exists.                                       | High for entity creation.                                                                           | High because recursive application can silently create domain data, especially through arrays, references or composition. | Remains Deferred.                   |
| D-031 additional issue visibility          | Technically small, but no consumer currently requires `dirty`, `submit-attempted` or a custom policy.                                                               | Medium-low.                                                                                         | Low implementation risk, but it adds policy surface without product evidence.                                             | Remains Deferred.                   |
| D-013 dynamic definitions                  | The reference editors currently recreate runtimes; no accepted hot-schema reconciliation consumer exists.                                                           | Medium.                                                                                             | Very high across focus, touched, scopes, operations, collections and async generations.                                   | Remains Deferred.                   |
| D-021 batches/transactions                 | Deep and collection operations exist, but no accepted multi-field command or undo/redo use case exists.                                                             | Medium.                                                                                             | High if atomicity, diagnostics and history semantics are chosen without a consumer.                                       | Remains Deferred.                   |
| D-011/D-012/D-018 workflow and expressions | Static recursive layouts and application-defined scopes exist, but no concrete wizard, declarative-scope or expression use case is selected.                        | High for workflow-heavy products.                                                                   | Very high because these alternatives move application authority and require an evaluation/dependency model.               | Remains Deferred.                   |
| D-024 Angular validation bridge            | Neutral synchronous and asynchronous ports are stable, but no concrete Angular validator/context mapping is requested.                                              | Target-specific.                                                                                    | High risk of importing `AbstractControl` or `FieldContext` semantics into the neutral model.                              | Remains Deferred.                   |
| D-030 advanced localization                | Semantic date/string formats satisfy only part of its historical prerequisite; no currency, unit, calendar or parser case is selected.                              | Medium.                                                                                             | High if parsing, display and domain value semantics are combined.                                                         | Remains Deferred.                   |
| D-045 legacy Angular families              | The neutral catalog exists, but no exact target major, enterprise consumer or maintenance horizon is selected.                                                      | Strategically high, not one neutral runtime capability.                                             | Broad multi-toolchain and package-family cost.                                                                            | Remains Deferred.                   |

## 2. Recommended bounded M28 question

If Ricard accepts this recommendation, M28 may design support for the Draft
2020-12 `allOf` applicator only where every selected branch contributes to one
statically derivable object definition. The design must preserve the exact
original schema for external validation and keep normalized definitions as the
only renderer input.

The architecture review must decide, without implementing it:

1. the exact eligible root, nested-object, collection-item and resolved-target
   locations and the branch/schema shape admitted by the first slice;
2. whether the existing Internal resolved-cursor layer can represent ordered
   conjunction branches without becoming a Public AST or generic evaluator;
3. how properties, `required`, constraints and annotations produce one
   normalized definition, including repeated compatible members and
   incompatible intersections;
4. deterministic descriptor-safe traversal, depth, cycle, diagnostic ordering,
   `documentPath`, `dataPath` and reference-chain provenance;
5. UI Schema precedence at the managed use site without declarative scopes,
   conditions or branch-owned UI; and
6. unchanged validator, runtime, operation, renderer, package, dependency and
   application-ownership boundaries.

## 3. Explicit exclusions

The recommendation does not activate `anyOf`, `oneOf`, `not`, `if`/`then`/
`else`, `dependentSchemas`, unevaluated semantics, `$ref` siblings, external or
dynamic references, vocabularies, recursive data definitions, dynamic
`FormDefinition` replacement, defaults, expressions, declarative scopes, a
Public resolved model, a new package/dependency, version, release or
publication.

## 4. Gate result

D-007's documented restart condition is now satisfied: ADR-005 fixes Draft
2020-12 and completed D-041/ADR-016/SPEC-004 supplies an implemented Internal
same-document resolution boundary. Unlike D-039, D-031, D-013, D-021 and the
workflow candidates, this slice does not require inventing an absent consumer
trigger. It also closes a common schema-authoring limitation while retaining a
design-first gate for its material semantic risk.

Cycle 2 repeats capability demand, Deferred triggers, Accepted dialect and
resolution authority, application ownership, normalized-renderer boundaries,
validator fidelity, diagnostics, framework neutrality, package/dependency
scope and explicit exclusions with zero findings and no unresolved change
request.

At the end of cycle 2 this review was a recommendation only: until selection,
D-007 remained Deferred, M28 did not exist and the next global ADR identifier
was not reserved. Selection would promote only this bounded D-007 design
question and authorize drafting and completely reviewing ADR-031. It would not
authorize a SPEC, plan, code, dependency, version, Git or external action.

## Selection follow-up

Ricard accepted the recommendation on 2026-08-03. The selection does not
change the cycle-2 comparison or expand its boundary: it promotes only the
bounded D-007 question as M28 architecture design and reserves ADR-031 for that
design. It does not accept ADR-031 or authorize ADR-005 revision 7, a SPEC,
plan, observable contract, implementation, dependency, version, release, Git
or external action.
