# PLAN-016: Private reference platform and Angular 22 shell

- **Status:** Completed revision 0
- **Date:** 2026-07-17
- **Approval date:** 2026-07-17
- **Complete review:**
  [`review 055`](../reviews/055-plan-016-review.md) cycle 5 passed all twelve
  areas with zero findings after six corrections
- **Implementation authorized:** Yes — checkpoints 1–8 only; the dependency
  and Chromium execution gates completed in checkpoints 1 and 6
- **Implementation state:** Checkpoints 1–8 completed after
  [`review 056`](../reviews/056-plan-016-checkpoint-1-review.md) cycle 4 and
  [`review 057`](../reviews/057-plan-016-checkpoint-2-review.md) cycle 3 and
  [`review 058`](../reviews/058-plan-016-checkpoint-3-review.md) cycle 3 and
  [`review 059`](../reviews/059-plan-016-checkpoint-4-review.md) cycle 3 and
  [`review 060`](../reviews/060-plan-016-checkpoint-5-review.md) cycle 3 and
  [`review 061`](../reviews/061-plan-016-checkpoint-6-review.md) cycle 3 and
  [`review 062`](../reviews/062-plan-016-checkpoint-7-review.md) cycle 2 and
  final [`review 063`](../reviews/063-plan-016-final-implementation-review.md)
  cycle 2 passed with zero findings; PLAN-016/M15 are complete
- **Requires:** Accepted
  [`ADR-020 revision 0`](../adrs/020-plataforma-referencia-multiframework.md),
  [`review 054`](../reviews/054-adr-020-review.md), Accepted SPEC-001 through
  SPEC-006, applicable ADR-006 through ADR-019 and the immutable release
  boundary of ADR-018 revision 3
- **Milestone:** M15 — Multi-framework reference platform
- **Promoted capability:** only D-044's accepted private catalog and first
  Angular 22 shell; D-045 and every later shell remain inactive

## 1. Goal and authorization boundary

Deliver a private, maintained reference platform that composes every Accepted
capability without changing product behavior:

```text
six neutral authored scenarios
  -> copied/frozen Internal catalog
  -> Public core compiler and operations
  -> Public Angular adapter
  -> application-owned controlled signals
  -> build-checked source and one Chromium smoke lane
```

Only `apps/reference-scenarios`, `apps/reference-angular` and the root
orchestration/verification needed by them are in scope. The work creates no
Public export, entry point, package, runtime behavior, version, release or
compatibility claim. It does not publish, host, deploy, expose the repository,
add CI, persist data or implement Standard/DOM, React, Vue or legacy Angular.

Approval authorizes only checkpoints 1–8. Dependency installation and the
Chromium binary download use external network/cache state and therefore had
separate execution gates. The dependency gate completed in checkpoint 1;
Chromium remains gated until checkpoint 6. Commit, push, publication, hosting
and settings changes always require separate approval.

## 2. Reviewed current state

The repository currently has:

- root pnpm `10.28.2`, Node `22.23.1`, TypeScript `6.0.2` and Angular `22.0.6`;
- two publishable workspace packages under `packages/*`, both at verified
  Experimental `0.2.0`;
- Public core compilation, strict operation application, controlled snapshots
  and validation contracts needed by the catalog and shell;
- a Public standalone Angular adapter with `SchemaFormDirective`, native
  renderers and explicit `schemaOperation` intentions;
- Vitest/happy-dom unit infrastructure, package/source/artifact checks and
  isolated exact/tagged clean consumers; and
- no Angular CLI application builder, Playwright dependency, `angular.json`,
  `apps/*` workspace or CI workflow.

The root recursive build/test/typecheck commands already traverse workspace
packages. Existing release scripts pack only the two explicit public packages,
but M15 adds durable negative checks so this assumption cannot silently drift.

## 3. Exact toolchain and commands

### 3.1 Exact development dependencies

Checkpoint 1 adds these exact root development dependencies and records their
resolved lockfile graph:

- `@angular/cli: 22.0.6`;
- `@angular/build: 22.0.6`;
- `@playwright/test: 1.61.1`.

Angular CLI/build `22.0.6` accepts Node `^22.22.3` and TypeScript
`>=6.0 <6.1`; the current Node/TypeScript tuple satisfies it. Playwright
`1.61.1` declares Node `>=18`. No floating range or install-time “latest”
selection is allowed.

The dependency/lockfile mutation uses the exact command below only after its
external installation gate is approved:

```sh
pnpm add --save-dev --workspace-root --save-exact \
  @angular/cli@22.0.6 @angular/build@22.0.6 @playwright/test@1.61.1
```

Chromium is downloaded only at checkpoint 6, after a separate explicit gate:

```sh
pnpm exec playwright install chromium
```

It uses Playwright's default per-user browser cache. No binary/cache is stored
in the repository, no `PLAYWRIGHT_BROWSERS_PATH=0` is used and no browser
download runs from a package lifecycle script.

### 3.2 Exact root scripts

The final root interface uses these literal script values:

```json
{
  "reference:build": "pnpm --filter '@schema-engine-internal/reference-angular...' build",
  "reference:dev": "pnpm reference:snippets && pnpm reference:build && pnpm --parallel --filter @schema-engine-internal/reference-scenarios --filter @schema-engine-internal/reference-angular run dev",
  "reference:snippets": "node scripts/extract-reference-snippets.mjs --write",
  "reference:snippets:check": "node scripts/extract-reference-snippets.mjs --check",
  "reference:test:unit": "pnpm reference:build && pnpm --filter @schema-engine-internal/reference-scenarios --filter @schema-engine-internal/reference-angular run test",
  "reference:test:boundaries": "node scripts/verify-reference-boundaries.mjs",
  "reference:test:e2e": "pnpm reference:build && pnpm exec playwright test --config apps/reference-angular/playwright.config.ts"
}
```

The final private package scripts are:

```text
reference-scenarios
  build     tsc -p tsconfig.build.json
  dev       tsc -p tsconfig.build.json --watch --preserveWatchOutput
  test      vitest run
  typecheck tsc --noEmit -p tsconfig.json

reference-angular
  build     pnpm --workspace-root reference:snippets:check && ng build reference-angular
  dev       ng serve reference-angular --host 127.0.0.1 --port 4200
  dev:e2e   ng serve reference-angular --host 127.0.0.1 --port 4207
  test      vitest run
  typecheck tsc --noEmit -p tsconfig.json
```

Checkpoint 1 temporarily uses plain `ng build reference-angular`, omits the two
snippet scripts and starts `reference:dev` at `pnpm reference:build`. The
extractor, generated module and all final values above land atomically in
checkpoint 5. Final `reference:dev` deliberately writes current snippets,
topologically builds core, Angular adapter, catalog and app once, then watches
only catalog and application source. A core/adapter source edit requires
restarting the command; M15 adds no script to a public package manifest.

Existing `build`, `test`, `typecheck`, `lint`, `format:check`, package, artifact,
source and clean-consumer scripts retain their names and semantics. Recursive
`build`, `test` and `typecheck` include both private projects through their own
scripts. The focused unit and browser commands first build the complete
reference dependency closure, so neither relies on stale `dist` from an earlier
root command; the browser lane remains explicit because it needs an installed
browser binary.

## 4. Intended file and package inventory

### Root orchestration

- `pnpm-workspace.yaml`: add only `apps/*`;
- `package.json` and `pnpm-lock.yaml`: exact tools and scripts in section 3;
- `angular.json`: only `reference-angular`, with
  `@angular/build:application` and `@angular/build:dev-server`;
- `.gitignore`: ignore catalog/app build output, `.angular`, `test-results` and
  `playwright-report` without ignoring authored/generated source;
- `scripts/extract-reference-snippets.mjs`: deterministic write/check tool;
- `scripts/verify-reference-boundaries.mjs`: dependency/import/public-artifact
  guard; and
- focused Node tests for both scripts.

### `apps/reference-scenarios`

- private Internal manifest with a sole built root export and no
  `publishConfig`/pack/release script;
- strict NodeNext build/typecheck configs and Vitest config;
- contract, authoring validation/copy/freeze and catalog index modules;
- six independently authored scenario modules; and
- authoring safety, immutability, deterministic validation and coverage tests.

### `apps/reference-angular`

- private Internal manifest depending on the built catalog and both Rabassoft
  packages through `workspace:*`, plus exact Angular `22.0.6` runtime packages;
- browser application/bootstrap/strict-template configs and public assets;
- standalone shell, focused reference-form integration and small inspector
  presentation components;
- marked build-checked TypeScript/template regions plus committed generated
  snippets module;
- Vitest component/application-state tests; and
- dedicated Playwright config/specs under the application project.

Generated/build/browser output is never retained as repository source except
the deterministic snippet module. Implementation adds that module to the
working tree but performs no Git commit. Public package source, manifests,
exports and versions are not expected to change.

## 5. Checkpoint 1 — Workspace, toolchain and buildable skeletons

1. Pass the external dependency-install gate, run the exact pinned add command
   and inspect manifest/lockfile diffs for unrelated upgrades.
2. Add `apps/*`, ignore rules, the two exact private manifests and their strict
   configs. Catalog exports built ESM/declarations only; Angular depends on that
   root, never its source.
3. Add root `angular.json` with one browser-only application target. Configure
   `browser`, `index`, `tsConfig`, assets/styles and output path. Exclude only
   `@schema-engine-internal/reference-scenarios` from development prebundling so
   its rebuilt linked ESM is observed; do not add server, SSR, prerender,
   hydration or deployment targets.
4. Add minimal standalone Angular bootstrap using
   `provideZonelessChangeDetection()` and native provider registration. Add a
   minimal catalog export so topological build is green.
5. Add the checkpoint-1 form of the exact root/package scripts.
   `reference:dev` topologically builds all dependencies, then uses pnpm
   parallel workspace runs for catalog `tsc --watch` and Angular `ng serve`;
   prove one catalog edit triggers rebuild/serve refresh without a manifest
   rewrite or stale prebundle.
6. Add the boundary verifier with exact private names, `private: true`, absent
   publish config, allowed dependency edges, forbidden deep/physical/test
   imports, and absence of app references in public manifests/export maps.

Gate: frozen install, format, lint, both private typechecks, topological
production build, boundary tests, existing package builds and diff checks pass.
No product declaration, package tarball member, public manifest field, version
or source file changes.

## 6. Checkpoint 2 — Catalog contract and safe authoring

1. Implement the ADR-020 Internal generic contract with the closed feature
   vocabulary, complete controlled roots, metadata-free exact operation union,
   code/path/keyword issue evidence and neutral explanation records.
2. Implement iterative descriptor-safe JSON-compatible copy/freeze support.
   Reject inherited/accessor/symbol/sparse/cyclic/non-finite/non-plain input
   without executing getters, coercion, iterators or hostile property names.
3. Copy the own validator function into a fresh frozen wrapper. Never freeze or
   retain the authored validator object; permit no other function position.
4. Validate unique kebab-case IDs, non-blank strings/locale, unique closed
   features, object roots, visibility, transitions and expectation shapes.
   Throw only the Internal `ReferenceCatalogAuthoringError` with stable reason,
   optional scenario ID and member/index path.
5. Prove deep immutability, structural non-retention, error precedence and safe
   inspection with serializable fixtures plus programmatic descriptors, sparse
   arrays, cycles, symbols, hostile names and Proxies at the documented safety
   boundary.
6. Prove the catalog helper does not compile schemas, apply operations or
   reinterpret Public diagnostics.

Gate: catalog build/typecheck/unit tests pass with complete authoring reason and
immutability coverage; Angular skeleton and all existing package suites remain
green.

## 7. Checkpoint 3 — Six scenarios and coverage evidence

Implement exactly:

1. `controlled-primitives`: string/number/integer/boolean, string enum, clear,
   validation, locale, confirm/reject/pending, whole baseline and dirty;
2. `nested-profile`: deep fields, missing-ancestor materialization and a
   representative blocked incompatible ancestor;
3. `stable-team`: identity policy plus insert, move, remove and item-leaf
   intentions;
4. `local-definitions`: accepted same-document `$defs`/`$ref` reuse;
5. `presentation-sections`: root/nested static sections without value-shape
   ownership; and
6. `nullable-preferences`: missing/null/false-or-primitive/clear distinctions.

Each scenario provides deterministic synchronous validation, expected
metadata-free operations, stable issue paths and important full-state
transitions. Catalog tests compile every input through the Public compiler and
require success, unique coverage and exact original schema identity at the
validator. They may assert Public outputs but cannot replace or import
conformance fixtures.

Gate: all closed feature tags and SPEC-001–006 capability rows in section 13
have named scenario evidence. All scenarios pass authoring, compilation,
validator determinism and immutable reset-source checks without duplicating a
compiler/runtime.

## 8. Checkpoint 4 — Angular application ownership

1. Build standalone shell navigation and a focused reference-form component.
   Selecting a scenario resets and compiles it before constructing form config;
   compiler failure displays diagnostics and never mounts `schemaForm`.
2. Own Angular signals for value, baseline, locale, visibility, selected
   scenario, decision mode and immutable operation history. Derive a fresh
   `AngularControlledFormConfig` from Public definition plus those signals.
3. Handle each Public `schemaOperation` as an intention. Immediate confirm uses
   Public `applyFormOperation`; reject never changes state; pending stores exact
   operations; later confirmation applies against then-current value and
   records success/stale/incompatibility diagnostics.
4. Implement reset, whole-form baseline commit, locale and visibility controls
   in the application. Do not add persistence, partial baseline helpers,
   framework validators or a cross-framework controller.
5. Present labeled schema, UI Schema, value, baseline, normalized definition,
   runtime snapshot, compiler/runtime diagnostics, validation issues and
   operation-history panels with deterministic safe serialization.
6. Add focused Vitest tests for compilation failure, config derivation,
   immediate/pending/reject/stale flows, scenario reset, baseline dirty, locale
   and visibility. Component tests may override presentation-only templates;
   production build and browser tests remain the template evidence.

Gate: strict Angular templates, application build, unit tests and existing
adapter tests pass. State transitions prove the application is the only
`value`/`baselineValue` owner and no new library symbol/behavior appears.

## 9. Checkpoint 5 — Scenario UI, accessibility and snippets

1. Render all six scenarios through the same focused integration component;
   add understandable navigation, decision controls, collection controls and
   inspector disclosure without framework-neutral UI abstraction.
2. Use semantic landmarks, headings, fieldsets/legends, buttons, status text,
   focus order and resolved labels/descriptions. Preserve native renderer
   accessibility rather than selecting its private DOM/classes.
3. Add stable shell-only test IDs only where an inspector/state region or
   developer decision control is otherwise ambiguous.
4. Mark exact non-nested TypeScript/template regions in the build-checked
   reference-form source. Implement deterministic extraction with duplicate,
   missing, empty, nested and unclosed-marker failures, normalized line endings
   and no other source rewriting.
5. Generate one repository-maintained snippets module in the working tree;
   import it into the shell and label fragments as excerpts. Add extractor unit
   tests and a check-mode stale test. Switch the private Angular `build` script
   to the final snippet-checking value in section 3.2. No framework source
   string enters the catalog and no Git commit occurs.
6. Add application unit/DOM assertions for shell-owned semantics, panels,
   snippet provenance and accessible names/descriptions.

Gate: write mode is idempotent, check mode passes, deleting/changing a marker or
source excerpt is proven to fail in focused tests, strict build/unit/lint passes
and generated output is absent from public packages.

## 10. Checkpoint 6 — One real Chromium smoke lane

1. Add `apps/reference-angular/playwright.config.ts` with one Chromium project,
   `baseURL` on loopback, trace/screenshot retained only on failure and a
   `webServer` that runs the deterministic Angular serve command. A matching
   local server may be reused; `CI` mode always starts fresh.
2. Stop for the external browser-download gate and run only
   `pnpm exec playwright install chromium`. Record the resolved Playwright and
   browser revision; do not commit/download a cache or add a workflow.
3. Cover navigation/compile success for every scenario, representative
   primitive/nested/collection/nullable keyboard interaction, immediate
   confirm, reject, pending resolution and visible operation/state changes.
4. Cover reset, whole baseline/dirty, locale, validation visibility and visible
   schema/definition/snapshot/history/issues inspection.
5. Assert representative roles, accessible names/descriptions, group labels and
   keyboard focus. Prefer accessible selectors; use only the admitted
   shell-owned test IDs and never private renderer classes/structure.
6. Prove the lane makes no cross-browser, visual, exhaustive conformance,
   accessibility-certification or unsupported-Angular claim.

Gate: one complete headed-or-headless Chromium run passes repeatedly from a
fresh server; unit/build gates remain green; test results, screenshots, traces
and browser binaries are untracked and ignored.

## 11. Checkpoint 7 — Isolation, regressions and documentation

1. Extend boundary verification to inspect both private manifests, all
   publishable manifests/export maps, import specifiers and generated/browser
   paths. Fail if an app becomes publishable or a public package depends on it.
2. Run current package smoke, packed-artifact exact inventories, source rebuild,
   release-security and clean lower/upper Angular consumer checks unchanged.
   The reference shell does not satisfy or replace any row.
3. Prove public `dist` declarations, package manifests, export maps, versions,
   selected `0.2.0` tarball inventories and release target are unchanged by
   M15. The root lockfile/tooling change is expected but no public runtime
   dependency changes.
4. Verify `apps/`, snippets, `.angular`, Playwright output and catalog `dist`
   enter no public tarball/source package or release candidate.
5. Update onboarding documentation with local reference commands, tool/browser
   prerequisites, application-owned flow and explicit non-claims. Do not alter
   historical release notes to imply M15 was published in `0.2.0`.
6. Reconcile STATUS, ROADMAP, indexes, deferred decisions and README only to the
   actually completed checkpoint. D-045 remains Deferred; no public repository,
   workflow, hosting, version or release state changes.

Gate: frozen install, formatting, docs, lint, typecheck, all unit tests,
production/reference builds, snippet/boundary/browser checks, package/source/
artifact/security tests and clean consumers pass. `git diff --check`, scoped
diff review and searches for forbidden imports/public drift have zero findings.

## 12. Checkpoint 8 — Final repeated implementation review

Inspect from the beginning:

- ADR-020/review 053 authority and all deferred exclusions;
- dependency/lockfile and complete production/test/documentation diff;
- catalog safety, scenario evidence and lack of normative duplication;
- Angular controlled ownership, builder, snippets and accessibility;
- browser smoke evidence/non-claims;
- public declaration/package/tarball/source/consumer isolation; and
- persistent state and exact next action.

Correct every finding and repeat the complete review plus full verification
matrix until one cycle passes with zero findings. Only then mark PLAN-016/M15
implementation complete, compact STATUS to no active task and prepend one final
WORKLOG entry. Do not commit, push, publish, host or alter external settings.

## 13. Evidence matrix

| Area                   | Required evidence                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Workspace privacy      | exact names, `private: true`, absent publish config, pack/release exclusion                                  |
| Dependency direction   | package-root imports only; no app-to-app cycle, deep/physical/test imports or reverse package edge           |
| Catalog authoring      | descriptor-safe hostile cases, copied/frozen results, stable Internal errors and no consumer execution       |
| Catalog responsibility | no compiler/runtime/registry/capability model; Public compiler independently accepts every scenario          |
| Controlled primitives  | confirm/reject/pending, baseline/dirty, validation/visibility/locale, enum and clear                         |
| Nested objects         | deep path, missing materialization and incompatible ancestor evidence                                        |
| Collections            | stable identities, insert/move/remove/item update and strict expectations                                    |
| Local references       | same-document reference scenario through Public compile path                                                 |
| Presentation           | static groups do not alter controlled value structure                                                        |
| Nullable leaves        | null/missing/false-or-value/clear and accessible intention evidence                                          |
| Angular ownership      | component signals own value/baseline/decisions/reset/locale; operation application stays Public and explicit |
| Snippets               | marked compiled source, deterministic generated module, idempotent write and stale/failure tests             |
| Builder                | official browser-only application/dev-server targets; no server/SSR/prerender/hydration/deploy               |
| Browser                | one Chromium navigation/control/state/keyboard/accessibility smoke run; outputs ignored                      |
| Non-claims             | no cross-browser, certification, hosting, later-shell or legacy-Angular claim                                |
| Release isolation      | unchanged declarations/manifests/versions/tarball inventories/source and independent clean consumers         |
| Documentation          | commands, prerequisites, ownership and boundaries current; no historical release rewrite                     |

Programmatic hostile catalog tests stay outside serializable scenario data.
Generated snippets and expectations cannot serve as their own oracle.

## 14. Full verification sequence

After every checkpoint run its focused gates and `git diff --check`. Before
completion run, in this dependency order:

1. `pnpm install --frozen-lockfile`;
2. `pnpm format:check` and `pnpm docs:check`;
3. `pnpm lint`;
4. `pnpm typecheck`;
5. `pnpm test` and focused script tests;
6. `pnpm reference:snippets:check`;
7. `pnpm reference:build`;
8. `pnpm reference:test:boundaries`;
9. `pnpm reference:test:e2e` with the separately installed Chromium;
10. `pnpm test:package`, `pnpm test:artifacts`, `pnpm test:source`,
    `pnpm audit:release` and `pnpm test:consumer:clean`;
11. forbidden-import/public-version/export/package-member searches; and
12. full diff, status and persistent-document reconciliation.

No live npm/tag test is required because M15 mutates no registry state. Existing
live `0.2.0` evidence remains historical release evidence, not a workspace-app
gate.

## 15. Stop conditions

Stop and require a new decision if implementation needs:

- any Public signature, export, entry point, package, operation, snapshot,
  diagnostic or runtime behavior change;
- a framework-neutral controller, renderer/capability model or schema compiler
  in the catalog;
- a Standard/DOM, React, Vue, additional Angular-family or other shell;
- persistence, partial baseline utility, backend, SSR, hydration, hosting,
  deployment, CI workflow/cache or repository visibility;
- a widened Angular peer range, version/release/publication mutation or use of
  the workspace shell as package compatibility evidence;
- a destructive/external action beyond the separately approved exact
  dependency and Chromium install gates; or
- an authoritative documentation conflict or verification failure that cannot
  be corrected within this plan.

Ricard explicitly approved PLAN-016 revision 0 on 17 July 2026. Only
checkpoints 1–8 are authorized; the dependency command completed in checkpoint
1, while Chromium, Git, publication, hosting and settings retain their stated
separate gates.
