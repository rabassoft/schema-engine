# Project Philosophy

This document describes the long-term vision and guiding principles of the Schema Engine project.

It is **non-normative**. Its purpose is to guide architectural reasoning and project evolution, not to define implementation contracts. In the event of a conflict, approved specifications and Architecture Decision Records take precedence.

## 1. Project Purpose

The `@rabassoft/schema-engine` ecosystem is primarily an educational project and an environment for architectural experimentation.

Its purpose extends beyond building a functional system for generating metadata-driven user interfaces. The repository is intended to serve as a software engineering laboratory in which advanced design principles, architectural patterns, extensibility mechanisms, and framework integration strategies can be explored, validated, and documented.

Although learning is a primary objective, the project aims to meet production-grade standards of correctness, maintainability, testability, accessibility, and developer experience.

The educational nature of the project must not be used as a justification for incomplete contracts, avoidable complexity, or low-quality implementation.

## 2. The Guiding Rule: Understand the “Why” Before Implementing the “What”

In this project, implementation is considered the result of architectural reasoning rather than a substitute for it.

Most technical problems can be solved in several valid ways. Architectural quality depends on understanding the consequences, limitations, and trade-offs of each alternative before selecting one.

> **No significant architectural or functional decision should be implemented without documenting its motivation, alternatives, trade-offs, and expected consequences.**

Documentation should be proportional to the importance and expected lifetime of the decision. Small and reversible implementation details do not require the same level of analysis as public contracts or cross-cutting architectural choices.

The objective is not to document every line of code, but to preserve the reasoning behind decisions that future contributors may otherwise be forced to rediscover.

## 3. Engineering Principles

The project follows these guiding principles:

### 3.1 Framework Independence

Core domain behavior must not depend on Angular, React, Vue, or any other presentation framework.

Framework adapters may expose idiomatic APIs, but they must not become the owners of portable domain logic.

### 3.2 Explicit Contracts

Interactions between the compiler, runtime, validators, adapters, and renderers must be expressed through explicit and well-defined contracts.

Public behavior must not depend on undocumented conventions or implementation details.

### 3.3 Replaceable Integrations

Validation engines, text resolvers, renderer libraries, design systems, and framework adapters should remain replaceable wherever practical.

The core must depend on abstractions defined by the project rather than on the internal models of external libraries.

### 3.4 Incremental Evolution

The project should evolve through small, verifiable increments.

Future extensibility must be considered, but functionality should not be implemented before a concrete use case justifies it.

Deferred decisions must be recorded explicitly rather than prematurely designed or silently forgotten.

### 3.5 Evidence Through Implementation

Specifications and architectural decisions are hypotheses until they have been validated through implementation, automated tests, conformance fixtures, or technical spikes.

When implementation reveals a conflict with the documented architecture, the conflict must be reported and resolved explicitly. Documentation must not be silently ignored.

### 3.6 Simplicity Before Generalization

The simplest solution that satisfies the confirmed requirements should be preferred.

Advanced patterns are welcome when they solve an identified architectural problem, preserve long-term flexibility, or provide meaningful educational value. They should not be introduced solely to demonstrate that a pattern can be used.

## 4. Documentation Model

The project separates documentation according to its purpose and authority.

### 4.1 Specifications

**Location:** `.ai-docs/specs/`

Specifications define the required behavior and public contracts of the system.

They should be used for:

- behavioral requirements;
- public data structures and interfaces;
- lifecycle guarantees;
- interoperability requirements;
- compatibility expectations;
- acceptance and conformance criteria.

Specifications describe **what the system must guarantee**.

A specification may remain in draft status while its assumptions are validated through implementation. Once approved, incompatible changes require an explicit revision and migration analysis.

### 4.2 Architecture Decision Records

**Location:** `.ai-docs/adrs/`

Architecture Decision Records document significant structural or cross-cutting decisions.

They should be used for decisions such as:

- framework independence;
- package boundaries;
- state ownership;
- validation architecture;
- versioning strategy;
- extension mechanisms;
- compatibility policies;
- public API stability.

An ADR should describe:

- the context and problem;
- the considered alternatives;
- the selected decision;
- the reasoning behind it;
- positive and negative consequences;
- its current status.

ADRs explain **why a significant architectural choice was made**.

The ADR index is maintained in `.ai-docs/adrs/000-index.md`.

### 4.3 Feature Design Documents

**Location:** Co-located with the feature or module they describe, using a `DESIGN.md` file when appropriate.

A local design document should be created for a component, service, package, or feature whose internal design cannot be understood easily from its public contract and implementation.

It should describe, when relevant:

- the purpose of the feature;
- its responsibilities and boundaries;
- important implementation decisions;
- rejected alternatives;
- invariants;
- edge cases;
- performance considerations;
- testing strategy;
- known limitations.

A `DESIGN.md` document explains **how a specific part of the system is designed internally**.

It must not redefine behavior already governed by an approved specification or contradict an ADR.

### 4.4 Operational Project Documents

Operational documents record the current execution state of the project:

- `.ai-docs/project/STATUS.md` describes the present state and the exact next action.
- `.ai-docs/project/WORKLOG.md` records completed and interrupted work chronologically.
- `.ai-docs/project/ROADMAP.md` describes planned milestones.
- `.ai-docs/roadmap/deferred-decisions.md` records intentionally postponed decisions.

These documents coordinate work. They do not define system behavior.

## 5. Documentation Precedence

When documentation conflicts, the following precedence applies:

1. Approved specifications.
2. Accepted Architecture Decision Records.
3. Feature-level `DESIGN.md` documents.
4. Operational project documents.
5. This philosophy document.
6. Comments and informal notes.

A conflict between two documents of equal authority must be reported and resolved explicitly. Contributors and automated tools must not silently choose one interpretation.

## 6. Contribution Expectations

Contributions should optimize for clarity, correctness, maintainability, and long-term learning value.

Contributors are encouraged to explore advanced architectural patterns—such as registries, ports and adapters, immutable state models, or compiler-style transformation pipelines—when those patterns address a concrete requirement or test an explicit architectural hypothesis.

Complexity must always be justified.

Before introducing a complex abstraction, a contribution should explain:

- which problem it solves;
- why a simpler alternative is insufficient;
- what trade-offs it introduces;
- how it can be tested;
- how it affects public contracts;
- whether it belongs to the current scope or to a deferred decision.

Patterns must not be introduced merely for novelty, theoretical completeness, or speculative future requirements.

## 7. Definition of Architectural Progress

Architectural progress is not measured by the number of abstractions, packages, patterns, or supported frameworks.

Progress occurs when the project:

- reduces ambiguity;
- establishes stable and understandable contracts;
- validates decisions through working increments;
- improves framework independence;
- makes extension safer;
- preserves compatibility;
- improves documentation and conformance testing;
- allows future contributors to understand not only what was built, but why it was built that way.

The long-term objective is to create an ecosystem that remains understandable, extensible, and useful beyond the lifecycle of any individual frontend framework.
