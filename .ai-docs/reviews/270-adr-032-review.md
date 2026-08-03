# ADR-032 complete review

- **Date:** 2026-08-03
- **Document:** [ADR-032 revision 0](../adrs/032-explicit-schema-default-candidate.md)
- **Scope:** Bounded D-039/M29 explicit schema-default candidate architecture
- **Authority reviewed:** Accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2,
  SPEC-003 v0.1.2, SPEC-004 v0.1.1, SPEC-006 v0.1.1 and SPEC-014 v0.1.0;
  ADR-005 revision 7, ADR-009, ADR-014 revision 2, ADR-015 revision 4,
  ADR-016, ADR-019 revision 1, ADR-028 and ADR-031; review 269 and D-039
- **Outcome:** Cycle 1 found four contract inconsistencies. After correction,
  cycle 2 repeated all fourteen areas and passed with zero findings and no
  unresolved change request.

## Cycle 1 findings and corrections

1. **Integer compatibility was narrower than the Accepted domain.** The draft
   required a safe integer although existing primitive contracts use a finite
   integer. It now uses the Accepted finite-integer boundary.
2. **Non-enumerable `default` was incorrectly treated as malformed.** The
   accepted schema traversal treats non-enumerable and inherited members as
   absent document members. The draft now does the same and reserves failure
   for an enumerable accessor or incompatible own data value.
3. **The compiler-warning relationship was incomplete.** Reusing
   `ApplyOperationResult<TData>` means success diagnostics are exactly empty,
   so the helper cannot replay non-blocking compiler warnings. The draft now
   distinguishes helper structural/default failures from the separate full
   compiler diagnostic stream and states missing-dialect/opaque-annotation
   behavior explicitly.
4. **The value-root gate was implicit.** The draft described descendant
   traversal but did not close arrays, class instances and hostile reflection
   at the root. It now requires an ordinary `Object.prototype`/null-prototype
   root and normalized atomic failure otherwise.

Because cycle 1 required corrections, it cannot support acceptance.

## Cycle 2 complete review

| Area                                             | Result | Evidence                                                                                                                                                                                                   |
| ------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Selected D-039/M29 boundary                   | Pass   | Review 269 selection follow-up promotes only architecture for primitive-leaf defaults in object trees; every wider candidate remains inactive.                                                             |
| 2. Pure helper and application ownership         | Pass   | One synchronous candidate helper leaves acceptance, controlled `value`, `baselineValue`, persistence and submit entirely with the application.                                                             |
| 3. Raw schema/Internal cursor boundary           | Pass   | Raw schema is the Public annotation source; reference/composition/effective cursors remain Internal and no resolved graph is exposed.                                                                      |
| 4. Supported locations                           | Pass   | Direct/nested primitive leaves plus accepted local references and disjoint object composition are closed exactly.                                                                                          |
| 5. Array/container barriers                      | Pass   | Root/object/array/item defaults and every descendant below arrays are explicitly excluded; arrays are neither created nor traversed.                                                                       |
| 6. Default admissibility and validator authority | Pass   | Own enumerable data, exact primitive/null compatibility and no coercion are closed; other assertions remain the replaceable validator's responsibility.                                                    |
| 7. Presence preservation                         | Pass   | Own data presence preserves null, false, zero, empty string and incompatible values; inherited presence is ignored and accessors fail safely.                                                              |
| 8. Missing-object materialization                | Pass   | Ancestors are created only for an actually written descendant default; requiredness and empty schema branches do not invent objects.                                                                       |
| 9. Atomicity, provenance and diagnostics         | Pass   | Complete preflight precedes reconstruction, failure returns the exact root, source/use-site/reference provenance remains Internal-to-diagnostic, and the later SPEC must close envelopes/order.            |
| 10. Sharing, descriptors and safety              | Pass   | Only changed ancestor chains clone; off-path references, unmanaged descriptors and input objects are preserved without retention, mutation or deep freeze.                                                 |
| 11. Runtime/async/baseline/adapters              | Pass   | No implicit compiler/runtime/renderer/reset/validator/baseline action is added; Angular and Standard may import the same neutral helper only for independent evidence.                                     |
| 12. Public/Internal and package inventory        | Pass   | Exactly one Public + Experimental + Active core export reuses `ApplyOperationResult`; no new type, adapter API, package, entry point, dependency or stability change exists.                               |
| 13. Accepted-authority consistency               | Pass   | The design preserves ADR-005 annotation policy, ADR-014 object traversal, ADR-015 array identity boundary, ADR-016 provenance, ADR-019 nullability, ADR-028 fixed values and ADR-031 disjoint composition. |
| 14. Gates and exclusions                         | Pass   | Acceptance can authorize only a dedicated extension SPEC; plan, code, dependency, version, release, Git and external actions remain separately gated.                                                      |

## Decision

Cycle 2 is a complete zero-finding pass. Under the previously authorized rule
for accepting fully reviewed documents without scope expansion, ADR-032
revision 0 is Accepted. Its acceptance authorizes only preparation and complete
review of a dedicated M29 extension SPEC.

## Verification

- Prettier check for every changed current-state/design document.
- `pnpm docs:check` after the review link exists.
- `git diff --check`.
- Targeted stale-state search for D-039, M29, ADR-032 and product-selection
  wording.

No source code, package manifest, lockfile, dependency, version, release,
publication, commit, push or external state changed during this architecture
checkpoint.
