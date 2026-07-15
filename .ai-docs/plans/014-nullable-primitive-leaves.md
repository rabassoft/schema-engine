# PLAN-014: Nullable primitive leaves

- **Status:** Approved
- **Date:** 2026-07-15
- **Approval date:** 2026-07-15
- **Review revision:** 0
- **Complete review:**
  [`review 035`](../reviews/035-plan-014-review.md) cycle 3 passed all ten areas
  with zero findings after four corrections
- **Implementation authorized:** Yes — checkpoints 1–6 only
- **Implementation state:** Checkpoint 1 completed after
  [`review 036`](../reviews/036-plan-014-checkpoint-1-review.md) cycle 2 passed
  with zero findings; checkpoint 2 is next
- **Requires:** accepted
  [`SPEC-001 v0.1.15`](../specs/001-controlled-form-runtime.md),
  [`SPEC-002 v0.1.2`](../specs/002-nested-object-runtime.md),
  [`SPEC-003 v0.1.2`](../specs/003-collection-runtime.md),
  [`SPEC-004 v0.1.1`](../specs/004-local-reference-resolution.md),
  [`SPEC-005 v0.1.1`](../specs/005-static-presentation-groups.md),
  [`SPEC-006 v0.1.1`](../specs/006-nullable-primitive-leaves.md),
  [`ADR-019 revision 1`](../adrs/019-hojas-primitivas-nullable.md),
  [`ADR-005 revision 4`](../adrs/005-politica-dialecto-json-schema.md),
  [`ADR-007`](../adrs/007-resolucion-renderers-testers.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-010`](../adrs/010-versionado-semver-compatibilidad.md),
  [`ADR-012 revision 1`](../adrs/012-limpieza-explicita-campos.md),
  [`ADR-014 revision 2`](../adrs/014-modelo-objetos-anidados-paths-profundos.md)
  and
  [`ADR-015 revision 4`](../adrs/015-modelo-colecciones-identidad-operaciones.md),
  plus the immutable publication boundary of
  [`ADR-018 revision 3`](../adrs/018-licencia-dual-publicacion-experimental.md)
- **Milestone:** M14 — Nullable primitive leaves
- **Promoted capability:** the exact [`D-009`](../roadmap/deferred-decisions.md)
  slice accepted by review 031

## 1. Goal and authorization boundary

Deliver the Accepted nullable-leaf pipeline end to end:

```text
exact primitive-plus-null type array
  -> descriptor-safe compiler normalization
  -> required immutable nullable capability
  -> strict direct/item-relative null intentions
  -> controlled missing/null/primitive runtime
  -> accessible Angular native projection
```

Only existing primitive leaves are extended. General unions, standalone null,
nullable containers or identity, `enum + null`, coercion, applied defaults,
new operations, new renderer registrations and every other deferred capability
remain inactive.

Ricard formally approved PLAN-014 revision 0 after review 035 cycle 3 passed all
ten areas with zero findings. Approval authorizes only checkpoints 1–6 below.
It does not select a package version, create a release candidate, publish,
promote Stable APIs, commit, push or mutate an external system.

## 2. Reviewed current implementation

The completed M13 repository already provides:

- an iterative descriptor-safe compiler for scalar primitive leaves, nested
  objects, object collections, local references and static presentation;
- required immutable normalized definitions/templates without `nullable`;
- schema-agnostic structural operations plus definition-aware direct and
  collection operation paths;
- a controlled runtime whose existing presence/expectation shapes carry
  `unknown`, including null;
- native Angular 22 string, number/integer, boolean and string-enum renderers
  with Signal Forms buffers, clear actions, deterministic IDs and localized
  text projection;
- repository, package, packed-artifact and clean-consumer verification; and
- immutable public Experimental core and Angular `0.1.0` packages whose live
  bytes must not be overwritten.

The compiler currently rejects every type array; manual primitive definitions
have no required nullable member; definition-aware operations reject null as a
primitive value; and native renderers have no explicit null intention/status.
Implementation must extend these existing paths rather than create a second
compiler, operation family, state owner, renderer registry or form control.

## 3. Public Experimental and Internal inventory

| Classification                   | PLAN-014 effect                                                                                                                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public core signatures   | Required `BaseFieldDefinition.nullable`, transitively every primitive `FieldDefinition` and `FieldTemplate`; two new `FieldTextMember` values.                                                                                              |
| Changed Public Angular signature | Required `AngularFieldTextSnapshot.setNullLabel` and `nullValueLabel`.                                                                                                                                                                      |
| Changed Public behavior          | Compiler accepts only the closed primitive-plus-null array; definition-aware operations/runtime accept explicit null only for nullable leaves; native primitive renderers expose the accepted set-null intention and confirmed-null status. |
| Changed diagnostic semantics     | Existing schema, manual-definition, runtime-option, direct-operation, collection-operation and text-resolution codes gain only the exact SPEC-006 cases.                                                                                    |
| New Public symbols/exports       | None.                                                                                                                                                                                                                                       |
| Internal                         | Descriptor-safe type-array inspection, nullable managed-field metadata/validation, two deterministic IDs and native null projection behavior.                                                                                               |
| Unchanged                        | Operation/presence/snapshot shapes, renderer registrations/testers, outputs, providers, packages, entry points, dependencies, peers, export maps, versions, publication and stability classifications.                                      |

The required contract migrations are intentional source incompatibilities
within Public + Experimental + Active APIs. Repository fixtures, fakes, smoke
tests and consumers must migrate in the same checkpoint that makes each member
required. No optional alias, compatibility shim or duplicate shape is allowed.

ADR-010 requires any future delivery of these changes to use coordinated
independent MINOR releases, never PATCH. This plan neither chooses those
versions nor prepares/publishes them. Published `0.1.0` remains immutable and
represents the pre-M14 boundary.

## 4. Checkpoint 1 — Required contracts and manual definitions

1. Add required `BaseFieldDefinition.nullable` and the two
   `FieldTextMember` values to the existing core contracts without adding a
   root export.
2. Make every scalar primitive compiled through direct, nested, collection-
   template and referenced paths emit own frozen `nullable: false`; do not yet
   accept a type array.
3. Extend the existing iterative manual-definition validation shared by
   runtime creation and form operations with exact direct/template locators for
   `invalid-field-nullable` and `incompatible-field-capabilities`.
4. Preserve the direct `INVALID_FORM_DEFINITION` result for
   `applyFormOperation()` and the exact `INVALID_RUNTIME_OPTIONS` wrapper for
   runtime creation, including first-defect order and validator/operation
   non-invocation.
5. Migrate every repository manual primitive definition/template and existing
   expected compiler output to `nullable: false`. Add `true` only to focused
   manual validation cases and reject `nullable: true` plus non-empty choices.
6. Add focused descriptor, inherited/accessor/non-boolean, locator,
   immutability and non-retention tests for nodes and templates.

Gate: core types/build, compiler, definition, operation and runtime suites pass;
all scalar M1–M13 outputs contain the canonical false member; type arrays and
null operation compatibility remain inactive; root exports, packages,
manifests and lockfile are unchanged.

## 5. Checkpoint 2 — Compiler type-array normalization

1. Extend the existing primitive classification path with the exact
   descriptor-safe two-member inspection from SPEC-006 sections 4.1–4.3.
2. Inspect own length, indices `0` then `1`, safe member values, first extra
   enumerable key and the closed combination catalog without iteration,
   coercion or accessor execution.
3. Normalize valid arrays in either order to the existing primitive kind plus
   own frozen `nullable: true`, copying no source array or descriptor.
4. Reuse `UNSUPPORTED_FIELD_TYPE` with exact fallback, paths, safe parameters,
   precedence, branch stopping and collection/reference provenance.
5. Preserve root/object/array/item-root blocking ownership and collection
   identity's exact `INVALID_COLLECTION_POLICY` result.
6. Classify constraints and UI options by the non-null primitive; preserve
   exact `enum`/`enumLabels`, annotation, default, unknown and independent UI
   behavior.
7. Add serializable direct/nested/template/reference fixtures and programmatic
   sparse, descriptor, accessor, extra-key, hostile-name, Proxy-boundary and
   no-retention cases.

Gate: compiler/conformance suites cover SPEC-006 scenario groups 1–9; all
scalar/non-nullable M1–M13 compiler behavior remains exact and no operation,
runtime or Angular null intention is active yet.

## 6. Checkpoint 3 — Definition-aware operations and runtime

1. Preserve schema-agnostic `applyOperation()` unchanged and structural for
   null.
2. Make `applyFormOperation()` and `requestSetValue()` accept null only for a
   targeted nullable direct/deep leaf; preserve
   `INCOMPATIBLE_OPERATION_VALUE` for non-nullable null.
3. Make `applyFormOperation()` and `requestSetItemValue()` accept null only for
   a nullable template leaf; preserve
   `INCOMPATIBLE_COLLECTION_OPERATION_VALUE` with `reason: 'leaf-type'` for
   non-nullable item-relative null.
4. Retain existing address, managed-path, incompatible-ancestor,
   compatibility, expectation, stale, rebuild and no-effect precedence.
5. Prove set-null, remove-to-missing, `Object.is` null expectations,
   missing-ancestor materialization and external incompatible null without
   coercion or repair.
6. Prove missing/null/false/zero/empty-string distinctions, dirty matrices,
   immutable snapshots/subscriptions and exact original-schema identity at the
   external validator.

Gate: focused direct/deep/collection operation and runtime suites cover
SPEC-006 groups 10–14; no operation or snapshot shape, application ownership,
validation authority, listener behavior or Angular production file changes.

## 7. Checkpoint 4 — Angular native null projection

1. Extend `AngularFieldTextSnapshot` and `AngularTextProjector` with required
   `setNullLabel`/`nullValueLabel`, exact neutral sources/members, resolver order
   and existing failure diagnostics for every field.
2. Extend the Internal field IDs with `-set-null` and `-null-value`; append the
   confirmed-null status between hint/description and issues in
   `aria-describedby`.
3. Add the exact native `Set null` button before the clear action to string,
   number/integer and boolean renderers when nullable and not confirmed null;
   suppress it for incompatible ancestors. Use its deterministic ID and exact
   `aria-labelledby` order of action then field label.
4. On pointer/keyboard activation synchronously focus the bound control before
   emitting exactly one existing `setValue` with null, even if focus fails.
5. Replace the action for confirmed null with the exact visible `span` status,
   deterministic ID, no role and no `aria-live`; place that ID after
   description/hint and before issues in `aria-describedby`. Retain the normal
   clear action and its focus-before-`removeValue` behavior.
6. Reconcile confirmed null to `''` for string/number and `false` for boolean
   without emitting; ordinary edits after null emit the existing primitive
   intention.
7. Preserve string-enum exclusion, built-in/custom tester IDs, ranks,
   priorities, selection, outputs, providers and lifecycle ownership.
8. Migrate every manual Angular text snapshot, fake, package assertion and
   consumer to the two required strings in this checkpoint.

Gate: focused text/native renderer/field-outlet tests cover SPEC-006 groups
15–20; the complete Angular suite passes with exact DOM, accessibility, focus,
locale, controlled Signal Forms and no-emission assertions; no Angular root
export, registration, provider, dependency, peer or manifest changes.

## 8. Checkpoint 5 — Conformance, packages and consumers

Map every row of section 10 to named evidence. Complete core and Angular
package smoke, declaration assertions, repository consumer, packed artifact,
source package and lower/upper Angular 22 clean-consumer coverage.

Prove:

- deep immutability and no retained schema type arrays or consumer results;
- exact original schema identity still reaches `SchemaValidator`;
- direct, nested, template and reference behavior is identical;
- emitted declarations contain only the accepted signature changes;
- root exports, export maps and packed file allowlists add no symbol/path;
- existing native/custom renderer selection is unchanged;
- manifests, dependencies, peers, lockfile and published `0.1.0` bytes are not
  mutated or represented as containing M14; and
- no version, release candidate, registry action, publication or Stable claim
  occurs.

Document the two required source migrations as one coordinated Experimental
change: every manual primitive definition/template adds `nullable`, and every
manual `AngularFieldTextSnapshot` adds both labels. Update current source and
onboarding documentation without selecting a release version or rewriting the
historical `0.1.0` release record.

Gate: all 23 scenario groups have named passing evidence and the full package/
consumer matrix is green. Documentation states that M14 is implemented locally
only if every prior checkpoint is complete, while the live `0.1.0` packages
remain the pre-M14 release.

## 9. Checkpoint 6 — Final repeated implementation review

Inspect the complete M14 authority, production/test diff, declarations,
packages, documentation and deferred boundaries. Correct every finding and
repeat the complete implementation review plus the full verification matrix
until one cycle passes with zero findings.

Only then mark PLAN-014 and M14 implementation complete, compact STATUS to no
active task, prepend the WORKLOG entry and update ROADMAP/deferred state. Do not
select a version, prepare or publish a release, commit or push.

## 10. SPEC-006 evidence matrix

| Scenario group                      | Required evidence                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| 1 exact arrays/order                | direct serializable fixtures for every primitive and both member orders                  |
| 2 propagation                       | direct, deep, collection-template and local-reference definition assertions              |
| 3 scalar false                      | complete existing compiler fixtures plus manual definition migration                     |
| 4 excluded positions                | root/object/array/item-root/identity diagnostics and branch ownership                    |
| 5 malformed arrays                  | length, sparse, descriptor, member, extra-key and invalid-combination tests              |
| 6 paths/provenance/order            | direct/template/reference paths, reference chains, precedence and branch stopping        |
| 7 keywords/UI                       | constraints, annotations, defaults, enum/enumLabels and every existing option class      |
| 8 normalized/manual definitions     | own required boolean, frozen output, exact locators and runtime wrapper                  |
| 9 nullable choices exclusion        | direct and template incompatibility plus non-invocation                                  |
| 10 raw operations                   | unchanged `applyOperation()` accepting structural null                                   |
| 11 definition-aware null operations | distinct direct/deep and item-relative success/failure diagnostic families               |
| 12 strict transitions               | null expectations, stale/no-effect, clear-to-missing and immutable results               |
| 13 ancestor behavior                | missing-ancestor materialization and incompatible-ancestor suppression                   |
| 14 runtime/validation               | external null, dirty matrix, required delegation and validator schema identity           |
| 15 set-null activation              | pointer/keyboard, focus-before-output and exactly one intention                          |
| 16 DOM state distinctions           | missing/null/false/primitive action, status and clear combinations                       |
| 17 accessibility                    | exact button/span, names, described-by order, non-live status and collision-free IDs     |
| 18 Signal Forms                     | null buffers, reconciliation and edit-after-null without synthetic emissions             |
| 19 text projection                  | both members, every failure reason, locale changes and identical resolver order          |
| 20 renderer selection               | unchanged IDs/order/ranks/priorities/testers for native and custom registrations         |
| 21 declarations/packages            | exports, declaration diffs, smoke, tarballs and clean core/Angular consumers             |
| 22 migration/release boundary       | required repository migration, MINOR-not-PATCH classification and no version/publication |
| 23 M1–M13 regression                | complete existing matrix with scalar primitives/non-nullable behavior                    |

Fixture regeneration is intentional and reviewed, never its own oracle.
Programmatic hostile cases remain outside JSON fixtures.

## 11. Expected production diff

Expected existing core production files:

- `packages/core/src/contracts.ts` and `packages/core/src/compiler.ts`;
- `packages/core/src/operations.ts` and `packages/core/src/runtime.ts`;
- existing Internal definition/collection validation and operation helpers;
  and
- at most one cohesive Internal helper for descriptor-safe type-array
  classification if extracting it materially improves reviewability.

Expected existing Angular production files:

- `packages/angular/src/text.ts` and `packages/angular/src/native/common.ts`;
- `packages/angular/src/native/string-renderer.ts`;
- `packages/angular/src/native/number-renderer.ts`; and
- `packages/angular/src/native/boolean-renderer.ts`.

Tests, conformance fixtures, package/consumer assertions, current package
source guidance and project documentation change proportionally. Neither
package root `index.ts`, the string-enum renderer, renderer/provider
registrations, manifests, lockfile, dependencies, peers, export maps or
published artifacts should need a production change. Any such need triggers
the stop conditions rather than silent scope expansion.

## 12. Verification commands and inspections

At applicable checkpoints run focused tests plus:

```text
pnpm format:check
pnpm docs:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
pnpm test:artifacts
pnpm test:source
pnpm test:consumer:clean
```

Before final completion also run `CI=true pnpm install --frozen-lockfile` and
inspect:

- every row of the 23-group evidence matrix and every closed reason/order;
- descriptors, accessors, sparse arrays, hostile names, immutability and
  non-retention;
- direct/template/reference propagation and collection diagnostic separation;
- null/missing/value, strict expectations, controlled ownership and validator
  identity;
- Angular DOM, accessibility, focus, locale, Signal Forms and no-emission
  behavior;
- emitted declarations, root exports, packed contents and source packages;
- repository, exact-version and lower/upper Angular 22 clean consumers;
- manifest/dependency/peer/lockfile/version/publication/deferred-boundary diff
  guards;
- current documentation, Markdown links and `git diff --check`; and
- the complete diff after every correction until a repeated review is clean.

The package/artifact/source checks may create only disposable temporary
tarballs for verification; those are not retained or designated as release
candidates. Do not run release preparation or publish/live mutation commands.
Existing live tests may be used only as read-only evidence that published
`0.1.0` remains unchanged; they cannot prove M14 delivery.

## 13. Checkpoint state and dependency gates

Each checkpoint:

1. updates only the current `In progress` state before implementation;
2. preserves unrelated dirty work;
3. produces the smallest buildable/testable result described by its gate;
4. runs focused and applicable shared verification;
5. records completion and evidence in STATUS/WORKLOG; and
6. does not begin its successor while any required check fails.

A failing or partially evidenced checkpoint is never complete. Corrections
inside an approved checkpoint are applied and the complete applicable review is
repeated without widening its authority.

## 14. Stop conditions

Stop and return to normative review before:

- changing any accepted type-array, normalized/manual definition, diagnostic,
  operation, runtime, Angular, text, ID, accessibility or conformance contract;
- adding a Public symbol, operation, presence/snapshot variant, renderer
  registration, output, provider, package, entry point or export map;
- making `nullable` or either text snapshot member optional, adding a
  compatibility alias, or allowing nullable choices/containers/identity;
- changing application ownership, external validation authority, structural
  sharing, stale/no-effect order or framework neutrality;
- changing a manifest, dependency, peer, lockfile or package compatibility
  range;
- selecting/bumping a version, preparing a release candidate, altering
  published bytes/tags, publishing, promoting Stable, or mutating Git/npm/
  GitHub; or
- activating any capability outside the accepted D-009/M14 slice.

Ordinary implementation findings inside an approved checkpoint are corrected
and reverified. Commit and push remain unauthorized.

## 15. Completion criteria

PLAN-014 completes only when:

1. checkpoints 1–6 and every intermediate gate pass in order;
2. all 23 SPEC-006 scenario groups map to passing named evidence;
3. every diagnostic reason, precedence, path, parameter, fallback, order and
   stop rule is asserted;
4. Public migrations and Internal additions match the exact inventory;
5. controlled runtime, validator, renderer selection and framework boundaries
   remain intact;
6. focused/full tests, declarations, packages, artifacts, source packages and
   consumers pass;
7. manifests, dependencies, peers, lockfile, versions, publication and Stable
   status show no unauthorized drift;
8. final implementation review repeats after every correction until a complete
   pass has zero findings; and
9. persistent project state is reconciled without claiming that published
   `0.1.0` contains M14.

## 16. Plan acceptance criteria

PLAN-014 may be approved only when a complete review confirms:

1. all 23 SPEC-006 groups map to concrete implementation/evidence;
2. the required Public migrations and every Internal change are exact;
3. checkpoint dependency order keeps every intermediate state buildable;
4. compiler grammar, inspection, diagnostics and propagation are complete;
5. manual definitions, operations, runtime and validation preserve exact
   ownership and distinct diagnostic families;
6. Angular texts, IDs, accessibility, focus and Signal Forms behavior are
   closed without renderer-registry drift;
7. M1–M13, declarations, packages, source artifacts and clean consumers have
   explicit regression coverage;
8. version/publication/Stable and every deferred boundary remain closed;
9. completion and stop conditions are objective; and
10. a complete review repeats after every correction until zero findings.

Approval would authorize only checkpoints 1–6 and their stated verification.
It would not pre-approve any correction that changes an Accepted contract,
scope, version or external state.

## 17. Review record

### 17.1 Draft checkpoint

Revision 0 was drafted on 15 July 2026 from Accepted SPEC-006 v0.1.1,
ADR-019 revision 1, ADR-005 revision 4 and the inspected completed M13 core,
Angular, package and consumer paths.

The plan remains Proposed. A complete review must cover all ten acceptance
areas and repeat after every correction until one full cycle passes with zero
findings. Review completion alone will not approve the plan or authorize
implementation; Ricard must make a separate explicit approval decision.

### 17.2 Complete review cycle 3

Review 035 recorded one formatting finding in cycle 1 and three authority,
migration and accessibility precision findings in cycle 2. After correction,
cycle 3 repeated all ten acceptance areas with zero findings and no unresolved
change request or documentation conflict.

At completion of that review checkpoint, PLAN-014 revision 0 remained Proposed
and checkpoint 1 was still unauthorized. The separate formal decision is
recorded below.

### 17.3 Formal approval

Ricard explicitly approved PLAN-014 revision 0 on 15 July 2026 after complete
review cycle 3 passed all ten areas with zero findings. Approval authorizes
only checkpoints 1–6 and their stated verification/stop conditions. Checkpoint
1 is the exact next implementation action; no version, release, publication,
external mutation, commit or push is authorized.

### 17.4 Implementation checkpoint 1

Checkpoint 1 completed on 15 July 2026. It added the required Public
Experimental `nullable` member and two text-member values, emitted canonical
false for every scalar primitive path, validated both new manual capability
defects and migrated repository definitions/fixtures.

Review 036 cycle 1 corrected one false secondary projection defect and removed
unrelated fixture-format churn. Cycle 2 repeated all eight checkpoint areas
with zero findings. Formatting, documentation across 95 Markdown files and 441
local links, lint, typecheck, build, 364 core tests, 76 Angular tests, package
smoke, JSON definition audit and diff checks pass. Type arrays, null operation
compatibility and Angular null projection remain inactive; checkpoint 2 is
next.
