# ADR-005 revision 3 complete review — Cycles 1–2

- **State:** Accepted; repeated review cycle 2 passed all ten areas with zero
  findings and Ricard accepted ADR-005 revision 3 formally
- **Date:** 14 July 2026
- **Reviewed:** complete proposed revision 3, section 12 of
  [`ADR-005`](../adrs/005-politica-dialecto-json-schema.md)
- **Compared with:** accepted [`ADR-016`](../adrs/016-resolucion-referencias-locales.md),
  ADR-009, ADR-014 revision 2, ADR-015 revision 4, accepted SPEC-001 v0.1.15,
  SPEC-002 v0.1.2, SPEC-003 v0.1.2, review 017 and D-007/D-014/D-041 in the
  [deferred-decision register](../roadmap/deferred-decisions.md)
- **Primary standards:** JSON Schema Draft 2020-12 Core, RFC 3986 and RFC 6901

## 1. Result

Cycle 1 reviewed the full proposal across its ten required acceptance areas.
The promoted boundary and main contracts were consistent, but six areas still
allowed different conforming interpretations or conflicted with another
sentence in the draft.

Every finding was corrected in ADR-005 revision 3. Cycle 2 repeated the complete
review against the same authority and primary standards and passed all ten areas
with zero findings or unresolved change requests. At review completion revision
3 remained Proposed and this document supplied its acceptance evidence. Ricard
subsequently accepted revision 3 formally, authorizing only preparation and
review of SPEC-004.

## 2. Cycle 1 findings and corrections

1. **Malformed `$defs` exterior stopping.** The draft did not say whether a bad
   registry also generated entry/use-site cascades. It now emits exactly its
   exterior diagnostic, suppresses dependent indexing/resolution and preserves
   only independent root/reference shape/sibling diagnostics.
2. **Registry provenance.** Exterior/index diagnostics lacked an explicit
   statement about managed paths and chains. They now have neither `dataPath`
   nor `referenceChain` because no use site exists.
3. **URI-reference grammar and precedence.** `invalid-uri-reference` lacked a
   deterministic boundary. The correction fixes RFC 3986 fragment characters,
   percent triplets, UTF-8 decoding, second-`#` rejection and first-applicable
   validation order.
4. **Raw versus decoded fragment form.** The draft simultaneously required a
   raw `#/` prefix and allowed percent-decoding before pointer parsing. It now
   requires fragment-only input and the `/` form after the single decoding, so
   percent-encoded separators have one unambiguous result.
5. **Closed reason inventory.** `invalid-json-pointer` had no distinct reachable
   case once plain-name, escape and scope failures were separated. It was
   removed; empty/out-of-scope pointers use `outside-definitions` and non-empty
   decoded non-pointer fragments use `plain-name-fragment-not-supported`.
6. **Unresolved target locator and Public baseline.** `targetDocumentPath` did
   not say whether it represented the desired target or failure point, and the
   unchanged-envelope statement incorrectly covered malformed `$defs` without
   `$ref`. It now ends at the first failing token, fixes array-token conversion,
   and preserves exact old envelopes only when neither M11 construct is used.

These corrections neither widen ADR-016/D-041 nor alter an accepted behavior.
They add no Public signature, package, dependency, publication or Stable state.

## 3. Repeated cycle 2 evidence

| Acceptance area                                            | Result |
| ---------------------------------------------------------- | ------ |
| Existing dialect, unknown/annotation and M1–M10 behavior   | Pass   |
| `$defs` and reference-object catalog, shape and ordering   | Pass   |
| Fragment-only URI, percent-decoding and JSON Pointer       | Pass   |
| Descriptor safety, sharing and both cycle domains          | Pass   |
| Codes, reasons, parameters, paths, fallbacks and stopping  | Pass   |
| Schema/UI/collection-policy provenance                     | Pass   |
| Public/Internal inventory and original validator schema    | Pass   |
| ADR-016 and accepted SPEC/ADR consistency                  | Pass   |
| D-007/D-014, package, publication and stability boundaries | Pass   |
| Follow-up gates and absence of implementation authority    | Pass   |

## 4. Gate state

Ricard formally accepted ADR-005 revision 3 on 14 July 2026. The next action is
drafting and reviewing SPEC-004. SPEC-004 still requires its own complete review
and acceptance, followed by an approved implementation plan, before code
changes.
