# Reference workspace sober-theme review — Cycles 1–2

- **Date:** 2026-07-17
- **Scope:** Private Angular reference-shell visual tokens, theme preference and
  CodeMirror presentation
- **Authority:** Accepted ADR-020 revision 0 and completed PLAN-017 revision 0;
  no Public contract or deferred capability is promoted
- **Outcome:** Cycle 2 passed with zero findings

## Decision

Use a small custom visual layer rather than Pico CSS, Simple.css or another CSS
framework dependency. The shell defines semantic primary, secondary, surface,
text, border, focus, success, warning, danger and syntax tokens. Native
`color-scheme` plus `light-dark()` provides one token definition for automatic
system preference and forced Light/Dark modes. The application owns a visible
`Auto / Light / Dark` selector and deliberately does not persist it.

The presentation removes the gradient background, strong category accents,
decorative LAB/OBS markers and deep card shadows. Cards, nested surfaces,
forms, tabs and statuses use one restrained slate/indigo system; semantic
success, warning and danger colors remain reserved for actual state.

## Cycle 1 finding and correction

The first dark-mode pass correctly themed the application and CodeMirror
surfaces, but CodeMirror's fallback syntax colors remained intended for a light
canvas. Dark red strings and green numbers lacked sufficient practical
contrast. A shared `HighlightStyle` now consumes explicit syntax tokens for
properties, strings, literals, keywords, names, comments and invalid content.
The already-resolved `@codemirror/language` and `@lezer/highlight` packages are
declared as exact direct private dependencies; no new lock graph or Public
dependency was introduced.

## Cycle 2 complete review

- **Light theme:** Pass. Neutral background, shallow surfaces, consistent
  borders and indigo interaction states remain legible without decorative
  color noise.
- **Dark theme:** Pass. Background, surfaces, text, inputs, tabs, status panels
  and editable JSON switch coherently. Browser inspection confirms the custom
  blue, rose and green syntax tokens remain distinct and readable.
- **Automatic preference:** Pass. `Auto` removes the forced document attribute
  and delegates to the operating-system color scheme; Light and Dark set an
  explicit document mode. No storage, cookie or persistence scope is added.
- **Accessibility/responsive behavior:** Pass. Existing focus indicators,
  semantic status labels, 390 px layout and 200% reflow remain intact. Theme is
  exposed through a labelled native select and color remains non-exclusive.
- **Regression/isolation:** Pass. Formatting, lint, strict app types, 23
  Angular-reference tests, 35 neutral-catalog tests, three snippets, 369 import
  boundaries, nine boundary-verifier tests, the official 943.65 kB production
  build with 143.11 kB lazy code-viewer chunk, and Chromium 8/8 pass. Public
  source, manifests, exports and contracts remain unchanged.

## Outcome

The sober custom theme system is complete after a full zero-finding pass. No
implementation task, blocker, framework CSS dependency, commit, push,
publication or external-system mutation remains.
