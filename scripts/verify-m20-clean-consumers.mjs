import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  packReleaseCandidates,
  readWorkspacePackage,
  runPnpm,
  workspaceRoot,
} from './release-candidate-utils.mjs';
import {
  argumentValue,
  loadReleaseDescriptor,
  releaseConsumerUsesWorkspaceManifests,
  releasePackageSpecifier,
} from './release-target.mjs';

const mode = process.argv.find((argument) => argument.startsWith('--mode='));
assert.ok(mode, 'Pass exactly --mode=lower or --mode=latest');
const MODE = mode.slice('--mode='.length);
assert.ok(['lower', 'latest'].includes(MODE), 'Unsupported M20 consumer mode');
const descriptor = loadReleaseDescriptor();
const PACKAGE_MODE = argumentValue(process.argv, 'package-mode') ?? 'candidate';
assert.ok(
  descriptor.consumerModes.includes(PACKAGE_MODE),
  `Unsupported ${descriptor.id} package mode`,
);
const tuple = descriptor.consumerTuples[MODE];
const targets = Object.fromEntries(
  descriptor.packages.map((target) => [target.role, target]),
);
const temporaryRoot = mkdtempSync(join(tmpdir(), `schema-engine-m20-${MODE}-`));
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

function installedVersion(directory, name) {
  return JSON.parse(
    readFileSync(
      join(directory, 'node_modules', ...name.split('/'), 'package.json'),
      'utf8',
    ),
  ).version;
}

function createConsumer(label, pilot, packageSpecifiers, workspacePackage) {
  const directory = join(temporaryRoot, label);
  mkdirSync(join(directory, 'src'), { recursive: true });
  mkdirSync(join(directory, 'test'), { recursive: true });
  mkdirSync(join(directory, 'e2e'), { recursive: true });
  const angular = Object.fromEntries(
    [
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
    ].map((name) => [name, tuple.angular]),
  );
  writeJson(join(directory, 'package.json'), {
    name: `schema-engine-m20-${MODE}-${label}`,
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
    pnpm: {
      overrides: {
        '@emnapi/core': '2.0.0-alpha.3',
        '@emnapi/runtime': '2.0.0-alpha.3',
      },
    },
    dependencies: {
      ...angular,
      ...(pilot
        ? {
            '@angular/aria': tuple.aria,
            '@angular/cdk': tuple.cdk,
            '@rabassoft/schema-engine-angular-aria':
              packageSpecifiers.angularAria,
          }
        : {}),
      '@rabassoft/schema-engine': packageSpecifiers.core,
      '@rabassoft/schema-engine-angular': packageSpecifiers.angular,
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
            configurations: { production: { outputHashing: 'none' } },
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
    compilerOptions: { rootDir: '.' },
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
    `import { Component, computed, input, signal, type EnvironmentProviders, type Provider } from '@angular/core';
import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type DiscriminatedObjectFieldDefinition,
  type DiscriminatedObjectRuntimeSnapshot,
  type FormNodeDefinition,
  type FormNodeTemplate,
  type FormOperation,
  type FieldConditionDefinition,
  type PresentationEntryDefinition,
  type SchemaValidator,
  type ObjectAlternativeSelection,
  type UiFieldConditionSchema,
  type WizardActionResult,
  type WizardIntention,
  type WizardRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import {
  SchemaFormDirective,
  provideSchemaEngineAngularNative,
  type AngularPresentationContainerDefinition,
  type AngularPresentationContainerRegistration,
  type AngularPresentationContainerRenderer,
  type AngularPresentationContainerRenderModel,
} from '@rabassoft/schema-engine-angular';
${pilot ? "import { provideSchemaEngineAngularAriaContainers } from '@rabassoft/schema-engine-angular-aria';" : ''}

export const schema = {
  type: 'object',
  properties: {
    profile: { type: 'object', title: 'Profile', properties: {
      givenName: { type: 'string', title: 'Given name' },
      familyName: { type: 'string', title: 'Family name' },
    } },
    pet: { type: 'object', title: 'Pet', properties: {
      kind: { type: 'string', title: 'Kind', enum: ['cat', 'dog'] },
      name: { type: 'string', title: 'Name' },
    }, required: ['kind'], oneOf: [
      { type: 'object', properties: {
        kind: { type: 'string', const: 'cat' }, lives: { type: 'integer', title: 'Lives' },
      }, required: ['kind', 'lives'] },
      { type: 'object', properties: {
        kind: { type: 'string', const: 'dog' }, barkVolume: { type: 'number', title: 'Bark volume' },
      }, required: ['kind'] },
    ] },
    rows: { type: 'array', title: 'Rows', items: { type: 'object', properties: {
      id: { type: 'string' }, name: { type: 'string', title: 'Name' },
      status: { type: 'string', title: 'Status' },
      details: { type: 'object', title: 'Details', properties: {
        role: { type: 'string', title: 'Role' }, active: { type: 'boolean', title: 'Active' },
      } },
    }, required: ['id', 'name'] } },
  },
} as const;
export const uiSchema = { fields: {
  profile: { fields: { givenName: { visibleWhen: { operator: 'all', conditions: [
    { path: ['profile', 'familyName'], equals: 'Lovelace' },
  ] } } }, presentation: [{ kind: 'section', id: 'profile', label: 'Profile workspace', children: [
    { kind: 'tabs', id: 'profile-tabs', label: 'Profile details', panels: [
      { kind: 'panel', id: 'names', label: 'Names', children: [{ kind: 'grid', id: 'names-grid', label: 'Names grid', columns: 2, items: [
        { span: 1, child: 'givenName' }, { span: 1, child: 'familyName' },
      ] }] },
    ] },
  ] }] },
  rows: { item: {
    presentation: [
      { kind: 'tabs', id: 'item-tabs', label: 'Item details', panels: [
        { kind: 'panel', id: 'summary', label: 'Summary', children: ['name'] },
        { kind: 'panel', id: 'details', label: 'Details', children: ['details'] },
      ] },
      { kind: 'accordion', id: 'item-status', label: 'Item status', panels: [
        { kind: 'panel', id: 'state', label: 'State', children: ['status'] },
      ] },
    ],
    fields: { details: { presentation: [{ kind: 'grid', id: 'details-grid', label: 'Details grid', columns: 2, items: [
      { span: 1, child: 'role' }, { span: 1, child: 'active' },
    ] }] } },
  } },
} } as const;
export const compilation = compileFormDefinition({
  schema, uiSchema,
  collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
});
if (!compilation.success) throw new Error('M20 consumer fixture failed to compile');
export const definition = compilation.definition;
export function rawConditionSize(condition: UiFieldConditionSchema): number {
  return 'operator' in condition ? condition.conditions.length : condition.path.length;
}
export function normalizedConditionSize(condition: FieldConditionDefinition): number {
  return 'operator' in condition ? condition.conditions.length : condition.sourcePath.length;
}
const authoredCondition = uiSchema.fields.profile.fields.givenName.visibleWhen;
const normalizedField = definition.fields.find(({ name }) => name === 'givenName');
const normalizedCondition = normalizedField !== undefined && 'visibleWhen' in normalizedField
  ? normalizedField.visibleWhen
  : undefined;
if (rawConditionSize(authoredCondition) !== 1 || normalizedCondition === undefined || normalizedConditionSize(normalizedCondition) !== 1) {
  throw new Error('M32 exhaustive condition narrowing failed');
}
const petDefinition = definition.nodes.find(({ name }) => name === 'pet');
if (petDefinition?.kind !== 'discriminated-object') {
  throw new Error('M33 clean-consumer definition narrowing failed');
}
const publicPetDefinition: DiscriminatedObjectFieldDefinition = petDefinition;
if (publicPetDefinition.alternatives.length !== 2) {
  throw new Error('M33 clean-consumer alternatives are incomplete');
}
export const initial = Object.freeze({
  profile: Object.freeze({ givenName: 'Ada', familyName: 'Lovelace' }),
  pet: Object.freeze({ kind: 'cat', name: 'Milo', lives: 9, barkVolume: 4 }),
  rows: Object.freeze([
    Object.freeze({ id: 'alpha', name: 'Alpha', status: 'Ready', details: Object.freeze({ role: 'Owner', active: true }) }),
    Object.freeze({ id: 'beta', name: 'Beta', status: 'Draft', details: Object.freeze({ role: 'Reviewer', active: false }) }),
  ]),
});
const validator: SchemaValidator = { validate: () => ({ valid: true, issues: [] }) };
const conditionRuntime = createControlledFormRuntime({
  formId: 'm32-clean-consumer', definition, schema,
  value: initial, baselineValue: initial, locale: 'en', validator,
});
if (!conditionRuntime.success || conditionRuntime.runtime.getFieldSnapshot(['profile', 'givenName'])?.visible !== true) {
  throw new Error('M32 clean-consumer group runtime truth failed');
}
const petSnapshot = conditionRuntime.runtime.getNodeSnapshot(['pet']);
if (petSnapshot?.nodeKind !== 'discriminated-object') {
  throw new Error('M33 clean-consumer snapshot is unavailable');
}
const publicPetSnapshot: DiscriminatedObjectRuntimeSnapshot = petSnapshot;
const publicSelection: ObjectAlternativeSelection = publicPetSnapshot.selection;
if (
  publicSelection.kind !== 'active' ||
  publicSelection.discriminatorValue !== 'cat' ||
  conditionRuntime.runtime.getFieldSnapshot(['pet', 'barkVolume']) !== undefined ||
  conditionRuntime.runtime.requestSetValue(['pet', 'barkVolume'], 8)
    .diagnostics[0]?.code !== 'INACTIVE_OBJECT_ALTERNATIVE_TARGET'
) {
  throw new Error('M33 clean-consumer runtime truth failed');
}
conditionRuntime.runtime.dispose();
const wizardSchema = { type: 'object', properties: {
  name: { type: 'string' }, review: { type: 'string' },
} } as const;
const wizardCompilation = compileFormDefinition({
  schema: wizardSchema,
  uiSchema: { presentation: [{
    kind: 'wizard', id: 'm20-wizard', label: 'M20 wizard', steps: [
      { kind: 'wizard-step', id: 'identity', label: 'Identity', children: ['name'] },
      { kind: 'wizard-step', id: 'review', label: 'Review', children: ['review'] },
    ],
  }] },
});
if (!wizardCompilation.success) throw new Error('M34 clean wizard failed');
const wizardValue = { name: 'Ada', review: 'ready' };
const wizardRuntime = createControlledFormRuntime({
  formId: 'm34-clean-consumer', definition: wizardCompilation.definition,
  schema: wizardSchema, value: wizardValue, baselineValue: wizardValue,
  locale: 'en', validator, wizardState: { selectedStepId: 'identity' },
});
if (!wizardRuntime.success) throw new Error('M34 clean runtime failed');
const wizardIntentions: WizardIntention[] = [];
const wizardSubscription = wizardRuntime.runtime.subscribeWizardIntentions(
  (intention) => wizardIntentions.push(intention),
);
const wizardAction: WizardActionResult = wizardRuntime.runtime.requestWizardNext();
const wizardSnapshot: WizardRuntimeSnapshot | undefined =
  wizardRuntime.runtime.getSnapshot().wizard;
if (
  !wizardSubscription.success || !wizardAction.success ||
  wizardIntentions[0]?.kind !== 'next' || wizardSnapshot?.steps.length !== 2
) {
  throw new Error('M34 clean-consumer declarations are unavailable');
}
if (wizardSubscription.success) wizardSubscription.unsubscribe();
wizardRuntime.runtime.dispose();

@Component({ standalone: true, template: '' })
class ExternalContainer implements AngularPresentationContainerRenderer {
  readonly presentation = input.required<AngularPresentationContainerRenderModel>();
}
export const externalRegistration = Object.freeze({
  id: 'm20-external-tabs', renderer: ExternalContainer, priority: -1,
  tester(definition: AngularPresentationContainerDefinition) {
    const node = firstNode(definition);
    return definition.kind === 'tabs' && node?.kind === 'object' ? 1 : null;
  },
}) satisfies AngularPresentationContainerRegistration;
function firstNode(definition: AngularPresentationContainerDefinition): FormNodeDefinition | FormNodeTemplate | undefined {
  if (definition.kind === 'section') return wrapped(definition.children[0]);
  if (definition.kind === 'tabs' || definition.kind === 'accordion') return wrapped(definition.panels[0]?.children[0]);
  return wrapped(definition.items[0]?.child);
}
function wrapped(entry: PresentationEntryDefinition<FormNodeDefinition | FormNodeTemplate> | undefined) {
  return entry?.kind === 'form-node' ? entry.node : undefined;
}

@Component({
  selector: 'm20-consumer', standalone: true, imports: [SchemaFormDirective],
  template: '<h1>M20 ${label}</h1><form [schemaForm]="config()" (schemaOperation)="apply($event)"></form>',
})
export class AppComponent {
  readonly value = signal<Readonly<typeof initial>>(initial);
  readonly config = computed(() => ({
    formId: 'm20.${label}', definition, schema,
    value: this.value(), baselineValue: initial, locale: 'en', validator,
  }));
  apply(operation: FormOperation) {
    const result = applyFormOperation(definition, this.value(), operation);
    if (!result.success) throw new Error('M20 consumer operation failed');
    this.value.set(result.value as Readonly<typeof initial>);
  }
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
    '<!doctype html><html><head><meta charset="utf-8"><title>M20 consumer</title></head><body><m20-consumer></m20-consumer></body></html>\n',
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
  const prefix = pilot ? 'schema-aria' : 'schema-native';
  write(
    join(directory, 'test/consumer.test.ts'),
    `import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AppComponent, initial, providers } from '../src/app.js';

describe('M20 ${label} packed consumer', () => {
  it('projects recursive owners with stable local state', () => {
    TestBed.configureTestingModule({ providers: [...providers] });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); TestBed.tick();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('${prefix}-presentation-section')).toHaveLength(1);
    expect(root.querySelectorAll('${prefix}-presentation-tabs')).toHaveLength(3);
    expect(root.querySelectorAll('${prefix}-presentation-accordion')).toHaveLength(2);
    expect(root.querySelectorAll('${prefix}-presentation-grid')).toHaveLength(3);
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-schema-item-key]'));
    const beta = items[1]; if (beta === undefined) throw new Error('Beta missing');
    const tabs = Array.from(beta.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    tabs[1]?.click(); fixture.detectChanges(); TestBed.tick();
    fixture.componentInstance.value.set({ ...initial, rows: [initial.rows[1]!, initial.rows[0]!] });
    fixture.detectChanges(); TestBed.tick();
    expect(Array.from(root.querySelectorAll('[data-schema-item-key]')).includes(beta)).toBe(true);
    expect(tabs[1]?.getAttribute('aria-selected')).toBe('true');
    expect(root.querySelector('[data-field-name="id"]')).toBeNull();
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
  try { const body = await readFile(join(root, path)); response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }); response.end(body); }
  catch { response.writeHead(404); response.end(); }
}).listen(4173, '127.0.0.1');
`,
  );
  write(
    join(directory, 'playwright.config.ts'),
    `import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', use: { baseURL: 'http://127.0.0.1:4173' },
  webServer: { command: 'node serve.mjs', port: 4173, reuseExistingServer: false },
});
`,
  );
  write(
    join(directory, 'e2e/consumer.spec.ts'),
    `import { expect, test } from '@playwright/test';
test('runs recursive local ${label} from packed artifacts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'M20 ${label}' })).toBeVisible();
  await expect(page.locator('${prefix}-presentation-tabs')).toHaveCount(3);
  const beta = page.locator('[data-schema-item-key]').filter({
    has: page.locator('[id*="%22beta%22"]'),
  });
  await beta.getByRole('tab', { name: 'Details' }).click();
  await beta.locator('[id$="--move-earlier"]').click();
  await expect(beta.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true');
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
    installedVersion(directory, targets.core.name),
    targets.core.version,
  );
  assert.equal(
    installedVersion(directory, targets.angular.name),
    targets.angular.version,
  );
  if (pilot) {
    assert.equal(installedVersion(directory, '@angular/aria'), tuple.aria);
    assert.equal(installedVersion(directory, '@angular/cdk'), tuple.cdk);
    assert.equal(
      installedVersion(directory, targets.angularAria.name),
      targets.angularAria.version,
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
  assert.equal(
    runPnpm(['--version']).trim(),
    workspacePackage.packageManager.replace(/^pnpm@/u, ''),
  );
  if (releaseConsumerUsesWorkspaceManifests(descriptor, PACKAGE_MODE)) {
    for (const target of descriptor.packages) {
      const manifest = JSON.parse(
        readFileSync(
          join(workspaceRoot, target.workspacePath, 'package.json'),
          'utf8',
        ),
      );
      assert.equal(manifest.name, target.name);
      assert.equal(manifest.version, target.version);
    }
  }
  const tarballs =
    PACKAGE_MODE === 'candidate'
      ? packReleaseCandidates(temporaryRoot, descriptor)
      : undefined;
  const packageSpecifiers = Object.fromEntries(
    descriptor.packages.map(({ role }) => [
      role,
      releasePackageSpecifier(descriptor, role, PACKAGE_MODE, tarballs),
    ]),
  );
  createConsumer('native', false, packageSpecifiers, workspacePackage);
  createConsumer('pilot', true, packageSpecifiers, workspacePackage);
  console.log(
    JSON.stringify({
      milestone: 'M20',
      mode: MODE,
      tupleSource: 'frozen',
      packageSource:
        PACKAGE_MODE === 'candidate'
          ? 'current-workspace-tarballs'
          : `registry-${PACKAGE_MODE}`,
      release: descriptor.id,
      ...tuple,
      schemaEngine: targets.core.version,
      angularAriaPilot: targets.angularAria.version,
      lanes: ['native', 'pilot'],
    }),
  );
} finally {
  if (process.env.SCHEMA_ENGINE_KEEP_M20_CONSUMERS === '1') {
    console.error(`Preserved M20 consumers at ${temporaryRoot}`);
  } else {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
