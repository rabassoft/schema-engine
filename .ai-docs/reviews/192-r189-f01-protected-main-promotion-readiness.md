# R189-F01 protected-main promotion readiness — Cycles 1–6

- **Date:** 2026-07-28
- **State:** Accepted readiness after cycle 6 passed with zero findings
- **Scope:** Exact protected refs, promotion payload, branch controls, CI,
  documentation consistency and mutation boundary
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 191`](./191-r189-f01-protected-develop-rebuild-review.md)
- **Outcome:** The deterministic-gzip correction is ready for protected
  promotion after this documentation-only evidence is delivered to `develop`
  and its exact new head is reobserved; no delivery, promotion or npm mutation
  is authorized by this review

## Cycle 1 finding and correction

| ID       | Finding                                                                                                                                              | Correction                                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R192-F01 | PR #19 had merged review 191 evidence and passed post-merge CI, but current-state documents still described that evidence delivery as the next step. | Record exact PR #19 delivery/CI, make protected-main promotion the sole next decision, add this readiness evidence and repeat the complete applicable review. |

## Cycle 2 finding and correction

| ID       | Finding                                                        | Correction                                                                      |
| -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| R192-F02 | The new review document did not pass the repository formatter. | Apply the canonical format and repeat the complete applicable review from zero. |

## Cycle 3 finding and correction

| ID       | Finding                                                                                 | Correction                                                                                                |
| -------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| R192-F03 | The payload summary used an awkward, potentially ambiguous production-dependency claim. | State directly that no production dependency changes and repeat the complete applicable review from zero. |

## Cycle 4 finding and correction

| ID       | Finding                                                               | Correction                                                                      |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| R192-F04 | Recording R192-F03 introduced formatting drift in the findings table. | Apply the canonical format and repeat the complete applicable review from zero. |

## Cycle 5 finding and correction

| ID       | Finding                                                                                                                                             | Correction                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| R192-F05 | Promoting exact `develop@e99193b` immediately would omit this still-local readiness evidence from the protected promotion and recreate stale state. | Deliver these eight documentation files to `develop` first, then reobserve its exact head before requesting the separate promotion decision. |

## Cycle 6 — zero findings

1. **Exact refs:** public protected `main` is
   `4bcb6eabed76d8bc2fa877236d10b7831cbb6f00`; protected `develop` is
   `e99193b2ec71788c4bbc1149a4056fbf4d74747c`. `main` is their exact merge
   base, so `develop` is seven commits ahead and zero behind.
2. **Evidence delivery:** PR #19 merged exact head `80916f8` as
   `develop@e99193b`. Required run `30312801163`, job `90131912990`, passed in
   4m52s; post-merge run `30313179969`, job `90133059320`, passed every
   workflow step in 4m53s.
3. **Protection:** ruleset `19534784` is active for `main` and `develop`,
   provides no bypass actor, requires a pull request, resolved conversations,
   strict `verify`, and prohibits deletion and non-fast-forward updates.
4. **Promotion topology:** no PR to `main` is open. The accepted next mutation
   is documentation-only delivery of this evidence to `develop`. After its
   required/post-merge CI, the exact protected head must be reobserved before a
   separately authorized merge-commit PR to `main`, followed by
   required/post-merge CI and a separately authorized `main`-to-`develop`
   reconciliation.
5. **Payload:** the promotion contains the already reviewed M23 checkpoint
   evidence, historical live-consumer correction and R189-F01 deterministic
   gzip correction. There is no production dependency change;
   `fflate@0.8.3` is exact, development-only and absent from public artifacts.
6. **Contracts:** no runtime, declaration, export, manifest, peer, framework,
   diagnostic, package-version, source-license or public-API contract changes.
7. **Candidate boundary:** review 191's two clean protected-`develop`
   generations remain exact comparison evidence. They become selected only
   after two byte-identical rebuilds from the future exact protected `main`
   merge commit.
8. **Registry boundary:** the three stale stages remain unapproved and
   unrejected. This review performs and authorizes no npm, workflow dispatch,
   stage, approval, publication, alias, token, tag or GitHub Release mutation.
9. **Policy:** current-state documents, review index, roadmap, Deferred,
   release notes and PLAN-025 are reconciled. Formatting, 285-document/930-link
   documentation, workflow policy, 766-file public-tree policy, lint, 41
   release tests, 23 public tests and diff checks pass.

## Decision boundary

The correction payload is ready, but this evidence must first reach protected
`develop` through its own authorized commit, push and PR. That delivery changes
documentation only and requires a fresh exact-head observation; it does not
authorize promotion. Opening, merging or reconciling protected `main` remains
checkpoint 5's later crucial decision. If authorized then, the operation must
pin the freshly observed refs, preserve merge-commit topology, pass required
and post-merge CI, reconcile `main` back into `develop`, and repeat the clean
candidate selection gate. No npm action is coupled to either authorization.
