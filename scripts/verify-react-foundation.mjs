// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('.');
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), 'utf8'));

const workspace = readJson('package.json');
const adapter = readJson('packages/react/package.json');
const shell = readJson('apps/reference-react/package.json');

assert.equal(workspace.devDependencies?.['@vitejs/plugin-react'], '6.0.4');
assert.deepEqual(
  Object.fromEntries(
    [
      'reference:react:build',
      'reference:react:dev',
      'reference:react:test:e2e',
      'reference:react:test:unit',
    ].map((name) => [name, workspace.scripts?.[name]]),
  ),
  {
    'reference:react:build':
      "pnpm --filter '@schema-engine-internal/reference-react...' build",
    'reference:react:dev':
      'pnpm reference:react:build && pnpm --parallel --filter @schema-engine-internal/reference-scenarios --filter @schema-engine-internal/reference-react run dev',
    'reference:react:test:e2e':
      'pnpm reference:react:build && node scripts/run-reference-playwright.mjs --config=apps/reference-react/playwright.config.ts',
    'reference:react:test:unit':
      'pnpm reference:react:build && pnpm --filter @schema-engine-internal/reference-react test',
  },
);

assert.equal(adapter.name, '@rabassoft/schema-engine-react');
assert.equal(adapter.version, '0.0.0');
assert.equal(adapter.private, true);
assert.equal(adapter.type, 'module');
assert.equal(adapter.sideEffects, false);
assert.equal(adapter.license, 'AGPL-3.0-only');
assert.equal(Object.hasOwn(adapter, 'publishConfig'), false);
assert.deepEqual(adapter.exports, {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/index.js',
    default: './dist/index.js',
  },
});
assert.deepEqual(adapter.peerDependencies, {
  '@rabassoft/schema-engine': 'workspace:*',
  react: '>=19.2.0 <20.0.0',
  'react-dom': '>=19.2.0 <20.0.0',
});
assert.deepEqual(adapter.devDependencies, {
  '@rabassoft/schema-engine': 'workspace:*',
  '@types/react': '19.2.17',
  '@types/react-dom': '19.2.3',
  react: '19.2.8',
  'react-dom': '19.2.8',
});

assert.equal(shell.name, '@schema-engine-internal/reference-react');
assert.equal(shell.version, '0.0.0');
assert.equal(shell.private, true);
assert.equal(Object.hasOwn(shell, 'exports'), false);
assert.equal(Object.hasOwn(shell, 'publishConfig'), false);
assert.deepEqual(shell.dependencies, {
  '@codemirror/lang-javascript': '6.2.5',
  '@codemirror/lang-json': '6.0.2',
  '@codemirror/language': '6.12.4',
  '@lezer/highlight': '1.2.3',
  '@rabassoft/schema-engine': 'workspace:*',
  '@rabassoft/schema-engine-react': 'workspace:*',
  '@rabassoft/schema-engine-validator-ajv': 'workspace:*',
  '@schema-engine-internal/reference-scenarios': 'workspace:*',
  codemirror: '6.0.2',
  react: '19.2.8',
  'react-dom': '19.2.8',
});
assert.deepEqual(shell.devDependencies, {
  '@types/react': '19.2.17',
  '@types/react-dom': '19.2.3',
});
assert.equal(shell.scripts?.dev.includes('4213'), true);
assert.equal(shell.scripts?.['dev:e2e'].includes('4214'), true);

assert.equal(readJson('packages/core/package.json').version, '0.4.1');
assert.equal(readJson('packages/angular/package.json').version, '0.4.1');
assert.equal(readJson('packages/angular-aria/package.json').version, '0.2.1');

const lockfile = readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8');
for (const expected of [
  '  apps/reference-react:',
  '  packages/react:',
  "  '@types/react-dom@19.2.3':",
  "  '@types/react@19.2.17':",
  "  '@vitejs/plugin-react@6.0.4':",
  '  csstype@3.2.3:',
  '  react-dom@19.2.8:',
  '  react@19.2.8:',
  '  scheduler@0.27.0:',
]) {
  assert.equal(
    lockfile.includes(expected),
    true,
    `resolved React foundation is missing ${expected.trim()}`,
  );
}
assert.equal(
  /^[ ]{2}'@rolldown\/plugin-babel@/mu.test(lockfile),
  false,
  'the optional Rolldown Babel peer must remain unresolved',
);
assert.equal(
  /^[ ]{2}babel-plugin-react-compiler@/mu.test(lockfile),
  false,
  'the optional React Compiler peer must remain unresolved',
);

console.log(
  'Verified PLAN-037 checkpoint-1 React foundation: exact private projects, manifests, commands, ports, resolved graph and unchanged published source versions.',
);
