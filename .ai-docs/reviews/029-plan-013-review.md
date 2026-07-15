# PLAN-013 complete review

- **Date:** 2026-07-15
- **Subject:** [`PLAN-013 revision 0`](../plans/013-public-experimental-release.md)
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
