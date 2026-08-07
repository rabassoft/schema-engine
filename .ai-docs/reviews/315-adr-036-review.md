# ADR-036 complete review — Cycles 1–2

- **Date:** 2026-08-03
- **Document:**
  [ADR-036 revision 0](../adrs/036-controlled-discriminated-object-alternatives.md)
- **Scope:** Architecture selected by review 314 cycle 2 only
- **Authority reviewed:** Accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2,
  SPEC-004 v0.1.1, SPEC-011 v0.1.0, SPEC-014 v0.1.0 and SPEC-015 v0.1.0;
  Accepted ADR-005 revision 8, ADR-009, ADR-010, ADR-014 revision 2,
  ADR-016, ADR-028, ADR-031, ADR-032, ADR-033 and ADR-035; current D-007,
  D-013, D-014 and D-018 boundaries
- **Outcome:** Cycle 1 found two cross-capability ambiguities. After
  correction, cycle 2 repeats all fifteen areas with zero findings and no
  unresolved change request. ADR-036 revision 0 may be accepted under the
  authorized zero-finding rule.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R315-F01 | Add SPEC-015/ADR-032 authority and keep `deriveSchemaDefaultCandidate()` blocked at the exact M33 `oneOf` boundary, including deterministic existing diagnostics and no branch traversal. |
| R315-F02 | Distinguish excluded owner-level presentation/conditional fields from supported static presentation on ordinary nested descendants; reject every condition source/target in the union.    |

Cycle 1 cannot support acceptance. After both corrections, cycle 2 restarts
the complete location, grammar, normalization, runtime, validation, UI,
cross-capability, migration, exclusion and follow-up review.

## Cycle 2 complete review

| Area                         | Result | Evidence                                                                                                                                              |
| ---------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Promotion authority       | Pass   | Implements only review 314's selected nested ordinary object-property question; root, collections, arrays and general alternatives remain excluded.   |
| 2. Outer grammar             | Pass   | Exact object/properties/required/oneOf catalog, non-array descendants and incompatible semantic siblings are closed.                                  |
| 3. Discriminator proof       | Pass   | Exactly one required scalar string enum maps bijectively to at least two required typed string const branch assertions.                               |
| 4. Branch grammar            | Pass   | Ordinary or pure local-reference branches, exact semantic catalog, branch-local discriminator shape and requiredness are deterministic.               |
| 5. Disjoint union            | Pass   | Common and per-alternative direct names are globally disjoint; union/alternative orders and required ownership are exact.                             |
| 6. References and safety     | Pass   | Descriptor-safe exterior, finite local chains, source/use-site provenance and raw/reference cycle domains retain Accepted behavior.                   |
| 7. UI and texts              | Pass   | One union UI Schema, filtered stable order, discriminator choice labels and owner/descendant presentation distinction prevent branch-owned UI.        |
| 8. Public definitions        | Pass   | New kind, static unique union children, alternative name projections, complete static fields and widened object text context are closed.              |
| 9. Runtime selection         | Pass   | Current controlled value alone selects active/none; snapshots expose common plus active children without mutation or inference.                       |
| 10. State lifecycle          | Pass   | Dormant data, baseline/dirty, retained touched, focus clearing, subscriptions and structural sharing have deterministic ownership.                    |
| 11. Operations and scopes    | Pass   | Inactive intentions/application are blocked, stale selection races close, structural utility remains neutral and inactive scope paths are recognized. |
| 12. Validation and defaults  | Pass   | Original schema/issues remain authoritative; inactive issues map to owner and M29 explicitly stops before alternative default traversal.              |
| 13. Manual/target evidence   | Pass   | Manual union invariants and independent neutral Angular/Standard projection are complete without raw-schema target logic.                             |
| 14. Migration and delivery   | Pass   | Public Experimental unions widen under a future coordinated MINOR; packages, dependencies, versions and releases remain unchanged.                    |
| 15. Exclusions and next gate | Pass   | M29/M30/M32 boundaries, all Deferred capabilities and the ADR-005-only follow-up gate are explicit.                                                   |

## Contract audit

The proposed five new Public types and all widened unions are named. Existing
ordinary definition object literals remain valid, while exhaustive readers are
explicitly required to narrow the new Experimental branch. No operation or
validator signature changes, and no target receives raw schema or evaluates
selection.

The static `FormDefinition.fields` versus active
`FormRuntimeSnapshot.fields` distinction is intentional and fully reconciled
with lookup, scopes, inactive operations, touched retention and issue mapping.
No duplicate path or reused owned node is introduced.

## Result

Cycle 2 repeats every required ADR section and all fifteen review areas with
zero findings. ADR-036 revision 0 is internally consistent with its Accepted
authorities and may be formally accepted. Acceptance authorizes only
preparation and complete review of ADR-005 revision 9; it does not authorize a
SPEC, plan, implementation, dependency, version, release, publication, Git or
external action.

## Acceptance follow-up

ADR-036 revision 0 is Accepted on 3 August 2026 under the authorized
zero-finding rule. Acceptance changes no review finding or boundary and
authorizes only preparation and complete review of ADR-005 revision 9.
