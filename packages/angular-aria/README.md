# @rabassoft/schema-engine-angular-aria

Angular Aria 22 presentation-container candidate for Schema Engine.

## Delivery status

- Package manifest: `0.1.0`.
- API classification: Public + Experimental + Active.
- Private source candidate; no registry publication is implied.
- The only root API is `provideSchemaEngineAngularAriaContainers()`; the only
  style entry point is the explicit `./styles.css` export.
- PLAN-021 governs later publication. Every registry read, package write and
  tag mutation retains a separate approval gate.
- Recommended channel after publication: exact `0.1.0` or `next`. The first
  observed `latest` state is not predicted and never implies Stable.

## Fixed compatibility contract

```text
@rabassoft/schema-engine-angular-aria 0.1.x
@rabassoft/schema-engine-angular ^0.3.0
@angular/core >=22.0.6 <23.0.0
@angular/aria >=22.0.5 <23.0.0
@angular/cdk >=22.0.5 <23.0.0
```

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

## License and source

This package is licensed under GNU AGPL v3 only (`AGPL-3.0-only`), including
commercial use under its conditions. A separate paid commercial license may be
available; contact `ricard@rabassoft.com`. No final commercial agreement or
support SLA is represented by this package.

Preferred TypeScript source is included in `src/`; see `SOURCE.md`. There is no
npm provenance while the development repository remains private.
