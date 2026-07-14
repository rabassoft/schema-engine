# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2 and SPEC-003
  v0.1.2
- **Last proposed specification:** SPEC-004 v0.1.0, Draft
- **Last implementation plan:** PLAN-010 revision 0, Completed after final
  repeated review with zero findings
- **Last completed implementation plan:** PLAN-010 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-005 revision 3
- **Last proposed ADR:** None
- **Promoted capabilities:** D-005/M9 and D-006/M10 implemented; D-041 promoted
  for normative M11 design only
- **Phase:** M1–M10 and G0 completed
- **Package candidates:** private independent `0.1.0` artifacts; unpublished

## Current objective

Complete the formal review of SPEC-004 v0.1.0 without activating an
implementation plan or code before its separate acceptance gate.

## In progress

- None.

## Latest completed work

- Drafted SPEC-004 v0.1.0 with the complete observable D-041 compiler,
  diagnostic, provenance, ordering and conformance contract.
- Corrected the stale ADR-index gate so ADR-016 now points through completed
  ADR-005 revision 3 to SPEC-004 drafting/review only.
- Preserved every Public signature and kept D-007, D-014, implementation,
  package, publication and Stable boundaries inactive.
- Removed volatile scope, milestone and version claims from the stable AI
  operating guides and made active-scope recovery explicit.
- Formally accepted ADR-005 revision 3 after review 018 cycle 2 passed all ten
  areas with zero findings.

## Exact next action

Perform the complete review of SPEC-004 v0.1.0 against ADR-016, ADR-005 revision
3, all accepted SPECs and D-041; record findings and do not accept the SPEC or
prepare a plan until a repeated complete review passes with zero findings.

## Blockers and conflicts

- No open review finding, implementation blocker or documentation conflict.
- SPEC-001 v0.1.15 remains the behavioral baseline and SPEC-002 v0.1.2 is
  authoritative only for the completed nested-object extension.
- D-006 remains registrally Promoted and its narrow M10 delivery is complete.
  All other array/deferred capabilities remain inactive.
- D-014 remains Research outside its narrow D-041 responsibility and D-007
  remains Deferred outside D-041.
- Review 016 is accepted, D-041 is Promoted for normative design only and
  ADR-016 is Accepted after a zero-finding repeated review.
- ADR-005 revision 3 is Accepted for normative M11 design, but `$defs`/`$ref`
  remain behaviorally inactive while SPEC-004 v0.1.0 is Draft and until an
  implementation plan is separately approved.
- ADR-016, ADR-005 revision 3, ADR-015 revision 4, SPEC-003 v0.1.2 and PLAN-010
  revision 0 are accepted/approved in the required order.

## Open questions

- None outside the required SPEC-004 complete review and acceptance decision.

## Latest verification

- Documentation consistency, formatting, lint and diff checks pass.
- All local Markdown targets resolve through `pnpm docs:check`.
- SPEC-004 drafting consistency checks against its accepted authorities pass;
  formal complete review remains the exact next action.
- No production code, public contract, dependency, package, publication or
  Stable classification changed.

## Task document map

- Draft observable M11 contract:
  `.ai-docs/specs/004-local-reference-resolution.md`
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
