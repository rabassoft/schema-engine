# PLAN-020 checkpoint 3 implementation review — Cycles 1–3

- **Date:** 2026-07-18
- **Plan:**
  [`PLAN-020 revision 0`](../plans/020-static-advanced-presentation-layout.md)
- **Scope:** Base Angular presentation-container SPI and mandatory native hosts
- **Authority:** SPEC-008 sections 9–12, ADR-024 revision 1 and PLAN-020
  checkpoint 3
- **Outcome:** Cycle 3 passed all twelve areas and the complete checkpoint gate
  with zero findings

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                                                        | Correction                                                                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| R106-F01 | Installing native container components through the original renderer module created a runtime component-metadata cycle.                        | Split the environment provider and child-render callback from the renderer/outlet graph; all 44 initial metadata failures disappeared.              |
| R106-F02 | Two legacy failure tests still replaced the superseded fixed section factory and therefore no longer exercised the selected SPI host.          | Replaced them with throwing and binding-failing selected renderers and retained exact failure/isolation assertions.                                 |
| R106-F03 | Building every panel label before child projection did not preserve advanced-label depth-first resolution for nested containers.               | Added exact-definition/form/locale label caching and a depth-first preprojection walk; model projection reuses results without repeated resolution. |
| R106-F04 | Initial claims were audited, but later conditional removal/replacement was not invalidated and one panel context remained declaration-visible. | Added audited claim/release lifecycle invalidation, exact-once owner cleanup and a private WeakMap-backed panel context.                            |
| R106-F05 | The packed-artifact inventory and Public declaration gate did not yet include the new authorized Angular modules and nine-symbol surface.      | Extended the exact inventory, root export assertions, outlet-input assertions and Internal non-export checks.                                       |

Cycle 2 repeated the implementation review after F01–F03 and found F04–F05.
All five corrections therefore triggered the complete cycle 3 restart below.

## Cycle 3 complete review

1. **Authority and scope:** Pass. Changes implement only PLAN-020 checkpoint 3
   in base Angular plus proportional package verification. Standard projection,
   the Aria pilot, manifests, versions, dependencies and external actions remain
   outside this checkpoint.
2. **Public/Internal inventory:** Pass. The root adds exactly the six specified
   types, two scoped outlet components and one provider function. Resolver,
   tokens, contexts, models, IDs, host factories and native implementation
   classes remain Internal.
3. **Provider validation:** Pass. Ordinary objects are inspected by own
   descriptors in exact member order, accessors are not invoked, the first
   defect per entry and later duplicate IDs use the closed immutable diagnostic
   envelopes, and one configuration defect blocks complete form projection.
4. **Selection and fallback:** Pass. Four native registrations are installed in
   exact order before application providers. Every tester runs in DI order;
   rank, priority and earliest-order ties are deterministic. Null, exceptions
   and invalid ranks recover to native selection; no-match remains defensive.
5. **Immutable model and text:** Pass. Models and nested arrays/members are
   deeply frozen, definitions retain exact identity, IDs are exact and labels
   resolve depth-first. Snapshot-only updates do not repeat resolution; locale
   replaces labels/model without recreating renderers or local state.
6. **Scoped outlets and claims:** Pass. Direct outlet use fails dependency
   injection. Entry/panel claims use exact object identity, reject foreign and
   duplicate values, audit completeness after creation and invalidate later
   removal/replacement while keeping runtime/snapshot authority Internal.
7. **Native semantics:** Pass. Section retains fieldset/legend; tabs start on
   the first panel with cyclic Arrow/Home/End follow-focus behavior; accordion
   starts collapsed with independent native disclosures; grid preserves source
   order, numeric spans, sparse forward placement and one-column fallback.
8. **Accessibility and mounted state:** Pass. Exact tablist/tab/tabpanel,
   accordion trigger/region and labelled-grid IDs/roles/relationships are
   present. Inactive descendants remain instantiated while hidden and inert.
9. **State and lifecycle:** Pass. Locale and retained snapshots preserve tab and
   accordion state; accepted definition replacement recreates hosts and resets
   state. Claims and descendants are destroyed once and conditional removal
   invalidates the selected owner.
10. **Failure ownership:** Pass. Creation/binding, missing/foreign/duplicate
    claims and panel-child failure use the nearest exact host envelope, destroy
    partial resources, never retry native after selection and allow independent
    siblings to continue.
11. **Regression and package surface:** Pass. Leaf, nullable, object, collection,
    Signal Forms and consumer regressions pass. Built package smoke and packed
    candidate verification prove the nine exports, two exact outlet inputs and
    absence of raw Internal authority from the root.
12. **Boundaries and dirty worktree:** Pass. Core checkpoint 2 changes remain
    intact; the unrelated `angular.json` analytics setting remains untouched.
    No Standard, pilot, manifest, version, dependency, network, commit or push
    action entered checkpoint 3.

## Verification

- Core build, strict typecheck, package smoke and all 24 files/444 tests pass.
- Base Angular build, strict typecheck, scoped ESLint/Prettier, package smoke
  and all 13 files/102 tests pass.
- The exact public `0.2.0` candidate inventory/declaration/source verification
  passes with licensed Corresponding Source.
- Scoped `git diff --check` passes.
- Full-workspace formatting passes. Full-workspace lint reaches the pending
  checkpoint 4 Standard renderer and reports its expected unhandled widened
  `PresentationEntryDefinition`; scoped checkpoint 3 lint is clean and
  checkpoint 4 owns that independent projection change.

## Result

Cycle 3 has zero checkpoint findings and no unresolved change request.
PLAN-020 checkpoint 3 is complete. PLAN-020 remains Approved and active;
checkpoint 4, independent Standard projection and the shared advanced scenario,
is the exact next action. No package version, dependency, manifest, external,
commit or push action is part of this checkpoint.
