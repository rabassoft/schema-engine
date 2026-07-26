import assert from 'node:assert/strict';
import test from 'node:test';
import { M23_RELEASE_DESCRIPTOR } from './release-target.mjs';
import {
  evaluateNpmPublishReadiness,
  EXPECTED_REPOSITORY_URL,
} from './npm-publish-readiness.mjs';

const sourceCommit = 'a'.repeat(40);

function readyInput() {
  const descriptor = JSON.parse(JSON.stringify(M23_RELEASE_DESCRIPTOR));
  const manifests = Object.fromEntries(
    descriptor.packages.map((packageTarget) => [
      packageTarget.role,
      {
        repository: {
          type: 'git',
          url: EXPECTED_REPOSITORY_URL,
          directory: packageTarget.workspacePath,
        },
        publishConfig: { access: 'public', tag: 'next' },
      },
    ]),
  );
  return {
    descriptor,
    manifests,
    sourceCommit,
    githubSha: sourceCommit,
    githubRef: 'refs/heads/main',
    environment: {},
  };
}

test('accepts only a descriptor and manifests prepared for trusted publishing', () => {
  assert.deepEqual(evaluateNpmPublishReadiness(readyInput()), []);
});

test('fails closed without the exact M23 policy and manifest metadata', () => {
  const input = readyInput();
  input.descriptor.trustedPublishing.allowedActions = [];
  input.descriptor.provenance = false;
  for (const manifest of Object.values(input.manifests)) {
    delete manifest.repository;
    manifest.publishConfig.provenance = false;
  }
  const findings = evaluateNpmPublishReadiness(input);
  assert.ok(findings.includes('descriptor-trusted-publisher-policy-mismatch'));
  assert.ok(findings.includes('descriptor-provenance-not-enabled'));
  assert.ok(findings.includes('core:repository-url-mismatch'));
  assert.ok(findings.includes('angularAria:provenance-explicitly-disabled'));
});

test('rejects a mismatched or missing exact runtime source commit', () => {
  const input = readyInput();
  input.sourceCommit = undefined;
  const findings = evaluateNpmPublishReadiness(input);
  assert.ok(findings.includes('missing-exact-source-commit'));
  assert.ok(findings.includes('runtime-source-commit-mismatch'));
  input.sourceCommit = sourceCommit;
  input.githubSha = 'b'.repeat(40);
  input.githubRef = 'refs/heads/develop';
  const wrongRuntime = evaluateNpmPublishReadiness(input);
  assert.ok(wrongRuntime.includes('runtime-source-commit-mismatch'));
  assert.ok(wrongRuntime.includes('runtime-source-is-not-main'));
});

for (const [label, mutate] of [
  [
    'missing allowed action',
    (input) => {
      input.descriptor.trustedPublishing.allowedActions = [];
    },
  ],
  [
    'dual allowed action',
    (input) => {
      input.descriptor.trustedPublishing.allowedActions.push('publish');
    },
  ],
  [
    'wrong owner',
    (input) => {
      input.descriptor.trustedPublishing.owner = 'other';
    },
  ],
  [
    'wrong repository',
    (input) => {
      input.descriptor.trustedPublishing.repository = 'other';
    },
  ],
  [
    'wrong workflow',
    (input) => {
      input.descriptor.trustedPublishing.workflow = 'other.yml';
    },
  ],
  [
    'wrong environment',
    (input) => {
      input.descriptor.trustedPublishing.environment = 'other';
    },
  ],
]) {
  test(`rejects trusted publisher with ${label}`, () => {
    const input = readyInput();
    mutate(input);
    assert.ok(
      evaluateNpmPublishReadiness(input).includes(
        'descriptor-trusted-publisher-policy-mismatch',
      ),
    );
  });
}

test('rejects token fallback and wrong package repository directories', () => {
  const input = readyInput();
  input.environment.NODE_AUTH_TOKEN = 'fixture-only';
  input.environment.NPM_CONFIG_PROVENANCE = 'false';
  input.manifests.angular.repository.directory = 'packages/core';
  const findings = evaluateNpmPublishReadiness(input);
  assert.ok(findings.includes('token-fallback-present:NODE_AUTH_TOKEN'));
  assert.ok(findings.includes('provenance-environment-opt-out-present'));
  assert.ok(findings.includes('angular:repository-directory-mismatch'));
});
