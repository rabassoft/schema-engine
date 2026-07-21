import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const gitleaksBin = process.env.GITLEAKS_BIN;
const gitFilterRepoBin = process.env.GIT_FILTER_REPO_BIN;

if (!gitleaksBin || !gitFilterRepoBin) {
  console.error(
    'GITLEAKS_BIN and GIT_FILTER_REPO_BIN must point to verified external tools.',
  );
  process.exit(2);
}

const fixtureRoot = await mkdtemp(
  path.join(os.tmpdir(), 'schema-engine-publication-tools-'),
);
const gitIdentity = {
  GIT_AUTHOR_NAME: 'Schema Engine Fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
  GIT_COMMITTER_NAME: 'Schema Engine Fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
};

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    env: { ...process.env, ...gitIdentity, ...options.env },
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  });
}

async function initializeRepository(directory) {
  run('git', ['init', '--initial-branch=main', directory]);
  run('git', ['config', 'user.name', gitIdentity.GIT_AUTHOR_NAME], {
    cwd: directory,
  });
  run('git', ['config', 'user.email', gitIdentity.GIT_AUTHOR_EMAIL], {
    cwd: directory,
  });
}

async function commitAll(directory, message, date) {
  run('git', ['add', '.'], { cwd: directory });
  run('git', ['commit', '-m', message], {
    cwd: directory,
    env: { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
  });
}

async function verifyGitleaks() {
  const positive = path.join(fixtureRoot, 'gitleaks-positive');
  await initializeRepository(positive);
  const syntheticSecret = [
    'g',
    'hp_',
    'Z8mQ2vL7xR4nT9pK3wH6cD1sF5aB0yUeI9oC',
  ].join('');
  await writeFile(
    path.join(positive, 'synthetic-fixture.txt'),
    `synthetic=${syntheticSecret}\n`,
  );
  await commitAll(
    positive,
    'add synthetic secret fixture',
    '2024-01-01T00:00:00Z',
  );

  const reportPath = path.join(fixtureRoot, 'gitleaks-positive.json');
  const positiveResult = spawnSync(
    gitleaksBin,
    [
      'git',
      '--no-banner',
      '--redact=100',
      '--report-format=json',
      `--report-path=${reportPath}`,
      positive,
    ],
    { encoding: 'utf8' },
  );
  if (positiveResult.status !== 1) {
    throw new Error(
      `Gitleaks positive fixture returned ${positiveResult.status}; expected 1.`,
    );
  }
  const report = await readFile(reportPath, 'utf8');
  if (
    !report.includes('synthetic-fixture.txt') ||
    report.includes(syntheticSecret)
  ) {
    throw new Error(
      'Gitleaks positive report is missing or not fully redacted.',
    );
  }

  const clean = path.join(fixtureRoot, 'gitleaks-clean');
  await initializeRepository(clean);
  await writeFile(path.join(clean, 'README.md'), 'Neutral fixture content.\n');
  await commitAll(clean, 'add clean fixture', '2024-01-01T00:00:00Z');
  run(gitleaksBin, ['git', '--no-banner', clean]);
}

async function createRewriteSource(directory) {
  await initializeRepository(directory);
  await writeFile(path.join(directory, 'stable.txt'), 'stable-content\n');
  await writeFile(
    path.join(directory, 'replace.txt'),
    'PRIVATE_LOCAL_MARKER\n',
  );
  await commitAll(directory, 'fixture first', '2024-02-01T00:00:00Z');
  await writeFile(
    path.join(directory, 'replace.txt'),
    'prefix PRIVATE_LOCAL_MARKER suffix\n',
  );
  await commitAll(directory, 'fixture second', '2024-02-02T00:00:00Z');
}

function historyMetadata(directory) {
  return run('git', ['log', '--reverse', '--format=%an%x00%ae%x00%aI%x00%P'], {
    cwd: directory,
  })
    .trimEnd()
    .split('\n')
    .map((line) => {
      const [author, email, date, parents] = line.split('\0');
      const parentCount = parents ? parents.split(' ').length : 0;
      return [author, email, date, parentCount].join('\0');
    })
    .join('\n');
}

async function rewriteClone(source, destination, replacements) {
  run('git', ['clone', '--no-local', source, destination]);
  const beforeMetadata = historyMetadata(destination);
  run(
    'python3',
    [
      gitFilterRepoBin,
      '--force',
      '--replace-text',
      replacements,
      '--refs',
      'refs/heads/main',
    ],
    { cwd: destination },
  );
  const afterMetadata = historyMetadata(destination);
  if (beforeMetadata !== afterMetadata) {
    throw new Error(
      'git-filter-repo changed author, timestamp or parent shape.',
    );
  }
  return run('git', ['rev-parse', 'HEAD'], { cwd: destination }).trim();
}

async function verifyGitFilterRepo() {
  const source = path.join(fixtureRoot, 'rewrite-source');
  await createRewriteSource(source);
  const replacements = path.join(fixtureRoot, 'replacements.txt');
  await writeFile(
    replacements,
    'literal:PRIVATE_LOCAL_MARKER==>PUBLIC_NEUTRAL_MARKER\n',
    { mode: 0o600 },
  );

  const cloneA = path.join(fixtureRoot, 'rewrite-a');
  const cloneB = path.join(fixtureRoot, 'rewrite-b');
  const headA = await rewriteClone(source, cloneA, replacements);
  const headB = await rewriteClone(source, cloneB, replacements);
  if (headA !== headB) {
    throw new Error('git-filter-repo produced non-deterministic commit IDs.');
  }

  const rewritten = await readFile(path.join(cloneA, 'replace.txt'), 'utf8');
  const stable = await readFile(path.join(cloneA, 'stable.txt'), 'utf8');
  if (
    rewritten !== 'prefix PUBLIC_NEUTRAL_MARKER suffix\n' ||
    stable !== 'stable-content\n'
  ) {
    throw new Error('git-filter-repo changed content outside the replacement.');
  }

  const commitMap = await readFile(
    path.join(cloneA, '.git', 'filter-repo', 'commit-map'),
    'utf8',
  );
  const mappedCommits = commitMap.trim().split('\n').slice(1);
  if (
    mappedCommits.length !== 2 ||
    mappedCommits.some((line) => /0{40}$/u.test(line))
  ) {
    throw new Error('git-filter-repo did not emit a complete two-commit map.');
  }
}

await verifyGitleaks();
await verifyGitFilterRepo();
console.log(
  'Publication-tool fixtures passed: redacted secret detection, clean history and deterministic mapped rewrite.',
);
