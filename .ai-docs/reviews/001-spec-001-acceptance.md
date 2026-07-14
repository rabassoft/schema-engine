# G0 — SPEC-001 Acceptance Evidence

- **State:** Passed; SPEC-001 v0.1.14 Accepted
- **Started:** 14 July 2026
- **Normative source:**
  [`SPEC-001 v0.1.14`](../specs/001-controlled-form-runtime.md)
- **Gate:** G0 formal prototype closure
- **Behavior changes authorized:** None

## Purpose

This document maps every walking-skeleton acceptance criterion in SPEC-001 to
committed executable evidence and records the G0 execution result. The repeated
review passed after resolving the initial normative findings, so this document
records the completed acceptance result.

## Assessment legend

- **Mapped:** direct automated evidence exists and is identified below; its G0
  execution result is recorded in the execution log.
- **Pending:** G0-specific evidence or review has not been completed.
- **Gap:** no direct evidence has been identified; acceptance must stop until
  separate corrective work is approved and completed.

## SPEC-001 acceptance matrix

|   # | Acceptance criterion                                                                                                                      | Direct evidence                                                                                                                                                                                                                                                                                                                             | Assessment |
| --: | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
|   1 | Compile a root object with `string`, `number`, `integer`, and `boolean` fields.                                                           | [`compiler.test.ts`](../../packages/core/test/compiler.test.ts), `normalizes all primitive field kinds and constraints`; compiler conformance `valid-basic-form`.                                                                                                                                                                           | Mapped     |
|   2 | Order fields through UI Schema.                                                                                                           | [`compiler.test.ts`](../../packages/core/test/compiler.test.ts), order diagnostics and deterministic compilation; compiler conformance `valid-custom-order`.                                                                                                                                                                                | Mapped     |
|   3 | Resolve `label`, `description`, `hint`, `tooltip`, and `placeholder` through UI contracts and `TextResolver`.                             | Compiler conformance `valid-ui-texts`; [`text.test.ts`](../../packages/angular/test/text.test.ts), normative member projection; [`native-renderers.test.ts`](../../packages/angular/test/native-renderers.test.ts), localized native text projection.                                                                                       | Mapped     |
|   4 | Render with Angular and native HTML controls.                                                                                             | [`native-renderers.test.ts`](../../packages/angular/test/native-renderers.test.ts), native string, number, boolean, and enum integration through the outlet.                                                                                                                                                                                | Mapped     |
|   5 | Preserve the controlled flow with Angular Signals.                                                                                        | [`directives.test.ts`](../../packages/angular/test/directives.test.ts), `projects snapshots and emits controlled operations` and explicit zoneless flow; [`native-renderers.test.ts`](../../packages/angular/test/native-renderers.test.ts), controlled native integrations.                                                                | Mapped     |
|   6 | Emit and apply `set-value` and `remove-value`.                                                                                            | [`operations.test.ts`](../../packages/core/test/operations.test.ts), root set/remove cases; operation conformance fixtures; [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), frozen sequential operations; Angular output forwarding tests.                                                                                   | Mapped     |
|   7 | Detect stale operations.                                                                                                                  | [`operations.test.ts`](../../packages/core/test/operations.test.ts), stale/no-op reference preservation and `Object.is`; operation conformance `error-stale-missing` and `error-stale-value`.                                                                                                                                               | Mapped     |
|   8 | Calculate dirty against the baseline.                                                                                                     | [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), interaction/dirty coverage; runtime conformance `baseline-dirty-reset`.                                                                                                                                                                                                      | Mapped     |
|   9 | Manage touched and focus state.                                                                                                           | [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), `tracks dirty, touched, focus, and validation visibility`; runtime conformance `interaction`; native renderer focus/blur integration.                                                                                                                                        | Mapped     |
|  10 | Perform synchronous validation through an external adapter.                                                                               | [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), injected `SchemaValidator`, invalid initial data, atomic revalidation, and validator exception isolation; runtime conformance `invalid-business-data`.                                                                                                                       | Mapped     |
|  11 | Normalize validation issues.                                                                                                              | [`runtime.ts`](../../packages/core/src/runtime.ts), descriptor-safe `normalizeIssue()` and immutable canonical copies; [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), normalized field issues and malformed validator-result diagnostics.                                                                                   | Mapped     |
|  12 | Support `touched`, `all`, and scope-based issue visibility.                                                                               | [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), visibility transitions and overlapping forced scopes; runtime conformance `forced-scope`.                                                                                                                                                                                    | Mapped     |
|  13 | React to dynamic locale changes.                                                                                                          | Runtime conformance `locale-update`; [`directives.test.ts`](../../packages/angular/test/directives.test.ts), locale-driven reprojection; [`native-renderers.test.ts`](../../packages/angular/test/native-renderers.test.ts), locale-aware string, number, and enum behavior.                                                                | Mapped     |
|  14 | Translate through `TextResolver`.                                                                                                         | [`text.test.ts`](../../packages/angular/test/text.test.ts), context, order, fallback, and isolation; [`native-renderers.test.ts`](../../packages/angular/test/native-renderers.test.ts), resolved labels and issues.                                                                                                                        | Mapped     |
|  15 | Make structural sharing observable in tests.                                                                                              | [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), `preserves unaffected field snapshot references` and atomic external updates.                                                                                                                                                                                                | Mapped     |
|  16 | Return compiler/runtime diagnostics for expected failures instead of throwing.                                                            | Compiler, operation, and runtime conformance suites; [`compiler.test.ts`](../../packages/core/test/compiler.test.ts), independent deterministic errors; [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), validator/listener exception isolation.                                                                              | Mapped     |
|  17 | Dispose the runtime idempotently.                                                                                                         | [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), idempotent unsubscribe/disposal; runtime conformance `disposal`; [`directives.test.ts`](../../packages/angular/test/directives.test.ts), host-view lifecycle disposal.                                                                                                       | Mapped     |
|  18 | Normalize descriptor-safe string `enum` and `enumLabels` to immutable, ordered choices with non-blank labels.                             | [`compiler.test.ts`](../../packages/core/test/compiler.test.ts), enum normalization, descriptors, labels, and deep freezing; enum compiler conformance fixtures.                                                                                                                                                                            | Mapped     |
|  19 | Reject malformed manual choices before validation without widening operation inspection.                                                  | [`runtime.test.ts`](../../packages/core/test/runtime.test.ts), malformed manual-choice matrix and validator spy; [`operations.test.ts`](../../packages/core/test/operations.test.ts), `never inspects choices while applying structural operations`.                                                                                        | Mapped     |
|  20 | Resolve localized choice texts with deterministic fallback and diagnostics.                                                               | [`text.test.ts`](../../packages/angular/test/text.test.ts), choice context, locale, exception/non-string/blank fallback order; [`directives.test.ts`](../../packages/angular/test/directives.test.ts), identity/locale reprojection.                                                                                                        | Mapped     |
|  21 | Select the rank-20 native enum renderer with rank-10 string fallback and ADR-007 overrides.                                               | [`string-enum-renderer.test.ts`](../../packages/angular/test/string-enum-renderer.test.ts), rank 20/10; [`native-renderers.test.ts`](../../packages/angular/test/native-renderers.test.ts), priority and custom override cases; [`renderer.test.ts`](../../packages/angular/test/renderer.test.ts), deterministic resolver rules.           | Mapped     |
|  22 | Keep `<select>` controlled while distinguishing missing from empty string and avoiding emissions during reconciliation or locale changes. | [`string-enum-renderer.test.ts`](../../packages/angular/test/string-enum-renderer.test.ts), private tokens and exact empty-string value; [`native-renderers.test.ts`](../../packages/angular/test/native-renderers.test.ts), missing, invalid external values, rejection, locale, zoneless, lifecycle, accessibility, and operation counts. | Mapped     |

## G0 gate evidence

| Gate requirement                                         | Current assessment | Required evidence                                                                                                                                                                                                                   |
| -------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Map all 22 SPEC-001 criteria.                            | Mapped             | This matrix identifies direct evidence for 22/22 criteria and no evidence gap.                                                                                                                                                      |
| Exercise built packages from a minimal Angular consumer. | Passed             | [`consumer.test.ts`](../../packages/angular/test/consumer.test.ts) imports both package roots, compiles and renders all four primitive kinds, applies `set-value`, and confirms the external value without workspace `src` imports. |
| Repeat full verification.                                | Passed             | Frozen install; format, lint, typecheck; 176 tests; builds; package smoke; consumer; declarations; architectural boundaries; Markdown links; and diff integrity passed.                                                             |
| Review SPEC-001 end to end.                              | Passed             | The repeated review checked corrected v0.1.14 against accepted plans, public contracts, implementation, declarations, deferred boundaries, and executable evidence without a remaining finding.                                     |

## G0 execution log

### Minimal Angular consumer — Passed

- **Command:** `pnpm test:consumer`
- **Result:** 1 test file and 1 test passed after building both packages.
- **Consumer boundary:** imports only `@rabassoft/schema-engine`,
  `@rabassoft/schema-engine-angular`, Angular, and Vitest entry points.
- **Behavior:** compiles a root schema containing string, number, integer, and
  boolean fields; renders native inputs; emits a controlled `set-value`;
  applies it in the host; and confirms the external value back into the
  snapshot and control.
- **Additional checks:** workspace lint and typecheck passed; no dependency or
  lockfile changed.

### Complete verification — Passed

- `CI=true pnpm install --frozen-lockfile` passed after retrying outside the
  restricted network sandbox; the lockfile remained unchanged, 198 packages
  were reused, and none was downloaded.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 14 files and 176 tests, comprising 129 core tests and 47
  Angular tests.
- Both packages built; `pnpm test:package` and `pnpm test:consumer` passed.
- Declaration and public-surface inspection found the expected compiler,
  runtime, enum, renderer, and Angular controlled-form exports and no unintended
  manifest, package-entry, or lockfile change.
- Core remains free of Angular, RxJS, DOM, browser, and Node runtime imports;
  Angular Forms imports remain limited to `@angular/forms/signals`; package and
  consumer tests use public package boundaries without workspace `src` imports.
- All 32 Markdown documents and 141 local links passed; `git diff --check`
  passed.

### Repeated end-to-end review — Passed

- Read every normative section of corrected SPEC-001 v0.1.14 and checked its
  responsibilities, contracts, exclusions, criteria, and conformance scenarios
  against the accepted plans and applicable ADRs.
- Confirmed D-038 and D-039 preserve application ownership and do not expose or
  promote either deferred helper.
- Confirmed `SubscribeResult` matches PLAN-003, source contracts, runtime,
  package exports, generated declarations, and tests.
- Repeated format, lint, typecheck, 176 tests, both builds, package smoke, and
  the built-package consumer successfully. Boundary and diff checks found no
  product or package change.
- No new or remaining normative, evidence, implementation, declaration, ADR,
  plan, or deferred-boundary finding was identified.

## Findings and approved resolutions

### G0-F001 — Missing `commitScopeToBaseline()` contract

- **Initial finding in Draft v0.1.13:** section 16.1 promised the pure helper
  `commitScopeToBaseline(baselineValue, currentValue, scope)`.
- **Observed state:** the helper is absent from core source, public contracts,
  exports, declarations, tests, and PLAN-003's approved delivery boundary.
- **Impact:** the normative SPEC promises a core capability that the accepted
  plans and implementation do not deliver.
- **Resolution applied:** SPEC-001 no longer promises the helper in the first
  prototype, keeps baseline ownership in the application, and records a future
  reusable helper as D-038.

### G0-F002 — Missing `applySchemaDefaults()` contract

- **Initial finding in Draft v0.1.13:** section 18 promised the pure helper
  `applySchemaDefaults(schema, value)`.
- **Observed state:** the helper is absent from core source, public contracts,
  exports, declarations, and tests. PLAN-001 explicitly kept default
  application outside its increment, and no later approved plan promoted it.
- **Impact:** the normative SPEC promises a capability that was intentionally
  excluded from implementation planning.
- **Resolution applied:** SPEC-001 documents the implemented metadata-only
  treatment of `default`, removes the unimplemented helper promise, and records
  explicit default application as D-039.

### G0-F003 — Subscription return-type conflict

- **Initial finding in Draft v0.1.13:** section 21.3 declared that `subscribe()`
  and `subscribeOperations()` return `Unsubscribe`.
- **Observed state:** accepted PLAN-003, public contracts, declarations,
  runtime, and tests consistently use `SubscribeResult`.
- **Impact:** the normative SPEC and the accepted, executable public contract
  disagree.
- **Resolution applied:** SPEC-001 now defines `SubscribeResult` and aligns both
  subscription methods with accepted PLAN-003 and the executable public API.

## Current conclusion

- Direct automated evidence is mapped for all 22 walking-skeleton criteria.
- No acceptance-criterion evidence gap was found during the inventory.
- The minimal built-package Angular consumer gate passed.
- Complete G0 verification passed with 176 tests and all required package,
  declaration, boundary, link, and diff checks.
- The three normative findings have approved documentation-only resolutions in
  SPEC-001 v0.1.14 and deferred entries D-038 and D-039; no product API or
  behavior changed.
- The repeated end-to-end review passed without findings. G0 is complete and
  SPEC-001 v0.1.14 is Accepted.
