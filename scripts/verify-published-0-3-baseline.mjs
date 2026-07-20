import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  listTarball,
  readTarballJson,
  readTarballText,
  workspaceRoot,
} from './release-candidate-utils.mjs';
import {
  assertReleaseCandidateEvidence,
  M19_RELEASE_DESCRIPTOR,
} from './release-target.mjs';

const releaseRoot = join(workspaceRoot, '.release', '0.3.0');
const candidatesPath = join(releaseRoot, 'candidates.json');
assert.equal(
  existsSync(candidatesPath),
  true,
  'The frozen local M19 candidate baseline is unavailable',
);
const evidence = JSON.parse(readFileSync(candidatesPath, 'utf8'));
assertReleaseCandidateEvidence(evidence, M19_RELEASE_DESCRIPTOR);
assert.equal(evidence.sourceCommit, 'ce3ef3dd3f9154c95896bcefa22e31b4f293eda0');

const targets = Object.fromEntries(
  M19_RELEASE_DESCRIPTOR.packages.map((target) => [target.role, target]),
);
for (const candidate of evidence.candidates) {
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
  const target = targets[candidate.role];
  assert.ok(target);
  assert.equal(manifest.name, target.name);
  assert.equal(manifest.version, target.version);
  assert.equal(JSON.stringify(manifest).includes('workspace:'), false);
  assert.deepEqual(manifest.publishConfig, {
    access: 'public',
    tag: 'next',
    provenance: false,
  });
  for (const [name, peer] of Object.entries(target.schemaEnginePeers)) {
    assert.equal(manifest.peerDependencies?.[name], peer);
  }

  const members = listTarball(tarball);
  for (const required of [
    'package/LICENSE',
    'package/NOTICE.md',
    'package/README.md',
    'package/SOURCE.md',
    'package/source-build/package.json',
    'package/source-build/pnpm-lock.yaml',
    'package/source-build/tsconfig.json',
  ]) {
    assert.ok(
      members.includes(required),
      `${candidate.role} omits ${required}`,
    );
  }
  assert.ok(
    members.some((member) => member.startsWith('package/src/')),
    `${candidate.role} omits preferred source`,
  );
  for (const member of members.filter((path) => !path.endsWith('/'))) {
    assert.doesNotMatch(member, /(?:^|\/)(?:\.ai-docs|test|fixtures)(?:\/|$)/u);
    const text = readTarballText(tarball, member);
    assert.doesNotMatch(
      text,
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
    );
    assert.doesNotMatch(text, /(?:^|\s)_authToken\s*=/u);
  }
}

console.log(
  'Verified the frozen byte-identical M19 artifacts, package-local source and security baseline.',
);
