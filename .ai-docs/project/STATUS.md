# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-08-02 by Ricard / Codex
- **Branch:** `codex/m23-main-reselection-evidence`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0, SPEC-009 v0.1.0, SPEC-010 v0.1.0 and SPEC-011
  v0.1.0
- **Last implementation plan:** PLAN-027 revision 0, Approved
- **Last completed implementation plan:** PLAN-026 revision 0
- **Active implementation task:** None; PLAN-027 checkpoint 1 complete
- **Last accepted ADR:** ADR-028 revision 0, coordinated with ADR-005 revision
  6 and ADR-022 revision 3
- **Implemented capability:** M1–M24 and G0
- **Published packages:** core/base `0.4.1` and pilot `0.2.1` resolve exactly,
  through `next`, `latest` and unqualified installation; all remain Public +
  Experimental + Active
- **Selected M23 source:** protected
  `main@028a98cfb1c96c821b6233c82f688a416e987656`; all live packages are
  byte-identical to its selected clean candidates

## Current objective

Execute PLAN-027 checkpoint 2 to prove the existing Ajv integration asserts
the accepted primitive `const` subset without production drift.

## In progress

None. Review 229 cycle 2 completes the Standard reference visual-parity
refinement.

## Latest completed work

- Review 229 cycle 2 verifies four default-open Standard first-level
  disclosures and readable dark JSON/code selection through an independent
  implementation with zero findings.
- Review 228 cycle 2 verifies a labelled Role missing-value sentinel and
  persistent selected-state styling for native advanced-presentation tabs with
  zero findings.
- Review 227 cycle 2 verifies darker, legible selection treatment for Angular
  JSON and highlighted-code editors after correcting one brittle regression
  assertion, with zero findings.
- Review 226 cycle 1 verifies default-open and independent collapsible behavior
  for the promoted first-level Angular Schemas region with zero findings.
- Review 225 cycle 1 verifies that Angular Interactive consumer and Schemas are
  independent sibling regions matching the Standard reference composition,
  with zero findings.

## Exact next action

Execute PLAN-027 checkpoint 2: add focused evidence that the existing Ajv
integration asserts matching and mismatching primitive `const` schemas without
changing production validator source, dependencies, options, exports or cache
rules.

## Blockers and conflicts

- No implementation, documentation, runtime, package-byte or public-API blocker
  remains.
- No authoritative documentation conflict remains in the promoted M25 slice.
- Git tag, GitHub Release, another npm release and deletion of private recovery
  material remain separately gated external actions.
- Angular emits an initial-bundle and Ajv CommonJS warning; Standard emits a
  Vite chunk advisory. These are observations, not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035 and D-045 legacy
  Angular remain inactive.

## Open questions

- None within the Approved PLAN-027 boundary.

## Latest verification

- Review 229 cycle 2 passes formatting, strict types, all 55 Standard tests,
  eight snippet checks, the production build, all seven Standard Chromium
  tests, documentation links and diff hygiene. The known Vite chunk advisory
  remains non-blocking.
- Review 228 cycle 2 passes formatting, strict types, all 44 scenario and 26
  Angular tests, eight snippet checks, the production build, all nine Angular
  Chromium tests, documentation links and diff hygiene. The known bundle/Ajv
  warnings remain non-blocking.
- Review 227 cycle 2 passes formatting, strict types, all 26 Angular reference
  tests, eight snippet checks, the production build, dark-theme JSON/code
  selection inspection, documentation links and diff hygiene. The known
  bundle/Ajv warnings remain non-blocking.
- Review 226 cycle 1 passes formatting, strict types, all 26 Angular reference
  tests, eight snippet checks, the production build, runtime visual and
  interaction inspection, documentation links and diff hygiene. The known
  bundle/Ajv warnings remain non-blocking.
- Review 225 cycle 1 passes formatting, strict types, all 26 Angular reference
  tests, eight snippet checks, the production build, runtime visual and
  independent-collapse inspection, documentation links and diff hygiene. The
  known bundle/Ajv warnings remain non-blocking.
- Review 224 cycle 1 passes formatting, strict types, all 26 Angular reference
  tests, eight snippet checks, the production build, runtime disclosure and
  overflow inspection, documentation links and diff hygiene. The known
  bundle/Ajv warnings remain non-blocking.
- Review 223 cycle 1 passes formatting, strict types, all 26 Angular reference
  tests, eight snippet checks, the production build, light/dark runtime visual
  inspection and diff hygiene. The known bundle/Ajv warnings remain
  non-blocking.
- Review 222 cycle 5 passes source/declaration contract, direct/nested/template/
  reference compilation, exact diagnostics, manual defects, controlled-state
  invariance, formatting, strict types, build, all 471 core tests, package
  smoke, documentation links and diff hygiene with zero findings.
- Review 221 cycle 6 repeats all sixteen plan areas and accepted-state
  reconciliation with zero findings; `pnpm format:check`, `pnpm docs:check`
  (320 documents/1011 links) and `git diff --check` pass.
- Review 220 cycle 4 repeats all seventeen SPEC areas and accepted-state
  reconciliation with zero findings; `pnpm format:check`, `pnpm docs:check`
  (318 documents/1007 links) and `git diff --check` pass.
- Review 219 cycle 2 repeats all fourteen architectural areas with zero
  findings; `pnpm format:check`, `pnpm docs:check` (316 documents/1001 links)
  and `git diff --check` pass after current-state reconciliation.
- Review 217 cycle 4 passes frozen offline install, formatting, 313-document/
  993-link documentation, lint, strict types, builds, 705 workspace tests,
  package/source/policy/security checks, 550 boundaries and both Chromium
  suites with zero findings.
- GitHub remains public with protected `main`/`develop`, pinned Actions,
  guarded `npm-publish` environment and no stored release credential. npm
  remains public, stage-only trusted, token-free and strictly 2FA-protected.

## Task document map

- Standard reference visual-parity review:
  `.ai-docs/reviews/229-standard-reference-visual-parity-review.md`
- Angular scenario-control review:
  `.ai-docs/reviews/228-angular-scenario-controls-review.md`
- Angular dark editor selection review:
  `.ai-docs/reviews/227-angular-dark-editor-selection-review.md`
- Angular Schemas disclosure review:
  `.ai-docs/reviews/226-angular-schemas-disclosure-review.md`
- Angular/Standard reference workspace alignment:
  `.ai-docs/reviews/225-angular-reference-workspace-alignment-review.md`
- Angular reference disclosure UX review:
  `.ai-docs/reviews/224-angular-reference-disclosures-ux-review.md`
- Angular reference tab UX review:
  `.ai-docs/reviews/223-angular-reference-tabs-ux-review.md`
- Completed PLAN-027 checkpoint 1 review:
  `.ai-docs/reviews/222-plan-027-checkpoint-1-core-review.md`
- Approved M25 implementation contract:
  `.ai-docs/plans/027-primitive-const-fixed-presentation.md`
- M25 plan review: `.ai-docs/reviews/221-plan-027-review.md`
- Accepted M25 observable contract:
  `.ai-docs/specs/011-primitive-const-fixed-presentation.md`
- M25 SPEC review: `.ai-docs/reviews/220-spec-011-review.md`
- Accepted M25 architecture:
  `.ai-docs/adrs/028-const-primitivo-presentacion-fija.md`
- M25 architecture review:
  `.ai-docs/reviews/219-adr-028-review.md`
- M25 promotion readiness:
  `.ai-docs/reviews/218-d036-m25-const-promotion-readiness.md`
- Completed M24 implementation contract:
  `.ai-docs/plans/026-semantic-string-formats.md`
- M24 observable contract:
  `.ai-docs/specs/010-semantic-string-formats.md`
- M24 architecture:
  `.ai-docs/adrs/027-formatos-semanticos-string.md`
- Final M24 evidence:
  `.ai-docs/reviews/217-plan-026-final-implementation-review.md`
- Current roadmap: `.ai-docs/project/ROADMAP.md`
- Deferred capability register:
  `.ai-docs/roadmap/deferred-decisions.md`
