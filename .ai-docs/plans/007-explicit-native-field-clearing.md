# PLAN-007: Explicit native field clearing

- **Status:** Completed
- **Date:** 2026-07-14
- **Approval date:** 2026-07-14
- **Completion date:** 2026-07-14
- **Review revision:** 2
- **Review state:** Second-review correction applied; explicitly approved;
  implementation and final zero-finding review completed
- **Requires:** [`SPEC-001` v0.1.15](../specs/001-controlled-form-runtime.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-012` revision 1](../adrs/012-limpieza-explicita-campos.md),
  [completed PLAN-005](./005-native-html-renderers.md), and
  [completed PLAN-006](./006-string-enum-native-select.md)
- **Milestone:** M7 — Explicit native field clearing

## 1. Goal and completion boundary

Implement ADR-012 end to end in the four native Angular renderers:

```text
confirmed value -> visible localized Clear button
               -> focusBoundControl()
               -> removeValue
               -> existing requestRemoveValue(path)
               -> existing remove-value operation
```

The action distinguishes missing from every confirmed value, including `""`,
`0`, negative zero, `false`, out-of-enum strings, and values incompatible with
the renderer. Required fields retain the same action because validation remains
the external validator's responsibility.

M7 does not add a core operation, runtime action, UI Schema option, reset,
default application, confirmation, persistence, permissions, null/tristate,
new touched policy, generic action system, icon, theme, or Stable API.

This plan is approved after a zero-finding repeated formal review. Implementation
starts only through the separately recorded M7 task and remains limited to this
delivery contract.

## 2. Reviewed current state and conflict check

The implementation already provides the required controlled path:

- core exposes strict `remove-value` operations and
  `requestRemoveValue(path)`;
- `AngularFieldRenderer`, the outlet, and all four native components already
  expose or bind the `removeValue` output;
- the number renderer emits that output when a present numeric input is emptied;
- every native renderer has a private Angular Signal Form leaf and a
  `focus()` method backed by `focusBoundControl()`;
- text projection is outside core snapshots and reprojects by field, snapshot,
  form ID, and locale identity;
- `FieldIds` already owns deterministic IDs for the control and descriptive
  content.

Expected implementation gaps are limited to these points:

- `FieldTextMember` has no `clear` branch;
- `AngularFieldTextSnapshot` has no required `clearLabel`;
- `FieldIds` has no label or clear-action ID;
- visible labels have no own ID;
- string, boolean, and enum renderers cannot explicitly request missing;
- no native renderer displays a shared clear action.

No accepted SPEC, ADR, completed plan, implementation contract, or deferred
boundary conflicts with ADR-012. PLAN-007 must stop rather than reinterpret an
accepted contract if review or implementation discovers a contradiction.

## 3. Public Experimental contract change

Extend the existing neutral union exported by `@rabassoft/schema-engine`:

```ts
export type FieldTextMember =
  | 'label'
  | 'description'
  | 'hint'
  | 'tooltip'
  | 'placeholder'
  | 'clear'
  | 'choice'
  | 'issue';
```

The existing common `TextResolutionContext` branch uses
`Exclude<FieldTextMember, 'choice' | 'issue'>`, so `member: 'clear'` receives
the ordinary field context without a new context shape.

Extend the existing Angular snapshot exported by
`@rabassoft/schema-engine-angular`:

```ts
export interface AngularFieldTextSnapshot {
  // existing members remain unchanged
  readonly clearLabel: string;
}
```

Both changes remain Public + Experimental + Active under ADR-009. No export,
entry point, provider, package manifest, or stability classification changes.
The required snapshot member is intentionally source-incompatible for manual
snapshot construction; package smoke, declaration inspection, tests, and M7
migration notes must expose that requirement. Custom renderers receive the
member but are not required to present a clear action.

## 4. Clear text projection and diagnostics

`AngularTextProjector` resolves source text `Clear` once per projection using
`member: 'clear'`, after the optional common field texts and before choices and
issues. The exact resolution order is:

1. label;
2. description, hint, tooltip, and placeholder when present;
3. clear;
4. choices in normalized order;
5. issues in snapshot order.

The resolved value becomes the required, frozen, non-blank `clearLabel`.
Successful non-blank strings are preserved as opaque text. Exception,
non-string result, or blank string falls back to `Clear` and adds exactly one
warning for that projection:

```ts
{
  code: 'TEXT_RESOLUTION_FAILED',
  severity: 'warning',
  source: 'runtime',
  dataPath: Object.freeze([...field.path]),
  parameters: Object.freeze({
    field: field.name,
    member: 'clear',
    reason: 'exception' | 'non-string-result' | 'blank-string-result',
  }),
  fallbackMessage: `Text resolution failed for field "${field.name}".`,
}
```

The diagnostic object, path, and parameters are frozen and it has no
`documentPath`. Locale and any existing projection input change re-resolve
`clearLabel`; render, reprojection, diagnostic forwarding, and lifecycle emit no
value operation. Every test helper or empty snapshot factory must add frozen
`clearLabel: 'Clear'` rather than weakening the public member to optional.

## 5. Deterministic IDs and accessible action

Extend private `FieldIds` with:

```ts
readonly label: string;
readonly clear: string;
```

For the existing encoded base `se-<formId>-<fieldKey>`, use
`<base>-label` and `<base>-clear`. Every visible field label receives
`[id]="ids().label"`; every clear button uses:

```html
<button
  type="button"
  [id]="ids().clear"
  [attr.aria-labelledby]="ids().clear + ' ' + ids().label"
>
  {{ texts().clearLabel }}
</button>
```

`aria-labelledby` references the clear action first and field label second, so
its accessible name is equivalent to localized `Clear <field label>`. IDs are
not interpolated. Tests must cover non-blank names, reference order, unique IDs,
encoded form/field identifiers, and multiple fields in the same form.

This is a private common markup policy, not a new public renderer capability.
Implementation may share a small private predicate or ID helper, but must not
introduce a generic action component, registry, plugin contract, or styling
system.

## 6. Native action and focus ordering

Each native component renders its button only when
`snapshot().presence.kind === 'value'`. Missing renders no action, so it cannot
emit removal through the UI.

One component handler implements the exact activation order:

```ts
protected onClear(): void {
  this.controlField().focusBoundControl();
  this.removeValue.emit();
}
```

The focus request precedes the output because a consuming application may
synchronously confirm missing and remove the button. In an environment where
the field control is not bound, Angular's `focusBoundControl()` is a no-op;
lack of focus must not be used as a condition for the domain output. The handler
emits exactly once per native button activation by pointer or keyboard and does
not itself emit synthetic `fieldFocus` or `fieldBlur` events.

Real control focus and blur continue to drive runtime interaction. A synchronous
confirmation, rejection, external reconciliation, or destruction must not
leave the runtime snapshot with `focused: true` when no field element owns
focus. Tests must observe both DOM focus and emitted interaction/operation
order, without adding a touched action or optimistic cleanup.

Outlet destruction needs one narrow lifecycle reconciliation because removing a
focused native control does not guarantee a usable native blur notification.
The outlet tracks the field path and runtime-context identity associated with
the current `ComponentRef`. Immediately before detaching that component, it
requests `blur(boundPath)` only when all of these conditions hold:

1. the parent runtime context is still the exact context that created the
   component;
2. the matching current field snapshot exists and reports `focused: true`;
3. the component is still attached.

This represents the real loss of the bound focused control and uses the
existing runtime blur semantics, including touched. It emits no blur when the
field was not focused, when the previous runtime has already been replaced or
disposed, or on repeated destruction. It must not route an old field path into
a new runtime. No renderer input, output, method, DOM query, or public contract
is added for this reconciliation.

The same captured binding identity governs every output callback created for
that `ComponentRef`. `setValue`, `removeValue`, `fieldFocus`, and `fieldBlur`
forward to the path captured when the renderer was created; they must not read
the current reactive `schemaFieldOutlet().path` at event time. Consequently, an
old renderer event that races with a field-input change can affect only its old
bound path and can never mutate interaction or emit an operation for the new
field. Before forwarding, every callback also requires the current runtime
context to be identical to its captured context; a callback from a component
whose runtime was replaced becomes a no-op even if the old path also exists in
the new definition. The outlet marks the captured binding inactive before focus
cleanup and detach, so outputs emitted during destruction are also no-ops. A new
component receives a new active captured path and runtime context. The outlet
still recreates the component when either field identity or runtime context
changes, and no public binding shape changes.

## 7. Controlled-state behavior

The action only communicates intent:

- before external confirmation, the input/select and snapshot retain the
  confirmed value and the button remains available;
- synchronous or later confirmation to missing reconciles the private control
  buffer and removes the button without a second operation;
- rejection keeps the confirmed value and button available;
- an external transition to missing removes the button without emitting;
- an external value transition shows the button without emitting;
- locale, text, validation, visibility, render, reconciliation, and lifecycle
  changes never emit removal.

The application remains the only source of truth for `value` and
`baselineValue`. The action neither applies its operation nor changes dirty,
touched, focused, valid, or issue state directly.

## 8. Type-specific behavior

### 8.1 String input

- A confirmed empty string is present and displays the action.
- Typing an empty string continues to emit `set-value` with `""`; it is not
  reinterpreted as missing.
- Clearing an incompatible external value still emits the existing removal
  intent without coercion.

### 8.2 Number and integer inputs

- Confirmed `0`, negative zero, and any other present external value display
  the action.
- Emptying the text input retains its existing removal path.
- A single input event or button activation emits exactly once; the additional
  button must not duplicate the input-empty emission.
- Invalid local numeric text and blur reconciliation retain PLAN-005 behavior.

### 8.3 Boolean input

- Confirmed `false` is present, remains distinct from missing, and displays the
  action.
- Clearing never maps to `false`; checkbox changes retain their existing
  `set-value` behavior.

### 8.4 String enum select

- Ordinary choices, the domain choice `""`, and confirmed out-of-enum or
  incompatible external values display the action.
- The disabled empty sentinel remains an internal presentation token and never
  becomes a choice or clear action.
- Clearing emits no selection and selects no fallback/default choice.

Required and optional fields follow the same rules in all four components.
Required removal may produce an issue only after the external application
confirms missing and its validator reports that issue.

## 9. Implementation sequence and file boundary

Implement the smallest independently verifiable steps in this order:

1. **Neutral text contract:** add `clear` to `FieldTextMember`; update focused
   type/public-entry tests without changing operations or runtime.
2. **Angular text projection:** add required `clearLabel`, exact source,
   fallback, diagnostic, ordering, freezing, and helper snapshots; verify
   identity and locale behavior.
3. **Private native common boundary:** add deterministic label/clear IDs and the
   minimum shared presence/association helpers needed by templates.
4. **Four native renderers:** add label IDs, conditional buttons, and the exact
   focus-before-output handler; preserve every existing Signal Forms buffer and
   input/select event path.
5. **Controlled integration:** cover synchronous confirmation, rejection,
   reconciliation, real focus/blur, destruction, standard and zoneless setup,
   resolver/outlet forwarding through captured component paths, same-runtime
   outlet focus reconciliation, and multiple-field accessibility.
6. **Package and completion:** update migration-facing tests and declarations,
   run the full verification matrix, review the final diff, and close M7 only
   when every check passes.

Expected production files are limited to:

- `packages/core/src/contracts.ts`;
- `packages/angular/src/text.ts`;
- `packages/angular/src/field-outlet.directive.ts`;
- `packages/angular/src/native/common.ts`;
- `packages/angular/src/native/string-renderer.ts`;
- `packages/angular/src/native/number-renderer.ts`;
- `packages/angular/src/native/boolean-renderer.ts`;
- `packages/angular/src/native/string-enum-renderer.ts`.

Tests, package smoke/consumer fixtures, generated declarations, and project
state documentation may change as required. Core runtime, operations,
compiler, validator policy, package exports, manifests, dependencies, lockfile,
and publication settings are outside the expected diff; any need to change
them stops the implementation for review.

## 10. Required tests and evidence

### 10.1 Contracts and text

- `FieldTextMember` and common `TextResolutionContext` accept `clear` through
  the public core entry point.
- Angular public entry-point consumers must provide `clearLabel`.
- Identity and custom resolvers receive exact source `Clear`, field context,
  locale, and `member: 'clear'` in deterministic order.
- Exception, non-string, and blank results produce the exact single diagnostic,
  immutable path/parameters, no document path, and `Clear` fallback.
- Snapshots, choice/issue arrays, and diagnostics remain frozen.

### 10.2 Renderer behavior

- Each renderer covers present, missing, required, optional, falsy, invalid or
  incompatible confirmed values as applicable.
- Pointer click and keyboard activation each emit one removal operation.
- Focus is requested before the output; real focus/blur and touched behavior
  remain coherent after synchronous confirmation, rejection, and destruction.
- Same-runtime outlet removal or field replacement blurs the previously bound
  focused path exactly once before detach; an unfocused field, repeated
  destruction, or runtime replacement emits no stale blur into the new runtime.
- Every output from a renderer being replaced remains bound to its captured old
  path; a racing set, remove, focus, or blur cannot target the incoming field.
- After runtime replacement, all outputs from the old component are ignored,
  including when its captured path is also valid in the new runtime.
- Outputs emitted during component destruction are ignored after binding
  deactivation and cannot re-focus, touch, set, or remove any field.
- Number input-empty and explicit-button paths do not duplicate one another.
- Enum sentinel and empty-string domain choice remain distinct.
- Initial render, external reconciliation, locale/text/issue changes, and
  destruction emit no removal.

### 10.3 Controlled integration and accessibility

- The outlet forwards one `removeValue` to one existing runtime request.
- Outlet set/remove/focus/blur callbacks capture the field path at component
  creation, verify their captured runtime identity, and never resolve a
  replacement field path at event time.
- Immediate confirmation removes the action and reconciles the buffer; rejection
  preserves both without optimistic state.
- Multiple fields produce unique control, label, descriptive, issue, and clear
  IDs with correct associations.
- The clear accessible name is non-blank and resolves in action-label then
  field-label order in standard and zoneless TestBed setups.
- Custom renderer creation and existing renderer override behavior remain
  unchanged; custom presentation of `clearLabel` is optional.
- Destroying a custom or native renderer through the outlet applies the same
  private focus reconciliation without expanding `AngularFieldRenderer`.

### 10.4 Regression and package evidence

- The existing 176-test baseline passes before counting new focused tests.
- Core remains framework/DOM/browser independent and has zero runtime
  dependencies.
- Angular Forms imports remain limited to `@angular/forms/signals`.
- Root package smoke and built-package consumer tests cover the required
  snapshot member and observable native behavior without private imports.
- Emitted declarations show only the accepted Experimental contract changes.

## 11. Verification commands and diff checks

Run, in order:

```sh
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
git diff --check
```

Also verify:

- all Markdown links and referenced repository paths resolve;
- no direct Angular, RxJS, DOM, or browser import entered core;
- no unexpected Angular Forms import, dependency, export map, entry point,
  version, publication setting, or lockfile change exists;
- declaration diff contains `FieldTextMember: 'clear'` and required
  `AngularFieldTextSnapshot.clearLabel`, but no unapproved public symbol;
- `remove-value`, runtime request, outlet forwarding, and custom renderer
  contracts were reused rather than duplicated;
- outlet focus cleanup is limited to the same bound runtime identity and never
  sends an old path to a replacement runtime;
- all output forwarding remains pinned to the path captured by the emitting
  `ComponentRef`, including during field and runtime identity transitions;
- the final scoped diff contains no deferred capability or product change
  outside Section 9.

Verification failure keeps M7 active and incomplete. It must be resolved or
documented as a blocker; it cannot be waived by changing STATUS alone.

## 12. Documentation and milestone lifecycle

Plan drafting leaves M7 planned and inactive. Explicit approval authorizes a
later implementation task, which must first mark the exact current step in
STATUS. Approval alone changes no product code and does not promote any API to
Stable.

On successful implementation completion:

- mark PLAN-007 Completed with dates and final evidence;
- mark M7 completed in ROADMAP;
- compact STATUS to no active task and the next selected milestone action;
- prepend one WORKLOG entry with implementation and verification outcomes;
- update SPEC/ADR/deferred documents only if an accepted behavior or decision
  state actually changes.

## 13. Explicit exclusions

- New core operations, runtime actions, validation, or schema normalization.
- Form/scope/baseline reset, defaults, undo/redo, confirmation, batching, or
  persistence.
- UI Schema visibility/configuration, permissions, icons, design systems,
  styling APIs, or tooltips for the action.
- Null, boolean tristate, nested values, arrays, compositions, or async work.
- Generic renderer actions, custom-renderer requirements, or ADR-007 capability
  negotiation.
- New touched/dirty semantics, synthetic focus events, or optimistic state.
- Dependency, package-entry, version, license, registry, provenance,
  publication, or Stable API changes.

## 14. Formal review checklist

Review the entire plan against these eight areas before approval:

1. **Scope:** only ADR-012/M7 is active and every exclusion remains inactive.
2. **Core reuse:** `remove-value` and `requestRemoveValue()` are reused without
   a new domain contract.
3. **Presence and validation:** missing, falsy, invalid, optional, and required
   behavior preserves external-validator authority.
4. **Controlled flow:** confirmation, rejection, reconciliation, and lifecycle
   have no optimistic or duplicate operation path.
5. **Focus and accessibility:** order, real interaction state, IDs, accessible
   name, pointer, keyboard, destruction, and multiple fields are deterministic.
6. **Localization:** source, context, order, fallback, exact diagnostics,
   reprojection, immutability, and forwarding are complete.
7. **Public API:** the two Experimental extensions, migration evidence,
   declarations, package surface, and custom-renderer boundary match ADR-009.
8. **Delivery:** sequence, file boundary, focused/regression tests, commands,
   documentation lifecycle, and stop conditions are sufficient.

Passing review does not itself approve the plan. Record findings, apply any
required corrections, repeat all eight areas, and obtain Ricard's explicit
approval before implementation begins.

## 15. Proposal state

- **Result:** Drafted as Proposed on 2026-07-14.
- **Implementation at proposal:** Not started and not authorized.
- **Gate result:** Revision 2 was explicitly approved after the second repeated
  review passed without findings.

## 16. Revision 1 and repeated formal review

- **Date:** 2026-07-14
- **Initial result:** Two corrections required before the plan could be ready
  for approval.
- **Repeated result:** All eight review areas pass after correction.
- **State:** Proposed revision 1; explicit approval pending.

Corrections applied:

1. The exact `TEXT_RESOLUTION_FAILED` shape now retains source `runtime`,
   `field.name`, frozen data, absent `documentPath`, and the existing stable
   fallback message.
2. The delivery boundary now covers same-runtime outlet destruction and field
   replacement: it reconciles a previously bound focused path exactly once
   before detach, while runtime replacement/disposal cannot blur a new runtime
   through a stale path.

Repeated review outcome:

1. **Scope:** Passes. Only ADR-012/M7 is active; reset, defaults, null,
   persistence, generic actions, UI configuration, and all other deferred work
   remain excluded.
2. **Core reuse:** Passes. The plan reuses `remove-value`,
   `requestRemoveValue()`, the Angular output, and outlet forwarding without a
   core operation, runtime action, or renderer capability change.
3. **Presence and validation:** Passes. Missing, every present falsy or
   incompatible value, required fields, and external-validator authority are
   unambiguous.
4. **Controlled flow:** Passes. Confirmation, rejection, reconciliation,
   numeric input-empty behavior, render, locale, and lifecycle have no
   optimistic or duplicate removal path.
5. **Focus and accessibility:** Passes after correction. Focus precedes the
   removal output; pointer, keyboard, real focus/blur, touched, same-runtime
   destruction, replacement-runtime isolation, deterministic IDs, and
   accessible-name order have an implementation and test boundary.
6. **Localization:** Passes after correction. Source, context, order, non-blank
   fallback, complete diagnostic shape, reprojection identity, immutability,
   and one-batch forwarding are fixed.
7. **Public API:** Passes. Only the two accepted Public + Experimental + Active
   text extensions change; manual snapshot migration, declarations, package
   surface, and optional custom-renderer presentation are covered.
8. **Delivery:** Passes. The six steps, exact production boundary, focused and
   regression evidence, commands, documentation lifecycle, and stop conditions
   are sufficient.

The repeated review does not approve PLAN-007 or authorize implementation.
Ricard's explicit approval remains the next gate.

## 17. Revision 2 and second independent review

- **Date:** 2026-07-14
- **Initial result:** One lifecycle race required correction.
- **Repeated result:** All eight review areas pass after correction.
- **State:** Proposed revision 2; explicit approval pending.

Finding and correction:

- The current outlet output bindings resolve `schemaFieldOutlet().path` at event
  time. During a field-identity transition, an event from the old renderer could
  therefore target the incoming field. Revision 2 pins all four intent outputs
  and focus cleanup to the path and runtime identity captured for the emitting
  `ComponentRef`. Replacement creates a fresh binding identity; stale paths
  never cross into a new component or runtime.

Second repeated review outcome:

1. **Scope:** Passes. Captured private outlet identity closes an M7 lifecycle
   race and introduces no deferred feature or public abstraction.
2. **Core reuse:** Passes. Operations, runtime requests, expectations, and
   strict application remain unchanged.
3. **Presence and validation:** Passes. The clear action is driven only by
   confirmed presence and leaves required validation external.
4. **Controlled flow:** Passes after correction. Each renderer output targets
   exactly its bound field, while confirmation, rejection, reconciliation,
   replacement, locale, and lifecycle create no optimistic or duplicate
   removal.
5. **Focus and accessibility:** Passes. Focus precedes removal; actual events,
   same-runtime detach, replacement-runtime isolation, pointer, keyboard, IDs,
   associations, and accessible-name order are deterministic.
6. **Localization:** Passes. `Clear`, member context, projection order,
   non-blank fallback, full frozen diagnostics, identity, and forwarding remain
   exact.
7. **Public API:** Passes. Only `FieldTextMember: 'clear'` and required
   `clearLabel` change the Experimental surface; outlet identity tracking is
   Internal.
8. **Delivery:** Passes. The production boundary already includes the outlet;
   race-focused tests, declarations, package/consumer checks, commands, and
   stop conditions are complete.

This second review does not approve PLAN-007 or authorize M7 implementation.
Explicit approval of revision 2 remains required.

## 18. Approval and implementation start

- **Date:** 2026-07-14
- **Approval:** Ricard explicitly approved PLAN-007 revision 2 after the second
  corrected review completed with zero findings.
- **Implementation:** M7 is active, beginning with the neutral and Angular text
  contract step.

Approval authorizes only the six implementation steps and file boundary in this
plan. It does not publish packages, promote APIs to Stable, or activate another
deferred capability.

## 19. Implementation completion and final review

- **Date:** 2026-07-14
- **Result:** Completed; all six steps and the final repeated review passed.
- **Milestone:** M7 completed.

Implemented outcomes:

1. `FieldTextMember` includes `clear`, and the public Angular text snapshot has
   required non-blank `clearLabel` with source `Clear`.
2. Exception, non-string, and blank clear resolutions use the exact frozen
   `TEXT_RESOLUTION_FAILED` fallback contract.
3. All four native renderers expose a presence-driven accessible clear button,
   focus the bound control before emitting, and preserve controlled rejection
   and confirmation.
4. Deterministic label/clear IDs and action-field `aria-labelledby` order cover
   multiple fields and localized text.
5. Outlet callbacks capture path/runtime identity, deactivate before destroy,
   reconcile same-runtime focused detach, and ignore stale or destruction-time
   outputs.
6. Required, falsy, incompatible, enum sentinel, numeric empty-input, locale,
   lifecycle, package, declaration, and built-consumer behavior are covered.

Final verification passed after correcting the only lint finding and then
repeating the complete matrix without findings:

- frozen installation with unchanged lockfile;
- formatting, lint, typecheck, 129 core + 50 Angular tests;
- both package builds, package smoke, and built-package consumer;
- declarations, root exports, dependency/package boundaries, core isolation,
  Angular Signal Forms imports, Markdown links, and diff integrity.

No dependency, manifest, export map, entry point, version, publication setting,
or Stable API status changed.
