import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  listTarball,
  packCandidates,
  readTarballJson,
} from './release-candidate-utils.mjs';

const temporaryRoot = mkdtempSync(join(tmpdir(), 'schema-engine-artifacts-'));

function isAllowedMember(member) {
  if (member.endsWith('/')) {
    return true;
  }
  if (member === 'package/package.json' || member === 'package/README.md') {
    return true;
  }
  return /^package\/dist\/.+\.(?:js|js\.map|d\.ts|d\.ts\.map)$/u.test(member);
}

function verifyCommon(tarball, expectedName) {
  const members = listTarball(tarball);
  const files = new Set(members.filter((member) => !member.endsWith('/')));
  const unexpected = members.filter((member) => !isAllowedMember(member));

  assert.deepEqual(unexpected, [], `${expectedName} contains unexpected files`);
  assert.ok(files.has('package/package.json'));
  assert.ok(files.has('package/README.md'));
  assert.ok(files.has('package/dist/index.js'));
  assert.ok(files.has('package/dist/index.d.ts'));

  const manifest = readTarballJson(tarball, 'package/package.json');
  assert.equal(manifest.name, expectedName);
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.sideEffects, false);
  assert.deepEqual(manifest.files, ['dist', 'README.md']);
  assert.deepEqual(manifest.exports, {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js',
    },
  });
  assert.equal(JSON.stringify(manifest).includes('workspace:'), false);

  for (const target of Object.values(manifest.exports['.'])) {
    assert.ok(files.has(`package/${target.slice(2)}`), `Missing ${target}`);
  }

  return manifest;
}

try {
  const tarballs = packCandidates(temporaryRoot);
  const core = verifyCommon(tarballs.core, '@rabassoft/schema-engine');
  const angular = verifyCommon(
    tarballs.angular,
    '@rabassoft/schema-engine-angular',
  );

  assert.equal(core.dependencies, undefined);
  assert.equal(core.devDependencies, undefined);
  assert.equal(core.peerDependencies, undefined);
  assert.equal(core.optionalDependencies, undefined);

  assert.deepEqual(angular.dependencies, { tslib: '^2.8.1' });
  assert.deepEqual(angular.peerDependencies, {
    '@angular/core': '>=22.0.6 <23.0.0',
    '@angular/forms': '>=22.0.6 <23.0.0',
    '@rabassoft/schema-engine': '^0.1.0',
  });
  assert.deepEqual(angular.devDependencies, {
    '@rabassoft/schema-engine': '0.1.0',
  });
  assert.equal(angular.optionalDependencies, undefined);

  console.log(
    'Verified private 0.1.0 candidate manifests and tarball contents.',
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
