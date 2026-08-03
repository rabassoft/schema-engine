# PLAN-032 checkpoint 1 review

- **Date:** 2026-08-03
- **Scope:** Public authoring/definition declarations and complete compiler
  contract; SPEC-016 rows 1–13
- **Outcome:** Cycle 1 found four implementation/evidence defects. After
  correction, cycle 2 repeated all thirteen areas and rows 1–13 with zero
  findings.

## Cycle 1 findings and corrections

1. Unknown condition keys below collection templates retained the owning
   `dataPath` but omitted the required `parameters.templatePath`. The existing
   warning now receives detached template provenance without changing its
   warning semantics.
2. The raw presentation-location scanner used recursion and overflowed on the
   already-supported deeply finite presentation forests. It now uses an
   explicit enter/leave stack, preserves depth-first order and contains object
   and array cycles while allowing non-cyclic reuse.
3. A safely inspectable malformed condition on a schema-blocked root property
   was lost when another valid nested candidate selected the nested UI parser.
   Both flat and nested root parsers now retain condition captures for known
   schema properties without candidates, so shape diagnostics survive while
   target/source/literal cascades remain suppressed.
4. The initial evidence did not independently prove successful nested
   reference/composition linking, template-object classification, complete
   strict-literal families, hostile exact segments, fixed visibility, field/
   member ordering or C-002 absence of `actualType`. Focused tests now close
   those rows and explicitly prove accessor non-invocation and raw detachment.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                         | Result | Evidence                                                                                                                                            |
| -------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Public declarations and root exports      | Pass   | Exactly two new Public types are root-exported; raw/normalized optional members are exact and operation/runtime signatures remain unchanged.        |
| 2. Template declaration boundary             | Pass   | `FieldTemplate` explicitly omits both members; type-level evidence rejects their presence and templates receive no normalized condition.            |
| 3. Descriptor-safe member capture            | Pass   | Absent/inherited/non-enumerable members are absent; own enumerable accessors are diagnosed without invocation.                                      |
| 4. Exterior/member/path/literal grammar      | Pass   | Ordinary exterior, member order, dense paths, exact segments, finite literals and hostile invalid families match SPEC-016.                          |
| 5. Exact diagnostics and C-002               | Pass   | Envelope, reason details, paths and safe types are exact; sparse/non-enumerable/accessor indices omit `actualType`.                                 |
| 6. Target classification                     | Pass   | Ordinary/fixed visibility succeeds; fixed enabled and object/array/item/template/identity/presentation targets fail with exact capability/kind.     |
| 7. Complete ordinary source linking          | Pass   | Direct/nested/reference/composition, self/forward/back/mutual and exact hostile paths resolve only through completed ordinary fields.               |
| 8. Source and literal compatibility          | Pass   | Unmanaged/object/array/below-collection reasons, kind/nullability, integer, null, empty, false, zero and `-0` semantics are exact.                  |
| 9. Ordering, suppression and atomicity       | Pass   | Existing schema/UI diagnostics precede field/member-ordered conditions; schema-blocked linking is suppressed and errors return no definition.       |
| 10. Unknown keys and provenance              | Pass   | Condition unknown keys remain warnings after path/equals and carry exact ordinary or template provenance without invalidating valid predicates.     |
| 11. Normalization, freezing and no retention | Pass   | Conditions and paths are copied, attached only after complete linking and deeply frozen by success/failure envelopes; no raw reference is retained. |
| 12. Deep/cyclic regression safety            | Pass   | Iterative presentation scanning preserves existing deep forests, cycle containment and reuse behavior.                                              |
| 13. Checkpoint and deferred boundaries       | Pass   | Runtime snapshots/actions, manual definitions, adapters, packages, dependencies, versions, release and Git remain outside checkpoint 1.             |

## Decision

Cycle 2 passes completely with zero findings. PLAN-032 checkpoint 1 is complete
for SPEC-016 rows 1–13. Checkpoint 2 may begin; this does not activate runtime,
adapter, package, dependency, version, release or Git behavior.

## Verification

- Prettier and ESLint for touched core source/tests.
- Core typecheck and build.
- Focused conditional/conformance: 2 files and 97 tests.
- Complete core regression: 41 files and 681 tests.
- Deep presentation/advanced-presentation regressions included in the complete
  pass.
- `pnpm docs:check`, `pnpm format:check` and `git diff --check`.

No manifest, lockfile, dependency, package/version, release, publication,
commit, push or external action changed.
