# @rabassoft/schema-engine

Framework-neutral compiler, immutable operations, and controlled form runtime
for the Schema Engine prototype.

## Release status

- Experimental line: `0.1.x`.
- API classification: Public + Experimental + Active.
- Installing or versioning this package does not promote any API to Stable.
- Recommended channel: npm dist-tag `next` or an explicit version. npm's
  mandatory `latest` alias remains Experimental and does not imply stability.
- Experimental incompatible changes require at least a MINOR release and an
  approved contract; no support SLA is provided.

Install the recommended Experimental channel:

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

> This README describes the current source checkout. The immutable published
> `0.1.0` package predates the nullable-leaf changes below. No successor version
> has been selected or published.

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

External/dynamic references, anchors, arrays of primitives, arrays inside
collection item templates, tuples, composition, generated/editable identity,
async validation, persistence, advanced layouts, custom collection renderers,
and other deferred capabilities are not included.

## License and source

This package is licensed under GNU AGPL v3 only (`AGPL-3.0-only`), including
commercial use under its conditions. A separate paid commercial license may be
available; contact `ricard@rabassoft.com`. No final commercial agreement or
support SLA is represented by this package.

The development repository is private pending sanitization. Preferred
TypeScript source and a frozen package-local build harness are included; see
`SOURCE.md`. The first public release has no npm provenance because there is no
matching public repository. External code contributions and a public issue
tracker are not currently offered.
