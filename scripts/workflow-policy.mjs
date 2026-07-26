export const ACTION_PINS = Object.freeze({
  checkout: '3d3c42e5aac5ba805825da76410c181273ba90b1',
  setupNode: '820762786026740c76f36085b0efc47a31fe5020',
});

const expectedUses = new Set([
  `actions/checkout@${ACTION_PINS.checkout}`,
  `actions/setup-node@${ACTION_PINS.setupNode}`,
]);

function actionReferences(workflow) {
  return [...workflow.matchAll(/^\s*uses:\s*([^\s#]+).*$/gmu)].map(
    ([, reference]) => reference,
  );
}

function invalidActionReferences(workflow) {
  return actionReferences(workflow).filter(
    (reference) =>
      !expectedUses.has(reference) || !/@[0-9a-f]{40}$/u.test(reference),
  );
}

function occurrenceCount(content, fragment) {
  return content.split(fragment).length - 1;
}

export function evaluateCiWorkflow(workflow) {
  const findings = [];
  if (!/^\s{2}pull_request:\s*$/mu.test(workflow)) {
    findings.push('ci-pull-request-trigger-missing');
  }
  if (!/^\s{2}push:\s*$/mu.test(workflow)) {
    findings.push('ci-push-trigger-missing');
  }
  const branchDeclarations = workflow.match(/branches:\s*\[main, develop\]/gu);
  if (branchDeclarations?.length !== 2) {
    findings.push('ci-main-develop-branches-missing');
  }
  if (!/^permissions:\n\s{2}contents: read$/mu.test(workflow)) {
    findings.push('ci-read-only-permissions-missing');
  }
  if (
    /id-token:\s*write|contents:\s*write|pull-requests:\s*write/iu.test(
      workflow,
    )
  ) {
    findings.push('ci-write-permission-present');
  }
  if (!workflow.includes('pnpm install --frozen-lockfile --ignore-scripts')) {
    findings.push('ci-frozen-install-missing');
  }
  if (!workflow.includes('pnpm check:public-repository')) {
    findings.push('ci-public-tree-check-missing');
  }
  for (const command of [
    'pnpm format:check',
    'pnpm docs:check',
    'pnpm build',
    'pnpm lint',
    'pnpm typecheck',
    'pnpm test',
    'pnpm test:package',
    'pnpm test:source',
    'pnpm test:release:tooling',
    'pnpm test:public-repository',
    'pnpm reference:snippets:check',
    'pnpm reference:test:boundaries',
    'pnpm reference:test:unit',
    'pnpm reference:standard:test:unit',
  ]) {
    if (!workflow.includes(command))
      findings.push(`ci-command-missing:${command}`);
  }
  if (
    occurrenceCount(workflow, `actions/checkout@${ACTION_PINS.checkout}`) !==
      1 ||
    occurrenceCount(workflow, `actions/setup-node@${ACTION_PINS.setupNode}`) !==
      1
  ) {
    findings.push('ci-action-count-invalid');
  }
  if (
    !workflow.includes('Browser E2E remains a separately observed release lane')
  ) {
    findings.push('ci-browser-boundary-missing');
  }
  for (const reference of invalidActionReferences(workflow)) {
    findings.push(`ci-invalid-action:${reference}`);
  }
  return findings;
}

export function evaluateLegacyNpmWorkflow(workflow) {
  const findings = [];
  if (!/^\s{2}workflow_dispatch:\s*$/mu.test(workflow)) {
    findings.push('npm-manual-trigger-missing');
  }
  if (
    /^\s{2}(?:push|pull_request|pull_request_target|schedule):/mu.test(workflow)
  ) {
    findings.push('npm-automatic-trigger-present');
  }
  if (!/^permissions:\n\s{2}contents: read$/mu.test(workflow)) {
    findings.push('npm-default-read-only-permissions-missing');
  }
  if (!/^\s{4}environment: npm-publish$/mu.test(workflow)) {
    findings.push('npm-protected-environment-missing');
  }
  if (!/^\s{6}contents: read\n\s{6}id-token: write$/mu.test(workflow)) {
    findings.push('npm-publish-permissions-missing');
  }
  if (occurrenceCount(workflow, 'id-token: write') !== 1) {
    findings.push('npm-id-token-count-invalid');
  }
  if (
    /NPM_TOKEN|NODE_AUTH_TOKEN|npm_[A-Za-z0-9]{20,}|--provenance=false/iu.test(
      workflow,
    )
  ) {
    findings.push('npm-token-or-disabled-provenance-present');
  }
  if (!workflow.includes('persist-credentials: false')) {
    findings.push('npm-checkout-credential-persistence-not-disabled');
  }
  if (
    !workflow.includes('test "$GITHUB_REF" = "refs/heads/main"') ||
    !workflow.includes('test "$GITHUB_SHA" = "$REQUESTED_SOURCE"')
  ) {
    findings.push('npm-source-identity-guard-missing');
  }
  if (
    occurrenceCount(
      workflow,
      'pnpm install --frozen-lockfile --ignore-scripts',
    ) !== 2
  ) {
    findings.push('npm-frozen-install-count-invalid');
  }
  if (occurrenceCount(workflow, 'pnpm build') !== 2) {
    findings.push('npm-build-count-invalid');
  }
  if (
    occurrenceCount(workflow, `actions/checkout@${ACTION_PINS.checkout}`) !==
      2 ||
    occurrenceCount(workflow, `actions/setup-node@${ACTION_PINS.setupNode}`) !==
      2
  ) {
    findings.push('npm-action-count-invalid');
  }

  const readiness = workflow.indexOf('verify-npm-publish-readiness.mjs');
  const corePublish = workflow.indexOf('npm publish packages/core');
  const angularPublish = workflow.indexOf('npm publish packages/angular ');
  const pilotPublish = workflow.indexOf('npm publish packages/angular-aria');
  if (
    readiness < 0 ||
    corePublish < readiness ||
    angularPublish < corePublish ||
    pilotPublish < angularPublish
  ) {
    findings.push('npm-readiness-or-publication-order-invalid');
  }
  for (const reference of invalidActionReferences(workflow)) {
    findings.push(`npm-invalid-action:${reference}`);
  }
  return findings;
}

export function evaluateM23NpmWorkflow(workflow) {
  const findings = [];
  if (!/^\s{2}workflow_dispatch:\s*$/mu.test(workflow)) {
    findings.push('m23-manual-trigger-missing');
  }
  if (
    /^\s{2}(?:push|pull_request|pull_request_target|schedule):/mu.test(workflow)
  ) {
    findings.push('m23-automatic-trigger-present');
  }
  if (!/^permissions:\n\s{2}contents: read$/mu.test(workflow)) {
    findings.push('m23-default-read-only-permissions-missing');
  }
  if (!/^\s{4}environment: npm-publish$/mu.test(workflow)) {
    findings.push('m23-protected-environment-missing');
  }
  if (
    !/^\s{6}contents: read\n\s{6}id-token: write$/mu.test(workflow) ||
    occurrenceCount(workflow, 'id-token: write') !== 1
  ) {
    findings.push('m23-staging-permissions-invalid');
  }
  if (
    /NPM_TOKEN|NODE_AUTH_TOKEN|npm_[A-Za-z0-9]{20,}|--provenance(?:=false)?/iu.test(
      workflow,
    )
  ) {
    findings.push('m23-token-or-disabled-provenance-present');
  }
  if (/^\s*npm\s+publish\b/mu.test(workflow)) {
    findings.push('m23-direct-publish-present');
  }
  if (occurrenceCount(workflow, 'npm install --global npm@11.18.0') !== 2) {
    findings.push('m23-npm-version-invalid');
  }
  if (
    occurrenceCount(
      workflow,
      'pnpm install --frozen-lockfile --ignore-scripts',
    ) !== 2
  ) {
    findings.push('m23-frozen-install-count-invalid');
  }
  if (
    occurrenceCount(workflow, 'runs-on: ubuntu-latest') !== 2 ||
    occurrenceCount(workflow, 'persist-credentials: false') !== 2 ||
    occurrenceCount(workflow, `actions/checkout@${ACTION_PINS.checkout}`) !==
      2 ||
    occurrenceCount(workflow, `actions/setup-node@${ACTION_PINS.setupNode}`) !==
      2
  ) {
    findings.push('m23-hosted-runner-or-action-count-invalid');
  }
  if (/^\s+cache:/mu.test(workflow)) {
    findings.push('m23-cache-present');
  }
  for (const command of [
    'pnpm format:check',
    'pnpm docs:check',
    'pnpm build',
    'pnpm lint',
    'pnpm typecheck',
    'pnpm test',
    'pnpm test:package',
    'pnpm test:source',
    'pnpm test:release:tooling',
    'pnpm test:public-repository',
    'pnpm check:public-repository',
    'pnpm reference:snippets:check',
    'pnpm reference:test:boundaries',
    'pnpm reference:test:unit',
    'pnpm reference:standard:test:unit',
  ]) {
    if (!workflow.includes(command)) {
      findings.push(`m23-verify-command-missing:${command}`);
    }
  }
  if (
    !workflow.includes('test "$GITHUB_REF" = "refs/heads/main"') ||
    !workflow.includes('test "$GITHUB_SHA" = "$REQUESTED_SOURCE"')
  ) {
    findings.push('m23-source-identity-guard-missing');
  }

  const readiness = workflow.indexOf('verify-npm-publish-readiness.mjs');
  const prepare = workflow.indexOf(
    'node scripts/prepare-public-candidates.mjs --release=m23',
  );
  const stages = M23_RELEASE_DESCRIPTOR.packages
    .map((packageTarget) =>
      [
        'npm',
        ...m23StagePublishArgs(M23_RELEASE_DESCRIPTOR, packageTarget),
      ].join(' '),
    )
    .map((command) => workflow.indexOf(command));
  if (
    readiness < 0 ||
    prepare < readiness ||
    stages[0] < prepare ||
    stages[1] < stages[0] ||
    stages[2] < stages[1]
  ) {
    findings.push('m23-readiness-candidate-or-stage-order-invalid');
  }
  if (
    stages.some((position) => position < 0) ||
    occurrenceCount(workflow, 'npm stage publish ') !== 3
  ) {
    findings.push('m23-exact-stage-command-set-invalid');
  }
  for (const reference of invalidActionReferences(workflow)) {
    findings.push(`m23-invalid-action:${reference}`);
  }
  return findings;
}

export const evaluateNpmWorkflow = evaluateM23NpmWorkflow;
import {
  m23StagePublishArgs,
  M23_RELEASE_DESCRIPTOR,
} from './release-target.mjs';
