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
import { loadCoordinatedReleaseTarget } from './release-target.mjs';

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
            loadCoordinatedReleaseTarget().descriptor,
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
  const coreRootDeclaration = declaration(coreRoot, 'dist');
  for (const typeName of [
    'UiFieldValueConditionSchema',
    'UiFieldValueConditionGroupSchema',
    'UiFieldConditionSchema',
    'FieldValueConditionDefinition',
    'FieldValueConditionGroupDefinition',
    'FieldConditionDefinition',
    'StringEnumArrayFieldDefinition',
  ]) {
    assert.equal(
      coreRootDeclaration.match(new RegExp(`\\b${typeName}\\b`, 'gu'))?.length,
      1,
      `${typeName} must appear exactly once in the core root inventory`,
    );
  }
  const coreContractsDeclaration = readFileSync(
    join(coreRoot, 'dist/contracts.d.ts'),
    'utf8',
  );
  assert.match(
    coreContractsDeclaration,
    /readonly visibleWhen\?: UiFieldConditionSchema;/u,
  );
  assert.match(
    coreContractsDeclaration,
    /readonly enabledWhen\?: UiFieldConditionSchema;/u,
  );
  assert.match(
    coreContractsDeclaration,
    /keyof BaseNodeDefinition \| 'visibleWhen' \| 'enabledWhen'/u,
  );
  assert.match(coreContractsDeclaration, /readonly visible: boolean;/u);
  assert.match(coreContractsDeclaration, /readonly enabled: boolean;/u);
  assert.match(
    coreContractsDeclaration,
    /readonly kind: 'string-enum-array';/u,
  );
  assert.match(
    coreContractsDeclaration,
    /readonly choices: readonly StringChoiceDefinition\[\];/u,
  );
  assert.match(coreContractsDeclaration, /\| 'missing-selection'/u);
  assert.match(coreContractsDeclaration, /\| 'empty-selection';/u);

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
  const defaultSchema = {
    ...schema,
    properties: { name: { type: 'string', default: 'Ada' } },
  };
  const shippedDefault = shippedCore.deriveSchemaDefaultCandidate(
    defaultSchema,
    {},
  );
  const rebuiltDefault = rebuiltCore.deriveSchemaDefaultCandidate(
    defaultSchema,
    {},
  );
  assert.deepEqual(rebuiltDefault, shippedDefault);
  assert.deepEqual(shippedDefault.value, { name: 'Ada' });
  const shippedFailure = shippedCore.deriveSchemaDefaultCandidate(
    {
      ...schema,
      properties: { count: { type: 'integer', default: 1.5 } },
    },
    {},
  );
  const rebuiltFailure = rebuiltCore.deriveSchemaDefaultCandidate(
    {
      ...schema,
      properties: { count: { type: 'integer', default: 1.5 } },
    },
    {},
  );
  assert.deepEqual(rebuiltFailure, shippedFailure);
  assert.equal(shippedFailure.success, false);
  const composedSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    allOf: [
      {
        type: 'object',
        properties: { first: { type: 'string' } },
      },
      {
        type: 'object',
        properties: { second: { type: 'number' } },
      },
    ],
  };
  const shippedComposition = shippedCore.compileFormDefinition({
    schema: composedSchema,
  });
  const rebuiltComposition = rebuiltCore.compileFormDefinition({
    schema: composedSchema,
  });
  assert.deepEqual(rebuiltComposition, shippedComposition);
  assert.equal(shippedComposition.success, true);
  const conditionalSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      active: { type: 'boolean' },
      ready: { type: 'boolean' },
      target: { type: 'string' },
    },
  };
  const conditionalInput = {
    schema: conditionalSchema,
    uiSchema: {
      fields: {
        target: {
          visibleWhen: {
            operator: 'all',
            conditions: [
              { path: ['active'], equals: true },
              { path: ['ready'], equals: true },
            ],
          },
        },
      },
    },
  };
  const shippedConditional =
    shippedCore.compileFormDefinition(conditionalInput);
  const rebuiltConditional =
    rebuiltCore.compileFormDefinition(conditionalInput);
  assert.deepEqual(rebuiltConditional, shippedConditional);
  assert.equal(shippedConditional.success, true);
  if (!shippedConditional.success)
    throw new Error('Shipped conditional compilation failed');
  const conditionalValue = { active: false, ready: false, target: 'kept' };
  for (const api of [shippedCore, rebuiltCore]) {
    const created = api.createControlledFormRuntime({
      formId: 'source-conditional',
      definition: shippedConditional.definition,
      schema: conditionalSchema,
      value: conditionalValue,
      baselineValue: conditionalValue,
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    assert.equal(created.success, true);
    if (!created.success) throw new Error('Conditional source runtime failed');
    assert.deepEqual(
      created.runtime.getFieldSnapshot(['target']),
      created.runtime.getSnapshot().fields[2],
    );
    assert.equal(created.runtime.getFieldSnapshot(['target'])?.visible, false);
    assert.equal(
      created.runtime.requestSetValue(['target'], 'stale').diagnostics[0]?.code,
      'INACTIVE_RUNTIME_FIELD',
    );
    assert.equal(
      created.runtime.updateExternalState({
        value: { ...conditionalValue, active: true, ready: true },
      }).success,
      true,
    );
    assert.equal(created.runtime.getFieldSnapshot(['target'])?.visible, true);
    created.runtime.dispose();
  }

  const stringEnumArraySchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      roles: {
        type: 'array',
        items: { type: 'string', enum: ['', 'reader', 'editor'] },
        uniqueItems: true,
      },
    },
  };
  const shippedStringEnumArray = shippedCore.compileFormDefinition({
    schema: stringEnumArraySchema,
  });
  const rebuiltStringEnumArray = rebuiltCore.compileFormDefinition({
    schema: stringEnumArraySchema,
  });
  assert.deepEqual(rebuiltStringEnumArray, shippedStringEnumArray);
  assert.equal(shippedStringEnumArray.success, true);
  if (!shippedStringEnumArray.success)
    throw new Error('Shipped string-enum array compilation failed');
  assert.equal(
    shippedStringEnumArray.definition.fields[0]?.kind,
    'string-enum-array',
  );
  for (const api of [shippedCore, rebuiltCore]) {
    const value = { roles: ['editor'] };
    const created = api.createControlledFormRuntime({
      formId: 'source-string-enum-array',
      definition: shippedStringEnumArray.definition,
      schema: stringEnumArraySchema,
      value,
      baselineValue: value,
      locale: 'en',
      validator: { validate: () => ({ valid: true, issues: [] }) },
    });
    assert.equal(created.success, true);
    if (!created.success)
      throw new Error('String-enum array source runtime failed');
    const operations = [];
    created.runtime.subscribeOperations((operation) =>
      operations.push(operation),
    );
    assert.equal(
      created.runtime.requestSetValue(['roles'], ['editor', 'reader']).success,
      true,
    );
    assert.deepEqual(operations[0]?.value, ['editor', 'reader']);
    assert.equal(Object.isFrozen(operations[0]?.value), true);
    created.runtime.dispose();
  }

  const angularDirectory = join(temporaryRoot, 'angular');
  mkdirSync(angularDirectory, { recursive: true });
  const angularRoot = extract(tarballs.angular, angularDirectory);
  installAndBuild(angularRoot, ['--modules-dir', '../node_modules'], offline);
  assert.equal(
    declaration(angularRoot, 'rebuilt-dist'),
    declaration(angularRoot, 'dist'),
    'Angular root declarations differ after source rebuild',
  );
  const angularRendererDeclaration = readFileSync(
    join(angularRoot, 'dist/renderer.d.ts'),
    'utf8',
  );
  assert.match(
    angularRendererDeclaration,
    /readonly snapshot: InputSignal<FieldRuntimeSnapshot>;/u,
  );
  const angularRootDeclaration = declaration(angularRoot, 'dist');
  assert.equal(
    angularRootDeclaration.match(/SchemaStringEnumArrayRendererComponent/gu)
      ?.length,
    1,
    'M31 renderer must appear exactly once in the Angular root inventory',
  );
  const angularTextDeclaration = readFileSync(
    join(angularRoot, 'dist/text.d.ts'),
    'utf8',
  );
  assert.match(
    angularTextDeclaration,
    /readonly missingSelectionLabel: string;/u,
  );
  assert.match(
    angularTextDeclaration,
    /readonly emptySelectionLabel: string;/u,
  );

  const shippedAngular = angularBehavior(angularRoot, 'dist');
  const rebuiltAngular = angularBehavior(angularRoot, 'rebuilt-dist');
  assert.deepEqual(rebuiltAngular, shippedAngular);
  assert.equal(shippedAngular.providerType, 'object');
  assert.equal(
    shippedAngular.keys.includes('SchemaStringEnumArrayRendererComponent'),
    true,
  );

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
    `Verified isolated frozen source rebuilds, declarations, exports and behavior${includeAngularAria ? ' for the selected coordinated line' : ''}.`,
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
