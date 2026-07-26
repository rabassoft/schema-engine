import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  argumentValue,
  assertReleaseCandidateEvidence,
  RELEASE_DESCRIPTORS,
} from './release-target.mjs';
import { assertCandidateFile, assertJsonNoDrift } from './release-evidence.mjs';

const args = process.argv.slice(2);
const mode = argumentValue(args, 'mode');

function readJson(argument) {
  assert.ok(argument, 'Missing JSON file argument');
  return JSON.parse(readFileSync(argument, 'utf8'));
}

if (mode === 'tarball') {
  const release = argumentValue(args, 'release');
  const descriptor = RELEASE_DESCRIPTORS[release];
  assert.ok(descriptor, 'Unknown --release');
  const evidence = readJson(argumentValue(args, 'evidence'));
  assertReleaseCandidateEvidence(evidence, descriptor);
  assertCandidateFile(
    evidence,
    argumentValue(args, 'role'),
    argumentValue(args, 'file'),
  );
  console.log('Downloaded tarball matches selected candidate evidence.');
} else if (mode === 'no-drift') {
  const before = readJson(argumentValue(args, 'before'));
  const after = readJson(argumentValue(args, 'after'));
  assertJsonNoDrift(before, after);
  console.log('Observed JSON state has no drift.');
} else {
  assert.fail('Pass exactly --mode=tarball or --mode=no-drift');
}
