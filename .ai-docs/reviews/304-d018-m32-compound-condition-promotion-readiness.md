# D-018/M32 compound-condition promotion readiness — Cycles 1–2

- **Date:** 2026-08-03
- **State:** Complete; bounded architecture question promoted
- **Selection:** Ricard accepted the recommended M32-first sequence on
  2026-08-03: M32 compound conditions, then bounded M33 discriminated object
  alternatives, M34 declarative wizard work and only afterwards React
- **Scope:** Flat declarative `all`/`any` composition of the already accepted
  M30 equality predicates for ordinary primitive-field visibility and enabled
  state
- **Authority reviewed:** Accepted ADR-033 revision 0 and SPEC-016 v0.1.1;
  completed PLAN-032 revision 1 and PLAN-033 revision 0; current D-018,
  D-007, D-011, D-012, D-026 and D-044 boundaries
- **Outcome:** Cycle 1 found one Public migration ambiguity. After correction,
  cycle 2 repeated all fourteen areas with zero findings. ADR-035 is reserved
  only for the bounded M32 architecture question below.

## Cycle 1 finding and correction

The initial boundary called existing single-predicate manual definitions
“source-compatible” without distinguishing authored object literals from
consumers that read the widened condition property. The boundary now guarantees
that existing predicate objects remain assignable and behavior-compatible while
requiring exhaustive readers to narrow the new Experimental union. Cycle 1
cannot support promotion.

## 1. Product sequencing and consumer value

Ricard has chosen to mature framework-neutral functionality before adding the
first React adapter, so that future targets inherit stable behavior instead of
repeating every intermediate target migration. Angular and the independent
Standard projection continue to provide two implementations for portability
evidence during that interval.

M30 already lets one ordinary primitive field derive `visible` and `enabled`
from one exact equality predicate. Real forms commonly need a small compound
rule such as “country is Spain **and** customer type is company” or “role is
admin **or** owner”. A flat finite group adds that value while preserving the
existing controlled snapshot and renderer boundary.

This review promotes only M32. The accepted future ordering records product
intent but does not promote M33, M34, React or any associated deferred entry.

## 2. Exact promoted boundary

ADR-035 may design only the following closed capability:

1. each existing ordinary primitive `visibleWhen` or `enabledWhen` condition
   accepts either the existing single M30 predicate or one flat non-empty
   group of M30 predicates;
2. a group selects exactly one operator: `all` or `any`;
3. every group member retains M30's exact absolute ordinary primitive source
   path, primitive/nullable equality literal, descriptor-safety and
   source-kind compatibility rules;
4. `all` matches only when every member matches; `any` matches when at least
   one member matches; missing, missing-ancestor and incompatible-ancestor
   presence remain non-matches at predicate level;
5. evaluation reads only the current immutable application-controlled value
   and uses the existing exact `Object.is` predicate semantics;
6. existing single-predicate authoring/manual definition object literals
   remain assignable and behavior-compatible, while readers of the widened
   property must narrow the new union;
7. normalized groups are detached, deeply immutable and deterministic, with
   authored member order retained for diagnostics and evidence;
8. public snapshots remain exactly the existing required `visible` and
   `enabled` booleans; no target receives an expression tree or evaluates a
   condition;
9. core retains the final hidden/disabled action gate and every M30 value,
   validation, dirty, focus, scope, issue and mounted-host invariant; and
10. Angular and Standard prove the same shared authored compound scenarios
    through independent target behavior without sharing renderer logic.

## 3. Architecture questions reserved for ADR-035

ADR-035 must close, before any SPEC or implementation:

1. the exact backward-compatible raw and normalized discriminated shapes;
2. own/enumerable data-property and hostile-descriptor inspection for the
   group exterior, operator member, predicate array and every indexed member;
3. prohibition of empty, sparse, mixed-operator, nested and recursively
   composed groups;
4. duplicate predicate policy and deterministic member ordering;
5. exact compiler and manual-definition diagnostics, parameters, paths,
   precedence, cascade suppression and atomic failure behavior;
6. whether short-circuiting is observable or prohibited by requiring complete
   descriptor validation before runtime evaluation;
7. structural sharing and evaluation frequency on current-value versus
   baseline/locale/touched/validation-only updates;
8. focused-field reconciliation and stale target action defense when a group
   changes its derived result;
9. the exact Public Experimental type migration and future coordinated MINOR
   boundary under ADR-009/ADR-010; and
10. conformance ownership across compiler, manual definitions, runtime,
    Angular, Standard, declarations/consumers and final closure.

The ADR must not select a Public name merely because this review uses the
behavioral terms `all` and `any`.

## 4. Why no expression engine or dependency graph is required

Every member remains one pure M30 equality predicate. A flat group combines
booleans produced from the same immutable controlled value; it cannot read a
derived condition result, call application code, mutate data or trigger an
operation. Self and mutual field references therefore remain evaluation-safe
for the same reason as M30.

A graph, cache invalidation protocol, expression parser or recursive AST would
add a broader contract without changing this bounded result. Linear normalized
field-order evaluation remains sufficient until measured scale or a later
capability needs dependency-aware incremental recomputation.

## 5. Target and collection boundary

M32 retains M30's exact ordinary primitive target and source boundary. It does
not add condition authoring to collection templates/items, objects,
presentation containers or the M31 atomic string-enum array field. Existing
collection-item and M31 snapshots remain unconditionally visible/enabled under
their accepted contracts.

Angular and Standard already consume neutral `visible`/`enabled` booleans, so
they must not inspect group definitions. Target work is limited to regression,
shared-scenario parity, focus/action safety and accessibility evidence unless
the later SPEC identifies an existing M30 defect.

## 6. Compatibility and delivery boundary

M32 may widen existing Public Experimental condition types but must preserve
valid M30 single-predicate source objects and runtime behavior. Any declaration
change requires exact package, built/clean consumer and isolated-source
evidence. A future release, version or publication remains a separately
approved coordinated MINOR decision; published M23 artifacts stay unchanged.

No dependency, manifest, peer range, export map, package entry point or
lockfile change is expected or authorized by this promotion.

## 7. Explicit exclusions

M32 does not activate:

- recursive/nested groups, mixed operators, `not`, inequality, comparison,
  membership, pattern, arithmetic, callbacks or expression strings;
- conditions on objects, collections/items/templates, M31 arrays,
  presentation nodes or unmanaged values;
- relative paths, item addresses, baseline/dirty/validity/touched/focus/locale
  inputs or another predicate's derived result;
- dynamic `required`, readonly, computed values, conditional defaults,
  conditional validation, value clearing or generated operations;
- a dependency graph, incremental condition cache or public expression AST;
- M33 `oneOf`, M34 wizard/scopes/workflow, D-021 transactions, D-031 error
  policies, D-013 hot definitions or remaining D-007/D-011/D-012 scope;
- React, Vue, D-026 adapter capabilities, D-025 theming, D-035 public
  implementation specification or D-045 legacy Angular; or
- dependency, version, release, publication, commit, push or external action.

## 8. Future sequence without premature promotion

After M32 is completely delivered, a new selection/promotion gate may evaluate
M33 as a bounded discriminated object-alternative slice of D-007. Only after
that independent completion may M34 evaluate declarative steps/wizard behavior
across D-011/D-012. React remains a later D-026/D-044 decision after those
functional milestones. This ordering is intent, not implementation authority.

## 9. Complete promotion review

| Area                               | Result | Evidence                                                                                                    |
| ---------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| 1. Accepted authority              | Pass   | Extends only ADR-033/SPEC-016's existing equality predicates and snapshot flags.                            |
| 2. Consumer value                  | Pass   | Covers common conjunction/disjunction without another target-owned behavior.                                |
| 3. Bounded grammar                 | Pass   | One single predicate or one flat non-empty all/any group; recursive expression scope excluded.              |
| 4. Controlled ownership            | Pass   | Reads immutable current value only and emits no data operation.                                             |
| 5. Evaluation semantics            | Pass   | M30 presence/Object.is semantics compose deterministically; no derived-state dependency exists.             |
| 6. Target neutrality               | Pass   | Angular/Standard continue consuming booleans and never evaluate definitions.                                |
| 7. Collection/M31 compatibility    | Pass   | Templates/items and atomic arrays remain unconditional and outside authoring/source/target scope.           |
| 8. Validation and operations       | Pass   | Full validation, issues, dirty, scopes, focus and hidden/disabled action precedence remain unchanged.       |
| 9. Descriptor/diagnostic readiness | Pass   | ADR-035 has a closed list of hostile-shape, ordering, path and atomicity decisions to resolve.              |
| 10. Public/package migration       | Pass   | Single objects stay assignable; exhaustive readers narrow the Experimental union under a future-MINOR gate. |
| 11. Dependency/release boundary    | Pass   | No graph/dependency/package/version/release mutation is selected or expected.                               |
| 12. Future milestone isolation     | Pass   | M33, M34 and React ordering is recorded without promoting their contracts.                                  |
| 13. Documentation consistency      | Pass   | D-018, completed M30/M31 and the next-action boundary agree.                                                |
| 14. Architectural next gate        | Pass   | ADR-035 is the next global identifier and is reserved only for this M32 decision.                           |

## 10. Result

Cycle 2 repeats all fourteen areas with zero findings and no unresolved change
request. The bounded D-018/M32 architecture question is promoted and ADR-035
is reserved. No Public contract, SPEC, plan, implementation, dependency,
version, release, publication or Git action is authorized by this review.
