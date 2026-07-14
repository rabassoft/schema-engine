# ADR 014: Normalized nested-object model and deep controlled paths

- **Status:** Accepted
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Accepted revision:** 2 — blocked-presence renderer clarification
- **Promotes:** [`D-005`](../roadmap/deferred-decisions.md)
- **Requires:** accepted
  [`M9 promotion review`](../reviews/002-m9-nested-object-promotion.md),
  [`ADR-005`](./005-politica-dialecto-json-schema.md),
  [`ADR-007`](./007-resolucion-renderers-testers.md),
  [`ADR-008`](./008-instanciacion-renderers-angular.md), and
  [`ADR-009`](./009-politica-api-publica-estabilidad.md)
- **Accepted behavioral contract:**
  [`SPEC-002`](../specs/002-nested-object-runtime.md)
- **Implementation plan:**
  [`PLAN-009 revision 1`](../plans/009-nested-object-runtime.md), Approved;
  checkpoints 1–4 completed

## 1. Context

M1-M8 deliberately use a flat root-field model. The compiler emits
`FormDefinition.fields`, operations accept exactly one string segment, runtime
state is indexed by the first segment, and Angular creates one leaf outlet per
field. That boundary is coherent but cannot represent an object property,
distinguish branch state, or apply a controlled change below the root.

D-005 is now Promoted for design under a reviewed boundary of inline objects,
existing primitive leaves and string-only deep paths. Arrays, references,
composition, advanced layout and batches remain deferred.

## 2. Decision

Accepted revision 2 is authoritative for M9 architecture. It consists of the
revision 1 decision plus the section 7 clarification. ADR acceptance aligned
normative design only; PLAN-009 revision 1 subsequently passed its separate
review and approval gate, with implementation not yet started.
Checkpoints 1–3 subsequently established the neutral contract/helper foundation,
recursive schema/UI compiler and deep controlled operations; nested runtime
remains pending checkpoint 4.

### 2.1 Normalized nodes and leaf projection

`FormDefinition` will expose an immutable structural forest and an ordered leaf
projection:

```ts
export interface FormDefinition {
  readonly nodes: readonly FormNodeDefinition[];
  readonly fields: readonly FieldDefinition[];
}

export type FormNodeDefinition = ObjectFieldDefinition | FieldDefinition;

export interface BaseNodeDefinition {
  readonly key: string;
  readonly name: string;
  readonly path: DataPath;
  readonly required: boolean;
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
}

export interface ObjectFieldDefinition extends BaseNodeDefinition {
  readonly kind: 'object';
  readonly children: readonly FormNodeDefinition[];
}
```

`BaseFieldDefinition` extends `BaseNodeDefinition` and keeps `placeholder`.
Primitive `FieldDefinition` variants and `StringChoiceDefinition` otherwise
retain their accepted meanings.

`nodes` contains root properties in presentation order. Every object node owns
its ordered children. `fields` contains the exact same leaf object references
in depth-first pre-order. It is a required projection, not a second authority.
A manually supplied definition is invalid unless both views are acyclic,
deeply well formed and identity-consistent.

Runtime creation reports malformed trees through the existing
`INVALID_RUNTIME_OPTIONS` envelope. `applyFormOperation()` reports them through
`INVALID_FORM_DEFINITION`. Runtime creation keeps `reason: 'invalid-value'` and
uses `expected: 'valid nested FormDefinition'`; operation validation extends
its detailed reasons for nodes, cycles, duplicates and an inconsistent leaf
projection. M9 does not add a competing top-level definition diagnostic.

The implicit schema root is not a `FormNodeDefinition`. Its title and
description remain form metadata outside M9; every nested object property is an
explicit node, including an object with zero properties.

This resolves only the portion of D-014 needed by nested objects. D-014 remains
Research for a generic AST, resolved graph, render plan and model versioning.

### 2.2 Paths, names, keys and order

- M9 managed paths are non-empty arrays of string segments.
- `name` is the final local property name.
- `path` is the complete immutable path from the data root.
- `key` is exactly `JSON.stringify(path)` for the supported string-only path.
- DOM bases are
  `se-${encodeURIComponent(JSON.stringify([formId, path]))}`. The tuple is
  formed only from the validated non-empty string `formId` and immutable
  string-only managed path. JSON escaping makes encoding total even for lone
  UTF-16 surrogates and keeps both components unambiguous.
- Fixed semantic suffixes are appended as `--legend`, `--description`,
  `--hint`, `--tooltip` and `--issues`; leaf controls retain their existing
  fixed suffixes. Every encoded tuple ends in the encoded JSON array terminator,
  so no base collides with another base plus a suffix.
- A root property named `"a.b"` cannot collide with `["a", "b"]`.
- Schema property order is `Object.keys(properties)` at each object.
- UI order is applied independently among siblings; omitted siblings follow
  schema order. Leaf projection is depth-first pre-order.

No delimiter-based path serialization is a supported identity contract.

### 2.3 Structural UI metadata

UI Schema mirrors only the supported data tree:

```ts
export interface UiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
}

export type UiNodeSchema = ObjectUiSchema | FieldUiSchema;

export interface ObjectUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
}
```

The corresponding schema node determines which UI shape is valid. Object UI
nodes cannot declare `placeholder`, `enumLabels` or numeric options. Leaf UI
nodes cannot declare nested `order` or `fields`. This recursive grouping is
structural, not a layout language; D-011 and D-012 remain Deferred.

An object UI label and schema title, when present, must be non-blank. Fallback
uses the local name when non-blank and otherwise `JSON.stringify(name)`, so the
fixed structural host always has an accessible source label.

Recursive UI objects use the same active-ancestry identity rule as schema
objects: reuse in independent sibling branches is inspected per path, while a
cycle on the active UI ancestry is a blocking `CYCLIC_UI_SCHEMA_OBJECT`. No UI
accessor is executed.

### 2.4 Deep operation traversal

`set-value` and `remove-value` remain the only operations. Each operation
targets one managed primitive leaf and keeps one terminal expectation.

Traversal rules:

1. Every existing ancestor and terminal property is read through its own
   descriptor; accessors are never executed.
2. Existing ancestors must be ordinary objects with `Object.prototype` or null
   prototype. Arrays and other prototypes are incompatible.
3. `set-value` may materialize missing ancestors as ordinary
   `Object.prototype` objects. Properties, including `__proto__`, are created
   with `Object.defineProperty()`.
4. The expectation compares only the terminal property after reaching or
   materializing the branch. A concurrent compatible branch with the expected
   terminal state is preserved rather than rejected.
5. An accessor or incompatible existing ancestor fails atomically and retains
   the original root reference.
6. Successful application clones only the root-to-leaf chain, preserving each
   existing branch prototype and all non-target own property descriptors.
   At every cloned level, off-path descriptors are copied unchanged and the
   created or replaced on-path member is defined as a writable, enumerable,
   configurable data property. This applies to missing ancestors, replaced
   ancestor links and the terminal value.
7. `remove-value` requires every ancestor to exist as a compatible object and
   the terminal property to exist as a data property.
8. Removal never prunes empty ancestors. Cascading structural change and
   batches remain Deferred.
9. `undefined`, numeric segments, an empty path and object-node targets remain
   invalid.

`applyFormOperation()` additionally resolves the exact leaf in
`definition.fields` and checks its primitive kind. `applyOperation()` remains
structural and does not inspect schema constraints.

Accessor ancestors and terminals retain `UNSUPPORTED_OPERATION_PROPERTY`, with
the offending prefix in `dataPath`. A non-object ancestor uses the new
`INCOMPATIBLE_OPERATION_ANCESTOR` because it is valid external business data but
cannot be traversed structurally.

### 2.5 Branch and leaf presence

Object nodes expose:

```ts
export type ObjectPresence =
  | { readonly kind: 'missing' }
  | { readonly kind: 'object' }
  | { readonly kind: 'incompatible'; readonly value: unknown }
  | {
      readonly kind: 'blocked';
      readonly reason: 'missing-ancestor' | 'incompatible-ancestor';
      readonly at: DataPath;
    };
```

Node snapshots use their local presence only when every ancestor is an object.
Every descendant object and leaf is blocked when the first ancestor is missing
or incompatible. `at` is the immutable path of that first blocking ancestor;
descendants never synthesize a local state for a path that cannot be inspected.

Leaf snapshots retain `missing | value` when all ancestors are objects:

```ts
export type FieldPresence =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown }
  | {
      readonly kind: 'blocked';
      readonly reason: 'missing-ancestor' | 'incompatible-ancestor';
      readonly at: DataPath;
    };
```

External runtime state may contain missing managed properties or own data
properties only. An accessor at any managed node or leaf path invalidates
runtime creation/update before validation, preserving the accepted root rule.
An own data value of the wrong object type is representable as `incompatible`.

A request to set, focus or blur a leaf below a missing ancestor is allowed; set
can materialize the branch and interaction remains local runtime state. A
request below an incompatible ancestor fails without emission. Remove requires
an accessible terminal property. Renderers cannot correct incompatible
external data.

When an external value update first changes an ancestor of the focused leaf to
`incompatible`, the runtime atomically clears that focus without marking the
leaf touched. Existing touched state is preserved. A missing ancestor remains
focusable and does not trigger reconciliation. Baseline-only changes never
change interaction state.

### 2.6 Runtime snapshot tree

The runtime mirrors the definition views:

```ts
export type NodeRuntimeSnapshot = ObjectRuntimeSnapshot | FieldRuntimeSnapshot;

export interface ObjectRuntimeSnapshot {
  readonly nodeKind: 'object';
  readonly key: string;
  readonly path: DataPath;
  readonly presence: ObjectPresence;
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
  readonly children: readonly NodeRuntimeSnapshot[];
}

// FieldRuntimeSnapshot adds: readonly nodeKind: 'field'.

export interface FormRuntimeSnapshot<TData extends object> {
  // Existing root members remain.
  readonly nodes: readonly NodeRuntimeSnapshot[];
  readonly fields: readonly FieldRuntimeSnapshot[];
}
```

The `fields` array contains the same leaf snapshot references present in the
snapshot tree and follows definition leaf order.

- Only leaves store touched/focus transitions.
- An object is touched/focused when any descendant is touched/focused.
- Object validity includes its own issues and all descendants.
- Object `showIssues` follows forced/all visibility or descendant touched
  visibility; it does not mark descendants touched.
- An inspectable object dirty is true when its local presence kind differs from
  baseline, when two incompatible values differ by `Object.is`, or when any
  inspectable descendant is dirty.
- A blocked object or leaf is always locally clean. The first missing or
  incompatible object that blocks the branch exclusively owns its structural
  dirty result, so the same difference is not counted at every descendant.
- With object presence on both sides, unmanaged properties do not affect dirty.
- Missing versus an explicitly present empty object is dirty even when all
  managed leaves are missing.

The closed blocked-state matrix is:

| Current node                    | Baseline node                          | Local dirty owner                                |
| ------------------------------- | -------------------------------------- | ------------------------------------------------ |
| both inspectable                | both inspectable                       | the node, using presence/`Object.is`/descendants |
| blocked on either or both sides | any                                    | `false` at this descendant                       |
| first blocking object differs   | missing/object/incompatible comparison | that first blocking object                       |

- Snapshot updates preserve references for unaffected branches and leaves.
- Root dirty is true when any root node is dirty. Root validity requires no
  global issue and every root node valid.

### 2.7 Validation and scopes

Validation still evaluates the full external model synchronously. Normalized
issues are assigned as follows:

- `[]` remains global;
- an exact managed node path belongs to that node;
- a deeper unmanaged path belongs to its deepest managed object ancestor;
- a path with no managed prefix remains global.

An object scope path includes that object, every descendant node and their
issues. A leaf scope path includes only that leaf. Overlap, forced visibility,
unknown-path warnings and `includeGlobalIssues` retain SPEC-001 semantics.
`resetTouched()` over an object scope resets descendant leaves only.

### 2.8 Angular recursive projection

ADR-007 resolution continues to receive only primitive `FieldDefinition`
leaves. Object nodes are rendered by one fixed Internal Angular structural host
that recursively projects children and creates existing field outlets at
leaves. An Internal node outlet owns an inline `ViewContainerRef`; for an
object it creates the fixed host with creation bindings and owns its
`ComponentRef`, while for a leaf it delegates to the existing
`SchemaFieldOutletDirective`/ADR-008 renderer lifecycle without adding a public
host contract.

The host uses semantic `<fieldset>`/`<legend>` grouping with the object's
required non-blank normalized label. Description, hint, tooltip, own issues and
descendant content receive unique path-derived IDs. An incompatible object
disables its descendant controls without changing external data. A synchronous
exception during object-host creation or binding destroys any partial
`ComponentRef`, emits exactly one closed
`OBJECT_HOST_INSTANTIATION_FAILED` adapter diagnostic and leaves that subtree
empty while independent siblings continue. This is not a general exception
boundary for later template, lifecycle or change-detection failures. The host
does not introduce custom container renderers, layout slots, portals or dynamic
definitions.

Object label, description, hint, tooltip and issues are resolved through new
object-node text contexts. Leaf contexts remain source compatible in meaning;
all affected TypeScript contracts remain Experimental.

### 2.9 Public API migration

The existing root entry points remain the only public entry points. The exact
migration inventory is:

| Classification         | Symbols or contracts                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `BaseNodeDefinition`, `FormNodeDefinition`, `ObjectFieldDefinition`, `UiNodeSchema`, `ObjectUiSchema`, `ObjectPresence`, `FieldPresence`, `NodeRuntimeSnapshot`, `ObjectRuntimeSnapshot`, `ObjectTextMember`, `ObjectTextResolutionContext` and `FormRuntime.getNodeSnapshot()`                                                                                                                                                                                                                    |
| Changed Public core    | `UiSchema.fields`, `FormDefinition.nodes/fields`, `BaseFieldDefinition`, `FieldRuntimeSnapshot.nodeKind/presence`, `FormRuntimeSnapshot.nodes/fields`, `TextResolutionContext`, `TextResolver.resolve()`, `ControlledFormRuntimeOptions`, `ExternalStateUpdate`, `FormRuntime`, `FormOperation`, `FormScope`, deep `DataPath` semantics and canonical keys                                                                                                                                         |
| Changed Public Angular | `AngularControlledFormConfig`, `SchemaFormDirective` snapshot/actions/projection, `SchemaFieldOutletDirective.schemaFieldOutlet`, `AngularFieldRenderer.field/snapshot`, `RendererTester` and `AngularRendererResolver.resolve()` through changed leaf keys/snapshots; custom leaf renderers discriminate `nodeKind: 'field'`, allow set/focus/blur for `missing-ancestor`, make remove a no-effect intention there, and suppress every mutation/interaction intention for `incompatible-ancestor` |
| Internal Angular       | node outlet, fixed object host, object text projection snapshot and object-host lifecycle helpers                                                                                                                                                                                                                                                                                                                                                                                                  |
| Unchanged boundary     | root package entry points, ADR-007 leaf renderer registrations and application-owned controlled `value`/`baselineValue`                                                                                                                                                                                                                                                                                                                                                                            |

`AngularObjectTextSnapshot` is Internal because M9 exposes no custom object host.
Core object text contexts remain Public because they are transitively accepted
by the Public `TextResolver`.

These are intentional breaking changes to Public + Experimental + Active APIs.
PLAN-009 must migrate repository consumers, verify declarations and reject deep
imports. No API becomes Stable and no package publication is authorized.

## 3. Consequences

Positive consequences:

- hierarchy is explicit without moving JSON Schema interpretation to adapters;
- runtime and Angular can use ordered leaf projections without losing structure;
- deep operations remain controlled, incremental and immutable;
- arrays and layout can evolve later without numeric identity in M9.

Negative consequences:

- definition and snapshot expose two identity-linked views that require strict
  validation;
- manual definitions and key consumers require migration;
- branch presence and issue visibility materially expand runtime state;
- missing-ancestor materialization is observable application behavior;
- terminal-only expectations do not detect replacement of a compatible
  ancestor when the terminal presence/value still matches; the operation
  preserves that ancestor state and only terminal mismatch is stale.

## 4. Alternatives rejected

### Flatten leaves and discard containers

Rejected because it cannot represent object metadata, branch issues, recursive
rendering or missing-versus-empty-object dirty semantics.

### Replace `fields` with only a public tree

Rejected because runtime, scopes, operations and leaf renderers need a stable
ordered projection; repeatedly flattening would obscure identity and sharing.

### Treat objects as ordinary renderer registrations

Rejected for M9 because containers own structure rather than a leaf editor.
Custom layouts and container renderers require separate evidence.

### Emit one operation per missing ancestor

Rejected because one user edit would require a batch/transaction protocol from
D-021. A single leaf operation can materialize missing ancestors atomically.

### Prune empty ancestors after removal

Rejected because it turns a leaf removal into an implicit multi-node policy and
cannot distinguish an intentionally present empty object.

## 5. Deferred boundaries

D-006, D-007, D-011–D-021, D-024, D-026 and all unrelated deferred entries
retain their current states except for the narrow D-014 question explicitly
resolved here. Publication and licensing remain D-040/D-034.

## 6. Acceptance criteria

Acceptance review confirmed:

1. tree/projection identity and manual-definition invariants;
2. collision-free path/key/DOM identity;
3. missing/accessor/incompatible ancestor and expectation semantics;
4. presence, dirty, interaction and structural-sharing behavior;
5. validation issue and scope aggregation;
6. structural UI Schema without advanced layout;
7. Angular semantics, accessibility and lifecycle;
8. complete ADR-009 public API migration;
9. consistency with ADR-005 revision 1 and SPEC-002; and
10. preservation of all deferred boundaries and publication safety.

Every correction required a complete repeated review until a pass had zero
findings. Joint review 3 passed revision 1 and the later complete review passed
revision 2 without findings or documentation conflicts. Acceptance authorizes
normative alignment only, not implementation; PLAN-009 retains its separate
gate.

## 7. Accepted revision 2 — blocked renderer intentions

> Ricard accepted revision 2 on 14 July 2026 after its complete ten-area review
> passed with zero findings. It changes no controlled-state owner, operation
> type or deferred boundary and does not authorize implementation.

Revision 2 replaces the ambiguous “handle blocked presence without corrective
intentions” phrase from revision 1 with this exact renderer rule:

- `blocked` with `reason: 'missing-ancestor'` is an empty, materializable
  presentation state. A leaf renderer may emit set, focus and blur intentions;
  remove is a successful no-effect intention and emits no operation.
- `blocked` with `reason: 'incompatible-ancestor'` is a disabled,
  non-correctable presentation state. A leaf renderer suppresses set, remove,
  focus and blur intentions and never coerces or replaces external data.
- Custom leaf renderers must discriminate both `nodeKind: 'field'` and
  `presence.reason`; treating every blocked state as disabled is not conformant.

The clarified Changed Public Angular inventory row is therefore:

| Classification         | Symbols or contracts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public Angular | `AngularControlledFormConfig`, `SchemaFormDirective` snapshot/actions/projection, `SchemaFieldOutletDirective.schemaFieldOutlet`, `AngularFieldRenderer.field/snapshot`, `RendererTester` and `AngularRendererResolver.resolve()` through changed leaf keys/snapshots; custom leaf renderers discriminate `nodeKind: 'field'`, allow set/focus/blur for `missing-ancestor`, make remove a no-effect intention there, and suppress every mutation/interaction intention for `incompatible-ancestor`. |

Revision 2 requires focused fixtures for both blocked reasons in native and
custom leaf renderers. Its complete review passed with zero findings before
acceptance; SPEC-002 v0.1.2 was accepted afterward in the required order.
PLAN-009 revision 1 later passed its separate repeated review and was explicitly
approved without starting implementation.
Checkpoint 1 later completed the neutral contracts and iterative helper
foundation without implementing recursive compiler behavior.
