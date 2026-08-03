# SPEC-015: Explicit Schema-Default Candidate

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 3 August 2026
- **Acceptance date:** 3 August 2026
- **Complete review:** [review 271](../reviews/271-spec-015-review.md) cycle 1
  passed all fourteen areas and 21 conformance rows with zero findings
- **Milestone:** M29 — Explicit schema-default candidate
- **Promoted capability:** bounded D-039 selected after
  [review 269](../reviews/269-post-m28-functional-capability-selection.md)
- **Accepted architecture:** [ADR-032 revision 0](../adrs/032-explicit-schema-default-candidate.md)
- **Accepted baselines:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-004 v0.1.1, SPEC-006 v0.1.1 and SPEC-014 v0.1.0
- **Authority:** Accepted observable M29 contract; Approved PLAN-031 revision 0
  authorizes checkpoints 1–6 in order, not dependency, version, release,
  publication, commit, push or external mutation

## 1. Scope

This specification defines one synchronous framework-neutral helper that
derives an immutable-update candidate from explicit primitive `default`
annotations. The application supplies the raw schema and current controlled
root, then decides whether to accept the candidate as `value` and what
`baselineValue` should represent.

The supported schema locations are primitive properties in root/nested object
trees, including accepted pure same-document references and the accepted
disjoint object-`allOf` subset. Arrays and container defaults are opaque
barriers. The contract closes schema/default preflight, presence,
materialization, diagnostics, structural sharing, package evidence and
independent Angular/Standard reference behavior.

No compiler, runtime, operation, validator, renderer or adapter invokes the
helper automatically. All unchanged Accepted contracts and Deferred boundaries
remain authoritative.

## 2. Public neutral contract

Core adds exactly one Public + Experimental + Active root export:

```ts
export function deriveSchemaDefaultCandidate<TData extends object>(
  schema: unknown,
  value: Readonly<TData>,
): ApplyOperationResult<TData>;
```

The existing `ApplyOperationResult<TData>` is reused unchanged:

- success with at least one inserted default returns a new root,
  `changed: true` and the shared frozen empty diagnostic tuple;
- success without an insertion returns the exact input `value`,
  `changed: false` and that same empty tuple;
- failure returns the exact input `value`, `changed: false` and one or more
  frozen normalized diagnostics; and
- the result, diagnostic array, diagnostics, copied paths and parameter
  containers are frozen, while application-owned candidate data is not
  additionally frozen.

The helper retains no schema/value node, descriptor, cursor, path, reference
chain or thrown value. It emits no `FormOperation`, creates no runtime and
adds no method to existing contracts. `FormDefinition`, UI Schema, collection
policies and a validator are intentionally not inputs.

## 3. Processing pipeline and atomicity

One call performs these stages in order:

1. validate the helper input/schema root and dialect;
2. index the accepted root `$defs` exterior;
3. traverse the effective root object in deterministic schema order, resolving
   accepted local references/compositions and collecting supported default
   candidates plus blocking schema/default diagnostics;
4. stop on any schema/default error without inspecting the data root;
5. validate the data root and inspect every reachable managed candidate path
   in effective schema order;
6. stop on any data-inspection error;
7. detect semantic no-effect; and
8. reconstruct one candidate from `value`.

Stages 1–6 complete before reconstruction can expose a candidate. Every
independently inspectable schema/default error is collected in the existing
schema order. Data inspection returns only the first deterministic blocking
data error. A construction failure discards the unreachable partial object.

The helper is synchronous, deterministic and side-effect free. It invokes no
getter, iterator, coercion, validator, text resolver, runtime listener,
renderer or consumer callback; schedules no work; writes nothing to console;
and mutates/freezes neither input.

## 4. Schema traversal boundary

### 4.1 Dialect and root

`schema` must be an ordinary non-array schema object. The canonical Draft
2020-12 URI is accepted. Missing `$schema` assumes Draft 2020-12 without
returning `MISSING_SCHEMA_DIALECT`; invalid or unsupported declarations retain
the exact Accepted blocking dialect diagnostics.

The effective root must satisfy the Accepted ordinary or composed object form.
Input/root/type/properties, local-reference, raw-object-cycle and composition
errors reuse the exact Accepted codes, paths, parameters, fallbacks and
branch-stopping rules from SPEC-001/002/004/014. A direct root `$ref` remains
unsupported.

Accepted ignored annotations and unknown opaque keywords are not returned as
warnings. The helper's successful result contract requires diagnostics to be
exactly empty; applications call `compileFormDefinition()` separately when
they need the complete compiler warning stream. Opaque members are never
traversed for defaults.

### 4.2 Internal effective cursor

Traversal uses an Internal cursor containing the exact source schema object,
immutable `documentPath`, managed use-site `dataPath`, accepted
`referenceChain` where present and active containment/reference cycle
identity. Composition uses the Accepted depth-first contribution order,
disjoint effective property catalog and required/text reduction solely to
derive one unambiguous object tree.

No resolved graph, bundle, schema clone, default AST or composition cursor is
Public. The same referenced target is traversed independently per managed use
site. Diagnostics inside a target retain canonical source paths and the
outermost-to-innermost copied/frozen reference chain.

### 4.3 Nodes inspected

The helper traverses:

- ordinary/composed root and nested object property catalogs;
- pure supported local references reached from those catalogs; and
- primitive string, number, integer and boolean leaves, including accepted
  nullable and primitive-`const` forms.

Object nodes are structural paths only. Their own `default` is metadata-only.
An array node is an opaque terminal barrier: its own default, `items`, existing
items and every descendant default are not inspected or applied. The helper
needs only enough safe classification to identify the accepted array kind; it
does not require or evaluate a collection policy, item identity or item schema.
Root, object, array and item defaults therefore cannot produce a helper
diagnostic merely because they exist.

Semantic shapes that make an inspected object/primitive tree ambiguous or
unsupported fail through their Accepted blocking schema diagnostics. A helper
success does not claim that skipped array subtrees or UI/collection policy
inputs would compile successfully.

## 5. Default-candidate contract

### 5.1 Presence and descriptor

At a supported primitive leaf, `default` is present only when it is an own
enumerable data property. An absent, inherited or non-enumerable member means
no candidate. An own enumerable accessor is invalid and is never invoked.

Every supported default annotation is preflighted regardless of whether the
current data leaf is present. A malformed default therefore fails atomically
instead of becoming value-dependent schema behavior.

### 5.2 Compatible primitive values

The default must match the leaf's Accepted basic domain:

| Effective leaf     | Accepted default                            |
| ------------------ | ------------------------------------------- |
| string             | any exact string                            |
| number             | any finite number                           |
| integer            | any finite integer                          |
| boolean            | `true` or `false`                           |
| nullable primitive | `null` or the corresponding primitive above |

No coercion, parsing, trimming, Unicode normalization, case conversion or
fallback occurs. `-0`, an empty string and `false` remain exact values. `NaN`,
infinities, `undefined`, symbols, bigint, functions, objects and arrays are
incompatible at every supported primitive leaf.

The helper does not evaluate `minimum`, `multipleOf`, string constraints,
`enum`, `const` or `format`. A basic-kind-compatible default that violates
another assertion is still a candidate. Only the application's replaceable
validator decides complete schema validity before or after acceptance.

### 5.3 Default diagnostic

An invalid supported default reuses `INVALID_SCHEMA_KEYWORD_VALUE` with
`severity: 'error'`, `source: 'schema'`, fallback
`Schema keyword "default" has an invalid value.`, exact default-keyword
`documentPath`, managed use-site `dataPath` and accepted reference/template
provenance where applicable.

Parameters are exactly:

```ts
{
  keyword: 'default';
  expected:
    | 'string'
    | 'finite number'
    | 'finite integer'
    | 'boolean'
    | 'string or null'
    | 'finite number or null'
    | 'finite integer or null'
    | 'boolean or null';
  actualType: string;
}
```

An enumerable accessor uses `actualType: 'accessor'`. Other values use the
Accepted safe type description. No incompatible value itself is retained in
parameters. Default diagnostics occur at the leaf's ordinary keyword position
in schema member order; reference/composition traversal preserves its Accepted
depth-first order.

## 6. Data presence and traversal

### 6.1 Root and member safety

The value root must be an ordinary object with `Object.prototype` or null
prototype. A root array, class instance or non-object is invalid.

For every object path needed by at least one candidate, traversal reads only
own descriptors:

- inherited properties are managed-missing;
- an own data property is present, including `undefined`, `null`, `false`,
  `0`, `""` and schema-incompatible data;
- an own accessor is a blocking input error and is never invoked;
- a missing object ancestor remains materializable;
- a present compatible ordinary object is traversed; and
- a present incompatible object value is preserved and stops all candidate
  traversal below that branch without error.

Compatible nested objects have only `Object.prototype` or null prototype.
Arrays, class instances and primitives are incompatible present business data
at an object node. They are never replaced merely to reach a default.

Schema candidate paths are inspected in effective depth-first order. Once an
incompatible ancestor blocks a branch, no descendant value descriptor is read.
Hostile reflection is contained as normalized input failure.

### 6.2 Application rule

A default is inserted only when every object ancestor is missing or compatible
and the primitive terminal is an own-missing property. Any own terminal data
property wins and remains exact. Requiredness does not alter this rule.

A missing object ancestor is created only if at least one descendant default
will be inserted. A missing branch with no applicable insertion remains
missing. A present incompatible ancestor, or a branch whose terminals are all
present, never causes an empty object to be created.

## 7. Data diagnostics

All data diagnostics use `severity: 'error'`, `source: 'runtime'`, no
`documentPath` and frozen safe parameters.

### 7.1 Invalid input

`INVALID_DEFAULT_CANDIDATE_INPUT` has fallback
`Schema-default candidate input is invalid.` and exactly:

```ts
{
  member: 'schema' | 'value';
  expected:
    | 'ordinary schema object'
    | 'ordinary data tree at default-candidate paths';
  reason: 'invalid-value' | 'accessor-member' | 'inspection-failed';
  actualType?: string;
}
```

An invalid schema exterior uses `member: 'schema'`, expected ordinary schema
object and `invalid-value` or `inspection-failed`, without `dataPath`.
Accepted schema-domain diagnostics take over after the exterior is safely
inspectable.

An invalid value root uses `member: 'value'`, expected ordinary data tree and
`invalid-value`, without `dataPath`. A managed accessor uses `member: 'value'`,
reason `accessor-member`, `actualType: 'accessor'` and the exact copied managed
`dataPath`. Reflection failure uses `inspection-failed`, omits `actualType` and
includes `dataPath` only when a safe current path is already known. No actual
object, prototype, descriptor or trap result is retained.

### 7.2 Reconstruction failure

`DEFAULT_CANDIDATE_FAILED` has fallback
`Schema-default candidate construction failed.` and exactly:

```ts
{
  reason: 'inspection-failed' | 'clone-failed';
  path?: readonly string[];
}
```

`path`, when safely known, is copied/frozen and also used as `dataPath`.
Neither exception nor partial candidate is retained. This diagnostic is
reserved for a hostile object that changes behavior after preflight or an
expected descriptor/clone construction failure.

## 8. Reconstruction and structural sharing

Reconstruction starts only after complete preflight. Candidates are applied in
effective schema depth-first order, but the final data is independent of
implementation work-stack order.

For every applicable missing primitive leaf:

1. clone each existing compatible object on its root-to-leaf chain at most once;
2. create every missing ancestor as an ordinary `Object.prototype` object;
3. define ancestor links and the terminal as writable, enumerable,
   configurable own data properties; and
4. copy the exact compatible primitive default by value.

Cloning preserves the existing object's prototype and every off-path own
property descriptor, including symbols and non-enumerable members. Unmanaged
and present managed members keep exact references/descriptors. Several defaults
sharing an ancestor share one cloned/created candidate branch.

No insertion returns the exact root. Any insertion returns a new root even if
an equal primitive appears elsewhere. Inputs are not mutated, recursively
cloned, deep-frozen or retained. The helper does not prune empty objects.

## 9. Runtime, validation and application ownership

`compileFormDefinition()` continues to omit defaults from `FormDefinition` and
never applies them. Runtime creation/update, renderer projection, clear/null,
scenario reset, locale changes, sync/async validation and baseline confirmation
never invoke this helper.

The helper never invokes `SchemaValidator`, Ajv or asynchronous validation.
An application may validate the successful candidate and then either discard
it or supply it as controlled `value`. It separately chooses whether an entity
creation baseline is the original root, the accepted candidate or another
application-owned value. Passing an accepted candidate to an existing runtime
uses normal `updateExternalState()` behavior and can change dirty/validation;
the helper itself changes no runtime state.

## 10. Public/Internal and package inventory

| Classification         | Exact effect                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New Public core        | `deriveSchemaDefaultCandidate()` root export with section 2 signature; Public + Experimental + Active                                                  |
| Reused Public core     | `ApplyOperationResult<TData>` and `Diagnostic` unchanged                                                                                               |
| New Public diagnostics | Codes `INVALID_DEFAULT_CANDIDATE_INPUT` and `DEFAULT_CANDIDATE_FAILED`; helper-specific reuse of `INVALID_SCHEMA_KEYWORD_VALUE` for supported defaults |
| Internal               | Default candidates, effective traversal/provenance, preflight and immutable reconstruction                                                             |
| Changed adapters       | None                                                                                                                                                   |
| Unchanged              | Compiler signature/definition, runtime, operations, validators, UI Schema, packages, entry points, export maps, dependencies, versions and stability   |

Package declarations must expose the new function only from the existing core
root. Deep imports remain unsupported. Package smoke, built-package, clean
consumer and isolated-source reconstruction must prove the exact signature,
success/no-effect/failure results and absence of export/dependency drift.

## 11. Reference-consumer evidence

The shared private scenario catalog will add one authored M29 entity-creation
scenario containing at least:

- missing root and nested primitive leaves with compatible defaults;
- present `false`, `0`, empty-string and nullable values that must survive;
- one referenced default and one default contributed through object `allOf`;
- a missing object ancestor that is materialized;
- an array/container default and item default that remain untouched; and
- one basic-kind-compatible default that can be validated independently.

Angular and Standard consume the same schema/value but each imports the core
helper directly and owns its candidate UI state. Each must demonstrate:

1. derivation does not alter the displayed controlled value;
2. explicit acceptance supplies the candidate as application-owned value;
3. cancellation discards the candidate and preserves the original root;
4. repeated derivation after acceptance is a no-effect;
5. preserved presence, nested materialization and array barriers are visible;
6. sync validation receives only values the application explicitly accepts;
7. no runtime operation is emitted by derivation; and
8. accessible controls and observable evidence use the existing reference
   shell conventions without a framework-specific helper.

The two projections need behavioral parity, not shared renderer/DOM code.

## 12. Conformance matrix

A future implementation plan must map focused fixtures/tests for at least:

1. exact Public signature, frozen result/diagnostics and no retained inputs;
2. canonical/missing/invalid/unsupported dialect and invalid schema exterior;
3. ordinary root/nested primitive defaults in property order;
4. nullable primitive defaults including `null`;
5. primitive `const`, enum, format and other assertions remaining validator-owned;
6. absent/inherited/non-enumerable/data/accessor default descriptors;
7. every compatible primitive plus NaN/infinity/undefined/symbol/bigint/function/object/array incompatibility;
8. root, object, array, item and below-array defaults remaining opaque;
9. pure local references, repeated target use, chains, failures and cycles;
10. root/nested/reference object composition and deterministic contribution order;
11. composition duplicate/conflict/exterior failures and no partial candidate;
12. missing/present object ancestors and present incompatible branch barriers;
13. terminal missing versus undefined/null/false/zero/empty/incompatible presence;
14. required and optional leaves using identical presence semantics;
15. shared ancestor materialization and multiple independent default paths;
16. root/accessor/reflection/clone failures with exact atomic diagnostics;
17. schema errors before data inspection and deterministic error collection/order;
18. no-effect identity and changed-path structural sharing/descriptors/prototypes;
19. no compiler/runtime/validator/async/operation/baseline implicit invocation;
20. declarations, root exports, package/clean/source consumers and dependency invariance; and
21. one shared scenario with independent Angular/Standard derivation, cancel,
    acceptance, validation, no-effect and accessibility evidence.

## 13. Explicit exclusions

Root/object/array/item defaults, descendants below arrays, collection factories
or identity generation, conditional/dynamic/expression/server defaults,
automatic initialization, reset-to-default, UI Schema defaults, validator
mutation, callback validation, runtime methods, renderer actions, adapter
wrappers, operation batches, persistence, submit, HTTP, autosave, optimistic
projection, dynamic definitions, wider references/composition, a Public AST,
new packages/entry points/dependencies, React/Vue, versioning, Stable promotion,
release and publication remain outside M29.

## 14. Acceptance criteria

SPEC-015 was accepted only after confirming:

1. every observable rule is consistent with ADR-032 and all Accepted baselines;
2. Public signature/result ownership and application acceptance are exact;
3. schema traversal/default locations and array barriers are closed;
4. default compatibility and external-validator ownership are unambiguous;
5. schema/data diagnostics, parameters, paths, provenance, ordering and
   atomicity map directly to the conformance matrix;
6. presence, materialization and incompatible-ancestor behavior are exact;
7. structural sharing, descriptors, prototypes and hostile input are complete;
8. compiler/runtime/async/baseline/adapter boundaries remain unchanged;
9. Public/Internal/package and independent reference evidence are complete;
10. every Deferred and later-gate boundary is preserved;
11. no plan or code is prepared before acceptance; and
12. a complete review repeats after every correction until one pass has zero
    findings and no documentation conflict.

Review 271 cycle 1 passed all fourteen areas and 21 conformance rows with zero
findings and no unresolved change request. Under the authorized
zero-finding/no-scope-expansion rule, SPEC-015 v0.1.0 is Accepted. Acceptance
authorizes only preparation and complete review of PLAN-031; explicit plan
approval remains required before implementation.

## 15. Standards reference

- [JSON Schema Draft 2020-12 validation — `default` annotation](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-9.2)

## 16. History

| Version | Date       | Change                                                |
| ------- | ---------- | ----------------------------------------------------- |
| 0.1.0   | 03-08-2026 | Initial Draft after acceptance of ADR-032 revision 0. |
