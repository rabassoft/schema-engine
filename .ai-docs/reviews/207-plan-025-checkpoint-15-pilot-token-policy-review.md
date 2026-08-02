# PLAN-025 checkpoint 15 pilot token-policy review

- **Date:** 2026-07-30
- **State:** Accepted after cycle 1 passed with zero findings
- **Scope:** Angular Aria publishing-access restriction and complete
  checkpoint-15 non-drift verification
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted base transition
  [`review 206`](./206-plan-025-checkpoint-15-base-token-policy-review.md)
- **Outcome:** Checkpoint 15 complete; all three packages use the stronger
  publishing policy

## Transition evidence

Ricard executed only:

```text
npm access set mfa=publish @rabassoft/schema-engine-angular-aria
```

Fresh authenticated npmjs.com observation confirms Angular Aria now selects
“Require two-factor authentication and disallow bypass 2fa tokens
(recommended).”

## Cycle 1 — complete review

Every applicable area passes with zero findings:

1. Core, base Angular and Angular Aria are public and all three select the
   stronger publishing policy.
2. All three packages retain their exact trusted publisher for
   `rabassoft/schema-engine`, workflow `npm-publish.yml`, environment
   `npm-publish` and `npm stage publish` permission.
3. Authenticated identity remains `ricardrabasso` and `npm token list --json`
   remains empty.
4. Core/base aliases remain `next/latest: 0.4.1`; pilot aliases remain
   `next/latest: 0.2.1`.
5. No package access, trusted publisher, alias, publication, token, Git or
   GitHub state changed beyond the exact pilot policy.
6. Formatting, 300 Markdown documents, 971 local links, documentation and diff
   checks pass.

## Outcome

The Angular Aria policy transition and checkpoint 15 are accepted with zero
findings. Stop before checkpoint 16's complete read-only final closure. That
review grants no later release, Git tag, GitHub Release, backup deletion or
other external mutation.
