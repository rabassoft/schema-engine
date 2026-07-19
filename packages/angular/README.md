# @rabassoft/schema-engine-angular

Angular 22 headless adapter and accessible native HTML renderers for Schema
Engine.

## Release status

- Private Experimental candidate line: `0.3.x`; published `0.2.0` remains
  immutable until a separately authorized release.
- Package manifest: `0.3.0`; no registry publication is implied.
- API classification: Public + Experimental + Active.
- Installing or versioning this package does not promote any API to Stable.
- Recommended channel after publication: npm dist-tag `next` or an explicit
  version. Any observed `latest` remains Experimental routing and does not
  imply stability.
- Experimental incompatible changes require at least a MINOR release and an
  approved contract; no support SLA is provided.

The following command resolves the observed registry state; it does not install
the private `0.3.0` candidate until its later publication is verified:

```sh
npm install @rabassoft/schema-engine-angular@next
```

## Installation contract

Consumers install both Schema Engine packages and aligned Angular peers:

```text
@rabassoft/schema-engine-angular 0.3.x
@rabassoft/schema-engine ^0.3.0
@angular/core >=22.0.6 <23.0.0
@angular/forms >=22.0.6 <23.0.0
```

`@angular/core` and `@angular/forms` must resolve to the same exact Angular
version. Supporting Angular packages used by an application must use that same
version.

| Adapter | Core     | Angular core/forms | Build Angular | Tested Angular endpoints | Status                         |
| ------- | -------- | ------------------ | ------------- | ------------------------ | ------------------------------ |
| `0.3.x` | `^0.3.0` | `>=22.0.6 <23.0.0` | `22.0.6`      | `22.0.6` / `22.0.7`      | Private Experimental candidate |

The latest compatible endpoint verified at M18 closure is Angular `22.0.7`.
Later patches require fresh evidence and do not change the lower bound.

## Supported import and boundary

> This README describes the private `0.3.x` source candidate. Published `0.2.0`
> remains immutable and registry availability/tags must be verified separately.

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

Native string, number/integer and boolean renderers expose a localized explicit
set-null intention and a visible confirmed-null status for accepted nullable
leaves. String enum remains excluded. Manually authored
`AngularFieldTextSnapshot` values must supply the required `setNullLabel` and
`nullValueLabel` strings in addition to `clearLabel`; this is a coordinated
Experimental source migration with core's required `nullable` member.

The `0.3.x` candidate projects root-only static sections, tabs, accordions and
logical grids through a Public Experimental container SPI with mandatory native
fallback. Arrays of primitives, arrays inside collection item templates,
tuples, external references, composition, workflow, nested/item layout,
generated identity, implicit Add controls and custom collection renderers remain
outside the supported boundary.

## License and source

This package is licensed under GNU AGPL v3 only (`AGPL-3.0-only`), including
commercial use under its conditions. A separate paid commercial license may be
available; contact `ricard@rabassoft.com`. No final commercial agreement or
support SLA is represented by this package.

The development repository is private pending sanitization. Preferred
TypeScript source and a frozen package-local build harness are included; see
`SOURCE.md`. The candidate has no npm provenance because there is no matching
public repository. External code contributions and a public issue tracker are
not currently offered.
