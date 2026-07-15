import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { workspaceRoot } from './release-candidate-utils.mjs';

const VERSION_PATTERN = /^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;

export function argumentValue(args, name) {
  return args
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
}

export function assertCoordinatedReleaseVersion(expected, core, angular) {
  assert.match(
    expected ?? '',
    VERSION_PATTERN,
    'Invalid expected release version',
  );
  assert.equal(
    core,
    expected,
    `Core version ${core} does not match ${expected}`,
  );
  assert.equal(
    angular,
    expected,
    `Angular version ${angular} does not match ${expected}`,
  );
  return Object.freeze({
    version: expected,
    corePeer: `^${expected}`,
    coreDevelopment: expected,
  });
}

export function loadReleaseTarget(args = process.argv.slice(2)) {
  const expected = argumentValue(args, 'release-version');
  assert.ok(expected, 'Missing --release-version=<0.y.z>');
  const core = JSON.parse(
    readFileSync(join(workspaceRoot, 'packages/core/package.json'), 'utf8'),
  );
  const angular = JSON.parse(
    readFileSync(join(workspaceRoot, 'packages/angular/package.json'), 'utf8'),
  );
  return Object.freeze({
    ...assertCoordinatedReleaseVersion(expected, core.version, angular.version),
    coreManifest: core,
    angularManifest: angular,
  });
}
