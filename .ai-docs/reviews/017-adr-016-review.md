# ADR-016 complete review — Cycles 1–2

- **State:** Accepted; repeated review cycle 2 passed all eight areas with zero
  findings and Ricard accepted ADR-016 formally
- **Date:** 14 July 2026
- **Reviewed:** complete proposed
  [`ADR-016`](../adrs/016-resolucion-referencias-locales.md)
- **Compared with:** accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, ADR-005 revision 2, ADR-009, ADR-014 revision 2, accepted
  [review 016](./016-m11-resolution-promotion-readiness.md) and D-007/D-014/D-041
  in the [deferred-decision register](../roadmap/deferred-decisions.md)

## 1. Result

Cycle 1 reviewed the complete proposed decision across its eight required
acceptance areas. Its direction and promoted boundary were consistent, but five
contract areas were not precise enough to constrain ADR-005 revision 3 and a
later SPEC objectively.

Every finding was corrected in ADR-016. Cycle 2 then repeated the complete
review against the same authority and passed all eight areas with zero findings
or unresolved change requests. At review completion ADR-016 remained Proposed
and this document supplied its acceptance evidence. Ricard subsequently
accepted ADR-016 formally, authorizing only preparation and review of ADR-005
revision 3.

## 2. Cycle 1 findings and corrections

1. **`$defs` and reference-object inspection order.** The draft required safe
   inspection but did not fix when the `$defs` exterior is validated, how its
   entries are ordered or what malformed `$ref` suppresses. The correction
   places indexing after dialect inspection, uses own descriptors and
   `Object.keys()` order, inspects `$ref` before siblings and stops only
   reference-dependent work.
2. **Pointer decoding and hostile traversal.** The draft named URI fragments
   and RFC 6901 but left double decoding, invalid escapes, array tokens,
   inherited/non-enumerable members and `__proto__` implicit. The correction
   fixes single percent decoding followed by JSON Pointer decoding and requires
   own enumerable data descriptors, canonical array indices and an ordinary
   schema-object target without invoking accessors.
3. **Cycle identity under programmatic sharing.** The draft did not distinguish
   canonical reference identity from shared JavaScript object identity. The
   correction keys reference cycles by canonical target `documentPath`, keeps
   distinct document locations distinct and reserves `CYCLIC_SCHEMA_OBJECT`
   for structural-containment identity cycles.
4. **Provenance scope and order.** The draft did not close chain order/current
   reference membership or schema-versus-UI/policy behavior. The correction
   makes chains outermost-to-innermost including the current `$ref`, preserves
   use-site `dataPath`, limits schema chains to reference-mediated schema
   diagnostics and leaves UI/exterior-policy provenance unchanged.
5. **ADR-009 Public inventory.** The draft described changed compiler behavior
   without naming the observable `Diagnostic.parameters` semantic change. The
   correction records the optional frozen `referenceChain` behavior explicitly
   while adding no symbol or signature.

These corrections do not widen D-041, change an accepted SPEC/ADR, authorize
implementation or activate any D-007/D-014 remainder.

## 3. Repeated cycle 2 evidence

| Acceptance area                                                         | Result |
| ----------------------------------------------------------------------- | ------ |
| Same-document/root-`$defs`/fragment-only scope and exterior order       | Pass   |
| Draft 2020-12 sibling policy plus pointer decoding/traversal            | Pass   |
| Descriptor safety, iteration, sharing and both cycle domains            | Pass   |
| Target/use-site/reference-chain provenance across schema, UI and policy | Pass   |
| Public signatures, normalized definitions and validator ownership       | Pass   |
| ADR-005/009/014 and accepted SPEC consistency                           | Pass   |
| D-007/D-014, package, publication and stability boundaries              | Pass   |
| Follow-up gates and absence of implementation authorization             | Pass   |

Cycle 2 found no conflict between ADR-016 and the accepted authority. The
decision preserves the exact original schema for `SchemaValidator`, keeps the
resolved representation Internal, leaves `FormDefinition` and Public
signatures unchanged and limits its Public delta to documented compiler and
diagnostic behavior.

## 4. Gate state

Ricard formally accepted ADR-016 on 14 July 2026. The next action is drafting
and reviewing ADR-005 revision 3. That revision must be accepted before
SPEC-004 can be drafted; an accepted SPEC and approved plan remain mandatory
before implementation.
