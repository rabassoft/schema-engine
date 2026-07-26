import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  evaluateCiWorkflow,
  evaluateLegacyNpmWorkflow,
  evaluateM23NpmWorkflow,
  evaluateNpmWorkflow,
} from './workflow-policy.mjs';

const ciWorkflow = await readFile('.github/workflows/ci.yml', 'utf8');
const npmWorkflow = await readFile('.github/workflows/npm-publish.yml', 'utf8');

test('accepts the reviewed least-privilege CI workflow', () => {
  assert.deepEqual(evaluateCiWorkflow(ciWorkflow), []);
});

test('accepts the exact manual guarded M23 stage workflow', () => {
  assert.deepEqual(evaluateNpmWorkflow(npmWorkflow), []);
});

test('rejects moving staging before readiness', () => {
  const coreStage =
    'npm stage publish .release/0.4.1/rabassoft-schema-engine-0.4.1.tgz --access public --tag next';
  const unsafe = npmWorkflow
    .replace(coreStage, '')
    .replace(
      'node scripts/verify-npm-publish-readiness.mjs',
      `${coreStage}\n          node scripts/verify-npm-publish-readiness.mjs`,
    );
  assert.ok(
    evaluateNpmWorkflow(unsafe).includes(
      'm23-readiness-candidate-or-stage-order-invalid',
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

function legacyDirectWorkflow() {
  return npmWorkflow
    .replaceAll('npm@11.18.0', 'npm@11.5.1')
    .replace(
      '      - name: Prepare deterministic M23 candidates\n' +
        '        run: node scripts/prepare-public-candidates.mjs --release=m23\n',
      '',
    )
    .replace(
      'npm stage publish .release/0.4.1/rabassoft-schema-engine-0.4.1.tgz --access public --tag next',
      'npm publish packages/core --access public --tag next',
    )
    .replace(
      'npm stage publish .release/0.4.1/rabassoft-schema-engine-angular-0.4.1.tgz --access public --tag next',
      'npm publish packages/angular --access public --tag next',
    )
    .replace(
      'npm stage publish .release/0.4.1/rabassoft-schema-engine-angular-aria-0.2.1.tgz --access public --tag next',
      'npm publish packages/angular-aria --access public --tag next',
    );
}

test('accepts only the proposed exact M23 stage-only workflow shape', () => {
  assert.deepEqual(evaluateM23NpmWorkflow(npmWorkflow), []);
});

test('keeps the legacy direct-publish workflow failing closed for M23', () => {
  const legacy = legacyDirectWorkflow();
  assert.deepEqual(evaluateLegacyNpmWorkflow(legacy), []);
  const findings = evaluateM23NpmWorkflow(legacy);
  assert.ok(findings.includes('m23-direct-publish-present'));
  assert.ok(findings.includes('m23-npm-version-invalid'));
  assert.ok(
    findings.includes('m23-readiness-candidate-or-stage-order-invalid'),
  );
});

test('rejects token fallback and any fourth or reordered M23 stage', () => {
  const unsafe = npmWorkflow
    .replace(
      'npm stage publish .release/0.4.1/rabassoft-schema-engine-0.4.1.tgz',
      'NODE_AUTH_TOKEN=fixture npm stage publish .release/0.4.1/rabassoft-schema-engine-0.4.1.tgz',
    )
    .replace(
      'npm stage publish .release/0.4.1/rabassoft-schema-engine-angular-aria-0.2.1.tgz --access public --tag next',
      'npm stage publish .release/0.4.1/rabassoft-schema-engine-angular-aria-0.2.1.tgz --access public --tag next\n' +
        '          npm stage publish unexpected.tgz --access public --tag next',
    );
  const findings = evaluateM23NpmWorkflow(unsafe);
  assert.ok(findings.includes('m23-token-or-disabled-provenance-present'));
  assert.ok(findings.includes('m23-exact-stage-command-set-invalid'));
});

test('rejects cache, missing verification and explicit provenance flags', () => {
  const unsafe = npmWorkflow
    .replace('          pnpm reference:test:boundaries\n', '')
    .replace(
      '          node-version: 22.23.1',
      '          node-version: 22.23.1\n          cache: npm',
    )
    .replace(
      'npm stage publish .release/0.4.1/rabassoft-schema-engine-0.4.1.tgz',
      'npm stage publish --provenance .release/0.4.1/rabassoft-schema-engine-0.4.1.tgz',
    );
  const findings = evaluateM23NpmWorkflow(unsafe);
  assert.ok(findings.includes('m23-cache-present'));
  assert.ok(
    findings.includes(
      'm23-verify-command-missing:pnpm reference:test:boundaries',
    ),
  );
  assert.ok(findings.includes('m23-token-or-disabled-provenance-present'));
});
