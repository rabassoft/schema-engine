# PLAN-020 checkpoint 4 implementation review — Cycles 1–5

- **Date:** 2026-07-18
- **Plan:**
  [`PLAN-020 revision 0`](../plans/020-static-advanced-presentation-layout.md)
- **Scope:** Independent Standard projection and shared advanced scenario
- **Authority:** SPEC-008 sections 9–11 and 14–16, ADR-021 revision 1 and
  PLAN-020 checkpoint 4
- **Outcome:** Cycle 5 passed all twelve areas and the complete checkpoint gate
  with zero findings

## Cycles 1–4 findings and corrections

| ID       | Finding                                                                                                                  | Correction                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| R107-F01 | Standard label reconciliation called the application-local resolver again for snapshot-only changes.                     | Cached each binding by locale and added exception, non-string, blank, depth-first and locale-only replacement assertions.    |
| R107-F02 | The selected Standard tab border referenced the undefined local CSS property `--accent`.                                 | Replaced it with the existing target-owned `--primary` property and rechecked the complete visual baseline.                  |
| R107-F03 | Reset and complete replacement were covered in unit/DOM evidence but not explicitly inside both advanced Chromium lanes. | Extended both browser suites to prove retained state on reset and fresh initial state after scenario replacement.            |
| R107-F04 | The new hostile Angular authority-isolation test retained its injected directive in an unused field under strict types.  | Kept the same forbidden injection attempt in the constructor; strict type checking and the complete Angular suite then pass. |

Each correction restarted the complete applicable review rather than a scoped
fragment check.

## Cycle 5 complete review

1. **Authority and scope:** Pass. The checkpoint adds only one private catalog
   scenario and independent Standard/native Angular evidence. No pilot,
   package, manifest, version, dependency or external action entered scope.
2. **Neutral scenario:** Pass. `advanced-presentation` composes one section,
   nested tabs, a two-column grid and an accordion over five existing root
   nodes while retaining unchanged value, baseline, validator and operation
   ownership.
3. **Standard independence:** Pass. The Standard renderer imports only core
   contracts and owns its DOM, listeners, state, CSS and local text resolver;
   it imports no Angular SPI, target component or lifecycle helper.
4. **Exact semantics and IDs:** Pass. Section fieldset/legend, tablist/tabs/
   tabpanels, accordion triggers/regions and labelled grid/cells use the exact
   SPEC-008 IDs, roles and relationships.
5. **Interaction and accessibility:** Pass. Tabs use cyclic follow-focus Arrow/
   Home/End and roving tab order; accordion disclosures remain independent;
   inactive descendants stay mounted, hidden and inert.
6. **State and reconciliation:** Pass. Hidden fields reconcile controlled
   snapshots; locale and application reset retain tab/accordion state; complete
   scenario replacement recreates the host and restores initial state.
7. **Grid and responsive fallback:** Pass. Source-order sparse CSS-grid
   placement uses numeric columns/spans and collapses to one source-order column
   below the target-owned threshold.
8. **Local text behavior:** Pass. Resolution order is depth-first; exception,
   non-string and blank results use exact source fallback; snapshot-only changes
   do not repeat calls and locale changes do. No Angular diagnostic is created.
9. **Lifecycle and authority:** Pass. Renderer disposal is idempotent, removes
   listeners and DOM once, and blocks later delivery. A selected Angular
   container cannot inject `SchemaFormDirective`; its failure is isolated and
   independent siblings continue.
10. **Cross-target parity:** Pass. Both references consume the exact catalog
    scenario and independently expose the same labels, mounted state,
    interactions, reset behavior and replacement boundary without sharing
    controllers, CSS or target implementation.
11. **Regression and packaging:** Pass. Core, validator, catalog, base Angular
    and both reference unit suites pass. Builds, strict types, package smoke,
    packed candidate inventory, snippets and 490 import boundaries pass.
12. **Deferred and dirty-worktree boundaries:** Pass. Angular Aria/CDK,
    versions, pilot package, other targets, nested/item layout and external
    actions remain pending. The unrelated `angular.json` analytics change stays
    untouched and outside the scoped diff.

## Verification

- All workspace unit suites pass: core 24 files/444 tests, validator 1/7,
  catalog 2/38, base Angular 13/103, Angular reference 4/25 and Standard 7/50.
- Full formatting, ESLint and strict type checking pass.
- Standard production build passes at 860.39 kB JS plus 9.77 kB CSS; Angular
  production build passes at 980.47 kB initial plus lazy 143.14/129.35 kB
  chunks with its existing budget and Ajv CommonJS warnings.
- Chromium passes Standard 6/6 and Angular 8/8, including the advanced reset
  and replacement assertions.
- Package smoke, public `0.2.0` packed-candidate verification, eight snippets,
  490 import boundaries and `git diff --check` pass.

## Result

Cycle 5 has zero checkpoint findings and no unresolved change request.
PLAN-020 checkpoint 4 is complete. Checkpoint 5 may begin locally, but its
exact Angular Aria/CDK dependency mutation remains a separate network gate.
No dependency installation, publication, commit or push is part of this review.
