# SPEC-017 v0.1.0 complete review — Cycles 1–2

- **Date:** 2026-08-03
- **State:** Complete; Accepted under the approved no-scope-expansion rule
- **Scope:** Bounded M31 controlled string-enum array field contract
- **Authority reviewed:** Review 292 cycle 3; Accepted ADR-034 revision 0,
  ADR-005 revision 8, SPEC-001, SPEC-002, SPEC-003 and SPEC-016
- **Outcome:** Cycle 1 found six contract/documentation defects. After
  correction, cycle 2 repeated all nine areas and 26 conformance rows with zero
  findings; SPEC-017 v0.1.0 is Accepted.

## Cycle 1 — findings and corrections

| Finding                                                                                                                                                | Correction                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| The `FieldTextMember` excerpt used a placeholder alias and was not declaration-ready.                                                                  | Replace it with the complete exact existing union plus the two M31 members.                                                            |
| Ordered array no-op was assigned to schema-neutral `applyOperation()`, which cannot prove the target is M31 and would change unmanaged array behavior. | Limit ordered no-op to runtime requests and definition-aware `applyFormOperation()`; preserve schema-neutral reference semantics.      |
| Non-M31 Angular texts bypassed the resolver, contradicting ADR-034's required total resolved snapshot.                                                 | Resolve both new members for every field, while only M31 projects them and all failures use fixed-source fallback.                     |
| Incompatible array intentions exposed only the outer safe type and could not identify sparse, accessor or non-string indices deterministically.        | Add closed M31 reason/index/actualType parameters to the existing operation-value diagnostic, using the first failing ascending index. |
| The initial Angular class snippet used an invalid declaration-only TypeScript body and implied constructor/binding API.                                | Specify only the exported Public class symbol and keep constructor/Internal bindings outside Public API.                               |
| The mandatory documentation index did not report the new Draft SPEC.                                                                                   | Add SPEC-017 as Draft 0.1.0 without implying acceptance, plan or implementation authority.                                             |

After all six corrections, cycle 2 restarted authority, authoring, Public
contracts, diagnostics, controlled runtime, targets, migration, exclusions and
the entire 26-row matrix.

## Cycle 2 — complete zero-finding review

| Area                                   | Result | Evidence                                                                                                                                                  |
| -------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and scope                 | Pass   | The SPEC replaces only the exact primitive-array exclusion authorized by ADR-034/ADR-005r8 and preserves every wider D-006/non-goal gate.                 |
| 2. Authoring and compiler              | Pass   | Schema/UI grammar, M10 family compatibility, required unique/enum, catalogs, paths, provenance, ordering and branch stopping are exact.                   |
| 3. Public model and manual definitions | Pass   | The declaration-ready leaf/union, immutable choices, omitted capabilities and closed manual reason/locators match Accepted architecture.                  |
| 4. Controlled data and operations      | Pass   | Presence, managed accessor safety, dense-string compatibility, detached intentions, helper ownership, ordered no-op and strict expectations are complete. |
| 5. Runtime semantics                   | Pass   | Representability, deterministic toggle order, clear/empty distinction, dirty, updates, focus/touched and scopes preserve application ownership.           |
| 6. Validation and conditions           | Pass   | Original schema/full value, issue fallback and sync/async authority remain replaceable; M31 conditions stay rejected with true snapshot defaults.         |
| 7. Texts and targets                   | Pass   | Exact text union/snapshot, fallback, Angular rank/provider/native accessibility and independent Standard/shared evidence are declaration- and test-ready. |
| 8. Migration and exclusions            | Pass   | Public/Internal/package deltas and future coordinated MINOR evidence are exact; dependency/version/release/Git and wider targets remain inactive.         |
| 9. Conformance and documentation       | Pass   | All 26 rows have one bounded evidence owner; indexes, local links, repository formatting and diff hygiene pass.                                           |

## Conformance row audit

- Rows 1–9 cover compiler/schema/UI family and diagnostics.
- Rows 10–15 cover manual definitions, hostile external data, presence,
  intentions/helpers and ordered no-op.
- Rows 16–22 cover toggling, empty/clear, dirty, validation/issues,
  interaction/scopes, conditions and texts.
- Rows 23–25 cover Angular, independent Standard/shared scenario and package
  declarations/consumers.
- Row 26 owns the frozen final matrix and reconciliation.

No row is unowned, duplicated as a separate behavior contract or dependent on
an excluded capability.

## Verification

- `pnpm docs:check`, `pnpm format:check` and `git diff --check` pass.
- The scoped SPEC change contains no plan, source, test, manifest, lockfile,
  dependency, version or external-state mutation.

## Result

Cycle 2 has zero findings and no unresolved change request. Under Ricard's
approved rule allowing acceptance after a complete zero-finding review without
scope expansion, SPEC-017 v0.1.0 is Accepted. Acceptance authorizes only
PLAN-033 preparation and complete review; it does not approve that plan or
authorize implementation, dependency, version, release, commit, push or
external action.
