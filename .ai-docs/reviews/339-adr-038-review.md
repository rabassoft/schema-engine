# ADR-038 revision 0 complete review — Cycles 1–5

- **Date:** 2026-08-04
- **State:** Complete; ADR accepted by Ricard on 4 August 2026
- **Reviewed:** ADR-038 revision 0 against accepted review 338; SPEC-001 through
  SPEC-020; ADR-006/007/008/009/010/020/021/023/024/025/037; D-025, D-026 and
  D-044; current core/Angular/Standard packages and reference boundaries; React
  19.2 official version, external-store, Strict Mode and purity guidance
- **Outcome:** Cycle 1 found six lifecycle/API/isolation ambiguities. Cycle 2
  found two callback/recovery ambiguities. Cycle 3 found three persistent-state
  inconsistencies after the architecture draft was completed. Cycle 4 found
  one stale selection summary in review 338. After correction, cycle 5 repeated
  all eighteen areas with zero findings. ADR-038 is ready for Ricard's
  acceptance decision.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R339-F01 | Replaced the contradictory globally stable action facade with actions stable only within one runtime epoch and atomically replaced on epoch change, so retained stale callbacks cannot act on a new runtime.             |
| R339-F02 | Closed controlled wizard reconciliation: `wizardState` seeds construction only; after readiness, only exact `confirmWizardSelection` may forward a confirmation to core, and a matching later prop cannot advance twice. |
| R339-F03 | Added one Internal per-owner React error boundary around selected renderers so render/lifecycle exceptions can deactivate stale callbacks, report after commit and preserve independent siblings.                        |
| R339-F04 | Made the local package/release split exact: the M35 source starts `0.0.0` and private, tests workspace/packed peer rewriting, and cannot claim a first public/core range before a separate release gate.                 |
| R339-F05 | Removed an accidental Public CSS-hook implication. M35 guarantees semantic/accessibility state but no supported selector, class, stylesheet, token or theming API.                                                       |
| R339-F06 | Enumerated the complete action facade, including reads and `setValidationVisibility`, and required every non-empty action diagnostic batch to reach the latest committed diagnostics callback exactly once.              |

Cycle 1 cannot support acceptance. Cycle 2 restarts all eighteen review areas
after these corrections.

## Cycle 2 findings and corrections

| Finding  | Correction                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R339-F07 | Made operation and wizard-intention callbacks required/callable, kept diagnostics optional, and closed exception behavior without recursive reporting or console writes.               |
| R339-F08 | Defined renderer-error recovery identity as epoch + owner + registration ID + component type; an unchanged throwing renderer stays closed instead of entering an automatic retry loop. |

Cycle 2 cannot support acceptance. Cycle 3 restarts all eighteen areas after
these corrections.

## Cycle 3 findings and corrections

| Finding  | Correction                                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R339-F09 | Updated STATUS's review-338 outcome from an unselected recommendation to the actual accepted M35 promotion and ADR-038 reservation.                             |
| R339-F10 | Replaced ROADMAP's stale instruction to draft ADR-038 with the completed Proposed/reviewed architecture and its owner-acceptance gate.                          |
| R339-F11 | Reconciled D-026/D-044 wording that still said no architecture existed; ADR-038 now exists as Proposed but authorizes no SPEC or implementation until Accepted. |

Cycle 3 cannot support acceptance. Cycle 4 restarts all eighteen areas after
these corrections.

## Cycle 4 finding and correction

| Finding  | Correction                                                                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R339-F12 | Replaced review 338's stale “ready for selection” outcome with its actual accepted effect: only ADR-038 design/review was authorized and later gates remain inactive. |

Cycle 4 cannot support acceptance. Cycle 5 restarts all eighteen areas after
the correction and records zero findings in section 8.

## 1. Promotion-boundary conformance

ADR-038 implements only the architecture question selected in review 338:

- one Public Experimental React web adapter;
- complete native projection of the neutral behavior implemented through M34;
- one independent private React shell; and
- a client-only D-026 slice.

It does not draft the observable contract, create the package/project, add a
dependency or authorize implementation. Vue, advanced adapter capabilities,
UI-library/theming work and external actions remain excluded.

## 2. React version and framework evidence

The official React versions page identifies 19.2 as the current stable line,
while npm currently exposes a stable `19.2.x` release. Selecting
`>=19.2.0 <20.0.0` with aligned exact React/React DOM consumer tuples is a
bounded initial claim. It avoids treating React 18 compatibility as automatic
and leaves widening to a later evidence-backed MINOR.

The official `useSyncExternalStore` contract matches the neutral core:
`subscribe` returns cleanup, `getSnapshot` is synchronous, and unchanged state
must preserve snapshot identity. The ADR's stable bridge store and cached
immutable adapter state therefore fit React without copying domain state into
`useState`.

React's official Strict Mode guidance says development may rerender components
and repeat effect/ref setup and cleanup. The ADR correspondingly prohibits
runtime construction during render, requires complete epoch cleanup and tests
zero duplicate user intentions. The declared possibility of one validation per
created runtime instance is honest and does not weaken the core's per-instance
semantics.

## 3. Controlled ownership and lifecycle

Pass. `useSchemaForm` owns only lifecycle/projection. The application retains
value, baseline, locale input, operation/wizard decisions, async transport,
persistence and completion. External state is reconciled after commit and
before paint without render-phase mutation or optimistic domain projection.

The identity rules distinguish construction inputs from update inputs and from
the M34 confirmation protocol. Object-literal/callback identity alone cannot
recreate a runtime. Callback refs update independently and the epoch guard
prevents abandoned/replaced owners from acting.

The raw runtime, subscriptions, external-state update and disposal are not
exposed. The facade remains complete for every accepted consumer action and
read while preserving hook lifecycle authority.

## 4. Public package and renderer architecture

Pass. The package name, one root entry point, four values and twelve types are
explicit. Deep imports, native components and implementation objects remain
Internal. ADR-009's Public + Experimental + Active classification and exact-
export rule remain intact.

ADR-007 selection semantics survive unchanged. React registrations use React
component types without creating a neutral component token or registry package.
The native factory and consumer overrides remain immutable and deterministic.

Per-owner error boundaries are required because React function-component
render failures cannot be isolated by a normal `try/catch` in the parent
render. The corrected reset identity prevents retry loops and preserves sibling
projection without fabricating a control or changing runtime/application
state.

## 5. Complete neutral projection

Pass. Native leaves cover every currently accepted leaf representation.
Normalized keys and stable item IDs govern React identity. Objects,
collections, discriminated alternatives and local presentation forests are
projected without reinterpreting schema/value.

Tabs and accordions retain target-local state. Wizard steps remain mounted once
per epoch while inactive subtrees leave display, accessibility and focus. The
adapter consumes existing condition, validation, scope and wizard snapshots;
it does not duplicate their policy.

The absence of a Public CSS API is deliberate. Browser-native/semantic markup
can be styled by the private shell, while a reusable stylesheet, selectors,
tokens, theme translation or UI kit remains a separate D-025 question.

## 6. Reference-shell admission

Pass. `apps/reference-react` is admitted only after the package contract. It
uses the catalog and Public roots but owns its own React bootstrap, controlled
state, components, styling, examples, tests and cleanup. It cannot import
Angular or Standard implementation.

The complete catalog is required at unit/application level; the Chromium lane
remains representative rather than multiplying every conformance row. Snippets
come from compiled source. Workspace evidence remains subordinate to package,
packed and isolated consumers.

## 7. Compatibility, release and deferred boundaries

Pass. The local `0.0.0` private source package and future public release are
separate. The current published core `0.4.1` cannot falsely prove M34 source
compatibility. A later release gate must select an actual core line and final
peer ranges.

ADR-010 remains applicable without lockstep. D-026 promotes only client
external-store/lifecycle/component composition. SSR, hydration, Server
Components, streaming, portals, Suspense/lazy renderers and generic capability
negotiation stay Deferred. React 18/20, React Native, Vue, UI libraries,
broader D-025, D-035, D-045, release and Git remain inactive.

## 8. Cycle 5 complete review

| Area                               | Result | Evidence                                                                                                                       |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 1. Accepted promotion boundary     | Pass   | Matches review 338's package + native projection + private shell and no broader capability.                                    |
| 2. Current React evidence          | Pass   | One stable 19.2 line is selected; aligned lower/current tuples are required and React 18/20 remain non-claims.                 |
| 3. Render purity                   | Pass   | Bridge construction is inert; runtime/application code is never invoked during render or memoization.                          |
| 4. External-store semantics        | Pass   | Stable subscribe/getSnapshot, cached immutable state and no server snapshot align with the client-only contract.               |
| 5. Strict Mode lifecycle           | Pass   | Setup/cleanup replay is balanced, stale epochs are inert and no user intention can be emitted by replay alone.                 |
| 6. Controlled ownership            | Pass   | Application retains value/baseline, operation/wizard decisions, async transport, persistence and completion.                   |
| 7. Runtime identity/reconciliation | Pass   | Construction, ordinary external updates, validation visibility and wizard confirmation have distinct closed paths.             |
| 8. Hook/action API                 | Pass   | State union and epoch-bound complete facade expose required reads/actions without raw runtime lifecycle escape.                |
| 9. Public inventory                | Pass   | Package/root and exact four value + twelve type exports are closed under ADR-009.                                              |
| 10. Renderer registry              | Pass   | ADR-007 rank/priority/order/errors are preserved in an immutable React-specific registry.                                      |
| 11. Renderer failure isolation     | Pass   | Per-owner committed error boundaries deactivate callbacks, preserve siblings and reset only on exact identity change.          |
| 12. Native leaves and texts        | Pass   | All active leaf forms, buffers, locale/text/diagnostic behavior and semantic accessibility are covered without raw schema.     |
| 13. Compound identity/lifecycle    | Pass   | Normalized node keys and stable item IDs cover objects, collections, alternatives and recursive owners without positional IDs. |
| 14. Presentation and wizard        | Pass   | Target-local container state and retained controlled wizard semantics remain separated and framework idiomatic.                |
| 15. Reference-shell admission      | Pass   | Catalog-only sharing, independent bootstrap/state/styles/build/tests and root-entry consumption satisfy ADR-020.               |
| 16. Compatibility/package release  | Pass   | Private local source, packed evidence and later public/core range gate avoid false current-version claims.                     |
| 17. Deferred/external isolation    | Pass   | Advanced D-026, broader D-025, other frameworks, dependencies, implementation, release and Git stay inactive.                  |
| 18. Next-gate clarity              | Pass   | Acceptance authorizes SPEC-021 preparation/review only; PLAN-037 and implementation remain gated.                              |

Cycle 5 passes all eighteen areas with zero findings and no unresolved change
request. Ricard accepted ADR-038 revision 0 on 4 August 2026. Acceptance
authorizes drafting and completely reviewing SPEC-021 only. No plan,
dependency, package, implementation, version,
release, publication, commit, push or external state is authorized by this
review.

## Verification

- Full cross-check against review 338, the applicable Accepted SPECs/ADRs,
  D-025/D-026/D-044 and current source/package/reference boundaries.
- Official React version, `useSyncExternalStore`, Strict Mode and purity
  guidance reviewed on 4 August 2026.
- Repository formatting, documentation links and `git diff --check` must pass
  before the review is recorded as complete in persistent state.
