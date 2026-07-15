import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { argumentValue } from './release-target.mjs';
import { workspaceRoot } from './release-candidate-utils.mjs';

const REGISTRY = 'https://registry.npmjs.org';
const version = argumentValue(process.argv, 'release-version');
const tagMode = argumentValue(process.argv, 'tag-mode') ?? 'none';
assert.ok(version, 'Missing --release-version');
assert.ok(
  ['none', 'next', 'latest', 'both'].includes(tagMode),
  'Invalid --tag-mode',
);

const releaseRoot = join(workspaceRoot, `.release/${version}`);
const evidence = JSON.parse(
  readFileSync(join(releaseRoot, 'candidates.json'), 'utf8'),
);
assert.equal(evidence.candidates.length, 2);

async function registryDocument(path, accept = 'application/json') {
  const response = await fetch(`${REGISTRY}/${path}`, { headers: { accept } });
  assert.equal(response.status, 200, `Registry returned ${response.status}`);
  return response.json();
}

for (const candidate of evidence.candidates) {
  assert.equal(candidate.version, version);
  const encoded = encodeURIComponent(candidate.name);
  const metadata = await registryDocument(
    encoded,
    'application/vnd.npm.install-v1+json',
  );
  const exact = await registryDocument(`${encoded}/${version}`);
  if (tagMode === 'next' || tagMode === 'both') {
    assert.equal(metadata['dist-tags'].next, version);
  }
  if (tagMode === 'latest' || tagMode === 'both') {
    assert.equal(metadata['dist-tags'].latest, version);
  }
  const manifest = metadata.versions[version];
  assert.ok(manifest, `Missing ${candidate.name}@${version}`);
  assert.equal(manifest.dist.integrity, candidate.integrity);
  assert.equal(exact.repository, undefined);
  assert.ok(exact.dist.signatures?.length > 0, 'Missing registry signature');
  assert.equal(exact.dist.attestations, undefined);
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
  `Verified live ${version} candidate bytes with tag mode ${tagMode}.`,
);
