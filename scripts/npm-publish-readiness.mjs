const EXPECTED_REPOSITORY_URL =
  'git+https://github.com/rabassoft/schema-engine.git';
const EXPECTED_TRUSTED_PUBLISHER = Object.freeze({
  enabled: true,
  provider: 'github-actions',
  owner: 'rabassoft',
  repository: 'schema-engine',
  workflow: 'npm-publish.yml',
  environment: 'npm-publish',
  allowedActions: ['stage-publish'],
});

export function evaluateNpmPublishReadiness({
  descriptor,
  manifests,
  sourceCommit,
  githubSha,
  githubRef,
  environment = {},
}) {
  const findings = [];

  if (!/^[0-9a-f]{40}$/u.test(sourceCommit ?? '')) {
    findings.push('missing-exact-source-commit');
  }
  if (sourceCommit !== githubSha) {
    findings.push('runtime-source-commit-mismatch');
  }
  if (githubRef !== 'refs/heads/main') {
    findings.push('runtime-source-is-not-main');
  }
  if (
    JSON.stringify(descriptor.trustedPublishing) !==
    JSON.stringify(EXPECTED_TRUSTED_PUBLISHER)
  ) {
    findings.push('descriptor-trusted-publisher-policy-mismatch');
  }
  if (descriptor.provenance !== true) {
    findings.push('descriptor-provenance-not-enabled');
  }
  for (const name of Object.keys(environment)) {
    if (
      /^(?:NODE_AUTH_TOKEN|NPM_TOKEN)$/iu.test(name) ||
      /^NPM_CONFIG_.*(?:AUTH|TOKEN|PASSWORD)/iu.test(name)
    ) {
      findings.push(`token-fallback-present:${name}`);
    }
  }
  if (
    String(environment.NPM_CONFIG_PROVENANCE ?? '').toLowerCase() === 'false'
  ) {
    findings.push('provenance-environment-opt-out-present');
  }

  for (const packageTarget of descriptor.packages) {
    const manifest = manifests[packageTarget.role];
    const repository = manifest?.repository;
    if (repository?.type !== 'git') {
      findings.push(`${packageTarget.role}:repository-type-missing`);
    }
    if (repository?.url !== EXPECTED_REPOSITORY_URL) {
      findings.push(`${packageTarget.role}:repository-url-mismatch`);
    }
    if (repository?.directory !== packageTarget.workspacePath) {
      findings.push(`${packageTarget.role}:repository-directory-mismatch`);
    }
    if (manifest?.publishConfig?.provenance === false) {
      findings.push(`${packageTarget.role}:provenance-explicitly-disabled`);
    }
  }

  return findings;
}

export { EXPECTED_REPOSITORY_URL, EXPECTED_TRUSTED_PUBLISHER };
