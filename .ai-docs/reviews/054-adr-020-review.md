# ADR-020 complete review — Cycles 1–3

- **State:** Accepted after cycle 3 passed with zero findings
- **Date:** 17 July 2026
- **Acceptance date:** 17 July 2026
- **Document reviewed:**
  [`ADR-020 revision 0`](../adrs/020-plataforma-referencia-multiframework.md)
- **Authority:** accepted review 053, SPEC-001 through SPEC-006, applicable
  Accepted ADRs, Public package entry points and deferred-decision boundaries
- **Effect:** accepts M15 architecture and authorizes only preparation of
  PLAN-016; no implementation, dependency installation, external action,
  commit or push

## 1. Cycle 1 finding

1. **R054-F001 — formatting:** the initial draft did not pass Prettier.

The file was formatted and the complete review restarted.

## 2. Cycle 2 findings

The repeated complete review found five architecture ambiguities:

1. **R054-F002 — catalog build resolution:** the dependency graph named a
   private catalog package but did not decide whether Angular consumed source
   or built output, nor how development observed catalog changes.
2. **R054-F003 — expected evidence shape:** operation evidence retained only a
   type, and `unknown` values did not distinguish complete roots from patches;
   issue evidence also lacked stable paths.
3. **R054-F004 — validator retention:** freezing the validator object could
   mutate authored input and did not require descriptor-safe ownership of its
   method.
4. **R054-F005 — pending operation semantics:** manually pending mode did not
   define multiple intentions, stale confirmation, scenario changes or the
   D-038 partial-baseline boundary.
5. **R054-F006 — zoneless authority:** “under the already accepted boundary”
   could be read as reviving the pre-SPEC Angular ADR-001 claims rather than
   selecting an application bootstrap option.

The ADR now requires a buildable private ESM catalog consumed through its
Internal built root, topological build plus watch/serve orchestration; exact
metadata-free Public operation shapes, complete controlled roots and stable
issue evidence; a copied validator wrapper from an own data function; explicit
multi-pending/stale/reset/whole-baseline behavior; and a narrow explicit
`provideZonelessChangeDetection()` application choice. The complete review was
restarted.

## 3. Complete review — Cycle 3

### 3.1 Authority and scope — Pass

The decision stays inside review 053's catalog plus first Angular 22 shell.
Standard/DOM, React, Vue, legacy Angular, hosting, repository visibility,
persistence and product work remain inactive. Discovery of a required Public
contract change is an explicit stop condition.

### 3.2 Internal catalog contract and failure behavior — Pass

Stable identities, closed features, compiler input, complete controlled initial
state, deterministic validator, exact operation/issue/state expectations and
neutral explanation are closed. Descriptor-safe copied/frozen JSON-compatible
authoring rejects invalid repository fixtures with one Internal developer error
without becoming a compiler or Public diagnostic contract.

### 3.3 Workspace and dependency enforcement — Pass

Both exact Internal package names are private. The graph is acyclic;
publishable packages cannot import applications; the catalog has only a
type-level core edge; Angular consumes built catalog/core/adapter roots. Build,
watch, deep-import searches, pack exclusion and absence of a new orchestrator
are explicit.

### 3.4 Angular controlled ownership — Pass

The shell owns signals for value, baseline, locale, visibility, selection,
history and decision mode. Public compilation and operation application remain
visible. Confirm, reject, multiple pending records, stale failure, reset,
scenario change and whole-form baseline commit have deterministic semantics;
no controller, persistence or business workflow migrates into a library.

### 3.5 Scenario coverage — Pass

Six stable scenarios cover every capability accepted by SPEC-001 through
SPEC-006 at least once: primitives/enum/clear/control/validation/locale, nested
objects, stable collections, local references, presentation sections and
nullable leaves. They do not claim exhaustive hostile or diagnostic
conformance.

### 3.6 Build-checked snippets and official builder — Pass

Marked non-nested source regions generate one committed module with strict
write/check behavior; framework strings are absent from the catalog. Angular
uses the official application/dev-server builders in a browser-only target,
with no SSR, prerender, hydration, deployment or replacement of package builds.

### 3.7 Browser and accessibility boundary — Pass

One Playwright Chromium lane covers navigation, controlled decisions, state
inspection, representative capabilities, locale, validation and keyboard/
accessible-name behavior. Accessible selectors are primary and shell test IDs
are constrained. Cross-browser, exhaustive, visual and certification claims
are explicitly absent.

### 3.8 Release-evidence isolation — Pass

Workspace integration cannot satisfy package, declaration, tarball, registry
or compatibility evidence. Clean consumers never import the workspace catalog,
and public artifacts exclude applications/snippets/browser output. No version,
publication or compatibility range changes.

### 3.9 Later-shell and deferred boundaries — Pass

Independent acceptance, plan, build and non-claims gate every later shell.
D-026, D-035 and D-043 retain their restart conditions. D-045 remains Deferred
and no pre-19 Angular or widened peer-range claim is made; D-032 persistence and
D-038 partial baseline support remain outside M15.

### 3.10 Verification and authorization — Pass

All nine questions from review 053 are closed without a new SPEC or Public API
decision. Formatting, documentation across 115 Markdown files and 462 local
links, and diff checks passed before accepted-state reconciliation. Acceptance
authorizes only PLAN-016 preparation; implementation and every Git/external
action retain separate gates.

## 4. Result

Cycle 3 has zero findings, unresolved change requests or documentation
conflicts. ADR-020 revision 0 is Accepted on 17 July 2026. PLAN-016 may now be
prepared and completely reviewed within this exact boundary.
