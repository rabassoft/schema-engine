# SPEC-013: Scope-to-Baseline Confirmation

- **State:** Accepted
- **Version:** 0.1.1
- **Date:** 2 August 2026
- **Acceptance date:** 2 August 2026
- **Milestone:** M27 — Scope-to-baseline confirmation
- **Promoted capability:** bounded D-038 selected by
  [review 245](../reviews/245-d038-m27-scope-baseline-promotion-readiness.md)
- **Accepted architecture:** ADR-030 revision 0, coordinated with ADR-009,
  ADR-014 revision 2, ADR-015 revision 4 and ADR-029
- **Accepted baselines:** SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2 and SPEC-012 v0.1.0
- **Complete reviews:** [review 247](../reviews/247-spec-013-review.md) cycle 3
  passed v0.1.0 with zero findings; [review 250](../reviews/250-spec-013-revision-1-review.md)
  cycle 1 passed the complete corrected v0.1.1 with zero findings
- **Authority:** Accepted observable M27 extension; authorizes PLAN-029
  preparation/review only, not plan approval, implementation, dependency,
  version, release, publication, commit or push

## 1. Scope

This specification defines one synchronous, framework-neutral utility that
constructs an immutable-update candidate for an application-owned baseline. It
confirms exactly the managed data selected by one existing `FormScope` while
leaving persistence success, storage and the decision to call
`updateExternalState()` to the application.

The utility covers accepted root primitive/object nodes, nested objects,
homogeneous object collections, stable item addresses and stable item-node
addresses. It closes input validation, target normalization, missing and
incompatible data, collection structure, diagnostics, structural sharing,
package evidence and reference-consumer behavior.

It does not add a runtime method or save operation. All unchanged compiler,
runtime, validation, renderer, adapter, package and Deferred rules remain
authoritative.

## 2. Public neutral contract

Core adds exactly one Public + Experimental + Active root export:

```ts
export function commitScopeToBaseline<TData extends object>(
  definition: FormDefinition,
  baselineValue: Readonly<TData>,
  currentValue: Readonly<TData>,
  scope: FormScope,
): ApplyOperationResult<TData>;
```

The existing `ApplyOperationResult<TData>` is reused unchanged. Its `value`
member is the baseline candidate:

- success with an observable managed change returns a new root and
  `changed: true`;
- success with no managed change returns the exact `baselineValue` reference
  and `changed: false`;
- every success uses the existing shared frozen empty diagnostic tuple;
- failure returns the exact `baselineValue`, `changed: false` and one or more
  frozen normalized diagnostics; and
- the result object, diagnostic array, diagnostics, copied diagnostic paths and
  parameter containers are frozen, but the application-owned candidate data is
  never additionally frozen or thawed by this helper.

The helper retains no scope, path, address, descriptor or mutable input
container. Primitive and incompatible terminal values may be borrowed by exact
reference, as accepted operation helpers already do. The application must
continue treating both roots and any accepted candidate immutably.

No other core or Angular contract changes transitively. In particular,
`FormRuntime`, `ExternalStateUpdate`, `FormOperation`, validators, snapshots,
renderers and `SchemaFormDirective` gain no member.

## 3. Processing order and atomic boundary

One call performs these stages in order:

1. validate the complete `FormDefinition`;
2. inspect the complete baseline managed tree in definition depth-first order;
3. inspect the complete current managed tree in definition depth-first order;
4. parse the `FormScope` exterior and every target in caller order;
5. resolve target availability and collection identity in caller order;
6. canonicalize valid overlaps and sort the effective target set;
7. detect semantic no-effect; and
8. construct one candidate from `baselineValue`.

Stages 1–5 finish before stage 8 can expose a candidate. Any failure in those
stages returns the exact baseline; a valid earlier target is never applied
partially. Construction also catches expected reflective or clone failures and
discards any unreachable partial object.

The helper is synchronous, deterministic and side-effect free. It invokes no
getter, validator, text resolver, runtime listener, renderer or application
callback; emits no operation; schedules no job; writes nothing to console; and
does not mutate or freeze either input root.

## 4. Definition and managed-tree safety

### 4.1 Definition

The complete definition must satisfy the accepted recursive and collection
manual-definition invariants, including node/field projections, paths,
templates, identities, presentation ownership and fixed-field compatibility.
Validation uses the existing `collectCollectionFormDefinitionDefects()`
catalog and order.

Each defect produces the existing `INVALID_FORM_DEFINITION` diagnostic with
`severity: 'error'`, `source: 'runtime'`, no `documentPath`, no `dataPath`,
fallback `Form definition is invalid.`, and the exact existing safe defect
parameters. All definition defects are returned in their accepted deterministic
order; later stages do not run.

### 4.2 Root and managed-member inspection

Both roots must be ordinary objects with `Object.prototype` or `null`
prototype. Inspection order is baseline before current; within each root it is
root definition order, depth-first children, collection index ascending and
item-template depth-first order.

Every reached managed property and array index is read only through own
descriptors. Missing and own data members are accepted. Accessors are rejected
without invoking their getter. Missing/incompatible object or array nodes stop
inspection only below that branch. An incompatible own data value is accepted
business data, not an input-shape failure.

For an accessible array, dense item slots and identity properties are inspected
before managed item descendants. Identity-invalid data retains its accepted
first-failure state and stops descendant inspection for that collection; it is
not a root-shape failure unless a later selected target requires that
collection. An accessor array slot is an invalid identity state, while an
accessor on an accessible managed descendant is a blocking root-shape failure,
matching SPEC-003.

Reflection operations are guarded. A throwing `getPrototypeOf`, own-descriptor
or other required inspection trap becomes normalized failure and is never
exposed. Cyclic or shared data objects cannot cause recursive traversal:
iterative work follows every definition path independently and is bounded by
definition depth plus the accepted collection lengths, without a global
identity guard that could skip an aliased managed path.

## 5. Scope exterior and target parsing

### 5.1 Scope exterior

`scope` must be an ordinary object with:

- an own data `id` containing a non-empty string;
- an own data `paths` containing an array; and
- an absent or own data `includeGlobalIssues` containing a boolean.

Inherited members are absent. Accessors are never invoked. Extra own members
are ignored. A valid empty `paths` array is a successful no-effect after the
preceding definition/root checks. `includeGlobalIssues` never selects data and
has no candidate effect.

### 5.2 Static paths

An array target is parsed only as `DataPath`. It must be non-empty, dense and
contain only own data string segments. A numeric segment is rejected even
though `DataPath` retains its wider Public type. The copied path must resolve to
one exact normalized root `FormNodeDefinition`.

A primitive path selects that leaf. An object path selects the object's own
presence and complete managed descendant tree. An array path selects the
collection presence, identity structure and complete managed item projection.
No path can select the form root.

### 5.3 Stable addresses

An ordinary-object target is parsed using the accepted own-member rules:

- own `collectionPath` must be a non-empty dense string-only path;
- own `itemId` must be a non-blank exact string;
- absence of own `relativePath` produces `CollectionItemAddress`; and
- presence of own `relativePath` requires a dense string-only array, where an
  empty array is equivalent to the item address.

Inherited address members are absent and extra own members are ignored. An own
accessor member is invalid and never invoked. The copied collection path must
resolve to one `ArrayNodeDefinition`. A non-empty relative path must resolve to
one exact object or primitive node in that array's item template. The identity
property is not a template node and receives the explicit
`identity-target-not-editable` failure reason rather than becoming an
unmanaged target.

An item address selects all managed descendants of that exact identity but not
collection presence/order. A non-empty node address selects its exact relative
node under the ordinary object/primitive rules. Stable addresses never become
numeric paths and caller object identity never participates.

## 6. Availability and overlap

### 6.1 Static target availability

Missing ordinary-object ancestors mean the selected static target is
effectively absent and remain confirmable. A compatible current ancestor and a
missing baseline ancestor permit materialization. An incompatible current or
baseline ancestor above a narrower selected target makes it unconfirmable.

Selecting an incompatible object or array node itself remains valid and
confirms that exact business value. Selecting a primitive leaf also permits any
own data terminal value without applying schema validation.

### 6.2 Stable target availability

For item/node addresses, both current and baseline collection nodes must be
present compatible arrays with valid unique identities. The addressed ID must
exist exactly once on both sides. A node address must additionally resolve its
managed relative template node; its item ancestors follow section 6.1.

Missing/incompatible collections, invalid identities, current-only IDs,
baseline-only IDs and removed IDs fail atomically. Stable partial targets never
materialize a collection or item and never insert, remove or move an identity.

### 6.3 Canonical overlap

Every original target is parsed and resolved before overlap elimination, so a
valid ancestor never hides an invalid descendant target. Valid duplicates and
overlaps emit no diagnostic. The effective set retains only the broadest
selection:

- a static object path dominates its static managed descendants;
- a static array path dominates every address in that collection;
- an item address dominates node addresses for the same collection/ID; and
- an object node address dominates its relative descendants for the same
  collection/ID.

Independent targets are applied in canonical definition depth-first order.
Stable targets for one collection use baseline item order, then item-template
depth-first order. Output data, descriptors, diagnostics and reference-sharing
guarantees are therefore independent of caller target order.

## 7. Diagnostics

All new diagnostics use `severity: 'error'`, `source: 'runtime'`, no
`documentPath` and the exact frozen safe parameters below. `actualType` and
optional primitive `actualValue` use the accepted safe value description; no
object, item, prototype, descriptor, trap, thrown value or payload is retained.

### 7.1 Invalid confirmation input

`INVALID_BASELINE_CONFIRMATION` has fallback
`Baseline confirmation input is invalid.`

For a root failure:

```ts
{
  member: 'baselineValue' | 'currentValue';
  expected: 'ordinary data tree at managed paths';
  reason: 'invalid-value' | 'accessor-member' | 'inspection-failed';
  propertyReason?: 'accessor';
  actualType?: string;
  actualValue?: string | number | boolean | null;
}
```

`propertyReason` and `dataPath` exist only for `accessor-member`, with
`dataPath` equal to the first offending managed positional path. Safe actual
description exists only for `invalid-value`. `inspection-failed` exposes no
path or actual description.

For a scope-exterior failure:

```ts
{
  member: 'scope';
  scopeMember?: 'id' | 'paths' | 'includeGlobalIssues';
  expected: 'valid FormScope';
  reason:
    | 'missing-member'
    | 'accessor-member'
    | 'invalid-value'
    | 'inspection-failed';
  actualType?: string;
  actualValue?: string | number | boolean | null;
}
```

`scopeMember` identifies a safely inspected member failure and is absent when
the exterior itself cannot be inspected. Safe actual description exists only
for `invalid-value`. This diagnostic has no `dataPath`.

### 7.2 Unconfirmable target

`UNCONFIRMABLE_SCOPE_TARGET` has fallback
`Scope target cannot be confirmed in baseline.` and these common parameters:

```ts
{
  scopeId: string;
  targetIndex: number;
  reason:
    | 'invalid-target'
    | 'root-path'
    | 'numeric-path'
    | 'path-not-managed'
    | 'node-not-managed'
    | 'identity-target-not-editable'
    | 'ancestor-incompatible'
    | 'collection-unavailable'
    | 'invalid-identity'
    | 'item-missing';
  side?: 'baseline' | 'current';
  presence?: 'missing' | 'incompatible';
  identityReason?:
    | 'sparse-item'
    | 'non-object-item'
    | 'missing-identity'
    | 'identity-accessor'
    | 'non-string-identity'
    | 'blank-identity'
    | 'duplicate-identity';
  identityIndex?: number;
  firstIdentityIndex?: number;
  collectionPath?: readonly string[];
  itemId?: string;
  relativePath?: readonly string[];
  path?: readonly string[];
  segmentIndex?: number;
}
```

The closed parameter matrix is:

| Reason                         | Required additional parameters                                                                                                                                               | Diagnostic `dataPath` |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `invalid-target`               | none; `segmentIndex` only when a safe array segment/index identifies the malformation                                                                                        | none                  |
| `root-path`                    | `path: []`                                                                                                                                                                   | none                  |
| `numeric-path`                 | safe copied prefix in `path`, `segmentIndex`                                                                                                                                 | copied string prefix  |
| `path-not-managed`             | complete safe `path`                                                                                                                                                         | that path             |
| `node-not-managed`             | `collectionPath`, `itemId`, complete `relativePath`                                                                                                                          | collection path       |
| `identity-target-not-editable` | `collectionPath`, `itemId`, `relativePath`                                                                                                                                   | collection path       |
| `ancestor-incompatible`        | `side`, safe target path/address, `path` equal to first incompatible positional ancestor                                                                                     | that ancestor         |
| `collection-unavailable`       | `side`, `presence`, `collectionPath`, `itemId`, optional `relativePath`                                                                                                      | collection path       |
| `invalid-identity`             | `side`, `identityReason`, `identityIndex`, `collectionPath`; optional duplicate `firstIdentityIndex`; `itemId` and optional `relativePath` only for a stable original target | collection path       |
| `item-missing`                 | `side`, `collectionPath`, `itemId`, optional `relativePath`                                                                                                                  | collection path       |

For malformed raw target data, no value description or partial hostile object
is retained. For `numeric-path`, `path` contains only safely copied string
segments before the first numeric member. Only duplicate identity includes
`firstIdentityIndex`.

Every `invalid-identity` diagnostic identifies its failing collection without
inventing a stable item address. A static array target, or a static object
target that transitively selects the collection, therefore omits `itemId` and
`relativePath`. An original stable item/node target retains its copied
`itemId` and, for a node target, its copied `relativePath`.

Target parsing completes for all entries before availability checks. The first
target-shape failure in caller order is the sole diagnostic. If shapes all
pass, the first availability failure in caller order is the sole diagnostic.

### 7.3 Candidate construction failure

`BASELINE_CONFIRMATION_FAILED` has fallback
`Baseline confirmation failed.` and exactly:

```ts
{
  reason: 'inspection-failed' | 'clone-failed';
  path?: readonly (string | number)[];
}
```

The safe managed positional `path` is included only when already known; it is
also the diagnostic `dataPath`. No exception or reflective result is retained.
This code represents a failure after complete preflight, including a hostile
object that changes behavior between inspection and construction. It never
represents schema-invalid business data.

## 8. Primitive and object reconstruction

Reconstruction starts from baseline and follows only canonical selected target
chains.

For a primitive target:

- effective current absence removes the baseline terminal when reachable;
- current own data presence writes its exact value;
- equal presence plus `Object.is` value is a no-effect; and
- no primitive type, fixed value, choice, format or validator assertion is
  evaluated.

Effective absence includes a missing current ordinary-object ancestor. The
helper removes only the terminal at the selected path from compatible baseline
ancestors; it does not remove an unselected ancestor or sibling. If the
corresponding baseline ancestor is also missing, the target is already a
no-effect.

For an object target:

- effective current absence removes that exact baseline branch when reachable;
- a current incompatible value replaces that exact branch by reference;
- compatible objects reconcile presence and every managed descendant;
- an existing compatible baseline object preserves all unmanaged own
  properties and unselected descriptors while managed descendants are
  reconciled; and
- a missing or target-level incompatible baseline object is replaced by a new
  managed projection with the current object's ordinary prototype.

For a narrower present target below missing baseline ancestors, each required
ancestor is materialized with the matching current ordinary prototype and only
the selected managed path. Current-only unmanaged properties and unselected
managed siblings are not copied. A missing narrower target never materializes
an ancestor.

Object semantic no-effect follows SPEC-002 dirty equality: equal presence;
`Object.is` for two incompatible values; and recursive equality of managed
descendants for two compatible objects. Container reference difference and
unmanaged-data difference alone do not cause a change.

## 9. Collection reconstruction

### 9.1 Whole collection target

An array `DataPath` owns collection presence and structural confirmation:

- effective current absence removes the baseline array branch;
- a current incompatible value replaces the branch by exact reference;
- a valid current array defines the candidate identity set and exact order;
- valid baseline items match current items only by exact identity string;
- baseline-only identities are omitted;
- current-only identities create new managed item projections; and
- every matched/current item has its complete managed template confirmed.

A compatible current or baseline array with invalid identity fails under
section 7.2 before reconstruction. A missing or target-level incompatible
baseline array needs no identity matching and may be replaced from a valid
current array.

For a matched item, the candidate preserves the baseline item prototype,
identity descriptor, unmanaged own members and unchanged managed references.
For a new item, it creates an ordinary object using the current item prototype,
defines the exact current identity as an ordinary writable/enumerable/
configurable data property and copies only the complete managed template.

The result is an ordinary array with current length/order. A matched identity's
baseline index data descriptor moves with that identity; if its item reference
changes, only the descriptor value is replaced while flags are preserved. A
new identity uses an ordinary writable/enumerable/configurable index descriptor.
Existing baseline non-index own descriptors other than `length`, including
symbols, are preserved. Current-only non-index properties are not copied.

Whole-collection semantic no-effect follows SPEC-003 dirty equality: equal
presence, valid identity order and recursively equal managed item descendants.
Array/item reference or unmanaged-data differences alone do not cause a change.

### 9.2 Stable partial target

An item address preserves baseline collection presence, length and identity
order and confirms every managed descendant of the matched baseline item. A
node address confirms only the exact relative object/primitive target under
section 8. The baseline identity descriptor/value is never rewritten.

An item target is a semantic no-effect when all its managed descendants are
already equal under the accepted dirty rules. A different current item
reference, prototype or unmanaged own data alone does not clone the baseline
item or array.

Only the matched baseline item, its selected descendant chain, the array and
root ancestor chain may be cloned. Other item references and array descriptors
remain exact. A partial target cannot make an insertion, removal or reorder
clean; an application must select the array path or construct its own baseline
for such persistence semantics.

## 10. Descriptor and structural-sharing rules

Every changed ordinary baseline object is cloned with its exact
`Object.prototype` or `null` prototype. All own keys and descriptors are copied
without reading values, except the one managed member being replaced or
removed. A replaced member uses an ordinary writable, enumerable and
configurable data descriptor. Missing removal omits only that key.

Multiple selected descendants under one ancestor produce one final clone of
that ancestor. Unchanged off-target branches, unselected terminal nodes,
unchanged selected branches and untouched collection items preserve exact
references. Required ancestor materialization may change that ancestor's
presence and derived dirty state but never copies an unselected terminal from
current.

The candidate is built iteratively. Definition depth, target count and current
array lengths bound work; deep schemas must not depend on the JavaScript call
stack. No input object, array, descriptor or borrowed terminal is mutated,
recursively cloned or frozen.

## 11. Application, runtime and validation behavior

The helper only proposes data. A typical accepted flow is:

1. the application obtains its current `value`, `baselineValue`, accepted
   definition and save scope;
2. it calls `commitScopeToBaseline()`;
3. failure prevents the application from claiming that scope confirmation;
4. success may be persisted by application policy; and
5. only after persistence success may the application call
   `updateExternalState({ baselineValue: result.value })`.

Core does not verify that persistence occurred. Calling the helper neither
changes a runtime nor changes dirty/touched/focus/visibility. Passing the
candidate later as baseline recalculates dirty under existing atomic update
rules, preserves interaction and does not invoke synchronous or asynchronous
validation. If the candidate is the exact existing baseline, that external
update retains its accepted no-effect behavior.

Angular and Standard add no adapter wrapper. Both reference applications call
the root core helper from application-owned deterministic controls. Shared
scenario authoring may define labels, scopes and expected evidence, but cannot
own effects or import either target.

## 12. Conformance requirements

Future implementation and package conformance must cover at least:

1. exact Public root signature, declaration identity and no additional export;
2. frozen success/failure envelopes and unchanged application-candidate freeze
   ownership;
3. all accepted definition defects and deterministic diagnostic order;
4. ordinary/null roots, inherited members, accessors and hostile reflection;
5. empty scopes, malformed exteriors, sparse paths, numeric/root/unknown paths;
6. malformed addresses, empty relative item alias and identity-property target;
7. duplicate/overlap canonicalization independent of target order;
8. primitive missing versus `undefined`, `null`, empty, false and zero;
9. object missing/incompatible/materialized branches and unmanaged preservation;
10. current/baseline incompatible ancestors and atomic mixed-target failure;
11. whole-array missing/incompatible/empty/valid/invalid identity matrices;
12. whole-array insertion, removal, reorder and matched/new item projection;
13. stable item/node moves, missing IDs and non-structural behavior;
14. prototypes, symbols, non-enumerables, descriptor flags and array properties;
15. semantic no-effect and every required structural-sharing boundary;
16. deep iterative paths, cyclic values and changing hostile traps;
17. zero validator, async port, text resolver, operation, listener or console
    side effects;
18. baseline-only runtime update preserving interaction and async generation;
19. independent Angular and Standard application-owned confirmation evidence;
20. core declarations, package smoke, built/clean consumers and deep-import
    rejection; and
21. preservation of every explicit exclusion and frozen dependency graph.

Reference evidence must include one non-collection partial scope and one
collection case. It must visibly distinguish candidate calculation from
simulated persistence acceptance and prove an unrelated edit stays dirty. It
must not add real storage, network, submit state or timing behavior.

## 13. Explicit exclusions

Automatic runtime baseline mutation, a runtime save/commit method, persistence,
storage, HTTP, autosave, drafts, submit/attempted state, optimistic projection,
transactions, batches, undo/redo, declarative UI-Schema scopes, dynamic
definitions, defaults/factories, scoped validation execution, issue visibility
changes, current-only unmanaged-data copying, structural collection changes
through stable partial targets, new packages/entry points, adapter wrappers,
React, Vue, Angular legacy support, versioning, release and publication.

## 14. Public migration and compatibility

The ADR-009 inventory remains exactly:

| Classification      | Exact delta                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| New Public core     | `commitScopeToBaseline()` through the existing core root                                                    |
| Reused Public core  | `FormDefinition`, `FormScope`, `FormScopeTarget` and `ApplyOperationResult<TData>`                          |
| Changed Public core | None                                                                                                        |
| Changed adapters    | None; reference applications consume core directly                                                          |
| Unchanged           | runtime state/methods, operations, validators, snapshots, packages, entry points, export maps and stability |

The helper is additive Public + Experimental + Active. Existing consumers that
do not import it have no source, declaration, package-map, dependency or
runtime behavior change. No version, compatibility range, release candidate or
publication is authorized by this specification.

## 15. Acceptance and implementation gates

SPEC-013 may be accepted only after repeated complete review reaches one pass
with zero findings for:

1. exact alignment with Accepted ADR-030 and baseline SPEC authority;
2. Public signature/result immutability and complete ADR-009 inventory;
3. definition/root/scope validation order and atomicity;
4. closed diagnostic codes, matrices, safe parameters and ordering;
5. static/stable target parsing, availability and overlap;
6. primitive/object presence, incompatibility and managed projection;
7. collection structure, stable partial targets and identity closure;
8. dirty-equivalent no-effect and descriptor-safe structural sharing;
9. runtime/validation/application ownership and adapter neutrality;
10. conformance sufficiency, package evidence and deep iterative behavior;
11. compatibility, dependency and migration closure; and
12. every explicit exclusion and Deferred boundary.

Every correction requires another complete pass. Acceptance would authorize
preparation and complete review of PLAN-029 only. Implementation requires that
plan to be separately Approved; commit, push, versioning, release and
publication remain separate explicit actions.

Review 247 cycle 3 passed v0.1.0 across all twelve areas with zero findings.
After implementation review 249 exposed diagnostic conflict C-001, Ricard
approved the narrow parameter-matrix correction. Review 250 cycle 1 passed the
complete corrected contract across all twelve areas with zero findings. Under
Ricard's standing authorization to accept zero-finding documents that do not
widen approved scope, SPEC-013 v0.1.1 was accepted on 2 August 2026. Acceptance
authorizes PLAN-029 revision reconciliation and implementation only through a
separately Approved plan.
