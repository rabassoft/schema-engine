# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-15 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1 and SPEC-006 v0.1.1
- **Last proposed specification:** None
- **Last implementation plan:** PLAN-014 revision 0, Approved
- **Last completed implementation plan:** PLAN-013 revision 4
- **Active implementation task:** None
- **Last accepted ADR:** ADR-019 revision 1, coordinated with ADR-005 revision 4
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9, D-006/M10, D-041/M11 and D-042/M12
  implemented within their accepted slices; D-034/D-040 active only within
  accepted M13 delivery; D-009 promoted with its M14 observable contract
- **Phase:** M1–M13 and G0 completed; M14 checkpoint 1 completed
- **Published packages:** core and Angular `0.1.0` are live and byte-identical
  to their accepted candidates

## Current objective

Implement PLAN-014 revision 0 checkpoints 2–6 in order, beginning with closed
descriptor-safe nullable type-array normalization.

## In progress

- None. PLAN-014 checkpoint 1 passed review 036 cycle 2 with zero findings;
  checkpoint 2 is authorized but has not started.

## Latest completed work

- Completed PLAN-014 checkpoint 1 after review 036 cycle 2 passed all eight
  areas with zero findings; required contracts, scalar false normalization and
  manual-definition validation are active locally.
- Formally approved PLAN-014 revision 0 after review 035 cycle 3 passed all ten
  areas with zero findings; only checkpoints 1–6 are authorized.
- Drafted PLAN-014 revision 0 with six gated checkpoints and a 23-group evidence
  matrix; review 035 cycle 3 passed all ten areas with zero findings after four
  corrections.
- Accepted SPEC-006 v0.1.1 after review 034 cycle 6 repeated all twelve areas
  and accepted-state reconciliation with zero findings; PLAN-014 preparation
  and review are now authorized.
- Accepted ADR-019 revision 1 after review 033 cycle 2 preserved SPEC-003's
  collection diagnostic with zero findings.

## Exact next action

Begin PLAN-014 checkpoint 2: implement the exact descriptor-safe two-member
type-array classifier, diagnostics and direct/nested/template/reference
normalization while leaving operations/runtime/Angular null behavior inactive.

## Blockers and conflicts

- No implementation, environment, external-system or documentation blocker.
  PLAN-014 checkpoint 1 is complete and checkpoint 2 is authorized.
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

- None. Ricard approved preserving SPEC-003's collection-specific diagnostic.

## Latest verification

- Review 036 cycle 2 passes all eight checkpoint 1 areas with zero findings.
  Formatting, documentation across 95 Markdown files and 441 local links,
  lint, typecheck, build, 364 core tests, 76 Angular tests, both package smoke
  suites, JSON definition audit and diff checks pass.
- PLAN-014 approval-state reconciliation passes formatting, documentation
  across 94 Markdown files and 440 local links, active-state reference search
  and diff checks.
- Review 035 cycle 3 repeats all ten PLAN-014 acceptance areas with zero
  findings after four corrections. Formatting, documentation across 94
  Markdown files and 439 local links, and diff checks pass after final
  current-state reconciliation.
- Review 034 cycle 6 repeats all twelve SPEC-006 areas and accepted-state
  reconciliation with zero findings after twelve corrections. Formatting,
  documentation across 92 Markdown files and 419 local links, and diff checks
  pass.
- SPEC-006 preflight compared ADR-019 section 2.3, SPEC-003 section 12.2 and the
  collection-operation implementation; ADR-019 revision 1 resolved the found
  diagnostic conflict before the SPEC was accepted.
- Review 032 cycle 2 repeats all ten joint ADR-019/ADR-005 revision 4 areas with
  zero findings. Current formatting, documentation across 89 Markdown files
  and 400 local links, and diff checks pass.
- Review 031 cycle 3 repeats all eight D-009/M14 readiness areas with zero
  findings and supports the accepted narrow promotion.
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

- D-009/M14 promotion readiness:
  `.ai-docs/reviews/031-m14-nullable-leaves-promotion-readiness.md`
- Accepted M14 architecture: `.ai-docs/adrs/019-hojas-primitivas-nullable.md`
- Accepted M14 behavior: `.ai-docs/specs/006-nullable-primitive-leaves.md`
- Complete SPEC-006 review: `.ai-docs/reviews/034-spec-006-review.md`
- Approved M14 delivery plan: `.ai-docs/plans/014-nullable-primitive-leaves.md`
- Complete PLAN-014 review: `.ai-docs/reviews/035-plan-014-review.md`
- PLAN-014 checkpoint 1 review:
  `.ai-docs/reviews/036-plan-014-checkpoint-1-review.md`
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
