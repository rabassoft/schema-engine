import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  packCandidates,
  readTarballJson,
  workspaceRoot,
} from './release-candidate-utils.mjs';

const output = join(workspaceRoot, '.release/0.1.0');
const npmVersion = execFileSync('npm', ['--version'], {
  encoding: 'utf8',
}).trim();
assert.equal(process.version, 'v22.23.1');
assert.equal(npmVersion, '10.9.8');

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
const tarballs = packCandidates(output);
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
      'next',
      '--provenance=false',
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

const baseCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const treeState = execFileSync('git', ['status', '--porcelain'], {
  encoding: 'utf8',
}).trim();
writeFileSync(
  join(output, 'candidates.json'),
  `${JSON.stringify(
    {
      node: process.version.slice(1),
      npm: npmVersion,
      pnpm: '10.28.2',
      baseCommit,
      sourceCommit: treeState === '' ? baseCommit : null,
      distTag: 'next',
      provenance: false,
      candidates,
    },
    null,
    2,
  )}\n`,
);

console.log(`Prepared dry-run candidates in ${output}`);
