import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  listTarball,
  readTarballJson,
  readTarballText,
  workspaceRoot,
} from './release-candidate-utils.mjs';
import {
  assertReleaseCandidateEvidence,
  M21_RELEASE_DESCRIPTOR,
  M23_RELEASE_DESCRIPTOR,
} from './release-target.mjs';

const allowedChangedMembers = new Set([
  'package/README.md',
  'package/package.json',
]);

function evidence(descriptor) {
  const path = join(
    workspaceRoot,
    '.release',
    descriptor.releaseDirectory,
    'candidates.json',
  );
  const value = JSON.parse(readFileSync(path, 'utf8'));
  assertReleaseCandidateEvidence(value, descriptor);
  return value;
}

function tarball(descriptor, target) {
  return join(
    workspaceRoot,
    '.release',
    descriptor.releaseDirectory,
    target.file,
  );
}

function normalizeM23Manifest(manifest, m21Target) {
  const normalized = JSON.parse(JSON.stringify(manifest));
  normalized.version = m21Target.version;
  delete normalized.repository;
  normalized.publishConfig.provenance = false;

  for (const [name, version] of Object.entries(
    m21Target.schemaEngineDevelopment,
  )) {
    normalized.devDependencies[name] = version;
  }

  return normalized;
}

const m21Evidence = evidence(M21_RELEASE_DESCRIPTOR);
const m23Evidence = evidence(M23_RELEASE_DESCRIPTOR);
assert.notEqual(m21Evidence.sourceCommit, null);
assert.equal(m23Evidence.sourceCommit, null);

for (const m23Target of M23_RELEASE_DESCRIPTOR.packages) {
  const m21Target = M21_RELEASE_DESCRIPTOR.packages.find(
    ({ role }) => role === m23Target.role,
  );
  assert.ok(m21Target, `Missing M21 role ${m23Target.role}`);

  const m21Tarball = tarball(M21_RELEASE_DESCRIPTOR, m21Target);
  const m23Tarball = tarball(M23_RELEASE_DESCRIPTOR, m23Target);
  const m21Members = listTarball(m21Tarball).sort();
  const m23Members = listTarball(m23Tarball).sort();
  assert.deepEqual(
    m23Members,
    m21Members,
    `${m23Target.role} package inventory changed`,
  );

  const observedChanges = [];
  for (const member of m23Members.filter((value) => !value.endsWith('/'))) {
    const m21Text = readTarballText(m21Tarball, member);
    const m23Text = readTarballText(m23Tarball, member);
    if (m21Text !== m23Text) observedChanges.push(member);
    if (!allowedChangedMembers.has(member)) {
      assert.equal(
        m23Text,
        m21Text,
        `${m23Target.role}:${member} changed outside reviewed metadata`,
      );
    }
  }
  assert.deepEqual(observedChanges.sort(), [...allowedChangedMembers].sort());

  const m21Manifest = readTarballJson(m21Tarball, 'package/package.json');
  const m23Manifest = readTarballJson(m23Tarball, 'package/package.json');
  assert.deepEqual(
    normalizeM23Manifest(m23Manifest, m21Target),
    m21Manifest,
    `${m23Target.role} manifest changed outside reviewed M23 metadata`,
  );
}

console.log(
  'Verified M23 inventories and all non-metadata package bytes against selected M21 candidates.',
);
