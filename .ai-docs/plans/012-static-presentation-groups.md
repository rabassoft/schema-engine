# PLAN-012: Static neutral presentation groups

- **Status:** Completed
- **Date:** 2026-07-15
- **Approval date:** 2026-07-15
- **Completion date:** 2026-07-15
- **Review revision:** 1
- **Complete review:**
  [`review 025`](../reviews/025-plan-012-review.md) cycle 2 passed all ten areas
  with zero findings after two corrections; approved under Ricard's standing
  authorization
- **Implementation authorized:** Yes — checkpoints 1–5 only
- **Implementation review:**
  [`review 026`](../reviews/026-plan-012-implementation-review.md) cycle 6 passed
  all ten areas and the complete verification matrix with zero findings after
  seven corrections across cycles 1–5
- **Requires:** accepted
  [`SPEC-005 v0.1.1`](../specs/005-static-presentation-groups.md),
  [`ADR-017 revision 0`](../adrs/017-grupos-presentacion-estaticos.md),
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md),
  [`ADR-014 revision 2`](../adrs/014-modelo-objetos-anidados-paths-profundos.md)
  and [`ADR-015 revision 4`](../adrs/015-modelo-colecciones-identidad-operaciones.md)
- **Milestone:** M12 — Static neutral presentation groups
- **Promoted capability:** [`D-042`](../roadmap/deferred-decisions.md)

## 1. Goal and boundary

Implement the exact accepted D-042 pipeline:

```text
root UI presentation
  -> descriptor-safe atomic inspection
  -> immutable exact-once presentation forest
  -> unchanged runtime node snapshots
  -> fixed accessible Angular section projection
```

Only root form nodes can be grouped. D-011/D-012, nested/item groups, advanced
layout, layout state, actions, generated scopes, container registries and
adapter capabilities remain inactive. Approval authorizes only checkpoints
1–5 below and no publication or Stable promotion.

## 2. Public migration inventory

Implement exactly the seven new Public core symbols in SPEC-005 section 4,
required `FormDefinition.presentation`, optional root `UiSchema.presentation`
and widened `TextResolutionContext`. `SchemaFormDirective` changes behavior but
not signature. No Public Angular symbol, package, entry point, dependency,
version or export map is added.

All repository manual definitions, declaration assertions, package smoke and
clean consumers migrate in the same checkpoint as the required contract. No
compatibility alias or optional normalized property is permitted.

## 3. Checkpoint 1 — Contracts and manual definitions

1. Add the seven contracts to `packages/core/src/contracts.ts` and root exports
   to `packages/core/src/index.ts`.
2. Make the compiler emit the required default `form-node` wrapper forest for
   every successful definition, without inspecting root UI `presentation` yet.
3. Add one Internal iterative presentation-definition validator/shared helper
   if needed by runtime and form operations.
4. Extend runtime and `applyFormOperation()` malformed-definition validation
   with the nine accepted reasons, exact identity, keys, cycles and membership.
5. Migrate every repository manual `FormDefinition` and existing expected
   compiler/conformance output to the default wrapper forest without changing
   data/runtime expectations.
6. Add focused contract, runtime and operation tests proving invalid forests
   stop before validator/operation execution.

Gate: core build/typecheck plus focused contract/runtime/operation suites pass;
root declarations show exactly the accepted migration and no compiler section
behavior is active yet.

## 4. Checkpoint 2 — Compiler normalization

1. Extend only root UI inspection with iterative descriptor-safe
   `presentation` traversal.
2. Implement every `INVALID_UI_PRESENTATION` reason, parameter, path,
   precedence and deterministic order from SPEC-005.
3. Normalize exact node references, nested frozen sections and canonical keys.
4. Emit the required default forest when presentation is absent or any
   presentation defect occurs; unrelated unknown/opaque warnings do not trigger
   fallback.
5. Reject nested object/array/item presentation with exact paths while
   continuing independent UI work.
6. Add serializable conformance fixtures plus programmatic accessor, sparse,
   cycle, reuse, deep, prototype and hostile-name tests.

Gate: compiler/conformance suites cover SPEC-005 scenarios 1–10 and all M1–M11
compiler fixtures remain exact.

## 5. Checkpoint 3 — Angular projection

1. Add an Internal recursive presentation outlet and fixed section host using
   inline `ViewContainerRef` ownership consistent with ADR-008.
2. Change `SchemaFormDirective` projection from root nodes to the accepted
   presentation forest, mapping exact root nodes to existing snapshots.
3. Extend the Internal text projector with section label context, failure
   fallback and projection identity; add no Public Angular text type.
4. Implement collision-free section DOM IDs and semantic
   `fieldset`/`legend` markup.
5. Implement exact `SECTION_HOST_INSTANTIATION_FAILED` isolation and lifecycle
   cleanup.
6. Prove existing leaf renderers, object/collection/item hosts, stable item
   focus and Signal Forms ownership remain unchanged.

Gate: focused section projection/text/accessibility/lifecycle tests and the
complete Angular suite pass.

## 6. Checkpoint 4 — Conformance, packages and consumers

Map all 18 SPEC-005 scenarios to concrete evidence. Extend conformance fixtures,
root declaration assertions, core/Angular package smoke, exact packed-artifact
allowlists, repository consumer and lower/upper Angular 22 clean consumers.

Prove:

- exact original schema identity still reaches `SchemaValidator`;
- runtime/operation/scope results are presentation-independent;
- all normalized arrays/objects/diagnostics are immutable and raw hostile input
  is not retained;
- root exports include exactly the seven accepted symbols;
- deep imports remain blocked; and
- manifests, dependencies, lockfile, versions, publication and Stable status
  are unchanged.

Gate: every scenario row has named passing evidence and the full package/
consumer matrix is green.

## 7. Checkpoint 5 — Final repeated review

Inspect the complete M12 authority, production/test diff, declarations,
packages, documentation and deferred boundaries. Correct every finding and
repeat the complete implementation review plus full verification matrix until
one cycle passes with zero findings.

Only then mark PLAN-012 and M12 complete, compact STATUS to no active task and
record the final WORKLOG entry. Do not publish, commit or push.

## 8. SPEC-005 evidence matrix

| Scenario group                       | Required evidence                                                      |
| ------------------------------------ | ---------------------------------------------------------------------- |
| 1–4 defaults/order/atomic root nodes | compiler fixtures and exact identity/order assertions                  |
| 5 diagnostics                        | one assertion per reason plus combined precedence/order cases          |
| 6 order/nested conflicts             | root and every nested UI location with exact paths                     |
| 7 hostile names/IDs                  | programmatic punctuation, whitespace, `__proto__`, surrogate cases     |
| 8 hostile structures                 | accessor, sparse, cycle, reuse, deep and prototype tests               |
| 9 fallback                           | multi-finding atomic fallback preserving all root nodes                |
| 10 immutability/identity             | reflection and mutation assertions over complete forests               |
| 11 manual failures                   | every detailed reason and validator/operation non-invocation           |
| 12 text                              | success plus exception/non-string/blank and locale identity            |
| 13 accessibility                     | exact nested markup, labels and collision-free IDs                     |
| 14 host failure                      | partial destruction, one diagnostic and sibling continuation           |
| 15 adapter invariance                | leaf/object/collection/item/Signal Forms regression suites             |
| 16 runtime invariance                | snapshots, scopes, operations, validator identity and controlled state |
| 17 packages                          | declarations, smoke, tarballs and clean core/Angular consumers         |
| 18 M1–M11                            | complete existing core/Angular matrix with absent presentation         |

## 9. Expected production diff

Expected files:

- `packages/core/src/contracts.ts` and `packages/core/src/index.ts`;
- `packages/core/src/compiler.ts`;
- the existing core runtime/operation validation paths and at most one shared
  Internal presentation-definition helper;
- `packages/angular/src/form.directive.ts`, `node-outlet.ts` and `text.ts`; and
- no change to `packages/angular/src/index.ts` or any Public Angular export.

Tests, conformance fixtures, package smoke/consumer assertions and current docs
change proportionally. Any manifest, dependency, lockfile, new package/entry
point, renderer registry, runtime scope/operation signature or unrelated
production change triggers a stop and contract review.

## 10. Verification

At applicable checkpoints run focused tests plus:

```text
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

Before final completion also run `CI=true pnpm install --frozen-lockfile`, inspect
emitted declarations/root exports, packed artifact contents, lower/upper Angular
22 consumers, all 18 evidence rows and `git diff --check`. Fixture regeneration
is intentional and reviewed, never its own oracle.

## 11. Stop conditions

Stop before changing:

- any accepted SPEC-005/ADR-017 contract or Public inventory;
- root-only grouping or exact-once membership;
- runtime, operation, validation, scope or controlled ownership;
- renderer/container extensibility or Angular capability contracts;
- packages, dependencies, export maps, versions, publication or Stable state;
  or
- work outside D-042.

Ordinary implementation findings inside the approved plan are corrected and
reverified without pausing. Commit and push remain unauthorized.

## 12. Completion criteria

PLAN-012 completes only when all checkpoints, all 18 scenario groups, focused
and full tests, declarations, packages, artifacts, consumers, documentation and
a repeated complete zero-finding review pass. No failing or partially evidenced
checkpoint is complete.
