# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-13 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `0ca1f39` (`develop` is seven commits ahead of
  `origin/develop`; no push has been performed by Codex)
- **Specification:** SPEC-001 Draft v0.1.13
- **Plan:** PLAN-006 revision 1, Approved
- **Phase:** M1–M5 completed; M6 active
- **Working tree:** PLAN-006 step 3 is implemented and verified but uncommitted

## Current objective

Deliver M6 under approved PLAN-006: normalize supported string enums and expose
them through a controlled native Angular select without promoting any deferred
capability.

## In progress

None. PLAN-006 step 3 is complete in the working tree; no implementation task is
active.

## Latest completed work

- Committed PLAN-006 step 2 as `0ca1f39` with repository identity
  `Rabassoft <ricard@rabassoft.com>`; no push was performed.
- Added two-pass runtime definition validation: the complete historical base
  shape is checked first, then own string `choices` are inspected safely.
- Rejects malformed arrays, indices, entries, members, duplicate values, and
  blank labels with the exact frozen choices-specific diagnostic before the
  external validator can run.
- Accepts valid frozen manual choices, inherited absence, missing values, and
  out-of-enum strings when the external validator permits them; caller-owned
  definitions remain untouched, and both operation utilities provably ignore
  accessor-shaped `choices` without production operation changes.
- Verified the workspace with 165 passing tests plus formatting, lint, type
  checking, builds, package smoke, framework boundaries, and diff integrity.

## Exact next action

Implement PLAN-006 step 4 only: extend neutral text contracts and Angular choice
text projection with focused identity, resolver, fallback, diagnostic, locale,
descriptor-safety, ordering, and immutability tests.

Before implementation, review the current uncommitted step-3 diff and PLAN-006
sections 2, 8, 11, 12, 13.3, 14, 15, and 16.

## Blockers and conflicts

- No implementation blocker.
- No active documentation conflict.
- PLAN-006 revision 1 and SPEC-001 Draft v0.1.13 authorize step 4.
- Step 3 passes verification and remains uncommitted; preserve its diff.

## Open questions outside the active scope

- D-024: an Angular validation bridge remains deferred pending a concrete
  consumer and explicit normalization semantics.
- D-036: the future presentation semantics of `const` remain deferred.
- D-037: the future assertion or annotation policy for supported `format`
  values remains deferred.
- D-010 and every other deferred item remain inactive.

## Latest verification

- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 11 files and 165 tests (129 core, 36 Angular).
- `pnpm build` and `pnpm test:package` passed for both packages.
- No dependency, lockfile, package version, or publication setting changed.
- Core still has zero runtime dependencies and no Angular, RxJS, DOM, or browser
  imports; Angular Forms imports remain limited to `@angular/forms/signals`.
- Operations do not read `choices`; runtime actions do not enforce enum
  membership; the external validator remains authoritative.
- All 31 Markdown files resolve their local links and `git diff --check` passed.

## Task document map

- Normative behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Active delivery contract: `.ai-docs/plans/006-string-enum-native-select.md`
- Active architectural decision: `.ai-docs/adrs/011-enum-string-normalizado-select-nativo.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Milestones: `.ai-docs/project/ROADMAP.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
