# PLAN-018: Private Standard/DOM direct-core reference shell

- **Status:** Approved revision 0
- **Date:** 2026-07-17
- **Approval date:** 2026-07-17
- **Complete review:**
  [`review 077`](../reviews/077-plan-018-review.md) cycle 1 passed all twelve
  areas with zero findings
- **Implementation authorized:** Yes — checkpoints 1–7 only; checkpoint 1's
  exact Vite dependency mutation and any browser download/replacement retain
  separate execution gates
- **Implementation state:** Checkpoints 1–4 completed after
  [`review 078`](../reviews/078-plan-018-checkpoint-1-review.md) and
  [`review 079`](../reviews/079-plan-018-checkpoint-2-review.md) plus
  [`review 080`](../reviews/080-plan-018-checkpoint-3-review.md) and
  [`review 081`](../reviews/081-plan-018-checkpoint-4-review.md) cycle 2 each
  passed with zero findings; completed PLAN-019 now supplies the reusable JSON
  Schema validator and checkpoint 5 may resume
- **Requires:** Accepted
  [`ADR-021 revision 0`](../adrs/021-shell-standard-dom-core-directo.md),
  [`review 076`](../reviews/076-adr-021-review.md), Accepted SPEC-001 through
  SPEC-006, ADR-009, ADR-010, ADR-020 and completed PLAN-016/PLAN-017
- **Milestone:** M16 — Standard/DOM reference shell
- **Promoted capability:** only D-046's private direct-core Standard/DOM shell;
  React, Vue, D-026, D-035, D-043 and D-045 remain inactive

## 1. Goal and authorization boundary

Deliver one private, maintained browser application that demonstrates every
current catalog scenario through direct Public core consumption:

```text
six existing neutral scenarios
  -> Public core compiler
  -> application-owned controlled runtime and state
  -> Internal normalized DOM projection
  -> native accessible controls and observable evidence
  -> build-checked Standard source and independent Chromium smoke
```

Only `apps/reference-standard`, the existing snippet/boundary tooling and the
minimum root orchestration needed by that app are in scope. No Public source,
export, entry point, package, runtime behavior, version, compatibility claim or
SPEC changes.

Approval would authorize checkpoints 1–7 only. Checkpoint 1's manifest/lockfile
dependency mutation requires a separate execution gate before running the exact
Vite command. Browser execution reuses the already installed ignored Chromium
cache; downloading or replacing a browser remains a separate external gate.
Commit, push, publication, hosting, workflow and settings changes always require
separate approval.

## 2. Reviewed current state

The repository currently has:

- pnpm `10.28.2`, TypeScript `6.0.2`, Vitest `4.1.10`, happy-dom `20.10.6`
  and Playwright `1.61.1` pinned at the workspace root;
- Vite `8.1.4` already resolved transitively by Vitest but not directly owned
  in the root manifest;
- Public core `0.2.0` root exports for compilation, controlled runtime,
  operations, definitions, snapshots and subscriptions;
- the private built `@schema-engine-internal/reference-scenarios` catalog with
  six deeply frozen scenarios;
- the private Angular 22 shell, shared snippet extractor, boundary verifier and
  one ignored workspace-local Chromium cache; and
- no Standard/DOM project, Public DOM adapter, hosting target or CI workflow.

The unrelated Angular CLI analytics identifier in `angular.json` remains a
user-owned dirty change and must not enter any checkpoint diff or commit.

## 3. Exact dependency and command surface

### 3.1 Vite ownership gate

Checkpoint 1 adds exactly one root development dependency:

```sh
pnpm add --save-dev --workspace-root --save-exact vite@8.1.4
```

The command runs only after its dependency-mutation gate is approved. Because
the exact package is already present in the frozen graph, the expected lockfile
change is root-importer ownership only; any unrelated resolution change stops
the checkpoint for review. No package lifecycle script may download a browser
or mutate external state.

### 3.2 Exact private scripts

`apps/reference-standard/package.json` uses:

```json
{
  "build": "pnpm --workspace-root reference:snippets:check && vite build",
  "dev": "vite --host 127.0.0.1 --port 4211",
  "dev:e2e": "vite --host 127.0.0.1 --port 4212",
  "test": "vitest run",
  "typecheck": "tsc --noEmit -p tsconfig.json"
}
```

Checkpoint 1 temporarily uses `vite build` without the snippet check. The final
build value lands atomically with generated Standard snippets in checkpoint 5.

### 3.3 Exact root scripts

Add these focused commands without changing the semantics of existing Angular
or package scripts:

```json
{
  "reference:standard:build": "pnpm --filter '@schema-engine-internal/reference-standard...' build",
  "reference:standard:dev": "pnpm --filter @rabassoft/schema-engine build && pnpm --filter @schema-engine-internal/reference-scenarios build && pnpm --parallel --filter @schema-engine-internal/reference-scenarios --filter @schema-engine-internal/reference-standard run dev",
  "reference:standard:test:unit": "pnpm reference:standard:build && pnpm --filter @schema-engine-internal/reference-standard test",
  "reference:standard:test:e2e": "pnpm reference:standard:build && pnpm exec playwright test --config apps/reference-standard/playwright.config.ts"
}
```

The existing `reference:build`, `reference:dev`, `reference:test:unit` and
`reference:test:e2e` remain the Angular platform interface. Root recursive
`build`, `test` and `typecheck` include the Standard app through its own scripts.
The final full verification calls both target-specific interfaces explicitly.

## 4. Intended file inventory

### Root

- `package.json` and `pnpm-lock.yaml`: exact Vite ownership and focused scripts;
- `.gitignore`: Standard build/test output only if not already covered;
- `scripts/extract-reference-snippets.mjs` and its tests: named Standard marker
  sources and generated target;
- `scripts/verify-reference-boundaries.mjs` and its tests: exact project,
  dependency, import, privacy and output rules; and
- onboarding/current-state documents only as checkpoints actually complete.

### `apps/reference-standard`

- private manifest, strict bundler TypeScript config, Vite/Vitest/Playwright
  configs, `index.html` and authored styles;
- `src/main.ts` bootstrap and shell-local application composition/lifecycle;
- controlled state, operation-history and safe-inspection presentation modules;
- Internal normalized-definition DOM renderer plus leaf/object/collection/
  presentation bindings and shell-local number/display codecs;
- marked integration source plus committed generated Standard snippet module;
- unit tests for lifecycle/state/rendering/accessibility behavior; and
- one dedicated Chromium smoke specification.

Build output under `dist/apps/reference-standard`, Vite caches, Playwright
output, screenshots and traces stay ignored. Only the deterministic generated
snippet module is committed source.

## 5. Checkpoint 1 — Private project, Vite and buildable skeleton

1. Pass the dependency-mutation gate and run only the exact Vite command from
   section 3.1. Confirm the root importer is the sole expected lock change.
2. Create the exact private manifest with runtime workspace dependencies only
   on Public core and the built neutral catalog. Add strict configs,
   `index.html`, minimal `main.ts` and a minimal sober stylesheet.
3. Configure Vite output to `dist/apps/reference-standard`, loopback-only dev
   and no SSR, prerender, service-worker, deployment or public-base contract.
4. Add the checkpoint-1 private/root scripts. Prove catalog watch output is
   observed by Vite without source imports or manifest rewriting.
5. Extend the boundary verifier and focused fixtures to require `private: true`,
   root-only imports, exact allowed dependencies and absent publish/export/
   pack/release surface. Reject Angular/React/Vue/RxJS, deep/physical/test
   imports, reverse Public edges and browser/app output in Public targets.

Gate: frozen install, format, lint, Standard typecheck/build, boundary tests,
existing reference builds and package builds pass. Public source/manifests/
exports/versions and user-owned `angular.json` remain outside the scoped diff.

## 6. Checkpoint 2 — Controlled application and lifecycle

1. Implement the shell-local composition root with selected scenario, copied
   complete `value`/`baselineValue`, locale, visibility, decision mode,
   diagnostics, snapshot, pending operations and immutable history.
2. Compile only through Public `compileFormDefinition()` and create the runtime
   only on success through Public `createControlledFormRuntime()`.
3. Subscribe exactly once to snapshots and operations. Implement the ADR-021
   scenario-replacement order and one idempotent cleanup path for listeners,
   bindings, unsubscribe closures and runtime disposal.
4. Implement immediate confirm, reject, pending confirm/reject and stale/
   incompatible history using Public `applyFormOperation()` and complete-root
   external updates. Never construct an operation or optimistic value.
5. Implement reset by fresh scenario replacement, whole baseline commit, locale
   and visibility application actions. Add no persistence, submit, partial
   baseline helper, shared controller or framework abstraction.
6. Add focused tests for compile/runtime failure, operation modes, stale
   application, baseline/dirty, locale/visibility, repeated replacement and
   zero duplicate delivery after cleanup.

Gate: application state tests prove it is the sole value/baseline owner;
typecheck/lint/unit/build and existing core/Angular suites pass with no Public
change.

## 7. Checkpoint 3 — Stable normalized DOM projection

1. Build semantic form structure once per scenario from normalized
   `FormDefinition`; renderers never receive raw schema or UI Schema.
2. Add a stable binding registry keyed by canonical paths/collection addresses.
   Reconcile snapshots in place and dispose all event handlers deterministically
   instead of replacing the form on each update.
3. Implement labelled native string and enum-select bindings with exact missing
   versus empty-string tokens, controlled reconciliation, clear, focus/blur,
   required/invalid state and described-by text.
4. Implement number/integer text buffers that emit only complete finite values,
   preserve incomplete text while focused and restore confirmed display on
   blur; formatting/parsing remain private target behavior.
5. Implement boolean and nullable intentions that visibly distinguish missing,
   null, false, empty string and zero. Required never suppresses clear.
6. Render normalized objects and static presentation groups as semantic
   fieldsets/sections without changing data paths, value shape or operation
   ownership.
7. Test keyboard input, non-emitting render/reconciliation, external rejection,
   focus/touched, accessible names/descriptions/issues, nullable distinctions
   and listener cleanup.

Gate: primitives, nested objects, references, presentation and nullable catalog
scenarios render and operate through Public runtime methods; focused DOM tests,
all existing suites, build and boundaries pass.

## 8. Checkpoint 4 — Collections and complete scenario interaction

1. Render normalized collections as stable semantic item groups keyed by Public
   item identity, never array index.
2. Bind item leaves through collection addresses and Public item intention
   methods. Reconcile insert/move/remove by moving or disposing existing item
   DOM without replacing unaffected bindings.
3. Add shell-owned accessible insert, move and remove controls using scenario
   policies and deterministic test input. The application confirms/rejects/
   pends their emitted operations exactly like leaf operations.
4. Complete interactive coverage for all six catalog scenarios and every
   current feature tag without adding scenario semantics to the renderer.
5. Test stable DOM identity, nested item values, strict expectations,
   stale/incompatible collection operations, keyboard focus after structural
   changes and cleanup of removed items.

Gate: all six scenarios compile and expose target-idiomatic interaction;
collection identity and controlled ownership tests pass with no catalog,
compiler or Angular behavior duplication.

## 9. Checkpoint 5 — Reference workspace, evidence and snippets

1. Complete scenario selector, summary/explanation, application controls, form
   preview, read-only Schema/UI Schema and observable evidence areas using one
   semantic responsive hierarchy.
2. Present value, baseline, definition, snapshot, history, diagnostics and
   issues with deterministic safe serialization, native disclosures and
   accessible copy feedback.
3. Provide Auto/Light/Dark shell-local tokens and a sober responsive treatment
   without importing or extracting Angular CSS/components. Preserve focus,
   390 px layout, 200% reflow and reduced-motion behavior.
4. Mark exact non-nested Standard integration regions and extend the existing
   extractor's declarative source/target inventory. Generate one committed
   app-local module consumed by the production build.
5. Extend extractor tests for Standard missing/duplicate/empty/nested/unclosed
   markers, idempotent write and stale check. Switch the app `build` script to
   its final snippet-checking value.
6. Add unit/DOM assertions for headings, controls, inspectors, copy, theme,
   snippet provenance and explicit non-claims. Editable configuration drafts
   remain Angular-shell UX and outside M16.

Gate: snippet write is idempotent, check mode detects drift, formatting/lint/
types/unit/build pass and no generated DOM source enters the catalog or Public
packages.

## 10. Checkpoint 6 — Chromium, isolation and documentation

1. Add one Standard Playwright config with one Chromium project, loopback
   `4212`, deterministic `dev:e2e` server, failure-only trace/screenshot and
   accessible selectors. Reuse the installed ignored browser; stop before any
   download or cache replacement.
2. Cover all scenario navigation/compile success and representative primitive,
   nested, collection, reference, presentation and nullable keyboard flows.
3. Cover confirm/reject/pending/stale, reset, baseline/dirty, locale,
   visibility, inspectors, copy, theme and repeated scenario cleanup.
4. Assert representative names/descriptions, groups, status, focus, 390 px and
   200% reflow without claiming cross-browser or accessibility certification.
5. Run unchanged Angular shell build/unit/Chromium, package/source/artifact/
   security and clean-consumer gates. Standard workspace evidence substitutes
   for none of them.
6. Prove Public declarations, manifests, exports, versions, tarball inventories
   and release targets unchanged; prove Standard sources/output enter no public
   artifact or Corresponding Source package root.
7. Update onboarding commands and reconcile STATUS, ROADMAP, indexes, deferred
   decisions and README only to checkpoint 6. Do not rewrite `0.2.0` release
   history or imply publication/hosting.

Gate: frozen install, docs, format, lint, types, unit/build/snippets/boundaries,
both Chromium lanes and the complete unchanged release-isolation matrix pass.
`git diff --check`, forbidden-import/Public-drift searches and scoped diff review
have zero findings.

## 11. Checkpoint 7 — Final repeated implementation review

Inspect from the beginning:

- review 075 and ADR-021 authority plus every deferred exclusion;
- dependency/lockfile, scripts, project privacy and complete diff;
- direct Public core consumption and absence of an accidental adapter;
- controlled ownership, lifecycle cleanup and stable DOM reconciliation;
- all six scenario interactions, accessibility and snippets;
- independent Standard/Angular browser evidence and explicit non-claims;
- Public package/artifact/source/consumer/release isolation; and
- persistent state, milestone status and exact next action.

Correct every finding and repeat the complete review plus full verification
matrix until one cycle passes with zero findings. Only then mark PLAN-018/M16
complete, compact STATUS to no active task and prepend the final WORKLOG entry.
Do not commit, push, publish, host or alter external settings.

## 12. Evidence matrix

| Area                         | Required evidence                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Workspace privacy            | exact Internal name, `private: true`, no exports/publish/pack/release surface                         |
| Dependency direction         | core/catalog roots only; no Angular/framework/deep/physical/test/reverse import                       |
| Build ownership              | exact Vite dependency, deterministic output/dev ports, no SSR/deploy target                           |
| Controlled state             | complete value/baseline roots, explicit decisions/update, no optimistic or shared controller          |
| Lifecycle                    | one subscription pair, idempotent cleanup, no duplicate delivery after scenario replacement           |
| Normalized projection        | no raw schema interpretation; stable bindings reconcile snapshots in place                            |
| Primitive/nullable controls  | missing/empty/zero/false/null distinction, temporary numeric text, clear/focus/validation             |
| Nested/presentation          | semantic groups, canonical paths and unchanged value structure                                        |
| Collections                  | Public identity/address methods, stable DOM items, controlled insert/move/remove/item updates         |
| Scenario parity              | all six catalog IDs and feature tags demonstrated without Angular-only behavior claims                |
| Reference workspace          | selector/explanation, controls, preview, schema/UI and observable evidence                            |
| Snippets                     | checked source markers, generated app-local module, idempotent write and stale/failure tests          |
| Accessibility/responsiveness | native semantics, names/descriptions/status/focus, keyboard, 390 px/200%, reduced motion              |
| Browser                      | independent Chromium lane plus unchanged Angular lane; ignored failure artifacts                      |
| Non-claims                   | no adapter/package, cross-browser/certification, React/Vue, legacy Angular, hosting or release        |
| Release isolation            | unchanged Public source/declarations/manifests/versions/tarballs/source rebuilds/clean consumers      |
| Documentation                | commands, prerequisites, ownership and milestone current; no historical release or stable-guide drift |

## 13. Full verification sequence

After every checkpoint run focused gates and `git diff --check`. Before M16
completion run, in dependency order:

1. `pnpm install --frozen-lockfile`;
2. `pnpm format:check` and `pnpm docs:check`;
3. `pnpm lint`;
4. `pnpm typecheck`;
5. `pnpm test` plus focused extractor/boundary tests;
6. `pnpm reference:snippets:check`;
7. `pnpm reference:build` and `pnpm reference:standard:build`;
8. `pnpm reference:test:boundaries`;
9. existing `pnpm reference:test:e2e` and new
   `pnpm reference:standard:test:e2e`;
10. `pnpm test:package`, `pnpm test:artifacts`, `pnpm test:source`,
    `pnpm audit:release` and `pnpm test:consumer:clean`;
11. forbidden-import/Public-version/export/package-member searches; and
12. full diff, status and persistent-document reconciliation.

No live npm/tag test is required because M16 mutates no registry state. The
existing published `0.2.0` evidence remains historical release evidence.

## 14. Stop conditions

Stop and require a new decision if implementation needs:

- any Public signature, export, entry point, package, operation, snapshot,
  diagnostic, runtime behavior or SPEC change;
- a reusable DOM adapter, Web Component layer, framework-neutral controller,
  renderer registry, component/style package or catalog runtime semantics;
- React, Vue, another framework, D-026 capability negotiation or D-045 legacy
  Angular work;
- editable configuration as a cross-target requirement, persistence, backend,
  SSR, hydration, service worker, hosting, deployment, analytics or CI;
- a package/version/release/publication/repository mutation or use of the
  Standard workspace app as compatibility evidence;
- a destructive/external action beyond an explicitly approved dependency or
  browser gate; or
- an authoritative documentation conflict or verification failure that cannot
  be corrected inside this plan.

PLAN-018 revision 0 passed complete review 077 cycle 1 with zero findings and is
approved for checkpoints 1–7. The Vite dependency mutation, browser download or
replacement, commit, push and every external action retain their separate
gates.
