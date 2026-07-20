# PLAN-023 checkpoint 3 complete review — Cycles 1–2

- **Date:** 2026-07-20
- **Plan:** Approved
  [`PLAN-023 revision 0`](../plans/023-coordinated-experimental-0-4-release.md)
- **Checkpoint:** 3 — complete local M21 candidate gate
- **Authority:** SPEC-009 v0.1.0, ADR-018 revision 5, ADR-025 revision 0,
  ADR-010 revision 1 and completed PLAN-022/M20
- **Toolchain:** Node 22.23.1; npm 10.9.8; pnpm 10.28.2
- **Outcome:** Cycle 2 passed every area and all 27 SPEC-009 rows with zero
  findings

## Correction and complete-review restart

- **Cycle 1** passed the implementation, package, consumer and candidate matrix
  but found the active release notes and handoff still described the required
  pre-candidate checkpoint-2 state after `.release/0.4.0` had been created.
- The active documents and fail-closed checks were reconciled to identify the
  deterministic artifacts as dirty-tree comparison inputs with
  `sourceCommit: null`, not selected publication evidence.
- **Cycle 2** repeated the complete applicable matrix, all 27 conformance rows,
  candidate byte comparison, documentation and complete diff review. It passed
  with zero findings and no unresolved change request.

## Cycle 2 — complete zero-finding pass

### 1. Authority, scope and external boundary

Pass. Work is limited to approved PLAN-023 checkpoint 3 and completed
M20/SPEC-009. No runtime, schema, UI Schema, diagnostic, operation, export,
entry-point, peer, support-range or stability contract changed. No Git,
registry, authentication, publication, tag, settings or external action
occurred.

### 2. Frozen workspace and toolchain

Pass. The exact frozen lockfile installed offline with lifecycle scripts
disabled and zero registry downloads. Node 22.23.1, npm 10.9.8 and pnpm 10.28.2
are recorded. Formatting, documentation, lint, types, builds and diff checks
pass. The initial workspace-local pnpm store lacked one cached tarball; the
accepted global offline store supplied it without network access.

### 3. Exact candidate inventory and deterministic bytes

Pass. Two consecutive preparations produced the same ignored artifacts:

| Package                                       | Bytes   | SHA-512                                                                                                                            |
| --------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `@rabassoft/schema-engine@0.4.0`              | 218,187 | `b7cf651a4da9e26956f75fdf8e83ee8abba84423202a24cb9d9fc8ed50ee7d6eb1d64136378adc229f24362d3d525d432a630308cff5ba2ced7b2048e2b046da` |
| `@rabassoft/schema-engine-angular@0.4.0`      | 126,564 | `8c63d9726f577522dbfdbf0e79218070b85a4e4024fbe5e5ea6ab84051b8f61c4308d77b59ae18a66e5f4d78e799af8fb45df25447dbb3534ab8a09c7662d6a0` |
| `@rabassoft/schema-engine-angular-aria@0.2.0` | 28,618  | `7456894807d472d174a1168e749a8fc2aadaea4e0b0cbd4d9cf4b1d36a8ed9f0be38502868d8f20b2deb08d430a21fa2c51b0eab8c67b91b096212b0b932995e` |

Evidence records `baseCommit`
`ce3ef3dd3f9154c95896bcefa22e31b4f293eda0`, `sourceCommit: null`,
`neutralDryRun: true`, exact integrity strings and no local username. These are
dirty-tree comparison inputs, not selected publishable evidence.

### 4. Packing, exports, peers and isolation

Pass. Package smoke, external package consumer, immutable published M19
baseline and M21 public/private artifact checks prove exact members, exports,
versions, dependencies, peers, declarations, styles and absence of private
applications, tests and `.ai-docs` from all tarballs.

### 5. Corresponding Source and executable reconstruction

Pass. Each package rebuilds independently and offline from extracted
Corresponding Source in dependency order. Rebuilt declarations, exports and
behavior match shipped outputs; pilot stylesheet bytes and all six Public
Experimental properties match.

### 6. Licensing, security and neutral dry runs

Pass. LICENSE, NOTICE, SOURCE and source ownership are exact. Tracked/packed
scans found no secret, credential, inaccessible private link, personal data or
unexpected material. Original and freshly created neutral-directory
basename-relative `npm publish --dry-run --access public --tag next
--provenance=false` rehearsals pass for every inspected artifact.

### 7. Frozen consumers and compatibility

Pass. M18 and M20 lower/latest lanes use exact Angular 22.0.6/22.0.7 with
Aria/CDK 22.0.5, install offline and pass native plus pilot partial
declarations, strict types, DOM assertions, production builds and Chromium.
The local `file:` candidate tarballs are the only install inputs not reused
from the frozen package store.

### 8. Workspace and reference evidence

Pass. The workspace has 689 passing tests: core 454, validator 7, scenarios 41,
base Angular 106, Standard 53, Angular reference 26 and Angular Aria 2. Eight
snippets across two targets and 540 import boundaries pass. Angular Chromium
passes 8/8 and Standard Chromium 6/6 independently.

### 9. Public/Internal migration inventory

Pass. Only SPEC-009's raw object/item `presentation`, generic presentation
family, required normalized owner forests, named template alias, widened text
domains and Angular ordinary-or-template SPI are Public migrations. Concrete
owners/items, addresses, runtime authority, native hosts, claims, caches and
projection lifecycle remain Internal. The pilot provider/style boundary is
unchanged; Standard and all applications remain private.

### 10. Core conformance

Pass. Local compiler, contract, operation and hostile-input suites prove exact
owner-local membership, namespaces, keys, deterministic diagnostics, atomic
fallback, deep immutability, identity preservation, manual-definition policy
and non-invocation of runtime/validation authority.

### 11. Projection and lifecycle conformance

Pass. Native Angular, Standard and Angular Aria evidence proves exact stable
IDs, text reuse and failure behavior, accessibility semantics, initial state,
mounted descendants, movement preservation, insertion/removal/reinsertion,
cleanup, mandatory fallback and fixed host-region focus recovery.

### 12. Regression, Deferred and release boundaries

Pass. The 22-row SPEC-008/M18 regression, exact M19 artifact/source baseline,
runtime/operation/scope/validation invariance and package/style gates all pass.
Remaining D-011/D-025, D-012, React, Vue, D-026, D-035, D-043 and D-045 remain
inactive. Candidate preparation does not authorize Git or npm state.

### 13. Documentation and persistent state

Pass. Release notes, plan, STATUS, ROADMAP, Deferred, index and WORKLOG agree
that checkpoints 1–3 are complete, the candidates are dirty-tree inputs with
no source commit, and checkpoint 4 remains separately gated. Fail-closed checks
reject the stale pre-candidate phrases.

### 14. Complete diff and isolation

Pass. The entire tracked/untracked M20/M21 scope was inspected. The unrelated
`angular.json` analytics opt-out remains explicitly preserved. The lockfile has
no diff, `.release/0.4.0` is ignored, and `git diff --check` passes.

## Repeated SPEC-009 row evidence

| Rows  | Direct repeated evidence                                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–2   | Local contract/compiler suites cover admitted depths and every default/order/authored owner forest.                                                      |
| 3–4   | Local compiler and invalid fixture cover cross-owner rejection, atomic structural children and independent nested owners.                                |
| 5–6   | Programmatic safety and serialized fixtures cover all kinds, hostile descriptors, cycles/reuse and exact diagnostics/fallback.                           |
| 7–8   | Contract/compiler regressions cover unsupported owners and independently valid/invalid root/ancestor/sibling/descendant forests.                         |
| 9–10  | Local contract and operation-conformance suites cover deep freeze, identity, qualified keys and every manual reason/owner/non-invocation case.           |
| 11–12 | Native and Standard suites cover label reuse/failure/locale/replacement and exact ordinary/item/template stable IDs.                                     |
| 13–16 | Native, Aria, Standard and M20 consumers cover initial state, mounted descendants, movement, insertion/removal/reinsertion and cleanup.                  |
| 17    | Independent Angular and Standard unit/Chromium suites cover roles, names, keyboard order and grid fallback.                                              |
| 18–19 | External declaration consumer and Angular resolver/projection suites cover narrowing, Internal owner context, provider/fallback/claims/no-retry/cleanup. |
| 20–21 | Dedicated lower/latest M20 native/pilot lanes and Aria package/style gates prove equivalence and unchanged pilot boundary.                               |
| 22–23 | Reference-boundary/shared-scenario checks and host tests prove Standard isolation plus fixed host regions/focus recovery.                                |
| 24    | The 689-test workspace and frozen M18/M19 matrices preserve runtime/state/scope/operation/validation and prior milestones.                               |
| 25    | Declarations, package/source/artifact checks, external consumer and migration READMEs pass.                                                              |
| 26    | Native Angular, Aria and Standard unit/build/Chromium lanes all pass independently.                                                                      |
| 27    | M21 candidate preparation is separately authorized delivery work; no Git, registry, authentication, publication, tag or external action occurred.        |

## Verification

- Frozen workspace install: `CI=true pnpm install --frozen-lockfile --offline
--ignore-scripts` — pass with external packages reused from an offline store.
- Formatting, documentation, lint, strict types, 689 workspace tests and all
  builds: pass.
- Package smoke, external consumer, immutable M19 baseline, M21 artifact/source
  rebuild and security audit: pass.
- Frozen M18 and M20 lower/latest native/pilot consumers: pass.
- Reference evidence: 8 snippets, 540 boundaries, 120 unit tests and 14
  Chromium tests: pass.
- Two preparations, candidate hashes/integrity, original/neutral dry runs,
  ignored evidence, lockfile audit, complete scope and `git diff --check`: pass.

Angular's 989.78 kB/Ajv warnings and Standard's 868.50 kB advisory remain known
observations. Esbuild IPC requires execution outside the restricted sandbox;
the official commands pass there.

## Outcome

Checkpoint 3 is complete with zero findings. The three deterministic dirty-tree
candidates are reviewed comparison inputs only and have no source commit. No
implementation task remains active. PLAN-023 checkpoint 4 must stop for
explicit authorization before scoped commit/private push and clean rebuild.
