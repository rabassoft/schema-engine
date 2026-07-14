# ADR-015 revision 4 complete review

- **Decision reviewed:**
  [`ADR-015 proposed revision 4`](../adrs/015-modelo-colecciones-identidad-operaciones.md)
- **Date:** 14 July 2026
- **Review state:** Cycle 1 passed with zero findings
- **Acceptance state:** Accepted by Ricard after this review
- **Implementation authorized:** No

## Scope

The review is limited to widening
`ObjectTextResolutionContext.node` from `ObjectFieldDefinition` to
`ObjectFieldDefinition | ArrayNodeDefinition` after SPEC-003 review finding
F-007. It does not reopen text members or semantics, collection-specific text
contexts, validation assignment, identity, operations, scopes, Angular
ownership or any implementation boundary.

## Cycle 1

### 1. Node text and issue representation — Pass

- `ObjectTextMember` already closes the exact ordinary array-node members:
  label, description, hint, tooltip and issue.
- The widened node union truthfully represents an `ArrayNodeDefinition` and
  one issue already assigned to its `ArrayRuntimeSnapshot`.
- Identity errors, item labels/actions and item-root issues remain disjoint in
  `CollectionTextResolutionContext`; descendant issues remain owned by their
  assigned item/object/field snapshot.

### 2. Existing text semantics — Pass

- No source changes: normalized node text remains opaque and an issue source is
  exactly `issue.fallbackMessage ?? issue.code`.
- Existing object-node fallback and blank rules apply unchanged: label remains
  non-blank, while optional node text and issue results may be blank.
- No new member, diagnostic code, reason, parameter, ordering or reprojection
  trigger is introduced.

### 3. Public Experimental inventory — Pass

- The delta names `ObjectTextResolutionContext.node` and the transitive
  `TextResolutionContext`/`TextResolver.resolve()` change.
- No new Public symbol is introduced. Existing root entry points and
  Experimental + Active classification remain unchanged.
- The union is declaration-ready and adds no package, export, dependency,
  version, Stable or publication obligation.

### 4. Angular ownership and framework boundary — Pass

- Collection-node text projection stays inside the fixed Internal host/helper;
  no Angular host or projector becomes Public.
- The adapter passes an immutable normalized `ArrayNodeDefinition` and assigned
  issue to the neutral resolver and does not interpret schema/UI Schema.
- Collection-specific identity/item/action text behavior and failure isolation
  remain unchanged.

### 5. Accepted behavior and deferred boundaries — Pass

- Revisions 1–3 remain authoritative outside the exact node-type widening.
- Issue assignment, snapshots, identity, addresses, operations, scopes,
  interaction, accessibility and lifecycle ownership are unchanged.
- Primitive/nested arrays, tuples, refs/composition, factories/defaults,
  batches/optimism, layout, custom collection renderers, persistence, Stable
  and publication remain inactive.

### 6. Gate sequencing — Pass

- Revision 4 remains Proposed after this review.
- Formal acceptance would only unblock correction of F-007 and another
  complete review of SPEC-003.
- SPEC-003 acceptance, PLAN-010 approval, implementation and publication remain
  separate later gates.

## Cycle 1 conclusion

Cycle 1 passed all six areas with zero findings and no documentation conflict.
No correction or repeated cycle is required. Proposed ADR-015 revision 4 is
ready for explicit formal acceptance or rejection; it is not accepted by this
review alone.

## Formal decision

Ricard explicitly accepted ADR-015 revision 4 on 14 July 2026. Acceptance
unblocks correction of F-007 and another complete review of SPEC-003 only; it
does not accept SPEC-003, authorize PLAN-010 or permit implementation or
publication.
