# M11 resolved-schema promotion-readiness review

- **State:** Accepted; recommendation formally approved by Ricard
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Reviewed:** D-014 and D-007 restart conditions, accepted SPEC-001/002/003,
  ADR-005 revision 2, ADR-009, ADR-014 revision 2, current compiler contracts
  and completed M9/M10 evidence
- **Current register state:** D-041 is Promoted for narrow normative design;
  D-014 remains Research and D-007 remains Deferred outside that slice

## 1. Result

D-014 is ready for a narrow promotion decision because its restart condition is
satisfied by the implemented normalized object/collection trees. The current
compiler also provides concrete evidence: dialect inspection, schema traversal
and `FormDefinition` normalization currently happen in one direct pipeline, so
adding references there without an explicit resolution boundary would mix
resource identity, dereferencing, provenance and UI derivation.

D-007 is not ready for wholesale promotion. ADR-005 fixes Draft 2020-12, but
the register also requires an existing schema-resolution layer, which the
repository does not have. Composition, conditionals and vocabulary semantics
therefore remain premature.

The recommendation is to split out one new narrow capability for M11 rather
than changing either current status silently.

## 2. Recommended M11 boundary

The first M11 slice should be limited to:

1. the existing Draft 2020-12 dialect only;
2. one schema document and its root resource;
3. `$defs` plus static fragment-only `$ref` using JSON Pointer within that same
   document;
4. a pure, descriptor-safe, iterative Internal resolution phase before current
   `FormDefinition` normalization;
5. immutable resolution output with exact source provenance and deterministic
   missing-target, malformed-pointer and reference-cycle diagnostics;
6. unchanged Public `compileFormDefinition()` input/result and unchanged
   normalized `FormDefinition` contracts unless a later accepted ADR proves a
   Public delta necessary; and
7. delivery of the original unmodified schema to `SchemaValidator`.

The slice needs references as concrete evidence for the resolution boundary;
an abstract AST with no supported consumer would not justify a new model.

## 3. Explicit exclusions

The promotion must leave these inactive:

- external documents, network retrieval, registries and resolver callbacks;
- `$id`, `$anchor`, `$dynamicAnchor`, `$dynamicRef` and non-fragment URI
  references;
- `allOf`, `anyOf`, `oneOf`, `not`, `if/then/else`, `dependentSchemas` and
  unevaluated semantics;
- custom vocabularies or dialects;
- recursive UI/data structures, dynamic `FormDefinition` replacement and
  runtime schema evaluation;
- a Public/versioned generic AST, render plan or multi-format pipeline;
- new packages/entry points, persistence, publication or Stable promotion.

These exclusions are material. Draft 2020-12 treats `$ref` as a URI-reference
applicator, permits siblings alongside it and distinguishes static `$ref` from
runtime-sensitive `$dynamicRef`. Supporting the wider family would require
resource/base-URI and evaluation decisions beyond a local static slice.

## 4. Questions the ADR must close

1. **Reference-object siblings:** whether the narrow subset rejects every
   semantic sibling of `$ref` or supports a precisely closed annotation subset.
2. **Diagnostic provenance:** how reference location, resolved target location
   and reference chain appear without changing existing diagnostic envelopes
   silently.
3. **Cycles and sharing:** reference cycles should be rejected for the finite UI
   definition while repeated acyclic references may share resolution nodes but
   must still normalize independently by managed data path.
4. **Public/Internal boundary:** the default recommendation is Internal resolved
   representation and unchanged Public `FormDefinition`; any Public model or
   version requires explicit ADR-009 inventory and compatibility rationale.

## 5. Promotion recommendation

Do not promote D-007 as a whole. Formally decide whether to create a separate
deferred identifier for “same-document static JSON Schema reference
resolution” and promote that identifier together with the narrow remaining
D-014 responsibility into M11 normative design.

Following acceptance, the next document is ADR-016. It must decide the
resolution/provenance/Public-Internal model before any SPEC or implementation
plan is drafted. D-007 remains Deferred for composition, conditionals,
dynamic/external references and vocabularies.

## 6. Primary standards checked

- [JSON Schema Draft 2020-12 Core](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [JSON Schema Draft 2020-12 overview](https://json-schema.org/draft/2020-12)

## 7. Acceptance gate

Ricard explicitly accepted the split on 14 July 2026. Acceptance creates and
promotes only D-041 for narrow normative M11 design and authorizes drafting
ADR-016. D-014 remains Research for its generic remainder and D-007 remains
Deferred outside D-041. No implementation, Public contract, dependency,
package or publication action is authorized.
