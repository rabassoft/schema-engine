# ADR 018: Dual AGPL/commercial licensing and public experimental publication

- **Status:** Accepted
- **Date:** 15 July 2026
- **Revision 3 acceptance date:** 15 July 2026
- **Revision date:** 20 July 2026
- **Revision 4 acceptance date:** 19 July 2026
- **Revision 5 acceptance date:** 20 July 2026
- **Revision:** 5 — repeat release of three established packages for M21
- **Promotion review:**
  [`review 027`](../reviews/027-d034-d040-publication-licensing-readiness.md)
  cycle 2 passed with zero findings; M19
  [`review 114`](../reviews/114-m19-coordinated-0-3-release-promotion-readiness.md)
  cycle 2 passed all twelve areas with zero findings; M21
  [`review 146`](../reviews/146-m21-coordinated-m20-release-promotion-readiness.md)
  cycle 3 passed all fourteen areas with zero findings
- **Related:** [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-010`](./010-versionado-semver-compatibilidad.md),
  [`ADR-013`](./013-preparacion-artefactos-experimentales-0-1.md),
  [`ADR-025`](./025-bosques-presentacion-locales-objetos-items.md),
  [`SPEC-009`](../specs/009-recursive-local-presentation-layout.md),
  [`D-034`](../roadmap/deferred-decisions.md#d-034-modelo-comercial-y-licenciamiento),
  [`D-040`](../roadmap/deferred-decisions.md#d-040-publicacion-real-de-paquetes)
  and
  [`D-043`](../roadmap/deferred-decisions.md#d-043-publicacion-del-repositorio-y-automatizacion-segura-de-releases)
- **Milestones:** M13 first public Experimental release, M19 coordinated
  Experimental `0.3.0` release and M21 coordinated M20 delivery design
- **Implementation:** M13 completed by PLAN-013 revision 4, M19 by PLAN-021
  revision 0 after final review 132 cycle 4, and M21 by PLAN-023 revision 0
  after final review 164 cycle 3; no later external action is authorized
- **Previous complete review:**
  [`review 028`](../reviews/028-adr-018-review.md) cycle 8 passed the complete
  revision 3 review with zero findings; accepted by Ricard
- **Revision 4 review:**
  [`review 115`](../reviews/115-adr-018-revision-4-review.md) cycle 4 passed all
  thirteen areas with zero findings; accepted under the authorized review rule
- **Revision 5 review:**
  [`review 147`](../reviews/147-adr-018-revision-5-review.md) cycle 5 passed all
  fifteen areas with zero findings; accepted under the authorized review rule

## 1. Context

At the start of this decision, M8 had produced verified private `0.1.0`
candidates for
`@rabassoft/schema-engine` and `@rabassoft/schema-engine-angular`. M9–M12 then
expanded the accepted runtime while preserving their package boundary,
Experimental API classification and independent versioning. Both package
manifests then used `private: true`, package documentation forbade external
distribution and the repository was private.

Ricard selected an Open Source plus commercial dual-license model and a public
first package release. The choice must preserve genuine AGPL rights, identify
the natural-person rights holder, supply Corresponding Source despite the
private repository, and retain an explicit approval gate before any irreversible
remote operation.

M13 and PLAN-013 then published core and base Angular `0.1.0`; PLAN-015 later
published their coordinated `0.2.0` line. Both releases verified immutable
bytes, interactive 2FA, package-local Corresponding Source, `next`, observed
`latest`, private-repository metadata and no provenance. PLAN-020/M18 now
delivers a new Public Experimental core/base surface at `0.3.0` plus the first
`@rabassoft/schema-engine-angular-aria@0.1.0` package. SPEC-008 fixes their exact
package, peer and compatibility contract.

Revision 3's rule that only the two original manifests may become publishable
was correct for M13 but conflicts with the accepted M19 pilot boundary. Review
114 therefore promotes revision 4 only to generalize repeat-release/package
onboarding policy and close the exact three-package publication/tag sequence.
It does not authorize PLAN-021, code, Git or registry action.

PLAN-021 subsequently completed M19 and established exact public core/base
`0.3.0` plus pilot `0.1.0` under both `next` and `latest`. PLAN-022/M20 then
implemented recursive local presentation forests, including incompatible
Public Experimental core/base declaration changes and required behavior through
the existing pilot. Review 145 option A and review 146 select delivery of that
completed value before another functional/framework milestone.

Revision 5 therefore adds only the exact repeat-release architecture for three
already established package names. It retains revision 4's licensing,
Corresponding Source, security and immutable-recovery policy, but replaces its
first-pilot/default-alias assumptions with a three-established-alias sequence.
It does not authorize a plan, manifest, candidate, Git or registry action.

## 2. Decision

### 2.1 Dual-license model

Schema Engine is offered under either:

1. GNU Affero General Public License version 3 only (`AGPL-3.0-only`); or
2. a separate paid commercial license granted by the rights holder.

AGPL use, including commercial use, remains royalty-free when its conditions
are met. The commercial agreement is an alternative permission for consumers
that do not want to comply with AGPL; it is not an additional restriction,
exception or fee attached to AGPL rights.

The exact public copyright notice is:

```text
Copyright © 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
```

Ricardo Rabassó Rodríguez is the legal copyright holder and commercial
licensor. Rabassoft is the public operating name, not a separate rights-owning
company. Public files do not include tax identifiers, home address or private
contract data.

### 2.2 Open Source distribution

Every distributed package includes:

- the unmodified official GNU AGPL v3 text in `LICENSE`;
- manifest field `"license": "AGPL-3.0-only"`;
- the exact copyright and AGPL notice;
- a clear statement that a separate commercial license is available; and
- a truthful commercial contact selected and verified by the delivery plan.

Every distributed source file owned by Ricardo Rabassó Rodríguez includes the
applicable copyright and `AGPL-3.0-only` notice or an SPDX header plus an
unambiguous package-level notice. Third-party notices remain intact and are
never replaced with the Rabassoft notice.

The commercial alternative is described in README/NOTICE material and is not
encoded as a fabricated SPDX expression. No runtime license check, license key,
telemetry, feature distinction or network call is introduced.

### 2.3 Repository and Corresponding Source

The GitHub repository remains private until a separate D-043 sanitization
review checks its entire reachable history, secrets, personal data and internal
documentation. Neither a package release nor this revision makes it public.

Because a private repository is not a public source offer, every public binary
package must provide the preferred TypeScript form and all scripts/configuration
needed to generate, install and run that exact release. The approved delivery
plan must define a deterministic package-local source layout or an immutable
public source archive, verify it from a clean environment and reject private or
incomplete source URLs.

Source publication excludes `.ai-docs`, repository history and unrelated
workspace material unless a later repository-sanitization decision makes them
public. Exclusion must not remove material required as Corresponding Source.

### 2.4 Package and release shape

- The workspace root stays private and is never published.
- A package may become publishable only when an Accepted SPEC/ADR inventories
  its exact public name, exports, peers, source/license boundary and initial
  version, followed by a separately approved release plan.
- Core, base Angular and the Angular Aria pilot are the only currently admitted
  public packages. A fourth package or a renamed/split entry point requires its
  own accepted contract; this revision is not a generic publication allowlist.
- Package versions remain independent under ADR-010. Coordinated delivery does
  not establish lockstep versioning.
- Every admitted package is Public + Experimental + Active until a separate
  accepted stability decision says otherwise; publication never makes an API
  Stable.
- npm access is public under the `@rabassoft` scope.
- The recommended Experimental channel is dist-tag `next`.
- npm uses `latest` for unqualified installs. Publishing with an explicit
  `--tag=next` does not generally promise to create or move it, but prior first-
  package registry evidence exposed an initial `latest`. Every plan must observe
  rather than assume the actual aliases. Any `latest` is registry routing only
  and never promotes an API, package or support policy to Stable.
- Existing root entry points, exports, dependencies, peers and Angular range
  remain unchanged unless a separately accepted decision requires otherwise.
- Already published bytes or versions are never replaced. Failure uses a new
  version, deprecation/dist-tag correction or another registry-supported
  recovery procedure defined by the plan.

The exact M19 line is:

| Package                                 | Version | Required Schema Engine peer |
| --------------------------------------- | ------- | --------------------------- |
| `@rabassoft/schema-engine`              | `0.3.0` | none                        |
| `@rabassoft/schema-engine-angular`      | `0.3.0` | core `^0.3.0`               |
| `@rabassoft/schema-engine-angular-aria` | `0.1.0` | base Angular `^0.3.0`       |

SPEC-008 remains authoritative for exact Angular/Aria/CDK ranges, exports,
styles and support tiers. This ADR neither changes those contracts nor admits
the private Standard/reference workspace as a package.

The exact proposed M21 line is:

| Package                                 | Version | Required Schema Engine peer |
| --------------------------------------- | ------- | --------------------------- |
| `@rabassoft/schema-engine`              | `0.4.0` | none                        |
| `@rabassoft/schema-engine-angular`      | `0.4.0` | core `^0.4.0`               |
| `@rabassoft/schema-engine-angular-aria` | `0.2.0` | base Angular `^0.4.0`       |

SPEC-009 is authoritative for M20 behavior and migration. Core/base require
MINOR because their Public Experimental declarations change incompatibly. The
pilot requires an independent MINOR because its current base `^0.3.0` peer
cannot admit the M20 base line; its Public provider, export and six style
properties remain unchanged. Angular core/forms stay
`>=22.0.6 <23.0.0`; Angular Aria/CDK stay `>=22.0.5 <23.0.0` with their exact
patch-alignment rule.

### 2.5 Ownership and contributions

Commercial relicensing requires sufficient rights over all included code.
Until a separately reviewed CLA or copyright-assignment policy exists, the
project does not accept external code contributions. Issues, discussions or
non-code feedback do not grant code rights and may be enabled later under a
separate public-repository policy.

Every release plan must audit included third-party code and licenses and must
not dual-license material for which Ricardo Rabassó Rodríguez lacks the
required rights. Angular Aria and CDK remain MIT peers/dev dependencies; their
code is not bundled, copied or relicensed as Schema Engine.

### 2.6 Publication security and provenance

Before every publication, the plan must verify:

1. control of the npm `@rabassoft` scope and every exact package name in the
   release;
2. the publishing identity and public commercial/security contacts;
3. interactive write-protected 2FA for every write while trusted publishing
   remains unavailable; first package creation receives its own immediate
   approval and post-write identity check;
4. registry access, requested `next`, actual `latest` and public visibility from
   packed metadata; every observed tag must resolve to inspected bytes and
   documentation must not present it as Stable;
5. no trusted publisher, workflow or public repository metadata while GitHub
   remains private; OIDC, staged publishing, token restrictions and provenance
   move together to the separately promoted repository-publication milestone;
6. license, notices, Corresponding Source and complete tarball inventories;
7. the frozen install, full test/build/package matrix and clean consumers; and
8. a final human approval checkpoint immediately before each external mutation.

No ADR or plan approval itself authorizes `npm publish`, Git tags, GitHub
releases, repository visibility changes or credential operations. Those
actions require the final explicit checkpoint described by the plan.

npm provenance is not claimed while the repository is private: npm requires a public
repository matching `package.json#repository`, while the selected repository
remains private. The release documentation records that limitation. Provenance
becomes a required follow-up gate when a sanitized public repository exists;
the project must not publish a misleading or unverifiable provenance URL.

npm trusted publishing also requires `package.json#repository` to match the
GitHub repository. Advertising that inaccessible private URL would contradict
the accepted package metadata boundary. M13 and later manual releases therefore
use verified interactive 2FA and no long-lived credential in the repository.
They do not prepare a non-functional workflow or change npm package settings.

A later repository-publication decision must jointly review full-history
sanitization, public repository metadata, contribution/security/community
boundaries, a GitHub-hosted OIDC workflow, stage-only permissions, interactive
2FA approval, traditional-token restrictions and truthful provenance. Until
then, every registry write requires a separately accepted release plan and
immediate human approval; no completed release authorizes the next one.

### 2.7 M19 publication and tag sequence

M19 follows two different orders because package creation and default-channel
transition have different compatibility risks.

Publication under `next` is dependency-first:

1. publish and verify exact core `0.3.0` bytes under `next`;
2. publish base Angular `0.3.0` only after live core passes, then verify exact
   and coordinated core/base `next` consumers;
3. publish pilot `0.1.0` only after the live `0.3.0` pair passes, then verify
   its exact/`next` bytes, peers, source and native/pilot consumers; and
4. do not accept consumer evidence from any transient mixed `next` window.

The pilot is a first publication. Current npm CLI documentation says an
explicit publish tag selects that tag instead of automatically setting
`latest`; prior Schema Engine registry evidence nevertheless exposed an initial
`latest` that could not be removed. The plan must observe and verify the actual
state. It must not assume either presence, absence or deletability. If npm does
not create it, adding pilot `latest` is a later separately approved mutation
after exact/`next` verification.

Transition of the two established core/base `latest` aliases is
dependent-first, matching the verified `0.2.0` precedent:

1. move base Angular `latest` to `0.3.0` while core `next` already exposes
   `0.3.0` and core `latest` still points to `0.2.0`;
2. treat that state as a planned minimal mixed window from which no coordinated
   `latest` or unqualified consumer evidence is accepted;
3. after immediate observation, separately move core `latest` to `0.3.0`; and
4. only then accept exact, `next`, `latest` and unqualified core/base plus pilot
   clean-consumer evidence.

Core-first `latest` is rejected because existing base Angular `0.2.0` declares
core `^0.2.0`; making core `0.3.0` the default first creates the less safe
default mismatch. Base-first keeps its new `^0.3.0` peer satisfiable from the
already published exact/`next` core line and repeats the proven PLAN-015 order.

Every numbered publish or tag mutation is a separate external checkpoint with
an immediate approval. After each write, read-only verification must confirm
exact bytes/integrity, signature, tags, peers, source/license, absent
repository/provenance and no unrelated registry drift before the next mutation.

### 2.8 M21 publication and tag sequence

M21 has three already established package names and aliases. It therefore uses
one exact dependency-first publication sequence followed by one deepest-
dependent-first default-channel transition.

Publication under `next` is:

1. publish and verify exact core `0.4.0` bytes;
2. publish base Angular `0.4.0` only after live core passes, then verify exact
   and coordinated core/base `next` native consumers;
3. publish pilot `0.2.0` only after the live `0.4.0` pair passes, then verify
   exact/`next` bytes, peers, source, native and pilot consumers; and
4. accept no consumer evidence from a transient mixed `next` window.

All current `latest` aliases resolve to the completed M19 line before the M21
transition. Move established defaults deepest-dependent first:

1. move pilot `latest` to `0.2.0` while base/core defaults remain old;
2. after immediate observation, move base Angular `latest` to `0.4.0` while
   core default remains old;
3. after immediate observation, move core `latest` to `0.4.0`; and
4. only then accept exact, `next`, `latest` and unqualified native/pilot
   consumer evidence.

The first mixed window has only the pilot/base peer edge unresolved; the second
has only the base/core edge unresolved. No coordinated evidence is accepted in
either. Moving base before pilot would temporarily break both its upstream core
peer and the old pilot's downstream peer; moving core first breaks the old
base. Pilot, base, core is therefore the minimum-risk order for this chain.

Every publication or tag mutation is a distinct external checkpoint with
immediate human approval. Post-write read-only verification must confirm exact
bytes/integrity/signature, tags, peers, source/license, absent repository/
provenance and no unrelated registry drift before any next mutation.

### 2.9 Partial failure and immutable recovery

Published versions are immutable even when a later M19 step fails:

- before a write, stop without changing registry state;
- after core only, leave exact core `0.3.0` available under its observed tags
  and resume only from a fresh verification;
- after base, preserve both exact `0.3.0` versions and their verified tags;
- after pilot, preserve `0.1.0`; a package defect requires deprecation and/or a
  new patch, never byte replacement or assumed unpublish;
- during a tag transition, do not claim coordinated completion or accept
  evidence from the mixed window; and
- a corrective tag move back to the last verified version is itself a separate
  explicitly approved mutation followed by full observation.

Recovery never assumes an observed default `latest` can be deleted, rewrites an
existing tarball, reuses a failed version, hides a partial state in
documentation or advances an unverified dependent. PLAN-021 must define exact
stop/resume commands and evidence for every checkpoint without embedding
credentials or OTPs.

For M21 specifically:

- after core only, preserve exact core `0.4.0` and resume from fresh
  verification;
- after base, preserve the exact `0.4.0` pair and do not claim coordinated
  completion;
- after pilot, preserve exact pilot `0.2.0` and reverify all three `next`
  aliases before default transitions;
- after pilot `latest`, either proceed after fresh observation or separately
  approve a corrective tag to the prior verified pilot version;
- after base `latest`, preserve the single base/core mixed edge until a
  separately approved core transition or corrective base tag; and
- after core `latest`, do not close until the complete exact/`next`/`latest`/
  unqualified matrix passes.

The general immutable recovery rules above remain authoritative for M19 and
M21. The next release plan must define the exact stop/resume commands and
evidence for every M21 checkpoint without embedding credentials, OTPs or
security-key material.

### 2.10 Commercial agreement

The paid commercial license is a separate contract using Ricardo Rabassó
Rodríguez's legal identity. Before the first commercial sale, professionally
reviewed terms must cover at least scope, entities/users/products, duration,
fees, payment/tax handling, updates, warranty, liability, support, termination,
governing law and privacy/contact information.

Pricing, editions and support SLAs do not block the AGPL package release if the
public material does not falsely claim that purchasable commercial terms are
already operational. Advertising immediate commercial availability requires a
real contact and executable agreement.

## 3. Consequences

### Positive

- Schema Engine remains genuine Open Source under an OSI-approved license.
- Organizations can choose reciprocal AGPL use or negotiate proprietary terms.
- The public package has auditable license and source material even while the
  development repository remains private.
- Experimental publication does not silently stabilize API or change product
  behavior.
- A dependency-first publish and dependent-first default-channel transition
  minimize incompatible default resolution while preserving exact audit stops.
- M21 closes the source/package gap without combining delivery with a new
  framework or functional contract.

### Negative

- Strong copyleft may reduce adoption among proprietary consumers.
- Dual licensing constrains how external contributions can be accepted.
- Publishing complete buildable source inside release artifacts increases
  package/release complexity while the repository remains private.
- Any observed `latest` alias means an unqualified install resolves that
  Experimental version; documentation must recommend `next` or an exact
  version and explicitly deny any stability implication.
- Coordinated releases necessarily expose short mixed-tag windows between
  separately approved mutations; those windows cannot provide accepted
  consumer evidence.
- A third public package adds independent source, license, peer, tag and
  recovery checks to every coordinated release that includes it.
- Three established default aliases require two planned mixed windows before
  the complete M21 chain can resolve unqualified consistently.
- Trusted publishing and provenance cannot be activated while preserving the
  selected private-repository metadata boundary; future releases remain gated
  until the repository-publication decision is promoted.
- Commercial agreements, tax handling and enforcement need professional work
  outside the software implementation.

## 4. Alternatives considered

### PolyForm Noncommercial plus commercial license

Rejected because it matches a pay-for-commercial-use rule but is not Open
Source: it restricts a field of endeavor.

### MIT or Apache-2.0 plus paid support

Rejected for the selected business model because proprietary commercial
consumers would not need separate software permission.

### GPL-3.0-only plus commercial license

Rejected in favor of AGPL-3.0-only because the ecosystem may later include
server-side or hosted integrations; AGPL preserves the reciprocal source rule
for covered modified network use.

### Public packages backed only by a private repository

Rejected because an inaccessible repository is not sufficient Corresponding
Source delivery for public recipients.

### Make the existing repository public immediately

Deferred to D-043. Its history and persistent internal documentation require a
separate sanitization review before visibility changes.

### Keep ADR-018 restricted to the two original packages

Rejected for revision 4 because accepted SPEC-008 defines the isolated pilot
as a Public Experimental package. Publishing only core/base would withhold the
concrete consumer of their new container SPI.

### Publish all packages under a temporary M19 tag before `next`

Rejected for M19. It adds a new channel and extra mutations without eliminating
the separately approved publication windows. The already proven `next` staging
model remains explicit and observable.

### Move core `latest` before base Angular `latest`

Rejected because base Angular `0.2.0` requires core `^0.2.0`. The dependent-
first order used by PLAN-015 creates the narrower planned window and keeps new
base `0.3.0` satisfiable from the already published core `0.3.0` line.

### Assume or delete the pilot's first `latest`

Rejected. Official CLI behavior and prior registry evidence do not justify a
single precondition. The release must observe and document registry state
rather than depend on presence, absence or deletion of the default tag.

### Publish M21 core/base without a pilot MINOR

Rejected. The existing pilot peer `^0.3.0` excludes base `0.4.0`, while M20
requires pilot conformance over the widened behavior. Omitting it would leave
no installable pilot companion for the new base line.

### Let pilot `0.2.0` support both base `0.3.x` and `0.4.x`

Rejected for M21. It adds an unneeded cross-MINOR compatibility claim and
doubles declaration/runtime/consumer evidence. Pilot `0.1.x` remains the M19
companion; `0.2.x` targets M21 base `^0.4.0` exactly.

### Move M21 core or base `latest` before pilot

Rejected. Core-first breaks the old default base peer. Base-first breaks both
the old pilot/base edge and the base/core edge. Pilot, base, core limits each
mixed window to one unresolved adjacent peer.

### Combine M21 with React or another functional milestone

Rejected by review-145 option A. M21 exists to deliver the already completed
M20 contract before new Public surface is accumulated.

## 5. Out of scope

- Changing runtime behavior, schemas, diagnostics, exports or entry points.
- Promoting any API to Stable or releasing `1.0.0`.
- Making the GitHub repository public.
- Drafting final paid-license prices or legal clauses without professional
  review.
- Accepting external code contributions before a rights policy exists.
- Automating M21 or future releases while D-043 remains Deferred.
- Preparing or configuring trusted publishing, staged publishing, public
  repository metadata, token restrictions or provenance before the repository
  sanitization/publication milestone.
- Publishing, tagging, creating releases or changing remote visibility merely
  because this ADR is accepted.
- Preparing the next release plan before revision 5 passes a complete review
  and is accepted.
- Changing SPEC-009 behavior, exports, support tiers or framework ranges.
- Publishing Standard/reference applications, another package, another UI kit
  or any functional Deferred capability.

## 6. Acceptance criteria

1. AGPL and commercial permissions remain legally separate and AGPL commercial
   use is not charged or restricted beyond AGPL.
2. The legal holder, exact notice, SPDX identifier and license text are
   unambiguous.
3. Corresponding Source is complete and publicly available for each package
   despite the private repository.
4. Root/private package boundaries, exact M19 and M21 three-package inventories,
   independent SemVer, Experimental API and Angular compatibility remain
   explicit and unchanged outside their selected lines.
5. Contribution rights, third-party code and commercial-contract boundaries
   are explicit.
6. Registry identity, interactive 2FA, tag, recovery and clean-consumer gates
   complete without credentials in the repository; trusted publishing and
   provenance remain explicitly deferred with repository metadata.
7. M19 history remains exact; M21 publishes core/base/pilot dependency-first
   under `next`, then moves established pilot/base/core `latest` deepest-
   dependent first with no accepted evidence from mixed windows.
8. Every external mutation retains an immediate explicit approval checkpoint
   followed by complete read-only observation.
9. Partial failure preserves immutable versions and requires explicit
   stop/resume or corrective-tag evidence; it never assumes overwrite,
   unpublish or deletion of an observed default `latest`.
10. D-034/D-040 alone are active; D-043 and all functional deferred
    capabilities remain inactive.
11. M21 may close without a trusted publisher because no matching public
    repository exists; later automation requires separate promotion and review.
12. Acceptance authorizes preparation/review of the next release plan only, not
    implementation, manifests, candidates, Git, registry reads/writes,
    publication or tags.

## 7. References

- [GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.html)
- [How to use GNU licenses](https://www.gnu.org/licenses/gpl-howto.html.en)
- [OSI AGPL-3.0 entry](https://opensource.org/license/agpl-3.0)
- [Open Source Definition](https://opensource.org/osd)
- [npm scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
- [npm dist-tags](https://docs.npmjs.com/cli/commands/npm-dist-tag/)
- [npm registry package metadata](https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance requirements](https://docs.npmjs.com/generating-provenance-statements/)
