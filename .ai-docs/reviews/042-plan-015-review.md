# PLAN-015 complete review — Cycles 1–2

- **State:** Complete review passed with zero findings; PLAN-015 revision 0
  remains Proposed pending formal approval
- **Date:** 15 July 2026
- **Scope:** Coordinated Experimental core and Angular `0.2.0` release plan
- **Authority:** Accepted SPEC-006 v0.1.1, ADR-019 revision 1, ADR-005 revision
  4, ADR-010 revision 1, ADR-018 revision 3 and completed PLAN-014 revision 0
- **Authorization boundary:** plan preparation/review only; no version change,
  candidate, commit, push, authentication, publication, dist-tag or settings
  mutation

## 1. Cycle 1 findings and corrections

1. **R042-F001 — pre-bump tooling order:** the first draft required both
   manifests to equal `0.2.0` during checkpoint 1 while checkpoint 2 owned the
   version bump. The plan now adds and tests an expected-version mechanism
   first, then invokes it for the target only after the checkpoint 2 bump.
2. **R042-F002 — historical live-tag mutability:** preserving the existing
   `0.1.0` verifier unchanged would fail correctly when `next`/`latest` move.
   Historical mode now retains exact metadata, bytes and consumers without
   mutable-tag assertions; review 030 preserves the observed M13 tag evidence.
3. **R042-F003 — workspace range precision:** the draft conflated Angular's
   source core peer and development specifiers. It now preserves
   `workspace:^` and `workspace:*` respectively and checks packed
   `^0.2.0`/`0.2.0` metadata.
4. **R042-F004 — release-note state timing:** the new release notes could have
   implied live availability during local preparation. They must now report
   only candidate/prepared state until each registry checkpoint is observed.
5. **R042-F005 — exact latest mutations:** the two irreversible routing steps
   named approvals but not their exact commands. Both package/version/tag
   commands are now explicit and separately gated, including an unapproved-
   rollback prohibition.

The document was formatted and the complete review restarted.

## 2. Complete repeated review — Cycle 2

### 2.1 Authority, release classification and scope — Pass

Both affected packages are correctly targeted at independent but coordinated
`0.2.0` versions. MINOR-not-PATCH follows ADR-010 for the source-incompatible
Experimental contracts; Public + Experimental + Active remains unchanged and
no Stable promotion or post-M14 capability is introduced.

### 2.2 Exact migration and package contract — Pass

The plan names required core `nullable`, Angular `setNullLabel`/
`nullValueLabel` and exhaustive text-member migrations, while distinguishing
schema-compiled consumers. Angular's packed core peer/dev pair becomes
`^0.2.0`/`0.2.0`; framework peers, `tslib`, exports, entry points and all other
package boundaries remain exact.

### 2.3 Tooling and version transition order — Pass

Version-aware tooling precedes manifest changes without requiring an
impossible target state. Historical exact `0.1.0` verification is separated
from mutable tag assertions. Candidate, exact live, `next`, `latest` and
unqualified modes have checkpoint-specific ownership and reject unintended
mixed release lines.

### 2.4 Licensing, source, security and private repository — Pass

AGPL/commercial notices, complete package-local Corresponding Source,
third-party rights, secret/private-data scans and neutral publication paths
remain mandatory. The plan adds no repository URL, provenance, workflow,
trusted/staged publishing, token policy or public GitHub action; D-043 remains
Deferred.

### 2.5 Local evidence and deterministic candidates — Pass

Frozen installation, format/docs/lint/types/tests/build, package, artifact,
source, security, declarations, consumers and diff review are complete. Exact
tar inventories, SHA-512/integrity, source commit and neutral-copy equality are
recorded before any external gate, and every correction restarts full review.

### 2.6 Git and registry approvals — Pass

Local checkpoints 1–3 require formal plan approval. Commit and private push
remain a later explicit stop. Core publication, Angular publication, Angular
`latest`, core `latest` and any recovery tag mutation each require immediate
approval with exact bytes, command and current remote state.

### 2.7 Publication and partial-release recovery — Pass

Core then Angular publish under `next` while the compatible `latest: 0.1.0`
pair remains untouched. A core-only partial release stops safely under `next`.
Both exact `0.2.0` packages must pass paired consumers before any `latest`
transition; published bytes are never overwritten or unpublished.

### 2.8 Coordinated latest transition — Pass

The plan acknowledges npm's lack of atomic cross-package tags, minimizes and
rejects evidence from the mixed transition window, gates Angular then core
separately and defines a separately approved rollback to the compatible
`0.1.0` pair if the second mutation fails. Final `next` and `latest` both route
to the inspected Experimental pair without implying stability.

### 2.9 Documentation and deferred boundaries — Pass

Release notes remain state-sensitive, immutable `0.1.0` history is preserved,
and onboarding, ROADMAP, STATUS, WORKLOG, D-009 and indexes have explicit
reconciliation ownership. No nullable container/union/default/coercion,
repository-publication or other deferred scope is activated.

### 2.10 Completion and stop conditions — Pass

Completion requires exact live bytes, both final tags, full consumers,
Corresponding Source, migration notes and a zero-finding repeated review.
Core-only, `next`-only, mixed-tag and failed-verification states remain partial.
No completed checkpoint grants later external action.

## 3. Verification

- Formatting passes after correcting the initial draft.
- Documentation passes across 101 Markdown files and 448 local links.
- Authority/current-code searches confirm all active `0.1.0` hardcodings that
  PLAN-015 must generalize are owned by checkpoint 1, while package manifests
  remain unchanged during plan preparation.
- `git diff --check` passes; no runtime, manifest, lockfile, candidate or
  external state changed.

Cycle 2 produced zero findings and no unresolved change request or
documentation conflict. PLAN-015 revision 0 remains Proposed. Formal approval
is the exact next decision and would authorize only local checkpoints 1–3;
every Git or registry action remains separately gated.
