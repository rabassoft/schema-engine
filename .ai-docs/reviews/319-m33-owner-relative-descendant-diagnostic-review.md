# Review 319: M33 owner-relative descendant diagnostic correction

- **Date:** 2026-08-03
- **Decision:** Ricard accepts the recommended owner-relative parameter shape
- **Documents:** ADR-005 revision 10, SPEC-019 v0.1.1 and PLAN-035 revision 1
- **Authority:** Accepted ADR-036 revision 1, SPEC-019 v0.1.0, PLAN-035
  revision 0 and project convergence rules
- **Method:** one complete review cycle after applying the accepted correction
- **Result:** cycle 1 passes all fourteen areas and the unchanged 17-row plan
  mapping with zero findings

## Conflict and accepted correction

ADR-005 revision 9 section 18.2 required outer/common incompatible descendants
to use `unsupported-alternative-descendant`, while section 18.6 required a
`branchIndex` that such a property cannot possess. Inventing a sentinel,
assigning an unrelated branch or silently omitting a mandatory member would
all contradict the Accepted contract.

Ricard accepts the minimal correction:

- an outer/common property has exact parameters `reason`, `property` and
  `expected`, with `branchIndex` absent; and
- a branch property has the same parameters plus its mandatory authored
  `branchIndex`.

Both forms retain exact owner `dataPath`, effective schema `documentPath` and
reference provenance. Neither retains a domain discriminator value, schema
object or cursor.

## Cycle 1 — complete coordinated review

| Area                                                                                | Result |
| ----------------------------------------------------------------------------------- | ------ |
| 1. User decision and authority                                                      | Pass   |
| 2. Exact outer/common owner classification                                          | Pass   |
| 3. Exact branch owner classification and mandatory authored index                   | Pass   |
| 4. Code/reason/fallback/severity/source remain unchanged                            | Pass   |
| 5. Data/document paths and local-reference provenance remain exact                  | Pass   |
| 6. No sentinel, inferred branch or retained business value                          | Pass   |
| 7. Descriptor safety, traversal, ordering and stopping remain unchanged             | Pass   |
| 8. Locations, catalogs, discriminator/bijection and property ownership unchanged    | Pass   |
| 9. Public types, runtime contract, validation, scopes and default helper unchanged  | Pass   |
| 10. Angular/Standard and migration contracts unchanged                              | Pass   |
| 11. SPEC-019 v0.1.1 accurately incorporates only the diagnostic correction          | Pass   |
| 12. PLAN-035 revision 1 retains six checkpoints and exact 1–17 ownership            | Pass   |
| 13. Dependency, manifest, lockfile, version, release, publication and Git unchanged | Pass   |
| 14. Indexes, onboarding, status, links, formatting and diff hygiene                 | Pass   |

The conformance ownership remains exactly checkpoints 1–6 to rows 1–7, 8–12,
13–14, 15, 16 and 17. No row moves, duplicates or gains new behavior.

## Conclusion

Cycle 1 produced zero findings and no unresolved change request. ADR-005
revision 10, SPEC-019 v0.1.1 and PLAN-035 revision 1 are Accepted/Approved as
applicable. The normative blocker is resolved and PLAN-035 checkpoint 1 may
resume. No dependency, package version, release, publication, commit, push or
external action is authorized.
