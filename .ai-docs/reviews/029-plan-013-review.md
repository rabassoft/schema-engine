# PLAN-013 complete review

- **Date:** 2026-07-15
- **Subject:** [`PLAN-013 revisions 0–4`](../plans/013-public-experimental-release.md)
- **Status:** Accepted
- **Scope:** complete delivery-contract review; no implementation, credential
  operation or external mutation

## Review areas

Every cycle reviews the complete plan against ADR-018, ADR-013, ADR-010,
ADR-009, D-034/D-040, the current package boundary and npm's selected release
mechanisms:

1. authorization boundaries and irreversible checkpoints;
2. dual-license notices, ownership and third-party rights;
3. complete package-local Corresponding Source;
4. package manifests, exports, dependencies and Experimental SemVer;
5. local build/test/package/consumer/security evidence;
6. npm identity, 2FA, tags, visibility, provenance and recovery;
7. partial-release and post-publication security handling; and
8. persistent-state and deferred-boundary consistency.

## Cycle 1 — Findings

The complete first pass found four issues:

1. **Source reconstruction was not exact enough.** `tsconfig.source.json` and
   prose dependency expectations did not guarantee a package-local frozen
   toolchain or prevent the verifier from reading private workspace files.
2. **The final registry client/security evidence was underspecified.** The plan
   recorded the current npm version but did not bind the dry-run/live commands
   to a recorded compatible CLI or require a safe read-only snapshot of the
   relevant account/scope security state.
3. **The deferred-decisions current-work section contradicted the promoted
   state.** It still described D-040 as Deferred after review 027 and ADR-018.
4. **The proposed public contact lacks explicit confirmation.** The npm user
   `rabassoft` is confirmed, but public use of `ricard@rabassoft.com` for both
   commercial and security inquiries has not yet been confirmed.

## Cycle 1 — Corrections

- Replaced the prose-only source build with an included `source-build/`
  manifest, frozen lockfile and configuration for each package, and required a
  rebuild using only the extracted tarballs.
- Required the exact compatible npm CLI version and a non-secret read-only
  security-state snapshot before registry writes; made the clean committed
  tarball hashes the sole publishable hashes.
- Reconciled the deferred-decisions current-work section with D-034/D-040's
  normative-design-only Promoted state.
- Retained the contact as unresolved; no privacy-sensitive default is accepted
  by inference.

## Next review gate

Ricard explicitly confirmed `ricard@rabassoft.com` for public package metadata,
README and NOTICE.

## Cycle 2 — Complete repeated review

The review repeated all eight areas from the beginning after applying cycle 1
corrections and confirming the public contact.

- The three authorization zones remain disjoint: plan acceptance authorizes
  reversible local preparation only, while commit/push and every npm mutation
  retain immediate explicit approval gates.
- `AGPL-3.0-only` remains a complete Open Source permission independent from
  the unexecuted paid commercial alternative; ownership, notices, contact and
  third-party-rights checks match ADR-018.
- Both packages carry preferred TypeScript source and package-local frozen
  build harnesses that must rebuild without private workspace input.
- Versions, Public Experimental APIs, entry points, exports, dependencies,
  peers, Angular compatibility and the private workspace root remain fixed.
- The complete local matrix covers frozen installation, formatting,
  documentation, lint, types, tests, builds, artifacts, clean consumers,
  source reconstruction, inventories, secrets and dry runs.
- npm identity, exact compatible CLI, interactive 2FA, `next`, absence of
  `latest`, public access, private-repository provenance limitation and
  immutable recovery are explicit and verifiable.
- Core-only partial publication and post-creation trusted-publishing security
  have safe stop/recovery behavior without unpublish or silent overwrite.
- STATUS, ROADMAP, indexes and D-034/D-040 consistently describe normative
  promotion, plan approval and the remaining external gates.

**Result:** zero findings and no unresolved change request. PLAN-013 revision 0
is accepted; only its local preparation zone becomes active.

## Cycle 3 — Implementation-readiness finding

The first checkpoint implementation exposed one ordering conflict missed by
cycle 2: checkpoint 1 required packed source inventories and isolated rebuilds,
but the package `files` allowlists were not expanded until checkpoint 2. The
checkpoint 1 gate therefore could not pass independently.

Correction: PLAN-013 revision 1 moves only the private `files` allowlist change
to checkpoint 1. Both manifests retain `private: true` and have no public
license or publish configuration until checkpoint 2.

## Cycle 4 — Complete repeated review

The review repeated all eight areas from the beginning against revision 1.
The corrected ordering makes every checkpoint independently executable while
preserving all authorization zones and the exact allowed diff. Licensing,
Corresponding Source, package/API/SemVer boundaries, the complete local matrix,
npm identity/security/provenance, partial-release recovery and persistent state
remain consistent with the accepted ADRs and promoted D-034/D-040 boundary.

**Result:** zero findings and no unresolved change request. PLAN-013 revision 1
is accepted and its reversible local preparation resumes.

## Cycle 5 — Checkpoint 5 identity finding

The live identity gate found that the original preflight conflated the npm
publishing user with the organization scope. Creating organization `rabassoft`
required Ricard's human account to use username `ricardrabasso`; requiring
`npm whoami` to equal the organization name was therefore impossible despite
valid scope control.

Correction: PLAN-013 revision 2 distinguishes authenticated human user
`ricardrabasso` from organization/scope `rabassoft` and requires read-only proof
that the user owns that organization. No package name, scope, license,
publication command or authorization boundary changes.

## Cycle 6 — Complete repeated review

All eight review areas were repeated from the beginning against revision 2.
The user/organization distinction matches npm's observed access model:
`ricardrabasso` is the authenticated owner of `rabassoft`, the verified contact
remains `ricard@rabassoft.com`, and `auth-and-writes` 2FA protects the account.
The exact package scope/names, AGPL/commercial model, Corresponding Source,
versions, exports, dependencies, Experimental policy, `next` tag, private
repository/no-provenance boundary, immutable recovery and separate external
approval gates are unchanged.

**Result:** zero findings and no unresolved change request. PLAN-013 revision 2
is accepted under the standing authorization because it corrects observed
identity evidence without expanding scope or authorizing publication.

## Cycle 7 — Persistent-state finding and correction

The post-correction consistency pass found that ROADMAP still named PLAN-013
revision 1 and described M13 as reversible local preparation only. It was
updated to revision 2, checkpoints 1–5 accepted and the exact core-publication
stop, without marking M13 complete.

## Cycle 8 — Complete repeated review

All eight areas were repeated from the beginning after the ROADMAP correction.
PLAN-013 revision 2 remains consistent with accepted ADRs, package/runtime/API
boundaries, Corresponding Source and licensing, observed npm identity/security,
immutable release recovery and every external approval gate. STATUS, ROADMAP,
both PLAN-013 reviews and the append-only worklog now report the same checkpoint
5 boundary.

**Result:** zero findings and no unresolved change request. PLAN-013 revision 2
remains accepted; no publication or settings mutation is authorized.

## Cycle 9 — Current-state compaction finding and correction

The next closing pass found STATUS retained more than five completed outcomes,
including an obsolete revision 1 item. STATUS was compacted to the five newest
checkpoint outcomes without removing history from WORKLOG.

## Cycle 10 — Complete repeated review

All eight areas were repeated again from the beginning. The accepted plan,
architecture, implementation evidence, ROADMAP and compact current state agree
on revision 2, accepted checkpoint 5 identity/security evidence and the
immediate core-publication stop. Historical revision 1 evidence remains only in
review/worklog history.

**Result:** zero findings and no unresolved change request. PLAN-013 revision 2
remains accepted; no registry mutation is authorized.

## Cycle 11 — Mandatory latest finding and correction

Live core publication and the rejected removal proved the plan's no-`latest`
gate incompatible with npm's registry invariant. Ricard accepted ADR-018
revision 2 and PLAN-013 revision 3. The plan now requires both `next` and
mandatory `latest` to resolve to the same inspected Experimental version, and
forbids interpreting the alias as Stable.

## Cycle 12 — Complete repeated review

All eight areas were repeated from the beginning. The revision preserves exact
tarballs, immutable versions, AGPL/commercial licensing, Corresponding Source,
private-repository/no-provenance policy, package/API/dependency/compatibility
boundaries, separate core/Angular approvals and recovery without unpublish.
Mandatory `latest` changes only observed registry routing and is documented as
Experimental alongside recommended `next` and exact versions.

**Result:** zero findings and no unresolved change request. PLAN-013 revision 3
is accepted by Ricard; no Angular publication or settings mutation is
authorized.

## Cycle 13 — Trusted-publisher closure conflict and correction

Checkpoint 7 required a private GitHub trusted-publishing workflow while
checkpoint 2 prohibited the matching inaccessible `repository.url`. npm's
current contract makes that workflow unusable, so PLAN-013 could not complete
without violating one of its own gates.

Ricard approved revision 4. Checkpoint 7 now closes the observed manual/2FA
release through repeated live bytes, installs, signatures, no-provenance and
documentation checks. Repository publication, metadata, OIDC, staged approval,
token restrictions and provenance are deferred together; no workflow, setting
or later publication is authorized.

## Cycle 14 — Complete repeated review

All eight review areas were repeated from the beginning. Revision 4 preserves
the three authorization zones and every completed package publication gate,
AGPL/commercial licensing, Corresponding Source, exact immutable bytes,
Experimental SemVer, dependencies/peers, recovery and private-repository
boundary. Its closure criteria are fully evidenced by review 030 and do not
claim future-release automation or provenance.

**Result:** zero findings and no unresolved change request. PLAN-013 revision 4
is approved and complete; no Git, registry or settings mutation is authorized.
