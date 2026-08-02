# PLAN-025 checkpoint 8 replacement pre-dispatch review — Cycles 1–2

- **Date:** 2026-07-28
- **State:** Accepted replacement pre-dispatch gate after cycle 2 passed with
  zero findings
- **Scope:** Read-only protected source, workflow, environment, trust,
  candidate and registry verification after rejecting the obsolete stages
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 194`](./194-r189-f01-protected-main-reselection-review.md)
- **Outcome:** Exact replacement dispatch inputs are ready; no workflow was
  dispatched

## Exact proposed dispatch

```text
workflow: npm-publish.yml
ref: main
release: m23
source_commit: 028a98cfb1c96c821b6233c82f688a416e987656
```

Dispatch requires separate immediate authorization. The later `npm-publish`
environment approval remains another separate external action.

## Cycle 1 finding and correction

| ID       | Finding                                                    | Correction                                                                 |
| -------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| R195-F01 | The new review document did not satisfy Prettier's format. | Format the document and restart the complete applicable pre-dispatch pass. |

## Cycle 2 — zero findings

1. **Protected source:** remote
   `main@028a98cfb1c96c821b6233c82f688a416e987656` remains exact and is an
   ancestor of `develop@4a244b93db7ebf0942117475aef603de621f8e4c`. The
   repository is public, `main` is the default branch and active ruleset
   `19534784` protects both long-lived branches without bypass.
2. **Workflow:** `.github/workflows/npm-publish.yml` is active and manual on
   `main`. Remote blob `428704200c80812b971aebd6caf706aff79e753c` equals the
   exact protected-main blob. The workflow is SHA-pinned, GitHub-hosted,
   token-free and stage-only; only its environment-gated stage job receives
   `id-token: write`.
3. **Tools:** official npm guidance still requires Node `22.14.0` or newer and
   npm `11.15.0` or newer for staged publishing. The exact workflow tools,
   Node `22.23.1`, npm `11.18.0` and pnpm `10.28.2`, remain supported and
   match the accepted descriptor.
4. **Environment:** exact environment `npm-publish` requires reviewer
   `rabassoft`; its only custom deployment branch policy is `main`.
5. **Trust:** authenticated 2FA observations show exactly one GitHub relation
   per package:
   - core `45ec5a51-534a-44f9-8b12-ab8d82007e06`;
   - base Angular `8bf497aa-0935-40a3-986b-3d630c9ba16f`; and
   - Angular Aria `80bd3d20-4be8-4078-b22c-e6270d176a95`.

   All three use `rabassoft/schema-engine`, `npm-publish.yml`,
   `npm-publish` and only `createStagedPackage`; none permits direct
   publication.

6. **Candidates:** a fresh detached clone of exact protected `main` completes
   frozen offline installation, build, M23 readiness and basename-neutral
   credential-free dry runs. Its generated candidates reproduce review 194:
   - core: `217599` bytes,
     SHA-512 `7a2f641fbf6bea6f217987bd67883fa5e7654fd60f32db51b1d73998cb8e09f7885cf9bb5a02e046138d9d83558038b173490229a51da89bb6ea11bddffb6592`;
   - base Angular: `127734` bytes,
     SHA-512 `016138d763fcee7e80eebb3a0c1f05e39d96efea94a07ada4a48f1c16e3550b27531ed8f70da3e3b51627f3a7fd89c98afcf6ec5ad0889d7ddde4e59024f961a`;
   - Angular Aria: `29281` bytes,
     SHA-512 `6f3607c4bae84a933763f16e8edff7c7e22347151b2fb5776d75e0bd385ad5a1f955b505ddd0a04800c82f527378277082bdabd9ff3f00d54fb26465a7288856`.
7. **Registry:** all three authenticated stage lists are empty. Core/base
   `0.4.1` and pilot `0.2.1` remain absent; `latest` and `next` remain
   core/base `0.4.0` and pilot `0.2.0`.
8. **Authority:** all three packages retain only
   `ricardrabasso: read-write`.
9. **Local policy:** exact-main formatting, 286-document/933-link
   documentation, lint, build, 41 release-tooling tests, 23
   public/readiness/workflow tests, 767-file public-tree policy, workflow
   policy, readiness, candidate hashes and clean-tree checks pass.
10. **Boundary:** no workflow dispatch, environment approval, stage, package
    approval, publication, alias or token mutation occurred.

The replacement checkpoint-8 pre-dispatch gate is Accepted after cycle 2
passed with zero findings. This does not complete checkpoint 8 and does not
authorize the dispatch.
