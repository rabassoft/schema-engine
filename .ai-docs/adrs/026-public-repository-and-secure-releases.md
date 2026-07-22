# ADR 026: Sanitized public history and secure release automation

- **Status:** Accepted
- **Date:** 21 July 2026
- **Acceptance date:** 21 July 2026
- **Revision:** 0
- **Promotion review:**
  [`review 165`](../reviews/165-d043-m22-repository-publication-promotion-readiness.md)
  cycle 2 passed with zero findings; Ricard then selected option A
- **Decision review:**
  [`review 166`](../reviews/166-adr-026-adr-018-revision-6-review.md) cycle 3
  passed all fourteen areas with zero findings
- **Related:** [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-010`](./010-versionado-semver-compatibilidad.md),
  [`ADR-018 revision 6`](./018-licencia-dual-publicacion-experimental.md),
  [`D-043`](../roadmap/deferred-decisions.md#d-043-publicacion-del-repositorio-y-automatizacion-segura-de-releases)
- **Milestone:** M22 repository sanitization/publication and secure-release
  preparation
- **Implementation:** PLAN-024 revision 0 is Approved; checkpoints 1–7 are
  complete after reviews 168–175, with checkpoint 7's corrective public closure
  verified by review 175 cycle 6; checkpoint 8 settings remain separately gated

## 1. Context

Schema Engine packages were published under AGPL-3.0-only/commercial dual
licensing while their repository was private. Existing releases therefore
carry package-local Corresponding Source and intentionally omit repository and
provenance metadata. Publishing the repository can improve source
traceability, issue reporting and future supply-chain evidence, but it also
exposes every reachable historical blob and cannot be treated as a visibility
toggle.

Review 165 found 62 reachable commits with one intended author identity, no
credential-like finding from the initial heuristic scan and one historical
local absolute path. The current tree contains 235 `.ai-docs` files, no public
community/security policy, a stale `main` default branch, unprotected long-lived
branches and permissive GitHub Actions settings. Dedicated secret scanners are
not installed locally, so the heuristic scan is not publication evidence.

Ricard selected review-165 option A: preserve the existing reachable history
after sanitization and make `.ai-docs` public after complete classification and
sanitization. This decision fixes that architecture while retaining separate
approval for every destructive or external action.

## 2. Decision

### 2.1 Canonical repository and retained lineage

The canonical public source repository is
`https://github.com/rabassoft/schema-engine`. Its visibility changed only after
every pre-visibility gate in this ADR and the approved plan passed.

The public repository preserves the existing reachable lineage, subject to a
minimal deterministic rewrite of material that violates the public-content
policy. It is not replaced by a squashed or unrelated clean root. If a rewrite
changes commit IDs, the plan must publish an old-to-new commit map for every
historically referenced release/source commit and prove tree equivalence except
for the reviewed sanitization substitutions.

Existing npm artifacts remain immutable. Their recorded pre-sanitization commit
IDs may cease to resolve after a rewrite; their embedded package-local
Corresponding Source remains authoritative. The public map explains the
relationship to the sanitized lineage without claiming retroactive provenance.

An audit and rewrite run from a fresh isolated clone or mirror of the remote
reachable refs. Local dangling/unreachable objects are neither publication
input nor evidence. No local reflog, stash, ignored file, credential store,
package cache or generated release directory may enter the public mirror.

### 2.2 Public-content policy

The current source tree, reference applications, tests, scripts, accepted
architecture documents and `.ai-docs` persistent project memory are intended
to be public after sanitization. Historical statements that the repository was
private remain valid historical evidence; “private” package/reference-shell
classification continues to mean non-published or non-public-API, not secret
source.

No reachable public blob may contain:

- credentials, tokens, OTPs, private keys, auth files or secret material;
- home addresses, tax/government identifiers, private contract terms or
  non-public third-party personal data;
- local absolute paths, machine/user-specific cache paths or private network
  endpoints;
- inaccessible private source links presented as consumer documentation;
- generated tarballs, caches, coverage, logs or build output; or
- material for which Rabassoft lacks publication rights.

The public legal identity, copyright notice, verified business contact,
published package metadata, release hashes and non-secret audit evidence are
allowed. The plan must classify every dedicated-scanner finding rather than
silently suppress it. A real credential finding requires immediate
revocation/rotation before rewrite; a rights or personal-data uncertainty stops
the gate for explicit resolution.

The known local path in historical review 132 must be replaced consistently in
the current tree and all reachable history. Sanitization never edits published
npm bytes or rewrites an existing npm version.

### 2.3 Branch topology and public change control

`main` remains the default public/release branch; `develop` remains the
integration branch. Before visibility changes, the approved plan must move both
remote branches to their reviewed sanitized equivalents and bring `main` to
the selected release-ready `develop` baseline. The exact update, including any
force-with-lease caused by rewriting, is destructive/external and requires an
immediate explicit approval.

Once public:

- `main` accepts changes only through reviewed pull requests and required
  checks; direct force pushes and deletion are prohibited;
- `develop` accepts integration through pull requests and required checks;
  force pushes and deletion are prohibited;
- required checks must exist and pass before they become mandatory;
- unresolved review conversations block merging where the available GitHub
  plan supports it;
- administrative bypass is disabled where available, or otherwise restricted
  to documented emergency recovery followed by audit; and
- ruleset/protection availability is reobserved after the repository becomes
  public. Missing paid-plan features must use the strongest available native
  controls and may not be represented as enabled.

Schema Engine currently has one maintainer. A rule that requires an independent
reviewer the project cannot supply would deadlock delivery and is not claimed.
The plan must use enforceable solo-maintainer controls now and may strengthen
the review count when another trusted maintainer exists.

### 2.4 Public governance and contribution boundary

Before visibility changes, the root must contain reviewed public policies:

- `SECURITY.md` directs vulnerability reports to GitHub private vulnerability
  reporting when enabled, with the verified public Rabassoft contact as a
  fallback;
- `CONTRIBUTING.md` permits Issues and non-code feedback but states that
  external code contributions are not accepted until a separately reviewed
  CLA/copyright-assignment policy satisfies ADR-018;
- a Code of Conduct governs public interaction; and
- README/support language accurately states Experimental status, no support
  SLA and the AGPL/commercial boundary.

Issues remain enabled for reproducible defects, questions and non-code
feedback. Discussions remain disabled until separately justified. Pull requests
cannot be technically disabled on GitHub, so unsolicited code submissions are
closed according to `CONTRIBUTING.md` without merging or obtaining relicensing
rights by implication.

### 2.5 Actions trust boundary

GitHub Actions is deny-by-default for release authority:

- repository/workflow default permissions are read-only;
- third-party actions are allowlisted and pinned to full commit SHAs;
- pull-request workflows receive no publish authority or write credential;
- untrusted fork code never runs in a privileged release context;
- build/test jobs do not receive `id-token: write`;
- only the reviewed publish job receives `contents: read` and
  `id-token: write`, with no broader write permission; and
- dependency caches are disabled for the release build unless a later review
  proves a content-addressed, non-poisonable boundary.

The release workflow is manually dispatched from an exact commit on protected
`main`, references a protected `npm-publish` environment and rebuilds/verifies
the selected release descriptor before any publish step. The environment
requires authenticated human approval. With one maintainer, self-approval may
remain possible; disabling self-review is deferred until a second authorized
reviewer exists.

Workflow approval is not npm OTP authentication. npm account write-protected
2FA remains enabled, while the publish job authenticates only through the
short-lived OIDC token. No npm automation token, OTP or long-lived write token
is stored in GitHub or the repository.

### 2.6 Package metadata, trusted publishing and provenance

Only a future, separately selected immutable package version may add:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rabassoft/schema-engine.git",
    "directory": "packages/<package-directory>"
  }
}
```

The exact `directory` is package-specific and must match the source tree. The
root workspace is not an npm package. Existing public versions retain their
original metadata and are not described as repository-backed or provenance-
bearing.

Trusted publishing is configured separately for every npm package, binding the
exact Rabassoft repository and reviewed workflow filename. Before configuration
or use, the plan rechecks current official npm/GitHub requirements. As of this
decision, npm requires a matching `repository.url`, GitHub-hosted execution,
Node 22.14.0 or later, npm CLI 11.5.1 or later and `id-token: write`. These are
minimum observed prerequisites, not permanent version pins.

The safe migration order is:

1. publish and verify the sanitized public repository and exact workflow;
2. prepare a future package version with truthful repository metadata;
3. configure that package's exact npm trusted publisher;
4. use a separately approved release plan to publish through OIDC and verify
   exact bytes, metadata, signature and automatic provenance; and
5. only after successful trusted publication, disable/revoke traditional
   automation tokens according to observed npm controls.

Manual interactive 2FA remains the recovery path until the first successful
OIDC publication. Token restrictions must not be tightened early enough to
remove the only proven recovery route. After OIDC succeeds, any traditional
write-token exception requires a separate time-bounded incident decision.

npm trusted publishing generates provenance automatically only when its
current conditions are satisfied, including public repository and public
package. The workflow must not add `--provenance=false`, fabricate an
attestation or claim provenance before registry verification. A future release
plan, not this ADR, chooses versions, packages, tags and publication order.

### 2.7 Fail-closed implementation gates

PLAN-024 must separate at least these checkpoints:

1. install/pin a dedicated secret scanner and record its version/rules;
2. create a fresh isolated mirror, inventory every reachable ref/blob and run
   secret, personal-data, rights, filename and generated-file checks;
3. prepare deterministic substitutions, public policies and the commit map;
4. repeat the complete scan and prove allowed tree/history differences with
   zero unresolved findings;
5. obtain immediate approval for any rewrite and coordinated force-with-lease;
6. verify fresh remote clones and synchronize `main`/`develop` before
   visibility;
7. obtain immediate approval for public visibility and verify anonymous clone,
   history, docs, license, links and policy surfaces;
8. configure and verify branch/Actions/environment/security settings in
   independently approved mutations; and
9. stop with repository preparation complete.

Package metadata, trusted-publisher npm settings and the first provenance-
bearing release require a later release promotion and plan. They are not
implementation checkpoints of PLAN-024 merely because their architecture is
defined here.

Every checkpoint observes actual state before and after mutation. Unexpected
remote drift, scan finding, unsupported setting, branch mismatch, failed check
or incomplete anonymous verification stops the plan. Recovery never deletes
published versions, hides findings, weakens policy silently or force-updates a
ref outside the approved map.

## 3. Consequences

### Positive

- Consumers gain public source continuity, architecture context and future
  verifiable release provenance.
- The existing project-memory workflow remains usable without a second private
  documentation repository.
- Short-lived OIDC removes long-lived release credentials after a proven
  transition.
- Branch, environment and human gates preserve deliberate solo-maintainer
  releases without claiming unavailable independent review.

### Negative

- Publishing `.ai-docs` exposes detailed development history and requires
  permanent discipline around personal and operational data.
- The known path substitution changes affected commit IDs and requires a
  destructive coordinated remote rewrite plus a public mapping.
- Historical package source commits may not resolve directly after rewrite;
  package-local Corresponding Source and the mapping must explain continuity.
- GitHub feature availability varies by visibility and plan and must be
  observed rather than assumed.
- OIDC cannot be proven end to end without publishing a new immutable version,
  so repository preparation and release migration close separately.

## 4. Alternatives considered

### Clean public lineage

Rejected by Ricard in favor of preserving sanitized history. It reduces legacy
disclosure but breaks continuity with current development and source evidence.

### Publish the repository without rewriting

Rejected. The known local path and unclassified historical content violate the
fail-closed public-content policy.

### Keep `.ai-docs` private in a second repository

Rejected for M22. It duplicates project state and weakens the repository's
architectural traceability. Sensitive material belongs outside persistent
project memory rather than inside a second versioned copy.

### Token-based automated publishing

Rejected after the OIDC transition. Long-lived write tokens create avoidable
rotation and disclosure risk. Interactive 2FA remains only as the proven
transition/recovery mechanism until trusted publishing succeeds.

### Fully automatic publication on tag push

Rejected. A tag alone does not replace the accepted release descriptor,
complete verification and authenticated environment approval.

## 5. Out of scope

- Any repository/history/settings mutation or public visibility change.
- PLAN-024 implementation, commit, push, force update or external write.
- A package version, release sequence, npm publication, dist-tag, Git tag or
  GitHub Release.
- Runtime/API/SPEC behavior, Stable promotion or framework compatibility.
- External code contributions, CLA terms, commercial contract terms or SLA.
- Hosting the reference applications or publishing another package.

## 6. Acceptance criteria

1. Existing reachable lineage and `.ai-docs` are public only after deterministic
   sanitization and a complete zero-finding scan.
2. Every rewritten source commit receives a verifiable public mapping while npm
   artifacts remain immutable and retain package-local source authority.
3. `main`/`develop`, public policies and strongest enforceable solo-maintainer
   protections are explicit without claiming unavailable features.
4. External code contributions remain closed under ADR-018 while Issues and
   private security reporting have truthful policies.
5. Release workflows are manual, protected, least-privilege, SHA-pinned and
   isolated from untrusted pull-request code.
6. Package metadata begins only in future immutable versions and matches the
   exact public repository/package directory.
7. OIDC, toolchain prerequisites, environment approval, automatic provenance
   and token transition are verified in the required safe order.
8. Every destructive/external action is independently approved and followed by
   read-only observation with fail-closed recovery.
9. No runtime, API, SPEC, version, package or release is selected.
10. Acceptance authorizes preparation/review of PLAN-024 only.

## 7. References

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm provenance statements](https://docs.npmjs.com/generating-provenance-statements/)
- [GitHub OIDC reference](https://docs.github.com/en/actions/reference/security/oidc)
- [GitHub deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments)
- [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
