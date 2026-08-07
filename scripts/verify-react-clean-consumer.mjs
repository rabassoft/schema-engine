import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  packCoreCandidate,
  packReactCandidate,
  runPnpm,
  workspaceRoot,
} from './release-candidate-utils.mjs';

const mode = process.argv
  .find((argument) => argument.startsWith('--mode='))
  ?.slice('--mode='.length);
assert.ok(
  mode === 'lower' || mode === 'current',
  'Expected lower/current mode',
);
const reactVersion = mode === 'lower' ? '19.2.0' : '19.2.8';
const temporaryRoot = mkdtempSync(
  join(tmpdir(), `schema-engine-react-${mode}-consumer-`),
);
const artifacts = join(temporaryRoot, 'artifacts');
const consumer = join(temporaryRoot, 'consumer');
mkdirSync(artifacts, { recursive: true });
mkdirSync(join(consumer, 'src'), { recursive: true });

function write(relative, contents) {
  writeFileSync(join(consumer, relative), contents);
}

try {
  const coreTarball = packCoreCandidate(artifacts);
  const reactTarball = packReactCandidate(artifacts);
  write(
    'package.json',
    `${JSON.stringify(
      {
        name: `schema-engine-react-${mode}-clean-consumer`,
        private: true,
        type: 'module',
        scripts: {
          build: 'tsc -p tsconfig.json',
          start: 'node dist/consumer.js',
        },
        dependencies: {
          '@rabassoft/schema-engine': `file:${coreTarball}`,
          '@rabassoft/schema-engine-react': `file:${reactTarball}`,
          react: reactVersion,
          'react-dom': reactVersion,
        },
        devDependencies: {
          '@types/react': '19.2.17',
          '@types/react-dom': '19.2.3',
          'happy-dom': '20.10.6',
          typescript: '6.0.2',
        },
      },
      null,
      2,
    )}\n`,
  );
  write(
    'tsconfig.json',
    `${JSON.stringify(
      {
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          forceConsistentCasingInFileNames: true,
          jsx: 'react-jsx',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          noUncheckedIndexedAccess: true,
          outDir: 'dist',
          rootDir: 'src',
          strict: true,
          target: 'ES2022',
          types: ['react', 'react-dom'],
          verbatimModuleSyntax: true,
        },
        include: ['src/**/*.ts', 'src/**/*.tsx'],
      },
      null,
      2,
    )}\n`,
  );
  write(
    'src/consumer.tsx',
    `import { applyFormOperation, compileFormDefinition } from '@rabassoft/schema-engine';
import type { FormOperation } from '@rabassoft/schema-engine';
import {
  SchemaForm,
  createReactNativeRendererRegistry,
  createReactRendererRegistry,
  useSchemaForm,
} from '@rabassoft/schema-engine-react';
import type {
  ReactControlledFormConfig,
  ReactFieldRendererProps,
  ReactFormHandle,
  ReactRendererRegistration,
} from '@rabassoft/schema-engine-react';
import { Window } from 'happy-dom';
import { act, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const browser = new Window({ url: 'http://localhost/' });
Object.defineProperties(globalThis, {
  document: { configurable: true, value: browser.document },
  HTMLElement: { configurable: true, value: browser.HTMLElement },
  navigator: { configurable: true, value: browser.navigator },
  Node: { configurable: true, value: browser.Node },
  window: { configurable: true, value: browser },
});
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true });

const schema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', title: 'Name' } },
} as const;
const compiled = compileFormDefinition({ schema });
if (!compiled.success) throw new Error('Clean-consumer definition failed');
const definition = compiled.definition;
const baseline = Object.freeze({ name: 'Ada' });
const validator = Object.freeze({
  validate: () => ({ valid: true as const, issues: [] }),
});
const nativeRegistry = createReactNativeRendererRegistry();
if (!nativeRegistry.success) throw new Error('Native registry failed');
const nativeRendererRegistry = nativeRegistry.registry;

let operationCount = 0;
function NativeConsumer() {
  const [value, setValue] = useState(baseline);
  const requested = useRef(false);
  const form = useSchemaForm({
    formId: 'clean-native',
    definition,
    schema,
    value,
    baselineValue: baseline,
    locale: 'en',
    validator,
    onOperation: (operation: FormOperation) => {
      operationCount += 1;
      setValue((current) => {
        const applied = applyFormOperation(definition, current, operation);
        if (!applied.success) throw new Error('Clean-consumer operation failed');
        return applied.value;
      });
    },
    onWizardIntention: () => undefined,
  });
  useEffect(() => {
    if (form.state.status !== 'ready' || requested.current) return;
    requested.current = true;
    const result = form.actions.requestSetValue(['name'], 'Grace');
    if (!result.success)
      throw new Error(
        'Clean-consumer action failed: ' + JSON.stringify(result.diagnostics),
      );
  }, [form]);
  return <SchemaForm form={form} rendererRegistry={nativeRendererRegistry} />;
}

function CustomField({ snapshot }: ReactFieldRendererProps) {
  return <output data-custom="true">{
    snapshot.presence.kind === 'value'
      ? String(snapshot.presence.value)
      : snapshot.presence.kind
  }</output>;
}
const customRegistration: ReactRendererRegistration = {
  id: 'clean-custom',
  component: CustomField,
  tester: () => 100,
};
const customRegistry = createReactRendererRegistry([customRegistration]);
if (!customRegistry.success) throw new Error('Custom registry failed');
const customRendererRegistry = customRegistry.registry;
function CustomConsumer() {
  const form = useSchemaForm({
    formId: 'clean-custom',
    definition,
    schema,
    value: baseline,
    baselineValue: baseline,
    locale: 'en',
    validator,
    onOperation: () => undefined,
    onWizardIntention: () => undefined,
  });
  return <SchemaForm form={form} rendererRegistry={customRendererRegistry} />;
}

const configTypeEvidence = null as ReactControlledFormConfig<{ name: string }> | null;
const handleTypeEvidence = null as ReactFormHandle<{ name: string }> | null;
if (configTypeEvidence !== null || handleTypeEvidence !== null)
  throw new Error('Type-only evidence became reachable');

const nativeContainer = document.createElement('div');
document.body.append(nativeContainer);
const nativeRoot = createRoot(nativeContainer);
await act(async () => {
  nativeRoot.render(<NativeConsumer />);
});
for (let attempt = 0; attempt < 10; attempt += 1) {
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  const input = nativeContainer.querySelector('input');
  if (input?.value === 'Grace') break;
}
if (nativeContainer.querySelector('input')?.value !== 'Grace')
  throw new Error('Native controlled form did not reconcile');
if (operationCount !== 1) throw new Error('Action did not emit exactly once');
await act(async () => nativeRoot.unmount());

const customContainer = document.createElement('div');
document.body.append(customContainer);
const customRoot = createRoot(customContainer);
await act(async () => {
  customRoot.render(<CustomConsumer />);
});
for (let attempt = 0; attempt < 10; attempt += 1) {
  await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
  if (customContainer.querySelector('[data-custom="true"]')) break;
}
if (customContainer.querySelector('[data-custom="true"]')?.textContent !== 'Ada')
  throw new Error('Custom registry did not project from the Public root');
await act(async () => customRoot.unmount());

const runtime = await import('@rabassoft/schema-engine-react');
const keys = Object.keys(runtime);
if (JSON.stringify(keys) !== JSON.stringify([
  'SchemaForm',
  'createReactNativeRendererRegistry',
  'createReactRendererRegistry',
  'useSchemaForm',
])) throw new Error('Runtime root inventory changed');
try {
  const privatePath = '@rabassoft/schema-engine-react/internal/' + 'registry.js';
  await import(privatePath);
  throw new Error('Deep import unexpectedly resolved');
} catch (error: unknown) {
  if (!(error instanceof Error) || !('code' in error) || error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED')
    throw error;
}
console.log('React ${mode} clean consumer passed with React/DOM ${reactVersion}.');
`,
  );

  const installArguments = [
    'install',
    '--ignore-workspace',
    '--ignore-scripts',
    '--strict-peer-dependencies',
    '--store-dir',
    join(workspaceRoot, '.pnpm-store'),
    ...(process.argv.includes('--offline') ? ['--offline'] : []),
  ];
  runPnpm(installArguments, { cwd: consumer, stdio: 'inherit' });
  runPnpm(['run', 'build'], { cwd: consumer, stdio: 'inherit' });
  runPnpm(['run', 'start'], { cwd: consumer, stdio: 'inherit' });

  const installedReact = JSON.parse(
    readFileSync(join(consumer, 'node_modules/react/package.json'), 'utf8'),
  );
  const installedReactDom = JSON.parse(
    readFileSync(join(consumer, 'node_modules/react-dom/package.json'), 'utf8'),
  );
  const installedAdapter = JSON.parse(
    readFileSync(
      join(
        consumer,
        'node_modules/@rabassoft/schema-engine-react/package.json',
      ),
      'utf8',
    ),
  );
  const installedReactTypes = JSON.parse(
    readFileSync(
      join(consumer, 'node_modules/@types/react/package.json'),
      'utf8',
    ),
  );
  const installedReactDomTypes = JSON.parse(
    readFileSync(
      join(consumer, 'node_modules/@types/react-dom/package.json'),
      'utf8',
    ),
  );
  assert.equal(installedReact.version, reactVersion);
  assert.equal(installedReactDom.version, reactVersion);
  assert.equal(installedAdapter.private, true);
  assert.equal(installedAdapter.version, '0.0.0');
  assert.equal(installedReactTypes.version, '19.2.17');
  assert.equal(installedReactDomTypes.version, '19.2.3');
  assert.equal(installedAdapter.peerDependencies.react, '>=19.2.0 <20.0.0');
  assert.equal(
    installedAdapter.peerDependencies['react-dom'],
    '>=19.2.0 <20.0.0',
  );
  assert.equal(
    realpathSync(
      join(consumer, 'node_modules/@rabassoft/schema-engine-react'),
    ).startsWith(process.cwd()),
    false,
    'clean consumer accidentally resolved the workspace package directory',
  );
  assert.equal(
    realpathSync(
      join(consumer, 'node_modules/@rabassoft/schema-engine'),
    ).startsWith(process.cwd()),
    false,
    'clean consumer accidentally resolved the workspace core directory',
  );
  const consumerLock = readFileSync(join(consumer, 'pnpm-lock.yaml'), 'utf8');
  assert.equal(consumerLock.includes('workspace:'), false);
  assert.doesNotMatch(
    consumerLock,
    /@angular|reference-angular|reference-standard/u,
  );
} finally {
  if (!process.env.KEEP_SCHEMA_ENGINE_CONSUMERS)
    rmSync(temporaryRoot, { recursive: true, force: true });
  else console.error(`Preserved React ${mode} consumer at ${temporaryRoot}`);
}
