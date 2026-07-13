# Schema Engine — Project Status

> This document is the canonical source of truth for the current project state.

## Last updated

- Date: 2026-07-13
- Updated by: Ricard / Codex
- Repository revision: remote branch strategy established at `a324d83`; `develop` contains a local persistent-state update not yet pushed; GitHub default branch is `main`

## Current phase

Architecture validation before implementation.

## Current objective

Review and approve PLAN-001 for the minimal compiler-only implementation.

## Latest completed work

- Recorded the completed Git/GitHub setup in the persistent project state on `develop`.
- Pushed `main`, configured its upstream, and made it GitHub's default stable/deployment branch.
- Verified `develop` was pushed to GitHub at `a324d83` and is tracking `origin/develop`.
- Corrected the repository-local Git identity and initial commit attribution to `Rabassoft <ricard@rabassoft.com>`.
- Created the initial repository baseline on `main` and local integration branch `develop`.
- Documented `main` as stable/deployment-ready and `develop` as the development integration branch.
- Created the private GitHub repository `rabassoft/schema-engine` and configured it as `origin`.
- Added and verified the initial `.gitignore` for macOS and the planned Node/TypeScript toolchain.
- Initialized the local Git repository with `main` as the initial branch.
- Drafted decision-complete PLAN-001 for `compileFormDefinition()`.
- Accepted ADR-006 for the initial package boundary and public name.
- Updated SPEC-001 to Draft v0.1.3 with the approved compiler input and root optionality.
- Formally reviewed and accepted ADR-005.
- Updated SPEC-001 to Draft v0.1.2 and closed the initial dialect decision.
- Normalized documentation conflicts and reserved ADR-005 for the JSON Schema dialect policy.
- Added `hint`, `tooltip`, and `placeholder` to the UI contract.
- Created the deferred-decisions register.
- Prepared the Codex repository handoff.

## In progress

No implementation task is currently active. PLAN-001 is proposed and awaiting review.

## Next action

Review and approve PLAN-001; do not implement the compiler before plan approval.

## Blockers

None.

## Open questions

- None within PLAN-001; its package, API, behavior, diagnostics, fixtures, and verification are specified.
- Other pre-runtime decisions remain listed in section 29 of SPEC-001 and are outside this compiler-only increment.

## Verification status

- Remote branch strategy verified: `main` and `develop` exist at `a324d83`, track their matching upstreams, and GitHub defaults to `main`.
- Current checkout is `develop`; its persistent-state commit is not yet pushed.
- Initial commit author and committer verified as `Rabassoft <ricard@rabassoft.com>`.
- Initial snapshot reviewed for ignored files and common credential patterns before commit.
- GitHub authentication verified as `rabassoft`; `origin` points to the private `rabassoft/schema-engine` repository.
- `.gitignore` patterns verified; `.DS_Store`, dependencies, generated output, caches, local environment files, logs, and IDE-local metadata are ignored.
- Confirmed `.env.example`, `pnpm-lock.yaml`, and conformance fixtures remain trackable.
- Documentation conflicts normalized and reviewed manually.
- ADR-005 formally reviewed and accepted after resolving its validator-boundary and keyword-classification ambiguities.
- ADR-006 accepted for `packages/core` and `@rabassoft/schema-engine`.
- PLAN-001 checked against SPEC-001, ADR-005, ADR-006, and the deferred register.
- SPEC-001 updated to Draft v0.1.3 and checked against accepted ADR-005 and ADR-006.
- SPEC-001 status and version checked across the specification, index, handoff, and project status.
- Active ADR references and documentation paths checked.
- No production code exists yet.
- No test suite exists yet.

## Relevant documents

- `.ai-docs/specs/001-controlled-form-runtime.md`
- `.ai-docs/adrs/005-politica-dialecto-json-schema.md`
- `.ai-docs/adrs/006-limite-paquete-inicial.md`
- `.ai-docs/plans/001-compiler-only-implementation.md`
- `.ai-docs/roadmap/deferred-decisions.md`
- `.ai-docs/adrs/000-index.md`
