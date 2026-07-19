import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  packCandidates,
  packReleaseCandidates,
  runPnpm,
} from './release-candidate-utils.mjs';
import { loadM19ReleaseTarget } from './release-target.mjs';

const temporaryRoot = mkdtempSync(join(tmpdir(), 'schema-engine-source-'));

function extract(tarball, directory) {
  mkdirSync(directory, { recursive: true });
  execFileSync('tar', ['-xzf', tarball], { cwd: directory, stdio: 'inherit' });
  return join(directory, 'package');
}

function installAndBuild(packageRoot, installArgs = [], offline = false) {
  const harness = join(packageRoot, 'source-build');
  runPnpm(
    [
      'install',
      '--frozen-lockfile',
      '--ignore-workspace',
      ...(offline ? ['--offline'] : []),
      ...installArgs,
    ],
    { cwd: harness, stdio: 'inherit' },
  );
  runPnpm(['run', 'build'], { cwd: harness, stdio: 'inherit' });
}

function declaration(packageRoot, output) {
  return readFileSync(join(packageRoot, output, 'index.d.ts'), 'utf8');
}

async function loadIndex(packageRoot, output) {
  return import(pathToFileURL(join(packageRoot, output, 'index.js')).href);
}

function angularBehavior(
  packageRoot,
  output,
  providerName = 'provideSchemaEngineAngular',
) {
  const compiler = pathToFileURL(
    join(packageRoot, 'node_modules/@angular/compiler/fesm2022/compiler.mjs'),
  ).href;
  const index = pathToFileURL(join(packageRoot, output, 'index.js')).href;
  const program = `
    await import(${JSON.stringify(compiler)});
    const api = await import(${JSON.stringify(index)});
    console.log(JSON.stringify({
      keys: Object.keys(api),
      providerType: typeof api[${JSON.stringify(providerName)}](),
    }));
  `;
  return JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '--eval', program], {
      encoding: 'utf8',
    }),
  );
}

try {
  assert.equal(process.version, 'v22.23.1');
  const includeAngularAria = process.argv.includes('--include-angular-aria');
  const offline = process.argv.includes('--offline');
  const coreTarballArgument = process.argv
    .find((argument) => argument.startsWith('--core-tarball='))
    ?.slice('--core-tarball='.length);
  const angularTarballArgument = process.argv
    .find((argument) => argument.startsWith('--angular-tarball='))
    ?.slice('--angular-tarball='.length);
  assert.equal(
    coreTarballArgument === undefined,
    angularTarballArgument === undefined,
    'Both candidate tarballs must be supplied together',
  );
  const tarballs =
    coreTarballArgument === undefined
      ? includeAngularAria
        ? packReleaseCandidates(
            temporaryRoot,
            loadM19ReleaseTarget().descriptor,
          )
        : packCandidates(temporaryRoot)
      : {
          core: resolve(coreTarballArgument),
          angular: resolve(angularTarballArgument),
        };

  const coreRoot = extract(tarballs.core, join(temporaryRoot, 'core'));
  installAndBuild(coreRoot, [], offline);
  assert.equal(
    declaration(coreRoot, 'rebuilt-dist'),
    declaration(coreRoot, 'dist'),
    'Core root declarations differ after source rebuild',
  );

  const shippedCore = await loadIndex(coreRoot, 'dist');
  const rebuiltCore = await loadIndex(coreRoot, 'rebuilt-dist');
  assert.deepEqual(Object.keys(rebuiltCore), Object.keys(shippedCore));
  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: { name: { type: 'string' } },
  };
  assert.equal(shippedCore.compileFormDefinition({ schema }).success, true);
  assert.equal(rebuiltCore.compileFormDefinition({ schema }).success, true);

  const angularDirectory = join(temporaryRoot, 'angular');
  mkdirSync(angularDirectory, { recursive: true });
  const angularRoot = extract(tarballs.angular, angularDirectory);
  installAndBuild(angularRoot, ['--modules-dir', '../node_modules'], offline);
  assert.equal(
    declaration(angularRoot, 'rebuilt-dist'),
    declaration(angularRoot, 'dist'),
    'Angular root declarations differ after source rebuild',
  );

  const shippedAngular = angularBehavior(angularRoot, 'dist');
  const rebuiltAngular = angularBehavior(angularRoot, 'rebuilt-dist');
  assert.deepEqual(rebuiltAngular, shippedAngular);
  assert.equal(shippedAngular.providerType, 'object');

  if (includeAngularAria) {
    assert.notEqual(tarballs.angularAria, undefined);
    const pilotDirectory = join(temporaryRoot, 'pilot');
    mkdirSync(pilotDirectory, { recursive: true });
    const pilotRoot = extract(tarballs.angularAria, pilotDirectory);
    installAndBuild(pilotRoot, ['--modules-dir', '../node_modules'], offline);
    assert.equal(
      declaration(pilotRoot, 'rebuilt-dist'),
      declaration(pilotRoot, 'dist'),
      'Angular Aria root declarations differ after source rebuild',
    );
    const shippedPilot = angularBehavior(
      pilotRoot,
      'dist',
      'provideSchemaEngineAngularAriaContainers',
    );
    const rebuiltPilot = angularBehavior(
      pilotRoot,
      'rebuilt-dist',
      'provideSchemaEngineAngularAriaContainers',
    );
    assert.deepEqual(rebuiltPilot, shippedPilot);
    assert.deepEqual(shippedPilot.keys, [
      'provideSchemaEngineAngularAriaContainers',
    ]);
  }

  console.log(
    `Verified isolated frozen source rebuilds, declarations, exports and behavior${includeAngularAria ? ' for the private M18 line' : ''}.`,
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
