# Building from source

This package is a private, unreleased workspace source package while PLAN-037
implements its accepted contract checkpoint by checkpoint.
Build it from the repository root with the frozen workspace toolchain:

```sh
pnpm --filter @rabassoft/schema-engine-react build
```

The packed private artifact includes `source-build/`, an exact frozen harness
for isolated source reconstruction. The repository check packs the matching
local core source, rebuilds it first, prepares only its rebuilt Public root for
the React source, then compares the complete declaration inventory:

```sh
pnpm test:artifacts:react
```

Use `node scripts/verify-react-artifact.mjs --offline` only when every frozen
tarball is already present in the configured pnpm store. This reconstruction
does not make the package publishable and does not select `0.4.1` as its future
public core peer range; that version is asserted only as pnpm's deterministic
rewrite of the current private workspace relationship.
