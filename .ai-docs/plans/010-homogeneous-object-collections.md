# PLAN-010: Homogeneous object collection runtime

- **Status:** Approved
- **Date:** 2026-07-14
- **Approval date:** 2026-07-14
- **Review revision:** 0
- **Review state:** Complete review cycle 1 passed all nine areas with zero
  findings; formally approved by Ricard
- **Implementation state:** Checkpoints 1–5 completed; checkpoints 6–7 pending
- **Implementation authorized:** Yes — checkpoints 1–7 only
- **Requires:** accepted
  [`SPEC-001` v0.1.15](../specs/001-controlled-form-runtime.md),
  [`SPEC-002` v0.1.2](../specs/002-nested-object-runtime.md),
  [`SPEC-003` v0.1.2](../specs/003-collection-runtime.md),
  [`ADR-005` revision 2](../adrs/005-politica-dialecto-json-schema.md),
  [`ADR-007`](../adrs/007-resolucion-renderers-testers.md),
  [`ADR-008`](../adrs/008-instanciacion-renderers-angular.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-014` revision 2](../adrs/014-modelo-objetos-anidados-paths-profundos.md),
  and
  [`ADR-015` revision 4](../adrs/015-modelo-colecciones-identidad-operaciones.md)
- **Milestone:** M10 — Homogeneous object collections

## 1. Goal and authorization boundary

Implement the accepted M10 extension end to end for homogeneous arrays of
inline object items with application-owned stable string identity:

```text
array schema + structural item UI + collection policy
  -> immutable collection definition + static item template
  -> stable addressed controlled runtime instances and operations
  -> accessible fixed Angular collection/item projection
```

The application remains the only source of truth for current/baseline values
and supplies every inserted item and identity. Core emits strict intentions and
immutable snapshots; Angular projects them without owning collection state,
validation or operations.

Before approval this Proposed plan authorized no implementation. Ricard
formally approved revision 0 on 14 July 2026, authorizing checkpoint 1 and the
seven-checkpoint sequence below. Approval does not authorize primitive/nested arrays, tuples, refs/composition,
generated/editable identity, factories/defaults, batches/optimism, layout,
custom collection renderers, persistence, publication or Stable promotion.

## 2. Reviewed current implementation

The completed M9 repository already provides:

- recursive inline-object compilation and structural UI traversal;
- immutable definition/snapshot trees with depth-first leaf projections;
- strict deep primitive-leaf operations and controlled runtime behavior;
- fixed Internal Angular object hosts plus ADR-007 primitive renderers;
- exact package declarations, private `0.1.0` artifacts and clean Angular 22
  lower/upper consumer verification.

It does not contain array definitions, item templates, collection policies,
stable item addresses, structural item operations, collection snapshots/scopes
or collection/item hosts. Existing paths are string-only managed addresses;
numeric segments are not yet valid positional observations. Existing Public
text contexts and Angular renderer inputs do not yet contain the accepted M10
unions.

Implementation must extend the current recursive engine rather than create a
parallel collection runtime, alternate compiler or framework-owned authority.

## 3. Public Experimental contract migration

### 3.1 Compiler, UI and normalized definition

Add and root-export exactly the accepted contracts:

- `CollectionPolicy` and `CompileFormDefinitionInput.collectionPolicies`;
- `ArrayUiSchema`, `ItemUiSchema` and the widened `UiNodeSchema`;
- `ItemIdentityDefinition`, `BaseNodeTemplate`, `ObjectNodeTemplate`,
  `FieldTemplate`, `FormNodeTemplate` and `ObjectItemTemplateDefinition`;
- `ArrayNodeDefinition` in `FormNodeDefinition`; and
- static collection/template paths, keys and identity-linked projections from
  SPEC-003 sections 7–8.

`FormDefinition.fields` remains the static same-reference projection of leaves
outside item templates. Template leaves exist only under
`ArrayNodeDefinition.item.fields`. No runtime instance enters the immutable
definition.

### 3.2 Runtime, operations, scopes and text

Add and root-export exactly:

- `CollectionItemAddress`, `CollectionNodeAddress`, `ArrayPresence`,
  `CollectionIdentityState`, `ArrayRuntimeSnapshot`, `ItemRuntimeSnapshot`,
  `RuntimeTreeSnapshot` and `FormScopeTarget`;
- `CollectionPlacement`, `SetItemValueOperation`,
  `RemoveItemValueOperation`, `InsertItemOperation`, `RemoveItemOperation` and
  `MoveItemOperation`; and
- `CollectionTextMember` and `CollectionTextResolutionContext`.

Apply every accepted changed-union/method contract atomically across repository
consumers: definition/runtime/operation unions, positional `DataPath`, dynamic
runtime `fields`, stable reads, five request methods, widened `focus`/`blur`,
scope targets, operation helpers, runtime options/updates/manual validation,
primitive item `FieldDefinition | FieldTemplate` text boundaries and the
revision-4 `ObjectTextResolutionContext.node` union.

All additions remain Public + Experimental + Active. Add no unlisted symbol,
entry point, compatibility alias or stable facade.

### 3.3 Angular Public/Internal boundary

Change only the accepted transitive Public Angular contracts:

- `AngularControlledFormConfig`;
- `SchemaFormDirective` snapshot projection, two stable reads, five collection
  requests and widened focus/blur projections;
- `SchemaFieldOutletDirective.schemaFieldOutlet`;
- `AngularFieldRenderer.field/snapshot/texts`, including the exact
  `FieldDefinition | FieldTemplate` definition input and current instance
  snapshot/text projection semantics; and
- `RendererTester` and `AngularRendererResolver.resolve()` for
  `FieldDefinition | FieldTemplate`.

Fixed collection/item hosts, their text snapshots/projectors, stable view
tracking, DOM IDs, action controls, focus restoration and lifecycle/failure
helpers remain Internal and absent from the Angular root export.

## 4. Compiler and definition delivery

### 4.1 Collection-policy normalization

Inspect the policy container, dense indices, paths and identity names only
through own descriptors. Copy/freeze all accepted containers and emit the exact
exterior/semantic diagnostics in SPEC-003 section 4, including order, branch
stopping, safe types and duplicate/unused policy behavior.

Index policies by canonical array path only after complete exterior validation.
Do not treat empty or whitespace property names as malformed; non-blank applies
only to runtime identity values. Never retain or execute caller policy objects.

### 4.2 Array/items/schema traversal

Extend the existing explicit traversal stacks for supported array properties
outside item templates. Validate the exact ADR-005 revision 2 array/item
keyword catalog, inline ordinary-object `items`, direct required string identity
schema and template descendants.

Traversal must:

- remain descriptor-safe, iterative and depth-first pre-order;
- preserve active-ancestry cycle detection and legal sibling sharing;
- attach exact absolute data/document paths plus frozen `templatePath`;
- exclude identity from editable templates/projections;
- stop nested arrays inside templates with the accepted diagnostic; and
- return no partial definition after any error.

### 4.3 Structural item UI

Select the UI branch from the corresponding normalized schema kind. Parse
array texts and item `order/fields` using the existing explicit structural UI
stack. Enforce the exact incompatible option table, identity-entry rejection,
cycle behavior, diagnostic paths/order and empty-item-UI semantics.

UI Schema cannot declare identity, cardinality, actions, insertion values,
renderer selection or layout.

### 4.4 Shared manual-definition validation

Extend the existing Internal definition validator for every SPEC-003 section
7.1 reason and locator. Validate root nodes, array exterior, item templates and
their fields iteratively in the accepted order. Detect cycles, reused identity,
duplicate paths, projection mismatch, identity overlap and nested arrays
without mutating/freezing caller definitions or invoking accessors.

Runtime creation returns the first blocking `INVALID_RUNTIME_OPTIONS` defect;
`applyFormOperation()` collects independently inspectable
`INVALID_FORM_DEFINITION` defects before membership or data traversal.

## 5. Collection operation delivery

### 5.1 Shape and stable-address validation

Extend operation parsing with exactly five M10 discriminants and the fixed
member order from SPEC-003 section 12.1. Copy/freeze paths, addresses,
expectations, metadata and placements; retain an inserted `item` as the exact
opaque application reference without cloning or freezing it.

Keep non-collection diagnostic envelopes unchanged. Emit only the accepted
collection-specific shape, managed-path, incompatible-value and stale codes
with exact parameters, positional/collection paths, fallbacks and precedence.

### 5.2 Descriptor-safe immutable effects

Implement schema-neutral `applyOperation()` and definition-aware
`applyFormOperation()` over stable identity:

- inspect ancestors, arrays, indices, identity and editable descendants through
  own descriptors without executing accessors;
- validate the complete identity sequence before any target/anchor effect;
- resolve current indices by exact item ID, never by caller position;
- keep leaf expectation semantics and allow concurrent moves;
- insert the exact opaque item reference and require its own identity to equal
  `itemId`;
- reject missing/duplicate/invalid identities and stable anchors atomically;
- treat already-satisfied movement as successful no-effect; and
- clone only the ordinary-object ancestor chain and array while preserving
  unaffected descriptors/item references.

Only start/end insertion may materialize a missing collection and compatible
missing object ancestors. Remove/move never materialize. No helper batches,
prunes, mutates identity or applies optimistically.

## 6. Controlled runtime delivery

### 6.1 External state and identity safety

Extend initial/update inspection in the exact value/baseline, definition,
index and template order from SPEC-003. Distinguish sparse/accessor slots,
identity accessors and editable descendant accessors without executing them.

Identity-invalid data remains a recoverable published business state with safe
`CollectionIdentityState`, ordered ephemeral diagnostics and no addressable
items. Editable managed accessors remain blocking and atomic before validator
invocation. Independent collections continue safely.

### 6.2 Snapshots, lookup and sharing

Build collection, item and descendant snapshots with:

- stable canonical item/instance keys and current positional data paths;
- exact collection/item presence, validity, issues and visibility;
- current/baseline identity matching and structural dirty ownership;
- dynamic same-reference `FormRuntimeSnapshot.fields` expansion; and
- stable reads plus positional read-only `getNodeSnapshot()` behavior.

Reconciliation tracks logical identity, not object reference or index. Reuse
only wrappers whose complete observable state and position are unchanged;
rebuild moved wrappers exposing changed index/path while preserving their
interaction and Angular ownership. Removal/identity invalidation releases
vanished interaction/resources.

### 6.3 Validation, scopes and interaction

Keep the external validator positional and map issues exactly to array, item,
managed descendant or deepest safe ancestor. Under invalid identity, attach all
descendant issues to the array without rewriting paths or synthesizing issues.

Implement `FormScopeTarget` parsing so collection paths select current items,
stable addresses follow identities and numeric positional paths remain invalid
scope targets. Preserve overlap, visibility, global issue and reset behavior.

Route item set/remove/focus/blur through copied stable addresses. Numeric paths
remain read-only observations and invalid intentions. Preserve at most one
focused leaf, movement survival, removal clearing and controlled confirmation.

### 6.4 Runtime requests and text

Implement both stable reads and all five request methods with exact argument
diagnostics, addressability rules, sequential metadata and at-most-one
operation emission. No request changes the snapshot before an accepted external
update.

Project collection ordinary text/issues through the widened object context;
identity/item/action/item-issue text through the collection context; and item
primitive text through `FieldDefinition | FieldTemplate`. Preserve exact
sources, blank/fallback rules, diagnostics, projection/reprojection order and
resolver isolation.

## 7. Angular 22 projection

### 7.1 Fixed collection and item hosts

Extend the existing Internal node outlet to pair array definitions with array
snapshots and instantiate a fixed Internal collection host. It owns stable-keyed
item views; each item host owns its descendant object/leaf outlets and one
stable `CollectionNodeAddress` per leaf.

Never route arrays through ADR-007 or interpret raw schema/UI Schema in Angular.
A move reorders the same logical item view and never transfers its leaf buffer,
renderer, touched/focus state or action ownership to another identity.

### 7.2 Accessibility, actions and focus

Render a semantic collection group/legend and per-item legend with one-based
position. Provide localized remove/move-earlier/move-later controls using only
current adjacent stable identities; disable unavailable actions. Do not add an
implicit Add control because insertion data remains application-owned.

Generate exact collision-safe collection/item/instance DOM bases and fixed
suffixes. On confirmed removal, restore local DOM focus to next, previous or
collection legend as specified; confirmed move preserves the same logical
control; rejection changes nothing.

Invalid identity renders collection text/issues and no item/action subtree.
Signal Forms remain private primitive-leaf buffers and never own arrays,
identity, validation or operations.

### 7.3 Failure isolation and lifecycle

Destroy partial fixed hosts on synchronous creation/binding failure, emit the
exact collection/item host diagnostic once and stop only that subtree.
Independent siblings/items continue. Do not claim isolation for later Angular
template/lifecycle/change-detection exceptions.

Destroy removed items, rejected replacement candidates and all descendants
deterministically. Locale/text reprojection must not recreate item hosts,
renderers or Signal Form buffers.

## 8. Test and conformance delivery

JSON fixtures cover serializable schema/UI/policy/operation/runtime cases.
Programmatic tests cover accessors, descriptors, prototypes, cycles, shared
identity, hostile names, opaque references, exceptions and lone surrogates.
Fixture regeneration is a separate reviewed action after focused assertions;
generated output is never its own oracle.

### 8.1 SPEC-003 scenario matrix

| SPEC scenario                              | Required evidence                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 1. Cardinality and independent/deep arrays | compiler/runtime fixtures for zero/one/many items and multiple arrays outside templates                                       |
| 2. Schema/UI/policy catalog and traversal  | compiler fixtures plus programmatic accessor/cycle/sharing/order/branch-stopping tests                                        |
| 3. Identity edge cases                     | runtime/operation tests for punctuation, whitespace, Unicode/lone surrogates, `__proto__`, duplicate and every invalid reason |
| 4. Template/manual definition and keys     | definition validator tests for every reason/locator, projection identity and key/DOM collision cases                          |
| 5. Current/baseline dirty matrix           | runtime fixtures for missing/incompatible/identity-invalid arrays and identity/order/descendant differences                   |
| 6. Stable and positional reads             | runtime tests across insert/remove/move/immutable replacement, malformed and vanished addresses                               |
| 7. Five operations                         | pure/form helper fixtures for effects, stale/no-effect, opaque items, descriptors and missing-ancestor insertion              |
| 8. Confirmation and interaction            | runtime tests for rejection, movement/removal, focus/touched reconciliation and reference sharing                             |
| 9. Validator/scopes/visibility             | runtime fixtures for positional assignment, invalid-identity fallback, stable targets, overlap and reset                      |
| 10. Text resolution                        | core/Angular tests for every ordinary/collection/item/leaf member, fallback, diagnostic and projection order                  |
| 11. Angular collection projection          | semantic/accessibility, stable views, adjacent actions, focus restoration and isolated host failures                          |
| 12. Declarations/packages/consumers        | root-import type/package tests, artifact allowlists, lower/upper Angular consumers and deep-import rejection                  |

Every diagnostic assertion covers code, severity, source, exact immutable
parameters/path/fallback, ordering, branch stopping and non-retention of caller,
hostile or thrown values.

### 8.2 Baseline and Angular integration

Migrate existing compiler/operation/runtime/Angular expected definitions and
manual fixtures to the accepted M10 unions without weakening M1–M9 assertions.
Add focused tests for collection render order, item view identity, descendant
renderer routing, locale reprojection, disabled actions, controlled
confirmation/rejection, form replacement and deterministic destruction.

No test may assert primitive/nested arrays, tuples, generated identity,
selection, drag/drop, virtualization, custom collection renderers, async
validation, persistence or submission.

## 9. Package, declarations and consumers

Update package/root documentation and candidate release notes for the accepted
M10 subset. Keep packages private independent `0.1.0`, exact Angular peer range
and publication prohibition.

Core package smoke and consumer type tests must compile policies, inspect
templates/snapshots, use stable reads/requests and apply collection operations
through the root import. Angular smoke/consumer tests must render an accessible
multi-item collection, route one stable leaf intention and structural action,
and confirm that no collection host/projector is root-exported.

`test:artifacts` retains exact tarball allowlists. Clean core and Angular 22
lower/upper consumers pass against local tarballs. No manifest version,
dependency, peer/export map, lockfile, registry or publication change is part
of M10.

## 10. Implementation sequence and checkpoints

After explicit plan approval only:

1. Add Public neutral contracts/exports and shared Internal collection
   address/definition validation helpers; migrate declaration-only consumers
   and keep the repository green.
2. Implement policy plus array/items/structural-UI compilation, immutable
   templates and compiler/manual-definition conformance fixtures.
3. Implement five collection operations and pure/form helper diagnostics,
   descriptor behavior and fixtures.
4. Implement external identity inspection, snapshots, sharing, reads,
   requests, validation/scopes/interaction and runtime fixtures.
5. Implement Internal Angular collection/item/text projection, stable views,
   actions, accessibility, focus/lifecycle/failure behavior and focused tests.
6. Complete root declaration, package smoke, documentation, artifact and
   built/clean consumer migration without manifest/lockfile/publication drift.
7. Run the complete matrix, inspect declarations and the entire diff, correct
   every finding and repeat the full review/checks until zero findings.

Each checkpoint updates persistent state, preserves unrelated dirty work and
passes format, lint, typecheck, focused tests, applicable builds and
`git diff --check`. A failing checkpoint is not recorded as complete and no
later checkpoint begins until its dependencies are green.

## 11. Expected production diff

Expected existing files include core contracts/compiler/operations/runtime/root
index and focused tests/fixtures; Angular form/node outlet, field outlet,
renderer/text/native helpers and tests; package smoke/consumer checks; package
READMEs, root README, release notes and persistent state.

New Internal files may separate collection definition/address helpers and
Angular collection/item hosts/text projection where that keeps modules
cohesive. Exact Internal decomposition may change, but no new root export,
entry point, package or runtime dependency may result.

No unrelated refactor, compatibility mode, generated artifact commit,
manifest/lockfile drift, license/credential/registry write, GitHub release or
publication action is allowed.

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

Also inspect:

- focused compiler/operation/runtime/Angular tests at every checkpoint;
- all 12 SPEC-003 scenario rows and programmatic hostile-object cases;
- emitted `.d.ts` and root exports against section 3;
- definition/snapshot projection identity and structural sharing by reference;
- descriptor/prototype/on-path effects by reflection;
- stable/positional addressing and no index-based intention routing;
- Angular semantic relationships, collision-safe IDs, focus and destruction;
- lower/upper Angular 22 consumers and exact private artifact allowlists;
- absence of `workspace:` in packed manifests and deep-import availability;
- dependency/manifest/lockfile/publication/deferred-boundary diff guards; and
- Markdown links, persistent-state consistency and `git diff --check`.

Verification must not rewrite fixtures, generated files, manifests or lockfiles
implicitly. Any intentional fixture regeneration is reviewed before the final
read-only matrix.

## 13. Completion and stop conditions

M10 is complete only when:

1. all 12 SPEC-003 scenarios map to passing evidence;
2. M1–M9 behavior remains green after the Experimental contract migration;
3. the full command matrix, packages and clean consumers pass;
4. declarations/root exports exactly match the accepted inventory;
5. no deferred capability, publication setting or Stable claim enters the
   diff;
6. final implementation review repeats after every correction until zero
   findings; and
7. STATUS is compacted, WORKLOG is prepended and ROADMAP changes only when M10
   actually completes.

Stop and return to normative review if implementation requires:

- changing an accepted policy, definition, identity, address, operation,
  snapshot, diagnostic, text, scope, Angular or API contract;
- adding a Public symbol/entry point or changing package manifests, peers,
  dependencies or lockfile;
- generating/editing identity, interpreting raw schema in Angular or routing an
  intention by numeric position;
- adding an arbitrary depth limit or executing schema/UI/data accessors;
- activating any excluded array form, layout, renderer, batch, persistence,
  publication or Stable capability; or
- weakening controlled ownership, atomicity, immutability, descriptor safety,
  accessibility, lifecycle isolation or required verification.

## 14. Plan acceptance criteria

PLAN-010 may be approved only when a complete review confirms:

1. all 12 SPEC-003 scenarios map to concrete implementation/evidence;
2. all Public migrations and Internal-only additions are explicit;
3. compiler, operations, runtime, Angular and package checkpoints are
   independently verifiable and correctly ordered;
4. controlled ownership, stable identity/addressing and framework neutrality
   are preserved;
5. descriptor, cycle, diagnostic, sharing, accessibility and lifecycle tests
   are exact;
6. existing M1–M9/package/clean-consumer behavior is preserved;
7. deferred, dependency, publication and stability boundaries remain closed;
8. completion and stop conditions are objective; and
9. a repeated review is required after every correction until zero findings.

Approval authorizes only the implementation described here. It does not
pre-approve corrections that alter an accepted contract or scope.

## 15. Review record

### 15.1 Complete review cycle 1

The complete review in
[`review 014`](../reviews/014-plan-010-review.md) passed all nine acceptance
areas with zero findings, requested corrections or documentation conflicts.

At the cycle 1 review checkpoint PLAN-010 remained Proposed. Review completion
did not approve the plan or authorize checkpoint 1; Ricard still had to make an
explicit formal approval decision.

### 15.2 Formal approval

Ricard explicitly approved PLAN-010 revision 0 on 14 July 2026 after complete
review cycle 1 passed all nine areas with zero findings. Approval authorizes
only checkpoints 1–7 and their stated verification/stop conditions.
Checkpoints 1–5 are complete; checkpoints 6–7 remain pending. No excluded
capability, Stable promotion or publication is authorized.

### 15.3 Implementation checkpoint 1

Checkpoint 1 completed on 14 July 2026. It added the accepted neutral Public
contract shapes and root type exports, shared descriptor-safe Internal
collection address/key helpers, and iterative manual collection-definition
validation behind a separate Internal entry. Existing M9 runtime/operation
consumers retain their prior validator until their checkpoints. Declaration-only
Angular text handling and the exact artifact allowlist were migrated without
activating collection compilation, operations, runtime behavior or Angular
collection hosts.

Format, lint, typecheck, builds, 177 core tests, 59 Angular tests, package smoke,
integrated consumer, exact artifacts and clean core/Angular 22 consumers pass.
Checkpoint 2 is the next authorized action.

### 15.4 Implementation checkpoint 2

Checkpoint 2 completed on 14 July 2026. It added descriptor-safe collection
policy normalization, supported array/item schema traversal, semantic identity
policy checks, structural item UI traversal and immutable array definitions
with static item templates. Identity is excluded from editable/global leaf
projections, template diagnostics retain absolute array paths plus relative
`templatePath`, and nested arrays stop before inspecting `items`.

Compiler/manual-definition unit and conformance fixtures cover hostile
descriptors, policy failures, identity/UI exclusion, cycles, independent/deep
arrays, exact diagnostic ordering and non-recursive depth. Existing M9 runtime
and operation consumers retain their collection-rejecting validator; checkpoint
3 is the next authorized action.

### 15.5 Implementation checkpoint 3

Checkpoint 3 completed on 14 July 2026. `FormOperation` now includes the five
accepted collection variants. A dedicated Internal helper validates their
descriptor-safe shape in fixed order, applies definition-aware collection and
template membership, scans complete stable identity sequences and performs
atomic immutable leaf, insert, remove and move effects. Schema-neutral
application retains opaque inserted item references; definition-aware leaf
sets enforce primitive compatibility only after target and expectation
resolution.

Programmatic and JSON conformance evidence covers all five variants, concurrent
movement, no-effect placement, missing materialization, stable anchors,
identity and expectation staleness, accessors, descriptors, opaque references
and diagnostic precedence. Existing M9 operations remain unchanged. Collection
runtime snapshots, requests and Angular hosts remain inactive; checkpoint 4 is
the next authorized action.

### 15.6 Implementation checkpoint 4

Checkpoint 4 completed on 14 July 2026. The controlled runtime now inspects
current and baseline collection identity without invoking accessors, publishes
stable collection/item/template snapshots plus dynamic leaf projections, and
reconciles dirty, interaction and structural sharing by item identity.

Positional reads remain observation-only; stable reads, all five collection
requests, stable focus/blur and collection-aware validation scopes are active.
Issue assignment follows positional validator paths with array/item/deepest
managed fallbacks, invalid identity exposes no addressable descendants, and
start/end insertion alone permits compatible missing-path materialization.

Focused runtime evidence covers hostile argument/member parsing, current then
baseline inspection order, deep iterative item trees, identity recovery,
movement/removal interaction, immutable replacement sharing, all request
variants, dirty matrices, validation visibility and exact blocking paths.
Format, lint, typecheck, builds, 247 core tests, 59 Angular tests, package smoke,
integrated consumer and exact artifact checks pass. Angular collection/item
hosts and projection behavior remain inactive; checkpoint 5 is the next
authorized action.

### 15.7 Implementation checkpoint 5

Checkpoint 5 completed on 14 July 2026. Angular now projects array snapshots
through fixed Internal collection/item hosts with stable-keyed item views,
stable leaf addresses and existing primitive renderer/Signal Form buffers.
Semantic legends, localized adjacent remove/move actions, collision-safe IDs,
invalid-identity suppression and controlled rejection behavior preserve
application ownership.

Confirmed moves retain logical renderer and DOM focus ownership. Confirmed
removal restores focus to the next item, previous item or collection legend;
removed descendants are destroyed. Ordinary, identity, issue and item-action
text identities are isolated, and synchronous partial collection/item host
failures stop only their subtree with exact diagnostics.

Format, lint, typecheck, builds, 247 core tests, 68 Angular tests, package smoke,
integrated consumer, exact artifacts and clean core/Angular 22 consumers pass.
No root export, manifest, lockfile, dependency, publication or Stable state
changed. Checkpoint 6 is the next authorized action.
