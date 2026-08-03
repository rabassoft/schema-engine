# SPEC-014 complete review — Cycles 1–5

- **Date:** 2026-08-03
- **Scope:** SPEC-014 v0.1.0 Draft and the bounded D-007/M28 observable
  object-`allOf` compiler contract
- **State:** Complete; SPEC-014 v0.1.0 accepted
- **Outcome:** Cycle 5 passes all fourteen areas with zero findings and supports
  formal acceptance of SPEC-014 v0.1.0

## Cycle 1 findings and corrections

| Finding                                                                                                    | Correction                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Wrapper `type` validation named the exact value but not its complete observable diagnostic.                | Fix code, parameters, fallback, attempted-wrapper continuation and primitive/array branch suppression.                             |
| Semantic wrapper siblings lacked exact parameters/fallback and could appear to add ordinary shape errors.  | Fix the composition `fieldType`, fallback, no value traversal and no duplicate ordinary diagnostic.                                |
| The four `allOf` exterior failures referred to ADR-005 instead of being self-contained.                    | Add exact paths, parameters, descriptor literals, safe-length value rules, code/source/severity and fallback.                      |
| Composition diagnostics did not explicitly distinguish root, managed-property and item-template envelopes. | Omit root `dataPath`, retain managed use-site paths and add absolute array path plus frozen relative `templatePath` for templates. |
| First-source reference provenance lacked an exact immutable type.                                          | Define copied/frozen `DocumentPath` and optional deeply copied/frozen outermost-to-innermost `readonly DocumentPath[]`.            |

## Cycle 2 findings and corrections

| Finding                                                                                                  | Correction                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Root text reduction did not say whether selected `title`/`description` is emitted by the implicit root.  | Keep validation/conflict detection but explicitly emit no new root node/text; object properties retain UI-first resolution and item root still forbids text. |
| The contract did not require a consumer-facing shared scenario or independent Angular/Standard evidence. | Add one shared local-ref plus inline contribution scenario, combined order/requiredness/validation and target-owned projection without Public API expansion. |

Every correction invalidated the prior pass and restarted the complete review.

## Cycle 3 findings and corrections

| Finding                                                                                         | Correction                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| STATUS retained six latest-completed outcomes after SPEC reconciliation.                        | Remove the redundant ADR-031 acceptance-only bullet and retain five complete outcomes.                        |
| Review/STATUS/WORKLOG omitted the exact new documentation counts.                               | Record 368 Markdown files and 1,078 local links.                                                              |
| STATUS task-map still used ADR-005 revision 7's former Draft heading anchor.                    | Point the map at its Accepted section heading.                                                                |
| ADR-031 index/onboarding summaries still stopped authority at the now-completed ADR-005 review. | Reconcile them with Accepted ADR-005 revision 7 and reviewed Draft SPEC-014 without implying SPEC acceptance. |

These state/evidence findings invalidated cycle 3. After correction, cycle 4
restarted the complete fourteen-area review.

## Cycle 4 findings and corrections

| Finding                                                                                   | Correction                                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| STATUS task-map still labeled Accepted ADR-005 revision 7 and ADR-031 as reviewed Drafts. | Rename both map entries to their exact Accepted state. |

This active-state finding invalidated cycle 4. After correction, cycle 5
restarted the complete fourteen-area review.

## Cycle 5 — complete review

Cycle 5 restarted and passed the complete review:

1. **Authority/scope — Pass.** Accepted ADR-031/ADR-005 revision 7 and Accepted
   SPEC-001–004 are the exact baseline; only the bounded M28 contract is Draft.
2. **Locations/catalogs — Pass.** Root, object property, item root and local-
   target wrapper locations plus exact wrapper/contribution catalogs are closed.
3. **Classification/exterior — Pass.** Type precedence, wrapper replacement,
   descriptor-safe `allOf`, safe parameters and first-failure stopping are exact.
4. **Branches/reduction — Pass.** Inline contributions, pure local references,
   nested composition, target anchors and iterative depth-first order are closed.
5. **Properties/required — Pass.** Disjoint names, duplicate stopping, required
   union and delayed unmanaged warnings produce one effective catalog.
6. **Text/defaults — Pass.** Exact-equal text reduction, root non-emission,
   UI-first object text and opaque defaults retain accepted ownership.
7. **Diagnostics/provenance — Pass.** Reused/new codes, reason union, parameters,
   fallbacks, source/use-site/first-source paths, chains and templates are exact.
8. **References/cycles — Pass.** Only `allOf` indices extend SPEC-004; direct
   root `$ref`, reference syntax/targets, sharing and both cycle domains remain.
9. **Ordering/stopping — Pass.** Global and wrapper-local order, independent
   collection, branch blocking and no partial definition are deterministic.
10. **UI/collections — Pass.** One use-site UI node, effective ordering,
    collection identity and dependent-policy suppression are exact.
11. **Validator/runtime/ownership — Pass.** Exact original schema, unchanged
    runtime/operations/adapters and application-owned value/baseline are explicit.
12. **Public/Internal/packages — Pass.** Only compiler behavior/diagnostics
    change; no symbol, signature, definition, package, dependency or version changes.
13. **Conformance/evidence — Pass.** Twenty-one rows cover valid, malformed,
    hostile, provenance, package-regression and independent reference-app evidence.
14. **Exclusions/gates — Pass.** Every wider D-007/deferred capability remains
    inactive; acceptance may authorize only plan preparation/review.

Prettier, documentation checks for 368 Markdown files and 1,078 local links,
and diff hygiene pass. No unresolved change request or authoritative-document
conflict remains.

## Result

SPEC-014 v0.1.0 has a complete zero-finding review and is Accepted under the
authorized zero-finding/no-scope-expansion rule. Acceptance authorizes only
preparation and complete review of PLAN-030; explicit plan approval remains
required before code changes.
