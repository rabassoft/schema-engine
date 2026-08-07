# SPEC-020: Controlled Linear Declarative Wizard

- **State:** Accepted
- **Version:** 0.1.0
- **Date:** 4 August 2026
- **Acceptance date:** 4 August 2026
- **Milestone:** M34 — Controlled linear declarative wizard
- **Promoted capability:** bounded D-011/D-012 selected by review 327 cycle 8
- **Accepted architecture:** ADR-037 revision 0
- **Accepted baselines:** SPEC-001 v0.1.15, SPEC-003 v0.1.2, SPEC-008
  v0.1.0, SPEC-009 v0.1.0, SPEC-012 v0.1.0 and SPEC-013 v0.1.1
- **Complete review:** [Review 329](../reviews/329-spec-020-review.md) cycle 2
  passed all fifteen areas and 24 rows with zero findings after four corrections
- **Authority:** Accepted observable M34 contract; Approved PLAN-036 revision 0
  authorizes checkpoints 1–6, but no dependency, version, release, publication
  or Git action

## 1. Scope

This specification adds one optional root-only, linear, application-controlled
wizard over existing static root presentation entries. It defines exact raw and
normalized structures, derived scopes, controlled navigation intentions,
factual validation, neutral interaction progress, retained target lifecycle and
Angular/Standard conformance.

The application remains the only authority for `value`, `baselineValue`, the
confirmed selected step and completion effects. Core owns only normalized
wizard semantics, validation gates and runtime-local interaction history.

## 2. Public presentation contract

Core adds:

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

`UiSchema.presentation` becomes `readonly UiRootPresentationEntry[]` and
`FormDefinition.presentation` becomes
`readonly RootPresentationEntryDefinition[]`. Existing recursive
`UiPresentationEntry` and `PresentationEntryDefinition` unions remain exact and
cannot contain a wizard.

## 3. Authoring and normalization

A root presentation is either an ordinary existing forest or exactly one
wizard as its sole dense array member. The wizard has a non-empty ID, non-blank
label and a dense `steps` array of at least two entries. Each step has exact
kind `wizard-step`, a non-empty owner-local unique ID, non-blank label and dense
non-empty children.

Step children accept the existing root entry grammar. A wizard/step is invalid
inside another step, section, panel, grid item, nested-object forest,
collection/item forest or another wizard. Container IDs remain globally unique
through all steps. Depth-first flattening of step children must name every root
data node exactly once with no omission, duplicate or unknown name.

Inspection is iterative and own-data-descriptor-only. Sparse arrays, accessors,
hostile reflection, cycles, unknown structural keys, invalid kinds/members and
membership defects emit the first deterministic
`INVALID_UI_PRESENTATION` warning for their source position and atomically use
the existing default non-wizard forest. No partial wizard escapes.

Keys and scope IDs equal ADR-037 section 3.2's tagged JSON tuples. Every
normalized wrapper, children/steps array, scope and target is detached and
deeply frozen. Manual definitions must reproduce exact identities, ordering,
ownership and derived scopes or runtime creation fails before validation.

## 4. Scope derivation

Each step scope contains the exact root `DataPath` of every direct root node in
its flattened order and has `includeGlobalIssues: false`. The completion scope
concatenates all step targets in step order and has
`includeGlobalIssues: true`. No new `FormScopeTarget` exists.

Wizard visibility uses a runtime-internal identity independent from public
scope IDs. Equal application scope strings cannot reveal, overwrite or hide
wizard-owned visibility. Application scopes remain unrestricted.

## 5. Controlled state and intentions

Core adds:

```ts
export interface ControlledWizardState {
  readonly selectedStepId: string;
}

export interface WizardSelectionConfirmation {
  readonly requestId: number;
  readonly selectedStepId: string;
}

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

`ControlledFormRuntimeOptions` adds optional `wizardState`; a wizard requires
it and accepts only its first step ID. A non-wizard rejects it.
`ExternalStateUpdate` adds optional `wizardSelection`; it counts as update
content and may combine atomically with existing members.

`FormRuntime` adds the ADR-037 subscription and four wizard methods. Wizard
intentions are synchronous, detached/frozen and separate from operations.
Request IDs are runtime-local monotonically increasing positive safe integers.
Exhaustion is an atomic failure.

Only one previous/next intention may be pending. Exact ID/target confirmation
changes selection; exact rejection clears pending state. Mismatched, duplicate,
stale or unsolicited confirmation/rejection changes nothing. Complete is never
pending and may be emitted again only by another explicit request.

## 6. Navigation and scheduling

Previous targets only the immediately preceding step and is ungated. Next
targets only the immediately following step. Complete is requestable only on
the last step. While previous/next is pending, every navigation request is
unavailable. Step indicators are never direct-selection controls.

Next records a current-step attempt. It permits an intention when:

- no async validator exists and the synchronous step scope is valid;
- async is `blocked: sync-invalid` but that step's synchronous scope is valid;
  or
- async is settled and the composed step scope is valid.

Async pending/failed and current-step synchronous invalidity block next. A
blocked next reveals only its step scope. No automatic intention follows later
settlement.

Complete records a last-step attempt and requires the full completion scope to
be valid, including global and async validity. Failure marks every step
attempted, reveals exactly the completion scope and enables global issue/
technical-state presentation. Success marks last-step passage and emits one
stateless complete intention. It never submits or stores wizard completion.

An accepted request evaluates without mutation, reserves an ID for a valid
intention, mutates markers/pending state, builds at most one snapshot, notifies
snapshot listeners, then intention listeners, then returns. Listener exceptions
are isolated in result diagnostics. Re-entrant listeners still receive the
same original frozen intention.

An independent value identity change or explicit async retry invalidates a
pending gated next before revalidation; a pending previous remains. One atomic
confirmation+value update is allowed and may immediately invalidate the
passed step.

## 7. Snapshot and progress

Core adds:

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
```

`FormRuntimeSnapshot` adds optional `readonly wizard?: WizardRuntimeSnapshot`.

`WizardStepValidationState` is
`valid | provisional | invalid | pending | failed`.
`WizardStepValidationSnapshot` exposes `synchronousValid`, current scoped
issues and optional existing async state. `provisional` means only that the
step is synchronously valid while whole-form async is blocked by other
synchronous data.

The first step starts visited. Selection confirmation marks its target visited;
next confirmation marks the departing step passed; valid complete marks the
last step passed. Attempts and passage survive later data changes until runtime
disposal.

Progress precedence is:

1. attempted + invalid → `error`;
2. passed + valid/provisional → `completed`;
3. visited → `visited`;
4. otherwise → `unvisited`.

Pending/technical failure never claims data error or completion. A passed step
may transition completed → visited while pending/failed → error after invalid
settlement → completed after restoration without erasing passage. Current is
orthogonal to progress. A completion attempt may expose error on an unvisited
step without setting visited.

Control booleans express only position and absence of pending navigation, not
validity. `completionAttempted` excludes malformed/unavailable/exhausted calls.
`showGlobalIssues` becomes sticky only after validation-blocked complete.

## 8. State, validation and lifecycle invariants

Wizard actions never mutate value/baseline, dirty, touched, validation input,
collection identity, conditions, operation history or target-local container
state. Gates consume existing sync/async results and never invoke/retry a
validator.

Confirmed navigation clears departing-step field focus without marking touched
or emitting an operation. Targets focus the new step heading and never restore
field focus automatically.

Every step subtree mounts once and reconciles all snapshots. Inactive steps are
hidden from display, accessibility and sequential focus but retain renderer
buffers and tabs/accordion state. Disposal clears wizard listeners, pending,
visibility and markers; recreation starts at step one.

## 9. Text, accessibility and targets

Core adds the exact `WizardTextMember` union:

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
```

`WizardTextResolutionContext` is the exact ADR-037 discriminated union: wizard
label/controls forbid step/position/count; step label/progress/validation status
requires step and forbids position/count; position requires step plus positive
one-based position/count. `TextResolutionContext` widens with it. Authored
labels and ADR-037 section 9's exact fallback strings resolve by deterministic
wizard/step/member/state/locale identity. Failures reuse
`TEXT_RESOLUTION_FAILED` without retaining unsafe data.

Angular and Standard independently use the exact normalized definitions,
snapshots and action channel. Neither reads raw UI Schema, derives scopes,
evaluates validation or derives progress. Wizard hosting is native root target
behavior, not a configurable container SPI or dependency.

Both targets use ADR-037's exact encoded wizard/step relationship bases and
suffixes. The indicator is an ordered non-interactive list with current,
position, progress and supplementary validation state. The active labelled
region owns the once-mounted step subtree; inactive regions are hidden.
Controls and issue summaries are keyboard/screen-reader operable, confirmed
navigation focuses the heading and gate failure never focuses hidden content.

Wizard/step host creation is atomic. First failure destroys partial wizard
resources, emits exactly one normalized target diagnostic and suppresses the
whole partial projection.

## 10. Diagnostics

Compiler defects remain `INVALID_UI_PRESENTATION`/`warning`/`compiler` and use
atomic fallback. Existing envelope, path and first-failure rules remain exact.
Wizard-specific reasons are closed to `wizard-not-sole-root`,
`invalid-wizard-exterior`, `invalid-wizard-kind`, `invalid-wizard-id`,
`invalid-wizard-label`, `invalid-wizard-steps`, `invalid-wizard-step-exterior`,
`invalid-wizard-step-kind`, `invalid-wizard-step-id`,
`duplicate-wizard-step-id`, `invalid-wizard-step-label`,
`invalid-wizard-step-children`, `wizard-cycle` and
`invalid-wizard-membership`. Missing/accessor/sparse/unknown-member detail uses
the existing reason and path vocabulary rather than a duplicate family.

New safe parameters are limited to `ownerKind: 'wizard' | 'wizard-step'`,
`member`, `wizardId`, `stepIndex`, `stepId`, `index` and `nodeName` only when the
corresponding primitive was safely copied. No wrapper/value/descriptor is
retained.

Manual-definition defects remain `INVALID_FORM_DEFINITION`/`error`/`runtime`.
Its new detailed reasons are exactly `invalid-wizard`, `invalid-wizard-step`,
`invalid-wizard-key`, `invalid-wizard-scope` and
`invalid-wizard-membership`; the existing locator carries safe presentation,
step/member and target indexes. First defect prevents validator/listener/target
execution.

Runtime uses exactly `INVALID_WIZARD_STATE`, `WIZARD_ACTION_UNAVAILABLE`,
`STALE_WIZARD_INTENTION`, `WIZARD_REQUEST_EXHAUSTED`, existing
`RUNTIME_DISPOSED`, and existing listener codes with channel
`wizard-intention`. Parameters contain only action/member, safe reason,
request/step/wizard IDs when safely copied, and safe actual descriptions. Their
closed parameter contracts are:

| Code                        | Exact parameters       |
| --------------------------- | ---------------------- |
| `INVALID_WIZARD_STATE`      | `member: 'wizardState' | 'selectedStepId'                           | 'wizardSelection'                      | 'requestId'`; `reason: 'missing-member'                         | 'accessor-member' | 'invalid-value' | 'not-applicable'    | 'unexpected-initial-step'`; optional safe actual description |
| `WIZARD_ACTION_UNAVAILABLE` | `action: 'previous'    | 'next'                                     | 'complete'`; `reason: 'not-configured' | 'at-first-step'                                                 | 'at-last-step'    | 'not-last-step' | 'intention-pending' | 'step-unresolved'`                                           |
| `STALE_WIZARD_INTENTION`    | `action: 'confirm'     | 'reject'`; `reason: 'no-pending-intention' | 'request-mismatch'                     | 'target-mismatch'`; optional safe `requestId`, `selectedStepId` |
| `WIZARD_REQUEST_EXHAUSTED`  | `action: 'previous'    | 'next'                                     | 'complete'`                            |

Targets use exactly `WIZARD_HOST_INSTANTIATION_FAILED` or
`WIZARD_STEP_HOST_INSTANTIATION_FAILED`, `error`/`runtime`, no path/thrown value
and exactly `{ wizardId }` or `{ wizardId, stepId }`. Expected consumer errors
never throw or write to console. Fallbacks are exactly `Wizard host could not
be instantiated.` and `Wizard step host could not be instantiated.`.

## 11. Migration inventory

The exact Public inventory is ADR-037 section 11: eighteen new core exports;
widened root presentation, options/update/snapshot/text/runtime surfaces; native
Angular projection; private Standard/reference work; and unchanged schema/data/
baseline, local presentation, scopes, validators, operations, packages, entry
points and dependencies.

All changes are Public + Experimental + Active. Ordinary non-wizard literals
and behavior remain compatible; exhaustive root-presentation/text/runtime
readers require narrowing. A future coordinated MINOR is required but no
version or release is selected.

## 12. Conformance matrix

A future plan maps each row exactly once:

1. Public raw/normalized declarations and ordinary literal compatibility;
2. valid root-only grammar, at least two steps and exact-once membership;
3. descriptor/accessor/sparse/cycle/unknown-key and atomic fallback matrices;
4. normalized keys, immutability and exact step/completion scopes;
5. manual definition and scope-recomputation failures;
6. initial first-step state and non-wizard option/update preservation;
7. intention subscription, immutability, order and listener isolation;
8. previous/next/complete boundaries and positional controls;
9. pending identity, confirmation, rejection and stale/duplicate defenses;
10. request exhaustion and action-result effects;
11. synchronous invalid/valid next gates and issue reveal;
12. blocked provisional, pending, failed and settled async next gates;
13. complete whole-form/global/async gate and repeated stateless intentions;
14. visited/attempted/passed combinations and progress precedence;
15. completed invalidation/pending/failure/restoration transitions;
16. whole-completion attempt without false visitation;
17. value/baseline/dirty/touched/operation/validation invariants;
18. sharing, focus clearing, once-mounted hidden state and disposal;
19. text identity/fallback/failure and supplementary validation accessibility;
20. target host identity, atomic failure and cleanup;
21. shared frozen three-step primitive/container/nested-or-collection scenario;
22. independent Angular/Standard unit and Chromium equivalence;
23. declarations, package smoke, built/clean/source consumers and deep-import
    rejection; and
24. complete regression, boundaries, docs, frozen graph and no release drift.

## 13. Exclusions and acceptance

Nested/item/multiple/dynamic wizards, direct selection, skipping, branching,
conditional transitions, resume/deep links, persisted progress, workflow,
submit/HTTP/save/baseline commit, automatic validation/retry, value mutation,
lazy mounting, new scope targets, target-owned progress, configurable wizard
renderer kits, React/Vue/legacy Angular, dependencies, version/release/
publication and Stable promotion remain excluded.

Review 329 cycle 2 passed the Accepted ADR, all exact contracts and all 24
conformance rows with zero findings after four corrections. Ricard accepted
SPEC-020 v0.1.0 on 4 August 2026. Ricard separately Approved PLAN-036 revision 0
after review 330 cycle 3, authorizing checkpoints 1–6. Commit, push and external
actions remain separately gated.

## 14. History

| Version | Date       | Change                                    |
| ------- | ---------- | ----------------------------------------- |
| 0.1.0   | 04-08-2026 | Accepted after review 329 cycle 2 passed. |
