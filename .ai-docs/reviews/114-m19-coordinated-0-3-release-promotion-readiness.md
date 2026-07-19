# M19 coordinated Experimental 0.3 release promotion-readiness review — Cycles 1–2

- **Date:** 2026-07-19
- **State:** Accepted after cycle 2 under Ricard's explicit M19 selection and
  standing zero-finding review authorization
- **Demand:** Publish the completed M18 value before accumulating another
  unshipped functional milestone
- **Authority reviewed:** SPEC-008 v0.1.0, ADR-009, ADR-010, ADR-018 revision 3,
  ADR-024 revision 1, D-040, D-043, completed PLAN-015/020, the three current
  package manifests and final reviews 052/113
- **Outcome:** Cycle 2 passed all twelve areas with zero findings

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                        | Correction                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| R114-F01 | The architecture README still called publication Deferred after M19 release design had been promoted.          | Distinguished selected normative release design from still-gated implementation and external publication.                  |
| R114-F02 | D-040 retained the first-release `private: true` state in present tense after the completed public releases.   | Reframed it as historical state at the original promotion gate without rewriting the decision.                             |
| R114-F03 | The ADR index still said Approved PLAN-020 governed delivery after PLAN-020/M18 completed.                     | Reconciled ADR-024's index summary with completed PLAN-020 and review 113.                                                 |
| R114-F04 | D-011 still described PLAN-020 as currently Approved despite recording its completion immediately afterwards.  | Changed the approval to historical tense and named the current Completed state.                                            |
| R114-F05 | ROADMAP's M18 exclusions still called release Deferred despite the newly selected adjacent M19 release design. | Preserved release as excluded from M18 while distinguishing the separately selected, normative-only M19 release milestone. |

## 1. Readiness conclusion

Promote only this M19 release-design boundary:

**A coordinated Public + Experimental release of core/base Angular `0.3.0`
and the first Angular Aria pilot `0.1.0`, using the existing private-repository,
Corresponding Source and interactive-2FA model.**

The restart evidence is sufficient:

1. PLAN-020/M18 are complete after final review 113 cycle 2 passed fourteen
   areas and all 22 SPEC-008 rows with zero findings.
2. SPEC-008 already selects exact core/base `0.3.0` and pilot `0.1.0` lines,
   exact peer ranges, exports, support tiers and Experimental status.
3. All three source manifests are publishable, AGPL-3.0-only, carry the accepted
   author/contact and select public access, `next` and no provenance.
4. Exact artifacts, package inventories, Corresponding Source rebuilds,
   security/legal checks and lower/latest native/pilot consumers already pass.
5. Published core/base `0.2.0` bytes and tags have an immutable local regression
   verifier and remain distinct from the private candidates.
6. The user explicitly selected release before further layout, framework or
   legacy-Angular work.

This evidence supports release architecture and planning. It does not itself
authorize candidate preparation, Git mutation, npm reads/writes, publication
or tag changes.

## 2. Exact promoted boundary

ADR-018 revision 4 may design only this delivery:

| Package                                 | Release line | Required Schema Engine peer |
| --------------------------------------- | ------------ | --------------------------- |
| `@rabassoft/schema-engine`              | `0.3.0`      | none                        |
| `@rabassoft/schema-engine-angular`      | `0.3.0`      | core `^0.3.0`               |
| `@rabassoft/schema-engine-angular-aria` | `0.1.0`      | base Angular `^0.3.0`       |

The revision may generalize ADR-018's package-onboarding and later-release
rules enough to cover this exact third package and repeat release. It must
retain:

- Public + Experimental + Active classification with no Stable promotion;
- independent SemVer, despite a coordinated core/base delivery;
- public npm access under `@rabassoft`, recommended `next` and npm-mandatory
  `latest` treated only as routing;
- private GitHub repository, absent inaccessible repository URL, no provenance
  or trusted publisher;
- complete package-local Corresponding Source, AGPL/commercial notices and
  third-party license isolation; and
- immediate human approval before each Git or npm mutation.

No behavior, API, export, peer range, package name or version may change from
the accepted SPEC-008/current candidate inventory merely to simplify release.

## 3. Normative document sequence

The current ADR-018 revision 3 cannot authorize PLAN-021 directly. Its package
shape says only the two original manifests may become publishable, its registry
identity gate names both original packages, and several rules are explicitly
limited to the first two-package release. Publishing the pilot would conflict
with that Accepted text.

The required order is:

1. draft and completely review ADR-018 revision 4;
2. accept it only after a complete zero-finding pass;
3. prepare and completely review PLAN-021 against that accepted revision;
4. approve only bounded local checkpoints first;
5. retain separate immediate gates for commit, push, every npm publication and
   every dist-tag mutation; and
6. record completion only from observed registry bytes and clean consumers.

No new behavioral SPEC is required because SPEC-008 already fixes the exact
observable API, package and compatibility contract. ADR-010 needs no revision:
it permits independent versions and requires MINOR for the new Experimental
core/base public surface; the pilot legitimately begins at `0.1.0`.

## 4. Release ordering and registry consistency questions

ADR-018 revision 4 must close these questions before PLAN-021:

1. exact publication order must follow the dependency graph: core `0.3.0`,
   base Angular `0.3.0`, then pilot `0.1.0`;
2. each package must be published only from separately inspected immutable
   bytes after its dependencies exist and pass live verification;
3. core/base must stage and verify the coordinated `next` line before moving
   either established `latest` alias;
4. the first pilot publication may cause npm to create mandatory `latest`
   beside requested `next`; the plan must observe and verify that state rather
   than assume it can be deleted;
5. the safe order for established core/base `latest` changes, mixed-version
   recovery and unqualified-consumer checks must be explicit; and
6. failure after any partial publication or tag mutation must preserve
   immutable bytes and use a new version, deprecation or tag correction—never
   replacement or unpublish assumptions.

These are release-architecture questions, not permission to query or mutate
npm during this review.

## 5. Local preparation boundary

PLAN-021 may later include local checkpoints to:

- generalize two-package `0.2.0` candidate/live tooling to an explicit
  three-package release descriptor without weakening the frozen `0.2.0`
  regression;
- create `.ai-docs/releases/0.3.0.md` with the M18 migration, compatibility,
  Experimental, source, licensing and private-repository boundaries;
- replace pilot wording that still calls publication a PLAN-020 gate, while
  preserving truthful unpublished state until registry observation;
- prepare deterministic tarballs, manifests, hashes and neutral-path dry runs;
- verify exact declarations, exports, peers, licenses, source, lifecycle,
  security and absence of workspace specifiers;
- run native/pilot lower/latest clean consumers plus all M18 and historical
  regression gates; and
- stop at a clean reviewed candidate before Git or registry action.

Current `prepare:release`, live verification and tag scripts remain specialized
for the two-package `0.2.0` release. Their existence is historical regression
evidence, not proof that M19 release tooling is ready.

## 6. Git and external gates

The current M18 working tree is reviewed but uncommitted and includes an
unrelated `angular.json` analytics opt-out. M19 must not build publishable
evidence from an ambiguous dirty source state.

PLAN-021 must require:

- an explicitly authorized, intentionally scoped M18 commit that excludes or
  separately accounts for the unrelated analytics change;
- an explicitly authorized private `develop` push;
- a clean rebuild whose bytes are compared with the reviewed pre-commit
  candidates before any selection;
- read-only registry identity/name/version/tag checks only at their explicit
  external checkpoint; and
- one immediate approval before each publication and each tag mutation.

No commit, push, npm authentication, registry query or remote mutation is part
of accepting this review or ADR drafting.

## 7. Package, source and licensing boundary

All three release artifacts must independently include exact manifests,
preferred TypeScript source, frozen build harnesses, LICENSE, NOTICE, SOURCE and
README material. The pilot additionally includes only its accepted stylesheet
entry point and six Public Experimental properties.

Angular Aria and CDK remain MIT peers/dev dependencies, not bundled or
relicensed. Core/base artifacts must contain no pilot, Aria/CDK import, peer,
style or asset. The pilot must contain no Standard/reference application or
private documentation.

The accepted copyright notice, `ricard@rabassoft.com`, AGPL-3.0-only terms and
separate commercial-license statement remain unchanged. No final commercial
terms or support SLA are represented.

## 8. Compatibility and consumer evidence

Release evidence must preserve both verified tuples:

- lower: Angular core/forms `22.0.6`, Angular Aria/CDK `22.0.5`;
- latest-compatible at M18 closure: Angular core/forms `22.0.7`, Angular
  Aria/CDK `22.0.5`.

Native and pilot consumers must each pass strict installation, Angular partial
compilation, strict types, DOM semantics, production build and Chromium.
Registry-backed exact/`next`/`latest`/unqualified modes must consume only
observed published bytes, reject mixed unsupported Schema Engine lines and
retain aligned Angular core/forms plus exact Aria/CDK peer-patch checks.

Later Angular patches inside the accepted range may replace the recorded latest
tuple only through fresh observed evidence; they do not change the lower bound
or authorize Angular 23/legacy support.

## 9. Explicit exclusions

M19 does not activate:

- any new runtime, schema, UI Schema, renderer, container, token or diagnostic;
- Stable API, `1.0`, support SLA or final commercial agreement;
- remaining D-011/D-025, D-012, React, Vue, Angular legacy or another UI kit;
- repository publication/sanitization, D-043, repository metadata, OIDC,
  provenance, CI workflow or GitHub Release;
- Standard/reference package publication;
- Angular 23 or a wider peer range;
- a Git tag, changelog convention or automation not selected by ADR-018
  revision 4; or
- any external action merely because this review is accepted.

## 10. Material alternatives

### Continue feature development before release

Rejected for M19. It accumulates unshipped Experimental surface despite three
fully verified candidates and delays real package-consumer feedback.

### Publish only core and base Angular

Rejected. It would withhold the concrete pilot that validates the newly
published container SPI and leave the accepted M18 delivery incomplete for npm
consumers.

### Publish only the pilot after leaving core/base at `0.2.0`

Rejected. The pilot contract requires base Angular `^0.3.0`, whose new Public
container SPI does not exist in `0.2.0`.

### Publish the repository and configure OIDC first

Deferred to D-043. It is desirable but materially broader, requires full
history sanitization and is not necessary for the already accepted manual-2FA
plus package-local Corresponding Source model.

### Reuse ADR-018 revision 3 unchanged

Rejected because its exact two-package limitation conflicts with publishing
the pilot and its first-package assumptions do not define the three-package
dependency/tag sequence.

### Create a separate release ADR without revising ADR-018

Rejected. Package onboarding, licensing, private-repository source delivery,
tags, 2FA and provenance are the same architectural policy. A revision keeps
one authoritative publication decision and preserves its history.

## 11. Cycle 2 complete review

Cycle 2 repeated all twelve areas after every correction:

1. **Demand and priority:** Pass. Ricard explicitly selected release before
   another functional/framework milestone.
2. **Implemented baseline:** Pass. PLAN-020/M18 and every conformance row are
   complete with zero-finding final review.
3. **Exact identities:** Pass. SPEC/manifests agree on core/base `0.3.0` and
   pilot `0.1.0` with exact peer direction.
4. **SemVer:** Pass. ADR-010 requires the core/base MINOR and permits the
   independent initial pilot line; no lockstep rule is introduced.
5. **Publication authority:** Pass. ADR-018 revision 3's direct conflict is
   identified and revision 4 is a mandatory gate before PLAN-021.
6. **Registry sequence:** Pass. Dependency order, `next`, mandatory `latest`,
   partial failure and immutable recovery remain explicit ADR questions.
7. **Git/source identity:** Pass. Dirty M18 state cannot become release evidence
   without separately authorized scoped commit/push and clean byte comparison.
8. **Package/legal/source:** Pass. All three artifacts retain AGPL/commercial,
   Corresponding Source and third-party isolation requirements.
9. **Compatibility:** Pass. Lower/latest native and pilot matrices are exact;
   no unsupported Angular range is inferred.
10. **Tooling:** Pass. Existing two-package/hard-coded `0.2.0` scripts are named
    as local PLAN-021 work rather than accepted M19 evidence.
11. **Deferred/external boundary:** Pass. D-043, other capabilities and every
    remote mutation remain separately inactive/gated.
12. **Document sequence:** Pass. ADR-018 revision 4 precedes PLAN-021; no new
    SPEC or ADR-010 revision is required.

**Result:** zero findings and no unresolved change request.

## 12. Accepted effect

Acceptance:

1. selects M19 as the next milestone and promotes only the exact section 2
   release boundary for normative design;
2. authorizes drafting and completely reviewing ADR-018 revision 4;
3. does not yet authorize PLAN-021 drafting, candidate preparation, code,
   commit, push, registry reads/writes, publication or tag mutation;
4. preserves SPEC-008, ADR-010, package versions/peers and all Experimental
   classifications unchanged; and
5. leaves D-043, further features, other targets/kits and repository
   publication Deferred.
