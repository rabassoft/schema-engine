# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-13 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `17561d2` (`develop` is eight commits ahead of
  `origin/develop`; no push has been performed by Codex)
- **Specification:** SPEC-001 Draft v0.1.13
- **Plan:** PLAN-006 revision 1, Approved
- **Phase:** M1–M5 completed; M6 active
- **Working tree:** PLAN-006 steps 4 and 5 are implemented and verified but
  uncommitted

## Current objective

Deliver M6 under approved PLAN-006: normalize supported string enums and expose
them through a controlled native Angular select without promoting any deferred
capability.

## In progress

None.

## Latest completed work

- Committed PLAN-006 step 3 as `17561d2` with repository identity
  `Rabassoft <ricard@rabassoft.com>`; no push was performed.
- Completed step 4 choice text contracts and projection with exact contexts,
  diagnostics, identity, locale, descriptor-safety, and immutability coverage.
- Added Public Experimental `SchemaStringEnumRendererComponent` with the fixed
  selector and existing Angular root entry point.
- Implemented a private Signal Forms token buffer: missing/out-of-enum uses the
  disabled empty sentinel and every choice, including domain `""`, uses its
  positional token without optimistic state.
- Registered `native-string-enum` at rank 20 and priority 0 using an own-data
  descriptor tester; ordinary strings retain the rank-10 fallback.
- Added focused rank, descriptor-safety, sentinel, token, empty-domain-value,
  and controlled-reconciliation tests; the workspace now passes 172 tests.

## Exact next action

Implement PLAN-006 step 6 only: add integration, accessibility, resolver,
controlled-state, zoneless, and package-surface tests for the native string-enum
renderer.

Before implementation, review the current uncommitted step-4 and step-5 diff
and PLAN-006 sections 2, 9, 10, 11, 12, 13.4, 13.5, 14, 15, and 16.

## Blockers and conflicts

- No implementation blocker.
- No active documentation conflict.
- PLAN-006 revision 1 and SPEC-001 Draft v0.1.13 authorize step 6.
- Step 3 is committed in `17561d2`; the verified step-4 and step-5 diff remains
  uncommitted and there is no active implementation task.

## Open questions outside the active scope

- D-024: an Angular validation bridge remains deferred pending a concrete
  consumer and explicit normalization semantics.
- D-036: the future presentation semantics of `const` remain deferred.
- D-037: the future assertion or annotation policy for supported `format`
  values remains deferred.
- D-010 and every other deferred item remain inactive.

## Latest verification

- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 13 files and 172 tests (129 core, 43 Angular).
- `pnpm build` and `pnpm test:package` passed for both packages.
- No dependency, lockfile, package version, or publication setting changed.
- Core still has zero runtime dependencies and no Angular, RxJS, DOM, or browser
  imports; Angular Forms imports remain limited to `@angular/forms/signals`.
- Operations do not read `choices`; runtime actions, text projection, and the
  select do not enforce enum membership; the external validator remains
  authoritative.
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
