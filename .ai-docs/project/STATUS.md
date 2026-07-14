# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-15 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2 and SPEC-004 v0.1.1
- **Last proposed specification:** None
- **Last implementation plan:** PLAN-011 revision 0, Completed after final
  repeated implementation review passed with zero findings
- **Last completed implementation plan:** PLAN-011 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-005 revision 3
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9, D-006/M10 and D-041/M11 implemented
- **Phase:** M1–M11 and G0 completed
- **Package candidates:** private independent `0.1.0` artifacts; unpublished

## Current objective

Preserve the completed M1–M11 baseline and keep M12/deferred capabilities
inactive until an explicit promotion-readiness task is authorized.

## In progress

- None.

## Latest completed work

- Completed PLAN-011 revision 0 and M11 after review 021 cycle 2 repeated the
  complete implementation review and full matrix with zero findings.
- Corrected the final-review policy-provenance finding so item-target chains
  apply only to item-dependent semantic policy diagnostics, never an inline
  array's missing policy.
- Completed PLAN-011 checkpoint 4 with all 19 SPEC-004 evidence rows, exact
  validator-schema identity, package/artifact checks and isolated
  core/lower/upper Angular 22 consumers passing.
- Completed PLAN-011 checkpoint 3 by integrating descriptor-safe root/non-root
  reference classification, resolved-target normalization, separate cycle
  domains, exact ordering and immutable provenance into the existing compiler.

## Exact next action

Evaluate M12 promotion readiness for D-011/D-012 before drafting architecture,
SPEC or plan; do not activate implementation without a separate explicit
decision.

## Blockers and conflicts

- No open review finding, implementation blocker or documentation conflict.
- SPEC-001 v0.1.15 remains the behavioral baseline and SPEC-002 v0.1.2 is
  authoritative only for the completed nested-object extension.
- D-006 remains registrally Promoted and its narrow M10 delivery is complete.
  All other array/deferred capabilities remain inactive.
- D-014 remains Research outside its narrow D-041 responsibility and D-007
  remains Deferred outside D-041.
- D-041 remains registrally Promoted and its narrow M11 delivery is complete;
  D-007/D-014 work outside that slice remains inactive.
- SPEC-004 v0.1.1 is accepted and PLAN-011 revision 0/M11 are complete after
  final repeated review with zero findings.
- ADR-016, ADR-005 revision 3, ADR-015 revision 4, SPEC-003 v0.1.2 and PLAN-010
  revision 0 are accepted/approved in the required order.

## Open questions

- None.

## Latest verification

- Documentation consistency, formatting, lint and diff checks pass.
- All local Markdown targets resolve through `pnpm docs:check`.
- SPEC-004 review 019 cycle 5 passes all ten areas with zero findings.
- Stale M10/M11 release, SPEC, ROADMAP, ADR-index and completed ADR-016 gate
  phrases are rejected by `pnpm docs:check`.
- PLAN-011 maps every SPEC-004 conformance scenario to concrete evidence and
  declares no Public signature, Angular production or package-shape change.
- PLAN-011 review 020 cycle 1 passes all ten acceptance areas with zero
  findings.
- PLAN-011 final matrix passes 328 core and 68 Angular tests, frozen-lockfile
  installation, full typecheck/build, package smoke, packed artifacts,
  repository consumer and lower/upper Angular 22 clean consumers.
- Review 021 cycle 2 passes all implementation areas with zero findings after
  correcting the cycle 1 policy-provenance finding.
- Root declarations/exports, Public contracts, manifests, dependencies and
  lockfile remain unchanged; Internal resolver types are absent from root
  declarations and deep imports remain blocked.
- No Public export/contract, dependency, manifest, lockfile, publication or
  Stable classification changed.

## Task document map

- Accepted observable M11 contract:
  `.ai-docs/specs/004-local-reference-resolution.md`
- Completed M11 delivery contract:
  `.ai-docs/plans/011-local-reference-resolution.md`
- Complete PLAN-011 review: `.ai-docs/reviews/020-plan-011-review.md`
- Final PLAN-011 implementation review:
  `.ai-docs/reviews/021-plan-011-implementation-review.md`
- Complete SPEC-004 review: `.ai-docs/reviews/019-spec-004-review.md`
- Accepted M11 architecture: `.ai-docs/adrs/016-resolucion-referencias-locales.md`
- Accepted dialect/reference contract:
  `.ai-docs/adrs/005-politica-dialecto-json-schema.md`, section 12
- Accepted behavior baselines: `.ai-docs/specs/001-controlled-form-runtime.md`,
  `.ai-docs/specs/002-nested-object-runtime.md` and
  `.ai-docs/specs/003-collection-runtime.md`
- Promoted/deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Milestone sequence: `.ai-docs/project/ROADMAP.md`
- ADR status index: `.ai-docs/adrs/000-index.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
