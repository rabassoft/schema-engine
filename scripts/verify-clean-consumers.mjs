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
import { basename, join, resolve } from 'node:path';
import {
  packAngularCandidate,
  packCandidates,
  readWorkspacePackage,
  runPnpm,
} from './release-candidate-utils.mjs';
import { argumentValue } from './release-target.mjs';

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
const OFFLINE = process.argv.includes('--offline');
const FROZEN_UPPER_ANGULAR = argumentValue(process.argv, 'upper-angular');
assert.equal(
  !OFFLINE || FROZEN_UPPER_ANGULAR !== undefined,
  true,
  '--offline requires --upper-angular=<frozen-version>',
);
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
      ...(OFFLINE ? ['--offline'] : []),
    ],
    { cwd: directory, env: cleanEnvironment, stdio: 'inherit' },
  );
}

function executePnpm(directory, args) {
  runPnpm(args, { cwd: directory, env: cleanEnvironment, stdio: 'inherit' });
}

function executeNpm(directory, args) {
  const result = spawnSync('npm', args, {
    cwd: directory,
    env: cleanEnvironment,
    stdio: 'inherit',
  });
  assert.equal(result.status, 0, `npm ${args.join(' ')} failed`);
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

function installedSchemaVersion(directory, packageName) {
  return JSON.parse(
    readFileSync(
      join(
        directory,
        'node_modules',
        ...packageName.split('/'),
        'package.json',
      ),
      'utf8',
    ),
  ).version;
}

function createCoreConsumer(
  packageSource,
  packageManager,
  typescriptVersion,
  expectedSchemaVersion,
) {
  const directory = join(temporaryRoot, 'core-only');
  mkdirSync(join(directory, 'src'), { recursive: true });
  writeJson(join(directory, 'package.json'), {
    name: 'schema-engine-core-clean-consumer',
    private: true,
    type: 'module',
    packageManager,
    scripts: { build: 'tsc -p tsconfig.json' },
    dependencies: {
      '@rabassoft/schema-engine': packageSource,
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
    `import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  deriveSchemaDefaultCandidate,
  type DiscriminatedObjectAlternativeDefinition,
  type DiscriminatedObjectFieldDefinition,
  type DiscriminatedObjectRuntimeSnapshot,
  type ControlledWizardState,
  type FieldDefinition,
  type FieldRuntimeSnapshot,
  type FieldTextMember,
  type FieldConditionDefinition,
  type FormDefinition,
  type FormNodeDefinition,
  type FormOperation,
  type NodeRuntimeSnapshot,
  type ObjectAlternativeSelection,
  type ObjectNodeDefinition,
  type RootPresentationEntryDefinition,
  type StringEnumArrayFieldDefinition,
  type UiRootPresentationEntry,
  type UiWizardSchema,
  type UiFieldValueConditionSchema,
  type WizardActionResult,
  type WizardDefinition,
  type WizardIntention,
  type WizardRuntimeSnapshot,
  type WizardStepDefinition,
  type WizardTextResolutionContext,
} from '@rabassoft/schema-engine';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    profile: {
      type: 'object',
      properties: { address: { type: 'string' } },
    },
    rows: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id'],
      },
    },
  },
  type: 'object',
  properties: {
    profile: { $ref: '#/$defs/profile' },
    rows: { $ref: '#/$defs/rows' },
    active: { type: 'boolean' },
    conditional: { type: 'string' },
    roles: {
      type: 'array',
      items: { type: 'string', enum: ['', 'reader', 'editor'] },
      uniqueItems: true,
    },
    pet: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['cat', 'dog'] },
        name: { type: 'string' },
      },
      required: ['kind'],
      oneOf: [
        { type: 'object', properties: {
          kind: { type: 'string', const: 'cat' }, lives: { type: 'integer' },
        }, required: ['kind', 'lives'] },
        { type: 'object', properties: {
          kind: { type: 'string', const: 'dog' }, barkVolume: { type: 'number' },
        }, required: ['kind'] },
      ],
    },
  },
};
const rawCondition: UiFieldValueConditionSchema = {
  path: ['active'],
  equals: true,
};
const compiled = compileFormDefinition({
  schema,
  collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
  uiSchema: {
    fields: { conditional: { visibleWhen: rawCondition } },
    presentation: [
      {
        kind: 'section',
        id: 'main',
        label: 'Main',
        children: ['profile', 'active', 'conditional'],
      },
      'rows',
    ],
  },
});
if (!compiled.success) throw new Error('Compilation failed');
const conditionalDefinition = compiled.definition.fields.find(
  ({ name }) => name === 'conditional',
);
const normalizedCondition: FieldConditionDefinition | undefined =
  conditionalDefinition?.kind === 'string-enum-array'
    ? undefined
    : conditionalDefinition?.visibleWhen;
if (
  normalizedCondition === undefined ||
  !('sourcePath' in normalizedCondition) ||
  normalizedCondition.sourcePath[0] !== 'active' ||
  normalizedCondition.equals !== true
) {
  throw new Error('Conditional declarations are unavailable');
}
const rolesDefinition = compiled.definition.fields.find(
  ({ name }) => name === 'roles',
);
if (rolesDefinition?.kind !== 'string-enum-array') {
  throw new Error('String-enum array definition is unavailable');
}
const publicRolesDefinition: StringEnumArrayFieldDefinition = rolesDefinition;
const selectionTextMembers: readonly FieldTextMember[] = [
  'choice',
  'missing-selection',
  'empty-selection',
];
if (
  publicRolesDefinition.choices.length !== 3 ||
  selectionTextMembers.length !== 3
) {
  throw new Error('String-enum array declarations are incomplete');
}
const petDefinition = compiled.definition.nodes.find(
  ({ name }) => name === 'pet',
);
if (petDefinition?.kind !== 'discriminated-object') {
  throw new Error('Discriminated object definition is unavailable');
}
const publicPetDefinition: DiscriminatedObjectFieldDefinition = petDefinition;
const publicAlternatives: readonly DiscriminatedObjectAlternativeDefinition[] =
  publicPetDefinition.alternatives;
function objectKind(node: ObjectNodeDefinition): 'ordinary' | 'alternative' {
  switch (node.kind) {
    case 'object': return 'ordinary';
    case 'discriminated-object': return 'alternative';
    default: return node satisfies never;
  }
}
function snapshotKind(snapshot: NodeRuntimeSnapshot): string {
  switch (snapshot.nodeKind) {
    case 'object': return 'object';
    case 'discriminated-object': return snapshot.selection.kind;
    case 'array': return 'array';
    case 'field': return 'field';
    default: return snapshot satisfies never;
  }
}
if (
  objectKind(publicPetDefinition) !== 'alternative' ||
  publicAlternatives.length !== 2
) {
  throw new Error('Discriminated object declaration narrowing failed');
}

const manualKind = {
  kind: 'string', nullable: false, key: '["pet","kind"]', name: 'kind',
  path: ['pet', 'kind'], required: true, label: 'Kind', constraints: {},
  choices: [{ value: 'cat', label: 'Cat' }, { value: 'dog', label: 'Dog' }],
} satisfies FieldDefinition;
const manualName = {
  kind: 'string', nullable: false, key: '["pet","name"]', name: 'name',
  path: ['pet', 'name'], required: false, label: 'Name', constraints: {},
} satisfies FieldDefinition;
const manualLives = {
  kind: 'number', nullable: false, key: '["pet","lives"]', name: 'lives',
  path: ['pet', 'lives'], required: true, label: 'Lives',
  numericType: 'integer', constraints: {}, ui: {},
} satisfies FieldDefinition;
const manualBarkVolume = {
  kind: 'number', nullable: false, key: '["pet","barkVolume"]',
  name: 'barkVolume', path: ['pet', 'barkVolume'], required: false,
  label: 'Bark volume', numericType: 'number', constraints: {}, ui: {},
} satisfies FieldDefinition;
const manualPet = {
  kind: 'discriminated-object', key: '["pet"]', name: 'pet', path: ['pet'],
  required: false, label: 'Pet', discriminator: 'kind',
  children: [manualKind, manualName, manualLives, manualBarkVolume],
  alternatives: [
    { discriminatorValue: 'cat', children: ['lives'] },
    { discriminatorValue: 'dog', children: ['barkVolume'] },
  ],
} satisfies DiscriminatedObjectFieldDefinition;
const manualDefinition = {
  nodes: [manualPet],
  fields: [manualKind, manualName, manualLives, manualBarkVolume],
  presentation: [{ kind: 'form-node', node: manualPet }],
} satisfies FormDefinition;
const manualNode: FormNodeDefinition = manualDefinition.nodes[0];
if (manualNode.kind !== 'discriminated-object') {
  throw new Error('Manual discriminated object definition is unavailable');
}
const manualValue = {
  pet: { kind: 'cat', name: 'Milo', lives: 9, barkVolume: 4 },
};
const manualCreated = createControlledFormRuntime({
  formId: 'clean-core-manual-m33', definition: manualDefinition, schema,
  value: manualValue, baselineValue: manualValue, locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
if (!manualCreated.success) {
  throw new Error('Manual discriminated object runtime failed');
}
const manualSnapshot = manualCreated.runtime.getNodeSnapshot(['pet']);
if (
  manualSnapshot?.nodeKind !== 'discriminated-object' ||
  snapshotKind(manualSnapshot) !== 'active'
) {
  throw new Error('Manual discriminated object snapshot narrowing failed');
}
const publicSnapshot: DiscriminatedObjectRuntimeSnapshot = manualSnapshot;
const publicSelection: ObjectAlternativeSelection = publicSnapshot.selection;
if (
  publicSelection.kind !== 'active' ||
  publicSelection.discriminatorValue !== 'cat' ||
  manualCreated.runtime.requestSetValue(['pet', 'barkVolume'], 8)
    .diagnostics[0]?.code !== 'INACTIVE_OBJECT_ALTERNATIVE_TARGET'
) {
  throw new Error('Manual discriminated object runtime safety failed');
}
manualCreated.runtime.dispose();
const wizardSchema = {
  type: 'object', properties: {
    active: { type: 'boolean' }, conditional: { type: 'string' },
  },
};
const rawWizard = {
  kind: 'wizard', id: 'clean-wizard', label: 'Clean wizard', steps: [
    { kind: 'wizard-step', id: 'identity', label: 'Identity', children: ['active'] },
    { kind: 'wizard-step', id: 'review', label: 'Review', children: ['conditional'] },
  ],
} satisfies UiWizardSchema;
const rawWizardRoot: UiRootPresentationEntry = rawWizard;
const compiledWizard = compileFormDefinition({
  schema: wizardSchema,
  uiSchema: { presentation: [rawWizardRoot] },
});
if (!compiledWizard.success || compiledWizard.definition.presentation[0]?.kind !== 'wizard') {
  throw new Error('Clean wizard compilation failed');
}
const normalizedWizard: WizardDefinition = compiledWizard.definition.presentation[0];
const publicStep: WizardStepDefinition = normalizedWizard.steps[0];
function rootPresentationKind(entry: RootPresentationEntryDefinition): string {
  switch (entry.kind) {
    case 'form-node': return 'node';
    case 'section': return 'section';
    case 'tabs': return 'tabs';
    case 'accordion': return 'accordion';
    case 'grid': return 'grid';
    case 'wizard': return entry.steps[0]?.id ?? 'wizard';
    default: return entry satisfies never;
  }
}
if (rootPresentationKind(normalizedWizard) !== publicStep.id) {
  throw new Error('Wizard root narrowing failed');
}
const manualWizard = {
  ...normalizedWizard,
  steps: normalizedWizard.steps.map((step) => ({
    ...step, children: [...step.children],
    scope: { ...step.scope, paths: [...step.scope.paths] },
  })),
  completionScope: {
    ...normalizedWizard.completionScope,
    paths: [...normalizedWizard.completionScope.paths],
  },
} satisfies WizardDefinition;
const manualWizardDefinition = {
  nodes: [...compiledWizard.definition.nodes],
  fields: [...compiledWizard.definition.fields],
  presentation: [manualWizard],
} satisfies FormDefinition;
const controlledWizard: ControlledWizardState = { selectedStepId: 'identity' };
const wizardValue = { active: false, conditional: 'ready' };
const wizardCreated = createControlledFormRuntime({
  formId: 'clean-core-manual-m34', definition: manualWizardDefinition,
  schema: wizardSchema,
  value: wizardValue, baselineValue: wizardValue, locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
  wizardState: controlledWizard,
});
if (!wizardCreated.success) throw new Error('Manual wizard runtime failed');
const wizardIntentions: WizardIntention[] = [];
const wizardSubscription = wizardCreated.runtime.subscribeWizardIntentions(
  (intention) => wizardIntentions.push(intention),
);
const wizardAction: WizardActionResult = wizardCreated.runtime.requestWizardNext();
const wizardSnapshot: WizardRuntimeSnapshot | undefined =
  wizardCreated.runtime.getSnapshot().wizard;
function wizardTextIdentity(context: WizardTextResolutionContext): string {
  return context.step === undefined
    ? context.member
    : context.member === 'position'
      ? String(context.position)
      : context.step.id;
}
void wizardTextIdentity;
if (
  !wizardSubscription.success || !wizardAction.success ||
  wizardIntentions[0]?.kind !== 'next' || wizardSnapshot?.steps.length !== 2
) {
  throw new Error('Wizard action/snapshot declarations are unavailable');
}
if (wizardSubscription.success) wizardSubscription.unsubscribe();
wizardCreated.runtime.dispose();
const defaultInput: { profile?: { address?: string } } = {};
const defaultCandidate = deriveSchemaDefaultCandidate(
  {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: { address: { type: 'string', default: 'Rabassoft' } },
      },
    },
  },
  defaultInput,
);
if (
  !defaultCandidate.success ||
  !defaultCandidate.changed ||
  defaultCandidate.value.profile?.address !== 'Rabassoft'
) {
  throw new Error('Schema-default candidate is unavailable');
}
const defaultNoEffect = deriveSchemaDefaultCandidate(
  {
    type: 'object',
    properties: { value: { type: 'string', default: 'kept' } },
  },
  { value: 'present' },
);
if (!defaultNoEffect.success || defaultNoEffect.changed) {
  throw new Error('Schema-default no-effect contract failed');
}
const composed = compileFormDefinition({
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    allOf: [
      {
        type: 'object',
        properties: { first: { type: 'string' } },
      },
      {
        type: 'object',
        properties: { second: { type: 'number' } },
        required: ['first', 'second'],
      },
    ],
  },
});
if (
  !composed.success ||
  composed.definition.fields.map(({ name }) => name).join(',') !==
    'first,second'
) {
  throw new Error('Static object composition is unavailable');
}
const source: {
  profile?: { address?: string };
  rows: { id: string; name?: string }[];
  active: boolean;
  conditional: string;
  roles: string[];
  pet: {
    kind: string;
    name: string;
    lives: number;
    barkVolume: number;
  };
} = {
  rows: [{ id: 'a', name: 'Ada' }],
  active: false,
  conditional: 'kept',
  roles: ['editor'],
  pet: { kind: 'cat', name: 'Milo', lives: 9, barkVolume: 4 },
};
const created = createControlledFormRuntime({
  formId: 'clean-core',
  definition: compiled.definition,
  schema,
  value: source,
  baselineValue: source,
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
if (!created.success) throw new Error('Runtime creation failed');
const profile = created.runtime.getNodeSnapshot(['profile']);
const address = created.runtime.getFieldSnapshot(['profile', 'address']);
const item = created.runtime.getItemSnapshot({
  collectionPath: ['rows'],
  itemId: 'a',
});
const itemName = created.runtime.getCollectionNodeSnapshot({
  collectionPath: ['rows'],
  itemId: 'a',
  relativePath: ['name'],
});
const conditionalSnapshot: FieldRuntimeSnapshot | undefined =
  created.runtime.getFieldSnapshot(['conditional']);
const compiledPetSnapshot = created.runtime.getNodeSnapshot(['pet']);
if (
  profile?.nodeKind !== 'object' ||
  address?.nodeKind !== 'field' ||
  item?.nodeKind !== 'item' ||
  itemName?.nodeKind !== 'field' ||
  conditionalSnapshot?.visible !== false ||
  conditionalSnapshot.enabled !== true ||
  compiledPetSnapshot?.nodeKind !== 'discriminated-object' ||
  compiledPetSnapshot.selection.kind !== 'active' ||
  compiledPetSnapshot.selection.discriminatorValue !== 'cat' ||
  created.runtime.getFieldSnapshot(['pet', 'barkVolume']) !== undefined
) {
  throw new Error('Nested declarations are unavailable');
}
const inactiveAlternative = created.runtime.requestSetValue(
  ['pet', 'barkVolume'],
  8,
);
if (
  inactiveAlternative.success ||
  inactiveAlternative.diagnostics[0]?.code !==
    'INACTIVE_OBJECT_ALTERNATIVE_TARGET'
) {
  throw new Error('Discriminated object action safety is unavailable');
}
const inactive = created.runtime.requestSetValue(
  ['conditional'],
  'blocked',
);
if (
  inactive.success ||
  inactive.diagnostics[0]?.code !== 'INACTIVE_RUNTIME_FIELD'
) {
  throw new Error('Conditional action safety is unavailable');
}
const operations: FormOperation[] = [];
created.runtime.subscribeOperations((candidate) => operations.push(candidate));
created.runtime.requestSetValue(['roles'], ['editor', 'reader']);
const rolesOperation = operations.at(-1);
if (
  rolesOperation?.type !== 'set-value' ||
  !Array.isArray(rolesOperation.value) ||
  rolesOperation.value.join(',') !== 'editor,reader'
) {
  throw new Error('String-enum array operation is unavailable');
}
const rolesApplied = applyFormOperation(
  compiled.definition,
  source,
  rolesOperation,
);
if (
  !rolesApplied.success ||
  rolesApplied.value.roles.join(',') !== 'editor,reader'
) {
  throw new Error('String-enum array operation failed');
}
created.runtime.requestSetValue(['profile', 'address'], 'Rabassoft');
const deepOperation = operations.at(-1);
if (deepOperation === undefined)
  throw new Error('Deep operation was not emitted');
const applied = applyFormOperation(compiled.definition, source, deepOperation);
if (!applied.success || applied.value.profile?.address !== 'Rabassoft') {
  throw new Error('Deep operation failed');
}
created.runtime.requestSetItemValue(
  { collectionPath: ['rows'], itemId: 'a', relativePath: ['name'] },
  'Grace',
);
const collectionOperation = operations.at(-1);
if (collectionOperation?.type !== 'set-item-value') {
  throw new Error('Stable collection operation was not emitted');
}
const collectionApplied = applyFormOperation(
  compiled.definition,
  source,
  collectionOperation,
);
if (
  !collectionApplied.success ||
  collectionApplied.value.rows[0]?.name !== 'Grace'
) {
  throw new Error('Stable collection operation failed');
}
created.runtime.dispose();
`,
  );

  installConsumer(directory);
  if (expectedSchemaVersion !== undefined) {
    assert.equal(
      installedSchemaVersion(directory, '@rabassoft/schema-engine'),
      expectedSchemaVersion,
    );
  }
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
  verifySignatures,
  expectedSchemaVersion,
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
      '@rabassoft/schema-engine': tarballs.core,
      '@rabassoft/schema-engine-angular': tarballs.angular,
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
  Component,
  Injector,
  createEnvironmentInjector,
  type EnvironmentInjector,
} from '@angular/core';
import {
  applyFormOperation,
  compileFormDefinition,
  createControlledFormRuntime,
  type DiscriminatedObjectFieldDefinition,
  type FieldRuntimeSnapshot,
  type FormOperation,
  type SchemaValidator,
  type StringEnumArrayFieldDefinition,
  type WizardActionResult,
  type WizardIntention,
  type WizardRuntimeSnapshot,
} from '@rabassoft/schema-engine';
import {
  AngularRendererResolver,
  SchemaFormDirective,
  SchemaStringEnumArrayRendererComponent,
  SchemaStringRendererComponent,
  provideSchemaEngineAngularNative,
  provideSchemaTextResolver,
  type AngularControlledFormConfig,
  type AngularFieldTextSnapshot,
  type AngularFieldRenderer,
} from '@rabassoft/schema-engine-angular';

interface ConsumerValue {
  profile?: { address?: { street?: string } };
  active: boolean;
  rows: { id: string; name?: string }[];
  roles: string[];
  pet: {
    kind: string;
    name: string;
    lives: number;
    barkVolume: number;
  };
}

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: {
    profile: {
      type: 'object',
      title: 'Profile',
      properties: {
        address: {
          type: 'object',
          title: 'Address',
          properties: { street: { type: 'string', title: 'Street' } },
        },
      },
    },
    rows: {
      type: 'array',
      title: 'People',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', title: 'Name' },
        },
        required: ['id'],
      },
    },
  },
  type: 'object',
  properties: {
    profile: { $ref: '#/$defs/profile' },
    active: { type: 'boolean', title: 'Active' },
    rows: { $ref: '#/$defs/rows' },
    roles: {
      type: 'array',
      items: { type: 'string', enum: ['reader', 'editor'] },
      uniqueItems: true,
    },
    pet: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['cat', 'dog'] },
        name: { type: 'string' },
      },
      required: ['kind'],
      oneOf: [
        { type: 'object', properties: {
          kind: { type: 'string', const: 'cat' }, lives: { type: 'integer' },
        }, required: ['kind', 'lives'] },
        { type: 'object', properties: {
          kind: { type: 'string', const: 'dog' }, barkVolume: { type: 'number' },
        }, required: ['kind'] },
      ],
    },
  },
};
const compiled = compileFormDefinition({
  schema,
  collectionPolicies: [{ path: ['rows'], itemIdentityProperty: 'id' }],
  uiSchema: {
    fields: {
      profile: {
        fields: {
          address: {
            fields: {
              street: {
                enabledWhen: { path: ['active'], equals: false },
              },
            },
          },
        },
      },
    },
  },
});
if (!compiled.success) throw new Error('Compilation failed');
const definition = compiled.definition;
const streetDefinition = definition.fields.find(
  ({ path }) => path.join('.') === 'profile.address.street',
);
const streetCondition =
  streetDefinition?.kind === 'string-enum-array'
    ? undefined
    : streetDefinition?.enabledWhen;
if (
  streetCondition === undefined ||
  !('sourcePath' in streetCondition) ||
  streetCondition.sourcePath[0] !== 'active'
) {
  throw new Error('Conditional Angular declarations are unavailable');
}
const rolesDefinition = definition.fields.find(
  ({ name }) => name === 'roles',
);
if (rolesDefinition?.kind !== 'string-enum-array') {
  throw new Error('String-enum array Angular definition is unavailable');
}
const publicRolesDefinition: StringEnumArrayFieldDefinition = rolesDefinition;
if (publicRolesDefinition.choices.length !== 2) {
  throw new Error('String-enum array Angular declarations are incomplete');
}
const petDefinition = definition.nodes.find(({ name }) => name === 'pet');
if (petDefinition?.kind !== 'discriminated-object') {
  throw new Error('Discriminated object Angular definition is unavailable');
}
const publicPetDefinition: DiscriminatedObjectFieldDefinition = petDefinition;
if (
  publicPetDefinition.discriminator !== 'kind' ||
  publicPetDefinition.alternatives.length !== 2
) {
  throw new Error('Discriminated object Angular declarations are incomplete');
}
function rendererSnapshotIsCoreSnapshot(
  snapshot: ReturnType<AngularFieldRenderer['snapshot']>,
): FieldRuntimeSnapshot {
  return snapshot;
}
void rendererSnapshotIsCoreSnapshot;
function selectionTextShape(
  texts: AngularFieldTextSnapshot,
): readonly [string, string] {
  return [texts.missingSelectionLabel, texts.emptySelectionLabel];
}
void selectionTextShape;
const validator: SchemaValidator = {
  validate: () => ({ valid: true, issues: [] }),
};
const discriminatedValue = {
  pet: { kind: 'cat', name: 'Milo', lives: 9, barkVolume: 4 },
};
const discriminatedRuntime = createControlledFormRuntime({
  formId: 'clean-angular-m33', definition, schema,
  value: { active: false, rows: [], roles: [], ...discriminatedValue },
  baselineValue: { active: false, rows: [], roles: [], ...discriminatedValue },
  locale: 'en', validator,
});
if (
  !discriminatedRuntime.success ||
  discriminatedRuntime.runtime.getNodeSnapshot(['pet'])?.nodeKind !==
    'discriminated-object' ||
  discriminatedRuntime.runtime.requestSetValue(['pet', 'barkVolume'], 8)
    .diagnostics[0]?.code !== 'INACTIVE_OBJECT_ALTERNATIVE_TARGET'
) {
  throw new Error('Discriminated object Angular runtime safety failed');
}
discriminatedRuntime.runtime.dispose();
const wizardSchema = {
  type: 'object', properties: {
    name: { type: 'string' }, review: { type: 'string' },
  },
};
const wizardCompiled = compileFormDefinition({
  schema: wizardSchema,
  uiSchema: { presentation: [{
    kind: 'wizard', id: 'angular-clean-wizard', label: 'Angular clean wizard',
    steps: [
      { kind: 'wizard-step', id: 'identity', label: 'Identity', children: ['name'] },
      { kind: 'wizard-step', id: 'review', label: 'Review', children: ['review'] },
    ],
  }] },
});
if (!wizardCompiled.success) throw new Error('Angular clean wizard failed');
const wizardValue = { name: 'Ada', review: 'ready' };
const wizardRuntime = createControlledFormRuntime({
  formId: 'clean-angular-m34', definition: wizardCompiled.definition,
  schema: wizardSchema, value: wizardValue, baselineValue: wizardValue,
  locale: 'en', validator, wizardState: { selectedStepId: 'identity' },
});
if (!wizardRuntime.success) throw new Error('Angular clean wizard runtime failed');
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
  throw new Error('Angular clean wizard declarations are unavailable');
}
if (wizardSubscription.success) wizardSubscription.unsubscribe();
wizardRuntime.runtime.dispose();
function directiveWizardAction(
  form: SchemaFormDirective<ConsumerValue>,
): WizardActionResult {
  return form.requestWizardNext();
}
void directiveWizardAction;

@Component({
  selector: 'clean-consumer',
  standalone: true,
  imports: [SchemaFormDirective],
  template: '<form [schemaForm]="config" (schemaOperation)="apply($event)"></form>',
})
class CleanConsumerComponent {
  value: ConsumerValue = {
    active: false,
    rows: [{ id: 'a', name: 'Ada' }],
    roles: ['editor'],
    pet: { kind: 'cat', name: 'Milo', lives: 9, barkVolume: 4 },
  };
  config: AngularControlledFormConfig<ConsumerValue> = {
    formId: 'clean-angular',
    definition,
    schema,
    value: this.value,
    baselineValue: {
      active: false,
      rows: [{ id: 'a', name: 'Ada' }],
      roles: ['editor'],
      pet: { kind: 'cat', name: 'Milo', lives: 9, barkVolume: 4 },
    },
    validator,
    locale: 'en',
  };

  apply(operation: FormOperation): void {
    const applied = applyFormOperation(definition, this.value, operation);
    if (applied.success) this.value = applied.value;
  }
}

const injector = createEnvironmentInjector(
  [
    provideSchemaEngineAngularNative(),
    provideSchemaTextResolver({
      resolve: (text, context) => context.member === 'label' ? \`en:\${text}\` : text,
    }),
  ],
  Injector.NULL as EnvironmentInjector,
);
const resolver = injector.get(AngularRendererResolver);
if (!resolver.ready) throw new Error('Renderer resolver is not ready');
if (
  typeof SchemaStringRendererComponent !== 'function' ||
  typeof SchemaStringEnumArrayRendererComponent !== 'function' ||
  typeof CleanConsumerComponent !== 'function'
) {
  throw new Error('Angular root exports are unavailable');
}
const rolesResolution = resolver.resolve(publicRolesDefinition);
if (
  !rolesResolution.success ||
  rolesResolution.registration.id !== 'native-string-enum-array' ||
  rolesResolution.registration.renderer !==
    SchemaStringEnumArrayRendererComponent
) {
  throw new Error('String-enum array native registration is unavailable');
}
injector.destroy();
`,
  );

  installConsumer(directory);
  if (expectedSchemaVersion !== undefined) {
    assert.equal(
      installedSchemaVersion(directory, '@rabassoft/schema-engine'),
      expectedSchemaVersion,
    );
    assert.equal(
      installedSchemaVersion(directory, '@rabassoft/schema-engine-angular'),
      expectedSchemaVersion,
    );
  }
  if (verifySignatures) {
    executeNpm(directory, ['audit', 'signatures']);
  }
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
  const useLiveCore = process.argv.includes('--live-core');
  const useLiveAngular = process.argv.includes('--live-angular');
  const liveVersion = argumentValue(process.argv, 'live-version');
  const liveSpecifier = argumentValue(process.argv, 'live-specifier');
  assert.equal(
    useLiveCore,
    liveVersion !== undefined,
    '--live-version is required exactly when --live-core is used',
  );
  assert.equal(
    liveSpecifier === undefined || useLiveCore,
    true,
    '--live-specifier requires --live-core',
  );
  const angularTarballArgument = process.argv
    .find((argument) => argument.startsWith('--angular-tarball='))
    ?.slice('--angular-tarball='.length);
  assert.equal(
    angularTarballArgument === undefined || useLiveCore,
    true,
    '--angular-tarball requires --live-core',
  );
  assert.equal(
    !useLiveAngular || useLiveCore,
    true,
    '--live-angular requires --live-core',
  );
  assert.equal(
    !useLiveAngular || angularTarballArgument === undefined,
    true,
    '--live-angular cannot be combined with --angular-tarball',
  );
  const packed = useLiveCore
    ? {
        core: undefined,
        angular: useLiveAngular
          ? undefined
          : angularTarballArgument === undefined
            ? packAngularCandidate(temporaryRoot)
            : resolve(angularTarballArgument),
      }
    : packCandidates(temporaryRoot);
  const packageSources = {
    core: useLiveCore
      ? liveSpecifier === 'unqualified'
        ? '*'
        : (liveSpecifier ?? liveVersion)
      : fileSpecifier(packed.core),
    angular: useLiveAngular
      ? liveSpecifier === 'unqualified'
        ? '*'
        : (liveSpecifier ?? liveVersion)
      : fileSpecifier(packed.angular),
  };
  const upperAngular = FROZEN_UPPER_ANGULAR ?? (await resolveUpperAngular());

  createCoreConsumer(
    packageSources.core,
    packageManager,
    typescriptVersion,
    useLiveCore ? liveVersion : undefined,
  );
  createAngularConsumer(
    'lower',
    LOWER_ANGULAR,
    packageSources,
    packageManager,
    typescriptVersion,
    useLiveAngular,
    useLiveAngular ? liveVersion : undefined,
  );
  createAngularConsumer(
    'upper',
    upperAngular,
    packageSources,
    packageManager,
    typescriptVersion,
    false,
    useLiveAngular ? liveVersion : undefined,
  );

  console.log(
    JSON.stringify(
      {
        lowerAngular: LOWER_ANGULAR,
        upperAngular,
        resolvedAt: new Date().toISOString(),
        source:
          FROZEN_UPPER_ANGULAR === undefined
            ? REGISTRY_SOURCE
            : 'frozen-command-input',
        coreSource: useLiveCore
          ? `registry:${liveVersion}`
          : basename(packed.core),
        angularSource: useLiveAngular
          ? `registry:${liveVersion}`
          : basename(packed.angular),
      },
      null,
      2,
    ),
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
