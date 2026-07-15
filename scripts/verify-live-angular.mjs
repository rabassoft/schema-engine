import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGE_NAME = '@rabassoft/schema-engine-angular';
const VERSION = '0.1.0';
const REGISTRY = 'https://registry.npmjs.org';
const EXPECTED_SHA512 =
  '35f7f33adccc7c5e6ac164fc03365d2d0b13a9ef472db1d1890ae3a2f70fed43b3f92fddf74ce1e85d6ccf6bff3b8b46bcf95c416e950879c18139a332ebd56a';
const EXPECTED_INTEGRITY =
  'sha512-NffzOtzMfF5qwWT8AzZdLQsTqe9HLbHRiQrjovcP7UOz+S/d90zh6F1sz2v/O4tGvPlcQW6VCHnBgTmjMuvVag==';

async function registryDocument(
  path,
  accept = 'application/vnd.npm.install-v1+json',
) {
  const response = await fetch(`${REGISTRY}/${path}`, {
    headers: { accept },
  });
  assert.equal(response.status, 200, `Registry returned ${response.status}`);
  return response.json();
}

const encodedPackage = encodeURIComponent(PACKAGE_NAME);
const metadata = await registryDocument(encodedPackage);
const versionMetadata = await registryDocument(
  `${encodedPackage}/${VERSION}`,
  'application/json',
);
assert.equal(metadata['dist-tags'].next, VERSION);
assert.equal(metadata['dist-tags'].latest, VERSION);

const manifest = metadata.versions[VERSION];
assert.ok(manifest, `Missing ${PACKAGE_NAME}@${VERSION}`);
assert.equal(manifest.name, PACKAGE_NAME);
assert.equal(versionMetadata.license, 'AGPL-3.0-only');
assert.deepEqual(versionMetadata.dependencies, { tslib: '^2.8.1' });
assert.deepEqual(versionMetadata.peerDependencies, {
  '@angular/core': '>=22.0.6 <23.0.0',
  '@angular/forms': '>=22.0.6 <23.0.0',
  '@rabassoft/schema-engine': '^0.1.0',
});
assert.equal(versionMetadata.repository, undefined);
assert.equal(manifest.dist.integrity, EXPECTED_INTEGRITY);
assert.ok(
  versionMetadata.dist.signatures?.length > 0,
  'Missing registry signature',
);
assert.equal(versionMetadata.dist.attestations, undefined);

const response = await fetch(manifest.dist.tarball);
assert.equal(response.status, 200, `Tarball returned ${response.status}`);
const tarball = Buffer.from(await response.arrayBuffer());
const sha512 = createHash('sha512').update(tarball).digest('hex');
assert.equal(sha512, EXPECTED_SHA512);

const localCandidate = readFileSync(
  join(
    process.cwd(),
    '.release/0.1.0/rabassoft-schema-engine-angular-0.1.0.tgz',
  ),
);
assert.deepEqual(tarball, localCandidate);

console.log(
  `Live Angular verification passed: ${PACKAGE_NAME}@${VERSION}, exact bytes and registry metadata`,
);
