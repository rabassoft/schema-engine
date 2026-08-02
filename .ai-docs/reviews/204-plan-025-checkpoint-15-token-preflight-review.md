# PLAN-025 checkpoint 15 token-policy preflight review

- **Date:** 2026-07-30
- **State:** Accepted read-only preflight after cycle 3 passed with zero
  findings
- **Scope:** Package publish-access, trusted-publisher and token observation
  without settings mutation
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Requires:** Accepted
  [`review 203`](./203-plan-025-checkpoint-14-transition-review.md)
- **Outcome:** Checkpoint 15 preflight is satisfied; each of the three
  package-policy mutations remains separately gated

## Preflight evidence

### 1. Identity and account authentication

Pass. Authenticated npm CLI and npmjs.com access use `ricardrabasso`. The
account reports two-factor authentication mode `auth-and-writes`; its verified
email remains `ricard@rabassoft.com`.

### 2. Account and organization tokens

Pass. Authenticated `npm token list --json` returns zero tokens. No obsolete
automation token exists to identify or remove, so checkpoint 15 requires no
token-deletion mutation.

### 3. Core package policy

Pass. `@rabassoft/schema-engine` remains public and retains exactly one trusted
publisher for repository `rabassoft/schema-engine`, workflow
`npm-publish.yml`, environment `npm-publish` and stage-publish permission. Its
selected publishing policy still allows either 2FA or a granular access token
with bypass 2FA, so the stronger setting remains pending.

### 4. Base Angular package policy

Pass. `@rabassoft/schema-engine-angular` remains public and retains the same
exact stage-only trusted-publisher relation. Its selected publishing policy
also still permits a granular token with bypass 2FA, so the stronger setting
remains pending.

### 5. Angular Aria pilot package policy

Pass. `@rabassoft/schema-engine-angular-aria` remains public and retains the
same exact stage-only trusted-publisher relation. Its selected publishing
policy also still permits a granular token with bypass 2FA, so the stronger
setting remains pending.

### 6. Required target state

Pass. npmjs.com exposes the exact stronger choice as “Require two-factor
authentication and disallow bypass 2fa tokens (recommended).” Trusted
publishers remain compatible with that option. PLAN-025 therefore requires
three separately authorized package-setting mutations in dependency order:
core, base Angular and Angular Aria pilot.

### 7. Alias and access non-drift

Pass. Fresh registry observation after the browser preflight returns
core/base `next/latest: 0.4.1` and pilot `next/latest: 0.2.1`. All package
settings pages continue to report public access.

### 8. External boundary

Pass. Observation used authenticated read-only CLI and npmjs.com package
settings. No radio control, update button, token removal, access change,
trusted-publisher change, publication, dist-tag, Git or GitHub mutation
occurred.

## Cycle 1 — finding and correction

The package, account, trust, alias and external-boundary evidence passed. Final
documentation inspection found:

| ID       | Finding                                                                                 | Correction                                                                                          |
| -------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| R204-F01 | `ROADMAP.md` still presented the completed read-only preflight as M23's immediate gate. | Record review 204 and make only the separately gated core package-policy mutation the current gate. |

Repeat the complete package-policy, trust, token, alias, documentation and diff
review after correction.

## Cycle 2 — repeated review and finding

The package-policy, trust, token, alias, documentation-link and diff areas
passed. Formatting found:

| ID       | Finding                                         | Correction                                   |
| -------- | ----------------------------------------------- | -------------------------------------------- |
| R204-F02 | The new review document was not Prettier-clean. | Apply repository formatting to the document. |

Repeat the complete applicable review after correction.

## Cycle 3 — complete repeated review

Every applicable area passes with zero findings:

- authenticated `ricardrabasso` identity, `auth-and-writes` 2FA and verified
  email;
- zero account/organization tokens;
- public access and the exact stage-only trusted publisher on all three
  packages;
- the weaker bypass-token-compatible policy selected on all three packages;
- unchanged core/base `next/latest: 0.4.1` and pilot
  `next/latest: 0.2.1`;
- no external mutation;
- formatting, 297 Markdown documents and 965 local links; and
- documentation and diff checks.

## Outcome

Checkpoint 15's read-only preflight passes with zero findings. Stop for
immediate explicit authorization to change only the core package to:

> Require two-factor authentication and disallow bypass 2fa tokens

After that authorized update, reobserve core trust/access/policy and verify
base Angular, Angular Aria and all aliases remain unchanged before requesting
authorization for the next package.
