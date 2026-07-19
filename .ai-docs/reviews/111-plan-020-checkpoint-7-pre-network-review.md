# PLAN-020 checkpoint 7 pre-network implementation review — Cycles 1–3

- **Date:** 2026-07-18
- **Plan:**
  [`PLAN-020 revision 0`](../plans/020-static-advanced-presentation-layout.md)
- **Scope:** Private artifacts, frozen source, security and clean lower-bound
  native/pilot consumers before registry-backed latest-compatible resolution
- **Outcome:** Cycle 3 passed all twelve applicable areas with zero findings;
  checkpoint 7 remains open at its separate registry/network gate

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                                                       | Correction                                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R111-F01 | `test:artifacts` still tried to validate private source version `0.3.0` as the published `0.2.0` line and therefore was not a valid baseline. | Added a frozen `0.2.0` hash/integrity/manifest regression and kept separate explicit `0.3.0`/`0.1.0` private artifact gates; repeated the full review. |
| R111-F02 | The new review and deferred-history table were not Prettier-clean after persistent-state reconciliation.                                      | Formatted both documents and restarted the complete applicable review and verification matrix.                                                         |

Installation diagnostics, TypeScript 6 `rootDir` and the workspace-local
Playwright path were corrected while constructing the evidence, before the
formal zero-finding cycle. They changed only the disposable harness and did not
broaden product or dependency scope.

## Cycle 3 complete applicable review

1. **Authority and scope:** Pass. Changes are limited to packaging/source/
   consumer/security evidence for the accepted three private candidates. No
   SPEC, ADR, Public surface, runtime behavior, publication or external setting
   changed.
2. **Candidate identities and exports:** Pass. Core/base are exactly `0.3.0`;
   pilot is exactly `0.1.0`; root and style export maps, files, side effects,
   license and single pilot provider declaration match SPEC-008/ADR-024.
3. **SemVer rewrite:** Pass. `pnpm pack` removes every `workspace:` protocol;
   base Angular names core `^0.3.0`, and pilot names base Angular `^0.3.0` as a
   peer and `0.3.0` for development.
4. **Exact artifact and isolation inventory:** Pass. Core/base retain their
   explicit inventories and contain no pilot/Aria/CDK/style text. Pilot contains
   only its declared source, partial output, style/legal files and frozen source
   harness; emitted JS keeps peer imports and copies/bundles no peer.
5. **Corresponding Source:** Pass. Core, base Angular and pilot rebuild offline
   from their included lockfiles under Node `22.23.1`/pnpm `10.28.2`; rebuilt
   declarations, exports and provider behavior equal shipped output.
6. **Lower native clean consumer:** Pass. A fresh tarball-only project at exact
   Angular `22.0.6` passes strict peer installation, partial compilation, strict
   types, DOM semantics, production build and Chromium.
7. **Lower pilot clean consumer:** Pass. A separate fresh project at exact
   Angular `22.0.6` plus Aria/CDK `22.0.5` proves exact patch alignment and the
   same partial/type/DOM/build/Chromium gates with the rank-10 pilot selected.
8. **Security/legal/source ownership:** Pass. The three tarballs and repository
   scope contain no secret, private repository link, unexpected personal data,
   forbidden generated/test member or foreign source author; pilot carries the
   exact AGPL license and source header boundary.
9. **Published/release isolation:** Pass. Frozen `.release/0.2.0` tarballs retain
   exact byte length, SHA-512, integrity, names, versions and publish metadata.
   `.release`, npm tags, registry state and release commands were not mutated.
10. **Workspace regression:** Pass. Core 444, validator 7, catalog 38, base
    Angular 103, Angular reference 25, Standard 50 and pilot 1 tests pass, as do
    all seven builds, strict types and package smokes.
11. **Independent reference/browser lanes:** Pass. Eight Angular and six
    Standard Chromium tests pass independently; eight snippets, 517 import
    boundaries and all catalog/DOM unit evidence remain green.
12. **Documentation, deferred boundary and diff:** Pass. Formatting, lint,
    documentation/link checks, security audit, full scoped diff and
    `git diff --check` pass. React, Vue, legacy Angular, another kit, Public
    release and every other deferred capability remain untouched.

## SPEC-008 row evidence at the pre-network boundary

| Rows  | Named evidence                                                                                                                                                                             | State                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| 1–6   | `packages/core/test/advanced-presentation-contracts.test.ts`, core conformance fixtures and `pnpm test`                                                                                    | Passing from checkpoints 1–2             |
| 7–14  | Angular presentation model/resolver/projection suites, Standard DOM suite, catalog suite and both reference Chromium lanes                                                                 | Passing from checkpoints 3–4             |
| 15–17 | `packages/angular-aria/test/pilot.test.ts`, package smoke, emitted stylesheet/artifact audit, lower native/pilot DOM/build/Chromium                                                        | Passing                                  |
| 18    | `packages/angular-aria/test/dependency-gate.mjs` and `node scripts/verify-m18-clean-consumers.mjs --mode=lower`                                                                            | Lower passing; registry `latest` pending |
| 19    | `pnpm test:package`, `node scripts/verify-packed-artifacts.mjs --release-version=0.3.0`, `verify-private-m18-artifacts.mjs`, `verify-source-packages.mjs --include-angular-aria --offline` | Passing                                  |
| 20    | `pnpm test`, Angular Chromium 8/8, Standard Chromium 6/6 and both clean-consumer Chromium lanes                                                                                            | Passing                                  |
| 21    | `pnpm test`, `pnpm typecheck`, package smokes and existing controlled runtime/operation/scope/validation suites                                                                            | Passing                                  |
| 22    | `pnpm test:artifacts`, `verify-release-security.mjs --include-angular-aria`, scoped git/diff inspection and absence of external commands                                                   | Passing for local boundary               |

## Result

Cycle 3 has zero findings and no unresolved local change request. The
local/pre-network portion is ready, but checkpoint 7 and SPEC row 18 cannot
close until the separately authorized
`pnpm test:consumer:m18:latest` registry-backed lane passes. No network query,
publication, commit or push is authorized by this review.
