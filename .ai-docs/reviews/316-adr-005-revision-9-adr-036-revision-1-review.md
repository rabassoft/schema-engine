# ADR-005 revision 9 / ADR-036 revision 1 complete review — Cycles 1–2

- **Date:** 2026-08-03
- **Documents:** ADR-005 proposed revision 9 and ADR-036 proposed revision 1
- **Scope:** Exact M33 dialect policy plus one compatibility correction; no
  expansion beyond review 314 cycle 2
- **Authority reviewed:** Accepted ADR-036 revision 0 and its review 315;
  Accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-004 v0.1.1,
  SPEC-011 v0.1.0, SPEC-014 v0.1.0 and SPEC-015 v0.1.0; Accepted ADR-005
  revision 8, ADR-014, ADR-016, ADR-028, ADR-031, ADR-032, ADR-033 and
  ADR-035
- **Outcome:** Cycle 1 found five diagnostic/compatibility defects. After
  correction, cycle 2 repeats all sixteen areas with zero findings and no
  unresolved change request. Both coordinated revisions may be accepted under
  the authorized zero-finding rule.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R316-F01 | Preserve root `oneOf` as `UNSUPPORTED_SCHEMA_KEYWORD`; use incompatible semantics only at typed field locations and keep item/template locations unsupported.                             |
| R316-F02 | Preserve the existing non-blocking `UNMANAGED_REQUIRED_PROPERTY` for outer non-discriminator names through ADR-036 revision 1 and ADR-005 revision 9.                                     |
| R316-F03 | Add exact `invalid-alternative-required` semantics for branch required names that cross or escape their own branch catalog.                                                               |
| R316-F04 | Preserve malformed/accessor `presentation` as `INVALID_UI_SCHEMA_VALUE`; only a structurally valid owner presentation receives the non-blocking dynamic-children incompatibility warning. |
| R316-F05 | Split discriminator inference into unique seed selection plus complete branch validation, making missing/invalid branch reasons reachable while allowing unrelated common enum fields.    |

Cycle 1 cannot support acceptance. After all corrections, cycle 2 restarts the
complete dialect, location, grammar, descriptors, references, diagnostics,
ordering, UI, helper, compatibility, migration and documentation review.

## Cycle 2 complete review

| Area                          | Result | Evidence                                                                                                                        |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1. Revision authority         | Pass   | Revision 9 maps only Accepted ADR-036 M33; revision 1 solely preserves an older warning and closes diagnostics.                 |
| 2. Dialect stability          | Pass   | Draft 2020-12, canonical URI, known/unknown/ignored policy and all prior Accepted revisions remain unchanged.                   |
| 3. Location classification    | Pass   | Eligible ordinary nested property, root unsupported, typed incompatibility and item/template exclusions are disjoint.           |
| 4. Outer catalog              | Pass   | Required object/properties/required/oneOf plus text/default metadata and incompatible semantic siblings are exact.              |
| 5. `oneOf` exterior           | Pass   | At least-two dense object array, descriptor/length/index/extra precedence, paths and safe parameters are closed.                |
| 6. Branch/reference grammar   | Pass   | Ordinary or pure local-reference branch, exact branch catalog, reference positions, provenance and cycles are deterministic.    |
| 7. Discriminator inference    | Pass   | One seeded required outer enum is selected without excluding unrelated common enums, then every branch is validated.            |
| 8. Bijection                  | Pass   | Typed string const membership, uniqueness, coverage and no business-value retention have closed reasons/parameters.             |
| 9. Properties/required        | Pass   | Direct names are disjoint; outer unmanaged warnings survive and branch cross-boundary required is blocking.                     |
| 10. Union/UI policy           | Pass   | Stable union order, one UI Schema, malformed-versus-valid presentation and condition source/target exclusions are exact.        |
| 11. Traversal/stopping        | Pass   | Global and wrapper order, independent continuation, no partial definition and derived-diagnostic suppression are closed.        |
| 12. Diagnostics/provenance    | Pass   | Existing/new families, reason union, exact current/first paths, reference chains and non-retention cover every defect class.    |
| 13. Validation/defaults       | Pass   | Original schema remains validator input and M29 fails contextually at oneOf without branch/default traversal.                   |
| 14. Public/Internal migration | Pass   | Policy changes no signature; later five-type Experimental migration remains SPEC-gated with no dependency/version.              |
| 15. Deferred/delivery gates   | Pass   | Root/items/arrays/general alternatives, SPEC/plan/code/release/Git and every unrelated capability remain inactive.              |
| 16. Documentation/hygiene     | Pass   | ADR index, ROADMAP, STATUS, deferred register, reviews, formatting, links and diff hygiene reconcile the coordinated revisions. |

## Result

Cycle 2 repeats the complete sixteen-area review with zero findings. ADR-036
revision 1 may replace revision 0 only for the explicit required-compatibility
correction, and ADR-005 revision 9 may become the Accepted M33 policy. Their
acceptance would authorize only preparation and complete review of SPEC-019;
it would not authorize a plan, implementation, dependency, version, release,
publication, Git or external action.

## Acceptance follow-up

ADR-036 revision 1 and ADR-005 revision 9 are Accepted on 3 August 2026 under
the authorized zero-finding rule. Acceptance changes no cycle-2 result and
authorizes only preparation and complete review of SPEC-019.
