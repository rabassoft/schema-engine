# ADR-025 complete review — Cycles 1–4

- **Date:** 2026-07-19
- **State:** Accepted after cycle 4 under the standing authorization to accept
  a completely reviewed document when the result does not widen the promoted
  scope
- **Document:**
  [`ADR-025 revision 0`](../adrs/025-bosques-presentacion-locales-objetos-items.md)
- **Authority:** Accepted SPEC-001 through SPEC-008; ADR-009/010/014/015/017/
  020/021/023/024; accepted review 133; Deferred D-011/D-012/D-013/D-018/
  D-025/D-026/D-045
- **Outcome:** Cycle 4 passed all thirteen areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                        | Correction                                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R134-F01 | The first draft kept section/advanced text-context definition types root-specialized, so template containers could not enter them type-safely. | Widened only their normalized generic node domain to `FormNodeDefinition \| FormNodeTemplate`, leaving context shape and runtime authority unchanged.          |
| R134-F02 | Existing section text failures expose only `sectionId`, which is ambiguous once unrelated local owners may reuse an ID.                        | Required local failures to add the qualified static `sectionKey`; root failures preserve their exact parameters and no item-instance data enters text context. |
| R134-F03 | STATUS, ROADMAP and the Deferred register still described ADR-025 as the next draft rather than an accepted architecture gate.                 | Recorded ADR-025 revision 0 as Accepted, closed its architecture questions and made SPEC-009 preparation/review the exact next action.                         |
| R134-F04 | The ADR/documentation indexes did not yet expose ADR-025 or its complete review.                                                               | Added the accepted decision and review links without creating a SPEC or plan entry.                                                                            |

## Cycle 2 findings and corrections

| ID       | Finding                                                                                                                                                     | Correction                                                                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R134-F05 | The draft said all provider diagnostics were unchanged but later added local owner context to tester/selection diagnostics, leaving their contract unclear. | Limited the unchanged claim to provider-configuration diagnostics and stated that tester/selection codes retain their base parameters plus the exact section 9.3 local context. |
| R134-F06 | The review table's unescaped generic-union pipe split the R134-F01 row and made the recorded correction malformed.                                          | Escaped the pipe, reformatted the complete review and repeated documentation rendering/link checks before cycle 3.                                                              |

## Cycle 3 finding and correction

| ID       | Finding                                                                                                                                          | Correction                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| R134-F07 | STATUS's historical review-133 outcome still said only ADR-025 was authorized after ADR-025 acceptance had advanced the active gate to SPEC-009. | Recast that sentence explicitly as the historical promotion-gate effect and pointed to the now-Accepted ADR/current SPEC-009 state above. |

## 1. Promotion authority and scope

**Pass.** ADR-025 designs exactly review 133's static local-forest boundary.
It reuses sections, tabs, accordion and bounded grid only inside nested objects
and item templates. It does not activate a new presentation kind, workflow,
actions, conditions, scopes, theming, framework target or implementation.

## 2. Raw grammar and direct ownership

**Pass.** Optional `presentation` is admitted only on `ObjectUiSchema` and
`ItemUiSchema`. Each forest names every direct eligible child exactly once.
Objects/arrays remain atomic in their parent forest; identity fields and fixed
object/collection/item text, issues and actions remain outside layout.

Local `order` conflict, valid ordering, absent defaults and owner-local atomic
fallback preserve the accepted root behavior without allowing cross-owner
paths or partial recovery.

## 3. Generic normalized model

**Pass.** Defaulted generic presentation types preserve the unparameterized
root meaning. `TemplatePresentationEntryDefinition` provides one explicit
template specialization without duplicating containers or weakening root
wrappers to an unchecked union.

Required forests on `ObjectFieldDefinition`, `ObjectNodeTemplate` and
`ObjectItemTemplateDefinition` are complete. Exact direct-child object
identity, immutability and shared static templates remain explicit.

## 4. Owner namespaces, keys and compatibility

**Pass.** Root keys stay byte-identical. Ordinary-object, item-template and
template-object owner tuples produce exact local section/container/panel/item
keys. IDs are unique per complete owner forest; unrelated owners may reuse
them safely. Keys contain no runtime item ID or position.

## 5. Inspection, diagnostics and fallback

**Pass.** Descriptor-safe iterative inspection, active cycles, unknown-key
policy and the closed SPEC-008 reason vocabulary remain. Local data/template
paths identify the owner, arrays remain unsupported locations and leaves do not
become presentation owners.

Any defect discards only the selected owner's forest. Existing manual reasons,
local `presentationIndexPath` and exact owner context validate required forests
without running validators, operations or targets after a defect.

## 6. Text resolution

**Pass after R134-F01/F02.** Text contexts widen only their normalized generic
definition domain. No item ID, owner path, snapshot or value enters the Public
resolver. Qualified keys distinguish static definitions; local section
failures add `sectionKey` while root failures remain unchanged.

One exact definition/form/locale result is reused across repeated item
instances. First projection and locale behavior are deterministic, failures do
not multiply with item count and Standard preserves an independent cache.

## 7. Instance identity, state and lifecycle

**Pass.** Concrete owner tuples use absolute object paths or stable item IDs,
never collection indexes. Exact local DOM bases are disjoint from accepted root
bases. Movement preserves item host, focus, field buffers and layout state;
removal destroys once; later reinsertion is a new host; invalid identity exposes
no item layout.

Mounted hidden descendants, reconciliation, validation, initial state and
complete-host replacement preserve SPEC-008 semantics.

## 8. Angular SPI and failure isolation

**Pass.** The same registry/render-model/outlet family widens to the generic
node/template union. No Public address/context/factory/token is introduced.
Exact owner/snapshot/item binding stays Internal, and testers still receive
only frozen normalized containers.

Native fallback, Aria participation, claim audits, selected-host no-retry,
nearest failure ownership and cleanup remain mandatory. Local diagnostic
context is safe and root parameters remain compatible.

## 9. Cross-target evidence

**Pass.** Angular native, Angular Aria and Standard must consume the same
neutral scenario containing ordinary nested objects, repeated item-root layout,
nested object templates and stable movement. Standard remains direct-core and
shares no Angular components, state, DOM helpers or CSS. Semantic rather than
pixel parity remains the criterion.

## 10. Runtime and application authority

**Pass.** Data child/template arrays remain authoritative. Layout adds no
runtime snapshot, method, operation, validator input, issue ownership,
dirty/touched/focused state, scope, persistence or application-controlled
state. Hidden nodes remain managed and validated.

## 11. Public migration and SemVer

**Pass.** The ADR-009 inventory covers the one new core alias, every raw and
normalized core change, text union, Angular SPI declaration, Internal adapter,
pilot behavior and private Standard/reference work. ADR-010 requires at least a
future MINOR plus migration notes but no version or release is selected.

## 12. Deferred boundaries and delivery gates

**Pass.** D-012/D-013/D-018, broader D-025, D-026, D-045, React/Vue, responsive
metadata, generic theming, dynamic definitions, Stable promotion and all
release/external actions remain inactive. Acceptance authorizes only SPEC-009
preparation and complete review, not a plan or implementation.

## 13. Documentation and verification

**Pass after R134-F03/F04/F07.** STATUS, ROADMAP, the Deferred register, ADR
index, documentation index and append-only WORKLOG agree on Accepted ADR-025
and the SPEC-009 next gate. Formatting, 215-document link/consistency checks and
diff checks pass. The unrelated `angular.json` analytics opt-out remains
untouched.

## Cycle 4 result

Cycle 4 repeated all thirteen areas after every correction. It found zero
errors, ambiguities, authority conflicts, missing migration entries, stale
current-state statements or unresolved change requests.

## Accepted effect

ADR-025 revision 0 is Accepted. This acceptance:

1. closes the generic/template model, local owner/key/fallback, text, concrete
   item identity and Angular SPI decisions required by review 133;
2. authorizes drafting and completely reviewing SPEC-009 only;
3. leaves SPEC-008 as the implemented root-only observable contract until an
   accepted extension SPEC explicitly replaces its local-location exclusions;
4. authorizes no plan, implementation, dependency, version, release, commit,
   push or external action; and
5. preserves all unlisted D-011 capabilities and every named Deferred boundary.
