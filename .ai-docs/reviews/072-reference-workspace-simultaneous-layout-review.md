# Reference workspace simultaneous-layout review — Cycles 1–2

- **Date:** 2026-07-17
- **Scope:** Private Angular reference-shell relationship between Form preview
  and Schema/UI Schema editing
- **Authority:** Accepted ADR-020 revision 0 and completed PLAN-017 revision 0;
  no Public contract or deferred capability is promoted
- **Supersedes:** Only the mutually exclusive Form preview/Schemas layout
  recorded by review 071; its highlighting and copy outcomes remain current
- **Outcome:** Cycle 2 passed with zero findings

## Cycle 1 finding and correction

Review 071 grouped Form preview and Schemas as mutually exclusive outer tabs.
That reduced vertical expansion but prevented a consumer from editing a schema
while directly observing the current form. The outer tabs and their application
state were removed. The workspace now renders two simultaneous semantic
regions: Form preview and application controls on the left, Schema/UI Schema
tabs, actions, diagnostics and editor on the right. Observable Evidence remains
an independent region below both columns.

At viewport widths up to 70 rem the grid becomes one column, preserving Form
preview before Schemas in document order. This responsive fallback does not
reintroduce hidden workspace state and retains the two meaningful tab sets:
Schema documents and Evidence views.

## Cycle 2 complete review

- **Authority and boundaries:** Pass. The correction is private shell layout
  and test maintenance only. Public source, manifests, exports, packages and
  accepted contracts are unchanged; D-045 remains Deferred.
- **Wide layout:** Pass. Browser inspection and Chromium geometry assertions
  confirm Form preview is left of Schemas. A scrolled visual review shows the
  active form and JSON editor simultaneously, with Evidence below the complete
  workspace.
- **Editing workflow:** Pass. Invalid, cancelled, validated, applied and
  restored schema drafts execute while the form remains mounted and visible.
  Applying the edited schema immediately replaces the previewed runtime as
  previously specified.
- **Responsive/accessibility:** Pass. At 390 px and 200% zoom the regions stack
  without page-level horizontal overflow. Schema and Evidence tab keyboard
  behavior, focus, labels and editor access remain intact.
- **Regression:** Pass. Formatting, lint, strict app types, 22 Angular-reference
  tests, 35 neutral-catalog tests, three generated snippets, the official
  939.81 kB production build with its unchanged 142.74 kB lazy syntax-viewer
  chunk, and Chromium 7/7 pass. Reference boundaries and Public-isolation
  searches remain clean.

## Decision

The simultaneous Form preview/Schemas layout is accepted as the current private
reference-shell presentation after a complete zero-finding review. PLAN-017
remains historically Completed revision 0. No implementation task, blocker,
commit, push, publication or external-system mutation remains.
