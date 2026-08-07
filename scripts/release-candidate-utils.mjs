import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { gzipSync, gunzipSync } from 'fflate';

export const workspaceRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);

export function runPnpm(args, options = {}) {
  const pnpmEntry = process.env.npm_execpath;
  const command = pnpmEntry ? process.execPath : 'pnpm';
  const commandArgs = pnpmEntry ? [pnpmEntry, ...args] : args;

  return execFileSync(command, commandArgs, {
    cwd: options.cwd ?? workspaceRoot,
    encoding: 'utf8',
    env: options.env ?? process.env,
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  });
}

function tarballAfterPack(directory, previous) {
  const current = readdirSync(directory)
    .filter((entry) => entry.endsWith('.tgz'))
    .sort();
  const created = current.filter((entry) => !previous.has(entry));
  if (created.length !== 1) {
    throw new Error(
      `Expected one new tarball, received ${created.length}: ${created.join(', ')}`,
    );
  }
  return join(directory, created[0]);
}

export function normalizeTarballGzip(tarball) {
  const tar = gunzipSync(new Uint8Array(readFileSync(tarball)));
  const normalized = gzipSync(tar, { level: 9, mtime: 0 });
  writeFileSync(tarball, normalized);
  return tarball;
}

function packWorkspacePackage(directory, workspacePackage, expectedFile) {
  const before = new Set(readdirSync(directory));
  runPnpm(['pack', '--pack-destination', directory], {
    cwd: join(workspaceRoot, workspacePackage),
  });
  const tarball = tarballAfterPack(directory, before);
  if (expectedFile !== undefined && tarball !== join(directory, expectedFile)) {
    throw new Error(
      `Expected candidate ${expectedFile}, received ${tarball.slice(directory.length + 1)}`,
    );
  }
  return normalizeTarballGzip(tarball);
}

export function packReleaseCandidates(directory, descriptor) {
  return Object.freeze(
    Object.fromEntries(
      descriptor.packages.map(({ role, workspacePath, file }) => [
        role,
        packWorkspacePackage(directory, workspacePath, file),
      ]),
    ),
  );
}

export function packCoreCandidate(directory) {
  return packWorkspacePackage(directory, 'packages/core');
}

export function packAngularCandidate(directory) {
  return packWorkspacePackage(directory, 'packages/angular');
}

export function packReactCandidate(directory) {
  return packWorkspacePackage(directory, 'packages/react');
}

export function packCandidates(directory) {
  const core = packCoreCandidate(directory);
  const angular = packAngularCandidate(directory);

  return Object.freeze({ core, angular });
}

export function listTarball(tarball) {
  return execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' })
    .split(/\r?\n/u)
    .filter(Boolean);
}

export function readTarballText(tarball, member) {
  return execFileSync('tar', ['-xOzf', tarball, member], {
    encoding: 'utf8',
  });
}

export function readTarballJson(tarball, member) {
  return JSON.parse(readTarballText(tarball, member));
}

export function readWorkspacePackage() {
  return JSON.parse(readFileSync(join(workspaceRoot, 'package.json'), 'utf8'));
}
