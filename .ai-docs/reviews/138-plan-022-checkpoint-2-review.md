# PLAN-022 checkpoint 2 complete review — Cycles 1–2

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-022 revision 0`](../plans/022-recursive-local-presentation-layout.md)
- **Checkpoint:** 2 — manual definitions and runtime invariance
- **Authority:** SPEC-009 v0.1.0 section 8 and ADR-025 revision 0
- **Outcome:** Cycle 2 passed all eight areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                          | Correction                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| R138-F01 | Presentation validation continued into local forests after an earlier non-presentation structural defect.        | Restored accepted shape precedence: the presentation phase now begins only after the structural phase has no defect. |
| R138-F02 | Repository-authored manual object/item/template definitions lacked their newly required exact default forests.   | Migrated every typed core fixture and conformance rehydrator using the same direct-child object identities.          |
| R138-F03 | Operation conformance rehydrated only the root forest, so valid nested fixtures failed before target validation. | Rehydrated ordinary, item-root and template-object forests iteratively before executing the operation fixture.       |

## Review areas

1. **Owner selection — Pass.** Root is selected first, then ordinary owners in
   structural preorder, item roots before template children and template
   objects before their descendants.
2. **Closed defect vocabulary — Pass.** No reason was added; local malformed,
   missing, key, ID, cycle, span and membership defects reuse accepted reasons.
3. **Local numeric paths — Pass.** `presentationIndexPath` remains numeric and
   local to the selected forest.
4. **Owner context — Pass.** Non-root defects add only exact frozen owner kind,
   owner path and optional template path; root defects remain unchanged.
5. **Identity and keys — Pass.** Validation requires exact direct-child object
   identity and exact owner-qualified static key formulas.
6. **Precedence and non-invocation — Pass.** Earlier structural defects retain
   precedence; the first selected presentation defect prevents validators,
   operations and target accessors.
7. **Runtime invariance — Pass.** Full runtime, collection, operation, scope,
   validation, nullable and conformance regressions pass without snapshot,
   value, baseline, issue or identity contract changes.
8. **Boundary — Pass.** No Angular/Standard production, dependency, version,
   release, Git or external action occurred.

## Verification

- Core TypeScript and build: pass.
- Core package smoke: pass.
- Complete core suite after correction and full-review restart: 26 files, 453
  tests pass.
- Runtime/operation non-invocation and frozen-context assertions: pass.
- `git diff --check`: pass.

## Outcome

Checkpoint 2 is complete with zero findings. Checkpoint 3 may now widen only
the accepted Angular generic container domains and introduce Internal owner
projection context; object/item templates must not switch projection until
checkpoint 4.
