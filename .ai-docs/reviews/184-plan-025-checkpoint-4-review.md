# PLAN-025 checkpoint 4 review — Cycle 1

- **Date:** 2026-07-27
- **State:** Accepted after cycle 1 under the standing zero-finding checkpoint
  rule
- **Scope:** Protected `develop` delivery, post-merge CI, exact clean rebuild
  and checkpoint-3 byte comparison
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** Cycle 1 passed all twelve areas with zero unresolved findings;
  checkpoint 4 is complete and the clean `develop` candidates remain
  comparison-only evidence

## Cycle 1 — complete zero-finding pass

Cycle 1 verified:

1. the exact 42-file M23 scope excluded unrelated work and started from
   `origin/develop@490c67a`;
2. draft PR #13 targeted protected `develop` from
   `codex/m23-stage-only-publication` at exact head `1c9f14f`;
3. required PR CI `30223029548` passed before the separately authorized ready
   transition and squash merge;
4. PR #13 merged as exact `develop@39a0d60` and post-merge CI `30223266446`
   passed;
5. the rebuild ran from a clean detached checkout of that exact merge under
   Node `22.23.1`, npm `11.18.0` and pnpm `10.28.2`;
6. two complete clean candidate generations produced byte-identical evidence
   and tarballs;
7. all three tarballs are byte-identical to checkpoint 3 and retain the exact
   reviewed sizes, SHA-512 values and integrities;
8. evidence records both `baseCommit` and `sourceCommit` as exact
   `39a0d60abd34d399855995aa4375d60fb52c7873`;
9. inventories, metadata-only boundaries, exports, dependencies, source,
   licensing and public repository metadata remain exact;
10. all three Corresponding Source packages rebuild in isolated frozen
    environments;
11. lower/current native and Angular Aria consumers pass partial compilation,
    type checks, unit tests, production builds and Chromium behavior, including
    the M20/SPEC-009 lanes; and
12. formatting, documentation, workflow/public-tree policy, packed-source and
    release-security checks pass without any `main`, npm read/write, real
    stage, tag, token, approval or publication action.

The clean candidate SHA-512 values remain:

- core:
  `182aeb23087bb9b6d02c097aecda7acb239ed4d86b8b3c7854eb58f3232d510a0113b01f0790fc03ed4b8042d95ba59feb0d0b160702e088cf23d243f15e59bb`;
- base Angular:
  `51d95d98075b7ff63be1cafa5b39a42f9a93ce9a41a5147cd086330ceada6bf851b8d23725e87ec8077e4647b0c8874b70966dc3974d73ef9c7909aecc0b8bea`;
  and
- Angular Aria pilot:
  `dae08ca2d1c2716ed397ceabb8ba9c8af637e54710a4a47cf3f74d2461f69d3fb928aa6aa3c29effd2846f0832b6a1e34cd77dfe0783996d3177a1f80f82d937`.

## Completion boundary

Checkpoint 4 is complete. These exact `develop` candidates are not selected
publishable evidence: PLAN-025 requires a separately authorized protected
`main` promotion/reconciliation and a further exact clean rebuild. No npm
preflight, trusted-publisher action, stage, approval, publication, alias move,
Git tag or GitHub Release is authorized by this review.
