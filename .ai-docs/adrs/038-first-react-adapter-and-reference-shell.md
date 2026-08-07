# ADR 038: First client-rendered React adapter and independent reference shell

- **State:** Accepted revision 0
- **Date:** 4 August 2026
- **Acceptance date:** 4 August 2026
- **Milestone:** M35 — First React adapter and admitted reference shell
- **Promoted by:** accepted
  [review 338](../reviews/338-d026-d044-m35-react-adapter-promotion-readiness.md)
  cycle 2
- **Requires:** Accepted SPEC-001 v0.1.15 through SPEC-020 v0.1.0; ADR-006,
  ADR-007, ADR-009, ADR-010, ADR-020, ADR-021, ADR-023, ADR-024, ADR-025 and
  ADR-037; completed M1–M34/G0
- **Coordinates:** D-026 and D-044; reviews the second-adapter triggers in
  ADR-007, ADR-009 and ADR-010 without superseding their neutral policies
- **Complete review:** [Review 339](../reviews/339-adr-038-review.md) cycle 5
  passed all eighteen areas with zero findings after twelve corrections
- **Authority:** Accepted architecture. It authorizes preparation and complete
  review of SPEC-021, not dependency,
  package, implementation, version, release, publication, commit, push or any
  external action.

## 1. Context

The framework-neutral core and its controlled runtime now implement the active
surface through M34. Angular projects that surface through a Public adapter and
native HTML renderers. Standard/DOM independently consumes core directly in a
private reference shell. The shared private scenario catalog covers the same
accepted behavior without containing framework lifecycle or rendering logic.

React is the first real second framework adapter. Its introduction triggers the
review conditions deliberately left in D-026 and ADR-007/009/010. It must prove
that the core subscription, renderer selection, controlled intentions, stable
tree identity, target-local presentation state and wizard lifecycle can map to
another component framework without turning Angular or Standard implementation
details into a universal abstraction.

The adapter also needs a maintained consumer. ADR-020 permits a later private
shell only after its adapter contract, project and verification matrix are
accepted. A direct-core React demo would duplicate the Standard shell and would
not establish a supported integration. A headless package without native
projection or a shell would not exercise the behavior that motivates the
adapter.

## 2. Decision summary

M35 will define one staged vertical integration:

```text
@rabassoft/schema-engine-react  -> Public Experimental React web adapter
apps/reference-react            -> private independent React reference shell
```

The adapter is client-rendered and React-DOM-specific. It projects the complete
framework-neutral behavior implemented through M34 using native HTML controls
and React-owned component composition. The application remains the only source
of truth for business data and every external decision.

The reference shell consumes the existing neutral catalog but owns its own
bootstrap, controlled application state, components, styles, examples, tests
and browser lifecycle. No Angular or Standard controller, renderer, template,
style or framework helper is shared.

## 3. Package and compatibility boundary

### 3.1 Package identity

The new package will reside in `packages/react` and use the Public name:

```text
@rabassoft/schema-engine-react
```

It will be ESM, declare `sideEffects: false`, expose exactly one root entry
point and support no deep imports or wildcard export maps. It may contain
Internal modules for lifecycle, renderer resolution, text projection, native
fields, node hosts, presentation containers and wizard projection.

The M35 source package starts at `0.0.0` with `private: true` while local
contract and implementation gates are completed. It declares workspace
development/peer relationships needed by local paired candidates, and packed-
artifact tests must prove how pnpm rewrites them. Its first public version,
removal of `private`, final core peer range and any coordinated core/Angular
release require a separate version/release gate under ADR-010. Public in this
ADR describes API visibility, not current npm availability.

### 3.2 Initial React line

The first supported framework line is:

| Package     | Supported range    | Initial lower tuple | Current verification tuple                  |
| ----------- | ------------------ | ------------------- | ------------------------------------------- |
| `react`     | `>=19.2.0 <20.0.0` | `19.2.0`            | latest stable `19.2.x` selected by the plan |
| `react-dom` | `>=19.2.0 <20.0.0` | `19.2.0`            | same exact patch as `react`                 |

`react` and `react-dom` are peer dependencies and must resolve to the same exact
version in supported consumer tuples. Their type packages and build tooling are
development-only dependencies aligned to the selected runtime line. React and
React DOM are not bundled into the adapter.

React 18, canary/experimental builds, React 20 and React Native are not claimed.
React 18 can be evaluated later through an explicit compatibility review and
lower/latest consumer evidence. The initial line favors one current, bounded
contract over a broad untested range.

The adapter consumes `@rabassoft/schema-engine` as a peer in any publishable
candidate and as a workspace development dependency. A later release gate must
select the first core range that actually contains the M1–M34 contract. The
current published `0.4.1` bytes cannot be treated as evidence for the newer
dirty source solely because the workspace manifest still has that version.

### 3.3 Build boundary

The package is compiled from TSX to ESM and declarations without bundling React,
React DOM or core. The private shell uses the repository's browser build
tooling and one React-aware JSX integration selected in the later dependency
checkpoint. The package build does not depend on the shell or catalog.

## 4. Public Experimental API

### 4.1 Exact root inventory

The new root entry point contains exactly four runtime values:

1. `useSchemaForm`;
2. `SchemaForm`;
3. `createReactRendererRegistry`; and
4. `createReactNativeRendererRegistry`.

It also exports these twelve TypeScript contracts:

1. `ReactControlledFormConfig`;
2. `ReactFormState`;
3. `ReactFormHandle`;
4. `ReactFormActions`;
5. `SchemaFormProps`;
6. `ReactFieldRendererProps`;
7. `ReactRendererComponent`;
8. `ReactRendererTester`;
9. `ReactRendererRegistration`;
10. `ReactRendererRegistry`;
11. `ReactRendererRegistryResult`; and
12. `ReactFieldTextSnapshot`.

All sixteen exports and their transitive core types are Public + Experimental +
Active under ADR-009. Native renderer components, context objects, bridge
stores, host components, text projectors, codecs, IDs, registries' internal
representation and reference-shell helpers remain Internal.

SPEC-021 may refine generic constraints and exact member names only while
preserving this inventory and responsibility split. Adding, removing or
renaming a root export requires a reviewed ADR revision before the SPEC can be
Accepted.

### 4.2 Controlled configuration

`ReactControlledFormConfig<TData>` contains the complete neutral runtime input
required by the active core contract plus adapter callbacks:

- required callable `onOperation(operation)` for immutable user intentions;
- required callable `onWizardIntention(intention)` for M34 navigation/
  completion intentions; and
- optional `onDiagnostics(diagnostics)` for adapter projection failures.

Locale remains explicit because React has no equivalent of Angular `LOCALE_ID`
in this package. Missing or blank locale follows the existing runtime failure
contract. Invalid required callbacks block adapter readiness before runtime
creation. Callback identity changes do not recreate the runtime; the adapter
always invokes the latest committed callback. Operation/wizard callback
exceptions remain isolated by the core listener contract. An `onDiagnostics`
exception is swallowed after deactivating that delivery attempt; it never
recurses, changes state or writes to the console.

The application owns operation confirmation/rejection and returns a new
immutable value through the next config. The adapter never calls
`applyFormOperation()`, changes `value`/`baselineValue`, starts async transport,
commits a scope, persists, submits or marks work saved.

### 4.3 Hook state and actions

`useSchemaForm(config)` returns one `ReactFormHandle<TData>` with:

- a discriminated `state` whose status is `initializing`, `ready` or `error`;
- the immutable core snapshot only in the `ready` branch;
- frozen lifecycle/configuration diagnostics in the `error` branch; and
- one stable `ReactFormActions` facade.

The action facade covers the accepted public runtime actions needed by native
and application consumers: `getFieldSnapshot`, `getNodeSnapshot`,
`getItemSnapshot`, `getCollectionNodeSnapshot`, leaf and item set/remove,
collection insert/remove/move, focus, blur, `resetTouched`,
`setValidationVisibility`, `getValidationSnapshot`,
`showValidationErrors`, `hideValidationErrors`, `retryAsyncValidation`, and M34
previous/next/complete/reject/confirm actions. `confirmWizardSelection` is the
only facade action that wraps the existing controlled `wizardSelection`
external-state update. The facade does not expose
`updateExternalState`, `subscribe`, `subscribeOperations`, `dispose` or the raw
runtime instance because lifecycle and external-state reconciliation belong to
the hook.

Actions are referentially stable within one ready runtime epoch and replaced
atomically when the epoch changes. Calling an action while the handle is not
ready, from a replaced epoch or after unmount returns one immutable adapter
diagnostic and produces no operation, snapshot change or side effect. A
callback retained from an older handle epoch cannot act on a newer runtime.
Every non-empty action diagnostic batch is also delivered once to the latest
committed `onDiagnostics` callback.

### 4.4 Form projection

`SchemaForm` receives a ready-or-not-ready `ReactFormHandle` and one valid
`ReactRendererRegistry`. It returns no projection while initializing or in an
error state; the application can render those states from the handle. It does
not create a business `<form>`, submit control or persistence boundary. Its
client DOM root and CSS hooks are presentation details until SPEC-021 defines
the minimum accessible structure.

The component consumes only the handle's immutable projection and actions. It
does not accept raw schema, value, baseline, validator or callbacks separately.
Passing a handle and registry from different package copies or an invalid/stale
registry fails safely with adapter diagnostics and no partial active tree.

## 5. React lifecycle and external-store bridge

### 5.1 No render-phase runtime mutation

React components and hooks remain pure during render. Runtime creation,
external-state updates, subscription installation, replacement and disposal do
not occur in component render or memo calculation.

`useSchemaForm` owns one stable Internal bridge store created without calling
core or application code. The hook reads it through `useSyncExternalStore` with
stable `subscribe` and `getSnapshot` functions. The bridge caches the immutable
last adapter state and returns the same reference until a real state change.

No `getServerSnapshot` is provided in M35. Attempting to server-render the hook
is unsupported and cannot be presented as SSR/hydration compatibility.

### 5.2 Commit-phase creation and reconciliation

A client layout effect installs the current runtime after commit and before
paint:

1. create the runtime from the latest committed identity inputs;
2. attach snapshot, operation and wizard-intention subscriptions;
3. publish either `ready` with the initial immutable snapshot or `error` with
   immutable diagnostics; and
4. return cleanup that invalidates the epoch, unsubscribes and disposes exactly
   that runtime instance.

The same effect reconciles committed external state. A change to `value`,
`baselineValue`, locale or validation visibility uses the accepted atomic
runtime update/action semantics without replacing a compatible runtime.
`wizardState` is an initialization input, not an ordinary prop-driven update:
after creation, only the exact `confirmWizardSelection` facade action may send
the existing confirmation object to core. A later matching application prop is
evidence of controlled ownership but does not advance the runtime again.
Changes to `formId`, definition identity, schema identity, sync/async validator
identity or another runtime-construction port dispose the old epoch and create
a new one. SPEC-021 must enumerate the exact identity set against the then-
current `ControlledFormRuntimeOptions` rather than relying on object-literal
identity.

The component may render an old immutable bridge snapshot during the render
that observes new props, but layout reconciliation and the external-store
notification must complete before paint. No user-visible optimistic state or
operation is introduced.

### 5.3 Strict Mode and development replay

The design supports React Strict Mode's development-only extra render,
setup/cleanup and ref-callback checks:

- every setup has complete cleanup;
- an abandoned render creates no runtime or subscription;
- each committed effect epoch owns and disposes only its own runtime;
- stale epoch callbacks are ignored;
- replay cannot emit a data operation or wizard intention because those require
  an explicit action after a ready commit; and
- a sync validator may be invoked once per created runtime instance, including
  the development-only setup cycle. Consumers cannot treat total validator
  calls across distinct runtime instances as a persistence or transport
  protocol.

The reference shell runs under `StrictMode`, and lifecycle tests must prove
balanced create/subscribe/unsubscribe/dispose behavior and zero duplicate user
intentions.

## 6. Renderer architecture

### 6.1 Registry semantics

`ReactRendererRegistration` contains a unique non-blank `id`, a React component
type, a tester and optional integer priority. Testers receive only a normalized
`FieldDefinition | FieldTemplate` and return a finite non-negative integer rank
or `null`.

`createReactRendererRegistry()` validates a dense immutable registration input
descriptor-safely and returns `ReactRendererRegistryResult`. Success exposes an
opaque frozen registry. Failure exposes ordered immutable diagnostics and no
partial registry.

Resolution preserves ADR-007:

1. evaluate every tester in registration order;
2. ignore `null`;
3. choose the highest rank;
4. then the highest priority; and
5. then the earliest registration.

Tester exceptions and invalid results discard only that candidate and produce
warnings. Malformed registrations, duplicate IDs or an invalid priority block
registry creation. No match blocks only the affected projection owner where
safe. Every selected renderer is wrapped in an Internal per-owner React error
boundary; a render/lifecycle exception deactivates that owner's callbacks,
shows no fabricated control, reports one deterministic committed diagnostic and
does not prevent independent siblings from rendering. The failed boundary
remains closed for the same epoch, owner identity, registration ID and component
type; it resets only when one of those identities changes, preventing an
unchanged throwing renderer from entering a retry loop. The adapter itself does
not write to the console; framework development reporting is not reclassified
as an adapter diagnostic contract.

`createReactNativeRendererRegistry(additionalRegistrations?)` composes the
closed native registrations first and validated consumer registrations after
them. A consumer overrides deliberately through rank or priority, not mutation
or a global singleton. The returned registry is immutable per form projection.

### 6.2 Renderer props

Every custom field renderer receives one frozen `ReactFieldRendererProps`
value containing:

- normalized `FieldDefinition | FieldTemplate`;
- the exact immutable `FieldRuntimeSnapshot`;
- `formId` and locale;
- one immutable `ReactFieldTextSnapshot`; and
- callbacks for set, remove, focus, blur and renderer diagnostics.

The callbacks are epoch-bound and action-gated. A hidden, disabled, blocked,
stale, replaced or unmounted renderer cannot create an accepted runtime action.
Renderers never receive raw JSON Schema, baseline, validator, runtime,
application setter or persistence service.

### 6.3 Native field set

The Internal native set covers:

- string input;
- string-enum select;
- atomic string-enum array multiple-choice control;
- number/integer text input with locale-aware presentation buffer;
- boolean checkbox; and
- fixed-value output.

The controls preserve missing, empty string, zero, negative zero, false, null,
fixed and incompatible external values according to Accepted contracts. They
emit only intentions, reconcile confirmed external state and expose visible
labels, accessible descriptions and semantic invalid state. M35 defines no
supported CSS selector, class-name, design-token or style-sheet API; the private
shell styles semantic descendant markup independently.

Native renderer components are Internal in M35. Consumers customize through
registrations rather than inheriting or deep-importing implementation classes.

## 7. Compound nodes, presentation and wizard

### 7.1 Stable identity

React keys derive only from accepted normalized identity:

- definition/node keys for root and nested nodes;
- stable collection `itemId` plus template/node key for item instances;
- presentation container/entry keys for target-local structure; and
- wizard/step IDs for retained step hosts.

Array position, random values, render counters and React `useId()` never become
domain, operation, collection or definition identity. Reordering a collection
preserves the component and local buffer associated with its stable item ID.

### 7.2 Object and collection hosts

React independently projects object children, discriminated common/active
branches, collection items and nested local presentation forests from
normalized definitions and snapshots. It does not recalculate branch
selection, conditions, issue ownership, collection operations or fallback from
raw metadata/value.

Unmounted inactive discriminated branches release target-local component state;
their domain values, baseline, touched state and future restoration remain core
and application concerns under SPEC-019. Stale callbacks are epoch/owner-gated.

### 7.3 Presentation containers

Sections, static tabs, accordions and logical grids use fixed Internal native
React hosts. Tabs and accordion expansion are target-local React state;
definition identity preserves it while owner removal or runtime replacement
disposes it. Inactive panels are removed from visual display, accessibility and
sequential focus according to the Accepted presentation contracts.

M35 introduces no React presentation-container SPI, UI-library package, design
token protocol or theme translation. ADR-024 remains Angular-only and broader
D-025 remains Deferred.

### 7.4 Wizard

The React wizard consumes only the accepted normalized wizard definition,
immutable wizard snapshot and action facade. It never derives scopes, computes
validity/progress or advances selection itself.

Every step subtree is mounted once for the active handle epoch and retained.
Inactive steps are hidden from display, accessibility and sequential focus
without losing native buffer or nested tab/accordion state. Previous, next and
complete buttons call only the neutral action facade. The application confirms
or rejects emitted intentions through controlled config/actions.

Focus leaving an inactive or removed owner is reconciled before stale events
can act. React component state does not become wizard visited, attempted,
passed, completed or submission state.

## 8. Texts, diagnostics and accessibility

The React adapter independently projects `TextResolver` results. It preserves
the accepted source strings, contexts, locale behavior, choice/issue order,
fallbacks, diagnostic batching and immutable snapshots. It does not import the
Angular text projector or move target behavior into core/catalog.

Field labels remain visible. Descriptions, hints, tooltips, issues and clear
actions use deterministic IDs derived from `formId` and normalized owner
identity, never generated render-order IDs. Controls expose accepted required,
invalid, disabled, hidden and expanded/current semantics. Target-local tabs,
accordions and wizard controls follow their accepted keyboard/focus behavior.

M35 requires automated semantic/accessibility evidence and keyboard Chromium
smoke, but claims neither accessibility certification nor assistive-technology
coverage.

Adapter diagnostics use source `runtime`, immutable safe parameters and no
console writes. SPEC-021 must close exact codes, severities, ordering,
deduplication, path ownership, callback delivery and cascade suppression for:

- lifecycle/configuration failure;
- action before ready or from a stale epoch;
- registry/registration/tester failure;
- renderer/owner instantiation failure;
- text projection failure; and
- invalid handle/registry composition.

## 9. Independent reference shell

After the package contract is accepted, add exactly:

```text
apps/reference-react
```

with Internal name `@schema-engine-internal/reference-react` and `private:
true`. Its dependency direction is:

```text
reference-react
  -> reference-scenarios
  -> @rabassoft/schema-engine
  -> @rabassoft/schema-engine-react
  -> @rabassoft/schema-engine-validator-ajv
```

The shell uses `createRoot()` under `StrictMode` and has no server entry,
prerender or hydration call. It owns immutable `value`, `baselineValue`, locale,
validation visibility, operation/wizard decisions, async service evidence,
schema/UI Schema editing and scenario reset. It uses only Public package entry
points and the existing Internal catalog root.

The complete catalog must be selectable and functional. The shell reproduces
the maintained reference experience: reference scenario explanation,
application controls, interactive form, editable schemas, observable evidence,
integration examples, copy actions, light/dark mode and the accepted usability
behavior. Text and visual parity are deliberate, but React source and CSS are
independent duplicates rather than a shared controller/component/theme
package.

Build-checked React examples are extracted from marked regions in real shell
source through the existing deterministic snippet workflow extended for the new
target. The generated module is committed and never hand edited.

Unit tests cover every catalog scenario and target-owned behavior. One
independent Playwright/Chromium lane covers representative primitive, nested,
collection, condition, alternative, async, scope and wizard paths plus
configuration editing, reset, theme and integration copy. It does not replace
package or clean-consumer evidence.

## 10. Verification and conformance ownership

SPEC-021 and PLAN-037 must assign exact ownership for at least:

1. root export/declaration inventory and deep-import rejection;
2. lower/current aligned React/React DOM clean consumers;
3. built package, packed artifact and isolated source reconstruction;
4. Strict Mode lifecycle balance and abandoned/stale epoch isolation;
5. external-state atomicity, callback freshness and zero duplicate intentions;
6. hostile renderer registrations, deterministic resolution and overrides;
7. every native leaf, missing/null/incompatible/fixed value and locale buffer;
8. nested objects, stable collection identity/reorder and discriminated branch
   lifecycle;
9. sections, tabs, accordion, grid and recursive local presentation;
10. conditions, validation/async state, scopes and baseline confirmation
    invariance;
11. retained wizard steps, focus, progress and controlled intentions;
12. complete catalog consumption, snippets and independent reference shell;
13. production build, unit/type/lint/format, boundaries and Chromium smoke;
14. unchanged core/Angular/Standard behavior and frozen published artifacts;
    and
15. complete documentation, diff and zero-finding final review.

M35 cannot claim completion from workspace tests alone. Package and isolated
consumer evidence must prove root-entry consumption without source/deep-import
leakage. Existing release/security verification remains unchanged until a
separate release plan explicitly adds the package.

## 11. D-026 and cross-adapter conclusion

The second-adapter review promotes only observed needs:

- client subscription to a synchronous immutable external store;
- deterministic framework lifecycle and disposal;
- framework-owned component/renderer composition;
- stable normalized identity; and
- target-local presentation state.

It does not produce a universal adapter interface. Angular DI/providers,
Signals, `ViewContainerRef`, Signal Forms and change detection remain Angular-
specific. React hooks, external-store bridge, component props and commit
lifecycle remain React-specific. The common layer is still the existing core
contracts and ADR-007 resolution semantics.

After M35, measured duplication may justify a separate review of pure neutral
helpers. No helper moves to core or a shared package merely because two files
look similar.

SSR, hydration, Server Components, portals, streaming, Suspense/lazy renderers,
capability negotiation and neutral dynamic components remain Deferred D-026.

## 12. ADR-007/009/010/020 review result

### ADR-007

The ranked-tester semantics remain valid and are confirmed for a second
adapter. Component/token types and registry construction stay adapter-specific.
No neutral registry package or ADR-007 revision is required by M35.

### ADR-009

The Public boundary remains `package.json#exports` intersected with root module
exports. This ADR is the explicit decision required to add the third Public
package and its sixteen Experimental exports. Deep imports and Internal native
components remain unsupported. No ADR-009 revision is required.

### ADR-010

Independent package SemVer, core as peer, framework peers, explicit matrices
and clean consumers remain valid. This ADR adds the React line but does not
version or release it. A future publication must select an actually compatible
core line and release the new adapter independently. No lockstep or ADR-010
revision is required.

### ADR-020

The existing private catalog and independent-shell rules remain valid. This ADR
is the target-specific admission decision required by section 10 of ADR-020.
No cross-framework application/controller is introduced and no ADR-020 revision
is required.

## 13. Rejected alternatives

### Support React 18 and 19 immediately

Rejected for the first increment. The runtime API required by M35 may be
available in both, but declaration, lifecycle and consumer compatibility must
be demonstrated rather than inferred. A future compatibility review can widen
the range in a React-adapter MINOR.

### Create the runtime during render or memoization

Rejected because runtime construction validates through application-provided
ports and creates lifecycle state. React may render without committing or
repeat development renders. The stable empty bridge plus commit-phase runtime
ownership avoids abandoned runtime instances and render side effects.

### Expose the raw runtime from the hook

Rejected because callers could retain and act on a disposed epoch, duplicate
subscriptions or bypass external-state reconciliation. The closed action facade
preserves lifecycle ownership while mapping every accepted action.

### Component-only API with callback snapshots

Rejected because applications and the reference shell need idiomatic snapshot
reads and actions without copying them into a second React state store. The
hook plus external-store bridge exposes the immutable snapshot directly.

### Direct-core private React shell

Rejected because it duplicates Standard/DOM and does not define a supported
framework package, renderer extension or compatibility matrix.

### Share Angular/Standard renderers, controller or CSS

Rejected because lifecycle, component identity and state are target-owned. The
catalog shares authored scenarios/evidence only. Visual parity may use
independent duplicated styles until a concrete D-025 protocol is promoted.

### Add a React UI library or container SPI

Rejected from M35. Native HTML proves the adapter first. A specific library,
theme and package would require its own D-025 architecture and dependency gate.

## 14. Explicit exclusions

ADR-038 does not authorize or define:

- changes to core schema/UI grammar, compiler, runtime, operations, validation,
  scopes, conditions, alternatives or wizard behavior;
- React 18/20/canary, React Native, Vue, Svelte or a universal adapter;
- SSR, hydration, Server Components, streaming, portals, overlays, Suspense,
  lazy renderers or capability negotiation;
- a React UI-library package, presentation-container SPI, shared theme/tokens,
  shared CSS or Angular Aria equivalent;
- hot definition reconciliation, persistence, HTTP, submit/save state,
  authorization, workflow beyond M34 or hosting;
- Stable API, new core/Angular exports or modifications to published `0.4.1`/
  `0.2.1` bytes; or
- SPEC-021 acceptance, PLAN-037, dependency/manifest/lockfile mutation,
  implementation, version, release, npm/GitHub/Git actions or external state.

## 15. Consequences

Positive consequences:

- the mature neutral product gains a real second framework integration;
- React consumers receive an idiomatic controlled hook, native projection and
  custom renderer boundary;
- D-026 is evaluated from two real adapters without inventing a universal
  controller;
- the existing catalog supplies full feature evidence without sharing runtime
  semantics; and
- client-only scope keeps the first compatibility and lifecycle matrix bounded.

Costs and constraints:

- a full M1–M34 projection is substantial and requires staged checkpoints;
- native UI and reference styles are intentionally duplicated across targets;
- Strict Mode creates a development setup/cleanup cycle and validators must not
  be used as persistence/transport side effects;
- the package adds a separate framework/type compatibility matrix; and
- React 18 consumers remain unsupported until a later evidence-backed review.

## 16. Next gate

ADR-038 revision 0 is Accepted after review 339 cycle 5 passed all eighteen
areas with zero findings and Ricard accepted it on 4 August 2026. It authorizes
only drafting and completely reviewing SPEC-021 for the exact M35 observable
contract.

## 17. References

- [React versions](https://react.dev/versions)
- [React `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)
- [React Strict Mode](https://react.dev/reference/react/StrictMode)
- [Rules of React](https://react.dev/reference/rules)
- [React npm package](https://www.npmjs.com/package/react)
