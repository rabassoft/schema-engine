# Standard reference parity maintenance review — Cycles 1–3

- **Date:** 2026-07-18
- **Authority:** Accepted ADR-021 revision 1 and completed PLAN-018 revision 1
- **Scope:** Private Standard reference experience only; no Public contract,
  SPEC, ADR, promoted capability or milestone change
- **Outcome:** Cycle 3 passed all ten areas with zero findings

## Findings and corrections

| Cycle | ID       | Finding                                                                                                                          | Correction                                                                                                                      |
| ----- | -------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1     | R096-F01 | The new CSS-token parity test escaped hyphens in Unicode regular-expression mode and failed before comparing the duplicated CSS. | Read the literal custom-property names directly; the complete Standard unit suite then passed 47/47.                            |
| 2     | R096-F02 | Strict lint rejected unsafe `Reflect.get` assignments used to count and assert stable-team members.                              | Narrowed the owned root with the `in` operator and retained explicit array validation before access.                            |
| 2     | R096-F03 | The boundary fixture contained the five approved Standard CodeMirror imports but still expected the pre-checkpoint count of 17.  | Updated the fixture expectation to 22; the verifier still reports the unchanged repository total of 431 inspected import edges. |

## Cycle 3 complete review

1. **Authority and scope:** Pass. This is private post-M16 experience
   maintenance under ADR-021; no architecture, Public behavior, SPEC, release
   artifact, deferred capability or milestone changed.
2. **Target independence:** Pass. Standard owns its DOM, application state,
   labels and CSS. It imports no Angular code and shares no component,
   template, controller state or stylesheet with Angular.
3. **Visible hierarchy and controls:** Pass. Standard independently presents
   the theme in the header, a contrasted Application controls group, button
   state for locale/visibility and a separate Confirm/Reject/Pending decision
   fieldset matching Angular's visible labels.
4. **Stable-team interaction:** Pass. The app-owned Team collection controls
   use the same ordered labels and aggregate actions as Angular. They invoke
   only Public runtime intentions; the generic normalized renderer retains its
   separately tested embedded controls for other consumers.
5. **Visual parity:** Pass. The independent Standard stylesheet duplicates the
   Angular semantic color, state, radius and shadow values, plus matching
   control/card roles, light/dark behavior, responsive stacking and focus
   treatment.
6. **Drift prevention:** Pass. A test-only parity matrix checks all requested
   visible labels and nineteen mapped semantic token values across the two
   independently owned sources, which ADR-021 explicitly permits.
7. **Accessibility and lifecycle:** Pass. Native fieldsets/legends, labelled
   inputs, `aria-pressed`, disabled aggregate actions, theme association,
   responsive reflow and deterministic disposal remain covered.
8. **Regression evidence:** Pass. Standard unit/DOM passes 47/47 and Chromium
   passes 6/6 across scenarios, decisions, collections, editable schemas/Ajv,
   tabs/copy/themes, 390 px, 200% zoom and repeated replacement.
9. **Architecture and static checks:** Pass. Strict types, scoped lint,
   formatting, 12/12 boundary fixtures, 431 repository import boundaries and
   `git diff --check` pass.
10. **Isolation and delivery controls:** Pass. No Public or Angular source was
    changed by this maintenance, the unrelated user-owned `angular.json`
    analytics value remains untouched, and no commit, push, publication or
    external setting mutation occurred.

## Result

Cycle 3 repeated the complete applicable review after all corrections and
produced zero findings with no unresolved change request. The private Standard
reference now shows the requested Angular-equivalent text, control hierarchy
and visual language while preserving ADR-021's independent implementations. No
implementation task remains.
