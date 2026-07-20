# PLAN-022 checkpoint 4 complete review — Cycles 1–2

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-022 revision 0`](../plans/022-recursive-local-presentation-layout.md)
- **Checkpoint:** 4 — Angular native local projection, text and lifecycle
- **Authority:** SPEC-009 v0.1.0 sections 9–12 and ADR-025 revision 0
- **Outcome:** Cycle 2 passed all ten areas with zero findings

## Cycle 1 finding and correction

| ID       | Finding                                                                                    | Correction                                                                                        |
| -------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| R140-F01 | The new DOM test queried grid semantics as `role="grid"`, but SPEC-008 uses a named group. | Corrected the assertion to the accepted `data-schema-presentation-grid`/`role="group"` semantics. |

## Review areas

1. **Projection placement — Pass.** Fixed object/item labels, support text,
   issues and actions remain outside the local forest; the forest replaces only
   the previous direct-child loop.
2. **Owner identities — Pass.** Ordinary, item and template-object static and
   concrete tuples use exact paths, relative paths and stable item IDs, never
   collection indexes.
3. **IDs — Pass.** Every local section/container/panel/grid-item base follows
   the accepted tuple formula; all root bases and suffixes remain unchanged.
4. **Text — Pass.** One WeakMap cache reuses each exact static definition per
   form and locale across item instances; only local section failure gains
   `sectionKey`.
5. **Native semantics — Pass.** Sections, tabs, accordions and grids retain
   roles, names, relationships, keyboard behavior, mounted hidden descendants
   and one-column fallback.
6. **Independent state — Pass.** Concrete item hosts own their own tabs/
   accordion state; retained movement preserves it.
7. **Lifecycle — Pass.** Removal destroys a local subtree, reinsertion creates
   fresh state and identity-invalid collections still project no item hosts.
8. **Diagnostics — Pass.** Local tester/selection/host/panel failures add only
   exact frozen owner context; root/provider diagnostics remain exact.
9. **Runtime/data invariance — Pass.** Projection introduces no value,
   baseline, validation, operation, issue, focus or collection authority.
10. **Regression/boundary — Pass.** All prior Angular behavior remains green;
    Standard, Aria, dependencies, versions and external state are untouched.

## Verification

- Base Angular partial compilation/build and strict typecheck: pass.
- Complete base Angular suite after correction and review restart: 14 files,
  106 tests pass.
- New ordinary/item/template projection, exact-ID, move/remove/reinsert and
  duplicate-ID assertions: pass.
- `git diff --check`: pass.

## Outcome

Checkpoint 4 is complete with zero findings. The same neutral scenario and
semantics must now be implemented independently in Standard at checkpoint 5.
