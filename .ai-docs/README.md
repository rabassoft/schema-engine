# Architecture Documentation

## Project state

- [Current status](./project/STATUS.md) — canonical present-tense checkpoint.
- [Roadmap](./project/ROADMAP.md) — completed milestones and proposed future
  sequence.
- [Stable handoff](../HANDOFF.md) — context-recovery procedure, never current
  status.
- [Work log](./project/WORKLOG.md) — append-only history; read selectively.
- [Sanitized history map](./project/HISTORY-REWRITE-MAP.md) — public one-way
  continuity from private pre-sanitization commits to the reviewed lineage.
- [Coordinated Experimental 0.2.0 release notes](./releases/0.2.0.md) — selected
  clean bytes, source migration and verified public `next`/`latest` state.
- [M19 coordinated Experimental release notes](./releases/0.3.0.md) — completed
  public core/base `0.3.0` plus pilot `0.1.0` line under `next` and `latest`.
- [M21 coordinated Experimental release notes](./releases/0.4.0.md) — reviewed
  coordinated live state: core/base `0.4.0` and pilot `0.2.0` are verified
  exact, under `next`/`latest` and through unqualified resolution.

## Specifications

- [SPEC-001 v0.1.15: Controlled Form Runtime](./specs/001-controlled-form-runtime.md)
- [SPEC-002 v0.1.2: Nested Object Controlled Runtime Extension](./specs/002-nested-object-runtime.md)
  — Accepted; implemented by completed PLAN-009.
- [SPEC-003 v0.1.2: Homogeneous Object Collection Controlled Runtime Extension](./specs/003-collection-runtime.md)
  — Accepted after F-001 through F-007 were closed and complete review
  cycle 3 passed with zero findings. Completed PLAN-010 implements it after a
  final repeated review with zero findings.
- [SPEC-004 v0.1.1: Same-document Static JSON Schema Reference Resolution](./specs/004-local-reference-resolution.md)
  — Accepted after nine findings were corrected across four cycles and
  repeated complete review cycle 5 passed with zero findings.
- [SPEC-005 v0.1.1: Static Neutral Presentation Groups](./specs/005-static-presentation-groups.md)
  — Accepted after four findings were corrected and review 024 cycle 2 passed
  with zero findings; completed PLAN-012 implements it after a final repeated
  review with zero findings.
- [SPEC-006 v0.1.1: Nullable Primitive Leaves](./specs/006-nullable-primitive-leaves.md)
  — Accepted after review 034's complete repeated review passed with zero
  findings; completed PLAN-014 revision 0 delivered checkpoints 1–6.
- [SPEC-007 v0.1.0: Reusable Synchronous Ajv Validator](./specs/007-synchronous-ajv-validator.md)
  — Accepted after review 084 cycle 1; completed PLAN-019 revision 1 delivers a
  private reusable Ajv integration for Angular and Standard.
- [SPEC-008 v0.1.0: Static Advanced Presentation Layout and Angular Container Pilot](./specs/008-static-advanced-presentation-layout.md)
  — Accepted after review 102 cycle 5 passed all twelve areas with zero
  findings; completed PLAN-020 revision 0 delivered its eight bounded
  checkpoints after final review 113 passed with zero findings.
- [SPEC-009 v0.1.0: Recursive Local Presentation Layout](./specs/009-recursive-local-presentation-layout.md)
  — Accepted after review 135 cycle 6 passed all fourteen areas with zero
  findings; completed PLAN-022 implements its 27-row M20 boundary.

## Acceptance reviews

- [PLAN-024 checkpoint 6 review](./reviews/173-plan-024-checkpoint-6-review.md) —
  Cycles 1–2 corrected stale active plan-index and STATUS phrases; cycle 3
  verified the private recovery bundle, atomic exact-lease replacement, local
  adoption and complete fresh-remote-clone matrix; cycle 4 verifies the
  authorized closure fast-forward with zero unresolved findings and completes
  checkpoint 6.
- [PLAN-024 checkpoint 5 review](./reviews/172-plan-024-checkpoint-5-review.md) —
  Cycles 1–2 corrected one parent-only continuity assumption and the evidence
  commit's self-inventory; cycle 3 verified the deterministic sanitized
  candidate, complete map and clean-clone matrix with zero unresolved findings.
- [PLAN-024 checkpoint 4 review](./reviews/171-plan-024-checkpoint-4-review.md) —
  Cycle 1 passed all nine fresh-mirror audit layers with zero unresolved
  findings; only the preclassified review-132 path remains for later gated
  replacement.
- [PLAN-024 checkpoint 3 review](./reviews/170-plan-024-checkpoint-3-review.md) —
  Cycle 1 found a clean-build ordering issue; cycle 2 verified the normal
  correction at the exact private remote hash and passed the complete detached
  matrix with zero unresolved findings.
- [PLAN-024 checkpoint 2 review](./reviews/169-plan-024-checkpoint-2-review.md) —
  Cycle 3 passed official tool/pin trust, isolated fixtures, guarded workflows
  and the complete matrix with zero unresolved findings.
- [PLAN-024 checkpoint 1 review](./reviews/168-plan-024-checkpoint-1-review.md) —
  Cycle 3 passed the complete local boundary with zero unresolved findings;
  checkpoint 2 still requires explicit network/tool authorization.
- [PLAN-024 complete review](./reviews/167-plan-024-review.md) — Cycle 3 passed
  all sixteen areas with zero findings and approved only local checkpoint 1.
- [ADR-026 and ADR-018 revision 6 complete review](./reviews/166-adr-026-adr-018-revision-6-review.md)
  — Cycle 3 passed all fourteen areas with zero findings and accepted the
  coordinated M22 architecture.
- [D-043/M22 repository publication promotion-readiness review](./reviews/165-d043-m22-repository-publication-promotion-readiness.md)
  — Cycle 2 passed with zero findings; Ricard later selected option A and review
  166 completed its normative follow-up.
- [G0: SPEC-001 acceptance evidence](./reviews/001-spec-001-acceptance.md) —
  Passed; 22/22 criteria, consumer, complete verification, and repeated
  end-to-end review passed. SPEC-001 v0.1.15 is Accepted.
- [M9: Nested-object promotion review](./reviews/002-m9-nested-object-promotion.md)
  — Accepted; D-005 is Promoted for normative design under the reviewed narrow
  boundary, with implementation still inactive.
- [M9 ADR joint review — Cycles 1–3](./reviews/003-m9-adr-review.md) — Repeated
  review 3 passed with zero findings; ADR-014 revision 1 and ADR-005 revision 1
  were accepted coordinately without authorizing implementation.
- [M9 SPEC-002 complete review — Cycles 1–2](./reviews/004-m9-spec-002-review.md)
  — Six corrections applied; repeated review 2 passed with zero findings.
  ADR-014 revision 2 and SPEC-002 v0.1.2 were accepted in order without
  authorizing implementation.
- [M9 PLAN-009 complete review — Cycles 1–2](./reviews/005-plan-009-review.md)
  — Four delivery corrections applied; repeated review 2 passed with zero
  findings. PLAN-009 revision 1 was explicitly approved.
- [M9 PLAN-009 implementation review — Cycles 1–9](./reviews/006-plan-009-implementation-review.md)
  — Documentation and evidence corrections applied; final complete review and
  verification matrix passed with zero findings.
- [M10 arrays promotion review](./reviews/007-m10-arrays-promotion.md) — Accepted;
  D-006 is Promoted for a narrow stable-identity object-list design boundary,
  without implementation authorization.
- [M10 SPEC-003 complete review — Cycles 1–3](./reviews/011-spec-003-review.md)
  — Seven findings closed; cycle 3 passed all six areas with zero findings and
  Ricard formally accepted the SPEC.
- [M10 PLAN-010 complete review](./reviews/014-plan-010-review.md) — Revision 0
  passed all nine areas with zero findings and Ricard formally approved it.
- [M10 PLAN-010 implementation review — Cycles 1–2](./reviews/015-plan-010-implementation-review.md)
  — Current-state documentation conflicts were corrected; cycle 2 repeated the
  complete review and matrix with zero findings, completing M10.
- [M11 resolved-schema promotion-readiness review](./reviews/016-m11-resolution-promotion-readiness.md)
  — Accepted; separates and promotes D-041 for same-document static
  `$defs`/`$ref` resolution while D-007 remains Deferred; PLAN-011 later
  completed that narrow promoted slice.
- [M11 ADR-016 complete review — Cycles 1–2](./reviews/017-adr-016-review.md) —
  Five findings corrected; cycle 2 passed all eight areas with zero findings.
  Ricard then accepted ADR-016 formally.
- [M11 ADR-005 revision 3 complete review — Cycles 1–2](./reviews/018-adr-005-revision-3-review.md)
  — Six findings corrected; cycle 2 passed all ten areas with zero findings.
  Ricard then accepted revision 3 formally.
- [M11 SPEC-004 complete review — Cycles 1–5](./reviews/019-spec-004-review.md)
  — Nine findings corrected; cycle 5 passed all ten areas with zero findings.
  Ricard then formally accepted SPEC-004 v0.1.1.
- [M11 PLAN-011 complete review — Cycle 1](./reviews/020-plan-011-review.md) —
  All ten acceptance areas passed with zero findings; Ricard then formally
  approved PLAN-011 revision 0.
- [M11 PLAN-011 implementation review — Cycles 1–2](./reviews/021-plan-011-implementation-review.md)
  — One policy-provenance defect was corrected; the repeated complete review
  passed with zero findings and completed M11.
- [M12 advanced UI Schema promotion-readiness review](./reviews/022-m12-advanced-ui-promotion-readiness.md)
  — Accepted; creates and promotes D-042 only for a narrow static-presentation-
  group design slice while D-011 and D-012 remain Deferred.
- [M12 ADR-017 complete review — Cycles 1–3](./reviews/023-adr-017-review.md) —
  Two current-state findings were corrected; cycle 3 passed all eight areas with
  zero findings and ADR-017 revision 0 was then accepted.
- [M12 SPEC-005 complete review — Cycles 1–2](./reviews/024-spec-005-review.md) —
  Four findings were corrected; cycle 2 passed all ten areas with zero findings.
- [M12 PLAN-012 complete review — Cycles 1–2](./reviews/025-plan-012-review.md) —
  Two findings were corrected; cycle 2 passed all ten areas with zero findings.
- [M12 PLAN-012 implementation review — Cycles 1–6](./reviews/026-plan-012-implementation-review.md) —
  Seven findings were corrected across cycles 1–5; cycle 6 passed the closing
  review with zero findings after the complete matrix passed in cycle 3.
- [D-034/D-040 public publication and dual licensing readiness](./reviews/027-d034-d040-publication-licensing-readiness.md) —
  Accepted after cycle 2 passed with zero findings; promotes normative design
  only for the selected `AGPL-3.0-only` or paid commercial model.
- [ADR-018 revision 3 complete review](./reviews/028-adr-018-review.md) — Cycle
  8 passed the complete revision 3 review with zero findings.
- [PLAN-013 complete review — Cycles 1–4](./reviews/029-plan-013-review.md) —
  Cycles 1 and 3 corrected four design findings and one implementation-order
  conflict; cycle 4 passed the complete repeated review with zero findings.
- [PLAN-013 implementation review](./reviews/030-plan-013-implementation-review.md) —
  Completed after repeated checkpoint and closing reviews passed with zero
  findings and both public packages were verified byte-identical.
- [M14 nullable-leaf promotion readiness](./reviews/031-m14-nullable-leaves-promotion-readiness.md)
  — Accepted after cycle 3 passed all eight areas with zero findings.
- [ADR-019/ADR-005 revision 4 joint review](./reviews/032-adr-019-adr-005-revision-4-review.md)
  — Cycle 2 passed all ten areas with zero findings.
- [ADR-019 revision 1 review](./reviews/033-adr-019-revision-1-review.md) — Cycle
  2 preserved SPEC-003's collection diagnostic with zero findings.
- [SPEC-006 complete review](./reviews/034-spec-006-review.md) — Complete
  repeated review passed with zero findings and supports Accepted v0.1.1.
- [PLAN-014 complete review](./reviews/035-plan-014-review.md) — Cycle 3 passed
  all ten areas with zero findings; Ricard formally approved revision 0.
- [PLAN-015 complete review](./reviews/042-plan-015-review.md) — Cycle 1
  corrected five release-order/verification findings; cycle 2 repeated all ten
  areas with zero findings. Ricard then formally approved revision 0.
- [PLAN-015 local candidate review](./reviews/045-plan-015-checkpoint-3-review.md)
  — Checkpoints 1–3 complete after cycle 5 closed the full local release review
  with zero findings.
- [PLAN-015 clean committed candidate review](./reviews/046-plan-015-checkpoint-4-review.md)
  — Checkpoint 4 private commit/push, deterministic clean rebuild and
  neutral-path rehearsal passed with zero findings; npm remains separately
  gated.
- [PLAN-015 core publication preflight review](./reviews/047-plan-015-checkpoint-5-preflight-review.md)
  — Identity, organization ownership, write-protected 2FA, registry state,
  immutable history and the exact core command passed with zero findings; the
  registry write awaits immediate approval.
- [PLAN-015 live core review](./reviews/048-plan-015-checkpoint-5-live-core-review.md)
  — Core `0.2.0` bytes, metadata, signature, source/license, neutral disclosure,
  tags and consumers passed with zero findings.
- [PLAN-015 Angular publication preflight](./reviews/049-plan-015-checkpoint-6-preflight-review.md)
  — Angular absence, selected bytes, peer/source/artifacts, live-core consumers
  and exact neutral-path command passed with zero findings; publication awaits
  separate approval.
- [PLAN-015 live Angular/checkpoint 7 preflight](./reviews/050-plan-015-checkpoint-6-live-angular-review.md)
  — Angular bytes/metadata and exact/`next` paired consumers passed with zero
  findings; Angular `latest` is the next separately gated mutation.
- [PLAN-015 Angular latest review](./reviews/051-plan-015-angular-latest-review.md)
  — The first coordinated tag mutation passed without drift; core `latest`
  remains separately gated.
- [PLAN-015 final release review](./reviews/052-plan-015-final-review.md) — The
  coordinated `0.2.0` tags, bytes and all consumer modes passed with zero
  findings; PLAN-015 is complete.
- [D-044/M15 reference-platform promotion readiness](./reviews/053-d044-m15-reference-platform-promotion-readiness.md)
  — Accepted after cycle 2 passed ten areas with zero findings; promotes only a
  private neutral catalog and first Angular shell for ADR-020 design and
  registers Angular legacy separately as D-045 Deferred.
- [ADR-020 complete review](./reviews/054-adr-020-review.md) — Cycle 3 passed
  ten areas with zero findings and accepted the private catalog/Angular 22
  architecture; only PLAN-016 preparation is authorized.
- [PLAN-016 complete review](./reviews/055-plan-016-review.md) — Cycle 5 passed
  twelve areas with zero findings; revision 0 is Approved for checkpoints 1–8.
- [PLAN-016 checkpoint 1 review](./reviews/056-plan-016-checkpoint-1-review.md)
  — Cycle 4 passed the private workspace, exact toolchain, official builder,
  boundaries and linked-development gate with zero findings.
- [PLAN-016 checkpoint 2 review](./reviews/057-plan-016-checkpoint-2-review.md)
  — Cycle 3 passed the complete Internal catalog authoring and regression gate
  with zero findings.
- [PLAN-016 checkpoint 3 review](./reviews/058-plan-016-checkpoint-3-review.md)
  — Cycle 3 passed the exact six-scenario inventory, Public compilation,
  transition evidence and deterministic validation gate with zero findings.
- [PLAN-016 checkpoint 4 review](./reviews/059-plan-016-checkpoint-4-review.md)
  — Cycle 3 passed application-owned Angular state, explicit decision flows,
  inspectors, strict templates and regressions with zero findings.
- [PLAN-016 checkpoint 5 review](./reviews/060-plan-016-checkpoint-5-review.md)
  — Cycle 3 passed semantic shell UI, accessibility, collection controls and
  deterministic build-checked snippets with zero findings.
- [PLAN-016 checkpoint 6 review](./reviews/061-plan-016-checkpoint-6-review.md)
  — Cycle 3 passed one real Chromium lane twice consecutively, including all
  scenarios, controlled decisions, keyboard interaction and explicit
  non-claims, with zero findings.
- [PLAN-016 checkpoint 7 review](./reviews/062-plan-016-checkpoint-7-review.md)
  — Cycle 2 passed Public/private isolation, full regressions, exact artifacts,
  source rebuilds, clean consumers and onboarding with zero findings.
- [PLAN-016 final implementation review](./reviews/063-plan-016-final-implementation-review.md)
  — Cycle 2 repeated authority, implementation, browser, Public isolation and
  persistent-state review with zero findings; PLAN-016/M15 are complete.
- [PLAN-017 complete review](./reviews/064-plan-017-review.md) — Cycle 3 passed
  the private UX, editor state, runtime replacement, accessibility, dependency
  and Public-isolation contract with zero findings; revision 0 is Approved.
- [PLAN-017 checkpoint 1 review](./reviews/065-plan-017-checkpoint-1-review.md)
  — Cycle 2 passed exact private dependencies, accessible tab/editor
  primitives, lifecycle, keyboard, build and Public isolation with zero
  findings.
- [PLAN-017 checkpoint 2 review](./reviews/066-plan-017-checkpoint-2-review.md)
  — Cycle 2 passed semantic cards, responsive Configuration/Evidence tabs,
  complete inspector reachability and Chromium 4/4 with zero findings.
- [PLAN-017 checkpoint 3 review](./reviews/067-plan-017-checkpoint-3-review.md)
  — Cycle 2 passed configuration ownership, exact draft validation, stale-safe
  application and complete runtime replacement with zero findings.
- [PLAN-017 checkpoint 4 review](./reviews/068-plan-017-checkpoint-4-review.md)
  — Cycle 2 passed diagnostic routing, validation caveat, visible reset and
  confirmation-focus behavior with zero findings.
- [PLAN-017 checkpoint 5 review](./reviews/069-plan-017-checkpoint-5-review.md)
  — Cycle 2 passed responsive/accessibility and full release-isolation
  regression after correcting component-boundary contrast.
- [PLAN-017 final implementation review](./reviews/070-plan-017-final-implementation-review.md)
  — Cycle 1 repeated the complete implementation and verification matrix with
  zero findings; PLAN-017 is complete.
- [Reference workspace follow-up review](./reviews/071-reference-workspace-follow-up-review.md)
  — Cycle 2 passed the merged full-width workspace, real Integration syntax
  highlighting, accessible copy actions and private/Public isolation with zero
  findings.
- [Reference workspace simultaneous-layout review](./reviews/072-reference-workspace-simultaneous-layout-review.md)
  — Cycle 2 replaces only review 071's mutually exclusive workspace tabs with
  simultaneous Form preview/Schemas columns and passes responsive, workflow and
  Public-isolation review with zero findings.
- [Reference workspace sober-theme review](./reviews/073-reference-workspace-theme-review.md)
  — Cycle 2 passes the custom Auto/Light/Dark token system, restrained visual
  hierarchy, accessible CodeMirror syntax palette and Public isolation with
  zero findings.
- [Reference workspace heading review](./reviews/074-reference-workspace-heading-review.md)
  — Cycle 1 passes the integrated scenario explanation, single semantic group
  headings, initially open State/Value evidence and Public isolation with zero
  findings.
- [D-046/M16 Standard/DOM promotion-readiness review](./reviews/075-d046-m16-standard-dom-promotion-readiness.md)
  — Cycle 1 promotes only a private direct-core Standard/DOM shell for ADR-021
  preparation; no adapter, Public contract or implementation is authorized.
- [ADR-021 review](./reviews/076-adr-021-review.md)
  — Cycle 1 accepts the private Standard/DOM architecture with zero findings
  and authorizes PLAN-018 preparation only.
- [ADR-021 revision 1 review](./reviews/090-adr-021-revision-1-review.md)
  — Cycle 3 passes the proposed cross-target workspace and editable-
  configuration parity amendment with zero findings; revision 1 is Accepted
  and a revised PLAN-018 remains pending.
- [PLAN-018 review](./reviews/077-plan-018-review.md)
  — Cycle 1 approves seven Standard/DOM delivery checkpoints with zero findings;
  dependency/browser execution gates remain separate.
- [PLAN-018 revision 1 review](./reviews/091-plan-018-revision-1-review.md)
  — Cycle 3 passes the four remaining workspace/configuration delivery
  checkpoints with zero findings; revision 1 is Approved while dependency and
  external execution gates remain separate.
- [PLAN-018 checkpoint 1 review](./reviews/078-plan-018-checkpoint-1-review.md)
  — Cycle 2 passes the private Vite skeleton, catalog watch, strict boundaries
  and Angular/Public regression after correcting Vite CSS module types.
- [PLAN-018 checkpoint 5 review](./reviews/092-plan-018-checkpoint-5-review.md)
  — Cycle 2 passes exact Standard CodeMirror ownership, editable configuration,
  runtime replacement, active-schema Ajv and release isolation with zero
  findings.
- [PLAN-018 checkpoint 6 review](./reviews/093-plan-018-checkpoint-6-review.md)
  — Cycle 1 passes simultaneous workspace, tabs, evidence, themes and exact
  multi-target snippets with zero findings.
- [PLAN-018 checkpoint 7 review](./reviews/094-plan-018-checkpoint-7-review.md)
  — Cycle 2 passes both Chromium lanes, release isolation and onboarding after
  correcting pending-control DOM stability.
- [PLAN-018 final implementation review](./reviews/095-plan-018-final-implementation-review.md)
  — Cycle 2 repeats all fourteen areas and the complete matrix with zero
  findings, completing PLAN-018 revision 1 and M16.
- [D-047/M17 Ajv validator promotion readiness](./reviews/082-d047-m17-ajv-validator-promotion-readiness.md)
  — Cycle 1 promotes one private reusable synchronous Draft 2020-12 validator.
- [ADR-022 review](./reviews/083-adr-022-review.md) — Cycle 1 accepts the exact
  package, options, normalization, cache and shell-integration architecture.
- [SPEC-007 review](./reviews/084-spec-007-review.md) — Cycle 1 accepts the
  observable factory and issue-normalization contract.
- [PLAN-019 review](./reviews/085-plan-019-review.md) — Cycle 1 approves four
  implementation checkpoints; network, publication, commit and push stay gated.
- [PLAN-019 checkpoint reviews](./reviews/086-plan-019-checkpoint-1-review.md) —
  Reviews 086–088 close package, Angular and Standard delivery after repeated
  corrections.
- [PLAN-019 final review](./reviews/089-plan-019-final-review.md) — Cycle 2
  repeats the complete matrix with zero findings and completes M17.
- [D-011/M18 advanced neutral layout promotion readiness](./reviews/098-d011-m18-advanced-layout-promotion-readiness.md)
  — Cycle 2 promotes only static root tabs, accordions and logical grid for
  ADR-023; D-025 retains a conditional readiness and ADR gate before SPEC or
  plan.
- [ADR-023 review](./reviews/099-adr-023-review.md) — Cycle 3 accepts revision 1
  after closing exact DOM identity, diagnostic envelopes and text order; only
  the D-025 promotion-readiness review is authorized.
- [D-025 Angular presentation-container kit promotion readiness](./reviews/100-d025-angular-container-kit-promotion-readiness.md)
  — Cycle 4 promotes only an Angular Experimental section/advanced-container
  seam, native fallback and one isolated optional pilot for ADR-024.
- [ADR-024 review](./reviews/101-adr-024-review.md) — Cycle 4 accepts revision 1
  after closing provider diagnostics, child claims, target state and exact
  Aria/CDK compatibility; SPEC-008 preparation is the only authorized effect.
- [SPEC-008 review](./reviews/102-spec-008-review.md) — Cycle 5 accepts v0.1.0
  after twenty corrections and a complete twelve-area zero-finding pass.
- [PLAN-020 review](./reviews/103-plan-020-review.md) — Cycle 2 approves eight
  bounded M18 checkpoints after four corrections and a complete fourteen-area
  zero-finding pass; network, publication, commit and push remain gated.
- [PLAN-020 checkpoint 1 review](./reviews/104-plan-020-checkpoint-1-review.md) —
  Cycle 3 closes the exact core contracts, compiler and fixtures after three
  corrections and a complete ten-area zero-finding pass.
- [PLAN-020 checkpoint 2 review](./reviews/105-plan-020-checkpoint-2-review.md) —
  Cycle 3 closes manual advanced definitions and runtime invariance after two
  corrections and a complete ten-area zero-finding pass.
- [PLAN-020 checkpoint 3 review](./reviews/106-plan-020-checkpoint-3-review.md) —
  Cycle 3 closes the exact base Angular SPI and mandatory native projection
  after five corrections and a complete twelve-area zero-finding pass.
- [PLAN-020 checkpoint 4 review](./reviews/107-plan-020-checkpoint-4-review.md) —
  Cycle 5 closes the independent Standard projection and shared advanced
  scenario after four corrections and a complete twelve-area zero-finding pass.
- [PLAN-020 checkpoint 5 pre-network review](./reviews/108-plan-020-checkpoint-5-pre-network-review.md)
  — Cycle 3 passes all ten local manifest/package areas after two corrections;
  checkpoint 5 remains open at its separately authorized Aria/CDK network gate.
- [PLAN-020 checkpoint 5 review](./reviews/109-plan-020-checkpoint-5-review.md) —
  Cycle 1 closes exact dependency resolution, peer patch, license, lifecycle,
  lock and isolation evidence with zero findings.
- [PLAN-020 checkpoint 6 review](./reviews/110-plan-020-checkpoint-6-review.md) —
  Cycle 2 closes the isolated pilot, selective Angular Aria tabs and exact
  six-property style boundary after one formatting correction.
- [PLAN-020 checkpoint 7 pre-network review](./reviews/111-plan-020-checkpoint-7-pre-network-review.md)
  — Cycle 3 passes twelve local artifact/source/security/lower-consumer areas
  after correcting the frozen `0.2.0` regression; registry `latest` remains
  separately gated.
- [PLAN-020 checkpoint 7 review](./reviews/112-plan-020-checkpoint-7-review.md) —
  Cycle 1 closes Angular `22.0.7`, exact Aria/CDK `22.0.5`, both latest clean
  consumers and all 22 rows with zero findings.
- [PLAN-020 final implementation review](./reviews/113-plan-020-final-implementation-review.md)
  — Cycle 2 repeats fourteen areas, all 22 rows, the frozen install and complete
  matrix with zero findings, completing checkpoint 8, PLAN-020 and M18.
- [M19 coordinated Experimental 0.3 release promotion readiness](./reviews/114-m19-coordinated-0-3-release-promotion-readiness.md)
  — Cycle 2 promotes only core/base `0.3.0` plus pilot `0.1.0` release design;
  its required ADR-018 revision 4 gate is now satisfied by review 115.
- [ADR-018 revision 4 complete review](./reviews/115-adr-018-revision-4-review.md)
  — Cycle 4 reconciles eight findings and passes thirteen areas plus closing
  documentation with zero findings; revision 4 is Accepted and authorizes
  PLAN-021 preparation only.
- [PLAN-021 complete review](./reviews/116-plan-021-review.md) — Cycle 3 passes
  fourteen areas and closing documentation with zero findings; revision 0 is
  Approved for local checkpoints 1–3 only.
- [PLAN-021 checkpoint 1 review](./reviews/117-plan-021-checkpoint-1-review.md)
  — Cycle 2 passes all ten descriptor/tooling/evidence areas with zero
  findings.
- [PLAN-021 checkpoint 2 review](./reviews/118-plan-021-checkpoint-2-review.md)
  — Cycle 3 passes all ten release-note/onboarding/candidate-contract areas
  with zero findings.
- [PLAN-021 checkpoint 3 review](./reviews/119-plan-021-checkpoint-3-review.md)
  — Cycle 5 passes all fourteen local-release areas and all 22 SPEC-008 rows
  with zero findings; checkpoint 4 remains separately gated.
- [PLAN-021 checkpoint 4 review](./reviews/120-plan-021-checkpoint-4-review.md)
  — Cycle 3 verifies the scoped private commit/push, clean rebuild and exact
  three-candidate byte equality with zero findings.
- [PLAN-021 checkpoint 5 pre-publication review](./reviews/121-plan-021-checkpoint-5-pre-publication-review.md)
  — Cycle 2 passes identity, 2FA, authority, absence, tags, baseline, selected
  bytes and neutral-command checks; only core publication awaits approval.
- [PLAN-021 checkpoint 5 review](./reviews/122-plan-021-checkpoint-5-review.md)
  — Cycle 3 verifies exact public core bytes/metadata/tags and repeated exact/
  `next` consumers with zero findings; checkpoint 6 remains separately gated.
- [PLAN-021 checkpoint 6 pre-publication review](./reviews/123-plan-021-checkpoint-6-pre-publication-review.md)
  — Cycle 3 passes live-core, selected-base, peer/source, lower/latest consumer
  and neutral-command checks; only base publication awaits approval.
- [PLAN-021 checkpoint 6 review](./reviews/124-plan-021-checkpoint-6-review.md)
  — Cycle 2 verifies exact public base bytes/metadata/tags and repeated exact/
  `next` native consumers with zero findings; checkpoint 7 remains gated.
- [PLAN-021 checkpoint 7 pre-publication review](./reviews/125-plan-021-checkpoint-7-pre-publication-review.md)
  — Cycle 5 passes live core/base, selected pilot, source/style, lower/latest
  exact/`next` consumers and neutral-command checks; only pilot publication
  awaits approval.
- [PLAN-021 checkpoint 7 review](./reviews/126-plan-021-checkpoint-7-review.md)
  — Cycle 4 verifies exact public pilot bytes/metadata/tags and repeated exact/
  `next` native/pilot consumers with zero findings; checkpoint 8 remains gated.
- [PLAN-021 checkpoint 8 review](./reviews/127-plan-021-checkpoint-8-review.md)
  — Cycle 2 verifies and retains the automatically created pilot
  `latest: 0.1.0` without mutation; checkpoint 9 remains gated.
- [PLAN-021 checkpoint 9 pre-transition review](./reviews/128-plan-021-checkpoint-9-pre-transition-review.md)
  — Cycle 1 passes exact aliases/bytes, base metadata and exact/`next`
  native/pilot consumers; only the base `latest` command awaits approval.
- [PLAN-021 checkpoint 9 review](./reviews/129-plan-021-checkpoint-9-review.md)
  — Cycle 1 verifies the exact base `latest: 0.3.0` mutation and intentional
  mixed window with zero findings; checkpoint 10 remains gated.
- [PLAN-021 checkpoint 10 pre-transition review](./reviews/130-plan-021-checkpoint-10-pre-transition-review.md)
  — Cycle 1 verifies the exact mixed window, core bytes/metadata and manual
  transition command with zero findings.
- [PLAN-021 checkpoint 10 review](./reviews/131-plan-021-checkpoint-10-review.md)
  — Cycle 1 verifies coordinated aliases and complete `latest`/unqualified
  native/pilot consumers with zero findings.
- [PLAN-021 final review](./reviews/132-plan-021-final-review.md) — Cycles 1–3
  correct offline-store recovery, stale active documentation, toolchain
  evidence and one stale alias statement; cycle 4
  repeats all eighteen areas and all 22 SPEC-008 rows with zero findings,
  completing PLAN-021/M19.
- [D-011/M20 nested-object and collection-item layout promotion readiness](./reviews/133-d011-m20-nested-item-layout-promotion-readiness.md)
  — Cycle 3 promotes only static local presentation forests for direct object
  and item-template children and authorizes ADR-025 drafting/review; scopes,
  workflow, broader theming, later frameworks and implementation stay Deferred.
- [ADR-025 complete review](./reviews/134-adr-025-review.md) — Cycle 1 corrects
  text typing/identity, cycle 2 closes diagnostic/review-row defects, cycle 3
  fixes stale current-state authority and cycle 4 passes all thirteen areas.
- [SPEC-009 complete review](./reviews/135-spec-009-review.md) — Cycles 1–5
  correct nine formatting, indexing, contract and current-state findings;
  cycle 6 repeats all fourteen areas with zero findings and accepts v0.1.0.
- [PLAN-022 complete review](./reviews/136-plan-022-review.md) — Cycle 1
  replaces indirect M18/M19 consumer evidence with dedicated lower/latest M20
  lanes; cycle 2 passes all fifteen areas and approves revision 0.
- [PLAN-022 checkpoint reviews](./reviews/137-plan-022-checkpoint-1-review.md) —
  Reviews 137–143 close core, runtime, Angular SPI/native, Standard, Aria and
  package/consumer delivery after complete correction/review restarts.
- [PLAN-022 final implementation review](./reviews/144-plan-022-final-implementation-review.md)
  — Cycles 1–2 correct review-record formatting and one stale active Deferred
  instruction; cycle 3 repeats the frozen complete matrix and all 27 SPEC-009
  rows with zero findings, completing PLAN-022 and M20.
- [Post-M20 milestone-selection review](./reviews/145-post-m20-milestone-selection.md)
  — Cycle 1 found only review-record formatting; cycle 2 compares the remaining
  demand-driven candidates with zero findings. Ricard selected option A on 20
  July and review 146 performs its separate promotion gate.
- [M21 coordinated M20 release promotion readiness](./reviews/146-m21-coordinated-m20-release-promotion-readiness.md)
  — Cycle 3 promotes only ADR-018 revision 5 design for core/base `0.4.0` plus
  pilot `0.2.0`; manifests, plans, Git and external actions remain inactive.
- [ADR-018 revision 5 complete review](./reviews/147-adr-018-revision-5-review.md)
  — Cycle 5 accepts the exact M21 three-established-package release decision
  with zero findings and authorizes PLAN-023 preparation/review only.
- [PLAN-023 complete review](./reviews/148-plan-023-review.md) — Cycle 1
  corrected four delivery-contract findings; cycle 2 passed all sixteen areas
  with zero findings and approves local checkpoints 1–3 only.
- [PLAN-023 checkpoint 1 review](./reviews/149-plan-023-checkpoint-1-review.md)
  — Cycle 1 corrected three package/tool/environment findings; cycle 2 passed
  all twelve areas with zero findings and leaves checkpoint 2 next.
- [PLAN-023 checkpoint 2 review](./reviews/150-plan-023-checkpoint-2-review.md)
  — Cycle 1 corrected ROADMAP source truth, exact recovery and semantic
  manifest/style verification; cycles 2–4 corrected stale candidate wording
  and its exact artifact marker; cycle 5 passed all twelve areas with zero
  findings, leaving checkpoint 3 next.
- [PLAN-023 checkpoint 3 review](./reviews/151-plan-023-checkpoint-3-review.md)
  — Cycle 1 found only stale pre-candidate active documentation; cycle 2
  repeated the complete frozen matrix and all 27 SPEC-009 rows with zero
  findings, leaving checkpoint 4 separately gated.
- [PLAN-023 checkpoint 4 review](./reviews/152-plan-023-checkpoint-4-review.md)
  — Cycle 3 verifies the scoped private commit/push and selects byte-identical
  clean candidates with zero findings; checkpoint 5 registry preflight remains
  separately gated.
- [PLAN-023 checkpoint 5 pre-publication review](./reviews/153-plan-023-checkpoint-5-pre-publication-review.md)
  — Cycle 3 verifies identity, 2FA/authority, immutable M19, absent M21 versions,
  selected core bytes/source and neutral rehearsal with zero findings; the core
  publish remains immediately gated.
- [PLAN-023 checkpoint 5 live core review](./reviews/154-plan-023-checkpoint-5-live-core-review.md)
  — Cycle 5 verifies exact public bytes, signature, metadata, aliases and
  exact/`next` consumers with zero findings; checkpoint 6 remains separately
  gated.
- [PLAN-023 checkpoint 6 pre-publication review](./reviews/155-plan-023-checkpoint-6-pre-publication-review.md)
  — Cycle 1 verifies live core, selected base bytes/peers/source, absence,
  aliases, consumers and neutral rehearsal with zero findings; base publication
  remains immediately gated.
- [PLAN-023 checkpoint 6 live Angular review](./reviews/156-plan-023-checkpoint-6-live-angular-review.md)
  — Cycle 2 verifies exact public bytes, signature, peers, aliases and
  exact/`next` lower/latest native consumers with zero findings; checkpoint 7
  remains separately gated.
- [PLAN-023 checkpoint 7 pre-publication review](./reviews/157-plan-023-checkpoint-7-pre-publication-review.md)
  — Cycle 1 finds a fixed-port collision in parallel review orchestration;
  cycle 2 serializes the matrices and verifies authority, live prerequisites,
  selected pilot, absence, aliases, consumers and rehearsal with zero findings.
- [PLAN-023 checkpoint 7 live pilot review](./reviews/158-plan-023-checkpoint-7-live-pilot-review.md)
  — Cycle 1 corrects three stale documentation-check/onboarding rules; cycle 2
  verifies all three exact/`next` artifacts, pilot metadata/alias and serialized
  lower/latest M20 native/pilot consumers with zero findings; checkpoint 8
  remains separately gated.
- [PLAN-023 checkpoint 8 pre-transition review](./reviews/159-plan-023-checkpoint-8-pre-transition-review.md)
  — Cycle 1 verifies registry authority, signed M21 exact/`next`, immutable M19
  defaults, aliases/settings and serialized lower/latest consumers with zero
  findings; only the pilot `latest` mutation remains immediately gated.
- [PLAN-023 checkpoint 8 review](./reviews/160-plan-023-checkpoint-8-review.md)
  — Cycles 1–2 correct an overbroad ROADMAP expression and canonical review
  marker; cycle 3 verifies the exact pilot `latest` transition, unchanged public
  bytes/metadata/settings and the planned mixed-window boundary with zero
  findings; checkpoint 9 remains separately gated.
- [PLAN-023 checkpoint 9 pre-transition review](./reviews/161-plan-023-checkpoint-9-pre-transition-review.md)
  — Cycle 1 corrects an overbroad ROADMAP stale-state expression; cycle 2
  corrects review formatting; cycles 3–4 stabilize release markers; cycle 5
  verifies identity/authority, signed M21 exact/`next`, the base contract,
  checkpoint-8 aliases and serialized lower/latest consumers with zero
  findings; only the exact base `latest` mutation awaits approval.
- [PLAN-023 checkpoint 9 review](./reviews/162-plan-023-checkpoint-9-review.md)
  — Cycle 1 reconciles expected stale pre-transition documentation; cycle 2
  verifies the exact base `latest` transition, unchanged bytes/settings and the
  intentional mixed-window boundary with zero findings; checkpoint 10 remains
  separately gated.
- [PLAN-023 checkpoint 10 review](./reviews/163-plan-023-checkpoint-10-review.md)
  — Cycle 1 records the core alias arriving before its gated preflight and
  applies fail-closed recovery; cycle 2 restores explicit pinned M19 history;
  cycle 3 verifies coordinated exact/`next`/`latest`/unqualified consumers and
  zero unrelated drift, leaving only the final closure review gated.
- [PLAN-023 final review](./reviews/164-plan-023-final-review.md) — Cycle 1
  records the restricted-sandbox Angular build abort and corrects stale active
  mixed-window onboarding; cycle 2 corrects formatting; cycle 3 repeats all
  eighteen areas and all 27
  SPEC-009 rows with zero findings, completing PLAN-023/M21.

## Architecture Decision Records

- [ADR index](./adrs/000-index.md)
- [ADR-026: Sanitized public history and secure release automation](./adrs/026-public-repository-and-secure-releases.md)
  — Accepted revision 0 with ADR-018 revision 6 after review 166 cycle 3;
  PLAN-024 checkpoint 1 is complete and checkpoint 2 remains gated.
- [ADR-005: JSON Schema dialect and compatibility policy](./adrs/005-politica-dialecto-json-schema.md)
  — Accepted revision 3; adds only the reviewed D-041 `$defs`/local `$ref`
  normative contract; SPEC-004 v0.1.1 and completed PLAN-011 implement that
  narrow slice.
- [ADR-017: Static neutral presentation groups](./adrs/017-grupos-presentacion-estaticos.md)
  — Accepted revision 0 for D-042 after review 023 cycle 3 passed all eight
  areas with zero findings; SPEC-005 and completed PLAN-012 implement it.
- [ADR-019: Nullable primitive leaves](./adrs/019-hojas-primitivas-nullable.md)
  — Accepted revision 1 under ADR-005 revision 4; SPEC-006 v0.1.1 fixes its
  observable M14 boundary.
- [ADR-020: Private multi-framework reference platform](./adrs/020-plataforma-referencia-multiframework.md)
  — Accepted revision 0 after review 054 cycle 3; PLAN-016 revision 0 was
  separately approved and completed after final review 063 cycle 2.
  Approved for checkpoints 1–8.
- [ADR-022: Reusable synchronous Ajv validator package](./adrs/022-validador-ajv-sincrono-reutilizable.md)
  — Accepted revision 1; SPEC-007 and completed PLAN-019 define the private M17
  validator boundary.
- [ADR-023: Static neutral tabs, accordion and logical-grid containers](./adrs/023-contenedores-layout-neutral-estatico.md)
  — Accepted revision 1; its separate D-025 architecture gate is now completed.
- [ADR-024: Angular presentation-container SPI and Angular Aria pilot](./adrs/024-spi-contenedores-angular-y-piloto-angular-aria.md)
  — Accepted revision 1; Angular Aria 22 is the sole Experimental pilot and
  accepted SPEC-008 v0.1.0 completes its normative gate.
- [ADR-025: Recursive local presentation forests for nested objects and collection items](./adrs/025-bosques-presentacion-locales-objetos-items.md)
  — Accepted revision 0 after review 134 cycle 4; accepted SPEC-009 v0.1.0
  and completed PLAN-022 now implement its narrow M20 boundary.

- [ADR-005 revision 2 complete review — Cycles 1–3](./reviews/010-adr-005-revision-2-review.md)
  — Four findings corrected; cycle 3 passed all nine areas with zero findings
  and Ricard accepted the revision.
- [ADR-005 revision 3 complete review — Cycles 1–2](./reviews/018-adr-005-revision-3-review.md)
  — Six findings corrected and repeated cycle 2 passed all ten areas with zero
  findings; Ricard then accepted revision 3 formally.
- [ADR-015: Collection templates, stable item identity and controlled structural operations](./adrs/015-modelo-colecciones-identidad-operaciones.md)
  — Accepted revision 4 after the ordinary node text context was widened to
  array definitions and passed complete review with zero findings;
  implementation is authorized only through approved PLAN-010 checkpoints.
- [ADR-015 complete review — Cycles 1–4](./reviews/008-adr-015-review.md) — Eleven
  findings corrected across three cycles; cycle 4 passed all nine areas with
  zero findings and Ricard accepted the decision.
- [ADR-015 revision 2 complete review](./reviews/009-adr-015-revision-2-review.md)
  — Narrow structural UI inventory correction passed all six areas with zero
  findings and was accepted.
- [ADR-015 revision 3 complete review](./reviews/012-adr-015-revision-3-review.md)
  — Item-root issue text-context correction passed all six areas with zero
  findings and was formally accepted.
- [ADR-015 revision 4 complete review](./reviews/013-adr-015-revision-4-review.md)
  — Collection-node ordinary text-context correction passed all six areas with
  zero findings and was formally accepted.
- [ADR-016: Same-document static JSON Schema reference resolution](./adrs/016-resolucion-referencias-locales.md)
  — Accepted after complete review cycle 2 passed all eight areas with zero
  findings; it enabled the reviewed ADR-005 revision 3 normative update.

## Roadmap and deferred decisions

- [Milestones and proposed sequence](./project/ROADMAP.md)
- [Deferred decisions](./roadmap/deferred-decisions.md)

## Implementation plans

- [PLAN-001: Minimal compiler-only implementation](./plans/001-compiler-only-implementation.md) — Completed
- [PLAN-002: Root-level immutable operations](./plans/002-root-immutable-operations.md) — Completed
- [PLAN-003: Controlled form runtime](./plans/003-controlled-runtime.md) — Completed
- [PLAN-004: Angular controlled-form adapter](./plans/004-angular-adapter.md) — Completed
- [PLAN-005: Native HTML renderers](./plans/005-native-html-renderers.md) — Completed
- [PLAN-006: String enum normalization and native select](./plans/006-string-enum-native-select.md) — Completed
- [PLAN-007: Explicit native field clearing](./plans/007-explicit-native-field-clearing.md) — Completed revision 2
- [PLAN-008: Experimental 0.1 artifact preparation](./plans/008-experimental-0-1-artifact-preparation.md) — Completed revision 2
- [PLAN-009: Nested-object controlled runtime](./plans/009-nested-object-runtime.md) — Completed revision 1
- [PLAN-010: Homogeneous object collection runtime](./plans/010-homogeneous-object-collections.md) — Completed revision 0
- [PLAN-011: Same-document static JSON Schema reference resolution](./plans/011-local-reference-resolution.md) — Completed revision 0 after final repeated review with zero findings
- [PLAN-012: Static neutral presentation groups](./plans/012-static-presentation-groups.md) — Completed revision 1 after final repeated review with zero findings
- [PLAN-013: First public experimental release](./plans/013-public-experimental-release.md) — Completed revision 4 after all separately authorized local, Git and npm checkpoints passed
- [PLAN-014: Nullable primitive leaves](./plans/014-nullable-primitive-leaves.md) — Completed revision 0 after final review 041 cycle 2 passed with zero findings
- [PLAN-015: Coordinated Experimental 0.2 release](./plans/015-coordinated-experimental-0-2-release.md) — Completed revision 0 after final review 052 passed with zero findings
- [PLAN-016: Private reference platform and Angular 22 shell](./plans/016-private-reference-platform.md) — Completed revision 0 after final review 063 cycle 2 passed with zero findings
- [PLAN-017: Reference workspace UX and configuration laboratory](./plans/017-reference-workspace-ux.md) — Completed revision 0 after final review 070 cycle 1 repeated the complete implementation and verification matrix with zero findings
- [PLAN-018: Private Standard/DOM direct-core reference shell](./plans/018-standard-dom-reference-shell.md) — Completed revision 1 after final review 095 cycle 2 repeated all fourteen areas and the full matrix with zero findings
- [PLAN-019: Reusable synchronous Ajv validator](./plans/019-reusable-synchronous-ajv-validator.md) — Completed revision 1 after final review 089 cycle 2 repeated the complete matrix with zero findings
- [PLAN-020: Static advanced presentation layout and Angular Aria pilot](./plans/020-static-advanced-presentation-layout.md) — Completed revision 0 after final review 113 repeated all fourteen areas and 22 rows with zero findings
- [PLAN-021: Coordinated Experimental 0.3 release and Angular Aria pilot](./plans/021-coordinated-experimental-0-3-release.md) — Completed revision 0 after final review 132 cycle 4 repeated the complete release matrix and all 22 SPEC-008 rows with zero findings
- [PLAN-022: Recursive local presentation layout](./plans/022-recursive-local-presentation-layout.md) — Completed revision 0 after final review 144 cycle 3 repeated the complete frozen matrix and all 27 rows with zero findings
- [PLAN-023: Coordinated Experimental M20 delivery](./plans/023-coordinated-experimental-0-4-release.md) — Completed revision 0 after final review 164 cycle 3 repeated the complete release matrix and all 27 SPEC-009 rows with zero findings
- [PLAN-024: Sanitized public repository and secure-release preparation](./plans/024-sanitized-public-repository.md) — Approved revision 0; checkpoints 1–6 are complete after review 173 cycle 4 and checkpoint 7's visibility mutation remains separately gated

Checkpoint reviews: [065](./reviews/065-plan-017-checkpoint-1-review.md),
[066](./reviews/066-plan-017-checkpoint-2-review.md) and
[067](./reviews/067-plan-017-checkpoint-3-review.md), plus
[068](./reviews/068-plan-017-checkpoint-4-review.md) and
[069](./reviews/069-plan-017-checkpoint-5-review.md) each passed cycle 2 with
zero findings; [final review 070](./reviews/070-plan-017-final-implementation-review.md)
passed cycle 1 with zero findings and completed PLAN-017.

Accepted publication architecture:
[ADR-018 revision 6](./adrs/018-licencia-dual-publicacion-experimental.md)
and [ADR-026](./adrs/026-public-repository-and-secure-releases.md) preserve dual
AGPL/commercial licensing and select a sanitized public-history transition.
The repository remains private until PLAN-024 completes its separately gated
work. Completed PLAN-013 published and verified core and Angular `0.1.0`
without promoting Stable APIs.

M1-M13 and G0 are completed, and SPEC-001 v0.1.15 is Accepted. ADR-012 and
PLAN-007 revision 2 govern the completed explicit native field-clearing
increment. ADR-013 and completed PLAN-008 revision 2 govern the private local
`0.1.0` candidates. M8 completed without publication; M9 has accepted normative
contracts. PLAN-009 revision 1 passed its repeated complete review and is
approved and completed after its final zero-finding review. M10 has accepted
normative contracts and completed PLAN-010 revision 0 after its final repeated
zero-finding review. M11 reference-resolution architecture and SPEC-004 v0.1.1
are accepted after complete review passed with zero findings; PLAN-011 revision
0 passed complete review, was approved and completed all five checkpoints after
its final repeated implementation review passed with zero findings. M11 is
complete. M12 implemented the narrow D-042 static-section slice under accepted
ADR-017, SPEC-005 v0.1.1 and completed PLAN-012. Review 098 now promotes only
static root tabs, accordions and logical grid from D-011 for M18 design; its
remainder and all D-012 remain Deferred. ADR-023 revision 1 now fixes that
neutral architecture. Review 100 promoted the narrow D-025 Angular
container-kit slice, and accepted ADR-024 revision 1 fixes its provider seam,
native fallback, isolated theme/package boundary and sole Angular Aria 22 pilot.
SPEC-008 v0.1.0 is Accepted after review 102 cycle 5. PLAN-020 revision 0 and
M18 are complete after reviews 104–113; final review 113 cycle 2 repeated all
fourteen areas and 22 conformance rows with zero findings. The remaining
D-011/D-025 scope, D-012 and other targets remain Deferred; release
implementation and external publication stay separately gated.
Review 114 selects M19 only for the coordinated core/base `0.3.0` plus pilot
`0.1.0` release. ADR-018 revision 4 is Accepted after review 115 cycle 4;
PLAN-021 revision 0 is Approved after review 116 cycle 3. Local checkpoint 1 is
complete after review 117 cycle 2 and checkpoint 2 after review 118 cycle 3;
checkpoint 3 is complete after review 119 cycle 5. Checkpoint 4 Git/clean-build
work is complete after review 120 cycle 3; checkpoint 5 and every registry
write retain separate gates. Checkpoint 5 is complete after review 122 cycle 3:
core `0.3.0` is verified under `next`, while base/pilot and all later writes
remain separately gated. Checkpoint 6 pre-publication review 123 cycle 3 passes;
checkpoint 6 is complete after review 124 cycle 2. Checkpoint 7 pre-publication
review 125 cycle 5 passes and checkpoint 7 completes after review 126 cycle 4.
Core/base `0.3.0` and pilot `0.1.0` are exact under `next`; npm also established
pilot `latest: 0.1.0`, which checkpoint 8 retains without mutation after review
127 cycle 2. Checkpoint 9 pre-transition review 128 cycle 1 passes and the
transition completes after review 129 cycle 1. Base Angular is
`next/latest: 0.3.0`, pilot is `next/latest: 0.1.0`, and core remains
`next: 0.3.0`, `latest: 0.2.0`. Checkpoint 10 pre-transition review 130 cycle 1
passes and the transition completes after review 131 cycle 1. Core/base are
`next/latest: 0.3.0`, pilot is `next/latest: 0.1.0`, and both `latest` and
unqualified consumers pass. Checkpoint 11 and final review 132 cycle 4 repeated
the complete release matrix and all 22 SPEC-008 rows with zero findings,
completing PLAN-021/M19 without authorizing another external action.
SPEC-009 v0.1.0 is Accepted after review 135 cycle 6. PLAN-022 revision 0 and
M20 are complete after reviews 137–144; final review 144 cycle 3 repeated the
frozen full matrix and all 27 rows with zero findings. Dependency, version,
release, Git and external actions remain excluded.
SPEC-006 v0.1.1 now defines the Accepted M14 nullable-leaf contract;
PLAN-014 revision 0 and local M14 implementation are complete after final
review 041 cycle 2 passed with zero findings. Version selection and publication
remain separate.

> Existing ADRs predate SPEC-001 and remain subject to review where they conflict with the controlled runtime specification.
