# PLAN-018 checkpoint 4 review — Cycles 1–2

- **Date:** 2026-07-17
- **Scope:** Stable collection interaction and complete six-scenario Standard
  projection
- **Authority:** Approved PLAN-018 revision 0 checkpoint 4 and Accepted ADR-021
  revision 0
- **Outcome:** Cycle 2 passed with zero findings

## Cycle 1 findings and corrections

The first collection review found duplicate item-control IDs and an insertion
draft that assumed the `stable-team` field names `name` and `role`. Item IDs now
scope every control/description/issue ID by collection plus stable identity, and
insertion controls/items derive exclusively from normalized item templates and
the configured identity policy. Removal focus now changes only after confirmed
structural removal. Cycle 1 cannot support checkpoint completion.

## Cycle 2 complete review

1. **Normalized authority:** Pass. Collection and item structure, labels,
   fields, required state and identity policy come only from normalized Public
   definitions and snapshots; no catalog-scenario semantics enter the renderer.
2. **Stable identity:** Pass. Item bindings are keyed by Public item identity.
   Edits and moves retain the same fieldset/control instances; removal disposes
   only the removed item and cannot deliver from detached controls.
3. **Public intentions:** Pass. Item leaf set/remove plus insert/move/remove call
   only Public runtime methods. The application decides emitted operations using
   the checkpoint-2 confirm/reject/pending flow.
4. **Structural behavior:** Pass. Normalized template fields generate generic
   accessible insertion drafts, nested values materialize deterministically,
   move controls preserve identity and confirmed insert/remove manage focus.
5. **Conflict behavior:** Pass. Strict item and collection operations apply
   against the then-current complete root; stale and incompatible pending
   decisions remain atomic and retain exact diagnostics/history.
6. **Scenario/accessibility evidence:** Pass. All six catalog scenarios mount;
   collection item groups, unique labels/IDs, identity diagnostics and controls
   are semantic. Focus requests and removed-listener cleanup are verified.
7. **Regression and diff:** Pass. Formatting, lint, strict core/catalog/Angular/
   Standard types, 25 Standard tests, 400 core tests, 79 Public Angular tests,
   35 catalog tests, 23 Angular-reference tests, 11 boundary-verifier tests and
   389 imports pass. Standard builds at 197.13 kB; unchanged Angular remains
   943.08 kB plus its 143.11 kB lazy chunk. Public source/manifests/exports/
   versions have no diff and the unrelated `angular.json` change stays outside.

## Outcome

Checkpoint 4 is complete after a full zero-finding pass. PLAN-018 checkpoint 5
would normally be next, but the accepted demand for reusable generic JSON
Schema validation requires a separate promotion/architecture/contract plan
before either reference shell consumes it. No commit, push, publication,
browser download, hosting or external setting changed.
