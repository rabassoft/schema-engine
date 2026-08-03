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
  v0.1.0, SPEC-016 v0.1.1 and SPEC-017 v0.1.0
- **Last implementation plan:** PLAN-033 revision 0, Completed
- **Last completed implementation plan:** PLAN-033 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-005 revision 8
- **Implemented capability:** M1–M31 and G0
- **Published packages:** core/base `0.4.1` and pilot `0.2.1` resolve exactly,
  through `next`, `latest` and unqualified installation; all remain Public +
  Experimental + Active
- **Selected M23 source:** protected
  `main@028a98cfb1c96c821b6233c82f688a416e987656`; all live packages are
  byte-identical to its selected clean candidates

## Current objective

Evaluate and select the next post-M31 functional capability. M31 is complete
after review 303 cycle 2 repeated the frozen matrix and all 26 SPEC-017 rows
with zero findings.

## In progress

- No implementation task is active. Any next capability requires explicit
  selection and its applicable promotion, ADR, SPEC and plan gates before
  implementation.

## Latest completed work

- PLAN-033 revision 0 and M31 are complete; review 303 cycle 2 passes all
  fifteen areas and all 26 SPEC-017 rows with zero findings after serializing
  the independent browser suites; workspace 78/1,103, packages/consumers/
  source, 701 boundaries and Chromium 17+14 pass with a frozen graph.
- PLAN-033 checkpoint 6 is complete; review 302 cycle 2 passes all ten areas
  and SPEC-017 row 25 with zero findings after two declaration-evidence
  corrections.
- PLAN-033 checkpoint 5 is complete; review 301 cycle 4 passes all twelve
  areas and SPEC-017 row 24 with zero findings after four selector, accessible
  status, shared-fixture and formatting corrections, with Angular 17/146,
  scenarios 2/72, Angular reference 4/31, Standard 7/70 and Chromium 17+14
  passing.
- PLAN-033 checkpoint 4 is complete; review 300 cycle 2 passes all twelve
  areas and SPEC-017 rows 16 and 22–23 with zero findings after four
  implementation/evidence corrections, with Angular 17/146, scenarios 2/68
  and Angular reference 4/30 passing.
- PLAN-033 checkpoint 3 is complete; review 299 cycle 2 passes all twelve areas
  and SPEC-017 rows 17–21 with zero findings after one issue-assignment
  correction, with core 46/767 and all workspace typechecks passing.

## Exact next action

Evaluate the deferred-capability register against the completed M31 boundary
and select the next bounded functional capability for promotion review.

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

- Which bounded post-M31 functional capability should be selected next?
  Dependency, version, release, commit, push and external actions remain
  separately gated.

## Latest verification

- Review 303 cycle 2 passes the complete frozen graph and all 26 SPEC-017 rows
  with zero findings: workspace lint/types/build and 78/1,103, four package
  smoke lanes, built/clean/source consumers, 41 release-tooling tests, 24
  policy tests, security, 701 boundaries and sequential Chromium 17+14 pass.
- Review 302 cycle 2 passes all ten checkpoint-6 areas and SPEC-017 row 25 with
  zero findings: workspace and package/built/clean/source evidence passes.
- Review 301 cycle 4 passes all twelve checkpoint-5 areas and SPEC-017 row 24
  with zero findings: Angular 17/146, scenarios 2/72, Angular reference 4/31,
  Standard 7/70, Chromium 17+14, lint, types, builds, snippets, 701 boundaries,
  docs, format and diff hygiene pass.
- Review 300 cycle 2 passes all twelve checkpoint-4 areas and SPEC-017 rows 16
  and 22–23 with zero findings: Angular 17/146, scenarios 2/68, Angular
  reference 4/30, docs, format and diff hygiene pass.
- Review 299 cycle 2 passes all twelve checkpoint-3 areas and SPEC-017 rows
  17–21 with zero findings: core 46/767, workspace typechecks, lint, docs,
  format and diff hygiene pass.

## Task document map

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
