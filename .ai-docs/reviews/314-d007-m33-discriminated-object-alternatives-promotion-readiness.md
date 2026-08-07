# D-007/M33 discriminated-object-alternatives promotion readiness — Cycles 1–2

- **Date:** 2026-08-03
- **State:** Recommendation complete; Ricard's selection is pending
- **Scope:** One application-controlled string discriminator selecting one
  bounded `oneOf` alternative at an ordinary nested object field
- **Authority reviewed:** Accepted ADR-005 revision 8, ADR-014 revision 2,
  ADR-016, ADR-028 and ADR-031; Accepted SPEC-001 v0.1.15, SPEC-002
  v0.1.2, SPEC-004 v0.1.1, SPEC-011 v0.1.0 and SPEC-014 v0.1.0; completed
  PLAN-034 revision 0; current D-007, D-011, D-012, D-013, D-014 and D-018
  boundaries
- **Outcome:** Cycle 1 found two boundary ambiguities. After correction, cycle
  2 repeats all fifteen areas with zero findings and recommends promoting only
  the bounded architecture question below. No ADR identifier is reserved until
  Ricard accepts the recommendation.

## Correction and complete-review restart

| Finding  | Correction                                                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R314-F01 | Require at least two alternatives and at least two matching outer enum choices; a single `oneOf` branch is not an object-alternative capability.           |
| R314-F02 | Preserve the Accepted atomic rejection of managed accessors; only missing, safe wrong-kind or safe unknown discriminator data produces the no-match state. |

Cycle 1 cannot support selection. After both corrections, cycle 2 restarts the
complete authority, grammar, runtime, validation, UI, migration, exclusion and
documentation review rather than checking only the changed sentences.

## 1. Consumer value and smallest useful slice

Many forms contain one nested object whose shape depends on a controlled
choice, for example an `individual` versus `company` party or a `card` versus
`bank-transfer` payment method. Today consumers must model those alternatives
outside Schema Engine or expose every possible field simultaneously.

The smallest useful standards-aligned increment is not general `oneOf`
evaluation. It is one ordinary object field with a required string-enum child
that selects exactly one statically known object alternative. The application
continues to own the complete value and accepts the discriminator's ordinary
`set-value` intention before the runtime observes a different branch.

Limiting the first slice to an ordinary nested object field avoids special root
representation and per-item collection identity/lifecycle while still proving
dynamic neutral structure in core, Angular and Standard.

## 2. Recommended bounded M33 question

If Ricard accepts this recommendation, ADR-036 may design only this closed
capability:

1. an ordinary root-level or recursively nested object **property** may use one
   supported `oneOf` form; the document root, collection node, collection item
   root/template and every object below a collection item remain excluded;
2. the object has one direct required discriminator property represented by
   the existing non-null string-enum field contract, so it remains an ordinary
   selectable controlled field;
3. `oneOf` contains at least two ordinary object alternatives and the outer
   enum contains at least two choices; every alternative requires that same
   discriminator and constrains it with one exact typed string `const` drawn
   from the outer enum;
4. discriminator constants and outer enum choices have a one-to-one mapping:
   no missing, duplicate, extra or ambiguous alternative is admitted;
5. outer common-property names and alternative-specific property names are
   statically disjoint except for the discriminator assertion, and property
   names belonging to different alternatives are also disjoint;
6. the first slice derives only already accepted non-array ordinary primitive
   and nested-object descendants; collection arrays, the M31 atomic array,
   another `oneOf` and alternative-dependent composition remain outside M33;
7. current application-controlled discriminator presence/value selects the
   active alternative; missing, safely inspectable wrong-kind or unknown values
   select no alternative and never trigger inference, coercion or mutation;
   a managed accessor retains the Accepted atomic external-state rejection and
   never becomes runtime business data;
8. common children, including the discriminator, remain available when no
   alternative is active; only the selected alternative's children become
   active when selection is valid;
9. changing selection emits only the existing discriminator field intention;
   core never clears dormant values, creates the new branch, applies defaults
   or emits a transaction;
10. the original schema and complete application value remain the validator's
    authority; compilation/runtime selection is structural derivation, not a
    replacement `oneOf` validator;
11. normalized alternatives are immutable and framework-neutral; Angular and
    Standard consume the same active neutral structure without reading raw
    JSON Schema or independently choosing a branch; and
12. a shared scenario must prove selection, no-match behavior, controlled
    replacement, focus/action safety and equivalent independent Angular and
    Standard projection.

This boundary describes behavior that ADR-036 must make precise. It does not
preselect Public type names or authorize a signature.

## 3. Why the outer discriminator remains an ordinary enum field

Using only branch-local fixed `const` fields would show a discriminator but
would not provide a selectable control. Keeping the discriminator in the
outer common catalog as the existing string-enum field lets users request a
normal controlled change while each alternative's matching `const` makes the
JSON Schema branches mutually exclusive.

The branch-local discriminator is an assertion, not a second rendered field.
The architecture must normalize exactly one discriminator node and preserve
the exact original schema for Ajv. It must not flatten or rewrite `oneOf` into
UI conditions.

## 4. Controlled runtime semantics

Selection reads only the current controlled `value`, never `baselineValue`,
validation state, touched state, focus, locale or another derived result. An
external update that changes the discriminator may change the active child
tree without changing the immutable authored alternatives.

Dormant values remain application-owned data. Switching away neither deletes
nor validates them in core, and switching back may expose the values still
present. The official validator continues to evaluate the original schema and
complete value. Core only maps normalized issues to the currently active
managed tree under rules that ADR-036 and a later SPEC must close.

No-match is a stable state rather than an implicit default: the discriminator
and outer common children remain operable, no alternative-specific operation
is available, and validator issues may explain the invalid/missing choice.

## 5. Architecture questions reserved for ADR-036

ADR-036 must close, before any dialect revision, SPEC or implementation:

1. the exact descriptor-safe outer wrapper, discriminator, enum, `oneOf`
   array/index and branch catalogs, including unknown/incompatible keywords;
2. the exact Public Experimental raw/normalized representation for immutable
   alternatives and active runtime selection, preserving existing ordinary
   object definitions as valid source objects;
3. whether active identity is exposed as a discriminator value, alternative
   ID or both, without leaking raw branch schemas or an Internal cursor;
4. deterministic common/alternative ordering, canonical paths, keys, labels,
   requiredness and one UI Schema over the finite union catalog;
5. the narrow UI boundary, including whether recursive presentation is
   prohibited at the alternative use site for M33 and how inactive union
   entries are filtered without branch-owned UI;
6. discriminator/branch compatibility, local-reference eligibility and the
   precise prohibition of nested `oneOf`, arrays and composition in this
   first slice;
7. compiler and manual-definition descriptor safety, cycles, diagnostics,
   source/use-site provenance, precedence, stopping and no-partial-definition
   behavior;
8. runtime structural sharing, active-tree recomputation, no-match snapshots,
   touched retention, focus clearing, subscriptions and stale action defense;
9. issue assignment for active, inactive and object-level `oneOf` validator
   results without changing validator ownership or evaluating assertions in
   core;
10. exact interaction with dirty state and baseline when current and baseline
    select the same, different or no alternatives;
11. the ADR-009/ADR-010 Public migration, exhaustive-reader impact and future
    coordinated MINOR boundary, with no release selected now; and
12. conformance ownership across compiler/manual/runtime, Angular, Standard,
    declarations, clean/source consumers and final closure.

## 6. Material alternatives considered

| Alternative                                                          | Assessment                                                                                                                   | Outcome                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| General `oneOf`/`anyOf` evaluation                                   | Cannot statically derive one active UI for overlapping or validation-selected branches without becoming a generic evaluator. | Rejected for M33.      |
| Compile all branch fields and translate selection into `visibleWhen` | Leaks inactive nodes into definition/runtime semantics and makes JSON Schema structure depend on UI Schema conditions.       | Rejected.              |
| Fixed branch-local discriminator only                                | Preserves exclusivity but offers no ordinary selectable control and encourages application-specific branch switching.        | Rejected.              |
| Document-root plus nested alternatives                               | Adds a special implicit-root representation before the nested lifecycle is proven.                                           | Root support deferred. |
| Alternatives in collection items                                     | Requires per-item active templates, stable identity, focus and operation semantics simultaneously.                           | Deferred.              |
| Nested object property with one required string discriminator        | Delivers useful dynamic structure with one controlled selector and bounded neutral lifecycle.                                | Recommended.           |

## 7. Compatibility and delivery boundary

M33 is expected to widen Public Experimental definition/snapshot unions or
members, so exhaustive consumers may require coordinated narrowing even though
existing ordinary-object literals and behavior must remain valid. The exact
migration is an ADR decision and any release would be a later explicitly
approved coordinated MINOR.

No new package, entry point, dependency, peer range, export map, manifest,
lockfile, version, release or publication is needed or authorized by this
promotion. Ajv remains the replaceable official adapter and no target-specific
dependency enters core.

## 8. Explicit exclusions

M33 does not activate:

- document-root alternatives, collection/item/template alternatives, arrays
  in alternatives or the M31 atomic array field;
- `anyOf`, `not`, `if`/`then`/`else`, `dependentSchemas`, overlapping branches,
  non-string discriminators, inferred discriminators or validation-selected
  branches;
- nested/recursive `oneOf`, alternative-local `allOf`, branch-owned UI Schema,
  conditional presentation, declarative scopes or wizard behavior;
- automatic branch creation, clearing, migration, defaults, coercion,
  persistence, submit, batches, undo or transactions;
- a generic evaluator, Public schema AST/resolved graph, dynamic definition
  replacement or external/dynamic resources;
- M34, React/Vue, UI-kit expansion or legacy Angular; or
- ADR/SPEC/plan drafting before selection, implementation, dependency,
  version, release, publication, commit, push or external action.

## 9. Complete promotion review

| Area                                | Result | Evidence                                                                                                                                                            |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Accepted authority               | Pass   | Extends only the still-Deferred `oneOf` portion of D-007 and preserves Accepted ordinary nested objects, const, enum, references and static composition boundaries. |
| 2. Consumer value                   | Pass   | Covers a common nested party/payment-method shape without requiring a new framework adapter.                                                                        |
| 3. Bounded schema grammar           | Pass   | One nested object, one required string-enum discriminator and at least two bijective finite branches; general alternatives remain excluded.                         |
| 4. Static disjointness              | Pass   | Common and variant names are disjoint except for the single matching discriminator assertion.                                                                       |
| 5. Controlled ownership             | Pass   | Only current application value selects; the runtime emits the existing field intention and never mutates branch data.                                               |
| 6. No-match behavior                | Pass   | Common/discriminator nodes remain operable while no variant is active or inferred.                                                                                  |
| 7. Runtime readiness                | Pass   | The ADR has a closed list for active-tree sharing, dirty/touched/focus/subscription and stale-action semantics.                                                     |
| 8. Validation ownership             | Pass   | Original schema/value remain validator inputs; issue projection is explicitly an ADR question rather than core assertion evaluation.                                |
| 9. UI/target neutrality             | Pass   | One neutral alternative model drives Angular and Standard; raw branches and selection logic never move to targets.                                                  |
| 10. Collection/root isolation       | Pass   | Implicit-root and per-item lifecycle/identity complexity remain separate future gates.                                                                              |
| 11. Descriptor/diagnostic readiness | Pass   | Outer, branch, discriminator, manual, provenance, ordering and atomic-failure decisions are enumerated.                                                             |
| 12. Public migration                | Pass   | Existing ordinary definitions must remain valid; widened Experimental readers and later MINOR coordination are explicit.                                            |
| 13. Dependency/release boundary     | Pass   | No dependency, package, manifest, version, release or publication is selected.                                                                                      |
| 14. Future milestone isolation      | Pass   | M34, React and every wider D-007/D-011/D-012 capability remain inactive.                                                                                            |
| 15. Documentation consistency       | Pass   | STATUS, ROADMAP sequence, Accepted authorities and Deferred register all identify M33 as the next gated capability.                                                 |

## 10. Result and selection gate

Cycle 2 completes the repeated full fifteen-area review with zero findings and
no unresolved documentation conflict. The recommendation is ready for Ricard's
selection but does not itself promote M33 or reserve an ADR.

Acceptance would promote only this bounded D-007/M33 architecture question and
reserve ADR-036 for it. It would authorize drafting and completely reviewing
ADR-036, not an ADR-005 revision, SPEC, plan, Public contract, implementation,
dependency, version, release, publication, Git or external action.

## Selection follow-up

Ricard accepted the recommendation on 3 August 2026. The selection promotes
only the bounded nested-object architecture question in section 2 and reserves
ADR-036 for it. It does not accept an architecture, change the active dialect
policy or authorize an ADR-005 revision, SPEC, plan, implementation,
dependency, version, release, publication, Git or external action.
