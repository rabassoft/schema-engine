# PLAN-009 complete review — Cycles 1–2

- **State:** Repeated review 2 passed; PLAN-009 revision 1 explicitly approved
- **Date:** 14 July 2026
- **Reviewed:** proposed
  [`PLAN-009 revision 1`](../plans/009-nested-object-runtime.md)
- **Compared with:** accepted
  [`SPEC-001 v0.1.15`](../specs/001-controlled-form-runtime.md),
  [`SPEC-002 v0.1.2`](../specs/002-nested-object-runtime.md),
  [`ADR-005 revision 1`](../adrs/005-politica-dialecto-json-schema.md),
  [`ADR-007`](../adrs/007-resolucion-renderers-testers.md),
  [`ADR-008`](../adrs/008-instanciacion-renderers-angular.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-014 revision 2`](../adrs/014-modelo-objetos-anidados-paths-profundos.md)
  and the deferred-decision register
- **Authorization:** PLAN-009 revision 1 approved; checkpoints 1–4 subsequently
  completed

## 1. Result

Complete review 1 found four plan-level delivery gaps. PLAN-009 revision 1
closes all four without changing an accepted contract or activating deferred
scope. A fresh complete review 2 then passes every area with zero findings,
requested corrections or documentation conflicts.

At review completion the plan was ready for an explicit approval decision;
review completion alone did not authorize implementation, publication or Stable
API promotion. Ricard subsequently approved revision 1 as recorded in section 5.

## 2. Complete review 1 findings and corrections

### M9-PLAN-F001 — Rejected Angular configuration could split projection state

- **Severity:** High
- **Observed:** The draft rendered `definition.nodes` but did not require that
  definition to be the one committed with the current runtime. A rejected
  runtime replacement could therefore pair new raw-input nodes with the old
  snapshot.
- **Correction:** Root projection now reads only the last successfully accepted
  configuration and switches definition, context, subscription and outlets as
  one committed lifecycle transition. Rejected updates preserve the previous
  coherent tree.

### M9-PLAN-F002 — Finite-depth delivery was incomplete

- **Severity:** High
- **Observed:** Schema traversal used a work stack, but structural UI,
  manual-definition validation and runtime tree walks did not all prohibit
  unbounded JavaScript recursion.
- **Correction:** Revision 1 requires explicit stacks or flat indexes for every
  neutral compiler, definition, external-state, snapshot, reconciliation and
  scope traversal. No arbitrary public depth limit is introduced.

### M9-PLAN-F003 — Angular declaration migration lacked exact evidence

- **Severity:** Medium
- **Observed:** Converting `SchemaFormDirective` to an attribute component was
  proposed but the retained public surface and declaration verification were
  not closed.
- **Correction:** The plan now retains the exact selector, exported class,
  input/output names, injection role and root symbol, and requires declaration,
  package-smoke and clean-consumer evidence. No separate public component is
  added.

### M9-PLAN-F004 — ID and object-host failure assertions were underspecified

- **Severity:** Medium
- **Observed:** Existing leaf suffixes were referenced but not enumerated, and
  object-host failure coverage did not name its complete accepted observable
  contract.
- **Correction:** Revision 1 lists all six leaf suffixes and requires exact
  locator, path, reason/fallback, order, isolation and thrown-value safety for
  both creation and required-binding failure.

## 3. Repeated complete review 2 matrix

| Review area                          | Result | Evidence                                                                                                                                                                |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authority and authorization          | Pass   | Accepted SPEC/ADR versions are exact; Proposed state and separate explicit approval gate are repeated.                                                                  |
| Scope and deferred boundary          | Pass   | Inline objects plus existing leaves only; arrays, refs, composition, layout, batches, dynamic definitions, publication and Stable promotion remain excluded.            |
| Public API migration                 | Pass   | Every SPEC-002 new/changed Public contract is mapped; Internal Angular additions and unchanged entry points are explicit.                                               |
| Compiler and UI delivery             | Pass   | Descriptor-safe iterative traversal, active-ancestry cycles, ordering, paths, branch isolation, immutability and projection identity are implementable and testable.    |
| Manual definitions and operations    | Pass   | One safe iterative validator, exact defect order, string-only leaf targeting, materialization, descriptors, prototypes, expectations and atomicity are closed.          |
| Runtime state and actions            | Pass   | Presence, dirty ownership, issue assignment, sharing, focus/touched, blocked actions, scopes and controlled confirmation remain neutral and exact.                      |
| Angular projection and accessibility | Pass   | Accepted runtime/definition coupling, Internal recursive outlets, fixed fieldsets, text, exact IDs, blocked behavior, isolation and deterministic teardown are covered. |
| Test and conformance matrix          | Pass   | All 15 SPEC-002 scenarios map to fixtures/programmatic tests; hostile objects, identities, declarations and consumers have explicit evidence.                           |
| Package and compatibility            | Pass   | Both root entry points, exact Angular peer range, private `0.1.0`, artifact allowlist and lower/upper clean consumers are preserved.                                    |
| Implementation checkpoints           | Pass   | Seven ordered checkpoints isolate core contracts, compiler, operations, runtime, Angular, packaging and final verification.                                             |
| Verification and fixture safety      | Pass   | Full repository matrix, read-only final pass, declaration/export/diff/link guards and reviewed fixture regeneration are objective.                                      |
| Completion and stop conditions       | Pass   | Failures, contract changes, new exports/dependencies, depth limits and deferred scope force a stop instead of silent expansion.                                         |

## 4. Acceptance-criteria replay

1. Every SPEC-002 scenario has concrete implementation and evidence: **Pass**.
2. Compiler, operations, runtime and Angular have independently verifiable
   checkpoints: **Pass**.
3. Public Experimental migrations and Internal-only additions are explicit:
   **Pass**.
4. Controlled state and framework neutrality are preserved: **Pass**.
5. Diagnostic, descriptor, cycle, sharing and lifecycle tests are exact:
   **Pass**.
6. Repository, package and clean-consumer migrations are complete: **Pass**.
7. Deferred, publication and dependency boundaries are preserved: **Pass**.
8. Implementation and stop conditions are objective: **Pass**.
9. The repeated full review finishes with zero findings: **Pass**.

## 5. Recommendation and next gate

Ricard explicitly approved PLAN-009 revision 1 on 14 July 2026. M9 may start
only at checkpoint 1 under the plan's exact scope. Approval did not itself
start implementation, publish artifacts, change dependencies or promote APIs.
