import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  ANGULAR_PREBUNDLE_EXCLUDES,
  verifyReferenceBoundaries,
} from './verify-reference-boundaries.mjs';

function write(root, path, contents) {
  const target = join(root, path);
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, contents);
}

function manifest(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'reference-boundaries-'));
  const publicManifest = {
    name: '@rabassoft/schema-engine',
    files: ['dist'],
  };
  write(
    root,
    'package.json',
    manifest({ private: true, devDependencies: { ajv: '8.20.0' } }),
  );
  write(root, 'packages/core/package.json', manifest(publicManifest));
  write(root, 'packages/core/src/index.ts', 'export const core = true;\n');
  write(
    root,
    'packages/angular/package.json',
    manifest({ ...publicManifest, name: '@rabassoft/schema-engine-angular' }),
  );
  write(
    root,
    'angular.json',
    manifest({
      projects: {
        'reference-angular': {
          architect: {
            serve: {
              options: {
                prebundle: { exclude: ANGULAR_PREBUNDLE_EXCLUDES },
              },
            },
          },
        },
      },
    }),
  );
  write(
    root,
    'packages/angular/src/index.ts',
    "import type { DataPath } from '@rabassoft/schema-engine';\nexport type Path = DataPath;\n",
  );
  write(
    root,
    'packages/validator-ajv/package.json',
    manifest({
      name: '@rabassoft/schema-engine-validator-ajv',
      private: true,
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
          default: './dist/index.js',
        },
      },
      dependencies: { ajv: '8.20.0' },
      devDependencies: { '@rabassoft/schema-engine': 'workspace:*' },
      peerDependencies: { '@rabassoft/schema-engine': 'workspace:^' },
    }),
  );
  write(
    root,
    'packages/validator-ajv/src/index.ts',
    "import type { SchemaValidator } from '@rabassoft/schema-engine';\nimport { Ajv2020 } from 'ajv/dist/2020.js';\nexport const validator: SchemaValidator | typeof Ajv2020 = Ajv2020;\n",
  );
  write(
    root,
    'apps/reference-scenarios/package.json',
    manifest({
      name: '@schema-engine-internal/reference-scenarios',
      private: true,
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
          default: './dist/index.js',
        },
      },
      devDependencies: { '@rabassoft/schema-engine': 'workspace:*' },
    }),
  );
  write(
    root,
    'apps/reference-scenarios/src/index.ts',
    "import type { DataPath } from '@rabassoft/schema-engine';\nexport type Path = DataPath;\n",
  );
  write(
    root,
    'apps/reference-scenarios/test/catalog.test.ts',
    "import '../src/index.js';\n",
  );
  write(
    root,
    'apps/reference-angular/package.json',
    manifest({
      name: '@schema-engine-internal/reference-angular',
      private: true,
      dependencies: {
        '@angular/common': '22.0.6',
        '@angular/core': '22.0.6',
        '@angular/forms': '22.0.6',
        '@angular/platform-browser': '22.0.6',
        '@codemirror/lang-html': '6.4.11',
        '@codemirror/lang-javascript': '6.2.5',
        '@codemirror/lang-json': '6.0.2',
        '@codemirror/language': '6.12.4',
        '@rabassoft/schema-engine': 'workspace:*',
        '@rabassoft/schema-engine-angular': 'workspace:*',
        '@rabassoft/schema-engine-validator-ajv': 'workspace:*',
        '@schema-engine-internal/reference-scenarios': 'workspace:*',
        '@lezer/highlight': '1.2.3',
        codemirror: '6.0.2',
        tslib: '^2.8.1',
      },
    }),
  );
  write(
    root,
    'apps/reference-angular/src/main.ts',
    "import '@angular/core/testing';\nimport '@codemirror/lang-html';\nimport '@codemirror/lang-javascript';\nimport '@codemirror/lang-json';\nimport '@codemirror/language';\nimport '@lezer/highlight';\nimport '@rabassoft/schema-engine-angular';\nimport '@rabassoft/schema-engine-validator-ajv';\nimport 'codemirror';\n",
  );
  write(
    root,
    'apps/reference-standard/package.json',
    manifest({
      name: '@schema-engine-internal/reference-standard',
      private: true,
      dependencies: {
        '@codemirror/lang-javascript': '6.2.5',
        '@codemirror/lang-json': '6.0.2',
        '@codemirror/language': '6.12.4',
        '@lezer/highlight': '1.2.3',
        '@rabassoft/schema-engine': 'workspace:*',
        '@rabassoft/schema-engine-validator-ajv': 'workspace:*',
        '@schema-engine-internal/reference-scenarios': 'workspace:*',
        codemirror: '6.0.2',
      },
    }),
  );
  write(
    root,
    'apps/reference-standard/src/main.ts',
    "import '@codemirror/lang-javascript';\nimport '@codemirror/lang-json';\nimport '@codemirror/language';\nimport '@lezer/highlight';\nimport '@rabassoft/schema-engine';\nimport '@rabassoft/schema-engine-validator-ajv';\nimport '@schema-engine-internal/reference-scenarios';\nimport 'codemirror';\n",
  );
  return root;
}

test('accepts the exact private reference dependency boundary', () => {
  const root = fixture();
  try {
    assert.deepEqual(verifyReferenceBoundaries(root), {
      inspectedImports: 22,
      inspectedManifestTargets: 5,
      privateProjects: 3,
      privateProductProjects: 1,
      publicProjects: 2,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a framework dependency in the Standard shell', () => {
  const root = fixture();
  try {
    write(
      root,
      'apps/reference-standard/src/main.ts',
      "import '@angular/core';\n",
    );
    assert.throws(
      () => verifyReferenceBoundaries(root),
      /Standard shell imports framework dependency/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects exports from the Standard shell', () => {
  const root = fixture();
  try {
    const path = 'apps/reference-standard/package.json';
    const value = JSON.parse(readFixture(root, path));
    write(
      root,
      path,
      manifest({ ...value, exports: { '.': './src/main.ts' } }),
    );
    assert.throws(
      () => verifyReferenceBoundaries(root),
      /exports are forbidden/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects an unapproved private editor dependency', () => {
  const root = fixture();
  try {
    const path = 'apps/reference-angular/package.json';
    const value = JSON.parse(readFixture(root, path));
    write(
      root,
      path,
      manifest({
        ...value,
        dependencies: {
          ...value.dependencies,
          '@codemirror/state': '6.7.1',
        },
      }),
    );
    assert.throws(() => verifyReferenceBoundaries(root), assert.AssertionError);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects an undeclared CodeMirror transitive in the Standard shell', () => {
  const root = fixture();
  try {
    const path = 'apps/reference-standard/package.json';
    const value = JSON.parse(readFixture(root, path));
    write(
      root,
      path,
      manifest({
        ...value,
        dependencies: {
          ...value.dependencies,
          '@codemirror/state': '6.7.1',
        },
      }),
    );
    assert.throws(() => verifyReferenceBoundaries(root), assert.AssertionError);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects an incomplete private editor prebundle graph', () => {
  const root = fixture();
  try {
    const path = 'angular.json';
    const value = JSON.parse(readFixture(root, path));
    value.projects[
      'reference-angular'
    ].architect.serve.options.prebundle.exclude =
      ANGULAR_PREBUNDLE_EXCLUDES.filter(
        (dependency) => dependency !== '@codemirror/state',
      );
    write(root, path, manifest(value));
    assert.throws(
      () => verifyReferenceBoundaries(root),
      /prebundle exclusions/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a publishable reference project', () => {
  const root = fixture();
  try {
    const path = 'apps/reference-angular/package.json';
    const value = JSON.parse(readFixture(root, path));
    write(root, path, manifest({ ...value, private: false }));
    assert.throws(() => verifyReferenceBoundaries(root), /must be private/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a publishable-package deep import', () => {
  const root = fixture();
  try {
    write(
      root,
      'apps/reference-angular/src/main.ts',
      "import '@rabassoft/schema-engine/src/index.js';\n",
    );
    assert.throws(() => verifyReferenceBoundaries(root), /deep\/test import/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a relative import that escapes a private workspace', () => {
  const root = fixture();
  try {
    write(
      root,
      'apps/reference-angular/src/main.ts',
      "import '../../reference-scenarios/src/index.js';\n",
    );
    assert.throws(
      () => verifyReferenceBoundaries(root),
      /physical cross-project import/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a public dependency on a private reference project', () => {
  const root = fixture();
  try {
    const path = 'packages/angular/package.json';
    const value = JSON.parse(readFixture(root, path));
    write(
      root,
      path,
      manifest({
        ...value,
        dependencies: {
          '@schema-engine-internal/reference-scenarios': 'workspace:*',
        },
      }),
    );
    assert.throws(
      () => verifyReferenceBoundaries(root),
      /depends on a private app/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects generated, browser or app paths in public package targets', () => {
  const root = fixture();
  try {
    const path = 'packages/core/package.json';
    const value = JSON.parse(readFixture(root, path));
    write(
      root,
      path,
      manifest({ ...value, files: ['dist', 'apps/reference-angular'] }),
    );
    assert.throws(
      () => verifyReferenceBoundaries(root),
      /exposes generated\/browser\/app path/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a private browser or generated export target', () => {
  const root = fixture();
  try {
    const path = 'apps/reference-scenarios/package.json';
    const value = JSON.parse(readFixture(root, path));
    write(
      root,
      path,
      manifest({
        ...value,
        exports: {
          '.': value.exports['.'],
          './generated': './generated/reference-snippets.js',
        },
      }),
    );
    assert.throws(
      () => verifyReferenceBoundaries(root),
      /exposes generated\/browser\/app path/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

function readFixture(root, path) {
  return readFileSync(join(root, path), 'utf8');
}
