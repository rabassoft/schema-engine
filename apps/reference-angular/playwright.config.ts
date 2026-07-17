import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4207';

export default defineConfig({
  testDir: './e2e',
  outputDir: '../../test-results/reference-angular',
  fullyParallel: false,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] === undefined ? 0 : 1,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], browserName: 'chromium' },
    },
  ],
  webServer: {
    command:
      'pnpm --filter @schema-engine-internal/reference-angular run dev:e2e',
    url: baseURL,
    reuseExistingServer: process.env['CI'] === undefined,
    timeout: 120_000,
  },
});
