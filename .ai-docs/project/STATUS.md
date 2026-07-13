# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** current `HEAD`, G0 matrix and consumer checkpoint
  (`develop` is three commits ahead of `origin/develop`; no push has been
  performed for this checkpoint)
- **Specification:** SPEC-001 Draft v0.1.13
- **Last implementation plan:** PLAN-006 revision 1, Completed
- **Review gate:** G0, Approved and active
- **Phase:** M1–M6 completed; no active implementation milestone
- **Working tree:** clean after committing the G0 matrix and minimal consumer;
  no product code changed

## Current objective

Complete G0 by reviewing the already implemented SPEC-001 boundary. The
22-criterion evidence map and minimal Angular consumer pass; repeat full
verification and accept SPEC-001 only if the final review also passes.

## In progress

- G0 formal prototype closure. The evidence matrix maps 22/22 criteria with no
  gap and the minimal built-package Angular consumer passes. Full verification
  is the next pending gate; no product behavior or deferred capability is active.

## Latest completed work

- Added and passed a minimal Angular consumer that imports both built package
  roots, renders all primitive field kinds, and completes a controlled update.
- Completed the G0 acceptance matrix with direct automated evidence for all 22
  SPEC-001 walking-skeleton criteria and no identified evidence gap.
- Approved and activated G0 as a review-only gate with fail-closed acceptance.
- Completed PLAN-006 and M6 end to end with 175 tests, builds, package smoke,
  declaration review, architectural boundary checks, and controlled native
  string enum behavior.
- The final M6 checkpoint, `feat(angular): complete string enum support`, is
  committed at `180fe87` and present on `origin/develop`.

## Exact next action

Run the complete G0 verification: frozen install; format, lint, typecheck, full
tests, builds, package smoke, declarations, architectural boundaries, Markdown
links, and diff integrity.

## Blockers and conflicts

- No implementation blocker.
- No active documentation conflict.
- PLAN-006 revision 1 and M6 are completed; SPEC-001 remains Draft v0.1.13 until
  G0 passes.
- All 22 acceptance criteria have mapped evidence and the consumer check passes;
  G0 remains open for full verification and the end-to-end SPEC review.
- The committed G0 matrix and consumer checkpoint is the current `HEAD`; the
  working tree is clean and `develop` is three commits ahead of
  `origin/develop`.

## Open questions outside the active scope

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
- The G0 approval checkpoint passes formatting, local-link, state-consistency,
  and diff-integrity checks.
- The evidence inventory maps 22/22 criteria with no gap; formatting, all 32
  Markdown files and their local links, state consistency, and diff integrity
  pass for this checkpoint.
- `pnpm test:consumer` passed after both package builds: 1 test file and 1 test.
  Workspace lint and typecheck also pass; the lockfile is unchanged.

## Task document map

- Normative behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Active review gate and future sequence: `.ai-docs/project/ROADMAP.md`
- G0 acceptance evidence: `.ai-docs/reviews/001-spec-001-acceptance.md`
- Minimal built-package consumer: `packages/angular/test/consumer.test.ts`
- Completed delivery contract: `.ai-docs/plans/006-string-enum-native-select.md`
- Last accepted increment decision: `.ai-docs/adrs/011-enum-string-normalizado-select-nativo.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
