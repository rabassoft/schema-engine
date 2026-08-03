# PLAN-029 checkpoint 5 complete review — Cycles 1–3

- **Date:** 2026-08-03
- **Authority:** Accepted ADR-030 revision 0, SPEC-013 v0.1.1 and Approved
  PLAN-029 revision 1
- **Scope:** Shared scoped-confirmation scenario and independent
  Angular/Standard application-owned evidence
- **Outcome:** Cycle 3 passes the complete cross-target matrix with zero
  findings; checkpoint 5 is complete and checkpoint 6 may start

## Findings and corrections

Cycle 1 found that the new catalog entry had an empty transition inventory and
that the closed scenario/feature inventories had not yet been extended. The
scenario now includes one valid controlled edit transition, owns only the new
`scope-confirmation` feature, and the catalog tests cover its frozen detached
scope/label/expectation authoring. Complete scenario tests then passed.

Cycle 2 found two integration defects:

1. The Angular reference grew 9.52 kB beyond its existing 1.05 MB hard build
   ceiling. The private-app hard error was narrowly recalibrated to 1.1 MB while
   retaining the 750 kB warning; the 1.06 MB build remains visibly warned.
2. The Angular semantic-navigation unit assertion still expected eleven
   scenarios. It now expects the complete twelve-scenario catalog.

After both corrections, cycle 3 repeated the entire applicable checkpoint
matrix rather than only the changed assertions.

## Cycle 3 complete review matrix

| Area                        | Result | Evidence                                                                                                                                                                |
| --------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared authoring            | Pass   | One frozen detached scenario shares only schema/UI Schema, initial roots, copied scopes, labels, explanation and expected evidence; 57/57 authoring/catalog tests pass. |
| Required topology           | Pass   | The scenario includes a partial profile leaf, whole homogeneous team collection, unrelated `reviewNote`, and current-only `linus` stable target.                        |
| Independent ownership       | Pass   | Angular signals and Standard class state independently own candidates/effects; each imports and calls the core root helper directly.                                    |
| Prepare versus accept       | Pass   | Preparing visibly retains the exact baseline and dirty state; a separate enabled action simulates persistence acceptance through baseline-only external state.          |
| Partial isolation           | Pass   | Profile acceptance cleans that leaf while the review note and collection edits remain dirty.                                                                            |
| Structural collection       | Pass   | Whole-team acceptance adopts exact current reorder/insertion while the unrelated review note remains dirty.                                                             |
| Stable failure              | Pass   | Before whole-team acceptance, the current-only Linus item yields `unconfirmable`, no acceptable candidate and a disabled acceptance action.                             |
| Recreation cleanup          | Pass   | Reset, scenario replacement and applied configuration recreation clear prepared candidate state in each application.                                                    |
| Accessibility/visual parity | Pass   | Equivalent fieldsets, button labels, live status, copyable/expanded evidence and existing light/dark/keyboard structure are present in both targets.                    |
| Adapter boundary            | Pass   | No directive, provider, renderer, shared-effect wrapper or Public adapter API changed; 621 import boundaries pass.                                                      |
| Maintained snippets         | Pass   | The build-checked Angular application-state excerpt includes its application-owned candidate signal; all eight snippets regenerate and verify.                          |
| Unit/Chromium parity        | Pass   | Angular 28/28 and Standard 62/62 unit tests pass; Chromium passes Angular 12/12 and Standard 10/10, including equivalent scoped-confirmation journeys.                  |
| Exclusions                  | Pass   | No persistence/storage/network/submit behavior, validator change, dependency, package, entry point, version, release, commit or push was added.                         |

## Verification

```text
pnpm reference:snippets                                      pass; 8
reference-scenarios typecheck/build/test                     pass; 57/57
pnpm reference:test:unit                                     pass; Angular 28/28
pnpm reference:standard:test:unit                            pass; Standard 62/62
pnpm reference:test:boundaries                               pass; 621 imports
pnpm reference:test:e2e                                      pass; Chromium 12/12
pnpm reference:standard:test:e2e                             pass; Chromium 10/10
git diff --check                                             pass
```

Angular builds were run outside the restricted sandbox because its esbuild
process has the documented sandbox-only abort. The unchanged outside-sandbox
commands pass with the retained bundle/Ajv warnings; Standard retains its chunk
advisory. These remain observations rather than unresolved findings.

Cycle 3 found no remaining error, ambiguity, contract drift or requested
change. SPEC-013 conformance row 19 is now complete, and checkpoint 6 may run
the frozen workspace-wide closure matrix.
