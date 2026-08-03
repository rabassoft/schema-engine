# ADR-034 revision 0 complete review — Cycles 1–3

- **Date:** 2026-08-03
- **State:** Complete; Accepted under the approved no-scope-expansion rule
- **Scope:** ADR-034 controlled homogeneous string-enum array field
- **Authority reviewed:** Review 292 cycle 3; Accepted SPEC-001, SPEC-002,
  SPEC-003 and SPEC-016; Accepted ADR-005, ADR-009, ADR-010, ADR-011, ADR-012,
  ADR-014, ADR-015 and ADR-033; D-006/M31 boundary
- **Outcome:** Cycle 1 found five architecture defects. Cycle 2 passed the
  architecture, acceptance reconciliation made its stored link count stale,
  and cycle 3 repeated all twelve areas with zero findings. ADR-034 revision 0
  is Accepted.

## Cycle 1 — findings and corrections

| Finding                                                                                                                                                  | Correction                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The external-value text classified accessor array indices only as unrepresentable even though passing them to the validator could execute consumer code. | Treat an own accessor index at the managed M31 array path as an atomic option/update failure before validator invocation, with the exact numeric path and no getter execution.   |
| The operation section implied every successfully applied array was detached, including operations constructed directly by consumers.                     | Guarantee copying/freezing only at `requestSetValue()`; both pure helpers retain their input operation value reference and direct callers retain immutable-input responsibility. |
| Manual-definition validation added reused/cyclic choice-object errors not present in ADR-011, even though extra choice properties have no semantics.     | Validate dense choice shape/value/label only and retain ignored extra-property behavior; reuse/cycles through extras are not new errors.                                         |
| Unrepresentable state disabled the native selector while the interaction section still implied the same control remained focusable.                      | Keep the labelled field host and clear action focusable, target focus/blur at the single field and state explicitly that only the selection control is disabled.                 |
| Extending `BaseFieldDefinition` inherited nullable, placeholder, fixed-value and condition capabilities excluded by the selected schema boundary.        | Omit all five inherited capabilities, restore required exact `nullable: false`, and reject own placeholder/fixed/condition members in manual definitions.                        |

After all five corrections, cycle 2 restarted promotion, grammar, model,
presence, operations, runtime, validation, conditions, texts, targets,
migration and delivery/documentation review in full.

## Cycle 2 — acceptance reconciliation finding

The architecture pass had zero findings, but accepting the ADR and linking it
from the index/onboarding increased the documentation inventory. The stored
1,147-link verification became stale. It was corrected to the new checked
inventory, and the complete review was restarted.

## Cycle 3 — complete zero-finding review

| Area                                       | Result | Evidence                                                                                                                                                                |
| ------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Promotion authority and M10 separation  | Pass   | One atomic D-006 field is selected; item templates, identities, addresses, item snapshots and structural operations remain unchanged and excluded.                      |
| 2. Schema/UI and policy gate               | Pass   | The exact outer/items/enum/`uniqueItems: true` grammar and reusable labels are bounded; ADR-005 revision 8 is mandatory before SPEC-017.                                |
| 3. Normalized model and manual definitions | Pass   | One `string-enum-array` leaf reuses immutable choices, fixes `nullable: false`, omits unrelated base capabilities and closes safe manual validation.                    |
| 4. Controlled data and safety              | Pass   | Missing, empty, safe incompatible and assertion-invalid data stay observable; managed accessors block atomically before validation and are never invoked.               |
| 5. Representability and invalid data       | Pass   | Native editing requires a lossless unique in-enum array; invalid controlled data is neither repaired nor converted into a synthetic issue and remains clearable.        |
| 6. Atomic operations and order             | Pass   | Existing set/remove operations, detached runtime intentions, exact expectations, ordered no-op, retained order and schema-ordered appends are deterministic.            |
| 7. Dirty, updates and interaction          | Pass   | Missing differs from empty, dense string arrays compare in order, incompatible values fall back safely, updates stay atomic and field-level focus is exact.             |
| 8. Validation, issues and scopes           | Pass   | Original schema/full value and validator assertion authority remain; numeric issue descendants and ordinary scopes resolve to the single field without item state.      |
| 9. Conditional compatibility               | Pass   | M31 is neither M30 source nor target, carries constant true snapshot flags and does not widen condition literals, evaluation or action gates.                           |
| 10. Texts and accessibility                | Pass   | Ordered choice labels, dedicated missing/empty members, fallback diagnostics, native multiselection, status, clear and keyboard behavior are explicit.                  |
| 11. Angular/Standard and migration         | Pass   | Public Angular rank-30 projection and private independent Standard evidence are bounded; every Public/Internal Experimental delta and later MINOR gate is inventoried.  |
| 12. Exclusions and delivery gates          | Pass   | Wider arrays, targets, frameworks, persistence, dependencies, versions, release, Git and implementation remain inactive; links, docs, formatting and diff hygiene pass. |

## Verification

- `pnpm docs:check` passes 408 Markdown files and 1,152 local links.
- `pnpm format:check` passes the complete repository.
- `git diff --check` passes.
- The scoped M31 change contains no SPEC, plan, source, test, manifest,
  lockfile, dependency, version or external-state mutation.

## Result

Cycle 3 has zero findings and no unresolved change request. Under Ricard's
approved rule allowing acceptance after a complete zero-finding review without
scope expansion, ADR-034 revision 0 is Accepted. Its only immediate effect is
authorization to draft and completely review ADR-005 revision 8; it does not
authorize SPEC-017, a plan, implementation, dependency, version, release,
commit, push or external action.
