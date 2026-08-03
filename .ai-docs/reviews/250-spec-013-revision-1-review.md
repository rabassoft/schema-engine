# SPEC-013 revision 1 complete review — Cycle 1

- **Date:** 2026-08-02
- **Scope:** Complete SPEC-013 v0.1.1 after the narrow C-001 correction
- **Outcome:** All twelve contract areas pass with zero findings; v0.1.1 may be
  Accepted without widening M27

## Correction reviewed

Review 249 found that v0.1.0 required stable-address fields for every
`invalid-identity` diagnostic even though a static array/object target has no
`itemId`. Revision 1 requires collection fields for every such diagnostic and
retains `itemId`/`relativePath` only when the original target is stable.

No diagnostic code, reason, fallback, ordering, collection identity rule,
Public symbol, helper signature, reconstruction behavior, adapter/runtime
contract, dependency or exclusion changes.

## Complete review matrix

| Area                               | Result | Evidence                                                                                        |
| ---------------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| 1. ADR/baseline authority          | Pass   | The pure application-owned boundary and Accepted baselines are unchanged.                       |
| 2. Public result/API inventory     | Pass   | One additive helper and the reused result contract remain exact.                                |
| 3. Processing order/atomicity      | Pass   | Definition, roots, shape, availability and construction order is unchanged.                     |
| 4. Diagnostics                     | Pass   | The matrix is closed for both static and stable invalid-identity targets without invented data. |
| 5. Parsing/availability/overlap    | Pass   | Static and stable addressing semantics are unchanged and now diagnosable consistently.          |
| 6. Primitive/object reconstruction | Pass   | Presence, incompatibility and managed projection rules are unchanged.                           |
| 7. Collection reconstruction       | Pass   | Identity, structure and stable-partial rules are unchanged.                                     |
| 8. Sharing/no-effect               | Pass   | Descriptor, dirty-equivalence and structural-sharing guarantees are unchanged.                  |
| 9. Runtime/application ownership   | Pass   | The helper remains pure; persistence and baseline application stay external.                    |
| 10. Conformance/evidence           | Pass   | The test matrix can now assert static omission and stable inclusion exactly.                    |
| 11. Compatibility/dependencies     | Pass   | No dependency, package, entry point or changed Public contract is introduced.                   |
| 12. Exclusions/Deferred            | Pass   | Every explicit exclusion and Deferred boundary remains closed.                                  |

## Acceptance

Cycle 1 reviewed the complete corrected document, not only the changed row,
and produced zero findings. Ricard explicitly authorized the C-001 correction;
the standing zero-finding/no-scope-expansion authorization therefore accepts
SPEC-013 v0.1.1 on 2 August 2026. PLAN-029 must still reconcile its prerequisite
before implementation resumes.
