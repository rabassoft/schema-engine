# Reference workspace follow-up review — Cycles 1–2

- **Date:** 2026-07-17
- **Scope:** Private Angular reference-shell hierarchy, Integration syntax
  highlighting and copy affordances requested after completed PLAN-017
- **Authority:** Accepted ADR-020 revision 0 and completed PLAN-017 revision 0;
  no Public contract or deferred capability is promoted
- **Outcome:** Cycle 2 passed with zero findings

## Cycle 1 findings and corrections

1. The separate Interactive consumer and Configuration cards divided the main
   workflow and constrained Schema/UI Schema editing. They were replaced by one
   full-width Consumer workspace with outer `Form preview` and `Schemas` tabs.
   Application controls now precede the form inside `Form preview`; Schema and
   UI Schema retain their independent inner tabs in `Schemas`; Observable
   Evidence remains a separate full-width region below.
2. Integration excerpts used a code treatment without language-aware tokens.
   A read-only CodeMirror viewer now loads exact TypeScript or Angular-template
   language support and is deferred so the syntax tooling remains outside the
   initial application chunk.
3. Code and JSON evidence required manual text selection. Reusable accessible
   copy controls now cover Integration excerpts, editable Schema/UI Schema
   drafts and serialized inspector values, with copied/failed live feedback.
4. The first static syntax-viewer build exceeded the 1 MB initial budget. Lazy
   loading reduced the final initial chunk to 940.61 kB and isolated the
   142.74 kB code-viewer chunk. One stale browser expectation and the initial
   tab-count assertions were corrected, then the complete applicable review was
   repeated.

## Cycle 2 complete review

- **Authority and boundaries:** Pass. Changes remain entirely in the private
  Angular shell and its exact dependency/prebundle boundary. Public source,
  manifests, exports and behavioral contracts are unchanged; D-045 remains
  Deferred.
- **Information architecture:** Pass. Visual and semantic inspection confirms
  one full-width Consumer workspace, mutually exclusive Form preview/Schemas
  views, controls above the form, and Observable Evidence below.
- **Highlighting and copy:** Pass. TypeScript and Angular-template excerpts
  expose language-specific token colors and exact clipboard content. Editable
  JSON copies current draft text; inspectors copy their serialized evidence.
- **Accessibility and state:** Pass. Nested tab sets retain deterministic
  relationships and keyboard behavior; copy status is announced; switching
  workspace views preserves controlled scenario and editor state.
- **Regression and isolation:** Pass. Formatting, lint, strict app types, 22
  Angular-reference tests, 35 catalog tests, three generated snippets, 359
  reference import boundaries, nine boundary-verifier tests, the official
  production build and Chromium 7/7 pass. Narrow and 200% reflow remain covered.
- **Visual review:** Pass. Real browser inspection confirms the wide-layout
  hierarchy, full-width schema editor, separate Evidence card, visible syntax
  colors and copy actions without clipping or horizontal page overflow.

## Decision

The requested private-shell corrections are complete after a full zero-finding
review. PLAN-017 remains historically Completed revision 0; this follow-up does
not revise its approved contract. No implementation task, blocker, commit,
push, publication or external-system mutation remains.
