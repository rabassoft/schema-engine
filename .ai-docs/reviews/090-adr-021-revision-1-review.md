# ADR-021 revision 1 complete review — Cycles 1–3

- **Date:** 2026-07-17
- **Document:**
  [`ADR-021 proposed revision 1`](../adrs/021-shell-standard-dom-core-directo.md)
- **Authority:** Accepted ADR-021 revision 0, ADR-020, PLAN-017, ADR-022,
  SPEC-007, D-013 and the D-046/M16 boundary
- **Outcome:** Cycle 3 passed all twelve areas with zero findings
- **Formal decision:** Accepted by Ricard on 2026-07-18

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                                                   | Correction                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| R090-F01 | The proposed workspace parity list named State, Integration and Diagnostics but omitted Angular's maintained Definition and Runtime tabs. | Required evidence now names all five tabs: State, Definition, Runtime, Diagnostics and Integration. |
| R090-F02 | The amendment depended on ADR-022/SPEC-007 and preserved D-013, but the ADR header did not name those authorities.                        | Added SPEC-007 and ADR-022 to `Requires`, and D-013 to `Related deferred decisions`.                |

## Cycle 3 complete review

1. **Promoted scope:** Pass. The amendment changes only private Standard-shell
   experience inside D-046/M16; React, Vue, legacy Angular and other deferred
   targets are not admitted.
2. **Revision authority:** Pass. Accepted revision 0 remains authoritative;
   revision 1 is explicitly non-authoritative until formal acceptance and
   cannot bypass a revised, completely reviewed PLAN-018.
3. **Cross-target parity:** Pass. The same scenario workflow, simultaneous
   preview/configuration workspace, all five evidence tabs, snippets, copy and
   themes are required without pixel or DOM identity.
4. **Target independence:** Pass. Standard owns DOM, lifecycle, controller,
   editor and CSS; no Angular imports, shared UI abstraction, style package or
   framework wrapper is introduced.
5. **Editor boundary:** Pass. Direct private CodeMirror 6 provides JSON editing
   and highlighting; the revised plan must close exact dependencies and
   lifecycle evidence before any mutation.
6. **Configuration state:** Pass. Original, active, draft, result and runtime
   epoch ownership matches the accepted Angular reference semantics without
   catalog mutation or persistence.
7. **Transitions:** Pass. Validate, Apply, Cancel, Restore and Reset have
   distinct, exact effects; Apply and Restore reparse/recompile and replace the
   complete runtime after any required loss confirmation.
8. **Dynamic-definition boundary:** Pass. No live definition update,
   schema/value reconciliation, defaults or history preservation is added;
   D-013 remains Deferred.
9. **Validation authority:** Pass. Public compilation gates runtime creation;
   the reusable Ajv validator receives active schema and does not validate UI
   Schema or widen compiler support.
10. **Accessibility and evidence:** Pass. Keyboard/focus, responsive reflow,
    editor/copy status, cleanup and edited-property validation receive focused
    unit/DOM and independent Chromium evidence without certification claims.
11. **Public/release isolation:** Pass. No Public package, export, diagnostic,
    version, artifact, hosting, publication or compatibility claim changes.
12. **Documentation consistency:** Pass. The amendment explicitly identifies
    the conflicting PLAN-018 revision 0 clauses and requires plan revision
    before checkpoint 5 resumes; the accepted baseline remains legible.

## Result

Cycle 3 repeated the full twelve-area review after correcting R090-F01 and
R090-F02, and produced zero findings with no unresolved change request. Ricard
formally accepted ADR-021 revision 1 on 18 July 2026. The decision authorizes
only PLAN-018 revision 1 preparation and complete review; it authorizes no
implementation, dependency mutation, commit, push or external action.
