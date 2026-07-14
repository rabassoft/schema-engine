# SPEC-002: Nested Object Controlled Runtime Extension

- **State:** Accepted
- **Version:** 0.1.2
- **Date:** 14 July 2026
- **Acceptance date:** 14 July 2026
- **Milestone:** M9 — Nested objects
- **Promoted capability:** [`D-005`](../roadmap/deferred-decisions.md)
- **Accepted baseline:**
  [`SPEC-001 v0.1.15`](./001-controlled-form-runtime.md)
- **Accepted architecture:**
  [`ADR-014 revision 2`](../adrs/014-modelo-objetos-anidados-paths-profundos.md)
- **Accepted dialect decision:**
  [`ADR-005 revision 1`](../adrs/005-politica-dialecto-json-schema.md)
- **Implementation plan:**
  [`PLAN-009 revision 1`](../plans/009-nested-object-runtime.md), Approved
- **Implementation state:** PLAN-009 checkpoints 1–4 completed; checkpoint 5 pending

## 1. Status and authority

This Accepted specification defines the observable M9 extension. ADR-014
revision 2 and ADR-005 revision 1 are its Accepted architecture decisions.
SPEC-002 v0.1.2 extends SPEC-001 v0.1.15 only where it explicitly replaces a
root-only rule; unchanged SPEC-001 behavior remains authoritative.

All controlled-state, validation-port, diagnostics, framework neutrality,
renderer, package, stability and deferred-boundary rules not changed here
continue unchanged.

Acceptance of this SPEC authorized preparation of PLAN-009, not implementation
or publication. PLAN-009 revision 1 subsequently passed its repeated complete
review and was explicitly approved; at that approval checkpoint implementation
had not started.
Checkpoint 1 subsequently established the Public core contract surface and
shared iterative definition/path helpers without implementing recursive schema
compilation. Checkpoint 2 then implemented the iterative descriptor-safe
schema/UI compiler, normalized recursive definition and focused conformance
coverage. Checkpoint 3 implemented descriptor-safe deep structural/form
operations and their fixtures. Checkpoint 4 then implemented nested runtime
validation, snapshots, actions, scopes and structural sharing; Angular
recursive projection remains pending.

## 2. Goals

M9 shall:

1. compile recursive inline object properties containing current primitive
   leaves;
2. expose immutable object structure and deterministic leaf order;
3. operate on string-only deep paths while preserving controlled state;
4. represent branch presence, dirty, validation and interaction;
5. render nested groups recursively in Angular without moving schema semantics
   out of core; and
6. preserve deterministic, descriptor-safe failures and structural sharing.

## 3. Non-goals

M9 does not support:

- arrays or numeric managed path segments;
- `$ref`, `$defs`, resources, anchors, remote resolution, composition or
  conditionals;
- arbitrary-key editors, maps, pattern properties or `additionalProperties`
  editing;
- advanced layouts, declarative scopes or custom object-container renderers;
- batches, ancestor pruning, undo/redo or dynamic definitions;
- async validation, framework-validator bridges, persistence or submit;
- new entry points, Stable API promotion, licensing or package publication.

## 4. Supported schema subset

The document root remains `type: "object"` with own `properties`. Each property
schema must declare exactly one supported type.

A nested object field supports:

- `type: "object"`;
- required own `properties`, which may be empty;
- optional `required`, `title`, `description`, and metadata-only `default`.

Its properties may recursively contain object fields or the exact string,
number, integer, boolean and string-enum leaf subsets accepted by SPEC-001.
`required` applies only to properties of the object where it appears.
The ADR-011 string-enum subset is supported at every valid nested primitive
string leaf. Enum and primitive constraints on object nodes are incompatible;
object structural keywords on primitive nodes are incompatible. Known ignored
annotations retain their warnings at both object and primitive field nodes.
Refs, resources, applicators, arrays and their known keywords remain
unsupported and are never traversed as subschemas.

ADR-005 revision 1 defines keyword compatibility, safe inspection, cycles,
document/data paths and diagnostic order. A compile result containing any error
has `success: false` and no partial definition.

## 5. Structural UI Schema

UI Schema mirrors supported object structure without becoming layout metadata:

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

Existing `FieldUiSchema` remains the leaf shape. Rules apply at every object:

- `order` reorders only direct children;
- duplicates and unknown sibling names produce the existing warnings at deep
  document/data paths;
- omitted children follow schema property order;
- an object UI `label`, when present, must be a non-blank string; otherwise it
  produces `INVALID_UI_SCHEMA_VALUE` with `expected: 'non-blank string'`;
- object labels follow valid UI label then valid schema title; fallback is the
  local name when non-blank and otherwise `JSON.stringify(name)`, so the source
  is always non-blank;
- object descriptions follow UI then schema precedence;
- object hint and tooltip come only from UI Schema;
- object nodes reject placeholder, enum labels and numeric presentation options
  as incompatible UI options;
- leaf nodes reject nested `order` and `fields`;
- UI members are inspected through own descriptors without executing accessors;
- UI object identity is tracked on the active ancestry: sibling reuse is
  inspected per path, while an active cycle emits `CYCLIC_UI_SCHEMA_OBJECT` and
  stops only that branch;
- a schema-blocked branch suppresses only derived UI diagnostics, not an
  independently malformed UI node exterior.

Structural incompatibilities are closed as follows. They are warnings with
`source: 'ui-schema'`, the complete immutable node `dataPath` and the exact UI
member `documentPath`. `field` is the local node name and `fieldType` is
`'object'` or the primitive leaf kind.

| Node/member                        | Code                       | Parameters after valid member shape                                                  |
| ---------------------------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| object `placeholder`               | `INCOMPATIBLE_PLACEHOLDER` | `{ field, fieldType: 'object' }`                                                     |
| object `enumLabels`                | `INCOMPATIBLE_UI_OPTION`   | `{ field, fieldType: 'object', option: 'enumLabels', reason: 'object-node' }`        |
| object `options.decimalPlaces`     | `INCOMPATIBLE_UI_OPTION`   | `{ field, fieldType: 'object', option: 'decimalPlaces', reason: 'object-node' }`     |
| object `options.showTrailingZeros` | `INCOMPATIBLE_UI_OPTION`   | `{ field, fieldType: 'object', option: 'showTrailingZeros', reason: 'object-node' }` |
| primitive leaf `order`             | `INCOMPATIBLE_UI_OPTION`   | `{ field, fieldType, option: 'order', reason: 'leaf-node' }`                         |
| primitive leaf `fields`            | `INCOMPATIBLE_UI_OPTION`   | `{ field, fieldType, option: 'fields', reason: 'leaf-node' }`                        |

An accessor or malformed value emits only the existing
`INVALID_UI_SCHEMA_VALUE` for that exact member and does not also emit its
incompatibility warning. A valid `options` object emits one warning for each
present valid incompatible numeric member in `decimalPlaces`, then
`showTrailingZeros` order. At one node, independently collectible UI diagnostics
use this fixed order: exterior/member-shape errors; text members; placeholder;
enum labels; numeric options; leaf `order`; leaf `fields`; object order entries;
then child UI nodes in normalized sibling order. Schema diagnostics still
precede the complete UI traversal.

## 6. Normalized definition

The public model is:

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

`BaseFieldDefinition extends BaseNodeDefinition` and retains `placeholder`.
Primitive variants retain their current constraints, numeric UI and choices.

Definition invariants:

- every node path is non-empty, string-only and unique;
- child path equals parent path plus child name;
- `name` is the final segment;
- `key === JSON.stringify(path)`;
- every array and node emitted by the compiler is deeply immutable;
- `nodes` is ordered recursively by structural UI rules;
- `fields` is depth-first pre-order over primitive leaves and contains the same
  leaf object references as the tree;
- a manual definition must satisfy the complete tree/projection invariant;
- cycles, duplicate paths/keys, reused nodes in multiple parents, malformed
  choices or inconsistent projections make runtime creation fail before
  validation.

The implicit root is not a node. A nested object with empty `properties` is an
object node with frozen empty `children`; it contributes no leaf.

## 7. Canonical identity

Managed `DataPath` values contain one or more string segments. `DataPath` keeps
its existing public `string | number` segment type for future compatibility,
but M9 rejects numeric segments in definitions, operations, actions and scopes.

Examples:

| Property                      | Path         | Key         |
| ----------------------------- | ------------ | ----------- |
| root property `a.b`           | `["a.b"]`    | `["a.b"]`   |
| nested property `b` under `a` | `["a", "b"]` | `["a","b"]` |

The DOM base is exactly:

```ts
`se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
```

The validated non-empty string `formId` and immutable string-only `path` are
encoded as one JSON tuple, making the function total for lone UTF-16 surrogates
and collision-safe across component boundaries. Object semantic IDs append
exactly `--legend`, `--description`, `--hint`, `--tooltip` or `--issues`; leaf
controls retain their existing fixed suffixes. No consumer may parse `key` with
a delimiter or treat local `name` as globally unique.

## 8. Deep controlled operations

The operation union remains `set-value | remove-value`. Operations target only
primitive leaves; object paths and root `[]` are invalid.

### 8.1 Expectations

The existing terminal expectation remains unchanged:

```ts
type OperationExpectation =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown };
```

It applies to the final property after safe ancestor traversal. Ancestor
identity is not part of the expectation.

### 8.2 Safe traversal

- Every path segment is inspected as an own property descriptor.
- Accessors are never executed.
- Existing ancestors must be ordinary non-array objects with
  `Object.prototype` or null prototype.
- `set-value` may create each missing ancestor as an `Object.prototype` object
  using safe data-property definition.
- A compatible concurrently added ancestor is preserved when the terminal
  expectation still matches.
- An accessor or incompatible ancestor fails atomically.
- `remove-value` requires all ancestors and the terminal data property.
- Removal does not delete empty ancestors.
- Successful application clones only the ancestor chain and preserves
  unaffected references, prototypes and own descriptors.
- At each cloned level, off-path own descriptors are copied unchanged. Every
  created or replaced on-path ancestor link and terminal is a writable,
  enumerable, configurable data property.
- Failure returns the exact original root reference and `changed: false`.

Expectations deliberately detect only terminal conflicts. Replacement of a
compatible ancestor is not stale when terminal presence/value still matches;
the operation preserves that ancestor's off-path state. A terminal mismatch
continues to produce `STALE_OPERATION`.

### 8.3 Managed compatibility

`applyFormOperation()` resolves the exact leaf path and accepts only values
compatible with its existing primitive kind. Business constraints and enum
membership remain validator responsibilities. `applyOperation()` remains a
schema-neutral structural utility.

## 9. External values and presence

The external root must remain an ordinary object. A nested schema object may be
missing, present as an ordinary object, or present with incompatible data. The
last case does not block runtime creation; it is invalid business data reported
through validation and branch presence.

Every managed property reached in `value` or `baselineValue` must be missing or
an own data property. An accessor at an object or leaf path invalidates initial
runtime options, and an external update introducing one fails atomically before
calling the validator. Accessors are never represented as business values and
never executed. An own data value with the wrong object type remains allowed as
the `incompatible` business-data state.

Initial failure retains `INVALID_RUNTIME_OPTIONS`; update failure retains
`INVALID_EXTERNAL_STATE_UPDATE`. Both identify `value` or `baselineValue`, use
`expected: 'ordinary data tree at managed paths'`, preserve the safe actual
description, and leave runtime state/reference identity unchanged.

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

export type FieldPresence =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown }
  | {
      readonly kind: 'blocked';
      readonly reason: 'missing-ancestor' | 'incompatible-ancestor';
      readonly at: DataPath;
    };
```

`at` is the immutable path of the first blocking ancestor. Every descendant
object and leaf uses `blocked`; it never invents a local presence for an
uninspectable path.

- A leaf under a missing ancestor may request `set-value`; the operation uses
  terminal expectation `missing` and can materialize the branch.
- Remove below a missing ancestor is a no-effect runtime intention and emits no
  operation.
- Set/remove below an incompatible ancestor fails with diagnostics and emits no
  operation.
- No renderer replaces, coerces or optimistically repairs an incompatible
  branch.

After the accepted disposed, path and set-value compatibility checks, each
`requestSetValue`, `requestRemoveValue`, `focus` or `blur` targeting a managed
leaf blocked by an incompatible ancestor returns:

```ts
{
  success: false,
  effects: { snapshotChanged: false, operationEmitted: false },
  diagnostics: [
    {
      code: 'INCOMPATIBLE_RUNTIME_ANCESTOR',
      severity: 'error',
      source: 'runtime',
      dataPath: targetPath,
      parameters: {
        action,
        reason: 'incompatible-ancestor',
        blockingPath,
        actualType,
      },
      fallbackMessage: 'Runtime action is blocked by an incompatible ancestor.',
    },
  ],
}
```

`action` is exactly `requestSetValue`, `requestRemoveValue`, `focus` or `blur`;
`blockingPath` is a frozen copy of presence `at`; and `actualType` uses the
existing safe closed actual-type vocabulary for the incompatible ancestor
value. The diagnostic and copied paths are frozen, have no `documentPath`, do
not retain the incompatible value and are the sole diagnostic after preceding
argument validation succeeds.

## 10. Dirty semantics

Leaf dirty compares accessible terminal presence/value against baseline using
the existing missing distinction and `Object.is`. A blocked leaf is locally
clean.

Object dirty is derived for inspectable nodes:

1. different presence kinds are dirty;
2. two missing branches are clean;
3. two incompatible branches compare their values with `Object.is`;
4. two object branches are dirty when any managed descendant is dirty; and
5. unmanaged properties never contribute.

A blocked descendant object is locally clean. The first missing or incompatible
object that blocks a branch exclusively owns its structural dirty result. This
closed matrix applies:

| Current node                    | Baseline node                          | Local dirty owner                                |
| ------------------------------- | -------------------------------------- | ------------------------------------------------ |
| both inspectable                | both inspectable                       | the node, using presence/`Object.is`/descendants |
| blocked on either or both sides | any                                    | no descendant; `dirty: false`                    |
| first blocking object differs   | missing/object/incompatible comparison | that first blocking object                       |

Therefore missing differs from an explicitly present empty object even when no
managed leaf value exists. Dirty remains controlled and is recalculated from
`value` plus `baselineValue`; it is never stored as interaction state.
Root dirty is true when any root node is dirty.

## 11. Runtime snapshots and interaction

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
```

`FormRuntimeSnapshot` adds `nodes` and retains `fields`. Leaf snapshots in
`fields` are the same references used in the node tree.
`FieldRuntimeSnapshot` adds `readonly nodeKind: 'field'`, making
`NodeRuntimeSnapshot` a closed discriminated union without duplicating leaf
snapshots.

- leaves below object or missing-ancestor states accept focus/blur and store
  touched state; leaves below an incompatible ancestor reject interaction;
- object touched/focused are derived from descendants;
- one leaf at most is focused per runtime;
- leaves blocked by an incompatible ancestor cannot become focused or touched;
- object validity includes own and descendant issues;
- root validity requires no global issue and every root node valid;
- object issue visibility is true under `all`, a forced containing scope, or
  when the object is touched through a descendant;
- showing errors never marks leaves touched;
- `getFieldSnapshot(path)` still resolves only primitive leaves;
- `getNodeSnapshot(path)` resolves object or primitive nodes;
- unrelated node and leaf snapshot references survive atomic updates.

The exact new Public lookup signature is:

```ts
getNodeSnapshot(path: DataPath): NodeRuntimeSnapshot | undefined;
```

It is a synchronous read with no side effects or diagnostics. A valid exact
managed object or leaf path returns the current tree reference. Root, malformed,
numeric and unmanaged paths return `undefined`. `getFieldSnapshot()` retains the
same read-only convention and returns `undefined` for an object path.

If an external value update first makes an ancestor of the focused leaf
incompatible, focus is cleared atomically without setting touched. Existing
touched state is preserved. Missing-ancestor transitions remain focusable and
baseline-only updates never reconcile interaction.

## 12. Validation issue assignment

The validator still receives the complete original schema and external value
and runs synchronously once per relevant external update.

Normalized issues map deterministically:

- `path: []` is global;
- an exact managed path attaches to that node;
- a deeper unmanaged path attaches to its deepest managed object ancestor;
- a path with no managed prefix is global;
- issue order from the normalized validator result is preserved within each
  destination.

An incompatible object may have its own type issue while descendant leaf
snapshots are blocked. The runtime does not synthesize JSON Schema validation
issues; it only exposes structural action/option diagnostics separately.

## 13. Scopes and visibility

Scopes remain application-owned.

- a leaf path selects that leaf;
- an object path selects the object and all descendants;
- overlapping object/leaf scopes compose as before;
- unknown or numeric paths warn and are ignored;
- `includeGlobalIssues` is unchanged;
- `resetTouched(objectScope)` resets descendant leaves;
- object scope validity includes own and descendant issues;
- scopes do not persist data, mutate baseline or declare layout.

## 14. Text resolution

Primitive contexts retain existing members. Object nodes add:

```ts
export type ObjectTextMember =
  'label' | 'description' | 'hint' | 'tooltip' | 'issue';

export type ObjectTextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly node: ObjectFieldDefinition;
      readonly member: Exclude<ObjectTextMember, 'issue'>;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly node: ObjectFieldDefinition;
      readonly member: 'issue';
      readonly issue: ValidationIssue;
    };
```

`TextResolver.resolve()` accepts the existing leaf union plus
`ObjectTextResolutionContext`. Object label always has a non-blank normalized
source fallback. An exception or non-string result falls back to the exact
source for every object member. A blank result is accepted for optional object
description, hint, tooltip and issue text, but object label falls back and uses
`blank-string-result` so `<legend>` remains non-blank.

Each object failure emits exactly one `TEXT_RESOLUTION_FAILED` warning with
`source: 'runtime'`, no `documentPath`, `dataPath` equal to a frozen copy of
`node.path`, fallback `Text resolution failed for object "<node.name>".`, and:

```ts
{
  node: node.name,
  nodeKind: 'object',
  member,
  ...(member === 'issue' ? { issueCode: issue.code } : {}),
  reason: 'exception' | 'non-string-result' | 'blank-string-result',
}
```

`blank-string-result` is valid only for `member: 'label'`. Existing leaf
diagnostic parameters and fallback remain unchanged and never gain a `node`
member. Object projection order is label; present description, hint and tooltip;
own issues in snapshot order; then descendant nodes in normalized order. The
immutable diagnostic array is forwarded once per object projection. Object
identity, form ID, locale and own issue-array identity define reprojection;
unchanged identities do not repeat resolution or its diagnostic batch.

Objects do not have placeholder, clear or choice text members.
The Angular adapter uses an Internal immutable object-text projection snapshot;
`AngularObjectTextSnapshot` is not exported because custom object hosts remain
deferred. The core object context types are Public because the Public
`TextResolver` accepts them transitively.

## 15. Angular recursive rendering

The Angular adapter traverses `definition.nodes` and snapshot nodes in lockstep.

- Object nodes use one fixed internal structural host, not ADR-007 renderer
  registrations.
- An Internal node outlet owns an inline `ViewContainerRef`. For objects it
  creates the fixed host with creation bindings and owns its `ComponentRef`; for
  leaves it delegates to the existing `SchemaFieldOutletDirective`/ADR-008
  renderer lifecycle without adding a public host contract.
- Each object renders a semantic `<fieldset>` with resolved non-blank `<legend>`
  and accessible description, hint, tooltip and own issues.
- IDs derive from full canonical keys and remain unique across sibling names,
  depths and simultaneous forms.
- Children render in normalized order; object children recurse and primitive
  children use the existing `SchemaFieldOutletDirective` plus ADR-007.
- A synchronous object-host creation or binding exception destroys any partial
  `ComponentRef`, emits exactly one `OBJECT_HOST_INSTANTIATION_FAILED`, leaves
  that subtree empty and allows independent siblings to continue. M9 does not
  promise a general exception boundary for later template, lifecycle or
  change-detection failures.
- Creation, replacement and destruction preserve ADR-008 ownership rules.
- A leaf blocked by a missing ancestor renders its empty visual state and may
  emit focus, blur and set intent.
- An incompatible object host disables descendant native controls; outlets
  suppress value, remove and interaction intentions and expose branch issues.
- Signal Forms remain private leaf-control buffers. No object `form()`, Angular
  validation schema, submit model or framework-owned business state is added.

Custom container renderers, advanced layout, portals and definition changes
remain outside M9.

## 16. Diagnostics

Existing diagnostic codes retain their meaning at deep paths. M9 adds:

| Code                               | Source    | Purpose                                       |
| ---------------------------------- | --------- | --------------------------------------------- |
| `CYCLIC_SCHEMA_OBJECT`             | schema    | Active schema ancestry cycle.                 |
| `CYCLIC_UI_SCHEMA_OBJECT`          | ui-schema | Active UI Schema ancestry cycle.              |
| `INCOMPATIBLE_OPERATION_ANCESTOR`  | runtime   | Existing ancestor is not an ordinary object.  |
| `INCOMPATIBLE_RUNTIME_ANCESTOR`    | runtime   | Managed runtime action is branch-blocked.     |
| `OBJECT_HOST_INSTANTIATION_FAILED` | runtime   | Internal Angular object host creation failed. |

All codes in this table use `severity: 'error'`. Runtime/adapter diagnostics omit
`documentPath`; schema/UI diagnostics include both paths shown. Parameters,
paths, diagnostic objects, arrays and result wrappers are frozen copies and
never retain caller objects, accessors or thrown values.

### 16.1 Manual definitions

Runtime creation emits exactly one `INVALID_RUNTIME_OPTIONS` before validation:

| Parameters                                                                                                                                                                          | Paths                                                         | Fallback                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------- |
| `{ member: 'definition', expected: 'valid nested FormDefinition', reason: 'invalid-value', actualType, definitionReason, nodeIndexPath?, firstNodeIndexPath?, fieldIndex?, path? }` | no diagnostic path; copied locator paths remain in parameters | `Runtime option "definition" is invalid.` |

`definitionReason` is exactly `nodes-not-array`, `invalid-node`, `cyclic-node`,
`reused-node`, `duplicate-node-path` or `inconsistent-leaf-projection`.
`nodeIndexPath` is the
zero-based index chain through `nodes`/`children`; `firstNodeIndexPath` appears
for cycles and duplicate identity/path; `fieldIndex` identifies a projection
entry; `path` appears only after a valid managed path has been read. Validation
uses depth-first node pre-order followed by `fields` order and reports the first
blocking defect.

`applyFormOperation()` retains `INVALID_FORM_DEFINITION`, source `runtime`, with
the same exact reason and applicable locators directly in parameters. Its
fallback is `Form definition is invalid.` It reports node defects in depth-first
pre-order, then projection defects in field order, continues independent safely
inspectable entries and performs no membership/effect work after any definition
error. Existing PLAN-002 base reasons remain unchanged and precede these nested
reasons. Accessor ancestors and terminals retain
`UNSUPPORTED_OPERATION_PROPERTY` with the offending prefix as `dataPath`.

### 16.2 External managed accessors

| Code                            | Parameters                                                                                                                               | `dataPath`          | Fallback                                       |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------- |
| `INVALID_RUNTIME_OPTIONS`       | `{ member, expected: 'ordinary data tree at managed paths', reason: 'invalid-value', actualType: 'object', propertyReason: 'accessor' }` | first accessor path | `Runtime option "<member>" is invalid.`        |
| `INVALID_EXTERNAL_STATE_UPDATE` | same closed shape                                                                                                                        | first accessor path | `External state member "<member>" is invalid.` |

`member` is exactly `value` or `baselineValue`; `<member>` in the fallback is
replaced by that exact value.

Managed paths are inspected in definition depth-first node order, `value`
before `baselineValue`. The first accessor blocks atomically, stops that state
inspection, does not invoke the validator and retains the previous runtime and
reference identities.

### 16.3 Cycles and deep operations

| Code                              | Parameters                                      | Paths                                             | Fallback and stopping                                                                        |
| --------------------------------- | ----------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `CYCLIC_SCHEMA_OBJECT`            | `{ firstDocumentPath }`                         | closing schema `documentPath` and node `dataPath` | `Schema object cycle detected.`; stop only the cyclic branch                                 |
| `CYCLIC_UI_SCHEMA_OBJECT`         | `{ firstDocumentPath }`                         | closing UI `documentPath` and node `dataPath`     | `UI Schema object cycle detected.`; stop only the cyclic UI branch                           |
| `INCOMPATIBLE_OPERATION_ANCESTOR` | `{ reason: 'non-object-ancestor', actualType }` | offending ancestor prefix                         | `Operation ancestor is not an ordinary object.`; fail atomically before expectation matching |

Cycle diagnostics follow schema depth-first order and then UI depth-first order;
independent siblings continue. `firstDocumentPath` is a copied path to the
first active occurrence. `INVALID_OPERATION_PATH` adds exactly
`object-target-not-supported` to its accepted closed reasons and retains the
root/numeric/malformed reasons. `FORM_PATH_NOT_MANAGED`, `STALE_OPERATION`, UI
warnings and text diagnostics use the complete immutable `dataPath`.

### 16.4 Angular object host

`OBJECT_HOST_INSTANTIATION_FAILED` uses parameters
`{ node: objectDefinition.name }`, `dataPath: objectDefinition.path`, fallback
`Object host could not be instantiated.`, and exactly one delivery for the
failed synchronous creation/binding attempt. The Internal outlet destroys a
partial ref, stops only that subtree and then continues independent sibling
outlets. No thrown value is retained or reported, and later arbitrary Angular
template/lifecycle/change-detection exceptions are outside this diagnostic.

### 16.5 Runtime actions, UI compatibility and object text

`INCOMPATIBLE_RUNTIME_ANCESTOR` has the exact result, parameters, path,
fallback and validation order from section 9. It is distinct from
`INCOMPATIBLE_OPERATION_ANCESTOR`: the former reports a Public runtime
intention against managed but inaccessible business data; the latter reports
structural operation application against an incompatible existing ancestor.

The structural UI compatibility table and diagnostic order in section 5 extend
the existing `INCOMPATIBLE_PLACEHOLDER`, `INCOMPATIBLE_UI_OPTION` and
`INVALID_UI_SCHEMA_VALUE` contracts to recursive nodes. These remain warnings
except malformed values, which retain the existing error severity.

Object `TEXT_RESOLUTION_FAILED` retains the existing warning severity and
delivery isolation but uses the closed object parameter union from section 14.
Leaf and object parameter shapes are intentionally distinct and selected by
their context; neither shape silently gains optional aliases from the other.

## 17. Structural sharing and lifecycle

- Definition nodes, projections, paths, diagnostics and snapshots are deeply
  immutable where existing contracts require it.
- An external update rebuilds a node snapshot only when its observable
  presence, dirty, interaction, issues, visibility, children or derived
  aggregate changes. A full-model validator may therefore change a sibling
  snapshot whose data path was not edited.
- Sibling subtrees and leaves whose complete observable state does not change
  keep identity, including across a cross-field validation update elsewhere.
- Runtime disposal remains idempotent and releases the complete tree.
- Angular object hosts own and destroy descendant outlets deterministically.
- Dynamic `FormDefinition` replacement remains D-013.

## 18. Public API and migration

The exact ADR-009 migration inventory is:

| Classification         | Symbols or contracts                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `BaseNodeDefinition`, `FormNodeDefinition`, `ObjectFieldDefinition`, `UiNodeSchema`, `ObjectUiSchema`, `ObjectPresence`, `FieldPresence`, `NodeRuntimeSnapshot`, `ObjectRuntimeSnapshot`, `ObjectTextMember`, `ObjectTextResolutionContext` and `FormRuntime.getNodeSnapshot()`                                                                                                                                                                                                  |
| Changed Public core    | `UiSchema.fields`, `FormDefinition.nodes/fields`, `BaseFieldDefinition`, `FieldRuntimeSnapshot.nodeKind/presence`, `FormRuntimeSnapshot.nodes/fields`, `TextResolutionContext`, `TextResolver.resolve()`, `ControlledFormRuntimeOptions`, `ExternalStateUpdate`, `FormRuntime`, `FormOperation`, `FormScope`, deep `DataPath` semantics, manual-definition validation and canonical keys (`"name"` becomes `["name"]`)                                                           |
| Changed Public Angular | `AngularControlledFormConfig`, `SchemaFormDirective` snapshot/actions/projection, `SchemaFieldOutletDirective.schemaFieldOutlet`, `AngularFieldRenderer.field/snapshot`, `RendererTester` and `AngularRendererResolver.resolve()` through changed leaf keys/snapshots; renderers discriminate `nodeKind: 'field'` and `presence.reason`, allow set/focus/blur under `missing-ancestor`, make remove a no-effect there, and suppress all intentions under `incompatible-ancestor` |
| Internal Angular       | node outlet, fixed object host, object text snapshot and lifecycle/diagnostic helpers                                                                                                                                                                                                                                                                                                                                                                                            |
| Unchanged              | the two root package entry points, ADR-007 leaf registration API and application ownership of controlled state                                                                                                                                                                                                                                                                                                                                                                   |

Every Public change remains Experimental + Active. Deep imports remain
unsupported. PLAN-009 must verify declaration output, repository consumers and
both clean candidate consumers against this table.

No migration is implemented or promised until PLAN-009 is approved.

## 19. Conformance scenarios

Required fixtures shall cover:

1. two and multiple object depths with every current primitive leaf;
2. empty objects, missing branches and explicitly present empty objects;
3. missing-ancestor materialization and no ancestor pruning;
4. stale terminal expectations plus a compatible replaced ancestor whose
   off-path state is preserved when the terminal still matches;
5. accessor, array, class-instance, null and primitive ancestors;
6. writable/enumerable/configurable on-path descriptors, preserved off-path
   descriptors/prototypes, `__proto__`, dotted names, JSON punctuation,
   Unicode/lone surrogates and path/key/DOM collisions;
7. recursive order and structural UI precedence/diagnostics;
8. schema cycles, shared schema objects, malformed nested properties and
   deterministic deep diagnostic order;
9. object/leaf issues, nearest-ancestor mapping, scopes and visibility;
10. the complete accessible/blocked value-baseline dirty matrix, exact blocked
    action diagnostics, external incompatible focus reconciliation and touched
    preservation;
11. snapshot structural sharing where one edited path changes a sibling's
    cross-field validation issue while an unaffected third subtree retains
    identity;
12. exact `getNodeSnapshot()` lookup behavior for object, leaf, root, malformed,
    numeric and unmanaged paths;
13. recursive Angular accessibility, locale, object/leaf text fallback and
    diagnostic parameter unions, lifecycle and missing- versus
    incompatible-ancestor native/custom renderer intentions;
14. synchronous object-host creation/binding failure isolation without claiming
    a general Angular exception boundary; and
15. package declarations, root imports and clean consumers without deep
    imports.

## 20. Acceptance criteria

SPEC-002 may be accepted only when:

1. ADR-014 revision 2 and ADR-005 revision 1 pass their applicable complete
   repeated reviews with zero findings and are accepted;
2. every contract above has closed parameters and no unresolved normative
   placeholder;
3. no rule activates arrays, refs/composition, layout, batches, dynamic
   definitions or publication;
4. public API migration and Experimental classification are explicit;
5. framework-neutral behavior remains wholly in core;
6. Angular recursion is projection-only and accessible;
7. conformance scenarios map to a future PLAN-009 verification matrix; and
8. a complete repeated SPEC review finishes with zero findings.

Acceptance of this SPEC authorized preparation of PLAN-009, not implementation.
That separate gate is now satisfied by approved PLAN-009 revision 1.

## 21. History

| Version | Date       | Change                                                             |
| ------- | ---------- | ------------------------------------------------------------------ |
| 0.1.2   | 14-07-2026 | Closed six findings, passed repeated review 2 and was accepted.    |
| 0.1.1   | 14-07-2026 | Closed the ten approved joint ADR review corrections.              |
| 0.1.0   | 14-07-2026 | Initial Draft after acceptance of the D-005/M9 promotion boundary. |
