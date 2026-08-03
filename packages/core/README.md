# @rabassoft/schema-engine

Framework-neutral compiler, immutable operations, and controlled form runtime
for the Schema Engine prototype.

## Release status

- Public verified Experimental `0.4.1` is available exactly and under `next`,
  `latest` and unqualified resolution from protected commit `028a98c`, with
  repository-backed npm provenance.
- API classification: Public + Experimental + Active.
- Installing or versioning this package does not promote any API to Stable.
- Recommended channel: an explicit version, `next` or `latest`. The observed
  aliases remain Experimental routing and do not imply stability.
- Experimental incompatible changes require at least a MINOR release and an
  approved contract; no support SLA is provided.

The following command installs verified public Experimental core `0.4.1`:

```sh
npm install @rabassoft/schema-engine@next
```

## Supported import

Import only from the package root:

```ts
import {
  applyFormOperation,
  commitScopeToBaseline,
  compileFormDefinition,
  createControlledFormRuntime,
  deriveSchemaDefaultCandidate,
} from '@rabassoft/schema-engine';
```

Deep imports into `dist`, `src`, or other physical package paths are not
supported.

## Deriving explicit schema defaults

`deriveSchemaDefaultCandidate()` is an opt-in pure helper. It derives only own
enumerable, basic-kind-compatible primitive `default` annotations through the
accepted object, local-reference and static-object-composition tree. Missing
object ancestors are materialized immutably; every present application value
wins. Root/object/array/item defaults and everything below arrays remain
opaque.

```ts
const result = deriveSchemaDefaultCandidate(schema, currentValue);

if (!result.success) {
  reportDiagnostics(result.diagnostics);
} else if (result.changed) {
  const acceptedValue = result.value;
  // The application may validate, discard or supply this controlled value.
  runtime.updateExternalState({ value: acceptedValue });
}
```

The helper never mutates runtime/baseline state, invokes validation or accepts
the candidate automatically. The application separately decides the meaning
of `baselineValue` and whether persistence is required.

## Confirming a persisted scope

`commitScopeToBaseline()` calculates a baseline candidate; it does not save
data or mutate a runtime. The application remains responsible for persistence
and applies the candidate only after that persistence succeeds:

```ts
const candidate = commitScopeToBaseline(
  definition,
  baselineValue,
  currentValue,
  { id: 'profile', paths: [['profile', 'address']] },
);

if (!candidate.success) {
  reportDiagnostics(candidate.diagnostics);
} else {
  await persistProfile(candidate.value);
  runtime.updateExternalState({ baselineValue: candidate.value });
}
```

Static object/array paths confirm their complete managed subtree. Stable
collection item/node addresses confirm only that identity or relative node and
never insert, remove or reorder items. Unselected managed data and baseline
unmanaged properties remain untouched. The helper runs no validator, listener,
operation, storage or network effect.

## Conditional primitive fields in current source

Ordinary primitive UI fields may declare either one strict equality predicate
or one flat non-empty `all`/`any` group for visibility and enabled state. Group
members keep authored order and use the same ordinary primitive sources and
exact string, finite-number, boolean or null literals.

```ts
const result = compileFormDefinition({
  schema,
  uiSchema: {
    fields: {
      details: {
        visibleWhen: {
          operator: 'all',
          conditions: [
            { path: ['showDetails'], equals: true },
            { path: ['hasProfile'], equals: true },
          ],
        },
      },
    },
  },
});
```

Compiled definitions expose detached predicate/group unions. Raw readers narrow
`operator`/`conditions` versus `path`/`equals`; normalized readers use the same
group branch versus `sourcePath`/`equals`. Existing predicate object literals
remain source-compatible. Every layer is copied and frozen, and every ordinary
`FieldRuntimeSnapshot` now requires `visible` and `enabled`.
Runtime evaluates them from application-controlled values without changing
data, baseline, validation, issues or layout. Direct actions against an
inactive field fail with `INACTIVE_RUNTIME_FIELD`; targets must also present
the flags accessibly.

This bounded current-source capability does not include collection templates,
recursive expressions, other operators, a dependency graph, dynamic required/readonly/defaults
or conditional validation. Because the required snapshot flags and widened
definition contracts are an Experimental source migration, delivery requires
a separately approved coordinated MINOR release; published `0.4.1` does not
contain these unreleased changes.

## Atomic string-enum arrays in current source

Current source recognizes an exact direct or nested JSON Schema array whose
`items` is a string schema with a non-empty closed enum and whose outer schema
declares enumerable `uniqueItems: true`. It normalizes that schema as one
`StringEnumArrayFieldDefinition` with detached ordered `choices`; it does not
create an `ArrayNodeDefinition` or any collection/item identity.

The application still owns the complete value and baseline. Missing, present
empty and ordered non-empty arrays remain distinct. `requestSetValue()` emits
one copied frozen ordered array, `requestRemoveValue()` removes the whole
property, and the replaceable validator remains authoritative for enum,
uniqueness and required assertions. Other primitive arrays, collection-item
locations, tuples and M10 item operations remain unsupported.

`StringEnumArrayFieldDefinition`, the widened `FieldDefinition`, and the
`missing-selection` / `empty-selection` text members are Public Experimental
current-source contracts. Their delivery requires a separately approved
coordinated MINOR; published `0.4.1` does not contain these unreleased changes.

## Prototype boundary

> Exact core `0.4.1`, `next`, `latest` and unqualified clean-consumer evidence
> pass; routing never changes the Experimental contract.

The current runtime supports a root object whose properties may recursively
contain objects, primitive `string`, `number`, `integer`, and `boolean` leaves,
the exact current-source atomic string-enum array above, and homogeneous arrays
of object items. The compiler resolves the accepted
SPEC-004 static same-document fragment-only `$ref` subset through root `$defs`
at supported non-root positions. Collections require an
application-owned stable string identity property supplied through
`collectionPolicies`. It provides normalized immutable definitions and
snapshots, stable item addresses, positional read paths, synchronous external
validation, controlled application-owned state, and strict incremental deep or
collection operations. Object/item nesting is processed iteratively without an
arbitrary depth limit; the application remains the only source of truth for
values and identity.

Primitive leaves accept only scalar primitive types or the exact closed
two-member primitive-plus-null type array. Normalized primitive definitions and
templates always require `nullable: boolean`; manually authored definitions
must add `nullable: false` for scalar leaves and may use `true` only for the
accepted nullable capability. Definition-aware direct/deep and item-relative
operations accept explicit null only when that capability is true.

Current source additionally normalizes `email`, `date` and `date-time` as
optional semantic annotations on string definitions and templates. Core does
not validate, parse, trim or canonicalize those values; assertion remains the
responsibility of a replaceable validator.

Current source also declares the optional Public Experimental asynchronous
validation port and immutable state shapes accepted for M26. Leaving
`asyncValidator` absent preserves the exact synchronous snapshot shape. The
generation, cancellation, trigger, stale-result lifecycle, safe result
normalization, issue composition and root/node/scope projection are implemented
by completed PLAN-028. Angular forwards the same core-owned lifecycle, while
the Angular and Standard reference applications own independent deterministic
effects and transport remains consumer policy.

Primitive schema leaves may also declare JSON Schema `const`. Core copies an
exact compatible scalar value to the normalized definition as the optional
`fixedValue: string | number | boolean | null` presentation capability,
including empty string, false, zero and negative zero. It does not infer a
field type, insert the value into application state, enforce it in operations,
or replace validator assertion. For scalar strings, a valid fixed value must
belong to a simultaneously declared valid `enum`.

Current source supports one deliberately bounded Draft 2020-12 `allOf` subset
for static object composition. A document root, object property or homogeneous
object-item root may combine ordered, disjoint object-property contributions,
including pure same-document `#/$defs/...` reference branches. Required names
are unioned after the complete catalog is known, and distinct duplicate
properties or object titles/descriptions are rejected instead of merged or
overridden. UI Schema still belongs to the single composed use site.

This is normalized-definition derivation, not general JSON Schema evaluation.
Core passes the exact original schema to the replaceable validator and never
flattens, clones, bundles or dereferences it for validation. Primitive/array
conjunction, repeated-property merging, alternatives, conditions, external or
dynamic resources and semantic `$ref` siblings remain unsupported.

External/dynamic references, anchors, other arrays of primitives, arrays inside
collection item templates, tuples, general composition beyond the bounded
static-object subset, generated/editable identity, async transport/Ajv,
persistence, workflow, compound conditional expressions, dynamic conditional
semantics and custom collection renderers remain outside the current boundary.
The current source adds static sections, tabs, accordions and a bounded logical
grid at the root and on direct nested-object and collection-item template owners
as presentation-neutral definitions; core owns no target DOM, interaction state
or CSS. Published core `0.4.0` includes these local forests and is available by
exact version, `next` or `latest`; published `0.3.x` remains the earlier
root-only historical contract. Exact M19 core `0.3.0` remains publicly
available for pinned historical consumers.

## License and source

This package is licensed under GNU AGPL v3 only (`AGPL-3.0-only`), including
commercial use under its conditions. A separate paid commercial license may be
available; contact `ricard@rabassoft.com`. No final commercial agreement or
support SLA is represented by this package.

The sanitized development repository is public at
`https://github.com/rabassoft/schema-engine`. Preferred TypeScript source and a
frozen package-local build harness are included; see `SOURCE.md`.

Public `0.4.1` carries verified npm provenance bound to
`rabassoft/schema-engine`, `.github/workflows/npm-publish.yml` and protected
commit `028a98c`. Existing `0.4.0` has no retroactive repository/provenance
claim. Issues may be used for non-code feedback; external code contributions
are not currently accepted.
