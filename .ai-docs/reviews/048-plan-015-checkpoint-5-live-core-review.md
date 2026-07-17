# Review 048 — PLAN-015 checkpoint 5 live core

- **Date:** 2026-07-16
- **Scope:** published core `0.2.0` and post-publication verification
- **Result:** Passed with zero findings

## Evidence reviewed

1. Public `@rabassoft/schema-engine@0.2.0` exists under `next`; `latest`
   remains `0.1.0`.
2. Downloaded bytes are identical to the selected 200245-byte candidate with
   SHA-512
   `155ae047c8ee949bddcaba412fcff90e4b65396a47f89f63e065e7b7814e8a8e0e2851d8e891465d12f69b54fa00192fe5884b163deb292aedec73f9d13e028a`.
3. Registry integrity matches, one registry signature is present, license is
   `AGPL-3.0-only`, and package source/notice boundaries remain complete.
4. Repository metadata and attestations/provenance are absent.
5. Public `_resolved` points only to neutral
   `/private/tmp/rabassoft-release-0.2.0-manual`; `_from` is the tarball
   basename. No user or workspace path is disclosed.
6. Exact core consumer and lower/upper Angular 22 consumers using the selected
   Angular candidate pass, including registry signature audit.
7. Angular `0.2.0` remains absent; no Angular, `latest`, Git or settings
   mutation occurred.

## Complete checkpoint review

Selected bytes, public metadata, signature, license/source, provenance,
repository/path disclosure, tags and consumers were reviewed together. The
complete pass produced zero findings. PLAN-015 checkpoint 5 is complete.
