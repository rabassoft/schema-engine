import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import '@angular/compiler';
import * as pilotApi from '@rabassoft/schema-engine-angular-aria';

const manifest = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);

assert.deepEqual(Object.keys(pilotApi), [
  'provideSchemaEngineAngularAriaContainers',
]);
assert.equal(
  typeof pilotApi.provideSchemaEngineAngularAriaContainers,
  'function',
);
assert.equal(manifest.name, '@rabassoft/schema-engine-angular-aria');
assert.equal(manifest.version, '0.2.0');
assert.deepEqual(manifest.sideEffects, ['./styles.css']);
assert.deepEqual(manifest.files, [
  'dist',
  'src',
  'source-build',
  'README.md',
  'SOURCE.md',
  'LICENSE',
  'NOTICE.md',
  'styles.css',
]);
assert.deepEqual(manifest.exports, {
  '.': {
    types: './dist/index.d.ts',
    import: './dist/index.js',
    default: './dist/index.js',
  },
  './styles.css': './styles.css',
});
assert.deepEqual(manifest.dependencies, { tslib: '^2.8.1' });
assert.deepEqual(manifest.peerDependencies, {
  '@angular/aria': '>=22.0.5 <23.0.0',
  '@angular/cdk': '>=22.0.5 <23.0.0',
  '@angular/core': '>=22.0.6 <23.0.0',
  '@rabassoft/schema-engine-angular': 'workspace:^',
});
assert.deepEqual(manifest.devDependencies, {
  '@angular/aria': '22.0.5',
  '@angular/cdk': '22.0.5',
  '@rabassoft/schema-engine-angular': 'workspace:*',
});
const declaration = await readFile(
  new URL('../dist/index.d.ts', import.meta.url),
  'utf8',
);
assert.match(
  declaration,
  /export declare function provideSchemaEngineAngularAriaContainers\(\): EnvironmentProviders;/u,
);
for (const internalName of [
  'AngularAriaPresentationSectionComponent',
  'AngularAriaPresentationTabsComponent',
  'AngularAriaPresentationAccordionComponent',
  'AngularAriaPresentationGridComponent',
  'registrations',
]) {
  assert.equal(declaration.includes(`export { ${internalName}`), false);
}
const stylesUrl = new URL('../styles.css', import.meta.url);
await access(stylesUrl);
const styles = await readFile(stylesUrl, 'utf8');
assert.deepEqual(
  [...new Set(styles.match(/--se-aria-container-[a-z-]+/gu))].sort(),
  [
    '--se-aria-container-accent',
    '--se-aria-container-border',
    '--se-aria-container-gap',
    '--se-aria-container-radius',
    '--se-aria-container-surface',
    '--se-aria-container-text',
  ],
);
for (const declaration of [
  '--se-aria-container-surface: Canvas;',
  '--se-aria-container-text: CanvasText;',
  '--se-aria-container-border: currentColor;',
  '--se-aria-container-accent: LinkText;',
  '--se-aria-container-radius: 0.5rem;',
  '--se-aria-container-gap: 1rem;',
]) {
  assert.ok(
    styles.includes(declaration),
    `Missing CSS default: ${declaration}`,
  );
}
assert.doesNotMatch(styles, /(?:^|[\s,{])(?::root|html|body)(?:[\s,{]|$)/u);
assert.doesNotMatch(styles, /@import/u);
const javascript = await readFile(
  new URL('../dist/index.js', import.meta.url),
  'utf8',
);
assert.ok(javascript.includes("from '@angular/aria/tabs'"));
assert.equal(javascript.includes('styles.css'), false);
const source = await readFile(
  new URL('../src/index.ts', import.meta.url),
  'utf8',
);
for (const id of [
  'angular-aria-section',
  'angular-aria-tabs',
  'angular-aria-accordion',
  'angular-aria-grid',
]) {
  assert.ok(source.includes(`'${id}'`), `Missing pilot registration ${id}`);
}
assert.ok(source.includes("from '@angular/aria/tabs'"));
assert.equal(/from '@angular\/aria\/(?!tabs')/u.test(source), false);
assert.ok(source.includes('definition.kind === kind ? 10 : null'));
assert.ok(source.includes('priority: 0'));
