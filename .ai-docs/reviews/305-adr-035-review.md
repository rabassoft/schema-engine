# ADR-035 complete review — Cycles 1–2

- **Date:** 2026-08-03
- **Scope:** ADR-035 revision 0 and its review-304 promotion authority
- **Outcome:** Cycle 1 found six migration/descriptor/runtime wording
  defects. After correction, cycle 2 repeated all twelve areas with zero
  findings and no unresolved change request.

## Cycle 1 findings and corrections

1. Review 304 initially called existing single-predicate manual definitions
   source-compatible without distinguishing assignable authored object literals
   from exhaustive readers of the widened property. Review 304 now records a
   failed cycle 1 and a complete zero-finding cycle 2; ADR-035 explicitly
   requires reader narrowing under the Experimental migration.
2. Raw shape classification treated any own recognized descriptor as selecting
   a family, conflicting with M30's rule that non-enumerable recognized members
   are absent. Classification now uses only own enumerable data/accessor
   descriptors and states the non-enumerable behavior explicitly.
3. The dense `conditions` array contract omitted extra enumerable string keys
   outside exact indices. It now rejects them structurally and includes that
   check in the ordered compiler phase.
4. Runtime wording named a `basic-incompatible` presence kind that M30 does not
   define. It now retains the three exact non-value presence kinds and explains
   basic-incompatible present data through the accepted `Object.is` rule.
5. The mapping of existing `condition-member-invalid` wording could be read as
   classifying a non-object indexed member under that reason despite the next
   rule assigning `condition-not-object`. It now names only operator,
   conditions-array and member-predicate path/equals values; the non-object
   mapping is unambiguous.
6. ADR-035 preserved M31 behavior explicitly but omitted ADR-034/SPEC-017 from
   its required authority. Both Accepted documents are now required, and the
   manual group section closes unknown-key handling by retaining M30's ignored,
   non-retained behavior.

Cycle 1 cannot support acceptance.

## Cycle 2 complete review

| Area                            | Result | Evidence                                                                                                                               |
| ------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Promotion authority          | Pass   | Implements only review 304 cycle 2's flat non-empty all/any design question; M33/M34/React remain future intent.                       |
| 2. Backward compatibility       | Pass   | Existing predicate interfaces/objects/behavior remain; property readers explicitly narrow the new Experimental union.                  |
| 3. Raw grammar                  | Pass   | Exact operator/conditions group, enumerable descriptor classification, density, extra-key, non-empty and no-nesting rules are closed.  |
| 4. Normalized contract          | Pass   | One detached/frozen predicate-or-group union preserves member/duplicate order and leaves templates unchanged.                          |
| 5. Compiler safety and ordering | Pass   | Descriptor capture, family selection, structural/member/link phases, field/member/index order and cascade suppression are exact.       |
| 6. Diagnostics                  | Pass   | Three closed new compiler reasons, two manual reasons, paths/expectations/safe parameters and existing M30 mappings are bounded.       |
| 7. Manual definitions           | Pass   | Two-phase detach/link validation, unsupported-node rejection and non-invocation atomicity remain deterministic.                        |
| 8. Runtime semantics            | Pass   | Every member uses M30 presence/Object.is semantics, complete ordered evaluation and non-empty all/any combination without graph/cache. |
| 9. Controlled invariants        | Pass   | Schedule, sharing, focus, actions, validation, dirty, baseline, scopes, issues and zero operation emission remain M30-compatible.      |
| 10. Targets and other nodes     | Pass   | Angular/Standard consume booleans only; collections, M31 and presentation containers stay unconditional/static.                        |
| 11. Delivery and exclusions     | Pass   | No dependency/manifest/version/release; expression engine, oneOf, wizard, React and wider conditions remain inactive.                  |
| 12. SPEC readiness and hygiene  | Pass   | Twenty-two evidence rows bound SPEC-018; index, promotion review, docs, links, formatting and diff hygiene pass.                       |

## Decision

Cycle 2 passes completely with zero findings. Under Ricard's accepted
zero-finding/no-scope-expansion rule, ADR-035 revision 0 may become Accepted.
Acceptance authorizes only preparation and complete review of SPEC-018; it
does not authorize a plan, implementation, dependency, version, release,
publication, Git or external action.

## Verification

- Complete cross-check against ADR-033 revision 0, SPEC-016 v0.1.1, review 304
  cycle 2, completed M30/M31 and deferred D-018/D-007/D-011/D-012/D-026.
- Repository formatting, documentation links and `git diff --check` pass.
