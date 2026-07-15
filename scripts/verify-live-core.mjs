import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PACKAGE_NAME = '@rabassoft/schema-engine';
const VERSION = '0.1.0';
const REGISTRY = 'https://registry.npmjs.org';
const EXPECTED_SHA512 =
  'dceb432ed1ee4bed4740134e52d1dc5896bb62a5cad9f0e763692e19ef1a0f3076b7f5ee22f9046c82bc2d0cb2d8dafc2253cf5ed970caefa93930280fdb310e';
const EXPECTED_INTEGRITY =
  'sha512-3OtDLtHuS+1HQBNOUtHcWJa7YqXK2fDnY2kuGe8aDzB2t/XuIvkEbIK8LQyy2Nr8IlPPXtlwyu+pOTAoD9sxDg==';

const temporaryRoot = mkdtempSync(join(tmpdir(), 'schema-engine-live-core-'));
const emptyUserConfig = join(temporaryRoot, 'empty-user.npmrc');
writeFileSync(emptyUserConfig, '');

const cleanEnvironment = { ...process.env };
for (const name of Object.keys(cleanEnvironment)) {
  if (
    /^(?:NODE_AUTH_TOKEN|NPM_TOKEN)$/iu.test(name) ||
    /^NPM_CONFIG_.*(?:AUTH|TOKEN|PASSWORD|OTP)/iu.test(name)
  ) {
    delete cleanEnvironment[name];
  }
}
cleanEnvironment.NPM_CONFIG_USERCONFIG = emptyUserConfig;
cleanEnvironment.NPM_CONFIG_CACHE = join(temporaryRoot, 'npm-cache');

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: cleanEnvironment,
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(' ')} failed:\n${result.stdout}${result.stderr}`,
  );
}

async function registryDocument(
  path,
  accept = 'application/vnd.npm.install-v1+json',
) {
  const response = await fetch(`${REGISTRY}/${path}`, {
    headers: { accept },
  });
  assert.equal(response.status, 200, `Registry returned ${response.status}`);
  return response.json();
}

async function verifyRegistryAndTarball() {
  const encodedPackage = encodeURIComponent(PACKAGE_NAME);
  const metadata = await registryDocument(encodedPackage);
  const versionMetadata = await registryDocument(
    `${encodedPackage}/${VERSION}`,
    'application/json',
  );
  const manifest = metadata.versions[VERSION];
  assert.ok(manifest, `Missing ${PACKAGE_NAME}@${VERSION}`);
  assert.equal(manifest.name, PACKAGE_NAME);
  assert.equal(manifest.version, VERSION);
  assert.equal(versionMetadata.license, 'AGPL-3.0-only');
  assert.equal(manifest.dist.integrity, EXPECTED_INTEGRITY);
  assert.equal(versionMetadata.dist.attestations, undefined);

  const response = await fetch(manifest.dist.tarball);
  assert.equal(response.status, 200, `Tarball returned ${response.status}`);
  const tarball = Buffer.from(await response.arrayBuffer());
  const sha512 = createHash('sha512').update(tarball).digest('hex');
  assert.equal(sha512, EXPECTED_SHA512);

  const localCandidate = readFileSync(
    join(process.cwd(), '.release/0.1.0/rabassoft-schema-engine-0.1.0.tgz'),
  );
  assert.deepEqual(tarball, localCandidate);
}

function verifyConsumer(label, packageSpecifier) {
  const directory = join(temporaryRoot, label);
  mkdirSync(join(directory, 'src'), { recursive: true });
  writeJson(join(directory, 'package.json'), {
    name: `schema-engine-live-core-${label}`,
    private: true,
    type: 'module',
    scripts: { build: 'tsc -p tsconfig.json' },
    dependencies: { [PACKAGE_NAME]: packageSpecifier },
    devDependencies: { typescript: '6.0.2' },
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
  compileFormDefinition,
  createControlledFormRuntime,
} from '@rabassoft/schema-engine';

const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: { name: { type: 'string' } },
};
const compiled = compileFormDefinition({ schema });
if (!compiled.success) throw new Error('Compilation failed');
const value = { name: 'Rabassoft' };
const created = createControlledFormRuntime({
  formId: 'live-core',
  definition: compiled.definition,
  schema,
  value,
  baselineValue: value,
  locale: 'en',
  validator: { validate: () => ({ valid: true, issues: [] }) },
});
if (!created.success) throw new Error('Runtime creation failed');
if (created.runtime.getFieldSnapshot(['name'])?.nodeKind !== 'field') {
  throw new Error('Unexpected live runtime snapshot');
}
created.runtime.dispose();
`,
  );

  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      `--registry=${REGISTRY}`,
    ],
    directory,
  );
  run('npm', ['run', 'build'], directory);
  run(process.execPath, ['dist/main.js'], directory);

  const installed = JSON.parse(
    readFileSync(
      join(directory, 'node_modules/@rabassoft/schema-engine/package.json'),
      'utf8',
    ),
  );
  assert.equal(installed.version, VERSION);
}

try {
  await verifyRegistryAndTarball();
  verifyConsumer('exact', VERSION);
  console.log(
    `Historical live core verification passed: ${PACKAGE_NAME}@${VERSION}, exact bytes and consumer`,
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
