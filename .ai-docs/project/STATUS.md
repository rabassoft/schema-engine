# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-15 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1 and SPEC-005 v0.1.1
- **Last proposed specification:** None
- **Last implementation plan:** PLAN-013 revision 1, Approved
- **Last completed implementation plan:** PLAN-012 revision 1
- **Active implementation task:** None
- **Last accepted ADR:** ADR-018 revision 1
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9, D-006/M10, D-041/M11 and D-042/M12
  implemented within their accepted slices; D-034/D-040 promoted for M13
  normative design only
- **Phase:** M1–M12 and G0 completed; M13 checkpoint 4 local commit complete,
  push pending
- **Package candidates:** public-ready independent `0.1.0` artifacts with
  verified licensed Corresponding Source; unpublished

## Current objective

Preserve the clean checkpoint 4 commit and verified candidates; stop before
push or npm authentication.

## In progress

- None. The local commit and clean rebuild are complete; push remains an
  explicit checkpoint 4 gate.

## Latest completed work

- Created the authorized checkpoint 4 local commit with Rabassoft attribution
  and rebuilt deterministic candidates from its clean tree; no push occurred.
- Completed PLAN-013 checkpoint 3 after review 030 cycle 5 repeated the full
  local gate with zero findings and deterministic SHA-512 candidate hashes.
- Added isolated release security/dry-run tooling; npm `10.9.8` accepts both
  exact tarballs under public `next` with provenance disabled in dry-run mode.
- Completed PLAN-013 checkpoint 2 after review 030 cycle 3 passed completely
  with zero findings; only the two package manifests are locally publishable.
- Completed PLAN-013 checkpoint 1 after review 030 cycle 2 passed all eight
  areas with zero findings following four source-package corrections.
- Accepted PLAN-013 revision 1 after review 029 cycle 4 corrected a
  source-package checkpoint-order conflict and repeated all eight areas with
  zero findings; Ricard confirmed `ricard@rabassoft.com` as public contact.

## Exact next action

Choose and authorize reconciliation of remote pre-amend commit `1e71ce6` with
the final local checkpoint commit before any push; do not mutate npm yet.

## Blockers and conflicts

- No implementation blocker, open review finding or documentation conflict.
- Checkpoint 4 local commit is complete; push remains explicitly unauthorized.
- `origin/develop` now points to pre-amend commit `1e71ce6`, while local
  `develop` contains the final amended commit. Their histories diverge;
  force-with-lease or a history-preserving follow-up requires an explicit choice
  before push.
- D-042 remains registrally Promoted and its narrow M12 slice is implemented.
- D-011 and D-012 remain Deferred outside D-042's exact boundary.
- D-034/D-040 are Promoted only for normative design; no publication, version
  or Stable promotion is authorized.
- Review 027 cycle 2 passes with zero findings. Ricardo Rabassó Rodríguez is the
  legal licensor, the exact public notice is fixed and the repository remains
  private pending sanitization.
- ADR-018 revision 1 and PLAN-013 revision 1 are Accepted/Approved. Reversible
  local preparation is active; commit, push, credential, tag, visibility and
  registry mutations remain unauthorized.
- SPEC-001 v0.1.15 remains the behavioral baseline. SPEC-002, SPEC-003,
  SPEC-004 and SPEC-005 are authoritative only for their accepted extensions.

## Open questions

- None within the active local checkpoint.

## Latest verification

- Review 026 cycle 6 closes all ten implementation-review areas and all 18
  SPEC-005 evidence groups with zero findings; the full matrix passed in cycle
  3 and closing documentation checks passed in cycle 6.
- Frozen install, formatting, documentation across 86 Markdown files and 384
  local links, lint, typecheck, 359 core plus 76 Angular tests, explicit build,
  package/artifact/repository/clean consumers and diff checks pass.
- Release security audit, isolated source rebuilds and npm dry-runs pass. Two
  preparations produced identical SHA-512 hashes: core `dceb432e…fdb310e` and
  Angular `ef1e491d…fa4b1507`; full hashes are in review 030 and the ignored
  `.release/0.1.0/candidates.json`.
- Versions, exports, dependencies, peers, runtime behavior and Experimental
  classification remain unchanged; no remote or Git mutation occurred.

## Task document map

- Completed M12 plan: `.ai-docs/plans/012-static-presentation-groups.md`
- Final M12 implementation review:
  `.ai-docs/reviews/026-plan-012-implementation-review.md`
- Completed D-034/D-040 readiness review:
  `.ai-docs/reviews/027-d034-d040-publication-licensing-readiness.md`
- Accepted M13 architecture:
  `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- Complete ADR-018 review: `.ai-docs/reviews/028-adr-018-review.md`
- Active PLAN-013 review: `.ai-docs/reviews/029-plan-013-review.md`
- Active PLAN-013 implementation review:
  `.ai-docs/reviews/030-plan-013-implementation-review.md`
- Approved M13 delivery contract:
  `.ai-docs/plans/013-public-experimental-release.md`
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
