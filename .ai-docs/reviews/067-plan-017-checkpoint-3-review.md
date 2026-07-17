# PLAN-017 checkpoint 3 complete review — Cycles 1–2

- **State:** Complete; cycle 2 passed with zero findings
- **Date:** 17 July 2026
- **Checkpoint:** PLAN-017 checkpoint 3 — Draft, validation and application
  state
- **Authority:** Approved PLAN-017 revision 0 and completed checkpoints 1–2

## 1. Cycle 1 findings

1. **R067-F001 — lost compile-input policy:** the first draft evaluator rebuilt
   only `schema` and `uiSchema`, so the stable-team scenario lost its approved
   `collectionPolicies`. It now copies the complete compile input and replaces
   only the two edited documents.
2. **R067-F002 — incomplete development prebundle boundary:** Angular's virtual
   project root could not resolve CodeMirror's transitive modules during
   development prebundling. The complete private CodeMirror/Lezer graph is now
   excluded explicitly, and the boundary verifier rejects an incomplete list.
3. **R067-F003 — repeated original serialization:** Restore eligibility rebuilt
   and serialized the immutable catalog input on every draft change. Original
   and active configuration are now separate copied states initialized once per
   scenario.

The complete state-machine, browser, boundary and diff review restarted after
all three corrections.

## 2. Complete review — Cycle 2

### 2.1 Authority and scope — Pass

Changes remain inside the private Angular shell, root lockfile and private
verification/documentation authorized by PLAN-017. No SPEC, ADR, deferred item
or Public contract changes.

### 2.2 State ownership and identity — Pass

Each scenario owns separate immutable original and active copies, two exact
draft strings, one draft result and a render epoch. Catalog objects are neither
mutated nor retained as editor-owned state. Full compile-input members,
including collection policy, survive edits.

### 2.3 Validate and diagnostics — Pass

Both texts are parsed independently. Syntax failure is application-owned and
non-mutating; successful parsing invokes the Public compiler. Compiler failure
leaves active input, form, value and epoch unchanged. Warnings remain unchanged
and produce a valid result.

### 2.4 Apply and stale prevention — Pass

Apply recompiles current exact text. Dirty/history state opens the inline loss
confirmation, any intervening edit dismisses it, and confirmation recompiles
again. Success installs a fresh active object, resets application state,
increments the epoch and replaces the mounted form element.

### 2.5 Cancel, Restore and scenario selection — Pass

Cancel restores active text without runtime mutation. Restore recompiles a
fresh copy of immutable original state and performs the same complete runtime
replacement. Scenario selection copies original into a distinct active state,
compiles it and resets controlled and shell state.

### 2.6 Active schema routing — Pass

Both Angular form configuration and the selected scenario validator receive
the active schema. No schema/value migration, default generation or runtime
reconciliation was introduced.

### 2.7 Tests and runtime evidence — Pass

Twenty private tests cover independent syntax failures, compiler failure,
warning success, validation without application, new object identity, stale
confirmation, runtime replacement, cancel/restore and all six scenarios.
Chromium 5/5 proves the visible edit/validate/cancel/apply/restore path and all
existing flows.

### 2.8 Build, isolation and diff — Pass

Strict types/templates, lint, snippets, production build, 20 manifest targets,
348 import boundaries and `git diff --check` pass. The private initial bundle
is 904.72 kB: it emits the existing 750 kB warning but remains below the 1 MB
error budget. Public source, manifests, exports, versions and behavior are
unchanged; the unrelated analytics identifier remains intact.

## 3. Result

Cycle 2 has zero findings, unresolved requests or documentation conflicts.
PLAN-017 checkpoint 3 is complete and checkpoint 4 may begin.
