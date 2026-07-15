# ADR 018: Dual AGPL/commercial licensing and public experimental publication

- **Status:** Accepted
- **Date:** 15 July 2026
- **Acceptance date:** 15 July 2026
- **Revision:** 2 — mandatory npm latest alias without stability promotion
- **Promotion review:**
  [`review 027`](../reviews/027-d034-d040-publication-licensing-readiness.md)
  cycle 2 passed with zero findings
- **Related:** [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-010`](./010-versionado-semver-compatibilidad.md),
  [`ADR-013`](./013-preparacion-artefactos-experimentales-0-1.md),
  [`D-034`](../roadmap/deferred-decisions.md#d-034-modelo-comercial-y-licenciamiento)
  and
  [`D-040`](../roadmap/deferred-decisions.md#d-040-publicacion-real-de-paquetes)
- **Milestone:** M13 — First public experimental release
- **Implementation authorized:** No
- **Complete review:**
  [`review 028`](../reviews/028-adr-018-review.md) cycle 4 passed the complete
  closing review with zero findings after six corrections; accepted under
  Ricard's standing authorization

## 1. Context

M8 produced verified private `0.1.0` candidates for
`@rabassoft/schema-engine` and `@rabassoft/schema-engine-angular`. M9–M12 then
expanded the accepted runtime while preserving their package boundary,
Experimental API classification and independent versioning. Both package
manifests still use `private: true`, package documentation forbids external
distribution and the repository is private.

Ricard selected an Open Source plus commercial dual-license model and a public
first package release. The choice must preserve genuine AGPL rights, identify
the natural-person rights holder, supply Corresponding Source despite the
private repository, and retain an explicit approval gate before any irreversible
remote operation.

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

The GitHub repository remains private until a separate sanitization review
checks its entire reachable history, secrets, personal data and internal
documentation. M13 does not make it public.

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
- Only the two existing package manifests may remove `private: true`.
- Both first public versions remain independent `0.1.0` releases despite being
  published together initially.
- Both are Public + Experimental + Active; no API becomes Stable.
- npm access is public under the `@rabassoft` scope.
- The recommended Experimental channel is dist-tag `next`.
- npm requires every published package to define `latest`; that mandatory alias
  may point to the same first Experimental version. It is registry routing only
  and never promotes an API, package or support policy to Stable.
- Existing root entry points, exports, dependencies, peers and Angular range
  remain unchanged unless a separately accepted decision requires otherwise.
- Already published bytes or versions are never replaced. Failure uses a new
  version, deprecation/dist-tag correction or another registry-supported
  recovery procedure defined by the plan.

### 2.5 Ownership and contributions

Commercial relicensing requires sufficient rights over all included code.
Until a separately reviewed CLA or copyright-assignment policy exists, the
project does not accept external code contributions. Issues, discussions or
non-code feedback do not grant code rights and may be enabled later under a
separate public-repository policy.

The plan must audit the initial release for third-party code and licenses and
must not dual-license material for which Ricardo Rabassó Rodríguez lacks the
required rights.

### 2.6 Publication security and provenance

Before publication, the plan must verify:

1. control of the npm `@rabassoft` scope and both exact package names;
2. the publishing identity and public commercial/security contacts;
3. interactive 2FA for the first package creation, because an npm trusted
   publisher cannot be configured until that package exists;
4. registry access, `next` tag and public visibility from packed metadata; if
   npm exposes mandatory `latest`, it must resolve to the same inspected
   Experimental version and documentation must not present it as Stable;
5. after initial creation, npm trusted publishing from the exact private GitHub
   workflow, with token publishing disabled when npm permits it;
6. license, notices, Corresponding Source and complete tarball inventories;
7. the frozen install, full test/build/package matrix and clean consumers; and
8. a final human approval checkpoint immediately before each external mutation.

No ADR or plan approval itself authorizes `npm publish`, Git tags, GitHub
releases, repository visibility changes or credential operations. Those
actions require the final explicit checkpoint described by the plan.

npm provenance is not claimed for the first release: npm requires a public
repository matching `package.json#repository`, while the selected repository
remains private. The release documentation records that limitation. Provenance
becomes a required follow-up gate when a sanitized public repository exists;
the project must not publish a misleading or unverifiable provenance URL.

### 2.7 Commercial agreement

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

### Negative

- Strong copyleft may reduce adoption among proprietary consumers.
- Dual licensing constrains how external contributions can be accepted.
- Publishing complete buildable source inside release artifacts increases
  package/release complexity while the repository remains private.
- npm's mandatory `latest` alias means an unqualified install resolves an
  Experimental version; documentation must recommend `next` or an exact
  version and explicitly deny any stability implication.
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

Rejected for M13. Its history and persistent internal documentation require a
separate sanitization review before visibility changes.

## 5. Out of scope

- Changing runtime behavior, schemas, diagnostics, exports or entry points.
- Promoting any API to Stable or releasing `1.0.0`.
- Making the GitHub repository public.
- Drafting final paid-license prices or legal clauses without professional
  review.
- Accepting external code contributions before a rights policy exists.
- Automating future releases beyond the narrowly approved first-release plan.
- Publishing, tagging, creating releases or changing remote visibility merely
  because this ADR is accepted.

## 6. Acceptance criteria

1. AGPL and commercial permissions remain legally separate and AGPL commercial
   use is not charged or restricted beyond AGPL.
2. The legal holder, exact notice, SPDX identifier and license text are
   unambiguous.
3. Corresponding Source is complete and publicly available for each package
   despite the private repository.
4. Root/private package boundaries, independent SemVer, Experimental API and
   Angular compatibility remain unchanged.
5. Contribution rights, third-party code and commercial-contract boundaries
   are explicit.
6. Registry identity, security, provenance, tag, rollback and clean-consumer
   gates are deliverable without credentials in the repository; the accepted
   first-release absence of provenance is explicit and truthful.
7. Mandatory `latest`, when exposed by npm, aliases the inspected Experimental
   release without changing Public + Experimental + Active classification.
8. Every external mutation retains an immediate explicit approval checkpoint.
9. D-034/D-040 alone are active; no functional deferred capability changes.

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
