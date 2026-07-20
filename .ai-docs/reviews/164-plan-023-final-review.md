# PLAN-023 final review — Cycles 1–3

- **Date:** 2026-07-20
- **Plan:** Completed
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 11 — final verified closure
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5, ADR-025 revision 0,
  ADR-010 revision 1 and reviews 146–163
- **Toolchain:** Node 22.23.1; npm 10.9.8; pnpm 10.28.2
- **Outcome:** Cycle 3 repeated all eighteen areas and all 27 SPEC-009 rows
  with zero findings

## Cycle 1 findings and corrections

### R164-F01 — Restricted-sandbox Angular build abort

The first local invocation reached `ng build` through `pnpm typecheck` inside
the restricted sandbox and esbuild aborted on its IPC boundary. No product
result was accepted from the partial invocation. The complete local matrix was
restarted outside the restricted sandbox and passed; this is the already
documented execution constraint, not a source or dependency defect.

### R164-F02 — Stale current mixed-window onboarding

Root onboarding and the release-note installation section still described
core/base `latest` as M19 or the aliases as a current mixed window, despite
checkpoint 10 having coordinated all defaults. Both now describe exact,
`next`, `latest` and unqualified M21 resolution; historical partial-state and
recovery sections remain explicitly historical.

After both corrections, the complete review restarted from identity and
public bytes. No registry, GitHub, repository, Git or package-setting mutation
occurred.

### R164-F03 — Closing-document formatting

The first closing-document pass found Prettier drift in ROADMAP and this review
record. Both files were formatted mechanically and the complete applicable
review restarted; no product, package or external state changed.

## Cycle 3 — complete zero-finding pass

### 1. Authority, scope and exclusions

Pass. The closure changes only release evidence and persistent project state.
No runtime, schema, UI Schema, diagnostic, operation, export, entry point,
peer, framework range, CSS property, support tier or stability contract
changed. D-043, legacy Angular, React, Vue and all unpromoted capabilities
remain inactive.

### 2. Registry, identity and authority

Pass. npm 10.9.8 uses exactly `https://registry.npmjs.org/`; `npm whoami`
returns `ricardrabasso`. The verified account email is
`ricard@rabassoft.com`, 2FA is `auth-and-writes`, the account owns the
Rabassoft organization and has `read-write` authority over all three packages.
No credential or security-key material entered commands or documentation.

### 3. Exact M21 public bytes, integrity and signatures

Pass. Public core/base `0.4.0` and pilot `0.2.0` are byte-identical to the
selected clean `07755b4cbe31098f86099db38c65930d52772fb5` candidates. Their
sizes remain 218,187, 126,564 and 28,618 bytes with the exact recorded SHA-512
and integrity values, and every artifact retains an npm registry signature.

### 4. Access, aliases and unrelated drift

Pass. All packages remain public and solely maintained by
`ricardrabasso <ricard@rabassoft.com>`. Core/base resolve
`next/latest: 0.4.0`; pilot resolves `next/latest: 0.2.0`; unqualified
resolution selects the same line. No package access, maintainer, alias or
setting differs from the checkpoint-10 verified baseline.

### 5. Manifests, peers, exports and distribution boundary

Pass. Core has no runtime dependency; base retains core `^0.4.0`, aligned
Angular `>=22.0.6 <23.0.0` peers and only `tslib`; pilot retains base
`^0.4.0`, Aria/CDK `>=22.0.5 <23.0.0`, only `tslib`, its provider root,
opt-in stylesheet and exactly six CSS properties. Public exports, package
inventories and isolation are exact.

### 6. Corresponding Source, license and security

Pass. Every package carries AGPL-3.0-only LICENSE/NOTICE/SOURCE, preferred
TypeScript and its frozen build harness. Independent offline source rebuilds
match shipped declarations, exports and behavior. Security scans find no
secret, credential, private link, personal-data leak, application, test or
`.ai-docs` disclosure; repository/provenance metadata and attestations remain
absent.

### 7. Immutable M19 and earlier artifact regression

Pass. The frozen public core/base `0.3.0` and pilot `0.1.0` package-local
source/security baseline remains byte-identical. The earlier `0.2.0` artifact
baseline also passes. Historical releases are not reinterpreted as M21
evidence.

### 8. Frozen workspace and complete implementation matrix

Pass. The frozen lockfile installs offline with lifecycle scripts disabled.
Formatting, documentation, lint, strict types, all 689 workspace tests,
production builds, package smoke and the external Angular consumer pass.
Angular's 989.78 kB/Ajv warnings and Standard's 868.50 kB advisory remain
known non-failing observations.

### 9. Artifact, source and package verification

Pass. M21 packed public/private artifact checks, deterministic inventories,
SemVer peer rewrites, source reconstruction, declaration/export comparison,
ownership/license checks and tracked/packed security scans pass. The selected
neutral basenames and evidence disclose no local username.

### 10. Private reference applications

Pass. Eight snippets across two targets, 540 import boundaries, 41 shared
scenario tests, 26 Angular shell tests, 53 Standard shell tests, eight Angular
Chromium cases and six Standard Chromium cases pass independently.

### 11. Candidate compatibility and M18 regression

Pass. Frozen candidate M18 and M20 native/pilot consumers pass partial
compilation, strict typecheck, unit behavior, production builds and Chromium
at Angular 22.0.6 and 22.0.7 with Aria/CDK 22.0.5. The 22-row SPEC-008/M18
behavior, package/style isolation and accepted support boundary remain exact.

### 12. Exact registry consumers

Pass. Lower/latest-compatible native and pilot consumers resolve the three
explicit M21 versions and pass strict installation, partial compilation,
types, unit behavior, production build and Chromium.

### 13. `next` registry consumers

Pass. Both tuples resolve core/base `0.4.0` and pilot `0.2.0` through `next`
and pass the complete native/pilot sequence.

### 14. `latest` registry consumers

Pass. Both tuples resolve the same inspected line through `latest` and pass
the complete native/pilot sequence. The alias remains Experimental routing
only.

### 15. Unqualified registry consumers

Pass. Both tuples resolve the same inspected default line without explicit
Schema Engine versions and pass the complete native/pilot sequence.

### 16. Public/Internal migration and SPEC-009 rows 1–10

Pass. The exact migration remains limited to local object/item presentation,
the defaulted generic family, required template forests, the one named template
alias, widened text domains and the Angular ordinary-or-template SPI. Core
compiler/contract/operation suites retain evidence for owner-local membership,
all entry/safety cases, diagnostics/fallback, immutability, identity, keys and
manual-definition non-invocation.

### 17. SPEC-009 rows 11–27

Pass. Native Angular, Angular Aria and independent Standard evidence retains
static-label reuse/failure, concrete IDs, per-owner state, movement,
insertion/removal/reinsertion, mounted descendants, accessibility, narrowed
SPI, registry fallback/claims, package/style isolation, fixed host regions,
prior-runtime invariance, declarations, migration and all unit/build/Chromium
lanes. Delivery introduced no capability beyond accepted M20.

### 18. Documentation, history and final diff

Pass. Release notes, root/package onboarding, ROADMAP, STATUS, Deferred, ADR
and documentation indexes, plan, review and prepend-only WORKLOG agree that
PLAN-023/M21 are complete. No active text claims Stable, a public repository,
provenance, automation, contribution support, SLA or unsupported framework
support. Formatting, documentation/link validation, lint, all 23 release-tool
tests and `git diff --check` pass.

## Repeated SPEC-009 row evidence

| Rows  | Direct repeated evidence                                                                                                                        |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–4   | Local compiler/contract suites cover admitted depths, every owner forest, exact membership and atomic independently recursive owners.           |
| 5–8   | Safety/fixture suites cover every kind, hostile descriptors, cycles/reuse, exact diagnostics/fallback and independent owner validity.           |
| 9–10  | Contract/operation suites cover deep freeze, identity, qualified keys and every manual reason, owner context and non-invocation case.           |
| 11–12 | Native/Standard suites cover static label reuse/failure/locale/replacement and exact ordinary/item/template IDs.                                |
| 13–17 | Native/Aria/Standard units, candidates and Chromium cover state, mounted lifecycle, stable movement, cleanup, roles, keyboard and grid.         |
| 18–19 | Declaration consumer and Angular suites cover SPI narrowing, Internal owner context, provider/fallback/claims/no-retry/cleanup.                 |
| 20–21 | Lower/latest native/pilot lanes and pilot package/style gates prove equivalence and the unchanged six-property boundary.                        |
| 22–24 | Boundary/scenario/host checks plus 689 tests and frozen M18/M19 matrices prove Standard isolation, fixed regions and prior-runtime invariance.  |
| 25–26 | Declarations, package/source/artifact checks, migration onboarding and independent unit/build/Chromium lanes pass.                              |
| 27    | Closure observed and documented the approved release only; no new version, registry write, GitHub, repository, Git or Deferred action occurred. |

## Outcome

Cycle 3 is the required complete zero-finding pass. PLAN-023 checkpoint 11,
PLAN-023 revision 0 and M21 are complete. There is no active implementation
task. Selecting the next milestone or Deferred capability is a separate
prioritization decision; completion grants no commit, push, registry,
repository/settings, version, publication, provenance or automation authority.
