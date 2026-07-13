# PLAN-004: Angular controlled-form adapter

- **Status:** Completed
- **Date:** 2026-07-13
- **Approval date:** 2026-07-13
- **Completion date:** 2026-07-13
- **Requires:** [`SPEC-001` v0.1.10](../specs/001-controlled-form-runtime.md), [`ADR-006`](../adrs/006-limite-paquete-inicial.md), [`ADR-007`](../adrs/007-resolucion-renderers-testers.md), [`ADR-008`](../adrs/008-instanciacion-renderers-angular.md), [completed PLAN-003](./003-controlled-runtime.md)
- **Milestone:** M4 — Angular adapter

## 1. Goal and completion boundary

Add a headless Angular 22 adapter that owns the Angular lifecycle around the
framework-neutral runtime, projects snapshots to Signals, emits operations and
ephemeral diagnostics idiomatically, resolves renderer registrations, and
instantiates a selected renderer through `ViewContainerRef`.

M4 does not implement native HTML field controls, parsing/formatting,
accessibility markup, visual layout, Material/Tailwind integration, persistence,
async validation, lazy renderers, SSR-specific behavior, or a public release.
Native string/number/integer/boolean renderers remain M5.

## 2. Workspace and package boundary

- Add `packages/angular` named `@rabassoft/schema-engine-angular`.
- Keep version `0.0.0`, `private: true`, ESM, side-effect free, and one root
  entry point.
- Depend on `@rabassoft/schema-engine` through `workspace:*`.
- Declare `@angular/core: ^22.0.0` as a peer dependency.
- Pin matching Angular 22 packages in workspace devDependencies for compilation
  and tests. Use only stable releases and record exact versions in the lockfile.
- Use the existing TypeScript 6.0 toolchain, Angular compiler partial mode, and
  Vitest with a DOM test environment.
- Do not add Nx, Angular CLI workspace scaffolding, RxJS imports, `zone.js`,
  `@angular/forms`, or a component library.

D-028 remains deferred because M4 validates one supported Angular major in a
private package; it does not establish the future published compatibility
matrix or product versioning policy.

## 3. Form adapter directive

Export a standalone attribute directive:

```ts
@Directive({
  selector: '[schemaForm]',
  exportAs: 'schemaForm',
  standalone: true,
})
export class SchemaFormDirective<TData extends object> {
  readonly schemaForm = input.required<AngularControlledFormConfig<TData>>();
  readonly schemaOperation = output<FormOperation>();
  readonly schemaDiagnostics = output<readonly Diagnostic[]>();

  readonly snapshot: Signal<FormRuntimeSnapshot<TData> | undefined>;
  readonly ready: Signal<boolean>;
}
```

`AngularControlledFormConfig<TData>` contains exactly the core
`ControlledFormRuntimeOptions<TData>` members. Consumers replace the config
object immutably when inputs change.

### 3.1 Creation and updates

- Create the core runtime after the first complete required input is available.
- Publish its initial snapshot synchronously to the signal without emitting a
  snapshot output.
- Subscribe once to snapshots and operations. Snapshot notifications update the
  signal; operation notifications emit `schemaOperation` synchronously.
- A new config with identical `formId`, `definition`, `schema`, and `validator`
  identities updates value, baseline, locale, and visibility through core
  actions without recreating the runtime.
- A changed identity for any of those four creation members creates and
  subscribes a replacement runtime first. Only after success does it swap the
  snapshot and dispose the previous runtime. This is transactional recreation,
  not dynamic definition reconciliation from D-013.
- Creation/action errors and warnings emit their frozen diagnostics through
  `schemaDiagnostics`. Successful actions with no diagnostics emit nothing.
- An invalid replacement config keeps the previous valid runtime and snapshot;
  diagnostics describe the rejected replacement.

### 3.2 Public intent methods

The directive exposes typed forwarding methods for set, remove, focus, blur,
visibility, scopes, and validation snapshots. Every method returns the original
`RuntimeActionResult`/`ValidationSnapshot` and emits non-empty diagnostics once.

The adapter never applies an emitted operation or mutates application data.

### 3.3 Lifecycle and reactivity

- Use Angular Signals, `effect()`, `DestroyRef`, and public Angular APIs only.
- Destroying the directive unsubscribes, disposes the runtime, and prevents later
  emissions.
- Do not inject `NgZone`, inspect Zone.js, call `detectChanges()` manually, or
  use RxJS as an internal bridge.
- The adapter must work under the normal TestBed environment and with zoneless
  change detection enabled; this is a compatibility test, not a claim that
  Signals require Zone.js to be absent.

## 4. Renderer registration and resolution

Export Angular-specialized ADR-007 contracts:

```ts
export type AngularRendererType = Type<AngularFieldRenderer>;

export type RendererTester = (field: FieldDefinition) => number | null;

export interface AngularRendererRegistration {
  readonly id: string;
  readonly renderer: AngularRendererType;
  readonly tester: RendererTester;
  readonly priority?: number;
}

export type RendererResolutionResult =
  | {
      readonly success: true;
      readonly registration: AngularRendererRegistration;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly Diagnostic[];
    };
```

Provide:

- `provideSchemaRenderer(registration): Provider` using a multi-provider token.
- `provideSchemaEngineAngular(...registrations): EnvironmentProviders` as a
  convenience composition API.
- An injectable `AngularRendererResolver` scoped by the consumer injector.

The resolver snapshots and validates all registrations once at construction.
It implements ADR-007 rank, priority, and earliest-registration tie-breaking.
Registrations, result wrappers, and diagnostics are immutable. Testers receive
the exact frozen `FieldDefinition` and cannot alter registry state.

`AngularRendererResolver` always constructs without throwing and exposes:

```ts
readonly ready: boolean;
readonly configurationDiagnostics: readonly Diagnostic[];
resolve(field: FieldDefinition): RendererResolutionResult;
```

If registration validation fails, `ready` is false, registrations are not
partially activated, and every `resolve()` returns the frozen configuration
diagnostics without executing testers. The field outlet forwards those
diagnostics once for its current configuration identity.

No built-in renderer registration is included in M4. Tests use standalone fake
renderers; M5 supplies the native registrations.

## 5. Common Angular renderer contract

Every renderer component structurally exposes signal inputs and outputs with
these exact public names:

```ts
export interface AngularFieldRenderer {
  readonly field: InputSignal<FieldDefinition>;
  readonly snapshot: InputSignal<FieldRuntimeSnapshot>;
  readonly formId: InputSignal<string>;
  readonly locale: InputSignal<string>;

  readonly setValue: OutputEmitterRef<unknown>;
  readonly removeValue: OutputEmitterRef<void>;
  readonly fieldFocus: OutputEmitterRef<void>;
  readonly fieldBlur: OutputEmitterRef<void>;
}
```

The contract passes normalized definitions and snapshots only. Renderers never
receive the core runtime, source schema, validator, baseline, or application
store.

## 6. Field outlet directive

Export exactly one standalone attribute directive:

```ts
@Directive({ selector: '[schemaFieldOutlet]', standalone: true })
export class SchemaFieldOutletDirective {
  readonly schemaFieldOutlet = input.required<FieldDefinition>();
}
```

It is used on an inline anchor such as
`<ng-container [schemaFieldOutlet]="field" />`, must be nested under
`SchemaFormDirective`, and injects its parent context, renderer resolver,
`ViewContainerRef`, and `EnvironmentInjector`.

For each active definition:

1. Resolve exactly once through `AngularRendererResolver`.
2. Read the matching field snapshot from the parent snapshot signal.
3. Instantiate exactly one renderer with
   `ViewContainerRef.createComponent(renderer, { environmentInjector, bindings })`.
4. Bind `field`, `snapshot`, `formId`, and `locale` with `inputBinding()`.
5. Bind the four outputs with `outputBinding()` to parent intent methods.

If the parent runtime is not ready or the field snapshot is unavailable, create
nothing and emit a diagnostic once per failed configuration identity. A changed
field definition or recreated parent runtime destroys the previous
`ComponentRef` before resolving/creating again. Destroying the outlet clears the
container and ref.

M4 does not use `NgComponentOutlet`, standalone `createComponent()`, direct DOM
APIs, `ApplicationRef.attachView()`, projectable nodes, host directives, or child
environment injectors.

## 7. Diagnostics

All adapter diagnostics use `source: 'runtime'`, stable English fallback
messages, safe scalar/type descriptors, frozen containers, and no retained
exception objects.

| Code                            | Severity | Required parameters                                      |
| ------------------------------- | -------- | -------------------------------------------------------- |
| `INVALID_RENDERER_REGISTRATION` | error    | `index`, `member`, `expected`, `reason`                  |
| `DUPLICATE_RENDERER_ID`         | error    | `id`, `firstIndex`, `duplicateIndex`                     |
| `RENDERER_TESTER_EXCEPTION`     | warning  | `id`, `index`                                            |
| `INVALID_RENDERER_TEST_RESULT`  | warning  | `id`, `index`, `actualType`, optional safe `actualValue` |
| `NO_RENDERER_MATCH`             | error    | `field`, copied `path`                                   |
| `MISSING_FIELD_SNAPSHOT`        | error    | `field`, copied `path`                                   |
| `RENDERER_INSTANTIATION_FAILED` | error    | `id`, `field`                                            |

Registration reasons are exactly `registration-not-object`, `missing-member`,
`accessor-member`, `invalid-id`, `invalid-renderer`, `invalid-tester`, and
`invalid-priority`. Core creation/update diagnostics are forwarded unchanged
and are not wrapped or duplicated. Independent registration diagnostics follow registration index
and member order; tester diagnostics follow registration order.

## 8. Tests and conformance

### 8.1 Resolver tests

- Invalid registrations and duplicate IDs.
- Rank, priority, and earliest-registration tie-breaking.
- Tester `null`, invalid result, exception isolation, and no match.
- Frozen registry/results without freezing caller renderer types.
- Testers receive normalized definitions only.

### 8.2 Directive integration tests

- Initial creation and snapshot Signal projection.
- Controlled external confirmation and absence of optimistic projection.
- Synchronous operation and diagnostic outputs.
- Runtime recreation versus external-state update by identity.
- Invalid replacement preserves the previous runtime.
- Destruction unsubscribes and disposes exactly once.
- Operation works in the standard and zoneless TestBed configurations.

### 8.3 Outlet integration tests

- Fake renderer resolution and creation through `ViewContainerRef`.
- Reactive input bindings update without recreating the renderer.
- Output bindings forward all four intents.
- Missing match/snapshot and instantiation failure diagnostics.
- Renderer replacement and destruction leave no attached view.

Add package smoke coverage for root exports and resolver construction. Existing
M1–M3 tests and outputs must remain unchanged.

## 9. Tooling and acceptance

- Extend root format, lint, typecheck, test, build, and package-smoke scripts to
  cover both packages deterministically.
- Compile Angular decorators with `ngc` in partial compilation mode.
- Use Vitest plus the minimum DOM/TestBed setup required; do not add Karma.
- Keep generated output, Angular caches, and test DOM artifacts ignored.

Acceptance commands:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
```

M4 is incomplete if any command fails, the core gains an Angular dependency,
the adapter applies operations optimistically, renderer selection inspects raw
schema or mutable runtime state, component views leak, diagnostics escape as
expected exceptions, or native HTML controls enter this milestone.

## 10. Formal review outcome

The review confirmed:

- M4 and M5 remain separated: infrastructure/fake renderers now, native HTML
  controls later.
- Angular 22 is the single private-package test baseline; D-028 remains deferred.
- Signals are the only projection mechanism and no RxJS/Zone.js claim is
  introduced.
- ADR-007 resolution and ADR-008 instantiation have exact adapter contracts.
- Public names, lifecycle, diagnostic order, fixtures, and acceptance contain no
  remaining implementation choice.
