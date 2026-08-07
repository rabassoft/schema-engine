// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import {
  cpSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceBuildDirectory = dirname(fileURLToPath(import.meta.url));
const reactPackage = resolve(sourceBuildDirectory, '..');
const corePackage = resolve(sourceBuildDirectory, '../../../core/package');
const coreManifest = JSON.parse(
  readFileSync(join(corePackage, 'package.json'), 'utf8'),
);
const reactManifest = JSON.parse(
  readFileSync(join(reactPackage, 'package.json'), 'utf8'),
);

assert.equal(coreManifest.name, '@rabassoft/schema-engine');
assert.equal(
  reactManifest.peerDependencies['@rabassoft/schema-engine'],
  coreManifest.version,
);
assert.equal(reactManifest.private, true);

const packageNodeModules = join(reactPackage, 'node_modules');
mkdirSync(packageNodeModules, { recursive: true });

const coreTarget = join(packageNodeModules, '@rabassoft/schema-engine');
rmSync(coreTarget, { recursive: true, force: true });
mkdirSync(coreTarget, { recursive: true });
cpSync(join(corePackage, 'rebuilt-dist'), join(coreTarget, 'dist'), {
  recursive: true,
});
writeFileSync(
  join(coreTarget, 'package.json'),
  `${JSON.stringify(
    {
      name: coreManifest.name,
      version: coreManifest.version,
      private: true,
      type: coreManifest.type,
      exports: coreManifest.exports,
    },
    null,
    2,
  )}\n`,
);

for (const dependency of [
  'react',
  'react-dom',
  '@types/react',
  '@types/react-dom',
]) {
  const source = realpathSync(
    join(sourceBuildDirectory, 'node_modules', dependency),
  );
  const target = join(packageNodeModules, dependency);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(target), { recursive: true });
  symlinkSync(source, target, 'dir');
}
