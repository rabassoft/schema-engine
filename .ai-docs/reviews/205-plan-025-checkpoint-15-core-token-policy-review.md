# PLAN-025 checkpoint 15 core token-policy review

- **Date:** 2026-07-30
- **State:** Accepted after cycle 1 passed with zero findings
- **Scope:** Core package publishing-access restriction and post-update
  non-drift verification
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted checkpoint-15 preflight
  [`review 204`](./204-plan-025-checkpoint-15-token-preflight-review.md)
- **Outcome:** Core policy transition complete; base Angular and Angular Aria
  remain separately gated

## Transition evidence

Ricard executed only:

```text
npm access set mfa=publish @rabassoft/schema-engine
```

The first delegated attempt stopped before mutation because npm required an
OTP. Ricard then completed the exact command and its interactive authentication
manually.

Fresh authenticated npmjs.com observation confirms the core package now selects
“Require two-factor authentication and disallow bypass 2fa tokens
(recommended).”

## Cycle 1 — complete review

Every applicable area passes with zero findings:

1. `@rabassoft/schema-engine` remains public at `0.4.1`.
2. Core retains exactly one trusted publisher for
   `rabassoft/schema-engine`, workflow `npm-publish.yml`, environment
   `npm-publish` and `npm stage publish` permission.
3. Core alone selects the stronger publishing policy.
4. Base Angular and Angular Aria remain public and retain the weaker policy
   that permits a granular access token with bypass 2FA.
5. Both Angular packages retain their exact stage-only trusted publishers.
6. Authenticated identity remains `ricardrabasso` and `npm token list --json`
   remains empty.
7. Core/base aliases remain `next/latest: 0.4.1`; pilot aliases remain
   `next/latest: 0.2.1`.
8. No package access, trusted publisher, alias, publication, token, Git or
   GitHub state changed beyond the exact authorized core policy.
9. Formatting, 298 Markdown documents, 967 local links, documentation and diff
   checks pass.

## Outcome

The core checkpoint-15 policy transition is accepted with zero findings. Stop
for immediate explicit authorization to change only
`@rabassoft/schema-engine-angular` to:

> Require two-factor authentication and disallow bypass 2fa tokens

Angular Aria remains separately gated.
