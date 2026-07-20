# PLAN-022: Recursive local presentation layout

- **Status:** Completed
- **Date:** 2026-07-19
- **Approval date:** 2026-07-19
- **Completion date:** 2026-07-19
- **Revision:** 0 — initial M20 implementation plan
- **Requires:** accepted
  [`SPEC-009 v0.1.0`](../specs/009-recursive-local-presentation-layout.md),
  [`ADR-025 revision 0`](../adrs/025-bosques-presentacion-locales-objetos-items.md),
  [`SPEC-008 v0.1.0`](../specs/008-static-advanced-presentation-layout.md),
  [`ADR-023 revision 1`](../adrs/023-contenedores-layout-neutral-estatico.md),
  [`ADR-024 revision 1`](../adrs/024-spi-contenedores-angular-y-piloto-angular-aria.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-010`](../adrs/010-versionado-semver-compatibilidad.md),
  [`ADR-014`](../adrs/014-modelo-objetos-anidados-paths-profundos.md),
  [`ADR-015`](../adrs/015-modelo-colecciones-identidad-operaciones.md),
  [`ADR-020`](../adrs/020-plataforma-referencia-multiframework.md) and
  [`ADR-021 revision 1`](../adrs/021-shell-standard-dom-core-directo.md)
- **Complete review:** [`review 136`](../reviews/136-plan-022-review.md) cycle 2
  passed all fifteen areas with zero findings after one correction
- **Final implementation review:**
  [`review 144`](../reviews/144-plan-022-final-implementation-review.md) cycle 3
  repeated the complete matrix and all 27 rows with zero findings
- **Milestone:** M20 — static local nested-object and collection-item layout
- **Promoted capability:** only the accepted D-011/SPEC-009 boundary
- **Implementation authorized:** Yes — checkpoints 1–8 only; dependency,
  version, release, Git and external actions remain excluded

## 1. Goal and hard boundary

Deliver the exact accepted M20 pipeline:

```text
root and local UI presentation
  -> descriptor-safe owner-local core normalization/fallback
  -> immutable generic node/template forests
  -> unchanged controlled runtime/data authority
  -> stable concrete object/item owner projection
  -> independent Standard and Angular native behavior
  -> existing Angular SPI and Angular Aria pilot over the widened domain
```

The implementation adds only recursive local forests for ordinary nested
objects, collection item roots and nested object templates. It reuses section,
tabs, accordion and bounded logical grid exactly. It does not add workflow,
actions, scopes, conditions, dynamic definitions, array-host presentation,
responsive authoring, general theming, another kit/framework/package/entry
point, version selection, release or external action.

Approval authorizes checkpoints 1–8 consecutively. It does not authorize a
dependency or manifest mutation, commit, push, registry/repository action or
publication.

## 2. Fixed migration and implementation inventory

Implement exactly SPEC-009 section 15:

- one new Public core alias,
  `TemplatePresentationEntryDefinition`;
- optional raw `presentation` only on `ObjectUiSchema` and `ItemUiSchema`;
- defaulted generic presentation wrapper/container/panel/grid-item families;
- required normalized forests on `ObjectFieldDefinition`,
  `ObjectNodeTemplate` and `ObjectItemTemplateDefinition`;
- owner-local compiler diagnostics/fallback and deterministic manual validation;
- widened section/advanced text definition domains with form-scoped static
  template-label reuse;
- widened existing Public Angular container definition/render model/tester and
  entry/panel outlet domains;
- Internal Angular concrete-owner context, stable template addressing, IDs,
  claims, diagnostics and lifecycle only;
- existing native and Angular Aria registrations over ordinary/template owners;
- independent private Standard projection and one neutral reference scenario;
  and
- proportional fixtures, tests, declaration/package consumers and docs.

All exported changes remain Public + Experimental + Active. Current package
versions, peers, dependencies, exports, CSS properties and publication state
remain unchanged. No lockfile, manifest, release candidate or published
artifact is rewritten.

## 3. Checkpoint 1 — Core contracts, local compiler and fixtures

1. Add the exact generic core declarations and required owner forests, keeping
   every unparameterized root meaning source-compatible.
2. Generalize default presentation construction over
   `FormNodeDefinition | FormNodeTemplate` without weakening wrapper identity.
3. Admit raw presentation only at ordinary object, item-root and object-template
   owners after local `order` and before descendant `fields` inspection.
4. Reuse the closed SPEC-008 grammar iteratively with exact owner-local
   membership, ID namespaces, descriptor safety, cycles, safe object reuse and
   diagnostic ordering.
5. Add exact `dataPath`/`templatePath`, owner tuples, qualified keys, deep
   freezing and atomic local fallback without changing underlying child arrays.
6. Keep root keys, root diagnostics and every absent-presentation normalized
   result byte-for-byte/structurally compatible.
7. Add serializable valid/invalid local-presentation fixtures and programmatic
   accessor, sparse, cycle, reuse, hostile-name, lone-surrogate and independent
   owner cases.

Gate: focused compiler/contracts/conformance tests, generated expected fixtures,
core declarations/build/types, existing root presentation regressions and one
complete checkpoint review pass with zero findings. Runtime, Angular and
Standard production files remain unchanged.

## 4. Checkpoint 2 — Manual definitions and runtime invariance

1. Generalize the iterative manual-presentation validator to each required
   ordinary/template owner forest using exact direct-child object identity.
2. Preserve the closed reason vocabulary and local numeric
   `presentationIndexPath`; add only exact frozen owner kind/path/template-path
   context to non-root runtime/operation envelopes.
3. Enforce deterministic root then structural-preorder owner selection and
   exact key/domain/namespace/cycle/span validation.
4. Prove the first definition defect prevents validator, operation and target
   invocation.
5. Migrate every repository-authored manual object/item-template definition and
   expected fixture with the exact default forest.
6. Prove snapshots, subscriptions, validation input, operations, scopes,
   issues, dirty/touched/focused state, controlled value/baseline and stable
   collection identity remain unchanged.

Gate: every manual reason/path/owner context and non-invocation case, complete
core runtime/operation/scope/validation regressions, build/types and a repeated
complete checkpoint review with zero findings.

## 5. Checkpoint 3 — Angular generic SPI and owner projection context

1. Widen only the accepted container definition, render model, tester,
   renderer input and entry/panel outlet domains to the exact
   `FormNodeDefinition | FormNodeTemplate` union.
2. Introduce one Internal owner projection context carrying the static owner,
   concrete stable collection address when applicable, exact owner definition/
   snapshot and existing ID/text/claim/diagnostic/cleanup services.
3. Generalize entry recursion so root wrappers still bind through
   `definition.nodes`, while local wrappers bind through the exact owner
   `children`/snapshot pair and template address.
4. Keep external testers/renderers isolated from raw schemas, snapshots,
   values, item IDs/indexes, operations, resolver and host factories.
5. Add owner context only to local tester/selection and structural-host
   diagnostics; keep provider-configuration and root diagnostics exact.
6. Preserve exact claim object identity, audit, nearest failure ownership,
   native fallback, selected-host no-retry and exact-once cleanup.

Gate: Public declaration assertions, provider/tester/claim/failure suites,
template type-consumer fixtures, no new Public symbol, base Angular build/types
and complete zero-finding checkpoint review. Object/item host templates do not
yet switch from ordered children to local forests.

## 6. Checkpoint 4 — Angular native local projection, text and lifecycle

1. Project each ordinary object, item root and nested template object through
   its required forest after the owner's fixed label/supporting text/issues/
   actions and before no other fixed region.
2. Derive exact concrete owner tuples and local section/container/panel/grid
   bases, never collection indexes.
3. Cache resolved presentation labels once per exact static definition,
   `formId` and locale across repeated item instances; add `sectionKey` only to
   local section failures.
4. Preserve native tabs/accordion initial and interaction state independently
   per concrete owner, plus exact roles, relationships, keyboard behavior,
   mounted hidden descendants and grid fallback.
5. Preserve complete item hosts, field buffers, focus and nested layout state
   across stable movement; create fresh state on insertion/reinsertion and
   destroy removed/invalid/replaced hosts exactly once.
6. Retain all existing object/collection/item focus recovery, text, issue and
   operation behavior outside the local forest.

Gate: native ordinary/item/template projection tests; exact IDs/text cache/
diagnostics; movement/insertion/removal/reinsertion/invalid-identity lifecycle;
accessibility and existing leaf/object/collection/Signal Forms regressions;
Angular build/types and complete zero-finding checkpoint review.

## 7. Checkpoint 5 — Independent Standard projection and shared scenario

1. Add the exact private `recursive-local-presentation` scenario and
   corresponding feature to the neutral catalog.
2. Compose an ordinary object section/tabs/grid, item-root tabs/accordion,
   nested object-template grid, an excluded direct identity property and two
   movable stable items using one authored schema/UI Schema/state.
3. Generalize Standard presentation rendering over ordinary definitions and
   templates with exact static/concrete owner identities and IDs.
4. Keep fixed object/collection/item content outside forests and retain
   collection controls, field bindings, focus recovery and value operations.
5. Preserve Standard-owned state/label cache/reconciliation/cleanup across
   movement, locale, insertion, removal, reinsertion and invalid identity.
6. Share only scenario data/copy/semantic evidence; import no Angular/SPI/Aria
   component, state, DOM helper or CSS.

Gate: catalog authoring, Standard unit/DOM/build/Chromium, Angular native
reference unit/build/Chromium on the same scenario, snippets/boundaries,
semantic parity and complete zero-finding checkpoint review.

## 8. Checkpoint 6 — Angular Aria local-owner conformance

1. Run the existing four rank-`10` registrations over the widened ordinary and
   template container domain without changing their provider/export surface.
2. Preserve Angular Aria tabs and selective native section/accordion/grid
   composition with exact local IDs, static labels, per-item state, claims and
   mounted lifecycle.
3. Prove native and Aria semantic equivalence for ordinary objects, item roots,
   nested object templates, movement, locale, failure and cleanup.
4. Keep the six opt-in CSS properties, stylesheet scoping, peers, dependencies,
   support range and application-owned light/dark values exact.
5. Add Public source/declaration consumer evidence that custom container
   renderers can narrow the widened domain without accessing owner/item state.

Gate: pilot unit/DOM/accessibility/theme/dependency/package smoke, native/Aria
semantic suite, partial compilation, strict types, reference production build
and complete zero-finding checkpoint review. No install, lockfile or network
action is allowed.

## 9. Checkpoint 7 — Packages, consumers and complete conformance evidence

1. Extend declarations/package/source/artifact allowlists only for the exact
   SPEC-009 Public changes and prove no unlisted export, dependency, style or
   target leakage.
2. Compile source/package consumers for unparameterized root compatibility,
   required manual owner forests and widened external Angular renderers.
3. Add a dedicated `scripts/verify-m20-clean-consumers.mjs` lane that packs the
   current workspace to an ignored temporary directory, installs only those
   tarballs plus each already frozen lower/latest-compatible Angular/Aria/CDK
   tuple, and proves native plus pilot declarations, DOM, production build and
   Chromium without reading or writing a registry/release directory.
4. Preserve the immutable published M19 baseline checks and current package
   versions; do not create or relabel a release candidate. Existing M18/M19
   consumer commands remain regression evidence only and cannot satisfy an M20
   row.
5. Run the full workspace, core/base/pilot package, source, security,
   reference-boundary, snippet and both independent browser matrices using the
   frozen installed graph.
6. Map every SPEC-009 row in section 13 to concrete named passing evidence and
   inspect the complete scoped production/test/documentation diff.

Gate: every row has direct evidence; full format/docs/lint/types/tests/builds,
package/source/artifact/consumer/security checks and native/Aria/Standard lanes
pass; complete checkpoint review has zero findings. Registry-backed/latest
queries, publication and external writes are excluded rather than silently
substituted.

## 10. Checkpoint 8 — Final repeated review and handoff

1. Re-run the complete frozen local matrix under Node 22.23.1/pnpm 10.28.2.
2. Audit all Public declarations, raw/normalized/manual contracts, diagnostics,
   keys/IDs, text/state/lifecycle, package boundaries, scenario parity,
   Deferred exclusions and the entire dirty-tree diff.
3. Repeat the whole implementation review after every correction until one
   complete cycle passes all areas and all 27 SPEC rows with zero findings.
4. Mark PLAN-022 and M20 complete only after that pass; compact STATUS, prepend
   WORKLOG and reconcile ROADMAP, Deferred state, indexes and onboarding.

Gate: every prior checkpoint remains green in the combined graph. No failing,
waived, indirectly evidenced, native-only or root-only result completes M20.

## 11. Expected production and dependency diff

Expected scope is limited to:

- core contracts/exports, presentation construction, compiler local UI
  inspection/normalization and shared manual-definition validation;
- base Angular generic presentation context/outlets/hosts/model/text/native
  projection and object/item integration;
- existing Angular Aria implementation only where the widened types require it;
- private scenario catalog and independent Angular/Standard reference
  projections;
- proportional tests, fixtures, package/source/consumer/boundary checks and
  documentation.

Runtime snapshot/method signatures, operations, scopes, validators,
`packages/validator-ajv`, leaf registry, manifests, lockfile, versions, peers,
dependencies, entry points, CSS properties, published artifacts and external
systems do not change. Any unrelated production file or wider Public contract
triggers a stop and contract review.

## 12. Checkpoint review sequence

Each checkpoint produces one review document and may complete only after a full
applicable pass with zero findings:

| Checkpoint | Review | Required full area set                                      |
| ---------- | ------ | ----------------------------------------------------------- |
| 1          | 137    | core raw/generic/compiler/diagnostic/fallback/fixture scope |
| 2          | 138    | manual validation/runtime/operation invariance              |
| 3          | 139    | Angular SPI/context/claims/diagnostics/declarations         |
| 4          | 140    | native owner projection/text/state/lifecycle/accessibility  |
| 5          | 141    | catalog/Standard/native reference parity and isolation      |
| 6          | 142    | Aria/custom renderer/package/style conformance              |
| 7          | 143    | all 27 rows, packages/consumers/full local matrix           |
| 8          | 144    | complete implementation/diff/docs/handoff review            |

Every finding is corrected and restarts that complete checkpoint review. The
final review repeats, rather than merely cites, all applicable prior areas.

## 13. SPEC-009 conformance map

| SPEC row | Checkpoint | Required named evidence                                                        |
| -------- | ---------- | ------------------------------------------------------------------------------ |
| 1        | 1          | admitted object/item/template depths and Public raw contract tests             |
| 2        | 1          | default/order/authored forest matrix for every owner                           |
| 3        | 1          | cross-owner/ancestor/descendant/identity/path rejection table                  |
| 4        | 1          | atomic object/array child plus independent nested-owner assertions             |
| 5        | 1          | every kind and hostile descriptor/sparse/cycle/reuse case per owner            |
| 6        | 1          | exact local reason/parameter/document/data/template path/order/fallback matrix |
| 7        | 1          | unchanged array-host unsupported and leaf/identity-member cases                |
| 8        | 1          | independently valid/invalid root/ancestor/sibling/descendant forests           |
| 9        | 1–2        | deep freeze, exact child identity and exact root/local hostile keys            |
| 10       | 2          | every manual reason/index/owner/preference/non-invocation case                 |
| 11       | 4–5        | static label success/failures over zero/repeated items/locales/replacement     |
| 12       | 4–5        | exact ordinary/item/template IDs across forms and hostile stable IDs           |
| 13       | 4–6        | first-tab/all-collapsed state independently per concrete owner                 |
| 14       | 4–6        | movement retains view/buffers/focus/nested layout state                        |
| 15       | 4–6        | insertion/removal/reinsertion/invalid identity/exact-once destruction          |
| 16       | 4–6        | mounted hidden reconciliation/validation/focus exclusion                       |
| 17       | 4–5        | independent native/Standard roles/names/keyboard/order/grid fallback           |
| 18       | 3, 6–7     | declarations/custom renderer narrowing/no Public owner context                 |
| 19       | 3–6        | provider/native fallback/local tester/no-retry/claim cleanup matrix            |
| 20       | 6–7        | native/Aria equivalence in dedicated frozen lower/latest M20 consumers         |
| 21       | 6–7        | unchanged pilot CSS/package/dependency boundary                                |
| 22       | 5, 7       | Standard direct-core isolation and exact shared scenario input                 |
| 23       | 4–5        | fixed host text/issues/actions/focus recovery outside forests                  |
| 24       | 2, 7       | unchanged runtime/state/scope/operation/validation and M1–M19 regression       |
| 25       | 1–3, 6–7   | declarations, package/source consumers, artifacts and migration examples       |
| 26       | 5–7        | native/Aria/Standard reference unit/build/Chromium lanes                       |
| 27       | 1–8        | zero version/release/registry/GitHub/external mutation                         |

Each row must name concrete files or commands in its checkpoint review.
Semantic parity is asserted independently; pixel equality is not an oracle.
Aria or Standard failure blocks completion.

## 14. Verification matrix

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
pnpm test:consumer:m18:lower
pnpm test:consumer:m18:latest
node scripts/verify-m20-clean-consumers.mjs --mode=lower
node scripts/verify-m20-clean-consumers.mjs --mode=latest
pnpm reference:snippets:check
pnpm reference:test:boundaries
pnpm reference:test:unit
pnpm reference:standard:test:unit
pnpm reference:test:e2e
pnpm reference:standard:test:e2e
git diff --check
```

Before final completion run `CI=true pnpm install --frozen-lockfile --offline
--ignore-scripts`, the complete focused core/base/pilot suites and a scoped
secret/generated-file/license audit. Existing M19 live/registry checks are
historical release evidence, not M20 implementation checks, and are not run or
mutated.

Angular builds and Chromium may run outside the restricted sandbox under the
documented environment constraint. That permission does not authorize network
access, dependency installation outside the exact offline frozen command or an
external write.

## 15. Persistent-state checkpoints

Before each checkpoint, record only that checkpoint under STATUS `In progress`.
After correction and complete zero-finding review, compact STATUS and prepend
one dated WORKLOG entry naming direct evidence. Checkpoint completion authorizes
the next checkpoint inside this approved plan.

Do not mark a checkpoint complete on partial/failed evidence. Commit and push
always require a separate explicit user request.

## 16. Stop conditions

Stop before:

- changing SPEC-009/ADR-025 or an accepted root key/ID/diagnostic/behavior;
- adding runtime/application layout authority, workflow, actions, scopes,
  conditions, persistence, dynamic definitions or an excluded target;
- adding/changing a package, entry point, dependency, peer, version, lockfile,
  style property or support range;
- generating or replacing a release candidate or published-baseline artifact;
- network access, publication, registry/tag/repository/CI/settings mutation;
- destructive action, commit or push; or
- an unresolved authoritative conflict or real verification blocker.

Ordinary implementation findings inside the accepted contract are corrected
and the complete applicable review is repeated without pausing.

## 17. Completion criteria

PLAN-022 completes only when checkpoints 1–8, all 27 SPEC rows, focused and full
tests, declarations, package/source/consumer boundaries, native/Aria/Standard
reference lanes, documentation and one final complete review pass with zero
findings. Completion changes no dependency, version, release, registry,
repository or Stable-support state.
