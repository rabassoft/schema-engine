# PLAN-025 checkpoint 10 base approval review — Cycle 1

- **Date:** 2026-07-29
- **State:** Accepted after cycle 1 passed with zero findings
- **Scope:** Base Angular stage approval, immutable registry bytes, packed
  contract, signature, provenance, source, channels and consumers
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 197`](./197-plan-025-checkpoint-9-core-approval-review.md)
- **Outcome:** Checkpoint 10 is complete; core/base `0.4.1` are public and
  verified, while the pilot remains a separately gated stage

## Exact approval result

The first authorized attempt on 2026-07-28 stopped before mutation because npm
required per-operation 2FA. On 2026-07-29, the owner restored the expired npm
session and completed browser authentication for only base stage
`8e81ef31-188c-4f32-8140-a7ee6af237c7`.

Fresh registry reconciliation proves the intended result:

- the base stage no longer exists;
- public `@rabassoft/schema-engine-angular@0.4.1` has publication timestamp
  `2026-07-29T11:43:27.752Z`;
- base `next` resolves `0.4.1`, while `latest` remains `0.4.0`; and
- pilot stage `86d03e2d-3630-459d-8805-122e972f34b5` remains unchanged.

No pilot approval, alias transition, token, trust, Git tag or GitHub Release
mutation occurred.

## Cycle 1 — zero findings

1. The live tarball is 127734 bytes with SHA-1
   `626ac56d30503ad6fefef010ffa3e3ac520c758d` and SHA-512
   `016138d763fcee7e80eebb3a0c1f05e39d96efea94a07ada4a48f1c16e3550b27531ed8f70da3e3b51627f3a7fd89c98afcf6ec5ad0889d7ddde4e59024f961a`.
   Direct `cmp` proves identity with the review 194–196 selected candidate.
2. Registry integrity is
   `sha512-AWE412P87n6A7rs6DB8F452W7+qUoHraSkjxwW41ULJ1Me2PcNo+O1Fifzp/2JyYr89uxa0Iidfd3k5ZAk+WGg==`.
   Public access, exact repository directory `packages/angular`, license,
   package-local source and manifest contract all pass.
3. The packed peer remains core `^0.4.0`; Angular core/forms remain
   `>=22.0.6 <23.0.0`, and `tslib ^2.8.1` is the only runtime dependency.
4. Registry metadata exposes a signature and SLSA attestation. A clean exact
   core/base install reports verified registry signatures and attestations.
5. The public SLSA provenance subject names the exact base package and SHA-512.
   Its source is `https://github.com/rabassoft/schema-engine`, protected
   `main@028a98cfb1c96c821b6233c82f688a416e987656`, workflow
   `.github/workflows/npm-publish.yml`, GitHub-hosted builder and invocation
   `https://github.com/rabassoft/schema-engine/actions/runs/30377052519/attempts/1`.
6. Clean exact and `next` consumers pass with live core/base `0.4.1` at frozen
   Angular endpoints 22.0.6 and 22.0.7.
7. Core/base `latest` remain `0.4.0`. Pilot `next`/`latest` remain `0.2.0`, and
   its exact replacement stage remains observable.

Formatting, 291-document/948-link documentation, lint, 41 release-tooling
tests, 23 public-policy tests, 772-file public-tree policy, workflow policy and
diff checks all pass.

Checkpoint 10 is complete with zero findings. This review does not authorize
pilot approval or any alias, trust, token, Git or GitHub mutation.
