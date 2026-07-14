# SPEC-004 complete review — Cycles 1–5

- **State:** Accepted; repeated complete review cycle 5 passed all ten areas
  with zero findings and Ricard formally accepted SPEC-004 v0.1.1 on 15 July
  2026
- **Date:** 14 July 2026
- **Reviewed:** complete SPEC-004 v0.1.0, corrections in v0.1.1 and every
  current-state document affected by its gate
- **Compared with:** accepted ADR-016, ADR-005 revision 3, SPEC-001 v0.1.15,
  SPEC-002 v0.1.2, SPEC-003 v0.1.2, ADR-009, D-007/D-014/D-041 and review 018
- **Primary standards:** JSON Schema Draft 2020-12 Core, RFC 3986 and RFC 6901

## 1. Result

Cycle 1 reviewed the complete Draft across ten acceptance areas. Its promoted
scope and main observable contracts matched the accepted architecture, but six
points still allowed different conforming implementations or left verification
evidence incomplete.

SPEC-004 v0.1.1 applies every contract correction. Cycle 2 repeated the
complete review and found one current-state consistency defect outside the SPEC:
`STATUS.md` still named v0.1.0, and the automated documentation check did not
compare proposed SPEC metadata against its source file. Both were corrected.
Cycle 3 then repeated the complete review and found that the dedicated SPEC
index still ended at SPEC-003 while the enhanced checker treated that index as
a malformed SPEC source. The index and structural check were corrected. Cycle
4 then found that the check correlated an identifier and state/version anywhere
in the index rather than within the same entry. Entry-level correlation was
fixed. Cycle 5 finally repeated the complete review against the same authorities
and primary standards and passed all ten areas with zero findings, unresolved
changes or documentation conflicts. Ricard then accepted the reviewed SPEC on
15 July 2026. Acceptance authorizes plan preparation and review, not plan
approval or implementation.

## 2. Cycle 1 findings and corrections

1. **Array-element boundary.** Canonical decimal grammar did not distinguish a
   JSON array element from an extra JavaScript property or close oversized
   token behavior. The correction requires an in-range existing element and
   maps canonical out-of-range/too-large/sparse tokens to `missing-target`
   without lossy conversion.
2. **Root `$ref` order.** The diagnostic was defined but its position relative
   to root members was not. It now follows dialect/policy/`$defs` work and
   precedes ordinary root-member checks.
3. **Definition-entry continuation.** The Draft did not state whether one
   malformed `$defs` entry stopped later valid entries. It now validates every
   selected entry in order and continues independent indexing/resolution for
   diagnostics while the result remains blocking.
4. **Cycle locator.** `firstDocumentPath` could be read as a reference-keyword
   path. It now identifies exactly the canonical target path at its first active
   occurrence.
5. **Supported-position coverage.** Conformance scenarios grouped collection
   targets too broadly. They now name primitive, object, array-property, array
   `items` root and item-descendant reference positions.
6. **Primary references.** The SPEC invoked three standards only transitively
   through ADRs. It now links the exact normative JSON Schema and RFC sources.

These corrections add no capability, Public symbol/signature, package,
dependency, implementation, publication or Stable state.

## 3. Cycle 2 finding and correction

7. **Draft-version consistency.** The canonical checkpoint retained SPEC-004
   v0.1.0 after contract corrections produced v0.1.1, and `docs:check` verified
   only accepted versions. `STATUS.md` now names the exact Draft and the check
   compares every accepted/proposed SPEC identifier, state and version with its
   source metadata and both onboarding indexes.

## 4. Cycle 3 finding and correction

8. **Specification index coverage.** `.ai-docs/specs/000-index.md` omitted
   SPEC-004, and the first metadata implementation parsed the index as if it
   were a SPEC source. The index now reports every SPEC state/version and
   `docs:check` skips it as a source while validating it explicitly against all
   specification metadata.

## 5. Cycle 4 finding and correction

9. **Index-entry correlation.** The checker could match a SPEC identifier on
   one line and an accepted state/version on another, masking a crossed version
   between specifications. It now locates the exact identifier entry first and
   validates that entry's own state/version text.

## 6. Repeated cycle 5 evidence

| Acceptance area                                             | Result |
| ----------------------------------------------------------- | ------ |
| Authority, promoted scope and unchanged accepted behavior   | Pass   |
| `$defs` exterior, entries, laziness and stopping            | Pass   |
| Reference-object catalog and root/non-root ordering         | Pass   |
| RFC 3986 fragment and RFC 6901 pointer behavior             | Pass   |
| Descriptor safety, traversal, sharing and cycle domains     | Pass   |
| Codes, reasons, parameters, paths, chains and fallbacks     | Pass   |
| Schema/UI/collection-policy provenance and global ordering  | Pass   |
| Public/Internal inventory and original-validator ownership  | Pass   |
| D-007/D-014, package, publication and stability boundaries  | Pass   |
| Conformance matrix, acceptance gate and documentation state | Pass   |

## 7. Gate state

SPEC-004 v0.1.1 is Accepted after its complete repeated review passed with zero
findings. The exact next action is to draft and review PLAN-011; that plan still
requires explicit approval before code changes.
