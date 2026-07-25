import assert from 'node:assert/strict';
import test from 'node:test';
import {
  argumentValue,
  assertCoordinatedReleaseVersion,
  assertM19CandidateEvidence,
  assertM19ReleaseDescriptor,
  assertM21ReleaseDescriptor,
  assertReleaseCandidateEvidence,
  highestCommonAngular22Version,
  loadCoordinatedReleaseTarget,
  m19FrozenConsumerTuple,
  m19PackageSpecifier,
  M19_RELEASE_DESCRIPTOR,
  M21_RELEASE_DESCRIPTOR,
  releaseFrozenConsumerTuple,
  releasePackageSpecifier,
} from './release-target.mjs';

function mutableDescriptor(descriptor = M19_RELEASE_DESCRIPTOR) {
  return JSON.parse(JSON.stringify(descriptor));
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

test('accepts the exact M21 publication and latest orders', () => {
  const descriptor = mutableDescriptor(M21_RELEASE_DESCRIPTOR);
  assert.equal(assertM21ReleaseDescriptor(descriptor), descriptor);
  assert.deepEqual(
    descriptor.packages.map(({ role, version }) => ({ role, version })),
    [
      { role: 'core', version: '0.4.0' },
      { role: 'angular', version: '0.4.0' },
      { role: 'angularAria', version: '0.2.0' },
    ],
  );
  assert.deepEqual(descriptor.latestOrder, ['angularAria', 'angular', 'core']);
  const target = loadCoordinatedReleaseTarget(['--release=m21']);
  assert.equal(target.descriptor, M21_RELEASE_DESCRIPTOR);
  const manifests = copy(target.manifests);
  manifests.angularAria.peerDependencies['@rabassoft/schema-engine'] =
    'workspace:^';
  assert.throws(() =>
    assertM21ReleaseDescriptor(M21_RELEASE_DESCRIPTOR, manifests),
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
    'wrong pilot version',
    (value) => {
      value.packages[2].version = '0.1.0';
    },
  ],
  [
    'wrong packed peer',
    (value) => {
      value.packages[2].schemaEnginePeers['@rabassoft/schema-engine-angular'] =
        '^0.3.0';
    },
  ],
  [
    'wrong publication order',
    (value) => {
      value.packages.reverse();
    },
  ],
  [
    'wrong latest order',
    (value) => {
      value.latestOrder.reverse();
    },
  ],
]) {
  test(`rejects M21 ${label}`, () => {
    const descriptor = mutableDescriptor(M21_RELEASE_DESCRIPTOR);
    mutate(descriptor);
    assert.throws(() => assertM21ReleaseDescriptor(descriptor));
  });
}

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

test('accepts only candidate evidence ordered by the M21 descriptor', () => {
  const evidence = {
    release: 'm21',
    releaseDirectory: '0.4.0',
    node: '22.23.1',
    npm: '10.9.8',
    pnpm: '10.28.2',
    baseCommit: 'b'.repeat(40),
    sourceCommit: null,
    distTag: 'next',
    provenance: false,
    neutralDryRun: true,
    candidates: M21_RELEASE_DESCRIPTOR.packages.map(
      ({ role, name, version, file }) => ({
        role,
        name,
        version,
        file,
        bytes: 1,
        sha512: 'b'.repeat(128),
        integrity: 'sha512-Yg==',
      }),
    ),
  };
  assert.equal(
    assertReleaseCandidateEvidence(evidence, M21_RELEASE_DESCRIPTOR),
    evidence,
  );
  evidence.candidates.reverse();
  assert.throws(() =>
    assertReleaseCandidateEvidence(evidence, M21_RELEASE_DESCRIPTOR),
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

test('selects the highest coherent Angular patch during staggered publication', () => {
  const manifests = {
    core: { versions: { '22.0.7': {}, '22.0.8': {} } },
    build: { versions: { '22.0.7': {} } },
    forms: {
      versions: {
        '22.0.7': {},
        '22.0.8': { deprecated: 'withdrawn fixture' },
      },
    },
  };
  assert.equal(highestCommonAngular22Version(manifests, '22.0.6'), '22.0.7');
  assert.throws(() => highestCommonAngular22Version(manifests, '22.0.8'));
});

test('defines M21 specifiers and frozen tuples independently from M19', () => {
  assert.equal(
    releasePackageSpecifier(M21_RELEASE_DESCRIPTOR, 'angularAria', 'exact'),
    '0.2.0',
  );
  assert.equal(
    releasePackageSpecifier(M21_RELEASE_DESCRIPTOR, 'angular', 'next'),
    'next',
  );
  assert.deepEqual(
    releaseFrozenConsumerTuple(M21_RELEASE_DESCRIPTOR, 'latest', 'frozen'),
    { angular: '22.0.7', aria: '22.0.5', cdk: '22.0.5' },
  );
});
