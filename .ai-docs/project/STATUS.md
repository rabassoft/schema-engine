# Schema Engine — Project Status

> Canonical checkpoint for the present project state. Historical detail belongs
> in `WORKLOG.md`; planned milestones belong in `ROADMAP.md`.

## Checkpoint

- **Updated:** 2026-07-22 by Ricard / Codex
- **Branch:** `develop`
- **Accepted specifications:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-005 v0.1.1, SPEC-006 v0.1.1, SPEC-007
  v0.1.0, SPEC-008 v0.1.0 and SPEC-009 v0.1.0
- **Last implementation plan:** PLAN-024 revision 0, Completed
- **Last completed implementation plan:** PLAN-024 revision 0
- **Active implementation task:** None
- **Last accepted ADR:** ADR-026 revision 0, coordinated with ADR-018 revision 6
- **Implemented capability:** M1–M22 and G0, including the coordinated
  Experimental M21 line plus sanitized public history, governance, protected
  GitHub controls and fail-closed secure-release preparation
- **Published packages:** core/base Angular `0.4.0` and Angular Aria pilot
  `0.2.0` are verified exact, under `next`/`latest` and through unqualified
  resolution; all remain Public + Experimental + Active
- **Selected M21 source:** private commit
  `07755b4cbe31098f86099db38c65930d52772fb5`; all three public packages are
  byte-identical to its selected clean candidates
- **Immutable M19 source:** public `0.3.0`/`0.3.0`/`0.1.0` remains
  byte-identical to the selected clean candidates from private commit
  `ce3ef3dd3f9154c95896bcefa22e31b4f293eda0`

## Current objective

Await explicit Git authorization to publish the reviewed PLAN-024/M22 closure
through protected `develop`/`main` flow and reconcile ancestry, without
activating future npm metadata/OIDC release work.

## In progress

None. PLAN-024/M22 completed after review 177 cycle 3 repeated the corrected
final public-repository closure with zero unresolved findings.

## Latest completed work

- Completed PLAN-024 checkpoint 9 and M22 after review 177 cycle 3 repeated the
  corrected anonymous public-history/content, GitHub-control, npm-isolation and
  complete verification matrix with zero findings.
- Corrected live Angular tuple discovery to tolerate staggered package patch
  publication by selecting the highest coherent stable tuple, with regression
  coverage for the observed `22.0.8`/`22.0.7` split; stabilized the reorder E2E
  assertion on Beta's exact normalized identity.
- Verified public `main@9da5c8b` and `develop@46c982d`, identical tree
  `8a90fef`, protected ancestry, 79-commit/1,862-path-blob history policy and
  approximately 6.37 MB Gitleaks scan with zero findings.
- Reverified M19 exact immutable bytes and the complete M21 exact/`next`/
  `latest`/unqualified native/pilot matrix without npm mutation.
- Retained and verified the owner-only private recovery bundle and reversible
  stash outside public refs; deletion remains separately gated.

## Exact next action

Obtain explicit approval for the short-lived branch, commit, push and protected
PR into `develop`; after its required CI passes, separately authorize promotion
to `main` and reconciliation back into `develop`.

## Blockers and conflicts

- No authoritative documentation conflict or implementation blocker remains.
- Repository visibility is public and checkpoint-8 settings are live/exact;
  protected publication, promotion and reconciliation all passed.
- Current and remote long-lived lineage is sanitized and passes full history
  policy. The verified private old-lineage bundle and reversible pre-adoption
  stash remain retained outside public refs pending a separately authorized
  destructive housekeeping decision.
- Active ruleset `19534784` protects both long-lived branches without bypass;
  no further checkpoint-8 settings group remains pending.
- Angular application builds require execution outside the restricted sandbox
  because esbuild IPC aborts inside it; Node 22.23.1 is compatible and the
  official builds pass.
- This machine uses an ignored workspace-local Playwright cache because its
  default global cache is owned by another user; no browser binary is tracked.
- Angular emits an initial-bundle warning at 989.78 kB plus Ajv's CommonJS
  warning; Standard emits Vite's 868.50 kB advisory. These are observations,
  not blockers.
- React, Vue, remaining D-011/D-025 scope, D-012, D-026, D-035 and D-045 legacy
  Angular remain inactive. Package metadata, npm trusted publishing,
  provenance and another release remain separately gated.

## Open questions

- None. A real scanner, rights or personal-data finding must stop PLAN-024 for
  explicit resolution.

## Latest verification

- Review 177 cycle 3 passes the corrected complete checkpoint-9 boundary with
  zero unresolved findings across authority/scope, anonymous public history and
  content, recovery, GitHub controls/CI, npm isolation and the full matrix.
- Fresh anonymous evidence passes strict Git integrity, approximately 6.37 MB
  Gitleaks, 744-file tree policy, 79-commit/1,862-path-blob history policy and
  the complete 65-entry mapped-commit check.
- Frozen install, formatting, documentation/links, workflow/publication policy,
  lint, strict types, all builds/tests, package/source verification, snippets,
  boundaries and Angular/Standard unit plus Chromium lanes pass.
- The final closure candidate passes 268 Markdown documents, 881 local links
  and 745 current public-tree candidates with zero findings.
- M19 exact and M21 exact/`next`/`latest`/unqualified bytes, metadata and native/
  pilot clean consumers pass; npm readiness fails closed on the exact expected
  future authorization/repository/provenance gaps.
- GitHub controls remain exact with zero stored Actions/environment secrets or
  variables. The verified private bundle retains its recorded checksum and
  owner-only permissions outside public refs.

## Task document map

- Sanitized history map: `.ai-docs/project/HISTORY-REWRITE-MAP.md`
- Completed M22 plan: `.ai-docs/plans/024-sanitized-public-repository.md`
- M22 final review: `.ai-docs/reviews/177-plan-024-final-review.md`
- M22 checkpoint-2 review:
  `.ai-docs/reviews/169-plan-024-checkpoint-2-review.md`
- M22 checkpoint-3 review:
  `.ai-docs/reviews/170-plan-024-checkpoint-3-review.md`
- M22 checkpoint-4 review:
  `.ai-docs/reviews/171-plan-024-checkpoint-4-review.md`
- M22 checkpoint-5 review:
  `.ai-docs/reviews/172-plan-024-checkpoint-5-review.md`
- M22 checkpoint-6 review:
  `.ai-docs/reviews/173-plan-024-checkpoint-6-review.md`
- M22 checkpoint-7 corrective preflight review:
  `.ai-docs/reviews/174-plan-024-checkpoint-7-preflight-review.md`
- M22 checkpoint-7 public review:
  `.ai-docs/reviews/175-plan-024-checkpoint-7-public-review.md`
- M22 checkpoint-8 preflight review:
  `.ai-docs/reviews/176-plan-024-checkpoint-8-preflight-review.md`
- M22 checkpoint-1 review:
  `.ai-docs/reviews/168-plan-024-checkpoint-1-review.md`
- M22 plan review: `.ai-docs/reviews/167-plan-024-review.md`
- Public governance: `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
- Accepted M22 architecture:
  `.ai-docs/adrs/026-public-repository-and-secure-releases.md`
- Coordinated licensing/source architecture:
  `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- M22 ADR review:
  `.ai-docs/reviews/166-adr-026-adr-018-revision-6-review.md`
- M22 promotion review:
  `.ai-docs/reviews/165-d043-m22-repository-publication-promotion-readiness.md`
- M22 Deferred source: `.ai-docs/roadmap/deferred-decisions.md#d-043`
- Final M21 review: `.ai-docs/reviews/164-plan-023-final-review.md`
- Completed M21 plan:
  `.ai-docs/plans/023-coordinated-experimental-0-4-release.md`
- M21 release notes: `.ai-docs/releases/0.4.0.md`
- Accepted M21 publication architecture:
  `.ai-docs/adrs/018-licencia-dual-publicacion-experimental.md`
- Accepted M20 specification:
  `.ai-docs/specs/009-recursive-local-presentation-layout.md`
- Completed M20 plan: `.ai-docs/plans/022-recursive-local-presentation-layout.md`
- Final M20 review:
  `.ai-docs/reviews/144-plan-022-final-implementation-review.md`
- Final M19 review: `.ai-docs/reviews/132-plan-021-final-review.md`
- Deferred capability register: `.ai-docs/roadmap/deferred-decisions.md`
- Current roadmap: `.ai-docs/project/ROADMAP.md`
