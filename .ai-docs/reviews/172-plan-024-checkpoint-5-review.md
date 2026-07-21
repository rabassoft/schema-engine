# PLAN-024 checkpoint 5 review — Cycles 1–3

- **Date:** 2026-07-22
- **Plan:** Approved
  [`PLAN-024 revision 0`](../plans/024-sanitized-public-repository.md)
- **Checkpoint:** 5 — deterministic sanitized candidate
- **Authority:** Explicit Ricard authorization after completed review 171
- **Outcome:** Cycle 3 passed the complete checkpoint boundary with zero
  unresolved findings

## Frozen input and private replacement

- Pre-sanitization `main`: `a324d830270cea30ed62b44fdb1af333e7c85a2d`
- Pre-sanitization `develop`:
  `a594f7333c99c1eb73fac8089ae68bb495d45bbb`
- Replacement category: `macos-home-path`
- Public replacement: `<local-home>/`
- Private replacement-specification SHA-256:
  `a3cd6d44f97d7aa4403b6ed1bdab308da5cd83bb857b35bde8d82e2da02c09e9`
- Specification isolation: owner-only directory/file modes `0700`/`0600`;
  one source occurrence and one unique source; private text never printed,
  committed or copied into evidence
- Tool: pinned git-filter-repo v2.47.0, script SHA-256
  `67447413e273fc76809289111748870b6f6072f08b17efe94863a92d810b7d94f`

## Rewrite and map evidence

- Two isolated mirrors produced identical rewritten refs and identical raw
  commit maps.
- Rewritten pre-evidence `main` remained
  `a324d830270cea30ed62b44fdb1af333e7c85a2d`.
- Rewritten pre-evidence `develop` became
  `335909357fd35f26f33ee72e5c7f35d3d0029861`.
- The raw map contains all 65 input commits: 60 IDs unchanged and five changed.
- Three changed commits contain the exact one-path substitution; two changed
  only because their mapped parent changed.
- Authors, emails, author dates, commit messages and mapped parent topology are
  preserved. No commit is deleted.
- Only `.ai-docs/reviews/132-plan-021-final-review.md` changes in historical
  tree content, and each of its five reachable versions equals the original
  with exactly the classified source replaced by `<local-home>/`.
- Raw commit-map SHA-256:
  `ee33203617855d78e900cd447f59a3a5d5f9f7de4b504a18509c339a5e44e917`.
- The normalized public
  [`HISTORY-REWRITE-MAP`](../project/HISTORY-REWRITE-MAP.md) includes all 65
  old/new pairs, the immutable M19/M21 source continuity and no private source.

The selected baseline is the single evidence commit containing this review and
the public map. Its exact object ID is necessarily external to the commit that
defines it and is frozen in the checkpoint-6 handoff before any mutation. Both
candidate `main` and `develop` refs select that same object.

## Cycles 1–2 findings and corrections

| ID       | Finding                                                                                                                                               | Correction                                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R172-F01 | The first continuity verifier incorrectly required every changed commit ID to have a changed tree, rejecting descendants changed only through parent. | Split content-changing from parent-only mappings, required exact mapped parents for all commits and allowed tree equality only for the two proven parent-only descendants. |
| R172-F02 | The first evidence commit inventory was recorded before adding this review, understating its final blob count and Gitleaks byte total.                | Recomputed evidence from the self-contained commit, corrected the inventory to 1,756 blobs/approximately 6.28 MB and repeated the complete review from a new clone.        |

## Cycle 3 — complete zero-unresolved-finding pass

- The corrected continuity verifier passes all 65 mappings and exact tree
  differences.
- Both independent mirrors produce the same evidence commit from identical
  content, author, message and timestamp; strict Git integrity passes after
  pruning unreachable pre-sanitization objects.
- Candidate reachable inventory contains 66 commits, 975 trees and 1,756 blobs
  with exactly two aligned long-lived refs and no tag.
- Pinned Gitleaks scans approximately 6.28 MB/66 commits with no leak.
- Prospective-tree and full reachable-history policies pass with zero findings;
  the previous review-132 history failure is absent.
- Publication-tool fixtures, twelve policy/workflow tests, exact Action pins,
  workflow guards and the complete public map pass.
- npm readiness still fails closed only on the intentionally absent future
  source authorization, repository metadata and provenance state.
- A fresh ordinary clone passes frozen lifecycle-free install, docs/links,
  format, explicit build-before-lint, strict types, complete workspace tests/
  builds, package/source, release tooling, snippets, boundaries and Angular/
  Standard reference-unit lanes. The clone remains clean.
- Existing Angular bundle/Ajv and Standard chunk-size warnings remain
  non-blocking observations.
- The private remote remains unchanged, `PRIVATE` and default `main`; no current
  checkout ref, remote ref, setting, package or npm state changed.

## Checkpoint-6 handoff

Before any destructive action, checkpoint 6 must reobserve both exact old
remote leases, private visibility, the selected self-identifying evidence
commit and a clean local tree. It then creates and verifies an owner-only bundle
of the old `main`/`develop` refs and records its SHA-256.

The only authorized candidate push form, after separate immediate approval, is
one atomic exact-lease operation from the selected candidate:

```text
git push --atomic \
  --force-with-lease=refs/heads/main:a324d830270cea30ed62b44fdb1af333e7c85a2d \
  --force-with-lease=refs/heads/develop:a594f7333c99c1eb73fac8089ae68bb495d45bbb \
  https://github.com/rabassoft/schema-engine.git \
  <selected-candidate>:refs/heads/main \
  <selected-candidate>:refs/heads/develop
```

`<selected-candidate>` is replaced with the exact self-identifying evidence
commit observed immediately before approval. No mirror, tag, note, backup ref
or other object is pushed. Local adoption occurs only after both remote refs
equal it: fetch, detach to that object, move local `main`/`develop` to their
verified remote equivalents and switch back to `develop`.

## Outcome

Checkpoint 5 is complete. Checkpoint 6 remains separately and immediately
gated because it creates a private recovery bundle, cleans/adopts the current
checkout and atomically replaces both remote refs. No such action is authorized
by this review.
