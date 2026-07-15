# ADR-017 complete review — Cycles 1–3

- **State:** Accepted after cycle 3 passed with zero findings
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Document reviewed:**
  [`ADR-017 revision 0`](../adrs/017-grupos-presentacion-estaticos.md)
- **Authority:** accepted review 022 and promoted D-042
- **Cycle 1:** one current-state documentation finding
- **Cycle 2:** one deferred-register summary finding
- **Cycle 3 result:** all eight required areas pass with zero findings

## Cycle 1 finding and correction

ROADMAP still said that M12 had no ADR, and the root guide described ADR-017 as
the next document after it had already been drafted. Both phrases contradicted
the Proposed state recorded by ADR-017, the ADR index and STATUS.

The wording was corrected to identify ADR-017 revision 0 as Proposed and
reviewed, with formal acceptance as the next gate. No architectural contract
changed. The complete eight-area review was then repeated as cycle 2.

## Cycle 2 finding and correction

The active deferred-register summary named the implemented Promoted D-005/D-006
capabilities but omitted D-041 and newly promoted D-042 before saying all other
entries retained their state. That summary was incomplete after M11 and review
022 acceptance.

It now records D-041/M11 and D-042's design-only M12 state explicitly, and the
register history records review 022 acceptance plus the proposed/reviewed
ADR-017 checkpoint. No decision or architectural contract changed. The complete
eight-area review was then repeated as cycle 3.

## 1. Data/presentation separation — Pass

The proposed `presentation` forest is an identity-consistent projection of
root `FormDefinition.nodes`, not a replacement data tree. Sections have no data
path, snapshot, validation, operation, dirty, interaction or scope semantics.
The exact original root node object is retained by each `form-node` wrapper,
and adapters still receive normalized definitions rather than raw UI Schema.

No accepted M9/M10 structural authority is reassigned.

## 2. Boundary, membership, identity and order — Pass

The first slice is explicitly root-only. Root object and collection nodes are
atomic presentation members whose existing fixed hosts retain their complete
subtrees. Nested sections are permitted, but nested data-node and collection
item grouping is excluded.

Every root node must occur exactly once; unknown, duplicate and omitted nodes
are invalid. Section IDs are exact, globally unique non-empty strings, labels
are non-blank, children are non-empty and keys use the tagged
`JSON.stringify(['section', id])` identity. Presentation order cannot alter
`nodes`, leaf order, snapshots or operations. Root `order` and `presentation`
cannot become competing authorities.

## 3. Inspection, hostile input and fallback — Pass

Inspection is iterative, descriptor-safe and active-ancestry cycle aware. It
does not execute accessors or retain caller containers. ADR-017 names the
`INVALID_UI_PRESENTATION` warning family and delegates its closed reason,
parameter, path and ordering inventory to the SPEC.

Any defect invalidates the root presentation atomically and falls back to one
wrapper per already normalized root node. The compiler therefore preserves all
managed nodes and can still return a valid definition. Manual malformed
presentation instead follows existing runtime/operation definition-validation
envelopes before validator or consumer execution.

## 4. Text, DOM identity and accessibility — Pass

Only the required section label is introduced. It receives a distinct Public
text context and preserves the accepted resolver fallback model. The tagged
`[formId, 'section', sectionId]` DOM tuple cannot collide with the existing
`[formId, path]` tuple, and the fixed host uses semantic `fieldset`/`legend`
markup without inventing aggregate state or issues.

Creation failure is isolated by the named
`SECTION_HOST_INSTANTIATION_FAILED` family. Exact safe parameters and ordering
remain a SPEC obligation.

## 5. Runtime, scopes and controlled ownership — Pass

Value/baseline ownership, validator input, issue assignment, runtime snapshots,
operations, focus, touched, dirty and persistence remain unchanged. No section
is a runtime target. The application may independently construct a matching
scope, but metadata neither generates nor registers one, preserving D-012.

## 6. Renderer and container boundaries — Pass

ADR-007 remains limited to primitive leaf renderer selection. Existing fixed
object, collection and item hosts remain unchanged, and the new section host is
also fixed and Internal. There is no container registry, renderer capability
negotiation, portal, lazy component, raw UI interpretation or Signal Forms
ownership expansion.

## 7. ADR-009 migration inventory — Pass

The ADR names every new Public core symbol, the required
`FormDefinition.presentation` and optional root `UiSchema.presentation`
changes, the widened text union, manual-definition migration and changed
Angular behavior. It adds no Public Angular symbol and keeps packages, entry
points, dependencies, versions, publication and stability unchanged.

The breaking delta is explicitly classified Public + Experimental + Active and
cannot be expanded by the later SPEC without revising the ADR inventory.

## 8. Deferred and authorization boundaries — Pass

Tabs, accordions, wizards, grids, responsive rules, layout state, conditional
visibility, actions, generated scopes, nested/item groups, custom containers,
adapter capabilities and dynamic definitions all remain inactive. D-011 and
D-012 stay Deferred outside D-042. Publication and Stable promotion remain
unauthorized.

ADR acceptance may authorize drafting the M12 SPEC only. It cannot approve a
plan, Public contract change or implementation.

## 9. Decision gate

Cycle 3 has zero findings. Ricard's standing authorization formally accepted
ADR-017 revision 0 on 15 July 2026. Acceptance authorizes drafting and reviewing
the M12 SPEC only; no plan, Public contract change or implementation is active.
