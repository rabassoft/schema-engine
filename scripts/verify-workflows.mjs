import { readFile } from 'node:fs/promises';
import { evaluateCiWorkflow, evaluateNpmWorkflow } from './workflow-policy.mjs';

const workflows = [
  ['.github/workflows/ci.yml', evaluateCiWorkflow],
  ['.github/workflows/npm-publish.yml', evaluateNpmWorkflow],
];
const findings = [];

for (const [workflowPath, evaluate] of workflows) {
  const workflow = await readFile(workflowPath, 'utf8');
  findings.push(
    ...evaluate(workflow).map((finding) => `${workflowPath}:${finding}`),
  );
}

if (findings.length > 0) {
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(
    'Workflow policy passed: exact pins, triggers, permissions and publication guard verified.',
  );
}
