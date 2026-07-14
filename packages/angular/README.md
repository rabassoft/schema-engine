# @rabassoft/schema-engine-angular

Angular 22 headless adapter and accessible native HTML renderers for Schema
Engine.

## Candidate status

- Candidate line: `0.1.x`.
- API classification: Public + Experimental + Active.
- Installing or versioning this package does not promote any API to Stable.
- This is an unpublished local candidate. Distribution terms have not been
  selected, so the tarball is not authorized for external distribution.

## Installation contract

Consumers install both Schema Engine packages and aligned Angular peers:

```text
@rabassoft/schema-engine-angular 0.1.x
@rabassoft/schema-engine ^0.1.0
@angular/core >=22.0.6 <23.0.0
@angular/forms >=22.0.6 <23.0.0
```

`@angular/core` and `@angular/forms` must resolve to the same exact Angular
version. Supporting Angular packages used by an application must use that same
version.

| Adapter | Core     | Angular core/forms | Build Angular | Tested Angular endpoints | Status                       |
| ------- | -------- | ------------------ | ------------- | ------------------------ | ---------------------------- |
| `0.1.x` | `^0.1.0` | `>=22.0.6 <23.0.0` | `22.0.6`      | `22.0.6` / `22.0.6`      | Local candidate, unpublished |

The upper stable endpoint resolved on 2026-07-14 from public npm metadata is
currently the same version as the lower endpoint.

## Supported import and boundary

Import only from `@rabassoft/schema-engine-angular`. Deep imports into `dist`,
`src`, or other physical paths are unsupported.

The package provides the Angular 22 adapter, renderer extension contract, and
native HTML renderers for the SPEC-001/SPEC-002/SPEC-003 subset.
`SchemaFormDirective` projects normalized inline object groups, fixed
homogeneous collection/item groups and primitive leaves recursively; an
application supplies one controlled config and applies emitted deep or stable
collection operations:

```html
<form [schemaForm]="config()" (schemaOperation)="applyOperation($event)"></form>
```

Object/collection/item groups use semantic fieldsets, localized text and
collision-safe canonical IDs. Item views and leaf intentions follow stable item
identity across movement; remove/move actions are fixed and accessible, while
insertion remains application-owned. Native leaves remain replaceable through
the renderer extension contract. The adapter does not own domain data,
identity, validation, persistence, submit flows, or runtime behavior.

Arrays of primitives, arrays inside collection item templates, tuples,
references, composition, advanced layouts, generated identity, implicit Add
controls and custom collection renderers remain outside the supported boundary.

See the [Schema Engine repository](https://github.com/rabassoft/schema-engine)
for SPEC-001, SPEC-002, SPEC-003, ADRs, plans, and current project status.
