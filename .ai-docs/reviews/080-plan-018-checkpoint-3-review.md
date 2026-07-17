# PLAN-018 checkpoint 3 review — Cycles 1–2

- **Date:** 2026-07-17
- **Scope:** Stable normalized DOM projection for primitive fields, nested
  objects, static presentation groups and nullable leaves
- **Authority:** Approved PLAN-018 revision 0 checkpoint 3 and Accepted ADR-021
  revision 0
- **Outcome:** Cycle 2 passed with zero findings

## Cycle 1 findings and corrections

The initial focused suite exposed test selectors that treated canonical Public
field keys as authored names and one stale expected catalog section label. The
tests now select the shell's explicit field-name evidence while the binding
registry continues to key by canonical normalized keys. The same review changed
enum interaction to native `change`, retained trailing-decimal text such as
`1.` as incomplete input and added explicit empty-string, zero, missing and
localized-number evidence. Cycle 1 cannot support checkpoint completion.

## Cycle 2 complete review

1. **Normalized authority:** Pass. The renderer receives only Public
   `FormDefinition`, `FormRuntime` and snapshots. It never receives or reads raw
   JSON Schema/UI Schema, catalog transitions or Angular-owned behavior.
2. **Stable projection:** Pass. Semantic form, section, fieldset and field DOM
   is built once per definition. A canonical-key binding registry reconciles
   snapshots in place without emitting operations or replacing unaffected
   controls.
3. **Primitive intentions:** Pass. Labelled text, enum, number/integer and
   boolean controls call only Public intention/focus/blur methods. Clear remains
   explicit and available for present required values; missing and empty string
   remain distinct.
4. **Numeric codec:** Pass. The private shell codec accepts only complete finite
   localized numbers, enforces integers, preserves incomplete/rejected focused
   buffers and restores confirmed localized display on blur.
5. **Nullable and presentation behavior:** Pass. Explicit null/missing actions
   and presence evidence distinguish null, false, empty string and zero. Nested
   objects and static normalized presentation groups use semantic fieldsets and
   labelled sections without changing paths or value shape.
6. **Accessibility and cleanup:** Pass. Native labels, descriptions, hints,
   required/invalid state, described-by issue lists and semantic grouping are
   present. Every listener is removed idempotently with its binding/renderer;
   disposed controls cannot deliver operations.
7. **Regression and diff:** Pass. Formatting, lint, strict core/catalog/Angular/
   Standard types, 16 Standard tests, 400 core tests, 79 Public Angular tests,
   35 catalog tests, 23 Angular-reference tests, 11 boundary-verifier tests and
   388 imports pass. Standard builds at 192.86 kB; unchanged Angular remains
   943.08 kB plus its 143.11 kB lazy chunk. Public source/manifests/exports/
   versions have no diff and the unrelated `angular.json` change stays outside
   the checkpoint.

## Outcome

Checkpoint 3 is complete after a full zero-finding pass. Checkpoint 4 may extend
the same stable registry to normalized collections and all six interactive
scenarios. No commit, push, publication, browser download, hosting or external
setting changed.
