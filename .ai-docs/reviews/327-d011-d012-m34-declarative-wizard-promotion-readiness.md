# D-011/D-012 M34 declarative-wizard promotion readiness — Cycles 1–8

- **Date:** 2026-08-04
- **State:** Complete; recommendation ready for selection, no capability
  promoted and no ADR reserved
- **Scope:** One root-only, statically declared, application-controlled linear
  wizard with neutral interaction progress over existing normalized
  presentation and `FormScope` contracts
- **Authority reviewed:** Accepted SPEC-001 v0.1.15, SPEC-003 v0.1.2,
  SPEC-008 v0.1.0, SPEC-009 v0.1.0, SPEC-012 v0.1.0, SPEC-013 v0.1.1,
  ADR-023 revision 1, ADR-025 revision 0, ADR-029 revision 0 and ADR-030
  revision 0; completed M1–M33/G0; Deferred D-011 and D-012
- **Outcome:** Cycle 1 found three navigation/gate ambiguities. Cycle 2 found
  two lifecycle/accessibility contradictions. Cycle 3 found one controlled
  confirmation gap. Cycle 4 found one whole-form completion gap. After
  correction, cycle 5 found one scope-projection ambiguity. After correction,
  cycle 6 repeated all sixteen areas with zero findings. Before selection,
  Ricard required neutral visited/attempted/completed context; the refined
  recommendation entered a new complete review. Cycle 7 found three progress-
  projection ambiguities. After correction, cycle 8 repeated all sixteen areas
  with zero findings. The refined recommendation is ready for selection.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R327-F01 | Distinguished a validation-gate block from application rejection of a valid intention; only the former reveals the current step scope.                              |
| R327-F02 | Closed M34 to sequential previous/next controls and a non-interactive step indicator; direct step selection cannot be introduced by ADR-037.                        |
| R327-F03 | Defined completion as a repeatable stateless intention per accepted user request; core stores no completed flag and the application owns deduplication/idempotency. |

Cycle 1 cannot support selection. Cycle 2 restarts all sixteen review areas
after the corrections.

## Cycle 2 findings and corrections

| Finding  | Correction                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R327-F04 | Replaced the mounted-versus-destroyed choice with mandatory once-mounted step subtrees so confirmed navigation cannot discard nested tabs/accordion state or renderer buffers. |
| R327-F05 | Removed “completed step” accessibility semantics because core stores no completed flag; targets expose only ordered position and the current step.                             |

Cycle 2 cannot support selection. Cycle 3 restarts all sixteen review areas
after the corrections.

## Cycle 3 finding and correction

| Finding  | Correction                                                                                                                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R327-F06 | Required the first authored step initially and limited every later controlled step update to confirmation of the exact latest pending previous/next intention, preventing application injection from bypassing linear navigation. |

Cycle 3 cannot support selection. Cycle 4 restarts all sixteen review areas
after the correction.

## Cycle 4 finding and correction

| Finding  | Correction                                                                                                                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R327-F07 | Split navigation validation correctly: next uses only the current step scope without global issues, while complete requires whole-form validity and reveals all wizard scopes plus global issues when blocked. |

Cycle 4 cannot support selection. Cycle 5 restarts all sixteen review areas
after the correction.

## Cycle 5 finding and correction

| Finding  | Correction                                                                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R327-F08 | Replaced the ambiguous “all scopes plus globals” reveal with one derived immutable completion scope that unions all step targets and sets `includeGlobalIssues: true`, reusing the existing scope APIs exactly. |

Cycle 5 cannot support selection. Cycle 6 restarts all sixteen review areas
after the correction.

## Owner refinement before selection

Ricard requires wizard indicators to distinguish factual validation from
interaction progress. An invalid step that has never been visited must remain
visually unvisited. Its error state becomes eligible for presentation only
after the user attempts to advance from that step or after final completion
checks the complete wizard. A step that successfully advances must expose
completed progress while it remains factually valid.

This refinement does not promote M34. It replaces cycle 6 as the candidate
boundary and requires another complete zero-finding review before selection.

## Cycle 7 findings and corrections

| Finding  | Correction                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R327-F09 | Replaced the contradictory rule that every unvisited step masks errors with explicit precedence: only an unvisited and unattempted step must remain neutral; a whole-wizard completion attempt may expose an invalid step without falsely marking it visited. |
| R327-F10 | Made current selection orthogonal to the neutral progress indicator so a current step can truthfully remain unvisited, visited, error-presentable or completed without overloading one mutually exclusive state.                                              |
| R327-F11 | Limited interaction-marker mutation to an enabled, well-formed forward request that reaches the active wizard validation gate; disabled, stale, malformed, unresolved and disposed-runtime requests cannot fabricate progress.                                |

Cycle 7 cannot support selection. Cycle 8 restarts all sixteen review areas
after the corrections and records zero findings in section 10.

## 1. Product sequence and consumer value

Ricard selected the sequence M32 compound conditions, M33 discriminated object
alternatives, M34 declarative wizard behavior and then the first React adapter.
M32 and M33 are complete, so M34 is the next gated capability; that sequence
does not itself promote D-011 or D-012.

Applications already can construct `FormScope` values and manually orchestrate
validation, issue visibility and partial baseline candidates. Presentation can
already group every root node through sections, tabs, accordions and grids.
What is missing is one portable metadata contract that connects an ordered
step, its managed scope and a controlled navigation intention without forcing
each Angular, Standard and future framework consumer to invent incompatible
wizard semantics.

The useful increment is not a workflow engine. It is a linear form-navigation
protocol: metadata defines static steps, core derives neutral step state and
validation gates, the application remains authoritative for the selected step
and completion handling, and targets only project snapshots and intentions.

## 2. Exact recommended boundary

The next ADR may design only this closed M34 capability:

1. exactly one wizard is the sole root presentation owner for one form;
2. the wizard contains at least two dense, ordered, statically labelled steps
   with unique non-blank IDs;
3. every step contains a dense, non-empty forest of the already accepted root
   presentation entries; every root `FormNodeDefinition` occurs exactly once
   across the complete wizard after flattening existing containers;
4. a wizard and its steps cannot occur below a section, panel, grid item,
   nested-object forest, collection template/item forest or another wizard;
5. each step exposes one deeply immutable neutral scope derived only from its
   exact root data-node ownership, using the existing `FormScope` and
   `FormScopeTarget` domain without arbitrary caller paths or per-item metadata;
   ordinary step scopes exclude global issues. The wizard also exposes one
   immutable completion scope containing the ordered union of all step targets
   with `includeGlobalIssues: true`;
6. the first authored step is the only valid initial selected step. The
   application supplies the selected step ID as controlled external state;
   core never advances it optimistically and emits at most one immutable
   previous, next or complete intention for the application to accept or
   reject. A later selected-step change is valid only when it confirms the
   exact target of the latest pending previous/next intention;
7. previous is sequential and never validation-gated; next is sequential,
   complete is available only at the last step, and the step indicator is not
   a direct-selection control;
8. next uses the current step's existing scoped validation result and reveals
   only that scope when blocked. Complete requires whole-form validity,
   including global issues and every step, and reveals the wizard completion
   scope when blocked. Neither emits an intention while its gate is invalid,
   async validation is blocked/pending/failed or the runtime cannot resolve
   the controlled step;
9. every step subtree is instantiated once and retained for the wizard host's
   lifetime; inactive steps are hidden from visual display, accessibility and
   sequential focus. A confirmed step change affects only wizard projection
   and focus reconciliation and preserves renderer buffers and nested
   presentation-container state. It does not change value, baseline, dirty,
   touched, validation input or collection identity;
10. core owns ephemeral wizard interaction markers, separate from form data:
    the first step is visited initially; a step becomes visited when its
    selection is confirmed; a forward attempt is recorded only for an enabled,
    well-formed next/complete request that reaches the active wizard validation
    gate; and forward passage is recorded only when a next target is confirmed
    or a valid last-step complete intention is emitted. Disabled, stale,
    malformed, unresolved and disposed-runtime requests do not change these
    markers;
11. every step snapshot keeps factual validation separate from interaction and
    exposes current selection orthogonally to its neutral progress indicator. A
    step with neither visited nor attempted history remains visually unvisited
    regardless of factual invalidity. An attempted step with factual invalidity
    becomes error-presentable even when a whole-wizard completion attempt did
    not visit it. A passed step is completed only while it remains factually
    valid; later invalidation changes it to error, and later restoration derives
    completed again from retained passage. A valid, untouched step merely
    covered by a whole-wizard completion attempt is not falsely labelled
    visited or completed;
12. a next gate failure marks only the current step attempted and reveals only
    its scope. A completion gate failure marks every wizard step attempted and
    reveals the completion scope, so every invalid step and global failure can
    be represented without claiming that an untouched step was visited;
13. complete is only an application-facing stateless intention emitted once
    per accepted user request. Core stores no wizard-completed flag;
    repetition, deduplication and idempotency belong to the application. The
    derived completed step indicator is interaction progress, not submission
    success. Complete does not submit, persist, call HTTP, commit a baseline,
    mark data saved or dispose the form;
14. Angular and Standard consume only normalized wizard definitions/snapshots
    and forward neutral intentions. They never derive scopes, inspect raw UI
    Schema, combine validation/progress into indicator policy, evaluate
    validity or own navigation policy; and
15. existing forms with no wizard preserve exact definitions, snapshots,
    lifecycle, operations, scopes, rendering and package behavior.

The terms `wizard`, `step`, `previous`, `next` and `complete` describe the
behavioral boundary. This review does not select final Public symbol/member or
diagnostic names.

## 3. Existing authority and deliberate extension

M34 deliberately promotes only the smallest overlap of D-011 and D-012:

- SPEC-001's application-defined scopes remain valid; M34 adds compiler-derived
  scopes only for accepted wizard steps and does not register or restrict
  caller-created scopes.
- SPEC-003's closed `FormScopeTarget` union remains unchanged. A root node path
  continues to select its managed subtree/current collection; no positional
  numeric or generated stable-item target is authored by wizard metadata.
- SPEC-008/ADR-023 target-local tabs and accordion state remain unchanged.
  Wizard state is controlled because navigation and completion are observable
  application decisions, unlike ephemeral presentation toggles.
- SPEC-009/ADR-025 local object/item forests remain static and cannot own a
  wizard or generate a scope.
- SPEC-012/ADR-029 scoped validation remains false while async validation is
  blocked, pending or failed. M34 consumes that result and never starts,
  cancels, retries or interprets asynchronous work.
- SPEC-013/ADR-030 baseline confirmation remains a separate pure application
  action. A step never commits or claims persistence automatically.

No existing Accepted document currently defines controlled wizard navigation.
An Accepted M34 ADR and later extension SPEC would be required before any
Public contract or implementation changes.

## 4. Architecture questions reserved for the next ADR

If Ricard selects this recommendation, ADR-037 must close at least:

1. exact raw UI Schema, normalized definition, controlled external-state,
   snapshot and intention shapes without weakening ordinary literal
   assignability;
2. descriptor-safe exterior/step/children inspection, unique namespaces,
   deterministic normalization and atomic fallback;
3. exact step/completion scope ID namespace, root-node-to-target derivation,
   union/deduplication ordering, ordinary `includeGlobalIssues: false`, the
   completion scope's required `includeGlobalIssues: true` and interaction with
   M33 active/inactive nodes;
4. first-step initialization, exact pending-intention identity/target,
   confirmation, rejection, duplicate/stale intention and unsolicited,
   invalid or removed selected-ID behavior;
5. exact ephemeral visited/attempted/passed storage; current selection as an
   orthogonal dimension; unvisited, visited, error-presentable and completed
   projection precedence; later external invalidation/restoration; structural
   sharing; and runtime recreation/disposal reset;
6. precise synchronous and asynchronous validation gate, issue-reveal timing,
   all-step attempt on completion failure, listener ordering and one-snapshot/
   one-intention schedule;
7. exact previous/next/complete availability at boundaries and the
   non-interactive step-indicator accessibility model, with all direct step
   selection excluded from M34;
8. focus clearing/restoration, touched preservation and action safety when a
   step becomes inactive;
9. mandatory once-mounted inactive subtree retention, hidden/focus projection,
   stale target events, renderer buffers, locale changes and definition
   replacement boundary;
10. accessibility semantics for ordered step position, current, unvisited,
    visited, error and completed interaction state, controls, live feedback and
    keyboard order without claiming submission/business completion;
11. runtime and target failure diagnostics, safe parameters, precedence,
    cascade suppression and disposal;
12. Angular container-SPI impact and independent native Angular/Standard
    projection without a shared renderer/controller implementation;
13. migration for exhaustive Public Experimental readers and a separately
    gated coordinated MINOR release; and
14. conformance ownership across compiler/manual definitions, runtime,
    Angular, Standard, shared scenarios, declarations/consumers and closure.

ADR-037 must not assume that the final public name is `WizardDefinition` or
that controlled/interaction state belongs inside the existing value/baseline
update object.

## 5. Material alternatives considered

| Alternative                                                  | Assessment                                                                                                                                | Outcome                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Keep steps entirely application-authored                     | Preserves current authority but duplicates metadata-to-scope mapping, validation gates and accessibility across every consumer/framework. | Insufficient as M34.             |
| Reuse target-local tabs as a wizard                          | Cannot provide portable validation gating or completion intentions and makes navigation semantics framework-owned.                        | Rejected.                        |
| Let core autonomously advance and submit                     | Conflicts with controlled application ownership and introduces persistence/workflow authority.                                            | Rejected.                        |
| Declare static steps but expose scopes only                  | Improves metadata reuse but leaves selected-step state, gating and intentions incompatible across targets.                                | Deferred as an incomplete slice. |
| Application-controlled linear wizard with neutral intentions | Adds useful portable behavior while preserving value, baseline, persistence and completion authority in the application.                  | Recommended.                     |
| Let each target infer visited/error/completed indicators     | Produces framework drift and can conflate factual invalidity with issue visibility or submission success.                                 | Rejected.                        |
| Destroy inactive step subtrees                               | Reduces mounted resources but discards renderer buffers and nested target-local container state and expands stale lifecycle semantics.    | Rejected for M34.                |
| Branching/conditional workflow graph                         | Requires expression, transition, task, side-effect, recovery and persistence contracts beyond form navigation.                            | Deferred.                        |

## 6. Validation, completion and workflow separation

Step validity is not a new validator mode. Core continues validating the exact
complete schema/value. Next obtains the current step result through its
existing `FormScope` projection without global issues. Complete uses existing
whole-form validity so an earlier step invalidated by external data or a global
issue cannot be bypassed. A blocked next reveals only its current step; a
blocked complete reveals the derived completion scope, whose paths are the
ordered union of every step target and whose `includeGlobalIssues` is true.
Neither marks fields touched, alters global validation visibility, clears data
or runs validation itself. Application rejection of a valid navigation
intention has no issue-visibility effect.

Factual validation is continuously available for every step, including
inactive and unvisited steps. Indicator policy is separately derived by core:
an unvisited and unattempted step masks an error marker; a failed forward
attempt exposes factual invalidity; a confirmed forward passage plus current
validity derives completed; and later external invalidation replaces completed
with error without erasing the historical passage marker. Current selection is
orthogonal to that projection. Completion-gate failure marks every step
attempted because the user has explicitly tried to finish the whole wizard,
but it does not claim that an untouched step was visited or completed. A valid
untouched step therefore remains neutral, while an invalid attempted step may
be error-presentable.

The last-step `complete` intention means only “the current controlled form
passed the bounded navigation gate”. Core emits it once for each accepted user
request and records only the last step's passed interaction marker, not wizard,
submission or business completion. The application may ignore, deduplicate or
handle it by persisting, submitting, routing, calling a service or performing a
business transition outside Schema Engine. Success or failure of those actions
never changes wizard state or baseline unless the application separately
confirms state through an accepted API.

No step owns save status, permissions, tasks, approvals, retries, server state,
business predicates or side effects. Those remain workflow concerns.

## 7. Target and reference boundary

M34 requires one deeply frozen shared reference scenario with at least three
steps covering primitive fields, an existing static presentation container, a
collection or nested object and one async-validation state. Angular and
Standard must independently prove:

- the same controlled initial, previous, next, rejected-next and complete
  intention sequence;
- current/unvisited/visited/error/completed indicator transitions,
  accessibility, inactive-step focus exclusion and deterministic control
  labels;
- issue reveal without touched mutation;
- an earlier-step and global issue blocking final completion with the derived
  completion scope revealed;
- pending/settled async gating;
- application rejection and later confirmation of a navigation intention;
- a completed step becoming invalid and returning to completed when factual
  validity is restored without erasing its passage marker;
- stale event defense, locale replacement and lifecycle cleanup; and
- unchanged existing tabs/accordion state inside every retained step across
  confirmed navigation.

The scenario may simulate application confirmation and completion evidence but
must not add persistence, HTTP, router or framework store ownership to core or
the adapters.

## 8. Compatibility and delivery boundary

The likely contract adds Public + Experimental definition/snapshot/intention
shapes and widens presentation/external-state readers. Existing non-wizard
object literals and runtime behavior must remain compatible, while exhaustive
readers may require narrowing under ADR-009/ADR-010. Exact declarations,
package smoke, built/clean/source consumers and independent targets are
mandatory before implementation can complete.

No dependency, peer range, entry point, export map, manifest, lockfile,
package version, release or publication is selected or authorized. Published
M23 artifacts remain unchanged. React, Vue and UI-kit expansion remain later
gates.

## 9. Explicit exclusions

M34 does not activate:

- nested, local-object, collection-item or recursive wizards;
- more than one wizard per form, optional/empty steps or dynamically changing
  step definitions;
- branching, skipping forward, conditional steps, loops, arbitrary transition
  graphs, workflow tasks, approvals or roles;
- arbitrary application injection of an initial/later step, forward resume or
  confirmation of any target except the latest pending intention;
- direct URL/router synchronization, deep links, persistence of the selected
  step or cross-session resume;
- per-step save, automatic `commitScopeToBaseline()`, submit, HTTP, loading,
  success/error state, retries, optimistic navigation or rollback;
- lazy step creation, destruction of inactive step subtrees or persisted wizard
  progress;
- step-local validation execution, validator filtering, issue rewriting,
  conditional requiredness or suppression of inactive-step issues;
- value mutation, defaulting, clearing, batching, transactions, undo/redo or
  dynamic `FormDefinition` reconciliation;
- application-owned or persisted visited/attempted/passed markers, target-owned
  indicator derivation or treating completed as submission success;
- new `FormScopeTarget` kinds, caller-scope restriction or collection-item
  scope generation;
- root/item alternatives beyond completed M33, broader D-011/D-012, D-013,
  D-021, D-026, D-031, D-035 or D-045;
- React, Vue, another Angular UI kit or legacy Angular; or
- ADR/SPEC/plan drafting before selection, implementation, dependency,
  version, release, publication, commit, push or external mutation.

## 10. Complete promotion review

| Area                            | Result | Evidence                                                                                                                                                                          |
| ------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Accepted authority           | Pass   | The recommendation preserves Accepted controlled value/baseline, scope, validation and presentation boundaries while explicitly limiting promotion to D-011/D-012 wizard overlap. |
| 2. Consumer value               | Pass   | Portable navigation gains truthful unvisited/visited/error/completed context without becoming workflow.                                                                           |
| 3. Static grammar               | Pass   | The boundary is one root-only linear wizard with at least two complete non-empty steps and exact-once root nodes.                                                                 |
| 4. Scope derivation             | Pass   | Step scopes plus one ordered all-target/global completion scope reuse the existing closed scope-target domain and preserve caller scopes.                                         |
| 5. Controlled ownership         | Pass   | Application confirmation and core-owned ephemeral progress remain separate from form/application data.                                                                            |
| 6. Navigation semantics         | Pass   | Sequential intentions and visited/attempted/passed transitions are bounded, deterministic and non-optimistic.                                                                     |
| 7. Validation/async gate        | Pass   | Factual validation, issue reveal and derived indicators stay distinct under synchronous and asynchronous transitions.                                                             |
| 8. State invariants             | Pass   | Progress cannot alter value, baseline, dirty, touched, container state or collection identity.                                                                                    |
| 9. Workflow separation          | Pass   | Completed means valid confirmed passage only, never persistence, submit or business completion.                                                                                   |
| 10. Target neutrality           | Pass   | Core derives indicator policy; Angular and Standard only project normalized state.                                                                                                |
| 11. Accessibility/lifecycle     | Pass   | Retained steps and orthogonal current/progress/error semantics form a closed ADR accessibility and disposal question.                                                             |
| 12. Diagnostics/manual safety   | Pass   | Descriptor-safe authoring/manual/state diagnostics and precedence form a closed ADR question list.                                                                                |
| 13. Public migration            | Pass   | Experimental widening and exhaustive-reader impact require a later coordinated MINOR gate.                                                                                        |
| 14. Dependency/release boundary | Pass   | No dependency, graph, version, release, publication or Git work is selected.                                                                                                      |
| 15. Future-scope isolation      | Pass   | Branching workflow, persisted progress, nested/item wizards, React/Vue and remaining Deferred items stay explicitly inactive.                                                     |
| 16. Documentation consistency   | Pass   | STATUS, ROADMAP sequence, Accepted documents and D-011/D-012 agree that this is only a refined selection gate.                                                                    |

## 11. Selection gate

Cycle 8 completed the new full review with zero findings, so the refined
recommendation is ready for owner selection. Acceptance would promote only the
bounded M34 architecture question in section 2 and reserve ADR-037 for it. It
would authorize drafting and completely reviewing ADR-037, not accepting an
architecture, changing a Public contract, drafting a SPEC/plan, implementing,
adding dependencies, changing versions, releasing, publishing, committing,
pushing or mutating external state.
