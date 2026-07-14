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

`STATUS.md` is the canonical current state. The Accepted baseline SPEC is the
primary behavioral baseline; an Accepted extension SPEC is authoritative only
for the promoted scope it explicitly replaces. Older ADRs are subject to review
when they conflict with an Accepted SPEC. When authoritative documents
conflict, stop and report the conflict rather than silently choosing one.

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

## Active-scope recovery

Do not encode the current milestone, accepted versions, implemented schema
shapes, or next capability in this stable guide. Recover the active boundary
from `STATUS.md`, then confirm it against the Accepted baseline and extension
SPECs and the deferred-decisions register.

Treat every capability not present in that recovered boundary as inactive. Do
not implement or document it as active until its required SPEC, ADR, review, or
approved plan gate has been completed. If the active scope changes, update the
current-state documents and indexes; change this guide only when an operating
rule or stable architectural invariant changes.

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

At completion of a task that changes persistent project state:

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

A read-only question, diagnosis, or review does not by itself authorize a
`STATUS.md` or `WORKLOG.md` edit. Record it only when the user accepts a decision,
requests documentation changes, or the work otherwise changes persistent
project state.

When a milestone, accepted version, plan state, or promoted capability changes,
run `pnpm docs:check` and reconcile `STATUS.md`, `ROADMAP.md`, the documentation
indexes, and onboarding README files before completion. Do not copy that
volatile state into `AGENTS.md` or `HANDOFF.md`.

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
