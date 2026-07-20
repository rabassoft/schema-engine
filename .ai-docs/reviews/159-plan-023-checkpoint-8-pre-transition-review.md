# PLAN-023 checkpoint 8 pilot-latest pre-transition review — Cycle 1

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 8 — pilot `latest` transition
- **Gate reviewed:** read-only pre-transition state only
- **Authority:** ADR-018 revision 5, PLAN-023 revision 0 and reviews 146–158
- **Outcome:** Cycle 1 passed all nine areas with zero findings; the dist-tag
  mutation remains subject to its separate immediate approval

## Cycle 1 — complete zero-finding pass

### 1. Registry, identity and authority

Pass. npm `10.9.8` uses exactly `https://registry.npmjs.org/`;
`npm whoami` returns `ricardrabasso`, the verified email is
`ricard@rabassoft.com`, 2FA remains `auth-and-writes` and that account remains
Rabassoft owner with `read-write` authority over all three packages. No
credential was recorded.

### 2. Exact M21 bytes, integrity and signatures

Pass. Fresh unauthenticated registry downloads of core/base Angular `0.4.0`
and pilot `0.2.0` are byte-identical to the three selected clean candidates.
Every exact integrity matches evidence, every artifact has an npm registry
signature and none has an attestation or repository metadata.

### 3. Public manifests and distribution boundary

Pass. All three packages remain public, maintained only by
`ricardrabasso <ricard@rabassoft.com>` and licensed `AGPL-3.0-only`. Root
exports, pilot `./styles.css` export/side effect, `tslib`, exact Schema Engine
peers, Angular/Aria/CDK ranges, public `next`, provenance-disabled manifests
and Corresponding Source boundaries remain unchanged.

### 4. Exact immutable M19 defaults

Pass. Fresh core/base `0.3.0` and pilot `0.1.0` registry downloads remain
byte-identical to the immutable M19 evidence and retain registry signatures.
No historical package or version changed.

### 5. Alias and settings baseline

Pass. Core/base remain `next: 0.4.0`, `latest: 0.3.0`; pilot remains
`next: 0.2.0`, `latest: 0.1.0`. Package access is public and organization,
maintainer, 2FA and access settings show no drift.

### 6. Exact lower/latest-compatible consumers

Pass. Serialized clean native and pilot consumers resolved all three exact M21
versions and passed Angular partial compilation, strict typecheck, unit test,
production build and recursive-local Chromium smoke at Angular `22.0.6` and
`22.0.7`, with Angular Aria/CDK `22.0.5` exactly aligned. One transient
registry `ENOTFOUND` retried successfully without changing resolution.

### 7. `next` lower/latest-compatible consumers

Pass. Two further serialized clean native and pilot runs resolved all three
`next` aliases to inspected M21 bytes and repeated the complete matrix at
Angular `22.0.6` and `22.0.7` with zero findings.

### 8. Planned mixed window and recovery boundary

Pass. The only next mutation is the exact pilot-first command accepted by
ADR-018/PLAN-023. After it, pilot `latest: 0.2.0` with core/base
`latest: 0.3.0` is an explicit mixed window and supplies no coordinated
`latest` or unqualified evidence. Forward or restoration work remains
separately gated and immutable bytes are never overwritten or unpublished.

### 9. External boundary and documentation

Pass. The preflight performed only authorized registry/account reads and
temporary consumer installs. It did not move a dist-tag, alter access,
maintainers or 2FA, create a Git tag/release, change repository visibility or
enable provenance. Formatting, documentation/link validation, lint, all 23
release-tooling tests and the complete diff review pass.

## Outcome

The checkpoint 8 read-only preflight is complete. Stop for immediate approval
of only:

```text
npm dist-tag add @rabassoft/schema-engine-angular-aria@0.2.0 latest
```

That approval authorizes neither base/core alias movement nor settings, GitHub,
repository-visibility or provenance action.
