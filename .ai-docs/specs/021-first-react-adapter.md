# SPEC-021: First Client-Rendered React Adapter

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 4 August 2026
- **Acceptance date:** 4 August 2026
- **Milestone:** M35 — First React adapter and admitted reference shell
- **Promoted capability:** bounded D-026/D-044 selected by review 338 cycle 2
- **Accepted architecture:** ADR-038 revision 0
- **Accepted baselines:** SPEC-001 v0.1.15 through SPEC-020 v0.1.0
- **Complete review:** [Review 340](../reviews/340-spec-021-review.md) cycle 2
  passed all eighteen areas and 36 conformance rows with zero findings after
  seven corrections; accepted by Ricard on 4 August 2026
- **Authority:** Accepted observable M35 contract. It authorizes drafting and
  completely reviewing PLAN-037 only; dependency, package, implementation,
  version, release, publication, Git and external actions remain gated.

## 1. Scope

This specification defines the first Public + Experimental React web adapter
and the contract for its private independent reference shell. The adapter is a
client-rendered React DOM projection of the complete neutral M1–M34 contract.
It neither changes core behavior nor introduces a universal adapter.

The application remains the only source of truth for `value`, `baselineValue`,
wizard confirmation, persistence, submission and service transport. React owns
component lifecycle and target-local presentation state. Core remains the only
authority for normalized definitions, snapshots, validation, operations,
conditions, alternatives, scopes and wizard semantics.

## 2. Package and compatibility contract

The source package resides at `packages/react` with name
`@rabassoft/schema-engine-react`, version `0.0.0` and `private: true`. It is ESM,
declares `sideEffects: false`, and exposes exactly one root entry point. No deep
import or wildcard export is supported.

The initial supported line is exact:

| Dependency                         | Package relationship     | Supported consumer range |
| ---------------------------------- | ------------------------ | ------------------------ |
| `react`                            | peer, never bundled      | `>=19.2.0 <20.0.0`       |
| `react-dom`                        | peer, never bundled      | `>=19.2.0 <20.0.0`       |
| `@rabassoft/schema-engine`         | peer, never bundled      | selected at release gate |
| React/React DOM types and builders | development dependencies | selected by PLAN-037     |

React and React DOM must resolve to the same exact patch. Clean consumers test
the lower tuple `19.2.0` and the latest stable aligned `19.2.x` tuple selected
by the later plan. React 18, React 20, canary/experimental React, React Native,
SSR, hydration and Server Components are unsupported and unclaimed.

The package compiles TSX to ESM and declarations without bundling React, React
DOM or core. Workspace relationships and packed peer rewriting must be proven
before a publishable candidate exists. The published core `0.4.1` bytes are not
evidence for the current M1–M34 source contract. Public npm version, removal of
`private`, final core peer range and release tags remain a separate ADR-010
gate.

## 3. Exact root API

The root exports exactly these four runtime values:

```ts
export function useSchemaForm<TData extends object>(
  config: ReactControlledFormConfig<TData>,
): ReactFormHandle<TData>;

export function SchemaForm<TData extends object>(
  props: SchemaFormProps<TData>,
): ReactElement | null;

export function createReactRendererRegistry(
  registrations?: readonly ReactRendererRegistration[],
): ReactRendererRegistryResult;

export function createReactNativeRendererRegistry(
  additionalRegistrations?: readonly ReactRendererRegistration[],
): ReactRendererRegistryResult;
```

It exports exactly these twelve TypeScript contracts:

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

All sixteen root exports are Public + Experimental + Active. React component
implementations, contexts, bridge stores, brands, error boundaries, hosts,
native renderers, text projectors/codecs, registry representation and shell
helpers remain Internal and are not root exports.

## 4. Controlled hook contract

### 4.1 Configuration

```ts
export interface ReactControlledFormConfig<
  TData extends object,
> extends ControlledFormRuntimeOptions<TData> {
  readonly onOperation: (operation: FormOperation) => void;
  readonly onWizardIntention: (intention: WizardIntention) => void;
  readonly onDiagnostics?: (diagnostics: readonly Diagnostic[]) => void;
  readonly textResolver?: TextResolver;
}
```

Locale is required exactly as in core. Before runtime creation, the adapter
reads own data descriptors for `onOperation`, `onWizardIntention`,
`onDiagnostics` and `textResolver`, in that order. Missing/accessor/non-callable
required callbacks emit ordered `INVALID_REACT_FORM_CONFIG` errors and block
creation. A present non-callable/accessor `onDiagnostics` also blocks creation.

An absent `textResolver` uses an immutable identity resolver. An invalid
resolver emits one `INVALID_TEXT_RESOLVER` warning and uses source text; it does
not block readiness. Resolver inspection and invocation follow the exact
descriptor-safe/fallback behavior already specified for Angular text
projection, without importing its implementation. The warning is delivered
once after the ready commit for that resolver identity.

Callback identity and resolver identity changes do not recreate core. The
adapter invokes the latest committed callbacks, invalidates text projection
when the resolver changes and never invokes application code during render.
Core isolates operation/wizard-listener exceptions according to the Accepted
runtime contract. An exception from `onDiagnostics` is swallowed for that
delivery, never recurses, changes state, emits an intention or writes to the
console.

### 4.2 State, handle and opacity

```ts
export type ReactFormState<TData extends object> =
  | {
      readonly status: 'initializing';
      readonly snapshot?: never;
      readonly diagnostics: readonly [];
    }
  | {
      readonly status: 'ready';
      readonly snapshot: FormRuntimeSnapshot<TData>;
      readonly diagnostics: readonly [];
    }
  | {
      readonly status: 'error';
      readonly snapshot?: never;
      readonly diagnostics: readonly [Diagnostic, ...Diagnostic[]];
    };

export interface ReactFormHandle<TData extends object> {
  readonly state: ReactFormState<TData>;
  readonly actions: ReactFormActions;
  readonly [internalReactFormHandleBrand]: true;
}
```

The unexported unique-symbol brand makes the handle opaque and package-copy
specific. Every state, handle, diagnostics array and reachable adapter-owned
value is frozen. A ready state exposes the exact current immutable core
snapshot, not a React-owned clone or reduced view.

The handle reference changes only when its state, action facade or Internal
projection-port generation changes. A resolver identity change increments that
generation without replacing core so `SchemaForm` can prepare new texts. Its
action facade is referentially stable throughout one runtime epoch and is
atomically replaced when that epoch changes. A retained handle or callback
from an older epoch never targets the new runtime.

### 4.3 Action facade

```ts
export interface ReactFormActions {
  getFieldSnapshot(path: DataPath):
    | {
        readonly success: true;
        readonly value: FieldRuntimeSnapshot | undefined;
        readonly diagnostics: readonly [];
      }
    | {
        readonly success: false;
        readonly value?: never;
        readonly diagnostics: readonly [Diagnostic];
      };
  getNodeSnapshot(path: DataPath):
    | {
        readonly success: true;
        readonly value: RuntimeTreeSnapshot | undefined;
        readonly diagnostics: readonly [];
      }
    | {
        readonly success: false;
        readonly value?: never;
        readonly diagnostics: readonly [Diagnostic];
      };
  getItemSnapshot(address: CollectionItemAddress):
    | {
        readonly success: true;
        readonly value: ItemRuntimeSnapshot | undefined;
        readonly diagnostics: readonly [];
      }
    | {
        readonly success: false;
        readonly value?: never;
        readonly diagnostics: readonly [Diagnostic];
      };
  getCollectionNodeSnapshot(address: CollectionNodeAddress):
    | {
        readonly success: true;
        readonly value: RuntimeTreeSnapshot | undefined;
        readonly diagnostics: readonly [];
      }
    | {
        readonly success: false;
        readonly value?: never;
        readonly diagnostics: readonly [Diagnostic];
      };
  requestSetValue(path: DataPath, value: unknown): RuntimeActionResult;
  requestRemoveValue(path: DataPath): RuntimeActionResult;
  requestSetItemValue(
    target: CollectionNodeAddress,
    value: unknown,
  ): RuntimeActionResult;
  requestRemoveItemValue(target: CollectionNodeAddress): RuntimeActionResult;
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
  resetTouched(scope?: FormScope): RuntimeActionResult;
  setValidationVisibility(
    visibility: ValidationVisibility,
  ): RuntimeActionResult;
  getValidationSnapshot(scope?: FormScope):
    | {
        readonly success: true;
        readonly value: ValidationSnapshot;
        readonly diagnostics: readonly [];
      }
    | {
        readonly success: false;
        readonly value?: never;
        readonly diagnostics: readonly [Diagnostic];
      };
  showValidationErrors(scope: FormScope): RuntimeActionResult;
  hideValidationErrors(scopeId: string): RuntimeActionResult;
  retryAsyncValidation(): RuntimeActionResult;
  requestWizardPrevious(): WizardActionResult;
  requestWizardNext(): WizardActionResult;
  requestWizardComplete(): WizardActionResult;
  rejectWizardIntention(requestId: number): WizardActionResult;
  confirmWizardSelection(
    confirmation: WizardSelectionConfirmation,
  ): RuntimeActionResult;
}
```

Ready read methods delegate once and wrap the exact returned value in the
frozen success branch; an absent addressed node is therefore a successful read
whose value is `undefined`. Other ready methods return the exact core result.
Confirmation is the only facade method that delegates to
`updateExternalState`, with exactly `{ wizardSelection: confirmation }`. The
facade has no `getSnapshot`, external state update, subscription, disposal or
raw-runtime escape.

While initializing, after unmount or from a stale epoch, every method returns
its frozen failure branch with one `REACT_FORM_NOT_READY` or
`STALE_REACT_FORM_ACTION` error; action-result effects are both false. Each
non-empty returned diagnostic batch is also delivered exactly once to the
latest committed `onDiagnostics`. It emits no operation, wizard intention,
validator call, snapshot or application state change.

## 5. External-store lifecycle

The hook creates one inert Internal bridge store without calling core or the
application. It uses `useSyncExternalStore` with stable `subscribe` and
`getSnapshot` functions. `getSnapshot` returns the same reference until an
actual adapter state change. No `getServerSnapshot` is supplied.

A client layout effect performs each runtime epoch after commit and before
paint:

1. validate the committed adapter callbacks/resolver;
2. call core runtime creation once for that effect setup;
3. attach snapshot, operation and wizard-intention subscriptions;
4. publish the initial ready state or frozen error diagnostics; and
5. clean up by invalidating the epoch, unsubscribing every successful
   subscription and disposing exactly that runtime.

If any required subscription fails, the epoch unsubscribes earlier successful
subscriptions, disposes the runtime and publishes `error`; no partial ready
bridge escapes. A render that is abandoned before commit creates nothing.
Lifecycle/configuration errors are always exposed in `state.diagnostics` and,
when `onDiagnostics` itself is valid, delivered once after that error commit.
An error epoch retries only after a relevant committed construction input,
external input or required callback identity changes; an unchanged invalid
render cannot enter a create/dispose loop.

Runtime-construction identity is exactly the committed identity of `formId`,
`definition`, `schema`, `validator` and present `asyncValidator`. Changing one
disposes the old epoch and creates a new one. `value`, `baselineValue`, `locale`
and `validationVisibility` reconcile through one atomic core external update
or exact visibility action before paint and do not replace a compatible
runtime.

`wizardState` seeds a new runtime only. After readiness, later prop changes do
not call `updateExternalState` and cannot advance selection. The application
confirms only through `confirmWizardSelection`; a later matching config value
does not confirm again. Resolver/callback changes update adapter ports without
runtime replacement.

Identity comparisons use `Object.is`. In one committed reconciliation, core
construction identity is checked first. For a compatible epoch, changed
`value`, `baselineValue` and/or `locale` are sent together in that member order
through one `updateExternalState`; changed `validationVisibility` is then sent
through one `setValidationVisibility`. Omitted visibility and explicit
`'touched'` compare as the same effective value. Each result and notification
preserves core order. A failed first action suppresses the second; either
failed action invalidates, unsubscribes and disposes that epoch before
publishing `error` with its diagnostics, and leaves no adapter-fabricated
snapshot. Callback refs are committed before either action.

During a render that first observes changed props, React may read the previous
immutable bridge state. Layout reconciliation and the store notification must
finish before paint. The adapter adds no optimistic value or navigation state.

Strict Mode development setup/cleanup replay must be balanced. Every setup owns
only its runtime/subscriptions; stale notifications are ignored. Replay alone
emits no operation or wizard intention. A synchronous validator may run once
per actually created replay instance; validator call totals are not a
persistence or transport protocol.

## 6. Form projection and registry

### 6.1 Form boundary

```ts
export interface SchemaFormProps<TData extends object> {
  readonly form: ReactFormHandle<TData>;
  readonly rendererRegistry: ReactRendererRegistry;
}
```

`SchemaForm` consumes only this handle and registry. It returns `null` while
initializing or in error and never creates a business `<form>`, submit/save
button or persistence boundary. It does not accept raw schema, definition,
value, baseline, validator, callbacks, locale or text resolver separately.

An invalid, forged, stale-package-copy handle or registry emits exactly one
`INVALID_REACT_FORM_HANDLE` or `INVALID_REACT_RENDERER_REGISTRY` error through
the valid handle's latest diagnostics callback when available, renders no
partial active tree and never invokes an action. A valid handle in a later
epoch replaces the complete projection.

Cross-copy handles expose an Internal descriptor-checked diagnostic receiver
solely for this safe failure path; it does not make their brands compatible. A
fully forged handle without a trusted receiver still renders `null`, but no
callback can safely be invoked because no valid diagnostic sink exists. This
is the only sinkless invalid-composition case.

`SchemaForm` render reads only an immutable Internal projection cache. A layout
effect prepares that cache after commit and before paint from the current
epoch, snapshot, registry and projection-port generation. Renderer testers and
`TextResolver.resolve` are invoked only there, never during component render or
memo calculation. Preparation publishes one complete cache or suppresses the
affected owner according to this specification; a stale preparation generation
cannot publish. Consequently first projection and changed fields/texts may
cause a synchronous pre-paint rerender but no user-visible empty intermediate
tree.

### 6.2 Renderer contracts

```ts
export interface ReactFieldTextSnapshot {
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly clearLabel: string;
  readonly setNullLabel: string;
  readonly nullValueLabel: string;
  readonly fixedMissingLabel: string;
  readonly fixedUnavailableLabel: string;
  readonly fixedIncompatibleLabel: string;
  readonly choiceLabels: readonly string[];
  readonly missingSelectionLabel: string;
  readonly emptySelectionLabel: string;
  readonly issueMessages: readonly string[];
}

export interface ReactFieldRendererProps {
  readonly field: FieldDefinition | FieldTemplate;
  readonly snapshot: FieldRuntimeSnapshot;
  readonly formId: string;
  readonly locale: string;
  readonly texts: ReactFieldTextSnapshot;
  readonly setValue: (value: unknown) => RuntimeActionResult;
  readonly removeValue: () => RuntimeActionResult;
  readonly fieldFocus: () => RuntimeActionResult;
  readonly fieldBlur: () => RuntimeActionResult;
  readonly rendererDiagnostics: (diagnostics: readonly Diagnostic[]) => void;
}

export type ReactRendererComponent = ComponentType<ReactFieldRendererProps>;
export type ReactRendererTester = (
  field: FieldDefinition | FieldTemplate,
) => number | null;

export interface ReactRendererRegistration {
  readonly id: string;
  readonly component: ReactRendererComponent;
  readonly tester: ReactRendererTester;
  readonly priority?: number;
}
```

Every props object, text snapshot and adapter-created nested array is frozen.
The set/remove/focus/blur callbacks are bound to the exact owner and epoch and
use the action gates in section 4.3. A hidden, disabled, blocked, stale,
replaced, failed or unmounted owner cannot emit an accepted action.

Renderer diagnostics are inspected as a dense own-data array and detached/
frozen before one callback delivery. Invalid input is replaced by one
`INVALID_RENDERER_DIAGNOSTICS` warning; it never throws through React or writes
to the console. Calling `rendererDiagnostics` queues only adapter-owned data;
the application callback is invoked after the current commit, never from a
renderer's render phase. Renderers receive no raw schema, baseline, validator,
runtime, application setter or persistence service.

### 6.3 Opaque registry and deterministic resolution

```ts
export interface ReactRendererRegistry {
  readonly [internalReactRendererRegistryBrand]: true;
}

export type ReactRendererRegistryResult =
  | {
      readonly success: true;
      readonly registry: ReactRendererRegistry;
      readonly diagnostics: readonly [];
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly [Diagnostic, ...Diagnostic[]];
    };
```

Both registry inputs default to an empty frozen array and are inspected as
dense own-data arrays without invoking accessors. Each registration requires a
non-blank unique ID, callable component, callable tester and absent or finite
integer priority. Every structural defect emits an ordered
`INVALID_RENDERER_REGISTRATION`; duplicate IDs emit
`DUPLICATE_RENDERER_ID`. Any error blocks creation, and no partial registry is
returned. Success detaches registration wrappers, preserves callable identity
and freezes the opaque registry.

Resolution evaluates every tester in registration order. `null` means no
match. A tester exception emits `RENDERER_TESTER_EXCEPTION`; a non-integer,
negative or non-finite result emits `INVALID_RENDERER_TEST_RESULT`; both are
warnings and discard only that candidate. Selection uses highest rank, then
highest priority (default zero), then earliest registration. No candidate
emits `NO_RENDERER_MATCH` for only that owner.

Resolution and text diagnostics are accumulated by owner order during
post-commit cache preparation. The complete cache is published first; the
ordered immutable batch is then delivered once to the latest diagnostics
callback before paint. A blocking owner diagnostic omits only that owner's
projection. No tester or resolver diagnostic is emitted again for an unchanged
epoch + owner + registry/resolver + definition/snapshot text identity.

The native factory prepends these closed Internal registrations:

| ID                         | Match                                  | Rank | Priority |
| -------------------------- | -------------------------------------- | ---- | -------- |
| `native-fixed`             | own normalized fixed value             | 30   | 0        |
| `native-string-enum-array` | normalized string-enum-array choices   | 30   | 0        |
| `native-string-enum`       | normalized string choices              | 20   | 0        |
| `native-string`            | ordinary string                        | 10   | 0        |
| `native-number`            | number or integer normalized as number | 10   | 0        |
| `native-boolean`           | boolean                                | 10   | 0        |

Additional registrations follow native registrations and may override only by
higher rank or priority. They cannot mutate a registry or a global singleton.

### 6.4 Renderer failure isolation

Each selected renderer is wrapped by one Internal error boundary scoped to
runtime epoch + owner key + registration ID + component identity. A render or
lifecycle exception deactivates its callbacks immediately, commits no fake
control, reports exactly one `REACT_RENDERER_FAILED` error after commit and
leaves independent siblings active. The boundary remains closed for unchanged
identity and resets only when one of those four identities changes.

Development logging performed by React is outside the adapter contract. The
adapter itself never logs and never exposes thrown values, messages or stacks
in diagnostics.

## 7. Native and compound projection

The native field set covers string, string enum, atomic string-enum array,
number/integer, boolean and fixed output. It preserves missing, empty string,
zero, negative zero, false, null, fixed and incompatible external values. A
local text/selection buffer is presentation-only, reconciles confirmed external
state, and is restored from the latest confirmed snapshot on blur where the
Accepted native contract requires it.

Objects, discriminated alternatives, arrays/items and recursive local
presentation are projected only from normalized definitions and immutable
snapshots. React does not interpret raw schema, recalculate active branches,
conditions, validation ownership, collection placement or fallback.

React domain keys derive only from normalized node keys; stable collection
`itemId` plus template key; presentation entry keys; and wizard/step IDs. Array
index, render counters, randomness and `useId()` are forbidden as domain,
operation or owner identity. Reordering an item preserves its component and
local buffer. Removing an owner or changing epoch disposes its local state and
deactivates its callbacks.

An inactive discriminated branch unmounts and releases target-local state.
Core/application retain its domain value, baseline and touched semantics.
Sections, tabs, accordions and logical grids use fixed Internal React hosts.
Tabs and accordion expansion are React-local and survive snapshot changes for
the same owner/entry key. Inactive panels leave display, accessibility tree and
sequential focus.

The wizard consumes only its normalized definition, immutable snapshot and
facade. Every step subtree mounts once per epoch and remains mounted; inactive
steps are hidden from display, accessibility and sequential focus while their
native buffers and local tab/accordion state remain. Projected controls invoke
only previous/next/complete; the application consumes the emitted intention and
uses reject/confirm from the handle. React never computes scope, progress,
validity or selection and never creates submission state.

M35 defines no Public CSS class, selector, stylesheet, design token, theming
contract, UI-library package or presentation-container SPI.

## 8. Text, diagnostics and accessibility

React text projection independently preserves every Accepted source string,
`TextResolutionContext`, locale, fallback, member order, choice order, issue
order and batching rule. `ReactFieldTextSnapshot` has exact parity with the
current Angular field snapshot but no shared implementation. Object,
collection, item, presentation and wizard text snapshots remain Internal.

Visible labels are mandatory. Description, hint, issues and action text are
associated semantically. Required, invalid, disabled, hidden, expanded,
selected/current and busy states use native attributes or corresponding ARIA
state. Tabs use tablist/tab/tabpanel semantics; Left/Right arrows move and wrap,
Home/End select the first/last enabled tab, and focus follows selection.
Accordion headers are native buttons with `aria-expanded`. Wizard steps expose
current/progress text without becoming direct navigation controls.

DOM IDs use only deterministic normalized identity. The exact encoding is
`se-` followed by every UTF-16 code unit of `formId` as four lower-case
hexadecimal digits, `--`, the identically encoded owner key, `--` and a fixed
ASCII member suffix from `control`, `label`, `description`, `hint`, `issues`,
`clear`, `tab`, `panel`, `accordion` or `wizard-step`. Fixed-width code units
make the mapping injective for all JavaScript strings, stable across renders
and independent of render order.

Every adapter diagnostic has source `runtime`, frozen safe parameters, no
`documentPath`, and an immutable copied `dataPath` only when an affected field
path exists. Exact adapter-owned families are:

| Code                              | Severity | Effect/order                          |
| --------------------------------- | -------- | ------------------------------------- |
| `INVALID_REACT_FORM_CONFIG`       | error    | callback member order; blocks epoch   |
| `REACT_FORM_NOT_READY`            | error    | one per unavailable facade call       |
| `STALE_REACT_FORM_ACTION`         | error    | one per stale facade call             |
| `INVALID_REACT_FORM_HANDLE`       | error    | one per invalid form composition      |
| `INVALID_REACT_RENDERER_REGISTRY` | error    | one per invalid form composition      |
| `INVALID_RENDERER_REGISTRATION`   | error    | registration/index/member order       |
| `DUPLICATE_RENDERER_ID`           | error    | duplicate registration order          |
| `RENDERER_TESTER_EXCEPTION`       | warning  | tester order, candidate discarded     |
| `INVALID_RENDERER_TEST_RESULT`    | warning  | tester order, candidate discarded     |
| `NO_RENDERER_MATCH`               | error    | affected owner only                   |
| `INVALID_RENDERER_DIAGNOSTICS`    | warning  | replaces malformed renderer batch     |
| `REACT_RENDERER_FAILED`           | error    | once per committed failure identity   |
| `INVALID_TEXT_RESOLVER`           | warning  | once per resolver identity            |
| `TEXT_RESOLUTION_FAILED`          | warning  | accepted text-member projection order |

Adapter-created diagnostics have these exact safe parameters and fallback
messages:

- `INVALID_REACT_FORM_CONFIG`: `{ member, expected, reason, actualType }`,
  where reason is `missing-member`, `accessor-member` or `invalid-value`, with
  `React form configuration member "<member>" is invalid.`;
- `REACT_FORM_NOT_READY`: `{ method, status }`, with
  `React form action "<method>" is unavailable while the form is <status>.`;
- `STALE_REACT_FORM_ACTION`: `{ method, reason }`, where reason is
  `replaced-epoch` or `unmounted`, with
  `React form action "<method>" belongs to a stale runtime epoch.`;
- invalid handle/registry: `{ member, reason }`, where member is `form` or
  `rendererRegistry` and reason is `malformed`, `invalid-brand` or
  `different-package-copy`, with `React form composition member "<member>" is
invalid.`;
- `INVALID_RENDERER_REGISTRATION`: `{ index, member, expected, reason }`, using
  member order `registration`, `id`, `component`, `tester`, `priority` and
  fallback `React renderer registration member "<member>" is invalid.`;
- `DUPLICATE_RENDERER_ID`: `{ id, firstIndex, duplicateIndex }`, with
  `React renderer id "<id>" is duplicated.`;
- tester exception: `{ id, index }`, with
  `React renderer tester threw an exception.`;
- invalid tester result: `{ id, index, actualType, actualValue? }`, retaining
  `actualValue` only for null/string/boolean/finite-number primitives, with
  `React renderer tester returned an invalid rank.`;
- no match: `{ field, path }` for a definition or
  `{ field, relativePath }` for a template, with
  `No React renderer matches field "<field>".`;
- invalid renderer diagnostics: `{ reason, index?, actualType? }`, where reason
  is `not-array`, `sparse-entry`, `accessor-entry` or `invalid-diagnostic`, with
  `React renderer diagnostics are invalid.`; and
- renderer failure: `{ ownerKey, registrationId, phase:
'render-or-lifecycle' }`, with `React renderer "<registrationId>" failed for
owner "<ownerKey>".` and no thrown value/message/stack.

`INVALID_TEXT_RESOLVER` and `TEXT_RESOLUTION_FAILED` retain the exact Accepted
Angular-independent resolver parameter/fallback contract. All string
parameters are detached primitives; path arrays are copied/frozen. Unknown or
hostile values are represented only by the safe `actualType` vocabulary and
never stringified, spread or reflected beyond own descriptors.

Identical diagnostics produced in one projection pass are not collapsed;
source order is observable. The same unchanged committed failure identity is
delivered once, not once per render. A parent failure suppresses descendant
projection and therefore descendant cascade diagnostics; independent siblings
remain ordered and active.

This contract requires automated semantic checks and representative keyboard
Chromium evidence, but makes no accessibility-certification or assistive-
technology coverage claim.

## 9. Independent React reference shell

After SPEC and plan gates, the private shell path/name are exact:

```text
apps/reference-react
@schema-engine-internal/reference-react
private: true
```

It depends only on Public roots of core, React adapter and Ajv validator plus
the Internal root of `reference-scenarios`. It uses `createRoot()` under
`StrictMode`; it has no server, prerender or hydration entry.

The shell owns immutable value/baseline, locale, visibility, operation and
wizard decisions, async-service evidence, schema/UI Schema editing, reset,
theme, components, CSS, build and cleanup. It makes the complete catalog
selectable and functional and provides scenario explanation, application
controls, interactive form, editable schemas, observable evidence, real-source
integration examples and copy actions.

Only scenario contracts/evidence are shared. React imports no Angular or
Standard controller, component, renderer, template, lifecycle helper or CSS.
Visual/text parity is maintained by independent React source and deliberately
duplicated target CSS until another decision promotes a shared protocol.

Marked snippets are extracted deterministically from compiled real shell
source into a committed generated module. Unit/application tests exercise all
catalog scenarios. An independent Playwright/Chromium lane covers
representative primitive, nested, collection, condition, alternative, async,
scope, wizard, editor/reset, theme and copy paths.

## 10. Conformance matrix

| Row | Observable requirement                                                                  | Minimum evidence                        |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | Package is private `0.0.0`, ESM, side-effect-free and one-root-only                     | manifest/export/package tests           |
| 2   | Root contains exactly four values and twelve types                                      | source/declaration/package inventories  |
| 3   | React/DOM peers are aligned `>=19.2.0 <20.0.0` and unbundled                            | graph, bundle and clean consumers       |
| 4   | Lower 19.2.0 and selected latest 19.2.x tuples compile/run                              | isolated clean consumers                |
| 5   | Invalid required callbacks block before core creation                                   | hook unit tests                         |
| 6   | Resolver fallback and latest callback/resolver identity are exact                       | hook/text unit tests                    |
| 7   | Initializing/ready/error state and opaque frozen handle are exact                       | type/runtime tests                      |
| 8   | Action inventory delegates once and exposes no raw lifecycle escape                     | contract and runtime tests              |
| 9   | Not-ready, stale and unmounted actions are inert and diagnosed once                     | lifecycle tests                         |
| 10  | External-store snapshots are cached and notifications exact                             | bridge tests                            |
| 11  | Construction identities replace epochs; external values reconcile before paint          | layout-effect tests                     |
| 12  | Wizard seed/confirmation cannot double-advance                                          | controlled wizard tests                 |
| 13  | Strict Mode replay balances subscriptions/disposal and duplicates no intentions         | Strict Mode tests                       |
| 14  | Registry descriptor safety, density, duplicates and atomic failure are exact            | hostile-input tests                     |
| 15  | Rank/priority/order, tester warnings and consumer overrides are deterministic           | registry tests                          |
| 16  | Invalid handle/registry composition renders no partial active tree                      | component tests                         |
| 17  | Renderer errors close one owner, preserve siblings and reset only on exact identity     | error-boundary tests                    |
| 18  | Renderer props/texts are frozen, normalized and epoch/owner gated                       | custom-renderer tests                   |
| 19  | String, enum, enum-array, number/integer, boolean and fixed leaves preserve edge values | native renderer tests                   |
| 20  | Visible labels, invalid state, descriptions and deterministic IDs are semantic          | DOM/accessibility tests                 |
| 21  | Objects and nested paths project only normalized snapshots                              | projection tests                        |
| 22  | Collection insert/remove/move and stable-item reorder preserve identity                 | collection tests                        |
| 23  | Discriminated branch unmount/restoration and stale callback rules hold                  | alternative tests                       |
| 24  | Sections, tabs, accordion, grid and recursive forests retain owner-local state          | presentation tests                      |
| 25  | Conditions consume visible/enabled snapshots without local policy                       | condition tests                         |
| 26  | Sync/async validation, visibility and retry semantics remain neutral                    | validation tests                        |
| 27  | Scope validation and baseline confirmation never mutate in React                        | scope/baseline tests                    |
| 28  | Wizard retains all steps and emits only controlled intentions                           | wizard unit/DOM tests                   |
| 29  | Complete catalog is selectable/functioning in an independent React shell                | catalog/application tests               |
| 30  | Editor/reset/theme/examples/copy and deterministic snippets work                        | shell/Chromium/snippet tests            |
| 31  | Built, packed and reconstructed-source consumers use only Public roots                  | artifact/consumer tests                 |
| 32  | Core, Angular and Standard suites/builds remain unchanged                               | workspace regression matrix             |
| 33  | Production build, type, lint, format, boundaries and browser lane pass                  | workspace/tooling commands              |
| 34  | No release/version/publication/Git or frozen published-byte drift occurs                | diff, artifact and external-state audit |
| 35  | Documentation/index/deferred/roadmap state and links are consistent                     | `pnpm docs:check`                       |
| 36  | Final complete review repeats rows 1–35 with zero findings                              | final review record                     |

PLAN-037 must assign every row exactly once to implementation checkpoints and
repeat the complete applicable review after each correction. Workspace tests
alone cannot satisfy package or isolated-consumer rows.

## 11. Explicit exclusions

SPEC-021 does not define or authorize core/Angular contract changes, React
18/20/canary/Native, Vue/Svelte, SSR/hydration/Server Components, streaming,
portals, Suspense/lazy renderers, universal adapter/controller/registry,
capability negotiation, a React UI library, Public CSS/theming/container SPI,
hot definition reconciliation, persistence, HTTP, submit/save state,
authorization, post-M34 workflow, hosting, release, publication or Git action.

## 12. Next gate

SPEC-021 v0.1.0 is Accepted after review 340 cycle 2 passed all eighteen areas
and 36 rows with zero findings and Ricard accepted it on 4 August 2026. It
authorizes drafting and completely reviewing PLAN-037 only; it does not
authorize dependencies, package creation or implementation.
