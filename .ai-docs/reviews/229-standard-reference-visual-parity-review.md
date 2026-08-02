# Standard reference visual parity review — Cycle 2

- **Date:** 2026-08-02
- **Scope:** Standard first-level disclosures and dark editor/code selection
- **Outcome:** Cycle 2 passed with zero findings

## Review history

Cycle 1 found that Standard CodeMirror still used syntax colors intended for a
light surface, leaving some JSON tokens too dark inside the new dark selection.
A Standard-owned theme was added and the complete review repeated.

## Complete review

Cycle 2 verifies:

- Scenario, Interactive consumer, Schemas and Observable evidence are four
  independent native `details`/`summary` regions, open by default;
- collapsing one first-level region leaves its siblings visible and preserves
  the mounted DOM, editor, tabs and application state;
- editable JSON selection uses the theme-aware color `#2b3852` in dark mode;
- highlighted read-only code uses the same stable dark selection color through
  native `::selection`;
- Standard owns its JSON syntax theme and uses its own theme variables, without
  importing or sharing Angular implementation;
- selected backgrounds remain distinct from editor surfaces while JSON and
  code tokens stay legible;
- unit evidence covers all four reversible disclosures, CSS selection rules
  and highlighted JSON; Chromium covers independent collapse plus computed JSON
  and code selection colors; and
- formatting, strict types, all 55 Standard tests, eight snippet checks, the
  production build, all seven Standard Chromium tests, documentation and diff
  hygiene pass.

The production build retains the known Vite chunk-size advisory. It remains an
observation, not a finding.

## Result

Zero findings and no unresolved change request. Standard now matches the
accepted Angular visual outcomes through an independent DOM/CSS implementation.
No Public contract, dependency, package version or milestone scope changed. No
commit or push occurred.
