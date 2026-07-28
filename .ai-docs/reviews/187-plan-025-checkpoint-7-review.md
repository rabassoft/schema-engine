# PLAN-025 checkpoint 7 review — Cycle 1

- **Date:** 2026-07-27
- **State:** Accepted after cycle 1 passed the complete review with zero
  findings
- **Scope:** Three separately authorized stage-only trusted-publisher relations
- **Plan:** [`PLAN-025 revision 0`](../plans/025-stage-only-trusted-publication.md)
- **Outcome:** Checkpoint 7 complete; checkpoint 8 remains separately gated

## Authorization and execution

Ricard separately authorized and executed one exact mutation per package in
dependency order:

```text
npm trust github @rabassoft/schema-engine --file npm-publish.yml --repo rabassoft/schema-engine --env npm-publish --allow-stage-publish
npm trust github @rabassoft/schema-engine-angular --file npm-publish.yml --repo rabassoft/schema-engine --env npm-publish --allow-stage-publish
npm trust github @rabassoft/schema-engine-angular-aria --file npm-publish.yml --repo rabassoft/schema-engine --env npm-publish --allow-stage-publish
```

No command used `--allow-publish`. Authorization for one package did not flow
to another package, stage, approval, alias or publication action.

## Post-observation

After every mutation, Ricard completed the three package-specific
`npm trust list --json` browser/security-key observations. The final repeated
observation confirms exactly one relation per package:

1. GitHub owner/repository `rabassoft/schema-engine`;
2. workflow `npm-publish.yml`;
3. environment `npm-publish`;
4. staged publishing allowed; and
5. direct publishing not allowed.

The final external read-only review also confirms:

- all three stage lists remain `[]`;
- all three packages retain only `ricardrabasso: read-write`;
- core/base `0.4.1` and pilot `0.2.1` remain absent with E404; and
- no stage, approval, publication, alias, token, GitHub setting or repository
  mutation accompanied the three intended trust mutations.

The first automated external reads encountered sandbox DNS `ENOTFOUND`; the
same reads passed outside the restricted sandbox. This was an execution
environment limitation, not a product or registry finding.

## Complete review

The complete checkpoint boundary passes with zero findings:

1. dependency order and per-package immediate authorization pass;
2. exact owner, repository, workflow and environment pass;
3. stage-only permission and prohibition of direct publish pass;
4. post-observation after each mutation passes;
5. other-package trust and package access did not drift;
6. stages and M23 versions remain absent; and
7. no later checkpoint action occurred.

Review 187 is Accepted and PLAN-025 checkpoint 7 is complete. Saved npm
configuration is not functional provenance proof; checkpoint 8 must reverify
the complete protected source, workflow, environment, candidates and registry
state before presenting one exact workflow dispatch for separate authorization.
