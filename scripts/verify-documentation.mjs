import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const stableGuidePaths = ['AGENTS.md', 'HANDOFF.md'];
const onboardingPaths = ['README.md', '.ai-docs/README.md'];
const statusPath = '.ai-docs/project/STATUS.md';
const specificationDirectory = '.ai-docs/specs';
const specificationIndexPath = '.ai-docs/specs/000-index.md';
const staleCurrentClaims = [
  {
    path: '.ai-docs/releases/0.1.0.md',
    pattern: /completed M1[–-]M9 and G0 plus PLAN-010 checkpoints\s+1[–-]6/i,
    description: 'pre-completion M10 release scope',
  },
  {
    path: '.ai-docs/releases/0.1.0.md',
    pattern: /Final M10 review remains checkpoint 7/i,
    description: 'pending PLAN-010 checkpoint 7',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern:
      /PLAN-010 revisión 0 fue aprobado y sus checkpoints 1[–-]6 implementaron/i,
    description: 'partial PLAN-010 completion',
  },
  {
    path: '.ai-docs/adrs/016-resolucion-referencias-locales.md',
    pattern:
      /\*\*Authorized follow-up:\*\* Draft and review ADR-005 revision 3/i,
    description: 'completed ADR-016 follow-up as pending',
  },
  {
    path: '.ai-docs/adrs/016-resolucion-referencias-locales.md',
    pattern: /\*\*SPEC, plan and implementation authorized:\*\* No/i,
    description: 'pre-SPEC-004 authorization gate',
  },
  {
    path: '.ai-docs/releases/0.1.0.md',
    pattern: /accepted but unimplemented SPEC-004/i,
    description: 'pre-completion M11 release scope',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /Checkpoint 3 aún no empezó/i,
    description: 'pre-integration PLAN-011 state',
  },
  {
    path: '.ai-docs/specs/004-local-reference-resolution.md',
    pattern: /behavior remains inactive/i,
    description: 'pre-completion SPEC-004 implementation state',
  },
  {
    path: '.ai-docs/adrs/000-index.md',
    pattern: /sin implementación autorizada/i,
    description: 'pre-completion D-041 ADR index state',
  },
];
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

for (const staleClaim of staleCurrentClaims) {
  const document = await read(staleClaim.path);
  const match = document.match(staleClaim.pattern);

  if (match) {
    fail(
      `${staleClaim.path} contains stale ${staleClaim.description}: ${match[0]}`,
    );
  }
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

const specificationEntries = await readdir(
  path.join(root, specificationDirectory),
);
const specifications = new Map();

for (const entry of specificationEntries.filter(
  (name) => name.endsWith('.md') && name !== '000-index.md',
)) {
  const relativePath = path.join(specificationDirectory, entry);
  const document = await read(relativePath);
  const identifier = document.match(/^# (SPEC-\d{3}):/m)?.[1];
  const state = document.match(/^- \*\*(?:State|Estado):\*\* (.+)$/m)?.[1];
  const version = document.match(/^- \*\*(?:Version|Versión):\*\* (.+)$/m)?.[1];

  if (!identifier || !state || !version) {
    fail(
      `${relativePath} does not expose a parseable identifier/state/version`,
    );
    continue;
  }

  specifications.set(identifier, { relativePath, state, version });
}

const specificationIndex = await read(specificationIndexPath);
for (const [identifier, document] of specifications) {
  const stateAndVersion = `**${document.state} ${document.version}`;
  const indexEntry = specificationIndex
    .split(/\r?\n/)
    .find((line) => line.includes(`[${identifier}:`));
  if (!indexEntry || !indexEntry.includes(stateAndVersion)) {
    fail(
      `${specificationIndexPath} does not report ${identifier} as ${document.state} ${document.version}`,
    );
  }
}

for (const acceptedSpecification of acceptedSpecifications) {
  const [identifier, version] = acceptedSpecification.split(/\s+v/);
  const document = specifications.get(identifier);

  if (!document) {
    fail(`${statusPath} references missing ${identifier}`);
  } else if (document.state !== 'Accepted' || document.version !== version) {
    fail(
      `${statusPath} reports ${acceptedSpecification}, but ${document.relativePath} is ${document.state} v${document.version}`,
    );
  }
}

const proposedSpecification = status
  .match(/- \*\*Last proposed specification:\*\*([^\n]+)/)?.[1]
  ?.match(/(SPEC-\d{3})\s+v(\d+\.\d+\.\d+)/);

if (proposedSpecification) {
  const [, identifier, version] = proposedSpecification;
  const document = specifications.get(identifier);

  if (!document) {
    fail(`${statusPath} references missing proposed ${identifier}`);
  } else if (document.state !== 'Draft' || document.version !== version) {
    fail(
      `${statusPath} reports proposed ${identifier} v${version}, but ${document.relativePath} is ${document.state} v${document.version}`,
    );
  }
}

for (const onboardingPath of onboardingPaths) {
  const onboarding = (await read(onboardingPath)).replaceAll(/\s+/g, ' ');
  for (const specification of new Set(acceptedSpecifications)) {
    if (!onboarding.includes(specification)) {
      fail(`${onboardingPath} does not report accepted ${specification}`);
    }
  }

  if (proposedSpecification) {
    const [, identifier, version] = proposedSpecification;
    const specification = `${identifier} v${version}`;
    if (!onboarding.includes(specification)) {
      fail(`${onboardingPath} does not report proposed ${specification}`);
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
