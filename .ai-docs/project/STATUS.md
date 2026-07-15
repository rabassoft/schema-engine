# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-15 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1 and SPEC-005 v0.1.1
- **Last proposed specification:** None
- **Last implementation plan:** PLAN-012 revision 1, Completed
- **Last completed implementation plan:** PLAN-012 revision 1
- **Active implementation task:** None
- **Last accepted ADR:** ADR-017 revision 0
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9, D-006/M10, D-041/M11 and D-042/M12
  implemented within their accepted slices
- **Phase:** M1–M12 and G0 completed
- **Package candidates:** private independent `0.1.0` artifacts; unpublished

## Current objective

Preserve the completed M1–M12 baseline while selecting the next deferred
capability for an explicit promotion-readiness assessment.

## In progress

- None.

## Latest completed work

- Completed PLAN-012 revision 1 and M12 after review 026 cycle 6 closed with
  zero findings following the complete green matrix in cycle 3.
- Completed PLAN-012 checkpoint 4 with all 18 SPEC-005 evidence areas,
  declarations, packages, artifacts and repository/clean consumers covered.
- Completed PLAN-012 checkpoint 3 with fixed Internal Angular section
  projection, accessible markup/IDs, text failure isolation and lifecycle
  cleanup while preserving existing renderer identity.
- Completed PLAN-012 checkpoint 2 with descriptor-safe iterative root
  presentation inspection, complete diagnostics and atomic immutable fallback.
- Completed PLAN-012 checkpoint 1 with the exact seven Public core symbols,
  default forests, manual-definition validation and repository migration.

## Exact next action

Ask Ricard to select the next deferred capability to assess; then prepare only
its promotion-readiness review. Do not activate D-011, D-012, D-040 or any
other deferred capability without explicit promotion.

## Blockers and conflicts

- No implementation blocker, open review finding or documentation conflict.
- D-042 remains registrally Promoted and its narrow M12 slice is implemented.
- D-011 and D-012 remain Deferred outside D-042's exact boundary.
- D-040 remains Deferred; no publication, version or Stable promotion is
  authorized.
- SPEC-001 v0.1.15 remains the behavioral baseline. SPEC-002, SPEC-003,
  SPEC-004 and SPEC-005 are authoritative only for their accepted extensions.

## Open questions

- Which deferred capability, if any, should receive the next
  promotion-readiness assessment?

## Latest verification

- Review 026 cycle 6 closes all ten implementation-review areas and all 18
  SPEC-005 evidence groups with zero findings; the full matrix passed in cycle
  3 and closing documentation checks passed in cycle 6.
- Frozen-lockfile installation, 359 core and 76 Angular tests, build/typecheck,
  package smoke, packed artifacts, repository consumer and clean core plus
  lower/upper Angular 22.0.6 consumers pass.
- Documentation checks pass across 76 Markdown files and 360 local links;
  lint, formatting and `git diff --check` pass.
- Root exports contain exactly the seven accepted presentation symbols; no
  Public Angular symbol or deep import was added.
- Manifests, dependencies, versions, lockfile, publication state and Stable
  classification are unchanged.

## Task document map

- Completed M12 plan: `.ai-docs/plans/012-static-presentation-groups.md`
- Final M12 implementation review:
  `.ai-docs/reviews/026-plan-012-implementation-review.md`
- Accepted M12 architecture: `.ai-docs/adrs/017-grupos-presentacion-estaticos.md`
- Accepted M12 behavior: `.ai-docs/specs/005-static-presentation-groups.md`
- M12 promotion review:
  `.ai-docs/reviews/022-m12-advanced-ui-promotion-readiness.md`
- Promoted/deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Milestone sequence: `.ai-docs/project/ROADMAP.md`
- Accepted behavior baselines: `.ai-docs/specs/001-controlled-form-runtime.md`,
  `.ai-docs/specs/002-nested-object-runtime.md`,
  `.ai-docs/specs/003-collection-runtime.md`,
  `.ai-docs/specs/004-local-reference-resolution.md` and
  `.ai-docs/specs/005-static-presentation-groups.md`
- ADR status index: `.ai-docs/adrs/000-index.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
