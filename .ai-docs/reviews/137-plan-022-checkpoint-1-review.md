# PLAN-022 checkpoint 1 complete review — Cycles 1–2

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-022 revision 0`](../plans/022-recursive-local-presentation-layout.md)
- **Checkpoint:** 1 — core contracts, local compiler and fixtures
- **Authority:** SPEC-009 v0.1.0, ADR-025 revision 0 and SPEC-008 v0.1.0
- **Outcome:** Cycle 2 passed all ten areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                  | Correction                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| R137-F01 | The generic presentation builder was only partially migrated and did not attach required owner forests.  | Completed generic construction, deferred local attachment until children exist and added exact object/item/template owner keys. |
| R137-F02 | Nested parser frames admitted local input but did not consistently retain the parsed owner target.       | Added the exact container target and owner-local diagnostic decoration while retaining root and array-host behavior.            |
| R137-F03 | The previous unsupported-location regression still expected object and item presentation to be rejected. | Replaced that stale expectation with accepted local projection plus the unchanged array-host rejection.                         |

## Review areas

1. **Public contracts and compatibility — Pass.** The exact defaulted generic
   families and sole template alias are exported; unparameterized root meaning
   remains unchanged.
2. **Raw owner grammar — Pass.** Only object and item UI contracts admit local
   presentation; array hosts remain unsupported.
3. **Compiler ordering and isolation — Pass.** Local presentation is inspected
   after local order and before descendants; invalid forests fall back only at
   their owner.
4. **Diagnostics — Pass.** Root diagnostics remain exact; ordinary owners add
   absolute `dataPath`, item/template owners add collection `dataPath` and exact
   detached `templatePath`.
5. **Normalization — Pass.** Every required owner receives an authored or
   exact default forest over direct child object identities.
6. **Static keys — Pass.** Local section, container, panel and grid-item keys
   embed the exact static owner tuple; root formulas remain byte-compatible.
7. **Safety — Pass.** Accessor, cycle, sparse/reuse and hostile root regression
   suites remain green; a local accessor is never invoked and sibling owners
   continue independently.
8. **Immutability and projection — Pass.** Local forests and descendants are
   deeply frozen and do not alter child arrays or the global leaf projection.
9. **Serializable conformance — Pass.** Valid and invalid recursive-local
   fixtures cover ordinary, item-root, template-object, qualified-key and
   owner-local fallback output.
10. **Boundary — Pass.** No runtime, Angular, Standard, dependency, version,
    release, Git or external action entered checkpoint 1.

## Verification

- Core TypeScript: pass.
- Core build and package smoke: pass.
- Core tests after the complete correction cycle: 26 files, 453 tests pass.
- Compiler conformance expected fixtures regenerated and formatted: pass.
- `git diff --check`: pass.

## Outcome

Checkpoint 1 is complete with zero findings. The accepted compiler output is
the input boundary for checkpoint 2 manual-definition validation.
