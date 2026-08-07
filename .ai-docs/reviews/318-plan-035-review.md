# Review 318: PLAN-035 controlled discriminated object alternatives

- **Date:** 2026-08-03
- **Document:**
  [`PLAN-035 revision 0`](../plans/035-controlled-discriminated-object-alternatives.md)
- **Authority:** Accepted
  [`SPEC-019 v0.1.0`](../specs/019-controlled-discriminated-object-alternatives.md),
  [`ADR-036 revision 1`](../adrs/036-controlled-discriminated-object-alternatives.md),
  [`ADR-005 revision 9`](../adrs/005-politica-dialecto-json-schema.md) and
  project delivery rules
- **Method:** two complete review cycles after one correction
- **Result:** cycle 2 passes all twelve areas and all 17 rows with zero findings

## Cycle 1

The complete plan was reviewed against all Accepted M33 authority, every
SPEC-019 conformance row, unchanged M1–M32 behavior and the repository delivery
workflow.

### Ownership audit

| Checkpoint | Rows  | Count |
| ---------- | ----- | ----- |
| 1          | 1–7   | 7     |
| 2          | 8–12  | 5     |
| 3          | 13–14 | 2     |
| 4          | 15    | 1     |
| 5          | 16    | 1     |
| 6          | 17    | 1     |

The union is exactly 1–17, every integer occurs once and every row has complete
first-owning deliverables and proportional evidence. Compiler output remains
deliberately runtime-inactive until checkpoint 2 closes manual validation,
selection and all inactive/stale defenses together.

### Finding 1 — accepted M33 contract was stale in onboarding

`pnpm docs:check` reported that root `README.md` and `.ai-docs/README.md` still
described M33 as having no active contract. That contradicted Accepted
SPEC-019 and prevented documentation verification.

**Correction:** both onboarding documents now report Accepted ADR-036 revision
1, ADR-005 revision 9 and SPEC-019 v0.1.0, while keeping implementation
inactive until PLAN-035 approval. Because persistent documentation changed,
the complete review restarted.

## Cycle 2 — complete repeated review

| Area                                                                                | Result |
| ----------------------------------------------------------------------------------- | ------ |
| 1. Accepted ADR-036/ADR-005/SPEC-019 authority and unchanged M1–M32 baselines       | Pass   |
| 2. Exact nested-property discriminator/oneOf boundary and broader exclusions        | Pass   |
| 3. All 17 conformance rows owned exactly once with complete first evidence          | Pass   |
| 4. Checkpoint order, intermediate buildability and no partial runtime exposure      | Pass   |
| 5. Public types, compiler catalogs, diagnostics, references, order and UI           | Pass   |
| 6. Manual definitions, selection, snapshots, state and inactive/stale defenses      | Pass   |
| 7. Scopes, issue ownership, validators, M29 helper and M30/M32 exclusions           | Pass   |
| 8. Definition-neutral Angular/Standard scenario, accessibility and Chromium parity  | Pass   |
| 9. Declarations, packages, built/clean/source consumers and migration               | Pass   |
| 10. Frozen graph, M1–M32 final matrix and persistent-state closure                  | Pass   |
| 11. Autonomous execution, stop conditions and dependency/release/external/Git gates | Pass   |
| 12. Documentation links, accepted versions, formatting and diff hygiene             | Pass   |

The repeated ownership audit is unchanged and exact: checkpoints 1–6 own
respectively rows 1–7, 8–12, 13–14, 15, 16 and 17. `pnpm docs:check` passes for
440 Markdown files and 1,241 local links before this review is added; the row
audit and `git diff --check` also pass.

## Conclusion

Cycle 2 produced zero findings and no unresolved change request. Under Ricard's
accepted zero-finding/no-scope-expansion rule, PLAN-035 revision 0 is Approved
and authorizes only checkpoints 1–6 in order. Dependency, manifest, lockfile,
version, release, publication, commit, push and external actions remain gated.
