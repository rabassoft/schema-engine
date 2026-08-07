import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  listTarball,
  packCoreCandidate,
  packReactCandidate,
  readTarballJson,
  readTarballText,
  runPnpm,
  workspaceRoot,
} from './release-candidate-utils.mjs';

const temporaryRoot = mkdtempSync(
  join(tmpdir(), 'schema-engine-react-artifact-'),
);
const sourceFiles = Object.freeze([
  'contracts.ts',
  'index.ts',
  'internal/compound-text.ts',
  'internal/compound.tsx',
  'internal/controller.ts',
  'internal/diagnostics.ts',
  'internal/handle.ts',
  'internal/native/common.tsx',
  'internal/native/number-codec.ts',
  'internal/native/registrations.ts',
  'internal/native/renderers.tsx',
  'internal/registry-brand.ts',
  'internal/registry.ts',
  'internal/store.ts',
  'internal/text.ts',
  'internal/wizard.tsx',
  'schema-form.tsx',
  'use-schema-form.ts',
]);
const modules = Object.freeze(
  sourceFiles.map((file) => file.replace(/\.tsx?$/u, '')),
);
const moduleSuffixes = Object.freeze(['.js', '.js.map', '.d.ts', '.d.ts.map']);
const publicValues = Object.freeze([
  'SchemaForm',
  'createReactNativeRendererRegistry',
  'createReactRendererRegistry',
  'useSchemaForm',
]);
const publicTypes = Object.freeze([
  'ReactControlledFormConfig',
  'ReactFieldRendererProps',
  'ReactFieldTextSnapshot',
  'ReactFormActions',
  'ReactFormHandle',
  'ReactFormState',
  'ReactRendererComponent',
  'ReactRendererRegistration',
  'ReactRendererRegistry',
  'ReactRendererRegistryResult',
  'ReactRendererTester',
  'SchemaFormProps',
]);
const sourceHeader =
  '// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft\n' +
  '// SPDX-License-Identifier: AGPL-3.0-only\n';

function expectedFiles() {
  return new Set([
    'package/package.json',
    'package/README.md',
    'package/SOURCE.md',
    'package/LICENSE',
    'package/NOTICE.md',
    'package/source-build/package.json',
    'package/source-build/pnpm-lock.yaml',
    'package/source-build/prepare-dependencies.mjs',
    'package/source-build/tsconfig.json',
    ...sourceFiles.map((file) => `package/src/${file}`),
    ...modules.flatMap((module) =>
      moduleSuffixes.map((suffix) => `package/dist/${module}${suffix}`),
    ),
  ]);
}

function extract(tarball, directory) {
  mkdirSync(directory, { recursive: true });
  execFileSync('tar', ['-xzf', tarball], { cwd: directory });
  return join(directory, 'package');
}

function declarations(directory) {
  const output = new Map();
  function visit(current, prefix = '') {
    for (const entry of readdirSync(current)) {
      const path = join(current, entry);
      const relative = prefix === '' ? entry : `${prefix}/${entry}`;
      if (statSync(path).isDirectory()) visit(path, relative);
      else if (entry.endsWith('.d.ts'))
        output.set(relative, readFileSync(path, 'utf8'));
    }
  }
  visit(directory);
  return output;
}

try {
  const coreTarball = packCoreCandidate(temporaryRoot);
  const reactTarball = packReactCandidate(temporaryRoot);
  const files = new Set(
    listTarball(reactTarball).filter((member) => !member.endsWith('/')),
  );
  assert.deepEqual(
    [...files].sort(),
    [...expectedFiles()].sort(),
    'private React tarball inventory changed',
  );

  const manifest = readTarballJson(reactTarball, 'package/package.json');
  assert.equal(manifest.name, '@rabassoft/schema-engine-react');
  assert.equal(manifest.version, '0.0.0');
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.publishConfig, undefined);
  assert.deepEqual(manifest.files, [
    'dist',
    'src',
    'source-build',
    'README.md',
    'SOURCE.md',
    'NOTICE.md',
  ]);
  assert.deepEqual(manifest.exports, {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js',
    },
  });
  assert.deepEqual(manifest.peerDependencies, {
    react: '>=19.2.0 <20.0.0',
    'react-dom': '>=19.2.0 <20.0.0',
    '@rabassoft/schema-engine': '0.4.1',
  });
  assert.deepEqual(manifest.devDependencies, {
    '@types/react': '19.2.17',
    '@types/react-dom': '19.2.3',
    react: '19.2.8',
    'react-dom': '19.2.8',
    '@rabassoft/schema-engine': '0.4.1',
  });
  assert.equal(JSON.stringify(manifest).includes('workspace:'), false);

  const sourceBuildManifest = readTarballJson(
    reactTarball,
    'package/source-build/package.json',
  );
  assert.equal(sourceBuildManifest.private, true);
  assert.equal(sourceBuildManifest.packageManager, 'pnpm@10.28.2');
  assert.deepEqual(sourceBuildManifest.devDependencies, {
    '@types/react': '19.2.17',
    '@types/react-dom': '19.2.3',
    react: '19.2.8',
    'react-dom': '19.2.8',
    typescript: '6.0.2',
  });

  for (const file of sourceFiles)
    assert.ok(
      readTarballText(reactTarball, `package/src/${file}`).startsWith(
        sourceHeader,
      ),
      `missing source license header: ${file}`,
    );

  const rootDeclaration = readTarballText(
    reactTarball,
    'package/dist/index.d.ts',
  );
  const declaredTypeInventory = [
    ...rootDeclaration.matchAll(/export type \{(?<members>[\s\S]*?)\} from/gu),
  ]
    .flatMap((match) => match.groups?.members.split(',') ?? [])
    .map((member) => member.trim())
    .filter(Boolean)
    .sort();
  assert.deepEqual(declaredTypeInventory, [...publicTypes].sort());
  for (const name of publicTypes)
    assert.equal(
      rootDeclaration.match(new RegExp(`\\b${name}\\b`, 'gu'))?.length,
      1,
      `${name} root declaration changed`,
    );
  for (const internalName of [
    'BridgeStore',
    'ReactFormController',
    'RendererErrorBoundary',
    'WizardHost',
  ])
    assert.doesNotMatch(
      rootDeclaration,
      new RegExp(`\\b${internalName}\\b`, 'u'),
    );

  const emittedJavaScript = modules
    .map((module) => readTarballText(reactTarball, `package/dist/${module}.js`))
    .join('\n');
  assert.match(emittedJavaScript, /from ['"]react(?:\/jsx-runtime)?['"]/u);
  assert.match(emittedJavaScript, /from ['"]@rabassoft\/schema-engine['"]/u);
  assert.doesNotMatch(
    emittedJavaScript,
    /@angular|reference-angular|reference-standard|apps\/|packages\/core\/src/u,
  );

  const coreRoot = extract(coreTarball, join(temporaryRoot, 'core'));
  const reactRoot = extract(reactTarball, join(temporaryRoot, 'react'));
  const offline = process.argv.includes('--offline');
  for (const root of [coreRoot, reactRoot]) {
    runPnpm(
      [
        'install',
        '--frozen-lockfile',
        '--ignore-workspace',
        '--ignore-scripts',
        '--store-dir',
        join(workspaceRoot, '.pnpm-store'),
        ...(offline ? ['--offline'] : []),
      ],
      { cwd: join(root, 'source-build'), stdio: 'inherit' },
    );
    runPnpm(['run', 'build'], {
      cwd: join(root, 'source-build'),
      stdio: 'inherit',
    });
  }

  assert.deepEqual(
    declarations(join(reactRoot, 'rebuilt-dist')),
    declarations(join(reactRoot, 'dist')),
    'React declarations differ after isolated source reconstruction',
  );
  const shipped = await import(
    pathToFileURL(join(reactRoot, 'dist/index.js')).href
  );
  const rebuilt = await import(
    pathToFileURL(join(reactRoot, 'rebuilt-dist/index.js')).href
  );
  assert.deepEqual(Object.keys(shipped), publicValues);
  assert.deepEqual(Object.keys(rebuilt), publicValues);

  const readme = readTarballText(reactTarball, 'package/README.md');
  const source = readTarballText(reactTarball, 'package/SOURCE.md');
  const notice = readTarballText(reactTarball, 'package/NOTICE.md');
  assert.match(readme, /Public \+ Experimental/u);
  assert.match(readme, /client-rendered/u);
  assert.match(readme, /private: true/u);
  assert.match(source, /isolated source reconstruction/u);
  assert.match(notice, /ricard@rabassoft\.com/u);

  console.log(
    'Verified private React packed inventory, peer rewriting, externalized graph and isolated source reconstruction.',
  );
} finally {
  if (!process.env.KEEP_SCHEMA_ENGINE_CONSUMERS)
    rmSync(temporaryRoot, { recursive: true, force: true });
  else console.error(`Preserved React artifact at ${temporaryRoot}`);
}
