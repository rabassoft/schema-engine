# PLAN-037: First Client-Rendered React Adapter

- **State:** Completed revision 0
- **Date:** 2026-08-04
- **Approval date:** 2026-08-06
- **Completion date:** 2026-08-07
- **Milestone:** M35 — First React adapter and admitted reference shell
- **Authority:** Accepted ADR-038 revision 0 and SPEC-021 v0.1.0
- **Scope:** Implement exactly the 36-row M35 contract across the private
  source package, React lifecycle/projection, independent reference shell,
  package/source consumers and repository verification
- **Complete review:** [Review 341](../reviews/341-plan-037-review.md) cycle 2
  passed all fifteen areas and exact 36-row ownership with zero findings after
  five corrections; approved by Ricard on 2026-08-06
- **Completed checkpoints:** checkpoints 1–10; checkpoint 1 passed
  [review 343](../reviews/343-plan-037-checkpoint-1-review.md) cycle 4 and
  checkpoint 2 passed
  [review 344](../reviews/344-plan-037-checkpoint-2-review.md) cycle 3 with zero
  findings; checkpoint 3 passed
  [review 345](../reviews/345-plan-037-checkpoint-3-review.md) cycle 4 with zero
  findings; checkpoint 4 passed
  [review 346](../reviews/346-plan-037-checkpoint-4-review.md) cycle 2 with zero
  findings; checkpoint 5 passed
  [review 347](../reviews/347-plan-037-checkpoint-5-review.md) cycle 3 with zero
  findings; checkpoint 6 passed
  [review 348](../reviews/348-plan-037-checkpoint-6-review.md) cycle 3 with zero
  findings; checkpoint 7 passed
  [review 349](../reviews/349-plan-037-checkpoint-7-review.md) cycle 3 with zero
  findings; checkpoint 8 passed
  [review 350](../reviews/350-plan-037-checkpoint-8-review.md) cycle 3 with zero
  findings; checkpoint 9 passed
  [review 351](../reviews/351-plan-037-checkpoint-9-review.md) cycle 2 with zero
  findings; checkpoint 10 and the complete plan passed
  [final review 352](../reviews/352-plan-037-final-implementation-review.md)
  cycle 1 with zero findings
- **Authorized after approval:** checkpoints 1–10 in order, except that the
  checkpoint-1 dependency/lockfile mutation retains a separate execution gate
- **Not authorized:** public version selection, removal of package privacy,
  release, publication, npm/GitHub settings, commit, push or external mutation

## 1. Objective

Deliver one client-rendered React 19.2 web adapter that exposes the exact
sixteen Public + Experimental root exports from SPEC-021, projects the complete
neutral M1–M34 surface with native HTML and custom React renderers, and powers
one independent private React reference shell over the existing scenario
catalog.

Preserve the application as the only value/baseline/wizard/service authority,
keep core and every other adapter framework-neutral/independent, and preserve
all completed M1–M34/G0 behavior and unrelated dirty work.

## 2. Delivery and autonomous-execution rules

After approval, execute checkpoints 1–10 strictly in order. Before each,
update only `STATUS.md#In progress`; implement each SPEC row first in its owning
checkpoint; run proportional verification; review the complete checkpoint;
correct and repeat the complete review until zero findings; compact STATUS and
prepend WORKLOG; then advance without asking at ordinary boundaries.

Stop for an Accepted-document conflict, Public contract/scope change,
materially different architecture, unlisted dependency, public version/release
decision, external/destructive/Git action, owner-only command or real diagnosed
blocker. Checkpoint 1 may prepare local manifests/configuration, but must pause
before the first dependency/lockfile mutation and request the separately gated
execution approval.

React, Angular and Standard may share only core contracts and neutral scenario
data/evidence. They must not share component/controller lifecycle, renderer
implementations, projection caches, CSS or target-local presentation state.

## 3. Frozen dependency and project inventory

Registry evidence checked on 4 August 2026 selects this local implementation
tuple:

| Package                    | Exact local version / relationship                                         |
| -------------------------- | -------------------------------------------------------------------------- |
| `react`                    | `19.2.8`; package peer `>=19.2.0 <20.0.0`                                  |
| `react-dom`                | `19.2.8`; package peer `>=19.2.0 <20.0.0`                                  |
| `@types/react`             | `19.2.17`, development only                                                |
| `@types/react-dom`         | `19.2.3`, development only                                                 |
| `@vitejs/plugin-react`     | `6.0.4`, root development tooling for existing Vite `8.1.4`                |
| `@rabassoft/schema-engine` | `workspace:*` local development/peer evidence; final public range deferred |

React and React DOM remain exact/aligned in every workspace and clean consumer.
No testing library, state library, CSS framework, router, form library, React
Compiler, server renderer or UI kit is admitted. Existing Vitest, happy-dom,
Playwright, Vite, TypeScript, CodeMirror and repository scripts are reused.

Expected new projects are exactly:

```text
packages/react
apps/reference-react
```

The package is `@rabassoft/schema-engine-react`, private `0.0.0`, ESM,
`sideEffects: false`, one root export and no deep imports. The app is
`@schema-engine-internal/reference-react`, private `0.0.0`, client-only and
uses `createRoot` under `StrictMode`.

Direct manifest ownership is exact:

| Owner               | Direct entries                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Workspace root dev  | `@vitejs/plugin-react@6.0.4` only                                                                                                    |
| React adapter peers | core `workspace:*`; React/DOM `>=19.2.0 <20.0.0`                                                                                     |
| React adapter dev   | core `workspace:*`; React/DOM `19.2.8`; types `19.2.17`/`19.2.3`                                                                     |
| React shell runtime | core, React adapter, validator and scenarios `workspace:*`; React/DOM `19.2.8`; the Standard editor's exact CodeMirror/highlight set |
| React shell dev     | `@types/react@19.2.17` and `@types/react-dom@19.2.3`; shared test/build CLIs remain root-owned                                       |

The reused editor set is `codemirror@6.0.2`,
`@codemirror/lang-javascript@6.2.5`, `@codemirror/lang-json@6.0.2`,
`@codemirror/language@6.12.4` and `@lezer/highlight@1.2.3`. No direct package
may be added implicitly. Transitive packages are not predeclared as direct
inventory: their exact resolved closure, peer metadata, licenses and lifecycle
scripts must be captured in the pre-install review and then frozen.

## 4. Checkpoint 1 — Private package/app foundation and dependency gate

### Deliverables

1. Create only the two exact private project directories, manifests, TypeScript
   build/test configs, Vite/Playwright shell configs, license/notice/source
   material and initially empty buildable entry/bootstrap boundaries.
2. Declare the exact React/core peers and exact development/app tuple from
   section 3; keep React, React DOM and core external to the adapter build.
3. Add root React-reference commands and extend only the required workspace
   tooling allowlists for the future target, without claiming working behavior.
4. Prepare the complete manifest/lockfile expectation and license/peer audit
   before any install. Do not change core/Angular/Standard manifests or source
   versions.
5. Request owner execution approval, then run one script-disabled frozen-scope
   dependency resolution. Reject lifecycle scripts, unexpected peers, React/
   DOM patch mismatch, extra importer changes or packages outside the inventory.

The exact root commands are `reference:react:build`, `reference:react:dev`,
`reference:react:test:unit` and `reference:react:test:e2e`. Development uses
port 4213 and the Playwright server uses 4214; the existing targets/ports remain
unchanged.

The authorized network command is selected only after the prepared manifest
diff and registry metadata are reviewed. It must use
`pnpm install --ignore-scripts`; no broad upgrade, dedupe or package-manager
version change is allowed. The resulting exact transitive closure is accepted
only if it matches the reviewed peer/license/lifecycle evidence and touches
only the root plus two new importers. The same authorization covers later
frozen-lockfile verification of this unchanged graph, but not another
resolution or dependency change.

### Owned rows and verification

- Rows 1 and 3 exactly.
- Manifest/export/peer assertions; exact importer and lock graph; license and
  lifecycle-script audit; adapter build externalization; unchanged existing
  versions/graphs; formatting, docs, diff and a complete checkpoint review to
  zero.

## 5. Checkpoint 2 — Controlled hook, bridge and complete action facade

### Deliverables

1. Add exact config/state/handle/actions contracts and `useSchemaForm`, using an
   inert store, stable `useSyncExternalStore` functions and client layout-effect
   runtime ownership with no server snapshot.
2. Implement descriptor-safe callback/resolver parsing, frozen state, package-
   copy opacity, Internal cross-copy diagnostics receiver and latest committed
   callback/projection generations.
3. Implement construction identity, atomic external value/baseline/locale then
   visibility reconciliation, wizard seed-only behavior, error cleanup/recovery
   and balanced subscription/disposal.
4. Implement every exact read/action result, epoch replacement, unavailable/
   stale/unmounted gating, one-time diagnostics delivery and no raw runtime,
   subscription, update or disposal escape.
5. Prove Strict Mode render/setup/cleanup replay, abandoned renders, stale
   notifications, callback exceptions, validator call boundaries and zero
   duplicate operation/wizard intentions.

### Owned rows and verification

- Rows 5–13 exactly.
- Hook/store/action unit and hostile-input suites under happy-dom; Strict Mode
  lifecycle counters; callback/order/re-entry/error recovery; type declarations;
  package build/lint/typecheck; existing core runtime regression; docs/diff and
  complete checkpoint review to zero.

## 6. Checkpoint 3 — Registry, projection cache and renderer isolation

### Deliverables

1. Add exact renderer props/component/tester/registration/opaque-registry/
   result contracts plus both registry factories and `SchemaForm`.
   `SchemaForm` consumes only handle + registry, returns `null` outside ready,
   and creates no business form, submit, persistence or raw-config boundary.
2. Parse dense own-data registrations atomically; preserve callable identity;
   implement exact malformed/duplicate/tester/no-match diagnostics and ADR-007
   rank/priority/order resolution.
3. Build post-commit/pre-paint projection caching so testers and text resolvers
   never execute during render/memo, stale generations cannot publish and
   diagnostics deliver in exact committed owner order.
4. Bind frozen normalized props and epoch/owner-gated callbacks without raw
   schema/runtime/application services. Validate renderer diagnostic batches.
5. Add one per-owner error boundary with exact reset identity, immediate
   callback closure, one committed safe diagnostic and sibling isolation.
6. Reject forged/cross-copy handle/registry composition without a partial tree
   or unsafe callback invocation.

### Owned rows and verification

- Rows 2 and 14–18 exactly. Row 2 becomes complete here when `SchemaForm`, both
  factories and all twelve type contracts coexist at the root; checkpoint 8
  later freezes the already complete inventory in artifacts/consumers.
- Hostile registry/diagnostic fixtures; tester purity/resolution/override tests;
  cache generation and error-boundary render/lifecycle tests; custom renderer
  contract/type tests; build/lint/types; docs/diff and complete review to zero.

## 7. Checkpoint 4 — Native leaves, text and primitive accessibility

### Deliverables

1. Add the six closed Internal native registrations with exact IDs, ranks and
   priorities; consumer registrations remain later and override only through
   rank/priority.
2. Independently implement string, string-enum, atomic string-enum-array,
   number/integer localized buffer, boolean and fixed projection.
3. Preserve every missing/empty/zero/negative-zero/false/null/fixed/
   incompatible edge and confirmed external-state/blur reconciliation rule.
4. Implement the complete React text snapshot, resolver contexts/order/fallback
   diagnostics and post-commit caching without importing Angular text code.
5. Implement visible labels, deterministic UTF-16 IDs, description/hint/issues,
   required/invalid/disabled/hidden/busy semantics and action text.

### Owned rows and verification

- Rows 19–20 exactly.
- One focused suite per native renderer; locale/edit/blur/clear/null/fixed/
  selection edge matrices; text resolver hostile/fallback/cache tests;
  semantic DOM checks; Angular native parity as evidence only; package checks,
  docs/diff and complete review to zero.

## 8. Checkpoint 5 — Objects, collections, alternatives and presentation

### Deliverables

1. Project ordinary/discriminated objects and recursive local nodes only from
   normalized definitions and immutable snapshots.
2. Project collection items and operations with stable item IDs/template keys;
   preserve component/native buffers across reorder and deactivate removed
   owners.
3. Unmount inactive alternative branches, release target-local state and
   preserve core/application value/baseline/touched restoration semantics.
4. Implement fixed Internal section, tabs, accordion and logical-grid hosts;
   preserve owner-local state and exact hidden/accessibility/focus behavior.
5. Consume core visible/enabled condition state without interpreting authored
   conditions or deriving a dependency graph.

### Owned rows and verification

- Rows 21–25 exactly.
- Nested/item/recursive/condition/alternative suites; reorder identity and
  stale callback tests; tabs/accordion keyboard and retained-state tests;
  deliberate no-D-025/CSS-Public audit; existing Angular/Standard presentation
  regressions; docs/diff and complete review to zero.

## 9. Checkpoint 6 — Validation, scopes, baseline and controlled wizard

### Deliverables

1. Project synchronous/async validation, visibility, issue text, technical
   states and retry only from neutral snapshots/actions; introduce no transport
   or validator policy.
2. Expose application scope reads/reveal/hide and baseline confirmation evidence
   without mutating value/baseline or adding React-owned confirmation state.
3. Project the normalized wizard with every step mounted once per epoch,
   inactive step hiding, retained nested/native state, exact progress text and
   noninteractive step indicators.
4. Wire projected previous/next/complete only to facade intentions; keep
   confirmation/rejection in the application and prove no double advance,
   direct selection, submission or React-owned progress.
5. Reconcile focus before owner/step deactivation and make stale events inert.

### Owned rows and verification

- Rows 26–28 exactly.
- Sync/async/visibility/retry, scoped validation/baseline invariant and complete
  wizard gate/progress/pending/confirm/reject/replay tests; retained focus/state
  DOM evidence; core/Angular/Standard regressions; docs/diff and complete review
  to zero.

## 10. Checkpoint 7 — Independent React reference shell

### Deliverables

1. Implement `createRoot` + `StrictMode` bootstrap and independent React-owned
   value/baseline/locale/visibility, operations, wizard decisions, async-service
   evidence, schema editing, reset and cleanup.
2. Make all catalog scenarios selectable and functional through Public package
   roots only. Extend reference boundary checks to forbid Angular/Standard
   implementation/CSS/controller imports.
3. Reproduce the maintained scenario, controls, interactive form, schemas,
   evidence and integration experience with independent React components and
   deliberately duplicated target CSS, light/dark mode and copy actions.
4. Extend deterministic real-source snippet extraction with a React target and
   committed generated module; do not hand-edit snippets.
5. Add all-scenario unit/application coverage and independent production build.
6. Add an independent Chromium lane on fixed ports covering representative
   primitive, nested, collection, condition, alternative, async, scope, wizard,
   editor/reset, theme and copy paths.

### Owned rows and verification

- Rows 29–30 exactly.
- Catalog/reference unit/build/snippet/boundary checks; sequential React
  Chromium lane and semantic/accessibility audit; comparison with maintained
  Angular/Standard behavior without source sharing; docs/diff and complete
  review to zero.

## 11. Checkpoint 8 — Root inventory, packages and isolated consumers

### Deliverables

1. Freeze the exact four-value/twelve-type root declaration and runtime
   inventory; assert all native/bridge/cache/brand/host helpers remain Internal
   and every deep import fails.
2. Add package smoke, built consumer, packed artifact and isolated source
   reconstruction for the private adapter without pretending it is publishable.
3. Add aligned lower `19.2.0` and frozen current `19.2.8` React/DOM consumers;
   current types remain the exact section-3 tuple. Prove hooks, native form,
   custom registry, actions and declarations from Public roots only.
4. Prove React/DOM/core remain peers and unbundled, workspace protocols rewrite
   deterministically, and no packed/source consumer resolves Angular/Standard
   implementation or workspace source accidentally.
5. Update package README/SOURCE/NOTICE and onboarding examples with Experimental
   status, client-only constraints and no selected public core/version claim.

### Owned rows and verification

- Rows 4 and 31 exactly; row 2 is repeated but not first-owned.
- Exact runtime/declaration/export inventories; lower/current clean consumers;
  package/source/packed reconstruction and deep-import rejection; bundle graph;
  all package checks; docs/diff and complete review to zero.

## 12. Checkpoint 9 — Complete regression and repository integration

### Deliverables

1. Run complete core, Angular, Angular Aria, validator, scenarios, Angular/
   Standard/React reference and tooling unit/type/lint/build suites.
2. Run package, packed/source reconstruction and all clean-consumer matrices;
   prove existing published/frozen package bytes and release tooling remain
   unchanged.
3. Run Angular, Standard and React Chromium lanes sequentially with no port/
   browser/cache collision and only already accepted build advisories.
4. Run reference/package/workspace boundaries, formatting, docs, policy,
   security, public-tree/history and workflow checks proportional to the dirty
   checkout.
5. Reconcile README, `.ai-docs/README`, STATUS, ROADMAP, indexes, Deferred and
   WORKLOG without selecting a release or changing Stable/Experimental tiers.

### Owned rows and verification

- Rows 32–35 exactly.
- Full command/evidence ledger, frozen graph/version/artifact audit, sequential
  browsers, `pnpm format:check`, `pnpm docs:check`, `git diff --check` and one
  complete checkpoint review to zero.

## 13. Checkpoint 10 — Frozen matrix and final closure

### Deliverables

1. Repeat every checkpoint claim and SPEC-021 rows 1–36 with no ownership gap,
   duplication, skipped consumer or scope expansion.
2. Repeat the complete workspace/package/reference/browser/tooling/policy/
   security/boundary/documentation matrix from a frozen lockfile.
3. Audit that no public version, package privacy, release/publication command,
   registry/repository setting, commit, push or external state changed.
4. Reconcile persistent state and mark PLAN-037/M35 complete only after one
   complete final review produces zero findings.

### Owned row and verification

- Row 36 exactly.
- Frozen install/graph, full matrix, row audit, documentation/diff and final
  implementation review to zero.

## 14. Conformance ownership

| Checkpoint | Rows     | Exclusive first responsibility                                                           |
| ---------- | -------- | ---------------------------------------------------------------------------------------- |
| 1          | 1, 3     | Private package identity and exact peer/dependency boundary.                             |
| 2          | 5–13     | Config, hook, store, facade, reconciliation and Strict Mode.                             |
| 3          | 2, 14–18 | Complete root inventory, registry, projection cache, composition and renderer isolation. |
| 4          | 19–20    | Native primitive set, text and primitive accessibility.                                  |
| 5          | 21–25    | Objects, collections, alternatives, presentation and conditions.                         |
| 6          | 26–28    | Validation, scopes/baseline and controlled wizard.                                       |
| 7          | 29–30    | Complete independent React reference shell and experience.                               |
| 8          | 4, 31    | Compatibility tuples and isolated artifacts; repeat/freeze row 2.                        |
| 9          | 32–35    | Regression, tooling, no-drift and documentation integration.                             |
| 10         | 36       | Frozen complete review and M35 closure.                                                  |

Every integer 1–36 appears exactly once. Later checkpoints repeat earlier
semantics for integration/regression evidence but never first-own them.

## 15. Expected repository diff

Production scope is limited to:

- new `packages/react/**`;
- new `apps/reference-react/**`;
- root scripts/development dependency and exact lockfile import/graph needed by
  the React target;
- extensions to generic package/source/consumer, snippet, reference-boundary,
  Playwright-runner and documentation verification scripts; and
- scenario/reference metadata changes only when required to expose already
  accepted catalog behavior to React.

No core/Angular/Standard production contract or package version changes. No
shared target CSS/controller/components, UI kit, persistence/backend or release
automation enters the diff.

## 16. Approval gate

PLAN-037 may become Approved only after a repeated complete review confirms:
Accepted authority/exclusions; exact one-time 36-row ownership; buildable
checkpoint order; frozen dependency inventory and separate network gate;
hook/render purity; registry/native/compound/wizard boundaries; independent
shell; proportional package/consumer/browser evidence; autonomous stop rules;
unchanged public versions/release/Git authority; and documentation, links,
formatting and diff hygiene.

Approval would authorize checkpoints 1–10 in order, but checkpoint 1 must still
pause before dependency/lockfile mutation for the separately gated execution
approval. It would not authorize a public version, removal of `private`, release,
publication, commit, push or external action.

## 17. History

| Revision | Date       | Change                                                                                                |
| -------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| 0        | 2026-08-06 | Approved after review 341 cycle 2 passed fifteen areas and exact 36-row ownership with zero findings. |

## 18. Dependency evidence

- [React npm versions](https://www.npmjs.com/package/react?activeTab=versions)
- [React DOM npm versions](https://www.npmjs.com/package/react-dom?activeTab=versions)
- [`@types/react` npm](https://www.npmjs.com/package/@types/react)
- [`@types/react-dom` npm](https://www.npmjs.com/package/@types/react-dom)
- [`@vitejs/plugin-react` npm](https://www.npmjs.com/package/@vitejs/plugin-react)
