# PLAN-021 checkpoint 2 complete review — Cycles 1–3

- **Date:** 2026-07-19
- **Plan:** Approved
  [`PLAN-021 revision 0`](../plans/021-coordinated-experimental-0-3-release.md)
- **Checkpoint:** 2 — M19 release documentation and candidate contract
- **Authority:** SPEC-008 v0.1.0, ADR-018 revision 4, reviews 114–117 and
  completed PLAN-020/M18
- **Outcome:** Cycle 3 passed all ten areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                          | Correction                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| R118-F01 | Core/base onboarding still described `latest` as mandatory or the private candidate as installable through current `next`.       | Reworded both READMEs around observed registry routing, exact candidates and the separately gated publication state.                     |
| R118-F02 | Angular onboarding retained a pending latest-compatible endpoint although M18 had verified Angular `22.0.7`.                     | Recorded the exact `22.0.6`/`22.0.7` endpoints and preserved the accepted peer range.                                                    |
| R118-F03 | Pilot onboarding and source guidance still called the package a private pilot governed by completed PLAN-020 gates.              | Identified it as the reviewed private source candidate and made PLAN-021 the sole release gate.                                          |
| R118-F04 | Root documentation did not expose the complete unequal-version three-package M19 candidate line.                                 | Added the exact core/base `0.3.0` plus pilot `0.1.0` private candidate state without claiming publication or candidate selection.        |
| R118-F05 | Documentation validation covered only the historical two publishable manifests and could not enforce the independent pilot line. | Made it consume the exact M19 descriptor and validate all three names, versions, manifests, onboarding surfaces and stale-state phrases. |
| R118-F06 | The first release-note integration example used only the headless base provider and therefore omitted native field renderers.    | Switched the complete native-form example to `provideSchemaEngineAngularNative()` before the optional Angular Aria container provider.   |

## Cycle 2 finding and correction

| ID       | Finding                                                                                                                                                      | Correction                                                                                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R118-F07 | Angular onboarding could satisfy the exact-version check through its core peer text, and release-note checks did not close every required stale-state class. | Added the exact adapter manifest version and checks for current peers, Stable/default conflation, predicted pilot `latest`, public repository/provenance and stale live state. |

## 1. Authority and release-state boundary

Pass. Documentation describes only completed M18/SPEC-008 behavior and the
reviewed private M19 source candidates. It does not claim selected tarballs,
source commit, registry availability, publication, Stable support or an active
external action.

## 2. Exact package and SemVer matrix

Pass. Release notes and onboarding consistently identify core/base Angular
`0.3.0` and pilot `0.1.0` as independent lines, with core `^0.3.0` and base
Angular `^0.3.0` packed peers. No lockstep policy is introduced.

## 3. Public migration inventory

Pass. All accepted SPEC-008 Public core additions, nine base Angular additions,
pilot provider/style entry points and six exact CSS properties are listed.
Internal hosts, tokens and selectors remain non-API.

## 4. Compatibility and composition

Pass. Angular `22.0.6`/`22.0.7`, Aria/CDK `22.0.5`, aligned Angular patches and
the exact peer ranges are consistent. The native provider precedes the optional
pilot provider, and the stylesheet remains an explicit opt-in.

## 5. Candidate, partial-live and completed-live states

Pass. The private candidate is distinguished from existing published `0.2.0`,
future dependency-first `next`, the unverified partial windows and later
dependent-first established aliases. The first pilot `latest` result is not
predicted and aliases never imply Stable.

## 6. Manifests, artifacts and source boundary

Pass. Descriptor-driven checks verify all three exact manifests, exports,
dependencies, peers, `sideEffects`, package files, AGPL notices, preferred
TypeScript and frozen source-build harnesses. Isolated offline rebuilds complete
with zero downloads.

## 7. Distribution and security boundary

Pass. Core/base contain no pilot or Aria/CDK material; the pilot does not bundle
or relicense its UI peers. No package advertises the private repository,
provenance, trusted publishing or unsupported commercial/support terms.

## 8. Stale-document enforcement

Pass. Documentation checks now reject incomplete two-package M19 onboarding,
wrong candidate versions, obsolete mandatory/latest or PLAN-020 claims,
premature publication/source-commit state, provenance and missing candidate
surfaces. The historical `0.2.0` note remains truthful and immutable.

## 9. Verification and diff quality

Pass. Documentation, formatting, lint, release-tool tests, frozen `0.2.0`
artifacts, M19 artifacts, pilot isolation, source rebuilds, security and diff
checks pass. No candidate bytes were selected and no Git, registry,
authentication or npm action occurred.

## 10. Deferred and next-checkpoint boundary

Pass. Standard packaging, other UI kits/frameworks, Angular 23/legacy Angular,
Stable, repository publication, provenance, D-043 and all functional deferred
work remain inactive. Checkpoint 3 is the only next action.

## Cycle 3 result

Cycle 3 repeated all ten areas after every correction and produced zero
findings with no unresolved change request. PLAN-021 checkpoint 2 is complete.
Local checkpoint 3 may proceed; commit, push, registry access and every npm
mutation remain unauthorized.
