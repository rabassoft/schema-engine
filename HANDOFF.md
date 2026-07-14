# Schema Engine — Stable Handoff

This document is the stable orientation map for a new contributor or Codex
task. It deliberately does not repeat the current objective, completed work,
revision, version, or verification results. Read
`.ai-docs/project/STATUS.md` for that live checkpoint.

## Recover project context

1. Read `AGENTS.md` for operating rules and architectural constraints.
2. Read `.ai-docs/project/STATUS.md` completely. It is intentionally compact
   and identifies the exact next action, active documents, blockers, open
   questions, and latest verification.
3. Inspect `git status --short --branch` and the scoped diff before changing a
   dirty working tree.
4. Read only the sections of the active SPEC and approved PLAN named by
   `STATUS.md`; read them completely when changing architecture or public
   contracts.
5. Open `.ai-docs/adrs/000-index.md`, then read only the ADRs applicable to the
   task.
6. Search `.ai-docs/roadmap/deferred-decisions.md` for the identifiers or
   capabilities touched by the task. Do not activate them without approval.
7. Use the newest `WORKLOG.md` entry only when the checkpoint or dirty diff
   needs more detail. Search older entries by date, milestone, ADR, plan, or
   decision identifier instead of reading the whole file.

This sequence is sufficient to continue in a fresh task without chat history.

## Source responsibilities

- `STATUS.md` is the canonical present-tense checkpoint.
- `WORKLOG.md` is append-only historical evidence.
- `ROADMAP.md` records planned milestone state, not task narration.
- SPECs define required behavior and accepted scope.
- ADRs explain architectural decisions and their status.
- Plans define approved delivery order and acceptance checks.
- `deferred-decisions.md` records intentionally inactive capabilities.
- Git records the exact committed and uncommitted implementation state.

If two authoritative documents conflict, stop and report the conflict. Do not
resolve it silently or use this handoff as an authority over a SPEC or accepted
ADR.

## Stable architectural boundary

Schema Engine is framework-neutral. Angular is the first reference adapter but
does not own domain definitions, validation, operations, controlled state, or
runtime behavior.

The active prototype remains limited to:

- root object schemas with recursive inline object properties;
- primitive `string`, `number`, `integer`, and `boolean` leaves;
- the explicit JSON Schema and UI Schema subsets in SPEC-001 and SPEC-002;
- synchronous validation through an external adapter;
- application ownership of `value` and `baselineValue`;
- immutable snapshots, subscriptions, and strict incremental operations;
- Angular with native HTML controls as the first adapter.

Do not introduce arrays, references, composition, async validation, optimistic
state, persistence, advanced layouts, custom object-container renderers, visual
builders, plugin systems, undo/redo, or another deferred capability without an
approved SPEC, ADR, or plan.

## Task boundary and closure

Start with the smallest deliverable named in `STATUS.md`. Mark its `In progress`
section before substantial edits. Preserve unrelated working-tree changes.

At task completion:

1. run verification proportional to the change;
2. restore `STATUS.md` to a compact no-active-task checkpoint containing the
   exact next action;
3. prepend one dated `WORKLOG.md` entry;
4. update `ROADMAP.md` only if a milestone changed;
5. update a SPEC, ADR, plan, or deferred entry only when its own contract or
   state changed;
6. do not commit or push unless explicitly requested.

## Recommended fresh-task prompt

> Follow `AGENTS.md`. Read the compact project checkpoint in
> `.ai-docs/project/STATUS.md`, inspect the working tree, and execute only its
> exact next action. Load the task-specific document sections named there and
> preserve all deferred boundaries.
