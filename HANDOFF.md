# Schema Engine — Codex Handoff

- **Handoff date:** 13 July 2026
- **Current specification:** `SPEC-001: Controlled Form Runtime`, version `0.1.11`, status `Draft`
- **Implementation status:** M1 through M5 completed: framework-neutral compiler, operations, and runtime in `packages/core`, plus the Angular 22 adapter and accessible native HTML renderer kit in `packages/angular`.

## 1. Current objective

No implementation task is active. ADR-010 revision 1 is accepted, pre-SPEC
ADR-002 is Superseded, and D-028 is Promoted. D-024's custom-renderer concern is
resolved while its Angular validation bridge remains Deferred. Review D-008 as
the smallest next product decision.

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

The following pre-SPEC Angular ADRs are pending review and must not be treated as
authoritative where they conflict with `SPEC-001`:

- Angular ADR-001: statements coupling Signals, RxJS, Zone.js, and zoneless behavior.
- Angular ADR-002: a historical empty placeholder replaced by accepted ADR-008.

Do not rewrite these ADRs as part of an unrelated task. Surface conflicts explicitly and handle them through a dedicated review.

ADR-004 has now been superseded by accepted ADR-007. Renderer selection uses
deterministic scored testers over normalized `FieldDefinition` in the adapter;
the core owns no component registry.

ADR-002 is now Superseded by accepted ADR-010. Package versions follow
independent product versioning rather than Angular-major lockstep.

Accepted ADR-008 resolves D-027: inline renderers are created with
`ViewContainerRef.createComponent()`, an explicit `EnvironmentInjector`, and
creation-time input/output bindings. Standalone `createComponent()` remains for
out-of-tree UI and is outside M4.

[PLAN-004](.ai-docs/plans/004-angular-adapter.md) is completed. M4 added the
private Angular 22 headless adapter, Signals projection, provider-based renderer
resolution, and the ViewContainerRef outlet infrastructure. Native HTML controls
were completed in M5.

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

## 7. Completed immutable-operations plan

[`PLAN-002: Root-level immutable operations`](.ai-docs/plans/002-root-immutable-operations.md)
was formally reviewed, approved, implemented, and completed on 13 July 2026.

Its scope is limited to the public operation/result contracts,
`applyOperation()`, `applyFormOperation()`, deterministic runtime diagnostics,
operation fixtures, and verification. Both utilities accept only a single
string root-property path segment in M2. The review also closed accessor,
malformed-path, form-definition-shape, and diagnostic-order behavior. M2
production code is exported from `@rabassoft/schema-engine` with 27 operation
fixtures and focused unit coverage.

## 8. Completed controlled-runtime plan

[`PLAN-003: Controlled form runtime`](.ai-docs/plans/003-controlled-runtime.md)
was formally reviewed, approved, implemented, and completed. It closes source-schema access,
creation/subscription results, diagnostic parameters, and listener isolation
while keeping M3 framework-neutral and application-controlled.

## 9. Completed Angular-adapter plan

[`PLAN-004: Angular controlled-form adapter`](.ai-docs/plans/004-angular-adapter.md)
was formally reviewed, approved, implemented, and completed. The private
adapter package uses Angular Signals and public creation-time bindings without
RxJS, Zone.js coupling, Angular Forms, native controls, or core framework
dependencies.

## 10. Completed native-renderer plan

[`PLAN-005: Native HTML renderers`](.ai-docs/plans/005-native-html-renderers.md)
was formally reviewed, approved, implemented, and completed. It includes the confirmed `LOCALE_ID` fallback,
neutral `TextResolver` projection, accessible native string/number/boolean
components, Angular 22 Signal Forms leaf bindings, controlled localized numeric
editing, diagnostics, and conformance fixtures. The re-review rejects using a
Signal Form as the business source of truth and confines it to a private
renderer-local buffer reconciled from core snapshots. Its contracts are promoted
to SPEC-001 v0.1.11. The final suite passes 140 tests: 104 core and 36 Angular.

## 11. Accepted public API decision

[`ADR-009: Public API boundary and stability policy`](.ai-docs/adrs/009-politica-api-publica-estabilidad.md)
is Accepted. It treats only explicit package export-map entry points as public,
classifies every intended root export as Public, Experimental, and Active,
excludes deep imports and internal helpers, and treats visibility, stability,
and lifecycle as separate axes. The reviewed correction removes the raw
`SCHEMA_RENDERER_REGISTRATIONS` token from the root entry point while retaining
`provideSchemaRenderer`, `AngularRendererResolver`, and renderer contracts as
public extension APIs. Accepted ADR-010 now owns SemVer, package coordination,
Angular compatibility, and the exact deprecation window. Acceptance does not
authorize publication or additional code changes. The final formal review found no
remaining issue, and D-029 is Promoted. All intended root exports remain
Experimental until a separate explicit promotion.

## 12. Accepted package-versioning decision

[`ADR-010: Independent versioning, Stable SemVer, and explicit compatibility`](.ai-docs/adrs/010-versionado-semver-compatibilidad.md)
is Accepted. It assigns independent product SemVer to core and the Angular
adapter instead of aligning the adapter major with Angular. The adapter declares
the core and used Angular packages as bounded peers and publishes a tested
compatibility matrix. The initial proposal starts both packages at `0.1.0`,
supports Angular `>=22.0.6 <23.0.0`, and requires 180 days plus one subsequent
MINOR before a Stable API can be removed in a MAJOR. ADR-002 is Superseded and
D-028 is Promoted, but manifests remain private at `0.0.0`. Revision 1 explicitly
describes its Experimental extension to strict SemVer, requires Angular
core/forms peers to resolve to the same version, and defines the later MINOR as
one published release that retains the deprecated contract.

## 13. Reviewed Angular extension boundary

D-024 originally combined custom renderers with Angular validation bridges. The
renderer half is complete under ADR-007/009 and the implemented
`provideSchemaRenderer()` API. A generic bridge remains Deferred: Angular
`ValidatorFn` consumes `AbstractControl`, Signal Forms `Validator` consumes
field context, and neither directly produces the normalized whole-model issues
required by core `SchemaValidator`. Revisit only with a concrete consumer that
defines root-versus-field scope and canonical error/path mapping.

## 14. Recommended next Codex prompt

Use this prompt in the next Codex session:

> Read `AGENTS.md`, `HANDOFF.md`, `STATUS.md`, SPEC-001 v0.1.11, accepted ADR-005 through ADR-010, completed PLAN-001 through PLAN-005, D-008 in the deferred-decisions register, and the ADR index. Review D-008 as the smallest next product candidate; separate `enum`, `const`, and `format` data semantics, compiler contracts, validation ownership, and renderer selection before drafting an ADR or implementation plan.
