# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-15 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1 and SPEC-005 v0.1.1
- **Last proposed specification:** None
- **Last implementation plan:** PLAN-013 revision 3, Approved
- **Last completed implementation plan:** PLAN-012 revision 1
- **Active implementation task:** None
- **Last accepted ADR:** ADR-018 revision 2
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9, D-006/M10, D-041/M11 and D-042/M12
  implemented within their accepted slices; D-034/D-040 promoted for M13
  normative design only
- **Phase:** M1–M12 and G0 completed; M13 checkpoint 6 Angular candidate
  accepted; private/no-provenance release path selected
- **Package candidates:** core `0.1.0` live; Angular `0.1.0` remains an
  unpublished verified candidate

## Current objective

Commit and privately sync the accepted checkpoint evidence, then repeat the
exact Angular prepublication gate without changing repository visibility.

## In progress

- PLAN-013 checkpoint 6 private path: commit current state, push private
  `develop`, then repeat exact Angular hash/source/consumer/dry-run checks. Stop
  before npm publication approval.

## Latest completed work

- Ricard selected the recommended private/no-provenance Angular release path;
  repository sanitization/publication remains a separate future milestone.
- Created local checkpoint 6 evidence commit `f661f84` with Rabassoft
  attribution; private push and Angular publication were not performed.
- Assessed public-repository readiness: the accepted sanitization/history,
  default-branch and community-policy gates are not complete.
- Accepted checkpoint 6 after review 030 cycle 21 verified deterministic Angular
  candidate `35f7f33a…2ebd56a` against live core with zero findings.
- Accepted checkpoint 5 after review 030 cycle 15 verified live core metadata,
  exact bytes and exact/`next` consumers with zero findings.

## Exact next action

Commit the selected-path state, push private `develop`, rebuild/verify the exact
Angular tarball from the resulting clean commit and stop for immediate approval
of its exact npm command. Do not change GitHub visibility or npm settings.

## Blockers and conflicts

- No implementation blocker, open review finding or documentation conflict.
- npm's mandatory `latest: 0.1.0` is now accepted only as an Experimental alias
  to the same inspected core version; `next` remains recommended.
- The immutable live core `0.1.0` README retains the pre-discovery no-`latest`
  sentence. Release notes/ADR supersede it; future package versions carry the
  corrected wording and published bytes are not overwritten.
- Angular candidate is accepted but unpublished. Private `origin/develop` does
  not yet contain local commits `102be1c`/`f661f84`; their push remains gated.
- The repository is not ready for public visibility under ADR-018: no accepted
  full-history sanitization exists, 77 internal `.ai-docs` files are tracked,
  remote default `main` remains at the initialization commit, Issues is enabled
  despite the no-public-issue policy, and public community/security boundaries
  have not been reviewed.
- Checkpoint 4 core source/push is complete at `7f5fcdf`; local `develop`
  contains later checkpoint commit `102be1c`, whose private push remains gated.
- D-042 remains registrally Promoted and its narrow M12 slice is implemented.
- D-011 and D-012 remain Deferred outside D-042's exact boundary.
- D-034/D-040 remain Promoted only within accepted M13/PLAN-013 delivery. Core
  is published, Angular is not, and no Stable promotion is authorized.
- Review 027 cycle 2 passes with zero findings. Ricardo Rabassó Rodríguez is the
  legal licensor, the exact public notice is fixed and the repository remains
  private pending sanitization.
- ADR-018 revision 2 and PLAN-013 revision 3 are Accepted/Approved. Core source
  commit/private push are complete; checkpoint 6 evidence commit/push and every
  further registry/settings mutation remain separately gated.
- SPEC-001 v0.1.15 remains the behavioral baseline. SPEC-002, SPEC-003,
  SPEC-004 and SPEC-005 are authoritative only for their accepted extensions.

## Open questions

- None within the selected private/no-provenance prepublication path.

## Latest verification

- Review 028 cycle 6, review 029 cycle 12 and review 030 cycle 21 repeat their
  complete applicable areas with zero findings after policy/live corrections.
- Review 026 cycle 6 closes all ten implementation-review areas and all 18
  SPEC-005 evidence groups with zero findings; the full matrix passed in cycle
  3 and closing documentation checks passed in cycle 6.
- Frozen install, formatting, documentation across 86 Markdown files and 384
  local links, lint, typecheck, 359 core plus 76 Angular tests, explicit build,
  package/artifact/repository/clean consumers and diff checks pass.
- Release security audit, isolated source rebuilds and npm dry-runs pass. Core
  live SHA-512 is `dceb432e…fdb310e`; corrected Angular candidate SHA-512 is
  `35f7f33a…2ebd56a`. Full hashes/source commits are in review 030 and the ignored
  `.release/0.1.0/candidates.json`.
- npm `10.9.8` targets `https://registry.npmjs.org/`; authenticated user
  `ricardrabasso` is owner of organization `rabassoft`, with verified
  `ricard@rabassoft.com` and `auth-and-writes` 2FA. Before publication both
  exact names returned unauthenticated `E404` and the candidate hashes matched
  checkpoint 4.
- Post-publication unauthenticated metadata reports core `0.1.0`,
  `AGPL-3.0-only` and the expected SHA-512 integrity, but both `next` and
  mandatory Experimental `latest` point to `0.1.0`.
- `pnpm test:live:core` downloads bytes identical to canonical core SHA-512 and
  passes clean exact-version and `@next` TypeScript consumers without credentials.
- Angular SHA-512 `35f7f33a…2ebd56a` is deterministic from clean `102be1c`; its
  exact source rebuild, npm dry-run and lower/upper Angular 22 consumers against
  live core pass. Default verifier modes also pass after the extension.
- Local `develop` contains checkpoint commits `102be1c` and `f661f84`; their
  private push remains pending, with no merge active.
- GitHub reports PRIVATE visibility, default branch `main`, Issues enabled and
  Wiki disabled. Local history has 46 commits, one Rabassoft author identity and
  no currently tracked credential-like path; full-history sanitization has not
  been formally completed.
- Versions, exports, dependencies, peers, runtime behavior and Experimental
  classification remain unchanged. Core publication is the only npm package
  mutation; Angular and settings remain unchanged.

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
