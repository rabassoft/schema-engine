# Schema Engine — Codex Handoff

- **Handoff date:** 13 July 2026
- **Current specification:** `SPEC-001: Controlled Form Runtime`, version `0.1.5`, status `Draft`
- **Implementation status:** M1 minimal compiler completed in `packages/core`; runtime, operations, validators, adapters, and renderers are not implemented.

## 1. Current objective

Review and approve the proposed M2 root-level immutable-operations plan.

The project is intentionally being developed in small validated increments. Do not expand the scope merely because a future capability appears in the roadmap.

## 2. Confirmed direction

The confirmed architectural decisions are consolidated in:

- `.ai-docs/specs/001-controlled-form-runtime.md`

The specification covers, among other topics:

- Controlled and unidirectional data flow.
- Application ownership of `value` and `baselineValue`.
- Strict incremental operations with explicit expectations.
- Immutable runtime snapshots and structural sharing.
- Framework-neutral subscriptions.
- Synchronous validation through replaceable adapters.
- Normalized validation issues and diagnostics.
- Application-defined validation scopes.
- Runtime-managed `touched` and `focused` state.
- Dynamic locale and a replaceable `TextResolver`.
- UI metadata such as label, description, hint, tooltip, placeholder, field order, and numeric display options.
- Angular plus native HTML controls as the first reference adapter.

## 3. Deferred work

Ideas that were discussed but intentionally excluded from the first prototype are recorded in:

- `.ai-docs/roadmap/deferred-decisions.md`

An entry in that file is not authorization to implement it. Promote a deferred item only after an explicit architectural decision.

## 4. Existing ADR status

The repository contains ADRs created before `SPEC-001`. They provide useful context but are not automatically authoritative where they conflict with the specification.

The following pre-SPEC ADRs are pending review and must not be treated as
authoritative where they conflict with `SPEC-001`:

- Global ADR-002: versioning aligned directly with Angular major versions.
- Global ADR-004: a renderer registry based on a simple static dictionary.
- Angular ADR-001: statements coupling Signals, RxJS, Zone.js, and zoneless behavior.
- Angular ADR-002: an empty `ViewContainerRef` placeholder that records no accepted decision.

Do not rewrite these ADRs as part of an unrelated task. Surface conflicts explicitly and handle them through a dedicated review.

## 5. Accepted architecture increment

ADR-005 has been formally reviewed and accepted:

### [`ADR-005: JSON Schema dialect and compatibility policy`](.ai-docs/adrs/005-politica-dialecto-json-schema.md)

The decision uses Draft 2020-12 as the reference dialect while supporting only the subset declared in `SPEC-001`.

The recorded policy is:

- Draft 2020-12 declared through `$schema`: accepted.
- `$schema` absent: assume Draft 2020-12 and emit `MISSING_SCHEMA_DIALECT` as a warning.
- A different declared dialect: emit blocking `UNSUPPORTED_SCHEMA_DIALECT`.
- A known but unsupported semantic keyword: emit a blocking diagnostic.
- A known but ignored annotation: emit a warning.
- An unknown keyword: emit a warning, treat it as an opaque annotation, and ignore it during compilation.
- Diagnostics are deterministic and do not change between development and production builds.
- Full validation remains delegated to an external validator adapter.

The acceptance review confirmed:

1. Context and problem.
2. Decision.
3. Supported and unsupported cases.
4. Diagnostic behavior.
5. Consequences and trade-offs.
6. Alternatives considered.
7. Criteria for revisiting the decision.

Acceptance of ADR-005 authorizes planning the compiler increment; it does not by itself authorize implementation.

## 6. Completed compiler implementation plan

[`PLAN-001: Minimal compiler-only implementation`](.ai-docs/plans/001-compiler-only-implementation.md) is completed. It delivered this increment:

```text
JSON Schema + UI Schema
          ↓
compileFormDefinition()
          ↓
FormDefinition | Diagnostic[]
```

The first compiler increment should cover only:

- Root `object`.
- `string`, `number`, `integer`, and `boolean` fields.
- Initial constraints defined in `SPEC-001`.
- `required`.
- Field ordering.
- `label`, `description`, `hint`, `tooltip`, and `placeholder`.
- Numeric visual options.
- Blocking and non-blocking diagnostics.

Suggested conformance fixtures:

- `valid-basic-form`
- `valid-custom-order`
- `valid-ui-texts`
- `warning-unknown-order-field`
- `warning-incompatible-placeholder`
- `error-root-not-object`
- `error-unsupported-type`

## 7. Proposed immutable-operations plan

[`PLAN-002: Root-level immutable operations`](.ai-docs/plans/002-root-immutable-operations.md)
is Proposed and awaiting explicit approval.

Its scope is limited to the public operation/result contracts,
`applyOperation()`, `applyFormOperation()`, deterministic runtime diagnostics,
operation fixtures, and verification. Both utilities accept only a single
string root-property path segment in M2. No M2 production code has been added.

## 8. Recommended next Codex prompt

Use this prompt in the next Codex session:

> Read `AGENTS.md`, `HANDOFF.md`, `STATUS.md`, `SPEC-001`, accepted ADR-005 and ADR-006, completed PLAN-001, proposed PLAN-002, the deferred-decisions register, and the ADR index. Formally review PLAN-002 against the normative specification and deferred scope. Check its contracts, diagnostic behavior, immutability guarantees, fixtures, and acceptance criteria. Report any required corrections; if none remain, mark PLAN-002 Approved. Do not implement M2 during the review.
