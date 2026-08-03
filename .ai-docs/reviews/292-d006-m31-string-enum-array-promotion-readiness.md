# D-006/M31 controlled string-enum array promotion review — Cycles 1–3

## Review state

- **Date:** 2026-08-03
- **State:** Complete
- **Decision:** Promote one bounded architecture question only
- **Selected by:** Ricard
- **Next gate:** Draft and review ADR-034

## Question reviewed

Whether D-006 may reopen after completed M10 for one ordinary homogeneous
array field whose values are selected from a closed string enum, without
turning that field into a stable-identity collection or activating wider array
support.

## Cycle 1 findings and corrections

1. **Ordering was ambiguous.** A multiselection UI could be mistaken for a set
   and silently reorder the JSON value. The promoted boundary now retains JSON
   Schema array semantics: the neutral value is ordered, retained selections
   keep their relative order, and no adapter may sort or canonicalize it
   silently. ADR-034 must decide deterministic insertion placement.
2. **Empty and missing were ambiguous.** The promoted boundary now preserves
   missing, present empty `[]`, present compatible ordered arrays and
   incompatible values as distinct states. ADR-034 must decide the exact
   remove/empty operation semantics.

After these corrections, the complete review was repeated rather than checking
only the changed passages.

## Promoted boundary

The architecture question is limited to all of the following:

- an ordinary, non-template property at an already supported field location;
- outer `type: "array"`, an own `items` schema and exact
  `uniqueItems: true`;
- `items.type: "string"` plus a dense, non-empty, duplicate-free string
  `enum`;
- existing title, description and enum-label concepts, subject to the
  descriptor-safe grammar fixed by ADR-034;
- one immutable normalized field-like definition, explicitly distinct from
  `ArrayNodeDefinition`, item templates and stable collection policy;
- missing, present empty, compatible ordered string array and incompatible
  value states kept distinct;
- application-controlled atomic replacement of the whole array, or an
  explicit removal intention; no per-item runtime operation;
- replaceable validation with the original schema and value, with Ajv owning
  `enum` and `uniqueItems` assertions;
- accessible native multiselection projected independently by Angular and
  Standard reference adapters; and
- application ownership of `value`, `baselineValue`, acceptance and
  persistence.

This is an atomic field even though its value is an array. It does not acquire
stable item identity, insertion/removal/move requests, item scopes, collection
templates or collection snapshots from SPEC-003.

## Required ADR-034 decisions

ADR-034 must close, at minimum:

1. the exact schema and UI Schema grammar and diagnostic precedence;
2. the normalized definition kind and immutable Public shape;
3. compatible, missing, empty, duplicate and incompatible value semantics;
4. deterministic toggle/replacement behavior and insertion placement while
   preserving order and forbidding silent canonicalization;
5. the exact operation/request shape for replacement and explicit removal;
6. dirty comparison for ordered arrays and external reconciliation;
7. touched, focus and no-op behavior;
8. issue ownership and routing for the array path and numeric item paths;
9. condition-source/target compatibility with the completed M30 boundary;
10. descriptor-safe manual-definition equivalence;
11. localization and accessibility requirements for empty state and choices;
12. migration, package and conformance consequences without authorizing a
    release.

## Explicit exclusions

- free-form, numeric, boolean, mixed or nullable item arrays;
- tuples, nested arrays, arrays inside collection templates and nested item
  editing;
- `minItems`, `maxItems`, `contains`, prefix items or other array keywords;
- stable identity and incremental add/remove/move/replace-item operations;
- automatic initialization, repair, deduplication, sorting or defaulting;
- array-valued condition sources or general array predicates;
- callbacks, HTTP, persistence, submit or transport ownership in core;
- React, Vue, Svelte, legacy Angular, UI-library variants and broader layout;
- dependency, manifest, lockfile, version, publication, release or Git work.

## Cycle 2 finding and correction

1. **The JSON Schema policy follow-up was omitted.** Accepted ADR-005 and
   SPEC-003 still classify `uniqueItems` and primitive item schemas outside
   their active array catalogs. The gate now requires ADR-005 revision 8 after
   ADR-034 and before SPEC-017 so diagnostics, keyword ordering, branch stopping
   and supported locations are reconciled explicitly.

After this correction, the complete review was repeated again.

## Cycle 3 complete review

| Area                                   | Result |
| -------------------------------------- | ------ |
| User value and adoption relevance      | Pass   |
| D-006/M10 separation                   | Pass   |
| Accepted SPEC/ADR compatibility        | Pass   |
| Application ownership                  | Pass   |
| Schema and normalized-model boundary   | Pass   |
| Presence and ordered-value semantics   | Pass   |
| Operations and runtime boundary        | Pass   |
| Validation and issue routing questions | Pass   |
| Angular/Standard replaceability        | Pass   |
| Accessibility and localization         | Pass   |
| M30 conditional-state compatibility    | Pass   |
| Package and migration gate             | Pass   |
| Deferred exclusions                    | Pass   |
| Documentation consistency              | Pass   |

**Cycle 3 result:** zero findings and no unresolved change request.

## Gate result

D-006 is promoted only for the bounded M31 architecture question above.
ADR-034 is reserved for **Controlled homogeneous string-enum array field**.
If accepted, its immediate follow-up is ADR-005 revision 8; SPEC-017 remains
blocked until both decisions are accepted. No SPEC, plan, public contract or
implementation is active, and no wider array capability is promoted.
