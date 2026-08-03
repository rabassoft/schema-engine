# SPEC-015 complete review — Cycle 1

- **Date:** 2026-08-03
- **Document:** [SPEC-015 v0.1.0](../specs/015-explicit-schema-default-candidate.md)
- **Scope:** Bounded D-039/M29 explicit schema-default candidate contract
- **Authority reviewed:** Accepted ADR-032 revision 0; SPEC-001 v0.1.15,
  SPEC-002 v0.1.2, SPEC-003 v0.1.2, SPEC-004 v0.1.1, SPEC-006 v0.1.1 and
  SPEC-014 v0.1.0; ADR-005 revision 7, ADR-009, ADR-014 revision 2,
  ADR-015 revision 4, ADR-016, ADR-019 revision 1, ADR-028 and ADR-031;
  D-039 and review 269
- **Outcome:** Cycle 1 passes the complete contract review with zero findings
  and no unresolved change request.

## Complete review matrix

| Area                               | Result | Evidence                                                                                                                                                                                          |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Promoted boundary               | Pass   | Only primitive-leaf defaults in root/nested object trees are active; every container/array/item/dynamic/automatic default remains Deferred.                                                       |
| 2. Public signature and result     | Pass   | Exactly one Public + Experimental + Active root helper reuses `ApplyOperationResult<TData>` with exact success/no-effect/failure identity and frozen diagnostic rules.                            |
| 3. Application ownership           | Pass   | Derivation does not accept a candidate, mutate `value`/`baselineValue`, persist, submit, emit an operation or own validation.                                                                     |
| 4. Schema pipeline                 | Pass   | Input/dialect, `$defs`, effective traversal, data preflight and reconstruction stages are ordered atomically; schema errors stop data inspection.                                                 |
| 5. Raw schema/Internal cursor      | Pass   | Raw schema is the Public source; source/use-site/reference/composition state remains Internal with exact Accepted provenance and cycle identities.                                                |
| 6. Locations and barriers          | Pass   | Ordinary/composed root/nested objects and pure local references are traversed; root/object/array/item defaults and descendants below arrays are opaque.                                           |
| 7. Default descriptor and kind     | Pass   | Own enumerable data is required, inherited/non-enumerable is absent, accessors fail safely and the primitive/nullable compatibility table is closed.                                              |
| 8. Validator boundary              | Pass   | Only basic kind is checked; constraints, enum, const and format remain the replaceable validator's authority and Ajv mutation is excluded.                                                        |
| 9. Schema diagnostics              | Pass   | Invalid defaults reuse an exact `INVALID_SCHEMA_KEYWORD_VALUE` envelope; existing schema errors/provenance/order remain exact while non-blocking compiler warnings are deliberately not replayed. |
| 10. Data presence and diagnostics  | Pass   | Ordinary root, own presence, accessor failure, incompatible branch barriers and the two new exact diagnostic families preserve atomicity without retaining hostile values.                        |
| 11. Materialization and sharing    | Pass   | Missing ancestors are created only for actual insertions; changed chains clone once, descriptors/prototypes/unmanaged data are preserved and no-effect returns the exact root.                    |
| 12. Runtime/adapter invariants     | Pass   | Compiler definitions, runtime, sync/async validation, baseline confirmation, operations, renderers and adapters gain no implicit behavior or wrapper.                                             |
| 13. Package and reference evidence | Pass   | Root declarations/package consumers are specified without dependency/export-map drift; one shared scenario requires independent Angular/Standard derive/cancel/accept evidence.                   |
| 14. Conformance and gates          | Pass   | All hostile, reference, composition, presence, package and consumer obligations map to 21 rows; acceptance authorizes only PLAN-031 preparation/review.                                           |

## Cross-authority checks

- SPEC-001 section 18 continues to prohibit silent render-time defaults; this
  extension adds only the explicit helper anticipated by D-039.
- SPEC-002 missing-ancestor materialization and descriptor/prototype rules are
  reused without adding a deep operation or ancestor pruning.
- SPEC-003 collection identity and item traversal are untouched because arrays
  are opaque barriers; no collection policy is required by this helper.
- SPEC-004 reference source/use-site provenance and both cycle domains remain
  exact; repeated targets are evaluated per managed use site.
- SPEC-006 null is admitted only through an Accepted nullable primitive.
- SPEC-014 contributes only its deterministic disjoint effective object tree;
  object/composition defaults themselves remain opaque.
- ADR-009 inventory contains one new root export and two diagnostic codes, no
  new type, package, entry point, dependency or stability promotion.

## Decision

Cycle 1 is a complete zero-finding pass. Under the authorized rule for
accepting fully reviewed documents without scope expansion, SPEC-015 v0.1.0
is Accepted. Acceptance authorizes only preparation and complete review of
PLAN-031; implementation still requires explicit plan approval.

## Verification

- Prettier check for the SPEC, review, indexes and current-state documents.
- `pnpm docs:check` after all links and accepted-version surfaces are updated.
- Targeted search for stale Draft/contract-pending M29 wording.
- `git diff --check` and scoped diff inspection.

No source code, package manifest, lockfile, dependency, version, release,
publication, commit, push or external state changed during this contract gate.
