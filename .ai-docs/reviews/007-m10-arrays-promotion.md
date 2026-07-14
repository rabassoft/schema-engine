# M10 — Arrays promotion review

- **State:** Accepted; D-006 promoted for normative design only
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Candidate:** D-006 — Arrays
- **Milestone:** M10 — Arrays
- **Behavior or public-contract changes authorized:** None
- **Normative baseline:** accepted SPEC-001 v0.1.15 and SPEC-002 v0.1.2
- **Required decisions before implementation:** proposed ADR-015, ADR-005
  revision 2, SPEC-003 and PLAN-010

## 1. Purpose

Determine whether D-006 has enough evidence to leave Deferred state, define the
smallest coherent M10 design boundary, and identify every decision gate required
before implementation.

Before acceptance this review did not promote D-006, amend an ADR or SPEC,
approve a plan, change Public contracts, implement arrays or authorize
publication. Ricard subsequently accepted only the reviewed design boundary.

## 2. Conclusion

D-006 is **eligible for explicit promotion to normative design work**. Its
resumption condition is met: the normalized object tree, deep controlled paths,
recursive runtime/Angular projection and package consumers are completed and
verified by M9.

Implementation is not ready. Arrays introduce a distinction absent from M9:
the definition describes one item template while runtime snapshots represent
many item instances. Position cannot be stable item identity, especially across
insert, remove, move and concurrent controlled-state confirmation. That decision
must be closed before any API or compiler change.

The accepted promotion boundary is deliberately narrow: homogeneous lists
of inline object items with a mandatory application-owned stable string identity
contract. Promotion authorizes drafting the required documents only.

## 3. Smallest coherent M10 boundary

### In scope for normative design

- Array properties at any currently supported object depth, declared with
  `type: "array"` and one inline `items` object schema.
- Homogeneous item objects containing the existing inline-object and primitive
  leaf subset, without nested arrays.
- A mandatory application-owned stable string item identity that is distinct
  from position and deterministic across controlled value replacements.
- A normalized immutable array definition that separates the static item
  template from runtime item instances.
- Item-instance snapshots with stable identity, current numeric position,
  presence, dirty, validation, interaction and descendant leaf snapshots.
- Descriptor-safe leaf editing within an item plus single-item insert, remove
  and move intentions with strict stale/concurrency protection.
- Insert requests that receive an explicit application value; core and Angular
  never synthesize an item from schema `default`.
- Controlled confirmation/rejection, structural sharing, focus reconciliation,
  scopes, issue assignment and deterministic diagnostics for item instances.
- A fixed accessible Angular list host using the existing leaf renderers and
  fixed object hosts; application-triggered insertion and accessible single-item
  remove/move actions may be designed.
- Conformance evidence for duplicate/missing identities, reordered external
  values, concurrent structural changes, hostile keys, accessors and lifecycle.

### Still out of scope

- Arrays of primitives, enums or arrays; nested arrays; tuples and
  `prefixItems`.
- Identity by numeric index, object reference, array slot or deep-value hashing.
- `$ref`, `$defs`, composition, conditionals, `contains`, `unevaluatedItems`,
  remote schemas or additional dialects.
- Schema-default application, implicit item factories or core-owned IDs.
- Multi-item selection, bulk operations, batches/transactions, undo/redo,
  optimistic state or ancestor pruning.
- Drag-and-drop, virtualization, pagination, tables, grids, custom collection
  renderers or general layout metadata.
- Dynamic definitions, async/framework validation, persistence, submission,
  publication, new entry points or Stable API promotion.

## 4. Why narrower alternatives are rejected

### Numeric index as identity

Rejected because an insertion or move changes the identity of unrelated items,
breaks renderer/focus continuity and cannot distinguish a stale item intent from
an intent aimed at the new occupant of the same index.

### Runtime-generated IDs

Rejected because the application remains the source of truth and a runtime
cannot deterministically reconcile duplicate primitive values or fresh object
instances after controlled replacement.

### Primitive arrays in the first slice

Deferred because duplicate primitives have no application-owned identity and an
editable primitive value cannot safely serve as immutable identity.

### Nested arrays or tuples

Deferred because they multiply template/instance addressing and ordering rules
before the single homogeneous collection contract is proven.

### Core-generated insertion values

Rejected because applying JSON Schema defaults or constructing domain objects is
outside runtime ownership and remains D-039/application responsibility.

## 5. Required architectural decisions

### M10-D1 — Template versus instance model

Define the relationship between static `ArrayFieldDefinition`/item templates,
runtime item instances, the existing tree/leaf projection and manual-definition
validation. No runtime instance may be inserted into the immutable compiled
definition.

### M10-D2 — Stable identity contract

Choose how an application declares and supplies the stable string identity,
then close missing, duplicate, blank, accessor, changed and hostile identity
behavior. Decide whether the identity leaf is managed, editable or projection
metadata without introducing framework ownership.

### M10-D3 — Paths and canonical keys

Separate positional `DataPath` addressing from stable item identity. Define
numeric item segments, template paths, instance paths, lookup behavior,
canonical keys, DOM IDs and collision resistance without weakening M9 string
object-path rules.

### M10-D4 — Structural operations and concurrency

Define exact insert/remove/move operation envelopes, anchors, expectations,
application helpers, structural sharing and stale behavior. One intention must
remain one incremental operation; D-021 batches stay Deferred.

### M10-D5 — Presence, dirty and interaction

Specify array/item presence, ordering dirty, inserted/removed/moved identity,
descendant dirty, focus/touched reconciliation and behavior while external
state temporarily has missing, duplicate or incompatible identities.

### M10-D6 — Validation and scopes

Define issue assignment for array nodes, item identities, numeric positions and
descendants; scope selection across moves; visibility; and deterministic
handling of validator paths that refer to stale/out-of-range indices.

### M10-D7 — Recursive schema/UI traversal

Revise ADR-005 for the supported array keyword catalog, `items` traversal,
cycles/shared schemas, diagnostics and branch stopping. Define only minimal list
texts/actions in structural UI Schema, not a layout language.

### M10-D8 — Angular ownership and accessibility

Define a fixed list/item host, stable tracking, semantic list/group structure,
labels, action names, focus after remove/move, failure isolation and teardown.
Leaf renderer registration remains ADR-007-only.

### M10-D9 — Experimental API migration

Inventory every new or changed Public type/method/operation under ADR-009,
retain root entry points and Experimental status, and migrate all repository and
clean consumers atomically.

## 6. Required document sequence

1. Explicitly accept this review and promote D-006/M10 for design work.
2. Draft ADR-015 for collection template/instance modeling, stable identity,
   paths, operations, snapshots/scopes and Angular ownership.
3. Draft ADR-005 revision 2 for array-schema traversal and compatibility.
4. Draft SPEC-003 for the complete observable M10 behavior and its relationship
   to SPEC-001/SPEC-002.
5. Repeat complete reviews after every correction until ADR-015, ADR-005
   revision 2 and SPEC-003 pass with zero findings, then accept them explicitly.
6. Draft and repeatedly review PLAN-010 with migration, conformance, package and
   clean-consumer gates.
7. Start implementation only after PLAN-010 is explicitly approved.

## 7. Promotion matrix

| Area                     | Result      | Evidence or condition                                                                    |
| ------------------------ | ----------- | ---------------------------------------------------------------------------------------- |
| Resumption condition     | Pass        | M9 object model and recursive runtime are complete.                                      |
| Smallest deliverable     | Pass        | Homogeneous inline-object item lists with stable application identity.                   |
| Stable identity          | Conditional | ADR-015 must reject positional/runtime-generated identity before implementation.         |
| SPEC consistency         | Conditional | SPEC-003 must explicitly replace array exclusions in SPEC-001/SPEC-002.                  |
| ADR-005 compatibility    | Conditional | Revision 2 must close array keywords, traversal and diagnostics.                         |
| Framework neutrality     | Pass        | Template/instance model, operations and snapshots remain in core.                        |
| Controlled ownership     | Pass        | Application supplies values and identities; runtime emits intentions only.               |
| Deferred boundaries      | Pass        | Primitive/nested arrays, tuples, refs, batches, layouts and publication remain inactive. |
| Public API governance    | Conditional | ADR-009 inventory is required before implementation.                                     |
| Implementation readiness | Not yet     | ADR-015, ADR-005 revision 2, SPEC-003 and approved PLAN-010 are mandatory.               |

## 8. Review result

The review passes with no unresolved promotion-boundary finding. Ricard
explicitly accepted it on 14 July 2026, so D-006 is Promoted under section 3 for
normative design work only. No implementation or publication is authorized.
