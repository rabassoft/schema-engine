# PLAN-025 complete review — Cycles 1–2

- **Date:** 2026-07-25
- **State:** Accepted after cycle 2 under Ricard's option-A selection and
  standing zero-finding review authorization
- **Document:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Authority:** accepted ADR-026 revision 1, coordinated ADR-018 revision 7,
  ADR-010, review 178 option A and completed PLAN-024
- **Outcome:** Cycle 2 passed all eighteen areas with zero unresolved findings;
  PLAN-025 revision 0 is Approved and authorizes only local checkpoint 1

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                                              | Correction                                                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R180-F01 | The proposed workflow wording allowed staging rebuilt package directories, so GitHub could repack bytes different from the reviewed deterministic candidates.        | Require deterministic M23 `.tgz` generation and stage only the exact descriptor-named tarball paths.                                                            |
| R180-F02 | The develop clean rebuild could be read as selected publishable evidence even though provenance must bind the exact protected `main` commit.                         | Keep develop artifacts as comparison candidates and select only byte-identical candidates rebuilt at the exact protected `main` source.                         |
| R180-F03 | Workflow dispatch and protected-environment approval were grouped despite being two distinct external mutations by different gates.                                  | Stop separately for dispatch and, once the run reaches the environment, for Ricard's authenticated environment approval.                                        |
| R180-F04 | A frozen descriptor with its future source SHA would require a Git commit to contain its own hash, an impossible self-reference already latent in the readiness API. | Keep policy/version metadata frozen; validate requested source against runtime `GITHUB_SHA` on protected `main` and bind selected evidence to that same commit. |
| R180-F05 | M19/M21 immutability was required narratively but the external preflight did not enumerate its existing exact/`next`/`latest`/unqualified executable regressions.    | Name all eight frozen live commands in checkpoint 6 and require their repetition at final closure.                                                              |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeated:

1. accepted-option authority and promoted D-043 boundary;
2. independent SemVer PATCH versions and three-package inventory;
3. preserved packed `^0.4.0` peer floors and workspace source specifiers;
4. unchanged runtime, API, declarations, dependencies and framework ranges;
5. exact package-specific public repository metadata;
6. deterministic tarballs and protected-`main` source identity without a
   self-referential descriptor;
7. stage-only trust identity and prohibition of direct/token publication;
8. exact Node/npm/pnpm tooling and official-requirement reobservation;
9. least-privilege workflow, job isolation and protected environment;
10. local, Git, GitHub, npm and human-approval authorization zones;
11. dependency-first staging and package-by-package 2FA approval;
12. staged/downloaded/selected byte identity and automatic provenance;
13. deepest-dependent-first `latest` transitions and mixed-window exclusion;
14. M19/M21 immutable live regressions and M23 consumer coverage;
15. source/license/security/public-tree and private-package exclusions;
16. token-restriction timing and preserved interactive recovery;
17. partial-stage/publication/tag failure and immutable correction; and
18. checkpoint reviews, persistent-state updates and final zero-finding
    completion.

No conflict remains with accepted SPEC-009, ADR-009, ADR-010, ADR-018 revision
7, ADR-026 revision 1, completed M21/M22 or inactive Deferred capabilities.

## Approval boundary

PLAN-025 revision 0 is Approved. Approval authorizes only checkpoint 1:
descriptor/tooling/test implementation that leaves current manifests and
workflow failing closed for M23.

It does not authorize package versions, manifests, lockfile, release candidates,
commit, push, PR, merge, workflow dispatch/environment approval, npm trust,
stage approval/rejection, dist-tags, token changes, Git tags, GitHub Releases or
private-backup deletion. Every later checkpoint retains PLAN-025's explicit
gate.
