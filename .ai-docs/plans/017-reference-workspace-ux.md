# PLAN-017: Reference workspace UX and configuration laboratory

- **Status:** Completed revision 0
- **Date:** 2026-07-17
- **Approval date:** 2026-07-17
- **Completion date:** 2026-07-17
- **Complete review:**
  [`review 064`](../reviews/064-plan-017-review.md) cycle 3 passed all twelve
  areas with zero findings after two corrections
- **Implementation authorized:** Yes — checkpoints 1–6 only; the exact
  dependency installation remains a separate execution gate
- **Final implementation review:**
  [`review 070`](../reviews/070-plan-017-final-implementation-review.md) cycle 1
  passed the complete repeated review and verification matrix with zero
  findings
- **Implementation state:** Checkpoints 1–6 completed after
  [`review 065`](../reviews/065-plan-017-checkpoint-1-review.md) and
  [`review 066`](../reviews/066-plan-017-checkpoint-2-review.md), plus
  [`review 067`](../reviews/067-plan-017-checkpoint-3-review.md) and
  [`review 068`](../reviews/068-plan-017-checkpoint-4-review.md) and
  [`review 069`](../reviews/069-plan-017-checkpoint-5-review.md) cycle 2 each
  passed with zero findings and final review 070 cycle 1 closed the plan
- **Requires:** Completed
  [`PLAN-016 revision 0`](./016-private-reference-platform.md), Accepted
  [`ADR-020 revision 0`](../adrs/020-plataforma-referencia-multiframework.md),
  Accepted SPEC-001 through SPEC-006 and applicable Accepted ADRs
- **Boundary:** post-M15 maintenance of the private Angular 22 reference shell;
  no deferred capability is promoted

## 1. Goal and authorization boundary

Improve the private Angular reference application as an understandable,
accessible configuration laboratory without changing Schema Engine product
contracts. The iteration shall:

1. replace the crowded linear presentation with a responsive workspace of
   semantic cards and two accessible tab sets;
2. keep the rendered form and operation decision visible while users inspect
   or edit supporting information;
3. use redundant semantic accents and JSON syntax highlighting to distinguish
   configuration, state, runtime, diagnostics and successful validation;
4. let users edit, validate, apply, cancel and restore JSON Schema and UI Schema
   safely; and
5. correct scenario reset so shell-owned collection draft inputs are restored
   with the rest of application state.

Only `apps/reference-angular`, its private manifest, the root lockfile and the
root/private verification or documentation directly required by this UX work
are in scope. No Public source, declaration, manifest, export, package,
operation, diagnostic, runtime contract, version or release may change.

Approval of this document would authorize checkpoints 1–6 only. The exact
dependency installation in section 3 remains a separately confirmed external
execution gate. Git, push, publication, repository settings, hosting and
deployment always require separate authorization.

## 2. Architectural interpretation

The workspace tabs are Angular application navigation. They do not implement
UI Schema tabs, grids, accordions, responsive-layout metadata or declarative
scopes. D-011 and D-012 remain Deferred.

An applied schema change does not update an existing `FormDefinition` or
runtime. In accordance with SPEC-001 section 8 and deferred D-013, the
application recompiles the complete input, destroys the mounted form runtime
and creates a fresh one. The editor is a consumer of the existing Public
`compileFormDefinition()` contract and cannot add compilation rules or
reinterpret diagnostics.

The selected catalog scenario remains immutable authority for its title,
explanation, validator and original compile input/initial state. Editable and
applied configuration is local ephemeral application state. It is never
written back to the catalog, filesystem, browser storage, URL, network or
backend.

## 3. Exact editor dependency and private boundary

After plan approval and a separate network/lockfile gate, checkpoint 1 may run
only:

```sh
pnpm --filter @schema-engine-internal/reference-angular add --save-exact \
  codemirror@6.0.2 @codemirror/lang-json@6.0.2
```

Both packages are MIT-licensed CodeMirror 6 modules. They belong only to the
private Angular application's `dependencies`; no Angular wrapper package is
added. The lockfile mutation must contain only the selected exact packages and
their resolved transitive graph.

An Internal standalone `ReferenceJsonEditorComponent` owns one CodeMirror
`EditorView`, configures JSON language support and destroys it with the Angular
lifecycle. It exposes only application-local inputs/outputs, labels its editing
surface for assistive technology and never enters a public package, catalog or
snippet contract. The application shall not implement a parallel JSON parser,
schema validator or compiler inside the editor.

## 4. Information architecture and responsive behavior

The page shall have these stable regions:

1. **Scenario header:** title, summary, scenario selector and compact current
   state. Scenario explanation remains discoverable without dominating the
   initial viewport.
2. **Operation decision:** confirm, reject and pending controls remain visible
   beside the form because they change interaction semantics.
3. **Form preview:** the selected `schemaForm`, collection controls and pending
   intentions remain visible while either tab set changes.
4. **Configuration card:** one tab set with `Controls`, `Schema` and
   `UI Schema`.
5. **Evidence card:** one tab set with:
   - `State`: value and baseline value;
   - `Definition`: normalized definition;
   - `Runtime`: runtime snapshot and operation history;
   - `Diagnostics`: compiler diagnostics, runtime diagnostics and validation
     issues; and
   - `Integration`: build-checked excerpts.

At wide viewports, preview and supporting workspace use a balanced two-column
grid with a useful sticky supporting column only when it does not obscure
content or keyboard focus. At narrow viewports they become one column. Tab
labels may wrap or scroll horizontally without clipping, reordering or hiding
focus. No information is available only through hover.

The current ten `details` inspectors may be simplified within their semantic
tab panels, but serialization stays deterministic and long content remains
keyboard-scrollable. Existing shell-owned stable test IDs may be retained or
mapped explicitly; tests must not couple to private adapter DOM.

## 5. Visual language and accessibility

Define application-local design tokens for surface, text, border, focus and
semantic accents. The categories are:

| Category      | Accent intent                    | Required non-color cue                 |
| ------------- | -------------------------------- | -------------------------------------- |
| Configuration | blue/violet                      | heading and configuration icon/label   |
| State         | cyan/blue                        | `State` heading and value labels       |
| Runtime       | amber                            | `Runtime` heading and operation labels |
| Diagnostic    | red for error, amber for warning | severity word, code and message        |
| Success       | green                            | explicit `Valid` status text           |

Colors must meet WCAG 2.2 AA contrast for normal text and visible component
boundaries in the supported light theme. Color is never the only carrier of
meaning. Focus indicators remain at least as visible as the current shell.

Each tab set uses the WAI-ARIA tabs pattern:

- one labelled `tablist`, button elements with `role="tab"`, unique IDs,
  `aria-selected`, `aria-controls` and roving `tabindex`;
- associated labelled `tabpanel` elements; inactive panels are absent or
  hidden consistently and cannot receive focus;
- Left/Right Arrow move focus and activate the adjacent tab, Home/End select
  the first/last tab, and focus does not escape the current tab list; and
- switching tabs never resets editors, the selected scenario, form state or
  another tab set's independent selection.

The CodeMirror theme must provide syntax distinctions for JSON keys, strings,
numbers, booleans and null with equivalent legibility at normal and high zoom.
The editor has an accessible name (`JSON Schema editor` or `UI Schema editor`),
visible instructions, line numbers and a keyboard path to every adjacent
action. The plan makes no accessibility-certification claim.

## 6. Configuration state model

The component owns these conceptual states per selected scenario:

```text
original input     immutable catalog compileInput
active input       last successfully applied input
draft text         independent pretty JSON strings for schema and UI Schema
draft result       unvalidated | invalid-json | compile-failed | valid
runtime epoch      identity used to destroy/recreate the mounted form
```

Scenario selection:

1. compiles the scenario's original input;
2. copies it into active application state without mutating or retaining an
   editor-owned object in the catalog;
3. initializes both drafts with deterministic two-space JSON formatting;
4. represents an absent UI Schema as `{}`, which is equivalent under the
   Accepted compiler contract; and
5. restores the scenario's original value, baseline, locale, visibility,
   decision mode, collection drafts, diagnostics and operation history.

Any editor change marks the corresponding draft modified and clears its prior
validated status. Draft status is derived from exact current text, not from a
stale successful result.

### 6.1 Validate

`Validate configuration` performs these stages without changing active input,
runtime, value, baseline or history:

1. `JSON.parse` each current draft independently;
2. on a syntax failure, show an application-owned syntax diagnostic associated
   with the relevant document and skip compilation;
3. otherwise call `compileFormDefinition({ schema, uiSchema })` exactly once;
4. display the returned Public diagnostics unchanged; and
5. mark the exact current draft pair `Valid` only when compilation succeeds.

Warnings remain visible and do not block a successful result. The shell's JSON
syntax failure representation uses the stable application-owned summary
`Invalid JSON syntax.` plus optional parser detail; it is not a new Public
`Diagnostic` code. `Valid` means syntactically valid JSON accepted by the
Schema Engine compiler's documented subset. It does not claim full JSON Schema
meta-schema validation or standards conformance.

### 6.2 Apply

`Apply configuration` always parses and compiles the current text again; it
must not trust an earlier validation after further edits. On failure it behaves
like Validate and leaves the active form untouched. If the form is modified or
has pending/history entries, the first successful attempt opens an inline,
focusable confirmation that states exactly which application state will be
reset. `Apply and reset form` performs a fresh parse and compile of the exact
current texts; any intervening editor change dismisses the confirmation. Native
modal browser dialogs are not used. A confirmed success performs one
application transition that:

1. installs freshly parsed schema/UI Schema objects as active application
   input and preserves compiler warnings for inspection;
2. increments a render epoch and proves the prior `SchemaFormDirective` and
   runtime are destroyed before a fresh form mounts;
3. restores the selected scenario's original value, baseline, locale and
   validation visibility because the application has no approved generic
   schema-to-value reconciliation policy;
4. resets decision mode, pending intentions, history, runtime diagnostics and
   collection drafts; and
5. keeps both editor texts as the now-clean applied baseline.

The form configuration and application validator receive `activeInput.schema`,
never the catalog's original schema after an edit is applied. If the original
scenario value is invalid under the edited schema, ordinary validation issues
remain visible; the shell does not invent defaults or migrate values.

Catalog validators are scenario-authored demonstrations, not general JSON
Schema validators, and several intentionally do not interpret their schema
argument. The Evidence tab therefore labels their output `Scenario validation
issues` and, whenever active input differs from the original, states that these
issues demonstrate the selected scenario's validation port rather than proving
conformance to the edited schema. PLAN-017 does not add Ajv or another validator.

### 6.3 Cancel and restore

`Cancel changes` replaces both draft texts with deterministic serialization of
the active input and clears draft-only syntax/compiler feedback. It does not
change or recreate the active form.

`Restore scenario configuration` recompiles the immutable original input and,
on the catalog invariant of successful compilation, atomically makes it active,
restores both original editor texts and performs the same complete runtime and
application-state reset as Apply. When active configuration, drafts or form
state differ from the original scenario, an inline confirmation names the
configuration and application state that will be discarded. This action is
distinct from `Reset scenario`.

`Reset scenario` retains the currently applied schema/UI Schema and runtime
definition, restores the scenario's original controlled value/baseline and
shell controls, resets collection draft ID/name to their declared defaults,
and clears operation state. It does not discard un-applied editor text. The UI
must explain these distinct scopes and disable actions that cannot currently
have an effect. `Cancel changes` is disabled when drafts equal active input;
`Apply configuration` is disabled when they do; and Restore is disabled when
active input and both drafts already represent the original configuration.

## 7. Diagnostic interaction

The configuration panel displays one summary status plus a deterministic list
of syntax or Public compiler diagnostics. Each row shows severity, code or
`JSON syntax`, message and available document/data path. Public diagnostic
objects and ordering are not rewritten.

Selecting a syntax diagnostic focuses the corresponding editor. Selecting a
compiler diagnostic focuses the relevant Schema or UI Schema editor and, only
when a deterministic source range can be derived from the current parsed JSON,
moves the selection to that range. Otherwise it focuses the document without a
false line/column claim. No dependency on private compiler internals or changed
Public diagnostic paths is permitted.

Existing runtime diagnostics and scenario validation issues stay in the
Evidence `Diagnostics` tab and remain distinct from draft-configuration
feedback.

## 8. Checkpoints

### Checkpoint 1 — Dependency and Internal primitives

1. Pass the separate dependency-install gate and run the exact command in
   section 3.
2. Inspect the private manifest/lockfile diff and license metadata; reject
   floating versions, public-package dependency drift or unrelated upgrades.
3. Add Internal tab and JSON-editor presentation components with deterministic
   lifecycle cleanup, accessible labels and no catalog/Public imports beyond
   existing package-root compiler types used by the parent application.
4. Add focused lifecycle, output and keyboard tests.

Gate: frozen install, private typecheck/unit test/build, boundary verification,
format and diff checks pass; Public manifests and artifacts are unchanged.

### Checkpoint 2 — Workspace structure and visual system

1. Introduce semantic tokens, cards and responsive preview/supporting layout.
2. Add independent Configuration and Evidence tab sets with the exact grouping
   and keyboard model in sections 4–5.
3. Keep scenario, decision, form, collection and pending controls accessible
   while reducing initial vertical expansion.
4. Preserve deterministic inspector serialization and build-checked excerpt
   provenance.

Gate: strict templates, component tests, production build and focused browser
tests pass at representative narrow/wide viewports with keyboard navigation,
visible focus and no content clipping.

### Checkpoint 3 — Draft, validation and application state

1. Add original/active/draft/result/epoch state without modifying catalog
   objects.
2. Implement exact Validate, Apply, Cancel, Restore and scenario-selection
   transitions from section 6.
3. Route form config and scenario validation through active schema state.
4. Prove failed parse/compile is non-mutating, destructive-state confirmation
   cannot use a stale draft, and successful Apply replaces the runtime rather
   than reconciling it.

Gate: unit tests cover every transition, stale-validation prevention, warning
success, compiler failure, object identity and runtime teardown/recreation;
all six original scenarios still compile and mount.

### Checkpoint 4 — Diagnostics and reset correction

1. Add labelled draft status and syntax/compiler diagnostic presentation with
   safe document focus behavior.
2. Keep configuration diagnostics distinct from runtime/validation evidence.
3. Correct `loadScenario()` and `resetScenario()` to restore collection draft
   ID/name; verify visible input values, not only signals.
4. Explain Reset, Cancel and Restore scopes and disable no-effect actions.
5. Label the existing scenario validator honestly for original and edited
   inputs without changing its function or result.
6. Prove inline Apply/Restore confirmation has correct focus entry, cancellation
   and focus return and is dismissed by intervening edits.

Gate: unit and Chromium tests prove diagnostic routing, invalid drafts,
cancel/restore behavior, successful apply and the complete collection-draft
reset regression.

### Checkpoint 5 — Full UX, accessibility and isolation regression

1. Exercise all six scenarios, both tab sets, keyboard navigation, editor
   actions, operation modes, inspectors and reset behavior in Chromium.
2. Run narrow/wide viewport checks, 200% zoom/reflow inspection and semantic
   contrast/focus review without claiming certification.
3. Update stale component/E2E selectors to shell-owned roles/names/test IDs and
   retain the prohibition on private renderer DOM coupling.
4. Prove snippets and Public source/manifests/exports/versions/artifacts remain
   unchanged.

Gate: formatting, docs, lint, types, all unit/tooling tests, reference build,
snippets, boundaries, Chromium and existing package/artifact/source/security/
consumer checks pass. `git diff --check`, scoped diff and forbidden-drift
searches have zero findings.

### Checkpoint 6 — Final repeated implementation review

Review the complete authority, dependency, UI, state machine, diagnostics,
accessibility, runtime-replacement, reset, tests, isolation, documentation and
diff from the beginning. Correct every finding and repeat the complete review
and verification matrix until one pass has zero findings. Only then mark
PLAN-017 complete and return STATUS to no active task.

## 9. Required evidence matrix

| Area                    | Required evidence                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| Private boundary        | dependency/component/app changes cannot enter Public manifests, declarations, exports or artifacts           |
| Tabs                    | roles, relationships, roving focus, arrows, Home/End, independent selection and hidden-panel focus isolation |
| Responsive layout       | useful narrow/wide layout, keyboard reachability, long JSON and 200% reflow without clipping                 |
| Semantic presentation   | redundant labels/status, AA contrast review, visible focus and no color-only meaning                         |
| Editor lifecycle        | one editor view per host, controlled text changes, cleanup and accessible name/instructions                  |
| Draft state             | modified/current validation identity, no stale validation reuse and deterministic serialization              |
| Validation              | independent JSON parsing, one Public compile call, exact diagnostic preservation and non-mutating failure    |
| Apply                   | fresh compile, loss confirmation, active input, new runtime epoch and full application reset                 |
| Cancel/Restore/Reset    | three distinct scopes, confirmation/focus, no-effect disabling and collection draft regression proof         |
| Active schema ownership | form config and validator use active schema; catalog originals stay immutable                                |
| Diagnostics             | syntax/compiler/runtime/scenario-validation separation, edited-schema caveat and honest focus/range behavior |
| Existing behavior       | six scenarios, decisions, collections, inspectors and snippets remain functional                             |
| Release isolation       | unchanged Public source, manifests, exports, versions, package inventories and clean consumers               |

## 10. Full verification sequence

After each checkpoint run focused tests plus `git diff --check`. Before
completion run in dependency order:

1. `pnpm install --frozen-lockfile`;
2. `pnpm format:check` and `pnpm docs:check`;
3. `pnpm lint` and `pnpm typecheck`;
4. `pnpm test` and focused editor/tab/application tests;
5. `pnpm reference:snippets:check`, `pnpm reference:build` and
   `pnpm reference:test:boundaries`;
6. `pnpm reference:test:e2e` with the existing installed Chromium;
7. `pnpm test:package`, `pnpm test:artifacts`, `pnpm test:source`,
   `pnpm audit:release` and `pnpm test:consumer:clean`;
8. Public dependency/export/version/package-member and private-import drift
   searches; and
9. full diff, status and persistent-document reconciliation.

No live npm/tag test is required because this plan changes no package version
or registry state.

## 11. Documentation and persistent state

At each completed checkpoint, update only current STATUS and prepend one
checkpoint entry to WORKLOG. Update root/reference onboarding only when the
commands or observable private application workflow actually change. ROADMAP,
SPECs, ADRs and deferred decisions do not change because this maintenance plan
promotes no milestone or product capability.

The final exact next action after a completed PLAN-017 returns to choosing a
concrete demand-backed deferred capability for promotion-readiness review.

## 12. Stop conditions

Stop and require a new decision if work needs:

- any Public contract, source behavior, package, export, version, diagnostic or
  compiler/runtime change;
- UI Schema-owned tabs/layouts/scopes, a framework-neutral editor/controller or
  promotion of D-011, D-012 or D-013;
- schema/value migration, generated defaults or preservation/reconciliation of
  the old runtime across Apply;
- editor persistence, autosave, file access, URL sharing, backend/network
  validation, collaboration or execution of authored code;
- another framework shell, legacy Angular family, SSR, hosting, deployment, CI,
  publication or repository visibility;
- a dependency or lockfile graph beyond the exact separately approved command;
- destructive/external action, Git commit or push without its own approval; or
- an authoritative documentation conflict or verification failure that cannot
  be corrected inside this plan.

Ricard explicitly approved PLAN-017 revision 0 on 17 July 2026. Checkpoints 1–6
are authorized, but the exact dependency installation, Git and any Public or
external mutation retain their stated separate gates.
