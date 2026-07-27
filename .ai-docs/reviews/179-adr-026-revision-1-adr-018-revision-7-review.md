# ADR-026 revision 1 and ADR-018 revision 7 coordinated review — Cycles 1–2

- **Date:** 2026-07-25
- **State:** Accepted after cycle 2 under Ricard's option-A selection and
  standing zero-finding review authorization
- **Authority:** Ricard selected review-178 option A; review 178 promotes only
  M23 normative design
- **Documents:** proposed
  [`ADR-026 revision 1`](../adrs/026-public-repository-and-secure-releases.md)
  and proposed
  [`ADR-018 revision 7`](../adrs/018-licencia-dual-publicacion-experimental.md)
- **Outcome:** Cycle 2 passed all sixteen areas with zero unresolved findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                      | Correction                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| R179-F01 | ADR-018 carried both the revision-6 date and a second generic `Revision date` field, making the active revision metadata ambiguous.          | Retain each accepted revision's explicit acceptance date and one active revision-7 date.                                                 |
| R179-F02 | ADR-018 still said M22 branch/governance controls remained gated after PLAN-024 checkpoints 8–9 completed them.                              | Record the public transition as historical checkpoint 7 and the later protected-control closure as completed checkpoints 8–9.            |
| R179-F03 | The generic external gate named direct publication but omitted staging, stage approval/rejection and dist-tags selected by M23.              | Name every M23 registry mutation explicitly while preserving immediate authorization and post-action verification.                       |
| R179-F04 | Two revision-6 context/consequence phrases still described repository metadata/provenance as an unspecified future gate after M23 selection. | Reframe the old state historically and identify M23 plus an approved PLAN-025 as the active future gate without claiming implementation. |

## Cycle 2 — complete zero-finding pass

Cycle 2 repeated:

1. review-178 authority and exact option-A boundary;
2. M22 historical preservation and M23 isolation;
3. independent PATCH SemVer under ADR-010;
4. exact core/base `0.4.1` and pilot `0.2.1` inventory;
5. preserved packed `^0.4.0` peer floors;
6. unchanged API, runtime, exports, dependencies and framework ranges;
7. public repository metadata and package-specific directories;
8. stage-only npm trust identity and allowed action;
9. GitHub-hosted least-privilege OIDC and protected environment;
10. current Node/npm floors as reobserved minimums rather than permanent pins;
11. deterministic staging, candidate comparison and dependency-first 2FA
    approval;
12. automatic provenance observation and exact-source binding;
13. dependent-first `latest` transition and mixed-window exclusion;
14. token restriction timing and interactive recovery;
15. immutable partial-stage/partial-publication recovery; and
16. exclusions, document authority and every local/Git/external gate.

No conflict remains with accepted SPEC-009, ADR-009, ADR-010, completed M21/M22,
the current immutable registry line or inactive Deferred capabilities.

## 1. Accepted design boundary

The coordinated revisions may be accepted only for:

- the three already admitted Public + Experimental packages;
- metadata/security PATCH versions core/base `0.4.1` and pilot `0.2.1`;
- unchanged packed Schema Engine peer floors `^0.4.0`;
- exact public `repository` metadata and removal of the explicit provenance
  opt-out only in those new immutable versions;
- three package-specific trusted-publisher relations bound to
  `rabassoft/schema-engine`, `npm-publish.yml` and environment `npm-publish`;
- `npm stage publish` as the only OIDC-allowed action;
- staged-tarball review followed by separately authorized dependency-first 2FA
  approvals;
- automatic provenance verification; and
- separately authorized pilot/base/core `latest` transitions after all
  exact/`next` evidence passes.

No SPEC revision is required because the boundary changes no observable product
behavior. Acceptance authorizes preparation and complete review of PLAN-025,
not implementation.

## 2. Version and compatibility conclusion

PATCH is correct because repository metadata and publication authentication do
not introduce intentional incompatibility or new Public behavior. Core/base
coordination does not create lockstep policy.

Bare `workspace:^` would make pnpm pack the bumped workspace version as
`^0.4.1`. Explicit `workspace:^0.4.0` retains local-only resolution while
preserving the already accepted consumer floor. Angular core/forms and
Aria/CDK ranges, build tuples, exports and support tiers remain exact.

## 3. Trust and provenance conclusion

Stage-only trust is narrower than direct publication and adds npm 2FA
proof-of-presence after GitHub environment approval. The trust relation is
package-specific and does not authorize stage inspection/approval, dist-tags or
other npm writes.

The workflow must reobserve current requirements before use, pin an exact npm
CLI satisfying staged publishing and fail without token fallback. Provenance is
accepted only after the public registry attestation resolves to the exact
repository, workflow and protected `main` source. Existing immutable versions
remain without retroactive repository/provenance claims.

## 4. Recovery conclusion

Staging reserves versions but does not make them public. Pending stages are
preserved or explicitly rejected; no rejected/reserved version is silently
reused. After approval, immutable publication rules apply. Missing or mismatched
provenance blocks dependent approvals and aliases.

The two dependent-first `latest` mixed windows are planned but cannot produce
accepted coordinated evidence. Corrective tags, token restriction, stage
rejection and every other npm write retain separate authorization.

## 5. Exclusions

Acceptance does not activate code behavior, another package/framework, Stable
API, wider peers, validator/reference publication, Git tags/Releases, private
backup deletion, manifests, workflow implementation, candidate preparation,
commit, push, PR, merge, GitHub settings, npm trust, workflow dispatch, stage,
approval, rejection, dist-tag or token restriction.

## 6. Acceptance recommendation

Accept ADR-026 revision 1 and ADR-018 revision 7 together. The exact next action
is to prepare and completely review PLAN-025. Under the standing zero-finding
review rule, this coordinated acceptance does not broaden Ricard's selected
option A and may be recorded without another architectural choice.

## Acceptance follow-up — 25 July 2026

Both revisions were accepted together after cycle 2 passed with zero unresolved
findings. Acceptance authorizes only preparation and complete review of
PLAN-025.
