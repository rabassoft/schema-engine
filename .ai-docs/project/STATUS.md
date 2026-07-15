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
- **Phase:** M1–M12 and G0 completed; M13 checkpoint 5 core publication/live
  verification accepted; Angular candidate reconciliation pending
- **Package candidates:** core `0.1.0` live; Angular `0.1.0` remains an
  unpublished verified candidate

## Current objective

Create a clean Git checkpoint for the accepted policy/docs/verifier changes,
then rebuild/review the corrected Angular candidate before checkpoint 6.

## In progress

- PLAN-013 checkpoint 6: create the authorized local Git checkpoint, then
  rebuild/review the corrected Angular candidate against live core. Push and
  Angular publication remain unauthorized.

## Latest completed work

- Accepted checkpoint 5 after review 030 cycle 15 verified live core metadata,
  exact bytes and exact/`next` consumers with zero findings.
- Accepted ADR-018 revision 2 and PLAN-013 revision 3 after complete repeated
  reviews define mandatory `latest` as an Experimental registry alias.
- Diagnosed the failed `latest` removal: npm registry metadata requires every
  package to define `latest`, so the accepted no-`latest` contract is infeasible.
- Published exact core `0.1.0`; unauthenticated metadata matches its license and
  integrity, but npm automatically assigned both `next` and forbidden `latest`.
- Confirmed the authorized core publish attempt made no registry mutation after
  npm required an OTP; unauthenticated lookup still returns `E404`.

## Exact next action

Review and authorize a local commit for the accepted policy/docs/live-verifier
checkpoint, then rebuild the Angular candidate from that clean commit. Do not
push, publish Angular or mutate npm/GitHub settings without separate approval.

## Blockers and conflicts

- No implementation blocker, open review finding or documentation conflict.
- npm requires a one-time authenticator password for the already authorized
  core command. The first Codex attempt returned `EOTP`; Ricard's local retry
  succeeded.
- npm's mandatory `latest: 0.1.0` is now accepted only as an Experimental alias
  to the same inspected core version; `next` remains recommended.
- The immutable live core `0.1.0` README retains the pre-discovery no-`latest`
  sentence. Release notes/ADR supersede it; future package versions carry the
  corrected wording and published bytes are not overwritten.
- Angular's existing ignored tarball predates the corrected mandatory-`latest`
  wording and is not publishable until rebuilt/reviewed from a clean commit.
- Checkpoint 4 is complete: private `develop` and `origin/develop` both point to
  `7f5fcdf`; no merge remains active.
- D-042 remains registrally Promoted and its narrow M12 slice is implemented.
- D-011 and D-012 remain Deferred outside D-042's exact boundary.
- D-034/D-040 are Promoted only for normative design; no publication, version
  or Stable promotion is authorized.
- Review 027 cycle 2 passes with zero findings. Ricardo Rabassó Rodríguez is the
  legal licensor, the exact public notice is fixed and the repository remains
  private pending sanitization.
- ADR-018 revision 2 and PLAN-013 revision 3 are Accepted/Approved. Commit and
  private push are complete; npm settings/publication, tags, visibility and
  further registry mutations remain unauthorized.
- SPEC-001 v0.1.15 remains the behavioral baseline. SPEC-002, SPEC-003,
  SPEC-004 and SPEC-005 are authoritative only for their accepted extensions.

## Open questions

- None within the accepted core-verification scope.

## Latest verification

- Review 028 cycle 6, review 029 cycle 12 and review 030 cycle 15 repeat their
  complete applicable areas with zero findings after policy/live corrections.
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
- Git refs remain aligned at `7f5fcdfe952cae5fd0322c5e942c2ff335465c52`
  with no unmerged paths; current checkpoint documentation is uncommitted.
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
