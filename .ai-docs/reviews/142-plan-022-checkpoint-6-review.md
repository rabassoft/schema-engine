# PLAN-022 checkpoint 6 complete review — Cycle 1

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-022 revision 0`](../plans/022-recursive-local-presentation-layout.md)
- **Checkpoint:** 6 — Angular Aria local-owner conformance
- **Authority:** SPEC-009 v0.1.0 sections 9–12 and 14; ADR-025 revision 0
- **Outcome:** Cycle 1 passed all ten areas with zero findings

## Review areas

1. **Registration surface — Pass.** The four existing rank-`10` registrations
   and sole provider export remain exact; no production Aria change was needed.
2. **Generic domain — Pass.** Section, tabs, accordion and grid render models
   accept ordinary definitions and templates through the widened base SPI.
3. **Shared scenario — Pass.** The Aria suite imports and compiles the exact
   private `recursive-local-presentation` catalog input used by native Angular
   and Standard.
4. **Local semantics — Pass.** All ordinary, item-root and nested-template
   containers select Aria hosts with exact roles, names, relationships, mounted
   panels, grid cells and accepted concrete IDs.
5. **State/lifecycle — Pass.** Per-item tabs and accordion state survives stable
   movement and locale updates; removal, fresh same-ID reinsertion and invalid
   identity have the accepted lifecycle.
6. **Text/diagnostics — Pass.** Base static-label reuse, fallback and exact
   local owner diagnostics remain shared; Aria adds no text or error authority.
7. **Native equivalence — Pass.** Native and Aria suites cover the same exact
   scenario owners, IDs, movement, locale and lifecycle semantics.
8. **External renderer declarations — Pass.** A package-importing compile-only
   consumer narrows the widened definition union and implements the renderer/
   registration contracts without owner, item, snapshot or runtime access.
9. **Package/theme/dependency boundary — Pass.** Six CSS properties, stylesheet
   scope, Angular 22 peer ranges, dependency gate, export allowlist and package
   smoke remain exact; no manifest or lockfile changed.
10. **Build/regression — Pass.** Partial compilation, strict base/pilot types,
    pilot DOM/accessibility tests, snippets and the reference production build
    pass with only the already recorded bundle/Ajv warnings.

## Verification

- Base Angular and Angular Aria partial compilation/strict typecheck: pass.
- Angular Aria suite: 1 file, 2 tests pass.
- Angular Aria dependency gate and package smoke: pass.
- External custom-renderer source/declaration compilation: pass as part of the
  base Angular strict typecheck.
- Angular reference production build and 8 snippets: pass outside the
  restricted sandbox due the documented esbuild IPC constraint.
- Aria production source/styles/manifest and `pnpm-lock.yaml` diff: empty.
- Formatting and `git diff --check`: pass.

## Outcome

Checkpoint 6 is complete with zero findings. Checkpoint 7 may now extend exact
Public allowlists and add the dedicated frozen offline M20 consumer lane before
running the full local conformance matrix.
