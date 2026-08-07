import assert from 'node:assert/strict';
import { join } from 'node:path';
import { runPnpm, workspaceRoot } from './release-candidate-utils.mjs';
import { argumentValue } from './release-target.mjs';

const config = argumentValue(process.argv.slice(2), 'config');
const allowedConfigs = new Set([
  'apps/reference-angular/playwright.config.ts',
  'apps/reference-react/playwright.config.ts',
  'apps/reference-standard/playwright.config.ts',
]);
assert.ok(
  allowedConfigs.has(config),
  'Unsupported reference Playwright config',
);

runPnpm(['exec', 'playwright', 'test', '--config', config], {
  env: {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: join(workspaceRoot, '.playwright-browsers'),
  },
  stdio: 'inherit',
});
