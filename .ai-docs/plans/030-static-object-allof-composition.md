# PLAN-030: Static Object `allOf` Composition

- **Status:** Completed revision 0
- **Date:** 2026-08-03
- **Approval date:** 2026-08-03
- **Milestone:** M28 — Static object `allOf` composition
- **Requires:** Accepted ADR-031 revision 0, ADR-005 revision 7 and SPEC-014
  v0.1.0
- **Approval review:** [review 262](../reviews/262-plan-030-review.md) cycle 2
  passed all fifteen areas with zero findings
- **Implementation authorized:** Completed; dependency, version, release,
  publication, commit, push and external actions remain gated
- **Progress:** checkpoints 1–6 completed; final
  [review 268](../reviews/268-plan-030-final-implementation-review.md) cycle 2
  repeated the complete matrix and all 21 rows with zero findings

## 1. Goal and boundary

Implement only SPEC-014's bounded Draft 2020-12 object-`allOf` compiler
behavior: descriptor-safe wrapper recognition, ordered static contributions,
effective object reduction, exact diagnostics/provenance and one shared
Angular/Standard reference scenario.

The validator continues to receive the exact original schema. The plan adds no
Public symbol or signature, normalized definition shape, runtime/operation/
adapter/renderer contract, package, entry point, dependency or version. It does
not implement general JSON Schema evaluation or any excluded D-007 capability.

## 2. Delivery rules

1. Execute checkpoints 1–6 in order and name only the current checkpoint in
   `STATUS.md` before implementation work.
2. Preserve unrelated dirty changes. Scope every checkpoint diff to the named
   core, fixture, package, reference-app and documentation surfaces.
3. Keep composition mechanics Internal. The only Public behavior changes are
   `compileFormDefinition()` accepting the specified subset and its existing
   diagnostic result carrying the specified code/parameters.
4. Extend existing descriptor-safe traversal, local-reference, cycle, path,
   collection-policy and UI ordering machinery when its semantics are exact;
   do not create a second resolver, definition model or validator pipeline.
5. Add focused tests with every deliverable. After any finding, correct it and
   repeat the complete checkpoint review until one pass has zero findings.
6. At every closure, record the review, compact `STATUS.md`, prepend
   `WORKLOG.md`, run `pnpm docs:check` and retain one exact next action.
7. Stop rather than reinterpret Accepted ADR/SPEC behavior when a provenance,
   ordering, stopping or hostile-object case is ambiguous.
8. Dependency, version, release, publication, commit, push and other external
   actions remain separately gated.

## 3. Checkpoint 1 — Wrapper classification and exterior foundation

### Deliverables

1. Add an Internal iterative composition cursor/frame and the minimum compiler
   integration needed to recognize own `allOf` at root, object-property,
   object-item-root and locally referenced target locations.
2. Implement exact optional-object `type` precedence, primitive/nullable/array
   incompatibility, wrapper semantic-sibling diagnostics and suppression of
   ordinary missing-type/properties diagnostics.
3. Parse `allOf` without invoking accessors, iterators, coercion or callbacks:
   validate its descriptor/value, own `length`, dense own enumerable indices
   and extra enumerable string keys in the specified first-failure order.
4. Add `INCOMPATIBLE_SCHEMA_COMPOSITION` to the existing diagnostic-code
   contract without adding a named Public type/export, and implement the exact
   unsupported-branch envelope needed by this checkpoint.
5. Preserve global input/dialect/`$defs` and collection-policy exterior order;
   an invalid exterior stops only dependent branches and no failure returns a
   partial definition.
6. Add focused hostile fixtures for all locations, safe `actualType`/
   `actualLength` handling, sparse/extra-key arrays, primitive/array rejection,
   wrapper siblings and independent schema/UI continuation.
7. Do not complete successful contribution reduction, reference provenance,
   collection semantics or reference-app behavior in this checkpoint.

### Required evidence

```sh
pnpm exec prettier --check packages/core .ai-docs
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm docs:check
git diff --check
```

### Completion gate

One complete review passes SPEC-014 rows 1–3 and the applicable parts of rows
6, 7, 11, 18 and 19 with zero findings. Valid composed normalization,
reference-mediated reduction and collection/UI behavior remain assigned to
later checkpoints.

## 4. Checkpoint 2 — Ordered contribution reduction and provenance

### Deliverables

1. Flatten ordinary object contributions and nested composed wrappers
   iteratively in depth-first branch order, then preserve each contribution's
   `Object.keys(properties)` order without a Public depth limit.
2. Support pure same-document local-reference branches only at `allOf` indices,
   reusing exact fragment/target/sibling rules and both accepted cycle domains.
3. Build one effective property catalog with first-source ownership. A later
   duplicate emits the exact conflict at its source, does not traverse that
   duplicate subtree and allows independent branches to continue.
4. Union valid `required` entries across contributions, resolve cross-branch
   declarations and delay `UNMANAGED_REQUIRED_PROPERTY` until the effective
   catalog is complete.
5. Reduce object `title`/`description` across wrapper then contributions with
   absence/single/equal/conflicting rules, root non-emission, UI-first object
   text and opaque non-applied defaults.
6. Implement all three composition-conflict reasons, exact fallback and
   parameters, copied/frozen first/current document paths, optional immutable
   reference chains, managed `dataPath` and item-relative `templatePath`.
7. Preserve legal repeated acyclic sharing and isolate raw containment versus
   canonical-reference cycles without retaining caller objects or values.
8. Add focused valid, malformed, duplicate, annotation, deep, shared, cycle,
   path and immutable-diagnostic fixtures for root/nested/item/reference use.

### Required evidence

```sh
pnpm exec prettier --check packages/core .ai-docs
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm docs:check
git diff --check
```

### Completion gate

One complete core review passes SPEC-014 rows 4–13, 17–19 and every applicable
part of rows 1, 6 and 7 with zero findings. Collection-policy/UI integration,
full conformance packaging and reference consumers remain incomplete.

## 5. Checkpoint 3 — Collections, UI, validator ownership and core conformance

### Deliverables

1. Apply exactly one use-site UI Schema node to the effective catalog; prove
   combined field order/metadata never contains composition/reference source
   segments and every effective child is addressed at most once.
2. Apply existing absolute collection policies to arrays contributed by any
   branch and resolve composed item identity/requiredness after effective
   reduction.
3. Suppress only dependent semantic path/identity diagnostics when composition
   cannot produce a unique catalog; retain policy exterior, independent policy
   errors and unused-policy behavior.
4. Prove every compile call supplies the exact original schema identity and
   complete value to the replaceable validator, without flattening, cloning,
   bundling or dereferencing it.
5. Add named focused tests/JSON fixtures that map every core-applicable part of
   SPEC-014 rows 1–19, including all wrapper locations, catalogs, diagnostic
   reasons, ordering/stopping, deep iteration and no partial definition.
6. Repeat all existing compiler, local-reference, collection, presentation,
   nullable, fixed-value, async-validation, runtime and operations suites to
   prove unchanged behavior when composition is absent.

### Required evidence

```sh
pnpm exec prettier --check packages/core .ai-docs
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm docs:check
git diff --check
```

### Completion gate

One complete core conformance review passes rows 1–19 with zero findings,
including UI, collection-policy, validator-identity and M1–M27 regression
boundaries. Package and reference-consumer evidence remain incomplete.

## 6. Checkpoint 4 — Public package and consumer invariance

### Deliverables

1. Add concise core README guidance for the supported object-only `allOf`
   subset, original-schema validation and explicit exclusions without implying
   general JSON Schema composition support.
2. Verify exact root declarations and exports: no new named symbol, signature,
   entry point or definition shape; the existing diagnostic-code union may
   include only the accepted new literal.
3. Verify package maps, source/built packages, clean consumers and deep-import
   rejection against the new compiler behavior.
4. Inspect production imports, manifests and lockfile; no package, dependency,
   peer, version, side-effect or validator/Ajv graph change is permitted.
5. Map SPEC-014 row 20 to named declaration/package/consumer and complete
   M1–M27 regression evidence.

### Required evidence

```sh
pnpm exec prettier --check packages/core README.md .ai-docs
pnpm --filter @rabassoft/schema-engine typecheck
pnpm --filter @rabassoft/schema-engine build
pnpm --filter @rabassoft/schema-engine test
pnpm --filter @rabassoft/schema-engine test:package
pnpm test:consumer:clean
pnpm test:source
pnpm docs:check
git diff --check
```

### Completion gate

One complete package review passes SPEC-014 row 20, declarations, root import,
source/built/clean consumers, documentation accuracy and graph invariance with
zero findings. Shared reference-app evidence remains assigned to checkpoint 5.

## 7. Checkpoint 5 — Shared scenario and independent reference consumers

### Deliverables

1. Add one authoring-safe shared scenario containing at least one pure local-
   reference contribution plus one inline contribution, disjoint combined
   fields, cross-branch requiredness, UI ordering and validator-visible data.
2. Share only authored schema/UI Schema, initial value/baseline, labels,
   explanation and expected evidence; do not share compiled definitions,
   runtime state, renderer effects or target-specific transformation.
3. Project the scenario independently through Angular and Standard, proving
   identical managed field order, required state, edits, synchronous validation
   and diagnostics while the application remains value/baseline owner.
4. Keep aligned consumer-facing explanation and code/JSON examples, accessible
   keyboard/screen-reader behavior and light/dark visual evidence without
   changing library-owned styling contracts.
5. Add equivalent unit and Chromium assertions to both targets, regenerate
   maintained snippets when applicable and preserve boundary rules.
6. Map SPEC-014 row 21 to the shared authoring tests plus separate Angular and
   Standard consumption evidence.

### Required evidence

```sh
pnpm reference:snippets
pnpm --filter @schema-engine-internal/reference-scenarios typecheck
pnpm --filter @schema-engine-internal/reference-scenarios build
pnpm --filter @schema-engine-internal/reference-scenarios test
pnpm reference:test:unit
pnpm reference:standard:test:unit
pnpm reference:test:boundaries
pnpm reference:test:e2e
pnpm reference:standard:test:e2e
pnpm docs:check
git diff --check
```

### Completion gate

One complete cross-target review passes shared-authoring authority, independent
projection, combined order/requiredness/validation, accessibility, snippets,
boundaries and Chromium parity with zero findings.

## 8. Checkpoint 6 — Complete repeated review and closure

### Required matrix

1. Restore only the pinned graph and prove no lock/dependency drift:

   ```sh
   pnpm install --frozen-lockfile
   ```

2. Run the complete workspace matrix:

   ```sh
   pnpm format:check
   pnpm docs:check
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm test:package
   pnpm test:consumer:clean
   pnpm test:source
   pnpm test:release:tooling
   pnpm test:public-repository
   pnpm check:public-repository
   pnpm audit:release
   pnpm reference:snippets:check
   pnpm reference:test:boundaries
   pnpm reference:test:e2e
   pnpm reference:standard:test:e2e
   git diff --check
   ```

3. Inspect compiler/public declarations, exports and package maps; manifests/
   lock/import graph; validator original-schema handoff; runtime/operations/
   adapter inventories; all 21 row-to-test mappings; both independently owned
   reference integrations; and the complete scoped diff.
4. Reconcile root/package onboarding, SPEC/ADR/plan listings, ROADMAP, Deferred,
   `STATUS.md` and the newest `WORKLOG.md` entry.
5. Correct every finding and repeat the complete matrix and review until one
   full pass has zero findings. Rerun unchanged outside the sandbox only for a
   documented restricted IPC/network condition.

### Completion gate

Only a complete zero-finding pass may mark PLAN-030/M28 Completed and record
implemented M1–M28. Package versions and published M23 artifacts remain
unchanged; release and commit/push remain separately gated.

## 9. Conformance allocation

| SPEC-014 row | Primary checkpoint | Required evidence                                          |
| ------------ | ------------------ | ---------------------------------------------------------- |
| 1            | 1–3                | Every wrapper location and optional/exact object type      |
| 2            | 1                  | Primitive, nullable, array and identity incompatibility    |
| 3            | 1                  | Descriptor-safe exterior and precedence                    |
| 4            | 2                  | Ordered ordinary/nested contributions                      |
| 5            | 2                  | Local references, chains, wrappers and unsupported targets |
| 6            | 1–2                | Wrapper siblings and branch-local root members             |
| 7            | 1–2                | Complete use-site catalogs and malformed contributions     |
| 8            | 2                  | Disjoint order, duplicate sources and subtree stopping     |
| 9            | 2                  | Required union and delayed unmanaged warnings              |
| 10           | 2                  | Text reduction, root non-emission and opaque defaults      |
| 11           | 1–2                | Every conflict reason and exact envelope                   |
| 12           | 2                  | Current/first-source inline/reference provenance           |
| 13           | 2                  | Raw/reference cycles and acyclic sharing                   |
| 14           | 3                  | Arrays, composed items and policy suppression              |
| 15           | 3                  | One use-site UI node and effective ordering                |
| 16           | 3                  | Exact original schema/value validator handoff              |
| 17           | 2–3                | Deep finite iterative composition                          |
| 18           | 1–3                | Immutable diagnostics and non-retention                    |
| 19           | 1–3                | Atomic failure and independent continuation                |
| 20           | 3–4                | M1–M27, declarations, packages and graph invariance        |
| 21           | 5                  | Shared scenario and independent Angular/Standard evidence  |

Every row is repeated in checkpoint 6. A row spanning checkpoints is complete
only at its last listed checkpoint.

## 10. Stop conditions

Stop for any change to Accepted ADR-031, ADR-005 revision 7 or SPEC-014;
general/repeated-property merging; primitive/array or boolean composition;
`anyOf`, `oneOf`, `not`, conditionals, dependent/unevaluated semantics;
external/dynamic resources or vocabularies; `$ref` semantic siblings; a Public
AST/resolved graph, depth limit, symbol, signature, definition shape, adapter or
renderer contract; flattened validator input; applied defaults; persistence,
submit, batch or framework validation bridge; React/Vue/legacy Angular; package,
entry-point, dependency, version, release or publication; destructive action;
commit; push; or an unresolved authoritative conflict.
