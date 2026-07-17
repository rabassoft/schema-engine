import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  extractReferenceSnippets,
  renderReferenceSnippets,
  runReferenceSnippetExtraction,
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
