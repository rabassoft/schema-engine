# Review 337: Reference Application Usability Corrections

- **Date:** 2026-08-04
- **Scope:** Angular and Standard reference applications only
- **Contract impact:** None; no Public API, normalized definition, runtime,
  operation, dependency, package, version or release change
- **Result:** Cycle 2 passed with zero findings

## 1. Reviewed observations

1. Primitive labels remain visible and boolean controls place checkbox, label
   and clear action on one visual row.
2. Visible validation issues use the same danger color for the control border
   and message.
3. Native accordion triggers expose a persistent `aria-expanded` state and a
   visible `+`/`−` indicator in Angular and Standard, including recursive
   presentation.
4. RFC 3339 `date-time` values remain exact text, preserving date, time and
   timezone as required by SPEC-010; the scenario now explains `Z`/UTC rather
   than presenting a lossy time-only control.
5. Primitive fixed values render as explicit label/value rows and the scenario
   explains value, missing, unavailable and incompatible states. The initial
   compatible fixture now supplies the compatible boolean value so the
   incompatible state appears only when that control is selected.
6. Controlled service validation identifies its deterministic fake-service
   purpose, explains request statuses and states explicitly that settlement
   changes validation evidence rather than form value.
7. Scoped baseline confirmation explains that acceptance changes only
   `baselineValue`. Accepted evidence retains the exact candidate so the effect
   remains inspectable while form `value` intentionally stays unchanged.
8. Conditional-state authoring now explains the existing sources and targets
   using accepted descriptions and hints. No reverse dependency graph,
   renderer icon contract or user-selectable hide/disable policy was added:
   those would exceed SPEC-016/SPEC-018 and remain behind D-018 promotion.
9. The redundant collapsible tooltip for Assigned roles is now direct
   supporting text.
10. The object-alternative scenario and browser evidence make dormant inactive
    values explicit. `lives: 9` remaining in application-owned State after Dog
    selection is the required SPEC-019 behavior, not a data leak or stale
    renderer value.

## 2. Review cycles

### Cycle 1

The complete implementation review found two presentation issues:

- Standard retained its generic grid gap between an expanded accordion header
  and region, weakening the expansion-panel relationship.
- One conditional hint said a condition was currently true even while its
  target could remain rendered but disabled after the condition became false.

Both were corrected. Standard now joins header and body while retaining spacing
between panels, and the hint states the invariant condition neutrally.

### Cycle 2

The complete applicable review was repeated after both corrections and found
no errors, ambiguities, contract conflicts or unresolved change requests.

## 3. Verification

- Reference scenario tests: 2 files, 78 tests passed.
- Angular package tests: 19 files, 151 tests passed.
- Angular reference tests: 4 files, 34 tests passed.
- Standard reference tests: 7 files, 76 tests passed.
- Angular Chromium: 20/20 passed after a successful production build; initial
  bundle remains 1.24 MB with only the known Ajv CommonJS warning.
- Standard Chromium: 17/17 passed after a successful production build; only
  the known Vite chunk-size advisory remains.
- Reference snippets: 8 across 2 targets verified.
- Reference boundaries: 745 import boundaries verified.
- ESLint, Prettier, documentation checks and `git diff --check` passed.
- Manual browser inspection confirmed visible first labels, exact boolean-row
  alignment, matching danger colors, `+`/`−` accordion state, readable fixed
  rows and retained accepted baseline-candidate evidence in both targets.

## 4. Conclusion

The bounded reference usability repair is complete with zero findings. Existing
SPEC-010, SPEC-011, SPEC-012, SPEC-013, SPEC-016, SPEC-017, SPEC-018 and
SPEC-019 behavior remains authoritative. A generic conditional dependency
guidance mode requires a separate D-018 promotion and is not an implementation
blocker for this repair.
