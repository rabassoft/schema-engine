# ADR-005 revision 8 complete review — Cycles 1–2

- **Date:** 2026-08-03
- **State:** Complete; Accepted under the approved no-scope-expansion rule
- **Scope:** ADR-005 revision 8 policy for the bounded ADR-034/M31 schema
- **Authority reviewed:** Review 292 cycle 3; Accepted ADR-005 revisions 0–7,
  ADR-011, ADR-015, ADR-031 and ADR-034; Accepted SPEC-001, SPEC-003 and
  SPEC-014; deferred D-006 boundary
- **Outcome:** Cycle 1 found five policy defects. After correction, cycle 2
  repeated all ten areas with zero findings and ADR-005 revision 8 is Accepted.

## Cycle 1 — findings and corrections

| Finding                                                                                                                                                       | Correction                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A generic new `items` expected string would alter the Accepted SPEC-003 diagnostic for malformed M10 collections.                                             | Preserve `inline object item schema` unless an exact safe `uniqueItems: true` marker selects the M31 alternative `string-enum item schema`.         |
| The first catalog draft both called outer `format` incompatible and said it retained the Accepted ignored warning, while item `format` ownership was unclear. | Keep outer `format` ignored exactly; classify item `format` as incompatible because the item schema is not a data field or semantic-format owner.   |
| Reusing ADR-011 did not define missing/inherited `items.enum`, because enum is optional on an ordinary string leaf but required for M31.                      | Add exact missing/accessor diagnostics before reusing ADR-011's present-value shapes, element order and duplicate handling.                         |
| The outer catalog grouped `const` with incompatible members even though ADR-005 revision 6 already classifies `const` on arrays as unsupported.               | Preserve `UNSUPPORTED_SCHEMA_KEYWORD` for outer `const` and unlisted array keywords; reserve incompatible for type-specific wrong-location members. |
| M31 condition members were described only as incompatible, which could bypass ADR-033's closed diagnostic family.                                             | Retain `INVALID_UI_FIELD_CONDITION` with `unsupported-target-location` for both members; no generic warning replaces it.                            |

After all five corrections, cycle 2 restarted authority, classification,
catalog, required members, UI, traversal, ownership, migration, exclusions and
delivery/documentation review in full.

## Cycle 2 — complete zero-finding review

| Area                                   | Result | Evidence                                                                                                                                                          |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and M10 separation        | Pass   | Revision 8 implements only Accepted ADR-034 policy; M10 object collections retain identity, policies, templates, operations and exact malformed-items behavior.   |
| 2. Locations and family classification | Pass   | Only ordinary non-template array properties qualify; safe `items.type` distinguishes object/string without inference, root/template/nested arrays remain blocked. |
| 3. Closed schema catalogs              | Pass   | Outer and item members have exact supported, incompatible, unsupported, ignored and unknown treatment without enabling free/nullable/mixed arrays.                |
| 4. Required `uniqueItems`              | Pass   | Own enumerable exact true, missing/accessor/non-enumerable/value diagnostics, false evidence and branch independence are deterministic.                           |
| 5. Required item enum                  | Pass   | Missing/accessor handling plus complete ADR-011 shape, dense index, uniqueness, path, provenance and copying rules are exact.                                     |
| 6. UI Schema and labels                | Pass   | M31 selects Field UI, reuses ordered labels, suppresses only derived diagnostics and preserves exact condition-family failures; M10 remains Array UI.             |
| 7. Traversal and branch stopping       | Pass   | Family detachment, outer/items/dependent/enum order, policy timing, references/composition, independent diagnostics and no partial result are closed.             |
| 8. Validator and ownership             | Pass   | Original schema/full value remain validator inputs; core neither rewrites assertions nor changes ADR-034's application-owned atomic runtime.                      |
| 9. Public/Internal and exclusions      | Pass   | Policy changes no signature/dependency/version; compiler behavior and diagnostics are inventoried while every wider array/target/release boundary stays Deferred. |
| 10. Delivery and documentation         | Pass   | Revision 8 authorizes only SPEC-017 preparation/review; documentation, local links, repository formatting and diff hygiene pass.                                  |

## Verification

- `pnpm docs:check`, `pnpm format:check` and `git diff --check` pass.
- The scoped policy change contains no SPEC, plan, source, test, manifest,
  lockfile, dependency, version or external-state mutation.

## Result

Cycle 2 has zero findings and no unresolved change request. Under Ricard's
approved rule allowing acceptance after a complete zero-finding review without
scope expansion, ADR-005 revision 8 is Accepted. Its only immediate effect is
authorization to draft and completely review SPEC-017; it does not authorize a
plan, implementation, dependency, version, release, commit, push or external
action.
