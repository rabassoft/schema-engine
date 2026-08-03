# ADR 031: Static object composition with `allOf`

- **State:** Accepted revision 0
- **Date:** 2026-08-03
- **Acceptance date:** 2026-08-03
- **Milestone:** M28 — Static object `allOf` composition
- **Promotes:** only the bounded D-007 slice recommended by
  [review 258](../reviews/258-post-m27-functional-capability-selection.md) and
  selected by Ricard on 2026-08-03
- **Requires:** Accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2 and SPEC-004 v0.1.1; ADR-005 revision 6, ADR-009, ADR-014 revision 2,
  ADR-015 revision 4, ADR-016 and ADR-022 revision 3
- **Authority:** Accepted M28 architecture only; preparation and complete
  review of ADR-005 revision 7 are authorized, but no Public contract,
  implementation, dependency, version, release, publication, commit, push or
  external mutation is authorized
- **Complete review:** [Review 259](../reviews/259-adr-031-review.md) cycle 5
  passed all fourteen areas with zero findings; Ricard accepted this revision
  formally on 2026-08-03

## 1. Context

Schema Engine can normalize inline root/nested objects, homogeneous object
collections and same-document `$defs`/`$ref` targets. Reusable object fragments
still cannot contribute to one form shape: `allOf` is classified as unsupported
even when every branch is statically object-shaped.

Draft 2020-12 defines `allOf` as logical conjunction. Every subschema applies
independently to the same instance; it is not object-oriented inheritance and
does not itself merge source documents. Core therefore cannot clone or spread
branch objects and call that JSON Schema evaluation. It needs a bounded
derivation rule that is valid only when one neutral object definition can be
proven without inspecting instance data.

Review 258 selected architecture design for that closed case. Alternatives,
conditionals, primitive conjunction, resource expansion and a generic evaluator
remain Deferred.

## 2. Decision

### 2.1 Supported composed-object locations

An own `allOf` descriptor classifies a schema object as a composed-object
wrapper. M28 may admit that wrapper only where the accepted compiler expects
one object schema:

- the document root;
- a root, nested-object or collection-item property whose effective kind is
  object;
- the homogeneous collection `items` object root; and
- a same-document reference target reached at one of those use sites.

`allOf` is not admitted on a primitive or array node. Arrays may still appear
as ordinary properties contributed by a composed object. A collection item
root derived through `allOf` retains the exact accepted identity-policy and
template rules after composition.

A composed-object wrapper may contain:

- root-only `$schema` and `$defs` under their accepted rules;
- optional `type` with the exact value `"object"`;
- optional `title`, `description` and metadata-only `default` where that use
  site already admits them;
- the required `allOf` member;
- accepted ignorable annotations; and
- unknown opaque annotations under ADR-005.

`properties`, `required`, `$ref`, another semantic applicator or any other
known semantic sibling is incompatible on the wrapper. Authors express an
ordinary local contribution as another `allOf` branch. This keeps wrapper
semantics separate from branch reduction and preserves the existing rule that
`$ref` has no semantic siblings.

### 2.2 Closed `allOf` exterior and branch forms

`allOf` must be an own enumerable data property containing an ordinary array.
Its own `length` descriptor must remain a data property with a positive safe
integer value. Every index from `0` through `length - 1` must be an own
enumerable data property containing an ordinary non-array schema object. The
array may have no other enumerable string key. Accessors, sparse/non-enumerable
indices, boolean schemas, arrays, primitives and class instances are invalid.

Every branch must resolve to exactly one of these forms under the catalog of
the current use site (ordinary object node, root or collection item root):

1. an ordinary object contribution with own exact `type: "object"` and own
   ordinary-object `properties`, plus only the accepted members for that exact
   object location;
2. a pure supported `$ref` object whose target resolves to an ordinary object
   contribution or another composed-object wrapper; or
3. another composed-object wrapper satisfying this ADR.

At a root composition, only the root's object assertion members are available
to a contribution: `type`, `properties`, `required`, `title` and `description`.
`$schema` and `$defs` remain exclusive to the document-root wrapper and never
become branch-local dialect/resource declarations. At an item root, the
existing `type`/`properties`/`required` catalog remains exact. Every other use
site retains its accepted ordinary-object catalog.

Nested finite composition is therefore legal both at the same instance
location and at descendant object properties. It is traversed iteratively and
has no Public arbitrary depth limit. A branch cannot be primitive, array-shaped
or an object schema whose effective kind depends on instance validation.

The compiler never executes an accessor, array iterator or consumer callback.
Reflection traps may run through ordinary reflection and must be contained as
accepted input failure rather than escaping as an expected consumer exception.

### 2.3 Ordered static reduction

Core reduces a composed object only for normalized-definition derivation. It
does not create a bundled schema. Contributions are flattened in deterministic
depth-first `allOf` index order after reference resolution.

The effective `properties` catalog is the concatenation of each contribution's
`Object.keys(properties)` order. The first occurrence fixes the property's
schema document location and presentation-order position.

The first M28 slice requires contributed property names to be disjoint. A
second occurrence of the same exact property name is a blocking composition
conflict even when both schema objects or their apparent constraints are
identical. Core does not prove keyword-specific intersections, equivalence or
satisfiability.

Each contribution's valid `required` names are accumulated after its own safe
shape inspection. Requiredness is the union across the complete composition;
one contribution may require a property declared by another. Only after the
effective property catalog is complete does core emit the accepted unmanaged-
required warning for a name absent from that union.

Every unique property then uses the existing normalization rules for its exact
source schema: primitive, nullable, fixed, semantic-format, nested object,
array, local reference or independently composed descendant. `FormDefinition`,
node/template identities, paths, keys and leaf projections remain unchanged.

### 2.4 Annotation reduction

UI Schema retains first precedence. To derive one schema source for normalized
object `title` and `description`, core inspects the wrapper and flattened
contributions in deterministic document order:

- absence everywhere preserves the accepted local-name/optional fallback;
- one present valid value is selected;
- repeated exact-equal strings select that value; and
- two distinct values are a blocking composition conflict.

Core does not define outer-wrapper override or inheritance semantics. A
consumer that needs a use-site-specific label or description uses the existing
UI Schema.

`default` retains its accepted opaque metadata-only classification: no value is
executed, copied, combined or applied. Known ignored and unknown annotations
keep their individual source diagnostics and opaque behavior. M28 does not
collect or expose a general annotation result.

### 2.5 Internal resolution and composition boundary

ADR-016's resolved cursor remains Internal and keeps exact target schema,
`documentPath`, reference chain and cycle identity. M28 adds an Internal
composition frame/effective-object cursor between resolution and existing
normalization. It carries ordered contributions and their source provenance;
it is not a Public AST, resolved graph, bundled schema or versioned render plan.

A pure `$ref` branch uses existing fragment/pointer rules. ADR-031 adds only
`allOf` array indices as new supported non-root reference-object positions,
including branches of a root composition; a direct document-root `$ref`
remains invalid. The target may be an ordinary contribution or a composed
wrapper. `$ref` siblings remain incompatible, and no reference may escape the
same root `$defs` registry.

Raw schema-object re-entry through active `allOf`, `properties` or `items`
containment uses the existing `CYCLIC_SCHEMA_OBJECT` domain. Reentering a
canonical reference
target through active `$ref` edges uses `CYCLIC_SCHEMA_REFERENCE`. Repeated
acyclic branches and targets are normalized independently at each managed use
site. Composition creates no third cycle identity; reuse of one JavaScript
schema object outside the active containment ancestry remains legal sharing.

### 2.6 Provenance, diagnostics and ordering

ADR-005 revision 7 and a later SPEC must close exact codes, reasons, parameters,
fallbacks and first-failure order. The architectural families are:

- existing `INVALID_SCHEMA_KEYWORD_VALUE` for a malformed `allOf` exterior,
  index or wrapper member;
- existing `INCOMPATIBLE_SCHEMA_KEYWORD` for a semantic wrapper sibling or an
  `allOf` used outside an admitted object position; and
- one composition-conflict family for an incompatible branch kind, duplicate
  property or distinct normalized object annotation.

A duplicate-property or annotation-conflict diagnostic is anchored at the
later conflicting source and must carry copied provenance for the first source.
ADR-005 revision 7 and the extension SPEC must close whether that provenance is
expressed as exact first-source document/reference paths or another immutable
parameter shape; it cannot retain either schema object or an Internal cursor.

An inline diagnostic uses its exact source path including `allOf` and branch
indices. A diagnostic inside a referenced contribution retains the target
`documentPath`, managed use-site `dataPath` and existing immutable
`referenceChain`. Inside a collection item template it also retains the
accepted absolute array `dataPath` and relative immutable `templatePath`. No
`compositionChain` is added to the Public diagnostic envelope: inline indices
already occur in `documentPath`, while referenced edges are represented by
`referenceChain`.

The accepted global order of compiler input, dialect, collection-policy
exterior and `$defs` index remains unchanged. At the composed wrapper's schema
position, observable order is:

1. wrapper shape/type before compatibility and annotations, preserving the
   accepted keyword-classification order;
2. `allOf` exterior and indices in ascending order;
3. each branch depth-first, including reference resolution and nested
   composition;
4. property and annotation conflicts when their later contribution is reached;
5. effective unmanaged-required diagnostics after all safely inspectable
   branches; and
6. the single use-site UI Schema traversal after all independently collectible
   schema diagnostics.

An invalid exterior stops every dependent branch. A malformed/conflicting
branch stops its dependent normalized result but independent later branches
remain inspectable for diagnostics. Any error returns no partial
`FormDefinition`.

### 2.7 UI Schema and collection policy

Composition adds no UI Schema shape. Exactly one existing UI node belongs to
the managed use site, regardless of branch or target count. It applies after
the effective property order/catalog is derived:

- UI order reorders the combined direct children;
- UI field metadata addresses combined property names once;
- UI `documentPath` remains the use-site UI path and never receives schema
  composition or reference provenance; and
- branch-local UI Schema, branch selectors and conditional layouts do not
  exist.

Collection policies still target absolute managed array paths. An array
property contributed by any branch requires the same one exact policy. For a
composed item root, the identity property and its requiredness are resolved
from the effective disjoint property catalog before existing template
normalization. Composition does not generate identity or change stable address
semantics.

### 2.8 Validation and ownership

The compiler determines only whether it can derive one neutral definition.
`SchemaValidator` receives the exact original schema object and complete value;
core never passes a flattened, cloned or dereferenced composition. The official
Ajv adapter already evaluates Draft 2020-12 `allOf` conjunction and requires no
production option, cache, dependency or issue-mapping change.

Compiler success remains the supported-flow gate before validation. Ajv's
broader applicator behavior does not activate an unsupported Schema Engine
shape. Core does not assert constraints, detect all logically impossible
schemas or decide which validator errors should make a field renderable.

Runtime, operations, baseline confirmation and asynchronous validation consume
only the unchanged normalized definition and original schema. Angular and
Standard receive no raw branches or composition cursor and require no adapter
wrapper.

### 2.9 Public/Internal inventory

Under ADR-009, the proposed migration is:

| Classification                      | Exact effect                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public behavior             | `compileFormDefinition()` accepts the closed M28 object-`allOf` subset, including pure local `$ref` branches, and derives existing definitions.   |
| Changed Public diagnostic semantics | Malformed/incompatible compositions may emit the exact revised/new envelopes later closed by ADR-005 revision 7 and the extension SPEC.           |
| New Public symbols                  | None.                                                                                                                                             |
| Changed Public signatures           | None; compiler input/result, definitions, runtime, operations, adapters and validator contracts retain their accepted shapes.                     |
| Internal                            | Composition frames, ordered contribution reduction, annotation/property conflict tracking and effective-object cursors.                           |
| Unchanged                           | Packages, entry points, exports, dependencies, versions, publication and the Public + Experimental + Active classification of existing root APIs. |

Acceptance of this ADR authorizes preparation and complete review of ADR-005
revision 7 only. It does not authorize an extension SPEC, plan, implementation
or any package/Git/external action.

## 3. Consequences

### Positive

- Reusable local object fragments can produce one portable form definition.
- The compiler remains framework-neutral and renderer input stays normalized.
- Disjoint properties avoid pretending that core is a general JSON Schema
  satisfiability or constraint-intersection engine.
- References, UI Schema, collection identity and original-validator ownership
  retain their accepted boundaries.
- No Public symbol or definition shape is added.

### Negative

- Valid Draft 2020-12 compositions with repeated property names are rejected by
  the compiler even though the official validator can evaluate them.
- Conflicting branch titles/descriptions block derivation instead of choosing an
  arbitrary winner.
- The Internal resolver/normalizer pipeline gains another provenance-aware
  traversal layer.
- Boolean schemas and primitive/array conjunction remain unsupported.

## 4. Alternatives rejected

- **Treat `allOf` as object spread or inheritance:** rejected because JSON
  Schema applies every branch independently and does not define override order.
- **Allow duplicate properties and merge recognized constraints:** rejected for
  M28 because each keyword needs exact intersection, contradiction, annotation
  and future-vocabulary behavior; apparent source equality is not a general
  equivalence proof.
- **Let the last branch win:** rejected because it discards active assertions
  and makes source order change domain meaning.
- **Flatten or clone a schema before Ajv:** rejected because it changes source
  identity/provenance and can alter valid conjunction semantics.
- **Use branch-specific UI Schema:** rejected because one instance location has
  one effective normalized node and UI Schema remains presentation-only at the
  managed use site.
- **Expose a Public resolved/composed AST first:** rejected because no consumer
  requires that compatibility surface; D-014 remains Research.
- **Rely only on Ajv:** rejected because validation alone cannot derive the
  normalized structure required by renderers.

## 5. Deferred and unchanged boundaries

The rest of D-007 remains Deferred: repeated-property composition, primitive or
array `allOf`, `$ref` semantic siblings, `anyOf`, `oneOf`, `not`, conditionals,
`dependentSchemas`, unevaluated semantics, external/dynamic resources,
registries/callbacks and vocabularies.

D-014 retains a generic/Public AST, resolved graph, model versioning, separate
render plan and multi-format pipeline. D-012/D-018 retain declarative scopes,
conditions and expressions. D-013 retains dynamic definition replacement.
D-039 retains defaults. No persistence, submit, batches, framework validation
bridge, new framework adapter, package, dependency, Stable promotion, release
or publication is activated.

## 6. Required review before acceptance

ADR-031 may be accepted only after a repeated complete review confirms:

1. exact object-only locations and wrapper/contribution catalogs;
2. descriptor-safe non-empty dense `allOf` exterior and finite iterative
   traversal;
3. depth-first contribution/property order and disjoint-name conflict policy;
4. required union and delayed unmanaged-required semantics;
5. deterministic title/description reduction without inheritance;
6. exact interaction with inline nested objects, collections and item identity;
7. existing local-reference syntax, target provenance and both cycle domains;
8. diagnostic families, source/use-site paths, ordering and branch stopping;
9. one use-site UI Schema and unchanged presentation ownership;
10. exact original schema plus existing Ajv conjunction authority;
11. unchanged runtime, operations, async validation and adapters;
12. complete ADR-009 Public/Internal inventory with no new symbol/signature;
13. preservation of every explicit exclusion and Deferred boundary; and
14. objective follow-up gates with no SPEC, implementation, dependency,
    version, release, Git or external authorization.

Every correction requires another complete review. Only a complete pass with
zero findings and no unresolved change request may support formal acceptance.

## 7. Standards references

- [JSON Schema Core Draft 2020-12 — `allOf`](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-00#section-10.2.1.1)
- [Understanding JSON Schema — Boolean combination](https://json-schema.org/understanding-json-schema/reference/combining)
