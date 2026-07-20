# M21 coordinated M20 Experimental release promotion-readiness review — Cycles 1–3

- **Date:** 2026-07-20
- **State:** Accepted after cycle 3 under Ricard's explicit review-145 option A
  selection and standing zero-finding review authorization
- **Demand:** Deliver completed M20 before accumulating another unshipped
  functional or framework milestone
- **Authority reviewed:** SPEC-009 v0.1.0; ADR-009, ADR-010, ADR-018 revision 4,
  ADR-024 revision 1 and ADR-025 revision 0; D-040/D-043; completed
  PLAN-021/022; reviews 132, 143–145; the three public manifests; current
  declaration/source diff; and frozen M18/M20 release/consumer tooling
- **Outcome:** Cycle 3 passed all fourteen areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                                   | Correction                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| R146-F01 | Review 145 still said product selection remained with Ricard after he explicitly selected option A.                       | Recorded the 20 July selection follow-up while preserving that review 145 itself promoted nothing.                                          |
| R146-F02 | STATUS still waited for review-145 selection and had no M21 release-design boundary.                                      | Replaced the selection question with accepted M21 design state and ADR-018 revision 5 as the exact next gate.                               |
| R146-F03 | ROADMAP ended with an unspecified post-M20 selection review after option A had been chosen.                               | Added the selected M21 normative-release boundary and kept implementation, Git and external work inactive.                                  |
| R146-F04 | D-040 described only the completed M19 line and did not record the selected M20 delivery design.                          | Added the exact M21 design promotion while leaving manifests, candidate preparation, registry and D-043 inactive.                           |
| R146-F05 | ADR-018's active `Implementation` header still claimed that M19 implementation was unauthorized after completed PLAN-021. | Corrected only that stale status metadata; revision 4's substantive M19 decision remains unchanged until revision 5 is separately reviewed. |
| R146-F06 | The architecture indexes did not expose the accepted M21 promotion gate.                                                  | Added review 146 without reserving an ADR, SPEC or plan identifier beyond the required ADR-018 revision number.                             |

## Cycle 2 findings and corrections

| ID       | Finding                                                                                      | Correction                                                                                       |
| -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| R146-F07 | The new review and updated Deferred register did not satisfy repository formatting.          | Formatted both documents and restarted the complete review rather than accepting partial checks. |
| R146-F08 | STATUS still said that no capability after M20 was promoted while M21 design was now active. | Replaced that stale phase statement with the exact design-only M21 boundary.                     |

## 1. Readiness conclusion

Promote only this M21 normative delivery boundary:

**A coordinated Public + Experimental release of completed M20 as core/base
Angular `0.4.0` and Angular Aria pilot `0.2.0`, preserving the existing private-
repository, package-local Corresponding Source and interactive-2FA model.**

The restart evidence is sufficient:

1. PLAN-022/M20 is complete after review 144 cycle 3 passed fourteen areas and
   all 27 SPEC-009 rows with zero findings.
2. SPEC-009 inventories every Public/Internal change, migration example and
   compatibility requirement and explicitly requires a future MINOR for
   affected published packages.
3. Core and base Angular carry incompatible Public Experimental changes;
   Angular Aria's existing registrations exercise the widened behavior and its
   current base peer cannot admit the next base MINOR.
4. Review 143 proves current package declarations, source/artifact inventories
   and dedicated lower/latest M20 native/pilot consumers from temporary
   tarballs without changing versions or release state.
5. ADR-018 revision 4 and completed PLAN-021 prove the three-package licensing,
   source, immutable-recovery and manually gated release model.
6. Ricard explicitly selected review-145 option A before React, composition or
   another Deferred capability.

This evidence supports revision of release architecture and later planning. It
does not authorize manifest changes, candidate preparation, Git, registry
reads/writes, publication, tag changes or repository actions.

## 2. Exact promoted M21 line

ADR-018 revision 5 may design only:

| Package                                 | Release line | Required Schema Engine peer |
| --------------------------------------- | ------------ | --------------------------- |
| `@rabassoft/schema-engine`              | `0.4.0`      | none                        |
| `@rabassoft/schema-engine-angular`      | `0.4.0`      | core `^0.4.0`               |
| `@rabassoft/schema-engine-angular-aria` | `0.2.0`      | base Angular `^0.4.0`       |

The private validator, Standard/reference applications and workspace root are
not released. No fourth package, new entry point, export, dependency, CSS
property or framework range is selected.

Core/base equality reflects that M20 changes both packages; it does not create
lockstep versioning. The pilot remains an independent line and increments only
because it must move from base `^0.3.0` to the incompatible `^0.4.0` line while
delivering the required widened behavior.

## 3. SemVer and migration treatment

### Core `0.4.0`

The core MINOR is mandatory under ADR-010 because M20 adds
`TemplatePresentationEntryDefinition`, genericizes the presentation family,
adds optional raw object/item presentation, requires normalized object/item-
template forests and widens text/diagnostic/manual-definition behavior.
Required manual-definition members are incompatible Public Experimental
changes. PATCH is forbidden.

### Base Angular `0.4.0`

The base MINOR is mandatory because Public container definitions, render
models, testers and entry/panel outlet domains widen from root definitions to
the accepted node/template union. External renderers may need explicit
narrowing. The packed core peer must become exactly `^0.4.0`; Angular
core/forms remain `>=22.0.6 <23.0.0`.

### Angular Aria `0.2.0`

The production provider/export/style surface remains unchanged, but `0.1.x`
requires base `^0.3.0` and cannot truthfully deliver M20 with base `0.4.0`.
Changing the supported base line during `0.y` is an incompatible compatibility
change and therefore a MINOR. The packed base peer becomes exactly `^0.4.0`;
Angular core remains `>=22.0.6 <23.0.0`, and Aria/CDK remain
`>=22.0.5 <23.0.0` with the existing exact-patch alignment rule.

Release notes must include SPEC-009's manual-definition and external-renderer
migrations and state that every API remains Public + Experimental + Active.
No deprecation or Stable promotion is implied.

## 4. Required normative sequence

ADR-018 revision 4 cannot directly govern an M21 plan. It fixes the exact M19
versions, treats the pilot as a first publication and defines a tag sequence in
which the pilot's `latest` already exists before established base/core aliases
move. M21 has three established package lines and a three-edge transition.

The required order is:

1. draft and completely review ADR-018 revision 5;
2. accept it only after a complete zero-finding pass;
3. prepare and completely review the next release plan;
4. approve only its bounded local checkpoints first;
5. retain separate authorization for the scoped commit/private push, every
   external preflight, each publication and each dist-tag mutation; and
6. close only from observed immutable registry bytes and exact clean consumers.

No new behavioral SPEC or ADR-010 revision is required. SPEC-009 already fixes
the behavior/migration, and ADR-010 unambiguously requires these MINOR lines.

## 5. Publication and default-channel ordering

Revision 5 must preserve dependency-first `next` publication:

1. core `0.4.0`;
2. base Angular `0.4.0` after live core verification; and
3. pilot `0.2.0` after the exact live core/base pair passes native consumers.

All three package names and both `next`/`latest` aliases already exist. The
default-channel transition must therefore be deepest-dependent first:

1. pilot `latest` to `0.2.0` while base/core defaults remain old;
2. base Angular `latest` to `0.4.0` while core default remains old; and
3. core `latest` to `0.4.0` only after the prior state is reobserved.

This order limits each planned mixed window to one incompatible adjacent peer
edge. No exact/`next`/`latest`/unqualified coordinated evidence is accepted
from any mixed window. Every publish/tag write requires immediate approval,
then complete read-only verification before the next mutation.

Revision 5 must define immutable stop/resume and separately approved corrective
tag handling for failure after each package or alias. It must never overwrite,
unpublish, reuse or assume deletion of a version/tag.

## 6. Local preparation and tooling boundary

A later plan may locally:

- add a new immutable release descriptor for the exact M21 line while keeping
  M19 live/frozen regressions unchanged;
- update only the three public package versions and the two Schema Engine peer
  edges selected above;
- add M21 release notes, migration/onboarding and stale-document checks;
- prepare deterministic `.release/0.4.0` tarballs, hashes, inventories and
  package-local Corresponding Source;
- add current-candidate and future live exact/`next`/`latest`/unqualified
  native/pilot modes without weakening historical `0.2.0`/M19 evidence;
- rerun M18 and M20 lower/latest frozen consumers plus package/source/security
  and reference evidence; and
- stop with reviewed local candidates before Git or any external access.

Current tooling is intentionally M19-specific and manifests still expose
`0.3.0`/`0.3.0`/`0.1.0`. This review does not change either. A future plan must
make the new descriptor explicit rather than repurposing M19 constants or
release evidence.

## 7. Git, source identity and external gates

The complete M19 closure plus M20 source/doc tree is reviewed but uncommitted.
The tree also retains the unrelated `angular.json` analytics opt-out. A release
plan must:

- review and intentionally scope the complete release source diff;
- exclude or separately account for the unrelated analytics change;
- stop for explicit commit/private-push authorization;
- rebuild from that exact clean commit and compare candidates byte-for-byte;
- query npm identity, existing versions, aliases and package metadata only at
  a separately authorized external preflight; and
- obtain immediate approval before every publish or tag command.

No commit, push, npm authentication/query, registry mutation or remote action
belongs to this promotion review or the next ADR review.

## 8. Package, licensing and Corresponding Source boundary

All three artifacts retain `AGPL-3.0-only` or a separate paid commercial
license, Ricardo Rabassó Rodríguez operating as Rabassoft, public access and
`ricard@rabassoft.com`. Each must independently contain preferred TypeScript
source, a frozen build harness, LICENSE, NOTICE, SOURCE and truthful README.

Core/base contain no pilot, Aria/CDK code, style or peer. The pilot contains no
copied/relicensed Aria/CDK implementation, Standard/reference application or
private architecture documentation. Package repository/provenance metadata,
trusted publishing and automation remain absent while D-043 is Deferred.

## 9. Compatibility and evidence

The frozen M20 tuples remain:

- lower: Angular core/forms `22.0.6`, Angular Aria/CDK `22.0.5`;
- latest-compatible at M20 closure: Angular core/forms `22.0.7`, Angular
  Aria/CDK `22.0.5`.

Native and pilot lanes must pass package declarations, strict types, DOM,
production build and Chromium at both tuples from the candidate tarballs. The
dedicated M20 recursive-local scenario is mandatory; M18 root-only evidence
cannot substitute for it.

A later authorized registry preflight may observe a newer compatible patch and
use it only as additional current evidence. It cannot change the lower bound,
widen Angular 23/legacy support or replace the frozen accepted tuples silently.

## 10. Explicit exclusions

M21 does not activate:

- new runtime, schema, UI Schema, presentation or renderer behavior;
- a fourth package, entry point, dependency, UI kit or CSS property;
- Stable API, `1.0`, SLA or final paid-license terms;
- React, Vue, composition, workflow, remaining D-011/D-025, D-012 or D-026;
- Angular 23, legacy Angular, SSR, hydration or a wider peer range;
- repository sanitization/publication, metadata, OIDC, provenance, automation,
  Git tag or GitHub Release;
- Standard/reference/validator publication; or
- any local, Git or external action merely because this review is accepted.

## 11. Material alternatives

### Publish only core/base

Rejected. Angular Aria is an admitted Public Experimental implementation whose
current peer excludes base `0.4.0`; omitting it would leave the coordinated M20
container line incomplete and preserve no installable pilot for the new base.

### Keep pilot `0.1.x` and widen its peer

Rejected. Changing its accepted base compatibility during `0.y` is not a PATCH
and published `0.1.0` bytes are immutable. The next valid line is `0.2.0`.

### Let pilot `0.2.0` support both base `0.3.x` and `0.4.x`

Rejected for M21. It would add a new cross-MINOR compatibility claim and double
pilot declaration/runtime/consumer evidence without helping deliver the exact
M20 line. Existing pilot `0.1.x` remains the supported M19 companion.

### Move core/base `latest` before pilot

Rejected. Updating base first breaks the currently default pilot peer while
also leaving core mismatched; updating core first breaks the currently default
base. Pilot, then base, then core limits each mixed window to one adjacent peer
edge.

### Release M20 together with React or another feature

Rejected by Ricard's option A selection. It would accumulate new unreviewed
surface and defeat the purpose of closing the current source/package gap.

### Publish the repository and enable OIDC first

Deferred to D-043. It is broader, externally destructive and not required for
the accepted manual-2FA plus package-local source model.

## 12. Cycle 3 complete review

Cycle 3 repeated all fourteen areas after the cycle 1–2 corrections:

1. **Demand and selection — Pass.** Ricard explicitly selected review-145
   option A before another feature/framework milestone.
2. **Implemented baseline — Pass.** PLAN-022/M20 and all 27 SPEC-009 rows are
   complete with zero-finding final review.
3. **Package identities — Pass.** Only the existing core, base and pilot names/
   entry points are admitted; private packages/apps remain excluded.
4. **SemVer — Pass.** Core/base `0.4.0` and pilot `0.2.0` are the minimum valid
   MINOR lines; no lockstep rule is introduced.
5. **Peers — Pass.** Base requires core `^0.4.0`, pilot requires base `^0.4.0`,
   and framework/UI ranges stay exact.
6. **Migration — Pass.** SPEC-009's required manual forests, generic contracts
   and Angular renderer narrowing are mandatory release notes.
7. **Architecture sequence — Pass.** ADR-018 revision 5 must precede any plan;
   SPEC-009/ADR-010 need no revision.
8. **Channel sequence — Pass.** Dependency-first `next` and pilot/base/core
   deepest-dependent-first `latest` minimize but never validate mixed windows.
9. **Git/source identity — Pass.** Dirty source cannot become publishable
   evidence without separately authorized scoped commit/push and clean rebuild.
10. **Package/legal/source — Pass.** AGPL/commercial, Corresponding Source and
    third-party isolation remain exact.
11. **Compatibility — Pass.** Frozen lower/latest M20 native/pilot evidence is
    mandatory; no unsupported Angular range is inferred.
12. **Tooling — Pass.** M19 descriptors/regressions remain immutable while M21
    receives explicit new tooling only in a future plan.
13. **Deferred/external boundary — Pass.** D-043, later capabilities and every
    local/Git/registry mutation remain inactive or separately gated.
14. **Persistent state — Pass.** STATUS, ROADMAP, Deferred, indexes and review
    145 agree on the selected design-only M21 boundary.

**Result:** zero findings and no unresolved change request.

## 13. Accepted effect

Acceptance:

1. selects M21 as the next normative milestone and promotes only the exact
   section 2 release line for ADR-018 revision 5 design;
2. authorizes drafting and completely reviewing ADR-018 revision 5;
3. does not authorize a release plan, manifests, dependencies, candidate
   preparation, code, commit, push, registry access, publication or tag change;
4. preserves every Public API as Experimental and leaves SPEC-009, ADR-009/010,
   M20 behavior and package/framework boundaries unchanged; and
5. leaves React, composition, theming, workflow, Angular legacy, D-043 and all
   other Deferred capabilities inactive.
