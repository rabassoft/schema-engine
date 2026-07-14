# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** current `HEAD`, G0 acceptance checkpoint (`develop`
  is four commits ahead of `origin/develop`; no push has been performed for
  this checkpoint)
- **Specification:** SPEC-001 v0.1.14, Accepted
- **Last implementation plan:** PLAN-006 revision 1, Completed
- **Review gate:** G0 completed
- **Phase:** M1–M6 completed; no active implementation milestone
- **Working tree:** clean after committing the G0 review, correction, and
  acceptance documentation; no product code changed

## Current objective

Choose the next post-G0 milestone without implicitly promoting roadmap
candidates. No implementation milestone or delivery plan is active.

## In progress

- None. G0 and SPEC-001 acceptance are complete; no implementation task is
  active.

## Latest completed work

- Repeated the end-to-end review without findings, completed G0, and accepted
  SPEC-001 v0.1.14.
- Repeated format, lint, typecheck, 176 tests, builds, package smoke, and the
  built-package consumer successfully for acceptance.
- Resolved G0-F001 through G0-F003 in documentation via D-038, D-039, and the
  accepted `SubscribeResult` contract without changing product code.
- Completed the original G0 review and full verification with 22/22 criteria
  mapped and no evidence gap.
- Added and passed the minimal built-package Angular consumer with all four
  primitive field kinds and a controlled update.

## Exact next action

Decide whether to promote D-010 as M7 (explicit field clearing). If approved,
review its architectural and public-contract boundary before drafting the ADR
or PLAN-007; otherwise select another proposed post-G0 milestone explicitly.

## Blockers and conflicts

- No active implementation blocker or documentation conflict.
- G0-F001 through G0-F003 are resolved and the repeated review found no further
  issue.
- SPEC-001 is Accepted, but every public API remains Experimental unless a
  separate ADR promotes it.
- `develop` is four commits ahead of `origin/develop`; the G0 acceptance
  checkpoint is committed and no push was performed.

## Open questions outside the active scope

- D-010/M7 and D-005/M9 remain Candidate; their roadmap placement does not
  promote them.
- D-038 and D-039 remain Deferred; correcting SPEC-001 does not promote their
  implementation.
- Publication under M8 remains a separate future decision, including license,
  registry, provenance, credentials, and automation.
- D-024, D-036, D-037, and every other deferred item remain inactive.

## Latest verification

- `CI=true pnpm install --frozen-lockfile` passed with the lockfile unchanged.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 14 files and 176 tests (129 core, 47 Angular).
- `pnpm build` and `pnpm test:package` passed for both packages.
- No dependency, lockfile, package version, or publication setting changed.
- Core still has zero runtime dependencies and no Angular, RxJS, DOM, or browser
  imports; Angular Forms imports remain limited to `@angular/forms/signals`.
- Operations do not read `choices`; runtime actions, text projection, and the
  select do not enforce enum membership; the external validator remains
  authoritative.
- All 32 Markdown files and 141 local links resolve; `git diff --check` passed.
- The documentation-only post-M6 synchronization passes formatting, local-link,
  stale-reference, and diff-integrity checks.
- The G0 approval checkpoint passes formatting, local-link, state-consistency,
  and diff-integrity checks.
- The evidence inventory maps 22/22 criteria with no gap.
- `pnpm test:consumer` passed after both package builds: 1 test file and 1 test.
  Workspace lint and typecheck also pass; the lockfile is unchanged.
- Declaration/public-surface inspection and architectural boundary searches
  passed without unintended manifest, package-entry, dependency, or lockfile
  changes.
- The G0 corrective documentation passes formatting, 32-document/143-link
  resolution, contract-consistency searches, and diff integrity.
- The repeated review passes format, lint, typecheck, 14 files/176 tests, both
  builds, package smoke, consumer, declaration, boundary, 143-link, and diff
  checks with no finding.

## Task document map

- Normative behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Review-gate state and future sequence: `.ai-docs/project/ROADMAP.md`
- G0 acceptance evidence: `.ai-docs/reviews/001-spec-001-acceptance.md`
- Minimal built-package consumer: `packages/angular/test/consumer.test.ts`
- Completed delivery contract: `.ai-docs/plans/006-string-enum-native-select.md`
- Last accepted increment decision: `.ai-docs/adrs/011-enum-string-normalizado-select-nativo.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
