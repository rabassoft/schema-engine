# PLAN-014 checkpoint 1 implementation review — Cycles 1–2

- **State:** Checkpoint 1 accepted; cycle 2 passed with zero findings
- **Date:** 15 July 2026
- **Scope:** PLAN-014 checkpoint 1 production, tests, fixtures, declarations and
  package smoke
- **Authority:** Approved PLAN-014 revision 0, Accepted SPEC-006 v0.1.1,
  ADR-019 revision 1 and ADR-005 revision 4
- **Implementation boundary:** checkpoint 1 only; type arrays and null operation
  compatibility remain inactive

## 1. Cycle 1 findings and corrections

1. **R036-F001 — false projection defect:** a primitive rejected for its new
   nullable contract was omitted from the temporary leaf projection, causing a
   second `inconsistent-leaf-projection` diagnostic. The validator now retains
   the exact leaf identity only for the two nullable capability defects, so the
   normative first defect is reported without weakening other structural
   validation.
2. **R036-F002 — unrelated fixture formatting:** full conformance regeneration
   expanded two pre-existing compact diagnostic parameter records unrelated to
   nullable output. Those lines were restored; the reviewed fixture diff now
   adds only canonical `nullable: false` members.

The complete checkpoint review was restarted after both corrections.

## 2. Complete review — Cycle 2

### 2.1 Authority and checkpoint boundary — Pass

Only PLAN-014 checkpoint 1 is implemented. The compiler still rejects type
arrays, operations/runtime still reject null as a primitive value and no
Angular null action/status behavior exists.

### 2.2 Public contracts — Pass

`BaseFieldDefinition.nullable` is required and transitively reaches every
primitive definition/template. `FieldTextMember` adds only `set-null` and
`null-value`. No symbol, root export, operation, snapshot, output, provider,
package or entry point is added.

### 2.3 Canonical scalar normalization — Pass

Direct, nested, collection-template and referenced scalar primitives emit an
own frozen `nullable: false`. Compiler production changes are limited to the
two existing definition/template builders and retain all M1–M13 behavior.

### 2.4 Manual definition validation — Pass

Direct nodes and templates require an own data boolean. Missing/inherited,
accessor and non-boolean values use the exact safe actual-type vocabulary
without invoking accessors. `nullable: true` plus non-empty choices uses the
closed capability defect. Locator families are mutually exclusive and ordered
by the existing iterative traversal.

### 2.5 Diagnostic projections and stopping — Pass

`applyFormOperation()` and collection operations project exact
`INVALID_FORM_DEFINITION` parameters. Runtime creation preserves the
`INVALID_RUNTIME_OPTIONS` wrapper with prefixed definition fields. Arrays and
locators are copied/frozen, the validator is not invoked and no false
projection diagnostic follows either new defect.

### 2.6 Repository migration — Pass

All typed and untyped manual primitive nodes/templates, fixture generators,
operation fixtures, compiler expectations and the Angular text-test field add
`nullable: false`. A recursive JSON audit found no primitive definition without
an own nullable member. Package smoke asserts scalar false through the public
root import.

### 2.7 Inactive later checkpoints — Pass

Focused evidence proves `['string', 'null']` remains
`UNSUPPORTED_FIELD_TYPE`, a valid manual `nullable: true` field still rejects a
null set operation and Angular production is unchanged. Versions, manifests,
dependencies, peers, lockfile, published bytes and stability remain unchanged.

### 2.8 Verification and diff — Pass

Formatting, documentation across 95 Markdown files and 441 local links, lint,
typecheck, build, 364 core tests, 76 Angular tests, both package smoke suites,
focused nullable tests, JSON definition audit and diff checks pass. The complete
production/test/fixture diff contains no unrelated behavioral change.

## 3. Result

Cycle 2 has zero findings and no unresolved change request or documentation
conflict. PLAN-014 checkpoint 1 is complete. Checkpoint 2 is the exact next
action and remains bounded to compiler type-array normalization.
