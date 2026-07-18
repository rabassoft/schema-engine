# ADR-024 review — Cycles 1–4

- **Date:** 2026-07-18
- **State:** Accepted after cycle 4 under the standing zero-finding review
  authorization
- **Scope:** Angular presentation-container SPI, mandatory native fallback,
  exactly one Angular 22 pilot, package/theme ownership and support tiers
- **Authority reviewed:** ADR-007, ADR-009, ADR-010, ADR-017, ADR-020 revision
  0, ADR-021 revision 1, ADR-023 revision 1, SPEC-005 v0.1.1 and accepted D-025
  review 100
- **Outcome:** Cycle 4 passed all eleven areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                                 | Correction                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R101-F01 | Provider diagnostics named a code and generic `reason` but did not close the reason vocabulary, member order or expectations.                           | Added the seven exact reasons, deterministic member order, exact `member`/`expected` mapping and duplicate-ID separation.                                          |
| R101-F02 | One Public entry outlet could not preserve the accepted panel-owned creation/failure boundary for external renderers.                                   | Added the narrow `SchemaPresentationPanelOutletComponent`, exact panel input and Internal child projection so `PANEL_HOST_INSTANTIATION_FAILED` retains its owner. |
| R101-F03 | Aria and CDK had broad nominal ranges without making the upstream exact patch relationship enforceable; PrimeNG's licensing evidence linked only setup. | Required the resolved CDK patch to equal the selected Aria patch's exact peer and linked the current primary PrimeUI Community License directly.                   |

## Cycle 2 findings and corrections

| ID       | Finding                                                                                                                                                 | Correction                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R101-F04 | Two explanatory clauses still said revision 0 and “single Public entry outlet” after revision 1 added the panel outlet.                                 | Reconciled both clauses with revision 1 and the exact two-outlet surface.                                                                                                    |
| R101-F05 | A custom renderer could pass a foreign/duplicate entry or omit an expected child while still using the Public outlets, weakening exact-once projection. | Added Internal exact-identity claims, duplicate/foreign rejection, complete initial-set audit, host teardown and exact container/panel failure ownership for missing claims. |

## Cycle 3 finding and correction

| ID       | Finding                                                                                                                               | Correction                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R101-F06 | The Angular Aria tabs description relied implicitly on an upstream initial selection and did not close target-state reset boundaries. | Fixed the first `tabpanelId` initialization and two-way value mapping, plus empty accordion state and the exact retained-host versus complete-replacement reset boundary. |

## 1. Primary-source comparison evidence

Current evidence was inspected on 18 July 2026 from official documentation,
repositories, registry metadata and the distributed package declarations:

- Angular's [Aria overview](https://angular.dev/guide/aria/overview),
  [tabs](https://angular.dev/guide/aria/tabs),
  [accordion](https://angular.dev/guide/aria/accordion) and
  [components repository](https://github.com/angular/components);
- Angular Material's [tabs API](https://material.angular.dev/components/tabs/api),
  expansion/grid documentation and distributed `22.0.5` declarations;
- PrimeNG's [tabs](https://primeng.dev/tabs),
  [installation](https://primeng.dev/installation), theming/pass-through
  declarations and the current
  [PrimeUI Community License](https://primeui.dev/licenses/community);
- spartan/ui's [Angular support](https://www.spartan.ng/documentation/version-support),
  [installation](https://www.spartan.ng/documentation/installation) and
  distributed Brain `1.1.1` declarations; and
- reproducible `pnpm view` metadata for `@angular/aria`,
  `@angular/material`, `primeng` and `@spartan-ng/brain`.

The evidence supports exactly one pilot: `@angular/aria` 22.0.5. It is
first-party, MIT, Angular 22-compatible, headless and exposes exact IDs plus
follow-focus/preserved tab behavior. The pilot uses its tabs primitive and
native semantic composition for section, accordion and logical grid where the
library's broader patterns would change ADR-023.

Material is rejected because supported APIs cannot supply every exact
tabpanel/expansion-trigger ID. PrimeNG is rejected because version 22 requires
developer keys/seats and restricts redistribution for developer wrappers.
spartan is rejected because Helm is application-copied/Tailwind-owned and Brain
generates accordion IDs. None becomes a second pilot.

## 2. Cycle 4 complete review

Cycle 4 restarted every area after all corrections:

1. **Authority and scope:** Pass. Only review 100's Angular Experimental
   section-plus-advanced-container seam, native fallback and one pilot are
   decided; SPEC, plan, code and publication remain blocked.
2. **Public/Internal minimality:** Pass. Nine exact Public base exports are
   sufficient for registration and safe entry/panel projection; raw DI,
   resolver, snapshots, runtime, diagnostics and factories remain Internal.
3. **Provider behavior:** Pass. Descriptor-safe validation, seven exact
   configuration reasons, unique IDs, deterministic rank/priority/order,
   tester isolation and immutable bootstrap-time selection are closed.
4. **Fallback and failure:** Pass. Four native rank-0 registrations always
   remain available; recoverable `null` falls back during resolution, while a
   selected host failure never switches renderer and preserves exact subtree
   diagnostics/cleanup.
5. **Projection and lifecycle:** Pass. Exact-identity claims, initial complete
   audits, panel-owned outlets, mounted hidden descendants, reconciliation and
   exact-once destruction prevent foreign, duplicate or omitted children.
6. **Text, IDs and interaction:** Pass. Safe render models carry every exact
   label/role ID; tabs initialize first and activate cyclically on focus,
   accordions start empty with native Enter/Space/Tab semantics, and retained
   host updates preserve target state.
7. **Pilot evidence:** Pass. Angular Aria 22.0.5 is the sole current pilot from
   primary evidence; its selective primitive use is explicit and every rejected
   candidate has a material technical, license or packaging reason.
8. **Package and theme isolation:** Pass. One independent future package/root
   provider and opt-in stylesheet expose six kit-local CSS properties; core,
   base Angular, native consumers and other targets receive no peer/style leak.
9. **Compatibility and SemVer:** Pass. Base `^0.3.0`, Angular 22.0.6+, Aria
   22.0.5+ and exact Aria/CDK patch alignment are explicit; all tiers and APIs
   remain Experimental and reductions/changes follow ADR-010.
10. **Deferred/cross-target boundaries:** Pass. Generic tokens, full leaf kits,
    second pilots, Angular 21/23, legacy Angular, Standard publication,
    React/Vue and every ADR-023 exclusion remain inactive.
11. **Documentation and verification:** Pass. ADR links resolve, primary-source
    statements are reproducible, scoped Prettier and diff checks pass, and the
    final repository-wide check passes for 174 Markdown files and 605 local
    links with stable guides and accepted versions consistent.

## 3. Review conclusion

Cycle 4 has zero findings and no unresolved change request. ADR-024 revision 1
may be accepted under the user's standing authorization. Acceptance authorizes
only SPEC-008 preparation; PLAN-020, implementation, dependency installation,
package creation, publication, commit and push remain unauthorized.
