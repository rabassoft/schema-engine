# Architecture Documentation

## Project state

- [Current status](./project/STATUS.md) — canonical present-tense checkpoint.
- [Roadmap](./project/ROADMAP.md) — completed milestones and proposed future
  sequence.
- [Stable handoff](../HANDOFF.md) — context-recovery procedure, never current
  status.
- [Work log](./project/WORKLOG.md) — append-only history; read selectively.
- [Coordinated Experimental 0.2.0 release notes](./releases/0.2.0.md) — selected
  clean candidate state and source migration; not published.

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
  findings; Approved PLAN-014 revision 0 authorizes checkpoints 1–6 only.
- [SPEC-007 v0.1.0: Reusable Synchronous Ajv Validator](./specs/007-synchronous-ajv-validator.md)
  — Accepted after review 084 cycle 1; completed PLAN-019 revision 1 delivers a
  private reusable Ajv integration for Angular and Standard.

## Acceptance reviews

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
- [ADR-018 complete review — Cycles 1–4](./reviews/028-adr-018-review.md) — Six
  normative/closing-state findings were corrected; cycle 4 passed the complete
  closing review with zero findings and ADR-018 revision 1 was accepted.
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
- [PLAN-018 review](./reviews/077-plan-018-review.md)
  — Cycle 1 approves seven Standard/DOM delivery checkpoints with zero findings;
  dependency/browser execution gates remain separate.
- [PLAN-018 checkpoint 1 review](./reviews/078-plan-018-checkpoint-1-review.md)
  — Cycle 2 passes the private Vite skeleton, catalog watch, strict boundaries
  and Angular/Public regression after correcting Vite CSS module types.
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

## Architecture Decision Records

- [ADR index](./adrs/000-index.md)
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
  delivery.

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
- [PLAN-015: Coordinated Experimental 0.2 release](./plans/015-coordinated-experimental-0-2-release.md) — Approved revision 0 for local checkpoints 1–3 after review 042 cycle 2 passed with zero findings
- [PLAN-016: Private reference platform and Angular 22 shell](./plans/016-private-reference-platform.md) — Completed revision 0 after final review 063 cycle 2 passed with zero findings
- [PLAN-017: Reference workspace UX and configuration laboratory](./plans/017-reference-workspace-ux.md) — Completed revision 0 after final review 070 cycle 1 repeated the complete implementation and verification matrix with zero findings
- [PLAN-018: Private Standard/DOM direct-core reference shell](./plans/018-standard-dom-reference-shell.md) — Approved revision 0 after review 077 cycle 1 passed twelve areas with zero findings; checkpoint 1 awaits its dependency gate

Checkpoint reviews: [065](./reviews/065-plan-017-checkpoint-1-review.md),
[066](./reviews/066-plan-017-checkpoint-2-review.md) and
[067](./reviews/067-plan-017-checkpoint-3-review.md), plus
[068](./reviews/068-plan-017-checkpoint-4-review.md) and
[069](./reviews/069-plan-017-checkpoint-5-review.md) each passed cycle 2 with
zero findings; [final review 070](./reviews/070-plan-017-final-implementation-review.md)
passed cycle 1 with zero findings and completed PLAN-017.

Accepted publication architecture: [ADR-018 revision 3](./adrs/018-licencia-dual-publicacion-experimental.md)
selects dual AGPL/commercial licensing and public Experimental packages while
keeping the repository private pending sanitization. Completed PLAN-013
published and verified core and Angular `0.1.0` without promoting Stable APIs.

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
ADR-017, SPEC-005 v0.1.1 and completed PLAN-012; D-011/D-012 remain Deferred
outside it. SPEC-006 v0.1.1 now defines the Accepted M14 nullable-leaf contract;
PLAN-014 revision 0 and local M14 implementation are complete after final
review 041 cycle 2 passed with zero findings. Version selection and publication
remain separate.

> Existing ADRs predate SPEC-001 and remain subject to review where they conflict with the controlled runtime specification.
