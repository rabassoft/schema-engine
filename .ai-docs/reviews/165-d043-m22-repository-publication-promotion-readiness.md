# D-043/M22 repository publication promotion-readiness review — Cycles 1–2

- **Date:** 2026-07-21
- **State:** Accepted for normative design after cycle 2
- **Demand:** Make the package source independently inspectable and prepare a
  secure, repeatable release path before adding another framework line
- **Authority reviewed:** ADR-009, ADR-010, ADR-018 revision 5, D-043,
  completed PLAN-023, review 164, current repository history/tree, GitHub
  read-only settings and public package metadata
- **Outcome:** Cycle 2 passed the promotion boundary with zero findings; one
  material history-publication choice remains before ADR-026 can be drafted

## Cycle 1 findings and corrections

| ID       | Finding                                                                                                      | Correction                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| R165-F01 | STATUS and ROADMAP still required prioritization after Ricard selected D-043 as the next milestone.          | Recorded D-043 as M22 for normative design only and retained every local, GitHub, npm, history-rewrite and publication action behind later gates.   |
| R165-F02 | The Deferred register did not expose the selected design boundary or the required public-history decision.   | Promoted only the reviewed boundary and made the existing-history versus clean-public-lineage choice an explicit prerequisite for ADR-026.          |
| R165-F03 | Reachable history contains one historical local absolute path and all 235 `.ai-docs` files would be exposed. | Rejected publication as-is; required an isolated, fail-closed history/content audit and a deliberate public-documentation policy before visibility. |

## 1. Readiness conclusion

Promote D-043 only as **M22 repository sanitization, public-source and secure
release design**. The promotion authorizes drafting and reviewing ADR-026 once
the material history model below is selected. It does not authorize a SPEC,
implementation plan, history rewrite, branch update, workflow, repository
visibility change, GitHub/npm setting, package manifest change, release,
commit or push.

No behavioral SPEC is required: M22 changes repository distribution and
release operations, not runtime, API, schema, UI Schema, validation, rendering
or framework compatibility. ADR-026 must explicitly revise or supersede the
private-repository clauses of ADR-018; those clauses remain authoritative until
that coordinated decision is accepted.

## 2. Observed baseline

- The private repository has 62 reachable commits. `develop` is one local
  commit ahead of `origin/develop`; `main` is the GitHub default and still
  points to the initial repository commit. There are no Git tags.
- All reachable commits use the intended `Rabassoft
<ricard@rabassoft.com>` identity.
- A filename and content-pattern scan found no reachable credential, npm/GitHub
  token, private key, registry auth line or credential-like file. Dedicated
  secret scanners are not installed, so this heuristic result is necessary but
  not sufficient publication evidence.
- Reachable history contains one historical local absolute path in review 132.
  Public identity/contact references are intentional, but every occurrence
  still requires classification under the final public-data policy.
- `.ai-docs` contains 235 tracked files (about 3.3 MiB in the current tree),
  including the append-only worklog, internal reviews and release evidence.
  Publishing the existing history necessarily publishes their historical
  versions even if they are removed from the current tree.
- The root has AGPL-3.0-only licensing, but no `SECURITY.md`,
  `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, governance/support policy or GitHub
  community files.
- GitHub is private with `main` as default, Issues enabled, Discussions
  disabled and both `main` and `develop` unprotected. Actions allow all actions
  without SHA pinning. Merge, squash and rebase are all enabled. Rulesets are
  unavailable on the current private-repository plan and must be rechecked
  after any visibility/plan transition.
- Published package metadata intentionally has no repository/provenance claim
  under ADR-018. Existing immutable versions cannot acquire corrected manifest
  metadata retroactively; metadata and provenance start with a future version.
- Local unreachable Git objects exist. They are not part of reachable history,
  but any sanitization must run from an isolated mirror/clone and must not
  infer public safety from the current local object database.

## 3. Material history-publication choice

ADR-026 cannot be drafted neutrally until one of these materially different
models is selected:

### A. Preserve the existing reachable history after sanitization — recommended

Keep commit continuity and attribution. Audit every reachable blob with a
dedicated scanner, define whether `.ai-docs` is public, rewrite only findings
that violate that policy in an isolated mirror, then prove the resulting
history/tree before any force update or visibility change.

This is preferred because the history is small, has one consistent author and
the heuristic audit found no credential material. It preserves traceability
between published source commits, reviews and future provenance. Its cost is
that any required rewrite changes commit IDs and needs an explicitly approved,
coordinated force update of both long-lived branches.

### B. Start a clean public lineage

Create a new sanitized root containing only the approved public tree and keep
the private repository as historical/internal evidence. This minimizes legacy
disclosure and avoids publishing `.ai-docs`, but breaks public commit continuity
with every existing release and requires an explicit repository/source-of-truth
transition. Future provenance can refer only to the new lineage.

### C. Publish the current repository as-is — rejected

The known local path, unclassified `.ai-docs` history, stale default branch,
missing public policies and absent branch protections make an immediate
visibility change fail closed.

## 4. Required ADR-026 boundary

After the user selects A or B, ADR-026 must decide:

1. the canonical public repository and branch topology, including the role of
   `main` and `develop`;
2. the public/private boundary for `.ai-docs`, evidence, reference apps and
   internal operational material;
3. the sanitization acceptance standard, dedicated scanner and response to a
   real secret or personal-data finding;
4. the no-external-code-contribution policy required by ADR-018 until a
   separately reviewed rights-assignment/CLA model exists;
5. Issues, security reporting, support, community and contribution policy;
6. protected branches/rulesets, reviewed changes and least-privilege Actions;
7. package `repository` metadata beginning only with a future immutable
   version whose source actually exists at the advertised public revision;
8. GitHub-hosted OIDC trusted publishing, environment/stage approval,
   write-protected human 2FA, token restrictions and provenance; and
9. fail-closed recovery if a repository, workflow, package or registry gate
   differs from the reviewed state.

ADR-026 must not choose a package version or publication sequence. Those belong
to a later release promotion and plan after repository preparation is proven.

## 5. Required later plan gates

A later plan may be prepared only after ADR-026 and the coordinated ADR-018
revision pass a complete review. It must keep these independently approved
gates:

1. reproducible reachable-history/content inventory and dedicated secret scan;
2. sanitization in an isolated clone or mirror, with before/after allowlists;
3. public-policy files and current-tree review;
4. any history rewrite and force update;
5. default-branch synchronization and branch/ruleset configuration;
6. repository visibility transition;
7. post-publication clone, license, link and policy verification;
8. future package metadata/version preparation;
9. trusted-publishing workflow and GitHub/npm settings, each separately; and
10. first provenance-bearing release and independent registry verification.

Every destructive, external, commit and push action remains an immediate manual
authorization point. A dry-run or accepted document never authorizes the next
gate.

## 6. Explicit exclusions

M22 does not activate runtime/API behavior, another framework, legacy Angular,
Stable status, a new package, a package version, publication, hosting, support
SLA, external code contributions or commercial-contract terms. It does not
reinterpret old npm versions as repository-backed or provenance-bearing.

## Cycle 2 — complete zero-finding pass

Pass. The review was repeated against ADR-018, D-043, the current reachable
history/tree, branch topology, read-only GitHub configuration and completed M21
state. The promoted boundary is design-only, publication as-is is rejected,
all mutating actions remain separately gated, and the A/B choice is stated as
the exact prerequisite to ADR-026. No authoritative conflict remains inside
the promoted boundary.

## Outcome

D-043 is promoted for M22 normative design only. The exact next action is for
Ricard to select option A (recommended) or B; then draft ADR-026 together with
the required ADR-018 revision. No implementation task is active.

## Selection follow-up — 21 July 2026

Ricard selected option A after this promotion review: preserve the sanitized
reachable history and publish `.ai-docs` after complete classification and
sanitization. ADR-026 revision 0 and ADR-018 revision 6 subsequently passed
review 166 cycle 3 with zero findings. This follow-up records the later choice;
it does not rewrite the review's original cycle-2 outcome or authorize
implementation.
