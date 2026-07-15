# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-15 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1 and SPEC-006 v0.1.1
- **Last proposed specification:** None
- **Last implementation plan:** PLAN-015 revision 0, Approved for local
  checkpoints 1–3
- **Last completed implementation plan:** PLAN-014 revision 0
- **Active implementation task:** PLAN-015 checkpoint 4
- **Last accepted ADR:** ADR-019 revision 1, coordinated with ADR-005 revision 4
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9, D-006/M10, D-041/M11 and D-042/M12
  implemented within their accepted slices; D-034/D-040 active only within
  accepted M13 delivery; D-009/M14 implemented locally under completed PLAN-014
- **Phase:** M1–M14 and G0 completed locally
- **Published packages:** core and Angular `0.1.0` are live and byte-identical
  to their accepted candidates

## Current objective

Execute the explicitly authorized PLAN-015 checkpoint 4 commit and private
`develop` push, then rebuild and select only matching clean-commit candidates;
live `0.1.0` remains pre-M14.

## In progress

- PLAN-015 checkpoint 4: commit the reviewed release preparation, push that
  exact commit to private `develop`, rebuild from the clean tree and compare
  candidate hashes. No npm write is authorized.

## Latest completed work

- Completed PLAN-015 checkpoint 3 after review 045 cycle 5 passed with zero
  findings; full frozen/package/source/consumer/security gates, npm absence/tags,
  pre-commit candidates and neutral-path dry-runs pass.
- Completed PLAN-015 checkpoint 2 after review 044 cycle 2 passed with zero
  findings; coordinated local `0.2.0` manifests, migrations, declarations and
  packed package boundaries are established.
- Completed PLAN-015 checkpoint 1 after review 043 cycle 2 passed with zero
  findings; tooling is version-aware and immutable exact `0.1.0` verification
  is separated from mutable tags.
- Formally approved PLAN-015 revision 0 for local checkpoints 1–3 after review
  042 cycle 2 passed all ten areas with zero findings; Git and registry actions
  remain separately gated.

## Exact next action

Commit the fully verified release preparation and push that exact commit to
private `develop`; then rebuild from the clean commit and require exact
pre-/post-commit candidate byte equality.

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
  ADR-010-compliant target for both affected packages. Review 042 cycle 2
  passed with zero findings and revision 0 is Approved for local checkpoints
  1–3; every Git or registry mutation remains separately gated.
- SPEC-001 v0.1.15 remains the behavioral baseline. SPEC-002, SPEC-003,
  SPEC-004 and SPEC-005 are authoritative only for their accepted extensions.

## Open questions

- None for checkpoint 4. npm publication remains separately gated.

## Latest verification

- Review 045 cycle 5 closes the complete checkpoint 3 review with zero
  findings after six corrections. Frozen install, formatting, documentation
  across 106 Markdown files and 451 local links, lint, typecheck, 400 core plus
  79 Angular tests, build, packages, artifacts, source, security, repository and
  clean consumers pass. Both `0.2.0` versions are absent; public tags remain
  `0.1.0`; neutral-path dry-runs and recorded pre-commit hashes pass.
- Review 042 cycle 2 repeats all ten PLAN-015 areas with zero findings after
  five corrections. Formatting, documentation across 102 Markdown files and
  449 local links, active-version/tooling searches and diff checks pass; package
  versions and external state remain unchanged.
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

- Approved coordinated `0.2.0` release plan:
  `.ai-docs/plans/015-coordinated-experimental-0-2-release.md`
- Complete PLAN-015 review: `.ai-docs/reviews/042-plan-015-review.md`
- PLAN-015 checkpoint 1 review:
  `.ai-docs/reviews/043-plan-015-checkpoint-1-review.md`
- PLAN-015 checkpoint 2 review:
  `.ai-docs/reviews/044-plan-015-checkpoint-2-review.md`
- PLAN-015 checkpoint 3 review:
  `.ai-docs/reviews/045-plan-015-checkpoint-3-review.md`
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
