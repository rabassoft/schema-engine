# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-15 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1 and SPEC-005 v0.1.1
- **Last proposed specification:** None
- **Last implementation plan:** PLAN-013 revision 4, Completed
- **Last completed implementation plan:** PLAN-013 revision 4
- **Active implementation task:** None
- **Last accepted ADR:** ADR-018 revision 3
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9, D-006/M10, D-041/M11 and D-042/M12
  implemented within their accepted slices; D-034/D-040 active only within
  accepted M13 delivery
- **Phase:** M1–M13 and G0 completed; next milestone not selected
- **Published packages:** core and Angular `0.1.0` are live and byte-identical
  to their accepted candidates

## Current objective

Select the next milestone from product demand and the deferred register without
implicitly promoting D-043 or another capability.

## In progress

- None. PLAN-013 revision 4 and M13 are complete.

## Latest completed work

- Corrected the post-G0 ROADMAP preamble that still described M13 as
  unpublished after the closure commit; no milestone or scope changed.
- Accepted ADR-018 revision 3 and completed PLAN-013 revision 4/M13 after full
  zero-finding reviews.
- Deferred repository sanitization/publication, public metadata, OIDC, staged
  approval, token restrictions and provenance together as D-043.
- Published and verified Angular `0.1.0`; downloaded bytes match accepted
  SHA-512 `35f7f33a…2ebd56a`, aliases/license/peers are exact and no provenance is
  claimed.
- Confirmed npm exposes generated local `_resolved`/`_from` metadata for both
  immutable versions; tarballs/manifests contain neither field nor credentials.

## Exact next action

Select the next milestone from product demand and the deferred register. Any
push remains a separate explicit action.

## Blockers and conflicts

- No implementation blocker or documentation conflict.
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
- SPEC-001 v0.1.15 remains the behavioral baseline. SPEC-002, SPEC-003,
  SPEC-004 and SPEC-005 are authoritative only for their accepted extensions.

## Open questions

- Which deferred capability should become the next milestone.

## Latest verification

- Review 028 cycle 8, review 029 cycle 14 and review 030 cycle 31 repeat their
  complete applicable areas with zero findings and close ADR-018 revision 3,
  PLAN-013 revision 4 and M13.
- Review 026 cycle 6 closes all ten implementation-review areas and all 18
  SPEC-005 evidence groups with zero findings; the full matrix passed in cycle
  3 and closing documentation checks passed in cycle 6.
- Frozen install, formatting, documentation across 86 Markdown files and 385
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
- Post-publication unauthenticated metadata reports both `0.1.0` packages,
  `AGPL-3.0-only` and the expected SHA-512 integrity, but both `next` and
  mandatory Experimental `latest` point to their `0.1.0`.
- `pnpm test:live:core` downloads bytes identical to canonical core SHA-512 and
  passes clean exact-version and `@next` TypeScript consumers without credentials.
- `pnpm test:live:angular` proves exact live Angular bytes, metadata, absent
  attestations, registry signatures and clean lower/upper Angular 22 consumers
  using both public packages. Default verifier modes also pass.
- Local/private `develop` both resolve to `6f13987`; no merge is active.
- Direct registry version documents confirm npm-generated local `_resolved` and
  `_from` fields for both versions; candidate manifests/tarballs omit them.
- GitHub reports PRIVATE visibility, default branch `main`, Issues enabled and
  Wiki disabled. Local history has 46 commits, one Rabassoft author identity and
  no currently tracked credential-like path; full-history sanitization has not
  been formally completed.
- Versions, exports, dependencies, peers, runtime behavior and Experimental
  classification remain unchanged. Both package publications are complete;
  settings remain unchanged.

## Task document map

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
