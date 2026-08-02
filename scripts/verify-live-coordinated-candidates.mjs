import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  argumentValue,
  assertReleaseCandidateEvidence,
  loadReleaseDescriptor,
} from './release-target.mjs';
import { workspaceRoot } from './release-candidate-utils.mjs';

const REGISTRY = 'https://registry.npmjs.org';
const descriptor = loadReleaseDescriptor();
const tagMode = argumentValue(process.argv, 'tag-mode') ?? 'none';
assert.ok(
  ['none', 'next', 'latest', 'both'].includes(tagMode),
  'Invalid --tag-mode',
);

const releaseRoot =
  argumentValue(process.argv, 'release-root') ??
  join(workspaceRoot, `.release/${descriptor.releaseDirectory}`);
const evidence = JSON.parse(
  readFileSync(join(releaseRoot, 'candidates.json'), 'utf8'),
);
assertReleaseCandidateEvidence(evidence, descriptor);

async function registryDocument(path, accept = 'application/json') {
  const response = await fetch(`${REGISTRY}/${path}`, { headers: { accept } });
  assert.equal(response.status, 200, `Registry returned ${response.status}`);
  return response.json();
}

for (const candidate of evidence.candidates) {
  const packageTarget = descriptor.packages.find(
    ({ role }) => role === candidate.role,
  );
  assert.ok(packageTarget, `Missing descriptor target ${candidate.role}`);
  const encoded = encodeURIComponent(candidate.name);
  const metadata = await registryDocument(
    encoded,
    'application/vnd.npm.install-v1+json',
  );
  const exact = await registryDocument(`${encoded}/${candidate.version}`);
  if (tagMode === 'next' || tagMode === 'both') {
    assert.equal(metadata['dist-tags'].next, candidate.version);
  }
  if (tagMode === 'latest' || tagMode === 'both') {
    assert.equal(metadata['dist-tags'].latest, candidate.version);
  }
  const manifest = metadata.versions[candidate.version];
  assert.ok(manifest, `Missing ${candidate.name}@${candidate.version}`);
  assert.equal(manifest.dist.integrity, candidate.integrity);
  assert.ok(exact.dist.signatures?.length > 0, 'Missing registry signature');
  if (descriptor.provenance) {
    assert.deepEqual(exact.repository, {
      url: 'git+https://github.com/rabassoft/schema-engine.git',
      type: 'git',
      directory: packageTarget.workspacePath,
    });
    assert.match(
      exact.dist.attestations?.url ?? '',
      /^https:\/\/registry\.npmjs\.org\/-\/npm\/v1\/attestations\//u,
    );
    assert.equal(
      exact.dist.attestations?.provenance?.predicateType,
      'https://slsa.dev/provenance/v1',
    );
  } else {
    assert.equal(exact.repository, undefined);
    assert.equal(exact.dist.attestations, undefined);
  }
  const response = await fetch(manifest.dist.tarball);
  assert.equal(response.status, 200);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(
    createHash('sha512').update(bytes).digest('hex'),
    candidate.sha512,
  );
  assert.deepEqual(bytes, readFileSync(join(releaseRoot, candidate.file)));
}

console.log(
  `Verified live ${descriptor.id} candidate bytes with tag mode ${tagMode}.`,
);
