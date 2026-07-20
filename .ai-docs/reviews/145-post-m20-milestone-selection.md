# Post-M20 milestone-selection review — Cycles 1–2

- **Date:** 2026-07-19
- **State:** Completed; Ricard selected option A on 2026-07-20 and review 146
  accepted only its M21 normative release-design boundary
- **Demand:** Choose the next coherent product milestone after completed M20
  without inferring framework, theming, workflow, legacy-support, release or
  repository work from the preceding implementation
- **Authority reviewed:** Accepted SPEC-001 through SPEC-009; ADR-009,
  ADR-010, ADR-018, ADR-020, ADR-021, ADR-023, ADR-024 and ADR-025; completed
  M18–M20; current source/package boundary; and Deferred D-007, D-011, D-012,
  D-013, D-018, D-025, D-026, D-035, D-043, D-044 and D-045
- **Outcome:** Cycle 2 passes all ten selection-review areas with zero findings; no
  candidate is promoted or authorized by this review

## Correction and complete-review restart

- **Cycle 1** passed the substantive comparison, links and active-state
  consistency but found that this new review record did not satisfy repository
  formatting.
- The record was formatted and **cycle 2** restarted the complete selection,
  documentation, link, state and diff review.

## Selection follow-up

On 20 July 2026 Ricard selected **A — coordinated Experimental delivery of
M20**. Review 146 subsequently passed its complete cycle 3 with zero findings
and promotes only ADR-018 revision 5 design. This follow-up does not change the
cycle 2 comparison result and authorizes no manifest, plan, implementation,
Git or external action.

## 1. Conclusion and recommendation

The repository has no automatically implied M21. Three candidates are coherent
enough to select now, but they optimize different outcomes:

1. **Deliver M20 as a coordinated Experimental release — recommended.** This
   is the smallest product-complete step. Current source contains reviewed
   Public Experimental recursive-local-layout contracts and behavior that the
   published `0.3.0` core/base and `0.1.0` pilot line does not expose. A
   release-readiness review would close that source/package delivery gap before
   more Public surface or another framework is accumulated.
2. **Start the first React adapter and reference shell.** This provides the
   highest architectural learning and begins the multi-framework product, but
   it introduces a new Public package, framework lifecycle and maintenance
   matrix while the M20 source line remains unpublished.
3. **Promote a narrow JSON Schema composition slice.** This provides the
   highest additional schema-language value, but D-007 still groups materially
   different evaluation models. A readiness review must first select one
   cohesive static subset and prove that it does not silently activate dynamic
   definitions or an expression engine.

The recommendation is sequencing, not promotion: deliver the already reviewed
M20 value first, then run another selection review where React is the leading
candidate. Ricard may instead select React or composition now if breadth or
schema expressiveness is the more important product goal.

## 2. Evaluation criteria

Each candidate is assessed against the same current evidence:

- direct consumer value rather than hypothetical extensibility;
- satisfied Deferred restart conditions and accepted architectural authority;
- smallest coherent scope with explicit exclusions;
- Public contract, package and compatibility impact;
- implementation and long-term maintenance cost;
- independent Angular/Standard/reference evidence available today; and
- external, destructive or credentialed actions that require later gates.

Scores are relative (`1` low, `5` high). A high risk/cost score is worse.

| Candidate                                       | Value | Readiness | Learning | Risk/cost | Immediate gap closed                       |
| ----------------------------------------------- | ----: | --------: | -------: | --------: | ------------------------------------------ |
| Coordinated Experimental delivery of M20        |     4 |         5 |        2 |         2 | Reviewed source is not publicly consumable |
| First React adapter plus admitted shell         |     5 |         4 |        5 |         4 | No second framework adapter                |
| Narrow D-007 static composition slice           |     5 |         3 |        4 |         5 | Limited JSON Schema expressiveness         |
| Broader Angular UI-kit/theming slice            |     4 |         3 |        3 |         4 | Pilot covers containers, not a full kit    |
| Public implementation-independent specification |     3 |         4 |        3 |         3 | Contracts are repository-internal          |
| Angular legacy compatibility family             |     4 |         2 |        4 |         5 | Only Angular 22 is supported               |
| Workflow/scopes/expressions                     |     5 |         2 |        4 |         5 | Runtime intentionally remains form-local   |
| Public repository/release automation            |     3 |         3 |        2 |         5 | Repository and provenance remain private   |

## 3. Candidate A — coordinated Experimental delivery of M20

### Why it is ready

- SPEC-009, ADR-025 and completed PLAN-022 define and verify the complete M20
  contract through 27 conformance rows.
- Core and base Angular declarations changed Public Experimental shape; native,
  Standard and Angular Aria behavior pass the frozen lower/latest matrices.
- ADR-009 and ADR-010 already define classification, MINOR treatment during
  `0.y`, declaration review and compatibility evidence.
- ADR-018 revision 4 already defines repeat-release ownership, immutable
  recovery, dual licensing, Corresponding Source and separately gated registry
  writes.

### Smallest selection boundary

If selected, the next document is a **release promotion-readiness review**, not
a version edit or publication plan. It must decide the exact participating
packages and versions, migration notes, compatibility tuples, candidate/source
provenance and whether ADR-018 needs a revision. No package version, tag,
candidate, Git action or npm action is selected here.

### Product trade-off

It delivers no new capability beyond completed M20, but it prevents a growing
gap between documented source behavior and installable packages. Every Git,
GitHub, npm, tag and visibility action remains behind explicit later gates.

## 4. Candidate B — first React adapter and reference shell

### Why it is coherent

- The neutral core, replaceable validator and shared scenario catalog are
  implemented, and Angular plus Standard independently exercise M20.
- ADR-020 explicitly admits a later shell after its adapter/integration
  contract, workspace project and verification matrix are accepted.
- Starting a second framework satisfies D-026's review trigger and provides
  evidence for distinguishing real cross-adapter capabilities from Angular
  assumptions.

### Smallest selection boundary

If selected, the next document is a **joint D-026/D-044 React promotion-
readiness review**. It must decide whether M21 delivers a Public React adapter
package plus private reference shell or first designs only the adapter seam. It
must close controlled-state ownership, subscription/lifecycle mapping, renderer
extension, accessibility, supported React tuple, SSR/hydration non-claims,
package boundaries and independent clean-consumer evidence.

### Explicit exclusions

Vue, a universal framework controller, shared UI implementation, SSR,
hydration, portals, React Server Components, general theming, legacy Angular,
publication and Stable promotion remain inactive. The shared catalog may
provide scenarios and evidence only.

## 5. Candidate C — narrow JSON Schema composition

### Why it is valuable but not yet shaped

D-007's original restart conditions are now substantially satisfied: Draft
2020-12 is selected and the compiler has an Internal same-document `$defs`/
local-`$ref` resolution layer. However, `allOf`, `anyOf`, `oneOf`,
`if/then/else`, `dependentSchemas`, dynamic references and vocabularies do not
share one safe UI-derivation or runtime model.

If selected, the next document is a **D-007 promotion-readiness review** that
chooses a single cohesive static evaluation subset. It must resolve merge/
branch ambiguity, validation versus UI derivation, provenance, diagnostics,
cycles, defaults and interaction with D-013 dynamic definitions and D-018
expressions before any ADR or SPEC. This review does not preselect `allOf` or
another keyword.

## 6. Candidates requiring more product input

### Broader D-025 UI kit and theming

The container SPI and Angular Aria pilot prove one narrow seam, but the
remaining work mixes Rabassoft tokens, complete field renderers, theme
translation, multiple UI libraries and multi-framework protocol. Promotion
requires choosing one concrete UI library and whether the milestone covers
fields, containers, theme ownership or a package combination. It should not be
selected as an undifferentiated “support UI libraries” milestone.

### D-035 public independent specification

Independent Standard behavior and extensive conformance evidence substantially
satisfy its historical restart condition. A public specification could improve
third-party implementation and governance, but it does not currently close a
known consumer defect. It is best selected when public repository/documentation
distribution or a third-party implementation becomes an immediate goal.

### D-045 Angular legacy

The neutral catalog prerequisite exists, but no exact target major, enterprise
consumer, package family or maintenance horizon is selected. Supporting
“earlier than 19” is not one compatibility claim. A promotion review becomes
coherent only after Ricard chooses a floor or a concrete consumer tuple.

### D-011/D-012/D-018 workflow and expressions

Static and recursive presentation is consolidated, so the old technical
trigger is partly satisfied. The remaining candidates still combine wizards,
declarative scopes, visibility, readonly, required/computed expressions and
dependency evaluation. They alter application authority and require a concrete
workflow use case before a safe slice can be promoted.

### D-043 public repository and release automation

This is coherent operational work but not implied by M20. It entails reachable-
history/privacy review, repository visibility, metadata, OIDC, settings and
provenance with destructive/external gates. Select it only when public source
hosting or automated publication is the immediate product objective.

## 7. Other Deferred work

Async validation, partial validation, hot definition replacement, plugins,
lifecycle hooks, undo/redo, collaboration, batches, DevTools, persistence,
formats, defaults and products remain demand-driven. Their register conditions
do not provide stronger current evidence than the three leading candidates.
This ranking does not reject them or change their state.

## 8. Decision paths

Ricard's selection determines exactly one next action:

- **A — M20 delivery:** prepare a coordinated Experimental release promotion-
  readiness review.
- **B — React:** prepare a joint D-026/D-044 React adapter/shell promotion-
  readiness review.
- **C — Composition:** prepare a D-007 static-composition promotion-readiness
  review.
- **Another Deferred priority:** name it and first establish its concrete demand
  and smallest coherent slice.

Selection authorizes only the named promotion-readiness review. It does not
accept an architecture, reserve an ADR/SPEC/plan identifier, change a version,
install a dependency, modify code, commit, push or perform an external action.

## 9. Cycle 2 complete review

1. **Current authority — Pass.** Completed M20 remains the active baseline and
   no Deferred capability is represented as implemented or accepted.
2. **Demand separation — Pass.** Delivery, framework breadth, schema depth,
   theming, workflow, compatibility and operations are not collapsed into one
   milestone.
3. **Release boundary — Pass.** Candidate A selects no version, package set,
   tag, Git, registry or visibility action.
4. **Framework boundary — Pass.** Candidate B follows ADR-020 admission and
   restarts D-026 without assuming a shared controller or SSR capability.
5. **Schema boundary — Pass.** Candidate C does not silently promote all D-007
   keywords or preselect an evaluation model.
6. **UI/workflow boundary — Pass.** Broader D-011/D-012/D-018/D-025 work stays
   inactive pending a concrete product slice.
7. **Compatibility boundary — Pass.** D-045 remains unselected without an exact
   major/family and no Angular peer range changes.
8. **Public-source operations — Pass.** D-035/D-043 remain separate from code,
   release and repository mutations.
9. **Public contract safety — Pass.** The review proposes only later readiness
   reviews and changes no SPEC, ADR, package or implementation contract.
10. **Persistent-state consistency — Pass.** STATUS, ROADMAP and Deferred
    authority agree that Ricard must select the next product priority.

## 10. Outcome

Cycle 2 completes the post-M20 selection review with zero findings. No M21
exists yet and no candidate is promoted. The exact next action is for Ricard to
select A, B, C or explicitly name another Deferred product priority.
