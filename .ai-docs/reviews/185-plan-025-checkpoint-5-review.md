# PLAN-025 checkpoint 5 review — Cycles 1–4

- **Date:** 2026-07-27
- **State:** Accepted after cycle 4 under the standing zero-finding checkpoint
  rule
- **Scope:** Protected `main` promotion, reconciliation, selected clean rebuild
  and source-evidence verification
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** Cycle 4 passed all fifteen areas with zero unresolved findings;
  checkpoint 5 is complete and the exact protected-`main` candidates are
  selected publishable evidence without any npm claim

## Cycle 1 finding and correction

| ID       | Finding                                                                                                                                       | Correction                                                                                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R185-F01 | The checkpoint-4 closure merge left `STATUS.md` describing PR #14 as pending, so promoting that tree would have copied stale state to `main`. | Keep PR #15 draft, deliver the durable promotion state through protected PR #16, pass required/post-merge CI, update PR #15 to the corrected head and review again. |

The first attempted PR #14 merge also used an incorrectly expanded head SHA.
GitHub's exact-head guard rejected it before mutation; the head was reobserved
and the merge was retried with the actual full SHA. This was a successful
fail-closed guard observation, not an unresolved repository finding.

## Cycle 2 — complete operational pass

Cycle 2 verified:

1. checkpoint-4 closure PR #14 passed required CI, merged to protected
   `develop@3ec69f3` and passed post-merge CI;
2. correction PR #16 passed required CI, merged to exact
   `develop@e1b8349` and passed post-merge CI;
3. promotion PR #15 reran required CI at exact corrected head `e1b8349`;
4. `main@7f22dbd` was an ancestor of the promoted `develop` head;
5. PR #15 merged with the accepted merge-commit topology as exact
   `main@4bcb6ea`, with parents `7f22dbd` and `e1b8349`;
6. required and post-merge `main` CI passed;
7. reconciliation PR #17 started from exact `main@4bcb6ea`, passed required CI
   and merged with merge-commit topology as `develop@6d00ed0`;
8. reconciliation post-merge CI passed, `main` is an ancestor of `develop` and
   both refs have exact tree `45da57055ade2bfb34d6b5acafbe1fd0d3d16a94`;
9. the selected rebuild ran from a clean detached checkout of exact protected
   `main@4bcb6eabed76d8bc2fa877236d10b7831cbb6f00`;
10. two complete selected candidate generations are byte-identical;
11. all three selected tarballs are byte-identical to checkpoint 3 and
    checkpoint 4;
12. evidence records both `baseCommit` and `sourceCommit` as exact protected
    `main@4bcb6eabed76d8bc2fa877236d10b7831cbb6f00`;
13. packed metadata, inventories, source, licenses, repository paths and
    release-security boundaries remain exact;
14. all three Corresponding Source packages rebuild in isolated frozen
    environments, while the byte-identical checkpoint-4 lower/current native,
    Aria and M20/SPEC-009 consumer evidence remains applicable; and
15. formatting, 277-document/911-link documentation, workflow/public-tree
    policy, lint, 39 release tests and 23 public/readiness/workflow tests pass
    without npm read/write, trust, stage, approval, publication, alias, token,
    tag or GitHub Release action.

The selected SHA-512 values remain:

- core:
  `182aeb23087bb9b6d02c097aecda7acb239ed4d86b8b3c7854eb58f3232d510a0113b01f0790fc03ed4b8042d95ba59feb0d0b160702e088cf23d243f15e59bb`;
- base Angular:
  `51d95d98075b7ff63be1cafa5b39a42f9a93ce9a41a5147cd086330ceada6bf851b8d23725e87ec8077e4647b0c8874b70966dc3974d73ef9c7909aecc0b8bea`;
  and
- Angular Aria pilot:
  `dae08ca2d1c2716ed397ceabb8ba9c8af637e54710a4a47cf3f74d2461f69d3fb928aa6aa3c29effd2846f0832b6a1e34cd77dfe0783996d3177a1f80f82d937`.

## Closure finding and cycles 3–4

| ID       | Finding                                                                                     | Correction                                                                                  |
| -------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| R185-F02 | The first closure validation found Prettier drift in this review and the deferred register. | Format both documents and repeat the complete applicable review and verification from zero. |

Cycle 3 found that documenting the correction had reintroduced formatting
drift in this review. After formatting the final content, cycle 4 repeated all
fifteen areas, including the immutable remote evidence, selected-candidate
comparisons, current documentation consistency and the complete local
verification matrix. Formatting, 278-document/913-link documentation,
workflow/public-tree policy, lint, all 62 focused tests and the diff check pass;
cycle 4 therefore completed with zero findings.

## Completion boundary

Checkpoint 5 is complete. The exact candidates are selected publishable
evidence from protected `main`, but no registry state has been observed and no
npm action is authorized. Checkpoint 6 requires a separately authorized
read-only npm/GitHub preflight before any trust configuration or staging.
