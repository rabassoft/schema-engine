# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-17 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1 and SPEC-006 v0.1.1
- **Last implementation plan:** PLAN-017 revision 0, Completed
- **Last completed implementation plan:** PLAN-017 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-020 revision 0
- **Implemented capability:** D-044/M15 plus completed PLAN-017 maintenance of
  the private neutral catalog and Angular 22 reference shell
- **Phase:** M1–M15 and G0 completed
- **Published packages:** core and Angular `0.2.0` are byte-identical and
  verified under coordinated `next` and `latest`

## Current objective

PLAN-017 is complete. Choose the next concrete demand-backed deferred capability
for promotion-readiness review; no implementation is active.

## In progress

- None.

## Latest completed work

- Completed the private-shell hierarchy correction after review 074 cycle 1
  passed with zero findings: the scenario explanation follows its selector,
  each group has one semantic eyebrow heading and State/Value opens by default.
- Completed the sober private-shell theme after review 073 cycle 2 passed with
  zero findings: custom semantic tokens, Auto/Light/Dark control, restrained
  slate/indigo surfaces and accessible shared CodeMirror syntax colors.
- Completed the simultaneous private-shell layout after review 072 cycle 2
  passed with zero findings: Form preview remains visible in the left column
  while Schema/UI Schema editing occupies the right, with Evidence below and a
  responsive one-column fallback.
- Completed the post-PLAN-017 private-shell follow-up after review 071 cycle 2
  passed language-aware Integration highlighting and accessible copy controls;
  its mutually exclusive outer-tab layout is superseded by review 072.
- Completed PLAN-017 after final review 070 cycle 1 repeated all authority,
  implementation, browser, package, consumer, documentation and diff areas with
  zero findings; no active implementation task remains.

## Exact next action

Choose one concrete demand-backed entry from the deferred-decisions register
and perform a promotion-readiness review before drafting an ADR, SPEC or plan.

## Blockers and conflicts

- No implementation, documentation or external-system blocker.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC deadlocks inside it; the identical official build passes
  outside and this is an environment constraint, not a product blocker.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- The working tree contains an unrelated Angular CLI analytics identifier in
  `angular.json`; it remains outside PLAN-017 and will stay unstaged. No push is
  authorized.
- The private application emits a 750 kB bundle warning at 943.65 kB but remains
  below its 1 MB error budget; syntax viewing is isolated in a lazy 143.11 kB
  chunk. This is an optimization observation, not an implementation blocker.
- D-045 remains Deferred. Standard/DOM, React, Vue, legacy Angular,
  persistence, hosting, CI, Public contract, release and repository-visibility
  work remain inactive.

## Open questions

- Which demand-backed deferred capability should be reviewed next.

## Latest verification

- Heading review 074 cycle 1 repeated the complete applicable hierarchy,
  accessibility, layout, disclosure-state, browser, build, boundary and
  Public-isolation review with zero findings.
- Formatting, lint, strict app types, 23 Angular-reference tests, 35 catalog
  tests, three snippets, 369 boundaries, nine boundary-verifier tests, the
  943.08 kB official production build plus lazy 143.11 kB code-viewer chunk and
  Chromium 8/8 pass.
- Theme review 073 cycle 2 repeated the complete applicable token, light/dark,
  automatic-preference, syntax, responsive/accessibility, build, browser,
  boundary and Public-isolation review with zero findings.
- Formatting, lint, strict app types, 23 Angular-reference tests, 35 catalog
  tests, three snippets, 369 boundaries, nine boundary-verifier tests, the
  943.65 kB official production build plus lazy 143.11 kB code-viewer chunk and
  Chromium 8/8 pass.
- Layout review 072 cycle 2 repeated the complete applicable authority,
  simultaneous-workflow, responsive/accessibility, browser, build, boundary
  and Public-isolation review with zero findings.
- Formatting, lint, strict app types, 22 Angular-reference tests, 35
  neutral-catalog tests, three snippets, the 939.81 kB official production
  build plus lazy 142.74 kB code-viewer chunk and Chromium 7/7 pass. Wide visual
  inspection confirms the form and JSON editor remain visible side by side with
  Evidence below.
- Follow-up review 071 cycle 2 repeated the complete applicable hierarchy,
  highlighting/copy, accessibility, state, visual, browser, build, boundary and
  Public-isolation review with zero findings.
- Formatting, lint, strict app types, 22 Angular-reference tests, 35 catalog
  tests, three snippets, 359 boundaries, nine boundary-verifier tests, the
  940.61 kB official production build plus lazy 142.74 kB code-viewer chunk and
  Chromium 7/7 pass.
- Final review 070 cycle 1 repeated the complete PLAN-017 authority,
  dependency, UI, state, diagnostic, accessibility, runtime, browser, package,
  isolation, documentation and diff review with zero findings.
- Frozen install, formatting, documentation across 134 Markdown files/513
  links, lint, strict types/templates, 535 unit tests, 14 tooling tests,
  snippets, 348 boundaries, production build and Chromium 6/6 pass.
- Package smoke, exact `0.2.0` artifacts, licensed Corresponding Source,
  isolated rebuilds, release security and clean core/Angular 22.0.6/22.0.7
  consumers pass; Public source/manifests/exports/versions have no diff.
- `git diff --check`, forbidden-import/Public-drift searches and ignored-output
  inspection pass; application/catalog/browser output remains outside Public
  artifacts.

## Task document map

- Latest completed plan: `.ai-docs/plans/017-reference-workspace-ux.md`
- Plan review: `.ai-docs/reviews/064-plan-017-review.md`
- Checkpoint reviews: `.ai-docs/reviews/065-plan-017-checkpoint-1-review.md`
  through `.ai-docs/reviews/069-plan-017-checkpoint-5-review.md`
- Final review: `.ai-docs/reviews/070-plan-017-final-implementation-review.md`
- Follow-up review: `.ai-docs/reviews/071-reference-workspace-follow-up-review.md`
- Current layout review: `.ai-docs/reviews/072-reference-workspace-simultaneous-layout-review.md`
- Current theme review: `.ai-docs/reviews/073-reference-workspace-theme-review.md`
- Current heading review: `.ai-docs/reviews/074-reference-workspace-heading-review.md`
- Accepted architecture: `.ai-docs/adrs/020-plataforma-referencia-multiframework.md`
- Promotion boundary: `.ai-docs/reviews/053-d044-m15-reference-platform-promotion-readiness.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
