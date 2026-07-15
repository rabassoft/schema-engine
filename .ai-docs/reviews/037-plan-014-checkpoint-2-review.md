# PLAN-014 checkpoint 2 implementation review — Cycle 1

- **State:** Checkpoint 2 accepted; cycle 1 passed with zero findings
- **Date:** 15 July 2026
- **Scope:** PLAN-014 checkpoint 2 compiler, diagnostics, fixtures and regression
- **Authority:** Approved PLAN-014 revision 0, Accepted SPEC-006 v0.1.1,
  ADR-019 revision 1 and ADR-005 revision 4
- **Implementation boundary:** checkpoint 2 only; null operation/runtime and
  Angular null projection remain inactive

## 1. Complete review — Cycle 1

### 1.1 Authority and boundary — Pass

Only the closed primitive-plus-null leaf envelope is activated. Root, object,
array, item-root and collection identity ownership remain unchanged. General
unions, standalone null, nullable containers, enum-plus-null, coercion,
operations/runtime null compatibility and Angular projection remain inactive.

### 1.2 Descriptor-safe classifier — Pass

The existing iterative primitive path recognizes arrays only at editable leaf
positions. It checks the own length descriptor, indices 0 then 1, safe catalog
members, the first extra enumerable key and the closed combination set without
iteration, coercion or accessor execution. Only the primitive kind and boolean
capability survive normalization; no source array or descriptor is retained.

### 1.3 Diagnostics and precedence — Pass

Every malformed array emits one `UNSUPPORTED_FIELD_TYPE` with the exact leaf
path, fallback and safe parameters. Length, sparse/non-enumerable/accessor
indices, non-string and unsupported members, extra keys and all three invalid
combinations are covered. The rejected branch stops before constraints while
independent siblings retain traversal. Template paths and reference chains use
the Accepted envelopes.

### 1.4 Propagation and excluded positions — Pass

Both member orders for string, number, integer and boolean normalize to frozen
`nullable: true` definitions at direct, nested, collection-template and local
reference positions. Scalars remain false. Nullable collection identities
produce only the existing `INVALID_COLLECTION_POLICY` result with
`identity-schema-incompatible`; container positions retain their existing
blocking diagnostics.

### 1.5 Keywords and UI — Pass

Constraints, annotations and UI options are classified by the non-null
primitive. `default` remains inert. Nullable string `enum` produces the exact
existing incompatible-keyword diagnostic and cannot create choices;
`enumLabels` remains ignored or independently diagnosed according to its
exterior shape.

### 1.6 Tests, fixtures and regressions — Pass

Serializable conformance evidence covers every primitive/order plus nested,
template and referenced propagation. Programmatic tests cover sparse and
descriptor cases, accessors, extra keys, hostile iteration/coercion hooks,
identity ownership, provenance, immutability and no retention. All pre-M14
scalar behavior remains green and operation null compatibility remains
explicitly rejected.

### 1.7 Public/package/deferred boundaries — Pass

No new symbol, export, operation, snapshot, renderer, registration, manifest,
dependency, peer, lockfile or version change exists. Published `0.1.0` remains
the immutable pre-M14 release. Checkpoint 3 is the first authorized point for
definition-aware null operations/runtime.

## 2. Verification

- Formatting and documentation pass across 96 Markdown files and 441 local
  links after this review is indexed by current state.
- Lint, typecheck, build, 389 core tests, 76 Angular tests and both package
  smoke suites pass.
- Conformance generation produced only the new nullable fixture after
  unrelated formatting churn was removed; `git diff --check` passes.

Cycle 1 produced zero findings and no unresolved change request. This complete
pass accepts checkpoint 2 and authorizes checkpoint 3 under the unchanged
Approved plan.
