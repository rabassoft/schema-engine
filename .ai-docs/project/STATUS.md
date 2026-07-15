# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-15 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1 and SPEC-006 v0.1.1
- **Last proposed specification:** None
- **Last implementation plan:** PLAN-014 revision 0, Completed
- **Last completed implementation plan:** PLAN-014 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-019 revision 1, coordinated with ADR-005 revision 4
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9, D-006/M10, D-041/M11 and D-042/M12
  implemented within their accepted slices; D-034/D-040 active only within
  accepted M13 delivery; D-009/M14 implemented locally under completed PLAN-014
- **Phase:** M1–M14 and G0 completed locally
- **Published packages:** core and Angular `0.1.0` are live and byte-identical
  to their accepted candidates

## Current objective

Prepare and review PLAN-015 for a coordinated Experimental `0.2.0` release of
core and Angular containing the completed local M14 changes; live `0.1.0`
remains pre-M14.

## In progress

- None. PLAN-014 revision 0 and M14 completed locally after review 041 cycle 2
  passed the complete implementation review with zero findings.

## Latest completed work

- Authorized preparation and review of PLAN-015 for coordinated core and
  Angular `0.2.0`. ADR-010 determines MINOR rather than PATCH; no manifest,
  candidate, publication or external mutation was authorized.
- Completed PLAN-014 revision 0 and local M14 after final review 041 cycle 2
  passed the complete authority, diff, declaration, package, documentation and
  deferred-boundary review with zero findings.
- Completed PLAN-014 checkpoint 5 after review 040 cycle 1 mapped all 23 groups
  and passed declarations, packages, artifacts, source and clean consumers with
  zero findings, establishing the baseline for final review 041.
- Completed PLAN-014 checkpoint 4 after review 039 cycle 2 passed all six areas
  with zero findings; exact Angular native null projection is active locally
  without renderer-registry or package drift.
- Completed PLAN-014 checkpoint 3 after review 038 cycle 1 passed all six
  areas with zero findings; definition-aware null operations/runtime are active
  locally while Angular null projection remains inactive.

## Exact next action

Draft PLAN-015 revision 0 for coordinated core and Angular `0.2.0`, then review
and correct it until a complete pass has zero findings. Do not change package
versions, prepare candidates, publish or mutate external state under this
authorization.

## Blockers and conflicts

- No implementation, environment, external-system or documentation blocker.
  PLAN-014 and local M14 are complete.
- npm's mandatory `latest: 0.1.0` is accepted only as an Experimental alias to
  each inspected package version; `next` remains recommended.
- The immutable live core `0.1.0` README retains the pre-discovery no-`latest`
  sentence. Release notes/ADR supersede it; future package versions carry the
  corrected wording and published bytes are not overwritten.
- Both exact `0.1.0` packages are public and verified; no Stable promotion,
  provenance, Git tag, GitHub Release or settings change occurred.
- npm-generated public `_resolved`/`_from` metadata exposes the local username
  and workspace path used for both immutable publications. It is absent from
  tarballs/manifests and contains no credential or repository URL; future
  publication must use a neutral directory and verify public metadata.
- The repository is not ready for public visibility under ADR-018: no accepted
  full-history sanitization exists, 77 internal `.ai-docs` files are tracked,
  remote default `main` remains at the initialization commit, Issues is enabled
  despite the no-public-issue policy, and public community/security boundaries
  have not been reviewed.
- Private local/remote `develop` was synchronized through `6f13987` before the
  documented M13 closure; later pushes retain separate approval gates.
- D-042 remains registrally Promoted and its narrow M12 slice is implemented.
- D-011 and D-012 remain Deferred outside D-042's exact boundary.
- D-034/D-040 are delivered by completed M13/PLAN-013. D-043 is Deferred and no
  Stable promotion is authorized.
- Review 027 cycle 2 passes with zero findings. Ricardo Rabassó Rodríguez is the
  legal licensor, the exact public notice is fixed and the repository remains
  private pending sanitization.
- ADR-018 revision 3 and PLAN-013 revision 4 are Accepted/Completed. Every
  future registry/settings mutation remains separately gated.
- PLAN-015 preparation and review are authorized with `0.2.0` as the
  ADR-010-compliant target for both affected packages. Plan approval,
  implementation and every registry mutation remain separate gates.
- SPEC-001 v0.1.15 remains the behavioral baseline. SPEC-002, SPEC-003,
  SPEC-004 and SPEC-005 are authoritative only for their accepted extensions.

## Open questions

- None. The coordinated release-plan target is core and Angular `0.2.0`.

## Latest verification

- The coordinated `0.2.0` planning decision is consistent with ADR-010,
  ADR-018, SPEC-006, PLAN-014 and D-009. Formatting, documentation across 100
  Markdown files and 441 local links, and diff checks pass.
- Review 041 cycle 2 passes the complete final implementation review with zero
  findings after correcting container-exclusion ownership. Frozen install,
  formatting, documentation across 100 Markdown files and 441 local links,
  lint, typecheck, build, 400 core tests, 79 Angular tests, packages, artifacts,
  source and repository/clean consumers pass.
- Review 030 cycle 31 closed M13 with zero findings. Exact live `0.1.0`
  tarballs, integrity, public metadata, `next`/mandatory `latest`, source and
  clean consumers were verified; full immutable evidence remains in review 030.

## Task document map

- D-009/M14 promotion readiness:
  `.ai-docs/reviews/031-m14-nullable-leaves-promotion-readiness.md`
- Accepted M14 architecture: `.ai-docs/adrs/019-hojas-primitivas-nullable.md`
- Accepted M14 behavior: `.ai-docs/specs/006-nullable-primitive-leaves.md`
- Complete SPEC-006 review: `.ai-docs/reviews/034-spec-006-review.md`
- Approved M14 delivery plan: `.ai-docs/plans/014-nullable-primitive-leaves.md`
- Complete PLAN-014 review: `.ai-docs/reviews/035-plan-014-review.md`
- PLAN-014 checkpoint 1 review:
  `.ai-docs/reviews/036-plan-014-checkpoint-1-review.md`
- PLAN-014 checkpoint 2 review:
  `.ai-docs/reviews/037-plan-014-checkpoint-2-review.md`
- PLAN-014 checkpoint 3 review:
  `.ai-docs/reviews/038-plan-014-checkpoint-3-review.md`
- PLAN-014 checkpoint 4 review:
  `.ai-docs/reviews/039-plan-014-checkpoint-4-review.md`
- PLAN-014 checkpoint 5 review:
  `.ai-docs/reviews/040-plan-014-checkpoint-5-review.md`
- PLAN-014 final implementation review:
  `.ai-docs/reviews/041-plan-014-final-implementation-review.md`
- ADR-019 revision 1 review:
  `.ai-docs/reviews/033-adr-019-revision-1-review.md`
- Joint M14 ADR review:
  `.ai-docs/reviews/032-adr-019-adr-005-revision-4-review.md`
- Completed M12 plan: `.ai-docs/plans/012-static-presentation-groups.md`
- Final M12 implementation review:
  `.ai-docs/reviews/026-plan-012-implementation-review.md`
- Completed D-034/D-040 readiness review:
  `.ai-docs/reviews/027-d034-d040-publication-licensing-readiness.md`
- Accepted M13 architecture:
  `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- Complete ADR-018 review: `.ai-docs/reviews/028-adr-018-review.md`
- Complete PLAN-013 review: `.ai-docs/reviews/029-plan-013-review.md`
- Final PLAN-013 implementation review:
  `.ai-docs/reviews/030-plan-013-implementation-review.md`
- Completed M13 delivery contract:
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
