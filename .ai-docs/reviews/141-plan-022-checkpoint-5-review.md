# PLAN-022 checkpoint 5 complete review — Cycles 1–3

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-022 revision 0`](../plans/022-recursive-local-presentation-layout.md)
- **Checkpoint:** 5 — Independent Standard projection and shared scenario
- **Authority:** SPEC-009 v0.1.0 sections 10 and 14; ADR-025 revision 0
- **Outcome:** Cycle 3 passed all ten areas with zero findings

## Findings and corrections

| Cycle | ID       | Finding                                                                                                 | Correction                                                                                                         |
| ----- | -------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1     | R141-F01 | Standard reconciled a focused string buffer back to its controlled value during unrelated movement.     | Retained unchanged focused string/select buffers while still reconciling changed controlled presence.              |
| 1     | R141-F02 | The Standard shell disabled embedded item actions for the new scenario, so browser movement was absent. | Enabled the existing embedded collection controls only for `recursive-local-presentation`.                         |
| 2     | R141-F03 | The first buffer correction left a rejected focused string visible until blur.                          | Reconciled the immediate post-intention value explicitly when the application did not confirm the requested value. |

Each correction restarted the complete checkpoint review.

## Review areas

1. **Neutral catalog — Pass.** The private feature and scenario compile through
   the Public compiler and contain the exact ordinary, item-root and nested
   template owners, excluded identity and two stable items.
2. **Shared input — Pass.** Angular native and Standard consume the exact same
   immutable authored schema, UI Schema, controlled state, transitions and copy.
3. **Standard isolation — Pass.** Standard consumes generic core definitions
   directly and imports no Angular, SPI, Aria, component, DOM helper or CSS.
4. **Projection and semantics — Pass.** Local section/tabs/accordion/grid
   recursion preserves fixed labels/actions, roles, names, relationships,
   keyboard behavior, mounted hidden descendants and logical order.
5. **Concrete identity — Pass.** Ordinary, item and nested-template IDs use the
   accepted owner tuples and stable item ID, never collection index.
6. **State and lifecycle — Pass.** Movement retains hosts and local state;
   removal disposes listeners/bindings, same-ID reinsertion is fresh and invalid
   identity projects no item descendants.
7. **Text — Pass.** Standard's private WeakMap resolves each exact static
   presentation definition once per locale and safely falls back.
8. **Controlled behavior — Pass.** Value, baseline, operations, validation and
   ownership remain application/core controlled; focused buffers and rejected
   intentions both reconcile correctly.
9. **Reference parity — Pass.** Native Angular and Standard unit/DOM/Chromium
   evidence covers the same local owners, exact IDs, movement and retained state.
10. **Boundary/regression — Pass.** Snippets and target boundaries remain exact;
    prior scenarios, builds and browser suites remain green.

## Verification

- Scenario catalog: 2 files, 41 tests pass; production build passes.
- Standard strict types/build: pass; 7 files, 53 tests pass.
- Angular reference strict types/build: pass; 4 files, 26 tests pass.
- Standard Chromium: 6 tests pass after the complete correction/review restart.
- Angular native Chromium: 8 tests pass after the complete correction/review restart.
- Reference snippets: 8 excerpts across 2 targets pass.
- Angular's existing bundle/Ajv warnings and Standard's existing chunk advisory
  remain non-blocking observations.

## Outcome

Checkpoint 5 is complete with zero findings. Checkpoint 6 may now prove the
existing Angular Aria registrations over the widened local-owner domain without
changing their provider, export, dependency, peer or style surface.
