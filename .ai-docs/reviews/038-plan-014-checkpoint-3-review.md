# PLAN-014 checkpoint 3 implementation review — Cycle 1

- **State:** Checkpoint 3 accepted; cycle 1 passed with zero findings
- **Date:** 15 July 2026
- **Scope:** PLAN-014 checkpoint 3 definition-aware operations, controlled
  runtime and regressions
- **Authority:** Approved PLAN-014 revision 0, Accepted SPEC-006 v0.1.1,
  ADR-019 revision 1 and ADR-005 revision 4
- **Implementation boundary:** checkpoint 3 only; Angular null projection
  remains inactive

## 1. Complete review — Cycle 1

### 1.1 Authority and ownership — Pass

`applyOperation()` remains unchanged and structural for null. The application
remains the only value/baseline owner; runtime actions emit intentions without
optimistic projection. No operation, presence, snapshot, listener or validator
contract changed.

### 1.2 Direct/deep operations — Pass

Managed direct and deep metadata now retains the validated nullable boolean.
Definition-aware set accepts null only for nullable leaves and preserves the
exact `INCOMPATIBLE_OPERATION_VALUE` envelope for scalar leaves. Address,
managed-path, compatibility, ancestor, expectation, stale, rebuild and
no-effect order remains unchanged.

### 1.3 Collection operations — Pass

Managed template metadata retains nullable. Item-relative set accepts null only
for nullable leaves; scalar leaves preserve
`INCOMPATIBLE_COLLECTION_OPERATION_VALUE` with `reason: 'leaf-type'` and its
existing operation, field and type parameters. Identity and collection
structural behavior is unchanged.

### 1.4 Strict transitions — Pass

Focused evidence covers set-to-null, `Object.is` null expectations, null/null
no-effect, stale rejection, remove-null-to-missing, missing-ancestor
materialization and incompatible-ancestor blocking for direct/deep and
collection paths. Rebuilt values and unchanged error/no-op inputs preserve the
existing immutable/reference behavior.

### 1.5 Runtime and validation — Pass

Runtime requests accept nullable null and emit exactly one frozen existing
operation; confirmed null is a no-op. External null remains controlled data,
external updates emit no operation, missing/null/empty/false remain distinct,
and dirty comparison remains exact. The external validator receives the exact
original schema identity and remains the only business-validation authority.

### 1.6 Public/deferred boundary — Pass

No public signature, symbol, export, package, Angular production file,
renderer, registration, manifest, dependency, peer, lockfile or version
changed. Angular set-null/status behavior stays inactive until checkpoint 4;
published `0.1.0` remains pre-M14.

## 2. Verification

- Formatting and documentation pass across 97 Markdown files and 441 local
  links after persistent-state reconciliation.
- Lint, typecheck, build, 398 core tests, 76 Angular tests and both package
  smoke suites pass.
- Production diff changes only managed nullable retention and the existing
  compatibility predicates; `git diff --check` passes.

Cycle 1 produced zero findings and no unresolved change request. This complete
pass accepts checkpoint 3 and authorizes checkpoint 4 under the unchanged
Approved plan.
