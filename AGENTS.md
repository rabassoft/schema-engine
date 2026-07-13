# Schema Engine — Agent Instructions

## Project purpose

Schema Engine is a framework-agnostic ecosystem for generating metadata-driven user interfaces.

The first product increment is a controlled dynamic-form runtime based on JSON Schema and UI Schema. Angular is the first reference adapter, but Angular must not own the domain model, validation model, operations, or runtime behavior.

## Sources of truth

Before proposing or implementing architectural changes, read these files in order:

1. `HANDOFF.md`
2. `.ai-docs/specs/001-controlled-form-runtime.md`
3. `.ai-docs/roadmap/deferred-decisions.md`
4. `.ai-docs/adrs/000-index.md` and the relevant ADRs

`SPEC-001` is the current primary source of truth. Existing ADRs predate it and must be treated as subject to review when they conflict with the specification.

## Architectural constraints

- Keep the core independent from Angular, React, Vue, Svelte, RxJS, the DOM, and browser globals.
- Treat the application as the only source of truth for `value` and `baselineValue`.
- Use incremental, strict form operations instead of mutating application state.
- Expose framework-neutral immutable snapshots and subscriptions from the runtime.
- Keep validation implementations replaceable and normalize their results to core contracts.
- Do not make renderers interpret raw JSON Schema; they consume normalized definitions.
- Keep persistence, submit flows, HTTP calls, and saving states outside the runtime.
- Do not implement items listed in `deferred-decisions.md` unless the task explicitly promotes one of them through a SPEC, ADR, or approved implementation plan.
- Do not silently change public contracts or confirmed architectural decisions.

## Working process

For significant architectural or implementation work:

1. Read the relevant specification and ADRs.
2. Identify contradictions, assumptions, and unresolved decisions.
3. Propose the smallest useful implementation or documentation increment.
4. Wait for approval when the task changes architecture or public contracts.
5. Implement only the approved scope.
6. Add unit tests and conformance fixtures.
7. Run formatting, linting, type checking, and tests when those tools exist.
8. Report any conflict between code and documentation.
9. Update the relevant SPEC, ADR, or deferred-decision entry when a decision changes status.

## Current scope restrictions

The initial prototype supports only:

- Root object schemas.
- Primitive fields: `string`, `number`, `integer`, and `boolean`.
- The explicit JSON Schema and UI Schema subset defined in `SPEC-001`.
- Synchronous validation through an external adapter.
- Controlled state ownership.
- Angular with native HTML controls as the first reference adapter.

Do not add nested objects, arrays, schema composition, async validation, optimistic state, advanced layouts, visual builders, plugins, undo/redo, or commercial features in the initial increment.

## Documentation language

Keep code, public API names, diagnostics, and technical identifiers in English. Existing architecture documentation may remain in Spanish unless a task explicitly requests translation.

## Persistent project state

The repository documentation is the persistent project memory.

Before starting any task, read:

1. `.ai-docs/project/STATUS.md`
2. The specification relevant to the task
3. The applicable ADRs
4. `.ai-docs/roadmap/deferred-decisions.md`

`.ai-docs/project/STATUS.md` is the canonical source of truth for the
current project state. Do not infer the current state solely from chat
history or previous agent messages.

## Task lifecycle

At the beginning of a task:

1. Confirm that the requested work is consistent with the current SPECs
   and ADRs.
2. Identify the smallest deliverable that satisfies the request.
3. Update the `In progress` section of `.ai-docs/project/STATUS.md` before
   making substantial changes.
4. Do not activate anything listed in `deferred-decisions.md` without
   explicit approval.

At the end of every task:

1. Run the applicable tests, linting and type checks.
2. Update `.ai-docs/project/STATUS.md` with:
   - latest completed work;
   - current state;
   - exact next action;
   - blockers and open questions;
   - verification performed.
3. Add a dated entry at the top of `.ai-docs/project/WORKLOG.md`.
4. Update `.ai-docs/project/ROADMAP.md` only when a milestone changes.
5. Update a SPEC or ADR when implementation reveals a conflict.
6. Do not mark work as complete when verification fails.
7. Do not commit or push unless explicitly requested.

## Documentation consistency

- Do not duplicate the same status in several documents.
- `STATUS.md` describes the present.
- `WORKLOG.md` records the past.
- `ROADMAP.md` describes planned milestones.
- SPECs define required behavior.
- ADRs explain architectural decisions.
- `deferred-decisions.md` records intentionally postponed decisions.

When two documents conflict, stop and report the conflict rather than
silently choosing one.