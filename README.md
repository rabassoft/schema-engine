# Schema Engine

Framework-agnostic metadata-driven UI ecosystem. The first increment focuses on a controlled dynamic-form runtime using JSON Schema and UI Schema, with Angular and native HTML controls as the reference adapter.

## Start here

- [`AGENTS.md`](./AGENTS.md): persistent instructions for coding agents.
- [Current project status](./.ai-docs/project/STATUS.md): canonical checkpoint,
  active objective, exact next action, and blockers.
- [`HANDOFF.md`](./HANDOFF.md): stable context-recovery procedure.
- [`PROJECT-PHILOSOPHY.md`](.ai-docs/project/PROJECT-PHILOSOPHY.md): Project Philosophy
- [Architecture documentation](./.ai-docs/README.md).
- [Security reporting](./SECURITY.md),
  [contribution policy](./CONTRIBUTING.md) and
  [Code of Conduct](./CODE_OF_CONDUCT.md).

The repository contains the completed M1-M31 controlled-form ecosystem,
verified public Experimental packages and the sanitized public history,
governance and protected controls completed by PLAN-024. Its G0 review passed;
SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003 v0.1.2, SPEC-004 v0.1.1, SPEC-005
v0.1.1, SPEC-006 v0.1.1, SPEC-007 v0.1.0, SPEC-008 v0.1.0, SPEC-009 v0.1.0,
SPEC-010 v0.1.0, SPEC-011 v0.1.0, SPEC-012 v0.1.0, SPEC-013 v0.1.1,
SPEC-014 v0.1.0, SPEC-015 v0.1.0, SPEC-016 v0.1.1 and SPEC-017 v0.1.0 are
Accepted. SPEC-007
defines the private M17 reusable synchronous Ajv-validator contract. SPEC-011 defines the bounded
M25 primitive-`const` contract; completed PLAN-027 revision 1 implements its
six checkpoints after final review 234 passed with zero findings. Completed
PLAN-028 implements SPEC-012's optional controlled async-validation lifecycle,
Angular forwarding and independent Angular/Standard reference evidence after
final review 244 passed with zero findings. SPEC-013 defines the bounded M27
scope-to-baseline confirmation contract; completed PLAN-029 revision 1
implements its six checkpoints, including Public core/package conformance and
independent Angular/Standard reference evidence, after final review 257 passed
with zero findings. SPEC-014 defines the bounded M28 static object-`allOf`
compiler contract; PLAN-030 revision 0 was approved after review 262 cycle 2 and
all six checkpoints are complete after final review 268 cycle 2 repeated the
full matrix and all 21 rows with zero findings. The
Accepted SPEC-015 defines the bounded M29 explicit schema-default candidate;
completed PLAN-031 revision 0 implements all six checkpoints after final review
278 cycle 2 repeated the complete matrix and all 21 rows with zero findings.
ADR-033 revision 0 and SPEC-016 v0.1.1 now close the bounded M30 ordinary
primitive-field visibility/enabled architecture and observable contract;
Completed PLAN-032 revision 1 implements all seven checkpoints and all 24
SPEC-016 rows after final review 291 cycle 1 repeated the frozen matrix with
zero findings. Bounded D-006/M31 defines one ordered homogeneous array of
unique closed-enum strings controlled atomically as a field. Reviews 292–295
close its promotion, ADR-034, ADR-005 revision 8 and Accepted SPEC-017 v0.1.0
with zero findings. Completed PLAN-033 revision 0 implements all seven
checkpoints and all 26 SPEC-017 rows after final review 303 cycle 2 repeated
the frozen matrix and both Chromium suites with zero findings.
Bounded D-018/M32 compound conditions are the next selected capability.
Accepted ADR-035 revision 0 closes their architecture after review 305 cycle 2
passed with zero findings. Accepted SPEC-018 v0.1.0 closes the observable
contract after review 306 cycle 2. Approved PLAN-034 revision 0 maps all 22
rows exactly once to six ordered checkpoints after review 307 cycle 3 passed
with zero findings. Checkpoint 1 completes Public unions/compiler rows 1–9
after review 308 cycle 2; checkpoint 2 completes manual/runtime rows 10–17
after review 309 cycle 2. Checkpoint 3 completes Angular projection row 18
after review 310 cycle 1. Checkpoint 4 completes shared Standard/browser rows
19–20 after review 311 cycle 2; package/consumer evidence is next.
Package versions and published M23 artifacts remain unchanged.
The
source checkout implements the M14
contract under completed PLAN-014. PLAN-015
published and verified
byte-identical core and Angular `0.2.0` packages under both `next` and `latest`.
M15 completed a private reference platform without changing those Public
packages. M18 and
PLAN-020 revision 0 are complete after final review 113 repeated all fourteen
areas and all 22 SPEC-008 rows with zero findings. SPEC-008 v0.1.0 is Accepted.
SPEC-009 v0.1.0 and completed PLAN-022 extend those static sections, tabs,
accordions and logical grids to direct nested-object and collection-item
template owners. Independent Standard and native Angular projection, the
Angular presentation-container SPI and Angular Aria 22 pilot pass final review
144 across all 27 rows. Broader layout, theming and other targets remain
Deferred.
M19 and PLAN-021 revision 0 are complete after final review 132 repeated the
full workspace, artifact, source, security, registry, consumer and SPEC-008
matrix with zero findings. Core/base `0.3.0` and the Angular Aria pilot `0.1.0`
remain available as the coordinated exact M19 line.
Completed PLAN-023 has published and byte-verified core/base Angular
`0.4.0` plus pilot `0.2.0` under both `next` and `latest`. Exact, `next`,
`latest` and unqualified lower/latest-compatible native/pilot consumers pass;
the aliases remain Experimental routing and do not imply Stable. All three
public artifacts are identical to the clean candidates from private source commit
`07755b4cbe31098f86099db38c65930d52772fb5`.
The live checkpoint is recorded in
[project status](./.ai-docs/project/STATUS.md).

## Current implementation

`packages/core` exposes the framework-neutral `@rabassoft/schema-engine` API:
compiler, immutable deep operations, controlled runtime, validation contracts,
recursive object/collection/item/leaf snapshots, stable collection operations,
scopes, diagnostics, and text contracts.

`packages/angular` exposes the Angular 22 headless adapter and accessible native
HTML renderers for string, number/integer, boolean, scalar string enum, fixed
value and current-source atomic string-enum array fields. It
recursively projects normalized inline object groups with semantic fieldsets,
fixed homogeneous collection/item groups and static root sections, tabs,
accordions and logical grids, with canonical stable IDs and localized text. Its
native presentation hosts are replaceable through the Experimental Angular SPI;
the separate Angular Aria pilot replaces only supported container projection.
Its private
primitive-leaf control buffers use Angular Signal Forms
without moving controlled state, validation, identity, or operations out of
the core/application boundary.

The implemented boundary is the root object, recursively nested objects,
primitive leaves and SPEC-003 homogeneous arrays of object items with
application-owned stable string identity. The SPEC-004 subset resolves static
same-document fragment-only `$ref` values into root `$defs` at supported
non-root schema positions. Static presentation forests are supported at the
root and on direct nested-object and collection-item template owners.
Current unreleased source also supports one strict equality `visibleWhen` and
one `enabledWhen` predicate on ordinary primitive fields. Core derives required
snapshot flags from application-controlled values; Angular and Standard keep
hidden hosts mounted, project disabled controls independently and retain core
as the final inactive-action gate. Collection-template conditions, compound
expressions, dependency graphs and dynamic validation semantics remain
deferred. The required snapshot flags are a coordinated Experimental migration
reserved for a separately approved future MINOR release; public `0.4.1`
artifacts remain unchanged.

Current unreleased source also recognizes one deliberately atomic array field:
a direct or nested homogeneous array whose items are unique strings from a
closed non-empty enum. It preserves missing, present empty and ordered values,
uses ordinary controlled set/remove operations, and is projected independently
as a native multiple selection in Angular and Standard. It is not an M10
collection and exposes no item identity or item operation.

External/dynamic references, anchors, other arrays of primitives, arrays inside
collection item templates, tuples, general composition,
generated identity, async transport/Ajv, persistence, wizards, workflow,
controlled layout state, custom
collection renderers and other deferred decisions are not active.

`packages/validator-ajv` is a completed private, unpublished integration package that
implements the replaceable validation port with Ajv Draft 2020-12. It is used
by the reference shells and does not make Ajv a core dependency. Current source
normalizes the selected semantic string formats `email`, `date` and
`date-time`, asserts them in this replaceable validator and projects
timezone-preserving native controls independently in Angular and Standard.

## Private reference platform

The repository contains a private, non-publishable scenario catalog plus
Angular 22 and Standard/DOM reference applications. They compose only Public package entry points
and provide maintained examples, editable configuration, state/diagnostic
inspectors and independent Chromium smoke lanes. The application—not the library—owns complete `value` and
`baselineValue` roots, locale, validation visibility and every decision to
confirm, reject or defer an emitted operation.

Use Node `22.23.1`, pnpm `10.28.2` and the frozen workspace lockfile:

```sh
pnpm install --frozen-lockfile
pnpm reference:build
pnpm reference:test:unit
pnpm reference:test:boundaries
pnpm exec playwright install chromium
pnpm reference:test:e2e
pnpm reference:dev
pnpm reference:standard:build
pnpm reference:standard:test:unit
pnpm reference:standard:test:e2e
pnpm reference:standard:dev
```

`reference:dev` serves the Angular application at `http://127.0.0.1:4200` and
watches the private catalog/application. Restart it after changing core or the
Angular adapter. `reference:standard:dev` serves the direct-core Standard/DOM
application at `http://127.0.0.1:4211`; its preview and editable schemas are
simultaneous, with observable evidence below. The browser installation command
is explicit because Playwright binaries are local machine state and are never
installed by a package lifecycle script. Each E2E command runs only its named
target and neither substitutes for the other.

This reference workspace is not a Public package, hosted product, compatibility
matrix, exhaustive conformance suite, visual baseline or accessibility
certification. React, Vue and legacy-Angular shells remain deferred and must be
delivered independently when promoted.

Primitive leaves may additionally use the exact JSON Schema type array
`[primitive, "null"]` or `["null", primitive]`. This remains a closed nullable
leaf capability, not a general union or nullable-container feature. Native
string, number/integer and boolean renderers expose an explicit localized null
intention and confirmed-null status; string enum remains excluded.

Source consumers moving from the published `0.1.0` boundary must make two
coordinated Experimental migrations: every manually authored primitive
definition/template supplies the required boolean `nullable`, and every
manually authored `AngularFieldTextSnapshot` supplies `setNullLabel` and
`nullValueLabel`, `fixedMissingLabel`, `fixedUnavailableLabel` and
`fixedIncompatibleLabel`, plus `missingSelectionLabel` and
`emptySelectionLabel`; exhaustive `FieldTextMember` handling also includes
their corresponding members. Manually authored field definitions may now need
to handle `StringEnumArrayFieldDefinition` in exhaustive `FieldDefinition`
switches. Schema-compiled consumers do not manually add definition members.
These coordinated source changes require a separately approved future MINOR;
published packages remain immutable historical releases and must not be
treated as containing unversioned source changes.

## Branch workflow

- `main` represents the stable, deployment-ready line.
- `develop` is the integration branch for ongoing development.

## Experimental packages and licensing

`@rabassoft/schema-engine@0.4.1`,
`@rabassoft/schema-engine-angular@0.4.1` and
`@rabassoft/schema-engine-angular-aria@0.2.1` are public and verified on npm.
Exact, `next`, `latest` and unqualified resolution select this coordinated M23
Experimental line; registry routing does not promote any API to Stable.

Install the verified M23 line from the Experimental channel:

```sh
npm install @rabassoft/schema-engine@next @rabassoft/schema-engine-angular@next @rabassoft/schema-engine-angular-aria@next
```

The coordinated M19 three-package line remains available through explicit
versions:

```sh
npm install @rabassoft/schema-engine@0.3.0 @rabassoft/schema-engine-angular@0.3.0 @rabassoft/schema-engine-angular-aria@0.1.0
```

For M23, prefer exact versions for reproducible installs; coordinated `@next`,
`@latest` and unqualified installs resolve the same reviewed line. Every package
remains Public + Experimental + Active with no support SLA.

The workspace manifests contain M23 source versions `0.4.1`, `0.4.1` and
`0.2.1`; all are public and verified exactly, under `next`/`latest` and through
unqualified resolution. The immutable M21 `0.4.0`/`0.4.0`/`0.2.0` line remains
available through explicit versions. See the
[M23 release notes](./.ai-docs/releases/0.4.1.md) for current routing and
verification.

All three packages are available under GNU AGPL v3 only (`AGPL-3.0-only`), including
commercial use under its conditions. A separate paid commercial license may be
available for organizations that do not want to comply with AGPL; contact
`ricard@rabassoft.com`. No final commercial terms or support SLA are currently
offered.

The sanitized source repository is public at
[`rabassoft/schema-engine`](https://github.com/rabassoft/schema-engine). PLAN-024
has completed its GitHub controls and fail-closed secure-release preparation.
Each package carries its preferred TypeScript source, frozen build harness,
license and notices so its existing release can be rebuilt independently.
Existing M19/M21 versions do not claim repository-backed npm provenance. The
complete M23 line—core/base `0.4.1` and pilot `0.2.1`—is public exactly and
under `next`, with verified OIDC provenance from protected `main@028a98c`.
Exact, `next`, `latest` or unqualified installation now consumes the
coordinated M23 line. Pilot `latest` resolves `0.2.1` and core/base Angular
`latest` resolve `0.4.1`. All lower/current native/pilot consumer lanes pass;
routing remains Experimental and does not imply Stable.

Issues may be used for non-code feedback. External code contributions are not
accepted until a separately reviewed rights policy exists; see
[CONTRIBUTING.md](./CONTRIBUTING.md). Security reports follow
[SECURITY.md](./SECURITY.md) and must not be opened publicly.
