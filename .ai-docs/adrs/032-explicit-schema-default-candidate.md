# ADR 032: Explicit schema-default candidate derivation

- **State:** Accepted revision 0
- **Date:** 2026-08-03
- **Acceptance date:** 2026-08-03
- **Complete review:** [Review 270](../reviews/270-adr-032-review.md) cycle 2
  passed all fourteen areas with zero findings
- **Milestone:** M29 — Explicit schema-default candidate
- **Promotes:** only the bounded D-039 architecture question recommended by
  [review 269](../reviews/269-post-m28-functional-capability-selection.md) and
  selected by Ricard on 2026-08-03
- **Requires:** Accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-006 v0.1.1 and SPEC-014 v0.1.0; ADR-005
  revision 7, ADR-009, ADR-014 revision 2, ADR-015 revision 4, ADR-016,
  ADR-019 revision 1, ADR-028 and ADR-031
- **Authority:** Accepted M29 architecture only; authorizes preparation and
  complete review of the now-Accepted SPEC-015; SPEC-015 authorizes PLAN-031
  preparation/review only, not plan approval, implementation, dependency,
  version, release, publication, commit, push or external mutation

## 1. Context

Schema Engine recognizes `default` as Draft 2020-12 metadata but deliberately
does not copy it into `FormDefinition`, mutate controlled values or select it
while rendering. Consumers that create an entity must currently reproduce
schema traversal, missing-presence rules, local-reference resolution and
bounded object-composition handling merely to offer an explicit “use schema
defaults” action.

M27 established a useful ownership pattern: core may derive an immutable
candidate while the application remains the only authority that accepts it.
M28 makes deterministic traversal possible across same-document references and
the accepted disjoint object-`allOf` subset. Neither milestone decides default
semantics, and JSON Schema itself treats `default` as an annotation rather than
an assertion or mutation instruction.

Review 269 recommended a design-first D-039 slice only if core entity creation
was selected as the product priority. Ricard selected that direction on
2026-08-03. This ADR decides the smallest useful object-creation boundary
before any observable contract or implementation is drafted.

## 2. Decision

### 2.1 One explicit pure core helper

M29 will introduce exactly one Public + Experimental + Active root helper,
subject to a later Accepted SPEC:

```ts
export function deriveSchemaDefaultCandidate<TData extends object>(
  schema: unknown,
  value: Readonly<TData>,
): ApplyOperationResult<TData>;
```

The helper is synchronous, deterministic and side-effect free. Its successful
`value` is a candidate controlled root; `changed` reports whether that root
differs by identity from the input. A successful no-effect returns the exact
input reference. Failure is atomic, returns the exact input reference with
`changed: false` and exposes normalized diagnostics.

Calling the helper never means that a default has been accepted. The
application explicitly decides whether to use the candidate as `value`, and
independently decides the initial or later `baselineValue`. Core never persists,
submits or publishes the candidate and retains no input schema, value, cursor,
path or diagnostic source object.

No runtime method, renderer action, Angular/Standard wrapper, new package,
entry point, options contract or result type is introduced. Reusing
`ApplyOperationResult<TData>` does not classify the derivation as a
`FormOperation`; no operation is built or emitted.

### 2.2 Raw schema input, Internal effective cursor

The Public source of default annotations is the exact raw schema supplied by
the application. `FormDefinition` is intentionally not an input: it omits
defaults by contract, a manually assembled definition cannot prove relation to
a schema, and exposing defaults there would make renderers and runtime
consumers carry initialization metadata they do not own.

Internally, the helper reuses the accepted descriptor-safe schema
classification, same-document reference resolution and static object
composition responsibilities. Default derivation consumes an Internal
effective cursor carrying exact source `documentPath`, managed `dataPath`,
`referenceChain` where applicable and existing containment/reference cycle
identity. It does not expose, retain or version a resolved graph, bundled
schema, composition AST or Public cursor.

The helper does not call `compileFormDefinition()` as an observable nested
operation and does not fabricate UI Schema or collection policies. Shared
Internal traversal may be refactored, but compiler diagnostics/order and helper
diagnostics/order remain separately specified Public behavior.

The helper accepts only the canonical Draft 2020-12 dialect and the accepted
closed object/reference/composition shapes needed to derive its managed object
tree. A missing `$schema` uses the accepted dialect assumption. Unsupported or
ambiguous semantic shapes that could change that tree fail closed; accepted
ignored/unknown annotations remain opaque. Because
`ApplyOperationResult.success` has an exact empty diagnostic tuple, the helper
does not replay non-blocking compiler warnings such as missing dialect,
ignored annotations or unknown keywords. Applications compile separately when
they need the full definition and compiler diagnostic stream.

### 2.3 Closed supported locations

The first M29 slice derives defaults only for managed primitive property leaves
under the accepted object tree:

- direct root primitive properties;
- primitive descendants of inline nested objects;
- the same positions reached through accepted pure local `$ref`; and
- disjoint primitive properties contributed through accepted object `allOf`,
  including nested/reference-mediated compositions.

The effective leaf may be string, number, integer or boolean, including an
accepted nullable primitive and an accepted primitive `const`. Required and
optional leaves use the same default-presence rule. Local-reference and
composition reuse never changes the managed use-site path; source provenance
continues to identify the annotation's exact target or branch.

M29 does not apply a `default` declared on the root, an object node, an array,
an array item template or any descendant below an array. Arrays are opaque
barriers for default derivation: the helper neither creates a missing array nor
visits existing items. Those annotations retain metadata-only behavior and do
not fail merely because they are outside this slice.

Object-valued and array-valued defaults are therefore not copied or interpreted
in M29. Wider container defaults, per-item initialization and collection
factories remain D-039 Deferred follow-up.

### 2.4 Default annotation admissibility

A supported leaf candidate exists only when `default` is an own enumerable
data property. Absence, inheritance or a non-enumerable own member means no
candidate. An enumerable accessor is structurally invalid and no accessor is
executed.

The annotation value must satisfy the accepted basic domain kind of its
effective leaf:

- string requires a string;
- number requires a finite number;
- integer requires a finite integer;
- boolean requires a boolean; and
- nullable additionally permits `null`.

No coercion, parsing, trimming, case conversion or fallback occurs. A
compatible primitive is copied by value. The helper does not evaluate
`minimum`, `pattern`, `enum`, `const`, `format` or another assertion and does
not claim that the candidate validates the complete schema. In particular, a
basic-kind-compatible default that conflicts with another assertion remains an
explicit candidate; the application can use its chosen `SchemaValidator`
before accepting it. This preserves replaceable validation rather than making
the helper a second validator.

An enumerable accessor or basic-kind-incompatible value at a supported leaf is
a blocking default-derivation diagnostic. All independently
inspectable supported annotations are preflighted before reconstruction, so
one malformed candidate cannot yield a partially defaulted root. A later SPEC
must close exact codes, parameters, fallback messages, provenance, collection
order and stopping behavior without retaining annotation values or thrown
objects.

### 2.5 Presence and missing-object materialization

The input value root must be an ordinary object with `Object.prototype` or a
null prototype. A root array, class instance, accessor-dependent reflection or
hostile reflection/construction failure produces normalized atomic failure.

Defaults apply only to missing own properties. Every own data property counts
as present and is preserved exactly, including `null`, `false`, `0`, `""` and
an incompatible business value. An own accessor at an inspected managed path
is unsupported and fails atomically; inherited properties do not establish
managed presence.

For a missing primitive leaf, the candidate writes its compatible default. A
missing object ancestor is materialized only when at least one supported
descendant default will actually be written. If an object ancestor is present
as an own data property with `null`, a primitive, an array or another
incompatible value, that value is preserved and its descendants are not
defaulted. Existing presence always wins; the helper never replaces a present
branch in order to reach a default.

Materialization is bottom-up and deterministic. A missing object branch with
no applicable descendant default remains missing. `required` does not itself
create a value, and the helper never invents an empty object solely because a
schema node exists.

### 2.6 Atomic reconstruction and structural sharing

After schema/default and value preflight succeeds, reconstruction clones only
the changed ancestor chain for each written leaf. It preserves:

- the exact root on no-effect or failure;
- off-path object references and every present managed value;
- unmanaged members, symbols, prototypes, non-enumerable properties and data
  descriptors on existing objects; and
- deterministic schema property/contribution order when creating new managed
  branches.

New missing object ancestors use the nearest schema-managed source object's
accepted ordinary prototype policy: `Object.prototype` for absent data
branches. Newly written managed members are ordinary writable, enumerable and
configurable data properties. No caller object or schema node is mutated,
deep-frozen or recursively cloned. Expected reflection/construction failures
are contained as normalized atomic failure.

If several missing leaves share an ancestor, that ancestor is cloned or
created once in the final candidate. Reconstruction order cannot change the
candidate or diagnostics.

### 2.7 Runtime, validator and adapter ownership

Compilation continues to treat `default` as metadata and does not copy it to
`FormDefinition`. Creating or updating a runtime, rendering a field, clearing a
field, resetting a scenario, changing locale, validating synchronously or
asynchronously and confirming a baseline never invoke the helper implicitly.

The helper itself never invokes `SchemaValidator`, Ajv, asynchronous
validators, text resolution or consumer callbacks. If an application accepts
the candidate into an existing runtime, it does so through the existing
controlled external-state path; ordinary validation and dirty behavior then
follow from that application-owned update.

Angular and Standard reference applications may demonstrate the same explicit
creation action by importing the core helper directly. They must prove
independently that missing defaults appear only after application acceptance,
present falsy/empty/null values survive, missing object ancestors are created
only as needed, local references/composition retain provenance, arrays remain
untouched and cancellation preserves the original root.

## 3. Consequences

### Positive

- Consumers share one neutral, deterministic entity-initialization primitive.
- Controlled value/baseline ownership and replaceable validation remain intact.
- Defaults work through the already accepted local-reference and static-object
  composition subset without exposing compiler internals.
- Presence semantics prevent accidental overwrites of falsy, empty, null or
  otherwise incompatible existing data.
- The first slice avoids ambiguous container and collection initialization.

### Negative

- Applications must explicitly adopt and, when needed, validate the candidate.
- Valid schemas with object/array defaults or per-item defaults receive no M29
  derivation behavior.
- A default can be basic-kind-compatible yet fail another schema assertion;
  core deliberately does not duplicate validator authority.
- Sharing the Internal traversal without coupling compiler and helper
  diagnostics requires careful separation and conformance coverage.

## 4. Rejected alternatives

- **Apply defaults during compilation/runtime creation:** would silently mutate
  application-owned controlled state and make rendering select domain data.
- **Enable Ajv `useDefaults`:** delegates mutation to one replaceable validator,
  changes input during validation and makes behavior adapter-specific.
- **Copy defaults into `FormDefinition`:** exposes initialization metadata to
  renderers and still loses raw source/reference provenance.
- **Accept a Public resolved/composed AST:** creates a compatibility surface no
  current consumer needs; D-014 remains Research.
- **Overwrite present incompatible containers:** violates the exact presence
  rule and can destroy application data merely to reach a descendant default.
- **Create arrays or initialize existing items:** needs item factory, identity,
  insertion and repeated-application semantics beyond the selected slice.
- **Validate the whole candidate inside the helper:** hard-codes validation
  ownership and would make a pure annotation helper depend on a validator
  integration or callback.
- **Return only a patch/operation batch:** batch semantics remain Deferred and
  application acceptance still needs atomic reconstruction.

## 5. Deferred and unchanged boundaries

Remaining D-039 includes root/object/array defaults, array-item defaults,
collection factories/identity generation, dynamic/conditional defaults,
default expressions, server defaults and asynchronous lookup. D-007 retains
all unsupported composition/reference/resource forms. D-013 retains dynamic
definition replacement and D-021 retains batches/transactions.

No UI Schema default, renderer-owned default, automatic reset-to-default,
baseline mutation, persistence, submit, HTTP, autosave, optimistic projection,
validator mutation, new adapter, UI kit, package, entry point, dependency,
version, Stable promotion, release or publication is activated.

## 6. Public/Internal inventory and follow-up gate

Under ADR-009, the proposed migration is:

| Classification      | Exact effect                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| New Public core     | Root export `deriveSchemaDefaultCandidate()` with the signature in section 2.1; Public + Experimental + Active                     |
| Reused Public core  | `ApplyOperationResult<TData>` and `Diagnostic`                                                                                     |
| Changed Public core | None until the later SPEC is Accepted                                                                                              |
| Internal            | Default annotation candidates, effective object traversal, provenance/preflight and immutable reconstruction                       |
| Changed adapters    | None; reference applications may consume the same root helper directly                                                             |
| Unchanged           | Runtime, operations, validators, definitions, UI Schema, packages, entry points, export maps, dependencies, versions and stability |

Acceptance of this ADR authorizes only preparation and complete review of a
dedicated M29 extension SPEC. That SPEC must close the exact algorithm,
diagnostics, hostile-input matrix, reference/composition provenance,
structural-sharing guarantees, conformance fixtures, package evidence and two
independent reference-consumer expectations without widening this inventory.
Implementation requires a separately Approved plan.

Any need for a new Public type, container/array default behavior, validator
callback, runtime action, adapter wrapper, schema/definition pairing contract
or automatic acceptance stops M29 for a new architectural decision.

## 7. Required review before acceptance

ADR-032 may be accepted only after a complete repeated review passes with zero
findings for:

1. the exact selected D-039/M29 boundary and every explicit exclusion;
2. one pure Public helper and application-owned acceptance/value/baseline;
3. raw-schema Public authority and Internal resolved/composed cursor boundary;
4. root/nested/reference/composition primitive-leaf locations;
5. array/container barriers and remaining D-039 separation;
6. descriptor-safe default admissibility and external-validator authority;
7. exact own-presence handling for null/falsy/empty/incompatible values;
8. missing-object materialization without empty-container invention;
9. atomic failure, provenance, stopping and diagnostic follow-up closure;
10. structural sharing, descriptors, prototypes and no retained/mutated input;
11. runtime, async, baseline, Angular and Standard ownership invariants;
12. ADR-009 Public/Internal inventory and package/dependency invariance;
13. consistency with ADR-005/014/015/016/019/028/031 and Accepted SPECs; and
14. objective follow-up gates with no SPEC, implementation, release or Git
    authorization.

Every correction required another complete review. Review 270 cycle 2 passed
all fourteen areas with zero findings and no unresolved change request. Under
the previously authorized zero-finding/no-scope-expansion rule, ADR-032
revision 0 is Accepted; only preparation and complete review of SPEC-015 are
authorized.

## 8. Standards reference

- [JSON Schema Draft 2020-12 validation — `default` annotation](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-9.2)
