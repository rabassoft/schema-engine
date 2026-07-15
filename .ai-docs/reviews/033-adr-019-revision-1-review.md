# ADR-019 revision 1 review

- **State:** Accepted; cycle 2 complete with zero findings
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Reviewed:** ADR-019 revision 1 against SPEC-001 v0.1.15, SPEC-003 v0.1.2,
  ADR-015 revision 4, ADR-019 revision 0 and current direct/collection
  operation and runtime paths
- **Authority:** correction review only; it authorizes no SPEC or code

## 1. Originating conflict

SPEC-006 preflight found one normative conflict: ADR-019 revision 0 could be
read as assigning item-relative null incompatibility to
`INCOMPATIBLE_OPERATION_VALUE`, while Accepted SPEC-003 reserves
`INCOMPATIBLE_COLLECTION_OPERATION_VALUE` for `set-item-value` leaf-type
failures. Ricard approved preserving the SPEC-003 family.

## 2. Complete reviews

### Cycle 1

The substantive correction was coherent, but closing verification found that
ADR-019 did not pass Prettier. The file was formatted and the complete review
restarted; cycle 1 cannot support acceptance.

### Cycle 2

The review covered six areas from the beginning:

1. **Scope:** passes. Revision 1 replaces one diagnostic sentence and promotes
   no new value, operation, runtime or renderer behavior.
2. **Non-collection operations:** passes. Definition-aware `set-value null`
   uses `INCOMPATIBLE_OPERATION_VALUE` only for a non-nullable direct/nested
   field; raw `applyOperation()` remains schema-agnostic.
3. **Collection operations:** passes. `set-item-value null` uses
   `INCOMPATIBLE_COLLECTION_OPERATION_VALUE` with `reason: 'leaf-type'`,
   `actualType: 'null'`, operation type, field and field type exactly as
   SPEC-003 requires.
4. **Runtime actions:** passes. `requestSetValue()` and
   `requestSetItemValue()` preserve the same split, while nullable targets may
   emit the existing strict operation shapes.
5. **Ordering and paths:** passes. Existing validation precedence, positional
   item-leaf data paths, expectations, no-effect behavior and immutable
   envelopes remain unchanged.
6. **Authority and gates:** passes. ADR-005 revision 4 is unaffected; accepting
   revision 1 only clears the conflict and resumes SPEC-006 preparation.

## 3. Result

Cycle 2 has zero findings and no unresolved change request. The approved narrow
correction was formally accepted. It authorizes no plan, implementation,
version or publication.
