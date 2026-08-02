# PLAN-026: Semantic string formats

- **Status:** Completed revision 0
- **Date:** 2026-07-30
- **Approval date:** 2026-07-30
- **Milestone:** M24 — Semantic string formats
- **Requires:** Accepted ADR-027 revision 0 and SPEC-010 v0.1.0
- **Complete review:** [`review 212`](../reviews/212-plan-026-review.md) cycle 2
  passed all fourteen areas with zero findings
- **Implementation authorized:** Yes, checkpoints 1–5 only; release, version,
  publication, commit, push and external mutations remain separate gates
- **Final implementation review:**
  [`review 217`](../reviews/217-plan-026-final-implementation-review.md) cycle 4
  repeated the complete applicable matrix with zero findings

## 1. Goal and boundary

Implement the three SPEC-010 formats across core, the private Ajv validator,
Angular, Standard and the private reference platform without changing package
versions, entry points, peers, controlled state or any other Deferred
capability.

## 2. Checkpoint 1 — Core contract and compiler

1. Add/export `StringSemanticFormat` and optional string-definition member.
2. Normalize selected formats descriptor-safely at every accepted schema
   position; preserve ignored behavior on other node kinds.
3. Add exact diagnostics, manual-definition validation and immutable fixtures.
4. Verify core format/lint/types/build/unit/package boundaries.

## 3. Checkpoint 2 — Official Ajv assertion

1. Add exact development/conformance `ajv-formats@3.0.1` offline from the
   frozen graph and a browser-safe attributed ESM subset.
2. Register only the three parity-tested full formats and enable assertions.
3. Test valid/invalid edge cases, unknown tolerance, issue normalization,
   caching and non-mutation.
4. Verify dependency ownership, declarations and package smoke.

## 4. Checkpoint 3 — Angular and Standard projection

1. Project the accepted input-type table in the generic Angular string
   renderer without changing enum precedence.
2. Project the identical table in Standard without sharing target code.
3. Test exact value emission, nullable/clear behavior and accessibility
   regressions.
4. Run target unit/build/package evidence.

## 5. Checkpoint 4 — Reference evidence

1. Add one neutral semantic-contact scenario with the three formats and valid
   baseline/value evidence.
2. Demonstrate invalid then valid official validation in both shells and expose
   accurate integration text/snippets.
3. Add focused Angular and Standard Chromium assertions.
4. Verify catalog authority, shell isolation and import boundaries.

## 6. Checkpoint 5 — Complete repeated review and closure

1. Run frozen install, format/check, docs, lint, types, recursive tests/builds,
   package/source/security/boundary checks and focused Chromium suites.
2. Inspect dependency, Public declarations, generated artifacts and the full
   scoped diff.
3. Correct every finding and repeat the complete review until one full pass has
   zero findings.
4. Complete PLAN-026/M24, compact STATUS, prepend WORKLOG and record the next
   functional selection gate.

## 7. Stop conditions

Stop for another format, Public validator option, new renderer component,
`datetime-local`, custom parser, contract incompatibility, dependency requiring
network fallback, release/version/publication, destructive action, commit,
push or unresolved authoritative conflict.
