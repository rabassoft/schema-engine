# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-14 by Ricard / Codex
- **Branch:** `develop`
- **Committed revision:** `d90a834`, PLAN-007/M7 completion (`develop` is six
  commits ahead of `origin/develop`; no push performed)
- **Specification:** SPEC-001 v0.1.15, Accepted
- **Last implementation plan:** PLAN-008 revision 2, Completed
- **Active implementation plan:** None
- **Last accepted decision:** ADR-013 revision 1
- **Review gate:** G0 completed
- **Phase:** M1–M8 and G0 completed; M9–M12 remain proposals
- **Package candidates:** private independent `0.1.0` core and Angular
  artifacts; unpublished and not authorized for external distribution
- **Working tree:** uncommitted M8 planning, implementation and completion
  changes; no active task

## Current objective

Select and review the next post-M8 decision without publishing the local
candidates or activating a deferred capability implicitly.

## In progress

- None.

## Latest completed work

- Completed PLAN-008 revision 2 and M8 with private `0.1.0` candidates for core
  and Angular.
- Aligned core peer/dev placement and Angular `>=22.0.6 <23.0.0` peers without
  upgrading dependencies.
- Added package READMEs, candidate release notes, exact tarball allowlist checks
  and isolated strict-peer consumers.
- Verified core-only and Angular lower/upper consumers; public npm metadata
  resolved `22.0.6` as both Angular endpoints.
- Repeated the complete matrix after implementation corrections; the final
  review produced zero findings or requested changes.

## Exact next action

Review the D-005/M9 nested-object promotion boundary together with ADR-005's
required review criteria; do not draft implementation or publish packages yet.

## Blockers and conflicts

- No active implementation blocker or documentation conflict.
- Both package candidates remain `private: true`; no registry write, external
  distribution, license, provenance, credentials, tag or release exists.
- Every public API remains Experimental; `0.1.0` did not promote any API to
  Stable.
- D-040 publication and D-034 licensing remain Deferred until explicitly
  requested and approved.
- `develop` is six commits ahead of `origin/develop`; all M8 changes are
  uncommitted and unpushed.

## Open questions outside the active scope

- D-040 must decide registry, visibility, license relationship, access,
  provenance, credentials, tags, automation and rollback before publication.
- D-005/M9 remains Candidate until reviewed and explicitly promoted.
- D-024, D-036–D-039 and every other deferred capability remain inactive.

## Latest verification

- `CI=true pnpm install --frozen-lockfile` passed with the updated lockfile and
  no dependency upgrade.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 129 core and 50 Angular tests (179 total).
- Both builds, `pnpm test:package`, and `pnpm test:consumer` passed.
- `pnpm test:artifacts` verified both transformed private `0.1.0` manifests,
  exports, exact file allowlists and absence of `workspace:`.
- `pnpm test:consumer:clean` passed for core-only and isolated Angular lower and
  upper consumers with strict peers, aligned Angular `22.0.6`, pnpm `10.28.2`,
  deep-import rejection and no credentials.
- All 39 Markdown files and 168 local links resolve; `git diff --check` passed.
- No product source, public export, entry point, registry configuration,
  publication setting or API stability classification changed.
- The complete matrix and review were repeated after corrections and finished
  with zero findings or unresolved changes.

## Task document map

- Normative behavior: `.ai-docs/specs/001-controlled-form-runtime.md`
- Roadmap and future sequence: `.ai-docs/project/ROADMAP.md`
- Completed M8 decision:
  `.ai-docs/adrs/013-preparacion-artefactos-experimentales-0-1.md`
- Completed M8 delivery contract:
  `.ai-docs/plans/008-experimental-0-1-artifact-preparation.md`
- Candidate release notes: `.ai-docs/releases/0.1.0.md`
- Package version/compatibility policy:
  `.ai-docs/adrs/010-versionado-semver-compatibilidad.md`
- Public API policy: `.ai-docs/adrs/009-politica-api-publica-estabilidad.md`
- Supporting ADR status and links: `.ai-docs/adrs/000-index.md`
- Deferred boundaries: `.ai-docs/roadmap/deferred-decisions.md`
- Append-only history: `.ai-docs/project/WORKLOG.md`
- Stable orientation and recovery workflow: `HANDOFF.md`
