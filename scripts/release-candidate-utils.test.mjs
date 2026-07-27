import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { gzipSync as nodeGzipSync } from 'node:zlib';
import { gunzipSync } from 'fflate';
import { normalizeTarballGzip } from './release-candidate-utils.mjs';

function gzipVariant(payload, options, osByte) {
  const gzip = nodeGzipSync(payload, options);
  gzip[9] = osByte;
  return gzip;
}

test('normalizes platform-specific gzip variants to identical bytes', () => {
  const directory = mkdtempSync(join(tmpdir(), 'schema-engine-gzip-'));
  const first = join(directory, 'first.tgz');
  const second = join(directory, 'second.tgz');
  const payload = Buffer.from(
    Array.from(
      { length: 8_192 },
      (_, index) => `package/member-${index % 97}:${index}\n`,
    ).join(''),
  );

  try {
    writeFileSync(first, gzipVariant(payload, { level: 1, mtime: 0 }, 0x13));
    writeFileSync(second, gzipVariant(payload, { level: 9, mtime: 0 }, 0x03));

    normalizeTarballGzip(first);
    normalizeTarballGzip(second);

    const firstNormalized = readFileSync(first);
    const secondNormalized = readFileSync(second);
    assert.deepEqual(firstNormalized, secondNormalized);
    assert.deepEqual([...firstNormalized.subarray(4, 8)], [0, 0, 0, 0]);
    assert.equal(firstNormalized[9], 0x03);
    assert.deepEqual(Buffer.from(gunzipSync(firstNormalized)), payload);

    normalizeTarballGzip(first);
    assert.deepEqual(readFileSync(first), firstNormalized);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
