# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** current `HEAD`, PLAN-006/M6 completion (`develop` is
  ten commits ahead of `origin/develop`; no push has been performed by Codex)
- **Specification:** SPEC-001 Draft v0.1.13
- **Plan:** PLAN-006 revision 1, Completed
- **Phase:** M1–M6 completed; no active milestone
- **Working tree:** clean after the reviewed and verified PLAN-006/M6 completion
  commit

## Current objective

No active implementation objective. M6 is complete; preserve the controlled
prototype boundary while the next milestone or deferred decision is selected
and approved separately.

## In progress

None.

## Latest completed work

- Completed step 6 resolver, controlled integration, accessibility,
  standard/zoneless, lifecycle, malformed-token, and package-surface coverage.
- Fixed initial zoneless selection by reconciling the private Signal Forms token
  in a post-render write phase after dynamic options exist.
- Completed PLAN-006 and M6 end to end: normalized choices, safe runtime
  boundary, localized texts, ranked native select, and controlled behavior.
- Passed final acceptance with frozen installation, 175 tests, builds, package
  smoke, declaration inspection, architectural boundaries, links, and diff
  integrity.
- Re-reviewed the complete final step-6 and lifecycle diff without finding a
  correctness, scope, test, public-surface, or documentation issue.
- Committed the final PLAN-006/M6 checkpoint as
  `feat(angular): complete string enum support` with the Rabassoft identity; no
  push was performed.

## Exact next action

Select and approve the next milestone separately. Do not start D-010 or another
deferred capability without explicit promotion and approval.

## Blockers and conflicts

- No implementation blocker.
- No active documentation conflict.
- PLAN-006 revision 1 and M6 are completed; SPEC-001 remains Draft v0.1.13.
- The final step-6 and lifecycle closure is committed in the current `HEAD`;
  the working tree is clean.

## Open questions outside the active scope

- D-024: an Angular validation bridge remains deferred pending a concrete
  consumer and explicit normalization semantics.
- D-036: the future presentation semantics of `const` remain deferred.
- D-037: the future assertion or annotation policy for supported `format`
  values remains deferred.
- D-010 and every other deferred item remain inactive.

## Latest verification

- `CI=true pnpm install --frozen-lockfile` passed with the lockfile unchanged.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 13 files and 175 tests (129 core, 46 Angular).
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
- Completed delivery contract: `.ai-docs/plans/006-string-enum-native-select.md`
- Active architectural decision: `.ai-docs/adrs/011-enum-string-normalizado-select-nativo.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Milestones: `.ai-docs/project/ROADMAP.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
