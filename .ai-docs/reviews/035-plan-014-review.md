# PLAN-014 complete review — Cycles 1–3

- **State:** Approved after cycle 3 passed with zero findings
- **Date:** 15 July 2026
- **Approval date:** 15 July 2026
- **Document reviewed:**
  [`PLAN-014 revision 0`](../plans/014-nullable-primitive-leaves.md)
- **Authority:** Accepted SPEC-001 through SPEC-006, ADR-019 revision 1,
  ADR-005 revision 4 and the applicable Accepted architectural boundaries
- **Implementation authorized:** Yes — PLAN-014 checkpoints 1–6 only

## 1. Cycle 1 finding

1. **R035-F001 — formatting:** the initial draft did not pass Prettier.

The plan was formatted and the complete review restarted.

## 2. Cycle 2 findings

The repeated complete review found three precision defects:

1. **R035-F002 — complete authority:** the header named SPEC-006 but did not
   explicitly retain SPEC-001 through SPEC-005 or ADR-018's immutable
   publication boundary.
2. **R035-F003 — coordinated migration guidance:** the plan inventoried the
   required Experimental signature changes but did not require one explicit
   source-migration note without selecting a version or rewriting the
   historical `0.1.0` release.
3. **R035-F004 — exact Angular accessibility:** the Angular checkpoint relied
   on the evidence matrix for the action/status markup but did not itself fix
   the action-label order, status element, role/live exclusions and
   described-by position.

All three were corrected and the complete review restarted.

## 3. Complete review — Cycle 3

### 3.1 Authority and promoted scope — Pass

The plan is bounded by all six Accepted SPECs, the coordinated nullable ADRs,
the applicable renderer/API/SemVer/clear/nested/collection decisions and the
immutable publication boundary. Only the exact D-009/M14 nullable primitive-
leaf slice is active.

### 3.2 Public/Internal migration — Pass

The required core nullable member, two text-member values and two Angular text
snapshot members are exact. No new Public symbol, export, entry point, package,
operation, snapshot, output, provider or renderer registration is allowed.
Repository consumers and source migration guidance move atomically with their
required contracts.

### 3.3 Checkpoint dependency order — Pass

Checkpoint 1 establishes a buildable canonical false member and validates
manual definitions before array support. Compiler normalization precedes
definition-aware null operations; those precede Angular projection. Complete
package/conformance evidence and final review depend on all earlier green
gates.

### 3.4 Compiler and diagnostics — Pass

The plan covers the closed two-member grammar, descriptor-safe inspection,
every invalid member/combination, paths, provenance, precedence, branch
stopping, constraints/UI behavior, excluded containers/identity and
non-retention.

### 3.5 Manual definitions, operations and runtime — Pass

Both manual diagnostic wrappers and locator families are preserved. Raw
operations remain structural; direct/deep and item-relative compatibility keep
their distinct diagnostic families. Strict expectations, no-effect/stale,
ancestor behavior, dirty, validation and application ownership are explicit.

### 3.6 Angular, texts and accessibility — Pass

The exact set-null action, confirmed-null status, clear distinction, focus-
before-output, text resolver order/failures, IDs, described-by position and
Signal Forms buffers are closed. String enum, custom/native resolution,
registrations and outputs do not widen.

### 3.7 Evidence matrix — Pass

All 23 SPEC-006 scenario groups map to focused fixtures, hostile programmatic
tests, regression suites, declarations, packages, artifacts or clean
consumers. Fixture generation cannot serve as its own oracle.

### 3.8 Packages, versions and publication — Pass

Root exports, manifests, dependencies, peers, lockfile and published bytes are
guarded. Temporary pack verification is disposable and does not designate a
release candidate. M14 remains unpublished; any future delivery is classified
MINOR-not-PATCH without choosing versions here.

### 3.9 Verification and diff safety — Pass

Focused and full commands, frozen install, declarations, source rebuilds,
packed contents, lower/upper Angular 22 consumers, documentation, deferred
boundaries and complete-diff repetition are all required. Expected production
files are narrow and unexpected package/registry drift stops the work.

### 3.10 Authorization and completion — Pass

Review completion does not approve the plan. A separate explicit decision may
authorize only checkpoints 1–6. Completion requires every gate and scenario,
plus a repeated zero-finding implementation review. Contract/scope changes,
versions, releases, external actions, commits and pushes remain separate stop
conditions.

## 4. Result

Cycle 3 has zero findings and no unresolved change request or documentation
conflict. Ricard formally approved PLAN-014 revision 0 on 15 July 2026.
Approval authorizes only checkpoints 1–6; versions, releases, external actions,
commits and pushes remain separately unauthorized.
