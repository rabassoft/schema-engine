# Review 027: D-034/D-040 public publication and dual licensing readiness

- **Date:** 15 July 2026
- **Scope:** D-034 licensing model and D-040 first public package publication
- **User-selected direction:** `AGPL-3.0-only` or a separate paid commercial
  license
- **Cycle 1:** One public copyright-notice decision remained open
- **Cycle 2:** Complete repeated review passed with zero findings
- **State:** Accepted; D-034/D-040 promoted for normative design only
- **External action:** Not authorized by this review

## 1. Decision already made

Ricard selected a dual licensing model on 15 July 2026:

1. Schema Engine remains available as Open Source under GNU Affero General
   Public License version 3 only.
2. The copyright holder may separately license the same code under paid
   commercial terms for consumers that do not want to comply with AGPL.
3. The first packages are intended to be publicly installable while remaining
   Public + Experimental + Active under ADR-009/010.

This is not a noncommercial Open Source restriction. AGPL permits commercial
use when its conditions are met. Payment is required only for the separate
commercial permission, not for exercising AGPL rights.

## 2. Proposed normative boundary

- Use the exact SPDX identifier `AGPL-3.0-only`; do not use `-or-later`.
- Distribute the unmodified official AGPL v3 text as `LICENSE` and include it
  in both package tarballs.
- Describe the alternative commercial offer in README/NOTICE text, not as an
  invented SPDX expression or an additional restriction on AGPL rights.
- Keep the workspace root private. Remove `private: true` only from the two
  publishable package manifests under a later approved plan.
- Publish `@rabassoft/schema-engine@0.1.0` and
  `@rabassoft/schema-engine-angular@0.1.0` with public npm access and the
  `next` dist-tag; do not assign `latest` in the first publication.
- Keep every Public export Experimental. Publication does not promote any API
  to Stable and does not change ADR-009/010 compatibility guarantees.
- Require exact Corresponding Source availability for every published build,
  tied to an immutable Git tag/release or included source archive.
- Add no telemetry, license key, network check or runtime distinction between
  AGPL and commercial builds.

## 3. Commercial licensing boundary

The commercial license is a separate agreement from the repository license.
It must identify the legal licensor, grant the required proprietary-use rights,
define scope/term/fees, and address warranty, liability, support, termination,
jurisdiction and data/contact terms. Its final legal text is not inferred from
AGPL and should receive professional legal review before sale.

Pricing, editions, support SLAs and enforcement automation are not required to
publish the AGPL release, but a truthful commercial contact and a licensor able
to grant all relevant rights are required before advertising dual licensing.

## 4. Ownership and contributions

Dual licensing requires the commercial licensor to own, or hold sufficient
relicensing rights for, every contribution. Before accepting external code the
project must adopt one explicit contribution model:

- copyright assignment or a CLA granting commercial relicensing rights; or
- no external code contributions until such terms exist.

A DCO alone normally records provenance but does not by itself grant the broad
relicensing permission needed for this dual-license model. The initial public
repository should therefore disable or decline external code contributions
unless the approved publication ADR selects a suitable CLA/assignment.

## 5. Publication and supply-chain gates

Before any remote mutation, the later ADR and plan must verify:

1. ownership/control of the npm `@rabassoft` scope and both package names;
2. the exact npm account/organization, public access and required 2FA or trusted
   publishing configuration;
3. provenance generation from an immutable public source revision;
4. packed manifests, license/source notices, tarball inventory and absence of
   credentials or workspace specifiers;
5. clean consumers for core and both Angular 22 endpoints;
6. release notes, changelog, security/contact policy and compatibility matrix;
7. dist-tag, failure, deprecation and rollback procedures that never overwrite
   an already published version; and
8. explicit approval immediately before making the repository public,
   publishing, tagging or creating a GitHub release.

## 6. Compatibility with accepted authority

- ADR-009 permits Public + Experimental + Active APIs and requires a final
  public-inventory review before first publication.
- ADR-010 already selects independent `0.1.0` package versions and the Angular
  compatibility matrix; publishing does not introduce lockstep or Stable API.
- ADR-013 and completed PLAN-008 intentionally retain `private: true`; the new
  ADR must supersede only that publication barrier after every gate passes.
- D-034/D-040 own licensing and publication. No functional deferred capability
  is activated by this decision.

No accepted SPEC or runtime contract conflicts with the proposed model.

## 7. Cycle 1 finding and resolution

1. **Public notice form:** the legal copyright holder and commercial licensor
   is Ricardo Rabassó Rodríguez, operating under the Rabassoft name. Ricard
   confirmed the exact public form:

   `Copyright © 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft`

## 8. Resolved findings

1. **Legal licensor identity:** resolved on 15 July 2026 as Ricardo Rabassó
   Rodríguez. No company is currently the rights holder.
2. **Repository visibility:** resolved for the first publication checkpoint.
   The GitHub repository remains private until a separate history/content
   sanitization review authorizes making it public.
3. **Corresponding Source while private:** the publication ADR/plan must include
   the preferred TypeScript source and every required build script/config in
   the public release artifacts, or provide an equivalent immutable public
   source archive. A private GitHub URL is not sufficient evidence.

## 9. Cycle 2 repeated review

Repeated the complete authority, licensing, ownership, source-availability,
publication, supply-chain, API/versioning and deferred-boundary review after
the cycle 1 resolution. All areas pass with zero findings or unresolved change
requests.

The dual AGPL/commercial direction is coherent and compatible with accepted
ADR-009/010/013 and completed PLAN-008. D-034/D-040 are Promoted only for
drafting and reviewing ADR-018. No manifest, license file, repository
visibility, registry write, tag, release or publication is authorized.

## 10. Primary references

- [GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.html)
- [OSI AGPL-3.0 entry](https://opensource.org/license/agpl-3.0)
- [Open Source Definition](https://opensource.org/osd)
- [npm scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
- [npm dist-tags](https://docs.npmjs.com/cli/commands/npm-dist-tag/)
