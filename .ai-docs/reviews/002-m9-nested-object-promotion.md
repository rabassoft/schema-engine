# M9 — Nested-object promotion review

- **State:** Accepted
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Candidate:** D-005 — Nested objects
- **Milestone:** M9 — Nested objects
- **Behavior or public-contract changes authorized:** None
- **Normative baseline:**
  [`SPEC-001 v0.1.15`](../specs/001-controlled-form-runtime.md)
- **Required decision review:**
  [`ADR-005`](../adrs/005-politica-dialecto-json-schema.md)

## 1. Purpose

Determine whether D-005 has enough evidence to leave Candidate state, define
the smallest coherent M9 boundary, and identify the decisions that must be
accepted before an implementation plan can be drafted.

This review does not promote D-005, amend ADR-005, create a new public contract,
approve M9 implementation, or authorize package publication.

## 2. Conclusion

D-005 is **eligible for explicit promotion**. Its resumption condition is met:
the root-field walking skeleton is accepted, completed through M7, packaged and
verified through M8, and covered by 179 tests plus built-package consumers.

Promotion must nevertheless remain approval-gated because nested objects cut
across every current root-only contract. Implementing deep paths directly
would conflict with SPEC-001 sections 3 and 11.5 and would trigger ADR-005's
mandatory review criterion without resolving it.

Ricard accepted this review boundary on 14 July 2026 and D-005 is promoted for
design work. The project may draft the required architectural and behavioral
documents; implementation remains inactive until those documents and PLAN-009
are reviewed and approved.

## 3. Smallest coherent M9 boundary

### In scope

- Inline Draft 2020-12 object schemas declared with `type: "object"`, own
  `properties`, optional `required`, `title`, and `description`.
- Recursive object containers containing only the already supported primitive
  leaf schemas: string, number, integer, boolean, and the accepted string-enum
  subset.
- Deep `DataPath` values composed only of string segments.
- A normalized, immutable structural tree plus an unambiguous ordered leaf
  projection for runtime and renderer consumption.
- Controlled leaf-level `set-value` and `remove-value`, immutable branch
  reconstruction, stale-operation protection, and structural sharing.
- Presence, dirty, validation issues, interaction, scopes, diagnostics, IDs,
  text projection, and snapshots for deep paths and object branches.
- Recursive Angular rendering with a fixed semantic object-container host and
  the existing ADR-007 leaf renderer resolution.
- Conformance fixtures for multiple depths, missing/incompatible ancestors,
  collisions, accessors, malformed schemas, validation branches, and lifecycle.

### Still out of scope

- Arrays, numeric path segments, item identity, insertion, deletion, or moves.
- `$ref`, `$defs`, resources, anchors, remote resolution, composition,
  conditionals, or multiple dialects.
- `additionalProperties` editing, pattern properties, maps, arbitrary keys, or
  object-valued custom controls.
- Advanced UI layouts, sections, tabs, grids, accordions, wizards, or
  declarative scopes.
- Batched operations, cascading delete/prune, undo/redo, dynamic definitions,
  plugins, async validation, persistence, submission, or publication.
- Stable API promotion, new package entry points, or a versioning commitment
  for a generic intermediate representation.

## 4. Current assumptions that M9 must replace

The executable contracts are consistently root-only:

- the compiler builds one flat `FormDefinition.fields` array and assigns
  `path: [name]` plus `key: name`;
- operations resolve only one string segment and reject deep or numeric paths;
- runtime lookup, dirty, issues, scopes, snapshots, presence, and definition
  validation rely on `path.length === 1`;
- Angular iterates leaf fields directly and creates one renderer per outlet;
- UI Schema addresses fields by a single root name;
- SPEC-001 reserves nested objects and explicitly defers intermediate
  containers and deep paths.

These constraints are coherent for M1-M8. They are not defects and must not be
removed piecemeal.

## 5. Required architectural decisions

### M9-D1 — Normalized structural model

Decide the public relationship between object containers and primitive leaves.
The recommended shape is an immutable node tree as structural authority plus a
deterministic ordered leaf projection, avoiding repeated traversal in runtime
hot paths while keeping hierarchy available to adapters.

This resolves only the part of D-014's Research question triggered by nested
objects. It does not promote D-014 or authorize a generic AST, resolved-schema
graph, render plan, or public model-versioning scheme.

### M9-D2 — Canonical identity and ordering

Define collision-free keys and DOM IDs from full paths. Delimiter joining is
insufficient because a root property such as `"a.b"` must not collide with the
path `["a", "b"]`. Define traversal and sibling ordering independently at each
container and specify whether leaf projection is pre-order.

### M9-D3 — Deep operation semantics

Specify descriptor-safe traversal, own-property rules, immutable ancestor
reconstruction, incompatible ancestors, prototype-sensitive names, stale
expectations, and whether setting a leaf may materialize missing object
ancestors.

The recommended minimal rule is one leaf operation per user intent, creation of
missing plain object ancestors only under an explicit accepted contract, and no
implicit pruning of empty ancestors after `remove-value`. D-021 batches remain
Deferred.

### M9-D4 — Presence, dirty, interaction, and snapshots

Distinguish a missing branch, an object branch, an incompatible branch, a
missing leaf, and a present leaf. Decide whether object containers receive
public snapshots or a separate structural projection and how container dirty,
validity, issue visibility, touched, and focus derive from descendants.

### M9-D5 — Recursive schema inspection

Revise ADR-005 before implementation. The compiler must define which nested
schema objects it visits, keyword classification at every supported object,
diagnostic ordering and paths, cyclic/non-JSON object inputs, and branch-stop
rules. Draft 2020-12, the single canonical URI, opaque unknown keywords, and
the exclusions for references/composition can remain unchanged.

### M9-D6 — Structural UI Schema

Choose a minimal recursive presentation shape for labels, descriptions, hints,
tooltips, placeholders, enum labels, and sibling order. This shape may mirror
the data tree but must not become a general layout language. D-011 and D-012
remain Deferred.

### M9-D7 — Validation issues and scopes

Define mapping of leaf and object-level issues to the nearest managed node,
global issue preservation, subtree inclusion semantics for scopes, warning
behavior for unknown deep paths, and deterministic visibility aggregation.

### M9-D8 — Angular recursion and renderer ownership

Keep ADR-007 testers focused on primitive leaf `FieldDefinition` values. Use a
fixed Angular object-container host for structural recursion unless a separate
approved decision establishes custom container renderers. Specify semantic
grouping, accessible labels, IDs, focus routing, isolation, and destruction for
recursive hosts. Advanced layout and capabilities remain Deferred.

### M9-D9 — Experimental API migration

Inventory every changed root export and transitive public type under ADR-009.
Document migration from flat `FormDefinition.fields`, preserve root package
entry points, reject deep imports, and keep all additions classified as
`Public + Experimental + Active` unless separately promoted.

## 6. Required document sequence

1. Accept this promotion review and explicitly promote D-005/M9. **Completed
   14 July 2026.**
2. Draft ADR-014 for the normalized node model, identity, deep operation,
   snapshot, scope, and Angular recursion decisions.
3. Draft ADR-005 revision 1 for recursive inline-object inspection and
   deterministic compatibility diagnostics.
4. Draft SPEC-002 for the complete observable nested-object behavior and its
   relationship to accepted SPEC-001.
5. Repeat formal reviews after every correction until ADR-014, ADR-005 revision
   1, and SPEC-002 each pass with zero findings; then obtain explicit
   acceptance.
6. Draft and review PLAN-009 with migration, fixtures, implementation slices,
   public declaration checks, package consumers, and the complete verification
   matrix.
7. Start implementation only after PLAN-009 is explicitly approved.

ADR-014 and ADR-005 revision 1 may be reviewed together, but their
responsibilities must remain distinct: runtime/normalized architecture versus
JSON Schema dialect and traversal policy.

## 7. Promotion review matrix

| Area                     | Result      | Evidence or condition                                                                             |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------- |
| Resumption condition     | Pass        | Root walking skeleton accepted and M1-M8 completed.                                               |
| Smallest deliverable     | Pass        | Inline objects plus current primitive leaves only.                                                |
| SPEC consistency         | Conditional | New behavior requires SPEC-002; SPEC-001 remains authoritative until acceptance.                  |
| ADR-005 criterion        | Conditional | Mandatory revision identified before implementation.                                              |
| Deferred boundaries      | Pass        | Arrays, refs/composition, layouts, batches, dynamic definitions, and publication remain inactive. |
| Framework neutrality     | Pass        | Tree, paths, operations, snapshots, and validation stay in core; Angular only projects them.      |
| Public API governance    | Conditional | ADR-009 migration inventory is required before implementation.                                    |
| Implementation readiness | Not yet     | ADR-014, ADR-005 revision 1, SPEC-002, and approved PLAN-009 are required.                        |

## 8. Blockers and conflicts

- There is no blocker to promoting D-005 for design work.
- There is a normative blocker to implementation: accepted SPEC-001 excludes
  nested objects and deep operations.
- There is a decision blocker to implementation: ADR-005 requires review when
  nested objects are promoted.
- No current document conflicts if M9 remains inactive until the required
  sequence is accepted.

## 9. Review result

The promotion review is accepted and D-005 is Promoted under the boundary in
section 3. This authorizes design documents only. No code, public contract,
accepted ADR, SPEC state or package metadata has changed, and M9 implementation
remains inactive.
