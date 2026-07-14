# ADR 015: Collection templates, stable item identity and controlled structural operations

- **Status:** Accepted revision 4
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Previous accepted revision:** 3 — item-root issue text resolution
- **Accepted revision:** 4 — collection-node ordinary text resolution
- **Revision 2 acceptance date:** 14 July 2026
- **Revision 3 acceptance date:** 14 July 2026
- **Revision 3 review state:** Complete review cycle 1 passed all six areas
  with zero findings; formally accepted by Ricard
- **Revision 4 acceptance date:** 14 July 2026
- **Revision 4 review state:** Complete review cycle 1 passed all six areas
  with zero findings; formally accepted by Ricard
- **Promotes:** [`D-006`](../roadmap/deferred-decisions.md), normative M10 design only
- **Requires:** accepted
  [`M10 promotion review`](../reviews/007-m10-arrays-promotion.md),
  [`ADR-005 revision 1`](./005-politica-dialecto-json-schema.md),
  [`ADR-009`](./009-politica-api-publica-estabilidad.md), and
  [`ADR-014 revision 2`](./014-modelo-objetos-anidados-paths-profundos.md)
- **Satisfied follow-up:** ADR-005 revision 2 accepted
- **Current follow-up:** decide formal acceptance or rejection of SPEC-003
  Draft v0.1.2 after complete review cycle 3 passed with zero findings;
  PLAN-010 remains unauthorized
- **Implementation authorized:** No

## 1. Context

M9 maps each immutable definition node to one managed data location. A
homogeneous array breaks that equivalence: its schema describes one static item
template while a controlled value contains zero or many item instances whose
positions can change.

Position cannot identify an item. Insert or move changes numeric indices without
changing the domain entity. Object reference is also unstable under immutable
controlled updates. Runtime-generated identity would make the runtime a second
source of truth and could not reconcile fresh controlled objects
deterministically.

The accepted M10 promotion permits design only for homogeneous arrays of inline
object items with application-owned stable string identity. Primitive arrays,
nested arrays, tuples, generated IDs, batches, optimistic state and general
collection layout remain deferred.

## 2. Decision

ADR-015 proposes a framework-neutral split between static collection
templates, stable item addresses and positional data paths. The application
declares where identity is stored, supplies every identity and item value, and
continues to own `value` and `baselineValue`. Core compiles and verifies that
contract, derives immutable snapshots and emits strict incremental intentions.
Angular only projects those contracts.

Acceptance of this ADR will authorize preparation and review of ADR-005
revision 2 only. It will not authorize SPEC-003, PLAN-010 or implementation.

### 2.1 Application-declared identity policy

Compilation adds neutral metadata separate from JSON Schema and UI Schema:

```ts
export interface CollectionPolicy {
  readonly path: readonly string[];
  readonly itemIdentityProperty: string;
}

export interface CompileFormDefinitionInput {
  readonly schema: unknown;
  readonly uiSchema?: unknown;
  readonly collectionPolicies?: readonly CollectionPolicy[];
}
```

Every supported array requires exactly one own policy whose `path` equals the
array property's absolute string-only data path. Missing, duplicate, unused or
malformed policies are blocking compiler configuration errors. Policy traversal
is descriptor-safe and never executes accessors.

`itemIdentityProperty` names one direct property of the inline item object. Its
schema must be an own `type: "string"` property and it must occur exactly once
in that item's own `required`. It cannot declare `enum`, editable constraints or
presentation metadata in M10.

The identity is application domain data, not a JSON Schema keyword, UI Schema
option, callback, generated token or position. Restricting M10 identity to a
direct required string property makes inspection, diagnostics and operation
application portable and deterministic.

At runtime every item must expose that identity as an own data property with a
non-blank string according to `value.trim().length > 0`. The exact string is
opaque: core performs no trim, case folding, Unicode normalization or coercion.
It may contain punctuation, JSON syntax, percent signs, lone surrogates or
`__proto__`. Identities are unique within one collection instance.

The identity property becomes non-editable item-instance metadata. It is
excluded from the editable item template, leaf projection, renderer resolution
and mutation/scope targets. The external validator may still report an issue at
that domain path. An application changes identity only by replacing the domain
item through controlled external state; reconciliation treats that as removal
plus insertion.

### 2.2 Static collection and item templates

The normalized definition adds one array node and one immutable item template:

```ts
export interface ArrayNodeDefinition extends BaseNodeDefinition {
  readonly kind: 'array';
  readonly identity: ItemIdentityDefinition;
  readonly item: ObjectItemTemplateDefinition;
}

export interface ItemIdentityDefinition {
  readonly property: string;
}

export interface BaseNodeTemplate {
  readonly key: string;
  readonly name: string;
  readonly relativePath: readonly string[];
  readonly required: boolean;
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
}

export interface ObjectNodeTemplate extends BaseNodeTemplate {
  readonly kind: 'object';
  readonly children: readonly FormNodeTemplate[];
}

export type FieldTemplate =
  | (Omit<StringFieldDefinition, keyof BaseNodeDefinition> & BaseNodeTemplate)
  | (Omit<NumberFieldDefinition, keyof BaseNodeDefinition> & BaseNodeTemplate)
  | (Omit<BooleanFieldDefinition, keyof BaseNodeDefinition> & BaseNodeTemplate);

export type FormNodeTemplate = ObjectNodeTemplate | FieldTemplate;

export interface ObjectItemTemplateDefinition {
  readonly kind: 'item-template';
  readonly children: readonly FormNodeTemplate[];
  readonly fields: readonly FieldTemplate[];
}
```

`FormNodeDefinition` gains `ArrayNodeDefinition`. The array node has an
ordinary absolute string-only path. Template descendants use immutable
string-only paths relative to the item object. `fields` is the depth-first leaf
projection containing the same template references as `children`. The identity
property appears only in `identity`, never in those editable views.

No numeric index or runtime item ID is stored in the definition. A runtime item
never mutates or joins the definition. Manual-definition validation rejects
cyclic/reused templates, inconsistent projections, identity/template overlap,
arrays below the item template and malformed collection invariants before
calling the validator.

The array node retains every ADR-014 invariant: its `path` is non-empty and
string-only, `name` is its final segment and `key === JSON.stringify(path)`.
Each template descendant has one non-empty relative string-only `relativePath`, local
`name`, and opaque `key` equal to
`JSON.stringify(['template', arrayPath, relativePath])`. Child relative paths
equal their parent path plus child name and are unique inside the template.
Template objects and primitive leaves reuse the accepted normalized members but
do not masquerade as absolute `FormNodeDefinition` values. `FormDefinition`
keeps its existing global `fields` projection for non-collection leaves; item
template leaves exist only in `ArrayNodeDefinition.item.fields` until runtime
instances are created.

### 2.3 Three addressing domains

M10 keeps these concepts separate:

1. **Collection path:** absolute string-only `DataPath` of the array node.
2. **Data path:** current model/validator location, containing the collection
   path, one numeric index and relative string segments.
3. **Stable item address:** runtime/action identity independent of position.

```ts
export interface CollectionItemAddress {
  readonly collectionPath: readonly string[];
  readonly itemId: string;
}

export interface CollectionNodeAddress extends CollectionItemAddress {
  readonly relativePath: readonly string[];
}
```

Numeric `DataPath` segments become valid only at the item position introduced
by a supported collection. They are positional observations, never stable keys
or mutation targets chosen by a consumer. Existing object-only paths remain
string-only.

Public item lookup, mutation and item-scope APIs consume stable addresses. A
numeric path lookup may be a read-only convenience in SPEC-003, but no intention
relies on it.

The collection node retains ADR-014's canonical path key. Template and instance
keys are opaque JSON serializations of tagged tuples:

```ts
collectionKey = JSON.stringify(collectionPath);
templateKey = JSON.stringify(['template', collectionPath, relativePath]);
itemKey = JSON.stringify(['item', collectionPath, itemId]);
instanceNodeKey = JSON.stringify([
  'item-node',
  collectionPath,
  itemId,
  relativePath,
]);
```

The array host keeps the ADR-014 DOM base
`se-${encodeURIComponent(JSON.stringify([formId, collectionPath]))}`. Item and
instance descendants use
`se-${encodeURIComponent(JSON.stringify([formId, 'item', collectionPath, itemId, relativePath]))}`,
where the item-root relative path is `[]`. Fixed semantic suffixes are appended
after the encoded base. Consumers must not parse or construct keys or IDs.
Tagged tuples prevent collisions among property names, indices, template
markers, item IDs and suffixes without changing existing object/leaf IDs.

### 2.4 Presence and identity availability

```ts
export type ArrayPresence =
  | { readonly kind: 'missing' }
  | { readonly kind: 'array' }
  | { readonly kind: 'incompatible'; readonly value: unknown }
  | {
      readonly kind: 'blocked';
      readonly reason: 'missing-ancestor' | 'incompatible-ancestor';
      readonly at: DataPath;
    };
```

For an accessible array, core inspects every dense index and identity property
through own descriptors. Sparse slots, non-object items, missing/accessor/
non-string/blank identities and duplicate identities make its identity state
invalid.

```ts
export type CollectionIdentityState =
  | { readonly kind: 'valid' }
  | {
      readonly kind: 'invalid';
      readonly reason:
        | 'sparse-item'
        | 'non-object-item'
        | 'missing-identity'
        | 'identity-accessor'
        | 'non-string-identity'
        | 'blank-identity'
        | 'duplicate-identity';
      readonly index: number;
      readonly firstIndex?: number;
    };
```

`firstIndex` exists only for `duplicate-identity` and identifies the earlier
item. `identityState` records the first invalid item in ascending index order;
diagnostics may report every independently inspectable invalid item in that
same order. Neither state nor diagnostics retain the item or identity value.

Identity validation is atomic for addressing. An invalid array snapshot keeps
its presence and a deterministic safe identity state, but exposes no addressable
item snapshots and accepts no item or structural intention. This prevents an
action or renderer from being assigned to an ambiguous item. Independent
collections remain active and a later valid external value recovers without
recompiling.

An invalid identity state makes that array and the root runtime invalid
independently of external validator issues. It is not converted into a synthetic
`ValidationIssue`; `identityState` is the canonical observable contract and the
fixed host always exposes its localized blocking message because editing is
unavailable. Validator issues remain separately ordered in `issues`.

These are runtime business-state failures, not compiler failures. They do not
prevent runtime creation from otherwise structurally admissible data. SPEC-003
must close diagnostic codes, reasons, ordering, safe parameters and fallback
projection without retaining hostile values.

### 2.5 Runtime item instances and snapshots

```ts
export interface ArrayRuntimeSnapshot {
  readonly nodeKind: 'array';
  readonly key: string;
  readonly path: readonly string[];
  readonly presence: ArrayPresence;
  readonly identityState: CollectionIdentityState;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
  readonly items: readonly ItemRuntimeSnapshot[];
}

export interface ItemRuntimeSnapshot {
  readonly nodeKind: 'item';
  readonly key: string;
  readonly address: CollectionItemAddress;
  readonly index: number;
  readonly dataPath: DataPath;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
  readonly children: readonly NodeRuntimeSnapshot[];
  readonly fields: readonly FieldRuntimeSnapshot[];
}

export type RuntimeTreeSnapshot = NodeRuntimeSnapshot | ItemRuntimeSnapshot;
```

For valid data, `identityState.kind` is `valid`; otherwise it uses the closed
safe reason/location above. Item descendants expose a stable instance
address/key and a current positional `DataPath`. Current order follows the
controlled array; current and baseline items match only by identity.

Structural sharing is identity-based. Immutable array/item replacement retains
unaffected descendant identities. A move retains logical item ownership, while
wrappers whose observable `index` or `dataPath` changes must be rebuilt. Removed
identities release interaction and Angular resources. SPEC-003 must state exact
wrapper/reference guarantees without promising unchanged object identity when
position is observable.

`NodeRuntimeSnapshot` adds `ArrayRuntimeSnapshot` but not the implicit item
root. `RuntimeTreeSnapshot` is used only where that item root is also a valid
result. `FormRuntimeSnapshot.nodes` remains the ordered root definition
projection and contains object, array and primitive node snapshots.

`FormRuntimeSnapshot.fields` remains a complete same-reference primitive-leaf
projection. It walks root definition nodes depth-first; at an array it expands
current valid items in controlled order, then each item's template fields in
depth-first order. An invalid or unavailable collection contributes no leaves.
This runtime projection may change cardinality and position, while
`FormDefinition.fields` remains the static projection of primitive leaves
outside item templates. Item-template leaves live exclusively under
`ArrayNodeDefinition.item.fields`.

The Public runtime adds exact stable-address reads:

```ts
getItemSnapshot(
  address: CollectionItemAddress,
): ItemRuntimeSnapshot | undefined;

getCollectionNodeSnapshot(
  address: CollectionNodeAddress,
): RuntimeTreeSnapshot | undefined;
```

Both are synchronous and side-effect-free and return `undefined` for malformed,
unknown, removed or currently unaddressable identities. The second accepts
`relativePath: []` and then returns the item snapshot; a non-empty relative path
must resolve an exact managed descendant. Existing `getNodeSnapshot(DataPath)`
remains positional read-only lookup for the current value and never becomes a
mutation address. At an exact positional item path it returns that
`ItemRuntimeSnapshot`, so its Public return type becomes
`RuntimeTreeSnapshot | undefined`.

### 2.6 Dirty, interaction and reconciliation

For valid current and baseline collections:

- presence differences are dirty;
- a different identity sequence makes the array structurally dirty, covering
  insert, remove and move;
- identities present on both sides compare managed descendants by identity;
- a matched item is dirty when any managed descendant is dirty, and the array
  aggregate is dirty when its sequence or any matched item is dirty;
- inserted/removed identity dirty belongs to the array and is not duplicated
  below it; and
- unmanaged item properties do not contribute to descendant dirty.

If either side is incompatible or has invalid identity, the first array node
owns dirty using presence plus `Object.is` on its external array/value
reference; unavailable descendants do not claim dirty.

Touched and focus are keyed by item ID plus relative leaf path. Reordering and
immutable replacement preserve them. Removal or identity change clears focus
for the vanished address without marking touched and discards its interaction.
Invalid identity clears active item focus atomically and retains no ambiguous
item interaction. Baseline-only updates never affect interaction. There remains
at most one focused primitive leaf per runtime; collection/item aggregate flags
are derived.

### 2.7 Stable leaf operations

M10 adds two collection-addressed leaf operations rather than overloading the
positional meaning of existing `path`:

```ts
export interface SetItemValueOperation {
  readonly type: 'set-item-value';
  readonly metadata: FormOperationMetadata;
  readonly target: CollectionNodeAddress;
  readonly identityProperty: string;
  readonly expected: OperationExpectation;
  readonly value: unknown;
  readonly source: 'user';
}

export interface RemoveItemValueOperation {
  readonly type: 'remove-item-value';
  readonly metadata: FormOperationMetadata;
  readonly target: CollectionNodeAddress;
  readonly identityProperty: string;
  readonly expected: {
    readonly kind: 'value';
    readonly value: unknown;
  };
  readonly source: 'user';
}
```

`target.relativePath` must be non-empty and resolve to one exact editable
primitive template leaf. The operation identifies collection path, item ID and
relative leaf path and retains the accepted terminal expectation. It never
encodes item identity as a numeric path.

Application helpers find the current index through the declared identity and
then perform descriptor-safe immutable traversal. A concurrent move does not
make the leaf action stale. Removed/duplicate/invalid identity, an incompatible
ancestor or a terminal expectation mismatch fails atomically. The identity
property cannot be targeted. Non-collection M9 operations remain unchanged.

`identityProperty` makes schema-neutral `applyOperation()` self-contained.
`applyFormOperation()` additionally verifies it exactly matches the normalized
array definition before any data traversal; a caller cannot use it to select a
different property for a managed operation. The runtime copies it only from the
immutable definition. All collection operation paths, addresses, expectations
and wrappers are immutable copies and use the existing metadata sequence.

`FormOperation` becomes the closed union of the two accepted M9 variants, these
two item-leaf variants and the three structural variants below. SPEC-003 closes
diagnostic codes and parameters but cannot change these discriminants or
concurrency semantics without revising this ADR.

### 2.8 Structural operations and concurrency

M10 adds exactly three single-item operations:

```ts
export type CollectionPlacement =
  | { readonly kind: 'start' }
  | { readonly kind: 'end' }
  | { readonly kind: 'before'; readonly itemId: string }
  | { readonly kind: 'after'; readonly itemId: string };

export interface InsertItemOperation {
  readonly type: 'insert-item';
  readonly metadata: FormOperationMetadata;
  readonly collectionPath: readonly string[];
  readonly identityProperty: string;
  readonly itemId: string;
  readonly item: unknown;
  readonly placement: CollectionPlacement;
  readonly source: 'user';
}

export interface RemoveItemOperation {
  readonly type: 'remove-item';
  readonly metadata: FormOperationMetadata;
  readonly collectionPath: readonly string[];
  readonly identityProperty: string;
  readonly itemId: string;
  readonly source: 'user';
}

export interface MoveItemOperation {
  readonly type: 'move-item';
  readonly metadata: FormOperationMetadata;
  readonly collectionPath: readonly string[];
  readonly identityProperty: string;
  readonly itemId: string;
  readonly placement: CollectionPlacement;
  readonly source: 'user';
}
```

The application supplies the full inserted item and exact `itemId`; runtime
never constructs domain data or applies defaults. The item must expose the same
identity through its declared own property and the ID must not exist already.
Remove and move target identity, not expected index. Move rejects a self anchor;
an already-satisfied placement is a successful no-effect.

The operation wrapper, copied paths and placement are frozen, but `item` is an
opaque application value: core neither clones nor freezes it and retains the
exact reference in the emitted operation. The application must treat it
immutably. Successful application inserts that exact reference; failure or
no-effect retains the exact input root and never mutates the item.

`before`/`after` anchors are stable identities. Missing, duplicate or invalid
target/anchor makes the operation stale and retains the exact input reference.
`start`/`end` need no positional expectation. Concurrent reordering can
therefore never redirect an intention to another item: the helper targets the
same identities in the latest value or fails.

Each helper applies one operation atomically, clones only the collection's
ancestor chain and array, preserves unaffected item references/descriptors and
returns the existing `ApplyOperationResult`. It does not batch, prune, mutate
identity, emit a reverse operation or project optimistically. Request methods
derive one operation from the latest confirmed snapshot; confirmation/rejection
occurs only through `updateExternalState()`.

The exact Public runtime intentions are:

```ts
requestSetItemValue(
  target: CollectionNodeAddress,
  value: unknown,
): RuntimeActionResult;
requestRemoveItemValue(
  target: CollectionNodeAddress,
): RuntimeActionResult;
requestInsertItem(
  collectionPath: readonly string[],
  itemId: string,
  item: unknown,
  placement: CollectionPlacement,
): RuntimeActionResult;
requestRemoveItem(address: CollectionItemAddress): RuntimeActionResult;
requestMoveItem(
  address: CollectionItemAddress,
  placement: CollectionPlacement,
): RuntimeActionResult;
```

Every method validates copied arguments before inspecting controlled state,
uses only the definition-owned identity property and emits at most one
operation. Insert validates that `itemId` is a non-blank exact string and equals
the inserted item's own identity data property; the other methods require a
currently addressable identity.

`requestInsertItem()` accepts `start`/`end` when the array or compatible object
ancestors are missing and emits the materializing operation described below.
It rejects `before`/`after` without a current anchor and every placement below
an incompatible ancestor. The runtime never emits remove or move for a missing
or unaddressable item.

As with item-leaf operations, `identityProperty` is required by
schema-neutral `applyOperation()` and must exactly match the definition in
`applyFormOperation()`. The runtime never accepts it from an action caller.

Insert with `start` or `end` may materialize a missing array and any missing
ordinary-object ancestors using the accepted safe descriptor rules. The new
array begins empty before the item is placed. `before`/`after` cannot apply to a
missing array because their anchor cannot exist. Insert below an incompatible
ancestor or at an incompatible array fails atomically. Remove/move against a
missing array or vanished item is stale at helper level; runtime cannot emit
them because no stable item snapshot exists. An empty present array is valid.

### 2.9 Validation and stable scopes

The validator continues receiving the original schema and complete positional
value once per relevant update. Validator paths remain positional because they
describe the evaluated value.

For a valid current collection, an issue at the array path belongs to the
array; an exact index belongs to the item; deeper issues map to the exact
managed descendant or deepest managed object/item ancestor. An identity-property
issue belongs to the item even though identity is not editable. Out-of-range or
stale numeric indices fall back deterministically to the array/deepest existing
managed ancestor. With invalid identity, every issue below the array attaches
to the array in validator order. Core never rewrites validator paths to IDs or
synthesizes validator issues.

Collection scopes use a closed target union:

```ts
export type FormScopeTarget =
  DataPath | CollectionItemAddress | CollectionNodeAddress;

export interface FormScope {
  readonly id: string;
  readonly paths: readonly FormScopeTarget[];
  readonly includeGlobalIssues?: boolean;
}
```

An array `DataPath` selects all current items; an item address selects that
identity wherever it moves; a node address selects its stable relative
descendant. Numeric `DataPath` scope targets remain invalid so a consumer cannot
accidentally bind visibility to a position. Removed identities are unknown and
produce the existing non-blocking scope warning. Overlap, forced visibility,
`includeGlobalIssues` and `resetTouched()` retain their meanings. Scopes do not
persist, insert, remove, move, select or declare layout.

### 2.10 Angular ownership and accessibility

Angular projects arrays/items with fixed Internal collection and item hosts.
They are not ADR-007 registrations; primitive leaves still use ADR-007 and
existing object hosts recurse within each item. Angular tracks item views by
stable canonical item key, never position or object reference. A move reorders
owned views without transferring leaf buffers, focus or renderer ownership.
Creation, failure isolation and destruction retain ADR-008/ADR-014 rules.

The projection uses semantic grouping, a collection label and item legend with
current one-based position. Stable keys generate collision-safe IDs and
descriptions. The fixed item host exposes remove, move-earlier and move-later
controls; the latter two translate only to `before`/`after` the current adjacent
identity. Arbitrary stable-anchor movement remains available to application
code. Controls have localized accessible names and are disabled when
structurally unavailable. No selection,
drag-and-drop, table/grid, pagination, virtualization or custom collection
renderer is introduced.

Collection action text extends the Public `TextResolver` transitively:

```ts
export type CollectionTextMember =
  | 'identity-error'
  | 'item-label'
  | 'remove-item'
  | 'move-item-earlier'
  | 'move-item-later';

export type CollectionTextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly collection: ArrayNodeDefinition;
      readonly member: 'identity-error';
      readonly item?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly collection: ArrayNodeDefinition;
      readonly item: ItemRuntimeSnapshot;
      readonly member: Exclude<CollectionTextMember, 'identity-error'>;
    };
```

The `identity-error` default source is `Collection items have invalid identity.`
The remaining default non-blank sources are respectively `Item <position>`,
`Remove item <position>`, `Move item <position> earlier` and
`Move item <position> later`, with the one-based decimal position already
interpolated before resolution. Resolver exception, non-string or blank result
falls back to that exact source and emits one deterministic
`TEXT_RESOLUTION_FAILED`; SPEC-003 closes its parameters and projection order.
Collection label/description/hint/tooltip retain the ordinary normalized node
text rules rather than gaining duplicate action members.

Insertion needs a full application-owned item, so the fixed host does not
synthesize an Add action. `SchemaFormDirective` exposes the neutral request to
application code. Confirmed removal clears focus only if its item vanished; it
does not change core focus to another leaf. Angular-local DOM focus originating
inside the removed item moves after confirmation to the next item at the removed
index, otherwise the previous item, otherwise the focusable collection legend.
It targets the corresponding action when available and the item legend
otherwise. Fixed legends use programmatic focusability (`tabindex="-1"`) without
entering ordinary tab order. Confirmed move preserves focused descendant/action identity and
retains or restores DOM focus on that same logical control. Rejected operations
leave DOM ownership unchanged.

An invalid-identity collection renders only its collection-level text/issues
and no item subtree or structural action. A synchronous exception during fixed
collection/item host creation or creation bindings destroys any partial
`ComponentRef`, emits exactly one `COLLECTION_HOST_INSTANTIATION_FAILED` or
`ITEM_HOST_INSTANTIATION_FAILED`, and stops only that subtree while independent
siblings/items continue. As in ADR-014, this is not a general boundary for
later template, lifecycle or change-detection exceptions. Signal Forms remain
private leaf buffers and never own collection values, identity, validation or
operations.

### 2.11 Public API migration

All additions and changes remain Public + Experimental + Active under ADR-009.
No entry point, export map, package, version, publication or Stable state
changes.

| Classification         | Exact migration inventory                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `CollectionPolicy`, `ItemIdentityDefinition`, `BaseNodeTemplate`, `ObjectNodeTemplate`, `FormNodeTemplate`, `FieldTemplate`, `ObjectItemTemplateDefinition`, `ArrayNodeDefinition`, `CollectionItemAddress`, `CollectionNodeAddress`, `ArrayPresence`, `CollectionIdentityState`, `ArrayRuntimeSnapshot`, `ItemRuntimeSnapshot`, `RuntimeTreeSnapshot`, `CollectionPlacement`, `SetItemValueOperation`, `RemoveItemValueOperation`, `InsertItemOperation`, `RemoveItemOperation`, `MoveItemOperation`, `FormScopeTarget`, `CollectionTextMember` and `CollectionTextResolutionContext` |
| Changed Public core    | `CompileFormDefinitionInput.collectionPolicies`; `FormNodeDefinition`, `NodeRuntimeSnapshot` and `FormOperation` unions; `FormDefinition.nodes/fields`; `FormRuntimeSnapshot.nodes/fields`; item-instance `FieldRuntimeSnapshot.key/path`; `DataPath` positional numeric semantics; `FormScope.paths`; `TextResolutionContext` and `TextResolver.resolve()`; `FormRuntime.getNodeSnapshot()`; `applyOperation()`, `applyFormOperation()`, `ControlledFormRuntimeOptions`, `ExternalStateUpdate`, `FormRuntime` and manual-definition validation                                        |
| New Public runtime API | `FormRuntime.getItemSnapshot()`, `getCollectionNodeSnapshot()`, `requestSetItemValue()`, `requestRemoveItemValue()`, `requestInsertItem()`, `requestRemoveItem()` and `requestMoveItem()` with the exact signatures in sections 2.5 and 2.8                                                                                                                                                                                                                                                                                                                                            |
| Changed Public Angular | `AngularControlledFormConfig`; `SchemaFormDirective` stable-address reads and five request projections mirroring `FormRuntime`; `SchemaFormDirective` node/snapshot projection; `SchemaFieldOutletDirective.schemaFieldOutlet`; `AngularFieldRenderer.field/snapshot/texts`, `RendererTester` and `AngularRendererResolver.resolve()` transitively for item-instance leaf definitions/snapshots; no collection host is exposed                                                                                                                                                         |
| Internal Angular       | fixed collection/item hosts, collection text projection, stable view tracking, adjacent action controls, DOM IDs, focus restoration, `COLLECTION_HOST_INSTANTIATION_FAILED`/`ITEM_HOST_INSTANTIATION_FAILED` delivery and lifecycle helpers                                                                                                                                                                                                                                                                                                                                            |
| Unchanged              | two root entry points and export maps; application ownership of `value`/`baselineValue`; `SchemaValidator`; ADR-007 registration and tester selection over primitive leaves only; existing non-collection operation discriminants; Public + Experimental + Active status                                                                                                                                                                                                                                                                                                               |

SPEC-003 supplies the closed member unions, diagnostics and declaration-ready
details for these named contracts but cannot add an unlisted Public symbol or
change an operation/method discriminant without revising this inventory.
PLAN-010 migrates repository consumers atomically and verifies declarations,
package smoke, built/clean consumers and deep-import rejection.

## 3. Consequences

### Positive

- Identity survives index changes and immutable controlled replacement.
- Definitions stay immutable and independent of runtime cardinality.
- Intentions cannot silently target a new index occupant.
- Inspection and application stay descriptor-safe and framework-neutral.
- Angular preserves view, focus and leaf-buffer ownership by item ID.

### Negative

- Consumers maintain and declare one required stable string property per item.
- M10 cannot render or edit the identity property.
- Invalid/duplicate identities block addressable editing for that collection.
- Positional validator paths and stable runtime addresses must coexist.
- Experimental public contracts require an explicit broad migration.

## 4. Alternatives rejected

- **Index, reference or deep-value identity:** unstable across insertion,
  movement or immutable replacement.
- **Runtime-generated identity:** violates controlled ownership and cannot
  reconcile fresh objects deterministically.
- **Identity callback:** would make pure helpers execute arbitrary consumer code
  while inspecting hostile data and duplicate semantics across callers.
- **UI Schema/custom schema keyword:** identity is runtime/domain semantics, not
  presentation or JSON Schema validation.
- **Editable identity leaf:** the edit would rename the address targeting that
  same edit; replacement stays application-owned.
- **Expected numeric indices:** harmless concurrent movement would stale an
  otherwise unambiguous identity intention.
- **Primitive/nested arrays, tuples or factories:** outside the accepted M10
  boundary.

## 5. Deferred and unchanged boundaries

- arrays of primitives/enums/arrays, nested arrays and tuples;
- `prefixItems`, `contains`, `unevaluatedItems` and unpromoted array keywords;
- refs, resources, composition, conditionals and additional dialects;
- generated IDs, defaults, factories and identity editing;
- batches, undo/redo, optimistic state, pruning and dynamic definitions;
- selection, drag/drop, virtualization, pagination, tables/grids, custom
  collection renderers and general layout;
- async/framework validation, persistence and submit;
- new packages/entry points, Stable promotion and publication.

## 6. Required review before acceptance

ADR-015 may be accepted only after repeated complete review closes all findings
for:

1. template/instance invariants and manual definitions;
2. identity declaration, hostile values, uniqueness and replacement;
3. positional paths versus stable addresses, keys and DOM IDs;
4. exact leaf/insert/remove/move concurrency semantics;
5. presence, dirty, interaction, focus and structural sharing;
6. validation assignment and stable scopes;
7. Angular ownership, accessibility, isolation and Signal Forms boundary;
8. exact Public Experimental migration obligations; and
9. preservation of every deferred boundary.

After each correction, the full review repeats until it produces no finding.
Acceptance authorizes preparation and review of ADR-005 revision 2 only. An
accepted ADR-005 revision 2 is then required before SPEC-003 drafting.
PLAN-010 and implementation remain later separate reviewed approval gates.

## 7. Revision 2 accepted — structural array UI inventory correction

> This section is Accepted. Revision 1 remains authoritative except for the
> exact Public inventory addition below. No runtime, operation, Angular or
> implementation behavior is reopened.

### 7.1 Conflict being corrected

Accepted revision 1 requires a minimal structural item UI in the M10 schema
traversal decision, but its exact ADR-009 inventory omitted the Public contracts
needed to express that input. Proposed ADR-005 revision 2 made the omission
concrete by requiring `ArrayUiSchema`, `ItemUiSchema` and a widened
`UiNodeSchema`.

Leaving those names out would force SPEC-003 or implementation to add a silent
Public semantic/type change contrary to sections 2.11 and ADR-009. Removing
item UI entirely would narrow the accepted promotion after the architectural
decision and prevent existing label/order/field metadata from reaching item
templates. Revision 2 therefore corrects only the inventory omission.

### 7.2 Exact neutral contracts

```ts
export interface ArrayUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly item?: ItemUiSchema;
}

export interface ItemUiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
}

export type UiNodeSchema = ObjectUiSchema | ArrayUiSchema | FieldUiSchema;
```

The corresponding normalized schema node selects the structural branch;
TypeScript shape alone is not a discriminator. `ArrayUiSchema` supplies only
collection-node texts plus one optional item-template branch.
`ItemUiSchema.order/fields` applies to direct editable children of the single
homogeneous object template and recursively reuses `UiNodeSchema` for supported
object/primitive descendants. Absence of `item` is an empty item UI.

Identity remains application-owned non-editable metadata. An identity entry in
`item.fields` is incompatible and never becomes a field template. Item label,
identity-error and structural action sources remain the fixed `TextResolver`
contexts from section 2.10; UI Schema cannot override them.

No member expresses cardinality, insertion values, movement policy, selection,
actions, renderer selection, table/grid, layout, pagination or virtualization.
Descriptor-safe shape validation, compatibility diagnostics and traversal order
remain the responsibility of proposed ADR-005 revision 2 and future SPEC-003.

### 7.3 Exact ADR-009 inventory delta

Revision 2 adds only this delta to section 2.11:

| Classification           | Exact delta                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| New Public core          | `ArrayUiSchema`, `ItemUiSchema`                                                                                         |
| Changed Public core      | `UiNodeSchema`; `UiSchema.fields` and `CompileFormDefinitionInput.uiSchema` transitively accept the array branch        |
| Unchanged Public core    | every definition, address, snapshot, operation, runtime, scope, validation and text contract listed by revision 1       |
| Unchanged Public Angular | all revision 1 Angular contracts; adapters receive only normalized definitions/snapshots and do not interpret UI Schema |
| Internal Angular         | fixed collection/item hosts and helpers remain Internal exactly as revision 1                                           |

Both new interfaces are Public + Experimental + Active through the existing
core root entry point. No new entry point, export map, package, dependency,
version, Stable promotion or publication is authorized. PLAN-010 must later
verify their root declarations and clean-consumer imports together with the
rest of the accepted M10 inventory.

### 7.4 Consequences and unchanged boundaries

Positive consequence: ADR-005 revision 2 can define item UI traversal without a
silent API addition, while schema interpretation remains wholly in core.

Negative consequence: the Public Experimental UI union grows and structurally
overlapping branches require schema-kind-directed validation rather than a
TypeScript discriminator.

Primitive/nested arrays, tuples, editable identity, item actions/layout in UI
Schema, custom collection renderers, implementation and publication remain
unchanged and unauthorized.

### 7.5 Review and acceptance gate

Revision 2 may be accepted only after a complete review confirms:

1. the correction exactly matches the structural UI required by proposed
   ADR-005 revision 2;
2. all new/changed transitive Public contracts are named under ADR-009;
3. schema-kind-directed branch selection is unambiguous and framework-neutral;
4. no item identity, action, layout or renderer authority moves into UI Schema;
5. Angular Public/Internal ownership remains unchanged; and
6. no later normative or implementation gate is bypassed.

Any correction requires the complete review to repeat until zero findings.
Acceptance of revision 2 only unblocks complete review of ADR-005 revision 2;
it does not accept that revision, authorize SPEC-003/PLAN-010 or permit
implementation/publication.

The complete revision 2 review passed all six areas with zero findings. Ricard
authorized and accepted this narrow correction on 14 July 2026. No other
revision 1 decision changed.

## 8. Accepted revision 3 — item-root issue text resolution

> This section is Accepted. Revisions 1–2 remain authoritative except for the
> exact Public text-union replacement below. No identity, operation, snapshot,
> validation-assignment, Angular ownership or implementation decision is
> reopened.

### 8.1 Conflict being corrected

SPEC-003 complete review cycle 1 found that accepted revision 1 assigns an
exact-index validator issue to `ItemRuntimeSnapshot.issues` and requires the
fixed item host to expose item issues, but its closed Public
`CollectionTextResolutionContext` cannot represent resolution of an item-root
issue. Existing field and object issue contexts require a primitive field or
object definition and cannot truthfully represent the implicit item root.

Bypassing `TextResolver`, attaching the issue to another node or reusing an
action member would contradict accepted validation assignment, localization or
typed-context behavior. SPEC-003 also cannot widen an Accepted Public union
silently. Revision 3 therefore adds only the missing issue branch.

### 8.2 Exact Public text contract

`CollectionTextMember` and `CollectionTextResolutionContext` become:

```ts
export type CollectionTextMember =
  | 'identity-error'
  | 'item-label'
  | 'remove-item'
  | 'move-item-earlier'
  | 'move-item-later'
  | 'issue';

export type CollectionTextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly collection: ArrayNodeDefinition;
      readonly member: 'identity-error';
      readonly item?: never;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly collection: ArrayNodeDefinition;
      readonly item: ItemRuntimeSnapshot;
      readonly member: Exclude<
        CollectionTextMember,
        'identity-error' | 'issue'
      >;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly collection: ArrayNodeDefinition;
      readonly item: ItemRuntimeSnapshot;
      readonly member: 'issue';
      readonly issue: ValidationIssue;
    };
```

The issue source is exactly `issue.fallbackMessage ?? issue.code`, matching
existing primitive-field and object-node issue resolution. The original source
is passed opaquely to `TextResolver.resolve()` with the exact issue object and
current immutable item snapshot. A string result, including blank, is accepted
for `member: 'issue'`; resolver exception or non-string result falls back to
the exact source. The existing non-blank fallback rule remains unchanged for
identity, item-label and structural-action members.

Each failed item-issue resolution emits exactly one
`TEXT_RESOLUTION_FAILED` warning. SPEC-003 must close its collection name,
item ID, `member: 'issue'`, `issueCode`, reason, path, fallback and ordering
parameters without retaining the issue's parameters or any thrown/item value.
Issue order remains the validator order already stored in
`ItemRuntimeSnapshot.issues`. Locale/text reprojection does not change
validation assignment, visibility or item identity.

### 8.3 Exact ADR-009 inventory delta

Revision 3 adds only this delta to sections 2.11 and 7.3:

| Classification         | Exact delta                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public core    | `CollectionTextMember`, `CollectionTextResolutionContext`, and transitively `TextResolutionContext` plus `TextResolver.resolve()` accept the item-issue branch |
| New Public core        | None                                                                                                                                                           |
| Changed Public Angular | None; no item host or text projector contract is exported                                                                                                      |
| Internal Angular       | fixed item-text projection resolves `ItemRuntimeSnapshot.issues` through the new branch                                                                        |
| Unchanged              | every schema/UI, policy, definition, identity, address, snapshot, operation, runtime, scope, validator-assignment, entry-point and package contract            |

All changed Public contracts remain Experimental + Active under ADR-009. No
symbol, package, entry point, export map, dependency, version, Stable promotion
or publication is added.

### 8.4 Angular projection and failure isolation

The fixed Internal item host resolves its own issues after item label and
structural action texts and before descendant node projection, preserving the
projection order proposed by SPEC-003. It receives only immutable normalized
definitions/snapshots and does not interpret schema or UI Schema.

An issue resolution failure uses the source fallback and continues remaining
item issues and descendants. It does not recreate the item host, renderer or
Signal Form buffer; does not affect focus, touched, dirty or validity; and does
not change the existing synchronous host-instantiation failure boundary.

### 8.5 Unchanged boundaries

Revision 3 does not change issue assignment, identity-error text, collection
or item labels/actions, item editability, stable addressing, operations,
scopes, insertion, focus recovery or lifecycle ownership. It does not activate
primitive/nested arrays, tuples, refs/composition, defaults/factories,
batches/optimism, custom collection renderers, layout, persistence, PLAN-010,
implementation, Stable promotion or publication.

### 8.6 Review and acceptance gate

Revision 3 may be accepted only after a complete review confirms:

1. the new context represents only an issue already assigned to an item root;
2. its source/fallback and blank-string semantics match existing issue text
   resolution;
3. every transitive Public Experimental contract is named with no new symbol;
4. Angular ownership and failure isolation remain Internal and unchanged;
5. all revision 1–2 behavior and deferred boundaries remain closed; and
6. acceptance only unblocks SPEC-003 corrections and repeated review.

Any correction requires the complete review to repeat until zero findings.
Acceptance does not accept SPEC-003, authorize PLAN-010 or permit
implementation/publication.

The complete revision 3 review passed all six areas in cycle 1 with zero
findings and no documentation conflict. Ricard explicitly accepted revision 3
on 14 July 2026. Acceptance unblocks SPEC-003 corrections and repeated review
only; it does not accept the SPEC or authorize PLAN-010 or implementation.

## 9. Accepted revision 4 — collection-node ordinary text resolution

> This section is Accepted. Revisions 1–3 remain authoritative except for the
> exact node-type widening below. The revision changes only the definition-node type accepted by the
> existing object text context; it does not reopen text members, sources,
> fallback behavior, diagnostics, Angular ownership or implementation.

### 9.1 Conflict being corrected

SPEC-003 complete review cycle 2 found that accepted revision 1 assigns
array-path validator issues to `ArrayRuntimeSnapshot.issues` and requires the
fixed collection host to expose its normalized label, description, hint,
tooltip and own issues. However, `ObjectTextResolutionContext.node` is closed
to `ObjectFieldDefinition`, while `CollectionTextResolutionContext` represents
only collection identity, item label/action and item-root issue members.

An `ArrayNodeDefinition` therefore cannot enter `TextResolver.resolve()` for
ordinary node text without being mis-typed as an object, bypassing the Public
resolver or silently widening an Accepted Public contract. The existing
`ObjectTextMember` already contains exactly the required ordinary members, so
revision 4 widens only its node definition type.

### 9.2 Exact Public text contract

Both branches of `ObjectTextResolutionContext` replace their `node` member
with the following exact type; every other member remains unchanged:

```ts
export type ObjectTextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly node: ObjectFieldDefinition | ArrayNodeDefinition;
      readonly member: Exclude<ObjectTextMember, 'issue'>;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly node: ObjectFieldDefinition | ArrayNodeDefinition;
      readonly member: 'issue';
      readonly issue: ValidationIssue;
    };
```

`ObjectTextMember` remains exactly
`'label' | 'description' | 'hint' | 'tooltip' | 'issue'`. An array context
represents only text normalized on that array definition or an issue already
assigned to its `ArrayRuntimeSnapshot`; it cannot represent identity errors,
item labels/actions, item-root issues or descendant issues assigned elsewhere.

The source, fallback, blank-string and reprojection semantics remain the
accepted ordinary object-node rules. In particular, label retains a non-blank
fallback; optional description/hint/tooltip and issue text accept a blank
string; and an issue source remains exactly
`issue.fallbackMessage ?? issue.code`. Revision 4 adds no new diagnostic code,
reason, parameter or projection order.

### 9.3 Exact ADR-009 inventory delta

Revision 4 adds only this delta to sections 2.11, 7.3 and 8.3:

| Classification         | Exact delta                                                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public core    | `ObjectTextResolutionContext.node`, and transitively `TextResolutionContext` plus `TextResolver.resolve()`, accept `ObjectFieldDefinition \| ArrayNodeDefinition`       |
| New Public core        | None                                                                                                                                                                    |
| Changed Public Angular | None; no collection host or text projector contract is exported                                                                                                         |
| Internal Angular       | fixed collection-node text projection may pass its normalized `ArrayNodeDefinition` and assigned array issue through the widened context                                |
| Unchanged              | all text members and semantics; collection-specific contexts; every schema/UI, identity, address, snapshot, operation, runtime, scope, entry-point and package contract |

All changed Public contracts remain Experimental + Active under ADR-009. No
symbol, package, entry point, export map, dependency, version, Stable promotion
or publication is added.

### 9.4 Angular projection and unchanged boundaries

The fixed Internal collection host uses the widened context for its ordinary
node texts and own assigned issues. It continues to consume only immutable
normalized definitions and snapshots, and does not interpret schema or UI
Schema. `CollectionTextResolutionContext` remains responsible only for its
accepted identity/item/action/item-issue branches.

Revision 4 changes no issue assignment, identity state, item behavior,
operation, scope, accessibility, focus, lifecycle, Signal Forms or host
failure-isolation contract. It does not activate primitive/nested arrays,
tuples, refs/composition, defaults/factories, batches/optimism, custom
collection renderers, layout, persistence, PLAN-010, implementation, Stable
promotion or publication.

### 9.5 Review and acceptance gate

Revision 4 may be accepted only after a complete review confirms:

1. the widened context represents only ordinary text or an issue owned by an
   object or array node;
2. the existing member, source, fallback and blank-string semantics remain
   unchanged;
3. every transitive Public Experimental contract is named with no new symbol;
4. collection projection remains Internal and framework-neutral;
5. all revisions 1–3 and deferred boundaries remain closed; and
6. acceptance only unblocks correction and repeated complete review of
   SPEC-003.

Any correction requires the complete review to repeat until zero findings.
Acceptance does not accept SPEC-003, authorize PLAN-010 or permit
implementation/publication.

The complete revision 4 review passed all six areas in cycle 1 with zero
findings and no documentation conflict. Ricard explicitly accepted revision 4
on 14 July 2026. Acceptance unblocks correction of F-007 and another complete
SPEC-003 review only; it does not accept the SPEC or authorize PLAN-010 or
implementation.
