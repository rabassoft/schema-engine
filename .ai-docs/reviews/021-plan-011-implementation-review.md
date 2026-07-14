# M11 PLAN-011 implementation review — Cycles 1–2

- **State:** Final repeated review passed with zero findings; PLAN-011 and M11
  completed
- **Date:** 15 July 2026
- **Reviewed:** complete uncommitted PLAN-011 implementation diff plus final
  checkpoint 5 corrections
- **Compared with:** accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, ADR-005 revision 3, ADR-009, ADR-014 revision 2,
  ADR-015 revision 4, ADR-016, approved PLAN-011 revision 0 and the
  deferred-decision register

## 1. Result

Cycle 1 reviewed the complete authority, compiler integration, diagnostics,
cycle/provenance domains, 19-scenario evidence, declarations, packages,
consumers and persistent state. It found one semantic defect: an array-level
`MISSING_COLLECTION_POLICY` could inherit an item-target reference chain when
only the inline array's `items` schema was referenced.

The implementation now closes item-target provenance before array-level policy
diagnostics and attaches it explicitly only to item-dependent semantic policy
failures. Exact regression tests cover both exclusions and applicable chains.

Cycle 2 repeated the complete review and full verification matrix after that
correction. It passed with zero findings, unresolved change requests or
documentation conflicts. PLAN-011 satisfies every completion condition and M11
is complete.

## 2. Corrected finding

1. Item-target provenance was applied as one broad diagnostic range through the
   array's semantic-policy phase. That incorrectly gave an inline array's
   `MISSING_COLLECTION_POLICY` the chain of its referenced `items`. Provenance
   is now closed before policy evaluation; item-dependent identity-policy
   failures retain the item chain, while the missing array policy receives only
   an array-target chain when the array itself was referenced.

The correction changes no accepted diagnostic shape, Public contract or scope.

## 3. SPEC-004 scenario evidence

| Scenario                                     | Final evidence                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1. Registry absence/emptiness/laziness/order | Registry/resolver and compiler tests cover absence, empty registries, unused invalid content and declaration order. |
| 2. Invalid `$defs` exteriors                 | Descriptor/prototype/value tests cover enumerability, accessors, arrays and non-ordinary values.                    |
| 3. Invalid entries/repeated uses             | Entry continuation and per-use unresolved diagnostics are asserted.                                                 |
| 4. Every supported position                  | Primitive, nested object, array, item-root and item-descendant targets are normalized.                              |
| 5. Reused target/use sites                   | Required, UI, keys and paths are independently derived per use site.                                                |
| 6. Referenced arrays/policies                | Absolute use-site policy matching and exact applicable provenance are asserted.                                     |
| 7. Encoded/hostile names                     | Separators, Unicode, punctuation, `%`, `#`, `?`, whitespace, `__proto__` and lone-surrogate families are covered.   |
| 8. Invalid-reference reasons                 | All ten reasons and precedence combinations are asserted.                                                           |
| 9. Mechanical traversal                      | All four unresolved reasons, decoded prefixes and canonical/oversized array indices are asserted.                   |
| 10. Reference cycles/reuse                   | Direct, indirect, structural and repeated acyclic targets have exact chains.                                        |
| 11. Raw/reference cycles                     | Paired tests preserve `CYCLIC_SCHEMA_OBJECT` as a separate identity domain.                                         |
| 12. Malformed refs/siblings                  | Shape, source order, opacity and target blocking are asserted.                                                      |
| 13. Target provenance                        | Exact target document paths, use-site data paths and nested chains are asserted.                                    |
| 14. UI/policy exclusions                     | UI, exterior, unused and array-level policy diagnostics reject invented chains.                                     |
| 15. Invalid registry stopping                | Resolution is suppressed while root, sibling and UI diagnostics continue with no partial definition.                |
| 16. Deep finite safety                       | Iterative pointer and reference-chain tests reach depth 5,000 without a Public limit.                               |
| 17. Immutability/non-retention               | Frozen paths/chains/parameters/results and hostile accessor non-execution are asserted.                             |
| 18. Original validator schema                | Runtime validation receives the exact original schema object.                                                       |
| 19. M1–M10/package invariance                | 328 core and 68 Angular tests, declarations, private artifacts and clean consumers pass.                            |

## 4. Final verification

- `CI=true pnpm install --frozen-lockfile` passed with the unchanged lockfile.
- Formatting, documentation, lint, typecheck, both builds and
  `git diff --check` passed.
- All 328 core and 68 Angular tests passed (396 total).
- Package smoke, repository consumer and exact private artifact verification
  passed.
- Clean core and Angular 22.0.6 lower/upper consumers passed against local
  private `0.1.0` tarballs.
- Root declarations, exports and Public contracts are unchanged; Internal
  reference types are absent and deep imports remain blocked.
- Manifests, versions, dependencies, peers/exports, lockfile, publication state
  and Stable classification are unchanged.

## 5. Final decision

The final complete review cycle has zero findings. PLAN-011 revision 0 and M11
are complete. D-007/D-014 remain outside the delivered slice, D-040 publication
remains Deferred and every excluded external/dynamic/composition capability
remains inactive.
