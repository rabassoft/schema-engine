# PLAN-020: Static advanced presentation layout and Angular Aria pilot

- **Status:** Completed revision 0
- **Date:** 2026-07-18
- **Approval date:** 2026-07-18
- **Complete review:** [`review 103`](../reviews/103-plan-020-review.md) cycle 2
  passed all fourteen areas with zero findings after four corrections
- **Requires:** accepted
  [`SPEC-008 v0.1.0`](../specs/008-static-advanced-presentation-layout.md),
  [`ADR-023 revision 1`](../adrs/023-contenedores-layout-neutral-estatico.md),
  [`ADR-024 revision 1`](../adrs/024-spi-contenedores-angular-y-piloto-angular-aria.md),
  [`SPEC-005 v0.1.1`](../specs/005-static-presentation-groups.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-010`](../adrs/010-versionado-semver-compatibilidad.md),
  [`ADR-020 revision 0`](../adrs/020-plataforma-referencia-multiframework.md)
  and [`ADR-021 revision 1`](../adrs/021-shell-standard-dom-core-directo.md)
- **Milestone:** M18 — Static neutral advanced layout
- **Promoted capabilities:** only the accepted narrow D-011 and Angular
  Experimental D-025 slices
- **Implementation authorized:** Yes — checkpoints 1–8 only; checkpoint 5/7
  network actions, publication, external settings, commit and push retain their
  separate gates
- **Implementation state:** Checkpoints 1–8 completed after
  [`review 104`](../reviews/104-plan-020-checkpoint-1-review.md) and
  [`review 105`](../reviews/105-plan-020-checkpoint-2-review.md), plus
  [`review 106`](../reviews/106-plan-020-checkpoint-3-review.md), plus
  [`review 107`](../reviews/107-plan-020-checkpoint-4-review.md) cycle 5, each
  passed its complete review with zero findings; checkpoint 5 local preparation
  passed [`review 108`](../reviews/108-plan-020-checkpoint-5-pre-network-review.md)
  cycle 3 and the resolved gate passed
  [`review 109`](../reviews/109-plan-020-checkpoint-5-review.md) cycle 1 with zero
  findings; checkpoint 6 passed
  [`review 110`](../reviews/110-plan-020-checkpoint-6-review.md) cycle 2 with zero
  findings; checkpoint 7 local/pre-network preparation passed
  [`review 111`](../reviews/111-plan-020-checkpoint-7-pre-network-review.md)
  cycle 3 and its registry-backed completion passed
  [`review 112`](../reviews/112-plan-020-checkpoint-7-review.md) cycle 1 with zero
  findings; checkpoint 8 and the complete plan passed
  [`review 113`](../reviews/113-plan-020-final-implementation-review.md) cycle 2
  with zero findings

## 1. Goal and boundary

Deliver the exact accepted M18 pipeline:

```text
root UI presentation
  -> descriptor-safe atomic core normalization
  -> immutable advanced presentation forest
  -> unchanged controlled runtime/data authority
  -> independent Standard and Angular native projection
  -> separate Angular container SPI
  -> isolated optional Angular Aria 22 pilot
```

The delivery adds static root-only tabs, accordion and logical grid; the exact
Public Experimental core and base Angular inventories; mandatory dependency-free
native Angular fallback; one private-first Angular Aria package; and independent
Standard/reference evidence. It does not add workflow, scopes, conditional or
nested/item layout, controlled layout state, generic tokens, a Standard package,
React, Vue, legacy Angular, Angular 23, another UI kit or a release.

Approval authorizes only checkpoints 1–8. It does not authorize publication,
registry/repository settings, commit, push or any external release action.

## 2. Fixed migration and compatibility inventory

Implement exactly the SPEC-008 section 15 inventory:

- thirteen new Public core symbols and the three widened core unions;
- nine new Public base Angular symbols and the specified observable provider/
  projection behavior;
- Internal core and Angular helpers only where needed to enforce the accepted
  contracts;
- one new package, `@rabassoft/schema-engine-angular-aria`, whose only root
  Public symbol is `provideSchemaEngineAngularAriaContainers()` and whose only
  style entry point is `./styles.css`;
- private catalog, Angular reference and Standard reference changes; and
- no other Public symbol, entry point, capability or target.

All new or changed APIs remain Public + Experimental + Active. Core and base
Angular move together only for this private delivery candidate from `0.2.0` to
`0.3.0`; the pilot starts at `0.1.0`. Existing published `0.2.0` artifacts and
npm tags remain untouched.

## 3. Checkpoint 1 — Core contracts, compiler and fixtures

1. Add the thirteen exact Public core contracts, widen only
   `UiPresentationEntry`, `PresentationEntryDefinition` and
   `TextResolutionContext`, and update root exports/declaration assertions.
2. Extend iterative root presentation inspection for tabs, accordion, panels,
   grid and grid items using only own enumerable data descriptors.
3. Implement the complete closed `INVALID_UI_PRESENTATION` reason, parameter,
   expectation, path, precedence, safe-copy and deterministic-order contract.
4. Normalize exact tagged keys, global/owner-local identity, spans and deeply
   frozen arrays/objects while retaining exact presented-node object identity.
5. Preserve the complete atomic default forest for absent or invalid authored
   presentation and every existing independent safe diagnostic.
6. Add serializable conformance fixtures plus programmatic accessor, sparse,
   cycle, reuse, deep, prototype, hostile-ID and lone-surrogate cases.

Gate: focused compiler/contract/conformance suites, declarations, core build,
strict types and a complete checkpoint review pass with zero findings. No
runtime, Angular, Standard, manifest or dependency change enters this checkpoint.

## 4. Checkpoint 2 — Manual definitions and runtime invariance

1. Extend the shared iterative manual-presentation validator with the eight
   exact new reasons, numeric index paths, precedence, identity and namespace
   rules from SPEC-008 section 8.
2. Apply it consistently before runtime validator invocation and before form
   operation logic, preserving the existing outer diagnostic envelopes.
3. Prove snapshots still mirror only `definition.nodes`; validation receives
   the exact schema and controlled value; and presentation never changes value,
   baseline, operations, scopes, issues, dirty, touched or focused ownership.
4. Prove hidden/collapsed descendants remain ordinary validated nodes and that
   presentation reordering cannot alter data or stable collection identity.
5. Migrate only repository manual definitions and expected normalized fixtures
   required by the accepted contract.

Gate: every manual reason/path and non-invocation case, runtime/operation/scope/
validation invariance, complete existing core regression suite and a repeated
checkpoint review pass with zero findings.

## 5. Checkpoint 3 — Base Angular SPI and native containers

1. Add exactly the nine Public Experimental base Angular exports and no raw
   token, resolver, host factory, diagnostic channel or application/runtime
   authority.
2. Implement descriptor-safe copied/frozen registration validation, exact
   diagnostics, deterministic rank/priority/order selection and immutable
   host-time selection.
3. Install mandatory native registrations in exact order: `native-section`,
   `native-tabs`, `native-accordion`, `native-grid`, each rank `0` only for its
   own kind.
4. Implement scoped entry/panel outlets, exact-definition claim tracking,
   post-creation completeness audit, nearest failure ownership and exact-once
   cleanup.
5. Project section, tabs, accordion and grid with exact labels, IDs, roles,
   relationships, keyboard behavior, initial/retained/replaced state, mounted
   hidden descendants and forward-only grid placement/one-column fallback.
6. Extend Angular text projection with exact advanced contexts, depth-first
   ordering, fallback diagnostics and locale-only model replacement without
   recreating renderer/state.
7. Prove tester failures recover to native selection, selected-host failures do
   not retry, and independent siblings continue.

Gate: base Angular Public declaration assertions; provider/claim/failure tests;
native accessibility, state, lifecycle and grid tests; existing leaf/object/
collection/nullable/Signal Forms regressions; build/types; and one complete
zero-finding checkpoint review.

## 6. Checkpoint 4 — Independent Standard projection and shared scenario

1. Add `advanced-layout` and one `advanced-presentation` scenario to the private
   neutral catalog, composing section, nested tabs, accordion and grid over the
   existing root nodes without changing value or operations.
2. Extend the Standard shell directly from core contracts with target-owned DOM,
   state, text fallback, exact IDs, accessibility, mounted hidden descendants,
   reconciliation, one-column fallback and teardown.
3. Extend the Angular reference native lane from the same authored scenario,
   without sharing target components, controllers, CSS, lifecycle helpers or
   Angular text services with Standard.
4. Keep shared material limited to scenario data, copy and semantic evidence;
   preserve the existing deliberate duplicated visual baseline.
5. Add independent unit/DOM and Chromium assertions for both shells, including
   snapshot reconciliation, reset/replacement boundaries and exact-once cleanup.

Standard label failures remain application-local under ADR-021: its tests prove
exact source fallback and depth-first order but do not assert or create the
Angular `TEXT_RESOLUTION_FAILED` Public diagnostic contract.

Gate: catalog, Standard and native Angular unit/build/Chromium lanes, reference
boundary/snippet checks, semantic parity evidence and a complete zero-finding
checkpoint review. No pilot dependency or implementation is present yet.

## 7. Checkpoint 5 — Version, package and dependency gate

1. Set only core and base Angular source package versions to `0.3.0`, retain
   their accepted peer alignment, and create the private-first pilot at `0.1.0`.
2. Add the pilot's ESM/partial-compilation configs, license/notice/source/readme,
   explicit root and `./styles.css` exports, package smoke and declaration
   allowlists before adding implementation.
3. Declare exactly these pilot peers: base Angular `^0.3.0`, Angular core
   `>=22.0.6 <23.0.0`, Angular Aria `>=22.0.5 <23.0.0` and Angular CDK
   `>=22.0.5 <23.0.0`; keep `tslib` as its only runtime dependency.
4. Resolve the implementation tuple exactly at Angular core/forms `22.0.6`,
   Angular Aria `22.0.5` and CDK `22.0.5`. Aria and CDK are pilot development
   dependencies only and never core/base dependencies.
5. Inspect the resolved Aria peer metadata and fail the gate unless its exact CDK
   peer patch equals the resolved CDK patch.

The dependency mutation is a separate external/network checkpoint. Create and
review the pilot manifest first, then request execution approval before running:

```sh
pnpm --filter @rabassoft/schema-engine-angular-aria add --save-dev --save-exact --ignore-scripts \
  @angular/aria@22.0.5 @angular/cdk@22.0.5
```

The expected lockfile scope is one new workspace importer and the exact Aria/CDK
22.0.5 graph; the existing root Angular 22.0.6 toolchain supplies compilation
development dependencies. The pilot manifest separately retains the peer and
`tslib` runtime declarations fixed above. If the registry cannot be reached,
resolution differs, lifecycle scripts appear or any transitive license/peer
fact conflicts with ADR-024, stop without bypassing the frozen graph.

Gate: manifest/lockfile diff is limited to the three accepted packages and exact
dependency graph; license and peer evidence passes; existing core/base artifacts
contain no pilot import/peer/style; and the complete checkpoint review has zero
findings. Publication and release tooling remain unchanged.

## 8. Checkpoint 6 — Angular Aria pilot and theme boundary

1. Implement the four exact rank-`10`, priority-`0` registrations returned by
   `provideSchemaEngineAngularAriaContainers()`.
2. Use Angular Aria only for tabs with follow-focus, wrapping, preserved content
   and the exact private selected-`tabpanelId` signal contract.
3. Keep pilot section as native fieldset/legend, accordion as native disclosure
   without Arrow/Home/End behavior, and grid as source-order CSS grid without
   data-grid semantics.
4. Use the Public base outlets only; satisfy every exact claim, mounted lifecycle,
   state, ID, accessibility, failure-isolation and cleanup rule over the same
   normalized definitions as native.
5. Add opt-in, host-scoped `./styles.css` with only the six exact Public CSS
   properties and exact defaults. Add no reset, global selector, typography,
   icon, application layout or JS style side effect.
6. Prove application-owned light/dark values and usable behavior with the style
   absent; no runtime kit switching or automatic dependency detection.

Gate: pilot declarations/package smoke, native-versus-Aria semantic conformance,
focused unit/DOM/accessibility/theme tests, partial compilation, strict types,
production build and one complete zero-finding checkpoint review.

## 9. Checkpoint 7 — Clean consumers and complete cross-target evidence

1. Extend package/source/artifact verification for the coordinated private
   `0.3.0` core/base line and isolated `0.1.0` pilot without changing current
   release commands, registry state or published-candidate directories.
2. Prove source and packed artifacts rewrite workspace dependencies to ordinary
   SemVer and contain only their explicit export maps/files.
3. Add clean lower-bound and latest-compatible Angular 22 consumers for base
   native and pilot lanes; require exact Angular core/forms patch alignment and
   exact Aria/CDK peer-patch alignment.
4. Run partial compilation, strict types, unit/DOM, production build and Chromium
   in clean consumers. No repository app may substitute for this evidence.
5. Audit core/base declarations, manifests and tarballs for zero pilot/Aria/CDK/
   style leakage, and audit pilot output for no bundled/copied peers.
6. Close every row in section 12 with named passing evidence and inspect the
   complete scoped production/test/documentation diff.

Gate: package, artifact, source, security, import-boundary, clean-consumer and
all independent browser lanes pass; all 22 conformance rows are evidenced; and
the complete checkpoint review has zero findings.

The existing `0.2.0` release scripts remain a published-baseline regression,
not evidence for the new private lines. Add explicit parameterized local checks
for core/base `0.3.0` plus pilot `0.1.0`; do not silently retarget
`prepare:release`, current `.release/0.2.0` contents or npm-facing commands.
Registry queries/installations needed for latest-compatible clean consumers are
a second external/network gate and require execution approval before they run.

## 10. Checkpoint 8 — Final repeated review and handoff

1. Run focused and full repository verification under Node 22.23.1/pnpm 10.28.2.
2. Inspect Public exports/declarations, normalized keys/identity, provider and
   package boundaries, peer graph, emitted CSS, packed contents, reference
   isolation, deferred exclusions and the complete diff.
3. Repeat the entire implementation review after every correction until one
   complete cycle passes every review area and all verification with zero
   findings and no unresolved request.
4. Mark PLAN-020 and M18 complete only after that pass; compact STATUS, prepend
   WORKLOG and reconcile ROADMAP, indexes, onboarding and deferred state.

Gate: every prior checkpoint remains green in the final combined graph. No
failing, waived, partially evidenced or native-only result completes M18.

## 11. Expected production and dependency diff

Expected scope is limited to:

- core contracts/exports, compiler presentation inspection and the existing
  shared manual-definition validation paths;
- base Angular root exports plus Internal container registry/model/outlet/native
  projection, text, ID, diagnostics and lifecycle implementation;
- new `packages/angular-aria` package and its opt-in stylesheet;
- private scenario catalog and Angular/Standard reference projections;
- proportional tests, fixtures, package/consumer/boundary scripts and docs;
- core/base package versions, pilot manifests/configs and the exact accepted
  Aria/CDK lockfile graph.

`packages/validator-ajv` behavior/API, runtime snapshot/method signatures,
operations, scopes, validator contracts, primitive leaf registry, published
artifacts, release candidates and external systems do not change. Any unrelated
production file, new dependency, package, entry point, Public symbol or wider
version mutation triggers a stop and contract review.

## 12. SPEC-008 conformance map

| SPEC row | Checkpoint | Required named evidence                                                       |
| -------- | ---------- | ----------------------------------------------------------------------------- |
| 1        | 1          | raw/normalized fixture table for every container, panel and item form         |
| 2        | 1          | exact diagnostic reason/parameter/path/precedence/fallback matrix             |
| 3        | 1          | programmatic hostile descriptor, sparse, cycle, reuse and ID cases            |
| 4        | 1          | atomic full-default-forest and independent-warning assertions                 |
| 5        | 2          | every manual reason/path plus validator/operation non-invocation              |
| 6        | 1–2        | deep-freeze, exact-key and exact presented-node identity assertions           |
| 7        | 3–4        | Angular diagnostic/fallback and Standard local fallback/order/locale evidence |
| 8        | 3–4, 6     | native, Standard and Aria initial/retained/replaced state evidence            |
| 9        | 3–4, 6     | mounted hidden reconciliation and exact-once destruction counters             |
| 10       | 3–4, 6     | forward-cursor and one-column fallback tables in every target lane            |
| 11       | 3–4        | exact native Angular/Standard IDs, roles, keyboard and host failures          |
| 12       | 3          | descriptor-safe provider validation and exact diagnostic matrix               |
| 13       | 3          | ranking/ties/override/tester/native/no-retry selection matrix                 |
| 14       | 3          | foreign, duplicate and missing claim ownership/cleanup cases                  |
| 15       | 6–7        | same-definition native/Aria semantic conformance suite                        |
| 16       | 6          | Angular Aria tabs and native pilot section/accordion/grid proof               |
| 17       | 6–7        | six-property CSS/style-side-effect/theme isolation assertions                 |
| 18       | 5, 7       | exact peer metadata, patch-alignment and lower/latest clean consumers         |
| 19       | 5, 7       | core/base/pilot declaration, manifest, source and tarball allowlists          |
| 20       | 4, 6–7     | catalog plus both shells, strict builds and independent Chromium lanes        |
| 21       | 2–3, 7     | full existing core/Angular/runtime/operation/scope/validation regression      |
| 22       | 5–8        | git/registry/release isolation and zero external publication action           |

Each row must name concrete test files or commands in its checkpoint review.
Equivalent semantics are asserted independently; pixel equality is not an
oracle. A failed pilot row blocks M18 completion.

## 13. Verification matrix

At applicable checkpoints run focused suites plus:

```text
pnpm format:check
pnpm docs:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
pnpm test:source
pnpm test:artifacts
pnpm test:consumer:clean
pnpm reference:snippets:check
pnpm reference:test:boundaries
pnpm reference:test:unit
pnpm reference:standard:test:unit
pnpm reference:test:e2e
pnpm reference:standard:test:e2e
git diff --check
```

Before final completion also run `CI=true pnpm install --frozen-lockfile`, the
explicit private `0.3.0`/pilot artifact checks, base-native and pilot lower/latest
clean consumers, every focused browser lane and a scoped secret/generated-file/
license audit. Angular builds and Chromium may run outside the restricted
sandbox under the already documented environment constraint; that permission
does not authorize network installation or an external write. Any frozen install
cache miss or registry-backed consumer check pauses at the checkpoint 5/7
network gates instead of broadening that permission.

## 14. Persistent-state checkpoints

Before each checkpoint, record only that checkpoint under STATUS `In progress`.
After implementation and correction, run its full review until zero findings,
then compact STATUS and prepend one dated WORKLOG entry naming exact evidence.
Do not mark a checkpoint complete on a partial review or failing command.

Checkpoint completion authorizes the next checkpoint only inside this plan.
Checkpoints 5 and 7 still pause before the external dependency/registry actions
described there. Commit and push always require a separate explicit user
request.

## 15. Stop conditions

Stop before:

- changing an accepted SPEC-008/ADR-023/ADR-024 contract or any exact Public
  inventory, diagnostic, ID, peer, style or version rule;
- adding runtime/application layout authority, nested/item layout, scopes,
  workflow, conditions, persistence, SSR or another target/UI kit;
- adding a dependency other than the exact Angular Aria/CDK development/peer
  graph, or accepting a mismatched peer/license/lifecycle result;
- publishing, changing npm tags, release candidates, repository visibility,
  CI/external settings or any other external system;
- destructive action, commit or push; or
- an unresolved authoritative-document conflict or real verification blocker.

Ordinary implementation findings inside the approved contract are corrected and
the complete applicable review is repeated without pausing.

## 16. Completion criteria

PLAN-020 completes only when checkpoints 1–8, all 22 SPEC rows, focused and full
tests, declarations, packages, artifacts, clean consumers, both reference
targets, native/Aria lanes, documentation and one final repeated complete review
pass with zero findings. Completion changes no registry, release, repository or
Stable-support state.

## 17. Implementation checkpoint 7 local pre-network preparation

The local portion completed on 18 July 2026 after
[`review 111`](../reviews/111-plan-020-checkpoint-7-pre-network-review.md) cycle
3 passed its complete applicable review with zero findings. Core/base `0.3.0`
and pilot `0.1.0` now have explicit package, tarball, SemVer-rewrite, isolation,
security and frozen Corresponding Source gates. Two clean lower-bound consumers
independently prove native and pilot lanes at Angular core/forms `22.0.6` and
exact Aria/CDK `22.0.5` through partial compilation, strict types, DOM, production
build and Chromium. The published `0.2.0` regression now verifies its frozen
byte-identical local artifacts rather than trying to relabel private `0.3.0`
sources.

Checkpoint 7 remains incomplete. `pnpm test:consumer:m18:latest` is implemented
but has not run: it queries registry metadata, resolves the latest compatible
Angular 22 tuple and installs it into clean consumers. That command retains the
separate network authorization gate. No registry query, publication, release
candidate mutation, commit or push occurred in this local portion.

This paragraph records the checkpoint 7 command behavior at M18 delivery.
PLAN-021 checkpoint 3 later separates the current local command onto an
explicit frozen/offline tuple and requires `--tuple-source=registry` only from
the separately gated live M19 commands; it does not change the historical
checkpoint 7 evidence.

## 18. Implementation checkpoint 7 completion

Checkpoint 7 completed on 18 July 2026 after the separately authorized registry
lane resolved Angular core/forms/build/CLI/compiler `22.0.7` and Angular Aria/CDK
`22.0.5`. Both clean latest-compatible native and pilot consumers passed strict
peer installation, partial compilation, strict types, DOM, production build and
Chromium. [`Review 112`](../reviews/112-plan-020-checkpoint-7-review.md) cycle 1
reconciled that evidence with review 111 and passed the complete checkpoint with
zero findings. No publication, tag, candidate, commit or push occurred.

## 19. Implementation checkpoint 8 and completion

Checkpoint 8 completed on 18 July 2026 after the frozen offline install and
entire verification matrix passed. The final
[`review 113`](../reviews/113-plan-020-final-implementation-review.md) cycle 2
repeated all fourteen implementation areas, reconciled every one of the 22
SPEC-008 rows and closed with zero findings. Lower and latest native/pilot clean
consumers, all package/source/security gates, full workspace regression and both
independent reference-browser lanes pass. PLAN-020 revision 0 and M18 are
complete without publication, tag, release, repository, commit or push action.
