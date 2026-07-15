# Building from Corresponding Source

This package includes its preferred TypeScript source in `src/` and the exact
package-local build harness in `source-build/`. It does not require the private
development repository.

Required tools:

- Node.js `22.23.1`
- pnpm `10.28.2`
- TypeScript `6.0.2` (installed by the frozen harness)

From the extracted package directory:

```sh
cd source-build
corepack pnpm install --frozen-lockfile
corepack pnpm run build
```

The rebuilt ESM JavaScript, declarations and source maps are written to
`rebuilt-dist/` beside `src/`. The release verifier compares its root exports,
declarations and consumer behavior with the shipped `dist/`.
