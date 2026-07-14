import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

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

export function packCandidates(directory) {
  const coreBefore = new Set(readdirSync(directory));
  runPnpm(['pack', '--pack-destination', directory], {
    cwd: join(workspaceRoot, 'packages/core'),
  });
  const core = tarballAfterPack(directory, coreBefore);

  const angularBefore = new Set(readdirSync(directory));
  runPnpm(['pack', '--pack-destination', directory], {
    cwd: join(workspaceRoot, 'packages/angular'),
  });
  const angular = tarballAfterPack(directory, angularBefore);

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
