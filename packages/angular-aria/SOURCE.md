# Building from Corresponding Source

The candidate includes its preferred TypeScript source in `src/` and a frozen
standalone partial-compilation harness in `source-build/`. It does not require
the private development repository.

Extract the coordinated core, base Angular and Angular Aria tarballs as sibling
directories with this layout:

```text
core/package/
angular/package/
pilot/package/
```

Rebuild core and base Angular first using their included instructions. Then,
from the extracted pilot package directory:

```sh
corepack pnpm install --frozen-lockfile --modules-dir ../node_modules
corepack pnpm run build
```

The pilot harness copies only the rebuilt package metadata and output of the
two coordinated Schema Engine packages into its local build environment before
invoking Angular partial compilation.

The accepted implementation toolchain is Node.js `22.23.1`, pnpm `10.28.2`,
TypeScript `6.0.2`, Angular compiler/core `22.0.6`, Angular Aria `22.0.5` and
Angular CDK `22.0.5`. Release verification checks the resolved Aria/CDK graph,
exact CDK peer patch, licenses and lifecycle metadata.

No package publication or registry state is implied by this source harness.
