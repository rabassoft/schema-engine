# SPEC-003 complete review

- **Document reviewed:**
  [`SPEC-003 Draft v0.1.2`](../specs/003-collection-runtime.md)
- **Date:** 14 July 2026
- **Review state:** Cycle 3 passed with zero findings
- **Acceptance state:** Accepted by Ricard after cycle 3
- **Implementation authorized:** No

## Review method

Each cycle reviews the complete Draft against:

1. SPEC-001 v0.1.15 and SPEC-002 v0.1.2 unchanged behavior;
2. ADR-015 revision 4 template, identity, operation, runtime, Angular and
   Public inventory decisions;
3. ADR-005 revision 2 schema, UI, policy, traversal and diagnostic decisions;
4. the accepted D-006/M10 promotion boundary and all adjacent deferred items;
5. closed observable behavior, diagnostic envelopes and declaration-ready
   Public signatures; and
6. authorization gates for SPEC acceptance, PLAN-010, implementation,
   stability and publication.

After any correction, all six areas must be reviewed again. SPEC-003 cannot be
recommended for acceptance until one repeated complete cycle has zero findings
and no documentation conflict.

## Cycle 1 — Findings

### F-001 — Policy identity names are narrowed beyond ADR-015/ADR-005

- **Severity:** Contract conflict
- **Location:** SPEC-003 section 4 and policy diagnostics
- **Evidence:** The Draft requires `itemIdentityProperty` to be non-blank and
  diagnoses it with `expected: 'non-blank string'`. ADR-015 section 2.1 names
  one direct property and ADR-005 revision 2 section 11.4 requires an exact
  string; neither excludes an empty or whitespace property name. Only the
  runtime identity _value_ is required to be non-blank.
- **Required correction:** Accept every exact string policy property name,
  including empty/whitespace names when the item schema contains that direct
  required property. Reserve the non-blank rule for item identity values.

### F-002 — Item-root validation issues have no accepted text-resolution context

- **Severity:** Blocking architectural conflict
- **Location:** ADR-015 sections 2.5, 2.9, 2.10 and SPEC-003 sections 14–16
- **Evidence:** `ItemRuntimeSnapshot` exposes own `issues`; positional validator
  issues at an exact item index attach to the item; and Angular must render an
  accessible item host. Existing `FieldTextResolutionContext` and
  `ObjectTextResolutionContext` require a field/object definition.
  `CollectionTextResolutionContext` has branches only for `identity-error`,
  item label and structural actions, with no `issue` member or issue payload.
- **Impact:** SPEC-003 cannot define localized item-root issue projection
  without either bypassing the accepted `TextResolver`, misrepresenting the
  item as another node kind, or silently widening an Accepted Public union.
- **Required correction:** Prepare a narrow ADR-015 revision 3 adding `issue`
  to `CollectionTextMember`, an item-plus-issue branch to
  `CollectionTextResolutionContext`, and the corresponding changed-Public
  inventory delta. Review and explicitly accept that revision before correcting
  and repeating SPEC-003 review.

### F-003 — Item leaf and text Public signatures are not declaration-ready

- **Severity:** Public contract gap
- **Location:** SPEC-003 sections 10, 15 and 17
- **Evidence:** ADR-015 requires transitive changes to `TextResolutionContext`,
  `SchemaFieldOutletDirective.schemaFieldOutlet`,
  `AngularFieldRenderer.field`, `RendererTester` and
  `AngularRendererResolver.resolve()`. The Draft summarizes that inventory but
  does not state how a `FieldTemplate` enters those existing signatures.
  It also omits the exact instance-leaf rule for stable `key` versus positional
  `path`.
- **Required correction:** Close the existing contracts with
  `FieldDefinition | FieldTemplate` at text/renderer definition boundaries;
  state that an item-instance leaf snapshot uses the stable canonical instance
  key and current positional data path; and keep all renderer intentions routed
  by the stable collection address owned by the outlet.

### F-004 — Focus and blur lack a stable item-address contract

- **Severity:** Observable runtime gap
- **Location:** SPEC-003 sections 8, 11, 13 and 16
- **Evidence:** ADR-015 says numeric `DataPath` is positional/read-only and no
  intention may rely on it, while touched/focus ownership is keyed by item ID
  plus relative path. SPEC-003 defines stable value/remove intentions but does
  not widen or otherwise define the existing `focus()`/`blur()` and Angular
  projections for an item leaf.
- **Required correction:** Close `focus()` and `blur()` over an inline
  `DataPath | CollectionNodeAddress` target without adding an unlisted Public
  symbol. Numeric `DataPath` must remain invalid as an interaction target;
  stable item addresses must resolve one primitive leaf and preserve existing
  missing/incompatible ancestor behavior.

### F-005 — Collection operation diagnostics remain open

- **Severity:** Diagnostic contract gap
- **Location:** SPEC-003 section 12
- **Evidence:** The Draft lists new reasons but does not close required
  parameters, data paths, fallback messages, validation order or branch
  stopping for structural stale cases, malformed addresses/placements,
  identity mismatch, duplicate identity and manual definition mismatch.
  `STALE_OPERATION` currently has an accepted expectation envelope without a
  `reason`, and `INCOMPATIBLE_OPERATION_VALUE.fieldType` is currently closed to
  primitive kinds; a list of proposed additions does not define how the M10
  variants coexist with those accepted shapes.
- **Required correction:** Define collection-only diagnostic envelopes and
  precedence explicitly, preserving every non-collection shape unchanged.
  Close structural stale parameters separately from terminal expectation
  mismatch and do not defer normative parameter design to PLAN-010.

### F-006 — Manual definitions and external item trees are underspecified

- **Severity:** Runtime safety gap
- **Location:** SPEC-003 sections 7, 9, 12 and 17
- **Evidence:** The Draft says malformed collection definitions are rejected
  but gives no exact `INVALID_RUNTIME_OPTIONS`/`INVALID_FORM_DEFINITION`
  reasons or locators. It also does not distinguish an accessor array slot,
  identity accessor and accessor at an editable managed item descendant across
  runtime creation and atomic external updates.
- **Required correction:** Close collection/template manual-definition reasons,
  index-path/field locators and validation order. Retain identity state for
  accessor slots/identity properties, but apply the accepted
  `INVALID_RUNTIME_OPTIONS`/`INVALID_EXTERNAL_STATE_UPDATE` managed-accessor
  rule to editable descendants, before validator invocation and atomically.

## Cycle 1 — Areas without findings

- The Draft preserves controlled application ownership and framework-neutral
  core behavior.
- Static template versus runtime instance separation, stable item identity,
  canonical key families, current/baseline matching and dynamic runtime leaf
  projection are aligned with ADR-015.
- Schema/items/UI traversal, active-ancestry cycles, sibling sharing,
  template-relative paths and nested-array exclusion align with ADR-005
  revision 2.
- Five operation discriminants, opaque inserted-item ownership, stable anchors,
  materializing start/end insertion and controlled confirmation are preserved.
- Primitive/nested arrays, tuples, refs/composition, defaults/factories,
  batches/optimism, layout, persistence, Stable promotion and publication stay
  inactive.
- SPEC acceptance, PLAN-010 approval and implementation remain separate gates.

## Cycle 1 conclusion

Cycle 1 does not pass. Six findings require correction, and F-002 cannot be
resolved inside SPEC-003 without silently changing the Accepted ADR-015 Public
text contract. Review is therefore paused before corrections.

The exact next action is to decide whether to prepare the recommended narrow
ADR-015 revision 3. If authorized, it must be drafted, completely reviewed and
explicitly accepted before SPEC-003 is corrected and the complete review is
repeated.

## Follow-up status

Ricard authorized preparation of ADR-015 revision 3. The narrow proposal was
drafted and its complete review cycle 1 passed all six areas with zero findings.
At that checkpoint F-002 remained open until explicit acceptance and SPEC-003
corrections stayed paused.

Ricard subsequently accepted ADR-015 revision 3, resolving F-002 and
authorizing correction plus complete repeated review of SPEC-003 only.

## Cycle 2 — Resolution of cycle-1 findings

| Finding | Resolution in SPEC-003 Draft v0.1.1                                                                                               | Result                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| F-001   | Policy identity property names now accept every exact string; non-blank applies only to runtime identity values.                  | Closed                                                         |
| F-002   | Accepted ADR-015 revision 3 adds the exact item-root issue branch, source/fallback semantics and Public inventory delta.          | Closed                                                         |
| F-003   | Text/Angular field boundaries now use `FieldDefinition                                                                            | FieldTemplate`; instance keys are stable and paths positional. | Closed |
| F-004   | `focus`/`blur` accept stable `CollectionNodeAddress`; numeric data paths remain read-only observations.                           | Closed                                                         |
| F-005   | Collection helper/action diagnostics now have separate closed codes, parameters, order, fallbacks and branch stopping.            | Closed                                                         |
| F-006   | Manual definition reasons/locators and external identity/accessor inspection order are closed before validator/effect processing. | Closed                                                         |

## Cycle 2 — Complete repeated review

### 1. Accepted baselines and architecture — Finding

All six prior corrections align with SPEC-001/SPEC-002, ADR-005 revision 2 and
ADR-015 revision 3. One adjacent Accepted-ADR inventory gap remains as F-007.

### 2. Schema, UI and policy — Pass

- Exact-string policy identity names now match the accepted ADRs.
- Exterior/semantic policy shapes, paths, order and fallbacks are internally
  consistent and descriptor-safe.
- Array/items/UI traversal, template-relative diagnostics, cycles, sharing and
  nested-array stopping remain aligned with ADR-005 revision 2.

### 3. Runtime, operations and diagnostics — Pass

- Stable/positional addresses, identity states, dynamic projections,
  current/baseline dirty, interaction and structural sharing are closed.
- Manual definitions, external accessors and validator ordering are safe and
  deterministic.
- Helper/action shape, managed, incompatible, stale and ancestor diagnostics
  preserve non-collection envelopes and close every collection-only branch.

### 4. Public declarations — Finding

Item template/leaf/text signatures and stable focus/blur are declaration-ready.
The collection-node text context itself remains absent from the Accepted Public
inventory as described by F-007.

### 5. Angular projection — Finding

Stable item outlets, item issue projection, host ownership, actions, focus and
failure isolation pass. Collection-node ordinary text/issue projection cannot
be typed without the F-007 correction.

### 6. Deferred boundaries and gates — Pass

Every M10 non-goal remains inactive. SPEC-003 is still Draft; PLAN-010,
implementation, Stable promotion and publication remain unauthorized.

### F-007 — Collection-node ordinary texts and issues have no Public context

- **Severity:** Blocking architectural/Public inventory conflict
- **Location:** ADR-015 sections 2.5, 2.9, 2.10/2.11 and SPEC-003 sections
  14–17
- **Evidence:** `ArrayRuntimeSnapshot` owns array-path `issues`; the fixed
  collection host renders label/description/hint/tooltip and collection issues.
  ADR-015 says ordinary collection node text retains normalized node rules, but
  `ObjectTextResolutionContext.node` is closed to `ObjectFieldDefinition`,
  while `CollectionTextResolutionContext` is closed to identity/item/action and
  accepted item-root issue members. Neither context can truthfully represent an
  `ArrayNodeDefinition` ordinary text or collection-root issue.
- **Impact:** SPEC-003 cannot localize collection labels/issues without
  bypassing `TextResolver`, mis-typing the array as an object or silently
  changing `ObjectTextResolutionContext` contrary to ADR-009's exact inventory
  discipline.
- **Required correction:** Prepare a narrow ADR-015 revision 4 that widens only
  `ObjectTextResolutionContext.node` to
  `ObjectFieldDefinition | ArrayNodeDefinition`, names that changed Public
  contract and its transitive `TextResolutionContext`/resolver delta, and keeps
  collection projection Internal. The existing `ObjectTextMember` including
  `issue` can then serve ordinary object/array node text without a new symbol.

## Cycle 2 conclusion

Cycle 2 does not pass. All six cycle-1 findings are closed, but F-007 requires
an Accepted Public contract correction before SPEC-003 can be completed.

The exact next action is to decide whether to prepare the recommended narrow
ADR-015 revision 4. If authorized, it must be drafted, completely reviewed and
explicitly accepted before correcting SPEC-003 and repeating the complete
review again. PLAN-010 and implementation remain unauthorized.

## Cycle 3 — Resolution of F-007

Ricard accepted ADR-015 revision 4 after its complete six-area review passed
with zero findings. SPEC-003 Draft v0.1.2 now:

- widens both `ObjectTextResolutionContext.node` branches exactly to
  `ObjectFieldDefinition | ArrayNodeDefinition`;
- restricts the array branch to normalized ordinary node text and issues
  already assigned to `ArrayRuntimeSnapshot`;
- preserves accepted source, fallback and blank-result semantics;
- closes the existing `TEXT_RESOLUTION_FAILED` array-node shape without adding
  a diagnostic code, parameter family or projection order;
- names the transitive `TextResolutionContext`/`TextResolver.resolve()` Public
  delta without adding a symbol; and
- keeps fixed collection-node text projection Internal with no Public Angular
  change.

F-007 is closed.

## Cycle 3 — Complete repeated review

### 1. Accepted baselines and architecture — Pass

- The complete Draft remains an explicit extension of SPEC-001 v0.1.15 and
  SPEC-002 v0.1.2 only for the promoted array/numeric-path boundary.
- Every collection template, identity, stable address, operation, snapshot,
  scope, text and Angular contract aligns with accepted ADR-015 revision 4.
- Schema, UI and policy interpretation remains aligned with accepted ADR-005
  revision 2; no authoritative documentation conflict remains.

### 2. Schema, UI and policy — Pass

- Exact-string identity policy names, policy multiplicity, array/items shape,
  identity schema restrictions and traversal order remain closed.
- Descriptor-safe schema/UI/policy inspection, diagnostics, cycles, sibling
  sharing, template-relative paths and branch stopping remain deterministic.
- Primitive/nested arrays, tuples and every unpromoted keyword remain rejected
  at the accepted boundaries.

### 3. Runtime, operations and diagnostics — Pass

- Presence, identity state, current/baseline dirty, stable interaction,
  structural sharing, positional validation assignment and dynamic projections
  remain complete.
- All five operations retain exact discriminants, arguments, concurrency,
  stale/no-effect behavior, immutable application and diagnostic precedence.
- Manual definitions, external accessors, runtime actions and host failures
  retain closed safe reasons, parameters, paths, fallbacks and ordering.

### 4. Public declarations — Pass

- Policy/UI/template/definition/address/snapshot/operation/runtime/scope and
  item-leaf text signatures are declaration-ready.
- Accepted ADR-015 revision 4 now supplies the exact ordinary array-node text
  branch, including both changed Public context/resolver contracts and no new
  symbol.
- Root entry points, Experimental + Active classification and all package,
  version and Stable boundaries remain unchanged.

### 5. Angular projection — Pass

- Fixed collection/item hosts remain Internal; primitive item leaves alone use
  ADR-007 renderer registration and private Signal Forms buffers.
- Ordinary collection text/issues, collection-specific action/item text and
  descendant text each use their accepted context without mis-typing or
  bypassing `TextResolver`.
- Stable view/focus ownership, accessibility, action availability and isolated
  host-creation failures remain closed and framework-neutral core owns no
  Angular behavior.

### 6. Deferred boundaries and gates — Pass

- Every M10 non-goal and adjacent deferred capability remains inactive.
- SPEC-003 remains Draft; this review does not constitute formal acceptance.
- PLAN-010 drafting/approval, implementation, Stable promotion and publication
  remain separate unauthorized gates.

## Cycle 3 conclusion

Cycle 3 passes all six areas with zero findings and no documentation conflict.
F-001 through F-007 are closed. SPEC-003 Draft v0.1.2 is ready for explicit
formal acceptance or rejection; the review itself does not accept the SPEC,
authorize PLAN-010 or permit implementation/publication.

## Formal decision

Ricard explicitly accepted SPEC-003 v0.1.2 on 14 July 2026. Acceptance
authorizes preparation and review of PLAN-010 only; it does not approve that
plan, authorize implementation or permit publication.
