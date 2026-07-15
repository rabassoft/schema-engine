import assert from 'node:assert/strict';
import test from 'node:test';
import {
  argumentValue,
  assertCoordinatedReleaseVersion,
} from './release-target.mjs';

test('reads one explicit expected version argument', () => {
  assert.equal(
    argumentValue(['--release-version=0.2.0'], 'release-version'),
    '0.2.0',
  );
  assert.equal(argumentValue([], 'release-version'), undefined);
});

test('accepts only an exact coordinated 0.y.z target', () => {
  assert.deepEqual(assertCoordinatedReleaseVersion('0.2.0', '0.2.0', '0.2.0'), {
    version: '0.2.0',
    corePeer: '^0.2.0',
    coreDevelopment: '0.2.0',
  });
  assert.throws(() =>
    assertCoordinatedReleaseVersion('0.2.0', '0.1.0', '0.2.0'),
  );
  assert.throws(() =>
    assertCoordinatedReleaseVersion('0.2.0', '0.2.0', '0.1.0'),
  );
  assert.throws(() =>
    assertCoordinatedReleaseVersion('1.0.0', '1.0.0', '1.0.0'),
  );
});
