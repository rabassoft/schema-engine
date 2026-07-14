# Schema Engine

Framework-agnostic metadata-driven UI ecosystem. The first increment focuses on a controlled dynamic-form runtime using JSON Schema and UI Schema, with Angular and native HTML controls as the reference adapter.

## Start here

- [`AGENTS.md`](./AGENTS.md): persistent instructions for coding agents.
- [Current project status](./.ai-docs/project/STATUS.md): canonical checkpoint,
  active objective, exact next action, and blockers.
- [`HANDOFF.md`](./HANDOFF.md): stable context-recovery procedure.
- [`PROJECT-PHILOSOPHY.md`](.ai-docs/project/PROJECT-PHILOSOPHY.md): Project Philosophy
- [Architecture documentation](./.ai-docs/README.md).

The repository contains the completed M1-M8 controlled-form prototype and
private local release candidates. Its G0 review passed, SPEC-001 v0.1.15 and
SPEC-002 v0.1.2 are Accepted, and PLAN-009 is implementing the approved M9
nested-object extension. The remaining sequence is recorded in the
[roadmap](./.ai-docs/project/ROADMAP.md).

## Current implementation

`packages/core` exposes the framework-neutral `@rabassoft/schema-engine` API:
compiler, immutable deep operations, controlled runtime, validation contracts,
recursive object/leaf snapshots, scopes, diagnostics, and text contracts.

`packages/angular` exposes the Angular 22 headless adapter and accessible native
HTML renderers for string, number/integer, boolean, and string enum fields. It
recursively projects normalized inline object groups with semantic fieldsets,
canonical IDs and localized object text. Its private control buffers use
Angular Signal Forms without moving controlled state, validation, or operations
out of the core/application boundary.

The implemented boundary is the root object plus recursively nested inline
objects and primitive leaves defined by SPEC-001 v0.1.15 and SPEC-002 v0.1.2.
Arrays, references, composition, async validation, persistence, advanced
layouts, custom object containers, and other registered deferred decisions are
not active.

## Branch workflow

- `main` represents the stable, deployment-ready line.
- `develop` is the integration branch for ongoing development.

Both packages are private local candidates at version `0.1.0`. No publication,
external distribution, license, registry write, or deployment automation is
configured or authorized.
