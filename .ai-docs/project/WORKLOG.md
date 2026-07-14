# Schema Engine — Work Log

This document is append-only. New entries must be added at the top.

Read only the newest entry by default. Search older entries by date, milestone,
plan, ADR, or deferred-decision identifier when historical evidence is needed;
the full file is not part of routine task startup.

## 2026-07-14 — M11 promotion-readiness review completed

### Review

- Evaluated D-014 and D-007 restart conditions against accepted Draft 2020-12
  policy, completed M9/M10 models and the current compiler pipeline.
- Confirmed D-014 is ready for a narrow promotion decision, but D-007 cannot be
  promoted wholesale because the required resolution layer does not exist.
- Recommended separating same-document `$defs` + static fragment `$ref`
  resolution into a new identifier, with an Internal resolver and unchanged
  Public `FormDefinition` by default.
- Kept D-014 Research and D-007 Deferred pending Ricard's explicit acceptance,
  correction or rejection; no ADR, SPEC, plan or implementation was activated.

### Verification

- Documentation formatting, 60 Markdown files/267 local links, state
  consistency and `git diff --check` pass.
- No product, manifest, dependency, peer/export, lockfile, publication or
  Stable state changed.

### Next

- Decide review 016 formally. If accepted, register/promote only the narrow
  static local-reference slice and draft ADR-016 before later normative work.

## 2026-07-14 — PLAN-010 checkpoint 7 and M10 completed

### Review and corrections

- Reviewed the complete M10 implementation diff, all 12 SPEC-003 scenario
  areas, declarations, packages, consumers and deferred boundaries against the
  accepted SPECs, ADRs and PLAN-010.
- Cycle 1 found no product or contract defect. It found stale active M10 state
  in SPEC/ADR headers, indexes, ROADMAP, PLAN-010 and delivery registers.
- Corrected only those current-state conflicts, added review 015 and repeated
  the complete review; cycle 2 passed with zero findings.

### Verification

- `CI=true pnpm install --frozen-lockfile`, formatting, lint, typecheck, builds
  and `git diff --check` pass.
- All 248 core and 68 Angular tests pass (316 total).
- Package smoke, built consumer, exact private artifacts and clean core plus
  Angular 22.0.6 lower/upper consumers pass.
- All 59 Markdown files and 263 local links resolve. No manifest, version,
  dependency, peer/export, lockfile, publication or Stable state changed.

### Next

- Review M11 promotion readiness by evaluating D-014 and D-007 together before
  drafting normative or implementation documents.

## 2026-07-14 — PLAN-010 checkpoint 6 completed

### Implementation

- Migrated repository/package README files and private `0.1.0` candidate notes
  to the accepted homogeneous object-collection boundary and exact exclusions.
- Extended core/Angular package smoke, declaration inventory, built consumer
  and clean consumers through collection compilation, stable reads/requests,
  fixed Angular projection and controlled operation application.
- Kept collection/item hosts and text/lifecycle helpers Internal while checking
  the complete accepted Public collection type and Angular method inventory.
- Corrected ordinary `set-value`/`remove-value` definition validation for mixed
  forms containing valid collection nodes; added a focused regression test.

### Review and verification

- Repeated review corrected ambiguous “nested array” documentation and the
  clean-consumer operation narrowing after the mixed-form defect was fixed.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, builds and
  `git diff --check` pass; all 248 core and 68 Angular tests pass (316 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass, including clean
  core plus Angular 22.0.6 lower/upper consumers.
- All 58 Markdown files and 262 local links resolve. No manifest, version,
  dependency, peer/export, lockfile, publication or Stable state changed.

### Next

- Execute PLAN-010 checkpoint 7: complete scenario matrix, declaration and
  full-diff review, correct every finding and repeat until zero findings.

## 2026-07-14 — PLAN-010 checkpoint 5 completed

### Implementation

- Added fixed Internal Angular collection and item hosts with stable-keyed
  views, stable leaf addresses and existing primitive renderer/Signal Form
  buffers; arrays never enter renderer selection.
- Added semantic collection/item legends, localized adjacent remove/move
  controls, exact stable instance IDs and invalid-identity subtree suppression.
- Routed item leaf value/remove/focus/blur intentions through stable addresses
  while preserving absolute routing for non-collection fields.
- Preserved renderer and DOM focus ownership across confirmed movement,
  restored removal focus to next/previous/collection legends and destroyed
  removed or partial descendants deterministically.
- Isolated ordinary collection, identity, issue, item-action and item-issue
  text identities so reprojection retains hosts, renderers and presentation
  buffers; synchronous host failures stop only their own subtree.

### Review and verification

- Focused evidence covers semantic/ID relationships, stable operations,
  controlled rejection, renderer reuse/destruction, all focus fallbacks,
  invalid identity, exact text order/fallback, locale reprojection and both
  collection/item host failure boundaries.
- Review corrected transitive template renderer types, positional number
  diagnostics, independent text-reprojection identities and an unintended new
  tarball artifact caused by a separate Internal helper module.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, builds and
  `git diff --check` pass; all 247 core and 68 Angular tests pass (315 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass, including clean
  core plus Angular 22.0.6 lower/upper consumers. The first clean-consumer run
  failed only because sandbox DNS was blocked; the authorized retry passed.
- No root export, manifest, version, dependency, peer/export, lockfile,
  publication or Stable state changed.

### Next

- Execute PLAN-010 checkpoint 6: root declarations, package smoke,
  documentation, exact artifact allowlists and built/clean consumer migration.

## 2026-07-14 — PLAN-010 checkpoint 4 completed

### Implementation

- Activated recoverable descriptor-safe current/baseline collection identity
  inspection and atomic managed-accessor rejection before validator execution.
- Added immutable array, item and template-instance snapshots, dynamic leaf
  projection, stable and positional reads, identity-based reconciliation and
  complete observable-state structural sharing.
- Activated all five controlled collection intentions, stable focus/blur,
  missing-path start/end insertion, positional validation assignment and
  collection/item/node scopes with visibility and touched reset behavior.
- Kept application state authoritative, numeric paths observation-only, core
  framework-neutral and Angular collection/item hosts inactive until checkpoint 5.

### Review and verification

- Repeated review corrected fixed-order hostile action diagnostics, deep
  recursive snapshot construction, missing-ancestor materialization, vanished
  interaction cleanup, dynamic array scopes, fine-grained sharing, exact
  incompatible blocking paths, dirty ownership and definition/item/template
  accessor order.
- Added focused evidence for all request variants, invalid/recovering identity,
  current-before-baseline diagnostics, positional issue fallbacks, hostile
  descriptors, depth-1,200 item trees, controlled confirmation and immutable
  replacement sharing.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds,
  `git diff --check` and all 58 Markdown files/262 local links pass; all 247
  core and 59 Angular tests pass (306 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass, including clean
  core plus Angular 22.0.6 lower/upper consumers. No manifest, version,
  dependency, peer/export, lockfile, publication or Stable state changed.

### Next

- Execute PLAN-010 checkpoint 5: Internal Angular collection/item/text
  projection, stable views, actions, accessibility, focus/lifecycle/failure
  behavior and focused tests.

## 2026-07-14 — PLAN-010 checkpoint 3 completed

### Implementation

- Widened `FormOperation` to the five accepted stable collection variants and
  added descriptor-safe fixed-order parsing with the exact collection shape,
  managed-path, compatibility and stale diagnostic families.
- Implemented schema-neutral and definition-aware stable-identity application
  for item leaf set/remove plus item insert/remove/move, including complete
  identity scans, stable anchors, expectation semantics and successful
  already-satisfied move no-effects.
- Preserved atomicity, opaque inserted item references, unaffected item/object
  references and off-path descriptors while cloning only the ancestor chain
  and affected array. Start/end insertion alone can materialize a missing
  compatible collection path.
- Kept collection runtime snapshots, requests, validation/interaction and
  Angular collection hosts inactive for their later checkpoints.

### Review and verification

- Added focused hostile-object and immutable-effect tests plus JSON fixtures
  for all five variants; review corrected leaf-value and anchor precedence,
  positional leaf diagnostics, iterator safety and the Angular test narrowing
  required by the now-complete Public operation union.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 207 core and 59 Angular tests pass (266 total).
- `pnpm test:package`, `pnpm test:consumer`, exact-inventory
  `pnpm test:artifacts` and `pnpm test:consumer:clean` pass with clean core and
  Angular 22.0.6 consumers.
- No manifest, version, dependency, peer/export, lockfile, publication or
  Stable state changed.

### Next

- Execute PLAN-010 checkpoint 4: collection external-state identity
  inspection, runtime snapshots/sharing/reads, requests,
  validation/scopes/interaction and runtime fixtures.

## 2026-07-14 — PLAN-010 checkpoint 2 completed

### Implementation

- Added descriptor-safe exterior collection-policy parsing, canonical path
  indexing and exact missing/unused/semantic identity diagnostics without
  retaining or invoking caller objects.
- Extended iterative schema traversal with supported arrays, inline object
  items, identity exclusion, nested object/primitive descendants, cycle safety
  and explicit nested-array stopping.
- Added structural array/item UI traversal, identity-entry rejection, exact
  array/template paths and immutable `ArrayNodeDefinition` plus static item
  template construction; global fields remain non-collection leaves only.
- Activated `ArrayNodeDefinition` only in `FormNodeDefinition`. Existing M9
  operations/runtime still reject collection definitions until their approved
  checkpoints and no Angular collection host was added.

### Review and verification

- Repeated review corrected M9 array fixture migration, matched-policy handling
  for invalid `items`, non-array `items` classification, array/item UI cycles,
  item-root diagnostic ordering and deep/independent array coverage.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, both builds and
  `git diff --check` pass.
- All 189 core and 59 Angular tests pass (248 total), including the new compiler
  conformance fixture and depth-1,200 item template.
- `pnpm test:package`, `pnpm test:consumer`, `pnpm test:artifacts` and
  `pnpm test:consumer:clean` pass with clean core and Angular 22.0.6 consumers.
- No manifest, version, dependency, peer/export, lockfile, publication or
  Stable state changed.

### Next

- Execute PLAN-010 checkpoint 3: implement the five collection operations and
  pure/form helper diagnostics, descriptor behavior and fixtures.

## 2026-07-14 — PLAN-010 checkpoint 1 completed

### Implementation

- Added the accepted framework-neutral collection policy, structural UI,
  template, definition, address, snapshot, operation, scope and text contract
  shapes and their root type exports.
- Added descriptor-safe address copying and tagged canonical collection keys,
  plus iterative manual collection-definition/template validation with exact
  reasons and frozen locators behind a separate Internal entry.
- Migrated the declaration-only Angular object/array text diagnostic branch and
  the exact private tarball allowlist without activating compiler, operation,
  runtime or Angular collection-host behavior.
- Added focused contract, hostile-address and manual-definition tests. Review
  corrected projection-locator coverage, exact item-member defect
  classification, the sparse-array fixture and premature acceptance of
  collection definitions by existing M9 runtime/operation consumers.

### Verification

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, builds and
  `git diff --check` pass.
- All 177 core and 59 Angular tests pass (236 total).
- `pnpm test:package`, `pnpm test:consumer`, `pnpm test:artifacts` and
  `pnpm test:consumer:clean` pass; clean core and Angular 22.0.6 lower/upper
  consumers build from the private local `0.1.0` tarballs.
- The initial clean-consumer attempt failed only because sandbox DNS could not
  reach npm; the authorized network retry passed. No manifest, version,
  dependency, peer/export, lockfile, publication or Stable state changed.

### Next

- Execute PLAN-010 checkpoint 2: collection policies, array/item/structural-UI
  compilation, immutable templates and compiler/manual-definition conformance
  fixtures.

## 2026-07-14 — PLAN-010 revision 0 approved

### Approval

- Ricard formally approved PLAN-010 revision 0 after complete review cycle 1
  passed all nine areas with zero findings and no documentation conflict.
- Approval authorizes exactly checkpoints 1–7 and their verification/stop
  conditions. Checkpoint 1 has not started.
- Primitive/nested arrays, tuples, refs/composition, generated/editable
  identity, factories/defaults, batches/optimism, layout, custom collection
  renderers, persistence, Stable promotion and publication remain unauthorized.

### State synchronization and verification

- Updated SPEC-003, PLAN/review metadata, README, ROADMAP, D-006 and STATUS to
  distinguish approved-but-not-started implementation from completed work.
- `pnpm format:check`, `git diff --check` and documentation links pass; no code,
  package, manifest, dependency, peer, lockfile or publication state changed.

### Next

- Start PLAN-010 checkpoint 1 with Public neutral contracts/exports and shared
  Internal collection address/definition-validation helpers, then verify it
  before checkpoint 2.

## 2026-07-14 — SPEC-003 accepted; PLAN-010 proposed and reviewed

### Acceptance

- Ricard formally accepted SPEC-003 v0.1.2 after complete review cycle 3 passed
  all six areas with zero findings and no documentation conflict.
- Acceptance authorizes preparation/review of PLAN-010 only; implementation,
  Stable promotion and publication remain separate gates.

### PLAN-010

- Drafted PLAN-010 revision 0 with seven ordered checkpoints covering Public
  contracts, compiler, operations, runtime, Angular, packages and final closure.
- Mapped all 12 SPEC-003 conformance scenarios to concrete fixture,
  programmatic, declaration, package and clean-consumer evidence.
- Complete review cycle 1 passed all nine areas with zero findings; the plan
  remains Proposed and implementation is not authorized.
- Corrected one stale ROADMAP sentence that still called completed PLAN-009
  checkpoint 7 pending.

### Verification and next

- `pnpm format:check`, `git diff --check` and documentation links pass; all 58
  Markdown files have 262 valid local link targets.
- Decide formal approval or rejection of PLAN-010 revision 0. Do not start
  checkpoint 1 before explicit approval.

## 2026-07-14 — ADR-015 revision 4 accepted; SPEC-003 cycle 3 passed

### Acceptance and correction

- Ricard formally accepted ADR-015 revision 4 after its complete review passed
  all six areas with zero findings.
- Corrected F-007 in SPEC-003 Draft v0.1.2 by widening only
  `ObjectTextResolutionContext.node` to
  `ObjectFieldDefinition | ArrayNodeDefinition` and closing the exact ordinary
  array-node text/issue behavior.
- Preserved all collection-specific contexts, existing text semantics,
  framework ownership and deferred boundaries.

### Repeated review

- Repeated the complete SPEC-003 review against SPEC-001/SPEC-002, ADR-005
  revision 2, ADR-015 revision 4 and D-006/M10.
- Cycle 3 passed all six areas with zero findings and no documentation
  conflict; F-001 through F-007 are closed.
- `pnpm format:check` and `git diff --check` pass. SPEC-003 remains Draft;
  PLAN-010 and implementation remain unauthorized.

### Next

- Decide formal acceptance or rejection of SPEC-003 Draft v0.1.2. Review
  completion does not accept the SPEC.

## 2026-07-14 — ADR-015 revision 4 proposed and review passed

### Proposal

- Widened only `ObjectTextResolutionContext.node` from
  `ObjectFieldDefinition` to
  `ObjectFieldDefinition | ArrayNodeDefinition` so collection ordinary texts
  and own issues can use the Public `TextResolver` truthfully.
- Named the transitive `TextResolutionContext`/`TextResolver.resolve()` Public
  delta without adding a symbol or changing any text member, source, fallback,
  diagnostic or projection order.
- Kept fixed collection-node projection Internal and preserved revisions 1–3,
  all deferred boundaries and every later authorization gate.

### Review and verification

- Completed all six revision 4 review areas in cycle 1 with zero findings and
  no documentation conflict.
- `pnpm format:check`, `git diff --check` and the documentation link check pass;
  all 56 Markdown files have 249 valid local link targets.
- SPEC-003 remains unchanged at Draft v0.1.1; PLAN-010 and implementation
  remain unauthorized.

### Next

- Decide formal acceptance or rejection of ADR-015 revision 4. A passing review
  does not accept the proposal.

## 2026-07-14 — ADR-015 revision 3 accepted; SPEC-003 cycle 2 found F-007

### Acceptance and corrections

- Ricard formally accepted ADR-015 revision 3 after its zero-finding complete
  review.
- Corrected all six SPEC-003 cycle-1 findings in Draft v0.1.1: exact policy
  identity names, item issue resolution, item leaf/text declarations, stable
  focus/blur, closed collection diagnostics and manual/external runtime safety.
- Preserved every operation discriminant, controlled-state rule, Angular
  ownership boundary and deferred exclusion.

### Repeated review

- Cycle 2 confirmed all six corrections across the complete review matrix.
- Found F-007: collection-node label/description/hint/tooltip and own issues
  cannot be represented by accepted object or collection text contexts.
- Recommended narrow ADR-015 revision 4 widening only
  `ObjectTextResolutionContext.node` to object or array definitions and naming
  the exact transitive Public delta.

### Next

- Decide whether to prepare ADR-015 revision 4. SPEC-003 remains Draft;
  PLAN-010 and implementation remain unauthorized.

## 2026-07-14 — ADR-015 revision 3 proposed and review passed

### Proposal

- Added only the missing item-root `issue` branch to
  `CollectionTextMember`/`CollectionTextResolutionContext`.
- Reused the accepted `issue.fallbackMessage ?? issue.code` source, blank issue
  result semantics and resolver isolation from field/object issue projection.
- Named every transitive Public Experimental change and kept the fixed Angular
  item text projector Internal.

### Review

- Completed all six revision 3 review areas in cycle 1 with zero findings and
  no documentation conflict.
- Confirmed no identity, operation, snapshot, validation assignment, scope,
  Angular ownership, package, stability or deferred boundary changed.
- Revision 3 remains Proposed; review does not constitute formal acceptance.

### Next

- Decide formal acceptance or rejection of ADR-015 revision 3. SPEC-003
  corrections and repeated review remain paused until that decision.

## 2026-07-14 — SPEC-003 complete review cycle 1 found six issues

### Review

- Reviewed the complete Draft against SPEC-001/SPEC-002, ADR-015 revision 2,
  ADR-005 revision 2, the D-006/M10 boundary, declaration-ready contracts and
  authorization gates.
- Recorded six findings: policy identity names were narrowed beyond the ADRs;
  item-root issues lack a legal text context; item leaf/text signatures are not
  declaration-ready; focus/blur lack stable item addressing; collection
  operation diagnostics remain open; and manual-definition/external-tree
  safety is underspecified.
- Confirmed the remaining template/instance, identity, traversal, operation,
  controlled-state, Angular ownership and deferred-boundary areas are aligned.

### Conflict

- ADR-015 revision 2 exposes item-root validator issues but its closed Public
  `CollectionTextResolutionContext` has no `issue` branch. SPEC-003 cannot fix
  this without silently changing an Accepted Public contract.
- Recommended a narrow ADR-015 revision 3 adding only item-root issue text
  resolution and its exact Public inventory delta.

### Next

- Decide whether to prepare ADR-015 revision 3. SPEC-003 corrections and the
  repeated complete review remain paused; PLAN-010 and implementation are
  unauthorized.

## 2026-07-14 — SPEC-003 Draft v0.1.0 prepared

### Result

- Drafted the complete observable M10 contract for homogeneous inline-object
  collections with application-owned stable string identity.
- Consolidated accepted schema/UI/policy, template/instance, path/address,
  snapshot, dirty/interaction, five-operation, validation/scope, text, Angular
  and exact Public Experimental migration decisions.
- Closed proposed policy, invalid-identity, unaddressable-action, operation,
  text and fixed-host diagnostics for subsequent complete review.
- Preserved primitive/nested arrays, tuples, refs/composition,
  defaults/factories, optimistic/batch behavior, layout, publication and Stable
  promotion as inactive.
- Corrected the deferred register's stale next-work pointer from preparing
  already accepted ADR-015 to reviewing SPEC-003.

### Verification

- Documentation formatting, local links and diff checks are recorded in the
  current `STATUS.md` checkpoint.
- No implementation, package, manifest, lockfile or accepted contract changed.

### Next

- Perform a complete SPEC-003 review, apply corrections and repeat the full
  review until one cycle passes with zero findings. Acceptance, PLAN-010 and
  implementation remain separate later gates.

## 2026-07-14 — ADR-005 revision 2 accepted

### Decision

- Ricard accepted ADR-005 revision 2 after cycle 3 passed all nine review areas
  with zero findings.
- Revision 1 remains the implemented M1–M9 authority; accepted revision 2 adds
  only the narrow M10 array/item/identity schema and structural UI design.
- Acceptance authorizes preparing SPEC-003 as a separate task. It does not
  authorize PLAN-010, implementation, packages, Stable promotion or
  publication.

### Next

- Draft SPEC-003 for the complete observable M10 behavior and its exact
  relationship to SPEC-001/SPEC-002, ADR-015 revision 2 and ADR-005 revision 2.

## 2026-07-14 — ADR-005 revision 2 complete review passed

### Review and corrections

- Completed three full review cycles across all nine revision 2 acceptance
  areas.
- Cycle 1 corrected policy branch stopping, incompatible keyword diagnostics
  and exact structural UI shape/cycles/paths/order.
- Cycle 2 restored the accepted `INCOMPATIBLE_SCHEMA_KEYWORD` parameter
  envelope without composite aliases.
- Cycle 3 passed all nine areas with zero findings and no documentation
  conflict.

### State

- ADR-005 revision 1 remains Accepted and authoritative for implemented M1–M9.
- Revision 2 remains Proposed and is ready for formal acceptance or rejection.
- No SPEC, plan, implementation, package, Stable or publication gate changed.

### Next

- Decide formal acceptance of ADR-005 revision 2. Acceptance would authorize
  preparing SPEC-003 as the next separate task only.

## 2026-07-14 — ADR-015 revision 2 accepted

### Resolution

- Added only `ArrayUiSchema`, `ItemUiSchema` and the transitive
  `UiNodeSchema`/UI input migration omitted by revision 1's exact Public
  inventory.
- Confirmed schema-kind-directed interpretation, framework-neutral ownership
  and exclusion of identity, actions, layout, renderer authority and every
  other deferred capability from UI Schema.
- The complete six-area review passed with zero findings and Ricard authorized
  and accepted the narrow revision 2 correction.
- The conflict blocking ADR-005 revision 2 review is resolved; no SPEC, plan,
  implementation or publication is authorized.

### Next

- Resume the complete ADR-005 revision 2 review and repeat it after any
  correction until zero findings.

## 2026-07-14 — ADR-005 revision 2 drafted; UI inventory conflict found

### Result

- Preserved ADR-005 revision 1 as the Accepted authority for implemented
  M1–M9 behavior and added revision 2 only as a Proposed M10 section.
- Defined the narrow supported `type: "array"`/single inline object `items`
  catalog, mandatory direct identity schema, descriptor-safe traversal,
  active-ancestry cycles, template-relative diagnostic paths and deterministic
  order.
- Added minimal structural `ArrayUiSchema`/`ItemUiSchema` metadata without item
  action text, identity editing, cardinality or layout semantics.
- Kept primitive/nested arrays, tuples, all other array keywords, refs,
  composition, defaults/factories, implementation and publication inactive.

### Conflict

- The cross-document check found that accepted ADR-015 revision 1 declares an
  exact Public migration inventory but omits `ArrayUiSchema`, `ItemUiSchema` and
  the `UiNodeSchema` change required by this draft.
- Reviewing or accepting ADR-005 revision 2 as written would therefore create a
  silent Public-contract change contrary to ADR-009 and ADR-015.
- Recommended resolution: prepare a narrowly scoped ADR-015 revision 2 adding
  only the missing UI migration inventory, repeat its complete review and seek
  explicit acceptance before resuming ADR-005 revision 2 review.

### Verification

- Documentation formatting, all 50 Markdown files, 231 local links and diff
  verification pass.
- No SPEC, plan, package, manifest, lockfile or implementation changed.

### Next

- Decide whether to prepare the recommended narrow ADR-015 revision 2. ADR-005
  revision 2 review remains paused until the Public UI inventory conflict is
  resolved.

## 2026-07-14 — ADR-015 revision 1 accepted

### Decision

- Ricard accepted ADR-015 revision 1 after cycle 4 passed all nine review areas
  with zero findings.
- The accepted decision fixes application-owned stable string identity,
  template/instance separation, stable addresses, five item intentions,
  snapshots/scopes and fixed Angular ownership for M10 normative design.
- Acceptance authorizes preparation and review of ADR-005 revision 2 only; it
  does not authorize SPEC-003, PLAN-010, implementation or publication.

### Next

- Prepare ADR-005 revision 2 for the narrow M10 array-schema traversal and
  compatibility policy while preserving accepted revision 1 for implemented
  M9 behavior.

## 2026-07-14 — ADR-015 complete review passed

### Review and corrections

- Completed four full ADR-015 review cycles across all nine acceptance areas.
- Cycle 1 corrected seven findings covering ADR-014 key/DOM compatibility,
  self-contained operations, exact item-leaf variants, missing-array insertion,
  dirty aggregation, Angular accessibility/focus/failure behavior and the
  Public migration inventory.
- Cycle 2 corrected three transitive findings covering static versus dynamic
  leaf projections, item-root lookup typing, opaque inserted-item ownership and
  runtime materialization below missing ancestors.
- Cycle 3 corrected one sequence conflict that prematurely authorized SPEC-003
  before acceptance of ADR-005 revision 2.
- Repeated the complete review after each correction set; cycle 3 exposed the
  final sequence conflict and cycle 4 then passed all nine areas with zero
  findings and no documentation conflict.

### State

- ADR-015 is Proposed revision 1 and ready for formal acceptance or rejection.
- No SPEC, accepted ADR, plan, implementation, package or publication state
  changed.
- Implementation remains blocked by accepted ADR-015, ADR-005 revision 2,
  SPEC-003 and an explicitly approved PLAN-010.

### Verification

- Documentation formatting, all 50 Markdown files and 228 local links, and diff
  checks pass.
- The scoped working tree contains only ADR-015/review/current-state
  documentation.

### Next

- Decide formal acceptance of ADR-015 revision 1. If accepted, prepare ADR-005
  revision 2 next without drafting SPEC-003 or implementing arrays.

## 2026-07-14 — ADR-015 revision 0 proposed

### Result

- Drafted ADR-015 as the first normative M10 decision under the accepted D-006
  boundary, without changing a SPEC, plan, package or implementation.
- Selected a direct required application-owned string property declared by a
  neutral collection policy; identity is non-editable instance metadata rather
  than an index, callback, UI option or runtime-generated value.
- Separated immutable item templates, positional data paths and stable item
  addresses; proposed identity/anchor-based leaf, insert, remove and move
  operations with controlled confirmation and no batches or optimism.
- Defined array/item snapshots, dirty and interaction reconciliation,
  validation/scopes, fixed accessible Angular ownership and the required
  Experimental API migration families.
- Preserved primitive/nested arrays, tuples, refs/composition, defaults,
  advanced layouts, publication and every other deferred boundary.

### Verification

- Documentation formatting, all 49 Markdown files and 226 local links, and diff
  checks pass.
- No code, manifest, lockfile, package, SPEC, accepted ADR or plan changed.

### Next

- Perform a complete ADR-015 review across all nine acceptance areas; apply
  corrections and repeat the full review until it has zero findings before
  deciding acceptance.

## 2026-07-14 — D-006/M10 promotion accepted

### Decision

- Ricard explicitly accepted the zero-finding M10 promotion review.
- D-006 moves from Deferred to Promoted for normative design work under the
  narrow homogeneous inline-object list and application-owned stable string
  identity boundary.
- Acceptance authorizes drafting ADR-015, ADR-005 revision 2 and SPEC-003 in
  order; it does not approve PLAN-010, implementation or publication.

### Next

- Draft ADR-015 for collection templates/instances, identity, paths,
  operations, snapshots/scopes and Angular ownership without changing code.

## 2026-07-14 — D-006/M10 promotion boundary reviewed

### Result

- Confirmed that M9 completion satisfies D-006's resumption condition.
- Passed the promotion review with a narrow recommendation: homogeneous arrays
  of inline object items with mandatory stable string identity owned by the
  application.
- Kept primitive/nested arrays, tuples, positional/runtime-generated identity,
  schema-default insertion, batches, advanced layouts and publication outside
  the proposed M10 boundary.
- Defined the mandatory sequence ADR-015, ADR-005 revision 2, SPEC-003 and
  reviewed/approved PLAN-010 before any implementation.

### State

- D-006 remains Deferred pending Ricard's explicit acceptance of the promotion
  review. No architecture, Public contract, code or package behavior changed.

### Next

- Accept or reject the M10 promotion review. Acceptance authorizes normative
  drafting only, never implementation.

## 2026-07-14 — PLAN-009 checkpoint 7 and M9 completed

### Review and corrections

- Reviewed the complete PLAN-009 implementation against SPEC-001/SPEC-002,
  ADR-005/ADR-014, all 15 conformance scenarios, declarations, packages and
  deferred boundaries through repeated full-review cycles.
- Corrected stale nested-object prohibitions and inactive-M9 statements in
  recovery guidance, ROADMAP and ADR indexes/state summaries.
- Closed evidence gaps for every nested primitive kind, zero-leaf object
  presence/dirty, class-instance ancestors, validation-driven sibling sharing,
  complete lookup behavior and recursive Angular locale/replacement lifecycle.
- The final complete review passed with zero findings; PLAN-009 and M9 are
  completed without activating M10 or publication.

### Verification

- Frozen-lockfile installation, format, lint, typecheck, both builds and
  `git diff --check` pass.
- All 171 core and 59 Angular tests pass (230 total).
- Package smoke, built consumer and exact private artifact inventory pass.
- Clean core plus Angular 22.0.6 lower/upper consumers pass against local
  tarballs.
- Root declarations match the accepted migration; manifests, versions,
  dependencies, peers/exports, lockfile, publication state and Stable
  classification are unchanged.

### Next

- Decide whether to promote D-006/M10 through a separate review. Arrays remain
  Deferred and no implementation task is active.

## 2026-07-14 — PLAN-009 checkpoint 6 completed

### Delivery

- Migrated core package smoke to nested declarations, both node/field lookup
  methods and controlled deep set/remove operations through the package root.
- Migrated the built Angular consumer and clean core/Angular consumers to a
  two-object-depth form, automatic `SchemaFormDirective` projection, localized
  object text, canonical accessible IDs and deep controlled operations.
- Updated root/package READMEs and private `0.1.0` candidate notes to describe
  the accepted SPEC-002 boundary and its Experimental source migration.
- Replaced permissive artifact matching with exact per-package file inventories
  and declaration checks for accepted Public exports, retained Angular
  component metadata and absence of Internal root exports.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 46 Markdown files have valid local link targets.
- All 164 core and 58 Angular tests pass (222 total).
- Package smoke, built consumer and exact private artifact checks pass.
- Clean core plus Angular 22.0.6 lower/upper consumers pass after the expected
  restricted-network failure and authorized npm-connected rerun.
- Manifests, dependency/peer/export policy, versions, lockfile, publication
  state and Stable classification remain unchanged.

### Pending

- Start only PLAN-009 checkpoint 7: rerun the complete matrix, inspect the
  whole implementation diff and declarations, correct every finding and repeat
  review/checks until zero findings.

## 2026-07-14 — PLAN-009 checkpoint 5 completed

### Delivery

- Converted `SchemaFormDirective` from a standalone directive to the accepted
  standalone attribute component while retaining its selector, class, inputs,
  outputs, injection role and root export.
- Added Internal node outlets and fixed semantic object hosts that project the
  last accepted definition/snapshot tree atomically, recurse in normalized
  order and isolate synchronous object-host creation/binding failures.
- Added immutable object text projection, full canonical node IDs and
  accessible fieldset/legend/description/hint/tooltip/issues structure.
- Delegated leaves to the existing renderer lifecycle; incompatible ancestors
  now disable native Signal Forms controls and suppress every native/custom
  intention while missing ancestors remain interactive.

### Tests and consumer migration

- Removed manual leaf loops from repository consumers and migrated existing
  directive/native expectations to automatic projection and canonical IDs.
- Added nested Angular coverage for semantic order, deep controlled operations,
  missing/incompatible branches, custom-output suppression, object text
  diagnostics, hostile/lone-surrogate IDs, simultaneous forms, lifecycle
  isolation and rejected replacement atomicity.
- Locked component metadata and absence of Internal object/node symbols from
  the package root.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 164 core and 58 Angular tests pass (222 total).
- Package smoke and built-consumer checks pass; root exports, manifests,
  dependencies, peer ranges and lockfile are unchanged.

### Pending

- Start only PLAN-009 checkpoint 6 with the complete package declaration/docs,
  release-note, artifact and clean-consumer migration.

## 2026-07-14 — PLAN-009 checkpoint 4 completed

### Delivery

- Replaced flat runtime lookup and snapshot construction with iterative nested
  definition indexes, full canonical paths and one immutable node tree whose
  primitive projection preserves exact leaf identity.
- Added shared manual-definition validation and descriptor-safe managed data
  inspection; accessors fail creation/update before validation while missing
  and incompatible business data retain their accepted presence semantics.
- Implemented deep operations and interaction under missing/incompatible
  ancestors, external focus reconciliation, recursive dirty/valid/touched/
  focused state, nearest-object issue assignment and expanding object scopes.
- Preserved controlled-state behavior, listener isolation, unrelated subtree
  sharing and the inactive Angular projection boundary.

### Tests and fixtures

- Migrated the runtime tests to the recursive definition contract and added
  nested tree/projection, presence, action, accessor, issue, scope, focus and
  structural-sharing coverage.
- Added nested missing-operation, incompatible-action and object-scope JSON
  conformance fixtures plus a 1,000-level finite runtime construction/query.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 164 core and 50 Angular tests pass (214 total).
- Package smoke, built-consumer and exact private artifact allowlist checks
  pass.
- No dependency, manifest, lockfile, publication, deferred boundary or Angular
  projection behavior changed.

### Pending

- Start only PLAN-009 checkpoint 5 with recursive Angular 22 projection and
  consumer migration over the accepted nested runtime.

## 2026-07-14 — PLAN-009 checkpoint 3 completed

### Delivery

- Generalized operation paths to non-empty immutable string-only deep paths and
  retained exact validation ordering for malformed envelopes and expectations.
- Added iterative descriptor-safe ancestor/terminal traversal, missing-branch
  materialization for set, incompatible-ancestor diagnostics and accessor
  rejection without getter execution.
- Added bottom-up root-to-leaf cloning that preserves source prototypes,
  off-path descriptors/references and concurrent compatible branch state;
  removal does not create or prune ancestors.
- Integrated the shared nested-definition validator with first-defect runtime
  behavior plus ordered independent-defect collection for form operations,
  exact leaf membership, object-target rejection and primitive compatibility.

### Tests and fixtures

- Migrated all form-operation fixtures to the recursive definition contract and
  made the JSON harness restore only the tree/projection identity that JSON
  cannot encode.
- Replaced the former deep-path rejection fixture with deep set/remove success
  cases and added nested form, object-target and incompatible-ancestor fixtures.
- Added programmatic coverage for materialization, no pruning, accessors,
  arrays/null/primitives, descriptor/prototype preservation, sharing, invalid
  definitions, safe diagnostics and a 1,500-segment path.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 154 core and 50 Angular tests pass (204 total).
- Package smoke, built consumer and exact private artifact allowlist checks
  pass; manifests, dependencies and lockfile are unchanged.

### Pending

- Start only PLAN-009 checkpoint 4 with nested runtime validation, snapshots,
  actions, scopes and structural sharing. Do not start Angular projection.

## 2026-07-14 — PLAN-009 checkpoint 2 completed

### Delivery

- Replaced the flat-only schema pass with an explicit work-stack traversal for
  recursive inline object schemas, complete deep paths and sibling-local
  required sets.
- Added descriptor-safe structural inspection, ordinary-object enforcement,
  active-ancestry schema/UI cycle diagnostics and sibling identity reuse.
- Added iterative structural UI traversal with recursive text precedence,
  incompatibility diagnostics, local order and normalized object nodes.
- Built the recursive immutable definition and its depth-first primitive leaf
  projection with exact shared leaf references; made deep freezing iterative
  and descriptor-safe.

### Tests and fixtures

- Added valid two-depth and malformed nested compiler conformance fixtures and
  migrated the former object-as-unsupported fixture to the still-deferred array
  type.
- Added focused tests for every current leaf family, nested UI order/text/enum,
  schema and UI cycles, sibling reuse, accessor non-execution, frozen identity
  and a 1,500-level finite schema.
- Preserved the complete flat compiler suite and delayed deep operations,
  nested runtime and Angular recursive projection to checkpoints 3–5.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 141 core and 50 Angular tests pass (191 total).
- Package smoke, built consumer and exact private artifact allowlist checks
  pass; manifests, dependencies and lockfile are unchanged.

### Pending

- Start only PLAN-009 checkpoint 3 with descriptor-safe iterative deep
  structural operations and focused operation fixtures. Do not start nested
  runtime or Angular recursive projection.

## 2026-07-14 — PLAN-009 checkpoint 1 completed

### Delivery

- Added and root-exported the accepted Public core recursive definition/UI,
  object/blocked presence, node snapshot, object text and node lookup contracts.
- Added Internal descriptor-safe path helpers and an iterative nested-definition
  validator for cycles, reused identity, duplicate paths, node invariants and
  exact leaf projection identity without retaining caller containers.
- Added the minimal flat compiler/runtime bridge required by the new surface:
  canonical JSON path keys, identity-linked `nodes`/`fields`, leaf `nodeKind`
  and `getNodeSnapshot()` behavior. Recursive compilation remains checkpoint 2.
- Kept the current flat Angular DOM ID behavior through local names; the
  accepted collision-safe nested ID migration remains checkpoint 5.

### Tests and fixture review

- Added five focused contract/helper tests, including accessor non-execution,
  cycles, reuse, projection mismatch and a 1,500-level iterative tree.
- Migrated only serializable flat compiler/runtime expected fixtures to the new
  contract after focused assertions passed, formatted them and reviewed that no
  input fixture changed.
- Updated core and Angular typed test snapshots plus package smoke coverage for
  identity-linked nodes and `getNodeSnapshot()`.

### Verification

- Format, lint, typecheck, both builds and `git diff --check` pass.
- All 134 core and 50 Angular tests pass (184 total).
- Package smoke, built consumer and private artifact allowlist checks pass.
- The first clean-consumer attempt lacked npm DNS in the restricted sandbox;
  the authorized rerun passed core plus Angular 22.0.6 lower/upper consumers.
- No manifest, dependency, lockfile, publication or Stable API classification
  changed.

### Pending

- Start only PLAN-009 checkpoint 2 with iterative recursive schema compilation
  and focused schema fixtures before structural UI traversal. Do not start deep
  operations, nested runtime or Angular recursive projection.

## 2026-07-14 — PLAN-009 revision 1 approved

### Approval

- Ricard explicitly approved PLAN-009 revision 1 after repeated complete review
  2 passed all 12 delivery areas and nine acceptance criteria with zero
  findings.
- The approval satisfies the final M9 implementation gate and authorizes only
  the seven ordered checkpoints and boundaries recorded by the plan.

### State and boundaries

- No checkpoint started during this approval task; the active implementation
  plan remains None until checkpoint 1 begins.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- Arrays, refs/composition, advanced layout, batches, dynamic definitions,
  custom object containers, publication and Stable promotion remain inactive.

### Pending

- Start only PLAN-009 checkpoint 1 in a separate task: activate M9, add the
  Public core contracts and shared nested-definition/path helpers, and keep the
  focused build/typecheck baseline green.

## 2026-07-14 — PLAN-009 revision 1 passed repeated complete review

### Plan and first review

- Drafted PLAN-009 as the implementation, migration and verification contract
  for the accepted M9 nested-object boundary.
- Complete review 1 found four delivery gaps: rejected Angular input could split
  definition/snapshot projection, not every neutral tree walk prohibited
  unbounded recursion, the directive-to-component metadata migration lacked
  exact declaration evidence, and ID/object-host assertions were incomplete.
- Advanced the proposal to revision 1 with all four corrections; no accepted
  behavior or public symbol changed.

### Repeated review and boundary

- Restarted the complete review against accepted SPEC-001 v0.1.15, SPEC-002
  v0.1.2, ADR-005 revision 1, ADR-014 revision 2, renderer/API ADRs and deferred
  decisions.
- All 12 delivery areas and nine plan acceptance criteria passed with zero
  findings, requested corrections or documentation conflicts.
- PLAN-009 remains Proposed pending Ricard's explicit approval. M9
  implementation, publication, Stable promotion and every external deferred
  capability remain inactive.

### Verification and pending

- Documentation was formatted and checked for links, authority/state
  consistency and whitespace; no product source, declaration, manifest,
  dependency or lockfile changed.
- Explicitly approve PLAN-009 revision 1 or return it for correction. If
  approved, start only checkpoint 1 in a separate task.

## 2026-07-14 — ADR-014 revision 2 and SPEC-002 v0.1.2 accepted

### Acceptance

- Ricard explicitly accepted ADR-014 revision 2 after its complete ten-area
  review passed with zero findings.
- Ricard then explicitly accepted SPEC-002 v0.1.2 after its repeated 16-area
  review passed with zero findings.
- The ordered acceptance makes the clarified nested-object architecture and
  observable M9 extension authoritative.

### Authorization and boundaries

- The M9 normative gate is complete and PLAN-009 may now be prepared.
- No implementation plan is approved and M9 implementation remains inactive.
- Public changes remain Experimental + Active; no package publication, Stable
  promotion, array/ref/composition/layout/batch/dynamic-definition capability
  or other deferred work was activated.
- Unchanged SPEC-001 v0.1.15 behavior and ADR-005 revision 1 remain
  authoritative alongside the accepted M9 extension.

### Verification

- Formatting, all 44 Markdown files and 196 local links, acceptance/state
  consistency and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed; PLAN-009 remains absent and implementation inactive.

### Pending

- Draft PLAN-009 as the exact implementation and verification contract.
- Repeat its complete review after every correction and do not implement M9
  before explicit plan approval.

## 2026-07-14 — SPEC-002 corrections applied; repeated review 2 passed

### Corrections

- Ricard approved all six findings from complete SPEC review 1.
- Proposed ADR-014 revision 2 as a narrow clarification: missing-ancestor
  branches allow set/focus/blur and no-effect remove, while incompatible-ancestor
  branches suppress every mutation and interaction intention.
- Advanced SPEC-002 to Draft v0.1.2 with closed runtime-action diagnostics,
  recursive UI incompatibility diagnostics, object text failure diagnostics,
  the exact `getNodeSnapshot()` signature, cross-field structural sharing and
  native/custom renderer behavior.
- Expanded required conformance coverage from 12 to 15 scenarios.

### Repeated review

- Reviewed all ten ADR-014 areas for proposed revision 2 and all 16 SPEC-002
  areas after correction.
- Both complete reviews passed with zero findings, requested corrections or
  documentation conflicts.
- ADR-014 revision 2 remains Proposed and SPEC-002 remains Draft; neither was
  silently accepted.

### Verification

- Formatting, all 44 Markdown files and 196 local links, authority/state
  consistency and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.

### Boundaries and pending

- SPEC-001 v0.1.15 remains authoritative behavior. PLAN-009 is not drafted and
  M9 implementation remains inactive.
- Arrays, refs/composition, layout, batches, dynamic definitions, custom object
  containers, Stable promotion and publication remain inactive.
- The exact next action is explicit acceptance or rejection of ADR-014 revision
  2, followed—if accepted—by explicit acceptance or rejection of SPEC-002 Draft
  v0.1.2.

## 2026-07-14 — SPEC-002 complete review 1 found six issues

### Review result

- Completed the separate full review of SPEC-002 Draft v0.1.1 against accepted
  SPEC-001 v0.1.15, ADR-014 revision 1, ADR-005 revision 1, applicable renderer,
  Angular/API decisions and deferred boundaries.
- Review 1 does not pass. SPEC-002 remains Draft and cannot be accepted until a
  repeated complete review reaches zero findings.
- Recorded six findings covering blocked runtime-action diagnostics, recursive
  UI incompatibility diagnostics, object text failure diagnostics, the exact
  `getNodeSnapshot()` signature, cross-field validation structural sharing and
  blocked-presence custom-renderer behavior.

### Conflict and boundaries

- Missing-ancestor leaves are explicitly allowed to emit set/focus/blur, while
  the ADR-014/SPEC-002 migration wording can suppress intentions for all blocked
  presence. Because ADR-014 is Accepted, the clarification requires explicit
  approval and a reviewed ADR revision rather than a silent SPEC edit.
- The promoted nested-object boundary otherwise remains coherent. Arrays,
  refs/composition, layout, batches, dynamic definitions, custom object
  containers, Stable promotion and publication remain inactive.
- No product source, public declaration, package manifest, dependency, lockfile
  or accepted behavior changed during the review.

### Verification

- Formatting, all 44 Markdown files and 195 local links, authority/state
  consistency and `git diff --check` pass.
- SPEC-002 remains Draft v0.1.1, PLAN-009 is not drafted and no M9
  implementation task is active.

### Pending

- Ricard must approve, revise or reject the six recommended corrections.
- If approved, clarify ADR-014, advance SPEC-002 to Draft v0.1.2 and repeat the
  full review after correction. Do not draft PLAN-009 or implement M9 yet.

## 2026-07-14 — ADR-014 revision 1 and ADR-005 revision 1 accepted

### Decision

- Ricard followed the zero-finding joint review 3 recommendation and explicitly
  accepted ADR-014 revision 1 and ADR-005 revision 1 coordinately.
- The normalized nested-object/deep-path architecture and recursive inline
  Draft 2020-12 policy are now authoritative M9 design decisions.
- Acceptance provides normative alignment only: it does not accept SPEC-002,
  approve PLAN-009, authorize code changes or activate publication.

### Authority and boundaries

- SPEC-001 v0.1.15 remains the behavioral source of truth and nested objects
  remain unsupported until SPEC-002 passes its separate review and acceptance.
- D-014 now records the accepted narrow tree/projection choice while retaining
  all broader intermediate-model questions as Research.
- Arrays, refs/composition, layout, batches, dynamic definitions and all other
  deferred capabilities remain inactive.

### Verification

- Formatting, all 43 Markdown files and 190 local links, accepted-state and
  authority consistency, and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- SPEC-002 remains Draft; PLAN-009 and M9 implementation remain inactive.

### Pending

- Perform the separate complete review of SPEC-002 Draft v0.1.1 and repeat
  after every correction until zero findings.
- Do not draft PLAN-009 or implement M9 before SPEC-002 is explicitly accepted.

## 2026-07-14 — M9 acceptance sequence corrected; joint review 3 passed

### Correction

- The formal acceptance audit found a circular process sentence: proposed
  ADR-005 tied its authority to SPEC-002, while SPEC-002 requires both ADRs to
  be accepted before its separate review.
- Ricard approved the minimal correction. ADR-005 now coordinates its explicit
  acceptance with ADR-014 and places SPEC-002 review/acceptance afterward.
- No architectural decision, observable behavior, API, deferred boundary or
  implementation authorization changed.

### Repeated review

- Repeated the complete joint review across all ten ADR-014 and eight ADR-005
  acceptance areas after the process correction.
- Review 3 passed with zero findings, requested corrections or documentation
  conflicts.
- ADR-014 revision 1 and ADR-005 revision 1 remain Proposed and are technically
  ready for coordinated explicit acceptance.

### Verification

- Formatting, all 43 Markdown files and 190 local links, active-state and
  acceptance-sequence consistency, and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- Neither ADR, SPEC-002, PLAN-009 nor M9 implementation was activated.

### Boundaries and pending

- SPEC-002 remains Draft v0.1.1; PLAN-009 and M9 implementation remain
  inactive.
- The exact next action is explicit acceptance or rejection of both ADRs,
  followed—if accepted—by the separate complete SPEC-002 review.

## 2026-07-14 — M9 ADR corrections applied; repeated review 2 passed

### Decision and corrections

- Ricard approved all ten corrections from joint review 1, including blocked
  presence for descendant objects and bounded Angular creation/binding failure
  isolation.
- Advanced ADR-014 to revision 1 and SPEC-002 to Draft v0.1.1; corrected only
  the Proposed revision 1 section of ADR-005 and preserved accepted sections
  1–9.
- Closed total DOM identity, on-path descriptors, dirty/focus behavior, the
  Internal Angular host mechanism, exact API migration, nested keyword
  classification, diagnostic contracts, D-014 traceability and terminal-only
  concurrency consequences.

### Repeated review

- The first correction check repaired root-enum classification, directive
  creation wording, transitive API inventory and the reused-node diagnostic
  reason without changing scope.
- Repeated the complete joint review after those repairs.
- Review 2 passed all ten ADR-014 and eight ADR-005 acceptance areas with zero
  findings or requested corrections.

### Boundaries

- ADR-014 revision 1 and ADR-005 revision 1 remain Proposed pending explicit
  acceptance; SPEC-002 remains Draft and M9 implementation remains inactive.
- Arrays, refs/composition, layout, batches, dynamic definitions, publication
  and all unrelated deferred capabilities remain inactive.

### Verification

- Formatting, all 43 Markdown files and 190 local links, active-state
  consistency and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- The final repeated joint review has zero findings; neither ADR was silently
  accepted.

### Pending

- Explicitly accept or reject both ADR proposals.
- If accepted, review SPEC-002 Draft v0.1.1 separately and completely before
  preparing PLAN-009.

## 2026-07-14 — M9 joint ADR formal review 1 completed

### Review result

- Formally reviewed ADR-014 revision 0 and proposed ADR-005 revision 1 against
  their acceptance matrices, SPEC-001/SPEC-002, ADR-007/008/009 and deferred
  boundaries.
- Review 1 does not pass and neither proposal is accepted.
- Recorded ten findings covering DOM identity totality, descriptors, blocked
  dirty, focus reconciliation, Angular isolation, public API inventory, nested
  keyword classification, diagnostics, D-014 traceability and concurrency
  trade-offs.

### Passed boundaries

- The promoted inline-object/current-leaf boundary remains coherent.
- Framework neutrality, controlled state, structural UI grouping and
  terminal-only operation direction remain viable.
- Arrays, refs/composition, layouts, scopes metadata, batches, dynamic
  definitions, custom object renderers, publication and licensing remain
  inactive.

### Verification

- Formatting, all 43 Markdown files and 190 local links, active-state
  consistency and `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- No proposed decision text was changed; all ten review findings remain open.

### Pending

- Ricard must approve or revise the ten recommended corrections.
- After correction, increment ADR-014 to revision 1 and SPEC-002 to Draft
  v0.1.1, then repeat the complete joint review until zero findings.

## 2026-07-14 — D-005 promoted and M9 normative drafts prepared

### Decision

- Ricard explicitly accepted the M9 promotion review.
- D-005 is Promoted for design under the reviewed inline-object/current-leaf
  boundary; M9 implementation remains inactive.
- The acceptance authorizes normative drafting only, not PLAN-009, code changes
  or publication.

### Drafted

- Proposed ADR-014 revision 0 for the normalized node tree, identity-linked
  leaf projection, canonical keys, deep operations, branch state, scopes and
  fixed Angular object hosts.
- Proposed ADR-005 revision 1 while preserving sections 1–9 as the Accepted
  baseline; the proposal adds recursive inline traversal, cycle handling and
  deterministic deep diagnostics.
- Drafted SPEC-002 v0.1.0 as the non-authoritative observable M9 extension to
  SPEC-001.

### Drafting corrections

- Distinguished focus/touched behavior below missing versus incompatible
  ancestors and disabled incompatible Angular branches.
- Required deterministic non-blank object labels, including blank property-name
  fallback.
- Added active-ancestry cycle handling for recursive UI Schema.
- Reused existing definition and accessor diagnostic envelopes instead of
  introducing overlapping codes.
- Rejected managed accessors in external value/baseline trees before validation
  while retaining incompatible data properties as business state.

### Verification

- Formatting, all 42 Markdown files and 187 local links, state consistency and
  `git diff --check` pass.
- No product source, public declaration, package manifest, dependency or
  lockfile changed.
- The cross-document drafting review was repeated after corrections without a
  remaining drafting inconsistency; formal ADR review 1 is still pending.

### Pending

- Formally review ADR-014 revision 0 and ADR-005 revision 1 together, repeat
  after every correction until zero findings, then review SPEC-002.
- Do not draft PLAN-009 or implement M9 before all three normative documents are
  accepted.

## 2026-07-14 — D-005/M9 promotion boundary reviewed

### Completed

- Reviewed full SPEC-001 v0.1.15, ADR-005 and applicable accepted ADRs against
  the root-only compiler, operations, runtime and Angular adapter.
- Confirmed that D-005's resumption condition is satisfied and that nested
  objects are eligible for explicit promotion, but did not promote or activate
  M9.
- Defined the smallest coherent boundary as recursive inline objects with the
  current primitive leaves and string-only deep paths.
- Kept arrays, references/composition, advanced layouts, declarative scopes,
  batches, dynamic definitions, plugins and publication outside M9.
- Identified nine required decision areas and the document sequence ADR-014,
  ADR-005 revision 1, SPEC-002 and PLAN-009.

### Findings

- Implementation is normatively blocked until SPEC-002 is accepted because
  SPEC-001 explicitly excludes nested objects and deep operations.
- ADR-005 requires review when objects are promoted; its recursive inspection
  and diagnostic policy must be resolved before implementation.
- No documentation conflict exists while D-005 remains Candidate and M9 stays
  inactive.

### Verification

- Repeated the complete promotion review after corrections; the final pass has
  zero findings or requested changes.
- Formatting, all 40 Markdown files and 172 local links, state consistency and
  `git diff --check` pass.
- No product source, public API, manifest, dependency, lockfile or accepted
  decision changed.

### Pending

- Ricard must accept or reject the reviewed promotion boundary. Acceptance may
  promote D-005 for design work but will not authorize implementation.

## 2026-07-14 — PLAN-008 and M8 completed

### Completed

- Prepared both packages as private independent `0.1.0` local candidates.
- Moved core from Angular runtime dependencies to peer + dev dependency and
  aligned Angular peers to `>=22.0.6 <23.0.0` without upgrading dependencies.
- Added package-local Experimental/no-distribution READMEs and candidate release
  notes with the exact compatibility matrix.
- Added deterministic tarball allowlist/manifest checks and isolated core,
  Angular lower and Angular upper consumers using strict peers and pnpm 10.28.2.
- Resolved the upper stable Angular endpoint as `22.0.6`, equal to the lower
  endpoint, and verified the aligned tuple in both consumers.
- Completed PLAN-008 revision 2 and M8 without publishing, distributing,
  licensing, changing product source or promoting API stability.

### Corrections and final review

- Added `rxjs@7.8.2` only to the temporary Angular consumers to satisfy
  Angular's own strict peer contract.
- Corrected the consumer's typed parent injector, credential sanitization, pnpm
  assertion and stale root version text.
- Repeated the complete matrix after corrections; the final review has zero
  findings or requested changes.

### Verification

- Frozen install, format, lint, typecheck, 179 tests, builds, package smoke,
  existing consumer, artifact checks and all three clean consumers pass.
- Tarballs contain only package manifest, README and allowed `dist` output;
  transformed manifests contain no `workspace:` specifier.
- Lower/upper evidence is Angular `22.0.6`, resolved 2026-07-14 from public npm
  metadata with aligned Angular packages and no credentials.
- No remote mutation, external tarball distribution, registry configuration,
  license, provenance, tag or GitHub Release occurred.

### Pending

- Review the D-005/M9 nested-object promotion boundary. D-040 remains Deferred
  until publication is explicitly requested.

## 2026-07-14 — PLAN-008 revision 2 approved and M8 started

### Decision

- Ricard explicitly approved PLAN-008 revision 2 after its second repeated
  review passed with zero findings.
- M8 implementation is active only for private local `0.1.0` candidates,
  artifact verification and the clean-consumer matrix.
- Publication, external distribution, license, registry writes, credentials,
  provenance, tags and Stable API promotion remain unauthorized.

### Pending

- Implement PLAN-008 steps 2–6 and close M8 only after the complete matrix and
  final repeated review pass.

## 2026-07-14 — ADR-013 accepted and PLAN-008 revision 2 reviewed

### Completed

- Recorded Ricard's explicit acceptance of ADR-013 revision 1 without changing
  manifests or activating M8.
- Formally reviewed PLAN-008 against accepted ADR-009/010/013, the manifests,
  artifact boundary, clean-consumer matrix, D-034/D-040 and publication safety.
- Corrected public read-only registry access, the exact stable upper Angular
  endpoint, strict isolated peer installation and local no-distribution
  documentation.
- The first repetition found four stale `latest patch` phrases; revision 2
  normalizes them and the second complete repetition passes all eight areas.
- PLAN-008 remains Proposed revision 2; review completion does not approve it or
  activate M8.

### Verification

- Documentation formatting, all 36 Markdown documents and 168 local links,
  state/revision consistency and `git diff --check` pass.
- No manifest, dependency, lockfile, product source, export, version,
  publication setting or API stability state changed.

### Pending

- Ricard must explicitly approve PLAN-008 revision 2 before M8 implementation
  can begin.

## 2026-07-14 — ADR-013 revision 1 passed formal review

### Completed

- Reviewed ADR-013 against SPEC-001, ADR-006/009/010, current manifests,
  D-034/D-040, M8 scope and publication safety.
- Corrected three findings: read-only registry access versus remote mutation,
  the exact stable upper Angular version rule, and the no-license/no-external-
  distribution boundary for local tarballs.
- Repeated all eight areas successfully. ADR-013 remains Proposed revision 1;
  the review does not accept it, approve PLAN-008 or activate M8.

### Verification

- Documentation formatting, all 36 Markdown documents and 168 local links,
  review/state consistency and `git diff --check` pass.
- No manifest, dependency, lockfile, product source, export, version,
  publication setting or API stability state changed.

### Pending

- Ricard must explicitly accept ADR-013 revision 1 before PLAN-008 receives its
  formal review.

## 2026-07-14 — M8 scope reviewed and ADR-013/PLAN-008 drafted

### Completed

- Committed completed PLAN-007/M7 as `d90a834` with Rabassoft authorship.
- Reviewed M8 against SPEC-001, ADR-006/009/010, D-028/D-029 and the real
  package manifests and build outputs.
- Drafted ADR-013 and PLAN-008 revision 0 for private `0.1.0` candidate
  tarballs, exact peer metadata, artifact inspection and clean consumers at the
  Angular 22 lower and latest-in-range endpoints.
- Identified the current core dependency placement and Angular lower peer bound
  as the two manifest conflicts M8 must correct; no manifest was changed.
- Registered actual publication as D-040 so license, registry, access,
  provenance, credentials, tags and automation remain explicitly deferred.
- Corrected stale root README and non-normative SPEC prose that still described
  M7 as pending.

### Review and verification

- The initial eight-area M8 scope review passes without an unresolved drafting
  finding; it does not accept ADR-013, approve PLAN-008 or activate M8.
- Documentation formatting and `git diff --check` pass.
- All 36 Markdown documents and 168 local links resolve.
- Package manifests, dependencies, lockfile, runtime source, exports, versions,
  publication settings and API stability remain unchanged in this planning
  checkpoint.

### Pending

- Formally review ADR-013 revision 0 and repeat after any correction until a
  complete pass has zero findings. PLAN-008 review and approval follow only
  after the ADR is accepted.

## 2026-07-14 — PLAN-007 and M7 completed

### Completed

- Added the Public + Experimental `clear` text member and required Angular
  `clearLabel` with exact non-blank fallback diagnostics.
- Added presence-driven localized clear buttons, deterministic label/action IDs,
  accessible names, and focus-before-remove behavior to all four native
  renderers.
- Pinned outlet outputs to captured field/runtime identities, reconciled
  same-runtime focused detach, and deactivated bindings before destruction so
  stale callbacks cannot target a replacement field or runtime.
- Covered missing, falsy, required, incompatible, enum, numeric-empty,
  controlled confirmation/rejection, pointer/keyboard, focus/touched, locale,
  lifecycle, custom renderer, package, and built-consumer behavior.
- Completed PLAN-007 revision 2 and M7 without promoting APIs to Stable or
  activating another deferred capability.

### Verification

- Frozen installation passed with the lockfile unchanged after network access
  restored the local dependency tree.
- Formatting, lint, typecheck, 129 core tests, 50 Angular tests, both builds,
  package smoke, and the built-package consumer pass.
- Declaration inspection shows only `FieldTextMember: 'clear'` and required
  `AngularFieldTextSnapshot.clearLabel`; entry points and export maps are
  unchanged.
- Core isolation, Angular Signal Forms imports, dependency/package boundaries,
  all 34 Markdown files and 156 local links, and `git diff --check` pass.
- The final full review was repeated after correcting its only lint finding and
  completed with zero findings or requested changes.

### Pending

- Select and review the next post-M7 milestone. M8 remains a proposal and does
  not authorize publication.

## 2026-07-14 — PLAN-007 revision 2 approved and M7 started

### Decision

- Ricard explicitly approved PLAN-007 revision 2 after its corrected second
  review completed with zero findings.
- M7 implementation begins with the neutral and Angular clear-text contracts;
  every other deferred capability remains inactive.
- The persistent delivery workflow now requires complete review repetition
  after every correction until a full pass produces no findings or requested
  changes; only then may work be approved or completed.

### Boundary

- Approval authorizes only PLAN-007's six steps and exact production boundary.
- It does not authorize publication, new dependencies, new entry points, or API
  promotion to Stable.

### Pending

- Implement, test, and verify M7 before marking PLAN-007 or the milestone
  complete.

## 2026-07-14 — PLAN-007 revision 2 passed second review

### Completed

- Repeated the full PLAN-007 review independently, emphasizing outlet lifecycle,
  focus/blur ordering, public declarations, and transition races.
- Found that existing output callbacks resolve the current reactive field path,
  so an old renderer event could target an incoming field during replacement.
- Corrected the plan to capture field path and runtime identity per
  `ComponentRef` and use that identity for all four outputs and focus cleanup.
- Repeated all eight formal areas successfully. PLAN-007 remains Proposed
  revision 2 and M7 implementation remains inactive.

### Verification

- Documentation formatting, local links, revision/approval state,
  contract-consistency and stale-path searches, product-diff scope, and
  `git diff --check` pass.
- No product code, accepted SPEC/ADR, public declaration, package, dependency,
  lockfile, or publication setting changed.

### Pending

- Explicitly approve PLAN-007 revision 2 or return it for correction. Do not
  implement M7 before approval.

## 2026-07-14 — PLAN-007 revision 1 passed formal review

### Completed

- Reviewed PLAN-007 against all eight areas, SPEC-001 v0.1.15, ADR-009/012,
  completed PLAN-004/005/006, current declarations, text projection, outlet,
  native renderers, and controlled runtime boundaries.
- Corrected the complete clear-text diagnostic shape, including its existing
  fallback message.
- Closed the focus-destruction gap with a private same-runtime outlet rule that
  blurs the previously bound focused path before detach while preventing stale
  paths from reaching a replacement runtime.
- Repeated all eight areas successfully. PLAN-007 remains Proposed revision 1;
  review completion does not approve or activate M7 implementation.

### Verification

- Documentation formatting, local links, proposal/review/approval state,
  contract-consistency searches, product-diff scope, and `git diff --check`
  pass.
- No product code, accepted SPEC/ADR, public declaration, package, dependency,
  lockfile, or publication setting changed.

### Pending

- Explicitly approve PLAN-007 revision 1 or return it for correction. Do not
  implement M7 before approval.

## 2026-07-14 — PLAN-007 drafted for M7 review

### Completed

- Drafted PLAN-007 as Proposed against SPEC-001 v0.1.15, ADR-009, ADR-012
  revision 1, and the existing core/Angular contracts.
- Fixed the exact public Experimental text extensions, clear-text diagnostic,
  focus-before-output ordering, deterministic accessible IDs, per-renderer
  behavior, controlled confirmation/rejection, implementation boundary, tests,
  and package/declaration checks.
- Confirmed that M7 reuses the existing `remove-value`, runtime request, Angular
  output, and outlet flow without authorizing a new core or public action
  contract.

### Verification

- Documentation formatting, local links, plan/state consistency, product-diff
  scope, and `git diff --check` pass.
- No product code, accepted SPEC/ADR, package, dependency, lockfile, or
  publication setting changed.

### Pending

- Review PLAN-007's eight formal areas, apply any corrections, repeat the
  checklist, and explicitly approve it before implementation.

## 2026-07-14 — ADR-012 accepted and D-010 promoted to M7

### Decision

- Ricard accepted ADR-012 revision 1 after its three review corrections and
  successful repetition of all eight acceptance criteria.
- D-010 is Promoted and M7 has an accepted architectural boundary for explicit
  native field clearing.
- SPEC-001 advances to Accepted v0.1.15 with normative clear text, controlled
  removal, native renderer, focus, accessibility, diagnostic, API, and M7
  acceptance contracts.
- Acceptance authorizes preparation of PLAN-007, not implementation,
  publication, new core operations, or API promotion to Stable.

### Verification

- Formatting, all Markdown links, accepted/proposed state consistency, version
  consistency, and `git diff --check` pass.
- No product code, executable public contract, package, dependency, or lockfile
  changed.

### Pending

- Draft, review, and approve PLAN-007 before implementing M7.

## 2026-07-14 — ADR-012 revision 1 passed formal review

### Completed

- Reviewed ADR-012 against its eight acceptance criteria and the current
  operation, runtime, renderer, text, focus, declaration, ADR, and SPEC
  boundaries.
- Required and incorporated three precisions: focus is requested before the
  synchronous remove output; deterministic label/action IDs define the
  accessible name; and clear-text diagnostics plus the required snapshot-member
  migration are exact.
- Repeated all eight areas successfully: core reuse, required/validation,
  presence, controlled flow, focus/accessibility, localization, public API, and
  exclusions.
- Kept ADR-012 Proposed revision 1, D-010 Candidate, and M7 inactive pending an
  explicit acceptance decision.

### Verification

- Formatting, all 33 Markdown documents and their 149 local links,
  state-consistency searches, and `git diff --check` pass.
- No code, accepted SPEC/ADR, public contract, package, dependency, or lockfile
  changed.

### Pending

- Explicitly accept or reject ADR-012 revision 1. Acceptance would promote
  D-010/M7 and authorize SPEC synchronization, not implementation.

## 2026-07-14 — ADR-012 proposed for explicit native field clearing

### Completed

- Reviewed D-010 against accepted SPEC-001, ADR-009/011, PLAN-004/005/006, the
  existing `remove-value` operation, runtime action, Angular renderer contract,
  text projection, and all four native renderers.
- Drafted ADR-012 as Proposed with a narrow M7 boundary: reuse `removeValue`,
  preserve controlled confirmation/rejection, distinguish falsy values from
  missing, permit required-field removal, and add an accessible localizable
  native action.
- Kept the core operation/runtime unchanged and limited the proposed public
  contract change to `FieldTextMember: 'clear'` and
  `AngularFieldTextSnapshot.clearLabel`, both Experimental under ADR-009.
- Recorded focus integrity, TextResolver fallback, package/declaration checks,
  and type-specific behavior as mandatory PLAN-007 evidence.

### Verification

- Documentation formatting, local links, status consistency, and
  `git diff --check` pass.
- No code, SPEC, accepted ADR, package, public API, dependency, or lockfile was
  changed.

### Pending

- Review ADR-012's eight acceptance criteria. D-010 remains Candidate and M7
  remains inactive until explicit acceptance.

## 2026-07-14 — G0 passed and SPEC-001 v0.1.14 accepted

### Completed

- Repeated the complete end-to-end review of corrected SPEC-001 v0.1.14 against
  accepted plans, applicable ADRs, public contracts, implementation,
  declarations, deferred boundaries, and executable evidence.
- Confirmed that D-038/D-039 resolve the two unimplemented helper promises
  without promoting them and that `SubscribeResult` matches PLAN-003 and every
  executable public surface.
- Found no new or remaining normative, evidence, implementation, declaration,
  ADR, plan, or deferred-boundary issue.
- Completed G0 and marked SPEC-001 v0.1.14 Accepted without promoting any API to
  Stable or activating a post-G0 milestone.

### Verification

- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed: 14 files and 176 tests (129 core, 47 Angular).
- Both builds, `pnpm test:package`, and `pnpm test:consumer` passed.
- Declaration, package-boundary, framework-boundary, local-link, and diff checks
  passed; no product, package, dependency, or lockfile change was introduced.

### Pending

- Decide whether to promote D-010 as M7 or explicitly select another proposed
  post-G0 milestone before preparing any ADR or implementation plan.

## 2026-07-14 — G0 normative findings resolved in documentation

### Completed

- Applied Ricard's approved disposition of G0-F001 and removed the unimplemented
  `commitScopeToBaseline()` promise from the prototype contract while keeping
  baseline ownership in the application; recorded the future helper as D-038.
- Applied the approved disposition of G0-F002 and documented the implemented
  metadata-only treatment of `default`; recorded explicit default application
  as D-039 without introducing `applySchemaDefaults()`.
- Applied the approved disposition of G0-F003 by aligning SPEC-001 subscriptions
  with PLAN-003 and the executable `SubscribeResult` public contract.
- Advanced SPEC-001 and its index to Draft v0.1.14. No product code, public API,
  dependency, package, lockfile, or deferred implementation changed.

### Verification

- Formatting and `git diff --check` pass.
- All 32 Markdown documents and 143 local links resolve.
- Targeted searches confirm the prototype no longer promises either deferred
  helper and the runtime subscription signature matches `SubscribeResult`.

### Pending

- Repeat the G0 end-to-end acceptance review against corrected SPEC-001 Draft
  v0.1.14 and mark it Accepted only if no finding remains.

## 2026-07-14 — G0 verification passed; acceptance blocked

### Completed

- Repeated the full G0 verification successfully: frozen install, format, lint,
  typecheck, 176 tests, package builds and smoke tests, consumer test,
  declarations, public surfaces, architectural boundaries, links, and diff
  integrity.
- Reviewed SPEC-001 Draft v0.1.13 end to end against accepted plans, public
  contracts, implementation, declarations, and evidence.
- Recorded three blocking normative findings in the G0 evidence document:
  G0-F001 for missing `commitScopeToBaseline()`, G0-F002 for missing
  `applySchemaDefaults()`, and G0-F003 for the `Unsubscribe`/`SubscribeResult`
  conflict.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed with the lockfile unchanged;
  198 packages were reused and none downloaded.
- Formatting, linting, typecheck, 14 test files and 176 tests passed (129 core,
  47 Angular).
- Both package builds, package smoke tests, and the built-package consumer
  passed; declarations and package boundaries remained intact.
- All 32 Markdown documents and 141 local links passed; `git diff --check`
  passed before recording this documentation checkpoint.

### Pending

- Decide and approve the separate disposition of G0-F001, G0-F002, and G0-F003
  before changing SPEC-001 or implementation behavior.
- Repeat G0 after those conflicts are resolved; SPEC-001 remains Draft v0.1.13.

## 2026-07-14 — G0 minimal Angular consumer passed

### Completed

- Added a reproducible `pnpm test:consumer` command that builds both public
  packages before running the consumer integration.
- Added a consumer host that imports only the core and Angular package roots,
  compiles a root schema with all four primitive kinds, renders native controls,
  applies an emitted `set-value`, and confirms the external value.
- Kept the test under the existing Angular package so package self-resolution
  loads `dist` without adding a workspace package, dependency, or lockfile entry.

### Verification

- `pnpm test:consumer` passed: both package builds plus 1 test file and 1 test.
- `pnpm lint` and `pnpm typecheck` passed for the workspace.
- The consumer contains no workspace `src` import and no product source, public
  contract, dependency, lockfile, version, or publication setting changed.

### Pending

- Run the complete frozen-install, format, test, package, declaration, boundary,
  link, and diff verification required by G0.
- Review SPEC-001 end to end before acceptance.

## 2026-07-14 — G0 acceptance evidence matrix completed

### Completed

- Mapped all 22 SPEC-001 walking-skeleton acceptance criteria to direct tests,
  conformance fixtures, implementation boundaries, or package evidence.
- Found no acceptance-criterion evidence gap during the inventory; kept the
  distinction between mapped evidence and a passing G0 execution.
- Added a persistent G0 review document with fail-closed assessments and the
  remaining gate requirements.

### Verification

- Formatting, all 32 Markdown files and their local links, state consistency,
  and `git diff --check` pass for the documentation-only matrix checkpoint.
- No code, public contract, package, dependency, lockfile, publication setting,
  or deferred capability changed.

### Pending

- Implement and run the minimal Angular consumer against built package entry
  points, without workspace `src` imports.
- Repeat full verification and review SPEC-001 end to end before acceptance.

## 2026-07-14 — G0 formal prototype closure approved

### Decision

- Ricard explicitly approved G0 as the active post-M6 review gate.
- G0 is limited to acceptance evidence for the already implemented SPEC-001
  boundary: the 22-criterion matrix, a minimal Angular consumer, full
  verification, and an end-to-end specification review.
- Acceptance is fail-closed: any finding keeps SPEC-001 Draft and becomes
  separate work before the review can be repeated.
- The approval does not change behavior, promote public APIs to Stable, prepare
  publication, activate M7-M12, or promote a deferred decision.

### Verification

- Formatting, all local Markdown links, state consistency, and
  `git diff --check` pass for the approval checkpoint.

### Pending

- Prepare the G0 evidence matrix mapping all 22 SPEC-001 acceptance criteria to
  existing evidence or an explicit gap.

## 2026-07-14 — Post-M6 state and proposed roadmap clarified

### Completed

- Synchronized STATUS with pushed revision `180fe87`, where `develop` and
  `origin/develop` now coincide, without changing executable code.
- Replaced the obsolete M1-only root README description with the implemented
  M1-M6 core, Angular 22, native renderer, package, and deferred boundaries.
- Corrected the present-tense SPEC-001 lifecycle narrative to record M6 as
  completed while preserving Draft v0.1.13 and its historical version entry.
- Added a proposed G0/M7-M12 dependency order to ROADMAP and cross-referenced it
  from the deferred register without approving, activating, or promoting any
  future item.

### Verification

- Formatting, local Markdown links, stale M6/M1/checkpoint references, and
  `git diff --check` pass for the documentation-only checkpoint.
- The prior M6 code verification remains unchanged: 175 tests, builds, package
  smoke, declaration inspection, and architectural boundary checks passed.

### Pending

- Review and explicitly approve whether G0 formal prototype closure becomes the
  next active effort; the roadmap proposal alone authorizes no implementation.

## 2026-07-14 — M6 closure committed

### Completed

- Committed the reviewed PLAN-006 step-6 implementation, zoneless post-render
  correction, full integration/package coverage, and M6 lifecycle closure as
  `feat(angular): complete string enum support`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>` and performed no
  push.
- Synchronized the compact project checkpoint within the same final commit so
  the repository closes M6 with a clean working tree and no active task.

### Verification

- The committed scope is the previously accepted 10-file diff and retains the
  completed frozen-install, formatting, linting, type-checking, 175-test,
  build, package-smoke, declaration, boundary, link, and diff verification.

### Pending

- Select and approve the next milestone separately; no deferred capability is
  active.

## 2026-07-14 — Final M6 diff review passed

### Completed

- Re-reviewed the complete uncommitted PLAN-006 step-6 implementation,
  post-render correction, integration coverage, package smoke changes, and M6
  lifecycle documentation.
- Confirmed that the Angular change affects only controlled presentation-token
  reconciliation after dynamic options render and does not alter core state,
  validation, operations, or deferred scope.
- Found no correctness, accessibility, lifecycle, public-surface, test,
  documentation, or diff-integrity issue requiring correction.

### Verification

- The preceding final acceptance remains current: frozen installation,
  formatting, linting, type checking, 175 tests, builds, package smoke,
  declaration and boundary inspection, 31 Markdown links, and diff checks all
  passed.
- `git diff --check` passes after the review checkpoint update.

### Pending

- Commit the reviewed step-6 and M6 closure diff only when explicitly
  requested; select the next milestone separately.

## 2026-07-14 — PLAN-006 and M6 completed

### Completed

- Executed PLAN-006 step 7 final acceptance after reading the complete approved
  plan and reviewing the uncommitted step-6 correction and coverage diff.
- Confirmed the complete M6 pipeline from direct string `enum` and optional
  `enumLabels` through immutable choices, runtime structural validation,
  resolved choice texts, ranked renderer selection, and the controlled native
  select.
- Inspected generated core and Angular declarations: the expected neutral
  contracts and `SchemaStringEnumRendererComponent` are exported from existing
  roots, while registration and token helpers remain internal.
- Repeated all eight acceptance areas and found no remaining scope, contract,
  diagnostic, structural-safety, control, accessibility, Angular, package, or
  delivery finding.
- Marked PLAN-006 and ROADMAP milestone M6 completed and synchronized the
  promoted D-008 entry without changing SPEC-001 Draft v0.1.13 or ADR-011.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed with all 198 packages reused
  and no lockfile change.
- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 13 files and 175 tests, comprising 129 core and 46
  Angular tests.
- Core declarations expose `StringChoiceDefinition`, `choices`, `enumLabels`,
  and exclusive choice text contexts; Angular declarations expose frozen choice
  labels and the fixed `schema-string-enum-renderer` component metadata.
- Core retains zero runtime dependencies and no framework, RxJS, DOM, or browser
  import; Angular Forms imports remain limited to `@angular/forms/signals`.
- No raw schema reaches a renderer or tester, no enum-membership business
  validation entered operations/runtime actions/Signal Forms/select, and all
  deferred exclusions remain inactive.
- No dependency, lockfile, version, peer range, entry point, export map,
  publication setting, or generated-output tracking changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Review and commit the verified step-6 and M6 closure diff when explicitly
  requested; select the next milestone separately.

## 2026-07-13 — M6 PLAN-006 step 6 completed

### Completed

- Added resolver coverage for ordinary and enum strings plus consumer
  overrides at rank 10, equal rank 20 with registration order, rank 20 with
  positive priority, and rank 21.
- Exercised the select through `SchemaFormDirective`, the field outlet,
  `AngularRendererResolver`, and Angular component creation rather than direct
  construction.
- Covered missing, external out-of-enum, empty, whitespace, first/later choice,
  rejection, external confirmation, locale, focus, blur, issues, and controlled
  no-optimistic-mutation behavior.
- Verified the disabled placeholder sentinel, labels, description, hint,
  tooltip, deterministic IDs, `aria-describedby`, `aria-invalid`,
  `aria-required`, issue live region, and `focusBoundControl()` delegation.
- Verified standard and explicit zoneless TestBed configurations, malformed and
  out-of-range token isolation, component/view destruction, and listener
  cleanup.
- Extended package smoke to require the Public Experimental component export
  while keeping registration and token helpers absent from the package root.
- Corrected initial zoneless selection by moving controlled token reset to an
  Angular post-render write phase, after the dynamic options are present.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 13 files and 175 tests, comprising 129 core and 46
  Angular tests.
- Generated declarations expose the component with selector
  `schema-string-enum-renderer` and do not expose registration or token helpers
  from the Angular root.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- Initial render, reconciliation, rejection, locale, blur, out-of-enum data,
  malformed tokens, and destruction emit no unintended operation.
- No dependency, lockfile, version, peer range, publication setting, raw schema
  renderer input, business validation, or deferred capability changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Execute PLAN-006 step 7 final acceptance, declaration review, and M6
  lifecycle closure.

## 2026-07-13 — M6 PLAN-006 step 5 completed

### Completed

- Added standalone Public Experimental
  `SchemaStringEnumRendererComponent` at the fixed module and selector and
  exported it through the existing Angular root entry point.
- Reused M5's native semantic structure, deterministic IDs, resolved texts,
  issue presentation, focus/blur outputs, accessibility attributes, and
  renderer interface.
- Bound the select to one private string-valued Angular 22 Signal Forms leaf;
  the empty internal token represents missing/out-of-enum and positional
  `choice:<index>` tokens represent exact domain choices, including `""`.
- Reconciled the presentation token from controlled snapshots without emitting
  and emitted only the exact domain string selected by a valid user token.
- Added the descriptor-safe `native-string-enum` registration at rank 20 and
  priority 0 while retaining the generic string rank-10 fallback and the single
  immutable ADR-007 registration sequence.
- Added focused tests for specialization, ordinary-string fallback,
  inherited/accessor safety, the disabled sentinel, token order, empty domain
  strings, and controlled reconciliation.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 13 files and 172 tests, comprising 129 core and 43
  Angular tests.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- The select receives only normalized choices and resolved texts, performs no
  business validation or optimistic mutation, and exposes no token helper from
  the Angular root entry point.
- No dependency, lockfile, package version, peer range, publication setting, or
  deferred capability changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 6 integration, accessibility, resolver,
  controlled-state, zoneless, and package-surface coverage.

## 2026-07-13 — M6 PLAN-006 step 4 completed

### Completed

- Extended `FieldTextMember` with `choice` and made regular, choice, and issue
  resolution contexts structurally exclusive; choice contexts carry the exact
  immutable source choice.
- Added always-present frozen `choiceLabels` to Angular text snapshots and
  projected own data-descriptor choices after ordinary field texts and before
  issues.
- Preserved source labels when choice resolution throws, returns a non-string,
  or returns a blank string, emitting one exact frozen runtime warning per
  failing choice in definition order.
- Preserved the outlet's field/form/locale/issues text identity: unrelated
  snapshot changes do not repeat choice work or diagnostics, while locale
  changes reproject labels without replacing the renderer.
- Added focused public-contract, direct projector, fallback, diagnostic,
  descriptor-safety, ordering, immutability, identity, and locale tests.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 12 files and 169 tests, comprising 129 core and 40
  Angular tests.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- Text projection performs no enum-membership validation, no native select or
  renderer registration entered step 4, and no dependency or package surface
  setting changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 5: add the native select component and its provider
  registration.

## 2026-07-13 — M6 PLAN-006 step 3 completed

### Completed

- Replaced the boolean runtime definition check with a two-pass result that
  first validates the complete historical base shape and only then inspects
  string choices.
- Accepted absent or inherited `choices` and valid caller-owned frozen choices
  without cloning or freezing manual definitions.
- Added descriptor-safe rejection for own choices accessors, non-array and empty
  values, sparse/accessor indices, non-object/array entries, missing/inherited/
  accessor members, non-string or duplicate values, and non-string/blank labels.
- Preserved the existing base-definition diagnostic for every unrelated shape
  failure, including when an earlier field exposes malformed choices.
- Ensured malformed choices produce exactly one frozen
  `INVALID_RUNTIME_OPTIONS` diagnostic with
  `expected: 'valid FormDefinition with string choices'` before invoking the
  external validator.
- Confirmed runtime creation and controlled updates accept missing and
  out-of-enum strings when the external validator allows them.
- Added operation tests proving `applyOperation()` and `applyFormOperation()` do
  not execute or inspect accessor-shaped `choices`; no operation production code
  changed.

### Verification

- Workspace formatting, linting, type checking, builds, and package smoke
  passed.
- The full suite passed: 11 files and 165 tests, comprising 129 core and 36
  Angular tests.
- Focused coverage includes 15 malformed choices shapes, getter suppression,
  base-error precedence, frozen diagnostics, inherited absence, caller
  ownership, validator suppression, and out-of-enum controlled flow.
- Core remains framework-neutral with zero runtime dependencies; Angular Forms
  imports remain limited to Signal Forms.
- No dependency, lockfile, package version, public contract, operation contract,
  deferred capability, or Angular behavior changed.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 4: extend neutral text contracts and Angular choice
  projection with focused tests.

## 2026-07-13 — M6 PLAN-006 step 2 completed

### Completed

- Added `enum` to the supported direct string-field keyword set while retaining
  root `enum`/`const` as unsupported, `format` as ignored, and non-string enums
  as incompatible.
- Added internal `absent`, `valid`, and `schema-blocked` enum states so malformed
  schema branches retain their errors without producing derived UI cascades.
- Implemented descriptor-safe enum inspection for outer values and every array
  index, collecting sparse, accessor, non-string, and repeated-value errors in
  deterministic index order without executing getters.
- Implemented descriptor-safe `enumLabels` parsing, exact compatibility and
  unknown-label diagnostics, and suppression below invalid/missing schema
  candidates.
- Constructed ordered immutable choices with opaque custom labels, exact domain
  strings, and visible JSON-literal fallbacks for blank values.
- Added all 13 PLAN-006 compiler conformance fixtures plus focused tests for
  exact comparison, multiple duplicates, sparse/accessor values, ignored
  branches, input preservation, deep immutability, and deterministic behavior.
- Replaced the historical unsupported-`enum` fixture with `const`, which remains
  unsupported after the accepted enum subset was implemented.

### Verification

- Frozen installation, workspace formatting, linting, type checking, builds,
  and package smoke passed without a dependency or lockfile change.
- The full suite passed: 11 files and 159 tests, comprising 123 core and 36
  Angular tests.
- All 43 compiler fixtures passed, including the 13 new enum fixtures.
- Core contains no Angular, RxJS, DOM, or browser import and still has zero
  runtime dependencies; Angular Forms imports remain Signal Forms-only.
- Searches confirmed that operations, runtime, and Angular do not enforce enum
  membership or inspect choices in step 2.
- All 31 Markdown links resolve and `git diff --check` passes.

### Pending

- Implement PLAN-006 step 3: validate manually supplied choices at runtime
  creation and prove the existing operation boundary does not inspect them.

## 2026-07-13 — Persistent context workflow compacted

### Completed

- Reduced `STATUS.md` to a compact canonical checkpoint containing only the
  current phase, objective, active task, latest outcomes, exact next action,
  blockers, open questions, verification, and task-document map.
- Replaced the historical state duplication in `HANDOFF.md` with a stable
  context-recovery procedure suitable for a fresh Codex task.
- Updated `AGENTS.md` to load the compact status completely and select only the
  task-relevant SPEC, ADR, plan, deferred-decision, and worklog sections.
- Preserved every existing append-only worklog entry and documented targeted
  latest-entry and historical-search reads.
- Kept the current M6 state, SPEC-001 Draft v0.1.13, approved PLAN-006 revision
  1, deferred boundaries, and uncommitted step-1 implementation unchanged.
- Left `ROADMAP.md`, SPECs, ADRs, plan contracts, production code, and package
  configuration unchanged by this documentation-memory repair.

### Verification

- Repository formatting passed.
- Every local link in all 31 Markdown files resolved.
- Searches confirmed that current objective, in-progress state, latest work,
  exact next action, and blockers are owned only by `STATUS.md`.
- `STATUS.md`, `HANDOFF.md`, and `AGENTS.md` now total about 1,700 words, down
  from about 5,600, while the complete append-only history remains available.
- `git diff --check` passed.

### Pending

- Implement PLAN-006 step 2 exactly as recorded in `STATUS.md`.

## 2026-07-13 — M6 PLAN-006 step 1 completed

### Completed

- Marked M6 active under approved PLAN-006 revision 1.
- Added public experimental `StringChoiceDefinition` with readonly `value` and
  `label` members.
- Extended `StringFieldDefinition` with optional readonly `choices` and
  `FieldUiSchema` with optional readonly `enumLabels`.
- Re-exported `StringChoiceDefinition` from the existing core root entry point
  without adding an entry point, export-map change, dependency, or Stable API.
- Added a focused contract test that imports all three extended contracts from
  the public core index and fixes their readonly TypeScript shapes.

### Verification

- Workspace formatting, lint, typecheck, and builds passed, including Angular
  partial compilation.
- The full suite passed: 11 files and 141 tests, comprising 105 core and 36
  Angular tests.
- Package smoke passed for both public root entry points.
- Generated declarations expose `StringChoiceDefinition`, `choices`, and
  `enumLabels` from the expected public modules.
- All 31 local Markdown files resolve their local links and `git diff --check`
  passes.
- No compiler parsing, runtime validation, Angular code, or deferred capability
  entered step 1.

### Pending

- Implement PLAN-006 step 2: enum keyword classification, descriptor-safe enum
  and `enumLabels` parsing, immutable choice construction, conformance fixtures,
  and cascade-suppression tests.

## 2026-07-13 — PLAN-006 revision 1 approved

### Completed

- Recorded the user's explicit approval of PLAN-006 revision 1 after its
  repeated eight-area review passed without a remaining finding.
- Promoted the plan's exact normative contracts for string enums,
  `enumLabels`, immutable choices, manual-definition validation, choice text
  projection, diagnostics, and the native Angular select to SPEC-001 Draft
  v0.1.13.
- Synchronized the plan, SPEC index, architecture README, ROADMAP, STATUS,
  WORKLOG, and HANDOFF while keeping M6 planned but inactive.
- Left production code, package versions, publication settings, API stability,
  and D-010/D-024/D-036/D-037 plus all other deferred decisions unchanged.

### Verification

- Confirmed PLAN-006 is Approved revision 1 and SPEC-001 plus its index and
  HANDOFF consistently report Draft v0.1.13.
- Confirmed M6 remains inactive and the next action starts with PLAN-006 step 1.
- Ran formatting, local Markdown-link validation, active-state searches, and
  `git diff --check`; no code test was required for this documentation-only
  approval task.

### Pending

- Begin M6 by marking the implementation task and milestone active, then add
  the neutral string-choice contracts, UI metadata extension, root exports, and
  focused contract tests from PLAN-006 step 1.

## 2026-07-13 — PLAN-006 revision 1 review corrections completed

### Completed

- Added `schema-blocked` enum state and exact UI cascade behavior, preserving
  independent outer `enumLabels` shape errors without derived compatibility or
  member diagnostics below blocked schema branches.
- Completed the choice `TEXT_RESOLUTION_FAILED` contract with frozen data path,
  absent document path, per-choice ordering, projection identity, and one-time
  diagnostic-batch forwarding.
- Fixed the public renderer selector as `schema-string-enum-renderer`, its exact
  native module path, package export smoke assertion, and Angular TestBed/resolver
  creation boundary.
- Added cascade-specific fixture and focused-test requirements and marked
  PLAN-006 revision 1.
- Repeated all eight formal checklist areas with no remaining finding; kept M6
  inactive and PLAN-006 Proposed pending explicit approval.

### Verification

- Rechecked the corrected plan against current compiler cascade behavior,
  ADR-005/007/008/009/011, PLAN-002/005, Angular text projection, public package
  boundaries, and current Angular 22 select/FormField documentation.
- Confirmed consistent Proposed revision 1 state across PLAN-006, README,
  ROADMAP, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, local Markdown-link validation, state searches, and
  `git diff --check`; no code test was required for documentation-only changes.

### Pending

- Explicitly approve or revise PLAN-006 revision 1. Approval may promote its
  exact contracts to SPEC-001 Draft v0.1.13 before implementation.

## 2026-07-13 — PLAN-006 second formal review completed

### Completed

- Re-reviewed proposed PLAN-006 against compiler cascade behavior, ADR-011,
  Angular public metadata, and current official Angular 22 Signal Forms docs.
- Confirmed that `[formField]` supports native selects with dynamic options and
  that the selected Signal Forms boundary remains viable.
- Found three required corrections: model schema-blocked enum states without
  derived UI cascades; complete choice text diagnostic paths/frequency; and fix
  the public component selector, module, and safe package test boundary.
- Recorded the findings in PLAN-006 without applying their substantive fixes.
- Kept PLAN-006 Proposed revision 0, SPEC-001 Draft v0.1.12, and M6 inactive.

### Verification

- Rechecked all eight plan areas and confirmed that scope, controlled state,
  validation ownership, tokens, ranks, deferred exclusions, dependencies, and
  tooling remain otherwise sound.
- Ran formatting, local Markdown-link validation, state consistency searches,
  and `git diff --check`; no code test was required for the documentation-only
  review.

### Pending

- Apply all three corrections, publish PLAN-006 revision 1, and repeat the
  eight checklist areas before considering approval.

## 2026-07-13 — PLAN-006 proposed and formally reviewed

### Completed

- Reviewed accepted ADR-011 against the implemented compiler, runtime creation,
  operations, Angular text projection, renderer resolver, native Signal Forms
  controls, package surfaces, and test infrastructure.
- Drafted proposed PLAN-006 for string enum normalization, UI labels, runtime
  choice validation, localized choice projection, and a ranked native select.
- Closed UI diagnostic cascades, base-versus-choice runtime diagnostics, safe
  descriptor reads, and the internal missing/choice DOM token protocol.
- Defined the implementation sequence, exact fixtures, public Experimental API
  changes, full verification matrix, and M6 lifecycle.
- Repeated all eight formal checklist areas with no remaining finding; kept
  PLAN-006 Proposed and M6 inactive pending explicit approval.

### Verification

- Checked PLAN-006 against SPEC-001 Draft v0.1.12, ADR-005/007/008/009/011,
  completed PLAN-002/005, current source and tests, and D-010/D-024/D-036/D-037.
- Confirmed that the plan adds no dependency, package, entry point, version,
  publication setting, deferred capability, or implementation change.
- Ran formatting, local Markdown-link validation, active-state searches, and
  `git diff --check`; no code test was required for the documentation-only plan.

### Pending

- Explicitly approve or revise PLAN-006. Only approval may promote its contracts
  to SPEC-001 Draft v0.1.13 and authorize implementation preparation.

## 2026-07-13 — ADR-011 accepted and D-008 promoted

### Completed

- Committed the ADR-011 proposal, formal review, corrections, and repeated
  review on `develop` as `c8728bb` with repository identity
  `Rabassoft <ricard@rabassoft.com>`; no push was performed.
- Accepted ADR-011 revision 1 after all eight review areas passed without
  remaining findings.
- Amended ADR-005 only for the accepted string-enum subset and promoted D-008.
- Split the unpromoted `const` and `format` concerns into deferred D-036 and
  D-037 without changing their behavior.
- Updated SPEC-001 to Draft v0.1.12 as planning state, synchronized its index,
  the ADR index, STATUS, and HANDOFF, and left all implementation unchanged.

### Verification

- Confirmed that ADR-011, ADR-005, D-008, D-036, D-037, SPEC-001, both indexes,
  STATUS, WORKLOG, and HANDOFF report one consistent accepted/planning state.
- Confirmed that SPEC-001 Draft v0.1.12 records ADR-011 as accepted but not yet
  implemented, while `const`, `format`, and other exclusions remain deferred.
- Ran formatting, local Markdown-link validation, and `git diff --check`; no
  code test was required because the acceptance changed documentation only.

### Pending

- Draft and formally review PLAN-006 for ADR-011. Do not implement it until the
  plan is explicitly approved.

## 2026-07-13 — ADR-011 review corrections completed

### Completed

- Preserved mutually exclusive `choice` and `issue` branches in the proposed
  `TextResolutionContext` contract.
- Assigned descriptor-safe validation of compiled enums and manually supplied
  choices to compiler/runtime creation while explicitly preserving PLAN-002's
  minimum `applyFormOperation()` checks.
- Required non-blank choice labels, defined a visible two-quote fallback for the
  empty-string value plus JSON-literal fallbacks for other blank values, and
  isolated blank resolver results with diagnostics and a safe source fallback.
- Repeated all eight ADR-011 acceptance checks with no remaining findings.
- Kept ADR-011 Proposed revision 1 and D-008 Candidate; SPEC-001, ADR-005,
  packages, and implementation remain unchanged.

### Verification

- Rechecked the corrected contracts against current compiler/runtime descriptor
  handling, PLAN-002/003, text diagnostics, renderer ranks, package entry
  points, Draft 2020-12, HTML select behavior, and Angular 22 Signal Forms.
- Confirmed consistent Proposed/Candidate state across ADR-011, the ADR index,
  D-008, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only correction.

### Pending

- Explicitly accept or revise ADR-011 revision 1. Acceptance may update
  ADR-005, D-008, and SPEC planning state but must not implement the increment.

## 2026-07-13 — ADR-011 formal review completed with corrections

### Completed

- Reviewed all eight ADR-011 acceptance areas against Draft 2020-12,
  SPEC-001, ADR-005/007/009, current compiler/runtime/operation contracts,
  Angular text projection, native renderer resolution, Signal Forms select
  support, and D-010.
- Confirmed string-only scope, external validation ownership, controlled-state
  behavior, deterministic renderer specialization, public API classification,
  and deferred exclusions.
- Identified three corrections required before acceptance: preserve mutually
  exclusive text-context members, validate malformed manually supplied choices
  at an explicit safe boundary, and guarantee non-empty accessible option
  labels including the empty-string domain value.
- Kept ADR-011 Proposed and D-008 Candidate; SPEC-001, ADR-005 and all code
  remain unchanged.

### Verification

- Rechecked native `<select>` support against current official Angular 22
  Signal Forms documentation and enum/format semantics against official JSON
  Schema Draft 2020-12 sources.
- Inspected current public type exports, runtime and operation definition-shape
  validation, text diagnostics, renderer ranks, and package entry points.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only review.

### Pending

- Apply the three ADR-011 corrections and repeat all eight acceptance checks
  before considering acceptance, D-008 promotion, or SPEC changes.

## 2026-07-13 — ADR-011 string-enum decision proposed

### Completed

- Recorded explicit approval to split D-008 and drafted ADR-011 as Proposed.
- Limited the proposed first increment to non-empty unique string enums with
  immutable normalized choices and optional UI Schema labels.
- Defined choice text resolution, external validation ownership, controlled
  missing and invalid-value behavior, deterministic renderer ranks, internal
  DOM tokens, and the public native select component boundary.
- Kept `const`, `format`, non-string enums, radios, clearing to missing,
  SPEC-001, ADR-005, packages, and implementation unchanged.
- Added ADR-011 to the global index and linked the active proposal from D-008
  while retaining Proposed/Candidate states.

### Verification

- Checked the proposal against Draft 2020-12, SPEC-001, ADR-005/007/009,
  compiler keyword and diagnostic behavior, public field/text contracts,
  Angular text projection and native renderer ranks, and D-010.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code test
  was required for the documentation-only proposal.

### Pending

- Formally review ADR-011's eight acceptance areas before deciding whether to
  accept it, partially revise ADR-005, promote D-008, or change SPEC-001.

## 2026-07-13 — D-008 architectural boundary reviewed

### Completed

- Reviewed `enum`, `const`, and `format` against JSON Schema Draft 2020-12,
  SPEC-001, ADR-005/007/009, and the implemented compiler-to-renderer boundary.
- Confirmed that `enum` and `const` are data assertions, `format` is an
  annotation by default, and visual renderer selection is an adapter concern
  over normalized `FieldDefinition`.
- Proposed promoting only a minimal `enum` increment while retaining `const`
  and `format` as deferred work pending separate use cases and contracts.
- Recorded the accepted ADR-005 conflict that prevents treating `format` as
  validation or normalized renderer metadata without an explicit revision.

### Verification

- Inspected compiler keyword classification, normalized field contracts, the
  unsupported-`enum` conformance fixture, and native renderer testers.
- Confirmed that the review changed documentation only and activated no
  deferred capability or public contract.
- Ran formatting, Markdown-link validation, and `git diff --check`.

### Pending

- Approve or revise the D-008 split. If approved, draft ADR-011 for the minimal
  `enum` contract before changing SPEC-001 or implementation.

## 2026-07-13 — API and versioning decisions committed

### Completed

- Committed the reviewed documentation block containing accepted ADR-009/010,
  superseded ADR-002, promoted D-028/D-029, and the D-024 boundary review on
  `develop` using `Rabassoft <ricard@rabassoft.com>`.

### Verification

- Confirmed the complete intended documentation diff, formatting, local links,
  diff integrity, branch, and repository identity before commit.
- Package manifests and implementation are unchanged; no push was performed.

### Pending

- Review D-008 as the smallest next product candidate.

## 2026-07-13 — D-024 boundary reviewed

### Completed

- Confirmed that custom renderer registration is already resolved by accepted
  ADR-007/009 and implemented through the public Angular renderer contracts and
  `provideSchemaRenderer()`.
- Compared neutral whole-model `SchemaValidator` with Angular `ValidatorFn` and
  the stable Angular 22 Signal Forms `Validator` contract.
- Deferred a generic validation bridge because the Angular contracts require
  framework control or field context and return error shapes without the core's
  canonical paths and normalized parameters.
- Reordered the nearest candidates to D-008, D-010, and D-005, with D-008 as the
  smallest recommended next decision.

### Verification

- Checked D-024 against SPEC-001, ADR-007/009, current Angular source exports,
  core validation contracts and runtime normalization, and official Angular 22
  validation APIs.
- Ran formatting, Markdown-link validation, and `git diff --check`; no public
  contract, package manifest, or implementation changed.

### Pending

- Review D-008 and separate `enum`, `const`, and `format` data semantics from
  validation ownership and renderer-selection consequences before promotion.

## 2026-07-13 — ADR-010 accepted and D-028 promoted

### Completed

- Recorded explicit acceptance of ADR-010 revision 1 after its repeated
  seven-area review passed without findings.
- Marked pre-SPEC ADR-002 Superseded while preserving its historical decision
  text, and promoted D-028 to ADR-010.
- Synchronized the ADR index, deferred-decisions register, project status, and
  handoff.
- Kept both packages private at `0.0.0`; acceptance did not change dependencies,
  compatibility metadata, publication settings, or implementation.

### Verification

- Confirmed consistent Accepted/Superseded/Promoted states across ADR-010,
  ADR-002, the ADR index, D-028, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; package
  manifests remain unchanged.

### Pending

- Review D-024 to separate the already implemented custom-renderer registration
  boundary from the still-deferred Angular `ValidatorFn` bridge.

## 2026-07-13 — ADR-010 review corrections implemented

### Completed

- Defined the version policy honestly as SemVer for the Public + Stable
  compatibility surface plus an explicit Experimental extension.
- Required `@angular/core` and `@angular/forms` to resolve to the same exact
  version and made aligned tuples part of matrix and consumer verification.
- Replaced the ambiguous complete-MINOR wording with one later published MINOR
  that retains the deprecated contract, plus the independent 180-day minimum.
- Repeated all seven acceptance checks without remaining findings.
- Kept ADR-010 Proposed, ADR-002 pending review, and D-028 Research until an
  explicit acceptance decision.

### Verification

- Rechecked the corrected wording against ADR-009, SemVer 2.0.0, official
  Angular peer and partial-compilation guidance, and current package manifests.
- Ran formatting, Markdown-link validation, and `git diff --check`; no package
  manifest or implementation changed.

### Pending

- Explicitly accept or revise ADR-010. Acceptance may supersede ADR-002 and
  promote D-028 but must not change versions or publication settings.

## 2026-07-13 — ADR-010 formal review completed with corrections

### Completed

- Reviewed all seven ADR-010 acceptance areas against ADR-009, SemVer 2.0.0,
  Angular library peers, partial compilation, and the current package shape.
- Confirmed independent package versioning, `0.1.0` initial releases, bounded
  peer ranges, release classification, and non-publication scope.
- Identified three corrections required before acceptance: explicitly describe
  the Experimental extension to SemVer after `1.0.0`, require Angular core/forms
  to resolve to the same version, and define the later MINOR requirement as one
  published release that retains the deprecated contract.
- Kept ADR-010 Proposed, ADR-002 pending review, and D-028 Research.

### Verification

- Rechecked SemVer's declared-public-API and incompatible-change requirements
  and Angular's peer-dependency and partial-compilation guidance.
- Ran formatting, Markdown-link validation, and `git diff --check`; package
  manifests and implementation remain unchanged.

### Pending

- Approve and implement the three proposed corrections, then repeat the formal
  review before accepting ADR-010.

## 2026-07-13 — ADR-010 package-versioning policy proposed

### Completed

- Reviewed D-028 and the conflicting pre-SPEC ADR-002 against accepted
  ADR-006/009, current package manifests, cross-package imports, and Angular
  partial compilation.
- Drafted proposed ADR-010 with independent product SemVer for core and adapter,
  explicit core and Angular peer ranges, a release compatibility matrix, and
  coordinated-change rules.
- Proposed initial releases at `0.1.0`, initial Angular compatibility
  `>=22.0.6 <23.0.0`, and Stable deprecation for 180 days plus one subsequent
  MINOR before removal in a MAJOR.
- Kept ADR-002 pending review and D-028 Research until explicit acceptance; no
  package manifest or implementation changed.

### Verification

- Checked the proposal against official SemVer, npm, Angular versioning/support,
  Angular compatibility, library peer-dependency, and partial-compilation
  documentation current on 13 July 2026.
- Confirmed consistent Proposed/Research states across ADR-010, the ADR index,
  D-028, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`.

### Pending

- Formally review ADR-010's seven acceptance areas before accepting it,
  superseding ADR-002, or promoting D-028.

## 2026-07-13 — ADR-009 accepted and D-029 promoted

### Completed

- Recorded the explicit acceptance of ADR-009 after its seven-area formal
  review completed without remaining findings.
- Promoted D-029 and synchronized the ADR index, project status, and handoff.
- Kept all intended root exports Public + Experimental + Active; acceptance did
  not authorize publication, version changes, stability promotion, or further
  implementation.

### Verification

- Confirmed consistent Accepted/Promoted states across ADR-009, the ADR index,
  the deferred-decisions register, STATUS, WORKLOG, and HANDOFF.
- Ran formatting, Markdown-link validation, and `git diff --check`; no code or
  package metadata changed.

### Pending

- Review D-028 together with pre-SPEC ADR-002 before deciding package SemVer,
  Angular compatibility, coordination, or the exact deprecation window.

## 2026-07-13 — ADR-009 final formal review completed

### Completed

- Reviewed ADR-009 revision 1 against all seven acceptance areas: package
  entry-point boundary, API inventory, Angular extension surface, unsupported
  imports, orthogonal policy axes, D-028 separation, and acceptance scope.
- Found no remaining issue after the revision 1 corrections.
- Kept ADR-009 Proposed and D-029 Candidate pending the user's explicit
  acceptance decision.

### Verification

- Confirmed that the committed source entry points and built declarations agree
  and that `SCHEMA_RENDERER_REGISTRATIONS` is absent from the public Angular
  entry point.
- Confirmed that ADR-009, the ADR index, and the deferred-decisions register
  retain consistent Proposed/Candidate states.
- Relied on the immediately preceding full verification: formatting, linting,
  type checking, all 140 tests, and both package smoke tests passed.

### Pending

- Explicitly accept ADR-009 and promote D-029, or request another revision. No
  push was performed.

## 2026-07-13 — ADR-009 revision 1 committed

### Completed

- Committed revised proposed ADR-009 and the reviewed Angular public-surface correction on `develop` using `Rabassoft <ricard@rabassoft.com>`.
- Kept ADR-009 Proposed and D-029 Candidate pending the requested final formal review.

### Verification

- Confirmed the complete intended diff, repository identity, branch, formatting, linting, type checking, all 140 tests, package smoke tests, documentation links, and diff integrity before commit.
- The commit leaves `develop` one commit ahead of `origin/develop`; no push was performed.

### Pending

- Perform the final formal review of ADR-009's seven acceptance areas without accepting it automatically.

## 2026-07-13 — ADR-009 formal-review corrections implemented

### Completed

- Reviewed all seven ADR-009 acceptance areas and found three required corrections before acceptance.
- Separated Public/Internal visibility, Experimental/Stable stability, and Active/Deprecated lifecycle; a deprecated Stable API now retains Stable guarantees until removal.
- Made stability promotion explicitly manual and independent of package version, `private`, or publication state.
- Removed `SCHEMA_RENDERER_REGISTRATIONS` from the Angular root entry point while preserving the token for internal provider and resolver implementation.
- Added package smoke coverage preventing accidental public re-export of the raw token.
- Kept ADR-009 Proposed and D-029 Candidate pending one final explicit acceptance review.

### Verification

- `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm test:package` passed.
- All 140 tests pass: 104 core and 36 Angular; package smoke coverage confirms the intended root surface.

### Pending

- Perform the final review of revised ADR-009 and either accept it and promote D-029 or report a remaining concern.

## 2026-07-13 — ADR-009 public API policy proposed

### Completed

- Confirmed that the reviewed M5 commit on `develop` is synchronized with `origin/develop`.
- Audited the root export maps and indexes of `@rabassoft/schema-engine` and `@rabassoft/schema-engine-angular`.
- Drafted proposed ADR-009 to make package entry points the only supported import boundary and classify all current root exports as Experimental.
- Defined public, deprecated, and internal boundaries; change governance; deprecation ordering; consumer-facing enforcement; exclusions; and formal acceptance criteria.
- Kept D-029 Candidate until explicit acceptance and preserved D-028 as the owner of SemVer, package coordination, Angular compatibility, and the exact deprecation window.

### Verification

- Checked the proposal against SPEC-001, ADR-002, ADR-006, the current package manifests and indexes, and D-028/D-029.
- Formatting, diff validation, and local Markdown-link validation passed.

### Pending

- Formally review ADR-009's seven acceptance areas before accepting it or changing public contracts.

## 2026-07-13 — M5 diff reviewed and committed

### Completed

- Reviewed every tracked and untracked M5 change against SPEC-001 v0.1.11, PLAN-005, ADR-007, ADR-008, and the deferred-decisions register.
- Found and fixed a localized negative-number round-trip failure caused by invisible directional literals emitted by `Intl.NumberFormat` for RTL locales.
- Added coverage proving that renderer editing text produced for `ar-EG` parses back to the same confirmed negative value.
- Created the authorized M5 commit on `develop` using `Rabassoft <ricard@rabassoft.com>`.

### Verification

- Formatting, linting, type checking, all 140 tests, builds, package smoke tests, diff checks, documentation links, dependency boundaries, and repository-state checks passed after the review correction.
- The final worktree is clean and the commit contains the complete reviewed M5 increment.

### Pending

- Select and formally scope the next increment. No push was performed.

## 2026-07-13 — M5 native HTML renderers completed

### Completed

- Added Angular 22 native string, number/integer, and boolean renderers backed by private Signal Forms leaf buffers while retaining application-controlled state.
- Added deterministic native registrations with custom override composition, `LOCALE_ID` fallback, neutral replaceable text resolution, accessible semantic markup, and isolated adapter diagnostics.
- Added localized numeric parsing and formatting with incomplete edit preservation, strict integer handling, empty-value removal, locale fallback, and separate grouped display and ungrouped edit forms.
- Completed PLAN-005 and milestone M5 without promoting Signal Forms validation, persistence, advanced schema capabilities, or other deferred work.

### Verification

- Frozen installation, formatting, linting, type checking, builds, package smoke tests, diff checks, documentation-link checks, dependency-boundary checks, and forms-import checks passed.
- All 140 tests pass: 104 core tests and 36 Angular tests across 10 test files.

### Pending

- Review the completed M5 diff and commit it only when explicitly requested.

## 2026-07-13 — PLAN-005 re-reviewed for Angular 22 Signal Forms

### Completed

- Verified from current official Angular 22 documentation that Signal Forms, `form()`, `FormField`, `FieldTree`, and custom-control contracts are stable.
- Rejected using Signal Forms over the application business model because its writable model binding would bypass strict core operations and controlled confirmation.
- Revised PLAN-005 so each native renderer uses one private Signal Form leaf as an ephemeral control buffer, reconciled from confirmed runtime snapshots and reset on blur.
- Added `@angular/forms/signals` dependency boundaries, focus/reset behavior, local-state ownership, D-002/D-024 exclusions, integration tests, acceptance checks, and the single-entry-point peer-dependency trade-off.
- Completed the seven-area formal re-review and left the revised plan Proposed pending explicit approval.

### Verification

- Checked the revised design against SPEC-001, ADR-007/008, PLAN-004, current M4 contracts, and official Angular 22 Signal Forms overview, models, custom controls, `form()`, `FormField`, field state, and JSON-driven forms guidance.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Explicitly approve or revise PLAN-005. After approval, promote its contracts to SPEC-001 v0.1.11 before M5 implementation.

## 2026-07-13 — PLAN-005 proposed

### Completed

- Confirmed that M5 will close the SPEC-001 `LOCALE_ID` fallback and replaceable `TextResolver` requirements instead of deferring them.
- Drafted PLAN-005 for accessible native string, number/integer, and boolean renderers in the private Angular package.
- Defined the pre-release locale and renderer contract revisions, neutral text contracts, native provider composition, deterministic IDs, semantic markup, controlled numeric editing grammar, Intl fallbacks, diagnostics, fixtures, and acceptance boundary.
- Kept Angular Forms, browser-owned validation, clear affordances, validator bridges, theming, enum/format, advanced localization, package publication, and other deferred work outside M5.

### Verification

- Checked the proposal against SPEC-001 v0.1.10, ADR-007, ADR-008, completed PLAN-004, current M4 source contracts, and the applicable deferred entries.
- Confirmed the proposal does not authorize implementation before formal review and SPEC promotion.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Formally review PLAN-005 and approve or revise all six checklist areas before implementing M5.

## 2026-07-13 — M4 committed and M5 planning boundary reviewed

### Completed

- Committed the completed M4 Angular adapter increment on `develop` as `f7199d6` using `Rabassoft <ricard@rabassoft.com>`.
- Began PLAN-005 preparation by checking SPEC-001, ADR-006 through ADR-008, PLAN-004, the current Angular contracts, and the deferred-decisions register.
- Identified that SPEC-001 still requires Angular `LOCALE_ID` fallback and replaceable text resolution, while completed PLAN-004 requires explicit locale input and provides no `TextResolver` projection.

### Verification

- Confirmed commit author, email, subject, branch, and a clean worktree immediately after the M4 commit.
- Confirmed `develop` is five commits ahead of `origin/develop`; no push was performed.

### Pending

- Decide whether PLAN-005 absorbs `LOCALE_ID` fallback and `TextResolver` projection or SPEC-001 defers them before drafting a decision-complete M5 plan.

## 2026-07-13 — M4 Angular adapter completed

### Completed

- Added the private `@rabassoft/schema-engine-angular` package on Angular 22.0.6 with partial `ngc` compilation and no Angular dependency in core.
- Implemented the standalone controlled-form and field-outlet directives, Signals snapshot projection, controlled intent forwarding, transactional runtime replacement, and deterministic renderer resolution.
- Implemented ADR-008 renderer creation through `ViewContainerRef.createComponent()` with an explicit environment injector and creation-time signal bindings.
- Added lifecycle-safe renderer replacement, including preservation of the active renderer when a proposed parent runtime replacement is rejected.
- Completed PLAN-004 and milestone M4 without native HTML controls, Angular Forms, RxJS bridging, Zone.js coupling, persistence, or deferred capabilities.

### Verification

- `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:package` passed.
- All 119 tests pass: 104 core tests and 15 Angular resolver/directive tests, including explicit zoneless coverage.
- Angular package smoke coverage verifies root exports and resolver construction; `git diff --check` and local Markdown-link validation passed.

### Pending

- Draft and formally review PLAN-005 for M5 native HTML renderers before implementation.

## 2026-07-13 — ADR-008 committed and PLAN-004 approved

### Completed

- Committed ADR-008 and the D-027 resolution as `bae261f`.
- Drafted PLAN-004 for a private Angular 22 headless adapter package.
- Formally reviewed and approved Signals projection, transactional runtime recreation, provider-based renderer registrations, deterministic resolution, the common renderer contract, and the ViewContainerRef outlet lifecycle.
- Kept native HTML renderers in M5 and excluded RxJS, Zone.js coupling, Angular Forms, persistence, lazy rendering, and deferred capabilities.

### Verification

- Checked PLAN-004 against SPEC-001 v0.1.9, ADR-006/007/008, completed PLAN-003, D-013, D-024, D-026, D-028, and D-029.
- Verified Angular 22 is actively supported and compatible with the workspace TypeScript 6.0 baseline.
- Ran formatting, diff, and local Markdown-link validation.

### Pending

- Promote PLAN-004's approved public contracts and diagnostics to SPEC-001.
- Implement and verify M4 only after that promotion.

## 2026-07-13 — ADR-008 committed

### Completed

- Committed ADR-008, D-027 promotion, SPEC-001 v0.1.9, and persistent-state updates on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Formatting, diff, and local Markdown-link validation passed before commit.

### Pending

- Prepare and formally review PLAN-004 before implementing M4.

## 2026-07-13 — Reviewed M3 committed and D-027 resolved

### Completed

- Committed reviewed M3, its accessor-safety correction, and ADR-007 as `805308d`.
- Reviewed current official Angular APIs for dynamic inline components.
- Accepted ADR-008 selecting `ViewContainerRef.createComponent()` with creation-time input/output bindings and an explicit `EnvironmentInjector`.
- Promoted D-027 without implementing Angular or renderers.
- Updated SPEC-001 to Draft v0.1.9 and cleared the immediate architectural prerequisites for PLAN-004.

### Verification

- Confirmed the M3 commit attribution is `Rabassoft <ricard@rabassoft.com>`.
- Checked ADR-008 against ADR-007, Angular's programmatic rendering guide, and the current Angular API references.
- Formatting, diff, and local Markdown-link validation passed.

### Pending

- Draft and formally approve PLAN-004 before implementing M4.

## 2026-07-13 — Reviewed M3 and ADR-007 committed

### Completed

- Committed the reviewed M3 implementation, accessor-safety correction, fixtures, tests, SPEC updates, and ADR-007 resolution on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Confirmed the complete 104-test acceptance suite passed before commit.
- Checked staged diff integrity and commit attribution.

### Pending

- Resolve D-027 through a dedicated architectural decision.
- Prepare PLAN-004 only after Angular instantiation is closed.

## 2026-07-13 — M3 reviewed and D-023 resolved

### Completed

- Reviewed the full uncommitted M3 diff against PLAN-003 and SPEC-001.
- Fixed a runtime robustness defect that could execute accessors in validator results, definitions, paths, scopes, or diagnostic parameters.
- Added regression coverage proving malformed accessor-shaped contracts return diagnostics without invoking getters.
- Accepted ADR-007 for deterministic scored renderer testers owned by framework adapters.
- Marked ADR-004 superseded and promoted D-023 without implementing renderers or Angular.
- Updated SPEC-001 to Draft v0.1.8 and reconciled its immediate-decision register.

### Verification

- Formatting, lint, type checking, tests, build, package smoke, diff, and local Markdown links passed.
- Confirmed renderer selection consumes normalized `FieldDefinition` and adds no framework dependency to the core.

### Pending

- Resolve D-027 for Angular dynamic renderer instantiation.
- Prepare and approve PLAN-004 before implementing M4.

## 2026-07-13 — M3 controlled runtime completed

### Completed

- Implemented discriminated controlled-runtime creation with source-schema validation access.
- Added immutable snapshots, dirty derivation, synchronous normalized validation, atomic external updates, and structural sharing.
- Added non-optimistic operation requests with sequential IDs and separate synchronous subscriptions.
- Added focus, blur, touched, validation visibility, scopes, listener isolation, idempotent unsubscribe, and disposal.
- Added 10 runtime conformance fixtures, focused unit tests, and package smoke coverage.
- Completed PLAN-003 and milestone M3 without adding Angular, renderers, persistence, async validation, or deferred capabilities.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed with 103 tests in 6 files.
- `pnpm build` and `pnpm test:package` passed.
- `git diff --check` and local Markdown-link validation passed.

### Pending

- Review and commit the completed M3 diff only when explicitly requested.
- Resolve D-023 and prepare the M4 Angular adapter plan before implementation.

## 2026-07-13 — PLAN-003 reviewed and approved

### Completed

- Formally reviewed PLAN-003 and closed exact diagnostic parameters, reasons, ordering, and fallback-message policy.
- Approved source-schema access, discriminated creation/subscription results, and listener-exception isolation.
- Promoted the approved runtime option contract to SPEC-001 v0.1.7.

### Verification

- Checked the plan against SPEC-001, completed M1/M2 contracts, ADR-005/006, and deferred scope.

### Pending

- Implement and verify M3 without expanding into Angular, renderers, async validation, or optimistic state.

## 2026-07-13 — Proposed PLAN-003 committed

### Completed

- Committed the proposed PLAN-003 and its persistent-state documentation on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Formatting, diff, and local Markdown-link validation passed before commit.

### Pending

- Formally review and approve PLAN-003 before production code.
- Implement M3 only after closing its public contracts and diagnostics.

## 2026-07-13 — M2 reviewed and PLAN-003 proposed

### Completed

- Reviewed committed M2 commit `3347858` across contracts, implementation, diagnostics, fixtures, tests, and documentation.
- Found no functional defect, regression, or documentation conflict in M2.
- Drafted PLAN-003 for the complete framework-neutral controlled runtime milestone.
- Proposed explicit source-schema access for synchronous validation and isolated listener-exception reporting.
- Kept Angular, renderers, persistence, async validation, optimistic projection, nested objects, arrays, and deferred infrastructure out of scope.

### Verification

- `git show --check 3347858` passed and commit attribution is `Rabassoft <ricard@rabassoft.com>`.
- Reconciled PLAN-003 with SPEC-001 v0.1.6, completed PLAN-001/002, ADR-005/006, and the deferred-decisions register.
- Ran formatting, diff, and local Markdown-link validation for the plan documentation.

### Pending

- Formally review and approve PLAN-003.
- Promote approved public-contract changes to SPEC-001 before implementing M3.

## 2026-07-13 — M2 changes committed

### Completed

- Committed the completed M2 implementation, fixtures, tests, and documentation on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Confirmed the complete M2 acceptance suite passed before committing.
- Checked the staged diff and commit attribution.

### Pending

- Review the committed M2 diff.
- Prepare PLAN-003 without implementing M3.

## 2026-07-13 — M2 root immutable operations completed

### Completed

- Promoted PLAN-002's runtime diagnostic contract to SPEC-001 v0.1.6.
- Added and exported operation, expectation, metadata, and result contracts.
- Implemented pure root-only `applyOperation()` and `applyFormOperation()` utilities.
- Added strict shape, path, form membership, type compatibility, expectation, accessor-safety, and immutable cloning behavior.
- Added 27 operation conformance fixtures, focused unit tests, and built-package smoke coverage.
- Completed PLAN-002 and milestone M2 without introducing runtime state or deferred capabilities.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed.
- `pnpm test` passed with 82 tests in 4 files.
- `pnpm build` and `pnpm test:package` passed.
- `git diff --check` and local Markdown-link validation passed.

### Pending

- Review and commit the completed M2 diff only when explicitly requested.
- Propose and approve PLAN-003 before implementing the controlled runtime.

## 2026-07-13 — PLAN-002 formally reviewed and approved

### Completed

- Reviewed PLAN-002 against SPEC-001 v0.1.5, ADR-005, ADR-006, the deferred-decisions register, and the implemented M1 contracts.
- Defined safe handling for target accessors and required-member accessors without invoking caller code.
- Closed malformed-path validation, minimum FormDefinition shape, reason values, and diagnostic cutoff/order behavior.
- Added the missing accessor diagnostic and test coverage requirement.
- Marked PLAN-002 Approved without implementing M2 production code.

### Verification

- Checked public contracts, root-only scope, structural sharing, diagnostic safety, fixture coverage, and acceptance commands.
- Confirmed nested objects, arrays, runtime state, business validation, and other deferred capabilities remain excluded.
- Ran formatting, diff, and local Markdown-link validation for the review changes.

### Pending

- Promote PLAN-002's approved diagnostic contract to SPEC-001.
- Implement and verify the approved M2 increment.

## 2026-07-13 — M1 and PLAN-002 changes committed

### Completed

- Committed the completed M1 compiler increment, architecture documentation updates, and proposed PLAN-002 on `develop`.
- Used repository identity `Rabassoft <ricard@rabassoft.com>`.
- Kept the commit local; no push was performed.

### Verification

- Re-ran the frozen install, formatting, linting, type checking, tests, build, and built-package smoke test before committing.
- Checked the final diff, local Markdown links, and common credential patterns.

### Pending

- Review and explicitly approve PLAN-002 before implementing M2.
- Push the local `develop` commits only when explicitly requested.

## 2026-07-13 — PLAN-002 proposed

### Completed

- Confirmed that both M2 operation utilities are limited to one string root-property path segment.
- Defined the operation result contract, including exact input-reference preservation on failures and successful no-ops.
- Updated SPEC-001 to Draft v0.1.5 to make those M2 boundaries normative.
- Drafted decision-complete PLAN-002 with contracts, validation order, immutable behavior, diagnostics, fixtures, and acceptance criteria.
- Kept nested objects, arrays, runtime state, validation, adapters, and other deferred capabilities out of scope.

### Verification

- Checked PLAN-002 against SPEC-001 v0.1.5, completed PLAN-001, and the deferred-decisions register.
- Confirmed that no M2 production code was added.
- Ran formatting, diff, and local Markdown-link checks for the documentation changes.

### Pending

- Review and explicitly approve PLAN-002.
- Do not implement M2 before that approval.

## 2026-07-13 — M1 minimal compiler completed

### Completed

- Promoted PLAN-001's diagnostic contract to SPEC-001 v0.1.4.
- Created the native pnpm workspace and `packages/core` package named `@rabassoft/schema-engine`.
- Added TypeScript, ESLint, Prettier, Vitest, ESM build output, declarations, and package smoke testing.
- Implemented `compileFormDefinition()` with deterministic diagnostics, immutable outputs, strict root/field parsing, UI text precedence, ordering, and numeric visual options.
- Added 30 complete conformance fixtures and 10 focused unit tests.
- Completed PLAN-001 and milestone M1.

### Verification

- `CI=true pnpm install --frozen-lockfile` passed.
- `pnpm format:check` passed.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed with 40 tests in 2 files.
- `pnpm build` passed.
- `pnpm test:package` passed.
- Verified 30 expected conformance results and zero runtime dependencies.
- `git diff --check` and local Markdown link validation passed.

### Pending

- Review and commit the completed M1 diff only when explicitly requested.
- Propose and approve PLAN-002 before implementing immutable operations.

## 2026-07-13 — PLAN-001 approved

### Completed

- Approved PLAN-001 after its formal review.
- Authorized the compiler-only M1 implementation.
- Kept runtime, validators, Angular, renderers, persistence, and deferred capabilities out of scope.

### Verification

- Confirmed PLAN-001 has no remaining implementation decisions.
- Confirmed accepted ADR-005 and ADR-006 are its normative prerequisites.

### Pending

- Promote the approved diagnostic contract to SPEC-001.
- Implement and verify the compiler-only increment.

## 2026-07-13 — PLAN-001 formal review completed

### Completed

- Reviewed PLAN-001 against SPEC-001, ADR-005, ADR-006, and the first-prototype restrictions.
- Added the missing `test:package` root-script requirement.
- Made duplicate/unknown UI order behavior deterministic.
- Prevented compatibility diagnostics below invalid field-schema branches.
- Replaced unsafe diagnostic value capture with scalar-or-type descriptors.
- Expanded conformance fixtures for UI keys, required, patterns, and invalid UI values.
- Kept PLAN-001 in Proposed status pending explicit approval.

### Verification

- Checked diagnostic codes, severities, parameter shapes, and document paths.
- Checked fixture coverage against the compiler pipeline and accepted ADR policies.
- Confirmed no workspace or compiler code was created.

### Pending

- Review and explicitly approve PLAN-001.
- Commit and push the review documentation only when explicitly requested.

## 2026-07-13 — Repository setup state recorded

### Completed

- Recorded Git initialization, ignore policy, GitHub connection, commit attribution, and remote branch setup in persistent project state.
- Created a documentation-only commit on `develop`.
- Did not push the new documentation commit.

### Verification

- Confirmed only `STATUS.md` and `WORKLOG.md` changed after the initial baseline.
- Confirmed the documentation diff passes `git diff --check`.
- Confirmed `develop` is ahead of `origin/develop` after the commit.

### Pending

- Review and approve PLAN-001 before compiler implementation.
- Push the documentation commit only when explicitly requested.

## 2026-07-13 — Remote branch strategy completed

### Completed

- Pushed local `main` to `origin/main` at `a324d83`.
- Configured local `main` to track `origin/main`.
- Set `main` as the GitHub default stable/deployment branch.
- Kept `develop` as the checked-out integration branch tracking `origin/develop`.

### Verification

- Confirmed remote `main` and `develop` both point to `a324d83`.
- Confirmed both local branches track their matching upstreams.
- Confirmed GitHub reports `main` as the default branch.

### Pending

- Commit the persistent-state updates currently on `develop`.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Remote push state verified

### Completed

- Verified `origin/develop` exists at `a324d83` and local `develop` tracks it.
- Verified local `main` also points to `a324d83`.
- Identified that `origin/main` has not been pushed.
- Identified that GitHub selected `develop` as the default branch.

### Verification

- Compared local refs with `git ls-remote`.
- Queried the GitHub repository default branch.

### Pending

- Push `main` and change the GitHub default branch to `main` to match the documented workflow.
- Commit the persistent-state update after the remote branch setup is complete.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial commit attribution corrected

### Completed

- Configured the repository-local Git identity as `Rabassoft <ricard@rabassoft.com>`.
- Amended the initial commit to replace its author and committer identity.
- Realigned local `main` and `develop` to the amended commit.
- Did not push either branch.

### Verification

- Confirmed author and committer name and email on the amended commit.
- Confirmed `main` and `develop` reference the same commit.
- Confirmed the working tree is clean on `develop`.

### Pending

- Push `main` and `develop` only when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial baseline and develop branch created

### Completed

- Reviewed the initial documentation snapshot and common credential patterns.
- Created the initial commit on `main`.
- Created local branch `develop` from the initial baseline and switched to it.
- Documented `main` as stable/deployment-ready and `develop` as the development integration branch.
- Did not push either branch.

### Verification

- Confirmed ignored files were excluded from the commit.
- Confirmed `main` and `develop` reference the same initial commit.
- Confirmed the working tree is clean on `develop`.

### Pending

- Push `main` and `develop` only when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Private GitHub repository connected

### Completed

- Cancelled the authentication flow for the incorrect `Ricard-Rabasso` account.
- Authenticated GitHub CLI as `rabassoft`.
- Created the private repository `rabassoft/schema-engine`.
- Configured `https://github.com/rabassoft/schema-engine.git` as `origin` for fetch and push.
- Did not create or push a commit.

### Verification

- Confirmed GitHub reports `rabassoft/schema-engine` with `PRIVATE` visibility.
- Confirmed the local `origin` fetch and push URLs.
- Confirmed the local branch remains `main` with no commits.

### Pending

- Review the untracked files and create the initial commit when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial Git ignore policy added

### Completed

- Added `.gitignore` entries for macOS metadata, dependencies, build/test output, tool caches, local environment files, debug logs, and IDE-local metadata.
- Kept the package-manager lockfile, `.env.example`, shared configuration, and conformance fixtures trackable.
- Did not stage or commit files.

### Verification

- Verified representative ignored paths with `git check-ignore`.
- Confirmed `.DS_Store` no longer appears in `git status`.
- Confirmed representative trackable paths are not ignored.

### Pending

- Review the untracked documentation set before creating the initial commit.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Git repository initialized

### Completed

- Initialized an empty Git repository with `main` as the initial branch.
- Left all project files untracked.
- Did not create a commit or configure a remote.

### Verification

- Confirmed the directory is a Git work tree.
- Confirmed the current branch is `main`.
- Confirmed the repository has no commits.

### Pending

- Decide whether to add a `.gitignore` before the initial commit.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Compiler-only plan proposed

### Completed

- Confirmed pnpm, a native workspace, `packages/core`, Vitest, and the public package name `@rabassoft/schema-engine`.
- Confirmed the object-parameter compiler API and root required/optional members.
- Accepted ADR-006 to record the package boundary and supersede the pre-SPEC package name.
- Updated SPEC-001 to Draft v0.1.3 with the approved compiler input and root optionality.
- Drafted decision-complete PLAN-001 with behavior, diagnostics, fixtures, implementation sequence, and acceptance commands.
- Confirmed that no workspace or production code was created.

### Verification

- Checked PLAN-001 against SPEC-001, accepted ADR-005 and ADR-006, and deferred decisions.
- Checked deterministic diagnostics, no-partial-result behavior, and first-prototype scope.
- Checked local Markdown links.

### Pending

- Review and approve PLAN-001.
- Do not create the workspace or implement `compileFormDefinition()` before approval.

## 2026-07-13 — ADR-005 accepted

### Completed

- Formally reviewed ADR-005 against SPEC-001 and the deferred-decisions register.
- Replaced the ambiguous semantic-keyword test with an explicit initial keyword classification.
- Clarified that ADR-005 does not decide how the source schema reaches `SchemaValidator`.
- Accepted ADR-005.
- Updated SPEC-001 to Draft v0.1.2 and removed dialect selection from its open decisions.
- Removed dialect selection from the deferred register's next decisions.

### Verification

- Checked the accepted ADR against SPEC-001 diagnostic and compilation contracts.
- Checked consistent ADR status, SPEC version, next action, and local Markdown links.
- Confirmed that no compiler code or monorepo was created.

### Pending

- Propose and approve a compiler-only implementation plan for `compileFormDefinition()`.
- Do not begin implementation before that plan is approved.

## 2026-07-13 — ADR-005 drafted

### Completed

- Approved the working policy for unknown JSON Schema keywords and missing `$schema`.
- Drafted ADR-005 with Draft 2020-12 as the reference dialect.
- Defined deterministic diagnostic codes and severities for dialect and keyword compatibility.
- Preserved external validation and the first-prototype subset boundaries.

### Verification

- Reviewed ADR-005 against SPEC-001 and the approved policy.
- Checked the ADR index, handoff, and project status for consistent next actions.
- Checked local Markdown links.

### Pending

- Formally review and accept ADR-005.
- Do not implement `compileFormDefinition()` before ADR-005 is accepted.

## 2026-07-13 — Documentation conflicts normalized

### Completed

- Kept SPEC-001 at Draft and synchronized its index at v0.1.1.
- Reserved global ADR-005 for the JSON Schema dialect and compatibility policy.
- Corrected stale documentation paths.
- Flagged conflicting pre-SPEC ADRs for later review without changing their decisions.
- Clarified that references to the planned dialect ADR as `ADR-001` in the historical entry below now refer to `ADR-005`.

### Verification

- Checked active references to the planned dialect ADR.
- Checked the SPEC status and version across canonical project documents.
- Checked referenced documentation paths.

### Pending

- Draft and review ADR-005.
- Do not implement `compileFormDefinition()` before ADR-005 is accepted.

## 2026-07-13 — Codex handoff prepared

### Completed

- Consolidated SPEC-001 v0.1.1.
- Added the deferred-decisions register.
- Added repository instructions for Codex.
- Identified ADR-001 as the next architectural deliverable.

### Verification

- Documentation reviewed by the project owner.
- ZIP integrity verified.

### Pending

- Draft and approve ADR-001.
- Do not create the monorepo before ADR-001 is approved.
