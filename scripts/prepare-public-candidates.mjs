import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  packReleaseCandidates,
  readTarballJson,
  workspaceRoot,
} from './release-candidate-utils.mjs';
import {
  assertReleaseCandidateEvidence,
  loadCoordinatedReleaseTarget,
} from './release-target.mjs';

const { descriptor } = loadCoordinatedReleaseTarget();
const output = join(workspaceRoot, `.release/${descriptor.releaseDirectory}`);
const npmVersion = execFileSync('npm', ['--version'], {
  encoding: 'utf8',
}).trim();
assert.equal(process.version, 'v22.23.1');
assert.equal(npmVersion, '10.9.8');

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
const tarballs = packReleaseCandidates(output, descriptor);
const cleanEnvironment = { ...process.env };
for (const name of Object.keys(cleanEnvironment)) {
  if (
    /^(?:NODE_AUTH_TOKEN|NPM_TOKEN)$/iu.test(name) ||
    /^NPM_CONFIG_.*(?:AUTH|TOKEN|PASSWORD)/iu.test(name)
  ) {
    delete cleanEnvironment[name];
  }
}
const emptyUserConfig = join(output, 'empty-user.npmrc');
writeFileSync(emptyUserConfig, '');
cleanEnvironment.NPM_CONFIG_USERCONFIG = emptyUserConfig;
cleanEnvironment.NPM_CONFIG_CACHE = join(output, 'npm-cache');

const candidates = [];
for (const [role, tarball] of Object.entries(tarballs)) {
  const manifest = readTarballJson(tarball, 'package/package.json');
  const packageTarget = descriptor.packages.find(
    (candidate) => candidate.role === role,
  );
  assert.ok(packageTarget, `Unexpected candidate role ${role}`);
  assert.equal(manifest.name, packageTarget.name);
  assert.equal(manifest.version, packageTarget.version);
  assert.equal(manifest.publishConfig.access, 'public');
  assert.equal(manifest.publishConfig.tag, 'next');
  assert.equal(manifest.publishConfig.provenance, false);
  execFileSync(
    'npm',
    [
      'publish',
      tarball,
      '--dry-run',
      '--access',
      'public',
      '--tag',
      descriptor.distTag,
      `--provenance=${descriptor.provenance}`,
    ],
    { env: cleanEnvironment, stdio: 'inherit' },
  );
  const bytes = readFileSync(tarball);
  candidates.push({
    role,
    name: manifest.name,
    version: manifest.version,
    file: tarball.slice(output.length + 1),
    bytes: bytes.length,
    sha512: createHash('sha512').update(bytes).digest('hex'),
    integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
  });
}

const neutralDirectory = mkdtempSync(
  join(tmpdir(), `schema-engine-${descriptor.id}-neutral-`),
);
try {
  for (const candidate of candidates) {
    const source = join(output, candidate.file);
    const neutralTarball = join(neutralDirectory, candidate.file);
    copyFileSync(source, neutralTarball);
    const neutralBytes = readFileSync(neutralTarball);
    assert.equal(neutralBytes.length, candidate.bytes);
    assert.equal(
      createHash('sha512').update(neutralBytes).digest('hex'),
      candidate.sha512,
    );
    execFileSync(
      'npm',
      [
        'publish',
        `./${candidate.file}`,
        '--dry-run',
        '--access',
        'public',
        '--tag',
        descriptor.distTag,
        `--provenance=${descriptor.provenance}`,
      ],
      { cwd: neutralDirectory, env: cleanEnvironment, stdio: 'inherit' },
    );
  }
} finally {
  rmSync(neutralDirectory, { recursive: true, force: true });
}

const baseCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const treeState = execFileSync('git', ['status', '--porcelain'], {
  encoding: 'utf8',
}).trim();
const evidence = {
  release: descriptor.id,
  releaseDirectory: descriptor.releaseDirectory,
  node: process.version.slice(1),
  npm: npmVersion,
  pnpm: '10.28.2',
  baseCommit,
  sourceCommit: treeState === '' ? baseCommit : null,
  distTag: descriptor.distTag,
  provenance: descriptor.provenance,
  neutralDryRun: true,
  candidates,
};
assertReleaseCandidateEvidence(evidence, descriptor);
writeFileSync(
  join(output, 'candidates.json'),
  `${JSON.stringify(evidence, null, 2)}\n`,
);

console.log(`Prepared dry-run candidates in ${output}`);
console.log('Verified neutral basename-relative dry runs for all candidates.');
