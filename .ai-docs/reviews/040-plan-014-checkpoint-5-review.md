# PLAN-014 checkpoint 5 implementation review — Cycle 1

- **State:** Checkpoint 5 accepted; cycle 1 passed with zero findings
- **Date:** 15 July 2026
- **Scope:** PLAN-014 checkpoint 5 conformance, declarations, packages, source,
  consumers, migrations and release boundary
- **Authority:** Approved PLAN-014 revision 0 and Accepted SPEC-006 v0.1.1
- **Implementation boundary:** local M14 evidence only; no version, candidate,
  publication, tag, release or external mutation

## 1. Complete review — Cycle 1

### 1.1 Named SPEC-006 evidence map

| Group                           | Passing evidence                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 exact arrays/order            | `nullable-compiler.test.ts` covers all four primitives in both orders; `valid-nullable-primitive-leaves` is the serializable oracle.       |
| 2 propagation                   | The nullable fixture plus focused compiler tests cover direct, deep, collection-template and local-reference paths.                        |
| 3 scalar false                  | Existing conformance fixtures and checkpoint 1 migrations retain required false for all M1–M13 scalars.                                    |
| 4 excluded positions            | Existing root/object/array/item-root diagnostics plus focused nullable identity-policy evidence retain blocking ownership.                 |
| 5 malformed arrays              | Programmatic tests cover length, sparse indices, non-enumerable/accessor descriptors, unsafe members, extras and all invalid combinations. |
| 6 paths/provenance/order        | Direct/template/reference assertions cover exact paths, template path, reference chain, first failure and branch stopping.                 |
| 7 keywords/UI                   | Nullable compiler tests cover primitive constraints/options, annotations, inert default and enum/enumLabels exclusion/independence.        |
| 8 normalized/manual definitions | Checkpoint 1 contract tests plus compiler immutability/no-retention assertions cover both compiled and manual shapes.                      |
| 9 nullable choices exclusion    | Direct/template manual-definition tests preserve exact incompatibility and validator/operation non-invocation.                             |
| 10 raw operations               | `nullable-operations-runtime.test.ts` proves unchanged structural `applyOperation()` accepts null.                                         |
| 11 aware null operations        | Focused direct/deep and item-relative success/failure tests preserve their distinct diagnostic families.                                   |
| 12 strict transitions           | Focused null expectations, stale, no-effect, removal and immutable rebuild tests pass.                                                     |
| 13 ancestor behavior            | Operations/runtime tests cover missing-ancestor materialization and incompatible-ancestor suppression.                                     |
| 14 runtime/validation           | External null, missing/empty/false distinctions, dirty behavior, no external emission and exact validator schema identity pass.            |
| 15 set-null activation          | Native tests cover focus-before-output, one existing null intention and native button activation.                                          |
| 16 DOM state distinctions       | Missing, primitive, confirmed null and non-nullable external null action/status/clear combinations pass for all three native kinds.        |
| 17 accessibility                | Exact button/span semantics, names, IDs, described-by order, non-live status and direct instance IDs pass.                                 |
| 18 Signal Forms                 | Null maps to empty string/number and false boolean; reconciliation is silent and edits after null emit primitives.                         |
| 19 text projection              | Both members, neutral sources, every failure reason, locale, empty snapshot and exact resolver order pass.                                 |
| 20 renderer selection           | Existing native/custom ID, rank, priority and tester tests pass unchanged; string enum remains excluded.                                   |
| 21 declarations/packages        | Typecheck, both smoke suites, artifact allowlists, source rebuilds and repository/clean consumers pass.                                    |
| 22 migration/release boundary   | Root/package READMEs document both required source migrations, MINOR-not-PATCH policy and immutable pre-M14 live `0.1.0`.                  |
| 23 M1–M13 regression            | Full 398 core and 79 Angular tests plus build, lint, packages, source, artifacts and consumers pass.                                       |

### 1.2 Declarations, exports and packages — Pass

Core declarations contain the required boolean; Angular declarations contain
both required labels. No other planned public signature changed. Root indexes,
export maps and packed-file allowlists add no symbol or path. Both package smoke
suites, packed artifact checks and isolated frozen source rebuilds pass with
the accepted behavior.

### 1.3 Consumer matrix — Pass

The repository Angular consumer passes. Clean core and lower/upper Angular 22
consumers compile against locally packed packages; both tested Angular
endpoints resolve to 22.0.6. No deep import or registry-only capability is
required.

### 1.4 Migration and release boundary — Pass

Current root/core/Angular onboarding documents distinguish local source from
the immutable live `0.1.0`. They document the required `nullable` migration and
the two required Angular text labels as one coordinated Experimental change.
No successor version is selected, and no historical `0.1.0` release record is
rewritten.

### 1.5 Repository boundary — Pass

Manifests, dependency/peer ranges, lockfile, versions, export maps, entry points
and published bytes are unchanged. Temporary package/source/consumer checks do
not create a release candidate or mutate npm. No Stable, provenance, tag,
GitHub Release, commit or push claim is made.

## 2. Verification

- Frozen install, formatting and documentation pass across 99 Markdown files
  and 441 local links after persistent-state reconciliation.
- Lint, typecheck, build, 398 core tests, 79 Angular tests, both package smoke,
  packed artifacts, isolated source rebuilds, repository consumer and clean
  core/lower/upper Angular consumers pass.
- The sandboxed frozen install initially lacked network after recreating
  `node_modules`; the same exact lockfile install and network-dependent isolated
  checks passed with authorized network access and no lockfile change.
- Declaration searches, manifest/index/export-map diff and `git diff --check`
  pass.

Cycle 1 produced zero findings and no unresolved change request. This complete
pass accepts checkpoint 5 and authorizes the final repeated implementation
review in checkpoint 6.
