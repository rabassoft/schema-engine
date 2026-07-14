# Schema Engine — Agent Instructions

## Project purpose

Schema Engine is a framework-agnostic ecosystem for metadata-driven user
interfaces. Its first increment is a controlled dynamic-form runtime based on
JSON Schema and UI Schema. Angular is the first reference adapter, but it must
not own the domain model, validation, operations, or runtime behavior.

## Context-loading workflow

Repository documentation is persistent project memory; chat history is not a
source of truth. At the start of every task:

1. Read `.ai-docs/project/STATUS.md` completely.
2. Read `HANDOFF.md` when orienting in a fresh task or when recovery rules are
   needed; it contains stable guidance, never current status.
3. Inspect `git status --short --branch` and the scoped working-tree diff.
4. Read the task-relevant SPEC sections and any sections explicitly named by
   `STATUS.md`. Read the full SPEC before changing architecture or public
   contracts.
5. Use `.ai-docs/adrs/000-index.md` to select and read only applicable ADRs.
6. Search `.ai-docs/roadmap/deferred-decisions.md` for capabilities or decision
   identifiers touched by the task.
7. Read the active plan sections named by `STATUS.md`. Read the entire plan
   before approving it, changing its contract, or declaring it complete.

Do not read the whole append-only `WORKLOG.md` by default. Read its newest entry
when more detail about the current dirty checkpoint is needed; search historical
entries by identifier, milestone, or date when investigating the past.

`STATUS.md` is the canonical current state. SPEC-001 is the primary behavioral
source of truth. Pre-SPEC ADRs are subject to review when they conflict with it.
When authoritative documents conflict, stop and report the conflict rather than
silently choosing one.

## Architectural constraints

- Keep core independent from Angular, React, Vue, Svelte, RxJS, the DOM, and
  browser globals.
- Treat the application as the only source of truth for `value` and
  `baselineValue`.
- Use incremental strict operations; expose immutable framework-neutral
  snapshots and subscriptions.
- Keep validation replaceable and normalize external results to core contracts.
- Renderers consume normalized definitions, never raw JSON Schema.
- Keep persistence, submit flows, HTTP calls, and saving states outside runtime.
- Do not implement a deferred item unless the task explicitly promotes it
  through a SPEC, ADR, or approved plan.
- Do not silently change public contracts or accepted decisions.

## Current prototype boundary

Only root object schemas; primitive `string`, `number`, `integer`, and `boolean`
fields; the SPEC-001 JSON/UI Schema subset; synchronous external validation;
controlled state; and Angular native HTML controls are in scope.

Do not add nested objects, arrays, composition, async validation, optimistic
state, advanced layouts, visual builders, plugins, undo/redo, or commercial
features to the initial increment.

## Delivery workflow

Before substantial changes:

1. confirm consistency with the relevant SPEC, accepted ADRs, approved plan,
   and deferred boundaries;
2. identify the smallest deliverable;
3. update only the `In progress` section of `STATUS.md`;
4. obtain approval before changing architecture or public contracts.

During implementation, preserve unrelated dirty changes, implement only the
approved scope, add unit tests and conformance fixtures, and report any
code/documentation conflict.

Formal reviews must converge before approval or completion. When a review finds
an error, ambiguity, conflict, or requested change, apply the correction and
repeat the complete applicable review rather than checking only the changed
fragment. Continue correction and full-review cycles until one complete pass
produces zero findings and no unresolved change request. Only that zero-finding
pass may support approval or completion, and its outcome must be recorded in
persistent project state.

At task completion:

1. run applicable formatting, linting, type checks, tests, builds, package
   checks, link checks, and diff checks;
2. compact `STATUS.md` to the present state only: checkpoint, current objective,
   no active task, latest 3–5 completed outcomes, exact next action, blockers,
   open questions, latest verification, and a task-document map;
3. prepend one dated entry to `WORKLOG.md` without rewriting old entries;
4. update `ROADMAP.md` only when a milestone changes;
5. update a SPEC, ADR, plan, or deferred entry only when behavior or decision
   state changes;
6. do not mark work complete when verification fails;
7. do not commit or push unless explicitly requested.

## Document responsibilities

- `STATUS.md`: present, kept compact.
- `WORKLOG.md`: append-only past; targeted reads only.
- `ROADMAP.md`: planned milestones.
- SPECs: required behavior.
- ADRs: architectural decisions.
- Plans: approved delivery contract and checks.
- `deferred-decisions.md`: intentionally postponed work.
- `HANDOFF.md`: stable context-recovery procedure.

Keep code, public APIs, diagnostics, and technical identifiers in English.
Existing architecture documentation may remain in Spanish unless translation is
explicitly requested.
