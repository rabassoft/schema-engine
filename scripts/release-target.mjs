import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { workspaceRoot } from './release-candidate-utils.mjs';

const VERSION_PATTERN = /^0\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u;
const ANGULAR_22_VERSION_PATTERN = /^22\.(\d+)\.(\d+)$/u;

function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const member of Object.values(value)) deepFreeze(member);
    Object.freeze(value);
  }
  return value;
}

export const M19_RELEASE_DESCRIPTOR = deepFreeze({
  id: 'm19',
  releaseDirectory: '0.3.0',
  distTag: 'next',
  provenance: false,
  consumerModes: ['candidate', 'exact', 'next', 'latest', 'unqualified'],
  consumerTuples: {
    lower: { angular: '22.0.6', aria: '22.0.5', cdk: '22.0.5' },
    latest: { angular: '22.0.7', aria: '22.0.5', cdk: '22.0.5' },
  },
  packages: [
    {
      role: 'core',
      name: '@rabassoft/schema-engine',
      workspacePath: 'packages/core',
      version: '0.3.0',
      file: 'rabassoft-schema-engine-0.3.0.tgz',
      schemaEnginePeers: {},
      schemaEngineDevelopment: {},
    },
    {
      role: 'angular',
      name: '@rabassoft/schema-engine-angular',
      workspacePath: 'packages/angular',
      version: '0.3.0',
      file: 'rabassoft-schema-engine-angular-0.3.0.tgz',
      schemaEnginePeers: { '@rabassoft/schema-engine': '^0.3.0' },
      schemaEngineDevelopment: { '@rabassoft/schema-engine': '0.3.0' },
    },
    {
      role: 'angularAria',
      name: '@rabassoft/schema-engine-angular-aria',
      workspacePath: 'packages/angular-aria',
      version: '0.1.0',
      file: 'rabassoft-schema-engine-angular-aria-0.1.0.tgz',
      schemaEnginePeers: {
        '@rabassoft/schema-engine-angular': '^0.3.0',
      },
      schemaEngineDevelopment: {
        '@rabassoft/schema-engine-angular': '0.3.0',
      },
    },
  ],
});

export const M21_RELEASE_DESCRIPTOR = deepFreeze({
  id: 'm21',
  releaseDirectory: '0.4.0',
  distTag: 'next',
  provenance: false,
  consumerModes: ['candidate', 'exact', 'next', 'latest', 'unqualified'],
  consumerTuples: {
    lower: { angular: '22.0.6', aria: '22.0.5', cdk: '22.0.5' },
    latest: { angular: '22.0.7', aria: '22.0.5', cdk: '22.0.5' },
  },
  latestOrder: ['angularAria', 'angular', 'core'],
  packages: [
    {
      role: 'core',
      name: '@rabassoft/schema-engine',
      workspacePath: 'packages/core',
      version: '0.4.0',
      file: 'rabassoft-schema-engine-0.4.0.tgz',
      schemaEnginePeers: {},
      schemaEngineDevelopment: {},
    },
    {
      role: 'angular',
      name: '@rabassoft/schema-engine-angular',
      workspacePath: 'packages/angular',
      version: '0.4.0',
      file: 'rabassoft-schema-engine-angular-0.4.0.tgz',
      schemaEnginePeers: { '@rabassoft/schema-engine': '^0.4.0' },
      schemaEngineDevelopment: { '@rabassoft/schema-engine': '0.4.0' },
    },
    {
      role: 'angularAria',
      name: '@rabassoft/schema-engine-angular-aria',
      workspacePath: 'packages/angular-aria',
      version: '0.2.0',
      file: 'rabassoft-schema-engine-angular-aria-0.2.0.tgz',
      schemaEnginePeers: {
        '@rabassoft/schema-engine-angular': '^0.4.0',
      },
      schemaEngineDevelopment: {
        '@rabassoft/schema-engine-angular': '0.4.0',
      },
    },
  ],
});

export const RELEASE_DESCRIPTORS = deepFreeze({
  m19: M19_RELEASE_DESCRIPTOR,
  m21: M21_RELEASE_DESCRIPTOR,
});

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

export function assertM19ReleaseDescriptor(descriptor, manifests = undefined) {
  assert.deepEqual(
    descriptor,
    M19_RELEASE_DESCRIPTOR,
    'M19 release descriptor does not match the accepted contract',
  );

  const roles = descriptor.packages.map(({ role }) => role);
  const names = descriptor.packages.map(({ name }) => name);
  const files = descriptor.packages.map(({ file }) => file);
  assert.equal(new Set(roles).size, roles.length, 'Duplicate release role');
  assert.equal(new Set(names).size, names.length, 'Duplicate package name');
  assert.equal(new Set(files).size, files.length, 'Duplicate candidate file');

  if (manifests !== undefined) {
    assert.deepEqual(
      Object.keys(manifests),
      roles,
      'Release manifests do not match publication order',
    );
    for (const packageTarget of descriptor.packages) {
      const manifest = manifests[packageTarget.role];
      assert.ok(manifest, `Missing ${packageTarget.role} manifest`);
      assert.equal(manifest.name, packageTarget.name);
      assert.equal(manifest.version, packageTarget.version);
      assert.equal(manifest.publishConfig?.access, 'public');
      assert.equal(manifest.publishConfig?.tag, descriptor.distTag);
      assert.equal(manifest.publishConfig?.provenance, descriptor.provenance);
    }
  }

  return descriptor;
}

export function assertM21ReleaseDescriptor(descriptor, manifests = undefined) {
  assert.deepEqual(
    descriptor,
    M21_RELEASE_DESCRIPTOR,
    'M21 release descriptor does not match the accepted contract',
  );

  const roles = descriptor.packages.map(({ role }) => role);
  const names = descriptor.packages.map(({ name }) => name);
  const files = descriptor.packages.map(({ file }) => file);
  assert.deepEqual(roles, ['core', 'angular', 'angularAria']);
  assert.deepEqual(descriptor.latestOrder, ['angularAria', 'angular', 'core']);
  assert.equal(new Set(roles).size, roles.length, 'Duplicate release role');
  assert.equal(new Set(names).size, names.length, 'Duplicate package name');
  assert.equal(new Set(files).size, files.length, 'Duplicate candidate file');

  if (manifests !== undefined) {
    assert.deepEqual(
      Object.keys(manifests),
      roles,
      'Release manifests do not match publication order',
    );
    for (const packageTarget of descriptor.packages) {
      const manifest = manifests[packageTarget.role];
      assert.ok(manifest, `Missing ${packageTarget.role} manifest`);
      assert.equal(manifest.name, packageTarget.name);
      assert.equal(manifest.version, packageTarget.version);
      assert.equal(manifest.publishConfig?.access, 'public');
      assert.equal(manifest.publishConfig?.tag, descriptor.distTag);
      assert.equal(manifest.publishConfig?.provenance, descriptor.provenance);
      const expectedPeerNames = Object.keys(packageTarget.schemaEnginePeers);
      const actualPeerNames = Object.keys(
        manifest.peerDependencies ?? {},
      ).filter((name) => name.startsWith('@rabassoft/schema-engine'));
      assert.deepEqual(actualPeerNames, expectedPeerNames);
      for (const name of expectedPeerNames) {
        assert.equal(
          manifest.peerDependencies?.[name],
          'workspace:^',
          `${packageTarget.role} must retain a workspace:^ source peer`,
        );
      }
      const expectedDevelopmentNames = Object.keys(
        packageTarget.schemaEngineDevelopment,
      );
      const actualDevelopmentNames = Object.keys(
        manifest.devDependencies ?? {},
      ).filter((name) => name.startsWith('@rabassoft/schema-engine'));
      assert.deepEqual(actualDevelopmentNames, expectedDevelopmentNames);
      for (const name of expectedDevelopmentNames) {
        assert.equal(
          manifest.devDependencies?.[name],
          'workspace:*',
          `${packageTarget.role} must retain a workspace:* development link`,
        );
      }
    }
  }

  return descriptor;
}

export function assertReleaseDescriptor(descriptor, manifests = undefined) {
  if (descriptor.id === M19_RELEASE_DESCRIPTOR.id) {
    return assertM19ReleaseDescriptor(descriptor, manifests);
  }
  if (descriptor.id === M21_RELEASE_DESCRIPTOR.id) {
    return assertM21ReleaseDescriptor(descriptor, manifests);
  }
  assert.fail(`Unsupported release descriptor ${descriptor.id}`);
}

export function assertM19CandidateEvidence(evidence, descriptor) {
  return assertReleaseCandidateEvidence(evidence, descriptor);
}

export function assertReleaseCandidateEvidence(evidence, descriptor) {
  assertReleaseDescriptor(descriptor);
  assert.deepEqual(Object.keys(evidence), [
    'release',
    'releaseDirectory',
    'node',
    'npm',
    'pnpm',
    'baseCommit',
    'sourceCommit',
    'distTag',
    'provenance',
    'neutralDryRun',
    'candidates',
  ]);
  assert.equal(evidence.release, descriptor.id);
  assert.equal(evidence.releaseDirectory, descriptor.releaseDirectory);
  assert.equal(evidence.distTag, descriptor.distTag);
  assert.equal(evidence.provenance, descriptor.provenance);
  assert.equal(evidence.neutralDryRun, true);
  assert.match(evidence.node, /^22\.\d+\.\d+$/u);
  assert.match(evidence.npm, /^10\.\d+\.\d+$/u);
  assert.equal(evidence.pnpm, '10.28.2');
  assert.match(evidence.baseCommit, /^[0-9a-f]{40}$/u);
  assert.ok(
    evidence.sourceCommit === null ||
      evidence.sourceCommit === evidence.baseCommit,
    'Source commit must be null or the exact base commit',
  );
  assert.deepEqual(
    evidence.candidates.map(({ role, name, version, file }) => ({
      role,
      name,
      version,
      file,
    })),
    descriptor.packages.map(({ role, name, version, file }) => ({
      role,
      name,
      version,
      file,
    })),
    `Candidate evidence does not match the ${descriptor.id} descriptor`,
  );
  for (const candidate of evidence.candidates) {
    assert.deepEqual(Object.keys(candidate), [
      'role',
      'name',
      'version',
      'file',
      'bytes',
      'sha512',
      'integrity',
    ]);
    assert.ok(Number.isSafeInteger(candidate.bytes) && candidate.bytes > 0);
    assert.match(candidate.sha512, /^[0-9a-f]{128}$/u);
    assert.match(candidate.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/u);
  }
  return evidence;
}

export function m19PackageSpecifier(
  descriptor,
  role,
  mode,
  candidateFiles = undefined,
) {
  assertM19ReleaseDescriptor(descriptor);
  return releasePackageSpecifier(descriptor, role, mode, candidateFiles);
}

export function releasePackageSpecifier(
  descriptor,
  role,
  mode,
  candidateFiles = undefined,
) {
  assertReleaseDescriptor(descriptor);
  assert.ok(
    descriptor.consumerModes.includes(mode),
    `Unsupported ${descriptor.id} mode`,
  );
  const packageTarget = descriptor.packages.find(
    (candidate) => candidate.role === role,
  );
  assert.ok(packageTarget, `Unknown release role ${role}`);
  if (mode === 'candidate') {
    const candidate = candidateFiles?.[role];
    assert.ok(candidate, `Missing ${role} candidate file`);
    return `file:${candidate}`;
  }
  if (mode === 'exact') return packageTarget.version;
  if (mode === 'unqualified') return '*';
  return mode;
}

export function m19FrozenConsumerTuple(descriptor, mode, tupleSource) {
  assertM19ReleaseDescriptor(descriptor);
  return releaseFrozenConsumerTuple(descriptor, mode, tupleSource);
}

export function releaseFrozenConsumerTuple(descriptor, mode, tupleSource) {
  assertReleaseDescriptor(descriptor);
  assert.ok(['lower', 'latest'].includes(mode), 'Unsupported consumer tuple');
  assert.ok(
    ['frozen', 'registry'].includes(tupleSource),
    'Pass exactly --tuple-source=frozen or --tuple-source=registry',
  );
  if (mode === 'lower') {
    assert.equal(
      tupleSource,
      'frozen',
      'The lower consumer tuple is always frozen',
    );
  }
  return tupleSource === 'frozen' ? descriptor.consumerTuples[mode] : undefined;
}

export function highestCommonAngular22Version(manifests, minimum) {
  const parsedMinimum = ANGULAR_22_VERSION_PATTERN.exec(minimum);
  assert.ok(parsedMinimum, 'Invalid minimum Angular 22 version');
  const minimumTuple = [Number(parsedMinimum[1]), Number(parsedMinimum[2])];
  const entries = Object.entries(manifests);
  assert.ok(entries.length > 0, 'Angular package metadata is required');

  const candidates = Object.keys(entries[0][1].versions ?? {})
    .flatMap((version) => {
      const parsed = ANGULAR_22_VERSION_PATTERN.exec(version);
      return parsed
        ? [{ version, tuple: [Number(parsed[1]), Number(parsed[2])] }]
        : [];
    })
    .filter(
      ({ tuple }) =>
        tuple[0] > minimumTuple[0] ||
        (tuple[0] === minimumTuple[0] && tuple[1] >= minimumTuple[1]),
    )
    .sort(
      (left, right) =>
        right.tuple[0] - left.tuple[0] || right.tuple[1] - left.tuple[1],
    );

  const selected = candidates.find(({ version }) =>
    entries.every(([, manifest]) => {
      const candidate = manifest.versions?.[version];
      return candidate !== undefined && candidate.deprecated === undefined;
    }),
  );
  assert.ok(selected, 'No coherent non-deprecated Angular 22 tuple');
  return selected.version;
}

export function loadM19ReleaseTarget(args = process.argv.slice(2)) {
  assert.equal(
    argumentValue(args, 'release'),
    M19_RELEASE_DESCRIPTOR.id,
    'Pass exactly --release=m19',
  );
  const manifests = Object.fromEntries(
    M19_RELEASE_DESCRIPTOR.packages.map(({ role, workspacePath }) => [
      role,
      JSON.parse(
        readFileSync(
          join(workspaceRoot, workspacePath, 'package.json'),
          'utf8',
        ),
      ),
    ]),
  );
  assertM19ReleaseDescriptor(M19_RELEASE_DESCRIPTOR, manifests);
  return Object.freeze({
    descriptor: M19_RELEASE_DESCRIPTOR,
    manifests: Object.freeze(manifests),
  });
}

export function loadCoordinatedReleaseTarget(args = process.argv.slice(2)) {
  const release = argumentValue(args, 'release');
  const descriptor = RELEASE_DESCRIPTORS[release];
  assert.ok(descriptor, 'Pass exactly --release=m19 or --release=m21');
  const manifests = Object.fromEntries(
    descriptor.packages.map(({ role, workspacePath }) => [
      role,
      JSON.parse(
        readFileSync(
          join(workspaceRoot, workspacePath, 'package.json'),
          'utf8',
        ),
      ),
    ]),
  );
  assertReleaseDescriptor(descriptor, manifests);
  return Object.freeze({
    descriptor,
    manifests: Object.freeze(manifests),
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
