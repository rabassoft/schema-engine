# PLAN-009: Nested-object controlled runtime

- **Status:** Approved
- **Date:** 2026-07-14
- **Approval date:** 2026-07-14
- **Review revision:** 1
- **Review state:** First-review corrections applied; repeated complete review
  passed with zero findings; explicitly approved
- **Implementation state:** Checkpoints 1–4 completed; checkpoint 5 pending
- **Requires:** accepted
  [`SPEC-001` v0.1.15](../specs/001-controlled-form-runtime.md),
  [`SPEC-002` v0.1.2](../specs/002-nested-object-runtime.md),
  [`ADR-005` revision 1](../adrs/005-politica-dialecto-json-schema.md),
  [`ADR-007`](../adrs/007-resolucion-renderers-testers.md),
  [`ADR-008`](../adrs/008-instanciacion-renderers-angular.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md), and
  [`ADR-014` revision 2](../adrs/014-modelo-objetos-anidados-paths-profundos.md)
- **Milestone:** M9 — Nested objects

## 1. Goal and authorization boundary

Implement the accepted recursive inline-object extension end to end across the
neutral compiler, controlled operations, runtime snapshots/scopes, Angular 22
projection, package declarations and clean-consumer behavior.

The smallest complete result is:

```text
recursive inline schema + structural UI Schema
  -> immutable FormDefinition.nodes + identity-linked fields
  -> deep controlled operation/runtime behavior
  -> recursive accessible Angular object groups + existing leaf renderers
```

Before its formal acceptance, this Proposed plan authorized no implementation.
It passed the complete repeated review with zero findings and Ricard explicitly
approved revision 1 on 14 July 2026. Approval does not authorize arrays,
references, composition,
advanced layout, declarative scopes, batches, dynamic definitions, custom
object-container renderers, async validation, publication or Stable API
promotion.

## 2. Reviewed current state

The current M1–M8 implementation is a flat root-field runtime:

- `FormDefinition` contains only `fields`; compiler candidates and UI parsing
  are root-field indexed.
- `applyOperation()` and `applyFormOperation()` accept exactly one string path
  segment and clone only the root.
- runtime definition validation, presence, dirty, validation assignment,
  scopes and snapshot sharing are flat maps keyed by one segment.
- `SchemaFormDirective` owns the controlled runtime but consumers manually loop
  `definition.fields` and instantiate `SchemaFieldOutletDirective`.
- the field outlet, text projector, native renderers, IDs, package tests and
  clean consumer all assume flat leaf snapshots and keys.
- existing compiler, operation and runtime JSON fixtures encode the flat
  definition shape and canonical root key `name`, not `["name"]`.

The accepted M9 documents intentionally make those contracts
source-incompatible while retaining the two package entry points and all API
stability classifications. The implementation must migrate every repository
consumer in the same change and must not add a compatibility mode or a second
flat authority.

The post-acceptance drafting check corrected stale authority wording in ADR-005
and D-014 before this plan was written. No accepted decision or product behavior
changed.

## 3. Public Experimental contract migration

### 3.1 Core definition and UI contracts

Implement and export exactly the accepted SPEC-002 types:

- `BaseNodeDefinition`, `FormNodeDefinition` and `ObjectFieldDefinition`;
- recursive `UiNodeSchema` and `ObjectUiSchema`;
- `FormDefinition.nodes` plus the required identity-linked
  `FormDefinition.fields` leaf projection;
- `BaseFieldDefinition extends BaseNodeDefinition`;
- full immutable string-only `path` and `key === JSON.stringify(path)` for every
  node, including root leaves.

All existing primitive variants, constraints, choices and UI metadata remain
otherwise unchanged. Compiler output must freeze the complete tree, every
children/projection array, node, path, constraint/choice container and
diagnostic-owned container. No public generic AST, resolved graph or render plan
is added.

### 3.2 Core runtime contracts

Implement and export:

- `ObjectPresence` and the extended `FieldPresence`;
- `NodeRuntimeSnapshot` and `ObjectRuntimeSnapshot`;
- `FieldRuntimeSnapshot.nodeKind: 'field'` and extended presence;
- `FormRuntimeSnapshot.nodes`, retaining identity-linked `fields`;
- `FormRuntime.getNodeSnapshot(
path: DataPath,
): NodeRuntimeSnapshot | undefined`;
- `ObjectTextMember` and `ObjectTextResolutionContext`, extending the Public
  `TextResolutionContext` accepted by `TextResolver.resolve()`.

Root lookup, malformed/numeric/unmanaged path behavior, object/leaf lookup and
all immutable return types must match SPEC-002 exactly. `DataPath` retains its
existing public segment union but every M9 managed definition, operation,
action and scope rejects numeric segments.

### 3.3 Angular contracts and entry points

Keep the existing Angular root exports and add no public symbol. Update the
transitively changed Public + Experimental + Active contracts named by
SPEC-002, including `AngularControlledFormConfig`, `SchemaFormDirective`,
`SchemaFieldOutletDirective.schemaFieldOutlet`, `AngularFieldRenderer`,
`RendererTester`, `AngularRendererResolver.resolve()` and
`AngularFieldTextSnapshot` only where accepted leaf definition/snapshot/key
types flow through them.

`AngularObjectTextSnapshot`, the root/node outlet, fixed object host and their
lifecycle helpers remain Internal and are not re-exported. The raw renderer
registration token remains Internal. No entry point, export map, package
version, peer range or dependency changes.

## 4. Recursive compiler delivery

### 4.1 Descriptor-safe schema traversal

Refactor the current root-field pass into an explicit finite-depth work stack.
Do not rely on unbounded JavaScript recursion. Each stack frame carries schema
and data/document paths, parent output location, sibling order, required set and
active-ancestry identity chain.

For every supported object:

1. inspect own data descriptors for supported structural members;
2. validate the closed ADR-005 revision 1 keyword catalog before children;
3. enumerate own enumerable properties with `Object.keys(properties)`;
4. push children so externally observed diagnostics and output remain
   depth-first pre-order;
5. track identity only on active ancestry, allowing shared objects in sibling
   branches and emitting `CYCLIC_SCHEMA_OBJECT` only for a closing cycle; and
6. stop only the invalid/cyclic branch while continuing independent siblings.

The traversal never executes accessors, follows refs/applicators, traverses
unknown keyword values or applies schema defaults. Root behavior, dialect
diagnostics and the ADR-011 enum subset remain unchanged except for deep paths.

### 4.2 Recursive structural UI Schema

Parse UI nodes against the corresponding valid schema node. Use full document
paths such as `['fields', 'address', 'fields', 'street', 'label']` and full data
paths such as `['address', 'street']`.

Use an explicit work stack for structural UI traversal and diagnostic delivery;
do not depend on recursive JavaScript calls for supported finite depth. Preserve
the same depth-first pre-order that a conceptual recursive walk would expose.

Implement:

- sibling-local order, duplicate/unknown warnings and schema-order remainder;
- object label/description/hint/tooltip precedence and non-blank accessible
  fallback;
- the exact object/leaf incompatibility table, member-shape isolation and fixed
  diagnostic order from SPEC-002 section 5;
- active-ancestry UI-cycle detection with `CYCLIC_UI_SCHEMA_OBJECT`;
- schema-blocked suppression limited to derived UI diagnostics; and
- no layout slots, declarative scopes or object renderer metadata.

Build `nodes` in normalized sibling order and populate `fields` during the same
depth-first pre-order traversal with the exact primitive node object references.
Compilation returns no partial definition after any error.

### 4.3 Definition validation reuse

Create one Internal descriptor-safe nested-definition validator used by runtime
creation and `applyFormOperation()`. It validates nodes in depth-first pre-order
then fields order, returns the first runtime-blocking defect and can collect the
independently inspectable operation-definition diagnostics required by
SPEC-002.

The validator and its leaf-projection comparison use explicit stacks/indexes;
they must support every finite definition depth without relying on unbounded
JavaScript recursion.

It must close cycles, reused identity, duplicate path/key, child/name/path/key
invariants, node shape, choices and exact leaf-projection identity without
freezing, cloning or mutating caller-supplied manual definitions. The helper
returns only safe copied locators and never retains caller containers.

## 5. Deep immutable operations

Replace the one-segment parsed operation path with a non-empty immutable
string-only path. Preserve existing validation order and add object-target and
numeric/deep rules exactly as specified.

Operation application uses an iterative descriptor-safe traversal:

1. validate target, operation envelope/path/expectation and optional form
   definition before inspecting managed data;
2. resolve only exact primitive leaves for `applyFormOperation()`;
3. inspect every existing ancestor and terminal through own descriptors;
4. materialize missing ancestors only for `set-value` as ordinary
   `Object.prototype` objects using `Object.defineProperty()`;
5. reject accessors with `UNSUPPORTED_OPERATION_PROPERTY` and incompatible
   ancestors with `INCOMPATIBLE_OPERATION_ANCESTOR` before expectation matching;
6. compare the terminal expectation only after safe traversal/materialization;
7. clone bottom-up only along the root-to-leaf chain, preserving source
   prototypes and all off-path descriptors; and
8. define each created/replaced on-path link and terminal as writable,
   enumerable and configurable.

`remove-value` never creates or prunes ancestors. A failure returns the exact
root reference; a successful no-op retains it. Compatible concurrently replaced
ancestors are preserved when terminal expectation still matches. Add no batch,
ancestor expectation or structural operation type.

## 6. Nested controlled runtime

### 6.1 Creation and external-state safety

Migrate runtime indexes from one-segment keys to canonical JSON path keys and
retain direct node-definition identity. Validate manual definitions through the
shared helper before invoking the validator.

Inspect `value` then `baselineValue` over managed nodes in definition
depth-first order. A managed accessor fails creation/update atomically before
validation with the exact accepted diagnostic. Missing and incompatible own
data values remain valid external business state. External data is never deeply
cloned or frozen.

Definition indexing, external-state inspection, snapshot construction,
reconciliation and scope expansion all use explicit work stacks or flat indexes.
No neutral core tree walk may introduce an arbitrary depth limit or depend on
unbounded JavaScript recursion.

### 6.2 Snapshot construction and sharing

Build the node snapshot tree and leaf projection in one pass so every leaf
snapshot in `fields` is the same reference as its tree occurrence. Derive:

- local object/leaf presence and first-ancestor blocked presence;
- leaf dirty and first-blocking-object structural dirty ownership;
- object touched/focused from descendant leaf state;
- exact/global/deepest-object validation assignment;
- object/leaf validity and issue visibility; and
- root validity/dirty/global issues.

On atomic updates, reuse a previous node snapshot only when its complete
observable presence, dirty, interaction, issues, visibility, children and
derived aggregate remain identical. Full-model validation may change an
unedited sibling; an actually unchanged third subtree must retain identity.

### 6.3 Actions, operations and interaction

Runtime requests resolve exact leaf definitions by full path.

- Set below a missing ancestor derives terminal expectation `missing` and emits
  one deep operation without changing the controlled snapshot.
- Remove below a missing ancestor is a successful no-op with no ID allocation or
  emission.
- Set/remove/focus/blur below an incompatible ancestor return the exact
  `INCOMPATIBLE_RUNTIME_ANCESTOR` result and safe parameters.
- Focus/blur below a missing ancestor remain local interaction; one leaf at most
  is focused.
- An external value transition that first makes the focused leaf's ancestor
  incompatible clears focus without touching it and preserves prior touched.

All action validation, operation ID allocation, subscription ordering,
listener isolation, controlled confirmation/rejection and disposal behavior not
replaced by SPEC-002 remain unchanged.

### 6.4 Scopes and validation snapshots

Parse scope paths as exact full string-only managed paths. Object paths select
the object, descendants and their issues; leaf paths select only that leaf.
Unknown/numeric paths warn and are ignored. Preserve overlap, forced-scope IDs,
global-issue inclusion and application ownership. `resetTouched(objectScope)`
clears descendant leaf touched state only and never changes focus.

## 7. Angular 22 recursive projection

### 7.1 Root projection and consumer migration

Keep selector `[schemaForm]` and the exported class name
`SchemaFormDirective`, but convert its Angular declaration to a standalone
attribute component so its Internal template can render normalized root nodes
inside the consumer's host element. The template renders root Internal node
outlets in `definition.nodes` order and then projects existing unrelated
consumer content with `<ng-content />`.

The rendered tree is driven only by the last configuration whose runtime was
created or updated successfully. A rejected replacement/update leaves the
previous runtime, accepted definition and projected tree together; the template
must never read a rejected raw input definition and pair it with the previous
snapshot. A successful replacement switches the accepted definition, runtime
context, snapshot subscription and root outlets as one committed lifecycle
transition, then deterministically destroys the superseded descendants.

Repository consumers must remove their manual `definition.fields` loop and use:

```html
<form [schemaForm]="config()"></form>
```

This is the accepted Experimental `SchemaFormDirective` projection migration;
the Angular declaration changes from directive metadata to component metadata,
but the selector, exported class, input/output names, injection role and package
root symbol remain unchanged. Declaration, package-smoke and clean-consumer
tests must lock that exact migration. It adds no separate public component,
layout language or form submission behavior. Projected manual field outlets
remain possible but are not auto-deduplicated and are not part of the recursive
rendering contract.

### 7.2 Internal node outlet and object host

Add an Internal standalone node-outlet component with a local inline
`ViewContainerRef` and immutable definition/snapshot inputs.

- For an object node, resolve the matching snapshot by identity/path and create
  exactly one fixed Internal object-host component with creation bindings and
  the form `EnvironmentInjector`.
- For a leaf, delegate to the existing `SchemaFieldOutletDirective` and its
  ADR-008 renderer lifecycle; do not resolve objects through ADR-007.
- On synchronous object-host creation/binding failure, destroy any partial ref,
  emit exactly one `OBJECT_HOST_INSTANTIATION_FAILED` with the exact accepted
  `{ node }` locator, `dataPath`, reason/fallback and one-batch ordering, leave
  only that subtree empty and continue independent siblings. Tests must cover
  both creation and required-binding failure without retaining the thrown value.
- Own/destroy refs deterministically on form replacement and Angular teardown.
  Do not claim isolation for later template/lifecycle/change-detection errors.

The fixed object host renders `<fieldset>`/`<legend>`, optional description,
hint and tooltip, own visible issues, and child Internal outlets in normalized
order. It disables descendant native controls only for
`incompatible-ancestor`; a missing ancestor displays empty leaf controls.

### 7.3 Text projection and canonical IDs

Add an Internal immutable object text projector/snapshot. Reuse the configured
Public `TextResolver`, but emit the exact object `TEXT_RESOLUTION_FAILED`
parameter union, fallback, order and one-batch delivery. Keep the object
snapshot Internal.

Change the common base for every node to:

```ts
`se-${encodeURIComponent(JSON.stringify([formId, path]))}`;
```

Object IDs append `--legend`, `--description`, `--hint`, `--tooltip` and
`--issues`. Leaf IDs are exactly the base control ID plus the existing
`-label`, `-clear`, `-description`, `-hint`, `-tooltip` and `-errors` suffixes.
Tests must cover punctuation, dotted names, Unicode/lone surrogates,
simultaneous forms and base/suffix collision resistance.

### 7.4 Blocked leaf renderer behavior

Extend native and custom renderer-facing snapshots without adding a new output.

- `missing-ancestor`: render the existing empty visual state, keep controls
  enabled, allow set/focus/blur and let remove reach the runtime as a successful
  no-op.
- `incompatible-ancestor`: render empty, disable the native control and clear
  action, and suppress set/remove/focus/blur at the outlet even if a custom
  renderer emits them.

Every native renderer and the testing fake must discriminate `nodeKind` and the
three leaf presence families. Signal Forms remain private leaf buffers; no
object `form()`, Angular validation schema, Reactive Forms, Template-driven
Forms, submit or framework-owned business state is added.

## 8. Test and conformance delivery

### 8.1 Existing baseline migration

Update every compiler expected definition to include `nodes`, identity-equivalent
serialized `fields`, deep paths and JSON path keys. Update manual definitions in
operation/runtime/Angular tests to the accepted tree/projection shape. Existing
flat behavior must remain semantically unchanged after this intentional
Experimental source migration.

JSON fixtures cover serializable cases. Programmatic unit tests cover cycles,
shared identity, accessors, prototypes, descriptors, reference identity,
exceptions and lone-surrogate input without attempting to encode impossible
object graphs in JSON.

Fixture-update scripts may regenerate expected JSON only after focused assertions
pass and the resulting diff is reviewed; generated outputs are never accepted
as their own oracle.

### 8.2 SPEC-002 scenario matrix

| SPEC scenario                                    | Required evidence                                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1. Multiple depths/current leaves                | compiler fixtures plus definition identity/order tests for string, enum, number, integer and boolean |
| 2. Empty/missing/present-empty objects           | compiler and runtime fixtures covering presence, dirty and zero-leaf objects                         |
| 3. Materialization/no pruning                    | structural and form-operation fixtures with runtime request/confirmation                             |
| 4. Terminal stale/concurrent ancestor            | deep operation descriptor/reference tests and fixtures                                               |
| 5. Accessor/array/class/null/primitive ancestors | programmatic compiler, operation and runtime atomic-failure tests                                    |
| 6. Descriptors/hostile names/Unicode/IDs         | operation descriptor tests plus core/Angular canonical-key and DOM-ID tests                          |
| 7. Recursive UI precedence/diagnostics           | compiler fixtures for order, malformed members, incompatibility and UI cycles                        |
| 8. Schema cycles/shared/malformed/order          | programmatic cycles/shared identity plus multi-error deterministic-order fixtures                    |
| 9. Issues/scopes/visibility                      | runtime fixtures for exact, nearest-object, global, overlap and reset behavior                       |
| 10. Dirty/actions/focus/touched                  | runtime matrix fixtures including `INCOMPATIBLE_RUNTIME_ANCESTOR` exact results                      |
| 11. Cross-field sharing                          | runtime reference tests where sibling issues change and a third branch retains identity              |
| 12. Node lookup                                  | type/unit/package tests for object, leaf, root, malformed, numeric and unmanaged paths               |
| 13. Angular accessibility/text/blocked renderers | native/custom renderer tests, object text diagnostics, locale and semantic group assertions          |
| 14. Object-host failure isolation                | focused synchronous creation/binding failure and sibling-continuation test                           |
| 15. Packages/clean consumers                     | declaration, root-import, package smoke, artifact and clean Angular consumer checks                  |

Every new diagnostic test asserts code, severity, source, exact frozen
parameters/path/fallback, order, branch stopping, safe-value handling and lack
of retained thrown/caller objects.

### 8.3 Angular integration matrix

Update directive/outlet/native/text/resolver tests and add focused Internal-host
tests for:

- recursive render order and one leaf component per leaf;
- semantic fieldset/legend relationships and described-by/issue IDs;
- controlled set/remove confirmation and rejection below object branches;
- missing versus incompatible disabling/intention suppression;
- object/leaf locale reprojection without component recreation;
- form replacement and deterministic descendant destruction;
- projected unrelated consumer content without manual leaf loops; and
- synchronous object-host creation/binding failure isolation.

No test may assert SSR/hydration, portals, lazy renderers, dynamic definitions,
advanced layout, framework-validator bridges or submission.

## 9. Package, declaration and consumer migration

Update both package READMEs and candidate release notes to replace the root-only
boundary with the accepted nested-object subset. Retain private unpublished
`0.1.0`, Experimental + Active classification, exact Angular peer range and all
publication prohibitions.

Core package smoke and consumer type tests must construct/inspect the new
definition/snapshot contracts, call both lookup methods and apply a deep
operation using only the root import. Angular package smoke must confirm no new
root export, and the built consumer must render a two-depth form through
`SchemaFormDirective`, apply one deep controlled set and remove, localize object
text and assert unique accessible IDs.

`test:artifacts` must keep the existing exact tarball allowlist. Clean core and
Angular lower/upper consumers must pass with the new declarations and behavior;
no dependency download, version, manifest, tarball-content or compatibility
policy change is part of M9.

## 10. Implementation sequence and checkpoints

After explicit plan approval only:

1. Mark M9 implementation in progress and add Public core contracts plus the
   shared nested-definition/path helpers; keep builds/typechecks green.
2. Implement recursive compiler/schema/UI traversal and migrate compiler
   fixtures/tests.
3. Implement deep structural/form operations and migrate operation fixtures.
4. Implement nested runtime validation, snapshots, actions, scopes and sharing;
   migrate runtime fixtures/tests.
5. Implement Angular root/node/object projection, text, IDs and blocked
   renderer behavior; migrate Angular tests/consumer templates.
6. Update root exports, declaration/package smoke, package docs, release notes,
   artifact and clean-consumer coverage.
7. Run the complete matrix, inspect the whole diff and declarations, correct
   every finding and repeat all reviews/checks until zero findings.

Each checkpoint must preserve unrelated dirty work and pass format, lint,
typecheck, focused tests and `git diff --check`. A failed checkpoint is not
carried forward as completed work.

## 11. Expected production diff

Expected existing files include:

- core contracts, compiler, operations, runtime, index and their focused tests,
  conformance fixtures and update scripts;
- Angular form directive/component, field outlet, renderer/text/native helpers,
  native renderers, index and their focused tests;
- package smoke and built/clean consumer tests;
- package READMEs, root README, candidate release notes and persistent state.

Expected new Internal files may include a shared core nested-definition/data-path
helper and Angular node-outlet, object-host and object-text modules with focused
tests. Exact Internal file decomposition may change to keep modules cohesive;
no new root export or entry point may result.

No package manifest version/dependency/peer/export change, lockfile change,
public object-container renderer, runtime dependency, publish configuration,
license, credential, registry write, GitHub release or unrelated refactor is
allowed.

## 12. Verification commands and inspections

Run from a clean dependency state where applicable:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
pnpm test:artifacts
pnpm test:consumer:clean
```

Also verify:

- focused compiler/operation/runtime/Angular suites at every checkpoint;
- all SPEC-002 fixtures and programmatic hostile-object cases;
- emitted `.d.ts` and root export inventory against the section 3 table;
- leaf projection identity and snapshot structural sharing by reference;
- descriptor/prototype/on-path attribute behavior by reflection;
- Angular semantic structure, accessible references and component destruction;
- lower/upper Angular 22 clean consumers without changing resolved endpoints;
- exact private artifact allowlists and absence of `workspace:` in packed
  manifests;
- dependency/lockfile/publication/deferred-boundary diff guards;
- all Markdown links, persistent-state consistency and `git diff --check`.

No verification may update expected fixtures, manifests, lockfiles or generated
artifacts implicitly. Any intentional regeneration occurs in a separate
reviewed step before the final read-only matrix.

## 13. Completion and stop conditions

M9 is complete only when:

1. all 15 SPEC-002 scenarios have mapped passing evidence;
2. existing M1–M8 behavior remains green after the intentional Experimental
   contract migration;
3. full format, lint, typecheck, tests, builds, package, artifact and clean
   consumer checks pass;
4. declarations and root exports exactly match the accepted migration table;
5. no deferred capability, publication setting or Stable claim enters the diff;
6. the final implementation diff and full verification are repeated after every
   correction until zero findings; and
7. STATUS is compacted and one append-only WORKLOG entry records evidence.

Stop and return to normative review if implementation requires:

- changing an accepted diagnostic, action, presence, sharing, renderer or API
  contract;
- adding a public symbol/entry point or changing a manifest/peer/dependency;
- inventing an object-host consumption contract outside the accepted
  `SchemaFormDirective` projection migration;
- adding a depth limit or relying on unbounded recursion;
- activating arrays, refs/composition, layout, batches, dynamic definitions,
  async/framework validation, persistence, submission or publication; or
- weakening descriptor safety, controlled-state ownership, immutability,
  accessibility, isolation or required verification.

## 14. Plan acceptance criteria

PLAN-009 may be approved only when a complete repeated review confirms:

1. every SPEC-002 scenario maps to concrete implementation and evidence;
2. compiler, operations, runtime and Angular sequencing has independently
   verifiable checkpoints;
3. all Public Experimental migrations and Internal-only additions are explicit;
4. controlled state and framework neutrality are preserved;
5. diagnostic, descriptor, cycle, sharing and lifecycle tests are exact;
6. repository/package/clean-consumer migrations are complete;
7. deferred, publication and dependency boundaries are preserved;
8. implementation and stop conditions are objective; and
9. a repeated full plan review finishes with zero findings.

Approval authorizes only the implementation described here. It does not approve
future corrections that change accepted contracts or scope.

## 15. Review record

### 15.1 Complete review 1

The first complete review found four delivery gaps, without finding a conflict
in SPEC-001, SPEC-002, ADR-005 revision 1 or ADR-014 revision 2:

1. the root Angular projection was not explicitly tied to the last accepted
   runtime configuration after a rejected replacement;
2. UI, manual-definition and runtime tree walks did not all prohibit unbounded
   JavaScript recursion;
3. the observable Angular directive-to-component metadata migration and exact
   retained root contract needed declaration/consumer evidence; and
4. leaf ID suffixes plus object-host failure evidence were not enumerated
   exactly enough for conformance.

Revision 1 applies those corrections. They close implementation and evidence
rules only; they do not change an accepted public behavior, add a public symbol
or activate a deferred capability. A fresh complete repeated review is required
before approval can be requested.

### 15.2 Repeated complete review 2

The review was restarted from the authority and scope boundary after applying
revision 1. All nine acceptance criteria and the detailed matrix recorded in
[`review 005`](../reviews/005-plan-009-review.md) pass with zero findings,
requested corrections or documentation conflicts.

At that review checkpoint PLAN-009 remained Proposed: passing review did not
authorize implementation, and Ricard still had to approve revision 1 before
checkpoint 1 could start.

### 15.3 Formal approval

Ricard explicitly approved PLAN-009 revision 1 on 14 July 2026 after repeated
review 2 passed with zero findings. Approval authorizes only the seven ordered
implementation checkpoints and boundaries in this plan. No implementation
checkpoint started as part of the approval task.
