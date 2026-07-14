# M9 SPEC-002 complete review — Cycles 1–2

- **State:** Repeated review 2 passed; ADR-014 revision 2 and SPEC-002 v0.1.2
  accepted
- **Date:** 14 July 2026
- **Reviewed:** SPEC-002 Draft v0.1.1, corrected
  [`SPEC-002 Draft v0.1.2`](../specs/002-nested-object-runtime.md) and proposed
  ADR-014 revision 2
- **Compared with:** accepted
  [`SPEC-001 v0.1.15`](../specs/001-controlled-form-runtime.md),
  [`ADR-014 revision 1`](../adrs/014-modelo-objetos-anidados-paths-profundos.md),
  [`ADR-005 revision 1`](../adrs/005-politica-dialecto-json-schema.md),
  ADR-007/008/009 and deferred boundaries
- **Authorization after acceptance:** PLAN-009 preparation only; no
  implementation

## 1. Result

The first separate complete review does not pass. SPEC-002 remains Draft
v0.1.1 and has six open findings: four observable contracts are not closed, one
structural-sharing guarantee excludes valid cross-field validation changes and
one Public Angular migration rule contradicts the accepted missing-ancestor
behavior.

The promoted M9 boundary remains coherent. No finding requires arrays,
references, composition, advanced layout, batches, dynamic definitions, custom
object-container renderers, publication or any other deferred capability.

## 2. Complete review matrix

| Acceptance area                         | Result      | Finding or evidence                                                                                                                      |
| --------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Authority, goals and non-goals          | Pass        | SPEC-001 remains behavioral authority; Draft status and lack of implementation authorization are explicit.                               |
| Recursive schema subset and dialect     | Pass        | The accepted ADR-005 revision 1 catalog, traversal, cycles and deferred exclusions are preserved.                                        |
| Structural UI Schema                    | Finding     | New incompatible object/leaf UI members have no closed code, parameters, severity or ordering; F002.                                     |
| Normalized model and canonical identity | Pass        | Tree/projection identity, string paths, keys, DOM tuple encoding and immutability are coherent.                                          |
| Deep controlled operations              | Pass        | Terminal expectations, safe traversal, descriptors, atomicity and terminal-only conflict detection match ADR-014.                        |
| External values, presence and dirty     | Pass        | Accessor rejection, blocked presence, dirty ownership and missing/empty distinctions are closed.                                         |
| Runtime actions and interaction         | Finding     | Incompatible-ancestor action failures have no closed diagnostic contract; F001.                                                          |
| Snapshot and public runtime API         | Finding     | `getNodeSnapshot()` is named but its exact signature is absent; F004.                                                                    |
| Validation, scopes and visibility       | Pass        | Full-model validation, issue assignment, object scopes and derived visibility remain neutral and deterministic.                          |
| Text resolution                         | Finding     | Object `TEXT_RESOLUTION_FAILED` parameters are not defined and the accepted required `field` parameter cannot be reused unchanged; F003. |
| Angular recursion and accessibility     | Conditional | The Internal object host and accessible recursive projection are coherent, subject to the custom-renderer contradiction in F006.         |
| Diagnostics and failure isolation       | Finding     | The four explicitly proposed codes are closed, but action, UI and object-text observable failures remain open under F001–F003.           |
| Structural sharing and lifecycle        | Finding     | The update guarantee omits unrelated nodes changed by full-model validation; F005.                                                       |
| ADR-009 API migration                   | Finding     | The inventory is broad, but F004 and F006 leave exact Public behavior unresolved.                                                        |
| Conformance and deferred boundaries     | Conditional | Fixtures cover the intended boundary, but must gain the correction cases before PLAN-009.                                                |
| Acceptance/authorization sequence       | Pass        | Acceptance would authorize only PLAN-009 preparation, never implementation.                                                              |

## 3. Findings

### M9-SPEC-F001 — Incompatible-ancestor runtime actions have no diagnostic contract

- **Severity:** High
- **Area:** SPEC-002 sections 9, 11 and 16
- **Observed:** Set/remove below an incompatible ancestor and interaction on a
  descendant are said to fail “with diagnostics”, but the diagnostic code,
  parameters, fallback, action result and ordering are not specified.
  `UNKNOWN_RUNTIME_PATH` is not an exact fit because the leaf remains managed;
  `INCOMPATIBLE_OPERATION_ANCESTOR` currently describes operation application,
  not runtime intentions.
- **Impact:** Two implementations can expose different Public action results
  for the same controlled state while both claim conformance.
- **Recommended correction:** Define one exact runtime-action contract for a
  managed path blocked by an incompatible ancestor, including action name,
  copied target path, blocking `at` path, effects, severity, fallback and
  ordering. Explicitly state which set/remove/focus/blur calls use it.

### M9-SPEC-F002 — Structural UI incompatibilities are not diagnostically closed

- **Severity:** High
- **Area:** SPEC-002 sections 5 and 16
- **Observed:** Object UI nodes reject `placeholder`, `enumLabels` and numeric
  options, while leaf nodes reject `order` and `fields`, but the document does
  not define whether each case uses `INCOMPATIBLE_UI_OPTION` or an existing
  specialized warning, nor its exact parameters, path, per-member order or
  branch-stopping behavior.
- **Impact:** Compiler results and conformance fixtures can diverge for the new
  recursive UI shape.
- **Recommended correction:** Add a closed compatibility table for every
  object-only and leaf-only UI member. Reuse existing codes where their meaning
  fits and define exact `option`, node kind/type, reason, paths, severity and
  deterministic ordering.

### M9-SPEC-F003 — Object text failure diagnostics cannot reuse the leaf shape unchanged

- **Severity:** High
- **Area:** SPEC-002 section 14 and diagnostics
- **Observed:** Object resolution failure inherits only the “principles” of leaf
  text. The accepted `TEXT_RESOLUTION_FAILED` contract requires a `field`
  parameter, while object contexts expose `node`; the Draft defines neither the
  replacement parameter nor exact object-member/issue parameters and fallback.
- **Impact:** The Public transitive `TextResolver` extension lacks a
  deterministic failure surface and fails acceptance criterion 2.
- **Recommended correction:** Define the exact object diagnostic shape, copied
  `dataPath`, optional issue code, closed reasons, fallback, batching and order.
  Use a discriminated node/field locator without silently changing existing leaf
  diagnostics.

### M9-SPEC-F004 — `FormRuntime.getNodeSnapshot()` lacks its exact Public signature

- **Severity:** Medium
- **Area:** SPEC-002 sections 11 and 18
- **Observed:** The method is listed as New Public core and its lookup meaning is
  described, but no normative TypeScript signature or malformed/numeric-path
  behavior is given.
- **Impact:** Declaration output, consumers and PLAN-009 tests do not have one
  exact contract to implement.
- **Recommended correction:** State the signature
  `getNodeSnapshot(path: DataPath): NodeRuntimeSnapshot | undefined` and its
  read-only lookup semantics, including that malformed, numeric, root and
  unmanaged paths return `undefined` without emitting diagnostics, matching the
  existing `getFieldSnapshot()` lookup convention.

### M9-SPEC-F005 — Structural-sharing guarantee excludes cross-field validation changes

- **Severity:** High
- **Area:** SPEC-002 sections 12 and 17
- **Observed:** The validator receives the complete model and may change issues
  on any managed node after one value-path update. Section 17 nevertheless says
  an external update changes snapshots only on affected root-to-leaf paths and
  ancestors whose aggregates change.
- **Impact:** A valid cross-field validator can require a snapshot change in an
  otherwise data-unaffected sibling, contradicting the stated identity
  guarantee.
- **Recommended correction:** Preserve identity only for nodes whose observable
  presence, dirty, interaction, issues, visibility and derived aggregates do not
  change. Add a fixture where one value update changes a sibling issue while an
  actually unaffected third subtree retains identity.

### M9-SPEC-F006 — Blocked-presence migration contradicts missing-ancestor actions

- **Severity:** High
- **Area:** SPEC-002 sections 9, 11, 15 and 18; ADR-014 sections 2.5 and 2.9
- **Observed:** The accepted behavior permits focus, blur and set below a missing
  ancestor, and SPEC-002 section 15 repeats that projection rule. The Public
  Angular migration table instead requires custom leaf renderers to treat every
  blocked presence as a “non-correctable presentation state”; ADR-014's accepted
  migration text similarly says to handle blocked presence “without corrective
  intentions”. Neither phrase distinguishes `missing-ancestor` from
  `incompatible-ancestor`.
- **Impact:** A custom renderer cannot know whether conforming behavior is to
  emit the allowed missing-ancestor intentions or suppress all blocked-branch
  intentions. This is a conflict with an Accepted ADR, so it cannot be resolved
  silently inside the Draft SPEC.
- **Recommended correction:** Clarify both ADR-014 and SPEC-002: blocked by a
  missing ancestor renders empty and permits focus/blur/set while remove is a
  no-op; blocked by an incompatible ancestor disables/suppresses set, remove and
  interaction. Record the clarification as a reviewed ADR-014 revision before
  accepting the SPEC.

## 4. Passed boundaries

- The normalized object tree plus identity-linked primitive-leaf projection is
  consistent with accepted ADR-014.
- Recursive inline Draft 2020-12 inspection and the closed keyword catalog are
  consistent with accepted ADR-005 revision 1.
- Deep operations remain incremental, terminal-expectation based,
  descriptor-safe and controlled by the application.
- Validation remains replaceable, synchronous and framework neutral; Angular
  remains projection-only and uses Internal object hosts.
- Object dirty, presence, issue assignment, scopes, accessibility and lifecycle
  are coherent apart from the findings above.
- Arrays, refs/composition, layout, batches, dynamic definitions, custom object
  containers, Stable promotion and publication remain inactive.

## 5. Next gate

Before a repeated complete review:

1. obtain explicit approval for corrections F001–F006;
2. revise ADR-014 only for the F006 missing/incompatible clarification and
   review that accepted-decision revision separately;
3. advance SPEC-002 to Draft v0.1.2 with all six corrections and correction
   fixtures;
4. repeat every row in the complete review matrix after the corrections; and
5. keep SPEC-002 unaccepted, PLAN-009 undrafted and M9 implementation inactive
   until a repeated review finishes with zero findings and Ricard explicitly
   accepts the SPEC.

## 6. Approved corrections applied

Ricard approved all six review-1 corrections on 14 July 2026.

- ADR-014 revision 2 is proposed as a narrow clarification that distinguishes
  materializable `missing-ancestor` presentation from disabled
  `incompatible-ancestor` presentation. Accepted revision 1 remains
  authoritative until explicit acceptance of revision 2.
- SPEC-002 advanced to Draft v0.1.2 and closes the runtime-action diagnostic,
  structural UI compatibility, object text diagnostic, exact lookup signature,
  cross-field sharing and renderer-intention contracts.
- Conformance grew from 12 to 15 scenarios to cover each correction without
  activating an implementation plan or a deferred capability.

The correction check also replaced the broad diagnostic sentence “all rows
below” with “all codes in this table”, preventing the error severity of new core
codes from contradicting the warning severity retained by UI and text
diagnostics. This is an editorial closure, not a seventh behavioral change.

## 7. Complete ADR-014 revision 2 review

| Acceptance area                          | Result | Evidence                                                                                               |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| Tree/projection and manual definitions   | Pass   | Revision 2 does not alter the accepted normalized model or definition diagnostics.                     |
| Path, key and DOM identity               | Pass   | Canonical string paths, JSON keys and total DOM tuple encoding remain unchanged.                       |
| Deep operations and expectations         | Pass   | The clarification adds no operation type and preserves terminal expectations/materialization.          |
| Presence, dirty, interaction and sharing | Pass   | Missing remains materializable/focusable; incompatible remains disabled; accepted state rules align.   |
| Validation and scopes                    | Pass   | No validator, assignment, visibility or application-owned scope behavior changes.                      |
| Structural UI Schema                     | Pass   | No layout or schema/UI interpretation moves to renderers.                                              |
| Angular accessibility and lifecycle      | Pass   | Native/custom leaf intention behavior is exact for both blocked reasons; object hosts remain Internal. |
| ADR-009 public API migration             | Pass   | The replacement migration row names the exact Experimental custom-renderer obligation.                 |
| ADR-005/SPEC-002 consistency             | Pass   | SPEC-002 v0.1.2 uses the same reason split and adds matching fixtures.                                 |
| Deferred and publication boundaries      | Pass   | No custom object container, layout, dynamic definition, Stable API or publication is activated.        |

ADR-014 revision 2 passes its complete ten-area review with zero findings,
requested corrections or documentation conflicts. It remains Proposed pending
Ricard's explicit acceptance.

## 8. Repeated complete SPEC review 2

| Acceptance area                     | Result | Evidence                                                                                                     |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| Authority, goals and non-goals      | Pass   | SPEC-001 remains authoritative; Draft/plan/implementation gates and narrow M9 exclusions are explicit.       |
| Recursive schema subset and dialect | Pass   | ADR-005 revision 1 catalog, descriptor-safe traversal, cycles and unsupported capabilities remain unchanged. |
| Structural UI Schema                | Pass   | Every new incompatible member has an exact code, parameter shape, path, severity and deterministic order.    |
| Normalized model and identity       | Pass   | Tree/projection, path/key/DOM identity and immutable manual-definition invariants remain closed.             |
| Deep controlled operations          | Pass   | Traversal, descriptors, atomicity, expectations and terminal-only concurrency remain exact.                  |
| External state, presence and dirty  | Pass   | Accessors, incompatible business data, blocked descendants and structural dirty ownership are coherent.      |
| Runtime actions and interaction     | Pass   | `INCOMPATIBLE_RUNTIME_ANCESTOR` closes result, effects, parameters, paths, fallback and action order.        |
| Snapshot and Public runtime API     | Pass   | `getNodeSnapshot()` now has an exact signature and read-only invalid/unmanaged lookup behavior.              |
| Validation, scopes and visibility   | Pass   | Full-model issue assignment, object aggregation, visibility and application-owned scopes remain neutral.     |
| Text resolution                     | Pass   | Object and leaf diagnostic unions, blank policy, fallback, order, batching and reprojection are distinct.    |
| Angular recursion and accessibility | Pass   | Internal object hosts, semantic grouping and both blocked-reason renderer behaviors are explicit.            |
| Diagnostics and failure isolation   | Pass   | New and reused diagnostics have closed severity, source, parameters, paths, fallback and stopping rules.     |
| Structural sharing and lifecycle    | Pass   | Cross-field validator changes may rebuild affected siblings; truly unchanged third subtrees retain identity. |
| ADR-009 API migration               | Pass   | New/changed/Internal/unchanged surfaces and Experimental classification are explicit.                        |
| Conformance and deferred boundaries | Pass   | Fifteen scenarios cover the contract without arrays, refs, layout, batches, dynamic definitions or release.  |
| Acceptance/authorization sequence   | Pass   | ADR-014 revision 2 must be accepted first; SPEC acceptance would authorize only PLAN-009 preparation.        |

Repeated review 2 passes all 16 areas with zero findings, requested corrections
or documentation conflicts. SPEC-002 remains Draft v0.1.2 pending explicit
acceptance; PLAN-009 is not drafted and M9 implementation remains inactive.

## 9. Recommendation

1. Explicitly accept or reject ADR-014 revision 2.
2. If accepted, explicitly accept or reject SPEC-002 Draft v0.1.2.
3. Only after both acceptances, prepare PLAN-009 without starting M9
   implementation until that plan is separately reviewed and approved.

## 10. Formal acceptance

Ricard explicitly accepted both documents on 14 July 2026 in the required
order:

1. ADR-014 revision 2 became the authoritative M9 architecture after its
   complete ten-area review passed with zero findings.
2. SPEC-002 v0.1.2 then became the Accepted M9 behavioral extension after its
   repeated 16-area review passed with zero findings.

The acceptance resolves the normative M9 gate and authorizes preparation of
PLAN-009 only. It does not approve a plan, activate implementation, publish a
package or promote any Public API from Experimental to Stable.
