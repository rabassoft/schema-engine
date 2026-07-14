import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import {
  packCandidates,
  readWorkspacePackage,
  runPnpm,
} from './release-candidate-utils.mjs';

const ANGULAR_PACKAGES = Object.freeze([
  '@angular/common',
  '@angular/compiler',
  '@angular/compiler-cli',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
]);
const LOWER_ANGULAR = '22.0.6';
const REGISTRY_SOURCE = 'https://registry.npmjs.org';
const temporaryRoot = mkdtempSync(join(tmpdir(), 'schema-engine-consumers-'));
const emptyUserConfig = join(temporaryRoot, 'empty-user.npmrc');
writeFileSync(emptyUserConfig, '');

const cleanEnvironment = { ...process.env };
for (const name of Object.keys(cleanEnvironment)) {
  if (
    /^(?:NODE_AUTH_TOKEN|NPM_TOKEN)$/iu.test(name) ||
    /^NPM_CONFIG_.*(?:AUTH|TOKEN|PASSWORD)/iu.test(name)
  ) {
    delete cleanEnvironment[name];
  }
}
cleanEnvironment.NPM_CONFIG_USERCONFIG = emptyUserConfig;

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fileSpecifier(path) {
  return `file:${path}`;
}

function installConsumer(directory) {
  runPnpm(
    [
      'install',
      '--ignore-workspace',
      '--strict-peer-dependencies',
      '--config.auto-install-peers=false',
      '--reporter=silent',
    ],
    { cwd: directory, env: cleanEnvironment, stdio: 'inherit' },
  );
}

function executePnpm(directory, args) {
  runPnpm(args, { cwd: directory, env: cleanEnvironment, stdio: 'inherit' });
}

function assertDeepImportBlocked(directory, specifier) {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `await import(${JSON.stringify(specifier)})`,
    ],
    { cwd: directory, encoding: 'utf8', env: cleanEnvironment },
  );
  assert.notEqual(result.status, 0, `${specifier} unexpectedly resolved`);
}

async function registryMetadata(packageName) {
  const encoded = packageName.replace('/', '%2F');
  const response = await fetch(`${REGISTRY_SOURCE}/${encoded}`, {
    headers: { accept: 'application/vnd.npm.install-v1+json' },
  });
  if (!response.ok) {
    throw new Error(
      `Registry metadata failed for ${packageName}: ${response.status}`,
    );
  }
  return response.json();
}

function parsedAngularVersion(version) {
  const match = /^22\.(\d+)\.(\d+)$/u.exec(version);
  if (!match) {
    return undefined;
  }
  return [22, Number(match[1]), Number(match[2])];
}

function compareVersions(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

async function resolveUpperAngular() {
  const coreMetadata = await registryMetadata('@angular/core');
  const candidates = Object.entries(coreMetadata.versions)
    .flatMap(([version, manifest]) => {
      const parsed = parsedAngularVersion(version);
      return parsed && !manifest.deprecated ? [{ version, parsed }] : [];
    })
    .filter(({ parsed }) => compareVersions(parsed, [22, 0, 6]) >= 0)
    .sort((left, right) => compareVersions(right.parsed, left.parsed));

  assert.ok(
    candidates.length > 0,
    'No eligible stable Angular 22 version found',
  );
  const upper = candidates[0].version;

  const metadataEntries = await Promise.all(
    ANGULAR_PACKAGES.map(async (packageName) => [
      packageName,
      await registryMetadata(packageName),
    ]),
  );
  for (const [packageName, metadata] of metadataEntries) {
    const manifest = metadata.versions[upper];
    assert.ok(manifest, `${packageName}@${upper} is unavailable`);
    assert.equal(
      manifest.deprecated,
      undefined,
      `${packageName}@${upper} is deprecated`,
    );
  }

  return upper;
}

function verifyInstalledAngularTuple(directory, version) {
  for (const packageName of ANGULAR_PACKAGES) {
    const manifestPath = join(
      directory,
      'node_modules',
      ...packageName.split('/'),
      'package.json',
    );
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.version, version, `${packageName} is not aligned`);
  }
}

function createCoreConsumer(tarball, packageManager, typescriptVersion) {
  const directory = join(temporaryRoot, 'core-only');
  mkdirSync(join(directory, 'src'), { recursive: true });
  writeJson(join(directory, 'package.json'), {
    name: 'schema-engine-core-clean-consumer',
    private: true,
    type: 'module',
    packageManager,
    scripts: { build: 'tsc -p tsconfig.json' },
    dependencies: {
      '@rabassoft/schema-engine': fileSpecifier(tarball),
    },
    devDependencies: { typescript: typescriptVersion },
  });
  writeJson(join(directory, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      outDir: 'dist',
      rootDir: 'src',
      strict: true,
      skipLibCheck: false,
    },
    include: ['src/**/*.ts'],
  });
  writeFileSync(
    join(directory, 'src/main.ts'),
    `import { compileFormDefinition, createControlledFormRuntime } from '@rabassoft/schema-engine';

const compiled = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: { name: { type: 'string' } },
  },
});
if (!compiled.success) throw new Error('Compilation failed');
const created = createControlledFormRuntime({
  formId: 'clean-core',
  definition: compiled.definition,
  schema: { type: 'object', properties: { name: { type: 'string' } } },
  value: { name: 'Rabassoft' },
  baselineValue: { name: 'Rabassoft' },
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
if (!created.success) throw new Error('Runtime creation failed');
if (!created.runtime.getSnapshot().valid) throw new Error('Unexpected invalid snapshot');
created.runtime.dispose();
`,
  );

  installConsumer(directory);
  executePnpm(directory, ['run', 'build']);
  const execution = spawnSync(process.execPath, ['dist/main.js'], {
    cwd: directory,
    env: cleanEnvironment,
    stdio: 'inherit',
  });
  assert.equal(execution.status, 0, 'Core consumer execution failed');
  assertDeepImportBlocked(directory, '@rabassoft/schema-engine/dist/index.js');
}

function createAngularConsumer(
  label,
  angularVersion,
  tarballs,
  packageManager,
  typescriptVersion,
) {
  const directory = join(temporaryRoot, `angular-${label}`);
  mkdirSync(join(directory, 'src'), { recursive: true });
  const angularDependencies = Object.fromEntries(
    ANGULAR_PACKAGES.filter((name) => name !== '@angular/compiler-cli').map(
      (name) => [name, angularVersion],
    ),
  );
  writeJson(join(directory, 'package.json'), {
    name: `schema-engine-angular-clean-consumer-${label}`,
    private: true,
    type: 'module',
    packageManager,
    scripts: { build: 'ngc -p tsconfig.json' },
    dependencies: {
      ...angularDependencies,
      '@rabassoft/schema-engine': fileSpecifier(tarballs.core),
      '@rabassoft/schema-engine-angular': fileSpecifier(tarballs.angular),
      rxjs: '7.8.2',
      tslib: '2.8.1',
    },
    devDependencies: {
      '@angular/compiler-cli': angularVersion,
      typescript: typescriptVersion,
    },
  });
  writeJson(join(directory, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      outDir: 'dist',
      rootDir: 'src',
      strict: true,
      skipLibCheck: false,
      experimentalDecorators: true,
      useDefineForClassFields: false,
    },
    angularCompilerOptions: {
      compilationMode: 'full',
      strictInjectionParameters: true,
      strictTemplates: true,
    },
    include: ['src/**/*.ts'],
  });
  writeFileSync(
    join(directory, 'src/main.ts'),
    `import '@angular/compiler';
import {
  Injector,
  createEnvironmentInjector,
  type EnvironmentInjector,
} from '@angular/core';
import { compileFormDefinition } from '@rabassoft/schema-engine';
import {
  AngularRendererResolver,
  SchemaStringRendererComponent,
  provideSchemaEngineAngularNative,
} from '@rabassoft/schema-engine-angular';

const compiled = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: { name: { type: 'string' } },
  },
});
if (!compiled.success) throw new Error('Compilation failed');
const injector = createEnvironmentInjector(
  [provideSchemaEngineAngularNative()],
  Injector.NULL as EnvironmentInjector,
);
const resolver = injector.get(AngularRendererResolver);
if (!resolver.ready) throw new Error('Renderer resolver is not ready');
if (typeof SchemaStringRendererComponent !== 'function') {
  throw new Error('Native renderer export is unavailable');
}
injector.destroy();
`,
  );

  installConsumer(directory);
  verifyInstalledAngularTuple(directory, angularVersion);
  executePnpm(directory, ['run', 'build']);
  const execution = spawnSync(process.execPath, ['dist/main.js'], {
    cwd: directory,
    env: cleanEnvironment,
    stdio: 'inherit',
  });
  assert.equal(execution.status, 0, `Angular ${label} execution failed`);
  assertDeepImportBlocked(
    directory,
    '@rabassoft/schema-engine-angular/dist/index.js',
  );
}

try {
  const workspacePackage = readWorkspacePackage();
  const packageManager = workspacePackage.packageManager;
  const expectedPnpm = packageManager.replace(/^pnpm@/u, '');
  assert.equal(runPnpm(['--version']).trim(), expectedPnpm);
  const typescriptVersion = workspacePackage.devDependencies.typescript.replace(
    /^[~^]/u,
    '',
  );
  const tarballs = packCandidates(temporaryRoot);
  const upperAngular = await resolveUpperAngular();

  createCoreConsumer(tarballs.core, packageManager, typescriptVersion);
  createAngularConsumer(
    'lower',
    LOWER_ANGULAR,
    tarballs,
    packageManager,
    typescriptVersion,
  );
  createAngularConsumer(
    'upper',
    upperAngular,
    tarballs,
    packageManager,
    typescriptVersion,
  );

  console.log(
    JSON.stringify(
      {
        lowerAngular: LOWER_ANGULAR,
        upperAngular,
        resolvedAt: new Date().toISOString(),
        source: REGISTRY_SOURCE,
        coreTarball: basename(tarballs.core),
        angularTarball: basename(tarballs.angular),
      },
      null,
      2,
    ),
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
