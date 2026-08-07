# PLAN-035 checkpoint 5 complete review — Cycles 1–2

- **Date:** 2026-08-04
- **Plan:** PLAN-035 revision 2, checkpoint 5
- **Authority:** Accepted ADR-036 revision 1, ADR-005 revision 11 and SPEC-019
  v0.1.2
- **Owned row:** 16 only
- **Source scope:** declarations, package/built/clean/source consumers and
  current-source migration guidance
- **Outcome:** Cycle 1 found five evidence/tooling/documentation defects. After
  correction, cycle 2 repeated the complete checkpoint with zero findings.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R325-F01 | Corrected new package evidence to assert the exact `INACTIVE_OBJECT_ALTERNATIVE_TARGET` code and `selection` member instead of an unrelated conditional-field code/reason.                                    |
| R325-F02 | Completed the built Angular consumer's expected controlled value and rendered inventory, then proved common-host retention and active branch replacement after confirmed selection.                           |
| R325-F03 | Repaired two pre-existing clean-consumer readers that accessed the widened M32 predicate/group union without exhaustive narrowing; both strict core and Angular consumers now compile without `skipLibCheck`. |
| R325-F04 | Reconciled the package-candidate verifier with the actual post-M23 source-module inventory and completed M23 provenance wording, then added the five exact M33 declaration exports.                           |
| R325-F05 | Replaced stale checkpoint-1 onboarding and indexed reviews 321–325 before advancing persistent state.                                                                                                         |

Cycle 1 cannot support completion. Cycle 2 restarts every checkpoint area after
the corrections.

## Cycle 2 complete review

| Area                          | Result | Evidence                                                                                                                                                                                                                     |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority/scope            | Pass   | Changes implement SPEC-019 row 16 only; no runtime semantics, target architecture, dependency, version, release or Git scope was added.                                                                                      |
| 2. Exact declarations         | Pass   | The five exact Public Experimental types appear once at the core root; `FormNodeDefinition`, `ObjectNodeDefinition`, `NodeRuntimeSnapshot`, `RuntimeTreeSnapshot` and object text context retain only the accepted widening. |
| 3. Runtime exports            | Pass   | Core remains the exact six-function root inventory with no entry point, deep import or Angular runtime export added.                                                                                                         |
| 4. Package smoke              | Pass   | Built core and Angular package smoke compile M33, narrow selection and reject inactive branch intentions with the exact diagnostic family.                                                                                   |
| 5. Built Angular consumer     | Pass   | The built-package consumer's two tests render the enum discriminator, retain the common host and replace cat/dog branch controls after application confirmation.                                                             |
| 6. Strict clean core/Angular  | Pass   | Isolated strict consumers compile and execute authored plus manual M33 definitions against Angular 22.0.6 and the resolved stable 22.1.0 without deep imports or credential inheritance.                                     |
| 7. Frozen lower/latest matrix | Pass   | M23 candidate tarballs pass partial compilation, strict typecheck, unit, production build and Chromium in native/pilot lanes for frozen Angular 22.0.6 and 22.0.7.                                                           |
| 8. Manual/narrowing evidence  | Pass   | Consumer TypeScript authors a complete manual discriminated definition and exhaustively narrows ordinary/discriminated definitions plus all node snapshot kinds.                                                             |
| 9. Source reconstruction      | Pass   | Isolated frozen source builds reproduce byte-equal declarations and equivalent shipped/rebuilt compilation and runtime behavior for compiled and manual M33 definitions.                                                     |
| 10. Candidate inventory       | Pass   | M23 core/base candidates retain licensed Corresponding Source, exact manifests/export maps and the five M33 declarations; package names and versions remain 0.4.1.                                                           |
| 11. Migration guidance        | Pass   | Root/core/Angular guidance names the exhaustive definition/snapshot cases, manual projection duty and separately gated coordinated future MINOR.                                                                             |
| 12. Workspace regressions     | Pass   | All 84 workspace test files and 1,188 tests pass; recursive lint/typechecks, package smoke and target builds pass.                                                                                                           |
| 13. Boundaries/docs           | Pass   | Eight snippets, 721 import boundaries and documentation checks pass with the checkpoint/review indexes reconciled.                                                                                                           |
| 14. Hygiene/frozen graph      | Pass   | Formatting, `git diff --check`, exact manifest/lock/version diff and scoped status inspection pass with no graph or published-artifact mutation.                                                                             |

## Owned-row evidence

| Row                                                   | Result | Evidence                                                                                                                                                                                                       |
| ----------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 16. Declarations/package/built/clean/source consumers | Pass   | Exact declarations, package smoke/candidates, built Angular behavior, strict/frozen lower/latest consumers, manual narrowing, isolated reconstruction and migration guidance pass without graph/version drift. |

Rows 1–15 remain frozen by reviews 321–324. Row 17 remains uniquely owned by
checkpoint 6.

## Verification

- Workspace: 84 files and 1,188 tests passed; core 51/844, scenarios 2/75,
  validator 1/15, Angular 18/148, Angular reference 4/32, Standard 7/72 and
  pilot 1/2.
- Core/Angular package smoke and built Angular consumer 2/2: pass.
- Strict clean core/Angular: Angular 22.0.6 and resolved stable 22.1.0 pass.
- Frozen M23 native/pilot consumers: lower 22.0.6 and latest 22.0.7 pass
  partial/typecheck/unit/build/Chromium.
- Isolated source reconstruction and M23 package-candidate inventory: pass.
- Angular production build outside the known sandbox limitation and Standard
  production build: pass; existing size/CommonJS/chunk advisories remain
  non-blocking.
- `pnpm lint`, recursive typechecks, snippets, 721 boundaries,
  `pnpm format:check`, `pnpm docs:check` and `git diff --check`: pass.
- No package manifest, export map, dependency, peer, lockfile or version diff.

## Result

Cycle 2 has zero findings and no unresolved change request. PLAN-035 checkpoint
5 and SPEC-019 row 16 are complete. Checkpoint 6 may begin under the approved
autonomous sequence. No dependency, version, release, publication, commit,
push or external action is authorized.
