# ADR-031 complete review — Cycles 1–5

- **Date:** 2026-08-03
- **Scope:** ADR-031 revision 0 and bounded D-007/M28 architecture
  reconciliation
- **State:** Complete; Ricard formally accepted ADR-031 revision 0 on
  2026-08-03
- **Outcome:** Cycle 5 passed all fourteen areas with zero findings and supports
  formal acceptance of ADR-031 revision 0

## Cycle 1 findings and corrections

| Finding                                                                                                     | Correction                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The `allOf` array exterior did not close hostile/malformed `length` before selecting indices.               | Require an own data `length` descriptor with a positive safe integer before dense own-enumerable index inspection.                                               |
| “Accepted object members” did not distinguish ordinary nodes, the document root and collection item root.   | Select contribution members through the exact existing catalog of the current object use site.                                                                   |
| The Draft described `default` as shape-inspected, conflicting with its accepted opaque metadata treatment.  | Preserve the exact metadata-only classification: no execution, copy, combination or application.                                                                 |
| Cycle wording could imply that active raw re-entry through `allOf` was legal sharing.                       | Assign active containment re-entry to `CYCLIC_SCHEMA_OBJECT` and reserve legal sharing for reuse outside the active ancestry.                                    |
| Provenance omitted collection-template `templatePath` and wrapper ordering could supersede global ordering. | Preserve template-relative provenance and the existing input/dialect/policy/`$defs` order plus shape/type-before-compatibility at each composed schema location. |

## Cycle 2 findings and corrections

| Finding                                                                                                  | Correction                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Root use-site catalog” could accidentally admit branch-local `$schema` or `$defs`.                      | Restrict root contributions to object assertion/text members; dialect and registry remain exclusive to the document-root wrapper.                         |
| A pure `$ref` branch widened ADR-016's supported reference positions without stating the exact boundary. | Add only `allOf` indices as non-root reference positions, including root-composition branches, while a direct document-root `$ref` remains invalid.       |
| Duplicate-property/annotation conflicts lacked first-source provenance.                                  | Anchor the diagnostic at the later conflict and require immutable first-source document/reference provenance without retaining schema objects or cursors. |

## Cycle 3 findings and corrections

| Finding                                                                                                           | Correction                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review 258's active header and onboarding summary still described Ricard's already accepted selection as pending. | Record a bounded selection follow-up in review 258 and reconcile its onboarding summary without changing the historical cycle-2 comparison.                   |
| STATUS repeated that D-007 remained wholly Deferred and that no M28/ADR was active after M28 design was selected. | Replace the stale completed-work summary with the exact promoted-design boundary: ADR-031 review active, but no Public contract or implementation authorized. |
| ROADMAP's M28 architecture gate still required completion of the already completed review.                        | Record the complete repeated review as the finished review part of the gate and leave only ADR-031's formal acceptance decision pending.                      |

These active-state inconsistencies invalidate the prior attempted zero-finding
pass even though they do not change ADR-031's architecture. After correction,
cycle 4 restarted the complete fourteen-area review.

## Cycle 4 finding and correction

| Finding                                                                                   | Correction                                                                                                             |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| README's architecture catalog still identified review 259 cycle 3 as the successful pass. | Reconcile that second onboarding location with the current review cycle and include it in the subsequent stale search. |

This remaining active summary invalidated cycle 4. After its correction, cycle
5 restarted the complete fourteen-area review.

## Cycle 5 — complete review

Cycle 5 restarted and passed the complete review:

1. **Locations/catalogs — Pass.** Root, object property, item-root and local-
   reference target positions are closed; primitive/array use and semantic
   wrapper siblings remain excluded.
2. **Exterior/traversal — Pass.** Own data `allOf`, positive safe length, dense
   enumerable ordinary-object branches, iteration, reflection containment and
   no Public depth limit are exact.
3. **Static reduction — Pass.** Nested contributions flatten depth-first by
   branch/property order and duplicate names fail without constraint merging.
4. **Required semantics — Pass.** Required names union after safe branch
   inspection and unmanaged warnings wait for the complete effective catalog.
5. **Annotations — Pass.** UI remains first; exact-equal title/description can
   reduce, conflicts fail and defaults retain opaque metadata-only behavior.
6. **Objects/collections — Pass.** Existing node/template normalization,
   collection policy, item identity, paths and projections remain exact.
7. **References/cycles — Pass.** Only `allOf` indices add reference positions;
   direct root `$ref`, sibling semantics and non-local resources stay invalid,
   with existing raw/reference cycle domains.
8. **Diagnostics — Pass.** Families, later-conflict/first-source provenance,
   document/data/template/reference paths, ordering, branch stopping and no
   partial definition are closed for later normative detail.
9. **UI ownership — Pass.** One use-site UI Schema addresses the effective
   catalog; no branch UI, selector, condition or schema provenance leaks in.
10. **Validation — Pass.** The exact original schema reaches the replaceable
    validator; existing Ajv conjunction needs no production change and cannot
    widen compiler support.
11. **Runtime/adapters — Pass.** Runtime, operations, baseline confirmation,
    asynchronous validation, Angular and Standard consume unchanged contracts.
12. **Public/Internal inventory — Pass.** Only compiler behavior/diagnostics
    change; no Public symbol, signature, definition, package, dependency or
    entry point is added.
13. **Deferred boundary — Pass.** Repeated properties, non-object applicators,
    alternatives, conditionals, resources, AST, expressions, defaults and all
    unrelated capabilities remain inactive.
14. **Follow-up gates — Pass.** Acceptance may authorize only preparation and
    complete review of ADR-005 revision 7; SPEC, plan, code, versions, release,
    Git and external actions remain separately gated.

Prettier, documentation checks for 365 Markdown files and 1,070 local links,
and diff hygiene pass. No unresolved change request or authoritative-document
conflict remains.

## Result

ADR-031 revision 0 has a complete zero-finding review. Ricard formally accepted
it on 2026-08-03, authorizing only preparation and complete review of ADR-005
revision 7.
