# Schema Engine

Framework-agnostic metadata-driven UI ecosystem. The first increment focuses on a controlled dynamic-form runtime using JSON Schema and UI Schema, with Angular and native HTML controls as the reference adapter.

## Start here

- [`AGENTS.md`](./AGENTS.md): persistent instructions for coding agents.
- [Current project status](./.ai-docs/project/STATUS.md): canonical checkpoint,
  active objective, exact next action, and blockers.
- [`HANDOFF.md`](./HANDOFF.md): stable context-recovery procedure.
- [`PROJECT-PHILOSOPHY.md`](.ai-docs/project/PROJECT-PHILOSOPHY.md): Project Philosophy
- [Architecture documentation](./.ai-docs/README.md).

The repository contains the completed M1-M6 controlled-form prototype. Its G0
review passed and SPEC-001 v0.1.15 is Accepted. ADR-012 defines the approved M7
boundary, but PLAN-007 and implementation have not started; the remaining
M8-M12 sequence is recorded in the
[roadmap](./.ai-docs/project/ROADMAP.md) and requires separate approval.

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

Both packages remain private at version `0.0.0`. No publication or deployment
automation is configured yet.
