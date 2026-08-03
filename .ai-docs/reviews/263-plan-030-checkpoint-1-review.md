# PLAN-030 checkpoint 1 complete review — Cycles 1–4

- **Date:** 2026-08-03
- **Scope:** PLAN-030 checkpoint 1 wrapper-classification and descriptor-safe
  object-`allOf` exterior foundation
- **State:** Complete
- **Outcome:** Cycle 4 passes all eleven areas with zero findings; checkpoint 1
  is complete and checkpoint 2 is the exact next action

## Cycle 1 findings and corrections

| Finding                                                                                                                                              | Correction                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Nested object properties inside collection item templates use a separate compiler traversal and were not entering composition-foundation inspection. | Integrate the same property wrapper gate in the item-template traversal and preserve absolute `dataPath` plus relative `templatePath`. |
| Reflection traps raised by the new composition inspection could escape instead of becoming an accepted input failure.                                | Contain the new reflection boundary as `INVALID_COMPILER_INPUT` without retaining or exposing the thrown value.                        |

Both findings invalidated cycle 1. After correction, cycle 2 restarted the
complete review.

## Cycle 2 finding and correction

| Finding                                                                                                       | Correction                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A direct property or item object containing both `$ref` and `allOf` still entered reference resolution first. | Inspect direct wrappers before reference resolution so `$ref` is diagnosed once as a composition sibling. |

This precedence finding invalidated cycle 2. After correction, cycle 3
restarted the complete review.

## Cycle 3 finding and correction

| Finding                                                                                                             | Correction                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| The same `$ref`/`allOf` precedence was not preserved when the competing members occurred inside a reference target. | Stop reference chaining when a reached target owns `allOf`, then let composition classify the target and retain only the outer reference chain. |

This reference-target finding invalidated cycle 3. After correction, cycle 4
restarted the complete review.

## Cycle 4 — complete review

Cycle 4 restarted and passed the complete checkpoint review:

1. **Scope and preservation — Pass.** Only the compiler, one new Internal
   module and focused tests implement checkpoint 1; prior dirty M25–M27 changes
   remain intact and `contracts.ts` needs no M28 change.
2. **Wrapper locations — Pass.** Root, root/nested property, collection item
   root, item-template property and local-reference target failures enter the
   same bounded foundation.
3. **Classification precedence — Pass.** Optional/exact object type, malformed
   attempted wrapper and accepted primitive/nullable/array positions are
   distinguished before branch inspection.
4. **Wrapper members — Pass.** Type is first; semantic siblings, ignored
   annotations, unknowns and unsupported keywords preserve exact catalogs,
   paths, parameters and no-value traversal.
5. **Exterior — Pass.** Descriptor/value, positive safe length, dense own
   enumerable object indices and first extra key follow exact first-failure
   precedence without iterators, accessors, coercion or callbacks.
6. **Branches — Pass.** Unsupported branch kinds use the new exact code,
   fallback and local index in ascending depth-first order; valid reduction
   remains explicitly assigned to checkpoint 2.
7. **Outside-object behavior — Pass.** Primitive, nullable primitive, array and
   identity positions emit only the accepted incompatible-`allOf` envelope and
   never read its value.
8. **References and templates — Pass.** Direct and reached `$ref`/`allOf`
   competition favors composition, while source paths, outer chains and item
   template paths remain exact.
9. **Hostile safety — Pass.** Accessors are never executed; new reflection
   traps are contained as non-retaining compiler-input failure; deep nested
   exterior traversal is iterative.
10. **Stopping and atomicity — Pass.** Exterior failures stop dependent
    branches, independent UI inspection continues and no error returns a
    partial definition. Otherwise-valid composition remains blocked by the
    pre-M28 path until checkpoint 2 supplies successful reduction.
11. **Regression and evidence — Pass.** All 35 core files and 587 tests pass;
    build, typecheck, Prettier, documentation and diff hygiene also pass.

Documentation checks cover 371 Markdown files and 1,083 local links after this
review is indexed. No unresolved change request, contract drift or
authoritative-document conflict remains.

## Result

PLAN-030 checkpoint 1 is complete. Checkpoint 2 — ordered contribution
reduction and provenance — is the exact next action. No package, dependency,
version, release, publication, commit, push or external action is authorized by
this closure.
