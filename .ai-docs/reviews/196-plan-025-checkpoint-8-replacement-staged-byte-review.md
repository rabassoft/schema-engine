# PLAN-025 checkpoint 8 replacement staged-byte review — Cycle 1

- **Date:** 2026-07-28
- **State:** Accepted replacement staged-byte gate after cycle 1 passed with
  zero findings
- **Scope:** Exact workflow result, replacement stage metadata, downloaded
  tarballs, selected-candidate identity, source and security
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 195`](./195-plan-025-checkpoint-8-replacement-pre-dispatch-review.md)
- **Outcome:** Checkpoint 8 is complete; all three replacement stages are exact
  and remain unapproved

## Exact workflow result

Authorized run `30377052519` completed successfully on exact protected
`main@028a98cfb1c96c821b6233c82f688a416e987656`:

- `verify-release` job `90335307910`: 5m04s, success;
- separately approved environment `npm-publish@18549660922`; and
- `stage` job `90336699234`: 1m58s, success.

No package stage was approved or rejected. No live version, alias, token, Git
tag or GitHub Release mutation occurred.

## Exact replacement staged state

| Role         | Stage ID                               | Version | Tag    | Access | Actor                               |
| ------------ | -------------------------------------- | ------- | ------ | ------ | ----------------------------------- |
| Core         | `86becb8b-9722-4a2d-aa5e-06678893c50a` | `0.4.1` | `next` | Public | GitHub Actions / trusted automation |
| Base Angular | `8e81ef31-188c-4f32-8140-a7ee6af237c7` | `0.4.1` | `next` | Public | GitHub Actions / trusted automation |
| Angular Aria | `86d03e2d-3630-459d-8805-122e972f34b5` | `0.2.1` | `next` | Public | GitHub Actions / trusted automation |

Each package has exactly one stage. Authenticated list/download metadata and
the workflow output report the same package, version, tag, access, actor and
SHA-1 values.

## Cycle 1 — zero findings

| Role         | Bytes  | SHA-1                                      | SHA-512                                                                                                                            |
| ------------ | ------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Core         | 217599 | `4a7c4af6dac6da7af5397034bd20a7c438e29d74` | `7a2f641fbf6bea6f217987bd67883fa5e7654fd60f32db51b1d73998cb8e09f7885cf9bb5a02e046138d9d83558038b173490229a51da89bb6ea11bddffb6592` |
| Base Angular | 127734 | `626ac56d30503ad6fefef010ffa3e3ac520c758d` | `016138d763fcee7e80eebb3a0c1f05e39d96efea94a07ada4a48f1c16e3550b27531ed8f70da3e3b51627f3a7fd89c98afcf6ec5ad0889d7ddde4e59024f961a` |
| Angular Aria | 29281  | `dc2c2d4580bb0d4d8a04572d4948bb2ec02e98a2` | `6f3607c4bae84a933763f16e8edff7c7e22347151b2fb5776d75e0bd385ad5a1f955b505ddd0a04800c82f527378277082bdabd9ff3f00d54fb26465a7288856` |

1. All three authenticated downloads are byte-identical through direct `cmp`
   to the candidates freshly generated from exact protected `main` in review 195.
2. Sizes, SHA-1 and SHA-512 values equal the accepted review 194/195 selected
   evidence. The corrected deterministic gzip contract now holds across
   macOS-selected and Linux-staged bytes.
3. Packed manifests, repository directories, peers, dependencies, exports,
   licenses, notices and package-local Corresponding Source pass.
4. Isolated frozen Corresponding Source rebuilds reproduce declarations,
   exports and behavior for core, base Angular and Angular Aria.
5. Tracked and packed secrets, personal data, private links and source
   ownership checks pass with zero findings.
6. Core/base `0.4.1` and pilot `0.2.1` remain absent from the live registry.
   `latest` and `next` remain core/base `0.4.0` and pilot `0.2.0`.
7. No stage is approved. Checkpoint 9 may present only core stage
   `86becb8b-9722-4a2d-aa5e-06678893c50a` for separate immediate 2FA approval.

Checkpoint 8 is complete with zero findings. This review does not authorize
core approval or any later package, alias or token mutation.
