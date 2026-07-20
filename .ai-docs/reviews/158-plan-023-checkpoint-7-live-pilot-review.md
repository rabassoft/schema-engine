# PLAN-023 checkpoint 7 live Angular Aria pilot review — Cycles 1–2

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 7 — Angular Aria pilot `0.2.0` publication under `next`
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5 and reviews 146–157
- **Outcome:** Cycle 2 passed all ten areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                          | Correction                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| R158-F01 | Documentation checks still rejected truthful live-M21 wording and required pre-publication pilot fragments.      | Updated stale-claim and required-fragment rules to enforce the observed all-three-`next`, all-M19-`latest` state.          |
| R158-F02 | The checkpoint-7 ROADMAP stale-state expression crossed section boundaries and incorrectly matched checkpoint 8. | Narrowed the expression to require the checkpoint number inside the preflight phrase it validates.                         |
| R158-F03 | Pilot onboarding no longer named the exact M19 base package/version paired with its retained `latest` fallback.  | Added the explicit `0.1.0` pilot plus base Angular `0.3.0` default-fallback tuple without changing the M21 recommendation. |

## Cycle 2 — complete zero-finding pass

### 1. Exact package observation

Pass. The public registry exposes
`@rabassoft/schema-engine-angular-aria@0.2.0` exactly. Core and base Angular
remain available through `0.4.0`.

### 2. Byte identity and integrity

Pass. The unauthenticated public pilot tarball is byte-identical to the selected
candidate: 28,618 bytes and SHA-512
`7456894807d472d174a1168e749a8fc2aadaea4e0b0cbd4d9cf4b1d36a8ed9f0be38502868d8f20b2deb08d430a21fa2c51b0eab8c67b91b096212b0b932995e`.
Registry integrity is
`sha512-dFaJSAfUctF0oRaOdJqPwqra6k4LDL1NnPSx02qO2fC+OFAoaNjyCy3rCNQwoh+ixRsOq4xnuRsJYhKwuTKZXg==`.
Fresh public downloads of core/base are also byte-identical to their selected
candidates.

### 3. Registry signature and provenance

Pass. npm supplies a registry signature for the exact pilot artifact. No
attestation, repository metadata or npm provenance is present on the pilot or
its live prerequisites.

### 4. Access, ownership and license

Pass. All three packages remain public, maintained only by
`ricardrabasso <ricard@rabassoft.com>` and licensed `AGPL-3.0-only`.

### 5. Exact manifest, peers, exports and source boundary

Pass. The registry manifest matches the reviewed ESM contract, public `next`
and provenance-disabled configuration. It exposes only the root and
`./styles.css`, retains `styles.css` side effects, requires base Angular
`^0.4.0`, Angular core `>=22.0.6 <23.0.0`, Angular Aria/CDK
`>=22.0.5 <23.0.0`, and keeps `tslib ^2.8.1` as its only runtime dependency.
Preferred TypeScript source, the frozen build harness, author/contact,
license/notices and styles are present.

### 6. Alias transition

Pass. Only pilot `next` moved, from `0.1.0` to `0.2.0`. Core/base remain
`next: 0.4.0`; core/base `latest` remain `0.3.0`; pilot `latest` remains
`0.1.0`. Access, maintainers and settings are unchanged.

### 7. Exact lower/latest-compatible consumers

Pass. Serialized clean native and pilot consumers resolved all three exact M21
versions and passed Angular partial compilation, strict typecheck, unit test,
production build and recursive-local Chromium smoke at Angular `22.0.6` and
`22.0.7`, with Angular Aria/CDK `22.0.5` exactly aligned.

### 8. `next` lower/latest-compatible consumers

Pass. Two further serialized clean native and pilot runs resolved all three
`next` aliases to the inspected M21 artifacts and repeated the complete matrix
at Angular `22.0.6` and `22.0.7` with zero findings.

### 9. Partial-state safety

Pass. The three-package M21 line is available exactly and under `next` only.
Every `latest` and unqualified install remains on the coordinated M19 line.
Documentation does not claim a completed M21 default transition, Stable API,
public repository or provenance.

### 10. External boundary and documentation

Pass. Post-publication work performed only public reads, temporary consumer
installs and current-state documentation. No `latest` move, access, maintainer,
2FA, Git, GitHub, repository or provenance mutation followed the user-run
publish. Formatting, documentation/link validation, lint, all 23
release-tooling tests and the complete diff review pass.

## Outcome

PLAN-023 checkpoint 7 is complete. Core/base Angular `0.4.0` and Angular Aria
pilot `0.2.0` form a verified immutable Public Experimental line under `next`;
all three `latest` aliases remain on M19. Checkpoint 8 requires separate
authorization before its read-only pilot-`latest` preflight, and the dist-tag
mutation retains a later independent immediate gate.
