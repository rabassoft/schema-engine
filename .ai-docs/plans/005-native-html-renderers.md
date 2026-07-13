# PLAN-005: Native HTML renderers

- **Status:** Completed
- **Date:** 2026-07-13
- **Approval date:** 2026-07-13
- **Completion date:** 2026-07-13
- **Review revision:** Angular 22 Signal Forms
- **Review state:** Approved
- **Requires:** [`SPEC-001` v0.1.11](../specs/001-controlled-form-runtime.md), [`ADR-007`](../adrs/007-resolucion-renderers-testers.md), [`ADR-008`](../adrs/008-instanciacion-renderers-angular.md), [completed PLAN-004](./004-angular-adapter.md)
- **Milestone:** M5 — Native HTML renderer kit

## 1. Goal and completion boundary

Complete the first visual walking skeleton with accessible Angular 22 components
backed only by native HTML controls for normalized `string`, `number`, `integer`,
and `boolean` fields. Each native renderer uses Angular 22 Signal Forms for its
leaf control binding while the framework-neutral runtime remains authoritative.

M5 also closes two SPEC-001 responsibilities intentionally absent from the M4
headless increment:

- use Angular `LOCALE_ID` when a form does not provide an explicit locale;
- project labels, descriptions, hints, tooltips, placeholders, and validation
  messages through a replaceable framework-neutral `TextResolver`.

M5 does not add a form layout engine, Reactive Forms, Template-driven Forms,
browser-owned or Signal Forms validation, Material/Tailwind styling, custom
validator bridges, clear buttons, enum/format renderers, advanced localization,
async behavior, persistence, SSR-specific behavior, or a public package release.

## 2. Package and dependency boundary

- Implement the renderer kit inside the existing private
  `@rabassoft/schema-engine-angular` package and its single root entry point.
- Keep the core free of Angular, DOM, browser globals, RxJS, and runtime
  dependencies. Core receives only neutral text-resolution types.
- Keep Angular 22.0.6 as the exact workspace test baseline. Add matching
  `@angular/forms: 22.0.6` to workspace devDependencies and
  `@angular/forms: ^22.0.0` as an adapter peer dependency.
- Import forms APIs exclusively from `@angular/forms/signals`; do not import
  Reactive Forms, Template-driven Forms, or compatibility APIs.
- Use standalone components, Signals, `form()`, `FormField`, native control
  events, `Intl.NumberFormat`, and Angular's built-in template control flow.
- Do not add `zone.js`, a component library, CSS framework, direct
  `document`/`window` access, or a second package entry point.

D-028 and D-029 remain deferred because the packages are still private and no
publication or compatibility promise is introduced.

Because the package keeps one root entry point, headless consumers must satisfy
the `@angular/forms` peer even when they do not select the native provider. This
is an accepted private-package M5 trade-off; splitting entry points remains a
future package-boundary decision.

## 3. Angular 22 Signal Forms boundary

Angular 22 marks Signal Forms, `form()`, `FormField`, `FieldTree`,
`FormValueControl`, and `FormCheckboxControl` stable. M5 uses the stable leaf
binding primitives, but not Signal Forms as the business model, validation
engine, or submission owner.

Each native renderer owns exactly one private leaf control model and field tree:

```ts
private readonly controlModel = signal<string | boolean>('');
protected readonly controlField = form(this.controlModel);
```

The model starts with a safe empty presentation value because required renderer
inputs are applied after component construction. A computed confirmed
presentation signal derives only from the relevant snapshot presence/value and,
for numbers, locale/options. An Angular `effect()` observes that computed signal
after creation and calls `controlField().reset(confirmedPresentation)` without
emitting a core intent. It does not react to unrelated issue, dirty, touched, or
visibility snapshot changes.

Its template binds the native input through `[formField]="controlField"` and
also handles the same native input/change/focus/blur events needed to emit core
intents. Number/integer renderers use a string-valued leaf model because the
localized and incomplete editing text is not a canonical number.

The boundary is strict:

- the private Signal Form model is an ephemeral UI/control buffer, never the
  application value, baseline, runtime snapshot, or operation payload store;
- no Signal Forms schema or validator is created, and local `valid`, `errors`,
  `dirty`, and `touched` state is never projected as authoritative form state;
- runtime snapshots continue to drive labels, issues, dirty, touched, focus,
  visibility, and every confirmed control value;
- native events continue to call the M4 intent outputs; `FormField` never applies
  a core operation or writes application data;
- an external confirmed value synchronizes the leaf model without emitting an
  intent; a focused numeric renderer defers this visual synchronization until
  blur so it can preserve incomplete localized text;
- blur resets the leaf `FieldState` to the latest confirmed presentation value,
  discarding an unconfirmed or rejected edit and clearing its local Signal Forms
  interaction state;
- renderer destruction discards the private field tree with the component;
- `FormRoot`, submission, Signal Forms validation rules, async operations,
  metadata, hidden/disabled/readonly rules, and compat bridges remain outside
  M5.

The renderer may expose `focus(options?)` by delegating to
`controlField().focusBoundControl(options)`. This uses the binding registry owned
by `FormField` without querying the DOM.

This is a narrow renderer-local edit buffer, not the optimistic runtime model
from D-002. It never changes a core snapshot before application confirmation and
is always reconciled from confirmed state on blur. D-002 remains deferred for
pending operations, acknowledgements, conflicts, and optimistic snapshots.

The official JSON-driven Signal Forms pattern is not used to replace the Schema
Engine compiler/runtime because `form()` writes directly to its supplied
`WritableSignal`, whereas SPEC-001 requires strict operations and explicit
application confirmation.

## 4. Locale fallback and Angular form config

Revise the pre-release Angular form config to make locale optional while leaving
the core runtime contract unchanged:

```ts
export type AngularControlledFormConfig<TData extends object> = Omit<
  ControlledFormRuntimeOptions<TData>,
  'locale'
> & {
  readonly locale?: string;
};
```

`SchemaFormDirective` injects `LOCALE_ID` and supplies it to the core only when
the config's own locale value is `undefined`. An explicit empty string is not a
fallback request; it reaches normal core validation and is rejected. The
resolved locale is included in external updates and runtime replacements.

Changing only the resolved locale updates the existing runtime and never
recreates it or emits an operation. Existing consumers that pass a valid locale
remain source-compatible.

This deliberately supersedes PLAN-004's statement that the Angular config is
exactly the core options. SPEC-001 already assigns the fallback responsibility
to the Angular adapter, and the package has not been published.

## 5. Neutral text-resolution contracts

Add and export these framework-neutral contracts from
`@rabassoft/schema-engine`:

```ts
export type FieldTextMember =
  'label' | 'description' | 'hint' | 'tooltip' | 'placeholder' | 'issue';

export type TextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: Exclude<FieldTextMember, 'issue'>;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: 'issue';
      readonly issue: ValidationIssue;
    };

export interface TextResolver {
  resolve(text: string, context: TextResolutionContext): string;
}
```

The contracts do not execute inside the core runtime and introduce no text
storage into runtime snapshots. Context contains only normalized, immutable core
contracts. `issue` is present exactly when `member` is `issue`.

The adapter exports:

```ts
export interface AngularFieldTextSnapshot {
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly issueMessages: readonly string[];
}

export const SCHEMA_TEXT_RESOLVER: InjectionToken<TextResolver>;

export function provideSchemaTextResolver(resolver: TextResolver): Provider;
```

Without a provider, an identity resolver returns the source string. The field
outlet owns text projection so native and custom renderers receive the same
resolved, frozen snapshot and never call a resolver directly.

Projection order is label, description, hint, tooltip, placeholder, then issues
in snapshot order. An issue uses `fallbackMessage` when present and otherwise
its canonical `code`. Projection reruns when field identity, form id, locale, or
the issue array identity changes. Locale/text changes update bindings without
recreating the renderer.

A resolver exception or non-string return produces one warning for that member,
uses the original source string as a safe fallback, continues projecting the
remaining members, and never retains the thrown value.

## 6. Common renderer contract revision

Extend the private pre-release M4 renderer contract:

```ts
export interface AngularFieldRenderer {
  readonly field: InputSignal<FieldDefinition>;
  readonly snapshot: InputSignal<FieldRuntimeSnapshot>;
  readonly formId: InputSignal<string>;
  readonly locale: InputSignal<string>;
  readonly texts: InputSignal<AngularFieldTextSnapshot>;

  readonly setValue: OutputEmitterRef<unknown>;
  readonly removeValue: OutputEmitterRef<void>;
  readonly fieldFocus: OutputEmitterRef<void>;
  readonly fieldBlur: OutputEmitterRef<void>;
  readonly rendererDiagnostics: OutputEmitterRef<readonly Diagnostic[]>;
}
```

`SchemaFieldOutletDirective` binds `texts` reactively and forwards non-empty
`rendererDiagnostics` to `SchemaFormDirective.reportDiagnostics()` exactly
once. Fake M4 renderers and all native renderers adopt the revised contract.

The additional input/output are an explicit pre-release contract change needed
for uniform localization and safe renderer diagnostics. They do not activate
the Angular `ValidatorFn` bridge portion of D-024.

## 7. Native registration API

Export three standalone components:

- `SchemaStringRendererComponent`
- `SchemaNumberRendererComponent`
- `SchemaBooleanRendererComponent`

Export one convenience provider:

```ts
export function provideSchemaEngineAngularNative(
  ...customRegistrations: readonly AngularRendererRegistration[]
): EnvironmentProviders;
```

It composes the M4 adapter resolver with the three built-in registrations,
followed by caller registrations. Existing `provideSchemaEngineAngular()`
remains headless and unchanged.

Built-in registration IDs and testers are fixed:

| ID               | Match                                            | Rank | Priority |
| ---------------- | ------------------------------------------------ | ---- | -------- |
| `native-string`  | `field.kind === 'string'`                        | 10   | 0        |
| `native-number`  | `field.kind === 'number'` for number and integer | 10   | 0        |
| `native-boolean` | `field.kind === 'boolean'`                       | 10   | 0        |

Built-ins use the ordinary ADR-007 resolver. A custom registration overrides a
built-in only with a higher rank or the same rank and a positive priority. The
built-in list is frozen and is not exported as mutable registry state.

## 8. Shared semantic field structure

Each renderer emits one semantic field block with deterministic IDs derived by:

```ts
const baseId = `se-${encodeURIComponent(formId)}-${encodeURIComponent(field.key)}`;
```

The control uses `baseId`; description, hint, tooltip, and errors use stable
suffixes. No global counter, DOM query, or random value participates in IDs.

All renderers:

- associate a persistent `<label>` with the control;
- render description and hint only when present;
- expose tooltip content through keyboard-accessible native `<details>` and
  `<summary>` markup, using the resolved tooltip as its accessible name and no
  hard-coded translatable prose;
- construct `aria-describedby` from currently rendered description, hint, and
  error containers in that order;
- set `aria-invalid="true"` only while `snapshot.showIssues` is true and the
  field is invalid;
- render all resolved issue messages in snapshot order in an `aria-live="polite"`
  list only while `showIssues` is true;
- set `aria-required` from normalized metadata for string and number controls;
  the boolean renderer omits it because absent and false share one binary visual
  state and a required JSON Schema property may validly contain false;
- never set browser `required`, `pattern`, `min`, `max`, `step`, `minlength`, or
  `maxlength` attributes from schema constraints;
- do not render a placeholder as a label substitute.

`FormField` binds only the private leaf model. Core-derived accessibility state
and messages remain explicit renderer bindings and are not sourced from the
private Signal Forms field state.

The components include structural markup only. M5 adds no theme, layout grid,
CSS class contract, animations, tooltip overlay, or visual design tokens.

## 9. String renderer behavior

Use `<input type="text">`.

- Missing or incompatible confirmed values display as an empty control without
  coercion.
- A confirmed string displays exactly as supplied.
- `FormField` updates the private string control model on every native `input`;
  the same event emits its exact string through `setValue`, including `""`.
- The private model never trims, normalizes, debounces, validates, or removes the
  property.
- Focus and blur emit `fieldFocus` and `fieldBlur` synchronously.
- Placeholder uses only the resolved optional `texts.placeholder`.
- External confirmation reconciles the private control model. On blur,
  `controlField().reset(confirmedText)` discards any text not confirmed by the
  application.
- The Signal Forms model is visual control state only; no optimistic value is
  written to a runtime snapshot or application model.

## 10. Boolean renderer behavior

Use `<input type="checkbox">`.

- Missing, incompatible, and confirmed `false` values display unchecked;
  confirmed `true` displays checked.
- `FormField` updates the private boolean control model on native `change`; the
  same event emits the checkbox's boolean `checked` value through `setValue`.
- The renderer never emits `removeValue`; after interaction an absent boolean
  becomes an explicit `true` or `false` when confirmed by the application.
- Focus and blur use the common synchronous outputs.
- Blur resets the private field to the latest confirmed checked state.
- Native `required` is never set because JSON Schema property presence does not
  mean that a boolean must be true.

## 11. Number and integer renderer state

Use `<input type="text" inputmode="decimal">` for both numeric types. Browser
`type="number"` is excluded because it cannot represent locale-specific and
incomplete editing states consistently.

The component's private Signal Form model is the local editing string. That
string is visual state only and never enters core snapshots.

### 11.1 Entering and leaving edit mode

- On focus, derive an ungrouped localized editing string from the latest
  compatible confirmed finite number, or `""` when absent/incompatible, then
  emit `fieldFocus`.
- While focused, external confirmations and locale changes do not overwrite the
  editing string.
- On blur, call `controlField().reset()` with the latest confirmed formatted
  value, discard incomplete or invalid text, clear edit mode, and emit
  `fieldBlur`.
- A valid parsed value is still controlled: emitting it does not alter the
  confirmed snapshot or the value restored on blur unless the application has
  supplied the confirmation.

### 11.2 Locale parser

Build parser symbols with `Intl.NumberFormat(locale).formatToParts()` and map the
locale's ten decimal digits to ASCII. Parsing:

- trims leading and trailing Unicode whitespace;
- accepts localized digits, the locale decimal separator, locale grouping
  separators, the locale minus sign, and ASCII `-`;
- accepts at most one leading minus and one decimal separator;
- rejects `+`, exponent notation, `Infinity`, `NaN`, foreign decimal separators,
  misplaced grouping, embedded whitespace not used by that locale, and all
  other characters;
- returns only finite JavaScript numbers;
- accepts an integer renderer value only when `Number.isInteger(parsed)`;
- preserves JavaScript negative zero;
- treats `"-"`, a bare decimal separator, and text ending in the decimal
  separator as incomplete and emits no value;
- treats an empty string specially as a remove intent rather than numeric zero.

Grouping must match groups produced by the active locale; merely deleting every
group-like character is not sufficient. Schema `minimum`, `maximum`, and
`multipleOf` remain validator concerns and never block an otherwise parseable
renderer intent.

On each input event:

1. Empty text emits `removeValue` only when the confirmed field is present.
2. Incomplete or invalid text emits nothing.
3. A complete compatible number emits `setValue` unless it is `Object.is` equal
   to the currently confirmed value.

### 11.3 Closed-state formatting

Use `Intl.NumberFormat` with grouping enabled.

- Integer fields format with zero fraction digits.
- With `decimalPlaces: n`, use `maximumFractionDigits: n`; also use
  `minimumFractionDigits: n` only when `showTrailingZeros` is true.
- Without `decimalPlaces`, preserve useful numeric precision with zero minimum
  and up to 20 fraction digits instead of Intl's default three-digit maximum.
- `showTrailingZeros` without `decimalPlaces` has no effect.
- Formatting may round the displayed string but never changes or emits a rounded
  model value.
- Missing or incompatible confirmed values display empty.

An invalid/unsupported Intl locale falls back to `en-US` for numeric display and
parsing and emits a warning once for that locale/field configuration. An Intl
format failure falls back to canonical `String(value)` and emits a warning. No
exception object is retained.

## 12. Adapter diagnostics

All new diagnostics use `source: 'runtime'`, frozen data, English fallback
messages, copied paths, and safe parameters.

| Code                     | Severity | Required parameters                               |
| ------------------------ | -------- | ------------------------------------------------- |
| `INVALID_TEXT_RESOLVER`  | warning  | `expected`, `reason`, `actualType`                |
| `TEXT_RESOLUTION_FAILED` | warning  | `field`, `member`, optional `issueCode`, `reason` |
| `INVALID_NUMBER_LOCALE`  | warning  | `field`, `locale`, `fallbackLocale`               |
| `NUMBER_FORMAT_FAILED`   | warning  | `field`, `locale`, `reason`                       |

`INVALID_TEXT_RESOLVER` uses reasons `missing-resolve`, `accessor-resolve`, and
`invalid-resolve`; it activates the identity fallback. `TEXT_RESOLUTION_FAILED`
uses `exception` or `non-string-result`. Number-format reasons are
`unsupported-decimal-places` and `intl-failure`.

Malformed user editing text is not a diagnostic because incomplete and rejected
text is an expected visual state. Diagnostics are forwarded once per projection
or renderer configuration revision and do not enter runtime snapshots.

## 13. Tests and conformance fixtures

### 13.1 Signal Forms boundary tests

- Each native component imports and uses the stable Angular 22 `FormField`
  directive over one private leaf `FieldTree`.
- String, boolean, and numeric control buffers update through Signal Forms while
  core snapshots remain unchanged until external confirmation.
- External confirmation synchronizes the leaf model without emitting another
  intent; blur discards rejection and resets local touched/dirty state.
- Core snapshot touched, dirty, issues, and visibility remain authoritative even
  when the private Signal Forms field reports different local state.
- `focus()` delegates through `focusBoundControl()` and component destruction
  removes the registered binding.
- No Signal Forms schema, validation, submission, `FormRoot`, compat API,
  Reactive Forms, or Template-driven Forms enters the adapter.

### 13.2 Provider and contract tests

- Native provider resolves all four supported schema types to the three expected
  components.
- Existing headless provider still has no implicit built-ins.
- Rank/priority overrides remain ADR-007 compliant.
- `texts` and `rendererDiagnostics` bindings update/forward without renderer
  recreation.
- Explicit locale wins; omitted locale uses TestBed `LOCALE_ID`; locale-only
  changes reuse the runtime.

### 13.3 Text projection tests

- Identity resolver and custom resolver for every text member.
- Issue fallback message versus code and deterministic issue order.
- Locale changes re-resolve text without component replacement.
- Resolver accessor, exception, and non-string results use raw fallback and emit
  frozen diagnostics without retaining thrown values.

### 13.4 Native component integration tests

- Deterministic escaped IDs, unique suffixes, label association,
  `aria-describedby`, `aria-invalid`, `aria-required`, tooltip keyboard markup,
  and all visible issues.
- String exact input, empty string, controlled confirmation, focus, and blur.
- Boolean missing/false/true display and checked change intent.
- Renderer destruction leaves no native control or attached view.
- Standard and explicit zoneless TestBed configurations.

### 13.5 Numeric fixtures

Add JSON conformance fixtures covering at least `en-US`, `es-ES`, and a locale
with non-ASCII digits. Each fixture records locale, numeric type, input text,
classification (`empty`, `incomplete`, `invalid`, or `value`), and expected
canonical value when applicable.

Focused tests also cover grouping placement, negative zero, integer rejection,
invalid locale fallback, controlled rejection/confirmation, active locale
changes, decimal places, trailing zeros, empty removal, incompatible confirmed
values, and formatting failure isolation.

Existing 119 M1-M4 tests and package exports must remain passing.

## 14. Documentation and specification promotion

After formal plan approval and before implementation:

- promote PLAN-005's exact locale, text, renderer, parser, accessibility, and
  diagnostic contracts plus the renderer-local Signal Forms boundary to
  SPEC-001 Draft v0.1.11;
- update the SPEC index and handoff consistently;
- retain D-010, D-024's Angular validator bridge, D-025, D-028, D-029, and D-030
  in the deferred register;
- do not mark D-008 (`enum`, `const`, `format`) as promoted;
- clarify D-002 remains deferred for optimistic runtime projection despite the
  renderer-local Signal Forms edit buffer;
- record PLAN-005 as approved, then active, then completed through the normal
  persistent-state workflow.

## 15. Tooling and acceptance

No new runtime dependency or test runner is expected. Acceptance commands:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
```

Also verify:

- no Angular, DOM, browser-global, or RxJS import enters core;
- adapter forms imports are limited to `@angular/forms/signals`; no
  Reactive/Template-driven/compat forms API, `zone.js`, component library, or
  direct DOM API enters the adapter;
- generated output remains ignored;
- local Markdown links resolve and `git diff --check` passes;
- package smoke tests import the native provider, components, and text contracts.

M5 is incomplete if native controls mutate application state optimistically,
numeric editing leaks temporary text into snapshots, browser constraint
validation becomes authoritative, text resolution bypasses diagnostics, custom
renderers cannot override built-ins deterministically, accessibility
associations are missing, Signal Forms state replaces core state, a private leaf
model survives renderer destruction, or any deferred capability enters the
increment.

## 16. Formal review checklist

Before approval, confirm:

1. The renderer-local Signal Forms boundary uses Angular 22 without creating a
   second business source of truth or validation engine.
2. The pre-release changes to Angular locale config and renderer contracts are
   acceptable.
3. Text resolution belongs in the outlet projection while neutral contracts
   belong in core.
4. Native provider composition and override scores are intentional.
5. Numeric parser grammar, controlled editing, locale fallback, and display-only
   rounding contain no remaining implementation choice.
6. Accessibility markup and browser-validation boundaries are sufficient for
   the walking skeleton.
7. Diagnostics, fixtures, exclusions, and acceptance commands are complete.

## 17. Formal re-review outcome

The Angular 22 review confirmed:

- Signal Forms, `form()`, `FormField`, and the relevant field/control contracts
  are stable in Angular 22 and appropriate dependencies for the reference
  adapter.
- Using the application's business model directly with `form()` is rejected
  because Angular writes through its `WritableSignal`, bypassing strict core
  operations and explicit confirmation.
- A private leaf Signal Form per renderer captures the useful Angular binding,
  focus, reset, and local control-state behavior without becoming authoritative
  application or validation state.
- Core snapshots and operations remain the only bridge across the adapter
  boundary; local Signal Forms state is reconciled from confirmed values.
- The `@angular/forms` peer cost is explicit, no compat/Reactive/Template-driven
  API enters scope, and D-002/D-024 remain deferred beyond the narrow boundary
  stated here.
- The seven formal checklist areas contain no remaining implementation choice.

The user explicitly approved this revised contract on 2026-07-13.

## 18. Angular 22 references

- [Signal Forms overview](https://angular.dev/guide/forms/signals/overview)
- [Signal Forms custom controls](https://angular.dev/guide/forms/signals/custom-controls)
- [`form()` API](https://angular.dev/api/forms/signals/form)
- [`FormField` API](https://angular.dev/api/forms/signals/FormField)
- [Dynamic forms with JSON](https://angular.dev/guide/forms/signals/dynamic-forms-with-json)

## 19. Completion outcome

M5 was implemented and accepted on 2026-07-13. The Angular package now provides
native string, number/integer, and boolean renderers; deterministic built-in
registrations and custom overrides; `LOCALE_ID` fallback; replaceable text
resolution; accessible issue projection; and controlled localized numeric
editing backed by private Signal Forms leaf buffers.

The final suite passes 140 tests: 104 core tests and 36 Angular tests. Formatting,
linting, type checking, builds, package smoke tests, frozen installation, diff
validation, documentation links, framework-boundary checks, and forms-import
checks also pass. No deferred capability was promoted.
