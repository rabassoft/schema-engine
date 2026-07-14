import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const stableGuidePaths = ['AGENTS.md', 'HANDOFF.md'];
const onboardingPaths = ['README.md', '.ai-docs/README.md'];
const statusPath = '.ai-docs/project/STATUS.md';
const ignoredDirectories = new Set([
  '.git',
  '.pnpm-store',
  'coverage',
  'dist',
  'node_modules',
]);
const failures = [];

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  failures.push(message);
}

for (const guidePath of stableGuidePaths) {
  const guide = await read(guidePath);
  const volatileIdentifier = guide.match(
    /\b(?:ADR|PLAN|SPEC)-\d{3}\b|\bM\d+\b|\bv\d+\.\d+\.\d+\b/,
  );

  if (volatileIdentifier) {
    fail(
      `${guidePath} contains volatile project state: ${volatileIdentifier[0]}`,
    );
  }
}

const status = await read(statusPath);
const ephemeralGitClaim = status.match(
  /\bcommits? ahead\b|\bcommits? behind\b|no push performed|nothing was pushed/i,
);

if (ephemeralGitClaim) {
  fail(`${statusPath} contains ephemeral Git state: ${ephemeralGitClaim[0]}`);
}

const acceptedSpecificationBlock = status.match(
  /- \*\*Accepted specifications:\*\*([\s\S]*?)(?=\n- \*\*)/,
);
const acceptedSpecifications = [
  ...(acceptedSpecificationBlock?.[1] ?? '')
    .replaceAll(/\s+/g, ' ')
    .matchAll(/SPEC-\d{3}\s+v\d+\.\d+\.\d+/g),
].map(([specification]) => specification);

if (acceptedSpecifications.length === 0) {
  fail(`${statusPath} does not identify any accepted specification versions`);
}

for (const onboardingPath of onboardingPaths) {
  const onboarding = (await read(onboardingPath)).replaceAll(/\s+/g, ' ');
  for (const specification of new Set(acceptedSpecifications)) {
    if (!onboarding.includes(specification)) {
      fail(`${onboardingPath} does not report accepted ${specification}`);
    }
  }
}

async function collectMarkdownFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(absolutePath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(absolutePath);
    }
  }

  return files;
}

const markdownFiles = await collectMarkdownFiles();
let localLinkCount = 0;

for (const markdownPath of markdownFiles) {
  const markdown = await readFile(markdownPath, 'utf8');
  const links = markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g);

  for (const [, rawTarget] of links) {
    const target = rawTarget.trim().replace(/^<|>$/g, '');
    if (
      target === '' ||
      target.startsWith('#') ||
      /^(?:https?:|mailto:)/i.test(target)
    ) {
      continue;
    }

    localLinkCount += 1;
    const fileTarget = decodeURIComponent(target.split('#', 1)[0]);
    const absoluteTarget = path.resolve(path.dirname(markdownPath), fileTarget);

    try {
      await access(absoluteTarget);
    } catch {
      fail(
        `${path.relative(root, markdownPath)} references missing ${fileTarget}`,
      );
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Documentation checks passed: ${markdownFiles.length} Markdown files, ${localLinkCount} local links, stable guides and accepted versions consistent.`,
  );
}
