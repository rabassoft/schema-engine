# PLAN-025 checkpoint 15 base token-policy review

- **Date:** 2026-07-30
- **State:** Accepted after cycle 2 passed with zero findings
- **Scope:** Base Angular publishing-access restriction and post-update
  non-drift verification
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted core transition
  [`review 205`](./205-plan-025-checkpoint-15-core-token-policy-review.md)
- **Outcome:** Core and base policy transitions complete; Angular Aria remains
  separately gated

## Transition evidence

Ricard executed only:

```text
npm access set mfa=publish @rabassoft/schema-engine-angular
```

Fresh authenticated npmjs.com observation confirms base Angular now selects
“Require two-factor authentication and disallow bypass 2fa tokens
(recommended).”

## Cycle 1 — finding and correction

The package-policy, trusted-publisher, access, token and alias evidence passed.
Final documentation inspection found:

| ID       | Finding                                                                              | Correction                                                                          |
| -------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| R206-F01 | `STATUS.md` retained the documentation counts from before review 205 was introduced. | Record the current review-206 matrix of 299 Markdown documents and 969 local links. |

Repeat the complete package-policy, trust, token, alias, documentation and diff
review after correction.

## Cycle 2 — complete repeated review

Every applicable area passes with zero findings:

1. Core and base Angular are public and both select the stronger publishing
   policy.
2. Angular Aria remains public and retains the weaker policy that permits a
   granular access token with bypass 2FA.
3. All three packages retain their exact stage-only trusted publishers for
   `rabassoft/schema-engine`, workflow `npm-publish.yml`, environment
   `npm-publish` and `npm stage publish` permission.
4. Authenticated identity remains `ricardrabasso` and `npm token list --json`
   remains empty.
5. Core/base aliases remain `next/latest: 0.4.1`; pilot aliases remain
   `next/latest: 0.2.1`.
6. No package access, trusted publisher, alias, publication, token, Git or
   GitHub state changed beyond the exact base policy.
7. Formatting, 299 Markdown documents, 969 local links, documentation and diff
   checks pass.

## Outcome

The base Angular checkpoint-15 policy transition is accepted with zero
findings. Stop for immediate explicit authorization to change only
`@rabassoft/schema-engine-angular-aria` to:

> Require two-factor authentication and disallow bypass 2fa tokens
