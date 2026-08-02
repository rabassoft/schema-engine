# PLAN-025 checkpoint 9 core approval review — Cycles 1–2

- **Date:** 2026-07-28
- **State:** Accepted after cycle 2 passed with zero findings
- **Scope:** Core stage approval, immutable registry bytes, signature,
  provenance, source, channels and consumers
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 196`](./196-plan-025-checkpoint-8-replacement-staged-byte-review.md)
- **Outcome:** Checkpoint 9 is complete; core `0.4.1` is public and verified,
  while base and pilot remain separately gated stages

## Exact approval result

Ricard authorized approval of only core stage
`86becb8b-9722-4a2d-aa5e-06678893c50a`. The CLI ended with `E404` after the
stage had been consumed. Fresh registry reconciliation removes that apparent
ambiguity:

- the core stage list is empty and the exact stage no longer exists;
- public `@rabassoft/schema-engine@0.4.1` has publication timestamp
  `2026-07-28T16:47:30.837Z`;
- `next` resolves `0.4.1`, while `latest` remains `0.4.0`; and
- base stage `8e81ef31-188c-4f32-8140-a7ee6af237c7` and pilot stage
  `86d03e2d-3630-459d-8805-122e972f34b5` remain unchanged.

No base/pilot approval, alias transition, token, trust, Git tag or GitHub
Release mutation occurred.

## Cycle 1 — stale documentation policy

The package, registry, provenance, source, channel and consumer evidence passed.
The complete repository verification found one documentation-policy issue:
`verify-documentation.mjs` still required the pre-publication M23 onboarding
phrases and prohibited observed provenance. The policy was updated to require
the truthful partial state—live core, staged base/pilot and unchanged
defaults—and to reject premature coordinated/base/pilot publication claims.

## Cycle 2 — zero findings

1. The live tarball is 217599 bytes with SHA-1
   `4a7c4af6dac6da7af5397034bd20a7c438e29d74` and SHA-512
   `7a2f641fbf6bea6f217987bd67883fa5e7654fd60f32db51b1d73998cb8e09f7885cf9bb5a02e046138d9d83558038b173490229a51da89bb6ea11bddffb6592`.
   Direct `cmp` proves identity with the review 194–196 selected candidate.
2. Registry integrity is
   `sha512-ei9kH79r6m8heYe9Z4g/pedlT9YPMttRsdc5mMuOCfeIXPm7WgLgRhONnYNVgDixc0kCKaUdqJu26hG93/tlkg==`.
   Public access, exact repository directory `packages/core`, license,
   package-local source and manifest contract all pass.
3. `npm audit signatures` verifies one registry signature and one attestation.
4. The public SLSA provenance subject names the exact package and SHA-512. Its
   source is `https://github.com/rabassoft/schema-engine`, protected
   `main@028a98cfb1c96c821b6233c82f688a416e987656`, workflow
   `.github/workflows/npm-publish.yml`, GitHub-hosted builder and invocation
   `https://github.com/rabassoft/schema-engine/actions/runs/30377052519/attempts/1`.
5. Clean consumers pass with both exact `0.4.1` and live `next`, using frozen
   Angular 22.0.6/22.0.7 endpoints and the selected base candidate where the
   adapter is required.
6. Core `latest` remains `0.4.0`. Base/pilot live versions and aliases remain
   unchanged; their replacement stage IDs remain observable.

Formatting, 290-document/945-link documentation, lint, 41 release-tooling
tests, 23 public-policy tests, 771-file public-tree policy, workflow policy and
diff checks all pass.

Checkpoint 9 is complete with zero findings. This review does not authorize
base approval or any pilot, alias, trust, token, Git or GitHub mutation.
