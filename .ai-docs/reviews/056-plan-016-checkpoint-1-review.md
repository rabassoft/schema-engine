# PLAN-016 checkpoint 1 complete review — Cycles 1–4

- **State:** Complete; cycle 4 passed with zero findings
- **Date:** 17 July 2026
- **Checkpoint:** PLAN-016 checkpoint 1 — workspace, toolchain and buildable
  skeletons
- **Authority:** Approved PLAN-016 revision 0 and Accepted ADR-020 revision 0
- **External gate:** exact dependency installation completed; Chromium remains
  uninstalled and gated until checkpoint 6

## 1. Cycle 1 findings

1. **R056-F001 — side-effect imports:** the initial boundary parser inspected
   `from` and dynamic imports but missed `import 'specifier'`, allowing a deep
   side-effect import to escape.
2. **R056-F002 — owner-relative paths:** the first correction treated valid
   relative imports inside public packages as physical cross-package imports
   and applied app-only deep-import rules to public package tests.

The parser now covers all three import forms, distinguishes public-package
internal paths from private-app boundaries and has focused positive/private/
deep-import tests. The complete review restarted.

## 2. Cycle 2 findings

1. **R056-F003 — Angular application compilation:** the initial app tsconfig did
   not include `main.ts` in the builder's program and inherited `noEmit` from a
   typecheck config. It now uses a strict application-specific compilation
   config with an explicit main file.
2. **R056-F004 — sandbox IPC:** esbuild deadlocked only inside the restricted
   command sandbox. The identical official builder passes outside it; direct
   esbuild and `ngc` checks showed no dependency/toolchain defect.

The build gate records that Angular application builds need the existing
outside-sandbox execution permission in this environment. No tool version,
builder or product architecture changed. The complete review restarted.

## 3. Cycle 3 finding

1. **R056-F005 — generated cache linting:** `.angular/cache` was ignored by Git
   but not by ESLint, so a post-serve lint inspected generated Angular/Vite
   dependencies.

ESLint now ignores `.angular`, Playwright reports and test results in parallel
with Git. Maintained application sources remain fully linted. The complete
review restarted.

## 4. Complete review — Cycle 4

1. **Pinned toolchain:** passes. Root has exact `@angular/cli` and
   `@angular/build` `22.0.6`, `@playwright/test` `1.61.1`; the frozen lockfile
   covers five workspaces without unrelated public dependency/version changes.
2. **Workspace privacy:** passes. Both exact Internal projects are
   `private: true`, have no publish configuration or pack/publish script and use
   the expected built catalog root/dependency directions.
3. **Official builder:** passes. `angular.json` contains one
   `@angular/build:application` browser target and one dev-server target, with
   no server/SSR/prerender/hydration/deployment target.
4. **Public boundaries:** passes. Core, Angular adapter and catalog are consumed
   by package root. The verifier inspected 279 imports and rejects private
   reverse edges, physical/deep/test imports and public artifact inclusion.
5. **Buildable skeleton:** passes. The standalone zoneless shell registers the
   Public native provider, invokes the Public compiler and consumes the built
   catalog. Strict app/catalog typechecks and recursive production build pass.
6. **Development loop:** passes. A real catalog source edit triggered `tsc`
   incremental compilation and the Angular dev-server rebuilt the linked ESM;
   reverting it triggered the same path. No manifest rewrite occurred.
7. **Regression and diff safety:** passes. Frozen install, formatting,
   documentation across 118 Markdown files/473 links, lint, focused tests,
   boundaries, typechecks, recursive builds and diff checks pass. Public
   package source/manifests are unchanged.

## 5. Result

Cycle 4 has zero findings, unresolved requests or documentation conflicts.
Checkpoint 1 is complete. Checkpoint 2 may implement only the Internal catalog
contract and safe authoring boundary; Chromium, Git and every later checkpoint
remain separately sequenced.
