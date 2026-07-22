# PLAN-024 checkpoint 8 settings review — Cycles 1–9

- **Date:** 2026-07-22
- **Plan:** Approved
  [`PLAN-024 revision 0`](../plans/024-sanitized-public-repository.md)
- **Checkpoint:** 8 — protected branches, Actions, environment and security
- **Authority:** Read-only preflight plus Ricard's separate explicit
  authorization of each completed checkpoint-8 settings group
- **Outcome:** Cycle 9 verified protected publication into `develop` with zero
  unresolved findings; promotion to `main` and reconciliation remain separately
  gated

## Exact public baseline

- Closure commit `64a1d15f2c4b4d0bb8da3846a518684731af67bc` is selected by
  local/remote `main` and `develop`; the worktree was clean after its atomic
  publication.
- GitHub CI runs `29899936584` (`develop`) and `29899936641` (`main`) both
  completed successfully. Each exposes exact required check `verify` from the
  GitHub Actions app, integration ID `15368`.
- Repository identity is public `rabassoft/schema-engine`, default `main`, with
  Issues enabled, Discussions disabled, all three merge methods enabled and
  merged-branch deletion disabled.

## Observed checkpoint-8 controls

- Repository rulesets: none. Ruleset read access succeeds, and GitHub's current
  public documentation confirms repository branch rulesets are available for
  public repositories on GitHub Free for organizations.
- Classic branch protection: neither `main` nor `develop` is protected.
- Actions: enabled for all actions with SHA pinning not enforced.
- Workflow defaults already satisfy the target: read-only `GITHUB_TOKEN` and
  Actions cannot approve pull-request reviews.
- Environments: none; `npm-publish` does not yet exist.
- Private vulnerability reporting: disabled.
- No repository, Actions, environment, security, npm or branch setting changed
  during this preflight.

## Recommended first mutation group

Create one active repository branch ruleset named
`long-lived-branch-protection`, targeting exactly `refs/heads/main` and
`refs/heads/develop`, with no bypass actor and these rules:

1. require changes through pull requests;
2. require zero approvals for the current solo-maintainer topology;
3. require all review conversations to be resolved;
4. allow only merge and squash PR merge methods;
5. require successful `verify` from GitHub Actions integration `15368`;
6. require the PR branch to be up to date before merging;
7. prohibit branch deletion; and
8. prohibit force pushes.

Do not require linear history because PLAN-024 preserves merge-commit promotion
from `develop` to `main`. Do not add signed-commit, deployment, code-scanning,
approval-count or bypass requirements outside the approved contract.

After explicit approval, create only this ruleset and re-read the ruleset plus
effective rules for both target branches. Any unsupported field, wrong target,
missing status source or unexpected bypass stops before the next setting group.

## Cycle 1 complete review

Authority, exact refs, successful check identity, account/repository scope,
ruleset/classic availability, Actions defaults, environments, vulnerability
reporting, merge settings, PLAN-024/ADR-026 compatibility and mutation isolation
were reviewed together. Cycle 1 found no unresolved issue and authorizes no
mutation by itself.

## Cycle 2 — branch ruleset mutation and verification

Ricard explicitly authorized only the recommended first mutation group. The
pre-mutation gate reobserved authenticated `rabassoft`, aligned exact refs at
`64a1d15`, zero rulesets and two successful `verify` checks from GitHub Actions
integration `15368`.

GitHub created active repository ruleset `19534784`,
`long-lived-branch-protection`, with exact targets `refs/heads/main` and
`refs/heads/develop`, no bypass actor and `current_user_can_bypass: never`.
Both branches expose the same four effective rules:

1. deletion prohibited;
2. non-fast-forward/force-push prohibited;
3. pull request required with zero approvals, resolved conversations and only
   merge/squash methods; and
4. strict successful `verify` required from integration `15368`.

Read-only verification found both refs unchanged at `64a1d15`, public/default
identity and repository features unchanged, workflow permissions still
read-only without PR approval, Actions still all/no-SHA-pin, zero environments
and private vulnerability reporting still disabled. The first mutation group
passes with zero unresolved findings.

PLAN-024's workflow-default group already matches its target and requires no
mutation. The next actual setting group—selected GitHub-owned actions with full
SHA pinning—remains separately gated.

## Cycle 3 — public and local operator-documentation boundary

Ricard accepted an additional stable operating rule before the next setting
mutation. Basic GitHub configuration, rule IDs, check identities, action SHAs
and verification evidence remain tracked because they are non-secret,
reproducible public state. Owner-specific operational context may instead use
ignored `.local-docs/` with these boundaries:

- the directory is non-canonical and may not duplicate current public state;
- tokens, passwords, OTPs, keys and recovery codes remain in a password manager;
- only private paths, credential-entry references and recovery procedures are
  suitable local notes; and
- agents do not read the directory without explicit task-scoped authorization.

`.gitignore` excludes the complete directory, public-tree policy rejects it if
tracked, and a focused regression covers that rejection. The local directory
and starter runbook use owner-only `0700`/`0600` permissions and Git confirms
the file is ignored. The documentation verifier also excludes the directory so
routine automation does not read private notes. Cycle 3 repeats the complete
applicable documentation, policy, formatting and diff boundary with zero
unresolved findings.

## Cycle 4 — selected Actions and full-SHA enforcement

Ricard explicitly authorized the next Actions mutation group after cycle 3.
Pre-mutation observation retained exact refs `64a1d15`, active ruleset
`19534784`, read-only workflow defaults and the two reviewed full-SHA `uses`
identities in both workflow files.

The coordinated fail-closed mutation:

1. retained Actions enabled, selected-use only and full-SHA pinning required;
   and
2. disabled blanket GitHub-owned/verified actions while allowing exactly
   `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1` and
   `actions/setup-node@820762786026740c76f36085b0efc47a31fe5020`.

Read-only verification observes `allowed_actions: selected`,
`sha_pinning_required: true`, both exact patterns and no broad GitHub-owned or
verified-creator allowance. Workflow permissions remain read-only without PR
approval; ruleset/ref/repository/merge/environment/vulnerability state did not
drift. Cycle 4 passes with zero unresolved findings.

The protected `npm-publish` environment remains the next separately gated
mutation group. No npm setting, trusted publisher, secret or publication action
occurred.

## Cycle 5 — protected npm-publish environment

Ricard explicitly authorized only the environment group. Pre-mutation evidence
retained exact refs/ruleset and the cycle-4 Actions policy, observed zero
environments and selected authenticated administrator `rabassoft` user ID
`304027868` as the sole eligible reviewer.

GitHub created environment `npm-publish` ID `18549660922` with:

- required reviewer `rabassoft`/`304027868`;
- `prevent_self_review: false` and zero wait timer;
- custom deployment branch policies enabled; and
- exactly one branch policy, ID `55295302`, matching branch `main` only.

The environment contains zero secrets and zero variables. GitHub reports its
standard `can_admins_bypass: true`; PLAN-024 did not authorize changing that
separate control, and the accepted solo-maintainer model already permits the
same authenticated user to self-approve. No stronger claim is made.

Read-only verification retains exact refs, ruleset, Actions allowlist/pinning,
repository/merge features and disabled vulnerability reporting. No npm setting,
trusted publisher, credential or publication action occurred. Cycle 5 passes
with zero unresolved findings.

Private vulnerability reporting is the next separately gated mutation. Issues
enabled and Discussions disabled already match PLAN-024 without mutation.

## Cycle 6 — private vulnerability reporting

Ricard explicitly authorized only enabling private vulnerability reporting.
The pre-mutation gate retained exact refs, ruleset, Actions and environment
state and observed the control disabled.

GitHub enabled Private Vulnerability Reporting. Read-only verification reports
`enabled: true`, retains Issues enabled and Discussions disabled, and finds no
drift in refs, ruleset, Actions allowlist/pinning, workflow permissions,
environment/reviewer/branch policy or repository merge settings. No npm,
credential, package or publication action occurred.

Issues/Discussions therefore require no mutation. The final repository merge
settings group remains separately gated: keep merge and squash, disable rebase
and delete merged short-lived branches.

## Cycle 7 — merge settings and complete settings review

Ricard explicitly authorized the final settings group. The pre-mutation gate
retained exact refs and every cycle-2 through cycle-6 control. One repository
update retained merge commits and squash merge, disabled rebase merge and
enabled automatic deletion of merged branches.

The active ruleset independently prohibits deletion of `main` and `develop`, so
automatic deletion applies only to merged short-lived branches. Merge commits
remain available for the accepted `develop` to `main` promotion topology, while
ruleset PR methods and repository methods now agree on merge/squash only.

The complete read-only settings review observes together:

- public repository, default `main`, exact aligned refs and Issues on/
  Discussions off;
- active no-bypass ruleset `19534784` with the same four effective rules on
  `main` and `develop`;
- read-only workflow defaults, no Actions PR approval, selected-use/full-SHA and
  the two exact action identities only;
- protected environment `18549660922`, required `rabassoft` reviewer,
  self-review allowed, exact `main` branch policy and zero secrets/variables;
- Private Vulnerability Reporting enabled; and
- merge/squash enabled, rebase disabled and merged-branch deletion enabled.

No npm, trusted publisher, package, credential, tag, release or source behavior
changed. Cycle 7 passes the complete settings boundary with zero unresolved
findings. Checkpoint 8 remains active until this evidence is committed on a
short-lived branch, passes CI and is merged through protected PRs as required by
PLAN-024.

## Cycle 8 — complete local evidence review

After the settings boundary converged, the complete applicable local matrix was
repeated against the reviewed evidence. Build, lint, strict types, workspace and
reference tests, package/source smoke tests, release/publication tooling,
public-tree policy, snippets, boundaries, documentation links, formatting,
workflow policy and diff checks all pass. The focused local-documentation policy
regression is included in the 12 passing public-repository tests; publication
tool fixtures independently verify redacted secret detection, clean-history
acceptance and deterministic mapped rewriting.

Angular builds were executed outside the restricted sandbox because esbuild IPC
cannot run inside it. Their existing bundle-size and Ajv CommonJS warnings, plus
Standard's existing Vite chunk advisory, remain observations rather than
failures. No npm operation or external setting mutation occurred during this
cycle. Cycle 8 passes the complete applicable review with zero unresolved
findings and leaves only the separately authorized protected publication flow.

## Cycle 9 — protected publication into develop

Ricard authorized the reviewed branch, commit, push and protected pull request,
then separately authorized readiness and squash merge. Branch
`codex/plan-024-checkpoint-8` published Rabassoft-authored commit `e6bb6b5` and
opened PR [#1](https://github.com/rabassoft/schema-engine/pull/1) into
`develop`. Required check `verify` passed in run `29905263489` before GitHub
allowed the protected merge.

GitHub created squash commit
`59f7122b24a7c9f9a5d6e1280c608232978923da` on protected `develop`, deleted the
remote short-lived branch and triggered push run `29912959904`; its complete
`verify` job passed in 4m58s. The local checkout fast-forwarded to the exact
remote commit with a clean tree before this state-only follow-up. No setting,
npm, package, tag, release or source behavior changed. Cycle 9 passes the
protected `develop` publication boundary with zero unresolved findings;
`main` promotion and reconciliation remain unexecuted and separately gated.
