# ADR 037: Controlled linear declarative wizard and neutral step progress

- **State:** Accepted revision 0
- **Date:** 2026-08-04
- **Acceptance date:** 2026-08-04
- **Milestone:** M34 — Controlled linear declarative wizard
- **Promotes:** only the bounded D-011/D-012 architecture question accepted by
  Ricard after
  [review 327](../reviews/327-d011-d012-m34-declarative-wizard-promotion-readiness.md)
  cycle 8
- **Requires:** Accepted SPEC-001 v0.1.15, SPEC-003 v0.1.2, SPEC-008 v0.1.0,
  SPEC-009 v0.1.0, SPEC-012 v0.1.0 and SPEC-013 v0.1.1; Accepted ADR-009,
  ADR-010, ADR-023 revision 1, ADR-025 revision 0, ADR-029 revision 0 and
  ADR-030 revision 0
- **Complete review:** [Review 328](../reviews/328-adr-037-review.md) cycle 5
  passed all fifteen areas with zero findings after thirteen corrections
- **Authority:** Accepted M34 architecture only; preparation and complete
  review of SPEC-020 are authorized, but no plan, implementation, dependency,
  version, release, publication, commit, push or external mutation is authorized

## 1. Context

Schema Engine already normalizes static sections, tabs, accordions and logical
grids at the root and inside accepted nested-object and collection-item owners.
Applications can also create arbitrary `FormScope` values, request their
validation projection and reveal their issues. None of those contracts defines
ordered form progression.

Consumers therefore have to partition fields into steps, derive validation
scopes, coordinate application-controlled navigation, preserve inactive
renderer state and invent step indicators independently. Repeating that policy
in Angular, Standard and later React would create incompatible behavior.

M34 addresses only one linear navigation protocol. It is not a workflow,
router, persistence or submission engine. The application remains the only
source of truth for form data and the confirmed selected step. Core owns the
portable gate, immutable interaction history and neutral projection needed by
every target.

## 2. Decision summary

Accept one optional, root-only wizard as the sole presentation owner of a form.
It contains at least two static ordered steps. Each step owns a non-empty forest
of existing root presentation entries and therefore an exact derived
`FormScope`; every root form node occurs in exactly one step.

The first step is the only legal initial selection. Previous, next and complete
are explicit runtime requests. Previous and valid next requests emit immutable
application-facing intentions; the application confirms a navigation by
returning the exact request identity and target in controlled external state.
Complete emits a stateless intention and does not navigate or submit.

Core separately tracks ephemeral visited, attempted and passed markers. Step
validity remains factual and continuously projected. The neutral progress
indicator is derived from both without treating an untouched invalid step as
an error or a passed step as business completion.

## 3. Raw and normalized presentation grammar

### 3.1 Root-only raw grammar

The root UI contract adds these Public + Experimental shapes:

```ts
export type UiRootPresentationEntry = UiPresentationEntry | UiWizardSchema;

export interface UiWizardSchema {
  readonly kind: 'wizard';
  readonly id: string;
  readonly label: string;
  readonly steps: readonly UiWizardStepSchema[];
}

export interface UiWizardStepSchema {
  readonly kind: 'wizard-step';
  readonly id: string;
  readonly label: string;
  readonly children: readonly UiPresentationEntry[];
}
```

`UiSchema.presentation` widens only to
`readonly UiRootPresentationEntry[]`. Existing `UiPresentationEntry`, section,
panel, grid-item, object and item presentation types do not include a wizard.
This prevents nested wizard authoring in ordinary typed literals while the
compiler still defends every hostile/manual shape.

A wizard presentation is valid only when the root `presentation` array is
dense and contains exactly that one wizard. Its `id` is non-empty, its `label`
is non-blank and its `steps` array is dense with at least two entries. Every
step has exact kind `wizard-step`, a non-empty owner-local unique ID, a
non-blank label and a dense non-empty `children` forest.

Step children use the complete existing static root-entry grammar. Containers
may nest normally inside a step, but no wizard or wizard step may occur below a
step, section, panel, grid item, object forest, collection-item forest or other
wizard. Existing container IDs remain globally unique across the complete
wizard. Flattening every step in order must yield every root
`FormNodeDefinition` exactly once with no duplicate, omission or additional
name.

### 3.2 Normalized definitions and keys

The normalized root contract adds:

```ts
export type RootPresentationEntryDefinition =
  PresentationEntryDefinition | WizardDefinition;

export interface WizardDefinition {
  readonly kind: 'wizard';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly steps: readonly WizardStepDefinition[];
  readonly completionScope: FormScope;
}

export interface WizardStepDefinition {
  readonly kind: 'wizard-step';
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly children: readonly PresentationEntryDefinition[];
  readonly scope: FormScope;
}
```

`FormDefinition.presentation` widens to
`readonly RootPresentationEntryDefinition[]`. A normalized wizard form has a
single-element presentation array containing its wizard. A non-wizard form
retains its exact current `PresentationEntryDefinition[]` objects and behavior.

Keys and derived scope IDs are exact tagged JSON tuples:

```ts
wizard.key === JSON.stringify(['wizard', wizard.id]);
step.key === JSON.stringify(['wizard', wizard.id, 'step', step.id]);
step.scope.id ===
  JSON.stringify(['wizard', wizard.id, 'step', step.id, 'scope']);
wizard.completionScope.id ===
  JSON.stringify(['wizard', wizard.id, 'completion', 'scope']);
```

Normalized objects, arrays, copied targets and scopes are deeply frozen and
retain no raw caller wrapper. Wizard and step keys are disjoint from existing
presentation keys. The derived scope IDs are descriptive values; internal
wizard issue-reveal ownership uses a separate runtime namespace and can never
alias, overwrite or be removed by an application `FormScope` with an equal
string ID.

An invalid authored wizard emits the existing atomic
`INVALID_UI_PRESENTATION` warning and falls back to the existing non-wizard
default root forest. It never produces a partial wizard or hides a managed
node.

## 4. Derived step and completion scopes

Each step scope contains one `DataPath` for every direct root data node owned
by that step, in flattened presentation order. A root object path selects its
complete managed subtree and a root collection path selects the complete
collection. Core adds no positional item target, arbitrary caller path or new
`FormScopeTarget` kind.

Step scopes set `includeGlobalIssues` to `false`. The completion scope contains
the ordered concatenation of all step targets and sets
`includeGlobalIssues: true`. Exact-once root ownership makes this union dense
and duplicate-free. M33 active/inactive descendants retain their accepted
owner assignment; a wizard does not reinterpret branch selection or issue
paths.

The scopes are ordinary immutable `FormScope` values and may be passed to
existing validation APIs. They do not register, reserve or restrict any
application-authored scope. The runtime validates a manual wizard definition
by recomputing both target lists and requiring exact value/order equality.

## 5. Controlled selection and intention protocol

### 5.1 Initial and confirmed external state

Runtime options and external updates add:

```ts
export interface ControlledWizardState {
  readonly selectedStepId: string;
}

export interface WizardSelectionConfirmation {
  readonly requestId: number;
  readonly selectedStepId: string;
}

export interface ControlledFormRuntimeOptions<
  TData extends object,
> extends ControlledExternalState<TData> {
  // existing members remain exact
  readonly wizardState?: ControlledWizardState;
}

export interface ExternalStateUpdate<TData extends object> {
  // existing optional value, baselineValue and locale remain exact
  readonly wizardSelection?: WizardSelectionConfirmation;
}
```

A wizard definition requires `wizardState` at creation and accepts only the
first authored step ID. A non-wizard definition rejects supplied wizard state.
There is no initial deep link or resume. Runtime creation/recreation always
starts a wizard at its first step and resets all interaction markers.

Later selection changes occur only through `wizardSelection`. Its positive
safe-integer request ID and selected step ID must exactly match the latest
pending previous/next intention. An unsolicited, duplicate, stale, removed or
different target fails atomically and retains the pending intention and all
state. Omitting `wizardSelection` retains the confirmed step.

An update may atomically combine a valid confirmation with value, baseline or
locale members. All descriptors and values are validated first. The confirmed
step and supplied external state then enter one snapshot transition and one
validation pass. If the same update changes the just-passed step to invalid,
its retained passage history immediately projects error rather than completed.

### 5.2 Intention types and runtime surface

Core adds one separate synchronous channel:

```ts
export type WizardIntention =
  | {
      readonly kind: 'previous' | 'next';
      readonly requestId: number;
      readonly wizardKey: string;
      readonly fromStepId: string;
      readonly toStepId: string;
    }
  | {
      readonly kind: 'complete';
      readonly requestId: number;
      readonly wizardKey: string;
      readonly stepId: string;
    };

export type WizardIntentionListener = (intention: WizardIntention) => void;

export interface WizardActionResult {
  readonly success: boolean;
  readonly effects: {
    readonly snapshotChanged: boolean;
    readonly intentionEmitted: boolean;
  };
  readonly diagnostics: readonly Diagnostic[];
}
```

`FormRuntime` adds:

```ts
subscribeWizardIntentions(listener: WizardIntentionListener): SubscribeResult;
requestWizardPrevious(): WizardActionResult;
requestWizardNext(): WizardActionResult;
requestWizardComplete(): WizardActionResult;
rejectWizardIntention(requestId: number): WizardActionResult;
```

Wizard intentions never enter `subscribeOperations()` and do not widen
`FormOperation`. Their objects are detached and deeply frozen. Request IDs are
runtime-local, strictly increasing positive safe integers shared by all three
request kinds and never reused. Exhaustion fails closed without an intention or
state mutation.

`WizardActionResult.success` means that the runtime accepted and evaluated the
requested interaction. A validation-gate block is therefore successful with
`intentionEmitted: false` and may have `snapshotChanged: true`. Boundary,
pending-intention, malformed, stale, exhausted, non-wizard and disposed calls
fail with both effects false. An accepted exact rejection succeeds with
`intentionEmitted: false` and reports whether clearing pending state changed the
snapshot.

Only one previous/next intention may be pending. While it is pending, all
navigation requests are unavailable. Confirmation clears it; exact application
rejection through `rejectWizardIntention()` clears it without changing the
selected step or passage history. A wrong/stale rejection is an atomic failure.
Complete is never pending: ignoring it is the application's rejection, and a
later explicit complete request may emit another distinct intention.

## 6. Navigation gates and state transitions

Previous is available only outside the first step and has no validation gate.
It emits the immediately preceding target. Confirmation marks that target
visited but never records forward passage.

Next is available only before the last step. Every enabled, well-formed next
request that reaches the active gate marks the current step attempted. Core
projects synchronous issues through the current step's exact scope before
combining the accepted asynchronous state:

- without an async validator, scoped synchronous validity decides the gate;
- async `blocked: sync-invalid` permits `next` only when the current step's
  synchronous scope is valid, even though invalid future/global data prevents
  the whole-form async generation from starting;
- async `pending` or `failed` emits no intention;
- async `settled` requires the current composed scoped result to be valid;
- current-step synchronous invalidity emits no intention in every state;
- a blocked request reveals only the current step's derived scope through the
  wizard-owned visibility namespace; and
- a valid gate emits the immediately following target but does not change the
  selected step or mark passage until the application confirms it.

This current-step synchronous exception does not change public
`getValidationSnapshot()` semantics and does not infer remote success. It uses
the same accepted issue-to-scope assignment over the runtime's synchronous
issue set. It exists only so invalid unvisited future data cannot deadlock
linear entry before asynchronous validation is eligible to run.

Complete is available only on the last step. It marks the last step attempted
and checks the existing whole-form validation projection represented by the
completion scope. A failing gate marks every step attempted, reveals all step
targets plus global issues through exactly the one derived completion scope and
makes global issues eligible for wizard projection. A valid gate records
forward passage for the last step and emits one complete intention. It stores
no pending or wizard-completed flag.

No gate invokes validation, marks a field touched, changes the global
`ValidationVisibility`, suppresses inactive issues or automatically retries
async validation. A pending gate never auto-emits after settlement; the user
must make a new explicit request.

Disabled boundary controls, malformed/stale requests, an unresolved controlled
step and disposed-runtime calls never mutate visited, attempted or passed
history. Application rejection of an already valid intention reveals no new
issues.

## 7. Factual validation and neutral interaction progress

The root snapshot adds:

```ts
export type WizardStepValidationState =
  'valid' | 'provisional' | 'invalid' | 'pending' | 'failed';

export type WizardStepProgress =
  'unvisited' | 'visited' | 'error' | 'completed';

export interface WizardStepValidationSnapshot {
  readonly state: WizardStepValidationState;
  readonly synchronousValid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly asyncValidation?: AsyncValidationState;
}

export interface WizardStepSnapshot {
  readonly key: string;
  readonly id: string;
  readonly position: number;
  readonly current: boolean;
  readonly visited: boolean;
  readonly attempted: boolean;
  readonly passed: boolean;
  readonly progress: WizardStepProgress;
  readonly validation: WizardStepValidationSnapshot;
}

export interface WizardRuntimeSnapshot {
  readonly key: string;
  readonly selectedStepId: string;
  readonly steps: readonly WizardStepSnapshot[];
  readonly pendingIntention?: Extract<
    WizardIntention,
    { readonly kind: 'previous' | 'next' }
  >;
  readonly controls: {
    readonly previous: boolean;
    readonly next: boolean;
    readonly complete: boolean;
  };
  readonly completionAttempted: boolean;
  readonly showGlobalIssues: boolean;
}

export interface FormRuntimeSnapshot<TData extends object> {
  // existing members remain exact
  readonly wizard?: WizardRuntimeSnapshot;
}
```

Positions are one-based and match authored order. `current` is orthogonal to
progress. `controls.previous` is true exactly when the confirmed step is not
first and no navigation intention is pending; `controls.next` is true exactly
when it is not last and no navigation intention is pending; and
`controls.complete` is true exactly when it is last and no navigation intention
is pending. These booleans express positional requestability, not validity, so
an invalid step's forward control remains actionable and can record an attempt.

The first step starts `visited: true`; every other marker starts false. A
confirmed selection sets that step's visited marker. A confirmed next target
sets the departing step's passed marker. A valid complete request sets the last
step's passed marker.

Core derives factual validation state without target inference.
`synchronousValid` is the immutable result of assigning only synchronous issues
to that step's exact scope. Then:

- no async validator maps synchronous true/false to `valid`/`invalid`;
- async `blocked` maps a synchronously valid step to `provisional` and a
  synchronously invalid step to `invalid`;
- async `pending` maps to `pending`;
- async `failed` maps to `failed`; and
- async `settled` maps to `valid` only when the composed scoped result is valid,
  otherwise to `invalid`.

Progress precedence is exact:

1. `attempted` plus factual `invalid` projects `error`;
2. otherwise `passed` plus factual `valid` or `provisional` projects
   `completed`;
3. otherwise `visited` projects `visited`; and
4. otherwise it projects `unvisited`.

Provisional means only “synchronously valid and allowed through this linear
gate while whole-form async is not yet eligible”; it never permits complete.
Pending validation and technical async failure never masquerade as a data error
or completion. A previously completed step becomes `visited` while pending or
failed, `error` if it settles invalid and `completed` again if validity is
restored. Its passage marker is not erased. A whole-wizard completion attempt
may produce `error` with `visited: false`; this truthfully exposes the attempted
invalid step without claiming navigation occurred. A valid untouched step
remains `unvisited`.

`completionAttempted` becomes true on the first accepted complete gate request
that either blocks or successfully reserves an intention ID; an exhausted or
otherwise failed call is an atomic no-effect. It is never a submission-success
flag. `showGlobalIssues` becomes true only after a validation-blocked complete
gate and remains true for the runtime lifetime; it does not alter the root
global issue array. Async pending/failed completion feedback uses the normalized
validation state and never fabricates a global data issue.

## 8. Scheduling, structural sharing and lifecycle

Every accepted request follows one deterministic synchronous schedule:

1. validate runtime/action shape and resolve the confirmed step;
2. evaluate the gate without mutation;
3. for a valid intention, reserve its next request ID before mutating anything;
   exhaustion returns an atomic failure; for a blocked gate, no ID is needed;
4. mutate only the accepted ephemeral markers/visibility and, when valid,
   store the frozen intention;
5. build at most one structurally shared root snapshot;
6. notify snapshot listeners when that snapshot changed;
7. notify wizard-intention listeners when an intention exists; and
8. return the frozen action result with isolated listener diagnostics.

A listener receives the same frozen intention even if an earlier listener
re-enters the runtime to confirm or reject it. The re-entrant action has its own
later snapshot/action result and cannot alter the intention already being
delivered. Listener failures reuse `INVALID_LISTENER` and
`LISTENER_EXCEPTION` with channel `wizard-intention`, never stop sibling
listeners and never enter a snapshot.

An unconfirmed `next` intention is invalidated before any independent accepted
`value` identity change or explicit async retry starts a new validation
generation. That transition clears only the pending intention and produces no
passage; a later confirmation for its request ID is stale. A confirmation and
value change supplied together remain the one deliberate atomic exception
described in section 5.1. Baseline/locale-only updates and value no-effects
retain a pending previous/next intention. An unconfirmed `previous` intention
also survives an independent value update because it has no validation gate.

An unchanged factual/interaction projection reuses its step snapshot. A
pending-intention change replaces only the wizard/root snapshots. Value,
baseline, dirty, touched, collection identities, normalized definitions and
unchanged node snapshots retain their accepted sharing rules.

All step presentation subtrees are instantiated once for a wizard host and
remain mounted until that host is destroyed. Inactive steps are absent from
visual display, the accessibility tree and sequential focus but continue to
reconcile snapshots and retain renderer buffers plus nested tabs/accordion
state.

On confirmed navigation, core clears a focused marker owned by the departing
step without marking it touched or emitting an operation. It never restores a
field focus marker automatically. Each target moves DOM/native focus to the
new step heading after projection. Rejection retains the current focus.

Runtime disposal clears listeners, pending intention, visibility namespace and
all wizard markers, cancels no additional external work and silences later
requests/confirmations. Recreating the runtime restarts at the first step.

## 9. Target projection, accessibility and text

Angular and Standard consume only `WizardDefinition`,
`WizardRuntimeSnapshot` and the neutral request/subscription APIs. They never
inspect raw UI Schema, derive scopes, evaluate validation, combine markers into
progress, choose navigation targets or share a renderer/controller
implementation.

Wizard hosting is a root target responsibility, not a new configurable
presentation-container SPI. Angular native owns the wizard shell and delegates
step children through its existing outlets; an accepted Angular container kit
may still render tabs/accordions/grids inside steps. Standard builds its own DOM
host. M34 adds no UI dependency or renderer registration.

Both targets derive collision-free relationship bases only from normalized
identity:

```ts
wizardBase = `se-${encodeURIComponent(
  JSON.stringify([formId, 'presentation', 'wizard', wizard.id]),
)}`;

stepBase = `se-${encodeURIComponent(
  JSON.stringify([
    formId,
    'presentation',
    'wizard',
    wizard.id,
    'step',
    step.id,
  ]),
)}`;
```

The wizard base owns fixed `--wizard`, `--steps`, `--previous`, `--next` and
`--complete` suffixes. Each step base owns `--indicator`, `--heading`,
`--status` and `--region`. These tuples and suffixes are disjoint from existing
section/container/data-node identities and remain stable across runtime
snapshots.

The step indicator is an ordered, non-interactive list. It exposes position,
label, current step and the core-derived progress; it is never a tablist or a
direct step selector. The active step region is labelled by its heading.
Previous, next and complete are ordinary sequential controls with deterministic
disabled/boundary state. Confirmed navigation focuses the new heading. Gate
failure announces the current/complete issue summary without moving focus to a
hidden step.

`aria-current="step"` or the target-native equivalent represents only current
selection. Accessible status text distinguishes unvisited, visited, error and
completed without claiming persistence or submission. A separate supplementary
status distinguishes provisional, pending and failed additional validation so
`completed` never hides its factual validation qualification. Hidden steps
cannot own active DOM focus or accessible descendants.

Text resolution adds:

```ts
export type WizardTextMember =
  | 'label'
  | 'previous'
  | 'next'
  | 'complete'
  | 'position'
  | 'unvisited'
  | 'visited'
  | 'error'
  | 'completed'
  | 'provisional-validation'
  | 'pending-validation'
  | 'failed-validation';

export type WizardTextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly wizard: WizardDefinition;
      readonly step?: never;
      readonly member: 'label' | 'previous' | 'next' | 'complete';
      readonly position?: never;
      readonly count?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly wizard: WizardDefinition;
      readonly step: WizardStepDefinition;
      readonly member:
        | 'label'
        | 'unvisited'
        | 'visited'
        | 'error'
        | 'completed'
        | 'provisional-validation'
        | 'pending-validation'
        | 'failed-validation';
      readonly position?: never;
      readonly count?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly wizard: WizardDefinition;
      readonly step: WizardStepDefinition;
      readonly member: 'position';
      readonly position: number;
      readonly count: number;
    };
```

`TextResolutionContext` widens with this branch. Wizard and step `label` use
their authored source strings. Neutral control/status sources are exactly
`Previous`, `Next`, `Complete`, the already interpolated
`Step ${position} of ${count}`, `Not visited`, `Visited`, `Contains errors` and
`Completed`. Supplementary validation sources are exactly
`Additional validation not yet available`, `Additional validation in progress`
and `Additional validation failed`. Resolver failure reuses
`TEXT_RESOLUTION_FAILED` with safe wizard/step key, member and existing reason
semantics. Both targets must request the same contexts in wizard label, step
label/position/status and control order.

Resolution identity is deterministic: wizard label/control texts use
wizard+member+locale; step label/position uses step+member+position/count+locale;
progress status uses step+exact progress+locale; and supplementary validation
status uses step+exact validation state+locale. Unrelated snapshots reuse
resolved text. A changed locale, progress or validation state resolves only the
affected identities, and one failed identity emits its warning once per target
projection lifetime.

## 10. Descriptor safety, diagnostics and failure isolation

Raw wizard inspection is iterative and descriptor-safe. It reads own
enumerable data descriptors in member/source order, never invokes accessors,
iterators, coercion or callbacks, detects active cycles and applies the complete
root-forest fallback atomically. The later SPEC must freeze the new
`INVALID_UI_PRESENTATION` reasons, safe parameters, document paths, precedence
and fallback text without weakening existing section/container diagnostics.

Manual `FormDefinition` validation checks exact kinds, objects, arrays, keys,
identities, root-node ownership, scope IDs/targets/global flags and cycles
before validators, listeners or targets run. It reuses
`INVALID_FORM_DEFINITION` with closed wizard-specific reasons. No raw wrapper,
descriptor, prototype, thrown value or payload enters a diagnostic.

Runtime actions use closed families equivalent to:

- `INVALID_WIZARD_STATE` for malformed initial/confirmation state;
- `WIZARD_ACTION_UNAVAILABLE` for boundary, pending or non-wizard requests;
- `STALE_WIZARD_INTENTION` for mismatched confirmation/rejection;
- `WIZARD_REQUEST_EXHAUSTED` for request-ID exhaustion; and
- existing `RUNTIME_DISPOSED`, `INVALID_LISTENER` and `LISTENER_EXCEPTION`
  behavior with wizard action/channel names.

The extension SPEC must close exact members, reasons, safe parameters,
precedence and action effects. Expected consumer errors never throw or write to
console.

Target host creation uses `WIZARD_HOST_INSTANTIATION_FAILED` and
`WIZARD_STEP_HOST_INSTANTIATION_FAILED`, both `error`/`runtime`, without paths
or thrown values. Parameters identify only `wizardId` and optional `stepId`.
Wizard creation is atomic across its shell and every once-mounted step subtree:
the first failure destroys all partial wizard resources, emits exactly one
diagnostic for the failing host and suppresses the complete wizard projection
rather than exposing navigable partial steps. Independent outer target cleanup
continues normally. Later framework event failures remain outside this creation
boundary.

### 10.1 Required conformance ownership

The extension SPEC must define a frozen row matrix covering compiler and manual
definitions, runtime state/actions, Angular, Standard, reference evidence,
declarations/consumers and closure. At minimum it must prove:

- valid and descriptor-hostile root grammar, exact-once membership, atomic
  fallback, keys and recomputed immutable scopes;
- first-step initialization, previous/next confirmation/rejection, stale IDs,
  boundary/unavailable calls, request exhaustion and listener re-entry/failure;
- every visited/attempted/passed combination and progress precedence, including
  invalidation/restoration and whole-wizard attempt without false visitation;
- synchronous invalidity, blocked provisional advance, async pending/failed/
  settled gates, stale next invalidation and full-validity completion;
- issue reveal without touched/global-visibility mutation, structural sharing,
  focus clearing, once-mounted hidden state and disposal;
- exact declarations, exhaustive narrowing, package smoke, built/clean/source
  consumers, deep-import rejection and unchanged non-wizard behavior; and
- every explicit exclusion, frozen dependency graph and no version/release
  drift.

One deeply frozen shared reference scenario has at least three steps and covers
primitive fields, an existing static container, a nested object or collection,
one initially invalid future step and deterministic async states. Angular and
Standard independently prove the same intention/progress/validation sequence,
accessibility, hidden-focus exclusion, labels, rejected/later-confirmed
navigation, retained nested-container state, locale replacement, stale-event
defense and cleanup. Neither target nor the shared scenario owns runtime policy
or real network/persistence effects.

## 11. Public migration inventory

Under ADR-009, a future M34 SPEC may define only this migration surface:

| Classification         | Exact effect                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New Public core        | `UiRootPresentationEntry`, `UiWizardSchema`, `UiWizardStepSchema`, `RootPresentationEntryDefinition`, `WizardDefinition`, `WizardStepDefinition`, `ControlledWizardState`, `WizardSelectionConfirmation`, `WizardIntention`, `WizardIntentionListener`, `WizardActionResult`, `WizardStepValidationState`, `WizardStepProgress`, `WizardStepValidationSnapshot`, `WizardStepSnapshot`, `WizardRuntimeSnapshot`, `WizardTextMember` and `WizardTextResolutionContext`. |
| Changed Public core    | Root `UiSchema.presentation`; `FormDefinition.presentation`; `ControlledFormRuntimeOptions`; `ExternalStateUpdate`; `FormRuntimeSnapshot`; `TextResolutionContext`; and `FormRuntime` with one subscription plus four wizard methods.                                                                                                                                                                                                                                 |
| Changed Public Angular | Native root projection consumes the widened definition/snapshot and forwards the four neutral actions; existing primitive/container registration remains unchanged.                                                                                                                                                                                                                                                                                                   |
| Private Standard/apps  | Independent DOM projection and one shared scenario/evidence contract.                                                                                                                                                                                                                                                                                                                                                                                                 |
| Unchanged              | JSON Schema/value/baseline shapes, existing `UiPresentationEntry`, local forests, `FormScopeTarget`, validators, `FormOperation`, data-operation channel, packages, entry points, export maps and dependencies.                                                                                                                                                                                                                                                       |

Every new/widened export remains Public + Experimental + Active. Existing
non-wizard literals remain assignable because the new option/update/snapshot
members are optional. Exhaustive readers of root presentation and text context
must add a wizard branch. Exact declaration/package consumer examples are a
SPEC and plan gate.

## 12. Compatibility and delivery consequences

The decision centralizes portable scope/gate/progress behavior and prevents
framework drift. It adds core interaction state and a controlled-intention
protocol, while preserving application ownership of data, selection
confirmation and completion effects.

The widened Public Experimental unions and runtime surface require a
coordinated future MINOR under ADR-010. This ADR selects no version, package
range, dependency, candidate, tag, release or publication. An Accepted SPEC
and separately Approved plan are mandatory before implementation.

## 13. Alternatives considered

### Application-only wizard

Rejected because every framework would repeat scope derivation, validation
gates, progress precedence, lifecycle and accessibility.

### Reuse tabs

Rejected because tabs are target-local direct-selection containers with no
validation, controlled confirmation or completion semantics.

### Core-controlled optimistic navigation

Rejected because the application owns selected-step confirmation and may
reject an otherwise valid intention.

### Persist wizard progress in value or baseline

Rejected because navigation is not domain data and the accepted baseline is
only the dirty comparison authority.

### Let targets derive progress

Rejected because invalid/unvisited, async pending and completed/invalidation
precedence would drift across frameworks.

### Destroy inactive steps

Rejected because it loses renderer buffers and accepted target-local
tabs/accordion state and expands stale lifecycle behavior.

### Direct step selection or branching graph

Deferred because it requires skip, transition, conditional, resume and
workflow policy beyond the bounded linear protocol.

## 14. Explicit exclusions

ADR-037 does not activate:

- nested, object-local, collection-item, recursive, multiple or dynamic
  wizards;
- optional/empty steps, direct step selection, forward skipping, branching,
  loops, conditional transitions, workflow tasks, approvals or roles;
- router/deep-link synchronization, persisted selected step, saved wizard
  progress or cross-session resume;
- submit, HTTP, persistence, autosave, baseline commit, loading/success state,
  retry policy, optimistic navigation or rollback;
- automatic validation execution/retry, validator filtering, issue rewriting,
  conditional requiredness or inactive-step issue suppression;
- value mutation, defaults, clearing, batches, transactions, undo/redo or
  dynamic definition reconciliation;
- lazy mounting or destruction of inactive step subtrees;
- application-owned/persisted visited/attempted/passed markers or target-owned
  progress derivation;
- new scope-target kinds, caller-scope restrictions or collection-item scope
  generation;
- a configurable wizard renderer kit, shared Angular/Standard controller,
  design-system dependency or general theming;
- React, Vue, another Angular UI kit or legacy Angular; or
- Stable promotion, dependency/version/release selection, publication, SPEC,
  plan, implementation, commit, push or external action before later gates.

## 15. Required review and follow-up gate

Complete review must restart after every correction until one pass has zero
findings across:

1. promotion authority and exact M34/D-011/D-012 boundary;
2. root-only raw grammar and static exact-once ownership;
3. normalized identities, immutable scopes and manual definitions;
4. initial controlled state, request identity, confirmation and rejection;
5. sequential previous/next/complete gates and scheduling;
6. factual sync/async validation and issue reveal;
7. visited/attempted/passed storage and progress precedence;
8. snapshot structural sharing, focus, mounted lifetime and disposal;
9. adapter neutrality, independent target projection and failure isolation;
10. accessibility and deterministic text resolution;
11. diagnostics, descriptor safety and listener behavior;
12. application/workflow/baseline separation;
13. Public migration, compatibility and declaration sufficiency;
14. dependency/release/future-scope isolation; and
15. documentation, links, formatting and diff consistency.

Review 328 cycle 5 fulfilled this gate with zero findings after thirteen
corrections. Ricard accepted revision 0 on 4 August 2026. Acceptance authorizes
only preparation and complete review of SPEC-020; it does not authorize a plan,
implementation, dependency, version, release, publication, commit, push or
external mutation.
