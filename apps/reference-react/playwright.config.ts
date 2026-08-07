// Copyright (C) 2026 Ricardo Rabassó Rodríguez, operating as Rabassoft
// SPDX-License-Identifier: AGPL-3.0-only

import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4214';

export default defineConfig({
  testDir: './e2e',
  outputDir: '../../test-results/reference-react',
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
      'pnpm --filter @schema-engine-internal/reference-react run dev:e2e',
    url: baseURL,
    reuseExistingServer: process.env['CI'] === undefined,
    timeout: 120_000,
  },
});
