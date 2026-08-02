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
  compileFormDefinition,
  createControlledFormRuntime,
} from '@rabassoft/schema-engine';
```

Deep imports into `dist`, `src`, or other physical package paths are not
supported.

## Prototype boundary

> Exact core `0.4.1`, `next`, `latest` and unqualified clean-consumer evidence
> pass; routing never changes the Experimental contract.

The current runtime supports a root object whose properties may recursively
contain objects, primitive `string`, `number`, `integer`, and `boolean` leaves,
and homogeneous arrays of object items. The compiler resolves the accepted
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

Primitive schema leaves may also declare JSON Schema `const`. Core copies an
exact compatible scalar value to the normalized definition as the optional
`fixedValue: string | number | boolean | null` presentation capability,
including empty string, false, zero and negative zero. It does not infer a
field type, insert the value into application state, enforce it in operations,
or replace validator assertion. For scalar strings, a valid fixed value must
belong to a simultaneously declared valid `enum`.

External/dynamic references, anchors, arrays of primitives, arrays inside
collection item templates, tuples, composition, generated/editable identity,
async validation, persistence, workflow, conditional layout, custom collection
renderers, and other deferred capabilities are not included. The current source
adds static sections, tabs, accordions and a bounded logical grid at the root
and on direct nested-object and collection-item template owners as
presentation-neutral definitions; core owns no target DOM, interaction state or
CSS. Published core `0.4.0` includes these local forests and is available by
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
