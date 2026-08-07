# PLAN-037 checkpoint 2 implementation review — Cycles 1–3

- **Date:** 2026-08-06
- **State:** Complete; checkpoint 2 accepted
- **Reviewed:** PLAN-037 checkpoint 2 and SPEC-021 rows 5–13 against Accepted
  ADR-038 revision 0, SPEC-021 v0.1.0, the frozen checkpoint-1 graph and
  unchanged M1–M34 behavior
- **Outcome:** Cycles 1–2 found and corrected thirteen implementation,
  lifecycle, evidence and onboarding defects. Cycle 3 repeated all fifteen
  areas with zero findings. Checkpoint 2 is complete; checkpoint 3 may
  implement only registry, projection-cache and renderer-isolation rows 14–18.

## Review cycles and corrections

| Finding  | Correction                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R344-F01 | Replaced the copy-local-only diagnostics path with a frozen, non-enumerable, descriptor-readable cross-copy receiver while preserving a distinct unique-symbol handle brand.                                             |
| R344-F02 | Cleared previously committed ports when a blocked config omits or invalidates `onDiagnostics`, preventing delivery to a stale application callback.                                                                      |
| R344-F03 | Inspected all four callback/resolver descriptors in the required order even when a required callback blocks core creation.                                                                                               |
| R344-F04 | Fingerprinted callback descriptor kinds as well as values so accessor/missing transitions republish the correct configuration error without loops.                                                                       |
| R344-F05 | Kept retained initializing/error facades `REACT_FORM_NOT_READY`; only epoch-bound or unmounted facades become stale.                                                                                                     |
| R344-F06 | Published reconciliation failure state before delivering its diagnostics and suppressed visibility after a failed external update.                                                                                       |
| R344-F07 | Removed duplicate application delivery of diagnostics nested inside a successful validation read; only the facade's returned diagnostic batch is forwarded.                                                              |
| R344-F08 | Deep-froze every action closure in addition to the facade object and made brand/receiver symbols non-enumerable.                                                                                                         |
| R344-F09 | Updated package onboarding that still described the checkpoint-1 empty root after `useSchemaForm` became active.                                                                                                         |
| R344-F10 | Limited failed-creation retries to construction, external/seed and required-callback identities; optional diagnostic/resolver port changes no longer recreate core.                                                      |
| R344-F11 | Suppressed duplicate bridge publication when a hostile subscription repeats the identical snapshot/reference and projection generation.                                                                                  |
| R344-F12 | Added exhaustive once-only delegation and inert-result evidence for all 24 facade methods, including exact confirmation wrapping and false effect flags.                                                                 |
| R344-F13 | Added hostile evidence for descriptor order, cross-copy receiver shape, five construction identities, ordered reconciliation, failed-action cleanup, all-method unmount gating and exact Strict Mode intention behavior. |

Each correction triggered another complete applicable review. Cycle 3 contains
no finding or unresolved change request.

## Cycle 3 complete review

| Area                             | Result | Evidence                                                                                                                                                   |
| -------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and rows            | Pass   | Only SPEC-021 rows 5–13 are implemented; renderer, registry and shell behavior remain outside this checkpoint.                                             |
| 2. Public partial surface        | Pass   | The root exposes exactly `useSchemaForm` plus the four checkpoint-owned types, with no renderer or lifecycle escape.                                       |
| 3. Callback/resolver boundary    | Pass   | Ordered own-descriptor parsing, blocking callback errors, source fallback, warning deduplication and latest committed ports are covered.                   |
| 4. State and opacity             | Pass   | Initializing/ready/error branches, exact core snapshot, frozen states/handles/actions/functions, package-specific brand and cross-copy receiver pass.      |
| 5. Complete facade               | Pass   | All 24 methods delegate once; reads wrap exact values and actions return exact core results; confirmation alone wraps `wizardSelection`.                   |
| 6. Inert and stale calls         | Pass   | Every initializing and unmounted call returns one frozen exact diagnostic; retained old epochs cannot reach a replacement runtime.                         |
| 7. External store                | Pass   | Stable subscribe/get functions, no server snapshot, cached references and duplicate-notification suppression pass.                                         |
| 8. Runtime ownership             | Pass   | Commit-only creation, three subscriptions, partial-subscription unwind, stale notification suppression and exact disposal are balanced.                    |
| 9. Construction identity         | Pass   | `formId`, definition, schema, validator and present async-validator identities each replace the epoch; port changes do not.                                |
| 10. Reconciliation               | Pass   | Value, baseline and locale form one ordered update; visibility follows, failure suppresses the second action and publishes error before callback delivery. |
| 11. Wizard control               | Pass   | `wizardState` is seed-only, confirmation delegates exactly once and no prop echo double-advances selection.                                                |
| 12. Strict Mode                  | Pass   | Development replay creates two validator instances, emits no duplicate intention and one explicit operation remains exactly one.                           |
| 13. Declaration/package boundary | Pass   | Build and package smoke expose only the checkpoint-owned root; internal controller/store/brand modules remain unexported.                                  |
| 14. Workspace regression         | Pass   | Lint, complete type/build matrix, 91 files/1,263 tests, package smoke, 782 boundaries, docs and formatting pass.                                           |
| 15. Exclusions and graph         | Pass   | Lock SHA-256 remains frozen; no dependency, native renderer, registry API, shell experience, version, release, publication or Git action is added.         |

## Verification

- `pnpm --filter @rabassoft/schema-engine-react typecheck`
- scoped and workspace ESLint
- React hook/controller suite — 2 files/29 tests
- React package build and package smoke
- complete `pnpm typecheck` and `pnpm test` outside the known Angular sandbox
  restriction — 91 files/1,263 tests
- all package smoke suites
- `node --test scripts/reference-boundaries.test.mjs` — 14/14
- `pnpm reference:test:boundaries` — 4 private references, 2 private product
  packages, 3 public packages, 38 manifest targets and 782 imports
- `node scripts/verify-react-foundation.mjs`
- `pnpm docs:check`, full Prettier and `git diff --check`
- unchanged lockfile SHA-256
  `70684a65a296e50f9ac08496a379ec5457361bc427178b6e15b9e81e235bde88`

Checkpoint 2 is accepted with zero findings in cycle 3. Checkpoint 3 is active
only for SPEC-021 rows 14–18; another dependency, native renderers, reference
experience, public version, release, publication and Git actions remain gated.
