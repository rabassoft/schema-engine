# PLAN-017 complete review — Cycles 1–3

- **State:** Complete and approved; cycle 3 passed with zero findings
- **Date:** 17 July 2026
- **Document reviewed:**
  [`PLAN-017 revision 0`](../plans/017-reference-workspace-ux.md)
- **Authority:** Completed PLAN-016 revision 0, Accepted ADR-020 revision 0,
  Accepted SPEC-001 through SPEC-006, applicable Accepted ADRs and Deferred
  D-011 through D-013 boundaries
- **Approval:** Ricard explicitly approved revision 0 on 17 July 2026
- **Implementation authorized:** Yes — PLAN-017 checkpoints 1–6 only; the
  dependency installation and other external/Git actions retain separate gates

## 1. Cycle 1 finding

1. **R064-F001 — edited-schema validation overclaim:** the first draft routed
   active schema into the scenario validator without recording that the six
   validators are authored demonstrations and several intentionally ignore that
   argument. It could therefore imply general JSON Schema validation that the
   application does not provide.

The plan now defines `Valid` narrowly as JSON syntax accepted by the existing
Schema Engine compiler subset, labels existing results `Scenario validation
issues`, displays an edited-schema caveat and explicitly excludes Ajv or any
other new validator. The complete review restarted.

## 2. Cycle 2 finding

1. **R064-F002 — destructive local transition:** successful Apply and Restore
   reset controlled value, baseline, pending intentions, history and shell
   controls, but the draft did not require warning or confirmation when users
   had state to lose.

The plan now requires an inline accessible confirmation that names discarded
state, restores focus correctly and cannot reuse a stale draft. Apply performs
a fresh parse/compile on final confirmation; editor changes dismiss pending
confirmation. No-effect action states are exact. The complete review restarted.

## 3. Complete review — Cycle 3

### 3.1 Authority and scope — Pass

The plan changes only the private Angular reference shell, its private editor
dependencies and directly required tests/tooling/docs. It promotes no milestone
or deferred capability and changes no Public source, behavior, declaration,
manifest, export, package, version, release or compatibility claim.

### 3.2 Deferred and runtime boundaries — Pass

Tabs remain shell navigation rather than UI Schema layout or scopes, so D-011
and D-012 stay Deferred. Every successful configuration Apply destroys and
recreates the mounted runtime instead of reconciling a definition, preserving
D-013 and SPEC-001's immutable-definition rule.

### 3.3 Dependency boundary — Pass

The exact separately gated command adds only MIT-licensed `codemirror@6.0.2`
and `@codemirror/lang-json@6.0.2` to the private application. No wrapper,
floating version, public dependency or lifecycle/network action is introduced.
The Internal Angular component owns and destroys the browser editor view.

### 3.4 Information architecture — Pass

Scenario context, decision semantics and form preview remain available while
Configuration and Evidence use independent, bounded tab sets. The grouping
reduces top-level scroll without producing ten competing tabs, hiding essential
controls or coupling to renderer internals.

### 3.5 Visual and accessibility contract — Pass

Semantic categories use labels/status as well as color, require AA contrast
review and visible focus, and distinguish JSON token types. The WAI-ARIA tabs
keyboard/relationship model, editor names/instructions, narrow/wide reflow and
200% inspection are explicit without making a certification claim.

### 3.6 Editor and draft state — Pass

Original, active, draft, result and runtime-epoch states have separate
authority. Scenario selection is deterministic, absent UI Schema has the
Accepted empty representation, edits invalidate stale results and no draft is
persisted or written back to the catalog.

### 3.7 Validate and diagnostics — Pass

Both drafts parse independently before exactly one Public compile. Syntax and
Public compiler feedback remain distinct; returned diagnostics and ordering are
not rewritten. `Valid` makes no full-standard claim, scenario validation is
honestly labelled, and diagnostic focus never invents a source range.

### 3.8 Apply, Cancel, Restore and Reset — Pass

Apply recompiles exact current text, confirms loss when needed, installs active
input and recreates runtime/application state. Cancel affects drafts only;
Restore recovers immutable original configuration; Reset retains active
configuration while resetting controlled/shell state, including collection
draft inputs. No-op and focus behavior are closed and testable.

### 3.9 Security and ownership — Pass

Edited JSON is parsed as data, never executed, loaded, persisted or sent over a
network. The application remains the only value/baseline owner, the catalog
stays immutable, Public compiler/operations remain authoritative and no
schema/value migration or defaults are invented.

### 3.10 Checkpoints and verification — Pass

Dependency/primitives precede layout, state transitions, diagnostics/reset,
full regression and final repeated review. Focused gates plus the final frozen
install, docs/format/lint/types/tests/build/browser/boundary/package/source/
artifact/security/consumer matrix preserve clean-checkout and release evidence.

### 3.11 Persistent state and stops — Pass

Checkpoint documentation rules remain append-only and ROADMAP/SPEC/ADR/deferred
documents stay unchanged. Public changes, deferred promotion, persistence,
additional shells, release/external/Git actions, dependency widening and
unresolvable conflicts are explicit stops.

### 3.12 Executability and diff — Pass

File boundaries, exact dependency command, state transitions, labels, evidence
and gates are sufficient to implement each checkpoint without an unstated
architectural choice. The unrelated `angular.json` analytics identifier remains
outside the plan.

Formatting, documentation links, plan/deferred/authority searches and diff
checks pass for the reviewed documentation scope.

## 4. Result

Cycle 3 has zero findings, unresolved change requests or documentation
conflicts. Ricard explicitly approved PLAN-017 revision 0 on 17 July 2026.
Checkpoints 1–6 are authorized; dependency installation, Git, publication and
all other external actions retain their separate gates.
