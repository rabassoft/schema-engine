# PLAN-033 checkpoint 2 review

- **Date:** 2026-08-03
- **Scope:** Exact M31 manual definitions, managed array-index safety and
  atomic form-aware/runtime operations; SPEC-017 rows 10–15
- **Outcome:** Cycle 1 found two descriptor-safety defects. After correction,
  cycle 2 repeated all twelve areas and rows 10–15 with zero findings.

## Cycle 1 findings and corrections

1. The first form-aware definition classifier used `Array.prototype.some()`
   over `definition.fields`, which could invoke an accessor index before the
   shared descriptor-safe validator rejected it. It now reads every candidate
   through own property descriptors and never invokes the accessor.
2. Runtime set-value handling first inspected and then copied a candidate in a
   second pass whose defensive failure path threw. Detachment now validates and
   copies in one non-throwing pass, returning the exact existing compatibility
   diagnostic for the first unsafe/incompatible index.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                         | Result | Evidence                                                                                                                                                                  |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Exact manual field shape                  | Pass   | Base members, exact kind, own `nullable: false`, forbidden capabilities and required choices are validated in contract order.                                             |
| 2. Choice exterior and entries               | Pass   | Choices are own/non-empty/dense; entries are ordinary objects with own unique string values and non-blank labels; ignored extras, reuse and cycles remain opaque.         |
| 3. Descriptor safety and diagnostic closure  | Pass   | Definition/choice accessors are never invoked; the closed reason and immutable node/path/member/expected/type locators reach runtime and form-aware envelopes exactly.    |
| 4. Definition precedence                     | Pass   | M31 definition defects precede external data, validator invocation, membership and effects; unrelated accepted definition diagnostics retain their existing fallback.     |
| 5. Initial managed-data safety               | Pass   | Current and baseline M31 index accessors fail before validation at the exact outer-plus-numeric path without invocation.                                                  |
| 6. Atomic external updates                   | Pass   | Value/baseline accessor updates fail with `INVALID_EXTERNAL_STATE_UPDATE`, preserve snapshot identity and do not invoke sync validation.                                  |
| 7. Controlled presence and invalid data      | Pass   | Missing, empty, duplicate, unknown, non-string and sparse values remain distinct, unchanged controlled snapshots; only managed accessors are unsafe.                      |
| 8. Runtime set intentions                    | Pass   | Dense strings are copied once in order into a detached frozen array; non-Array and first sparse/accessor/non-string index diagnostics are exact and safe.                 |
| 9. Form-aware helper compatibility/ownership | Pass   | Dense duplicate/out-of-enum arrays remain basic-compatible, direct operation value identity is retained and first-index failures occur after exact expectation checks.    |
| 10. Schema-neutral helper boundary           | Pass   | `applyOperation()` remains schema-neutral, accepts opaque/non-dense array values and preserves reference-based effect semantics.                                          |
| 11. Ordered no-op and stale expectation      | Pass   | Runtime/form-aware ordered dense equality is no-effect across references; schema-neutral application still changes, while confirmed expectations remain reference-exact.  |
| 12. Checkpoint and regression boundary       | Pass   | Dirty/issues/scopes/targets remain unimplemented until checkpoint 3; primitive/nested/collection/fixed/condition/default/async behavior and the package graph are stable. |

## Decision

Cycle 2 passes completely with zero findings. PLAN-033 checkpoint 2 is complete
for SPEC-017 rows 10–15. Checkpoint 3 may begin; this does not activate target,
text, scenario, package, dependency, version, release or Git work.

## Verification

- Repository ESLint, Prettier and diff hygiene.
- Core typecheck and build.
- Focused M31/manual/runtime/operation plus primitive/nested/collection/fixed/
  condition/async/scope regressions: 12 files and 197 tests.
- Complete core regression: 45 files and 749 tests.
- Workspace typechecks, including Angular, Angular Aria, validator, scenarios
  and both reference applications.
- `pnpm docs:check`: 414 Markdown files and 1,171 local links before this
  review was added.

No dependency, manifest, lockfile, package/version, release, publication,
commit, push or external action changed.
