# ADR 016: Same-document static JSON Schema reference resolution

- **Status:** Accepted
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Promotes:** [`D-041`](../roadmap/deferred-decisions.md), normative M11 design
  only
- **Requires:** accepted
  [`M11 promotion-readiness review`](../reviews/016-m11-resolution-promotion-readiness.md),
  [`ADR-005 revision 2`](./005-politica-dialecto-json-schema.md),
  [`ADR-009`](./009-politica-api-publica-estabilidad.md) and
  [`ADR-014 revision 2`](./014-modelo-objetos-anidados-paths-profundos.md)
- **Completed follow-up:** ADR-005 revision 3 and SPEC-004 v0.1.1 are Accepted
- **Complete review:**
  [`review 017`](../reviews/017-adr-016-review.md) cycle 2 passed all eight areas
  with zero findings; Ricard then accepted ADR-016 formally
- **Plan preparation/review authorized:** Yes; no plan is approved and no
  implementation is authorized

## 1. Context

The completed compiler traverses one raw Draft 2020-12 schema document directly
into an immutable `FormDefinition`. This is sufficient for inline objects and
collections, but a `$ref` introduces a second identity domain: the managed data
location where a schema is used differs from the document location where its
definition is stored.

Resolving references inside the current normalization traversal would mix URI
and JSON Pointer handling, target provenance, cycle detection and UI derivation.
Promoting all of D-007 would also activate composition, conditionals, dynamic
references and vocabularies before a resolution boundary exists.

Accepted review 016 therefore split out D-041: one same-document static
reference slice that supplies concrete evidence for an Internal resolved-schema
boundary while keeping the Public normalized model and every wider capability
unchanged.

## 2. Decision

ADR-016 establishes a pure Internal resolution phase between dialect/input
inspection and existing `FormDefinition` normalization. It resolves only a
closed fragment-only `$ref` subset against root `$defs`, preserves exact source
provenance and presents the existing compiler with schema cursors independent
of managed data paths.

Acceptance of this ADR authorizes preparation and review of ADR-005 revision 3
only. It does not authorize SPEC-004, an implementation plan, code, new Public
API or publication.

### 2.1 Supported document and reference slice

The input remains one JSON Schema document using the existing Draft 2020-12
dialect policy. Its root remains the inline ordinary object required by the
current compiler and may add one own `$defs` data property.

`$defs` must be an ordinary object inspected through own descriptors. Every own
enumerable definition entry must be an ordinary schema object. Its exterior is
validated deterministically, but an entry's schema content is traversed only
when referenced. Definitions do not create fields, data paths or UI by
themselves.

After dialect inspection and before ordinary root-schema traversal, the
compiler inspects the own `$defs` descriptor. Absence is valid. A present
accessor, non-enumerable data property or non-ordinary-object value is a
blocking invalid keyword value; ADR-005 revision 3 and the later SPEC must fix
its exact parameters and fallback. Definition names are then inspected in
`Object.keys($defs)` order. Missing, inherited, non-enumerable and accessor
members are not addressable JSON document members and no accessor is invoked.

At any schema position where the current subset expects a field, object or array
item schema, an ordinary reference object may contain one own `$ref` data
property whose value is a fragment-only URI reference. After URI-fragment and
JSON Pointer decoding, the pointer must begin with `/$defs/` and resolve within
the same root document to an ordinary schema object.

The first slice does not support a root `$ref`. It does not allow a reference to
escape `$defs`, resolve another document/resource or use a plain-name anchor.

### 2.2 Reference-object siblings

Draft 2020-12 permits keywords beside `$ref`, which would require conjunction
and annotation-merging semantics. D-041 avoids silently implementing those
semantics:

- `$ref` is the only supported semantic keyword on a reference object;
- known ignorable annotations from ADR-005 and unknown opaque extensions retain
  their existing warning/ignore behavior; and
- every other known schema keyword beside `$ref`, including normalized text,
  type, constraints, properties, items or nested `$defs`, is incompatible and
  blocks that branch.

The compiler treats a schema object as a reference object only when an own
`$ref` descriptor is present and inspects that descriptor before any sibling.
An accessor or non-string `$ref` stops only reference-dependent work for that
branch. It still inspects own enumerable siblings in source order so
independent ignored/unknown/incompatible-keyword diagnostics are not lost. It
never reads a sibling value merely to classify its keyword, and no malformed
reference can cause target traversal.

UI Schema remains attached to the managed use site. The same referenced target
may therefore normalize independently at several data paths with different
structural UI metadata; UI Schema never addresses `$defs` document locations.

### 2.3 Internal resolved representation

The resolver remains framework-neutral and Internal. Exact module/class names
are implementation details, but every resolved cursor must carry:

- the exact target schema object without mutating or cloning caller content;
- its immutable target `documentPath`;
- the immutable ordered chain of `$ref` keyword document paths that reached it;
  and
- enough target identity to detect active cycles and reuse completed static
  resolution safely.

Resolution is descriptor-safe and iterative. It never executes accessors,
calls consumer code, fetches a URI, reads browser/Node globals or imposes a
public arbitrary depth limit. Paths, pointer tokens and diagnostic parameters
are copied and frozen; caller containers and hostile values are never retained
in diagnostics.

`compileFormDefinition()` keeps its existing Public signature and returns the
same `FormDefinition` contracts. Normalization consumes resolved cursors but
still derives keys and managed paths exclusively from each use site.

### 2.4 Pointer resolution, sharing and cycles

The fragment is percent-decoded exactly once and then decoded as an RFC 6901
JSON Pointer: `~1` becomes `/`, `~0` becomes `~`, and every other `~` escape is
invalid. The decoded tokens must begin with `$defs` and include at least one
definition-name token. Malformed percent encoding, malformed pointer escapes,
a pointer outside `$defs`, a missing/accessor target or a non-schema target
fails without invoking accessors.

Pointer traversal is mechanical rather than schema-semantic. It crosses only
own enumerable data descriptors of ordinary objects and arrays; inherited,
non-enumerable, missing, sparse or accessor members fail without evaluation.
Array tokens, when encountered, must be canonical decimal indices. `__proto__`
is an ordinary key only when it is such an own data property. The final target
must be an ordinary schema object. ADR-005 revision 3 and the later SPEC must
close the exact canonical-index grammar and diagnostic reason inventory.

Repeated acyclic references to the same target are legal. Resolution metadata
may be shared Internally, but normalization runs independently for every
managed use site so definitions, UI precedence, keys and data paths cannot leak
between uses.

Cycle identity is the canonical resolved target `documentPath`, not JavaScript
object identity. The same object reachable through two distinct document paths
therefore remains two reference locations, while entering the same canonical
target path again in the active reference chain is a blocking reference cycle.
A reference edge opens the cursor identified by that target path and does not
by itself turn shared JavaScript identity into a raw-object cycle. The existing
`CYCLIC_SCHEMA_OBJECT` behavior remains responsible for identity re-entry
through structural containment descriptors within ordinary schema
normalization. This intentionally excludes recursive data/UI trees from M11.
The reference-cycle diagnostic identifies the first active target and the
complete reference chain. A cycle stops only its dependent branch while
independent branches continue according to existing compiler ordering rules.

### 2.5 Diagnostics and provenance

ADR-005 revision 3 and a later SPEC must close exact codes, reasons, ordering
and fallbacks. The architectural families are:

- `INVALID_SCHEMA_REFERENCE` for non-string, malformed or unsupported `$ref`
  syntax/scope;
- `UNRESOLVED_SCHEMA_REFERENCE` for missing, accessor or non-schema targets;
  and
- `CYCLIC_SCHEMA_REFERENCE` for an active target reached again.

Each resolution diagnostic uses `source: 'schema'`, the exact current `$ref`
keyword as `documentPath` and an outermost-to-innermost frozen
`parameters.referenceChain` whose final member is that current `$ref` path.
Diagnostics emitted from schema content while normalizing a resolved target
keep the target keyword's original `documentPath` and receive the same ordered
chain. This includes schema-dependent collection-policy diagnostics; an
independent policy-exterior diagnostic does not invent a schema chain.

`dataPath` always remains the managed use-site path. UI Schema diagnostics keep
their use-site UI `documentPath` and never receive a schema reference chain.
This separates source provenance from runtime location without rewriting target
diagnostics as if they occurred at the reference object.

Existing non-reference diagnostic envelopes remain unchanged when no reference
chain is present. No diagnostic retains schema objects, pointer containers,
accessor values or thrown values.

### 2.6 Validation and ownership

The external `SchemaValidator` continues to receive the exact original schema
and complete controlled value. The resolver neither validates instance data nor
rewrites, bundles or dereferences the schema passed to that port.

Core alone resolves metadata into normalized definitions. Angular and other
adapters continue consuming only `FormDefinition` and runtime snapshots; they
never receive raw or resolved schema resources.

### 2.7 Public/Internal inventory

Under ADR-009, the proposed migration is:

| Classification                      | Exact effect                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Changed Public behavior             | `compileFormDefinition()` accepts the closed D-041 `$defs`/`$ref` subset and may emit reference diagnostics/provenance.                                |
| Changed Public diagnostic semantics | Reference-mediated schema diagnostics may add a frozen `parameters.referenceChain`; diagnostics without a reference chain retain their accepted shape. |
| New Public symbols                  | None.                                                                                                                                                  |
| Changed Public signatures           | None; compiler input/result, `FormDefinition`, runtime, operations, Angular and validator port types remain unchanged.                                 |
| Internal                            | Reference indexing, pointer decoding, resolved cursors, target caching, cycle detection and provenance helpers.                                        |
| Unchanged                           | Packages, entry points, export maps, dependencies, versions, publication and Public + Experimental + Active classification.                            |

Any future need to expose or version a resolved graph, resource registry or
resolver callback returns to D-014/D-007 and requires an explicit ADR-009
inventory before a Public contract is drafted.

## 3. Consequences

### Positive

- References gain one explicit, testable boundary before normalization.
- The same schema target can be reused without confusing document and data
  identity.
- Core remains deterministic, descriptor-safe and framework-neutral.
- Public definitions and application-controlled runtime behavior do not change.

### Negative

- The initial subset rejects valid wider Draft 2020-12 reference patterns.
- Diagnostics must preserve two provenance domains plus a reference chain.
- Referenced targets normalize per use site even when resolution metadata is
  shared.
- A future external/dynamic resolver will need a separate design.

## 4. Alternatives rejected

- **Promote all D-007 now:** rejected because applicator, conditional,
  vocabulary and dynamic/external resource semantics are independent decisions.
- **Inline-clone referenced schemas:** rejected because it loses target
  provenance, can execute or retain hostile content and obscures cycles/sharing.
- **Expose a Public resolved AST first:** rejected because no consumer requires
  that compatibility surface; D-041 can prove the Internal responsibility.
- **Resolve in Angular or a validator adapter:** rejected because normalized UI
  derivation belongs to core and the validator must retain the original schema.
- **Fetch URI references automatically:** rejected because identifiers are not
  necessarily network locators and network policy is outside the pure compiler.

## 5. Deferred and unchanged boundaries

D-007 remains Deferred for `$id`, anchors, `$dynamicRef`, external resources,
registries/callbacks, `allOf`/`anyOf`/`oneOf`/`not`, conditionals,
`dependentSchemas`, unevaluated semantics and vocabularies. D-014 remains
Research for a generic/Public AST, model versioning, render plan and
multi-format pipeline.

Recursive UI/data definitions, dynamic `FormDefinition` replacement, new
packages/entry points, dependencies, persistence, publication and Stable
promotion remain inactive.

## 6. Required review before acceptance

ADR-016 was accepted only after repeated complete review confirmed:

1. exact same-document/root-`$defs`/fragment-pointer scope and `$defs` exterior
   order;
2. Draft 2020-12-compatible sibling rejection, `$ref` branch stopping and
   pointer decoding/traversal;
3. descriptor safety, iteration, sharing and cycle behavior;
4. exact target/use-site/reference-chain provenance for schema, UI and policy
   diagnostics;
5. unchanged Public signatures, `FormDefinition` and validator ownership;
6. consistency with ADR-005/009/014 and all accepted SPECs;
7. preservation of D-007/D-014 and every publication/stability boundary; and
8. objective follow-up gates with no implementation authorization.

Every correction required the complete review to repeat until one cycle passed
with zero findings. Ricard accepted ADR-016 formally on 14 July 2026 after
cycle 2 passed. Acceptance authorizes ADR-005 revision 3 only; that revision
must be accepted before drafting SPEC-004. A reviewed and accepted SPEC plus an
approved implementation plan would still be required before code changes.

## 7. Standards references

- [JSON Schema Core Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [RFC 6901: JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901)
