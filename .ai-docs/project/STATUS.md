# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-08-03 by Ricard / Codex
- **Branch:** `codex/m23-main-reselection-evidence`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0, SPEC-009 v0.1.0, SPEC-010 v0.1.0, SPEC-011
  v0.1.0, SPEC-012 v0.1.0, SPEC-013 v0.1.1, SPEC-014 v0.1.0, SPEC-015
  v0.1.0, SPEC-016 v0.1.1, SPEC-017 v0.1.0 and SPEC-018 v0.1.0
- **Last implementation plan:** PLAN-034 revision 0, Completed
- **Last completed implementation plan:** PLAN-034 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-035 revision 0
- **Implemented capability:** M1–M32 and G0
- **Published packages:** core/base `0.4.1` and pilot `0.2.1` resolve exactly,
  through `next`, `latest` and unqualified installation; all remain Public +
  Experimental + Active
- **Selected M23 source:** protected
  `main@028a98cfb1c96c821b6233c82f688a416e987656`; all live packages are
  byte-identical to its selected clean candidates

## Current objective

Prepare and review the bounded D-007/M33 discriminated-object-alternatives
promotion readiness before any architecture, contract, plan or implementation.

## In progress

- None.

## Latest completed work

- PLAN-034 revision 0 and M32 are complete; review 313 cycle 2 repeats the
  frozen matrix and all 22 rows with zero findings after one authorized
  external-tool correction; workspace 82/1,141, consumers, policies/security,
  714 boundaries and sequential Chromium 14+17 pass without graph drift.
- PLAN-034 checkpoint 5 is complete; review 312 cycle 3 passes all twelve
  declarations/package/consumer areas and row 21 with zero findings after
  three corrections; package, built, clean lower/latest and isolated source
  evidence passes without graph/version drift.
- PLAN-034 checkpoint 4 is complete; review 311 cycle 2 passes all twelve
  shared/Standard/browser areas and rows 19–20 with zero findings; scenario
  2/72, Standard 7/70, Angular 4/31 and sequential Chromium 14+17 pass.
- PLAN-034 checkpoint 3 is complete; review 310 cycle 1 passes all ten Angular
  projection areas and SPEC-018 row 18 with zero findings, with Angular 18/148,
  workspace ESLint and 714 import boundaries passing.
- PLAN-034 checkpoint 2 is complete; review 309 cycle 2 passes all twelve areas
  and SPEC-018 rows 10–17 with zero findings after correcting runtime retention
  of non-enumerable descriptors, with core 49/803 and full workspace
  build/typecheck passing.

## Exact next action

Prepare and review D-007/M33 promotion readiness for only discriminated object
alternatives; do not draft an ADR/SPEC/plan or change code until that bounded
promotion review passes and Ricard accepts it.

## Blockers and conflicts

- No implementation-contract, documentation, runtime, package-byte or
  public-API blocker is known; C-001 and C-002 are resolved.
- Git tag, GitHub Release, another npm release and deletion of private recovery
  material remain separately gated external actions.
- Angular emits an initial-bundle and Ajv CommonJS warning; Standard emits a
  Vite chunk advisory. These are observations, not blockers.
- Angular application builds inside the restricted sandbox may abort in esbuild
  0.28.1; the exact command outside that restriction passes.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035 and D-045 legacy
  Angular remain inactive.

## Open questions

- The exact discriminated-object-alternative boundary remains to be evaluated
  in the D-007/M33 promotion review. Dependency, version, release, commit, push
  and external actions remain separately gated.

## Latest verification

- Review 313 cycle 2 passes all fifteen final-matrix areas and all 22 rows with
  zero findings: frozen graph, workspace 82/1,141, package/built/clean/source
  consumers, release tooling/security, repository policy/history, 714
  boundaries, sequential Chromium 14+17 and docs 433/1,229 pass.
- Review 312 cycle 3 passes all twelve checkpoint-5 areas and row 21 with zero
  findings: exact declarations/six runtime exports, package/built/source,
  lower/latest native/pilot, workspace 82/1,141, 714 boundaries, public
  policy, 432 Markdown files/1,226 links and formatting/diff hygiene pass
  without graph/version drift.
- Review 311 cycle 2 passes all twelve checkpoint-4 areas and rows 19–20 with
  zero findings: reference units, sequential Chromium 14+17, snippets, ESLint,
  714 boundaries and diff hygiene pass.
- Review 310 cycle 1 passes all ten checkpoint-3 areas and SPEC-018 row 18
  with zero findings: Angular 18/148, workspace ESLint, 714 import boundaries
  and diff hygiene pass.
- Review 309 cycle 2 passes all twelve checkpoint-2 areas and SPEC-018 rows
  10–17 with zero findings: workspace ESLint, core 49/803, runtime fixture
  equality, full workspace build/typecheck, 429 Markdown files/1,213 links,
  public-tree policy and diff hygiene pass.

## Task document map

- Completed M32 implementation plan:
  `.ai-docs/plans/034-flat-compound-field-conditions.md`
- M32 plan review: `.ai-docs/reviews/307-plan-034-review.md`
- M32 checkpoint reviews:
  `.ai-docs/reviews/308-plan-034-checkpoint-1-review.md` and
  `.ai-docs/reviews/309-plan-034-checkpoint-2-review.md` through
  `.ai-docs/reviews/312-plan-034-checkpoint-5-review.md`
- M32 final implementation review:
  `.ai-docs/reviews/313-plan-034-final-implementation-review.md`
- Accepted M32 contract:
  `.ai-docs/specs/018-flat-compound-field-conditions.md`
- M32 contract review: `.ai-docs/reviews/306-spec-018-review.md`
- Accepted M32 architecture:
  `.ai-docs/adrs/035-flat-compound-field-conditions.md`
- M32 architecture review: `.ai-docs/reviews/305-adr-035-review.md`
- M32 promotion review:
  `.ai-docs/reviews/304-d018-m32-compound-condition-promotion-readiness.md`
- Completed M31 plan: `.ai-docs/plans/033-controlled-string-enum-array-field.md`
- Checkpoint reviews: `.ai-docs/reviews/297-plan-033-checkpoint-1-review.md`
  through `.ai-docs/reviews/302-plan-033-checkpoint-6-review.md`
- Final implementation review:
  `.ai-docs/reviews/303-plan-033-final-implementation-review.md`
- Accepted M31 contract:
  `.ai-docs/specs/017-controlled-string-enum-array-field.md`
- Accepted M31 policy and architecture:
  `.ai-docs/adrs/005-politica-dialecto-json-schema.md` revision 8 and
  `.ai-docs/adrs/034-controlled-homogeneous-string-enum-array-field.md`
- D-006/M31 promotion review:
  `.ai-docs/reviews/292-d006-m31-string-enum-array-promotion-readiness.md`
- Current roadmap: `.ai-docs/project/ROADMAP.md`
- Deferred register: `.ai-docs/roadmap/deferred-decisions.md`
