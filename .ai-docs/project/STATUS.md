# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `180fe87`, synchronized with `origin/develop`
- **Specification:** SPEC-001 Draft v0.1.13
- **Plan:** PLAN-006 revision 1, Completed
- **Phase:** M1–M6 completed; no active milestone
- **Working tree:** uncommitted documentation-only checkpoint clarifying current
  state and the proposed post-M6 sequence

## Current objective

No active implementation objective. Preserve the completed M1-M6 controlled
prototype boundary while the proposed G0/M7-M12 sequence is reviewed and each
future item is approved separately.

## In progress

None.

## Latest completed work

- Synchronized the canonical checkpoint with pushed revision `180fe87` and
  corrected the root documentation from its obsolete M1-only description.
- Clarified that M1-M6 implement the current Draft v0.1.13 walking skeleton
  while SPEC-001 still requires a separate formal acceptance review.
- Recorded G0 and M7-M12 as a proposed dependency-ordered post-M6 sequence,
  explicitly without activating or promoting deferred capabilities.
- Completed PLAN-006 and M6 end to end with 175 tests, builds, package smoke,
  declaration review, architectural boundary checks, and controlled native
  string enum behavior.
- The final M6 checkpoint, `feat(angular): complete string enum support`, is
  committed at `180fe87` and present on `origin/develop`.

## Exact next action

Review and explicitly approve whether G0 becomes the next active effort. Do not
start G0, D-010/M7, release preparation, or another deferred capability from the
roadmap proposal alone.

## Blockers and conflicts

- No implementation blocker.
- No active documentation conflict.
- PLAN-006 revision 1 and M6 are completed; SPEC-001 remains Draft v0.1.13.
- `develop` and `origin/develop` both point to `180fe87`; the current working
  tree contains only this uncommitted documentation checkpoint.

## Open questions outside the active scope

- G0 is proposed but not approved: formal SPEC-001 acceptance needs an evidence
  map and a minimal built-package Angular consumer.
- D-010/M7 and D-005/M9 remain Candidate; their roadmap placement does not
  promote them.
- Publication under M8 remains a separate future decision, including license,
  registry, provenance, credentials, and automation.
- D-024, D-036, D-037, and every other deferred item remain inactive.

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
- The documentation-only post-M6 synchronization passes formatting, local-link,
  stale-reference, and diff-integrity checks.

## Task document map

- Normative behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Completed delivery contract: `.ai-docs/plans/006-string-enum-native-select.md`
- Last accepted increment decision: `.ai-docs/adrs/011-enum-string-normalizado-select-nativo.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Completed milestones and proposed sequence: `.ai-docs/project/ROADMAP.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
