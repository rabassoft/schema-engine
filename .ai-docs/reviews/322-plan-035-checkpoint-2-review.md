# PLAN-035 checkpoint 2 complete review — Cycles 1–2

- **Date:** 2026-08-04
- **Plan:** PLAN-035 revision 2, checkpoint 2
- **Authority:** Accepted ADR-036 revision 1, ADR-005 revision 11 and SPEC-019
  v0.1.2
- **Owned rows:** 8–12 only
- **Source scope:** core manual-definition validation, controlled runtime,
  interaction state and form-operation application
- **Outcome:** Cycle 1 found five implementation/evidence defects. After every
  correction, cycle 2 repeated the complete checkpoint with zero findings.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R322-F01 | Make `applyFormOperation()` stop at the first M33 manual-definition defect, matching runtime creation, instead of returning a derived projection cascade.                                                            |
| R322-F02 | Enforce the exact manual inspection order: discriminator, union children, discriminator capability, alternative envelopes, choice mapping, child ownership/order, prohibited subtree and fields projection.          |
| R322-F03 | Detect malformed descendants, duplicate paths, reuse and cycles inside the union with the three M33 reason families and owner/alternative/child locators before legacy traversal can produce a dependent diagnostic. |
| R322-F04 | Preserve dormant touched state, clear deactivated focus without touching it, and structurally reuse common/unchanged snapshots across selection changes.                                                             |
| R322-F05 | Keep descriptor/accessor rejection ahead of alternative activity during form application and expand exact none/different, frozen-path, zero-effect and baseline-selection evidence.                                  |

Cycle 1 cannot support completion. Cycle 2 restarts every area after the
corrections rather than checking only the modified fragments.

## Cycle 2 complete review

| Area                         | Result | Evidence                                                                                                                                                                                                                           |
| ---------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority/scope           | Pass   | Diff implements only checkpoint-2 rows 8–12; validation/scopes, adapters, packages, dependencies, versions, release and Git remain outside this checkpoint.                                                                        |
| 2. Manual order/safety       | Pass   | Descriptor-safe validation follows the Accepted order, stops at the first defect and invokes neither validator nor operation effects.                                                                                              |
| 3. Manual reasons/locators   | Pass   | `invalid-discriminated-object`, `invalid-object-alternative` and `inconsistent-alternative-projection` carry the applicable node, alternative, child, path and member locators.                                                    |
| 4. Static activity index     | Pass   | Every union descendant is statically known and uniquely mapped to its owner/alternative while common and discriminator paths remain unowned.                                                                                       |
| 5. Selection                 | Pass   | Only current owner presence plus an own matching string discriminator selects; missing, wrong-kind and unknown safe values select `none`, and baseline never selects.                                                              |
| 6. Snapshot projections      | Pass   | Children and form fields contain common plus active depth-first nodes only, preserve union order and share the exact active leaf snapshot references; inactive lookups return `undefined`.                                         |
| 7. Controlled state          | Pass   | Discriminator requests emit only the existing intention, external confirmation/rejection owns state and dormant value/baseline data reappears without creation, clearing, migration or defaults.                                   |
| 8. Dirty/interaction         | Pass   | Only common/active state contributes dirty/touched/focus; inactive touched state persists, deactivation clears focus without touching, and updates emit at most one snapshot notification.                                         |
| 9. Structural sharing        | Pass   | Unchanged common fields and equivalent object/selection shells reuse prior immutable snapshot identities across alternative changes.                                                                                               |
| 10. Runtime inactive actions | Pass   | Set/remove/focus/blur reject inactive and stale paths before compatibility with the exact code, action, owner/discriminator paths, required/active indices and none/different presence rules; no operation/snapshot effect occurs. |
| 11. Form application         | Pass   | `applyFormOperation()` uses the same static ownership/current selection, returns the original value with `changed: false` and exact frozen diagnostic; `applyOperation()` remains unchanged.                                       |
| 12. Accessors/mutation       | Pass   | Active and dormant managed accessors fail atomically without getter execution; manual definitions are not cloned/frozen and later mutation remains unsupported.                                                                    |
| 13. Regressions/exports      | Pass   | Complete core M1–M32 regressions pass and the built runtime inventory remains exactly the existing six functions.                                                                                                                  |
| 14. Graph/docs/hygiene       | Pass   | No package/manifest/lock/version diff exists; formatting, documentation links, lint, build, package smoke and diff hygiene pass.                                                                                                   |

## Owned-row evidence

| Row                              | Result | Evidence                                                                                                                                         |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8. Manual definitions            | Pass   | Hostile base/discriminator/alternative/child/projection, order, first-defect, locator and no-validator/effect fixtures.                          |
| 9. Selection/projections         | Pass   | Active and three `none` forms, ordered active children/fields, exact shared leaf identities and inactive lookups.                                |
| 10. Controlled/dormant state     | Pass   | Discriminator intention/confirmation, no optimistic change, external ownership and branch value/baseline restoration.                            |
| 11. Baseline/interaction/sharing | Pass   | Baseline-only selection isolation, active dirty, dormant touched, focus clearing, common identity and one-notification evidence.                 |
| 12. Inactive/stale targets       | Pass   | Four runtime actions plus form application for none/different selection, exact immutable parameters, zero effects and unchanged raw application. |

Rows 13–17 remain uniquely owned by checkpoints 3–6.

## Verification

- Focused M33 compiler/runtime: 2 files, 36 tests passed.
- Complete core: 51 files, 839 tests passed.
- `pnpm format:check`, `pnpm docs:check` and `pnpm lint`: pass.
- Core typecheck, build and package smoke: pass.
- Built runtime exports: exactly `applyFormOperation`, `applyOperation`,
  `commitScopeToBaseline`, `compileFormDefinition`,
  `createControlledFormRuntime` and `deriveSchemaDefaultCandidate`.
- No package/manifest/lockfile/version diff; `git diff --check`: pass.

## Result

Cycle 2 has zero findings and no unresolved change request. PLAN-035 checkpoint
2 and SPEC-019 rows 8–12 are complete. Checkpoint 3 may begin under the
approved autonomous sequence. No dependency, version, release, publication,
commit, push or external action is authorized.
