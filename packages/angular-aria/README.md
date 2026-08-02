# @rabassoft/schema-engine-angular-aria

Angular Aria 22 presentation-container pilot for Schema Engine.

## Delivery status

- Public verified Experimental `0.2.1` is available exactly and under `next`
  from protected commit `028a98c`, with repository-backed npm provenance.
- `next`, `latest` and unqualified installs resolve the same verified `0.2.1`.
  Core/base defaults both resolve `0.4.1`, completing coordinated M23 routing.
- Its required base `@rabassoft/schema-engine-angular@0.4.1` is now public under
  exact, `next`, `latest` and unqualified resolution, while the preserved
  packed peer floor remains `^0.4.0`; pilot `0.2.1` is public through the same
  routes.
- API classification: Public + Experimental + Active.
- The only root API is `provideSchemaEngineAngularAriaContainers()`; the only
  style entry point is the explicit `./styles.css` export.
- PLAN-021 completed publication and verification; it authorizes no later
  registry, repository or Git action.
- Recommended M23 channel: exact `0.2.1`, `next` or `latest`. Routing never
  implies Stable.

The coordinated M19 exact fallback remains
`@rabassoft/schema-engine-angular-aria@0.1.0` with
`@rabassoft/schema-engine-angular@0.3.0`.

## Fixed compatibility contract

```text
@rabassoft/schema-engine-angular-aria 0.2.x
@rabassoft/schema-engine-angular ^0.4.0
@angular/core >=22.0.6 <23.0.0
@angular/aria >=22.0.5 <23.0.0
@angular/cdk >=22.0.5 <23.0.0
```

The public M21 tuple is pilot `0.2.x` with base Angular `^0.4.0`; it retains the
same Angular/Aria/CDK ranges and verified endpoints. Core/base Angular `0.4.0`
and pilot `0.2.0` are public together under both `next` and `latest`.

Verified tuples use Angular core `22.0.6` and `22.0.7`, with Angular Aria
`22.0.5` and Angular CDK `22.0.5`. The resolved Aria peer must require the same
exact CDK patch.

Register the pilot after the mandatory native base providers:

```ts
import { provideSchemaEngineAngularNative } from '@rabassoft/schema-engine-angular';
import { provideSchemaEngineAngularAriaContainers } from '@rabassoft/schema-engine-angular-aria';

bootstrapApplication(AppComponent, {
  providers: [
    provideSchemaEngineAngularNative(),
    provideSchemaEngineAngularAriaContainers(),
  ],
});
```

Import `@rabassoft/schema-engine-angular-aria/styles.css` explicitly when the
pilot visual baseline is wanted. Behavior remains usable without it: hidden
panels stay mounted and inaccessible, and grid content falls back to source
order in one column. Applications own light/dark selectors and may set only:

```text
--se-aria-container-surface
--se-aria-container-text
--se-aria-container-border
--se-aria-container-accent
--se-aria-container-radius
--se-aria-container-gap
```

Tabs use Angular Aria follow-focus/wrapping with preserved content. Section,
accordion and logical grid intentionally retain native semantics.

The current source also projects the same containers for direct nested-object
and collection-item template owners under completed PLAN-022. Published `0.1.x`
artifacts remain the earlier root-only historical contract. Published `0.2.0`
includes these local forests and is available by exact version, `next` or
`latest`.

## License and source

This package is licensed under GNU AGPL v3 only (`AGPL-3.0-only`), including
commercial use under its conditions. A separate paid commercial license may be
available; contact `ricard@rabassoft.com`. No final commercial agreement or
support SLA is represented by this package.

Preferred TypeScript source is included in `src/`; see `SOURCE.md`. The
sanitized repository is public at `https://github.com/rabassoft/schema-engine`.
Public `0.2.1` carries verified npm provenance bound to
`rabassoft/schema-engine`, `.github/workflows/npm-publish.yml` and protected
commit `028a98c`. Existing `0.2.0` has no retroactive repository/provenance
claim.
