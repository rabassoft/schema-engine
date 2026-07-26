import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  listTarball,
  packCandidates,
  packReleaseCandidates,
  readTarballText,
} from './release-candidate-utils.mjs';
import { loadCoordinatedReleaseTarget } from './release-target.mjs';

const temporaryRoot = mkdtempSync(join(tmpdir(), 'schema-engine-security-'));
const secretPatterns = Object.freeze([
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
  /(?:^|\s)_authToken\s*=/u,
  /\bnpm_[A-Za-z0-9]{20,}\b/u,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/u,
]);
const identityPatterns = Object.freeze([
  /\b[0-9]{8}[A-Z]\b/u,
  /\b[XYZ][0-9]{7}[A-Z]\b/u,
  /\b(?:Calle|Carrer|Avenida|Avinguda|Street)\s+[^\n]{0,80}\d/iu,
]);
const publicRepository = ['https://github.com', 'rabassoft/schema-engine'].join(
  '/',
);
const allowedHistoricalPrivateLink = '.ai-docs/project/WORKLOG.md';
const { descriptor } = loadCoordinatedReleaseTarget();

function assertCleanText(text, label, allowHistoricalLink = false) {
  for (const pattern of [...secretPatterns, ...identityPatterns]) {
    assert.equal(pattern.test(text), false, `${label} matches ${pattern}`);
  }
  if (descriptor.id !== 'm23' && !allowHistoricalLink) {
    assert.equal(
      text.includes(publicRepository),
      false,
      `${label} exposes the private repository`,
    );
  }
}

try {
  const includeAngularAria = process.argv.includes('--include-angular-aria');
  const repositoryFiles = execFileSync('git', [
    'ls-files',
    '-z',
    '--cached',
    '--others',
    '--exclude-standard',
  ])
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  for (const path of repositoryFiles) {
    assert.equal(
      /(^|\/)(?:\.npmrc|\.env(?:\.|$)|[^/]+\.(?:pem|key|p12|pfx))$/u.test(path),
      false,
      `Sensitive tracked path: ${path}`,
    );
    const text = readFileSync(path, 'utf8');
    assertCleanText(text, path, path === allowedHistoricalPrivateLink);
  }

  const authors = execFileSync(
    'git',
    [
      'log',
      '--format=%an <%ae>',
      '--',
      'packages/core/src',
      'packages/angular/src',
      ...(includeAngularAria ? ['packages/angular-aria/src'] : []),
    ],
    { encoding: 'utf8' },
  )
    .trim()
    .split(/\r?\n/u)
    .filter(Boolean);
  assert.deepEqual([...new Set(authors)], ['Rabassoft <ricard@rabassoft.com>']);

  const tarballs = includeAngularAria
    ? packReleaseCandidates(temporaryRoot, descriptor)
    : packCandidates(temporaryRoot);
  for (const [name, tarball] of Object.entries(tarballs)) {
    for (const member of listTarball(tarball)) {
      assert.equal(
        /(?:^|\/)(?:\.git|\.ai-docs|test|fixtures)(?:\/|$)/u.test(member),
        false,
        `${name} contains forbidden member ${member}`,
      );
      if (!member.endsWith('/')) {
        assertCleanText(readTarballText(tarball, member), `${name}:${member}`);
      }
    }
  }

  console.log(
    'Verified tracked/packed secrets, personal data, private links and source ownership.',
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
