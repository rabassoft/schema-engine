# @rabassoft/schema-engine-angular

Angular 22 headless adapter and accessible native HTML renderers for Schema
Engine.

## Release status

- Public verified Experimental `0.4.1` is available exactly and under `next`,
  `latest` and unqualified resolution from protected commit `028a98c`, with
  repository-backed npm provenance.
- Core `latest` and unqualified resolution now select verified `0.4.1`, so the
  default dependency pair is coordinated M23 evidence.
- Required core `0.4.1` is likewise public and verified under `next`; the
  packed core peer floor remains `^0.4.0`.
- API classification: Public + Experimental + Active.
- Installing or versioning this package does not promote any API to Stable.
- Recommended M23 channel: exact `0.4.1`, `next` or `latest`. Routing does not
  imply stability.
- Experimental incompatible changes require at least a MINOR release and an
  approved contract; no support SLA is provided.

The following commands install the verified public Experimental `0.4.1` pair:

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

> Exact base Angular `0.4.1` and `next` consumers are verified with public core
> `0.4.1`. Base Angular `latest` and unqualified installs now resolve verified
> `0.4.1` together with core.

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
`nullValueLabel`, `fixedMissingLabel`, `fixedUnavailableLabel` and
`fixedIncompatibleLabel` strings in addition to `clearLabel`; this is a
coordinated Experimental source migration with core's required `nullable`
member.

Current source also exports `SchemaFixedValueRendererComponent`. The native
provider selects it at rank 30 for an own normalized `fixedValue`; it presents
only the actual controlled value or its localized static state, remains
non-focusable and emits no mutation or focus intention.

Current source projects normalized semantic strings as native `email` and
`date` inputs while keeping `date-time` textual so RFC 3339 timezone data is
preserved exactly. Native validity is presentational; runtime issues still come
only from the configured replaceable validator. String-enum select precedence
is unchanged.

Current source also accepts the optional core `asyncValidator` through the
existing controlled configuration, projects immutable async state through the
existing snapshot Signal and exposes `retryAsyncValidation()` on
`SchemaFormDirective`. Core owns generations, cancellation and stale-result
suppression; the adapter and renderers own no scheduler, transport or retry
policy.

Current source also projects core conditional primitive-field state. The
Internal field host keeps the selected renderer mounted while removing a
hidden field from display, sequential focus and the accessibility tree. Native
editable controls and their clear/set-null actions are disabled when the
snapshot is disabled. A custom renderer must likewise honor
`snapshot.enabled` for accessible presentation; the outlet routes stale custom
outputs through core's final rejection gate while either `snapshot.visible` or
`snapshot.enabled` is false. Conditional transitions do not re-run renderer
selection or replace private Signal Forms edit buffers.

This is a coordinated Experimental source migration: custom renderers and
manually authored renderer snapshot fakes must consume the newly required
`visible` and `enabled` flags. The capability is not present in published
`0.4.1`; a later core/Angular MINOR and its release remain separately gated.

Current source also exports `SchemaStringEnumArrayRendererComponent` from the
existing root entry point. `provideSchemaEngineAngularNative()` selects it only
for the exact atomic core `string-enum-array` definition. It uses a labelled
native `<select multiple>` with private index tokens, preserves confirmed
domain ordering, immediately reconciles rejected intentions, and never turns
the field into an identity-based collection.

Missing and present-empty selection status are distinct. Invalid controlled
duplicate, unknown, non-string or sparse values are kept losslessly: native
selection is disabled while the field host and whole-value clear action remain
accessible. Manually authored `AngularFieldTextSnapshot` values must therefore
also supply `missingSelectionLabel` and `emptySelectionLabel`. This Public
Experimental source migration requires the same separately approved future
core/Angular MINOR; published `0.4.1` remains unchanged.

The current source projects static sections, tabs, accordions and logical grids
at the root and on direct nested-object and collection-item template owners
through the Public Experimental container SPI with mandatory native fallback.
Published `0.3.x` artifacts remain the earlier root-only historical contract.
Published `0.4.0` includes these local forests and is available by exact
version, `next` or `latest`. Primitive arrays other than the exact current-source
atomic string-enum field, arrays inside
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

Public `0.4.1` carries verified npm provenance bound to
`rabassoft/schema-engine`, `.github/workflows/npm-publish.yml` and protected
commit `028a98c`. Existing `0.4.0` has no retroactive repository/provenance
claim. Issues may be used for non-code feedback; external code contributions
are not currently accepted.
