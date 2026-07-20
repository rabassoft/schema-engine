# ADR-018 revision 5 complete review — Cycles 1–5

- **Date:** 2026-07-20
- **Document:** [`ADR-018 revision 5`](../adrs/018-licencia-dual-publicacion-experimental.md)
- **Authority:** accepted review 146 cycle 3, SPEC-009 v0.1.0, ADR-009,
  ADR-010 and ADR-025 revision 0
- **State:** Accepted after cycle 5 under Ricard's explicit option A selection
  and standing zero-finding review authorization
- **Outcome:** Cycle 5 passed all fifteen areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                                      | Correction                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| R147-F01 | Revision 5's `Related` metadata did not name ADR-025/SPEC-009 even though they are the sole M20 architecture and behavioral authority.       | Added both authorities without changing their contracts or acceptance state.                                                     |
| R147-F02 | M21 partial-failure states were closed, but the decision did not explicitly require the later plan to define exact credential-free commands. | Required exact stop/resume commands and evidence without credentials, OTPs or security-key material.                             |
| R147-F03 | ADR/index/current-state documents still described revision 5 as proposed after the substantive decision passed review.                       | Marked revision 5 Accepted, linked this review and reconciled STATUS, ROADMAP, Deferred, README and the ADR index.               |
| R147-F04 | The exact next action still ended at ADR drafting rather than the separately gated release plan.                                             | Made PLAN-023 preparation/review the next action while keeping manifests, candidates, implementation, Git and external work off. |

## Cycle 2 finding and correction

| ID       | Finding                                                                                                                                   | Correction                                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| R147-F05 | The provisional acceptance left ADR `Implementation`, STATUS, README and WORKLOG describing revision 5 as pending or omitted its outcome. | Reconciled every active state surface, changed the review outcome to cycle 3 and repeated the complete review rather than spot-checking. |

## Cycle 3 finding and correction

| ID       | Finding                                                                                                            | Correction                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| R147-F06 | The complete format check rejected this review and the Deferred register, so cycle 3 could not support acceptance. | Applied repository formatting to both files, advanced the outcome to cycle 4 and restarted every review area. |

## Cycle 4 finding and correction

| ID       | Finding                                                                                                                   | Correction                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| R147-F07 | The cycle-3 finding record itself changed the review after formatting and remained non-canonical, so cycle 4 also failed. | Completed the review record first, reformatted it canonically and advanced the full repeated review to cycle 5. |

## 1. Decision scope

Revision 5 changes only repeat-release architecture for the exact M21 line:

| Package                                 | Version | Required Schema Engine peer |
| --------------------------------------- | ------- | --------------------------- |
| `@rabassoft/schema-engine`              | `0.4.0` | none                        |
| `@rabassoft/schema-engine-angular`      | `0.4.0` | core `^0.4.0`               |
| `@rabassoft/schema-engine-angular-aria` | `0.2.0` | base Angular `^0.4.0`       |

It preserves revision 4's licensing, source, package identities, private-
repository metadata, security and immutable-history rules. It adds no package,
entry point, behavior, export, dependency, style property or framework range.

## 2. SemVer and peer correctness

Core and base require `0.4.0` because SPEC-009 includes incompatible Public
Experimental changes and ADR-010 forbids PATCH. The pilot requires `0.2.0`
because its existing `^0.3.0` base peer cannot admit base `0.4.0`; changing a
supported peer line during `0.y` is likewise a MINOR.

The equal core/base numbers remain independent and evidence-driven. Pilot
`0.1.x` remains the M19 companion; revision 5 rejects an unproven cross-MINOR
pilot range. Angular/Aria/CDK ranges and exact-patch alignment stay unchanged.

## 3. Observable contract and migration

SPEC-009 remains the sole behavioral authority. Release notes and consumers
must cover required manual owner forests, the generic presentation family,
`TemplatePresentationEntryDefinition`, object/item authoring and Angular
external-renderer narrowing. No API becomes Stable, Deprecated or removed.

The revision changes no source or manifest itself. It classifies the already
implemented M20 contracts for later delivery and requires migration notes.

## 4. Publication graph

Dependency-first `next` is exact:

1. core `0.4.0`;
2. base Angular `0.4.0` after live core verification; and
3. pilot `0.2.0` after the live pair and native evidence pass.

Each publish remains an individual external checkpoint. No consumer evidence
from partial `next` state is accepted.

## 5. Default-channel transition

All aliases are established before M21. The revision correctly changes M19's
first-pilot branch to one deepest-dependent-first chain:

1. pilot `latest` to `0.2.0`;
2. base Angular `latest` to `0.4.0`; and
3. core `latest` to `0.4.0`.

This leaves only one adjacent peer mismatch in either planned mixed window.
Core-first or base-first creates a broader incompatible default state. Exact,
`next`, `latest` and unqualified completion evidence is accepted only after the
third transition and complete reobservation.

## 6. Immutable recovery

Every core/base/pilot publication and pilot/base/core tag state has an explicit
preservation rule. Recovery never overwrites, unpublishes, reuses a failed
version or assumes tag deletion. Any corrective tag is itself separately
approved and observed.

The later plan must define exact stop/resume commands and evidence without
embedding authentication material. An incomplete chain remains documented and
cannot be relabelled coordinated completion.

## 7. Licensing and Corresponding Source

`AGPL-3.0-only` or a separate paid commercial agreement, the exact natural-
person rights holder, public contact, notices and contribution-rights boundary
remain unchanged. Each artifact must independently contain complete preferred
TypeScript source and a frozen build harness while the repository remains
private.

Angular Aria/CDK remain MIT peers/dev dependencies and are neither bundled nor
relicensed. Reference/Standard/validator/private documentation stays outside
public packages.

## 8. Security, repository and provenance

Interactive write-protected 2FA and immediate human approval remain mandatory
for every write. Repository metadata, public visibility, OIDC, trusted
publishing, workflow automation and provenance remain jointly Deferred under
D-043. Acceptance performs and authorizes no npm query, authentication or
write.

## 9. Compatibility evidence

The lower tuple remains Angular `22.0.6` plus Aria/CDK `22.0.5`; the frozen
latest-compatible M20 tuple remains Angular `22.0.7` plus Aria/CDK `22.0.5`.
Both native and pilot lanes must prove declarations, strict types, DOM,
production builds and Chromium, including the recursive-local scenario.

A later separately authorized registry preflight may add a newer patch as
current evidence but cannot silently replace frozen tuples, widen Angular 23
or claim legacy support.

## 10. Local plan boundary

Revision 5 authorizes only PLAN-023 preparation and complete review. A plan may
propose a new immutable M21 descriptor, exact manifest/peer changes, release
notes, candidates, M18/M20 regressions and separately gated delivery steps.

It must preserve M19 live/frozen tooling and published history rather than
rewriting old evidence. Plan approval itself cannot authorize Git or registry
work unless its zones and later immediate gates say so explicitly.

## 11. Explicit exclusions

The revision does not activate React, Vue, composition, workflow, broader
theming, legacy Angular, SSR/hydration, D-043, another package, Standard/
validator publication, Stable APIs, `1.0`, a Git tag or GitHub Release.

It changes no manifest, lockfile, version, peer, dependency, implementation,
candidate or external state merely by acceptance.

## 12. Historical integrity

Revision 3 remains the first-release policy, revision 4 remains the exact M19
three-package/first-pilot decision, and PLAN-021's observed bytes/tags remain
immutable history. Revision 5 adds only the next three-established-package
sequence; it does not rewrite M19 outcomes.

## 13. Cycle 5 complete review

Cycle 5 repeated every area after the cycle 4 correction:

1. **Promotion authority — Pass.** Review 146 permits only this exact revision
   and release line.
2. **Licensing — Pass.** AGPL/commercial rights, holder and contribution limits
   remain exact.
3. **Package boundary — Pass.** Only the three admitted names/entry points are
   present.
4. **SemVer — Pass.** `0.4.0`/`0.4.0`/`0.2.0` and peers follow ADR-010 without
   lockstep.
5. **Behavior/migration — Pass.** SPEC-009 remains authoritative and all Public
   changes stay Experimental.
6. **`next` sequence — Pass.** Core/base/pilot is dependency-first with no
   mixed-window evidence.
7. **`latest` sequence — Pass.** Pilot/base/core minimizes unresolved peer
   edges and gates all evidence until completion.
8. **Recovery — Pass.** Every partial state preserves immutable bytes and needs
   explicit resume/correction.
9. **Security/external authority — Pass.** 2FA/immediate approval remain; no
   remote action is authorized.
10. **Source/legal isolation — Pass.** Corresponding Source and third-party
    boundaries remain complete.
11. **Compatibility — Pass.** Frozen lower/latest native/pilot evidence remains
    mandatory with no range widening.
12. **Tooling/history — Pass.** M19 evidence remains immutable and M21 receives
    a new descriptor only through a later plan.
13. **Deferred boundary — Pass.** D-043 and every functional/framework option
    remain inactive.
14. **Plan boundary — Pass.** Only PLAN-023 preparation/review follows; no
    manifest, candidate, implementation, Git or registry work is active.
15. **Documentation/diff — Pass.** ADR metadata, indexes, STATUS, ROADMAP,
    Deferred, README, WORKLOG, links, formatting and diff are consistent.

**Result:** zero findings and no unresolved change request.

## 14. Acceptance effect

ADR-018 revision 5 is Accepted. Acceptance authorizes only drafting and
completely reviewing PLAN-023 for the exact M21 line. It does not authorize
plan implementation, manifest/package changes, candidate preparation, commit,
push, registry access, publication, tags or any other external action.
