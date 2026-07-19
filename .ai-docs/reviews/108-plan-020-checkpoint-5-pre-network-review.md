# PLAN-020 checkpoint 5 pre-network review — Cycles 1–3

- **Date:** 2026-07-18
- **Plan:**
  [`PLAN-020 revision 0`](../plans/020-static-advanced-presentation-layout.md)
- **Scope:** Local version/package/manifest preparation before dependency
  resolution
- **Authority:** SPEC-008 sections 13.1 and 13.4, ADR-024 revision 1 and
  PLAN-020 checkpoint 5
- **Outcome:** Cycle 3 passed all ten local pre-network areas with zero findings;
  checkpoint 5 remains incomplete at its separately gated network command

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                    | Correction                                                                                               |
| -------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| R108-F01 | The copied pilot AGPL text had one additional trailing blank line and a different hash.    | Removed the extra line; core, Angular and pilot licenses are now byte-identical at the accepted SHA-256. |
| R108-F02 | The pilot package smoke used the global `URL`, which the repository ESLint config rejects. | Imported `URL` explicitly from `node:url`; the full lint and strict-type gates now pass.                 |

Both corrections restarted the complete local review.

## Cycle 3 complete local review

1. **Authority and sequence:** Pass. Only the checkpoint-5 work permitted before
   dependency resolution is present. No pilot behavior, registry access,
   publication, release, commit or push occurred.
2. **Coordinated versions:** Pass. Only source core and base Angular moved from
   `0.2.0` to private candidate `0.3.0`; immutable published `0.2.0` artifacts
   and release commands remain unchanged.
3. **Pilot identity:** Pass. The sole new package is
   `@rabassoft/schema-engine-angular-aria@0.1.0`, non-private and Experimental,
   with the accepted author, license and unpublished `next` metadata.
4. **Exports and side effects:** Pass. Root ESM/types and explicit
   `./styles.css` are the only entry points. CSS is the only declared side
   effect; the JS root has none.
5. **Dependencies and peers:** Pass for authored metadata. `tslib` is the only
   runtime dependency; base Angular `workspace:^`, Angular core, Aria and CDK
   peer ranges map exactly to the accepted artifact ranges. Only base Angular is
   a pre-network development dependency.
6. **Pre-implementation surface:** Pass. The emitted root declaration is exactly
   empty and the stylesheet contains no theme implementation. Checkpoint 6's
   provider, registrations and six properties have not been implemented early.
7. **Compilation and package gates:** Pass. ESM partial compilation, strict
   types, empty-surface declaration allowlist, explicit style existence and
   package smoke pass.
8. **Legal and source:** Pass. README, SOURCE, NOTICE and preferred TypeScript
   source are present; LICENSE is byte-identical to the accepted AGPL text. The
   standalone frozen source harness remains correctly deferred to checkpoint 7.
9. **Isolation and boundaries:** Pass. Core/base contain no pilot, Aria, CDK or
   style reference. The boundary verifier now recognizes three public packages,
   34 manifest targets and 493 imports; all twelve boundary self-tests pass.
10. **Lock and external boundary:** Pass. `pnpm-lock.yaml` is unchanged and has
    no pilot importer. Aria/CDK metadata, exact peer-patch alignment and license
    evidence cannot be claimed until the gated dependency command runs.

## Verification

- Formatting, ESLint, documentation and strict workspace type checking pass.
- All existing unit suites pass: core 444, validator 7, catalog 38, base Angular
  103, Angular reference 25 and Standard 50; the pilot intentionally has no
  implementation tests yet.
- All seven buildable workspace projects and every package smoke pass.
- Boundary self-tests pass 12/12; the live boundary audit passes for 3 public
  packages, 34 manifest targets and 493 imports.
- The pilot LICENSE matches SHA-256
  `0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0`;
  `git diff --check` passes and the lockfile has no diff.

## Result and exact gate

The local manifest/package preparation is ready with zero findings, but
PLAN-020 checkpoint 5 is not complete. The next action requires separate
authorization for exactly:

```sh
pnpm --filter @rabassoft/schema-engine-angular-aria add --save-dev --save-exact --ignore-scripts \
  @angular/aria@22.0.5 @angular/cdk@22.0.5
```

After resolution, review must verify one new importer, the exact graph, Aria's
exact CDK peer patch, licenses, lifecycle-script absence and zero core/base
leakage before checkpoint 5 can close.
