# SPEC-004: Same-document Static JSON Schema Reference Resolution

- **State:** Accepted
- **Version:** 0.1.1
- **Date:** 14 July 2026
- **Acceptance date:** 15 July 2026
- **Milestone:** M11 — Same-document static reference resolution
- **Promoted capability:** [`D-041`](../roadmap/deferred-decisions.md)
- **Accepted baselines:**
  [`SPEC-001 v0.1.15`](./001-controlled-form-runtime.md),
  [`SPEC-002 v0.1.2`](./002-nested-object-runtime.md) and
  [`SPEC-003 v0.1.2`](./003-collection-runtime.md)
- **Accepted architecture:**
  [`ADR-016`](../adrs/016-resolucion-referencias-locales.md)
- **Accepted dialect decision:**
  [`ADR-005 revision 3`](../adrs/005-politica-dialecto-json-schema.md)
- **Implementation plan:** None; preparation and review of a separate plan are
  authorized, but implementation requires its explicit approval
- **Implementation state:** Inactive

## 1. Status and authority

This Accepted specification defines the observable D-041 extension required by
accepted ADR-016 and ADR-005 revision 3. It extends the accepted specifications
only
where it explicitly replaces their `$defs`/`$ref` exclusions. Every unchanged
compiler, normalized-definition, runtime, operation, Angular, validation,
package, stability and publication rule remains authoritative.

Acceptance authorizes preparation and review of a separate implementation plan;
it does not approve that plan or activate reference behavior, code,
publication or Stable API promotion.

## 2. Goals

M11 shall specify a compiler that:

1. indexes one optional root `$defs` registry without eagerly normalizing its
   schema content;
2. accepts a closed fragment-only `$ref` subset at non-root schema use sites;
3. resolves RFC 3986 fragments and RFC 6901 pointers within the same input
   document;
4. normalizes each resolved target independently at its managed use site;
5. preserves exact target, use-site and reference-chain provenance;
6. detects deterministic reference cycles without confusing them with raw
   schema-object cycles;
7. remains iterative, descriptor-safe, framework-neutral and externally pure;
   and
8. preserves all existing Public signatures and normalized contracts.

## 3. Non-goals

M11 does not support:

- root `$ref`;
- `$id`, `$anchor`, `$dynamicAnchor`, `$dynamicRef` or plain-name fragments;
- external documents, embedded resources, URI registries, callbacks, network
  access or filesystem resolution;
- `$ref` siblings that require conjunction or annotation merging;
- `allOf`, `anyOf`, `oneOf`, `not`, conditionals, dependent schemas,
  unevaluated semantics or vocabularies;
- a Public/versioned resolved AST, graph, resource model or render plan;
- recursive managed data/UI structures beyond the already accepted inline
  shapes;
- dynamic `FormDefinition` replacement;
- a new package, entry point, dependency, framework contract or Public symbol;
  or
- an implementation plan, code change, publication or Stable promotion.

D-007 retains the wider reference/composition work and D-014 retains the
generic resolved-model work.

## 4. Public compiler contract

The compiler signature and result remain unchanged:

```ts
export interface CompileFormDefinitionInput {
  readonly schema: unknown;
  readonly uiSchema?: unknown;
  readonly collectionPolicies?: readonly CollectionPolicy[];
}

export function compileFormDefinition(
  input: CompileFormDefinitionInput,
): CompileFormResult;
```

No new input selects or configures reference resolution. A schema that uses no
`$defs` or `$ref` retains the exact accepted M1–M10 observable behavior and
diagnostic envelopes.

`FormDefinition`, every node/template contract, runtime, operation, Angular
adapter and `SchemaValidator` signature remain unchanged. All changed behavior
is Public + Experimental + Active only after implementation under an approved
plan; the resolver and its cursor/index/cache helpers remain Internal.

## 5. Supported document model

The input is still one Draft 2020-12 document whose root is the inline object
accepted by the existing compiler. The root may additionally contain one own
`$defs` data property. Supported reference objects may occur only where the
accepted M10 traversal expects a non-root field, object, array, item or
descendant schema.

Definitions are document metadata, not managed data nodes. A definition does
not create a `DataPath`, normalized node, UI branch, collection policy or
diagnostic from its schema content merely by being declared.

### 5.1 Root `$defs` exterior

`$defs` is optional. When present, its own descriptor must be enumerable, be a
data property and contain an ordinary non-array object whose prototype is
`Object.prototype` or `null`.

A present accessor, non-enumerable data property or incompatible value emits
exactly one blocking `INVALID_SCHEMA_KEYWORD_VALUE`:

```ts
{
  code: 'INVALID_SCHEMA_KEYWORD_VALUE',
  severity: 'error',
  source: 'schema',
  documentPath: ['$defs'],
  parameters: {
    keyword: '$defs',
    expected: 'own enumerable ordinary definition object',
    actualType,
  },
  fallbackMessage: 'Schema keyword "$defs" has an invalid value.',
}
```

`actualType` uses the existing safe closed vocabulary. A non-enumerable data
property describes its safely inspected value; the closed `expected` string
expresses the enumerability requirement. The diagnostic has no `dataPath` or
`referenceChain`.

An invalid exterior is not traversed or indexed. It suppresses dependent entry
and target-resolution diagnostics but does not suppress independent root
diagnostics or reference-object shape/sibling diagnostics.

### 5.2 Definition entries and lazy content

After a valid exterior, definition names are selected once in
`Object.keys($defs)` order. Every selected descriptor must still exist, be an
own data property and contain an ordinary non-array schema object.

A missing/accessor entry or incompatible value emits:

```ts
{
  code: 'INVALID_SCHEMA_KEYWORD_VALUE',
  severity: 'error',
  source: 'schema',
  documentPath: ['$defs', definitionName],
  parameters: {
    keyword: '$defs',
    definition: definitionName,
    expected: 'ordinary schema object',
    actualType: string,
  },
  fallbackMessage: 'Schema keyword "$defs" has an invalid value.',
}
```

This diagnostic has no `dataPath` or `referenceChain`. Inherited and
non-enumerable names are not registry entries. An invalid indexed entry remains
unresolvable: each otherwise valid `$ref` use of it also receives its own
use-site `UNRESOLVED_SCHEMA_REFERENCE`.

The contents of a valid entry are lazy. Keywords and descendants are inspected
only when a valid reference reaches that schema object. An unused definition
therefore produces no content diagnostic.

All selected entries are inspected in order. An invalid entry blocks a
successful compile result and remains unavailable to references, but does not
stop independent later entries from being validated/indexed or valid entries
from being resolved for independently collectible diagnostics.

## 6. Reference objects

An own `$ref` descriptor at a supported non-root schema position classifies
that ordinary schema object as a reference object. `$ref` is inspected before
all siblings. It must be a data property containing a string.

The sibling catalog is closed:

- `$ref` is the only supported semantic keyword;
- accepted ignorable annotations retain `IGNORED_SCHEMA_KEYWORD`;
- unknown keywords retain `UNKNOWN_SCHEMA_KEYWORD`, and their values remain
  opaque; and
- every other known Draft 2020-12 keyword, including `type`, normalized text,
  constraints, `properties`, `items` and nested `$defs`, emits
  `INCOMPATIBLE_SCHEMA_KEYWORD` with
  `{ keyword, fieldType: 'reference', referenceChain }`.

After `$ref`, own enumerable siblings are classified in `Object.keys()` order
with `$ref` skipped. Classification never reads a sibling value merely to
identify its keyword. An invalid `$ref` still permits independently
collectible sibling diagnostics. Any incompatible semantic sibling prevents
target resolution and normalization for that branch; ignored annotations and
unknown opaque siblings do not.

Root `$ref` is always invalid and never replaces the accepted inline root. Its
descriptor is inspected after dialect, collection-policy exterior and `$defs`
indexing but before the accepted ordinary root members. Its independent root
siblings then continue through the existing root checks.

## 7. Reference syntax and pointer decoding

A supported reference is one URI-reference consisting only of `#` and its
fragment. The complete string is validated before traversal.

### 7.1 Closed validation sequence

The first applicable failure wins in this order:

1. root location;
2. accessor descriptor;
3. non-string value;
4. RFC 3986 raw URI-reference/fragment character grammar, a second raw `#` and
   percent-triplet lexical shape;
5. presence of the single leading `#`;
6. percent-triplet and UTF-8 decoding;
7. decoded plain-name versus JSON Pointer form;
8. RFC 6901 pointer escapes;
9. `$defs` scope and required definition-name token; and
10. canonical array index while mechanically traversing a target.

After the single `#`, the raw fragment admits exactly RFC 3986
`pchar / "/" / "?"`. `pchar` admits unreserved, percent-encoded, sub-delims,
`:` and `@`. A raw character outside that grammar is `invalid-uri-reference`.
Every `%` must have two hexadecimal digits during step 4; malformed triplets
are `invalid-percent-encoding` even before the leading-fragment-only check.
During step 6 the complete encoded byte sequence must decode as valid UTF-8 or
uses the same reason. Percent-decoding occurs exactly once.

The decoded fragment must begin with `/`. Each JSON Pointer token then decodes
`~1` to `/` and `~0` to `~`; every other `~` escape is invalid. The token list
must begin with `$defs` and contain at least one definition-name token.

A decoded empty fragment, a first token other than `$defs`, or `$defs` without
a definition name is `outside-definitions`. A non-empty decoded fragment that
does not begin with `/` is `plain-name-fragment-not-supported`.

If traversal crosses an array, the raw decoded pointer token must match exactly
`0|[1-9][0-9]*`. `-`, signs, leading zeroes, whitespace and other spellings are
`non-canonical-array-index`. The token is compared textually before any safe
conversion of an existing index to `number`.

A syntactically canonical token resolves an array only when its mathematical
value selects an existing array element: it is strictly less than `length` and
has an own enumerable data descriptor at that exact decimal key. A canonical
out-of-range or too-large token is `missing-target`, even if the JavaScript
array has an extra non-element property with that name. A sparse element is
also `missing-target`; a non-enumerable or accessor element uses its exact
unresolved-target reason. Only a successfully resolved array element converts
its token to the safe numeric segment used by `DocumentPath`.

### 7.2 Invalid-reference diagnostic

`INVALID_SCHEMA_REFERENCE` is `error`/`schema`, has fallback
`Schema reference is invalid.`, and uses exactly one of:

```ts
type InvalidSchemaReferenceReason =
  | 'accessor-reference'
  | 'non-string-reference'
  | 'root-reference-not-supported'
  | 'non-fragment-reference'
  | 'invalid-uri-reference'
  | 'plain-name-fragment-not-supported'
  | 'invalid-percent-encoding'
  | 'invalid-pointer-escape'
  | 'outside-definitions'
  | 'non-canonical-array-index';
```

Its exact parameters are:

```ts
{
  reason: InvalidSchemaReferenceReason;
  reference?: string;
  referenceChain: readonly DocumentPath[];
}
```

`reference` appears only after a string has been read safely. The diagnostic
`documentPath` is the current `$ref`; `dataPath` is the managed use-site path
except for root `$ref`, which has none. The immutable outermost-to-innermost
`referenceChain` includes the current `$ref` path as its final member. Exactly
one invalid-reference diagnostic is emitted per `$ref`.

## 8. Mechanical target resolution

Pointer traversal starts at the original document root. It crosses only own
enumerable data descriptors of ordinary objects and arrays. Inherited,
non-enumerable, missing, sparse and accessor members are never evaluated.
`__proto__` is an ordinary token only when it names such an own data property.
The final target must be an ordinary non-array schema object.

Resolution is iterative, deterministic and framework-neutral. It executes no
accessor or consumer callback, performs no I/O, reads no browser/Node global,
does not mutate or clone caller schema content and imposes no Public arbitrary
depth limit.

### 8.1 Unresolved-reference diagnostic

`UNRESOLVED_SCHEMA_REFERENCE` is `error`/`schema`, has fallback
`Schema reference target could not be resolved.`, and uses exactly one of:

```ts
type UnresolvedSchemaReferenceReason =
  | 'missing-target'
  | 'non-enumerable-target'
  | 'accessor-target'
  | 'non-schema-target';
```

Its exact parameters are:

```ts
{
  reason: UnresolvedSchemaReferenceReason;
  reference: string;
  targetDocumentPath: DocumentPath;
  referenceChain: readonly DocumentPath[];
}
```

The diagnostic uses the current `$ref` keyword as `documentPath` and the
managed use site as `dataPath`. `targetDocumentPath` is the decoded prefix
ending at the first failing token, not an unvisited desired suffix. Object
tokens remain strings. An array token becomes a number only after resolving an
existing canonical index; a failing array token retains its exact string.

`missing-target` covers absent, inherited and sparse members.
`non-enumerable-target` and `accessor-target` identify their exact descriptor
failure. `non-schema-target` covers an intermediate value that cannot be
traversed as an ordinary object/array and a final value that is not an ordinary
non-array schema object.

## 9. Normalization at each use site

A resolved target is normalized under the accepted schema subset as if its
schema content occurred at the managed use site, while preserving its original
document location.

- managed `DataPath`, normalized keys, required state and collection addresses
  derive only from the use site and its accepted parent contracts;
- schema keyword diagnostics retain target `documentPath` and use-site
  `dataPath`;
- structural UI Schema remains attached to the use site and retains its UI
  `documentPath` without a schema reference chain;
- the same target may be referenced at multiple paths with different UI
  metadata and is normalized independently at each path;
- a reference to an accepted array schema requires `CollectionPolicy` for each
  absolute use-site collection path, never for a `$defs` document path;
- schema-dependent collection-policy diagnostics inherit the applicable
  reference chain; policy-exterior diagnostics and `UNUSED_COLLECTION_POLICY`
  do not; and
- no target annotation, constraint or structure mutates the source schema or
  creates an implicit UI definition.

A referenced target may itself be a valid reference object. Each edge appends
its exact `$ref` document path to the active chain before resolving the next
target.

## 10. Sharing and cycle domains

Reference identity is the canonical resolved target `documentPath`, not
JavaScript object identity. Re-entering the same target path in the active
reference chain emits one `CYCLIC_SCHEMA_REFERENCE`:

```ts
{
  code: 'CYCLIC_SCHEMA_REFERENCE',
  severity: 'error',
  source: 'schema',
  documentPath: currentReferencePath,
  dataPath: managedUseSitePath,
  parameters: {
    firstDocumentPath: DocumentPath,
    referenceChain: readonly DocumentPath[],
  },
  fallbackMessage: 'Schema reference cycle detected.',
}
```

`firstDocumentPath` is the canonical target `documentPath` recorded at the
first active occurrence of the repeated target, never a `$ref` keyword path.
`referenceChain` includes the `$ref` that closes the cycle. The diagnostic stops
only its dependent branch.

Repeated acyclic references to one target are valid. Internal resolution
metadata may be shared, but normalized definitions, UI precedence, keys and
managed paths are never shared across use sites merely because their target is
the same.

`CYCLIC_SCHEMA_OBJECT` remains distinct: it reports active JavaScript object
identity re-entry through accepted structural `properties`/`items`
containment. A reference edge alone never converts shared object identity into
a raw-object cycle.

## 11. Diagnostic provenance and immutability

Every reference-mediated schema diagnostic carries an immutable
outermost-to-innermost `parameters.referenceChain`. A diagnostic produced by
target schema content retains that target keyword's original `documentPath`
and the managed use site's `dataPath`. Sibling diagnostics carry the chain that
includes their reference object's `$ref`.

UI Schema diagnostics never receive a schema `referenceChain`. Registry
exterior/index diagnostics, collection-policy exterior diagnostics and
`UNUSED_COLLECTION_POLICY` have no unique schema use site and never receive
one.

Existing diagnostic envelopes remain exact when neither `$defs` nor `$ref` is
used. `Diagnostic` does not change: reference provenance lives within the
existing `Readonly<Record<string, unknown>>` parameters. Every emitted path,
chain, parameters object, diagnostic, result wrapper and diagnostics array is
copied and deeply immutable. No diagnostic retains a schema object, registry,
pointer container, accessor value, hostile value or thrown value.

## 12. Global ordering and branch stopping

Observable compilation order is:

1. compiler input and root dialect;
2. `collectionPolicies` exterior;
3. `$defs` exterior and entries in `Object.keys()` order;
4. accepted root-schema depth-first pre-order;
5. at each reference object: `$ref` shape/syntax, siblings in source order,
   pointer traversal, cycle check and target normalization;
6. semantic collection policy at its first dependent array and unused policies
   after schema traversal; and
7. complete UI Schema after every independently collectible schema diagnostic.

An incompatible dialect blocks schema work. A malformed `$defs` exterior
blocks indexing/resolution but not independent root/reference diagnostics. A
malformed `$ref` or incompatible sibling blocks its target. An unresolved
target or cycle stops only its branch. Independent siblings, independently
reached definitions and independent UI exterior diagnostics continue in their
accepted order.

Any error returns `success: false` without a partial `FormDefinition`. Warnings
remain non-blocking when the accepted compiler has a safe fallback.

## 13. Validation and framework ownership

`SchemaValidator` receives the exact original schema object and complete
controlled value. The compiler never passes it a clone, bundle, dereferenced
document or Internal resolved cursor. Reference resolution performs no instance
validation.

Core alone resolves metadata and produces the existing normalized definition.
Angular and every other adapter continue consuming only normalized definitions
and runtime snapshots. No adapter receives raw `$defs`, reference objects,
resolved cursors or resource registries.

## 14. Public/Internal migration inventory

| Classification                      | Exact effect                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Changed Public behavior             | `compileFormDefinition()` accepts the closed D-041 `$defs`/`$ref` subset and emits deterministic reference diagnostics.                                |
| Changed Public diagnostic semantics | Reference-mediated schema diagnostics may add immutable `parameters.referenceChain`; diagnostics outside M11 constructs retain their accepted shape.   |
| New Public symbols                  | None.                                                                                                                                                  |
| Changed Public signatures           | None.                                                                                                                                                  |
| Internal                            | Registry indexing, URI-fragment/pointer decoding, resolved cursors, target caching, cycle tracking and provenance helpers.                             |
| Unchanged                           | Normalized definitions, runtime, operations, Angular, validator port, packages, entry points, exports, dependencies, versions, publication and Stable. |

No unlisted Public change may appear in a future plan without revising and
reaccepting the applicable ADR-009 inventory.

## 15. Conformance scenarios

A future implementation plan must map fixtures and focused tests for:

1. absent and empty `$defs`, unused valid definitions and multiple declaration
   orderings;
2. accessor, non-enumerable, array, null, primitive and class-instance `$defs`
   exteriors;
3. missing/accessor/non-schema entries, including an invalid entry that is
   unused and one referenced from multiple use sites;
4. references in every supported non-root position: primitive field, nested
   object, array property, array `items` root and item descendant, at shallow
   and deep use sites;
5. one target reused with different structural UI metadata, required state,
   managed keys and paths;
6. collection policies keyed by referenced array use sites and their exact
   reference-chain provenance;
7. raw and percent-encoded pointer separators, UTF-8 names, empty/whitespace
   names, `/`, `~`, `?`, `#`, `%`, JSON punctuation, `__proto__` and lone
   surrogate/invalid-encoding cases;
8. every `INVALID_SCHEMA_REFERENCE` reason and its precedence;
9. mechanical traversal through objects/arrays and every
   `UNRESOLVED_SCHEMA_REFERENCE` reason, including canonical/oversized array
   tokens;
10. direct, indirect and longer reference cycles plus repeated acyclic targets;
11. distinction between reference-path cycles and raw containment-object
    cycles;
12. malformed `$ref` plus independent ignored, unknown and incompatible
    siblings in source order;
13. target schema diagnostics with exact source `documentPath`, use-site
    `dataPath` and nested outermost-to-innermost chains;
14. UI diagnostics without schema chains and policy exterior/unused diagnostics
    without invented use-site provenance;
15. malformed `$defs` branch stopping, independent root/schema/UI diagnostics
    and no partial definition;
16. deeply finite registries, pointers and reference chains without JS call
    stack dependence or a Public depth limit;
17. immutability and non-retention of paths, chains, parameters, diagnostics and
    hostile caller values;
18. exact original-schema identity delivered to `SchemaValidator`; and
19. unchanged declarations, package roots, clean consumers and M1–M10 fixture
    results when references are absent.

## 16. Acceptance criteria

SPEC-004 may be accepted only when:

1. every contract is consistent with accepted ADR-016 and ADR-005 revision 3;
2. the `$defs`/reference-object catalog, syntax, resolution and stopping rules
   have no unresolved interpretation;
3. all codes, reasons, parameters, paths, chains, fallbacks and ordering are
   closed and map directly to conformance scenarios;
4. target/use-site/UI/collection-policy provenance is exact;
5. descriptor safety, iteration, sharing and both cycle domains are complete;
6. Public signatures and normalized/runtime/Angular/validator contracts remain
   unchanged;
7. D-007, D-014 and every package/publication/stability boundary remain
   inactive;
8. no implementation plan or code is prepared before acceptance; and
9. a complete review is repeated after every correction until one cycle passes
   with zero findings and no documentation conflict.

Ricard formally accepted SPEC-004 v0.1.1 on 15 July 2026 after review 019 cycle
5 passed all ten areas with zero findings. Acceptance authorizes preparation
and review of a separate implementation plan only. Explicit plan approval is
still required before code changes.

## 17. Standards references

- [JSON Schema Core Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core)
- [RFC 3986: URI Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 6901: JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901)

## 18. History

| Version | Date       | Change                                                                       |
| ------- | ---------- | ---------------------------------------------------------------------------- |
| 0.1.1   | 15-07-2026 | Accepted after nine findings were closed and complete review cycle 5 passed. |
| 0.1.0   | 14-07-2026 | Initial Draft after acceptance of ADR-005 revision 3.                        |
