# R189-F01 protected-main reselection review — Cycles 1–3

- **Date:** 2026-07-28
- **State:** Accepted protected-`main` reselection after cycle 3 passed with
  zero findings
- **Scope:** Protected promotion/reconciliation, exact refs, CI, deterministic
  candidate generations, package/source/consumer/security evidence and policy
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 193`](./193-r189-f01-post-delivery-promotion-gate.md)
- **Outcome:** Corrected candidates are selected publishable evidence from
  exact protected `main`; rejection of the three obsolete stages and every
  later npm mutation remain separately gated

## Cycle 1 finding and correction

| ID       | Finding                                                                                                                                             | Correction                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R194-F01 | The isolated consumer review could not launch Chromium because the detached clean source intentionally omitted the ignored `.playwright-browsers/`. | Reuse the already installed local browser through a temporary untracked link, remove it after execution, and restart the complete applicable review cycle. |

No candidate, tracked source or registry state changed because of this
environment-only correction.

## Cycle 2 finding and correction

| ID       | Finding                                                                                                                        | Correction                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| R194-F02 | ROADMAP's current M23 npm-authentication prerequisite matched a broad guard for an obsolete paused M21 “Next action” sentence. | Rename the current roadmap label to “Immediate gate”, preserving its meaning, and restart the complete applicable documentation review. |

## Cycle 3 — zero findings

1. **Protected promotion:** PR #22 promoted exact
   `develop@ed1cd2d0475500dfc0db59315fefb488451bbd76` through merge commit
   `main@028a98cfb1c96c821b6233c82f688a416e987656`.
2. **Promotion CI:** required run `30317202034`, job `90145210376`, passed in
   5m10s on the exact PR head. Post-merge run `30317547283`, job
   `90146295129`, passed in 5m01s on the exact protected `main` source.
3. **Protected reconciliation:** PR #23 reconciled exact `main@028a98c` through
   merge commit `develop@0933924c59b6ffdd118405cf3b37174a65737e46`.
   Required run `30318254173`, job `90148474424`, passed in 4m56s; post-merge
   run `30318718752`, job `90149886730`, passed in 4m57s.
4. **Topology:** exact `main@028a98c` is the merge base and ancestor of
   `develop@0933924`; `develop` is one ancestry-only merge commit ahead and the
   protected trees are identical.
5. **Clean source:** an isolated detached clone uses exact protected
   `main@028a98c`. Frozen offline installation succeeds under Node `22.23.1`,
   npm `11.18.0` and pnpm `10.28.2`; the source remains clean after the review.
6. **Determinism and selection:** two complete independent M23 generations are
   byte-identical, record `sourceCommit: 028a98c`, use `mtime=0` and gzip OS
   byte `3`, and reproduce review 191's corrected values:
   - core: `217599` bytes,
     SHA-512 `7a2f641fbf6bea6f217987bd67883fa5e7654fd60f32db51b1d73998cb8e09f7885cf9bb5a02e046138d9d83558038b173490229a51da89bb6ea11bddffb6592`;
   - base Angular: `127734` bytes,
     SHA-512 `016138d763fcee7e80eebb3a0c1f05e39d96efea94a07ada4a48f1c16e3550b27531ed8f70da3e3b51627f3a7fd89c98afcf6ec5ad0889d7ddde4e59024f961a`;
   - Angular Aria: `29281` bytes,
     SHA-512 `6f3607c4bae84a933763f16e8edff7c7e22347151b2fb5776d75e0bd385ad5a1f955b505ddd0a04800c82f527378277082bdabd9ff3f00d54fb26465a7288856`.
7. **Candidates:** exact manifests, inventories, peers, declarations, exports,
   runtime behavior and package isolation pass. All six basename-neutral,
   credential-free `npm stage publish --dry-run --access public --tag next`
   simulations pass without creating a stage.
8. **Source and consumers:** isolated frozen Corresponding Source rebuilds pass
   for all three packages. Lower Angular `22.0.6` and current Angular `22.0.7`
   native/pilot consumers pass partial compilation, typecheck, unit, production
   build and browser execution from the selected tarballs.
9. **Complete verification:** formatting, 287-document/936-link documentation,
   workflow policy, 768-file public-tree policy, lint, build/typecheck, all 689
   workspace tests, 41 release tests, 23 public/readiness/workflow tests,
   package/source/security/rights and diff checks pass.
10. **Boundary:** no stage was approved or rejected. No workflow dispatch,
    publication, alias, token, Git tag, GitHub Release or other npm mutation
    occurred or is authorized by this review.

The corrected deterministic candidates are now selected publishable evidence
from exact protected `main@028a98c`. Review 189's three existing stages remain
blocked because their compressed bytes differ; rejecting them is the next
separate immediate external decision. A post-review authenticated
`npm stage list` observation returned `E401` because the local npm session has
expired; it made no mutation and requires a fresh `npm login` before any stage
reobservation or rejection.
