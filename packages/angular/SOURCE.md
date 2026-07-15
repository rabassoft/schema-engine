# Building from Corresponding Source

This package includes its preferred TypeScript source in `src/` and the exact
package-local build harness in `source-build/`. It does not require the private
development repository.

Required tools:

- Node.js `22.23.1`
- pnpm `10.28.2`
- Angular compiler `22.0.6` and TypeScript `6.0.2` (installed by the frozen
  harness)
- the exact core package tarball, extracted and rebuilt from its own included
  source harness

Extract both tarballs into sibling `core/` and `angular/` directories, then
rebuild core first. The required layout is:

```text
core/package/
  rebuilt-dist/
angular/package/
  src/
  source-build/
```

Then, from the extracted Angular package directory:

```sh
cd source-build
corepack pnpm install --frozen-lockfile --modules-dir ../node_modules
corepack pnpm run build
```

The build script copies only the rebuilt core package metadata and output from
`core/package/` into the local Angular build environment before invoking ngc.
It never reads the private development workspace.

The rebuilt partial-Ivy ESM JavaScript, declarations and source maps are
written to `rebuilt-dist/` beside `src/`. The release verifier compares its root
exports, declarations and consumer behavior with the shipped `dist/`.
