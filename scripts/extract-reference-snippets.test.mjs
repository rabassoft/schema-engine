import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  EXPECTED_STANDARD_REFERENCE_SNIPPETS,
  extractReferenceSnippets,
  renderReferenceSnippets,
  runReferenceSnippetExtraction,
  runReferenceSnippetTargets,
} from './extract-reference-snippets.mjs';

const validSource = `
// reference-snippet:start application-signals
  const value = signal({});
// reference-snippet:end application-signals
// reference-snippet:start operation-decisions
  function decide() {}
// reference-snippet:end operation-decisions
<!-- reference-snippet:start controlled-form-template -->
  <form [schemaForm]="config"></form>
<!-- reference-snippet:end controlled-form-template -->
`;

const validStandardSource = EXPECTED_STANDARD_REFERENCE_SNIPPETS.map(
  (id) =>
    `// reference-snippet:start ${id}\nconst ${id.replaceAll('-', '_')} = true;\n// reference-snippet:end ${id}`,
).join('\n');

test('extracts exact non-nested TypeScript and template regions', () => {
  const snippets = extractReferenceSnippets(
    validSource.replaceAll('\n', '\r\n'),
  );
  assert.deepEqual(snippets, {
    'application-signals': 'const value = signal({});',
    'operation-decisions': 'function decide() {}',
    'controlled-form-template': '<form [schemaForm]="config"></form>',
  });
  assert.equal(renderReferenceSnippets(snippets).includes('\r'), false);
});

test('rejects duplicate, missing, empty, nested and unclosed markers', () => {
  assert.throws(
    () =>
      extractReferenceSnippets(
        `${validSource}\n// reference-snippet:start application-signals\nagain\n// reference-snippet:end application-signals\n`,
      ),
    /Duplicate snippet marker/u,
  );
  assert.throws(
    () =>
      extractReferenceSnippets(
        validSource.replace(
          /<!-- reference-snippet:start controlled-form-template -->[\s\S]*<!-- reference-snippet:end controlled-form-template -->/u,
          '',
        ),
      ),
    /Missing snippet marker/u,
  );
  assert.throws(
    () =>
      extractReferenceSnippets(
        validSource.replace('  function decide() {}', '  '),
      ),
    /Empty snippet/u,
  );
  assert.throws(
    () =>
      extractReferenceSnippets(
        validSource.replace(
          '  const value = signal({});',
          '  // reference-snippet:start operation-decisions',
        ),
      ),
    /Nested snippet marker/u,
  );
  assert.throws(
    () =>
      extractReferenceSnippets(
        validSource.replace(
          '<!-- reference-snippet:end controlled-form-template -->',
          '',
        ),
      ),
    /Unclosed snippet marker/u,
  );
});

test('write mode is deterministic and check mode rejects stale output', () => {
  const root = mkdtempSync(join(tmpdir(), 'reference-snippets-'));
  try {
    const sourcePath = 'source.ts';
    const outputPath = 'generated/snippets.ts';
    writeFileSync(join(root, sourcePath), validSource);
    const sourceBefore = readFileSync(join(root, sourcePath), 'utf8');
    runReferenceSnippetExtraction({
      mode: 'write',
      sourcePath,
      outputPath,
      root,
    });
    assert.equal(readFileSync(join(root, sourcePath), 'utf8'), sourceBefore);
    const first = readFileSync(join(root, outputPath), 'utf8');
    runReferenceSnippetExtraction({
      mode: 'write',
      sourcePath,
      outputPath,
      root,
    });
    assert.equal(readFileSync(join(root, outputPath), 'utf8'), first);
    runReferenceSnippetExtraction({
      mode: 'check',
      sourcePath,
      outputPath,
      root,
    });
    writeFileSync(
      join(root, sourcePath),
      validSource.replace('function decide() {}', 'function decideAgain() {}'),
    );
    assert.throws(
      () =>
        runReferenceSnippetExtraction({
          mode: 'check',
          sourcePath,
          outputPath,
          root,
        }),
      /Stale generated snippets/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('enforces the exact Standard marker inventory and all marker failures', () => {
  const snippets = extractReferenceSnippets(
    validStandardSource,
    EXPECTED_STANDARD_REFERENCE_SNIPPETS,
  );
  assert.deepEqual(Object.keys(snippets), EXPECTED_STANDARD_REFERENCE_SNIPPETS);
  assert.throws(
    () =>
      extractReferenceSnippets(
        `${validStandardSource}\n// reference-snippet:start standard-compile-definition\nagain\n// reference-snippet:end standard-compile-definition`,
        EXPECTED_STANDARD_REFERENCE_SNIPPETS,
      ),
    /Duplicate snippet marker/u,
  );
  assert.throws(
    () =>
      extractReferenceSnippets(
        validStandardSource.replace(
          /\/\/ reference-snippet:start standard-runtime-cleanup[\s\S]*$/u,
          '',
        ),
        EXPECTED_STANDARD_REFERENCE_SNIPPETS,
      ),
    /Missing snippet marker/u,
  );
  assert.throws(
    () =>
      extractReferenceSnippets(
        validStandardSource.replace(
          'const standard_create_runtime = true;',
          ' ',
        ),
        EXPECTED_STANDARD_REFERENCE_SNIPPETS,
      ),
    /Empty snippet/u,
  );
  assert.throws(
    () =>
      extractReferenceSnippets(
        validStandardSource.replace(
          'const standard_runtime_subscriptions = true;',
          '// reference-snippet:start standard-runtime-cleanup',
        ),
        EXPECTED_STANDARD_REFERENCE_SNIPPETS,
      ),
    /Nested snippet marker/u,
  );
  assert.throws(
    () =>
      extractReferenceSnippets(
        validStandardSource.replace(
          '// reference-snippet:end standard-controlled-operation',
          '',
        ),
        EXPECTED_STANDARD_REFERENCE_SNIPPETS,
      ),
    /Nested snippet marker|Mismatched snippet end|Unclosed snippet marker/u,
  );
});

test('writes and checks multiple targets without changing either source', () => {
  const root = mkdtempSync(join(tmpdir(), 'reference-snippet-targets-'));
  try {
    writeFileSync(join(root, 'angular.ts'), validSource);
    writeFileSync(join(root, 'standard.ts'), validStandardSource);
    const targets = [
      {
        id: 'angular',
        sourcePath: 'angular.ts',
        outputPath: 'generated/angular.ts',
        expectedIds: [
          'application-signals',
          'operation-decisions',
          'controlled-form-template',
        ],
      },
      {
        id: 'standard',
        sourcePath: 'standard.ts',
        outputPath: 'generated/standard.ts',
        expectedIds: EXPECTED_STANDARD_REFERENCE_SNIPPETS,
      },
    ];
    const angularBefore = readFileSync(join(root, 'angular.ts'), 'utf8');
    const standardBefore = readFileSync(join(root, 'standard.ts'), 'utf8');
    const write = runReferenceSnippetTargets({ mode: 'write', root, targets });
    assert.deepEqual(write, { changed: true, snippets: 8, targets: 2 });
    assert.equal(readFileSync(join(root, 'angular.ts'), 'utf8'), angularBefore);
    assert.equal(
      readFileSync(join(root, 'standard.ts'), 'utf8'),
      standardBefore,
    );
    runReferenceSnippetTargets({ mode: 'check', root, targets });
    writeFileSync(
      join(root, 'standard.ts'),
      validStandardSource.replace(' = true;', ' = false;'),
    );
    assert.throws(
      () => runReferenceSnippetTargets({ mode: 'check', root, targets }),
      /Stale generated snippets/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
