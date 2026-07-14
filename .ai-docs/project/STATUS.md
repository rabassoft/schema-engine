# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** current `HEAD`, ADR-012 acceptance and SPEC-001
  v0.1.15 checkpoint (`develop` is five commits ahead of `origin/develop`; no
  push has been performed for this checkpoint)
- **Specification:** SPEC-001 v0.1.15, Accepted
- **Last implementation plan:** PLAN-007 revision 2, Completed
- **Active implementation plan:** None
- **Last accepted decision:** ADR-012 revision 1
- **Review gate:** G0 completed
- **Phase:** M1–M7 and G0 completed; M8–M12 remain proposals
- **Working tree:** uncommitted M7 implementation and completion documentation;
  no active implementation task

## Current objective

Select and review the next post-M7 milestone without activating implementation
or publication prematurely.

## In progress

- None.

## Latest completed work

- Completed PLAN-007 revision 2 and M7: all four native renderers now expose a
  localized, accessible, presence-driven clear action through the existing
  controlled `remove-value` flow.
- Hardened outlet lifecycle routing by capturing field/runtime identity,
  reconciling focused same-runtime detach, and ignoring stale destruction-time
  outputs.
- Repeated the complete implementation review after corrections; the final pass
  produced zero findings or requested changes and all 179 tests passed.
- Added the persistent rule that every correction must be followed by a full
  applicable review until a complete pass has zero findings.
- Approved PLAN-007 revision 2 after its corrected second review completed with
  zero findings.

## Exact next action

Review the M8 preparation boundary and decide whether to draft its required
decision and delivery plan; do not publish packages or change publication
settings yet.

## Blockers and conflicts

- No active implementation blocker or documentation conflict.
- SPEC-001 is Accepted, but every public API remains Experimental unless a
  separate ADR promotes it to Stable.
- M8 is only a roadmap proposal. License, registry, provenance, credentials,
  automation, and actual publication require separate review and approval.
- `develop` is five commits ahead of `origin/develop`; the M7 working-tree
  changes are not committed or pushed.

## Open questions outside the active scope

- D-005/M9 remains Candidate; its roadmap placement does not promote it.
- D-038 and D-039 remain Deferred.
- D-024, D-036, D-037, and every other deferred item remain inactive.

## Latest verification

- `CI=true pnpm install --frozen-lockfile` passed with the lockfile unchanged.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 129 core and 50 Angular tests (179 total).
- `pnpm build`, `pnpm test:package`, and `pnpm test:consumer` passed.
- Built declarations expose only the intended Experimental additions:
  `FieldTextMember: 'clear'` and required
  `AngularFieldTextSnapshot.clearLabel`.
- Core isolation, Angular Signal Forms imports, dependency/package boundaries,
  all 34 Markdown files and 156 local links, and `git diff --check` passed.
- No dependency, lockfile, manifest, package version, entry point, export map,
  publication setting, or Stable API status changed.
- The complete review was repeated after corrections and finished with zero
  findings or unresolved changes.

## Task document map

- Normative behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Roadmap and future sequence: `.ai-docs/project/ROADMAP.md`
- G0 acceptance evidence: `.ai-docs/reviews/001-spec-001-acceptance.md`
- Completed M7 delivery contract:
  `.ai-docs/plans/007-explicit-native-field-clearing.md`
- M7 architectural decision: `.ai-docs/adrs/012-limpieza-explicita-campos.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
