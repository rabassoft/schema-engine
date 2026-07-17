# Schema Engine

Framework-agnostic metadata-driven UI ecosystem. The first increment focuses on a controlled dynamic-form runtime using JSON Schema and UI Schema, with Angular and native HTML controls as the reference adapter.

## Start here

- [`AGENTS.md`](./AGENTS.md): persistent instructions for coding agents.
- [Current project status](./.ai-docs/project/STATUS.md): canonical checkpoint,
  active objective, exact next action, and blockers.
- [`HANDOFF.md`](./HANDOFF.md): stable context-recovery procedure.
- [`PROJECT-PHILOSOPHY.md`](.ai-docs/project/PROJECT-PHILOSOPHY.md): Project Philosophy
- [Architecture documentation](./.ai-docs/README.md).

The private development repository contains the completed M1-M13 controlled-form
runtime and verified public Experimental packages. Its G0 review passed;
SPEC-001 v0.1.15, SPEC-002 v0.1.2, SPEC-003 v0.1.2, SPEC-004 v0.1.1, SPEC-005
v0.1.1 and SPEC-006 v0.1.1 are Accepted. SPEC-006 defines the promoted M14
nullable-primitive-leaf contract. The source checkout implements that contract
under completed PLAN-014. PLAN-015 published and verified byte-identical core
and Angular `0.2.0` packages under both `next` and `latest`. M15 completed a
private reference platform without changing those Public packages. The live
checkpoint is recorded in [project status](./.ai-docs/project/STATUS.md).

## Current implementation

`packages/core` exposes the framework-neutral `@rabassoft/schema-engine` API:
compiler, immutable deep operations, controlled runtime, validation contracts,
recursive object/collection/item/leaf snapshots, stable collection operations,
scopes, diagnostics, and text contracts.

`packages/angular` exposes the Angular 22 headless adapter and accessible native
HTML renderers for string, number/integer, boolean, and string enum fields. It
recursively projects normalized inline object groups with semantic fieldsets,
fixed homogeneous collection/item groups and static neutral presentation
sections, with canonical stable IDs and localized text. Its private
primitive-leaf control buffers use Angular Signal Forms
without moving controlled state, validation, identity, or operations out of
the core/application boundary.

The implemented boundary is the root object, recursively nested objects,
primitive leaves and SPEC-003 homogeneous arrays of object items with
application-owned stable string identity. The SPEC-004 subset resolves static
same-document fragment-only `$ref` values into root `$defs` at supported
non-root schema positions. External/dynamic references, anchors, arrays of
primitives, arrays inside collection item templates, tuples, composition,
generated identity, async validation, persistence, advanced layouts beyond the
fixed static section primitive, custom
collection renderers and other deferred decisions are not active.

## Private reference platform

The repository contains a private, non-publishable scenario catalog and an
Angular 22 reference application. They compose only Public package entry points
and provide maintained examples, state/diagnostic inspectors and one Chromium
smoke lane. The application—not the library—owns complete `value` and
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
```

`reference:dev` serves the Angular application at `http://127.0.0.1:4200` and
watches the private catalog/application. Restart it after changing core or the
Angular adapter. The browser command is explicit because Playwright binaries
are local machine state and are never installed by a package lifecycle script.

This reference workspace is not a Public package, hosted product, compatibility
matrix, exhaustive conformance suite, visual baseline or accessibility
certification. Standard/DOM, React, Vue and legacy-Angular shells remain
deferred and must be delivered independently when promoted.

Primitive leaves may additionally use the exact JSON Schema type array
`[primitive, "null"]` or `["null", primitive]`. This remains a closed nullable
leaf capability, not a general union or nullable-container feature. Native
string, number/integer and boolean renderers expose an explicit localized null
intention and confirmed-null status; string enum remains excluded.

Source consumers moving from the published `0.1.0` boundary must make two
coordinated Experimental migrations: every manually authored primitive
definition/template supplies the required boolean `nullable`, and every
manually authored `AngularFieldTextSnapshot` supplies `setNullLabel` and
`nullValueLabel`; exhaustive `FieldTextMember` handling also adds `set-null`
and `null-value`. Schema-compiled consumers do not manually add definition
members. The live `0.1.0` packages remain the immutable pre-M14 release and
must not be treated as containing these source changes.

## Branch workflow

- `main` represents the stable, deployment-ready line.
- `develop` is the integration branch for ongoing development.

## Experimental packages and licensing

Core and Angular `0.2.0` are public and verified on npm. `next` is the
recommended Experimental channel. `latest` aliases the same published
Experimental version; that registry alias does not promote any API to Stable.

Install explicit versions or the Experimental channel:

```sh
npm install @rabassoft/schema-engine@next
npm install @rabassoft/schema-engine-angular@next
```

Prefer `@next` or an explicit version. An unqualified install resolves npm's
mandatory `latest` alias but carries the same Public + Experimental + Active
contract and no support SLA.

Both packages are available under GNU AGPL v3 only (`AGPL-3.0-only`), including
commercial use under its conditions. A separate paid commercial license may be
available for organizations that do not want to comply with AGPL; contact
`ricard@rabassoft.com`. No final commercial terms or support SLA are currently
offered.

The development repository remains private pending a separate sanitization
review. Each package carries its preferred TypeScript source, frozen build
harness, license and notices so its release can be rebuilt without repository
access. The first release cannot truthfully carry npm provenance while the
matching repository is private. External code contributions are not accepted
until a separately reviewed rights policy exists; there is no public issue
tracker yet.
