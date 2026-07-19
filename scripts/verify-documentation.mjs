import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { M19_RELEASE_DESCRIPTOR } from './release-target.mjs';

const root = process.cwd();
const stableGuidePaths = ['AGENTS.md', 'HANDOFF.md'];
const onboardingPaths = ['README.md', '.ai-docs/README.md'];
const statusPath = '.ai-docs/project/STATUS.md';
const specificationDirectory = '.ai-docs/specs';
const specificationIndexPath = '.ai-docs/specs/000-index.md';
const publishableManifestPaths = M19_RELEASE_DESCRIPTOR.packages.map(
  ({ workspacePath }) => `${workspacePath}/package.json`,
);
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
  {
    path: 'packages/core/README.md',
    pattern: /mandatory `latest`/i,
    description: 'universal initial latest claim',
  },
  {
    path: 'packages/angular/README.md',
    pattern: /mandatory `latest`/i,
    description: 'universal initial latest claim',
  },
  {
    path: 'packages/angular/README.md',
    pattern: /pending checkpoint gate/i,
    description: 'pre-completion M18 compatibility state',
  },
  {
    path: 'packages/angular-aria/README.md',
    pattern: /PLAN-020 gates/i,
    description: 'obsolete pilot publication gate',
  },
  {
    path: 'packages/angular-aria/SOURCE.md',
    pattern: /The private pilot includes/i,
    description: 'pre-M19 private pilot source state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /State:\*\* Published/i,
    description: 'unobserved M19 publication claim',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /\*\*Source commit:\*\* [0-9a-f]{40}/i,
    description: 'pre-checkpoint-3 selected candidate claim',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /checkpoint 3 local\s+candidate selection remains pending/i,
    description: 'pre-completion checkpoint 3 state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /No selected tarball hashes or source commit exist yet/i,
    description: 'pre-candidate checkpoint 3 state',
  },
  {
    path: '.ai-docs/releases/0.3.0.md',
    pattern: /later checkpoint 3 may represent M19/i,
    description: 'future checkpoint 3 state',
  },
  {
    path: '.ai-docs/project/ROADMAP.md',
    pattern: /No hay implementación ni acción externa autorizada/i,
    description: 'pre-completion M19 implementation state',
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
const publishableManifests = await Promise.all(
  publishableManifestPaths.map(async (manifestPath) => [
    manifestPath,
    JSON.parse(await read(manifestPath)),
  ]),
);
for (const [
  index,
  packageTarget,
] of M19_RELEASE_DESCRIPTOR.packages.entries()) {
  const [manifestPath, manifest] = publishableManifests[index];
  if (manifest.name !== packageTarget.name) {
    fail(`${manifestPath} does not report ${packageTarget.name}`);
  }
  if (manifest.version !== packageTarget.version) {
    fail(
      `${manifestPath} reports ${manifest.version}, expected ${packageTarget.version}`,
    );
  }
  if (
    manifest.license !== 'AGPL-3.0-only' ||
    manifest.private !== undefined ||
    manifest.repository !== undefined ||
    manifest.publishConfig?.access !== 'public' ||
    manifest.publishConfig?.tag !== M19_RELEASE_DESCRIPTOR.distTag ||
    manifest.publishConfig?.provenance !== M19_RELEASE_DESCRIPTOR.provenance
  ) {
    fail(`${manifestPath} does not match the M19 distribution boundary`);
  }
}

const candidateOnboarding = new Map([
  ['README.md', M19_RELEASE_DESCRIPTOR.packages],
  ['.ai-docs/releases/0.3.0.md', M19_RELEASE_DESCRIPTOR.packages],
  ['packages/core/README.md', [M19_RELEASE_DESCRIPTOR.packages[0]]],
  ['packages/angular/README.md', M19_RELEASE_DESCRIPTOR.packages.slice(0, 2)],
  ['packages/angular-aria/README.md', M19_RELEASE_DESCRIPTOR.packages.slice(1)],
]);
for (const [onboardingPath, packageTargets] of candidateOnboarding) {
  const onboarding = await read(onboardingPath);
  for (const { name, version } of packageTargets) {
    if (!onboarding.includes(name) || !onboarding.includes(version)) {
      fail(`${onboardingPath} omits candidate ${name}@${version}`);
    }
  }
  if (/npm provenance is (?:available|enabled)/iu.test(onboarding)) {
    fail(`${onboardingPath} incorrectly claims npm provenance`);
  }
}

const m19ReleaseNotePath = '.ai-docs/releases/0.3.0.md';
const m19ReleaseNote = await read(m19ReleaseNotePath);
const requiredM19ReleaseFragments = [
  '@angular/core >=22.0.6 <23.0.0',
  '@angular/aria >=22.0.5 <23.0.0',
  '@angular/cdk >=22.0.5 <23.0.0',
  'Public + Experimental + Active',
  'private repository',
  'no advertised repository URL',
  'npm provenance',
];
for (const fragment of requiredM19ReleaseFragments) {
  if (!m19ReleaseNote.includes(fragment)) {
    fail(`${m19ReleaseNotePath} omits required M19 contract: ${fragment}`);
  }
}

const invalidM19ReleaseClaims = [
  {
    pattern:
      /(?:latest|default)[^\n.]{0,80}(?:promotes?|marks?|means?)\s+(?:the\s+)?(?:API\s+)?Stable/i,
    description: 'default-channel stability promotion',
  },
  {
    pattern:
      /pilot[^\n.]{0,80}`latest`[^\n.]{0,80}(?:mandatory|guaranteed|absent)/i,
    description: 'predicted pilot latest state',
  },
  {
    pattern: /(?:repository is public|public GitHub repository)/i,
    description: 'unobserved public repository state',
  },
  {
    pattern:
      /(?:provenance is enabled|with npm provenance|trusted publishing is enabled)/i,
    description: 'unobserved provenance state',
  },
];
for (const claim of invalidM19ReleaseClaims) {
  const match = m19ReleaseNote.match(claim.pattern);
  if (match) {
    fail(`${m19ReleaseNotePath} contains ${claim.description}: ${match[0]}`);
  }
}

const completedM19Publication =
  /Published packages:[^\n]*0\.3\.0/i.test(status) &&
  /Published packages:[^\n]*0\.1\.0/i.test(status);
if (
  completedM19Publication &&
  /(?:not published|no registry publication|private source candidate)/i.test(
    m19ReleaseNote,
  )
) {
  fail(`${m19ReleaseNotePath} retains pre-publication M19 state`);
}
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
