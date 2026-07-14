# M9 ADR joint review — Cycles 1–3

- **State:** Repeated review 3 passed; both ADR revisions accepted
- **Date:** 14 July 2026
- **Reviewed:**
  [`ADR-014 revision 1`](../adrs/014-modelo-objetos-anidados-paths-profundos.md)
  and [`ADR-005 revision 1`](../adrs/005-politica-dialecto-json-schema.md)
- **Compared with:** accepted SPEC-001/ADR-005 baseline, Draft SPEC-002,
  ADR-007/008/009 and deferred boundaries
- **Authorization after acceptance:** Normative design alignment only; no
  implementation

## 1. Review 1 result

Formal review 1 does not pass. The promoted M9 boundary remains coherent, but
ten normative findings must be corrected before the complete joint review is
repeated.

No finding requires arrays, references, composition, advanced layout, batches,
dynamic definitions, custom object renderers, publication or a broader D-014
model. ADR-014 remains Proposed, ADR-005 sections 1–9 remain the accepted
baseline, and M9 implementation remains inactive.

## 2. ADR-014 review matrix

| Acceptance area                          | Result      | Finding or evidence                                                                                                |
| ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Tree/projection and manual definitions   | Conditional | The identity invariant is coherent, but definition diagnostic detail is still open in F008.                        |
| Path, key and DOM identity               | Finding     | DOM encoding is not total for every accepted `formId`; F001.                                                       |
| Deep operations and expectations         | Finding     | On-path descriptor semantics are incomplete; F002. Terminal-only concurrency is not recorded as a trade-off; F010. |
| Presence, dirty, interaction and sharing | Finding     | Blocked-leaf dirty and focus reconciliation are unresolved; F003/F004.                                             |
| Validation and scopes                    | Pass        | Exact-node, nearest-object and global assignment are coherent with controlled full-model validation.               |
| Structural UI Schema                     | Pass        | Recursive structural metadata stays separate from D-011/D-012 layout and declarative scopes.                       |
| Angular accessibility and lifecycle      | Finding     | Isolation is promised without a creation/error contract; F005.                                                     |
| ADR-009 public API migration             | Finding     | Inventory and Internal/Public classification are incomplete; F006.                                                 |
| ADR-005/SPEC-002 consistency             | Finding     | Nested keyword/enum classification and diagnostic closure remain incomplete; F007/F008.                            |
| Deferred and publication boundaries      | Conditional | Boundaries are preserved, but D-014 partial resolution is missing from its register entry; F009.                   |

## 3. ADR-005 revision 1 review matrix

| Acceptance area                             | Result      | Finding or evidence                                                                                     |
| ------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Accepted dialect and unknown-keyword policy | Pass        | Draft 2020-12, canonical URI, missing warning and opaque unknowns are preserved.                        |
| Closed object/primitive catalog             | Finding     | Nested enum and incompatible/ignored object keywords are not classified completely; F007.               |
| Descriptor-safe traversal and cycles        | Pass        | Own descriptors, active ancestry, sibling reuse and iterative finite-depth requirement are explicit.    |
| Paths, ordering and branch stopping         | Conditional | Schema cycle paths are defined; joint diagnostic contracts remain open under F008.                      |
| Normalized/UI consistency                   | Conditional | Structural model is coherent, subject to ADR-014 corrections.                                           |
| Arrays/refs/resources/composition exclusion | Pass        | No deferred schema capability is activated.                                                             |
| Required future fixtures                    | Pass        | Multiple depths, cycles, malformed branches and deterministic order are required before implementation. |
| Authorization boundary                      | Pass        | Revision remains Proposed and authorizes neither implementation nor publication.                        |

## 4. Findings

### M9-ADR-F001 — DOM identity is not total for accepted form IDs

- **Severity:** High
- **Area:** ADR-014 2.2 and 6.2
- **Observed:** DOM bases separately call `encodeURIComponent(formId)` and
  `encodeURIComponent(key)`. Accepted runtime options require only a non-empty
  string, while `encodeURIComponent()` throws for a lone UTF-16 surrogate.
- **Impact:** A valid public `formId` can cause an unexpected renderer exception,
  so the claimed deterministic collision-safe DOM identity is incomplete.
- **Recommended correction:** Encode one `JSON.stringify([formId, path])` tuple
  and then apply `encodeURIComponent()` to the JSON string. JSON escaping makes
  lone surrogates safe and the tuple makes component boundaries unambiguous.
  Define suffix construction and fixtures for punctuation, Unicode and lone
  surrogates.

### M9-ADR-F002 — On-path property descriptors are unspecified

- **Severity:** High
- **Area:** ADR-014 2.4
- **Observed:** The proposal preserves prototypes and non-target descriptors
  and uses `Object.defineProperty()`, but does not define attributes for newly
  created ancestors or replaced ancestor/terminal properties.
- **Impact:** Two compliant implementations could return observably different
  writable/enumerable/configurable descriptors, conflicting with PLAN-002's
  accepted exact target-descriptor rule.
- **Recommended correction:** State that every created or replaced on-path
  property is a writable, enumerable, configurable data property; every
  off-path own descriptor and each cloned source prototype is preserved.

### M9-ADR-F003 — Dirty ownership for blocked leaves is undefined

- **Severity:** High
- **Area:** ADR-014 2.5–2.6
- **Observed:** Object dirty covers missing/incompatible branches, while leaf
  dirty is only defined for accessible terminal values. A leaf blocked in
  `value`, `baselineValue`, or both has no normative dirty result.
- **Impact:** `snapshot.fields` and the tree can disagree across implementations,
  especially for missing versus present-empty objects.
- **Recommended correction:** Make blocked leaf dirty `false` and assign
  structural branch differences exclusively to the nearest object snapshot.
  Add a matrix for accessible/blocked value and baseline combinations.

### M9-ADR-F004 — Focus reconciliation on incompatible transitions is missing

- **Severity:** High
- **Area:** ADR-014 2.5–2.6 and Angular lifecycle
- **Observed:** Missing ancestors allow focus, incompatible ancestors reject it,
  but an external update can turn a currently focused branch incompatible.
- **Impact:** Runtime can retain a focused descendant that Angular disables,
  breaking the single-focus and lifecycle invariants.
- **Recommended correction:** Atomically clear descendant focus without marking
  touched when an external update first makes an ancestor incompatible. Keep
  existing touched state; missing ancestors remain focusable.

### M9-ADR-F005 — Angular subtree isolation lacks a mechanism and diagnostic

- **Severity:** High
- **Area:** ADR-014 2.8
- **Observed:** The ADR promises that an object-host failure is isolated to its
  subtree, but does not define how the fixed internal host is created, owned or
  reported. ADR-008 only closes programmatic creation for leaf renderers.
- **Impact:** A template-recursive implementation may propagate an exception
  through the full form and still appear compliant.
- **Recommended correction:** Define an Internal node outlet that creates the
  Internal object host with `ViewContainerRef` and creation bindings, owns its
  lifecycle and converts creation failure to a closed
  `OBJECT_HOST_INSTANTIATION_FAILED` adapter diagnostic. Alternatively remove
  the isolation promise; the first option better preserves the reviewed scope.

### M9-ADR-F006 — Public API migration inventory is incomplete

- **Severity:** Medium
- **Area:** ADR-014 2.9 and ADR-009
- **Observed:** The proposal names new families but does not explicitly list
  changes to `UiSchema.fields`, `FormDefinition`, `FieldRuntimeSnapshot`,
  `FormRuntimeSnapshot`, `TextResolutionContext`, `FormRuntime`, custom renderer
  handling or key semantics. SPEC-002 exports `AngularObjectTextSnapshot` even
  though custom object hosts are deferred.
- **Impact:** PLAN-009 could miss a transitive breaking change or accidentally
  expand the Angular public surface.
- **Recommended correction:** Add an exact changed/new symbol table. Keep the
  fixed object host and `AngularObjectTextSnapshot` Internal; expose only core
  object text contexts required transitively by `TextResolver`. Require custom
  leaf renderers to handle `nodeKind` and blocked presence.

### M9-ADR-F007 — Nested keyword and enum classification is incomplete

- **Severity:** High
- **Area:** ADR-005 revision 1 sections 10.1–10.2
- **Observed:** Accepted ADR-011 limits enum to “direct” string fields. Revision
  1 says primitive catalogs remain unchanged but does not explicitly extend
  that exception to nested primitive leaves. It also does not close `enum` and
  primitive constraints on object nodes or the ignored-annotation catalog at
  object nodes.
- **Impact:** The same nested schema can validly produce different
  `INCOMPATIBLE_SCHEMA_KEYWORD`, `UNSUPPORTED_SCHEMA_KEYWORD` or ignored-warning
  results.
- **Recommended correction:** Explicitly support the ADR-011 enum subset at any
  primitive leaf reached through supported inline `properties`; classify enum
  and primitive constraints on object nodes as incompatible; retain the known
  ignored-annotation catalog at object and primitive field nodes; keep refs,
  applicators, arrays and resource keywords unsupported.

### M9-ADR-F008 — Diagnostic contracts remain deliberately open

- **Severity:** High
- **Area:** ADR-014 acceptance criteria and SPEC-002 section 16
- **Observed:** SPEC-002 states that exact parameters, ordering, fallbacks and
  branch-stop rules remain to be closed. Manual-definition reasons omit exact
  indices/paths; external accessor failures do not close offending path
  parameters; UI-cycle and prospective object-host diagnostics are not fully
  specified.
- **Impact:** ADR acceptance would leave observable Public + Experimental
  behavior unresolved and prevent a deterministic PLAN-009 matrix.
- **Recommended correction:** Add closed tables for definition validation,
  external state accessors, both cycle codes, incompatible operation ancestors
  and object-host creation, including severity, source, parameters,
  `dataPath`/`documentPath`, ordering, fallback and immutable-copy rules.

### M9-ADR-F009 — D-014 partial resolution is absent from the register

- **Severity:** Medium
- **Area:** Deferred-boundary traceability
- **Observed:** ADR-014 says it resolves only the nested-object portion of D-014
  while D-014 remains Research, but the D-014 entry records no partial
  resolution or remaining boundary.
- **Impact:** Persistent state cannot distinguish the resolved tree/projection
  choice from the still-open generic AST, resolved graph, render plan and model
  versioning questions.
- **Recommended correction:** Add a partial-resolution note linking ADR-014 and
  explicitly retain the broader D-014 questions as Research.

### M9-ADR-F010 — Terminal-only concurrency has no recorded downside

- **Severity:** Medium
- **Area:** ADR-014 consequences
- **Observed:** The decision intentionally checks only terminal expectation and
  permits a concurrently replaced compatible ancestor, but the negative
  consequences do not record that ancestor replacement is undetected when the
  terminal state still matches.
- **Impact:** Consumers may overestimate the conflict-detection guarantee.
- **Recommended correction:** Record the limitation explicitly and require a
  concurrency fixture showing compatible ancestor replacement is preserved,
  while terminal mismatch remains stale.

## 5. Passed boundaries

- The normalized tree plus identity-linked leaf projection is a coherent,
  narrow answer to the promoted object use case.
- Terminal-only expectation is internally consistent once its limitation is
  explicit.
- Missing-ancestor materialization and non-pruning avoid D-021 batches.
- Full-model synchronous validation and nearest-object issue assignment remain
  framework neutral.
- Structural UI metadata does not activate layout or declarative scopes.
- ADR-007 remains leaf-only and no custom object renderer registry is created.
- Draft 2020-12 and opaque unknown keyword behavior remain unchanged.
- No package, entry point, stability, publication or licensing decision is
  activated.

## 6. Review 1 next gate — completed

Corrections must be explicitly approved before they change ADR-014, ADR-005 or
SPEC-002. After applying all accepted corrections:

1. increment ADR-014 to revision 1 and SPEC-002 to Draft v0.1.1;
2. record proposed ADR-005 revision 1 corrections without altering its accepted
   baseline;
3. repeat the complete joint review across every matrix row;
4. keep both ADR proposals unaccepted if any finding remains; and
5. review SPEC-002 separately only after the joint ADR review reaches zero
   findings.

## 7. Approved corrections applied

Ricard approved all ten corrections on 14 July 2026, with two reviewed
refinements:

- F003 adds blocked presence to descendant objects as well as leaves, makes
  every blocked descendant locally clean and assigns structural dirty only to
  the first missing/incompatible object.
- F005 limits Angular isolation to synchronous object-host creation/binding
  failure; it does not claim a general Angular exception boundary.

ADR-014 advanced to revision 1 and SPEC-002 to Draft v0.1.1. The proposed
ADR-005 revision 1 text was corrected without changing accepted sections 1–9.
D-014 gained a non-authoritative partial-resolution note while retaining its
broader Research state.

The first correction check additionally found and repaired four drafting
details before the required full repeat: root `enum` retains ADR-011's accepted
unsupported classification, the Internal node outlet does not claim that
`createComponent()` creates a directive, the API inventory names transitive
Public contracts explicitly, and manual-definition diagnostics distinguish a
reused node. No architectural boundary changed.

## 8. Repeated joint review 2

### 8.1 ADR-014 revision 1

| Acceptance area                          | Result | Evidence                                                                                        |
| ---------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| Tree/projection and manual definitions   | Pass   | Identity, reuse/cycle/projection invariants and exact diagnostic locators are closed.           |
| Path, key and DOM identity               | Pass   | One JSON tuple is URI-encoded totally; suffixes and hostile Unicode fixtures are fixed.         |
| Deep operations and expectations         | Pass   | On/off-path descriptors and terminal-only conflict limitations are explicit.                    |
| Presence, dirty, interaction and sharing | Pass   | Objects/leaves share blocked semantics, dirty ownership matrix and atomic focus reconciliation. |
| Validation and scopes                    | Pass   | Exact-node, nearest-object and global assignment remain controlled and framework-neutral.       |
| Structural UI Schema                     | Pass   | Recursive structure, active-ancestry cycles and option compatibility do not activate layout.    |
| Angular accessibility and lifecycle      | Pass   | Internal host/outlet ownership, bounded creation failure and accessible IDs are explicit.       |
| ADR-009 public API migration             | Pass   | New, changed, Internal and unchanged contracts are inventoried exactly.                         |
| ADR-005/SPEC-002 consistency             | Pass   | Keyword locations, diagnostics, presence, IDs and conformance fixtures align.                   |
| Deferred and publication boundaries      | Pass   | D-014 is only partially proposed; all unrelated capabilities remain inactive.                   |

### 8.2 Proposed ADR-005 revision 1

| Acceptance area                             | Result | Evidence                                                                                                    |
| ------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| Accepted dialect and unknown-keyword policy | Pass   | Draft 2020-12, canonical URI, missing warning and opaque unknowns are unchanged.                            |
| Closed object/primitive catalog             | Pass   | Nested enum, object/primitive incompatibilities, ignored annotations and unsupported families are explicit. |
| Descriptor-safe traversal and cycles        | Pass   | Own descriptors, active ancestry, sibling reuse and finite-depth iteration remain required.                 |
| Paths, ordering and branch stopping         | Pass   | Deep document/data paths, schema-before-UI order and independent sibling continuation are closed.           |
| Normalized/UI consistency                   | Pass   | The recursive compiler boundary matches ADR-014 revision 1 and SPEC-002 v0.1.1.                             |
| Arrays/refs/resources/composition exclusion | Pass   | Every deferred schema family remains unsupported and untraversed.                                           |
| Required future fixtures                    | Pass   | Depth, malformed branches, cycles, diagnostics and keyword locations are required.                          |
| Authorization boundary                      | Pass   | The revision remains Proposed and authorizes neither implementation nor publication.                        |

## 9. Review 2 result and next gate

Repeated joint review 2 passes with zero findings or requested corrections.
This pass does not itself accept either proposal. The exact next gate is
explicit acceptance or rejection of ADR-014 revision 1 and ADR-005 revision 1.
Only after both are accepted may SPEC-002 Draft v0.1.1 receive its separate
complete review. PLAN-009 and M9 implementation remain inactive.

## 10. Acceptance-sequence correction

The formal acceptance audit after review 2 found one process conflict, not an
architectural finding: proposed ADR-005 revision 1 said it would become
authoritative together with SPEC-002, while SPEC-002 correctly requires both
ADRs to be accepted before its separate review and acceptance.

Ricard approved the minimal correction on 14 July 2026. ADR-005 now requires
explicit acceptance coordinated with ADR-014 and places the separate SPEC-002
review after both ADRs are accepted. No decision content, observable contract,
scope or implementation authorization changed.

Because project workflow requires a complete repeat after every correction,
the full joint matrix was reviewed again rather than checking only the changed
sentence.

## 11. Repeated joint review 3

### 11.1 ADR-014 revision 1

| Acceptance area                          | Result | Evidence                                                                                                   |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| Tree/projection and manual definitions   | Pass   | Identity-linked tree/projection, reuse, cycles and exact manual-definition diagnostics remain closed.      |
| Path, key and DOM identity               | Pass   | String paths, JSON keys, total tuple encoding and fixed suffixes remain collision-safe.                    |
| Deep operations and expectations         | Pass   | Descriptor-safe chain cloning, atomic failures and terminal-only conflict limits remain explicit.          |
| Presence, dirty, interaction and sharing | Pass   | Blocked objects/leaves, single dirty owner, focus reconciliation and sharing remain deterministic.         |
| Validation and scopes                    | Pass   | Full-model validation, exact/deep issue assignment and object scopes remain framework-neutral.             |
| Structural UI Schema                     | Pass   | Recursive grouping and UI cycles remain structural without activating layout or declarative scopes.        |
| Angular accessibility and lifecycle      | Pass   | Fixed Internal host/outlet, bounded creation failure and accessible grouping remain explicit.              |
| ADR-009 public API migration             | Pass   | New, changed, Internal and unchanged surfaces remain exhaustively inventoried.                             |
| ADR-005/SPEC-002 consistency             | Pass   | Keyword, traversal, diagnostics, identity, presence and conformance contracts remain aligned.              |
| Deferred and publication boundaries      | Pass   | Only D-005 and the narrow proposed D-014 portion are involved; implementation/publication remain inactive. |

### 11.2 Proposed ADR-005 revision 1

| Acceptance area                             | Result | Evidence                                                                                                         |
| ------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| Accepted dialect and unknown-keyword policy | Pass   | Draft 2020-12, canonical URI, missing warning and opaque unknown behavior remain unchanged.                      |
| Closed object/primitive catalog             | Pass   | Supported, incompatible, ignored and unsupported locations remain explicit at every nested node.                 |
| Descriptor-safe traversal and cycles        | Pass   | Own descriptors, active ancestry, sibling reuse and finite-depth iteration remain required.                      |
| Paths, ordering and branch stopping         | Pass   | Deep document/data paths and deterministic schema-before-UI traversal remain closed.                             |
| Normalized/UI consistency                   | Pass   | Recursive schema/UI traversal remains aligned with ADR-014 revision 1 and Draft SPEC-002 v0.1.1.                 |
| Arrays/refs/resources/composition exclusion | Pass   | Deferred schema families remain unsupported, opaque or untraversed as specified.                                 |
| Required future fixtures                    | Pass   | Multiple depths, cycles, malformed nodes, keyword locations and ordering remain required.                        |
| Authorization boundary                      | Pass   | Acceptance sequence is now acyclic: both ADRs first, then separate SPEC review; no implementation is authorized. |

## 12. Review 3 result and next gate

Repeated joint review 3 passes with zero findings, corrections or documentation
conflicts. ADR-014 revision 1 and ADR-005 revision 1 are technically ready for
coordinated explicit acceptance. This review does not itself change their
states. After both are accepted, the exact next gate is the separate complete
review of SPEC-002 Draft v0.1.1; PLAN-009 and M9 implementation remain inactive.

## 13. Coordinated formal acceptance

Ricard explicitly accepted ADR-014 revision 1 and ADR-005 revision 1 together
on 14 July 2026, following the recommendation of zero-finding joint review 3.

The acceptance makes the normalized nested-object model, deep controlled-path
architecture and recursive inline JSON Schema dialect policy authoritative for
M9 design. It does not accept SPEC-002, approve PLAN-009, authorize code changes
or activate publication. SPEC-001 v0.1.15 remains the behavioral source of
truth until SPEC-002 passes its separate complete review and is explicitly
accepted.

The exact next gate is the complete review of SPEC-002 Draft v0.1.1. M9
implementation remains inactive.
