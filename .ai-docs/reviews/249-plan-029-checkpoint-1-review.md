# PLAN-029 checkpoint 1 review — Cycle 1 blocked

- **Date:** 2026-08-02
- **Scope:** Initial Internal input/target/diagnostic foundation
- **Outcome:** Checkpoint 1 is incomplete and halted by one Accepted SPEC-013
  diagnostic-matrix conflict; no Public export exists

## Contract conflict C-001

SPEC-013 sections 4.2, 6 and 9 require a selected whole array, or an object
selection transitively containing it, to fail closed when an accessible current
or baseline collection has invalid identity.

Section 7.2 assigns that failure `UNCONFIRMABLE_SCOPE_TARGET` with reason
`invalid-identity`. Its parameter table, however, requires “stable address
fields”, which includes `itemId`. A static array/object target has a
`collectionPath` but no stable item identity. Supplying an invented `itemId`,
omitting a declared required parameter or allowing malformed identity would
each contradict a different Accepted requirement.

ADR-030 does not create the conflict: it deliberately leaves exact diagnostic
parameters to the extension SPEC. The narrow recommended correction is
SPEC-013 v0.1.1:

- require `side`, `identityReason`, `identityIndex` and `collectionPath` for
  every `invalid-identity` diagnostic;
- include `firstIdentityIndex` only for a duplicate;
- include `itemId` and optional `relativePath` only when the original target is
  a stable item/node address; and
- keep `dataPath` equal to the failing collection path.

No diagnostic code, reason, fallback, severity, source, ordering, identity
semantics, Public symbol or architecture changes.

## Partial implementation state

- Added one unexported Internal preparation module.
- Added definition/root inspection, scope/target parsing, availability and
  canonicalization foundations without non-empty reconstruction.
- The core typecheck and diff hygiene pass; the package root and Public
  declarations remain unchanged.
- Complete checkpoint tests/review have not run and the checkpoint must not be
  marked complete.

## Resume gate

Obtain explicit approval for the narrow SPEC correction, prepare/review the
revision to zero findings, reconcile PLAN-029's prerequisite version and then
resume checkpoint 1. No further implementation, Public export or checkpoint
closure is authorized while C-001 remains unresolved.

## Resolution

Ricard approved the recommended correction. SPEC-013 v0.1.1 passed complete
review 250 cycle 1 with zero findings and is Accepted; PLAN-029 revision 1
passed complete review 251 cycle 1 with zero findings and is Approved. C-001 is
resolved and checkpoint 1 may resume. This historical cycle remains blocked;
its implementation review must be repeated completely before closure.
