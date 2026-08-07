# PLAN-035 checkpoint 4 complete review — Cycles 1–2

- **Date:** 2026-08-04
- **Plan:** PLAN-035 revision 2, checkpoint 4
- **Authority:** Accepted ADR-036 revision 1, ADR-005 revision 11 and SPEC-019
  v0.1.2
- **Owned row:** 15 only
- **Source scope:** shared reference scenario, Angular adapter/reference and
  independent Standard renderer/reference
- **Outcome:** Cycle 1 found two target-integration gaps and one scenario
  evidence gap. After correction, cycle 2 repeated the complete checkpoint with
  zero findings.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R324-F01 | Teach Angular's node outlet/object host to narrow the normalized discriminated definition/snapshot pair, resolve children by canonical key and preserve tracked common hosts while replacing the active branch.                |
| R324-F02 | Add an independent Standard alternative binding with per-branch cleanup, canonical-key reconciliation and stale-event isolation instead of retaining inactive DOM controls.                                                    |
| R324-F03 | Add one deeply frozen neutral scenario with common/nested/required/optional fields, controlled confirmation, dormant data, validation, focus/touched and inactive/stale evidence; exercise it in both unit and Chromium lanes. |

Cycle 1 cannot support completion. Cycle 2 restarts every checkpoint area after
the corrections.

## Cycle 2 complete review

| Area                       | Result | Evidence                                                                                                                                                                                                     |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Authority/scope         | Pass   | Only SPEC-019 row 15 changes; target implementations remain independent and package/dependency/version/release/Git scope is unchanged.                                                                       |
| 2. Shared scenario         | Pass   | One catalog-authored deeply frozen M33 scenario covers two alternatives, common/nested/required/optional children, controlled switching, dormant data and inactive validation.                               |
| 3. Neutral boundary        | Pass   | Shared code owns schema/UI schema, initial data, validator, transitions and prose only; it contains no Angular, DOM or renderer behavior.                                                                    |
| 4. Angular narrowing       | Pass   | Angular narrows exact definition/snapshot kinds, resolves active children by canonical key and never reads raw `oneOf` or current value for selection.                                                       |
| 5. Angular lifecycle       | Pass   | Key-tracked common hosts survive replacement, branch hosts are destroyed, deactivated focus clears and existing field accessibility/cleanup remains active.                                                  |
| 6. Standard narrowing      | Pass   | Standard independently indexes normalized active snapshots and definition keys without importing Angular or shared renderer/state logic.                                                                     |
| 7. Standard lifecycle      | Pass   | Per-branch cleanup removes inactive bindings/listeners/DOM; a retained stale input cannot emit after deactivation and common elements retain identity.                                                       |
| 8. Enum control            | Pass   | Both targets render the discriminator through their existing single string-enum control and emit the ordinary controlled set intention.                                                                      |
| 9. Validation/visibility   | Pass   | Active invalid data and dormant inactive issue paths remain validator-owned and project through the owner behavior completed in checkpoint 3.                                                                |
| 10. Accessibility          | Pass   | Fieldset/legend, labels, required state, keyboard-native enum selection, focus clearing and removed inactive controls pass unit/Chromium evidence.                                                           |
| 11. Unit parity            | Pass   | Scenario catalog 75, Angular adapter 148, Angular reference 32 and Standard reference 72 tests pass.                                                                                                         |
| 12. Chromium parity        | Pass   | Sequential Standard 15 and Angular 18 Chromium tests pass, including explicit common-host and branch-replacement scenarios.                                                                                  |
| 13. Regressions/boundaries | Pass   | Existing M1–M32 scenarios/snippets pass; 721 import boundaries preserve three private references and three public projects.                                                                                  |
| 14. Build/docs/hygiene     | Pass   | Standard production build, Angular production build outside the known sandbox limitation, formatting, docs, lint, typechecks and diff hygiene pass; existing bundle/CommonJS advisories remain non-blocking. |

## Owned-row evidence

| Row                         | Result | Evidence                                                                                                                                                                                                       |
| --------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15. Angular/Standard parity | Pass   | Deeply frozen shared scenario, independent normalized projections, enum interaction, common identity, active replacement, focus/lifecycle cleanup, stale-event isolation, unit suites and sequential Chromium. |

Rows 16–17 remain uniquely owned by checkpoints 5–6.

## Verification

- Shared scenarios: 2 files, 75 tests passed.
- Angular adapter: 18 files, 148 tests passed; Angular reference: 4 files, 32
  tests passed.
- Standard reference: 7 files, 72 tests passed.
- Sequential Chromium: Standard 15 and Angular 18 tests passed.
- Both target typechecks, Standard/Angular production builds, snippets and 721
  boundaries: pass. Angular retains the known size/Ajv warnings and Standard
  the known chunk advisory.
- `pnpm format:check`, `pnpm docs:check`, `pnpm lint` and `git diff --check`:
  pass.

## Result

Cycle 2 has zero findings and no unresolved change request. PLAN-035 checkpoint
4 and SPEC-019 row 15 are complete. Checkpoint 5 may begin under the approved
autonomous sequence. No dependency, version, release, publication, commit,
push or external action is authorized.
