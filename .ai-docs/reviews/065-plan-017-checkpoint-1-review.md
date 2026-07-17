# PLAN-017 checkpoint 1 complete review — Cycles 1–2

- **State:** Complete; cycle 2 passed with zero findings
- **Date:** 17 July 2026
- **Checkpoint:** PLAN-017 checkpoint 1 — Dependency and Internal primitives
- **Authority:** Approved PLAN-017 revision 0 and Accepted ADR-020 revision 0

## 1. Cycle 1 findings

1. **R065-F001 — stale exact boundary allowlist:** the existing private-app
   verifier rejected both newly approved CodeMirror dependencies because it
   still encoded PLAN-016's exact manifest. The allowlist and fixture now admit
   only `codemirror@6.0.2` and `@codemirror/lang-json@6.0.2`; a new negative test
   rejects an additional direct CodeMirror dependency.
2. **R065-F002 — deprecated style escape:** the first editor primitive used
   `::ng-deep` to reach CodeMirror-owned DOM. It now uses explicit unencapsulated
   component styles whose selectors remain prefixed by the Internal editor host.

The complete checkpoint review and focused verification restarted.

## 2. Complete review — Cycle 2

### 2.1 Authority and dependency graph — Pass

Ricard separately authorized the exact PLAN-017 section 3 install. pnpm 10.28.2
added only the two exact MIT-licensed dependencies to the private Angular
manifest and their 17 resolved CodeMirror/Lezer modules to the lockfile. No
Public manifest, source, declaration, export, version or package changed.

### 2.2 Tab primitive — Pass

The Internal standalone tab list exposes deterministic tab/panel IDs, labelled
`tablist`, button tabs, selected state, `aria-controls` and roving `tabindex`.
Click, wrapping Left/Right Arrow and Home/End activation update selection and
focus without a framework-neutral or UI Schema abstraction.

### 2.3 Editor primitive — Pass

One Internal standalone component owns one CodeMirror `EditorView`, JSON
language support, line numbers, wrapping, accessible name/instructions,
controlled external text and user-change output. Programmatic updates do not
echo, focus is exposed locally and Angular destruction destroys the editor.

### 2.4 Browser and style boundary — Pass

CodeMirror remains browser-only inside the private Angular application. Scoped
host-prefixed global selectors style only editor-owned DOM; no SSR, catalog,
Public package or private renderer coupling is introduced.

### 2.5 Tests — Pass

Three focused primitive tests cover exact relationships/selection, the complete
keyboard model, editor labels/gutters, user output, controlled replacement and
lifecycle destruction. The private application now passes 14/14 unit tests;
eight boundary tests include the new dependency rejection case.

### 2.6 Verification and diff — Pass

Frozen install, repository formatting/docs/lint, private typecheck/tests,
boundary tests/check, snippet check, topological core/Angular/catalog build and
official Angular production build pass under the canonical Node 22.23.1.
Twenty manifest targets and 346 imports are verified. `git diff --check` passes;
generated output is ignored and Public projects have no diff.

The first build attempt used Codex Node 24.14.0, below Angular 22's accepted
24.15.0 floor. Repeating the unchanged build with the documented canonical Node
22.23.1 passed; this was an environment mismatch, not a product defect.

### 2.7 Persistent state and authorization — Pass

Only checkpoint 1 is complete. Checkpoint 2 is next under the already Approved
plan. Git, publication, hosting and Public/external mutations remain
unauthorized. The unrelated Angular analytics identifier remains untouched.

## 3. Result

Cycle 2 has zero findings, unresolved requests or documentation conflicts.
PLAN-017 checkpoint 1 is complete and checkpoint 2 may begin.
