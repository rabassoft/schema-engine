import { execFileSync } from 'node:child_process';
import { evaluatePublicHistory } from './public-repository-policy.mjs';

const root = process.cwd();
const commits = execFileSync('git', ['rev-list', '--all'], {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean);

const blobs = new Map();
for (const commit of commits) {
  const entries = execFileSync(
    'git',
    ['ls-tree', '-r', '-z', '--full-tree', commit],
    { cwd: root, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 },
  )
    .split('\0')
    .filter(Boolean);

  for (const entry of entries) {
    const match = entry.match(/^\d+ blob ([0-9a-f]{40})\t(.+)$/u);
    if (!match) continue;
    const [, objectId, relativePath] = match;
    blobs.set(`${objectId}:${relativePath}`, { objectId, relativePath });
  }
}

const records = [];
for (const record of blobs.values()) {
  const bytes = execFileSync('git', ['cat-file', 'blob', record.objectId], {
    cwd: root,
    encoding: 'buffer',
    maxBuffer: 50 * 1024 * 1024,
  });
  records.push({
    ...record,
    text: bytes.includes(0) ? undefined : bytes.toString('utf8'),
  });
}

const findings = evaluatePublicHistory(records);
if (findings.length > 0) {
  for (const finding of findings) {
    console.error(
      `- ${finding.objectId} ${finding.relativePath}: ${finding.rule}`,
    );
  }
  console.error(
    `Public history policy found ${findings.length} redacted finding(s).`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `Public history policy passed: ${commits.length} commits, ${records.length} path/blob pairs, zero findings.`,
  );
}
