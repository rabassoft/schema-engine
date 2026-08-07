# PLAN-036 checkpoint 1 complete review — Cycles 1–3

- **Date:** 2026-08-04
- **State:** Complete; checkpoint 1 accepted and checkpoint 2 may start
- **Authority:** Approved PLAN-036 revision 0, Accepted SPEC-020 v0.1.0 rows 1–5
  and ADR-037 revision 0
- **Scope:** Definitions, compiler, manual validation and scopes only; wizard
  runtime remains deliberately unavailable until checkpoint 2

## Cycles 1–2 findings and corrections

| Finding  | Correction                                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R331-F01 | Narrowed root `wizard` entries out of the existing Angular static projection so the widened root union remains buildable without prematurely implementing a target host.                 |
| R331-F02 | Removed unsafe descriptor/array assignments and temporary unused parameters exposed by the complete workspace lint pass.                                                                 |
| R331-F03 | Replaced the pre-M34 `wizard` unsupported-kind expectation with the Accepted sole-root diagnostic and added explicit invalid-kind classification for wizard-like entries.                |
| R331-F04 | Made wizard-intention subscription structurally valid for ordinary runtimes and kept temporary unavailable/rejection results inside the frozen SPEC-020 diagnostic parameter vocabulary. |

Neither cycle may support completion. After each correction, the complete
checkpoint review and verification matrix restarted.

## Complete review matrix — Cycle 3

| Area                      | Result | Evidence                                                                                                                                               |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Authority              | Pass   | Only rows 1–5 are active; runtime, targets, dependencies and release remain outside the checkpoint.                                                    |
| 2. Public inventory       | Pass   | The exact eighteen M34 type exports exist and only the named root/options/update/snapshot/text/runtime surfaces widen.                                 |
| 3. Ordinary compatibility | Pass   | Existing non-wizard literals compile unchanged and all prior presentation suites pass.                                                                 |
| 4. Root grammar           | Pass   | One sole root wizard, at least two static steps, labels/IDs and non-empty forests are enforced.                                                        |
| 5. Descriptor safety      | Pass   | Dense arrays, accessors, unknown members, cycles and invalid exteriors fail closed through `INVALID_UI_PRESENTATION`.                                  |
| 6. Membership             | Pass   | Root nodes occur exactly once across all steps and container IDs remain global.                                                                        |
| 7. Normalization          | Pass   | Wizard/step identities and ordinary child definitions are detached and deeply frozen.                                                                  |
| 8. Scopes                 | Pass   | Step targets preserve flattened root order; completion concatenates them and includes global issues.                                                   |
| 9. Manual definitions     | Pass   | Exact keys, shapes, membership and recomputed scope IDs/targets/flags are checked before runtime effects.                                              |
| 10. Intermediate runtime  | Pass   | Valid wizard definitions are deliberately rejected before validator execution until checkpoint 2.                                                      |
| 11. Regression            | Pass   | Core 52/853, Angular 18/148, Aria 1/2, scenarios 2/75, Standard 7/72, Angular reference 4/32 and Ajv 1/15 pass.                                        |
| 12. Buildability          | Pass   | Core/Angular/Aria/scenario/validator/Standard builds and workspace lint/type checks pass; the known restricted-sandbox Angular-app abort is unchanged. |
| 13. Boundaries            | Pass   | No package, entry point, dependency, manifest, lockfile, version or published artifact changed.                                                        |
| 14. Documentation         | Pass   | Approval, checkpoint state, links, formatting, accepted versions and diff hygiene are reconciled.                                                      |

## Conclusion

Cycle 3 passes all fourteen areas and SPEC-020 rows 1–5 with zero findings after
four corrections. Checkpoint 1 is complete and checkpoint 2 may begin under the
autonomous execution agreement. No dependency, version, release, publication,
commit, push or external action is authorized.
