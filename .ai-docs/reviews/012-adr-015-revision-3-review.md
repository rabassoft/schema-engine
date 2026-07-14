# ADR-015 revision 3 complete review

- **Decision reviewed:**
  [`ADR-015 proposed revision 3`](../adrs/015-modelo-colecciones-identidad-operaciones.md)
- **Date:** 14 July 2026
- **Review state:** Cycle 1 passed with zero findings
- **Acceptance state:** Accepted by Ricard after this review
- **Implementation authorized:** No

## Scope

The review is limited to the item-root issue text branch proposed after
SPEC-003 review finding F-002. It does not reopen accepted collection identity,
schema/UI policy, templates, snapshots, validation assignment, operations,
scopes, Angular ownership or any implementation boundary.

## Cycle 1

### 1. Item-root issue representation — Pass

- The new branch requires `member: 'issue'`, one current
  `ItemRuntimeSnapshot` and one `ValidationIssue` already assigned to that item.
- It cannot represent a descendant field/object issue without that issue first
  being assigned to the item root by the accepted validation mapping.
- `identity-error` and action/label branches remain disjoint through `never`
  members and the closed `Exclude` union.

### 2. Source, fallback and blank semantics — Pass

- `issue.fallbackMessage ?? issue.code` exactly matches existing field and
  object issue sources.
- Exception/non-string fallback preserves that exact source. Blank string is
  accepted only as existing issue-text behavior requires; non-blank identity,
  label and action behavior is unchanged.
- The context carries the canonical issue for resolution while failure
  diagnostics are forbidden from retaining its parameters or hostile values.

### 3. Public Experimental inventory — Pass

- The delta names `CollectionTextMember`,
  `CollectionTextResolutionContext`, `TextResolutionContext` and
  `TextResolver.resolve()` as changed Public contracts.
- No new Public symbol is introduced. Existing root entry points and
  Experimental + Active classification remain unchanged.
- The change is declaration-ready and does not add package, export, dependency,
  version, Stable or publication obligations.

### 4. Angular ownership and isolation — Pass

- Item issue projection remains inside the fixed Internal host/text helper;
  no Angular host or projector becomes Public.
- Projection consumes normalized immutable contracts and does not interpret
  schema/UI Schema.
- Resolver fallback continues remaining issues/descendants and does not alter
  view identity, focus, interaction, validity, Signal Forms or host failure
  isolation.

### 5. Accepted behavior and deferred boundaries — Pass

- Validation issue assignment, item snapshots, identity, addresses, five
  operations, scopes, insertion and focus recovery are unchanged.
- Accepted revisions 1–2 remain authoritative outside the explicit text-union
  replacement.
- Primitive/nested arrays, tuples, refs/composition, factories/defaults,
  batches/optimism, layout, custom collection hosts, persistence, Stable and
  publication remain inactive.

### 6. Gate sequencing — Pass

- Revision 3 remains Proposed after this review.
- Formal acceptance would only unblock correction and repeated complete review
  of SPEC-003.
- SPEC-003 acceptance, PLAN-010 approval, implementation and publication remain
  separate later gates.

## Cycle 1 conclusion

Cycle 1 passed all six areas with zero findings and no documentation conflict.
No correction or repeated cycle is required. Proposed ADR-015 revision 3 is
ready for explicit formal acceptance or rejection; it is not accepted by this
review alone.

## Formal decision

Ricard explicitly accepted ADR-015 revision 3 on 14 July 2026. Acceptance
unblocks the six SPEC-003 corrections and its repeated complete review only; it
does not accept SPEC-003, authorize PLAN-010 or permit implementation or
publication.
