import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceBuildDirectory = dirname(fileURLToPath(import.meta.url));
const pilotPackage = resolve(sourceBuildDirectory, '..');
const packageRoots = Object.freeze([
  {
    directory: resolve(sourceBuildDirectory, '../../../core/package'),
    name: '@rabassoft/schema-engine',
  },
  {
    directory: resolve(sourceBuildDirectory, '../../../angular/package'),
    name: '@rabassoft/schema-engine-angular',
  },
]);

for (const { directory, name } of packageRoots) {
  const manifest = JSON.parse(
    readFileSync(join(directory, 'package.json'), 'utf8'),
  );
  if (manifest.name !== name)
    throw new Error(`Unexpected sibling package: ${name}`);
  const target = join(pilotPackage, 'node_modules', ...name.split('/'));
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(join(directory, 'rebuilt-dist'), join(target, 'dist'), {
    recursive: true,
  });
  writeFileSync(
    join(target, 'package.json'),
    `${JSON.stringify(
      {
        name: manifest.name,
        version: manifest.version,
        type: manifest.type,
        exports: manifest.exports,
      },
      null,
      2,
    )}\n`,
  );
}
