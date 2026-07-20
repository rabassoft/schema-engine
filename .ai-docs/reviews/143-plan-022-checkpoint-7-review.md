# PLAN-022 checkpoint 7 complete review — Cycles 1–5

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-022 revision 0`](../plans/022-recursive-local-presentation-layout.md)
- **Checkpoint:** 7 — packages, consumers and complete conformance evidence
- **Authority:** SPEC-009 v0.1.0 sections 13–15; ADR-025 revision 0
- **Outcome:** Cycle 5 passed every area and all 27 SPEC rows with zero findings

## Corrections and complete-review restarts

1. **Cycle 1** found that the generated M20 consumer lost the compiler's
   narrowed definition and that its browser locator followed collection
   position instead of stable identity. The definition is now hoisted only
   after narrowing and the locator follows the encoded `beta` identity.
2. **Cycle 2** found formatting/lint defects, a root-only packed declaration
   allowlist and a registry-dependent upper consumer resolver. Formatting and
   typing were corrected, the exact template alias/generic declarations were
   admitted, and clean consumers gained an explicit frozen offline mode.
3. **Cycle 3** found one formatting defect in the corrected clean-consumer
   script. It was formatted and the complete applicable matrix restarted.
4. **Cycle 4** repeated the whole implementation/check matrix and passed with
   zero findings, but the newly written review record then failed formatting.
5. **Cycle 5** corrected that record and repeated the complete documentation,
   link and diff review with zero findings and no unresolved change request.

## Review areas

1. **Public/package surface — Pass.** The sole new core alias and exact generic
   Angular declaration widening are present in packed allowlists; no unlisted
   export, entry point, style, dependency or target is exposed.
2. **Source/package consumers — Pass.** Root-default compatibility, required
   manual local forests and external renderer narrowing compile from source and
   current packed artifacts without Public owner/item/runtime state.
3. **Dedicated M20 consumers — Pass.** Lower Angular 22.0.6 and latest Angular
   22.0.7, both with Aria/CDK 22.0.5, pass native and pilot partial declarations,
   strict types, DOM, production build and Chromium from temporary current
   workspace tarballs.
4. **Frozen/offline boundary — Pass.** The dedicated lane uses fixed tuples and
   local package tarballs only. The general clean-consumer check also passes
   with explicit `--offline --upper-angular=22.0.7`; no registry or release
   directory is read or written by these checks.
5. **Published M19 regression — Pass.** Existing frozen published-package,
   packed-artifact, source, security and lower/latest-compatible M18/M19 native
   plus pilot checks remain green and current versions remain unchanged.
6. **Workspace/reference regression — Pass.** Formatting, docs, lint, strict
   types, 689 tests, builds, package checks, eight snippets, 540 import
   boundaries, 120 reference unit tests and fourteen Chromium tests pass.
7. **Scope/diff — Pass.** The complete tracked/untracked scope was inspected.
   Package manifests, lockfile, release state and `.release` are unchanged;
   the separate `angular.json` analytics opt-out remains unrelated and
   preserved.

## SPEC-009 conformance evidence

| Row | Direct passing evidence                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `packages/core/test/local-presentation-contracts.test.ts` and `local-presentation-compiler.test.ts` admit only object/item/template depths.                       |
| 2   | `local-presentation-compiler.test.ts` covers default, ordered and authored forests for every owner.                                                               |
| 3   | The same compiler suite and invalid recursive fixture reject cross-owner, ancestor, descendant, identity and path references.                                     |
| 4   | Compiler tests prove atomic object/array children and independently compiled nested owners.                                                                       |
| 5   | Local compiler tests cover every kind plus accessors, sparse arrays, cycles, reuse and hostile names.                                                             |
| 6   | Local compiler tests and invalid expected fixture assert exact reason, parameter, document/data/template path, order and fallback.                                |
| 7   | Contract/compiler regressions keep array hosts, leaves and identity members unsupported as owners.                                                                |
| 8   | Programmatic and serialized cases combine independently valid/invalid root, ancestor, sibling and descendant forests.                                             |
| 9   | `local-presentation-contracts.test.ts`, compiler tests and manual-operation tests prove deep freeze, exact child identity and hostile qualified keys.             |
| 10  | `packages/core/test/operations-conformance.test.ts` covers every manual reason/index/owner, selection order and non-invocation.                                   |
| 11  | Angular local projection and Standard DOM suites cover static-label success/failure, repeated items, locales and replacement.                                     |
| 12  | Angular and Standard suites plus M20 Chromium consumers assert exact ordinary/item/template IDs and stable hostile IDs.                                           |
| 13  | Angular native, Aria and Standard suites cover first-tab/all-collapsed state independently per concrete owner.                                                    |
| 14  | Those suites and both M20 consumers prove movement retains view state, buffers, focus and nested layout state.                                                    |
| 15  | Native, Aria and Standard suites cover insertion, removal, fresh reinsertion, invalid identity and exact cleanup.                                                 |
| 16  | Native/Aria/Standard tests retain mounted hidden descendants while preserving validation and focus exclusion.                                                     |
| 17  | Angular and Standard unit plus Chromium suites independently cover roles, names, keyboard order and grid fallback.                                                |
| 18  | `packages/angular/test/external-presentation-consumer.ts`, packed declarations and M20 partial compilation prove renderer narrowing with no Public owner context. |
| 19  | Angular resolver/projection and Aria suites cover provider selection, native fallback, local testers, no retry, claims and cleanup.                               |
| 20  | `verify-m20-clean-consumers.mjs` lower/latest native and pilot lanes prove dedicated frozen native/Aria equivalence.                                              |
| 21  | Aria tests, dependency gate, packed allowlist and empty manifest/style production diff preserve the pilot boundary.                                               |
| 22  | Reference-boundary checks and the exact shared recursive scenario prove Standard direct-core isolation and common input.                                          |
| 23  | Native and Standard host tests preserve fixed text, issues, actions and focus recovery outside forests.                                                           |
| 24  | The 689-test workspace suite plus M18/M19 matrices preserve runtime, state, scopes, operations, validation and M1–M19.                                            |
| 25  | Core/Angular declarations, package/source/artifact checks, external consumer and READMEs cover migration and consumption.                                         |
| 26  | Angular native, Aria and Standard unit/build/Chromium lanes all pass; no target substitutes for another.                                                          |
| 27  | Manifest/lockfile/release/Git diff audits prove no version, release, registry, GitHub or other external mutation.                                                 |

## Verification

- `pnpm format:check`, `pnpm docs:check`, `pnpm lint`, `pnpm typecheck`,
  `pnpm test` and `pnpm build`: pass; 225 Markdown files, 764 links and 689
  tests verified.
- `pnpm test:package`, `pnpm test:artifacts`, `pnpm test:artifacts:m18`,
  `pnpm test:consumer`, `pnpm test:source`, `pnpm test:source:m18` and
  `pnpm audit:m18`: pass.
- `node scripts/verify-clean-consumers.mjs --offline --upper-angular=22.0.7`:
  pass for frozen Angular 22.0.6/22.0.7.
- `pnpm test:consumer:m18:lower` and `pnpm test:consumer:m18:latest`: native
  and pilot declarations, types, DOM, production build and Chromium pass.
- `node scripts/verify-m20-clean-consumers.mjs --mode=lower` and `--mode=latest`:
  native and pilot declarations, types, DOM, production build and Chromium
  pass for the frozen M20 tuples.
- Reference snippets, boundaries, Angular/Standard unit suites and both
  Chromium lanes: pass; 8 snippets, 540 imports, 120 unit and 14 browser tests.
- `git diff --check`, package-manifest/lockfile/release-boundary and full scoped
  diff inspection: pass.

Known Angular bundle/Ajv and Standard chunk-size advisories remain unchanged
observations, not failures or waivers.

## Outcome

Checkpoint 7 is complete with direct passing evidence for every SPEC-009 row.
Checkpoint 8 may now repeat the entire frozen matrix and full implementation,
diff, documentation and handoff review under the pinned toolchain.
