import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readTarballJson, workspaceRoot } from './release-candidate-utils.mjs';

const releaseRoot = join(workspaceRoot, '.release', '0.2.0');
const candidatesPath = join(releaseRoot, 'candidates.json');
assert.equal(
  existsSync(candidatesPath),
  true,
  'The frozen local 0.2.0 candidate baseline is unavailable',
);
const candidates = JSON.parse(readFileSync(candidatesPath, 'utf8'));
assert.equal(
  candidates.sourceCommit,
  'ce53dc1f5b3147ddd24e14912c0ff9dc1b32e412',
);
assert.equal(candidates.distTag, 'next');
assert.equal(candidates.provenance, false);
assert.deepEqual(
  candidates.candidates.map(({ role, name, version, file, sha512 }) => ({
    role,
    name,
    version,
    file,
    sha512,
  })),
  [
    {
      role: 'core',
      name: '@rabassoft/schema-engine',
      version: '0.2.0',
      file: 'rabassoft-schema-engine-0.2.0.tgz',
      sha512:
        '155ae047c8ee949bddcaba412fcff90e4b65396a47f89f63e065e7b7814e8a8e0e2851d8e891465d12f69b54fa00192fe5884b163deb292aedec73f9d13e028a',
    },
    {
      role: 'angular',
      name: '@rabassoft/schema-engine-angular',
      version: '0.2.0',
      file: 'rabassoft-schema-engine-angular-0.2.0.tgz',
      sha512:
        'aa035adb83c01ae1ffccae2126c78f0095ec4f930547d923b80ba7f0419a39ead58dfe45c35818fde4b884dd31793cec17aa2b8c3963520c24f1891d165a5154',
    },
  ],
);

for (const candidate of candidates.candidates) {
  const tarball = join(releaseRoot, candidate.file);
  const bytes = readFileSync(tarball);
  assert.equal(bytes.length, candidate.bytes);
  assert.equal(
    createHash('sha512').update(bytes).digest('hex'),
    candidate.sha512,
  );
  assert.equal(
    `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    candidate.integrity,
  );
  const manifest = readTarballJson(tarball, 'package/package.json');
  assert.equal(manifest.name, candidate.name);
  assert.equal(manifest.version, '0.2.0');
  assert.equal(JSON.stringify(manifest).includes('workspace:'), false);
  assert.deepEqual(manifest.publishConfig, {
    access: 'public',
    tag: 'next',
    provenance: false,
  });
}

console.log(
  'Verified the frozen, byte-identical published 0.2.0 artifact baseline.',
);
