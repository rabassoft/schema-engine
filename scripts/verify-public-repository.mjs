import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { evaluatePublicTree } from './public-repository-policy.mjs';

const root = process.cwd();
const candidatePaths = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  {
    cwd: root,
    encoding: 'utf8',
  },
)
  .split('\0')
  .filter(Boolean);

const records = [];
for (const relativePath of candidatePaths) {
  const bytes = await readFile(path.join(root, relativePath));
  records.push({
    relativePath,
    text: bytes.includes(0) ? undefined : bytes.toString('utf8'),
  });
}

const findings = evaluatePublicTree(records);
if (findings.length > 0) {
  for (const finding of findings) {
    console.error(`- ${finding.relativePath}: ${finding.rule}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Public repository tree policy passed: ${records.length} candidate files, zero findings.`,
  );
}
