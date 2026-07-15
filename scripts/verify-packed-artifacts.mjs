import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  listTarball,
  packCandidates,
  readTarballJson,
  readTarballText,
  readWorkspacePackage,
} from './release-candidate-utils.mjs';

const temporaryRoot = mkdtempSync(join(tmpdir(), 'schema-engine-artifacts-'));

const CORE_MODULES = Object.freeze([
  'compiler',
  'contracts',
  'index',
  'internal/collection-address',
  'internal/collection-operation',
  'internal/collection-runtime',
  'internal/diagnostics',
  'internal/immutable',
  'internal/keywords',
  'internal/nested-definition',
  'internal/path',
  'internal/presentation-definition',
  'internal/schema-reference',
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
const LICENSE_SHA256 =
  '0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0';
const SOURCE_HEADER =
  '// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft\n' +
  '// SPDX-License-Identifier: AGPL-3.0-only\n';

function expectedMembers(modules) {
  return new Set([
    'package/package.json',
    'package/README.md',
    'package/SOURCE.md',
    'package/LICENSE',
    'package/NOTICE.md',
    'package/source-build/package.json',
    'package/source-build/pnpm-lock.yaml',
    ...(modules === ANGULAR_MODULES
      ? ['package/source-build/prepare-core.mjs']
      : []),
    'package/source-build/tsconfig.json',
    ...modules.map((module) => `package/src/${module}.ts`),
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
  assert.equal(
    createHash('sha256')
      .update(readTarballText(tarball, 'package/LICENSE'))
      .digest('hex'),
    LICENSE_SHA256,
  );

  for (const module of modules) {
    assert.ok(
      readTarballText(tarball, `package/src/${module}.ts`).startsWith(
        SOURCE_HEADER,
      ),
      `Missing source license header: ${module}.ts`,
    );
  }

  const manifest = readTarballJson(tarball, 'package/package.json');
  assert.equal(manifest.name, expectedName);
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.private, undefined);
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.sideEffects, false);
  assert.deepEqual(manifest.files, [
    'dist',
    'src',
    'source-build',
    'README.md',
    'SOURCE.md',
    'LICENSE',
    'NOTICE.md',
  ]);
  assert.equal(manifest.license, 'AGPL-3.0-only');
  assert.deepEqual(manifest.author, {
    name: 'Ricardo Rabassó Rodríguez, operating as Rabassoft',
    email: 'ricard@rabassoft.com',
  });
  assert.deepEqual(manifest.publishConfig, {
    access: 'public',
    tag: 'next',
    provenance: false,
  });
  assert.equal(manifest.repository, undefined);
  assert.deepEqual(manifest.exports, {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js',
    },
  });
  assert.equal(JSON.stringify(manifest).includes('workspace:'), false);

  const sourceBuildManifest = readTarballJson(
    tarball,
    'package/source-build/package.json',
  );
  assert.equal(sourceBuildManifest.private, true);
  assert.equal(sourceBuildManifest.packageManager, 'pnpm@10.28.2');
  assert.equal(
    JSON.stringify(sourceBuildManifest).includes('workspace:'),
    false,
  );

  const readme = readTarballText(tarball, 'package/README.md');
  assert.ok(readme.includes('@next'));
  assert.ok(readme.includes('AGPL-3.0-only'));
  assert.ok(readme.includes('no npm provenance'));
  assert.equal(readme.includes('github.com/rabassoft/schema-engine'), false);
  const notice = readTarballText(tarball, 'package/NOTICE.md');
  assert.ok(notice.includes('ricard@rabassoft.com'));
  assert.ok(notice.includes('not itself a commercial offer'));

  for (const target of Object.values(manifest.exports['.'])) {
    assert.ok(files.has(`package/${target.slice(2)}`), `Missing ${target}`);
  }

  return manifest;
}

try {
  assert.equal(readWorkspacePackage().private, true);
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
    'CollectionIdentityState',
    'CollectionNodeAddress',
    'CollectionPlacement',
    'CollectionPolicy',
    'CollectionTextMember',
    'CollectionTextResolutionContext',
    'FieldTemplate',
    'FormNodeDefinition',
    'FormNodeTemplate',
    'FormScopeTarget',
    'InsertItemOperation',
    'ItemIdentityDefinition',
    'ItemRuntimeSnapshot',
    'ItemUiSchema',
    'MoveItemOperation',
    'ObjectFieldDefinition',
    'ObjectItemTemplateDefinition',
    'ObjectNodeTemplate',
    'ObjectPresence',
    'NodeRuntimeSnapshot',
    'ObjectRuntimeSnapshot',
    'ObjectTextMember',
    'ObjectTextResolutionContext',
    'ObjectUiSchema',
    'PresentationEntryDefinition',
    'PresentationSectionDefinition',
    'PresentedFormNodeDefinition',
    'RemoveItemOperation',
    'RemoveItemValueOperation',
    'RuntimeTreeSnapshot',
    'SetItemValueOperation',
    'SectionTextMember',
    'SectionTextResolutionContext',
    'UiPresentationEntry',
    'UiSectionSchema',
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
    'ResolvedSchemaCursor',
    'ReferenceChain',
    'DefinitionRegistryInspection',
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
    'CollectionHostFactory',
    'ItemHostFactory',
    'SchemaPresentationOutletComponent',
    'SectionHostFactory',
    'SectionTextProjectionResult',
    'AngularObjectTextSnapshot',
    'AngularCollectionTextSnapshot',
    'FIELD_INSTANCE_CONTEXT',
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
  for (const method of [
    'getItemSnapshot',
    'getCollectionNodeSnapshot',
    'requestSetItemValue',
    'requestRemoveItemValue',
    'requestInsertItem',
    'requestRemoveItem',
    'requestMoveItem',
  ]) {
    assert.ok(
      formDeclaration.includes(`${method}(`),
      `Missing Angular collection projection ${method}`,
    );
  }
  const rendererDeclaration = readTarballText(
    tarballs.angular,
    'package/dist/renderer.d.ts',
  );
  assert.ok(
    rendererDeclaration.includes('FieldDefinition | FieldTemplate'),
    'Angular renderer declarations do not accept item templates',
  );
  const outletDeclaration = readTarballText(
    tarballs.angular,
    'package/dist/field-outlet.directive.d.ts',
  );
  assert.ok(
    outletDeclaration.includes('FieldDefinition | FieldTemplate'),
    'Angular field outlet declaration does not accept item templates',
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
    'Verified public 0.1.0 candidates with licensed Corresponding Source.',
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
