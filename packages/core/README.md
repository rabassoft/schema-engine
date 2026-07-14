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
  compileFormDefinition,
  createControlledFormRuntime,
} from '@rabassoft/schema-engine';
```

Deep imports into `dist`, `src`, or other physical package paths are not
supported.

## Prototype boundary

The current runtime supports root object schemas, primitive `string`, `number`,
`integer`, and `boolean` fields, the documented string-enum subset, synchronous
external validation, controlled application-owned state, and strict incremental
operations.

Nested objects, arrays, composition, async validation, persistence, advanced
layouts, and other deferred capabilities are not included.

See the [Schema Engine repository](https://github.com/rabassoft/schema-engine)
for SPEC-001, ADRs, plans, and current project status.
