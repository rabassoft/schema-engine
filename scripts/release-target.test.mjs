import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { assertCandidateFile, assertJsonNoDrift } from './release-evidence.mjs';
import {
  argumentValue,
  assertCoordinatedReleaseVersion,
  assertM19CandidateEvidence,
  assertM19ReleaseDescriptor,
  assertM21ReleaseDescriptor,
  assertM23ReleaseDescriptor,
  assertReleaseCandidateEvidence,
  highestCommonAngular22Version,
  loadCoordinatedReleaseTarget,
  loadReleaseDescriptor,
  m23ReadOnlyEvidenceCommands,
  m23StagePublishArgs,
  m19FrozenConsumerTuple,
  m19PackageSpecifier,
  M19_RELEASE_DESCRIPTOR,
  M21_RELEASE_DESCRIPTOR,
  M23_RELEASE_DESCRIPTOR,
  releaseFrozenConsumerTuple,
  releaseCandidateDryRunArgs,
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
  assert.equal(
    loadReleaseDescriptor(['--release=m21']),
    M21_RELEASE_DESCRIPTOR,
  );
});

test('accepts the exact M23 stage, approval and latest orders', () => {
  const descriptor = mutableDescriptor(M23_RELEASE_DESCRIPTOR);
  assert.equal(assertM23ReleaseDescriptor(descriptor), descriptor);
  assert.deepEqual(
    descriptor.packages.map(({ role, version }) => ({ role, version })),
    [
      { role: 'core', version: '0.4.1' },
      { role: 'angular', version: '0.4.1' },
      { role: 'angularAria', version: '0.2.1' },
    ],
  );
  assert.deepEqual(descriptor.stageOrder, ['core', 'angular', 'angularAria']);
  assert.deepEqual(descriptor.approvalOrder, [
    'core',
    'angular',
    'angularAria',
  ]);
  assert.deepEqual(descriptor.latestOrder, ['angularAria', 'angular', 'core']);
  assert.deepEqual(descriptor.trustedPublishing.allowedActions, [
    'stage-publish',
  ]);
  assert.equal('sourceCommit' in descriptor.trustedPublishing, false);
});

test('accepts current package manifests only for the active M23 source line', () => {
  assert.equal(
    loadCoordinatedReleaseTarget(['--release=m23']).descriptor,
    M23_RELEASE_DESCRIPTOR,
  );
  assert.throws(() => loadCoordinatedReleaseTarget(['--release=m21']));
});

function m23ManifestFixtures() {
  return Object.fromEntries(
    M23_RELEASE_DESCRIPTOR.packages.map((packageTarget) => [
      packageTarget.role,
      {
        name: packageTarget.name,
        version: packageTarget.version,
        publishConfig: { access: 'public', tag: 'next' },
        repository: {
          type: 'git',
          url: 'git+https://github.com/rabassoft/schema-engine.git',
          directory: packageTarget.workspacePath,
        },
        ...(Object.keys(packageTarget.runtimeDependencies).length === 0
          ? {}
          : { dependencies: packageTarget.runtimeDependencies }),
        peerDependencies: {
          ...packageTarget.frameworkPeers,
          ...packageTarget.schemaEngineSourcePeers,
        },
        devDependencies: {
          ...packageTarget.frameworkDevelopment,
          ...Object.fromEntries(
            Object.keys(packageTarget.schemaEngineDevelopment).map((name) => [
              name,
              'workspace:*',
            ]),
          ),
        },
        exports: copy(packageTarget.exports),
        sideEffects: copy(packageTarget.sideEffects),
      },
    ]),
  );
}

test('accepts only exact future M23 manifests without contract drift', () => {
  const manifests = m23ManifestFixtures();
  assert.equal(
    assertM23ReleaseDescriptor(M23_RELEASE_DESCRIPTOR, manifests),
    M23_RELEASE_DESCRIPTOR,
  );
  manifests.angular.peerDependencies['@angular/core'] = '>=22';
  assert.throws(() =>
    assertM23ReleaseDescriptor(M23_RELEASE_DESCRIPTOR, manifests),
  );
  const dependencies = m23ManifestFixtures();
  dependencies.core.dependencies = { telemetry: '1.0.0' };
  assert.throws(() =>
    assertM23ReleaseDescriptor(M23_RELEASE_DESCRIPTOR, dependencies),
  );
  const exports = m23ManifestFixtures();
  delete exports.angularAria.exports['./styles.css'];
  assert.throws(() =>
    assertM23ReleaseDescriptor(M23_RELEASE_DESCRIPTOR, exports),
  );
});

test('defines exact mutation-free dry-run and read-only M23 evidence commands', () => {
  const core = M23_RELEASE_DESCRIPTOR.packages[0];
  assert.deepEqual(
    releaseCandidateDryRunArgs(M23_RELEASE_DESCRIPTOR, core.file),
    [
      'stage',
      'publish',
      core.file,
      '--dry-run',
      '--access',
      'public',
      '--tag',
      'next',
    ],
  );
  assert.deepEqual(m23StagePublishArgs(M23_RELEASE_DESCRIPTOR, core), [
    'stage',
    'publish',
    '.release/0.4.1/rabassoft-schema-engine-0.4.1.tgz',
    '--access',
    'public',
    '--tag',
    'next',
  ]);
  assert.deepEqual(
    m23ReadOnlyEvidenceCommands(
      M23_RELEASE_DESCRIPTOR,
      core,
      'stage_fixture_1',
    ),
    {
      stageList: ['npm', 'stage', 'list', '@rabassoft/schema-engine', '--json'],
      stageView: ['npm', 'stage', 'view', 'stage_fixture_1', '--json'],
      stageDownload: ['npm', 'stage', 'download', 'stage_fixture_1'],
      registryMetadata: [
        'npm',
        'view',
        '@rabassoft/schema-engine@0.4.1',
        '--json',
      ],
      provenance: ['npm', 'audit', 'signatures'],
    },
  );
  assert.throws(() =>
    m23ReadOnlyEvidenceCommands(M23_RELEASE_DESCRIPTOR, core, '../unsafe'),
  );
});

for (const [label, mutate] of [
  [
    'narrowed packed peer',
    (value) => {
      value.packages[1].schemaEnginePeers['@rabassoft/schema-engine'] =
        '^0.4.1';
    },
  ],
  [
    'bare source peer',
    (value) => {
      value.packages[1].schemaEngineSourcePeers['@rabassoft/schema-engine'] =
        'workspace:^';
    },
  ],
  [
    'direct publish permission',
    (value) => {
      value.trustedPublishing.allowedActions.push('publish');
    },
  ],
  [
    'wrong repository directory',
    (value) => {
      value.packages[2].workspacePath = 'packages/angular';
    },
  ],
  [
    'unexpected package',
    (value) => {
      value.packages.push(copy(value.packages[0]));
    },
  ],
  [
    'wrong stage order',
    (value) => {
      value.stageOrder.reverse();
    },
  ],
  [
    'widened framework peer',
    (value) => {
      value.packages[1].frameworkPeers['@angular/core'] = '>=22';
    },
  ],
  [
    'extra runtime dependency',
    (value) => {
      value.packages[0].runtimeDependencies.telemetry = '1.0.0';
    },
  ],
  [
    'changed pilot export',
    (value) => {
      delete value.packages[2].exports['./styles.css'];
    },
  ],
]) {
  test(`rejects M23 ${label}`, () => {
    const descriptor = mutableDescriptor(M23_RELEASE_DESCRIPTOR);
    mutate(descriptor);
    assert.throws(() => assertM23ReleaseDescriptor(descriptor));
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

test('accepts M23 candidate evidence only with the pinned npm tool', () => {
  const evidence = {
    release: 'm23',
    releaseDirectory: '0.4.1',
    node: '22.23.1',
    npm: '11.18.0',
    pnpm: '10.28.2',
    baseCommit: 'c'.repeat(40),
    sourceCommit: null,
    distTag: 'next',
    provenance: true,
    neutralDryRun: true,
    candidates: M23_RELEASE_DESCRIPTOR.packages.map(
      ({ role, name, version, file }) => ({
        role,
        name,
        version,
        file,
        bytes: 1,
        sha512: 'c'.repeat(128),
        integrity: 'sha512-Yw==',
      }),
    ),
  };
  assert.equal(
    assertReleaseCandidateEvidence(evidence, M23_RELEASE_DESCRIPTOR),
    evidence,
  );
  evidence.npm = '11.17.0';
  assert.throws(() =>
    assertReleaseCandidateEvidence(evidence, M23_RELEASE_DESCRIPTOR),
  );
});

test('compares downloaded bytes and JSON snapshots without credentials or mutation', () => {
  const directory = mkdtempSync(join(tmpdir(), 'schema-engine-evidence-'));
  const file = join(directory, 'candidate.tgz');
  const bytes = Buffer.from('fixture');
  writeFileSync(file, bytes);
  const evidence = {
    candidates: [
      {
        role: 'core',
        bytes: bytes.length,
        sha512: createHash('sha512').update(bytes).digest('hex'),
        integrity: `sha512-${createHash('sha512')
          .update(bytes)
          .digest('base64')}`,
      },
    ],
  };
  try {
    assert.equal(assertCandidateFile(evidence, 'core', file).role, 'core');
    assert.deepEqual(assertJsonNoDrift({ exact: true }, { exact: true }), {
      exact: true,
    });
    writeFileSync(file, 'drift');
    assert.throws(() => assertCandidateFile(evidence, 'core', file));
    assert.throws(() => assertJsonNoDrift({ exact: true }, { exact: false }));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
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
