# ADR 024: Angular presentation-container SPI and Angular Aria pilot

- **Status:** Accepted
- **Date:** 18 July 2026
- **Acceptance date:** 18 July 2026
- **Revision:** 1 — closes provider reasons, panel-owned projection and exact
  Aria/CDK patch alignment
- **Milestone:** M18 — narrow static neutral advanced layout
- **Promotes:** only the Angular Experimental D-025 boundary accepted by
  [`review 100`](../reviews/100-d025-angular-container-kit-promotion-readiness.md)
- **Requires:** accepted [`ADR-007`](./007-resolucion-renderers-testers.md),
  [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-010`](./010-versionado-semver-compatibilidad.md),
  [`ADR-017`](./017-grupos-presentacion-estaticos.md),
  [`ADR-020`](./020-plataforma-referencia-multiframework.md),
  [`ADR-021`](./021-shell-standard-dom-core-directo.md),
  [`ADR-023`](./023-contenedores-layout-neutral-estatico.md) and
  [`SPEC-005 v0.1.1`](../specs/005-static-presentation-groups.md)
- **Acceptance effect:** authorizes only SPEC-008 preparation; no plan, code,
  dependency installation, package creation or publication
- **Complete review:** [`review 101`](../reviews/101-adr-024-review.md) cycle 4
  repeated all eleven areas with zero findings

## 1. Context

ADR-023 fixes the neutral `section`, tabs, accordion and logical-grid
semantics, including exact target identity, mounted hidden panels, target-local
state and failure isolation. Review 100 promotes only the Angular extension
boundary needed to replace fixed presentation hosts with an Experimental
registry, while retaining a dependency-free native implementation and proving
one optional Angular 22 UI-library pilot.

The new seam cannot reuse the primitive-field registry. Container renderers
own nested projection, labels, IDs, interaction state and lifecycle, whereas an
ADR-007 leaf renderer owns one normalized field and emits form intentions.
Neither domain may receive raw schema or application/runtime mutation access.

The pilot must also be distributable independently. It cannot make an optional
UI library a dependency or peer of `@rabassoft/schema-engine-angular`, cannot
leak styles into native consumers and cannot weaken the exact behavior already
accepted by ADR-023 merely to fit a library component.

## 2. Decision

Create one Angular-only Public + Experimental presentation-container SPI,
backed by mandatory Internal native registrations. Select `@angular/aria`
22.0.5 as the sole official Experimental Angular 22 pilot and isolate it in a
future package named `@rabassoft/schema-engine-angular-aria`.

The pilot is headless by design. Angular Aria supplies only the behavior that
matches the accepted contract; the pilot owns a small opt-in stylesheet and
six kit-local customization properties. The consuming application owns theme
selection and values. No visual vocabulary enters core or UI Schema.

### 2.1 Separate normalized container domain

The container tester input is exactly:

```ts
export type AngularPresentationContainerDefinition =
  | PresentationSectionDefinition
  | PresentationTabsDefinition
  | PresentationAccordionDefinition
  | PresentationGridDefinition;
```

Panels and grid items are owned children of those definitions, not independently
resolvable containers. `PresentedFormNodeDefinition`, object/collection/item
hosts and ADR-007 leaf definitions never enter this registry.

Selection depends only on the exact normalized immutable container object.
Current value, baseline, snapshots, locale, resolved text, issues, focus,
touched state, selected tab, expanded panels, viewport and installed CSS are
not tester inputs and cannot change the selected renderer.

### 2.2 Exact Public Angular SPI

Add these Public + Experimental + Active contracts to the root entry point of
`@rabassoft/schema-engine-angular`:

```ts
export type AngularPresentationContainerRenderModel =
  | {
      readonly kind: 'section';
      readonly definition: PresentationSectionDefinition;
      readonly label: string;
      readonly legendId: string;
    }
  | {
      readonly kind: 'tabs';
      readonly definition: PresentationTabsDefinition;
      readonly label: string;
      readonly tablistId: string;
      readonly panels: readonly {
        readonly definition: PresentationPanelDefinition;
        readonly label: string;
        readonly tabId: string;
        readonly tabpanelId: string;
      }[];
    }
  | {
      readonly kind: 'accordion';
      readonly definition: PresentationAccordionDefinition;
      readonly label: string;
      readonly accordionId: string;
      readonly panels: readonly {
        readonly definition: PresentationPanelDefinition;
        readonly label: string;
        readonly triggerId: string;
        readonly regionId: string;
      }[];
    }
  | {
      readonly kind: 'grid';
      readonly definition: PresentationGridDefinition;
      readonly label: string;
      readonly gridId: string;
      readonly items: readonly {
        readonly definition: PresentationGridItemDefinition;
        readonly cellId: string;
      }[];
    };

export interface AngularPresentationContainerRenderer {
  readonly presentation: InputSignal<AngularPresentationContainerRenderModel>;
}

export type AngularPresentationContainerRendererType =
  Type<AngularPresentationContainerRenderer>;

export type AngularPresentationContainerTester = (
  definition: AngularPresentationContainerDefinition,
) => number | null;

export interface AngularPresentationContainerRegistration {
  readonly id: string;
  readonly renderer: AngularPresentationContainerRendererType;
  readonly tester: AngularPresentationContainerTester;
  readonly priority?: number;
}

export function provideSchemaPresentationContainer(
  registration: AngularPresentationContainerRegistration,
): Provider;
```

Also export `SchemaPresentationEntryOutletComponent` and
`SchemaPresentationPanelOutletComponent`. Their one Public input each is:

```ts
// SchemaPresentationEntryOutletComponent
readonly entry: InputSignal<PresentationEntryDefinition>;

// SchemaPresentationPanelOutletComponent
readonly panel: InputSignal<PresentationPanelDefinition>;
```

Both components are valid only inside a container renderer instantiated by the
adapter. They obtain definition, snapshot, runtime context and diagnostic
channels from one Internal host-scoped injector. Consumers cannot supply or
import that context. Direct use elsewhere fails Angular dependency injection
instead of accepting fabricated runtime authority.

There is no Public resolver, raw multi-provider token, context/capability
object, snapshot input, text resolver, ID helper or host factory. The adapter
keeps those Internal. `provideSchemaEngineAngular()` and
`provideSchemaEngineAngularNative()` keep their signatures; the former now
installs the Internal container resolver and mandatory native registrations.

### 2.3 Immutable render model and child projection

The adapter creates and deeply freezes the complete render model. It uses the
exact normalized definitions and the exact labels/IDs required by SPEC-005 and
ADR-023. A locale change may replace the model with newly resolved labels but
must not recreate the selected component, child outlets or target-local layout
state. Ordinary runtime snapshots never replace the model.

Each renderer places outlets as follows, tracking exact immutable definition
objects:

- section: every `definition.children` entry;
- tabs/accordion: exactly one `SchemaPresentationPanelOutletComponent` for each
  panel, with every panel outlet present from host creation; and
- grid: exactly one outlet for every `item.child`.

The panel outlet internally places one entry outlet per `panel.children` and
owns the accepted `PANEL_HOST_INSTANTIATION_FAILED` isolation boundary. The
entry outlet recursively resolves presentation containers and delegates form
nodes to the existing data hosts. Only these outlets receive the Internal live
snapshot context. A container renderer cannot instantiate leaf renderers
directly, read `SchemaFormDirective`, emit operations, suppress issues or
reinterpret node identity.

The Internal host context admits claims by exact object identity only. A
section/grid renderer may claim each expected direct entry once; a
tabs/accordion renderer may claim each expected direct panel once; and a panel
outlet may claim each of its expected children once. A foreign or duplicate
claim fails synchronously. After the selected component's initial view is
created, the adapter audits that the claimed set equals the complete expected
set. A missing claim destroys that selected host and uses its exact container
or panel instantiation-failure envelope. Claims live until host destruction;
renderer-driven conditional removal or replacement of an accepted outlet is a
contract violation, never a supported projection mode.

Inactive tabs and collapsed accordion regions remain mounted. The renderer may
apply `hidden`, `inert`, library-supported equivalent state and animation, but
must remove inactive content from visual display, sequential focus and the
accessibility tree without destroying the outlet or descendants.

### 2.4 IDs, text and semantic ownership

The render model exposes only IDs the renderer must put on the exact semantic
roles:

- section `legendId` on its `<legend>`; the section remains the exact
  `<fieldset><legend>` contract from SPEC-005;
- tabs `tablistId`, each `tabId` and matching `tabpanelId` on their `tablist`,
  `tab` and `tabpanel` roles;
- accordion `accordionId`, each `triggerId` and matching `regionId` on its
  group, disclosure button and labelled region; and
- grid `gridId` and each `cellId` on its accessible group and source-order
  logical item.

The Internal projector derives these values from the exact bases and suffixes
in ADR-023. A library may create additional collision-free implementation IDs,
but they cannot replace, duplicate or break the relationships above. A library
whose Public API cannot apply these exact IDs is incompatible with the pilot.

Resolved labels preserve ADR-023 depth-first order and failure fallback. The
model contains safe strings only; no `TextResolver`, locale, thrown value or
diagnostic object is exposed to the renderer.

### 2.5 Provider validation and deterministic selection

The Internal multi-provider token composes these immutable registrations in
this order:

1. `native-section`, `native-tabs`, `native-accordion`, `native-grid`;
2. application/provider registrations in Angular DI order.

Every native tester returns rank `0` only for its exact kind. The Angular Aria
package registers `angular-aria-section`, `angular-aria-tabs`,
`angular-aria-accordion` and `angular-aria-grid`; each returns rank `10` only
for its exact kind. A custom provider selects its own rank and priority.

Resolution repeats ADR-007 semantics in this separate domain:

1. evaluate every tester in registration order;
2. discard `null` as an ordinary recoverable capability absence;
3. choose highest non-negative integer rank;
4. break a rank tie by highest finite integer `priority`, default `0`; and
5. break the remaining tie by earlier registration.

The adapter validates the complete descriptor-safe provider list before form
projection. An entry must be an ordinary object with own data properties,
non-empty exact `id`, callable component type and tester, and optional finite
integer priority. IDs are unique. The first defect per registration is emitted
in registration/member order; every independently inspectable registration is
checked. Any configuration error blocks the complete resolver and form
projection rather than selecting ambiguously.

`INVALID_PRESENTATION_CONTAINER_REGISTRATION.reason` and parameters use this
closed mapping:

| Condition                  | `reason`                  | `member`       | `expected`               |
| -------------------------- | ------------------------- | -------------- | ------------------------ |
| null/array/non-object      | `registration-not-object` | `registration` | `object`                 |
| absent required member     | `member-missing`          | exact member   | member expectation below |
| accessor required/optional | `member-accessor`         | exact member   | member expectation below |
| invalid `id`               | `invalid-id`              | `id`           | `non-empty string`       |
| invalid `renderer`         | `invalid-renderer`        | `renderer`     | `Angular component type` |
| invalid `tester`           | `invalid-tester`          | `tester`       | `callable tester`        |
| invalid `priority`         | `invalid-priority`        | `priority`     | `finite integer`         |

Required member order is `id`, `renderer`, `tester`; optional `priority` is
last. Their expectations are the exact strings in the final four table rows.
A function is not a registration object. Duplicate IDs use only the separate
duplicate code.

The closed configuration/selection diagnostic codes are:

| Code                                           | Severity | Exact additional parameters                                                 | Fallback                                                     |
| ---------------------------------------------- | -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `INVALID_PRESENTATION_CONTAINER_REGISTRATION`  | error    | `{ index, member, expected, reason }`                                       | `Presentation container registration is invalid.`            |
| `DUPLICATE_PRESENTATION_CONTAINER_RENDERER_ID` | error    | `{ index, id, firstIndex }`                                                 | `Presentation container renderer id is duplicated.`          |
| `PRESENTATION_CONTAINER_TESTER_EXCEPTION`      | warning  | `{ index, id, presentationKind, presentationId }`                           | `Presentation container tester threw an exception.`          |
| `INVALID_PRESENTATION_CONTAINER_TEST_RESULT`   | warning  | `{ index, id, presentationKind, presentationId, actualType, actualValue? }` | `Presentation container tester returned an invalid rank.`    |
| `NO_PRESENTATION_CONTAINER_MATCH`              | error    | `{ presentationKind, presentationId }`                                      | `No presentation container renderer matches the definition.` |

All use `source: 'runtime'`, have no paths and never retain provider, returned
or thrown values. `actualValue` appears only for a safely copyable finite
primitive. Native registrations make `NO_PRESENTATION_CONTAINER_MATCH`
unreachable for accepted definitions, but the defensive contract remains
closed and tested.

A throwing tester or invalid result discards only that candidate and permits a
native match. No provider registration, library or CSS is detected
automatically. Selection occurs at host creation and is immutable for that
exact definition host. Provider changes require a new Angular bootstrap;
runtime kit switching is unsupported.

### 2.6 Native fallback and host failure

The native registrations have no UI-library dependency, stylesheet or theme
requirement and remain available whenever the base Angular adapter is
configured. Absence of the optional package, no matching custom candidate, or
an explicit tester `null` therefore selects the native host.

After resolution, a synchronous exception while creating/binding the selected
component destroys every partial resource, emits the exact existing
`SECTION_HOST_INSTANTIATION_FAILED`, `TABS_HOST_INSTANTIATION_FAILED`,
`ACCORDION_HOST_INSTANTIATION_FAILED`, `GRID_HOST_INSTANTIATION_FAILED` or
`PANEL_HOST_INSTANTIATION_FAILED` envelope, stops only that structural subtree
and permits independent siblings. It does not retry with native markup: a
mid-lifecycle renderer replacement could duplicate descendants, lose local
state and hide a broken selected kit.

Child-outlet creation failures retain ADR-023's nearest structural ownership
and exact-once cleanup. Ordinary later browser, library or event-handler errors
remain outside the narrow host-instantiation envelope and must not be converted
to form diagnostics silently.

## 3. Exactly one Angular 22 pilot

### 3.1 Selection: Angular Aria 22.0.5

Select `@angular/aria` 22.0.5. It is maintained in the first-party Angular
components repository, distributed under MIT, declares Angular core 22/23 and
exact CDK 22.0.5 peers, and is headless. The active project baseline remains
Angular 22.0.6; no Angular 23 support is claimed merely because the upstream
peer range permits it.

Primary evidence inspected on 18 July 2026:

- [Angular Aria overview](https://angular.dev/guide/aria/overview) documents the
  headless ownership boundary and its tabs/accordion patterns.
- [Angular Aria tabs](https://angular.dev/guide/aria/tabs) provides follow-focus
  activation, cyclic arrows/Home/End, roving focus, explicit IDs and preserved
  inactive content.
- [Angular Aria accordion](https://angular.dev/guide/aria/accordion) provides
  multi expansion, explicit trigger/panel IDs and preserved collapsed content,
  but also optional focus navigation beyond ADR-023.
- [Angular package repository](https://github.com/angular/components) identifies
  `@angular/aria`, CDK and Material as maintained first-party packages.
- Public registry metadata was reproduced with
  `pnpm view @angular/aria version peerDependencies license --json`; it returned
  `22.0.5`, CDK `22.0.5`, Angular core `^22.0.0 || ^23.0.0` and MIT.

The package uses Angular Aria tabs with `selectionMode="follow"`, roving focus,
wrapping, exact model IDs and preserved content. It does not use lazy tab
content, so all child outlets exist from host creation.

On selected tabs-host creation, one private signal is initialized to the first
model panel's `tabpanelId` and bound two-way to `ngTabList.selectedTab`; each
`ngTab.value` and matching `ngTabPanel.value` use that same `tabpanelId`, while
their DOM IDs use `tabId` and `tabpanelId`. The signal is never an input or form
operation. Locale, snapshots, application value/baseline resets and retained
host updates do not change it; complete host replacement initializes it again.

The Angular Aria accordion directive is not used in revision 1 because it adds
Arrow/Home/End focus behavior not accepted by ADR-023. The pilot accordion uses
native buttons/regions, independent boolean state and mounted hidden content.
Its native keyboard behavior is the exact accepted Enter/Space and sequential
Tab contract. Its private expanded-ID set starts empty, survives every retained
host update and is discarded only with complete host replacement. Section
remains a semantic fieldset/legend. Logical grid remains source-order CSS grid
with one-column safe fallback; Angular Aria's data-grid pattern is intentionally
not used because it would add cell navigation and data-grid semantics absent
from ADR-023.

This selective use is a deliberate compatibility rule: an official kit may
compose native semantics where a library primitive is broader than the neutral
contract. The package still registers and styles all four container kinds and
proves one optional dependency boundary; it is not a complete Angular Aria
component suite.

### 3.2 Rejected current candidates

| Candidate                 | Current primary evidence                                                                                                                                                                                                                               | Rejection for this pilot                                                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Angular Material `22.0.5` | MIT and first-party Angular 22; tabs can preserve content and expansion content is eager by default. [`MatTabGroup`](https://material.angular.dev/components/tabs/api) does not expose the generated tabpanel IDs; expansion trigger IDs are internal. | Exact ADR-023 tabpanel and accordion trigger/region IDs cannot all be supplied through supported Public APIs. `mat-grid-list` also requires row-height geometry unsuitable for variable forms.                                                   |
| PrimeNG `22.0.0`          | Angular 22 peers, mounted inactive tabs, `selectOnFocus`, Pass Through DOM attributes and rich tokens. [PrimeNG installation](https://primeng.dev/installation) now requires a PrimeUI key.                                                            | Its [current community license](https://primeui.dev/licenses/community) is not open source, wrapper users need seats, and developer-component redistribution requires OEM terms; that is unsuitable for the first freely distributable AGPL kit. |
| spartan/ui Brain `1.1.1`  | MIT and Angular 21–22 support. [Installation](https://www.spartan.ng/documentation/installation) requires Brain/CDK plus Tailwind 4 and copies Helm styles into the application.                                                                       | Copied Helm/Tailwind ownership conflicts with an isolated optional package, while current Brain accordion IDs are generated rather than supplied by the kit.                                                                                     |

PrimeNG remains technically compatible only after an independent legal/OEM and
product-cost decision. Material and spartan remain future candidates if their
supported ID/lifecycle surfaces change. None is a second official pilot.

## 4. Package, peers and exports

The future pilot delivery boundary is one independently versioned package:

| Item               | Decision                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Package            | `@rabassoft/schema-engine-angular-aria`                                                                             |
| Initial line       | `0.1.x`, private implementation first                                                                               |
| Root export `.`    | only `provideSchemaEngineAngularAriaContainers()`                                                                   |
| Style export       | `./styles.css`, imported explicitly by the application                                                              |
| Base peer          | `@rabassoft/schema-engine-angular` `^0.3.0`                                                                         |
| Angular peer       | `@angular/core` `>=22.0.6 <23.0.0`                                                                                  |
| UI-library peer    | `@angular/aria` `>=22.0.5 <23.0.0`                                                                                  |
| Required UI peer   | `@angular/cdk` `>=22.0.5 <23.0.0`; the resolved patch must equal the exact peer required by the resolved Aria patch |
| Runtime dependency | `tslib` only                                                                                                        |
| License            | Schema Engine dual AGPL/commercial policy; Angular Aria/CDK remain MIT peers                                        |

Workspace development uses `workspace:` only for Schema Engine packages; packed
artifacts must contain ordinary SemVer. Angular Aria, CDK and Angular remain
peers and dev dependencies, never bundled or copied. The base Angular and core
tarballs, declarations and clean consumers must contain no Angular Aria import,
peer, style or asset.

The nominal ranges do not authorize a mismatched Aria/CDK tuple. Installation,
documentation and verification must resolve the exact CDK patch declared by
the selected Aria patch; any other combination is unsupported and package
checks must reject it.

`provideSchemaEngineAngularAriaContainers()` returns environment providers for
the four exact registrations. It does not configure the base adapter, add leaf
renderers, import styles, inspect installed packages or select a theme. An
application composes it explicitly with its chosen base/native leaf providers.

Publication, npm version, release tag, provenance and repository visibility
remain separate gates. Accepting this ADR authorizes neither package creation
nor publication.

## 5. Theme and style ownership

Angular Aria is headless. The future `./styles.css` is therefore owned by the
pilot package, scoped to its container hosts and free of resets, typography,
body/html selectors, fonts, icons and application layout. Importing the root JS
entry point has no style side effect.

The only Public + Experimental kit-local CSS properties are:

```css
--se-aria-container-surface
--se-aria-container-text
--se-aria-container-border
--se-aria-container-accent
--se-aria-container-radius
--se-aria-container-gap
```

Defaults use browser/system colors, `currentColor` and local relative lengths.
The application may set the six properties under any light/dark/theme selector
and owns persistence, system preference and theme switching. The kit does not
export a theme service, preset, JavaScript configuration, Sass mixin or generic
Rabassoft token mapping.

These properties style only presentation containers. They do not style leaf
fields, Standard, future React/Vue packages or application controls. Adding or
renaming one is an Experimental Public API change requiring at least a MINOR
release while the package remains `0.y`; removing or changing meaning follows
ADR-010. Generic tokens and shared CSS remain Deferred.

## 6. Compatibility and support tiers

Support is explicit and non-transitive:

1. **Native Angular — Public + Experimental, maintained:** built into the base
   adapter, dependency-free and verified with every supported base Angular
   tuple.
2. **Official Angular Aria pilot — Public + Experimental, private first:** only
   the package and exact matrix in section 4; all four container kinds must pass
   the same conformance scenarios as native.
3. **Custom/community container providers — Public + Experimental, self
   supported:** the SPI is documented and tested, but arbitrary component
   libraries receive no Rabassoft compatibility or theme promise.
4. **Other libraries or Angular majors — unsupported:** Material, PrimeNG,
   spartan, Angular 21/23 and D-045 legacy families require separate evidence
   and decision gates.
5. **Other targets — not implied:** Standard remains private/direct-core;
   React/Vue and any shared kit protocol remain Deferred.

The pilot's initial verified tuple is Angular core/forms `22.0.6`, Angular Aria
`22.0.5` and CDK `22.0.5`. Before any release, tests must cover the documented
lower bounds and latest available compatible patches. A wider upstream peer
does not create support without clean-consumer, build, type, unit and browser
evidence.

Reducing a supported range follows ADR-010's breaking-change rule. Changing an
Experimental SPI signature or model requires at least a MINOR release and
migration notes for repository consumers. Native behavior cannot be removed or
made dependent on the pilot. No tier is Stable.

## 7. Verification contract for SPEC/plan preparation

The later SPEC and plan must require, at minimum:

1. descriptor-safe provider validation and every closed diagnostic envelope;
2. rank/priority/order ties, tester exception/invalid result, custom override,
   native fallback and no runtime switching;
3. the same nested section/tabs/accordion/grid scenarios in native and Angular
   Aria lanes, using the same exact normalized definitions;
4. first-tab/all-collapsed initial state, automatic cyclic tabs, independent
   accordion state and reset/replacement boundaries;
5. every panel outlet and child created exactly once, retained while
   hidden/collapsed, reconciled across snapshots and destroyed exactly once;
6. exact labels, role IDs/relationships, inert/hidden behavior, source order,
   one-column fallback and collision cases;
7. section fieldset/legend and all ADR-023 host-failure envelopes unchanged;
8. recursive composition with native ADR-007 leaves and custom leaf overrides;
9. Angular Aria package/style isolation from core, Standard and base Angular
   declarations, manifests, tarballs and clean consumers;
10. no style side effect from the JS entry, six exact CSS properties, app-owned
    light/dark switching and usable unstyled/native fallback;
11. exact peer tuples, partial compilation, package smoke, clean installation,
    unit/DOM tests, Chromium accessibility behavior and production build; and
12. zero Public core/base Angular diff outside the separately accepted SPEC-008
    inventory and no publication/release action.

Native and pilot lanes use equivalent semantic assertions, not pixel equality.
Failure of any pilot lane blocks its completion; it cannot be relabelled as a
native-only success.

## 8. Public/Internal migration inventory

| Classification          | Exact effect                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New Public base Angular | `AngularPresentationContainerDefinition`, `AngularPresentationContainerRenderModel`, `AngularPresentationContainerRenderer`, `AngularPresentationContainerRendererType`, `AngularPresentationContainerTester`, `AngularPresentationContainerRegistration`, `SchemaPresentationEntryOutletComponent`, `SchemaPresentationPanelOutletComponent`, `provideSchemaPresentationContainer`. |
| Changed Public Angular  | `provideSchemaEngineAngular()` installs the Internal container resolver/native fallbacks without a signature change; `SchemaFormDirective` selects registered presentation hosts after SPEC-008 widens the forest.                                                                                                                                                                   |
| Internal base Angular   | Raw multi-provider token, resolver/result, model projector, host context/injector, native registrations/components, recursive outlet implementation, text/ID helpers, host factories, diagnostics and cleanup.                                                                                                                                                                       |
| New pilot Public        | Package root `provideSchemaEngineAngularAriaContainers()`, `./styles.css` and the six exact kit-local CSS properties.                                                                                                                                                                                                                                                                |
| Pilot Internal          | Four components/registrations, Angular Aria composition, target-local state, classes, CSS implementation and conformance helpers.                                                                                                                                                                                                                                                    |
| Unchanged               | Core/runtime authority, raw/normalized contracts until SPEC-008, operations, scopes, validation, ADR-007 leaf registry, object/collection/item hosts, Standard, React/Vue, current published artifacts, version/release/publication and repository visibility.                                                                                                                       |

The SPI symbols remain Public + Experimental + Active. No raw token, resolver,
component class from the pilot or styling implementation becomes Public merely
because it appears in built output.

## 9. Consequences

### Positive

- External Angular container packages can project accepted children without
  receiving runtime or application authority.
- Native behavior remains the universal fallback and has no optional peer or
  theme cost.
- Angular Aria proves exact IDs, mounted tabs and automatic activation through
  supported first-party APIs while leaving markup/style ownership with the kit.
- Selective native composition prevents broader library behavior from changing
  the neutral contract.
- One small package and stylesheet make dependency, version, theme and release
  isolation auditable.

### Negative

- The base Angular root adds nine Experimental exports and another independent
  resolver domain.
- Container authors must render child outlets correctly and satisfy a larger
  lifecycle/accessibility conformance contract than leaf renderers.
- The first pilot is headless and needs kit/application CSS; it does not provide
  a ready-made visual design system.
- The Angular Aria accordion and data-grid primitives cannot be reused for this
  revision because their keyboard semantics are broader than ADR-023.
- Four native and four pilot registrations duplicate host structure by design.

## 10. Alternatives considered

### Widen ADR-007 registrations to containers

Rejected. It would give one tester domain incompatible component contracts and
mix form intentions with recursive projection/lifecycle ownership.

### Expose a Public capability/context object

Rejected. The two narrow Public entry/panel outlets plus one host-scoped
Internal context are sufficient and prevent external renderers from retaining
snapshots, runtime or diagnostic channels.

### Use kind-to-component maps

Rejected. Scored testers preserve specialization, deterministic overrides and
recoverable capability absence already proven by ADR-007 without widening the
leaf domain.

### Retry native after selected component creation fails

Rejected. Mid-host replacement can duplicate children, discard local state and
hide a broken registration. Native fallback occurs only during resolution.

### Select Angular Material

Rejected for the first pilot because exact tabpanel and expansion-trigger IDs
are not all configurable through supported Public component APIs. Depending on
internal generated DOM would create a patch-fragile integration.

### Select PrimeNG

Rejected despite strong technical fit because PrimeNG 22 requires developer
licenses/keys and restricts redistribution for developer tooling/wrappers. That
cost and OEM boundary require a separate product/legal decision.

### Select spartan/ui

Rejected because its standard styled layer is copied into the consuming
application and requires Tailwind 4, while Brain currently owns generated
accordion IDs. That conflicts with package isolation and exact identity.

### Publish generic Rabassoft design tokens now

Rejected. Six package-local properties are sufficient evidence; a cross-target
design system has not been promoted.

## 11. Explicit exclusions

ADR-024 does not activate:

- SPEC-008, PLAN-020, code, dependencies, package manifests or implementation;
- package publication, npm version/tag, release notes, provenance or push;
- generic core/framework renderer kits, capabilities or theme metadata;
- more than one official pilot, automatic detection or runtime kit switching;
- Angular Aria leaf renderers or a complete UI component suite;
- a Public raw DI token, resolver, runtime/snapshot context or host factory;
- generic tokens, shared CSS, theme translation or pixel parity;
- nested/item layout, wizards, actions, scopes, conditions, controlled layout
  state, SSR/hydration or portals;
- Angular 21/23, D-045 legacy Angular, React, Vue or Standard publication; or
- any Stable API/support classification.

## 12. Acceptance gate

Before acceptance, one complete review must repeat at least:

1. authority, scope and D-025 promotion limits;
2. Public/Internal minimality and transitive API inventory;
3. provider validation, resolution, fallback and diagnostics;
4. child projection, lifecycle, cleanup and failure isolation;
5. exact text, IDs, keyboard, accessibility and grid semantics;
6. current primary-source candidate comparison and licensing;
7. package/dependency/export/release isolation;
8. theme ownership and CSS API;
9. compatibility/support/SemVer behavior;
10. cross-target and deferred boundaries; and
11. documentation cohesion and link/diff verification.

Any correction restarts the complete review. Review 101 fulfilled this gate in
cycle 4 with zero findings; ADR-024 revision 1 is Accepted and authorizes only
SPEC-008 preparation.
