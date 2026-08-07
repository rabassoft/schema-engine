// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import * as foundation from '../dist/index.js';

assert.deepEqual(
  Object.keys(foundation),
  [
    'SchemaForm',
    'createReactNativeRendererRegistry',
    'createReactRendererRegistry',
    'useSchemaForm',
  ],
  'checkpoint 3 must expose the exact four-value runtime inventory',
);

const declarations = readFileSync(
  new URL('../dist/index.d.ts', import.meta.url),
  'utf8',
);
const publicTypes = [
  'ReactControlledFormConfig',
  'ReactFieldRendererProps',
  'ReactFieldTextSnapshot',
  'ReactFormActions',
  'ReactFormHandle',
  'ReactFormState',
  'ReactRendererComponent',
  'ReactRendererRegistration',
  'ReactRendererRegistry',
  'ReactRendererRegistryResult',
  'ReactRendererTester',
  'SchemaFormProps',
];
const declaredTypeInventory = [
  ...declarations.matchAll(/export type \{(?<members>[\s\S]*?)\} from/gu),
]
  .flatMap((match) => match.groups?.members.split(',') ?? [])
  .map((member) => member.trim())
  .filter(Boolean)
  .sort();
assert.deepEqual(declaredTypeInventory, [...publicTypes].sort());
for (const name of publicTypes) {
  assert.equal(
    declarations.match(new RegExp(`\\b${name}\\b`, 'gu'))?.length,
    1,
    `${name} must occur exactly once in the root declaration inventory`,
  );
}
for (const forbidden of [
  'BridgeStore',
  'ReactFormController',
  'RendererErrorBoundary',
])
  assert.doesNotMatch(declarations, new RegExp(`\\b${forbidden}\\b`, 'u'));

const manifest = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
assert.equal(manifest.private, true);
assert.equal(manifest.version, '0.0.0');
assert.equal(manifest.type, 'module');
assert.equal(manifest.sideEffects, false);
assert.deepEqual(manifest.exports, {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/index.js',
    default: './dist/index.js',
  },
});
assert.deepEqual(manifest.peerDependencies, {
  '@rabassoft/schema-engine': 'workspace:*',
  react: '>=19.2.0 <20.0.0',
  'react-dom': '>=19.2.0 <20.0.0',
});
assert.equal(manifest.publishConfig, undefined);

await assert.rejects(
  import('@rabassoft/schema-engine-react/internal/registry.js'),
  (error) => error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED',
  'package self-reference deep imports must be rejected by the root-only map',
);
