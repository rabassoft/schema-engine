import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PRIVATE_PROJECTS = Object.freeze({
  scenarios: Object.freeze({
    directory: 'apps/reference-scenarios',
    name: '@schema-engine-internal/reference-scenarios',
  }),
  angular: Object.freeze({
    directory: 'apps/reference-angular',
    name: '@schema-engine-internal/reference-angular',
  }),
  standard: Object.freeze({
    directory: 'apps/reference-standard',
    name: '@schema-engine-internal/reference-standard',
  }),
});

const PUBLIC_PROJECTS = Object.freeze(['packages/core', 'packages/angular']);
const PRIVATE_PRODUCT_PROJECTS = Object.freeze([
  Object.freeze({
    directory: 'packages/validator-ajv',
    name: '@rabassoft/schema-engine-validator-ajv',
  }),
]);

export const ANGULAR_PREBUNDLE_EXCLUDES = Object.freeze([
  '@codemirror/autocomplete',
  '@codemirror/commands',
  '@codemirror/lang-css',
  '@codemirror/lang-html',
  '@codemirror/lang-javascript',
  '@codemirror/lang-json',
  '@codemirror/language',
  '@codemirror/lint',
  '@codemirror/search',
  '@codemirror/state',
  '@codemirror/view',
  '@lezer/common',
  '@lezer/css',
  '@lezer/highlight',
  '@lezer/html',
  '@lezer/javascript',
  '@lezer/json',
  '@lezer/lr',
  '@marijn/find-cluster-break',
  '@schema-engine-internal/reference-scenarios',
  'codemirror',
  'crelt',
  'style-mod',
  'w3c-keyname',
]);

const FORBIDDEN_PUBLIC_PATH =
  /(?:^|\/)(?:apps|e2e|generated|playwright-report|test-results)(?:\/|$)|\.playwright-browsers/u;

const IMPORT_PATTERN = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)['"]([^'"]+)['"]/gu;

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sourceFiles(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'dist' || entry.name === 'node_modules') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...sourceFiles(path));
    else if (/\.(?:ts|mts|cts|js|mjs|cjs)$/u.test(entry.name))
      result.push(path);
  }
  return result;
}

function dependencyNames(manifest) {
  return Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
    ...manifest.optionalDependencies,
  });
}

function manifestTargets(value, path = []) {
  if (typeof value === 'string') return [{ path, target: value }];
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([member, child]) =>
    manifestTargets(child, [...path, member]),
  );
}

function assertSafeManifestTargets(root, manifestPath, member, value) {
  let inspected = 0;
  for (const { path, target } of manifestTargets(value, [member])) {
    const label = `${relative(root, manifestPath)}#${path.join('.')}`;
    assert.equal(
      target.includes('@schema-engine-internal/'),
      false,
      `${label} references a private app`,
    );
    assert.equal(
      FORBIDDEN_PUBLIC_PATH.test(target),
      false,
      `${label} exposes generated/browser/app path ${target}`,
    );
    inspected += 1;
  }
  return inspected;
}

function assertPrivateManifest(root, project) {
  const manifestPath = join(root, project.directory, 'package.json');
  const manifest = readJson(manifestPath);
  assert.equal(manifest.name, project.name, `${project.name}: wrong name`);
  assert.equal(manifest.private, true, `${project.name}: must be private`);
  assert.equal(
    Object.hasOwn(manifest, 'publishConfig'),
    false,
    `${project.name}: publishConfig is forbidden`,
  );
  assert.equal(
    Object.hasOwn(manifest.scripts ?? {}, 'pack'),
    false,
    `${project.name}: pack script is forbidden`,
  );
  assert.equal(
    Object.hasOwn(manifest.scripts ?? {}, 'publish'),
    false,
    `${project.name}: publish script is forbidden`,
  );
  assertSafeManifestTargets(root, manifestPath, 'files', manifest.files ?? []);
  assertSafeManifestTargets(
    root,
    manifestPath,
    'exports',
    manifest.exports ?? {},
  );
  return manifest;
}

function assertPublicManifest(root, directory) {
  const manifestPath = join(root, directory, 'package.json');
  const manifest = readJson(manifestPath);
  assert.notEqual(
    manifest.private,
    true,
    `${relative(root, manifestPath)} unexpectedly became private`,
  );
  assert.equal(
    dependencyNames(manifest).some((name) =>
      name.startsWith('@schema-engine-internal/'),
    ),
    false,
    `${relative(root, manifestPath)} depends on a private app`,
  );
  const serialized = JSON.stringify(manifest);
  assert.equal(
    serialized.includes('@schema-engine-internal/'),
    false,
    `${relative(root, manifestPath)} references a private app`,
  );
  const inspectedTargets =
    assertSafeManifestTargets(
      root,
      manifestPath,
      'files',
      manifest.files ?? [],
    ) +
    assertSafeManifestTargets(
      root,
      manifestPath,
      'exports',
      manifest.exports ?? {},
    );
  return { inspectedTargets, manifest };
}

function assertPrivateProductManifest(root, project) {
  const manifestPath = join(root, project.directory, 'package.json');
  const manifest = readJson(manifestPath);
  assert.equal(manifest.name, project.name, `${project.name}: wrong name`);
  assert.equal(manifest.private, true, `${project.name}: must stay private`);
  assert.equal(
    Object.hasOwn(manifest, 'publishConfig'),
    false,
    `${project.name}: publication is not authorized`,
  );
  assert.equal(
    dependencyNames(manifest).some((name) =>
      name.startsWith('@schema-engine-internal/'),
    ),
    false,
    `${project.name}: product package depends on a private app`,
  );
  const inspectedTargets = assertSafeManifestTargets(
    root,
    manifestPath,
    'exports',
    manifest.exports ?? {},
  );
  return { inspectedTargets, manifest };
}

function assertImport(root, file, specifier, owner) {
  const label = relative(root, file);
  const isRelative = specifier.startsWith('.');
  if (owner !== 'public' && !isRelative) {
    if (
      specifier.startsWith('@rabassoft/') ||
      specifier.startsWith('@schema-engine-internal/')
    ) {
      assert.equal(
        /(?:^|\/)(?:src|dist|test|testing)(?:\/|$)/u.test(specifier),
        false,
        `${label}: forbidden deep/test import ${specifier}`,
      );
    }
    assert.equal(
      specifier.startsWith('@rabassoft/schema-engine/'),
      false,
      `${label}: core deep import ${specifier}`,
    );
    assert.equal(
      specifier.startsWith('@rabassoft/schema-engine-angular/'),
      false,
      `${label}: Angular deep import ${specifier}`,
    );
  }

  if (owner !== 'public' && isRelative) {
    const target = resolve(dirname(file), specifier);
    const ownerRoot = resolve(root, PRIVATE_PROJECTS[owner].directory);
    const ownerRelative = relative(ownerRoot, target);
    assert.equal(
      ownerRelative === '..' || ownerRelative.startsWith(`..${sep}`),
      false,
      `${label}: physical cross-project import ${specifier}`,
    );
  }

  if (owner === 'public') {
    assert.equal(
      specifier.startsWith('@schema-engine-internal/'),
      false,
      `${label}: public package imports private app ${specifier}`,
    );
  }

  if (owner === 'scenarios') {
    assert.equal(
      specifier.startsWith('@angular/'),
      false,
      `${label}: neutral catalog imports Angular ${specifier}`,
    );
    assert.equal(
      specifier === '@schema-engine-internal/reference-angular',
      false,
      `${label}: catalog imports Angular shell`,
    );
  }

  if (owner === 'standard') {
    assert.equal(
      /^(?:@angular\/|@rabassoft\/schema-engine-angular$|react(?:\/|$)|react-dom(?:\/|$)|rxjs(?:\/|$)|vue(?:\/|$))/u.test(
        specifier,
      ),
      false,
      `${label}: Standard shell imports framework dependency ${specifier}`,
    );
    assert.equal(
      specifier === '@schema-engine-internal/reference-angular',
      false,
      `${label}: Standard shell imports Angular shell`,
    );
  }
}

function inspectImports(root, directory, owner) {
  let inspected = 0;
  for (const file of sourceFiles(join(root, directory))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(IMPORT_PATTERN)) {
      assertImport(root, file, match[1], owner);
      inspected += 1;
    }
  }
  return inspected;
}

export function verifyReferenceBoundaries(root = resolve('.')) {
  const rootManifest = readJson(join(root, 'package.json'));
  const scenarios = assertPrivateManifest(root, PRIVATE_PROJECTS.scenarios);
  const angular = assertPrivateManifest(root, PRIVATE_PROJECTS.angular);
  const standard = assertPrivateManifest(root, PRIVATE_PROJECTS.standard);
  const validatorProject = PRIVATE_PRODUCT_PROJECTS[0];
  const validator = assertPrivateProductManifest(root, validatorProject);

  assert.deepEqual(scenarios.exports, {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js',
    },
  });
  assert.deepEqual(dependencyNames(scenarios), ['@rabassoft/schema-engine']);
  assert.deepEqual(
    dependencyNames(angular).sort(),
    [
      '@angular/common',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@codemirror/lang-html',
      '@codemirror/lang-javascript',
      '@codemirror/lang-json',
      '@codemirror/language',
      '@rabassoft/schema-engine',
      '@rabassoft/schema-engine-angular',
      '@rabassoft/schema-engine-validator-ajv',
      '@schema-engine-internal/reference-scenarios',
      '@lezer/highlight',
      'codemirror',
      'tslib',
    ].sort(),
  );
  assert.equal(
    Object.hasOwn(standard, 'exports'),
    false,
    'reference-standard: exports are forbidden',
  );
  assert.deepEqual(dependencyNames(standard).sort(), [
    '@rabassoft/schema-engine',
    '@rabassoft/schema-engine-validator-ajv',
    '@schema-engine-internal/reference-scenarios',
  ]);
  assert.deepEqual(dependencyNames(validator.manifest).sort(), [
    '@rabassoft/schema-engine',
    'ajv',
  ]);
  assert.deepEqual(validator.manifest.exports, {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      default: './dist/index.js',
    },
  });
  assert.equal(
    rootManifest.devDependencies?.ajv,
    '8.20.0',
    'workspace root must own exact Ajv for Angular/Vite virtual-root resolution',
  );
  const workspace = readJson(join(root, 'angular.json'));
  assert.deepEqual(
    workspace.projects?.['reference-angular']?.architect?.serve?.options
      ?.prebundle?.exclude,
    ANGULAR_PREBUNDLE_EXCLUDES,
    'reference-angular: prebundle exclusions must match the approved private dependency graph',
  );

  const inspectedManifestTargets =
    validator.inspectedTargets +
    PUBLIC_PROJECTS.reduce(
      (count, directory) =>
        count + assertPublicManifest(root, directory).inspectedTargets,
      0,
    );

  const inspectedImports =
    inspectImports(root, PRIVATE_PROJECTS.scenarios.directory, 'scenarios') +
    inspectImports(root, PRIVATE_PROJECTS.angular.directory, 'angular') +
    inspectImports(root, PRIVATE_PROJECTS.standard.directory, 'standard') +
    inspectImports(root, validatorProject.directory, 'public') +
    PUBLIC_PROJECTS.reduce(
      (count, directory) => count + inspectImports(root, directory, 'public'),
      0,
    );

  return Object.freeze({
    inspectedImports,
    inspectedManifestTargets,
    privateProjects: 3,
    privateProductProjects: PRIVATE_PRODUCT_PROJECTS.length,
    publicProjects: PUBLIC_PROJECTS.length,
  });
}

const currentFile = fileURLToPath(import.meta.url);
if (
  process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href ===
    pathToFileURL(currentFile).href
) {
  const result = verifyReferenceBoundaries();
  console.log(
    `Verified ${result.privateProjects} private reference projects, ${result.privateProductProjects} private product projects, ${result.publicProjects} public projects, ${result.inspectedManifestTargets} manifest targets and ${result.inspectedImports} import boundaries.`,
  );
}
