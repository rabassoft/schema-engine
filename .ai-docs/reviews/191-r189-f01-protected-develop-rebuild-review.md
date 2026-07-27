# R189-F01 protected-develop rebuild review — Cycles 1–2

- **Date:** 2026-07-28
- **State:** Accepted clean protected-`develop` rebuild after cycle 2 passed
  with zero findings
- **Scope:** PR delivery, post-merge CI, exact-source candidate generations,
  dry-runs, Corresponding Source, security and local policy
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 190`](./190-r189-f01-deterministic-gzip-correction-review.md)
- **Outcome:** Corrected comparison candidates are exact from protected
  `develop`; promotion to `main` and every npm mutation remain gated

## Cycle 1

The implementation, protected-source, candidate, source, rights and policy
checks passed. The state review found two documentation defects: STATUS still
said the correction was not delivered despite PR #18 being merged, and its
latest-completed list exceeded the required five-item compact boundary. Both
were corrected and the complete review was restarted.

## Cycle 2 — zero findings

1. **Protected delivery:** accepted PR #18 merged exact head `8c9dcc5` through
   merge commit `5e60796ac694f1d610e449683284707e1774571b` on protected
   `develop`.
2. **CI:** required PR CI passed on the exact head. Post-merge run
   `30311703680`, job `90128528176`, passed every workflow step in 4m56s.
3. **Clean source:** an isolated detached worktree uses exact
   `develop@5e60796`; frozen offline installation passes and the worktree
   remains clean.
4. **Build:** the complete production build passes under Node `22.23.1`, npm
   `11.18.0` and pnpm `10.28.2`. Existing Angular/Ajv and Standard bundle
   advisories are unchanged.
5. **Determinism:** two complete independent M23 candidate generations are
   byte-identical for all three packages, with `mtime=0` and gzip OS byte `3`.
6. **Exact comparison:** corrected protected-`develop` bytes equal review 190's
   normalized protected-TAR comparison:
   - core: `217599` bytes,
     SHA-512 `7a2f641fbf6bea6f217987bd67883fa5e7654fd60f32db51b1d73998cb8e09f7885cf9bb5a02e046138d9d83558038b173490229a51da89bb6ea11bddffb6592`;
   - base Angular: `127734` bytes,
     SHA-512 `016138d763fcee7e80eebb3a0c1f05e39d96efea94a07ada4a48f1c16e3550b27531ed8f70da3e3b51627f3a7fd89c98afcf6ec5ad0889d7ddde4e59024f961a`;
   - Angular Aria: `29281` bytes,
     SHA-512 `6f3607c4bae84a933763f16e8edff7c7e22347151b2fb5776d75e0bd385ad5a1f955b505ddd0a04800c82f527378277082bdabd9ff3f00d54fb26465a7288856`.
7. **Candidate evidence:** ignored `.release/0.4.1/candidates.json` records
   `baseCommit` and `sourceCommit` as exact `5e60796`; all three basename-neutral
   `npm stage publish --dry-run --access public --tag next` commands pass.
8. **Source and rights:** isolated frozen Corresponding Source rebuilds,
   declarations, exports and behavior pass for core, base Angular and Angular
   Aria. Packed/tracked secrets, personal data, private links, source ownership
   and development-only `fflate` isolation pass.
9. **Policy:** formatting, documentation, lint, 41 release-tooling tests, 23
   public/readiness/workflow tests, public-tree, workflow and diff checks pass.
10. **Boundary:** no push, protected-`main` promotion, stage rejection,
    workflow dispatch, stage approval, publication, alias, token or settings
    mutation occurred.

The protected-`develop` comparison gate is Accepted. These are not selected
publishable candidates until the correction reaches exact protected `main` and
two clean generations there reproduce the same bytes.
