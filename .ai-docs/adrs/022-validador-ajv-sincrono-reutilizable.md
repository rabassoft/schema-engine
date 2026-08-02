# ADR 022: Reusable synchronous Ajv validator package

- **State:** Accepted revision 3
- **Date:** 17 July 2026
- **Acceptance date:** 17 July 2026
- **Complete review:** [`review 083`](../reviews/083-adr-022-review.md) cycle 2
  passed all ten areas with zero findings
- **Milestone:** M17 — Reusable synchronous JSON Schema validator
- **Promotes:** only D-047 as accepted by
  [`review 082`](../reviews/082-d047-m17-ajv-validator-promotion-readiness.md)
- **Requires:** Accepted SPEC-001 through SPEC-006, ADR-005 revision 4,
  ADR-009, ADR-010, ADR-018, ADR-020 and ADR-021
- **Authority:** Accepted M17 architecture; authorizes SPEC-007 and PLAN-019
  preparation/review, not publication, release, commit, push or external
  settings mutation
- **Revision 2 coordination:** Accepted ADR-027 revision 0 and SPEC-010 v0.1.0
  replace only the M17 no-format clause for the bounded D-037/M24 slice after
  review 210 passed with zero findings
- **Revision 3 coordination:** Accepted ADR-028 revision 0 replaces only the
  compiler-rejected `const` boundary for the bounded D-036/M25 slice after
  review 219 cycle 2 passed with zero findings

## 1. Context

The reference catalog's validators are deterministic scenario fixtures. They
do not interpret an edited schema, so a newly added supported constraint can
appear in the normalized form without participating in validation. SPEC-001
already keeps validation replaceable through `SchemaValidator` and anticipates
an Ajv integration package.

The fix belongs in a reusable framework-neutral package. Putting Ajv in core
would couple the runtime to one implementation; installing it independently in
each shell would duplicate dialect and normalization behavior.

## 2. Decision

### 2.1 Package boundary

Add private workspace package `@rabassoft/schema-engine-validator-ajv` at
`packages/validator-ajv`. It starts at `0.0.0`, `private: true`, ESM,
`sideEffects: false`, and exposes exactly one root entry point and one value:

```ts
export function createAjvSchemaValidator(): SchemaValidator;
```

The factory is Public + Experimental + Active under ADR-009, but the package is
not publishable in M17. It imports core only for public types, declares core as
a peer and workspace development dependency, and owns exact runtime dependency
`ajv@8.20.0`. Ajv is not added to core, Angular or either app directly.

### 2.2 Dialect and deterministic mode

The implementation uses Ajv's dedicated Draft 2020-12 class. A factory creates
one isolated Ajv instance configured with:

- `allErrors: true`;
- `strict: false`, preventing warnings or rejection of compiler-accepted opaque
  extension keywords;
- `validateFormats: false`, preserving ADR-005's ignored-annotation policy;
- `addUsedSchema: false`, avoiding cross-edit `$id` registration collisions;
- no `loadSchema`, custom keyword, custom format or plugin; and
- Ajv's non-mutating defaults: no coercion, defaults or property removal.

Validation and schema compilation are synchronous. `$async: true`, unresolved
remote resources and any schema that Ajv cannot synchronously compile fail by
throwing from `validate()`. The existing runtime converts validator throws into
its accepted `VALIDATOR_EXCEPTION` diagnostic. M17 adds no network resolver or
new core diagnostic/error type.

The supported Schema Engine integration invokes the validator only after the
same schema has compiled successfully through `compileFormDefinition()`. Ajv's
broader vocabulary implementation does not widen the compiler's accepted
subset.

### 2.3 Compilation cache

Each factory owns its cache. Compiled functions are reused by schema object
identity through `WeakMap`; boolean schema identities may use fixed slots. A
structurally equal but distinct edited schema is compiled independently. No
global cache, structural hashing, serialization or retained discarded object
graph is introduced.

### 2.4 Issue normalization

Every Ajv error becomes one existing `ValidationIssue`:

- `code` is exactly the Ajv JSON Schema keyword;
- `keyword` is the same keyword;
- `path` decodes `instancePath` as RFC 6901; a segment is numeric only while
  traversing an array value, so numeric object-property names remain strings;
- `required` appends `params.missingProperty` to the parent path;
- `additionalProperties` and `unevaluatedProperties` append their reported
  property when present; other keywords retain the decoded instance path;
- `parameters` is a detached, recursively frozen copy of Ajv `params`; and
- `fallbackMessage` contains Ajv's English message only when present.

Issues preserve Ajv order. Paths, parameters, issues and the result are frozen.
`valid` is true exactly when Ajv succeeds; a valid result has an empty frozen
issue array. Normalization never mutates schema or data.

### 2.5 Reference-shell migration

Angular and Standard create one validator per mounted application composition
root and pass it to every fresh controlled runtime, including after applying an
edited schema. Their schema editor still parses and compiles before runtime
replacement. Scenario validators remain in the neutral catalog as conformance
fixtures and transition evidence, but no longer provide interactive runtime
validation in either shell.

This changes private reference evidence only. It changes no core/Angular Public
contract, catalog scenario contract or expected transition fixture.

## 3. Consequences

Supported schema edits now affect validation identically in both reference
shells. Consumers gain one small replaceable integration example, while core
remains independent. The package adds an external runtime dependency and must
track Ajv security/compatibility separately. Disabling format assertion and
strict mode is deliberate alignment with the compiler boundary, not a claim
that every opaque keyword is validated.

## 4. Rejected alternatives

- **Ajv in core:** violates replaceability and framework-neutral dependency
  control.
- **Per-shell Ajv setup:** duplicates behavior and examples.
- **Configurable factory in M17:** creates an unneeded Public option surface and
  can undermine deterministic dialect/non-mutation rules.
- **Ajv error objects as output:** leaks mutable vendor objects and violates the
  normalized core contract.
- **Structural cache:** adds hashing/canonicalization semantics and collision
  risk without evidence.
- **Formats/ajv-formats:** contradicts the current ignored `format` boundary.
- **Async or remote loading:** conflicts with SPEC-001 and unpromoted D-003.

## 5. Explicit exclusions

Publication/version selection, Stable promotion, new entry points, custom
formats/keywords, localization, async or partial validation, remote resources,
framework validator bridges, core changes, compiler vocabulary expansion,
standalone code generation, workers, SSR and release automation.

## 6. Follow-up gate

SPEC-007 must fix observable behavior and PLAN-019 must be approved before
implementation. Any need for a configurable Public API, another dialect, core
change or publication stops M17 for a separate decision.

## 7. Revision 1 — Angular delivery loading boundary

Implementation review showed that a static Angular-shell import increased the
initial production bundle from 943 kB to 1.07 MB and that Angular/Vite's virtual
development root could not resolve pnpm's package-nested Ajv dependency.

The private Angular bootstrap therefore dynamically imports the validator
package before `bootstrapApplication()` and supplies the completed synchronous
validator through a private injection token. Ajv is a lazy application chunk;
no form runtime exists before it is ready. The private workspace root also owns
exact `ajv@8.20.0` as development tooling so Angular/Vite's virtual root can
resolve the package import. Runtime ownership remains in the validator package;
core, Angular package and both app manifests do not own Ajv directly.

This delivery rule preserves the synchronous factory/API and restores the
existing initial bundle budget. Ajv's CommonJS distribution may produce one
documented optimization warning; it does not authorize a budget increase or a
different validator build.

## 8. Revision 2 — selected semantic-format assertion

The factory owns a private browser-safe ESM subset adapted from the `email`,
`date` and `date-time` full validators in exact `ajv-formats@3.0.1`, registers
only those definitions and selects `validateFormats: true`. The package and
workspace root own the pinned dependency only as development/conformance
tooling; parity tests and MIT attribution guard the adapted subset. This
narrowly replaces the original no-format option and rejected-alternative
clause without adding `ajv-formats` to runtime.

The factory signature, cache, synchronous lifecycle, non-mutation and immutable
Ajv issue mapping remain unchanged. Other format names are not registered and
remain tolerated under `strict: false`; no Public configuration surface,
additional format, comparison keyword or browser validation bridge is added.
`logger: false` preserves the existing no-console contract when another format
name is tolerated under `strict: false`.

## 9. Revision 3 — primitive const assertion

The unchanged Ajv Draft 2020-12 instance already asserts compiler-accepted
primitive `const` schemas. No dependency, plugin, custom keyword, option,
factory surface, cache rule or mapping changes. Ordinary Ajv `const` errors
continue through the existing immutable issue normalization.

The compiler remains the supported-flow gate and accepts only the bounded
ADR-028/SPEC-011 primitive slice. Ajv's broader `const` support does not enable
root/container values, insertion, mutation, renderer behavior or any other
Deferred capability.
