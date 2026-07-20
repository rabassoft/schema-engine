# PLAN-021 final review — Cycles 1–4

- **Date:** 2026-07-19
- **Plan:** Completed
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 11 — final verified closure
- **Authority:** SPEC-008 v0.1.0, ADR-018 revision 4, ADR-024 revision 1 and
  reviews 114–131
- **Outcome:** Cycle 4 repeated all eighteen areas with zero findings

## Cycle 1 findings and corrections

### R132-F01 — Non-interactive frozen install invocation

The first operator invocation omitted the plan's `CI=true` environment and
pnpm correctly refused to replace `node_modules` without a TTY. The review was
restarted with the exact non-interactive environment; no dependency state was
accepted from the failed invocation.

### R132-F02 — Incomplete workspace-local offline store

The ignored workspace `.pnpm-store` did not contain every locked Angular
tarball. The frozen install was rerun against the already validated global
store at `<local-home>/Library/pnpm/store`, with `--offline --ignore-scripts`.
It reused 520 packages and downloaded zero. No lockfile or manifest changed.

### R132-F03 — Stale active release language

Root/package onboarding, the documentation index, release notes, ROADMAP and
the deferred register still described M19 as private, partial or pending final
closure after the registry line had been coordinated. They were reconciled to
the observed public Experimental state. `docs:check` now rejects those stale
phrases. No historical WORKLOG entry or substantive architecture was rewritten.

### R132-F04 — Root onboarding package inventory

The first documentation correction named the Angular Aria pilot descriptively
but omitted its exact npm package name, which the release inventory check
rejected. Root onboarding now names all three exact public packages and
versions. The complete review was restarted after the correction.

## Cycle 2 finding and correction

### R132-F05 — Incorrect pnpm version in drafted evidence

The drafted cycle 2 review recorded pnpm `10.13.1`, while `packageManager` and
the executed toolchain both report pnpm `10.28.2`. The evidence was corrected
and the complete review restarted; no repository dependency changed.

## Cycle 3 finding and correction

### R132-F06 — Stale core/base default aliases in release notes

The complete diff review found a release-note sentence that still said
core/base `latest` remained at `0.2.0`, even though checkpoints 9–10 had moved
both aliases to `0.3.0`. The paragraph now explicitly scopes that observation
to checkpoint 7 and records the later transitions. Remaining active
"candidate" terminology and one missed cycle reference were also reconciled.
`docs:check` rejects the stale release language, and the complete review was
restarted.

## Cycle 4 complete review

### 1. Authority, scope and exclusions

Pass. The diff remains within PLAN-021's release tooling, evidence and
documentation boundary. No runtime behavior, Public contract, version, peer,
export or deferred capability changed. Public GitHub, OIDC/provenance,
automation, Stable promotion, React, Vue and legacy Angular remain excluded.

### 2. Toolchain and frozen installation

Pass. Node `22.23.1`, pnpm `10.28.2` and the frozen lockfile are unchanged. A
non-interactive offline install from the validated global store completes with
zero downloads and no lifecycle scripts.

### 3. Exact public bytes and immutable regression

Pass. Public core/base `0.3.0` and pilot `0.1.0` remain byte-identical to the
selected clean `ce3ef3d` candidates, including integrity and npm signatures.
The frozen public core/base `0.2.0` artifact regression remains byte-identical.

### 4. Registry metadata, access and aliases

Pass. All three packages are public and maintained by
`ricardrabasso <ricard@rabassoft.com>`. Core/base resolve
`next/latest: 0.3.0`; pilot resolves `next/latest: 0.1.0`. Repository and
provenance metadata remain absent and no registry mutation occurred.

### 5. Manifests, distribution, source and security

Pass. Versions, peers, exports, dependencies, style side effects, AGPL license,
preferred source and frozen build harnesses match the accepted descriptor.
Artifact/source isolation and security scans find no private package, secret,
personal-data or private-link disclosure.

### 6. Complete workspace validation

Pass. Formatting, documentation links/state, lint, types, all 668 tests,
production builds, package checks and clean core/Angular consumer checks pass.
Angular's 980.47 kB/Ajv warnings and Standard's 860.39 kB advisory remain known
non-failing observations.

### 7. Reference applications

Pass. Eight snippets across two targets, all boundary/import checks, 38 shared
scenario tests, 25 Angular shell tests, 50 Standard shell tests, eight Angular
Chromium cases and six Standard Chromium cases pass.

### 8. Candidate lower and latest-compatible consumers

Pass. Native and pilot candidates pass strict offline installation, partial
compilation, types, unit behavior, production build and Chromium at Angular
`22.0.6` and `22.0.7`, with Aria/CDK `22.0.5`.

### 9. Exact live consumers

Pass. Lower/latest-compatible native and pilot clean consumers resolve the
three explicit published versions and pass the complete matrix.

### 10. `next` live consumers

Pass. Both tuples resolve core/base `0.3.0` and pilot `0.1.0` through `next`
and pass the complete matrix.

### 11. `latest` live consumers

Pass. Both tuples resolve the same inspected versions through `latest` and
pass the complete matrix. The alias remains Experimental routing only.

### 12. Unqualified live consumers

Pass. Both tuples resolve the same inspected default line without explicit
Schema Engine versions and pass the complete matrix.

### 13. Public/Internal migration inventory

Pass. Core exposes only the accepted raw/normalized presentation and text
contracts plus their widened unions and validation. Base Angular exposes only
the accepted nine-symbol container SPI and two widened observable behaviors.
The pilot exposes only its provider, stylesheet and six CSS properties.
Compiler/runtime helpers, operations, scopes, validator internals, Standard and
both reference applications remain Internal/private as specified.

### 14. SPEC-008 rows 1–6

Pass. Root-only presentation authoring, normalized compilation, strict manual
definition validation, deterministic diagnostics, immutable output and
framework-neutral core behavior retain complete evidence.

### 15. SPEC-008 rows 7–11

Pass. Text resolution plus Angular/Standard observable state, accessibility,
fallback/source order and deterministic host-error behavior retain complete
evidence.

### 16. SPEC-008 rows 12–17

Pass. Angular resolver/model/projection, native fallback, optional Angular Aria
composition and the six-property isolated theme contract retain complete
evidence at both accepted Angular endpoints.

### 17. SPEC-008 rows 18–22

Pass. Peer ranges, Angular partial compilation, package isolation, both private
reference shells and regression/conformance coverage retain complete evidence.

### 18. Documentation, history and final diff

Pass. Release notes, root/package onboarding, ROADMAP, STATUS, deferred
register, indexes, plan, review and prepend-only WORKLOG agree that M19 and
PLAN-021 are complete. No current text claims Stable, public repository,
provenance, automation, contribution support, SLA or an unimplemented target.
Documentation, release-target tests and diff checks pass.

## Outcome

Cycle 4 is the required complete zero-finding pass. PLAN-021 checkpoint 11,
PLAN-021 revision 0 and M19 are complete. No implementation task or external
action is active. Selecting the next Deferred capability or framework target
requires a new prioritization decision; completion grants no commit, push,
registry, repository/settings or later-release authority.
