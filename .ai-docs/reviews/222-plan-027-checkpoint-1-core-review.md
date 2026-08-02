# PLAN-027 checkpoint 1 core review — Cycles 1–5

- **Date:** 2026-08-02
- **Scope:** Public primitive fixed-value contract, compiler, manual definitions,
  controlled-state invariance, declarations and package smoke
- **Outcome:** Cycle 5 passed with zero findings

## Findings and corrections

| Cycle | Finding                                                                                                  | Correction                                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1     | The historical unsupported-keyword fixture still expected primitive `const` compilation to fail.         | Replace it with a positive primitive-`const` fixture and repeat the complete core suite.                                      |
| 2     | Manual string coherence used ordinary array iteration after validation instead of descriptor-safe reads. | Traverse every choice through its own data descriptor, then repeat the complete contract, implementation and evidence review. |
| 3     | The newly added checkpoint review did not satisfy repository Markdown formatting.                        | Format the review and repeat the complete checkpoint verification matrix.                                                     |
| 4     | Focused evidence did not explicitly map coexistence and schema-derived-UI ordering/branch-stopping rows. | Add exact fixtures for both rows and repeat the complete checkpoint verification matrix.                                      |

## Cycle 5 — complete zero-finding pass

Cycle 5 verifies:

- root-exported `PrimitiveFixedValue`, optional primitive-only `fixedValue` and
  the three accepted `FieldTextMember` additions in source and declarations;
- exact direct, nested, template and local-reference compilation, including
  null, false, zero, negative zero, empty string and immutable own output;
- descriptor-safe invalid-value diagnostics, container/identity exclusion,
  reference/template provenance and valid-only string `const`/`enum`
  coherence;
- iterative manual-definition defects, existing-before-fixed precedence and
  exact operation/runtime envelopes without calling validation on a defective
  definition;
- unchanged controlled-state ownership: neither operations, runtime creation,
  snapshots nor emitted intentions insert, repair or enforce `fixedValue`;
  and
- formatting, strict types, build, all 471 core tests, package smoke,
  documentation links and scoped diff hygiene.

## Result

Zero findings and no unresolved change request. PLAN-027 checkpoint 1 is
complete. Checkpoint 2 remains the exact next action. No dependency, package
version, release, publication, commit, push or external state changed.
