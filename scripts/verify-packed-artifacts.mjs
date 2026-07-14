import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  listTarball,
  packCandidates,
  readTarballJson,
  readTarballText,
} from './release-candidate-utils.mjs';

const temporaryRoot = mkdtempSync(join(tmpdir(), 'schema-engine-artifacts-'));

const CORE_MODULES = Object.freeze([
  'compiler',
  'contracts',
  'index',
  'internal/collection-address',
  'internal/collection-operation',
  'internal/diagnostics',
  'internal/immutable',
  'internal/keywords',
  'internal/nested-definition',
  'internal/path',
  'internal/value',
  'operations',
  'runtime',
]);
const ANGULAR_MODULES = Object.freeze([
  'field-outlet.directive',
  'form.directive',
  'index',
  'native/boolean-renderer',
  'native/common',
  'native/number-codec',
  'native/number-renderer',
  'native/provider',
  'native/string-enum-renderer',
  'native/string-renderer',
  'node-outlet',
  'renderer',
  'testing/fake-renderer',
  'text',
]);
const MODULE_SUFFIXES = Object.freeze(['.js', '.js.map', '.d.ts', '.d.ts.map']);

function expectedMembers(modules) {
  return new Set([
    'package/package.json',
    'package/README.md',
    ...modules.flatMap((module) =>
      MODULE_SUFFIXES.map((suffix) => `package/dist/${module}${suffix}`),
    ),
  ]);
}

function verifyCommon(tarball, expectedName, modules) {
  const members = listTarball(tarball);
  const files = new Set(members.filter((member) => !member.endsWith('/')));

  assert.deepEqual(
    [...files].sort(),
    [...expectedMembers(modules)].sort(),
    `${expectedName} tarball inventory changed`,
  );
  assert.ok(files.has('package/package.json'));
  assert.ok(files.has('package/README.md'));
  assert.ok(files.has('package/dist/index.js'));
  assert.ok(files.has('package/dist/index.d.ts'));

  const manifest = readTarballJson(tarball, 'package/package.json');
  assert.equal(manifest.name, expectedName);
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.private, true);
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.sideEffects, false);
  assert.deepEqual(manifest.files, ['dist', 'README.md']);
  assert.deepEqual(manifest.exports, {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js',
    },
  });
  assert.equal(JSON.stringify(manifest).includes('workspace:'), false);

  for (const target of Object.values(manifest.exports['.'])) {
    assert.ok(files.has(`package/${target.slice(2)}`), `Missing ${target}`);
  }

  return manifest;
}

try {
  const tarballs = packCandidates(temporaryRoot);
  const core = verifyCommon(
    tarballs.core,
    '@rabassoft/schema-engine',
    CORE_MODULES,
  );
  const angular = verifyCommon(
    tarballs.angular,
    '@rabassoft/schema-engine-angular',
    ANGULAR_MODULES,
  );

  const coreIndex = readTarballText(tarballs.core, 'package/dist/index.d.ts');
  for (const publicName of [
    'ArrayNodeDefinition',
    'ArrayRuntimeSnapshot',
    'ArrayUiSchema',
    'BaseNodeDefinition',
    'BaseNodeTemplate',
    'CollectionItemAddress',
    'CollectionNodeAddress',
    'CollectionPolicy',
    'CollectionTextResolutionContext',
    'FieldTemplate',
    'FormNodeDefinition',
    'FormNodeTemplate',
    'FormScopeTarget',
    'ItemRuntimeSnapshot',
    'ObjectFieldDefinition',
    'ObjectItemTemplateDefinition',
    'ObjectPresence',
    'NodeRuntimeSnapshot',
    'ObjectRuntimeSnapshot',
    'ObjectTextMember',
    'ObjectTextResolutionContext',
    'ObjectUiSchema',
  ]) {
    assert.ok(
      coreIndex.includes(publicName),
      `Missing core export ${publicName}`,
    );
  }
  for (const internalName of [
    'compileObjectNode',
    'canonicalTemplateKey',
    'copyCollectionItemAddress',
    'normalizeDataPath',
    'readOwnValue',
  ]) {
    assert.equal(
      coreIndex.includes(internalName),
      false,
      `Internal core helper exported: ${internalName}`,
    );
  }

  const angularIndex = readTarballText(
    tarballs.angular,
    'package/dist/index.d.ts',
  );
  for (const publicName of [
    'SchemaFormDirective',
    'SchemaFieldOutletDirective',
    'AngularControlledFormConfig',
    'provideSchemaTextResolver',
  ]) {
    assert.ok(
      angularIndex.includes(publicName),
      `Missing Angular export ${publicName}`,
    );
  }
  for (const internalName of [
    'SchemaNodeOutletComponent',
    'ObjectHostFactory',
    'AngularObjectTextSnapshot',
  ]) {
    assert.equal(
      angularIndex.includes(internalName),
      false,
      `Internal Angular helper exported: ${internalName}`,
    );
  }
  const formDeclaration = readTarballText(
    tarballs.angular,
    'package/dist/form.directive.d.ts',
  );
  assert.ok(
    formDeclaration.includes('ɵɵComponentDeclaration'),
    'SchemaFormDirective must remain an attribute component',
  );

  assert.equal(core.dependencies, undefined);
  assert.equal(core.devDependencies, undefined);
  assert.equal(core.peerDependencies, undefined);
  assert.equal(core.optionalDependencies, undefined);

  assert.deepEqual(angular.dependencies, { tslib: '^2.8.1' });
  assert.deepEqual(angular.peerDependencies, {
    '@angular/core': '>=22.0.6 <23.0.0',
    '@angular/forms': '>=22.0.6 <23.0.0',
    '@rabassoft/schema-engine': '^0.1.0',
  });
  assert.deepEqual(angular.devDependencies, {
    '@rabassoft/schema-engine': '0.1.0',
  });
  assert.equal(angular.optionalDependencies, undefined);

  console.log(
    'Verified private 0.1.0 candidate manifests and tarball contents.',
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
