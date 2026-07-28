# PLAN-025 checkpoint 8 pre-dispatch review — Cycles 1–2

- **Date:** 2026-07-27
- **State:** Accepted pre-dispatch gate after cycle 2 passed with zero findings
- **Scope:** Read-only protected-source, workflow, environment, trust,
  candidate and registry verification
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** Exact dispatch inputs are ready; no workflow was dispatched

## Exact proposed dispatch

```text
workflow: npm-publish.yml
ref: main
release: m23
source_commit: 4bcb6eabed76d8bc2fa877236d10b7831cbb6f00
```

Dispatch requires separate immediate authorization. The later
`npm-publish` environment approval remains another separate external action.

## Cycle 1

The first complete local pass found only formatting drift in
`deferred-decisions.md`. Readiness, release tests, public/workflow policy,
selected candidate evidence, documentation, lint and diff checks otherwise
passed. The formatting finding was corrected and the complete review restarted.

## Cycle 2 — zero findings

1. **Protected source:** remote
   `main@4bcb6eabed76d8bc2fa877236d10b7831cbb6f00` and
   `develop@6d00ed02d3a641eb9153e14cd2ac0f094a15be8d` remain exact; `main`
   is an ancestor of `develop` and both have tree
   `45da57055ade2bfb34d6b5acafbe1fd0d3d16a94`.
2. **Workflow:** `.github/workflows/npm-publish.yml` is active on `main`.
   Remote blob `428704200c80812b971aebd6caf706aff79e753c` equals the selected
   protected-main blob. The workflow remains manual, SHA-pinned,
   GitHub-hosted, token-free, stage-only and grants `id-token: write` only to
   its environment-gated stage job.
3. **Environment:** exact environment `npm-publish` requires reviewer
   `rabassoft` and its only custom deployment branch policy is `main`.
4. **Trust:** operator-confirmed final observations show exactly one relation
   per package for `rabassoft/schema-engine`, `npm-publish.yml`,
   `npm-publish`, staged publishing only and no direct publishing.
5. **Candidates:** all three selected tarballs match
   `.release/0.4.1/candidates.json`, which records exact protected
   `sourceCommit` `4bcb6eabed76d8bc2fa877236d10b7831cbb6f00`.
6. **Registry:** all three stage lists remain `[]`; core/base `0.4.1` and pilot
   `0.2.1` remain absent with E404.
7. **Authority:** all three packages retain only
   `ricardrabasso: read-write`.
8. **Readiness:** exact simulated protected-main M23 readiness passes with
   Node `22.23.1`, npm `11.18.0` and the reviewed descriptor/manifests.
9. **Local policy:** formatting, 281-document/919-link documentation, lint,
   40 release-tooling tests, 23 public/readiness/workflow tests, 761-file
   public-tree policy, workflow policy, all three selected-tarball evidence
   checks and diff checks pass.
10. **Boundary:** no workflow dispatch, environment approval, stage, package
    approval, publication, alias or token mutation occurred.

The checkpoint-8 pre-dispatch gate is Accepted with zero findings. This does
not complete checkpoint 8 and does not authorize the dispatch.
