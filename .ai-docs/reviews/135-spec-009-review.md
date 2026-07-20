# SPEC-009 complete review — Cycles 1–6

- **Date:** 2026-07-19
- **State:** Accepted after cycle 6 under Ricard's standing authorization to
  accept a completely reviewed document when acceptance does not widen the
  approved boundary
- **Document:**
  [`SPEC-009 v0.1.0`](../specs/009-recursive-local-presentation-layout.md)
- **Authority:** Accepted SPEC-001 through SPEC-008, ADR-009, ADR-010,
  ADR-014, ADR-015, ADR-017, ADR-020, ADR-021, ADR-023, ADR-024, accepted
  ADR-025 revision 0, reviews 133/134 and Deferred
  D-011/D-012/D-013/D-018/D-025/D-026/D-045
- **Outcome:** Cycle 6 passed all fourteen areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                                       | Correction                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| R135-F01 | The new SPEC did not initially satisfy repository Markdown formatting.                                                                                        | Formatted the complete document with the workspace formatter before semantic review.                                                                |
| R135-F02 | The Draft existed without its required SPEC/documentation index entries, causing `docs:check` to fail closed.                                                 | Indexed SPEC-009 explicitly as Draft without implying acceptance, a plan or implementation; the documentation check then passed over 216 documents. |
| R135-F03 | The UI diagnostic envelope split inline code across a line break, making warning severity visually ambiguous.                                                 | Rephrased the sentence to state warning severity and exact source without a malformed inline-code span.                                             |
| R135-F04 | The reference scenario said the identity property was “visibly excluded”, which could imply that fixed identity UI must be rendered somewhere else.           | Required an authored direct string identity property that is absent from editable template children and every forest, matching SPEC-003/ADR-025.    |
| R135-F05 | A migration comment said an arbitrary `PresentationEntryDefinition` “wraps” a node even though the selected entry may itself be a section or other container. | Limited the statement to every reachable `form-node` wrapper and preserved the exact unparameterized `FormNodeDefinition` domain.                   |

Every correction restarted the complete applicable review.

## Cycle 2 finding and correction

| ID       | Finding                                                                                                                                                               | Correction                                                                                                                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R135-F06 | The accepted-state opening could call SPEC-008 the continuing “implemented contract”, obscuring that Accepted SPEC-009 is now normative while code remains root-only. | Distinguished the current root-only implementation from the new normative local-forest baseline and preserved SPEC-008 authority only for every rule SPEC-009 does not widen. |

## Cycle 3 finding and correction

| ID       | Finding                                                                                                                                                   | Correction                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| R135-F07 | STATUS's historical review-133 outcome still called SPEC-009 the “current gate” after SPEC-009 acceptance had advanced the exact next action to PLAN-022. | Recast the entry as completed promotion history and pointed to the now-Accepted ADR/SPEC follow-ups without describing either as the current gate. |

## Cycle 4 finding and correction

| ID       | Finding                                                                                                                        | Correction                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R135-F08 | Root onboarding `README.md` still ended its accepted specification inventory at SPEC-008, so final `docs:check` failed closed. | Added Accepted SPEC-009 while distinguishing its normative M20 contract from the still-root-only implementation and unapproved PLAN-022; documentation then passed. |

## Cycle 5 finding and correction

| ID       | Finding                                                                                                                                                     | Correction                                                                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R135-F09 | The review's authority pass still used present-tense Draft wording after acceptance, and its documentation pass cited only the first two of four doc fixes. | Distinguished the pre-acceptance Draft gate from final plan-only authority and cited every formatting/index/current-state/onboarding correction in the pass. |

## 1. Authority and extension precedence

**Pass after R135-F09.** SPEC-009 extends only SPEC-008's root-only
location/type/projection rules after acceptance. It preserves every unchanged
SPEC-001–008 contract. Draft status authorized no plan; Accepted status
authorizes only PLAN-022 preparation/review, never implementation or an
external action.

## 2. Promoted scope and Deferred boundaries

**Pass.** The document activates only static local forests for ordinary nested
objects, item roots and nested object templates. Wizards, actions, conditions,
scopes, dynamic definitions, responsive authoring, broader theming, later
frameworks, legacy Angular, SSR and release work remain inactive.

## 3. Raw grammar and direct ownership

**Pass after R135-F04.** Optional raw members exist only on `ObjectUiSchema`
and `ItemUiSchema`. Each forest names exactly every direct editable child once;
objects and arrays remain atomic, identity fields are excluded and fixed host
content remains outside presentation.

## 4. Generic normalized contracts

**Pass after R135-F05.** The complete defaulted generic family preserves the
unparameterized root domain. One template alias avoids duplicate container
types, and the three structural owner definitions gain exact required forests
with deep immutability and direct-child object identity.

## 5. Inspection, diagnostics and local fallback

**Pass after R135-F03.** Descriptor-safe traversal, member ordering, closed
SPEC-008 reasons and exact document paths remain. Local data/template context
is complete, array hosts remain unsupported and one invalid forest falls back
atomically without affecting any other owner or child array.

## 6. Static identity, keys and manual definitions

**Pass.** Root keys remain byte-identical. Ordinary-object, item-template and
template-object tuples qualify exact local keys. Manual validation retains the
closed reasons/local numeric path, adds only exact frozen owner context and
prevents validator, operation or target invocation after the first defect.

## 7. Text resolution

**Pass.** Only generic definition domains widen. No Public context receives an
owner path, item ID, snapshot or value. One exact static definition/form/locale
result is reused across repeated items; local sections add only `sectionKey`,
and Standard retains an independent source-label cache.

## 8. Concrete identity, state and lifecycle

**Pass.** Exact concrete tuples and DOM bases use stable item strings rather
than positions. Movement preserves hosts, field buffers, focus and independent
layout state; removal destroys once, reinsertion creates fresh state and
identity-invalid collections expose no item forest.

## 9. Accessibility and failure isolation

**Pass.** SPEC-008 roles, relationships, keyboard behavior, mounted hidden
descendants, source order and grid fallback apply at every owner. Local host
failures add safe owner context, stop the nearest subtree and preserve exact
root envelopes and cleanup behavior.

## 10. Angular SPI and pilot

**Pass.** Existing definition/render-model/tester/outlet domains widen to the
exact node/template union. Owner/snapshot/item authority remains Internal;
provider configuration is unchanged, native fallback is mandatory and the
existing Aria registrations must pass without a new symbol, peer, style or
dependency.

## 11. Standard and reference evidence

**Pass.** Standard must independently implement the same neutral forests,
concrete IDs, state and lifecycle. One exact authored scenario covers ordinary
objects, item roots, template objects and movement across native, Aria and
Standard without requiring pixel equality or shared target code.

## 12. Runtime and application ownership

**Pass.** Presentation changes no snapshot, runtime method, validator input,
operation, issue ownership, scope, dirty/touched/focused state, value or
baseline authority. Hidden descendants remain managed and validated.

## 13. Public migration and compatibility

**Pass.** The inventory covers the sole new core alias, all generic/raw/owner/
text declarations, Angular declarations, Internal host work, pilot behavior
and private reference changes. Incompatible Experimental changes require at
least a future MINOR plus migration notes, without selecting a version or
release.

## 14. Documentation and delivery gates

**Pass after R135-F01/F02/F07/F08/F09.** The SPEC, root onboarding,
SPEC/documentation indexes, STATUS, ROADMAP, Deferred register, ADR index and
append-only WORKLOG agree on the accepted contract and plan-only next gate.
Formatting, documentation/link and scoped diff checks pass. No plan, code,
dependency, version, Git or external action occurred; the unrelated
`angular.json` analytics opt-out remains untouched.

## Cycle 6 result

Cycle 6 restarted and repeated all fourteen areas after every correction. It
found zero errors, ambiguities, contract conflicts, missing migration entries,
stale active-state statements or unresolved change requests.

## Accepted effect

SPEC-009 v0.1.0 is Accepted. This acceptance:

1. establishes the observable M20 recursive local-presentation contract;
2. replaces SPEC-008 only for the exact local location, generic type,
   identity, diagnostic and projection rules it widens;
3. authorizes preparation and complete review of PLAN-022 only;
4. does not approve that plan or authorize implementation, dependency,
   version, release, commit, push, registry or repository action; and
5. preserves every unlisted D-011 capability and named Deferred boundary.
