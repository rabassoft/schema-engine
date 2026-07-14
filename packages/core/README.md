# @rabassoft/schema-engine

Framework-neutral compiler, immutable operations, and controlled form runtime
for the Schema Engine prototype.

## Candidate status

- Candidate line: `0.1.x`.
- API classification: Public + Experimental + Active.
- Installing or versioning this package does not promote any API to Stable.
- This is an unpublished local candidate. Distribution terms have not been
  selected, so the tarball is not authorized for external distribution.

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

The current runtime supports a root object whose properties may recursively
contain inline objects, primitive `string`, `number`, `integer`, and `boolean`
leaves, and homogeneous arrays of inline object items. Collections require an
application-owned stable string identity property supplied through
`collectionPolicies`. It provides normalized immutable definitions and
snapshots, stable item addresses, positional read paths, synchronous external
validation, controlled application-owned state, and strict incremental deep or
collection operations. Object/item nesting is processed iteratively without an
arbitrary depth limit; the application remains the only source of truth for
values and identity.

Arrays of primitives, arrays inside collection item templates, tuples,
references, composition, generated/editable identity, async validation,
persistence, advanced layouts, custom collection renderers, and other deferred
capabilities are not included.

See the [Schema Engine repository](https://github.com/rabassoft/schema-engine)
for SPEC-001, SPEC-002, SPEC-003, ADRs, plans, and current project status.
