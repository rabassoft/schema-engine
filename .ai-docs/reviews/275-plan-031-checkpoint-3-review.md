# PLAN-031 checkpoint 3 review

- **Date:** 2026-08-03
- **Scope:** Local references, disjoint object composition, array barriers and
  schema/data ordering; SPEC-015 conformance rows 8–11/17/19
- **Outcome:** Cycle 1 found two implementation defects. After correction,
  cycle 2 repeated the complete twelve-area review and rows 8–11/17/19 with
  zero findings.

## Cycle 1 findings and corrections

1. A root `default` was initially inherited from compiler diagnostics as an
   unsupported keyword even though SPEC-015 makes root/container defaults
   opaque. The Internal helper inspection now filters only root/composed-root
   container-default diagnostics while retaining ordinary compiler behavior.
2. Malformed primitive defaults were collected after compiler diagnostics,
   losing their ordinary keyword position when a later keyword also failed.
   Failure merging now uses effective node and own-key order to interleave the
   helper diagnostic deterministically at its source position.

Cycle 1 cannot support completion.

## Cycle 2 complete review

| Area                                   | Result | Evidence                                                                                                                        |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1. Internal ownership                  | Pass   | The compiler module exposes only an Internal traversal result; the core root and Public contracts gain no cursor/AST symbol.    |
| 2. Local references                    | Pass   | Pure same-document references, chains, repeated target use and referenced objects derive independently per managed use site.    |
| 3. Reference failures/cycles           | Pass   | Existing unresolved/invalid/cyclic diagnostics and branch stopping remain exact and atomic.                                     |
| 4. Object composition                  | Pass   | Root and nested disjoint `allOf` contributions derive in accepted depth-first contribution order.                               |
| 5. Composition failures                | Pass   | Duplicate/conflicting/exterior failures retain Accepted compiler diagnostics and expose no partial candidate.                   |
| 6. Provenance                          | Pass   | Referenced default failures retain canonical source `documentPath`, managed `dataPath` and copied/frozen outer-to-inner chains. |
| 7. Container/default barriers          | Pass   | Root/object/array defaults remain metadata-only; array items and descendants are never inspected or applied.                    |
| 8. Opaque arrays                       | Pass   | Accepted arrays require no collection policy or item schema traversal while unsupported array semantics still diagnose safely.  |
| 9. Schema-before-data atomicity        | Pass   | All blocking schema/default work completes before hostile data-root inspection; failures retain exact original identity.        |
| 10. Deterministic diagnostic ordering  | Pass   | Effective node order and source keyword position interleave malformed defaults with compiler errors deterministically.          |
| 11. Runtime/validator boundary         | Pass   | The helper imports/invokes no runtime, validator, operation, async, baseline, renderer or adapter path.                         |
| 12. Regression and deferred boundaries | Pass   | Core lint/types/build, 40 files/641 tests, docs and diff hygiene pass; package/adapters/releases remain later and unchanged.    |

## Decision

Cycle 2 passes completely with zero findings. PLAN-031 checkpoint 3 is complete
for rows 8–11/17/19. This does not claim package consumer evidence, reference
applications, final closure or release/Git work.

## Verification

- Prettier and type-aware ESLint for core.
- Core typecheck and build.
- Focused 29 default-candidate tests and complete 40-file/641-test core suite.
- Existing reference/composition compiler regressions in the complete suite.
- `pnpm docs:check` and `git diff --check`.

No manifest, lockfile, dependency, version, release, publication, commit, push
or external action changed.
