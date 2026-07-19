import assert from 'node:assert/strict';
import test from 'node:test';
import {
  argumentValue,
  assertCoordinatedReleaseVersion,
  assertM19CandidateEvidence,
  assertM19ReleaseDescriptor,
  m19FrozenConsumerTuple,
  m19PackageSpecifier,
  M19_RELEASE_DESCRIPTOR,
} from './release-target.mjs';

function mutableDescriptor() {
  return JSON.parse(JSON.stringify(M19_RELEASE_DESCRIPTOR));
}

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

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

test('accepts the exact unequal-version M19 publication order', () => {
  const descriptor = mutableDescriptor();
  assert.equal(assertM19ReleaseDescriptor(descriptor), descriptor);
  assert.deepEqual(
    M19_RELEASE_DESCRIPTOR.packages.map(({ role, version }) => ({
      role,
      version,
    })),
    [
      { role: 'core', version: '0.3.0' },
      { role: 'angular', version: '0.3.0' },
      { role: 'angularAria', version: '0.1.0' },
    ],
  );
});

for (const [label, mutate] of [
  ['missing pilot', (value) => value.packages.pop()],
  [
    'duplicate package',
    (value) => {
      value.packages[2] = copy(value.packages[1]);
    },
  ],
  [
    'unexpected fourth package',
    (value) => value.packages.push(copy(value.packages[0])),
  ],
  [
    'wrong independent version',
    (value) => {
      value.packages[2].version = '0.3.0';
    },
  ],
  [
    'wrong packed peer',
    (value) => {
      value.packages[2].schemaEnginePeers['@rabassoft/schema-engine-angular'] =
        '^0.2.0';
    },
  ],
  [
    'wrong artifact filename',
    (value) => {
      value.packages[2].file = 'unexpected.tgz';
    },
  ],
  ['wrong publication order', (value) => value.packages.reverse()],
]) {
  test(`rejects ${label}`, () => {
    const descriptor = mutableDescriptor();
    mutate(descriptor);
    assert.throws(() => assertM19ReleaseDescriptor(descriptor));
  });
}

test('accepts only candidate evidence ordered by the M19 descriptor', () => {
  const evidence = {
    release: 'm19',
    releaseDirectory: '0.3.0',
    node: '22.23.1',
    npm: '10.9.8',
    pnpm: '10.28.2',
    baseCommit: 'a'.repeat(40),
    sourceCommit: null,
    distTag: 'next',
    provenance: false,
    neutralDryRun: true,
    candidates: M19_RELEASE_DESCRIPTOR.packages.map(
      ({ role, name, version, file }) => ({
        role,
        name,
        version,
        file,
        bytes: 1,
        sha512: 'a'.repeat(128),
        integrity: 'sha512-YQ==',
      }),
    ),
  };
  assert.equal(
    assertM19CandidateEvidence(evidence, M19_RELEASE_DESCRIPTOR),
    evidence,
  );
  evidence.candidates.reverse();
  assert.throws(() =>
    assertM19CandidateEvidence(evidence, M19_RELEASE_DESCRIPTOR),
  );
});

test('defines isolated candidate, exact, next, latest and unqualified specifiers', () => {
  const candidates = {
    core: '/tmp/core.tgz',
    angular: '/tmp/angular.tgz',
    angularAria: '/tmp/pilot.tgz',
  };
  assert.equal(
    m19PackageSpecifier(
      M19_RELEASE_DESCRIPTOR,
      'angularAria',
      'candidate',
      candidates,
    ),
    'file:/tmp/pilot.tgz',
  );
  assert.equal(
    m19PackageSpecifier(M19_RELEASE_DESCRIPTOR, 'angularAria', 'exact'),
    '0.1.0',
  );
  assert.equal(
    m19PackageSpecifier(M19_RELEASE_DESCRIPTOR, 'core', 'next'),
    'next',
  );
  assert.equal(
    m19PackageSpecifier(M19_RELEASE_DESCRIPTOR, 'angular', 'latest'),
    'latest',
  );
  assert.equal(
    m19PackageSpecifier(M19_RELEASE_DESCRIPTOR, 'core', 'unqualified'),
    '*',
  );
  assert.throws(() =>
    m19PackageSpecifier(M19_RELEASE_DESCRIPTOR, 'core', 'candidate'),
  );
  assert.throws(() =>
    m19PackageSpecifier(M19_RELEASE_DESCRIPTOR, 'unknown', 'exact'),
  );
  assert.throws(() =>
    m19PackageSpecifier(M19_RELEASE_DESCRIPTOR, 'core', 'mixed'),
  );
});

test('separates frozen checkpoint tuples from registry-backed live resolution', () => {
  assert.deepEqual(
    m19FrozenConsumerTuple(M19_RELEASE_DESCRIPTOR, 'lower', 'frozen'),
    { angular: '22.0.6', aria: '22.0.5', cdk: '22.0.5' },
  );
  assert.deepEqual(
    m19FrozenConsumerTuple(M19_RELEASE_DESCRIPTOR, 'latest', 'frozen'),
    { angular: '22.0.7', aria: '22.0.5', cdk: '22.0.5' },
  );
  assert.equal(
    m19FrozenConsumerTuple(M19_RELEASE_DESCRIPTOR, 'latest', 'registry'),
    undefined,
  );
  assert.throws(() =>
    m19FrozenConsumerTuple(M19_RELEASE_DESCRIPTOR, 'lower', 'registry'),
  );
  assert.throws(() =>
    m19FrozenConsumerTuple(M19_RELEASE_DESCRIPTOR, 'latest', undefined),
  );
});
