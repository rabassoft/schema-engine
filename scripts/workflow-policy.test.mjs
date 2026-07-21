import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { evaluateCiWorkflow, evaluateNpmWorkflow } from './workflow-policy.mjs';

const ciWorkflow = await readFile('.github/workflows/ci.yml', 'utf8');
const npmWorkflow = await readFile('.github/workflows/npm-publish.yml', 'utf8');

test('accepts the reviewed least-privilege CI workflow', () => {
  assert.deepEqual(evaluateCiWorkflow(ciWorkflow), []);
});

test('accepts the manual guarded npm workflow', () => {
  assert.deepEqual(evaluateNpmWorkflow(npmWorkflow), []);
});

test('rejects moving publication before readiness', () => {
  const unsafe = npmWorkflow.replace(
    'verify-npm-publish-readiness.mjs',
    'npm publish packages/core && verify-npm-publish-readiness.mjs',
  );
  assert.ok(
    evaluateNpmWorkflow(unsafe).includes(
      'npm-readiness-or-publication-order-invalid',
    ),
  );
});

test('rejects unpinned actions and CI write authority', () => {
  const unsafe = ciWorkflow
    .replace(/actions\/checkout@[0-9a-f]{40}/u, 'actions/checkout@v7')
    .replace('contents: read', 'contents: write');
  const findings = evaluateCiWorkflow(unsafe);
  assert.ok(findings.includes('ci-write-permission-present'));
  assert.ok(findings.includes('ci-invalid-action:actions/checkout@v7'));
});
