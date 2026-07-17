# ADR 020: Private multi-framework reference platform

- **State:** Accepted revision 0
- **Date:** 17 July 2026
- **Acceptance date:** 17 July 2026
- **Complete review:**
  [`review 054`](../reviews/054-adr-020-review.md) cycle 3 passed all ten areas
  with zero findings after six corrections
- **Milestone:** M15 — Multi-framework reference platform
- **Promotes:** only the D-044 boundary accepted by
  [`review 053`](../reviews/053-d044-m15-reference-platform-promotion-readiness.md)
- **Requires:** Accepted SPEC-001 through SPEC-006; ADR-006 through ADR-010;
  ADR-014 through ADR-019 where their delivered capabilities apply
- **Related deferred decisions:** D-026, D-032, D-035, D-038, D-043 and D-045
- **Authority:** Accepted for M15 architecture; it authorizes only preparation
  of PLAN-016, not implementation, dependency installation, publication,
  hosting, commit or push

## 1. Context

The repository has normative fixtures, focused unit tests and isolated package
consumers, but no maintained application that shows consumers how the accepted
capabilities compose. A reference application should provide interactive
feedback early, make application ownership visible and offer build-checked
integration source. It must not weaken the isolation of release evidence or
turn one framework's application model into a shared abstraction.

M15 therefore needs two different things: reusable framework-neutral scenario
content and an idiomatic shell per admitted integration. Only the shared
catalog and the first Angular 22 shell are promoted. Standard/DOM, React, Vue,
legacy Angular and any hosting surface remain outside this decision.

## 2. Decision summary

Create two private workspace projects:

```text
apps/reference-scenarios  -> framework-neutral authored scenarios
apps/reference-angular    -> standalone Angular 22 application
```

The catalog is Internal test and educational support. The Angular shell is an
independently built private application that consumes publishable libraries
only through their root Public entry points. The shell owns all controlled
application state and decisions. Neither project is a package product or
release oracle.

No Public contract changes. Discovery of a required Public export, package,
entry point, operation, snapshot or runtime behavior stops M15 and requires the
applicable SPEC/API decision before PLAN-016.

## 3. Workspace and dependency graph

### 3.1 Exact projects

`pnpm-workspace.yaml` adds `apps/*`. The project manifests use these exact
Internal names and set `private: true`:

- `@schema-engine-internal/reference-scenarios`;
- `@schema-engine-internal/reference-angular`.

The reserved Internal scope deliberately differs from the public `@rabassoft`
scope. Neither project receives `publishConfig`, an `exports` map intended for
external consumers, a pack/release script or a path in a public package's
`files` allowlist.

The dependency direction is acyclic:

```text
reference-angular
  -> reference-scenarios
  -> @rabassoft/schema-engine
  -> @rabassoft/schema-engine-angular

reference-scenarios
  -type-only-> @rabassoft/schema-engine
```

Publishable packages never import either application. The neutral catalog
never imports Angular, browser or DOM code. Both projects import core and
Angular only by package root; `src`, `dist`, testing entry points, physical
workspace paths and package-internal deep imports are forbidden. Repository
searches and package-boundary tests enforce these directions.

The catalog is a buildable ESM TypeScript project. Its sole Internal root export
resolves to generated `dist` JavaScript and declarations, and its build output
is ignored and never packed. It declares core as a `workspace:*` development
dependency because its imports are type-only. The Angular application declares
the two Rabassoft libraries and the built catalog as `workspace:*` dependencies
plus its exact Angular 22 runtime dependencies. Its build never reaches into
catalog source.

Root build orchestration orders catalog build before Angular build. Local
development first performs one catalog build, then runs catalog watch and the
Angular development server in parallel through pnpm's existing workspace
facilities. PLAN-016 must prove that a catalog change is observed without a
manual manifest rewrite. Shared build/test tooling remains root development
tooling. Adding Nx, Turborepo or another workspace orchestrator is rejected.

### 3.2 Build boundary

The repository keeps its existing publishable-package build system. A root
`angular.json` adds only the private `reference-angular` project and uses:

- `@angular/build:application` for a browser-only production application;
- `@angular/build:dev-server` for local development.

The application has no server entry, SSR, prerender, hydration or deployment
target. The exact Angular CLI and `@angular/build` versions match the canonical
Angular 22 tuple used by the workspace. Root commands expose deterministic
format, lint, type-check, unit-test, production-build, snippet-check and
browser-smoke tasks; PLAN-016 fixes their final spellings and ordering.

## 4. Neutral scenario catalog

### 4.1 Internal contract

The catalog exports only the following conceptual Internal contract. PLAN-016
may refine property names but not widen its responsibilities:

```ts
type ReferenceFeature =
  | 'controlled-state'
  | 'primitive-fields'
  | 'string-enum'
  | 'explicit-clear'
  | 'validation'
  | 'locale'
  | 'nested-objects'
  | 'object-collections'
  | 'local-references'
  | 'presentation-groups'
  | 'nullable-leaves';

type ReferenceExpectedOperation<
  TOperation extends FormOperation = FormOperation,
> = TOperation extends FormOperation
  ? Omit<TOperation, 'metadata' | 'source'>
  : never;

type ReferenceExpectedIssue = Pick<
  ValidationIssue,
  'code' | 'path' | 'keyword'
>;

interface ReferenceScenario<TData extends object> {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly features: readonly ReferenceFeature[];
  readonly compileInput: CompileFormDefinitionInput;
  readonly initialState: {
    readonly value: Readonly<TData>;
    readonly baselineValue: Readonly<TData>;
    readonly locale: string;
    readonly validationVisibility: ValidationVisibility;
  };
  readonly validator: SchemaValidator;
  readonly transitions: readonly ReferenceTransitionExpectation<TData>[];
  readonly explanation: readonly ReferenceExplanation[];
}

interface ReferenceTransitionExpectation<TData extends object> {
  readonly id: string;
  readonly action: string;
  readonly decision: 'confirm' | 'reject' | 'external-update';
  readonly operation?: ReferenceExpectedOperation;
  readonly expected: {
    readonly value?: Readonly<TData>;
    readonly baselineValue?: Readonly<TData>;
    readonly dirty?: boolean;
    readonly valid?: boolean;
    readonly issues?: readonly ReferenceExpectedIssue[];
  };
}

interface ReferenceExplanation {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}
```

`action` and explanation text describe scenario-local UI steps; they are not a
command protocol or normative vocabulary. When present, `value` and
`baselineValue` are complete controlled root objects, never merge patches.
Omitted expected members mean “not asserted”, not `undefined`. Expected
operations omit only runtime-assigned metadata and the fixed user source;
expected issues retain stable code/path/keyword evidence rather than messages
or validator-specific parameters. Expectations are partial educational
checkpoints, not a second runtime, compiler or conformance oracle.

Each `validator` is a deterministic, synchronous, application-owned
`SchemaValidator`. It may inspect only the received schema/value and return the
existing Public `ValidationResult`; it performs no I/O, time, randomness,
framework bridging or mutation. Validators are scenario fixtures, not an
official JSON Schema validator package or substitute for conformance tests.

### 4.2 Authoring safety and failure behavior

Catalog input is authored repository code, not untrusted runtime input. A
single `defineReferenceCatalog()` helper performs descriptor-safe validation at
module construction and returns copied, deeply frozen scenarios. It accepts
only acyclic JSON-compatible plain data for schemas, UI schemas, policies,
values, baselines, expectations and explanation records. It rejects inherited
members, accessors, symbols, sparse arrays, non-finite numbers, unsupported
prototypes and cycles without invoking getters, coercion or iteration hooks.
Functions are allowed only as an own data-property
`validator.validate(schema, value)`. The helper reads its descriptor without
invoking consumer code and copies the function into a new frozen validator
wrapper; it neither freezes nor retains the authored validator object.

It also requires unique kebab-case scenario/transition/explanation IDs,
non-blank text and locale, non-empty unique closed feature tags, one object
root for value and baseline, and a closed validation-visibility value. It does
not validate JSON Schema semantics; `compileFormDefinition()` remains the only
compiler authority used by the application.

Invalid authored content throws an Internal `ReferenceCatalogAuthoringError`
during catalog evaluation with only a stable Internal reason, scenario ID when
known and member/index path. Unit tests must prove zero errors before the shell
build. The exception is a developer failure, never a Public diagnostic or a
consumer-facing recovery contract.

The catalog does not import core conformance fixtures, test helpers or internal
source. Schema overlap with normative fixtures is intentional but independently
authored for education. Accepted SPECs and core conformance remain normative.

## 5. Initial scenario inventory

The first catalog contains these six understandable scenarios:

| Stable ID               | Primary evidence                                                                         | Accepted capability coverage                                        |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `controlled-primitives` | application ownership, confirm/reject, baseline/dirty, visibility, validation and locale | SPEC-001; string, number, integer, boolean, enum and explicit clear |
| `nested-profile`        | deep paths and missing-ancestor materialization                                          | SPEC-002                                                            |
| `stable-team`           | stable item identity and controlled insert, move, remove and item-leaf updates           | SPEC-003                                                            |
| `local-definitions`     | same-document static reference reuse                                                     | SPEC-004                                                            |
| `presentation-sections` | neutral static grouping without structural value changes                                 | SPEC-005                                                            |
| `nullable-preferences`  | explicit null, missing, false/value and clear distinctions                               | SPEC-006                                                            |

Every feature tag appears in at least one scenario. The inventory demonstrates
accepted success paths and representative rejection/validation behavior, not
every hostile input, diagnostic precedence or conformance row.

## 6. Angular shell ownership and composition

The Angular application is standalone on Angular 22 and explicitly configures
`provideZonelessChangeDetection()` as an application bootstrap choice. This
does not revive the pre-SPEC Angular ADR-001 claims about Signals, RxJS or
Zone.js, nor make zoneless execution a core or cross-framework requirement. It
has three responsibilities:

1. a shell/navigation component selects a scenario and owns presentation of
   documentation and inspector panels;
2. a focused reference-form component contains the build-checked, copyable
   adapter integration; and
3. small Internal presentation components render JSON/state/history without
   becoming controllers or library abstractions.

The reference-form component owns Angular signals for `value`,
`baselineValue`, `locale`, `validationVisibility`, selected scenario,
operation history and an operation-decision mode (`confirm`, `reject` or
manually pending). It compiles `compileInput` through the Public
`compileFormDefinition()` function. On failure it displays the immutable Public
diagnostics and does not create `schemaForm` configuration.

On success it binds a fresh `AngularControlledFormConfig` derived from those
signals to the Public `SchemaFormDirective`. `schemaOperation` is only an
intention:

- confirm calls Public `applyFormOperation(definition, currentValue,
operation)` and replaces the application `value` only on success;
- reject records the decision and leaves all controlled state unchanged;
- pending appends the intention to history and changes nothing until the user
  explicitly confirms or rejects that exact record; multiple pending records
  may coexist, and confirmation always applies the stored operation against the
  then-current application value, visibly recording stale or incompatible
  failure without changing state;
- reset restores the scenario's copied initial value, baseline, locale,
  visibility, decision mode and empty history;
- whole-form baseline commit is an explicit application action that replaces
  `baselineValue` with the current `value`; no D-038 partial-scope helper is
  introduced; and
- locale and visibility controls update only their application signals.

Selecting another scenario performs the same reset before compiling that
scenario. Every history record preserves the exact immutable operation,
decision state and Public apply diagnostics; it is display evidence, not a
retry protocol.

No shared cross-framework controller hides this ownership. The shell may use a
small pure display serializer, but it cannot wrap runtime behavior, infer
capabilities or mutate values. Saving, HTTP, authentication, authorization,
business workflow and persistence are absent.

The visible shell provides schema, UI Schema, value, baseline, normalized
definition, runtime snapshot, operation history, compiler/runtime diagnostics
and validation-issue panels. It labels their provenance so catalog input,
application state, normalized library output and expected educational evidence
cannot be mistaken for one another.

## 7. Build-checked copyable source

Copyable Angular examples come from marked regions in the actual reference-form
TypeScript and template source. A deterministic repository script extracts
those regions into one committed generated TypeScript module consumed by the
shell. The generator:

- supports only explicitly named, non-nested markers;
- rejects duplicate, missing, empty or unclosed regions;
- normalizes line endings but otherwise preserves source text;
- provides write and check modes; and
- runs in check mode in normal verification, failing when generated snippets
  are stale.

The generated module is never hand edited. Both the original source and the
application importing the generated module pass the normal build/type checks;
the catalog contains no framework code strings. This makes snippets copyable
without claiming that an isolated fragment is a complete application.

## 8. Browser and accessibility evidence

Use `@playwright/test` with one Chromium project and the Angular development
server managed by Playwright's `webServer` configuration. PLAN-016 selects an
exact compatible Playwright version and browser-install command. Local runs may
reuse a matching server; CI must start a fresh deterministic server.

The smoke lane covers:

- navigation to every scenario and visible compile success;
- representative primitive, nested, collection and nullable keyboard input;
- explicit confirm, reject and pending resolution with visible operation and
  controlled-state changes;
- baseline commit/reset, dirty, locale and validation-visibility changes;
- schema/definition/snapshot/history/issues inspection; and
- representative accessible names, descriptions, grouping and keyboard focus.

Selectors prefer roles, accessible names and visible labels. Stable
`data-testid` attributes are limited to shell-owned inspection/state regions or
otherwise ambiguous developer controls; tests do not select private renderer
classes or package-internal DOM structure.

This lane is a real-browser integration smoke test. It is not cross-browser
support, exhaustive conformance, visual-regression coverage, accessibility
certification, assistive-technology certification or a compatibility claim for
any Angular version outside the declared package range.

## 9. Release and compatibility isolation

Workspace success proves maintained source integration only. It never replaces:

1. package/source/declaration and packed-artifact checks;
2. temporary clean consumers that install selected tarballs or exact registry
   versions with strict peers; or
3. lower/upper compatibility tuples required by ADR-010.

The application manifest has one workspace mode and is never rewritten to
simulate tarball or npm consumption. Reference data may enter an isolated
consumer only through an explicit copied test asset; the consumer cannot import
the workspace catalog. Release scripts and package allowlists must prove that
`apps/`, generated snippets and browser artifacts enter no public tarball or
source package. Adding private applications changes no public version and does
not authorize publication.

## 10. Admission of later shells

One canonical Angular shell follows the current supported implementation tuple;
it is not cloned per patch or major. A later shell is admitted only after:

1. its adapter/integration contract and any Public package are accepted;
2. an approved plan names its exact workspace project and verification matrix;
3. it consumes the common catalog without moving framework behavior into it;
4. it has an independent bootstrap, dependency graph, build and tests;
5. publishable libraries are consumed only through Public entry points; and
6. browser, framework-version, SSR, hydration and accessibility non-claims are
   explicit.

A second framework restarts D-026 review from evidence. Publication of an
implementation-independent specification requires D-035. Hosting or repository
visibility requires its own review and applicable D-043 work.

D-045 remains Deferred. Angular versions before 19 require a separate decision
covering exact target majors, package/source families, build provenance,
framework APIs and maintenance policy. ADR-020 does not widen the current
`>=22.0.6 <23.0.0` peer range or claim that the Angular 22 Signal Forms source
can compile on legacy Angular.

## 11. Rejected alternatives

### One multi-framework runtime application

Rejected because bootstrap, lifecycle, reactivity, dependency and compatibility
boundaries would become coupled. Shared data plus independent shells retains
reuse without disguising framework-specific integration.

### One permanent application per framework version

Rejected because patch/major matrices belong to isolated consumers. A second
source family is justified only when accepted evidence shows materially
different source is required.

### Catalog as a framework capability/controller layer

Rejected because it would duplicate runtime behavior and anticipate adapters.
The catalog holds authored inputs, deterministic validation and educational
expectations only.

### Workspace shell as package-release evidence

Rejected because workspace resolution can conceal package, declaration, peer or
artifact defects. Clean consumers remain independently authoritative.

### Hand-maintained snippet strings

Rejected because they can compile nowhere and drift from the application.
Extraction from checked source keeps one maintained integration example.

## 12. Consequences

Positive consequences:

- every accepted capability gains one maintained interactive composition;
- framework-neutral scenario content can support future admitted shells;
- application ownership is visible and copyable;
- Angular source upgrades remain independent from future framework shells; and
- browser smoke adds evidence without changing release claims.

Costs and constraints:

- the workspace gains Angular application and browser tooling dependencies;
- generated snippets require a deterministic stale check;
- scenarios intentionally overlap some normative fixture concepts; and
- each later shell or compatibility family requires its own accepted boundary.

## 13. Verification required before acceptance

A complete review must reconcile this decision against review 053's nine
questions, all Accepted SPEC application-ownership rules, applicable ADRs,
package/public-entry boundaries and deferred decisions. Acceptance requires one
complete pass with zero findings and authorizes only preparation of PLAN-016.
