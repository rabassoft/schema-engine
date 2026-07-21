const EXPECTED_REPOSITORY_URL =
  'git+https://github.com/rabassoft/schema-engine.git';

export function evaluateNpmPublishReadiness({
  descriptor,
  manifests,
  sourceCommit,
}) {
  const findings = [];

  if (!/^[0-9a-f]{40}$/u.test(sourceCommit ?? '')) {
    findings.push('missing-exact-source-commit');
  }
  if (descriptor.trustedPublishing?.enabled !== true) {
    findings.push('descriptor-not-authorized-for-trusted-publishing');
  }
  if (descriptor.trustedPublishing?.sourceCommit !== sourceCommit) {
    findings.push('descriptor-source-commit-mismatch');
  }
  if (descriptor.provenance !== true) {
    findings.push('descriptor-provenance-not-enabled');
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

export { EXPECTED_REPOSITORY_URL };
