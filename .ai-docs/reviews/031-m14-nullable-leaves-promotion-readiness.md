# M14 nullable primitive leaves promotion-readiness review

- **State:** Accepted; D-009 promoted for M14 normative design
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Reviewed:** D-009 restart condition; accepted SPEC-001 through SPEC-005;
  ADR-005/009/012/014/015/016; current compiler, definitions, operations,
  runtime presence/dirty and Angular native renderers
- **Candidate milestone:** M14 — Nullable primitive leaves
- **Next document:** ADR-019 coordinated with ADR-005 revision 4; no SPEC, plan
  or implementation is authorized by this acceptance

## 1. Result

The review concluded that D-009 was ready for a narrow promotion to normative
design, not for direct implementation and not as unrestricted JSON Schema
union support. That narrow promotion is now accepted.

The existing runtime already distinguishes a missing property from every
present value, stores present values as `unknown`, compares expectations and
dirty state with `Object.is`, and supports strict `set-value` plus structural
`remove-value`. Therefore explicit `null` can remain a present domain value
without a new operation, presence variant, ownership mode or optimistic state.

The current compiler and `applyFormOperation()` deliberately accept only one
primitive type, and native Angular controls project incompatible/null values as
an empty or unchecked control while still exposing clear for present data. That
is safe for today's invalid external data but is not a usable nullable contract.
Architecture, behavior and accessibility must be decided before any code
change.

## 2. Readiness evidence

1. `FieldPresence` and `OperationExpectation` already represent `null` as
   `{ kind: 'value', value: null }`; missing remains a separate variant.
2. `set-value` carries `unknown`, so an accepted nullable field needs only
   managed compatibility changes. `remove-value` already expresses transition
   to missing and ADR-012 explicitly distinguishes clear from assigning null.
3. Runtime snapshots, subscriptions, strict expectations, controlled
   confirmation/rejection and structural sharing do not require new shapes.
4. Dirty comparison uses `Object.is`, which already distinguishes null from
   missing, false, zero and empty string.
5. Required is schema validation, not ownership or presentation: a required
   nullable property may be present with null, while missing remains a separate
   validator concern.
6. Nested objects, collection item templates and local `$ref` resolution now
   provide stable normalized primitive-leaf positions. A nullable rule can
   apply uniformly without making containers nullable.
7. The external `SchemaValidator` continues receiving the original schema and
   authoritative value; core must not invent business validation or coerce
   null.
8. The four native renderer paths, text projection, focus/clear behavior and
   Signal Forms buffers provide an evidence surface for a controlled,
   accessible Angular reference projection.

## 3. Recommended promotion boundary

Promote D-009 only for primitive leaves at every already supported leaf
position: root properties, nested object properties, collection item-template
properties and statically resolved local-reference leaves.

The schema slice is exactly a dense, unique `type` array containing:

- one existing primitive type: `string`, `number`, `integer` or `boolean`; and
- `null`;

in either order. The compiler normalizes the result to the existing primitive
field kind plus one explicit nullable capability. This is not general union
evaluation.

Observable semantics must preserve:

- missing, null and the primitive value as distinct controlled states;
- false as distinct from both null and missing for boolean fields;
- `set-value null` as an explicit user intention accepted only for a normalized
  nullable leaf;
- `remove-value` as the only transition to missing;
- no automatic null/default/coercion during compilation, rendering,
  reconciliation or validation;
- invalid external null on a non-nullable field as present controlled data that
  is never silently corrected; and
- immutable operations, expectations, snapshots and diagnostics.

Angular must provide a deliberate accessible way to request null and keep the
existing clear action for missing. A checkbox cannot silently conflate null,
missing and false. Exact controls, localized text and focus behavior belong in
ADR-019 and the later observable SPEC.

## 4. Questions ADR-019 must close

1. **Normalized contract:** required `nullable: boolean`, optional capability,
   or another exact Public/Internal representation; include manual-definition
   validation and migration for Public + Experimental consumers.
2. **Type-array inspection:** descriptor-safe rules, duplicates, accessors,
   unsupported members, diagnostic codes/paths/order and interaction with
   ADR-005's closed keyword/type catalog.
3. **Managed compatibility:** exact `applyFormOperation()` and runtime action
   rules for null, including deep paths and collection item-relative paths.
4. **Required and invalid data:** presence/dirty behavior and the division
   between structural compatibility and external validator authority.
5. **Angular intention:** one accessible, controlled null affordance for each
   supported native primitive kind, distinct from clear/missing and incapable
   of emitting during render or reconciliation.
6. **Text and IDs:** neutral source text, `TextResolver` member, fallback,
   diagnostics, deterministic IDs and accessible naming without assuming an
   English UI.
7. **Renderer resolution:** whether existing renderer registrations consume the
   capability or nullable variants need scored testers, without exposing raw
   schema.
8. **Reference and template propagation:** identical normalization for direct,
   nested, collection-template and statically resolved leaves without making
   object/array nodes nullable.

ADR-019 must coordinate an ADR-005 revision because accepting `type` arrays
changes dialect-subset compatibility. It must not silently edit SPEC-001 or an
accepted extension SPEC.

## 5. Explicit exclusions

- `type: "null"` as a standalone managed field.
- Arrays with more than one non-null type or general union dispatch.
- Nullable object nodes, collection arrays or collection items.
- `enum` containing null or combining the accepted string-enum subset with a
  nullable type array.
- `const`, composition, conditionals, discriminator logic or dynamic schemas.
- Defaults, null coercion, empty-to-null conversion or automatic initialization.
- Reset, persistence, submit, async validation or optimistic projection.
- New package/entry point, Stable API promotion, publication or D-043 work.
- Custom-renderer obligations beyond any reviewed Public snapshot/capability
  change.

## 6. Required document sequence

1. **Completed:** accept this readiness review and promote only the stated
   D-009 slice for M14 normative design.
2. Draft and completely review ADR-019 together with the required ADR-005
   revision. Acceptance authorizes preparation of an observable extension SPEC
   only.
3. Draft SPEC-006 for exact compiler, operations, runtime, Angular,
   accessibility, diagnostics and conformance behavior; accept it only after a
   complete zero-finding review.
4. Prepare and approve PLAN-014 before implementation.

No step authorizes the following one by inference.

## 7. Complete reviews

### Cycle 1

The complete readiness review found no architectural or scope defect in the
recommendation. Closing documentation verification found two state defects:

1. `STATUS.md` still described the completed review as the current objective.
2. Its verification summary retained the pre-review Markdown/link counts.

Both require correction and a complete repeated review; cycle 1 cannot support
formal acceptance.

### Cycle 2

The repeated review found that the corrected 87/386 counts had been attached
to the earlier full delivery matrix, which actually ran at 86/385. That made
the verification chronology imprecise. The current documentation checks are
recorded separately and another complete review is required.

### Cycle 3

The review covered eight areas from the beginning:

1. **Authority and restart condition:** passes. Ricard selected D-009 for the
   next readiness review; existing primitive contracts are implemented and
   published. D-009 itself was kept Deferred until formal acceptance.
2. **JSON Schema boundary:** passes. The recommendation is the smallest Draft
   2020-12 nullable type-array subset and explicitly rejects general unions.
3. **Controlled semantics:** passes. Missing/null/primitive states preserve
   application ownership, strict operations and no optimistic projection.
4. **Normalized/Public contracts:** passes as a design gate. The review does not
   choose a representation; ADR-019 must close it under ADR-009.
5. **Nested/collection/reference consistency:** passes. Only existing primitive
   leaf positions participate; containers and items remain non-nullable.
6. **Angular/accessibility:** passes as a design gate. The current checkbox and
   empty buffers are insufficient, and ADR/SPEC must define a distinct null
   intention without weakening clear/missing semantics.
7. **Validation and exclusions:** passes. Original schema/value remain under the
   external validator; enum-null, defaults, composition and unrelated deferred
   capabilities stay excluded.
8. **Delivery sequence:** passes. ADR-019 plus ADR-005 revision precede SPEC-006
   and PLAN-014; no code, publication or Stable promotion is authorized.

Closing documentation verification also passes with the corrected current
objective and observed 87 Markdown files/386 local links, while preserving the
historically accurate 86/385 count for the earlier full delivery matrix.

**Result:** zero findings and no unresolved change request. Ricard formally
accepted the recommendation on 15 July 2026.

## 8. Accepted effect

Acceptance:

1. marks only the section 3 D-009 slice as Promoted for M14 normative design;
2. authorizes drafting/reviewing ADR-019 and coordinated ADR-005 revision 4;
3. leaves D-007, D-011/D-012, D-036/D-039, D-043 and all other deferred work
   unchanged; and
4. authorizes no SPEC, plan, implementation, package version, publication or
   Stable API change.
