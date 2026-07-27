import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export function assertCandidateFile(evidence, role, file) {
  const candidate = evidence.candidates.find((entry) => entry.role === role);
  assert.ok(candidate, `Missing candidate evidence for ${role}`);
  const bytes = readFileSync(file);
  assert.equal(bytes.length, candidate.bytes, `${role} byte length changed`);
  assert.equal(
    createHash('sha512').update(bytes).digest('hex'),
    candidate.sha512,
    `${role} SHA-512 changed`,
  );
  assert.equal(
    `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    candidate.integrity,
    `${role} integrity changed`,
  );
  return candidate;
}

export function assertJsonNoDrift(before, after) {
  assert.deepEqual(after, before, 'Observed JSON state drifted');
  return after;
}
