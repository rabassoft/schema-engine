# PLAN-019: Reusable synchronous Ajv validator

- **Status:** Completed revision 1
- **Date:** 2026-07-17
- **Approval date:** 2026-07-17
- **Complete review:** [`review 085`](../reviews/085-plan-019-review.md) cycle 2
  passed all twelve areas with zero findings
- **Implementation authorized:** Yes — checkpoints 1–4 only; publication,
  commit, push, network fallback and external settings remain separate gates
- **Implementation state:** Checkpoints 1–4 completed after reviews 086–089;
  final review 089 cycle 2 passed with zero findings
- **Requires:** Accepted ADR-022 revision 1 and SPEC-007 v0.1.0
- **Milestone:** M17 — Reusable synchronous JSON Schema validator

## 1. Goal and boundary

Deliver the private `@rabassoft/schema-engine-validator-ajv` package and migrate
the Angular and Standard reference shells to it so applied supported schema
edits participate in real validation. No core/Angular Public source or contract,
catalog fixture, published version, registry state or external setting changes.

## 2. Exact dependency mutation

Checkpoint 1 may run offline against the already resolved graph:

```sh
pnpm --offline --filter @rabassoft/schema-engine-validator-ajv add --save-exact ajv@8.20.0
```

The package manifest is created first with core workspace peer/dev ownership.
The expected lock change is one workspace importer referencing the existing
Ajv resolution. If offline resolution fails, stop; network access needs separate
authorization. No lifecycle script, browser download or external write is
allowed.

Revision 1 additionally owns exact `ajv@8.20.0` in root `devDependencies` as
the Angular/Vite virtual-root resolution bridge. The Angular bootstrap loads the
validator package dynamically before creating the application; the dependency
is not added directly to core, Angular package or either app.

## 3. Checkpoint 1 — Package foundation and contract tests

1. Add private ESM package manifest, strict build/type/test configs, license
   notices, README and explicit root export.
2. Apply the exact offline dependency mutation and inspect manifest/lock scope.
3. Implement `createAjvSchemaValidator()` with fixed Ajv2020 options, per-factory
   cache and no Public configuration surface.
4. Implement RFC 6901 path typing, keyword refinements, deep detached freezing
   and exact immutable results.
5. Test valid/invalid, all errors, local refs, ignored formats/extensions,
   compilation/async failures, non-mutation and cache identity.
6. Add package smoke and root-only boundary checks; ensure Public declarations
   expose only the factory and core types.

Gate: frozen/offline install, format, lint, package types/build/tests/smoke,
core tests and scoped declaration/diff checks pass.

## 4. Checkpoint 2 — Angular integration

1. Add only the validator package as a private Angular app workspace dependency.
2. Create one validator in the shell composition root and replace interactive
   runtime/direct validation uses of `scenario.validator`.
3. Retain catalog validators for transition fixture tests and catalog authority.
4. Correct the schema-editor caveat to state that the applied supported schema
   is validated by the reusable Draft 2020-12 integration.
5. Add a regression that applies a supported new constraint/property and proves
   invalid then valid behavior without remount leakage.

Gate: Angular app unit/build/Chromium-focused evidence, package/core/Angular
Public regression, snippets and boundaries pass.

## 5. Checkpoint 3 — Standard integration

1. Add only the validator package as a private Standard app workspace dependency.
2. Use one validator across fresh controlled runtimes and active evidence.
3. Add or extend editable schema/reference UX only as already authorized by
   PLAN-018 checkpoint 5; do not absorb unrelated UX into M17.
4. Test a newly applied compiler-supported constraint through Standard state and
   DOM evidence, plus scenario replacement and cleanup.

Gate: all Standard unit/build tests and both-shell/core/catalog/boundary
regressions pass. PLAN-018 checkpoint 5 remains separately reviewed.

## 6. Checkpoint 4 — Complete repeated review and handoff

1. Run formatting/check, lint, docs check, strict types, recursive builds/tests,
   package smoke/source/artifact isolation, both reference unit/build suites and
   focused browser evidence where available.
2. Inspect Public manifests/exports/declarations, lockfile ownership, generated
   artifacts and the complete scoped diff. Preserve unrelated `angular.json`.
3. Repeat the complete implementation review after every correction until one
   full pass has zero findings.
4. Mark PLAN-019/M17 complete, compact STATUS, prepend WORKLOG and resume the
   exact next action at PLAN-018 checkpoint 5.

## 7. Stop conditions

Stop for any core/public Angular contract change, configurable factory,
additional dependency/plugin, compiler vocabulary expansion, async/remote
validation, publication/version/release work, network fallback, destructive
action, commit, push or unresolved authoritative-document conflict.
