# D-038/M27 scope-baseline promotion-readiness review — Cycle 1

- **Date:** 2026-08-02
- **Scope:** Remaining Deferred candidates after completed M26
- **Outcome:** D-038 is selected and promoted only for bounded M27 architecture
  design; no Public contract or implementation is active

## 1. Candidate comparison

| Candidate                                     | Readiness                                                                                                                                         | Consumer value                                                                               | Boundary risk                                                                                                               | Outcome                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| D-038 scoped baseline confirmation            | Deep objects, stable collections, application-defined scopes, immutable external updates and two independent reference consumers are implemented. | High for section/step persistence: confirming one scope must not make unrelated edits clean. | Material but containable in a pure helper that returns a baseline candidate without mutating runtime or owning persistence. | Selected for bounded M27 design. |
| D-039 explicit defaults                       | Presence and recursive schemas exist, but initialization authority and raw/resolved/normalized input remain undecided.                            | High for entity creation.                                                                    | High because defaults, arrays, references and future composition can silently create domain data.                           | Remains Deferred.                |
| D-031 additional issue visibility             | Technically small.                                                                                                                                | Medium-low without a concrete submit-attempted consumer flow.                                | Low, but it adds policy surface rather than advancing application-owned persistence semantics.                              | Remains Deferred.                |
| D-007 composition/conditionals                | Static local reference resolution exists.                                                                                                         | High.                                                                                        | Very high across evaluation, branch identity, UI derivation and validator alignment.                                        | Remains Deferred.                |
| D-021 batches/transactions                    | Deep and collection operations exist, but no accepted multi-field command or undo use case exists.                                                | Medium.                                                                                      | High if operation atomicity, diagnostics and application confirmation are conflated.                                        | Remains Deferred.                |
| D-025 broader theming or D-045 legacy Angular | Narrow theming and current Angular 22 evidence exist.                                                                                             | Strategic rather than one neutral runtime capability.                                        | Broad multi-package/toolchain maintenance surface.                                                                          | Remains Deferred.                |

## 2. Selected bounded M27 question

M27 may design a framework-neutral pure utility that receives application-owned
current and baseline roots plus an accepted definition and application-defined
scope, and returns a candidate baseline in which only valid selected targets
are confirmed. The application remains solely responsible for persistence and
for supplying any accepted result through `updateExternalState()`.

The architecture must decide:

1. the exact Public Experimental function/options/result boundary and whether
   it reuses existing diagnostics rather than adding runtime state;
2. descriptor-safe validation order for definition, roots and scope targets;
3. missing-property copy/removal semantics and overlapping-target
   canonicalization;
4. stable collection/item/node addressing, insertion/removal/order behavior and
   invalid-identity closure;
5. structural sharing and prototype safety for rebuilt ancestors; and
6. Angular/Standard evidence without adapter wrappers or save ownership.

## 3. Explicit exclusions

Selection does not activate a runtime action, automatic baseline mutation,
persistence, autosave, HTTP, drafts, submit state, optimistic projection,
transactions, undo/redo, declarative UI-Schema scopes, dynamic definitions,
defaults, a new package/entry point, versioning, release or publication.

## 4. Gate result

Cycle 1 finds the trigger sufficiently concrete: both maintained reference
applications independently own complete baseline confirmation while accepted
scopes already cover deep nodes and stable collection addresses. A pure helper
can remove duplicated path/identity semantics without weakening SPEC-001's
application-ownership rule.

No conflict is found with Accepted SPEC-001/002/003/012 or ADR-009/014/015/029
because the runtime remains controlled, baseline-only updates remain explicit
and asynchronous validation remains a non-trigger. D-038 is promoted for M27
architecture design only. The exact next action is to draft and completely
review ADR-030; Public contracts and implementation remain unauthorized.

Formatting, documentation checks for 347 Markdown files and 1,046 local links,
and diff hygiene pass with zero findings.
