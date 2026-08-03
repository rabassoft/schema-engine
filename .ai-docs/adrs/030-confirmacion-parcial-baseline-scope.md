# ADR 030: Pure scope-to-baseline confirmation

- **State:** Accepted revision 0
- **Date:** 2026-08-02
- **Acceptance date:** 2026-08-02
- **Complete review:** [Review 246](../reviews/246-adr-030-review.md) cycle 2
  passed all twelve areas with zero findings
- **Milestone:** M27 — Scope-to-baseline confirmation
- **Promotes:** only the bounded D-038 slice selected by
  [review 245](../reviews/245-d038-m27-scope-baseline-promotion-readiness.md)
- **Requires:** Accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003
  v0.1.2, SPEC-012 v0.1.0, ADR-009, ADR-014 revision 2, ADR-015 revision
  4 and ADR-029
- **Authority:** Accepted M27 architecture only; authorizes preparation and
  complete review of a dedicated extension SPEC, not
  implementation, persistence, package changes, versioning, release,
  publication, commit, push or external mutation

## 1. Context

Applications own `value`, `baselineValue` and persistence. They may already
confirm a complete save by supplying the same accepted root as both current and
baseline state, but a step or section save must confirm only the managed nodes
selected by an application-defined `FormScope`. Unrelated managed edits must
remain dirty.

Nested objects and stable object collections make this reconstruction more than
a shallow copy. Consumers would otherwise duplicate definition lookup,
missing-property semantics, stable item addressing, collection identity checks
and descriptor-safe structural sharing. The two maintained reference
applications now provide a concrete cross-adapter need for one neutral rule.

The utility must not turn core into a persistence owner or add an imperative
runtime action. It constructs only a candidate application-owned baseline. The
application decides whether persistence succeeded and whether to pass that
candidate to `updateExternalState()`.

## 2. Decision

### 2.1 One pure Public core helper

Core will expose exactly one new Public + Experimental + Active root export:

```ts
export function commitScopeToBaseline<TData extends object>(
  definition: FormDefinition,
  baselineValue: Readonly<TData>,
  currentValue: Readonly<TData>,
  scope: FormScope,
): ApplyOperationResult<TData>;
```

The existing `ApplyOperationResult.value` is the candidate baseline. On
success, `changed` says whether the returned root differs by identity from
`baselineValue`; a no-effect result returns that exact baseline root. A
successful result has the existing empty diagnostic tuple. Failure is atomic,
returns the exact original baseline, has `changed: false` and exposes only
normalized core diagnostics.

The helper is synchronous and side-effect free. It never creates or owns a
runtime, invokes validation or text resolution, emits an operation, changes
interaction, persists data or calls `updateExternalState()`. It borrows the
definition and both roots read-only and retains no mutable input wrapper,
scope, path or address object.

No new options or result type is introduced. The four positional arguments
match the existing pure operation helpers and keep the Public migration to one
symbol.

### 2.2 Descriptor-safe validation and atomicity

Validation proceeds in this deterministic order:

1. the complete accepted `FormDefinition` shape and projections;
2. the baseline root and its managed tree;
3. the current root and its managed tree;
4. the `FormScope` exterior and targets in declared order; and
5. target-specific availability and collection identity.

Both roots must be ordinary objects. Every inspected managed member must be
missing or an own data property. Accessor getters are never invoked; hostile
reflection traps and expected clone-construction failures are contained as
normalized failure diagnostics rather than escaping as expected consumer
errors. Incompatible own data values remain business data and are not rejected
merely because they fail the schema.

All targets are validated before a candidate is observable. One malformed,
numeric, unmanaged, unavailable or unaddressable target fails the whole call;
valid siblings are not partially applied. This deliberately differs from
visibility APIs, where `UNKNOWN_SCOPE_PATH` is a non-blocking warning: claiming
that a requested scope was persisted while silently skipping part of it would
produce a false baseline.

`scope.id` and `includeGlobalIssues` retain their accepted shape rules. The ID
may identify the application save unit but does not enter the candidate.
`includeGlobalIssues` has no data effect because global validation issues do not
identify baseline nodes. A structurally valid scope with an empty `paths` array
is a successful no-effect and returns the exact baseline root.

The extension SPEC must close diagnostic codes, reasons, parameters, paths,
fallbacks and first-failure ordering. It may reuse an existing diagnostic only
where its meaning remains exact; it may not leak an input value, descriptor,
prototype, thrown value or item payload.

### 2.3 Target normalization and overlap

The helper accepts the existing closed `FormScopeTarget` union:

- a string-only managed `DataPath` selects that normalized root node;
- a `CollectionItemAddress` selects one currently addressable item;
- a `CollectionNodeAddress` selects its exact managed relative node; and
- a node address with an empty relative path is equivalent to its item
  address, matching existing scope behavior.

Root paths, numeric paths, identity-property targets and unknown definition
paths are invalid. Caller arrays and address objects are copied during
validation. Canonical comparison uses accepted definition paths and stable
collection identity, never numeric item position or object reference.

Duplicate and overlapping valid targets are not errors. The canonical set
keeps only the broadest selection:

- an object path dominates its managed descendants;
- an array path dominates every item or node address in that collection;
- an item address dominates node addresses for the same item; and
- an object node address dominates its managed relative descendants for that
  item.

Canonicalization does not depend on caller order and emits no diagnostic.
Preflight diagnostics still follow the original target order, so an invalid
target cannot be hidden by a valid ancestor.

### 2.4 Managed copy and missing-value semantics

Confirmation copies current managed presence and values into the candidate
baseline; it does not replace an entire arbitrary domain subtree merely because
an object node is selected.

For a primitive leaf, current absence removes the baseline property and current
presence writes the exact current value. For an object node:

- current absence removes the selected baseline branch;
- a current incompatible value replaces the selected baseline branch by that
  exact value;
- when both sides are compatible objects, only selected managed descendants
  are reconciled and baseline-owned unmanaged members are preserved; and
- when current is compatible but baseline is missing or incompatible, a new
  ordinary branch uses the current ordinary prototype and contains only the
  selected managed projection.

Selecting an object means selecting its presence plus every managed
descendant. Missing managed ancestors are materialized only when required by a
selected present descendant. An incompatible ancestor below a narrower target
makes that target unavailable and fails atomically; selecting that ancestor
itself remains valid and confirms its incompatible business value.

The candidate therefore makes every selected managed node clean under the
accepted dirty rules. Unselected terminal nodes and branches outside the
ancestor chains required to reach selected targets retain their previous
baseline semantics. Materializing or removing a required ancestor may change
that ancestor's derived presence/dirty state, but never copies an unselected
terminal from current. Unmanaged properties from an existing baseline are
preserved; current-only unmanaged properties are not implicitly confirmed.

### 2.5 Collection structure versus stable partial targets

A managed array `DataPath` is the only target that confirms collection
presence or structural identity order. Its behavior is:

- current absence removes the baseline collection;
- current incompatible data confirms that exact incompatible value;
- a current valid collection rebuilds the baseline collection in current
  stable-identity order and confirms every managed item descendant;
- matched baseline items preserve baseline-owned unmanaged members while their
  managed projection is reconciled;
- newly current items copy the exact identity and managed projection but not
  unrelated current-only properties; and
- baseline-only identities are omitted.

The current collection must have valid, unique accepted identities before its
structure can be confirmed. A compatible baseline collection must also have
valid unique identities before its items can be matched. Invalid identity fails
closed; the helper does not guess a positional match or copy a malformed array
reference merely to make dirty false.

An item or node stable address is a non-structural partial target. The addressed
identity must exist exactly once in valid current and baseline collections.
These targets preserve baseline collection presence and identity order, clone
only the addressed item path and never insert, remove or move an item. A
current-only, removed, duplicate or otherwise unaddressable identity fails
atomically. Applications confirm insertions, removals or reordering by selecting
the collection `DataPath`, or construct their own baseline when they need a
different persistence unit.

An item address confirms all managed descendants of that matched item. A node
address applies the object/leaf rules from section 2.4 to its template-relative
target. The identity property remains addressing metadata and cannot be
selected or changed independently.

### 2.6 Structural sharing and ownership

Successful reconstruction clones only changed baseline ancestor objects,
changed arrays and changed matched items. It preserves:

- the exact baseline root on semantic no-effect;
- references for off-target branches and unchanged selected branches;
- baseline prototypes, symbols, non-enumerable properties and data
  descriptors outside replaced managed members;
- the current primitive or incompatible terminal value by exact reference; and
- current identity strings without normalization.

New managed ordinary objects use the current `Object.prototype` or `null`
prototype. New arrays are ordinary arrays; supported non-index own properties
from an existing baseline array are preserved. Replaced managed members use
ordinary writable, enumerable and configurable data descriptors, consistently
with accepted operation helpers. No source object, array or descriptor is
mutated, recursively cloned or frozen.

Reference identity is an optimization boundary, not a substitute for accepted
managed dirty semantics: a selected object or collection that is already clean
is a no-effect even when the current and baseline container references differ.

### 2.7 Runtime, async and adapter boundaries

The runtime gains no method and never calls the helper automatically. After an
application has successfully persisted a scope, it may pass the returned
candidate as `baselineValue` through the existing atomic external update. That
baseline-only update preserves touched, focus and visibility and does not run
synchronous or asynchronous validation under SPEC-001, SPEC-002 and SPEC-012.

Angular and Standard gain no Public wrapper. Their reference applications may
call the same core helper from application-owned save controls and must show
equivalent evidence that:

- the selected scope becomes clean only after simulated persistence succeeds;
- unrelated managed edits remain dirty;
- missing deep values and collection-wide structural changes are confirmed;
- stable item/node confirmation does not alter collection order; and
- baseline-only application does not restart controlled async validation.

Reference effects remain deterministic and local; M27 adds no HTTP, storage,
autosave or submit state.

## 3. Consequences

### Positive

- Consumers share one definition-aware rule for partial baseline confirmation.
- Application ownership of persistence and controlled external state remains
  intact.
- Fail-closed scope handling prevents a partial save from being reported as a
  complete confirmation.
- Deep objects and stable collections retain their accepted addressing,
  descriptor safety and dirty semantics.
- The Public migration is one function and reuses an existing result contract.

### Negative

- Item/node targets cannot individually confirm structural insertion, removal
  or movement; applications must select the collection or own custom logic.
- Fail-closed unknown targets are stricter than visibility scopes.
- Projection-aware reconstruction is more complex than shallow path copying.
- Current-only unmanaged data is intentionally outside the helper and may need
  application-specific persistence handling.

## 4. Rejected alternatives

- **Runtime `commitScope()` action:** would let core claim persistence success
  and mutate application-owned baseline.
- **Shallow replacement of each selected property:** would copy unmanaged data
  and cannot preserve unselected nested baseline fields.
- **Ignore unknown targets like visibility scopes:** could silently mark an
  incompletely persisted scope clean.
- **Treat stable item targets as insert/remove/move:** makes a partial data
  address decide collection structure and ambiguous placement.
- **Use numeric collection indices:** can confirm the wrong item after reorder
  and contradicts stable-address invariants.
- **Require valid JSON Schema data before confirmation:** validation policy and
  persistence policy belong to the application; incompatible business values
  remain representable.
- **Add adapter-specific helpers:** duplicates neutral semantics and makes a
  framework own the baseline.
- **Introduce a new result/options contract:** adds Public surface without
  behavior not already represented by `ApplyOperationResult`.

## 5. Explicit exclusions

Automatic baseline mutation, runtime save actions, persistence, storage, HTTP,
autosave, drafts, submit/attempted state, optimistic projection, transactions,
batches, undo/redo, declarative UI-Schema scopes, dynamic definitions, defaults,
factories, validation of only a scope, issue visibility changes, new packages or
entry points, adapter wrappers, React, Vue, Angular legacy support, versioning,
release and publication.

## 6. Public migration and follow-up gate

The exact ADR-009 inventory is:

| Classification      | Exact delta                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| New Public core     | Root export `commitScopeToBaseline()` with the signature in section 2.1                                     |
| Reused Public core  | `FormDefinition`, `FormScope`, `FormScopeTarget` and `ApplyOperationResult<TData>`                          |
| Changed Public core | None                                                                                                        |
| Changed adapters    | None; reference applications may consume the root helper directly                                           |
| Unchanged           | runtime methods/state, operations, validators, snapshots, packages, entry points, export maps and stability |

Acceptance authorizes only preparation and complete review of a dedicated
extension SPEC. That SPEC must close exact algorithms, diagnostics, hostile
input matrices, structural-sharing guarantees, conformance fixtures,
declaration/package evidence and migration behavior without widening this
inventory. Implementation requires a separately Approved plan.

Any need for automatic runtime mutation, structural collection changes through
stable partial targets, current-only unmanaged-data copying, adapter wrappers,
new Public types or persistence/submit ownership stops M27 for a new decision.

## 7. Required review before acceptance

ADR-030 may be accepted only after a complete review passes with zero findings
for:

1. D-038/M27 promoted boundary and every explicit exclusion;
2. application ownership of value, baseline and persistence;
3. exact Public Experimental inventory under ADR-009;
4. descriptor-safe definition/root/scope validation and atomic failure;
5. target parsing, fail-closed unknowns and overlap canonicalization;
6. primitive, object, missing, incompatible and unmanaged-data semantics;
7. collection presence, identity order and whole-array confirmation;
8. stable item/node non-structural confirmation and unaddressable cases;
9. dirty equivalence, structural sharing, prototypes and descriptors;
10. runtime interaction and sync/async validation non-trigger invariants;
11. Angular/Standard ownership and cross-consumer evidence; and
12. follow-up gates, diagnostics closure and deferred-boundary preservation.

Every correction requires another complete pass. Review 246 cycle 2 passed all
twelve areas with zero findings. Ricard explicitly accepted revision 0 on 2
August 2026; acceptance authorizes preparation and complete review of SPEC-013
only, not implementation.
