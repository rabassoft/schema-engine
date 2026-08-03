# Review 308: PLAN-034 checkpoint 1

- **Date:** 2026-08-03
- **Plan:**
  [`PLAN-034 revision 0`](../plans/034-flat-compound-field-conditions.md)
- **Authority:** Accepted
  [`SPEC-018 v0.1.0`](../specs/018-flat-compound-field-conditions.md) rows 1–9
  and [`ADR-035 revision 0`](../adrs/035-flat-compound-field-conditions.md)
- **Boundary:** Public predicate/group unions, raw compiler grammar,
  diagnostics/linking, immutable normalization and unchanged complete M30
  single-predicate behavior only
- **Method:** two complete review cycles after four implementation/evidence
  corrections
- **Result:** cycle 2 passes all twelve areas and SPEC-018 rows 1–9 with zero
  findings

## Cycle 1

The complete checkpoint diff and all first-owning evidence were reviewed
against ADR-035, SPEC-018, unchanged SPEC-016/M30 behavior and PLAN-034.

### Findings and corrections

1. An empty `conditions` array stopped inspection before an independent extra
   enumerable key could be diagnosed. Array inspection now reports
   `condition-group-empty` first and the extra-key
   `condition-member-invalid` second; a focused regression freezes that order.
2. The new serializable conformance fixture modeled an integer field with a
   nonexistent `kind: 'integer'` definition. It now uses the established
   `kind: 'number'`, `numericType: 'integer'` and exact `ui` shape in nodes,
   fields and presentation.
3. The initial unsupported-template test authored the condition on the
   collection identity field and therefore proved the `identity` branch, not
   the intended `template-field` branch. A distinct template value field now
   proves that exclusion while the existing identity evidence remains intact.
4. Strict lint found unsafe `any` inference in the validated operator
   assignment and sparse test array. Both sites now narrow/type explicitly
   without weakening the Public contract or lint policy.

Because the findings changed implementation or evidence, the complete review
restarted.

## Cycle 2 — complete repeated review

| Area                                                                                | Result |
| ----------------------------------------------------------------------------------- | ------ |
| 1. Exact four Public root types and only two widened condition properties           | Pass   |
| 2. Existing raw/manual single-predicate assignability and complete M30 behavior     | Pass   |
| 3. Direct/nested/reference/composition all/any compilation and exact order          | Pass   |
| 4. Own-enumerable family classification, mixed/default behavior and accessor safety | Pass   |
| 5. Operator/conditions/member grammar, empty/dense/extra-key and no nesting         | Pass   |
| 6. Exact reasons, safe parameters, paths, unknown warnings and diagnostic order     | Pass   |
| 7. Complete semantic member linking, member indices and schema-blocked suppression  | Pass   |
| 8. Detached frozen group/array/predicate/path layers and duplicate identity         | Pass   |
| 9. Object/collection/item/template/M31 authoring/source/target exclusions           | Pass   |
| 10. Mechanical downstream narrowing with no compound runtime/target behavior        | Pass   |
| 11. Core declarations/runtime export inventory and full workspace buildability      | Pass   |
| 12. Scope, graph, formatting, lint, tests, docs and diff hygiene                    | Pass   |

### Row audit

| SPEC-018 row | First complete evidence                                                             | Result |
| ------------ | ----------------------------------------------------------------------------------- | ------ |
| 1            | Public type checks plus existing compiler/manual/runtime suites                     | Pass   |
| 2            | Source and emitted root declarations with exhaustive raw/normalized narrowing       | Pass   |
| 3            | Valid direct and nested local-reference/allOf all/any test plus conformance fixture | Pass   |
| 4            | Enumerable/non-enumerable/accessor/mixed/default family tests                       | Pass   |
| 5            | Missing/invalid/accessor operator and conditions exterior tests                     | Pass   |
| 6            | Empty, sparse, non-enumerable/accessor index and extra-key tests                    | Pass   |
| 7            | Non-object/mixed/nested member, path/literal and unknown-order tests                | Pass   |
| 8            | Ordered complete semantic failures and schema-blocked suppression test              | Pass   |
| 9            | Duplicate-preserving detached deep-freeze assertions                                | Pass   |

### Verification evidence

- Workspace ESLint passes with zero findings.
- Core typecheck/build and all 47 test files / 784 tests pass.
- Compiler conformance includes the new valid compound fixture; focused M30
  and M32 compiler suites pass.
- Full workspace build/typecheck passes outside the known restricted-sandbox
  Angular abort boundary. Existing Angular bundle/Ajv and Standard chunk
  warnings remain observations only.
- Emitted declarations contain exactly the four new types and two widened
  properties; the runtime root inventory remains the same six functions.
- Formatting, documentation links, public-tree policy and diff hygiene pass;
  no dependency, manifest, lockfile, package/version, release or Git action is
  present.

## Conclusion

Cycle 2 produced zero findings and no unresolved change request. PLAN-034
checkpoint 1 and SPEC-018 rows 1–9 are complete. This review authorizes only
checkpoint 2 next; compound runtime behavior remains absent until that
checkpoint and every external/version/release/Git action remains gated.
