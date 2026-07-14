# Schema Engine

Framework-agnostic metadata-driven UI ecosystem. The first increment focuses on a controlled dynamic-form runtime using JSON Schema and UI Schema, with Angular and native HTML controls as the reference adapter.

## Start here

- [`AGENTS.md`](./AGENTS.md): persistent instructions for coding agents.
- [Current project status](./.ai-docs/project/STATUS.md): canonical checkpoint,
  active objective, exact next action, and blockers.
- [`HANDOFF.md`](./HANDOFF.md): stable context-recovery procedure.
- [`PROJECT-PHILOSOPHY.md`](.ai-docs/project/PROJECT-PHILOSOPHY.md): Project Philosophy
- [Architecture documentation](./.ai-docs/README.md).

The repository contains the completed M1-M11 controlled-form runtime and private
local release candidates. Its G0 review passed; SPEC-001 v0.1.15, SPEC-002
v0.1.2, SPEC-003 v0.1.2 and SPEC-004 v0.1.1 are Accepted. PLAN-011 revision 0
implemented same-document local reference resolution; all five checkpoints and
the repeated final review are complete with zero findings. The live checkpoint
is recorded in
[project status](./.ai-docs/project/STATUS.md).

## Current implementation

`packages/core` exposes the framework-neutral `@rabassoft/schema-engine` API:
compiler, immutable deep operations, controlled runtime, validation contracts,
recursive object/collection/item/leaf snapshots, stable collection operations,
scopes, diagnostics, and text contracts.

`packages/angular` exposes the Angular 22 headless adapter and accessible native
HTML renderers for string, number/integer, boolean, and string enum fields. It
recursively projects normalized inline object groups with semantic fieldsets,
fixed homogeneous collection/item groups, canonical stable IDs and localized
text. Its private primitive-leaf control buffers use Angular Signal Forms
without moving controlled state, validation, identity, or operations out of
the core/application boundary.

The implemented boundary is the root object, recursively nested objects,
primitive leaves and SPEC-003 homogeneous arrays of object items with
application-owned stable string identity. The SPEC-004 subset resolves static
same-document fragment-only `$ref` values into root `$defs` at supported
non-root schema positions. External/dynamic references, anchors, arrays of
primitives, arrays inside collection item templates, tuples, composition,
generated identity, async validation, persistence, advanced layouts, custom
collection renderers and other deferred decisions are not active.

## Branch workflow

- `main` represents the stable, deployment-ready line.
- `develop` is the integration branch for ongoing development.

Both packages are private local candidates at version `0.1.0`. No publication,
external distribution, license, registry write, or deployment automation is
configured or authorized.
