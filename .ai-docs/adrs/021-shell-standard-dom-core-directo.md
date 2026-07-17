# ADR 021: Private Standard/DOM direct-core reference shell

- **State:** Accepted revision 0
- **Date:** 17 July 2026
- **Acceptance date:** 17 July 2026
- **Complete review:**
  [`review 076`](../reviews/076-adr-021-review.md) cycle 1 passed all ten areas
  with zero findings
- **Milestone:** M16 — Standard/DOM reference shell
- **Promotes:** only the D-046 boundary accepted by
  [`review 075`](../reviews/075-d046-m16-standard-dom-promotion-readiness.md)
- **Requires:** Accepted SPEC-001 through SPEC-006, ADR-009, ADR-010, ADR-020
  and completed PLAN-016/PLAN-017
- **Related deferred decisions:** D-026, D-035, D-043 and D-045
- **Authority:** Accepted for M16 architecture; it authorizes preparation and
  complete review of PLAN-018 only, not implementation, dependency
  installation, commit, push, publication or external-system mutation

## 1. Context

The private reference platform has a framework-neutral catalog and one Angular
22 shell. A maintained no-framework consumer is the next selected target. It
must prove that an application can compose the Public core contracts directly
without turning its private DOM projection into a supported adapter or hiding
application ownership in a cross-target controller.

The core root already exposes compilation, controlled runtime creation,
strict operations, normalized definitions, snapshots and subscriptions. M16
therefore needs no Public contract and no `@rabassoft/schema-engine-standard`
package. It needs an independently built browser application whose use of the
DOM is entirely outside the framework-neutral core.

## 2. Decision summary

Add one private workspace project:

```text
apps/reference-scenarios  -> shared neutral scenario data and evidence
apps/reference-standard   -> browser application using Public core + DOM APIs
```

`reference-standard` imports `@rabassoft/schema-engine` and the catalog only
through their root entry points. It compiles the selected scenario, creates and
owns a controlled runtime, renders normalized nodes with native HTML controls,
applies or rejects emitted operations as the application, and exposes
observable evidence and build-checked integration source.

The project is a private educational consumer. Its renderer, lifecycle,
styles, utilities and tests are Internal application code and establish no DOM
adapter, Web Component, browser-support or package-release contract.

## 3. Project and dependency boundary

### 3.1 Exact project

Create `apps/reference-standard/package.json` with:

- name `@schema-engine-internal/reference-standard`;
- version `0.0.0`, `private: true` and ESM;
- runtime workspace dependencies on `@rabassoft/schema-engine` and
  `@schema-engine-internal/reference-scenarios`; and
- no dependency on Angular, `@rabassoft/schema-engine-angular`, React, Vue,
  RxJS, a component library or a CSS framework.

The application has no `publishConfig`, public `exports`, pack/release script
or inclusion in a publishable package's `files`. Public packages and the
catalog never import it. It imports neither physical workspace paths nor
`src`, `dist`, testing entry points or package-internal modules.

The dependency direction is:

```text
reference-standard
  -> reference-scenarios
  -> @rabassoft/schema-engine

reference-standard -X-> @rabassoft/schema-engine-angular
```

The existing boundary verifier must model this project, reject framework
imports and prove that app/generated/browser outputs cannot enter Public
targets or release artifacts.

### 3.2 Private build stack

Use Vite `8.1.4` as exact root development tooling. This version is already
resolved transitively by the current Vitest toolchain; making it a direct root
dev dependency records ownership without introducing a second build graph.
The app owns `index.html`, `src/main.ts`, `vite.config.ts`, strict bundler-mode
TypeScript configuration and a production output under
`dist/apps/reference-standard`.

The app scripts are conceptually:

- `dev`: Vite on `127.0.0.1:4211`;
- `build`: a production Vite build;
- `test`: Vitest in the existing DOM test environment; and
- `typecheck`: strict `tsc --noEmit`.

Root commands expose focused Standard build/dev/unit/E2E tasks and an aggregate
reference task without changing Public package builds. Native browser ESM plus
an import map is rejected because workspace packages and the built catalog
would require a custom resolution/serving layer. Reusing Angular's application
builder is rejected because it would import an Angular-owned toolchain boundary
into the no-framework target.

## 4. Application ownership and lifecycle

One shell-local `StandardReferenceApplication` owns:

- selected scenario and compiled definition;
- complete immutable `value` and `baselineValue` roots;
- locale and validation visibility;
- operation decision mode, pending entries and immutable history;
- compiler/runtime diagnostics and current snapshot;
- runtime plus snapshot/operation unsubscribe functions; and
- all DOM renderer instances and event-listener cleanup.

The class/module is not exported from a package and is not shared with Angular.
It is an application composition root, not a framework-neutral controller.

Scenario replacement follows this exact order:

1. remove shell-owned DOM listeners and dispose field/item bindings;
2. invoke both idempotent Public unsubscribe functions when present;
3. dispose the old runtime;
4. copy the selected catalog initial state into new application-owned roots;
5. compile through Public `compileFormDefinition()`;
6. on success, create a fresh runtime and subscribe once to snapshots and
   operations before rendering; or display immutable diagnostics on failure;
7. build a fresh DOM projection from the normalized definition; and
8. reconcile the initial snapshot without emitting an operation.

Application teardown uses the same cleanup path. Unit and browser tests must
prove that repeated scenario replacement produces no duplicate listener,
subscription or operation delivery.

## 5. Controlled operation flow

Native control events call only Public runtime intention methods. Runtime
operations are never constructed by the shell. The application handles an
emitted operation according to its selected mode:

- `confirm`: call Public `applyFormOperation(definition, value, operation)`;
  replace the complete `value` only on success and call
  `runtime.updateExternalState({ value })`;
- `reject`: record the exact operation and leave controlled state unchanged;
- `pending`: retain the exact immutable operation without changing value;
  later confirmation applies it against the then-current value and records any
  stale/incompatible diagnostics; and
- pending rejection changes only the history decision state.

Whole-form baseline commit replaces `baselineValue` with `value` and sends one
external update. Reset recreates the selected scenario through the lifecycle
above. Locale and validation-visibility controls update application state and
the runtime without emitting operations. There is no optimistic value,
autosave, submit, HTTP or business workflow.

## 6. Internal DOM projection

### 6.1 Normalized input only

`StandardFormRenderer` is an Internal application helper. It receives the
compiled `FormDefinition`, runtime and application callbacks. It never receives
or interprets raw JSON Schema. It recursively creates semantic DOM from
normalized object, array, field and presentation definitions and maintains a
binding registry keyed by canonical data paths or collection addresses.

The structure is built once per scenario/runtime. Snapshot updates reconcile
existing bindings in place instead of replacing the whole form. This preserves
focus, temporary input text, selection and stable collection item elements.
Bindings remove every listener during disposal.

### 6.2 Native controls and intentions

- String fields use labelled text inputs; normalized choices use a native
  select whose private token distinguishes missing from the domain string `""`.
- Number/integer fields use text input with a shell-local temporary buffer.
  Only complete finite values emit; incomplete/invalid text remains visual
  until blur, which restores the last confirmed value. The codec is Internal
  target behavior and creates no core parsing contract.
- Boolean fields use a labelled checkbox and preserve missing separately from
  explicit `false` through the existing clear action.
- Nullable leaves expose explicit native actions for `null` and missing so
  those states remain distinct from false, empty string and zero.
- Every present leaf exposes a localized-by-shell `Clear` action that requests
  the matching Public remove intention; required fields remain clearable and
  validation retains authority.
- Objects render semantic groups from normalized children.
- Collections render stable item groups keyed by Public item identity and use
  Public insert, move, remove and item-leaf intention methods. Reconciliation
  moves existing item elements rather than keying identity by array index.
- Static presentation sections determine semantic grouping/order only and do
  not alter data paths or operation ownership.

Controls forward focus and blur to the runtime. Labels, descriptions, hints,
issues, `aria-describedby`, invalid/required state, fieldsets and legends come
from normalized definitions and snapshots. The application may resolve its
own display text for the selected locale, but it does not claim Angular
`TextResolver` projection behavior or a new localization adapter.

The renderer may use small shell-private pure functions for safe DOM creation,
target keys and display formatting. None are exported, copied into the catalog
or treated as future React/Vue abstractions.

## 7. Shell experience and scenario parity

The shell consumes all six existing catalog scenarios. For each it provides:

- scenario selector, summary and explanation;
- application controls and target-idiomatic form preview;
- read-only JSON Schema and UI Schema inspection;
- value, baseline, definition, snapshot, operation/history, diagnostics and
  validation-issue evidence;
- explicit confirm, reject, pending, reset, baseline, locale and visibility
  controls where relevant; and
- copyable Standard/DOM integration source extracted from checked source.

Parity means that every catalog scenario and Accepted core capability has a
maintained direct-core demonstration. It does not require pixel identity,
shared HTML/CSS, Angular component behavior, editable configuration drafts,
Signal Forms behavior or an identical inspector layout. The Standard shell
owns a sober responsive theme with native controls and accessible semantics,
but no style or component package is shared between shells.

## 8. Build-checked snippets

Extend the existing deterministic extraction approach with uniquely named,
non-nested markers in the Standard application source. Generated Standard
snippets live in a committed app-local generated module, are never hand edited
and are consumed by the production build. Write/check modes reject missing,
duplicate, empty, nested or unclosed regions and stale output.

The snippets demonstrate direct compilation, runtime creation, subscriptions,
controlled operation application and cleanup. They are excerpts, not a
complete copy-paste application or a Public API beyond the imported core
contracts. The catalog contains no DOM source strings.

## 9. Testing and evidence

PLAN-018 must require, at minimum:

1. strict format, lint and type checks;
2. focused unit tests for lifecycle cleanup, controlled decisions, DOM
   bindings, temporary input state, nullable distinctions and collection
   identity;
3. catalog tests and Standard production build;
4. boundary-verifier fixtures that accept the exact dependency graph and reject
   Angular/framework imports, publishability, deep imports and generated output
   leakage;
5. an independent Playwright config using `127.0.0.1:4212` for E2E, a
   deterministic Vite preview/server and the existing pinned Chromium;
6. navigation/compile success for all six scenarios plus representative
   keyboard interaction for primitives, nested values, collections,
   presentation and nullable states;
7. confirm/reject/pending/stale, reset, baseline, locale, validation,
   inspectors, copy and cleanup evidence;
8. unchanged Angular shell tests/build and existing package/source/artifact/
   clean-consumer gates; and
9. Public source, manifest, export, version and packed-artifact diff checks.

The Standard smoke lane proves only the maintained browser integration. It is
not a cross-browser guarantee, accessibility certification, assistive-
technology certification, npm consumer test or release oracle.

## 10. Release, hosting and support isolation

The project uses workspace dependencies and proves source integration only. It
is excluded from public tarballs, Corresponding Source package roots and
release candidates. Existing clean consumers remain authoritative for package
and npm behavior.

M16 adds no version, dist-tag, registry metadata, GitHub visibility, CI,
deployment target, telemetry or hosted URL. Vite production output is local
verification, not authorization to deploy. Repository publication and release
automation remain D-043 work.

## 11. Later targets

Standard/DOM is not a second framework adapter, so D-026 remains Deferred.
React and Vue must each receive their own promotion review and integration
decision. They may consume the neutral catalog but cannot import Standard DOM
renderers, lifecycle or application state. Evidence from this shell may inform
D-026 only after a real second framework exposes comparable capability needs.

D-035 remains Deferred because the Standard shell uses the official core; it
is not an independent implementation of a public specification. D-045 legacy
Angular families and the current Angular peer range remain unchanged.

## 12. Rejected alternatives

### Publish a Standard/DOM adapter now

Rejected because the direct consumer needs no new Public contract. Publishing
an adapter would prematurely create support, compatibility and SemVer duties.

### Native ESM/import maps without a bundler

Rejected because resolving workspace packages, built catalog output and local
development would require custom serving/import-map machinery. One private
Vite build is smaller and independently verifiable.

### Reuse Angular builder, components, controller or CSS

Rejected because it would compromise the no-framework dependency proof or
couple shell lifecycle and upgrades. Only catalog data and generic repository
tooling remain shared.

### Build a generic Web Component renderer layer

Rejected because it would be an adapter/product abstraction disguised as demo
code. Native elements created by private application code are sufficient.

### Re-render the complete form on every snapshot

Rejected because it destroys focus, selection, temporary numeric text and
stable collection DOM identity. Stable bindings reconcile in place.

### Cover only primitive scenarios

Rejected because it would not exercise the accepted normalized object,
collection, reference, presentation and nullable contracts without Angular.

## 13. Consequences

Positive consequences:

- framework neutrality gains maintained interactive evidence;
- consumers receive a build-checked no-framework integration example;
- catalog reuse is validated across two independent shells;
- application ownership and cleanup remain explicit; and
- future React/Vue design can compare real evidence instead of assumptions.

Costs and constraints:

- native DOM projection duplicates target-specific rendering work by design;
- Vite becomes an explicitly owned private development dependency;
- every Accepted node kind needs target-specific accessibility and lifecycle
  tests; and
- feature parity must be maintained without extracting a shared controller or
  UI abstraction.

## 14. Accepted effect

Review 076 cycle 1 reconciled this decision with review 075, ADR-020's
later-shell gate, all Accepted application-ownership and normalized-rendering
rules, exact Public exports, workspace/release isolation and deferred
boundaries. The complete pass produced zero findings. ADR-021 revision 0 is
Accepted and authorizes only preparation and complete review of PLAN-018.
