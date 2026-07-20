import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  packReleaseCandidates,
  readWorkspacePackage,
  runPnpm,
  workspaceRoot,
} from './release-candidate-utils.mjs';
import {
  argumentValue,
  loadCoordinatedReleaseTarget,
  M19_RELEASE_DESCRIPTOR,
  releaseFrozenConsumerTuple,
  releasePackageSpecifier,
} from './release-target.mjs';

const modeArgument = process.argv.find((argument) =>
  argument.startsWith('--mode='),
);
assert.ok(modeArgument, 'Pass exactly --mode=lower or --mode=latest');
const MODE = modeArgument.slice('--mode='.length);
assert.ok(['lower', 'latest'].includes(MODE), 'Unsupported consumer mode');
const releaseId = argumentValue(process.argv, 'release');
const descriptor =
  releaseId === 'm19'
    ? M19_RELEASE_DESCRIPTOR
    : loadCoordinatedReleaseTarget().descriptor;
const PACKAGE_MODE = argumentValue(process.argv, 'package-mode') ?? 'candidate';
const TUPLE_SOURCE = argumentValue(process.argv, 'tuple-source');
const PILOT_TARBALL = argumentValue(process.argv, 'pilot-tarball');
assert.ok(
  descriptor.consumerModes.includes(PACKAGE_MODE),
  `Unsupported ${descriptor.id} package mode`,
);
assert.equal(
  PILOT_TARBALL === undefined || ['exact', 'next'].includes(PACKAGE_MODE),
  true,
  '--pilot-tarball requires exact or next package mode',
);
const releaseTargets = Object.fromEntries(
  descriptor.packages.map((target) => [target.role, target]),
);

const REGISTRY = 'https://registry.npmjs.org';
const temporaryRoot = mkdtempSync(join(tmpdir(), `schema-engine-m18-${MODE}-`));
const emptyUserConfig = join(temporaryRoot, 'empty-user.npmrc');
writeFileSync(emptyUserConfig, '');
const cleanEnvironment = {
  ...process.env,
  NPM_CONFIG_USERCONFIG: emptyUserConfig,
  PLAYWRIGHT_BROWSERS_PATH: join(workspaceRoot, '.playwright-browsers'),
};
for (const key of Object.keys(cleanEnvironment)) {
  if (
    /^(?:NODE_AUTH_TOKEN|NPM_TOKEN)$/iu.test(key) ||
    /^NPM_CONFIG_.*(?:AUTH|TOKEN|PASSWORD)/iu.test(key)
  ) {
    delete cleanEnvironment[key];
  }
}

function write(path, contents) {
  writeFileSync(path, contents);
}

function writeJson(path, value) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function packageSpecifier(role, tarballs) {
  if (role === 'angularAria' && PILOT_TARBALL !== undefined) {
    return `file:${resolve(PILOT_TARBALL)}`;
  }
  return releasePackageSpecifier(descriptor, role, PACKAGE_MODE, tarballs);
}

async function metadata(name) {
  const response = await fetch(`${REGISTRY}/${name.replace('/', '%2F')}`, {
    headers: { accept: 'application/vnd.npm.install-v1+json' },
  });
  assert.equal(response.ok, true, `Registry metadata failed for ${name}`);
  return response.json();
}

function parsedAngular22(version) {
  const match = /^22\.(\d+)\.(\d+)$/u.exec(version);
  return match ? [Number(match[1]), Number(match[2])] : undefined;
}

function compareTuple(left, right) {
  return left[0] - right[0] || left[1] - right[1];
}

async function highestAngular22(name, minimum) {
  const manifest = await metadata(name);
  const versions = Object.entries(manifest.versions)
    .flatMap(([version, value]) => {
      const parsed = parsedAngular22(version);
      return parsed && value.deprecated === undefined
        ? [{ version, parsed }]
        : [];
    })
    .filter(({ parsed }) => compareTuple(parsed, parsedAngular22(minimum)) >= 0)
    .sort((left, right) => compareTuple(right.parsed, left.parsed));
  assert.ok(versions.length > 0, `No compatible Angular 22 ${name} version`);
  return { metadata: manifest, version: versions[0].version };
}

async function resolveTuple() {
  const frozen = releaseFrozenConsumerTuple(descriptor, MODE, TUPLE_SOURCE);
  if (frozen !== undefined) return frozen;
  const core = await highestAngular22('@angular/core', '22.0.6');
  for (const name of [
    '@angular/build',
    '@angular/cli',
    '@angular/common',
    '@angular/compiler',
    '@angular/compiler-cli',
    '@angular/forms',
    '@angular/platform-browser',
  ]) {
    const candidate = await metadata(name);
    assert.ok(
      candidate.versions[core.version],
      `${name}@${core.version} missing`,
    );
    assert.equal(
      candidate.versions[core.version].deprecated,
      undefined,
      `${name}@${core.version} is deprecated`,
    );
  }
  const aria = await highestAngular22('@angular/aria', '22.0.5');
  const ariaManifest = aria.metadata.versions[aria.version];
  const cdk = ariaManifest.peerDependencies?.['@angular/cdk'];
  assert.match(cdk ?? '', /^22\.\d+\.\d+$/u, 'Aria CDK peer is not exact');
  const cdkMetadata = await metadata('@angular/cdk');
  assert.ok(cdkMetadata.versions[cdk], `CDK peer ${cdk} is unavailable`);
  assert.equal(cdkMetadata.versions[cdk].deprecated, undefined);
  return { angular: core.version, aria: aria.version, cdk };
}

function installedVersion(directory, name) {
  return JSON.parse(
    readFileSync(
      join(directory, 'node_modules', ...name.split('/'), 'package.json'),
      'utf8',
    ),
  ).version;
}

function createConsumer(label, pilot, tuple, tarballs, workspacePackage) {
  const directory = join(temporaryRoot, label);
  mkdirSync(join(directory, 'src'), { recursive: true });
  mkdirSync(join(directory, 'test'), { recursive: true });
  const angularDependencies = Object.fromEntries(
    [
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
    ].map((name) => [name, tuple.angular]),
  );
  writeJson(join(directory, 'package.json'), {
    name: `schema-engine-m18-${MODE}-${label}`,
    private: true,
    type: 'module',
    packageManager: workspacePackage.packageManager,
    scripts: {
      partial: 'ngc -p tsconfig.partial.json',
      typecheck: 'tsc --noEmit -p tsconfig.app.json',
      test: 'vitest run',
      build: 'ng build --configuration production',
      e2e: 'playwright test',
    },
    dependencies: {
      ...angularDependencies,
      ...(pilot
        ? {
            '@angular/aria': tuple.aria,
            '@angular/cdk': tuple.cdk,
            [releaseTargets.angularAria.name]: packageSpecifier(
              'angularAria',
              tarballs,
            ),
          }
        : {}),
      [releaseTargets.core.name]: packageSpecifier('core', tarballs),
      [releaseTargets.angular.name]: packageSpecifier('angular', tarballs),
      rxjs: '7.8.2',
      tslib: '2.8.1',
    },
    devDependencies: {
      '@angular/build': tuple.angular,
      '@angular/cli': tuple.angular,
      '@angular/compiler-cli': tuple.angular,
      '@playwright/test': '1.61.1',
      'happy-dom': '20.10.6',
      postcss: '8.5.18',
      typescript: '6.0.2',
      vitest: '4.1.10',
    },
  });
  writeJson(join(directory, 'angular.json'), {
    $schema: './node_modules/@angular/cli/lib/config/schema.json',
    version: 1,
    projects: {
      consumer: {
        projectType: 'application',
        root: '',
        sourceRoot: 'src',
        architect: {
          build: {
            builder: '@angular/build:application',
            options: {
              browser: 'src/main.ts',
              index: 'src/index.html',
              tsConfig: 'tsconfig.app.json',
              styles: ['src/styles.css'],
              outputPath: 'dist',
            },
            configurations: {
              production: { outputHashing: 'none' },
            },
          },
        },
      },
    },
    cli: { analytics: false },
  });
  const compilerOptions = {
    target: 'ES2022',
    module: 'preserve',
    moduleResolution: 'bundler',
    rootDir: 'src',
    strict: true,
    skipLibCheck: false,
    experimentalDecorators: true,
    useDefineForClassFields: false,
    noUncheckedIndexedAccess: true,
  };
  writeJson(join(directory, 'tsconfig.app.json'), {
    compilerOptions,
    angularCompilerOptions: {
      strictInjectionParameters: true,
      strictTemplates: true,
    },
    include: ['src/**/*.ts'],
  });
  writeJson(join(directory, 'tsconfig.json'), {
    extends: './tsconfig.app.json',
    include: ['src/**/*.ts', 'test/**/*.ts'],
  });
  writeJson(join(directory, 'tsconfig.partial.json'), {
    compilerOptions: {
      ...compilerOptions,
      declaration: true,
      declarationMap: true,
      outDir: 'partial-dist',
    },
    angularCompilerOptions: {
      compilationMode: 'partial',
      strictInjectionParameters: true,
      strictTemplates: true,
    },
    include: ['src/app.ts'],
  });
  write(
    join(directory, 'vitest.config.ts'),
    `import { defineConfig } from 'vitest/config';
export default defineConfig({ test: {
  environment: 'happy-dom',
  setupFiles: ['./test/setup.ts'],
  include: ['./test/**/*.test.ts'],
} });
`,
  );
  write(
    join(directory, 'src/app.ts'),
    `import { Component, type EnvironmentProviders, type Provider } from '@angular/core';
import { compileFormDefinition, type SchemaValidator } from '@rabassoft/schema-engine';
import { SchemaFormDirective, provideSchemaEngineAngularNative } from '@rabassoft/schema-engine-angular';
${pilot ? "import { provideSchemaEngineAngularAriaContainers } from '@rabassoft/schema-engine-angular-aria';" : ''}

const schema = { type: 'object', properties: { first: { type: 'string' }, second: { type: 'string' } } } as const;
const uiSchema = { presentation: [{ kind: 'tabs', id: 'main', label: 'Main', panels: [
  { kind: 'panel', id: 'one', label: 'One', children: ['first'] },
  { kind: 'panel', id: 'two', label: 'Two', children: ['second'] },
] }] } as const;
const compiled = compileFormDefinition({ schema, uiSchema });
if (!compiled.success) throw new Error('Consumer fixture failed to compile');
const value = Object.freeze({ first: 'Ada', second: 'Grace' });
const validator: SchemaValidator = { validate: () => ({ valid: true, issues: [] }) };

@Component({
  selector: 'm18-consumer',
  standalone: true,
  imports: [SchemaFormDirective],
  template: '<h1>M18 ${label}</h1><form [schemaForm]="config"></form>',
})
export class AppComponent {
  readonly config = { formId: 'clean.${label}', definition: compiled.definition, schema, value, baselineValue: value, locale: 'en', validator };
}

export const providers: readonly (Provider | EnvironmentProviders)[] = [
  provideSchemaEngineAngularNative(),
  ${pilot ? 'provideSchemaEngineAngularAriaContainers(),' : ''}
];
`,
  );
  write(
    join(directory, 'src/main.ts'),
    `import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent, providers } from './app.js';
void bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection(), ...providers] });
`,
  );
  write(
    join(directory, 'src/index.html'),
    '<!doctype html><html><head><meta charset="utf-8"><title>M18 clean consumer</title></head><body><m18-consumer></m18-consumer></body></html>\n',
  );
  write(
    join(directory, 'src/styles.css'),
    pilot
      ? "@import '@rabassoft/schema-engine-angular-aria/styles.css';\n"
      : ':root { color-scheme: light dark; }\n',
  );
  write(
    join(directory, 'test/setup.ts'),
    `import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
`,
  );
  write(
    join(directory, 'test/consumer.test.ts'),
    `import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AppComponent, providers } from '../src/app.js';

describe('M18 ${label} clean consumer', () => {
  it('projects the advanced presentation through the expected container lane', () => {
    TestBed.configureTestingModule({ providers: [...providers] });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('${pilot ? 'schema-aria-presentation-tabs' : 'schema-native-presentation-tabs'}')).not.toBeNull();
    expect(root.querySelectorAll('[role="tab"]')).toHaveLength(2);
    expect(root.querySelectorAll('[role="tabpanel"]')).toHaveLength(2);
    fixture.destroy();
  });
});
`,
  );
  write(
    join(directory, 'serve.mjs'),
    `import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const root = join(process.cwd(), 'dist', 'browser');
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript' };
createServer(async (request, response) => {
  const path = request.url === '/' ? 'index.html' : request.url.slice(1);
  try {
    const body = await readFile(join(root, path));
    response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    response.end(body);
  } catch { response.writeHead(404); response.end(); }
}).listen(4173, '127.0.0.1');
`,
  );
  write(
    join(directory, 'playwright.config.ts'),
    `import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: { command: 'node serve.mjs', port: 4173, reuseExistingServer: false },
});
`,
  );
  mkdirSync(join(directory, 'e2e'));
  write(
    join(directory, 'e2e/consumer.spec.ts'),
    `import { expect, test } from '@playwright/test';
test('runs the ${label} packed-artifact lane in Chromium', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'M18 ${label}' })).toBeVisible();
  await expect(page.locator('${pilot ? 'schema-aria-presentation-tabs' : 'schema-native-presentation-tabs'}')).toHaveCount(1);
  await expect(page.getByRole('tab')).toHaveCount(2);
});
`,
  );

  runPnpm(
    [
      'install',
      '--ignore-workspace',
      '--strict-peer-dependencies',
      '--config.auto-install-peers=false',
      '--ignore-scripts',
      ...(PACKAGE_MODE === 'candidate' ? ['--offline'] : []),
    ],
    { cwd: directory, env: cleanEnvironment, stdio: 'inherit' },
  );
  assert.equal(installedVersion(directory, '@angular/core'), tuple.angular);
  assert.equal(installedVersion(directory, '@angular/forms'), tuple.angular);
  assert.equal(
    installedVersion(directory, '@rabassoft/schema-engine'),
    releaseTargets.core.version,
  );
  assert.equal(
    installedVersion(directory, '@rabassoft/schema-engine-angular'),
    releaseTargets.angular.version,
  );
  if (pilot) {
    assert.equal(installedVersion(directory, '@angular/aria'), tuple.aria);
    assert.equal(installedVersion(directory, '@angular/cdk'), tuple.cdk);
    assert.equal(
      installedVersion(directory, '@rabassoft/schema-engine-angular-aria'),
      releaseTargets.angularAria.version,
    );
  }
  for (const script of ['partial', 'typecheck', 'test', 'build', 'e2e']) {
    runPnpm(['run', script], {
      cwd: directory,
      env: cleanEnvironment,
      stdio: 'inherit',
    });
  }
}

try {
  assert.equal(process.version, 'v22.23.1');
  const workspacePackage = readWorkspacePackage();
  const expectedPnpm = workspacePackage.packageManager.replace(/^pnpm@/u, '');
  assert.equal(runPnpm(['--version']).trim(), expectedPnpm);
  const tuple = await resolveTuple();
  const tarballs =
    PACKAGE_MODE === 'candidate'
      ? packReleaseCandidates(temporaryRoot, descriptor)
      : undefined;
  createConsumer('native', false, tuple, tarballs, workspacePackage);
  createConsumer('pilot', true, tuple, tarballs, workspacePackage);
  console.log(
    JSON.stringify({
      mode: MODE,
      tupleSource: TUPLE_SOURCE,
      packageMode: PACKAGE_MODE,
      pilotSource:
        PILOT_TARBALL === undefined ? PACKAGE_MODE : 'selected-tarball',
      ...tuple,
      schemaEngine: releaseTargets.core.version,
      angularAriaPilot: releaseTargets.angularAria.version,
      lanes: ['native', 'pilot'],
    }),
  );
} finally {
  if (process.env.SCHEMA_ENGINE_KEEP_M18_CONSUMERS === '1') {
    console.error(`Preserved M18 consumers at ${temporaryRoot}`);
  } else {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
