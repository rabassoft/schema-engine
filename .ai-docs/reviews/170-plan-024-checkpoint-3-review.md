# PLAN-024 checkpoint 3 review — In progress

- **Date:** 2026-07-22
- **Plan:** Approved
  [`PLAN-024 revision 0`](../plans/024-sanitized-public-repository.md)
- **Checkpoint:** 3 — clean private baseline commit and push
- **Authority:** Explicit Ricard baseline and corrective commit/private-push
  authorizations after review 169
- **State:** In progress; authorized corrective commit/private push and exact
  remote verification remain to execute

## Verified mutation

- Account/repository: active `rabassoft`, exact `rabassoft/schema-engine`
- Pre-mutation visibility/default: `PRIVATE`, `main`
- Commit: `300eb78b2bdd3033757b234f2937d66f77ed6f22`
- Author: `Rabassoft <ricard@rabassoft.com>`
- Subject: `chore: add public repository safeguards`
- Push: normal `develop`, `07755b4..300eb78`
- Post-push refs: `develop` equals `300eb78b2bdd3033757b234f2937d66f77ed6f22`;
  `main` remains `a324d830270cea30ed62b44fdb1af333e7c85a2d`
- Post-push repository: still `PRIVATE`, default `main`

No force, rewrite, tag, `main`, visibility, settings or npm mutation occurred.

## Cycle 1 finding and correction candidate

| ID       | Finding                                                                                                                                                      | Correction/evidence                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R170-F01 | Fresh detached install followed by the committed workflow order ran lint before internal `dist` declarations existed, producing unresolved-type lint errors. | Added `pnpm build` before lint in both workflows and hardened static checks. A complete clean candidate rerun then passed every intended success/fail-closed lane. |

The finding is in the already pushed ordinary commit, so it will not be hidden
through amend or force push. Checkpoint 3 remains open until a separately
authorized normal corrective commit is pushed and the exact resulting remote
commit passes a new clean detached zero-finding review.

## Corrected candidate verification

- Frozen lifecycle-free installation completed from the detached worktree.
- Gitleaks scanned 64 reachable commits and approximately 6.24 MB with no leak.
- Tool fixtures, twelve policy/workflow tests, exact pins, candidate tree and
  workflow guards pass.
- The known historical path and current npm metadata fail closed exactly as
  expected.
- Docs/links, format, explicit build-before-lint, strict types, complete tests/
  builds, package/source, release tooling, snippets, boundaries, Angular and
  Standard reference units plus diff checks pass.
- Only the three reviewed correction files differ from the pushed commit:
  `ci.yml`, `npm-publish.yml` and `workflow-policy.mjs`.

## Next gate

Execute the authorized corrective commit as Rabassoft with subject
`fix: build before lint in clean workflows` and push private `develop` normally.
Afterward recreate clean detached evidence at the exact new remote `develop`
hash; only a full zero-finding pass may complete checkpoint 3.
