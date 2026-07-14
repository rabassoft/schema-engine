# PLAN-011: Same-document static JSON Schema reference resolution

- **Status:** Completed
- **Date:** 2026-07-15
- **Approval date:** 2026-07-15
- **Review revision:** 0
- **Review state:** Complete review cycle 1 passed all ten areas with zero
  findings; formally approved by Ricard
- **Implementation state:** Checkpoints 1–5 completed; final repeated review
  passed with zero findings
- **Implementation authorized:** Yes — checkpoints 1–5 only
- **Requires:** accepted
  [`SPEC-001` v0.1.15](../specs/001-controlled-form-runtime.md),
  [`SPEC-002` v0.1.2](../specs/002-nested-object-runtime.md),
  [`SPEC-003` v0.1.2](../specs/003-collection-runtime.md),
  [`SPEC-004` v0.1.1](../specs/004-local-reference-resolution.md),
  [`ADR-005` revision 3](../adrs/005-politica-dialecto-json-schema.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-014` revision 2](../adrs/014-modelo-objetos-anidados-paths-profundos.md),
  [`ADR-015` revision 4](../adrs/015-modelo-colecciones-identidad-operaciones.md)
  and [`ADR-016`](../adrs/016-resolucion-referencias-locales.md)
- **Milestone:** M11 — Same-document static reference resolution
- **Promoted capability:** [`D-041`](../roadmap/deferred-decisions.md)

## 1. Goal and authorization boundary

Implement the accepted D-041 compiler extension end to end:

```text
root `$defs` registry + supported non-root `$ref`
  -> Internal descriptor-safe resolved cursor
  -> existing per-use-site normalization
  -> unchanged FormDefinition or exact immutable diagnostics
```

Core remains framework-neutral and externally pure. The application continues
to own `value` and `baselineValue`; the validator continues receiving the exact
original schema; Angular and every other adapter continue consuming only the
existing normalized definitions and runtime snapshots.

Ricard formally approved revision 0 after its repeated complete zero-finding
review, authorizing checkpoints 1–5 in sequence. Approval does not authorize
wider references, composition, recursive managed data/UI, a Public resolved
model, new packages or entry points, dependencies, publication or Stable
promotion.

## 2. Reviewed current implementation

The completed M10 repository already provides:

- one iterative, descriptor-safe compiler in `packages/core/src/compiler.ts`;
- accepted depth-first normalization for primitive fields, inline objects and
  homogeneous object collections;
- structural UI traversal, collection-policy matching and exact schema/UI/data
  paths;
- active-object cycle detection, legal sharing and immutable diagnostics;
- unchanged Public compiler/result/definition contracts plus the original
  schema identity retained by runtime validation; and
- conformance fixtures, hostile programmatic tests, package smoke tests and
  clean core/Angular 22 consumers.

It does not index `$defs`, classify reference objects, decode URI fragments or
JSON Pointers, resolve schema targets, track reference-path cycles or attach
reference chains. `$defs` and `$ref` currently remain unsupported keywords.
The diagnostic helper copies paths and the outer parameters record but has no
generic deep-copy/freeze behavior for nested reference chains.

Implementation must extend the existing compiler pipeline. It must not create
an alternate compiler, dereferenced document, runtime resolver, adapter-owned
resolver or validator-side resolution path.

## 3. Public Experimental and Internal inventory

The accepted ADR-009 migration is exact:

| Classification                      | PLAN-011 effect                                                                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public behavior             | `compileFormDefinition()` accepts the closed SPEC-004 `$defs`/`$ref` subset and emits deterministic reference diagnostics.                           |
| Changed Public diagnostic semantics | Reference-mediated schema diagnostics may add immutable `parameters.referenceChain`; every diagnostic without a chain retains its accepted envelope. |
| New Public symbols                  | None.                                                                                                                                                |
| Changed Public signatures           | None.                                                                                                                                                |
| Internal                            | Registry entries, fragment/pointer decoder, resolved cursor, target cache, active reference-path tracking and provenance helpers.                    |
| Unchanged                           | Definitions, runtime, operations, Angular, validator port, packages, entry points, exports, dependencies, versions, publication and Stable state.    |

No core or Angular root index may change. No compatibility alias, resolver
callback, configuration input, Public AST/graph/resource type or declaration
surface may enter the diff.

## 4. Internal resolver and compiler delivery

### 4.1 Root registry inspection

Add `$defs` only to the supported root catalog. Inspect its own descriptor after
dialect and collection-policy exterior work and before ordinary root traversal.
Validate the exterior and every `Object.keys()` entry exactly as SPEC-004
section 5 requires.

The registry stores only Internal entry metadata needed for later mechanical
resolution. It does not normalize definition content eagerly, retain caller
containers in diagnostics, create managed nodes or attach UI/policies to
document locations. Invalid entries remain individually unresolved while later
independent entries are still inspected/indexed.

### 4.2 Reference classification and syntax

At every accepted non-root schema position, inspect the own `$ref` descriptor
before requiring `type`. Classify siblings in source order without reading
opaque values, preserve accepted annotation/unknown behavior and reject every
other known semantic sibling as `fieldType: 'reference'`.

Implement one Internal decoder with the exact first-failure sequence from
SPEC-004 section 7:

1. root location and descriptor/value shape;
2. RFC 3986 raw fragment grammar, second `#` and percent-triplet shape;
3. fragment-only scope plus one UTF-8 percent-decoding pass;
4. plain-name/pointer distinction and RFC 6901 escapes;
5. `$defs` scope and required definition name; and
6. canonical textual array indices during traversal.

Do not use URL resolution, network/filesystem APIs, browser/Node globals or a
lossy numeric conversion for an unbounded array token.

### 4.3 Mechanical resolution and resolved cursors

Resolve from the exact original document root through own enumerable data
descriptors of ordinary objects and arrays. Return exact decoded-prefix failure
paths; convert an array token to a number only after it selects an existing
canonical element. Never execute an accessor or consumer callback.

An Internal resolved cursor carries only the exact target schema object, its
copied canonical `documentPath`, the copied outermost-to-innermost `$ref` chain
and target identity needed for active-path cycle detection. Resolution metadata
may be cached by canonical target path, but normalized definitions, UI choices,
managed keys, data paths and collection policies are rebuilt independently at
every use site.

### 4.4 Existing normalization integration

Refactor the current explicit schema traversal only as far as necessary to
accept either an inline schema location or an Internal resolved cursor. Keep the
existing depth-first behavior and candidate/definition output contracts.

For a resolved target:

- derive `dataPath`, required state, keys, templates and collection addresses
  from the managed use site;
- retain target keyword `documentPath` and the complete reference chain on
  schema diagnostics;
- keep structural UI at the use site with no schema chain;
- match `CollectionPolicy` by the absolute use-site array path and attach a
  chain only to dependent semantic policy diagnostics;
- preserve raw containment-object cycle detection separately; and
- stop only the dependent branch after invalid syntax, incompatible siblings,
  unresolved targets or reference cycles.

Root `$ref` is diagnosed after registry inspection and before ordinary root
members. Independently collectible root, sibling, registry, schema, policy and
UI diagnostics continue in the exact SPEC-004 section 12 order. Any error still
returns no partial `FormDefinition`.

### 4.5 Reference-cycle domain and iteration

Track active canonical target `documentPath` values independently from active
JavaScript object identity. Re-entering a target path emits one
`CYCLIC_SCHEMA_REFERENCE` whose `firstDocumentPath` is the first active target
path and whose chain includes the closing `$ref`.

Reference edges and target normalization remain explicit-stack operations for
arbitrarily deep finite registries, pointers and chains. Repeated acyclic
targets and the same object at distinct document paths remain legal. No Public
depth limit or recursive call-stack dependency may be introduced.

## 5. Diagnostics, provenance and immutability

Implement exactly the accepted envelopes and closed reasons for:

- `$defs` exterior/entry `INVALID_SCHEMA_KEYWORD_VALUE`;
- `INVALID_SCHEMA_REFERENCE`;
- `UNRESOLVED_SCHEMA_REFERENCE`; and
- `CYCLIC_SCHEMA_REFERENCE`.

Every assertion covers code, severity, source, data/document paths, parameters,
fallback, order and branch stopping. Reference-mediated schema diagnostics copy
and deeply freeze every path and nested chain. Diagnostics must not retain
schema objects, registry/pointer containers, accessors, hostile values or thrown
values.

Any shared immutable helper change must preserve the exact envelopes and
same-reference behavior expected by all diagnostics without references. UI,
registry-exterior, policy-exterior and unused-policy diagnostics never receive
an invented `referenceChain`.

## 6. Validation, adapters and ownership

Add no runtime, operation or Angular production behavior. Focused regression
tests must prove:

- `SchemaValidator.validate()` receives the exact schema object supplied to
  `compileFormDefinition()`/runtime creation, never a clone or bundle;
- definitions compiled through references are consumed unchanged by current
  runtime, operation and Angular paths;
- Angular never receives raw `$defs`, `$ref`, cursors or registry metadata; and
- reference-free compilation retains exact M1–M10 results and diagnostic
  envelopes.

Signal Forms, renderers, collection hosts, controlled confirmation, identity,
validation and persistence ownership remain unchanged.

## 7. Test and conformance delivery

JSON fixtures cover serializable accepted successes/failures. Programmatic
tests cover descriptors, accessors, prototypes, cycles, shared identity,
hostile property names, invalid UTF-8/lone surrogates, deep finite inputs and
exact object identity. Fixture generation remains a separately reviewed action;
generated expected output is never its own oracle.

### 7.1 SPEC-004 scenario matrix

| SPEC scenario                                | Required evidence                                                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1. Registry absence/emptiness/laziness/order | conformance fixtures plus programmatic declaration-order assertions                                        |
| 2. Invalid `$defs` exteriors                 | descriptor/prototype/value tests for every accepted exterior failure                                       |
| 3. Invalid entries and repeated uses         | programmatic entry-continuation tests and per-use unresolved diagnostics                                   |
| 4. Every supported reference position        | primitive, nested object, array property, item root and item descendant fixtures at shallow/deep paths     |
| 5. Reused target with distinct use sites     | definition/UI/required/key/path assertions proving independent normalization                               |
| 6. Referenced arrays and policies            | use-site policy success/failure/provenance tests                                                           |
| 7. Encoded and hostile names                 | raw/encoded separators, Unicode, whitespace, punctuation, `__proto__`, `%`, `#`, `?`, lone-surrogate cases |
| 8. Every invalid-reference reason            | one focused assertion per reason plus complete precedence combinations                                     |
| 9. Mechanical object/array traversal         | every unresolved reason, decoded prefix and canonical/oversized index case                                 |
| 10. Reference cycles and acyclic reuse       | direct, indirect, long and repeated-target tests with exact chains                                         |
| 11. Raw-object versus reference cycles       | paired tests preserving `CYCLIC_SCHEMA_OBJECT` separation                                                  |
| 12. Malformed `$ref` and siblings            | source-order/opacity/branch-stopping tests for ignored, unknown and incompatible siblings                  |
| 13. Target diagnostic provenance             | exact target document path, use-site data path and nested chain assertions                                 |
| 14. UI/policy chain exclusions               | UI, policy exterior and unused-policy diagnostics without invented chains                                  |
| 15. Invalid registry branch stopping         | independent root/schema/UI continuation and no partial definition                                          |
| 16. Deep finite safety                       | explicit-stack stress tests for registries, pointers and chains without Public limit                       |
| 17. Immutability/non-retention               | reflection/mutation tests for paths, chains, parameters, results and hostile values                        |
| 18. Original validator schema                | identity assertion through runtime validation after referenced compilation                                 |
| 19. M1–M10/package invariance                | complete existing matrix, declaration/root-export diff and clean consumers                                 |

Every test must distinguish accepted reference behavior from D-007/D-014 work.
No fixture may assert external/dynamic references, anchors, applicators,
recursive managed data/UI, a Public resolved graph or adapter interpretation of
raw schema.

### 7.2 Focused suite organization

Add a focused core reference-compiler suite and only the minimum serializable
conformance fixture directories needed to keep reviewable examples. Keep
programmatic hostile cases out of JSON. Existing compiler, nested, collection,
runtime, operation and Angular tests remain assertions, not merely smoke runs.

## 8. Packages, declarations, consumers and documentation

Core package smoke and clean consumers must compile/use a referenced definition
through the existing root import without importing a new symbol. Angular clean
consumers must continue consuming the resulting normalized definition through
the existing adapter surface.

Inspect emitted `.d.ts`, root indexes, export maps and packed artifact
allowlists to prove no Public or package-shape change. Keep both packages
private independent `0.1.0`, the exact Angular 22 compatibility range and the
publication prohibition. Update current documentation/release exclusions only
when implementation actually completes.

No manifest, dependency, peer, export map, lockfile, registry, credential, tag,
GitHub Release or publication change belongs to PLAN-011.

## 9. Implementation sequence and checkpoints

After explicit plan approval only:

1. Add Internal immutable reference-path/cursor/diagnostic foundations and
   focused unit tests without changing root exports or activating references.
2. Implement `$defs` exterior/index inspection plus URI-fragment/JSON Pointer
   decoding and mechanical target resolution with descriptor/hostile/deep tests.
3. Integrate reference classification, cursor-based target normalization,
   cycle domains, ordering, provenance, UI/policy behavior and no-partial-result
   semantics into the compiler.
4. Complete all 19 conformance rows, original-validator identity and full
   M1–M10/runtime/operation/Angular/package/clean-consumer regression evidence;
   reconcile implementation documentation without package drift.
5. Run the complete matrix, inspect declarations and the entire M11 diff,
   correct every finding and repeat the full implementation review/checks until
   one complete cycle passes with zero findings.

Each checkpoint updates persistent state, preserves unrelated dirty work and
passes formatting, documentation consistency, lint, typecheck, focused tests,
applicable builds and `git diff --check`. No failing checkpoint is complete and
no later checkpoint begins until its dependencies are green.

## 10. Expected production diff

Expected existing production files are:

- `packages/core/src/compiler.ts`;
- `packages/core/src/internal/keywords.ts`; and
- only if needed for nested-chain immutability, the existing Internal
  diagnostics/immutable helpers.

One cohesive Internal core module may isolate registry indexing, pointer
decoding, target traversal and resolved cursors. Exact Internal names and
decomposition are implementation details. Expected evidence includes a focused
reference compiler test, conformance fixtures, package/consumer assertions and
current project documentation.

No production file under `packages/angular`, no root `index.ts`, Public
contract file, runtime, operation, package manifest or lockfile should change.
Any such need triggers the stop conditions below rather than silent scope
expansion.

## 11. Verification commands and inspections

Run from a clean dependency state where applicable:

```text
CI=true pnpm install --frozen-lockfile
pnpm format:check
pnpm docs:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:consumer
pnpm test:artifacts
pnpm test:consumer:clean
```

Also inspect:

- focused reference compiler tests at every applicable checkpoint;
- every row of the 19-scenario matrix and all reason/precedence catalogs;
- exact diagnostic paths/chains, order, branch stopping and immutability;
- descriptor/prototype safety and lack of accessor/global/callback execution;
- explicit-stack behavior for deep registries, pointers and reference chains;
- per-use-site definition/UI/policy normalization and cycle-domain separation;
- original schema identity at `SchemaValidator`;
- emitted declarations, root exports and packed artifact allowlists;
- existing M1–M10 core/Angular behavior and lower/upper Angular 22 consumers;
- manifest/dependency/lockfile/publication/deferred-boundary diff guards;
- Markdown links, persistent-state consistency and `git diff --check`; and
- the complete diff after every correction until a repeated review is clean.

Verification must not rewrite fixtures, generated files, manifests or lockfiles
implicitly. Any intentional fixture regeneration is reviewed before the final
read-only matrix.

## 12. Completion and stop conditions

M11 implementation is complete only when:

1. all 19 SPEC-004 scenarios map to passing evidence;
2. every diagnostic reason, precedence, path, chain, order and stop rule is
   asserted;
3. descriptor safety, iteration, sharing, cycle separation and immutability
   pass hostile/deep tests;
4. exact M1–M10 behavior, Public signatures and validator/adapter ownership are
   preserved;
5. the full command matrix, packages and clean consumers pass;
6. declarations, root exports, manifests, dependencies and lockfile show no
   unauthorized drift;
7. no deferred capability, publication action or Stable claim enters the diff;
8. final implementation review repeats after every correction until zero
   findings; and
9. STATUS is compacted, WORKLOG is prepended and ROADMAP changes only when M11
   implementation actually completes.

Stop and return to normative review if implementation requires:

- changing any accepted `$defs`, reference, diagnostic, provenance, ordering,
  cycle, UI/policy or validator contract;
- adding or changing a Public symbol/signature, entry point, package manifest,
  dependency, peer, export map or lockfile;
- exposing a resolved graph/cursor/registry or adding resolver configuration,
  callback, I/O or framework ownership;
- adding an arbitrary depth limit, executing accessors or mutating/cloning
  caller schema content;
- activating root/external/dynamic references, anchors, applicators,
  composition, recursive managed data/UI or generic D-014 modeling; or
- weakening no-partial-result behavior, provenance, immutability, controlled
  ownership or required verification.

## 13. Plan acceptance criteria

PLAN-011 may be approved only when a complete review confirms:

1. all 19 SPEC-004 scenarios map to concrete implementation/evidence;
2. the zero-signature Public migration and every Internal addition are exact;
3. registry, decoding, traversal, normalization, cycle and provenance delivery
   are independently verifiable and correctly ordered;
4. descriptor safety, explicit iteration and deep immutability are testable;
5. diagnostic reasons, precedence, paths, chains, order and branch stopping are
   closed;
6. UI, collection policy, validator and Angular ownership remain unchanged;
7. M1–M10, declarations, packages and clean consumers have explicit regression
   coverage;
8. D-007/D-014, dependencies, publication and stability boundaries remain
   closed;
9. completion and stop conditions are objective; and
10. a complete review repeats after every correction until zero findings.

Approval would authorize only checkpoints 1–5 and their stated verification.
It would not pre-approve any correction that changes an accepted contract or
scope.

## 14. Review record

### 14.1 Draft checkpoint

Revision 0 was drafted on 15 July 2026 from accepted SPEC-004 v0.1.1,
ADR-016, ADR-005 revision 3, ADR-009 and the inspected completed M10 compiler,
tests, packages and consumers.

The plan remains Proposed. A complete review must cover all ten acceptance
areas and repeat after every correction until one full cycle passes with zero
findings. Review completion alone will not approve the plan or authorize
implementation; Ricard must make a separate explicit approval decision.

### 14.2 Complete review cycle 1

The complete review recorded in
[`review 020`](../reviews/020-plan-011-review.md) passed all ten acceptance areas
with zero findings, requested corrections or documentation conflicts.

PLAN-011 revision 0 remains Proposed. The review does not approve the plan or
authorize checkpoint 1; Ricard must make a separate explicit formal approval
decision.

### 14.3 Formal approval

Ricard explicitly approved PLAN-011 revision 0 on 15 July 2026 after complete
review cycle 1 passed all ten areas with zero findings. Approval authorizes only
checkpoints 1–5 and their stated verification/stop conditions; checkpoint 1 is
the only active implementation task.

### 14.4 Implementation checkpoint 1

Checkpoint 1 completed on 15 July 2026. It added one Internal
`schema-reference` module with copied/frozen document paths, reference chains,
resolved cursors and reference-diagnostic path parameters. The cursor retains
the exact caller schema without freezing or cloning it.

Four focused tests cover caller mutation, nested-chain isolation, hostile/lone
surrogate path segments, exact schema identity and frozen diagnostic paths. The
complete 252-test core suite, core typecheck/build/package smoke, formatting,
lint, documentation and diff checks pass. No root export, Public contract,
compiler/keyword behavior, runtime, operation, Angular production file,
manifest, dependency or lockfile changed; `$defs`/`$ref` remain inactive.

### 14.5 Implementation checkpoint 2

Checkpoint 2 completed on 15 July 2026. The Internal `schema-reference` module
now inspects absent/invalid/indexed `$defs` registries lazily, decodes the closed
RFC 3986 fragment/RFC 6901 pointer subset, and resolves targets mechanically
through own enumerable data descriptors of ordinary objects and arrays.

Focused tests cover invalid exteriors/entries and continuation, accessor
non-execution, encoded/hostile names, every decoder family, IPv6 URI scope,
pointer escapes, `__proto__`, canonical/oversized/sparse/non-enumerable/accessor
array tokens, inherited/intermediate/final failures, exact path segment typing,
schema identity/provenance and a depth-5,000 iterative target.

The first focused run exposed premature numeric conversion for three failing
array descriptors plus one invalid non-ordinary fixture; both implementation
and evidence were corrected. The repeated focused suite passes 49 tests and the
complete core suite passes 297 tests. Core typecheck/build/package smoke,
formatting, lint, documentation and diff checks pass. Compiler/root keyword
behavior and Public exports remain unchanged, so `$defs`/`$ref` are still
inactive.

### 14.6 Implementation checkpoint 3

Checkpoint 3 completed on 15 July 2026. The existing compiler now indexes the
root registry after dialect/policy exterior inspection, classifies root and
supported non-root references, resolves targets at each managed use site and
keeps canonical target-path cycles separate from raw containment-object cycles.

The integration preserves schema document paths, managed data/template paths,
outermost-to-innermost reference chains, source/depth-first diagnostic order,
branch stopping, independent UI/policy diagnostics and no-partial-result
behavior. Referenced primitive, object, array, item-root and item-descendant
schemas use the existing normalization path and collection policies remain
keyed only by absolute use-site paths.

The first focused run exposed two incorrect test expectations but no compiler
defect; the evidence was corrected and repeated. The focused reference suite
passes 56 tests and the complete core suite passes 304 tests. Core typecheck,
build/package smoke, formatting, lint, documentation and diff checks pass. No
Public contract/export, runtime, operation, Angular production file, manifest,
dependency or lockfile changed.

### 14.7 Implementation checkpoint 4

Checkpoint 4 completed on 15 July 2026. The 19 SPEC-004 scenario rows now map
to serializable conformance fixtures, focused compiler assertions and hostile
programmatic tests covering all invalid/unresolved reasons, precedence,
registry continuation/laziness, supported positions, reuse, policies, encoded
names, cycles, provenance, branch stopping, depth and immutability.

Runtime evidence proves the validator receives the exact original schema.
Package smoke and isolated core/lower/upper Angular 22 consumers compile and
consume referenced definitions through the unchanged root APIs. Packed-artifact
checks include the new Internal module while explicitly rejecting its resolver
types from the Public declaration surface.

The first complete matrix found three strict-lint issues in new matcher
expressions; the repeated artifact matrix then found the expected Internal
module absent from its exact allowlist. Both evidence defects were corrected
and the full applicable matrix repeated successfully. Core tests pass 326/326,
Angular tests pass 68/68, package smoke/consumer/artifact/clean-consumer checks
pass, and no manifest, dependency, lockfile, root export or Public contract
changed.

### 14.8 Implementation checkpoint 5

Checkpoint 5 completed on 15 July 2026. Complete implementation review cycle 1
found one policy-provenance defect: an inline array's missing policy could
inherit the reference chain of its `items` target. The diagnostic range was
closed before array-level policy evaluation, item-dependent policy failures now
receive their applicable chain explicitly, and exact exclusion/application
regressions were added.

Review 021 cycle 2 repeated the entire authority, scope, code, diagnostics,
19-scenario evidence, declarations, packages, consumers, documentation and
deferred-boundary review with zero findings. The full matrix passes 328 core
and 68 Angular tests, frozen-lockfile installation, typecheck/build, package,
artifact, repository consumer and isolated lower/upper Angular 22 consumer
checks. PLAN-011 revision 0 and M11 are complete with no Public/package drift.
