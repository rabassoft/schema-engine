import assert from 'node:assert/strict';
import test from 'node:test';
import { M21_RELEASE_DESCRIPTOR } from './release-target.mjs';
import {
  evaluateNpmPublishReadiness,
  EXPECTED_REPOSITORY_URL,
} from './npm-publish-readiness.mjs';

const sourceCommit = 'a'.repeat(40);

function readyInput() {
  const descriptor = {
    ...JSON.parse(JSON.stringify(M21_RELEASE_DESCRIPTOR)),
    provenance: true,
    trustedPublishing: { enabled: true, sourceCommit },
  };
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
  return { descriptor, manifests, sourceCommit };
}

test('accepts only a descriptor and manifests prepared for trusted publishing', () => {
  assert.deepEqual(evaluateNpmPublishReadiness(readyInput()), []);
});

test('fails closed for the current M21 descriptor and manifests', () => {
  const input = readyInput();
  input.descriptor.trustedPublishing = undefined;
  input.descriptor.provenance = false;
  for (const manifest of Object.values(input.manifests)) {
    delete manifest.repository;
    manifest.publishConfig.provenance = false;
  }
  const findings = evaluateNpmPublishReadiness(input);
  assert.ok(
    findings.includes('descriptor-not-authorized-for-trusted-publishing'),
  );
  assert.ok(findings.includes('descriptor-provenance-not-enabled'));
  assert.ok(findings.includes('core:repository-url-mismatch'));
  assert.ok(findings.includes('angularAria:provenance-explicitly-disabled'));
});

test('rejects a mismatched or missing exact source commit', () => {
  const input = readyInput();
  input.sourceCommit = undefined;
  const findings = evaluateNpmPublishReadiness(input);
  assert.ok(findings.includes('missing-exact-source-commit'));
  assert.ok(findings.includes('descriptor-source-commit-mismatch'));
});
