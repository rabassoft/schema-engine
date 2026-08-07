# SPEC-021 v0.1.0 complete review — Cycles 1–2

- **Date:** 2026-08-04
- **State:** Complete; SPEC accepted by Ricard on 4 August 2026
- **Reviewed:** SPEC-021 v0.1.0 against Accepted ADR-038 revision 0, review 338
  cycle 2, SPEC-001 v0.1.15 through SPEC-020 v0.1.0, ADR-007/009/010/020,
  D-025/D-026/D-044, current core/Angular/Standard contracts and React 19.2
  lifecycle constraints
- **Outcome:** Cycle 1 found seven contract ambiguities. After correction,
  cycle 2 repeated all eighteen areas and all 36 conformance rows with zero
  findings. SPEC-021 is ready for Ricard's acceptance decision.

## Cycle 1 findings and corrections

| Finding  | Correction                                                                                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R340-F01 | Wrapped every facade read in an exact frozen success/failure union so unavailable and stale reads return the ADR-required diagnostic rather than losing it behind an optional callback.                                                  |
| R340-F02 | Replaced non-injective UTF-8 replacement encoding with fixed-width UTF-16 code-unit encoding and closed the accessible member-suffix vocabulary.                                                                                         |
| R340-F03 | Added a post-commit/pre-paint projection cache so application-supplied renderer testers and text resolvers never run in render/memo, and made resolver changes advance an Internal handle projection generation without recreating core. |
| R340-F04 | Closed invalid cross-copy/forged composition behavior with descriptor-checked Internal diagnostic receivers and the only safe sinkless case.                                                                                             |
| R340-F05 | Fixed `Object.is` identity comparison, effective visibility equality, external-update/visibility ordering, callback freshness, atomic failure cleanup and bounded recovery from error epochs.                                            |
| R340-F06 | Added exact adapter diagnostic parameters, safe-value rules, fallback messages, batching, deduplication, cascade suppression and post-commit delivery.                                                                                   |
| R340-F07 | Separated projected wizard requests from application confirmation/rejection and made tab/accordion keyboard semantics plus deterministic ID suffixes exact.                                                                              |

Cycle 1 cannot support acceptance. Cycle 2 restarts the complete review after
all seven corrections.

## Cycle 2 complete review

| Area                            | Result | Evidence                                                                                                                                                |
| ------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Authority and scope          | Pass   | M35 remains the bounded client-rendered React adapter plus independent private shell; no core grammar or broader framework capability is introduced.    |
| 2. Package identity             | Pass   | `packages/react`, Public package name, private `0.0.0` source, ESM, side effects and root-only exports are exact.                                       |
| 3. React compatibility          | Pass   | Aligned React/DOM `>=19.2.0 <20.0.0`, lower/current tuples, peers and unsupported lines match ADR-038 without asserting a release range for dirty core. |
| 4. Public inventory             | Pass   | Exactly four runtime values and twelve exported types are named; every helper/native/brand remains Internal.                                            |
| 5. Controlled ownership         | Pass   | Application owns value, baseline, operations, wizard decisions, async transport, persistence and completion; no raw runtime escape exists.              |
| 6. Hook state/actions           | Pass   | Opaque frozen state/handle, per-epoch actions, exact read/action signatures and unavailable/stale results are closed.                                   |
| 7. External-store lifecycle     | Pass   | Inert bridge, cached snapshots, client layout effects, construction/update identity, cleanup, recovery and no server snapshot are exact.                |
| 8. Strict Mode/purity           | Pass   | Runtime, subscriptions, testers, resolver and callbacks avoid render/memo; replay is balanced and cannot duplicate intentions.                          |
| 9. Registry                     | Pass   | Dense descriptor-safe parsing, atomic failure, rank/priority/order and native/custom composition preserve ADR-007.                                      |
| 10. Renderer isolation          | Pass   | Owner/epoch/registration/component boundary identity, callback deactivation, committed reporting and sibling continuity are deterministic.              |
| 11. Native leaves               | Pass   | All six native registrations and missing/null/fixed/numeric/selection edge behavior are covered without a Public native component.                      |
| 12. Compound identity           | Pass   | Objects, items, alternatives and recursive owners use normalized stable keys and never index/random/render identity.                                    |
| 13. Presentation/wizard         | Pass   | Fixed Internal hosts retain local state; wizard steps stay mounted and only neutral/application-controlled actions occur.                               |
| 14. Text/diagnostics/a11y       | Pass   | Resolver parity, exact codes/parameters/order, injective IDs, visible labels, tab/accordion/wizard semantics and bounded claims are closed.             |
| 15. Reference shell             | Pass   | Catalog-only sharing, independent React bootstrap/state/CSS/snippets/tests and complete maintained experience satisfy ADR-020.                          |
| 16. Verification ownership      | Pass   | Rows 1–36 cover API, lifecycle, consumers, full projection, shell, regressions, docs and final review without workspace-only evidence.                  |
| 17. Deferred/release boundaries | Pass   | SSR, other React lines/frameworks, UI libraries, CSS/theming, generic adapters, dependencies, versions, release and Git remain inactive.                |
| 18. Next gate                   | Pass   | Acceptance authorizes PLAN-037 drafting/review only and cannot start package creation or implementation.                                                |

## Conformance-row audit

| Rows  | Result | Review conclusion                                                                                                     |
| ----- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| 1–4   | Pass   | Package/export/peer/tuple claims are independently observable.                                                        |
| 5–9   | Pass   | Configuration, resolver, handle, facade and stale lifecycle are exact.                                                |
| 10–13 | Pass   | Store, reconciliation, wizard confirmation and Strict Mode are closed.                                                |
| 14–18 | Pass   | Registry, composition, failure isolation and renderer props are testable.                                             |
| 19–24 | Pass   | Native, accessibility, object, collection, alternative and presentation projections cover the active neutral surface. |
| 25–28 | Pass   | Conditions, validation, scopes/baseline and wizard preserve core ownership.                                           |
| 29–30 | Pass   | Complete catalog and maintained shell interaction are separately evidenced.                                           |
| 31–34 | Pass   | Packed/isolated consumption, regressions, tooling and no external drift are mandatory.                                |
| 35–36 | Pass   | Persistent documentation and zero-finding final review close delivery.                                                |

Cycle 2 passes all eighteen areas and all 36 rows with zero findings and no
unresolved change request. Ricard accepted SPEC-021 v0.1.0 on 4 August 2026.
Acceptance authorizes drafting and completely reviewing PLAN-037 only. No
dependency, package,
implementation, version, release, publication, commit, push or external state
is authorized by this review.

## Verification

- Complete cross-check against ADR-038, the Accepted behavioral baseline,
  current Public core/Angular signatures and deferred boundaries.
- Exact root inventory, action inventory, diagnostic families and conformance
  row numbering checked mechanically.
- Prettier, `pnpm docs:check` (468 Markdown files and 1,297 local links) and
  `git diff --check` pass before this review is recorded as complete in
  persistent state.
