# ADR-005 revision 7 complete review — Cycles 1–5

- **Date:** 2026-08-03
- **Scope:** ADR-005 revision 7 Draft coordinated with Accepted ADR-031 and the
  bounded D-007/M28 object-`allOf` architecture
- **State:** Complete; ADR-005 revision 7 accepted under the authorized
  zero-finding/no-scope-expansion rule
- **Outcome:** Cycle 5 passes all eleven areas with zero findings and supports
  formal acceptance of ADR-005 revision 7

## Cycle 1 findings and corrections

| Finding                                                                                                                       | Correction                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Property use sites did not close whether `type` or own `allOf` wins classification; `fieldType: 'reference'` was unreachable. | Classify safe property type before admission, allow absent/object type as a wrapper, reject primitive/array use, and make `allOf`+`$ref` a wrapper with incompatible `$ref`. |
| “Ordinary array” did not state whether a separate prototype condition applied.                                                | Use the existing exact array frontier `Array.isArray(value) === true` without adding another prototype contract.                                                             |
| Invalid `length` parameters could retain `NaN` or infinity as `actualLength`.                                                 | Emit a safe type plus closed reason for non-finite/non-integer/unsafe numbers and expose `actualLength` only for a safe non-positive integer.                                |
| An invalid ordinary contribution could receive both branch-kind and ordinary field/root diagnostics.                          | Select it as a candidate, validate `type` then `properties`, emit one composition diagnostic and inspect the remaining catalog only after safe structural admission.         |
| A pure `$ref` branch resolving to a non-object target had no exact diagnostic anchor.                                         | Anchor the conflict at the canonical target document path, retain the outer branch index and attach the accepted reference chain.                                            |
| Root wrapper traversal could appear to process `$schema`/`$defs` a second time.                                               | Omit both at the wrapper step after their existing global dialect/registry gates.                                                                                            |

## Cycle 2 findings and corrections

| Finding                                                                                               | Correction                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch-local `$schema`/`$defs` at a root composition were excluded architecturally but lacked a code. | Fix `INCOMPATIBLE_SCHEMA_KEYWORD`, `fieldType: 'object'`, no local dialect/registry traversal and branch-result blocking.                             |
| A failed effective array/item catalog did not close dependent collection-policy behavior.             | Suppress only semantic path/identity diagnostics that need that catalog; retain policy exterior, independent policies and `UNUSED_COLLECTION_POLICY`. |
| First-source conflict provenance named paths but did not define their exact source locations.         | Fix the first property-key or text-keyword document path and distinguish it from data/UI paths.                                                       |

## Cycle 3 findings and corrections

| Finding                                                                                                               | Correction                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-005's active header still named revision 4 as latest accepted and described only the old section-13 authority.    | Reconcile latest Accepted revision 6, label the historical revision-2 review and state sections 1–15 Accepted plus section 16 Draft.                  |
| Wrapper admission did not explicitly suppress ordinary missing `type`/`properties` and duplicate sibling diagnostics. | State that wrapper classification replaces ordinary root/field/item requirements and classifies `properties`/`required` exactly once as incompatible. |

Every correction invalidated the prior pass and restarted the complete review.

## Cycle 4 findings and corrections

| Finding                                                                                           | Correction                                                                                       |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| STATUS retained six latest-completed bullets, exceeding the required compact range of three–five. | Remove the redundant selection-history summary while preserving the five most relevant outcomes. |
| The new verification summaries said documentation checks passed without retaining exact counts.   | Record the verified 366 Markdown files and 1,073 local links in review, STATUS and WORKLOG.      |

These state/evidence findings invalidated cycle 4. After correction, cycle 5
restarted the complete eleven-area review.

## Cycle 5 — complete review

Cycle 5 restarted and passed the complete review:

1. **Authority and admission — Pass.** Accepted ADR-031 is the sole authority;
   root, object property, item root and object-mediated target positions are
   exact, while primitive/array composition remains inactive.
2. **Wrapper catalogs — Pass.** Root/field/item members, optional object type,
   ordinary-requirement replacement, sibling classification and root-global
   `$schema`/`$defs` ownership are closed without duplicate diagnostics.
3. **Exterior safety — Pass.** Own enumerable data `allOf`, exact array
   frontier, positive safe length, dense own-enumerable schema entries, extra
   keys, safe parameters and first-failure precedence are deterministic.
4. **Branches and reduction — Pass.** Pure references, nested wrappers and
   ordinary candidates have exact admission, target anchors, stopping and
   iterative depth-first/property order.
5. **Properties and required — Pass.** Names are disjoint, later duplicates
   block, requiredness unions across branches and unmanaged warnings wait for
   the complete effective catalog.
6. **Annotations and provenance — Pass.** UI remains first, exact-equal texts
   reduce, distinct texts conflict, defaults remain opaque, and both current
   and first-source document/reference paths are immutable and unambiguous.
7. **References and cycles — Pass.** Only `allOf` indices widen non-root
   reference positions; syntax, registry, target traversal, direct root `$ref`,
   sharing and the raw/reference cycle domains otherwise remain exact.
8. **Ordering and branch stopping — Pass.** Existing global gates remain first;
   wrapper, branch, conflict, delayed-warning, policy and UI order closes all
   dependent/independent continuation without a partial definition.
9. **UI, collections and validation — Pass.** One use-site UI node, effective
   collection identity, dependent-policy suppression and exact original schema
   delivery preserve accepted ownership.
10. **Public/Internal inventory — Pass.** One diagnostic code and parameter
    semantics change Public behavior without changing any Public signature,
    definition, package, entry point or dependency.
11. **Deferred boundary and gates — Pass.** All wider applicators, repeated-
    property merging, resources, AST, defaults and unrelated capabilities stay
    inactive; acceptance may authorize only preparation/review of an M28 SPEC.

Prettier, documentation checks for 366 Markdown files and 1,073 local links,
and diff hygiene pass. No unresolved change request or authoritative-document
conflict remains.

## Result

ADR-005 revision 7 has a complete zero-finding review and was accepted under
the authorized zero-finding/no-scope-expansion rule. Acceptance authorizes only
preparation and complete review of an M28 extension SPEC; no plan, code,
dependency, version, release, Git or external action starts.
