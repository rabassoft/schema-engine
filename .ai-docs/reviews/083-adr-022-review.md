# ADR-022 complete review — Cycles 1–2

- **Date:** 2026-07-17
- **Document:** [`ADR-022 revision 1`](../adrs/022-validador-ajv-sincrono-reutilizable.md)
- **Authority:** Accepted review 082 D-047/M17 boundary, SPEC-001 through
  SPEC-006, ADR-005, ADR-009, ADR-010 and ADR-018
- **Outcome:** Cycle 2 passed with zero findings

## Complete review

1. **Promoted scope:** Pass. One private reusable synchronous validator is
   designed; no other validation capability is activated.
2. **Core isolation:** Pass. Existing `SchemaValidator`/issue contracts suffice
   and Ajv does not enter core.
3. **Package/API:** Pass. Exact package, root export, stability, peer and private
   publication state are closed.
4. **Dialect:** Pass. Dedicated Draft 2020-12 behavior aligns with ADR-005.
5. **Determinism/non-mutation:** Pass. Fixed options prevent logs, format
   assertions and data-changing features.
6. **Synchronous failure:** Pass. Async/remote compilation is rejected and the
   existing runtime exception boundary remains authoritative.
7. **Normalization:** Pass. Code, keyword, typed path, parameters, message,
   ordering and immutability are exact.
8. **Caching:** Pass. Per-factory weak identity caching has no global retention
   or structural semantics.
9. **Shell/catalog boundary:** Pass. Both shells migrate; catalog validators
   retain fixture ownership and no catalog contract changes.
10. **Deferred/release boundary:** Pass. Formats, async, bridges, publication,
    Stable promotion and external mutations remain excluded.

## Result

Cycle 1 accepted the original package architecture. Delivery then found two
Angular-tooling gaps: static loading exceeded the 1 MB initial budget and the
virtual Vite root could not resolve package-nested Ajv. Revision 1 adds lazy
pre-bootstrap loading and exact root development-tool ownership without moving
runtime ownership or changing the Public factory.

Cycle 2 repeated all ten areas, including bundle/loading lifecycle, dependency
ownership and dev/production resolution, with zero findings and no unresolved
change request. ADR-022 revision 1 is Accepted
and authorizes SPEC-007 plus PLAN-019 preparation and complete review only.
