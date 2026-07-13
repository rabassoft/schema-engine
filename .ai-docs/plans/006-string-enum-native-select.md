# PLAN-006: String enum normalization and native select

- **Status:** Approved
- **Date:** 2026-07-13
- **Approval date:** 2026-07-13
- **Review revision:** 1
- **Review state:** Corrections applied; repeated formal review passed; explicitly approved
- **Requires:** [`SPEC-001` v0.1.13](../specs/001-controlled-form-runtime.md),
  [`ADR-005`](../adrs/005-politica-dialecto-json-schema.md),
  [`ADR-007`](../adrs/007-resolucion-renderers-testers.md),
  [`ADR-008`](../adrs/008-instanciacion-renderers-angular.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-011`](../adrs/011-enum-string-normalizado-select-nativo.md), and
  [completed PLAN-005](./005-native-html-renderers.md)
- **Milestone:** M6 — String enum and native select

## 1. Goal and completion boundary

Implement the accepted ADR-011 increment end to end:

```text
string enum + optional UI labels
                ↓
immutable normalized choices
                ↓
resolved choice texts
                ↓
ranked Angular native <select>
```

The increment supports only a non-empty, duplicate-free `enum` of strings on a
direct root string field. It adds optional UI Schema labels, validates manually
supplied choices at runtime creation, projects localized choice texts, and
selects a native Angular renderer through the existing ADR-007 resolver.

M6 does not implement `const`, `format`, non-string or mixed enums, `null`,
composition, schema-derived validation inside core or Angular, radios,
autocomplete, multiselect, clear-to-missing, defaults, coercion, dynamic
definitions, new entry points, publication, or Stable APIs.

The plan is explicitly approved. Implementation begins only through a separate
M6 task that first marks the milestone active in persistent project state.

## 2. Reviewed current state and conflict check

The existing implementation already provides the required extension points:

- the compiler recognizes Draft 2020-12 keywords and produces deeply frozen
  normalized definitions;
- runtime creation validates a minimum `FormDefinition` before invoking the
  external validator;
- operations enforce root paths and primitive types without performing business
  validation;
- the Angular adapter projects texts outside core snapshots;
- native renderers use private Angular 22 Signal Form leaves as presentation
  buffers;
- renderer selection uses rank, priority, and registration order from ADR-007;
- the package root indexes and smoke tests define the Public + Experimental +
  Active surface from ADR-009.

No accepted document conflicts with ADR-011 after ADR-005's explicit amendment.
The current code still treats `enum` as unsupported, has no `enumLabels`,
`choices`, choice text context, or select renderer; those are expected gaps, not
contradictions.

The review closes these implementation choices:

1. an independent outer `enumLabels` shape error is reported even when its
   schema field is blocked, but no compatibility or member diagnostic is
   derived below that blocked branch;
2. a structurally valid `enumLabels` on a valid field with no enum emits one
   `INCOMPATIBLE_UI_OPTION`, while only a valid string enum permits member
   traversal;
3. base `FormDefinition` errors retain the existing runtime diagnostic, while
   malformed own string `choices` use ADR-011's more specific expected value;
4. the select uses internal position tokens, with an empty sentinel token and
   `choice:<index>` for domain choices, so the domain string `""` is ordinary;
5. source and resolved choice ordering always follows the schema `enum`.

## 3. Public neutral contracts

Extend and export the following contracts from
`@rabassoft/schema-engine`:

```ts
export interface StringChoiceDefinition {
  readonly value: string;
  readonly label: string;
}

export interface StringFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'string';
  readonly constraints: {
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly pattern?: string;
  };
  readonly choices?: readonly StringChoiceDefinition[];
}

export interface FieldUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly enumLabels?: Readonly<Record<string, string>>;
  readonly options?: {
    readonly decimalPlaces?: number;
    readonly showTrailingZeros?: boolean;
  };
}
```

`choices` is absent for a string field without a supported enum. When present,
it is non-empty, preserves enum order, contains unique exact string values, and
has a non-blank source label for every choice. The compiler result, definition,
array, and each choice remain deeply frozen by the existing compiler boundary.

`StringChoiceDefinition`, the extended definitions, and every transitive public
type remain Public + Experimental + Active. No symbol is promoted to Stable and
no entry point or export map is added.

## 4. Compiler keyword classification and enum inspection

Add `enum` to `STRING_FIELD_KEYWORDS`. Because
`COMPILER_SUPPORTED_KEYWORDS` is derived from supported keyword sets, the
existing classifier will then produce:

| Location or form                              | Result                                                       |
| --------------------------------------------- | ------------------------------------------------------------ |
| direct string field, valid string array       | supported and normalized                                     |
| direct number/integer/boolean field           | blocking `INCOMPATIBLE_SCHEMA_KEYWORD`                       |
| root schema                                   | blocking `UNSUPPORTED_SCHEMA_KEYWORD`                        |
| `const`                                       | blocking `UNSUPPORTED_SCHEMA_KEYWORD`                        |
| `format`                                      | warning `IGNORED_SCHEMA_KEYWORD`                             |
| nested/composed/non-inspected schema location | remains outside the compiler subset and receives no new walk |

Extend the internal field candidate with an enum state that distinguishes:

- `absent`: the otherwise valid known field declares no own `enum`;
- `valid`: a string field declares a supported enum and carries its normalized
  values;
- `schema-blocked`: an own enum is malformed on a string field or incompatible
  with a valid number, integer, or boolean field.

A field whose `type` is missing or unsupported produces no field candidate, as
it does today. Only `valid` carries values. `schema-blocked` preserves the
schema diagnostic while preventing derived UI compatibility and label-member
diagnostics.

Enum inspection is descriptor-safe:

1. Read the own `enum` keyword descriptor before its value. An accessor emits
   `INVALID_SCHEMA_KEYWORD_VALUE` at
   `['properties', fieldName, 'enum']` with
   `expected: 'array of unique strings'` and `actualType: 'accessor'`; its
   getter is never invoked.
2. Require the data value to be an actual array. Otherwise emit the same code
   and path with `expected: 'array of unique strings'` plus the existing safe
   actual-value descriptor.
3. Require `length > 0`. An empty array emits the same code and path with
   `expected: 'non-empty array of unique strings'`.
4. Iterate numeric indices from `0` to `length - 1` and use
   `Object.getOwnPropertyDescriptor()` for each index before reading it.
5. A missing/sparse index emits the invalid-value diagnostic at that index with
   `expected: 'string'` and `actualType: 'missing'`.
6. An accessor index emits the same code and path with `expected: 'string'` and
   `actualType: 'accessor'`; its getter is never invoked.
7. A data value that is not a string emits the same code and index path with
   `expected: 'string'` plus the existing safe actual-value descriptor.
8. A repeated string emits the same code at its second and every later
   occurrence with `expected: 'unique string'` plus the safe actual value.
9. Valid strings are copied in declaration order without trim, Unicode
   normalization, case folding, coercion, or mutation.

All independently discoverable enum element errors are collected in index
order. Any enum error marks the enum state `schema-blocked` and prevents
compilation from returning a partial definition. The source array is never
frozen or mutated.

## 5. UI Schema `enumLabels` normalization

Add `enumLabels` as a direct recognized field UI key, not an `options` member.
The compiler processes it after schema inspection and uses the corresponding
field candidate's enum state.

### 5.1 Branch and cascade rules

1. Read the own `enumLabels` descriptor before its value. An accessor emits
   `INVALID_UI_SCHEMA_VALUE` at
   `['fields', fieldName, 'enumLabels']` with `key: 'enumLabels'`,
   `expected: 'object'`, and `actualType: 'accessor'`; its getter is never
   invoked.
2. If the data value is not a non-null, non-array object, emit
   `INVALID_UI_SCHEMA_VALUE` with `key: 'enumLabels'`, `expected: 'object'`, and
   document path `['fields', fieldName, 'enumLabels']`. Stop this UI branch.
3. If no field candidate exists because the schema field type is missing or
   invalid, ignore the structurally valid object without enumerating members or
   emitting a compatibility diagnostic.
4. If the field candidate has `schema-blocked` enum state, ignore the
   structurally valid object without enumerating members or emitting a
   compatibility or unknown-label diagnostic.
5. If the valid field candidate has `absent` enum state, emit one
   `INCOMPATIBLE_UI_OPTION` at the same path with parameters
   `{ field, fieldType, option: 'enumLabels', reason: 'missing-compatible-enum' }`.
   Ignore the object without enumerating or reading any member.
6. With `valid` string enum state, enumerate own enumerable string keys in
   `Object.keys()` order. Read each value only through its own descriptor.
7. A missing or accessor descriptor, non-string value, or string whose
   `trim().length === 0` emits `INVALID_UI_SCHEMA_VALUE` at
   `['fields', fieldName, 'enumLabels', labelKey]`, with `key: labelKey`,
   `expected: 'non-blank string'`, and a safe actual descriptor. Stop that
   entry; do not also emit `UNKNOWN_ENUM_LABEL` for it.
8. A structurally valid label whose key is not an enum value emits
   `UNKNOWN_ENUM_LABEL` and is ignored.
9. A valid known label is copied as opaque source text. It cannot add, remove,
   or reorder choices.

`UNKNOWN_ENUM_LABEL` is a warning with:

```ts
{
  code: 'UNKNOWN_ENUM_LABEL',
  severity: 'warning',
  source: 'ui-schema',
  dataPath: [fieldName],
  documentPath: ['fields', fieldName, 'enumLabels', labelKey],
  parameters: { field: fieldName, value: labelKey }
}
```

Schema diagnostics continue to precede UI Schema diagnostics. UI field keys and
label keys retain input enumeration order. A blocked schema branch plus a valid
outer object produces only its schema diagnostic; a blocked branch plus an
invalid outer shape produces the schema diagnostic followed by the independent
UI shape error. A missing/invalid field type plus a valid object produces no
derived UI diagnostic. No accessor is executed, including inside an ignored
object.

### 5.2 Choice construction and label fallback

Build choices only after compilation has no blocking error. For each enum value
in schema order:

- use its own valid `enumLabels` entry when supplied;
- otherwise use the domain value itself when `value.trim().length > 0`;
- otherwise use `JSON.stringify(value)`, which produces a visible quoted source
  such as `""` or `"   "`.

Every resulting source label is non-blank. `enumLabels` never changes the
validator schema, domain values, or choice ordering.

## 6. Runtime creation boundary for manual choices

Retain the current minimum base-definition validation. After a field passes that
base check, inspect own `choices` only when `kind === 'string'`.

- An absent or inherited `choices` member means no choices.
- An own accessor `choices` member is invalid and is never invoked.
- An own data member must be a dense, non-empty array.
- Every numeric index must be an own data property containing a non-array
  object.
- Every choice must expose own data properties `value` and `label`; accessors
  are invalid and never invoked.
- `value` must be a string and unique within the field.
- `label` must be a string with `label.trim().length > 0`.
- Sparse arrays, missing members, duplicate values, inherited members, and
  malformed entries are invalid.

Malformed string choices block creation before `SchemaValidator.validate()` is
called. They produce exactly one frozen `INVALID_RUNTIME_OPTIONS` diagnostic
with:

```ts
{
  member: 'definition',
  expected: 'valid FormDefinition with string choices',
  reason: 'invalid-value',
  actualType: 'object'
}
```

Other base-definition failures retain the existing
`expected: 'valid root FormDefinition'` diagnostic, preventing ADR-011 from
silently changing established error classification.

The runtime does not clone or freeze a caller-owned manual definition and does
not revalidate it on every action. As with the existing readonly definition
contract, mutating it after successful creation is unsupported. Compiler output
remains the safe deeply frozen path.

## 7. Validation, operations, and controlled-state boundary

No operation contract changes.

- `applyOperation()` receives no definition and remains unchanged.
- `applyFormOperation()` retains PLAN-002's minimum path/type inspection and
  must not read, validate, or execute a `choices` member.
- `requestSetValue()` continues to accept any compatible string and does not
  enforce enum membership.
- `SchemaValidator` alone evaluates the source schema against confirmed
  application data.
- A missing value or an external string outside choices remains representable;
  neither runtime nor renderer corrects it.
- The application remains the only source of truth and must confirm or reject
  every emitted operation through external state.

Focused tests must prove that an accessor named `choices` is not executed by
either operation utility and that an out-of-enum string is accepted by runtime
creation and controlled updates when the external validator reports it as
valid.

## 8. Choice text contracts and projection

Revise the neutral text contracts to keep the branches structurally exclusive:

```ts
export type FieldTextMember =
  | 'label'
  | 'description'
  | 'hint'
  | 'tooltip'
  | 'placeholder'
  | 'choice'
  | 'issue';

export type TextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: Exclude<FieldTextMember, 'choice' | 'issue'>;
      readonly choice?: never;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: 'choice';
      readonly choice: StringChoiceDefinition;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: 'issue';
      readonly choice?: never;
      readonly issue: ValidationIssue;
    };
```

Extend the Angular snapshot:

```ts
export interface AngularFieldTextSnapshot {
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly choiceLabels: readonly string[];
  readonly issueMessages: readonly string[];
}
```

`choiceLabels` is always present, empty without choices, frozen, and aligned by
index with `field.choices`. `emptyTextSnapshot()` includes a frozen empty choice
array.

Projection and diagnostic order is fixed:

1. label;
2. description;
3. hint;
4. tooltip;
5. placeholder;
6. choices in definition order;
7. issues in snapshot order.

The projector discovers choices through the field's own descriptor and never
uses inherited values or invokes an accessor. Runtime creation is the blocking
structural boundary; the Angular helper performs only the safe own-member read
needed by projection and testers.

Choice resolution calls `TextResolver.resolve(choice.label, context)` with the
exact choice object. An exception, non-string result, or string whose
`trim().length === 0` keeps the non-blank source label and emits
`TEXT_RESOLUTION_FAILED` with:

```ts
{
  field: field.name,
  member: 'choice',
  choiceValue: choice.value,
  reason: 'exception' | 'non-string-result' | 'blank-string-result'
}
```

Each choice-specific `TEXT_RESOLUTION_FAILED` diagnostic has severity
`warning`, source `runtime`, `dataPath` equal to a frozen copy of `field.path`,
and no `documentPath`. Exactly one warning is appended for each failing choice
in choice order during that projection. The full projection diagnostic array is
frozen and the outlet forwards the non-empty array once.

The outlet's text-projection identity remains exactly field identity, form id,
locale, and field-issue-array identity. A change to any of those identities may
create a new projection and therefore a new diagnostic batch. Snapshot changes
that preserve all four identities do not resolve choices again and do not
repeat their diagnostics.

Other text members preserve PLAN-005 behavior and may resolve to an empty
string. Locale changes recompute all choice labels without recreating the
renderer or emitting a core operation.

## 9. Native registration and public Angular surface

Add the standalone component in
`packages/angular/src/native/string-enum-renderer.ts` and export it from the
existing Angular root entry point:

```ts
@Component({
  selector: 'schema-string-enum-renderer',
  standalone: true,
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Native select template defined by section 10.
})
export class SchemaStringEnumRendererComponent implements AngularFieldRenderer {}
```

It is Public + Experimental + Active from the existing Angular root entry
point. The raw registration list and DOM token helpers remain Internal.

Extend the built-in provider with this registration:

| ID                   | Match                                    | Rank | Priority |
| -------------------- | ---------------------------------------- | ---- | -------- |
| `native-string-enum` | own valid choices on a normalized string | 20   | 0        |
| `native-string`      | `field.kind === 'string'`                | 10   | 0        |
| `native-number`      | `field.kind === 'number'`                | 10   | 0        |
| `native-boolean`     | `field.kind === 'boolean'`               | 10   | 0        |

The generic string tester intentionally continues matching enum fields; rank
20 makes the specialized select win. A consumer overriding an enum field needs
rank greater than 20, or rank 20 with positive priority. Existing rank-10
string overrides continue to affect only ordinary strings unless their tester
or score is deliberately updated.

The enum tester uses the own `choices` descriptor and returns 20 only for a data
property containing a non-empty array. It does not inspect choice members or
execute accessors; full structural validation belongs to runtime creation.

`provideSchemaEngineAngular()` remains headless. The native provider still uses
one immutable ADR-007 registration sequence and creates no parallel registry.

## 10. Native select and Signal Forms behavior

`SchemaStringEnumRendererComponent` uses a native `<select>` bound to one
private string-valued Angular 22 Signal Form leaf. The model contains only an
internal presentation token, never a domain value or application state.

Token protocol:

- `''` is the internal missing/out-of-enum sentinel;
- enum choice at position `index` uses `choice:${index}`;
- tokens are reconstructed from the current immutable choice array and are
  never exposed as core operations;
- the domain string `""` maps to its ordinary positional token and is never
  confused with the sentinel.

The select renders one disabled sentinel option followed by choices in schema
order. The sentinel uses resolved placeholder text when present and an empty
text node otherwise. It represents missing and external out-of-enum values but
is not a clear action.

The confirmed presentation token is derived from the controlled snapshot:

- missing, a non-string value, or a string not found in choices maps to `''`;
- an exact string match maps to its `choice:<index>` token;
- reconciliation, initial rendering, locale changes, and external updates reset
  the private Signal Form model without emitting an intent.

On a native `change` event:

1. read the select token;
2. ignore the sentinel and any malformed or out-of-range token;
3. map a valid token back to the exact choice value;
4. emit that string through `setValue`.

The runtime suppresses a no-op operation if a synthetic event repeats the
already confirmed value. The renderer never emits `removeValue`, chooses a
default, trims, coerces, or corrects an external value.

The component reuses PLAN-005's semantic field structure, deterministic IDs,
label, description, hint, tooltip, issues, `aria-describedby`, `aria-invalid`,
`aria-required`, focus, blur, `focusBoundControl()`, and renderer-local reset
boundary. Option text comes only from `texts.choiceLabels`; renderers never call
`TextResolver`.

## 11. Diagnostics and deterministic order

This increment adds one diagnostic code and extends two existing families:

| Code                           | Severity | Source    | Owner                |
| ------------------------------ | -------- | --------- | -------------------- |
| `INVALID_SCHEMA_KEYWORD_VALUE` | error    | schema    | enum shape/elements  |
| `INCOMPATIBLE_SCHEMA_KEYWORD`  | error    | schema    | enum on other types  |
| `INVALID_UI_SCHEMA_VALUE`      | error    | ui-schema | enumLabels shape     |
| `INCOMPATIBLE_UI_OPTION`       | warning  | ui-schema | missing valid enum   |
| `UNKNOWN_ENUM_LABEL`           | warning  | ui-schema | label for no choice  |
| `INVALID_RUNTIME_OPTIONS`      | error    | runtime   | manual choices       |
| `TEXT_RESOLUTION_FAILED`       | warning  | runtime   | isolated choice text |

The compiler emits schema diagnostics first in schema traversal order, then UI
diagnostics in UI traversal order. Enum element diagnostics use ascending index.
Text diagnostics follow the projection order in section 8. Runtime creation
returns its existing first blocking option diagnostic and never invokes the
validator after malformed choices.

All diagnostic arrays, paths, parameters, and result wrappers remain frozen.
Fallback messages are English and never retain accessor functions, thrown
objects, or unsafe caller values.

## 12. Implementation sequence and file boundary

Implement in this order so every intermediate production change has a focused
test boundary:

1. Add neutral types and root exports in `packages/core/src/contracts.ts` and
   `packages/core/src/index.ts`.
2. Add enum keyword classification, descriptor-safe parsing, UI label parsing,
   choice construction, and compiler fixtures.
3. Extend runtime creation validation and operation boundary tests.
4. Extend text contracts and Angular choice projection with focused tests.
5. Add the native select component at
   `packages/angular/src/native/string-enum-renderer.ts` and its provider
   registration.
6. Add integration, accessibility, resolver, controlled-state, zoneless, and
   package-surface tests.
7. Run the full verification matrix, inspect declaration diffs, and update
   persistent project state.

Expected production files are limited to current core compiler/contracts/runtime
modules and current Angular text/native/provider/index modules, plus one new
internal select component file. Refactoring unrelated renderers or introducing a
generic plugin/control abstraction is outside scope.

## 13. Tests and conformance fixtures

### 13.1 Compiler conformance fixtures

Add JSON fixtures covering at least:

- `valid-string-enum` — order and default value labels;
- `valid-string-enum-labels` — complete and partial custom labels;
- `valid-string-enum-blank-values` — `""` and whitespace domain values with
  visible JSON-literal fallback;
- `warning-unknown-enum-label`;
- `warning-incompatible-enum-labels`;
- `error-enum-not-array`;
- `error-enum-empty`;
- `error-enum-non-string`;
- `error-enum-duplicate`;
- `error-enum-incompatible-type`;
- `error-enum-label-invalid`;
- `error-invalid-enum-with-labels` — schema error without a derived UI warning;
- `error-invalid-enum-with-invalid-labels` — schema error followed by the
  independent outer UI shape error.

Focused compiler tests cover sparse arrays, accessor indices, accessor labels,
multiple duplicate positions, exact string comparison, immutability, no input
mutation, and deterministic repeat compilation without executing getters. They
also cover missing/unsupported field types and schema-blocked enums to prove
that valid `enumLabels` objects do not create compatibility or member cascades.

### 13.2 Runtime and operation tests

- Accept a valid manually supplied non-empty frozen choices array.
- Reject empty, sparse, accessor, non-object, missing-member, non-string,
  duplicate-value, and blank-label choices.
- Prove no getter or external validator executes after malformed choices.
- Preserve the old diagnostic for an invalid base definition.
- Accept missing and external out-of-enum strings when the validator permits
  them.
- Prove `applyOperation()` and `applyFormOperation()` do not inspect choices and
  retain all PLAN-002 behavior.

### 13.3 Text projection tests

- Identity and custom resolution for every choice in enum order.
- Empty choice arrays for non-enum fields.
- Exact `choice` context with mutually exclusive `issue` member.
- Locale re-projection without renderer replacement.
- Exception, non-string, and blank results with source fallback and exact
  `choiceValue` diagnostics.
- Frozen arrays/snapshots and descriptor-safe own-member reads.

### 13.4 Resolver and native component tests

- Enum rank 20 beats generic string rank 10.
- Ordinary strings still resolve to `SchemaStringRendererComponent`.
- Consumer overrides follow rank/priority rules at both rank 10 and rank 20.
- Missing and out-of-enum controlled values select the disabled sentinel.
- First choice, later choice, empty-string choice, and whitespace choice map
  through internal tokens to exact domain strings.
- Initial render, external confirmation, rejection, locale change, and blur emit
  no unintended operation.
- User selection emits one controlled set intent and does not mutate the
  application model before confirmation.
- Placeholder sentinel, label association, descriptions, hints, tooltip,
  issues, focus, blur, IDs, `aria-describedby`, `aria-invalid`, and
  `aria-required` remain accessible.
- Standard and explicit zoneless TestBed configurations pass.
- Component destruction removes the Signal Forms binding and attached view.

### 13.5 Public package surface

- Core declarations export `StringChoiceDefinition` and the extended neutral
  contracts from the root entry point.
- Angular package smoke tests import
  `SchemaStringEnumRendererComponent` from the package name and assert that the
  export is the component class without directly invoking `new`.
- TestBed plus `AngularRendererResolver` performs component resolution and
  integration creation through the Angular runtime.
- Existing public exports remain present; internal registration and token
  helpers remain absent.
- Review generated declaration diffs for both packages; no new entry point,
  wildcard export, version, peer range, or publication setting appears.

All existing 140 tests remain passing in addition to the new coverage.

## 14. Documentation and milestone lifecycle

This approved plan keeps milestone M6 planned in ROADMAP without starting it.
The approval task completed these prerequisites before implementation:

- marked PLAN-006 Approved and promoted its exact normative contracts to
  SPEC-001 Draft v0.1.13;
- updated the SPEC index, STATUS, WORKLOG, and HANDOFF consistently;

When implementation actually begins:

- mark M6 active only when implementation actually begins;
- retain D-010, D-024's validator bridge, D-036, D-037, and every other
  deferred entry unchanged;
- do not reopen ADR-011 unless implementation reveals an actual conflict.

At completion, mark PLAN-006 and M6 completed only after all acceptance checks
pass. Do not duplicate present status in ROADMAP or historical details in
STATUS.

## 15. Tooling and acceptance

No dependency, version, peer range, test runner, or build-tool change is
expected. Acceptance commands:

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

- the core contains no Angular, RxJS, DOM, or browser-global import and still
  has zero runtime dependencies;
- adapter forms imports remain limited to `@angular/forms/signals`;
- no raw JSON Schema reaches a renderer or tester;
- no enum-membership validation appears in operations, runtime actions, Signal
  Forms, or the select renderer;
- getters in enum, enumLabels, and manual choices fixtures are never invoked;
- compiler and text diagnostic order is deterministic;
- generated outputs remain ignored;
- local Markdown links resolve and `git diff --check` passes;
- only the accepted ADR-011 scope enters production code and public
  declarations.

M6 is incomplete if malformed choices are accepted by runtime creation and
reach any renderer, the empty domain string collides with missing, a renderer interprets
raw schema, a choice label can be blank after fallback, user selection mutates
controlled state optimistically, external invalid data is corrected, operations
enforce enum membership, custom renderer precedence becomes ambiguous, or a
deferred capability enters the increment.

## 16. Explicit exclusions

- `const`, fixed/readonly/hidden presentation, and D-036.
- `format`, Format-Assertion, semantic date/email/URI controls, and D-037.
- Number, integer, boolean, null, mixed, object, and array enums.
- `oneOf`, per-subschema titles, composition, references, and nested schemas.
- Radios, segmented controls, autocomplete, multiselect, and cardinality
  heuristics.
- Clear buttons or selecting missing; D-010 remains Candidate.
- Defaults, coercion, trimming, normalization, and automatic correction.
- Angular validators, Signal Forms validation schemas, `ValidatorFn` bridges,
  and D-024.
- Dynamic definitions, optimistic state, async behavior, persistence, submit,
  styling systems, SSR-specific work, publication, and release automation.

## 17. Formal review checklist

Before approval, confirm:

1. String-only enum parsing and UI labels exactly match ADR-005/011 and do not
   activate `const`, `format`, composition, or other enum types.
2. Public contracts, immutability, entry points, and Experimental API status are
   complete and ADR-009 compliant.
3. Schema, UI, runtime, and text diagnostics have exact owners, paths,
   parameters, cascade rules, and deterministic order.
4. Descriptor-safe compiler/runtime/Angular reads never execute consumer
   accessors, and operations retain their minimum PLAN-002 boundary.
5. External validation and application-controlled state remain authoritative,
   including missing and out-of-enum external values.
6. Choice text fallback and the native select guarantee distinguishable,
   non-blank accessible options including the empty-string domain value.
7. Rank 20 specialization, rank 10 fallback, custom overrides, Signal Forms
   local state, and public Angular exports contain no remaining implementation
   choice.
8. Fixtures, package checks, full commands, exclusions, documentation promotion,
   and milestone transitions are complete.

## 18. Formal review outcome

The 2026-07-13 formal review passed all eight checklist areas with no remaining
finding:

1. **Scope:** The plan implements only ADR-011's string-enum path and retains
   D-010, D-024, D-036, D-037, non-string enums, composition, and alternate
   controls outside M6.
2. **Contracts and API:** The neutral choice/UI/text changes and the Angular
   component export are explicit, immutable, single-entry-point, Public +
   Experimental + Active changes.
3. **Diagnostics:** Element paths, UI cascade suppression, compatibility
   warning, runtime definition distinction, choice text reasons, and ordering
   are closed.
4. **Structural safety:** Descriptor ownership is assigned at compiler,
   runtime, operation, projector, tester, and renderer boundaries without
   executing accessors or broadening PLAN-002.
5. **Validation and control:** `SchemaValidator` and the application retain
   exclusive authority; missing and out-of-enum values remain observable and
   uncorrected.
6. **Text and accessibility:** Schema order, non-blank source/resolved fallback,
   the empty-string literal, sentinel presentation, and semantic field markup
   are deterministic.
7. **Angular specialization:** Token mapping, Signal Forms leaf ownership,
   ranks, priorities, fallback, lifecycle, and package exports are fully
   specified.
8. **Delivery:** The implementation order, fixtures, regression matrix,
   declaration review, verification commands, SPEC promotion, and M6 lifecycle
   are sufficient.

At the end of that review, PLAN-006 remained Proposed until explicit user
approval. The review itself authorized neither SPEC-001 v0.1.13 promotion nor
implementation.

## 19. Second formal review outcome

- **Date:** 2026-07-13
- **Result:** Revision required before approval.
- **State:** Proposed revision 0; no SPEC promotion or implementation is
  authorized.

The second review rechecked the plan against current compiler cascade behavior,
ADR-011 diagnostics, the Angular public surface, and current official Angular
22 Signal Forms documentation. Native `<select>` elements with dynamic options
are supported by `[formField]`, and `FormField` remains stable in Angular 22.
Three plan gaps remain.

### Required correction 1: enum availability and UI cascade suppression

Section 4 defines only `absent`, `valid`, and `invalid`, while section 5 emits
`INCOMPATIBLE_UI_OPTION` whenever no valid compatible enum exists. That rule
would also emit a derived UI warning after an invalid enum, an enum already
rejected on another field type, or a field whose type is missing/invalid. It
would conflict with the compiler's existing policy and focused test that skips
compatibility diagnostics below an invalid field-schema branch.

The revision must distinguish at least:

- a valid known field with no enum, which may produce
  `missing-compatible-enum` for a structurally valid `enumLabels`;
- a valid string enum, whose labels may be traversed;
- a schema-blocked enum or invalid field type, which must not produce a derived
  compatibility or unknown-label diagnostic.

It must also say whether independent outer `enumLabels` shape errors are still
reported on a blocked schema branch and lock the resulting diagnostic order.

### Required correction 2: complete choice text diagnostic contract

Section 8 defines the new `TEXT_RESOLUTION_FAILED` parameters but does not fix
its path or emission frequency, despite section 17 claiming that all paths and
ordering are exact. The revision must state:

- `dataPath` is a frozen copy of `field.path`;
- `documentPath` is absent;
- one warning is emitted for each failing choice in choice order on each text
  projection;
- the outlet forwards that projection's frozen diagnostic array once;
- locale or relevant identity changes may produce a new projection, while
  ordinary snapshot changes that do not change text identity do not.

### Required correction 3: public Angular component identity and smoke test

The plan exports a Public Angular component but leaves its selector and exact
module path to implementation. The selector is observable component metadata
and therefore part of the Experimental public surface. The phrase “import and
construct” in the package test is also ambiguous because Angular components
should not be instantiated directly with `new` when their construction may use
Angular context.

The revision must fix:

- selector `schema-string-enum-renderer`;
- implementation module
  `packages/angular/src/native/string-enum-renderer.ts`;
- a package smoke assertion that the class is exported from the package name;
- TestBed/resolver creation for component integration rather than direct class
  construction.

### Areas confirmed without findings

- ADR-011 scope and all deferred exclusions remain intact.
- Internal sentinel and `choice:<index>` tokens distinguish missing from the
  empty domain string.
- Runtime creation owns full manual-choice validation; operations and renderers
  do not validate enum membership.
- Rank 20 specialization, rank 10 fallback, and consumer priority rules match
  ADR-007.
- The private Signal Form leaf remains presentation state and does not replace
  application-controlled state.
- Fixtures, declaration review, dependency boundaries, and the full command
  matrix remain appropriate after the three corrections.

References rechecked:

- [Angular Signal Forms — select dropdowns](https://angular.dev/essentials/signal-forms#select-dropdowns)
- [Angular `FormField` API](https://angular.dev/api/forms/signals/FormField)

After applying the three corrections, repeat all eight checklist areas before
considering approval.

## 20. Revision 1 and repeated formal review

- **Date:** 2026-07-13
- **Result:** All three corrections were applied and the repeated eight-area
  review passed without a remaining finding.
- **State at review completion:** Proposed revision 1, pending explicit
  approval.

Corrections applied:

1. Field candidates now distinguish `absent`, `valid`, and `schema-blocked`
   enum states. Independent outer `enumLabels` shape errors remain visible,
   while missing/invalid field types and schema-blocked enums produce no derived
   compatibility or member diagnostics.
2. Choice text failures now fix severity, source, frozen `dataPath`, absent
   `documentPath`, one-warning-per-choice order, projection identity, and
   one-time forwarding per diagnostic batch.
3. The Public Angular component now fixes selector
   `schema-string-enum-renderer`, module
   `packages/angular/src/native/string-enum-renderer.ts`, package export smoke
   behavior, and TestBed/resolver integration creation.

Repeated review outcome:

1. **Scope:** Passes. Only ADR-011's string-enum increment is active in the
   proposed plan; all recorded exclusions remain deferred.
2. **Contracts and API:** Passes. Neutral contracts, component metadata,
   module, export, visibility, stability, and lifecycle are exact.
3. **Diagnostics:** Passes. Schema/UI cascade branches and choice text paths,
   frequency, order, fallback, and batch forwarding are deterministic.
4. **Structural safety:** Passes. Descriptor ownership remains explicit and no
   accessor execution or PLAN-002 expansion is introduced.
5. **Validation and control:** Passes. The external validator and consuming
   application remain authoritative for confirmed data and enum membership.
6. **Text and accessibility:** Passes. Source/resolved fallbacks, projection
   identity, empty-string choice, sentinel, and accessible markup are closed.
7. **Angular specialization:** Passes. Native select support, Signal Forms local
   state, tokens, ranks, overrides, selector, lifecycle, and creation path are
   complete.
8. **Delivery:** Passes. Fixtures cover cascade branches, package tests avoid
   direct construction, and implementation order, verification, SPEC promotion,
   and M6 lifecycle remain sufficient.

At that review point, PLAN-006 was ready for an explicit approval or revision
decision. The repeated review did not itself approve the plan, promote SPEC-001
v0.1.13, activate M6, or authorize implementation.

## 21. Approval result

- **Date:** 2026-07-13
- **Result:** Approved, revision 1.
- **Specification:** Exact normative contracts promoted to SPEC-001 Draft
  v0.1.13.
- **Milestone at approval:** M6 remained planned and inactive until
  implementation actually began.

The explicit approval authorizes implementation within this plan's reviewed
scope. It does not itself modify production code, activate deferred decisions,
publish packages, promote any API to Stable, or start M6.

## 22. Implementation start

- **Date:** 2026-07-13
- **Milestone:** M6 active.
- **Completed:** Step 1 neutral contracts, root export, and focused
  public-contract tests.
- **Next:** Step 2 compiler classification, descriptor-safe enum/UI parsing,
  immutable choices, fixtures, and cascade-suppression tests.

No deferred capability, compiler behavior, runtime validation, Angular code,
package version, publication setting, or API stability state changed in step 1.
