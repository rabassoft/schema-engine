# PLAN-037 checkpoint 6 implementation review — Cycles 1–3

- **Date:** 2026-08-07
- **State:** Complete; checkpoint 6 accepted
- **Reviewed:** PLAN-037 checkpoint 6 and SPEC-021 rows 26–28 against Accepted
  ADR-038 revision 0, SPEC-001/SPEC-006/SPEC-010/SPEC-013/SPEC-020 behavior,
  completed checkpoints 1–5 and unchanged M1–M34 behavior
- **Outcome:** Cycles 1–2 found and corrected six hidden-owner, text-order,
  safe-output and evidence defects. Cycle 3 repeated all sixteen areas with
  zero findings. Checkpoint 6 is complete; checkpoint 7 may add only the
  independent React reference shell in rows 29–30.

## Review cycles and corrections

| Finding  | Correction                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R348-F01 | Made every field and collection action below an inactive wizard step inert while retaining the mounted component tree and its target-local state.                   |
| R348-F02 | Split wizard text and subtree projection into deterministic passes so all ordered step indicators resolve before descendant presentation and control text.          |
| R348-F03 | Rendered global wizard issues from the normalized safe issue code, matching the Accepted neutral projection instead of selecting an optional fallback ad hoc.       |
| R348-F04 | Added complete controlled navigation evidence for pending, confirm, reject, previous, completion, no direct selection, retained nested/native state and focus.      |
| R348-F05 | Added pending/failed/retry/settled-invalid async evidence proving repeated projection invokes no validator and only the explicit facade action starts another pass. |
| R348-F06 | Added scope read/reveal/hide/global-visibility and external baseline-confirmation evidence proving no value identity or operation mutation.                         |

Each correction triggered another complete applicable review. Cycle 3 contains
no finding or unresolved change request.

## Cycle 3 complete review

| Area                             | Result | Evidence                                                                                                                                              |
| -------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and rows            | Pass   | Only SPEC-021 rows 26–28 complete; the reference shell, packaging, release and Git scope remain inactive.                                             |
| 2. Neutral validation            | Pass   | React reads normalized field/form/wizard validation snapshots and delegates retry; it adds no validator, transport or settlement policy.              |
| 3. Synchronous issues            | Pass   | Snapshot-owned visibility controls issue text and semantic `aria-invalid`; no React-local validity calculation exists.                                |
| 4. Async technical state         | Pass   | Pending, failed and settled-invalid states remain facade/snapshot owned; render replay does not invoke the async validator.                           |
| 5. Retry                         | Pass   | Only `retryAsyncValidation` starts the next core generation; React adds no automatic retry, timer or service policy.                                  |
| 6. Scope reads                   | Pass   | Exact application scopes pass unchanged to read/reveal/hide actions and emit no operation or value mutation.                                          |
| 7. Baseline confirmation         | Pass   | A confirmed external baseline enters through controlled config reconciliation while preserving value identity and emitting no operation.              |
| 8. Wizard normalized boundary    | Pass   | The sole normalized root wizard consumes exact definition/snapshot state and never computes step validity, progress, selection or scope.              |
| 9. Stable step lifecycle         | Pass   | Every step subtree mounts once per epoch; inactive steps remain mounted, hidden/inert and retain nested/native presentation state.                    |
| 10. Controlled intentions        | Pass   | Previous/next/complete delegate once; selection changes only after exact application confirmation, rejection stays put and pending cannot advance.    |
| 11. Gate and completion behavior | Pass   | Core-owned step/global gates, progress, completion attempt and safe global issue evidence project without submission or direct-step navigation.       |
| 12. Hidden and stale interaction | Pass   | Hidden-step leaf/collection domain callbacks are inert while current owners regain fresh interactivity from the next committed snapshot.              |
| 13. Text order and fallback      | Pass   | Wizard label, ordered indicator members, descendant text and controls resolve deterministically with safe cached fallback diagnostics.                |
| 14. Accessibility and focus      | Pass   | Noninteractive ordered indicators, current/progress/busy state, labelled hidden regions and focus transfer after step deactivation pass DOM evidence. |
| 15. Package and boundaries       | Pass   | Wizard hosts/text stay Internal; the Public root inventory and frozen dependency graph are unchanged with no Angular/Standard implementation import.  |
| 16. Regression and exclusions    | Pass   | Workspace types/tests, package/build/boundary checks, lint/format/diff and no-transport/no-submit audits pass without version, release or Git drift.  |

## Verification

- React typecheck, ESLint, build and package smoke
- React controller/hook/registry/projection/native/compound/text/wizard suite —
  8 files/83 tests
- recursive typechecks across all nine applicable workspace projects
- recursive unit matrix — 97 files/1,317 tests
- every package smoke suite
- React dependency build across core, validator, scenarios, adapter and shell
- `node --test scripts/reference-boundaries.test.mjs` — 14/14
- `pnpm reference:test:boundaries` — 4 private references, 2 private product
  packages, 3 public packages, 38 manifest targets and 865 imports
- `node scripts/verify-react-foundation.mjs`
- `pnpm lint`, `pnpm format:check`, `pnpm docs:check` and `git diff --check`
- unchanged lockfile SHA-256
  `70684a65a296e50f9ac08496a379ec5457361bc427178b6e15b9e81e235bde88`

No checkpoint-6 file changes core, Angular or Standard production behavior.
Their complete unit/type regressions pass. No application-owned persistence,
transport, submit state, dependency, version, release, publication, commit,
push or external action enters the checkpoint.

Checkpoint 6 is accepted with zero findings in cycle 3. Checkpoint 7 is active
only for SPEC-021 rows 29–30 and the independent private React reference shell;
packaging, another dependency, public version, release, publication and Git
actions remain gated.
