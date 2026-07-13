# Schema Engine — Work Log

This document is append-only. New entries must be added at the top.

## 2026-07-13 — Repository setup state recorded

### Completed

- Recorded Git initialization, ignore policy, GitHub connection, commit attribution, and remote branch setup in persistent project state.
- Created a documentation-only commit on `develop`.
- Did not push the new documentation commit.

### Verification

- Confirmed only `STATUS.md` and `WORKLOG.md` changed after the initial baseline.
- Confirmed the documentation diff passes `git diff --check`.
- Confirmed `develop` is ahead of `origin/develop` after the commit.

### Pending

- Review and approve PLAN-001 before compiler implementation.
- Push the documentation commit only when explicitly requested.

## 2026-07-13 — Remote branch strategy completed

### Completed

- Pushed local `main` to `origin/main` at `a324d83`.
- Configured local `main` to track `origin/main`.
- Set `main` as the GitHub default stable/deployment branch.
- Kept `develop` as the checked-out integration branch tracking `origin/develop`.

### Verification

- Confirmed remote `main` and `develop` both point to `a324d83`.
- Confirmed both local branches track their matching upstreams.
- Confirmed GitHub reports `main` as the default branch.

### Pending

- Commit the persistent-state updates currently on `develop`.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Remote push state verified

### Completed

- Verified `origin/develop` exists at `a324d83` and local `develop` tracks it.
- Verified local `main` also points to `a324d83`.
- Identified that `origin/main` has not been pushed.
- Identified that GitHub selected `develop` as the default branch.

### Verification

- Compared local refs with `git ls-remote`.
- Queried the GitHub repository default branch.

### Pending

- Push `main` and change the GitHub default branch to `main` to match the documented workflow.
- Commit the persistent-state update after the remote branch setup is complete.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial commit attribution corrected

### Completed

- Configured the repository-local Git identity as `Rabassoft <ricard@rabassoft.com>`.
- Amended the initial commit to replace its author and committer identity.
- Realigned local `main` and `develop` to the amended commit.
- Did not push either branch.

### Verification

- Confirmed author and committer name and email on the amended commit.
- Confirmed `main` and `develop` reference the same commit.
- Confirmed the working tree is clean on `develop`.

### Pending

- Push `main` and `develop` only when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial baseline and develop branch created

### Completed

- Reviewed the initial documentation snapshot and common credential patterns.
- Created the initial commit on `main`.
- Created local branch `develop` from the initial baseline and switched to it.
- Documented `main` as stable/deployment-ready and `develop` as the development integration branch.
- Did not push either branch.

### Verification

- Confirmed ignored files were excluded from the commit.
- Confirmed `main` and `develop` reference the same initial commit.
- Confirmed the working tree is clean on `develop`.

### Pending

- Push `main` and `develop` only when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Private GitHub repository connected

### Completed

- Cancelled the authentication flow for the incorrect `Ricard-Rabasso` account.
- Authenticated GitHub CLI as `rabassoft`.
- Created the private repository `rabassoft/schema-engine`.
- Configured `https://github.com/rabassoft/schema-engine.git` as `origin` for fetch and push.
- Did not create or push a commit.

### Verification

- Confirmed GitHub reports `rabassoft/schema-engine` with `PRIVATE` visibility.
- Confirmed the local `origin` fetch and push URLs.
- Confirmed the local branch remains `main` with no commits.

### Pending

- Review the untracked files and create the initial commit when explicitly requested.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Initial Git ignore policy added

### Completed

- Added `.gitignore` entries for macOS metadata, dependencies, build/test output, tool caches, local environment files, debug logs, and IDE-local metadata.
- Kept the package-manager lockfile, `.env.example`, shared configuration, and conformance fixtures trackable.
- Did not stage or commit files.

### Verification

- Verified representative ignored paths with `git check-ignore`.
- Confirmed `.DS_Store` no longer appears in `git status`.
- Confirmed representative trackable paths are not ignored.

### Pending

- Review the untracked documentation set before creating the initial commit.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Git repository initialized

### Completed

- Initialized an empty Git repository with `main` as the initial branch.
- Left all project files untracked.
- Did not create a commit or configure a remote.

### Verification

- Confirmed the directory is a Git work tree.
- Confirmed the current branch is `main`.
- Confirmed the repository has no commits.

### Pending

- Decide whether to add a `.gitignore` before the initial commit.
- Review and approve PLAN-001 before compiler implementation.

## 2026-07-13 — Compiler-only plan proposed

### Completed

- Confirmed pnpm, a native workspace, `packages/core`, Vitest, and the public package name `@rabassoft/schema-engine`.
- Confirmed the object-parameter compiler API and root required/optional members.
- Accepted ADR-006 to record the package boundary and supersede the pre-SPEC package name.
- Updated SPEC-001 to Draft v0.1.3 with the approved compiler input and root optionality.
- Drafted decision-complete PLAN-001 with behavior, diagnostics, fixtures, implementation sequence, and acceptance commands.
- Confirmed that no workspace or production code was created.

### Verification

- Checked PLAN-001 against SPEC-001, accepted ADR-005 and ADR-006, and deferred decisions.
- Checked deterministic diagnostics, no-partial-result behavior, and first-prototype scope.
- Checked local Markdown links.

### Pending

- Review and approve PLAN-001.
- Do not create the workspace or implement `compileFormDefinition()` before approval.

## 2026-07-13 — ADR-005 accepted

### Completed

- Formally reviewed ADR-005 against SPEC-001 and the deferred-decisions register.
- Replaced the ambiguous semantic-keyword test with an explicit initial keyword classification.
- Clarified that ADR-005 does not decide how the source schema reaches `SchemaValidator`.
- Accepted ADR-005.
- Updated SPEC-001 to Draft v0.1.2 and removed dialect selection from its open decisions.
- Removed dialect selection from the deferred register's next decisions.

### Verification

- Checked the accepted ADR against SPEC-001 diagnostic and compilation contracts.
- Checked consistent ADR status, SPEC version, next action, and local Markdown links.
- Confirmed that no compiler code or monorepo was created.

### Pending

- Propose and approve a compiler-only implementation plan for `compileFormDefinition()`.
- Do not begin implementation before that plan is approved.

## 2026-07-13 — ADR-005 drafted

### Completed

- Approved the working policy for unknown JSON Schema keywords and missing `$schema`.
- Drafted ADR-005 with Draft 2020-12 as the reference dialect.
- Defined deterministic diagnostic codes and severities for dialect and keyword compatibility.
- Preserved external validation and the first-prototype subset boundaries.

### Verification

- Reviewed ADR-005 against SPEC-001 and the approved policy.
- Checked the ADR index, handoff, and project status for consistent next actions.
- Checked local Markdown links.

### Pending

- Formally review and accept ADR-005.
- Do not implement `compileFormDefinition()` before ADR-005 is accepted.

## 2026-07-13 — Documentation conflicts normalized

### Completed

- Kept SPEC-001 at Draft and synchronized its index at v0.1.1.
- Reserved global ADR-005 for the JSON Schema dialect and compatibility policy.
- Corrected stale documentation paths.
- Flagged conflicting pre-SPEC ADRs for later review without changing their decisions.
- Clarified that references to the planned dialect ADR as `ADR-001` in the historical entry below now refer to `ADR-005`.

### Verification

- Checked active references to the planned dialect ADR.
- Checked the SPEC status and version across canonical project documents.
- Checked referenced documentation paths.

### Pending

- Draft and review ADR-005.
- Do not implement `compileFormDefinition()` before ADR-005 is accepted.

## 2026-07-13 — Codex handoff prepared

### Completed

- Consolidated SPEC-001 v0.1.1.
- Added the deferred-decisions register.
- Added repository instructions for Codex.
- Identified ADR-001 as the next architectural deliverable.

### Verification

- Documentation reviewed by the project owner.
- ZIP integrity verified.

### Pending

- Draft and approve ADR-001.
- Do not create the monorepo before ADR-001 is approved.
