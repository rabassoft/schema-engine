# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-13 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `5e0bd69` (`develop` is five commits ahead of
  `origin/develop`; no push has been performed by Codex)
- **Specification:** SPEC-001 Draft v0.1.13
- **Plan:** PLAN-006 revision 1, Approved
- **Phase:** M1–M5 completed; M6 active
- **Working tree:** PLAN-006 step 1 is implemented and verified but uncommitted;
  the persistent-state documents also contain the completed documentation-memory
  repair

## Current objective

Deliver M6 under approved PLAN-006: normalize supported string enums and expose
them through a controlled native Angular select without promoting any deferred
capability.

## In progress

None. The documentation-memory repair and PLAN-006 step 1 are complete in the
working tree; no implementation task is active.

## Latest completed work

- Compacted the persistent-context workflow: `STATUS.md` now contains only the
  present checkpoint, `HANDOFF.md` is stable orientation, and `AGENTS.md`
  requires targeted SPEC/ADR/plan/deferred/history reads.
- Preserved every historical `WORKLOG.md` entry and made its latest-entry/search
  policy explicit; no history was deleted or rewritten.
- Completed and committed the ADR-011 acceptance and PLAN-006 approval
  synchronization in `5e0bd69`; SPEC-001 is Draft v0.1.13.
- Completed PLAN-006 step 1 in the working tree: added public experimental
  `StringChoiceDefinition`, `StringFieldDefinition.choices`, and
  `FieldUiSchema.enumLabels`, including the core root export and focused tests.
- Verified step 1 across the workspace: format, lint, typecheck, 141 tests,
  build, package smoke, generated declarations, Markdown links, and diff
  integrity all passed.

## Exact next action

Implement PLAN-006 step 2 only: add enum keyword classification,
descriptor-safe `enum` and `enumLabels` parsing, immutable choice construction,
compiler conformance fixtures, and focused cascade-suppression tests.

Before implementation, review the existing uncommitted step-1 diff and the
relevant PLAN-006 sections 2, 4, 5, 13.1, 13.2, 14, 15, and 16.

## Blockers and conflicts

- No implementation blocker.
- No active documentation conflict.
- PLAN-006 revision 1 and SPEC-001 Draft v0.1.13 authorize step 2.
- The working tree is intentionally dirty with the verified, uncommitted step-1
  increment; preserve those changes.

## Open questions outside the active scope

- D-024: an Angular validation bridge remains deferred pending a concrete
  consumer and explicit normalization semantics.
- D-036: the future presentation semantics of `const` remain deferred.
- D-037: the future assertion or annotation policy for supported `format`
  values remains deferred.
- D-010 and every other deferred item remain inactive.

## Latest verification

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 11 files, 141 tests (105 core, 36 Angular)
- `pnpm build`
- `pnpm test:package`
- Generated core declarations expose the three step-1 contracts through the
  existing public modules; no entry point or runtime dependency was added.
- All 31 local Markdown files resolved their links and `git diff --check`
  passed for the step-1 checkpoint.
- The documentation-memory repair passed repository formatting, validation of
  all local Markdown links, unique-current-state checks, and `git diff --check`.

## Task document map

- Normative behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Active delivery contract: `.ai-docs/plans/006-string-enum-native-select.md`
- Active architectural decision: `.ai-docs/adrs/011-enum-string-normalizado-select-nativo.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Milestones: `.ai-docs/project/ROADMAP.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
