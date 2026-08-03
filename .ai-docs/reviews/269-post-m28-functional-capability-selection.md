# Post-M28 functional-capability selection review — Cycle 1

- **Date:** 2026-08-03
- **State:** Recommendation accepted; bounded D-039/M29 design selected
- **Scope:** Remaining Deferred functional/platform candidates after completed
  M28
- **Authority reviewed:** Accepted SPEC-001, SPEC-004, SPEC-013 and SPEC-014;
  Accepted ADR-005 revision 7, ADR-016, ADR-030 and ADR-031; completed
  PLAN-030; current deferred-decision register
- **Outcome:** Cycle 1 passes the complete comparison with zero findings. No
  candidate is promoted automatically. If core functionality remains the
  priority, a bounded D-039 explicit-defaults design question is the technical
  recommendation; React/platform breadth, wizard/workflow breadth and legacy
  Angular support are materially different product choices that require
  Ricard's selection.

## Candidate comparison

| Candidate                               | Readiness and value                                                                                                                                  | Principal boundary                                                                                                                                                                     | Outcome                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| D-039 explicit defaults                 | Local references and bounded object composition now make deterministic object initialization designable; explicit creation is common consumer value. | `default` is an annotation, not an assertion. Presence, recursion, arrays, provenance and whether input is raw/resolved/normalized must be decided without automatic runtime mutation. | Recommended technical default for a design-first M29 only if entity creation is the chosen product direction. |
| React adapter/reference                 | The neutral core and shared scenario catalog are mature enough to support a second framework proof.                                                  | Requires a new adapter/renderer ownership and support policy; it broadens platform coverage rather than core behavior.                                                                 | Strong platform alternative; selection required.                                                              |
| D-011/D-012/D-018 wizard/workflow slice | Static recursive layouts and application-owned scopes are stable; consumer value can be high.                                                        | A concrete wizard is needed before deciding navigation, conditional visibility, scope authority and expression evaluation.                                                             | Strong workflow alternative; selection required.                                                              |
| D-045 legacy Angular family             | The shared neutral catalog and modern Angular 22 baseline exist; enterprise adoption value may be high.                                              | Needs exact target majors, separate toolchains/package families and a maintenance horizon; the current Signal Forms adapter cannot honestly widen its peer range.                      | Strategic compatibility alternative; selection required.                                                      |
| D-025 broader UI kits/theming           | The presentation SPI and one Angular Aria pilot provide a narrow seam.                                                                               | Needs a chosen component library and field/container inventory; risks spending effort on platform styling before another functional consumer exists.                                   | Keep Deferred unless UI-library breadth becomes the product priority.                                         |
| D-031 issue visibility                  | Small, low-risk extension over `touched`/`all`.                                                                                                      | No demonstrated need for `dirty`, submit-attempted or custom policy.                                                                                                                   | Keep Deferred.                                                                                                |
| D-013 dynamic definitions               | Reference editors demonstrate replacement by runtime recreation.                                                                                     | Hot reconciliation affects focus, touched, scopes, pending operations, collections and async generations.                                                                              | Keep Deferred.                                                                                                |
| D-021 batches/transactions              | Deep and collection operations are stable.                                                                                                           | No selected multi-field command/undo consumer defines atomicity or history semantics.                                                                                                  | Keep Deferred.                                                                                                |
| D-030 advanced localization             | Existing locale/text and semantic formats provide partial foundations.                                                                               | No exact currency/unit/calendar/parser and domain-value contract is selected.                                                                                                          | Keep Deferred.                                                                                                |
| Remaining D-007 composition             | M28 deliberately establishes a bounded disjoint-object subset.                                                                                       | Repeated-property intersection, alternatives and conditionals require materially broader evaluation semantics.                                                                         | Let M28 settle; keep Deferred.                                                                                |
| Broader D-036 readonly/hidden policy    | Primitive fixed presentation is stable.                                                                                                              | Readonly, hidden and const presentation have different authority/accessibility semantics and no concrete consumer is selected.                                                         | Keep Deferred.                                                                                                |

## Recommended bounded D-039 design question

If Ricard selects core entity-creation functionality, M29 should initially ask
whether the core may expose a pure, application-triggered operation that
derives an explicit default candidate without changing runtime state. The ADR
would have to decide, before any SPEC or code:

1. raw schema versus an Internal resolved/composed cursor as the authority;
2. exact supported root/nested/reference/composition locations and whether
   arrays can ever be created;
3. preservation of existing presence, including `null`, `false`, `0` and the
   empty string, with no silent overwrite;
4. atomic candidate/diagnostic behavior, cycle/depth/provenance rules and
   application-owned acceptance; and
5. no implicit initialization in compile/runtime, no validator default
   mutation, no persistence/submit semantics and no package/release change.

This is a recommendation to select a design question, not a proposed Public
API or authorization to draft an ADR.

## Gate result

The comparison passes consumer value, prerequisite, ownership, framework
neutrality, package/dependency, deferred-boundary and documentation checks with
zero findings. A next milestone cannot be selected autonomously because the
leading options optimize materially different goals: core entity creation,
platform reach, workflow breadth or enterprise Angular compatibility.

## Selection follow-up

Ricard selected the recommended core direction on 2026-08-03. The selection
promotes only the bounded D-039 architecture question as M29 and reserves
ADR-032. It does not accept an architecture, activate a Public contract or
authorize a SPEC, plan, implementation, dependency, version, release, Git or
external action.
