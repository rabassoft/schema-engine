# PLAN-021 checkpoint 3 complete review — Cycles 1–5

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 3 — complete local candidate gate
- **Authority:** SPEC-008 v0.1.0, ADR-018 revision 4, reviews 114–118 and
  completed PLAN-020/M18
- **Outcome:** Cycle 5 passed all fourteen areas and all 22 SPEC-008
  conformance rows with zero findings

## Correction cycles

| Cycle | Finding                                                                                                                                    | Correction                                                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | The local latest-compatible consumer command still implied registry metadata resolution, conflicting with checkpoint 3's no-registry gate. | Split frozen/local and registry/live tuple sources explicitly; both local tuples now fail closed offline and live scripts opt into registry resolution.      |
| 1     | Candidate rehearsal did not itself prove basename-relative dry runs from a fresh neutral directory.                                        | Candidate preparation now copies verified bytes to a fresh temporary directory, rechecks size/hash and performs the exact neutral basename-relative dry run. |
| 2     | Reference E2E scripts depended on whichever global Playwright browser cache owned the invoking account.                                    | Added one bounded wrapper that selects the ignored workspace cache and accepts only the two reference Playwright configurations.                             |
| 2     | PLAN-020 history and the M19 release note could be read as current registry-backed/local or publishable-candidate claims.                  | Clarified the historical M18 command and described checkpoint 3 outputs as dirty-tree comparison inputs with `sourceCommit: null`.                           |
| 3     | The new Playwright wrapper failed the repository formatting check.                                                                         | Applied repository formatting and restarted the complete applicable review.                                                                                  |
| 4     | The release note still referred to checkpoint 3 in future tense and ROADMAP denied implementation after its local checkpoints completed.   | Reconciled both phrases with the completed dirty-tree gate and added stale-phrase checks.                                                                    |

## Cycle 5 — complete zero-finding pass

### 1. Authority, scope and external boundary

Pass. Work is limited to PLAN-021 checkpoints 1–3 and completed M18/SPEC-008.
No production contract, package identity, version, peer, export or support
range changed. No Git operation, registry read/write, authentication,
publication, tag/settings mutation or public-repository action occurred.

### 2. Frozen workspace and toolchain

Pass. Node `22.23.1`, npm `10.9.8` and pnpm `10.28.2` were recorded. The frozen
install passed with `--offline --ignore-scripts` and zero downloads using the
validated local pnpm store. Formatting, documentation, lint, types and diff
checks pass.

### 3. Exact candidate inventory and deterministic bytes

Pass. Two consecutive preparations produced the same ignored artifacts:

| Package                                       | Bytes   | SHA-512                                                                                                                            |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `@rabassoft/schema-engine@0.3.0`              | 213,647 | `933779e7f764353d2a0d452ab3d08c8588d1c445f538b075960af4ab4116903e26d8f625e41a8ad4271e4c50f479a49b0fdd75fdf8531d90b78e26a60abf2181` |
| `@rabassoft/schema-engine-angular@0.3.0`      | 122,465 | `c5c5b5a5ccf69d97547099a69d8bc2aab294de50713bb4f105114bfc15cf72ba604905d10a01bf47920c5bfecd6bf0885dd6fdd32dcfb36538118837ad88904a` |
| `@rabassoft/schema-engine-angular-aria@0.1.0` | 28,192  | `4a1be718ff06e1297dcfe2f060894c0a609dd1138b4ee1a72ca527c76caaaa0d730e9ebc0c8d8bc1b7894de6a4a945a5dd2313ee4b578b0ddbb67a47b58d54b8` |

Evidence records `baseCommit`
`394119bebd8931fd9fe27d75aa068e505b0a6581`, `sourceCommit: null`,
`neutralDryRun: true`, exact integrity strings and no local username. These are
dirty-tree comparison inputs, not selected publication evidence.

### 4. Packing, exports, peers and package isolation

Pass. `test:package`, `test:consumer`, M19 artifact checks and the frozen
public `0.2.0` regression verify exact members, root/style exports,
dependencies, peers, versions, declarations and absence of applications,
tests and `.ai-docs` from all tarballs.

### 5. Corresponding Source and executable reconstruction

Pass. Each package rebuilt independently and offline from its extracted
Corresponding Source in dependency order with zero downloads. Rebuilt
declarations, exports and executable behavior match shipped outputs; pilot
style bytes and all six exact properties match.

### 6. Licensing, security and neutral dry runs

Pass. Every tarball contains LICENSE, NOTICE and SOURCE; third-party ownership
remains separate. Security checks found no credentials, private links,
personal address/tax material or unexpected files. Original and freshly
created neutral-directory `npm publish --dry-run --access public --tag next
--provenance=false` rehearsals pass against the inspected basenames.

### 7. Frozen consumer tuple separation

Pass. Local lower and latest-compatible lanes use exact Angular `22.0.6` and
`22.0.7` respectively, both with Aria/CDK `22.0.5`, and always install offline.
Registry tuple discovery is available only through explicit live scripts and
was not invoked. Both native and pilot consumers pass strict installation,
partial compilation, types, DOM assertions, production build and Chromium.

### 8. Workspace and reference verification

Pass. The workspace has 668 passing tests: core 444, base Angular 103,
Standard 50, scenarios 38, Angular reference 25, validator 7 and pilot 1.
Snippet checks pass 8/2 and import boundaries pass 517/35. Angular Chromium
passes 8/8 and Standard Chromium 6/6 through the ignored workspace cache.

### 9. Public/Internal migration inventory

Pass. Core raw/normalized/text additions and the three widened Experimental
unions/validation surfaces remain Public exactly as SPEC-008 section 15.
Base Angular exposes only the nine-symbol SPI plus its two accepted widened
behaviors. Tokens, resolver, contexts, native hosts and claim implementation
remain Internal. The pilot exposes only its provider, stylesheet and six CSS
properties; its hosts/selectors remain Internal. Standard/apps remain private,
and runtime, operations, scopes, validator authority, leaves and collection
contracts are unchanged.

### 10. SPEC-008 conformance rows 1–6

Pass. Core advanced-presentation contract/compiler/manual tests cover all
valid forms; every closed diagnostic/path/precedence/fallback; accessors,
sparse/cyclic/reused hostile input and hostile IDs; atomic root fallback;
manual-definition rejection without validator/operation invocation; and deep
immutability, exact keys and presented-node identity.

### 11. SPEC-008 conformance rows 7–11

Pass. Core text tests cover success/failure order and locale. Angular and
Standard unit/E2E evidence covers initial and retained target state, mounted
hidden descendants, reconciliation/destruction, source-order and one-column
grid fallback, exact IDs/roles/names/keyboard/inert/hidden behavior and exact
host-failure envelopes in independent implementations.

### 12. SPEC-008 conformance rows 12–17

Pass. Angular container resolver/model/projection tests cover descriptor-safe
registrations, closed diagnostics, rank/priority/order, tester isolation,
native fallback, immutable selection, no selected-host retry and exact claim
ownership. Native/Aria scenarios share normalized definitions; selective Aria
tabs compose with native section/accordion/grid. Pilot checks cover the six
properties, opt-in/no-side-effect stylesheet and application-owned themes.

### 13. SPEC-008 conformance rows 18–22

Pass. Exact peers, patch alignment, partial compilation and both clean tuples
pass; package/declaration/tarball isolation passes; both private shells pass
strict types, production builds and independent Chromium. Existing workspace
regression proves unchanged leaves, objects, collections, nullable fields,
runtime, operations, scopes and validation. No registry, publication, release,
repository or other external-system action occurred.

### 14. Documentation, deferred boundaries and diff

Pass. PLAN-021, release notes, STATUS, ROADMAP, deferred register, index and
WORKLOG agree that checkpoints 1–3 are complete and checkpoint 4 is separately
gated. React, Vue, remaining D-011/D-025, D-012, D-026, D-035, D-043 and D-045
stay inactive. The unrelated `angular.json` analytics opt-out is identified
and remains outside the scoped M18/M19 commit unless Ricard explicitly includes
it. The final documentation and diff checks pass with zero findings.

## Outcome

Checkpoint 3 is complete. The three deterministic dirty-tree candidates and
neutral rehearsal are reviewed comparison inputs only. There is no active
implementation task. PLAN-021 checkpoint 4 must stop for explicit authorization
before the scoped diff, commit, private push and clean committed-tree rebuild.
