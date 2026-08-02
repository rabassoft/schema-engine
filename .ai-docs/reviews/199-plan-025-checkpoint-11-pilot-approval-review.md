# PLAN-025 checkpoint 11 pilot approval review — Cycles 1–2

- **Date:** 2026-07-29
- **State:** Accepted after cycle 2 passed with zero findings
- **Scope:** Pilot stage approval, immutable registry bytes, packed contract,
  signature, provenance, source, channels and complete consumers
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 198`](./198-plan-025-checkpoint-10-base-approval-review.md)
- **Outcome:** Checkpoint 11 is complete; the full M23 line is public and
  verified under exact versions and `next`, while all `latest` aliases remain
  M21

## Exact approval result

After a zero-finding preflight, Ricard completed browser authentication for only
pilot stage `86d03e2d-3630-459d-8805-122e972f34b5`.

Fresh registry reconciliation proves the intended result:

- the pilot stage no longer exists;
- public `@rabassoft/schema-engine-angular-aria@0.2.1` has publication timestamp
  `2026-07-29T12:05:48.340Z`;
- pilot `next` resolves `0.2.1`, while `latest` remains `0.2.0`; and
- core/base `next` remain `0.4.1`, while both `latest` aliases remain `0.4.0`.

No alias, token, trust, Git tag or GitHub Release mutation occurred.

## Cycle 1 — consumer-tooling drift

Package bytes, metadata, signatures and provenance passed. The complete
consumer matrix exposed two verification-harness issues:

1. the initial command omitted the required explicit `--release=m23`; and
2. current Vitest/Vite resolution selected Rolldown
   `@napi-rs/wasm-runtime@1.2.0`, whose `@emnapi/*` peer requirement conflicts
   with the exact transitive versions declared by its binding under pnpm strict
   peer checking.

The invocation was corrected. The M20 clean-consumer generator now applies
exact package-local pnpm overrides for `@emnapi/core` and `@emnapi/runtime`
`2.0.0-alpha.3`. This affects only ephemeral verification tooling; public
packages, peers, runtime dependencies, declarations and behavior are
unchanged. A direct-dependency attempt was insufficient and was replaced by
the effective nested override before the complete review was repeated.

## Cycle 2 — zero findings

1. The live tarball is 29281 bytes with SHA-1
   `dc2c2d4580bb0d4d8a04572d4948bb2ec02e98a2` and SHA-512
   `6f3607c4bae84a933763f16e8edff7c7e22347151b2fb5776d75e0bd385ad5a1f955b505ddd0a04800c82f527378277082bdabd9ff3f00d54fb26465a7288856`.
   Direct `cmp` proves identity with the review 194–196 selected candidate.
2. Registry integrity is
   `sha512-bzYHxLroSpM3Y/Fujt/3x+IjRxUbL7V3bXXgvTha1aH5VbUF3dCgSADIL1JzeCdwgr2r2f8/ANVPsmRlpyiIVg==`.
   Public access, repository directory `packages/angular-aria`, source, license
   and manifest contract pass.
3. The packed base peer remains `^0.4.0`; Angular core remains
   `>=22.0.6 <23.0.0`, Aria/CDK remain `>=22.0.5 <23.0.0`, and `tslib ^2.8.1`
   is the only runtime dependency.
4. Root and `./styles.css` exports are unchanged. The exact tarball retains all
   15 reviewed files.
5. Registry metadata exposes a signature and SLSA attestation. A clean
   core/base/pilot install reports verified registry signatures and
   attestations.
6. Provenance names the exact pilot SHA-512, public repository, protected
   `main@028a98cfb1c96c821b6233c82f688a416e987656`, workflow
   `.github/workflows/npm-publish.yml`, GitHub-hosted builder and invocation
   `https://github.com/rabassoft/schema-engine/actions/runs/30377052519/attempts/1`.
7. Exact and `next` native/pilot consumers pass at frozen Angular endpoints
   22.0.6/22.0.7 with Aria/CDK 22.0.5, including partial compilation,
   typecheck, unit test, production build and Playwright behavior.
8. All `latest` aliases remain core/base `0.4.0` and pilot `0.2.0`.

Formatting, 292-document/951-link documentation, lint, 41 release-tooling
tests, 23 public-policy tests, 773-file public-tree policy, workflow policy and
diff checks all pass.

Checkpoint 11 is complete with zero findings. This review does not authorize
any alias, trust, token, Git or GitHub mutation.
