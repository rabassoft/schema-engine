# PLAN-035 checkpoint 1 complete review — Cycles 1–2

- **Date:** 2026-08-04
- **Plan:** PLAN-035 revision 2, checkpoint 1
- **Authority:** Accepted ADR-036 revision 1, ADR-005 revision 11 and SPEC-019
  v0.1.2
- **Owned rows:** 1–7 only
- **Source scope:** core Public contracts/exports, compiler, deliberate runtime
  guard and focused conformance fixtures
- **Outcome:** Cycle 1 found four implementation/evidence defects and one
  Accepted-document conflict. After correction and coordinated review 320,
  cycle 2 repeats the complete checkpoint with zero findings.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R321-F01 | Reconcile the M33 malformed-owner presentation phrase with SPEC-005/SPEC-009: preserve exact `INVALID_UI_PRESENTATION` warnings/fallback and add `dynamic-children` incompatibility only for a structurally valid forest. Review 320 cycle 2 closes the coordinated documents. |
| R321-F02 | Diagnose a malformed/accessor outer property immediately as owner-relative `unsupported-alternative-descendant`, with `branchIndex` absent, instead of deriving a misleading zero-discriminator-candidate conflict.                                                            |
| R321-F03 | Preserve `CYCLIC_SCHEMA_OBJECT` when a wrapper re-enters itself directly through an authored `oneOf` branch or direct union property; retain the existing reference-cycle family for `$ref` re-entry.                                                                          |
| R321-F04 | Follow nested local references while checking forbidden alternative descendants and retain canonical target path plus complete outermost-to-innermost `referenceChain`.                                                                                                        |
| R321-F05 | Expand explicit evidence for array/item exclusions, every branch-conflict reason, hostile descriptors, runtime guarding, enum/UI order, immutability and cycles; remove unsafe descriptor/test narrowing reported by lint.                                                     |

Cycle 1 cannot support completion. After every correction, cycle 2 restarts all
areas rather than checking only the modified fragments.

## Cycle 2 complete review

| Area                           | Result | Evidence                                                                                                                                                                                                            |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority/scope             | Pass   | Diff implements only checkpoint-1 rows 1–7 under ADR-036 revision 1, ADR-005 revision 11 and SPEC-019 v0.1.2.                                                                                                       |
| 2. Public definitions          | Pass   | The five exact type exports exist; only named definition/snapshot/text unions widen and ordinary object literals remain assignable.                                                                                 |
| 3. Eligible/excluded locations | Pass   | Nested ordinary object properties compile; root and item/template remain unsupported, while primitive/array/nested-alternative locations retain exact incompatible families without branch traversal.               |
| 4. Exterior safety             | Pass   | Own enumerable `oneOf`, safe length, dense own enumerable object indices and no extra keys are checked without accessors/iterators/callbacks; first exterior defect stops branches.                                 |
| 5. Seed/bijection              | Pass   | One required scalar string-enum seed, typed string consts, complete unique mapping and enum-order alternatives are deterministic without retaining business values.                                                 |
| 6. Properties/required         | Pass   | Outer unmanaged warning compatibility, branch required ownership, disjoint names and owner-relative incompatible descendants have exact reasons and structural metadata.                                            |
| 7. References/cycles           | Pass   | Wrapper/branch/property local refs, canonical target paths, ordered chains, acyclic reuse, raw cycles and reference cycles preserve accepted families and stopping.                                                 |
| 8. Union/order/immutability    | Pass   | One unique static union uses owner UI order, alternatives use enum order and union-relative children, static fields are depth-first/exact-once and the detached result is deeply frozen.                            |
| 9. Presentation/conditions     | Pass   | Invalid owner forests retain SPEC-005/SPEC-009 fallback, valid forests receive only the dynamic-children warning, ordinary descendant presentation stays local and every union condition source/target is rejected. |
| 10. Diagnostics/no partial     | Pass   | Exact codes/reasons/paths/safe parameters are detached/frozen; any error returns no partial definition and derived conflicts are suppressed after structural defects.                                               |
| 11. Runtime guard              | Pass   | Runtime creation rejects the new definition before validator/effects; checkpoint 2 remains the first owner of manual/runtime behavior.                                                                              |
| 12. Regressions/declarations   | Pass   | Complete core suite passes M1–M32 regressions; built declarations expose five type-only additions and the runtime export inventory remains exactly six.                                                             |
| 13. Graph/release boundary     | Pass   | No dependency, manifest, lockfile, package version, entry point, release, publication or Git mutation exists.                                                                                                       |
| 14. Documentation/hygiene      | Pass   | Review 320 and active state are reconciled; formatting, 443 Markdown files/1,254 links and diff hygiene pass.                                                                                                       |

## Owned-row evidence

| Row                        | Result | Evidence                                                                                                                               |
| -------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Locations/catalogs      | Pass   | Focused accepted wrapper plus root, primitive, array, item and nested-alternative exclusions.                                          |
| 2. Exterior defects        | Pass   | Accessor/non-array/non-enumerable member, invalid length, sparse/accessor index and unexpected key fixtures.                           |
| 3. Seed/bijection          | Pass   | Ambiguous seed, missing/invalid/duplicate discriminator and unmapped choice fixtures.                                                  |
| 4. Required/properties     | Pass   | Outer unmanaged warning, outer/branch descendant, redeclaration, duplicate branch name and invalid branch required fixtures.           |
| 5. References/order        | Pass   | Wrapper/branch/discriminator/nested property refs, canonical provenance, raw/reference cycles, enum order and UI-filtered union order. |
| 6. Presentation/conditions | Pass   | Valid/invalid presentation and internal/external condition source/target fixtures.                                                     |
| 7. Exports/compatibility   | Pass   | Compile-time exact type assertions, ordinary-object assignment, deep freeze and guarded runtime rejection.                             |

Rows 8–17 remain unimplemented and uniquely owned by checkpoints 2–6.

## Verification

- Focused M33 compiler/conformance: 1 file, 20 tests passed.
- Complete core: 50 files, 823 tests passed.
- `pnpm format:check`, `pnpm docs:check` and `pnpm lint`: pass.
- Core typecheck, build and package smoke: pass.
- Built runtime exports: exactly `applyFormOperation`, `applyOperation`,
  `commitScopeToBaseline`, `compileFormDefinition`,
  `createControlledFormRuntime` and `deriveSchemaDefaultCandidate`.
- No package/lockfile/version diff; `git diff --check`: pass.

## Result

Cycle 2 has zero findings and no unresolved change request. PLAN-035 checkpoint
1 and SPEC-019 rows 1–7 are complete. Checkpoint 2 may begin under the approved
autonomous sequence. No dependency, version, release, publication, commit,
push or external action is authorized.
