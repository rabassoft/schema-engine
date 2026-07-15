import assert from 'node:assert/strict';
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceBuildDirectory = dirname(fileURLToPath(import.meta.url));
const angularPackage = resolve(sourceBuildDirectory, '..');
const corePackage = resolve(sourceBuildDirectory, '../../../core/package');
const coreManifest = JSON.parse(
  readFileSync(join(corePackage, 'package.json'), 'utf8'),
);

assert.equal(coreManifest.name, '@rabassoft/schema-engine');
assert.equal(coreManifest.version, '0.1.0');

const target = join(angularPackage, 'node_modules/@rabassoft/schema-engine');
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(join(corePackage, 'rebuilt-dist'), join(target, 'dist'), {
  recursive: true,
});
writeFileSync(
  join(target, 'package.json'),
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
