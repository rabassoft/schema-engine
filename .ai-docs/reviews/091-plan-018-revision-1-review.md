# PLAN-018 revision 1 complete review — Cycles 1–3

- **Date:** 2026-07-18
- **Document:**
  [`PLAN-018 proposed revision 1`](../plans/018-standard-dom-reference-shell.md)
- **Authority:** Accepted ADR-021 revision 1, review 090, ADR-020, ADR-022,
  SPEC-001 through SPEC-007, completed PLAN-017/PLAN-019 and D-046/M16
- **Outcome:** Cycle 3 passed all fourteen areas with zero findings
- **Formal decision:** Approved by Ricard on 2026-07-18

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                                         | Correction                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R091-F01 | The plan selected five new direct Standard dependencies but did not explicitly revise the verifier that currently rejects them. | Checkpoint 5 now requires the exact Standard allowlist/fixtures and retains rejection of frameworks, undeclared CodeMirror transitives and other dependencies. |
| R091-F02 | The Standard snippet extension did not close exact marker IDs or its generated target, leaving extractor scope ambiguous.       | Checkpoint 6 now fixes five `standard-*` IDs, the generated module path and byte-preservation of Angular's current IDs/output.                                 |
| R091-F03 | The unqualified `Approval date` could be read as approval of proposed revision 1 rather than historical revision 0.             | Renamed the field to `Revision 0 approval date`; revision 1 remains explicitly Proposed and unapproved.                                                        |

## Cycle 3 complete review

1. **Authority and revision model:** Pass. Accepted ADR-021 revision 1 is the
   sole new scope authority; revision 0 checkpoints 1–4 remain completed and
   checkpoint 5 cannot resume until revision 1 receives approval.
2. **Promoted scope:** Pass. Only D-046/M16 private Standard experience and
   configuration parity is delivered; no Public or future-target capability is
   activated.
3. **Exact dependencies:** Pass. Five exact modules already in the frozen graph
   are selected behind a separate mutation gate, with importer-only expected
   changes and stop conditions for graph drift.
4. **Private target boundary:** Pass. Editor, highlighting, tabs, state and CSS
   remain Standard-owned; Angular/shared controller/component/style imports are
   forbidden.
5. **Configuration ownership:** Pass. Immutable original, copied active input,
   exact drafts/result identity and runtime epoch are closed without catalog
   mutation or persistence.
6. **Validate semantics:** Pass. Independent JSON parsing, one Public compile,
   unchanged diagnostics and zero active/runtime/root mutation match the
   accepted Angular reference behavior.
7. **Apply/Restore lifecycle:** Pass. Fresh compilation, stale prevention, loss
   confirmation, active-schema Ajv, exact teardown and complete scenario-state
   reset are required.
8. **Cancel/Reset/selection:** Pass. Draft rollback, active-configuration reset,
   original restoration and scenario replacement have distinct scopes and
   no-effect/stale-state rules.
9. **D-013 isolation:** Pass. No live definition update, schema/value migration,
   generated defaults or old operation-state preservation is introduced.
10. **Workspace parity:** Pass. Simultaneous preview/configuration, all five
    evidence tabs, target snippets, syntax/copy and sober themes are exact while
    pixel/DOM identity remains a non-claim.
11. **Accessibility and responsiveness:** Pass. Editor/tab semantics, keyboard
    model, names/status/focus, hidden-panel isolation, 390 px/200% reflow and
    reduced motion receive unit/DOM and Chromium evidence.
12. **Tooling and snippets:** Pass. Boundary allowlists/negative fixtures plus
    exact multi-target snippet IDs, target path, Angular byte preservation,
    idempotence and stale/failure behavior are closed.
13. **Regression and release isolation:** Pass. Both shells, all scenarios,
    packages, artifacts, source rebuilds, security and clean consumers remain
    independently authoritative and Public/release surfaces stay unchanged.
14. **Delivery controls:** Pass. Four remaining checkpoints, focused/full gates,
    complete repeated final review, persistent-state duties and every external,
    dependency, Git and publication stop condition are explicit.

## Result

Cycle 3 repeated all fourteen areas after correcting R091-F01 through R091-F03
and produced zero findings with no unresolved change request. Ricard formally
approved PLAN-018 revision 1 on 18 July 2026. Checkpoints 5–8 are authorized;
the exact dependency mutation, browser action, commit, push and every external
mutation retain separate gates.
