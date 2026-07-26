# @rabassoft/schema-engine-angular

Angular 22 headless adapter and accessible native HTML renderers for Schema
Engine.

## Release status

- Public verified Experimental `0.4.0` is available exactly and under both
  `next` and `latest` during coordinated delivery.
- Source package manifest: proposed metadata-only `0.4.1`; it is not generated,
  staged or public. Verified public `0.4.0` remains the installable line and is
  identical to the clean candidate selected from commit `07755b4c`.
- Required core `0.4.0` is likewise public and verified under `next`.
- API classification: Public + Experimental + Active.
- Installing or versioning this package does not promote any API to Stable.
- Recommended channel: an explicit version, `next` or `latest`. The observed
  aliases resolve the same Experimental `0.4.0` and do not imply stability.
- Experimental incompatible changes require at least a MINOR release and an
  approved contract; no support SLA is provided.

The following commands install the verified public Experimental `0.4.0` pair:

```sh
npm install @rabassoft/schema-engine@next
npm install @rabassoft/schema-engine-angular@next
```

## Installation contract

Consumers install both Schema Engine packages and aligned Angular peers:

```text
@rabassoft/schema-engine-angular 0.4.x
@rabassoft/schema-engine ^0.4.0
@angular/core >=22.0.6 <23.0.0
@angular/forms >=22.0.6 <23.0.0
```

`@angular/core` and `@angular/forms` must resolve to the same exact Angular
version. Supporting Angular packages used by an application must use that same
version.

| Adapter | Core     | Angular core/forms | Build Angular | Tested Angular endpoints | Status                       |
| ------- | -------- | ------------------ | ------------- | ------------------------ | ---------------------------- |
| `0.3.x` | `^0.3.0` | `>=22.0.6 <23.0.0` | `22.0.6`      | `22.0.6` / `22.0.7`      | Public Experimental verified |
| `0.4.x` | `^0.4.0` | `>=22.0.6 <23.0.0` | `22.0.6`      | `22.0.6` / `22.0.7`      | Public Experimental verified |

The latest compatible endpoint verified for public `0.4.0` is Angular
`22.0.7`. Later patches require fresh evidence and do not change the lower
bound.

## Supported import and boundary

> Exact base Angular `0.4.0`, `next`, `latest` and unqualified consumers are
> verified with public core `0.4.0`.

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

The current source projects static sections, tabs, accordions and logical grids
at the root and on direct nested-object and collection-item template owners
through the Public Experimental container SPI with mandatory native fallback.
Published `0.3.x` artifacts remain the earlier root-only historical contract.
Published `0.4.0` includes these local forests and is available by exact
version, `next` or `latest`. Arrays of primitives, arrays inside
collection item templates, tuples, external references, composition, workflow,
generated identity, implicit Add controls and custom collection renderers remain
outside the supported boundary.

## License and source

This package is licensed under GNU AGPL v3 only (`AGPL-3.0-only`), including
commercial use under its conditions. A separate paid commercial license may be
available; contact `ricard@rabassoft.com`. No final commercial agreement or
support SLA is represented by this package.

The sanitized development repository is public at
`https://github.com/rabassoft/schema-engine`. Preferred TypeScript source and a
frozen package-local build harness are included; see `SOURCE.md`.

The proposed `0.4.1` source metadata names that repository, but npm provenance
is not claimed until a later stage-only trusted publication is approved and
verified. Existing `0.4.0` has no retroactive repository/provenance claim.
Issues may be used for non-code feedback; external code contributions are not
currently accepted.
