# SPEC-014: Static Object `allOf` Composition

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 3 August 2026
- **Acceptance date:** 3 August 2026
- **Milestone:** M28 — Static object `allOf` composition
- **Promoted capability:** bounded D-007 selected by
  [review 258](../reviews/258-post-m27-functional-capability-selection.md)
- **Accepted architecture:** ADR-031 revision 0 and ADR-005 revision 7,
  coordinated with ADR-009, ADR-014 revision 2, ADR-015 revision 4, ADR-016 and
  ADR-022 revision 3
- **Accepted baselines:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2 and SPEC-004 v0.1.1
- **Authority:** Accepted observable M28 extension; preparation and complete
  review of PLAN-030 are authorized, while implementation, dependency, version,
  release, publication, commit, push and external actions remain unauthorized
- **Complete review:** [review 261](../reviews/261-spec-014-review.md) cycle 5
  passes all fourteen areas with zero findings; accepted under the authorized
  zero-finding/no-scope-expansion rule

## 1. Scope

This specification extends `compileFormDefinition()` with one closed Draft
2020-12 `allOf` subset. A root, object property or collection item root may
derive one existing normalized object definition from ordered static branches
when every contributed property name is unique.

The compiler does not implement general JSON Schema evaluation. It preserves
the exact original schema for the replaceable validator and derives only the
structure needed by the existing neutral definition model. No normalized,
runtime, operation, renderer, adapter or validator signature changes.

## 2. Supported wrapper locations and members

An own `allOf` descriptor selects composition classification. At a property
whose safe `type` is an accepted primitive/array, `allOf` is incompatible. An
absent or exact object type can select a composed object. Root and item-root
contexts already expect object and may omit wrapper `type`.

Supported locations are exactly:

1. document root;
2. root or nested object property;
3. homogeneous collection `items` object root; and
4. a same-document reference target reached from one of those locations.

The exact wrapper catalogs are:

| Location         | Supported semantic members                                       |
| ---------------- | ---------------------------------------------------------------- |
| document root    | `$schema`, `$defs`, `type`, `title`, `description`, `allOf`      |
| object property  | `type`, `title`, `description`, metadata-only `default`, `allOf` |
| object item root | `type`, `allOf`                                                  |

Known ignored annotations and unknown opaque keywords retain their accepted
warning behavior. Optional `type`, when present, must be an own data property
with exact value `"object"`. An accessor or other value emits
`INVALID_SCHEMA_KEYWORD_VALUE` at the exact type path with
`{ keyword: 'type', expected: '"object"', actualType }` and fallback
`Schema keyword "type" has an invalid value.`. An attempted property wrapper
with malformed type remains blocked but its independently inspectable `allOf`
exterior/branches continue; a safely classified primitive/array instead emits
only the incompatible-`allOf` diagnostic and does not inspect branches.

Wrapper classification replaces the ordinary requirement for direct
`type`/`properties`: their absence emits none of the ordinary missing-type or
missing-properties codes.

Direct `properties`, `required`, `$ref` or another semantic applicator on the
wrapper is incompatible and is never treated as an implicit contribution.
Each uses `INCOMPATIBLE_SCHEMA_KEYWORD`, `{ keyword, fieldType: 'composition' }`
and fallback `Schema keyword "<keyword>" is incompatible with field type
"composition".` without inspecting the sibling value or adding an ordinary
shape diagnostic.
Root `$schema`/`$defs` retain their existing global gates and are not processed
again as wrapper members.

## 3. Closed `allOf` exterior

`allOf` must be an own enumerable data property whose value satisfies
`Array.isArray(value) === true`. Its own `length` descriptor must be a data
property with a positive safe integer. Every index from zero through
`length - 1` must be an own enumerable data property containing an ordinary
non-array schema object. No other enumerable string key is allowed.

Exterior inspection is descriptor-safe and emits at most one exterior error in
this order:

1. `allOf` descriptor/enumerability/value;
2. `length` descriptor/value;
3. first malformed index in ascending order; and
4. first extra enumerable key in `Object.keys()` order.

An exterior error stops all dependent branches. It does not stop independent
schema/UI branches elsewhere. No accessor, iterator, coercion or callback is
executed.

All exterior errors use `INVALID_SCHEMA_KEYWORD_VALUE`, `error`/`schema` and
fallback `Schema keyword "allOf" has an invalid value.`. Their exact paths and
parameters are:

| Failure                     | `documentPath`          | Parameters                                                                                                                  |
| --------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| descriptor/value            | `[..., 'allOf']`        | `{ keyword: 'allOf', expected: 'non-empty dense array of object schemas', actualType }`                                     |
| length                      | `[..., 'allOf']`        | `{ keyword: 'allOf', expected: 'positive safe integer length', reason: 'invalid-allof-length', actualType, actualLength? }` |
| index                       | `[..., 'allOf', index]` | `{ keyword: 'allOf', expected: 'ordinary schema object', actualType }`                                                      |
| extra enumerable string key | `[..., 'allOf', key]`   | `{ keyword: 'allOf', expected: 'dense array indices only', reason: 'unexpected-allof-member' }`                             |

Descriptor failures use safe `accessor`, `non-enumerable` or `missing`
`actualType` as applicable. `actualLength` appears only for a safe non-positive
integer; a non-finite, non-integer or unsafe number is described without
retaining that numeric value.

## 4. Branch forms and effective-object reduction

Each branch, in ascending index order, must be exactly one of:

1. a pure supported local `$ref` object;
2. another supported composed-object wrapper; or
3. an ordinary object contribution with own data `type: "object"` and own
   ordinary-object `properties`.

An ordinary contribution uses the current use-site catalog:

- root contribution: `type`, `properties`, `required`, `title`, `description`;
- object-property contribution: the same plus metadata-only `default`; and
- item-root contribution: `type`, `properties`, `required`.

Branch-local `$schema`/`$defs` never create a dialect or registry. The compiler
flattens valid contributions iteratively in depth-first `allOf` order and each
`properties` object in `Object.keys()` order. There is no Public depth limit,
schema bundle or exposed composition AST.

A structurally unsupported branch emits one composition error and stops only
that branch. If a pure reference resolves to a non-object contribution/wrapper,
the error is anchored at the target's canonical document path and retains the
outer branch index and reference chain.

## 5. Properties, requiredness and object text

The first occurrence of a property name fixes its presentation position and
schema source. Any later exact name is a blocking conflict, including repeated
JavaScript object identity or apparently identical schema content. The later
duplicate subtree stops; independent properties and later branches continue
for diagnostics.

Each contribution's `required` retains the accepted dense unique-string form.
Effective requiredness is the union across all valid contributions. A branch
may require a property declared by another branch. Only after the complete
effective catalog is known does the compiler emit an existing
`UNMANAGED_REQUIRED_PROPERTY` for each required entry absent from that catalog.

For object `title` and `description`, UI Schema retains first precedence. Schema
sources are inspected as wrapper then flattened contributions:

- total absence uses the accepted fallback;
- one valid value is selected;
- repeated exact-equal values are selected once; and
- distinct valid values emit a blocking conflict at the later source.

Invalid text retains `INVALID_SCHEMA_KEYWORD_VALUE`. `default` remains opaque
metadata and is never combined, cloned or applied.

At document root, this same reduction detects invalid/distinct sources and
preserves deterministic diagnostics, but the selected text is not added to
`FormDefinition`: the accepted implicit root remains non-node metadata. At an
object-property wrapper, the selected schema text participates in the existing
UI-first object label/description resolution. Item root admits no text.

## 6. Diagnostic contract

### 6.1 Reused diagnostics

All diagnostics use the accepted immutable envelope. Revision 7 reuses:

- `INVALID_SCHEMA_KEYWORD_VALUE` for malformed wrapper `type` and `allOf`
  exterior/index members;
- `INCOMPATIBLE_SCHEMA_KEYWORD` for wrapper semantic siblings and `allOf` on a
  safely classified primitive/array location;
- the accepted ignored/unknown/unsupported keyword diagnostics;
- the complete reference diagnostic families from SPEC-004;
- `CYCLIC_SCHEMA_OBJECT` and `CYCLIC_SCHEMA_REFERENCE`; and
- delayed `UNMANAGED_REQUIRED_PROPERTY`.

Wrapper siblings use `{ keyword, fieldType: 'composition' }`. An incompatible
primitive/array `allOf` uses its accepted `fieldType`. Branch-local root
`$schema`/`$defs` use `{ keyword, fieldType: 'object' }`.

Malformed `allOf` uses fallback
`Schema keyword "allOf" has an invalid value.` and exactly the parameter forms
from ADR-005 revision 7:

- exterior: `keyword`, expected non-empty dense object-schema array and safe
  `actualType`;
- length: `keyword`, expected positive safe integer length,
  `reason: 'invalid-allof-length'`, safe `actualType` and only a safe
  non-positive `actualLength` when applicable;
- index: `keyword`, expected ordinary schema object and safe `actualType`; or
- extra key: `keyword`, expected dense array indices only and
  `reason: 'unexpected-allof-member'`.

### 6.2 Composition conflicts

M28 adds one code:

```ts
type SchemaCompositionConflictReason =
  'unsupported-branch-kind' | 'duplicate-property' | 'conflicting-annotation';
```

`INCOMPATIBLE_SCHEMA_COMPOSITION` is `error`/`schema` with fallback
`Schema composition is incompatible.`.

- Unsupported branch parameters are `{ reason, branchIndex, expected: 'object
contribution, local reference or nested object composition' }`.
- Duplicate-property parameters are `{ reason, property, firstDocumentPath,
firstReferenceChain? }`.
- Conflicting-text parameters are `{ reason, keyword, firstDocumentPath,
firstReferenceChain? }`.

The diagnostic anchors the later exact property/keyword source. For inline
unsupported branches it anchors the `allOf` index; a resolved incompatible
target anchors its canonical target path. `firstDocumentPath` is the first
`properties` key or text keyword path. `firstReferenceChain` appears only when
that first source was reference-mediated. The current diagnostic independently
receives its accepted `referenceChain` when applicable.

`firstDocumentPath` is a copied frozen `DocumentPath`.
`firstReferenceChain`, when present, is a copied frozen outermost-to-innermost
`readonly DocumentPath[]`; every nested path is also copied/frozen. A root
composition diagnostic omits `dataPath`. A managed property diagnostic uses the
use-site path. An item-template diagnostic uses the absolute array `dataPath`
and adds its frozen relative `parameters.templatePath`, including `[]` for item
root.

No diagnostic retains a schema object, cursor, annotation value, accessor
value, thrown value or mutable caller path.

## 7. Paths, references and cycles

Inline diagnostic `documentPath` includes every `allOf` segment/index. A
diagnostic from a referenced target retains its target source path, managed
use-site `dataPath` and immutable outermost-to-innermost `referenceChain`.
Collection-template diagnostics also retain the accepted relative
`parameters.templatePath`.

Pure `$ref` objects are newly supported only at `allOf` indices, including root
composition branches. A direct document-root `$ref` remains invalid. Fragment
syntax, `$defs` scope, pointer traversal, sibling rules and target failures are
otherwise exactly SPEC-004.

Active raw-object re-entry through `allOf`, `properties` or `items` emits
`CYCLIC_SCHEMA_OBJECT`. Active canonical target re-entry through `$ref` emits
`CYCLIC_SCHEMA_REFERENCE`. Acyclic sharing remains legal and is normalized
independently per managed use site.

## 8. Observable ordering and branch stopping

Existing input, dialect, collection-policy exterior and `$defs` gates retain
their order. At one composed wrapper the order is:

1. own `type`;
2. other own members except globally processed root `$schema`/`$defs`, in
   `Object.keys()` order;
3. `allOf` exterior;
4. branches depth-first in ascending index order;
5. property/text conflicts at the later source;
6. delayed unmanaged-required warnings; and
7. the single use-site UI traversal after independently collectible schema
   diagnostics.

Invalid wrapper type/siblings block the wrapper result but not an independently
inspectable `allOf` exterior/branch. An invalid exterior stops its branches. A
branch/property conflict stops only its dependent result. Independent
siblings, branches, policies and UI exterior continue. Any error returns
`success: false` without a partial `FormDefinition`.

## 9. UI Schema and collection policies

Composition adds no UI Schema member. Exactly one existing UI node belongs to
the managed use site and addresses the effective property catalog. UI order
reorders combined children; field metadata addresses each effective name once;
UI paths never include schema composition/reference provenance.

Array properties contributed by any branch retain their existing absolute
collection-policy requirement. For a composed item root, direct identity and
requiredness resolve against the effective catalog before applying SPEC-003.
When composition prevents a unique effective array/item catalog, only dependent
semantic path/identity policy diagnostics are suppressed. Policy exterior,
independent policy errors and `UNUSED_COLLECTION_POLICY` retain their accepted
behavior.

## 10. Validation, runtime and framework ownership

`SchemaValidator` receives the exact original schema object and complete value.
The compiler never supplies a flattened, cloned, bundled or dereferenced
schema. Ajv's broader conjunction evaluation does not widen compiler support.

Normalized definitions, runtime snapshots, operations, scope-baseline
confirmation, synchronous/asynchronous validation, Angular and Standard
contracts remain exact. No adapter receives branches or an Internal
composition cursor.

The shared private scenario catalog adds one M28 example using at least one
local-reference branch plus one inline contribution, effective cross-branch
requiredness and UI ordering over combined properties. Angular and Standard
must project that same authored scenario independently, demonstrate identical
managed field order/state/validation and require no target-specific schema
transformation. This is conformance evidence, not a new Public contract.

The application remains the sole source of truth for `value` and
`baselineValue`; composition neither initializes nor mutates either root.

## 11. Public/Internal migration inventory

| Classification                      | Exact effect                                                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Changed Public behavior             | `compileFormDefinition()` accepts the bounded object-`allOf` subset.                                                    |
| Changed Public diagnostic semantics | Adds `INCOMPATIBLE_SCHEMA_COMPOSITION` and first-source document/reference provenance inside existing parameters.       |
| New Public symbols                  | None.                                                                                                                   |
| Changed Public signatures           | None.                                                                                                                   |
| Internal                            | Composition frames/cursors, ordered reduction, effective catalogs and first-source tracking.                            |
| Unchanged                           | Definitions, runtime, operations, adapters, validator port, packages, entry points, exports, dependencies and versions. |

Every existing root export remains Public + Experimental + Active. No plan may
add an unlisted Public change without revising the applicable accepted
architecture and this specification.

## 12. Conformance scenarios

A future implementation plan must map focused fixtures/tests for at least:

1. root, nested object, object item-root and referenced composed wrappers, with
   omitted/exact object type;
2. primitive, nullable primitive, array and identity locations rejecting
   `allOf` without branch inspection;
3. accessor/non-enumerable/non-array/empty/hostile-length/sparse/index/extra-key
   exterior failures and exact precedence;
4. one, multiple and deeply nested ordinary contributions in deterministic
   order;
5. pure local-reference branches, reference-to-wrapper, reference chains and a
   target with unsupported branch kind;
6. wrapper `properties`/`required`/`$ref`/applicator siblings and branch-local
   root `$schema`/`$defs`;
7. every use-site contribution catalog, omitted wrapper type/properties without
   ordinary missing diagnostics, and malformed contribution `type`/`properties`;
8. disjoint property order, repeated names across inline/reference/nested
   branches and a malformed duplicate subtree that is not traversed;
9. required union, cross-branch requiredness, repeated required names and
   delayed unmanaged warnings with paths/chains/templates;
10. absent/single/equal/conflicting/invalid object title and description plus
    implicit-root non-emission and opaque default non-application;
11. every composition-conflict reason and exact parameters/fallback/path;
12. current and first-source provenance for all inline/reference combinations;
13. raw containment cycles, reference cycles and repeated acyclic sharing;
14. contributed arrays, composed item identity and dependent-policy
    suppression versus independent policy diagnostics;
15. one use-site UI Schema over effective order with no branch provenance;
16. exact original-schema identity delivered to the validator;
17. deep finite composition without JS call-stack dependence or Public limit;
18. immutable diagnostics and non-retention of caller objects/values;
19. no partial definition plus independent branch/UI diagnostic continuation;
20. unchanged Public declarations, package roots, dependency manifests and all
    M1–M27 fixtures when composition is absent; and
21. one shared reference scenario with independent Angular/Standard projection,
    combined order, cross-branch requiredness and validator evidence.

## 13. Explicit exclusions

This specification does not support repeated-property merging, primitive/array
conjunction, boolean schemas, `$ref` semantic siblings, `anyOf`, `oneOf`,
`not`, conditionals, `dependentSchemas`, unevaluated semantics, external or
dynamic resources, vocabularies, a Public AST/resolved graph, applied defaults,
expressions, dynamic definitions, persistence, submit, batches, a framework
validation bridge, another framework adapter, dependency/version/release or
Stable promotion.

## 14. Acceptance criteria

SPEC-014 may be accepted only when:

1. every contract is consistent with ADR-031 and ADR-005 revision 7;
2. locations, wrapper/contribution catalogs and exterior precedence are exact;
3. reduction, properties, requiredness and annotation behavior are closed;
4. codes, reasons, parameters, paths, chains, fallbacks and ordering map
   directly to conformance scenarios;
5. descriptor safety, iteration, sharing and both cycle domains are complete;
6. UI, collections, original-validator ownership and application ownership
   remain exact;
7. Public/Internal inventory contains no unlisted signature/dependency change;
8. every Deferred and later-gate boundary is preserved;
9. no implementation plan or code is prepared before acceptance; and
10. a complete review is repeated after every correction until one pass has
    zero findings and no documentation conflict.

Acceptance would authorize only preparation and complete review of a separate
implementation plan. Explicit plan approval would still be required before
code changes.

## 15. Standards references

- [JSON Schema Core Draft 2020-12 — `allOf`](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-00#section-10.2.1.1)
- [Understanding JSON Schema — Boolean combination](https://json-schema.org/understanding-json-schema/reference/combining)

## 16. History

| Version | Date       | Change                                                            |
| ------- | ---------- | ----------------------------------------------------------------- |
| 0.1.0   | 03-08-2026 | Initial Draft after acceptance of ADR-005 revision 7 and ADR-031. |
