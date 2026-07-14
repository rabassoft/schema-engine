# Schema Engine

Framework-agnostic metadata-driven UI ecosystem. The first increment focuses on a controlled dynamic-form runtime using JSON Schema and UI Schema, with Angular and native HTML controls as the reference adapter.

## Start here

- [`AGENTS.md`](./AGENTS.md): persistent instructions for coding agents.
- [Current project status](./.ai-docs/project/STATUS.md): canonical checkpoint,
  active objective, exact next action, and blockers.
- [`HANDOFF.md`](./HANDOFF.md): stable context-recovery procedure.
- [`PROJECT-PHILOSOPHY.md`](.ai-docs/project/PROJECT-PHILOSOPHY.md): Project Philosophy
- [Architecture documentation](./.ai-docs/README.md).

The repository contains the completed M1-M7 controlled-form prototype and M8
private local release candidates. Its G0 review passed and SPEC-001 v0.1.15 is
Accepted. ADR-012/PLAN-007 govern explicit native field clearing, while
ADR-013/PLAN-008 govern verified `0.1.0` tarballs without publication. The
remaining sequence is recorded in the [roadmap](./.ai-docs/project/ROADMAP.md).

## Current implementation

`packages/core` exposes the framework-neutral `@rabassoft/schema-engine` API:
compiler, immutable root operations, controlled runtime, validation contracts,
snapshots, scopes, diagnostics, and text contracts.

`packages/angular` exposes the Angular 22 headless adapter and accessible native
HTML renderers for string, number/integer, boolean, and string enum fields. Its
private control buffers use Angular Signal Forms without moving controlled
state, validation, or operations out of the core/application boundary.

The implemented boundary remains the root-object and primitive-field subset in
SPEC-001 v0.1.15. Nested objects, arrays, composition, async validation,
persistence, advanced layouts, and other registered deferred decisions are not
active.

## Branch workflow

- `main` represents the stable, deployment-ready line.
- `develop` is the integration branch for ongoing development.

Both packages are private local candidates at version `0.1.0`. No publication,
external distribution, license, registry write, or deployment automation is
configured or authorized.
