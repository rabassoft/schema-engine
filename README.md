# Schema Engine

Framework-agnostic metadata-driven UI ecosystem. The first increment focuses on a controlled dynamic-form runtime using JSON Schema and UI Schema, with Angular and native HTML controls as the reference adapter.

## Start here

- [`AGENTS.md`](./AGENTS.md): persistent instructions for coding agents.
- [`HANDOFF.md`](./HANDOFF.md): current project state and next approved task.
- [`PROJECT-PHILOSOPHY.md`](.ai-docs/project/PROJECT-PHILOSOPHY.md): Project Philosophy
- [Architecture documentation](./.ai-docs/README.md).

The repository contains the completed M1 compiler increment and its architecture documentation. The controlled runtime and framework adapters are not implemented yet. Implementation must follow the approved specifications, ADRs, and plans.

## Current implementation

`packages/core` exposes the framework-neutral `@rabassoft/schema-engine` API,
including `compileFormDefinition()` and the normalized compiler contracts.

The compiler currently supports only the root-object and primitive-field subset
defined in SPEC-001 and ADR-005.

## Branch workflow

- `main` represents the stable, deployment-ready line.
- `develop` is the integration branch for ongoing development.

No deployment automation is configured yet.
