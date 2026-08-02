import path from 'node:path';

export const REQUIRED_PUBLIC_FILES = Object.freeze([
  'LICENSE',
  'README.md',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
]);

const forbiddenBasenames = new Set([
  '.npmrc',
  'credentials',
  'credentials.json',
  'auth.json',
  'id_rsa',
  'id_ed25519',
]);

const forbiddenExtensions = new Set([
  '.key',
  '.pem',
  '.p12',
  '.pfx',
  '.tgz',
  '.log',
]);

const contentRules = Object.freeze([
  {
    id: 'macos-home-path',
    pattern: /\/Users\/[A-Za-z0-9._-]+\//u,
  },
  {
    id: 'linux-home-path',
    pattern: /\/home\/[A-Za-z0-9._-]+\//u,
  },
  {
    id: 'macos-private-cache-path',
    pattern: /\/private\/var\/folders\//u,
  },
  {
    id: 'private-key-block',
    pattern: new RegExp(`-{5}BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-{5}`),
  },
  {
    id: 'github-token',
    pattern: new RegExp(`(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{20,}`),
  },
  {
    id: 'npm-token',
    pattern: new RegExp(`npm_[A-Za-z0-9]{20,}`),
  },
  {
    id: 'registry-auth',
    pattern: new RegExp(
      `//registry\\.npmjs\\.org/:_authToken\\s*=\\s*[^\\s$][^\\s]*`,
      'i',
    ),
  },
  {
    id: 'private-ipv4-url',
    pattern:
      /https?:\/\/(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?(?:\/|\b)/iu,
  },
]);

const reviewedHistoricalFindings = new Set([
  [
    '8edc2b93ca82942df7d2b5e07657fecc70107cc5',
    '.ai-docs/reviews/132-plan-021-final-review.md',
    'macos-home-path',
  ].join(':'),
]);

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/').replace(/^\.\//u, '');
}

export function trackedPathFinding(relativePath) {
  const normalized = normalize(relativePath);
  const basename = path.posix.basename(normalized).toLowerCase();
  const extension = path.posix.extname(basename).toLowerCase();

  if (normalized === '.env.example') return undefined;
  if (basename === '.env' || basename.startsWith('.env.')) {
    return 'environment-file';
  }
  if (forbiddenBasenames.has(basename)) return 'credential-file';
  if (forbiddenExtensions.has(extension)) return 'generated-or-secret-file';
  if (
    normalized.startsWith('.local-docs/') ||
    normalized.startsWith('.release/') ||
    normalized.startsWith('coverage/') ||
    normalized.startsWith('playwright-report/') ||
    normalized.startsWith('test-results/')
  ) {
    return normalized.startsWith('.local-docs/')
      ? 'operator-local-directory'
      : 'generated-directory';
  }
  return undefined;
}

export function contentFindings(content) {
  return contentRules
    .filter(({ pattern }) => pattern.test(content))
    .map(({ id }) => id);
}

export function evaluatePublicTree(records) {
  const findings = [];
  const paths = new Set(
    records.map(({ relativePath }) => normalize(relativePath)),
  );

  for (const requiredPath of REQUIRED_PUBLIC_FILES) {
    if (!paths.has(requiredPath)) {
      findings.push({
        relativePath: requiredPath,
        rule: 'missing-public-file',
      });
    }
  }

  for (const record of records) {
    const relativePath = normalize(record.relativePath);
    const pathRule = trackedPathFinding(relativePath);
    if (pathRule) findings.push({ relativePath, rule: pathRule });
    if (record.text === undefined) continue;
    for (const rule of contentFindings(record.text)) {
      findings.push({ relativePath, rule });
    }
  }

  return findings;
}

export function evaluatePublicHistory(records) {
  const findings = [];
  const seen = new Set();

  for (const record of records) {
    const relativePath = normalize(record.relativePath);
    const rules = [];
    const pathRule = trackedPathFinding(relativePath);
    if (pathRule) rules.push(pathRule);
    if (record.text !== undefined) rules.push(...contentFindings(record.text));

    for (const rule of rules) {
      const key = `${record.objectId}:${relativePath}:${rule}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (reviewedHistoricalFindings.has(key)) continue;
      findings.push({
        objectId: record.objectId,
        relativePath,
        rule,
      });
    }
  }

  return findings;
}
