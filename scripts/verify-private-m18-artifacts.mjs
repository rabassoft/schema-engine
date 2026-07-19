import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  listTarball,
  packReleaseCandidates,
  readTarballJson,
  readTarballText,
} from './release-candidate-utils.mjs';
import { loadM19ReleaseTarget } from './release-target.mjs';

const temporaryRoot = mkdtempSync(
  join(tmpdir(), 'schema-engine-m18-artifacts-'),
);
const forbiddenBaseText =
  /angular-aria|@angular\/aria|@angular\/cdk|styles\.css/iu;
const LICENSE_SHA256 =
  '0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0';

function fileInventory(tarball) {
  return listTarball(tarball)
    .filter((member) => !member.endsWith('/'))
    .sort();
}

function assertNoWorkspaceProtocol(manifest, label) {
  assert.equal(
    JSON.stringify(manifest).includes('workspace:'),
    false,
    `${label} retains a workspace protocol`,
  );
}

try {
  const { descriptor } = loadM19ReleaseTarget();
  const tarballs = packReleaseCandidates(temporaryRoot, descriptor);
  const core = readTarballJson(tarballs.core, 'package/package.json');
  const angular = readTarballJson(tarballs.angular, 'package/package.json');
  const pilot = readTarballJson(tarballs.angularAria, 'package/package.json');

  const targets = Object.fromEntries(
    descriptor.packages.map((target) => [target.role, target]),
  );
  assert.equal(core.version, targets.core.version);
  assert.equal(angular.version, targets.angular.version);
  assert.equal(pilot.version, targets.angularAria.version);
  assert.equal(pilot.license, 'AGPL-3.0-only');
  assertNoWorkspaceProtocol(core, 'core');
  assertNoWorkspaceProtocol(angular, 'base Angular');
  assertNoWorkspaceProtocol(pilot, 'Angular Aria pilot');
  assert.deepEqual(
    {
      '@rabassoft/schema-engine':
        angular.peerDependencies['@rabassoft/schema-engine'],
    },
    targets.angular.schemaEnginePeers,
  );
  assert.deepEqual(
    {
      '@rabassoft/schema-engine-angular':
        pilot.peerDependencies['@rabassoft/schema-engine-angular'],
    },
    targets.angularAria.schemaEnginePeers,
  );
  assert.deepEqual(
    {
      '@rabassoft/schema-engine-angular':
        pilot.devDependencies['@rabassoft/schema-engine-angular'],
    },
    targets.angularAria.schemaEngineDevelopment,
  );
  assert.deepEqual(pilot.exports, {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js',
    },
    './styles.css': './styles.css',
  });
  assert.deepEqual(pilot.dependencies, { tslib: '^2.8.1' });
  assert.deepEqual(pilot.peerDependencies, {
    '@angular/aria': '>=22.0.5 <23.0.0',
    '@angular/cdk': '>=22.0.5 <23.0.0',
    '@angular/core': '>=22.0.6 <23.0.0',
    '@rabassoft/schema-engine-angular': '^0.3.0',
  });
  assert.deepEqual(pilot.files, [
    'dist',
    'src',
    'source-build',
    'README.md',
    'SOURCE.md',
    'LICENSE',
    'NOTICE.md',
    'styles.css',
  ]);
  assert.deepEqual(fileInventory(tarballs.angularAria), [
    'package/LICENSE',
    'package/NOTICE.md',
    'package/README.md',
    'package/SOURCE.md',
    'package/dist/index.d.ts',
    'package/dist/index.d.ts.map',
    'package/dist/index.js',
    'package/dist/index.js.map',
    'package/package.json',
    'package/source-build/package.json',
    'package/source-build/pnpm-lock.yaml',
    'package/source-build/prepare-schema-engine.mjs',
    'package/source-build/tsconfig.json',
    'package/src/index.ts',
    'package/styles.css',
  ]);
  assert.equal(
    createHash('sha256')
      .update(readTarballText(tarballs.angularAria, 'package/LICENSE'))
      .digest('hex'),
    LICENSE_SHA256,
  );
  const sourceBuild = readTarballJson(
    tarballs.angularAria,
    'package/source-build/package.json',
  );
  assert.equal(sourceBuild.private, true);
  assert.equal(sourceBuild.packageManager, 'pnpm@10.28.2');
  assertNoWorkspaceProtocol(sourceBuild, 'pilot source build');

  for (const [label, tarball] of [
    ['core', tarballs.core],
    ['base Angular', tarballs.angular],
  ]) {
    for (const member of fileInventory(tarball)) {
      const text = readTarballText(tarball, member);
      assert.doesNotMatch(
        text,
        forbiddenBaseText,
        `${label} leaks pilot data in ${member}`,
      );
    }
  }

  const pilotJavaScript = readTarballText(
    tarballs.angularAria,
    'package/dist/index.js',
  );
  assert.match(pilotJavaScript, /from '@angular\/aria\/tabs'/u);
  assert.match(pilotJavaScript, /from '@rabassoft\/schema-engine-angular'/u);
  assert.doesNotMatch(
    pilotJavaScript,
    /node_modules|packages\/angular|packages\/core/u,
  );
  assert.doesNotMatch(pilotJavaScript, /styles\.css/u);

  console.log(
    'Verified private M18 0.3.0/0.1.0 manifests, exact inventories, SemVer rewrites and package isolation.',
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
