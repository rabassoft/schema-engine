# PLAN-032 checkpoint 5 review

- **Date:** 2026-08-03
- **Scope:** Exact shared scenario and independent Standard projection;
  SPEC-016 rows 22–23
- **Outcome:** Cycle 1 found three scenario/evidence defects. After correction,
  cycle 2 repeated all fourteen areas and rows 22–23 with zero findings.

## Cycle 1 findings and corrections

1. The shared scenario's deterministic validator made `reviewCode` invalid,
   but its JSON Schema initially omitted the matching assertion, so the real
   Angular/Standard Ajv lanes could not demonstrate the retained hidden issue.
   The field now carries `pattern: '^ok$'`; both validation paths agree on
   validity while retaining their intentionally target-independent issue text.
2. Initial browser assertions read validity and diagnostics from summary or
   runtime panels that do not own those values. The Angular test now reads the
   snapshot inspector, and the Standard test reads the runtime snapshot and
   diagnostics panels explicitly.
3. Initial shared evidence covered retained invalidity and dirty state but did
   not explicitly exercise a validation scope after hiding. The scenario
   catalog test now proves the hidden optional target's issue remains in an
   exact scoped validation snapshot.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                   | Result | Evidence                                                                                                                                                         |
| -------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Exact neutral scenario              | Pass   | One `conditional-field-state` entry owns schema, UI Schema, values, expectations and explanations without Angular, DOM or target logic.                          |
| 2. Authoring safety                    | Pass   | The catalog copies and deeply freezes the new scenario; schema, UI Schema, values, literals, conditions and expected transitions retain no authored aliases.     |
| 3. Condition coverage                  | Pass   | Direct editable visibility/enabled targets cover typed `null`, `false`, zero and empty-string equality with default/false/true runtime states.                   |
| 4. Hidden source truth                 | Pass   | A false boolean source becomes hidden while its unchanged controlled presence keeps its dependent target visible in core and both browsers.                      |
| 5. Focus and buffer behavior           | Pass   | A focused target becomes hidden without touched in focused evidence; both targets retain exact host/control identity and reconcile confirmed buffers.            |
| 6. Validation, dirty and scope truth   | Pass   | The optional invalid target remains invalid with visible issues in snapshots and scoped validation while hidden; dirty/baseline ownership is unchanged.          |
| 7. Accepted and inactive operations    | Pass   | Active edits appear once in history; hidden/disabled DOM routes add zero operations or diagnostics, while direct core stale actions retain exact rejection.      |
| 8. Independent Standard ownership      | Pass   | Standard directly consumes core definitions/snapshots and owns its host, control, buffer, listener and disposal behavior without Angular imports/helpers/CSS.    |
| 9. Standard mounted accessibility      | Pass   | Hidden fields remain mounted with hidden/inert/aria-hidden; disabled controls/actions stay visible and inaccessible, with supporting issues retained.            |
| 10. Standard lifecycle and teardown    | Pass   | Reconciliation reuses bindings across false/true transitions; existing idempotent listener disposal and repeated-scenario replacement remain green.              |
| 11. Angular shared consumption         | Pass   | Angular consumes the exact catalog entry and proves the same values/transitions independently through its accepted checkpoint-4 projection.                      |
| 12. Semantic cross-target parity       | Pass   | Both browsers prove identical predicate, visibility, enabled, invalidity, history and restoration outcomes without requiring shared rendering or pixel equality. |
| 13. Regression and deferred boundaries | Pass   | All 15 scenarios compile/mount; collection templates, compound expressions, dynamic semantics, packages, dependencies, versions and release remain unchanged.    |
| 14. Complete verification and hygiene  | Pass   | Full lint/types/build/unit matrix, Angular 16/16 and Standard 13/13 Chromium, snippets, boundaries, formatting, docs and diff checks pass.                       |

## Decision

Cycle 2 passes completely with zero findings. PLAN-032 checkpoint 5 and
SPEC-016 rows 22–23 are complete. Checkpoint 6 may begin; dependency/version,
release and Git behavior remain inactive.

## Verification

- Complete workspace lint, typecheck and build.
- Core 43 files/718 tests; Angular 16/134; validator 1/15; Angular Aria 1/2.
- Shared scenarios 2/68; Angular reference 4/30; Standard reference 7/68.
- Complete Angular Chromium 16/16 and Standard Chromium 13/13.
- Real Angular production bundle 1.13 MB under the 1.2 MB error threshold;
  the known size/Ajv warnings remain. Standard retains its known chunk advisory.
- Eight generated snippets and import-boundary verification.
- Prettier, documentation and `git diff --check` after checkpoint-state
  reconciliation.

No dependency, package manifest, lockfile, export map, package/version,
release, publication, commit, push or external state changed.
