# SPEC-003: Homogeneous Object Collection Controlled Runtime Extension

- **State:** Accepted
- **Version:** 0.1.2
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Milestone:** M10 — Homogeneous object collections
- **Promoted capability:** [`D-006`](../roadmap/deferred-decisions.md)
- **Accepted baselines:**
  [`SPEC-001 v0.1.15`](./001-controlled-form-runtime.md) and
  [`SPEC-002 v0.1.2`](./002-nested-object-runtime.md)
- **Accepted architecture:**
  [`ADR-015 revision 4`](../adrs/015-modelo-colecciones-identidad-operaciones.md)
- **Accepted dialect decision:**
  [`ADR-005 revision 2`](../adrs/005-politica-dialecto-json-schema.md)
- **Implementation plan:** Completed PLAN-010 revision 0
- **Implementation state:** All seven checkpoints completed after final
  repeated implementation review with zero findings

## 1. Status and authority

This Accepted specification defines the observable M10 collection extension. ADR-015 revision
4 and ADR-005 revision 2 are the Accepted architectural constraints. SPEC-003
extends SPEC-001 and SPEC-002 only where it explicitly replaces their array or
numeric-path exclusions; unchanged accepted behavior remains authoritative.

Acceptance of this SPEC authorizes preparation and review of PLAN-010 only. It
does not approve that plan, authorize implementation, change package or API
stability, or authorize publication.

## 2. Goals

M10 shall:

1. compile an array property with one homogeneous inline object item schema;
2. keep static item templates separate from controlled runtime instances;
3. address items by application-owned stable string identity, never position;
4. expose immutable collection, item and item-descendant snapshots;
5. emit strict item-leaf and single-item structural operations;
6. preserve controlled state, deterministic diagnostics and structural sharing;
7. map positional validator results to stable runtime instances; and
8. project an accessible fixed collection host in Angular.

## 3. Non-goals

M10 does not support:

- primitive arrays, arrays of arrays, arrays nested inside item templates or
  tuples;
- `prefixItems`, `contains`, `minContains`, `maxContains`, `minItems`,
  `maxItems`, `uniqueItems` or `unevaluatedItems`;
- refs, resources, composition, conditionals or additional dialects;
- generated identities, editable identities, defaults, item factories or
  implicit Add actions;
- batches, optimistic updates, ancestor pruning, undo/redo or dynamic
  definitions;
- selection, drag-and-drop, tables, grids, pagination, virtualization, custom
  collection renderers or general layout;
- async/framework validation, persistence, submit or saving state; or
- new packages or entry points, Stable promotion or publication.

## 4. Compilation input and policy

Compilation adds application-owned metadata outside JSON Schema and UI Schema:

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

`collectionPolicies` absent is equivalent to an empty array. Every supported
array path requires exactly one policy; every policy must resolve exactly one
supported array. Paths are absolute, non-empty and string-only. The identity
name is an exact string and names one direct own item property; empty and
whitespace names are valid when the item schema declares that exact property.

All policy containers, indices and members are inspected through own
descriptors without invoking accessors. Copied paths and diagnostic parameters
are deeply immutable and never retain caller policy objects.

### 4.1 Policy diagnostics

Exterior policy shape failures use one blocking schema diagnostic:

| Code                        | Parameters                                                                    | Path |
| --------------------------- | ----------------------------------------------------------------------------- | ---- |
| `INVALID_COLLECTION_POLICY` | `{ reason, policyIndex?, member?, expected, actualType?, firstPolicyIndex? }` | none |

`reason` is exactly `policies-not-array`, `sparse-policy`,
`policy-index-accessor`, `policy-not-object`, `member-missing`,
`member-accessor`, `invalid-path`, `invalid-identity-property` or
`duplicate-array-path`. `policyIndex` appears after an index is selected;
`member` is `path` or `itemIdentityProperty` for a member defect;
`firstPolicyIndex` appears only for `duplicate-array-path`. `expected` is
exactly `array`, `collection policy object`, `non-empty string-only path` or
`string`, as applicable. `actualType` uses the existing safe actual-type
vocabulary and appears only when a data value was safely inspected; it is
absent for missing/accessor/sparse and duplicate defects. Fallback:
`Collection policy configuration is invalid.`

Semantic policy failures occur at the first dependent array in schema order:

| Code                        | Parameters                                  | `dataPath` |
| --------------------------- | ------------------------------------------- | ---------- |
| `MISSING_COLLECTION_POLICY` | `{ arrayPath }`                             | array path |
| `UNUSED_COLLECTION_POLICY`  | `{ policyIndex, arrayPath }`                | none       |
| `INVALID_COLLECTION_POLICY` | `{ reason, policyIndex, member, expected }` | array path |

`UNUSED_COLLECTION_POLICY` represents `array-path-not-found`. Semantic
`INVALID_COLLECTION_POLICY.reason` is exactly
`identity-property-not-found`, `identity-property-not-required` or
`identity-schema-incompatible`; its `member` is always
`itemIdentityProperty`, and `expected` is respectively `direct item property`,
`required item property` or `required direct string identity property`.
`arrayPath` is always a frozen copy. All codes use `severity: 'error'`,
`source: 'schema'`, no
`documentPath`, and block a partial definition. Fallbacks are respectively
`Collection policy is required.`, `Collection policy does not target a
supported array.` and `Collection policy is incompatible with the item
schema.`

Exterior policy errors precede schema traversal. Schema-independent array/item
diagnostics still run after a structurally valid policy list. Semantic policy
errors follow the independent schema diagnostics of their first dependent
array. Unused policies are emitted after the complete schema traversal in
policy-index order. Identity-dependent schema/UI diagnostics are suppressed
when identity cannot be uniquely resolved; independent traversal continues.

## 5. Supported JSON Schema subset

The root remains the object accepted by SPEC-001/SPEC-002. An array is accepted
only as a property of a supported root/nested object outside an item template.

An array node supports exactly `type: "array"`, required own `items`, optional
`title`/`description`, and metadata-only `default`. `items` must be an own data
property containing an ordinary inline object schema with own `type: "object"`
and own ordinary-object `properties`; its optional `required` follows the
accepted object rules. The item root supports only `type`, `properties` and
`required` and is not itself a text-bearing data node.

Item properties may contain the accepted nested-object and primitive-leaf
subset. An array anywhere inside an item template emits
`UNSUPPORTED_FIELD_TYPE` with `reason: 'nested-array-not-supported'` and does
not inspect its `items`. Multiple independent arrays outside item templates are
valid and require independent policies.

The identity property must be a direct own item property, occur exactly once
in own `required`, and declare only `type: "string"` plus known ignored
annotations. It does not admit title, description, default, constraints,
`enum`, object/array keywords or UI metadata.

Missing, inherited or accessor `items`, and a non-ordinary-object value, emit
`INVALID_SCHEMA_KEYWORD_VALUE` at its exact path with
`expected: 'inline object item schema'` and the safe `actualType`. Array
keywords and compatibility rules otherwise follow ADR-005 revision 2 exactly.
Schema traversal is iterative, descriptor-safe and depth-first pre-order.
Active-ancestry cycles reuse `CYCLIC_SCHEMA_OBJECT`; sibling sharing is legal.

Inside a template, schema diagnostics use the absolute array `dataPath` and add
frozen `parameters.templatePath` with the relative string-only path; item root
uses `[]`. `documentPath` remains the exact schema-document path. Existing
diagnostic parameter envelopes are otherwise unchanged.

## 6. Structural UI Schema

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

The normalized schema kind selects the structural UI branch. Array UI supports
only ordinary node text and optional item UI. Item `order`/`fields` applies to
direct editable children and recursively reuses the accepted structural UI
rules. Omitted `item` is empty item UI.

Array UI rejects placeholder, enum labels, numeric options, `order`, `fields`,
actions and item text as incompatible. `item` is incompatible on object and
primitive nodes. A present accessor or malformed `item` emits
`INVALID_UI_SCHEMA_VALUE` with `expected: 'item UI object'`. An identity entry
in `item.fields` emits `INCOMPATIBLE_UI_OPTION` with exactly
`{ field, fieldType: 'string', option: 'identity', reason:
'identity-property' }` and is not traversed as a field.

UI traversal is descriptor-safe and uses active-ancestry identity;
`CYCLIC_UI_SCHEMA_OBJECT` stops only the cyclic branch. Diagnostics within an
item use the absolute array `dataPath`, exact UI `documentPath`, and frozen
relative `parameters.templatePath`. Ordering follows ADR-005 revision 2.

## 7. Normalized definition

The Public model adds the exact ADR-015 contracts:

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

`FormNodeDefinition` adds `ArrayNodeDefinition`. Collection paths retain every
ADR-014 invariant and `key === JSON.stringify(path)`. Template relative paths
are non-empty, string-only and unique; child paths equal parent path plus name.
Their keys equal `JSON.stringify(['template', arrayPath, relativePath])`.
Identity appears only in `ArrayNodeDefinition.identity`, never in editable
template children or fields.

`FormDefinition.fields` remains the static projection of non-collection leaves.
Template leaves live only in `ArrayNodeDefinition.item.fields`. Every emitted
definition, template, path and projection is deeply immutable. Manual
definition validation rejects malformed/cyclic/reused templates, duplicate
paths, inconsistent projections, identity/template overlap and nested arrays
before validator invocation.

### 7.1 Manual definitions

Runtime creation reports exactly one `INVALID_RUNTIME_OPTIONS` before external
data inspection or validation:

```ts
{
  member: 'definition';
  expected: 'valid collection FormDefinition';
  reason: 'invalid-value';
  actualType: string;
  definitionReason:
    | 'nodes-not-array'
    | 'invalid-node'
    | 'cyclic-node'
    | 'reused-node'
    | 'duplicate-node-path'
    | 'inconsistent-leaf-projection'
    | 'invalid-array-node'
    | 'invalid-item-identity'
    | 'invalid-item-template'
    | 'cyclic-template'
    | 'reused-template'
    | 'duplicate-template-path'
    | 'inconsistent-template-leaf-projection'
    | 'identity-template-overlap'
    | 'nested-array-template';
  nodeIndexPath?: readonly number[];
  firstNodeIndexPath?: readonly number[];
  templateIndexPath?: readonly number[];
  firstTemplateIndexPath?: readonly number[];
  fieldIndex?: number;
  path?: readonly string[];
  relativePath?: readonly string[];
}
```

The first six reasons and their locators retain SPEC-002 meaning.
`invalid-array-node` covers malformed array base/identity/item members;
`invalid-item-identity` covers a missing/non-string identity property;
`invalid-item-template` covers malformed item root/children/fields;
`cyclic-template`/`reused-template` add both template locators;
`duplicate-template-path` adds current/first template locators and
`relativePath`; `inconsistent-template-leaf-projection` adds `fieldIndex` and
applicable template locator; `identity-template-overlap` adds
`relativePath: [identity.property]`; and `nested-array-template` adds the
offending template locator/path. `path` appears after a valid collection path
is known. Every locator/path is copied and frozen.

Validation is iterative depth-first pre-order over root nodes. On an array it
validates the array/identity/item exterior, template children, item `fields`,
then continues root siblings; global `FormDefinition.fields` is checked last.
The first blocking defect is returned. `applyFormOperation()` uses
`INVALID_FORM_DEFINITION`, fallback `Form definition is invalid.`, and the same
`definitionReason` plus applicable locators directly in parameters; it collects
independently inspectable definition defects in that order and performs no
membership/data traversal after any definition error.

## 8. Addressing, keys and paths

```ts
export interface CollectionItemAddress {
  readonly collectionPath: readonly string[];
  readonly itemId: string;
}

export interface CollectionNodeAddress extends CollectionItemAddress {
  readonly relativePath: readonly string[];
}
```

Collection paths are absolute string-only definition paths. Stable addresses
are mutation, item lookup and item-scope identities. Numeric `DataPath`
segments are valid only as positional observations at the current index of a
supported collection. Consumers never use a numeric path as an item intention
or stable scope target.

Canonical keys are exactly:

```ts
collectionKey = JSON.stringify(collectionPath);
itemKey = JSON.stringify(['item', collectionPath, itemId]);
instanceNodeKey = JSON.stringify([
  'item-node',
  collectionPath,
  itemId,
  relativePath,
]);
```

DOM bases and suffixes follow ADR-015 section 2.3. Keys and IDs are opaque and
must not be parsed or reconstructed by consumers.

## 9. External data, presence and identity

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

Missing and incompatible arrays use `identityState: { kind: 'valid' }` because
there is no inspectable item identity sequence; presence remains the canonical
unavailability state. For an accessible array, core inspects dense indices and
direct identity properties with own descriptors. An accessor array slot is not
an ordinary item and uses `non-object-item`. `firstIndex` exists only for a
duplicate and identifies its earlier item. The snapshot records the first
failure in ascending index order.

Identity is a non-blank exact string, opaque and unique within the collection.
Core performs no coercion, trim, case or Unicode normalization. Invalid
identity exposes no items or item leaves, clears ambiguous item interaction and
makes collection/root invalid. It is not a synthetic `ValidationIssue` and does
not block runtime creation or recovery through a later external update.

The runtime emits one ephemeral `INVALID_COLLECTION_IDENTITY` diagnostic for
each independently inspectable invalid item during creation/update processing,
ordered by collection definition then ascending index. It has `severity:
'error'`, `source: 'runtime'`, array `dataPath`, no `documentPath`, fallback
`Collection item identity is invalid.`, and parameters
`{ reason, index, identityProperty, firstIndex? }` using the closed state reasons.
Only a duplicate has `firstIndex`; no item or hostile identity value is retained.
These diagnostics are delivered through the existing runtime diagnostic
channel and never stored as issues.

### 9.1 External managed-tree safety

Initial options and atomic updates retain SPEC-002's descriptor-safe external
tree contract. Collection inspection order is `value` before `baselineValue`,
definition depth-first order, array index ascending and editable template
depth-first order.

- An accessor on an object property leading to the collection uses the accepted
  blocking `INVALID_RUNTIME_OPTIONS` or `INVALID_EXTERNAL_STATE_UPDATE` managed
  accessor diagnostic at that absolute path.
- A sparse array slot yields `sparse-item`; an accessor slot is never invoked
  and yields identity reason `non-object-item`.
- An identity accessor is never invoked and yields `identity-accessor`.
- Only after the complete identity sequence is valid are editable managed
  descendants inspected. An accessor on an item object/leaf descendant uses the
  accepted blocking managed-accessor diagnostic at its current positional path.
- An identity-invalid collection exposes no descendants, so descendant
  accessor inspection for that collection stops; independent collections and
  baseline branches continue safely.

The blocking option/update parameters remain exactly
`{ member, expected: 'ordinary data tree at managed paths', reason:
'invalid-value', actualType: 'object', propertyReason: 'accessor' }`, with
`member` equal to `value` or `baselineValue`, no `documentPath`, and the first
accessor path as `dataPath`. A failed update is atomic, does not invoke the
validator and preserves all previous references/interaction.

Identity-invalid data alone is non-blocking: creation/update succeeds with the
identity state/diagnostics, skips only unaddressable descendants, invokes the
external validator once and publishes at most one snapshot. No accessor is
executed or represented as a business value.

## 10. Runtime snapshots and structural sharing

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

`NodeRuntimeSnapshot` adds the array variant. `FormRuntimeSnapshot.nodes`
remains the root definition projection. Its dynamic `fields` walks root nodes
depth-first and expands valid collections in controlled item order and template
field order, reusing the exact leaf references in the item trees. Unavailable
collections contribute no dynamic leaves.

Each item-instance `FieldRuntimeSnapshot` uses
`JSON.stringify(['item-node', collectionPath, itemId, relativePath])` as its
stable `key` and the current positional
`[...collectionPath, index, ...relativePath]` as its `path`. Its corresponding
definition input is the exact `FieldTemplate` reference from the static item
template. Movement therefore preserves logical key/definition ownership while
rebuilding wrappers whose observable positional path changes.

Stable-address reads are exact:

```ts
getItemSnapshot(
  address: CollectionItemAddress,
): ItemRuntimeSnapshot | undefined;

getCollectionNodeSnapshot(
  address: CollectionNodeAddress,
): RuntimeTreeSnapshot | undefined;
```

They are synchronous, side-effect-free and return `undefined` for malformed,
unknown, removed or unaddressable identities. Empty `relativePath` returns the
item; a non-empty path resolves one exact descendant. `getNodeSnapshot()`
remains positional read-only, returns an item at its exact current index path,
and changes its return type to `RuntimeTreeSnapshot | undefined`.

Structural sharing is identity-based. Immutable replacement preserves
unchanged logical descendants. A move preserves interaction and leaf ownership,
but every item/descendant wrapper whose observable `index`, positional
`dataPath`, child reference or aggregate changes is rebuilt. Unaffected items
whose complete observable state and position are unchanged retain reference.
Removal releases interaction and Angular ownership for that ID.

## 11. Dirty and interaction

For valid current and baseline collections, collection dirty is true when
presence differs, identity order differs, or a matched item has a dirty managed
descendant. Current and baseline items match only by identity. Inserted and
removed identity dirty belongs to the array and is not duplicated below it;
unmanaged item properties do not contribute.

If either side is incompatible or identity-invalid, the collection owns dirty
using presence plus `Object.is` on the external array/value reference and
unavailable descendants remain clean.

Touched and focused state are keyed by item ID plus relative primitive-leaf
path. Moves and immutable replacement preserve them. Removal or identity change
discards vanished interaction and clears its focus without setting touched.
Invalid identity clears all interaction for that collection. Baseline-only
updates do not affect interaction. Collection/item aggregate flags are derived,
and at most one primitive leaf is focused per runtime.

The existing interaction signatures become:

```ts
focus(target: DataPath | CollectionNodeAddress): RuntimeActionResult;
blur(target: DataPath | CollectionNodeAddress): RuntimeActionResult;
```

A non-collection `DataPath` retains SPEC-002 behavior and must remain
string-only. Any numeric `DataPath`, including a currently valid positional
item path, is invalid as an interaction intention. A `CollectionNodeAddress`
must identify a current item and one non-empty exact primitive-leaf relative
path. It keys interaction by stable item ID, survives movement and follows the
accepted missing-/incompatible-ancestor behavior inside that item. Unknown or
invalid identity uses `UNADDRESSABLE_COLLECTION`; malformed targets use the
existing runtime action-argument diagnostic before state inspection.

## 12. Operations and application

`FormOperation` adds the exact five variants and `CollectionPlacement` from
ADR-015 sections 2.7–2.8: `set-item-value`, `remove-item-value`, `insert-item`,
`remove-item` and `move-item`. Their discriminants, members and concurrency
semantics are normative and unchanged.

Item-leaf targets require a non-empty relative path resolving one editable
primitive template leaf; identity cannot be targeted. `identityProperty` makes
`applyOperation()` schema-neutral. `applyFormOperation()` first verifies the
definition-owned property and managed template target. Concurrent movement
does not stale an item-leaf operation; terminal mismatch still does.

Structural operations target item/anchor IDs. Insert requires a full opaque
application item whose own data identity equals `itemId`; the wrapper and
placement are frozen but the item is neither cloned nor frozen and successful
application inserts its exact reference. Move to an already-satisfied placement
is successful no-effect; self-anchor is invalid. Missing/duplicate target or
anchor, or an existing duplicate ID on insert, is stale.

All helpers are pure and atomic, clone only the ordinary-object ancestor chain
and array, preserve off-path descriptors and item references, and return the
existing `ApplyOperationResult`. `start`/`end` insert may materialize a missing
array and compatible missing object ancestors. Anchor placement cannot target a
missing array. Incompatible ancestors/arrays and accessors fail without change.

### 12.1 Operation shape

The accepted `INVALID_OPERATION` contract continues to validate the outer
operation, `type`, `metadata` and `source`; its existing parameter shapes do not
change. After a recognized M10 discriminant, variant members are inspected
descriptor-safely in this exact order:

1. `set-item-value`: `target.collectionPath`, `target.itemId`,
   `target.relativePath`, `identityProperty`, `expected`, `value`;
2. `remove-item-value`: the same order without `value`;
3. `insert-item`: `collectionPath`, `identityProperty`, `itemId`, `item`,
   `placement.kind`, then `placement.itemId` for before/after;
4. `remove-item`: `collectionPath`, `identityProperty`, `itemId`; and
5. `move-item`: remove-item order, then `placement.kind` and conditional
   `placement.itemId`.

M10-specific shape failures use `INVALID_COLLECTION_OPERATION` with exactly:

```ts
{
  operationType:
    | 'set-item-value'
    | 'remove-item-value'
    | 'insert-item'
    | 'remove-item'
    | 'move-item';
  member: string;
  expected: string;
  reason:
    | 'missing-member'
    | 'accessor-member'
    | 'invalid-value'
    | 'identity-property-mismatch'
    | 'identity-target-not-editable'
    | 'self-anchor';
  actualType?: string;
}
```

`member` is the exact dotted member path named above. `expected` is exactly
`collection node address`, `collection item address`, `non-empty string-only
path`, `string`, `non-blank string`, `non-empty string-only relative path`, `own
data property`, `collection placement`, `definition identity property`,
`editable template leaf` or `different anchor item`, as applicable. The
existing `INVALID_OPERATION` expectation-object/kind/value envelope is reused
unchanged for both item-leaf variants. `actualType` appears only for
`invalid-value`; missing/accessor members never evaluate a value. Paths are
dense own-data arrays copied before validation; each malformed element is
reported through its indexed dotted member and stops only that path branch.
Extra operation/placement properties remain ignored.

The diagnostic uses `severity: 'error'`, `source: 'runtime'`, no
`documentPath`, fallback `Collection operation is invalid.`, and no `dataPath`
until a complete collection path has been copied. `identity-property-mismatch`,
`identity-target-not-editable` and `self-anchor` occur only after that point and
use the collection path as `dataPath`.

### 12.2 Managed, value and stale diagnostics

Collection operations add these codes rather than changing closed
non-collection parameter envelopes:

| Code                                      | Exact parameters                                                               | Fallback                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------- |
| `COLLECTION_PATH_NOT_MANAGED`             | `{ operationType, collectionPath, relativePath? }`                             | `Collection operation path is not managed.`   |
| `INCOMPATIBLE_COLLECTION_OPERATION_VALUE` | `{ operationType, reason, actualType, field?, fieldType?, identityProperty? }` | `Collection operation value is incompatible.` |
| `STALE_COLLECTION_OPERATION`              | `{ operationType, reason, itemId, anchorItemId? }`                             | `Collection operation target is stale.`       |

`operationType` uses the five-discriminant union above. For
`COLLECTION_PATH_NOT_MANAGED`, `relativePath` appears only for item-leaf
variants; both paths are frozen copies.

`INCOMPATIBLE_COLLECTION_OPERATION_VALUE.reason` is exactly
`collection-not-array`, `leaf-type`, `item-not-object` or
`item-identity-mismatch`. `collection-not-array` can apply to any variant and
uses the safe collection-value type; `leaf-type` appears only for
`set-item-value` and adds exact template `field` and primitive `fieldType`;
`item-not-object` uses safe actual type; `item-identity-mismatch` adds the
definition-owned `identityProperty` and the safe actual type of the inserted
identity. It never retains the collection, inserted item or identity value.

`STALE_COLLECTION_OPERATION.reason` is exactly `collection-missing`,
`item-not-found`, `anchor-not-found`, `item-id-already-exists`,
`duplicate-identity` or `invalid-identity`. `anchorItemId` appears only for
`anchor-not-found`; `itemId` and anchor are already validated exact strings.
Item-leaf terminal presence/`Object.is` mismatch deliberately retains the
existing `STALE_OPERATION` code and exact expectation parameter envelope, with
the current positional leaf path as `dataPath` and no added `reason` member.

All three new codes use `severity: 'error'`, `source: 'runtime'`, no
`documentPath`, immutable safe parameters and collection `dataPath` except that
a resolved item-leaf incompatibility/stale terminal uses its current positional
leaf path. `INCOMPATIBLE_OPERATION_ANCESTOR` and
`UNSUPPORTED_OPERATION_PROPERTY` retain their accepted parameters and use the
first offending positional prefix. Failure/no-effect returns the exact original
root reference; no successful no-effect emits a diagnostic.

### 12.3 Validation order and branch stopping

Both helpers use this order:

1. current root target;
2. outer/base operation members and M10 variant members in section 12.1 order;
3. for `applyFormOperation()`, complete definition validation;
4. managed collection/template membership and exact identity-property match;
5. ancestor/array descriptors and compatibility;
6. ascending-index collection identity scan;
7. structural stable target/anchor or item-leaf terminal expectation; and
8. inserted-item or leaf basic value compatibility followed by effect.

An earlier dependent failure stops later stages. Independently malformed
operation members are collected in fixed member order. Any definition error
prevents membership or data traversal. Accessors stop their current traversal
without invocation. Invalid/duplicate identity prevents every target/effect in
that collection. Existing non-collection operation diagnostics, parameters,
fallbacks and precedence remain unchanged.

## 13. Runtime intentions and controlled confirmation

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
focus(target: DataPath | CollectionNodeAddress): RuntimeActionResult;
blur(target: DataPath | CollectionNodeAddress): RuntimeActionResult;
```

Arguments are copied and validated before controlled state. Each request uses
the definition-owned identity property, latest confirmed snapshot and existing
sequential metadata, and emits at most one operation. There is no optimistic
projection. Confirmation or rejection occurs only through external state.

### 13.1 Action argument diagnostics

Malformed collection-action arguments return one
`INVALID_COLLECTION_RUNTIME_TARGET` per independently inspectable defect in
argument/member order, with:

```ts
{
  action:
    | 'requestSetItemValue'
    | 'requestRemoveItemValue'
    | 'requestInsertItem'
    | 'requestRemoveItem'
    | 'requestMoveItem'
    | 'focus'
    | 'blur';
  member: string;
  expected: string;
  reason:
    | 'missing-member'
    | 'accessor-member'
    | 'invalid-value'
    | 'node-not-managed'
    | 'non-leaf-target'
    | 'self-anchor';
  actualType?: string;
}
```

Address members are inspected as `collectionPath`, `itemId`, then
`relativePath`; insert adds `item`, then placement kind/conditional anchor;
move adds placement after its address. `expected` uses the same closed strings
as section 12.1 plus `managed primitive leaf`. `node-not-managed`,
`non-leaf-target` and `self-anchor` occur only after a complete collection path
has been copied and therefore use that `dataPath`; `actualType` appears only for
safely inspected invalid values. The code is `error`/`runtime`, has no
`documentPath`, fallback `Collection runtime target is invalid.`, and no
`dataPath` for earlier shape failures. No accessor is invoked and no item,
placement or caller address object is retained.

A `focus`/`blur` array input continues through the accepted non-collection
`DataPath` validation and `UNKNOWN_RUNTIME_PATH` envelope. An ordinary-object
input is parsed only as `CollectionNodeAddress`; malformed or unmanaged stable
addresses never fall back to positional interpretation.

An otherwise valid request against missing/incompatible presence or invalid
identity returns one `UNADDRESSABLE_COLLECTION` diagnostic with array
`dataPath`, no `documentPath`, fallback `Collection is not addressable.`, and:

```ts
{
  action:
    | 'requestSetItemValue'
    | 'requestRemoveItemValue'
    | 'requestInsertItem'
    | 'requestRemoveItem'
    | 'requestMoveItem'
    | 'focus'
    | 'blur';
  reason:
    | 'collection-missing'
    | 'incompatible-ancestor'
    | 'incompatible-array'
    | 'invalid-identity'
    | 'collection-not-managed'
    | 'item-not-found'
    | 'anchor-not-found'
    | 'item-id-already-exists';
  blockingPath?: DataPath;
}
```

It uses `severity: 'error'` and `source: 'runtime'`; `blockingPath` appears only
for an incompatible ancestor. `requestInsertItem()` with start/end is the sole
exception to `collection-missing` and may emit materialization. Remove/move and
item-leaf requests require current addressability. Invalid action arguments and
disposed runtime checks retain their existing precedence.

`incompatible-ancestor` here means an ancestor that prevents reaching the
collection, so no item can be addressed. After a valid collection/item address
has resolved, an incompatible object inside that item retains SPEC-002's exact
`INCOMPATIBLE_RUNTIME_ANCESTOR` result and positional blocking path. A missing
object inside an addressable item permits set/focus/blur materialization
semantics and makes remove a no-effect exactly as in SPEC-002.

For stable `focus`/`blur`, `UNADDRESSABLE_COLLECTION.action` additionally
accepts exactly `focus` or `blur`. A successfully resolved target uses its
current positional leaf path as diagnostic `dataPath`; its copied stable
address remains the action target and is never rewritten to an index.

## 14. Validation, scopes and visibility

The validator receives unchanged original schema and complete positional value
once per relevant update. Its issue paths remain positional. Array-path issues
attach to the array; exact current index issues attach to the item; descendants
attach to the exact managed descendant or deepest item/object ancestor.
Identity-property issues attach to the item despite being non-editable.
Out-of-range indices fall back to the array/deepest existing ancestor. Under
invalid identity, every issue below the array attaches to the array in validator
order. Core neither rewrites issue paths to IDs nor synthesizes issues.

```ts
export type FormScopeTarget =
  DataPath | CollectionItemAddress | CollectionNodeAddress;

export interface FormScope {
  readonly id: string;
  readonly paths: readonly FormScopeTarget[];
  readonly includeGlobalIssues?: boolean;
}
```

An array `DataPath` selects its current items. An item address follows the ID;
a node address follows its relative descendant. Numeric `DataPath` scope
targets remain invalid. Removed IDs are unknown and produce the existing
warning. Overlap, visibility, global issues and reset semantics are unchanged.
Scopes do not mutate, persist, insert, remove, move, select or define layout.

## 15. Text resolution

Accepted ADR-015 revision 4 widens the existing ordinary node context without
adding a symbol or member:

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

`ObjectTextMember` remains exactly label, description, hint, tooltip and issue.
An array branch resolves only normalized text on that array node or an issue
already assigned to its `ArrayRuntimeSnapshot`. Label retains the accepted
non-blank source/result fallback; optional description/hint/tooltip and issue
results accept blank. An array issue source is exactly
`issue.fallbackMessage ?? issue.code`.

The Public `CollectionTextMember` and `CollectionTextResolutionContext` are
exactly those in ADR-015 sections 2.10 and accepted revision 3. Fixed source
strings are:

- `Collection items have invalid identity.`;
- `Item <position>`;
- `Remove item <position>`;
- `Move item <position> earlier`; and
- `Move item <position> later`.

An item-root issue source is exactly
`issue.fallbackMessage ?? issue.code`. Its accepted context has
`member: 'issue'`, the current immutable item snapshot and the exact issue.

Position is interpolated as a one-based decimal before resolution. Projection
order is collection label, optional description/hint/tooltip, identity error
when invalid, collection issues, then each item in controlled order: item label,
remove, move earlier, move later, item issues and descendants.

For identity/label/action members, resolver exception, non-string or blank
result falls back to the exact source. For an item-root issue, a string result
including blank is accepted; exception or non-string result falls back. Each
failure emits one `TEXT_RESOLUTION_FAILED` warning with collection `dataPath`,
no `documentPath`, fallback `Text resolution failed for collection
"<collection.name>".`, and the applicable closed shape:

```ts
{
  node: collection.name,
  nodeKind: 'array',
  member: ObjectTextMember,
  ...(member === 'issue' ? { issueCode: issue.code } : {}),
  reason: 'exception' | 'non-string-result' | 'blank-string-result',
}

{
  node: collection.name,
  nodeKind: 'array',
  member: Exclude<CollectionTextMember, 'issue'>,
  itemId?: string, // absent only for identity-error
  reason: 'exception' | 'non-string-result' | 'blank-string-result',
}

{
  node: collection.name,
  nodeKind: 'array',
  member: 'issue',
  itemId: string,
  issueCode: string,
  reason: 'exception' | 'non-string-result',
}
```

In the ordinary array-node shape, `blank-string-result` is valid only for
`member: 'label'`; optional text and issue blank results are successful.
`itemId` is absent. The collection-specific shapes retain their accepted
identity/item/action/item-issue semantics and never represent ordinary array
node text.

Diagnostics follow projection order and never retain thrown values, issue
parameters, identity values or item values. Item issue-array identity, item
snapshot identity, form ID and locale determine item-issue reprojection;
unrelated snapshot changes do not repeat its diagnostic batch. Array definition
identity, form ID, locale and own issue-array identity determine ordinary
collection-node reprojection. The fixed Internal collection host passes the
exact normalized array definition and assigned issue through the widened
ordinary node context.

## 16. Angular projection

Angular uses fixed Internal collection and item hosts, not ADR-007 renderer
registrations. Primitive item leaves retain existing renderer selection and
Signal Forms remain private presentation buffers. Views track stable item keys.
Moves preserve logical view, renderer and focus ownership while updating order.
Each item leaf outlet binds the static `FieldTemplate`, current instance
snapshot and stable `CollectionNodeAddress`; it never sends the positional
snapshot path as a value or interaction intention.

The collection is a semantic group with an accessible label. Each item has a
legend with one-based position and fixed remove/move-earlier/move-later
controls. Movement uses adjacent stable anchors. Controls are localized and
disabled when unavailable. Application code alone supplies insertion items;
the fixed host does not synthesize Add.

The fixed collection text projection resolves normalized collection texts and
own issues through the widened ordinary node context from ADR-015 revision 4.
The fixed item text projection resolves item-root issues through ADR-015
revision 3 after label/action texts and before descendant nodes. Failure falls
back and continues without recreating the host, renderer or Signal Form buffer.

After confirmed removal, DOM focus originating in that item moves to the next
item at the removed index, otherwise the previous item, otherwise the
programmatically focusable collection legend. Confirmed movement restores the
same logical control; rejection changes no ownership. Invalid identity renders
only collection text/issues and no item/action subtree.

A synchronous fixed-host creation/binding failure destroys a partial ref,
stops only that subtree and emits exactly one
`COLLECTION_HOST_INSTANTIATION_FAILED` or
`ITEM_HOST_INSTANTIATION_FAILED`. Both are `error`/`runtime`, have no
`documentPath`, use collection `dataPath`, and fall back to `Collection host
could not be instantiated.` or `Item host could not be instantiated.`. The
first parameters are `{ node: collection.name }`; the second are
`{ node: collection.name, itemId }`. No thrown value is retained. Later
template/lifecycle/change-detection failures remain outside this boundary.

## 17. Public API migration

The exact ADR-009 inventory is ADR-015 revision 1 section 2.11 plus the accepted
revision 2, revision 3 and revision 4 deltas. In summary:

- new Public core: every policy, structural array UI, template, definition,
  address, presence, identity, snapshot, placement, operation, scope and text
  symbol named there;
- changed Public core: compiler input/UI unions, definition/runtime/operation
  unions, positional `DataPath`, dynamic field projection, text/scopes,
  operation helpers, runtime options/update/manual validation and lookups;
- new Public runtime methods: the two stable reads and five intentions with the
  exact signatures above;
- changed Public Angular: configuration, directive reads/requests/projection
  and transitive item leaf renderer inputs; and
- Internal Angular: every fixed collection/item host, text projection,
  lifecycle, ID, focus and failure helper.

The existing primitive-field text branches change every
`readonly field: FieldDefinition` member to exactly
`readonly field: FieldDefinition | FieldTemplate`; all other choice/issue
discriminants and payloads remain unchanged. Accepted revision 3 additionally
adds only the item-root issue branch described in section 15. Accepted revision
4 widens only both `ObjectTextResolutionContext.node` branches to
`ObjectFieldDefinition | ArrayNodeDefinition`; therefore
`TextResolutionContext` and `TextResolver.resolve()` accept that array-node
ordinary text/issue branch transitively. No new Public symbol or Public Angular
contract is added; fixed collection-node projection remains Internal.

The declaration-ready Angular leaf boundary is:

```ts
interface AngularFieldRenderer {
  readonly field: InputSignal<FieldDefinition | FieldTemplate>;
  // every other existing member is unchanged
}

type RendererTester = (field: FieldDefinition | FieldTemplate) => number | null;

class AngularRendererResolver {
  resolve(field: FieldDefinition | FieldTemplate): RendererResolutionResult;
}

class SchemaFieldOutletDirective {
  readonly schemaFieldOutlet: InputSignal<FieldDefinition | FieldTemplate>;
}
```

For a non-collection definition the outlet retains its absolute-path routing.
For a `FieldTemplate`, the fixed item host owns the current
`CollectionNodeAddress`; the outlet pairs that stable address with the current
instance leaf snapshot. Renderer `setValue`, `removeValue`, `fieldFocus` and
`fieldBlur` outputs route respectively to stable item value/remove and stable
focus/blur runtime intentions. A move never rebinds an existing renderer to a
different item.

`SchemaFormDirective` mirrors both stable reads, the five collection request
methods and the widened `focus`/`blur` signatures from sections 10 and 13. It
emits returned diagnostics through the existing channel and adds no new output,
host or renderer-registration contract.

Every addition/change is Public + Experimental + Active. The two existing root
entry points/export maps, application state ownership, validator port,
primitive-leaf ADR-007 registration and non-collection operation discriminants
remain unchanged. No unlisted Public symbol may be added without revising the
accepted inventory.

## 18. Conformance scenarios

PLAN-010 must map fixtures for:

1. zero, one and multiple items; multiple independent and deeply nested array
   properties outside templates;
2. exact schema/UI/policy catalog, paths, ordering, cycles, sharing and branch
   stopping under malformed/accessor inputs;
3. identity punctuation, whitespace, Unicode/lone surrogates, `__proto__`,
   duplicates and every invalid identity reason;
4. template/projection/manual-definition invariants and key/DOM collisions;
5. missing/incompatible/invalid current-baseline dirty matrices;
6. stable lookups and positional reads across insert/remove/move/replacement;
7. all five operations, stale/no-effect cases, opaque item references,
   descriptor preservation and missing-ancestor insertion;
8. confirmation, rejection, focus/touched reconciliation and structural
   sharing for moved/removed/unchanged items;
9. positional validator mapping, invalid-identity fallback, stable scopes and
   issue visibility;
10. collection/action text order, fallback and diagnostics;
11. accessible Angular projection, stable view ownership, adjacent actions,
    focus restoration and isolated host failures; and
12. exact declarations, root imports, package smoke, built/clean consumers and
    deep-import rejection without manifest/version/publication changes.

## 19. Acceptance criteria

SPEC-003 may be accepted only when:

1. every contract above is consistent with accepted ADR-015 revision 4 and
   ADR-005 revision 2;
2. policy, identity, action, operation, text and host diagnostics have closed
   reasons, parameters, paths, ordering and fallbacks;
3. template/instance, stable/positional and current/baseline semantics are
   complete and declaration-ready;
4. the exact Public Experimental migration is preserved with no unlisted API;
5. core remains framework-neutral and Angular remains projection-only;
6. every non-goal and deferred boundary remains inactive;
7. conformance scenarios can map directly to a future PLAN-010 matrix; and
8. a complete review is repeated after every correction until one cycle passes
   with zero findings and no documentation conflict.

Acceptance will authorize preparation and review of PLAN-010 only. Explicit
approval of that later plan will be required before implementation.

Ricard explicitly accepted SPEC-003 v0.1.2 on 14 July 2026 after complete
review cycle 3 passed all six areas with zero findings and no documentation
conflict. Acceptance authorizes preparation/review of PLAN-010 only; it does not
approve the plan or authorize implementation/publication.

## 20. History

| Version | Date       | Change                                                              |
| ------- | ---------- | ------------------------------------------------------------------- |
| 0.1.2   | 14-07-2026 | Closed F-007 after ADR-015 revision 4 acceptance.                   |
| 0.1.1   | 14-07-2026 | Corrected six cycle-1 findings after ADR-015 revision 3 acceptance. |
| 0.1.0   | 14-07-2026 | Initial Draft after acceptance of ADR-015 and ADR-005 revision 2.   |
