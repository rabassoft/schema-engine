import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';

async function readJson(relativePath) {
  return JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), 'utf8'),
  );
}

const aria = await readJson('../node_modules/@angular/aria/package.json');
const cdk = await readJson('../node_modules/@angular/cdk/package.json');

assert.equal(aria.version, '22.0.5');
assert.equal(aria.license, 'MIT');
assert.equal(aria.peerDependencies?.['@angular/cdk'], '22.0.5');
assert.equal(aria.peerDependencies?.['@angular/core'], '^22.0.0 || ^23.0.0');
assert.deepEqual(aria.dependencies, { tslib: '^2.3.0' });

assert.equal(cdk.version, '22.0.5');
assert.equal(cdk.license, 'MIT');
assert.deepEqual(cdk.peerDependencies, {
  '@angular/common': '^22.0.0 || ^23.0.0',
  '@angular/core': '^22.0.0 || ^23.0.0',
  '@angular/platform-browser': '^22.0.0 || ^23.0.0',
  rxjs: '^6.5.3 || ^7.4.0',
});
assert.deepEqual(cdk.dependencies, {
  parse5: '^8.0.0',
  tslib: '^2.3.0',
});

for (const [name, directory, manifest] of [
  ['Angular Aria', 'aria', aria],
  ['Angular CDK', 'cdk', cdk],
]) {
  for (const lifecycle of ['preinstall', 'install', 'postinstall', 'prepare']) {
    assert.equal(
      Object.hasOwn(manifest.scripts ?? {}, lifecycle),
      false,
      `${name} declares ${lifecycle}`,
    );
  }
  const license = await readFile(
    new URL(`../node_modules/@angular/${directory}/LICENSE`, import.meta.url),
    'utf8',
  );
  assert.match(license, /^The MIT License/u);
  assert.match(license, /Copyright \(c\) 2026 Google LLC\./u);
}
