import assert from 'node:assert/strict';
import test from 'node:test';
import {
  contentFindings,
  evaluatePublicHistory,
  evaluatePublicTree,
  REQUIRED_PUBLIC_FILES,
  trackedPathFinding,
} from './public-repository-policy.mjs';

test('accepts required public files and neutral project content', () => {
  const records = REQUIRED_PUBLIC_FILES.map((relativePath) => ({
    relativePath,
    text: 'Public project content\n',
  }));
  assert.deepEqual(evaluatePublicTree(records), []);
});

test('rejects credential and generated paths while allowing env example', () => {
  assert.equal(trackedPathFinding('.env.example'), undefined);
  assert.equal(trackedPathFinding('.env.local'), 'environment-file');
  assert.equal(trackedPathFinding('.npmrc'), 'credential-file');
  assert.equal(
    trackedPathFinding('.release/package.tgz'),
    'generated-or-secret-file',
  );
  assert.equal(
    trackedPathFinding('coverage/index.html'),
    'generated-directory',
  );
});

test('detects local paths, private endpoints and synthetic token shapes', () => {
  const homePath = ['/Users', 'example', 'Library', 'cache'].join('/');
  const privateUrl = ['http:/', '192.168.1.20', 'service'].join('/');
  const token = ['npm', '_', 'A'.repeat(24)].join('');
  assert.deepEqual(contentFindings(homePath), ['macos-home-path']);
  assert.deepEqual(contentFindings(privateUrl), ['private-ipv4-url']);
  assert.deepEqual(contentFindings(token), ['npm-token']);
});

test('reports missing governance files without exposing content', () => {
  assert.deepEqual(
    evaluatePublicTree([{ relativePath: 'README.md', text: '' }]),
    [
      { relativePath: 'LICENSE', rule: 'missing-public-file' },
      { relativePath: 'SECURITY.md', rule: 'missing-public-file' },
      { relativePath: 'CONTRIBUTING.md', rule: 'missing-public-file' },
      { relativePath: 'CODE_OF_CONDUCT.md', rule: 'missing-public-file' },
    ],
  );
});

test('reports historical findings by object, path and rule without content', () => {
  const objectId = 'b'.repeat(40);
  const privateUrl = ['http:/', '10.0.0.8', 'service'].join('/');
  assert.deepEqual(
    evaluatePublicHistory([
      { objectId, relativePath: 'notes.txt', text: privateUrl },
      { objectId, relativePath: 'notes.txt', text: privateUrl },
    ]),
    [{ objectId, relativePath: 'notes.txt', rule: 'private-ipv4-url' }],
  );
});
