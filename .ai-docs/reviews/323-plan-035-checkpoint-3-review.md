# PLAN-035 checkpoint 3 complete review — Cycles 1–2

- **Date:** 2026-08-04
- **Plan:** PLAN-035 revision 2, checkpoint 3
- **Authority:** Accepted ADR-036 revision 1, ADR-005 revision 11 and SPEC-019
  v0.1.2
- **Owned rows:** 13–14 only
- **Source scope:** core scopes, validation issue ownership and M29 default
  candidate boundary
- **Outcome:** Cycle 1 found two integration defects and one evidence gap.
  After correction, cycle 2 repeated the complete checkpoint with zero
  findings.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R323-F01 | Make discriminated-owner scopes collect the current active snapshot tree instead of the complete static descendant index; keep directly named inactive paths known for reset/validation without an unknown warning.            |
| R323-F02 | Reassign inactive-only and owner/`oneOf` validation issues to the discriminated owner while retaining each normalized issue's original frozen path and content; keep active/common/discriminator issues on their normal nodes. |
| R323-F03 | Add exact sync/async original-input identity, owner validity, scope membership/reset and descriptor-safe M29 stopping evidence.                                                                                                |

Cycle 1 cannot support completion. Cycle 2 restarts every checkpoint area after
the corrections.

## Cycle 2 complete review

| Area                               | Result | Evidence                                                                                                                                  |
| ---------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority/scope                 | Pass   | Only SPEC-019 rows 13–14 change; adapter, package, dependency, version, release and Git work remains inactive.                            |
| 2. Static scope knowledge          | Pass   | Every static union path parses without an unknown warning, including inactive leaves and nested descendants.                              |
| 3. Active scope membership         | Pass   | Owner scopes contain the owner, common and selected descendants only; inactive direct scopes contribute no runtime node.                  |
| 4. Scope interaction               | Pass   | A directly named dormant field can clear stored touched state, while owner forcing/reset remains bounded to its active tree.              |
| 5. Active issue assignment         | Pass   | Active/common/discriminator issues attach to their normal snapshots with unchanged order and frozen normalized instances.                 |
| 6. Inactive/owner issue assignment | Pass   | Inactive-only, owner and owner-`oneOf` paths attach to the discriminated owner without rewriting their original paths/content.            |
| 7. Validity/visibility             | Pass   | Reassigned issues invalidate the owner and root and remain visible through owner scope/adapter-facing snapshot membership.                |
| 8. Scoped validation               | Pass   | Inactive scopes remain known but do not claim owner-owned inactive issues; owner scopes include reassigned issues and active descendants. |
| 9. Sync validator identity         | Pass   | The synchronous validator receives the exact original schema and complete current value without selection or filtering.                   |
| 10. Async validator identity       | Pass   | The asynchronous validator receives the same exact inputs; settled inactive issues use the same owner assignment.                         |
| 11. Default helper                 | Pass   | `deriveSchemaDefaultCandidate()` stops at the owner `oneOf`, emits the Accepted contextual diagnostic and never reads branch defaults.    |
| 12. Condition boundaries           | Pass   | Existing M30/M32 compiler exclusions continue to prevent union descendants from becoming condition sources or targets.                    |
| 13. Regressions/graph              | Pass   | Complete core M1–M32 behavior passes with no dependency, manifest, lockfile, version, entry-point or runtime-export drift.                |
| 14. Documentation/hygiene          | Pass   | Formatting, documentation/link checks, lint, typecheck, build, package smoke and diff hygiene pass.                                       |

## Owned-row evidence

| Row                          | Result | Evidence                                                                                                                                                                  |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13. Scopes/issues            | Pass   | Static inactive and active owner scopes, dormant touched reset, active/common/discriminator/inactive/owner/`oneOf` issues, frozen original paths and root/owner validity. |
| 14. Validator/default helper | Pass   | Exact sync/async schema/value identity and descriptor-safe contextual `oneOf` failure without branch traversal.                                                           |

Rows 15–17 remain uniquely owned by checkpoints 4–6.

## Verification

- Focused M33 compiler/runtime: 2 files, 41 tests passed.
- Complete core: 51 files, 844 tests passed.
- `pnpm format:check`, `pnpm docs:check` and `pnpm lint`: pass.
- Core typecheck, build and package smoke: pass.
- No package/manifest/lockfile/version diff; `git diff --check`: pass.

## Result

Cycle 2 has zero findings and no unresolved change request. PLAN-035 checkpoint
3 and SPEC-019 rows 13–14 are complete. Checkpoint 4 may begin under the
approved autonomous sequence. No dependency, version, release, publication,
commit, push or external action is authorized.
