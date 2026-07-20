# PLAN-023 checkpoint 1 complete review — Cycles 1–2

- **Date:** 2026-07-20
- **Plan:**
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 1 — M21 descriptor, manifests and repeat-release tooling
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5, ADR-025 revision 0,
  ADR-010 revision 1 and Approved PLAN-023 revision 0
- **State:** Completed after cycle 2
- **Outcome:** Cycle 2 passed all twelve areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                  | Correction                                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| R149-F01 | The Angular Aria package-smoke test retained the historical `0.1.0` expectation after its approved manifest moved to `0.2.0`.            | Changed only the expected pilot manifest version and repeated the complete package-smoke gate successfully.                           |
| R149-F02 | M21 source-manifest validation checked expected Schema Engine peers but did not reject an unexpected additional Schema Engine peer/link. | Added exact peer/development-link key allowlists, workspace-protocol checks and a focused negative regression.                        |
| R149-F03 | The workspace-local pnpm store lacked TypeScript 6.0.2 for the isolated offline source rebuild.                                          | Repeated against the already validated global store outside the restricted sandbox; all packages reused cached bytes with zero fetch. |

## Cycle 2 complete review

1. **Authority/scope — Pass.** Only the approved M21 release descriptor,
   manifests and internal release tooling changed; completed M20 behavior is
   untouched.
2. **Exact identities — Pass.** Core/base are `0.4.0`, pilot is `0.2.0`, packed
   peers are `^0.4.0`, and Angular/Aria/CDK ranges remain unchanged.
3. **Orders — Pass.** Package order is core/base/pilot and `latestOrder` is
   pilot/base/core; malformed, duplicated, missing or fourth-package
   descriptors fail closed.
4. **M19 immutability — Pass.** The original M19 descriptor is unchanged. Its
   three ignored local published artifacts match recorded sizes, SHA-512,
   integrity, manifests, source inventory and source commit `ce3ef3d`.
5. **Reusable tooling — Pass.** Descriptor loading, evidence, packing, source,
   security and package specifiers select M19/M21 explicitly; old M19 live
   verification no longer depends on current manifests.
6. **Candidate/live modes — Pass.** Candidate, exact, `next`, `latest` and
   unqualified M21 scripts are explicit. No live script or registry access ran.
7. **Artifacts/source/security — Pass.** Current M21 packs expose exact
   manifests/peers/inventories, rebuild independently offline and pass tracked/
   packed secret, personal-data, private-link and ownership checks.
8. **M20 consumers — Pass.** Frozen lower `22.0.6` and latest-compatible
   `22.0.7`, both with Aria/CDK `22.0.5`, pass native/pilot partial compile,
   strict types, unit behavior, production build and Chromium from current
   workspace tarballs.
9. **Workspace/package regression — Pass.** Lint, typecheck, builds, 689 tests,
   package smoke, pilot dependency gate and 23 release-tool tests pass.
10. **Documentation — Pass.** Current manifests validate against M21 while
    onboarding and `0.3.0` notes truthfully retain the published M19 line until
    checkpoint 2 creates M21 candidate documentation.
11. **State isolation — Pass.** No lockfile change, `.release/0.4.0`, selected
    candidate, commit, push, registry read/write or external state exists.
12. **Diff/state — Pass.** Formatting, documentation links, lint and
    `git diff --check` pass; unrelated dirty work including `angular.json` is
    preserved.

**Result:** zero findings and no unresolved change request.

## Completion effect

PLAN-023 checkpoint 1 is complete. Checkpoint 2 is the exact next local action.
Checkpoint 1 completion does not authorize candidate selection/preparation,
checkpoint 4, Git, registry access, publication, aliases or any external action.
