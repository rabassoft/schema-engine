# D-018/M30 controlled conditional-field-state promotion review — Cycles 1–2

- **Date:** 2026-08-03
- **State:** Complete; bounded architecture question promoted
- **Selection:** Ricard accepted the recommended D-018 direction on
  2026-08-03
- **Scope:** Promotion readiness for declarative visibility and enabled state
  on ordinary primitive fields
- **Authority reviewed:** Accepted SPEC-001 v0.1.15, SPEC-002 v0.1.2,
  SPEC-003 v0.1.2, SPEC-006 v0.1.1, SPEC-008 v0.1.0 and SPEC-009 v0.1.0;
  Accepted ADR-014, ADR-015, ADR-019, ADR-023 and ADR-025; completed M29;
  current D-018 register boundary
- **Outcome:** Cycle 1 found one transitive snapshot-migration ambiguity. After
  correction, cycle 2 passes all twelve areas with zero findings. The
  prerequisite is satisfied and one narrow M30 architecture question is ready:
  deterministic equality predicates over application-controlled values for
  ordinary primitive-field visibility and enabled state. ADR-033 is reserved
  for that design only.

## Correction and complete-review restart

| Finding                                                                                                                                                   | Correction                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The ordinary-only wording did not say how required conditional-state members could coexist with the shared `FieldRuntimeSnapshot` used by item instances. | Allow the shared snapshot shape to widen while requiring every collection-template/item field to remain unconditionally `visible: true` and `enabled: true`; authoring/evaluation stays excluded. |

After this correction, cycle 2 restarted consumer, scope, ownership, runtime,
collections, validation, presentation, compatibility, delivery,
documentation and exclusion review in full.

## 1. Consumer value and prerequisite

The reference consumers already demonstrate static, nested and collection
forms, controlled external state, neutral snapshots and independent Angular and
Standard projection. The product can now show a genuinely dynamic interaction
without introducing another framework or deployment surface: a consumer may
show or enable one ordinary primitive field when another ordinary primitive
field has an expected controlled value.

D-018's historical restart condition is satisfied for this slice. Static and
nested forms are consolidated, field identity is canonical, external value
updates are atomic and both maintained targets can prove the same semantics.
The wider expression-engine and dependency-graph problem is not thereby ready.

## 2. Promoted M30 boundary

The architecture may design only this closed capability:

1. an ordinary primitive field outside every collection item template may
   declare at most one visibility predicate and at most one enabled predicate;
2. each predicate compares one exact ordinary managed primitive source path
   with one schema-compatible primitive or nullable literal;
3. comparison uses controlled current `value`, exact presence and `Object.is`;
   a missing or structurally blocked source does not match;
4. no predicate writes data, invokes application code or depends on baseline,
   validation, touched, focus, locale, layout state or another predicate's
   result;
5. visibility and enabled state are derived neutral runtime snapshot state;
   defaults are visible and enabled when the corresponding predicate is absent;
6. a hidden field remains part of the definition, value, dirty calculation,
   validation and issue ownership but is removed from visual, sequential-focus
   and accessibility projection;
7. a disabled field remains visible but cannot emit value, remove, null, focus
   or blur intentions; core remains the final action gate independently of a
   target renderer;
8. retained target hosts preserve their private buffers and lifecycle while
   hidden or disabled, and reconcile confirmed external state normally; and
9. Angular and Standard consume the same normalized/runtime semantics through
   independent target code and shared authored evidence.

The architecture must decide the exact raw and normalized names, descriptor-
safe grammar, literal compatibility, absolute-path resolution, evaluation
order, snapshot members, action result, diagnostics, structural sharing,
mounted-hidden behavior, accessibility and Public/Internal migration. This
review intentionally does not select those contract spellings.

## 3. Why the slice needs no expression engine or dependency graph

Every promoted predicate reads only the authoritative external value and
produces only presentation/interaction state. Predicates cannot read other
predicate results, modify data or trigger operations. Core can therefore
evaluate them deterministically in normalized field order on initial state and
on an accepted external value-reference change.

Cycles in authored source/target references do not create evaluation cycles:
each side independently reads the same immutable controlled value. A general
dependency graph would add cache invalidation, graph diagnostics and lifecycle
surface without changing the result of this bounded slice. Incremental graph
evaluation remains Deferred until measured scale or richer expressions require
it.

## 4. Authority and ownership compatibility

- The application remains the sole owner of `value` and `baselineValue`.
- The compiler alone interprets raw UI metadata and emits normalized
  definitions; renderers never inspect raw schema or UI Schema.
- Runtime derives state without mutating value or emitting operations.
- The exact original JSON Schema and complete value still go to the validator.
- Hidden/disabled does not change `required`, validity, dirty, scopes, issues or
  baseline and never removes or clears a field.
- Presentation containers remain static and target-owned; M30 changes only the
  projection of a wrapped primitive field, not tabs/panels/grids themselves.
- No framework type, Signal, RxJS primitive, DOM concept or browser global
  enters core.

These rules preserve SPEC-001/002 controlled-state and validation authority,
SPEC-008/009 mounted static-layout behavior and ADR-023/025's prohibition on
layout-generated workflow or scopes.

## 5. Collection boundary

Collection item templates and their concrete item instances remain excluded.
Their source addresses require a separate decision among item-relative,
collection-relative and root-absolute semantics, plus stable-item identity and
movement behavior. M30 therefore admits neither authored conditions on a
`FieldTemplate` nor a source path containing a collection position or stable
item address.

Ordinary fields may coexist with a collection elsewhere in the form, but an
M30 predicate may target and read only exact non-template primitive fields.
The shared `FieldRuntimeSnapshot` may gain required conditional-state booleans;
every collection item leaf must expose the constant defaults `visible: true`
and `enabled: true`. That transitive shape migration does not add item
authoring, evaluation, routing or behavior and must be explicit in ADR-033.

## 6. Validation and hidden-issue boundary

Conditional visibility is not conditional JSON Schema evaluation. The
validator still sees the unchanged complete schema and controlled value, and a
hidden field may remain invalid. Runtime validity and issue arrays remain
truthful; the target simply does not project that field while hidden.

The reference scenario must use an optional conditional field or otherwise
make this consequence explicit. Suppressing validation, rewriting `required`,
filtering hidden issues or mapping the rule to `if`/`then` would activate D-004,
D-007 or dynamic-required D-018 scope and is not allowed in M30.

## 7. Interaction and lifecycle boundary

Hidden and disabled fields are non-interactive even if a stale target instance
attempts an action. ADR-033 must specify one deterministic core rejection
boundary after ordinary argument/path/disposed checks and before operation
construction or interaction mutation.

Targets keep the field host mounted so a false/true transition does not replace
renderer identity, lose Signal Forms/DOM edit buffers or create divergent
Angular/Standard lifecycle semantics. Hidden projection must remove the field
from display, sequential focus and the accessibility tree; disabled projection
must expose native/target-idiomatic disabled semantics. External confirmation,
rejection and locale changes continue to reconcile without domain emission.

## 8. Public and compatibility boundary

A future observable contract is expected to widen existing Public +
Experimental core UI/definition/snapshot contracts and transitively the shared
item snapshot plus Angular renderer snapshot input. Item snapshots may carry
only constant true defaults under M30. ADR-033 must enumerate every changed or
new symbol and avoid exposing an evaluator callback, graph, raw UI node or
framework type.

Any later released incompatible Experimental declaration change requires at
least the ADR-010 release treatment and migration evidence. M30 does not select
or mutate a package version, peer range, manifest, lockfile, export map,
dependency, tag or registry state.

## 9. Rejected promotion alternatives

### Arbitrary string or JavaScript expressions

Rejected because parsing, sandboxing, coercion, security, dependency discovery
and error provenance would define a general language before a bounded consumer
proves it.

### Callbacks supplied to runtime or renderers

Rejected because callbacks are not serializable metadata, can observe mutable
framework/application state and make evaluation/diagnostics non-deterministic.

### JSON Schema `if`/`then`/`else`

Rejected because assertion/evaluation semantics belong to D-007 and do not by
themselves define presentation visibility or interaction enabled state.

### Compound AND/OR/NOT rules

Rejected for M30 because a single equality predicate proves ownership,
recomputation and target behavior first. Composition remains part of wider
D-018.

### Collection-template predicates

Rejected for M30 because static template definitions need concrete stable-item
address semantics that ordinary absolute paths do not provide.

### Destroy hidden field hosts

Rejected because it would discard target-local edit buffers and focus/lifecycle
identity and could make framework implementations observably different.

## 10. Explicit exclusions

M30 does not activate:

- arbitrary expressions, operators other than one exact equality predicate,
  boolean composition, callbacks, scripts or plugins;
- a dependency graph, incremental dependency cache or Public evaluator;
- dynamic `required`, computed values, conditional defaults, coercion,
  clearing, initialization or operations;
- conditions on objects, arrays, collection templates/items, presentation
  sections/containers/panels/grids, scopes, actions or issues;
- conditional validation, issue filtering, schema rewriting, persistence,
  submit, workflow, wizard navigation or declarative scopes;
- dynamic `FormDefinition` replacement, React, Vue, legacy Angular, another UI
  kit or adapter-capability work;
- a package, entry point, dependency, version, release, publication, commit,
  push or external-system action; or
- SPEC, plan or implementation before their later gates.

## 11. ADR-033 required questions

ADR-033 must close, without implementing:

1. exact raw/normalized contracts and literal/type compatibility;
2. path identity, self/cross references and ordinary-versus-template
   classification;
3. descriptor-safe inspection, malformed/unknown source diagnostics, order,
   stopping and atomic compiler behavior;
4. initial/update evaluation, missing/blocked source semantics and snapshot
   structural sharing;
5. hidden/disabled action precedence, diagnostics and interaction cleanup;
6. validation, issues, scopes, dirty, baseline and presentation-container
   non-effects;
7. mounted target projection, focus/accessibility and independent
   Angular/Standard evidence;
8. complete ADR-009 Public/Internal inventory and ADR-010 compatibility
   treatment; and
9. all wider D-018 and unrelated Deferred exclusions.

## 12. Gate result

Cycle 2 passes consumer demand, prerequisite, controlled ownership, normalized
compiler/runtime separation, validation fidelity, nested/presentation
compatibility, collection exclusion, framework neutrality, Public API risk,
delivery safety, documentation and explicit-exclusion review with zero
findings.

Ricard's selection promotes only this bounded D-018 question as M30 and
reserves ADR-033 for its architecture. It does not accept an architecture,
activate an observable contract or authorize SPEC, plan, implementation,
dependency, version, release, Git or external action.
