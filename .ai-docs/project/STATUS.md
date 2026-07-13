# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-13 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `8eccfe4` (`develop` is six commits ahead of
  `origin/develop`; no push has been performed by Codex)
- **Specification:** SPEC-001 Draft v0.1.13
- **Plan:** PLAN-006 revision 1, Approved
- **Phase:** M1–M5 completed; M6 active
- **Working tree:** PLAN-006 step 2 is implemented and verified but uncommitted

## Current objective

Deliver M6 under approved PLAN-006: normalize supported string enums and expose
them through a controlled native Angular select without promoting any deferred
capability.

## In progress

None. PLAN-006 step 2 is complete in the working tree; no implementation task is
active.

## Latest completed work

- Committed PLAN-006 step 1 and the persistent-context repair as `8eccfe4` with
  repository identity `Rabassoft <ricard@rabassoft.com>`; no push was performed.
- Implemented PLAN-006 step 2 keyword classification and descriptor-safe
  parsing for string `enum` and UI `enumLabels`, including the exact
  `absent`/`valid`/`schema-blocked` cascade behavior.
- Added immutable ordered choices, custom labels, visible JSON-literal fallbacks
  for blank domain strings, and deterministic diagnostics without mutating or
  freezing caller inputs.
- Added 13 compiler fixtures and focused coverage for sparse/accessor entries,
  duplicate positions, incompatible locations, ignored branches, immutability,
  and getter suppression.
- Verified the complete workspace with 159 passing tests plus formatting, lint,
  type checking, builds, package smoke, local links, and diff integrity.

## Exact next action

Implement PLAN-006 step 3 only: extend runtime creation validation for manually
supplied string choices and add operation-boundary tests proving that
`applyOperation()` and `applyFormOperation()` do not inspect choices.

Before implementation, review the current uncommitted step-2 diff and PLAN-006
sections 2, 6, 7, 12, 13.2, 14, 15, and 16.

## Blockers and conflicts

- No implementation blocker.
- No active documentation conflict.
- PLAN-006 revision 1 and SPEC-001 Draft v0.1.13 authorize step 3.
- Step 2 passes verification and remains uncommitted; preserve its diff.

## Open questions outside the active scope

- D-024: an Angular validation bridge remains deferred pending a concrete
  consumer and explicit normalization semantics.
- D-036: the future presentation semantics of `const` remain deferred.
- D-037: the future assertion or annotation policy for supported `format`
  values remains deferred.
- D-010 and every other deferred item remain inactive.

## Latest verification

- `CI=true pnpm install --frozen-lockfile` passed without changing the lockfile.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 11 files and 159 tests (123 core, 36 Angular).
- `pnpm build` and `pnpm test:package` passed for both packages.
- Core still has zero runtime dependencies and no Angular, RxJS, DOM, or browser
  imports; Angular Forms imports remain limited to `@angular/forms/signals`.
- No enum-membership enforcement entered operations, runtime, or Angular.
- All 31 local Markdown files resolved their links and `git diff --check`
  passed.

## Task document map

- Normative behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Active delivery contract: `.ai-docs/plans/006-string-enum-native-select.md`
- Active architectural decision: `.ai-docs/adrs/011-enum-string-normalizado-select-nativo.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Milestones: `.ai-docs/project/ROADMAP.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
